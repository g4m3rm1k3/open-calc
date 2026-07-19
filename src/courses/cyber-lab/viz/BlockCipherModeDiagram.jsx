import { useState } from 'react'

// A real <svg> diagram (arrows, boxes, XOR nodes) rather than styled divs —
// appropriate here because the thing being shown is literally a wiring
// diagram of data flow between blocks, which vector line-art represents
// more precisely than a grid of colored boxes could.
function XorNode({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke="currentColor" strokeWidth="1.5" />
      <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke="currentColor" strokeWidth="1.5" />
    </g>
  )
}

function Block({ x, y, w, h, label, fill }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={fill} stroke="currentColor" strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="13" fontFamily="monospace" fill="currentColor">
        {label}
      </text>
    </g>
  )
}

function Arrow({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
}

function EcbDiagram() {
  const cols = [40, 200, 360]
  return (
    <svg viewBox="0 0 460 220" className="w-full text-slate-700 dark:text-slate-300">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
        </marker>
      </defs>
      {cols.map((x, i) => (
        <g key={i}>
          <Block x={x} y={20} w={80} h={36} label={`P${i + 1}`} fill="none" />
          <Arrow x1={x + 40} y1={56} x2={x + 40} y2={94} />
          <Block x={x} y={96} w={80} h={40} label="AES" fill="rgba(99,102,241,0.12)" />
          <Arrow x1={x + 40} y1={136} x2={x + 40} y2={174} />
          <Block x={x} y={176} w={80} h={36} label={`C${i + 1}`} fill="none" />
        </g>
      ))}
      <text x={230} y={216} textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.7">
        No connection between blocks — identical P means identical C
      </text>
    </svg>
  )
}

function CbcDiagram() {
  const cols = [40, 200, 360]
  const labels = ['IV', 'C1', 'C2']
  return (
    <svg viewBox="0 0 460 240" className="w-full text-slate-700 dark:text-slate-300">
      <defs>
        <marker id="arrowhead2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
        </marker>
      </defs>
      {cols.map((x, i) => (
        <g key={i}>
          <Block x={x} y={10} w={80} h={32} label={`P${i + 1}`} fill="none" />
          <Arrow x1={x + 40} y1={42} x2={x + 40} y2={64} />
          <XorNode x={x + 40} y={76} />
          <Arrow x1={x + 40} y1={86} x2={x + 40} y2={110} />
          <Block x={x} y={112} w={80} h={38} label="AES" fill="rgba(99,102,241,0.12)" />
          <Arrow x1={x + 40} y1={150} x2={x + 40} y2={188} />
          <Block x={x} y={190} w={80} h={34} label={`C${i + 1}`} fill="none" />
          <Block x={x} y={40} w={64} h={0} label="" fill="none" />
        </g>
      ))}
      {/* feed each stage's IV/previous-ciphertext into the next XOR */}
      <text x={40 + 40} y={70} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">{labels[0]}</text>
      <path d="M 80,207 H 160 V 76 H 190" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrowhead2)" strokeDasharray="4 3" />
      <path d="M 240,207 H 320 V 76 H 350" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrowhead2)" strokeDasharray="4 3" />
      <text x={230} y={236} textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.7">
        Each block's ciphertext feeds into the next — identical P no longer means identical C
      </text>
    </svg>
  )
}

export default function BlockCipherModeDiagram({ params = {} }) {
  const [mode, setMode] = useState(params.mode ?? 'ecb')
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('ecb')}
          className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${mode === 'ecb' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
        >
          ECB (unchained)
        </button>
        <button
          onClick={() => setMode('cbc')}
          className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${mode === 'cbc' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
        >
          CBC (chained)
        </button>
      </div>
      {mode === 'ecb' ? <EcbDiagram /> : <CbcDiagram />}
    </div>
  )
}
