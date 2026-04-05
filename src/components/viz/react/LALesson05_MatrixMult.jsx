import React, { useState } from 'react';

const W = 340, H = 300, CX = 170, CY = 150, SCALE = 50;

function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }

function Arrow({ x1, y1, x2, y2, color, width = 2.5, dashed = false }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;
  const ux = dx / len, uy = dy / len;
  const headLen = 9;
  const hx = x2 - ux * headLen, hy = y2 - uy * headLen;
  const perpX = -uy * 5, perpY = ux * 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width}
        strokeDasharray={dashed ? '6,4' : undefined} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + perpX},${hy + perpY} ${hx - perpX},${hy - perpY}`} fill={color} />
    </g>
  );
}

function Grid() {
  const lines = [];
  for (let i = -3; i <= 3; i++) {
    const [sx] = toScreen(i, 0); const [, sy] = toScreen(0, i);
    lines.push(<line key={`v${i}`} x1={sx} y1={10} x2={sx} y2={H - 10} stroke="#e2e8f0" strokeWidth="1" />);
    lines.push(<line key={`h${i}`} x1={10} y1={sy} x2={W - 10} y2={sy} stroke="#e2e8f0" strokeWidth="1" />);
  }
  return <g>{lines}</g>;
}

function matMul(A, B) {
  const [a, b, c, d] = A, [e, f, g, h] = B;
  return [a * e + b * g, a * f + b * h, c * e + d * g, c * f + d * h];
}

function applyMat(M, x, y) {
  return [M[0] * x + M[1] * y, M[2] * x + M[3] * y];
}

// B = shear, A = rotation
const B = [1, 0.8, 0, 1]; // shear
const A = [0, -1, 1, 0];  // rotate 90°
const AB = matMul(A, B);

const STEPS = [
  {
    title: 'Apply B First: Shear',
    body: 'Start with a vector x (the gold arrow). Apply matrix B first — a shear that slants the vector rightward. This gives Bx (blue).',
    formula: 'Step 1: apply B  →  Bx',
    phase: 1,
  },
  {
    title: 'Then Apply A: Rotate',
    body: 'Now apply A to the result Bx. Matrix A rotates by 90°. The composition A(Bx) (red) is the result of applying B then A — two transformations in sequence.',
    formula: 'Step 2: apply A  →  A(Bx)',
    phase: 2,
  },
  {
    title: 'The Composition: AB',
    body: 'The product AB is a single matrix that does BOTH steps at once. Applying AB directly to x gives the same result as B then A. This is the key insight: matrix multiplication is function composition.',
    formula: '(AB)x = A(Bx)  — one matrix, same result',
    phase: 3,
  },
  {
    title: 'Order Matters: AB ≠ BA',
    body: 'Matrix multiplication is NOT commutative. "Rotate then shear" gives a different result than "shear then rotate." Try it: AB (shear then rotate) vs BA (rotate then shear) are different matrices.',
    formula: 'AB ≠ BA  in general  (non-commutative!)',
    phase: 4,
  },
];

const VECTORS = [[1, 0.5], [0.8, -0.6], [-0.4, 1.2]];

export default function LALesson05_MatrixMult() {
  const [step, setStep] = useState(0);
  const [vecIdx, setVecIdx] = useState(0);
  const s = STEPS[step];

  const [vx, vy] = VECTORS[vecIdx];
  const Bx = applyMat(B, vx, vy);
  const ABx = applyMat(AB, vx, vy);
  const BA = matMul(B, A);
  const BAx = applyMat(BA, vx, vy);

  const [ox, oy] = toScreen(0, 0);
  const [v0x, v0y] = toScreen(vx, vy);
  const [bx, by] = toScreen(Bx[0], Bx[1]);
  const [abx, aby] = toScreen(ABx[0], ABx[1]);
  const [bax, bay] = toScreen(BAx[0], BAx[1]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Matrix Multiplication</h3>
          <span className="text-xs text-slate-400">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i === step ? 'bg-violet-500' : i < step ? 'bg-violet-300 dark:bg-violet-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <p className="font-semibold text-violet-600 dark:text-violet-400 mb-1">{s.title}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{s.body}</p>
          <p className="mt-2 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-center text-slate-800 dark:text-slate-200">{s.formula}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {VECTORS.map(([x, y], i) => (
          <button key={i} onClick={() => setVecIdx(i)}
            className={`px-3 py-1 rounded text-xs font-mono ${i === vecIdx ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
            x = [{x}, {y}]
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" />

          {/* original x */}
          <Arrow x1={ox} y1={oy} x2={v0x} y2={v0y} color="#f59e0b" width={3} />
          <text x={v0x + 6} y={v0y - 4} fontSize="12" fill="#f59e0b" fontWeight="700">x</text>

          {/* Bx */}
          {s.phase >= 1 && (
            <>
              <Arrow x1={ox} y1={oy} x2={bx} y2={by} color="#6366f1" width={2.5} />
              <text x={bx + 6} y={by - 4} fontSize="12" fill="#6366f1" fontWeight="600">Bx</text>
            </>
          )}

          {/* ABx */}
          {s.phase >= 2 && (
            <>
              <Arrow x1={ox} y1={oy} x2={abx} y2={aby} color="#ef4444" width={2.5} />
              <text x={abx + 6} y={aby - 4} fontSize="12" fill="#ef4444" fontWeight="600">A(Bx)</text>
            </>
          )}

          {/* (AB)x same as ABx */}
          {s.phase === 3 && (
            <circle cx={abx} cy={aby} r="8" fill="none" stroke="#10b981" strokeWidth="2" />
          )}

          {/* BAx for comparison */}
          {s.phase === 4 && (
            <>
              <Arrow x1={ox} y1={oy} x2={bax} y2={bay} color="#10b981" width={2.5} dashed />
              <text x={bax + 6} y={bay + 4} fontSize="12" fill="#10b981" fontWeight="600">BAx</text>
            </>
          )}

          <circle cx={ox} cy={oy} r="3" fill="#475569" />

          {/* labels */}
          <text x={12} y={H - 24} fontSize="10" fill="#6366f1" fontFamily="monospace">B = shear</text>
          <text x={12} y={H - 12} fontSize="10" fill="#ef4444" fontFamily="monospace">A = rotate 90°</text>
        </svg>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30">
          ← Back
        </button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
