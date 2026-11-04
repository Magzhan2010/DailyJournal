import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Save } from 'lucide-react'
import { countWords } from '../lib/constants'

/**
 * The writing surface: a title, the text, and a save button.
 *
 * Autosaves ~1s after you stop typing. The autosave is silent — it never
 * closes the editor or navigates away — while the Save button calls `onSave`
 * and is the only thing that finishes the edit.
 */
export default function Editor({
  entry = null,
  onSave,
  onAutosave,
  onCancel,
  autoFocus = false,
  seed = '',
}) {
  const [title, setTitle] = useState(entry?.title || '')
  const [note, setNote] = useState(entry?.note || '')
  const [status, setStatus] = useState('idle') // idle | saving | saved
  const [dirty, setDirty] = useState(false)
  const [touched, setTouched] = useState(false)
  const [entryId, setEntryId] = useState(entry?.id || null)
  const [syncedId, setSyncedId] = useState(entry?.id ?? null)

  const titleRef = useRef(null)
  const noteRef = useRef(null)
  const timer = useRef(null)
  const saveRef = useRef(null)

  const grow = useCallback((el) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    grow(titleRef.current)
    grow(noteRef.current)
  }, [title, note, grow])

  useEffect(() => () => clearTimeout(timer.current), [])

  // the prompt can be dropped into the first line (state adjusted on prop change)
  const [lastSeed, setLastSeed] = useState(seed)
  if (seed !== lastSeed) {
    setLastSeed(seed)
    const text = String(seed || '').trim()
    if (text && !note.includes(text)) {
      setDirty(true)
      setTouched(true)
      setNote((current) => `${text}\n\n${current}`.trim())
    }
  }

  // the entry can arrive after the first render (the list loads in the
  // background) — pick it up, but never overwrite what is being written
  if (entry && !touched && entry.id !== syncedId) {
    setSyncedId(entry.id)
    setEntryId(entry.id)
    setTitle(entry.title || '')
    setNote(entry.note || '')
  }

  const save = useCallback(
    async (silent = false) => {
      if (!title.trim() && !note.trim()) return null

      setStatus('saving')
      const handler = silent ? onAutosave || onSave : onSave
      try {
        const saved = await handler({ id: entryId, title: title.trim(), note })
        if (saved?.id) setEntryId(saved.id)
        setDirty(false)
        setStatus('saved')
        return saved
      } catch (error) {
        console.error(error)
        setStatus('error')
        return null
      }
    },
    [entryId, note, onAutosave, onSave, title]
  )

  // keep the latest save function without re-arming the autosave timer
  useEffect(() => {
    saveRef.current = save
  }, [save])

  // autosave — only the text matters here, the handler identity may change
  // on every render of the parent
  useEffect(() => {
    if (!dirty) return undefined
    clearTimeout(timer.current)
    timer.current = setTimeout(() => saveRef.current?.(true), 1000)
    return () => clearTimeout(timer.current)
  }, [dirty, title, note])

  /* keyboard: Cmd/Ctrl+Enter saves right away, Esc leaves the editor */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        saveRef.current?.(false)
      }
      if (e.key === 'Escape' && onCancel) {
        e.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const words = countWords(note)

  return (
    <div className="card overflow-hidden transition-shadow duration-300 focus-within:shadow-[0_10px_34px_rgba(0,113,227,0.10)]">
      <div className="px-6 pt-7 sm:px-8 sm:pt-8">
        <textarea
          ref={titleRef}
          value={title}
          rows={1}
          autoFocus={autoFocus}
          onChange={(e) => {
            setDirty(true)
            setTouched(true)
            setStatus('idle')
            setTitle(e.target.value)
          }}
          placeholder="Name this entry…"
          className="title-input"
        />

        <textarea
          ref={noteRef}
          value={note}
          onChange={(e) => {
            setDirty(true)
            setTouched(true)
            setStatus('idle')
            setNote(e.target.value)
          }}
          placeholder="Write it down before you edit it. Nobody is reading yet."
          className="body-input mt-3"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line bg-mist/40 px-6 py-3.5 sm:px-8">
        <div className="flex items-center gap-2 text-[12.5px] font-medium text-ink-3">
          <span>{words} {words === 1 ? 'word' : 'words'}</span>
          <AnimatePresence>
            {status === 'saving' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                  className="h-2.5 w-2.5 rounded-full border-[1.5px] border-brand/25 border-t-brand"
                />
                Saving…
              </motion.span>
            )}
            {status === 'saved' && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-[#34c759]"
              >
                <Check size={13} strokeWidth={3} />
                Saved
              </motion.span>
            )}
            {status === 'error' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[#ff3b30]"
              >
                Not saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-quiet">
              Cancel
            </button>
          )}
          <button type="button" onClick={() => save(false)} className="btn btn-primary">
            <Save size={15} />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
