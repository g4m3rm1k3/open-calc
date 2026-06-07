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

const HEADER_COLORS = {
  definition: 'text-blue-700 dark:text-blue-400',
  theorem: 'text-purple-700 dark:text-purple-400',
  tip: 'text-emerald-700 dark:text-emerald-400',
  warning: 'text-amber-700 dark:text-amber-400',
  intuition: 'text-orange-700 dark:text-orange-400',
  'prior-knowledge': 'text-sky-700 dark:text-sky-400',
  'real-world': 'text-teal-700 dark:text-teal-400',
  geometric: 'text-indigo-700 dark:text-indigo-400',
  mnemonic: 'text-pink-700 dark:text-pink-400',
  procedure: 'text-slate-700 dark:text-slate-300',
  insight: 'text-yellow-700 dark:text-yellow-400',
  proof: 'text-violet-700 dark:text-violet-400',
  example: 'text-cyan-700 dark:text-cyan-400',
  misconception: 'text-red-700 dark:text-red-400',
  history: 'text-amber-800 dark:text-amber-400',
  strategy: 'text-rose-700 dark:text-rose-400',
  application: 'text-fuchsia-700 dark:text-fuchsia-400',
}

export default function Callout({ type = 'tip', title, body }) {
  const icon = ICONS[type] ?? '•'
  const label = LABELS[type] ?? type
  const headerColor = HEADER_COLORS[type] || 'text-current'

  return (
    <div className={`callout callout-${type} my-4`}>
      <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3 font-sans ${headerColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-[22px] drop-shadow-sm" aria-hidden>{icon}</span>
          <span className="text-[13px] font-black uppercase tracking-[0.15em]">{label}</span>
        </div>
        {title && <span className="hidden sm:inline opacity-40 font-light">—</span>}
        {title && <span className="text-base font-bold tracking-wide">{title}</span>}
      </div>
      {renderBody(body)}
    </div>
  )
}
