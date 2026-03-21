import React, { useEffect, useMemo, useState } from 'react';

export default function SmallAnglePendulumLab() {
  const [angleDeg, setAngleDeg] = useState(10);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => t + 0.04), 40);
    return () => clearInterval(id);
  }, []);

  const theta0 = (angleDeg * Math.PI) / 180;
  const approxPeriod = 2.0;
  const exactPeriod = useMemo(() => {
    const correction = 1 + (theta0 * theta0) / 16 + (11 * Math.pow(theta0, 4)) / 3072;
    return approxPeriod * correction;
  }, [theta0]);

  const approxAngle = theta0 * Math.cos((2 * Math.PI * time) / approxPeriod);
  const exactAngle = theta0 * Math.cos((2 * Math.PI * time) / exactPeriod);
  const percentError = ((exactPeriod - approxPeriod) / exactPeriod) * 100;

  const originX = 100;
  const originY = 35;
  const len = 95;

  const approxBob = {
    x: originX + len * Math.sin(approxAngle),
    y: originY + len * Math.cos(approxAngle),
  };
  const exactBob = {
    x: 290 + len * Math.sin(exactAngle),
    y: originY + len * Math.cos(exactAngle),
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Small-Angle Pendulum Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Compare exact dynamics to the small-angle shortcut sin(theta) ~ theta.
      </p>

      <label className="text-sm font-medium">Initial angle: {angleDeg} deg</label>
      <input
        type="range"
        min="1"
        max="90"
        step="1"
        value={angleDeg}
        onChange={(e) => setAngleDeg(Number(e.target.value))}
        className="w-full mt-2 mb-4"
      />

      <svg viewBox="0 0 390 190" className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
        <text x="65" y="18" className="fill-slate-600 text-xs font-semibold">Small-angle model</text>
        <text x="265" y="18" className="fill-slate-600 text-xs font-semibold">Higher-fidelity model</text>

        <circle cx={originX} cy={originY} r="4" fill="#475569" />
        <line x1={originX} y1={originY} x2={approxBob.x} y2={approxBob.y} stroke="#0ea5e9" strokeWidth="2.2" />
        <circle cx={approxBob.x} cy={approxBob.y} r="10" fill="#0ea5e9" />

        <circle cx="290" cy={originY} r="4" fill="#475569" />
        <line x1="290" y1={originY} x2={exactBob.x} y2={exactBob.y} stroke="#22c55e" strokeWidth="2.2" />
        <circle cx={exactBob.x} cy={exactBob.y} r="10" fill="#22c55e" />
      </svg>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
          <p className="font-semibold">Shortcut period</p>
          <p>{approxPeriod.toFixed(4)} s</p>
        </div>
        <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <p className="font-semibold">Exact period (approx)</p>
          <p>{exactPeriod.toFixed(4)} s</p>
        </div>
      </div>

      <p className="text-sm mt-3 text-slate-700 dark:text-slate-200">
        Relative timing error: {percentError.toFixed(3)}%
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        At small angles, the two models nearly match. At large angles, the shortcut drifts.
      </p>
    </div>
  );
}
