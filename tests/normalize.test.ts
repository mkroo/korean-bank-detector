import { describe, expect, it } from 'vitest'
import { normalize } from '../src/normalize'

describe('normalize', () => {
  it('strips hyphens', () => {
    expect(normalize('110-436-387740')).toBe('110436387740')
  })

  it('strips spaces, dots, underscores', () => {
    expect(normalize('110 436.387_740')).toBe('110436387740')
  })

  it('returns empty string for empty input', () => {
    expect(normalize('')).toBe('')
  })

  it('returns empty string when non-digit characters remain', () => {
    expect(normalize('abc123')).toBe('')
    expect(normalize('110-abc-740')).toBe('')
  })

  it('preserves all-digit input untouched', () => {
    expect(normalize('110436387740')).toBe('110436387740')
  })

  it('handles mixed allowed separators', () => {
    expect(normalize(' 110 - 436 . 387_740 ')).toBe('110436387740')
  })
})
