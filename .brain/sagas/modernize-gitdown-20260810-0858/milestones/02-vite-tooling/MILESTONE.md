# Milestone 2: Vite + TypeScript + React tooling
- Saga: modernize-gitdown-20260810-0858
- Depends on: 01-security-strip-pat

## Goal
Introduce a reproducible toolchain (npm lockfile, Vite, TypeScript, React, Vitest, lint/typecheck scripts, `.gitignore`) so later milestones can land domain code and UI as modules with tests. Ship a minimal React shell that boots under Vite without yet replacing download behavior (legacy Angular may remain on disk until M5, but **Vite entry must not load Angular CDNs**).

## Milestone validation criteria
1. `package.json` + `package-lock.json` exist; `npm ci` succeeds.
2. `npm run typecheck`, `npm test`, and `npm run build` exit 0 (tests may be a single smoke test).
3. `npm run dev` starts Vite; browser root renders a React app shell containing the brand name “TheGitDown” (placeholder OK).
4. `.gitignore` ignores `node_modules/`, `dist/`, `.env*`, OS junk; does not ignore the saga `.brain/sagas/` unless user prefers — **do not gitignore `.brain/sagas`** (local saga state; may stay untracked by choice but don’t force-ignore unless already policy). Prefer ignoring only build artifacts.
5. No dependency on `cdn.rawgit.com` in the Vite entry HTML.

## Tasks
- 01-scaffold-toolchain — package.json, vite, tsconfig, vitest, eslint, gitignore, scripts; depends on: none
- 02-minimal-react-entry — `index.html` + `src/main.tsx` + placeholder App + brand CSS variables port; depends on: 01-scaffold-toolchain
