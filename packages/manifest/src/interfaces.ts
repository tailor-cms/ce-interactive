import type * as common from '@tailor-cms/cek-common';

export interface ElementData extends common.ElementConfig {
  // Public URL of the page, resolved from `assets.url` on read.
  url: string | null;
  // `storage://` reference to the stored HTML file.
  assets: { url?: string };
  // Frame title for assistive tech.
  title?: string;
  // One-sentence text alternative of what the page shows.
  description?: string;
  // Minimum frame height in px; the width follows the content column.
  height: number;
}

export type DataInitializer = common.DataInitializer<ElementData>;
export type Element = common.Element<ElementData>;
export type ElementManifest = common.ElementManifest<ElementData>;
