# GitDown extension

WXT Manifest V3 companion (npm package name `gitdown`). Zip and GitHub URL logic come from `@gitdown/core`.

## Build

From the repo root:

```bash
npm install
npm run ext:dev            # WXT dev (`npm run dev -w gitdown`)
npm run ext:build          # Chrome MV3 (`npm run build -w gitdown`)
npm run ext:build:firefox  # Firefox MV3 (`npm run build:firefox -w gitdown`)
```

## Load unpacked (Chrome)

1. Run `npm run ext:build`.
2. Open `chrome://extensions`.
3. Turn on Developer mode.
4. Click **Load unpacked**.
5. Choose `packages/extension/.output/chrome-mv3`.

## Firefox temporary add-on

1. Run `npm run ext:build:firefox`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on**.
4. Choose `packages/extension/.output/firefox-mv3/manifest.json`.

## Token

Optional PAT on the Options page is stored in `chrome.storage.local`. It is separate from gitdown.xyz `localStorage`. There is no TheGitDown backend for the token.

Privacy policy: https://gitdown.xyz/privacy.html

## Store listing

Paste-ready Chrome Web Store / AMO copy, permission justifications, and asset paths: [STORE.md](./STORE.md).

```bash
npm run zip            # from packages/extension, or `npm run ext:zip` at repo root
npm run zip:firefox
```

