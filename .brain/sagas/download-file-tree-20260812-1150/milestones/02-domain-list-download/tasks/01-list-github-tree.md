# Task 2.1: listGitHubTree (eager metadata)
- Milestone: 2
- Depends on: none

## Scope
Implement `listGitHubTree(params, { http })` that parses URL, resolves ref, redirects whole-repo, otherwise eagerly walks Contents API under the path and yields `ListTreeEvent` (`progress` / `ready` / `fail` / `redirect`). Build nested `ListedFolderNode` + flat `ListedFile[]`. Do **not** fetch file blobs.

## Owned files/surfaces
- `src/domain/listTree.ts` (or equivalent new module)
- `src/domain/listTree.test.ts`
- `src/domain/types.ts` (add ListTree types only; coordinate names with SAGA.md)
- May extract shared Contents walk helpers from `download.ts` into a shared internal module **only if** this task creates that module and 2.3 will consume it — if extracting, own the new helper file here and leave `download.ts` re-exporting/compiling (2.3 adapts zip). Prefer minimal churn: duplicate walk carefully OR extract once in this task.

## Interfaces produced/consumed
- `listGitHubTree` → `AsyncGenerator<ListTreeEvent>` per `SAGA.md`
- Reuses `parseGitHubUrl`, `resolveRef`, `GitHubHttp`, `DownloadError`

## Validation method
unit tests (Vitest + mocked GitHubHttp)

## Validation criteria (the contract)
1. Whole-repo URL (`path === ''`) yields exactly one `redirect` to `https://github.com/{owner}/{repo}/archive/{ref}.zip` (after ref resolve).
2. Directory fixture yields `ready` with nested folders/files matching mock Contents responses; `files.length` equals number of file nodes.
3. Mock HTTP: no `getArrayBuffer` / raw.githubusercontent blob fetches during a successful directory list.
4. Invalid URL → `fail` with `invalid_url`; not_found / rate_limited mapped like existing download errors.
5. Single-file URL → `ready` with a root that contains that one file node (or root is folder with one child — pick one and test it consistently; recommended: synthetic folder root named after parent path segment containing the file).
6. Existing `download.test.ts` still passes if `download.ts` was touched only for shared helper extraction.

## Evidence required
- Passing test names for redirect, directory ready, no-blob-fetch assertion, fail paths
- Export path of `listGitHubTree`
