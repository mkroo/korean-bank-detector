import type { InstitutionRecord } from '../types'

export const INSTITUTIONS: readonly InstitutionRecord[] = [
  /**
   * 한국산업은행
   */
  {
    code: '002',
    slug: 'kdb',
    name: '산업은행',
    shortName: '산업(KDB)',
    englishName: 'KDB Industrial Bank',
    category: 'special',
    patterns: [
      // 구계좌 XXX-YY-ZZZZZC
      {
        templates: ['XXX-YY-ZZZZZC'],
        yCodes: ['13', '20', '19', '11', '22'],
      },
      // 신계좌 YYY-ZZZZZZZC-XXX
      {
        templates: ['YYY-ZZZZZZZC-XXX'],
        yCodes: ['013', '020', '019', '011', '022'],
      },
    ],
  },

  /**
   * 중소기업은행
   */
  {
    code: '003',
    slug: 'ibk',
    name: '중소기업은행',
    shortName: '기업(IBK)',
    englishName: 'IBK Industrial Bank',
    category: 'special',
    patterns: [
      // 평생계좌
      {
        templates: ['BBBBBBBB-ZZ', 'AAA-BBBBBBBB'],
      },
      // 현재
      {
        templates: ['XXX-YY-ZZZZZZC', 'XXX-BBBBBB-YY-ZZC'],
        yCodes: ['01', '02', '03', '13', '07', '06', '04'],
      },
    ],
  },

  /**
   * KB국민은행
   */
  {
    code: '004',
    slug: 'kookmin',
    name: 'KB국민은행',
    shortName: 'KB국민',
    englishName: 'KB Kookmin Bank',
    category: 'bank',
    patterns: [
      // 구 한국주택은행(주택은행)
      {
        templates: ['XXXX-YY-ZZZZZC', 'XXXX-YY-ZZZZZZZC'],
        yCodes: [
          '01',
          '02',
          '25',
          '06',
          '18',
          '37',
          '90',
          '07', // 주택청약저축
        ],
      },
      // 구 국민은행 / 현행 국민은행
      {
        templates: ['XXX-YY-ZZZZ-ZZC', 'XXXXYY-ZZ-ZZZZZC'],
        yCodes: [
          '01',
          '02',
          '24',
          '05',
          '04',
          '25',
          '26',
          '92', // 수납전용 가상계좌
          '07', // 주택청약저축
        ],
        additionalRules: [(n) => n.startsWith('0')],
      },
    ],
  },

  /**
   * 수협은행
   */
  {
    code: '007',
    slug: 'suhyup',
    name: '수협은행',
    shortName: '수협',
    englishName: 'Suhyup Bank',
    category: 'special',
    patterns: [
      // 구 수협 XXX-YY-ZZZZZ-C
      {
        templates: ['XXX-YY-ZZZZZ-C'],
        yCodes: ['01', '02', '06', '08'],
      },
      // 현행 수협 YYYZ-ZZZZ-ZZZC
      {
        templates: ['YYYZ-ZZZZ-ZZZC'],
        yCodes: [
          '101',
          '201',
          '102',
          '202',
          '209',
          '103',
          '208',
          '106',
          '108',
          '113',
          '114',
          '206',
        ],
        additionalRules: [(n) => n.startsWith('0') && n.length === 12],
      },
      // 가상계좌 XXX-YY-ZZZZZZZZ-C
      {
        templates: ['XXX-YY-ZZZZZZZZ-C'],
        yCodes: ['40'],
      },
    ],
  },

  /**
   * 하나은행
   */
  {
    code: '081',
    slug: 'hana',
    name: '하나은행',
    shortName: '하나',
    englishName: 'Hana Bank',
    category: 'bank',
    patterns: [
      // 구 외환은행 XXX-YY-ZZZZZ-C (11자리)
      {
        templates: ['XXX-YY-ZZZZZ-C'],
        yCodes: [
          '13',
          '33',
          '18',
          '38',
          '19',
          '39',
          '26',
          '11',
          '22',
          '15', // 정기적금
          '23', // 부금
          '24', // 근로자우대저축
          '29', // 장기주택마련저축
          '70', // 연금신탁
          '73', // 적립식목적신탁
          '74', // 기업금전신탁
          '75', // 가계금전신탁
          '77', // 노후연금신탁
        ],
      },
      // 구 외환은행 YYY-ZZZZZZ-ZZC (12자리)
      {
        templates: ['YYY-ZZZZZZ-ZZC'],
        yCodes: [
          '611',
          '610',
          '620',
          '600',
          '601',
          '630',
          '621',
          '631',
          '810', // 정기적금
          '811', // 자유적립식적금
          '817', // 부금
          '818', // 부금
          '814', // 근로자우대저축
          '815', // 장기주택마련저축
          '704', // 기업금전신탁
          '705', // 가계금전신탁
          '707', // 노후연금신탁
          '700', // 신탁기타
          '703', // 신탁기타
          { from: 710, to: 716 }, // 신탁기타
        ],
      },
      // 나머지 일반계좌 XXX-ZZZZZZ-ZZCYY
      {
        templates: ['XXX-ZZZZZZ-ZZCYY'],
        yCodes: [
          '05',
          '07',
          '08',
          '02',
          '01',
          '04',
          '94',
          '37', // 가상계좌
          '32', // 외화통장
          '60', // ISA
        ],
      },
    ],
  },

  /**
   * NH농협은행
   */
  {
    code: '011',
    slug: 'nonghyup',
    name: 'NH농협은행',
    shortName: 'NH농협',
    englishName: 'NongHyup Bank',
    category: 'bank',
    patterns: [
      // XXX-YY-ZZZZZC / XXXX-YY-ZZZZZC
      {
        templates: ['XXX-YY-ZZZZZC', 'XXXX-YY-ZZZZZC'],
        yCodes: [
          '01',
          '02',
          '12',
          '06',
          '05',
          '17',
          // 적금
          '04',
          '10',
          '14',
          '21',
          '24',
          '34',
          '45',
          '47',
          '49',
          '59',
          '80',
          // 신탁
          '28',
          '31',
          '43',
          '46',
          '79',
          '81',
          '86',
          '87',
          '88',
        ],
      },
      // 계좌번호가 13자리인 경우 과목코드 앞에 3을 붙여 3자리로 만든다.
      {
        templates: ['YYY-ZZZZ-ZZZZ-CT'],
        yCodes: [
          '301',
          '302',
          '312',
          '306',
          '305',
          '317',
          '304',
          '310',
          '314',
          '321',
          '324',
          '334',
          '345',
          '347',
          '349',
          '359',
          '380',
          '028',
          '031',
          '043',
          '046',
          '079',
          '081',
          '086',
          '087',
          '088',
        ],
      },
      // 가상계좌
      {
        templates: ['XXXXXX-YY-ZZZZZC', 'YYY-ZZZZ-ZZZZ-ZZC'],
        yCodes: ['64', '65', '790', '791'],
      },
    ],
  },

  /**
   * 농협중앙회
   */
  {
    code: '012',
    slug: 'nonghyup-central',
    name: '농협중앙회',
    shortName: '농협중앙회',
    englishName: 'NongHyup Central',
    category: 'mutual',
    patterns: [
      // 구계좌 XXXXXX-YY-ZZZZZC / 신계좌 YYY-ZZZZ-ZZZZ-CT
      {
        templates: ['XXXXXX-YY-ZZZZZC', 'YYY-ZZZZ-ZZZZ-CT'],
        yCodes: [
          '51',
          '52',
          '56',
          '55',
          '351',
          '352',
          '356',
          '355',
          // 적금
          '354',
          '360',
          '384',
          '394',
          '398',
          // 신탁
          '028',
        ],
      },
      // 가상계좌
      {
        templates: ['XXXXXX-YY-ZZZZZC', 'YYY-ZZZZ-ZZZZ-ZZC'],
        yCodes: ['66', '67', '792'],
      },
    ],
  },

  /**
   * 우리은행
   */
  {
    code: '020',
    slug: 'woori',
    name: '우리은행',
    shortName: '우리',
    englishName: 'Woori Bank',
    category: 'bank',
    patterns: [
      // 통합 우리은행 SYYY-CZZ-ZZZZZZ (13자리)
      {
        templates: ['SYYY-CZZ-ZZZZZZ'],
        yCodes: ['006', '007', '002', '004', '003', '005'],
        additionalRules: [(n) => n.startsWith('1')],
      },
      // 연계계좌 XXX-BBBBBC-YY-ZZC (14자리)
      {
        templates: ['XXX-BBBBBC-YY-ZZC'],
        yCodes: ['18', '92'],
      },
      // 구 한국상업은행 XXX-YY-ZZZZZC (11자리)
      {
        templates: ['XXX-YY-ZZZZZC'],
        yCodes: ['006', '007', '002', '004', '003', '005'],
      },
      // 구 한일은행 XXX-BBBBBB-YY-ZZC (14자리)
      {
        templates: ['XXX-BBBBBB-YY-ZZC'],
        yCodes: ['01', '15', '02', '12', '04', '03', '13'],
      },
      // 구 평화은행 XXX-YY-ZZZZZZC (12자리)
      {
        templates: ['XXX-YY-ZZZZZZC'],
        yCodes: ['01', '21', '24', '05', '04', '25', '09'],
      },
    ],
  },

  /**
   * SC제일은행
   */
  {
    code: '023',
    slug: 'sc-jeil',
    name: 'SC제일은행',
    shortName: 'SC제일',
    englishName: 'Standard Chartered Korea',
    category: 'bank',
    patterns: [
      // XXX-YY-ZZZZZC
      {
        templates: ['XXX-YY-ZZZZZC'],
        yCodes: ['10', '20', '30', '85'],
      },
      // 가상계좌 XXX-YY-ZZZZZZZZC
      {
        templates: ['XXX-YY-ZZZZZZZZC'],
        yCodes: ['15', '16'],
      },
    ],
  },

  /**
   * 한국씨티은행
   */
  {
    code: '027',
    slug: 'citi',
    name: '한국씨티은행',
    shortName: '씨티',
    englishName: 'Citibank Korea',
    category: 'bank',
    patterns: [
      // 통합 씨티은행(개인) XXX-ZZZZZ-YYC-ZZ / 구 한미은행 XXX-ZZZZZ-YYC
      {
        templates: ['XXX-ZZZZZ-YYC-ZZ'],
        yCodes: [
          '01',
          '11',
          '21',
          '25',
          '31',
          '42',
          '51',
          '71',
          '81',
          '23',
          '05',
          '06',
          '15',
          '26',
          '29',
          '07',
          '27',
          '55',
          '99',
          '03',
          '13',
          '33',
          '41',
          '43',
          '53',
          '63',
          '24',
        ],
      },
      // 구 씨티은행 XX-YY-ZZZZZC, Y-ZZZZZZ-ZZC
      {
        templates: ['XX-YY-ZZZZZC', 'Y-ZZZZZZ-ZZC'],
        yCodes: [
          '20',
          '21',
          '32',
          '34',
          { from: 36, to: 38 },
          '42',
          '46',
          '70',
          '71',
          { from: 72, to: 78 },
          '80',
          '81',
          { from: 83, to: 88 },
          { from: 91, to: 96 },
          '99',
          '30',
          '33',
          '35',
          '41',
          { from: 43, to: 45 },
          { from: 50, to: 58 },
          '63',
          '64',
          { from: 60, to: 69 },
          '40',
          '48',
          '00',
          '01',
          '02',
          '03',
          '04',
          '05',
          '06',
          '07',
          '08',
          '09',
          { from: 10, to: 19 },
          '59',
        ],
      },
      // 통합 씨티은행(기업) T-BBBBBB-CYY-ZZ
      {
        templates: ['T-BBBBBB-CYY-ZZ'],
        yCodes: ['25', '41', '24', '18'],
      },
    ],
  },

  /**
   * 아이엠뱅크 (구 대구은행)
   */
  {
    code: '031',
    slug: 'daegu',
    name: '아이엠뱅크',
    shortName: '아이엠뱅크',
    englishName: 'iM Bank',
    category: 'regional',
    patterns: [
      {
        templates: [
          'YY-ZZZZZZZZZZZ',
          'XXX-YY-ZZZZZZC',
          'YYY-ZZ-ZZZZZZC',
          'XXX-YY-ZZZZZZ-ZZZ',
        ],
        yCodes: [
          '05',
          { from: 91, to: 94 },
          '96',
          '08',
          '02',
          '01',
          '04',
          '505',
          '508',
          '502',
          '501',
          '504',
          '06',
          '13',
          '14',
          '19',
          '519',
          '20',
          '520',
          '21',
          '521',
          '524',
          '25',
          '525',
          '27',
          '527',
          '28',
          '528',
          '937',
        ],
      },
    ],
  },

  /**
   * 부산은행
   */
  {
    code: '032',
    slug: 'busan',
    name: '부산은행',
    shortName: '부산',
    englishName: 'Busan Bank',
    category: 'regional',
    patterns: [
      {
        templates: ['XXX-YYY-ZZZZZC', 'ZYYY-ZZZ-ZZZZZZC'],
        yCodes: [
          '107',
          '108',
          '109',
          '121',
          '123',
          '124',
          '122',
          '103',
          '101',
          '127',
          '716',
        ],
      },
    ],
  },

  /**
   * 새마을금고
   */
  {
    code: '045',
    slug: 'kfcc',
    name: '새마을금고',
    shortName: '새마을금고',
    englishName: 'KFCC',
    category: 'mutual',
    patterns: [
      // 구 13자리 XXXX-YY-ZZZZZZ-C
      {
        templates: ['XXXX-YY-ZZZZZZ-C'],
        yCodes: ['09', '10', '13', '37'],
      },
      // 구 14자리 XXXX-YYY-ZZZZZZ-C
      {
        templates: ['XXXX-YYY-ZZZZZZ-C'],
        yCodes: [
          { from: 801, to: 810 },
          { from: 851, to: 860 },
        ],
      },
      // 현행 9YYY-ZZZZ-ZZZZ-C
      {
        templates: ['9YYY-ZZZZ-ZZZZ-C'],
        yCodes: [
          '002',
          '003',
          '004',
          '072',
          '090',
          '091',
          '092',
          '093',
          '200',
          '202',
          '205',
          { from: 207, to: 210 },
          '212',
          '005',
        ],
        additionalRules: [(n) => n.startsWith('9')],
      },
    ],
  },

  /**
   * 신한은행
   */
  {
    code: '088',
    slug: 'shinhan',
    name: '신한은행',
    shortName: '신한',
    englishName: 'Shinhan Bank',
    category: 'bank',
    patterns: [
      // 신계좌 YYY-ZZZ-ZZZZZC
      {
        templates: ['YYY-ZZZ-ZZZZZC'],
        yCodes: [
          { from: 100, to: 109 },
          '160',
          '161',
          { from: 110, to: 139 },
          { from: 155, to: 159 },
          { from: 150, to: 154 },
          { from: 140, to: 149 },
          // 외화예금
          '180',
          // 청년희망펀드 공익신탁
          '298',
          '268',
          '269',
        ],
      },
      // 신계좌(가상) YYY-TTT-ZZZZZZZC
      {
        templates: ['YYY-TTT-ZZZZZZZC'],
        yCodes: ['560', '561', '562'],
      },
      // 구 조흥은행 XXX-YY-ZZZZZC / 구 조흥은행(가상) XXX-YY-ZZZZZZZC
      {
        templates: ['XXX-YY-ZZZZZC', 'XXX-YY-ZZZZZZZC'],
        yCodes: [
          '01',
          '09',
          '61',
          '04',
          '05',
          '06',
          '08',
          '02',
          '07',
          '03',
          // 가상
          '81',
          '82',
        ],
      },
      // 구 신한은행(가상포함) XXX-YY-ZZZZZC
      {
        templates: ['XXX-YY-ZZZZZC'],
        yCodes: [
          '01',
          '02',
          '11',
          '13',
          '12',
          '03',
          '04',
          '05',
          // 가상
          '99',
        ],
      },
      // 구 신한은행(가상) XXX-YYY-ZZZZZZZC
      {
        templates: ['XXX-YYY-ZZZZZZZC'],
        yCodes: ['901'],
      },
    ],
  },

  /**
   * 케이뱅크
   */
  {
    code: '089',
    slug: 'kbank',
    name: '케이뱅크',
    shortName: 'K뱅크',
    englishName: 'K Bank',
    category: 'internet-bank',
    patterns: [
      // 일반 YYY-YNN-NNZZZZ
      {
        templates: ['YYY-YNN-NNZZZZ'],
        yCodes: ['1002', '1005'],
      },
    ],
  },

  /**
   * 카카오뱅크
   */
  {
    code: '090',
    slug: 'kakaobank',
    name: '카카오뱅크',
    shortName: '카카오뱅크',
    englishName: 'Kakao Bank',
    category: 'internet-bank',
    patterns: [
      // 업무구분(T) + 과목코드(Y) — starts with 3
      {
        templates: ['TYYY-ZZ-ZZZZZZZ'],
        yCodes: ['333', '388', '355', '310'],
        additionalRules: [(n) => n.startsWith('3')],
      },
      // starts with 7
      {
        templates: ['TYYY-ZZ-ZZZZZZZ'],
        yCodes: ['777', '979'],
        additionalRules: [(n) => n.startsWith('7')],
      },
      // starts with 9
      {
        templates: ['TYYY-ZZ-ZZZZZZZ'],
        yCodes: ['101'],
        additionalRules: [(n) => n.startsWith('9')],
      },
    ],
  },

  /**
   * 토스뱅크
   */
  {
    code: '092',
    slug: 'toss',
    name: '토스뱅크',
    shortName: '토스뱅크',
    englishName: 'Toss Bank',
    category: 'internet-bank',
    patterns: [
      {
        templates: ['YYYZ-ZZZZ-ZZZC'],
        yCodes: ['100', '106', '300', '150', '700'],
        additionalRules: [(n) => n[3] === '8' || n[3] === '0'],
      },
      // 가상계좌 (17/19)ZZ-ZZZZ-ZZZZ
      {
        templates: ['17ZZ-ZZZZ-ZZZZ', '19ZZ-ZZZZ-ZZZZ'],
        additionalRules: [
          (n) => n.startsWith('17') || n.startsWith('19'),
        ],
      },
    ],
  },
] as const
