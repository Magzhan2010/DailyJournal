import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Check } from 'lucide-react'
import Logo from './Logo'
import { isEmptyMarkup, postPrefix } from '../lib/journal-markup'
import { SITE_NAME } from '../lib/constants'

/**
 * The post box - "Post to magishoit", with the old B / I / smiley toolbar and
 * the grey Post button.
 */
export default function PostComposer({
  entry = null,
  onSave,
  onAutosave,
  onCancel,
  seed = '',
}) {
  const [value, setValue] = useState(entry?.note ?? '')
  const [status, setStatus] = useState('idle') // idle | saving | saved
  const [dirty, setDirty] = useState(false)
  const [entryId, setEntryId] = useState(entry?.id || null)

  const areaRef = useRef(null)
  const timer = useRef(null)
  const saveRef = useRef(null)
  const seeded = useRef(false)

  /* a brand new post starts with the classic timestamp */
  useEffect(() => {
    if (entry || seeded.current) return
    seeded.current = true
    setValue(postPrefix())
  }, [entry])

  const insertAtCursor = (text) => {
    const el = areaRef.current
    if (!el) {
      setValue((v) => `${v}${text}`)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = `${value.slice(0, start)}${text}${value.slice(end)}`
    setValue(next)
    setDirty(true)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + text.length, start + text.length)
    })
  }

  /* the daily prompt drops in at the cursor */
  useEffect(() => {
    const text = String(seed || '').trim()
    if (!text || value.includes(text)) return
    insertAtCursor(` ${text} `)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  const wrap = (tag) => {
    const el = areaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    const next = `${value.slice(0, start)}<${tag}>${selected}</${tag}>${value.slice(end)}`
    setValue(next)
    setDirty(true)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + tag.length + 2, end + tag.length + 2)
    })
  }

  const save = useCallback(
    async (silent = false) => {
      if (isEmptyMarkup(value)) return null

      // LiveJournal closed the paragraph for you
      let body = value.trimEnd()
      if (!body.endsWith('</p>')) body += '</p>'

      setStatus('saving')
      const handler = silent ? onAutosave || onSave : onSave
      try {
        const saved = await handler({
          id: entryId,
          title: '',
          note: body,
        })
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
    [entryId, onAutosave, onSave, value]
  )

  useEffect(() => {
    saveRef.current = save
  }, [save])

  useEffect(() => {
    if (!dirty) return undefined
    clearTimeout(timer.current)
    timer.current = setTimeout(() => saveRef.current?.(true), 1000)
    return () => clearTimeout(timer.current)
  }, [dirty, value])

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

  return (
    <section className="lj-frame">
      {/* heading + toolbar + post button */}
      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--color-line-soft)] px-4 py-4">
        <h1 className="lj-heading">
          Post to <em>{SITE_NAME}</em>
        </h1>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="lj-tool"
            title="Bold"
            onClick={() => wrap('b')}
          >
            B
          </button>
          <button
            type="button"
            className="lj-tool font-serif italic"
            title="Italic"
            onClick={() => wrap('i')}
          >
            I
          </button>
          <button
            type="button"
            className="lj-tool"
            title="Smiley"
            onClick={() => insertAtCursor(':) ')}
          >
            <Logo size={16} variant="simple" />
          </button>

          <button
            type="button"
            onClick={() => save(false)}
            className="lj-btn ml-2 !px-4 !py-1.5 !text-[13px]"
          >
            <ArrowUp size={15} strokeWidth={2.5} className="text-[var(--color-lj-blue)]" />
            Post
          </button>
        </div>
      </div>

      {/* the box */}
      <div className="p-3">
        <textarea
          ref={areaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setDirty(true)
            setStatus('idle')
          }}
          spellCheck={false}
          className="lj-area min-h-[190px]"
        />

        <div className="flex items-center justify-between gap-3 px-1 pt-2 text-[12px] text-[var(--color-ink-4)]">
          <span className="flex items-center gap-2">
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
                    className="h-2.5 w-2.5 rounded-full border-[1.5px] border-[var(--color-lj-blue)]/30 border-t-[var(--color-lj-blue)]"
                  />
                  saving…
                </motion.span>
              )}
              {status === 'saved' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-[#2e7d32]"
                >
                  <Check size={13} strokeWidth={3} />
                  saved
                </motion.span>
              )}
              {status === 'error' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[#d93025]"
                >
                  not saved
                </motion.span>
              )}
            </AnimatePresence>
            <span className="hidden sm:inline">
              Tip: Ctrl+Enter to post · Esc to cancel
            </span>
          </span>

          {onCancel && (
            <button type="button" onClick={onCancel} className="lj-btn">
              Cancel
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
