import React, { useMemo, useState } from 'react';

const TAU = Math.PI * 2;

function signLabel(v) {
  if (v > 0.05) return 'positive';
  if (v < -0.05) return 'negative';
  return 'zero';
}

export default function TrigMotionBridgeLab() {
  const [theta, setTheta] = useState(Math.PI / 6);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState('Predict the sign of d/dx[sin x] at current theta.');

  const state = useMemo(() => {
    const sinv = Math.sin(theta);
    const cosv = Math.cos(theta);
    return { sinv, cosv, sign: signLabel(cosv) };
  }, [theta]);

  function checkGuess() {
    if (!guess) return;
    if (guess === state.sign) {
      setScore((s) => s + 1);
      setMsg('Correct. Derivative sign matches circle motion.');
    } else {
      setMsg(`Not this time. Correct sign is ${state.sign}.`);
    }
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Trig Motion Bridge Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Unit-circle motion (intuition), slope sign of sine (math), and derivative rule d/dx[sin x] = cos x (rigor) in one loop.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4">
          <p className="font-semibold mb-2">Circle state</p>
          <div className="relative w-48 h-48 mx-auto rounded-full border-2 border-sky-300 dark:border-sky-700">
            <div className="absolute left-1/2 top-1/2 w-0.5 h-48 -translate-x-1/2 -translate-y-1/2 bg-slate-300/60" />
            <div className="absolute left-1/2 top-1/2 h-0.5 w-48 -translate-x-1/2 -translate-y-1/2 bg-slate-300/60" />
            <div
              className="absolute w-3 h-3 rounded-full bg-rose-500"
              style={{
                left: `calc(50% + ${Math.cos(theta) * 92}px - 6px)`,
                top: `calc(50% - ${Math.sin(theta) * 92}px - 6px)`,
              }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm">
          <p className="font-semibold mb-2">Live derivative readout</p>
          <p className="font-mono">sin(theta) = {state.sinv.toFixed(4)}</p>
          <p className="font-mono">cos(theta) = {state.cosv.toFixed(4)}</p>
          <p className="font-mono">d/dx[sin x] sign: {state.sign}</p>
          <div className="mt-3 p-2 rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
            <p>When theta is where y-height is rising, derivative is positive. When y-height falls, derivative is negative.</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium">theta: {theta.toFixed(3)} rad</label>
        <input type="range" min="0" max={TAU} step="0.01" value={theta} onChange={(e) => setTheta(Number(e.target.value))} className="w-full mt-2" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={guess} onChange={(e) => setGuess(e.target.value)} className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm">
          <option value="">Predict derivative sign</option>
          <option value="positive">positive</option>
          <option value="zero">zero</option>
          <option value="negative">negative</option>
        </select>
        <button onClick={checkGuess} className="px-3 py-1.5 rounded bg-brand-500 text-white text-sm">Check</button>
        <span className="text-sm">Score: {score}</span>
        <span className="text-sm text-slate-700 dark:text-slate-300">{msg}</span>
      </div>
    </div>
  );
}
