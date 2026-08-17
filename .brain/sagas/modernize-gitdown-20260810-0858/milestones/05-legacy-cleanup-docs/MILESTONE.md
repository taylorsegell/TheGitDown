# Milestone 5: Legacy cleanup + docs
- Saga: modernize-gitdown-20260810-0858
- Depends on: 04-react-shell

## Goal
Remove Angular/CDN/legacy entry from the product surface; align README + AGENTS.md with the new toolchain and auth model; ensure saga exit criteria are meetable from a clean install.

## Milestone validation criteria
1. Shipped Vite build does not include AngularJS or cdn.rawgit.
2. Legacy paths `app/app.js`, `app/home/*.js`, `lib/angular-toastr*` are deleted **or** moved under `legacy/` and excluded from build — **prefer delete** once React parity confirmed.
3. README documents `npm install`, `npm run dev`, `npm test`, `npm run build`, deep-link format on gitdown.xyz, optional PAT, SECURITY.md link.
4. AGENTS.md stack table matches reality (Vite/React/TS); commands section updated; open hazard about embedded PAT marked resolved in tree / history scrub still operator-owned.
5. Full saga exit criteria 1–7 can be checked; note results in PROGRESS.md.

## Tasks
- 01-delete-legacy-angular — remove unused Angular/CDN/lib entry assets; depends on: none
- 02-update-docs — README + AGENTS.md final sync; depends on: 01-delete-legacy-angular
- 03-saga-exit-verification — run full exit checklist; depends on: 02-update-docs
