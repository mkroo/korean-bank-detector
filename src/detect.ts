import type {
  DetectResult,
  Institution,
  InstitutionLogo,
  LogoVariant,
  Pattern,
  YCodeRange,
} from './types'
import { normalize } from './normalize'
import { INSTITUTIONS } from './data/institutions'
import { SYMBOL_LOGOS, WORDMARK_LOGOS } from './data/logos'
import { toInstitution } from './utils'

function getLogoBundle(code: string): InstitutionLogo {
  return {
    symbol: SYMBOL_LOGOS[code] ?? null,
    wordmark: WORDMARK_LOGOS[code] ?? null,
  }
}

function matchesYCode(
  yCodes: (string | YCodeRange)[],
  slice: string
): boolean {
  for (const yCode of yCodes) {
    if (typeof yCode === 'string') {
      if (yCode === slice) return true
    } else {
      const n = Number.parseInt(slice, 10)
      if (!Number.isNaN(n) && yCode.from <= n && n <= yCode.to) return true
    }
  }
  return false
}

/** Returns true if every literal digit in the stripped template matches the normalized input at that position. */
function literalDigitsMatch(stripped: string, normalized: string): boolean {
  for (let i = 0; i < stripped.length && i < normalized.length; i++) {
    const ch = stripped[i]
    if (ch >= '0' && ch <= '9') {
      if (normalized[i] !== ch) return false
    }
  }
  return true
}

function scorePattern(pattern: Pattern, normalized: string): { score: number; matchedTemplate: string } {
  let maxScore = 0
  let bestTemplate = ''

  for (const template of pattern.templates) {
    let patternScore = 0
    const stripped = template.replace(/-/g, '').toUpperCase()

    // Check literal digit positions first — if any literal digit doesn't match, skip
    if (!literalDigitsMatch(stripped, normalized)) {
      continue
    }

    // Find first run of Y+ characters
    const yMatch = stripped.match(/Y+/)
    if (yMatch && yMatch.index !== undefined) {
      const yStart = yMatch.index
      const yLen = yMatch[0].length
      const yEnd = yStart + yLen

      if (pattern.yCodes && pattern.yCodes.length > 0) {
        // Pattern declares yCodes: yCode must match or template contributes 0
        if (normalized.length >= yEnd) {
          const slice = normalized.slice(yStart, yEnd)
          if (matchesYCode(pattern.yCodes, slice)) {
            patternScore += 1
          } else {
            // yCode mismatch: this template contributes nothing
            continue
          }
        } else {
          // Not enough digits to reach Y position: no match
          continue
        }
      }
      // If no yCodes defined but template has Y: treat as wildcard, no score from Y
    }

    if (stripped.length === normalized.length) {
      patternScore += 1
    }

    if (patternScore > maxScore) {
      maxScore = patternScore
      bestTemplate = stripped
    }
  }

  // Apply additionalRules only when at least one template produced a base score > 0
  let finalScore = maxScore
  if (maxScore > 0 && pattern.additionalRules) {
    for (const rule of pattern.additionalRules) {
      if (rule(normalized)) {
        finalScore += 1
      }
    }
  }

  return { score: finalScore, matchedTemplate: bestTemplate }
}

type InstitutionMatch = {
  institution: Institution
  code: string
  score: number
  matchedTemplate: string
}

export function detect(input: string): DetectResult[] {
  const normalized = normalize(input)
  if (normalized === '') return []

  const institutionMatches: InstitutionMatch[] = []

  for (const record of INSTITUTIONS) {
    let instScore = 0
    let instTemplate = ''

    for (const pattern of record.patterns) {
      const { score, matchedTemplate } = scorePattern(pattern, normalized)
      if (score > instScore) {
        instScore = score
        instTemplate = matchedTemplate
      }
    }

    if (instScore > 0) {
      institutionMatches.push({
        institution: toInstitution(record),
        code: record.code,
        score: instScore,
        matchedTemplate: instTemplate,
      })
    }
  }

  // Stable sort by score descending; ties preserve INSTITUTIONS declaration order.
  institutionMatches.sort((a, b) => b.score - a.score)

  return institutionMatches.map((m) => ({
    institution: m.institution,
    logo: getLogoBundle(m.code),
    confidence: Math.round(Math.min(m.score / 2, 1.0) * 1000) / 1000,
    matchedPattern: m.matchedTemplate,
  }))
}

export function detectOne(input: string): DetectResult | null {
  return detect(input)[0] ?? null
}

export function getInstitution(code: string): Institution | null {
  const record = INSTITUTIONS.find((i) => i.code === code)
  return record ? toInstitution(record) : null
}

/**
 * Returns the SVG string for the requested logo variant, or null when the
 * institution code is unknown or the asset is not yet sourced.
 *
 * @param code KFTC 3-digit institution code
 * @param variant 'symbol' (default — square mark) or 'wordmark' (rectangular lockup)
 */
export function getInstitutionLogo(
  code: string,
  variant: LogoVariant = 'symbol',
): string | null {
  const map = variant === 'symbol' ? SYMBOL_LOGOS : WORDMARK_LOGOS
  return map[code] ?? null
}
