import { test, expect, Page } from '@playwright/test';

const adminCredentials = {
  email: 'admin@admin.com',
  password: '123456',
};

const loginAsAdmin = async (page: Page) => {
  const payload = encodeURIComponent(JSON.stringify({ email: adminCredentials.email }));
  await page.context().addCookies([
    {
      name: 'sb-auth-token',
      value: payload,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
    },
  ]);
  await page.goto('/admin');
};

test.describe('Admin Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display product list', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page.locator('h1')).toContainText('Product Management');
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should add a new product', async ({ page }) => {
    await page.goto('/admin/products/new');
    await page.fill('input[name="name"]', 'Test Product');
    await page.fill('input[name="slug"]', 'test-product');
    await page.fill('input[name="price"]', '99.99');
    await page.fill('input[name="stock_quantity"]', '10');
    await page.fill('input[name="sku"]', 'TEST123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/products');
    await expect(page.locator('table')).toContainText('Test Product');
  });

  test('should edit a product', async ({ page }) => {
    await page.goto('/admin/products');
    await page.click('text=Edit');
    await page.fill('input[name="name"]', 'Updated Product');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/products');
    await expect(page.locator('table')).toContainText('Updated Product');
  });
});