# Task 4.2: Optional PAT settings UI
- Milestone: 4
- Depends on: 4.1

## Scope
Add UI to set and clear the optional GitHub PAT via `CredentialStore` (localStorage). Must not display the full token after save in plaintext if avoidable — show “Token saved” / masked indicator; allow replace and clear. Wire the same store instance into `createGitHubHttp` used by downloads.

## Owned files/surfaces
- `src/ui/TokenSettings.tsx` (or section inside HomePage)
- HomePage wiring only as needed

## Interfaces produced/consumed
- `CredentialStore` from domain

## Validation method
component/unit test with mock storage + manual check

## Validation criteria (the contract)
1. Setting a token calls store.setToken; after remount with same mock storage, getToken returns it (persist simulation).
2. Clear button calls clearToken; subsequent getToken null.
3. Manual: after set, refresh page, token still present (localStorage); after clear, absent (`localStorage` key `gitdown.githubToken` or whatever 3.2 defined — must match).
4. Token value must not be committed to git; UI must not hardcode a sample real PAT.

## Evidence required
- Test output + note of storage key name.
- Manual refresh persistence check.
