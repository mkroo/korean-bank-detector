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

### 지원 기관 및 로고 커버리지 (v0.1.0)

총 17개 기관, **symbol 17개 / wordmark 17개 (100% 커버리지)**. 각 행에서 로고 이미지는 실제 번들된 SVG (jsdelivr CDN 경유)이며, 옆 셀에 출처가 링크되어 있습니다. 공식 BI 페이지가 있는 경우 그쪽을 우선 참조합니다.

| 코드 | 기관명 | symbol | wordmark | 출처 |
|:-:|---|:-:|:-:|---|
| `002` | KDB산업은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/kdb.svg" height="32" alt="KDB symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/kdb.svg#gh-light-mode-only" height="24" alt="KDB wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/kdb.png#gh-dark-mode-only" height="24" alt="KDB wordmark"/> | [KDB CI](https://www.kdb.co.kr/BZCOWS00N00.act?_mnuId=IHIHIR0006&wcmsPath=/hmp/ch/bi/bi/CHBIBI0500.html) |
| `003` | IBK 기업은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/ibk.svg" height="32" alt="IBK symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/ibk.svg#gh-light-mode-only" height="24" alt="IBK wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/ibk.png#gh-dark-mode-only" height="24" alt="IBK wordmark"/> | [IBK CI](https://www.ibk.co.kr/common/navigation.ibk?linkUrl=/intro/announce/ci.jsp&pageId=IR01060000) |
| `004` | KB국민은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/kookmin.svg" height="32" alt="KB symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/kookmin.svg#gh-light-mode-only" height="24" alt="KB wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/kookmin.png#gh-dark-mode-only" height="24" alt="KB wordmark"/> | [KB금융 CI](https://www.kbfg.com/kor/about/corporate/ci.htm) |
| `007` | 수협은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/suhyup.svg" height="32" alt="Suhyup symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/suhyup.svg#gh-light-mode-only" height="24" alt="Suhyup wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/suhyup.png#gh-dark-mode-only" height="24" alt="Suhyup wordmark"/> | [수협 BI](https://www.suhyup.co.kr/suhyup/250/subview.do) |
| `011` | NH농협은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/nonghyup.svg" height="32" alt="NH symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/nonghyup.svg#gh-light-mode-only" height="24" alt="NH wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/nonghyup.png#gh-dark-mode-only" height="24" alt="NH wordmark"/> | [농협 BI](https://www.nonghyup.com/introduce/ci/symbol.do) |
| `012` | 농협중앙회 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/nonghyup-central.svg" height="32" alt="NACF symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/nonghyup-central.svg#gh-light-mode-only" height="24" alt="NACF wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/nonghyup-central.png#gh-dark-mode-only" height="24" alt="NACF wordmark"/> | [농협 BI](https://www.nonghyup.com/introduce/ci/symbol.do) |
| `020` | 우리은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/woori.svg" height="32" alt="Woori symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/woori.svg#gh-light-mode-only" height="24" alt="Woori wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/woori.png#gh-dark-mode-only" height="24" alt="Woori wordmark"/> | [우리은행 BI](https://spot.wooribank.com/pot/Dream?withyou=BPBKI0056) |
| `023` | SC제일은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/sc-jeil.svg" height="32" alt="SC symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/sc-jeil.svg#gh-light-mode-only" height="24" alt="SC wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/sc-jeil.png#gh-dark-mode-only" height="24" alt="SC wordmark"/> | [Standard Chartered](https://www.sc.com) |
| `027` | 한국씨티은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/citi.svg" height="32" alt="Citi symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/citi.svg#gh-light-mode-only" height="24" alt="Citi wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/citi.png#gh-dark-mode-only" height="24" alt="Citi wordmark"/> | [Citi Brand](https://www.citigroup.com) |
| `031` | 아이엠뱅크 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/daegu.svg" height="32" alt="iM symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/daegu.svg#gh-light-mode-only" height="24" alt="iM wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/daegu.png#gh-dark-mode-only" height="24" alt="iM wordmark"/> | [iM 금융그룹 CI](https://www.imfngroup.com/rc0202.fg) |
| `032` | 부산은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/busan.svg" height="32" alt="Busan symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/busan.svg#gh-light-mode-only" height="24" alt="Busan wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/busan.png#gh-dark-mode-only" height="24" alt="Busan wordmark"/> | [부산은행 CI](https://www.busanbank.co.kr/ib20/mnu/BHPBKI400004001) |
| `045` | 새마을금고 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/kfcc.svg" height="32" alt="KFCC symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/kfcc.svg#gh-light-mode-only" height="24" alt="KFCC wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/kfcc.png#gh-dark-mode-only" height="24" alt="KFCC wordmark"/> | [새마을금고 CI](https://www.kfcc.co.kr/cc/corporateIdentity.do) |
| `081` | 하나은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/hana.svg" height="32" alt="Hana symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/hana.svg#gh-light-mode-only" height="24" alt="Hana wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/hana.png#gh-dark-mode-only" height="24" alt="Hana wordmark"/> | [하나금융 CI](https://www.hanafn.com/hfm/mnu/aboutus/hanaFnCi.do) |
| `088` | 신한은행 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/shinhan.svg" height="32" alt="Shinhan symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/shinhan.svg#gh-light-mode-only" height="24" alt="Shinhan wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/shinhan.png#gh-dark-mode-only" height="24" alt="Shinhan wordmark"/> | [신한금융 CI](https://shinhangroup.com/kr/about/identity/ci) |
| `089` | 케이뱅크 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/kbank.svg" height="32" alt="K뱅크 symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/kbank.svg#gh-light-mode-only" height="24" alt="K뱅크 wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/kbank.png#gh-dark-mode-only" height="24" alt="K뱅크 wordmark"/> | [케이뱅크 브랜드](https://www.kbanknow.com/ib20/mnu/HOMBKI030000) |
| `090` | 카카오뱅크 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/kakaobank.svg" height="32" alt="카카오뱅크 symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/kakaobank.svg#gh-light-mode-only" height="24" alt="카카오뱅크 wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/kakaobank.png#gh-dark-mode-only" height="24" alt="카카오뱅크 wordmark"/> | [카카오뱅크 BI](https://www.kakaobank.com/view/about/brand/resource) |
| `092` | 토스뱅크 | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/symbol/toss.svg" height="32" alt="Toss symbol"/> | <img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/wordmark/toss.svg#gh-light-mode-only" height="24" alt="Toss wordmark"/><img src="https://raw.githubusercontent.com/mkroo/korean-bank-detector/claude/adoring-williamson-6b92a4/assets/logos/png/wordmark-card/toss.png#gh-dark-mode-only" height="24" alt="Toss wordmark"/> | [토스 브랜드](https://brand.toss.im) |

**참고**:

- 로고 이미지는 [jsdelivr CDN](https://www.jsdelivr.com/)을 통해 본 저장소의 `assets/logos/`에서 직접 서빙됩니다 (GitHub raw URL은 README에서 안정적으로 렌더되지 않습니다).
- 모든 자산은 각 기관의 공식 BI/CI 페이지에서 받은 자료로 생성되었습니다.
- **AI 기반 (KDB·IBK·KB·신한)**: 공식 `.ai` 파일을 `pdftocairo`로 SVG 변환 후 viewBox crop으로 심볼/워드마크를 추출했습니다. KDB 심볼은 그라데이션이 그대로 보존됩니다.
- **공식 SVG 그대로 (우리·케이뱅크)**: BI 페이지가 SVG를 직접 제공하는 경우 변환 없이 사용했습니다.
- **raster trace (iM·부산·새마을금고·수협·토스·우리 심볼)**: 공식 BI 페이지의 raster 자산을 `potrace`로 모노크롬 벡터 트레이싱한 후 브랜드 컬러로 채색했습니다. 그라데이션은 보존되지 않으나 실루엣과 컬러는 공식 자산과 일치합니다.

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
