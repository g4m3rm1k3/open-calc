/**
 * OpenInGrapher
 *
 * Drop this anywhere in a lesson to give a "Open in Calculator" button.
 * Reads from lesson data via the `config` prop, or accepts inline props.
 *
 * Usage in lesson content:
 *   grapher: {
 *     mode: 'pro',
 *     label: 'Explore the tangent line',
 *     functions: [{ expr: 'x^2', type: 'explicit', color: '#6366f1' }],
 *     sliders: [{ name: 'a', min: -3, max: 3, value: 1 }],
 *   }
 *
 * Usage in JSX:
 *   <OpenInGrapher
 *     expr="sin(x)"
 *     label="Explore sin(x)"
 *     mode="pro"
 *   />
 *   <OpenInGrapher config={lesson.grapher} />
 */
import { useGrapher } from '../../context/GrapherContext'
import { Calculator } from 'lucide-react'

const COLORS = ['#6366f1','#ec4899','#facc15','#22c55e','#ef4444','#a855f7','#06b6d4','#f97316']

export default function OpenInGrapher({
  // Either pass a full config object…
  config,
  // …or individual shorthand props
  expr,
  exprs,          // array of expression strings
  type = 'explicit',
  mode = 'pro',
  label,
  sliders,
  replace = true,
  // visual variant: 'button' | 'pill' | 'inline'
  variant = 'pill',
}) {
  const { openGrapher } = useGrapher()

  const buildConfig = () => {
    if (config) return config

    // Build from shorthand props
    const allExprs = exprs ?? (expr ? [expr] : [])
    return {
      mode,
      label,
      replace,
      sliders,
      functions: allExprs.map((e, i) => ({
        expr: e,
        type,
        color: COLORS[i % COLORS.length],
      })),
    }
  }

  const handleClick = () => openGrapher(buildConfig())

  // ── Variants ────────────────────────────────────────────────────────────────

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 decoration-dashed transition-colors"
      >
        <Calculator className="w-3 h-3" />
        {label || (expr ? `Plot ${expr}` : 'Open in Calculator')}
      </button>
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
      >
        <Calculator className="w-4 h-4" />
        {label || 'Open in Calculator'}
      </button>
    )
  }

  // Default: 'pill'
  const displayExpr = config?.functions?.[0]?.expr ?? expr ?? ''
  const displayLabel = label ?? config?.label ?? (displayExpr ? `Explore ${displayExpr}` : 'Open in Calculator')

  return (
    <button
      onClick={handleClick}
      className="group inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 rounded-xl text-xs font-semibold transition-all"
    >
      <Calculator className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
      <span>{displayLabel}</span>
      {displayExpr && (
        <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded text-[10px]">
          {displayExpr}
        </code>
      )}
    </button>
  )
}
