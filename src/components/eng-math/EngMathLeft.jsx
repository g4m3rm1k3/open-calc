import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import { preprocess } from '../math/latexPreprocess.js'
import QuizBlock from './quiz/QuizBlock.jsx'
import CodeBlock from '../blog/CodeBlock.jsx'

function Heading({ level, children }) {
  const sizes = {
    1: 'text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-5 leading-tight',
    2: 'text-2xl font-bold text-slate-800 dark:text-slate-100 mt-10 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3',
    3: 'text-xl font-semibold text-slate-700 dark:text-slate-200 mt-8 mb-3',
    4: 'text-lg font-semibold text-slate-600 dark:text-slate-300 mt-6 mb-2',
  }
  const Tag = `h${level}`
  return <Tag className={sizes[level] || 'text-base font-semibold mt-4 mb-2'}>{children}</Tag>
}

export default function EngMathLeft({ content, slug, onSceneChange, onQuizResult }) {
  const scrollRef = useRef(null)

  // Scroll-based scene detection: scan waypoints on every scroll event.
  // The "active" scene is the last waypoint whose top edge is above 35% of the
  // container's visible height — i.e. the last scene the user has scrolled into.
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    // Wait for ReactMarkdown to flush to DOM
    const tid = setTimeout(() => {
      function handleScroll() {
        const waypoints = Array.from(container.querySelectorAll('[data-scene]'))
        if (!waypoints.length) return

        const containerRect = container.getBoundingClientRect()
        const cutoffY = containerRect.top + containerRect.height * 0.35

        let current = null
        for (const wp of waypoints) {
          const rect = wp.getBoundingClientRect()
          if (rect.top <= cutoffY) {
            current = wp
          }
        }

        if (current) onSceneChange?.(current.dataset.scene)
      }

      handleScroll() // set initial scene immediately
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }, 150)

    return () => clearTimeout(tid)
  }, [content, onSceneChange])

  // quizIdx increments per quiz block during render (same pattern as BlogPost cellCounterRef)
  let quizIdx = 0

  const components = {
    h1: ({ children }) => <Heading level={1}>{children}</Heading>,
    h2: ({ children }) => <Heading level={2}>{children}</Heading>,
    h3: ({ children }) => <Heading level={3}>{children}</Heading>,
    h4: ({ children }) => <Heading level={4}>{children}</Heading>,

    p: ({ children }) => (
      <p className="text-slate-700 dark:text-slate-300 leading-[1.85] mb-5 text-[15px]">{children}</p>
    ),

    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-500 transition-colors">
        {children}
      </a>
    ),

    strong: ({ children }) => (
      <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
    ),

    em: ({ children }) => (
      <em className="italic text-slate-600 dark:text-slate-400">{children}</em>
    ),

    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-600 pl-4 my-5 text-slate-600 dark:text-slate-400 italic">
        {children}
      </blockquote>
    ),

    hr: () => <hr className="my-8 border-slate-200 dark:border-slate-700" />,

    ul: ({ children }) => (
      <ul className="list-disc list-outside pl-6 space-y-1.5 mb-5 text-[15px] text-slate-700 dark:text-slate-300">{children}</ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 space-y-1.5 mb-5 text-[15px] text-slate-700 dark:text-slate-300">{children}</ol>
    ),

    li: ({ children }) => <li className="leading-relaxed">{children}</li>,

    table: ({ children }) => (
      <div className="overflow-x-auto my-5">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-100 dark:bg-slate-800">{children}</thead>,
    th: ({ children }) => (
      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{children}</td>
    ),

    // ── pre handler — intercepts scene/quiz fences before wrapping in <pre> ──
    pre({ node }) {
      // Use find() so whitespace text nodes before <code> don't break extraction
      const codeNode = node?.children?.find?.(
        (n) => n?.type === 'element' && n?.tagName === 'code'
      )
      const rawClass = codeNode?.properties?.className?.[0] ?? ''
      const lang = rawClass.startsWith('language-') ? rawClass.slice(9) : rawClass

      // Join all text children to reconstruct full content safely
      const rawValue = (
        codeNode?.children
          ?.filter?.((n) => n?.type === 'text')
          ?.map?.((n) => n?.value ?? '')
          ?.join('') ?? ''
      ).trim()

      // Scene waypoint — invisible 1px div; scroll handler watches these
      if (lang === 'scene') {
        return (
          <div
            data-scene={rawValue}
            style={{
              height: 1,
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
        )
      }

      // Interactive quiz checkpoint
      if (lang === 'quiz') {
        let data
        try {
          data = JSON.parse(rawValue)
        } catch {
          return (
            <div className="my-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-mono">
              Quiz parse error — check JSON syntax
            </div>
          )
        }
        const idx = quizIdx++
        const quizId = `${slug ?? 'lesson'}-q${idx}`
        return (
          <QuizBlock
            key={quizId}
            quizId={quizId}
            {...data}
            onResult={(correct) => onQuizResult?.(quizId, correct)}
          />
        )
      }

      // Python / runnable code — use the full CodeBlock with Run button
      if (lang === 'python' || lang === 'py' || lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
        return (
          <div className="my-5">
            <CodeBlock language={lang} code={rawValue} />
          </div>
        )
      }

      // All other code — styled pre block
      return (
        <div className="my-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden">
          {lang && (
            <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-500 dark:text-slate-400">
              {lang}
            </div>
          )}
          <pre className="px-4 py-4 overflow-x-auto text-sm text-slate-800 dark:text-slate-300 font-mono leading-relaxed">
            <code>{rawValue}</code>
          </pre>
        </div>
      )
    },

    // Inline code only — block code is handled entirely by pre above
    code({ node, inline, children, className }) {
      if (!inline) return null
      return (
        <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[13px] text-indigo-600 dark:text-indigo-400">
          {children}
        </code>
      )
    },
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-10 pb-32">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={components}
        >
          {preprocess(content)}
        </ReactMarkdown>
      </div>
    </div>
  )
}
