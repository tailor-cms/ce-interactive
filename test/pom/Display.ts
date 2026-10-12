import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Display extends pom.DisplayPanel {
  readonly root: Locator;
  readonly frame: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    super(page);
    this.root = this.editor.locator('.tce-interactive-root');
    this.frame = this.root.locator('iframe.tce-interactive-frame');
    this.description = this.root.locator('.tce-interactive-description');
  }
}
