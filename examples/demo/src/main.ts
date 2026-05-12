import { detect, ALL_INSTITUTIONS } from 'korean-bank-detector'
import type { DetectResult, InstitutionCategory } from 'korean-bank-detector'

const CATEGORY_LABEL: Record<InstitutionCategory, string> = {
  bank: '시중은행',
  'internet-bank': '인터넷은행',
  regional: '지방은행',
  special: '특수은행',
  mutual: '상호금융',
  securities: '증권',
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )
}

function mountLayout(): void {
  const app = document.getElementById('app')
  if (!app) throw new Error('#app not found')
  app.innerHTML = `
    <nav class="nav">
      <a class="brand" href="https://github.com/mkroo/korean-bank-detector" target="_blank" rel="noreferrer">
        <span class="brand-mark">K</span>
        korean-bank-detector
      </a>
      <div class="nav-links">
        <a class="nav-link" href="https://github.com/mkroo/korean-bank-detector" target="_blank" rel="noreferrer">GitHub</a>
        <a class="nav-link" href="https://www.npmjs.com/package/korean-bank-detector" target="_blank" rel="noreferrer">npm</a>
      </div>
    </nav>

    <header class="hero">
      <h1>계좌번호로 은행 찾기</h1>
      <p>토스 결제 화면처럼, 계좌번호를 입력하면 어떤 금융기관의 계좌인지 자동으로 판별합니다. 현재 ${ALL_INSTITUTIONS.length}개 기관을 지원합니다.</p>
    </header>

    <section class="input-card">
      <label class="input-label" for="account">계좌번호</label>
      <input
        id="account"
        class="account-input"
        placeholder="110-436-387740"
        autocomplete="off"
        inputmode="numeric"
        spellcheck="false"
        aria-describedby="helper"
      />
      <div class="helper" id="helper">하이픈·공백·점 모두 허용됩니다. 숫자만 인식해요.</div>
    </section>

    <section class="results" id="results" aria-live="polite"></section>

    <section class="snippet-card" aria-label="코드 예시">
      <pre id="snippet"></pre>
    </section>

    <footer>
      <a href="https://github.com/mkroo/korean-bank-detector">korean-bank-detector</a> · MIT License · 데이터 출처 <a href="https://www.cmsedi.or.kr/cms/board/workdata" target="_blank" rel="noreferrer">금융결제원 CMS</a>
    </footer>
  `
}

function renderEmpty(message: string, icon: string): string {
  return `
    <div class="empty">
      <div class="empty-icon">${icon}</div>
      <div>${message}</div>
    </div>
  `
}

function renderCandidate(r: DetectResult): string {
  const initial = r.institution.shortName.slice(0, 2)
  const logoMarkup = r.logo && r.logo.length > 0
    ? r.logo
    : `<span class="logo-initial">${escapeHtml(initial)}</span>`
  const pct = Math.round(r.confidence * 100)
  const category = CATEGORY_LABEL[r.institution.category]
  return `
    <div class="candidate" role="listitem">
      <div class="logo" aria-hidden="true">${logoMarkup}</div>
      <div class="candidate-info">
        <div class="candidate-name">${escapeHtml(r.institution.name)}</div>
        <div class="candidate-meta">
          <span class="candidate-category">${escapeHtml(category)}</span>
          코드 ${escapeHtml(r.institution.code)} · 패턴 ${escapeHtml(r.matchedPattern || '—')}
        </div>
      </div>
      <div class="candidate-confidence">
        <div class="confidence-value">${pct}%</div>
        <div class="confidence-bar"><div class="confidence-fill" style="width: ${pct}%"></div></div>
      </div>
    </div>
  `
}

function renderResults(value: string, results: DetectResult[]): void {
  const el = document.getElementById('results')
  if (!el) return
  const trimmed = value.trim()
  if (trimmed === '') {
    el.innerHTML = renderEmpty(
      '계좌번호를 입력하면 매칭되는 은행이 여기에 표시됩니다.',
      '🏦',
    )
    return
  }
  if (results.length === 0) {
    el.innerHTML = renderEmpty(
      '매칭되는 기관이 없습니다.<br>입력값을 다시 확인해 보세요.',
      '🔍',
    )
    return
  }
  const top = results.slice(0, 5)
  const header = `
    <div class="results-header">
      <span class="results-title">매칭된 후보</span>
      <span class="results-count">${results.length}개 중 상위 ${top.length}개</span>
    </div>
  `
  el.innerHTML = header + top.map(renderCandidate).join('')
}

function renderSnippet(value: string, results: DetectResult[]): void {
  const el = document.getElementById('snippet')
  if (!el) return
  if (value.trim() === '') {
    el.innerHTML = `<span class="snippet-comment">// 계좌번호를 입력하면 detect() 호출 결과가 여기에 표시됩니다.</span>`
    return
  }
  const top = results[0]
  const more = Math.max(0, results.length - 1)
  const result = top
    ? `[
  {
    institution: {
      code: ${JSON.stringify(top.institution.code)},
      name: ${JSON.stringify(top.institution.name)},
      slug: ${JSON.stringify(top.institution.slug)},
      category: ${JSON.stringify(top.institution.category)},
      ...
    },
    confidence: ${top.confidence},
    matchedPattern: ${JSON.stringify(top.matchedPattern)},
    logo: ${top.logo ? "'<svg ...>'" : "''"},
  },${more > 0 ? `\n  // + ${more} more` : ''}
]`
    : '[]'

  const code =
    `<span class="snippet-keyword">import</span> { <span class="snippet-property">detect</span> } <span class="snippet-keyword">from</span> <span class="snippet-string">'korean-bank-detector'</span>\n\n` +
    `<span class="snippet-keyword">const</span> result = <span class="snippet-property">detect</span>(<span class="snippet-string">${escapeHtml(JSON.stringify(value))}</span>)\n` +
    `<span class="snippet-comment">// =&gt;</span> ${escapeHtml(result)}`

  el.innerHTML = code
}

function update(value: string): void {
  const results = detect(value)
  renderResults(value, results)
  renderSnippet(value, results)
}

function init(): void {
  mountLayout()
  const input = document.getElementById('account') as HTMLInputElement | null
  if (!input) throw new Error('input not found')

  input.addEventListener('input', () => update(input.value))
  update('')
  input.focus()
}

init()
