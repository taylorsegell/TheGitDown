const DEFAULT_STORAGE_KEY = 'gitdown.githubToken'

export interface CredentialStore {
  getToken(): string | null
  setToken(token: string): void
  clearToken(): void
}

export function createLocalStorageCredentialStore(
  storage: Storage = localStorage,
  key: string = DEFAULT_STORAGE_KEY,
): CredentialStore {
  return {
    getToken(): string | null {
      const value = storage.getItem(key)
      if (value == null) {
        return null
      }
      const trimmed = value.trim()
      return trimmed === '' ? null : trimmed
    },

    setToken(token: string): void {
      const trimmed = token.trim()
      if (trimmed === '') {
        storage.removeItem(key)
        return
      }
      storage.setItem(key, trimmed)
    },

    clearToken(): void {
      storage.removeItem(key)
    },
  }
}
