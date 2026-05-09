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

  it('every pattern has at least one template', () => {
    for (const inst of INSTITUTIONS) {
      for (const p of inst.patterns) {
        expect(p.templates.length).toBeGreaterThan(0)
      }
    }
  })

  it('every template only contains digits, hyphens, or letters X/Y/Z/C/T/B/A/N/S', () => {
    for (const inst of INSTITUTIONS) {
      for (const p of inst.patterns) {
        for (const t of p.templates) {
          // Allow digits, hyphens, and uppercase/lowercase placeholder letters
          expect(t).toMatch(/^[0-9\-XYZCTBASNxyzcbtasn]+$/)
        }
      }
    }
  })

  it('code count is 17', () => {
    expect(INSTITUTIONS.length).toBe(17)
  })
})
