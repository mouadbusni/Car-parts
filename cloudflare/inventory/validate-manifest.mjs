import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MEDIA_PATH=/^\/media\/products\/(?:[a-z0-9][a-z0-9_-]{0,79}\/){0,2}[a-z0-9][a-z0-9_-]{0,79}\.(?:webp|jpe?g|png)$/;
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SIZE=6*1024*1024;
const usableText=x=>typeof x==='string'&&x.trim().length>0;
const plainRecord=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function imageType(file,bytes){
  if(file.endsWith('.webp'))return bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
  if(file.endsWith('.png'))return bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'));
  if(/\.jpe?g$/.test(file))return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  return false;
}
// Preflight validates shape, local asset existence/signature and declared
// photo provenance. It CANNOT independently establish ownership, provenance,
// item identity, fitment or legal permission. A human must review those.
export async function validateManifest(manifest,mediaRoot){
  const errors=[];
  const fail=msg=>errors.push(msg);
  if(!plainRecord(manifest))return {errors:['Manifest must be a JSON object.'],summary:null};
  if(manifest.schemaVersion!==1)fail('schemaVersion must equal 1.');
  const categories=Array.isArray(manifest.categories)?manifest.categories:[];
  const products=Array.isArray(manifest.products)?manifest.products:[];
  if(!categories.length)fail('At least one real category is required.');
  if(!products.length)fail('At least one real product is required. No sample inventory will be generated.');
  const ids=new Set(),slugs=new Set(),skus=new Set(),catIds=new Set();
  for(const [i,category] of categories.entries()){
    if(!plainRecord(category)){fail('categories['+i+'] must be an object.');continue;}
    if(!usableText(category.name))fail('categories['+i+'].name required.');
    if(!SLUG.test(category.slug||''))fail('categories['+i+'].slug invalid.');
    if(!SLUG.test(category.id||''))fail('categories['+i+'].id invalid.');
    if(catIds.has(category.id))fail('Duplicate category id: '+category.id);
    catIds.add(category.id);
  }
  const root=resolve(mediaRoot||'.');
  let validatedImages=0;
  for(const [i,p] of products.entries()){
    const ctx='products['+i+']';
    if(!plainRecord(p)){fail(ctx+' must be an object.');continue;}
    if(!SLUG.test(p.id||''))fail(ctx+'.id invalid.');
    if(!SLUG.test(p.slug||''))fail(ctx+'.slug invalid.');
    if(!usableText(p.sku)||p.sku.length>120)fail(ctx+'.sku required (max 120 characters).');
    if(!usableText(p.name)||p.name.length>220)fail(ctx+'.name required (max 220 characters).');
    if(!catIds.has(p.category_id))fail(ctx+'.category_id not in manifest categories.');
    if(typeof p.price!=='number'||!Number.isFinite(p.price)||p.price<0||p.price>=100000000)fail(ctx+'.price invalid.');
    if(!Number.isInteger(p.stock_quantity)||p.stock_quantity<0)fail(ctx+'.stock_quantity must be a nonnegative integer.');
    if(p.specifications!==undefined&&!plainRecord(p.specifications))fail(ctx+'.specifications must be a plain object.');
    if(p.compatibility!==undefined&&!Array.isArray(p.compatibility))fail(ctx+'.compatibility must be an array.');
    if(ids.has(p.id))fail('Duplicate product id: '+p.id);
    if(slugs.has(p.slug))fail('Duplicate product slug: '+p.slug);
    if(skus.has(p.sku))fail('Duplicate product SKU: '+p.sku);
    ids.add(p.id);slugs.add(p.slug);skus.add(p.sku);
    const gallery=Array.isArray(p.gallery)?p.gallery:[];
    if(p.gallery!==undefined&&!Array.isArray(p.gallery))fail(ctx+'.gallery must be an array.');
    if(gallery.length>5)fail(ctx+'.gallery can have at most five secondary images.');
    const images=[p.image_url,...gallery];
    if(new Set(images).size!==images.length)fail(ctx+' has duplicate product photos.');
    const evidence=Array.isArray(p.photoEvidence)?p.photoEvidence:[];
    for(const path of images){
      if(!MEDIA_PATH.test(path||'')){fail(ctx+' invalid product photo path: '+String(path));continue;}
      const proof=evidence.find(x=>x&&x.path===path);
      if(!proof||!usableText(proof.rightsHolder)||!usableText(proof.permissionReference)||proof.exactItemConfirmed!==true){
        fail(ctx+' missing provenance or exact-item confirmation: '+path);
      }
      const relative=path.slice('/media/products/'.length);
      const onDisk=resolve(root,relative);
      if(!onDisk.startsWith(root+sep)){fail(ctx+' asset escapes media root: '+path);continue;}
      try{
        const meta=await stat(onDisk);
        if(!meta.isFile()||meta.size<1024||meta.size>MAX_SIZE)throw Error('Invalid file size or type');
        const bytes=await readFile(onDisk);
        if(!imageType(relative,bytes))throw Error('Invalid image signature');
        validatedImages++;
      }catch{
        fail(ctx+' product image is missing, malformed or outside size limits: '+relative);
      }
    }
  }
  return {errors,summary:{categories:categories.length,products:products.length,images:validatedImages}};
}
async function cli(){
  const args=process.argv.slice(2);
  if(args.length!==2){
    console.error('Usage: node cloudflare/inventory/validate-manifest.mjs <manifest.json> <local-media-directory>');
    process.exitCode=2;return;
  }
  try{
    const manifest=JSON.parse(await readFile(resolve(args[0]),'utf8'));
    const result=await validateManifest(manifest,args[1]);
    if(result.summary)console.log('Preflight:',JSON.stringify(result.summary));
    if(result.errors.length){
      for(const message of result.errors)console.error('ERROR:',message);
      process.exitCode=1;
    }else{
      console.log('Structure and local file signatures verified. Human rights, accuracy and fitment review still required. No data was uploaded or written.');
    }
  }catch(error){
    console.error('Manifest preflight failed:',error.message);
    process.exitCode=1;
  }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await cli();
