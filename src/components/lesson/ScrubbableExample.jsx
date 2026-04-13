import { useEffect, useRef, useMemo, useState } from 'react'; // useRef kept for activeCardRef
import KatexBlock from '../math/KatexBlock.jsx';
import { parseProse } from '../math/parseProse.jsx';
import VizFrame from '../viz/VizFrame.jsx';
import StickyNote from '../ui/StickyNote.jsx';

function buildVisualizations(example, currentStep) {
  const items = [];

  if (example.visualizationId) {
    items.push({
      id: example.visualizationId,
      title: example.visualizationTitle,
      caption: example.visualizationCaption,
      props: { ...(example.params ?? {}), currentStep },
    });
  }

  for (const v of example.visualizations ?? []) {
    if (!v?.id) continue;
    items.push({
      id: v.id,
      title: v.title,
      caption: v.caption,
      props: { ...(v.props ?? {}), currentStep },
    });
  }

  const deduped = [];
  const seen = new Set();
  for (const v of items) {
    const key = `${v.id}:${JSON.stringify(v.props ?? {})}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(v);
  }
  return deduped;
}


function getHintPrompt(step) {
  if (step?.hint) return step.hint;
  if (!step?.expression) return 'Say the target of the next move, then apply one legal algebra/calculus operation toward that target.';
  if (step.expression.includes('\\lim')) return 'Try rewriting the expression into an equivalent form you can evaluate by substitution or a standard limit law.';
  if (step.expression.includes('\\frac')) return 'Check whether the numerator can be factored, expanded, or rationalized to simplify the fraction.';
  if (step.expression.includes('\\sin') || step.expression.includes('\\cos') || step.expression.includes('\\tan')) {
    return 'Identify outer vs. inner first, then apply the trig derivative with chain rule if needed.';
  }
  if (step.expression.includes('=')) return 'Focus on how this line is equivalent to the previous one: factor, distribute, combine like terms, or isolate a target term.';
  return 'Use one small legal transformation and re-check whether the new form is closer to the target.';
}

function getHintLevels(step, prevStep) {
  if (Array.isArray(step?.hints) && step.hints.length > 0) {
    return step.hints;
  }

  const expression = step?.expression ?? '';
  const fallback = getHintPrompt(step);

  const base = [
    `Level 1: ${fallback}`,
    'Level 2: Name the exact rule first (power/product/quotient/chain, limit law, algebra identity), then apply only that one rule.',
    'Level 3: Check each symbol change left-to-right and justify it in one sentence before moving on.',
  ];

  if (!expression) return base;

  if (expression.includes('\\lim')) {
    return [
      'Level 1: Substitute first and identify the limit type (regular value vs. indeterminate like 0/0).',
      'Level 2: If 0/0 appears, rewrite the expression (factor, conjugate, or common denominator) before taking the limit again.',
      'Level 3: After rewriting, apply direct substitution and verify the value approaches the labeled target from both sides.',
    ];
  }

  if (expression.includes('\\frac')) {
    return [
      'Level 1: Decide what kind of fraction this is: algebraic simplification, derivative ratio, or limit ratio.',
      'Level 2: Try a structural rewrite: factor numerator/denominator or rationalize if radicals are present.',
      'Level 3: Cancel only common factors (never terms) and restate why cancellation is legal here.',
    ];
  }

  if (expression.includes('\\sin') || expression.includes('\\cos') || expression.includes('\\tan')) {
    return [
      'Level 1: Mark outer function and inner function first.',
      'Level 2: Differentiate the outer function while keeping the inner expression unchanged.',
      'Level 3: Multiply by the derivative of the inner expression and simplify constants at the end.',
    ];
  }

  if (expression.includes("f'(x)") || /x\^\d/.test(expression) || expression.includes('dx')) {
    return [
      'Level 1: Differentiate term-by-term and keep constants attached to their terms.',
      'Level 2: For each power x^n, apply n*x^(n-1). Constants and standalone numbers differentiate to 0.',
      'Level 3: Recombine like terms only after all derivatives are computed.',
    ];
  }

  if (expression.includes('=')) {
    const prevExpr = prevStep?.expression ? `Previous line: ${prevStep.expression}` : 'Previous line: compare with the line right above.';
    return [
      'Level 1: Identify one legal transformation used in this equality (factor, distribute, combine, isolate).',
      'Level 2: Apply that single transformation only; do not do two moves at once.',
      `Level 3: ${prevExpr} Track exactly which part changed and why that preserves equality.`,
    ];
  }

  return base;
}

function compactExpr(expr, max = 84) {
  const text = String(expr ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}...`;
}

function inferStepAction(prevExpr, currentExpr) {
  if (!currentExpr) return 'identify the purpose of this transition';
  if (currentExpr.includes('\\lim')) return 'rewrite/evaluate the limit with a valid limit law';
  if (currentExpr.includes('\\frac') && currentExpr.includes('\\sqrt')) return 'rationalize to simplify the radical fraction';
  if (currentExpr.includes('\\frac')) return 'simplify the fraction by factoring or cancellation of common factors';
  if (currentExpr.includes('\\sin') || currentExpr.includes('\\cos') || currentExpr.includes('\\tan')) return 'differentiate trig structure with correct outer/inner identification';
  if (currentExpr.includes("f'(x)") || currentExpr.includes('dx')) return 'apply derivative rules term-by-term and simplify';
  if (prevExpr && currentExpr.includes('=') && currentExpr !== prevExpr) return 'perform one legal algebraic rewrite that preserves equality';
  return 'apply one legal algebra/calculus move that gets closer to the target form';
}

function getContextualHintLevels(step, prevStep, nextStep) {
  const currentExpr = compactExpr(step?.expression);
  const prevExpr = compactExpr(prevStep?.expression);
  const nextExpr = compactExpr(nextStep?.expression);
  const stepGoal = step?.strategy ?? step?.annotation ?? inferStepAction(prevExpr, currentExpr);

  const level1 = `Level 1: Goal of this exact step: ${stepGoal}`;

  const level2 = prevExpr
    ? `Level 2: Compare previous -> current: ${prevExpr} -> ${currentExpr}. Name the single rule that justifies this change before computing.`
    : `Level 2: On this line (${currentExpr}), isolate the main action first (factor, substitute, differentiate, or simplify), then do only that one action.`;

  const level3 = nextExpr
    ? `Level 3: Target for the next line is: ${nextExpr}. Ask: what intermediate rewrite bridges current to that target?`
    : 'Level 3: Check legality: state why this move is valid, then simplify constants/like terms only at the end.';

  return [level1, level2, level3];
}

export default function ScrubbableExample({ example, number, lessonId }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintLevelByStep, setHintLevelByStep] = useState({});
  const [newestFirst, setNewestFirst] = useState(false);
  const activeCardRef = useRef(null);

  const steps = example.steps || [];
  const maxStep = steps.length - 1;
  // isDone = user has advanced past the last step — all steps are stacked, conclusion shows
  const isDone = currentStep > maxStep;
  const visualizations = useMemo(() => buildVisualizations(example, currentStep), [example, currentStep]);

  if (steps.length === 0) return null;

  useEffect(() => {
    setShowHint(false);
  }, [currentStep]);

  const markHintUsed = () => {
    const wasShowingHint = showHint;
    setShowHint(true);
    if (wasShowingHint) {
      setHintLevelByStep((prev) => {
        const currentLevel = prev[currentStep] ?? 0;
        return { ...prev, [currentStep]: currentLevel + 1 };
      });
    }
  };

  // When done all steps are stacked; otherwise only steps before current are stacked
  const completedIndices = Array.from({ length: isDone ? steps.length : currentStep }, (_, i) => i);
  const orderedCompleted = newestFirst ? [...completedIndices].reverse() : completedIndices;

  // Active step data
  const activeStep = steps[currentStep];
  const prevS = currentStep > 0 ? steps[currentStep - 1] : null;
  const nextS = currentStep < maxStep ? steps[currentStep + 1] : null;
  const cHintLevels = Array.isArray(activeStep?.hints) && activeStep.hints.length > 0
    ? activeStep.hints
    : getContextualHintLevels(activeStep, prevS, nextS) ?? getHintLevels(activeStep, prevS);
  const cHintLevel = Math.min(hintLevelByStep[currentStep] ?? 0, cHintLevels.length - 1);
  const cHint = cHintLevels[cHintLevel];

  return (
    <div className="example-block bg-surface border border-border shadow-sm rounded-xl mb-8 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate">
            Example {number}: {example.title}
          </h3>
          {lessonId && <StickyNote noteId={`${lessonId}:example:${example.id ?? number}`} />}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold tabular-nums">
            {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={() => setNewestFirst(v => !v)}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            {newestFirst ? 'Newest ↑' : 'Oldest ↑'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Problem Statement — wraps on overflow, no scrollbar */}
        <div className="mb-5 p-4 bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-100 rounded-lg border border-brand-100 dark:border-brand-800 font-medium break-words">
          {/^\\[a-zA-Z[(]/.test(example.problem?.trimStart() ?? '') && !example.problem?.includes('$')
            ? <div className="overflow-x-auto"><KatexBlock expr={example.problem} /></div>
            : <span className="leading-relaxed">{parseProse(example.problem)}</span>}
        </div>

        {/* Active step card — always at top, Next button never moves */}
        <div ref={activeCardRef} className="mb-2 rounded-xl border-2 border-dashed border-brand-300 dark:border-brand-700 bg-white dark:bg-[#0f172a] p-4">
          {isDone ? (
            /* Conclusion fills the active card — no step expression, just text */
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">✓ Conclusion</p>
              <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed">{parseProse(example.conclusion)}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-[11px] font-bold flex items-center justify-center">
                  {currentStep + 1}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500 dark:text-brand-400">Current Step</span>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 mb-3">
                <div className="text-xl font-bold">
                  <KatexBlock expr={activeStep.expression} />
                </div>
                {activeStep.annotation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic leading-relaxed">
                    {parseProse(activeStep.annotation)}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={markHintUsed} className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 text-xs font-semibold transition-colors">
                  Show hint
                </button>
                {showHint && (
                  <button onClick={() => setShowHint(false)} className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors">
                    Hide hint
                  </button>
                )}
              </div>
              {showHint && (
                <div className="mb-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3">
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{parseProse(cHint)}</p>
                  {cHintLevel < cHintLevels.length - 1 && (
                    <button onClick={markHintUsed} className="mt-2 text-xs text-sky-700 dark:text-sky-300 font-semibold hover:underline">Need more help →</button>
                  )}
                </div>
              )}
            </>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              className="px-4 py-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-30 transition-colors font-medium text-sm"
            >
              ← Prev
            </button>
            {!isDone && (
              <button
                onClick={() => setCurrentStep(s => s + 1)}
                className="px-4 py-1.5 rounded bg-brand-500 hover:bg-brand-600 text-white transition-colors font-medium text-sm"
              >
                Next Step →
              </button>
            )}
          </div>
        </div>

        {/* Completed steps — stack below in order */}
        {orderedCompleted.length > 0 && (
          <div className="space-y-2 mb-5">
            {orderedCompleted.map((idx) => {
              const s = steps[idx];
              return (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/50 px-4 py-3">
                  <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <KatexBlock expr={s.expression} />
                    {s.annotation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic leading-relaxed">
                        {parseProse(s.annotation)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Synced visualization */}
        {visualizations.length > 0 && (
          <div className="mb-5 w-full border-2 border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-[#1e293b] p-2 relative min-h-[250px] overflow-hidden space-y-3">
            <div className="absolute top-2 left-2 bg-brand-100 text-brand-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm opacity-90 z-10">Synced Graphic</div>
            <div className="pt-6 space-y-3">
              {visualizations.map((viz, vIdx) => (
                <div key={`${viz.id}-${vIdx}`}>
                  {viz.title && <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-1 pb-1">{viz.title}</p>}
                  <VizFrame id={viz.id} initialProps={viz.props ?? {}} title={null} />
                  {viz.caption && <p className="text-[11px] text-slate-500 dark:text-slate-400 italic px-1 pt-1">{parseProse(viz.caption)}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
