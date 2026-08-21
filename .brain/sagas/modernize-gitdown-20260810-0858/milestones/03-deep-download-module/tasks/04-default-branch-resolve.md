# Task 3.4: Default branch resolution
- Milestone: 3
- Depends on: 3.3

## Scope
Resolve `ref: null` via GitHub Repos API `default_branch`. Fallback chain if API fails with not_found/network: try `main`, then `master` only when building archive URL / Contents URLs as specified in tests — **preferred**: if Repos API succeeds, use `default_branch`; if Repos API fails, fallback `main` then (only if Contents/archive probe fails) `master`. For airtightness, implement:

```ts
export async function resolveRef(
  owner: string,
  repo: string,
  ref: string | null,
  http: GitHubHttp
): Promise<{ ref: string } | { error: DownloadError }>;
```

When `ref` is non-null, return it unchanged (no network).
When `ref` is null, GET `https://api.github.com/repos/{owner}/{repo}` and read `default_branch`. On failure, return ref `"main"` as soft fallback **only if** error is network/unknown — document in code; tests lock: API returns `main` → use `main`; API returns `master` → use `master`; API 404 → error `not_found` (do not invent a branch for missing repos).

Clarification for workers (no whitespace):  
- Success JSON `{ default_branch: "X" }` → use X.  
- HTTP 404 on repo → `{ error: not_found }`.  
- rate_limited → propagate rate_limited.  
- Other failures → fallback ref `"main"` (single fallback; do **not** auto-try master here). Archive/Contents code may try `master` only if `main` Contents returns 404 **in task 3.5**.

## Owned files/surfaces
- `src/domain/resolveRef.ts`
- `src/domain/resolveRef.test.ts`

## Interfaces produced/consumed
- As above; uses `GitHubHttp.getJson`.

## Validation method
unit tests

## Validation criteria (the contract)
1. Non-null ref → no fetch called.
2. Null ref + API `default_branch: "develop"` → `"develop"`.
3. Null ref + API 404 → error not_found.
4. Null ref + API rate limit → error rate_limited.
5. Null ref + network failure → `"main"` fallback.

## Evidence required
- Vitest output for resolveRef tests.
