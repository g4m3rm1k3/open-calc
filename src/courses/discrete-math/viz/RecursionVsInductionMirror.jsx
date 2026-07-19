import { useState, useEffect, useRef } from 'react'

const N = 5

export default function RecursionVsInductionMirror() {
  const [step, setStep] = useState(0) // 0 = idle, 1..N = depth reached (recursion) / height proven (induction)
  const [playing, setPlaying] = useState(false)
  const [phase, setPhase] = useState('down') // recursion: 'down' unwinding to base case, 'up' returning values
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!playing) return
    intervalRef.current = setInterval(() => {
      setStep(s => {
        if (phase === 'down') {
          if (s < N) return s + 1
          setPhase('up')
          return s
        } else {
          if (s > 0) return s - 1
          setPlaying(false)
          return 0
        }
      })
    }, 650)
    return () => clearInterval(intervalRef.current)
  }, [playing, phase])

  function run() {
    setStep(0)
    setPhase('down')
    setPlaying(true)
  }
  function reset() {
    setPlaying(false)
    setStep(0)
    setPhase('down')
  }

  // Recursion levels shown top (n) to bottom (base case)
  const recursionLevels = Array.from({ length: N }, (_, i) => N - i) // [5,4,3,2,1]
  // Induction levels shown bottom (base) to top (n)
  const inductionLevels = Array.from({ length: N }, (_, i) => i + 1) // [1,2,3,4,5]

  const recursionActiveDepth = phase === 'down' ? step : N - (N - step) // during down: active = step; during up: everything down to (N-step)+1 collapsed
  const collapsedUpTo = phase === 'up' ? N - step : 0

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      <div className="text-center mb-5">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Two Mirrors: Recursion and Induction</h3>
        <p className="text-slate-400 text-sm">Computing f({N}) by recursion (left) vs. proving P({N}) by induction (right) — same structure, opposite direction.</p>
      </div>

      <div className="flex justify-center gap-3 mb-6">
        <button onClick={run} disabled={playing} className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-bold text-sm">
          {playing ? 'Running…' : 'Run Both'}
        </button>
        <button onClick={reset} className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-sm">
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recursion side — unwinds downward, then collapses back up */}
        <div className="bg-slate-950 rounded-lg border border-slate-700 p-4">
          <p className="text-center text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-3">Recursion (unwinds downward)</p>
          <div className="space-y-1.5">
            {recursionLevels.map(n => {
              const reached = phase === 'down' ? n >= N - step + 1 : true
              const collapsed = phase === 'up' && n > N - collapsedUpTo
              const isBase = n === 1
              return (
                <div
                  key={n}
                  className={`px-3 py-2 rounded font-mono text-xs border transition-all ${
                    !reached ? 'opacity-20 border-slate-800 text-slate-600' :
                    collapsed ? 'bg-emerald-950/50 border-emerald-600 text-emerald-300' :
                    isBase && reached ? 'bg-amber-950/50 border-amber-500 text-amber-300' :
                    'bg-sky-950/40 border-sky-700 text-sky-300'
                  }`}
                  style={{ marginLeft: `${(N - n) * 12}px` }}
                >
                  f({n}) {isBase && reached ? '← base case, hardcoded' : n < N ? 'calls f(' + (n - 1) + ')' : ''}
                </div>
              )
            })}
          </div>
        </div>

        {/* Induction side — propagates upward from base case */}
        <div className="bg-slate-950 rounded-lg border border-slate-700 p-4">
          <p className="text-center text-[11px] font-bold uppercase tracking-wider text-violet-400 mb-3">Induction (propagates upward)</p>
          <div className="space-y-1.5 flex flex-col-reverse">
            {inductionLevels.map(k => {
              const proven = phase === 'down' ? k <= N - step : true
              const isBase = k === 1
              return (
                <div
                  key={k}
                  className={`px-3 py-2 rounded font-mono text-xs border transition-all ${
                    !proven ? 'opacity-20 border-slate-800 text-slate-600' :
                    isBase ? 'bg-amber-950/50 border-amber-500 text-amber-300' :
                    'bg-violet-950/40 border-violet-700 text-violet-300'
                  }`}
                  style={{ marginLeft: `${(k - 1) * 12}px` }}
                >
                  P({k}) {isBase && proven ? '← base case, verified directly' : proven ? '← proven from P(' + (k - 1) + ')' : ''}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <p className="text-center text-slate-500 text-xs mt-4 italic">
        {phase === 'down' && playing ? 'Recursion unwinding to the base case; induction has not started propagating yet.' :
         phase === 'up' && playing ? 'Recursion is collapsing back up with real values; induction propagates upward in lockstep.' :
         'Recursion computes top-down then returns bottom-up. Induction proves bottom-up only — but both rely on the exact same base case + step structure.'}
      </p>
    </div>
  )
}
