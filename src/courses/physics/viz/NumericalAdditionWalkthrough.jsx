// NumericalAdditionWalkthrough.jsx
// Pillar 1 — step through DSMD for two live draggable vectors
import { useState, useRef, useCallback } from "react";

const W=480,H=320,SC=46,CX=180,CY=190;
function ts(x,y){return[CX+x*SC,CY-y*SC];}
function fs(sx,sy){return[(sx-CX)/SC,(CY-sy)/SC];}

function Arrow({from,to,color,w=2.8,label,dashed=false,opacity=1}){
  const [fx,fy]=ts(from[0],from[1]),[tx,ty]=ts(to[0],to[1]);
  const dx=tx-fx,dy=ty-fy,len=Math.sqrt(dx*dx+dy*dy);
  if(len<3)return null;
  const ux=dx/len,uy=dy/len,hl=11;
  const ex=tx-ux*hl,ey=ty-uy*hl;
  return(
    <g opacity={opacity} style={{transition:"opacity 0.3s"}}>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w}
        strokeDasharray={dashed?"5 3":"none"} strokeLinecap="round"/>
      <polygon points={`${tx},${ty} ${ex-uy*5},${ey+ux*5} ${ex+uy*5},${ey-ux*5}`} fill={color}/>
      {label&&<text x={tx+9} y={ty-8} fill={color} fontSize={13} fontWeight="800">{label}</text>}
    </g>
  );
}

const STEPS=["Decompose","Sum Components","Magnitude","Direction"];
const STEP_COLORS=["#6366f1","#f59e0b","#10b981","#818cf8"];

