# Task 3.1: File tree view component
- Milestone: 3
- Depends on: none (requires M1 integrated on base branch)

## Scope
Rebuild a Tailwind tree view (not a literal paste of TreeCodeViewer with missing utils). Support folder expand/collapse, single selection, file/folder icons via `lucide-react`. Accept a `ListedFolderNode` (or isomorphic props type owned in UI that mirrors domain).

## Owned files/surfaces
- `src/components/ui/file-tree.tsx` (and small colocated helpers if needed under `src/components/ui/file-tree-*.tsx`)
- `src/components/ui/file-tree.test.tsx`
- Do **not** own HomePage

## Interfaces produced/consumed
```ts
type FileTreeProps = {
  root: ListedFolderNode // or UI-local equivalent
  selectedId: string | null
  onSelect: (id: string) => void
  defaultExpandedIds?: string[]
}
```

## Validation method
unit tests (Vitest + Testing Library if already used; otherwise React test renderer / testing-library — add `@testing-library/react` if needed)

## Validation criteria (the contract)
1. Renders folder and file names from a fixture tree.
2. Clicking a file calls `onSelect` with that file’s id; clicking a folder selects the folder id.
3. Expanding/collapsing a folder shows/hides children without selecting incorrectly (document expected click target: expander vs row).
4. No preview pane; no `raw`/`html` file content props required.
5. `"use client"` directive is optional/absent (Vite SPA — do not require Next.js).

## Evidence required
- Test output + component export path
- Short note on expander vs row click behavior
