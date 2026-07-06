import { useState, useEffect, useRef } from 'react'
import BlogPost from '../../../components/blog/BlogPost.jsx'
import { MARKDOWN_LESSONS } from './lessons/markdownLessonLoader.js'

// Simple read-through reference panel — a learner reads the lesson here, then
// does the actual typing in the real HTML/CSS/JS tabs (which already have the
// live canvas preview). No separate live-preview/run behavior needed here,
// just the same plain markdown rendering the blog uses.

function LessonList({ onSelect }) {
  return (
    <div className="px-6 py-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Lessons</h2>
      <div className="space-y-1">
        {MARKDOWN_LESSONS.map((lesson, i) => (
          <button
            key={lesson.slug}
            onClick={() => onSelect(lesson.slug)}
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

function LessonView({ lesson, onBack, onNext }) {
  return (
    <div className="px-6 py-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-4"
      >
        ← All lessons
      </button>

      <BlogPost content={lesson.content} />

      <div className="mt-10 pt-6 border-t border-slate-700/50 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
        >
          ← All lessons
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
  const [activeSlug, setActiveSlug] = useState(null)
  const activeIndex = MARKDOWN_LESSONS.findIndex((l) => l.slug === activeSlug)
  const active = activeIndex >= 0 ? MARKDOWN_LESSONS[activeIndex] : null
  const nextLesson = activeIndex >= 0 && activeIndex < MARKDOWN_LESSONS.length - 1
    ? MARKDOWN_LESSONS[activeIndex + 1]
    : null

  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [activeSlug])

  if (MARKDOWN_LESSONS.length === 0) {
    return (
      <div className="p-6 text-sm text-slate-400">
        No lessons yet — drop a .md file into
        <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-800 text-rose-400 font-mono text-xs">
          src/labs/html-lab/HtmlLab/lessons/markdown/
        </code>
        and it'll show up here.
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      {active ? (
        <LessonView
          lesson={active}
          onBack={() => setActiveSlug(null)}
          onNext={nextLesson ? () => setActiveSlug(nextLesson.slug) : null}
        />
      ) : (
        <LessonList onSelect={setActiveSlug} />
      )}
    </div>
  )
}
