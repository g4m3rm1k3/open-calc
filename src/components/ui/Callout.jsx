import KatexBlock from '../math/KatexBlock.jsx'

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
}

export default function Callout({ type = 'tip', title, body }) {
  const icon = ICONS[type] ?? '•'
  const label = LABELS[type] ?? type

  // Detect if body looks like LaTeX (contains \, ^, {, etc.)
  const isLatex = /[\\^_{}]/.test(body ?? '')

  return (
    <div className={`callout callout-${type} my-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base" aria-hidden>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
        {title && <span className="text-sm font-semibold">— {title}</span>}
      </div>
      {isLatex ? (
        <KatexBlock expr={body} />
      ) : (
        <p className="text-sm leading-relaxed">{body}</p>
      )}
    </div>
  )
}
