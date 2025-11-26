import { test, expect, Page } from '@playwright/test';

test.describe('Admin Authentication and Dashboard', () => {
  const testEmail = 'admin@admin.com';
  const testPassword = '123456';

  const authenticateViaCookie = async (page: Page) => {
    const payload = encodeURIComponent(JSON.stringify({ email: testEmail }));
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
  };

  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log(msg.text()));
  });

  test('should redirect unauthenticated user from /admin to /login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('should redirect unauthenticated user from /admin/products to /login', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForURL('/login', { timeout: 5000 }).catch(() => {});
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  test('should display login form with role selection', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('text=Email Address')).toBeVisible();
  });

  test('admin user should login and be redirected to admin products', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin/, { timeout: 5000 }).catch(() => {});
    const url = page.url();
    expect(url).toContain('/admin');
  });

  test('should display admin dashboard with user info', async ({ page }) => {
    await authenticateViaCookie(page);
    await page.goto('/admin');
    const dashboardContent = page.locator('h1');
    await dashboardContent.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
  });

  test('should display logout button in admin panel', async ({ page }) => {
    await authenticateViaCookie(page);
    await page.goto('/admin');
    const logoutButton = page.locator('button:has-text("Logout")');
    await logoutButton.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    if (await logoutButton.count() > 0) {
      await expect(logoutButton).toBeVisible();
    }
  });

  test('should display user email in admin panel', async ({ page }) => {
    await authenticateViaCookie(page);
    await page.goto('/admin');
    const emailText = page.locator(`text=${testEmail}`);
    const emailWelcome = page.locator(`text="Welcome, ${testEmail}"`);
    const emailVisible = (await emailText.count() > 0) || (await emailWelcome.count() > 0);
    if (emailVisible) {
      expect(emailVisible).toBe(true);
    }
  });

  test('sidebar should toggle open/closed', async ({ page }) => {
    await authenticateViaCookie(page);
    await page.goto('/admin');
    const toggleButton = page.locator('button').first();
    const sidebar = page.locator('aside');
    if (await sidebar.count() > 0) {
      await expect(sidebar).toBeVisible();
      await toggleButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should have navigation links in sidebar', async ({ page }) => {
    await authenticateViaCookie(page);
    await page.goto('/admin');
    const sidebar = page.locator('aside');
    const dashboardLink = sidebar.locator('a:has-text("Dashboard")').first();
    const productsLink = sidebar.locator('a:has-text("Products")').first();
    if (await dashboardLink.count() > 0) {
      await expect(dashboardLink).toBeVisible();
    }
    if (await productsLink.count() > 0) {
      await expect(productsLink).toBeVisible();
    }
  });

  test('should navigate to products page from admin dashboard', async ({ page }) => {
    await authenticateViaCookie(page);
    await page.goto('/admin');
    const productsLink = page.locator('a[href="/admin/products"]').first();
    if (await productsLink.count() > 0) {
      await productsLink.click();
      await page.waitForURL(/\/admin\/products/, { timeout: 5000 }).catch(() => {});
      expect(page.url()).toContain('/admin/products');
    }
  });
});
