import { test, expect } from '@playwright/test';

// Isolated anonymous security checks: never rely on a real account or create
// administrator identities from automated tests.
test.describe('Legacy Next.js administrator access', () => {
  test('anonymous visitors cannot open the admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('anonymous visitors cannot access product-management pages', async ({ page }) => {
    await page.goto('/admin/products/new');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('input[name="name"]')).toHaveCount(0);
  });

  test('a forged legacy email cookie does not authenticate a user', async ({ page }) => {
    const forged = encodeURIComponent(JSON.stringify({ email: 'attacker@example.test' }));
    await page.context().addCookies([{
      name: 'sb-auth-token', value: forged,
      domain: 'localhost', path: '/', sameSite: 'Lax',
    }]);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('the login form has no hardcoded administrator credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByText('Administrator access only.')).toBeVisible();
  });

  test('cross-origin admin session creation is rejected', async ({ request }) => {
    const response = await request.post('/api/admin-session', {
      headers: { Origin: 'https://untrusted.example', 'Content-Type': 'application/json' },
      data: { access_token: 'forged' },
    });
    expect(response.status()).toBe(403);
  });

  test('malformed access tokens cannot create admin sessions', async ({ request }) => {
    const response = await request.post('/api/admin-session', {
      headers: { Origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
      data: { access_token: 'forged' },
    });
    expect(response.status()).toBe(401);
    expect(response.headers()['set-cookie']).toBeUndefined();
  });
});
