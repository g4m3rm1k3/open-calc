import { useState } from 'react';
import CodeBlock from './CodeBlock.jsx';

const CATEGORY_COLORS = {
  foundations: '#6366f1',
  core: '#ec4899',
  spectral: '#f59e0b',
  orthogonality: '#10b981',
  decompositions: '#3b82f6',
  applications: '#ef4444',
};

function PrereqPanel({ topicId, topicMap, depth }) {
  const topic = topicMap[topicId];
  if (!topic) return null;
  return (
    <ConceptNode topic={topic} topicMap={topicMap} depth={depth} isEmbedded />
  );
}

export default function ConceptNode({ topic, topicMap, depth = 0, isEmbedded = false }) {
  const [openPrereqs, setOpenPrereqs] = useState({});
  const [showCode, setShowCode] = useState(false);

  const color = CATEGORY_COLORS[topic.category] || '#6366f1';
  const borderStyle = isEmbedded ? { borderLeft: `4px solid ${color}` } : {};

  function togglePrereq(prereqId) {
    setOpenPrereqs(prev => ({ ...prev, [prereqId]: !prev[prereqId] }));
  }

  return (
    <div
      className={`rounded-lg bg-gray-800 ${isEmbedded ? 'my-3' : ''}`}
      style={borderStyle}
    >
      <div className={`p-4 ${isEmbedded ? 'pl-5' : ''}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color + '30', color }}
          >
            {topic.category}
          </span>
          <h3 className={`font-bold text-white ${depth === 0 ? 'text-xl' : 'text-base'}`}>
            {topic.title}
          </h3>
        </div>

        {/* Summary */}
        <p className="text-gray-300 text-sm mb-2">{topic.summary}</p>

        {/* Intuition */}
        <p className="text-gray-400 text-sm italic mb-3">{topic.intuition}</p>

        {/* Steps — each step that has a prereq gets an expandable */}
        {topic.steps.length > 0 && (
          <div className="space-y-2 mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">How it works</p>
            {topic.steps.map((step, i) => (
              <div key={i}>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 text-xs mt-0.5 shrink-0">{i + 1}.</span>
                  <span className="text-gray-200 text-sm flex-1">{step.text}</span>
                  {step.prereq && topicMap[step.prereq] && (
                    <button
                      onClick={() => togglePrereq(step.prereq + '_' + i)}
                      className="shrink-0 text-xs px-2 py-0.5 rounded border transition-colors"
                      style={{
                        borderColor: CATEGORY_COLORS[topicMap[step.prereq].category] || '#6366f1',
                        color: CATEGORY_COLORS[topicMap[step.prereq].category] || '#6366f1',
                        backgroundColor: openPrereqs[step.prereq + '_' + i]
                          ? (CATEGORY_COLORS[topicMap[step.prereq].category] || '#6366f1') + '20'
                          : 'transparent',
                      }}
                    >
                      {openPrereqs[step.prereq + '_' + i] ? '▲' : '▼'}{' '}
                      {topicMap[step.prereq].title}
                    </button>
                  )}
                </div>

                {/* Inline prereq expansion */}
                {step.prereq && openPrereqs[step.prereq + '_' + i] && (
                  <PrereqPanel
                    topicId={step.prereq}
                    topicMap={topicMap}
                    depth={depth + 1}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Example */}
        {topic.example && (
          <div className="bg-gray-700 rounded px-3 py-2 mb-3 text-sm">
            <span className="text-yellow-400 font-semibold">Example: </span>
            <span className="text-gray-200">{topic.example}</span>
          </div>
        )}

        {/* Common mistakes */}
        {topic.mistakes?.length > 0 && (
          <div className="mb-3">
            {topic.mistakes.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 shrink-0">⚠</span>
                <span className="text-gray-300">{m}</span>
              </div>
            ))}
          </div>
        )}

        {/* Code toggle */}
        {(topic.code?.python?.length > 0 || topic.code?.matlab?.length > 0) && (
          <>
            <button
              onClick={() => setShowCode(v => !v)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-mono"
            >
              {showCode ? '▲ hide code' : '▼ show code'}
            </button>
            {showCode && (
              <CodeBlock
                python={topic.code.python || []}
                matlab={topic.code.matlab || []}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
