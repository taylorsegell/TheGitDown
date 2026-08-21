# TheGitDown — agent context

Client-side tool that turns a public GitHub file/directory URL into a zip download or shareable download link. Live product: [gitdown.xyz](https://gitdown.xyz). Companion MV3 extension in `packages/extension` (WXT, npm package name `gitdown`).

Product overview, deep-link URL format, and unpacked-load steps: `README.md`.

## Rules

1. **Never commit secrets.** The embedded GitHub PAT has been removed from the working tree. Rotate any previously exposed token; never reintroduce tokens into source. Prefer unauthenticated public API with clear rate-limit UX, or an optional user-supplied token:
   - Website: in-memory / `localStorage` via `createLocalStorageCredentialStore` in `packages/core` (`packages/core/src/credentials.ts`).
   - Extension: `chrome.storage.local` via `packages/extension/lib/credentialStore.ts`. Service worker reads the token; Options writes it. The two stores are separate; they do not sync.
   History scrub (`git filter-repo` / BFG) remains operator-owned and out-of-band — see `SECURITY.md`.
2. **Preserve core behavior.** Users paste a GitHub file or directory URL, download a zip, or create a shareable `#/home?url=…` link. Query params `url`, `fileName`, `rootDirectory` must keep working unless a deliberate breaking change is documented.
3. **Do not expand scope into a backend** unless explicitly requested. The website is a static SPA; the extension talks to GitHub from the service worker. There is no TheGitDown backend for the token.
4. **Prefer incremental, reversible steps.** Avoid big-bang rewrites that strand the deployed site.
5. **Verify claims against the tree.** Paths and default-branch assumptions in this file go stale fast — re-check before acting.

## Stack (current)

| Layer | Reality |
| --- | --- |
| Workspace | npm workspaces: `packages/core` (`@gitdown/core`), `packages/extension` (`gitdown`) |
| Runtime | Browser SPA via Vite build (`package.json` / lockfile); MV3 extension via WXT; no app backend |
| UI framework | React + TypeScript (`react-router-dom` `HashRouter` on the site; WXT React popup/options) |
| Styling | Custom CSS (`src/styles.css`); no Bootstrap |
| Download / zip | `@gitdown/core` + JSZip; site saves via FileSaver; extension via `chrome.downloads` |
| GitHub access | Public API from the client; site PAT in `localStorage`; extension PAT in `chrome.storage.local` |
| Quality | Vitest, ESLint, `tsc` |
| Hosting | Static assets (`npm run build` → `dist/`); production domain gitdown.xyz |
| License | MIT (`LICENSE`) |

Fork lineage: original DownGit patterns (Minhas Kamal); this remote is `taylorsegell/TheGitDown`.

## Structure

```
index.html                 # Vite HTML shell (#root)
package.json               # workspaces + web scripts + ext:* wrappers
vite.config.ts
src/
  main.tsx                 # React entry
  App.tsx                  # HashRouter; `/` → `/home`
  styles.css
  pages/
    HomePage.tsx           # paste URL, download / share, progress, deep-link
  ui/
    downloadJob.ts         # download / share job (state + adapters)
    TokenSettings.tsx      # optional PAT localStorage UI
    saveBlob.ts            # FileSaver save adapter
packages/
  core/                    # @gitdown/core (shared domain; not src/domain)
    src/
      githubUrl.ts         # parse GitHub file/dir/repo URLs
      githubHttp.ts        # Contents / raw / Repos fetch + auth header
      credentials.ts       # optional PAT localStorage store (web)
      resolveRef.ts        # default_branch resolution
      download.ts          # walk tree, fetch blobs, progress, archive redirect
      zip.ts               # JSZip assembly
      downloadErrorMessage.ts
      types.ts
      index.ts
  extension/               # WXT MV3 companion (package name gitdown)
    wxt.config.ts
    entrypoints/
      background.ts        # service worker
      popup/               # GitHub-tab download UI
      options/             # optional PAT → chrome.storage.local
    lib/
      credentialStore.ts   # chrome.storage.local PAT store
      detect.ts
      menu.ts
      downloadJob.ts
      chromeDownloads.ts
      messages.ts
images/                    # brand, screenshot
README.md
SECURITY.md
```

## Commands

```bash
npm install
npm run dev               # Vite dev server
npm test                  # Vitest (root / web)
npm run build             # tsc -b && vite build → dist/
npm run ext:dev           # npm run dev -w gitdown
npm run ext:build         # npm run build -w gitdown → packages/extension/.output/chrome-mv3
npm run ext:build:firefox # npm run build:firefox -w gitdown → packages/extension/.output/firefox-mv3
```

Load unpacked: Chrome → `chrome://extensions` → Developer mode → Load unpacked → `packages/extension/.output/chrome-mv3`. Firefox → `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `packages/extension/.output/firefox-mv3/manifest.json`. See `README.md` and `packages/extension/README.md`.

Useful extras (not required by the product README): `npm run typecheck`, `npm run lint`, `npm run preview`; extension `npm test -w gitdown`.

## Product behavior to keep

- Accept GitHub URLs matching roughly `https?://github.com/.+/.+`.
- Whole-repo download: site redirects to GitHub's `…/archive/{branch}.zip`; extension downloads that archive URL via `chrome.downloads` (do not navigate the GitHub tab).
- File or subdirectory: recurse via Contents API, fetch blobs, zip client-side with JSZip; site saves via FileSaver, extension via `chrome.downloads`.
- Progress: downloaded / total files while processing.
- Deep links: `#/home?url=<GitHub link>&fileName=<name>&rootDirectory=<true|false|name>` (canonical host `https://gitdown.xyz`).
- Default branch: resolve via Repos API `default_branch` (`packages/core/src/resolveRef.ts`); Contents probe may soft-retry `main` → `master`.

## Conventions

- Download / GitHub logic lives in `packages/core` (`@gitdown/core`); keep web UI thin in `src/pages` + `src/ui`. Do not recreate `src/domain`.
- Extension-only adapters (chrome.storage, chrome.downloads, menus, messages) stay in `packages/extension`.
- Hash routing (`#/home`) — changing to history mode needs host rewrite rules; do not switch casually.
- Expert-to-expert changes: small commits, behavior-preserving when possible.
- Tests colocated as `*.test.ts` / `*.test.tsx` next to modules.

## Boundaries

| Do | Don't |
| --- | --- |
| Improve UX for the single download/link job | Turn the app into a general GitHub client |
| Keep build/test tooling green | Commit `.env`, tokens, or personal API keys |
| Update docs when commands/structure change | Assume `master` is always the default branch |
| Call GitHub APIs from the client (site or SW) | Add server proxies/auth without an explicit product decision |
| Load the extension unpacked / as a Firefox temporary add-on | Invent a TheGitDown backend or two-way PAT sync with the site |

## Open hazards

- Embedded PAT removed from the working tree; it may still exist in git history. History scrub remains operator-owned / out-of-band — see `SECURITY.md`.
- Unauthenticated Contents API is rate-limited; optional user token mitigates but large trees can still fail.
- Website `localStorage` PAT and extension `chrome.storage.local` PAT are independent.
- Partial zip / walk failures need clear UX (improve when touching download error paths).
- Binary / large-file paths may use raw.githubusercontent.com with weaker error detail.
