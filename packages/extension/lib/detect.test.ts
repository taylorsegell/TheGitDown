import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseGitHubUrl } from '@gitdown/core'
import { describe, expect, it } from 'vitest'
import { detectGithubUrl } from './detect'

describe('detectGithubUrl', () => {
  it('detects a GitHub tree URL as a directory matching parseGitHubUrl path', () => {
    const url = 'https://github.com/taylorsegell/TheGitDown/tree/master/images'
    const parsed = parseGitHubUrl(url)
    expect(parsed).not.toHaveProperty('ok', false)

    const detection = detectGithubUrl(url, 'tab')
    expect(detection.ok).toBe(true)
    if (!detection.ok || 'ok' in parsed) {
      throw new Error('expected a successful parse and detection')
    }
    expect(detection.ref).toEqual(parsed)
    expect(detection.ref.kind).toBe('dir')
    expect(detection.ref.path).toBe('images')
    expect(detection.ref.path).toBe(parsed.path)
  })

  it('detects a GitHub blob README.md as a file', () => {
    const url =
      'https://github.com/taylorsegell/TheGitDown/blob/master/README.md'
    const detection = detectGithubUrl(url, 'tab')
    expect(detection.ok).toBe(true)
    if (!detection.ok) {
      throw new Error('expected a successful detection')
    }
    expect(detection.ref.kind).toBe('file')
    expect(detection.ref.path).toBe('README.md')
  })

  it('detects a GitHub repo root as a repo', () => {
    const url = 'https://github.com/taylorsegell/TheGitDown'
    const detection = detectGithubUrl(url, 'tab')
    expect(detection.ok).toBe(true)
    if (!detection.ok) {
      throw new Error('expected a successful detection')
    }
    expect(detection.ref.kind).toBe('repo')
    expect(detection.ref.owner).toBe('taylorsegell')
    expect(detection.ref.repo).toBe('TheGitDown')
  })

  it('rejects example.com as not_github', () => {
    expect(detectGithubUrl('https://example.com/foo', 'tab')).toEqual({
      ok: false,
      source: 'tab',
      url: 'https://example.com/foo',
      reason: 'not_github',
    })
  })

  it('rejects github.com/settings as invalid_url', () => {
    expect(detectGithubUrl('https://github.com/settings', 'tab')).toEqual({
      ok: false,
      source: 'tab',
      url: 'https://github.com/settings',
      reason: 'invalid_url',
    })
  })

  it('detect.ts contains no fetch( and no api.github.com', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'detect.ts'),
      'utf8',
    )
    expect(source).not.toContain('fetch(')
    expect(source).not.toContain('api.github.com')
  })
})
