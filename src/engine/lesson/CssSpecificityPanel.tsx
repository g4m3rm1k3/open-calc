import type { UiTheme } from './types'

interface Props {
  css: string
  ui: UiTheme
}

interface CssRule {
  selectors: SelectorSpec[]
  declarations: string[]
}

interface SelectorSpec {
  raw: string
  a: number  // IDs
  b: number  // classes, attributes, pseudo-classes
  c: number  // types, pseudo-elements
  score: number
  breakdown: string[]
}

// ── Specificity calculator ────────────────────────────────────────────────────

function specificity(selector: string): Omit<SelectorSpec, 'raw'> {
  const breakdown: string[] = []
  let s = selector.trim()

  // Remove :not(), :is(), :has() wrappers but keep their arguments for scoring
  // :where() contributes 0, so drop entirely
  s = s.replace(/:where\([^)]*\)/g, '')

  // Strip pseudo-element ::xxx (contribute c=1 each)
  const pseudoElements = (s.match(/::[\w-]+/g) || [])
  const c_pseudo = pseudoElements.length
  if (c_pseudo) breakdown.push(`${c_pseudo} pseudo-element${c_pseudo > 1 ? 's' : ''} (::)`)
  s = s.replace(/::[\w-]+/g, '')

  // Strip ID selectors (contribute a=1 each)
  const ids = (s.match(/#[a-zA-Z_][\w-]*/g) || [])
  const a = ids.length
  if (a) breakdown.push(`${a} ID${a > 1 ? 's' : ''} (#)`)
  s = s.replace(/#[a-zA-Z_][\w-]*/g, '')

  // Strip attribute selectors (contribute b=1 each)
  const attributes = (s.match(/\[[^\]]+\]/g) || [])
  const b_attr = attributes.length
  if (b_attr) breakdown.push(`${b_attr} attribute${b_attr > 1 ? 's' : ''} ([])`)
  s = s.replace(/\[[^\]]+\]/g, '')

  // Strip pseudo-classes :xxx (contribute b=1 each), skip :not/:is/:has wrappers
  const pseudoClasses = (s.match(/:(?!:)[a-zA-Z][\w-]*(?:\([^)]*\))?/g) || [])
  const b_pseudo = pseudoClasses.length
  if (b_pseudo) breakdown.push(`${b_pseudo} pseudo-class${b_pseudo > 1 ? 'es' : ''} (:)`)
  s = s.replace(/:(?!:)[a-zA-Z][\w-]*(?:\([^)]*\))?/g, '')

  // Strip class selectors (contribute b=1 each)
  const classes = (s.match(/\.[\w-]+/g) || [])
  const b_class = classes.length
  if (b_class) breakdown.push(`${b_class} class${b_class > 1 ? 'es' : ''} (.)`)
  s = s.replace(/\.[\w-]+/g, '')

  // Strip combinators and universal selector
  s = s.replace(/[>+~*\s]+/g, ' ').trim()

  // What remains should be type selectors
  const types = (s.match(/[a-zA-Z][a-zA-Z0-9-]*/g) || [])
  const c_type = types.length
  if (c_type) breakdown.push(`${c_type} type${c_type > 1 ? 's' : ''} (${types.join(', ')})`)

  const b = b_attr + b_pseudo + b_class
  const c = c_type + c_pseudo

  return { a, b, c, score: a * 10000 + b * 100 + c, breakdown }
}

// ── CSS parser ────────────────────────────────────────────────────────────────

function parseCss(css: string): CssRule[] {
  // Strip comments
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')

  const rules: CssRule[] = []
  // Match selector { declarations }
  const rulePattern = /([^{}]+)\{([^{}]*)\}/g
  let match

  while ((match = rulePattern.exec(stripped)) !== null) {
    const selectorBlock = match[1].trim()
    const declarationBlock = match[2].trim()

    // Skip @rules (keyframes, media, etc.)
    if (selectorBlock.startsWith('@')) continue

    const selectorList = selectorBlock.split(',').map(s => s.trim()).filter(Boolean)
    const declarations = declarationBlock
      .split(';')
      .map(d => d.trim())
      .filter(Boolean)

    const selectors: SelectorSpec[] = selectorList.map(raw => ({
      raw,
      ...specificity(raw),
    }))

    if (selectors.length > 0) {
      rules.push({ selectors, declarations })
    }
  }

  return rules
}

