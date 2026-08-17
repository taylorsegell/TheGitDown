# Task 2.1: Scaffold npm / Vite / TS / Vitest toolchain
- Milestone: 2
- Depends on: none (within milestone; milestone depends on M1)

## Scope
Create the Node toolchain only: dependencies, configs, scripts. Do not implement download logic. Do not delete legacy `app/` yet.

## Owned files/surfaces
- `package.json`, `package-lock.json` (generated)
- `vite.config.ts`
- `tsconfig.json`, `tsconfig.node.json` (as needed)
- `vitest` config (in vite config or `vitest.config.ts`)
- `eslint` config if added
- `.gitignore`
- Optional: `.nvmrc` pinning Node 24 — allowed

## Interfaces produced/consumed
Scripts (exact names):
- `dev` → Vite dev server
- `build` → `tsc -b` or vite build per standard Vite React-TS template
- `preview` → Vite preview
- `test` → Vitest
- `typecheck` → `tsc --noEmit` (or project references)
- `lint` → eslint (if configured; if skipped, `lint` may be omitted **only if** `typecheck` exists — prefer both)

Dependencies must include: `react`, `react-dom`, `typescript`, `vite`, `@vitejs/plugin-react`, `vitest`, `jsdom` (or happy-dom).

## Validation method
unit tests + command execution

## Validation criteria (the contract)
1. `npm ci` exits 0.
2. `npm run typecheck` exits 0 with at least one `.ts`/`.tsx` file in `src/` (task 2.2 may add it — if this task lands first, include a stub `src/vite-env.d.ts` + empty module so tsc passes).
3. `npm test` exits 0 with ≥1 passing test file (e.g. `src/smoke.test.ts` asserting `true`).
4. `.gitignore` contains `node_modules`, `dist`, and `.env`.
5. Must not commit secrets; must not reintroduce PAT.

## Evidence required
- Command transcripts for `npm ci`, `npm run typecheck`, `npm test`.
- List of config files created.
