# Task 5.1: Restyle HomePage + TokenSettings; drop legacy CSS
- Milestone: 5
- Depends on: none (requires M1+M4 integrated)

## Scope
Rewrite HomePage and TokenSettings markup/classes to Tailwind using brand CSS variables from M1. Keep behavior identical to M4. Delete or stop shipping `src/styles.css` as the app design system. Ensure tree browser visually fits the shell.

## Owned files/surfaces
- `src/pages/HomePage.tsx`
- `src/ui/TokenSettings.tsx` (+ tests class updates if any)
- `src/styles.css` (delete)
- `src/main.tsx` CSS import
- Possibly shared layout wrappers under `src/components/`

## Interfaces produced/consumed
- Behavior contracts from M4 unchanged

## Validation method
unit tests (existing TokenSettings/HomePage tests updated) + build

## Validation criteria (the contract)
1. No `import './styles.css'` (or equivalent legacy sheet) remains in the app entry.
2. Grep for obsolete classnames like `home-page` / `home-btn` finds no required CSS file — either removed from TSX or only used if redefined via `@apply` in Tailwind layers (prefer pure utilities).
3. TokenSettings still save/clear PAT in localStorage (existing tests pass).
4. Browse/tree/download behavior tests still pass.
5. Dark-green primary tokens still used for primary buttons (not default shadcn violet).
6. `npm run build` succeeds.

## Evidence required
- Confirmation `styles.css` removed or unused
- Test + build output
