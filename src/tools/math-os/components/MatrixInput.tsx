import type { Matrix } from '../types'

interface Props {
  matrix: Matrix
  onChange: (m: Matrix) => void
  label?: string
}

export default function MatrixInput({ matrix, onChange, label = 'A' }: Props) {
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 1

  function resize(newRows: number, newCols: number) {
    onChange(Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) => matrix[r]?.[c] ?? '0')
    ))
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-bold text-brand-300 font-mono bg-brand-500/10 px-1.5 py-0.5 rounded">{label}</span>
        <span className="text-xs text-slate-400 font-mono">{rows}×{cols}</span>
        {[2,3,4,5].map(n => (
          <button type="button" key={n} onClick={() => resize(n, n)}
            className={`text-[11px] px-2 py-0.5 rounded-md transition-all font-semibold ${rows===n&&cols===n?'bg-brand-500/20 text-brand-300 border border-brand-500/30':'bg-white/5 hover:bg-white/10 text-slate-400 border border-transparent'}`}>
            {n}²
          </button>
        ))}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-slate-500 font-semibold uppercase tracking-wider">R</span>
          <button type="button" onClick={() => resize(Math.max(1, rows-1), cols)} className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 flex items-center justify-center leading-none transition-colors">−</button>
          <button type="button" onClick={() => resize(Math.min(6, rows+1), cols)} className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 flex items-center justify-center leading-none transition-colors">+</button>
          <span className="text-slate-500 ml-1 font-semibold uppercase tracking-wider">C</span>
          <button type="button" onClick={() => resize(rows, Math.max(1, cols-1))} className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 flex items-center justify-center leading-none transition-colors">−</button>
          <button type="button" onClick={() => resize(rows, Math.min(6, cols+1))} className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 flex items-center justify-center leading-none transition-colors">+</button>
        </div>
        <button type="button" onClick={() => onChange(matrix.map(r => r.map(() => '0')))}
          className="text-[11px] font-semibold px-2 py-0.5 rounded hover:bg-red-500/10 hover:text-red-400 text-slate-500 ml-auto transition-colors">clear</button>
      </div>
      <div className="inline-flex flex-col gap-1.5 p-3 bg-brand-500/5 dark:bg-black/20 rounded-xl border border-slate-200/40 dark:border-white/5 shadow-inner">
        {matrix.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {row.map((cell, c) => (
              <input
                key={c}
                value={cell}
                aria-label={`${label} row ${r + 1} col ${c + 1}`}
                onChange={e => { const m = matrix.map(r2=>[...r2]); m[r][c]=e.target.value; onChange(m) }}
                className="w-12 h-9 text-center text-sm bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-100 font-mono focus:border-brand-400 focus:ring-1 focus:ring-brand-400/50 focus:bg-white/10 focus:outline-none transition-all shadow-inner"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
