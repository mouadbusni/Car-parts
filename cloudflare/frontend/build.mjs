import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const source=await readFile(resolve(root,'cloudflare/frontend/worker.mjs'),'utf8');
let built=source;
const files={
  AUTOPRO_HTML:'cloudflare/preview-site/index.html',
  AUTOPRO_CSS:'cloudflare/cinematic/site.css',
  AUTOPRO_JS:'cloudflare/preview-site/app.js',
  MEDIA_HERO:'cloudflare/cinematic/assets/hero.webp',
  MEDIA_BRAKES:'cloudflare/cinematic/assets/brakes.webp',
  MEDIA_WHEELS:'cloudflare/cinematic/assets/wheels.webp',
  MEDIA_LIGHTING:'cloudflare/cinematic/assets/lighting.webp',
  MEDIA_DRIVE:'cloudflare/cinematic/assets/drive.webp'
};
for(const [key,path] of Object.entries(files)){
  const file=await readFile(resolve(root,path));
  if(key.startsWith('MEDIA_')){
    if(file.toString('ascii',0,4)!=='RIFF'||file.toString('ascii',8,12)!=='WEBP')
      throw new Error('Bad WebP asset: '+path);
  }
  const target='__'+key+'__';
  if(built.split(target).length!==2)throw new Error('Expected one placeholder '+target);
  const contents=key.startsWith('MEDIA_')?file.toString('base64'):file.toString('utf8');
  built=built.replace(target,JSON.stringify(contents));
}
if(/__(?:AUTOPRO|MEDIA)_/.test(built))throw new Error('Unbundled placeholder in Worker');
const destination=resolve(root,'cloudflare/frontend/dist/worker.mjs');
await mkdir(dirname(destination),{recursive:true});
await writeFile(destination,built);
console.log('AutoPro frontend Worker built:',built.length,'bytes',createHash('sha256').update(built).digest('hex'));
