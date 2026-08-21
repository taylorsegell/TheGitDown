# Milestone 3: Deep Git download module
- Saga: modernize-gitdown-20260810-0858
- Depends on: 02-vite-tooling

## Goal
Implement the deepened download domain behind a small interface: URL parse, default-branch resolve, credential-aware GitHub HTTP adapter, Contents walk + zip via adapters, typed `DownloadEvent` stream. No React UI beyond what exists; no toastr; no mutating `.val` progress objects. Covers architecture candidates 2, 4, 5 (and adapter half of 1).

## Milestone validation criteria
1. All task unit tests pass via `npm test`.
2. `npm run typecheck` exits 0.
3. Public download entry is async-iterable or async generator of `DownloadEvent` (see SAGA.md); callers never pass toastr.
4. Mocked rate-limit (HTTP 403/429 with rate-limit messaging) yields `{ type: "fail", error: { kind: "rate_limited" } }` — never a silent partial zip.
5. Blob fetch failure yields `partial` or `fail` — never `done` with missing files omitted quietly.
6. Whole-repo path with `ref: null` resolves default branch via Repos API mock returning e.g. `main`, and produces archive URL using that ref (function returning URL string is acceptable if navigation is a UI concern — prefer `getArchiveUrl(ref)` pure + event or result for UI to navigate).

## Tasks
- 01-parse-github-url — pure parse + rootDirectory/fileName policy + tests; depends on: none
- 02-credential-store — localStorage CredentialStore + tests; depends on: none
- 03-github-http-adapter — fetch adapter + error classification; depends on: 02-credential-store
- 04-default-branch-resolve — Repos API + main/master fallback; depends on: 03-github-http-adapter
- 05-download-walk-zip — walk + zip + events + tests; depends on: 01, 03, 04
