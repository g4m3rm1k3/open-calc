import { useState, useMemo } from 'react';
import KatexBlock from '../../math/KatexBlock.jsx';
import KatexInline from '../../math/KatexInline.jsx';

// ─── Riemann Sum Builder ──────────────────────────────────────────────────────
// Teaches how sigma notation becomes a Riemann sum, step by step.
// No prerequisites assumed. Every symbol is explained before it is used.

const FUNCTIONS = [
  { label: 'x²',    fn: x => x * x,            tex: 'x^2',           color: '#a78bfa' },
  { label: 'x',     fn: x => x,                 tex: 'x',             color: '#38bdf8' },
  { label: '2x+1',  fn: x => 2 * x + 1,         tex: '2x+1',          color: '#34d399' },
  { label: 'x³/4',  fn: x => x * x * x / 4,     tex: 'x^3/4',         color: '#fb923c' },
];

const PHASES = [
  { id: 'setup',      label: 'Pick a function',  color: 'violet' },
  { id: 'deltax',     label: 'Δx — slice width', color: 'sky'    },
  { id: 'endpoints',  label: 'Right endpoints',  color: 'amber'  },
  { id: 'rectangles', label: 'Rectangle areas',  color: 'emerald'},
  { id: 'sigma',      label: 'Sigma sum',         color: 'rose'   },
  { id: 'limit',      label: 'Take n → ∞',        color: 'teal'   },
];

const COLOR = {
  violet: { bg: 'bg-violet-950/60', border: 'border-violet-600', text: 'text-violet-300', btn: 'bg-violet-600 hover:bg-violet-500' },
  sky:    { bg: 'bg-sky-950/60',    border: 'border-sky-600',    text: 'text-sky-300',    btn: 'bg-sky-600 hover:bg-sky-500'    },
  amber:  { bg: 'bg-amber-950/60',  border: 'border-amber-600',  text: 'text-amber-300',  btn: 'bg-amber-600 hover:bg-amber-500' },
  emerald:{ bg: 'bg-emerald-950/60',border: 'border-emerald-600',text: 'text-emerald-300',btn: 'bg-emerald-600 hover:bg-emerald-500' },
  rose:   { bg: 'bg-rose-950/60',   border: 'border-rose-600',   text: 'text-rose-300',   btn: 'bg-rose-600 hover:bg-rose-500'   },
  teal:   { bg: 'bg-teal-950/60',   border: 'border-teal-600',   text: 'text-teal-300',   btn: 'bg-teal-600 hover:bg-teal-500'   },
};

