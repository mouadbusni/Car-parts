import { test, expect } from '@playwright/test';

async function loadAllImages(page){
  // The catalog and home components render asynchronously after the D1 API resolves.
  await expect(page.locator('[data-version="autopro-refined-v4"]')).toBeVisible();
  await page.evaluate(async()=>{
    for(const img of document.querySelectorAll('img')){
      img.loading='eager';
      img.scrollIntoView({block:'center',behavior:'instant'});
      if(!img.complete)await new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
        setTimeout(resolve,8000);
      });
    }
    window.scrollTo({top:0,behavior:'instant'});
  });
}

test('refined AutoPro identity and useful hero are live',async({page,isMobile})=>{
  await page.goto('/');
  await expect(page.locator('[data-version="autopro-refined-v4"]')).toBeVisible();
  await expect(page.locator('.hero-title')).toContainText('The details');
  await expect(page.locator('.hero-title')).toContainText('drive');
  await expect(page.locator('.hero-background img')).toBeVisible();
  await expect(page.locator('.photo-duo img')).toHaveCount(2);
  await expect(page.locator('.category-gallery .category-photo')).toHaveCount(3);
  await expect(page.locator('.category-gallery .category-visual')).toHaveCount(3);
  await expect(page.locator('.product-card .component-visual')).toHaveCount(3);
  await expect(page.locator('.product-card')).toHaveCount(3);
  await expect(page.getByText('DEMO CATALOGUE').first()).toBeVisible();
  expect(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(11, 17, 27)');
  await expect(page.locator('header .brand-word')).toContainText('Auto');
  if(isMobile)await expect(page.locator('#menu-toggle')).toBeVisible();
  else await expect(page.locator('header .header-cta')).toBeVisible();
  expect(await page.locator('#brake-canvas').count()).toBe(0);
});

test('all editorial photos load and component studies are not mistaken for product photos',async({page,request})=>{
  await page.goto('/');
  await loadAllImages(page);
  const photos=await page.locator('img').evaluateAll(images=>
    images.map(x=>({src:x.getAttribute('src'),width:x.naturalWidth,height:x.naturalHeight,loaded:x.complete}))
  );
  const failed=photos.filter(x=>!x.loaded||x.width<400||x.height<400);
  expect(failed).toEqual([]);
  expect(photos.length).toBeGreaterThanOrEqual(4);
  expect(await page.locator('.product-card .product-art img').count()).toBe(0);
  await expect(page.locator('.product-card .component-visual')).toHaveCount(3);
  for(const name of ['hero','brakes','wheels','lighting','drive']){
    const response=await request.get('/media/'+name+'.webp');
    expect(response.ok(),name).toBe(true);
    expect(response.headers()['content-type']).toContain('image/webp');
    expect((await response.body()).length,name).toBeGreaterThan(25000);
  }
});

test('homepage quick search and catalog filters work',async({page})=>{
  await page.goto('/');
  await page.locator('#quick-part-search').fill('rotor');
  await page.getByRole('button',{name:'Submit product search'}).click();
  await expect(page).toHaveURL(/\/catalog\?search=rotor/);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.goto('/catalog');
  await expect(page.locator('.product-card')).toHaveCount(6);
  await page.getByRole('searchbox',{name:'Search products'}).fill('filter');
  await page.getByRole('button',{name:/APPLY FILTERS/}).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page).toHaveURL(/search=filter/);
});

test('category and product detail pages preserve genuine editorial photos',async({page})=>{
  await page.goto('/categories');
  await expect(page.locator('.category-card')).toHaveCount(4);
  await page.locator('.category-card').first().click();
  await expect(page).toHaveURL(/category=brakes/);
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.getByRole('link',{name:/View Vented Performance Rotor/}).first().click();
  await expect(page).toHaveURL(/\/product\/vented-performance-rotor/);
  await expect(page.locator('.detail-body h1')).toContainText('Vented Performance Rotor');
  await expect(page.locator('.detail-art .component-visual')).toBeVisible();
  await expect(page.locator('.detail-art .component-art svg')).toBeVisible();
  expect(await page.locator('.detail-art .component-visual').getAttribute('aria-label')).toContain('Vented Performance Rotor');
  await expect(page.getByText('DEMO PRODUCT — NOT FOR SALE')).toBeVisible();
});

test('cart remains usable, persistent and cannot checkout',async({page})=>{
  await page.goto('/catalog');
  await page.getByRole('button',{name:/Add Vented Performance Rotor to preview selection/}).click();
  await expect(page.locator('#header-count')).toHaveText('1');
  await page.locator('header .cart-link').click();
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  await page.getByRole('button',{name:'Increase Vented Performance Rotor quantity'}).click();
  await expect(page.locator('.cart-summary').getByText('$378.00')).toHaveCount(2);
  await expect(page.getByRole('button',{name:'CHECKOUT NOT AVAILABLE'})).toBeDisabled();
  await page.getByRole('button',{name:'REMOVE'}).click();
  await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible();
});

