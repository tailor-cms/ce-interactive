import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { DOCUMENT, PAGE, PAGE_HEIGHT } from '../fixtures';
import { Edit } from '../pom';

const ELEMENT_ID = 'test-interactive-edit';
// Resolved to a storage URL on read; the file itself doesn't need to exist
const PAGE_KEY = 'storage://repository/assets/seed___page.html';

const DEFAULT_HEIGHT = 480;

const getElementData = async () => {
  const { data } = await elementClient.get(ELEMENT_ID);
  return data.element.data;
};

const seedPage = async (data: Record<string, unknown> = {}) => {
  await elementClient.update(ELEMENT_ID, {
    url: null,
    assets: { url: PAGE_KEY },
    title: '',
    height: DEFAULT_HEIGHT,
    ...data,
  });
};

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('When page is not set', () => {
  test('Shows dropzone as empty state', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.fileInput.dropzone).toBeVisible();
    await expect(edit.fileInput.dropzoneUrlBtn).not.toBeVisible();
    await expect(edit.placeholder).not.toBeVisible();
    await expect(edit.frame).not.toBeVisible();
  });

  test('Can upload HTML page via dropzone', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.fileInput.dropzoneUpload(PAGE);
    await expect(edit.frame).toBeVisible();
    await expect(edit.fileInput.dropzone).not.toBeVisible();
    await edit.fileInput.expectFile('page.html');
  });

  test('Prefills title from the page', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.fileInput.dropzoneUpload(PAGE);
    await expect(edit.frame).toHaveAttribute('title', 'Test page');
    await expect(edit.titleInput).toHaveValue('Test page');
  });

  test('Adds resize reporter to the stored page', async ({ page, request }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.fileInput.dropzoneUpload(PAGE);
    await expect(edit.frame).toBeVisible();
    const { url } = await getElementData();
    const res = await request.get(url);
    expect(res.headers()['content-type']).toContain('text/html');
    const html = await res.text();
    expect(html.match(/data-tailor-resize/g)).toHaveLength(1);
  });

  test('Frame follows the page height', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.fileInput.dropzoneUpload(PAGE);
    await expect
      .poll(async () => Number(await edit.frame.getAttribute('height')))
      .toBeGreaterThanOrEqual(PAGE_HEIGHT);
  });

  test('Rejects non-HTML file', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.fileInput.dropzoneUpload(DOCUMENT);
    await expect(edit.fileInput.dropzone).toBeVisible();
    await expect(edit.frame).not.toBeVisible();
  });
});

test.describe('When page is set', () => {
  test.beforeEach(async ({ page }) => {
    await seedPage();
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Shows frame with file row', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.frame).toBeVisible();
    await edit.focus();
    await edit.fileInput.expectFile('page.html');
  });

  test('Shields the frame until focused', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.shield).toBeVisible();
    await edit.focus();
    await expect(edit.shield).not.toBeVisible();
  });

  test('Can replace page', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.fileInput.replace();
    await edit.fileInput.upload(PAGE);
    await expect(edit.fileInput.dialog).not.toBeVisible();
    await expect
      .poll(async () => (await getElementData()).assets.url)
      .not.toBe(PAGE_KEY);
    await edit.fileInput.expectFile('page.html');
  });

  test('Can remove page', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.fileInput.removeFromRow();
    await expect(edit.frame).not.toBeVisible();
    await expect(edit.fileInput.dropzone).toBeVisible();
  });
});

test.describe('Side toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await seedPage();
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Sets frame height', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.setField(edit.heightInput, '700');
    // The seeded page doesn't report a height, so the saved one applies
    await expect(edit.frame).toHaveAttribute('height', '700');
    await expect.poll(async () => (await getElementData()).height).toBe(700);
  });

  test('Clamps height to the allowed range', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.setField(edit.heightInput, '10');
    await expect.poll(async () => (await getElementData()).height).toBe(120);
  });

  test('Sets title and text alternative', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.setField(edit.titleInput, 'Wave simulation');
    await edit.setField(edit.descriptionInput, 'Two waves interfering.');
    await expect(edit.frame).toHaveAttribute('title', 'Wave simulation');
    await expect
      .poll(async () => (await getElementData()).description)
      .toBe('Two waves interfering.');
  });
});

test.describe('Readonly mode', () => {
  test('Shows placeholder instead of dropzone when empty', async ({ page }) => {
    const edit = new Edit(page);
    await edit.setReadonly();
    await expect(edit.placeholder).toBeVisible();
    await expect(edit.fileInput.dropzone).not.toBeVisible();
  });

  test('Keeps frame visible and hides file actions when set', async ({
    page,
  }) => {
    await seedPage();
    await page.reload({ waitUntil: 'networkidle' });
    const edit = new Edit(page);
    await edit.setReadonly();
    await edit.focus();
    await expect(edit.frame).toBeVisible();
    await expect(edit.fileInput.replaceBtn).not.toBeVisible();
  });
});
