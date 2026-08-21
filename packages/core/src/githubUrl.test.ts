import { describe, expect, it } from 'vitest'
import { buildZipNames, parseGitHubUrl } from './githubUrl'
import type { RepoRef } from './types'

function expectRepoRef(result: ReturnType<typeof parseGitHubUrl>): RepoRef {
  expect(result).not.toHaveProperty('ok', false)
  return result as RepoRef
}

describe('parseGitHubUrl', () => {
  it('parses whole-repo URL: https://github.com/acme/widgets', () => {
    const ref = expectRepoRef(parseGitHubUrl('https://github.com/acme/widgets'))
    expect(ref).toEqual({
      owner: 'acme',
      repo: 'widgets',
      path: '',
      ref: null,
      kind: 'repo',
    })
  })

  it('parses tree URL: https://github.com/acme/widgets/tree/main/src/lib', () => {
    const ref = expectRepoRef(
      parseGitHubUrl('https://github.com/acme/widgets/tree/main/src/lib'),
    )
    expect(ref.owner).toBe('acme')
    expect(ref.repo).toBe('widgets')
    expect(ref.ref).toBe('main')
    expect(ref.path).toBe('src/lib')
    expect(ref.kind).toBe('dir')
  })

  it('parses blob URL: https://github.com/acme/widgets/blob/main/README.md', () => {
    const ref = expectRepoRef(
      parseGitHubUrl('https://github.com/acme/widgets/blob/main/README.md'),
    )
    expect(ref.owner).toBe('acme')
    expect(ref.repo).toBe('widgets')
    expect(ref.ref).toBe('main')
    expect(ref.path).toBe('README.md')
    expect(ref.kind).toBe('file')
  })

  it('rejects invalid URL https://example.com/x with invalid_url', () => {
    const result = parseGitHubUrl('https://example.com/x')
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ kind: 'invalid_url' }),
    })
  })

  it('does not perform network I/O', () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = () => {
      throw new Error('network I/O is not allowed in parseGitHubUrl')
    }
    try {
      expectRepoRef(parseGitHubUrl('https://github.com/acme/widgets'))
      expectRepoRef(
        parseGitHubUrl('https://github.com/acme/widgets/tree/main/src/lib'),
      )
      parseGitHubUrl('https://example.com/x')
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})

describe('buildZipNames', () => {
  const dirRef: RepoRef = {
    owner: 'acme',
    repo: 'widgets',
    ref: 'main',
    path: 'src/lib',
    kind: 'dir',
  }

  const repoRef: RepoRef = {
    owner: 'acme',
    repo: 'widgets',
    ref: null,
    path: '',
    kind: 'repo',
  }

  it('rootDirectory false → empty prefix', () => {
    expect(buildZipNames(dirRef, { rootDirectory: 'false' })).toEqual({
      downloadFileName: 'lib',
      rootDirectoryPrefix: '',
    })
  })

  it('rootDirectory true → {rootName}/ prefix', () => {
    expect(buildZipNames(dirRef, { rootDirectory: 'true' })).toEqual({
      downloadFileName: 'lib',
      rootDirectoryPrefix: 'lib/',
    })
  })

  it('missing rootDirectory → {rootName}/ prefix', () => {
    expect(buildZipNames(dirRef, {})).toEqual({
      downloadFileName: 'lib',
      rootDirectoryPrefix: 'lib/',
    })
  })

  it('empty rootDirectory → {rootName}/ prefix', () => {
    expect(buildZipNames(dirRef, { rootDirectory: '' })).toEqual({
      downloadFileName: 'lib',
      rootDirectoryPrefix: 'lib/',
    })
  })

  it('custom rootDirectory → {custom}/ prefix', () => {
    expect(buildZipNames(dirRef, { rootDirectory: 'my-bundle' })).toEqual({
      downloadFileName: 'lib',
      rootDirectoryPrefix: 'my-bundle/',
    })
  })

  it('empty fileName → downloadFileName = rootName (repo when whole repo)', () => {
    expect(buildZipNames(repoRef, { fileName: '' })).toEqual({
      downloadFileName: 'widgets',
      rootDirectoryPrefix: 'widgets/',
    })
  })

  it('explicit fileName overrides downloadFileName', () => {
    expect(
      buildZipNames(dirRef, { fileName: 'pack', rootDirectory: 'false' }),
    ).toEqual({
      downloadFileName: 'pack',
      rootDirectoryPrefix: '',
    })
  })
})
