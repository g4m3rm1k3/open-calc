import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { getConceptFile, getConceptSeries } from './loader'
import StandardCodeBlock from '../components/blog/CodeBlock.jsx'
import InlineMarkdown from './InlineMarkdown.tsx'
import { X, ChevronRight, ChevronLeft, Cpu, GraduationCap, Layers, HelpCircle, Activity, AlertTriangle, PenTool } from 'lucide-react'

interface Props {
  /** Concept file id — matches the filename in src/concepts/ (no extension). */
  id: string
  /** Preferred starting language. Falls back to the first language the concept has. */
  lang?: string
  /**
   * Render the content directly, no collapsed trigger and no own modal/header/
   * language tabs — for a caller (like ConceptExplorerModal) that already provides
   * its own header, concept name, and language selector, and would otherwise end up
   * with two of each stacked on screen. Default (unset) behavior — the standalone
   * collapsed-pill-that-expands-into-a-modal widget — is completely unchanged.
   */
  embedded?: boolean
  /** Called with the next/previous concept id when this concept is part of a
   *  series and the caller wants to handle moving between parts (e.g.
   *  ConceptExplorerModal loading the next part into its main view). Without
   *  this, part navigation still shows but has nothing to call. */
  onNavigate?: (id: string) => void
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
export default function ConceptBlock({ id, lang, embedded = false, onNavigate }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const concept = useMemo(() => getConceptFile(id), [id])
  const availableLangs = useMemo(() => concept ? Object.keys(concept.languages) : [], [concept])
  const seriesParts = useMemo(() => concept?.series ? getConceptSeries(concept.series) : [], [concept])
  const partIndex = seriesParts.findIndex(p => p.id === id)

  const [selectedLang, setSelectedLang] = useState(() =>
    (lang && concept?.languages[lang]) ? lang : availableLangs[0]
  )

  useEffect(() => {
    if (embedded) return // embedded mode has no own popover to click outside of
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, embedded])

  if (!concept) {
    return <span className="underline decoration-dashed decoration-red-500 text-red-500">Unknown concept: {id}</span>
  }

  const active = concept.languages[selectedLang]

  const content = (
    <>
      {concept.series && seriesParts.length > 1 && (
        <div className="flex items-center justify-between gap-3 mb-4 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
              {concept.seriesTitle ?? concept.series} — Part {(concept.part ?? partIndex + 1)} of {seriesParts.length}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              disabled={partIndex <= 0}
              onClick={() => partIndex > 0 && onNavigate?.(seriesParts[partIndex - 1].id)}
              title={partIndex > 0 ? seriesParts[partIndex - 1].name : undefined}
              className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={partIndex === -1 || partIndex >= seriesParts.length - 1}
              onClick={() => partIndex < seriesParts.length - 1 && onNavigate?.(seriesParts[partIndex + 1].id)}
              title={partIndex < seriesParts.length - 1 ? seriesParts[partIndex + 1].name : undefined}
              className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Definition</h4>
        <p className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
          <InlineMarkdown text={concept.definition} />
        </p>
      </div>

      {concept.problem && (
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex gap-3 items-start">
          <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Problem</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              <InlineMarkdown text={concept.problem} />
            </p>
          </div>
        </div>
      )}

      {/* Language selector — only in standalone mode; an embedding caller (like
          ConceptExplorerModal) owns language selection itself via the `lang` prop. */}
      {!embedded && availableLangs.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit shadow-inner">
          {availableLangs.map(l => (
            <button
              key={l}
              onClick={() => setSelectedLang(l)}
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
        <div className="flex flex-col gap-7">
          {active.examples.map((ex, i) => (
            <div key={i} className="flex flex-col gap-5">
              {active.examples.length > 1 && (
                <h5 className={`text-xs font-bold ${
                  ex.label?.startsWith('✕') ? 'text-red-600 dark:text-red-400'
                  : ex.label?.startsWith('✓') ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {ex.label ?? `Example ${i + 1}`}
                </h5>
              )}
              <div className="relative group/code">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl blur-lg opacity-40 group-hover/code:opacity-80 transition duration-700 group-hover/code:duration-300" />
                <div className="relative">
                  <StandardCodeBlock language={selectedLang} code={ex.code} />
                </div>
              </div>

              {ex.walkthrough && (
                <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl p-4 shadow-sm">
                  <h4 className="flex items-center gap-1.5 font-extrabold uppercase tracking-widest text-[10px] text-brand-600 dark:text-brand-400 mb-2">
                    <ChevronRight className="w-3.5 h-3.5" /> Walkthrough
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <InlineMarkdown text={ex.walkthrough} />
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic mb-2">No example authored for this language yet.</p>
      )}

      {concept.execution && (
        <div className="mt-6 bg-slate-900 dark:bg-black/40 border border-slate-700 rounded-xl p-4 flex gap-3 items-start">
          <Activity className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-emerald-400 mb-1.5">Execution</h4>
            <pre className="text-[12px] font-mono text-slate-200 leading-relaxed whitespace-pre-wrap overflow-x-auto">{concept.execution}</pre>
          </div>
        </div>
      )}

      {(concept.cs || concept.se) && (
        <div className="mt-6 flex flex-col gap-4">
          {concept.cs && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 dark:bg-blue-500/20 p-2.5 rounded-xl shrink-0 border border-blue-200 dark:border-blue-500/30">
                <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1.5">Computer Science</h4>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-2"><InlineMarkdown text={concept.cs.text} /></p>
                {concept.cs.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {concept.cs.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {concept.se && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-amber-100 dark:bg-amber-500/20 p-2.5 rounded-xl shrink-0 border border-amber-200 dark:border-amber-500/30">
                <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1.5">Software Engineering</h4>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-2"><InlineMarkdown text={concept.se.text} /></p>
                {concept.se.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {concept.se.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {concept.commonMistakes.length > 0 && (
        <div className="mt-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 mb-1.5">Common Mistakes</h4>
            <ul className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 space-y-1">
              {concept.commonMistakes.map((m, i) => <li key={i}><InlineMarkdown text={m} /></li>)}
            </ul>
          </div>
        </div>
      )}

      {concept.exercises.length > 0 && (
        <div className="mt-6 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-xl p-4 flex gap-3 items-start">
          <PenTool className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1.5">Exercises</h4>
            <ul className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 space-y-1">
              {concept.exercises.map((ex, i) => <li key={i}><InlineMarkdown text={ex} /></li>)}
            </ul>
          </div>
        </div>
      )}
    </>
  )

  if (embedded) {
    return <div className="text-left font-sans">{content}</div>
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
            {content}
          </div>
        </div>
        </div>
      , document.body)}
    </span>
  )
}
