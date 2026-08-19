import { describe, expect, it, vi } from 'vitest'
import { mapDownloadErrorMessage } from '@gitdown/core'
import type { DownloadError, GitHubHttp } from '@gitdown/core'
import { createDownloadJob, paramsFromQuery } from './downloadJob'

function createHttp(handlers: {
  getJson?: (url: string) => Promise<{ status: number; headers: Headers; data: unknown }>
  getArrayBuffer?: GitHubHttp['getArrayBuffer']
}): GitHubHttp {
  return {
    getJson: (handlers.getJson ??
      (async () => {
        throw new Error('unexpected getJson')
      })) as GitHubHttp['getJson'],
    getArrayBuffer: handlers.getArrayBuffer ?? (async () => {
      throw new Error('unexpected getArrayBuffer')
    }),
  }
}

function createJob(http: GitHubHttp = createHttp({})) {
  const save = vi.fn()
  const navigate = vi.fn()
  const job = createDownloadJob({ http, save, navigate })
  return { job, save, navigate }
}

describe('paramsFromQuery', () => {
  it('keeps optional fileName and rootDirectory only when set', () => {
    expect(paramsFromQuery('https://github.com/a/b', null, null)).toEqual({
      url: 'https://github.com/a/b',
    })
    expect(paramsFromQuery('https://github.com/a/b', 'pack', 'lib')).toEqual({
      url: 'https://github.com/a/b',
      fileName: 'pack',
      rootDirectory: 'lib',
    })
  })
})

describe('mapDownloadErrorMessage', () => {
  it('rate_limited message contains “rate” (case-insensitive)', () => {
    const error: DownloadError = {
      kind: 'rate_limited',
      message: 'API limit',
    }
    const msg = mapDownloadErrorMessage(error)
    expect(msg.toLowerCase()).toContain('rate')
  })

  it('rate_limited with empty message still mentions rate', () => {
    const msg = mapDownloadErrorMessage({ kind: 'rate_limited', message: '' })
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

describe('createDownloadJob', () => {
  it('validate rejects empty URL', () => {
    const { job } = createJob()
    expect(job.validate('   ')).toBe(false)
    expect(job.getSnapshot()).toMatchObject({
      error: 'Enter a GitHub file or directory URL',
      urlInvalid: true,
    })
  })

  it('validate rejects a non-GitHub URL and maps the error', () => {
    const { job } = createJob()
    expect(job.validate('https://example.com/not-github')).toBe(false)
    expect(job.getSnapshot().urlInvalid).toBe(true)
    expect(job.getSnapshot().error).toBe('URL must be a github.com link')
  })

  it('validate accepts a GitHub URL', () => {
    const { job } = createJob()
    expect(job.validate('https://github.com/acme/widgets')).toBe(true)
    expect(job.getSnapshot().urlInvalid).toBe(false)
  })

  it('share builds origin hash deep-link with encoded url', () => {
    const { job } = createJob()
    expect(
      job.share('https://gitdown.xyz', 'https://github.com/a/b'),
    ).toBe(true)
    expect(job.getSnapshot().shareLink).toBe(
      'https://gitdown.xyz/#/home?url=https%3A%2F%2Fgithub.com%2Fa%2Fb',
    )
    expect(job.getSnapshot().shareLink.includes('minhaskamal.github.io')).toBe(
      false,
    )
  })

  it('share strips trailing slash from origin', () => {
    const { job } = createJob()
    job.share('https://gitdown.xyz/', 'https://github.com/a/b')
    expect(job.getSnapshot().shareLink).toBe(
      'https://gitdown.xyz/#/home?url=https%3A%2F%2Fgithub.com%2Fa%2Fb',
    )
  })

  it('share on invalid URL clears the share link', () => {
    const { job } = createJob()
    job.share('https://gitdown.xyz', 'https://github.com/a/b')
    expect(job.share('https://gitdown.xyz', '')).toBe(false)
    expect(job.getSnapshot().shareLink).toBe('')
    expect(job.getSnapshot().urlInvalid).toBe(true)
  })

  it('start on whole-repo URL navigates to the archive', async () => {
    const { job, save, navigate } = createJob(createHttp({}))
    await job.start({ url: 'https://github.com/acme/widgets/tree/main' })
    expect(navigate).toHaveBeenCalledWith(
      'https://github.com/acme/widgets/archive/main.zip',
    )
    expect(save).not.toHaveBeenCalled()
    expect(job.getSnapshot().isProcessing).toBe(false)
  })

  it('start on a file URL saves the zip', async () => {
    const body = new TextEncoder().encode('hello file')
    const http = createHttp({
      getJson: async () => ({
        status: 200,
        headers: new Headers(),
        data: {
          type: 'file',
          name: 'README.md',
          path: 'README.md',
          download_url:
            'https://raw.githubusercontent.com/acme/widgets/main/README.md',
        },
      }),
      getArrayBuffer: async () => ({
        status: 200,
        headers: new Headers(),
        data: body.buffer.slice(
          body.byteOffset,
          body.byteOffset + body.byteLength,
        ),
      }),
    })
    const { job, save, navigate } = createJob(http)
    await job.start({
      url: 'https://github.com/acme/widgets/blob/main/README.md',
    })
    expect(save).toHaveBeenCalledOnce()
    expect(save.mock.calls[0]?.[1]).toBe('README.md')
    expect(navigate).not.toHaveBeenCalled()
    expect(job.getSnapshot().isProcessing).toBe(false)
    expect(job.getSnapshot().progress).toBeNull()
  })

  it('start maps rate_limited into user-visible copy', async () => {
    const http = createHttp({
      getJson: async () => {
        const error: DownloadError = {
          kind: 'rate_limited',
          message: 'API limit',
        }
        throw error
      },
    })
    const { job, save } = createJob(http)
    await job.start({
      url: 'https://github.com/acme/widgets/blob/main/README.md',
    })
    expect(save).not.toHaveBeenCalled()
    const { error, isProcessing } = job.getSnapshot()
    expect(isProcessing).toBe(false)
    expect(error?.toLowerCase()).toContain('rate')
    expect(error?.toLowerCase()).toMatch(/token|personal access/)
  })

  it('cancel drops a stale in-flight start', async () => {
    let release: (value: {
      status: number
      headers: Headers
      data: unknown
    }) => void = () => {}
    let awaitingProbe: () => void = () => {}
    const probeStarted = new Promise<void>((resolve) => {
      awaitingProbe = resolve
    })
    const http = createHttp({
      getJson: () =>
        new Promise((resolve) => {
          release = resolve
          awaitingProbe()
        }),
    })
    const { job, save, navigate } = createJob(http)
    const pending = job.start({
      url: 'https://github.com/acme/widgets/blob/main/README.md',
    })
    await probeStarted
    expect(job.getSnapshot().isProcessing).toBe(true)
    job.cancel()
    expect(job.getSnapshot().isProcessing).toBe(false)
    release({
      status: 200,
      headers: new Headers(),
      data: {
        type: 'file',
        name: 'README.md',
        path: 'README.md',
        download_url:
          'https://raw.githubusercontent.com/acme/widgets/main/README.md',
      },
    })
    await pending
    expect(save).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
