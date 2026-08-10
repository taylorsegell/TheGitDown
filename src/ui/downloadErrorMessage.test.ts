import { describe, expect, it } from 'vitest'
import { mapDownloadErrorMessage } from './downloadErrorMessage'
import type { DownloadError } from '../domain/types'

describe('mapDownloadErrorMessage', () => {
  it('rate_limited message contains “rate” (case-insensitive)', () => {
    const error: DownloadError = {
      kind: 'rate_limited',
      message: 'API limit',
    }
    const msg = mapDownloadErrorMessage(error)
    expect(msg.toLowerCase()).toContain('rate')
  })

  it('mentions optional token for rate limits', () => {
    const msg = mapDownloadErrorMessage({
      kind: 'rate_limited',
      message: 'hit',
    })
    expect(msg.toLowerCase()).toMatch(/token|personal access/)
  })

  it('passes through invalid_url message', () => {
    expect(
      mapDownloadErrorMessage({
        kind: 'invalid_url',
        message: 'URL must be a github.com link',
      }),
    ).toBe('URL must be a github.com link')
  })
})
