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

/** Spy-seam: menu clicks call this after a successful detect. Still a stub until M5. */
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

export function registerContextMenus(
  deps: RegisterContextMenusDeps = {},
): void {
  const contextMenus = deps.contextMenus ?? browser.contextMenus
  const download = deps.startDownload ?? startDownload

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

  contextMenus.onClicked.addListener((info, tab) => {
    handleContextMenuClick(info, tab, download)
  })
}
