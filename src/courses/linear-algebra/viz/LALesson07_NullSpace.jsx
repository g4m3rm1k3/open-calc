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

// M has a non-trivial null space: [2, -1, 0; 4, -2, 0] but 2D version:
// Use M = [1, 2; 2, 4] — singular, null space is span{[-2, 1]}
// Column space is span{[1, 2]}
const M = [1, 2, 2, 4]; // row1=[1,2], row2=[2,4]

// Null space direction: M·x = 0 → x = t·[-2, 1]
const nullDir = [-2, 1];
const nullLen = Math.sqrt(5);
const nullUnit = [-2 / nullLen, 1 / nullLen];

// Column space = span of column 1 = [1, 2], column 2 = [2, 4] (same direction)
const colDir = [1, 2];
const colLen = Math.sqrt(5);
const colUnit = [1 / colLen, 2 / colLen];

const STEPS = [
  {
    title: 'What a Matrix Does to Vectors',
    body: 'This matrix M = [[1,2],[2,4]] maps 2D vectors to 2D vectors — but because its rows are proportional, it collapses everything onto a single line. Some information is lost. We need language to describe what goes where.',
    formula: 'M = [[1, 2], [2, 4]]     det(M) = 0',
    phase: 'input',
  },
  {
    title: 'The Null Space: Vectors That Vanish',
    body: 'The null space of M is the set of all vectors x where Mx = 0. For this matrix, any multiple of [-2, 1] maps to the zero vector. The null space is a whole line through the origin — an entire direction that M destroys.',
    formula: 'null(M) = {x : Mx = 0} = span{[-2, 1]}',
    phase: 'null',
  },
  {
    title: 'The Column Space: Where Outputs Land',
    body: 'The column space (or image) of M is the set of all possible outputs Mx as x ranges over all inputs. Because M collapses the plane, its column space is just a line — span of [1, 2]. This is the range of M.',
    formula: 'col(M) = span{[1,2],[2,4]} = span{[1, 2]}',
    phase: 'col',
  },
  {
    title: 'Rank + Nullity = Dimension',
    body: 'The Rank-Nullity Theorem connects these: rank(M) + nullity(M) = n (number of columns). Here rank = 1 (one independent column), nullity = 1 (one null direction), and n = 2. The null space tells you what is "hidden." The column space tells you what is "reachable."',
    formula: 'rank + nullity = n     →     1 + 1 = 2',
    phase: 'both',
  },
];

export default function LALesson07_NullSpace() {
  const [step, setStep] = useState(0);
  const [t, setT] = useState(0.8);
  const s = STEPS[step];

  const [ox, oy] = toScreen(0, 0);

  // a point in the null space
  const nx = t * nullDir[0], ny = t * nullDir[1];
  const [nsx, nsy] = toScreen(nx, ny);
  // apply M to null space vector → should be ~0
  const MNx = M[0] * nx + M[1] * ny;
  const MNy = M[2] * nx + M[3] * ny;

  // a general vector
  const gx = 1, gy = 0.5;
  const [gsx, gsy] = toScreen(gx, gy);
  const Mgx = M[0] * gx + M[1] * gy;
  const Mgy = M[2] * gx + M[3] * gy;
  const [mgsx, mgsy] = toScreen(Mgx, Mgy);

  // null space line
  const nullLine = [toScreen(-3 * nullUnit[0], -3 * nullUnit[1]), toScreen(3 * nullUnit[0], 3 * nullUnit[1])];
  // col space line
  const colLine = [toScreen(-2 * colUnit[0], -2 * colUnit[1]), toScreen(2 * colUnit[0], 2 * colUnit[1])];

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Null Space &amp; Column Space</h3>
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

      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" />

          {/* null space line */}
          {(s.phase === 'null' || s.phase === 'both') && (
            <>
              <line x1={nullLine[0][0]} y1={nullLine[0][1]} x2={nullLine[1][0]} y2={nullLine[1][1]}
                stroke="#ef4444" strokeWidth="2" strokeDasharray="8,4" opacity="0.7" />
              <text x={nullLine[1][0] + 6} y={nullLine[1][1]} fontSize="11" fill="#ef4444" fontWeight="600">null(M)</text>
            </>
          )}

          {/* column space line */}
          {(s.phase === 'col' || s.phase === 'both') && (
            <>
              <line x1={colLine[0][0]} y1={colLine[0][1]} x2={colLine[1][0]} y2={colLine[1][1]}
                stroke="#10b981" strokeWidth="2.5" opacity="0.7" />
              <text x={colLine[1][0] + 6} y={colLine[1][1] - 6} fontSize="11" fill="#10b981" fontWeight="600">col(M)</text>
            </>
          )}

          {/* null space vector → 0 */}
          {s.phase === 'null' && (
            <>
              <Arrow x1={ox} y1={oy} x2={nsx} y2={nsy} color="#ef4444" width={2.5} />
              <text x={nsx + 6} y={nsy - 4} fontSize="11" fill="#ef4444" fontWeight="600">n</text>
              <text x={ox + 8} y={oy - 8} fontSize="11" fill="#ef4444">M·n ≈ 0</text>
              <circle cx={ox} cy={oy} r="8" fill="#ef4444" opacity="0.2" />
            </>
          )}

          {/* general vector → col space */}
          {(s.phase === 'col' || s.phase === 'both') && (
            <>
              <Arrow x1={ox} y1={oy} x2={gsx} y2={gsy} color="#6366f1" width={2.5} />
              <text x={gsx + 6} y={gsy - 4} fontSize="11" fill="#6366f1" fontWeight="600">x</text>
              <Arrow x1={ox} y1={oy} x2={mgsx} y2={mgsy} color="#10b981" width={2.5} />
              <text x={mgsx + 6} y={mgsy - 4} fontSize="11" fill="#10b981" fontWeight="600">Mx</text>
            </>
          )}

          <circle cx={ox} cy={oy} r="3" fill="#475569" />

          <text x={10} y={H - 12} fontSize="10" fontFamily="monospace" fill="#94a3b8">M = [[1,2],[2,4]]</text>
        </svg>
      </div>

      {s.phase === 'null' && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-sm font-mono w-8 text-red-500">t =</span>
          <input type="range" min="-2" max="2" step="0.1" value={t}
            onChange={e => setT(parseFloat(e.target.value))} className="flex-1 accent-red-500" />
          <span className="text-xs font-mono w-10 text-right text-slate-500">{t.toFixed(1)}</span>
        </div>
      )}

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
