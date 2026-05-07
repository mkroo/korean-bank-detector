# korean-bank-detector v0.1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 한국 계좌번호로 금융기관(이름·KFTC 코드·SVG 로고)을 판별하는 pure-TypeScript ESM npm 패키지 v0.1.0을 출시한다.

**Architecture:** 정적 데이터(`INSTITUTIONS` const) + 순수 함수 매처(prefix·length 기반 ranked scoring) + 빌드 시점에 자동 생성되는 로고 sub-path entries. 외부 API/IO/state 없음. tsup 다중 entry로 ESM-only 출력.

**Tech Stack:** TypeScript 5.x · pnpm · tsup · vitest · ESLint · Prettier · changesets · GitHub Actions · Node 20+

**Working directory:** `/Users/ansrl/dev/korean-bank-detector` (이미 클론됨, `main` 브랜치)

**Spec reference:** `docs/superpowers/specs/2026-05-08-korean-bank-detector-design.md`

---

## File Structure (target after v0.1.0)

```
korean-bank-detector/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── institution_request.yml
│   │   └── logo_takedown.yml
│   ├── workflows/
│   │   └── ci.yml
│   ├── pull_request_template.md
│   └── CODE_OF_CONDUCT.md
├── .changeset/
│   └── config.json
├── assets/
│   └── logos/                    # commit, slug-named, official BI source
│       └── shinhan.svg           # ... etc per institution
├── docs/superpowers/
│   ├── specs/2026-05-08-korean-bank-detector-design.md
│   └── plans/2026-05-08-korean-bank-detector.md
├── scripts/
│   └── build-logos.ts            # assets/*.svg → src/data/logos.ts + src/logos/<code>.ts
├── src/
│   ├── data/
│   │   ├── institutions.ts       # InstitutionRecord[] (manual)
│   │   └── logos.ts              # generated, gitignored
│   ├── logos/                    # generated, gitignored
│   ├── detect.ts
│   ├── index.ts
│   ├── normalize.ts
│   └── types.ts
├── tests/
│   ├── detect.test.ts
│   ├── normalize.test.ts
│   ├── institutions.test.ts
│   └── fixtures/
│       └── account-samples.ts
├── .editorconfig
├── .eslintrc.cjs
├── .gitignore
├── .nvmrc
├── .npmignore
├── .prettierrc
├── CHANGELOG.md                  # changesets-managed
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── README.md
├── TRADEMARKS.md
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

---

## Phase A: Project Bootstrap

### Task 1: package.json + pnpm

**Files:**
- Create: `package.json`
- Create: `.nvmrc`
- Create: `pnpm-workspace.yaml` *(skip — single package, not needed)*

- [ ] **Step 1: Verify Node 20+**

```bash
cd /Users/ansrl/dev/korean-bank-detector
node --version
```
Expected: `v20.x.x` or higher. If lower, run `nvm install 20 && nvm use 20`.

- [ ] **Step 2: Write `.nvmrc`**

```
20
```

- [ ] **Step 3: Write initial `package.json`**

```json
{
  "name": "korean-bank-detector",
  "version": "0.0.0",
  "description": "Detect Korean bank from account number — returns name, KFTC code, and brand logo (SVG). Toss-style.",
  "keywords": [
    "korean", "korea", "bank", "account",
    "detect", "kftc", "logo", "toss", "svg"
  ],
  "homepage": "https://github.com/mkroo/korean-bank-detector#readme",
  "bugs": "https://github.com/mkroo/korean-bank-detector/issues",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/mkroo/korean-bank-detector.git"
  },
  "license": "MIT",
  "author": "mkroo",
  "type": "module",
  "sideEffects": false,
  "engines": { "node": ">=20" },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./logos/*": {
      "types": "./dist/logos/*.d.ts",
      "import": "./dist/logos/*.js"
    }
  },
  "files": ["dist", "README.md", "TRADEMARKS.md", "LICENSE"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src tests scripts --ext .ts",
    "format": "prettier --write \"**/*.{ts,md,json,yml,yaml}\"",
    "typecheck": "tsc --noEmit",
    "release": "changeset publish"
  },
  "devDependencies": {}
}
```

- [ ] **Step 4: Install dev dependencies**

```bash
cd /Users/ansrl/dev/korean-bank-detector
pnpm add -D typescript@^5.5.0 tsup@^8.0.0 tsx@^4.0.0 vitest@^2.0.0 \
  eslint@^9.0.0 @typescript-eslint/parser@^8.0.0 @typescript-eslint/eslint-plugin@^8.0.0 \
  prettier@^3.0.0 svgo@^3.0.0 @changesets/cli@^2.27.0 \
  @types/node@^20.0.0
```
Expected: `pnpm-lock.yaml` created, `node_modules/` populated.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .nvmrc
git commit -m "chore: scaffold package.json with pnpm dependencies"
```

---

### Task 2: TypeScript configuration

**Files:**
- Create: `tsconfig.json`

- [ ] **Step 1: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests", "scripts"]
}
```

- [ ] **Step 2: Verify typecheck runs (no source files yet — should be clean)**

```bash
pnpm typecheck
```
Expected: clean exit (no errors). May warn about no input files — that's OK.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: add typescript strict configuration"
```

---

### Task 3: Build tooling (tsup)

**Files:**
- Create: `tsup.config.ts`

- [ ] **Step 1: Write `tsup.config.ts`**

```ts
import { defineConfig } from 'tsup'
import { globSync } from 'node:fs'

const logoEntries = globSync('src/logos/*.ts')

export default defineConfig({
  entry: ['src/index.ts', ...logoEntries],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: 'node20',
})
```

> Note: `src/logos/*.ts` is generated by `prebuild` — first build will read empty glob, that's fine until Task 14.

- [ ] **Step 2: Commit**

```bash
git add tsup.config.ts
git commit -m "chore: configure tsup multi-entry esm build"
```

---

