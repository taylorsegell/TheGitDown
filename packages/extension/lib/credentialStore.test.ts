import { describe, expect, it } from 'vitest'
import { createChromeStorageCredentialStore } from './credentialStore'

function createMemoryStorageArea() {
  const data = new Map<string, unknown>()
  const keysTouched: string[] = []

  const area = {
    async get(keys: string | string[]) {
      const list = Array.isArray(keys) ? keys : [keys]
      const out: Record<string, unknown> = {}
      for (const k of list) {
        keysTouched.push(k)
        if (data.has(k)) {
          out[k] = data.get(k)
        }
      }
      return out
    },
    async set(items: Record<string, unknown>) {
      for (const [k, v] of Object.entries(items)) {
        keysTouched.push(k)
        data.set(k, v)
      }
    },
    async remove(keys: string | string[]) {
      const list = Array.isArray(keys) ? keys : [keys]
      for (const k of list) {
        keysTouched.push(k)
        data.delete(k)
      }
    },
  }

  return { area, data, keysTouched }
}

describe('createChromeStorageCredentialStore', () => {
  it("setToken('  abc  ') then hydrate leaves getToken as 'abc'", async () => {
    const { area, data } = createMemoryStorageArea()
    const store = createChromeStorageCredentialStore(area)

    await store.setToken('  abc  ')
    expect(store.getToken()).toBe('abc')

    await store.hydrate()
    expect(store.getToken()).toBe('abc')
    expect(data.get('gitdown.githubToken')).toBe('abc')
  })

  it("setToken('   ') removes the key and getToken is null", async () => {
    const { area, data } = createMemoryStorageArea()
    const store = createChromeStorageCredentialStore(area)

    await store.setToken('abc')
    expect(data.has('gitdown.githubToken')).toBe(true)

    await store.setToken('   ')
    expect(store.getToken()).toBeNull()
    expect(data.has('gitdown.githubToken')).toBe(false)
  })

  it('uses storage key gitdown.githubToken by default', async () => {
    const { area, data, keysTouched } = createMemoryStorageArea()
    const store = createChromeStorageCredentialStore(area)

    await store.setToken('abc')
    await store.hydrate()
    await store.clearToken()

    expect(keysTouched.every((k) => k === 'gitdown.githubToken')).toBe(true)
    expect([...data.keys()]).toEqual([])
  })

  it('hydrate loads a token written only to storage', async () => {
    const { area, data } = createMemoryStorageArea()
    data.set('gitdown.githubToken', '  persisted  ')
    const store = createChromeStorageCredentialStore(area)

    expect(store.getToken()).toBeNull()
    await store.hydrate()
    expect(store.getToken()).toBe('persisted')
  })

  it('clearToken removes the key', async () => {
    const { area, data } = createMemoryStorageArea()
    const store = createChromeStorageCredentialStore(area)

    await store.setToken('abc')
    await store.clearToken()

    expect(store.getToken()).toBeNull()
    expect(data.has('gitdown.githubToken')).toBe(false)
  })
})
