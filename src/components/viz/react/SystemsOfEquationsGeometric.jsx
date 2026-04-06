import React, { useState } from 'react';

const W = 320, H = 280, CX = 160, CY = 140, SCALE = 40;
function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }

function Grid() {
  const lines = [];
  for (let i = -4; i <= 4; i++) {
    const [sx] = toScreen(i, 0); const [, sy] = toScreen(0, i);
    lines.push(<line key={`v${i}`} x1={sx} y1={10} x2={sx} y2={H-10} stroke="#e2e8f0" strokeWidth="1"/>);
    lines.push(<line key={`h${i}`} x1={10} y1={sy} x2={W-10} y2={sy} stroke="#e2e8f0" strokeWidth="1"/>);
    if (i !== 0) {
      lines.push(<text key={`lx${i}`} x={sx} y={CY+14} fontSize="10" fill="#94a3b8" textAnchor="middle">{i}</text>);
      lines.push(<text key={`ly${i}`} x={CX-8} y={sy+4} fontSize="10" fill="#94a3b8" textAnchor="end">{i}</text>);
    }
  }
  return <g>{lines}</g>;
}

// Line: ax + by = c → y = (c - ax)/b (if b≠0), or x = c/a (if b=0)
function linePts(a, b, c) {
  if (Math.abs(b) < 0.01) {
    const x = c / a;
    return [toScreen(x, -4), toScreen(x, 4)];
  }
  const y1 = (c - a * (-4)) / b, y2 = (c - a * 4) / b;
  return [toScreen(-4, y1), toScreen(4, y2)];
}

function intersect(a1, b1, c1, a2, b2, c2) {
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 0.001) return null;
  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  return [x, y];
}

export default function SystemsOfEquationsGeometric() {
  const [a1, setA1] = useState(1), [b1, setB1] = useState(-1), [c1, setC1] = useState(1);
  const [a2, setA2] = useState(2), [b2, setB2] = useState(1), [c2, setC2] = useState(4);

  const [[x1a, y1a], [x1b, y1b]] = linePts(a1, b1, c1);
  const [[x2a, y2a], [x2b, y2b]] = linePts(a2, b2, c2);
  const sol = intersect(a1, b1, c1, a2, b2, c2);

  const det = a1 * b2 - a2 * b1;
  const parallel = Math.abs(det) < 0.001;
  // Check if same line
  const sameLine = parallel && Math.abs(a1 * c2 - a2 * c1) < 0.001 && Math.abs(b1 * c2 - b2 * c1) < 0.001;

  const status = sameLine ? 'infinite' : parallel ? 'none' : 'unique';

  let statusText, statusColor;
  if (status === 'unique') { statusText = `Unique solution: (${sol[0].toFixed(2)}, ${sol[1].toFixed(2)})`; statusColor = '#10b981'; }
  else if (status === 'none') { statusText = 'No solution — parallel lines never meet'; statusColor = '#ef4444'; }
  else { statusText = 'Infinite solutions — same line'; statusColor = '#f59e0b'; }

  const controls = [
    ['a₁', a1, setA1, '#6366f1'], ['b₁', b1, setB1, '#6366f1'], ['c₁', c1, setC1, '#6366f1'],
    ['a₂', a2, setA2, '#10b981'], ['b₂', b2, setB2, '#10b981'], ['c₂', c2, setC2, '#10b981'],
  ];

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Two Lines — Three Cases</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        Adjust the equations a₁x + b₁y = c₁ and a₂x + b₂y = c₂. The solution to the system is where the lines cross.
      </p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid/>
          <line x1={CX} y1={10} x2={CX} y2={H-10} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={10} y1={CY} x2={W-10} y2={CY} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={x1a} y1={y1a} x2={x1b} y2={y1b} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
          <text x={x1b-20} y={y1b-8} fontSize="11" fill="#6366f1" fontWeight="600">{a1}x+{b1}y={c1}</text>
          <line x1={x2a} y1={y2a} x2={x2b} y2={y2b} stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
          <text x={x2b-20} y={y2b+16} fontSize="11" fill="#10b981" fontWeight="600">{a2}x+{b2}y={c2}</text>
          {sol && Math.abs(sol[0]) <= 3.5 && Math.abs(sol[1]) <= 3.5 && (
            <>
              <circle cx={toScreen(sol[0],sol[1])[0]} cy={toScreen(sol[0],sol[1])[1]} r="7" fill="#f59e0b" stroke="white" strokeWidth="2"/>
            </>
          )}
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {controls.map(([label, val, set, color]) => (
          <div key={label} className="flex items-center gap-1">
            <span className="text-xs font-mono w-7" style={{color}}>{label}=</span>
            <input type="range" min="-3" max="5" step="0.5" value={val}
              onChange={e => set(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/>
            <span className="text-xs font-mono w-6 text-right text-slate-500">{val}</span>
          </div>
        ))}
      </div>
      <div className={`rounded-lg px-3 py-2 text-sm text-center font-semibold border ${
        status==='unique' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' :
        status==='none' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' :
        'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
      }`}>{statusText}</div>
    </div>
  );
}
