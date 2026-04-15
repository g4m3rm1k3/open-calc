/**
 * FirstPrinciplesLesson — "Reordered Calculus" component.
 *
 * Pedagogy: experience → breakdown → reconstruction → abstraction
 *
 * Three phases reveal sequentially:
 *   NEED         — the existing tools fail; a question emerges that cannot be answered
 *   DISCOVERY    — we rebuild the answer from scratch, step by step
 *   FORMALIZATION — we name what we built; introduce notation as compression
 *
 * Data shape (lesson.discovery):
 * {
 *   title: string,
 *   persona: string,          // 1-2 sentence first-person setup
 *   steps: [
 *     {
 *       phase: 'need' | 'discovery' | 'formalization',
 *       title: string,
 *       content: string,      // full markdown + math (MarkdownProse)
 *     }
 *   ],
 *   resolution: string,       // markdown — the "what we built" summary
 * }
 */
import { useState } from "react";
import MarkdownProse from "../math/MarkdownProse.jsx";

// ─── Phase metadata ──────────────────────────────────────────────────────────

const PHASES = {
  need: {
    label: "NEED",
    tagline: "Where the old tools break",
    color: "amber",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-400 dark:border-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    badge:
      "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    pill: "bg-amber-500 text-white",
    pillInactive:
      "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
    dividerBg:
      "bg-amber-500/10 dark:bg-amber-500/5 border-amber-200 dark:border-amber-800/50",
    dividerIcon: "⚠",
    dividerText: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  discovery: {
    label: "DISCOVERY",
    tagline: "Rebuilding the answer from scratch",
    color: "indigo",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    border: "border-indigo-400 dark:border-indigo-500",
    text: "text-indigo-700 dark:text-indigo-400",
    badge:
      "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    pill: "bg-indigo-500 text-white",
    pillInactive:
      "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
    dividerBg:
      "bg-indigo-500/10 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-800/50",
    dividerIcon: "🔧",
    dividerText: "text-indigo-700 dark:text-indigo-400",
    dot: "bg-indigo-400",
  },
  convergence: {
    label: "CONVERGENCE",
    tagline: "Watching the sums settle to one value",
    color: "violet",
    bg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-400 dark:border-violet-500",
    text: "text-violet-700 dark:text-violet-400",
    badge:
      "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    pill: "bg-violet-500 text-white",
    pillInactive:
      "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
    dividerBg:
      "bg-violet-500/10 dark:bg-violet-500/5 border-violet-200 dark:border-violet-800/50",
    dividerIcon: "≈",
    dividerText: "text-violet-700 dark:text-violet-400",
    dot: "bg-violet-400",
  },
  formalization: {
    label: "FORMALIZATION",
    tagline: "Naming what we just built",
    color: "emerald",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-400 dark:border-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    badge:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    pill: "bg-emerald-500 text-white",
    pillInactive:
      "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
    dividerBg:
      "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-800/50",
    dividerIcon: "∑",
    dividerText: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-400",
  },
};

const DEFAULT_PHASE_META = {
  label: "STEP",
  tagline: "Continue the investigation",
  color: "slate",
  bg: "bg-slate-50 dark:bg-slate-900/40",
  border: "border-slate-400 dark:border-slate-500",
  text: "text-slate-700 dark:text-slate-300",
  badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  pill: "bg-slate-500 text-white",
  pillInactive:
    "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
  dividerBg:
    "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
  dividerIcon: "•",
  dividerText: "text-slate-700 dark:text-slate-300",
  dot: "bg-slate-400",
};

function getPhaseMeta(phase) {
  return (
    PHASES[phase] ?? {
      ...DEFAULT_PHASE_META,
      label: String(phase ?? "step").toUpperCase(),
    }
  );
}

// ─── Phase Progress Bar ───────────────────────────────────────────────────────

function PhaseProgress({ phaseOrder, currentPhase, reachedPhases }) {
  return (
    <div className="flex items-center gap-0 w-full">
      {phaseOrder.map((phase, idx) => {
        const meta = getPhaseMeta(phase);
        const isActive = currentPhase === phase;
        const isReached = reachedPhases.has(phase);
        const isLast = idx === phaseOrder.length - 1;

        return (
          <div key={phase} className="flex items-center flex-1 min-w-0">
            <div
              className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all
              ${isActive ? `${meta.bg} ${meta.border} border` : ""}
              ${!isActive && isReached ? "opacity-60" : ""}
              ${!isActive && !isReached ? "opacity-30" : ""}
            `}
            >
              <span
                className={`flex-shrink-0 text-[9px] font-black uppercase tracking-[0.15em] leading-tight
                ${isActive || isReached ? meta.text : "text-slate-400 dark:text-slate-600"}
              `}
              >
                {meta.label}
              </span>
            </div>
            {!isLast && (
              <svg
                className="flex-shrink-0 w-4 h-4 text-slate-300 dark:text-slate-600 mx-0.5"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Phase Transition Banner ──────────────────────────────────────────────────

function PhaseTransition({ phase }) {
  const meta = getPhaseMeta(phase);
  return (
    <div
      className={`my-4 px-5 py-3 rounded-xl border flex items-center gap-3 ${meta.dividerBg}`}
    >
      <span className={`text-lg leading-none ${meta.dividerText}`}>
        {meta.dividerIcon}
      </span>
      <div>
        <p
          className={`text-[10px] font-black uppercase tracking-[0.2em] ${meta.dividerText}`}
        >
          {meta.label}
        </p>
        <p className={`text-xs font-medium ${meta.dividerText} opacity-80`}>
          {meta.tagline}
        </p>
      </div>
    </div>
  );
}

// ─── Individual Step ──────────────────────────────────────────────────────────

function Step({
  step,
  stepNumber,
  totalSteps,
  isCurrent,
  isCompleted,
  isExpanded,
  onToggle,
  onContinue,
  nextStep,
}) {
  const meta = getPhaseMeta(step.phase);

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-all
      ${isCurrent ? `border-l-4 ${meta.border} border-slate-200 dark:border-slate-700` : ""}
      ${isCompleted ? "border border-slate-200 dark:border-slate-700" : ""}
    `}
    >
      {/* Step header bar */}
      <button
        type="button"
        onClick={isCompleted ? onToggle : undefined}
        className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors
          ${isCurrent ? `${meta.bg}` : ""}
          ${isCompleted ? "bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/40 cursor-pointer" : ""}
        `}
      >
        {/* Step counter */}
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center
          ${isCurrent ? `${meta.pill}` : ""}
          ${isCompleted ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" : ""}
        `}
        >
          {isCompleted ? "✓" : stepNumber}
        </span>

        {/* Phase badge */}
        <span
          className={`flex-shrink-0 text-[9px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded
          ${isCurrent || isCompleted ? meta.badge : "bg-slate-100 dark:bg-slate-800 text-slate-400"}
        `}
        >
          {meta.label}
        </span>

        {/* Title */}
        <span
          className={`text-sm font-semibold flex-1 text-left
          ${isCurrent ? "text-slate-900 dark:text-slate-100" : ""}
          ${isCompleted ? "text-slate-500 dark:text-slate-400" : ""}
        `}
        >
          {step.title}
        </span>

        {isCompleted && (
          <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-600 ml-auto">
            {isExpanded ? "▲" : "▼"}
          </span>
        )}
        {isCurrent && (
          <span
            className={`ml-auto w-2 h-2 rounded-full flex-shrink-0 animate-pulse
            ${meta.dot}
          `}
          />
        )}
      </button>

      {/* Step content */}
      {(isCurrent || (isCompleted && isExpanded)) && (
        <div
          className={`px-5 pb-6 pt-4
          ${isCurrent ? "bg-white dark:bg-slate-900" : "bg-slate-50/60 dark:bg-slate-900/20"}
        `}
        >
          <MarkdownProse text={step.content} />

          {isCurrent && (
            <div className="mt-8 flex items-center justify-between">
              {stepNumber > 1 && (
                <button
                  onClick={onToggle}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition-colors"
                >
                  ← Review previous
                </button>
              )}
              <button
                onClick={onContinue}
                className={`ml-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95
                  ${
                    step.phase === "need"
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/25"
                      : step.phase === "discovery"
                        ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/25"
                        : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25"
                  }
                `}
              >
                {stepNumber === totalSteps
                  ? "See what we built →"
                  : nextStep
                    ? `${nextStep.title} →`
                    : "Continue →"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FirstPrinciplesLesson({ discovery }) {
  const [revealed, setRevealed] = useState(1);
  const [expandedCompleted, setExpandedCompleted] = useState(new Set());

  if (!discovery?.steps?.length) return null;

  const steps = discovery.steps;
  const isDone = revealed > steps.length;

  const phaseOrder = [];
  for (const step of steps) {
    if (step?.phase && !phaseOrder.includes(step.phase)) {
      phaseOrder.push(step.phase);
    }
  }

  const currentStep = steps[revealed - 1];
  const currentPhase = isDone
    ? (steps[steps.length - 1]?.phase ??
      phaseOrder[phaseOrder.length - 1] ??
      "need")
    : (currentStep?.phase ?? phaseOrder[0] ?? "need");

  // Track which phases have been reached
  const reachedPhases = new Set();
  for (let i = 0; i < Math.min(revealed, steps.length); i++) {
    reachedPhases.add(steps[i].phase);
  }
  if (isDone && steps[steps.length - 1]?.phase)
    reachedPhases.add(steps[steps.length - 1].phase);

  const toggleExpanded = (idx) => {
    setExpandedCompleted((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // Build the step list, inserting phase transition banners
  const renderedItems = [];
  let lastPhase = null;

  for (let idx = 0; idx < steps.length; idx++) {
    if (idx >= revealed && !isDone) break;

    const step = steps[idx];
    const isCurrent = !isDone && idx === revealed - 1;
    const isCompleted = isDone ? true : idx < revealed - 1;

    // Phase transition banner
    if (step.phase !== lastPhase) {
      renderedItems.push(
        <PhaseTransition
          key={`phase-${step.phase}-${idx}`}
          phase={step.phase}
        />,
      );
      lastPhase = step.phase;
    }

    renderedItems.push(
      <Step
        key={idx}
        step={step}
        stepNumber={idx + 1}
        totalSteps={steps.length}
        isCurrent={isCurrent}
        isCompleted={isCompleted}
        isExpanded={expandedCompleted.has(idx)}
        onToggle={() => toggleExpanded(idx)}
        onContinue={() => setRevealed((r) => r + 1)}
        nextStep={steps[idx + 1] ?? null}
      />,
    );
  }

  return (
    <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
      {/* Mission briefing header */}
      <div className="bg-slate-950 px-6 py-5">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-sky-400 mb-1.5">
          First Principles Investigation
        </p>
        <h3 className="text-xl font-bold text-white leading-snug mb-3">
          {discovery.title}
        </h3>
        {discovery.persona && (
          <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-sky-500/50 pl-3 italic">
            {discovery.persona}
          </p>
        )}
      </div>

      {/* Phase progress bar */}
      <div className="bg-slate-900 px-6 py-3 border-b border-slate-700">
        <PhaseProgress
          phaseOrder={phaseOrder}
          currentPhase={currentPhase}
          reachedPhases={reachedPhases}
        />
      </div>

      {/* Steps */}
      <div className="px-5 pt-2 pb-5 bg-white dark:bg-slate-900 space-y-3">
        {renderedItems}

        {/* Done — resolution */}
        {isDone && discovery.resolution && (
          <>
            <div className="mt-4 px-5 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-3">
                What We Built — From Scratch
              </p>
              <MarkdownProse text={discovery.resolution} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
