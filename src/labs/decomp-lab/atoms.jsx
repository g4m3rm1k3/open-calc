import { useEffect, useRef } from 'react'
import { GLASS_META } from '../../styles/courseColors.js'
import { fmt } from './mathHelpers.js'

function meta(color) {
  return GLASS_META[color] ?? GLASS_META.violet
}

export function Tag({ children, color = 'violet' }) {
  const m = meta(color)
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-widest uppercase bg-slate-100 dark:bg-white/5 border ${m.border} ${m.text}`}>
      {children}
    </span>
  )
}

export function Def({ term, color = 'violet', children }) {
  const m = meta(color)
  return (
    <div className={`p-3.5 rounded-xl border ${m.border} bg-white/70 dark:bg-white/[0.03] mb-2.5`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Tag color={color}>DEF</Tag>
        <span className={`text-[13px] font-bold font-mono ${m.text}`}>{term}</span>
      </div>
      <div className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  )
}

export function Insight({ label, color = 'green', children }) {
  const m = meta(color)
  return (
    <div className={`p-3.5 rounded-xl border ${m.border} bg-white/70 dark:bg-white/[0.03] mb-2.5`}>
      <div className={`text-[10px] font-bold font-mono tracking-widest uppercase mb-1.5 ${m.text}`}>↳ {label}</div>
      <div className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">{children}</div>
    </div>
  )
}

export function Eq({ children, color = 'violet' }) {
  const m = meta(color)
  return (
    <div className={`font-mono text-[12px] leading-8 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 px-4 py-2.5 overflow-x-auto whitespace-pre mb-2.5 ${m.text}`}>
      {children}
    </div>
  )
}

export function SmallMatrix({ data, color = 'slate', hlDiag = false, label, maxCols = 6 }) {
  const m = meta(color)
  if (!data?.length) return null
  const rows = data.length > 4 ? [data[0], data[1], ['…'], data[data.length - 1]] : data
  const clipCols = data[0]?.length > maxCols
  return (
    <div className="inline-flex flex-col">
      {label && <div className="text-[8px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-1">{label}</div>}
      <div className="font-mono text-[10px] leading-[2]">
        {rows.map((row, ri) => {
          if (row[0] === '…') return <div key={ri} className="pl-3 text-slate-300 dark:text-slate-600">⋮</div>
          const dispRow = clipCols ? [...row.slice(0, 3), '…'] : row
          return (
            <div key={ri} className="flex items-center">
              <span className="text-[13px] mr-0.5 text-slate-300 dark:text-slate-600">{ri === 0 ? '⎡' : ri === rows.length - 1 ? '⎣' : '⎢'}</span>
              {dispRow.map((v, ci) => (
                <span
                  key={ci}
                  className={`min-w-[46px] text-right pr-1 ${hlDiag && ri === ci ? `font-bold ${m.text}` : 'text-slate-600 dark:text-slate-300'}`}
                >
                  {typeof v === 'number' ? fmt(v, 2) : v}
                </span>
              ))}
              <span className="text-[13px] ml-0.5 text-slate-300 dark:text-slate-600">{ri === 0 ? '⎤' : ri === rows.length - 1 ? '⎦' : '⎥'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ImageCanvas({ matrix, width = 260, height = 260, label, badge }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!matrix?.length) return
    const canvas = canvasRef.current
    if (!canvas) return
    const m = matrix.length, n = matrix[0].length
    canvas.width = n
    canvas.height = m
    const ctx = canvas.getContext('2d')
    const id = ctx.createImageData(n, m)
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const v = Math.min(255, Math.max(0, Math.round(matrix[r][c])))
        const idx = 4 * (r * n + c)
        id.data[idx] = v; id.data[idx + 1] = v; id.data[idx + 2] = v; id.data[idx + 3] = 255
      }
    }
    ctx.putImageData(id, 0, 0)
  }, [matrix])
  return (
    <div className="relative inline-block">
      {label && <div className="text-[9px] tracking-widest font-mono text-slate-400 dark:text-slate-500 mb-1">{label}</div>}
      <canvas
        ref={canvasRef}
        style={{ width, height, imageRendering: 'pixelated' }}
        className="block rounded-lg border border-slate-200 dark:border-white/10"
      />
      {badge && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/90 dark:bg-black/80 border border-slate-200 dark:border-white/10 text-[9px] font-mono text-slate-700 dark:text-slate-200">
          {badge}
        </div>
      )}
    </div>
  )
}
