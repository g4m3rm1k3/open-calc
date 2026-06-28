import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import graphData from '../data/concept-graph.json';
import ConceptNode from '../components/concept-explorer/ConceptNode.jsx';
import ConceptSearch from '../components/concept-explorer/ConceptSearch.jsx';
import ExecutionStack from '../components/concept-explorer/ExecutionStack.jsx';
import DependencyTree from '../components/concept-explorer/DependencyTree.jsx';
import RelatedTopics from '../components/concept-explorer/RelatedTopics.jsx';
import { CATEGORY_STYLES } from '../components/concept-explorer/categoryStyles.js';

const STACK_STORAGE_KEY = 'la-explorer-stack';

export default function LAConceptExplorerPage() {
  const navigate = useNavigate();
  const topics = graphData.topics;

  const topicMap = useMemo(() => {
    const map = {};
    topics.forEach(t => { map[t.id] = t; });
    return map;
  }, [topics]);

  // Reopen wherever the student left off — there's no reason a reload should
  // bounce them to an arbitrary fixed topic instead of where they actually were.
  const [stack, setStack] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STACK_STORAGE_KEY));
      if (Array.isArray(saved) && saved.length > 0 && saved.every(id => topicMap[id])) {
        return saved;
      }
    } catch { /* ignore malformed/missing storage */ }
    return topics[0] ? [topics[0].id] : [];
  });
  const [rightTab, setRightTab] = useState('stack'); // 'stack' or 'tree'

  useEffect(() => {
    localStorage.setItem(STACK_STORAGE_KEY, JSON.stringify(stack));
  }, [stack]);

  const currentId = stack[stack.length - 1];
  const current = topicMap[currentId];
  const c = CATEGORY_STYLES[current?.category] || CATEGORY_STYLES.foundations;

  function handleSelectFromSidebar(topic) {
    setStack([topic.id]);
  }

  function handleNavigate(topicId) {
    setStack(s => [...s, topicId]);
    setRightTab('stack'); // switch to stack view so they can see the path they took
  }

  function handleJumpTo(index) {
    setStack(s => s.slice(0, index + 1));
  }

  return (
    <div className="relative flex h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.03] z-0"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,currentColor 39px,currentColor 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,currentColor 39px,currentColor 40px)' }} />

      {/* Left Sidebar */}
      <aside className="w-72 sm:w-80 shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200 dark:border-slate-800/60 flex flex-col z-10 relative shadow-xl dark:shadow-2xl transition-colors duration-500">
        <div className={`px-5 py-5 border-b border-slate-200 dark:border-slate-800/60 flex items-center gap-3 bg-gradient-to-br ${c.gradientBg} transition-colors duration-500`}>
          <button
            onClick={() => navigate('/')}
            title="Close Concept Explorer"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
          <div>
            <h1 className="font-black text-[15px] tracking-wide bg-gradient-to-r from-slate-600 to-slate-900 dark:from-slate-200 dark:to-white bg-clip-text text-transparent drop-shadow-sm transition-colors duration-500">Concept Explorer</h1>
            <p className={`text-[11px] font-bold tracking-wide uppercase mt-0.5 transition-colors duration-500 ${c.text}`}>Linear Algebra</p>
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

      {/* Main Content (Middle) */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative bg-white/40 dark:bg-transparent transition-colors duration-500">
        {current ? (
          <ConceptNode
            topic={current}
            topicMap={topicMap}
            onNavigate={handleNavigate}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400 dark:text-slate-500 font-medium">Select a topic from the left to begin.</p>
          </div>
        )}
      </main>

      {/* Right Sidebar (Execution Stack & Tree) */}
      <aside className="w-72 sm:w-80 shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-l border-slate-200 dark:border-slate-800/60 flex flex-col z-10 shadow-[-10px_0_20px_rgba(0,0,0,0.02)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.2)] transition-colors duration-500">
        <div className="flex border-b border-slate-200 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-950/50 shrink-0">
          <button 
            onClick={() => setRightTab('stack')} 
            className={`flex-1 py-3.5 text-[11px] font-black tracking-widest uppercase transition-all ${
              rightTab === 'stack' 
                ? `${c.activeTab} border-b-2`
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border-transparent border-b-2'
            }`}
          >
            Path
          </button>
          <button
            onClick={() => setRightTab('tree')}
            className={`flex-1 py-3.5 text-[11px] font-black tracking-widest uppercase transition-all ${
              rightTab === 'tree'
                ? `${c.activeTab} border-b-2`
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border-transparent border-b-2'
            }`}
          >
            Tree
          </button>
          <button
            onClick={() => setRightTab('links')}
            className={`flex-1 py-3.5 text-[11px] font-black tracking-widest uppercase transition-all ${
              rightTab === 'links'
                ? `${c.activeTab} border-b-2`
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border-transparent border-b-2'
            }`}
          >
            Links
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
          {rightTab === 'stack' && (
            <ExecutionStack stack={stack} topicMap={topicMap} onJumpTo={handleJumpTo} currentCategoryStyle={c} />
          )}
          {rightTab === 'tree' && current && (
            <DependencyTree topicId={current.id} topicMap={topicMap} onNavigate={handleNavigate} currentCategoryStyle={c} />
          )}
          {rightTab === 'links' && current && (
            <RelatedTopics topic={current} topicMap={topicMap} allTopics={topics} onNavigate={handleNavigate} c={c} />
          )}
        </div>
      </aside>
    </div>
  );
}
