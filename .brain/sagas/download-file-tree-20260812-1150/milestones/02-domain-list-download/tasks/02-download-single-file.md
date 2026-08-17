# Task 2.2: downloadGitHubFile (raw single file)
- Milestone: 2
- Depends on: none

## Scope
Implement `downloadGitHubFile` that fetches one GitHub file (via Contents `download_url` or raw fallback) and yields `FileDownloadEvent` with a **raw** `Blob` and basename `fileName` (UI must not treat as zip).

## Owned files/surfaces
- `src/domain/downloadFile.ts` (or equivalent)
- `src/domain/downloadFile.test.ts`
- `src/domain/types.ts` only for `FileDownloadEvent` if not already added by 2.1 — if 2.1 already added all types, do not fight; only add missing `FileDownloadEvent`

## Interfaces produced/consumed
- `downloadGitHubFile(params: DownloadParams | { owner, repo, ref, path }, deps) → AsyncGenerator<FileDownloadEvent>`
- Prefer accepting enough to download a `ListedFile` without re-parsing when possible; at minimum `DownloadParams` with a file URL must work.

## Validation method
unit tests with mocked HTTP

## Validation criteria (the contract)
1. Successful fetch yields `done` where `fileName` is the basename and `blob` byte contents match mock payload (not a zip archive).
2. Progress yields `downloaded/total` with total `1` for the happy path.
3. Rate limit / not found → `fail` with correct `DownloadError.kind`.
4. Does not call JSZip / `generateZip`.

## Evidence required
- Passing test names + note that blob is raw
- Function signature as exported
