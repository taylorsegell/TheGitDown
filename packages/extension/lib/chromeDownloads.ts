/** Options passed to `browser.downloads.download` / `chrome.downloads.download`. */
export type ChromeDownloadOptions = {
  url: string
  filename?: string
  conflictAction?: 'uniquify' | 'overwrite' | 'prompt'
  saveAs?: boolean
}

export type DownloadsApi = {
  download: (opts: ChromeDownloadOptions) => Promise<number> | void
}

export type DownloadBlobZipDeps = {
  downloads: DownloadsApi
  createObjectURL?: (b: Blob) => string
  revokeObjectURL?: (u: string) => void
}

export type DownloadRemoteUrlDeps = {
  downloads: DownloadsApi
}

function withZipExtension(fileName: string): string {
  return fileName.toLowerCase().endsWith('.zip') ? fileName : `${fileName}.zip`
}

/**
 * WXT / webextension-polyfill expose `browser`; Chrome also has `chrome`.
 * Prefer `browser` so Firefox MV3 gets the same promise API.
 */
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

/**
 * Save a Blob via `downloads.download`. Appends `.zip` when `fileName` lacks it.
 * MV3-safe: create object URL, start the download, revoke (best-effort).
 */
export async function downloadBlobZip(
  blob: Blob,
  fileName: string,
  deps?: DownloadBlobZipDeps,
): Promise<{ id: number }> {
  const downloads = resolveDownloads(deps)
  const createObjectURL =
    deps?.createObjectURL ?? ((b: Blob) => URL.createObjectURL(b))
  const revokeObjectURL =
    deps?.revokeObjectURL ?? ((u: string) => URL.revokeObjectURL(u))

  const url = createObjectURL(blob)
  try {
    const id = await invokeDownload(downloads, {
      url,
      filename: withZipExtension(fileName),
      conflictAction: 'uniquify',
    })
    return { id }
  } finally {
    try {
      revokeObjectURL(url)
    } catch {
      // best-effort: download may already have taken the URL
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
