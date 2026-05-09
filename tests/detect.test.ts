import { describe, expect, it } from 'vitest'
import { detect } from '../src/detect'

describe('detect', () => {
  it('returns empty array for empty input', () => {
    expect(detect('')).toEqual([])
  })

  it('returns empty array for non-numeric input', () => {
    expect(detect('abc')).toEqual([])
  })

  it('returns empty array when no pattern matches', () => {
    expect(detect('999999999999')).toEqual([])
  })

  it('matches a single bank by prefix', () => {
    const results = detect('110436387740')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].institution.code).toBe('088')
    expect(results[0].institution.name).toBe('신한은행')
  })

  it('returns matchedPattern for debugging', () => {
    const results = detect('110436387740')
    expect(results[0].matchedPattern).toBe('110')
  })
})
