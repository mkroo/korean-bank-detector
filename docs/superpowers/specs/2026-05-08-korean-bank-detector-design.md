# korean-bank-detector — Design

**Status**: Approved (2026-05-08)
**Owner**: @mkroo
**Repo**: https://github.com/mkroo/korean-bank-detector

## 1. Purpose

토스 결제 화면처럼 사용자가 입력한 한국 계좌번호 문자열로부터 해당 금융기관을
판별하고, 기관 메타데이터(코드·이름)와 공식 브랜드 로고(SVG)까지 한 번에
반환하는 **순수 TypeScript** npm 패키지를 제공한다.

## 2. Scope

### In scope (v0.1.0)

- 계좌번호 문자열 → 후보 금융기관 ranked list 반환
- KFTC CMS 계좌번호체계 기반 패턴 매칭
- 은행 + 상호금융 + 증권사 (KFTC 등록 기관)
- 각 기관의 공식 브랜드 로고를 SVG 문자열로 제공
- Sub-path import로 개별 로고 tree-shake 가능
- ESM only, Node 20+, TypeScript 5+

### Out of scope (v0.1.0)

- 실시간 계좌 실명조회 (KFTC 유료 API 영역)
- 카드 BIN 인식 (binking 등 별도 영역)
- IBAN/SWIFT 처리 (해외 송금 영역)
- React/Vue/Svelte 컴포넌트 바인딩 — **v0.2 이후 별도 sub-path로 추가 검토**
- 계좌 유효성 체크섬 (KFTC 표준에 통일된 체크섬 알고리즘 없음)

## 3. Public API

### 3.1 Main entry — `korean-bank-detector`

```ts
export function detect(input: string): DetectResult[]
export function detectOne(input: string): DetectResult | null
export function getInstitution(code: string): Institution | null
export function getInstitutionLogo(code: string): string | null
export const ALL_INSTITUTIONS: readonly Institution[]

export type Institution = {
  code: string          // KFTC 3자리 (e.g. "088")
  name: string          // 정식 명칭 (e.g. "신한은행")
  shortName: string     // 짧은 명칭 (e.g. "신한")
  englishName: string   // (e.g. "Shinhan Bank")
  category: InstitutionCategory
  slug: string          // 파일·import 키 (e.g. "shinhan")
}

export type InstitutionCategory =
  | 'bank'           // 시중은행
  | 'internet-bank'  // 인터넷전문은행
  | 'regional'       // 지방은행
  | 'special'        // 특수은행 (산업/기업/수협 등)
  | 'mutual'         // 상호금융 (새마을·신협·산림 등)
  | 'securities'     // 증권사

export type DetectResult = {
  institution: Institution
  logo: string          // SVG 문자열
  confidence: number    // 0~1
  matchedPattern: string // 디버깅·UI 보조용
}
```

### 3.2 Sub-path entry — `korean-bank-detector/logos/<code>`

각 기관 로고를 개별 ESM 모듈로 노출하여 bundler tree-shake에 최적화.

```ts
// import shinhanLogo from 'korean-bank-detector/logos/088'
// shinhanLogo: string  (SVG 문자열)
export default svgString
```

### 3.3 Behavior contract

- **Input normalization**: 하이픈, 공백, 점, 언더스코어 제거. 숫자만 남김.
  비숫자 잔여 문자가 있으면 빈 결과(`[]`).
- **Empty / too-short input**: `[]` 반환 (throw 안 함).
- **No match**: `[]` 반환.
- **Multiple matches**: confidence 내림차순 정렬. 동률은 안정 정렬 (선언 순서 유지).
- **`detectOne`**: `detect()[0] ?? null`.

### 3.4 Confidence scoring

```
let MAX_PREFIX = max(p.prefix.length for all institutions p)   // 데이터셋 상수

prefix_score = matched_prefix_length / MAX_PREFIX               // 0~1

length_factor = 1.2  if input.length matches one of pattern.lengths exactly
              = 1.0  otherwise (input still partial or over)

confidence = min(prefix_score * length_factor, 1.0)
```

특성:
- prefix가 길수록(=더 구체적일수록) 높은 점수
- 입력 길이가 정확히 맞으면 동일 prefix 후보들 사이에서 우위
- 부분 입력(타이핑 중)에서도 단조 증가 (사용자 UX와 정합)
- `MAX_PREFIX`는 빌드 시점에 상수화 가능 (기관 데이터 변경 시 자동 갱신)

설명 가능성 우선. 정교한 ML/통계 기반은 도입하지 않는다.

## 4. Data Model

### 4.1 Institution record (internal)

```ts
type Pattern = {
  prefix: string        // 숫자 prefix
  lengths: number[]     // 허용 총 자릿수
}

type InstitutionRecord = Institution & {
  patterns: Pattern[]
}

// src/data/institutions.ts
export const INSTITUTIONS: readonly InstitutionRecord[] = [
  // KFTC CMS 계좌번호체계 (2026.03.24) 전수 매핑
]
```

