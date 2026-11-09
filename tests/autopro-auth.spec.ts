import { expect, test } from '@playwright/test';

test('anonymous users cannot access the admin dashboard', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
});

test('anonymous users cannot access the dashboard view', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
});

test('session endpoint rejects requests without a Supabase JWT', async ({ request }) => {
  const response = await request.post('/api/admin-session', { data: {} });
  expect(response.status()).toBe(401);
  const result = await response.json();
  expect(result.error).toMatch(/sign-in required/);
});
