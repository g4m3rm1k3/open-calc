import { useRef, useCallback, useMemo, createContext, useContext } from 'react'
import { useGlobalTheme, getFontFamily, getFontSize, getLineHeight } from '../../context/ThemeContext.jsx'
import ReactMarkdown from 'react-markdown'
import { PROSE_REMARK_PLUGINS, PROSE_REHYPE_PLUGINS, proseComponents, InlineCode } from '../markdown/proseComponents.jsx'
import { preprocess } from '../math/latexPreprocess.js'
import CodeBlock from './CodeBlock.jsx'
import StaticCodeBlock from '../markdown/StaticCodeBlock.jsx'

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

export default function BlogPost({ content, interactive = true, onLinkClick }) {
  const { typography } = useGlobalTheme()

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

  // Both must keep a stable identity across renders. react-markdown uses
  // `components.code`/`components.pre` as literal component types at each
  // matching position in the tree — a *new* function reference every render
  // (which is what a plain object literal in JSX produces) makes React treat
  // it as a different component type and fully unmount + remount every code
  // block, every time BlogPost re-renders for any reason, including ones
  // that have nothing to do with this post's content. That is not just
  // wasted work: it can tear a button's DOM node down between a click's
  // mousedown and mouseup, so the click never registers as a click at all.
  const renderCode = useCallback(function CodeRenderer({ className, children }) {
    const isBlock = useContext(InPreContext)
    const lang = (className || '').replace('language-', '')
    const codeStr = String(children).replace(/\n$/, '')

    if (!isBlock) {
      return <InlineCode>{codeStr}</InlineCode>
    }

    if (!interactive) {
      return <StaticCodeBlock language={lang} code={codeStr} />
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
  }, [interactive, getPriorContext, handleCodeChange])

  const renderPre = useCallback(function PreRenderer({ children }) {
    return <InPreContext.Provider value={true}>{children}</InPreContext.Provider>
  }, [])

  // Only overrides the default `a` (a live, target=_blank external link) when
  // a caller actually supplies onLinkClick — e.g. LessonsPanel, which needs
  // to intercept a lesson's internal cross-references and resolve them
  // in-app instead of letting the browser navigate. Real blog posts (no
  // onLinkClick passed) keep proseComponents' ordinary external-link anchor.
  const renderLink = useCallback(function LinkRenderer({ href, children }) {
    return (
      <a
        href={href}
        target={/^https?:\/\//i.test(href || '') ? '_blank' : undefined}
        rel="noopener noreferrer"
        onClick={(event) => {
          if (onLinkClick?.(href)) event.preventDefault()
        }}
        className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
      >
        {children}
      </a>
    )
  }, [onLinkClick])

  const components = useMemo(() => ({
    ...proseComponents,
    code: renderCode,
    pre: renderPre,
    ...(onLinkClick ? { a: renderLink } : {}),
  }), [renderCode, renderPre, renderLink, onLinkClick])

  return (
    <article 
      className="prose-blog max-w-none"
      style={{
        fontFamily: typography?.font ? getFontFamily(typography.font) : undefined,
        fontSize: typography?.fontSize ? getFontSize(typography.fontSize) : undefined,
        lineHeight: typography?.lineHeight ? getLineHeight(typography.lineHeight) : undefined,
        textAlign: typography?.textAlign === 'justify' ? 'justify' : 'left'
      }}
    >
      <ReactMarkdown
        remarkPlugins={PROSE_REMARK_PLUGINS}
        rehypePlugins={PROSE_REHYPE_PLUGINS}
        components={components}
      >
        {preprocess(content)}
      </ReactMarkdown>
    </article>
  )
}