### Task 4: Test setup (vitest)

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/data/logos.ts', 'src/logos/**'],
      thresholds: {
        lines: 95,
        statements: 95,
        branches: 90,
        functions: 95,
      },
    },
  },
})
```

- [ ] **Step 2: Install coverage provider**

```bash
pnpm add -D @vitest/coverage-v8
```

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts package.json pnpm-lock.yaml
git commit -m "chore: add vitest config with v8 coverage thresholds"
```

---

### Task 5: ESLint + Prettier

**Files:**
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `.editorconfig`

- [ ] **Step 1: Write `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  ignorePatterns: ['dist/', 'node_modules/', 'src/data/logos.ts', 'src/logos/'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
```

- [ ] **Step 2: Write `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

- [ ] **Step 3: Write `.editorconfig`**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 4: Verify lint runs (no source yet — clean)**

```bash
pnpm lint
```
Expected: passes with no files reported (lint glob may report no input — that's OK).

- [ ] **Step 5: Commit**

```bash
git add .eslintrc.cjs .prettierrc .editorconfig
git commit -m "chore: add eslint, prettier, editorconfig"
```

---

### Task 6: .gitignore + LICENSE

**Files:**
- Create: `.gitignore`
- Create: `.npmignore`
- Create: `LICENSE`

- [ ] **Step 1: Write `.gitignore`**

```
node_modules/
dist/
coverage/

# Generated logo entries (built from assets/)
src/data/logos.ts
src/logos/

# OS / editor
.DS_Store
*.log
.vscode/
.idea/
```

- [ ] **Step 2: Write `.npmignore`**

```
src/
tests/
scripts/
docs/
assets/
.github/
.changeset/
*.config.ts
.eslintrc.cjs
.prettierrc
.editorconfig
.nvmrc
tsconfig.json
pnpm-lock.yaml
```

- [ ] **Step 3: Write `LICENSE` (MIT)**

```
MIT License

Copyright (c) 2026 mkroo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore .npmignore LICENSE
git commit -m "chore: add gitignore, npmignore, MIT license"
```

---

## Phase B: Public Types & Core Logic (TDD)

### Task 7: Public types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Write `src/types.ts`**

```ts
export type InstitutionCategory =
  | 'bank'
  | 'internet-bank'
  | 'regional'
  | 'special'
  | 'mutual'
  | 'securities'

export type Institution = {
  code: string
  name: string
  shortName: string
  englishName: string
  category: InstitutionCategory
  slug: string
}

export type Pattern = {
  prefix: string
  lengths: number[]
}

export type InstitutionRecord = Institution & {
  patterns: Pattern[]
}

export type DetectResult = {
  institution: Institution
  logo: string
  confidence: number
  matchedPattern: string
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm typecheck
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: define public types (Institution, DetectResult, etc.)"
```

---

### Task 8: normalize() — TDD

**Files:**
- Create: `tests/normalize.test.ts`
- Create: `src/normalize.ts`

- [ ] **Step 1: Write failing test `tests/normalize.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { normalize } from '../src/normalize'

describe('normalize', () => {
  it('strips hyphens', () => {
    expect(normalize('110-436-387740')).toBe('110436387740')
  })

  it('strips spaces, dots, underscores', () => {
    expect(normalize('110 436.387_740')).toBe('110436387740')
  })

  it('returns empty string for empty input', () => {
    expect(normalize('')).toBe('')
  })

  it('returns empty string when non-digit characters remain', () => {
    expect(normalize('abc123')).toBe('')
    expect(normalize('110-abc-740')).toBe('')
  })

  it('preserves all-digit input untouched', () => {
    expect(normalize('110436387740')).toBe('110436387740')
  })

  it('handles mixed allowed separators', () => {
    expect(normalize(' 110 - 436 . 387_740 ')).toBe('110436387740')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
pnpm test tests/normalize.test.ts
```
Expected: FAIL — `Cannot find module '../src/normalize'`.

- [ ] **Step 3: Implement `src/normalize.ts`**

```ts
const SEPARATOR_RE = /[\s\-._]/g
const DIGITS_ONLY_RE = /^\d*$/

export function normalize(input: string): string {
  if (!input) return ''
  const stripped = input.replace(SEPARATOR_RE, '')
  return DIGITS_ONLY_RE.test(stripped) ? stripped : ''
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
pnpm test tests/normalize.test.ts
```
Expected: 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add tests/normalize.test.ts src/normalize.ts
git commit -m "feat(normalize): strip allowed separators, reject non-digits"
```

---

### Task 9: Seed institution data (3 starter banks)

**Files:**
- Create: `src/data/institutions.ts`
- Create: `tests/institutions.test.ts`

> Pattern data is sourced from KFTC CMS 계좌번호체계 (2026.03.24). For this task, we seed 3 well-known banks with representative patterns. Full population happens in Tasks 17–19.

- [ ] **Step 1: Write `src/data/institutions.ts`**

```ts
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
```

- [ ] **Step 2: Write `tests/institutions.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { INSTITUTIONS } from '../src/data/institutions'

describe('INSTITUTIONS data integrity', () => {
  it('has unique codes', () => {
    const codes = INSTITUTIONS.map((i) => i.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('has unique slugs', () => {
    const slugs = INSTITUTIONS.map((i) => i.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('all slugs are kebab-case lowercase', () => {
    for (const inst of INSTITUTIONS) {
      expect(inst.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('all codes are 3-digit numeric strings', () => {
    for (const inst of INSTITUTIONS) {
      expect(inst.code).toMatch(/^\d{3}$/)
    }
  })

  it('every institution has at least one pattern', () => {
    for (const inst of INSTITUTIONS) {
      expect(inst.patterns.length).toBeGreaterThan(0)
    }
  })

  it('every pattern prefix is digits-only', () => {
    for (const inst of INSTITUTIONS) {
      for (const p of inst.patterns) {
        expect(p.prefix).toMatch(/^\d+$/)
      }
    }
  })

  it('every pattern has at least one length', () => {
    for (const inst of INSTITUTIONS) {
      for (const p of inst.patterns) {
        expect(p.lengths.length).toBeGreaterThan(0)
      }
    }
  })
})
```

- [ ] **Step 3: Run test — expect PASS**

```bash
pnpm test tests/institutions.test.ts
```
Expected: 7 tests passing.

- [ ] **Step 4: Commit**

```bash
git add src/data/institutions.ts tests/institutions.test.ts
git commit -m "feat(data): seed 3 starter banks (신한/KB국민/카카오뱅크) with consistency tests"
```

---

### Task 10: detect() — basic match

**Files:**
- Create: `tests/detect.test.ts`
- Create: `src/detect.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from 'vitest'
import { detect } from '../src/detect'

describe('detect', () => {
  it('returns empty array for empty input', () => {
    expect(detect('')).toEqual([])
  })

  it('returns empty array for non-numeric input', () => {
    expect(detect('abc')).toEqual([])
  })

  it('returns empty array when no pattern matches', () => {
    expect(detect('999999999999')).toEqual([])
  })

  it('matches a single bank by prefix', () => {
    const results = detect('110436387740')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].institution.code).toBe('088')
    expect(results[0].institution.name).toBe('신한은행')
  })

  it('returns matchedPattern for debugging', () => {
    const results = detect('110436387740')
    expect(results[0].matchedPattern).toBe('110')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
pnpm test tests/detect.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/detect.ts` (minimal — no scoring yet)**

```ts
import type { DetectResult, InstitutionRecord, Pattern } from './types'
import { normalize } from './normalize'
import { INSTITUTIONS } from './data/institutions'

type Match = {
  record: InstitutionRecord
  pattern: Pattern
  prefixLength: number
  lengthExact: boolean
}

function findMatches(digits: string): Match[] {
  const matches: Match[] = []
  for (const record of INSTITUTIONS) {
    for (const pattern of record.patterns) {
      if (digits.startsWith(pattern.prefix)) {
        matches.push({
          record,
          pattern,
          prefixLength: pattern.prefix.length,
          lengthExact: pattern.lengths.includes(digits.length),
        })
      }
    }
  }
  return matches
}

export function detect(input: string): DetectResult[] {
  const digits = normalize(input)
  if (!digits) return []

  const matches = findMatches(digits)
  return matches.map((m) => ({
    institution: {
      code: m.record.code,
      name: m.record.name,
      shortName: m.record.shortName,
      englishName: m.record.englishName,
      category: m.record.category,
      slug: m.record.slug,
    },
    logo: '',
    confidence: 0,
    matchedPattern: m.pattern.prefix,
  }))
}
```

> `logo` and `confidence` are filled by next tasks. Stub for now.

- [ ] **Step 4: Run test — expect PASS**

```bash
pnpm test tests/detect.test.ts
```
Expected: 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add tests/detect.test.ts src/detect.ts
git commit -m "feat(detect): basic prefix matching with stub logo/confidence"
```

---

### Task 11: confidence scoring + ranking

**Files:**
- Modify: `src/detect.ts`
- Modify: `tests/detect.test.ts` (add tests)

- [ ] **Step 1: Add failing tests**

Append to `tests/detect.test.ts`:

```ts
describe('detect — confidence scoring', () => {
  it('confidence is between 0 and 1', () => {
    const results = detect('110436387740')
    for (const r of results) {
      expect(r.confidence).toBeGreaterThan(0)
      expect(r.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('exact length match scores higher than partial', () => {
    const partial = detect('110')[0]?.confidence ?? 0
    const full = detect('110436387740')[0]?.confidence ?? 0
    expect(full).toBeGreaterThan(partial)
  })

  it('longer prefix scores higher than shorter prefix when both match', () => {
    // 카카오뱅크 prefix '3333' (length 4) > 신한 prefix '110' (length 3)
    const kakao = detect('3333123456789')[0]?.confidence ?? 0
    const shinhan = detect('110436387740')[0]?.confidence ?? 0
    expect(kakao).toBeGreaterThan(shinhan)
  })

  it('sorts results by confidence descending', () => {
    const results = detect('110436387740')
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence)
    }
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
pnpm test tests/detect.test.ts
```
Expected: confidence-related assertions fail (currently always 0).

- [ ] **Step 3: Update `src/detect.ts` to score and sort**

Replace the `detect` function and add scoring helper:

```ts
import type { DetectResult, InstitutionRecord, Pattern } from './types'
import { normalize } from './normalize'
import { INSTITUTIONS } from './data/institutions'

const MAX_PREFIX = INSTITUTIONS.reduce((max, inst) => {
  for (const p of inst.patterns) {
    if (p.prefix.length > max) max = p.prefix.length
  }
  return max
}, 1)

const LENGTH_FACTOR_EXACT = 1.2
const LENGTH_FACTOR_PARTIAL = 1.0

type Match = {
  record: InstitutionRecord
  pattern: Pattern
  confidence: number
}

function score(prefixLength: number, lengthExact: boolean): number {
  const base = prefixLength / MAX_PREFIX
  const factor = lengthExact ? LENGTH_FACTOR_EXACT : LENGTH_FACTOR_PARTIAL
  return Math.min(base * factor, 1.0)
}

function findMatches(digits: string): Match[] {
  const matches: Match[] = []
  for (const record of INSTITUTIONS) {
    for (const pattern of record.patterns) {
      if (digits.startsWith(pattern.prefix)) {
        matches.push({
          record,
          pattern,
          confidence: score(pattern.prefix.length, pattern.lengths.includes(digits.length)),
        })
      }
    }
  }
  return matches
}

export function detect(input: string): DetectResult[] {
  const digits = normalize(input)
  if (!digits) return []

  const matches = findMatches(digits)
  matches.sort((a, b) => b.confidence - a.confidence)

  return matches.map((m) => ({
    institution: {
      code: m.record.code,
      name: m.record.name,
      shortName: m.record.shortName,
      englishName: m.record.englishName,
      category: m.record.category,
      slug: m.record.slug,
    },
    logo: '',
    confidence: m.confidence,
    matchedPattern: m.pattern.prefix,
  }))
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
pnpm test tests/detect.test.ts
```
Expected: all detect tests passing (9 total).

- [ ] **Step 5: Commit**

```bash
git add src/detect.ts tests/detect.test.ts
git commit -m "feat(detect): confidence scoring with prefix length + length factor, ranked output"
```

---

### Task 12: detectOne / getInstitution / getInstitutionLogo

**Files:**
- Modify: `src/detect.ts`
- Create: `tests/detect-helpers.test.ts`

- [ ] **Step 1: Write failing test `tests/detect-helpers.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { detectOne, getInstitution, getInstitutionLogo } from '../src/detect'

describe('detectOne', () => {
  it('returns top match', () => {
    const result = detectOne('110436387740')
    expect(result?.institution.code).toBe('088')
  })

  it('returns null when no match', () => {
    expect(detectOne('999999999999')).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(detectOne('')).toBeNull()
  })
})

describe('getInstitution', () => {
  it('returns institution by code', () => {
    expect(getInstitution('088')?.name).toBe('신한은행')
  })

  it('returns null for unknown code', () => {
    expect(getInstitution('999')).toBeNull()
  })
})

describe('getInstitutionLogo', () => {
  it('returns string when logo exists', () => {
    // No logos seeded yet → null is acceptable here
    const logo = getInstitutionLogo('088')
    expect(logo === null || typeof logo === 'string').toBe(true)
  })

  it('returns null for unknown code', () => {
    expect(getInstitutionLogo('999')).toBeNull()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pnpm test tests/detect-helpers.test.ts
```
Expected: helpers not exported.

- [ ] **Step 3: Add helpers to `src/detect.ts`**

Two edits required:

**Edit A — update existing import line at top of file** (the line currently reads `import type { DetectResult, InstitutionRecord, Pattern } from './types'`):

```ts
import type { DetectResult, Institution, InstitutionRecord, Pattern } from './types'
```

**Edit B — append the three exports at the end of the file**:

```ts
export function detectOne(input: string): DetectResult | null {
  return detect(input)[0] ?? null
}

export function getInstitution(code: string): Institution | null {
  const record = INSTITUTIONS.find((i) => i.code === code)
  if (!record) return null
  return {
    code: record.code,
    name: record.name,
    shortName: record.shortName,
    englishName: record.englishName,
    category: record.category,
    slug: record.slug,
  }
}

export function getInstitutionLogo(code: string): string | null {
  // Logo map populated by build script; until built, returns null.
  // Implementation wired in Task 14.
  return null
}
```

> The `getInstitutionLogo` body is rewritten in Task 14 once the logo map exists. For now we use a stub that returns null to keep tests green.

- [ ] **Step 4: Run — expect PASS**

```bash
pnpm test
```
Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/detect.ts tests/detect-helpers.test.ts
git commit -m "feat(detect): add detectOne, getInstitution, getInstitutionLogo helpers"
```

---

### Task 13: Public API entry + ALL_INSTITUTIONS

**Files:**
- Create: `src/index.ts`
- Create: `tests/public-api.test.ts`

- [ ] **Step 1: Write `src/index.ts`**

```ts
export type {
  Institution,
  InstitutionCategory,
  DetectResult,
} from './types'

export { detect, detectOne, getInstitution, getInstitutionLogo } from './detect'
export { ALL_INSTITUTIONS } from './all-institutions'
```

- [ ] **Step 2: Create `src/all-institutions.ts`**

```ts
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
```

- [ ] **Step 3: Write `tests/public-api.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import * as api from '../src/index'

describe('public API surface', () => {
  it('exports detect', () => {
    expect(typeof api.detect).toBe('function')
  })

  it('exports detectOne', () => {
    expect(typeof api.detectOne).toBe('function')
  })

  it('exports getInstitution', () => {
    expect(typeof api.getInstitution).toBe('function')
  })

  it('exports getInstitutionLogo', () => {
    expect(typeof api.getInstitutionLogo).toBe('function')
  })

  it('exports ALL_INSTITUTIONS', () => {
    expect(Array.isArray(api.ALL_INSTITUTIONS)).toBe(true)
    expect(api.ALL_INSTITUTIONS.length).toBeGreaterThan(0)
  })

  it('ALL_INSTITUTIONS items do not leak patterns', () => {
    for (const inst of api.ALL_INSTITUTIONS) {
      expect((inst as any).patterns).toBeUndefined()
    }
  })
})
```

- [ ] **Step 4: Run — expect PASS**

```bash
pnpm test
```
Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts src/all-institutions.ts tests/public-api.test.ts
git commit -m "feat(api): public entry exports + ALL_INSTITUTIONS without internal patterns"
```

> Build verification is deferred to Task 15 (after logo pipeline is wired in Task 14).

---

## Phase C: Logo Pipeline

### Task 14: build-logos script + first logo

**Files:**
- Create: `scripts/build-logos.ts`
- Create: `assets/logos/shinhan.svg` (placeholder — replaced by official CI later)
- Modify: `src/detect.ts` (wire `getInstitutionLogo`)

- [ ] **Step 1: Add a placeholder SVG `assets/logos/shinhan.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Shinhan Bank">
  <title>Shinhan Bank</title>
  <rect width="64" height="64" rx="12" fill="#0046ff"/>
  <text x="32" y="40" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="700" fill="#fff">신한</text>
</svg>
```

> This is a temporary stand-in. Real official CI is sourced per the CONTRIBUTING.md procedure (Task 21). The pipeline must work end-to-end with at least one logo.

- [ ] **Step 2: Write `scripts/build-logos.ts`**

```ts
#!/usr/bin/env tsx
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import { optimize } from 'svgo'

import { INSTITUTIONS } from '../src/data/institutions'

const ASSETS_DIR = join(process.cwd(), 'assets', 'logos')
const LOGOS_OUT_DIR = join(process.cwd(), 'src', 'logos')
const LOGO_MAP_PATH = join(process.cwd(), 'src', 'data', 'logos.ts')

function readSvgs(): Map<string, string> {
  if (!existsSync(ASSETS_DIR)) return new Map()
  const map = new Map<string, string>()
  for (const file of readdirSync(ASSETS_DIR)) {
    if (extname(file).toLowerCase() !== '.svg') continue
    const slug = basename(file, '.svg')
    const raw = readFileSync(join(ASSETS_DIR, file), 'utf8')
    const optimized = optimize(raw, { multipass: true }).data
    map.set(slug, optimized)
  }
  return map
}

function buildLogoMap(svgsBySlug: Map<string, string>): Map<string, string> {
  const byCode = new Map<string, string>()
  for (const inst of INSTITUTIONS) {
    const svg = svgsBySlug.get(inst.slug)
    if (svg) byCode.set(inst.code, svg)
  }
  return byCode
}

function emitLogoMap(byCode: Map<string, string>) {
  const entries = [...byCode.entries()]
    .map(([code, svg]) => `  ${JSON.stringify(code)}: ${JSON.stringify(svg)},`)
    .join('\n')
  const body = `// AUTO-GENERATED by scripts/build-logos.ts. Do not edit.\nexport const LOGOS: Readonly<Record<string, string>> = {\n${entries}\n} as const\n`
  mkdirSync(join(process.cwd(), 'src', 'data'), { recursive: true })
  writeFileSync(LOGO_MAP_PATH, body, 'utf8')
}

function emitPerCodeEntries(byCode: Map<string, string>) {
  if (existsSync(LOGOS_OUT_DIR)) {
    rmSync(LOGOS_OUT_DIR, { recursive: true, force: true })
  }
  mkdirSync(LOGOS_OUT_DIR, { recursive: true })
  for (const [code, svg] of byCode) {
    const body = `// AUTO-GENERATED by scripts/build-logos.ts. Do not edit.\nconst svg = ${JSON.stringify(svg)}\nexport default svg\n`
    writeFileSync(join(LOGOS_OUT_DIR, `${code}.ts`), body, 'utf8')
  }
}

function main() {
  const svgs = readSvgs()
  const byCode = buildLogoMap(svgs)
  emitLogoMap(byCode)
  emitPerCodeEntries(byCode)
  console.log(`[build-logos] wrote ${byCode.size} logos`)
}

main()
```

- [ ] **Step 3: Wire `getInstitutionLogo` in `src/detect.ts`**

Three edits to `src/detect.ts`:

**Edit A — add import near the top of the file** (right after the existing `import { INSTITUTIONS } from './data/institutions'` line):

```ts
import { LOGOS } from './data/logos'
```

**Edit B — inside `detect()`, change the `logo: ''` line in the returned object literal**:

```ts
        logo: LOGOS[m.record.code] ?? '',
```

(Replaces the existing `logo: '',` from Task 11.)

**Edit C — replace the `getInstitutionLogo` body** (added in Task 12 with `return null` stub):

```ts
export function getInstitutionLogo(code: string): string | null {
  return LOGOS[code] ?? null
}
```

- [ ] **Step 4: Register `prebuild` in `package.json`**

Add this line to the `scripts` block (just before `"build"`):

```json
    "prebuild": "tsx scripts/build-logos.ts",
```

- [ ] **Step 5: Run prebuild script directly to verify**

```bash
pnpm tsx scripts/build-logos.ts
```
Expected: `[build-logos] wrote 1 logos`. Files appear: `src/data/logos.ts`, `src/logos/088.ts`.

- [ ] **Step 6: Run tests — expect PASS**

```bash
pnpm test
```
Expected: all tests passing. `detect('110436387740')[0].logo` should be a non-empty SVG string in any new tests we add.

- [ ] **Step 7: Add logo presence test in `tests/detect-helpers.test.ts`**

Add to existing describe block:

```ts
describe('getInstitutionLogo with seeded logo', () => {
  it('returns SVG string for 088 (신한)', () => {
    const logo = getInstitutionLogo('088')
    expect(logo).toContain('<svg')
  })
})
```

- [ ] **Step 8: Run — expect PASS**

```bash
pnpm test
```

- [ ] **Step 9: Commit**

```bash
git add scripts/build-logos.ts assets/logos/shinhan.svg src/detect.ts tests/detect-helpers.test.ts package.json
git commit -m "feat(logos): build-logos script + placeholder shinhan logo end-to-end"
```

---

### Task 15: tsup multi-entry build verification

**Files:** none (verification only)

- [ ] **Step 1: Run full build**

```bash
pnpm build
```
Expected: `prebuild` runs build-logos, then tsup emits:
- `dist/index.js` and `dist/index.d.ts`
- `dist/logos/088.js` and `dist/logos/088.d.ts`

- [ ] **Step 2: Verify dist outputs**

```bash
ls dist/ dist/logos/
```
Expected: `index.js`, `index.d.ts`, `index.js.map` in dist/; `088.js`, `088.d.ts` in dist/logos/.

- [ ] **Step 3: Smoke-test the built ESM output**

```bash
node --input-type=module -e "import('./dist/index.js').then(m => console.log(m.detectOne('110436387740')))"
```
Expected: Object with `institution.code === '088'` printed.

- [ ] **Step 4: Smoke-test sub-path import via direct file**

```bash
node --input-type=module -e "import('./dist/logos/088.js').then(m => console.log(m.default.startsWith('<svg')))"
```
Expected: `true`.

- [ ] **Step 5: No commit (verification only). If issues found, fix and commit fix.**

---

## Phase D: Data Expansion

> The remaining institution records are populated by reading the KFTC CMS 계좌번호체계 document and translating each row into the `InstitutionRecord` shape. Patterns to use (`prefix`, `lengths`) come directly from the document's "과목코드" and "계좌자리수" columns. Tasks 17–19 split the work into manageable groups; each task adds records, updates fixtures, and commits.

### Task 16: Add account-sample fixtures

**Files:**
- Create: `tests/fixtures/account-samples.ts`

> Fixtures hold real-format account numbers per institution for integration tests. Initially we add samples only for the 3 seeded banks; subsequent tasks expand alongside data.

- [ ] **Step 1: Write `tests/fixtures/account-samples.ts`**

```ts
export type AccountSample = {
  code: string
  examples: string[]
}

export const ACCOUNT_SAMPLES: AccountSample[] = [
  { code: '088', examples: ['110-436-387740', '110436387740', '100-123-456789'] },
  { code: '004', examples: ['004-12-3456-789', '004012345678'] },
  { code: '090', examples: ['3333-12-3456789', '3333123456789'] },
]
```

- [ ] **Step 2: Add fixture-driven test to `tests/detect.test.ts`**

Append:

```ts
import { ACCOUNT_SAMPLES } from './fixtures/account-samples'

describe('detect — fixtures', () => {
  for (const { code, examples } of ACCOUNT_SAMPLES) {
    for (const example of examples) {
      it(`top match for "${example}" is institution ${code}`, () => {
        const top = detect(example)[0]
        expect(top?.institution.code).toBe(code)
      })
    }
  }
})
```

- [ ] **Step 3: Run — expect PASS**

```bash
pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add tests/fixtures/account-samples.ts tests/detect.test.ts
git commit -m "test: add fixture-driven detection tests for seeded banks"
```

---

### Task 17: Expand to all 시중·인터넷·특수은행

**Files:**
- Modify: `src/data/institutions.ts`
- Modify: `tests/fixtures/account-samples.ts`

> Sources: Encore project's `web/src/constants/banks.ts` (codes, names) + KFTC CMS 계좌번호체계 (patterns).

- [ ] **Step 1: Add records for: 우리(020), 하나(081), NH농협(011), 토스뱅크(092), K뱅크(089), 기업(003), 산업(002), SC제일(023), 씨티(027), 수협(007), 우체국(071)**

Append to `src/data/institutions.ts` array:

```ts
  {
    code: '020',
    slug: 'woori',
    name: '우리은행',
    shortName: '우리',
    englishName: 'Woori Bank',
    category: 'bank',
    patterns: [
      { prefix: '1002', lengths: [13] },
      { prefix: '1005', lengths: [13] },
    ],
  },
  {
    code: '081',
    slug: 'hana',
    name: '하나은행',
    shortName: '하나',
    englishName: 'Hana Bank',
    category: 'bank',
    patterns: [
      { prefix: '111', lengths: [12, 14] },
      { prefix: '391', lengths: [14] },
    ],
  },
  // ... continue with the remaining institutions following the same shape.
  // Reference KFTC CMS 계좌번호체계 (2026.03.24) for the exact prefix/length per code.
```

> **Implementer note:** the patterns above are illustrative; consult the KFTC CMS document (PDF) and copy the actual prefix and length columns. If a column has multiple entries, list all in `patterns`. Do not invent patterns.

- [ ] **Step 2: Add 1–3 fixture samples per added institution**

Update `tests/fixtures/account-samples.ts` with samples sourced from:
- Each institution's mobile app help section ("계좌번호 형식")
- Public dummy account numbers from QA blogs/Velog write-ups
- The existing user's profile data (one account per bank if available)

- [ ] **Step 3: Run all tests**

```bash
pnpm test
```
Expected: all tests passing including new fixture-driven cases.

- [ ] **Step 4: Run consistency tests specifically**

```bash
pnpm test tests/institutions.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/institutions.ts tests/fixtures/account-samples.ts
git commit -m "feat(data): add 시중·인터넷·특수은행 records and fixtures"
```

---

### Task 18: Add 지방은행 + 상호금융

**Files:**
- Modify: `src/data/institutions.ts`
- Modify: `tests/fixtures/account-samples.ts`

> Add: 아이엠뱅크(031), 부산(032), 광주(034), 경남(039), 전북(037), 제주(035), 새마을금고(045), 신협(048), 농협중앙회(012), 수협중앙회(030), 산림조합(064), 저축은행(050).

- [ ] **Step 1: Append records for the 12 institutions above using KFTC patterns**

Same shape as Task 17 — see the document for exact prefix/length values.

- [ ] **Step 2: Add fixture samples**

For each new code, add at least 1 fixture example.

- [ ] **Step 3: Run tests — expect PASS**

```bash
pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add src/data/institutions.ts tests/fixtures/account-samples.ts
git commit -m "feat(data): add 지방은행 and 상호금융 records and fixtures"
```

---

### Task 19: Add 증권사

**Files:**
- Modify: `src/data/institutions.ts`
- Modify: `tests/fixtures/account-samples.ts`

> KFTC 등록 증권사 목록 (대표): 한국투자증권(243), 미래에셋증권(238), 삼성증권(240), NH투자증권(247), KB증권(218), 키움증권(264), 신한투자증권(266), 하나증권(270), 대신증권(267), 메리츠증권(287), 유안타증권(209), 교보증권(261), 한화투자증권(269), DB금융투자(238), IBK투자증권(265), BNK투자증권(224), 부국증권(290), 다올투자증권(227), 이베스트투자증권(265), SK증권(266), 케이프투자증권(292), 흥국증권(225). 코드는 KFTC 등록 표 기준.

> **Note:** 증권사 prefix는 은행보다 짧고 충돌이 잦다. 정확한 코드/패턴은 KFTC 문서 참조 필수.

- [ ] **Step 1: Append securities firm records**

For each, set `category: 'securities'`. Use slug like `kis` (한국투자), `mirae` (미래에셋), `samsung-securities`, etc.

- [ ] **Step 2: Add fixture samples**

At least 1 per institution.

- [ ] **Step 3: Run tests — expect PASS**

```bash
pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add src/data/institutions.ts tests/fixtures/account-samples.ts
git commit -m "feat(data): add 증권사 records and fixtures"
```

---

## Phase E: Documentation

### Task 20: README.md (한국어)

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# korean-bank-detector

한국 계좌번호로 금융기관(이름·KFTC 코드·SVG 로고)을 판별하는 pure-TypeScript ESM 라이브러리. 토스 결제 화면처럼 동작.

[![npm version](https://img.shields.io/npm/v/korean-bank-detector.svg)](https://www.npmjs.com/package/korean-bank-detector)
[![CI](https://github.com/mkroo/korean-bank-detector/actions/workflows/ci.yml/badge.svg)](https://github.com/mkroo/korean-bank-detector/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## 특징

- KFTC CMS 계좌번호체계 공식 데이터 기반
- 50+ 금융기관 (은행, 인터넷전문은행, 지방은행, 상호금융, 증권사)
- 공식 브랜드 로고 SVG 번들
- Tree-shake 친화 (`korean-bank-detector/logos/<code>` sub-path import)
- 의존성 0개, ESM only, TypeScript 타입 동봉

## 설치

\`\`\`bash
pnpm add korean-bank-detector
# or: npm i korean-bank-detector / yarn add korean-bank-detector
\`\`\`

요구사항: Node 20+ (ESM 환경)

## 빠르게 시작

\`\`\`ts
import { detect, detectOne } from 'korean-bank-detector'

const results = detect('110-436-387740')
// → [{ institution: { code: '088', name: '신한은행', ... }, logo: '<svg ...>', confidence: 1.0, ... }]

const top = detectOne('110-436-387740')
console.log(top?.institution.name) // '신한은행'
\`\`\`

### React에서 로고 표시

\`\`\`tsx
const top = detectOne(accountNumber)
return top ? <span dangerouslySetInnerHTML={{ __html: top.logo }} /> : null
\`\`\`

### 트리쉐이킹 친화 sub-path import

특정 은행 로고만 필요할 때 전체 데이터셋 번들 회피:

\`\`\`ts
import shinhanLogo from 'korean-bank-detector/logos/088'
// shinhanLogo: string (SVG)
\`\`\`

## API

| 함수 | 시그니처 | 설명 |
|---|---|---|
| `detect` | `(input: string) => DetectResult[]` | 모든 후보를 confidence 내림차순으로 반환 |
| `detectOne` | `(input: string) => DetectResult \| null` | 최상위 후보 |
| `getInstitution` | `(code: string) => Institution \| null` | 코드로 기관 조회 |
| `getInstitutionLogo` | `(code: string) => string \| null` | 코드로 SVG 조회 |
| `ALL_INSTITUTIONS` | `readonly Institution[]` | 전체 기관 메타데이터 |

타입 상세는 `src/types.ts` 참조.

## 동작 원리

1. 입력에서 하이픈·공백·점·언더스코어를 제거하고 숫자만 남김. 비숫자 잔여 → 빈 결과.
2. 각 기관의 `(prefix, lengths)` 패턴과 대조.
3. confidence = `(matched_prefix_length / max_prefix_length) × length_factor` (정확한 길이 일치 시 1.2배, 캡 1.0).
4. confidence 내림차순 정렬.

## 번들 사이즈 / Tree-shaking

| 임포트 방식 | gzip 추정 |
|---|---|
| `import { detect } from 'korean-bank-detector'` (전체 로고 포함) | ~30KB |
| `import shinhanLogo from 'korean-bank-detector/logos/088'` (단일 로고) | ~1KB |

## 지원 기관

전체 목록은 `ALL_INSTITUTIONS` 배열 또는 [`src/data/institutions.ts`](./src/data/institutions.ts) 참조.

새 기관 추가가 필요하면 [Issue 등록](https://github.com/mkroo/korean-bank-detector/issues/new?template=institution_request.yml)하거나 PR을 보내주세요. 자세한 절차는 [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## 상표 안내

본 패키지에 포함된 모든 로고는 각 금융기관의 상표이며, 식별 목적의 fair use로만 번들되어 있습니다. 각 기관의 endorsement를 의미하지 않습니다. 상세는 [`TRADEMARKS.md`](./TRADEMARKS.md).

## 기여

PR 환영합니다. 절차는 [`CONTRIBUTING.md`](./CONTRIBUTING.md). 행동 강령은 Contributor Covenant v2.1, [`CODE_OF_CONDUCT.md`](./.github/CODE_OF_CONDUCT.md).

## 라이선스

코드는 [MIT](./LICENSE). 로고는 각 기관 상표 정책 적용.

## Acknowledgements

- [jhaemin/korea-financial-account-number-detector](https://github.com/jhaemin/korea-financial-account-number-detector) — 매칭 컨셉 영감
- [simple-icons](https://github.com/simple-icons/simple-icons) — 브랜드 아이콘 정책 모델
- [금융결제원 (KFTC)](https://www.kftc.or.kr) — 공식 계좌번호체계 데이터
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Korean README"
```

---

### Task 21: CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Write `CONTRIBUTING.md`**

```markdown
# Contributing to korean-bank-detector

기여해주셔서 감사합니다. 본 문서는 새 기관 추가, 로고 추가/수정, 버그 수정 PR 작성 절차를 안내합니다.

## 행동 강령

본 프로젝트는 [Contributor Covenant v2.1](.github/CODE_OF_CONDUCT.md)을 따릅니다.

## 시작하기

\`\`\`bash
git clone https://github.com/mkroo/korean-bank-detector
cd korean-bank-detector
pnpm install
pnpm test
\`\`\`

요구사항: Node 20+, pnpm 9+.

## 프로젝트 구조

\`\`\`
src/
├── data/institutions.ts   # 기관 데이터 (수동 관리)
├── detect.ts              # 매칭/스코어링
├── normalize.ts           # 입력 정제
└── types.ts               # 공개 타입
assets/logos/              # 원본 SVG (slug-named)
scripts/build-logos.ts     # SVG → 빌드 산출물
tests/                     # vitest, fixture 포함
\`\`\`

자세한 설계는 [`docs/superpowers/specs/2026-05-08-korean-bank-detector-design.md`](./docs/superpowers/specs/2026-05-08-korean-bank-detector-design.md).

## 새 기관 추가

1. **데이터 출처**: [금융결제원 CMS 계좌번호체계](https://www.kftc.or.kr) 공식 문서에서 코드, 명칭, 과목코드(prefix), 자릿수(length) 확인.
2. `src/data/institutions.ts`에 다음 형식으로 추가:

   \`\`\`ts
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
   \`\`\`

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
```

- [ ] **Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add CONTRIBUTING with institution/logo PR procedures"
```

---

### Task 22: TRADEMARKS.md

**Files:**
- Create: `TRADEMARKS.md`

- [ ] **Step 1: Write `TRADEMARKS.md`**

```markdown
# Trademarks Notice

본 패키지(korean-bank-detector)에 포함된 모든 금융기관 로고와 명칭은 해당 기관의 등록상표 또는 상표입니다.

## 사용 목적

본 저장소는 각 금융기관의 로고와 명칭을 **식별(identification) 목적의 fair use**로 번들합니다. 본 패키지를 사용하거나 본 저장소에 로고가 포함된 사실은 어떠한 경우에도:

- 해당 기관의 endorsement, 후원, 제휴 관계를 의미하지 않습니다.
- 해당 기관과의 공식적인 관계를 시사하지 않습니다.

## 사용자 책임

본 패키지를 자신의 프로젝트에서 사용하시는 분들은:

- 사용 케이스가 해당 금융기관의 브랜드 가이드라인 및 상표 정책을 준수하는지 확인할 책임이 있습니다.
- 상업적 사용, 마케팅, 광고 등 특정 사용 케이스에는 별도의 권한이 필요할 수 있습니다.
- 본 패키지의 메인테이너는 사용자의 사용 케이스에 대한 법적 책임을 지지 않습니다.

## Takedown 정책

기관에서 로고/명칭의 본 저장소 포함을 원하지 않으시면:

1. [GitHub Issues](https://github.com/mkroo/korean-bank-detector/issues/new?template=logo_takedown.yml)에 logo takedown 템플릿으로 이슈 등록.
2. 또는 GitHub 내 다이렉트 메시지(메인테이너 @mkroo).

**응답 SLA**: 영업일 기준 3일 이내 해당 로고를 제거하고 patch 버전(예: 0.1.x)을 npm에 publish합니다.

## 라이선스 분리

- **코드**: [MIT 라이선스](./LICENSE) 적용. 자유롭게 사용/수정/재배포 가능.
- **로고 파일** (`assets/logos/*.svg`, 빌드 산출물 포함): 각 기관의 상표 정책 적용. MIT 적용 대상 아님.

## Disclaimer

라이선스 데이터는 시간이 지남에 따라 오래될 수 있습니다. 사용자는 자신의 사용 시점 기준으로 각 금융기관의 최신 브랜드 정책을 확인하시기 바랍니다.

본 메인테이너는 사용자가 본 패키지를 사용함으로써 발생하는 법적 분쟁에 대해 어떠한 책임도 지지 않습니다.
```

- [ ] **Step 2: Commit**

```bash
git add TRADEMARKS.md
git commit -m "docs: add TRADEMARKS notice (simple-icons style)"
```

---

### Task 23: CODE_OF_CONDUCT.md (Contributor Covenant 2.1)

**Files:**
- Create: `.github/CODE_OF_CONDUCT.md`

- [ ] **Step 1: Create directory and download Contributor Covenant 2.1**

```bash
mkdir -p .github
curl -sSL https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md \
  -o .github/CODE_OF_CONDUCT.md
```

- [ ] **Step 2: Replace contact placeholder**

Open `.github/CODE_OF_CONDUCT.md` and replace `[INSERT CONTACT METHOD]` with:

```
GitHub Issues at https://github.com/mkroo/korean-bank-detector/issues
```

- [ ] **Step 3: Commit**

```bash
git add .github/CODE_OF_CONDUCT.md
git commit -m "docs: add Contributor Covenant 2.1"
```

---

### Task 24: Issue templates + PR template

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/institution_request.yml`
- Create: `.github/ISSUE_TEMPLATE/logo_takedown.yml`
- Create: `.github/pull_request_template.md`

- [ ] **Step 1: Write `.github/ISSUE_TEMPLATE/bug_report.yml`**

```yaml
name: 버그 리포트
description: 잘못된 매칭, 빠진 기관, 빌드 오류 등 버그 신고
labels: ["bug"]
body:
  - type: input
    id: input
    attributes:
      label: 입력 계좌번호 (마스킹 가능)
      placeholder: "110-***-***740"
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: 기대 결과
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: 실제 결과
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: 패키지 버전
      placeholder: "0.1.0"
    validations:
      required: true
  - type: textarea
    id: env
    attributes:
      label: 환경 (Node 버전, 번들러)
```

- [ ] **Step 2: Write `.github/ISSUE_TEMPLATE/institution_request.yml`**

```yaml
name: 새 기관 추가 요청
description: 지원되지 않는 금융기관 추가 요청
labels: ["data", "enhancement"]
body:
  - type: input
    id: name
    attributes:
      label: 기관 정식 명칭
    validations:
      required: true
  - type: input
    id: code
    attributes:
      label: KFTC 코드 (3자리)
      placeholder: "088"
    validations:
      required: true
  - type: textarea
    id: patterns
    attributes:
      label: 계좌번호 패턴 (KFTC CMS 문서 기준 prefix·자릿수)
      placeholder: |
        - 110-xxx-xxxxxx (12자리)
        - 100-xxx-xxxxxx (12자리)
    validations:
      required: true
  - type: input
    id: kftc_source
    attributes:
      label: KFTC CMS 문서 출처 (페이지/날짜)
    validations:
      required: true
  - type: input
    id: logo_url
    attributes:
      label: 공식 BI/CI 페이지 URL (선택)
```

- [ ] **Step 3: Write `.github/ISSUE_TEMPLATE/logo_takedown.yml`**

```yaml
name: 로고 Takedown 요청
description: 본 저장소의 특정 기관 로고 제거 요청 (해당 기관 또는 공식 대리인 전용)
labels: ["takedown", "trademark"]
body:
  - type: markdown
    attributes:
      value: |
        본 폼은 금융기관의 공식 또는 권한 있는 대리인을 위한 것입니다.
        영업일 기준 3일 이내 해당 로고를 제거하고 patch 릴리스합니다.
  - type: input
    id: institution
    attributes:
      label: 대상 기관명
    validations:
      required: true
  - type: input
    id: code
    attributes:
      label: KFTC 코드
    validations:
      required: true
  - type: input
    id: requester
    attributes:
      label: 요청자 정보 (담당 부서, 연락처)
    validations:
      required: true
  - type: textarea
    id: reason
    attributes:
      label: 요청 사유
```

- [ ] **Step 4: Write `.github/pull_request_template.md`**

```markdown
## 변경 사항

<!-- 무엇을, 왜 -->

## PR 종류

- [ ] 🐛 버그 수정
- [ ] ✨ 새 기관 추가
- [ ] 🎨 로고 추가/수정 (출처 URL 필수)
- [ ] 📝 문서
- [ ] 🔧 빌드/CI
- [ ] ♻️ 리팩토링

## 체크리스트

- [ ] `pnpm test` 모두 통과
- [ ] `pnpm typecheck` 통과
- [ ] `pnpm lint` 통과
- [ ] 사용자 영향 변경이면 `pnpm changeset` 추가
- [ ] 로고 PR이면 `assets/logos/<slug>.svg` 상단에 `<!-- Source: <URL> -->` 추가

## 출처 (로고 PR 한정)

<!-- 공식 BI/CI 페이지 URL -->
```

- [ ] **Step 5: Commit**

```bash
git add .github/ISSUE_TEMPLATE/ .github/pull_request_template.md
git commit -m "docs: add issue templates (bug/institution/takedown) and PR template"
```

---

## Phase F: Release Infrastructure

### Task 25: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow (lint/typecheck/test/build)"
```

---

### Task 26: changesets

**Files:**
- Create: `.changeset/config.json`
- Create: `.changeset/README.md`
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Initialize changesets**

```bash
pnpm changeset init
```
Expected: creates `.changeset/config.json` and `.changeset/README.md`.

- [ ] **Step 2: Update `.changeset/config.json`**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

- [ ] **Step 3: Write `.github/workflows/release.yml`**

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: https://registry.npmjs.org

      - run: pnpm install --frozen-lockfile

      - run: pnpm build

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 4: Commit**

```bash
git add .changeset/ .github/workflows/release.yml
git commit -m "ci: add changesets config + release workflow"
```

---

### Task 27: Verify exports + npm publish dry run

**Files:** none (verification + first changeset)

- [ ] **Step 1: Clean build**

```bash
rm -rf dist
pnpm build
```
Expected: `dist/index.js`, `dist/index.d.ts`, `dist/logos/*.js` produced.

- [ ] **Step 2: Verify package contents**

```bash
pnpm pack --dry-run
```
Expected: includes `dist/`, `README.md`, `TRADEMARKS.md`, `LICENSE`, `package.json`. Excludes `src/`, `tests/`, `assets/`, `docs/`.

- [ ] **Step 3: Try `npm pack --json` to inspect**

```bash
npm pack --dry-run --json | head -80
```
Expected: package size < 200KB, file list matches `files` field.

- [ ] **Step 4: Add first changeset for v0.1.0**

```bash
pnpm changeset
```
Interactive prompts:
- Bump type: `minor`
- Summary: `Initial release: detect Korean bank from account number with KFTC patterns and brand logos`

This creates a new file in `.changeset/`.

- [ ] **Step 5: Commit changeset**

```bash
git add .changeset/
git commit -m "chore: add changeset for v0.1.0 initial release"
```

- [ ] **Step 6: Verify version bump locally (dry)**

```bash
pnpm changeset version
```
Expected: `package.json` version updated to `0.1.0`, `CHANGELOG.md` created/updated, changeset file removed.

- [ ] **Step 7: Commit version bump**

```bash
git add package.json CHANGELOG.md .changeset/
git commit -m "chore: release v0.1.0"
```

- [ ] **Step 8 (optional): Push + tag**

```bash
git push -u origin main
```

> **Halt before publish.** Do not run `pnpm release` (= `npm publish`) without user confirmation. The release workflow on `main` will publish via the changesets action once `NPM_TOKEN` is configured in repo secrets.

---

## Self-Review Checklist (executor: run before declaring done)

- [ ] All `pnpm test` pass on a clean clone (`rm -rf node_modules && pnpm install && pnpm test`).
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` pass.
- [ ] `dist/index.js` exports `detect`, `detectOne`, `getInstitution`, `getInstitutionLogo`, `ALL_INSTITUTIONS`.
- [ ] `dist/logos/088.js` (or any seeded code) default-exports SVG string.
- [ ] Coverage ≥ 95% lines.
- [ ] README, CONTRIBUTING, TRADEMARKS, CODE_OF_CONDUCT, issue templates, PR template all present.
- [ ] CI workflow file syntactically valid (push triggers will catch this on GitHub).
- [ ] No secrets, no .env, no auth tokens committed.
- [ ] First changeset added but `npm publish` not yet executed.

---

## Out of Scope (deferred to later versions)

- Full 50+ institution dataset for 증권사 (Task 19 covers a starter subset; community PRs fill the rest).
- React / Vue / Svelte component bindings → v0.2+.
- Account checksum validation (KFTC has no unified algorithm).
- Real-time account-name verification API integration (KFTC paid API).
