# Task 5.2: Update README + AGENTS.md
- Milestone: 5
- Depends on: 5.1

## Scope
Rewrite tooling/stack sections for Vite/React/TS authenticity. Document optional PAT, rate limits, deep links, SECURITY.md. Keep product voice reasonably concise.

## Owned files/surfaces
- `README.md`
- `AGENTS.md` (and `CLAUDE.md` symlink remains valid)
- `SECURITY.md` (tweak if needed for post-migration state)

## Interfaces produced/consumed
- None

## Validation method
manual doc review

## Validation criteria (the contract)
1. README includes exact commands: `npm install`, `npm run dev`, `npm test`, `npm run build`.
2. README deep-link example uses `https://gitdown.xyz/#/home?url=…` (not minhaskamal host).
3. AGENTS.md stack table: Runtime = browser via Vite build; UI = React; no AngularJS as current stack.
4. AGENTS.md Commands section matches README.
5. AGENTS.md states embedded PAT removed from tree; history scrub still operator-owned.
6. Must not claim a backend exists.

## Evidence required
- Quoted snippets of Commands + stack table.
