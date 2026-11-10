import catalog from './catalog.mjs';

// All source assets are bundled from verified files on this review branch.
// No runtime dependency on Canva, Unsplash, GitHub or a third-party CDN.
const SITE_HTML = __AUTOPRO_HTML__;
const SITE_CSS = __AUTOPRO_CSS__;
const SITE_JS = __AUTOPRO_JS__;
const MEDIA = {
  'hero.webp': __MEDIA_HERO__,
  'brakes.webp': __MEDIA_BRAKES__,
  'wheels.webp': __MEDIA_WHEELS__,
  'lighting.webp': __MEDIA_LIGHTING__,
  'drive.webp': __MEDIA_DRIVE__,
};
const HEADERS={
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy':"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;",
};
const ALLOWED=new Set(['/','/home','/catalog','/products','/categories','/cart','/about']);
const PRODUCT_PATH=/^\/product\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/;
const PRODUCT_MEDIA_PATH=/^\/media\/products\/(?:[a-z0-9][a-z0-9_-]{0,79}\/){0,2}[a-z0-9][a-z0-9_-]{0,79}\.(webp|jpg|jpeg|png)$/;
const PRODUCT_MEDIA_TYPES=Object.freeze({webp:'image/webp',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png'});
const MAX_PRODUCT_IMAGE_SIZE=6*1024*1024;
async function handleProductPhoto(request,env,path){
  const match=PRODUCT_MEDIA_PATH.exec(path);
  // The binding is intentionally optional until an approved, rights-cleared
  // product-media bucket is provisioned. Editorial assets are never substituted.
  if(!match||!env.PRODUCT_MEDIA)return send('Not found','text/plain; charset=utf-8',404);
  const key=path.slice(1);
  try{
    const object=request.method==='HEAD'
      ?await env.PRODUCT_MEDIA.head(key)
      :await env.PRODUCT_MEDIA.get(key);
    if(!object||object.size>MAX_PRODUCT_IMAGE_SIZE)return send('Not found','text/plain; charset=utf-8',404);
    return new Response(request.method==='HEAD'?null:object.body,{
      status:200,
      headers:{
        ...HEADERS,
        'Content-Type':PRODUCT_MEDIA_TYPES[match[1]],
        'Cache-Control':'public, max-age=86400',
        'Content-Length':String(object.size),
      },
    });
  }catch{
    return send('Media temporarily unavailable','text/plain; charset=utf-8',503);
  }
}

function send(body,contentType,status=200,cache='no-cache'){
  return new Response(body,{status,headers:{...HEADERS,'Content-Type':contentType,'Cache-Control':cache}});
}
function decodeImage(base64){
  const binary=atob(base64);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
}
export default {
  async fetch(request,env,context){
    const path=new URL(request.url).pathname;
    if(path.startsWith('/api/'))return catalog.fetch(request,env,context);
    if(!['GET','HEAD'].includes(request.method)){
      return send('Method not allowed','text/plain; charset=utf-8',405);
    }
    if(path.startsWith('/media/products/'))return handleProductPhoto(request,env,path);
    if(path.startsWith('/media/')){
      const name=path.slice('/media/'.length);
      if(!Object.prototype.hasOwnProperty.call(MEDIA,name))
        return send('Not found','text/plain; charset=utf-8',404);
      const image=decodeImage(MEDIA[name]);
      return send(request.method==='HEAD'?null:image,'image/webp',200,'public, max-age=86400');
    }
    if(path==='/site.css')return send(request.method==='HEAD'?null:SITE_CSS,'text/css; charset=utf-8',200,'public, max-age=300');
    if(path==='/app.js')return send(request.method==='HEAD'?null:SITE_JS,'text/javascript; charset=utf-8',200,'public, max-age=300');
    if(ALLOWED.has(path.replace(/\/+$/,'')||'/')||PRODUCT_PATH.test(path))
      return send(request.method==='HEAD'?null:SITE_HTML,'text/html; charset=utf-8');
    return send('Not found','text/plain; charset=utf-8',404);
  },
};
