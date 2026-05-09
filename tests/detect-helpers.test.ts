import { describe, expect, it } from 'vitest'
import { detectOne, getInstitution, getInstitutionLogo } from '../src/detect'

describe('detectOne', () => {
  it('returns top match', () => {
    const result = detectOne('110436387740')
    expect(result?.institution.code).toBe('088')
  })

  it('returns null when no match', () => {
    expect(detectOne('999999999999')).toBeNull()
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
  })
})

describe('getInstitutionLogo with seeded logo', () => {
  it('returns SVG string for 088 (신한)', () => {
    const logo = getInstitutionLogo('088')
    expect(logo).toContain('<svg')
  })
})
