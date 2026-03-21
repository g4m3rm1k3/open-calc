import { useMemo, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 760
const H = 320
const X_MIN = -4
const X_MAX = 4

function sx(x) {
  return 40 + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 80)
}

function sy(y, yMin, yMax) {
  return 30 + ((yMax - y) / (yMax - yMin || 1)) * (H - 90)
}

function evalPoly(a, b, c, d, x) {
  return a * x * x * x + b * x * x + c * x + d
}

function evalD1(a, b, c, x) {
  return 3 * a * x * x + 2 * b * x + c
}

function evalD2(a, b, x) {
  return 6 * a * x + 2 * b
}

function signLabel(v) {
  if (Math.abs(v) < 1e-9) return '0'
  return v > 0 ? '+' : '-'
}

function classifyAt(a, b, c, x0) {
  const left = evalD1(a, b, c, x0 - 0.1)
  const right = evalD1(a, b, c, x0 + 0.1)
  if (left > 0 && right < 0) return 'local max'
  if (left < 0 && right > 0) return 'local min'
  return 'neither (flat or saddle)'
}

function SignRow({ cuts, fn }) {
  const edges = [X_MIN, ...cuts, X_MAX]
  return (
    <div className="flex items-center gap-2 text-xs">
      {edges.slice(0, -1).map((l, i) => {
        const r = edges[i + 1]
        const m = (l + r) / 2
        return (
          <div key={`${l}-${r}`} className="rounded border border-slate-300 px-2 py-1 bg-white dark:bg-slate-900 min-w-[74px] text-center">
            <div className="text-slate-500">({l.toFixed(2)}, {r.toFixed(2)})</div>
            <div className="font-semibold">{signLabel(fn(m))}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function SignChartBuilder() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(-1)
  const [c, setC] = useState(-3)
  const [d, setD] = useState(1)

  const data = useMemo(() => {
    const points = []
    let yMin = Infinity
    let yMax = -Infinity
    for (let x = X_MIN; x <= X_MAX; x += 0.04) {
      const y = evalPoly(a, b, c, d, x)
      points.push([x, y])
      yMin = Math.min(yMin, y)
      yMax = Math.max(yMax, y)
    }
    const pad = 0.12 * (yMax - yMin || 1)

    const disc = 4 * b * b - 12 * a * c
    const critical = []
    if (disc >= 0 && Math.abs(a) > 1e-9) {
      const r = Math.sqrt(disc)
      critical.push((-2 * b - r) / (6 * a))
      critical.push((-2 * b + r) / (6 * a))
    }
    const critFiltered = critical
      .filter((x) => Number.isFinite(x) && x > X_MIN && x < X_MAX)
      .sort((x, y) => x - y)
      .filter((x, i, arr) => i === 0 || Math.abs(x - arr[i - 1]) > 1e-5)

    const infl = Math.abs(a) > 1e-9 ? -b / (3 * a) : null

    return {
      points,
      yMin: yMin - pad,
      yMax: yMax + pad,
      critical: critFiltered,
      inflection: infl,
      disc,
    }
  }, [a, b, c, d])

  const path = data.points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${sx(x)} ${sy(y, data.yMin, data.yMax)}`)
    .join(' ')

  return (
    <div>
      <svg width="100%" viewBox={"0 0 " + W + " " + H}>
        <line x1={sx(X_MIN)} y1={sy(0, data.yMin, data.yMax)} x2={sx(X_MAX)} y2={sy(0, data.yMin, data.yMax)} stroke="#94a3b8" />
        <line x1={sx(0)} y1={sy(data.yMin, data.yMin, data.yMax)} x2={sx(0)} y2={sy(data.yMax, data.yMin, data.yMax)} stroke="#94a3b8" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.2" />

        {data.critical.map((x) => {
          const y = evalPoly(a, b, c, d, x)
          return (
            <g key={`c-${x}`}>
              <circle cx={sx(x)} cy={sy(y, data.yMin, data.yMax)} r="4" fill="#ef4444" />
              <text x={sx(x) + 6} y={sy(y, data.yMin, data.yMax) - 7} fontSize="11" fill="#7f1d1d">
                c={x.toFixed(2)}
              </text>
            </g>
          )
        })}

        {data.inflection !== null && data.inflection > X_MIN && data.inflection < X_MAX && (
          <g>
            <line x1={sx(data.inflection)} y1={30} x2={sx(data.inflection)} y2={H - 60} stroke="#10b981" strokeDasharray="4,4" />
            <text x={sx(data.inflection) + 6} y={44} fontSize="11" fill="#065f46">
              inflection x={data.inflection.toFixed(2)}
            </text>
          </g>
        )}
      </svg>

      <div className="px-4 space-y-1">
        <SliderControl label="a (cubic term)" min={-2} max={2} step={0.1} value={a} onChange={(v) => setA(Math.abs(v) < 0.05 ? 0.1 : v)} />
        <SliderControl label="b (quadratic term)" min={-4} max={4} step={0.1} value={b} onChange={setB} />
        <SliderControl label="c (linear term)" min={-6} max={6} step={0.1} value={c} onChange={setC} />
        <SliderControl label="d (constant term)" min={-4} max={4} step={0.1} value={d} onChange={setD} />
      </div>

      <div className="px-4 mt-2 text-sm">
        <div className="font-medium">Sign chart for f'(x)</div>
        <SignRow cuts={data.critical} fn={(x) => evalD1(a, b, c, x)} />
      </div>

      <div className="px-4 mt-2 text-sm">
        <div className="font-medium">Sign chart for f''(x)</div>
        <SignRow cuts={data.inflection !== null ? [data.inflection] : []} fn={(x) => evalD2(a, b, x)} />
      </div>

      <div className="px-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
        {data.critical.length === 0 && <div>No real critical points from f' (discriminant {'<'} 0).</div>}
        {data.critical.map((x) => (
          <div key={`k-${x}`}>
            x={x.toFixed(3)}: {classifyAt(a, b, c, x)}
          </div>
        ))}
      </div>
    </div>
  )
}
