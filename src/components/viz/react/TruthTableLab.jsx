import { useMemo, useState } from 'react'

const ROWS = [
  { P: false, Q: false },
  { P: false, Q: true },
  { P: true, Q: false },
  { P: true, Q: true },
]

function evalExpr(expr, P, Q) {
  switch (expr) {
    case 'implication': return (!P) || Q
    case 'contrapositive': return (!Q) || (!P)
    case 'biconditional': return P === Q
    case 'xor': return P !== Q
    case 'deMorganLeft': return !(P && Q)
    case 'deMorganRight': return (!P) || (!Q)
    default: return false
  }
}

const LABELS = {
  implication: 'P => Q',
  contrapositive: '~Q => ~P',
  biconditional: 'P <=> Q',
  xor: 'P xor Q',
  deMorganLeft: '~(P and Q)',
  deMorganRight: '~P or ~Q',
}

export default function TruthTableLab() {
  const [left, setLeft] = useState('implication')
  const [right, setRight] = useState('contrapositive')

  const rows = useMemo(() => {
    return ROWS.map((r) => ({
      ...r,
      L: evalExpr(left, r.P, r.Q),
      R: evalExpr(right, r.P, r.Q),
    }))
  }, [left, right])

  const equivalent = rows.every((r) => r.L === r.R)

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-3">Truth Table Studio</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Compare two logical forms row-by-row and test equivalence.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <label className="text-sm">
          <span className="block mb-1 font-medium">Left expression</span>
          <select value={left} onChange={(e) => setLeft(e.target.value)} className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2">
            {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 font-medium">Right expression</span>
          <select value={right} onChange={(e) => setRight(e.target.value)} className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2">
            {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-slate-300 dark:border-slate-700">P</th>
              <th className="p-2 border border-slate-300 dark:border-slate-700">Q</th>
              <th className="p-2 border border-slate-300 dark:border-slate-700">{LABELS[left]}</th>
              <th className="p-2 border border-slate-300 dark:border-slate-700">{LABELS[right]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const match = r.L === r.R
              return (
                <tr key={i} className={match ? 'bg-emerald-50/60 dark:bg-emerald-900/20' : 'bg-rose-50/60 dark:bg-rose-900/20'}>
                  <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">{String(r.P)}</td>
                  <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">{String(r.Q)}</td>
                  <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-semibold">{String(r.L)}</td>
                  <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-semibold">{String(r.R)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className={`mt-4 text-sm font-semibold ${equivalent ? 'text-emerald-600' : 'text-rose-600'}`}>
        {equivalent ? 'Equivalent: all rows match.' : 'Not equivalent: at least one row differs.'}
      </p>
    </div>
  )
}
