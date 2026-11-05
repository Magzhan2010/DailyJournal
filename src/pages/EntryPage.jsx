import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useJournal } from '../lib/journal-context'
import { fromISODate } from '../lib/constants'
import { safeHtml } from '../lib/sanitize'
import PostComposer from '../components/PostComposer'

export default function EntryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { entries, saveEntry, removeEntry } = useJournal()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const entry = useMemo(
    () => entries.find((e) => String(e.id) === String(id)) || null,
    [entries, id]
  )

  const handleSave = useCallback(
    async (draft) => {
      const saved = await saveEntry(draft)
      if (saved) {
        setEditing(false)
        if (String(saved.id) !== String(id)) {
          navigate(`/entry/${saved.id}`, { replace: true })
        }
      }
      return saved
    },
    [id, navigate, saveEntry]
  )

  const handleAutosave = useCallback(async (draft) => saveEntry(draft), [saveEntry])

  const onDelete = async () => {
    if (!confirming) {
      setConfirming(true)
      window.setTimeout(() => setConfirming(false), 3500)
      return
    }
    await removeEntry(entry.id)
    navigate('/entries')
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-[860px]">
        <div className="lj-frame px-6 py-16 text-center">
          <h1 className="font-serif text-[20px] font-bold italic text-[var(--color-lj-blue)]">
            Entry not found
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-ink-4)]">
            It may have been deleted from the journal.
          </p>
          <button type="button" onClick={() => navigate('/')} className="lj-btn mt-5">
            Back to the post page
          </button>
        </div>
      </div>
    )
  }

  const date = fromISODate(entry.date)
  const stamp = entry.created_at
    ? new Date(entry.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/entries')}
          className="lj-link text-[12.5px]"
        >
          ← View journal
        </button>

        {!editing && (
          <div className="flex items-center gap-3 text-[12px]">
            <button type="button" onClick={() => setEditing(true)} className="lj-link">
              edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className={`lj-link ${confirming ? '!text-[#d93025]' : ''}`}
            >
              {confirming ? (
                'tap again to delete'
              ) : (
                <>
                  <Trash2 size={12} className="inline" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <PostComposer
            key={entry.id}
            entry={entry}
            onSave={handleSave}
            onAutosave={handleAutosave}
            onCancel={() => setEditing(false)}
          />
        </motion.div>
      ) : (
        <motion.article
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="lj-frame px-5 py-5"
        >
          <div className="lj-date">{stamp}</div>
          <div
            className="lj-body mt-2 text-[15.5px]"
            dangerouslySetInnerHTML={{ __html: safeHtml(entry.note) }}
          />
        </motion.article>
      )}
    </div>
  )
}