데이터는 정적 const로 코드 안에 인라인. JSON 분리하지 않음 (타입 안전성 + tree-shake 친화).

### 4.2 데이터 출처

- **금융결제원 (KFTC) CMS 계좌번호체계** 공식 문서 (2026.03.24 기준)
- 기존 Encore 프로젝트의 `web/src/constants/banks.ts` 시드 활용 (코드·이름)
- 패턴(prefix·length)은 KFTC 문서에서 직접 추출
- 증권사 패턴은 KFTC 등록 기관 표 참조

### 4.3 로고 자산

- **출처**: 각 금융기관 공식 홈페이지의 BI/CI 페이지에서 SVG 또는 고해상 PNG → SVG 변환
- **저장**: `assets/logos/<slug>.svg` (저장소에 commit, 라이선스 추적용)
- **최적화**: 빌드 시점에 SVGO로 압축 → `dist/logos/<code>.js`로 내보냄
- **상표 고지**: README와 `TRADEMARKS.md`에 다음 명문화
  - "Logos are trademarks of respective owners. They are bundled here under fair use for identification purposes only and do not imply endorsement."
  - Takedown 채널: GitHub Issues (https://github.com/mkroo/korean-bank-detector/issues)
- **Takedown 정책**: 어떤 기관에서 정중한 사용 중단 요청이 오면 영업일 기준 3일 이내 해당 로고 제거 후 patch 릴리스

## 5. File Layout

```
korean-bank-detector/
├── src/
│   ├── index.ts                # 공개 API 진입점
│   ├── detect.ts               # 매칭/스코어링 로직
│   ├── normalize.ts            # 입력 정제
│   ├── types.ts                # 공개 타입 정의
│   ├── data/
│   │   ├── institutions.ts     # InstitutionRecord 테이블 (수동 관리)
│   │   └── logos.ts            # code → SVG 문자열 맵 (자동 생성, .gitignore)
│   └── logos/                  # sub-path 엔트리 (자동 생성, .gitignore)
│       └── <code>.ts           # 기관당 1파일, default export = SVG 문자열
├── assets/
│   └── logos/
│       └── <slug>.svg          # 원본 SVG (commit)
├── scripts/
│   └── build-logos.ts          # assets/*.svg → src/data/logos.ts + src/logos/<code>.ts
├── tests/
│   ├── detect.test.ts
│   ├── normalize.test.ts
│   ├── institutions.test.ts    # 데이터 일관성 검증
│   └── fixtures/
│       └── account-samples.ts  # 기관별 실제 형식 샘플
├── package.json                # scripts.prebuild = "tsx scripts/build-logos.ts"
├── tsconfig.json
├── tsup.config.ts              # entries: src/index.ts + src/logos/*.ts (glob)
├── vitest.config.ts
├── README.md
├── TRADEMARKS.md
├── LICENSE                     # MIT
├── CHANGELOG.md                # changesets 자동 생성
└── .github/
    └── workflows/
        └── ci.yml              # lint + test + build
```

**빌드 흐름**: `pnpm build` → `prebuild` 훅이 `assets/logos/*.svg`를 SVGO로 최적화 후
`src/data/logos.ts`(전체 맵)와 `src/logos/<code>.ts`(개별 entry)를 생성 → tsup이
모든 entry를 `dist/`로 컴파일. 생성 산출물은 git 추적 안 함 (assets는 commit, dist도
publish 시 포함).

## 6. Build & Distribution

### 6.1 Tooling

| 영역 | 도구 |
|---|---|
| Language | TypeScript 5.x, strict |
| Build | tsup (esbuild 기반) |
| Test | vitest |
| Lint | eslint + @typescript-eslint, prettier |
| Release | changesets |
| CI | GitHub Actions |
| Package manager | pnpm |

### 6.2 `package.json` exports

```json
{
  "name": "korean-bank-detector",
  "type": "module",
  "sideEffects": false,
  "engines": { "node": ">=20" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./logos/*": {
      "types": "./dist/logos/*.d.ts",
      "import": "./dist/logos/*.js"
    }
  }
}
```

### 6.3 Versioning

- v0.x: minor 단위에 breaking change 허용 (changelog에 명시)
- v1.0.0부터 strict semver
- 데이터(기관 추가/패턴 보정)는 patch 릴리스
- API 타입 변경은 minor 릴리스(0.x) 또는 major(1.x+)

## 7. Testing Strategy

### 7.1 Unit tests

- `normalize`: 다양한 입력 정제 케이스
- `detect`: 점수 계산, 동률 처리, 빈 결과, ambiguity

### 7.2 Fixture-based integration tests

- 각 기관마다 실제 계좌번호 형식 샘플 5개
- 각 샘플 → 해당 기관이 1순위 결과인지 검증
- ambiguity 의도된 케이스(prefix 겹치는 은행) → 모든 후보 포함되는지

### 7.3 Data consistency tests

- 모든 기관 record의 code 유일성
- slug 유일성, kebab-case 검증
- 모든 institution에 대응하는 logo 파일 존재 검증
- patterns 배열 비어있지 않음

### 7.4 Coverage target

- Lines / statements: 95%+
- Branches: 90%+

## 8. SEO & Discoverability

`package.json`:

```json
{
  "description": "Detect Korean bank from account number — returns name, KFTC code, and brand logo (SVG). Toss-style.",
  "keywords": [
    "korean", "korea", "bank", "account",
    "detect", "kftc", "logo", "toss", "svg"
  ]
}
```

README 첫 단락에서 "토스 스타일"·"KFTC"·"account number → bank" 키워드 자연스럽게 노출.

## 9. License & Trademarks

- **Code license**: MIT
- **Logo assets**: 각 기관 자산. 저장소는 fair-use 범위에서 호스팅하며 takedown 요청에 응한다.
- 정책 모델: **simple-icons DISCLAIMER 패턴**
- `TRADEMARKS.md`에 다음 명문화:
  - 로고는 각 금융기관 상표이며 식별(identification) 목적의 fair use임. endorsement 의미 없음
  - 사용자가 자신의 사용 케이스에 대한 라이선스 책임을 짐
  - Takedown 채널: GitHub Issues (https://github.com/mkroo/korean-bank-detector/issues)
  - 응답 SLA: 영업일 3일 이내 로고 제거 + patch 릴리스

## 9a. Documentation & Contribution

### 9a.1 언어 정책

- **한국어 단일 README**. 패키지가 한국 local 사용처에 국한되므로 글로벌 번역 부담 회피
- npm 디스커버리는 영문 `description` + `keywords`로 잡음 (Section 8 참조)
- 코드 주석, 커밋 메시지, PR 제목/본문은 영어 (글로벌 OSS 컨벤션)

### 9a.2 README.md 구조

1. 로고 + 배지 (npm version, downloads, CI, MIT)
2. 제목 + 한 줄 소개 (검색 키워드 노출)
3. Features (5 bullets)
4. Installation
5. Quick Start (detect / detectOne / sub-path import 예제)
6. API Reference (간결한 표)
7. Bundle Size & Tree-shaking 가이드
8. Supported Institutions (전체 목록 + 추가 요청 안내)
9. Trademarks (한 단락 + TRADEMARKS.md 링크)
10. Contributing (한 단락 + CONTRIBUTING.md 링크)
11. License + Acknowledgements (jhaemin/korea-financial-account-number-detector 크레딧)

### 9a.3 CONTRIBUTING.md 구조

1. Code of Conduct 링크
2. Getting Started (clone → pnpm install → pnpm test)
3. Project Structure (spec Section 5 인용)
4. Adding/Updating an Institution (KFTC 문서 참조 + fixture 5개)
5. Adding/Updating a Logo (simple-icons 모델: 공식 BI/CI 출처, viewBox 표준화, SVGO, source URL 메타)
6. PR Guidelines (Conventional Commits, 단일 책임 PR, changeset)
7. Issue Templates 안내
8. Trademark Concerns / Takedown
9. Release Process (메인테이너 전용)

### 9a.4 Code of Conduct

- **Contributor Covenant 2.1** 표준 채택
- 원문: https://www.contributor-covenant.org/version/2/1/code_of_conduct/
- `CODE_OF_CONDUCT.md` 파일로 저장

### 9a.5 Issue / PR 템플릿 (`.github/`)

- `ISSUE_TEMPLATE/bug_report.yml`
- `ISSUE_TEMPLATE/institution_request.yml` (새 기관 추가 요청)
- `ISSUE_TEMPLATE/logo_takedown.yml` (상표 takedown 요청 전용)
- `pull_request_template.md`

## 10. Roadmap (informational)

| Version | Focus |
|---|---|
| v0.1.0 | 코어 detect API + 로고 + 은행/상호금융/증권사 데이터 |
| v0.2.0 (검토) | `korean-bank-detector/react` sub-path (피드백 받은 뒤) |
| v0.3.0+ | Vue/Svelte 바인딩 (커뮤니티 수요 시) |
| v1.0.0 | API 안정화 후 strict semver 진입 |

## 11. Non-goals (명시적으로 안 함)

- 실시간 계좌 실명 조회
- 카드 BIN 인식
- IBAN / SWIFT
- 한 패키지에서 모든 framework wrapper 포함 (sub-path로 분리)
- 계좌 유효성 체크섬 검증 (KFTC 표준에 통일된 알고리즘 없음)

## 12. Open Questions

현재 미해결 항목 없음. 모든 주요 결정은 합의 완료 (브레인스토밍 세션 2026-05-08).
