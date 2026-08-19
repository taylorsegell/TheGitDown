import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DownloadEvent, GitHubHttp } from '@gitdown/core'
import { describe, expect, it, vi } from 'vitest'
import { createDownloadJob, type DownloadJob, type DownloadJobState } from './downloadJob'

const IMAGES_URL = 'https://github.com/a/b/tree/main/images'
const REPO_URL = 'https://github.com/a/b'
const ARCHIVE_URL = 'https://github.com/a/b/archive/main.zip'

const http: GitHubHttp = {
  getJson: async () => {
    throw new Error('http should not be used by mocked downloadGitHubPath')
  },
  getArrayBuffer: async () => {
    throw new Error('http should not be used by mocked downloadGitHubPath')
  },
}

function createJob(options: {
  events: DownloadEvent[] | (() => AsyncGenerator<DownloadEvent>)
  onState?: (s: DownloadJobState) => void
  saveBlobZip?: ReturnType<typeof vi.fn>
  saveRemoteUrl?: ReturnType<typeof vi.fn>
}) {
  const saveBlobZip =
    options.saveBlobZip ?? vi.fn(async () => ({ id: 1 }))
  const saveRemoteUrl =
    options.saveRemoteUrl ?? vi.fn(async () => ({ id: 2 }))
  const downloadGitHubPath = vi.fn((async function* () {
    if (typeof options.events === 'function') {
      yield* options.events()
      return
    }
    for (const event of options.events) {
      yield event
    }
  }) as typeof import('@gitdown/core').downloadGitHubPath)

  const job = createDownloadJob({
    downloadGitHubPath,
    http,
    saveBlobZip: saveBlobZip as typeof import('./chromeDownloads').downloadBlobZip,
    saveRemoteUrl: saveRemoteUrl as typeof import('./chromeDownloads').downloadRemoteUrl,
    onState: options.onState ?? (() => {}),
  })

  return { job, downloadGitHubPath, saveBlobZip, saveRemoteUrl }
}

async function waitUntil(
  job: DownloadJob,
  predicate: (s: DownloadJobState) => boolean,
): Promise<DownloadJobState> {
  for (let i = 0; i < 100; i++) {
    const state = job.getState()
    if (predicate(state)) {
      return state
    }
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
  throw new Error(`job did not settle: ${JSON.stringify(job.getState())}`)
}

function collectExtensionSources(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    if (
      name === 'node_modules' ||
      name === '.output' ||
      name === '.wxt' ||
      name === 'dist'
    ) {
      continue
    }
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      out.push(...collectExtensionSources(path))
    } else if (
      /\.(ts|tsx|js|json|html|css)$/.test(name) &&
      !/\.test\.(ts|tsx)$/.test(name)
    ) {
      out.push(path)
    }
  }
  return out
}

