import type { DetectResult, Institution, InstitutionRecord, Pattern } from './types'
import { normalize } from './normalize'
import { INSTITUTIONS } from './data/institutions'
import { LOGOS } from './data/logos'
import { toInstitution } from './utils'

const MAX_PREFIX = INSTITUTIONS.reduce((max, inst) => {
  for (const p of inst.patterns) {
    if (p.prefix.length > max) max = p.prefix.length
  }
  return max
}, 1)

const LENGTH_FACTOR_EXACT = 1.2
const LENGTH_FACTOR_PARTIAL = 1.0
const CONFIDENCE_PRECISION = 1000

type Match = {
  record: InstitutionRecord
  pattern: Pattern
  confidence: number
}

function score(prefixLength: number, lengthExact: boolean): number {
  const base = prefixLength / MAX_PREFIX
  const factor = lengthExact ? LENGTH_FACTOR_EXACT : LENGTH_FACTOR_PARTIAL
  const raw = Math.min(base * factor, 1.0)
  return Math.round(raw * CONFIDENCE_PRECISION) / CONFIDENCE_PRECISION
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
  if (digits === '') return []

  const matches = findMatches(digits)
  // Stable sort by confidence descending; ties preserve INSTITUTIONS declaration order.
  matches.sort((a, b) => b.confidence - a.confidence)

  return matches.map((m) => ({
    institution: toInstitution(m.record),
    logo: LOGOS[m.record.code] ?? '',
    confidence: m.confidence,
    matchedPattern: m.pattern.prefix,
  }))
}

export function detectOne(input: string): DetectResult | null {
  return detect(input)[0] ?? null
}

export function getInstitution(code: string): Institution | null {
  const record = INSTITUTIONS.find((i) => i.code === code)
  return record ? toInstitution(record) : null
}

export function getInstitutionLogo(code: string): string | null {
  return LOGOS[code] ?? null
}
