import type { Institution, InstitutionRecord } from './types'

export function toInstitution(record: InstitutionRecord): Institution {
  return {
    code: record.code,
    name: record.name,
    shortName: record.shortName,
    englishName: record.englishName,
    category: record.category,
    slug: record.slug,
  }
}
