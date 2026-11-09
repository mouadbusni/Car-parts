import { test, expect } from '@playwright/test';

const rotor = {
  id: 'rotor-001', slug: 'track-brake-rotor', name: 'Track Brake Rotor', brand: 'AutoPro',
  category_id: 'brakes', description: 'Precision brake rotor', price: 120,
  compare_price: null, image_url: 'https://example.com/rotor.jpg', gallery: [],
  specifications: { material: 'Steel' }, compatibility: ['Test vehicle'],
  stock_quantity: 3, sku: 'ROT-001', rating: 4.5, reviews_count: 2,
  is_featured: true, created_at: '2026-01-01', updated_at: '2026-01-01',
};

const filter = {
  id: 'filter-002', slug: 'high-flow-filter', name: 'High Flow Filter', brand: 'AutoPro',
  category_id: 'filters', description: 'Air filter element', price: 40,
  compare_price: null, image_url: 'https://example.com/filter.jpg', gallery: [],
  specifications: { type: 'Filter' }, compatibility: [],
  stock_quantity: 8, sku: 'FIL-002', rating: 4.0, reviews_count: 1,
  is_featured: false, created_at: '2026-01-01', updated_at: '2026-01-01',
};

test.beforeEach(async ({ page }) => {
  // Mock the public Supabase read API; no orders/database writes are simulated.
  await page.route('**/rest/v1/**', async route => {
    const url = new URL(route.request().url());
    const isProduct = url.pathname.endsWith('/products');
    const isCategory = url.pathname.endsWith('/categories');
    if (isCategory) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      return;
    }
    if (!isProduct) return route.fulfill({status:404,body:'Not found'});
    const skuLookup = url.searchParams.has('slug');
    const nameFilter = url.searchParams.get('name');
    const filtered = nameFilter ? [rotor,filter].filter(p=>p.name.toLowerCase().includes('brake')) : [rotor,filter];
    const data = skuLookup ? [rotor] : filtered;
    const objectRequested = /vnd\.pgrst\.object\+json/.test(route.request().headers().accept || '');
    await route.fulfill({
      status: 200, contentType: 'application/json',
      headers: {'content-range': `0-${Math.max(data.length-1,0)}/${data.length}`},
      body: JSON.stringify(objectRequested ? data[0] : data)
    });
  });
});

test('catalog Add creates persistent cart, quantity controls and removal work', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByText('Track Brake Rotor')).toBeVisible();
  await page.locator('article').count(); // no reliance on card wrappers
  await page.getByRole('button', {name:'Add', exact:true}).first().click();
  await expect(page.getByTestId('header-cart-count')).toHaveText('1');
  await page.goto('/cart');
  await expect(page.getByTestId('cart-product')).toHaveCount(1);
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$120.00');
  await page.reload();
  await expect(page.getByTestId('cart-product')).toHaveCount(1);
  await page.getByRole('button',{name:'Increase quantity of Track Brake Rotor'}).click();
  await expect(page.getByTestId('cart-quantity')).toHaveText('2');
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$240.00');
  await page.getByRole('button',{name:'Remove Track Brake Rotor from cart'}).click();
  await expect(page.getByTestId('empty-cart')).toBeVisible();
  await expect(page.getByTestId('header-cart-count')).toHaveCount(0);
});

test('product detail Add enforces available stock and checkout stays disabled', async ({ page }) => {
  await page.goto('/products/track-brake-rotor');
  await expect(page.getByRole('heading',{name:'Track Brake Rotor'})).toBeVisible();
  await page.getByRole('button',{name:'Increase selected quantity'}).click();
  await page.getByRole('button',{name:'Increase selected quantity'}).click();
  await expect(page.getByRole('button',{name:'Increase selected quantity'})).toBeDisabled();
  await page.getByRole('button',{name:'Add to Cart'}).click();
  await expect(page.getByRole('status')).toContainText('Added 3 units');
  await page.getByRole('link',{name:'View cart'}).click();
  await expect(page.getByTestId('cart-item-count')).toHaveText('3 items selected');
  await expect(page.getByRole('button',{name:'Checkout unavailable'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Increase quantity of Track Brake Rotor'})).toBeDisabled();
});

test('mobile cart does not overflow and quantities remain accessible', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only');
  await page.goto('/products');
  await expect(page.getByText('Track Brake Rotor')).toBeVisible();
  await page.getByRole('button', {name:'Add', exact:true}).first().click();
  await page.goto('/cart');
  await expect(page.getByTestId('cart-product')).toHaveCount(1);
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport+2);
});
