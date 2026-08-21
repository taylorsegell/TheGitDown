import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { ChromeExtensionCta, CHROME_WEB_STORE_URL } from './ChromeExtensionCta'

beforeAll(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true
})

describe('ChromeExtensionCta', () => {
  let root: Root
  let container: HTMLDivElement

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('points Add to Chrome at the placeholder store listing', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root.render(<ChromeExtensionCta />)
    })

    const link = container.querySelector('a[href]')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe(CHROME_WEB_STORE_URL)
    expect(CHROME_WEB_STORE_URL).toContain('chromewebstore.google.com')
    expect(link?.textContent).toContain('Add to Chrome')
  })
})
