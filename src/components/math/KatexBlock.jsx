import katex from 'katex'
import { useMemo } from 'react'

export default function KatexBlock({ expr, className = '' }) {
  const html = useMemo(() => {
    if (!expr) return ''
    try {
      return katex.renderToString(expr, {
        displayMode: true,
        throwOnError: false,
        trust: false,
        strict: false,
      })
    } catch {
      return `<span style="color:red">[LaTeX error: ${expr}]</span>`
    }
  }, [expr])

  return (
    <div
      className={`math-display overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
