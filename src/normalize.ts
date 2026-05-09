// Only ASCII digits [0-9] are accepted. Full-width or non-Latin digits are rejected.
const SEPARATOR_RE = /[\s\-._]/g
const DIGITS_ONLY_RE = /^\d*$/

export function normalize(input: string): string {
  if (!input) return ''
  const stripped = input.replace(SEPARATOR_RE, '')
  return DIGITS_ONLY_RE.test(stripped) ? stripped : ''
}
