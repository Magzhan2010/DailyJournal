import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useJournal } from '../lib/journal-context'
import EntryRow from '../components/EntryRow'

export default function Entries() {
  const { entries, loading } = useJournal()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((entry) =>
      [entry.title, entry.note].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [entries, query])

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[34px]">
            Entries
          </h1>
          <p className="mt-2 text-[14px] text-ink-2">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-[240px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="field !h-10 !pl-9"
            />
          </div>

          <Link
            to="/new"
            title="New entry"
            aria-label="New entry"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0_4px_12px_rgba(0,113,227,0.28)] transition-transform duration-200 hover:scale-105 hover:bg-brand-hover active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-mist" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="-mx-4 space-y-0.5">
          {filtered.map((entry, index) => (
            <EntryRow key={entry.id} entry={entry} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-ink">
            {query ? 'Nothing matches that search' : 'No entries yet'}
          </p>
          <p className="mt-1 text-[13.5px] text-ink-3">
            {query ? 'Try another word.' : 'Write your first one on the Today page.'}
          </p>
        </div>
      )}
    </div>
  )
}
