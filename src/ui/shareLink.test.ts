import { describe, expect, it } from 'vitest'
import { buildShareLink } from './shareLink'

describe('buildShareLink', () => {
  it('builds origin hash deep-link with encoded url', () => {
    const result = buildShareLink(
      'https://gitdown.xyz',
      'https://github.com/a/b',
    )
    expect(result).toBe(
      'https://gitdown.xyz/#/home?url=https%3A%2F%2Fgithub.com%2Fa%2Fb',
    )
  })

  it('never uses minhaskamal.github.io', () => {
    const result = buildShareLink(
      'https://gitdown.xyz',
      'https://github.com/taylorsegell/TheGitDown',
    )
    expect(result.includes('minhaskamal.github.io')).toBe(false)
    expect(result.startsWith('https://gitdown.xyz/#/home?url=')).toBe(true)
  })

  it('strips trailing slash from origin', () => {
    expect(
      buildShareLink('https://gitdown.xyz/', 'https://github.com/a/b'),
    ).toBe('https://gitdown.xyz/#/home?url=https%3A%2F%2Fgithub.com%2Fa%2Fb')
  })
})
