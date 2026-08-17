# Saga: Download file-tree browser (Tailwind-native)
- Saga directory: .brain/sagas/download-file-tree-20260812-1150
- Repo: /Users/casa/Developer/ACTIVE/TheGitDown @ saga/modernize-gitdown-20260810-0858/integrate (integrate into current working branch / mainline after milestones)
- Status: complete

## Problem statement
Users who paste a GitHub file/directory URL currently get an immediate zip (or whole-repo archive redirect) with only a progress counter. They cannot see what will be downloaded or grab a single file / nested folder.

This saga adds a **browse-first** flow: after URL entry (or deep link), the app eagerly lists the Contents API tree under that path, shows an interactive file tree (TreeCodeViewer-inspired layout), and exposes actions to download the selected file (raw), zip any selected subdirectory, or zip the full browsed root. The site is rewritten as **Tailwind-native** with shadcn primitives, preserving the dark-green brand. No backend.

## Scope & non-goals
- In scope:
  - Tailwind CSS + shadcn project setup (`components.json`, `@/` → `src`, `src/components/ui`, `src/lib/utils.ts`)
  - Full site restyle to Tailwind (replace `src/styles.css` as the design system)
  - Domain APIs: list tree (metadata only), download single raw file, zip directory / browsed root (reuse JSZip + existing HTTP adapters)
  - Rebuild download-oriented tree UI (expand/select, lucide icons, shadcn Button); right pane = metadata + actions only (no code preview)
  - Browse-first HomePage + deep links `#/home?url=…` open the tree (breaking vs auto-zip)
  - Primary CTA renamed **Browse**
  - Whole-repo URLs keep GitHub `…/archive/{ref}.zip` redirect (no tree)
  - Preserve query params `url`, `fileName`, `rootDirectory` for zip naming of “download all / folder”
  - Docs: README + PRODUCT.md (+ agent context) document browse-first breaking change
- Out of scope / non-goals:
  - Code/syntax preview pane (`ClientPreCode`, highlighting)
  - Lazy per-folder Contents fetch (v1 is eager walk)
  - Backend / proxy
  - Private-repo product beyond optional user PAT
  - History-mode routing
  - Pulling the full 21st.dev Tree Code Viewer package as a black box
  - One-click auto-zip deep-link mode (`auto=1`)
- Decisions delegated to agent discretion:
  - Exact Tailwind major (v3 vs v4) per current shadcn + Vite defaults at implement time
  - Default tree selection = browsed root node; expand root on ready
  - Mobile: stack tree above actions pane below `md`
  - Minor copy/spacing within dark-green Tailwind tokens
  - Whether `downloadGitHubPath` is refactored in place or split into sibling modules, as long as shared interfaces below are honored

## Locked product decisions
1. Browse-first: no zip until user chooses Download file / Download folder / Download all
2. Tailwind-native full site + shadcn where useful
3. Actions + metadata pane only (no file content preview)
4. Whole-repo → archive redirect only
5. Deep link opens tree (document breaking change)
6. Preserve dark-green brand via Tailwind CSS variables
7. Eager full subtree list before showing tree
8. Single file → raw FileSaver (not zip)
9. Primary button label: **Browse**
10. Share link keeps `#/home?url=…`; visit opens tree
11. Rebuild tree UI inspired by TreeCodeViewer; do not require missing `tree-code-viewer-utils` preview stack

## Environment & capabilities
- Program type: static web SPA (Vite + React + TypeScript; browser → GitHub APIs)
- Run/launch: `npm run dev`; production smoke `npm run build && npm run preview`
- Test: `npm test` (Vitest + jsdom)
- Build / lint / typecheck: `npm run build`, `npm run lint`, `npm run typecheck`
- Computer use available: no (local)
- Default validation method: Vitest for domain + tree helpers; `tsc`/build green; manual browser checklist for UI (orchestrator/user)
- Harness: Cursor — structured questions via numbered options (no AskQuestion tool); workers via `Task` + git worktrees

