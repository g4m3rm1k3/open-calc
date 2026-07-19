import { useState } from 'react'

const N = 6

export default function StrongVsWeakInductionViz() {
  const [mode, setMode] = useState('weak') // 'weak' | 'strong'
  const [target, setTarget] = useState(0) // which domino we're trying to push next (0 = none pushed)

  function pushNext() {
    if (target >= N) return
    setTarget(t => t + 1)
  }
  function reset() {
    setTarget(0)
  }

  // Weak induction: pushing domino k+1 only "succeeds" if exactly domino k is standing/fallen right before it (single support).
  // Strong induction: pushing domino k+1 draws on the combined weight of ALL prior fallen dominoes.
  const weakCanPush = target >= 1 // only ever uses the single immediately-prior domino
  const strongSupport = target // in strong mode, support = number of prior fallen dominoes (grows)

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      <div className="text-center mb-5">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Weak vs. Strong Induction: How Much Weight Pushes the Next Domino</h3>
        <p className="text-slate-400 text-sm">Weak induction uses only the single domino right before it. Strong induction uses the combined weight of everything already fallen.</p>
      </div>

      <div className="flex justify-center gap-2 mb-5">
        <button
          onClick={() => { setMode('weak'); reset() }}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${mode === 'weak' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          Weak Induction
        </button>
        <button
          onClick={() => { setMode('strong'); reset() }}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${mode === 'strong' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          Strong Induction
        </button>
      </div>

      <div className="bg-slate-950 rounded-lg border border-slate-700 p-6 mb-5">
        <div className="flex items-end justify-center gap-3 h-32">
          {Array.from({ length: N }, (_, i) => i + 1).map(n => {
            const fallen = n <= target
            const isNext = n === target + 1
            return (
              <div key={n} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 rounded-sm border-2 flex items-end justify-center pb-1 text-[10px] font-bold transition-all duration-300 ${
                    fallen ? 'h-16 bg-emerald-600 border-emerald-400 text-emerald-950 rotate-[65deg] translate-x-3' :
                    isNext ? 'h-24 bg-amber-500 border-amber-300 text-amber-950 animate-pulse' :
                    'h-24 bg-slate-700 border-slate-500 text-slate-300'
                  }`}
                  style={{ transformOrigin: 'bottom right' }}
                >
                  {n}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="text-center mb-4">
        {mode === 'weak' ? (
          <p className="text-sky-300 text-sm">
            To push domino <span className="font-bold">{Math.min(target + 1, N)}</span>, weak induction may use only domino{' '}
            <span className="font-bold">{target}</span> — one unit of "weight." If domino {target + 1}'s claim actually needs
            information from further back (like Fibonacci needing both k and k−1), a single prior domino isn't enough to push it.
          </p>
        ) : (
          <p className="text-violet-300 text-sm">
            To push domino <span className="font-bold">{Math.min(target + 1, N)}</span>, strong induction may draw on the combined
            weight of all <span className="font-bold">{strongSupport}</span> prior fallen dominoes — enough support for claims that
            depend on any earlier value, not just the one immediately before it.
          </p>
        )}
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={pushNext}
          disabled={target >= N}
          className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-bold text-sm"
        >
          Push Domino {Math.min(target + 1, N)}
        </button>
        <button onClick={reset} className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-sm">
          Reset
        </button>
      </div>
    </div>
  )
}
