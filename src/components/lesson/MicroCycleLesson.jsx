/**
 * MicroCycleLesson — single-column "Micro-Cycle" lesson layout.
 *
 * Each knowledge section flows vertically in order:
 *   🧠 Intuition  →  📐 Mathematics  →  ∴ Formal Proof  →  📝 Practice
 *
 * Visualizations are embedded full-width inside their section, not in a sidebar.
 * Mathematics starts open; Formal Proof starts collapsed ("prove it when ready").
 */
import { useState } from 'react'
import VizFrame from '../viz/VizFrame.jsx'
import Callout from '../ui/Callout.jsx'
import StepThrough from './StepThrough.jsx'
import DynamicProof from './DynamicProof.jsx'
import ScrubbableExample from './ScrubbableExample.jsx'
import ChallengeBlock from './ChallengeBlock.jsx'
import UnifiedLearningDock from './UnifiedLearningDock.jsx'
import { parseProse } from '../math/parseProse.jsx'

// Re-export parseProse so existing imports from IntegratedLesson still work
export { parseProse } from '../math/parseProse.jsx'

// ─── Shared prose utilities ────────────────────────────────────────────────

function ProseParagraph({ text }) {
  return <p className="mb-4 leading-relaxed last:mb-0 text-slate-700 dark:text-slate-300">{parseProse(text)}</p>
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
  const prose = normalizeProse(data.prose)
  return (
    <div className="space-y-4">
      {prose.map((p, i) => <ProseParagraph key={i} text={p} />)}
      {(data.callouts ?? []).map((c, i) => <Callout key={i} {...c} />)}
      {(data.blocks ?? []).filter(b => b.type === 'stepthrough').map((b, i) => (
        <StepThrough key={i} {...b} />
      ))}
    </div>
  )
}

// Normalize a visualization entry — supports {id} and legacy {vizId}
function normalizeViz(v) {
  if (!v) return null
  const id = v.id ?? v.vizId
  if (!id) return null
  return { id, props: v.props ?? v.visualizationProps ?? {}, title: v.title, caption: v.caption }
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
  // De-duplicate
  const seen = new Set()
  return vizzes.filter(v => {
    if (seen.has(v.id)) return false
    seen.add(v.id)
    return true
  })
}

// ─── Section divider ───────────────────────────────────────────────────────

function SectionDivider({ icon, label, color = 'slate' }) {
  const colors = {
    slate: 'text-slate-500 dark:text-slate-400 after:bg-slate-200 dark:after:bg-slate-700',
    brand: 'text-brand-600 dark:text-brand-400 after:bg-brand-200 dark:after:bg-brand-800',
    purple: 'text-purple-600 dark:text-purple-400 after:bg-purple-200 dark:after:bg-purple-800',
    emerald: 'text-emerald-600 dark:text-emerald-400 after:bg-emerald-200 dark:after:bg-emerald-800',
  }
  return (
    <div className={`flex items-center gap-3 mb-6 ${colors[color]}`}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <span className="font-bold text-sm uppercase tracking-widest flex-shrink-0">{label}</span>
      <div className="flex-1 h-px after:block after:h-px bg-current opacity-30" />
    </div>
  )
}

// ─── Full-width viz card ───────────────────────────────────────────────────

