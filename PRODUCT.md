# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are developers who need a public GitHub subdirectory (or file) as a zip without cloning the whole repository. Typical moment: grab a folder from someone else's tree, or package a path for sharing, without installing git tooling or pulling unrelated history.

## Product Purpose

TheGitDown turns a public GitHub file or directory URL into a client-side zip download, or a shareable one-click deep link that starts that download. Success is a correct zip (or GitHub whole-repo archive redirect) with clear progress and failure feedback, without leaving the browser or depending on a TheGitDown backend.

## Positioning

Runs entirely in the browser against GitHub's public APIs: paste a file/dir URL, download a zip of that path, or mint a `#/home?url=…` share link. Optional user-supplied PAT stays in this browser's `localStorage` only. Differentiator vs cloning or GitHub's full-repo archive: subdirectory/file zip without clone, plus shareable deep links that auto-start download.

## Operating Context

- Live product: [gitdown.xyz](https://gitdown.xyz)
- Hash-routed SPA (`#/home`); deep links carry `url`, optional `fileName`, optional `rootDirectory`
- Whole-repo downloads redirect to GitHub's `…/archive/{branch}.zip`
- File/subdirectory trees walk Contents API, fetch blobs, zip with JSZip, save via FileSaver
- Unauthenticated GitHub API is rate-limited; optional token raises limits for larger trees
- Fork lineage: DownGit patterns; this product is TheGitDown by Taylor Segell

## Capabilities and Constraints

**Capabilities**
- Accept public GitHub URLs roughly matching `https?://github.com/.+/.+`
- Download zip for file or directory; create shareable origin-based `#/home?url=…` links
- Preserve query params `url`, `fileName`, `rootDirectory` unless a deliberate breaking change is documented
- Resolve default branch via Repos API; soft-retry Contents probe `main` → `master` when needed
- Optional PAT UI; token never sent to a TheGitDown server (there isn't one)

**Constraints**
- Static SPA only — no app backend unless explicitly product-decided later
- Do not expand into a general GitHub client
- Never commit secrets; never reintroduce embedded PATs
- History scrub of previously exposed tokens remains operator-owned / out-of-band
- Hash routing must not switch casually (needs host rewrite rules for history mode)

**Undecided**
- Formal accessibility standard / WCAG target not set beyond sensible defaults
- No product pricing, SLA, or enterprise claims

## Brand Commitments

- Product name: **TheGitDown** (live domain gitdown.xyz)
- Author credit: Taylor Segell; MIT license
- Brand mark: `images/TheGitDown.svg`
- Supporting assets: `images/espresso.svg` (Buy Me a Coffee), optional social credits in UI
- Voice in product copy: direct, technical, no-backend honesty (“runs in your browser”)

## Evidence on Hand

- Live site and README deep-link examples
- Brand and espresso SVGs under `images/`
- Product screenshot referenced as `images/screenshot.png` in README (presence may vary in tree)
- No customer testimonials, press quotes, benchmarks, or pricing — do not invent them

## Product Principles

1. **One job** — File/dir URL → zip or shareable download link; nothing that dilutes that job.
2. **Client-only trust** — Browser talks to GitHub; optional secrets stay local; never imply a TheGitDown server holds data.
3. **Deep-link continuity** — Existing `#/home?url=…` contracts stay working across redesigns unless breaking change is explicit.
4. **Honest limits** — Rate limits, large trees, and failures get clear UX; don't paper over GitHub API constraints.
5. **Incremental change** — Prefer reversible steps that keep the deployed static site usable.
