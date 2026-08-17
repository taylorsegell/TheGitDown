# Milestone 2: Domain list + selective download
- Saga: download-file-tree-20260812-1150
- Depends on: none

## Goal
Provide domain APIs that (1) eagerly list a GitHub path as a tree without fetching blobs, (2) download one file as a raw blob, (3) zip an arbitrary directory path (including “download all” for the browsed root), and (4) keep whole-repo archive redirect.

## Milestone validation criteria
1. Vitest covers list-tree ready shape, whole-repo redirect on list, single-file raw download, and directory zip for a nested path.
2. List path does not call blob/raw fetch for every file (metadata/Contents walk only) — asserted via mock HTTP call counts/URLs in tests.
3. Shared interfaces in `SAGA.md` are exported and used.
4. `npm test`, `npm run typecheck` pass for domain modules.

## Tasks
- 01-list-github-tree — `listGitHubTree` eager metadata walk; depends on: none
- 02-download-single-file — raw file download generator; depends on: none
- 03-zip-directory-path — zip any directory path / browsed root (adapt existing download); depends on: none
