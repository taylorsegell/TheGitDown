import {
  downloadGitHubPath as coreDownloadGitHubPath,
  type DownloadError,
  type GitHubHttp,
} from '@gitdown/core'
import type { downloadBlobZip, downloadRemoteUrl } from './chromeDownloads'
import { detectGithubUrl } from './detect'

export type DownloadJobState =
  | { status: 'idle' }
  | { status: 'running'; url: string; downloaded: number; total: number }
  | { status: 'done'; url: string; fileName: string }
  | { status: 'fail'; url: string; error: DownloadError }

export type DownloadJob = {
  start(url: string): { accepted: boolean; reason?: string }
  cancel(): { accepted: boolean }
  getState(): DownloadJobState
}

const INVALID_URL_ERROR: DownloadError = {
  kind: 'invalid_url',
  message: 'Invalid GitHub URL',
}

function archiveFileName(url: string): string {
  const segment = url.split('/').filter((part) => part.length > 0).at(-1)
  return segment ?? url
}

export function createDownloadJob(deps: {
  downloadGitHubPath: typeof coreDownloadGitHubPath
  http: GitHubHttp
  saveBlobZip: typeof downloadBlobZip
  saveRemoteUrl: typeof downloadRemoteUrl
  onState: (s: DownloadJobState) => void
}): DownloadJob {
  let state: DownloadJobState = { status: 'idle' }
  let runId = 0

  function setState(next: DownloadJobState): void {
    state = next
    deps.onState(next)
  }

  function start(url: string): { accepted: boolean; reason?: string } {
    if (state.status === 'running') {
      return { accepted: false, reason: 'busy' }
    }

    const detection = detectGithubUrl(url, 'tab')
    if (!detection.ok) {
      setState({ status: 'fail', url, error: INVALID_URL_ERROR })
      return { accepted: true }
    }

    const thisRun = ++runId
    setState({ status: 'running', url, downloaded: 0, total: 0 })
    void run(thisRun, url)
    return { accepted: true }
  }

  function cancel(): { accepted: boolean } {
    if (state.status !== 'running') {
      return { accepted: false }
    }
    runId += 1
    setState({ status: 'idle' })
    return { accepted: true }
  }

  async function run(thisRun: number, url: string): Promise<void> {
    try {
      for await (const event of deps.downloadGitHubPath(
        { url },
        { http: deps.http },
      )) {
        if (thisRun !== runId) {
          return
        }

        if (event.type === 'progress') {
          setState({
            status: 'running',
            url,
            downloaded: event.downloaded,
            total: event.total,
          })
        } else if (event.type === 'done') {
          await deps.saveBlobZip(event.blob, event.fileName)
          if (thisRun !== runId) {
            return
          }
          setState({ status: 'done', url, fileName: event.fileName })
          return
        } else if (event.type === 'redirect') {
          await deps.saveRemoteUrl(event.url)
          if (thisRun !== runId) {
            return
          }
          setState({
            status: 'done',
            url,
            fileName: archiveFileName(event.url),
          })
          return
        } else if (event.type === 'fail') {
          setState({ status: 'fail', url, error: event.error })
          return
        }
      }

      if (thisRun === runId && state.status === 'running') {
        setState({
          status: 'fail',
          url,
          error: {
            kind: 'unknown',
            message: 'Download ended without a result',
          },
        })
      }
    } catch (err) {
      if (thisRun !== runId) {
        return
      }
      const message =
        err instanceof Error ? err.message : 'Download failed unexpectedly'
      setState({
        status: 'fail',
        url,
        error: { kind: 'unknown', message },
      })
    }
  }

  return {
    start,
    cancel,
    getState: () => state,
  }
}
