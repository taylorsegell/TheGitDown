import type { DownloadError, RepoRef } from '@gitdown/core'
import { detectGithubUrl } from './detect'

export type ExtRequest =
  | { type: 'GET_ACTIVE_DETECTION' }
  | { type: 'GET_JOB_STATE' }
  | { type: 'START_DOWNLOAD'; url: string }
  | { type: 'CANCEL_DOWNLOAD' }
  | { type: 'AUTH_GET_STATUS' }
  | { type: 'AUTH_SET_TOKEN'; token: string }
  | { type: 'AUTH_CLEAR_TOKEN' }

export type Detection =
  | { ok: true; source: 'tab' | 'link' | 'page'; url: string; ref: RepoRef }
  | {
      ok: false
      source: 'tab' | 'link' | 'page'
      url: string | null
      reason: 'not_github' | 'invalid_url'
    }

export type DownloadJobState =
  | { status: 'idle' }
  | { status: 'running'; url: string; downloaded: number; total: number }
  | { status: 'done'; url: string; fileName: string }
  | { status: 'fail'; url: string; error: DownloadError }

export type ExtResponse<T extends ExtRequest['type']> = T extends 'GET_ACTIVE_DETECTION'
  ? { detection: Detection }
  : T extends 'GET_JOB_STATE'
    ? { state: DownloadJobState }
    : T extends 'START_DOWNLOAD'
      ? { accepted: boolean; reason?: string }
      : T extends 'CANCEL_DOWNLOAD'
        ? { accepted: boolean }
        : T extends 'AUTH_GET_STATUS'
          ? { hasToken: boolean }
          : T extends 'AUTH_SET_TOKEN' | 'AUTH_CLEAR_TOKEN'
            ? { ok: true }
            : never

export function isExtRequest(msg: unknown): msg is ExtRequest {
  if (typeof msg !== 'object' || msg === null || !('type' in msg)) {
    return false
  }

  const type = (msg as { type: unknown }).type
  if (type === 'START_DOWNLOAD') {
    return typeof (msg as { url?: unknown }).url === 'string'
  }
  if (type === 'AUTH_SET_TOKEN') {
    return typeof (msg as { token?: unknown }).token === 'string'
  }

  return (
    type === 'GET_ACTIVE_DETECTION' ||
    type === 'GET_JOB_STATE' ||
    type === 'CANCEL_DOWNLOAD' ||
    type === 'AUTH_GET_STATUS' ||
    type === 'AUTH_CLEAR_TOKEN'
  )
}

/** Injectable so tests can supply a tab URL without `browser.tabs`. */
export type ActiveTabsQuery = (
  queryInfo: { active: true; currentWindow: true },
) => Promise<ReadonlyArray<{ url?: string }>>

async function defaultActiveTabsQuery(
  queryInfo: { active: true; currentWindow: true },
): Promise<ReadonlyArray<{ url?: string }>> {
  return browser.tabs.query(queryInfo)
}

export type HandleExtRequestDeps = {
  tabsQuery?: ActiveTabsQuery
}

export async function handleExtRequest(
  msg: ExtRequest,
  deps: HandleExtRequestDeps = {},
): Promise<ExtResponse<ExtRequest['type']>> {
  switch (msg.type) {
    case 'GET_ACTIVE_DETECTION': {
      const tabsQuery = deps.tabsQuery ?? defaultActiveTabsQuery
      const tabs = await tabsQuery({ active: true, currentWindow: true })
      return { detection: detectGithubUrl(tabs[0]?.url, 'tab') }
    }
    case 'GET_JOB_STATE':
      return { state: { status: 'idle' } }
    case 'START_DOWNLOAD':
      return { accepted: false, reason: 'not_implemented' }
    case 'CANCEL_DOWNLOAD':
      return { accepted: false }
    case 'AUTH_GET_STATUS':
      return { hasToken: false }
    case 'AUTH_SET_TOKEN':
    case 'AUTH_CLEAR_TOKEN':
      return { ok: true }
    default: {
      const _exhaustive: never = msg
      throw new Error(`Unhandled ExtRequest: ${JSON.stringify(_exhaustive)}`)
    }
  }
}

export async function sendExtMessage<T extends ExtRequest>(
  msg: T,
): Promise<ExtResponse<T['type']>> {
  return browser.runtime.sendMessage(msg) as Promise<ExtResponse<T['type']>>
}
