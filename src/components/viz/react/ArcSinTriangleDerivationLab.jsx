import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Info, HelpCircle, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

// KaTeX Bridge for internal use
function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

function M({ tex, display = false, ready }) {
  const ref = React.useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !window.katex || !tex) return;
    try { window.katex.render(tex, ref.current, { throwOnError: false, displayMode: display }); }
    catch (_) { if (ref.current) ref.current.textContent = tex; }
  }, [tex, display, ready]);
  if (!tex) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

const DATA = {
  id: 'ArcSinTriangleDerivationLab',
  title: 'arcsin Derivative: Triangle + Meaning of Every Symbol',

  mathBridge:
    'We define y = arcsin(x), which means sin(y) = x. ' +
    'This converts an inverse trig function into a standard trig equation. ' +
    'Differentiating gives cos(y) * dy/dx = 1, so dy/dx = 1 / cos(y). ' +
    'A right triangle lets us rewrite cos(y) in terms of x: cos(y) = sqrt(1 - x^2). ' +
    'This yields dy/dx = 1 / sqrt(1 - x^2).',

  steps: [
    {
      label: 'Step 1: Translate the inverse',
      formula: 'y = \\arcsin(x) \\implies \\sin(y) = x',
      explanation:
        'y = arcsin(x) means: "what angle gives sine = x?" ' +
        'So we rewrite it as sin(y) = x. Note: x is a RATIO, while y is an ANGLE.',
    },
    {
      label: 'Step 2: Domain restriction (critical)',
      formula: 'y \\in [-\\pi/2, \\pi/2]',
      explanation:
        'We restrict y to [-π/2, π/2]. This ensures exactly ONE triangle. ' +
        'In this interval (Quadrants I and IV), cosine is ALWAYS non-negative → no ± issues.',
    },
    {
      label: 'Step 3: Build the triangle',
      formula: '\\sin(y) = \\frac{\\text{opp}}{\\text{hyp}} = \\frac{x}{1}',
      explanation:
        'sin(y) = opposite / hypotenuse = x/1. ' +
        'So: opposite = x, hypotenuse = 1.',
      triangle: {
        opposite: 'x',
        hypotenuse: '1',
        adjacent: 'sqrt(1 - x^2)',
      },
    },
    {
      label: 'Step 4: Find adjacent side',
      formula: 'x^2 + a^2 = 1^2 \\implies a = \\sqrt{1 - x^2}',
      explanation:
        'Use Pythagorean theorem: a^2 + b^2 = c^2. ' +
        'Adjacent = sqrt(1 - x^2). The square root stays positive because of Step 2.',
    },
    {
      label: 'Step 5: Convert cos(y)',
      formula: '\\cos(y) = \\frac{\\sqrt{1 - x^2}}{1} = \\sqrt{1 - x^2}',
      explanation:
        'cos(y) = adjacent / hypotenuse = sqrt(1 - x^2)/1 = sqrt(1 - x^2).',
    },
    {
      label: 'Step 6: Differentiate implicitly',
      formula: '\\cos(y) \\cdot \\frac{dy}{dx} = 1',
      explanation:
        'Differentiate both sides. The left side uses the CHAIN RULE: ' +
        'd/dx[sin(y)] = cos(y) · dy/dx because angle y depends on ratio x.',
    },
    {
      label: 'Step 7: Solve for derivative',
      formula: '\\frac{dy}{dx} = \\frac{1}{\\cos(y)}',
      explanation:
        'dy/dx = 1 / cos(y). Substitute triangle result.',
    },
    {
      label: 'Final Result',
      formula: '\\frac{d}{dx}[\\arcsin x] = \\frac{1}{\\sqrt{1 - x^2}}',
      explanation:
        'dy/dx = 1 / sqrt(1 - x^2). At x = 1, the derivative blows up (vertical tangent).',
    },
  ],

  labels: {
    x: 'ratio: opposite / hypotenuse (input)',
    y: 'angle in radians (returns arcsin)',
    sin: 'ratio: opposite / hypotenuse',
    arcsin: 'returns an angle (NOT a ratio)',
    dy_dx: 'rate of change of angle y with respect to ratio x',
    'ratio vs angle': 'x is a ratio (-1 to 1), y is an angle (-π/2 to π/2)',
  },

  caption:
    'Every symbol is mapped: x is a ratio, arcsin returns an angle, the triangle converts angle back into algebra. ' +
    'The square root appears from geometry, not memorization. Domain restriction ensures the square root stays positive.',
};

