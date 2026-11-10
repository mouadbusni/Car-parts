// AutoPro V7 — frontend-only Cloudflare Worker.
// No D1, R2, cookies, accounts, API, checkout, upload or database bindings.
const SITE_HTML=__AUTOPRO_HTML__;
const SITE_CSS=__AUTOPRO_CSS__;
const SITE_JS=__AUTOPRO_JS__;
const MEDIA={
  'hero.webp':__MEDIA_HERO__,
  'brakes.webp':__MEDIA_BRAKES__,
  'wheels.webp':__MEDIA_WHEELS__,
  'lighting.webp':__MEDIA_LIGHTING__,
  'drive.webp':__MEDIA_DRIVE__
};
const HEADERS={
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy':"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;",
};
const PAGE_ROUTES=new Set(['/','/home','/catalog','/products','/categories','/cart','/about']);
const PRODUCT_ROUTE=/^\/product\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/;
const send=(body,type,status=200,cache='no-store')=>
  new Response(body,{status,headers:{...HEADERS,'Content-Type':type,'Cache-Control':cache}});
function imageData(base64){
  const binary=atob(base64);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
}
export default {
  async fetch(request){
    const path=new URL(request.url).pathname;
    if(!['GET','HEAD'].includes(request.method)){
      return send('Method not allowed','text/plain; charset=utf-8',405);
    }
    const head=request.method==='HEAD';
    if(path.startsWith('/api/')){
      return send('This preview does not provide an API.','text/plain; charset=utf-8',404);
    }
    if(path.startsWith('/media/')){
      const name=path.slice('/media/'.length);
      if(!Object.prototype.hasOwnProperty.call(MEDIA,name)){
        return send('Not found','text/plain; charset=utf-8',404);
      }
      return send(head?null:imageData(MEDIA[name]),'image/webp',200,'public, max-age=86400');
    }
    if(path==='/site.css'){
      return send(head?null:SITE_CSS,'text/css; charset=utf-8',200,'public, max-age=60');
    }
    if(path==='/app.js'){
      return send(head?null:SITE_JS,'text/javascript; charset=utf-8',200,'public, max-age=60');
    }
    if(PAGE_ROUTES.has(path.replace(/\/+$/,'')||'/')||PRODUCT_ROUTE.test(path)){
      return send(head?null:SITE_HTML,'text/html; charset=utf-8');
    }
    return send('Not found','text/plain; charset=utf-8',404);
  }
};
