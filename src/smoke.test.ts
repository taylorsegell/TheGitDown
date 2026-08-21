import { describe, expect, it } from 'vitest'
import { TOOLCHAIN_READY } from './placeholder'

describe('toolchain smoke', () => {
  it('asserts true', () => {
    expect(true).toBe(true)
    expect(TOOLCHAIN_READY).toBe(true)
  })
})
