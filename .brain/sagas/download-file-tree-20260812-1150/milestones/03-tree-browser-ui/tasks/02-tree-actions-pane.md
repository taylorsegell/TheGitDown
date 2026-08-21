# Task 3.2: Tree actions pane + composed browser
- Milestone: 3
- Depends on: 3.1

## Scope
Build the right-hand actions/metadata pane and a composed `RepoTreeBrowser` (name flexible) with left tree + right pane grid layout matching the TreeCodeViewer two-column idea. Wire shadcn `Button`s to callbacks; no network I/O.

## Owned files/surfaces
- `src/components/ui/tree-actions-pane.tsx` (and/or composed `repo-tree-browser.tsx`)
- Colocated tests
- May lightly edit `file-tree.tsx` only for composition exports

## Interfaces produced/consumed
```ts
type RepoTreeBrowserProps = {
  root: ListedFolderNode
  files: ListedFile[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDownloadFile: (file: ListedFile) => void
  onDownloadFolder: (folder: ListedFolderNode) => void
  onDownloadAll: () => void
  busy?: boolean
}
```
- Selected file → show path + **Download file**
- Selected folder → show path + child counts if cheap from node + **Download folder**
- Always show **Download all** for browsed root (or when root selected — either is fine if tested; recommended: always visible in pane header)

## Validation method
unit tests

## Validation criteria (the contract)
1. Selecting a file shows Download file; clicking it calls `onDownloadFile` with that file.
2. Selecting a folder shows Download folder; clicking it calls `onDownloadFolder`.
3. Download all calls `onDownloadAll`.
4. `busy` disables buttons.
5. Layout is two-column on wide viewports (`grid` / responsive stack allowed below `md`).
6. Uses `@/components/ui/button`.

## Evidence required
- Test names for the three callbacks
- Screenshot optional (not required — no computer use)