// ─── SVG graph with rectangles ────────────────────────────────────────────────
function Graph({ fn, a, b, n, phase, fColor }) {
  const W = 300, H = 180, PAD = 28;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  // scale helpers
  const xs = x => PAD + ((x - a) / (b - a)) * innerW;
  const maxY = useMemo(() => {
    let m = 0.1;
    for (let i = 0; i <= 100; i++) m = Math.max(m, fn(a + (b - a) * i / 100));
    return m * 1.1;
  }, [fn, a, b]);
  const ys = y => PAD + innerH - (y / maxY) * innerH;

  const dx = (b - a) / n;
  const rects = useMemo(() => Array.from({ length: n }, (_, i) => {
    const xi = a + (i + 1) * dx; // right endpoint
    return { x1: a + i * dx, x2: xi, h: fn(xi) };
  }), [fn, a, b, n, dx]);

  // curve path
  const curvePts = Array.from({ length: 200 }, (_, i) => {
    const x = a + (b - a) * i / 199;
    return `${xs(x)},${ys(fn(x))}`;
  }).join(' ');

  const showRects = ['rectangles', 'sigma', 'limit'].includes(phase);
  const showEndpoints = ['endpoints', 'rectangles', 'sigma', 'limit'].includes(phase);
  const showSlices = ['deltax', 'endpoints', 'rectangles', 'sigma', 'limit'].includes(phase);

  return (
    <svg width={W} height={H} className="w-full rounded-lg bg-slate-950 border border-slate-700">
      {/* axes */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD + 4} y2={H - PAD} stroke="#475569" strokeWidth={1.5} />
      <line x1={PAD} y1={PAD - 4} x2={PAD} y2={H - PAD} stroke="#475569" strokeWidth={1.5} />
      <text x={W - PAD + 6} y={H - PAD + 4} fill="#64748b" fontSize={10}>x</text>
      <text x={PAD - 4} y={PAD - 6} fill="#64748b" fontSize={10}>y</text>

      {/* a and b labels */}
      <text x={xs(a)} y={H - PAD + 14} fill="#94a3b8" fontSize={9} textAnchor="middle">a={a}</text>
      <text x={xs(b)} y={H - PAD + 14} fill="#94a3b8" fontSize={9} textAnchor="middle">b={b}</text>

      {/* vertical slice lines */}
      {showSlices && Array.from({ length: n + 1 }, (_, i) => {
        const x = a + i * dx;
        return (
          <line key={i} x1={xs(x)} y1={H - PAD} x2={xs(x)} y2={PAD}
            stroke="#334155" strokeWidth={1} strokeDasharray="3,3" />
        );
      })}

      {/* Δx brace on first slice (only in deltax phase) */}
      {phase === 'deltax' && (
        <>
          <line x1={xs(a)} y1={H - PAD + 10} x2={xs(a + dx)} y2={H - PAD + 10} stroke="#38bdf8" strokeWidth={2} />
          <line x1={xs(a)} y1={H - PAD + 7} x2={xs(a)} y2={H - PAD + 13} stroke="#38bdf8" strokeWidth={2} />
          <line x1={xs(a + dx)} y1={H - PAD + 7} x2={xs(a + dx)} y2={H - PAD + 13} stroke="#38bdf8" strokeWidth={2} />
          <text x={(xs(a) + xs(a + dx)) / 2} y={H - PAD + 22} fill="#38bdf8" fontSize={9} textAnchor="middle">Δx</text>
        </>
      )}

      {/* rectangles */}
      {showRects && rects.map((r, i) => (
        <rect
          key={i}
          x={xs(r.x1) + 0.5}
          y={ys(r.h)}
          width={Math.max(1, xs(r.x2) - xs(r.x1) - 1)}
          height={Math.max(0, H - PAD - ys(r.h))}
          fill={fColor}
          fillOpacity={0.25}
          stroke={fColor}
          strokeOpacity={0.7}
          strokeWidth={1}
        />
      ))}

      {/* right endpoint dots */}
      {showEndpoints && rects.map((r, i) => (
        <circle key={i} cx={xs(r.x2)} cy={ys(r.h)} r={3} fill={fColor} />
      ))}

      {/* function curve — drawn last so it's on top */}
      <polyline points={curvePts} fill="none" stroke={fColor} strokeWidth={2} />

      {/* curve label */}
      <text x={xs(b) - 2} y={ys(fn(b)) - 6} fill={fColor} fontSize={10} textAnchor="end">y = f(x)</text>
    </svg>
  );
}

