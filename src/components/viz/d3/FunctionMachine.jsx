import { useState } from 'react'
import KatexInline from '../../math/KatexInline.jsx'

const EXAMPLES = [
  { fn: 'x^2', compute: (x) => x * x },
  { fn: '2x + 1', compute: (x) => 2 * x + 1 },
  { fn: '\\sin(x)', compute: (x) => Math.sin(x) },
  { fn: '\\sqrt{x}', compute: (x) => x >= 0 ? Math.sqrt(x) : null },
]

export default function FunctionMachine() {
  const [fnIdx, setFnIdx] = useState(0)
  const [inputStr, setInputStr] = useState('3')
  const fn = EXAMPLES[fnIdx]
  const input = parseFloat(inputStr)
  const output = !isNaN(input) ? fn.compute(input) : null
  const outputStr = output === null ? 'undefined' : (Number.isInteger(output) ? String(output) : output.toFixed(4))

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-6 flex-wrap justify-center">
        {/* Input */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Input x</span>
          <input
            type="number"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            className="w-20 text-center border-2 border-brand-300 dark:border-brand-700 rounded-lg p-2 font-mono text-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Arrow */}
        <div className="text-2xl text-slate-400">→</div>

        {/* Machine */}
        <div className="bg-brand-500 dark:bg-brand-600 text-white rounded-2xl px-8 py-4 flex flex-col items-center shadow-lg min-w-[140px]">
          <span className="text-xs uppercase tracking-widest mb-1 opacity-75">f ( x ) =</span>
          <div className="text-xl font-medium">
            <KatexInline expr={fn.fn} />
          </div>
        </div>

        {/* Arrow */}
        <div className="text-2xl text-slate-400">→</div>

        {/* Output */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Output f(x)</span>
          <div className="w-20 text-center border-2 border-emerald-400 dark:border-emerald-600 rounded-lg p-2 font-mono text-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
            {outputStr}
          </div>
        </div>
      </div>

      {/* Function selector */}
      <div className="flex gap-2 flex-wrap justify-center">
        {EXAMPLES.map((e, i) => (
          <button
            key={i}
            onClick={() => setFnIdx(i)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              i === fnIdx
                ? 'bg-brand-500 text-white border-brand-500'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-brand-400'
            }`}
          >
            <KatexInline expr={e.fn} />
          </button>
        ))}
      </div>
    </div>
  )
}