describe('createDownloadJob', () => {
  it('1. progress then done saves the zip and settles done', async () => {
    const blob = new Blob(['zip-bytes'])
    const { job, saveBlobZip, saveRemoteUrl } = createJob({
      events: [
        { type: 'progress', downloaded: 2, total: 4 },
        { type: 'done', blob, fileName: 'images' },
      ],
    })

    expect(job.start(IMAGES_URL)).toEqual({ accepted: true })
    const state = await waitUntil(job, (s) => s.status === 'done')

    expect(state).toEqual({
      status: 'done',
      url: IMAGES_URL,
      fileName: 'images',
    })
    expect(saveBlobZip).toHaveBeenCalledOnce()
    expect(saveBlobZip).toHaveBeenCalledWith(blob, 'images')
    expect(saveRemoteUrl).not.toHaveBeenCalled()
  })

  it('2. redirect saves the archive URL and does not use tabs.update', async () => {
    const { job, saveBlobZip, saveRemoteUrl } = createJob({
      events: [{ type: 'redirect', url: ARCHIVE_URL }],
    })

    expect(job.start(REPO_URL)).toEqual({ accepted: true })
    await waitUntil(job, (s) => s.status === 'done')

    expect(saveRemoteUrl).toHaveBeenCalledOnce()
    expect(saveRemoteUrl).toHaveBeenCalledWith(ARCHIVE_URL)
    expect(saveBlobZip).not.toHaveBeenCalled()

    const here = dirname(fileURLToPath(import.meta.url))
    const downloadJobSource = readFileSync(join(here, 'downloadJob.ts'), 'utf8')
    const backgroundSource = readFileSync(
      join(here, '../entrypoints/background.ts'),
      'utf8',
    )
    expect(downloadJobSource).not.toContain('tabs.update')
    expect(downloadJobSource).not.toContain('tabs.create')
    expect(backgroundSource).not.toContain('tabs.update')
    expect(backgroundSource).not.toContain('tabs.create')
  })

  it('3. rate_limited fail does not save', async () => {
    const { job, saveBlobZip, saveRemoteUrl } = createJob({
      events: [
        {
          type: 'fail',
          error: { kind: 'rate_limited', message: 'rate limited' },
        },
      ],
    })

    expect(job.start(IMAGES_URL)).toEqual({ accepted: true })
    const state = await waitUntil(job, (s) => s.status === 'fail')

    expect(state).toEqual({
      status: 'fail',
      url: IMAGES_URL,
      error: { kind: 'rate_limited', message: 'rate limited' },
    })
    expect(saveBlobZip).not.toHaveBeenCalled()
    expect(saveRemoteUrl).not.toHaveBeenCalled()
  })

  it('4. start while running is busy', async () => {
    let resume!: () => void
    const gate = new Promise<void>((resolve) => {
      resume = resolve
    })
    const blob = new Blob(['zip-bytes'])

    const { job, saveBlobZip } = createJob({
      events: async function* () {
        yield { type: 'progress', downloaded: 0, total: 1 }
        await gate
        yield { type: 'done', blob, fileName: 'images' }
      },
    })

    expect(job.start(IMAGES_URL)).toEqual({ accepted: true })
    expect(job.getState().status).toBe('running')
    expect(job.start(REPO_URL)).toEqual({ accepted: false, reason: 'busy' })

    resume()
    await waitUntil(job, (s) => s.status === 'done')
    expect(saveBlobZip).toHaveBeenCalledOnce()
  })

  it('5. dropping onState listeners still saves when the generator completes', async () => {
    const blob = new Blob(['zip-bytes'])
    let resume!: () => void
    const gate = new Promise<void>((resolve) => {
      resume = resolve
    })
    const listeners = new Set<(s: DownloadJobState) => void>()
    const saveBlobZip = vi.fn(async () => ({ id: 1 }))
    const saveRemoteUrl = vi.fn(async () => ({ id: 2 }))

    const { job } = createJob({
      events: async function* () {
        yield { type: 'progress', downloaded: 1, total: 1 }
        await gate
        yield { type: 'done', blob, fileName: 'images' }
      },
      saveBlobZip,
      saveRemoteUrl,
      onState: (s) => {
        for (const listener of listeners) {
          listener(s)
        }
      },
    })

    listeners.add(vi.fn())
    expect(job.start(IMAGES_URL)).toEqual({ accepted: true })
    listeners.clear()
    resume()

    await waitUntil(job, (s) => s.status === 'done')
    expect(saveBlobZip).toHaveBeenCalledOnce()
    expect(saveBlobZip).toHaveBeenCalledWith(blob, 'images')
    expect(saveRemoteUrl).not.toHaveBeenCalled()
  })

  it('6. example.com fails invalid_url without calling the generator', async () => {
    const { job, downloadGitHubPath, saveBlobZip, saveRemoteUrl } = createJob({
      events: [],
    })

    expect(job.start('https://example.com')).toEqual({ accepted: true })
    expect(job.getState()).toEqual({
      status: 'fail',
      url: 'https://example.com',
      error: { kind: 'invalid_url', message: 'Invalid GitHub URL' },
    })
    expect(downloadGitHubPath).not.toHaveBeenCalled()
    expect(saveBlobZip).not.toHaveBeenCalled()
    expect(saveRemoteUrl).not.toHaveBeenCalled()
  })

  it('7. extension sources do not import file-saver or FileSaver', () => {
    const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
    const sources = collectExtensionSources(extensionRoot)
    expect(sources.length).toBeGreaterThan(0)
    for (const path of sources) {
      const text = readFileSync(path, 'utf8')
      expect(text, path).not.toMatch(/file-saver/)
      expect(text, path).not.toMatch(/FileSaver/)
    }
  })
})
