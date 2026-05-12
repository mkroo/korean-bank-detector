# Contributing to korean-bank-detector

기여해주셔서 감사합니다. 본 문서는 새 기관 추가, 로고 추가/수정, 버그 수정 PR 작성 절차를 안내합니다.

## 행동 강령

본 프로젝트는 [Contributor Covenant v2.1](.github/CODE_OF_CONDUCT.md)을 따릅니다.

## 시작하기

```bash
git clone https://github.com/mkroo/korean-bank-detector
cd korean-bank-detector
pnpm install
pnpm test
```

요구사항: Node 20+, pnpm 9+.

## 데모 페이지 로컬 실행

`examples/demo`는 라이브러리를 시연하는 Vite 기반 정적 사이트입니다. 두 터미널로 라이브러리 watch + 데모 dev를 함께 띄우면 라이브 HMR을 누릴 수 있습니다.

```bash
# 터미널 1 — 라이브러리 watch
pnpm dev               # tsup --watch (dist/ 갱신)

# 터미널 2 — 데모 dev
pnpm -C examples/demo dev
```

main 푸시 시 GitHub Actions `Deploy Demo` 워크플로가 GitHub Pages로 자동 배포합니다.

## 프로젝트 구조

```
src/
├── data/institutions.ts   # 기관 데이터 (수동 관리)
├── detect.ts              # 매칭/스코어링
├── normalize.ts           # 입력 정제
└── types.ts               # 공개 타입
assets/logos/              # 원본 SVG (slug-named)
scripts/build-logos.ts     # SVG → 빌드 산출물
tests/                     # vitest, fixture 포함
```

자세한 설계는 [`docs/superpowers/specs/2026-05-08-korean-bank-detector-design.md`](./docs/superpowers/specs/2026-05-08-korean-bank-detector-design.md).

## 새 기관 추가

1. **데이터 출처**: [참가기관별 CMS 계좌번호체계](https://www.cmsedi.or.kr/cms/board/workdata) (금융결제원) 공식 문서에서 대표코드, 명칭, 자리수, 계좌번호체계, 과목코드(yCodes)를 확인합니다.
2. `src/data/institutions.ts`에 다음 형식으로 추가합니다 (실제 시드 데이터의 신한·카카오뱅크 항목을 참고하세요):

   ```ts
   {
     code: '088',           // KFTC 3자리 대표코드
     slug: 'shinhan',       // 영문 소문자, kebab-case (파일명·import 키)
     name: '신한은행',
     shortName: '신한',
     englishName: 'Shinhan Bank',
     category: 'bank',      // 'bank' | 'internet-bank' | 'regional' | 'special' | 'mutual' | 'securities'
     patterns: [
       {
         // 템플릿 placeholder: X = 임의 자리, Y = 과목코드 위치, Z = 일련번호, C = 검증번호, T = 거래구분, B = 기타
         // 하이픈은 매칭 시 제거됩니다.
         templates: ['YYY-ZZZ-ZZZZZC'],
         yCodes: [
           { from: 100, to: 109 },
           { from: 110, to: 139 },
           '160',
           '161',
         ],
         // 선택: 정규화된 계좌번호 문자열에 대한 추가 술어
         additionalRules: [(n) => n.startsWith('1')],
       },
     ],
   }
   ```

   - `templates`: 한 개 이상 필요. 길이가 정규화된 입력과 일치하면 점수 +1.
   - `yCodes`: 첫 번째 `Y+` 위치의 값이 yCodes 중 하나와 일치하면 점수 +1. 문자열 비교 또는 `{from, to}` 범위 비교.
   - `additionalRules`: 선택. 각 술어가 `true`를 반환하면 점수 +1.
   - 점수 → confidence: `min(score / 2, 1.0)`로 0~1 범위로 환산.

3. (선택) 새 기관에 대한 픽스처 케이스를 추가해 매칭이 제대로 작동하는지 확인합니다.
4. `pnpm test`, `pnpm typecheck`, `pnpm lint` 모두 통과해야 합니다.

## 새 로고 추가/수정 (simple-icons 모델)

본 프로젝트는 각 금융기관의 **공식 BI/CI 페이지에서 직접 다운받은 SVG**만 받습니다. 로고는 두 가지 변형(variant)으로 구분합니다:

| 변형 | 형태 | 사용처 | 저장 경로 |
|---|---|---|---|
| **symbol** | 정사각 심볼마크 only | UI 작은 슬롯, 리스트 아이콘 | `assets/logos/symbol/<slug>.svg` |
| **wordmark** | 가로형 워드마크/lockup | 큰 슬롯, 푸터, 마케팅 카피 | `assets/logos/wordmark/<slug>.svg` |

각 기관에 대해 둘 중 하나만 있어도 OK이고, 둘 다 있으면 더 좋습니다.

### 절차

1. **출처**: 해당 기관 공식 홈페이지의 BI/CI 또는 보도자료 페이지. 서드파티 사이트, 스크린샷, 임의 재현 SVG는 받지 않습니다 (Wikimedia Commons는 공식 출처에서 큐레이션된 경우 허용).
2. **종횡비**: symbol은 1:1에 가까운 정사각형, wordmark는 가로형 직사각형.
3. **SVGO 최적화**: 빌드 시 `removeDimensions` 플러그인이 root width/height를 제거하고 `preserveAspectRatio="xMidYMid meet"`를 주입하므로, 원본은 viewBox만 유지하면 됩니다.
4. **a11y**: `<svg role="img" aria-label="<bank name>">` + `<title>` 포함 권장.
5. **저장 위치**: 위 표 참조. slug는 institution record와 일치해야 함.
6. **소스 URL 코멘트**: SVG 파일 상단에 `<!-- Source: https://... 2026-MM-DD -->` 추가.

PR 작성 시 PR 본문에 출처 URL과 변형(symbol/wordmark) 명시.

## PR 가이드라인

- **커밋 메시지**: [Conventional Commits](https://www.conventionalcommits.org)
  - `feat(data): add 토스뱅크 patterns`
  - `fix(detect): handle empty pattern array`
  - `docs(readme): clarify sub-path import example`
- **단일 책임**: 기관 추가 PR과 로고 추가 PR은 분리 권장.
- **changeset 추가**: 사용자 영향 있는 변경은 `pnpm changeset` 실행하여 변경 노트 추가.
- **타깃 브랜치**: `main`.
- **CI 통과 필수**: lint, typecheck, test, build.

## 이슈 템플릿

- **버그 리포트**: [bug_report.yml](.github/ISSUE_TEMPLATE/bug_report.yml)
- **기관 추가 요청**: [institution_request.yml](.github/ISSUE_TEMPLATE/institution_request.yml)
- **로고 takedown 요청**: [logo_takedown.yml](.github/ISSUE_TEMPLATE/logo_takedown.yml)

## 상표 / Takedown 요청

각 기관에서 로고 사용 중단을 요청하시면 [logo_takedown 이슈 템플릿](.github/ISSUE_TEMPLATE/logo_takedown.yml)을 통해 알려주세요. 영업일 기준 3일 이내 해당 로고를 제거하고 patch 릴리스합니다.

## 릴리스 절차 (메인테이너 전용)

1. PR 머지 시 changesets 봇이 release PR 자동 생성.
2. release PR 머지 시 GitHub Actions가 npm publish + GitHub release 수행.
