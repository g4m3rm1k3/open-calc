/**
 * MicroCycleLesson — single-column "Micro-Cycle" lesson layout.
 *
 * Each knowledge section flows vertically in order:
 *   🧠 Intuition  →  📐 Mathematics  →  ∴ Formal Proof  →  📝 Practice
 *
 * Visualizations are embedded full-width inside their section, not in a sidebar.
 * Mathematics starts open; Formal Proof starts collapsed ("prove it when ready").
 */
import { useState, useEffect } from 'react'
import VizFrame from '../viz/VizFrame.jsx'
import Callout from '../ui/Callout.jsx'
import StepThrough from './StepThrough.jsx'
import DynamicProof from './DynamicProof.jsx'
import ScrubbableExample from './ScrubbableExample.jsx'
import ChallengeBlock from './ChallengeBlock.jsx'
import UnifiedLearningDock from './UnifiedLearningDock.jsx'
import AssessmentBlock from './AssessmentBlock.jsx'
import { parseProse } from '../math/parseProse.jsx'
import KatexBlock from '../math/KatexBlock.jsx'
import { useProgress } from '../../hooks/useProgress.js'
import StickyNote from '../ui/StickyNote.jsx'

// Re-export parseProse so existing imports from IntegratedLesson still work
export { parseProse } from '../math/parseProse.jsx'

// ─── Shared prose utilities ────────────────────────────────────────────────

function ProseParagraph({ text }) {
  return <p className="mb-4 leading-relaxed last:mb-0 text-slate-700 dark:text-slate-300">{parseProse(text)}</p>
}

const BULLET_RE = /^[•\-*]\s+/
const ORDERED_RE = /^\d+\.\s+/

function renderMixedProse(prose) {
  const out = []
  let i = 0
  while (i < prose.length) {
    const p = prose[i]
    if (BULLET_RE.test(p)) {
      const items = []
      while (i < prose.length && BULLET_RE.test(prose[i])) {
        items.push(prose[i].replace(BULLET_RE, ''))
        i++
      }
      out.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1.5 mb-4 text-slate-700 dark:text-slate-300">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">{parseProse(item)}</li>
          ))}
        </ul>
      )
    } else if (ORDERED_RE.test(p)) {
      const items = []
      while (i < prose.length && ORDERED_RE.test(prose[i])) {
        items.push(prose[i].replace(ORDERED_RE, ''))
        i++
      }
      out.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-1.5 mb-4 text-slate-700 dark:text-slate-300">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">{parseProse(item)}</li>
          ))}
        </ol>
      )
    } else {
      out.push(<ProseParagraph key={`p-${i}`} text={p} />)
      i++
    }
  }
  return out
}

