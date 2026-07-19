import { useState } from 'react'

const SECTIONS = [
  {
    key: 'define',
    label: '1. Define P(n)',
    color: 'sky',
    text: 'Let P(n) be the statement: 1 + 2 + 3 + ... + n = n(n+1)/2.',
    why: 'State the exact claim before doing anything else. A vague statement produces a vague proof — you need a precise target to aim the rest of the proof at.',
  },
  {
    key: 'base',
    label: '2. Base Case',
    color: 'emerald',
    text: 'Prove P(1): LHS = 1. RHS = 1(2)/2 = 1. LHS = RHS. ✓',
    why: 'This is the domino you physically push. Without it, the inductive step only proves dominoes are correctly spaced — nothing ever starts falling.',
  },
  {
    key: 'hypothesis',
    label: '3. Inductive Hypothesis',
    color: 'amber',
    text: 'Assume P(k) is true for some arbitrary integer k ≥ 1: 1 + 2 + ... + k = k(k+1)/2.',
    why: 'This is the fuel for the next step. "Arbitrary" is the key word — you cannot pick a specific k, or the proof only covers that one value.',
  },
  {
    key: 'step',
    label: '4. Inductive Step',
    color: 'rose',
    text: '1 + 2 + ... + k + (k+1) = k(k+1)/2 + (k+1) [by IH] = (k+1)(k+2)/2, which is exactly P(k+1).',
    why: 'You must visibly use the hypothesis from step 3. If your algebra for P(k+1) never touches P(k), you did not perform induction — you did an unrelated direct proof.',
  },
  {
    key: 'conclude',
    label: '5. Conclusion',
    color: 'violet',
    text: 'Therefore, by the Principle of Mathematical Induction, P(n) holds for all integers n ≥ 1. ∎',
    why: 'This sentence is what closes the logical loop: base case + inductive step + the induction principle together license the claim for every n, not just the ones checked.',
  },
]

const COLOR_MAP = {
  sky: { bg: 'bg-sky-950/40', border: 'border-sky-700', text: 'text-sky-300', chip: 'bg-sky-500' },
  emerald: { bg: 'bg-emerald-950/40', border: 'border-emerald-700', text: 'text-emerald-300', chip: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-950/40', border: 'border-amber-700', text: 'text-amber-300', chip: 'bg-amber-500' },
  rose: { bg: 'bg-rose-950/40', border: 'border-rose-700', text: 'text-rose-300', chip: 'bg-rose-500' },
  violet: { bg: 'bg-violet-950/40', border: 'border-violet-700', text: 'text-violet-300', chip: 'bg-violet-500' },
}

export default function InductionTemplateWalkthrough() {
  const [revealed, setRevealed] = useState(0) // how many sections shown so far
  const [selected, setSelected] = useState(null)
  const [wrongPick, setWrongPick] = useState(null)

  const next = SECTIONS[revealed]

  function pickSection(key) {
    if (!next) return
    if (key === next.key) {
      setSelected(key)
      setWrongPick(null)
      setTimeout(() => {
        setRevealed(r => r + 1)
        setSelected(null)
      }, 500)
    } else {
      setWrongPick(key)
      setTimeout(() => setWrongPick(null), 700)
    }
  }

  function reset() {
    setRevealed(0)
    setSelected(null)
    setWrongPick(null)
  }

  const done = revealed >= SECTIONS.length

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      <div className="text-center mb-5">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Fill in the Blanks: The Proof Ritual</h3>
        <p className="text-slate-400 text-sm">Claim: 1 + 2 + ... + n = n(n+1)/2. Click the section that comes next, in order.</p>
      </div>

      {/* Revealed sections so far */}
      <div className="space-y-2 mb-5">
        {SECTIONS.slice(0, revealed).map(s => {
          const c = COLOR_MAP[s.color]
          return (
            <div key={s.key} className={`rounded-lg border ${c.border} ${c.bg} p-3`}>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${c.text} mb-1`}>{s.label}</p>
              <p className="text-slate-200 text-sm font-mono">{s.text}</p>
              <p className="text-slate-400 text-xs mt-1.5 italic">{s.why}</p>
            </div>
          )
        })}
      </div>

      {!done ? (
        <>
          <p className="text-center text-slate-400 text-xs mb-3 uppercase tracking-wider font-bold">Which section comes next?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
            {SECTIONS.map(s => {
              const c = COLOR_MAP[s.color]
              const isDone = SECTIONS.indexOf(s) < revealed
              const isSelected = selected === s.key
              const isWrong = wrongPick === s.key
              if (isDone) return null
              return (
                <button
                  key={s.key}
                  onClick={() => pickSection(s.key)}
                  disabled={isDone}
                  className={`px-4 py-3 rounded-lg border font-bold text-sm transition-all ${
                    isSelected ? `${c.chip} border-transparent text-white scale-95` :
                    isWrong ? 'bg-red-900/50 border-red-500 text-red-300 animate-pulse' :
                    'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <div className="text-center p-4 rounded-lg bg-emerald-900/30 border border-emerald-600">
          <p className="text-emerald-400 font-bold text-sm">Proof complete — all five sections in the correct order.</p>
          <button onClick={reset} className="mt-3 px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold uppercase tracking-wider">
            Run Again
          </button>
        </div>
      )}
    </div>
  )
}
