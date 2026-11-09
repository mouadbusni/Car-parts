import { test, expect } from '@playwright/test';

test('loads the navy-and-blue redesign and live 3D stage shell', async ({page})=>{
  await page.goto('/');
  await expect(page.locator('[data-version="precision-3d"]')).toBeVisible();
  await expect(page.locator('.hero-title')).toContainText('Precision');
  await expect(page.locator('.hero-title')).toContainText('detail.');
  await expect(page.locator('#brake-canvas')).toBeAttached();
  await expect(page.locator('#webgl-state')).toBeVisible();
  await expect(page.getByText('AUTOPRO ENGINEERING LAB')).toBeVisible();
  await expect(page.locator('.product-card')).toHaveCount(3);
  await expect(page.getByText('DEMO CATALOGUE').first()).toBeVisible();
  const bg=await page.locator('body').evaluate(x=>getComputedStyle(x).backgroundColor);
  expect(bg).toBe('rgb(6, 12, 23)');
});

test('on a WebGL-capable device the actual Three.js model renders and explodes', async ({page})=>{
  await page.goto('/');
  const canvas=page.locator('#brake-canvas');
  const webglSupported=await page.evaluate(()=>{
    const x=document.createElement('canvas');
    return Boolean(x.getContext('webgl2')||x.getContext('webgl'));
  });
  if(!webglSupported){
    await expect(canvas).toHaveAttribute('data-webgl','unavailable');
    await expect(page.locator('#model-fallback')).toBeVisible();
    test.skip(true,'CI renderer lacks WebGL; verified graceful 3D fallback');
  }
  await expect(canvas).toHaveAttribute('data-webgl','ready',{timeout:20000});
  await expect(page.locator('#model-fallback')).toBeHidden();
  await expect(page.locator('#webgl-state')).toContainText('LIVE WEBGL 3D');
  const size=await canvas.evaluate(x=>({w:x.width,h:x.height,pixels:x.width*x.height}));
  expect(size.w).toBeGreaterThan(200);
  expect(size.pixels).toBeGreaterThan(100000);
  const toggle=page.locator('[data-explode]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed','true');
  await expect(toggle).toContainText('ASSEMBLED VIEW');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed','false');
  const errors=await page.evaluate(()=>document.querySelector('#brake-canvas')?.dataset.webgl);
  expect(errors).toBe('ready');
});

test('search filters demo catalogue and categories route correctly',async({page})=>{
  await page.goto('/catalog');
  await expect(page.locator('.product-card')).toHaveCount(6);
  await page.getByRole('searchbox',{name:'Search products'}).fill('rotor');
  await page.getByRole('button',{name:/APPLY FILTERS/}).click();
  await expect(page).toHaveURL(/search=rotor/);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.goto('/categories');
  await expect(page.locator('.category-card')).toHaveCount(4);
  await page.locator('.category-card').first().click();
  await expect(page).toHaveURL(/category=brakes/);
});

test('product detail and local cart persist and remain non-purchasable',async({page})=>{
  await page.goto('/catalog');
  await page.getByRole('button',{name:/Add Vented Performance Rotor to preview selection/}).click();
  await expect(page.locator('#header-count')).toHaveText('1');
  await page.locator('header .cart-link').click();
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  await expect(page.getByRole('button',{name:'CHECKOUT NOT AVAILABLE'})).toBeDisabled();
  await page.getByRole('button',{name:'Increase Vented Performance Rotor quantity'}).click();
  await expect(page.locator('.cart-summary').getByText('$378.00')).toHaveCount(2);
  await page.getByRole('button',{name:'REMOVE'}).click();
  await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible();
});

test('real D1 read API remains alive with no real products',async({request})=>{
  const response=await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  const health=await response.json();
  expect(health.ok).toBe(true);
  expect(health.service).toBe('autopro-catalog');
  const products=await request.get('/api/products?limit=5');
  expect(products.ok()).toBeTruthy();
  const data=await products.json();
  expect(Array.isArray(data.data)).toBe(true);
  expect(data.data).toHaveLength(0);
});

test('admin, checkout, data writes, and non-GET static actions are blocked',async({request})=>{
  for(const route of ['/admin','/login','/checkout','/dashboard']){
    const response=await request.get(route);
    expect(response.status(),route).toBe(404);
  }
  expect((await request.post('/api/products',{data:{id:'not-allowed'}})).status()).toBe(405);
  expect((await request.put('/catalog',{data:'no writes'})).status()).toBe(405);
});

test('navigation and all major pages fit viewport with no overflow',async({page,isMobile})=>{
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
  for(const route of ['/catalog','/categories','/product/vented-performance-rotor','/cart','/about','/']){
    await page.goto(route);
    await expect(page.locator('#main-content')).not.toContainText('LOADING AUTOPRO',{timeout:15000});
    const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
    expect(dimensions.scroll,route).toBeLessThanOrEqual(dimensions.inner+2);
  }
});

test('capture the actual deployed 3D UI in desktop/mobile screenshots',async({page},testInfo)=>{
  await page.goto('/');
  await expect(page.locator('.hero-title')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(1400);
  const filename=testInfo.project.name==='mobile'?'mobile':'desktop';
  await page.screenshot({path:'cloudflare/precision-3d/screenshots/'+filename+'.png',type:'png',fullPage:false,animations:'disabled'});
});
