import { test, expect } from '@playwright/test';

test('renders the real AutoPro Cloudflare preview with clear demo status', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-title')).toContainText('POWER');
  await expect(page.locator('.hero-title')).toContainText('DETAILS.');
  await expect(page.getByText('DEMO CATALOGUE').first()).toBeVisible();
  await expect(page.locator('.product-card')).toHaveCount(3);
  await expect(page.getByText('CONCEPT STORE — NOT ACCEPTING ORDERS')).toBeVisible();
  await expect(page.locator('header .brand-word')).toContainText('AUTOPRO');
});

test('catalog filters and search update visible products', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page.getByTestId('product-card')).toHaveCount(6);
  await page.getByRole('searchbox', { name: 'Search products' }).fill('rotor');
  await page.getByRole('button', { name: /APPLY FILTERS/ }).click();
  await expect(page).toHaveURL(/search=rotor/);
  await expect(page.getByTestId('product-card')).toHaveCount(1);
  await expect(page.getByText('Vented Performance Rotor').first()).toBeVisible();
  await page.goto('/catalog?category=brakes');
  await expect(page.getByTestId('product-card')).toHaveCount(2);
});

test('category navigation and direct product URLs work', async ({ page }) => {
  await page.goto('/categories');
  await expect(page.locator('.category-card')).toHaveCount(4);
  await page.locator('.category-card').first().click();
  await expect(page).toHaveURL(/\/catalog\?category=brakes/);
  await page.getByRole('link', { name: /View Vented Performance Rotor/ }).first().click();
  await expect(page).toHaveURL(/\/product\/vented-performance-rotor/);
  await expect(page.locator('.detail-body h1')).toContainText('Vented Performance Rotor');
  await expect(page.getByText('DEMO PRODUCT — NOT FOR SALE')).toBeVisible();
});

test('cart add, quantity, persistence and remove work while checkout stays disabled', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page.getByTestId('product-card')).toHaveCount(6);
  await page.getByRole('button', { name: /Add Vented Performance Rotor to preview selection/ }).click();
  await expect(page.locator('#header-count')).toHaveText('1');
  await page.locator('header .cart-link').click();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByTestId('cart-item')).toHaveCount(1);
  await expect(page.getByRole('button',{name:'CHECKOUT NOT AVAILABLE'})).toBeDisabled();
  await page.reload();
  await expect(page.getByTestId('cart-item')).toHaveCount(1);
  await page.getByRole('button',{name:'Increase Vented Performance Rotor quantity'}).click();
  await expect(page.getByText('$378.00')).toHaveCount(2);
  await page.getByRole('button',{name:'REMOVE'}).click();
  await expect(page.getByTestId('empty-cart')).toBeVisible();
  await expect(page.locator('#header-count')).toBeHidden();
});

test('backend health responds but demo products are not in D1', async ({ request }) => {
  const health=await request.get('/api/health');
  expect(health.ok()).toBeTruthy();
  const h=await health.json();
  expect(h.ok).toBe(true);
  expect(h.service).toBe('autopro-catalog');
  const products=await request.get('/api/products');
  expect(products.ok()).toBeTruthy();
  const data=await products.json();
  expect(Array.isArray(data.data)).toBe(true);
  expect(data.data).toHaveLength(0);
});

test('admin, checkout and mutating public API endpoints remain blocked', async ({ request }) => {
  expect((await request.get('/admin')).status()).toBe(404);
  expect((await request.get('/login')).status()).toBe(404);
  expect((await request.get('/checkout')).status()).toBe(404);
  expect((await request.post('/api/products',{data:{name:'Injected'}})).status()).toBe(405);
});

test('navigation works and page has no horizontal overflow', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    await page.locator('#menu-toggle').click();
    await expect(page.locator('#mobile-nav')).toBeVisible();
    await page.locator('#mobile-nav a[href="/catalog"]').click();
    await expect(page).toHaveURL(/\/catalog$/);
    await expect(page.locator('#mobile-nav')).toBeHidden();
  }else{
    await page.locator('.desktop-nav a[href="/catalog"]').click();
    await expect(page).toHaveURL(/\/catalog$/);
  }
  const dimension=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
  expect(dimension.scroll).toBeLessThanOrEqual(dimension.width+2);
});

test('capture actual live homepage screenshots for review', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('.hero-title')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(650);
  const name=testInfo.project.name==='mobile'?'mobile':'desktop';
  await page.screenshot({path:'cloudflare/preview-site/screenshots/'+name+'.jpg',type:'jpeg',quality:86,fullPage:false,animations:'disabled'});
});
