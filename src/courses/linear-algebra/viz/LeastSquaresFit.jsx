import React, { useState, useCallback, useRef } from 'react';

const W=320,H=260,PL=35,PB=30,PT=20,PR=15;
const PW=W-PL-PR,PH=H-PT-PB;
const XLO=-0.5,XHI=5.5,YLO=-1,YHI=10;

function toS(x,y){return[PL+(x-XLO)/(XHI-XLO)*PW, PT+PH-(y-YLO)/(YHI-YLO)*PH];}
function fromS(sx,sy){return[(sx-PL)/(PW)*(XHI-XLO)+XLO, (PT+PH-sy)/(PH)*(YHI-YLO)+YLO];}

const INIT_PTS=[[0.5,1],[1.5,2.2],[2,3],[3,4.5],[4,5.8],[5,6.2]];

function leastSquares(pts){
  const n=pts.length;
  let sx=0,sy=0,sx2=0,sxy=0;
  for(const[x,y]of pts){sx+=x;sy+=y;sx2+=x*x;sxy+=x*y;}
  const det=n*sx2-sx*sx;
  if(Math.abs(det)<1e-10)return{m:0,b:sy/n};
  return{m:(n*sxy-sx*sy)/det,b:(sy-((n*sxy-sx*sy)/det)*sx)/n};
}

export default function LeastSquaresFit(){
  const[pts,setPts]=useState(INIT_PTS);
  const[userM,setUserM]=useState(1.2);
  const[userB,setUserB]=useState(0.2);
  const svgRef=useRef(null);

  const{m:bestM,b:bestB}=leastSquares(pts);

  const residSq=(m,b)=>pts.reduce((s,[x,y])=>s+(y-(m*x+b))**2,0);
  const bestRes=residSq(bestM,bestB);
  const userRes=residSq(userM,userB);

  const addPoint=useCallback(e=>{
    if(!svgRef.current)return;
    const rect=svgRef.current.getBoundingClientRect();
    const sx=(e.clientX-rect.left)*(W/rect.width);
    const sy=(e.clientY-rect.top)*(H/rect.height);
    const[x,y]=fromS(sx,sy);
    if(x>=XLO&&x<=XHI&&y>=YLO&&y<=YHI)setPts(p=>[...p,[Math.round(x*10)/10,Math.round(y*10)/10]]);
  },[]);

  const bestLine=[[XLO,bestM*XLO+bestB],[XHI,bestM*XHI+bestB]].map(([x,y])=>toS(x,y));
  const userLine=[[XLO,userM*XLO+userB],[XHI,userM*XHI+userB]].map(([x,y])=>toS(x,y));

  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Least Squares: Minimize Squared Residuals</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        Drag the slope/intercept sliders. The red squares show the squared residuals. The best-fit line (violet) minimizes their total area. Click the plot to add points.
      </p>
      <div className="flex justify-center mb-3">
        <svg ref={svgRef} width={W} height={H} onClick={addPoint}
          className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 cursor-crosshair">
          {[0,2,4,6,8].map(v=>{
            const[,sy]=toS(0,v);const[sx]=toS(v,0);
            return(<g key={v}><line x1={PL} y1={sy} x2={W-PR} y2={sy} stroke="#e2e8f0" strokeWidth="1"/>{v<=5&&<line x1={sx} y1={PT} x2={sx} y2={H-PB} stroke="#e2e8f0" strokeWidth="1"/>}</g>);
          })}
          <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          {/* user line */}
          <line x1={userLine[0][0]} y1={userLine[0][1]} x2={userLine[1][0]} y2={userLine[1][1]} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4"/>
          {/* best line */}
          <line x1={bestLine[0][0]} y1={bestLine[0][1]} x2={bestLine[1][0]} y2={bestLine[1][1]} stroke="#6366f1" strokeWidth="2.5"/>
          {/* residuals (best) */}
          {pts.map(([x,y],i)=>{
            const yhat=bestM*x+bestB;
            const[px,py]=toS(x,y);
            const[,pyhat]=toS(x,yhat);
            const resSq=Math.abs(y-yhat);
            const boxH=Math.abs(py-pyhat);
            const boxW=boxH;
            return(<g key={i}>
              <rect x={px-boxW/2} y={Math.min(py,pyhat)} width={boxW} height={boxH} fill="#ef4444" opacity="0.15" stroke="#ef4444" strokeWidth="0.5"/>
              <line x1={px} y1={py} x2={px} y2={pyhat} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2"/>
            </g>);
          })}
          {/* points */}
          {pts.map(([x,y],i)=>{
            const[sx,sy]=toS(x,y);
            return<circle key={i} cx={sx} cy={sy} r="5" fill="#f59e0b" stroke="white" strokeWidth="1.5"/>;
          })}
          <text x={W-PR-4} y={PT+14} fontSize="10" fill="#6366f1" textAnchor="end">best: y={bestM.toFixed(2)}x+{bestB.toFixed(2)}</text>
          <text x={W-PR-4} y={PT+26} fontSize="10" fill="#f59e0b" textAnchor="end">yours: y={userM.toFixed(2)}x+{userB.toFixed(2)}</text>
        </svg>
      </div>
      <div className="space-y-2 mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-8 text-amber-500">m=</span>
          <input type="range" min="-1" max="3" step="0.05" value={userM} onChange={e=>setUserM(parseFloat(e.target.value))} className="flex-1 accent-amber-500"/>
          <span className="text-xs font-mono w-10 text-right">{userM.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-8 text-amber-500">b=</span>
          <input type="range" min="-2" max="4" step="0.05" value={userB} onChange={e=>setUserB(parseFloat(e.target.value))} className="flex-1 accent-amber-500"/>
          <span className="text-xs font-mono w-10 text-right">{userB.toFixed(2)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-2 py-2">
          <p className="text-xs text-violet-600 font-semibold">Best fit Σr²</p>
          <p className="font-mono font-bold">{bestRes.toFixed(3)}</p>
        </div>
        <div className={`rounded-lg border px-2 py-2 ${userRes>bestRes*1.05?'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800':'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'}`}>
          <p className="text-xs text-slate-500 font-semibold">Your Σr²</p>
          <p className="font-mono font-bold">{userRes.toFixed(3)}</p>
        </div>
      </div>
      <button onClick={()=>setPts(INIT_PTS)} className="mt-2 w-full py-1 rounded text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Reset points</button>
    </div>
  );
}
