/**
 * Data layer.
 *
 * Talks to the FastAPI backend:
 *   GET    /journal        -> [{ id, title, note }]
 *   POST   /journal        { title, note }  -> { message }
 *   PUT    /journal/{id}   { title, note }  -> the row
 *   DELETE /journal/{id}                   -> { message }
 *
 * If the backend cannot be reached the app keeps working with localStorage
 * ("local mode"), so you can build the UI without the API.
 *
 * Set VITE_API_URL for a hosted backend; leave it empty and Vite proxies
 * /journal to http://127.0.0.1:8000 in development.
 */

import { countWords, toISODate } from './constants'

const API_BASE = String(import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
const FORCE_LOCAL = String(import.meta.env.VITE_USE_LOCAL || '').toLowerCase() === 'true'

export const isLiveBackend = !FORCE_LOCAL

let localOnly = FORCE_LOCAL

export function setLocalOnly(value) {
  localOnly = Boolean(value)
}

const STORE_KEY = 'my-note-entries'

/* ------------------------------------------------------------------ */
/* Local fallback                                                     */
/* ------------------------------------------------------------------ */

const SEED = [
  {
    daysAgo: 0,
    title: 'The thing nobody sees yet',
    note: 'Shipped the first version of the onboarding flow today. Six screens, three of them still ugly, but the loop finally closes.\n\nThe insight was embarrassingly simple: people do not want a dashboard, they want the thing they came for in the first ten seconds.',
  },
  {
    daysAgo: 1,
    title: 'Reading the room',
    note: 'Talked to three people who use the old flow. All three said the same sentence in different words: "I am not sure where to click."\n\nThat is not a UI problem, that is a naming problem.',
  },
  {
    daysAgo: 3,
    title: 'A day of small things',
    note: 'Nothing dramatic. Fixed the sync bug from Tuesday, wrote 400 words of spec, walked 20 minutes without headphones.\n\nSmall days are fine.',
  },
  {
    daysAgo: 6,
    title: 'Ship the ugly one',
    note: 'Reminder to self: the first version of everything I love looked embarrassing. Polish is a reward for surviving contact with reality.',
  },
]

function seedEntries() {
  const today = new Date()
  return SEED.map((seed, index) => {
    const date = toISODate(new Date(today.getTime() - seed.daysAgo * 86400000))
    return {
      id: `seed-${index + 1}`,
      title: seed.title,
      note: seed.note,
      created_at: `${date}T12:00:00.000Z`,
    }
  })
}

function readStore() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (!raw) {
      const seeded = seedEntries()
      window.localStorage.setItem(STORE_KEY, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStore(entries) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORE_KEY, JSON.stringify(entries))
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `entry-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

const sleep = (ms = 140) => new Promise((resolve) => setTimeout(resolve, ms))

/* ------------------------------------------------------------------ */
/* Transport                                                          */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError(
      API_BASE
        ? `Cannot reach the backend at ${API_BASE}`
        : 'Cannot reach the backend (is it running on :8000?)',
      0
    )
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(
      `Journal API ${res.status}: ${body.slice(0, 160) || res.statusText}`,
      res.status
    )
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

function asList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.entries)) return payload.entries
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

export async function listEntries() {
  if (isLiveBackend && !localOnly) {
    const rows = asList(await request('/journal'))
    return rows.map(normalizeEntry)
  }
  await sleep()
  return readStore().map(normalizeEntry)
}

export async function createEntry(payload) {
  const body = { title: payload.title || '', note: payload.note || '' }

  if (isLiveBackend && !localOnly) {
    await request('/journal', { method: 'POST', body: JSON.stringify(body) })
    // the endpoint answers with a message only — read the row back
    const rows = asList(await request('/journal'))
    const newest = rows.reduce((acc, row) => (!acc || Number(row.id) > Number(acc.id) ? row : acc), null)
    return newest ? normalizeEntry(newest) : normalizeEntry({ ...body })
  }

  const entry = { id: newId(), ...body, created_at: new Date().toISOString() }
  await sleep(180)
  const entries = readStore()
  entries.unshift(entry)
  writeStore(entries)
  return normalizeEntry(entry)
}

export async function updateEntry(id, payload) {
  const body = { title: payload.title || '', note: payload.note || '' }

  if (isLiveBackend && !localOnly) {
    try {
      const raw = await request(`/journal/${id}`, { method: 'PUT', body: JSON.stringify(body) })
      return normalizeEntry(raw && raw.id ? raw : { ...body, id })
    } catch (err) {
      // no PUT endpoint yet — replace the row instead
      if (err.status !== 404 && err.status !== 405) throw err
      await request(`/journal/${id}`, { method: 'DELETE' })
      const created = await createEntry(payload)
      return created
    }
  }

  await sleep(150)
  const entries = readStore()
  const index = entries.findIndex((e) => String(e.id) === String(id))
  if (index === -1) return null
  entries[index] = { ...entries[index], ...body }
  writeStore(entries)
  return normalizeEntry(entries[index])
}

export async function deleteEntry(id) {
  if (isLiveBackend && !localOnly) {
    await request(`/journal/${id}`, { method: 'DELETE' })
    return { ok: true }
  }
  await sleep(150)
  writeStore(readStore().filter((e) => String(e.id) !== String(id)))
  return { ok: true }
}

/**
 * Frontend shape of an entry: `note` becomes the body, `created_at` the date.
 */
export function normalizeEntry(raw = {}) {
  const note = raw.note ?? raw.content ?? ''
  const created = raw.created_at || raw.createdAt || new Date().toISOString()
  return {
    id: raw.id,
    title: raw.title || '',
    note,
    created_at: created,
    date: toISODate(new Date(created)),
    words: countWords(note),
  }
}
