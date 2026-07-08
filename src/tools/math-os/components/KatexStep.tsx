import { useMemo } from 'react'
import katex from 'katex'

interface Props {
  label?: string
  latex: string
}

export default function KatexStep({ label, latex }: Props) {
  const bodyHtml = useMemo(() => {
    try { return katex.renderToString(latex, { displayMode: true, throwOnError: false, trust: false, strict: false }) }
    catch { return `<span style="color:#f87171">[LaTeX error: ${latex?.slice(0,40)}]</span>` }
  }, [latex])

  const labelHtml = useMemo(() => {
    if (!label) return null
    if (label.includes('\\') || /[_^{}]/.test(label)) {
      try { return katex.renderToString(label, { displayMode: false, throwOnError: false, trust: false, strict: false }) }
      catch { return null }
    }
    return null
  }, [label])

  return (
    <div className="mb-2">
      {label && (
        <div className="text-xs text-slate-400 mb-1 font-mono">
          {labelHtml
            ? <span dangerouslySetInnerHTML={{ __html: labelHtml }} />
            : label}
        </div>
      )}
      <div className="text-center overflow-x-auto" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </div>
  )
}
