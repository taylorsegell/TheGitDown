/** Deep-link / download params — preserve query names */
export type DownloadParams = {
  url: string
  fileName?: string
  rootDirectory?: string // "true" | "false" | custom name | undefined (same semantics as today)
}

export type RepoRef = {
  owner: string
  repo: string
  ref: string | null // null = needs default-branch resolve
  path: string // "" = whole repository
  kind: 'repo' | 'tree-or-blob-unknown' | 'file' | 'dir'
}

export type DownloadErrorKind =
  | 'invalid_url'
  | 'rate_limited'
  | 'not_found'
  | 'network'
  | 'partial'
  | 'unknown'

export type DownloadError = {
  kind: DownloadErrorKind
  message: string
  resetAt?: number // epoch ms if rate-limited and known
  missingPaths?: string[] // if partial
}

export type DownloadEvent =
  | { type: 'progress'; downloaded: number; total: number }
  | { type: 'done'; blob: Blob; fileName: string } // UI saves `${fileName}.zip` unless fileName already ends with .zip
  | { type: 'redirect'; url: string } // whole-repo → GitHub archive zip URL; UI navigates
  | { type: 'fail'; error: DownloadError }

export interface CredentialStore {
  getToken(): string | null
  setToken(token: string): void
  clearToken(): void
}

export interface GitHubHttp {
  /** GET json; attach Authorization only if credential store has a token */
  getJson<T>(url: string): Promise<{ status: number; headers: Headers; data: T }>
  getArrayBuffer(
    url: string,
  ): Promise<{ status: number; headers: Headers; data: ArrayBuffer }>
}
