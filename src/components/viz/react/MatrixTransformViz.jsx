import { useState, useRef, useEffect, useCallback } from 'react';

const W = 360, H = 320, CX = 180, CY = 160, SC = 52;
const toS = (x, y) => [CX + x * SC, CY - y * SC];

const PRESETS = [
  { label: 'Identity',    a:1, b:0, c:0, d:1 },
  { label: 'Scale 2×',   a:2, b:0, c:0, d:2 },
  { label: 'Shear →',    a:1, b:1, c:0, d:1 },
  { label: 'Rotate 45°', a:0.707, b:-0.707, c:0.707, d:0.707 },
  { label: 'Reflect X',  a:1, b:0, c:0, d:-1 },
  { label: 'Project→X',  a:1, b:0, c:0, d:0 },
  { label: 'Squeeze',    a:2, b:0, c:0, d:0.5 },
];

const STEPS = [
  {
    title: 'The Input: Standard Grid',
    body: 'Every matrix is a machine that transforms space. Here is the standard grid — the starting point before any matrix is applied. The red vector is [1,0] (i-hat) and green is [0,1] (j-hat). Everything moves with them.',
    mode: 't',
  },
  {
    title: 'Matrix Columns = Destinations of Basis Vectors',
    body: 'Column 1 [a,c] tells you where [1,0] lands. Column 2 [b,d] tells you where [0,1] lands. All other vectors follow by linear combinations. This completely defines the transformation.',
    mode: 't',
  },
  {
    title: 'The Unit Circle → An Ellipse',
    body: 'The unit circle (all unit vectors) transforms into an ellipse. The lengths of the ellipse axes are the singular values — they reveal how much the matrix stretches or squishes space in each direction.',
    mode: 'c',
  },
  {
    title: 'Determinant = Area Scaling',
    body: 'The unit square transforms into a parallelogram. Its area equals |det(M)|. If det = 0, the parallelogram collapses to a line (singular matrix). If det < 0, orientation flips.',
    mode: 'a',
  },
];

function Grid({ a, b, c, d, t }) {
  const interp = (v0, v1) => v0 + (v1 - v0) * t;
  const ta = interp(1, a), tb = interp(0, b), tc = interp(0, c), td = interp(1, d);
  const tf = (x, y) => [ta * x + tb * y, tc * x + td * y];
  const lines = [];
  for (let i = -3; i <= 3; i++) {
    const [ax, ay] = toS(...tf(i, -3)), [bx, by] = toS(...tf(i, 3));
    const [cx2, cy2] = toS(...tf(-3, i)), [dx2, dy2] = toS(...tf(3, i));
    lines.push(<line key={`v${i}`} x1={ax} y1={ay} x2={bx} y2={by} stroke="#334155" strokeWidth="0.6" opacity="0.35" />);
    lines.push(<line key={`h${i}`} x1={cx2} y1={cy2} x2={dx2} y2={dy2} stroke="#334155" strokeWidth="0.6" opacity="0.35" />);
  }
  return <g>{lines}</g>;
}

function UnitCircle({ a, b, c, d, t }) {
  const interp = (v0, v1) => v0 + (v1 - v0) * t;
  const ta = interp(1, a), tb = interp(0, b), tc = interp(0, c), td = interp(1, d);
  const pts = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const θ = (i / N) * 2 * Math.PI;
    const ox = Math.cos(θ), oy = Math.sin(θ);
    const [sx, sy] = toS(ta * ox + tb * oy, tc * ox + td * oy);
    pts.push(`${sx},${sy}`);
  }
  return <polyline points={pts.join(' ')} fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.85" />;
}

function UnitSquare({ a, b, c, d, t }) {
  const interp = (v0, v1) => v0 + (v1 - v0) * t;
  const ta = interp(1, a), tb = interp(0, b), tc = interp(0, c), td = interp(1, d);
  const corners = [[0,0],[1,0],[1,1],[0,1]].map(([x,y]) => {
    const [sx, sy] = toS(ta * x + tb * y, tc * x + td * y);
    return `${sx},${sy}`;
  });
  return <polygon points={corners.join(' ')} fill="#f59e0b" fillOpacity="0.18" stroke="#f59e0b" strokeWidth="2" />;
}

