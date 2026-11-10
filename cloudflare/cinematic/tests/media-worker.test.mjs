import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const folder=dirname(fileURLToPath(import.meta.url));
const raw=await readFile(resolve(folder,'../worker.mjs'),'utf8');
// The build normally injects local HTML/CSS/JS and imports the read-only API.
// This unit test stubs those ONLY to isolate the actual media routing code.
let workerSource=raw.replace("import catalog from './catalog.mjs';","const catalog={fetch:()=>new Response('API mock')};");
for(const name of ['AUTOPRO_HTML','AUTOPRO_CSS','AUTOPRO_JS','MEDIA_HERO','MEDIA_BRAKES','MEDIA_WHEELS','MEDIA_LIGHTING','MEDIA_DRIVE']){
  workerSource=workerSource.replaceAll('__'+name+'__',JSON.stringify(name==='AUTOPRO_HTML'?'<html>Test</html>':''));
}
const moduleUrl='data:text/javascript;base64,'+Buffer.from(workerSource).toString('base64');
const {default:worker}=await import(moduleUrl);

const content=new Uint8Array([82,73,70,70,32,0,0,0,87,69,66,80,86,80,56,32]);
const env={
  PRODUCT_MEDIA:{
    async get(key){
      if(key!=='media/products/brakes/rotor-front.webp')return null;
      return {size:content.length,body:new ReadableStream({start(controller){controller.enqueue(content);controller.close();}})};
    },
    async head(key){
      if(key!=='media/products/brakes/rotor-front.webp')return null;
      return {size:content.length};
    },
  },
};
const base='https://autopro-review.example';

test('serves a product photo from an explicitly bound media store',async()=>{
  const response=await worker.fetch(new Request(base+'/media/products/brakes/rotor-front.webp'),env,{});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('Content-Type'),'image/webp');
  assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()),content);
});
test('supports HEAD without streaming the media body',async()=>{
  const response=await worker.fetch(new Request(base+'/media/products/brakes/rotor-front.webp',{method:'HEAD'}),env,{});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('Content-Length'),String(content.length));
  assert.equal((await response.arrayBuffer()).byteLength,0);
});
test('never uses editorial pictures as fallback when product media store is absent',async()=>{
  const response=await worker.fetch(new Request(base+'/media/products/brakes/rotor-front.webp'),{},{});
  assert.equal(response.status,404);
});
test('rejects paths outside the exact product media allowlist',async()=>{
  for(const path of [
    '/media/products/../hero.webp',
    '/media/products/.hidden.webp',
    '/media/products/brakes/rotor.svg',
    '/media/products/brakes/ROTOR.webp',
    '/media/products/brakes/rotor.webp/extra',
    '/media/products/brakes/rotor.webp%00',
  ]){
    const response=await worker.fetch(new Request(base+path),env,{});
    assert.equal(response.status,404,path);
  }
});
test('returns 404 for missing objects, never fabricated media',async()=>{
  const response=await worker.fetch(new Request(base+'/media/products/brakes/nonexistent.webp'),env,{});
  assert.equal(response.status,404);
});
test('blocks public writes to the image namespace',async()=>{
  const response=await worker.fetch(new Request(base+'/media/products/brakes/rotor-front.webp',{method:'POST'}),env,{});
  assert.equal(response.status,405);
});
test('rejects oversize media',async()=>{
  const large={PRODUCT_MEDIA:{get:async()=>({size:7*1024*1024,body:new ReadableStream()})}};
  const response=await worker.fetch(new Request(base+'/media/products/brakes/rotor-front.webp'),large,{});
  assert.equal(response.status,404);
});
test('handles storage errors without leaking internals',async()=>{
  const broken={PRODUCT_MEDIA:{get:async()=>{throw Error('internal storage credentials');}}};
  const response=await worker.fetch(new Request(base+'/media/products/brakes/rotor-front.webp'),broken,{});
  assert.equal(response.status,503);
  assert.doesNotMatch(await response.text(),/credentials/);
});
