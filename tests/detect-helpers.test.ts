import { describe, expect, it } from 'vitest'
import { detectOne, getInstitution, getInstitutionLogo } from '../src/detect'

describe('detectOne', () => {
  it('returns top match', () => {
    const result = detectOne('110436387740')
    expect(result?.institution.code).toBe('088')
  })

  it('returns null when no match', () => {
    expect(detectOne('abc')).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(detectOne('')).toBeNull()
  })
})

describe('getInstitution', () => {
  it('returns institution by code', () => {
    expect(getInstitution('088')?.name).toBe('신한은행')
  })

  it('returns null for unknown code', () => {
    expect(getInstitution('999')).toBeNull()
  })
})

describe('getInstitutionLogo', () => {
  it('returns null for unknown code', () => {
    expect(getInstitutionLogo('999')).toBeNull()
    expect(getInstitutionLogo('999', 'symbol')).toBeNull()
    expect(getInstitutionLogo('999', 'wordmark')).toBeNull()
  })

  it('default variant is "symbol"', () => {
    // For an institution with a wordmark but no symbol yet,
    // the default-variant call should not surface the wordmark.
    expect(getInstitutionLogo('088')).toBe(getInstitutionLogo('088', 'symbol'))
  })

  it('returns wordmark SVG for 088 (신한) when variant=wordmark', () => {
    const wordmark = getInstitutionLogo('088', 'wordmark')
    expect(wordmark).toContain('<svg')
  })
})
