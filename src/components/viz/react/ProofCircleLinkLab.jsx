import React, { useEffect, useMemo, useRef, useState } from 'react';
import KatexInline from '../../math/KatexInline.jsx';

const TAU = 2 * Math.PI;

function fmt(v, digits = 3) {
  const n = Math.abs(v) < 1e-10 ? 0 : v;
  return n.toFixed(digits);
}

export default function ProofCircleLinkLab() {
  const [theta, setTheta] = useState(Math.PI / 6);
  const [h, setH] = useState(0.45);
  const [focus, setFocus] = useState(null);
  const lineRefs = useRef({});

  const model = useMemo(() => {
    const x = Math.cos(theta);
    const y = Math.sin(theta);
    const x2 = Math.cos(theta + h);
    const y2 = Math.sin(theta + h);
    const verticalTerm = Math.cos(theta) * (Math.sin(h) / h);
    const horizontalTerm = Math.sin(theta) * ((Math.cos(h) - 1) / h);
    return { x, y, x2, y2, verticalTerm, horizontalTerm };
  }, [theta, h]);

  const size = 340;
  const c = size / 2;
  const r = 110;
  const sx = (x) => c + x * r;
  const sy = (y) => c - y * r;

  const px = sx(model.x);
  const py = sy(model.y);
  const nx = sx(model.x2);
  const ny = sy(model.y2);

  const showVerticalGlow = focus === 'vertical';
  const showGapBlink = focus === 'horizontal';

  useEffect(() => {
    const key = focus === 'vertical' ? 'verticalLine' : focus === 'horizontal' ? 'horizontalLine' : null;
    if (!key) return;
    const node = lineRefs.current[key];
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focus]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <style>{`
        @keyframes pc-blink {
          0% { opacity: 1; }
          50% { opacity: 0.1; }
          100% { opacity: 1; }
        }
      `}</style>

      <h3 className="text-lg font-semibold mb-2">Formal Proof Live-Link to the Circle</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Hover the proof terms. The matching geometry on the circle lights up so the algebra reads like a high-definition script of motion.
      </p>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 mb-4 max-h-44 overflow-auto">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Linked proof lines</p>
        <div className="space-y-2 text-sm leading-relaxed">
          <p>
            <KatexInline expr="\frac{d}{dx}[\sin x] = \lim_{h\to 0}\frac{\sin(x+h)-\sin x}{h}" />
          </p>
          <p
            ref={(el) => {
              lineRefs.current.horizontalLine = el;
            }}
            onMouseEnter={() => setFocus('horizontal')}
            onMouseLeave={() => setFocus(null)}
            className={`rounded px-2 py-1 transition-colors ${
              showGapBlink ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-transparent'
            }`}
          >
            <KatexInline expr="\cdots + \sin x\cdot\frac{\cos h - 1}{h} + \cdots" />
          </p>
          <p
            ref={(el) => {
              lineRefs.current.verticalLine = el;
            }}
            onMouseEnter={() => setFocus('vertical')}
            onMouseLeave={() => setFocus(null)}
            className={`rounded px-2 py-1 transition-colors ${
              showVerticalGlow ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-transparent'
            }`}
          >
            <KatexInline expr="\cdots + \cos x\cdot\frac{\sin h}{h}" />
          </p>
          <p>
            <KatexInline expr="h\to 0:\ \frac{\cos h - 1}{h}\to 0,\ \frac{\sin h}{h}\to 1,\ \text{so only cosine survives.}" />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Formal proof split</p>
          <p className="text-sm mb-3 break-words">
            <KatexInline expr="\frac{d}{dx}[\sin x] = \lim_{h\to 0}\bigl[" />
            <span
              className="px-1 rounded cursor-pointer transition-colors"
              onMouseEnter={() => setFocus('horizontal')}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus('horizontal')}
              onBlur={() => setFocus(null)}
              tabIndex={0}
              style={{ backgroundColor: showGapBlink ? 'rgba(245, 158, 11, 0.25)' : 'transparent' }}
            >
              <KatexInline expr="\sin x\cdot\frac{\cos h - 1}{h}" />
            </span>
            <span className="mx-1"><KatexInline expr="+" /></span>
            <span
              className="px-1 rounded cursor-pointer transition-colors"
              onMouseEnter={() => setFocus('vertical')}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus('vertical')}
              onBlur={() => setFocus(null)}
              tabIndex={0}
              style={{ backgroundColor: showVerticalGlow ? 'rgba(239, 68, 68, 0.25)' : 'transparent' }}
            >
              <KatexInline expr="\cos x\cdot\frac{\sin h}{h}" />
            </span>
            <KatexInline expr="\bigr]" />
          </p>

          <div className="space-y-2 text-sm">
            <p>
              Horizontal correction term value:{' '}
              <span className="font-mono text-amber-700 dark:text-amber-300">{fmt(model.horizontalTerm, 5)}</span>
            </p>
            <p>
              Vertical survivor term value:{' '}
              <span className="font-mono text-rose-700 dark:text-rose-300">{fmt(model.verticalTerm, 5)}</span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
            <line x1="20" y1={c} x2={size - 20} y2={c} stroke="#94a3b8" strokeWidth="1" />
            <line x1={c} y1="20" x2={c} y2={size - 20} stroke="#94a3b8" strokeWidth="1" />
            <circle cx={c} cy={c} r={r} fill="none" stroke="#334155" strokeWidth="2" opacity="0.45" />

            <line x1={c} y1={c} x2={px} y2={py} stroke="#2563eb" strokeWidth="2.5" />
            <line x1={c} y1={c} x2={nx} y2={ny} stroke="#64748b" strokeWidth="2" opacity="0.7" />

            <line
              x1={px}
              y1={py}
              x2={px}
              y2={sy(model.y + Math.cos(theta) * 0.55)}
              stroke={showVerticalGlow ? '#ef4444' : '#f87171'}
              strokeWidth={showVerticalGlow ? 5 : 2.5}
              style={{ filter: showVerticalGlow ? 'drop-shadow(0 0 7px rgba(239,68,68,0.9))' : 'none' }}
            />

            <line
              x1={px}
              y1={ny}
              x2={nx}
              y2={ny}
              stroke={showGapBlink ? '#f59e0b' : '#fbbf24'}
              strokeWidth={showGapBlink ? 4 : 2}
              strokeDasharray="5 4"
              style={{ animation: showGapBlink ? 'pc-blink 650ms ease-in-out infinite' : 'none' }}
            />

            <circle cx={px} cy={py} r="5" fill="#0ea5e9" />
            <circle cx={nx} cy={ny} r="4.5" fill="#64748b" />

            <text x="12" y="20" fontSize="12" fill="#64748b">point at theta</text>
            <text x="12" y="36" fontSize="12" fill="#64748b">point at theta+h</text>
            <text x="12" y="52" fontSize="12" fill="#ef4444">vertical velocity arrow</text>
            <text x="12" y="68" fontSize="12" fill="#f59e0b">horizontal gap (vanishes)</text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">theta: {theta.toFixed(3)}</label>
          <input
            type="range"
            min="0"
            max={TAU}
            step="0.01"
            value={theta}
            onChange={(e) => setTheta(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">h (small step): {h.toFixed(3)}</label>
          <input
            type="range"
            min="0.05"
            max="0.9"
            step="0.01"
            value={h}
            onChange={(e) => setH(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Unified strategy map</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="rounded border border-slate-200 dark:border-slate-700 p-2">
            <p className="font-semibold">Limit definition</p>
            <p>Compare rise to tiny arc walk.</p>
            <p className="text-slate-500 dark:text-slate-400">Derivative becomes climbing speed.</p>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-700 p-2">
            <p className="font-semibold">Addition identity</p>
            <p>Decompose new position into old direction + change direction.</p>
            <p className="text-slate-500 dark:text-slate-400">Separates where we were vs where we are going.</p>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-700 p-2">
            <p className="font-semibold">Fundamental limits</p>
            <p>Horizontal correction vanishes; vertical part survives.</p>
            <p className="text-slate-500 dark:text-slate-400">Only cosine-strength motion remains.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
