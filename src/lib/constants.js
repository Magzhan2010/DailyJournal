/**
 * Small helpers: prompts, dates, word counts.
 */

/** The journal's name — 2003 LiveJournal style: a name + "oit". */
export const SITE_NAME = 'magishoit'

export const PROMPTS = [
  'What are you building that nobody else can see yet?',
  'What did you learn today that changes a decision?',
  'If today had a single headline, what would it be?',
  'What are you avoiding? Name the smallest next step.',
  'What would you tell yourself from a year ago?',
  'What problem do you keep seeing that nobody has solved?',
]

/* ------------------------------------------------------------------ */
/* Dates                                                              */
/* ------------------------------------------------------------------ */

export function toISODate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISODate(iso) {
  return new Date(`${iso}T00:00:00`)
}

export function formatLongDate(iso) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(fromISODate(iso))
}

export function formatShortDate(iso) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(fromISODate(iso))
}

export function relativeDay(iso, today = new Date()) {
  const target = fromISODate(iso)
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = Math.round((base - target) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff > 1 && diff < 7) return `${diff} days ago`
  return formatShortDate(iso)
}

export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 5) return 'Still up'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/* ------------------------------------------------------------------ */
/* Text                                                               */
/* ------------------------------------------------------------------ */

export function countWords(text = '') {
  const trimmed = String(text).trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function excerpt(text = '', max = 120) {
  const clean = String(text).replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trimEnd()}…`
}

/** Consecutive days with an entry, counting back from today. */
export function computeStreak(dates, today = new Date()) {
  const set = new Set(dates)
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let cursor = new Date(base)
  if (!set.has(toISODate(cursor))) {
    cursor = new Date(base.getTime() - 86400000)
    if (!set.has(toISODate(cursor))) return 0
  }
  let streak = 0
  while (set.has(toISODate(cursor))) {
    streak += 1
    cursor = new Date(cursor.getTime() - 86400000)
  }
  return streak
}
