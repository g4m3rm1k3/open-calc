import React, { useMemo, useState } from 'react';

const R = 5;

function mapX(x) {
  return 180 + x * 24;
}

function mapY(y) {
  return 130 - y * 24;
}

export default function ImplicitTangentPlayground() {
  const [theta, setTheta] = useState(Math.PI / 4);

  const state = useMemo(() => {
    const x = R * Math.cos(theta);
    const y = R * Math.sin(theta);
    const slope = Math.abs(y) < 1e-5 ? Number.POSITIVE_INFINITY : -x / y;
    const tangentPoints = [];

    for (let t = -6; t <= 6; t += 0.5) {
      const tx = x + t;
      const ty = Number.isFinite(slope) ? y + slope * t : y + t;
      tangentPoints.push(`${mapX(tx)},${mapY(ty)}`);
    }

    return { x, y, slope, tangent: tangentPoints.join(' ') };
  }, [theta]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Implicit Tangent Playground</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Move on x^2 + y^2 = 25 and watch dy/dx = -x/y control the tangent instantly.
      </p>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 mb-4 overflow-x-auto">
        <svg viewBox="0 0 360 260" className="w-full min-w-[320px]">
          <line x1="20" y1="130" x2="340" y2="130" stroke="currentColor" opacity="0.2" />
          <line x1="180" y1="20" x2="180" y2="240" stroke="currentColor" opacity="0.2" />
          <circle cx="180" cy="130" r={R * 24} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
          {Number.isFinite(state.slope) ? (
            <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points={state.tangent} />
          ) : (
            <line x1={mapX(state.x)} y1="20" x2={mapX(state.x)} y2="240" stroke="#f59e0b" strokeWidth="2" />
          )}
          <circle cx={mapX(state.x)} cy={mapY(state.y)} r="6" fill="#ef4444" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4 text-sm">
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold">Intuition</p>
          <p>The tangent rotates smoothly as your point moves around the circle.</p>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold">Math</p>
          <p className="font-mono">x^2 + y^2 = 25</p>
          <p className="font-mono">2x + 2y(dy/dx) = 0</p>
          <p className="font-mono">dy/dx = -x/y</p>
        </div>
        <div className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="font-semibold">Rigor</p>
          <p className="font-mono">x = {state.x.toFixed(3)}</p>
          <p className="font-mono">y = {state.y.toFixed(3)}</p>
          <p className="font-mono">dy/dx = {Number.isFinite(state.slope) ? state.slope.toFixed(3) : 'vertical'}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Point angle theta: {theta.toFixed(3)} rad</label>
        <input
          type="range"
          min="0"
          max={(Math.PI * 2).toString()}
          step="0.01"
          value={theta}
          onChange={(e) => setTheta(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>
    </div>
  );
}
