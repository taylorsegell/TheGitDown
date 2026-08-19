import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DownloadJob } from './downloadJob'
import {
  GITDOWN_LINK_MENU_ID,
  GITDOWN_PAGE_MENU_ID,
  registerContextMenus,
  startDownload,
  type ContextMenusApi,
  type MenuClickInfo,
  type MenuTab,
} from './menu'
import { resetExtensionJobsForTests, setProductionDownloadJobForTests } from './messages'

function mockContextMenus() {
  const create = vi.fn()
  const listeners: Array<(info: MenuClickInfo, tab?: MenuTab) => void> = []
  const addListener = vi.fn(
    (callback: (info: MenuClickInfo, tab?: MenuTab) => void) => {
      listeners.push(callback)
    },
  )

  const contextMenus: ContextMenusApi = {
    create,
    onClicked: { addListener },
  }

  return {
    contextMenus,
    create,
    click(info: MenuClickInfo, tab?: MenuTab) {
      for (const listener of listeners) {
        listener(info, tab)
      }
    },
  }
}

function createCallById(
  create: ReturnType<typeof vi.fn>,
  id: string,
) {
  const call = create.mock.calls.find(
    (args) => (args[0] as { id?: string })?.id === id,
  )
  expect(call, `expected contextMenus.create for id ${id}`).toBeTruthy()
  return call![0] as {
    id: string
    title: string
    contexts: string[]
    documentUrlPatterns?: string[]
    targetUrlPatterns?: string[]
  }
}

describe('registerContextMenus', () => {
  it('creates a page item titled Download with GitDown', () => {
    const { contextMenus, create } = mockContextMenus()
    registerContextMenus({ contextMenus, startDownload: vi.fn() })

    const pageItem = createCallById(create, 'gitdown-download-page')
    expect(pageItem.id).toBe('gitdown-download-page')
    expect(pageItem.title).toMatch(/Download with GitDown/)
    expect(pageItem.contexts).toEqual(['page'])
    expect(pageItem.documentUrlPatterns).toEqual([
      'https://github.com/*',
      'https://www.github.com/*',
    ])
  })

  it('creates a link item with github targetUrlPatterns', () => {
    const { contextMenus, create } = mockContextMenus()
    registerContextMenus({ contextMenus, startDownload: vi.fn() })

    const linkItem = createCallById(create, 'gitdown-download-link')
    expect(linkItem.contexts).toContain('link')
    expect(linkItem.targetUrlPatterns).toEqual(
      expect.arrayContaining(['https://github.com/*']),
    )
    expect(linkItem.targetUrlPatterns).toEqual(
      expect.arrayContaining(['https://www.github.com/*']),
    )
  })

  it('starts download from a GitHub tree linkUrl', () => {
    const { contextMenus, click } = mockContextMenus()
    const startDownloadSpy = vi.fn()
    registerContextMenus({ contextMenus, startDownload: startDownloadSpy })

    const url = 'https://github.com/a/b/tree/main/src'
    click({ menuItemId: GITDOWN_LINK_MENU_ID, linkUrl: url })

    expect(startDownloadSpy).toHaveBeenCalledTimes(1)
    expect(startDownloadSpy).toHaveBeenCalledWith(url)
  })

  it('starts download from a GitHub pageUrl', () => {
    const { contextMenus, click } = mockContextMenus()
    const startDownloadSpy = vi.fn()
    registerContextMenus({ contextMenus, startDownload: startDownloadSpy })

    const url = 'https://github.com/a/b'
    click({ menuItemId: GITDOWN_PAGE_MENU_ID, pageUrl: url })

    expect(startDownloadSpy).toHaveBeenCalledTimes(1)
    expect(startDownloadSpy).toHaveBeenCalledWith(url)
  })

  it('does not start download for an example.com linkUrl', () => {
    const { contextMenus, click } = mockContextMenus()
    const startDownloadSpy = vi.fn()
    registerContextMenus({ contextMenus, startDownload: startDownloadSpy })

    click({
      menuItemId: GITDOWN_LINK_MENU_ID,
      linkUrl: 'https://example.com',
    })

    expect(startDownloadSpy).not.toHaveBeenCalled()
  })
})

describe('startDownload', () => {
  afterEach(() => {
    resetExtensionJobsForTests()
  })

  it('sends START_DOWNLOAD through handleExtRequest', async () => {
    const job: DownloadJob = {
      start: vi.fn(() => ({ accepted: true })),
      cancel: vi.fn(() => ({ accepted: false })),
      getState: vi.fn(() => ({ status: 'idle' })),
    }
    setProductionDownloadJobForTests(job)

    await expect(startDownload('https://github.com/a/b')).resolves.toEqual({
      accepted: true,
    })
    expect(job.start).toHaveBeenCalledWith('https://github.com/a/b')
  })
})
