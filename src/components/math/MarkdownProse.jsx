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

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// ─── Preprocessor ────────────────────────────────────────────────────────────

/**
 * Scan forward from `start` (where src[start] === '\\') and collect a bare
 * LaTeX expression. Stops when all braces are closed and the next character is
 * NOT a math-continuation character (_ ^ { \).  Returns the end index.
 */
function scanBareMath(src, start) {
  let i = start;
  let depth = 0;
  let hadBraces = false;

  while (i < src.length) {
    const c = src[i];
    if (c === "{") {
      depth++;
      hadBraces = true;
      i++;
      continue;
    }
    if (c === "}") {
      if (depth > 0) depth--;
      i++;
      if (depth === 0 && hadBraces) {
        const peek = i < src.length ? src[i] : "";
        if (peek === "_" || peek === "^" || peek === "{" || peek === "\\")
          continue;
        break; // all braces closed, not continuing — stop here
      }
      continue;
    }
    if (depth === 0) {
      if (c === "\n") break;
      // Bare command with no braces: stop at space or prose punctuation
      if (
        !hadBraces &&
        (c === " " ||
          c === "," ||
          c === "." ||
          c === ";" ||
          c === "!" ||
          c === "?")
      )
        break;
    }
    i++;
  }
  return i;
}

/**
 * Wrap bare \command expressions that are NOT already inside $, $$, \(, or \[
 * delimiters in $…$.  This fixes prose like "write \frac{a}{b} and cancel"
 * where the author forgot to add dollar signs.
 */
function wrapBareLatex(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    // Skip past already-delimited math so we don't double-wrap
    if (src.startsWith("$$", i)) {
      const close = src.indexOf("$$", i + 2);
      if (close !== -1) {
        out += src.slice(i, close + 2);
        i = close + 2;
        continue;
      }
    }
    if (src[i] === "$" && src[i - 1] !== "\\") {
      const close = src.indexOf("$", i + 1);
      if (close !== -1 && close - i < 300) {
        out += src.slice(i, close + 1);
        i = close + 1;
        continue;
      }
    }
    if (src.startsWith("\\(", i)) {
      const close = src.indexOf("\\)", i + 2);
      if (close !== -1) {
        out += src.slice(i, close + 2);
        i = close + 2;
        continue;
      }
    }
    if (src.startsWith("\\[", i)) {
      const close = src.indexOf("\\]", i + 2);
      if (close !== -1) {
        out += src.slice(i, close + 2);
        i = close + 2;
        continue;
      }
    }
    // Bare \command — wrap in $...$
    if (src[i] === "\\" && i + 1 < src.length && /[a-zA-Z]/.test(src[i + 1])) {
      const end = scanBareMath(src, i);
      if (end > i + 1) {
        out += "$" + src.slice(i, end) + "$";
        i = end;
        continue;
      }
    }
    out += src[i];
    i++;
  }
  return out;
}

function preprocess(text) {
  if (!text) return "";
  // Normalize escaped newlines from lesson data strings before any other processing
  const normalized = text.replace(/\\n/g, "\n\n");
  return (
    wrapBareLatex(normalized)
      // \[…\] → $$\n…\n$$ (block / display math)
      .replace(/\\\[/g, "$$\n")
      .replace(/\\\]/g, "\n$$")
      // \(…\) → $…$ (inline math)
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$")
      // {{algebra:topicId|linkText}} → **linkText**  (preserves visible text)
      .replace(/\{\{algebra:[^|]+\|([^}]+)\}\}/g, "**$1**")
      // "Step N:" mid-sentence → new paragraph with bold label.
      .replace(/\.\s+(Step\s+\d+:)/g, ".\n\n**$1**")
      // "(1) ... (2) ..." inline numbered steps → new paragraphs.
      // Matches a period/em-dash followed by a space then "(N)" at start of a new step.
      .replace(/[.—]\s+(\(\d+\))\s+/g, ".\n\n$1 ")
      // Sentence break after inline math: "$math$. Next sentence" → hard line break.
      .replace(/(\$[^$\n]+\$)\.\s+(?=\S)/g, "$1.  \n")
  );
}

// ─── Tailwind class maps for ReactMarkdown elements ───────────────────────────

const PROSE_COMPONENTS = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50 mt-8 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-8 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-[12px] font-black uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400 mt-5 mb-2">
      {children}
    </h4>
  ),
  // Paragraphs
  p: ({ children }) => (
    <p className="mb-5 last:mb-0 text-[16px] sm:text-[17px] leading-8 text-slate-700 dark:text-slate-300">
      {children}
    </p>
  ),
  // Bold — clearly brighter than body in both modes
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-950 dark:text-white">
      {children}
    </strong>
  ),
  // Italic
  em: ({ children }) => (
    <em className="italic text-slate-600 dark:text-slate-300">{children}</em>
  ),
  // Inline code — react-markdown v9+ removed the `inline` prop.
  // Block code has className="language-*"; inline code has no className.
  code: ({ className, children }) =>
    className?.startsWith("language-") ? (
      <code className="block">{children}</code>
    ) : (
      <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 font-mono text-[0.86em] text-brand-700 dark:text-brand-300">
        {children}
      </code>
    ),
  // Unordered list
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2 mb-5 text-[16px] sm:text-[17px] leading-8 text-slate-700 dark:text-slate-300">
      {children}
    </ul>
  ),
  // Ordered list
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 mb-5 text-[16px] sm:text-[17px] leading-8 text-slate-700 dark:text-slate-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  // Block quote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand-300 dark:border-brand-600 pl-5 py-1 my-5 italic text-slate-600 dark:text-slate-300">
      {children}
    </blockquote>
  ),
  // Horizontal rule
  hr: () => <hr className="my-4 border-slate-200 dark:border-slate-700" />,
  // Tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-100 dark:bg-slate-800">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-slate-200 dark:border-slate-700">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      {children}
    </td>
  ),
  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-600 dark:text-brand-400 underline hover:text-brand-700 dark:hover:text-brand-300"
    >
      {children}
    </a>
  ),
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Render a single prose string (one item from lesson.intuition.prose etc.)
 * as a block with full markdown + math support.
 */
export default function MarkdownProse({ text, className = "" }) {
  if (!text) return null;
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
  );
}
