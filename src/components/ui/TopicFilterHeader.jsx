import HomeTopicSearch from './HomeTopicSearch.jsx'

export default function TopicFilterHeader({
  query, onQueryChange,
  topics, topicOrder, activeTopicId, activeSubtopicId,
  onSelectTopic, onSelectSubtopic,
}) {
  const activeTopic = topics[activeTopicId]

  return (
    <div className="w-[90vw] max-w-none mx-auto mb-6">
      <HomeTopicSearch onSearch={onQueryChange} />

      <div className="flex flex-wrap items-end gap-x-8 gap-y-2 border-b-2 border-slate-300 dark:border-slate-700 pb-2">
        {topicOrder.map((id) => {
          const topic = topics[id]
          if (!topic) return null
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTopic(id)}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider pb-2 -mb-[10px] border-b-2 transition-colors ${
                activeTopicId === id
                  ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="font-mono text-sm leading-none">{topic.icon}</span>
              {topic.label}
            </button>
          )
        })}
      </div>

      {activeTopic && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {Object.entries(activeTopic.subtopics).map(([id, sub]) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectSubtopic(id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                activeSubtopicId === id
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-400/50 dark:bg-indigo-900/30 dark:text-indigo-200'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
