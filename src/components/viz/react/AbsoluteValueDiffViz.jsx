import React, { useMemo, useState } from 'react';

// Shows that |x| is NOT differentiable at x = 0.
//
// The difference quotient (|0+h| - |0|) / h = |h| / h = sign(h).
//   - From the right (h > 0): |h|/h = h/h = +1  →  right-hand limit = +1
//   - From the left  (h < 0): |h|/h = (−h)/h = −1  →  left-hand limit = −1
//
// Because the two one-sided limits are unequal, the two-sided limit (the derivative) does not exist.
// Geometrically this is the "corner" — no single tangent line fits the kink at x = 0.

export default function AbsoluteValueDiffViz() {
  const [h, setH] = useState(0.7);    // h > 0; we show +h (right) and -h (left) simultaneously

  // Layout
  const W = 280, H = 200;
  const PAD = { l: 28, r: 20, t: 18, b: 28 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const xMin = -1.5, xMax = 1.5;
  const yMin = -0.2, yMax = 1.6;

  const toX = (x) => PAD.l + ((x - xMin) / (xMax - xMin)) * plotW;
  const toY = (y) => PAD.t + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  // |x| path: V-shape through three points
  const absPts = [
    [toX(xMin), toY(Math.abs(xMin))],
    [toX(0),    toY(0)],
    [toX(xMax), toY(Math.abs(xMax))],
  ].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  // Right secant: from (0,0) to (+h, h) → slope = +1
  const rxEnd = toX(h), ryEnd = toY(h);
  // Left secant:  from (0,0) to (−h, h) → slope = −1
  const lxEnd = toX(-h), lyEnd = toY(h);
  const origin = [toX(0), toY(0)];

  // Difference quotients (independent of h — always ±1)
  const dqRight = 1;
  const dqLeft  = -1;

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-base font-semibold mb-1">Why |x| Has No Derivative at 0</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        Slide h toward 0. Both secant lines stay locked at slopes +1 and −1 no matter how small h gets.
        The two one-sided limits never agree — so the derivative does not exist at the corner.
      </p>

      <div className="mb-3">
        <label className="text-sm font-medium">
          h = {h.toFixed(2)} &nbsp;
          <span className="text-emerald-600">(right slope = +1)</span>
          {' '}·{' '}
          <span className="text-red-500">(left slope = −1)</span>
        </label>
        <input
          type="range" min="0.04" max="1.4" step="0.01" value={h}
          onChange={e => setH(+e.target.value)}
          className="w-full mt-1"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Graph */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-64 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
        >
          {/* Axes */}
          <line x1={PAD.l} y1={toY(0)} x2={W - PAD.r} y2={toY(0)} stroke="#64748b" strokeWidth="1.5" />
          <line x1={toX(0)} y1={PAD.t} x2={toX(0)} y2={H - PAD.b} stroke="#64748b" strokeWidth="1.5" />
          <text x={W - PAD.r + 3} y={toY(0) + 4} fontSize="9" fill="#94a3b8">x</text>
          <text x={toX(0) + 4} y={PAD.t + 7} fontSize="9" fill="#94a3b8">y</text>

          {/* |x| curve */}
          <polyline points={absPts} fill="none" stroke="#334155" strokeWidth="2.5" />

          {/* Corner dot (open, highlighted) */}
          <circle cx={toX(0)} cy={toY(0)} r="5" fill="white" stroke="#f59e0b" strokeWidth="2.5" />
          <text x={toX(0) + 6} y={toY(0) - 6} fontSize="9" fill="#f59e0b" fontWeight="600">corner</text>

          {/* Right secant: (0,0) → (+h, h) */}
          <line
            x1={origin[0]} y1={origin[1]} x2={rxEnd} y2={ryEnd}
            stroke="#10b981" strokeWidth="2.5"
          />
          <circle cx={rxEnd} cy={ryEnd} r="4" fill="#10b981" />
          <text x={toX(h)} y={toY(h) - 8} textAnchor="middle" fontSize="9" fill="#10b981" fontWeight="600">+h</text>

          {/* Left secant: (0,0) → (-h, h) */}
          <line
            x1={origin[0]} y1={origin[1]} x2={lxEnd} y2={lyEnd}
            stroke="#ef4444" strokeWidth="2.5"
          />
          <circle cx={lxEnd} cy={lyEnd} r="4" fill="#ef4444" />
          <text x={toX(-h)} y={toY(h) - 8} textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="600">−h</text>

          {/* x-axis h labels */}
          <line x1={toX(h)}  y1={toY(0)} x2={toX(h)}  y2={toY(0) + 5} stroke="#10b981" strokeWidth="1.5" />
          <line x1={toX(-h)} y1={toY(0)} x2={toX(-h)} y2={toY(0) + 5} stroke="#ef4444"  strokeWidth="1.5" />
        </svg>

        {/* Explanation panel */}
        <div className="flex flex-col gap-2 text-sm flex-1">
          <div className="p-3 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">Right-hand limit (h → 0⁺)</p>
            <p className="font-mono text-xs mt-1">
              {'(|0+h| − 0) / h = |h| / h = h / h = +1'}
            </p>
            <p className="text-xs mt-1">
              No matter how small <span className="font-mono">h &gt; 0</span> gets, this ratio is exactly <strong>+1</strong>.
            </p>
          </div>

          <div className="p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
            <p className="font-semibold text-red-700 dark:text-red-300">Left-hand limit (h → 0⁻)</p>
            <p className="font-mono text-xs mt-1">
              {'(|0−h| − 0) / (−h) = h / (−h) = −1'}
            </p>
            <p className="text-xs mt-1">
              No matter how small <span className="font-mono">h &gt; 0</span> gets, the left-side ratio is exactly <strong>−1</strong>.
            </p>
          </div>

          <div className="p-3 rounded border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
            <p className="font-semibold">Conclusion</p>
            <p className="font-mono text-xs mt-1">lim(h→0⁺) ≠ lim(h→0⁻)</p>
            <p className="font-mono text-xs">+1 ≠ −1</p>
            <p className="text-xs mt-1">
              The two-sided limit does not exist →{' '}
              <strong>|x| is not differentiable at x = 0</strong>.
            </p>
            <p className="text-xs mt-1 text-slate-500">
              The corner is the geometric reason: two different tangent slopes meet at the same point, so no single tangent fits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
