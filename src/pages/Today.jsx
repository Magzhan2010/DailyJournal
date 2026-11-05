import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJournal } from '../lib/journal-context'
import { PROMPTS, SITE_NAME } from '../lib/constants'
import PostComposer from '../components/PostComposer'
import JournalPost from '../components/JournalPost'

export default function Today() {
  const { entries, loading, saveEntry, removeEntry } = useJournal()
  const navigate = useNavigate()
  const [seed, setSeed] = useState('')

  return (
    <div className="mx-auto max-w-[860px]">
      <PostComposer
        key="composer"
        entry={null}
        seed={seed}
        onSave={saveEntry}
        onAutosave={saveEntry}
      />

      {/* the daily prompts, the way a sidebar would carry them */}
      <div className="lj-panel mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-[12.5px]">
        <span className="font-bold text-[var(--color-ink-3)]">Prompts</span>
        {PROMPTS.slice(0, 3).map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setSeed(prompt)}
            className="lj-link hover:underline"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* the journal */}
      <section className="lj-frame mt-6 px-5 pb-2">
        <div className="flex items-center justify-between border-b border-[var(--color-line-soft)] py-3">
          <h2 className="font-serif text-[17px] font-bold italic text-[var(--color-lj-blue)]">
            Recent entries
          </h2>
          <span className="text-[12px] text-[var(--color-ink-4)]">{entries.length} total</span>
        </div>

        {loading ? (
          <div className="space-y-4 py-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-[var(--color-panel)]" />
            ))}
          </div>
        ) : entries.length ? (
          entries.slice(0, 6).map((entry, index) => (
            <JournalPost
              key={entry.id}
              entry={entry}
              index={index}
              onEdit={() => navigate(`/entry/${entry.id}`)}
              onDelete={() => removeEntry(entry.id)}
            />
          ))
        ) : (
          <p className="py-10 text-center text-[13px] text-[var(--color-ink-4)]">
            Nothing posted yet. Write the first one above.
          </p>
        )}

        {entries.length > 6 && (
          <div className="border-t border-[var(--color-line-soft)] py-3 text-center">
            <button
              type="button"
              onClick={() => navigate('/entries')}
              className="lj-link text-[12.5px]"
            >
              View the whole journal →
            </button>
          </div>
        )}
      </section>

      {/* the classic footer */}
      <footer className="mt-6 border-t border-[var(--color-line-soft)] py-4 text-center text-[11.5px] text-[var(--color-ink-4)]">
        {SITE_NAME} — powered by my note · © Zhenis Magzhan
      </footer>
    </div>
  )
}
