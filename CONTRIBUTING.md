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

1. **데이터 출처**: [금융결제원 CMS 계좌번호체계](https://www.kftc.or.kr) 공식 문서에서 코드, 명칭, 과목코드(prefix), 자릿수(length) 확인.
2. `src/data/institutions.ts`에 다음 형식으로 추가:

   ```ts
   {
     code: '088',          // KFTC 3자리 코드
     slug: 'shinhan',      // 영문 소문자, kebab-case
     name: '신한은행',
     shortName: '신한',
     englishName: 'Shinhan Bank',
     category: 'bank',     // 'bank' | 'internet-bank' | 'regional' | 'special' | 'mutual' | 'securities'
     patterns: [
       { prefix: '110', lengths: [11, 12] },
     ],
   }
   ```

3. `tests/fixtures/account-samples.ts`에 실제 형식 샘플 1~3개 추가.
4. `pnpm test` — 모든 테스트 통과 확인.

## 새 로고 추가/수정 (simple-icons 모델)

본 프로젝트는 각 금융기관의 **공식 BI/CI 페이지에서 직접 다운받은 SVG**만 받습니다.

1. **출처**: 해당 기관 공식 홈페이지의 BI/CI 또는 보도자료 페이지. 서드파티 사이트, 스크린샷, 임의 재현 SVG는 받지 않습니다.
2. **viewBox 표준화**: `0 0 64 64`로 정규화. 비율 유지하며 중앙 정렬.
3. **SVGO 최적화**: 빌드 시 자동 최적화되지만, 수동 최적화도 권장.
4. **a11y**: `<svg role="img" aria-label="<bank name>">` + `<title>` 포함.
5. **저장 위치**: `assets/logos/<slug>.svg` — slug는 institution record와 일치해야 함.
6. **소스 URL 코멘트**: SVG 파일 상단에 `<!-- Source: https://... 2026-MM-DD -->` 추가.

PR 작성 시 PR 본문에 출처 URL 명시.

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
