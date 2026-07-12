import HomeTopicSearch from './HomeTopicSearch.jsx'
import { GLASS_META } from '../../styles/courseColors.js'

export default function TopicFilterHeader({
  query, onQueryChange,
  topics, topicOrder, activeTopicId, activeSubtopicId,
  onSelectTopic, onSelectSubtopic,
  hasInProgress,
}) {
  const activeTopic = topics[activeTopicId]
  const activeMeta = activeTopic ? (GLASS_META[activeTopic.color] ?? GLASS_META.slate) : GLASS_META.slate

  return (
    <div className="w-[90vw] max-w-none mx-auto mb-6">
      <HomeTopicSearch onSearch={onQueryChange} />

      <div className="flex flex-wrap items-end gap-x-8 gap-y-2 border-b-[2px] border-slate-300/50 dark:border-slate-700/50 pb-2">
        {/* Only shown once the learner actually has something to resume —
            an empty "In Progress" pill would just be a dead click. */}
        {hasInProgress && (
          <button
            type="button"
            onClick={() => onSelectTopic('in-progress')}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider pb-2 -mb-[10px] border-b-[3px] transition-all duration-300 ${
              activeTopicId === 'in-progress'
                ? 'border-amber-500 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]'
                : 'border-transparent text-amber-600 dark:text-amber-400 opacity-[0.8] hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className={`font-mono text-[15px] leading-none mb-[1px] ${activeTopicId === 'in-progress' ? 'text-transparent' : ''}`}>◐</span>
            In Progress
          </button>
        )}
        {topicOrder.map((id) => {
          const topic = topics[id]
          if (!topic) return null
          const meta = GLASS_META[topic.color] ?? GLASS_META.slate
          
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTopic(id)}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider pb-2 -mb-[10px] border-b-[3px] transition-all duration-300 ${
                activeTopicId === id
                  ? `${meta.border.replace('/30', '')} bg-gradient-to-r ${meta.header} bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]`
                  : `border-transparent ${meta.text} opacity-[0.55] hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700`
              }`}
            >
              <span className={`font-mono text-[15px] leading-none mb-[1px] ${activeTopicId === id ? 'text-transparent' : ''}`}>{topic.icon}</span>
              {topic.label}
            </button>
          )
        })}
      </div>

      {activeTopic && (
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {Object.entries(activeTopic.subtopics).map(([id, sub]) => {
            const subMeta = sub.color ? (GLASS_META[sub.color] ?? activeMeta) : activeMeta;
            
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectSubtopic(id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all duration-300 backdrop-blur-md ${
                  activeSubtopicId === id
                    ? `${subMeta.border.replace('/30', '/50')} ${subMeta.text} scale-105`
                    : `${subMeta.border.replace('/30', '/20')} bg-slate-100/50 dark:bg-white/5 ${subMeta.text} opacity-60 hover:opacity-100 hover:scale-105`
                }`}
                style={activeSubtopicId === id ? { backgroundColor: 'rgba(255,255,255,0.02)', boxShadow: subMeta.glow.replace('0.50', '0.25') } : {}}
              >
                {sub.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
