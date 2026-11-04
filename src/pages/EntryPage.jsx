import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useJournal } from '../lib/journal-context'
import { formatLongDate } from '../lib/constants'
import Editor from '../components/Editor'

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

  /* the Save button finishes the edit */
  const handleSave = useCallback(
    async (draft) => {
      const saved = await saveEntry(draft)
      if (saved) {
        setEditing(false)
        // the backend has no PUT endpoint, so an edit can create a new row
        if (String(saved.id) !== String(id)) {
          navigate(`/entry/${saved.id}`, { replace: true })
        }
      }
      return saved
    },
    [id, navigate, saveEntry]
  )

  /* the autosave stays quiet — it must never close the editor */
  const handleAutosave = useCallback(
    async (draft) => saveEntry(draft),
    [saveEntry]
  )

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
      <div className="animate-fade-up py-20 text-center">
        <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-ink">Entry not found</h1>
        <p className="mt-2 text-[14px] text-ink-2">It may have been deleted.</p>
        <button type="button" onClick={() => navigate('/')} className="btn btn-primary mt-6">
          Back to Today
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button type="button" onClick={() => navigate('/entries')} className="btn btn-quiet !px-3">
          <ArrowLeft size={15} />
          Entries
        </button>

        {!editing && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setEditing(true)} className="btn btn-quiet">
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className={`btn !px-3.5 ${
                confirming
                  ? 'bg-[#ff3b30] text-white'
                  : 'bg-mist text-ink-3 hover:text-[#ff3b30]'
              }`}
            >
              <Trash2 size={15} />
              {confirming ? 'Tap again' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <Editor
            key={entry.id}
            entry={entry}
            onSave={handleSave}
            onAutosave={handleAutosave}
            onCancel={() => setEditing(false)}
          />
        </motion.div>
      ) : (
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="card group px-6 py-8 sm:px-10 sm:py-10"
        >
          <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
            {formatLongDate(entry.date)}
          </div>

          {/* click the title to edit it in place */}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="group/title mt-2 block w-full text-left"
          >
            <h1 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[36px]">
              {entry.title || 'Untitled'}
            </h1>
            <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-ink-3 opacity-0 transition-opacity group-hover/title:opacity-100">
              <Pencil size={12} />
              click to edit
            </span>
          </button>

          <div className="relative mt-4">
            <div className="prose">
              {entry.note || <span className="italic text-ink-3">This entry is empty.</span>}
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="absolute -top-8 right-0 hidden items-center gap-1 rounded-lg bg-mist px-2 py-1 text-[12px] font-medium text-ink-2 transition-colors hover:bg-brand-soft hover:text-brand-ink group-hover:inline-flex"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
        </motion.article>
      )}
    </div>
  )
}
