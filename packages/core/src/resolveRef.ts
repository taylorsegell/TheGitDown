import type { DownloadError, GitHubHttp } from './types'

type RepoApiResponse = {
  default_branch?: string
}

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

/**
 * Resolve a repo ref for download.
 *
 * - Non-null `ref` is returned unchanged (no network).
 * - Null `ref` GETs `/repos/{owner}/{repo}` and uses `default_branch`.
 * - Repo 404 → `{ error: not_found }`.
 * - rate_limited → propagated.
 * - Other / network / unknown failures → soft fallback `"main"`
 *   (do not try `"master"` here; Contents/archive may probe that in a later task).
 */
export async function resolveRef(
  owner: string,
  repo: string,
  ref: string | null,
  http: GitHubHttp,
): Promise<{ ref: string } | { error: DownloadError }> {
  if (ref !== null) {
    return { ref }
  }

  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`

  try {
    const { data } = await http.getJson<RepoApiResponse>(url)
    const defaultBranch = data?.default_branch
    if (typeof defaultBranch === 'string' && defaultBranch.length > 0) {
      return { ref: defaultBranch }
    }
    // Malformed success payload — treat as soft failure.
    return { ref: 'main' }
  } catch (err) {
    if (isDownloadError(err)) {
      if (err.kind === 'not_found' || err.kind === 'rate_limited') {
        return { error: err }
      }
      // network / unknown / other → soft fallback
      return { ref: 'main' }
    }
    return { ref: 'main' }
  }
}
