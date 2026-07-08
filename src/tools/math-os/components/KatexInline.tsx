import { useMemo } from 'react'
import katex from 'katex'

interface Props {
  expr: string
  className?: string
}

export default function KatexInline({ expr, className }: Props) {
  const html = useMemo(() => {
    try { return katex.renderToString(expr, { displayMode: false, throwOnError: false, trust: false, strict: false }) }
    catch { return expr }
  }, [expr])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
