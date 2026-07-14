import { test, expect } from '@playwright/test';

test.describe('Global navigation', () => {
  test('homepage loads and shows the hero heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('header links are all clickable on homepage', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    const links = header.getByRole('link');
    await expect(links.first()).toBeVisible();
    // All links should have an href
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('/about page loads correctly', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/about/i);
  });

  test('/contact page loads correctly', async ({ page }) => {
    await page.goto('/contact/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('/articles page loads and lists articles', async ({ page }) => {
    await page.goto('/articles/');
    await expect(page.getByRole('heading', { name: /articles/i, level: 1 })).toBeVisible();
    const articleLinks = page.getByText(/read article/i);
    await expect(articleLinks.first()).toBeVisible();
  });

  test('/games page loads the games lobby', async ({ page }) => {
    await page.goto('/games/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test('tools all respond with 200', async ({ page }) => {
    const tools = [
      '/tools/prompt-architect/',
      '/tools/invoice-generator/',
      '/tools/debt-optimizer/',
      '/tools/fuel-tracker/',
    ];
    for (const path of tools) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    }
  });

  test('footer links are all present', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: /prompt architect/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /fuel tracker/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /privacy policy/i })).toBeVisible();
  });

  test('no GitHub links exist anywhere on homepage', async ({ page }) => {
    await page.goto('/');
    const githubLinks = page.locator('a[href*="github"]');
    await expect(githubLinks).toHaveCount(0);
  });
});
