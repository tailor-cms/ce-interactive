import type {
  HookMap,
  ProcedureHandler,
  ServerModule,
} from '@tailor-cms/cek-common';
import manifest, {
  addResizeReporter,
} from '@tailor-cms/ce-interactive-manifest';
import type { Element } from '@tailor-cms/ce-interactive-manifest';

export const hookMap: HookMap<Element> = new Map();

const TITLE_TAG = /<title[^>]*>([\s\S]*?)<\/title>/i;

const readTitle = (html: string) =>
  html.match(TITLE_TAG)?.[1]?.replace(/\s+/g, ' ').trim() ?? '';

export const procedures: Record<string, ProcedureHandler> = {
  // Adds the resize reporter to an uploaded page, in place, so the frame
  // can follow the page height (see `addResizeReporter`).
  preparePage: async ({ storage }, { key }) => {
    if (!key) throw new Error('No file key provided');
    const file = await storage.getFile(key);
    if (!file) throw new Error('File not found');
    const html = file.toString('utf8');
    // Providers take upload options (e.g. S3 metadata) the typed
    // interface leaves out; keep the page served as HTML.
    await (storage.saveFile as any)(key, addResizeReporter(html), {
      ContentType: 'text/html',
    });
    return { title: readTitle(html) };
  },
};

const serverModule: ServerModule<Element> = {
  ...manifest,
  hookMap,
  procedures,
};

export default serverModule;
