import { describe, expect, it, vi } from 'vitest'
import JSZip from 'jszip'
import { downloadGitHubPath } from './download'
import type { DownloadEvent, DownloadParams, GitHubHttp } from './types'

function textBuffer(text: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(text)
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
}

async function collectEvents(
  gen: AsyncGenerator<DownloadEvent>,
): Promise<DownloadEvent[]> {
  const events: DownloadEvent[] = []
  for await (const event of gen) {
    events.push(event)
  }
  return events
}

function createHttp(handlers: {
  getJson?: (url: string) => Promise<{ status: number; headers: Headers; data: unknown }>
  getArrayBuffer?: (
    url: string,
  ) => Promise<{ status: number; headers: Headers; data: ArrayBuffer }>
}): GitHubHttp {
  return {
    getJson: (handlers.getJson ??
      (async () => {
        throw new Error(`unexpected getJson`)
      })) as GitHubHttp['getJson'],
    getArrayBuffer: (handlers.getArrayBuffer ??
      (async () => {
        throw new Error(`unexpected getArrayBuffer`)
      })) as GitHubHttp['getArrayBuffer'],
  }
}

describe('downloadGitHubPath', () => {
  it('1. invalid URL → first event fail/invalid_url', async () => {
    const http = createHttp({})
    const events = await collectEvents(
      downloadGitHubPath({ url: 'https://example.com/not-github' }, { http }),
    )

    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      type: 'fail',
      error: expect.objectContaining({ kind: 'invalid_url' }),
    })
  })

  it('2. whole repo + resolved ref → redirect to archive URL', async () => {
    const getJson = vi.fn(async (url: string) => {
      expect(url).toBe('https://api.github.com/repos/acme/widgets')
      return {
        status: 200,
        headers: new Headers(),
        data: { default_branch: 'develop' },
      }
    })
    const http = createHttp({ getJson })

    const events = await collectEvents(
      downloadGitHubPath({ url: 'https://github.com/acme/widgets' }, { http }),
    )

    expect(events).toEqual([
      {
        type: 'redirect',
        url: 'https://github.com/acme/widgets/archive/develop.zip',
      },
    ])
    expect(getJson).toHaveBeenCalledOnce()
  })

  it('2b. whole repo with explicit branch → redirect without Repos API', async () => {
    const getJson = vi.fn(async () => {
      throw new Error('getJson should not be called')
    })
    const http = createHttp({ getJson })

    const events = await collectEvents(
      downloadGitHubPath(
        { url: 'https://github.com/acme/widgets/tree/main' },
        { http },
      ),
    )

    expect(events).toEqual([
      {
        type: 'redirect',
        url: 'https://github.com/acme/widgets/archive/main.zip',
      },
    ])
    expect(getJson).not.toHaveBeenCalled()
  })

  it('3. single file → progress then done; zip contains one entry', async () => {
    const fileBody = textBuffer('hello file')
    const getJson = vi.fn(async (url: string) => {
      expect(url).toContain('/contents/README.md')
      expect(url).toContain('ref=main')
      return {
        status: 200,
        headers: new Headers(),
        data: {
          type: 'file',
          name: 'README.md',
          path: 'README.md',
          download_url:
            'https://raw.githubusercontent.com/acme/widgets/main/README.md',
        },
      }
    })
    const getArrayBuffer = vi.fn(async (url: string) => {
      expect(url).toBe(
        'https://raw.githubusercontent.com/acme/widgets/main/README.md',
      )
      return { status: 200, headers: new Headers(), data: fileBody }
    })
    const http = createHttp({ getJson, getArrayBuffer })

    const events = await collectEvents(
      downloadGitHubPath(
        { url: 'https://github.com/acme/widgets/blob/main/README.md' },
        { http },
      ),
    )

    const types = events.map((e) => e.type)
    expect(types[0]).toBe('progress')
    expect(types.at(-1)).toBe('done')
    expect(types).not.toContain('fail')

    const progressEvents = events.filter((e) => e.type === 'progress')
    expect(progressEvents.length).toBeGreaterThanOrEqual(1)
    expect(progressEvents.some((e) => e.type === 'progress' && e.downloaded === 1)).toBe(
      true,
    )

    const done = events.find((e) => e.type === 'done')
    expect(done).toBeDefined()
    if (done?.type !== 'done') throw new Error('expected done')
    expect(done.fileName).toBe('README.md')

    const zip = await JSZip.loadAsync(done.blob)
    const names = Object.keys(zip.files).filter((n) => !zip.files[n]!.dir)
    expect(names).toEqual(['README.md'])
    expect(await zip.file('README.md')!.async('string')).toBe('hello file')
  })

  it('4. directory → files under rootDirectoryPrefix', async () => {
    const getJson = vi.fn(async (url: string) => {
      if (url.includes('/contents/src/lib?') || url.includes('/contents/src/lib&')) {
        return {
          status: 200,
          headers: new Headers(),
          data: [
            {
              type: 'file',
              name: 'a.ts',
              path: 'src/lib/a.ts',
              download_url: 'https://raw.githubusercontent.com/acme/widgets/main/src/lib/a.ts',
            },
            {
              type: 'dir',
              name: 'nested',
              path: 'src/lib/nested',
              download_url: null,
            },
          ],
        }
      }
      if (url.includes('/contents/src/lib/nested')) {
        return {
          status: 200,
          headers: new Headers(),
          data: [
            {
              type: 'file',
              name: 'b.ts',
              path: 'src/lib/nested/b.ts',
              download_url:
                'https://raw.githubusercontent.com/acme/widgets/main/src/lib/nested/b.ts',
            },
          ],
        }
      }
      throw { kind: 'not_found', message: `unexpected url ${url}` }
    })

    const getArrayBuffer = vi.fn(async (url: string) => {
      if (url.endsWith('/a.ts')) {
        return { status: 200, headers: new Headers(), data: textBuffer('A') }
      }
      if (url.endsWith('/b.ts')) {
        return { status: 200, headers: new Headers(), data: textBuffer('B') }
      }
      throw { kind: 'not_found', message: `unexpected blob ${url}` }
    })

    const http = createHttp({ getJson, getArrayBuffer })
    const params: DownloadParams = {
      url: 'https://github.com/acme/widgets/tree/main/src/lib',
      // default rootDirectory → prefix "lib/"
    }

    const events = await collectEvents(downloadGitHubPath(params, { http }))

    const done = events.find((e) => e.type === 'done')
    expect(done).toBeDefined()
    if (done?.type !== 'done') throw new Error('expected done')
    expect(done.fileName).toBe('lib')

    const zip = await JSZip.loadAsync(done.blob)
    const names = Object.keys(zip.files)
      .filter((n) => !zip.files[n]!.dir)
      .sort()
    expect(names).toEqual(['lib/a.ts', 'lib/nested/b.ts'])
    expect(await zip.file('lib/a.ts')!.async('string')).toBe('A')
    expect(await zip.file('lib/nested/b.ts')!.async('string')).toBe('B')
  })

  it('4b. directory with rootDirectory=false → no prefix', async () => {
    const getJson = vi.fn(async () => ({
      status: 200,
      headers: new Headers(),
      data: [
        {
          type: 'file',
          name: 'only.txt',
          path: 'docs/only.txt',
          download_url: 'https://raw.githubusercontent.com/acme/widgets/main/docs/only.txt',
        },
      ],
    }))
    const getArrayBuffer = vi.fn(async () => ({
      status: 200,
      headers: new Headers(),
      data: textBuffer('doc'),
    }))
    const http = createHttp({ getJson, getArrayBuffer })

    const events = await collectEvents(
      downloadGitHubPath(
        {
          url: 'https://github.com/acme/widgets/tree/main/docs',
          rootDirectory: 'false',
        },
        { http },
      ),
    )

    const done = events.find((e) => e.type === 'done')
    expect(done?.type).toBe('done')
    if (done?.type !== 'done') throw new Error('expected done')
    const zip = await JSZip.loadAsync(done.blob)
    const names = Object.keys(zip.files).filter((n) => !zip.files[n]!.dir)
    expect(names).toEqual(['only.txt'])
  })

  it('5. rate limit during walk → fail/rate_limited; no done', async () => {
    const rateLimited = {
      kind: 'rate_limited' as const,
      message: 'API rate limit exceeded',
      resetAt: 1700000000 * 1000,
    }

    const getJson = vi.fn(async (url: string) => {
      if (url.includes('/contents/src?') || /\/contents\/src&/.test(url)) {
        return {
          status: 200,
          headers: new Headers(),
          data: [
            {
              type: 'file',
              name: 'ok.ts',
              path: 'src/ok.ts',
              download_url: 'https://raw.githubusercontent.com/acme/widgets/main/src/ok.ts',
            },
            {
              type: 'dir',
              name: 'deep',
              path: 'src/deep',
              download_url: null,
            },
          ],
        }
      }
      if (url.includes('/contents/src/deep')) {
        throw rateLimited
      }
      throw { kind: 'unknown', message: `unexpected ${url}` }
    })

    const http = createHttp({
      getJson,
      getArrayBuffer: async () => {
        throw new Error('blobs should not be fetched after rate limit during walk')
      },
    })

    const events = await collectEvents(
      downloadGitHubPath(
        { url: 'https://github.com/acme/widgets/tree/main/src' },
        { http },
      ),
    )

    expect(events.some((e) => e.type === 'done')).toBe(false)
    const fail = events.find((e) => e.type === 'fail')
    expect(fail).toEqual({
      type: 'fail',
      error: expect.objectContaining({ kind: 'rate_limited' }),
    })
  })

  it('6. one blob failure among many → fail/partial; no done', async () => {
    const getJson = vi.fn(async () => ({
      status: 200,
      headers: new Headers(),
      data: [
        {
          type: 'file',
          name: 'good.txt',
          path: 'pkg/good.txt',
          download_url: 'https://raw.githubusercontent.com/acme/widgets/main/pkg/good.txt',
        },
        {
          type: 'file',
          name: 'bad.txt',
          path: 'pkg/bad.txt',
          download_url: 'https://raw.githubusercontent.com/acme/widgets/main/pkg/bad.txt',
        },
      ],
    }))

    const getArrayBuffer = vi.fn(async (url: string) => {
      if (url.endsWith('/good.txt')) {
        return { status: 200, headers: new Headers(), data: textBuffer('ok') }
      }
      throw { kind: 'network', message: 'Failed to fetch bad.txt' }
    })

    const http = createHttp({ getJson, getArrayBuffer })
    const events = await collectEvents(
      downloadGitHubPath(
        { url: 'https://github.com/acme/widgets/tree/main/pkg' },
        { http },
      ),
    )

    expect(events.some((e) => e.type === 'done')).toBe(false)
    const fail = events.find((e) => e.type === 'fail')
    expect(fail).toEqual({
      type: 'fail',
      error: {
        kind: 'partial',
        message: expect.any(String),
        missingPaths: ['pkg/bad.txt'],
      },
    })
  })

  it('fetches files in a small directory concurrently', async () => {
    const getJson = vi.fn(async () => ({
      status: 200,
      headers: new Headers(),
      data: ['one.txt', 'two.txt', 'three.txt'].map((name) => ({
        type: 'file',
        name,
        path: `pkg/${name}`,
        download_url: `https://raw.githubusercontent.com/acme/widgets/main/pkg/${name}`,
      })),
    }))
    const resolvers: Array<() => void> = []
    const getArrayBuffer = vi.fn(
      () => new Promise<{ status: number; headers: Headers; data: ArrayBuffer }>((resolve) => {
        resolvers.push(() => {
          resolve({ status: 200, headers: new Headers(), data: textBuffer('ok') })
        })
      }),
    )
    const iterator = downloadGitHubPath(
      { url: 'https://github.com/acme/widgets/tree/main/pkg' },
      { http: createHttp({ getJson, getArrayBuffer }) },
    )

    await iterator.next() // initial 0 / 3 progress event
    const nextEvent = iterator.next()
    await vi.waitFor(() => {
      expect(getArrayBuffer).toHaveBeenCalledTimes(3)
    })

    for (const resolve of resolvers) {
      resolve()
    }
    await nextEvent
    await collectEvents(iterator)
  })

  it('large-file fallback: Contents not_found → raw.githubusercontent.com once', async () => {
    const getJson = vi.fn(async () => {
      throw { kind: 'not_found', message: 'Not Found' }
    })
    const getArrayBuffer = vi.fn(async (url: string) => {
      expect(url).toBe(
        'https://raw.githubusercontent.com/acme/widgets/main/big/bin.dat',
      )
      return { status: 200, headers: new Headers(), data: textBuffer('RAW') }
    })
    const http = createHttp({ getJson, getArrayBuffer })

    const events = await collectEvents(
      downloadGitHubPath(
        { url: 'https://github.com/acme/widgets/blob/main/big/bin.dat' },
        { http },
      ),
    )

    expect(events.some((e) => e.type === 'done')).toBe(true)
    const done = events.find((e) => e.type === 'done')
    if (done?.type !== 'done') throw new Error('expected done')
    const zip = await JSZip.loadAsync(done.blob)
    expect(await zip.file('bin.dat')!.async('string')).toBe('RAW')
    expect(getArrayBuffer).toHaveBeenCalledOnce()
  })

  it('uses injectable zipGenerate when provided', async () => {
    const getJson = vi.fn(async () => ({
      status: 200,
      headers: new Headers(),
      data: {
        type: 'file',
        name: 'f.txt',
        path: 'f.txt',
        download_url: 'https://raw.githubusercontent.com/acme/widgets/main/f.txt',
      },
    }))
    const getArrayBuffer = vi.fn(async () => ({
      status: 200,
      headers: new Headers(),
      data: textBuffer('x'),
    }))
    const customBlob = new Blob(['custom-zip'])
    const zipGenerate = vi.fn(async () => customBlob)
    const http = createHttp({ getJson, getArrayBuffer })

    const events = await collectEvents(
      downloadGitHubPath(
        { url: 'https://github.com/acme/widgets/blob/main/f.txt' },
        { http, zipGenerate },
      ),
    )

    const done = events.find((e) => e.type === 'done')
    expect(zipGenerate).toHaveBeenCalledOnce()
    expect(done).toMatchObject({ type: 'done', fileName: 'f.txt' })
    if (done?.type === 'done') {
      expect(done.blob).toBe(customBlob)
    }
  })
})
