import { describe, expect, it } from 'vitest'
import { INSTITUTIONS } from '../src/data/institutions'

describe('INSTITUTIONS data integrity', () => {
  it('has unique codes', () => {
    const codes = INSTITUTIONS.map((i) => i.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('has unique slugs', () => {
    const slugs = INSTITUTIONS.map((i) => i.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('all slugs are kebab-case lowercase', () => {
    for (const inst of INSTITUTIONS) {
      expect(inst.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('all codes are 3-digit numeric strings', () => {
    for (const inst of INSTITUTIONS) {
      expect(inst.code).toMatch(/^\d{3}$/)
    }
  })

  it('every institution has at least one pattern', () => {
    for (const inst of INSTITUTIONS) {
      expect(inst.patterns.length).toBeGreaterThan(0)
    }
  })

  it('every pattern prefix is digits-only', () => {
    for (const inst of INSTITUTIONS) {
      for (const p of inst.patterns) {
        expect(p.prefix).toMatch(/^\d+$/)
      }
    }
  })

  it('every pattern has at least one length', () => {
    for (const inst of INSTITUTIONS) {
      for (const p of inst.patterns) {
        expect(p.lengths.length).toBeGreaterThan(0)
      }
    }
  })
})
