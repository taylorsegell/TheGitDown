# Milestone 4: React shell (UI over deep module)
- Saga: modernize-gitdown-20260810-0858
- Depends on: 03-deep-download-module

## Goal
Ship the real product UI on React: URL input, Download, Create share link (current origin), progress, typed errors, optional PAT settings (localStorage), deep-link auto-download, functional dark-green visual refresh, no contact form. Download module has zero UI leakage. Covers candidates 1 (UI), 3, 7.

## Milestone validation criteria
1. `npm run typecheck && npm test && npm run build` exit 0.
2. Manual smoke checklist in SAGA exit criteria items 4 (all bullets) pass on `npm run preview`.
3. Home page source does not import toastr; progress is React state from `DownloadEvent`s.
4. Share link prefix is `window.location.origin + "/#/home?url="` (encodeURIComponent on url).
5. Contact form markup absent.

## Tasks
- 01-home-download-ui — main download/share/progress/errors + deep links; depends on: none
- 02-token-settings-ui — PAT set/clear localStorage UI; depends on: 01-home-download-ui
- 03-visual-refresh — layout/a11y/brand polish; remove contact; depends on: 01-home-download-ui