function Arrow({ x1, y1, x2, y2, color, w = 2.5 }) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len, hl = 9;
  const hx = x2 - ux * hl, hy = y2 - uy * hl;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx - uy * 4.5},${hy + ux * 4.5} ${hx + uy * 4.5},${hy - ux * 4.5}`} fill={color} />
    </g>
  );
}

export default function MatrixTransformViz() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState(1.5); const [b, setB] = useState(0.5);
  const [c, setC] = useState(0.2); const [d, setD] = useState(1.2);
  const [t, setT] = useState(1);
  const animRef = useRef(null);
  const s = STEPS[step];

  const interp = (v0, v1) => v0 + (v1 - v0) * t;
  const ta = interp(1, a), tb = interp(0, b), tc = interp(0, c), td = interp(1, d);
  const [ox, oy] = toS(0, 0);
  const [i1x, i1y] = toS(ta, tc);
  const [j1x, j1y] = toS(tb, td);

  const det = (a * d - b * c).toFixed(2);

  const animateTo = useCallback((target) => {
    cancelAnimationFrame(animRef.current);
    const start = performance.now();
    const from = t;
    const dur = 600;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setT(from + (target - from) * ease);
      if (p < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [t]);

  const applyPreset = (p) => { setA(p.a); setB(p.b); setC(p.c); setD(p.d); animateTo(1); };

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 select-none">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Matrix Transformation Explorer</h3>
          <span className="text-xs text-slate-400">{step+1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_,i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i===step?'bg-violet-500':i<step?'bg-violet-300 dark:bg-violet-700':'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <p className="font-semibold text-violet-600 dark:text-violet-400 mb-1 text-sm">{s.title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.body}</p>
        </div>
      </div>

      {/* Matrix input */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-slate-400 font-mono">M =</span>
          <div className="grid grid-cols-2 gap-1">
            {[['a',a,setA],['b',b,setB],['c',c,setC],['d',d,setD]].map(([lbl,val,fn]) => (
              <div key={lbl} className="flex flex-col items-center">
                <span className="text-[9px] text-slate-400 font-mono">{lbl}</span>
                <input type="number" value={val} step="0.1"
                  onChange={e => fn(parseFloat(e.target.value)||0)}
                  className="w-14 text-center text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-0.5" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">det = {det}</span>
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">i→[{ta.toFixed(1)},{tc.toFixed(1)}]</span>
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">j→[{tb.toFixed(1)},{td.toFixed(1)}]</span>
        </div>

        <div className="ml-auto flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-400 font-mono">t =</span>
            <input type="range" min="0" max="1" step="0.01" value={t}
              onChange={e => setT(parseFloat(e.target.value))}
              className="w-20 accent-violet-500" />
          </div>
          <button onClick={() => animateTo(t < 0.5 ? 1 : 0)}
            className="text-[10px] bg-violet-600 text-white rounded px-2 py-1 hover:bg-violet-700">
            {t < 0.5 ? 'Apply ▶' : 'Reset ◀'}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1 mb-3">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p)}
            className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          <Grid a={a} b={b} c={c} d={d} t={t} />

          {/* Axes */}
          <line x1={10} y1={CY} x2={W-10} y2={CY} stroke="#94a3b8" strokeWidth="1" />
          <line x1={CX} y1={10} x2={CX} y2={H-10} stroke="#94a3b8" strokeWidth="1" />

          {s.mode === 'c' && <UnitCircle a={a} b={b} c={c} d={d} t={t} />}
          {s.mode === 'a' && <UnitSquare a={a} b={b} c={c} d={d} t={t} />}

          {/* Basis vectors */}
          <Arrow x1={ox} y1={oy} x2={i1x} y2={i1y} color="#ef4444" />
          <Arrow x1={ox} y1={oy} x2={j1x} y2={j1y} color="#22c55e" />

          {/* Labels */}
          <text x={i1x+6} y={i1y} fontSize="11" fontWeight="700" fill="#ef4444">î</text>
          <text x={j1x+6} y={j1y} fontSize="11" fontWeight="700" fill="#22c55e">ĵ</text>
          <circle cx={ox} cy={oy} r="3" fill="#475569" />

          {s.mode === 'a' && (
            <text x={CX+4} y={CY-4} fontSize="10" fontFamily="monospace" fill="#f59e0b">
              area = |{det}|
            </text>
          )}
        </svg>
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0,s-1))} disabled={step===0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={() => setStep(s => Math.min(STEPS.length-1,s+1))} disabled={step===STEPS.length-1}
          className="px-4 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
