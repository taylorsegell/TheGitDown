# TheGitDown — agent context

Client-side tool that turns a public GitHub file/directory URL into a zip download or shareable download link. Live product: [gitdown.xyz](https://gitdown.xyz). Repo is a few years old; treat this file as the working baseline for modernization, not as a finished stack.

Product overview and deep-link URL format: `README.md`.

## Rules

1. **Never commit secrets.** The hardcoded GitHub PAT was stripped from `app/home/down-git.js` in the working tree. Rotate any previously exposed token; never reintroduce tokens into source. Prefer unauthenticated public API with clear rate-limit UX, or optional user-supplied token stored only in memory / localStorage. History scrub (`git filter-repo` / BFG) remains operator-owned and out-of-band — see `SECURITY.md`.
2. **Preserve core behavior while modernizing.** Users paste a GitHub file or directory URL, download a zip, or create a shareable `#/home?url=…` link. Query params `url`, `fileName`, `rootDirectory` must keep working unless a deliberate breaking change is documented.
3. **Do not expand scope into a backend** unless explicitly requested. Current app is a static SPA talking to the GitHub Contents / raw APIs from the browser.
4. **Prefer incremental, reversible steps.** Introduce tooling and a modern framework in deliberate phases; avoid big-bang rewrites that strand the deployed site.
5. **Verify claims against the tree.** Paths, CDNs, and default-branch assumptions in this file go stale fast — re-check before acting.

## Stack (current)

| Layer | Reality |
| --- | --- |
| Runtime | Browser only — no Node build, no `package.json`, no bundler |
| UI framework | AngularJS **1.5.6** (`ngRoute`) via Google CDN |
| CSS / chrome | Bootstrap **3.3.6** + custom `app/site.css` |
| Utilities | jQuery **2.2.4**, JSZip **3.0.0** (cdn.rawgit — brittle), FileSaver (`lib/filesaver.min.js`), angular-toastr **2.0.0** (`lib/`) |
| Hosting | Static files (`index.html` entry); production domain gitdown.xyz |
| License | MIT (`LICENSE`) |

Fork lineage: original DownGit patterns (Minhas Kamal); this remote is `taylorsegell/TheGitDown`.

## Structure

```
index.html              # shell, CDN + local script tags, ng-app="TheGitDown"
app/
  app.js                # module + routes + toastr config
  site.css              # global / home / footer styles
  home/
    home.html           # main UI
    home.js             # /home route, URL validation, download / link actions
    down-git.js         # TheGitDownService — parse URL, walk Contents API, zip
lib/                    # vendored minified third-party assets
images/                 # brand, screenshot, processing gif
README.md               # product copy + deep-link docs
```

No tests, linters, CI, or `.gitignore` in tree today.

## Commands

Static site — no install/build yet.

```bash
# Serve locally (pick one)
npx --yes serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` (or the port `serve` prints). After a modern toolchain lands, replace this section with the real package-manager scripts.

## Product behavior to keep

- Accept GitHub URLs matching roughly `https?://github.com/.+/.+`.
- Whole-repo download: redirect to GitHub's `…/archive/{branch}.zip`.
- File or subdirectory: recurse via Contents API, fetch blobs, zip client-side with JSZip, save via FileSaver.
- Progress: `downloadedFiles` / `totalFiles` while processing.
- Deep links: `#/home?url=<GitHub link>&fileName=<name>&rootDirectory=<true|false|name>`.
- Default branch fallback in code is still `master` — update carefully when touching branch resolution (many repos use `main`).

Stale bits to fix during modernization:

- Share-link prefix in `home.js` still points at `https://minhaskamal.github.io/TheGitDown/` — should use the current origin / gitdown.xyz.
- Contact form in `home.html` has no wired backend.
- cdn.rawgit and ancient CDN pins are deployment risks.

## Modernization north star

Goal: bring the stack and UX into a maintainable 2026 baseline without losing the one-job product.

Suggested direction (decide explicitly before large diffs; not mandated until chosen):

| Area | From | Toward (candidates) |
| --- | --- | --- |
| App framework | AngularJS 1.5 | Vite + TypeScript + React or solid vanilla TS |
| Styling | Bootstrap 3 + ad-hoc CSS | Coherent design system; ditch Bootstrap 3 |
| Dependencies | CDN script tags + `lib/` | Package manager + lockfile; pin versions |
| GitHub access | Hardcoded PAT | Public API + rate-limit messaging; optional user token |
| Quality | None | Lint, format, unit tests for URL parse / zip path logic |
| UX | Bootstrap form + gif progress | Clear empty/error/rate-limit states, accessible controls, mobile-first layout, honest progress |
| Deploy | Ad-hoc static | Documented static host (Pages / Cloudflare / etc.) + preview |

Phase order that usually hurts least:

1. Security — strip secrets; fix auth strategy.
2. Tooling — Vite (or similar), TS, lockfile; keep behavior identical.
3. Logic extraction — pure functions for URL parse / tree walk / zip naming; add tests.
4. UI rewrite — modern components + visual refresh.
5. Polish — deep-link canonical host, branch defaults, error copy, a11y.

## Conventions (until replaced)

- AngularJS modules: `TheGitDown`, `homeModule`, `TheGitDownModule`.
- Download logic lives in `TheGitDownService` (`down-git.js`); keep that boundary when porting.
- Hash routing (`#/home`) — changing to history mode requires host rewrite rules; do not switch casually.
- Expert-to-expert changes: small commits, behavior-preserving when possible.

## Boundaries

| Do | Don't |
| --- | --- |
| Improve UX for the single download/link job | Turn the app into a general GitHub client |
| Add build/test tooling as part of modernization | Commit `.env`, tokens, or personal API keys |
| Update docs when commands/structure change | Assume `master` is always the default branch |
| Call GitHub APIs from the client (current model) | Add server proxies/auth without an explicit product decision |

## Open hazards

- Previously exposed PAT may still exist in git history (stripped from working tree; history scrub is operator-owned / out-of-band — see `SECURITY.md`).
- Unauthenticated Contents API is rate-limited; large trees fail opaquely today.
- No error boundaries around failed directory walks (partial zips / silent console logs).
- Binary / large-file paths fall back to raw.githubusercontent.com with weak error UX.
