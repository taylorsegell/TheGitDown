import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLocalStorageCredentialStore } from './credentials'

function createMemoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear() {
      map.clear()
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null
    },
    key(index: number) {
      return [...map.keys()][index] ?? null
    },
    removeItem(key: string) {
      map.delete(key)
    },
    setItem(key: string, value: string) {
      map.set(key, String(value))
    },
  }
}

describe('createLocalStorageCredentialStore', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('set then get returns the same token', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageCredentialStore(storage)

    store.setToken('ghp_test_token_abc')

    expect(store.getToken()).toBe('ghp_test_token_abc')
    expect(storage.getItem('gitdown.githubToken')).toBe('ghp_test_token_abc')
  })

  it('clear then get returns null', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageCredentialStore(storage)

    store.setToken('ghp_test_token_abc')
    store.clearToken()

    expect(store.getToken()).toBeNull()
    expect(storage.getItem('gitdown.githubToken')).toBeNull()
  })

  it('set empty or whitespace clears and leaves key absent', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageCredentialStore(storage)

    store.setToken('ghp_test_token_abc')
    store.setToken('')

    expect(store.getToken()).toBeNull()
    expect(storage.getItem('gitdown.githubToken')).toBeNull()

    store.setToken('ghp_test_token_abc')
    store.setToken('   \t\n  ')

    expect(store.getToken()).toBeNull()
    expect(storage.getItem('gitdown.githubToken')).toBeNull()
  })

  it('trims stored and retrieved tokens', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageCredentialStore(storage)

    store.setToken('  ghp_padded  ')

    expect(store.getToken()).toBe('ghp_padded')
    expect(storage.getItem('gitdown.githubToken')).toBe('ghp_padded')
  })

  it('uses a custom storage key when provided', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageCredentialStore(storage, 'custom.token.key')

    store.setToken('secret')

    expect(storage.getItem('custom.token.key')).toBe('secret')
    expect(storage.getItem('gitdown.githubToken')).toBeNull()
  })

  it('does not log the token', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

    const storage = createMemoryStorage()
    const store = createLocalStorageCredentialStore(storage)
    const token = 'ghp_must_not_appear_in_logs'

    store.setToken(token)
    store.getToken()
    store.clearToken()

    const allCalls = [
      ...logSpy.mock.calls,
      ...infoSpy.mock.calls,
      ...warnSpy.mock.calls,
      ...errorSpy.mock.calls,
      ...debugSpy.mock.calls,
    ]
    const serialized = JSON.stringify(allCalls)

    expect(serialized).not.toContain(token)
  })
})
