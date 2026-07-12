import { useState } from 'react'
import { Link } from 'react-router-dom'
import UniverseBackground from '../components/backgrounds/UniverseBackground.jsx'
import TopicFilterHeader from '../components/ui/TopicFilterHeader.jsx'
import TopicTable from '../components/ui/TopicTable.jsx'
import { TOPICS, TOPIC_ORDER, getSubtopicGroup, firstSubtopicId, ALL_ITEMS } from '../data/topicGroups.js'

export function matchItem(item, query) {
  if (!query) return true;
  const q = query.toLowerCase().trim();

  const searchableText = [
    item.label,
    item.desc,
    item.description,
    item.subject,
    item.domain,
    item.key,
    ...(item.tags || [])
  ].filter(Boolean).join(' ').toLowerCase();

  if (searchableText.includes(q)) return true;

  // Extract keywords by removing conversational filler
  const stopWords = [
    'a', 'an', 'the', 'in', 'on', 'with', 'to', 'and', 'or', 'for', 'of', 'at', 'by', 'from',
    'learn', 'master', 'build', 'explore', 'simulate', 'design', 'visualise', 'visualize', 'create', 'make', 'do',
    'lesson', 'lessons', 'lab', 'labs', 'game', 'games', 'app', 'apps', 'course', 'courses',
    'topic', 'topics', 'how', 'what', 'why', 'who', 'where', 'when', 'is', 'are', 'am', 'be', 'been',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their',
    'want', 'need', 'like', 'would', 'could', 'should', 'can', 'will', 'show', 'me', 'find', 'search',
    'about', 'some', 'any', 'all', 'this', 'that', 'these', 'those', 'there', 'here', 'so', 'if', 'then',
    'teach', 'help', 'understand', 'work', 'scratch', 'from'
  ];

  // Also keep terms that might be short but very specific
  const terms = q.split(/[\s,]+/)
    .filter(t => !stopWords.includes(t))
    .filter(t => t.length > 2 || ['3d', 'js', 'ai', 'ui', 'ux', 'c', 'ml', 'vr', 'ar', 'g0', 'fk', 'ik', 'qr'].includes(t));

  if (terms.length > 0) {
    return terms.some(term => searchableText.includes(term));
  }

  return false;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTopicId, setActiveTopicId] = useState('mathematics')
  const [activeSubtopicId, setActiveSubtopicId] = useState('linear-algebra')

  function selectTopic(topicId) {
    setActiveTopicId(topicId)
    setActiveSubtopicId(firstSubtopicId(topicId))
  }

  // A query bypasses the topic/subtopic filter entirely and searches every
  // course/lab/game — a search box that only searches the currently
  // selected bucket defeats the point of a search box.
  const isSearching = searchQuery.trim().length > 0
  const group = isSearching
    ? { label: `Search results for "${searchQuery}"`, items: ALL_ITEMS }
    : getSubtopicGroup(activeTopicId, activeSubtopicId)

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />

      <div className="relative z-10">

        {/* ── SEARCH + FILTER ──────────────────────────────────────────────── */}
        <section className="px-4 pt-6 pb-2">
          <TopicFilterHeader
            query={searchQuery}
            onQueryChange={setSearchQuery}
            topics={TOPICS}
            topicOrder={TOPIC_ORDER}
            activeTopicId={activeTopicId}
            activeSubtopicId={activeSubtopicId}
            onSelectTopic={selectTopic}
            onSelectSubtopic={setActiveSubtopicId}
          />
        </section>

        {/* ── RESULTS ──────────────────────────────────────────────────────── */}
        <section className="px-4 pb-10">
          {group ? (
            <div className="w-[90vw] max-w-none mx-auto">
              <TopicTable group={group} query={isSearching ? searchQuery : ''} matchItem={matchItem} />
            </div>
          ) : (
            <div className="max-w-lg mx-auto text-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 p-8">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pick a filter above to see everything real for that subject.
              </p>
            </div>
          )}
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-slate-200 dark:border-white/5 px-4 py-8 text-center text-xs text-slate-600 mt-4">
          <p>
            UpSkillOS is free, open source, and runs entirely in your browser.{' '}
            <Link to="/about" className="text-indigo-400 hover:text-indigo-300 hover:underline">Learn more</Link>
            {' · '}
            <Link to="/reference" className="text-indigo-400 hover:text-indigo-300 hover:underline">Formula Atlas</Link>
            {' · '}
            <Link to="/search" className="text-indigo-400 hover:text-indigo-300 hover:underline">Search</Link>
          </p>
        </footer>

      </div>
    </div>
  )
}
