# Saga: Modernize TheGitDown (architecture remediation)
- Saga directory: .brain/sagas/modernize-gitdown-20260810-0858
- Repo: /Users/casa/Developer/ACTIVE/TheGitDown @ main
- Status: complete

## Problem statement
Remediate all seven architecture-review candidates so TheGitDown is a maintainable 2026 static SPA: no secrets in source; optional user GitHub PAT in localStorage; a deep Git download module (URL/branch resolve, Contents walk, zip, typed failures) behind explicit adapters; Vite + TypeScript + React shell with hash deep links preserved; CDN/Angular/Bootstrap legacy removed; docs and agent context updated.

User-facing outcome: paste a public GitHub file/directory URL → download a zip or create a shareable `#/home?url=…` link on the current origin, with honest progress and rate-limit/error UX, without a backend.

## Scope & non-goals
- In scope:
  - Strip hardcoded PAT; unauthenticated default; optional user PAT via localStorage + clear control
  - Vite + TypeScript + React + Vitest + lockfile
  - Deepen download module: parse URL, default_branch resolve, Contents walk, zip, progress events, typed failures
  - Cut UI leakage (no toastr/progress mutation inside download module)
  - Functional UI refresh keeping dark-green brand; remove dead contact form
  - Keep hash routing `#/home?url=&fileName=&rootDirectory=`
  - Update README + AGENTS.md/CLAUDE.md; add `.gitignore`
  - Document that git-history secret scrub is a manual out-of-band step (not executed by this saga)
- Out of scope / non-goals:
  - Backend, edge proxy, or server-held tokens
  - `git filter-repo` / BFG history rewrite
  - History-mode routing / host rewrite rules
  - Private-repo product expansion beyond “user supplies their own PAT”
  - Rewriting into a general GitHub client
  - Full visual brand rethink (new palette/identity)
- Decisions delegated to agent discretion: none

## Locked product decisions
- UI: Vite + TypeScript + React
- Auth: no baked-in token; optional PAT in **localStorage** with clear control
- Contact form: **remove**
- Visual: functional refresh, **keep dark green** CSS variables / brand feel
- Default branch: Repos API `default_branch`, then fallback `main`, then `master`
- Routing: keep hash router
- Package manager: npm

## Environment & capabilities
- Program type: static web SPA (browser-only; talks to GitHub from the client)
- Run/launch command:
  - After M2: `npm run dev` (Vite); production smoke: `npm run build && npm run preview`
  - Legacy until M2 integrated: `npx --yes serve .` or `python3 -m http.server 8080`
- Test command(s): `npm test` (Vitest); `npm run test:run` for CI-style once
- Build / lint / typecheck: `npm run build`, `npm run lint`, `npm run typecheck`
- Computer use available: no (local)
- Default validation method for this saga: Vitest unit/integration tests for domain; manual browser checklist for UI milestones (orchestrator or user); build must succeed

## Shared interfaces (saga-wide contract)
Workers MUST use these shapes; later milestones depend on them.

```ts
/** Deep-link / download params — preserve query names */
export type DownloadParams = {
  url: string;
  fileName?: string;
  rootDirectory?: string; // "true" | "false" | custom name | undefined (same semantics as today)
};

export type RepoRef = {
  owner: string;
  repo: string;
  ref: string | null; // null = needs default-branch resolve
  path: string;       // "" = whole repository
  kind: "repo" | "tree-or-blob-unknown" | "file" | "dir";
};

export type DownloadErrorKind =
  | "invalid_url"
  | "rate_limited"
  | "not_found"
  | "network"
  | "partial"
  | "unknown";

export type DownloadError = {
  kind: DownloadErrorKind;
  message: string;
  resetAt?: number;      // epoch ms if rate-limited and known
  missingPaths?: string[]; // if partial
};

export type DownloadEvent =
  | { type: "progress"; downloaded: number; total: number }
  | { type: "done"; blob: Blob; fileName: string } // UI saves `${fileName}.zip` unless fileName already ends with .zip
  | { type: "redirect"; url: string } // whole-repo → GitHub archive zip URL; UI navigates
  | { type: "fail"; error: DownloadError };

export interface CredentialStore {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
}

export interface GitHubHttp {
  /** GET json; attach Authorization only if credential store has a token */
  getJson<T>(url: string): Promise<{ status: number; headers: Headers; data: T }>;
  getArrayBuffer(url: string): Promise<{ status: number; headers: Headers; data: ArrayBuffer }>;
}
```

Deep-link contract (must keep working):
`{origin}/#/home?url=<GitHub link>&fileName=<name>&rootDirectory=<true|false|name>`

Whole-repo behavior: navigate browser to
`https://github.com/{owner}/{repo}/archive/{ref}.zip`
(after resolving default branch when ref is missing).

## Saga exit criteria
1. `rg -n "github_pat_|ghp_[A-Za-z0-9]|Authorization:\\s*['\"]token "` on tracked source under `src/` and legacy `app/` (if still present) returns **no** embedded secrets; optional token only via CredentialStore/UI.
2. `npm ci && npm run typecheck && npm test && npm run build` all exit 0 on a clean checkout.
3. Unit tests cover: URL parse (valid tree/blob/repo, invalid), rootDirectory naming, default-branch fallback chain (mocked), rate_limited + not_found + partial failure events, credential get/set/clear against a fake storage.
4. Manual smoke (Vite preview or dev): 
   - Paste a public file URL → zip downloads; progress shown.
   - Paste a public directory URL → zip downloads with correct nesting per `rootDirectory`.
   - Whole-repo URL → redirects to GitHub archive zip for the repo’s default branch (or explicit branch).
   - Create share link → textarea shows current `location.origin` + `#/home?url=…` (not minhaskamal.github.io).
   - Open a deep link with `url` → auto-starts download.
   - Optional PAT: set in UI, persists across refresh (localStorage), clear removes it; 401/403/rate-limit surfaces typed message (not silent console-only).
5. No AngularJS / Bootstrap 3 / jQuery / cdn.rawgit / `lib/angular-toastr*` / dead contact form in the shipped build entry.
6. README and AGENTS.md document npm scripts, auth model, deep links, and that history scrub is manual.
7. Hash routing still used; no history-mode requirement.

## Milestone index
1. `01-security-strip-pat` — Remove embedded PAT; document rotate + out-of-band history scrub; depends on: none
2. `02-vite-tooling` — npm/Vite/React/TS/Vitest scaffold, scripts, gitignore; depends on: 01
3. `03-deep-download-module` — Pure download domain + adapters + tests (candidates 2–5); depends on: 02
4. `04-react-shell` — React UI over domain (candidates 3, 7 + credential UI); depends on: 03
5. `05-legacy-cleanup-docs` — Delete legacy static Angular tree from entry; docs; depends on: 04
