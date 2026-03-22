import React, { useMemo, useState } from 'react';

// Geometric proof: (f⁻¹)'(b) = 1 / f'(a)
// f(x) = x², f⁻¹(x) = √x, both defined for x ≥ 0
// Point (a, a²) on f has tangent slope f'(a) = 2a
// Mirror point (a², a) on f⁻¹ has slope 1/(2a) = (f⁻¹)'(a²)
// Reflection across y=x swaps Δx ↔ Δy → slope flips to reciprocal

export default function InverseSlopeReflectionLab() {
  const [a, setA] = useState(1.3);

  const m = useMemo(() => {
    const b = a * a;
    const slopeF = 2 * a;
    const slopeInv = 1 / slopeF;
    return { b, slopeF, slopeInv };
  }, [a]);

  const W = 280, H = 280;
  const xMax = 5.4, yMax = 5.4;
  const pad = 30;
  const plotW = W - 2 * pad;
  const plotH = H - 2 * pad;

  const toX = (x) => pad + (x / xMax) * plotW;
  const toY = (y) => H - pad - (y / yMax) * plotH;

  // f(x) = x² path, x in [0, 2.33]
  const fPts = [];
  for (let x = 0; x <= 2.33; x += 0.05) {
    fPts.push(`${toX(x).toFixed(1)},${toY(x * x).toFixed(1)}`);
  }

  // f⁻¹(x) = √x path, x in [0, 5.3]
  const invPts = [];
  for (let x = 0; x <= 5.3; x += 0.08) {
    invPts.push(`${toX(x).toFixed(1)},${toY(Math.sqrt(x)).toFixed(1)}`);
  }

  // Tangent on f at (a, a²): y = 2a(x - a) + a², clamped ±0.65 in x
  const tfa = Math.max(0.01, a - 0.65), tfb = Math.min(2.33, a + 0.65);
  const tfx1 = toX(tfa), tfy1 = toY(m.slopeF * (tfa - a) + a * a);
  const tfx2 = toX(tfb), tfy2 = toY(m.slopeF * (tfb - a) + a * a);

  // Tangent on f⁻¹ at (b, a): y = (1/(2a))(x - b) + a, clamped ±1.0
  const tia = Math.max(0, m.b - 1.0), tib = Math.min(5.3, m.b + 1.0);
  const tix1 = toX(tia), tiy1 = toY(m.slopeInv * (tia - m.b) + a);
  const tix2 = toX(tib), tiy2 = toY(m.slopeInv * (tib - m.b) + a);

  const f3 = (n) => n.toFixed(3);

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-base font-semibold mb-1">Inverse Slope Reflection Lab</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        Reflection across <span className="font-mono">y = x</span> swaps axes — turning rise/run into run/rise.
        That is why the slope at <span className="text-blue-500 font-mono">(a, f(a))</span> becomes its reciprocal
        at the mirrored point <span className="text-emerald-500 font-mono">(f(a), a)</span> on f⁻¹.
      </p>

      <div className="mb-3">
        <label className="text-sm font-medium">
          a = {a.toFixed(2)}, &nbsp; f(a) = a² = {m.b.toFixed(3)}
        </label>
        <input
          type="range" min="0.35" max="2.28" step="0.01" value={a}
          onChange={e => setA(+e.target.value)}
          className="w-full mt-1"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* SVG graph */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-64 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
        >
          {/* Axes */}
          <line x1={pad} y1={H - pad} x2={W - pad + 5} y2={H - pad} stroke="#94a3b8" strokeWidth="1" />
          <line x1={pad} y1={H - pad} x2={pad} y2={pad - 5} stroke="#94a3b8" strokeWidth="1" />

          {/* y = x reflection line */}
          <line
            x1={toX(0)} y1={toY(0)} x2={toX(5.2)} y2={toY(5.2)}
            stroke="#e2e8f0" strokeWidth="1" strokeDasharray="6 4"
          />
          <text x={toX(4.2)} y={toY(4.5)} fontSize="9" fill="#94a3b8">y = x</text>

          {/* Mirror connection (yellow dashed) */}
          <line
            x1={toX(a)} y1={toY(m.b)} x2={toX(m.b)} y2={toY(a)}
            stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8"
          />

          {/* f(x) = x² */}
          <polyline points={fPts.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
          <text x={toX(0.6)} y={toY(3.2)} fontSize="11" fill="#3b82f6" fontWeight="600">f(x) = x²</text>

          {/* f⁻¹(x) = √x */}
          <polyline points={invPts.join(' ')} fill="none" stroke="#10b981" strokeWidth="2.5" />
          <text x={toX(3.3)} y={toY(1.9)} fontSize="11" fill="#10b981" fontWeight="600">f⁻¹(x) = √x</text>

          {/* Tangent on f (blue dashed) */}
          <line x1={tfx1} y1={tfy1} x2={tfx2} y2={tfy2} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />

          {/* Tangent on f⁻¹ (green dashed) */}
          <line x1={tix1} y1={tiy1} x2={tix2} y2={tiy2} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />

          {/* Point on f: (a, a²) */}
          <circle cx={toX(a)} cy={toY(m.b)} r="5" fill="#3b82f6" />
          <text x={toX(a) + 7} y={toY(m.b) - 4} fontSize="9" fill="#3b82f6">({a.toFixed(1)}, {m.b.toFixed(1)})</text>

          {/* Point on f⁻¹: (a², a) */}
          <circle cx={toX(m.b)} cy={toY(a)} r="5" fill="#10b981" />
          <text x={toX(m.b) + 7} y={toY(a) - 4} fontSize="9" fill="#10b981">({m.b.toFixed(1)}, {a.toFixed(1)})</text>
        </svg>

        {/* Info panel */}
        <div className="flex flex-col gap-2 text-sm flex-1 min-w-0">
          <div className="p-3 rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
            <p className="font-semibold text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wide mb-1">Point on f (blue)</p>
            <p className="font-mono text-xs">(a, f(a)) = ({a.toFixed(2)}, {m.b.toFixed(3)})</p>
            <p className="font-mono text-xs mt-0.5">f′(a) = 2a = <strong>{f3(m.slopeF)}</strong></p>
          </div>

          <div className="p-3 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
            <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-wide mb-1">Mirrored point on f⁻¹ (green)</p>
            <p className="font-mono text-xs">(f(a), a) = ({m.b.toFixed(3)}, {a.toFixed(2)})</p>
            <p className="font-mono text-xs mt-0.5">(f⁻¹)′(b) = 1/f′(a) = <strong>{f3(m.slopeInv)}</strong></p>
          </div>

          <div className="p-3 rounded border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
            <p className="font-semibold text-xs mb-1">Verification</p>
            <p className="font-mono text-xs">f′(a) × (f⁻¹)′(b)</p>
            <p className="font-mono text-xs">= {f3(m.slopeF)} × {f3(m.slopeInv)}</p>
            <p className="font-mono text-xs font-bold">= {(m.slopeF * m.slopeInv).toFixed(6)}</p>
            <p className="text-xs text-slate-500 mt-1">Always 1, for any a ≠ 0.</p>
          </div>

          <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
            <p className="font-semibold text-xs mb-1 text-slate-500">The Rule</p>
            <p className="font-mono text-xs">(f⁻¹)′(x) = 1 / f′(f⁻¹(x))</p>
            <p className="text-xs text-slate-400 mt-1">
              Reflection swaps Δx ↔ Δy everywhere, so every slope becomes its reciprocal at the corresponding mirrored point.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
