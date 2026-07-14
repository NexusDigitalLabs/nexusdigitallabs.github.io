import { test, expect } from '@playwright/test';

test.describe('Fuel Tracker — onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so each test starts fresh
    await page.goto('/tools/fuel-tracker/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('shows the onboarding screen', async ({ page }) => {
    await expect(page.getByRole('button', { name: /New Garage/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /I have a code/i })).toBeVisible();
  });

  test('shows error when creating garage without a nickname', async ({ page }) => {
    await page.getByRole('button', { name: /Create My Garage/i }).click();
    await expect(page.getByText(/enter a nickname/i)).toBeVisible();
  });

  test('creates a new garage with a nickname and moves to vehicle setup', async ({ page }) => {
    const nicknameInput = page.getByPlaceholder(/e\.g\. Alex/i);
    await nicknameInput.fill('TestUser');
    await page.getByRole('button', { name: /Create My Garage/i }).click();

    // Should move to vehicle setup screen
    await expect(page.getByText(/add your first vehicle/i)).toBeVisible({ timeout: 10000 });
  });

  test('displays sync code after creating a garage', async ({ page }) => {
    const nicknameInput = page.getByPlaceholder(/e\.g\. Alex/i);
    await nicknameInput.fill('E2EUser');
    await page.getByRole('button', { name: /Create My Garage/i }).click();

    // Sync code card should appear
    await expect(page.getByText(/Your Sync Code/i)).toBeVisible({ timeout: 10000 });
    // Code should be in format: nickname-xxxx
    await expect(page.getByText(/e2euser-/i)).toBeVisible();
  });
});

test.describe('Fuel Tracker — "I have a code" flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/fuel-tracker/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Switch to "I have a code" mode
    await page.getByRole('button', { name: /I have a code/i }).click();
  });

  test('shows "Enter your sync code" error when submitted with empty input', async ({ page }) => {
    await page.getByRole('button', { name: /Load My Data/i }).click();
    await expect(page.getByText(/enter your sync code/i)).toBeVisible();
  });

  test('shows "No garage found" error for a non-existent code', async ({ page }) => {
    const codeInput = page.getByPlaceholder(/e\.g\. mynickname-/i);
    await codeInput.fill('doesnotexist-zzzz');
    await page.getByRole('button', { name: /Load My Data/i }).click();
    await expect(page.getByText(/no garage found/i)).toBeVisible({ timeout: 10000 });
  });

  test('code is case-insensitive — UPPERCASE code loads the same as lowercase', async ({ page }) => {
    // First create a garage to get a real code
    await page.getByRole('button', { name: /New Garage/i }).click();
    const nicknameInput = page.getByPlaceholder(/e\.g\. Alex/i);
    await nicknameInput.fill('CaseTest');
    await page.getByRole('button', { name: /Create My Garage/i }).click();

    // Extract the generated sync code
    await page.getByText(/Your Sync Code/i).waitFor({ timeout: 10000 });
    const codeEl = page.locator('code').first();
    const syncCode = await codeEl.textContent() ?? '';

    // Clear and reload, then try the UPPERCASE version of the code
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: /I have a code/i }).click();
    const codeInput = page.getByPlaceholder(/e\.g\. mynickname-/i);
    await codeInput.fill(syncCode.toUpperCase());
    await page.getByRole('button', { name: /Load My Data/i }).click();

    // Should load the garage — vehicle setup or main view
    await expect(
      page.getByText(/add your first vehicle/i).or(page.getByText(/Your Sync Code/i)),
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Fuel Tracker — page structure', () => {
  test('page title is set correctly', async ({ page }) => {
    await page.goto('/tools/fuel-tracker/');
    await expect(page).toHaveTitle(/fuel tracker/i);
  });

  test('header navigation is visible and clickable', async ({ page }) => {
    await page.goto('/tools/fuel-tracker/');
    const aboutLink = page.getByRole('link', { name: /about/i }).first();
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL(/\/about/);
  });
});
