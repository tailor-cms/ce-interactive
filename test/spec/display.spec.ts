import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { Display, Edit } from '../pom';
import { PAGE, PAGE_HEIGHT } from '../fixtures';

const ELEMENT_ID = 'test-interactive-display';
const PAGE_URL = 'https://example.com/page.html';

const seedPage = async (data: Record<string, unknown> = {}) => {
  await elementClient.update(ELEMENT_ID, {
    url: PAGE_URL,
    assets: {},
    title: '',
    height: 480,
    ...data,
  });
};

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await elementClient.resetState(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('Empty state', () => {
  test('Renders placeholder when content is empty', async ({ page }) => {
    const display = new Display(page);
    await expect(display.placeholder).toBeVisible();
    await expect(display.root).not.toBeVisible();
  });
});

test.describe('Content rendering', () => {
  test('Renders sandboxed frame with page', async ({ page }) => {
    await seedPage({ title: 'Wave simulation' });
    await page.reload({ waitUntil: 'networkidle' });
    const display = new Display(page);
    await expect(display.frame).toHaveAttribute('src', PAGE_URL);
    await expect(display.frame).toHaveAttribute('title', 'Wave simulation');
    await expect(display.frame).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-popups allow-pointer-lock',
    );
  });

  test('Falls back to element name as frame title', async ({ page }) => {
    await seedPage();
    await page.reload({ waitUntil: 'networkidle' });
    const display = new Display(page);
    await expect(display.frame).toHaveAttribute('title', 'Interactive');
  });

  test('Uses saved height until the page reports one', async ({ page }) => {
    await seedPage({ height: 700 });
    await page.reload({ waitUntil: 'networkidle' });
    const display = new Display(page);
    await expect(display.frame).toHaveAttribute('height', '700');
  });

  test('Links text alternative to the frame', async ({ page }) => {
    await seedPage({ description: 'Two waves interfering.' });
    await page.reload({ waitUntil: 'networkidle' });
    const display = new Display(page);
    await expect(display.description).toHaveText('Two waves interfering.');
    const id = await display.description.getAttribute('id');
    await expect(display.frame).toHaveAttribute('aria-describedby', id!);
  });

  test('Has no description link without text alternative', async ({ page }) => {
    await seedPage();
    await page.reload({ waitUntil: 'networkidle' });
    const display = new Display(page);
    await expect(display.description).toHaveCount(0);
    await expect(display.frame).not.toHaveAttribute('aria-describedby');
  });
});

test.describe('Uploaded page', () => {
  test('Frame follows the page height', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.fileInput.dropzoneUpload(PAGE);
    await expect(edit.frame).toBeVisible();
    const display = new Display(page);
    await expect
      .poll(async () => Number(await display.frame.getAttribute('height')))
      .toBeGreaterThanOrEqual(PAGE_HEIGHT);
  });
});
