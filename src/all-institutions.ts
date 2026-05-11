import type { Institution } from './types'
import { INSTITUTIONS } from './data/institutions'
import { toInstitution } from './utils'

export const ALL_INSTITUTIONS: readonly Institution[] = INSTITUTIONS.map(toInstitution)
