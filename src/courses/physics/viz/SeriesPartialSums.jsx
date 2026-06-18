import { useState, useMemo } from 'react';
import KatexBlock from '../../../components/math/KatexBlock.jsx';
import KatexInline from '../../../components/math/KatexInline.jsx';

// ─── Series Partial Sums Visualizer ──────────────────────────────────────────
// Shows both a_n (terms) and S_N (partial sums) side by side.
// Teaches from scratch: what a partial sum is, why convergence means S_N levels off.

const SERIES = [
  {
    id: 'geometric-half',
    label: 'Σ (1/2)ⁿ',
    desc: 'Geometric, r = 1/2',
    a: n => Math.pow(0.5, n),
    exactSum: 1,
    exactLabel: 'S = 1',
    tex: '\\sum_{n=1}^{\\infty} \\left(\\frac{1}{2}\\right)^n = 1',
    color: '#a78bfa',
    converges: true,
    why: 'Geometric series with r = 1/2. Since |r| < 1, sum = a/(1−r) = (1/2)/(1/2) = 1.',
  },
  {
    id: 'geometric-two-thirds',
    label: 'Σ (2/3)ⁿ',
    desc: 'Geometric, r = 2/3',
    a: n => Math.pow(2/3, n),
    exactSum: 2,
    exactLabel: 'S = 2',
    tex: '\\sum_{n=1}^{\\infty} \\left(\\frac{2}{3}\\right)^n = 2',
    color: '#34d399',
    converges: true,
    why: 'Geometric: a = 2/3, r = 2/3. Sum = (2/3)/(1 − 2/3) = (2/3)/(1/3) = 2.',
  },
  {
    id: 'harmonic',
    label: 'Σ 1/n',
    desc: 'Harmonic — diverges!',
    a: n => 1 / n,
    exactSum: null,
    exactLabel: '→ ∞',
    tex: '\\sum_{n=1}^{\\infty} \\frac{1}{n} = \\infty',
    color: '#f87171',
    converges: false,
    why: 'Even though 1/n → 0, the partial sums grow like ln(N) → ∞. Terms shrink too slowly.',
  },
  {
    id: 'p2',
    label: 'Σ 1/n²',
    desc: 'p-series p=2, converges',
    a: n => 1 / (n * n),
    exactSum: Math.PI * Math.PI / 6,
    exactLabel: 'S = π²/6',
    tex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}',
    color: '#38bdf8',
    converges: true,
    why: 'p-series with p = 2 > 1. Converges to π²/6 ≈ 1.6449 (Euler, 1735).',
  },
  {
    id: 'alternating',
    label: 'Σ (-1)ⁿ⁺¹/n',
    desc: 'Alternating harmonic',
    a: n => Math.pow(-1, n + 1) / n,
    exactSum: Math.log(2),
    exactLabel: 'S = ln 2',
    tex: '\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n} = \\ln 2',
    color: '#fb923c',
    converges: true,
    why: 'Alternating series with decreasing terms → 0. Converges to ln 2 ≈ 0.693.',
  },
  {
    id: 'telescoping',
    label: 'Σ 1/n(n+1)',
    desc: 'Telescoping, S = 1',
    a: n => 1 / (n * (n + 1)),
    exactSum: 1,
    exactLabel: 'S = 1',
    tex: '\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)} = 1',
    color: '#e879f9',
    converges: true,
    why: 'Partial fractions: 1/n − 1/(n+1). Telescopes to 1 − 1/(N+1) → 1.',
  },
];

