import type { CredentialStore } from './credentials'
import type { DownloadError, GitHubHttp } from './types'

const MESSAGE_SNIPPET_MAX = 200

function snippet(text: string, max = MESSAGE_SNIPPET_MAX): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) {
    return trimmed
  }
  return `${trimmed.slice(0, max)}…`
}

function looksLikeRateLimit(bodyText: string, headers?: Headers): boolean {
  const lower = bodyText.toLowerCase()
  if (
    lower.includes('rate limit') ||
    lower.includes('rate_limit') ||
    lower.includes('secondary rate') ||
    lower.includes('abuse detection')
  ) {
    return true
  }
  return headers?.get('x-ratelimit-remaining') === '0'
}

function parseResetAt(headers?: Headers): number | undefined {
  const raw = headers?.get('x-ratelimit-reset')
  if (raw == null || raw === '') {
    return undefined
  }
  const seconds = Number(raw)
  if (!Number.isFinite(seconds)) {
    return undefined
  }
  return seconds * 1000
}

export function classifyGitHubFailure(
  status: number,
  bodyText: string,
  headers?: Headers,
): DownloadError {
  if (status === 0) {
    return {
      kind: 'network',
      message: snippet(bodyText) || 'Network request failed',
    }
  }

  if (status === 404) {
    return {
      kind: 'not_found',
      message: snippet(bodyText) || 'Not found',
    }
  }

  if (status === 403 || status === 429) {
    if (status === 429 || looksLikeRateLimit(bodyText, headers)) {
      const resetAt = parseResetAt(headers)
      const error: DownloadError = {
        kind: 'rate_limited',
        message: snippet(bodyText) || 'GitHub API rate limit exceeded',
      }
      if (resetAt !== undefined) {
        error.resetAt = resetAt
      }
      return error
    }
  }

  return {
    kind: 'unknown',
    message: snippet(bodyText) || `HTTP ${status}`,
  }
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

export function createGitHubHttp(deps: {
  credentials: CredentialStore
  fetchFn?: typeof fetch
}): GitHubHttp {
  const fetchFn = deps.fetchFn ?? globalThis.fetch.bind(globalThis)

  async function getResponse(url: string): Promise<Response> {
    const headers = new Headers()
    const token = deps.credentials.getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    try {
      return await fetchFn(url, { method: 'GET', headers })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network request failed'
      throw classifyGitHubFailure(0, message)
    }
  }

  return {
    async getJson<T>(url: string) {
      const response = await getResponse(url)
      const bodyText = await response.text()
      if (!response.ok) {
        throw classifyGitHubFailure(response.status, bodyText, response.headers)
      }
      const data = (bodyText === '' ? null : JSON.parse(bodyText)) as T
      return { status: response.status, headers: response.headers, data }
    },

    async getArrayBuffer(url: string) {
      const response = await getResponse(url)
      if (!response.ok) {
        const bodyText = await response.text()
        throw classifyGitHubFailure(response.status, bodyText, response.headers)
      }
      try {
        const data = await response.arrayBuffer()
        return { status: response.status, headers: response.headers, data }
      } catch (err) {
        if (isDownloadError(err)) {
          throw err
        }
        const message = err instanceof Error ? err.message : 'Network request failed'
        throw classifyGitHubFailure(0, message)
      }
    },
  }
}