function normalizeProse(paragraphs = []) {
  const merged = []
  for (const raw of paragraphs) {
    const current = String(raw ?? '').trim()
    if (!current) continue
    const isListLike = /^(?:\d+\.|[•*-])\s/.test(current)
    const isHeadingLike = current.startsWith('**')
    const words = current.split(/\s+/).filter(Boolean)
    const isTinyFragment = words.length <= 2 && current.length <= 18
    if (!isListLike && !isHeadingLike && isTinyFragment && merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${current}`
    } else {
      merged.push(current)
    }
  }
  return merged
}

function SectionContent({ data }) {
  if (!data) return null

  // Blocks format — render all block types in natural order
  const rawBlocks = data.blocks ?? []
  const contentBlocks = rawBlocks.filter(b => b.type !== 'callout' || true) // include all types
  if (contentBlocks.length > 0) {
    return (
      <div className="space-y-4">
        {contentBlocks.map((block, i) => {
          if (block.type === 'prose') {
            return (
              <div key={i} className="prose-content text-slate-700 dark:text-slate-300">
                {renderMixedProse(normalizeProse(block.paragraphs ?? []))}
              </div>
            )
          }
          if (block.type === 'callout') return <Callout key={i} {...block} />
          if (block.type === 'stepthrough') return <StepThrough key={i} {...block} />
          if (block.type === 'viz') {
            const norm = normalizeViz(block)
            return norm ? <VizCard key={i} viz={norm} /> : null
          }
          return null
        })}
        {(data.callouts ?? []).map((c, i) => <Callout key={`extra-${i}`} {...c} />)}
      </div>
    )
  }

  // Legacy format (prose + callouts arrays, no blocks)
  const prose = normalizeProse(data.prose)
  return (
    <div className="space-y-4">
      {renderMixedProse(prose)}
      {(data.callouts ?? []).map((c, i) => <Callout key={i} {...c} />)}
    </div>
  )
}

// Normalize a visualization entry — supports {id} and legacy {vizId}
function normalizeViz(v) {
  if (!v) return null
  const id = v.id ?? v.vizId
  if (!id) return null
  return { id, props: v.props ?? v.visualizationProps ?? {}, title: v.title, caption: v.caption, mathBridge: v.mathBridge }
}

function getSectionVizzes(section) {
  if (!section) return []
  const vizzes = []
  if (section.visualizationId) {
    vizzes.push({ id: section.visualizationId, props: section.visualizationProps ?? {} })
  }
  for (const v of section.visualizations ?? []) {
    const norm = normalizeViz(v)
    if (norm) vizzes.push(norm)
  }
  // De-duplicate by ID + props (allows multiple VideoEmbed with different URLs)
  const seen = new Set()
  return vizzes.filter(v => {
    const key = `${v.id}:${JSON.stringify(v.props ?? {})}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ─── Section divider ───────────────────────────────────────────────────────

function SectionDivider({ icon, label, color = 'slate', noteId }) {
  const colors = {
    slate: 'text-slate-500 dark:text-slate-400 after:bg-slate-200 dark:after:bg-slate-700',
    brand: 'text-brand-600 dark:text-brand-400 after:bg-brand-200 dark:after:bg-brand-800',
    purple: 'text-purple-600 dark:text-purple-400 after:bg-purple-200 dark:after:bg-purple-800',
    emerald: 'text-emerald-600 dark:text-emerald-400 after:bg-emerald-200 dark:after:bg-emerald-800',
  }
  return (
    <div id={noteId ? noteId.replace(/:/g, '-') : undefined} className={`flex items-center gap-3 mb-6 ${colors[color]}`}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <span className="font-bold text-sm uppercase tracking-widest flex-shrink-0">{label}</span>
      {noteId && <StickyNote noteId={noteId} />}
      <div className="flex-1 h-px after:block after:h-px bg-current opacity-30" />
    </div>
  )
}

// ─── Full-width viz card ───────────────────────────────────────────────────

function VizCard({ viz, noteId, borderColor = 'border-slate-200 dark:border-slate-700' }) {
  return (
    <div id={noteId ? noteId.replace(/:/g, '-') : undefined} className={`rounded-2xl overflow-hidden border ${borderColor} shadow-sm bg-white dark:bg-slate-900`}>
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        {viz.title
          ? <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{viz.title}</p>
          : <span />
        }
        {noteId && <StickyNote noteId={noteId} />}
      </div>
      {viz.mathBridge && (
        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50">
          <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">{parseProse(viz.mathBridge)}</p>
        </div>
      )}
      <VizFrame id={viz.id} initialProps={viz.props ?? {}} title={viz.title} />
      {viz.caption && (
        <p className="text-xs text-slate-400 dark:text-slate-500 px-4 py-2.5 italic text-center leading-relaxed border-t border-slate-100 dark:border-slate-800">
          {parseProse(viz.caption)}
        </p>
      )}
    </div>
  )
}

// ─── 📘 Semantic Layer ─────────────────────────────────────────────────────

function SemanticsBlock({ semantics }) {
  if (!semantics) return null
  return (
    <div className="mb-10 rounded-2xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/30 dark:bg-sky-950/20 overflow-hidden">
      <div className="px-5 py-3 border-b border-sky-100 dark:border-sky-900/40 bg-sky-100/50 dark:bg-sky-900/40">
        <h3 className="text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">Semantic Layer: Symbols & Meaning</h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {semantics.core?.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 min-w-[60px] p-1.5 rounded bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-800 text-center font-mono text-sm font-bold text-sky-600 dark:text-sky-400 shadow-sm">
                <KatexBlock expr={item.symbol} />
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 pt-1.5">{item.meaning}</p>
            </div>
          ))}
        </div>
        
        {semantics.rulesOfThumb?.length > 0 && (
          <div className="rounded-xl bg-white dark:bg-slate-900/50 border border-sky-100 dark:border-sky-800/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500 mb-2">Rules of Thumb</p>
            <ul className="space-y-2">
              {semantics.rulesOfThumb.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="text-sky-500 mt-0.5">→</span>
                  {parseProse(rule)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 🌉 Multi-Perspective Synchronization ──────────────────────────────────

function PerspectiveSync({ perspectives, bridge }) {
  if (!perspectives?.length) return null
  return (
    <div className="mb-8 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Perspective Synchronization Block</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {perspectives.map((p, i) => (
          <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-50 dark:border-indigo-800 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400 dark:text-indigo-500 mb-1">{p.type}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.statement}</p>
          </div>
        ))}
      </div>
      {bridge && (
        <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800 text-center">
          <p className="inline-block px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30">
            {bridge}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── ⚠️ Failure Modes ───────────────────────────────────────────────────────

function FailureModes({ modes }) {
  if (!modes?.length) return null
  return (
    <div className="mb-8 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 overflow-hidden">
      <div className="px-5 py-3 border-b border-rose-100 dark:border-rose-900/40 bg-rose-100/30 dark:bg-rose-900/30">
         <h3 className="text-xs font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400 flex items-center gap-2">
           <span>🚨</span> Failure Modes: Where the Definition Breaks
         </h3>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-rose-100 dark:border-rose-900/50">
              <th className="pb-2 font-bold text-rose-600 dark:text-rose-400">Case</th>
              <th className="pb-2 font-bold text-rose-600 dark:text-rose-400">Example</th>
              <th className="pb-2 font-bold text-rose-600 dark:text-rose-400">Internal Logic Failure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-50 dark:divide-rose-900/20">
            {modes.map((m, i) => (
              <tr key={i} className="hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-colors">
                <td className="py-3 pr-4 font-bold text-slate-800 dark:text-slate-200">{m.case}</td>
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 font-mono"><KatexBlock expr={m.example} /></td>
                <td className="py-3 italic text-rose-700 dark:text-rose-300">{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 🔍 Local Linearity ────────────────────────────────────────────────────

function LocalLinearity({ config }) {
  if (!config) return null
  return (
    <div className="mb-8 p-5 p-5 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/10 dark:bg-emerald-950/5">
       <div className="flex items-center gap-3 mb-3">
         <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">🔍</div>
         <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">Local Linearity Principle</h3>
       </div>
       <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 leading-snug">{config.statement}</p>
       <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900 shadow-sm mb-3 text-center">
          <KatexBlock expr={config.formula} />
       </div>
       <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">Meaning: {config.meaning}</p>
    </div>
  )
}

// ─── 🎯 Recall Triggers ───────────────────────────────────────────────────

function TriggerSystem({ triggers }) {
  if (!triggers?.length) return null
  return (
    <div className="mt-8 space-y-3">
       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Internal Trigger & Recall System</p>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
         {triggers.map((p, i) => (
           <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors cursor-default group">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight mb-1">Trigger</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 transition-colors">"{p.prompt}"</p>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-brand-500 font-bold uppercase mb-1">Recall</p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 italic">{p.recall}</p>
              </div>
           </div>
         ))}
       </div>
    </div>
  )
}

// ─── 🧠 Intuition block ────────────────────────────────────────────────────

function IntuitionBlock({ data, lesson }) {
  const hasAlternate = data?.alternate?.prose?.length > 0
    || data?.alternate?.callouts?.length > 0
    || data?.alternate?.visualizations?.length > 0

  const isBlocksFormat = (data?.blocks?.length ?? 0) > 0
  // If blocks format, vizzes are already rendered inline by SectionContent — don't render them again
  const primaryVizzes = isBlocksFormat ? [] : getSectionVizzes(data)
  const hasPrimary = data?.prose?.length > 0 || data?.callouts?.length > 0 || primaryVizzes.length > 0 || isBlocksFormat
  const alternateVizzes = hasAlternate ? getSectionVizzes(data.alternate) : []
  if (!hasPrimary && !hasAlternate) return null

  return (
    <div className="mb-10">
      <SectionDivider icon="🧠" label="Intuition" color="slate" noteId={lesson?.id ? `${lesson.id}:intuition` : undefined} />
      <SemanticsBlock semantics={data.semantics ?? lesson?.semantics} />

      <SectionContent data={data} />
      {data.perspectives?.length > 0 && <PerspectiveSync perspectives={data.perspectives} bridge={data.bridge} />}
      {data.localLinearity && <LocalLinearity config={data.localLinearity} />}
      {primaryVizzes.length > 0 && (
        <div className="mt-6 space-y-4">
          {primaryVizzes.map((viz, i) => (
            <VizCard key={`${viz.id}-${i}`} viz={viz} noteId={lesson?.id ? `${lesson.id}:viz:${viz.id}` : undefined} borderColor="border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      )}
      {data.failureModes?.length > 0 && <FailureModes modes={data.failureModes} />}
      {hasAlternate && (
        <>
          <div className="my-8 flex items-center gap-3 text-slate-400 dark:text-slate-600">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-semibold uppercase tracking-widest">Another way to see it</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <SectionContent data={data.alternate} />
          {alternateVizzes.length > 0 && (
            <div className="mt-6 space-y-4">
              {alternateVizzes.map((viz, i) => (
                <VizCard key={`alt-${viz.id}-${i}`} viz={viz} noteId={lesson?.id ? `${lesson.id}:viz:alt-${viz.id}` : undefined} borderColor="border-slate-200 dark:border-slate-700" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── 📐 Mathematics block ──────────────────────────────────────────────────

function MathBlock({ data, lessonId }) {
  const [open, setOpen] = useState(true)
  const isBlocksFormat = (data?.blocks?.length ?? 0) > 0
  const vizzes = isBlocksFormat ? [] : getSectionVizzes(data)
  const hasProse = data?.prose?.length > 0 || isBlocksFormat
  const hasCallouts = data?.callouts?.length > 0
  if (!hasProse && !hasCallouts && !vizzes.length) return null

  return (
    <div id={lessonId ? `${lessonId}-math` : undefined} className="mb-8 rounded-2xl overflow-hidden border border-brand-200 dark:border-brand-900/60 shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-950/60 transition-colors text-left cursor-pointer"
      >
        <span className="text-xl">📐</span>
        <span className="font-bold text-brand-800 dark:text-brand-200 text-sm uppercase tracking-wider">Mathematics</span>
        <div className="flex-1 h-px bg-brand-200 dark:bg-brand-800/50" />
        {lessonId && <span onClick={e => e.stopPropagation()}><StickyNote noteId={`${lessonId}:math`} /></span>}
        <span className="text-brand-400 text-xs font-semibold">{open ? 'Hide ▲' : 'Show ▼'}</span>
      </div>
      {open && (
        <div className="px-6 py-5 bg-brand-50/30 dark:bg-brand-950/10 space-y-4">
          {data.processDefinition?.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-brand-600 text-white shadow-xl shadow-brand-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-200 mb-3">Operational Thinking: Finding the Derivative</p>
              <ol className="space-y-3">
                {data.processDefinition.map((step, i) => (
                  <li key={i} className="flex gap-4 text-sm font-semibold border-l-2 border-brand-400/30 pl-4 items-center">
                    <span className="w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center text-[10px] text-brand-300 flex-shrink-0">{i+1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <SectionContent data={data} />
          {vizzes.length > 0 && (
            <div className="mt-4 space-y-4">
              {vizzes.map((viz, i) => (
                <VizCard key={`${viz.id}-${i}`} viz={viz} noteId={lessonId ? `${lessonId}:viz:${viz.id}` : undefined} borderColor="border-brand-100 dark:border-brand-900" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ∴ Rigor / Formal Proof block ─────────────────────────────────────────

function RigorBlock({ data, lessonId }) {
  const [open, setOpen] = useState(false)
  const isBlocksFormat = (data?.blocks?.length ?? 0) > 0
  const vizzes = isBlocksFormat ? [] : getSectionVizzes(data)
  const proofVizId = data?.visualizationId
  const proofVizPropsKey = JSON.stringify(data?.visualizationProps ?? {})
  const extraVizzes = vizzes.filter((viz) => {
    if (!proofVizId) return true
    if (viz.id !== proofVizId) return true
    return JSON.stringify(viz.props ?? {}) !== proofVizPropsKey
  })
  const hasProse = data?.prose?.length > 0 || isBlocksFormat
  const hasCallouts = data?.callouts?.length > 0
  const hasProofSteps = data?.proofSteps?.length > 0
  if (!hasProse && !hasCallouts && !vizzes.length && !hasProofSteps) return null

  return (
    <div id={lessonId ? `${lessonId}-rigor` : undefined} className="mb-8 rounded-2xl overflow-hidden border border-purple-200 dark:border-purple-900/60 shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-colors text-left cursor-pointer"
      >
        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">∴</span>
        <span className="font-bold text-purple-800 dark:text-purple-200 text-sm uppercase tracking-wider">Formal Proof</span>
        <div className="flex-1 h-px bg-purple-200 dark:bg-purple-800/50" />
        {!open && (
          <span className="text-xs text-purple-400 dark:text-purple-500 italic mr-2 hidden sm:inline">
            Ready to see why this is true?
          </span>
        )}
        {lessonId && <span onClick={e => e.stopPropagation()}><StickyNote noteId={`${lessonId}:rigor`} /></span>}
        <span className="text-purple-400 text-xs font-semibold">{open ? 'Hide ▲' : 'Prove it ▼'}</span>
      </div>
      {open && (
        <div className="px-6 py-5 bg-purple-50/20 dark:bg-purple-950/10 space-y-4">
          {hasProse || hasCallouts || isBlocksFormat ? <SectionContent data={data} /> : null}
          {hasProofSteps ? (
            <DynamicProof
              steps={data.proofSteps}
              visualizationId={data.visualizationId}
              visualizationProps={data.visualizationProps ?? {}}
            />
          ) : null}
          {extraVizzes.length > 0 && (
            <div className="mt-4 space-y-4">
              {extraVizzes.map((viz, i) => (
                <VizCard key={`${viz.id}-${i}`} viz={viz} noteId={lessonId ? `${lessonId}:viz:${viz.id}` : undefined} borderColor="border-purple-100 dark:border-purple-900" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── 📝 Practice block ─────────────────────────────────────────────────────

function PracticeBlock({ examples, challenges, triggers, lessonId }) {
  const hasExamples = examples?.length > 0
  const hasChallenges = challenges?.length > 0
  if (!hasExamples && !hasChallenges) return null

  return (
    <div className="mt-10">
      {hasExamples && (
        <div className="mb-10">
          <SectionDivider icon="📝" label="Worked Examples" color="emerald" />
          <div className="space-y-6">
            {examples.map((ex, i) => (
              <ScrubbableExample key={ex.id ?? i} example={ex} number={i + 1} lessonId={lessonId} />
            ))}
          </div>
        </div>
      )}
      {hasChallenges && (
        <div>
          <SectionDivider icon="🎯" label="Challenge Problems" color="slate" />
          <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-5">
            Try each problem before revealing the walkthrough — the struggle is where learning happens.
          </p>
          <div className="space-y-4">
            {challenges.map((ch, i) => (
              <ChallengeBlock key={ch.id ?? i} challenge={ch} number={i + 1} />
            ))}
          </div>
        </div>
      )}
      {triggers?.length > 0 && <TriggerSystem triggers={triggers} />}
    </div>
  )
}

// ─── 🔗 Spiral Links block ─────────────────────────────────────────────────

function SpiralBlock({ spiral }) {
  if (!spiral) return null
  const { recoveryPoints = [], futureLinks = [] } = spiral
  if (!recoveryPoints.length && !futureLinks.length) return null
  return (
    <div className="mb-10 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 overflow-hidden">
      <div className="px-5 py-3 border-b border-amber-100 dark:border-amber-900/40 bg-amber-100/40 dark:bg-amber-900/30 flex items-center gap-2">
        <span>🔗</span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">Spiral Learning — Where You've Been &amp; Where You're Going</h3>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {recoveryPoints.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3">↩ Recovering From</p>
            <div className="space-y-3">
              {recoveryPoints.map((pt, i) => (
                <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-800/50 shadow-sm">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">{pt.label}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{pt.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {futureLinks.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">→ Unlocking Next</p>
            <div className="space-y-3">
              {futureLinks.map((pt, i) => (
                <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">{pt.label}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{pt.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ✅ Assessment block ──────────────────────────────────────────────────────

// ─── Main export ───────────────────────────────────────────────────────────

export default function MicroCycleLesson({ lesson }) {
  return (
    <div className="w-full">
      <IntuitionBlock data={lesson.intuition} lesson={lesson} />
      {lesson.mentalModel?.length > 0 && (
         <div className="mb-10 p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-transparent border-b-4 border-b-brand-500 shadow-md dark:shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 mb-4 text-center">Final Mental Model Compression</p>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
               {lesson.mentalModel.map((item, i) => (
                 <div key={i} className="text-center">
                    <p className="text-base font-bold text-slate-800 dark:text-transparent dark:bg-gradient-to-r dark:from-brand-300 dark:to-emerald-300 dark:bg-clip-text">{item}</p>
                 </div>
               ))}
            </div>
         </div>
      )}
      <MathBlock data={lesson.math} lessonId={lesson.id} />
      <RigorBlock data={lesson.rigor} lessonId={lesson.id} />
      <UnifiedLearningDock lesson={lesson} />
      <PracticeBlock examples={lesson.examples} challenges={lesson.challenges} triggers={lesson.triggers} lessonId={lesson.id} />
      <SpiralBlock spiral={lesson.spiral} />
      {lesson.assessment?.questions?.length > 0 && (
        <AssessmentBlock assessment={lesson.assessment} />
      )}
      {lesson.supplementalVisualizations?.length > 0 && (
        <div className="mt-12 space-y-8">
          <SectionDivider icon="🚀" label="Guided Walkthroughs" color="brand" />
          {lesson.supplementalVisualizations.map((v, i) => (
            <VizCard key={i} viz={v} noteId={`${lesson.id}:viz:supp-${v.id ?? i}`} borderColor="border-brand-200 dark:border-brand-900/60" />
          ))}
        </div>
      )}
    </div>
  )
}
