import React, { useState, useMemo } from 'react';

export default function DualGraphSync() {
  const [a, setA] = useState(1.5);

  const b = a * a;
  const slopeBlue = 2 * a;
  const slopeRed = 1 / slopeBlue;

  // Viewbox settings
  const width = 500;
  const height = 500;
  const margin = 40;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;
  const xDomain = [-0.5, 4.5];
  const yDomain = [-0.5, 4.5];

  const xScale = (x) => margin + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotWidth;
  const yScale = (y) => height - margin - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotHeight;

  // Generate paths
  const bluePath = useMemo(() => {
    let d = '';
    for (let x = 0; x <= 2.2; x += 0.05) {
      const px = xScale(x);
      const py = yScale(x * x);
      d += (x === 0 ? 'M' : 'L') + `${px},${py} `;
    }
    return d;
  }, []);

  const redPath = useMemo(() => {
    let d = '';
    for (let x = 0; x <= 4.5; x += 0.05) {
      const px = xScale(x);
      const py = yScale(Math.sqrt(x));
      d += (x === 0 ? 'M' : 'L') + `${px},${py} `;
    }
    return d;
  }, []);

  // Tangent lines
  // y - y1 = m(x - x1) => y = m(x - x1) + y1
  const getLine = (x1, y1, m) => {
    const xStart = x1 - 1.5;
    const xEnd = x1 + 1.5;
    const yStart = m * (xStart - x1) + y1;
    const yEnd = m * (xEnd - x1) + y1;
    return {
      x1: xScale(xStart),
      y1: yScale(yStart),
      x2: xScale(xEnd),
      y2: yScale(yEnd)
    };
  };

  const blueTangent = getLine(a, b, slopeBlue);
  const redTangent = getLine(b, a, slopeRed);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
      <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-inner mb-6 relative overflow-hidden">
        
        {/* Info panel */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md flex gap-6 text-sm">
          <div className="text-blue-700 dark:text-blue-400">
            <div className="font-bold mb-1">f(x) = x²</div>
            <div>Point: ({a.toFixed(2)}, {b.toFixed(2)})</div>
            <div>Slope: <b>{slopeBlue.toFixed(2)}</b></div>
          </div>
          <div className="border-l border-slate-300 dark:border-slate-600"></div>
          <div className="text-red-600 dark:text-red-400">
            <div className="font-bold mb-1">f⁻¹(x) = √x</div>
            <div>Point: ({b.toFixed(2)}, {a.toFixed(2)})</div>
            <div>Slope: <b>{slopeRed.toFixed(2)}</b></div>
          </div>
        </div>

        <svg viewBox={"0 0 " + width + " " + height} className="w-full h-auto bg-white dark:bg-[#0f172a] rounded">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(tick => (
            <g key={`grid-${tick}`}>
              <line x1={xScale(tick)} y1={yScale(-0.5)} x2={xScale(tick)} y2={yScale(4.5)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <line x1={xScale(-0.5)} y1={yScale(tick)} x2={xScale(4.5)} y2={yScale(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <text x={xScale(tick)} y={yScale(-0.2)} fontSize="12" fill="currentColor" className="text-slate-400" textAnchor="middle">{tick}</text>
              <text x={xScale(-0.2)} y={yScale(tick)} fontSize="12" fill="currentColor" className="text-slate-400" dominantBaseline="middle" textAnchor="end">{tick}</text>
            </g>
          ))}
          
          {/* Axes */}
          <line x1={xScale(-0.5)} y1={yScale(0)} x2={xScale(4.5)} y2={yScale(0)} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2" />
          <line x1={xScale(0)} y1={yScale(-0.5)} x2={xScale(0)} y2={yScale(4.5)} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2" />

          {/* Line y = x */}
          <line x1={xScale(-0.5)} y1={yScale(-0.5)} x2={xScale(4.5)} y2={yScale(4.5)} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeDasharray="5,5" strokeWidth="2" />
          <text x={xScale(4.2)} y={yScale(4.0)} fill="currentColor" className="text-slate-400 font-italic text-sm">y = x</text>

          {/* Curves */}
          <path d={bluePath} fill="none" className="stroke-blue-500" strokeWidth="3" />
          <path d={redPath} fill="none" className="stroke-red-500" strokeWidth="3" />

          {/* Tangent lines */}
          <line {...blueTangent} stroke="currentColor" className="text-blue-400 dark:text-blue-300 opacity-60" strokeWidth="2" strokeDasharray="4,2" />
          <line {...redTangent} stroke="currentColor" className="text-red-400 dark:text-red-300 opacity-60" strokeWidth="2" strokeDasharray="4,2" />

          {/* Connection line between points */}
          <line x1={xScale(a)} y1={yScale(b)} x2={xScale(b)} y2={yScale(a)} stroke="currentColor" className="text-purple-400 opacity-50" strokeDasharray="3,3" strokeWidth="1.5" />

          {/* Points */}
          <circle cx={xScale(a)} cy={yScale(b)} r="6" className="fill-blue-600 dark:fill-blue-400" />
          <circle cx={xScale(b)} cy={yScale(a)} r="6" className="fill-red-600 dark:fill-red-400" />
        </svg>
      </div>

      <div className="w-full bg-surface border border-border rounded-xl p-6 shadow-sm">
        <label className="flex items-center justify-between mb-4">
          <span className="font-bold text-slate-700 dark:text-slate-300">Input Value (a) ON BLUE CURVE</span>
          <span className="px-3 py-1 bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300 font-mono rounded">{a.toFixed(2)}</span>
        </label>
        <input 
          type="range" 
          min="0.2" 
          max="2.1" 
          step="0.05" 
          value={a} 
          onChange={(e) => setA(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-sm text-brand-900 dark:text-brand-100 border border-brand-100 dark:border-brand-800">
          <p>
            When you adjust <b>a</b>, the point on the blue quadratic curve moves, and its slope is <b>2a</b>.
            By reflection across `y = x`, the corresponding point on the red square-root curve has its x and y swapped. 
            Because it is identically tilted over the reflection line, its new slope is <b>1 / (2a)</b> — the exact reciprocal!
          </p>
        </div>
      </div>
    </div>
  );
}
