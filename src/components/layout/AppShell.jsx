import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { LESSON_MAP, CURRICULUM, COURSES } from '../../content/index.js'
import PinsPanel from '../ui/PinsPanel.jsx'
import NotesPanel from '../ui/NotesPanel.jsx'
import Sidebar from './Sidebar.jsx'
import SearchModal from '../search/SearchModal.jsx'
import GlobalGrapher from '../ui/GlobalGrapher.jsx'
import GlobalGrapher3D from '../ui/GlobalGrapher3D.jsx'
import GlobalGrapherJSX from '../ui/GlobalGrapherJSX.jsx'
import ScratchPad from '../ui/ScratchPad.jsx'
import { useSearchContext } from '../../context/SearchContext.jsx'
import { useProgress } from '../../hooks/useProgress.js'
import GrapherContext from '../../context/GrapherContext.jsx'
import { Activity, Box, Settings2, PenLine, Smartphone, Layers, Search, BookOpen, Home, Compass, Menu, X, Calculator, ChevronDown } from 'lucide-react'
import TICalc from '../calculator/TICalc.jsx'
import HelpModal from '../ui/HelpModal.jsx'
import MobileBottomNav from './MobileBottomNav.jsx'
import GlobalPythonNotebook from '../ui/GlobalPythonNotebook.jsx'
import GlobalJSPlayground from '../ui/GlobalJSPlayground.jsx'
import { Terminal, Code2, PlayCircle, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVideoPlayer } from '../../context/VideoPlayerContext.jsx'
import PhysicsPoolLab from '../tools/PhysicsPoolLab.jsx'
import BasketballLab from '../tools/BasketballLab.jsx'
import ChemistryPage from '../../pages/ChemistryPage.jsx'

function MobileLocationBadge() {
  const { chapterId, lessonSlug } = useParams()
  if (!chapterId) return null

  const lesson = lessonSlug ? LESSON_MAP[`${chapterId}/${lessonSlug}`] : null
  const chapter = CURRICULUM.find(c => String(c.number) === String(chapterId))

  const label = lesson
    ? lesson.title
    : chapter
      ? chapter.title
      : null

  if (!label) return null

  const chapterLabel = chapter
    ? /^\d+$/.test(String(chapter.number)) ? `Ch. ${chapter.number}` : chapter.title
    : null

  return (
    <div className="lg:hidden flex items-center gap-1.5 min-w-0 max-w-[160px]">
      {chapterLabel && (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          {chapterLabel}
        </span>
      )}
      <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
    </div>
  )
}

