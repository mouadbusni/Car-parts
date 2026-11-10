import { test, expect } from '@playwright/test';

// Product management requires server-verified administrator authorization.
// Never assume a browser cookie or localStorage proves an admin identity.
test.describe('Admin product access controls', () => {
  for (const route of ['/admin/products','/admin/products/new','/admin/products/qa-product/edit']) {
    test('unauthenticated visitor is redirected from ' + route, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    });
  }

  test('legacy forged cookie does not unlock product creation', async ({ page }) => {
    await page.context().addCookies([{
      name: 'sb-auth-token',
      value: encodeURIComponent(JSON.stringify({ email: 'attacker@example.test' })),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    }]);
    await page.goto('/admin/products/new');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Create Product' })).toHaveCount(0);
  });
});
