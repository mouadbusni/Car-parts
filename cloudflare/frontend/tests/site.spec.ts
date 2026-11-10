import {test,expect} from '@playwright/test';

const views=['/','/catalog','/categories','/about','/cart','/product/vented-performance-rotor'];

test('frontend-only concept loads without any inventory API requests',async({page,isMobile})=>{
  const apiCalls=[];
  page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/api/'))apiCalls.push(request.url());});
  await page.goto('/');
  await expect(page.locator('[data-version="autopro-frontend-v7"]')).toBeVisible();
  await expect(page.locator('.hero-title')).toContainText('The details');
  await expect(page.locator('.hero-background img')).toBeVisible();
  await expect(page.locator('.category-gallery .category-photo')).toHaveCount(3);
  await expect(page.locator('.product-card')).toHaveCount(3);
  await expect(page.getByText('VISUAL CONCEPT').first()).toBeVisible();
  expect(apiCalls).toEqual([]);
  if(isMobile)await expect(page.locator('.hero-details')).toBeHidden();
  else await expect(page.locator('.hero-details')).toBeVisible();
  await expect(page.locator('.hero-details')).toHaveCount(1);
  const css=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
  expect(css).toBe('rgb(9, 15, 25)');
});

test('editorial images load without external image requests',async({page,request})=>{
  const externalImages=[];
  page.on('request',r=>{if(r.resourceType()==='image'&&new URL(r.url()).origin!==new URL(page.url()).origin)externalImages.push(r.url())});
  await page.goto('/');
  for(const name of ['hero','brakes','wheels','lighting','drive']){
    const res=await request.get('/media/'+name+'.webp');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/webp');
    expect((await res.body()).length).toBeGreaterThan(25000);
  }
  await page.evaluate(async()=>{
    for(const img of Array.from(document.querySelectorAll('img'))){
      img.loading='eager';
      img.scrollIntoView({block:'center',behavior:'instant'});
      if(!img.complete)await new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
        setTimeout(resolve,5000);
      });
    }
    scrollTo(0,0);
  });
  const bad=await page.locator('.hero-background img,.photo-duo img,.spotlight-media img').evaluateAll(items=>
    items.filter(el=>!((el as HTMLImageElement).complete&&(el as HTMLImageElement).naturalWidth>400)).map(el=>el.getAttribute('src')));
  expect(bad).toEqual([]);
  expect(externalImages).toEqual([]);
});

test('all six demo components use fitting artwork not misleading vehicle photos',async({page})=>{
  await page.goto('/catalog');
  await expect(page.locator('.product-card')).toHaveCount(6);
  const pairs=[
    ['Vented Performance Rotor','brake rotor'],
    ['Adjustable Coilover Unit','coilover'],
    ['Machined Intake Filter','air filter'],
    ['Sport Brake Caliper','brake caliper'],
    ['Performance Intercooler','intercooler'],
    ['Titanium Exhaust Tip','exhaust']
  ];
  for(const [name,art] of pairs){
    const product=page.locator('.product-card').filter({has:page.getByRole('heading',{name})});
    await expect(product.locator('.component-visual')).toBeVisible();
    expect(await product.locator('.component-art svg').getAttribute('aria-label')).toContain(art);
    await expect(product.locator('img.product-photo')).toHaveCount(0);
  }
});

test('quick search and filtering are functional entirely in the browser',async({page})=>{
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search parts'}).fill('rotor');
  await page.getByRole('button',{name:'Submit product search'}).click();
  await expect(page).toHaveURL(/\/catalog\?search=rotor/);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.goto('/catalog');
  await page.getByRole('searchbox',{name:'Search products'}).fill('filter');
  await page.getByRole('button',{name:/APPLY FILTERS/}).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.goto('/categories');
  await page.locator('.category-card').first().click();
  await expect(page).toHaveURL(/category=brakes/);
  await expect(page.locator('.product-card')).toHaveCount(2);
});

test('saved parts persist when demo examples are hidden, with checkout disabled',async({page})=>{
  await page.goto('/catalog');
  await page.getByRole('button',{name:/Add Vented Performance Rotor to preview selection/}).click();
  await expect(page.locator('#header-count')).toHaveText('1');
  await page.getByRole('button',{name:'Hide examples'}).click();
  await expect(page.locator('.product-card')).toHaveCount(0);
  await page.locator('header .cart-link').click();
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  await expect(page.getByRole('button',{name:'CHECKOUT NOT AVAILABLE'})).toBeDisabled();
});

test('desktop and mobile navigation are accessible and escape closes the menu',async({page,isMobile})=>{
  await page.goto('/');
  await expect(page.locator('.brand')).toBeVisible();
  if(isMobile){
    const toggle=page.locator('#menu-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('#mobile-nav')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await toggle.click();
    await page.locator('#mobile-nav a[href="/categories"]').click();
  }else{
    await page.locator('.desktop-nav a[href="/categories"]').click();
  }
  await expect(page).toHaveURL(/\/categories$/);
  await expect(page.locator('.category-card')).toHaveCount(4);
});

test('all screens are horizontally contained on desktop and phone',async({page})=>{
  for(const path of views){
    await page.goto(path);
    await expect(page.locator('#main-content')).toBeVisible();
    const bounds=await page.evaluate(()=>({
      content:document.documentElement.scrollWidth,
      viewport:document.documentElement.clientWidth
    }));
    expect(bounds.content,path).toBeLessThanOrEqual(bounds.viewport+2);
  }
});

test('no backend or sensitive functionality is publicly exposed',async({request})=>{
  for(const path of ['/api/health','/api/products','/api/categories','/admin','/login','/checkout']){
    const result=await request.get(path);
    expect(result.status(),path).toBe(404);
  }
  expect((await request.post('/api/products',{data:{id:'spoofed'}})).status()).toBe(405);
  expect((await request.put('/catalog',{data:'spoofed'})).status()).toBe(405);
});

test('reading rail responds to page scroll',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#reading-progress')).toHaveCount(1);
  await page.evaluate(()=>window.scrollTo({top:Math.floor(document.body.scrollHeight/2),behavior:'instant'}));
  await expect.poll(async()=>page.locator('#reading-progress').evaluate(el=>
    Number.parseFloat(getComputedStyle(el).transform.split('(')[1]||'0'))).toBeGreaterThan(0.05);
  await expect(page.locator('#site-header')).toHaveClass(/is-scrolled/);
});

test('capture stable full-page screenshots for visual review',async({page},testInfo)=>{
  await page.goto('/');
  await page.evaluate(async()=>{
    for(const img of Array.from(document.querySelectorAll('img'))){
      img.loading='eager';
      img.scrollIntoView({block:'center',behavior:'instant'});
      if(!img.complete)await new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
        setTimeout(resolve,5000);
      });
    }
    scrollTo({top:0,behavior:'instant'});
  });
  await page.waitForTimeout(300);
  await page.screenshot({path:'cloudflare/frontend/screenshots/'+testInfo.project.name+'.jpg',fullPage:true,type:'jpeg',quality:88,animations:'disabled'});
});
