import { buildZipNames, parseGitHubUrl } from './githubUrl'
import { resolveRef } from './resolveRef'
import type {
  DownloadError,
  DownloadEvent,
  DownloadParams,
  GitHubHttp,
  RepoRef,
} from './types'
import { generateZip } from './zip'

type ContentsEntry = {
  type: string
  name: string
  path: string
  download_url: string | null
}

type ContentsFile = ContentsEntry & {
  type: 'file'
  download_url: string | null
  encoding?: string
  content?: string
}

type FileToFetch = {
  /** Path relative to the requested root (for zip entry naming) */
  relativePath: string
  /** Full repo path (for missingPaths reporting) */
  repoPath: string
  downloadUrl: string | null
}

const DIRECTORY_FETCH_CONCURRENCY = 6

function isDownloadError(value: unknown): value is DownloadError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    'message' in value &&
    typeof (value as DownloadError).kind === 'string' &&
    typeof (value as DownloadError).message === 'string'
  )
}

function contentsUrl(owner: string, repo: string, path: string, ref: string): string {
  const encodedPath = path
    .split('/')
    .filter((s) => s.length > 0)
    .map(encodeURIComponent)
    .join('/')
  const base = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents`
  const withPath = encodedPath ? `${base}/${encodedPath}` : base
  return `${withPath}?ref=${encodeURIComponent(ref)}`
}

function rawUrl(owner: string, repo: string, ref: string, path: string): string {
  const encodedPath = path
    .split('/')
    .filter((s) => s.length > 0)
    .map(encodeURIComponent)
    .join('/')
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(ref)}/${encodedPath}`
}

function archiveUrl(owner: string, repo: string, ref: string): string {
  return `https://github.com/${owner}/${repo}/archive/${ref}.zip`
}

function basename(path: string): string {
  const parts = path.split('/').filter((s) => s.length > 0)
  return parts[parts.length - 1] ?? path
}

function zipEntryPath(rootDirectoryPrefix: string, relativePath: string): string {
  if (rootDirectoryPrefix === '') {
    return relativePath
  }
  return `${rootDirectoryPrefix}${relativePath}`
}

/**
 * Relative path of a file under the requested root path.
 * Matches legacy: path.substring(resPath.length + 1) for nested files.
 */
function relativeToRoot(repoPath: string, rootPath: string): string {
  if (rootPath === '') {
    return repoPath
  }
  if (repoPath === rootPath) {
    return basename(repoPath)
  }
  const prefix = rootPath.endsWith('/') ? rootPath : `${rootPath}/`
  if (repoPath.startsWith(prefix)) {
    return repoPath.slice(prefix.length)
  }
  return repoPath
}

