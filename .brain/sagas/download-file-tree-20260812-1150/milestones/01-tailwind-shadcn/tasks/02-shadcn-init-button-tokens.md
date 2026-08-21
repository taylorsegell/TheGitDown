# Task 1.2: shadcn init, Button, brand tokens
- Milestone: 1
- Depends on: 1.1

## Scope
Initialize shadcn for this Vite repo (`components.json`, default components path `src/components/ui`). Add `cn` helper, shadcn `Button`, and CSS variables that preserve TheGitDown dark-green brand from current `styles.css`. Install npm deps: `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` (for later tree icons).

## Owned files/surfaces
- `components.json`
- `src/lib/utils.ts`
- `src/components/ui/button.tsx`
- Tailwind/theme CSS variables file (owned jointly with 1.1 CSS entry — extend tokens here)
- `package.json` / lockfile for shadcn-related deps

## Interfaces produced/consumed
- `export function cn(...inputs: ClassValue[]): string` from `@/lib/utils`
- `Button` / `buttonVariants` from `@/components/ui/button`

## Validation method
unit tests + typecheck/build

## Validation criteria (the contract)
1. `components.json` sets components under `src/components/ui` (create that folder — required shadcn convention even if empty before Button).
2. `Button` renders in a Vitest test without throwing (jsdom).
3. Theme CSS defines primary/background tokens mapped from existing dark-green brand (not a purple/default shadcn theme left unchanged).
4. `npm run typecheck`, `npm run build`, `npm test` pass.
5. Do not implement TreeCodeViewer or HomePage browse yet.

## Evidence required
- Test name(s) for Button smoke
- `components.json` path fields
- Token variable names list
- toolchain command output
