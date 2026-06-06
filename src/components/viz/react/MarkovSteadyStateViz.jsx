import { useState, useRef, useEffect, useCallback } from 'react';

// 4-state Markov chain: Idle, Cutting, Cooling, Error
// Column-stochastic transition matrix (each column sums to 1)
const RAW_P = [
  [0.70, 0.10, 0.20, 0.05],
  [0.20, 0.70, 0.10, 0.10],
  [0.05, 0.15, 0.60, 0.10],
  [0.05, 0.05, 0.10, 0.75],
];

// Normalize each column to sum to 1
function normalizeP(raw) {
  const P = raw.map(r => [...r]);
  for (let c = 0; c < 4; c++) {
    const s = P.reduce((acc, r) => acc + r[c], 0);
    for (let r = 0; r < 4; r++) P[r][c] /= s;
  }
  return P;
}

const P = normalizeP(RAW_P);

// Matrix-vector multiply
function mvMul(M, v) {
  return M.map(row => row.reduce((s, x, j) => s + x * v[j], 0));
}

const STATES = ['Idle', 'Cutting', 'Cooling', 'Error'];
const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#ef4444'];
const NODE_POS = [
  { x: 120, y: 80 },
  { x: 250, y: 80 },
  { x: 250, y: 210 },
  { x: 120, y: 210 },
];

const STEPS = [
  {
    title: 'Machine states',
    body: 'A CNC machine cycles through four states: Idle, Cutting, Cooling, and Error. The directed graph shows transition probabilities between states. Each node\'s outgoing edges sum to 1.',
  },
  {
    title: 'The transition matrix P',
    body: 'Column j of P gives the probabilities of leaving state j. Each column sums to 1 — this is called column-stochastic. P encodes the complete dynamics of the system.',
  },
  {
    title: 'Power iteration: π_{n+1} = P·π_n',
    body: 'Start with a uniform distribution. Each "Iterate" click applies one multiplication by P. Watch the bars! After enough iterations, the distribution converges to the steady-state π* — regardless of where you started.',
  },
  {
    title: 'Why λ=1? The steady-state eigenvector',
    body: 'The steady state π* satisfies P·π* = π* — it\'s an eigenvector with eigenvalue λ=1. Multiplying by P doesn\'t change it. This vector describes where the machine spends most of its long-run time.',
  },
];

const INITIAL_PI = [0.25, 0.25, 0.25, 0.25];

// Soft-check convergence
function hasConverged(prev, curr) {
  return prev.every((v, i) => Math.abs(v - curr[i]) < 5e-4);
}

// Compute steady state via many iterations
function computeSteadyState() {
  let v = [0.25, 0.25, 0.25, 0.25];
  for (let i = 0; i < 500; i++) v = mvMul(P, v);
  return v;
}

const STEADY_STATE = computeSteadyState();

