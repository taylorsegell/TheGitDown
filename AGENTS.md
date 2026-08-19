# TheGitDown — agent context

Client-side tool that turns a public GitHub file/directory URL into a zip download or shareable download link. Live product: [gitdown.xyz](https://gitdown.xyz).

Product overview and deep-link URL format: `README.md`.

## Rules

1. **Never commit secrets.** The embedded GitHub PAT has been removed from the working tree. Rotate any previously exposed token; never reintroduce tokens into source. Prefer unauthenticated public API with clear rate-limit UX, or optional user-supplied token stored only in memory / `localStorage` (`src/domain/credentials.ts`). History scrub (`git filter-repo` / BFG) remains operator-owned and out-of-band — see `SECURITY.md`.
2. **Preserve core behavior.** Users paste a GitHub file or directory URL, download a zip, or create a shareable `#/home?url=…` link. Query params `url`, `fileName`, `rootDirectory` must keep working unless a deliberate breaking change is documented.
3. **Do not expand scope into a backend** unless explicitly requested. This is a static SPA talking to the GitHub Contents / raw / Repos APIs from the browser.
4. **Prefer incremental, reversible steps.** Avoid big-bang rewrites that strand the deployed site.
5. **Verify claims against the tree.** Paths and default-branch assumptions in this file go stale fast — re-check before acting.

## Stack (current)

| Layer | Reality |
| --- | --- |
| Runtime | Browser SPA via Vite build (`package.json` / lockfile); no app backend |
| UI framework | React + TypeScript (`react-router-dom` `HashRouter`) |
| Styling | Custom CSS (`src/styles.css`); no Bootstrap |
| Download / zip | Domain module + JSZip + FileSaver (npm) |
| GitHub access | Public API from the browser; optional user PAT in `localStorage` |
| Quality | Vitest, ESLint, `tsc` |
| Hosting | Static assets (`npm run build` → `dist/`); production domain gitdown.xyz |
| License | MIT (`LICENSE`) |

Fork lineage: original DownGit patterns (Minhas Kamal); this remote is `taylorsegell/TheGitDown`.

## Structure

```
index.html                 # Vite HTML shell (#root)
package.json               # scripts + deps (Vite, React, Vitest, JSZip, …)
vite.config.ts
src/
  main.tsx                 # React entry
  App.tsx                  # HashRouter; `/` → `/home`
  styles.css
  pages/
    HomePage.tsx           # schematic: field, buttons, deep-link trigger
  domain/
    githubUrl.ts           # parse GitHub file/dir/repo URLs
    githubHttp.ts          # Contents / raw / Repos fetch + auth header
    credentials.ts         # optional PAT localStorage store
    resolveRef.ts          # default_branch resolution
    download.ts            # walk tree, fetch blobs, progress, archive redirect
    zip.ts                 # JSZip assembly
    types.ts
  ui/
    downloadJob.ts         # download / share job (state + adapters)
    TokenSettings.tsx      # optional PAT localStorage UI
    saveBlob.ts            # FileSaver save adapter
images/                    # brand, screenshot
README.md
SECURITY.md
```

## Commands

```bash
npm install
npm run dev      # Vite dev server
npm test         # Vitest
npm run build    # tsc -b && vite build → dist/
```

Useful extras (not required by the product README): `npm run typecheck`, `npm run lint`, `npm run preview`.

## Product behavior to keep

- Accept GitHub URLs matching roughly `https?://github.com/.+/.+`.
- Whole-repo download: redirect to GitHub's `…/archive/{branch}.zip`.
- File or subdirectory: recurse via Contents API, fetch blobs, zip client-side with JSZip, save via FileSaver.
- Progress: downloaded / total files while processing.
- Deep links: `#/home?url=<GitHub link>&fileName=<name>&rootDirectory=<true|false|name>` (canonical host `https://gitdown.xyz`).
- Default branch: resolve via Repos API `default_branch` (`src/domain/resolveRef.ts`); Contents probe may soft-retry `main` → `master`.

## Conventions

- Download / GitHub logic lives under `src/domain/`; keep UI thin in `src/pages` + `src/ui`.
- Hash routing (`#/home`) — changing to history mode needs host rewrite rules; do not switch casually.
- Expert-to-expert changes: small commits, behavior-preserving when possible.
- Tests colocated as `*.test.ts` / `*.test.tsx` next to modules.

## Boundaries

| Do | Don't |
| --- | --- |
| Improve UX for the single download/link job | Turn the app into a general GitHub client |
| Keep build/test tooling green | Commit `.env`, tokens, or personal API keys |
| Update docs when commands/structure change | Assume `master` is always the default branch |
| Call GitHub APIs from the client (current model) | Add server proxies/auth without an explicit product decision |

## Open hazards

- Embedded PAT removed from the working tree; it may still exist in git history. History scrub remains operator-owned / out-of-band — see `SECURITY.md`.
- Unauthenticated Contents API is rate-limited; optional user token mitigates but large trees can still fail.
- Partial zip / walk failures need clear UX (improve when touching download error paths).
- Binary / large-file paths may use raw.githubusercontent.com with weaker error detail.
