import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  createLocalStorageCredentialStore,
  type CredentialStore,
} from '../domain/credentials'
import { TokenSettings } from './TokenSettings'

beforeAll(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true
})

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

function setInputValue(input: HTMLInputElement, value: string): void {
  const proto = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )
  proto?.set?.call(input, value)
  // React controlled-input tracker must see a value change.
  const tracker = (
    input as HTMLInputElement & {
      _valueTracker?: { setValue: (v: string) => void }
    }
  )._valueTracker
  tracker?.setValue('')
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function renderTokenSettings(credentials: CredentialStore): {
  container: HTMLDivElement
  root: Root
  cleanup: () => void
} {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  act(() => {
    root.render(<TokenSettings credentials={credentials} />)
  })

  return {
    container,
    root,
    cleanup: () => {
      act(() => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('TokenSettings', () => {
  const cleanups: Array<() => void> = []

  afterEach(() => {
    while (cleanups.length > 0) {
      cleanups.pop()?.()
    }
    document.body.innerHTML = ''
  })

  it('Save calls setToken; remount with same storage still has token', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageCredentialStore(storage)
    const first = renderTokenSettings(store)
    cleanups.push(first.cleanup)

    const input = first.container.querySelector(
      '#github-token',
    ) as HTMLInputElement
    const saveButton = Array.from(
      first.container.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Save token')!

    act(() => {
      setInputValue(input, 'ghp_ui_test_token_xyz')
    })

    act(() => {
      saveButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(store.getToken()).toBe('ghp_ui_test_token_xyz')
    expect(storage.getItem('gitdown.githubToken')).toBe('ghp_ui_test_token_xyz')

    const status = first.container.querySelector('[data-testid="token-saved"]')
    expect(status?.textContent).toMatch(/Token saved/)
    expect(status?.textContent).not.toContain('ghp_ui_test_token_xyz')
    expect(status?.textContent).toContain('••••••••_xyz')
    expect(input.value).toBe('')

    first.cleanup()
    cleanups.pop()

    const storeAgain = createLocalStorageCredentialStore(storage)
    expect(storeAgain.getToken()).toBe('ghp_ui_test_token_xyz')

    const second = renderTokenSettings(storeAgain)
    cleanups.push(second.cleanup)

    expect(
      second.container.querySelector('[data-testid="token-saved"]')?.textContent,
    ).toMatch(/Token saved/)
    expect(
      second.container.querySelector('[data-testid="token-saved"]')?.textContent,
    ).not.toContain('ghp_ui_test_token_xyz')
  })

  it('Clear calls clearToken; subsequent getToken is null', () => {
    const storage = createMemoryStorage()
    storage.setItem('gitdown.githubToken', 'ghp_already_saved')
    const store = createLocalStorageCredentialStore(storage)
    const { container, cleanup } = renderTokenSettings(store)
    cleanups.push(cleanup)

    expect(store.getToken()).toBe('ghp_already_saved')

    const clearButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Clear',
    )!

    act(() => {
      clearButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(store.getToken()).toBeNull()
    expect(storage.getItem('gitdown.githubToken')).toBeNull()
    expect(container.querySelector('[data-testid="token-saved"]')).toBeNull()
  })
})
