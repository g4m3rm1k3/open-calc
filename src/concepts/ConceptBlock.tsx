import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { getConceptFile } from './loader'
import { CodeBlockPre, CodeBlockCode } from '../components/math/CodeBlock.jsx'
import { runCode } from '../utils/codeRunner.js'
import { Play, X, ChevronRight, Cpu, GraduationCap } from 'lucide-react'

interface Props {
  /** Concept file id — matches the filename in src/concepts/ (no extension). */
  id: string
  /** Preferred starting language. Falls back to the first language the concept has. */
  lang?: string
}

const LANG_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  cpp: 'C++',
  c: 'C',
}

// Inline, collapsed-by-default concept reference — click to expand into a card
// showing a real runnable example, its walkthrough, and the CS/SE lens, with a
// language selector so the same concept can be viewed in any language it has
// content for. Modeled on AlgebraMicroLesson.jsx's interaction shell (same
// collapsed-trigger + click-outside-to-close popover pattern), generalized for
// multi-language runnable code instead of a single static formula. Self-contained —
// imports its own data and its own execution utility — so it works the same way
// whether it's embedded in a Lesson Engine markdown lesson or dropped directly into
// a hand-authored course page.
export default function ConceptBlock({ id, lang }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const concept = useMemo(() => getConceptFile(id), [id])
  const availableLangs = useMemo(() => concept ? Object.keys(concept.languages) : [], [concept])

  const [selectedLang, setSelectedLang] = useState(() =>
    (lang && concept?.languages[lang]) ? lang : availableLangs[0]
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (!concept) {
    return <span className="underline decoration-dashed decoration-red-500 text-red-500">Unknown concept: {id}</span>
  }

  const active = concept.languages[selectedLang]

  async function handleRun() {
    if (!active) return
    setRunning(true)
    setOutput(null)
    try {
      const result = await runCode(selectedLang, active.example)
      setOutput(typeof result === 'string' ? result : JSON.stringify(result))
    } catch (e) {
      setOutput('Error: ' + (e as Error).message)
    }
    setRunning(false)
  }

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition-all shadow-sm ${isOpen ? 'bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300 ring-2 ring-brand-500/40' : 'bg-slate-100 border border-slate-200 text-brand-600 hover:bg-brand-50 dark:bg-slate-800 dark:border-slate-700 dark:text-brand-400 dark:hover:bg-slate-700'}`}
        aria-expanded={isOpen}
      >
        <span className="text-[12px]">💡</span> {concept.name}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div
            ref={popoverRef}
            className="relative w-full max-w-4xl max-h-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-brand-500/10 border border-slate-200 dark:border-slate-800 overflow-hidden text-left font-sans flex flex-col"
          >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-5 py-3.5 flex justify-between items-center shadow-inner shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="bg-white/20 p-1 rounded-lg text-sm shadow-sm">💡</span>
              <span className="font-extrabold text-sm tracking-widest uppercase text-white shadow-sm">{concept.name}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 max-h-[75vh] overflow-y-auto">
            <p className="text-[15px] text-slate-700 dark:text-slate-300 mb-6 leading-relaxed font-medium">
              {concept.explanation}
            </p>

            {/* Language selector */}
            {availableLangs.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-5 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit shadow-inner">
                {availableLangs.map(l => (
                  <button
                    key={l}
                    onClick={() => { setSelectedLang(l); setOutput(null) }}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                      l === selectedLang
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {LANG_LABEL[l] ?? l}
                  </button>
                ))}
              </div>
            )}

            {active ? (
              <div className="flex flex-col gap-5">
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                  <CodeBlockPre className="!m-0 !rounded-none">
                    <CodeBlockCode className={`language-${selectedLang}`}>
                      {active.example}
                    </CodeBlockCode>
                  </CodeBlockPre>
                </div>

                {active.walkthrough && (
                  <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl p-4 shadow-sm">
                    <h4 className="flex items-center gap-1.5 font-extrabold uppercase tracking-widest text-[10px] text-brand-600 dark:text-brand-400 mb-2">
                      <ChevronRight className="w-3.5 h-3.5" /> Walkthrough
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {active.walkthrough}
                    </p>
                  </div>
                )}

                <div>
                  <button
                    onClick={handleRun}
                    disabled={running}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {running ? 'Running…' : 'Run Code'}
                  </button>
                </div>

                {output !== null && (
                  <div className="relative shadow-inner rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/50 pointer-events-none" />
                    <pre className="relative z-10 text-[13px] font-mono bg-slate-950 text-emerald-400 p-4 overflow-x-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
                      {output || '(no output)'}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic mb-2">No example authored for this language yet.</p>
            )}

            {(concept.csLens || concept.seLens) && (
              <div className="mt-8 flex flex-col gap-4">
                {concept.csLens && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 dark:bg-blue-500/20 p-2.5 rounded-xl shrink-0 border border-blue-200 dark:border-blue-500/30">
                      <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1.5">Computer Science Lens</h4>
                      <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{concept.csLens}</p>
                    </div>
                  </div>
                )}
                {concept.seLens && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-amber-100 dark:bg-amber-500/20 p-2.5 rounded-xl shrink-0 border border-amber-200 dark:border-amber-500/30">
                      <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1.5">Software Engineering Lens</h4>
                      <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{concept.seLens}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      , document.body)}
    </span>
  )
}
