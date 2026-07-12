import { useState, useRef, useEffect } from 'react';
import CodeBlock from './CodeBlock.jsx';
import Katex from './Katex.jsx';
import NavButton from './NavButton.jsx';
import { computeDifficulty, computeEstimatedTime } from './graphUtils.js';
import { CATEGORY_STYLES } from './categoryStyles.js';

function Section({ label, color, children }) {
  return (
    <div className="mb-8">
      <div className={`text-[10px] font-black uppercase tracking-widest mb-3 ${color}`}>{label}</div>
      {children}
    </div>
  )
}

export default function ConceptNode({ topic, topicMap, onNavigate }) {
  const [showCode, setShowCode] = useState(false);
  const scrollRef = useRef(null);

  const c = CATEGORY_STYLES[topic.category] || CATEGORY_STYLES.foundations;
  const difficulty = computeDifficulty(topic.id, topicMap);
  const estimatedTime = computeEstimatedTime(topic.id, topicMap);

  // Opening a dependency swaps `topic` in place — without this the scrollable
  // body keeps whatever scroll position the previous lesson was left at.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [topic.id]);

  return (
    <div className={`flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-all duration-300`}>
      {/* Scrollable Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        {/* Header (Scrolls with content) */}
        <div className={`relative bg-gradient-to-br ${c.cover} overflow-hidden px-10 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 dark:border-black/50 z-20`}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 dark:from-white/10 to-transparent pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,1) 8px,rgba(255,255,255,1) 9px)' }} />
          
          <div className="relative z-10 flex-1">
            <h2 className="font-black text-2xl text-white leading-tight drop-shadow-sm mb-1">{topic.title}</h2>
            <div className="text-white/90 text-[14px] leading-relaxed max-w-3xl font-medium drop-shadow-sm">
              {topic.summary}
            </div>
          </div>
          <div className="relative z-10 flex-shrink-0 mt-0 sm:mt-0.5">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${c.badge}`}>
              {topic.category}
            </span>
          </div>
        </div>

        <div className="px-10 py-8 max-w-4xl mx-auto pb-32">
          {/* Intuition */}
          <Section label="In Plain English" color="text-slate-500 dark:text-slate-400">
            <p className="text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed">{topic.intuition}</p>
          </Section>

          {/* Algorithm / Steps — each step that leans on a prerequisite surfaces
              it right there, at the point in the flow where it's actually used. */}
          {topic.steps.length > 0 && (
            <Section label="Algorithm" color={c.section}>
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 px-6 py-5 shadow-inner">
                <ol className="space-y-4">
                  {topic.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-4 flex-wrap">
                      <span className={`text-[15px] font-bold mt-0.5 shrink-0 ${c.section}`}>{i + 1}.</span>
                      <span className="text-slate-700 dark:text-slate-200 text-[15px] leading-relaxed flex-1">{step.text}</span>
                      {step.prereq && topicMap[step.prereq] && (
                        <NavButton id={step.prereq} topicMap={topicMap} onNavigate={onNavigate} c={c} />
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </Section>
          )}

          {/* Canonical Form — the general rule itself, in symbolic notation
              (a, b, c, d / x_1, x_2 / m×n), stated BEFORE any numbers are
              plugged in. This is what lets you tell "the rule" apart from
              "this one example" once the Worked Example below starts
              substituting real numbers. */}
          {topic.canonical && (
            <Section label="Canonical Form" color="text-sky-600 dark:text-sky-400/80">
              <div className="rounded-xl border border-sky-200 dark:border-sky-700/30 bg-sky-50 dark:bg-sky-950/10 px-6 py-5 shadow-sm space-y-4">
                {topic.canonical.intro && (
                  <div className="text-slate-800 dark:text-slate-200 text-[15px] font-semibold leading-relaxed">
                    {topic.canonical.intro}
                  </div>
                )}
                <ol className="space-y-4">
                  {topic.canonical.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-sky-600 dark:text-sky-400 text-[14px] font-bold mt-0.5 shrink-0">{i + 1}.</span>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {rule.note && (
                          <div className="text-slate-700 dark:text-slate-300 text-[14px] leading-relaxed italic">{rule.note}</div>
                        )}
                        <div className="overflow-x-auto py-1">
                          <Katex latex={rule.latex} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Section>
          )}

          {/* Worked Example — a real walkthrough (preferred) walks through an actual
              problem step by step, naming exactly which technique produced each
              intermediate result so you can jump there if you don't remember it.
              Topics without one yet fall back to the older one-line summary. */}
          {topic.walkthrough ? (
            <Section label="Worked Example" color="text-amber-600 dark:text-amber-500/70">
              <div className="rounded-xl border border-amber-200 dark:border-amber-700/30 bg-amber-50 dark:bg-amber-950/10 px-6 py-5 shadow-sm space-y-4">
                <div className="text-slate-800 dark:text-slate-200 text-[15px] font-semibold leading-relaxed">
                  {topic.walkthrough.problem}
                </div>
                {topic.walkthrough.problemLatex && (
                  <div className="overflow-x-auto py-1">
                    <Katex latex={topic.walkthrough.problemLatex} />
                  </div>
                )}
                <ol className="space-y-4">
                  {topic.walkthrough.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-amber-600 dark:text-amber-500 text-[14px] font-bold mt-0.5 shrink-0">{i + 1}.</span>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {step.note && (
                          <div className="text-slate-700 dark:text-slate-300 text-[14px] leading-relaxed italic">{step.note}</div>
                        )}
                        {step.latex ? (
                          <div className="overflow-x-auto py-1">
                            <Katex latex={step.latex} />
                          </div>
                        ) : step.text && (
                          <div className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed">{step.text}</div>
                        )}
                        {step.sourceTopic && topicMap[step.sourceTopic] && (
                          <div className="flex items-center gap-1.5 text-[12px] text-amber-700 dark:text-amber-400/80">
                            <span className="italic">from</span>
                            <NavButton id={step.sourceTopic} topicMap={topicMap} onNavigate={onNavigate} c={c} />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {(topic.walkthrough.answer || topic.walkthrough.answerLatex) && (
                  <div className="rounded-lg border border-amber-300 dark:border-amber-600/40 bg-amber-100/60 dark:bg-amber-500/10 px-4 py-3 space-y-2">
                    <span className="text-amber-700 dark:text-amber-400 text-[12px] font-bold uppercase tracking-wide">Answer</span>
                    {topic.walkthrough.answerLatex ? (
                      <div className="overflow-x-auto py-1">
                        <Katex latex={topic.walkthrough.answerLatex} />
                      </div>
                    ) : (
                      <div className="text-slate-800 dark:text-slate-200 text-[15px] font-mono">{topic.walkthrough.answer}</div>
                    )}
                  </div>
                )}
              </div>
            </Section>
          ) : topic.example && (
            <Section label="Worked Example" color="text-amber-600 dark:text-amber-500/70">
              <div className="rounded-xl border border-amber-200 dark:border-amber-700/30 bg-amber-50 dark:bg-amber-950/10 px-6 py-5 text-slate-800 dark:text-slate-300 text-[15px] leading-relaxed shadow-sm">
                {topic.example}
              </div>
            </Section>
          )}

          {/* Common mistakes */}
          {topic.mistakes?.length > 0 && (
            <Section label="Common Mistakes" color="text-rose-600 dark:text-rose-400/70">
              <div className="space-y-3">
                {topic.mistakes.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 text-[15px] bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 rounded-lg px-5 py-4 shadow-sm">
                    <span className="text-rose-500 dark:text-rose-400 shrink-0 mt-0.5 font-bold">⚠</span>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{m}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <hr className="border-slate-200 dark:border-slate-800/60 my-10" />

          {/* Stats row — dependency info (Depends On / Unlocks / full Prerequisites
              list) moved to the right sidebar's Links tab: it's already drawn in
              the Tree tab too, and repeating it here was crowding the lesson. */}
          <div className="mb-10">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Learning Path</div>
            <div className="flex gap-6 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-xl px-5 py-4 shadow-inner max-w-sm">
              <div>
                <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-1">Difficulty</div>
                <div className="text-slate-700 dark:text-slate-200 font-semibold">{difficulty}</div>
              </div>
              <div className="w-px bg-slate-200 dark:bg-slate-700/50"></div>
              <div>
                <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-1">Estimated Time</div>
                <div className="text-slate-700 dark:text-slate-200 font-semibold">{estimatedTime}</div>
              </div>
            </div>
          </div>

          {/* Code toggle */}
          {(topic.code?.python?.length > 0 || topic.code?.matlab?.length > 0) && (
            <div className="mt-8">
              <button
                onClick={() => setShowCode(v => !v)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors uppercase tracking-wide border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-4 py-2 rounded-lg"
              >
                {showCode ? '▲ Hide Implementation Code' : '▼ View Implementation Code'}
              </button>
              {showCode && (
                <div className="mt-5">
                  <CodeBlock
                    python={topic.code.python || []}
                    matlab={topic.code.matlab || []}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
