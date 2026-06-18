// Inline chart renderer for node graph output nodes

function LinePlotSVG({ inputs, data }) {
  const xs = inputs?.x?.values ?? []
  const ys = inputs?.y?.y ?? inputs?.y?.values ?? []
  if (!xs.length || !ys.length) return <p className="text-slate-400 text-sm text-center py-8">Connect x and y inputs to see the plot</p>

  const W = 380, H = 260, pad = { t: 16, r: 16, b: 36, l: 46 }
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b

  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const yMin = Math.min(...ys), yMax = Math.max(...ys)
  const sx = v => pad.l + ((v - xMin) / (xMax - xMin || 1)) * cW
  const sy = v => pad.t + cH - ((v - yMin) / (yMax - yMin || 1)) * cH

  const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${sx(x).toFixed(1)} ${sy(ys[i]).toFixed(1)}`).join(' ')

  const xTicks = 5
  const yTicks = 5

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-64">
      {/* Grid */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const y = pad.t + (i / yTicks) * cH
        return <line key={i} x1={pad.l} y1={y} x2={pad.l + cW} y2={y} stroke="#e2e8f0" strokeWidth="1" />
      })}
      {/* Axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + cH} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={pad.l} y1={pad.t + cH} x2={pad.l + cW} y2={pad.t + cH} stroke="#94a3b8" strokeWidth="1.5" />
      {/* x ticks */}
      {Array.from({ length: xTicks + 1 }, (_, i) => {
        const v = xMin + (i / xTicks) * (xMax - xMin)
        const x = sx(v)
        return (
          <g key={i}>
            <line x1={x} y1={pad.t + cH} x2={x} y2={pad.t + cH + 4} stroke="#94a3b8" strokeWidth="1" />
            <text x={x} y={pad.t + cH + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">{v.toFixed(1)}</text>
          </g>
        )
      })}
      {/* y ticks */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const v = yMin + (i / yTicks) * (yMax - yMin)
        const y = sy(v)
        return (
          <g key={i}>
            <line x1={pad.l - 4} y1={y} x2={pad.l} y2={y} stroke="#94a3b8" strokeWidth="1" />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v.toFixed(1)}</text>
          </g>
        )
      })}
      {/* Plot line */}
      <path d={pathD} fill="none" stroke={data.color ?? '#6366f1'} strokeWidth="2" strokeLinejoin="round" />
      {/* Label */}
      {data.label && (
        <text x={pad.l + cW / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#64748b">{data.label}</text>
      )}
    </svg>
  )
}

function ScatterSVG({ inputs, data }) {
  const xs = inputs?.x?.values ?? []
  const ys = inputs?.y?.y ?? inputs?.y?.values ?? []
  if (!xs.length || !ys.length) return <p className="text-slate-400 text-sm text-center py-8">Connect x and y inputs</p>

  const W = 380, H = 260, pad = { t: 16, r: 16, b: 36, l: 46 }
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b
  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const yMin = Math.min(...ys), yMax = Math.max(...ys)
  const sx = v => pad.l + ((v - xMin) / (xMax - xMin || 1)) * cW
  const sy = v => pad.t + cH - ((v - yMin) / (yMax - yMin || 1)) * cH
  const r = Number(data.radius ?? 3)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-64">
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + cH} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={pad.l} y1={pad.t + cH} x2={pad.l + cW} y2={pad.t + cH} stroke="#94a3b8" strokeWidth="1.5" />
      {xs.map((x, i) => (
        <circle key={i} cx={sx(x)} cy={sy(ys[i])} r={r} fill={data.color ?? '#f59e0b'} opacity="0.8" />
      ))}
    </svg>
  )
}

function BarChartSVG({ inputs, data }) {
  const vals = inputs?.values?.values ?? inputs?.values?.y ?? []
  if (!vals.length) return <p className="text-slate-400 text-sm text-center py-8">Connect values input</p>

  const W = 380, H = 260, pad = { t: 16, r: 16, b: 36, l: 46 }
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b
  const max = Math.max(...vals.map(Math.abs)) || 1
  const barW = cW / vals.length * 0.7
  const gap = cW / vals.length

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-64">
      <line x1={pad.l} y1={pad.t + cH} x2={pad.l + cW} y2={pad.t + cH} stroke="#94a3b8" strokeWidth="1.5" />
      {vals.map((v, i) => {
        const barH = (Math.abs(v) / max) * cH
        const x = pad.l + i * gap + (gap - barW) / 2
        const y = pad.t + cH - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={data.color ?? '#10b981'} rx="2" opacity="0.85" />
            <text x={x + barW / 2} y={pad.t + cH + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{i + 1}</text>
          </g>
        )
      })}
      {data.title && <text x={pad.l + cW / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#64748b">{data.title}</text>}
    </svg>
  )
}

export default function GraphPreview({ outputs }) {
  if (!outputs.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
        <span className="text-4xl">📈</span>
        <p className="text-slate-400 text-sm">Add an output node (Line Plot, Bar Chart, Scatter) to see a preview</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {outputs.map((out, i) => (
        <div key={i} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
          {out.type === 'linePlot' && <LinePlotSVG inputs={out.inputs} data={out.data} />}
          {out.type === 'scatterPlot' && <ScatterSVG inputs={out.inputs} data={out.data} />}
          {out.type === 'barChart' && <BarChartSVG inputs={out.inputs} data={out.data} />}
        </div>
      ))}
    </div>
  )
}
