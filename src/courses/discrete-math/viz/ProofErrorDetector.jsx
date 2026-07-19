import { useState } from 'react'

const CASES = [
  {
    title: 'Case 1',
    lines: [
      'P(n): n < n + 1',
      'Inductive step: assume P(k): k < k+1. Then k+1 < k+2, so P(k+1) holds.',
      'Therefore, by induction, P(n) holds for all n. ∎',
    ],
    options: ['Missing base case', 'Wrong base case', 'Unused hypothesis', 'Circular reasoning', 'Wrong starting point'],
    answer: 'Missing base case',
    explain: 'The inductive step is fine, but there is no base case anywhere — P(1) was never verified. (In this particular example the claim happens to be true, but the proof as written never establishes it: nothing ever "pushes the first domino.")',
  },
  {
    title: 'Case 2',
    lines: [
      'Claim: every triangle has 4 sides.',
      'Base case (n = 3, a "triangle"): assume the claim as given.',
      'Inductive step: if an n-sided shape has n+1 sides... [algebra continues]',
    ],
    options: ['Missing base case', 'Wrong base case', 'Unused hypothesis', 'Circular reasoning', 'Wrong starting point'],
    answer: 'Wrong base case',
    explain: 'The base case asserts the very thing the whole proof is supposed to establish ("assume the claim as given") instead of verifying it independently. A base case must be checked by direct computation, never assumed.',
  },
  {
    title: 'Case 3',
    lines: [
      'P(n): 1 + 2 + ... + n = n² (a false formula, but let\'s follow the "proof")',
      'Base case (n=1): 1 = 1² = 1. ✓',
      'Inductive step: assume P(k). Prove P(k+1) by direct computation: 1+2+...+(k+1) = (k+1)(k+2)/2, and separately note (k+1)² is also a number, so both sides "are numbers." ✓',
    ],
    options: ['Missing base case', 'Wrong base case', 'Unused hypothesis', 'Circular reasoning', 'Wrong starting point'],
    answer: 'Unused hypothesis',
    explain: 'The "inductive step" never actually substitutes P(k) = k² into anything — it computes P(k+1) from scratch and asserts both sides are "numbers," which is vacuous. Since the hypothesis was never used, this is not a valid inductive step, and the false formula slips through undetected.',
  },
  {
    title: 'Case 4',
    lines: [
      'Claim: n² ≥ 3n for all n ≥ 3.',
      'Base case (n=1): 1 ≥ 3? Checked — false, but "we\'ll fix it in the inductive step."',
      'Inductive step: assume true for k, prove for k+1 by the usual algebra.',
    ],
    options: ['Missing base case', 'Wrong base case', 'Unused hypothesis', 'Circular reasoning', 'Wrong starting point'],
    answer: 'Wrong starting point',
    explain: 'The claim is stated for n ≥ 3, but the base case checks n = 1 — the wrong starting value entirely. The base case must match wherever the claim actually begins; checking the wrong n proves nothing about the real claim.',
  },
  {
    title: 'Case 5',
    lines: [
      'Claim: P(k+1) is true.',
      'Proof: Since P(k+1) is true, and P(k) → P(k+1) is what we need, and P(k+1) is true, the implication holds.',
      'Therefore P(k) → P(k+1). ∎',
    ],
    options: ['Missing base case', 'Wrong base case', 'Unused hypothesis', 'Circular reasoning', 'Wrong starting point'],
    answer: 'Circular reasoning',
    explain: 'The "proof" assumes P(k+1) is true in order to prove P(k+1) is true — it never derives the conclusion from the hypothesis P(k) at all. Circular reasoning like this proves nothing, no matter how confident the wording sounds.',
  },
]

export default function ProofErrorDetector() {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)

  const current = CASES[index]
  const isCorrect = picked === current.answer

  function pick(option) {
    if (picked) return
    setPicked(option)
    if (option === current.answer) setScore(s => s + 1)
  }

  function nextCase() {
    setPicked(null)
    setIndex(i => (i + 1) % CASES.length)
  }

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-xl mt-0">Find the Flaw</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score: {score} / {CASES.length}</span>
      </div>
      <p className="text-slate-400 text-sm mb-4">{current.title} of {CASES.length} — this "proof" has exactly one error. Which is it?</p>

      <div className="font-mono text-sm space-y-1.5 mb-5 bg-slate-800/60 rounded-lg p-4">
        {current.lines.map((l, i) => (
          <p key={i} className="text-slate-300">{l}</p>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {current.options.map(opt => {
          const isPicked = picked === opt
          const isAnswer = opt === current.answer
          const showResult = picked !== null
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={picked !== null}
              className={`px-4 py-2.5 rounded-lg border text-sm font-semibold text-left transition-colors ${
                showResult && isAnswer ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300' :
                showResult && isPicked && !isCorrect ? 'bg-red-900/40 border-red-500 text-red-300' :
                'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {picked && (
        <div className={`rounded-lg border p-4 mb-4 ${isCorrect ? 'border-emerald-600 bg-emerald-950/40' : 'border-red-600 bg-red-950/40'}`}>
          <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? 'Correct.' : `Not quite — the actual flaw is "${current.answer}."`}
          </p>
          <p className="text-slate-300 text-sm">{current.explain}</p>
        </div>
      )}

      {picked && (
        <button onClick={nextCase} className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm">
          {index === CASES.length - 1 ? 'Restart from Case 1' : 'Next Case →'}
        </button>
      )}
    </div>
  )
}
