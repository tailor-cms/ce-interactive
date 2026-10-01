export const FRAME_SANDBOX = 'allow-scripts allow-popups allow-pointer-lock';

// Used until the page reports its height
export const DEFAULT_HEIGHT = 480;
export const MIN_HEIGHT = 120;
export const MAX_HEIGHT = 4000;

// The host can't measure a sandboxed page, so the page reports its own
// height and the frame follows it.
export const RESIZE_MESSAGE = 'tailor:interactive:resize';

// Some pages grow whenever the frame does (e.g. sized to `100vh`); after
// this many equal steps up, the frame stops following.
const RUNAWAY_STEPS = 30;

// Added to every stored file; does nothing outside a frame.
export const RESIZE_SCRIPT: string = `<script data-tailor-resize>(() => {
  if (window.parent === window) return;
  const root = document.documentElement;
  const post = () => window.parent.postMessage({
    type: '${RESIZE_MESSAGE}',
    height: Math.ceil(root.getBoundingClientRect().height),
  }, '*');
  new ResizeObserver(post).observe(root);
})();</script>`;

const RESIZE_TAG = /<script data-tailor-resize>[\s\S]*?<\/script>/gi;

// Adds the reporter before the last `</body>`.
export function addResizeReporter(html: string): string {
  const page = stripResizeReporter(html);
  const bodyEnd = page.toLowerCase().lastIndexOf('</body>');
  if (bodyEnd === -1) return `${page}${RESIZE_SCRIPT}`;
  return `${page.slice(0, bodyEnd)}${RESIZE_SCRIPT}${page.slice(bodyEnd)}`;
}

export function stripResizeReporter(html: string): string {
  return html.replace(RESIZE_TAG, '');
}

export function listenForFrameHeight(
  getFrameWindow: () => Window | null | undefined,
  onHeight: (height: number) => void,
): () => void {
  const isRunaway = detectRunaway();
  const onMessage = ({ source, data }: MessageEvent) => {
    if (!source || source !== getFrameWindow()) return;
    if (data?.type !== RESIZE_MESSAGE) return;
    const height = Number(data.height);
    if (!Number.isFinite(height) || isRunaway(height)) return;
    onHeight(height);
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}

// True once heights keep climbing by the same step; a drop resets it.
function detectRunaway(): (height: number) => boolean {
  let lastHeight = 0;
  let lastStep = 0;
  let steps = 0;
  return (height) => {
    const step = height - lastHeight;
    const isSameStep = step > 0 && Math.abs(step - lastStep) <= 1;
    if (step <= 0) steps = 0;
    else steps = isSameStep ? steps + 1 : 1;
    if (steps >= RUNAWAY_STEPS) return true;
    lastHeight = height;
    lastStep = step;
    return false;
  };
}

// The reported height when there is one, else the saved one.
export function resolveFrameHeight(
  savedHeight?: number | null,
  reportedHeight?: number | null,
): number {
  if (reportedHeight) return clampHeight(reportedHeight);
  return savedHeight || DEFAULT_HEIGHT;
}

export function clampHeight(height: number): number {
  return Math.min(Math.max(Math.round(height), MIN_HEIGHT), MAX_HEIGHT);
}
