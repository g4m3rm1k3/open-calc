import { useState } from 'react';
import CodeBlock from './CodeBlock.jsx';
import DependencyTree from './DependencyTree.jsx';
import {
  getUsedBy,
  flattenPrereqsTopDown,
  computeDifficulty,
  computeEstimatedTime,
} from './graphUtils.js';

const CATEGORY_STYLES = {
  foundations: { cover: 'from-blue-600 via-blue-700 to-indigo-800', border: 'border-blue-700/40', glow: '0 0 40px rgba(59,130,246,0.25)', badge: 'bg-white/20 border-white/10 text-white', btn: 'bg-blue-950/30 border-blue-700/40 text-blue-300 hover:bg-blue-900/50 hover:text-white', section: 'text-blue-400', icon: 'text-blue-400' },
  core: { cover: 'from-cyan-500 via-sky-600 to-blue-700', border: 'border-cyan-700/40', glow: '0 0 40px rgba(6,182,212,0.25)', badge: 'bg-white/20 border-white/10 text-white', btn: 'bg-cyan-950/30 border-cyan-700/40 text-cyan-300 hover:bg-cyan-900/50 hover:text-white', section: 'text-cyan-400', icon: 'text-cyan-400' },
  spectral: { cover: 'from-purple-600 via-purple-700 to-violet-900', border: 'border-purple-700/40', glow: '0 0 40px rgba(168,85,247,0.25)', badge: 'bg-white/20 border-white/10 text-white', btn: 'bg-purple-950/30 border-purple-700/40 text-purple-300 hover:bg-purple-900/50 hover:text-white', section: 'text-purple-400', icon: 'text-purple-400' },
  orthogonality: { cover: 'from-emerald-500 via-emerald-600 to-teal-800', border: 'border-emerald-700/40', glow: '0 0 40px rgba(16,185,129,0.25)', badge: 'bg-white/20 border-white/10 text-white', btn: 'bg-emerald-950/30 border-emerald-700/40 text-emerald-300 hover:bg-emerald-900/50 hover:text-white', section: 'text-emerald-400', icon: 'text-emerald-400' },
  decompositions: { cover: 'from-orange-500 via-orange-600 to-red-700', border: 'border-orange-700/40', glow: '0 0 40px rgba(249,115,22,0.25)', badge: 'bg-white/20 border-white/10 text-white', btn: 'bg-orange-950/30 border-orange-700/40 text-orange-300 hover:bg-orange-900/50 hover:text-white', section: 'text-orange-400', icon: 'text-orange-400' },
  applications: { cover: 'from-rose-500 via-rose-600 to-pink-800', border: 'border-rose-700/40', glow: '0 0 40px rgba(244,63,94,0.25)', badge: 'bg-white/20 border-white/10 text-white', btn: 'bg-rose-950/30 border-rose-700/40 text-rose-300 hover:bg-rose-900/50 hover:text-white', section: 'text-rose-400', icon: 'text-rose-400' },
};

function NavButton({ id, topicMap, onNavigate, c }) {
  const topic = topicMap[id];
  if (!topic) return null;
  return (
    <button
      onClick={() => onNavigate(id)}
      className={`inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg border transition-all shadow-sm ${c.btn}`}
    >
      <span className={c.icon}>▶</span>
      {topic.title}
    </button>
  );
}

function Section({ label, color, children }) {
  return (
    <div className="mb-8">
      <div className={`text-[10px] font-black uppercase tracking-widest mb-3 ${color}`}>{label}</div>
      {children}
    </div>
  )
}

