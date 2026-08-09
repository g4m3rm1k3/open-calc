import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import FloatingWindow from './FloatingWindow.jsx'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { DOCS_MODULES, SectionedMarkdown } from '../docs/MarkdownHub.jsx'
import { Lightbulb, ChevronRight, Locate } from 'lucide-react'

// Lets whatever is rendering a concept doc's *content* (ConceptDocBody,
// below) tell a concept reference clicked from inside an already-open
// concept window apart from one clicked from plain lesson prose. The
// former pushes onto this window's own breadcrumb; the latter (handled in
// MarkdownHub.jsx via useConceptWindow().openFromLesson) opens this window
// fresh. This distinction is what lets one concept's body reference another
// without nesting a second copy of this panel's chrome inside the first —
// the exact structure that used to make concept embeds shrink and indent
// further at every level (each level's own border+padding stacking).
const ConceptNavContext = createContext(null)
export const useConceptNav = () => useContext(ConceptNavContext)

const ConceptWindowContext = createContext(null)
export const useConceptWindow = () => useContext(ConceptWindowContext)

function ConceptDocBody({ docPath }) {
  const { themeStyles, typography } = useGlobalTheme()
  const [content, setContent] = useState(null)

  useEffect(() => {
    let cancelled = false
    setContent(null)
    const loader = DOCS_MODULES[docPath]
    if (!loader) {
      setContent('*Concept file not found.*')
      return
    }
    loader().then((text) => {
      if (!cancelled) setContent(text)
    })
    return () => {
      cancelled = true
    }
  }, [docPath])

  if (content === null) {
    return <p className="text-sm text-slate-400 animate-pulse p-6">Loading concept…</p>
  }

  return (
    <div className="p-6">
      <SectionedMarkdown
        content={content}
        ui={themeStyles?.ui}
        accentColor={themeStyles?.accentHex || '#0ea5e9'}
        isDark={themeStyles?.isDark}
        font={typography?.font}
        width={typography?.width}
        lineHeight={typography?.lineHeight}
        fontSize={typography?.fontSize}
        textAlign={typography?.textAlign}
        embedded
      />
    </div>
  )
}

function Breadcrumb({ path, onJump, onCloseAll }) {
  return (
    <div className="shrink-0 flex items-center gap-1 px-4 h-10 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto whitespace-nowrap bg-slate-50 dark:bg-slate-900/60">
      {path.map((seg, i) => {
        const isLast = i === path.length - 1
        return (
          <span key={i} className="flex items-center gap-1 shrink-0">
            {i > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
            <button
              onClick={() => (i === 0 ? onCloseAll() : onJump(i))}
              disabled={isLast}
              title={i === 0 ? 'Close and return to the lesson' : undefined}
              className={
                isLast
                  ? 'px-1.5 py-0.5 font-bold text-slate-900 dark:text-slate-100 cursor-default'
                  : 'px-1.5 py-0.5 rounded text-brand-600 dark:text-brand-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }
            >
              {seg.title}
            </button>
          </span>
        )
      })}
    </div>
  )
}

// Module-level, stable reference — passed directly as FloatingWindow's
// `win.Component`. Reading everything from context (not props) means this
// identity never changes across re-renders, so FloatingWindow never
// unmounts/remounts it (which would otherwise blow away ConceptDocBody's
// fetch-in-progress and scroll position on every breadcrumb push).
function ConceptWindowInner() {
  const { path, push, jump, closeAll } = useConceptWindow()
  const navValue = useMemo(() => ({ push }), [push])
  if (!path) return null
  const current = path[path.length - 1]
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <Breadcrumb path={path} onJump={jump} onCloseAll={closeAll} />
      <div className="flex-1 overflow-y-auto">
        <ConceptNavContext.Provider value={navValue}>
          <ConceptDocBody docPath={current.docPath} />
        </ConceptNavContext.Provider>
      </div>
    </div>
  )
}

// Self-contained, not routed through DesktopProvider's minimize/Taskbar —
// Studio's own layout sits on top of the Taskbar, so a window minimized the
// normal way would have nowhere reachable to reappear. This pill floats
// directly in the viewport instead, draggable, independent of whatever
// route/chrome is currently showing.
function MinimizedPill({ label, onRestore }) {
  const dragging = useRef(false)
  const moved = useRef(false)
  const origin = useRef({ mx: 0, my: 0, x: 0, y: 0 })
  const [pos, setPos] = useState(() => ({ x: window.innerWidth - 240, y: window.innerHeight - 90 }))

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return
      moved.current = true
      setPos({ x: origin.current.x + e.clientX - origin.current.mx, y: origin.current.y + e.clientY - origin.current.my })
    }
    const up = () => {
      dragging.current = false
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [])

  return (
    <button
      onMouseDown={(e) => {
        dragging.current = true
        moved.current = false
        origin.current = { mx: e.clientX, my: e.clientY, x: pos.x, y: pos.y }
      }}
      onClick={() => {
        if (!moved.current) onRestore()
      }}
      style={{ left: pos.x, top: pos.y, zIndex: 4999 }}
      className="fixed flex items-center gap-2 pl-2 pr-3 py-2 rounded-full shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing"
    >
      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
        <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
      </span>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[150px] truncate">{label}</span>
    </button>
  )
}

