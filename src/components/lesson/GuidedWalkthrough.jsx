/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GuidedWalkthrough — the Guided Example Block (GEB)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ARCHITECTURAL PHILOSOPHY
 * ─────────────────────────
 * A lesson has three layers, analogous to software:
 *
 *   Definitions / theorems  →  API documentation   (what exists and its contract)
 *   Formal proofs            →  Source code         (why it is true)
 *   Worked examples (GEB)    →  Runtime trace       (watching it execute, step by step)
 *
 * Traditional textbooks force the reader's brain to act as both compiler AND
 * renderer. The GEB offloads the rendering to the lesson itself. The user
 * watches the equation mutate step-by-step, synchronized with a geometric
 * counterpart, without having to guess the "order of strategy."
 *
 * The "missing link" feeling students report — "I follow each line but I don't
 * know WHY we did that" — comes from the absence of this runtime trace layer.
 * Every GEB step must answer: what changed, what does the graph show, why was
 * this move made now, and does a concrete number verify it?
 *
 *
 * GEB BLUEPRINT — every step must include all applicable layers:
 * ──────────────────────────────────────────────────────────────
 *
 * LAYER 1 — Problem & Visual Grounding  (top of each walkthrough)
 *   • State exactly what is being solved (the objective)
 *   • Declare the initial visual state (svgId rendered above steps)
 *   • Name the canonical form / definition being executed
 *   • prereqs: which prior concepts must already be in memory
 *
 * LAYER 2 — Execution Loop  (one object per step)
 *   Each step is a single atomic action — one move, not a paragraph of moves.
 *
 *   label       — the action in plain English ("Eliminate $h$ using the constraint")
 *   visualNote  — what changes in the diagram at this exact step.
 *                 Even without a live SVG this grounds the abstraction spatially.
 *                 Example: "The $h$ label fades; replaced by $500/(\\pi r^2)$."
 *   strategy    — WHY this choice NOW, not just what. This is the "order of
 *                 strategy" — the reasoning a teacher speaks aloud but textbooks
 *                 omit. Example: "We solve for $h$ not $r$ because $h$ appears
 *                 only to the first power; isolating $r$ would introduce square
 *                 roots that inflate the Algebra Tax downstream."
 *   explanation — full prose walkthrough of the action. $inline math$ and
 *                 **bold** supported via parseProse.
 *   math        — the key expression or result as a display-mode LaTeX block.
 *                 This is the "algebraic state" at the end of this step.
 *   sandbox     — numerical grounding: plug in a specific value and verify.
 *                 The side-by-side proof that the abstraction is just arithmetic
 *                 dressed in letters. Shows: formula route == raw geometry route.
 *                 {
 *                   value:      'r = 5',          // the specific substitution
 *                   rows: [
 *                     { label: '$h$ from constraint', expr: '...' },
 *                     { label: 'SA with raw $h$',     expr: '... \\checkmark' },
 *                     { label: 'SA with formula',     expr: '... \\checkmark' },
 *                   ],
 *                   conclusion: 'One sentence confirming the algebra is correct.',
 *                 }
 *
 * LAYER 3 — Error Handling / Algebra Tax Callouts
 *   gotcha     — the exact step where textbooks silently skip logic. Surface the
 *                invisible move BEFORE the student has to wonder if they missed it.
 *                Example: "Rewrite $1/r$ as $r^{-1}$ before differentiating —
 *                the power rule requires the exponent form."
 *   conceptRef — link back to the definition / theorem being applied ("Power rule
 *                with negative exponents"). Closes the loop from runtime → source.
 *
 * LAYER 4 — Variation Test  (bottom of each walkthrough)
 *   variations — re-render the problem with changed props. Forces the student to
 *                understand the underlying logic rather than memorizing the example.
 *                Example: "What if the can has no top?" changes SA but not the method.
 *   {
 *     question: 'What if the can has no top (like a paper cup)?',
 *     hint:     'Remove one $\\pi r^2$ term from SA. Same constraint. Redo.',
 *   }
 *
 *
 * DISPLAY RULES
 * ─────────────
 * • All steps are visible at once — scroll straight through like a book.
 *   No "Next" buttons. No locked steps. The student reads, not clicks.
 * • If svgId is provided it renders once full-width above the steps.
 *   Future SVG components can read params.step to highlight the current state.
 * • Math renders inline below each explanation (display-mode KaTeX).
 * • Sandbox uses an indigo callout so it is visually distinct from explanation.
 * • Strategy uses a sky-blue callout — rationale, not content.
 * • Gotcha uses a rose callout — error prevention, not alarm.
 * • Multiple walkthroughs on one lesson get tab buttons in the header.
 *
 *
 * COMPLETE STEP SHAPE
 * ───────────────────
 *   {
 *     label:       'Eliminate $h$ using the volume constraint',
 *     visualNote:  'The cylinder\'s $h$ label fades; replaced by $500/(\\pi r^2)$.',
 *     strategy:    'We isolate $h$ not $r$ — first-power isolation avoids square roots.',
 *     explanation: 'Prose with $inline$ and **bold** support...',
 *     math:        'SA(r) = 2\\pi r^2 + \\frac{1000}{r}',
 *     sandbox: {
 *       value: 'r = 5',
 *       rows: [
 *         { label: '$h$ from constraint', expr: 'h = \\frac{500}{25\\pi} \\approx 6.36' },
 *         { label: 'SA formula',          expr: '2\\pi(25) + 1000/5 \\approx 357 \\checkmark' },
 *       ],
 *       conclusion: 'Both routes match — substitution verified.',
 *     },
 *     gotcha:      'Rewrite $1/r$ as $r^{-1}$ before differentiating.',
 *     conceptRef:  'Power rule with negative exponents',
 *   }
 *
 * Add walkthroughs to any lesson via: walkthroughs: [ { id, title, prereqs,
 * problem, svgId?, steps, variations? } ]
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import KatexBlock from '../math/KatexBlock.jsx'
import KatexInline from '../math/KatexInline.jsx'
import VizFrame from '../viz/VizFrame.jsx'
import { parseProse } from '../math/parseProse.jsx'

// ─── Sandbox — numerical grounding block ──────────────────────────────────────

function Sandbox({ sandbox }) {
  if (!sandbox) return null
  const { value, rows = [], conclusion } = sandbox
  return (
    <div className="mt-3 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20 overflow-hidden">
      <div className="px-3 py-1.5 bg-indigo-100/70 dark:bg-indigo-900/40 border-b border-indigo-200 dark:border-indigo-800/60 flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Sandbox Check
        </span>
        {value && (
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-mono font-semibold">
            — let <KatexInline expr={value} />
          </span>
        )}
      </div>
      {rows.length > 0 && (
        <div className="divide-y divide-indigo-100 dark:divide-indigo-900/40">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2">
              {row.label && (
                <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold flex-shrink-0 sm:w-36">
                  {parseProse(row.label)}
                </span>
              )}
              <div className="flex-1 overflow-x-auto">
                <KatexBlock expr={row.expr} />
              </div>
            </div>
          ))}
        </div>
      )}
      {conclusion && (
        <p className="px-3 py-2 text-xs text-indigo-700 dark:text-indigo-300 font-medium border-t border-indigo-100 dark:border-indigo-900/40">
          {parseProse(conclusion)}
        </p>
      )}
    </div>
  )
}

