import type { DetectResult, Institution, InstitutionRecord, Pattern } from './types'
import { normalize } from './normalize'
import { INSTITUTIONS } from './data/institutions'

const MAX_PREFIX = INSTITUTIONS.reduce((max, inst) => {
  for (const p of inst.patterns) {
    if (p.prefix.length > max) max = p.prefix.length
  }
  return max
}, 1)

const LENGTH_FACTOR_EXACT = 1.2
const LENGTH_FACTOR_PARTIAL = 1.0

type Match = {
  record: InstitutionRecord
  pattern: Pattern
  confidence: number
}

function score(prefixLength: number, lengthExact: boolean): number {
  const base = prefixLength / MAX_PREFIX
  const factor = lengthExact ? LENGTH_FACTOR_EXACT : LENGTH_FACTOR_PARTIAL
  return Math.min(base * factor, 1.0)
}

function findMatches(digits: string): Match[] {
  const matches: Match[] = []
  for (const record of INSTITUTIONS) {
    for (const pattern of record.patterns) {
      if (digits.startsWith(pattern.prefix)) {
        matches.push({
          record,
          pattern,
          confidence: score(pattern.prefix.length, pattern.lengths.includes(digits.length)),
        })
      }
    }
  }
  return matches
}

export function detect(input: string): DetectResult[] {
  const digits = normalize(input)
  if (!digits) return []

  const matches = findMatches(digits)
  matches.sort((a, b) => b.confidence - a.confidence)

  return matches.map((m) => ({
    institution: {
      code: m.record.code,
      name: m.record.name,
      shortName: m.record.shortName,
      englishName: m.record.englishName,
      category: m.record.category,
      slug: m.record.slug,
    },
    logo: '',
    confidence: m.confidence,
    matchedPattern: m.pattern.prefix,
  }))
}

export function detectOne(input: string): DetectResult | null {
  return detect(input)[0] ?? null
}

export function getInstitution(code: string): Institution | null {
  const record = INSTITUTIONS.find((i) => i.code === code)
  if (!record) return null
  return {
    code: record.code,
    name: record.name,
    shortName: record.shortName,
    englishName: record.englishName,
    category: record.category,
    slug: record.slug,
  }
}

export function getInstitutionLogo(code: string): string | null {
  // Logo map populated by build script; until built, returns null.
  // Implementation wired in Task 14.
  return null
}
