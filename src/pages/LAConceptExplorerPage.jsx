import { useState, useMemo } from 'react';
import graphData from '../data/concept-graph.json';
import ConceptNode from '../components/concept-explorer/ConceptNode.jsx';
import ConceptSearch from '../components/concept-explorer/ConceptSearch.jsx';
import ExecutionStack from '../components/concept-explorer/ExecutionStack.jsx';

export default function LAConceptExplorerPage({ onBack }) {
  const topics = graphData.topics;

  const topicMap = useMemo(() => {
    const map = {};
    topics.forEach(t => { map[t.id] = t; });
    return map;
  }, [topics]);

  const defaultRoot = topics.find(t => t.id === 'orthogonal-diagonalization') || topics[0];
  const [stack, setStack] = useState(defaultRoot ? [defaultRoot.id] : []);

  const currentId = stack[stack.length - 1];
  const current = topicMap[currentId];

  function handleSelectFromSidebar(topic) {
    setStack([topic.id]);
  }

  function handleNavigate(topicId) {
    setStack(s => [...s, topicId]);
  }

  function handleJumpTo(index) {
    setStack(s => s.slice(0, index + 1));
  }

  return (
    <div className="fixed inset-0 flex bg-slate-50 dark:bg-[#07070f] text-slate-800 dark:text-white overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.03] z-0"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,currentColor 39px,currentColor 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,currentColor 39px,currentColor 40px)' }} />
      
      {/* Sidebar */}
      <aside className="w-80 shrink-0 bg-white/80 dark:bg-[#0e0e1a]/80 backdrop-blur-md border-r border-slate-200 dark:border-slate-800/60 flex flex-col z-10 relative shadow-xl dark:shadow-2xl">
        <div className="px-5 py-5 border-b border-slate-200 dark:border-slate-800/60 flex items-center gap-3 bg-gradient-to-br from-indigo-100/50 dark:from-indigo-950/40 to-transparent">
          {onBack && (
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-lg"
            >
              ←
            </button>
          )}
          <div>
            <h1 className="font-black text-[15px] tracking-wide bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm">Concept Explorer</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 font-bold tracking-wide uppercase mt-0.5">Linear Algebra</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConceptSearch
            topics={topics}
            selected={current}
            onSelect={handleSelectFromSidebar}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
        <div className="max-w-4xl mx-auto px-8 py-10 pb-24">
          <ExecutionStack stack={stack} topicMap={topicMap} onJumpTo={handleJumpTo} />
          {current ? (
            <ConceptNode
              topic={current}
              topicMap={topicMap}
              allTopics={topics}
              onNavigate={handleNavigate}
            />
          ) : (
            <div className="flex h-[50vh] items-center justify-center">
              <p className="text-slate-400 dark:text-slate-500 font-medium">Select a topic from the left to begin.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
