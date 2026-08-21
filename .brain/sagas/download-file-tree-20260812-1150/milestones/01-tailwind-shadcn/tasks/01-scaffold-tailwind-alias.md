# Task 1.1: Scaffold Tailwind + path alias
- Milestone: 1
- Depends on: none

## Scope
Install and configure Tailwind for Vite + React + TS. Add TypeScript/Vite path alias `@` → `src`. Do not migrate HomePage styles yet.

## Owned files/surfaces
- `package.json` / lockfile (Tailwind-related deps only)
- `vite.config.ts` (alias + Tailwind plugin if needed)
- `tsconfig.app.json` / `tsconfig.json` (paths)
- Tailwind entry CSS file (e.g. `src/index.css` or agreed name) — may coexist with `styles.css` until M5
- `src/main.tsx` only if needed to import the new CSS entry alongside or instead of partial styles

## Interfaces produced/consumed
- Imports like `import { x } from '@/…'` resolve in Vite and `tsc`.

## Validation method
unit/integration via toolchain: `npm run typecheck`, `npm run build`, `npm test`

## Validation criteria (the contract)
1. Path alias `@/` maps to `src/` in both Vite and TypeScript configs.
2. Tailwind utility classes applied to a trivial element in a Vitest/jsdom or build smoke are present in the production CSS output (or Tailwind content paths include `./src/**/*.{ts,tsx}`).
3. Existing tests still pass; no browse/tree feature code added.
4. No secrets committed.

## Evidence required
- Command output for `npm test`, `npm run typecheck`, `npm run build`
- List of config files changed + alias proof (snippet)
