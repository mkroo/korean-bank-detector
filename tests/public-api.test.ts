import { describe, expect, it } from 'vitest'
import * as api from '../src/index'

describe('public API surface', () => {
  it('exports detect', () => {
    expect(typeof api.detect).toBe('function')
  })

  it('exports detectOne', () => {
    expect(typeof api.detectOne).toBe('function')
  })

  it('exports getInstitution', () => {
    expect(typeof api.getInstitution).toBe('function')
  })

  it('exports getInstitutionLogo', () => {
    expect(typeof api.getInstitutionLogo).toBe('function')
  })

  it('exports ALL_INSTITUTIONS', () => {
    expect(Array.isArray(api.ALL_INSTITUTIONS)).toBe(true)
    expect(api.ALL_INSTITUTIONS.length).toBeGreaterThan(0)
  })

  it('ALL_INSTITUTIONS items do not leak patterns', () => {
    for (const inst of api.ALL_INSTITUTIONS) {
      expect((inst as unknown as Record<string, unknown>).patterns).toBeUndefined()
    }
  })
})
