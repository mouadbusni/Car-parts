import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateManifest } from '../validate-manifest.mjs';

const path='/media/products/brakes/qa-rotor-front.webp';
const manifest=()=>({
  schemaVersion:1,
  categories:[{id:'brakes',slug:'brakes',name:'Brakes'}],
  products:[{
    id:'qa-rotor',slug:'qa-rotor',sku:'QA-ROTOR-01',name:'QA Rotor - Test Data',
    category_id:'brakes',price:10,stock_quantity:0,image_url:path,gallery:[],
    photoEvidence:[{path,rightsHolder:'Test fixture',permissionReference:'Local QA only',exactItemConfirmed:true}]
  }]
});
async function withMedia(fn){
  const dir=await mkdtemp(join(tmpdir(),'autopro-media-'));
  try{
    await mkdir(join(dir,'brakes'));
    const fake=Buffer.alloc(2048);fake.write('RIFF',0);fake.write('WEBP',8);
    await writeFile(join(dir,'brakes','qa-rotor-front.webp'),fake);
    await fn(dir);
  }finally{await rm(dir,{recursive:true,force:true});}
}
test('accepts a structurally valid local-only QA manifest',async()=>{
  await withMedia(async dir=>{
    const result=await validateManifest(manifest(),dir);
    assert.deepEqual(result.errors,[]);
    assert.equal(result.summary.images,1);
  });
});
test('rejects unknown categories, duplicate SKU and duplicate photo usage',async()=>{
  await withMedia(async dir=>{
    const data=manifest();
    data.products.push({...data.products[0],id:'qa-rotor-2',slug:'qa-rotor-2',category_id:'missing',gallery:[path]});
    const result=await validateManifest(data,dir);
    assert(result.errors.some(x=>x.includes('category_id not in')));
    assert(result.errors.some(x=>x.includes('Duplicate product SKU')));
    assert(result.errors.some(x=>x.includes('duplicate product photos')));
  });
});
test('rejects external imagery and missing evidence',async()=>{
  await withMedia(async dir=>{
    const data=manifest();
    data.products[0].image_url='https://example.com/random.jpg';
    const result=await validateManifest(data,dir);
    assert(result.errors.some(x=>x.includes('invalid product photo path')));
    const missing=manifest();
    missing.products[0].photoEvidence=[];
    assert((await validateManifest(missing,dir)).errors.some(x=>x.includes('missing provenance')));
  });
});
test('rejects incomplete inventory and missing photo assets',async()=>{
  await withMedia(async dir=>{
    const empty=manifest();empty.products=[];
    assert((await validateManifest(empty,dir)).errors.some(x=>x.includes('At least one real product')));
    const data=manifest();data.products[0].image_url='/media/products/brakes/missing.webp';
    data.products[0].photoEvidence=[{path:data.products[0].image_url,rightsHolder:'a',permissionReference:'b',exactItemConfirmed:true}];
    assert((await validateManifest(data,dir)).errors.some(x=>x.includes('missing, malformed')));
  });
});
