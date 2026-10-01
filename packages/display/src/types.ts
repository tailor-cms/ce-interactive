export const PageStatus = {
  Empty: 'EMPTY',
  Loading: 'LOADING',
  Loaded: 'LOADED',
  Failed: 'FAILED',
} as const;

export type PageStatus = (typeof PageStatus)[keyof typeof PageStatus];
