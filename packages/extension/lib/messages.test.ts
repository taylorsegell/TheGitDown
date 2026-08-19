import { describe, expect, it } from 'vitest'
import { createChromeStorageCredentialStore } from './credentialStore'
import { handleExtRequest, type ActiveTabsQuery } from './messages'

function mockTabsQuery(url: string | undefined): ActiveTabsQuery {
  return async (queryInfo) => {
    expect(queryInfo).toEqual({ active: true, currentWindow: true })
    return [{ url }]
  }
}

function createMemoryStorageArea() {
  const data = new Map<string, unknown>()
  const area = {
    async get(keys: string | string[]) {
      const list = Array.isArray(keys) ? keys : [keys]
      const out: Record<string, unknown> = {}
      for (const k of list) {
        if (data.has(k)) {
          out[k] = data.get(k)
        }
      }
      return out
    },
    async set(items: Record<string, unknown>) {
      for (const [k, v] of Object.entries(items)) {
        data.set(k, v)
      }
    },
    async remove(keys: string | string[]) {
      const list = Array.isArray(keys) ? keys : [keys]
      for (const k of list) {
        data.delete(k)
      }
    },
  }
  return { area, data }
}

function authDeps() {
  const { area, data } = createMemoryStorageArea()
  return {
    credentialStore: createChromeStorageCredentialStore(area),
    data,
  }
}

describe('handleExtRequest stubs', () => {
  it('{ type: "GET_JOB_STATE" } returns idle state', async () => {
    expect(await handleExtRequest({ type: 'GET_JOB_STATE' })).toEqual({
      state: { status: 'idle' },
    })
  })

  it('{ type: "START_DOWNLOAD" } is not implemented', async () => {
    expect(
      await handleExtRequest({
        type: 'START_DOWNLOAD',
        url: 'https://github.com/a/b',
      }),
    ).toEqual({ accepted: false, reason: 'not_implemented' })
  })

  it('AUTH_GET_STATUS JSON does not include the stored token', async () => {
    const deps = authDeps()
    await handleExtRequest({ type: 'AUTH_SET_TOKEN', token: 'abc' }, deps)

    const response = await handleExtRequest({ type: 'AUTH_GET_STATUS' }, deps)
    expect(response).toEqual({ hasToken: true })
    expect(Object.keys(response)).toEqual(['hasToken'])

    const json = JSON.stringify(response)
    expect(json).not.toContain('abc')
    expect(json).not.toContain('"token"')
    expect(json).not.toContain('"pat"')
    expect(json).not.toContain('"githubToken"')
  })

  it('GET_ACTIVE_DETECTION with mocked GitHub tab URL returns ok: true', async () => {
    const response = await handleExtRequest(
      { type: 'GET_ACTIVE_DETECTION' },
      { tabsQuery: mockTabsQuery('https://github.com/a/b') },
    )
    expect(response.detection.ok).toBe(true)
    expect(response.detection.url).toBe('https://github.com/a/b')
    expect(response.detection.url).not.toBeNull()
    if (!response.detection.ok) {
      throw new Error('expected GET_ACTIVE_DETECTION to succeed')
    }
    expect(response.detection.source).toBe('tab')
    expect(response.detection.ref.kind).toBe('repo')
    expect(response.detection.ref.owner).toBe('a')
    expect(response.detection.ref.repo).toBe('b')
  })

  it('CANCEL_DOWNLOAD is not accepted', async () => {
    expect(await handleExtRequest({ type: 'CANCEL_DOWNLOAD' })).toEqual({
      accepted: false,
    })
  })

  it('AUTH_SET_TOKEN tok then AUTH_GET_STATUS hasToken true', async () => {
    const deps = authDeps()
    expect(
      await handleExtRequest({ type: 'AUTH_SET_TOKEN', token: 'tok' }, deps),
    ).toEqual({ ok: true })
    expect(await handleExtRequest({ type: 'AUTH_GET_STATUS' }, deps)).toEqual({
      hasToken: true,
    })
    expect(deps.data.get('gitdown.githubToken')).toBe('tok')
  })

  it('AUTH_CLEAR_TOKEN then hasToken false', async () => {
    const deps = authDeps()
    await handleExtRequest({ type: 'AUTH_SET_TOKEN', token: 'tok' }, deps)
    expect(await handleExtRequest({ type: 'AUTH_CLEAR_TOKEN' }, deps)).toEqual({
      ok: true,
    })
    expect(await handleExtRequest({ type: 'AUTH_GET_STATUS' }, deps)).toEqual({
      hasToken: false,
    })
    expect(deps.data.has('gitdown.githubToken')).toBe(false)
  })

  it('AUTH_SET_TOKEN empty/whitespace clears the stored token', async () => {
    const deps = authDeps()
    await handleExtRequest({ type: 'AUTH_SET_TOKEN', token: 'tok' }, deps)
    expect(
      await handleExtRequest({ type: 'AUTH_SET_TOKEN', token: '   ' }, deps),
    ).toEqual({ ok: true })
    expect(await handleExtRequest({ type: 'AUTH_GET_STATUS' }, deps)).toEqual({
      hasToken: false,
    })
    expect(deps.data.has('gitdown.githubToken')).toBe(false)
  })
})
