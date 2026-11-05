import { Route, Routes } from 'react-router-dom'
import { JournalProvider } from './lib/store'
import SiteHeader from './components/SiteHeader'
import Today from './pages/Today'
import Entries from './pages/Entries'
import EntryPage from './pages/EntryPage'

export default function App() {
  return (
    <JournalProvider>
      <div className="min-h-screen bg-[var(--color-page)]">
        <SiteHeader />

        <main className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-8">
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/entries" element={<Entries />} />
            <Route path="/entry/:id" element={<EntryPage />} />
            <Route path="*" element={<Today />} />
          </Routes>
        </main>
      </div>
    </JournalProvider>
  )
}
