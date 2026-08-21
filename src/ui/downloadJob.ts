import {
  downloadGitHubPath,
  mapDownloadErrorMessage,
  parseGitHubUrl,
} from '@gitdown/core'
import type { DownloadParams, GitHubHttp } from '@gitdown/core'

export type DownloadJobProgress = { downloaded: number; total: number }

export type DownloadJobState = {
  error: string | null
  urlInvalid: boolean
  progress: DownloadJobProgress | null
  isProcessing: boolean
  shareLink: string
}

export type DownloadJob = {
  getSnapshot: () => DownloadJobState
  subscribe: (listener: () => void) => () => void
  validate: (url: string) => boolean
  start: (params: DownloadParams) => Promise<void>
  share: (origin: string, url: string) => boolean
  cancel: () => void
}

export type DownloadJobDeps = {
  http: GitHubHttp
  save: (blob: Blob, fileName: string) => void
  navigate: (url: string) => void
}

const EMPTY_URL_ERROR = 'Enter a GitHub file or directory URL'

const initialState: DownloadJobState = {
  error: null,
  urlInvalid: false,
  progress: null,
  isProcessing: false,
  shareLink: '',
}

/** Hash query → DownloadParams. Page owns the router; this is the mapping. */
export function paramsFromQuery(
  url: string,
  fileName: string | null,
  rootDirectory: string | null,
): DownloadParams {
  const params: DownloadParams = { url }
  if (fileName != null && fileName !== '') {
    params.fileName = fileName
  }
  if (rootDirectory != null && rootDirectory !== '') {
    params.rootDirectory = rootDirectory
  }
  return params
}

function buildShareLink(origin: string, githubUrl: string): string {
  const base = origin.replace(/\/$/, '')
  return `${base}/#/home?url=${encodeURIComponent(githubUrl)}`
}

/**
 * Download job: zip download and shareable deep link for one GitHub URL.
 * Holds job state. GitHub HTTP, save, and navigate sit behind injected adapters.
 */
export function createDownloadJob(deps: DownloadJobDeps): DownloadJob {
  let state: DownloadJobState = initialState
  let runId = 0
  const listeners = new Set<() => void>()

  function emit(next: DownloadJobState): void {
    state = next
    listeners.forEach((listener) => {
      listener()
    })
  }

  function patch(partial: Partial<DownloadJobState>): void {
    emit({ ...state, ...partial })
  }

  function rejectUrl(url: string, clearShare: boolean): boolean {
    const trimmed = url.trim()
    if (trimmed === '') {
      patch({
        error: EMPTY_URL_ERROR,
        urlInvalid: true,
        ...(clearShare ? { shareLink: '' } : {}),
      })
      return true
    }

    const parsed = parseGitHubUrl(trimmed)
    if ('ok' in parsed && parsed.ok === false) {
      patch({
        error: mapDownloadErrorMessage(parsed.error),
        urlInvalid: true,
        ...(clearShare ? { shareLink: '' } : {}),
      })
      return true
    }

    return false
  }

  function validate(url: string): boolean {
    if (rejectUrl(url, false)) {
      return false
    }
    patch({ urlInvalid: false })
    return true
  }

  function share(origin: string, url: string): boolean {
    if (rejectUrl(url, true)) {
      return false
    }
    patch({
      urlInvalid: false,
      error: null,
      shareLink: buildShareLink(origin, url.trim()),
    })
    return true
  }

  function cancel(): void {
    runId += 1
    if (state.isProcessing) {
      patch({ isProcessing: false, progress: null })
    }
  }

  async function start(params: DownloadParams): Promise<void> {
    const url = params.url.trim()
    if (rejectUrl(url, false)) {
      return
    }

    const thisRun = ++runId
    emit({
      error: null,
      urlInvalid: false,
      shareLink: '',
      progress: null,
      isProcessing: true,
    })

    try {
      for await (const event of downloadGitHubPath(
        { ...params, url },
        { http: deps.http },
      )) {
        if (thisRun !== runId) {
          return
        }

        if (event.type === 'progress') {
          patch({
            progress: {
              downloaded: event.downloaded,
              total: event.total,
            },
          })
        } else if (event.type === 'redirect') {
          patch({ isProcessing: false, progress: null })
          deps.navigate(event.url)
          return
        } else if (event.type === 'done') {
          deps.save(event.blob, event.fileName)
          patch({ isProcessing: false, progress: null })
          return
        } else if (event.type === 'fail') {
          patch({
            error: mapDownloadErrorMessage(event.error),
            isProcessing: false,
            progress: null,
          })
          return
        }
      }
    } catch (err) {
      if (thisRun !== runId) {
        return
      }
      const message =
        err instanceof Error ? err.message : 'Download failed unexpectedly'
      patch({ error: message, isProcessing: false, progress: null })
    }
  }

  return {
    getSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    validate,
    start,
    share,
    cancel,
  }
}
