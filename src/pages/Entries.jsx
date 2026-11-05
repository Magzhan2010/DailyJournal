import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJournal } from '../lib/journal-context'
import JournalPost from '../components/JournalPost'

export default function Entries() {
  const { entries, loading, removeEntry } = useJournal()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((entry) =>
      String(entry.note || '').replace(/<[^>]*>/g, ' ').toLowerCase().includes(q)
    )
  }, [entries, query])

  /* "/" jumps to the search */
  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="lj-frame">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line-soft)] px-5 py-4">
          <div>
            <h1 className="font-serif text-[24px] font-bold italic text-[var(--color-lj-blue)]">
              Zuckonit
            </h1>
            <p className="mt-0.5 text-[12px] text-[var(--color-ink-4)]">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in this journal
            </p>
          </div>

          <div className="relative w-full sm:w-[260px]">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the journal…  (press /)"
              className="lj-input"
            />
          </div>
        </div>

        <div className="px-5 pb-3">
          {loading ? (
            <div className="space-y-4 py-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded bg-[var(--color-panel)]" />
              ))}
            </div>
          ) : filtered.length ? (
            filtered.map((entry, index) => (
              <JournalPost
                key={entry.id}
                entry={entry}
                index={index}
                onEdit={() => navigate(`/entry/${entry.id}`)}
                onDelete={() => removeEntry(entry.id)}
              />
            ))
          ) : (
            <p className="py-12 text-center text-[13px] text-[var(--color-ink-4)]">
              {query ? 'Nothing in the journal matches that.' : 'The journal is empty.'}
            </p>
          )}
        </div>
      </div>

      <footer className="mt-6 border-t border-[var(--color-line-soft)] py-4 text-center text-[11.5px] text-[var(--color-ink-4)]">
        Zuckonit — powered by my note · © Zhenis Magzhan
      </footer>
    </div>
  )
}
