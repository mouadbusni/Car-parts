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
const PHOTOS={hero:'/media/hero.webp',brakes:'/media/brakes.webp',wheels:'/media/wheels.webp',lighting:'/media/lighting.webp',drive:'/media/drive.webp'};
function photoFor(product){
  const category=String(product.category_id||'').toLowerCase();
  const art=String(product.art||'');
  if(art==='rotor'||art==='caliper'||category.includes('brake'))return PHOTOS.brakes;
  if(art==='coilover'||category.includes('suspension'))return PHOTOS.wheels;
  if(art==='filter'||art==='cooler'||category.includes('engine'))return PHOTOS.lighting;
  if(art==='exhaust'||category.includes('exhaust'))return PHOTOS.drive;
  return PHOTOS.drive;
}
function photoForCategory(category){
  const id=String(category.id||'').toLowerCase();
  if(id.includes('brake'))return PHOTOS.brakes;
  if(id.includes('suspension'))return PHOTOS.wheels;
  if(id.includes('engine'))return PHOTOS.lighting;
  if(id.includes('exhaust'))return PHOTOS.drive;
  return PHOTOS.hero;
}
function artwork(product){return artSvg(product.art||(/brake|rotor/i.test(product.name)?'rotor':/suspension|coilover/i.test(product.name)?'coilover':/filter/i.test(product.name)?'filter':/exhaust/i.test(product.name)?'exhaust':'cooler'))}
function intro(eyebrow,title,lead){return `<section class="page-top"><div class="container"><div class="bread"><a href="/" data-nav>HOME</a> &nbsp;/&nbsp; <b>${esc(eyebrow)}</b></div><div class="eyebrow">${esc(eyebrow)}</div><h1>${title}</h1><p>${esc(lead)}</p></div></section>`;}
function notice(){
  if(serviceStatus==='unavailable')return `<div class="notice" role="status"><strong>STAGING DATA SERVICE UNAVAILABLE.</strong> Demo products are for interface testing only. No actual inventory is being shown.</div>`;
  if(demoMode)return `<div class="notice" role="status"><strong>DEMO CATALOGUE · EXAMPLE PRODUCTS ONLY.</strong> AutoPro's Cloudflare D1 database is connected but contains no verified product inventory. Every visible item and price is a demonstration—not an offer for sale. <button type="button" data-toggle-demo style="color:#c8e3ff;text-decoration:underline;border:0;background:none;padding:0">${showDemo?'Hide demo items':'Show demo items'}</button></div>`;
  return `<div class="notice" role="status"><strong>STAGING MODE.</strong> Product listings come from the AutoPro D1 API. Prices and stock are not validated for checkout; orders remain disabled.</div>`;
}
function card(p,i=0){
  const image=photoFor(p);
  return `<article class="product-card" data-testid="product-card">
    <a data-nav href="/product/${encodeURIComponent(p.slug)}" class="product-art" aria-label="View ${esc(p.name)}">
      <img src="${image}" alt="Automotive editorial photo used for the component preview, not an image of the actual item" loading="lazy" width="900" height="1050">
      <span class="product-badge">${p.demo?'DEMO / NOT FOR SALE':'STAGING CATALOG'}</span>
      <span class="product-code">REF / ${String(i+1).padStart(2,'0')}</span>
    </a>
    <div class="product-content">
      <span class="product-brand">${esc(p.brand||'AUTOPRO')}</span>
      <a data-nav href="/product/${encodeURIComponent(p.slug)}"><h3>${esc(p.name)}</h3></a>
      <p>${esc(p.description||'Explore the component and its technical information.')}</p>
      <div class="product-bottom"><div><div class="price">${money(p.price)}</div><div class="price-note">${p.demo?'ILLUSTRATIVE / NOT A QUOTE':'STAGING AMOUNT / UNVERIFIED'}</div></div>
        <button type="button" class="btn btn-primary" data-add="${esc(p.slug)}" aria-label="Add ${esc(p.name)} to preview selection">SAVE <span class="arrow">+</span></button>
      </div>
    </div>
  </article>`;
}

