import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { fromISODate, relativeDay } from '../lib/constants'

/**
 * One entry in the list: date on the left, title and preview on the right.
 */
export default function EntryRow({ entry, index = 0 }) {
  const navigate = useNavigate()
  const date = fromISODate(entry.date)

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.04, 0.3),
        ease: [0.23, 1, 0.32, 1],
      }}
      onClick={() => navigate(`/entry/${entry.id}`)}
      className="group flex w-full items-start gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-mist"
    >
      <span className="mt-0.5 w-14 shrink-0 text-[12px] font-medium tabular-nums text-ink-3">
        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15.5px] font-medium text-ink">
          {entry.title || 'Untitled'}
        </span>
        {entry.note && (
          <span className="mt-0.5 block truncate text-[13.5px] text-ink-2">{entry.note}</span>
        )}
      </span>

      <span className="mt-0.5 hidden shrink-0 text-[12px] text-ink-3 sm:block">
        {relativeDay(entry.date)}
      </span>
    </motion.button>
  )
}