export default function ConceptNode({ topic, topicMap, allTopics, onNavigate }) {
  const [showCode, setShowCode] = useState(false);
  const [showTree, setShowTree] = useState(false);

  const c = CATEGORY_STYLES[topic.category] || CATEGORY_STYLES.foundations;
  const prerequisites = flattenPrereqsTopDown(topic.id, topicMap);
  const usedBy = getUsedBy(topic.id, allTopics);
  const difficulty = computeDifficulty(topic.id, topicMap);
  const estimatedTime = computeEstimatedTime(topic.id, topicMap);

  return (
    <div 
      className={`rounded-2xl overflow-hidden border ${c.border} bg-[#0e0e1a] transition-all duration-300`}
      style={{ boxShadow: c.glow }}
    >
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${c.cover} overflow-hidden px-8 py-6 flex items-start justify-between gap-4`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,1) 8px,rgba(255,255,255,1) 9px)' }} />
        
        <div className="relative z-10">
          <h2 className="font-black text-[28px] text-white leading-tight drop-shadow-md mb-2">{topic.title}</h2>
          <div className="text-white/80 text-[14px] leading-snug max-w-2xl font-medium">
            {topic.summary}
          </div>
        </div>
        <div className="relative z-10 flex-shrink-0 mt-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${c.badge}`}>
            {topic.category}
          </span>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Intuition */}
        <Section label="In Plain English" color="text-slate-400">
          <p className="text-slate-200 text-[14px] leading-relaxed">{topic.intuition}</p>
        </Section>

        {/* Algorithm / Steps */}
        {topic.steps.length > 0 && (
          <Section label="Algorithm" color={c.section}>
            <div className="rounded-xl bg-[#13131f] border border-slate-700/50 px-5 py-4 shadow-inner">
              <ol className="space-y-3">
                {topic.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`text-sm font-bold mt-0.5 shrink-0 ${c.section}`}>{i + 1}.</span>
                    <span className="text-slate-200 text-[14px] leading-relaxed">{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Section>
        )}

        {/* Worked Example */}
        {topic.example && (
          <Section label="Worked Example" color="text-amber-500/70">
            <div className="rounded-xl border border-amber-700/30 bg-amber-950/10 px-5 py-4 text-slate-300 text-[14px] leading-relaxed">
              {topic.example}
            </div>
          </Section>
        )}

        {/* Common mistakes */}
        {topic.mistakes?.length > 0 && (
          <Section label="Common Mistakes" color="text-rose-400/70">
            <div className="space-y-2">
              {topic.mistakes.map((m, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[14px] bg-[#13131f] border border-rose-900/30 rounded-lg px-4 py-3">
                  <span className="text-rose-400 shrink-0 mt-0.5">⚠</span>
                  <span className="text-slate-300 leading-relaxed">{m}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        <hr className="border-slate-800/60 my-8" />

        {/* Stats row & Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Learning Path</div>
            <div className="flex gap-6 text-[13px] bg-[#13131f] border border-slate-700/50 rounded-xl px-4 py-3 shadow-inner">
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">Difficulty</div>
                <div className="text-slate-200 font-medium">{difficulty}</div>
              </div>
              <div className="w-px bg-slate-700/50"></div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">Estimated Time</div>
                <div className="text-slate-200 font-medium">{estimatedTime}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Prerequisites</div>
            {prerequisites.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {prerequisites.map(id => (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    className="text-[13px] text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/50 transition-all shadow-sm bg-[#13131f]"
                  >
                    <span className="text-emerald-400">✓</span>
                    {topicMap[id]?.title ?? id}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-[13px] italic px-2 py-1">No prerequisites.</p>
            )}
          </div>
        </div>

        {/* Depends On / Used By */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Depends On (Immediate)</div>
            {topic.prereqs.length === 0 ? (
              <p className="text-slate-500 text-[13px] italic px-2">
                Nothing — this is a foundational concept.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topic.prereqs.map(id => (
                  <NavButton key={id} id={id} topicMap={topicMap} onNavigate={onNavigate} c={c} />
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Unlocks</div>
            {usedBy.length === 0 ? (
              <p className="text-slate-500 text-[13px] italic px-2">Nothing yet — this is a terminal topic.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {usedBy.map(id => (
                  <NavButton key={id} id={id} topicMap={topicMap} onNavigate={onNavigate} c={c} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dependency tree toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowTree(v => !v)}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wide border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg"
          >
            {showTree ? '▲ Hide Full Dependency Tree' : '▼ View Full Dependency Tree'}
          </button>
          {showTree && (
            <div className="mt-4 rounded-xl border border-slate-700/50 bg-[#13131f] p-4 shadow-inner">
              <DependencyTree topicId={topic.id} topicMap={topicMap} />
            </div>
          )}
        </div>

        {/* Code toggle */}
        {(topic.code?.python?.length > 0 || topic.code?.matlab?.length > 0) && (
          <div className="mt-6">
            <button
              onClick={() => setShowCode(v => !v)}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wide border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-lg"
            >
              {showCode ? '▲ Hide Implementation Code' : '▼ View Implementation Code'}
            </button>
            {showCode && (
              <div className="mt-4">
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
  );
}
