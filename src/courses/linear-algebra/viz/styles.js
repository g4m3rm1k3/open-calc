// Shared light/dark styling for linear-algebra viz components.
//
// Most components in this folder repeat the same Tailwind `dark:` class
// pairs for panels, cards, and text (see CrossProductViz.jsx,
// GramSchmidtProcess.jsx, DiagonalizationStepperViz.jsx for the convention
// this mirrors). Import these instead of re-typing the pairs every time.
//
// Per-component accent colors (violet, blue, red, etc.) stay local to each
// component — only the structural light/dark pairs are centralized here.

export const panel =
  'p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'

export const card =
  'rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700'

export const cardSoft =
  'rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800'

export const title = 'text-lg font-semibold mb-1 text-slate-900 dark:text-slate-100'

export const subtitle = 'text-sm text-slate-600 dark:text-slate-300'

export const bodyText = 'text-sm text-slate-700 dark:text-slate-300'

export const mutedText = 'text-slate-500 dark:text-slate-400'

export const label = 'text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400'

export const divider = 'border-slate-200 dark:border-slate-700'

export const buttonSecondary =
  'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'

export const overlayPanel =
  'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200'

/**
 * Three.js scene colors don't respond to CSS — pass `useIsDark()`'s result
 * here to get the matching grid/line colors for a <Grid> or <Line> inside
 * a viz's <Canvas>. Keeps the 3D content readable in both themes instead
 * of assuming a permanently-dark canvas.
 */
export function getSceneColors(isDark) {
  return isDark
    ? { cellColor: '#334155', sectionColor: '#475569', lineColor: '#64748b', textColor: '#94a3b8' }
    : { cellColor: '#cbd5e1', sectionColor: '#94a3b8', lineColor: '#64748b', textColor: '#475569' }
}
