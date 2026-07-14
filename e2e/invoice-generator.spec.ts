import { test, expect } from '@playwright/test';

test.describe('Invoice Generator — page structure', () => {
  test('page title is set correctly', async ({ page }) => {
    await page.goto('/tools/invoice-generator/');
    await expect(page).toHaveTitle(/invoice generator/i);
  });

  test('renders the invoice form', async ({ page }) => {
    await page.goto('/tools/invoice-generator/');
    await expect(page.getByRole('heading', { name: /invoice/i }).first()).toBeVisible();
  });

  test('download PDF button is present', async ({ page }) => {
    await page.goto('/tools/invoice-generator/');
    await expect(
      page.getByRole('button', { name: /download pdf/i }).or(page.getByText(/download pdf/i)),
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Invoice Generator — form interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/invoice-generator/');
  });

  test('invoice number field accepts input', async ({ page }) => {
    const invoiceNumField = page.getByLabel(/invoice number/i).first();
    await invoiceNumField.fill('INV-2026-001');
    await expect(invoiceNumField).toHaveValue('INV-2026-001');
  });

  test('adding a line item is reflected in the preview', async ({ page }) => {
    const descField = page.getByPlaceholder(/description/i).first();
    await descField.fill('Website redesign');

    // Preview should update with the description
    await expect(page.getByText('Website redesign')).toBeVisible();
  });

  test('"Add Line Item" button adds a new row', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add.*line|add.*item/i });
    const initialCount = await page.getByPlaceholder(/description/i).count();
    await addBtn.click();
    const newCount = await page.getByPlaceholder(/description/i).count();
    expect(newCount).toBeGreaterThan(initialCount);
  });
});

test.describe('Invoice Generator — navigation', () => {
  test('back navigation to homepage works', async ({ page }) => {
    await page.goto('/tools/invoice-generator/');
    const homeLink = page.getByRole('link', { name: /NexusDigitalLabs/ }).first();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });
});
