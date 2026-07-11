import HomeTopicSearch from './HomeTopicSearch.jsx'

export default function TopicFilterHeader({ query, onQueryChange, groups, activeTopicId, onSelectTopic }) {
  return (
    <div className="w-[90vw] max-w-none mx-auto mb-6">
      <HomeTopicSearch onSearch={onQueryChange} />
      <div className="flex flex-wrap items-end gap-x-8 gap-y-2 border-b-2 border-slate-300 dark:border-slate-700 pb-2">
        {Object.entries(groups).map(([id, g]) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectTopic(id)}
            className={`text-xs font-bold uppercase tracking-wider pb-2 -mb-[10px] border-b-2 transition-colors ${
              activeTopicId === id
                ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  )
}
