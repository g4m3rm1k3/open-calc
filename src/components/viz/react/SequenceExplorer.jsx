import { useState, useMemo } from 'react';
import KatexBlock from '../../math/KatexBlock.jsx';
import KatexInline from '../../math/KatexInline.jsx';

// ─── safe evaluator ───────────────────────────────────────────────────────────
function safeEval(expr, n) {
  let s = expr
    .replace(/\^/g, '**')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\bln\b/g, 'Math.log')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\be\b/g, String(Math.E))
    .replace(/\bpi\b/g, String(Math.PI))
    .replace(/\bn\b/g, String(n));
  if (!/^[\d\s+\-*/().Math,_a-zA-Z]+$/.test(s)) return NaN;
  try { return Function('"use strict"; return (' + s + ')')(); }
  catch { return NaN; }
}

const PRESETS = [
  { label: '1/n',         expr: '1/n',              desc: 'Converges to 0',           color: '#a78bfa' },
  { label: '(-1)ⁿ/n',    expr: '((-1)**n)/n',       desc: 'Oscillates → 0',          color: '#38bdf8' },
  { label: '(1+1/n)ⁿ',   expr: '(1+1/n)**n',        desc: 'Converges to e ≈ 2.718', color: '#34d399' },
  { label: 'n/(n+1)',     expr: 'n/(n+1)',            desc: 'Converges to 1',          color: '#fb923c' },
  { label: '(-1)ⁿ',      expr: '(-1)**n',            desc: 'Diverges (oscillates)',   color: '#f87171' },
  { label: 'n²/(n²+1)',  expr: 'n**2/(n**2+1)',      desc: 'Converges to 1',          color: '#fbbf24' },
  { label: 'ln(n)/n',    expr: 'Math.log(n)/n',      desc: 'Converges to 0',          color: '#e879f9' },
  { label: '1/n!',       expr: '1/factorial(n)',      desc: '→ 0 very fast',           color: '#2dd4bf', special: 'factorial' },
];

