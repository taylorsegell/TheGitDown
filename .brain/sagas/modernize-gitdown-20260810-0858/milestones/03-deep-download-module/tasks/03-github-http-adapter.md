# Task 3.3: GitHub HTTP adapter + error classification
- Milestone: 3
- Depends on: 3.2

## Scope
Implement `GitHubHttp` using `fetch`, attaching `Authorization: Bearer <token>` **only** when `CredentialStore.getToken()` returns a token (GitHub accepts `Bearer` for PATs; do not use outdated `token` prefix unless tests require both — use `Bearer`). Classify HTTP failures into `DownloadError`.

## Owned files/surfaces
- `src/domain/githubHttp.ts`
- `src/domain/githubHttp.test.ts`
- May import credentials + types

## Interfaces produced/consumed

```ts
export function createGitHubHttp(deps: {
  credentials: CredentialStore;
  fetchFn?: typeof fetch;
}): GitHubHttp;

export function classifyGitHubFailure(status: number, bodyText: string, headers?: Headers): DownloadError;
```

Classification rules:
- 403 or 429 with body/message indicating rate limit → `rate_limited` (parse `x-ratelimit-reset` if present → `resetAt`)
- 404 → `not_found`
- 0 / network throw → `network`
- else → `unknown` with message snippet

## Validation method
unit tests with mocked fetch

## Validation criteria (the contract)
1. When credentials empty, request headers have no Authorization.
2. When credentials set, request includes `Authorization: Bearer …`.
3. Mock 403 rate-limit body → `classifyGitHubFailure` / getJson rejection path yields `kind: "rate_limited"`.
4. Mock 404 → `not_found`.
5. Must not embed any PAT in source.

## Evidence required
- Vitest output for githubHttp tests.
