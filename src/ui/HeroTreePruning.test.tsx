import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { HeroTreePruning } from './HeroTreePruning'

beforeAll(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true
})

describe('HeroTreePruning', () => {
  let root: Root
  let container: HTMLDivElement

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  function renderHero() {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(<HeroTreePruning />)
    })
  }

  it('states the prune offer with the 1a wordmark and headline', () => {
    renderHero()
    const text = container.textContent ?? ''
    expect(text).toMatch(/gitdown/)
    expect(text).toMatch(/Grab the branch/)
    expect(text).toMatch(/Skip the forest/)
    expect(text).toMatch(/Paste any GitHub link/)
    expect(text).not.toMatch(/Download Folder/)
    expect(text).not.toMatch(/how it works/)
    expect(container.querySelectorAll('.home-cross')).toHaveLength(4)
  })

  it('highlights assets/ in the tree and reveals the zip on tap', () => {
    window.matchMedia = ((query: string) => {
      return {
        matches: query.includes('44rem'),
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }
    }) as typeof window.matchMedia

    renderHero()
    const target = container.querySelector('.hero-prune-target')
    expect(target).not.toBeNull()
    expect(target?.tagName).toBe('BUTTON')
    expect(target?.textContent).toMatch(/assets\//)
    expect(container.querySelector('#hero-prune-zip')?.textContent).toMatch(
      /assets\.zip/,
    )
    expect(target?.getAttribute('aria-expanded')).toBe('false')
    act(() => {
      target?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(target?.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.hero-prune-tree')?.className).toContain(
      'is-expanded',
    )
  })
})
