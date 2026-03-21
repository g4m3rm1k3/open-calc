/**
 * Shared prose parser — converts mixed text+math strings into React elements.
 *
 * Handles:
 *  - $...$ inline LaTeX via KatexInline
 *  - **bold** via <strong>
 *  - {{algebra:topicId|linkText}} popovers via AlgebraMicroLesson
 *  - Plain text spans (preserving whitespace)
 */
import KatexInline from './KatexInline.jsx'
import AlgebraMicroLesson from '../lesson/AlgebraMicroLesson.jsx'

function isLikelyInlineMath(expr) {
  const t = expr.trim()
  if (!t) return false
  if (/^\d+(?:[.,]\d+)?$/.test(t)) return false
  if (/^[\d,]+(?:\.\d+)?$/.test(t)) return false
  return /[\\^_{}=<>+\-*/()|]|\b(?:lim|sin|cos|tan|log|ln|sqrt|frac|Delta|varepsilon|theta|pi|int|sum|prod)\b/i.test(t)
}

export function parseProse(text) {
  if (!text) return []
  const parts = []
  let i = 0
  let keyIdx = 0

  while (i < text.length) {
    // **bold**
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2)
      if (end !== -1) {
        parts.push(<strong key={`b${keyIdx++}`}>{text.slice(i + 2, end)}</strong>)
        i = end + 2
        continue
      }
    }

    // $inline math$
    if (text[i] === '$') {
      const end = text.indexOf('$', i + 1)
      if (end !== -1) {
        const candidate = text.slice(i + 1, end)
        if (isLikelyInlineMath(candidate)) {
          parts.push(
            <span key={`k${keyIdx++}`} className="math-hover-trigger inline-block transition-colors hover:text-brand-600 cursor-default">
              <KatexInline expr={candidate} />
            </span>
          )
          i = end + 1
          continue
        }
      }
      parts.push('$')
      i += 1
      continue
    }

    // {{algebra:topicId|linkText}} popover
    if (text[i] === '{' && text[i + 1] === '{' && text.startsWith('algebra:', i + 2)) {
      const end = text.indexOf('}}', i + 2)
      if (end !== -1) {
        const content = text.slice(i + 10, end) // past `{{algebra:`
        const pipeIdx = content.indexOf('|')
        if (pipeIdx !== -1) {
          const topicId = content.substring(0, pipeIdx)
          const linkText = content.substring(pipeIdx + 1)
          parts.push(
            <AlgebraMicroLesson key={`alg${keyIdx++}`} topicId={topicId}>
              <KatexInline expr={linkText} />
            </AlgebraMicroLesson>
          )
          i = end + 2
          continue
        }
      }
    }

    // Plain text — scan to next special marker
    const nextBold = text.indexOf('**', i)
    const nextDollar = text.indexOf('$', i)
    const nextAlg = text.indexOf('{{algebra:', i)
    const candidates = [nextBold, nextDollar, nextAlg].filter((v) => v !== -1)
    const stop = candidates.length ? Math.min(...candidates) : text.length
    if (stop > i) {
      parts.push(<span key={`t${keyIdx++}`}>{text.slice(i, stop)}</span>)
    }
    i = stop
  }

  return parts.length > 0 ? parts : [text]
}
