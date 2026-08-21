import type { DownloadError, DownloadParams, RepoRef } from './types'

export type ParseGitHubUrlFailure = { ok: false; error: DownloadError }

function invalidUrl(message: string): ParseGitHubUrlFailure {
  return {
    ok: false,
    error: { kind: 'invalid_url', message },
  }
}

/**
 * Parse a GitHub HTTPS file/directory/repo URL into a RepoRef.
 * No network I/O.
 */
export function parseGitHubUrl(url: string): RepoRef | ParseGitHubUrlFailure {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return invalidUrl('Not a valid URL')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return invalidUrl('URL must use http or https')
  }

  const host = parsed.hostname.toLowerCase()
  if (host !== 'github.com' && host !== 'www.github.com') {
    return invalidUrl('URL must be a github.com link')
  }

  const segments = parsed.pathname
    .split('/')
    .filter((s) => s.length > 0)
    .map((s) => {
      try {
        return decodeURIComponent(s)
      } catch {
        return s
      }
    })

  if (segments.length < 2) {
    return invalidUrl('URL must include owner and repository')
  }

  const owner = segments[0]!
  const repo = segments[1]!

  if (!owner || !repo) {
    return invalidUrl('URL must include owner and repository')
  }

  // Whole repo: /owner/repo
  if (segments.length === 2) {
    return {
      owner,
      repo,
      ref: null,
      path: '',
      kind: 'repo',
    }
  }

  const marker = segments[2]
  if (marker !== 'tree' && marker !== 'blob') {
    return invalidUrl('URL must be a repository, tree, or blob link')
  }

  if (segments.length < 4) {
    return invalidUrl('URL is missing branch or ref')
  }

  const ref = segments[3]!
  const path = segments.slice(4).join('/')

  if (path === '') {
    return {
      owner,
      repo,
      ref,
      path: '',
      kind: 'repo',
    }
  }

  return {
    owner,
    repo,
    ref,
    path,
    kind: marker === 'blob' ? 'file' : 'dir',
  }
}

function rootNameFor(ref: RepoRef): string {
  if (ref.path === '') {
    return ref.repo
  }
  const parts = ref.path.split('/').filter((s) => s.length > 0)
  return parts[parts.length - 1] ?? ref.repo
}

/**
 * Compute download file name (no .zip) and zip root directory prefix
 * using legacy DownGit / TheGitDown semantics.
 */
export function buildZipNames(
  ref: RepoRef,
  params: Pick<DownloadParams, 'fileName' | 'rootDirectory'>,
): {
  downloadFileName: string
  rootDirectoryPrefix: string
} {
  const rootName = rootNameFor(ref)

  const downloadFileName =
    !params.fileName || params.fileName === '' ? rootName : params.fileName

  let rootDirectoryPrefix: string
  if (params.rootDirectory === 'false') {
    rootDirectoryPrefix = ''
  } else if (
    !params.rootDirectory ||
    params.rootDirectory === '' ||
    params.rootDirectory === 'true'
  ) {
    rootDirectoryPrefix = `${rootName}/`
  } else {
    rootDirectoryPrefix = `${params.rootDirectory}/`
  }

  return { downloadFileName, rootDirectoryPrefix }
}
