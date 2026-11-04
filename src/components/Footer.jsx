import Logo from './Logo'

/**
 * Small sign-off at the bottom of every page.
 */
export default function Footer() {
  return (
    <footer className="mt-16 flex items-center justify-center gap-2 border-t border-line/70 py-7 text-[12.5px] text-ink-3">
      <Logo size={18} className="text-ink-3/80" />
      <span>Zhenis Magzhan</span>
    </footer>
  )
}
