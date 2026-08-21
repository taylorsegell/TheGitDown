# Milestone 1: Tailwind + shadcn foundation
- Saga: download-file-tree-20260812-1150
- Depends on: none

## Goal
Make the repo a proper Tailwind + TypeScript + shadcn Vite project so later UI work can live under `src/components/ui` with `@/` imports and dark-green design tokens — without shipping the browse feature yet.

## Milestone validation criteria
1. `components.json` exists; aliases resolve `@/` → `src/`.
2. `src/lib/utils.ts` exports `cn`; `src/components/ui/button.tsx` exists and compiles.
3. Tailwind is wired (Vite/PostCSS as required by chosen Tailwind major); a smoke import of `Button` in a test or temporary usage typechecks.
4. CSS variables encode the existing dark-green brand feel (map from current `:root` / theme in `styles.css`).
5. `npm run typecheck` and `npm run build` pass; existing Vitest suite still passes (UI may still use old classes until M5).

## Tasks
- 01-scaffold-tailwind-alias — install Tailwind toolchain + `@` path alias; depends on: none
- 02-shadcn-init-button-tokens — shadcn init, Button, cn, brand tokens; depends on: 01
