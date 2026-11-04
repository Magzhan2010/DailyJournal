import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useJournal } from '../lib/journal-context'
import Editor from '../components/Editor'

/**
 * A blank page for a new note.
 */
export default function NewEntry() {
  const navigate = useNavigate()
  const { saveEntry } = useJournal()
  const [savedId, setSavedId] = useState(null)

  const handleSave = useCallback(
    async (draft) => {
      const saved = await saveEntry(draft)
      if (saved?.id) setSavedId(saved.id)
      return saved
    },
    [saveEntry]
  )

  return (
    <div className="animate-fade-up">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="btn btn-quiet mb-6 !px-3"
      >
        <ArrowLeft size={15} />
        Cancel
      </button>

      <h1 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
        New entry
      </h1>

      <Editor
        entry={null}
        autoFocus
        onSave={handleSave}
        onAutosave={handleSave}
      />

      {savedId && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-end gap-2"
        >
          <button type="button" onClick={() => navigate('/')} className="btn btn-quiet">
            Done
          </button>
          <button
            type="button"
            onClick={() => navigate(`/entry/${savedId}`)}
            className="btn btn-primary"
          >
            Open entry
            <ArrowRight size={15} />
          </button>
        </motion.div>
      )}
    </div>
  )
}