// A window can still end up dragged somewhere unreachable despite
// FloatingWindow's own clamp (an edge case that clamp doesn't anticipate,
// a future window type that doesn't use it, etc.) — this is the deliberate
// belt-and-suspenders fallback: a tiny control pinned to a hardcoded,
// always-on-screen corner, independent of the window's own (possibly
// broken) position, whenever the main window is supposed to be showing.
// Clicking it re-centers the window without touching the breadcrumb.
function RecenterButton({ onRecenter }) {
  return (
    <button
      onClick={onRecenter}
      title="Bring concept window back into view"
      style={{ zIndex: 4999 }}
      className="fixed top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-400 transition-colors"
    >
      <Locate className="w-4 h-4" />
    </button>
  )
}

export default function ConceptWindowProvider({ children }) {
  // path[0] is always the "origin" entry (the lesson this was opened from,
  // or "Browse" with no lesson context) and has docPath: null — clicking it
  // closes the window entirely rather than popping one level, since there's
  // nowhere further back to go once you're at what you actually came from.
  const [state, setState] = useState(null) // { path: [{title, docPath}], minimized, maximized }

  const openFromLesson = useCallback((docPath, title, originTitle) => {
    setState({
      path: [
        { title: originTitle, docPath: null },
        { title, docPath },
      ],
      minimized: false,
      maximized: false,
    })
  }, [])

  const push = useCallback((docPath, title) => {
    setState((s) => s && { ...s, path: [...s.path, { title, docPath }], minimized: false })
  }, [])

  const jump = useCallback((index) => {
    setState((s) => s && { ...s, path: s.path.slice(0, index + 1), minimized: false })
  }, [])

  // Docked edge, lifted out of FloatingWindow so the app's own layout (see
  // MarkdownHub.jsx) can shrink to make real room instead of the window
  // merely overlaying whatever was already there. Reset to null whenever
  // the window closes or minimizes — nothing should stay "pushed" once
  // there's no docked window actually occupying that space anymore.
  const [dockedEdge, setDockedEdge] = useState(null)

  const closeAll = useCallback(() => {
    setState(null)
    setDockedEdge(null)
  }, [])
  const minimize = useCallback(() => {
    setState((s) => s && { ...s, minimized: true })
    setDockedEdge(null)
  }, [])
  const restore = useCallback(() => setState((s) => s && { ...s, minimized: false }), [])
  const toggleMaximize = useCallback(() => setState((s) => s && { ...s, maximized: !s.maximized }), [])

  // Changing this remounts FloatingWindow (via the `key` prop below), which
  // re-runs its own pos/size useState initializers — the same centered
  // default a brand-new window opens at. That's the entire "recenter"
  // mechanic: force a fresh mount, don't try to reach into and repair
  // whatever state a stuck window's internals are currently in.
  const [resetKey, setResetKey] = useState(0)
  const recenter = useCallback(() => {
    setState((s) => s && { ...s, maximized: false })
    setDockedEdge(null)
    setResetKey((k) => k + 1)
  }, [])

  const ctx = useMemo(
    () => ({ openFromLesson, path: state?.path ?? null, push, jump, closeAll, dockedEdge }),
    [openFromLesson, state, push, jump, closeAll, dockedEdge],
  )

  return (
    <ConceptWindowContext.Provider value={ctx}>
      {children}
      {state && !state.minimized && (
        <>
          <FloatingWindow
            key={resetKey}
            win={{
              state: state.maximized ? 'maximized' : 'normal',
              label: state.path[state.path.length - 1].title,
              emoji: '💡',
              width: 720,
              height: 640,
              Component: ConceptWindowInner,
            }}
            zIndex={4600}
            onClose={closeAll}
            onMinimize={minimize}
            onMaximize={toggleMaximize}
            onFocus={() => {}}
            onDockChange={setDockedEdge}
          />
          <RecenterButton onRecenter={recenter} />
        </>
      )}
      {state && state.minimized && (
        <MinimizedPill label={state.path[state.path.length - 1].title} onRestore={restore} />
      )}
    </ConceptWindowContext.Provider>
  )
}
