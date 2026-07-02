import { useRef, useCallback, createContext, useContext } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import { preprocess } from '../math/latexPreprocess.js'
import CodeBlock from './CodeBlock.jsx'

const JS_FAMILY = new Set(['js', 'javascript', 'ts', 'typescript'])

// react-markdown v9+ removed the `inline` prop from the code component.
// Use context set by the `pre` handler to tell block code apart from inline.
const InPreContext = createContext(false)

// Extract top-level class and function names declared in a code block so we can
// detect conflicts before merging prior cells into a notebook's running context.
function getTopLevelDecls(code) {
  const names = new Set()
  const patterns = [
    /^(?:export\s+)?(?:abstract\s+|async\s+)?(?:class|function)\s+(\w+)/gm,
    /^(?:export\s+)?(?:const|let|var)\s+(\w+)/gm,
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(code)) !== null) names.add(m[1])
  }
  return names
}

function Heading({ level, children }) {
  const tag = `h${level}`
  const text = typeof children === 'string' ? children : ''
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const sizeMap = {
    1: 'text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6 leading-tight',
    2: 'text-2xl font-bold text-slate-800 dark:text-slate-100 mt-10 mb-4 leading-snug border-b border-slate-200 dark:border-slate-700 pb-3',
    3: 'text-xl font-semibold text-slate-700 dark:text-slate-200 mt-8 mb-3',
    4: 'text-lg font-semibold text-slate-600 dark:text-slate-300 mt-6 mb-2',
  }
  const Tag = tag
  return <Tag id={id} className={sizeMap[level] || 'text-base font-semibold mt-4 mb-2'}>{children}</Tag>
}

export default function BlogPost({ content }) {
  // Per-post notebook state: tracks latest code for each code block by index
  const cellCodesRef = useRef(new Map())
  // Resets to 0 each render pass so cells always get the same index
  const cellCounterRef = useRef(0)
  cellCounterRef.current = 0

  const handleCodeChange = useCallback((index, lang, code) => {
    cellCodesRef.current.set(index, { lang, code })
  }, [])

  // Returns accumulated prior JS/TS cell code to run silently before cell `upToIndex`.
  // Iterates prior cells NEWEST-FIRST so the most recent definition of any class or
  // function wins. Older cells that would re-declare the same name are dropped.
  const getPriorContext = useCallback((upToIndex, lang, currentCode = '') => {
    if (!JS_FAMILY.has(lang.toLowerCase())) return ''
    // Start with the current cell's own declarations as "already claimed"
    const claimed = getTopLevelDecls(currentCode)
    const parts = []
    for (let i = upToIndex - 1; i >= 0; i--) {
      const cell = cellCodesRef.current.get(i)
      if (!cell || !JS_FAMILY.has(cell.lang.toLowerCase())) continue
      const decls = getTopLevelDecls(cell.code)
      // Skip this cell if any of its declared names are already claimed
      if ([...decls].some((n) => claimed.has(n))) continue
      decls.forEach((n) => claimed.add(n))
      parts.unshift(cell.code)
    }
    // Rewrite const/let → var so re-declarations across cells don't throw
    return parts.join('\n\n').replace(/\b(const|let)\b(?=\s)/g, 'var')
  }, [])

  return (
    <article className="prose-blog max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, [rehypeKatex, { throwOnError: false, errorColor: '#ef4444' }]]}
        components={{
          h1: ({ children }) => <Heading level={1}>{children}</Heading>,
          h2: ({ children }) => <Heading level={2}>{children}</Heading>,
          h3: ({ children }) => <Heading level={3}>{children}</Heading>,
          h4: ({ children }) => <Heading level={4}>{children}</Heading>,

          p({ children }) {
            return (
              <p className="text-slate-700 dark:text-slate-300 leading-[1.8] mb-5 text-base">
                {children}
              </p>
            )
          },

          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
              >
                {children}
              </a>
            )
          },

          strong({ children }) {
            return <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
          },

          em({ children }) {
            return <em className="italic text-slate-700 dark:text-slate-300">{children}</em>
          },

          code({ className, children }) {
            const isBlock = useContext(InPreContext)
            const lang = (className || '').replace('language-', '')
            const codeStr = String(children).replace(/\n$/, '')

            if (!isBlock) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-[0.85em] font-mono">
                  {codeStr}
                </code>
              )
            }

            const cellIndex = cellCounterRef.current++

            if (!cellCodesRef.current.has(cellIndex)) {
              cellCodesRef.current.set(cellIndex, { lang, code: codeStr })
            }

            return (
              <CodeBlock
                language={lang}
                code={codeStr}
                cellIndex={cellIndex}
                getPriorContext={getPriorContext}
                onCodeChange={handleCodeChange}
              />
            )
          },

          pre({ children }) {
            return <InPreContext.Provider value={true}>{children}</InPreContext.Provider>
          },

          ul({ children }) {
            return (
              <ul className="list-none pl-0 mb-5 space-y-1.5">
                {children}
              </ul>
            )
          },

          ol({ children }) {
            return (
              <ol className="list-decimal list-inside mb-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                {children}
              </ol>
            )
          },

          li({ children, checked }) {
            if (checked !== null && checked !== undefined) {
              return (
                <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300 py-0.5">
                  <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                    checked
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {checked ? '✓' : ''}
                  </span>
                  <span className={checked ? 'text-slate-400 dark:text-slate-500 line-through' : ''}>{children}</span>
                </li>
              )
            }
            return (
              <li className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                <span>{children}</span>
              </li>
            )
          },

          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-500 pl-4 pr-2 py-1 my-5 bg-indigo-50 dark:bg-indigo-950/30 rounded-r-lg text-slate-600 dark:text-slate-400 italic">
                {children}
              </blockquote>
            )
          },

          hr() {
            return <hr className="my-10 border-slate-200 dark:border-slate-700" />
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto my-5">
                <table className="w-full text-sm border-collapse border border-slate-200 dark:border-slate-700">
                  {children}
                </table>
              </div>
            )
          },

          thead({ children }) {
            return <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>
          },

          th({ children }) {
            return (
              <th className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">
                {children}
              </th>
            )
          },

          td({ children }) {
            return (
              <td className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                {children}
              </td>
            )
          },
        }}
      >
        {preprocess(content)}
      </ReactMarkdown>
    </article>
  )
}
