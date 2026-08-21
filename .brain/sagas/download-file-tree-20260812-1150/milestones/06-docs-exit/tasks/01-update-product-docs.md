# Task 6.1: Update product docs
- Milestone: 6
- Depends on: none

## Scope
Update README.md, PRODUCT.md, and AGENTS.md/CLAUDE.md for browse-first UX, Tailwind/shadcn stack, and deep-link breaking change. Keep deep-link query param names documented.

## Owned files/surfaces
- `README.md`
- `PRODUCT.md`
- `AGENTS.md`
- `CLAUDE.md`
- Optional: `SECURITY.md` only if token UI copy paths change (skip if unchanged)

## Interfaces produced/consumed
none

## Validation method
doc review checklist (orchestrator reads files)

## Validation criteria (the contract)
1. README states Browse opens a file tree; downloads are explicit actions; single file is raw; folders zip.
2. README states `#/home?url=…` opens the tree (not auto-download); documents this as a behavior change if previously auto-download.
3. PRODUCT.md purpose/positioning updated away from “one-click deep link that starts download” as the primary success definition.
4. AGENTS/CLAUDE stack mentions Tailwind + shadcn; structure lists tree components path.
5. No false claims of backend or code preview.

## Evidence required
- Paths updated + quoted one-liner from README for deep-link behavior
