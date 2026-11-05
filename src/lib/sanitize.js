/**
 * Tiny HTML sanitiser — the journal stores raw markup the way LiveJournal did,
 * so we only let a handful of harmless tags through.
 */

const ALLOWED = new Set(['p', 'i', 'b', 'em', 'strong', 'br', 'a', 'u', 'blockquote', 'code'])

export function safeHtml(html = '') {
  return String(html)
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag) => {
      const name = tag.toLowerCase()
      if (!ALLOWED.has(name)) return ''
      if (match.startsWith('</')) return `</${name}>`
      return `<${name}>`
    })
}
