import { useState, useEffect, useRef, createContext, useContext } from 'react'
import ReactMarkdown from 'react-markdown'
import { PROSE_REMARK_PLUGINS, PROSE_REHYPE_PLUGINS, proseComponents, InlineCode } from '../../../components/markdown/proseComponents.jsx'
import { groupLiveCodeBlocks } from '../../../components/markdown/groupLiveCodeBlocks.js'
import LiveCodeCell from '../../../components/markdown/LiveCodeCell.jsx'
import CodeBlock from '../../../components/blog/CodeBlock.jsx'
import { MARKDOWN_LESSONS } from './lessons/markdownLessonLoader.js'

// Same inline-vs-block trick BlogPost.jsx uses — react-markdown's `code`
// component gets no way to tell the two apart on its own.
const InPreContext = createContext(false)

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

      <article className="prose-blog max-w-none">
        <ReactMarkdown
          remarkPlugins={PROSE_REMARK_PLUGINS}
          rehypePlugins={PROSE_REHYPE_PLUGINS}
          components={{
            ...proseComponents,

            code({ className, children }) {
              const isBlock = useContext(InPreContext)
              const lang = (className || '').replace('language-', '')
              const codeStr = String(children).replace(/\n$/, '')

              if (!isBlock) return <InlineCode>{codeStr}</InlineCode>

              if (lang === 'oc-live-group') {
                const group = JSON.parse(codeStr)
                return <LiveCodeCell html={group.html} css={group.css} js={group.js} />
              }

              return <CodeBlock language={lang} code={codeStr} cellIndex={0} />
            },

            pre({ children }) {
              return <InPreContext.Provider value={true}>{children}</InPreContext.Provider>
            },
          }}
        >
          {groupLiveCodeBlocks(lesson.content)}
        </ReactMarkdown>
      </article>

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