function ScoreWidget() {
  const location = useLocation()
  const { progress } = useProgress()

  // Parse chapter/lesson from URL (same approach as Sidebar — avoids useParams pitfalls)
  const pathMatch = location.pathname.match(/^\/chapter\/([^/]+)(?:\/([^/]+))?/)
  const chapterId = pathMatch?.[1] ?? null
  const lessonSlug = pathMatch?.[2] ?? null

  // Current lesson quiz score
  const lessonKey = chapterId && lessonSlug ? `${chapterId}/${lessonSlug}` : null
  const currentLesson = lessonKey ? LESSON_MAP[lessonKey] : null
  const lessonQuiz = currentLesson?.id ? (progress[currentLesson.id]?.quiz ?? null) : null

  // Active course totals
  const chapter = chapterId ? CURRICULUM.find(c => String(c.number) === chapterId) : null
  const activeCourse = chapter?.course ?? null
  if (!activeCourse) return null

  const courseChapters = CURRICULUM.filter(c => c.course === activeCourse)
  const courseLessons = courseChapters.flatMap(c => c.lessons ?? []).filter(l => l.quiz?.length > 0)
  const courseMax = courseLessons.reduce((acc, l) => acc + (l.quiz?.length ?? 0), 0)
  const courseCorrect = courseLessons.reduce((acc, l) => acc + (progress[l.id]?.quiz?.correct ?? 0), 0)

  if (courseMax === 0) return null

  const lessonPct = lessonQuiz ? lessonQuiz.correct / lessonQuiz.total : null
  const lessonColor = lessonPct === null ? '' :
    lessonPct >= 0.8 ? 'text-emerald-600 dark:text-emerald-400' :
    lessonPct >= 0.5 ? 'text-amber-500 dark:text-amber-400' :
                       'text-red-500 dark:text-red-400'

  const coursePct = courseMax > 0 ? courseCorrect / courseMax : 0
  const barColor = coursePct >= 0.8 ? 'bg-emerald-500' : coursePct >= 0.5 ? 'bg-amber-400' : coursePct > 0 ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs select-none">
      <span className="text-yellow-400" aria-hidden>★</span>
      <div className="flex items-baseline gap-0.5">
        <span className="font-bold text-slate-800 dark:text-slate-200">{courseCorrect}</span>
        <span className="text-slate-400 dark:text-slate-500">/{courseMax}</span>
      </div>
      {/* Mini progress bar */}
      <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.max(2, coursePct * 100)}%` }} />
      </div>
      {lessonQuiz && (
        <>
          <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <span className={`font-semibold ${lessonColor}`}>
            {lessonQuiz.correct}<span className="font-normal text-slate-400">/10</span>
          </span>
        </>
      )}
    </div>
  )
}

function CoursesDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const location = useLocation()

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const isActive = location.pathname.startsWith('/chapter')

  return (
    <div ref={ref} className="relative z-[60] h-full flex items-center">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-sm font-bold transition-colors ${
          isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-100 hover:text-brand-600'
        }`}
      >
        Courses
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[400] p-3 grid grid-cols-2 gap-1">
          {COURSES.map(c => (
            <NavLink
              key={c.key}
              to={c.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex flex-col px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`
              }
            >
              <span className="text-sm font-semibold leading-tight">{c.label}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.desc}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function TopBar({ onMenuToggle, sidebarOpen, onGraphToggle, onGraph3DToggle, onGraphJSXToggle, onScratchToggle, scratchOpen, onCalcToggle, calcOpen, onPythonToggle, pythonOpen, onJsToggle, jsOpen, onHelpToggle, helpOpen, onPoolToggle, poolOpen, onChemToggle, chemOpen, onBasketToggle, basketOpen }) {
  const { openSearch } = useSearchContext()
  const { isOpen: videoOpen, isMinimized: videoMinimized, openPlayer, toggleMinimize } = useVideoPlayer()
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const videoActive = videoOpen && !videoMinimized
  const handleVideoToggle = () => videoOpen ? toggleMinimize() : openPlayer()

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('oc-theme', isDark ? 'dark' : 'light')
    setDark(isDark)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] h-[60px] bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3">
      {/* Mobile Menu & Brand */}
      <div className="lg:hidden flex items-center gap-1">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={sidebarOpen ? "Close menu" : "Toggle menu"}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <AnimatePresence>
          {!sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <Link to="/" className="p-2 -ml-1 rounded-lg text-brand-600 dark:text-brand-400 font-bold text-xl">
                ∂
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="hidden lg:flex flex-1 items-center gap-5 ml-6 h-full">
          <NavLink to="/" end className={({ isActive }) => `text-sm font-bold transition-colors ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-100 hover:text-brand-600'}`}>Home</NavLink>
          <CoursesDropdown />
          <NavLink to="/reference" className={({ isActive }) => `text-sm font-bold transition-colors ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100 hover:text-amber-600'}`}>Reference</NavLink>
          <NavLink to="/universal-calc" className={({ isActive }) => `text-sm font-bold transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100 hover:text-emerald-600'}`}>Universal Calc</NavLink>
          <NavLink to="/logic-sim" className={({ isActive }) => `text-sm font-bold transition-colors ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-800 dark:text-slate-100 hover:text-violet-600'}`}>Logic Sim</NavLink>
          <div className="flex items-center gap-1.5 opacity-50 cursor-not-allowed select-none">
            <span className="text-sm font-bold text-slate-500">DSA</span>
            <span className="text-[9px] uppercase tracking-widest font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 px-1 py-0.5 rounded">Soon</span>
          </div>
      </nav>

      <div className="flex-1 lg:hidden" />

      <button
        onClick={openSearch}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden sm:flex"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline font-mono text-xs bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">⌘K</kbd>
      </button>

      {/* Spacer for mobile */}
      <div className="flex-1 min-w-[8px] lg:hidden" />
      <div className="lg:hidden flex-none">
        <MobileLocationBadge />
      </div>
      <div className="flex-1 lg:hidden" />

      <ScoreWidget />

      {/* Utility tool buttons — icon only, grouped by type */}
      <div className="hidden lg:flex items-center gap-1">
        {/* Graphers */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button onClick={onGraphToggle}    className="p-2 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" title="2D Grapher (G)"><Activity className="w-4 h-4" /></button>
          <button onClick={onGraph3DToggle}  className="p-2 text-amber-500  dark:text-amber-400  hover:bg-amber-50  dark:hover:bg-amber-900/30  transition-colors border-l border-slate-200 dark:border-slate-700" title="3D Plotter (3)"><Box      className="w-4 h-4" /></button>
          <button onClick={onGraphJSXToggle} className="p-2 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors border-l border-slate-200 dark:border-slate-700" title="JSXGraph Pro (X)"><Settings2 className="w-4 h-4" /></button>
        </div>

        {/* Other tools */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden ml-1">
          <button
            onClick={onScratchToggle}
            className={`p-2 transition-colors ${scratchOpen ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30' : 'text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30'}`}
            title="Scratchpad (S)"
          ><PenLine className="w-4 h-4" /></button>
          <button
            onClick={onCalcToggle}
            className={`p-2 transition-colors border-l border-slate-200 dark:border-slate-700 ${calcOpen ? 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30' : 'text-violet-500 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30'}`}
            title="TI Calculator (C)"
          ><Calculator className="w-4 h-4" /></button>
          <button
            onClick={onPythonToggle}
            className={`p-2 transition-colors border-l border-slate-200 dark:border-slate-700 ${pythonOpen ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30' : 'text-teal-500 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'}`}
            title="Python Sandbox (P)"
          ><Terminal className="w-4 h-4" /></button>
          <button
            onClick={onJsToggle}
            className={`p-2 transition-colors border-l border-slate-200 dark:border-slate-700 ${jsOpen ? 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30' : 'text-yellow-500 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'}`}
            title="JS Playground (J)"
          ><Code2 className="w-4 h-4" /></button>
          <button
            onClick={handleVideoToggle}
            className={`p-2 transition-colors border-l border-slate-200 dark:border-slate-700 ${videoActive ? 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30' : 'text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30'}`}
            title="Video Player (V)"
          ><PlayCircle className="w-4 h-4" /></button>
          <button
            onClick={onPoolToggle}
            className={`p-2 transition-colors border-l border-slate-200 dark:border-slate-700 ${poolOpen ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30' : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
            title="Physics Pool Lab"
          ><span className="text-base leading-none" style={{lineHeight:'16px',display:'block'}}>🎱</span></button>
          <button
            onClick={onChemToggle}
            className={`p-2 transition-colors border-l border-slate-200 dark:border-slate-700 ${chemOpen ? 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30' : 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30'}`}
            title="Periodic Table & Chemistry"
          ><span className="text-base leading-none" style={{lineHeight:'16px',display:'block'}}>⚛</span></button>
          <button
            onClick={onBasketToggle}
            className={`p-2 transition-colors border-l border-slate-200 dark:border-slate-700 ${basketOpen ? 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30' : 'text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30'}`}
            title="Basketball Physics Lab"
          ><span className="text-base leading-none" style={{lineHeight:'16px',display:'block'}}>🏀</span></button>
        </div>
      </div>

      {/* Help */}
      <button
        onClick={onHelpToggle}
        className={`p-2 rounded-lg transition-colors ${
          helpOpen
            ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        aria-label="Open contributor docs"
        title="Contributor Docs (?)"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle dark mode"
      >
        {dark ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </header>
  )
}

function WelcomeModal() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('oc-welcome-seen'))

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem('oc-welcome-seen', '1')
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={dismiss}>
      <div
        className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">∂</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome to OpenCalc!</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Concepts here are taught in multiple ways — visually, algebraically, and conceptually.
          If a specific interactive or explanation doesn't click for you right away, don't worry!
          Keep scrolling. You will likely find an analogy or visual that perfectly matches how your brain works.
        </p>
        <button
          onClick={dismiss}
          className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
        >
          Start Exploring
        </button>
      </div>
    </div>
  )
}

export default function AppShell({ children }) {
  const location = useLocation()
  const isUniversalCalcRoute = location.pathname.startsWith('/universal-calc')
  const isChemistryRoute     = location.pathname.startsWith('/chemistry')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    const saved = localStorage.getItem('oc-sidebar-pinned')
    return saved !== null ? saved === 'true' : true
  })
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  
  const isSidebarExpanded = sidebarPinned || (sidebarHovered && !sidebarOpen)

  useEffect(() => {
    localStorage.setItem('oc-sidebar-pinned', sidebarPinned)
  }, [sidebarPinned])

  // Restore dev mode across page refreshes
  useEffect(() => {
    if (localStorage.getItem('oc-dev-mode')) {
      document.documentElement.classList.add('dev-mode')
    }
  }, [])
  const [graphOpen, setGraphOpen] = useState(false)
  const [graph3DOpen, setGraph3DOpen] = useState(false)
  const [graphJSXOpen, setGraphJSXOpen] = useState(false)
  const [scratchOpen, setScratchOpen] = useState(false)
  const [calcOpen, setCalcOpen] = useState(false)
  const [pythonOpen, setPythonOpen] = useState(false)
  const [jsOpen, setJsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [poolOpen, setPoolOpen] = useState(false)
  const [chemOpen, setChemOpen] = useState(false)
  const [basketOpen, setBasketOpen] = useState(false)
  const closeAllTools = useCallback(() => {
    setGraphOpen(false); setGraph3DOpen(false); setGraphJSXOpen(false)
    setScratchOpen(false); setCalcOpen(false); setPythonOpen(false); setJsOpen(false)
    setPoolOpen(false); setChemOpen(false); setBasketOpen(false)
  }, [])
  const [grapherLaunchConfig, setGrapherLaunchConfig] = useState(null)
  const { openSearch } = useSearchContext()

  // openGrapher — called by any lesson/component via GrapherContext
  const openGrapher = useCallback((config) => {
    const mode = config?.mode ?? 'pro'
    setGrapherLaunchConfig(config)
    setGraphOpen(false)
    setGraph3DOpen(false)
    setGraphJSXOpen(false)
    if (mode === '2d')       setGraphOpen(true)
    else if (mode === '3d')  setGraph3DOpen(true)
    else                     setGraphJSXOpen(true)   // 'pro' default
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // CMD/CTRL + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }

      // If the Python notebook is open, we do not want global single-key shortcuts to fire!
      if (pythonOpen) {
        if (e.key === 'Escape') setPythonOpen(false)
        return
      }

      const activeElement = document.activeElement
      const target = e.target
      
      // Nuclear Typing Check: Covers Monaco (Python), CodeMirror, Standard Inputs, and Custom Editable Divs
      const isTyping = 
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement?.tagName) || 
        activeElement?.isContentEditable ||
        target?.closest('.monaco-editor') || 
        target?.closest('.cm-editor') ||
        target?.closest('[contenteditable="true"]')

      if (isTyping && e.key !== 'Escape') return

      // 'g' key for graph
      if (e.key.toLowerCase() === 'g') {
        setGraphOpen(prev => !prev)
        if (!graphOpen) { setGraph3DOpen(false); setGraphJSXOpen(false); }
      }
      // '3' key for 3D plotter
      if (e.key === '3') {
        setGraph3DOpen(prev => !prev)
        if (!graph3DOpen) { setGraphOpen(false); setGraphJSXOpen(false); }
      }
      // 'x' key for JSXGraph Pro
      if (e.key.toLowerCase() === 'x') {
        setGraphJSXOpen(prev => !prev)
        if (!graphJSXOpen) { setGraphOpen(false); setGraph3DOpen(false); }
      }
      // 's' key for scratchpad
      if (e.key.toLowerCase() === 's') {
        setScratchOpen(prev => !prev)
      }
      // 'c' key for TI calculator
      if (e.key.toLowerCase() === 'c') {
        setCalcOpen(prev => !prev)
      }
      // 'p' key for Python sandbox
      if (e.key.toLowerCase() === 'p') {
        setPythonOpen(prev => !prev)
      }
      // 'j' key for JS playground
      if (e.key.toLowerCase() === 'j') {
        setJsOpen(prev => !prev)
      }
      // 'v' key for video player
      if (e.key.toLowerCase() === 'v') {
        // handled via context; dispatch a custom event the FloatingVideoPlayer can listen to
        window.dispatchEvent(new CustomEvent('oc-toggle-video'))
      }
      // '?' key for help docs
      if (e.key === '?') {
        setHelpOpen(prev => !prev)
      }
      // 'Escape' to close modals
      if (e.key === 'Escape') {
        setGraphOpen(false)
        setGraph3DOpen(false)
        setGraphJSXOpen(false)
        setScratchOpen(false)
        setCalcOpen(false)
        setPythonOpen(false)
        setJsOpen(false)
        setHelpOpen(false)
        setPoolOpen(false)
      }
      // 'Shift+D' — toggle Dev Mode (shows VIZ component names on every viz frame)
      if (e.shiftKey && e.key === 'D') {
        const html = document.documentElement
        const isDevMode = html.classList.toggle('dev-mode')
        localStorage.setItem('oc-dev-mode', isDevMode ? '1' : '')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openSearch, graphOpen, graph3DOpen, graphJSXOpen, pythonOpen])

  return (
    <GrapherContext.Provider value={{ openGrapher }}>
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopBar
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        sidebarOpen={sidebarOpen}
        onGraphToggle={() => setGraphOpen(prev => !prev)}
        onGraph3DToggle={() => setGraph3DOpen(prev => !prev)}
        onGraphJSXToggle={() => setGraphJSXOpen(prev => !prev)}
        onScratchToggle={() => setScratchOpen(prev => !prev)}
        scratchOpen={scratchOpen}
        onCalcToggle={() => setCalcOpen(prev => !prev)}
        calcOpen={calcOpen}
        onPythonToggle={() => setPythonOpen(prev => !prev)}
        pythonOpen={pythonOpen}
        onJsToggle={() => setJsOpen(prev => !prev)}
        jsOpen={jsOpen}
        onHelpToggle={() => setHelpOpen(prev => !prev)}
        helpOpen={helpOpen}
        onPoolToggle={() => setPoolOpen(prev => !prev)}
        poolOpen={poolOpen}
        onChemToggle={() => setChemOpen(prev => !prev)}
        chemOpen={chemOpen}
        onBasketToggle={() => setBasketOpen(prev => !prev)}
        basketOpen={basketOpen}
      />

      {/* Mobile sidebar/tools backdrop */}
      {(sidebarOpen || graphOpen || graph3DOpen || graphJSXOpen || mobileToolsOpen) && (
        <div
          className="fixed inset-0 z-[45] bg-black/30 backdrop-blur-sm lg:backdrop-blur-none lg:bg-transparent"
          onClick={() => {
            setSidebarOpen(false)
            setMobileToolsOpen(false)
            if (window.innerWidth < 1024) {
              setGraphOpen(false)
              setGraph3DOpen(false)
              setGraphJSXOpen(false)
              setPythonOpen(false)
            }
          }}
        />
      )}

      {/* Sidebar - Desktop logic for pin/hover, Mobile logic for toggle */}
      <aside 
        onMouseEnter={() => !sidebarPinned && setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`fixed top-[60px] left-0 bottom-0 z-50 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out w-[280px]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSidebarExpanded ? 'lg:translate-x-0' : 'lg:-translate-x-[276px]'}
          ${!sidebarPinned && isSidebarExpanded ? 'shadow-2xl ring-1 ring-black/5 dark:ring-white/5' : ''}
        `}
      >
        <Sidebar 
          onNavigate={() => setSidebarOpen(false)} 
          isPinned={sidebarPinned}
          togglePin={() => setSidebarPinned(!sidebarPinned)}
          isCollapsed={!isSidebarExpanded && !sidebarOpen}
          onSearchOpen={openSearch}
        />
        
        {/* Hover trigger - Zen Mode Desktop ONLY */}
        {!sidebarPinned && !isSidebarExpanded && !sidebarOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-brand-500/10 dark:bg-brand-400/5 hover:bg-brand-500/20 transition-colors cursor-pointer hidden lg:block" />
        )}
      </aside>

      {/* Main content */}
      <main className={`transition-[padding] duration-300 ease-in-out pt-[60px] pb-20 lg:pb-0 ${isChemistryRoute ? 'h-screen overflow-hidden' : 'min-h-screen'} ${sidebarPinned ? 'lg:pl-[280px]' : 'lg:pl-3'}`}>
        <div className={
          isChemistryRoute
            ? 'w-full h-[calc(100vh-60px)] flex flex-col overflow-hidden'
            : isUniversalCalcRoute
              ? 'max-w-[min(98vw,2800px)] mx-auto px-2 sm:px-3 lg:px-4 py-8'
              : `${sidebarPinned ? 'max-w-4xl' : 'max-w-6xl'} mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300`
        }>
          {children ?? <Outlet />}
        </div>
      </main>

      {/* Mobile Tools Menu Hub */}
      <AnimatePresence>
        {mobileToolsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed bottom-20 left-4 right-4 z-[55] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-black/5 dark:ring-white/5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Math Tools Hub
              </h3>
              <button 
                onClick={() => setMobileToolsOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { closeAllTools(); setGraphOpen(true); setMobileToolsOpen(false) }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">2D Grapher</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { closeAllTools(); setGraph3DOpen(true); setMobileToolsOpen(false) }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                  <Box className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">3D Plotter</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { closeAllTools(); setGraphJSXOpen(true); setMobileToolsOpen(false) }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
                  <Settings2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">Pro Tools</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { closeAllTools(); setScratchOpen(true); setMobileToolsOpen(false) }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-800/50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-800/50 flex items-center justify-center">
                  <PenLine className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">Scratchpad</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { closeAllTools(); setCalcOpen(true); setMobileToolsOpen(false) }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 border border-violet-100 dark:border-violet-800/50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-800/50 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">TI Calc</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { closeAllTools(); setPythonOpen(true); setMobileToolsOpen(false) }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 border border-teal-100 dark:border-teal-800/50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-800/50 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">Python</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { closeAllTools(); setJsOpen(true); setMobileToolsOpen(false) }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-800/50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-800/50 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">JS Playground</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { closeAllTools(); window.dispatchEvent(new CustomEvent('oc-toggle-video')); setMobileToolsOpen(false) }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 border border-sky-100 dark:border-sky-800/50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-800/50 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">Video Player</span>
              </motion.button>
            </div>

            {/* Quick stats / tips? */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap overflow-hidden">
               <span className="w-1 h-1 rounded-full bg-brand-500 animate-pulse" />
               Tap tools to open fullscreen overlays. Close via backdrop.
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <MobileBottomNav
        onMenuToggle={() => setSidebarOpen(o => !o)}
        onSearchOpen={openSearch}
        onToolsToggle={() => setMobileToolsOpen(o => !o)}
      />

      {calcOpen && <TICalc onClose={() => setCalcOpen(false)} />}
      <PinsPanel />
      <NotesPanel />
      <WelcomeModal />
      <SearchModal />
      <GlobalGrapher
        isOpen={graphOpen}
        launchConfig={graphOpen ? grapherLaunchConfig : null}
        onClose={() => { setGraphOpen(false); setGrapherLaunchConfig(null) }}
        onSwitchTo3D={() => { setGraphOpen(false); setGraph3DOpen(true) }}
        onSwitchToJSX={() => { setGraphOpen(false); setGraphJSXOpen(true) }}
      />
      <GlobalGrapher3D
        isOpen={graph3DOpen}
        launchConfig={graph3DOpen ? grapherLaunchConfig : null}
        onClose={() => { setGraph3DOpen(false); setGrapherLaunchConfig(null) }}
        onSwitchTo2D={() => { setGraph3DOpen(false); setGraphOpen(true) }}
        onSwitchToJSX={() => { setGraph3DOpen(false); setGraphJSXOpen(true) }}
      />
      <GlobalGrapherJSX
        isOpen={graphJSXOpen}
        launchConfig={graphJSXOpen ? grapherLaunchConfig : null}
        onClose={() => { setGraphJSXOpen(false); setGrapherLaunchConfig(null) }}
        onSwitchTo2D={() => { setGraphJSXOpen(false); setGraphOpen(true) }}
        onSwitchTo3D={() => { setGraphJSXOpen(false); setGraph3DOpen(true) }}
      />
      <ScratchPad isOpen={scratchOpen} onClose={() => setScratchOpen(false)} />
      <GlobalPythonNotebook isOpen={pythonOpen} onClose={() => setPythonOpen(false)} />
      <GlobalJSPlayground isOpen={jsOpen} onClose={() => setJsOpen(false)} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      {poolOpen && <PhysicsPoolLab onClose={() => setPoolOpen(false)} />}
      {basketOpen && <BasketballLab onClose={() => setBasketOpen(false)} />}
      {chemOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
          <ChemistryPage onClose={() => setChemOpen(false)} />
        </div>
      )}
    </div>
    </GrapherContext.Provider>
  )
}