export default function NumericalAdditionWalkthrough({params={}}){
  const svgRef=useRef(null);
  const initA = params.lockedA ? [params.lockedA.mag*Math.cos(params.lockedA.angle*Math.PI/180), params.lockedA.mag*Math.sin(params.lockedA.angle*Math.PI/180)] : [2.5,1.2];
  const initB = params.lockedB ? [params.lockedB.mag*Math.cos(params.lockedB.angle*Math.PI/180), params.lockedB.mag*Math.sin(params.lockedB.angle*Math.PI/180)] : [0.8,2.0];
  const [vA,setVA]=useState(initA);
  const [vB,setVB]=useState(initB);
  const [drag,setDrag]=useState(null);
  const [activeStep,setActiveStep]=useState(0);
  const locked=!!params.lockedA;

  const getSVG=useCallback((e)=>{
    const r=svgRef.current.getBoundingClientRect();
    const cx=e.touches?e.touches[0].clientX:e.clientX;
    const cy=e.touches?e.touches[0].clientY:e.clientY;
    return fs((cx-r.left)*(W/r.width),(cy-r.top)*(H/r.height));
  },[]);

  const onMove=useCallback((e)=>{
    if(!drag||locked)return;
    const [mx,my]=getSVG(e);
    const c=[Math.max(-3.5,Math.min(3.5,mx)),Math.max(-2.8,Math.min(2.8,my))];
    if(drag==="A")setVA(c); else setVB(c);
  },[drag,locked,getSVG]);

  const magA=Math.sqrt(vA[0]**2+vA[1]**2),thetaA=(Math.atan2(vA[1],vA[0])*180/Math.PI);
  const magB=Math.sqrt(vB[0]**2+vB[1]**2),thetaB=(Math.atan2(vB[1],vB[0])*180/Math.PI);
  const Rx=vA[0]+vB[0],Ry=vA[1]+vB[1];
  const magR=Math.sqrt(Rx**2+Ry**2),thetaR=(Math.atan2(Ry,Rx)*180/Math.PI);

  const [ox,oy]=ts(0,0);
  const [ahx,ahy]=ts(vA[0],vA[1]);
  const [bhx,bhy]=ts(vB[0],vB[1]);
  const [rhx,rhy]=ts(Rx,Ry);
  const [pAx,pAy]=ts(vA[0],0);
  const [pBx,pBy]=ts(vB[0],0);
  const [pRx,pRy]=ts(Rx,0);

  const showDecomp=activeStep>=0;
  const showSum=activeStep>=1;
  const showMag=activeStep>=2;
  const showDir=activeStep>=3;

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      {/* Step selector */}
      <div style={{padding:"14px 20px 0",display:"flex",gap:8,flexWrap:"wrap"}}>
        {STEPS.map((s,i)=>(
          <button key={s} onClick={()=>setActiveStep(i)} style={{
            background:activeStep===i?STEP_COLORS[i]:"#1e293b",
            color:activeStep===i?"#0f172a":activeStep>i?STEP_COLORS[i]:"#64748b",
            border:`1.5px solid ${activeStep>=i?STEP_COLORS[i]:"#334155"}`,
            borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer"
          }}>
            {i+1}. {s}
          </button>
        ))}
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{display:"block",cursor:drag?"grabbing":"crosshair"}}
        onMouseMove={onMove} onMouseUp={()=>setDrag(null)} onMouseLeave={()=>setDrag(null)}
        onTouchMove={onMove} onTouchEnd={()=>setDrag(null)}>
        {[-3,-2,-1,0,1,2,3].map(i=>{
          const [x1,y1]=ts(i,-3),[x2,y2]=ts(i,3);
          const [x3,y3]=ts(-3,i),[x4,y4]=ts(4,i);
          return<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/>
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/></g>;
        })}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/>
        <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>

        {/* Decomposition lines */}
        {showDecomp&&<>
          <line x1={ox} y1={oy} x2={pAx} y2={oy} stroke="#6366f1" strokeWidth={2} opacity={0.7}/>
          <line x1={pAx} y1={oy} x2={pAx} y2={ahy} stroke="#6366f1" strokeWidth={2} opacity={0.7}/>
          <line x1={ox} y1={oy} x2={pBx} y2={oy} stroke="#f59e0b" strokeWidth={2} opacity={0.7} strokeDasharray="4 3"/>
          <line x1={pBx} y1={oy} x2={pBx} y2={bhy} stroke="#f59e0b" strokeWidth={2} opacity={0.7} strokeDasharray="4 3"/>
        </>}

        {/* Sum — resultant components */}
        {showSum&&<>
          <line x1={ox} y1={oy} x2={pRx} y2={oy} stroke="#10b981" strokeWidth={2.5}/>
          <line x1={pRx} y1={oy} x2={pRx} y2={rhy} stroke="#10b981" strokeWidth={2.5}/>
          <text x={(ox+pRx)/2} y={oy+18} fill="#10b981" fontSize={11} textAnchor="middle">Rₓ={Rx.toFixed(2)}</text>
          <text x={pRx+8} y={(oy+rhy)/2+4} fill="#10b981" fontSize={11}>Rᵧ={Ry.toFixed(2)}</text>
        </>}

        <Arrow from={[0,0]} to={vA} color="#6366f1" label="A⃗" w={3}/>
        <Arrow from={[0,0]} to={vB} color="#f59e0b" label="B⃗" w={3}/>
        {showSum&&<Arrow from={[0,0]} to={[Rx,Ry]} color="#10b981" label="R⃗" w={3.5}/>}

        {/* Direction arc */}
        {showDir&&(()=>{
          const r=32, a=-thetaR*Math.PI/180;
          const ax=CX+r*Math.cos(a), ay=CY+r*Math.sin(a);
          return<>
            <path d={`M ${CX+r} ${CY} A ${r} ${r} 0 0 ${Ry>=0?0:1} ${ax} ${ay}`}
              fill="none" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="3 2"/>
            <text x={CX+48*Math.cos(-thetaR*Math.PI/360)} y={CY-48*Math.sin(-thetaR*Math.PI/360)}
              fill="#818cf8" fontSize={11} textAnchor="middle">{thetaR.toFixed(1)}°</text>
          </>;
        })()}

        {/* Drag handles */}
        {[["A",vA,"#6366f1"],["B",vB,"#f59e0b"]].map(([id,v,c])=>{
          const [hx,hy]=ts(v[0],v[1]);
          return<circle key={id} cx={hx} cy={hy} r={8} fill={c} stroke="#0f172a" strokeWidth={2}
            style={{cursor:locked?"default":"grab"}}
            onMouseDown={()=>!locked&&setDrag(id)} onTouchStart={()=>!locked&&setDrag(id)}/>;
        })}
        <circle cx={CX} cy={CY} r={3.5} fill="#475569"/>
      </svg>

      {/* Live computation panel */}
      <div style={{padding:"0 20px 20px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
        {[
          {label:"Step 1: Decompose",items:[`Aₓ=${vA[0].toFixed(2)}`,`Aᵧ=${vA[1].toFixed(2)}`,`Bₓ=${vB[0].toFixed(2)}`,`Bᵧ=${vB[1].toFixed(2)}`],color:"#6366f1",active:activeStep>=0},
          {label:"Step 2: Sum",items:[`Rₓ=${Rx.toFixed(2)}`,`Rᵧ=${Ry.toFixed(2)}`],color:"#f59e0b",active:activeStep>=1},
          {label:"Step 3: |R⃗|",items:[`√(${Rx.toFixed(2)}²+${Ry.toFixed(2)}²)`,`= ${magR.toFixed(3)}`],color:"#10b981",active:activeStep>=2},
          {label:"Step 4: θ",items:[`atan2(${Ry.toFixed(2)},${Rx.toFixed(2)})`,`= ${thetaR.toFixed(1)}°`],color:"#818cf8",active:activeStep>=3},
        ].map(({label,items,color,active})=>(
          <div key={label} style={{background:"#1e293b",borderRadius:8,padding:"10px 12px",
            opacity:active?1:0.3,transition:"opacity 0.4s",borderLeft:`3px solid ${color}`}}>
            <div style={{fontSize:10,color,fontWeight:700,marginBottom:4}}>{label}</div>
            {items.map(item=><div key={item} style={{fontSize:11,fontFamily:"'Fira Code',monospace",color:"#94a3b8"}}>{item}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}
