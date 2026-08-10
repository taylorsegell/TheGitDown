import { describe, expect, it, vi } from 'vitest'
import type { CredentialStore } from './credentials'
import { classifyGitHubFailure, createGitHubHttp } from './githubHttp'
import type { DownloadError } from './types'

function createCredentialStore(token: string | null = null): CredentialStore {
  let current = token
  return {
    getToken: () => current,
    setToken: (value: string) => {
      current = value.trim() === '' ? null : value.trim()
    },
    clearToken: () => {
      current = null
    },
  }
}

function jsonResponse(
  status: number,
  body: unknown,
  headerInit?: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headerInit,
    },
  })
}

type FetchFn = typeof fetch

function mockFetch(handler: FetchFn) {
  return vi.fn(handler)
}

function requestHeaders(fetchFn: ReturnType<typeof mockFetch>): Headers {
  const call = fetchFn.mock.calls[0]
  expect(call).toBeDefined()
  return new Headers(call![1]?.headers)
}

describe('classifyGitHubFailure', () => {
  it('classifies 403 rate-limit body as rate_limited and parses reset header', () => {
    const headers = new Headers({ 'x-ratelimit-reset': '1700000000' })
    const error = classifyGitHubFailure(
      403,
      JSON.stringify({ message: 'API rate limit exceeded for user ID 1.' }),
      headers,
    )

    expect(error.kind).toBe('rate_limited')
    expect(error.message.toLowerCase()).toContain('rate limit')
    expect(error.resetAt).toBe(1700000000 * 1000)
  })

  it('classifies 429 as rate_limited', () => {
    const error = classifyGitHubFailure(429, 'Too many requests')
    expect(error.kind).toBe('rate_limited')
  })

  it('classifies 404 as not_found', () => {
    const error = classifyGitHubFailure(404, '{"message":"Not Found"}')
    expect(error.kind).toBe('not_found')
  })

  it('classifies status 0 as network', () => {
    const error = classifyGitHubFailure(0, 'Failed to fetch')
    expect(error.kind).toBe('network')
    expect(error.message).toContain('Failed to fetch')
  })

  it('classifies other failures as unknown with message snippet', () => {
    const error = classifyGitHubFailure(500, 'Internal Server Error boom')
    expect(error.kind).toBe('unknown')
    expect(error.message).toContain('Internal Server Error')
  })

  it('does not treat plain 403 as rate_limited without rate-limit signal', () => {
    const error = classifyGitHubFailure(403, '{"message":"Resource not accessible by integration"}')
    expect(error.kind).toBe('unknown')
  })
})

describe('createGitHubHttp', () => {
  it('omits Authorization when credentials are empty', async () => {
    const fetchFn = mockFetch(async () => jsonResponse(200, { ok: true }))
    const http = createGitHubHttp({
      credentials: createCredentialStore(null),
      fetchFn,
    })

    await http.getJson('https://api.github.com/repos/o/r')

    expect(fetchFn).toHaveBeenCalledOnce()
    expect(requestHeaders(fetchFn).has('Authorization')).toBe(false)
  })

  it('sends Authorization Bearer when a token is present', async () => {
    const fetchFn = mockFetch(async () => jsonResponse(200, { ok: true }))
    const http = createGitHubHttp({
      credentials: createCredentialStore('user-supplied-token'),
      fetchFn,
    })

    await http.getJson('https://api.github.com/repos/o/r')

    expect(requestHeaders(fetchFn).get('Authorization')).toBe('Bearer user-supplied-token')
  })

  it('rejects getJson with rate_limited on mocked 403 rate-limit body', async () => {
    const fetchFn = mockFetch(async () =>
      jsonResponse(
        403,
        { message: 'API rate limit exceeded' },
        { 'x-ratelimit-reset': '1800000000', 'x-ratelimit-remaining': '0' },
      ),
    )
    const http = createGitHubHttp({
      credentials: createCredentialStore(null),
      fetchFn,
    })

    let caught: DownloadError | undefined
    try {
      await http.getJson('https://api.github.com/rate_limit')
    } catch (err) {
      caught = err as DownloadError
    }

    expect(caught?.kind).toBe('rate_limited')
    expect(caught?.message.toLowerCase()).toContain('rate limit')
    expect(caught?.resetAt).toBe(1800000000 * 1000)
  })

  it('rejects getJson with not_found on mocked 404', async () => {
    const fetchFn = mockFetch(async () => jsonResponse(404, { message: 'Not Found' }))
    const http = createGitHubHttp({
      credentials: createCredentialStore(null),
      fetchFn,
    })

    await expect(http.getJson('https://api.github.com/repos/missing/repo')).rejects.toMatchObject({
      kind: 'not_found',
    })
  })

  it('rejects with network when fetch throws', async () => {
    const fetchFn = mockFetch(async () => {
      throw new TypeError('Failed to fetch')
    })
    const http = createGitHubHttp({
      credentials: createCredentialStore(null),
      fetchFn,
    })

    await expect(http.getJson('https://api.github.com/repos/o/r')).rejects.toMatchObject({
      kind: 'network',
      message: expect.stringContaining('Failed to fetch'),
    })
  })

  it('returns parsed JSON on success', async () => {
    const fetchFn = mockFetch(async () => jsonResponse(200, { name: 'demo' }))
    const http = createGitHubHttp({
      credentials: createCredentialStore(null),
      fetchFn,
    })

    const result = await http.getJson<{ name: string }>('https://api.github.com/repos/o/r')
    expect(result.status).toBe(200)
    expect(result.data).toEqual({ name: 'demo' })
  })

  it('getArrayBuffer returns buffer on success and classifies failures', async () => {
    const bytes = new Uint8Array([1, 2, 3]).buffer
    const okFetch = mockFetch(
      async () =>
        new Response(bytes, {
          status: 200,
          headers: { 'Content-Type': 'application/octet-stream' },
        }),
    )
    const okHttp = createGitHubHttp({
      credentials: createCredentialStore(null),
      fetchFn: okFetch,
    })
    const ok = await okHttp.getArrayBuffer('https://raw.githubusercontent.com/o/r/main/f.bin')
    expect(ok.status).toBe(200)
    expect(new Uint8Array(ok.data)).toEqual(new Uint8Array([1, 2, 3]))

    const failFetch = mockFetch(async () => jsonResponse(404, { message: 'Not Found' }))
    const failHttp = createGitHubHttp({
      credentials: createCredentialStore(null),
      fetchFn: failFetch,
    })
    await expect(failHttp.getArrayBuffer('https://raw.githubusercontent.com/missing')).rejects.toMatchObject({
      kind: 'not_found',
    })
  })

  it('does not embed a hardcoded PAT (auth only from CredentialStore)', async () => {
    const fetchFn = mockFetch(async () => jsonResponse(200, {}))
    const http = createGitHubHttp({
      credentials: createCredentialStore(null),
      fetchFn,
    })
    await http.getJson('https://api.github.com/zen')
    expect(requestHeaders(fetchFn).get('Authorization')).toBeNull()

    // Adapter factory source must not bake in token-shaped literals.
    expect(createGitHubHttp.toString()).not.toMatch(/github_pat_/)
    expect(createGitHubHttp.toString()).not.toMatch(/ghp_[A-Za-z0-9]/)
  })
})
