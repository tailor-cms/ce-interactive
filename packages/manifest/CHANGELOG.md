# @tailor-cms/ce-interactive-manifest

## 1.0.0

### Major Changes

- Migrate to CEK 2.3.1. Packages are now ESM-only: CommonJS builds and the `main` / `require` entry points are removed, and the manifest and server packages emit `index.js` / `index.d.ts` instead of `index.mjs` / `index.d.mts`. The top toolbar is removed; HTML upload, replace and remove now happen in the element body through the `TailorFileInput` dropzone, and the height setting moved to the side toolbar.
