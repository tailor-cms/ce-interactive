import { DEFAULT_HEIGHT } from '@tailor-cms/ce-interactive-common';

import type {
  DataInitializer,
  ElementData,
  ElementManifest,
} from './interfaces';

// Element unique id within the target system (e.g. Tailor)
export const type = 'INTERACTIVE';

// Display name (e.g. shown to the author)
export const name = 'Interactive';

// Function which inits element state
export const initState: DataInitializer = (): ElementData => ({
  url: null,
  assets: {},
  title: '',
  height: DEFAULT_HEIGHT,
});

export const version = '1.0';

// UI configuration for Tailor CMS
const ui = {
  // Display icon
  icon: 'mdi-chart-bubble',
  // Does element support only full width or can be used within layouts
  // (e.g. 50/50 layout)
  forceFullWidth: true,
};

export const isEmpty = (data: ElementData): boolean => !data.url;

const manifest: ElementManifest = {
  type,
  version,
  name,
  ssr: false,
  isComposite: false,
  initState,
  isEmpty,
  ui,
};

export default manifest;
export * from './interfaces';