// ─── SVG plot ─────────────────────────────────────────────────────────────────
function TermPlot({ terms, limit, showEps, eps, color }) {
  const W = 340, H = 200, PL = 40, PR = 12, PT = 12, PB = 28;
  const iW = W - PL - PR, iH = H - PT - PB;
  const n = terms.length;
  if (n === 0) return null;

  const vals = terms.filter(v => isFinite(v));
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const pad = Math.max(0.2, (maxV - minV) * 0.15);
  const ylo = minV - pad, yhi = maxV + pad;

  const xs = i => PL + (i / (n - 1)) * iW;
  const ys = v => PT + iH - ((v - ylo) / (yhi - ylo)) * iH;

  // y-axis ticks
  const range = yhi - ylo;
  const step = range < 0.5 ? 0.1 : range < 2 ? 0.5 : range < 5 ? 1 : 2;
  const ticks = [];
  for (let t = Math.ceil(ylo / step) * step; t <= yhi; t += step) {
    ticks.push(+t.toFixed(6));
  }

  return (
    <svg width={W} height={H} className="w-full bg-slate-950 rounded-lg border border-slate-800">
      {/* grid */}
      {ticks.map((t, i) => (
        <line key={i} x1={PL} y1={ys(t)} x2={W - PR} y2={ys(t)} stroke="#1e293b" strokeWidth={1} />
      ))}
      {/* epsilon band */}
      {showEps && limit !== null && isFinite(limit) && (
        <rect
          x={PL} y={ys(limit + eps)}
          width={iW} height={Math.max(0, ys(limit - eps) - ys(limit + eps))}
          fill={color} fillOpacity={0.12}
        />
      )}
      {/* limit line */}
      {limit !== null && isFinite(limit) && (
        <line x1={PL} y1={ys(limit)} x2={W - PR} y2={ys(limit)} stroke={color} strokeWidth={1.5} strokeDasharray="5,3" opacity={0.8} />
      )}
      {/* axes */}
      <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#475569" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#475569" strokeWidth={1} />
      {/* y ticks */}
      {ticks.map((t, i) => (
        <text key={i} x={PL - 4} y={ys(t) + 3.5} fill="#64748b" fontSize={8} textAnchor="end">{t.toFixed(1)}</text>
      ))}
      {/* x labels */}
      {[1, Math.ceil(n / 2), n].map((idx, i) => (
        <text key={i} x={xs(idx - 1)} y={H - PB + 12} fill="#64748b" fontSize={8} textAnchor="middle">n={idx}</text>
      ))}
      {/* dots */}
      {terms.map((v, i) => (
        isFinite(v) ? (
          <circle key={i} cx={xs(i)} cy={ys(v)} r={2.5} fill={color} opacity={0.85} />
        ) : null
      ))}
      {/* limit label */}
      {limit !== null && isFinite(limit) && (
        <text x={W - PR - 2} y={ys(limit) - 4} fill={color} fontSize={9} textAnchor="end">L = {limit.toFixed(4)}</text>
      )}
    </svg>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function SequenceExplorer() {
  const [expr, setExpr]       = useState('1/n');
  const [numTerms, setNumTerms] = useState(20);
  const [showEps, setShowEps]  = useState(false);
  const [eps, setEps]          = useState(0.2);
  const [activePreset, setActivePreset] = useState(0);

  const color = PRESETS[activePreset]?.color ?? '#a78bfa';

  function applyPreset(i) {
    setActivePreset(i);
    setExpr(PRESETS[i].expr);
  }

  const terms = useMemo(() => {
    return Array.from({ length: numTerms }, (_, i) => safeEval(expr, i + 1));
  }, [expr, numTerms]);

  const validTerms = terms.filter(isFinite);
  const hasError = terms.some(v => isNaN(v));

  // guess limit: average of last 5 terms if they're close
  const limit = useMemo(() => {
    if (validTerms.length < 5) return null;
    const last5 = validTerms.slice(-5);
    const avg = last5.reduce((s, v) => s + v, 0) / 5;
    const spread = Math.max(...last5) - Math.min(...last5);
    return spread < 0.15 ? +avg.toFixed(6) : null;
  }, [validTerms]);

  const isConverging = limit !== null;

  // check how many terms are within eps of limit
  const withinEps = isConverging ? terms.filter((v, i) => isFinite(v) && Math.abs(v - limit) < eps).length : 0;
  const firstN = isConverging ? terms.findIndex((v, i) => isFinite(v) && Math.abs(v - limit) < eps && terms.slice(i).every(w => !isFinite(w) || Math.abs(w - limit) < eps)) + 1 : null;

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-lg p-5 space-y-5 select-none">

      <div className="text-center">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Sequence Explorer</h3>
        <p className="text-slate-400 text-sm">Plot any sequence, see whether it converges, and visualise the ε-band that captures all eventual terms.</p>
      </div>

      {/* presets */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => applyPreset(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              activePreset === i ? 'text-slate-950 border-transparent' : 'border-slate-600 text-slate-400 hover:text-white'
            }`}
            style={activePreset === i ? { background: p.color, borderColor: p.color } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-slate-400 text-xs uppercase tracking-wide">Formula for aₙ (use n)</span>
          <input
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-violet-500"
            value={expr}
            onChange={e => { setExpr(e.target.value); setActivePreset(-1); }}
            spellCheck={false}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-400 text-xs uppercase tracking-wide">Number of terms: {numTerms}</span>
          <input type="range" min={5} max={60} value={numTerms}
            onChange={e => setNumTerms(+e.target.value)}
            className="mt-2 accent-violet-500"
          />
        </label>
      </div>

      {hasError && (
        <p className="text-rose-400 text-sm text-center">Expression error — check syntax. Use n for the index, ** for powers, ln() for logarithm.</p>
      )}

      {/* plot */}
      {!hasError && validTerms.length > 0 && (
        <TermPlot terms={terms} limit={limit} showEps={showEps} eps={eps} color={color} />
      )}

      {/* convergence verdict */}
      {!hasError && validTerms.length > 0 && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          isConverging
            ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
            : 'bg-rose-950/50 border-rose-700 text-rose-300'
        }`}>
          {isConverging ? (
            <>
              <span className="font-bold">Converges</span> — the last 5 terms cluster around <strong>L ≈ {limit}</strong>.
              {PRESETS[activePreset]?.desc && (
                <span className="text-slate-400 ml-2">({PRESETS[activePreset].desc})</span>
              )}
            </>
          ) : (
            <>
              <span className="font-bold">Likely diverges</span> — the last 5 terms are spread out (no single limiting value detected).
              {PRESETS[activePreset]?.desc && (
                <span className="text-slate-400 ml-2">({PRESETS[activePreset].desc})</span>
              )}
            </>
          )}
        </div>
      )}

      {/* epsilon panel */}
      {isConverging && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEps(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                showEps ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {showEps ? 'Hide ε-band' : 'Show ε-band'}
            </button>
            <span className="text-slate-400 text-xs">ε = {eps.toFixed(2)}</span>
            <input type="range" min={0.01} max={0.5} step={0.01} value={eps}
              onChange={e => setEps(+e.target.value)}
              className="w-32 accent-violet-500"
            />
          </div>

          {showEps && (
            <div className="bg-violet-950/40 border border-violet-700/50 rounded-lg px-4 py-3 space-y-2">
              <p className="text-violet-200 text-sm font-semibold">What the ε-band means</p>
              <p className="text-slate-300 text-sm">
                The shaded band covers all values within ε = {eps.toFixed(2)} of L ≈ {limit}.
                A sequence <em>converges</em> to L if: for <em>any</em> ε you choose (no matter how small),
                all terms from some point onward land inside the band.
              </p>
              <div className="overflow-x-auto">
                <KatexBlock expr={`\\lim_{n\\to\\infty} a_n = L \\iff \\forall \\varepsilon > 0,\\; \\exists N:\\; n > N \\implies |a_n - L| < \\varepsilon`} />
              </div>
              {firstN !== null && firstN > 0 && (
                <p className="text-emerald-300 text-sm">
                  With ε = {eps.toFixed(2)}: all terms from <strong>n = {firstN}</strong> onward stay inside the band.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* first 10 terms */}
      {!hasError && validTerms.length > 0 && (
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">First terms</p>
          <div className="flex flex-wrap gap-2">
            {terms.slice(0, 12).map((v, i) => (
              <div key={i} className="text-center">
                <div className="text-[9px] text-slate-500">n={i+1}</div>
                <div
                  className="w-14 rounded-md px-1 py-1 text-xs font-mono font-bold text-white text-center"
                  style={{ background: color + '33', border: `1px solid ${color}66`, color }}
                >
                  {isFinite(v) ? (Number.isInteger(v) ? v : v.toFixed(3)) : '—'}
                </div>
              </div>
            ))}
            {terms.length > 12 && <div className="self-end text-slate-500 text-xs">…</div>}
          </div>
        </div>
      )}

      {/* syntax help */}
      <details className="text-xs text-slate-500 cursor-pointer">
        <summary className="hover:text-slate-300">Expression syntax</summary>
        <ul className="mt-2 space-y-0.5 pl-3 list-disc">
          <li><code className="text-slate-300">n</code> — the index</li>
          <li><code className="text-slate-300">**</code> for powers: <code className="text-slate-300">n**2</code> or <code className="text-slate-300">((-1)**n)</code></li>
          <li><code className="text-slate-300">Math.sqrt(n)</code>, <code className="text-slate-300">Math.log(n)</code>, <code className="text-slate-300">Math.sin(n)</code></li>
          <li><code className="text-slate-300">Math.E</code> for e, <code className="text-slate-300">Math.PI</code> for π</li>
        </ul>
      </details>
    </div>
  );
}
