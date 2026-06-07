import KatexBlock from '../math/KatexBlock.jsx'
import MarkdownProse from '../math/MarkdownProse.jsx'

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
  if (!body.includes('$') && !body.includes('\\[') && !body.includes('\\(') && /^\\/.test(body.trim())) {
    return <KatexBlock expr={body} />
  }
  // MarkdownProse with color inheritance — paragraph and strong colors defer to
  // the parent .callout-* class so each callout type keeps its tint in both modes.
  return (
    <MarkdownProse
      text={body}
      className="[&_p]:text-inherit [&_p]:text-sm [&_p]:leading-relaxed [&_strong]:text-inherit [&_strong]:font-bold [&_em]:text-inherit [&_li]:text-inherit [&_ul]:text-inherit [&_ol]:text-inherit"
    />
  )
}

export default function Callout({ type = 'tip', title, body }) {
  const icon = ICONS[type] ?? '•'
  const label = LABELS[type] ?? type

  return (
    <div className={`callout callout-${type} my-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3 text-current">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>{icon}</span>
          <span className="text-sm font-black uppercase tracking-[0.1em] opacity-80">{label}</span>
        </div>
        {title && <span className="hidden sm:inline opacity-50">—</span>}
        {title && <span className="text-base font-bold leading-tight">{title}</span>}
      </div>
      {renderBody(body)}
    </div>
  )
}
