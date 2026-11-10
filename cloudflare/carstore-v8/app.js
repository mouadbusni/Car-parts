(function(){
'use strict';
const main=document.getElementById('main');
const toastEl=document.getElementById('toast');
const SAVE_KEY='autopro:carstore-v8:saved';
const categories=[
{id:'lighting',name:'HEADLIGHTS',title:'HEADLIGHTS',description:'Projectors, lighting and detail.',art:'headlight'},
{id:'brakes',name:'BRAKING SYSTEMS',title:'BRAKING SYSTEMS',description:'Rotors, calipers, braking.',art:'caliper'},
{id:'wheels',name:'ALLOY WHEELS',title:'ALLOY WHEELS',description:'Style, stance and performance.',art:'wheel'},
{id:'seats',name:'SPORT SEATS',title:'SPORT SEATS',description:'Driver-focused comfort.',art:'seat'}
];
const products=[
{id:'ap-demo-01',slug:'performance-led-headlight',name:'Performance LED Headlight',category:'lighting',price:300,art:'headlight',description:'Modern projector headlight concept.'},
{id:'ap-demo-02',slug:'sport-brake-caliper',name:'Sport Brake Caliper',category:'brakes',price:275,art:'caliper',description:'Performance-style caliper component.'},
{id:'ap-demo-03',slug:'racing-bucket-seat',name:'Racing Bucket Seat',category:'seats',price:320,art:'seat',description:'Sport bucket seat design illustration.'},
{id:'ap-demo-04',slug:'vented-performance-rotor',name:'Vented Performance Rotor',category:'brakes',price:189,art:'rotor',description:'Vented brake-disc design study.'},
{id:'ap-demo-05',slug:'forged-alloy-wheel',name:'Forged Alloy Wheel',category:'wheels',price:350,art:'wheel',description:'Multi-spoke alloy wheel visual concept.'},
{id:'ap-demo-06',slug:'headlight-projector-set',name:'LED Projector Set',category:'lighting',price:245,art:'headlight',description:'Pair of compact headlight projector components.'}
];
let saved=loadSaved();
function loadSaved(){try{const x=JSON.parse(localStorage.getItem(SAVE_KEY)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'&&products.some(p=>p.slug===v)).slice(0,6):[]}catch{return []}}
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function usd(n){return '$'+Number(n).toFixed(2)}
function updateSaved(){const count=saved.length;for(const el of [document.getElementById('saved-count'),document.getElementById('top-saved-count')])if(el)el.textContent=String(count)}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(saved))}catch{}updateSaved()}
function toast(msg){toastEl.textContent=msg;toastEl.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>toastEl.hidden=true,2800)}
function icon(name){
const data={heart:'<path d="M12 21 4.6 13.7a4.7 4.7 0 0 1 6.6-6.6L12 8l.8-.9a4.7 4.7 0 0 1 6.6 6.6Z"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>'};
return '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+data[name]+'</svg>';
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

function extraArt(kind){
if(kind==='headlight')return '<svg role="img" aria-label="Illustration of a modern car headlight" viewBox="0 0 420 290"><defs><linearGradient id="hdg" x1="0" x2="1"><stop stop-color="#050507"/><stop offset=".45" stop-color="#a5a8ae"/><stop offset=".7" stop-color="#25272b"/><stop offset="1" stop-color="#d4d7da"/></linearGradient><linearGradient id="glass" x1="0" x2="1"><stop stop-color="#15171a"/><stop offset=".48" stop-color="#474d50"/><stop offset="1" stop-color="#1c1e20"/></linearGradient></defs><ellipse cx="210" cy="250" rx="157" ry="16" fill="#050505" opacity=".55"/><path d="M34 127C120 81 267 54 379 97L391 161Q278 209 54 197Z" fill="url(#hdg)" stroke="#cacbcb" stroke-width="6"/><path d="M61 135C166 93 283 82 367 114L377 150Q242 196 70 179Z" fill="url(#glass)" stroke="#0a0a0c" stroke-width="5"/><circle cx="138" cy="143" r="36" stroke="#dadcdd" stroke-width="11" fill="#111416"/><circle cx="138" cy="143" r="18" fill="#b2cadb"/><circle cx="230" cy="135" r="32" stroke="#f4f6f5" stroke-width="10" fill="#15171a"/><circle cx="230" cy="135" r="15" fill="#aebcc5"/><path d="M292 128L357 121 359 151 298 159Z" fill="#e18f31" stroke="#ffc16a" stroke-width="3"/><path d="M80 171Q193 203 348 157" stroke="#d6e3f0" stroke-width="4" fill="none"/></svg>';
if(kind==='wheel')return '<svg role="img" aria-label="Illustration of an alloy wheel" viewBox="0 0 420 310"><defs><radialGradient id="rim"><stop stop-color="#9c9e9e"/><stop offset=".27" stop-color="#232428"/><stop offset=".65" stop-color="#5c6063"/><stop offset=".93" stop-color="#1b1e23"/></radialGradient></defs><ellipse cx="228" cy="286" rx="123" ry="15" fill="black" opacity=".7"/><circle cx="223" cy="145" r="133" fill="#0a0a0d" stroke="#393b3c" stroke-width="14"/><circle cx="223" cy="145" r="116" fill="url(#rim)" stroke="#adb0b0" stroke-width="5"/><circle cx="223" cy="145" r="102" fill="#17191e" stroke="#3b424a" stroke-width="3"/>'+Array.from({length:10},(_,i)=>'<path d="M212 133 190 55 204 46 224 128Z" transform="rotate('+(i*36)+' 223 145)" fill="#767d83" stroke="#b6b9bb" stroke-width="1.5"/>').join('')+'<circle cx="223" cy="145" r="35" fill="#545b61" stroke="#afb2b3" stroke-width="3"/><circle cx="223" cy="145" r="16" fill="#151719" stroke="#e2263f" stroke-width="3"/></svg>';
if(kind==='seat')return '<svg role="img" aria-label="Illustration of a racing bucket seat" viewBox="0 0 420 310"><defs><linearGradient id="st"><stop stop-color="#161619"/><stop offset=".4" stop-color="#5f6268"/><stop offset="1" stop-color="#111215"/></linearGradient></defs><ellipse cx="212" cy="291" rx="121" ry="13" fill="black" opacity=".56"/><g transform="translate(85 8)"><path d="M85 20Q105 1 129 18L145 30Q176 15 195 37L217 176 191 234 91 249 65 215 45 45Q55 21 85 20Z" fill="url(#st)" stroke="#686b70" stroke-width="7"/><path d="M88 40Q122 28 156 51L181 183 157 213 113 223 88 204 73 59Z" fill="#3a3b40" stroke="#df273d" stroke-width="6"/><path d="M116 54 132 60 154 191 128 198Z" fill="#a61931"/><path d="M65 200 99 217 182 210 206 224 181 262 91 279 41 258Z" fill="#26272b" stroke="#66676b" stroke-width="6"/><path d="M88 226 171 219 157 254 98 260Z" fill="#ab2338"/><path d="M68 75 95 66M159 72 182 85" stroke="#bdc0c1" stroke-width="10"/><path d="M104 56 149 68" stroke="#18191d" stroke-width="7"/></g></svg>';
return artSvg(kind);
}
function visual(kind){return extraArt(kind).replace(/#719ff0|#6ea5f4|#457cd9|#b6d7ff|#2b599b|#6e9bd6|#a3c2e8|#1b355c|#6da7ec|#3166ad|#102b4e|#508dc9|#b4d4ff|#7fb5ed|#2b599b|#588dc4|#78afe4|#6c99cc/gi,'#d82b41')}
function tile(c,i){return '<a data-nav href="/catalog?category='+encodeURIComponent(c.id)+'" class="category-tile" aria-label="Browse '+esc(c.title)+'"><div class="category-copy"><h2>'+esc(c.title)+'</h2><p>'+esc(c.description)+'</p><span class="category-cta">EXPLORE CATEGORY <span>→</span></span></div><div class="category-image">'+visual(c.art)+'</div><span class="category-number">0'+(i+1)+' / 04</span></a>'}
function productCard(p,i){const added=saved.includes(p.slug);return '<article class="product-card" data-testid="product-card"><a href="/product/'+p.slug+'" data-nav class="product-visual" aria-label="View '+esc(p.name)+'"><span class="photo-flag">CONCEPT / '+String(i+1).padStart(2,'0')+'</span>'+visual(p.art)+'</a><div class="product-info"><span class="product-category">'+esc(categories.find(c=>c.id===p.category)?.title||'PARTS')+'</span><a data-nav href="/product/'+p.slug+'"><h3>'+esc(p.name)+'</h3></a><div class="product-price">'+usd(p.price)+'</div><span class="price-note">SAMPLE PRICE</span><button class="product-action" type="button" data-save="'+p.slug+'" aria-label="'+(added?'Remove':'Save')+' '+esc(p.name)+'">'+(added?'♥ SAVED':'♡ SAVE ITEM')+'</button></div></article>'}
function showHome(){
const features=[products[0],products[1],products[2],products[3],products[4]];
main.innerHTML='<section class="hero" data-version="autopro-carstore-v8"><img src="/media/hero.webp" alt="Cinematic photograph of a performance sports car" fetchpriority="high" width="1500" height="800"><span class="hero-overlay-label"><i></i> AUTOPRO / AUTOMOTIVE PARTS</span></section>'+
'<section id="categories" aria-label="Automotive part categories" class="category-grid">'+categories.map(tile).join('')+'</section>'+
'<section class="featured" id="featured"><div class="shell"><div class="section-heading"><h2>FEATURED PRODUCTS</h2></div><div class="featured-grid">'+features.map(productCard).join('')+'</div><div class="featured-more"><a href="/catalog" data-nav>VIEW ALL PARTS →</a></div></div></section>'+
'<section class="promo" id="promo"><img src="/media/drive.webp" alt="Automotive editorial photography" loading="lazy" width="1500" height="600"><div class="promo-panel"><span class="promo-label">BUILT FOR ENTHUSIASTS</span><h2>DRIVE BETTER</h2><div class="promo-sub">EXPLORE THE COLLECTION</div><p>Thoughtful components. Performance design.</p><a data-nav class="red-pill" href="/catalog">EXPLORE NOW</a></div><div class="promo-panel"><span class="promo-label">PRECISION MEETS STYLE</span><h2>MAKE IT YOURS</h2><div class="promo-sub">FIND YOUR NEXT DETAIL</div><p>Concept showcase · No active discounts or orders.</p><a data-nav class="red-pill" href="/categories">VIEW CATEGORIES</a></div></section>';
}
function head(title,lead){return '<header class="page-head"><div class="shell"><span class="eyebrow">AUTOPRO / FRONTEND CONCEPT</span><h1>'+esc(title)+'</h1><p>'+esc(lead)+'</p></div></header>'}
function showCatalog(){
const params=new URLSearchParams(location.search),category=params.get('category')||'',q=(params.get('search')||'').toLowerCase().slice(0,80);
const matching=products.filter(p=>(!category||p.category===category)&&(!q||[p.name,p.description,p.category].join(' ').toLowerCase().includes(q)));
main.innerHTML=head('PARTS COLLECTION','Illustrative products for this interactive design preview. Prices are samples; nothing is for sale.')+
'<section class="page-inner"><div class="shell"><form id="catalog-filter" class="filters" role="search"><label for="catalog-search">SEARCH</label><input type="search" id="catalog-search" name="search" placeholder="Search components..." value="'+esc(params.get('search')||'')+'" maxlength="80"><label for="catalog-category">CATEGORY</label><select id="catalog-category" name="category"><option value="">ALL COMPONENTS</option>'+categories.map(c=>'<option value="'+c.id+'"'+(category===c.id?' selected':'')+'>'+esc(c.title)+'</option>').join('')+'</select><button type="submit">FILTER PARTS</button></form><p class="catalog-status">'+matching.length+' example components · No real inventory or checkout</p>'+(matching.length?'<div class="catalog-grid">'+matching.map(productCard).join('')+'</div>':'<div class="empty-state"><h2>NO MATCHING COMPONENTS</h2><p>Try another search or category.</p></div>')+'</div></section>';
}
function showCategories(){
main.innerHTML=head('EXPLORE CATEGORIES','From precision braking to suspension, explore our concept component groups.')+'<section class="page-inner"><div class="shell category-collection">'+categories.map(tile).join('')+'</div></section>';
}
function showProduct(slug){
const p=products.find(x=>x.slug===slug);
if(!p){showNotFound();return;}
main.innerHTML=head('PRODUCT DETAIL','A sample part shown for design demonstration only.')+'<section class="page-inner"><div class="shell detail-layout"><div class="detail-preview"><span class="demo-watermark">TECHNICAL ILLUSTRATION · NOT A PRODUCT PHOTOGRAPH</span>'+visual(p.art)+'</div><div class="detail-info"><span class="eyebrow">'+esc(categories.find(c=>c.id===p.category)?.title||'AUTO PART')+'</span><h1>'+esc(p.name)+'</h1><p>'+esc(p.description)+'</p><div class="detail-price">'+usd(p.price)+'</div><p>Sample price only. This product cannot be purchased.</p><button type="button" data-save="'+p.slug+'">'+(saved.includes(p.slug)?'REMOVE FROM SAVED':'♡ SAVE COMPONENT')+'</button><div class="spec-list"><div><span>Reference</span><strong>'+p.id.toUpperCase()+'</strong></div><div><span>Category</span><strong>'+esc(p.category.toUpperCase())+'</strong></div><div><span>Availability</span><strong>CONCEPT ONLY</strong></div></div></div></div></section>';
}
function showSaved(){
const items=products.filter(p=>saved.includes(p.slug));
main.innerHTML=head('MY SAVED PARTS','Your shortlist is saved only in this browser. No ordering or payments are available.')+'<section class="page-inner"><div class="shell">'+(items.length?'<div class="saved-grid">'+items.map(productCard).join('')+'</div><p class="catalog-status">SAVED LOCALLY · NOTHING HAS BEEN ORDERED</p>':'<div class="empty-state"><h2>YOUR SHORTLIST IS EMPTY</h2><p>Browse parts and use Save Item to keep a local list.</p><a href="/catalog" data-nav class="red-pill">EXPLORE PRODUCTS</a></div>')+'</div></section>';
}
function showAbout(){main.innerHTML=head('ABOUT AUTOPRO','A car-parts storefront interface inspired by classic automotive ecommerce design.')+'<section class="page-inner"><div class="shell about-grid"><img src="/media/brakes.webp" alt="Editorial photograph of automotive braking components" width="680" height="460"><div class="about-copy"><span class="eyebrow">PRECISION IN EVERY DETAIL</span><h2>DESIGNED FOR THE DRIVE.</h2><p>AutoPro is presented here as a frontend-only design concept with a classic charcoal-and-red automotive storefront look. Browse, filter and save illustrated example components.</p><p>This preview has no real inventory, live discounts, accounts, newsletter subscriptions or checkout.</p><a data-nav class="red-pill" href="/catalog">VIEW THE COMPONENTS</a></div></div></section>'}
function showNotFound(){main.innerHTML=head('PAGE NOT FOUND','The requested section does not exist in this design preview.')+'<section class="page-inner"><div class="shell"><a href="/" data-nav class="red-pill">RETURN HOME</a></div></section>'}
function markNav(){const path=location.pathname;document.querySelectorAll('.nav-links a').forEach(a=>{const href=new URL(a.href,location.href);const selected=path==='/'?href.pathname==='/'&&href.hash==='':href.pathname===path&&href.hash==='';a.classList.toggle('current',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
function render(scroll=true){
const path=location.pathname;
if(path==='/'||path==='/home')showHome();
else if(path==='/catalog'||path==='/products')showCatalog();
else if(path==='/categories')showCategories();
else if(path==='/about')showAbout();
else if(path==='/cart')showSaved();
else if(/^\/product\/[a-z0-9-]+$/.test(path))showProduct(path.slice('/product/'.length));
else showNotFound();
updateSaved();markNav();document.title=(path==='/'?'AutoPro':'AutoPro | '+path.split('/').filter(Boolean).pop().replace(/-/g,' '))+' — Automotive Design Preview';
if(scroll)window.scrollTo(0,0);
if(location.hash){const id=location.hash.slice(1);requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:'auto',block:'start'}))}
}
function navigate(url){const next=new URL(url,location.origin);history.pushState({},'',next.pathname+next.search+next.hash);document.getElementById('main-nav').classList.remove('open');document.getElementById('menu-toggle').setAttribute('aria-expanded','false');render()}
document.addEventListener('click',event=>{
const saveBtn=event.target.closest('[data-save]');
if(saveBtn){const slug=saveBtn.dataset.save,p=products.find(p=>p.slug===slug);if(!p)return;saved=saved.includes(slug)?saved.filter(s=>s!==slug):saved.concat(slug);save();toast(saved.includes(slug)?'Saved to your shortlist':'Removed from saved parts');render(false);return;}
const link=event.target.closest('a[data-nav]');
if(link&&link.origin===location.origin&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&event.button===0){
event.preventDefault();navigate(link.href);return;
}
});
document.getElementById('menu-toggle').addEventListener('click',()=>{
const menu=document.getElementById('main-nav'),button=document.getElementById('menu-toggle');const next=!menu.classList.contains('open');menu.classList.toggle('open',next);button.setAttribute('aria-expanded',String(next));
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const menu=document.getElementById('main-nav');menu.classList.remove('open');document.getElementById('menu-toggle').setAttribute('aria-expanded','false')}});
document.getElementById('header-search-button').addEventListener('click',()=>{navigate('/catalog');document.getElementById('catalog-search')?.focus()});
document.addEventListener('submit',event=>{
if(event.target.id==='catalog-filter'){
event.preventDefault();const f=new FormData(event.target);const params=new URLSearchParams();const q=String(f.get('search')||'').trim(),cat=String(f.get('category')||'');if(q)params.set('search',q);if(cat)params.set('category',cat);navigate('/catalog'+(params.size?'?'+params.toString():''));return;
}
if(event.target.id==='newsletter-form'){
event.preventDefault();event.target.reset();toast('Newsletter is not active in this frontend preview. No email was sent.');return;
}
});
window.addEventListener('popstate',()=>render(false));
render();
})();
