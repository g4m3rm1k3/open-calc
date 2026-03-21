import { useMemo, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

function positiveMod(value, mod) {
  return ((value % mod) + mod) % mod
}

export default function ModClockViz() {
  const [modulus, setModulus] = useState(12)
  const [a, setA] = useState(17)
  const [b, setB] = useState(9)

  const result = useMemo(() => {
    const add = positiveMod(a + b, modulus)
    const mult = positiveMod(a * b, modulus)
    const aClass = positiveMod(a, modulus)
    const bClass = positiveMod(b, modulus)
    return { add, mult, aClass, bClass }
  }, [a, b, modulus])

  const points = useMemo(() => {
    return Array.from({ length: modulus }, (_, i) => {
      const theta = (-Math.PI / 2) + (2 * Math.PI * i) / modulus
      const x = 180 + 130 * Math.cos(theta)
      const y = 180 + 130 * Math.sin(theta)
      return { i, x, y }
    })
  }, [modulus])

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Modular Clock Explorer</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        See congruence classes as positions on a clock. Different integers collapse to the same class modulo n.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SliderControl label={`modulus n = ${modulus}`} min={5} max={20} step={1} value={modulus} onChange={setModulus} />
        <SliderControl label={`a = ${a}`} min={-30} max={30} step={1} value={a} onChange={setA} />
        <SliderControl label={`b = ${b}`} min={-30} max={30} step={1} value={b} onChange={setB} />
      </div>

      <svg viewBox="0 0 360 360" className="w-full max-w-md mx-auto mt-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        <circle cx="180" cy="180" r="130" fill="none" stroke="#94a3b8" strokeWidth="2" />
        {points.map((p) => {
          const isA = p.i === result.aClass
          const isB = p.i === result.bClass
          const isAdd = p.i === result.add
          return (
            <g key={p.i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isAdd ? 14 : isA || isB ? 11 : 8}
                fill={isAdd ? '#22c55e' : isA ? '#6366f1' : isB ? '#f59e0b' : '#cbd5e1'}
              />
              <text x={p.x} y={p.y + 3} fontSize="8" textAnchor="middle" fill={isAdd || isA || isB ? '#fff' : '#334155'}>{p.i}</text>
            </g>
          )
        })}
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm">
        <p className="p-2 rounded bg-slate-200 dark:bg-slate-700">a ≡ {result.aClass} (mod {modulus})</p>
        <p className="p-2 rounded bg-slate-200 dark:bg-slate-700">b ≡ {result.bClass} (mod {modulus})</p>
        <p className="p-2 rounded bg-emerald-100 dark:bg-emerald-900/30">(a+b) mod n = {result.add}</p>
        <p className="p-2 rounded bg-emerald-100 dark:bg-emerald-900/30">(a*b) mod n = {result.mult}</p>
      </div>
    </div>
  )
}
