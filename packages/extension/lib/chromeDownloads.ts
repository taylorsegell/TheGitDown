import {
  hasSavePort,
  saveBlobViaPort,
} from './savePort'
import { withZipExtension } from './zipFileName'

/** Options passed to `browser.downloads.download` / `chrome.downloads.download`. */
export type ChromeDownloadOptions = {
  url: string
  filename?: string
  conflictAction?: 'uniquify' | 'overwrite' | 'prompt'
  saveAs?: boolean
}

export type DownloadsApi = {
  download: (opts: ChromeDownloadOptions) => Promise<number> | void
  onDeterminingFilename?: {
    addListener: (
      listener: (
        item: { url: string },
        suggest: (suggestion: {
          filename: string
          conflictAction: 'uniquify'
        }) => void,
      ) => void,
    ) => void
  }
}

export type DownloadBlobZipDeps = {
  downloads: DownloadsApi
  createObjectURL?: (b: Blob) => string
  revokeObjectURL?: (u: string) => void
  blobToDataUrl?: (b: Blob) => Promise<string>
  saveViaPort?: (blob: Blob, fileName: string) => Promise<{ id: number }>
}

export type DownloadRemoteUrlDeps = {
  downloads: DownloadsApi
}

function resolveDownloads(deps?: { downloads: DownloadsApi }): DownloadsApi {
  if (deps?.downloads) {
    return deps.downloads
  }
  const g = globalThis as typeof globalThis & {
    browser?: { downloads?: DownloadsApi }
    chrome?: { downloads?: DownloadsApi }
  }
  const downloads = g.browser?.downloads ?? g.chrome?.downloads
  if (!downloads?.download) {
    throw new Error('browser.downloads is unavailable')
  }
  return downloads
}

async function invokeDownload(
  downloads: DownloadsApi,
  opts: ChromeDownloadOptions,
): Promise<number> {
  const id = await downloads.download(opts)
  if (typeof id !== 'number') {
    throw new Error('downloads.download did not return a download id')
  }
  return id
}

const fileNamesByUrl = new Map<string, string>()
const filenameListeners = new WeakSet<DownloadsApi>()

function suggestRememberedFileName(downloads: DownloadsApi): void {
  if (!downloads.onDeterminingFilename || filenameListeners.has(downloads)) {
    return
  }
  filenameListeners.add(downloads)
  downloads.onDeterminingFilename.addListener((item, suggest) => {
    const filename = fileNamesByUrl.get(item.url)
    if (!filename) {
      return
    }
    fileNamesByUrl.delete(item.url)
    suggest({ filename, conflictAction: 'uniquify' })
  })
}

function rememberFileName(
  downloads: DownloadsApi,
  url: string,
  filename: string,
): void {
  suggestRememberedFileName(downloads)
  if (!downloads.onDeterminingFilename) {
    return
  }
  fileNamesByUrl.set(url, filename)
  setTimeout(() => {
    fileNamesByUrl.delete(url)
  }, 30_000)
}

function canCreateObjectUrl(): boolean {
  return typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
}

/** MV3 service workers do not implement `URL.createObjectURL`. */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  const mime = blob.type || 'application/zip'
  return `data:${mime};base64,${btoa(binary)}`
}

async function defaultSaveViaPort(
  blob: Blob,
  fileName: string,
): Promise<{ id: number }> {
  if (!hasSavePort()) {
    throw new Error('no popup save port connected')
  }

  const id = await saveBlobViaPort(blob, fileName)
  return { id }
}

async function blobToDownloadUrl(
  blob: Blob,
  deps?: DownloadBlobZipDeps,
): Promise<{ url: string; revoke?: (u: string) => void }> {
  if (deps?.createObjectURL) {
    const revoke = deps.revokeObjectURL ?? (() => {})
    return { url: deps.createObjectURL(blob), revoke }
  }
  if (deps?.blobToDataUrl) {
    return { url: await deps.blobToDataUrl(blob) }
  }
  if (canCreateObjectUrl()) {
    return {
      url: URL.createObjectURL(blob),
      revoke: (u) => URL.revokeObjectURL(u),
    }
  }
  return { url: await blobToDataUrl(blob) }
}

/**
 * Save a Blob via `downloads.download`. Appends `.zip` when `fileName` lacks it.
 *
 * Service workers cannot create blob URLs, and Chrome ignores `filename` on
 * `data:` URLs. Popup-initiated jobs save through the confirmed popup port so
 * the zip keeps the folder name. Context-menu jobs retain the data-URL fallback.
 */
export async function downloadBlobZip(
  blob: Blob,
  fileName: string,
  deps?: DownloadBlobZipDeps,
): Promise<{ id: number }> {
  const filename = withZipExtension(fileName)
  const useDirectDownloadSeam = Boolean(deps?.createObjectURL)

  if (!useDirectDownloadSeam) {
    const saveViaPort = deps?.saveViaPort ?? defaultSaveViaPort
    try {
      return await saveViaPort(blob, filename)
    } catch {
      // Fall back so a download still completes if no host connected.
    }
  }

  const downloads = resolveDownloads(deps)
  const { url, revoke } = await blobToDownloadUrl(blob, deps)
  try {
    rememberFileName(downloads, url, filename)
    const id = await invokeDownload(downloads, {
      url,
      filename,
      conflictAction: 'uniquify',
    })
    return { id }
  } finally {
    if (revoke) {
      try {
        revoke(url)
      } catch {
        // best-effort
      }
    }
  }
}

/**
 * Enqueue a remote URL (e.g. GitHub archive zip) with `downloads.download`.
 * Does not fetch the body; the downloads API streams it.
 */
export async function downloadRemoteUrl(
  url: string,
  fileName?: string,
  deps?: DownloadRemoteUrlDeps,
): Promise<{ id: number }> {
  const downloads = resolveDownloads(deps)
  const opts: ChromeDownloadOptions = {
    url,
    conflictAction: 'uniquify',
  }
  if (fileName !== undefined && fileName !== '') {
    opts.filename = fileName
  }
  const id = await invokeDownload(downloads, opts)
  return { id }
}