// ─── SVG plot ─────────────────────────────────────────────────────────────────
function SumPlot({ terms, partials, exactSum, color, label }) {
  const W = 300, H = 160, PL = 36, PR = 10, PT = 12, PB = 24;
  const iW = W - PL - PR, iH = H - PT - PB;
  const n = partials.length;
  if (n === 0) return null;

  const allVals = [...partials.filter(isFinite)];
  if (exactSum !== null) allVals.push(exactSum);
  const ylo = Math.min(...allVals) - 0.1;
  const yhi = Math.max(...allVals) + 0.1;

  const xs = i => PL + (i / Math.max(n - 1, 1)) * iW;
  const ys = v => {
    const clamped = Math.max(ylo, Math.min(yhi, v));
    return PT + iH - ((clamped - ylo) / (yhi - ylo)) * iH;
  };

  return (
    <svg width={W} height={H} className="w-full bg-slate-950 rounded-lg border border-slate-800">
      {/* axes */}
      <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#475569" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#475569" strokeWidth={1} />
      {/* exact sum line */}
      {exactSum !== null && isFinite(exactSum) && (
        <>
          <line x1={PL} y1={ys(exactSum)} x2={W - PR} y2={ys(exactSum)} stroke={color} strokeWidth={1} strokeDasharray="4,3" opacity={0.6} />
          <text x={W - PR - 2} y={ys(exactSum) - 3} fill={color} fontSize={8} textAnchor="end" opacity={0.9}>{label}</text>
        </>
      )}
      {/* partial sum dots + line */}
      <polyline
        points={partials.map((v, i) => isFinite(v) ? `${xs(i)},${ys(v)}` : '').filter(Boolean).join(' ')}
        fill="none" stroke={color} strokeWidth={1.5} opacity={0.5}
      />
      {partials.map((v, i) => (
        isFinite(v) ? <circle key={i} cx={xs(i)} cy={ys(v)} r={2} fill={color} /> : null
      ))}
      {/* axis labels */}
      {[1, Math.ceil(n / 2), n].map((idx, i) => (
        <text key={i} x={xs(idx - 1)} y={H - PB + 12} fill="#64748b" fontSize={8} textAnchor="middle">N={idx}</text>
      ))}
    </svg>
  );
}

