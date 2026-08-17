# Task 6.2: Saga exit verification
- Milestone: 6
- Depends on: 6.1

## Scope
Run full toolchain and walk each saga exit criterion from `SAGA.md`, recording pass/fail evidence in `PROGRESS.md`. Produce a short manual verification script for the user (Phase 3).

## Owned files/surfaces
- `.brain/sagas/download-file-tree-20260812-1150/PROGRESS.md` only

## Interfaces produced/consumed
none

## Validation method
combination: `npm test`, `npm run typecheck`, `npm run build`, plus documented manual checklist (computer use unavailable)

## Validation criteria (the contract)
1. Every saga exit criterion has a `pass`/`fail` line with evidence pointer in `PROGRESS.md`.
2. Toolchain commands recorded with exit code 0.
3. Manual checklist includes: directory Browse → tree; file raw download; folder zip; whole-repo redirect; deep link opens tree; brand still green-primary.

## Evidence required
- Updated PROGRESS.md exit section
- Manual checklist text for the user
