import { useState, useRef, useCallback } from "react";

const W = 520, H = 380, SC = 50;
const COLORS = ["#6366f1","#f59e0b","#10b981","#f43f5e"];
const INIT = [[2.5,0.5],[0.5,2.0],[-1.5,1.0]];

function ts(x,y,cx,cy){return [cx+x*SC, cy-y*SC];}
function fs(sx,sy,cx,cy){return [(sx-cx)/SC, (cy-sy)/SC];}

function Arrow({from,to,color,w=2.8,label,dashed=false,opacity=1}){
  const cx=260,cy=220;
  const [fx,fy]=ts(from[0],from[1],cx,cy),[tx,ty]=ts(to[0],to[1],cx,cy);
  const dx=tx-fx,dy=ty-fy,len=Math.sqrt(dx*dx+dy*dy);
  if(len<3)return null;
  const ux=dx/len,uy=dy/len,hl=11;
  const ex=tx-ux*hl,ey=ty-uy*hl;
  return(
    <g opacity={opacity} style={{transition:"opacity 0.3s"}}>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w}
        strokeDasharray={dashed?"6 4":"none"} strokeLinecap="round"/>
      <polygon points={`${tx},${ty} ${ex-uy*5.5},${ey+ux*5.5} ${ex+uy*5.5},${ey-ux*5.5}`} fill={color}/>
      {label&&<text x={tx+10} y={ty-8} fill={color} fontSize={13} fontWeight="800">{label}</text>}
    </g>
  );
}

export default function TipToToeIntuition({params={}}){
  const svgRef=useRef(null);
  const [vecs,setVecs]=useState(INIT);
  const [dragging,setDragging]=useState(null); // {vecIdx}
  const [count,setCount]=useState(3);

  const CX=260,CY=220;

  const getSVG=useCallback((e)=>{
    const r=svgRef.current.getBoundingClientRect();
    const cx=e.touches?e.touches[0].clientX:e.clientX;
    const cy=e.touches?e.touches[0].clientY:e.clientY;
    return fs((cx-r.left)*(W/r.width),(cy-r.top)*(H/r.height),CX,CY);
  },[]);

  const onMove=useCallback((e)=>{
    if(dragging===null)return;
    const [mx,my]=getSVG(e);
    const c=[Math.max(-4,Math.min(4,mx)),Math.max(-3,Math.min(3,my))];
    setVecs(v=>{const n=[...v];n[dragging]=c;return n;});
  },[dragging,getSVG]);

  // Build chain: cumulative positions
  const chain=[[0,0]];
  for(let i=0;i<count;i++){
    chain.push([chain[chain.length-1][0]+vecs[i][0], chain[chain.length-1][1]+vecs[i][1]]);
  }
  const R=chain[count];
  const magR=Math.sqrt(R[0]**2+R[1]**2).toFixed(2);
  const thetaR=(Math.atan2(R[1],R[0])*180/Math.PI).toFixed(1);
  const [oxy]=ts(0,0,CX,CY);
  const [ox,oy]=ts(0,0,CX,CY);

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 1 · TIP-TO-TOE CHAIN</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:12,color:"#64748b"}}>Vectors:</span>
          {[2,3,4].map(n=>(
            <button key={n} onClick={()=>setCount(n)} style={{
              background:count===n?"#f59e0b":"#1e293b",
              color:count===n?"#0f172a":"#64748b",
              border:`1px solid ${count===n?"#f59e0b":"#334155"}`,
              borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700,cursor:"pointer"
            }}>{n}</button>
          ))}
        </div>
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{display:"block",cursor:dragging!==null?"grabbing":"crosshair"}}
        onMouseMove={onMove} onMouseUp={()=>setDragging(null)} onMouseLeave={()=>setDragging(null)}
        onTouchMove={onMove} onTouchEnd={()=>setDragging(null)}>

        {[-4,-3,-2,-1,0,1,2,3,4].map(i=>{
          const [x1,y1]=ts(i,-4,CX,CY),[x2,y2]=ts(i,4,CX,CY);
          const [x3,y3]=ts(-4,i,CX,CY),[x4,y4]=ts(4,i,CX,CY);
          return<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/>
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/></g>;
        })}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/>
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#1e293b" strokeWidth={1}/>

        {/* Chain arrows */}
        {Array.from({length:count},(_,i)=>{
          const from=chain[i], to=chain[i+1];
          const labels=["A⃗","B⃗","C⃗","D⃗"];
          return <Arrow key={i} from={from} to={to} color={COLORS[i]} label={labels[i]}/>;
        })}

        {/* Resultant */}
        <Arrow from={[0,0]} to={R} color="#e2e8f0" w={3.5} label="R⃗" dashed/>

        {/* Drag handles — tip of each vector in the chain */}
        {Array.from({length:count},(_,i)=>{
          const tip=chain[i+1];
          const [hx,hy]=ts(tip[0],tip[1],CX,CY);
          return(
            <g key={i}>
              <circle cx={hx} cy={hy} r={11} fill="none" stroke={COLORS[i]} strokeWidth={1.5} opacity={0.3}/>
              <circle cx={hx} cy={hy} r={7} fill={COLORS[i]} stroke="#0f172a" strokeWidth={2}
                style={{cursor:"grab"}}
                onMouseDown={()=>setDragging(i)}
                onTouchStart={()=>setDragging(i)}/>
            </g>
          );
        })}

        {/* Origin */}
        <circle cx={ox} cy={oy} r={4} fill="#475569"/>
        <text x={ox+6} y={oy-6} fill="#475569" fontSize={10}>start</text>
        {/* End */}
        {(()=>{const [rx,ry]=ts(R[0],R[1],CX,CY);return <text x={rx+10} y={ry} fill="#94a3b8" fontSize={10}>end</text>;})()} 
      </svg>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:"0 20px 20px"}}>
        {Array.from({length:count},(_,i)=>{
          const v=vecs[i];
          return(
            <div key={i} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px",borderLeft:`3px solid ${COLORS[i]}`}}>
              <div style={{fontSize:11,color:COLORS[i],fontWeight:700}}>{"ABCD"[i]}⃗</div>
              <div style={{fontSize:11,color:"#94a3b8"}}>({v[0].toFixed(1)}, {v[1].toFixed(1)})</div>
            </div>
          );
        })}
        <div style={{background:"#1e293b",borderRadius:8,padding:"8px 10px",gridColumn:count<4?"span 2":"auto"}}>
          <div style={{fontSize:11,color:"#e2e8f0",fontWeight:700}}>R⃗ = {magR}</div>
          <div style={{fontSize:11,color:"#94a3b8"}}>θ = {thetaR}°</div>
        </div>
      </div>

      <div style={{padding:"0 20px 14px",fontSize:12,color:"#475569"}}>
        Drag the arrowheads. The white dashed arrow (R⃗) always goes from start to end — the shortcut that replaces the entire chain.
      </div>
    </div>
  );
}
