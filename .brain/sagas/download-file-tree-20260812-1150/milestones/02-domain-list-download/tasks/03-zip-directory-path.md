# Task 2.3: Zip arbitrary directory path
- Milestone: 2
- Depends on: none

## Scope
Ensure the domain can zip a directory at an arbitrary repo path (for tree “Download folder” and browsed-root “Download all”), preserving `fileName` / `rootDirectory` naming via `buildZipNames`. Adapt `downloadGitHubPath` and/or add `downloadGitHubDirectory` that takes an explicit path under a known owner/repo/ref. Whole-repo redirect behavior must remain.

## Owned files/surfaces
- `src/domain/download.ts` and `src/domain/download.test.ts`
- Optional `src/domain/downloadDirectory.ts` if split — own it here
- Shared walk helper only if 2.1 did not create it; avoid duplicate conflicting extractions helpers (if conflict, consume 2.1’s helper after milestone integration)

## Interfaces produced/consumed
- Generator yielding `DownloadEvent` (`done` = zip Blob)
- Must support downloading a **subdirectory** path that may differ from the originally pasted URL’s root (folder action inside the tree)

## Validation method
unit tests

## Validation criteria (the contract)
1. Existing download tests still pass (whole-repo redirect, directory zip, rootDirectory naming, partial/rate limit behaviors).
2. New test: zip a nested subdirectory path with correct zip entry prefixes for default `rootDirectory`.
3. Empty directory still yields empty zip `done` (preserve current behavior).
4. No UI code.

## Evidence required
- `npm test` output including new nested-path test name
- Brief note of the public function used for folder zip
