# TheGitDown

Client-side tool: paste a public GitHub file or directory URL, get a zip or a shareable `#/home?url=…` deep link. No app backend.

## Download job

The user's one job. Lives in `src/ui/downloadJob.ts`.

Owns start, share, cancel, URL validation, and job state (`processing`, `progress`, `error`, `shareLink`, `urlInvalid`). Talks to the Git download module through an injected `GitHubHttp` adapter, and to the browser through injected `save` and `navigate` adapters.

The page owns the hash query (`url`, `fileName`, `rootDirectory`) and the URL field. It does not fold `DownloadEvent`s.

## Git download

Walk Contents, fetch blobs, zip, or redirect to GitHub's whole-repo archive. `src/domain/download.ts`. Interface: `downloadGitHubPath` yields `DownloadEvent`.

## Credential store

Optional GitHub PAT in `localStorage` only. Shared by the HTTP adapter and the Auth row.
