import test from 'node:test';
import assert from 'node:assert/strict';
import { handleCatalogRequest } from '../cloudflare/catalog-worker/index.mjs';

function request(path, method='GET', extra={}) {
  return new Request('https://autopro-catalog-staging.example'+path, {method, ...extra});
}

function env(rows=[]) {
  const traces=[];
  const database={
    prepare(sql) {
      const call={sql,params:[]};
      traces.push(call);
      return {
        bind(...params) {call.params=params;return this;},
        async all(){return {results:rows};},
        async first(){return sql.includes('SELECT 1 AS ok')?{ok:1}:rows[0]||null;},
      };
    },
  };
  return {value:{DB:database,PUBLIC_ORIGINS:'http://localhost:3000,https://autopro.example'},traces};
}

const fakeProduct={
  id:'p-1',category_id:'c-1',slug:'brake-rotor',name:'Brake Rotor',
  description:'Preview part',price:95.5,compare_price:null,image_url:'',
  gallery:'["https://example.com/rotor.jpg"]',specifications:'{"type":"vented"}',
  compatibility:'["vehicle-1"]',stock_quantity:3,sku:'PREVIEW-ROT',brand:'Preview',
  rating:4.1,reviews_count:10,is_featured:1,created_at:'2026-01-01',
  updated_at:'2026-01-01',
};

test('public health check needs configured D1 and has safe content type', async()=>{
  const e=env();
  const response=await handleCatalogRequest(request('/api/health'),e.value);
  assert.equal(response.status,200);
  assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
  assert.deepEqual((await response.json()).ok,true);
  assert.ok(e.traces[0].sql.includes('SELECT 1'));
});

test('catalog returns parsed arrays and boolean, has bounded pagination', async()=>{
  const e=env([fakeProduct]);
  const result=await handleCatalogRequest(request('/api/products?sort=featured&limit=24'),e.value);
  assert.equal(result.status,200);
  const payload=await result.json();
  assert.equal(payload.data[0].is_featured,true);
  assert.deepEqual(payload.data[0].gallery,['https://example.com/rotor.jpg']);
  assert.deepEqual(payload.data[0].specifications,{type:'vented'});
  assert.deepEqual(payload.pagination,{limit:24,offset:0,hasMore:false});
  assert.deepEqual(e.traces[0].params,[25,0]);
});

test('search is parameterized and literal % _ and backslashes are escaped',async()=>{
  const e=env([]);
  const query='60%_\\';
  const response=await handleCatalogRequest(request('/api/products?search='+encodeURIComponent(query)),e.value);
  assert.equal(response.status,200);
  assert.ok(e.traces[0].sql.includes('name LIKE ?'));
  assert.ok(!e.traces[0].sql.includes(query));
  assert.ok(e.traces[0].params[0].startsWith('%60\\%\\_'));
});

test('overlong query, bad slug, invalid sort, too large page are rejected',async()=>{
  for(const path of [
    '/api/products?search='+encodeURIComponent('a'.repeat(90)),
    '/api/products?sort=DROP%20TABLE%20products',
    '/api/products?limit=999',
    '/api/products?limit=-1',
    '/api/products?id=good&category=bad%20SQL',
    '/api/products/not%20a%20slug',
    '/api/categories/../../bad',
  ]){
    const e=env();
    const result=await handleCatalogRequest(request(path),e.value);
    assert.ok([400,404].includes(result.status),path+' should be rejected');
  }
});

test('only GET/HEAD are permitted; no public catalog writes',async()=>{
  for(const method of ['POST','PUT','PATCH','DELETE']){
    const result=await handleCatalogRequest(request('/api/products',method),env().value);
    assert.equal(result.status,405,method);
    assert.match((await result.json()).error,/read-only/);
  }
});

test('single-product slug is bound and not interpolated into SQL',async()=>{
  const e=env([fakeProduct]);
  const r=await handleCatalogRequest(request('/api/products/brake-rotor'),e.value);
  assert.equal(r.status,200);
  assert.equal((await r.json()).data.name,'Brake Rotor');
  assert.ok(e.traces[0].sql.includes('slug = ?'));
  assert.deepEqual(e.traces[0].params,['brake-rotor']);
});

test('CORS preflight only allows explicitly configured origins',async()=>{
  const good=await handleCatalogRequest(request('/api/products','OPTIONS',{headers:{Origin:'http://localhost:3000'}}),env().value);
  assert.equal(good.status,204);
  assert.equal(good.headers.get('Access-Control-Allow-Origin'),'http://localhost:3000');
  const bad=await handleCatalogRequest(request('/api/products','OPTIONS',{headers:{Origin:'https://evil.example'}}),env().value);
  assert.equal(bad.status,403);
  assert.equal(bad.headers.get('Access-Control-Allow-Origin'),null);
});

test('unavailable D1 returns 503 without leaking internals',async()=>{
  const r=await handleCatalogRequest(request('/api/products'),{});
  assert.equal(r.status,503);
  assert.match((await r.json()).error,/not configured/);
});

test('HEAD responses have no body',async()=>{
  const e=env([]);
  const r=await handleCatalogRequest(request('/api/products','HEAD'),e.value);
  assert.equal(r.status,200);
  assert.equal(await r.text(),'');
});