test('catalog API contract reports empty inventory without fabricating stock',async({request})=>{
  const health=await request.get('/api/health');
  expect(health.ok()).toBe(true);
  expect((await health.json()).service).toBe('autopro-catalog');
  const products=await request.get('/api/products?limit=4');
  expect(products.ok()).toBe(true);
  expect((await products.json()).data).toHaveLength(0);
});

test('anonymous admin/checkout and public writes remain blocked',async({request})=>{
  for(const path of ['/admin','/dashboard','/login','/signup','/checkout']){
    const response=await request.get(path);
    expect(response.status(),path).toBe(404);
  }
  expect((await request.post('/api/products',{data:{id:'spoofed'}})).status()).toBe(405);
  expect((await request.delete('/api/products/foo')).status()).toBe(405);
  expect((await request.put('/cart',{data:'no'})).status()).toBe(405);
});

test('all six demonstration items use their matching technical part visuals',async({page})=>{
  await page.goto('/catalog');
  const pairs=[
    ['Vented Performance Rotor','brake rotor'],
    ['Adjustable Coilover Unit','coilover'],
    ['Machined Intake Filter','air filter'],
    ['Sport Brake Caliper','brake caliper'],
    ['Performance Intercooler','intercooler'],
    ['Titanium Exhaust Tip','exhaust']
  ];
  await expect(page.locator('.product-card')).toHaveCount(pairs.length);
  for(const [name,type] of pairs){
    const card=page.locator('.product-card').filter({has:page.getByRole('heading',{name})});
    await expect(card.locator('.product-art .component-visual')).toBeVisible();
    expect(await card.locator('.component-art svg').getAttribute('aria-label')).toContain(type);
    expect(await card.locator('.component-visual').getAttribute('aria-label')).toContain(name);
    await expect(card.locator('.product-art img')).toHaveCount(0);
  }
});

test('hiding demo examples keeps saved parts even across reloads',async({page})=>{
  await page.goto('/catalog');
  await page.getByRole('button',{name:/Add Vented Performance Rotor to preview selection/}).click();
  await expect(page.locator('#header-count')).toHaveText('1');
  await page.getByRole('button',{name:'Hide demo items'}).click();
  await expect(page.locator('.product-card')).toHaveCount(0);
  await expect(page.locator('#header-count')).toHaveText('1');
  await page.locator('header .cart-link').click();
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  await expect(page.locator('.cart-line h3')).toHaveText('Vented Performance Rotor');
  await expect(page.locator('.page-top h1')).toContainText('SAVED');
  await page.reload();
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
});

test('mobile homepage category tiles form a readable compact mosaic',async({page,isMobile})=>{
  await page.goto('/');
  const tiles=page.locator('.category-gallery .category-photo');
  await expect(tiles).toHaveCount(3);
  if(!isMobile)return;
  const geometry=await tiles.evaluateAll(elements=>elements.map(el=>{
    const r=el.getBoundingClientRect();
    return {x:r.x,y:r.y,w:r.width,h:r.height};
  }));
  expect(geometry[0].w).toBeGreaterThan(geometry[1].w*1.8);
  expect(Math.abs(geometry[1].y-geometry[2].y)).toBeLessThan(3);
  expect(geometry[1].w).toBeGreaterThan(130);
  expect(geometry[1].h).toBeLessThan(280);
});

test('navigation uses one icon style and highlights the current section',async({page,isMobile})=>{
  await page.goto('/catalog');
  await expect(page.locator('header .brand-symbol svg')).toBeVisible();
  await expect(page.locator('header .cart-link svg')).toBeVisible();
  if(isMobile){
    await page.locator('#menu-toggle').click();
    await expect(page.locator('#mobile-nav a[href="/catalog"]')).toHaveAttribute('aria-current','page');
    await page.locator('#menu-toggle').click();
    await expect(page.locator('#mobile-nav')).toBeHidden();
  }else{
    await expect(page.locator('.desktop-nav a[href="/catalog"]')).toHaveAttribute('aria-current','page');
  }
});

test('desktop and mobile navigation work with no horizontal overflow',async({page,isMobile})=>{
  await page.goto('/');
  if(isMobile){
    await page.locator('#menu-toggle').click();
    await expect(page.locator('#mobile-nav')).toBeVisible();
    await page.locator('#mobile-nav a[href="/catalog"]').click();
    await expect(page.locator('#mobile-nav')).toBeHidden();
  }else{
    await page.locator('.desktop-nav a[href="/catalog"]').click();
  }
  await expect(page).toHaveURL(/\/catalog$/);
  for(const path of ['/catalog','/categories','/product/vented-performance-rotor','/cart','/about','/']){
    await page.goto(path);
    await expect(page.locator('#main-content')).not.toContainText('LOADING AUTOPRO',{timeout:12000});
    const d=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:window.innerWidth}));
    expect(d.scroll,path).toBeLessThanOrEqual(d.view+2);
  }
});


