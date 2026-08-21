import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { PrivacyPage } from './PrivacyPage'

beforeAll(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true
})

describe('PrivacyPage', () => {
  let root: Root
  let container: HTMLDivElement

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('states there is no TheGitDown backend and tokens stay in the browser', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root.render(
        <MemoryRouter>
          <PrivacyPage />
        </MemoryRouter>,
      )
    })

    const text = container.textContent ?? ''
    expect(text).toMatch(/Privacy policy/)
    expect(text).toMatch(/no TheGitDown backend/)
    expect(text).toMatch(/localStorage/)
    expect(text).toMatch(/chrome\.storage\.local/)
    expect(text).toMatch(/api\.github.com/)
    expect(text).toMatch(/personal access token/)
  })

  it('keeps the static privacy.html copy aligned with the SPA policy', async () => {
    const { readFileSync } = await import('node:fs')
    const { dirname, join } = await import('node:path')
    const { fileURLToPath } = await import('node:url')
    const html = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../public/privacy.html'),
      'utf8',
    ).replace(/\s+/g, ' ')
    expect(html).toContain('no TheGitDown backend')
    expect(html).toContain('localStorage')
    expect(html).toContain('chrome.storage.local')
    expect(html).toContain('api.github.com')
  })
})
