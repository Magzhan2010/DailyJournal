import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Save } from 'lucide-react'
import { countWords } from '../lib/constants'

/**
 * The writing surface: a title, the text, and a save button.
 * Saves automatically ~1s after you stop typing.
 */
export default function Editor({ entry = null, onSave, onCancel, autoFocus = false, seed = '' }) {
  const [title, setTitle] = useState(entry?.title || '')
  const [note, setNote] = useState(entry?.note || '')
  const [status, setStatus] = useState('idle') // idle | saving | saved
  const [dirty, setDirty] = useState(false)
  const [entryId, setEntryId] = useState(entry?.id || null)

  const titleRef = useRef(null)
  const noteRef = useRef(null)
  const timer = useRef(null)

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
      setNote((current) => `${text}\n\n${current}`.trim())
    }
  }

  // the entry can arrive after the first render (the list loads in the
  // background) — pick it up, but never overwrite what is being written
  const incomingId = entry?.id ?? null
  if (!title && !note && entry && incomingId !== entryId) {
    setEntryId(incomingId)
    setTitle(entry.title || '')
    setNote(entry.note || '')
  }

  const save = useCallback(async () => {
    if (!title.trim() && !note.trim()) return null

    setStatus('saving')
    const saved = await onSave({ id: entryId, title: title.trim(), note })
    if (saved?.id) setEntryId(saved.id)
    setDirty(false)
    setStatus('saved')
    return saved
  }, [entryId, note, onSave, title])

  // autosave
  useEffect(() => {
    if (!dirty) return undefined
    clearTimeout(timer.current)
    timer.current = setTimeout(save, 1000)
    return () => clearTimeout(timer.current)
  }, [dirty, title, note, save])

  const words = countWords(note)

  return (
    <div className="card overflow-hidden">
      <div className="px-6 pt-7 sm:px-8 sm:pt-8">
        <textarea
          ref={titleRef}
          value={title}
          rows={1}
          autoFocus={autoFocus}
          onChange={(e) => {
            setDirty(true)
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
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-quiet">
              Cancel
            </button>
          )}
          <button type="button" onClick={save} className="btn btn-primary">
            <Save size={15} />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
