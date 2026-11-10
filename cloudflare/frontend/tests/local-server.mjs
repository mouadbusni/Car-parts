import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const port=Number(process.env.PORT||4177);
const files=new Map([
 ['/site.css',['cloudflare/carstore-v8/site.css','text/css; charset=utf-8']],
 ['/app.js',['cloudflare/carstore-v8/app.js','text/javascript; charset=utf-8']],
 ...['hero','brakes','wheels','lighting','drive'].map(name=>[
   '/media/'+name+'.webp',['cloudflare/cinematic/assets/'+name+'.webp','image/webp']
 ])
]);
const routes=new Set(['/','/home','/catalog','/products','/categories','/cart','/about']);
const productRoute=/^\/product\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/;
createServer(async(req,res)=>{
  const path=new URL(req.url||'/', 'http://localhost').pathname;
  if(!['GET','HEAD'].includes(req.method)){
    res.writeHead(405);return res.end();
  }
  if(path.startsWith('/api/')){
    res.writeHead(404);return res.end('No backend in this frontend concept');
  }
  const mapping=files.get(path);
  const html=routes.has(path.replace(/\/+$/,'')||'/')||productRoute.test(path);
  if(!mapping&&!html){res.writeHead(404);return res.end('Not found');}
  try{
    const bytes=await readFile(resolve(root,html?'cloudflare/carstore-v8/index.html':mapping[0]));
    res.writeHead(200,{'Content-Type':html?'text/html; charset=utf-8':mapping[1],
      'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:bytes);
  }catch{
    res.writeHead(500);res.end('Fixture error');
  }
}).listen(port,'127.0.0.1',()=>console.log('AutoPro V7 local browser QA http://127.0.0.1:'+port));
