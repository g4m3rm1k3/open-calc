import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { REFERENCE_ITEMS } from '../../data/referenceRegistry.js'
import { GLASS_META } from '../../styles/courseColors.js'

// Nav-bar entry point for reference/lookup pages (formulas, LA reference,
// concept explorer, eng math, universal calc, game rules). Picking one
// dispatches the same 'oc-open-reference' event GameRules always used —
// AppShell owns the actual overlay, this component is just the trigger +
// themed picker so it stays reachable from anywhere without prop drilling.
export default function ReferencesMenu() {
  const [open, setOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function toggle() {
    setAnchorRect(btnRef.current?.getBoundingClientRect() ?? null)
    setOpen((o) => !o)
  }

  function pick(key) {
    setOpen(false)
    window.dispatchEvent(new CustomEvent('oc-open-reference', { detail: { key } }))
  }

  const style = anchorRect
    ? { zIndex: 9999, right: Math.max(8, Math.round(window.innerWidth - anchorRect.right)), top: Math.round(anchorRect.bottom + 8) }
    : { zIndex: 9999, right: 16, top: 56 }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="hidden lg:flex nav-tool-btn text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
        title="Reference Library"
      >
        <span className="text-[16px] leading-none">📚</span>
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div
            className="fixed w-[21rem] p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl"
            style={style}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-2">
              Reference Library
            </div>
            <div className="grid grid-cols-2 gap-2">
              {REFERENCE_ITEMS.map((item) => {
                const meta = GLASS_META[item.color] ?? GLASS_META.slate
                return (
                  <button
                    key={item.key}
                    onClick={() => pick(item.key)}
                    className={`flex flex-col items-start gap-1 p-3 rounded-xl border-[1.5px] ${meta.border} bg-white dark:bg-slate-800/80 hover:-translate-y-0.5 hover:shadow-md transition-all text-left`}
                  >
                    <span className="text-xl leading-none">{item.emoji}</span>
                    <span className={`text-[11px] font-bold leading-tight ${meta.text}`}>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
