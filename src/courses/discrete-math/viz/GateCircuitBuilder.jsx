import { useMemo, useState } from 'react'

const GATES = {
  AND:  { label: 'AND',  fn: (a, b) => a && b },
  OR:   { label: 'OR',   fn: (a, b) => a || b },
  NAND: { label: 'NAND', fn: (a, b) => !(a && b) },
  NOR:  { label: 'NOR',  fn: (a, b) => !(a || b) },
  XOR:  { label: 'XOR',  fn: (a, b) => a !== b },
  XNOR: { label: 'XNOR', fn: (a, b) => a === b },
}

const ROWS = [
  [false, false],
  [false, true],
  [true, false],
  [true, true],
]

const NAND_RECIPES = {
  NOT: {
    title: 'NOT from NAND alone',
    steps: ['NOT x  =  x NAND x'],
    test: (x) => !(x && x),
    label: 'NOT x',
  },
  AND: {
    title: 'AND from NAND alone',
    steps: ['NOT x = x NAND x', 'x AND y = NOT(x NAND y) = (x NAND y) NAND (x NAND y)'],
    test: (x, y) => {
      const nandxy = !(x && y)
      return !(nandxy && nandxy)
    },
    label: 'x AND y',
  },
  OR: {
    title: 'OR from NAND alone (via De Morgan)',
    steps: ['NOT x = x NAND x', 'x OR y = (NOT x) NAND (NOT y)'],
    test: (x, y) => {
      const notX = !(x && x)
      const notY = !(y && y)
      return !(notX && notY)
    },
    label: 'x OR y',
  },
}

export default function GateCircuitBuilder() {
  const [mode, setMode] = useState('explore')
  const [gate, setGate] = useState('AND')
  const [pLive, setPLive] = useState(false)
  const [qLive, setQLive] = useState(false)
  const [recipe, setRecipe] = useState('NOT')

  const liveOutput = useMemo(() => GATES[gate].fn(pLive, qLive), [gate, pLive, qLive])

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-1">Gate Circuit Builder</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Pick a gate and watch its truth table build live — then flip to NAND-only mode to see how one gate type can rebuild all the others.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('explore')}
          className={`px-3 py-1.5 rounded text-sm font-medium ${mode === 'explore' ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
        >
          Explore Any Gate
        </button>
        <button
          onClick={() => setMode('nand-only')}
          className={`px-3 py-1.5 rounded text-sm font-medium ${mode === 'nand-only' ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
        >
          NAND-Only Mode
        </button>
      </div>

      {mode === 'explore' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(GATES).map(([key, g]) => (
              <button
                key={key}
                onClick={() => setGate(key)}
                className={`px-3 py-1.5 rounded text-sm font-mono font-semibold ${gate === key ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pLive} onChange={(e) => setPLive(e.target.checked)} className="w-4 h-4" />
              P = {pLive ? '1' : '0'}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={qLive} onChange={(e) => setQLive(e.target.checked)} className="w-4 h-4" />
              Q = {qLive ? '1' : '0'}
            </label>
            <div className={`px-3 py-1 rounded font-mono font-bold text-sm ${liveOutput ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>
              P {GATES[gate].label} Q = {liveOutput ? '1' : '0'}
            </div>
          </div>

          <table className="text-sm font-mono border-collapse">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="px-3 py-1 border-b border-slate-300 dark:border-slate-600">P</th>
                <th className="px-3 py-1 border-b border-slate-300 dark:border-slate-600">Q</th>
                <th className="px-3 py-1 border-b border-slate-300 dark:border-slate-600">P {GATES[gate].label} Q</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([p, q], i) => {
                const out = GATES[gate].fn(p, q)
                const isLive = p === pLive && q === qLive
                return (
                  <tr key={i} className={isLive ? 'bg-emerald-100 dark:bg-emerald-900/30' : ''}>
                    <td className="px-3 py-1 text-center">{p ? 1 : 0}</td>
                    <td className="px-3 py-1 text-center">{q ? 1 : 0}</td>
                    <td className={`px-3 py-1 text-center font-bold ${out ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {out ? 1 : 0}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {mode === 'nand-only' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(NAND_RECIPES).map(([key, r]) => (
              <button
                key={key}
                onClick={() => setRecipe(key)}
                className={`px-3 py-1.5 rounded text-sm font-mono font-semibold ${recipe === key ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
              >
                Build {key}
              </button>
            ))}
          </div>

          <h4 className="font-semibold text-sm mb-2">{NAND_RECIPES[recipe].title}</h4>
          <ul className="mb-4 space-y-1">
            {NAND_RECIPES[recipe].steps.map((s, i) => (
              <li key={i} className="text-sm font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5">
                {s}
              </li>
            ))}
          </ul>

          <table className="text-sm font-mono border-collapse">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="px-3 py-1 border-b border-slate-300 dark:border-slate-600">x</th>
                {recipe !== 'NOT' && <th className="px-3 py-1 border-b border-slate-300 dark:border-slate-600">y</th>}
                <th className="px-3 py-1 border-b border-slate-300 dark:border-slate-600">{NAND_RECIPES[recipe].label} (via NAND)</th>
              </tr>
            </thead>
            <tbody>
              {(recipe === 'NOT' ? [false, true].map((x) => [x]) : ROWS).map((row, i) => {
                const out = NAND_RECIPES[recipe].test(...row)
                return (
                  <tr key={i}>
                    <td className="px-3 py-1 text-center">{row[0] ? 1 : 0}</td>
                    {recipe !== 'NOT' && <td className="px-3 py-1 text-center">{row[1] ? 1 : 0}</td>}
                    <td className={`px-3 py-1 text-center font-bold ${out ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {out ? 1 : 0}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Every row matches the plain {NAND_RECIPES[recipe].label} truth table — proof that NAND alone can rebuild it, gate by gate.
          </p>
        </>
      )}
    </div>
  )
}
