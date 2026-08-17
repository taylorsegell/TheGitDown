# Milestone 3: Tree browser UI
- Saga: download-file-tree-20260812-1150
- Depends on: 01-tailwind-shadcn

## Goal
Ship a reusable download-oriented file tree + actions pane (TreeCodeViewer-inspired two-column layout) that consumes listed tree data and emits download intents — no GitHub calls inside the presentational components.

## Milestone validation criteria
1. Component(s) render a nested folder/file tree from props; expand/collapse works; selection updates the actions pane.
2. Actions pane shows path metadata and exposes callbacks/buttons: Download file (files), Download folder (folders), Download all (browsed root).
3. No code preview / `dangerouslySetInnerHTML` HTML highlight pane.
4. Vitest coverage for tree render + callback wiring; typecheck/build pass.
5. Uses Tailwind + shadcn `Button` + lucide icons.

## Tasks
- 01-file-tree-view — expandable selectable tree; depends on: none
- 02-tree-actions-pane — metadata + download action buttons wired to callbacks; depends on: 01
