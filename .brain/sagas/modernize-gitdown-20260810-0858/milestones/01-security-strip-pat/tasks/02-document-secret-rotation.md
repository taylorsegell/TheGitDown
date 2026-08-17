# Task 1.2: Document secret rotation (out-of-band history)
- Milestone: 1
- Depends on: 1.1

## Scope
Document that a PAT was previously exposed, that operators must rotate it, that this repo must never commit tokens, and that rewriting git history (`git filter-repo` / BFG) is a **manual** step outside this saga.

## Owned files/surfaces
- `SECURITY.md` (create)
- `README.md` (add a short Security subsection linking to `SECURITY.md`)
- `AGENTS.md` (update Open hazards / Rules to say PAT stripped from tree; history scrub still operator-owned)

## Interfaces produced/consumed
- None (docs only)

## Validation method
manual inspection of file contents

## Validation criteria (the contract)
1. `SECURITY.md` exists and includes all three: rotate exposed tokens; never commit PATs; history scrub is out-of-band / not done by the modernization saga.
2. `README.md` has a Security blurb with a relative link to `SECURITY.md`.
3. `AGENTS.md` no longer claims the PAT “currently embeds” as present-tense hazard without noting it was removed from the working tree (hazard may remain “may exist in git history”).
4. Must not change: product deep-link docs behavior description except host names if already wrong — prefer not to expand README scope beyond security + existing accuracy.

## Evidence required
- Paths of files touched + quoted headings from `SECURITY.md`.
- `rg -n "filter-repo|out-of-band|rotate" SECURITY.md` showing hits.
