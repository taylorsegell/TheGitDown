# Task 3.5: Download walk + zip + DownloadEvent stream
- Milestone: 3
- Depends on: 3.1, 3.3, 3.4

## Scope
Implement the deep download module: given `DownloadParams`, parse → resolve ref → if whole repo, yield a dedicated event or return archive URL for UI navigation; if file/dir, walk Contents API, fetch blobs, zip via JSZip, yield progress/done/fail. **No DOM, no toastr, no FileSaver inside this module** — zip `Blob` is returned on `done`; UI saves.

For whole-repo, yield:
`{ type: "fail", error }` on resolve failure, OR introduce:
`{ type: "redirect"; url: string }` — **add this to DownloadEvent union in types.ts**:

```ts
| { type: "redirect"; url: string }
```

Update SAGA types usage accordingly in this task.

Zip adapter: depend on `jszip` npm package.

If Contents probe fails with not_found for a path that might be a large file, try raw.githubusercontent.com once; if that fails, yield fail (not silent).

Partial: if any blob fails, yield `{ type: "fail", error: { kind: "partial", missingPaths: [...] } }` and **do not** yield `done`.

Progress: yield `{ type: "progress", downloaded, total }` as files complete (total may grow during walk — match legacy honesty).

## Owned files/surfaces
- `src/domain/download.ts`
- `src/domain/download.test.ts`
- `src/domain/types.ts` (extend DownloadEvent with `redirect`)
- May add `src/domain/zip.ts` thin helper

## Interfaces produced/consumed

```ts
export async function* downloadGitHubPath(
  params: DownloadParams,
  deps: {
    http: GitHubHttp;
    // optional for tests
    zipGenerate?: (files: { path: string; data: ArrayBuffer }[]) => Promise<Blob>;
  }
): AsyncGenerator<DownloadEvent>;
```

## Validation method
unit tests with mocked GitHubHttp

## Validation criteria (the contract)
1. Invalid URL → first event `fail/invalid_url`.
2. Whole repo + resolved ref → `redirect` to `https://github.com/{owner}/{repo}/archive/{ref}.zip`.
3. Single file fixture (Contents returns file object + download_url) → progress then `done` with blob; zip contains one entry.
4. Directory fixture (array of files) → all files in zip under correct `rootDirectoryPrefix`.
5. Rate limit during walk → `fail/rate_limited`; no `done`.
6. One blob failure among many → `fail/partial` with missing path; no `done`.
7. Module source contains no `toastr`, no `document.`, no `localStorage` direct (credentials only via http deps).

## Evidence required
- Vitest output for download tests listing the cases above.
- Brief note of DownloadEvent union final shape.