function TermPlot({ terms, color }) {
  const W = 300, H = 120, PL = 36, PR = 10, PT = 12, PB = 24;
  const iW = W - PL - PR, iH = H - PT - PB;
  const n = terms.length;
  const vals = terms.filter(isFinite);
  if (vals.length === 0) return null;

  const absMax = Math.max(...vals.map(Math.abs), 0.01);
  const ylo = -absMax * 1.1, yhi = absMax * 1.1;
  const xs = i => PL + (i / Math.max(n - 1, 1)) * iW;
  const ys = v => PT + iH - ((Math.max(ylo, Math.min(yhi, v)) - ylo) / (yhi - ylo)) * iH;
  const y0 = ys(0);

  return (
    <svg width={W} height={H} className="w-full bg-slate-950 rounded-lg border border-slate-800">
      <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#475569" strokeWidth={1} />
      <line x1={PL} y1={y0} x2={W - PR} y2={y0} stroke="#334155" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#475569" strokeWidth={0.5} />
      <text x={PL - 4} y={y0 + 3} fill="#64748b" fontSize={8} textAnchor="end">0</text>
      {terms.map((v, i) => (
        isFinite(v) ? (
          <line key={i} x1={xs(i)} y1={y0} x2={xs(i)} y2={ys(v)}
            stroke={color} strokeWidth={2} opacity={0.7} />
        ) : null
      ))}
      {terms.map((v, i) => (
        isFinite(v) ? <circle key={i} cx={xs(i)} cy={ys(v)} r={2} fill={color} /> : null
      ))}
      {[1, Math.ceil(n / 2), n].map((idx, i) => (
        <text key={i} x={xs(idx - 1)} y={H - PB + 12} fill="#64748b" fontSize={8} textAnchor="middle">n={idx}</text>
      ))}
    </svg>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function SeriesPartialSums() {
  const [seriesIdx, setSeriesIdx] = useState(0);
  const [N, setN]                 = useState(20);
  const [showTable, setShowTable] = useState(false);

  const s = SERIES[seriesIdx];

  const terms = useMemo(() =>
    Array.from({ length: N }, (_, i) => s.a(i + 1)), [s, N]);

  const partials = useMemo(() => {
    let sum = 0;
    return terms.map(v => { sum += v; return sum; });
  }, [terms]);

  const SN = partials[partials.length - 1];

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-lg p-5 space-y-5 select-none">

      <div className="text-center">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Series & Partial Sums</h3>
        <p className="text-slate-400 text-sm">
          A series converges when its partial sums S_N settle toward a fixed value. Watch it happen — or not.
        </p>
      </div>

      {/* series selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SERIES.map((sr, i) => (
          <button
            key={sr.id}
            onClick={() => setSeriesIdx(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              seriesIdx === i ? 'text-slate-950 border-transparent' : 'border-slate-600 text-slate-400 hover:text-white'
            }`}
            style={seriesIdx === i ? { background: sr.color, borderColor: sr.color } : {}}
          >
            {sr.label}
          </button>
        ))}
      </div>

      {/* N slider */}
      <div className="flex items-center gap-4 justify-center">
        <span className="text-slate-400 text-sm">N =</span>
        <input type="range" min={3} max={60} value={N}
          onChange={e => setN(+e.target.value)}
          className="w-48 accent-violet-500" />
        <span className="text-white font-bold w-6">{N}</span>
      </div>

      {/* series formula */}
      <div className="bg-slate-800 rounded-lg px-4 py-3 text-center overflow-x-auto">
        <KatexBlock expr={s.tex} />
      </div>

      {/* plots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1 text-center">Terms aₙ (individual)</p>
          <TermPlot terms={terms} color={s.color} />
          <p className="text-[10px] text-slate-500 text-center mt-1">Each bar = one term. Do they shrink toward 0?</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1 text-center">Partial sums S_N = Σ aₙ</p>
          <SumPlot terms={terms} partials={partials} exactSum={s.exactSum} color={s.color} label={s.exactLabel} />
          <p className="text-[10px] text-slate-500 text-center mt-1">Each dot = total so far. Does it level off?</p>
        </div>
      </div>

      {/* verdict */}
      <div className={`rounded-lg border px-4 py-3 space-y-2 ${
        s.converges ? 'bg-emerald-950/50 border-emerald-700' : 'bg-rose-950/50 border-rose-700'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm ${s.converges ? 'text-emerald-300' : 'text-rose-300'}`}>
            {s.converges ? '✓ Converges' : '✗ Diverges'}
          </span>
          <span className="text-slate-400 text-xs">— {s.desc}</span>
        </div>
        <p className="text-slate-300 text-sm">{s.why}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-800/60 rounded px-3 py-2">
            <p className="text-slate-400 text-xs">Last term a_{N}</p>
            <p className="text-white font-bold">{terms[terms.length-1].toFixed(6)}</p>
          </div>
          <div className="bg-slate-800/60 rounded px-3 py-2">
            <p className="text-slate-400 text-xs">S_{N} (partial sum)</p>
            <p className="font-bold" style={{ color: s.color }}>{SN.toFixed(6)}</p>
          </div>
          {s.exactSum !== null && (
            <div className="bg-slate-800/60 rounded px-3 py-2 col-span-2">
              <p className="text-slate-400 text-xs">Error = |S_{N} − exact sum|</p>
              <p className="text-amber-300 font-bold">{Math.abs(SN - s.exactSum).toFixed(6)}</p>
            </div>
          )}
        </div>
      </div>

      {/* the key insight panel */}
      <div className="bg-slate-800 rounded-lg px-4 py-4 space-y-3">
        <p className="text-white font-bold text-sm">The key insight: what "convergence" really means</p>
        <p className="text-slate-300 text-sm">
          A series <KatexInline expr="\sum a_n" /> is <em>not</em> computed directly. Instead, we look at the sequence of partial sums:
        </p>
        <div className="overflow-x-auto">
          <KatexBlock expr="S_N = a_1 + a_2 + \cdots + a_N = \sum_{n=1}^{N} a_n" />
        </div>
        <p className="text-slate-300 text-sm">
          The series converges if <KatexInline expr="\lim_{N \to \infty} S_N = S" /> (a finite number).
          A series <em>diverges</em> if this limit doesn't exist or is ±∞.
        </p>
        <p className="text-slate-300 text-sm">
          <strong className="text-amber-300">Key warning:</strong> <KatexInline expr="a_n \to 0" /> is <em>necessary</em> but not <em>sufficient</em> for convergence.
          The harmonic series proves this — each term 1/n → 0, yet the sum grows to ∞.
        </p>
      </div>

      {/* expandable term table */}
      <div>
        <button
          onClick={() => setShowTable(v => !v)}
          className="text-xs text-slate-400 hover:text-slate-200 underline"
        >
          {showTable ? 'Hide' : 'Show'} term-by-term table
        </button>
        {showTable && (
          <div className="mt-3 overflow-auto max-h-48 rounded-lg border border-slate-700">
            <table className="w-full text-xs font-mono">
              <thead className="bg-slate-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-400">n</th>
                  <th className="px-3 py-2 text-right text-slate-400">aₙ</th>
                  <th className="px-3 py-2 text-right text-slate-400">S_n</th>
                  {s.exactSum !== null && <th className="px-3 py-2 text-right text-slate-400">error</th>}
                </tr>
              </thead>
              <tbody>
                {terms.map((v, i) => (
                  <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/40">
                    <td className="px-3 py-1 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-1 text-right" style={{ color: s.color }}>{v.toFixed(6)}</td>
                    <td className="px-3 py-1 text-right text-white">{partials[i].toFixed(6)}</td>
                    {s.exactSum !== null && (
                      <td className="px-3 py-1 text-right text-amber-400">{Math.abs(partials[i] - s.exactSum).toFixed(6)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