## Shared interfaces (saga-wide contract)
Workers MUST honor these shapes (exact export paths may live under `src/domain/`).

```ts
/** Unchanged query params */
export type DownloadParams = {
  url: string
  fileName?: string
  rootDirectory?: string // "true" | "false" | custom name | undefined
}

/** Flat file discovered during list (no blob content) */
export type ListedFile = {
  id: string // stable id = repo path
  name: string // basename
  repoPath: string // full path in repo
  relativePath: string // relative to browsed root
  downloadUrl: string | null
}

export type ListedFolder = {
  id: string // repo path or "" for repo root-of-browse
  name: string
  repoPath: string
  relativePath: string
  children: Array<ListedFolder | ListedFileNode>
}

export type ListedFileNode = ListedFile & { type: 'file' }
export type ListedFolderNode = ListedFolder & { type: 'folder' }
export type ListedNode = ListedFolderNode | ListedFileNode

export type ListTreeEvent =
  | { type: 'progress'; listed: number }
  | { type: 'ready'; ref: string; root: ListedFolderNode; files: ListedFile[] }
  | { type: 'redirect'; url: string } // whole-repo only
  | { type: 'fail'; error: DownloadError }

/** Single raw file download (NOT a zip) */
export type FileDownloadEvent =
  | { type: 'progress'; downloaded: number; total: number }
  | { type: 'done'; blob: Blob; fileName: string } // basename; UI does NOT append .zip
  | { type: 'fail'; error: DownloadError }

/** Directory / download-all keeps existing DownloadEvent (done = zip blob) */
export type DownloadEvent =
  | { type: 'progress'; downloaded: number; total: number }
  | { type: 'done'; blob: Blob; fileName: string }
  | { type: 'redirect'; url: string }
  | { type: 'fail'; error: DownloadError }
```

Public domain entrypoints (names may vary slightly if exported consistently):
- `listGitHubTree(params, deps) → AsyncGenerator<ListTreeEvent>`
- `downloadGitHubFile({ url or owner/repo/ref/path }, deps) → AsyncGenerator<FileDownloadEvent>`
- Existing/adapted `downloadGitHubPath` (or sibling) for **directory zip** of a given path, including browsed root “Download all”

## Saga exit criteria
1. `npm test`, `npm run typecheck`, `npm run build` all pass on the integrated branch.
2. With a public **directory** GitHub URL, Browse (or `#/home?url=…`) lists the tree (eager), shows expandable folders/files, and does **not** auto-download a zip.
3. Selecting a **file** and choosing Download saves a **raw** file with the correct basename (not a `.zip`).
4. Selecting a **folder** (or Download all on the browsed root) produces a zip of that subtree; `fileName` / `rootDirectory` naming still applies for the browsed-root zip as today.
5. Whole-repo URL still redirects to GitHub archive zip (no tree UI).
6. Site styling is Tailwind-driven (no reliance on the pre-saga Bootstrap-free custom `styles.css` design system); dark-green brand tokens remain recognizable; shadcn `Button` is used for primary actions in the tree panel.
7. README + PRODUCT.md document browse-first behavior and the deep-link breaking change (no longer auto-starts zip).
8. Rate-limit / not-found / invalid URL errors still surface with clear UX during list and download.

## Milestone index
1. `01-tailwind-shadcn` — Tailwind + shadcn foundation, path alias, dark-green tokens; depends on: none
2. `02-domain-list-download` — list tree + raw file download + directory zip of arbitrary path; depends on: none (parallel with 01)
3. `03-tree-browser-ui` — rebuild tree + actions pane components; depends on: 01
4. `04-browse-flow-integration` — HomePage Browse / deep-link / wire domain↔UI; depends on: 02, 03
5. `05-tailwind-shell-restyle` — restyle remaining shell (hero, token settings, layout) fully Tailwind; depends on: 01, 04
6. `06-docs-exit` — docs + saga-level verification; depends on: 05
