import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useJournal } from '../lib/journal-context'
import { formatLongDate, greeting, PROMPTS, toISODate } from '../lib/constants'
import Editor from '../components/Editor'
import EntryRow from '../components/EntryRow'

/** The prompt of the day — one question, nothing else. */
function promptFor(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000)
  return PROMPTS[dayOfYear % PROMPTS.length]
}

export default function Today() {
  const { entries, loading, saveEntry } = useJournal()
  const [now] = useState(() => new Date())
  const [seed, setSeed] = useState('')

  const today = toISODate(now)
  const prompt = promptFor(now)
  const todayEntry = entries.find((e) => e.date === today) || null
  const recent = entries.filter((e) => e.id !== todayEntry?.id).slice(0, 5)

  return (
    <div className="animate-fade-up space-y-10">
      {/* greeting */}
      <header>
        <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-brand-ink">
          {formatLongDate(today)}
        </div>
        <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[34px]">
          {greeting(now)}
        </h1>
      </header>

      {/* the prompt — one quiet line, click to use it */}
      <button
        type="button"
        onClick={() => setSeed(prompt)}
        className="group flex items-start gap-3 text-left text-[15px] leading-relaxed text-ink-2 transition-colors hover:text-ink"
      >
        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand transition-transform duration-300 group-hover:scale-125" />
        <span className="italic">{prompt}</span>
      </button>

      {/* writing surface */}
      <Editor
        key="today"
        entry={todayEntry}
        seed={seed}
        onSave={saveEntry}
        onAutosave={saveEntry}
        autoFocus={!loading && !todayEntry}
      />

      {/* recent */}
      {!loading && recent.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              Recent
            </h2>
            <Link
              to="/entries"
              className="text-[13px] font-medium text-brand-ink transition-colors hover:text-brand"
            >
              All entries
            </Link>
          </div>

          <div className="-mx-4 space-y-0.5">
            {recent.map((entry, index) => (
              <EntryRow key={entry.id} entry={entry} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
