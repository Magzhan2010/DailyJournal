import { Link, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useJournal } from '../lib/journal-context'

const LINKS = [
  { to: '/', label: 'Today' },
  { to: '/entries', label: 'Entries' },
]

/**
 * A thin, quiet top bar. Nothing else.
 */
export default function Header() {
  const { pathname } = useLocation()
  const { streak, offline } = useJournal()

  return (
    <header className="glass sticky top-0 z-30 border-b border-line">
      <div className="mx-auto flex h-16 max-w-[760px] items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand text-white shadow-[0_4px_12px_rgba(0,113,227,0.28)]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </span>
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-ink">My Note</span>
        </Link>

        <div className="flex items-center gap-4">
          {streak > 0 && (
            <span className="hidden text-[12.5px] font-medium text-ink-3 sm:inline">
              {streak} day streak
            </span>
          )}

          <nav className="flex items-center gap-4">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-active={link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!offline && (
            <span className="hidden h-1.5 w-1.5 rounded-full bg-[#34c759] sm:block" title="Connected to the backend" />
          )}

          <Link
            to="/new"
            title="New entry"
            aria-label="New entry"
            className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white shadow-[0_4px_12px_rgba(0,113,227,0.28)] transition-transform duration-200 hover:scale-105 hover:bg-brand-hover active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </header>
  )
}
