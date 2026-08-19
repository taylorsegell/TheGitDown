import { describe, expect, it } from 'vitest'
import { handleExtRequest, type ActiveTabsQuery } from './messages'

function mockTabsQuery(url: string | undefined): ActiveTabsQuery {
  return async (queryInfo) => {
    expect(queryInfo).toEqual({ active: true, currentWindow: true })
    return [{ url }]
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

  it('AUTH_GET_STATUS stub JSON has no token keys', async () => {
    const response = await handleExtRequest({ type: 'AUTH_GET_STATUS' })
    expect(response).toEqual({ hasToken: false })

    const json = JSON.stringify(response)
    expect(json).not.toContain('"token"')
    expect(json).not.toContain('"pat"')
    expect(json).not.toContain('"githubToken"')
    expect(Object.keys(response)).toEqual(['hasToken'])
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

  it('AUTH_SET_TOKEN and AUTH_CLEAR_TOKEN are no-op oks', async () => {
    expect(
      await handleExtRequest({
        type: 'AUTH_SET_TOKEN',
        token: 'secret-should-not-persist',
      }),
    ).toEqual({ ok: true })
    expect(await handleExtRequest({ type: 'AUTH_CLEAR_TOKEN' })).toEqual({
      ok: true,
    })
  })
})
