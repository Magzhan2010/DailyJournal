import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const LINKS = [
  { to: '/', label: 'Make a post' },
  { to: '/entries', label: 'View journal' },
]

/**
 * The old LiveJournal header: site name on the left, links on the right.
 */
export default function SiteHeader() {
  const { pathname } = useLocation()

  return (
    <header className="lj-header">
      <div className="mx-auto flex h-14 max-w-[860px] items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={22} variant="simple" className="rounded-[4px]" />
          <span className="font-serif text-[19px] font-bold italic tracking-[-0.01em] text-[var(--color-lj-blue)]">
            Zuckonit
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-5 text-[13px]">
          {LINKS.map((link) => {
            const active =
              link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={active ? 'lj-link font-semibold' : 'lj-link'}
              >
                {link.label}
              </Link>
            )
          })}
          <span className="hidden text-[12px] text-[var(--color-ink-4)] sm:inline">
            my note
          </span>
        </nav>
      </div>
    </header>
  )
}
