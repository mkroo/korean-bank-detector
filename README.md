# korean-bank-detector

한국 계좌번호로 금융기관(이름·KFTC 코드·SVG 로고)을 판별하는 pure-TypeScript ESM 라이브러리. 토스 결제 화면처럼 동작.

[![npm version](https://img.shields.io/npm/v/korean-bank-detector.svg)](https://www.npmjs.com/package/korean-bank-detector)
[![CI](https://github.com/mkroo/korean-bank-detector/actions/workflows/ci.yml/badge.svg)](https://github.com/mkroo/korean-bank-detector/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

🌐 **[라이브 데모](https://mkroo.com/korean-bank-detector/)** — 브라우저에서 바로 사용해보기.

## 특징

- KFTC CMS 계좌번호체계 공식 데이터 기반
- 17개 주요 금융기관 (시중은행·인터넷전문은행·일부 지방은행·상호금융 포함)
- 공식 브랜드 로고 SVG 번들
- Tree-shake 친화 (`korean-bank-detector/logos/<code>` sub-path import)
- 의존성 0개, ESM only, TypeScript 타입 동봉

## 설치

```bash
pnpm add korean-bank-detector
# or: npm i korean-bank-detector / yarn add korean-bank-detector
```

요구사항: Node 20+ (ESM 환경)

## 빠르게 시작

```ts
import { detect, detectOne } from 'korean-bank-detector'

const results = detect('110-436-387740')
// → [{ institution: { code: '088', name: '신한은행', ... }, logo: '<svg ...>', confidence: 1.0, ... }]

const top = detectOne('110-436-387740')
console.log(top?.institution.name) // '신한은행'
```

### React에서 로고 표시

```tsx
const top = detectOne(accountNumber)
const svg = top?.logo.symbol ?? top?.logo.wordmark
return svg ? <span dangerouslySetInnerHTML={{ __html: svg }} /> : null
```

### 트리쉐이킹 친화 sub-path import

특정 은행 로고만 필요할 때 전체 데이터셋 번들 회피:

```ts
import shinhanSymbol from 'korean-bank-detector/logos/symbol/088'
import shinhanWordmark from 'korean-bank-detector/logos/wordmark/088'
// 둘 다 string (SVG)
```

### 로고 변형 (variant)

각 기관은 두 변형으로 제공됩니다:

- **symbol** (정사각 심볼마크) — UI의 작은 슬롯, 리스트 아이콘에 적합. 토스 결제 화면과 비슷한 룩.
- **wordmark** (가로형 lockup) — 푸터, 마케팅, 영수증 등 가로 공간에 적합.

```ts
const result = detectOne(accountNumber)
// result.logo: { symbol: string | null, wordmark: string | null }

getInstitutionLogo('088')              // symbol (기본값)
getInstitutionLogo('088', 'symbol')    // symbol 명시
getInstitutionLogo('088', 'wordmark')  // wordmark
```

## API

| 함수 | 시그니처 | 설명 |
|---|---|---|
| `detect` | `(input: string) => DetectResult[]` | 모든 후보를 confidence 내림차순으로 반환 |
| `detectOne` | `(input: string) => DetectResult \| null` | 최상위 후보 |
| `getInstitution` | `(code: string) => Institution \| null` | 코드로 기관 조회 |
| `getInstitutionLogo` | `(code: string, variant?: 'symbol' \| 'wordmark') => string \| null` | 코드로 SVG 조회 (기본 symbol) |
| `ALL_INSTITUTIONS` | `readonly Institution[]` | 전체 기관 메타데이터 |

타입 상세는 `src/types.ts` 참조.

## 동작 원리

1. 입력에서 하이픈·공백·점·언더스코어를 제거하고 숫자만 남김. 비숫자 잔여 문자가 있으면 빈 결과.
2. 각 기관은 1개 이상의 `Pattern`을 보유. Pattern은 `templates[]`(예: `YYY-ZZZ-ZZZZZC`)와 선택적 `yCodes`/`additionalRules`로 구성.
3. 점수 계산:
   - 정규화된 입력 길이가 템플릿 길이와 일치 → +1
   - 템플릿의 `Y+` 위치 값이 `yCodes` (문자열 또는 `{from, to}` 범위) 중 하나와 일치 → +1
   - 각 `additionalRules` 술어가 `true` 반환 → +1
4. 기관 점수 = 모든 패턴 중 최댓값.
5. confidence = `min(score / 2, 1.0)` 후 소수 셋째 자리 반올림. 기관별로 confidence 내림차순 정렬, 동률은 선언 순서 유지.

내부 구현은 [`src/detect.ts`](./src/detect.ts)에서 확인할 수 있습니다.

## 번들 사이즈 / Tree-shaking

| 임포트 방식 | gzip 추정 |
|---|---|
| `import { detect } from 'korean-bank-detector'` (전체 로고 포함) | ~30KB |
| `import shinhanLogo from 'korean-bank-detector/logos/088'` (단일 로고) | ~1KB |

## 지원 기관

전체 목록은 `ALL_INSTITUTIONS` 배열 또는 [`src/data/institutions.ts`](./src/data/institutions.ts) 참조.

현재 v0.1.0에서는 시중은행·인터넷전문은행·지방은행·상호금융 17개 기관을 지원합니다. 증권사 지원은 v0.2.0 로드맵에 포함되어 있습니다.

### 로고 커버리지 (v0.1.0)

| 변형 | 확보 | 누락 |
|---|---|---|
| **symbol** (정사각 심볼마크) | 9개 | 8개 |
| **wordmark** (가로 lockup) | 13개 | 4개 |

- **symbol** 확보: NH농협, 농협중앙회, IBK, 하나, 카카오뱅크, K뱅크, SC제일, 우리, 씨티
- **wordmark** 확보: 위 9개 + 신한, KB국민, 토스뱅크, 수협
- **둘 다 누락**: KDB산업(002), 아이엠뱅크(031), 부산은행(032), 새마을금고(045) — 공식 SVG가 JPG/AI/PNG로만 제공됨

누락된 로고는 [logo PR 가이드](./CONTRIBUTING.md#새-로고-추가수정-simple-icons-모델)에 따라 공식 BI/CI에서 SVG가 확보되는 대로 patch 릴리스에 추가됩니다.

새 기관 추가가 필요하면 [Issue 등록](https://github.com/mkroo/korean-bank-detector/issues/new?template=institution_request.yml)하거나 PR을 보내주세요. 자세한 절차는 [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## 상표 안내

본 패키지에 포함된 모든 로고는 각 금융기관의 상표이며, 식별 목적의 fair use로만 번들되어 있습니다. 각 기관의 endorsement를 의미하지 않습니다. 상세는 [`TRADEMARKS.md`](./TRADEMARKS.md).

## 기여

PR 환영합니다. 절차는 [`CONTRIBUTING.md`](./CONTRIBUTING.md). 행동 강령은 Contributor Covenant v2.1, [`CODE_OF_CONDUCT.md`](./.github/CODE_OF_CONDUCT.md).

## 라이선스

코드는 [MIT](./LICENSE). 로고는 각 기관 상표 정책 적용.

## Acknowledgements

- [jhaemin/korea-financial-account-number-detector](https://github.com/jhaemin/korea-financial-account-number-detector) — 매칭 알고리즘 및 패턴 데이터에 영감을 준 레퍼런스
- [simple-icons](https://github.com/simple-icons/simple-icons) — 브랜드 아이콘 정책 모델
- [금융결제원 (KFTC)](https://www.kftc.or.kr) — 공식 계좌번호체계 데이터
