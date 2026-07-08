import { fmtNum } from '../mathEngines.js'
import type { Matrix } from '../types'

interface Props {
  vars: Record<string, number | string>
  matVars: Record<string, Matrix>
  onVarClick: (name: string) => void
  onMatVarClick: (mat: Matrix) => void
  onClear: () => void
  ui: Record<string, string>
}

export default function VarStrip({ vars, matVars, onVarClick, onMatVarClick, onClear, ui }: Props) {
  const hasAny = Object.keys(vars).length > 0 || Object.keys(matVars).length > 0
  return (
    <div className={`flex gap-2 px-5 py-1.5 border-b flex-wrap shrink-0 min-h-[32px] items-center ${ui.bg2} ${ui.border}`}>
      {!hasAny
        ? <span className="text-xs text-slate-500 font-mono">vars — type "x = 5" or use STO→ button to store values</span>
        : <>
            {Object.entries(vars).slice(0,20).map(([k,v]) => (
              <button key={k} onClick={() => onVarClick(k)}
                className="flex items-center gap-1.5 text-[11px] font-mono hover:bg-white/10 rounded-md px-2 py-0.5 transition-colors border border-transparent hover:border-white/10">
                <span className="text-brand-300 font-bold">{k}</span>
                <span className="text-slate-600">=</span>
                <span className="text-emerald-400">{typeof v === 'number' ? fmtNum(v) : String(v)}</span>
              </button>
            ))}
            {Object.entries(matVars).slice(0,12).map(([k,mat]) => (
              <button key={`m_${k}`} onClick={() => onMatVarClick(mat)}
                className="flex items-center gap-1 text-[11px] font-mono hover:bg-sky-500/10 rounded-md px-2 py-0.5 transition-colors border border-transparent hover:border-sky-500/20">
                <span className="text-sky-300 font-bold">{k}</span>
                <span className="text-slate-600 text-[10px]">[{(mat as string[][]).length}×{(mat as string[][])[0]?.length}]</span>
              </button>
            ))}
          </>
      }
      {hasAny && (
        <button onClick={onClear} className="ml-auto text-[11px] text-slate-500 hover:text-red-400 font-mono transition-colors">× clear</button>
      )}
    </div>
  )
}