// ─── Single step ──────────────────────────────────────────────────────────────

function Step({ step, number }) {
  return (
    <div className="pb-5 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
      {/* Label row */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[10px] font-black text-brand-500 dark:text-brand-400 uppercase tracking-widest flex-shrink-0">
          Step {number}
        </span>
        {step.label && (
          <span className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-snug">
            — {parseProse(step.label)}
          </span>
        )}
      </div>

      {/* Visual note — what the graph shows here */}
      {step.visualNote && (
        <p className="mb-2 text-xs italic text-slate-400 dark:text-slate-500 leading-snug">
          <span className="not-italic font-semibold text-slate-400 dark:text-slate-500">Visual: </span>
          {parseProse(step.visualNote)}
        </p>
      )}

      {/* Strategy — WHY this choice */}
      {step.strategy && (
        <div className="mb-2 flex gap-2 text-sm bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 rounded-lg px-3 py-2 leading-snug">
          <span className="font-black text-sky-600 dark:text-sky-400 flex-shrink-0 text-xs uppercase tracking-wide mt-0.5">Strategy:</span>
          <span className="text-sky-800 dark:text-sky-200">{parseProse(step.strategy)}</span>
        </div>
      )}

      {/* Explanation prose */}
      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {parseProse(step.explanation ?? '')}
      </div>

      {/* Math block */}
      {step.math && (
        <div className="mt-2 overflow-x-auto rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 px-4 py-2">
          <KatexBlock expr={step.math} />
        </div>
      )}

      {/* Sandbox — numerical grounding */}
      <Sandbox sandbox={step.sandbox} />

      {/* Gotcha */}
      {step.gotcha && (
        <div className="mt-2 flex gap-2 text-xs bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-lg px-3 py-2 leading-snug">
          <span className="font-bold text-rose-500 dark:text-rose-400 flex-shrink-0">⚡ Watch out:</span>
          <span className="text-rose-700 dark:text-rose-300">{parseProse(step.gotcha)}</span>
        </div>
      )}

      {/* Concept ref */}
      {step.conceptRef && (
        <p className="mt-1.5 text-xs text-brand-500 dark:text-brand-400 font-medium">
          → {parseProse(step.conceptRef)}
        </p>
      )}
    </div>
  )
}

// ─── Walkthrough body ─────────────────────────────────────────────────────────

function WalkthroughBody({ wt }) {
  const steps = wt.steps ?? []

  return (
    <div className="px-5 py-4">
      {/* Prerequisites — one small line */}
      {wt.prereqs?.length > 0 && (
        <p className="text-xs text-amber-700 dark:text-amber-400 mb-3 leading-snug">
          <span className="font-bold uppercase tracking-wide">Needs: </span>
          {wt.prereqs.map((p, i) => (
            <span key={i}>{parseProse(p)}{i < wt.prereqs.length - 1 ? ' · ' : ''}</span>
          ))}
        </p>
      )}

      {/* Problem statement */}
      {wt.problem && (
        <div className="mb-5 pb-4 border-b border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Problem</p>
          <p className="font-semibold text-slate-800 dark:text-slate-100 leading-relaxed text-[15px]">
            {parseProse(wt.problem)}
          </p>
        </div>
      )}

      {/* Optional viz — rendered once above steps */}
      {wt.svgId && (
        <div className="mb-5 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <VizFrame id={wt.svgId} initialProps={{}} />
        </div>
      )}

      {/* All steps */}
      <div className="space-y-5">
        {steps.map((step, i) => (
          <Step key={i} step={step} number={i + 1} />
        ))}
      </div>

      {/* Variations */}
      {wt.variations?.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            What if…
          </p>
          {wt.variations.map((v, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                {parseProse(v.question)}
              </p>
              {v.hint && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">
                  {parseProse(v.hint)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function GuidedWalkthrough({ walkthroughs = [] }) {
  const [wtIdx, setWtIdx] = useState(0)

  if (!walkthroughs.length) return null

  const wt = walkthroughs[wtIdx]
  const hasMultiple = walkthroughs.length > 1

  return (
    <div className="mb-8 rounded-2xl overflow-hidden border border-brand-200 dark:border-brand-800/50 shadow-sm bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="px-5 py-2.5 bg-brand-50 dark:bg-brand-950/50 border-b border-brand-200 dark:border-brand-800/50 flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
          Worked Example
        </span>
        {hasMultiple ? (
          <div className="flex flex-wrap gap-1.5">
            {walkthroughs.map((w, i) => (
              <button
                key={i}
                onClick={() => setWtIdx(i)}
                className={`px-3 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                  i === wtIdx
                    ? 'bg-brand-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 border border-brand-200 dark:border-brand-700'
                }`}
              >
                {w.title ?? `Example ${i + 1}`}
              </button>
            ))}
          </div>
        ) : (
          wt.title && (
            <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{wt.title}</span>
          )
        )}
      </div>

      <WalkthroughBody key={wtIdx} wt={wt} />
    </div>
  )
}
