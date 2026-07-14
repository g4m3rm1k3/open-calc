// Concept file prose (explanation, CS/SE lens, walkthroughs) uses inline markdown
// — **bold** and `code` — for emphasis and to reference identifiers. It's plain
// text interpolated directly into JSX, not run through a markdown renderer, so
// without this it shows up as literal asterisks and backticks. This handles just
// the two inline forms actually used in concept files — not a general markdown
// renderer, on purpose, since concept prose is a few sentences, not a document.
export default function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/50 text-[0.9em] font-mono">
              {part.slice(1, -1)}
            </code>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
