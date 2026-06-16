import React, { useState } from 'react';

const W=320,H=260,PL=40,PR=20,PT=20,PB=30;
const PW=W-PL-PR,PH=H-PT-PB;
const X0=0,X1=4;

function toScreen(x,y,yMin,yMax){
  const px=PL+(x-X0)/(X1-X0)*PW;
  const py=PT+PH-(y-yMin)/(yMax-yMin)*PH;
  return[px,py];
}

function f(x){return x*x;}

export default function SecantLineViz(){
  const[a,setA]=useState(1);
  const[h,setH]=useState(1.5);

  const b=a+h;
  const fa=f(a),fb=f(b);
  const slope=(fb-fa)/h;

  const yMin=-0.5,yMax=17;
  // curve points
  const curvePts=Array.from({length:80},(_,i)=>{
    const x=X0+(X1-X0)*i/79;
    return toScreen(x,f(x),yMin,yMax).join(',');
  }).join(' ');

  const[ax,ay]=toScreen(a,fa,yMin,yMax);
  const[bx,by]=toScreen(b,fb,yMin,yMax);

  // Secant line extended
  const xL=X0,xR=X1;
  const yL=fa+slope*(xL-a);
  const yR=fa+slope*(xR-a);
  const[slx1,sly1]=toScreen(xL,yL,yMin,yMax);
  const[slx2,sly2]=toScreen(xR,yR,yMin,yMax);

  // tangent at a
  const tangSlope=2*a;
  const tyL=fa+tangSlope*(xL-a);
  const tyR=fa+tangSlope*(xR-a);
  const[tlx1,tly1]=toScreen(xL,tyL,yMin,yMax);
  const[tlx2,tly2]=toScreen(xR,tyR,yMin,yMax);

  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Secant → Tangent</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        The secant line through <strong>a</strong> and <strong>a+h</strong> has slope (f(a+h)−f(a))/h. As h→0, the secant approaches the tangent — the derivative at a.
      </p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <line x1={PL} y1={PT+PH} x2={W-PR} y2={PT+PH} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={PL} y1={PT} x2={PL} y2={PT+PH} stroke="#94a3b8" strokeWidth="1.5"/>
          {/* tangent (ghost) */}
          <line x1={tlx1} y1={tly1} x2={tlx2} y2={tly2} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.6"/>
          <text x={W-PR-2} y={tly2-8} fontSize="10" fill="#10b981" textAnchor="end">tangent</text>
          {/* secant */}
          <line x1={slx1} y1={sly1} x2={slx2} y2={sly2} stroke="#f59e0b" strokeWidth="2.5"/>
          {/* curve */}
          <polyline points={curvePts} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* rise/run */}
          <line x1={ax} y1={ay} x2={bx} y2={ay} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3"/>
          <line x1={bx} y1={ay} x2={bx} y2={by} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3"/>
          <text x={(ax+bx)/2} y={ay+14} fontSize="11" fill="#ef4444">run={h.toFixed(2)}</text>
          <text x={bx+6} y={(ay+by)/2} fontSize="11" fill="#ef4444">rise={(fb-fa).toFixed(2)}</text>
          {/* points */}
          <circle cx={ax} cy={ay} r="5" fill="#6366f1"/>
          <text x={ax-8} y={ay-8} fontSize="11" fill="#6366f1" fontWeight="600">a={a.toFixed(1)}</text>
          <circle cx={bx} cy={by} r="5" fill="#f59e0b"/>
          <text x={bx+6} y={by-8} fontSize="11" fill="#f59e0b" fontWeight="600">a+h={b.toFixed(1)}</text>
          <text x={W-PR-4} y={PT+14} fontSize="12" fill="#f59e0b" textAnchor="end" fontWeight="600">slope={slope.toFixed(3)}</text>
          <text x={W-PR-4} y={PT+28} fontSize="11" fill="#10b981" textAnchor="end">f'({a.toFixed(1)})={tangSlope.toFixed(2)}</text>
        </svg>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-8 text-violet-600">a =</span>
          <input type="range" min="0.2" max="3" step="0.1" value={a} onChange={e=>setA(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/>
          <span className="text-xs font-mono w-10 text-right">{a.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-8 text-amber-500">h =</span>
          <input type="range" min="0.05" max="2" step="0.05" value={h} onChange={e=>setH(parseFloat(e.target.value))} className="flex-1 accent-amber-500"/>
          <span className="text-xs font-mono w-10 text-right">{h.toFixed(2)}</span>
        </div>
      </div>
      {h<0.15&&(
        <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300 text-center">
          h → 0: secant slope {slope.toFixed(3)} ≈ tangent slope {tangSlope.toFixed(2)} ✓
        </div>
      )}
    </div>
  );
}
