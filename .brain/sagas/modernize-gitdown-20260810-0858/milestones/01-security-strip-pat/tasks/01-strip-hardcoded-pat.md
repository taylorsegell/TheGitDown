# Task 1.1: Strip hardcoded PAT
- Milestone: 1
- Depends on: none

## Scope
Remove the embedded GitHub PAT and the always-on `Authorization` header config from `TheGitDownService`. All GitHub `$http` calls in this file must run unauthenticated. Do not add token UI yet (that is M4). Do not introduce Vite yet.

## Owned files/surfaces
- `app/home/down-git.js`
- No other files

## Interfaces produced/consumed
- Consumes existing `downloadZippedFiles(parameters, progress, toastr)` interface (unchanged for callers).
- Produces: zero secrets in file; no `config.headers.Authorization` unless removed entirely.

## Validation method
unit tests | integration tests — N/A yet; use **rg + static smoke**

## Validation criteria (the contract)
1. `rg -n "github_pat_|ghp_[A-Za-z0-9]" app/home/down-git.js` exits 1 (no matches).
2. `rg -n "Authorization" app/home/down-git.js` exits 1 (no matches) **or** only appears in comments stating tokens must not be hardcoded (prefer zero matches).
3. `authToken` variable and `config` object used solely for Authorization are deleted.
4. Every `$http.get` in the file either has no auth config or shares one unauthenticated config object.
5. Must not change: URL parse indices, zip naming, `rootDirectory` semantics, whole-repo `window.location` archive redirect, deep-link parameter names.

## Evidence required
- Output of the two `rg` commands.
- Diffstat showing only `down-git.js`.
- Note: worker must NOT print the old token value in the report.
