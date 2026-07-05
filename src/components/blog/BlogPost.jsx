import { useRef, useCallback, createContext, useContext } from 'react'
import ReactMarkdown from 'react-markdown'
import { PROSE_REMARK_PLUGINS, PROSE_REHYPE_PLUGINS, proseComponents, InlineCode } from '../markdown/proseComponents.jsx'
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
        remarkPlugins={PROSE_REMARK_PLUGINS}
        rehypePlugins={PROSE_REHYPE_PLUGINS}
        components={{
          ...proseComponents,

          code({ className, children }) {
            const isBlock = useContext(InPreContext)
            const lang = (className || '').replace('language-', '')
            const codeStr = String(children).replace(/\n$/, '')

            if (!isBlock) {
              return <InlineCode>{codeStr}</InlineCode>
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
        }}
      >
        {preprocess(content)}
      </ReactMarkdown>
    </article>
  )
}
