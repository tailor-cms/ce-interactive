import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PAGE = path.join(__dirname, 'page.html');
export const DOCUMENT = path.join(__dirname, 'test-document.txt');

// Content height of `page.html`; the frame should follow it
export const PAGE_HEIGHT = 900;
