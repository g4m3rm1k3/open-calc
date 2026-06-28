import { useState } from 'react';
import CodeBlock from './CodeBlock.jsx';
import DependencyTree from './DependencyTree.jsx';
import {
  getUsedBy,
  flattenPrereqsTopDown,
  computeDifficulty,
  computeEstimatedTime,
} from './graphUtils.js';

const CATEGORY_COLORS = {
  foundations: '#6366f1',
  core: '#ec4899',
  spectral: '#f59e0b',
  orthogonality: '#10b981',
  decompositions: '#3b82f6',
  applications: '#ef4444',
};

function NavButton({ id, topicMap, onNavigate }) {
  const topic = topicMap[id];
  if (!topic) return null;
  const color = CATEGORY_COLORS[topic.category] || '#6366f1';
  return (
    <button
      onClick={() => onNavigate(id)}
      className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded border transition-colors hover:bg-gray-700"
      style={{ borderColor: color, color }}
    >
      <span>▶</span>
      {topic.title}
    </button>
  );
}

export default function ConceptNode({ topic, topicMap, allTopics, onNavigate }) {
  const [showCode, setShowCode] = useState(false);
  const [showTree, setShowTree] = useState(false);

  const color = CATEGORY_COLORS[topic.category] || '#6366f1';
  const prerequisites = flattenPrereqsTopDown(topic.id, topicMap);
  const usedBy = getUsedBy(topic.id, allTopics);
  const difficulty = computeDifficulty(topic.id, topicMap);
  const estimatedTime = computeEstimatedTime(topic.id, topicMap);

  return (
    <div className="rounded-lg bg-gray-800 border border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color + '30', color }}
          >
            {topic.category}
          </span>
          <h2 className="font-bold text-white text-2xl">{topic.title}</h2>
        </div>

        {/* Goal */}
        <div className="rounded border border-gray-700 bg-gray-900 px-4 py-3 mb-4 font-mono text-sm">
          <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">Goal</div>
          <div className="text-gray-200">{topic.summary}</div>
        </div>

        {/* Intuition */}
        <p className="text-gray-400 text-sm italic mb-4">{topic.intuition}</p>

        {/* Stats row */}
        <div className="flex gap-6 mb-5 text-sm">
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">Difficulty</div>
            <div className="text-gray-200">{difficulty}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">Estimated Time</div>
            <div className="text-gray-200">{estimatedTime}</div>
          </div>
        </div>

        {/* Prerequisites overview */}
        {prerequisites.length > 0 && (
          <div className="mb-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Prerequisites
            </div>
            <div className="flex flex-wrap gap-2">
              {prerequisites.map(id => (
                <button
                  key={id}
                  onClick={() => onNavigate(id)}
                  className="text-sm text-gray-300 hover:text-white flex items-center gap-1.5"
                >
                  <span className="text-emerald-400">✓</span>
                  {topicMap[id]?.title ?? id}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Algorithm */}
        {topic.steps.length > 0 && (
          <div className="mb-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Algorithm
            </div>
            <ol className="space-y-1.5">
              {topic.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-500 text-sm mt-0.5 shrink-0">{i + 1}.</span>
                  <span className="text-gray-200 text-sm">{step.text}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Worked Example */}
        {topic.example && (
          <div className="rounded border-l-4 border-yellow-500 bg-gray-900 px-4 py-3 mb-5">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-1">
              Worked Example
            </div>
            <div className="text-gray-200 text-sm">{topic.example}</div>
          </div>
        )}

        {/* Common mistakes */}
        {topic.mistakes?.length > 0 && (
          <div className="mb-5 space-y-1.5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Common Mistakes
            </div>
            {topic.mistakes.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 shrink-0">⚠</span>
                <span className="text-gray-300">{m}</span>
              </div>
            ))}
          </div>
        )}

        {/* Depends On / Used By */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Depends On
            </div>
            {topic.prereqs.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                Nothing — this is a foundational concept.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topic.prereqs.map(id => (
                  <NavButton key={id} id={id} topicMap={topicMap} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Used By
            </div>
            {usedBy.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Nothing yet — this is a terminal topic.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {usedBy.map(id => (
                  <NavButton key={id} id={id} topicMap={topicMap} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dependency tree toggle */}
        <button
          onClick={() => setShowTree(v => !v)}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-mono mb-2 block"
        >
          {showTree ? '▲ hide full dependency tree' : '▼ view full dependency tree'}
        </button>
        {showTree && (
          <div className="mb-5">
            <DependencyTree topicId={topic.id} topicMap={topicMap} />
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