export default function RiemannSumFromSigma() {
  const [phase, setPhase]   = useState(0);
  const [fIdx, setFIdx]     = useState(0);
  const [n, setN]           = useState(4);
  const [a]                 = useState(0);
  const [b]                 = useState(2);

  const f     = FUNCTIONS[fIdx];
  const dx    = (b - a) / n;
  const phaseId    = PHASES[phase].id;
  const phaseColor = PHASES[phase].color;
  const c     = COLOR[phaseColor];

  const rects = useMemo(() =>
    Array.from({ length: n }, (_, i) => {
      const xi = a + (i + 1) * dx;
      return { i: i + 1, xi: +xi.toFixed(4), height: +f.fn(xi).toFixed(4), area: +(f.fn(xi) * dx).toFixed(4) };
    }), [f, a, b, n, dx]);

  const Rn = rects.reduce((s, r) => s + r.area, 0);

  // Compute higher-n approximation for limit phase
  const bigN = 1000;
  const bigDx = (b - a) / bigN;
  const bigRn = Array.from({ length: bigN }, (_, i) => f.fn(a + (i + 1) * bigDx) * bigDx).reduce((s, v) => s + v, 0);

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-lg p-5 space-y-5 select-none">

      {/* header */}
      <div className="text-center">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Building a Riemann Sum from Sigma Notation</h3>
        <p className="text-slate-400 text-sm">Every symbol explained from scratch — no prior knowledge needed.</p>
      </div>

      {/* controls */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <div className="flex gap-2">
          {FUNCTIONS.map((fn, i) => (
            <button
              key={i}
              onClick={() => setFIdx(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                fIdx === i ? 'text-white border-transparent' : 'border-slate-600 text-slate-400 hover:text-white'
              }`}
              style={fIdx === i ? { background: fn.color, borderColor: fn.color } : {}}
            >
              {fn.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">n =</span>
          <input
            type="range" min={1} max={16} value={n}
            onChange={e => setN(+e.target.value)}
            className="w-32 accent-violet-500"
          />
          <span className="text-white font-bold w-4">{n}</span>
        </div>
      </div>

      {/* graph */}
      <Graph fn={f.fn} a={a} b={b} n={n} phase={phaseId} fColor={f.color} />

      {/* phase progress */}
      <div className="flex gap-1">
        {PHASES.map((p, i) => {
          const cc = COLOR[p.color];
          const done = i <= phase;
          return (
            <button
              key={p.id}
              onClick={() => setPhase(i)}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${
                done ? `${cc.btn} text-white` : 'bg-slate-800 text-slate-500'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-500">
        Step {phase + 1}/{PHASES.length} — <span className={c.text}>{PHASES[phase].label}</span>
      </p>

      {/* ── phase content ────────────────────────────────────────────────── */}
      <div className={`rounded-xl border ${c.border} ${c.bg} p-4 space-y-3 min-h-[140px]`}>

        {phaseId === 'setup' && (
          <>
            <p className="text-white font-bold text-base">We want the area under <KatexInline expr={`f(x) = ${f.tex}`} /> from <KatexInline expr={`x = ${a}`} /> to <KatexInline expr={`x = ${b}`} />.</p>
            <p className="text-slate-300 text-sm">
              The curve is not a straight line — geometry has no formula for this shape. Our strategy: fill the area with <strong className="text-white">{n} thin rectangles</strong> and add their areas.
            </p>
            <p className="text-slate-300 text-sm">
              Choose different functions above with the buttons. Change <strong className="text-white">n</strong> with the slider to see more or fewer rectangles appear in the graph as you progress.
            </p>
            <div className="overflow-x-auto">
              <KatexBlock expr={`\\text{Goal: find } \\int_{${a}}^{${b}} ${f.tex}\\,dx`} />
            </div>
          </>
        )}

        {phaseId === 'deltax' && (
          <>
            <p className="text-white font-bold">Δx — the width of each rectangle</p>
            <p className="text-slate-300 text-sm">
              We cut the interval <KatexInline expr={`[${a}, ${b}]`} /> into <KatexInline expr={`n = ${n}`} /> equal pieces. Each piece has width:
            </p>
            <div className="overflow-x-auto">
              <KatexBlock expr={`\\Delta x = \\frac{b - a}{n} = \\frac{${b} - ${a}}{${n}} = \\frac{${b-a}}{${n}} = ${dx.toFixed(4)}`} />
            </div>
            <p className="text-slate-300 text-sm">
              The graph shows the <span style={{ color: '#38bdf8' }} className="font-bold">Δx brace</span> on the first slice. Every rectangle has this same width.
            </p>
          </>
        )}

        {phaseId === 'endpoints' && (
          <>
            <p className="text-white font-bold">Right endpoints — the height of each rectangle</p>
            <p className="text-slate-300 text-sm">
              For the <em>right</em>-endpoint rule, the height of rectangle <KatexInline expr="i" /> is the function value at the right edge of that slice:
            </p>
            <div className="overflow-x-auto">
              <KatexBlock expr={`x_i = a + i \\cdot \\Delta x = ${a} + i \\cdot ${dx.toFixed(3)}`} />
            </div>
            <div className="overflow-x-auto max-h-32 overflow-y-auto space-y-1 mt-2">
              {rects.map(r => (
                <div key={r.i} className="flex items-center gap-3 text-xs font-mono text-slate-300">
                  <span className="w-12 text-right" style={{ color: f.color }}>i = {r.i}</span>
                  <span>x_{r.i} = {r.xi}</span>
                  <span>→ f({r.xi}) = <strong className="text-white">{r.height}</strong></span>
                </div>
              ))}
            </div>
          </>
        )}

        {phaseId === 'rectangles' && (
          <>
            <p className="text-white font-bold">Rectangle area = height × width</p>
            <p className="text-slate-300 text-sm">
              Each rectangle has height <KatexInline expr="f(x_i)" /> and width <KatexInline expr="\Delta x" />:
            </p>
            <div className="overflow-x-auto">
              <KatexBlock expr={`A_i = f(x_i) \\cdot \\Delta x`} />
            </div>
            <div className="overflow-x-auto max-h-32 overflow-y-auto space-y-1 mt-2">
              {rects.map(r => (
                <div key={r.i} className="flex items-center gap-3 text-xs font-mono text-slate-300">
                  <span className="w-12 text-right" style={{ color: f.color }}>i = {r.i}</span>
                  <span>{r.height} × {dx.toFixed(3)} = <strong className="text-white">{r.area}</strong></span>
                </div>
              ))}
            </div>
          </>
        )}

        {phaseId === 'sigma' && (
          <>
            <p className="text-white font-bold">The Riemann sum — sigma notation</p>
            <p className="text-slate-300 text-sm">
              Add up all <KatexInline expr="n" /> rectangle areas using sigma notation:
            </p>
            <div className="overflow-x-auto">
              <KatexBlock expr={`R_n = \\sum_{i=1}^{${n}} f(x_i)\\,\\Delta x = \\sum_{i=1}^{${n}} f\\!\\left(${a} + i \\cdot \\frac{${b-a}}{${n}}\\right) \\cdot \\frac{${b-a}}{${n}}`} />
            </div>
            <p className="text-slate-300 text-sm">Term by term:</p>
            <div className="text-xs font-mono text-slate-400 flex flex-wrap gap-1">
              {rects.map((r, i) => (
                <span key={i}>
                  <span style={{ color: f.color }}>{r.area}</span>
                  {i < rects.length - 1 ? <span className="text-slate-600"> + </span> : ''}
                </span>
              ))}
              <span className="text-white font-bold"> = {Rn.toFixed(4)}</span>
            </div>
          </>
        )}

        {phaseId === 'limit' && (
          <>
            <p className="text-white font-bold">As n → ∞, the approximation becomes exact</p>
            <p className="text-slate-300 text-sm">
              With more rectangles, each slice is thinner and the sum gets closer to the true area. The definite integral is this limit:
            </p>
            <div className="overflow-x-auto">
              <KatexBlock expr={`\\int_{${a}}^{${b}} ${f.tex}\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i)\\,\\Delta x`} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
              {[4, 20, 1000].map(k => {
                const kDx = (b - a) / k;
                const kRn = Array.from({ length: k }, (_, i) => f.fn(a + (i + 1) * kDx) * kDx).reduce((s, v) => s + v, 0);
                return (
                  <div key={k} className={`rounded-lg border ${c.border} p-2`}>
                    <p className="text-slate-400">n = {k}</p>
                    <p className={`font-bold ${c.text} text-base`}>{kRn.toFixed(4)}</p>
                  </div>
                );
              })}
            </div>
            <p className={`text-sm font-semibold ${c.text} text-center mt-2`}>
              Drag the slider to n = 16 in the graph and watch the rectangles fill the area tightly.
            </p>
          </>
        )}

      </div>

      {/* nav */}
      <div className="flex gap-3">
        <button
          disabled={phase === 0}
          onClick={() => setPhase(p => p - 1)}
          className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold disabled:opacity-30 transition-colors"
        >
          ← Back
        </button>
        <button
          disabled={phase === PHASES.length - 1}
          onClick={() => setPhase(p => p + 1)}
          className={`flex-1 py-2 rounded-lg text-white font-semibold disabled:opacity-30 transition-colors ${c.btn}`}
        >
          Next →
        </button>
      </div>

      {phase === PHASES.length - 1 && (
        <div className="text-center">
          <button onClick={() => setPhase(0)} className="text-xs text-slate-500 hover:text-slate-300 underline">
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
