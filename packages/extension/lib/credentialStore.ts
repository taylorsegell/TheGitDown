const DEFAULT_STORAGE_KEY = 'gitdown.githubToken'

/** chrome.storage / browser.storage area used for the PAT. */
export type ChromeStorageAreaLike = {
  get: (keys: string | string[]) => Promise<Record<string, unknown>>
  set: (items: Record<string, unknown>) => Promise<void>
  remove: (keys: string | string[]) => Promise<void>
}

export type ChromeStorageCredentialStore = {
  hydrate(): Promise<void>
  getToken(): string | null
  setToken(token: string): Promise<void>
  clearToken(): Promise<void>
}

function tokenFromUnknown(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * CredentialStore over `browser.storage.local` (or a mock area in tests).
 *
 * Core `CredentialStore.getToken()` is synchronous, so this keeps an in-memory
 * cache: call `hydrate()` on SW / handler init, then SET/CLEAR update cache
 * and storage together.
 */
export function createChromeStorageCredentialStore(
  area: ChromeStorageAreaLike,
  key: string = DEFAULT_STORAGE_KEY,
): ChromeStorageCredentialStore {
  let cache: string | null = null

  async function hydrate(): Promise<void> {
    const result = await area.get(key)
    cache = tokenFromUnknown(result[key])
  }

  function getToken(): string | null {
    return cache
  }

  async function clearToken(): Promise<void> {
    cache = null
    await area.remove(key)
  }

  async function setToken(token: string): Promise<void> {
    const trimmed = token.trim()
    if (trimmed === '') {
      await clearToken()
      return
    }
    cache = trimmed
    await area.set({ [key]: trimmed })
  }

  return { hydrate, getToken, setToken, clearToken }
}
