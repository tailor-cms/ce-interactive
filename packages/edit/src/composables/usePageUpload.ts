import { inject, ref } from 'vue';
import { addResizeReporter } from '@tailor-cms/ce-interactive-manifest';
import type { Ref } from 'vue';
import type { StorageApi } from '@tailor-cms/cek-common';

export const HTML_EXTENSIONS = ['.html', '.htm'];

export interface UploadedPage {
  url: string;
  publicUrl: string;
  title: string;
}

const isHtmlFile = (file: File) => {
  const fileName = file.name.toLowerCase();
  return HTML_EXTENSIONS.some((extension) => fileName.endsWith(extension));
};

const readTitle = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html').title.trim();

// Lets the frame fit the content (see `addResizeReporter`).
const withResizeReporter = (file: File, html: string) =>
  new File([addResizeReporter(html)], file.name, { type: 'text/html' });

/**
 * Uploads an HTML page through the host's storage service.
 */
export function usePageUpload(): {
  isUploading: Ref<boolean>;
  error: Ref<string>;
  upload: (file?: File | null) => Promise<UploadedPage | null>;
} {
  const storageService = inject<StorageApi>('$storageService');
  const isUploading = ref(false);
  const error = ref('');

  const upload = async (file?: File | null) => {
    if (!file || !storageService) return null;
    error.value = '';
    if (!isHtmlFile(file)) {
      error.value = 'Choose an HTML file (.html or .htm).';
      return null;
    }
    isUploading.value = true;
    try {
      const html = await file.text();
      const { url, publicUrl } = await storageService.upload(
        withResizeReporter(file, html),
      );
      return { url, publicUrl, title: readTitle(html) };
    } catch {
      error.value = 'The file could not be uploaded. Please try again.';
      return null;
    } finally {
      isUploading.value = false;
    }
  };

  return { isUploading, error, upload };
}
