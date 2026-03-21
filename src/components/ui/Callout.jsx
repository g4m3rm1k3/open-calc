import KatexBlock from '../math/KatexBlock.jsx'
import { parseProse } from '../math/parseProse.jsx'

const ICONS = {
  definition: '📐',
  theorem: '∴',
  tip: '💡',
  warning: '⚠',
  intuition: '🧠',
  'prior-knowledge': '📚',
  'real-world': '🌍',
  'geometric': '🔷',
  'mnemonic': '🎵',
  'procedure': '📋',
  'insight': '✨',
  'proof': '🔑',
  'example': '📝',
  'misconception': '🚫',
  'history': '📜',
  'strategy': '🎯',
  'application': '🔬',
}

const LABELS = {
  definition: 'Definition',
  theorem: 'Theorem',
  tip: 'Tip',
  warning: 'Warning',
  intuition: 'Intuition',
  'prior-knowledge': 'You may have been taught',
  'real-world': 'Real World Connection',
  'geometric': 'Geometric Insight',
  'mnemonic': 'Memory Aid',
  'procedure': 'Step-by-Step',
  'insight': 'Key Insight',
  'proof': 'Proof',
  'example': 'Quick Example',
  'misconception': 'Common Mistake',
  'history': 'Historical Note',
  'strategy': 'Strategy',
  'application': 'Application',
}

function renderBody(body) {
  if (!body) return null
  // Pure LaTeX expression (no text, no \[...\] wrappers, no $ markers)
  // e.g. "\frac{d}{dx}[\sin x] = \cos x" — send straight to KatexBlock
  if (!body.includes('$') && !body.includes('\\[') && !body.includes('\\(') && /^\\/.test(body.trim())) {
    return <KatexBlock expr={body} />
  }
  // Everything else — parseProse handles $...$, \[...\], \(...\), **bold**, and plain text
  return <div className="text-sm leading-relaxed">{parseProse(body)}</div>
}

export default function Callout({ type = 'tip', title, body }) {
  const icon = ICONS[type] ?? '•'
  const label = LABELS[type] ?? type

  return (
    <div className={`callout callout-${type} my-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base" aria-hidden>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
        {title && <span className="text-sm font-semibold">— {title}</span>}
      </div>
      {renderBody(body)}
    </div>
  )
}
