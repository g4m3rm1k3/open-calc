import { useMemo, useState } from 'react'

const STATEMENTS = [
  { key: 'original', label: 'Original', expr: 'P → Q', group: 'a', fn: (p, q) => !p || q },
  { key: 'converse', label: 'Converse', expr: 'Q → P', group: 'b', fn: (p, q) => !q || p },
  { key: 'inverse', label: 'Inverse', expr: '¬P → ¬Q', group: 'b', fn: (p, q) => p || !q },
  { key: 'contrapositive', label: 'Contrapositive', expr: '¬Q → ¬P', group: 'a', fn: (p, q) => q || !p },
]

const GROUP_COLOR = {
  a: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400',
  b: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-400',
}

const ROWS = [
  [false, false],
  [false, true],
  [true, false],
  [true, true],
]

export default function ConditionalVariantsLab() {
  const [p, setP] = useState(true)
  const [q, setQ] = useState(false)
  const [showTable, setShowTable] = useState(false)

  const values = useMemo(
    () => Object.fromEntries(STATEMENTS.map((s) => [s.key, s.fn(p, q)])),
    [p, q]
  )

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-1">Conditional Variants Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Four statements built from the same P and Q. Toggle P and Q and watch which pairs always agree — that pattern is exactly why proof by contrapositive works.
      </p>

      <div className="flex items-center gap-6 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p} onChange={(e) => setP(e.target.checked)} className="w-4 h-4" />
          P = {p ? 'True' : 'False'}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={q} onChange={(e) => setQ(e.target.checked)} className="w-4 h-4" />
          Q = {q ? 'True' : 'False'}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {STATEMENTS.map((s) => (
          <div key={s.key} className={`p-3 rounded border-2 ${GROUP_COLOR[s.group]}`}>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="font-mono text-sm font-semibold mb-1">{s.expr}</p>
            <p className={`text-lg font-bold ${values[s.key] ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
              {values[s.key] ? 'True' : 'False'}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Notice: Original and Contrapositive (green) always match. Converse and Inverse (indigo) always match too — but the two groups don't have to match each other.
      </p>

      <button
        onClick={() => setShowTable((v) => !v)}
        className="px-3 py-1.5 rounded text-sm font-medium bg-brand-600 text-white mb-4"
      >
        {showTable ? 'Hide' : 'Show'} full truth table (all 4 rows)
      </button>

      {showTable && (
        <table className="text-sm font-mono border-collapse">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="px-3 py-1 border-b border-slate-300 dark:border-slate-600">P</th>
              <th className="px-3 py-1 border-b border-slate-300 dark:border-slate-600">Q</th>
              {STATEMENTS.map((s) => (
                <th key={s.key} className={`px-3 py-1 border-b-2 ${s.group === 'a' ? 'border-emerald-400' : 'border-indigo-400'}`}>
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([rp, rq], i) => {
              const isLive = rp === p && rq === q
              return (
                <tr key={i} className={isLive ? 'bg-amber-100 dark:bg-amber-900/30' : ''}>
                  <td className="px-3 py-1 text-center">{rp ? 'T' : 'F'}</td>
                  <td className="px-3 py-1 text-center">{rq ? 'T' : 'F'}</td>
                  {STATEMENTS.map((s) => (
                    <td key={s.key} className="px-3 py-1 text-center font-bold">
                      {s.fn(rp, rq) ? 'T' : 'F'}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
