import { useState } from 'react'

const LINES = [
  { text: 'P(n): 1 + 2 + 3 + ... + n = n(n+1)/2', section: 'Define P(n)', color: 'sky', note: 'The exact claim, stated precisely, before any proof work begins.' },
  { text: 'Base case (n = 1): LHS = 1, RHS = 1(2)/2 = 1. Equal. ✓', section: 'Base Case', color: 'emerald', note: 'The starting domino — verified directly by arithmetic, not assumed.' },
  { text: 'Assume P(k) is true for some arbitrary k ≥ 1:', section: 'Inductive Hypothesis', color: 'amber', note: '"Arbitrary" matters — this cannot be a specific number, or the proof only covers that one case.' },
  { text: '  1 + 2 + ... + k = k(k+1)/2', section: 'Inductive Hypothesis', color: 'amber', note: 'This is what P(k) says, written out in full so it can be substituted later.' },
  { text: 'Show P(k+1): 1 + 2 + ... + k + (k+1) = (k+1)(k+2)/2', section: 'Inductive Step (goal)', color: 'rose', note: 'State the target before manipulating anything — you need to know exactly what "matching" looks like.' },
  { text: '  = [1 + 2 + ... + k] + (k+1)', section: 'Inductive Step (setup)', color: 'rose', note: 'Isolate the part of the expression that matches the inductive hypothesis exactly.' },
  { text: '  = k(k+1)/2 + (k+1)   [by inductive hypothesis]', section: 'Inductive Step (substitution)', color: 'rose', note: 'The critical moment: P(k) is substituted in. Every valid induction proof has a line that looks like this.' },
  { text: '  = (k+1)(k/2 + 1) = (k+1)(k+2)/2 ✓', section: 'Inductive Step (simplify)', color: 'rose', note: 'Algebra brings the expression to match the P(k+1) target stated above.' },
  { text: 'Therefore, by induction, P(n) holds for all n ≥ 1. ∎', section: 'Conclusion', color: 'violet', note: 'Closes the logical loop: base case + inductive step + the induction principle license the claim for every n.' },
]

const COLOR_MAP = {
  sky: 'border-sky-500 bg-sky-950/50 text-sky-300',
  emerald: 'border-emerald-500 bg-emerald-950/50 text-emerald-300',
  amber: 'border-amber-500 bg-amber-950/50 text-amber-300',
  rose: 'border-rose-500 bg-rose-950/50 text-rose-300',
  violet: 'border-violet-500 bg-violet-950/50 text-violet-300',
}

export default function ProofBlueprintAnnotator() {
  const [active, setActive] = useState(null)

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      <div className="text-center mb-5">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Anatomy of a Written Proof</h3>
        <p className="text-slate-400 text-sm">Click any line to see which section it belongs to and why it's there.</p>
      </div>

      <div className="font-mono text-sm space-y-1 max-w-2xl mx-auto mb-5">
        {LINES.map((line, i) => (
          <button
            key={i}
            onClick={() => setActive(active === i ? null : i)}
            className={`block w-full text-left px-3 py-2 rounded border transition-colors ${
              active === i ? COLOR_MAP[line.color] : 'border-transparent bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {line.text}
          </button>
        ))}
      </div>

      {active !== null ? (
        <div className={`max-w-2xl mx-auto rounded-lg border p-4 ${COLOR_MAP[LINES[active].color]}`}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1">{LINES[active].section}</p>
          <p className="text-slate-200 text-sm">{LINES[active].note}</p>
        </div>
      ) : (
        <p className="text-center text-slate-500 text-xs italic">Select a line above to see its role in the proof.</p>
      )}
    </div>
  )
}
