// DotProductIntuition.jsx — draggable vectors, live dot product + angle
import { useState, useRef, useCallback } from "react";
const W=460,H=300,SC=48,CX=180,CY=180;
function ts(x,y){return[CX+x*SC,CY-y*SC];}
function fs(sx,sy){return[(sx-CX)/SC,(CY-sy)/SC];}
function Arrow({from,to,color,w=2.8,label}){
  const [fx,fy]=ts(from[0],from[1]),[tx,ty]=ts(to[0],to[1]);
  const dx=tx-fx,dy=ty-fy,len=Math.sqrt(dx*dx+dy*dy);
  if(len<3)return null;
  const ux=dx/len,uy=dy/len,hl=11,ex=tx-ux*hl,ey=ty-uy*hl;
  return(<g><line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round"/>
    <polygon points={`${tx},${ty} ${ex-uy*5},${ey+ux*5} ${ex+uy*5},${ey-ux*5}`} fill={color}/>
    {label&&<text x={tx+9} y={ty-8} fill={color} fontSize={13} fontWeight="800">{label}</text>}</g>);
}
export default function DotProductIntuition({params={}}){
  const svgRef=useRef(null);
  const [vA,setVA]=useState([2.5,1.2]);
  const [vB,setVB]=useState([1.5,2.0]);
  const [drag,setDrag]=useState(null);
  const getSVG=useCallback((e)=>{
    const r=svgRef.current.getBoundingClientRect();
    const cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;
    return fs((cx-r.left)*(W/r.width),(cy-r.top)*(H/r.height));
  },[]);
  const onMove=useCallback((e)=>{
    if(!drag)return;
    const[mx,my]=getSVG(e);
    const c=[Math.max(-3.5,Math.min(3.5,mx)),Math.max(-2.5,Math.min(2.5,my))];
    if(drag==="A")setVA(c); else setVB(c);
  },[drag,getSVG]);
  const dot=vA[0]*vB[0]+vA[1]*vB[1];
  const magA=Math.sqrt(vA[0]**2+vA[1]**2),magB=Math.sqrt(vB[0]**2+vB[1]**2);
  const cosP=magA>0&&magB>0?dot/(magA*magB):0;
  const phi=Math.acos(Math.max(-1,Math.min(1,cosP)))*180/Math.PI;
  // Projection of A onto B
  const bHat=magB>0?[vB[0]/magB,vB[1]/magB]:[1,0];
  const projLen=dot/magB;
  const projVec=[projLen*bHat[0],projLen*bHat[1]];
  const [ox,oy]=ts(0,0);
  // Dot sign colour
  const dotColor=dot>0.05?"#10b981":dot<-0.05?"#f43f5e":"#818cf8";
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#0ea5e9",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 1 · DOT PRODUCT</span>
        <span style={{background:"#1e293b",color:dotColor,borderRadius:6,padding:"3px 12px",fontSize:13,fontWeight:800}}>
          A⃗·B⃗ = {dot.toFixed(3)}
        </span>
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{display:"block",cursor:drag?"grabbing":"crosshair"}}
        onMouseMove={onMove} onMouseUp={()=>setDrag(null)} onMouseLeave={()=>setDrag(null)}
        onTouchMove={onMove} onTouchEnd={()=>setDrag(null)}>
        {[-3,-2,-1,0,1,2,3].map(i=>{
          const[x1,y1]=ts(i,-3),[x2,y2]=ts(i,3),[x3,y3]=ts(-3,i),[x4,y4]=ts(3,i);
          return<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/><line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/></g>;
        })}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/>
        <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>
        {/* Projection of A onto B direction */}
        <line x1={ox} y1={oy} x2={ts(projVec[0],projVec[1])[0]} y2={ts(projVec[0],projVec[1])[1]}
          stroke="#0ea5e9" strokeWidth={3} strokeLinecap="round"/>
        <line x1={ts(vA[0],vA[1])[0]} y1={ts(vA[0],vA[1])[1]}
          x2={ts(projVec[0],projVec[1])[0]} y2={ts(projVec[0],projVec[1])[1]}
          stroke="#0ea5e9" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}/>
        {/* Angle arc */}
        {(()=>{
          const tA=Math.atan2(vA[1],vA[0]),tB=Math.atan2(vB[1],vB[0]);
          const r=30,ax=CX+r*Math.cos(-tA),ay=CY+r*Math.sin(-tA);
          const bx=CX+r*Math.cos(-tB),by=CY+r*Math.sin(-tB);
          const large=Math.abs(phi)>180?1:0;
          return<path d={`M ${ax} ${ay} A ${r} ${r} 0 ${large} ${tA>tB?0:1} ${bx} ${by}`}
            fill="none" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="3 2"/>;
        })()}
        <text x={CX+44} y={CY-20} fill="#818cf8" fontSize={11}>φ={phi.toFixed(1)}°</text>
        <Arrow from={[0,0]} to={vA} color="#6366f1" label="A⃗"/>
        <Arrow from={[0,0]} to={vB} color="#f59e0b" label="B⃗"/>
        {[["A",vA,"#6366f1"],["B",vB,"#f59e0b"]].map(([id,v,c])=>{
          const[hx,hy]=ts(v[0],v[1]);
          return<circle key={id} cx={hx} cy={hy} r={8} fill={c} stroke="#0f172a" strokeWidth={2}
            style={{cursor:"grab"}} onMouseDown={()=>setDrag(id)} onTouchStart={()=>setDrag(id)}/>;
        })}
        <circle cx={CX} cy={CY} r={3} fill="#475569"/>
        {/* Projection label */}
        <text x={ts(projVec[0]/2,projVec[1]/2)[0]-10} y={ts(projVec[0]/2,projVec[1]/2)[1]-10}
          fill="#0ea5e9" fontSize={10}>proj</text>
      </svg>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:"0 20px 20px"}}>
        {[
          {label:"A⃗·B⃗",val:dot.toFixed(4),color:dotColor},
          {label:"φ",val:phi.toFixed(2)+"°",color:"#818cf8"},
          {label:"|A⃗||B⃗|cosφ",val:(magA*magB*cosP).toFixed(4),color:"#0ea5e9"},
          {label:"proj A→B",val:projLen.toFixed(3),color:"#0ea5e9"},
        ].map(({label,val,color})=>(
          <div key={label} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px"}}>
            <div style={{fontSize:10,color:"#64748b"}}>{label}</div>
            <div style={{fontSize:14,fontWeight:800,color}}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"0 20px 14px",fontSize:12,color:"#475569"}}>
        Blue segment = projection of A⃗ onto B⃗ direction. Dot product = |A⃗| × (projection length). Drag either vector.
      </div>
    </div>
  );
}
