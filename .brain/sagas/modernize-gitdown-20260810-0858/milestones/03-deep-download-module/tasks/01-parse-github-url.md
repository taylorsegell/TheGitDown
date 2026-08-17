# Task 3.1: parseGitHubUrl + zip naming policy
- Milestone: 3
- Depends on: none

## Scope
Pure TypeScript module(s) that parse GitHub HTTPS URLs into `RepoRef` and compute download file name + root directory prefix using existing product semantics.

## Owned files/surfaces
- `src/domain/githubUrl.ts` (or `src/lib/githubUrl.ts`)
- `src/domain/githubUrl.test.ts`
- Shared types file if needed: `src/domain/types.ts` (may be created here; other tasks may extend — prefer creating `types.ts` in this task with SAGA.md types)

## Interfaces produced/consumed

```ts
export function parseGitHubUrl(url: string): RepoRef | { ok: false; error: DownloadError };

export function buildZipNames(ref: RepoRef, params: Pick<DownloadParams, "fileName" | "rootDirectory">): {
  downloadFileName: string; // without .zip
  rootDirectoryPrefix: string; // "" or "name/"
};
```

Semantics (must match legacy):
- Valid roughly `https?://github.com/{owner}/{repo}` with optional `/tree|blob/{ref}/{path…}`.
- Whole repo → `path: ""`, `kind: "repo"`, `ref` null if omitted.
- `rootDirectory === "false"` → prefix `""`.
- missing / `""` / `"true"` → prefix `{rootName}/` where rootName is last path segment (repo name if whole repo).
- else → prefix `{rootDirectory}/`.
- `fileName` empty → `downloadFileName = rootName`.

## Validation method
unit tests

## Validation criteria (the contract)
1. Test: `https://github.com/acme/widgets` → owner acme, repo widgets, path "", ref null, kind repo.
2. Test: `https://github.com/acme/widgets/tree/main/src/lib` → ref main, path `src/lib`.
3. Test: `https://github.com/acme/widgets/blob/main/README.md` → path `README.md`.
4. Test: invalid `https://example.com/x` → `{ ok: false, error.kind: "invalid_url" }`.
5. Test: rootDirectory false vs true vs custom name matches semantics above.
6. Must not perform network I/O.

## Evidence required
- Vitest output showing named tests passing.
