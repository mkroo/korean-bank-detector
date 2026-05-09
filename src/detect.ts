import type { DetectResult, InstitutionRecord, Pattern } from './types'
import { normalize } from './normalize'
import { INSTITUTIONS } from './data/institutions'

type Match = {
  record: InstitutionRecord
  pattern: Pattern
  prefixLength: number
  lengthExact: boolean
}

function findMatches(digits: string): Match[] {
  const matches: Match[] = []
  for (const record of INSTITUTIONS) {
    for (const pattern of record.patterns) {
      if (digits.startsWith(pattern.prefix)) {
        matches.push({
          record,
          pattern,
          prefixLength: pattern.prefix.length,
          lengthExact: pattern.lengths.includes(digits.length),
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
    confidence: 0,
    matchedPattern: m.pattern.prefix,
  }))
}
