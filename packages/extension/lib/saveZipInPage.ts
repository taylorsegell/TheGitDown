import { withZipExtension } from './zipFileName'

type DownloadsApi = {
  download: (opts: {
    url: string
    filename?: string
    conflictAction?: 'uniquify' | 'overwrite' | 'prompt'
    saveAs?: boolean
  }) => Promise<number> | number
}

function resolveDownloads(): DownloadsApi {
  const g = globalThis as typeof globalThis & {
    chrome?: { downloads?: DownloadsApi }
    browser?: { downloads?: DownloadsApi }
  }
  const downloads = g.chrome?.downloads ?? g.browser?.downloads
  if (!downloads?.download) {
    throw new Error('downloads API unavailable')
  }
  return downloads
}

/** Save a zip from a page context that supports blob URLs (popup / offscreen). */
export async function saveZipBlobInPage(
  blob: Blob,
  fileName: string,
): Promise<number> {
  const filename = withZipExtension(fileName)
  const url = URL.createObjectURL(blob)
  try {
    const id = await resolveDownloads().download({
      url,
      filename,
      conflictAction: 'uniquify',
      saveAs: false,
    })
    if (typeof id !== 'number') {
      throw new Error('downloads.download did not return a download id')
    }
    return id
  } finally {
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 60_000)
  }
}