function VizCard({ viz, borderColor = 'border-slate-200 dark:border-slate-700' }) {
  return (
    <div className={`rounded-2xl overflow-hidden border ${borderColor} shadow-sm`}>
      {viz.title && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{viz.title}</p>
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

// ─── 🧠 Intuition block ────────────────────────────────────────────────────

function IntuitionBlock({ data }) {
  const vizzes = getSectionVizzes(data)
  const hasProse = data?.prose?.length > 0
  const hasCallouts = data?.callouts?.length > 0
  if (!hasProse && !hasCallouts && !vizzes.length) return null

  return (
    <div className="mb-10">
      <SectionDivider icon="🧠" label="Intuition" color="slate" />
      <SectionContent data={data} />
      {vizzes.length > 0 && (
        <div className="mt-6 space-y-4">
          {vizzes.map((viz, i) => (
            <VizCard key={`${viz.id}-${i}`} viz={viz} borderColor="border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 📐 Mathematics block ──────────────────────────────────────────────────

function MathBlock({ data }) {
  const [open, setOpen] = useState(true)
  const vizzes = getSectionVizzes(data)
  const hasProse = data?.prose?.length > 0
  const hasCallouts = data?.callouts?.length > 0
  if (!hasProse && !hasCallouts && !vizzes.length) return null

  return (
    <div className="mb-8 rounded-2xl overflow-hidden border border-brand-200 dark:border-brand-900/60 shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-950/60 transition-colors text-left"
      >
        <span className="text-xl">📐</span>
        <span className="font-bold text-brand-800 dark:text-brand-200 text-sm uppercase tracking-wider">Mathematics</span>
        <div className="flex-1 h-px bg-brand-200 dark:bg-brand-800/50" />
        <span className="text-brand-400 text-xs font-semibold">{open ? 'Hide ▲' : 'Show ▼'}</span>
      </button>
      {open && (
        <div className="px-6 py-5 bg-brand-50/30 dark:bg-brand-950/10 space-y-4">
          <SectionContent data={data} />
          {vizzes.length > 0 && (
            <div className="mt-4 space-y-4">
              {vizzes.map((viz, i) => (
                <VizCard key={`${viz.id}-${i}`} viz={viz} borderColor="border-brand-100 dark:border-brand-900" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ∴ Rigor / Formal Proof block ─────────────────────────────────────────

function RigorBlock({ data }) {
  const [open, setOpen] = useState(false)
  const vizzes = getSectionVizzes(data)
  const hasProse = data?.prose?.length > 0
  const hasCallouts = data?.callouts?.length > 0
  const hasProofSteps = data?.proofSteps?.length > 0
  if (!hasProse && !hasCallouts && !vizzes.length && !hasProofSteps) return null

  return (
    <div className="mb-8 rounded-2xl overflow-hidden border border-purple-200 dark:border-purple-900/60 shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-colors text-left"
      >
        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">∴</span>
        <span className="font-bold text-purple-800 dark:text-purple-200 text-sm uppercase tracking-wider">Formal Proof</span>
        <div className="flex-1 h-px bg-purple-200 dark:bg-purple-800/50" />
        {!open && (
          <span className="text-xs text-purple-400 dark:text-purple-500 italic mr-2 hidden sm:inline">
            Ready to see why this is true?
          </span>
        )}
        <span className="text-purple-400 text-xs font-semibold">{open ? 'Hide ▲' : 'Prove it ▼'}</span>
      </button>
      {open && (
        <div className="px-6 py-5 bg-purple-50/20 dark:bg-purple-950/10 space-y-4">
          {hasProofSteps ? (
            <DynamicProof
              steps={data.proofSteps}
              visualizationId={data.visualizationId}
              visualizationProps={data.visualizationProps ?? {}}
            />
          ) : (
            <SectionContent data={data} />
          )}
          {!hasProofSteps && vizzes.length > 0 && (
            <div className="mt-4 space-y-4">
              {vizzes.map((viz, i) => (
                <VizCard key={`${viz.id}-${i}`} viz={viz} borderColor="border-purple-100 dark:border-purple-900" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── 📝 Practice block ─────────────────────────────────────────────────────

function PracticeBlock({ examples, challenges }) {
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
              <ScrubbableExample key={ex.id ?? i} example={ex} number={i + 1} />
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
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────

export default function MicroCycleLesson({ lesson }) {
  return (
    <div className="w-full">
      <IntuitionBlock data={lesson.intuition} />
      <MathBlock data={lesson.math} />
      <RigorBlock data={lesson.rigor} />
      <UnifiedLearningDock lesson={lesson} />
      <PracticeBlock examples={lesson.examples} challenges={lesson.challenges} />
    </div>
  )
}
