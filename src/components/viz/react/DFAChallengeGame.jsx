import { useMemo, useState } from 'react'

const NODES = {
  q0: { x: 80, y: 120, accept: true },
  q1: { x: 220, y: 120, accept: false },
}

const TRANSITIONS = {
  q0: { '0': 'q0', '1': 'q1' },
  q1: { '0': 'q1', '1': 'q0' },
}

function classify(str) {
  let state = 'q0'
  const trace = ['q0']
  for (const ch of str) {
    if (ch !== '0' && ch !== '1') return { valid: false, accepted: false, trace }
    state = TRANSITIONS[state][ch]
    trace.push(state)
  }
  return { valid: true, accepted: NODES[state].accept, trace }
}

function randomBinary(length) {
  let out = ''
  for (let i = 0; i < length; i += 1) out += Math.random() < 0.5 ? '0' : '1'
  return out
}

export default function DFAChallengeGame() {
  const [input, setInput] = useState('1011')
  const [reveal, setReveal] = useState(false)

  const result = useMemo(() => classify(input), [input])
  const finalState = result.trace[result.trace.length - 1]

  const challengeBank = [
    { label: 'Accepting string (odd 1s?)', target: false },
    { label: 'Rejecting string (odd 1s?)', target: true },
  ]

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <h3 className="text-lg font-semibold mb-2">DFA Pattern Challenge</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        This machine accepts strings with an even number of 1s. Play as a state-machine debugger.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm font-medium">
          Input string
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setReveal(false)
            }}
            className="ml-2 p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono"
            placeholder="e.g. 10110"
          />
        </label>
        <button
          onClick={() => setReveal((r) => !r)}
          className="px-3 py-1 rounded text-sm bg-brand-500 text-white"
        >
          {reveal ? 'Hide Trace' : 'Show Trace'}
        </button>
        <button
          onClick={() => {
            setInput(randomBinary(5 + Math.floor(Math.random() * 3)))
            setReveal(false)
          }}
          className="px-3 py-1 rounded text-sm bg-emerald-500 text-white"
        >
          Random Test
        </button>
      </div>

      <svg viewBox="0 0 300 230" className="w-full rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 mb-4">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <polygon points="0,0 8,4 0,8" fill="#64748b" />
          </marker>
        </defs>

        <path d="M 104 78 C 150 45, 150 45, 196 78" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="150" y="50" textAnchor="middle" className="fill-slate-600 text-xs font-semibold">1</text>

        <path d="M 196 162 C 150 195, 150 195, 104 162" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="150" y="205" textAnchor="middle" className="fill-slate-600 text-xs font-semibold">1</text>

        <path d="M 58 120 C 25 82, 25 158, 58 120" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="22" y="122" textAnchor="middle" className="fill-slate-600 text-xs font-semibold">0</text>

        <path d="M 242 120 C 275 82, 275 158, 242 120" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="278" y="122" textAnchor="middle" className="fill-slate-600 text-xs font-semibold">0</text>

        {Object.entries(NODES).map(([id, n]) => {
          const active = finalState === id
          return (
            <g key={id}>
              {n.accept && <circle cx={n.x} cy={n.y} r={30} fill="none" stroke="#0f172a" strokeWidth="2" />}
              <circle
                cx={n.x}
                cy={n.y}
                r={24}
                fill={active ? '#f97316' : '#cbd5e1'}
                stroke="#0f172a"
                strokeWidth="2"
                style={{ transition: 'fill 250ms ease' }}
              />
              <text x={n.x} y={n.y + 5} textAnchor="middle" className="fill-slate-900 text-sm font-bold">{id}</text>
            </g>
          )
        })}

        <line x1="8" y1="120" x2="52" y2="120" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="16" y="110" className="fill-slate-600 text-xs">start</text>
      </svg>

      {!result.valid ? (
        <p className="text-sm font-semibold text-red-500">Use only 0 and 1 in the input string.</p>
      ) : (
        <div className="text-sm space-y-1 mb-3">
          <p>
            <span className="font-semibold">Result:</span> {result.accepted ? 'Accept' : 'Reject'}
          </p>
          <p>
            <span className="font-semibold">Reason:</span> final state {finalState} is {NODES[finalState].accept ? 'accepting' : 'non-accepting'}.
          </p>
          {reveal && (
            <p>
              <span className="font-semibold">State trace:</span> {result.trace.join(' -> ')}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 p-3 rounded bg-slate-100 dark:bg-slate-800 text-sm">
        <p className="font-semibold mb-1">Quick puzzle prompts</p>
        {challengeBank.map((c) => (
          <p key={c.label} className="text-slate-600 dark:text-slate-300">- {c.label}</p>
        ))}
      </div>
    </div>
  )
}
