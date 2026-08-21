import { detectGithubUrl } from './detect'
import { handleExtRequest } from './messages'

export const GITDOWN_PAGE_MENU_ID = 'gitdown-download-page'
export const GITDOWN_LINK_MENU_ID = 'gitdown-download-link'
export const GITDOWN_MENU_TITLE = 'Download with GitDown'

const GITHUB_URL_PATTERNS = [
  'https://github.com/*',
  'https://www.github.com/*',
]

export type StartDownload = (url: string) => unknown | Promise<unknown>

export type MenuClickInfo = {
  menuItemId: string | number
  linkUrl?: string
  pageUrl?: string
}

export type MenuTab = {
  url?: string
}

export type ContextMenusCreateProperties = {
  id: string
  title: string
  contexts: string[]
  documentUrlPatterns?: string[]
  targetUrlPatterns?: string[]
}

export type ContextMenusApi = {
  create: (createProperties: ContextMenusCreateProperties) => unknown
  remove?: (menuItemId: string) => unknown | Promise<unknown>
  removeAll?: () => unknown | Promise<unknown>
  onClicked: {
    addListener: (
      callback: (info: MenuClickInfo, tab?: MenuTab) => void,
    ) => void
  }
}

export type RegisterContextMenusDeps = {
  contextMenus?: ContextMenusApi
  startDownload?: StartDownload
}

/** Menu clicks call this after a successful detect. */
export async function startDownload(url: string) {
  return handleExtRequest({ type: 'START_DOWNLOAD', url })
}

export function handleContextMenuClick(
  info: MenuClickInfo,
  tab: MenuTab | undefined,
  download: StartDownload = startDownload,
): void {
  let url: string | undefined
  let source: 'link' | 'page'

  if (info.menuItemId === GITDOWN_LINK_MENU_ID) {
    url = info.linkUrl
    source = 'link'
  } else if (info.menuItemId === GITDOWN_PAGE_MENU_ID) {
    url = tab?.url || info.pageUrl
    source = 'page'
  } else {
    return
  }

  const detection = detectGithubUrl(url, source)
  if (!detection.ok) {
    return
  }

  void download(detection.url)
}

let productionClickListenerBound = false

async function installContextMenuItems(
  contextMenus: ContextMenusApi,
): Promise<void> {
  if (contextMenus.removeAll) {
    await Promise.resolve(contextMenus.removeAll())
  } else {
    await Promise.all([
      contextMenus.remove?.(GITDOWN_PAGE_MENU_ID),
      contextMenus.remove?.(GITDOWN_LINK_MENU_ID),
    ].map((result) =>
      Promise.resolve(result).catch(() => {
        // item may not exist yet
      }),
    ))
  }

  contextMenus.create({
    id: GITDOWN_PAGE_MENU_ID,
    title: GITDOWN_MENU_TITLE,
    contexts: ['page'],
    documentUrlPatterns: [...GITHUB_URL_PATTERNS],
  })

  contextMenus.create({
    id: GITDOWN_LINK_MENU_ID,
    title: GITDOWN_MENU_TITLE,
    contexts: ['link'],
    targetUrlPatterns: [...GITHUB_URL_PATTERNS],
  })
}

export function registerContextMenus(
  deps: RegisterContextMenusDeps = {},
): void {
  const contextMenus = deps.contextMenus ?? browser.contextMenus
  const download = deps.startDownload ?? startDownload
  const isInjected = Boolean(deps.contextMenus)

  if (isInjected || !productionClickListenerBound) {
    contextMenus.onClicked.addListener((info, tab) => {
      handleContextMenuClick(info, tab, download)
    })
    if (!isInjected) {
      productionClickListenerBound = true
    }
  }

  void installContextMenuItems(contextMenus).catch(() => {
    // contextMenus failures surface via runtime.lastError in Chrome DevTools
  })
}

/** Test seam: reset production listener guard between Vitest cases. */
export function resetContextMenusForTests(): void {
  productionClickListenerBound = false
}
