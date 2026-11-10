import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Isolated local QA server only. Mirrors the Worker route surface and simulates
// the known empty staging catalog; it NEVER represents live inventory.
const root=resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const port=Number(process.env.PORT||4173);
const files=new Map([
  ['/site.css',['cloudflare/cinematic/site.css','text/css; charset=utf-8']],
  ['/app.js',['cloudflare/preview-site/app.js','text/javascript; charset=utf-8']],
  ...['hero','brakes','wheels','lighting','drive'].map(name=>[
    '/media/'+name+'.webp',['cloudflare/cinematic/assets/'+name+'.webp','image/webp']
  ])
]);
const allowed=new Set(['/','/home','/catalog','/products','/categories','/cart','/about']);
const productPath=/^\/product\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/;
const headers={
  'X-Content-Type-Options':'nosniff',
  'Cache-Control':'no-store'
};
function send(res,status,type,body,head=false){
  res.writeHead(status,{...headers,'Content-Type':type});
  res.end(head?undefined:body);
}
const server=createServer(async(req,res)=>{
  try{
    const path=new URL(req.url||'/', 'http://localhost').pathname;
    const head=req.method==='HEAD';
    if(!['GET','HEAD'].includes(req.method||'')){
      send(res,405,'text/plain; charset=utf-8','Method not allowed');
      return;
    }
    if(path==='/api/health'){
      send(res,200,'application/json',JSON.stringify({service:'autopro-catalog',status:'ok',mode:'local-qa'}),head);
      return;
    }
    if(path==='/api/categories'||path==='/api/products'){
      send(res,200,'application/json',JSON.stringify({data:[]}),head);
      return;
    }
    if(path.startsWith('/api/')){
      send(res,404,'text/plain; charset=utf-8','Not found',head);
      return;
    }
    const source=files.get(path);
    if(source){
      send(res,200,source[1],await readFile(resolve(root,source[0])),head);
      return;
    }
    if(allowed.has(path.replace(/\/+$/,'')||'/')||productPath.test(path)){
      send(res,200,'text/html; charset=utf-8',await readFile(resolve(root,'cloudflare/preview-site/index.html')),head);
      return;
    }
    send(res,404,'text/plain; charset=utf-8','Not found',head);
  }catch(err){
    console.error(err);
    send(res,500,'text/plain; charset=utf-8','Local test server error');
  }
});
server.listen(port,'127.0.0.1',()=>console.log('AutoPro local QA server http://127.0.0.1:'+port));