export default function ArcSinTriangleDerivationLab() {
  const [x, setX] = useState(0.6);
  const [currentStep, setCurrentStep] = useState(0);
  const [showInvalid, setShowInvalid] = useState(false);
  const [highlightTarget, setHighlightTarget] = useState(null);
  const [viewMode, setViewMode] = useState('triangle'); // 'triangle' | 'graph'
  const isMathReady = useMath();

  const model = useMemo(() => {
    const safeX = showInvalid ? x : Math.max(-0.999, Math.min(0.999, x));
    const isValid = Math.abs(safeX) <= 1;
    const y = isValid ? Math.asin(safeX) : 0;
    const adj = isValid ? Math.sqrt(1 - safeX * safeX) : 0;
    const cosY = isValid ? Math.cos(y) : 0;
    
    // Safety fix: clamp adj to avoid numeric explosion at x=1
    const safeAdj = Math.max(adj, 1e-4);
    const dydx = isValid ? 1 / safeAdj : Infinity;
    
    return { x: safeX, y, adj, cosY, dydx, isValid };
  }, [x, showInvalid]);

  // SVG Coordinates for Triangle (Maximized)
  const BASE_X = 35;
  const BASE_Y = 255;
  const SIDE_PXS = 250; // Increased from 200 to fill container
  
  const triX = BASE_X + SIDE_PXS * (model.isValid ? model.adj : 0.2);
  const triY = BASE_Y - SIDE_PXS * (model.isValid ? model.x : 0.8);

  const step = DATA.steps[currentStep];

  // Logic Narrator text based on current state
  const getNarrative = () => {
    if (!model.isValid) return "The triangle has collapsed! Since x > 1, the sine (opposite/hypotenuse) would be longer than the hypotenuse, which is geometrically impossible. This visualizes why arcsin is only defined for |x| ≤ 1.";
    if (currentStep === 4) return `Currently, the adjacent side length is exactly ${model.adj.toFixed(4)}. This is the bridge back to algebra.`;
    if (currentStep === 7) return "Notice the derivative exists for all x in (-1, 1), but blows up as x approaches 1 (the denominator becomes zero).";
    return step.explanation;
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          {DATA.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl italic">
          "{DATA.mathBridge}"
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Interactions & Triangle */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                Input Ratio (x) <Info className="w-3 h-3 hover:text-indigo-500 cursor-help" />
              </label>
              <span className={`text-sm font-mono font-bold ${model.isValid ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 animate-pulse'}`}>
                {model.x.toFixed(3)}
              </span>
            </div>
            
            <input 
              type="range"
              min={showInvalid ? -1.5 : -0.99}
              max={showInvalid ? 1.5 : 0.99}
              step="0.01"
              value={x}
              onChange={(e) => setX(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />

            <div className="flex items-center justify-between pt-2 gap-2">
              <button 
                onClick={() => setShowInvalid(!showInvalid)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  showInvalid 
                    ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50' 
                    : 'bg-slate-200 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}
              >
                {showInvalid ? <AlertTriangle className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {showInvalid ? "Domain Fix OFF" : "Allow Invalid Domain"}
              </button>
              
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('triangle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'triangle' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                >
                  Triangle
                </button>
                <button 
                  onClick={() => setViewMode('graph')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'graph' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                >
                  Graph
                </button>
              </div>
            </div>
          </div>

          {/* Visualization Stage */}
          <div className="relative aspect-[4/3] bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-2">
            {viewMode === 'triangle' ? (
              <svg viewBox="0 0 320 280" className="w-full h-full drop-shadow-2xl">
                {/* Definition Text overlay */}
                <text x="5" y="15" fontSize="10" fill="#475569" className="font-mono uppercase opacity-50">Geometry View</text>
                
                {/* Triangle path */}
                <AnimatePresence mode="wait">
                  {model.isValid && (
                    <motion.path
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      d={`M ${BASE_X} ${BASE_Y} L ${triX} ${BASE_Y} L ${triX} ${triY} Z`}
                      fill="url(#triGradient)"
                      stroke="none"
                    />
                  )}
                </AnimatePresence>

                <defs>
                  <linearGradient id="triGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f122" />
                    <stop offset="100%" stopColor="#6366f144" />
                  </linearGradient>
                </defs>

                {model.isValid ? (
                  <>
                    {/* Adjacent side (Amber) */}
                    <motion.line 
                      layout
                      x1={BASE_X} y1={BASE_Y} 
                      x2={triX} y2={BASE_Y} 
                      stroke={highlightTarget === 'cosy' ? '#10b981' : '#f59e0b'} 
                      strokeWidth={highlightTarget === 'cosy' ? '6' : '3'}
                      className="transition-all duration-300"
                    />
                    <text x={(BASE_X + triX)/2} y={BASE_Y + 20} textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="600" className="font-mono text-[10px]">
                      {currentStep >= 3 ? `adj = √(1 - x²)` : '?'}
                    </text>

                    {/* Opposite side (Rose) */}
                    <motion.line 
                      layout
                      x1={triX} y1={BASE_Y} 
                      x2={triX} y2={triY} 
                      stroke="#f43f5e" 
                      strokeWidth="3" 
                    />
                    <text x={triX + 8} y={(BASE_Y + triY)/2} fontSize="11" fill="#f43f5e" fontWeight="600" className="font-mono text-[10px]">
                      opp = x
                    </text>

                    {/* Hypotenuse (Indigo) */}
                    <motion.line 
                      layout
                      x1={BASE_X} y1={BASE_Y} 
                      x2={triX} y2={triY} 
                      stroke="#6366f1" 
                      strokeWidth="4" 
                    />
                    <text 
                      x={(BASE_X + triX)/2 - 15} 
                      y={(BASE_Y + triY)/2 - 15} 
                      textAnchor="middle" 
                      fontSize="11" 
                      fill="#6366f1" 
                      fontWeight="700" 
                      className="font-mono text-[10px]"
                    >
                      hyp = 1
                    </text>

                    {/* Angle y (Emerald) */}
                    <path 
                      d={`M ${BASE_X + 25} ${BASE_Y} A 25 25 0 0 0 ${BASE_X + 25 * Math.cos(model.y)} ${BASE_Y - 25 * Math.sin(model.y)}`}
                      fill="none" stroke="#10b981" strokeWidth="2"
                    />
                    <text x={BASE_X + 18} y={BASE_Y - 8} fontSize="10" fill="#10b981" fontWeight="800">y</text>

                    {/* Right Angle */}
                    <path d={`M ${triX - 12} ${BASE_Y} L ${triX - 12} ${BASE_Y - 12} L ${triX} ${BASE_Y - 12}`} fill="none" stroke="#475569" strokeWidth="1" />
                  </>
                ) : (
                  <g>
                    <motion.circle 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      cx="160" cy="140" r="40" fill="#f43f5e11" stroke="#f43f5e44" strokeDasharray="4 4" 
                    />
                    <text x="160" y="140" textAnchor="middle" fill="#f43f5e" fontSize="16" fontWeight="bold">CONTRADICTION</text>
                    <text x="160" y="165" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="500">Opposite (x) {">"} Hypotenuse (1)</text>
                    <text x="160" y="180" textAnchor="middle" fill="#475569" fontSize="9">Geometry collapses outside domain [-1, 1]</text>
                  </g>
                )}
              </svg>
            ) : (
              <svg viewBox="0 0 320 280" className="w-full h-full drop-shadow-2xl">
                <text x="5" y="15" fontSize="10" fill="#475569" className="font-mono uppercase opacity-50">Function View</text>
                
                {/* Axes */}
                <line x1="160" y1="20" x2="160" y2="260" stroke="#334155" strokeWidth="1" opacity="0.5" />
                <line x1="20" y1="140" x2="300" y2="140" stroke="#334155" strokeWidth="1" opacity="0.5" />
                
                {/* Labels */}
                <text x="305" y="145" fontSize="8" fill="#475569">x (ratio)</text>
                <text x="165" y="15" fontSize="8" fill="#475569">y (angle)</text>

                {/* Arcsin Plot - y = arcsin(x) */}
                <path 
                  d={Array.from({length: 41}).map((_, i) => {
                    const tx = (i / 40) * 2 - 1;
                    const ty = Math.asin(tx);
                    const px = 160 + tx * 140; // Increased scale
                    const py = 140 - ty * 80;  // Increased scale
                    return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
                  }).join(' ')}
                  fill="none" stroke="#6366f1" strokeWidth="2.5" 
                />
                <text x="50" y="55" fontSize="10" fill="#6366f1" fontWeight="bold">y = arcsin(x)</text>

                {/* Derivative Plot - dy/dx = 1/sqrt(1-x^2) */}
                <path 
                  d={Array.from({length: 51}).map((_, i) => {
                    const tx = (i / 50) * 1.96 - 0.98;
                    const tdy = 1 / Math.sqrt(1 - tx * tx);
                    const px = 160 + tx * 140; // Increased scale
                    const py = 140 - tdy * 20;  // Increased scale
                    return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
                  }).join(' ')}
                  fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7"
                />
                <text x="50" y="235" fontSize="9" fill="#f43f5e" fontWeight="bold">dy/dx (slope)</text>

                {/* Vertical Tangents at +/- 1 */}
                <line x1={160 - 140} y1="40" x2={160 - 140} y2="240" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                <line x1={160 + 140} y1="40" x2={160 + 140} y2="240" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

                {/* Active marker */}
                {model.isValid && (
                  <>
                    <motion.circle 
                      layout
                      cx={160 + model.x * 140} 
                      cy={140 - model.y * 80} 
                      r="5" fill="#6366f1" stroke="white" strokeWidth="2" 
                    />
                    <motion.line 
                      layout
                      x1={160 + model.x * 140} y1="140" 
                      x2={160 + model.x * 140} y2={140 - model.y * 80} 
                      stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2"
                    />
                  </>
                )}
              </svg>
            )}
          </div>
        </div>

        {/* Right Col: Steps & Narrative */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Step Stepper */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[10px] uppercase font-bold tracking-widest border border-indigo-200 dark:border-indigo-800/50">
                Derivation Step {currentStep + 1} of {DATA.steps.length}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentStep(prev => Math.min(DATA.steps.length - 1, prev + 1))}
                  disabled={currentStep === DATA.steps.length - 1}
                  className="p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 min-h-[140px] flex flex-col justify-center">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.label}</h4>
                <div className="text-2xl font-mono text-indigo-600 dark:text-indigo-400 font-bold mb-4">
                  <M tex={step.formula} ready={isMathReady} display />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-indigo-500/30 pl-4 py-1">
                  {getNarrative()}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2">
                {DATA.steps.map((_, i) => (
                  <div 
                    key={i} 
                    onClick={() => setCurrentStep(i)}
                    className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${i <= currentStep ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mapping Table (Dynamic Legend) */}
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Symbol mapping lookup
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(DATA.labels).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{key.replace('_', '/')}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Info className="w-12 h-12" />
        </div>
        <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-1">Critical Insight: Ratio vs Angle</p>
        <p className="text-[12px] leading-relaxed text-amber-700 dark:text-amber-300">
          The variable <strong>x</strong> is a unitless ratio (sin = opposite/hypotenuse), while the function returns an angle <strong>y</strong> in radians. 
          The derivative <strong>dy/dx</strong> tells you how many radians the angle grows for every unit of "ratio" you add. 
          {model.isValid && <span> Currently, adding 0.01 to x would grow y by approximately {(model.dydx * 0.01).toFixed(4)} radians.</span>}
        </p>
        <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-800/50">
           <p className="text-[11px] text-amber-600 dark:text-amber-500 italic">
             {DATA.caption}
           </p>
        </div>
      </div>
    </div>
  );
}
