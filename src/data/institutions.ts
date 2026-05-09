import type { InstitutionRecord } from '../types'

export const INSTITUTIONS: readonly InstitutionRecord[] = [
  {
    code: '088',
    slug: 'shinhan',
    name: '신한은행',
    shortName: '신한',
    englishName: 'Shinhan Bank',
    category: 'bank',
    patterns: [
      { prefix: '110', lengths: [11, 12] },
      { prefix: '100', lengths: [12] },
    ],
  },
  {
    code: '004',
    slug: 'kookmin',
    name: 'KB국민은행',
    shortName: 'KB국민',
    englishName: 'KB Kookmin Bank',
    category: 'bank',
    patterns: [
      { prefix: '004', lengths: [12, 14] },
    ],
  },
  {
    code: '090',
    slug: 'kakaobank',
    name: '카카오뱅크',
    shortName: '카카오뱅크',
    englishName: 'Kakao Bank',
    category: 'internet-bank',
    patterns: [
      { prefix: '3333', lengths: [13, 14] },
    ],
  },
] as const
