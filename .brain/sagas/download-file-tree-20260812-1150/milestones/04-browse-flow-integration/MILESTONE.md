# Milestone 4: Browse-first HomePage integration
- Saga: download-file-tree-20260812-1150
- Depends on: 02-domain-list-download, 03-tree-browser-ui

## Goal
Replace auto-zip-on-Download with Browse → list tree → interactive downloads. Deep links open the tree. Whole-repo still redirects. Preserve share-link creation URL shape.

## Milestone validation criteria
1. Primary CTA labeled **Browse**; starts `listGitHubTree`; on `ready` shows `RepoTreeBrowser`; does not auto-zip.
2. `#/home?url=<dir>` opens tree (no auto zip).
3. File / folder / all actions call the correct domain generators and save via FileSaver (raw vs zip).
4. Whole-repo Browse/deep-link redirects to archive.
5. Progress + errors shown for list and download phases.
6. Existing share link builder still emits `#/home?url=…`.
7. Tests and build pass; HomePage interaction covered with mocked domain where practical.

## Tasks
- 01-browse-list-wireup — Browse + deep-link list flow + whole-repo redirect; depends on: none
- 02-download-actions-wireup — wire file/folder/all downloads + saves; depends on: 01
