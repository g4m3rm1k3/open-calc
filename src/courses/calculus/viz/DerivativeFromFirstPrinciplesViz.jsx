import React, { useState, useMemo, useRef, useEffect } from 'react';
import Katex from 'katex-react';

export default function DerivativeFromFirstPrinciplesViz() {
  const [xPos, setXPos] = useState(2); // Base point x
  const [h, setH] = useState(2);       // Delta x

  // Function: f(x) = 0.2 * x^2 + 1
  const f = (x) => 0.2 * x * x + 1;

  // Viewport setup
  const width = 600;
  const height = 400;
  const padding = 40;
  const xMin = -1;
  const xMax = 7;
  const yMin = -1;
  const yMax = 10;

  // Coordinate mappers
  const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const scaleY = (y) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  // Generate curve path
  const curvePath = useMemo(() => {
    let path = '';
    for (let i = 0; i <= 100; i++) {
      const x = xMin + (i / 100) * (xMax - xMin);
      const y = f(x);
      const px = scaleX(x);
      const py = scaleY(y);
      if (i === 0) path += `M ${px} ${py}`;
      else path += ` L ${px} ${py}`;
    }
    return path;
  }, []);

  // Points for secant/tangent
  const x1 = xPos;
  const y1 = f(x1);
  const x2 = xPos + h;
  const y2 = f(x2);

  // Slope calculation
  const slope = h === 0 ? (0.4 * xPos) : (y2 - y1) / h;
  
  // Line extension for secant/tangent
  const linePath = useMemo(() => {
    const extend = 10; // Extend line far beyond viewport
    const p1x = x1 - extend;
    const p1y = y1 - slope * extend;
    const p2x = x1 + extend;
    const p2y = y1 + slope * extend;
    return `M ${scaleX(p1x)} ${scaleY(p1y)} L ${scaleX(p2x)} ${scaleY(p2y)}`;
  }, [x1, y1, slope]);

  return (
    <div className="w-full bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row relative">
      
      {/* Interactive Graph Area */}
      <div className="flex-1 relative min-h-[400px] touch-none select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Grid */}
          <g className="opacity-20">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v-${i}`} x1={scaleX(i - 1)} y1={0} x2={scaleX(i - 1)} y2={height} stroke="#94a3b8" strokeWidth="1" />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`h-${i}`} x1={0} y1={scaleY(i - 1)} x2={width} y2={scaleY(i - 1)} stroke="#94a3b8" strokeWidth="1" />
            ))}
          </g>

          {/* Axes */}
          <line x1={scaleX(xMin)} y1={scaleY(0)} x2={scaleX(xMax)} y2={scaleY(0)} stroke="#cbd5e1" strokeWidth="2" />
          <line x1={scaleX(0)} y1={scaleY(yMin)} x2={scaleX(0)} y2={scaleY(yMax)} stroke="#cbd5e1" strokeWidth="2" />

          {/* Curve */}
          <path d={curvePath} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" 
                style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />

          {/* Secant / Tangent Line */}
          <path d={linePath} fill="none" stroke={Math.abs(h) < 0.01 ? "#ef4444" : "#10b981"} strokeWidth="2" strokeDasharray="6,6" />

          {/* Triangle for Rise/Run */}
          {Math.abs(h) > 0.01 && (
            <g opacity="0.6">
              <line x1={scaleX(x1)} y1={scaleY(y1)} x2={scaleX(x2)} y2={scaleY(y1)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
              <line x1={scaleX(x2)} y1={scaleY(y1)} x2={scaleX(x2)} y2={scaleY(y2)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
              <text x={scaleX(x1 + h/2)} y={scaleY(y1) + 20} fill="#f59e0b" fontSize="12" textAnchor="middle" fontWeight="bold">h (run)</text>
              <text x={scaleX(x2) + 10} y={scaleY((y1+y2)/2)} fill="#f59e0b" fontSize="12" alignmentBaseline="middle" fontWeight="bold">f(x+h) - f(x)</text>
            </g>
          )}

          {/* Points */}
          <circle cx={scaleX(x1)} cy={scaleY(y1)} r="6" fill="#ef4444" />
          {Math.abs(h) > 0.01 && (
            <circle cx={scaleX(x2)} cy={scaleY(y2)} r="6" fill="#10b981" />
          )}

          {/* Labels */}
          <text x={scaleX(x1)} y={scaleY(y1) - 15} fill="#ef4444" fontSize="14" textAnchor="middle" fontWeight="bold">f(x)</text>
          {Math.abs(h) > 0.01 && (
            <text x={scaleX(x2)} y={scaleY(y2) - 15} fill="#10b981" fontSize="14" textAnchor="middle" fontWeight="bold">f(x+h)</text>
          )}
        </svg>

        {/* Floating controls overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-slate-300 font-bold text-sm w-12 shrink-0">x = {xPos.toFixed(1)}</label>
              <input 
                type="range" min="0" max="5" step="0.1" 
                value={xPos} onChange={(e) => setXPos(parseFloat(e.target.value))}
                className="flex-1 accent-red-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-slate-300 font-bold text-sm w-12 shrink-0">h = {h.toFixed(2)}</label>
              <input 
                type="range" min="-3" max="3" step="0.01" 
                value={h} onChange={(e) => setH(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Math Panel */}
      <div className="md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-center">
        <h3 className="text-slate-400 uppercase tracking-wider text-xs font-bold mb-6">Difference Quotient</h3>
        
        <div className="space-y-6">
          <div className="text-slate-300">
            <div className="text-sm mb-2 text-slate-500">Secant Slope Formula:</div>
            <Katex math={`m = \\frac{f(x+h) - f(x)}{h}`} />
          </div>
          
          <div className="text-emerald-400">
            <div className="text-sm mb-2 text-slate-500">Current Values:</div>
            <Katex math={`m = \\frac{${y2.toFixed(2)} - ${y1.toFixed(2)}}{${h.toFixed(2)}}`} />
            <div className="mt-2 text-xl font-bold">
              {Math.abs(h) < 0.001 ? (
                <span className="text-red-400">Undefined (0/0)</span>
              ) : (
                `= ${slope.toFixed(3)}`
              )}
            </div>
          </div>

          <div className="h-px bg-slate-800 my-4" />

          <div className="text-red-400">
            <div className="text-sm mb-2 text-slate-500">True Derivative (Limit):</div>
            <Katex math={`\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}`} />
            <div className="mt-2 text-xl font-bold">
              = {(0.4 * xPos).toFixed(3)}
            </div>
          </div>

          {Math.abs(h) < 0.05 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              As <strong>h → 0</strong>, the secant line becomes the tangent line. The average rate becomes the instantaneous rate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
