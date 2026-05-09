import type { Institution } from './types'
import { INSTITUTIONS } from './data/institutions'

export const ALL_INSTITUTIONS: readonly Institution[] = INSTITUTIONS.map((r) => ({
  code: r.code,
  name: r.name,
  shortName: r.shortName,
  englishName: r.englishName,
  category: r.category,
  slug: r.slug,
}))
