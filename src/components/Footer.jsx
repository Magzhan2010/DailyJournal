import Logo from './Logo'

/**
 * Small sign-off at the bottom of every page.
 */
export default function Footer() {
  return (
    <footer className="mt-12 flex items-center justify-center gap-1.5 border-t border-line/60 py-4 text-[11.5px] text-ink-3/80">
      <Logo size={14} variant="simple" className="opacity-70" />
      <span>Zhenis Magzhan</span>
    </footer>
  )
}
