import { useState, useEffect, useRef } from 'react'
import BlogPost from '../../../components/blog/BlogPost.jsx'
import { MARKDOWN_LESSONS, MARKDOWN_LESSON_SERIES, resolveLessonLink } from './lessons/markdownLessonLoader.js'

// Simple read-through reference panel — a learner reads the lesson here, then
// does the actual typing in the real HTML/CSS/JS tabs (which already have the
// live canvas preview). No separate live-preview/run behavior needed here,
// just the same plain markdown rendering the blog uses, organized the same
// way the blog organizes posts: standalone files, or a folder per series.

function RootList({ series, standalone, onSelectSeries, onSelectStandalone }) {
  return (
    <div className="px-6 py-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Lessons</h2>

      {series.length > 0 && (
        <div className="space-y-2 mb-4">
          {series.map((s) => (
            <button
              key={s.folder}
              onClick={() => onSelectSeries(s.folder)}
              className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors border border-slate-800/60"
            >
              <span className="flex-1">
                <span className="block font-semibold text-slate-200">{s.title}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{s.lessons.length} lessons</span>
              </span>
              <span className="text-slate-600">→</span>
            </button>
          ))}
        </div>
      )}

      {standalone.length > 0 && (
        <div className="space-y-1">
          {standalone.map((lesson, i) => (
            <button
              key={lesson.slug}
              onClick={() => onSelectStandalone(lesson.slug)}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
            >
              <span className="text-xs text-slate-500 w-5 shrink-0 text-right">{i + 1}.</span>
              <span className="flex-1 truncate">{lesson.title}</span>
              <span className="text-slate-600">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SeriesList({ series, onSelectLesson, onSelectOverview, onBack }) {
  return (
    <div className="px-6 py-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-4"
      >
        ← All lessons
      </button>
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">{series.title}</h2>
      <div className="space-y-1">
        {series.overview && (
          <button
            onClick={onSelectOverview}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
          >
            <span className="text-xs text-slate-500 w-5 shrink-0 text-right">·</span>
            <span className="flex-1 truncate">Overview</span>
            <span className="text-slate-600">→</span>
          </button>
        )}
        {series.lessons.map((lesson, i) => (
          <button
            key={lesson.slug}
            onClick={() => onSelectLesson(lesson.slug)}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
          >
            <span className="text-xs text-slate-500 w-5 shrink-0 text-right">{i + 1}.</span>
            <span className="flex-1 truncate">{lesson.title}</span>
            <span className="text-slate-600">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function LessonView({ lesson, onBack, onNext, onLinkClick }) {
  return (
    <div className="px-6 py-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-4"
      >
        ← Back
      </button>

      <BlogPost content={lesson.content} interactive={false} onLinkClick={onLinkClick} />

      <div className="mt-10 pt-6 border-t border-slate-700/50 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
        >
          ← Back
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}

export default function LessonsPanel() {
  // route: { view: 'root' } | { view: 'series', folder } | { view: 'lesson', slug, seriesFolder | null }
  const [route, setRoute] = useState({ view: 'root' })

  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [route])

  if (MARKDOWN_LESSONS.length === 0 && MARKDOWN_LESSON_SERIES.length === 0) {
    return (
      <div className="p-6 text-sm text-slate-400">
        No lessons yet — drop a .md file into
        <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-800 text-rose-400 font-mono text-xs">
          src/labs/html-lab/HtmlLab/lessons/markdown/
        </code>
        (or a subfolder, for a series) and it'll show up here.
      </div>
    )
  }

  if (route.view === 'series') {
    const series = MARKDOWN_LESSON_SERIES.find((s) => s.folder === route.folder)
    if (!series) {
      setRoute({ view: 'root' })
      return null
    }
    return (
      <div ref={scrollRef} className="h-full overflow-y-auto">
        <SeriesList
          series={series}
          onBack={() => setRoute({ view: 'root' })}
          onSelectOverview={() => setRoute({ view: 'lesson', slug: series.overview.slug, seriesFolder: series.folder, isOverview: true })}
          onSelectLesson={(slug) => setRoute({ view: 'lesson', slug, seriesFolder: series.folder })}
        />
      </div>
    )
  }

  if (route.view === 'lesson') {
    const series = route.seriesFolder ? MARKDOWN_LESSON_SERIES.find((s) => s.folder === route.seriesFolder) : null
    const pool = series ? series.lessons : MARKDOWN_LESSONS
    const lesson = route.isOverview ? series?.overview : pool.find((l) => l.slug === route.slug)

    if (!lesson) {
      setRoute({ view: 'root' })
      return null
    }

    const index = route.isOverview ? -1 : pool.findIndex((l) => l.slug === route.slug)
    const nextLesson = index >= 0 && index < pool.length - 1 ? pool[index + 1] : null

    const backTarget = series ? { view: 'series', folder: series.folder } : { view: 'root' }

    return (
      <div ref={scrollRef} className="h-full overflow-y-auto">
        <LessonView
          lesson={lesson}
          onBack={() => setRoute(backTarget)}
          onNext={nextLesson ? () => setRoute({ view: 'lesson', slug: nextLesson.slug, seriesFolder: series?.folder ?? null }) : null}
          onLinkClick={(href) => {
            const target = resolveLessonLink(lesson.slug, href)
            if (target) {
              setRoute({ view: 'lesson', slug: target.slug, seriesFolder: target.seriesFolder, isOverview: target.isOverview })
            }
            // A ".md"-style relative link is always an internal cross-reference
            // in this lesson system, resolvable or not — either way there's no
            // real page for the browser to navigate to, so always suppress the
            // default anchor behavior even when resolution fails (e.g. a link
            // to a real source file like LESSON_CONTRACT.md, which isn't a
            // lesson and has nowhere in this app to be shown).
            return href?.endsWith('.md') ?? false
          }}
        />
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <RootList
        series={MARKDOWN_LESSON_SERIES}
        standalone={MARKDOWN_LESSONS}
        onSelectSeries={(folder) => setRoute({ view: 'series', folder })}
        onSelectStandalone={(slug) => setRoute({ view: 'lesson', slug, seriesFolder: null })}
      />
    </div>
  )
}