const MOCK_REAL_PRODUCT={
  id:'qa-component-001',
  category_id:'brakes',
  slug:'qa-rotor',
  name:'QA Rotor Test Fixture',
  brand:'AUTOPRO QA',
  sku:'QA-001',
  description:'Isolated browser test product. Not inventory.',
  price:0,
  stock_quantity:0,
  is_featured:false,
  image_url:'/media/products/brakes/qa-rotor-front.webp',
  gallery:[
    '/media/products/brakes/qa-rotor-side.webp',
    '/media/products/brakes/qa-rotor-front.webp',
    'https://example.org/unapproved.webp',
    '/media/drive.webp',
    'javascript:alert(1)'
  ],
  specifications:{Type:'Browser test'}
};
async function mockRealProduct(page,product=MOCK_REAL_PRODUCT){
  await page.route('**/api/categories',route=>route.fulfill({
    status:200,contentType:'application/json',
    body:JSON.stringify({data:[{id:'brakes',slug:'brakes',name:'Braking Systems'}]})
  }));
  await page.route('**/api/products?*',route=>route.fulfill({
    status:200,contentType:'application/json',
    body:JSON.stringify({data:[product]})
  }));
}
test('real product gallery only accepts local SKU-specific media and supports thumbnail selection',async({page})=>{
  await mockRealProduct(page);
  const tinyPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+UXocAAAAASUVORK5CYII=','base64');
  await page.route('**/media/products/**',route=>route.fulfill({
    status:200,contentType:'image/png',body:tinyPng
  }));
  await page.goto('/product/qa-rotor');
  await expect(page.locator('.detail-thumbnails .detail-thumb')).toHaveCount(2);
  const main=page.locator('#detail-main-image');
  await expect(main).toHaveAttribute('src','/media/products/brakes/qa-rotor-front.webp');
  await page.locator('.detail-thumb').nth(1).click();
  await expect(main).toHaveAttribute('src','/media/products/brakes/qa-rotor-side.webp');
  await expect(page.locator('.detail-thumb').nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.detail-thumb').first()).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.detail-art .product-media-unavailable')).toHaveCount(0);
});
test('unapproved and external product images show a truthful placeholder',async({page})=>{
  await mockRealProduct(page,{
    ...MOCK_REAL_PRODUCT,
    image_url:'https://unapproved.example/qa.webp',
    gallery:['/media/hero.webp','/uploads/qa-rotor.webp','/media/products/qa.svg']
  });
  await page.goto('/catalog');
  await expect(page.locator('.product-card .product-media-unavailable')).toBeVisible();
  await expect(page.locator('.product-card .product-photo')).toHaveCount(0);
  await page.goto('/product/qa-rotor');
  await expect(page.locator('.detail-art .product-media-unavailable')).toBeVisible();
  await expect(page.locator('.detail-thumbnails')).toHaveCount(0);
});
test('missing product photo is replaced by a visible placeholder, not a broken icon',async({page})=>{
  await mockRealProduct(page);
  await page.route('**/media/products/**',route=>route.fulfill({status:404,body:'Not found'}));
  await page.goto('/catalog');
  await expect(page.locator('.product-card .product-media-unavailable')).toBeVisible();
  await expect(page.locator('.product-card img.product-photo')).toHaveCount(0);
});

test('a broken gallery thumbnail becomes unavailable and another image remains usable',async({page})=>{
  await mockRealProduct(page);
  const tinyPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+UXocAAAAASUVORK5CYII=','base64');
  await page.route('**/media/products/**',route=>{
    if(route.request().url().endsWith('/qa-rotor-front.webp'))
      return route.fulfill({status:404,body:'Not found'});
    return route.fulfill({status:200,contentType:'image/png',body:tinyPng});
  });
  await page.goto('/product/qa-rotor');
  const thumbs=page.locator('.detail-thumb');
  await expect(thumbs.first()).toBeDisabled();
  await expect(thumbs.first()).toContainText('Unavailable');
  await expect(page.locator('.detail-art .product-media-unavailable')).toBeVisible();
  await thumbs.nth(1).click();
  await expect(page.locator('#detail-main-image')).toHaveAttribute('src','/media/products/brakes/qa-rotor-side.webp');
  await expect(page.locator('.detail-art .product-media-unavailable')).toHaveCount(0);
});

test('capture actual photography-loaded screenshots for review',async({page},testInfo)=>{
  await page.goto('/');
  await expect(page.locator('.hero-title')).toBeVisible();
  await loadAllImages(page);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(400);
  const name=testInfo.project.name==='mobile'?'mobile':'desktop';
  await page.screenshot({path:'cloudflare/cinematic/screenshots/'+name+'.jpg',type:'jpeg',quality:87,fullPage:true,animations:'disabled'});
});
