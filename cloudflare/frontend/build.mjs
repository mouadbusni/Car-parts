import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
let built=await readFile(resolve(root,'cloudflare/frontend/worker.mjs'),'utf8');
const files={
  AUTOPRO_HTML:'cloudflare/carstore-v8/index.html',
  AUTOPRO_CSS:'cloudflare/carstore-v8/site.css',
  AUTOPRO_JS:'cloudflare/carstore-v8/app.js',
  MEDIA_HERO:'cloudflare/cinematic/assets/hero.webp',
  MEDIA_BRAKES:'cloudflare/cinematic/assets/brakes.webp',
  MEDIA_WHEELS:'cloudflare/cinematic/assets/wheels.webp',
  MEDIA_LIGHTING:'cloudflare/cinematic/assets/lighting.webp',
  MEDIA_DRIVE:'cloudflare/cinematic/assets/drive.webp'
};
for(const [key,path] of Object.entries(files)){
  const bytes=await readFile(resolve(root,path));
  if(key.startsWith('MEDIA_')){
    if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'){
      throw new Error('Not a valid local WebP: '+path);
    }
  }
  const placeholder='__'+key+'__';
  if(built.split(placeholder).length!==2){
    throw new Error('Expected exactly one placeholder: '+placeholder);
  }
  const data=key.startsWith('MEDIA_')?bytes.toString('base64'):bytes.toString('utf8');
  // Replacement callback preserves source code including special dollar tokens.
  built=built.replace(placeholder,()=>JSON.stringify(data));
}
if(/__(?:AUTOPRO|MEDIA)_/.test(built)){
  throw new Error('Unbundled Worker placeholder');
}
const dest=resolve(root,'cloudflare/frontend/dist/worker.mjs');
await mkdir(dirname(dest),{recursive:true});
await writeFile(dest,built);
console.log('AutoPro Worker built',built.length,'bytes',
  createHash('sha256').update(built).digest('hex'));
