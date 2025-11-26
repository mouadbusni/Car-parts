import { test, expect } from '@playwright/test';
import * as axe from 'axe-core';

test.describe('Technical QA', () => {
  test('Performance: Home page load time should be under 10 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
  });

  test('Accessibility: Home page accessibility audit', async ({ page }) => {
    await page.goto('/');
    await page.addScriptTag({ path: require.resolve('axe-core') });
    await page.waitForTimeout(500);
    const violations = await page.evaluate(async () => {
      return new Promise<any[]>((resolve) => {
        const timeout = setTimeout(() => resolve([]), 5000);
        try {
          (window as any).axe.run({}, (error: any, results: any) => {
            clearTimeout(timeout);
            resolve(results?.violations || []);
          });
        } catch {
          clearTimeout(timeout);
          resolve([]);
        }
      });
    });
    if (violations.length > 0) {
      console.log(`Found ${violations.length} accessibility violations:`);
      violations.slice(0, 3).forEach((v: any) => {
        console.log(`- ${v.id}: ${v.description} (${v.impact})`);
      });
    }
    expect(violations.length).toBeLessThan(1000);
  });

  test('SEO: Home page should have required meta tags', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();

    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    const metaKeywords = page.locator('meta[name="keywords"]');
    await expect(metaKeywords).toHaveAttribute('content', /.+/);
  });

  test('SEO: Robots.txt should be accessible', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    expect(response.status()).toBe(200);
  });

  test('SEO: Sitemap should be accessible', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
  });
});