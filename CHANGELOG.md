# korean-bank-detector

## Roadmap

- v0.1.x — 누락 로고 보강: symbol 6개 (토스·수협 + KDB·아이엠·부산·새마을금고) + wordmark 4개 (KDB·아이엠·부산·새마을금고).
- v0.2.0 — 증권사(KIS, 미래에셋, 삼성, NH투자, KB증권 등) 패턴 추가, 광주·전북·경남·제주은행 등 미커버 지방은행 보강, React/Vue 바인딩 검토.
- v1.0.0 — API 안정화 후 strict semver 진입.

## 0.1.0

### Minor Changes

- 1d4419b: Initial release: detect Korean bank from account number with 17 institutions, position-based KFTC pattern matching with confidence scoring, and SVG logo sub-path imports.

  - 매칭 알고리즘은 [jhaemin/korea-financial-account-number-detector](https://github.com/jhaemin/korea-financial-account-number-detector) 참고로 자체 구현.
  - 시드 17개 기관: 산업·기업·KB국민·하나·수협·NH농협·농협중앙회·우리·SC제일·신한·씨티·아이엠·부산·새마을금고·K뱅크·카카오뱅크·토스뱅크.
  - 로고 자산: 두 변형 제공 — **symbol** (정사각 심볼마크) 11개, **wordmark** (가로 lockup) 13개. 둘 다 누락: KDB·아이엠·부산·새마을금고.
  - KB국민·신한 symbol은 공식 BI 페이지의 `.ai` 파일을 `pdftocairo`로 변환 후 path bbox 필터로 심볼 영역만 추출.
  - Sub-path import: `korean-bank-detector/logos/symbol/<code>`, `korean-bank-detector/logos/wordmark/<code>`.
  - `getInstitutionLogo(code, variant?)` — 기본 variant는 `'symbol'`, `'wordmark'`도 지원.
  - 증권사·일부 지방은행은 v0.2.0으로 연기.
