import { Suspense } from 'react'
import { getReferenceItem } from '../../data/referenceRegistry.js'
import { GLASS_META } from '../../styles/courseColors.js'

function OverlaySpinner() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-white dark:bg-slate-950">
      <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-brand-500 animate-spin" />
    </div>
  )
}

// Renders one reference/lookup page full-screen on top of the current app
// content. This is never a route change — the page underneath stays mounted,
// so closing it (the red ✕ here) drops the user back exactly where they
// were, mid-lesson scroll position and all.
//
// Every item gets the same header + red ✕, regardless of whether the page
// itself also has internal close/back UI — several of these pages (Eng Math,
// LA Concept Explorer) were built assuming they were always a route, so their
// own "back" buttons can't be trusted to actually close anything. This is
// the one close affordance guaranteed to work everywhere.
export default function ReferenceOverlay({ activeKey, onClose }) {
  const item = getReferenceItem(activeKey)
  if (!item) return null

  const meta = GLASS_META[item.color] ?? GLASS_META.slate
  const { Component } = item

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-slate-950">
      <div className={`flex items-center justify-between gap-3 px-4 py-2.5 flex-shrink-0 bg-gradient-to-r ${meta.header}`}>
        <div className="flex items-center gap-2 text-white font-bold text-sm drop-shadow-sm min-w-0">
          <span className="text-lg leading-none flex-shrink-0">{item.emoji}</span>
          <span className="truncate">{item.label}</span>
        </div>
        <button
          onClick={onClose}
          title="Close"
          className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors text-sm leading-none shadow-sm"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Suspense fallback={<OverlaySpinner />}>
          <Component onClose={onClose} />
        </Suspense>
      </div>
    </div>
  )
}
