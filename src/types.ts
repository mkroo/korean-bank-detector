export type InstitutionCategory =
  | 'bank'
  | 'internet-bank'
  | 'regional'
  | 'special'
  | 'mutual'
  | 'securities'

export type Institution = {
  code: string
  name: string
  shortName: string
  englishName: string
  category: InstitutionCategory
  slug: string
}

export type YCodeRange = { from: number; to: number }

export type Pattern = {
  /**
   * Account templates with placeholders. Hyphens are stripped before matching.
   * Letters (any case): X = any digit, Y = subject code position (matched against yCodes),
   * Z = serial, C = check digit, T = transaction type, B = bank-specific.
   * Only Y is interpreted; other letters are placeholders for "any digit".
   */
  templates: string[]
  /** Accepted values at the Y position. Strings match exactly; ranges are numeric inclusive. */
  yCodes?: (string | YCodeRange)[]
  /** Extra predicates over the normalized account number (no hyphens). */
  additionalRules?: ((normalized: string) => boolean)[]
}

export type InstitutionRecord = Institution & { patterns: Pattern[] }

export type DetectResult = {
  institution: Institution
  logo: string
  confidence: number
  /** First matched template (hyphens stripped, uppercased). */
  matchedPattern: string
}
