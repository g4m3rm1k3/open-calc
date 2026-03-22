import React, { useMemo, useState } from 'react';

function f(x) {
  if (Math.abs(x - 2) < 1e-8) return Number.NaN;
  return (x * x - 4) / (x - 2);
}

function mapX(x) {
  return 24 + ((x + 1) / 6) * 312;
}

function mapY(y) {
  return 180 - ((y - 1) / 6) * 156;
}

export default function LimitBridgeLab() {
  const [h, setH] = useState(0.7);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');

  const state = useMemo(() => {
    const c = 2;
    const leftX = c - h;
    const rightX = c + h;
    const leftY = f(leftX);
    const rightY = f(rightX);
    const avgY = (leftY + rightY) / 2;
    const target = 4;
    const error = Math.abs(avgY - target);

    const pathPoints = [];
    for (let x = -1; x <= 5; x += 0.1) {
      const y = f(x);
      pathPoints.push(`${mapX(x)},${mapY(y)}`);
    }

    return { c, leftX, rightX, leftY, rightY, avgY, target, error, path: pathPoints.join(' ') };
  }, [h]);

  function checkGuess() {
    const n = Number(guess);
    if (Number.isNaN(n)) {
      setFeedback('Enter a numeric guess first.');
      return;
    }
    const diff = Math.abs(n - state.target);
    if (diff < 0.05) setFeedback('Perfect. You found the limit.');
    else if (diff < 0.25) setFeedback('Very close. Tighten your estimate.');
    else setFeedback('Not there yet. Watch both sides as h shrinks.');
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Limit Bridge Lab: Journey vs Destination</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Shrink h to bring two points toward x = 2 from opposite sides. This converts visual intuition into the limit statement.
      </p>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 mb-4 overflow-x-auto">
        <svg viewBox="0 0 360 210" className="w-full min-w-[320px]">
          <line x1="24" y1="180" x2="336" y2="180" stroke="currentColor" opacity="0.35" />
          <line x1={mapX(2)} y1="24" x2={mapX(2)} y2="186" stroke="currentColor" opacity="0.2" strokeDasharray="4 4" />
          <line x1="24" y1={mapY(4)} x2="336" y2={mapY(4)} stroke="#f59e0b" opacity="0.35" strokeDasharray="4 4" />

          <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={state.path} />

          <circle cx={mapX(2)} cy={mapY(4)} r="5" fill="white" stroke="#ef4444" strokeWidth="2" />

          <circle cx={mapX(state.leftX)} cy={mapY(state.leftY)} r="4.5" fill="#22c55e" />
          <circle cx={mapX(state.rightX)} cy={mapY(state.rightY)} r="4.5" fill="#a855f7" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4 text-sm">
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold">Intuition</p>
          <p>Both colored points are pulled toward the hole. They never touch x = 2, but they agree on where they are heading.</p>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold">Math</p>
          <p className="font-mono mt-1">f(x) = (x^2 - 4)/(x - 2) = x + 2 (x != 2)</p>
          <p className="font-mono mt-1">left: {state.leftY.toFixed(4)} right: {state.rightY.toFixed(4)}</p>
        </div>
        <div className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="font-semibold">Rigor</p>
          <p className="font-mono mt-1">h = {h.toFixed(3)}</p>
          <p className="font-mono">|avg - 4| = {state.error.toFixed(5)}</p>
          <p className="text-xs mt-1">As h -> 0, error -> 0.</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium">Approach distance h: {h.toFixed(3)}</label>
        <input
          type="range"
          min="0.02"
          max="1.5"
          step="0.01"
          value={h}
          onChange={(e) => setH(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="number"
          step="0.01"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Guess the limit"
          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
        />
        <button onClick={checkGuess} className="px-3 py-1.5 rounded bg-brand-500 text-white text-sm">
          Check guess
        </button>
        {feedback && <span className="text-sm text-slate-700 dark:text-slate-300">{feedback}</span>}
      </div>
    </div>
  );
}