function categoryCard(c,i){
 const number=String(i+1).padStart(2,'0');
 return `<a href="/catalog?category=${encodeURIComponent(c.id)}" data-nav class="category-card" aria-label="Browse ${esc(c.name)}">
    <img class="category-image" src="${photoForCategory(c)}" alt="Automotive editorial detail photograph" loading="lazy" width="900" height="1000">
    <span class="category-number">SYSTEM / ${number}</span><span class="category-symbol">${number}</span>
    <h3>${esc(c.name)}</h3><span class="category-link">EXPLORE SYSTEM <b>↗</b></span>
  </a>`;
}

function home(){
  const featured=activeProducts().slice(0,3);
  const systems=activeCategories().slice(0,3);
  main.innerHTML=`
  <section class="hero" data-version="cinematic-photo-v3">
    <div class="hero-background"><img src="${PHOTOS.drive}" alt="Silver performance coupe photographed at night in an urban environment" width="1400" height="930" fetchpriority="high"></div>
    <div class="container hero-inner">
      <div class="hero-copy">
        <div class="hero-kicker">AUTOPRO <span>/</span> PERFORMANCE COMPONENTS — STUDIO 001</div>
        <h1 class="hero-title">Built for<br>what <em>moves</em><br><span class="stroke">you.</span></h1>
        <p class="hero-text">Precision lives in the details. Discover the parts, the engineering, and the passion behind every drive.</p>
        <div class="hero-actions">
          <a data-nav href="/catalog" class="btn btn-primary">EXPLORE THE PARTS <span class="arrow" aria-hidden="true">↗</span></a>
          <a data-nav href="/about" class="btn btn-outline">DISCOVER AUTOPRO <span class="arrow" aria-hidden="true">→</span></a>
        </div>
        <div class="hero-note">CURATED AUTOMOTIVE EXPERIENCE / DESIGN PREVIEW ONLY</div>
      </div>
      <div class="hero-bottom"><span>AP/001 — AUTOMOTIVE DESIGN STUDY</span><span class="scroll-indicator">SCROLL TO DISCOVER</span></div>
    </div>
  </section>
  <section class="quick-search" aria-label="Quick product search">
    <div class="container quick-search-inner">
      <div class="quick-search-heading">Find your component.<span>THE RIGHT PART STARTS HERE.</span></div>
      <form id="hero-search" role="search"><label for="quick-part-search" class="sr-only">Search parts</label><input id="quick-part-search" name="search" type="search" maxlength="80" placeholder="Search performance parts..." required><button aria-label="Submit product search" type="submit">↗</button></form>
      <a data-nav href="/categories" class="quick-search-cta">BROWSE SYSTEMS ↗</a>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-heading"><div><div class="eyebrow">01 / A DIFFERENT PERSPECTIVE</div><h2 class="section-title">Built around<br><span class="accent">the details.</span></h2></div><p class="section-lead">The best builds start with curiosity. Explore components through the textures, craftsmanship, and engineering that make cars extraordinary.</p></div>
      <div class="photo-duo">
        <div class="photo-duo-left"><img src="${PHOTOS.brakes}" loading="lazy" alt="Detailed close-up of a performance brake rotor and red caliper" width="1200" height="1800"><div class="photo-caption"><b>Engineering, up close.</b><span>01 / BRAKING</span></div></div>
        <div class="photo-duo-right"><img src="${PHOTOS.wheels}" loading="lazy" alt="Photograph of a performance wheel under cool blue lighting" width="1200" height="1800"><div class="photo-caption"><b>Nothing overlooked.</b><span>02 / PRECISION</span></div></div>
      </div>
      <div style="padding:17px 0;color:#91a79b;font:500 10px var(--mono);letter-spacing:.03em">EDITORIAL PHOTOGRAPHY · BRAND REFERENCES, NOT AUTOPRO INVENTORY</div>
    </div>
  </section>
  <section class="section alt">
    <div class="container">
      <div class="section-heading"><div><div class="eyebrow">02 / EXPLORE THE SYSTEMS</div><h2 class="section-title">Every component.<br><span class="accent">A purpose.</span></h2></div><a data-nav class="inline-link" href="/categories">VIEW ALL CATEGORIES <span class="arrow">↗</span></a></div>
      ${notice()}
      <div class="category-gallery">${systems.length?systems.map((c,i)=>`<a data-nav href="/catalog?category=${encodeURIComponent(c.id)}" class="category-photo"><img src="${photoForCategory(c)}" loading="lazy" width="900" height="1200" alt="Automotive component photography, editorial reference"><div class="category-info"><span class="category-label">0${i+1} / COMPONENT SYSTEM</span><h3>${esc(c.name)}</h3><span class="link">EXPLORE SYSTEM ↗</span></div></a>`).join(''):'<div class="empty-state"><h2>THE SYSTEMS ARE BEING PREPARED.</h2><p>The verified database is currently empty.</p></div>'}</div>
    </div>
  </section>
  <section class="section" style="padding-bottom:0">
    <div class="container"><div class="section-heading"><div><div class="eyebrow">03 / OUR APPROACH</div><h2 class="section-title">Performance is<br><span class="accent">personal.</span></h2></div><p class="section-lead">Not just another parts grid. A clear experience built to make discovering the next component as rewarding as installing it.</p></div></div>
    <div class="container"><div class="metrics"><div class="metric"><span class="metric-index">01 / SEARCH</span><div class="metric-num">Find the right details.</div><div class="metric-label">Focused search, category filtering and useful product information.</div></div><div class="metric"><span class="metric-index">02 / DISCOVER</span><div class="metric-num">Explore every system.</div><div class="metric-label">Browsable components organized around real automotive systems.</div></div><div class="metric"><span class="metric-index">03 / COLLECT</span><div class="metric-num">Build your selection.</div><div class="metric-label">A private browser-local shortlist for comparing your next choices.</div></div></div></div>
  </section>
  <section class="section">
    <div class="container"><div class="section-heading"><div><div class="eyebrow">04 / THE COMPONENT INDEX</div><h2 class="section-title">Explore the<br><span class="accent">catalogue.</span></h2></div><a data-nav href="/catalog" class="inline-link">SEE ALL COMPONENTS <span class="arrow">↗</span></a></div>
      ${notice()}
      <div class="product-grid">${featured.length?featured.map(card).join(''):'<div class="empty-state"><h2>NO VERIFIED PARTS YET</h2><p>AutoPro product data has not been imported.</p><a class="btn btn-outline" href="/catalog" data-nav>BROWSE CATALOGUE</a></div>'}</div>
    </div>
  </section>
  <section class="spotlight">
    <div class="spotlight-media"><img src="${PHOTOS.lighting}" loading="lazy" width="1200" height="900" alt="Close-up LED headlight on a high-performance sports car"></div>
    <div class="spotlight-copy"><div class="eyebrow">05 / THE AUTOPRO PHILOSOPHY</div><h2>More than<br>the machine.</h2><p>For people who know a car is more than transport. It is design, precision and personality—built one detail at a time.</p><a data-nav href="/about" class="inline-link">LEARN ABOUT THE CONCEPT ↗</a></div>
  </section>
  `;
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
  main.innerHTML=`<section class="page-top"><div class="container"><div class="bread"><a data-nav href="/">HOME</a> / <a data-nav href="/catalog">CATALOG</a> / <b>${esc(p.name)}</b></div><div class="eyebrow">COMPONENT INSPECTION</div><h1>THE <span class="accent">DETAILS.</span></h1></div></section><section class="section"><div class="container">${notice()}<div class="detail-layout"><div class="detail-art"><img src="${photoFor(p)}" alt="Automotive editorial reference photograph, not a picture of the exact product" width="1000" height="1200"><span class="detail-badge">${p.demo?'DEMO PRODUCT — NOT FOR SALE':'STAGING CATALOG ITEM'}</span></div><div class="detail-body"><div class="eyebrow">${esc(p.brand||'AUTOPRO')} / ${esc(p.sku)}</div><h1>${esc(p.name)}</h1><p class="description">${esc(p.description||'Component details are being prepared.')}</p><div class="divider"></div><div class="detail-price">${money(p.price)}</div><p class="subtle">${p.demo?'ILLUSTRATIVE AMOUNT ONLY — NO ACTUAL INVENTORY':'STAGING CATALOGUE — NO CHECKOUT ENABLED'}</p><div class="qty-row"><div class="qty-stepper"><button aria-label="Decrease quantity" data-detail-delta="-1" ${detailQuantity<=1?'disabled':''}>−</button><output id="detail-qty">${detailQuantity}</output><button aria-label="Increase quantity" data-detail-delta="1" ${detailQuantity>=6?'disabled':''}>+</button></div><button type="button" data-detail-add="${esc(p.slug)}" class="btn btn-primary">ADD TO PREVIEW SELECTION ↗</button></div><a data-nav href="/cart" class="inline-link">VIEW MY SELECTION <span class="arrow">↗</span></a><div class="detail-specs">${specs.map(([k,v])=>`<div class="spec-item"><span>${esc(k.toUpperCase())}</span><strong>${esc(v)}</strong></div>`).join('')}</div></div></div></div></section>`;
}
function cartPage(){
  const valid=cart.map(c=>({line:c,product:activeProducts().find(p=>p.slug===c.slug)})).filter(x=>x.product);
  const count=valid.reduce((n,x)=>n+x.line.qty,0);
  const subtotal=valid.reduce((n,x)=>n+x.line.qty*x.product.price,0);
  main.innerHTML=intro('MY SELECTION','THE PREVIEW <span class="accent">CART.</span>','Make a personal shortlist, adjust quantities and revisit your selection. Orders and payments are not available.')+`<section class="section"><div class="container">${notice()}${valid.length?`<div class="cart-layout"><div class="cart-list">${valid.map(({line,product:p})=>`<article class="cart-line" data-testid="cart-item"><div class="cart-visual"><img src="${photoFor(p)}" alt="Automotive editorial reference" loading="lazy" width="200" height="200"></div><div class="cart-line-body"><h3>${esc(p.name)}</h3><p>${p.demo?'DEMO ITEM — NOT FOR SALE':'STAGING ITEM'} · ${esc(p.brand)}</p><div class="cart-qty"><button type="button" aria-label="Decrease ${esc(p.name)} quantity" data-qty="${esc(p.slug)}" data-step="-1">−</button><strong>${line.qty}</strong><button type="button" aria-label="Increase ${esc(p.name)} quantity" data-qty="${esc(p.slug)}" data-step="1" ${line.qty>=6?'disabled':''}>+</button><button type="button" class="remove-btn" data-remove="${esc(p.slug)}">REMOVE</button></div></div><div class="price">${money(p.price*line.qty)}</div></article>`).join('')}</div><aside class="cart-summary"><h2>SELECTION SUMMARY</h2><div class="summary-row"><span>ITEMS</span><strong>${count}</strong></div><div class="summary-row"><span>SUBTOTAL PREVIEW</span><strong>${money(subtotal)}</strong></div><div class="total-row"><span>ILLUSTRATIVE TOTAL</span><span>${money(subtotal)}</span></div><p class="summary-note">This amount is for UI demonstration only. Items are stored in your browser; no payment, shipping or order processing exists.</p><button disabled type="button" class="btn">CHECKOUT NOT AVAILABLE</button><a data-nav href="/catalog" class="inline-link" style="margin-top:25px">CONTINUE BROWSING <span class="arrow">↗</span></a></aside></div>`:`<div class="empty-state" data-testid="empty-cart"><div class="empty-icon">0</div><h2>NOTHING SAVED YET.</h2><p>Explore the AutoPro catalogue and add example components to test your personal selection.</p><a href="/catalog" data-nav class="btn btn-primary">EXPLORE COMPONENTS ↗</a></div>`}</div></section>`;
}
function aboutPage(){main.innerHTML=intro('THE AUTOPRO APPROACH','DRIVEN BY <span class="accent">DETAIL.</span>','A photographic performance-parts concept that puts component design and clear product information first.')+`<section class="section"><div class="container"><div class="photo-duo"><div class="photo-duo-left"><img src="${PHOTOS.hero}" alt="Automotive editorial photograph of a performance sedan on the road" loading="lazy" width="1500" height="1000"><div class="photo-caption"><b>Made for motion.</b><span>01 / PURPOSE</span></div></div><div class="photo-duo-right"><img src="${PHOTOS.brakes}" alt="Close-up photograph of a drilled brake rotor" loading="lazy" width="900" height="1200"><div class="photo-caption"><b>Built on detail.</b><span>02 / PRECISION</span></div></div></div><div class="feature-row" style="margin-top:68px"><div><div class="eyebrow">01 / IDENTITY</div><h2>A DIFFERENT<br>TYPE OF DRIVE.</h2></div><p class="section-lead">Graphite, dark mineral tones and understated metallic accents. A visual system built around the parts—not around decoration.</p></div><div class="feature-row"><div><div class="eyebrow">02 / FOUNDATION</div><h2>REAL BROWSING.<br>HONEST PREVIEWS.</h2></div><p class="section-lead">The public catalog is backed by a separate Cloudflare D1 database. Until real products are imported, any examples shown are labeled as demonstrations.</p></div><div class="feature-row"><div><div class="eyebrow">03 / WHAT'S NEXT</div><h2>AN EXPERIENCE<br>IN PROGRESS.</h2></div><p class="section-lead">This stage does not accept orders or payments. Real inventory, authorization and checkout will follow only after independent validation.</p></div><div style="margin-top:45px"><a data-nav href="/catalog" class="btn btn-primary">BROWSE COMPONENTS ↗</a></div></div></section>`}
function renderRoute(shouldScroll=true){
  
  const path=decodeURI(location.pathname).replace(/\/+$/,'')||'/';
  if(path==='/'||path==='/home'){home();document.title='AutoPro — Made for the Drive | Cinematic Preview';}
  else if(path==='/catalog'||path==='/products'){catalogue();document.title='Parts Catalogue — AutoPro Preview';}
  else if(path==='/categories'){categoryPage();document.title='Categories — AutoPro Preview';}
  else if(path==='/cart'){cartPage();document.title='My Selection — AutoPro Preview';}
  else if(path==='/about'){aboutPage();document.title='The AutoPro Concept';}
  else if(path.startsWith('/product/')){detailPage(path.slice('/product/'.length));document.title='Product Details — AutoPro Preview';}
  else{main.innerHTML=intro('ERROR 404','THIS ROAD <span class="accent">ENDS HERE.</span>','The route you requested is not part of the AutoPro preview.')+'<section class="section"><div class="container"><a href="/" data-nav class="btn btn-primary">BACK HOME ↗</a></div></section>';}
  document.querySelectorAll('.desktop-nav a').forEach(x=>x.classList.toggle('active',x.getAttribute('href')===path));
  updateCount();
  
  if(shouldScroll)scrollTo({top:0,behavior:'instant'});
}
function go(href){if(!href)return;const url=new URL(href,location.href);if(url.origin!==location.origin)return;history.pushState({},'',url.pathname+url.search);detailQuantity=1;renderRoute();}
function closeMenu(){document.getElementById('mobile-nav').hidden=true;document.getElementById('menu-toggle').setAttribute('aria-expanded','false');document.getElementById('menu-toggle').setAttribute('aria-label','Open menu');}
document.addEventListener('click',event=>{
  const anchor=event.target.closest('a[data-nav]');
  if(anchor&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();closeMenu();go(anchor.getAttribute('href'));return;}
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