import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Edit extends pom.EditPanel {
  readonly placeholder: Locator;
  readonly frame: Locator;
  readonly shield: Locator;
  readonly heightInput: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly fileInput: pom.FileInput;

  constructor(page: Page) {
    super(page);
    this.placeholder = this.editor.getByText('Interactive component');
    this.frame = this.editor.locator('.tce-interactive-frame iframe');
    this.shield = this.editor.locator('.tce-interactive-shield');
    this.heightInput = this.sideToolbar.getByLabel('Height');
    this.titleInput = this.sideToolbar.getByLabel('Title');
    this.descriptionInput = this.sideToolbar.getByLabel('Text alternative');
    this.fileInput = new pom.FileInput(this.el);
  }

  // Side toolbar fields save on change
  async setField(input: Locator, value: string): Promise<void> {
    await input.fill(value);
    await input.blur();
  }
}
