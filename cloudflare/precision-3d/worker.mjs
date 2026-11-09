import catalog from './catalog.mjs';

// These are filled deterministically by the deployment bundler from the three
// tracked files: index.html, app.css, app.js. No runtime fetch to GitHub.
const SITE_HTML = __AUTOPRO_HTML__;
const SITE_CSS = __AUTOPRO_CSS__;
const SITE_JS = __AUTOPRO_JS__;
const SITE_SCENE = __AUTOPRO_SCENE__;

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;",
};
function reply(body,type,status=200) {
  return new Response(body,{status,headers:{
    ...SECURITY_HEADERS,
    'Content-Type':type,
    'Cache-Control':type.startsWith('text/html')?'no-cache':'public, max-age=300, must-revalidate',
  }});
}

const SITE_ROUTES = new Set(['/','/home','/catalog','/products','/categories','/cart','/about']);
const validSlug = /^\/product\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if(path.startsWith('/api/')) return catalog.fetch(request,env,ctx);
    if(!['GET','HEAD'].includes(request.method)){
      return reply('Method not allowed','text/plain; charset=utf-8',405);
    }
    let body, contentType, status=200;
    if(path==='/precision.css') {
      body=SITE_CSS;contentType='text/css; charset=utf-8';
    }else if(path==='/scene.js'){
      body=SITE_SCENE;contentType='text/javascript; charset=utf-8';
    }else if(path==='/app.js'){
      body=SITE_JS;contentType='text/javascript; charset=utf-8';
    }else if(SITE_ROUTES.has(path.replace(/\/+$/,'')||'/')||validSlug.test(path)){
      body=SITE_HTML;contentType='text/html; charset=utf-8';
    }else{
      body='Not found';contentType='text/plain; charset=utf-8';status=404;
    }
    const response=reply(request.method==='HEAD'?null:body,contentType,status);
    if(request.method==='HEAD')response.headers.set('Content-Length','0');
    return response;
  },
};
