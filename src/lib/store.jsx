import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  listEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  isLiveBackend,
  setLocalOnly,
} from './api'
import { JournalContext } from './journal-context'
import { computeStreak } from './constants'

export function JournalProvider({ children }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  const entriesRef = useRef(entries)
  useEffect(() => {
    entriesRef.current = entries
  }, [entries])

  const refresh = useCallback(async () => {
    try {
      const data = await listEntries()
      setEntries(sortEntries(data))
      setOffline(false)
      setLocalOnly(false)
    } catch (err) {
      console.warn('[my-note] local mode:', err.message)
      setOffline(true)
      setLocalOnly(true)
      try {
        const local = await listEntries()
        setEntries(sortEntries(local))
      } catch {
        setEntries([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(refresh)
    return () => cancelAnimationFrame(frame)
  }, [refresh])

  /** Create when there is no id, update otherwise. */
  const saveEntry = useCallback(async (draft) => {
    const existing = draft.id
      ? entriesRef.current.find((e) => String(e.id) === String(draft.id))
      : null

    const payload = {
      id: draft.id,
      title: draft.title || '',
      note: draft.note || '',
      created_at: existing?.created_at,
    }

    const saved = draft.id
      ? await updateEntry(draft.id, payload)
      : await createEntry(payload)

    if (!saved) return null

    setEntries((current) => {
      const same = current.some((e) => String(e.id) === String(saved.id))
      const next = same
        ? current.map((e) => (String(e.id) === String(saved.id) ? saved : e))
        : [saved, ...current.filter((e) => String(e.id) !== String(payload.id))]
      return sortEntries(next)
    })

    return saved
  }, [])

  const removeEntry = useCallback(async (id) => {
    await deleteEntry(id)
    setEntries((current) => current.filter((e) => String(e.id) !== String(id)))
  }, [])

  const streak = useMemo(() => computeStreak(entries.map((e) => e.date)), [entries])

  const value = useMemo(
    () => ({ entries, loading, offline, streak, refresh, saveEntry, removeEntry, live: isLiveBackend }),
    [entries, loading, offline, streak, refresh, saveEntry, removeEntry]
  )

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
}

function sortEntries(list) {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}
