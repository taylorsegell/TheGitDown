# Task 4.1: Home download / share / deep-link UI
- Milestone: 4
- Depends on: none (within M4; requires M3 integrated)

## Scope
Implement HomePage that wires `downloadGitHubPath` + `createGitHubHttp` + credentials store. Features:
- URL text input; Enter triggers download
- **Download** button → starts download for current URL (update hash query `url` so deep links stay shareable, OR call download directly **and** sync hash — must support `#/home?url=` on load auto-download like legacy)
- **Create Download Link** → shows textarea with `origin + "/#/home?url=" + encodeURIComponent(url)`
- Progress: “Downloaded X of Y files” while events are `progress`
- On `redirect` → `window.location.assign(url)`
- On `done` → save blob via `file-saver` or `<a download>` helper in UI layer (`src/ui/saveBlob.ts`)
- On `fail` → visible error message mapped from `DownloadError.kind` (rate_limited copy must mention GitHub rate limit / optional token)
- Validate URL with same rules as domain (prefer calling `parseGitHubUrl`)

Query params `fileName` and `rootDirectory` read from the hash query string and passed through.

## Owned files/surfaces
- `src/pages/HomePage.tsx` (and small hooks/components under `src/pages/` or `src/ui/` as needed)
- `src/ui/saveBlob.ts`
- Router already from M2 — may adjust query reading
- Must not modify `src/domain/*` except bugfixes; if bugfix needed, keep minimal and note in PROGRESS

## Interfaces produced/consumed
- Consumes `downloadGitHubPath`, `parseGitHubUrl`, `createGitHubHttp`, `createLocalStorageCredentialStore`
- Hash query: `url`, `fileName`, `rootDirectory`

## Validation method
unit tests for pure helpers (save/error mapping) + manual browser checklist

## Validation criteria (the contract)
1. With mocked download generator in a component test **or** integration test: `fail/rate_limited` shows rate-limit message containing “rate” (case-insensitive).
2. Share link helper unit test: given origin `https://gitdown.xyz` and url `https://github.com/a/b`, result is `https://gitdown.xyz/#/home?url=https%3A%2F%2Fgithub.com%2Fa%2Fb` (encoding exact).
3. Manual: deep link with public small file URL auto-starts download flow (progress or completion) — document URL used in evidence.
4. Manual: Create Download Link does not contain `minhaskamal.github.io`.
5. Must not render contact form fields.

## Evidence required
- Test output for share-link + error mapping.
- Manual smoke notes (URLs tried, pass/fail).
