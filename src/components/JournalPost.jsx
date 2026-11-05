import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fromISODate } from '../lib/constants'
import { safeHtml } from '../lib/sanitize'

/**
 * One entry in the journal — the classic LiveJournal reading view.
 */
export default function JournalPost({ entry, index = 0, onEdit, onDelete }) {
  const navigate = useNavigate()
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
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.04, 0.25),
        ease: [0.23, 1, 0.32, 1],
      }}
      className="lj-post group"
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/entry/${entry.id}`)}
          className="lj-date hover:text-[var(--color-lj-blue)]"
        >
          {stamp}
        </button>

        <div className="flex items-center gap-3 text-[11.5px]">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Edit"
              className="lj-link opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100"
            >
              edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete"
              className="lj-link opacity-0 transition-opacity hover:!text-[#d93025] group-hover:opacity-100 sm:opacity-100"
            >
              <Trash2 size={12} className="inline" />
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/entry/${entry.id}`)}
        className="block w-full text-left"
      >
        <div
          className="lj-body mt-1.5"
          dangerouslySetInnerHTML={{ __html: safeHtml(entry.note) }}
        />
      </button>
    </motion.article>
  )
}
