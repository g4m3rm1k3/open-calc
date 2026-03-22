import React, { useMemo, useState } from 'react';

// Geometric proof: d/dx[arctan(x)] = 1/(1 + x²)
//
// Setup: if y = arctan(x), then tan(y) = x.
// Draw the right triangle with adjacent = 1, opposite = x, hypotenuse = √(1+x²).
// The angle at the origin is y = arctan(x).
//
// Implicit differentiation of tan(y) = x:
//   sec²(y) · dy/dx = 1
//   dy/dx = 1/sec²(y) = cos²(y)
//
// From the triangle: cos(y) = adj/hyp = 1/√(1+x²)
//   → cos²(y) = 1/(1+x²)
//   → dy/dx = 1/(1+x²)

const PROOF_STEPS = [
  {
    label: 'Let y = arctan(x)',
    formula: '\\tan(y) = x',
    note: 'Rewrite in terms of tan so we can differentiate both sides.',
    color: '#64748b',
  },
  {
    label: 'Implicit differentiation',
    formula: '\\sec^2(y)\\cdot\\frac{dy}{dx} = 1',
    note: 'Differentiate both sides w.r.t. x. The left side uses the chain rule: d/dx[tan(y)] = sec²(y) · dy/dx.',
    color: '#3b82f6',
  },
  {
    label: 'Solve for dy/dx',
    formula: '\\frac{dy}{dx} = \\frac{1}{\\sec^2(y)} = \\cos^2(y)',
    note: '1/sec² = cos².',
    color: '#7c3aed',
  },
  {
    label: 'Read cos(y) from the triangle',
    formula: '\\cos(y) = \\frac{\\text{adj}}{\\text{hyp}} = \\frac{1}{\\sqrt{1+x^2}}',
    note: 'The triangle has adjacent = 1, hypotenuse = √(1+x²). Drag x to watch the triangle update.',
    color: '#10b981',
  },
  {
    label: 'Final result',
    formula: '\\frac{d}{dx}[\\arctan(x)] = \\frac{1}{1+x^2}',
    note: 'Substituting cos²(y) = 1/(1+x²). Valid for all real x.',
    color: '#f59e0b',
  },
];

export default function ArcTanDerivationLab() {
  const [x, setX] = useState(1.0);

  const model = useMemo(() => {
    const y = Math.atan(x);
    const hyp = Math.sqrt(1 + x * x);
    const result = 1 / (1 + x * x);
    const sec2y = 1 + x * x;
    return { y, hyp, result, sec2y };
  }, [x]);

  // Triangle in SVG space
  // Origin O at (ox, oy), adjacent goes right to (ox+adjLen, oy),
  // opposite goes up from there to (ox+adjLen, oy - oppLen)
  const ox = 55, oy = 195;
  const adjLen = 80;                      // 1 unit = 80px (adjacent side)
  const oppLen = x * adjLen;              // opposite = x * adjLen
  const hypX = ox + adjLen, hypY = oy - oppLen;

  // Clamp so tall triangles don't overflow
  const maxOpp = 170;
  const scale = oppLen > maxOpp ? maxOpp / oppLen : 1;
  const dAdjLen = adjLen * scale;
  const dOppLen = oppLen * scale;
  const dHypX = ox + dAdjLen, dHypY = oy - dOppLen;
  const dHyp = Math.sqrt(dAdjLen * dAdjLen + dOppLen * dOppLen);

  // Angle arc (draw from 0 to arctan(x), radius 28)
  const arcR = 28;
  const arcEndX = ox + arcR * Math.cos(model.y);
  const arcEndY = oy - arcR * Math.sin(model.y);

  const f4 = (n) => n.toFixed(4);

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-base font-semibold mb-1">arctan Derivative: Geometric Proof</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        The right triangle shows exactly where <span className="font-mono">1/(1+x²)</span> comes from.
        Drag x to watch the triangle and live values update as the proof steps stay fixed.
      </p>

      <div className="mb-3">
        <label className="text-sm font-medium">x = {x.toFixed(2)}</label>
        <input
          type="range" min="0.05" max="3.5" step="0.05" value={x}
          onChange={e => setX(+e.target.value)}
          className="w-full mt-1"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Triangle SVG */}
        <svg
          viewBox="0 0 240 220"
          className="w-full sm:w-56 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
        >
          {/* Triangle fill */}
          <polygon
            points={`${ox},${oy} ${dHypX},${oy} ${dHypX},${dHypY}`}
            fill="#eff6ff" stroke="none"
          />

          {/* Adjacent side (blue) */}
          <line x1={ox} y1={oy} x2={dHypX} y2={oy} stroke="#3b82f6" strokeWidth="2.5" />
          <text
            x={(ox + dHypX) / 2} y={oy + 18}
            fontSize="12" fill="#3b82f6" textAnchor="middle" fontWeight="600"
          >
            1
          </text>

          {/* Opposite side (red) */}
          <line x1={dHypX} y1={oy} x2={dHypX} y2={dHypY} stroke="#ef4444" strokeWidth="2.5" />
          <text
            x={dHypX + 9} y={(oy + dHypY) / 2 + 4}
            fontSize="11" fill="#ef4444" fontWeight="600"
          >
            x={x.toFixed(2)}
          </text>

          {/* Hypotenuse (purple) */}
          <line x1={ox} y1={oy} x2={dHypX} y2={dHypY} stroke="#7c3aed" strokeWidth="2.5" />
          <text
            x={(ox + dHypX) / 2 - 18}
            y={(oy + dHypY) / 2 - 6}
            fontSize="10" fill="#7c3aed" fontWeight="600" textAnchor="middle"
          >
            {model.hyp.toFixed(3)}
          </text>

          {/* Angle arc (amber) */}
          <path
            d={`M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 0 1 ${arcEndX.toFixed(1)} ${arcEndY.toFixed(1)}`}
            fill="none" stroke="#f59e0b" strokeWidth="2"
          />
          <text x={ox + arcR + 6} y={oy - 8} fontSize="10" fill="#f59e0b" fontWeight="600">
            y=arctan(x)
          </text>

          {/* Right angle marker */}
          <rect x={dHypX - 10} y={oy - 10} width="10" height="10" fill="none" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Live values */}
          <text x="120" y="212" fontSize="10" fill="#64748b" textAnchor="middle">
            sec²(y) = 1+x² = {model.sec2y.toFixed(3)} · · · cos²(y) = {model.result.toFixed(4)}
          </text>
        </svg>

        {/* Proof steps */}
        <div className="flex flex-col gap-1.5 flex-1">
          {PROOF_STEPS.map((s, i) => (
            <div
              key={i}
              className="p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-slate-400">{i + 1}.</span>
                <span className="font-semibold text-xs">{s.label}</span>
              </div>
              <p className="font-mono text-xs mt-0.5" style={{ color: s.color }}>{s.formula}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.note}</p>
            </div>
          ))}

          <div className="p-2.5 rounded border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 mt-1">
            <p className="text-xs font-semibold">Live check at x = {x.toFixed(2)}</p>
            <p className="font-mono text-xs mt-1">
              1 / (1 + {x.toFixed(2)}²) = 1 / {model.sec2y.toFixed(3)} = <strong>{f4(model.result)}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
