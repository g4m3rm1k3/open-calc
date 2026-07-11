import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAllCourses, getChapters } from '../courses/courseLoader.js'
import { useProgress } from '../hooks/useProgress.js'
import { buildProgressKey } from '../context/progressMigration.ts'
import UniverseBackground from '../components/backgrounds/UniverseBackground.jsx'
import TopicFilterHeader from '../components/ui/TopicFilterHeader.jsx'
import TopicTable from '../components/ui/TopicTable.jsx'
import { TOPICS, TOPIC_ORDER, getSubtopicGroup, firstSubtopicId } from '../data/topicGroups.js'

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

// ── Course entries, kept only for the hero's lesson-completion count ────────
const ALL_COURSES = getAllCourses()
const COURSE_ENTRIES = ALL_COURSES
  .map(course => ({ course, chapters: getChapters(course.key) }))
  .filter(({ chapters }) => chapters.length > 0)

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { getLessonStatus } = useProgress()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTopicId, setActiveTopicId] = useState('mathematics')
  const [activeSubtopicId, setActiveSubtopicId] = useState('linear-algebra')
  const exploreRef = useRef(null)

  function selectTopic(topicId) {
    setActiveTopicId(topicId)
    setActiveSubtopicId(firstSubtopicId(topicId))
    exploreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const totalLessons     = COURSE_ENTRIES.reduce((s, { chapters }) => s + chapters.reduce((n, ch) => n + ch.lessons.length, 0), 0)
  const completedLessons = COURSE_ENTRIES.reduce((s, { course, chapters }) =>
    s + chapters.reduce((n, ch) =>
      n + ch.lessons.filter(l => getLessonStatus(buildProgressKey(course.key, l), 1) === 'complete').length, 0), 0)

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />

      <div className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="min-h-[88vh] flex flex-col items-center justify-center text-center px-4 py-20">
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight leading-none mb-5">
            <span
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-500 dark:from-indigo-300 dark:via-cyan-200 dark:to-violet-300 bg-clip-text text-transparent"
              style={{ filter:'drop-shadow(0 0 40px rgba(99,102,241,0.45))' }}
            >
              UpSkillOS
            </span>
          </h1>

          <p className="text-slate-700 dark:text-slate-300 text-xl sm:text-2xl font-light max-w-3xl leading-relaxed mb-3">
            Master the universe of human knowledge.
          </p>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
            Calculus → Quantum Mechanics · Python → AI Systems · Chemistry → Molecular Biology ·
            C++ → Robotics. Built in your browser. Free forever.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['Free Forever','Open Source','Runs in Browser','No Install Required','MIT License'].map(b => (
              <span key={b} className="rounded-full border border-slate-200 bg-white/40 dark:border-white/10 dark:bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 backdrop-blur-md">{b}</span>
            ))}
          </div>

          {completedLessons > 0 && (
            <div className="group relative inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-400/20 dark:bg-emerald-400/10 backdrop-blur-xl px-6 py-3 text-sm mb-10 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:scale-105 cursor-default">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="relative flex items-center gap-3 z-10">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                </div>
                <span className="font-bold text-emerald-800 dark:text-emerald-200 tracking-wide">
                  <span className="text-emerald-600 dark:text-emerald-400 text-base">{completedLessons}</span> / {totalLessons} LESSONS COMPLETED
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 text-slate-600 animate-bounce">
            <span className="text-xs tracking-widest uppercase">Explore</span>
            <span className="text-xl">↓</span>
          </div>
        </section>

        {/* ── FILTER + TOPIC TABLE ─────────────────────────────────────────── */}
        <section ref={exploreRef} className="px-4 pt-4 pb-10 scroll-mt-6">
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
          {(() => {
            const group = getSubtopicGroup(activeTopicId, activeSubtopicId)
            if (!group) {
              return (
                <div className="max-w-lg mx-auto text-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 p-8">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pick a filter above to see everything real for that subject.
                  </p>
                </div>
              )
            }
            return (
              <div className="w-[90vw] max-w-none mx-auto">
                <TopicTable group={group} query={searchQuery} matchItem={matchItem} />
              </div>
            )
          })()}
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