export default function MarkovSteadyStateViz() {
  const [step, setStep] = useState(0);
  const [pi, setPi] = useState([...INITIAL_PI]);
  const [iterCount, setIterCount] = useState(0);
  const [converged, setConverged] = useState(false);
  const [displayPi, setDisplayPi] = useState([...INITIAL_PI]);
  const animRef = useRef(null);

  const animate = useCallback((from, to) => {
    cancelAnimationFrame(animRef.current);
    const start = performance.now();
    const dur = 400;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setDisplayPi(from.map((f, i) => f + (to[i] - f) * ease));
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else setDisplayPi([...to]);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const iterate = () => {
    const next = mvMul(P, pi);
    const conv = hasConverged(pi, next);
    animate(pi, next);
    setPi(next);
    setIterCount(n => n + 1);
    if (conv) setConverged(true);
  };

  const reset = (startDist) => {
    const sd = startDist || [...INITIAL_PI];
    setPi(sd);
    animate(displayPi, sd);
    setIterCount(0);
    setConverged(false);
  };

  const BAR_W = 50, BAR_MAX_H = 100, BAR_Y = 170;
  const BAR_XS = [28, 100, 172, 244];

  const colSum = (col) => P.reduce((s, r) => s + r[col], 0);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 select-none">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Markov Steady State</h3>
          <span className="text-xs text-slate-400">{step + 1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i === step ? 'bg-purple-500' : i < step ? 'bg-purple-300 dark:bg-purple-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <p className="font-semibold text-purple-600 dark:text-purple-400 mb-1 text-sm">{STEPS[step].title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{STEPS[step].body}</p>
        </div>
      </div>

      {/* Stage 0: State graph */}
      {step === 0 && (
        <div className="flex justify-center mb-3">
          <svg width={360} height={295} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
            {/* Edges (selected transitions) */}
            {[
              [0,1,P[1][0],'0.20'], [1,0,P[0][1],'0.10'],
              [1,2,P[2][1],'0.15'], [2,1,P[1][2],'0.10'],
              [2,3,P[3][2],'0.10'], [3,2,P[2][3],'0.10'],
              [3,0,P[0][3],'0.05'], [0,3,P[3][0],'0.05'],
              [0,2,P[2][0],'0.05'], [1,3,P[3][1],'0.05'],
            ].map(([from, to, prob, label], ei) => {
              const f = NODE_POS[from], t = NODE_POS[to];
              const dx = t.x - f.x, dy = t.y - f.y;
              const len = Math.hypot(dx, dy);
              const r = 22;
              const sx = f.x + (dx / len) * r;
              const sy = f.y + (dy / len) * r;
              const ex = t.x - (dx / len) * r;
              const ey = t.y - (dy / len) * r;
              const mx = (sx + ex) / 2 + (dy / len) * (from < to ? -16 : 16);
              const my = (sy + ey) / 2 - (dx / len) * (from < to ? -16 : 16);
              const col = COLORS[from];
              const ux = (ex - sx) / Math.hypot(ex - sx, ey - sy);
              const uy = (ey - sy) / Math.hypot(ex - sx, ey - sy);
              const hl = 8, hx = ex - ux * hl, hy = ey - uy * hl;
              return (
                <g key={ei} opacity="0.75">
                  <path d={`M${sx},${sy} Q${mx},${my} ${ex},${ey}`} fill="none" stroke={col} strokeWidth="1.5" />
                  <polygon points={`${ex},${ey} ${hx - uy * 4},${hy + ux * 4} ${hx + uy * 4},${hy - ux * 4}`} fill={col} />
                  <text x={(sx+ex)/2 + (dy/len)*-18} y={(sy+ey)/2 - (dx/len)*-18} fontSize="9" fill={col} fontWeight="600">{label}</text>
                </g>
              );
            })}
            {/* Self-loops */}
            {NODE_POS.map((pos, i) => (
              <g key={`sl${i}`}>
                <ellipse cx={pos.x + (i%2===0?-30:30)} cy={pos.y + (i<2?-25:25)} rx={16} ry={10}
                  fill="none" stroke={COLORS[i]} strokeWidth="1.5" opacity="0.5" strokeDasharray="4,3" />
                <text x={pos.x + (i%2===0?-48:32)} y={pos.y + (i<2?-28:30)} fontSize="9" fill={COLORS[i]} opacity="0.8">
                  {P[i][i].toFixed(2)}
                </text>
              </g>
            ))}
            {/* Nodes */}
            {NODE_POS.map((pos, i) => (
              <g key={i}>
                <circle cx={pos.x} cy={pos.y} r={22} fill={COLORS[i]} fillOpacity="0.15" stroke={COLORS[i]} strokeWidth="2.5" />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS[i]}>{STATES[i]}</text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Stage 1: Matrix display */}
      {step === 1 && (
        <div className="flex justify-center mb-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 inline-block">
            <div className="text-[10px] text-slate-400 font-mono mb-2 text-center">P (column-stochastic: each column sums to 1)</div>
            <table className="font-mono text-xs border-collapse">
              <thead>
                <tr>
                  <td className="w-8"></td>
                  {STATES.map((s, j) => (
                    <td key={j} className="text-center w-16 pb-1 font-semibold" style={{ color: COLORS[j] }}>{s}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {P.map((row, i) => (
                  <tr key={i}>
                    <td className="text-[9px] text-slate-400 pr-1 text-right">{STATES[i]}</td>
                    {row.map((v, j) => (
                      <td key={j} className="text-center py-0.5 px-1 rounded"
                        style={{ color: COLORS[i], background: `${COLORS[j]}12` }}>
                        {v.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="text-[9px] text-slate-400 pr-1 text-right">Σ</td>
                  {[0,1,2,3].map(j => (
                    <td key={j} className="text-center text-[9px] pt-1 text-green-600 dark:text-green-400 font-bold">
                      {colSum(j).toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stages 2-3: Bar chart + controls */}
      {step >= 2 && (
        <>
          <div className="flex justify-center mb-3">
            <svg width={320} height={200} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1.0].map(v => {
                const y = BAR_Y - v * BAR_MAX_H;
                return (
                  <g key={v}>
                    <line x1={10} y1={y} x2={310} y2={y} stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4" />
                    <text x={6} y={y + 3} fontSize="8" fill="#94a3b8" textAnchor="end">{v.toFixed(2)}</text>
                  </g>
                );
              })}
              {/* Steady state markers */}
              {STEADY_STATE.map((v, i) => {
                const y = BAR_Y - v * BAR_MAX_H;
                const cx = BAR_XS[i] + BAR_W / 2;
                return <line key={`ss${i}`} x1={cx - BAR_W/2 + 2} y1={y} x2={cx + BAR_W/2 - 2} y2={y}
                  stroke={COLORS[i]} strokeWidth="2" strokeDasharray="6,4" opacity="0.5" />;
              })}
              {/* Bars */}
              {displayPi.map((v, i) => {
                const h = Math.max(1, v * BAR_MAX_H);
                const y = BAR_Y - h;
                return (
                  <g key={i}>
                    <rect x={BAR_XS[i]} y={y} width={BAR_W} height={h}
                      fill={COLORS[i]} rx={4} opacity="0.85" />
                    <text x={BAR_XS[i] + BAR_W / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS[i]}>
                      {(v * 100).toFixed(1)}%
                    </text>
                    <text x={BAR_XS[i] + BAR_W / 2} y={BAR_Y + 14} textAnchor="middle" fontSize="9" fill={COLORS[i]}>
                      {STATES[i]}
                    </text>
                  </g>
                );
              })}
              {/* Axis */}
              <line x1={10} y1={BAR_Y} x2={310} y2={BAR_Y} stroke="#94a3b8" strokeWidth="1" />
              {/* Converged badge */}
              {converged && (
                <g>
                  <rect x={100} y={8} width={120} height={22} rx={6} fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" />
                  <text x={160} y={23} textAnchor="middle" fontSize="10" fontWeight="700" fill="#7e22ce">🎯 Converged!</text>
                </g>
              )}
            </svg>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <button onClick={iterate}
              className="text-sm bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 transition-colors font-semibold">
              Iterate ▶
            </button>
            <button onClick={() => reset([...INITIAL_PI])}
              className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-purple-400 transition-colors">
              Reset uniform
            </button>
            <button onClick={() => reset([0, 0, 0, 1])}
              className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-purple-400 transition-colors">
              Start: all Error
            </button>
            <button onClick={() => reset([1, 0, 0, 0])}
              className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-purple-400 transition-colors">
              Start: all Idle
            </button>
            <span className="ml-auto text-[9px] font-mono text-slate-400">iter = {iterCount}</span>
          </div>
        </>
      )}

      {/* Live formula panel */}
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3 font-mono text-[10px] text-slate-600 dark:text-slate-300 space-y-1">
        {step >= 2 && (
          <>
            <div>π = [{pi.map(v => v.toFixed(3)).join(', ')}]</div>
            <div className="text-purple-600 dark:text-purple-400">π* = [{STEADY_STATE.map(v => v.toFixed(3)).join(', ')}]</div>
            {step === 3 && <div className="text-amber-600 dark:text-amber-400">P·π* = π*  (λ=1 eigenvector)</div>}
            <div className="text-slate-400 italic">
              {!converged ? 'Try: click Iterate 10× — watch convergence' : 'Converged! Same π* regardless of start — try Reset.'}
            </div>
          </>
        )}
        {step < 2 && (
          <div className="text-slate-400 italic">
            {step === 0 ? 'Each arrow weight is the transition probability from one state to another' : 'Each column of P is a probability distribution (sums to 1)'}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
