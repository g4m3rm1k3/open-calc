/**
 * MarkdownProse — renders lesson prose strings with full Markdown + LaTeX support.
 *
 * Uses the same pipeline as StickyNote:
 *   ReactMarkdown  →  remark-gfm (GFM: tables, strikethrough, etc.)
 *                  →  remark-math ($…$ inline, $$…$$ block)
 *                  →  rehype-katex (KaTeX rendering)
 *
 * Preprocessing converts the lesson-content notation to remark-math notation:
 *   \[…\]  →  $$…$$   (display / block math)
 *   \(…\)  →  $…$     (inline math)
 *   {{algebra:id|text}}  →  **text**  (bold label; preserves readability)
 */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// ─── Preprocessor ────────────────────────────────────────────────────────────

function preprocess(text) {
  if (!text) return ''
  return text
    // \[…\] → $$\n…\n$$ (block / display math)
    .replace(/\\\[/g, '$$\n')
    .replace(/\\\]/g, '\n$$')
    // \(…\) → $…$ (inline math)
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')
    // {{algebra:topicId|linkText}} → **linkText**  (preserves visible text)
    .replace(/\{\{algebra:[^|]+\|([^}]+)\}\}/g, '**$1**')
    // Sentence break after inline math: "$math$. Next sentence" → hard line break.
    // Two trailing spaces before \n = Markdown hard break (CommonMark spec).
    // Pattern: closing $ + period + space(s) + non-space → insert hard break.
    // [^$\n]+ excludes newlines so display math ($$\n…\n$$) is never matched.
    .replace(/(\$[^$\n]+\$)\.\s+(?=\S)/g, '$1.  \n')
}

// ─── Tailwind class maps for ReactMarkdown elements ───────────────────────────

const PROSE_COMPONENTS = {
  // Paragraphs — match existing lesson prose style
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-300">
      {children}
    </p>
  ),
  // Bold
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>
  ),
  // Italic
  em: ({ children }) => (
    <em className="italic text-slate-700 dark:text-slate-300">{children}</em>
  ),
  // Inline code
  code: ({ inline, children }) =>
    inline
      ? <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[0.88em] text-brand-600 dark:text-brand-400">{children}</code>
      : <code className="block">{children}</code>,
  // Unordered list
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1 mb-3 text-slate-700 dark:text-slate-300">{children}</ul>
  ),
  // Ordered list
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1 mb-3 text-slate-700 dark:text-slate-300">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  // Block quote — for callout-style asides in prose
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand-300 dark:border-brand-600 pl-4 my-2 italic text-slate-600 dark:text-slate-400">
      {children}
    </blockquote>
  ),
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Render a single prose string (one item from lesson.intuition.prose etc.)
 * as a block with full markdown + math support.
 */
export default function MarkdownProse({ text, className = '' }) {
  if (!text) return null
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={PROSE_COMPONENTS}
      >
        {preprocess(text)}
      </ReactMarkdown>
    </div>
  )
}
