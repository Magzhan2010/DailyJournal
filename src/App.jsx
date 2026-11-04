import { Route, Routes } from 'react-router-dom'
import { JournalProvider } from './lib/store'
import { useJournal } from './lib/journal-context'
import Header from './components/Header'
import Footer from './components/Footer'
import Today from './pages/Today'
import Entries from './pages/Entries'
import EntryPage from './pages/EntryPage'
import NewEntry from './pages/NewEntry'

export default function App() {
  return (
    <JournalProvider>
      <div className="relative min-h-screen bg-paper">
        {/* one soft blue wash in the corner */}
        <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[100px] animate-drift" />

        <Header />

        <OfflineNotice />

        <main className="relative mx-auto w-full max-w-[760px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/new" element={<NewEntry />} />
            <Route path="/entries" element={<Entries />} />
            <Route path="/entry/:id" element={<EntryPage />} />
            <Route path="*" element={<Today />} />
          </Routes>

          <Footer />
        </main>
      </div>
    </JournalProvider>
  )
}

/** Never let sample entries look like real ones. */
function OfflineNotice() {
  const { offline } = useJournal()
  if (!offline) return null

  return (
    <div className="relative z-20 border-b border-brand/15 bg-brand-soft/80 px-5 py-2.5 text-center text-[12.5px] text-brand-ink">
      The backend is unreachable — these are sample entries, and new writes stay in this browser.
    </div>
  )
}
