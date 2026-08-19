import { describe, expect, it, vi } from 'vitest'
import { resolveRef } from './resolveRef'
import type { DownloadError, GitHubHttp } from './types'

function createHttp(
  getJsonImpl: (url: string) => Promise<{ status: number; headers: Headers; data: unknown }>,
): {
  http: GitHubHttp
  getJson: ReturnType<typeof vi.fn>
} {
  const getJson = vi.fn(getJsonImpl)
  return {
    http: {
      getJson: getJson as unknown as GitHubHttp['getJson'],
      getArrayBuffer: vi.fn(async () => {
        throw new Error('getArrayBuffer should not be called')
      }),
    },
    getJson,
  }
}

describe('resolveRef', () => {
  it('returns non-null ref unchanged without calling getJson', async () => {
    const { http, getJson } = createHttp(async () => {
      throw new Error('getJson should not be called')
    })

    const result = await resolveRef('octocat', 'Hello-World', 'feature/x', http)

    expect(result).toEqual({ ref: 'feature/x' })
    expect(getJson).not.toHaveBeenCalled()
  })

  it('uses default_branch from Repos API when ref is null', async () => {
    const { http, getJson } = createHttp(async () => ({
      status: 200,
      headers: new Headers(),
      data: { default_branch: 'develop' },
    }))

    const result = await resolveRef('octocat', 'Hello-World', null, http)

    expect(result).toEqual({ ref: 'develop' })
    expect(getJson).toHaveBeenCalledOnce()
    expect(getJson).toHaveBeenCalledWith(
      'https://api.github.com/repos/octocat/Hello-World',
    )
  })

  it('uses master when API reports default_branch master', async () => {
    const { http } = createHttp(async () => ({
      status: 200,
      headers: new Headers(),
      data: { default_branch: 'master' },
    }))

    const result = await resolveRef('owner', 'repo', null, http)

    expect(result).toEqual({ ref: 'master' })
  })

  it('returns not_found when Repos API responds 404', async () => {
    const notFound: DownloadError = {
      kind: 'not_found',
      message: 'Not Found',
    }
    const { http } = createHttp(async () => {
      throw notFound
    })

    const result = await resolveRef('missing', 'repo', null, http)

    expect(result).toEqual({ error: notFound })
  })

  it('propagates rate_limited errors', async () => {
    const rateLimited: DownloadError = {
      kind: 'rate_limited',
      message: 'API rate limit exceeded',
      resetAt: 1700000000 * 1000,
    }
    const { http } = createHttp(async () => {
      throw rateLimited
    })

    const result = await resolveRef('owner', 'repo', null, http)

    expect(result).toEqual({ error: rateLimited })
  })

  it('falls back to main on network failure', async () => {
    const network: DownloadError = {
      kind: 'network',
      message: 'Failed to fetch',
    }
    const { http } = createHttp(async () => {
      throw network
    })

    const result = await resolveRef('owner', 'repo', null, http)

    expect(result).toEqual({ ref: 'main' })
  })

  it('falls back to main on unknown API failures', async () => {
    const unknown: DownloadError = {
      kind: 'unknown',
      message: 'HTTP 500',
    }
    const { http } = createHttp(async () => {
      throw unknown
    })

    const result = await resolveRef('owner', 'repo', null, http)

    expect(result).toEqual({ ref: 'main' })
  })
})
