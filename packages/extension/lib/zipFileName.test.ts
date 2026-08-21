import { describe, expect, it } from 'vitest'
import { kindLabel, zipFileNameFor } from './zipFileName'

describe('zipFileNameFor', () => {
  it('uses the folder basename for a nested directory', () => {
    expect(
      zipFileNameFor({
        owner: 'acme',
        repo: 'widgets',
        ref: 'main',
        path: 'src/docs',
        kind: 'dir',
      }),
    ).toBe('docs.zip')
  })

  it('uses the repo name for a whole-repository URL', () => {
    expect(
      zipFileNameFor({
        owner: 'acme',
        repo: 'widgets',
        ref: null,
        path: '',
        kind: 'repo',
      }),
    ).toBe('widgets.zip')
  })
})

describe('kindLabel', () => {
  it('labels a directory as Folder', () => {
    expect(kindLabel('dir')).toBe('Folder')
  })
})
