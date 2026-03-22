import React, { useMemo, useState } from 'react';

const X_MIN = 0;
const X_MAX = 4;
const Y_MIN = 2;
const Y_MAX = 6;
const PLOT_LEFT = 24;
const PLOT_TOP = 24;
const PLOT_W = 312;
const PLOT_H = 162;
const SCALE = Math.min(PLOT_W / (X_MAX - X_MIN), PLOT_H / (Y_MAX - Y_MIN)); // Equal x/y units.
const X_OFFSET = PLOT_LEFT + (PLOT_W - (X_MAX - X_MIN) * SCALE) / 2;
const Y_OFFSET = PLOT_TOP + (PLOT_H - (Y_MAX - Y_MIN) * SCALE) / 2;

function f(x) {
  if (Math.abs(x - 2) < 1e-8) return Number.NaN;
  return (x * x - 4) / (x - 2);
}

function mapX(x) {
  return X_OFFSET + (x - X_MIN) * SCALE;
}

function mapY(y) {
  return Y_OFFSET + (Y_MAX - y) * SCALE;
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
    const leftError = Math.abs(leftY - target);
    const rightError = Math.abs(rightY - target);

    const leftPathPoints = [];
    const rightPathPoints = [];

    for (let x = X_MIN; x < 2; x += 0.05) {
      const y = f(x);
      leftPathPoints.push(`${mapX(x)},${mapY(y)}`);
    }

    for (let x = 2.05; x <= X_MAX; x += 0.05) {
      const y = f(x);
      rightPathPoints.push(`${mapX(x)},${mapY(y)}`);
    }

    return {
      c,
      leftX,
      rightX,
      leftY,
      rightY,
      avgY,
      target,
      error,
      leftError,
      rightError,
      leftPath: leftPathPoints.join(' '),
      rightPath: rightPathPoints.join(' '),
    };
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

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 mb-4">
        <svg viewBox="0 0 360 210" className="w-full">
          <rect x="24" y="24" width="312" height="162" fill="none" stroke="currentColor" opacity="0.15" />
          <line x1={mapX(2)} y1="24" x2={mapX(2)} y2="186" stroke="currentColor" opacity="0.25" strokeDasharray="4 4" />
          <line x1="24" y1={mapY(4)} x2="336" y2={mapY(4)} stroke="#f59e0b" opacity="0.35" strokeDasharray="4 4" />
          <text x={mapX(2) + 6} y="36" fill="currentColor" opacity="0.7" fontSize="10">x = 2</text>
          <text x="28" y={mapY(4) - 6} fill="#f59e0b" opacity="0.9" fontSize="10">L = 4</text>

          <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={state.leftPath} />
          <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={state.rightPath} />

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
          <p className="font-mono">Target limit L = {state.target.toFixed(2)}</p>
          <p className="font-mono">|left - L| = {state.leftError.toFixed(5)}</p>
          <p className="font-mono">|right - L| = {state.rightError.toFixed(5)}</p>
          <p className="text-xs mt-1">As h -> 0, both distances -> 0, so values approach 4.</p>
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
