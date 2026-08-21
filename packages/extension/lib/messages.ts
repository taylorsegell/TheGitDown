import {
  createGitHubHttp,
  downloadGitHubPath,
  type CredentialStore,
  type RepoRef,
} from '@gitdown/core'
import { downloadBlobZip, downloadRemoteUrl } from './chromeDownloads'
import {
  createChromeStorageCredentialStore,
  type ChromeStorageCredentialStore,
} from './credentialStore'
import { detectGithubUrl } from './detect'
import {
  createDownloadJob,
  type DownloadJob,
  type DownloadJobState,
} from './downloadJob'

export type { DownloadJob, DownloadJobState }

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

export type ExtEvent =
  | { type: 'DETECTION'; detection: Detection }
  | { type: 'JOB_STATE'; state: DownloadJobState }
  | { type: 'AUTH_STATUS'; hasToken: boolean }

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
  credentialStore?: ChromeStorageCredentialStore
  job?: DownloadJob
}

let productionCredentialStore: ChromeStorageCredentialStore | undefined
let productionJob: DownloadJob | undefined
let testJobOverride: DownloadJob | undefined
const jobStateListeners = new Set<(state: DownloadJobState) => void>()

export function addJobStateListener(
  listener: (state: DownloadJobState) => void,
): () => void {
  jobStateListeners.add(listener)
  return () => {
    jobStateListeners.delete(listener)
  }
}

/** Test seam: inject a job used when handleExtRequest is called without deps.job. */
export function setProductionDownloadJobForTests(job: DownloadJob | undefined): void {
  testJobOverride = job
}

export function resetExtensionJobsForTests(): void {
  testJobOverride = undefined
  productionJob = undefined
  productionCredentialStore = undefined
}

function getProductionCredentialStore(): ChromeStorageCredentialStore {
  productionCredentialStore ??= createChromeStorageCredentialStore(
    browser.storage.local,
  )
  return productionCredentialStore
}

async function resolveCredentialStore(
  deps: HandleExtRequestDeps,
): Promise<ChromeStorageCredentialStore> {
  const store = deps.credentialStore ?? getProductionCredentialStore()
  await store.hydrate()
  return store
}

function emitJobState(state: DownloadJobState): void {
  for (const listener of jobStateListeners) {
    listener(state)
  }
  try {
    void Promise.resolve(
      browser.runtime.sendMessage({ type: 'JOB_STATE', state } satisfies ExtEvent),
    ).catch(() => {
      // popup/options may be closed; the job still finishes
    })
  } catch {
    // runtime may be unavailable in tests
  }
}

function getOrCreateProductionJob(store: ChromeStorageCredentialStore): DownloadJob {
  if (productionJob) {
    return productionJob
  }

  const credentials: CredentialStore = {
    getToken: () => store.getToken(),
    setToken: () => {},
    clearToken: () => {},
  }

  productionJob = createDownloadJob({
    downloadGitHubPath,
    http: createGitHubHttp({ credentials }),
    saveBlobZip: downloadBlobZip,
    saveRemoteUrl: downloadRemoteUrl,
    onState: emitJobState,
  })
  return productionJob
}

function resolveJob(deps: HandleExtRequestDeps): DownloadJob | undefined {
  return deps.job ?? testJobOverride ?? productionJob
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
    case 'GET_JOB_STATE': {
      const job = resolveJob(deps)
      return { state: job?.getState() ?? { status: 'idle' } }
    }
    case 'START_DOWNLOAD': {
      if (deps.job) {
        return deps.job.start(msg.url)
      }
      if (testJobOverride) {
        return testJobOverride.start(msg.url)
      }
      const store = await resolveCredentialStore(deps)
      return getOrCreateProductionJob(store).start(msg.url)
    }
    case 'CANCEL_DOWNLOAD': {
      const job = resolveJob(deps)
      if (!job) {
        return { accepted: false }
      }
      return job.cancel()
    }
    case 'AUTH_GET_STATUS': {
      const store = await resolveCredentialStore(deps)
      return { hasToken: Boolean(store.getToken()) }
    }
    case 'AUTH_SET_TOKEN': {
      const store = await resolveCredentialStore(deps)
      await store.setToken(msg.token)
      return { ok: true }
    }
    case 'AUTH_CLEAR_TOKEN': {
      const store = await resolveCredentialStore(deps)
      await store.clearToken()
      return { ok: true }
    }
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
