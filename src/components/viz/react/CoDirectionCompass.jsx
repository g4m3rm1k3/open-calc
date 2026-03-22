import React, { useMemo, useState } from 'react';

const TAU = Math.PI * 2;

function directionText(v, posLabel, negLabel) {
  if (Math.abs(v) < 1e-6) return 'flat';
  return v > 0 ? posLabel : negLabel;
}

export default function CoDirectionCompass() {
  const [theta, setTheta] = useState(Math.PI / 4);

  const state = useMemo(() => {
    const sinv = Math.sin(theta);
    const cosv = Math.cos(theta);
    const dsin = cosv;
    const dcos = -sinv;
    return { sinv, cosv, dsin, dcos };
  }, [theta]);

  const quadrant = Math.floor((theta % TAU) / (Math.PI / 2)) + 1;

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Co- Direction Compass</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        As theta increases counterclockwise, sine tracks vertical motion and cosine tracks horizontal motion. Early in Q1,
        vertical position rises (positive derivative) while horizontal position moves left (negative derivative), which is why
        d/dx[cos x] starts as a negative quantity.
      </p>

      <div className="mb-4">
        <label className="text-sm font-medium">theta (radians): {theta.toFixed(3)} | quadrant: Q{quadrant}</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4">
          <p className="font-semibold mb-2">Directional readout</p>
          <div className="space-y-2 text-sm">
            <p>Height y = sin(theta) = <span className="font-mono">{state.sinv.toFixed(3)}</span></p>
            <p>Horizontal x = cos(theta) = <span className="font-mono">{state.cosv.toFixed(3)}</span></p>
            <p>dy/dtheta = cos(theta) = <span className="font-mono">{state.dsin.toFixed(3)}</span> ({directionText(state.dsin, 'going up', 'going down')})</p>
            <p>dx/dtheta = -sin(theta) = <span className="font-mono">{state.dcos.toFixed(3)}</span> ({directionText(state.dcos, 'moving right', 'moving left')})</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4">
          <p className="font-semibold mb-2">Sign compass</p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="mb-1">sine slope sign (cos):</p>
              <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${state.dsin >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, Math.abs(state.dsin) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <p className="mb-1">cosine slope sign (-sin):</p>
              <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${state.dcos >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, Math.abs(state.dcos) * 100)}%` }}
                />
              </div>
            </div>
            <div className="p-2 rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
              <p className="font-semibold">Rule translated to motion</p>
              <p>
                Co-functions are tied to the complementary direction. In many intervals where sine rises, cosine is sliding left,
                so its derivative is negative.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
