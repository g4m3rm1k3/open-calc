import React, { useMemo, useState } from 'react';
import KatexInline from '../../math/KatexInline.jsx';

export default function LeibnizUnitTrackerLab() {
  const [r, setR] = useState(6);
  const [drdt, setDrdt] = useState(2);
  const [hover, setHover] = useState(false);

  const vals = useMemo(() => {
    const dVdr = 4 * Math.PI * r * r;
    const dVdt = dVdr * drdt;
    return { dVdr, dVdt };
  }, [r, drdt]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Leibniz Unit Tracker (Balloon)</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Hover the formula to watch units cancel. Chain rule is a physical requirement, not just symbolic tradition.
      </p>

      <div
        className={`rounded-lg border p-3 mb-4 transition-colors ${hover ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950'}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <p className="font-mono text-sm mb-2"><KatexInline expr="\frac{dV}{dt}=\frac{dV}{dr}\cdot\frac{dr}{dt}" /></p>
        <p className="font-mono text-sm">
          <KatexInline expr="\frac{\text{cm}^3}{\text{cm}}\cdot\frac{\text{cm}}{\text{s}}=\frac{\text{cm}^3}{\text{s}}" />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">Radius r (cm): {r.toFixed(1)}</label>
          <input type="range" min="1" max="12" step="0.1" value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium">dr/dt (cm/s): {drdt.toFixed(1)}</label>
          <input type="range" min="0.2" max="5" step="0.1" value={drdt} onChange={(e) => setDrdt(Number(e.target.value))} className="w-full mt-2" />
        </div>
      </div>

      <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm space-y-1">
        <p><span className="font-semibold">dV/dr:</span> {vals.dVdr.toFixed(3)} cm^3/cm</p>
        <p><span className="font-semibold">dr/dt:</span> {drdt.toFixed(3)} cm/s</p>
        <p><span className="font-semibold">dV/dt:</span> {vals.dVdt.toFixed(3)} cm^3/s</p>
      </div>
    </div>
  );
}
