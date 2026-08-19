import { describe, expect, it } from 'vitest'
import { handleExtRequest } from './messages'

describe('handleExtRequest stubs', () => {
  it('{ type: "GET_JOB_STATE" } returns idle state', () => {
    expect(handleExtRequest({ type: 'GET_JOB_STATE' })).toEqual({
      state: { status: 'idle' },
    })
  })

  it('{ type: "START_DOWNLOAD" } is not implemented', () => {
    expect(
      handleExtRequest({
        type: 'START_DOWNLOAD',
        url: 'https://github.com/a/b',
      }),
    ).toEqual({ accepted: false, reason: 'not_implemented' })
  })

  it('AUTH_GET_STATUS stub JSON has no token keys', () => {
    const response = handleExtRequest({ type: 'AUTH_GET_STATUS' })
    expect(response).toEqual({ hasToken: false })

    const json = JSON.stringify(response)
    expect(json).not.toContain('"token"')
    expect(json).not.toContain('"pat"')
    expect(json).not.toContain('"githubToken"')
    expect(Object.keys(response)).toEqual(['hasToken'])
  })

  it('GET_ACTIVE_DETECTION returns a not_github stub', () => {
    expect(handleExtRequest({ type: 'GET_ACTIVE_DETECTION' })).toEqual({
      detection: {
        ok: false,
        source: 'tab',
        url: null,
        reason: 'not_github',
      },
    })
  })

  it('CANCEL_DOWNLOAD is not accepted', () => {
    expect(handleExtRequest({ type: 'CANCEL_DOWNLOAD' })).toEqual({
      accepted: false,
    })
  })

  it('AUTH_SET_TOKEN and AUTH_CLEAR_TOKEN are no-op oks', () => {
    expect(
      handleExtRequest({ type: 'AUTH_SET_TOKEN', token: 'secret-should-not-persist' }),
    ).toEqual({ ok: true })
    expect(handleExtRequest({ type: 'AUTH_CLEAR_TOKEN' })).toEqual({ ok: true })
  })
})
