import React, { useEffect, useMemo, useState } from 'react';
import KatexBlock from '../math/KatexBlock.jsx';
import { parseProse } from '../math/parseProse.jsx';
import VizFrame from '../viz/VizFrame.jsx';

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

function getCheckpointPrompt(step) {
  if (step?.checkpoint) return step.checkpoint;
  if (!step?.expression) return 'Name the purpose of this transition before moving on.';
  if (step.expression.includes('\\cdot')) return 'Why is multiplication of factors justified here?';
  if (step.expression.includes('\\frac')) return 'What quantity is this ratio measuring at this stage?';
  if (step.expression.includes('\\sin') || step.expression.includes('\\cos') || step.expression.includes('\\tan')) {
    return 'Which part is outer vs. inner before differentiating?';
  }
  return 'What structure did you preserve, and what did you differentiate?';
}

function getIntentPrompt(step) {
  if (step?.strategy) return step.strategy;
  if (step?.annotation) return step.annotation;
  if (!step?.expression) return 'Pause and state the purpose of this transition before advancing.';
  if (step.expression.includes('\\lim')) return 'Identify which limit law or algebraic rewrite makes this limit computable.';
  if (step.expression.includes('=')) return 'Explain why this new line is equivalent to the previous line.';
  if (step.expression.includes('\\frac')) return 'Say what the numerator and denominator represent in context.';
  return 'Name the mathematical goal of this step and the rule you are applying.';
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

export default function ScrubbableExample({ example, number }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showIntentCoach, setShowIntentCoach] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [hintedSteps, setHintedSteps] = useState(() => new Set());
  const [hintLevelByStep, setHintLevelByStep] = useState({});

  const steps = example.steps || [];
  const maxStep = steps.length - 1;
  const step = steps[currentStep];
  const visualizations = useMemo(() => buildVisualizations(example, currentStep), [example, currentStep]);

  if (steps.length === 0) return null;

  const stepIntent = getIntentPrompt(step);
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
  const nextStep = currentStep < maxStep ? steps[currentStep + 1] : null;
  const genericHintLevels = getHintLevels(step, prevStep);
  const contextualHintLevels = getContextualHintLevels(step, prevStep, nextStep);
  const hintLevels = Array.isArray(step?.hints) && step.hints.length > 0 ? step.hints : contextualHintLevels ?? genericHintLevels;
  const currentHintLevel = Math.min(hintLevelByStep[currentStep] ?? 0, hintLevels.length - 1);
  const stepHint = hintLevels[currentHintLevel];
  const stepIntentTitle = step.strategyTitle ?? 'Intuition Narrator';
  const checkpointPrompt = getCheckpointPrompt(step);

  useEffect(() => {
    setShowHint(false);
  }, [currentStep]);

  const markPredicted = () => {
    setScore((s) => s + 10 + Math.min(streak, 5) * 2);
    setStreak((s) => s + 1);
  };

  const markHintUsed = () => {
    setStreak(0);
    const wasShowingHint = showHint;
    setShowHint(true);

    setHintLevelByStep((prev) => {
      const currentLevel = prev[currentStep] ?? 0;
      const nextLevel = wasShowingHint
        ? Math.min(currentLevel + 1, hintLevels.length - 1)
        : currentLevel;
      return { ...prev, [currentStep]: nextLevel };
    });

    if (!hintedSteps.has(currentStep)) {
      setHintedSteps((prev) => {
        const next = new Set(prev);
        next.add(currentStep);
        return next;
      });
      setScore((s) => Math.max(0, s - 2));
    }
  };

  return (
    <div className="example-block bg-surface border border-border shadow-sm rounded-xl mb-8 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">
          Example {number}: {example.title}
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 font-semibold">Points: {score}</span>
          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 font-semibold">Streak: {streak}</span>
        </div>
      </div>

      <div className="p-6">
        {/* The Problem Statement — auto-detects pure LaTeX vs mixed prose */}
        <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-100 rounded-lg border border-brand-100 dark:border-brand-800 font-medium">
          {/* Pure LaTeX (starts with \, no prose prefix): KatexBlock for display rendering */}
        {/* Mixed text+math (starts with words, or uses $ / \[ delimiters): parseProse */}
        {/^\\[a-zA-Z[(]/.test(example.problem?.trimStart() ?? '') && !example.problem?.includes('$')
            ? <KatexBlock expr={example.problem} />
            : <span className="leading-relaxed">{parseProse(example.problem)}</span>}
        </div>

        {/* Unified Layer: math move + strategy intent + optional synced visuals */}
        <div className="flex flex-col gap-6 mb-6">
          <div className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 bg-white dark:bg-[#0f172a] w-full`}>
            <div className="grid gap-4 items-start grid-cols-1">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-2">Math Step</p>
                <div className="text-xl font-bold">
                  <KatexBlock expr={step.expression} />
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {showIntentCoach ? 'Intent coach is visible.' : 'Focus mode: only math is visible.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowIntentCoach((v) => !v)}
                    className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 text-xs font-semibold transition-colors"
                  >
                    {showIntentCoach ? 'Collapse Step Coach' : 'Show Step Coach'}
                  </button>
                </div>
              </div>

              {showIntentCoach && (
              <div className="rounded-lg border border-brand-200 dark:border-brand-900 bg-brand-50/70 dark:bg-brand-950/20 p-3">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-brand-600 dark:text-brand-300 mb-1">{stepIntentTitle}</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">{parseProse(stepIntent)}</p>
                <div className="mt-3 border-t border-brand-200 dark:border-brand-900 pt-2">
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Checkpoint</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{checkpointPrompt}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={markPredicted}
                    className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                  >
                    I predicted this move
                  </button>
                  <button
                    onClick={markHintUsed}
                    className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 text-xs font-semibold transition-colors"
                  >
                    I need a better hint
                  </button>
                  {showHint && (
                    <button
                      onClick={() => setShowHint(false)}
                      className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 text-xs font-semibold transition-colors"
                    >
                      Hide hint
                    </button>
                  )}
                </div>

                {showHint && (
                  <div className="mt-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 p-3">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-sky-700 dark:text-sky-300 mb-1">Hint</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{parseProse(stepHint)}</p>
                    <p className="text-xs text-sky-800/80 dark:text-sky-200/80 mt-2">
                      Hint level {currentHintLevel + 1} of {hintLevels.length}
                    </p>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>

          {visualizations.length > 0 && (
            <div className="w-full border-2 border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-[#1e293b] p-2 relative min-h-[250px] overflow-hidden space-y-3">
              <div className="absolute top-2 left-2 bg-brand-100 text-brand-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm opacity-90 z-10">Synced Graphic</div>
              <div className="pt-6 space-y-3">
                {visualizations.map((viz, idx) => (
                  <div key={`${viz.id}-${idx}`}>
                    {viz.title && <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-1 pb-1">{viz.title}</p>}
                    <div className="zoom-in-95">
                      <VizFrame id={viz.id} initialProps={viz.props ?? {}} title={null} />
                    </div>
                    {viz.caption && <p className="text-[11px] text-slate-500 dark:text-slate-400 italic px-1 pt-1">{parseProse(viz.caption)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scrub Bar Control */}
        <div className="w-full flex flex-col items-center gap-2">
            <div className="flex justify-between w-full text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                <span>Start</span>
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>Finish</span>
            </div>
            <input 
               type="range"
               min={0}
               max={maxStep}
               value={currentStep}
               onChange={(e) => setCurrentStep(parseInt(e.target.value))}
               className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-600 transition-colors"
            />
            <div className="flex gap-4 mt-4">
                <button 
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className="px-4 py-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-30 transition-colors font-medium text-sm"
                >
                    ← Prev Step
                </button>
                <button 
                  disabled={currentStep === maxStep}
                  onClick={() => setCurrentStep(Math.min(maxStep, currentStep + 1))}
                  className="px-4 py-1.5 rounded bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-30 transition-colors font-medium text-sm"
                >
                    Next Step →
                </button>
            </div>
        </div>

        {/* Conclusion visible only at end */}
        <div className={`mt-8 overflow-hidden transition-all duration-500 ${currentStep === maxStep ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg text-green-900 dark:text-green-100">
                <strong>Conclusion:</strong> <span className="leading-relaxed">{parseProse(example.conclusion)}</span>
            </div>
        </div>

      </div>
    </div>
  );
}
