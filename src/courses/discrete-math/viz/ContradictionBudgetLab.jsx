import { useMemo, useState } from 'react'

export default function ContradictionBudgetLab() {
  const [items, setItems] = useState(11)
  const [holes, setHoles] = useState(10)

  const overBudget = items > holes
  const maxBar = Math.max(items, holes, 1)

  const budgetMsg = useMemo(() => {
    if (overBudget) {
      return `The "no-collision" assumption says every hole holds at most 1 item, so the budget caps out at ${holes}. But we placed ${items} items — ${items - holes} more than the budget allows. That's the contradiction: the assumption is broken by simple arithmetic.`
    }
    return `${items} items fit within the ${holes}-item no-collision budget with room to spare. No contradiction — a collision-free placement is still possible.`
  }, [items, holes, overBudget])

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-1">The Impossibility Engine — Contradiction Budget Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Set items (k) and holes (n). The left bar is what you actually placed; the right bar is the maximum the "no collision" assumption allows.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <label className="text-sm">
          Items (k) = {items}
          <input type="range" min="1" max="20" value={items} onChange={(e) => setItems(Number(e.target.value))} className="w-full mt-1" />
        </label>
        <label className="text-sm">
          Holes (n) = {holes}
          <input type="range" min="1" max="20" value={holes} onChange={(e) => setHoles(Number(e.target.value))} className="w-full mt-1" />
        </label>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Items actually placed: {items}</p>
          <div className="h-8 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full ${overBudget ? 'bg-rose-500' : 'bg-emerald-500'} transition-all`}
              style={{ width: `${(items / maxBar) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">No-collision budget (1 per hole): {holes}</p>
          <div className="h-8 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-slate-500" style={{ width: `${(holes / maxBar) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className={`p-3 rounded text-sm ${overBudget ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'}`}>
        {budgetMsg}
      </div>
    </div>
  )
}
