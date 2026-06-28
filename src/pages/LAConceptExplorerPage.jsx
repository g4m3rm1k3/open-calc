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
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-gray-850 border-r border-gray-700 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white text-sm"
            >
              ←
            </button>
          )}
          <h1 className="font-bold text-white text-sm">LA Concept Explorer</h1>
        </div>
        <ConceptSearch
          topics={topics}
          selected={current}
          onSelect={handleSelectFromSidebar}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <ExecutionStack stack={stack} topicMap={topicMap} onJumpTo={handleJumpTo} />
          {current ? (
            <ConceptNode
              topic={current}
              topicMap={topicMap}
              allTopics={topics}
              onNavigate={handleNavigate}
            />
          ) : (
            <p className="text-gray-400">Select a topic from the left to begin.</p>
          )}
        </div>
      </main>
    </div>
  );
}
