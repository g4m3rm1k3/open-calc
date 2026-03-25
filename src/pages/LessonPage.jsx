import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { LESSON_MAP, ALL_LESSONS } from '../content/index.js'
import { useProgress } from '../hooks/useProgress.js'
import MicroCycleLesson from '../components/lesson/MicroCycleLesson.jsx'
import CrossRef from '../components/lesson/CrossRef.jsx'
import VizFrame from '../components/viz/VizFrame.jsx'
import { parseProse } from '../components/math/parseProse.jsx'
import { enhanceLessonForUnifiedLearning } from '../content/enhancers/unifiedLessonEnhancer.js'
import OpenInGrapher from '../components/lesson/OpenInGrapher.jsx'
import { useVideoPlayer } from '../context/VideoPlayerContext.jsx'

export default function LessonPage() {
  const { chapterId, lessonSlug, '*': rest } = useParams()
  const slug = lessonSlug + (rest ? `/${rest}` : '')
  const key = `${chapterId}/${slug}`
  const rawLesson = LESSON_MAP[key]
  const lesson = rawLesson ? enhanceLessonForUnifiedLearning(rawLesson) : null
  const { markCheckpoint, setActiveTab, getActiveTab, getLessonStatus } = useProgress()
  const { setLessonId } = useVideoPlayer()
  const activeTab = getActiveTab(lesson?.id ?? '')

  // Scroll to top only when navigating to a different lesson
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (lesson?.id) {
       setLessonId(lesson.id)
    }
  }, [lesson?.id, setLessonId])

  // Update browser tab title so multiple tabs are identifiable
  useEffect(() => {
    if (lesson) {
      document.title = `${lesson.title} — OpenCalc`
    }
    return () => { document.title = 'OpenCalc' }
  }, [lesson?.id])

  // Mark progress checkpoint when tab is read (no scroll)
  useEffect(() => {
    if (lesson) {
      markCheckpoint(lesson.id, `read-${activeTab}`)
    }
  }, [lesson?.id, activeTab])

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Lesson not found</h2>
        <p className="text-slate-500 mb-6">The lesson at chapter/{chapterId}/{slug} doesn't exist yet.</p>
        <Link to="/" className="text-brand-600 dark:text-brand-400 hover:underline">Back to curriculum</Link>
      </div>
    )
  }

  // Prev/next navigation
  const lessonIndex = ALL_LESSONS.findIndex((l) => l.id === lesson.id)
  const prevLesson = lessonIndex > 0 ? ALL_LESSONS[lessonIndex - 1] : null
  const nextLesson = lessonIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[lessonIndex + 1] : null

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400">Home</Link>
        <span>›</span>
        <Link to={`/chapter/${lesson.chapter}`} className="hover:text-brand-600 dark:hover:text-brand-400">
          Chapter {lesson.chapter}
        </Link>
        <span>›</span>
        <span className="text-slate-700 dark:text-slate-300">{lesson.title}</span>
      </nav>

      {/* Lesson header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded">
            Chapter {lesson.chapter} · {lesson.order !== undefined ? `Lesson ${lesson.order + 1}` : ''}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{lesson.title}</h1>
        {lesson.subtitle && (
          <p className="text-lg text-slate-500 dark:text-slate-400 italic">{lesson.subtitle}</p>
        )}
        {lesson.grapher && (
          <div className="mt-4">
            <OpenInGrapher config={lesson.grapher} />
          </div>
        )}
      </header>

      {/* Hook Banner */}
      {lesson.hook && (
        <section className="mb-10 bg-gradient-to-br from-brand-50 to-slate-50 dark:from-brand-950/30 dark:to-slate-900/30 rounded-2xl p-6 border border-brand-100 dark:border-brand-900/30">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 dark:text-brand-400 mb-2">Why This Matters</p>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 leading-relaxed">{parseProse(lesson.hook.question)}</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{parseProse(lesson.hook.realWorldContext)}</p>
          {lesson.hook.previewVisualizationId && (
            <VizFrame id={lesson.hook.previewVisualizationId} initialProps={lesson.hook.previewVisualizationProps ?? {}} />
          )}
          {lesson.hook.visualizations?.map((viz, i) => (
            <div key={i} className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
               <VizFrame id={viz.id} initialProps={viz.props ?? {}} title={viz.title} />
            </div>
          ))}
        </section>
      )}

      {/* Tags */}
      {lesson.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {lesson.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Micro-Cycle Lesson Flow */}
      <section className="mb-10 w-full">
        <MicroCycleLesson lesson={lesson} />
      </section>

      {/* Cross references */}
      {lesson.crossRefs?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Related Lessons</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {lesson.crossRefs.map((ref) => (
              <CrossRef key={ref.lessonSlug} {...ref} />
            ))}
          </div>
        </section>
      )}

      {/* Prev / Next navigation */}
      <nav className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-700">
        {prevLesson ? (
          <Link
            to={`/chapter/${prevLesson.chapterNumber}/${prevLesson.slug}`}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500">Previous</div>
              <div className="font-medium">{prevLesson.title}</div>
            </div>
          </Link>
        ) : <div />}

        {nextLesson ? (
          <Link
            to={`/chapter/${nextLesson.chapterNumber}/${nextLesson.slug}`}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group text-right"
          >
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500">Next</div>
              <div className="font-medium">{nextLesson.title}</div>
            </div>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        ) : <div />}
      </nav>
    </article>
  )
}
