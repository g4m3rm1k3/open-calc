import React, { useMemo, useState } from 'react';

function buildPoints(n, radius = 110, cx = 160, cy = 160) {
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    pts.push({
      id: i,
      x: cx + radius * Math.cos(a),
      y: cy + radius * Math.sin(a),
    });
  }
  return pts;
}

export default function HandshakeCliqueLab() {
  const [people, setPeople] = useState(8);

  const points = useMemo(() => buildPoints(people), [people]);
  const edges = useMemo(() => {
    const out = [];
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        out.push([points[i], points[j]]);
      }
    }
    return out;
  }, [points]);

  const handshakeCount = (people * (people - 1)) / 2;

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Handshake Visualizer</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Every line is one unique pair. Watch how quickly pair-counts grow as n increases.
      </p>

      <div className="mb-4">
        <label className="text-sm font-medium">People: {people}</label>
        <input
          className="w-full mt-2"
          type="range"
          min="2"
          max="20"
          step="1"
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
        />
      </div>

      <svg viewBox="0 0 320 320" className="w-full bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-700">
        {edges.map(([a, b], idx) => (
          <line
            key={idx}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#94a3b8"
            strokeWidth="1"
            opacity="0.65"
          />
        ))}

        {points.map((p, idx) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r="10" fill="#0ea5e9" stroke="#082f49" strokeWidth="1.5" />
            <text x={p.x} y={p.y + 4} textAnchor="middle" className="fill-white text-[9px] font-bold">{idx + 1}</text>
          </g>
        ))}
      </svg>

      <div className="mt-4 text-sm">
        <p><span className="font-semibold">Formula:</span> n(n-1)/2</p>
        <p><span className="font-semibold">Current:</span> {people}({people}-1)/2 = {handshakeCount}</p>
      </div>
    </div>
  );
}
