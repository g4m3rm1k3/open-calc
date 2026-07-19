import { useState } from 'react'

// Grammar: E -> E+E | E*E | id   (deliberately ambiguous, same example as the lesson's static diagram)
const PATHS = {
  A: {
    label: 'Path A — group + first',
    finalTree: { op: '*', left: { op: '+', left: 'id', right: 'id' }, right: 'id' },
    steps: [
      { string: 'E', rule: 'start' },
      { string: 'E*E', rule: 'E → E*E  (expand root as *)' },
      { string: 'E+E*E', rule: 'E → E+E  (expand leftmost E)' },
      { string: 'id+E*E', rule: 'E → id' },
      { string: 'id+id*E', rule: 'E → id' },
      { string: 'id+id*id', rule: 'E → id' },
    ],
  },
  B: {
    label: 'Path B — group × first',
    finalTree: { op: '+', left: 'id', right: { op: '*', left: 'id', right: 'id' } },
    steps: [
      { string: 'E', rule: 'start' },
      { string: 'E+E', rule: 'E → E+E  (expand root as +)' },
      { string: 'id+E', rule: 'E → id  (expand leftmost E)' },
      { string: 'id+E*E', rule: 'E → E*E  (expand remaining E)' },
      { string: 'id+id*E', rule: 'E → id' },
      { string: 'id+id*id', rule: 'E → id' },
    ],
  },
}

function TreeNode({ node, revealed }) {
  if (!revealed) return <div className="w-10 h-10 rounded border-2 border-dashed border-slate-300 dark:border-slate-600" />
  if (typeof node === 'string') {
    return (
      <div className="px-3 py-1.5 rounded bg-emerald-500 text-white text-sm font-mono font-bold">
        {node}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-mono font-bold">
        {node.op}
      </div>
      <div className="flex gap-4">
        <TreeNode node={node.left} revealed={revealed} />
        <TreeNode node={node.right} revealed={revealed} />
      </div>
    </div>
  )
}

export default function GrammarDerivationLab() {
  const [path, setPath] = useState('A')
  const [step, setStep] = useState(0)

  const current = PATHS[path]
  const isFinal = step === current.steps.length - 1

  const handlePathChange = (key) => {
    setPath(key)
    setStep(0)
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-1">Grammar Derivation Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Grammar: <span className="font-mono">E → E+E | E*E | id</span>. Same ambiguous grammar as the diagram above — step through two different leftmost derivations of <span className="font-mono">"id+id*id"</span> and watch them build two different parse trees.
      </p>

      <div className="flex gap-2 mb-4">
        {Object.entries(PATHS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => handlePathChange(key)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${path === key ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Derivation so far</p>
        <ol className="space-y-1">
          {current.steps.slice(0, step + 1).map((s, i) => (
            <li key={i} className={`text-sm font-mono px-3 py-1.5 rounded border ${i === step ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
              <span className="text-slate-400 mr-2">{i}.</span>
              {s.string}
              <span className="text-slate-400 ml-3 text-xs">{s.rule}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setStep((s) => Math.min(s + 1, current.steps.length - 1))}
          disabled={isFinal}
          className="px-3 py-1.5 rounded text-sm font-medium bg-emerald-600 text-white disabled:opacity-40"
        >
          Apply Next Rule →
        </button>
        <button
          onClick={() => setStep(0)}
          className="px-3 py-1.5 rounded text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          Reset
        </button>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
          Parse tree {isFinal ? '(complete)' : '(fills in once the derivation finishes)'}
        </p>
        <div className="flex justify-center p-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
          <TreeNode node={current.finalTree} revealed={isFinal} />
        </div>
      </div>
    </div>
  )
}