// ── Specificity badge ─────────────────────────────────────────────────────────

function SpecBadge({ a, b, c }: { a: number; b: number; c: number }) {
  return (
    <div className="flex items-center gap-px font-mono text-[11px]">
      <span title="IDs" className={`px-1.5 py-0.5 rounded-l ${a > 0 ? 'bg-amber-500/30 text-amber-300' : 'bg-white/5 text-white/30'}`}>{a}</span>
      <span title="Classes / attrs / pseudo-classes" className={`px-1.5 py-0.5 ${b > 0 ? 'bg-sky-500/30 text-sky-300' : 'bg-white/5 text-white/30'}`}>{b}</span>
      <span title="Types / pseudo-elements" className={`px-1.5 py-0.5 rounded-r ${c > 0 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/5 text-white/30'}`}>{c}</span>
    </div>
  )
}

// ── Specificity bar ───────────────────────────────────────────────────────────

function SpecBar({ score, max, ui }: { score: number; max: number; ui: UiTheme }) {
  const pct = max === 0 ? 0 : Math.round((score / max) * 100)
  return (
    <div className={`h-1 rounded-full ${ui.bg2} overflow-hidden`} style={{ width: 60 }}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function CssSpecificityPanel({ css, ui }: Props) {
  const rules = parseCss(css)
  const allSelectors = rules.flatMap(r => r.selectors)
  const maxScore = Math.max(1, ...allSelectors.map(s => s.score))

  return (
    <div className="flex-1 overflow-auto">
      {/* Legend */}
      <div className={`flex items-center gap-3 px-3 py-2 border-b ${ui.border} ${ui.bg1} shrink-0 text-[10px]`}>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-amber-500/30 inline-block" />
          <span className={ui.txt2}>IDs (a)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-sky-500/30 inline-block" />
          <span className={ui.txt2}>Classes / attrs / :pseudo (b)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-500/30 inline-block" />
          <span className={ui.txt2}>Types / ::pseudo (c)</span>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className={`text-xs ${ui.txt2} px-4 py-6 text-center`}>No CSS rules found.</div>
      ) : (
        <div className="divide-y divide-white/5">
          {rules.map((rule, ri) => (
            <div key={ri} className={`px-3 py-2.5`}>
              {/* Selectors */}
              {rule.selectors.map((sel, si) => (
                <div key={si} className="flex items-center gap-3 mb-1">
                  {/* Selector text */}
                  <span className={`font-mono text-[12px] text-brand-300 flex-1 min-w-0 truncate`} title={sel.raw}>
                    {sel.raw}
                  </span>

                  {/* Bar */}
                  <SpecBar score={sel.score} max={maxScore} ui={ui} />

                  {/* a,b,c badge */}
                  <SpecBadge a={sel.a} b={sel.b} c={sel.c} />
                </div>
              ))}

              {/* Breakdown */}
              {rule.selectors.map((sel, si) => (
                sel.breakdown.length > 0 && (
                  <div key={`bd-${si}`} className={`text-[10px] ${ui.txt2} mb-1 pl-1`}>
                    {sel.breakdown.join(' + ')} → ({sel.a},{sel.b},{sel.c})
                  </div>
                )
              ))}

              {/* Declarations (collapsed preview) */}
              <div className={`text-[10px] font-mono ${ui.txt2} pl-1 mt-1 space-y-0.5`}>
                {rule.declarations.slice(0, 3).map((d, di) => (
                  <div key={di} className="truncate">{d};</div>
                ))}
                {rule.declarations.length > 3 && (
                  <div className={ui.txt2}>+{rule.declarations.length - 3} more…</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Specificity reminder */}
      <div className={`px-3 py-3 border-t ${ui.border} text-[10px] ${ui.txt2} space-y-1`}>
        <div className="font-semibold text-[11px]">How specificity wins</div>
        <div>Higher <span className="text-amber-300 font-mono">a</span> always beats any <span className="text-sky-300 font-mono">b</span> or <span className="text-emerald-300 font-mono">c</span>.</div>
        <div>Equal <span className="text-amber-300 font-mono">a</span>? Compare <span className="text-sky-300 font-mono">b</span>. Equal <span className="text-sky-300 font-mono">b</span>? Compare <span className="text-emerald-300 font-mono">c</span>.</div>
        <div>Equal specificity: the rule that appears <em>last</em> in the stylesheet wins.</div>
      </div>
    </div>
  )
}
