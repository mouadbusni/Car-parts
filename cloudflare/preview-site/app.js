(function previewApp(){
"use strict";
const main=document.getElementById('main-content');
const toastNode=document.getElementById('toast');
const DEMO_CATEGORIES=[
  {id:'brakes',name:'BRAKING SYSTEMS',slug:'brakes',description:'Rotors, calipers and track-inspired essentials.',symbol:'01'},
  {id:'suspension',name:'SUSPENSION',slug:'suspension',description:'Coilovers and precision chassis components.',symbol:'02'},
  {id:'engine',name:'ENGINE & INTAKE',slug:'engine',description:'Airflow, induction and engine performance.',symbol:'03'},
  {id:'exhaust',name:'EXHAUST',slug:'exhaust',description:'Performance-focused exhaust components.',symbol:'04'}
];
const demoProduct=(id,slug,name,category_id,price,art,description,brand='AUTOPRO LAB')=>({
  id,slug,name,category_id,price,art,description,brand,is_featured:true,
  specifications:{'Type':'Preview component','Availability':'Demo only','Purpose':'Interface testing'},
  image_url:'',sku:id.toUpperCase(),stock_quantity:6,compare_price:null,rating:0,reviews_count:0,demo:true
});
const DEMO_PRODUCTS=[
  demoProduct('ap-demo-01','vented-performance-rotor','Vented Performance Rotor','brakes',189,'rotor','Precision inspired vented brake component for visual demonstration.'),
  demoProduct('ap-demo-02','adjustable-coilover-unit','Adjustable Coilover Unit','suspension',429,'coilover','Track-style suspension preview with a precision mechanical silhouette.'),
  demoProduct('ap-demo-03','machined-intake-filter','Machined Intake Filter','engine',125,'filter','Engine airflow component shown as a design-only placeholder.'),
  demoProduct('ap-demo-04','sport-brake-caliper','Sport Brake Caliper','brakes',275,'caliper','Performance braking study with a machined aluminum aesthetic.'),
  demoProduct('ap-demo-05','performance-intercooler','Performance Intercooler','engine',320,'cooler','High-flow heat exchanger visual for interaction testing.'),
  demoProduct('ap-demo-06','titanium-exhaust-tip','Titanium Exhaust Tip','exhaust',159,'exhaust','Exhaust finishing detail in the AutoPro concept catalogue.')
];
let products=[],categories=[],demoMode=true,showDemo=true,serviceStatus='checking',cart=[],detailQuantity=1;
const STORAGE_KEY='autopro:cloudflare-preview:cart:v1';
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=value=>'$'+Number(value||0).toFixed(2);
const slugOk=slug=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
function loadCart(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    if(!Array.isArray(raw))return [];
    return raw.filter(x=>x&&typeof x.slug==='string'&&slugOk(x.slug)&&Number.isInteger(x.qty)&&x.qty>0&&x.qty<=6&&typeof x.demo==='boolean').slice(0,80);
  }catch{return [];}
}
cart=loadCart();
function saveCart(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(cart))}catch{}updateCount()}
function updateCount(){const n=cart.reduce((sum,i)=>sum+i.qty,0);const badge=document.getElementById('header-count');badge.textContent=n>99?'99+':String(n);badge.hidden=n===0;}
function showToast(message){
  toastNode.textContent=message;toastNode.hidden=false;
  clearTimeout(showToast.timeout);
  showToast.timeout=setTimeout(()=>toastNode.hidden=true,2900);
}
async function loadCatalog(){
  try{
    const [a,b]=await Promise.all([
      fetch('/api/categories',{cache:'no-store'}),
      fetch('/api/products?sort=featured&limit=48',{cache:'no-store'})
    ]);
    if(!a.ok||!b.ok)throw Error('Catalog API unavailable');
    const [c,p]=await Promise.all([a.json(),b.json()]);
    if(!Array.isArray(c.data)||!Array.isArray(p.data))throw Error('Unexpected API response');
    products=p.data.map(x=>({...x,demo:false}));
    categories=c.data;
    demoMode=products.length===0;
    serviceStatus='online';
  }catch(error){demoMode=true;serviceStatus='unavailable';products=[];categories=[];}
}
const activeProducts=()=>demoMode?(showDemo?DEMO_PRODUCTS:[]):products;
const activeCategories=()=>demoMode?(showDemo?DEMO_CATEGORIES:[]):categories;
function addItem(slug,quantity=1){
  const item=activeProducts().find(x=>x.slug===slug);
  if(!item){showToast('This item is not available in the preview.');return}
  const limit=Math.min(6,Math.max(0,Math.floor(Number(item.stock_quantity)||0)));
  const existing=cart.find(x=>x.slug===slug);
  if((existing?.qty||0)+quantity>limit){showToast('Preview selection limit reached for this item.');return}
  if(existing)existing.qty+=quantity;else cart.push({slug:item.slug,qty:quantity,demo:!!item.demo});
  saveCart();showToast((item.demo?'Demo item':'Item')+' added to your selection.');
}
function editQty(slug,change){
  const x=cart.find(item=>item.slug===slug);
  if(!x)return;
  const next=x.qty+change;
  if(next<=0)cart=cart.filter(item=>item!==x);
  else if(next>6){showToast('Maximum 6 per item in preview.');return}
  else x.qty=next;
  saveCart();renderRoute(false);
}
function rotorSvg(size='normal'){
  const holes=Array.from({length:10},(_,i)=>{
    const a=(i*36-90)*Math.PI/180, x=250+116*Math.cos(a), y=250+116*Math.sin(a);
    return '<circle cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="13" fill="#131315" stroke="#5a5755" stroke-width="3"/>';
  }).join('');
  const slots=Array.from({length:10},(_,i)=>{
    const a=i*36;return '<g transform="rotate('+a+' 250 250)"><rect x="242" y="77" width="16" height="51" rx="7" fill="#0d0e11" stroke="#555151" stroke-width="2"/></g>';
  }).join('');
  const orange=size==='hero'?'#719ff0':'#6ea5f4';
  return `<svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Technical illustration of a vented brake rotor">
  <defs><linearGradient id="steel${size}" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#999ba2"/><stop offset=".27" stop-color="#292c32"/><stop offset=".58" stop-color="#676972"/><stop offset=".8" stop-color="#1c1e22"/><stop offset="1" stop-color="#7c7e85"/></linearGradient><radialGradient id="face${size}"><stop stop-color="#8b8987"/><stop offset=".27" stop-color="#333437"/><stop offset=".6" stop-color="#45474b"/><stop offset=".87" stop-color="#17191c"/><stop offset=".99" stop-color="#999aa0"/></radialGradient><filter id="glow${size}"><feGaussianBlur stdDeviation="9"/></filter></defs>
  <ellipse cx="269" cy="440" rx="155" ry="20" fill="black" opacity=".55"/>
  <g transform="rotate(-14 250 250)"><circle cx="250" cy="250" r="214" fill="#0c0d10" stroke="#4a4d54" stroke-width="10"/><circle cx="250" cy="250" r="201" fill="url(#face${size})" stroke="#c2bcb5" stroke-width="4"/><circle cx="250" cy="250" r="185" stroke="${orange}" stroke-opacity=".5" stroke-width="2"/><circle cx="250" cy="250" r="157" stroke="#8a8c91" stroke-width="2"/><circle cx="250" cy="250" r="144" stroke="#1c1d22" stroke-width="9"/>${holes}${slots}<circle cx="250" cy="250" r="82" fill="#16191f" stroke="#aaa8a3" stroke-width="9"/><circle cx="250" cy="250" r="65" fill="url(#steel${size})" stroke="#35373e" stroke-width="5"/>${Array.from({length:5},(_,i)=>{const a=(i*72)*Math.PI/180;return '<circle cx="'+(250+48*Math.cos(a)).toFixed(2)+'" cy="'+(250+48*Math.sin(a)).toFixed(2)+'" r="8" fill="#121418" stroke="#b1adb1" stroke-width="3"/>'}).join('')}<circle cx="250" cy="250" r="26" fill="#121315" stroke="${orange}" stroke-width="3"/><circle cx="250" cy="250" r="13" fill="#030407"/></g>
  <path d="M65 393L146 347" stroke="${orange}" stroke-width="3" opacity=".75"/><path d="M378 108L456 66" stroke="${orange}" stroke-width="2" opacity=".5"/><circle cx="459" cy="64" r="4" fill="${orange}"/>
  </svg>`;
}
function artSvg(kind){
  if(kind==='rotor'||!kind)return rotorSvg('card');
  if(kind==='coilover')return `<svg viewBox="0 0 360 260" role="img" aria-label="Technical illustration of a coilover"><defs><linearGradient id="col" x1="0" x2="1"><stop stop-color="#18191f"/><stop offset=".4" stop-color="#c1c2c6"/><stop offset=".7" stop-color="#494b52"/><stop offset="1" stop-color="#14151a"/></linearGradient></defs><g transform="translate(180 130) rotate(28) translate(-180 -130)"><rect x="158" y="15" width="44" height="226" rx="18" fill="url(#col)" stroke="#75777b" stroke-width="3"/><rect x="171" y="5" width="18" height="48" rx="7" fill="#e2e2e1"/><path d="M137 53C229 61 135 86 225 97C136 109 229 131 136 145C226 160 135 180 218 195" fill="none" stroke="#457cd9" stroke-width="18" stroke-linecap="round"/><path d="M137 53C229 61 135 86 225 97C136 109 229 131 136 145C226 160 135 180 218 195" fill="none" stroke="#b6d7ff" stroke-width="4" stroke-linecap="round"/><rect x="145" y="190" width="70" height="23" rx="6" fill="#464850" stroke="#aaa"/><rect x="153" y="218" width="54" height="24" rx="8" fill="#2b2d32" stroke="#ddd"/></g></svg>`;
  if(kind==='filter')return `<svg viewBox="0 0 360 260" role="img" aria-label="Technical illustration of an air filter"><defs><linearGradient id="f1" x1="0" x2="1"><stop stop-color="#22252b"/><stop offset=".5" stop-color="#bbbcc2"/><stop offset="1" stop-color="#303239"/></linearGradient></defs><g transform="rotate(-16 180 130)"><path d="M77 86L275 75L253 213L94 207Z" fill="#2b599b" stroke="#6e9bd6" stroke-width="7"/>${Array.from({length:12},(_,i)=>`<path d="M${99+i*13} 94L${109+i*12} 202" stroke="#a3c2e8" stroke-width="4"/>`).join('')}<ellipse cx="178" cy="85" rx="108" ry="32" fill="#2b2d32" stroke="url(#f1)" stroke-width="12"/><ellipse cx="178" cy="85" rx="74" ry="18" fill="#0a0b0e" stroke="#8c8e95" stroke-width="4"/><path d="M89 207Q176 235 260 207" stroke="#777980" stroke-width="15"/></g></svg>`;
  if(kind==='caliper')return `<svg viewBox="0 0 360 260" role="img" aria-label="Technical illustration of a brake caliper"><defs><linearGradient id="c1" x1="0" x2="1"><stop stop-color="#1b355c"/><stop offset=".3" stop-color="#6da7ec"/><stop offset=".65" stop-color="#3166ad"/><stop offset="1" stop-color="#102b4e"/></linearGradient></defs><g transform="rotate(-18 180 130)"><path d="M65 85C88 46 258 46 289 87L300 161Q275 218 231 208L213 177H144L129 206Q92 210 64 164Z" fill="url(#c1)" stroke="#508dc9" stroke-width="5"/><path d="M105 108C149 77 218 76 258 109V161H105Z" fill="#17191d" stroke="#b4d4ff" stroke-width="7"/><rect x="131" y="102" width="100" height="70" rx="24" fill="#202125" stroke="#a8a8ab" stroke-width="6"/><path d="M74 151H112M254 151H290" stroke="#cedef1" stroke-width="6"/><text x="181" y="145" text-anchor="middle" fill="#7fb5ed" font-size="16" font-weight="bold" font-family="Arial">AP</text></g></svg>`;
  if(kind==='cooler')return `<svg viewBox="0 0 360 260" role="img" aria-label="Technical illustration of an intercooler"><defs><linearGradient id="i1" x1="0" x2="1"><stop stop-color="#4a4c52"/><stop offset=".45" stop-color="#b5b6bc"/><stop offset="1" stop-color="#2e3037"/></linearGradient></defs><g transform="rotate(-9 180 130)"><rect x="49" y="65" width="263" height="141" rx="10" fill="#191b1e" stroke="#b0b1b5" stroke-width="10"/><rect x="68" y="80" width="223" height="112" fill="#45484d"/>${Array.from({length:21},(_,i)=>`<path d="M${74+i*10} 83V189" stroke="${i%2?'#111216':'#a5a9af'}" stroke-width="5"/>`).join('')}<path d="M22 107H54M306 160H340" stroke="#888b91" stroke-width="28" stroke-linecap="round"/><path d="M53 68V200M311 68V200" stroke="#588dc4" stroke-width="5"/></g></svg>`;
  return `<svg viewBox="0 0 360 260" role="img" aria-label="Technical illustration of an exhaust"><defs><linearGradient id="e1" x1="0" x2="1"><stop stop-color="#2b2c31"/><stop offset=".27" stop-color="#bdbdc1"/><stop offset=".6" stop-color="#414249"/><stop offset="1" stop-color="#c5c5c5"/></linearGradient></defs><g transform="rotate(-19 180 130)"><path d="M55 165C102 147 133 140 187 133" fill="none" stroke="url(#e1)" stroke-width="52" stroke-linecap="round"/><path d="M185 135L280 109" stroke="url(#e1)" stroke-width="75" stroke-linecap="round"/><ellipse cx="280" cy="109" rx="45" ry="50" fill="#777981" stroke="#cac9cc" stroke-width="13"/><ellipse cx="281" cy="108" rx="29" ry="33" fill="#0b0b0d" stroke="#6c99cc" stroke-width="5"/><path d="M200 129L231 120" stroke="#78afe4" stroke-width="4"/></g></svg>`;
}
function artwork(product){return artSvg(product.art||(/brake|rotor/i.test(product.name)?'rotor':/suspension|coilover/i.test(product.name)?'coilover':/filter/i.test(product.name)?'filter':/exhaust/i.test(product.name)?'exhaust':'cooler'))}
function intro(eyebrow,title,lead){return `<section class="page-top"><div class="container"><div class="bread"><a href="/" data-nav>HOME</a> &nbsp;/&nbsp; <b>${esc(eyebrow)}</b></div><div class="eyebrow">${esc(eyebrow)}</div><h1>${title}</h1><p>${esc(lead)}</p></div></section>`;}
function notice(){
  if(serviceStatus==='unavailable')return `<div class="notice" role="status"><strong>STAGING DATA SERVICE UNAVAILABLE.</strong> Demo products are for interface testing only. No actual inventory is being shown.</div>`;
  if(demoMode)return `<div class="notice" role="status"><strong>DEMO CATALOGUE · EXAMPLE PRODUCTS ONLY.</strong> AutoPro's Cloudflare D1 database is connected but contains no verified product inventory. Every visible item and price is a demonstration—not an offer for sale. <button type="button" data-toggle-demo style="color:#c8e3ff;text-decoration:underline;border:0;background:none;padding:0">${showDemo?'Hide demo items':'Show demo items'}</button></div>`;
  return `<div class="notice" role="status"><strong>STAGING MODE.</strong> Product listings come from the AutoPro D1 API. Prices and stock are not validated for checkout; orders remain disabled.</div>`;
}
function card(p,i=0){return `<article class="product-card" data-testid="product-card"><a data-nav href="/product/${encodeURIComponent(p.slug)}" class="product-art" aria-label="View ${esc(p.name)}">${p.demo?'<span class="product-badge">DEMO PRODUCT</span>':'<span class="product-badge">PREVIEW ONLY</span>'}${artwork(p)}<span class="product-code">${String(i+1).padStart(2,'0')} / AP</span></a><div class="product-content"><span class="product-brand">${esc(p.brand||'AUTOPRO')}</span><a data-nav href="/product/${encodeURIComponent(p.slug)}"><h3>${esc(p.name)}</h3></a><p>${esc(p.description||'View component specifications and details.')}</p><div class="product-bottom"><div><div class="price">${money(p.price)}</div><div class="price-note">${p.demo?'ILLUSTRATIVE PRICE':'PRICE NOT VERIFIED'}</div></div><button type="button" class="btn btn-primary" data-add="${esc(p.slug)}" aria-label="Add ${esc(p.name)} to preview selection">ADD <span class="arrow">+</span></button></div></div></article>`;}
function categoryCard(c,i){const symbol=String(i+1).padStart(2,'0');return `<a href="/catalog?category=${encodeURIComponent(c.id)}" data-nav class="category-card"><span class="category-number">CATEGORY / ${symbol}</span><span class="category-symbol">${symbol}</span><h3>${esc(c.name)}</h3><span class="category-link">${esc(c.description||'Explore component listings')} <b>↗</b></span></a>`;}
function home(){
  const featured=activeProducts().slice(0,3);
  main.innerHTML=`<section class="hero" data-version="precision-3d">
  <div class="container hero-inner">
    <div class="hero-copy">
      <div class="hero-kicker"><strong>AP / 001</strong> &nbsp;—&nbsp; ENGINEERING STUDIO / INTERACTIVE SYSTEMS</div>
      <h1 class="hero-title">Precision<br>in every<br><em>detail.</em></h1>
      <p class="hero-text">Discover the components behind the drive. A new way to explore automotive engineering, with real 3D inspection, technical product views and a more considered catalogue.</p>
      <div class="hero-actions">
        <a data-nav class="btn btn-primary" href="/catalog">EXPLORE COMPONENTS <span class="arrow" aria-hidden="true">↗</span></a>
        <a data-nav class="btn btn-outline" href="/about">OUR APPROACH <span class="arrow" aria-hidden="true">→</span></a>
      </div>
      <div class="hero-note">INTERACTIVE ENGINEERING STUDY &nbsp;/&nbsp; NO ORDERS OR PAYMENTS</div>
    </div>
    <div class="hero-art" aria-label="Interactive Three.js brake assembly showcase">
      <div class="brake-stage">
        <canvas id="brake-canvas" role="img" aria-label="Interactive 3D model of a ventilated metal brake rotor with blue monoblock caliper. Drag to rotate. Use arrow keys when focused." tabindex="0"></canvas>
        <div id="model-fallback" class="model-fallback"><div class="fallback-mark" aria-hidden="true">AP</div><p>3D preview is loading. If your device cannot render WebGL, you can still browse every part of the site.</p></div>
      </div>
      <span class="tech-left" aria-hidden="true">AP / BRAKE SYSTEM<br>CARBON-STUDY / PROTOTYPE</span>
      <span class="tech-right" aria-hidden="true">3D MODEL / V 2.0<br>ENGINEERED IN THREE.JS</span>
      <div class="scene-controls">
        <div class="scene-caption"><strong id="webgl-state" role="status">PREPARING 3D ASSEMBLY</strong>DRAG TO ROTATE · ARROW KEYS</div>
        <button type="button" class="view-button" data-explode aria-pressed="false" aria-label="Toggle exploded 3D assembly">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 18l9 5 9-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span data-explode-label>EXPLODED VIEW</span>
        </button>
      </div>
    </div>
    <span class="hero-index">AUTOPRO / ORIGINAL 3D ASSEMBLY — BETA</span>
  </div>
  </section>
  <div class="stripe" aria-label="Brand principles"><div class="stripe-inner"><span>DESIGNED FOR PRECISION</span><i aria-hidden="true">✦</i><span>ENGINEERED WITH PURPOSE</span><i aria-hidden="true">✦</i><span>DEFINED BY THE DETAILS</span><i aria-hidden="true">✦</i><span>DESIGNED FOR PRECISION</span></div></div>
  <section class="section"><div class="container">
    <div class="section-heading"><div><div class="eyebrow">01 / THE STUDIO</div><h2 class="section-title">Beyond the <span class="accent">surface.</span></h2></div><p class="section-lead">A product experience designed like an engineering studio: inspect, compare and understand the components that matter.</p></div>
    <div class="metrics">
      <div class="metric"><span class="metric-index">01 / FOCUS</span><div class="metric-num">See the mechanics.</div><div class="metric-label">Interact with original WebGL geometry, real lighting and physical material surfaces.</div></div>
      <div class="metric"><span class="metric-index">02 / DISCOVER</span><div class="metric-num">Understand the parts.</div><div class="metric-label">Explore category families, product information and component characteristics.</div></div>
      <div class="metric"><span class="metric-index">03 / COLLECT</span><div class="metric-num">Build your selection.</div><div class="metric-label">Save an editable shortlist locally as the functional store takes shape.</div></div>
    </div></div></section>
  <section class="section alt"><div class="container">
    <div class="section-heading"><div><div class="eyebrow">02 / SYSTEMS</div><h2 class="section-title">Every part <span class="accent">has a purpose.</span></h2></div><a href="/categories" data-nav class="inline-link">EXPLORE ALL SYSTEMS <span class="arrow" aria-hidden="true">↗</span></a></div>
    ${notice()}
    <div class="category-grid">${activeCategories().slice(0,3).map(categoryCard).join('')||'<div class="empty-state" style="grid-column:1/-1"><h2>VERIFIED CATEGORIES NOT AVAILABLE YET</h2><p>The separate staging database is ready for a real AutoPro product import.</p></div>'}</div>
  </div></section>
  <section class="section"><div class="container">
    <div class="section-heading"><div><div class="eyebrow">03 / COMPONENT INDEX</div><h2 class="section-title">Built for the <span class="accent">details.</span></h2></div><a href="/catalog" data-nav class="inline-link">OPEN COMPONENT INDEX <span class="arrow" aria-hidden="true">↗</span></a></div>
    ${notice()}
    <div class="product-grid">${featured.length?featured.map(card).join(''):'<div class="empty-state" style="grid-column:1/-1"><h2>THE COMPONENT INDEX IS BEING PREPARED</h2><p>Verified AutoPro inventory has not yet been imported into D1.</p><a href="/catalog" data-nav class="btn btn-outline">OPEN CATALOGUE</a></div>'}</div>
  </section>
  <section class="section alt"><div class="container">
    <div class="showcase">
      <div class="showcase-copy"><div class="eyebrow">ENGINEERING / 004</div><h2 class="section-title">The study of<br><span class="accent">what moves us.</span></h2><p>We believe the best automotive experiences celebrate the construction as much as the performance. Discover our technical-first approach.</p><a href="/about" data-nav class="inline-link" style="align-self:start;margin-top:22px">ABOUT THE STUDIO <span class="arrow" aria-hidden="true">↗</span></a></div>
      <div class="showcase-graphic"><div class="outline-text" aria-hidden="true">AP</div><div class="scene-caption" style="position:absolute;left:12%;top:20%;max-width:250px"><strong>FROM IDEA TO ASSEMBLY.</strong>Exploring every part in the system.</div></div>
    </div>
  </div></section>`;
}
function catalogue(){
  const params=new URLSearchParams(location.search);
  const search=(params.get('search')||'').slice(0,80),category=params.get('category')||'all',sort=params.get('sort')||'featured';
  let list=activeProducts().filter(p=>(!search||p.name.toLowerCase().includes(search.toLowerCase()))&&(category==='all'||p.category_id===category));
  if(sort==='price-low')list.sort((a,b)=>a.price-b.price);else if(sort==='price-high')list.sort((a,b)=>b.price-a.price);else if(sort==='rating')list.sort((a,b)=>(b.rating||0)-(a.rating||0));else if(sort==='newest')list.sort((a,b)=>String(b.created_at||'').localeCompare(a.created_at||''));
  main.innerHTML=intro('PARTS CATALOG','PERFORMANCE <span class="accent">PARTS.</span>','Explore components, filter by category and build a personal selection. This is a development preview.')+`<section class="section"><div class="container">${notice()}<form class="catalog-controls" id="catalog-search" role="search"><div class="control-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke-width="2"/><path d="M16 16l5 5" stroke-width="2"/></svg><input id="catalog-query" name="search" aria-label="Search products" class="field" placeholder="Search product name..." maxlength="80" value="${esc(search)}" type="search"></div><select id="category-filter" name="category" aria-label="Filter by category" class="field filter-select"><option value="all">ALL CATEGORIES</option>${activeCategories().map(c=>`<option value="${esc(c.id)}" ${c.id===category?'selected':''}>${esc(c.name)}</option>`).join('')}</select><select id="sort-filter" name="sort" aria-label="Sort products" class="field filter-select"><option value="featured" ${sort==='featured'?'selected':''}>FEATURED FIRST</option><option value="price-low" ${sort==='price-low'?'selected':''}>PRICE: LOW - HIGH</option><option value="price-high" ${sort==='price-high'?'selected':''}>PRICE: HIGH - LOW</option><option value="rating" ${sort==='rating'?'selected':''}>RATING</option><option value="newest" ${sort==='newest'?'selected':''}>NEWEST</option></select><button class="btn btn-primary" type="submit">APPLY FILTERS ↗</button></form><div class="catalog-meta"><span>${list.length} ${demoMode?'EXAMPLE COMPONENTS':'COMPONENTS'} SHOWN</span><span>${serviceStatus==='online'?'D1 API CONNECTED':'DEMO DISPLAY ONLY'}</span></div>${list.length?`<div class="product-grid">${list.map(card).join('')}</div>`:`<div class="empty-state" data-testid="catalog-empty"><div class="empty-icon">Ø</div><h2>NO MATCHING PARTS.</h2><p>${demoMode?'Nothing in the example catalogue matches those filters.':'There are no verified AutoPro products matching those filters yet.'}</p><a data-nav href="/catalog" class="btn btn-outline">CLEAR FILTERS</a></div>`}</div></section>`;
}
function categoryPage(){main.innerHTML=intro('CATEGORIES','FIND YOUR <span class="accent">SYSTEM.</span>','Start with the component category that fits your build.')+`<section class="section"><div class="container">${notice()}<div class="category-grid">${activeCategories().length?activeCategories().map(categoryCard).join(''):'<div class="empty-state" style="grid-column:1/-1"><h2>NO VERIFIED CATEGORIES</h2><p>The staging database has no category records.</p></div>'}</div></div></section>`;}
function detailPage(slug){
  const p=activeProducts().find(x=>x.slug===slug);
  if(!p){main.innerHTML=intro('PRODUCT DETAILS','COMPONENT NOT <span class="accent">FOUND.</span>','This item does not exist in the current preview catalogue.')+`<section class="section"><div class="container"><a data-nav href="/catalog" class="btn btn-outline">BACK TO CATALOG ↗</a></div></section>`;return}
  const specs=Object.entries(p.specifications||{}).slice(0,6);
  main.innerHTML=`<section class="page-top"><div class="container"><div class="bread"><a data-nav href="/">HOME</a> / <a data-nav href="/catalog">CATALOG</a> / <b>${esc(p.name)}</b></div><div class="eyebrow">COMPONENT INSPECTION</div><h1>THE <span class="accent">DETAILS.</span></h1></div></section><section class="section"><div class="container">${notice()}<div class="detail-layout"><div class="detail-art">${artwork(p)}<span class="detail-badge">${p.demo?'DEMO PRODUCT — NOT FOR SALE':'STAGING CATALOG ITEM'}</span></div><div class="detail-body"><div class="eyebrow">${esc(p.brand||'AUTOPRO')} / ${esc(p.sku)}</div><h1>${esc(p.name)}</h1><p class="description">${esc(p.description||'Component details are being prepared.')}</p><div class="divider"></div><div class="detail-price">${money(p.price)}</div><p class="subtle">${p.demo?'ILLUSTRATIVE AMOUNT ONLY — NO ACTUAL INVENTORY':'STAGING CATALOGUE — NO CHECKOUT ENABLED'}</p><div class="qty-row"><div class="qty-stepper"><button aria-label="Decrease quantity" data-detail-delta="-1" ${detailQuantity<=1?'disabled':''}>−</button><output id="detail-qty">${detailQuantity}</output><button aria-label="Increase quantity" data-detail-delta="1" ${detailQuantity>=6?'disabled':''}>+</button></div><button type="button" data-detail-add="${esc(p.slug)}" class="btn btn-primary">ADD TO PREVIEW SELECTION ↗</button></div><a data-nav href="/cart" class="inline-link">VIEW MY SELECTION <span class="arrow">↗</span></a><div class="detail-specs">${specs.map(([k,v])=>`<div class="spec-item"><span>${esc(k.toUpperCase())}</span><strong>${esc(v)}</strong></div>`).join('')}</div></div></div></div></section>`;
}
function cartPage(){
  const valid=cart.map(c=>({line:c,product:activeProducts().find(p=>p.slug===c.slug)})).filter(x=>x.product);
  const count=valid.reduce((n,x)=>n+x.line.qty,0);
  const subtotal=valid.reduce((n,x)=>n+x.line.qty*x.product.price,0);
  main.innerHTML=intro('MY SELECTION','THE PREVIEW <span class="accent">CART.</span>','Make a personal shortlist, adjust quantities and revisit your selection. Orders and payments are not available.')+`<section class="section"><div class="container">${notice()}${valid.length?`<div class="cart-layout"><div class="cart-list">${valid.map(({line,product:p})=>`<article class="cart-line" data-testid="cart-item"><div class="cart-visual">${artwork(p)}</div><div class="cart-line-body"><h3>${esc(p.name)}</h3><p>${p.demo?'DEMO ITEM — NOT FOR SALE':'STAGING ITEM'} · ${esc(p.brand)}</p><div class="cart-qty"><button type="button" aria-label="Decrease ${esc(p.name)} quantity" data-qty="${esc(p.slug)}" data-step="-1">−</button><strong>${line.qty}</strong><button type="button" aria-label="Increase ${esc(p.name)} quantity" data-qty="${esc(p.slug)}" data-step="1" ${line.qty>=6?'disabled':''}>+</button><button type="button" class="remove-btn" data-remove="${esc(p.slug)}">REMOVE</button></div></div><div class="price">${money(p.price*line.qty)}</div></article>`).join('')}</div><aside class="cart-summary"><h2>SELECTION SUMMARY</h2><div class="summary-row"><span>ITEMS</span><strong>${count}</strong></div><div class="summary-row"><span>SUBTOTAL PREVIEW</span><strong>${money(subtotal)}</strong></div><div class="total-row"><span>ILLUSTRATIVE TOTAL</span><span>${money(subtotal)}</span></div><p class="summary-note">This amount is for UI demonstration only. Items are stored in your browser; no payment, shipping or order processing exists.</p><button disabled type="button" class="btn">CHECKOUT NOT AVAILABLE</button><a data-nav href="/catalog" class="inline-link" style="margin-top:25px">CONTINUE BROWSING <span class="arrow">↗</span></a></aside></div>`:`<div class="empty-state" data-testid="empty-cart"><div class="empty-icon">0</div><h2>NOTHING SAVED YET.</h2><p>Explore the AutoPro catalogue and add example components to test your personal selection.</p><a href="/catalog" data-nav class="btn btn-primary">EXPLORE COMPONENTS ↗</a></div>`}</div></section>`;
}
function aboutPage(){main.innerHTML=intro('THE AUTOPRO CONCEPT','ENGINEERED FOR <span class="accent">THE DETAILS.</span>','An automotive parts storefront concept focused on an honest, practical browsing experience.')+`<section class="section"><div class="container"><div class="feature-row"><div><div class="eyebrow">THE DESIGN</div><h2>SHARP. FAST. FUNCTIONAL.</h2></div><p class="section-lead">Black, metallic graphite and unmistakable performance orange — a digital identity designed around precision and clarity.</p></div><div class="feature-row"><div><div class="eyebrow">THE PLATFORM</div><h2>CLOUDFLARE AT ITS CORE.</h2></div><p class="section-lead">This separate public preview uses a Cloudflare Worker with D1 for catalogue data. Backend health, browsing and filtering are tested independently of the legacy Supabase admin system.</p></div><div class="feature-row"><div><div class="eyebrow">THE STATUS</div><h2>BUILDING, NOT SELLING.</h2></div><p class="section-lead">Demonstration products and illustrative prices are never represented as real inventory. Authentication, payment and fulfillment remain disabled until verified.</p></div><div style="margin-top:45px"><a data-nav href="/catalog" class="btn btn-primary">EXPLORE THE PREVIEW ↗</a></div></div></section>`;}
function renderRoute(shouldScroll=true){
  if(window.AutoPro3D) window.AutoPro3D.unmount();
  const path=decodeURI(location.pathname).replace(/\/+$/,'')||'/';
  if(path==='/'||path==='/home'){home();document.title='AutoPro — Performance Parts · Preview';}
  else if(path==='/catalog'||path==='/products'){catalogue();document.title='Parts Catalogue — AutoPro Preview';}
  else if(path==='/categories'){categoryPage();document.title='Categories — AutoPro Preview';}
  else if(path==='/cart'){cartPage();document.title='My Selection — AutoPro Preview';}
  else if(path==='/about'){aboutPage();document.title='The AutoPro Concept';}
  else if(path.startsWith('/product/')){detailPage(path.slice('/product/'.length));document.title='Product Details — AutoPro Preview';}
  else{main.innerHTML=intro('ERROR 404','THIS ROAD <span class="accent">ENDS HERE.</span>','The route you requested is not part of the AutoPro preview.')+'<section class="section"><div class="container"><a href="/" data-nav class="btn btn-primary">BACK HOME ↗</a></div></section>';}
  document.querySelectorAll('.desktop-nav a').forEach(x=>x.classList.toggle('active',x.getAttribute('href')===path));
  updateCount();
  const sceneCanvas=document.getElementById('brake-canvas');
  if(sceneCanvas && window.AutoPro3D) window.AutoPro3D.mount(sceneCanvas);
  if(shouldScroll)scrollTo({top:0,behavior:'instant'});
}
function go(href){if(!href)return;const url=new URL(href,location.href);if(url.origin!==location.origin)return;history.pushState({},'',url.pathname+url.search);detailQuantity=1;renderRoute();}
function closeMenu(){document.getElementById('mobile-nav').hidden=true;document.getElementById('menu-toggle').setAttribute('aria-expanded','false');document.getElementById('menu-toggle').setAttribute('aria-label','Open menu');}
document.addEventListener('click',event=>{
  const anchor=event.target.closest('a[data-nav]');
  if(anchor&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();closeMenu();go(anchor.getAttribute('href'));return;}
  const explode=event.target.closest('[data-explode]');
  if(explode){
    const expanded=window.AutoPro3D?.toggleExploded()??false;
    explode.setAttribute('aria-pressed',String(expanded));
    const label=explode.querySelector('[data-explode-label]');
    if(label)label.textContent=expanded?'ASSEMBLED VIEW':'EXPLODED VIEW';
    return;
  }
  const add=event.target.closest('[data-add]');
  if(add){addItem(add.dataset.add);return;}
  const detailAdd=event.target.closest('[data-detail-add]');
  if(detailAdd){addItem(detailAdd.dataset.detailAdd,detailQuantity);return;}
  const delta=event.target.closest('[data-detail-delta]');
  if(delta){detailQuantity=Math.max(1,Math.min(6,detailQuantity+Number(delta.dataset.detailDelta)));const slug=location.pathname.split('/').pop();detailPage(slug);return;}
  const qty=event.target.closest('[data-qty]');
  if(qty){editQty(qty.dataset.qty,Number(qty.dataset.step));return;}
  const remove=event.target.closest('[data-remove]');
  if(remove){cart=cart.filter(item=>item.slug!==remove.dataset.remove);saveCart();renderRoute(false);return;}
  const toggle=event.target.closest('[data-toggle-demo]');
  if(toggle){showDemo=!showDemo;cart=cart.filter(item=>!item.demo);saveCart();renderRoute(false);return;}
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='hero-search'&&event.target.id!=='catalog-search')return;
  event.preventDefault();
  const data=new FormData(event.target), search=String(data.get('search')||'').trim().slice(0,80);
  if(event.target.id==='hero-search'){go('/catalog'+(search?'?search='+encodeURIComponent(search):''));return;}
  const params=new URLSearchParams();
  if(search)params.set('search',search);
  if(data.get('category')&&data.get('category')!=='all')params.set('category',String(data.get('category')));
  if(data.get('sort')&&data.get('sort')!=='featured')params.set('sort',String(data.get('sort')));
  go('/catalog'+(params.toString()?'?'+params.toString():''));
});
window.addEventListener('popstate',()=>renderRoute(false));
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){cart=loadCart();if(location.pathname==='/cart')renderRoute(false);else updateCount();}});
document.getElementById('menu-toggle').addEventListener('click',()=>{
  const nav=document.getElementById('mobile-nav'),expanded=nav.hidden;
  nav.hidden=!expanded;
  document.getElementById('menu-toggle').setAttribute('aria-expanded',String(expanded));
  document.getElementById('menu-toggle').setAttribute('aria-label',expanded?'Close menu':'Open menu');
});
(async()=>{await loadCatalog();renderRoute(false);})();
})();