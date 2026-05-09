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

describe('detect — confidence scoring', () => {
  it('confidence is between 0 and 1', () => {
    const results = detect('110436387740')
    for (const r of results) {
      expect(r.confidence).toBeGreaterThan(0)
      expect(r.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('exact length match scores higher than partial', () => {
    const partial = detect('110')[0]?.confidence ?? 0
    const full = detect('110436387740')[0]?.confidence ?? 0
    expect(full).toBeGreaterThan(partial)
  })

  it('longer prefix scores higher than shorter prefix when both match', () => {
    // 카카오뱅크 prefix '3333' (length 4) > 신한 prefix '110' (length 3)
    const kakao = detect('3333123456789')[0]?.confidence ?? 0
    const shinhan = detect('110436387740')[0]?.confidence ?? 0
    expect(kakao).toBeGreaterThan(shinhan)
  })

  it('sorts results by confidence descending', () => {
    const results = detect('110436387740')
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence)
    }
  })
})
