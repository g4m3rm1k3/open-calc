import NavButton from './NavButton.jsx';
import { getUsedBy, flattenPrereqsTopDown } from './graphUtils.js';

function Group({ label, children, empty }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">{label}</div>
      {children ?? <p className="text-slate-400 dark:text-slate-500 text-[13px] italic">{empty}</p>}
    </div>
  );
}

// Everything dependency-related for the current topic, consolidated in one
// place instead of repeated inside the lesson body — the Tree tab already
// draws the full graph, so this is just the actionable, clickable version.
export default function RelatedTopics({ topic, topicMap, allTopics, onNavigate, c }) {
  const prerequisites = flattenPrereqsTopDown(topic.id, topicMap);
  const usedBy = getUsedBy(topic.id, allTopics);

  return (
    <div>
      <Group label="Depends On (Immediate)" empty="Nothing — this is a foundational concept.">
        {topic.prereqs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topic.prereqs.map(id => (
              <NavButton key={id} id={id} topicMap={topicMap} onNavigate={onNavigate} c={c} />
            ))}
          </div>
        )}
      </Group>

      <Group label="Unlocks" empty="Nothing yet — this is a terminal topic.">
        {usedBy.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {usedBy.map(id => (
              <NavButton key={id} id={id} topicMap={topicMap} onNavigate={onNavigate} c={c} />
            ))}
          </div>
        )}
      </Group>

      <Group label="All Prerequisites" empty="None.">
        {prerequisites.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prerequisites.map(id => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-all shadow-sm bg-white dark:bg-slate-900"
              >
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">✓</span>
                {topicMap[id]?.title ?? id}
              </button>
            ))}
          </div>
        )}
      </Group>
    </div>
  );
}
