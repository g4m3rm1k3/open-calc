import { useMemo, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

export default function BayesGridLab() {
  const [prevalence, setPrevalence] = useState(0.01)
  const [sensitivity, setSensitivity] = useState(0.95)
  const [specificity, setSpecificity] = useState(0.9)

  const stats = useMemo(() => {
    const N = 10000
    const diseased = N * prevalence
    const healthy = N - diseased
    const tp = diseased * sensitivity
    const fn = diseased - tp
    const tn = healthy * specificity
    const fp = healthy - tn
    const ppv = tp / Math.max(1, tp + fp)
    return { tp, fp, tn, fn, ppv }
  }, [prevalence, sensitivity, specificity])

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Bayes Grid Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Observe how base rate dominates posterior interpretation.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SliderControl label={`Prevalence = ${(prevalence * 100).toFixed(1)}%`} min={0.001} max={0.3} step={0.001} value={prevalence} onChange={setPrevalence} />
        <SliderControl label={`Sensitivity = ${(sensitivity * 100).toFixed(1)}%`} min={0.5} max={1} step={0.005} value={sensitivity} onChange={setSensitivity} />
        <SliderControl label={`Specificity = ${(specificity * 100).toFixed(1)}%`} min={0.5} max={1} step={0.005} value={specificity} onChange={setSpecificity} />
      </div>

      <svg viewBox="0 0 620 220" className="w-full mt-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        <rect x="30" y="40" width="260" height="140" fill="#e2e8f0" />
        <rect x="330" y="40" width="260" height="140" fill="#e2e8f0" />

        <rect x="30" y={180 - (stats.tp / 10000) * 140} width="260" height={(stats.tp / 10000) * 140} fill="#22c55e" />
        <rect x="330" y={180 - (stats.fp / 10000) * 140} width="260" height={(stats.fp / 10000) * 140} fill="#ef4444" />

        <text x="160" y="30" textAnchor="middle" fontSize="13" fill="#334155">True Positives</text>
        <text x="460" y="30" textAnchor="middle" fontSize="13" fill="#334155">False Positives</text>
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 text-xs">
        <div className="p-2 rounded bg-emerald-100/70 dark:bg-emerald-900/30">TP: {Math.round(stats.tp)}</div>
        <div className="p-2 rounded bg-rose-100/70 dark:bg-rose-900/30">FP: {Math.round(stats.fp)}</div>
        <div className="p-2 rounded bg-slate-200 dark:bg-slate-700">TN: {Math.round(stats.tn)}</div>
        <div className="p-2 rounded bg-slate-200 dark:bg-slate-700">FN: {Math.round(stats.fn)}</div>
        <div className="p-2 rounded bg-brand-100 dark:bg-brand-900/30 font-semibold">P(D|+): {(stats.ppv * 100).toFixed(2)}%</div>
      </div>
    </div>
  )
}
