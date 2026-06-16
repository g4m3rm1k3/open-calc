import React, { useMemo, useState } from 'react';

const TAU = Math.PI * 2;

function fmt(n) {
  const clamped = Math.abs(n) < 1e-10 ? 0 : n;
  return clamped.toFixed(3);
}

export default function VelocityVectorProofLab() {
  const [theta, setTheta] = useState(Math.PI / 6);

  const model = useMemo(() => {
    const rx = Math.cos(theta);
    const ry = Math.sin(theta);
    const vx = -Math.sin(theta);
    const vy = Math.cos(theta);
    const dot = rx * vx + ry * vy;
    return { rx, ry, vx, vy, dot };
  }, [theta]);

  const size = 320;
  const center = size / 2;
  const radius = 100;

  const toX = (x) => center + x * radius;
  const toY = (y) => center - y * radius;

  const px = toX(model.rx);
  const py = toY(model.ry);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Velocity Vector Geometric Proof</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        On the unit circle, the radius vector is (cos(theta), sin(theta)). The motion vector is always perpendicular, so it must be
        (-sin(theta), cos(theta)). The y-component of velocity is exactly cos(theta), which proves d/dtheta[sin(theta)] = cos(theta).
      </p>

      <div className="mb-4">
        <label className="text-sm font-medium">theta (radians): {theta.toFixed(3)}</label>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          <defs>
            <marker id="rad-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#3b82f6" />
            </marker>
            <marker id="vel-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#ef4444" />
            </marker>
          </defs>

          <line x1="20" y1={center} x2={size - 20} y2={center} stroke="#94a3b8" strokeWidth="1" />
          <line x1={center} y1="20" x2={center} y2={size - 20} stroke="#94a3b8" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#334155" strokeWidth="2" opacity="0.45" />

          <line x1={center} y1={center} x2={px} y2={py} stroke="#3b82f6" strokeWidth="3" markerEnd="url(#rad-arrow)" />
          <line
            x1={px}
            y1={py}
            x2={toX(model.rx + model.vx * 0.75)}
            y2={toY(model.ry + model.vy * 0.75)}
            stroke="#ef4444"
            strokeWidth="3"
            markerEnd="url(#vel-arrow)"
          />

          <line x1={px} y1={py} x2={px} y2={toY(model.ry + model.vy * 0.75)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" />

          <circle cx={px} cy={py} r="5" fill="#0ea5e9" />

          <text x={14} y={22} fontSize="12" fill="#3b82f6">radius = (cos(theta), sin(theta))</text>
          <text x={14} y={40} fontSize="12" fill="#ef4444">velocity = (-sin(theta), cos(theta))</text>
          <text x={14} y={58} fontSize="12" fill="#f59e0b">dy/dtheta = velocity_y = cos(theta)</text>
        </svg>

        <div className="space-y-3 text-sm">
          <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
            <p className="font-semibold mb-1">Radius vector</p>
            <p className="font-mono">(cos(theta), sin(theta)) = ({fmt(model.rx)}, {fmt(model.ry)})</p>
          </div>
          <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
            <p className="font-semibold mb-1">Velocity vector</p>
            <p className="font-mono">(-sin(theta), cos(theta)) = ({fmt(model.vx)}, {fmt(model.vy)})</p>
          </div>
          <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
            <p className="font-semibold mb-1">Perpendicular check</p>
            <p className="font-mono">dot(radius, velocity) = {fmt(model.dot)} (always 0)</p>
          </div>
          <div className="p-3 rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
            <p className="font-semibold">Aha</p>
            <p>
              The red vector y-component equals cos(theta). That y-component is exactly the instantaneous change of height,
              so d/dtheta[sin(theta)] = cos(theta).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