async function probeContents(
  http: GitHubHttp,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<
  | { ok: true; data: ContentsFile | ContentsEntry[]; ref: string }
  | { ok: false; error: DownloadError }
> {
  try {
    const { data } = await http.getJson<ContentsFile | ContentsEntry[]>(
      contentsUrl(owner, repo, path, ref),
    )
    return { ok: true, data, ref }
  } catch (err) {
    if (!isDownloadError(err)) {
      return {
        ok: false,
        error: { kind: 'unknown', message: 'Contents probe failed' },
      }
    }

    // Soft main → master retry for Contents probe only (task 3.4/3.5).
    if (err.kind === 'not_found' && ref === 'main') {
      try {
        const { data } = await http.getJson<ContentsFile | ContentsEntry[]>(
          contentsUrl(owner, repo, path, 'master'),
        )
        return { ok: true, data, ref: 'master' }
      } catch (retryErr) {
        if (isDownloadError(retryErr) && retryErr.kind !== 'not_found') {
          return { ok: false, error: retryErr }
        }
        // fall through to not_found from original/main
      }
    }

    return { ok: false, error: err }
  }
}

function ingestListing(
  listing: ContentsEntry[],
  rootPath: string,
  files: FileToFetch[],
  dirQueue: string[],
): void {
  for (const entry of listing) {
    if (entry.type === 'dir') {
      dirQueue.push(entry.path)
    } else if (entry.type === 'file') {
      files.push({
        relativePath: relativeToRoot(entry.path, rootPath),
        repoPath: entry.path,
        downloadUrl: entry.download_url,
      })
    }
  }
}

async function collectDirectoryFiles(
  http: GitHubHttp,
  owner: string,
  repo: string,
  ref: string,
  rootPath: string,
  initialListing: ContentsEntry[],
): Promise<{ files: FileToFetch[] } | { error: DownloadError }> {
  const files: FileToFetch[] = []
  const dirQueue: string[] = []
  ingestListing(initialListing, rootPath, files, dirQueue)

  while (dirQueue.length > 0) {
    const current = dirQueue.pop()!
    try {
      const { data } = await http.getJson<ContentsEntry[]>(
        contentsUrl(owner, repo, current, ref),
      )
      if (!Array.isArray(data)) {
        return {
          error: {
            kind: 'unknown',
            message: `Expected directory listing for ${current}`,
          },
        }
      }
      ingestListing(data, rootPath, files, dirQueue)
    } catch (err) {
      if (isDownloadError(err)) {
        return { error: err }
      }
      return {
        error: { kind: 'unknown', message: `Failed to list ${current}` },
      }
    }
  }

  return { files }
}

async function fetchBlob(
  http: GitHubHttp,
  file: FileToFetch,
  owner: string,
  repo: string,
  ref: string,
): Promise<{ ok: true; data: ArrayBuffer } | { ok: false; error: DownloadError }> {
  const url =
    file.downloadUrl ??
    rawUrl(owner, repo, ref, file.repoPath)

  try {
    const { data } = await http.getArrayBuffer(url)
    return { ok: true, data }
  } catch (err) {
    // Large-file / missing download_url: try raw once if we had a Contents download_url that failed with not_found
    if (
      isDownloadError(err) &&
      err.kind === 'not_found' &&
      file.downloadUrl != null
    ) {
      try {
        const { data } = await http.getArrayBuffer(
          rawUrl(owner, repo, ref, file.repoPath),
        )
        return { ok: true, data }
      } catch (rawErr) {
        if (isDownloadError(rawErr)) {
          return { ok: false, error: rawErr }
        }
        return {
          ok: false,
          error: { kind: 'unknown', message: `Failed to fetch ${file.repoPath}` },
        }
      }
    }

    if (isDownloadError(err)) {
      return { ok: false, error: err }
    }
    return {
      ok: false,
      error: { kind: 'unknown', message: `Failed to fetch ${file.repoPath}` },
    }
  }
}

async function* fetchDirectoryBlobs(
  http: GitHubHttp,
  files: FileToFetch[],
  owner: string,
  repo: string,
  ref: string,
): AsyncGenerator<{
  index: number
  file: FileToFetch
  fetched: Awaited<ReturnType<typeof fetchBlob>>
}> {
  type Result = {
    index: number
    file: FileToFetch
    fetched: Awaited<ReturnType<typeof fetchBlob>>
  }

  const active = new Map<number, Promise<Result>>()
  let nextIndex = 0

  const start = (index: number) => {
    const file = files[index]!
    active.set(
      index,
      fetchBlob(http, file, owner, repo, ref).then((fetched) => ({
        index,
        file,
        fetched,
      })),
    )
  }

  while (nextIndex < files.length && active.size < DIRECTORY_FETCH_CONCURRENCY) {
    start(nextIndex)
    nextIndex += 1
  }

  while (active.size > 0) {
    const result = await Promise.race(active.values())
    active.delete(result.index)
    if (nextIndex < files.length) {
      start(nextIndex)
      nextIndex += 1
    }
    yield result
  }
}

/**
 * Deep download: parse → resolve ref → redirect (whole repo) or walk/zip path.
 * Yields typed DownloadEvent stream. UI concerns stay outside this module.
 */
export async function* downloadGitHubPath(
  params: DownloadParams,
  deps: {
    http: GitHubHttp
    zipGenerate?: (files: { path: string; data: ArrayBuffer }[]) => Promise<Blob>
  },
): AsyncGenerator<DownloadEvent> {
  const parsed = parseGitHubUrl(params.url)
  if ('ok' in parsed && parsed.ok === false) {
    yield { type: 'fail', error: parsed.error }
    return
  }

  const repoRef = parsed as RepoRef
  const resolved = await resolveRef(
    repoRef.owner,
    repoRef.repo,
    repoRef.ref,
    deps.http,
  )
  if ('error' in resolved) {
    yield { type: 'fail', error: resolved.error }
    return
  }

  let ref = resolved.ref
  const { owner, repo, path } = repoRef
  const namingRef: RepoRef = { ...repoRef, ref }
  const { downloadFileName, rootDirectoryPrefix } = buildZipNames(namingRef, params)
  const zipGenerate = deps.zipGenerate ?? generateZip

  // Whole repository → GitHub archive redirect
  if (path === '') {
    yield { type: 'redirect', url: archiveUrl(owner, repo, ref) }
    return
  }

  const probe = await probeContents(deps.http, owner, repo, path, ref)
  if (!probe.ok) {
    // Large-file fallback: Contents not_found → try raw once
    if (probe.error.kind === 'not_found') {
      let data: ArrayBuffer
      try {
        const res = await deps.http.getArrayBuffer(
          rawUrl(owner, repo, ref, path),
        )
        data = res.data
      } catch (rawErr) {
        if (isDownloadError(rawErr)) {
          yield { type: 'fail', error: rawErr }
          return
        }
        yield {
          type: 'fail',
          error: { kind: 'not_found', message: probe.error.message },
        }
        return
      }

      // Match legacy single-file zip entry: basename only
      const zipPath = basename(path)
      yield { type: 'progress', downloaded: 0, total: 1 }
      yield { type: 'progress', downloaded: 1, total: 1 }
      const blob = await zipGenerate([{ path: zipPath, data }])
      yield { type: 'done', blob, fileName: downloadFileName }
      return
    }

    yield { type: 'fail', error: probe.error }
    return
  }

  ref = probe.ref

  // Single file
  if (!Array.isArray(probe.data)) {
    const file = probe.data
    const fileToFetch: FileToFetch = {
      relativePath: basename(file.path || path),
      repoPath: file.path || path,
      downloadUrl: file.download_url,
    }

    yield { type: 'progress', downloaded: 0, total: 1 }

    const fetched = await fetchBlob(deps.http, fileToFetch, owner, repo, ref)
    if (!fetched.ok) {
      if (fetched.error.kind === 'rate_limited') {
        yield { type: 'fail', error: fetched.error }
        return
      }
      yield {
        type: 'fail',
        error: {
          kind: 'partial',
          message: `Failed to download ${fileToFetch.repoPath}`,
          missingPaths: [fileToFetch.repoPath],
        },
      }
      return
    }

    yield { type: 'progress', downloaded: 1, total: 1 }

    // Match legacy single-file zip entry: basename only
    const blob = await zipGenerate([
      { path: fileToFetch.relativePath, data: fetched.data },
    ])
    yield { type: 'done', blob, fileName: downloadFileName }
    return
  }

  // Directory walk (reuse probe listing; recurse into nested dirs)
  const collected = await collectDirectoryFiles(
    deps.http,
    owner,
    repo,
    ref,
    path,
    probe.data,
  )
  if ('error' in collected) {
    yield { type: 'fail', error: collected.error }
    return
  }

  const { files } = collected
  if (files.length === 0) {
    const blob = await zipGenerate([])
    yield { type: 'progress', downloaded: 0, total: 0 }
    yield { type: 'done', blob, fileName: downloadFileName }
    return
  }

  const zipFiles: { path: string; data: ArrayBuffer }[] = new Array(files.length)
  const missingPaths: string[] = []
  let downloaded = 0
  const total = files.length

  yield { type: 'progress', downloaded: 0, total }

  for await (const { index, file, fetched } of fetchDirectoryBlobs(
    deps.http,
    files,
    owner,
    repo,
    ref,
  )) {
    if (!fetched.ok) {
      if (fetched.error.kind === 'rate_limited') {
        yield { type: 'fail', error: fetched.error }
        return
      }
      missingPaths.push(file.repoPath)
      continue
    }
    downloaded += 1
    zipFiles[index] = {
      path: zipEntryPath(rootDirectoryPrefix, file.relativePath),
      data: fetched.data,
    }
    yield { type: 'progress', downloaded, total }
  }

  if (missingPaths.length > 0) {
    yield {
      type: 'fail',
      error: {
        kind: 'partial',
        message: `Failed to download ${missingPaths.length} file(s)`,
        missingPaths,
      },
    }
    return
  }

  const blob = await zipGenerate(zipFiles)
  yield { type: 'done', blob, fileName: downloadFileName }
}
