import { createContext, useContext } from 'react'

/**
 * Shared journal context.
 * Kept in its own file so `store.jsx` only exports a component
 * (React Fast Refresh works best that way).
 */
export const JournalContext = createContext(null)

export function useJournal() {
  const ctx = useContext(JournalContext)
  if (!ctx) throw new Error('useJournal must be used inside <JournalProvider>')
  return ctx
}
