# Task 3.2: CredentialStore (localStorage)
- Milestone: 3
- Depends on: none

## Scope
Implement `CredentialStore` with localStorage persistence and a clear operation. Key must be namespaced, e.g. `gitdown.githubToken`. Do not build UI.

## Owned files/surfaces
- `src/domain/credentials.ts`
- `src/domain/credentials.test.ts`

## Interfaces produced/consumed

```ts
export function createLocalStorageCredentialStore(
  storage: Storage = localStorage,
  key?: string
): CredentialStore;
```

- `getToken()` returns trimmed non-empty string or null (empty string → null).
- `setToken(token)` stores trimmed token; if empty after trim, clears.
- `clearToken()` removes key.

## Validation method
unit tests (mock `Storage`)

## Validation criteria (the contract)
1. set → get returns same token.
2. clear → get returns null.
3. set("") or whitespace → get returns null and key absent.
4. Custom `Storage` mock used in tests — no dependence on real browser localStorage in Vitest.
5. Must not log the token to console.

## Evidence required
- Vitest output for credentials tests.
