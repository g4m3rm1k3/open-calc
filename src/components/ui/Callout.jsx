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
  // Pure display LaTeX: starts with a backslash and has no dollar signs (no mixed prose)
  if (!body.includes('$') && /^\\/.test(body.trim())) {
    return <KatexBlock expr={body} />
  }
  // Mixed or plain prose — parseProse handles $...$ inline math and **bold**
  return <p className="text-sm leading-relaxed">{parseProse(body)}</p>
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
