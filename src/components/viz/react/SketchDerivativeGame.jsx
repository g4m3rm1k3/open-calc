import React, { useState, useMemo, useCallback, useRef } from 'react';

// f(x) = x³ - 3x → f'(x) = 3x² - 3
// User drags 7 vertical handles in the f' panel to sketch their guess.
// "Reveal" shows actual f' and scores the attempt.
// Key insight: peaks of f (orange marks) must be zeros of f'.

const HANDLES_X = [-2, -1.5, -1, 0, 1, 1.5, 2];
const f  = (x) => x ** 3 - 3 * x;
const df = (x) => 3 * x ** 2 - 3;
const ACTUAL_SLOPES = HANDLES_X.map(df);

// Catmull-Rom → cubic Bezier SVG path
function splinePath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)},${cp2x.toFixed(1)} ${cp2y.toFixed(1)},${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export default function SketchDerivativeGame() {
  const [userSlopes, setUserSlopes] = useState(() => Array(HANDLES_X.length).fill(0));
  const [revealed, setRevealed] = useState(false);
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  // Layout constants
  const W = 340, H = 155;
  const PAD = { l: 34, r: 12, t: 14, b: 24 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  // f domain and display range
  const xMin = -2.5, xMax = 2.5;
  const fMin = -2.6, fMax = 2.6;
  const dfMin = -4, dfMax = 11;

  const toSX   = (x)  => PAD.l + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSYf  = (y)  => PAD.t + (1 - (y - fMin)  / (fMax  - fMin))  * plotH;
  const toSYdf = (y)  => PAD.t + (1 - (y - dfMin) / (dfMax - dfMin)) * plotH;
  const fromSYdf = (sy) => dfMin + (1 - (sy - PAD.t) / plotH) * (dfMax - dfMin);

  // Dense curves
  const fCurve = useMemo(() => {
    const pts = [];
    for (let x = xMin; x <= xMax; x += 0.05) pts.push([toSX(x), toSYf(f(x))]);
    return pts;
  }, []);

  const actualCurve = useMemo(() => {
    const pts = [];
    for (let x = xMin; x <= xMax; x += 0.05) pts.push([toSX(x), toSYdf(df(x))]);
    return pts;
  }, []);

  // Handle positions
  const handlePts  = HANDLES_X.map((hx, i) => [toSX(hx), toSYdf(userSlopes[i])]);
  const actualPts  = HANDLES_X.map((hx, i) => [toSX(hx), toSYdf(ACTUAL_SLOPES[i])]);

  // Score: 100 − weighted mean absolute error (clamped 0–100)
  const score = useMemo(() => {
    if (!revealed) return null;
    const errSum = userSlopes.reduce((s, v, i) => s + Math.abs(v - ACTUAL_SLOPES[i]), 0);
    const scale  = HANDLES_X.length * 5; // 5-unit tolerance budget per handle
    return Math.max(0, Math.round(100 * (1 - errSum / scale)));
  }, [revealed, userSlopes]);

  // Drag logic — operates on the f' SVG
  const onPointerDown = (i) => (e) => {
    if (revealed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(i);
  };

  const onPointerMove = useCallback((e) => {
    if (dragging === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgY = ((e.clientY - rect.top) / rect.height) * H;
    const clamped = Math.max(dfMin, Math.min(dfMax, fromSYdf(svgY)));
    setUserSlopes(prev => {
      const next = [...prev];
      next[dragging] = clamped;
      return next;
    });
  }, [dragging]);

  const onPointerUp = useCallback(() => setDragging(null), []);

  const reset = () => { setUserSlopes(Array(HANDLES_X.length).fill(0)); setRevealed(false); };

  // Y-axis grid
  const fGrid  = [-2, 0, 2];
  const dfGrid = [-3, 0, 3, 6, 9];

  // Handle color after reveal
  const handleColor = (i) => {
    if (!revealed) return '#3b82f6';
    const err = Math.abs(userSlopes[i] - ACTUAL_SLOPES[i]);
    return err < 1.2 ? '#10b981' : err < 3.5 ? '#f59e0b' : '#ef4444';
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 select-none">
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-x-4">
        <h3 className="text-base font-semibold">Sketch f′ from f</h3>
        <span className="text-xs text-slate-400 font-mono">f(x) = x³ − 3x</span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        <strong>Top:</strong> graph of f. Orange dots mark its peaks and valleys — those are where f′ = 0.
        <br />
        <strong>Bottom:</strong> drag the handles to sketch your f′, then click Reveal.
      </p>

      {/* f(x) panel */}
      <p className="text-xs font-semibold text-slate-400 mb-0.5 ml-8">f(x)</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-t-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
        {/* Grid lines */}
        {fGrid.map(v => (
          <line key={v}
            x1={PAD.l} y1={toSYf(v)} x2={W - PAD.r} y2={toSYf(v)}
            stroke={v === 0 ? '#64748b' : '#e2e8f0'}
            strokeWidth={v === 0 ? 1.5 : 0.75}
            strokeDasharray={v === 0 ? '' : '4 3'}
          />
        ))}
        {fGrid.map(v => (
          <text key={v} x={PAD.l - 5} y={toSYf(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v}</text>
        ))}
        {/* Vertical guides at handle x-values */}
        {HANDLES_X.map(hx => (
          <line key={hx} x1={toSX(hx)} y1={PAD.t} x2={toSX(hx)} y2={H - PAD.b} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {/* f curve */}
        <path d={splinePath(fCurve)} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
        {/* Peak / valley markers (where f' = 0: x = ±1) */}
        {[-1, 1].map(cx => (
          <g key={cx}>
            <circle cx={toSX(cx)} cy={toSYf(f(cx))} r="5" fill="#f59e0b" />
            <text x={toSX(cx)} y={toSYf(f(cx)) - 9} textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="600">f′=0</text>
          </g>
        ))}
      </svg>

      {/* f'(x) panel */}
      <p className="text-xs font-semibold text-slate-400 mt-2 mb-0.5 ml-8">f′(x) — your sketch</p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-b-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 touch-none"
        style={{ cursor: revealed ? 'default' : 'ns-resize' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Grid lines */}
        {dfGrid.map(v => (
          <line key={v}
            x1={PAD.l} y1={toSYdf(v)} x2={W - PAD.r} y2={toSYdf(v)}
            stroke={v === 0 ? '#64748b' : '#e2e8f0'}
            strokeWidth={v === 0 ? 1.5 : 0.75}
            strokeDasharray={v === 0 ? '' : '4 3'}
          />
        ))}
        {dfGrid.map(v => (
          <text key={v} x={PAD.l - 5} y={toSYdf(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v}</text>
        ))}
        {/* Vertical guides */}
        {HANDLES_X.map(hx => (
          <line key={hx} x1={toSX(hx)} y1={PAD.t} x2={toSX(hx)} y2={H - PAD.b} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {/* x-axis labels */}
        {HANDLES_X.map(hx => (
          <text key={hx} x={toSX(hx)} y={H - PAD.b + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">{hx}</text>
        ))}

        {/* Actual f' curve (revealed only) */}
        {revealed && (
          <path d={splinePath(actualCurve)} fill="none" stroke="#10b981" strokeWidth="2" opacity="0.85" />
        )}

        {/* User curve */}
        {handlePts.length > 1 && (
          <path d={splinePath(handlePts)} fill="none" stroke="#3b82f6" strokeWidth="2" />
        )}

        {/* Drag handles */}
        {HANDLES_X.map((hx, i) => (
          <g key={i}>
            <circle
              cx={toSX(hx)}
              cy={toSYdf(userSlopes[i])}
              r={dragging === i ? 9 : 7}
              fill={handleColor(i)}
              stroke="white"
              strokeWidth="2"
              onPointerDown={onPointerDown(i)}
              style={{ cursor: revealed ? 'default' : 'ns-resize' }}
            />
            <text x={toSX(hx)} y={toSYdf(userSlopes[i]) - 11} textAnchor="middle" fontSize="9" fill="#64748b">
              {userSlopes[i].toFixed(1)}
            </text>
          </g>
        ))}
      </svg>

      {/* Controls row */}
      <div className="flex gap-3 mt-3 items-center flex-wrap">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            Reveal f′
          </button>
        ) : (
          <button
            onClick={reset}
            className="px-4 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
          >
            Try Again
          </button>
        )}
        {revealed && score !== null && (
          <>
            <span className="text-sm font-bold">
              Score:{' '}
              <span className={score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-yellow-500' : 'text-red-500'}>
                {score}%
              </span>
            </span>
            <span className="text-xs text-emerald-600 ml-1">— actual f′</span>
            <span className="text-xs text-blue-500">— your sketch</span>
          </>
        )}
        {!revealed && (
          <p className="text-xs text-slate-400">
            Hint: orange marks = peaks/valleys of f = where f′ must cross zero.
          </p>
        )}
      </div>

      {revealed && (
        <div className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-500 space-y-1">
          <p><strong>Reading rule:</strong> wherever f rises, f′ is positive. Where f falls, f′ is negative. At every peak or valley of f, f′ = 0.</p>
          <p><strong>Shape rule:</strong> f′(x) = 3x² − 3 is a parabola opening up — it starts high, dips to its minimum at x = 0 (where it equals −3), then rises again. The zeros at x = ±1 match f′s = 0 orange markers.</p>
        </div>
      )}
    </div>
  );
}
