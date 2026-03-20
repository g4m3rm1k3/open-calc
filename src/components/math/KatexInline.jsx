import katex from 'katex'
import { useMemo } from 'react'

export default function KatexInline({ expr }) {
  const html = useMemo(() => {
    if (!expr) return ''
    try {
      return katex.renderToString(expr, {
        displayMode: false,
        throwOnError: false,
        trust: false,
        strict: false,
      })
    } catch {
      return `<span style="color:red">[LaTeX error]</span>`
    }
  }, [expr])

  return <span className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />
}
