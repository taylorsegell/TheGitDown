import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  downloadBlobZip,
  downloadRemoteUrl,
  type ChromeDownloadOptions,
} from './chromeDownloads'

function mockDownloads(id = 1) {
  const download = vi.fn(async (_opts: ChromeDownloadOptions) => id)
  return { download }
}

describe('downloadBlobZip', () => {
  it("appends .zip when fileName is 'images'", async () => {
    const downloads = mockDownloads()
    const createObjectURL = vi.fn(() => 'blob:gitdown-test')
    const revokeObjectURL = vi.fn()
    const blob = new Blob(['zip-bytes'])

    const result = await downloadBlobZip(blob, 'images', {
      downloads,
      createObjectURL,
      revokeObjectURL,
    })

    expect(result).toEqual({ id: 1 })
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(downloads.download).toHaveBeenCalledOnce()
    expect(downloads.download).toHaveBeenCalledWith({
      url: 'blob:gitdown-test',
      filename: 'images.zip',
      conflictAction: 'uniquify',
    })
    expect(downloads.download.mock.calls[0][0].saveAs).not.toBe(true)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:gitdown-test')
  })

  it("does not turn 'images.zip' into images.zip.zip", async () => {
    const downloads = mockDownloads()
    const blob = new Blob(['zip-bytes'])

    await downloadBlobZip(blob, 'images.zip', {
      downloads,
      createObjectURL: () => 'blob:already-zip',
      revokeObjectURL: () => {},
    })

    expect(downloads.download).toHaveBeenCalledWith(
      expect.objectContaining({ filename: 'images.zip' }),
    )
    expect(downloads.download.mock.calls[0][0].filename).not.toBe(
      'images.zip.zip',
    )
  })
})

describe('downloadRemoteUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('passes the GitHub archive url through to downloads.download', async () => {
    const downloads = mockDownloads()
    const url = 'https://github.com/a/b/archive/main.zip'

    const result = await downloadRemoteUrl(url, undefined, { downloads })

    expect(result).toEqual({ id: 1 })
    expect(downloads.download).toHaveBeenCalledOnce()
    expect(downloads.download).toHaveBeenCalledWith({
      url: 'https://github.com/a/b/archive/main.zip',
      conflictAction: 'uniquify',
    })
    expect(downloads.download.mock.calls[0][0].saveAs).not.toBe(true)
  })

  it('does not fetch the archive body', async () => {
    const downloads = mockDownloads()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await downloadRemoteUrl('https://github.com/a/b/archive/main.zip', undefined, {
      downloads,
    })

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
