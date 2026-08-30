import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, Code2, Keyboard, RotateCcw, Sparkles, Target, Timer, Trophy, Zap } from 'lucide-react'
import { getAvailableConceptIds, getConceptFile } from '../../concepts/loader.ts'

const STARTER_LESSON = {
  id: 'starter-function',
  title: 'A tiny function',
  language: 'JavaScript',
  concept: 'Function basics',
  code: "function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('coder'));",
}

const SYMBOLS = [
  ['{', 'left brace'], ['}', 'right brace'], ['(', 'open paren'], [')', 'close paren'],
  ['[', 'left bracket'], [']', 'right bracket'], [';', 'semicolon'], ['=', 'equals'],
  ['`', 'backtick'], ['!', 'bang'], ['/', 'slash'], ['_', 'underscore'],
]

function prettyKey(char) {
  if (char === ' ') return 'Space'
  if (char === '\n') return 'Enter'
  if (char === '\t') return 'Tab'
  return char
}

function elapsedLabel(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function codeClass(char) {
  if (/['"`]/.test(char)) return 'text-amber-500 dark:text-amber-300'
  if (/\d/.test(char)) return 'text-violet-500 dark:text-violet-300'
  if (/[{}()[\];=!.\/]/.test(char)) return 'text-sky-500 dark:text-sky-300'
  return 'text-slate-500 dark:text-slate-500'
}

function Stat({ icon: Icon, label, value, tint = 'brand' }) {
  const tints = {
    brand: 'bg-brand-500/12 text-brand-600 dark:text-brand-300',
    emerald: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
    amber: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
  }
  return <div className="min-w-[92px] rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2.5 shadow-sm dark:border-white/[.07] dark:bg-slate-900/60">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-slate-400 dark:text-slate-500"><Icon className={`h-3.5 w-3.5 ${tints[tint]}`} />{label}</div>
    <div className="mt-1 text-xl font-black tabular-nums text-slate-800 dark:text-slate-100">{value}</div>
  </div>
}

export default function CodeTypingStudio() {
  const [lesson, setLesson] = useState(STARTER_LESSON)
  const [conceptLessons, setConceptLessons] = useState([])
  const [typed, setTyped] = useState([])
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [attempts, setAttempts] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)
  const [done, setDone] = useState(false)
  const [lastError, setLastError] = useState(null)
  const typingRef = useRef(null)

  useEffect(() => {
    let alive = true
    const ids = getAvailableConceptIds().slice(0, 14)
    Promise.all(ids.map(async id => {
      const file = await getConceptFile(id)
      const [language, content] = Object.entries(file?.languages ?? {})[0] ?? []
      const example = content?.examples?.[0]?.code
      return example && example.length <= 600 && example.length > 15
        ? { id, title: file.name, language: language === 'javascript' ? 'JavaScript' : language, concept: file.name, code: example }
        : null
    })).then(items => { if (alive) setConceptLessons(items.filter(Boolean).slice(0, 5)) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!startedAt || done) return undefined
    const interval = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(interval)
  }, [startedAt, done])

  const elapsed = startedAt ? Math.max(1, Math.floor((now - startedAt) / 1000)) : 0
  const wpm = elapsed ? Math.round((correctKeystrokes / 5) / (elapsed / 60)) : 0
  const accuracy = attempts ? Math.round((correctKeystrokes / attempts) * 100) : 100
  const progress = lesson.code.length ? Math.round((typed.length / lesson.code.length) * 100) : 0
  const activeIndex = typed.length
  const expected = lesson.code[activeIndex]

  const reset = useCallback(() => {
    setTyped([]); setStartedAt(null); setNow(Date.now()); setAttempts(0); setCorrectKeystrokes(0); setDone(false); setLastError(null)
    requestAnimationFrame(() => typingRef.current?.focus())
  }, [])

  const chooseLesson = useCallback((next) => {
    setLesson(next)
    setTyped([]); setStartedAt(null); setNow(Date.now()); setAttempts(0); setCorrectKeystrokes(0); setDone(false); setLastError(null)
    requestAnimationFrame(() => typingRef.current?.focus())
  }, [])

  const onKeyDown = useCallback((event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key === 'Escape') { typingRef.current?.blur(); return }
    if (event.key === 'Backspace') {
      event.preventDefault()
      setTyped(current => current.slice(0, -1))
      setDone(false); setLastError(null)
      return
    }
    let key = event.key
    if (key === 'Enter') key = '\n'
    if (key === 'Tab') key = '\t'
    if (key.length !== 1 && key !== '\n' && key !== '\t') return
    event.preventDefault()
    setTyped(current => {
      if (current.length >= lesson.code.length) return current
      const isCorrect = key === lesson.code[current.length]
      setAttempts(total => total + 1)
      if (isCorrect) setCorrectKeystrokes(total => total + 1)
      else setLastError({ expected: lesson.code[current.length], received: key, index: current.length, nonce: Date.now() })
      if (!startedAt) setStartedAt(Date.now())
      const next = [...current, { char: key, correct: isCorrect }]
      if (next.length === lesson.code.length) setDone(true)
      return next
    })
  }, [lesson.code, startedAt])

  const characters = useMemo(() => [...lesson.code], [lesson.code])
  const errorCount = attempts - correctKeystrokes

  return <main className="relative min-h-full overflow-hidden bg-slate-50 px-4 py-5 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-7 sm:py-7">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-[radial-gradient(ellipse_at_top,rgba(var(--tw-custom-brand-500),.18),transparent_60%)]" />
    <div className="pointer-events-none absolute left-[10%] top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
    <div className="relative mx-auto max-w-7xl">
      <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-brand-600 dark:text-brand-300"><Sparkles className="h-4 w-4" />Code fluency lab</div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Type code. <span className="text-brand-600 dark:text-brand-300">Build instinct.</span></h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">Practice the punctuation, rhythm, and patterns you will actually use while writing code.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Stat icon={Timer} label="Time" value={elapsedLabel(elapsed)} />
          <Stat icon={Zap} label="Speed" value={`${wpm} WPM`} tint="amber" />
          <Stat icon={Target} label="Accuracy" value={`${accuracy}%`} tint="emerald" />
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_220px]">
        <aside className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-xl shadow-slate-900/[.04] backdrop-blur dark:border-white/[.07] dark:bg-slate-900/70">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-slate-400"><Code2 className="h-4 w-4 text-brand-500" />Lesson queue</div>
          <div className="space-y-2">
            {[STARTER_LESSON, ...conceptLessons].map(item => <button key={item.id} onClick={() => chooseLesson(item)} className={`w-full rounded-2xl border p-3 text-left transition-all ${lesson.id === item.id ? 'border-brand-400 bg-brand-500/10 shadow-sm' : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white dark:bg-slate-950/50 dark:hover:border-white/10'}`}>
              <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold">{item.title}</span>{lesson.id === item.id && <Check className="h-4 w-4 shrink-0 text-brand-500" />}</div>
              <div className="mt-1 text-[11px] font-medium text-slate-400">{item.language} · {item.code.length} chars</div>
            </button>)}
          </div>
          <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">Concept Explorer snippets appear here automatically when available.</p>
        </aside>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-2xl shadow-slate-900/[.08] backdrop-blur dark:border-white/[.08] dark:bg-slate-900/75">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-white/[.07]">
            <div><div className="text-sm font-black">{lesson.title}</div><div className="mt-0.5 text-xs text-slate-400">{lesson.language} · <span className="text-brand-600 dark:text-brand-300">{lesson.concept}</span></div></div>
            <div className="flex items-center gap-2"><div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-slate-950 dark:text-slate-400">{typed.length} / {lesson.code.length}</div><button onClick={reset} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10" title="Restart lesson"><RotateCcw className="h-4 w-4" /></button></div>
          </div>
          <div className="h-1 bg-slate-100 dark:bg-slate-950"><motion.div className="h-full bg-gradient-to-r from-brand-500 via-violet-500 to-cyan-400" animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} /></div>
          <div className="relative p-3 sm:p-6">
            <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-[.14em] text-slate-400"><span>Target code</span><span>Click anywhere to type</span></div>
            <div ref={typingRef} tabIndex={0} role="textbox" aria-label="Code typing practice area" onKeyDown={onKeyDown} onClick={() => typingRef.current?.focus()} className="relative min-h-[330px] cursor-text rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-[14px] leading-7 shadow-inner outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 sm:p-6 sm:text-[15px]">
              <pre className="m-0 whitespace-pre-wrap break-words">{characters.map((char, index) => {
                const entry = typed[index]
                const isCurrent = index === activeIndex
                const shown = char === ' ' ? '·' : char === '\n' ? '↵\n' : char === '\t' ? '⇥  ' : char
                return <motion.span key={index} initial={false} animate={entry ? { scale: entry.correct ? 1 : [1, 1.2, 1], y: entry.correct ? 0 : [0, -2, 0] } : { scale: 1, y: 0 }} transition={{ duration: .2 }} className={`relative rounded-sm ${entry?.correct ? 'bg-emerald-400/15 text-emerald-300' : entry && !entry.correct ? 'bg-rose-500/30 text-rose-200 underline decoration-rose-400 decoration-2' : isCurrent ? 'bg-brand-400/25 text-white ring-1 ring-brand-300/70' : codeClass(char)}`}>{shown}{isCurrent && <span className="absolute -bottom-1 left-0 h-0.5 w-full animate-pulse bg-brand-300" />}</motion.span>
              })}</pre>
              {activeIndex === 0 && <div className="pointer-events-none absolute bottom-8 right-8 hidden items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-2 text-xs text-slate-400 sm:flex"><Keyboard className="h-4 w-4 text-brand-300" />Start typing to begin</div>}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">Next key <kbd className="ml-1.5 rounded border border-slate-300 bg-white px-2 py-1 font-mono font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-200">{prettyKey(expected ?? '✓')}</kbd></div>
              <AnimatePresence mode="wait">{lastError && !done ? <motion.div key={lastError.nonce} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs font-bold text-rose-500">Expected “{prettyKey(lastError.expected)}” · typed “{prettyKey(lastError.received)}”</motion.div> : <div className="text-xs font-medium text-slate-400">Backspace lets you revise your last key.</div>}</AnimatePresence>
            </div>
          </div>
          <AnimatePresence>{done && <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-20 grid place-items-center bg-slate-950/80 p-6 text-center backdrop-blur-sm"><div className="max-w-sm"><motion.div initial={{ rotate: -20, scale: .5 }} animate={{ rotate: 0, scale: 1 }} className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-2xl"><Trophy className="h-10 w-10" /></motion.div><h2 className="text-3xl font-black text-white">Snippet complete!</h2><p className="mt-2 text-slate-300">{wpm} WPM · {accuracy}% accuracy · {errorCount} corrections to learn from.</p><div className="mt-6 flex justify-center gap-3"><button onClick={reset} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20">Try again</button><button onClick={() => { const options = [STARTER_LESSON, ...conceptLessons]; const index = options.findIndex(x => x.id === lesson.id); chooseLesson(options[(index + 1) % options.length]) }} className="flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-400">Next lesson <ChevronRight className="h-4 w-4" /></button></div></div></motion.div>}</AnimatePresence>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-xl shadow-slate-900/[.04] backdrop-blur dark:border-white/[.07] dark:bg-slate-900/70"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-slate-400"><Target className="h-4 w-4 text-emerald-500" />Session focus</div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-emerald-500/10 p-3"><div className="text-xl font-black text-emerald-600 dark:text-emerald-300">{correctKeystrokes}</div><div className="text-[10px] font-bold uppercase tracking-wide text-emerald-600/70 dark:text-emerald-300/70">Clean keys</div></div><div className="rounded-2xl bg-rose-500/10 p-3"><div className="text-xl font-black text-rose-600 dark:text-rose-300">{errorCount}</div><div className="text-[10px] font-bold uppercase tracking-wide text-rose-600/70 dark:text-rose-300/70">Misses</div></div></div></div>
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-xl shadow-slate-900/[.04] backdrop-blur dark:border-white/[.07] dark:bg-slate-900/70"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-slate-400"><Keyboard className="h-4 w-4 text-brand-500" />Symbol deck</div><p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">These characters are the building blocks of today’s code.</p><div className="mt-4 grid grid-cols-4 gap-2">{SYMBOLS.map(([symbol, name]) => <div key={symbol} title={name} className={`grid aspect-square place-items-center rounded-xl border text-sm font-black transition ${lesson.code.includes(symbol) ? 'border-brand-400/50 bg-brand-500/10 text-brand-600 shadow-sm dark:text-brand-300' : 'border-slate-200 bg-slate-50 text-slate-300 dark:border-white/[.06] dark:bg-slate-950/60 dark:text-slate-600'}`}>{symbol}</div>)}</div></div>
        </aside>
      </section>
    </div>
  </main>
}
