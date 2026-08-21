import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  downloadBlobZip,
  downloadRemoteUrl,
  type ChromeDownloadOptions,
  type DownloadsApi,
} from './chromeDownloads'
import { clearSavePortForTests, hasSavePort } from './savePort'

function mockDownloads(id = 1): DownloadsApi {
  const download = vi.fn(async (_opts: ChromeDownloadOptions) => id)
  return { download }
}

describe('downloadBlobZip', () => {
  afterEach(() => {
    clearSavePortForTests()
  })

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
    expect(downloads.download).toHaveBeenCalledWith({
      url: 'blob:gitdown-test',
      filename: 'images.zip',
      conflictAction: 'uniquify',
    })
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
  })

  it('saves through a connected popup/offscreen port with the folder filename', async () => {
    const downloads = mockDownloads()
    const blob = new Blob(['zip-bytes'])
    const saveViaPort = vi.fn(async () => ({ id: 99 }))

    const result = await downloadBlobZip(blob, 'docs', {
      downloads,
      saveViaPort,
    })

    expect(result).toEqual({ id: 99 })
    expect(saveViaPort).toHaveBeenCalledOnce()
    expect(saveViaPort).toHaveBeenCalledWith(
      blob,
      'docs.zip',
    )
    expect(downloads.download).not.toHaveBeenCalled()
    expect(hasSavePort()).toBe(false)
  })

  it('falls back to a data URL when no save port is connected', async () => {
    const downloads = mockDownloads()
    const blob = new Blob(['zip-bytes'], { type: 'application/zip' })
    const saveViaPort = vi.fn(async () => {
      throw new Error('no save port connected')
    })

    await downloadBlobZip(blob, 'docs', {
      downloads,
      saveViaPort,
      blobToDataUrl: async () => 'data:application/zip;base64,eA==',
    })

    expect(saveViaPort).toHaveBeenCalledOnce()
    expect(downloads.download).toHaveBeenCalledWith({
      url: 'data:application/zip;base64,eA==',
      filename: 'docs.zip',
      conflictAction: 'uniquify',
    })
  })

  it('suggests the requested filename when Chrome determines a data URL name', async () => {
    const downloads = mockDownloads()
    let filenameListener:
      | ((
          item: { url: string },
          suggest: (suggestion: {
            filename: string
            conflictAction: 'uniquify'
          }) => void,
        ) => void)
      | undefined
    downloads.onDeterminingFilename = {
      addListener: (listener) => {
        filenameListener = listener
      },
    }

    await downloadBlobZip(new Blob(['zip-bytes']), 'docs', {
      downloads,
      saveViaPort: async () => {
        throw new Error('no save port connected')
      },
      blobToDataUrl: async () => 'data:application/zip;base64,eA==',
    })

    const suggest = vi.fn()
    filenameListener?.({ url: 'data:application/zip;base64,eA==' }, suggest)
    expect(suggest).toHaveBeenCalledWith({
      filename: 'docs.zip',
      conflictAction: 'uniquify',
    })
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
    expect(downloads.download).toHaveBeenCalledWith({
      url: 'https://github.com/a/b/archive/main.zip',
      conflictAction: 'uniquify',
    })
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
