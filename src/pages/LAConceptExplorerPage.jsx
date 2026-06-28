import { useState, useMemo } from 'react';
import graphData from '../data/concept-graph.json';
import ConceptNode from '../components/concept-explorer/ConceptNode.jsx';
import ConceptSearch from '../components/concept-explorer/ConceptSearch.jsx';

export default function LAConceptExplorerPage({ onBack }) {
  const topics = graphData.topics;

  const topicMap = useMemo(() => {
    const map = {};
    topics.forEach(t => { map[t.id] = t; });
    return map;
  }, [topics]);

  const [selected, setSelected] = useState(
    topics.find(t => t.id === 'orthogonal-diagonalization') || topics[0],
  );

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
          selected={selected}
          onSelect={setSelected}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {selected ? (
            <ConceptNode
              topic={selected}
              topicMap={topicMap}
              depth={0}
              isEmbedded={false}
            />
          ) : (
            <p className="text-gray-400">Select a topic from the left to begin.</p>
          )}
        </div>
      </main>
    </div>
  );
}
