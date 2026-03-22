import React, { useMemo, useState } from 'react';

function mapX(x) {
  return 20 + (x / 4) * 300;
}

function mapY(y) {
  return 170 - ((y + 1) / 6) * 140;
}

export default function ContinuityRepairGame() {
  const [dotY, setDotY] = useState(2);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Move the red point to repair continuity at x = 2.');

  const state = useMemo(() => {
    const target = 4;
    const gap = Math.abs(dotY - target);
    const grade = gap < 0.05 ? 'perfect' : gap < 0.35 ? 'close' : 'miss';
    return { target, gap, grade };
  }, [dotY]);

  function lockAnswer() {
    if (state.grade === 'perfect') {
      setScore((s) => s + 1);
      setMessage('Continuity repaired. limit = f(2). Great placement.');
    } else if (state.grade === 'close') {
      setMessage('Almost there. Nudge the point slightly upward.');
    } else {
      setMessage('Still broken. The function value must match the limit exactly.');
    }
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Continuity Repair Game</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Graph tracks follow y = x + 2, but x = 2 is broken. Repair the point so the idea, formula, and theorem align.
      </p>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 mb-4 overflow-x-auto">
        <svg viewBox="0 0 340 200" className="w-full min-w-[320px]">
          <line x1="20" y1="170" x2="320" y2="170" stroke="currentColor" opacity="0.35" />
          <line x1={mapX(2)} y1="26" x2={mapX(2)} y2="176" stroke="currentColor" opacity="0.2" strokeDasharray="4 4" />
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            points={Array.from({ length: 41 }, (_, i) => {
              const x = i * 0.1;
              const y = x + 2;
              if (Math.abs(x - 2) < 0.08) return null;
              return `${mapX(x)},${mapY(y)}`;
            }).filter(Boolean).join(' ')}
          />

          <circle cx={mapX(2)} cy={mapY(4)} r="5" fill="white" stroke="#64748b" strokeWidth="2" />
          <circle cx={mapX(2)} cy={mapY(dotY)} r="6" fill="#ef4444" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4 text-sm">
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold">Intuition</p>
          <p>If you must lift your pencil at x = 2, continuity is broken.</p>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold">Math</p>
          <p className="font-mono">lim(x→2) (x+2) = 4</p>
          <p className="font-mono">Current f(2) = {dotY.toFixed(2)}</p>
        </div>
        <div className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="font-semibold">Rigor</p>
          <p className="font-mono">|f(2) - lim| = {state.gap.toFixed(3)}</p>
          <p>Score: {score}</p>
        </div>
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium">Set f(2): {dotY.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="6"
          step="0.01"
          value={dotY}
          onChange={(e) => setDotY(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={lockAnswer} className="px-3 py-1.5 rounded bg-brand-500 text-white text-sm">
          Lock answer
        </button>
        <button
          onClick={() => {
            setDotY(2);
            setMessage('Move the red point to repair continuity at x = 2.');
          }}
          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm"
        >
          Reset
        </button>
        <span className="text-sm text-slate-700 dark:text-slate-300">{message}</span>
      </div>
    </div>
  );
}
