# Task 4.2: Wire download actions (file / folder / all)
- Milestone: 4
- Depends on: 4.1

## Scope
Connect `RepoTreeBrowser` callbacks to domain: raw file download + FileSaver without `.zip` suffix logic; folder zip for selected folder path; download-all zip for browsed root using existing naming params (`fileName`, `rootDirectory`). Show progress/errors; respect busy/in-flight and run cancellation (increment run id) like today’s download.

## Owned files/surfaces
- `src/pages/HomePage.tsx`
- `src/ui/saveBlob.ts` only if raw vs zip filename helper needs a small extension (e.g. `saveBlob(blob, name, { zip?: boolean })`) — keep change minimal
- Tests for save filename behavior / HomePage action wiring

## Interfaces produced/consumed
- `downloadGitHubFile`, directory zip API from M2, `saveBlob`, `mapDownloadErrorMessage`

## Validation method
unit tests (mock domain generators; assert saveBlob args)

## Validation criteria (the contract)
1. File action → `saveBlob` called with raw blob and basename **without** forcing `.zip`.
2. Folder / Download all → saved name follows existing zip naming (`*.zip` semantics as today’s UI).
3. In-flight list/download disables actions / Browse appropriately; new Browse increments run id and ignores stale events.
4. Rate-limit fail surfaces via existing error mapper.
5. `npm test`, `npm run typecheck` pass.

## Evidence required
- Tests asserting saveBlob filenames for file vs zip paths
- Brief manual checklist note for orchestrator (no computer use required)
