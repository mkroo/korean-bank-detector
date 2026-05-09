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

export type Pattern = {
  prefix: string
  lengths: number[]
}

export type InstitutionRecord = Institution & {
  patterns: Pattern[]
}

export type DetectResult = {
  institution: Institution
  logo: string
  confidence: number
  matchedPattern: string
}
