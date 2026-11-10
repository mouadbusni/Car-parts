import test from 'node:test';
import assert from 'node:assert/strict';

const {default:worker}=await import('../dist/worker.mjs');
const origin='https://autopro-concept-v7.example';
const call=(path,method='GET')=>worker.fetch(new Request(origin+path,{method}),{},{});

test('serves standalone page and local assets',async()=>{
  const html=await call('/');
  assert.equal(html.status,200);
  assert.match(await html.text(),/AutoPro/);
  const css=await call('/site.css');
  assert.equal(css.status,200);
  assert.match(css.headers.get('content-type'),/text\/css/);
  const js=await call('/app.js');
  assert.equal(js.status,200);
  assert.match(await js.text(),/autopro-carstore-v8/);
});
test('all five editorial WebPs have nonempty valid signatures',async()=>{
  for(const name of ['hero','brakes','wheels','lighting','drive']){
    const response=await call('/media/'+name+'.webp');
    assert.equal(response.status,200,name);
    assert.equal(response.headers.get('content-type'),'image/webp');
    const body=new Uint8Array(await response.arrayBuffer());
    assert(body.length>25000,name);
    assert.equal(String.fromCharCode(...body.subarray(0,4)),'RIFF');
    assert.equal(String.fromCharCode(...body.subarray(8,12)),'WEBP');
  }
});
test('no backend or user write endpoint is exposed',async()=>{
  for(const path of ['/api/health','/api/products','/api/admin','/admin','/login','/checkout']){
    assert.equal((await call(path)).status,404,path);
  }
  for(const method of ['POST','PUT','DELETE']){
    assert.equal((await call('/api/products',method)).status,405);
  }
});
test('all public static resources support HEAD',async()=>{
  for(const path of ['/','/catalog','/site.css','/app.js','/media/hero.webp']){
    const response=await call(path,'HEAD');
    assert.equal(response.status,200,path);
    assert.equal((await response.arrayBuffer()).byteLength,0);
  }
});
test('strict browser protections and no payments are declared',async()=>{
  const response=await call('/');
  assert.match(response.headers.get('content-security-policy')||'',/img-src 'self'/);
  assert.match(response.headers.get('permissions-policy')||'',/payment=\(\)/);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
});
