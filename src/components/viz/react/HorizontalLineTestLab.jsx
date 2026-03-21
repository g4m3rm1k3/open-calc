import React, { useState } from 'react';

export default function HorizontalLineTestLab() {
  const [yLevel, setYLevel] = useState(4); // -2 to 10

  const isActive = yLevel > 0 && yLevel <= 9;
  const isZero = yLevel === 0;
  
  // Calculate X intersections for f(x) = x^2
  let x1 = null, x2 = null;
  if (yLevel > 0) {
     x1 = -Math.sqrt(yLevel);
     x2 = Math.sqrt(yLevel);
  } else if (yLevel === 0) {
     x1 = 0;
  }

  // Convert logical coordinates to SVG percentages.
  // X range: -4 to 4 (width = 8). 
  // Y range: -2 to 10 (height = 12).
  const mapX = (logicX) => ((logicX + 4) / 8) * 100;
  const mapY = (logicY) => (1 - ((logicY + 2) / 12)) * 100;

  // Generate parabola path
  const points = [];
  for (let x = -3.5; x <= 3.5; x += 0.1) {
      points.push(`${mapX(x)},${mapY(x*x)}`);
  }
  const parabolaD = `M ${points.join(' ')}`;

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6 flex flex-col md:flex-row gap-8 items-center">
      
      {/* Left Text/Controls */}
      <div className="w-full md:w-64 shrink-0 flex flex-col items-center text-center">
        <h3 className="text-white font-bold text-xl mb-1">Horizontal Line Test</h3>
        <p className="text-slate-400 text-sm mb-6">Visualizing Injectivity on f(x) = x²</p>

        <span className="text-brand-400 font-bold font-mono mb-2">Target Output y = {yLevel}</span>
        <input 
           type="range" min="-2" max="10" step="1" 
           value={yLevel} onChange={(e) => setYLevel(Number(e.target.value))} 
           className="w-full accent-brand-500 mb-8" 
        />

        <div className={`p-4 rounded-lg border-2 w-full transition-colors duration-500 ${isActive ? 'bg-red-900/40 border-red-500' : (isZero ? 'bg-emerald-900/40 border-emerald-500' : 'bg-slate-800 border-slate-600')}`}>
           <span className={`block font-bold mb-1 uppercase tracking-wider text-xs ${isActive ? 'text-red-400' : (isZero ? 'text-emerald-400' : 'text-slate-400')}`}>
              {isActive ? 'Collision Detected!' : (isZero ? 'Valid 1-to-1 Target' : 'No Output (Miss)')}
           </span>
           <span className="text-sm text-white font-medium">
              {isActive 
                ? `Inputs x = ${-Math.sqrt(yLevel).toFixed(2)} AND x = ${Math.sqrt(yLevel).toFixed(2)} both violently crash into output ${yLevel}. Not Injective!` 
                : (isZero 
                   ? 'Only input x = 0 cleanly hits output 0.' 
                   : 'The line doesn\'t even intersect. The output doesn\'t exist in the machine.')
              }
           </span>
        </div>
      </div>

      {/* Right Canvas */}
      <div className="flex-1 w-full max-w-sm aspect-square relative bg-slate-950 border-2 border-slate-800 rounded-lg overflow-hidden">
         
         <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Grid Lines */}
            <line x1="0" y1={mapY(0)+'%'} x2="100%" y2={mapY(0)+'%'} stroke="#334155" strokeWidth="2" />
            <line x1={mapX(0)+'%'} y1="0" x2={mapX(0)+'%'} y2="100%" stroke="#334155" strokeWidth="2" />

            {/* Parabola */}
            <path d={parabolaD} fill="none" stroke="#60a5fa" strokeWidth="4" className="drop-shadow-lg" strokeLinecap="round" />

            {/* Sweep Line */}
            <line 
               x1="0" y1={mapY(yLevel)+'%'} 
               x2="100%" y2={mapY(yLevel)+'%'} 
               stroke={isActive ? '#ef4444' : '#10b981'} 
               strokeWidth="3" 
               strokeDasharray="6,4"
               className="transition-all duration-300" 
            />

            {/* Intersection Points */}
            {(isActive || isZero) && x1 !== null && (
               <circle 
                 cx={mapX(x1)+'%'} cy={mapY(yLevel)+'%'} r="6" 
                 fill={isActive ? '#ef4444' : '#10b981'} 
                 stroke="#fff" strokeWidth="2" 
                 className="transition-all duration-300 animate-pulse" 
               />
            )}
            {isActive && x2 !== null && (
               <circle 
                 cx={mapX(x2)+'%'} cy={mapY(yLevel)+'%'} r="6" 
                 fill="#ef4444" 
                 stroke="#fff" strokeWidth="2" 
                 className="transition-all duration-300 animate-pulse" 
               />
            )}
         </svg>
         
      </div>

    </div>
  );
}
