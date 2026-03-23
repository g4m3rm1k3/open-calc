// AngleBetweenIntuition.jsx
import { useState, useRef, useCallback } from "react";
const W=400,H=280,SC=46,CX=160,CY=170;
function ts(x,y){return[CX+x*SC,CY-y*SC];}function fs(sx,sy){return[(sx-CX)/SC,(CY-sy)/SC];}
function Arrow({from,to,color,w=2.8,label}){const [fx,fy]=ts(from[0],from[1]),[tx,ty]=ts(to[0],to[1]);const dx=tx-fx,dy=ty-fy,len=Math.sqrt(dx*dx+dy*dy);if(len<3)return null;const ux=dx/len,uy=dy/len,hl=10,ex=tx-ux*hl,ey=ty-uy*hl;return(<g><line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round"/><polygon points={`${tx},${ty} ${ex-uy*5},${ey+ux*5} ${ex+uy*5},${ey-ux*5}`} fill={color}/>{label&&<text x={tx+9} y={ty-8} fill={color} fontSize={12} fontWeight="800">{label}</text>}</g>);}
export default function AngleBetweenIntuition({params={}}){
  const svgRef=useRef(null);
  const [vA,setVA]=useState([2.2,1.0]);const [vB,setVB]=useState([0.8,2.1]);const [drag,setDrag]=useState(null);
  const getSVG=useCallback((e)=>{const r=svgRef.current.getBoundingClientRect();const cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;return fs((cx-r.left)*(W/r.width),(cy-r.top)*(H/r.height));},[]);
  const onMove=useCallback((e)=>{if(!drag)return;const[mx,my]=getSVG(e);const c=[Math.max(-2.5,Math.min(2.5,mx)),Math.max(-2.5,Math.min(2.5,my))];if(drag==="A")setVA(c);else setVB(c);},[drag,getSVG]);
  const dot=vA[0]*vB[0]+vA[1]*vB[1];
  const mA=Math.sqrt(vA[0]**2+vA[1]**2),mB=Math.sqrt(vB[0]**2+vB[1]**2);
  const cosP=mA>0&&mB>0?dot/(mA*mB):0;
  const phi=Math.acos(Math.max(-1,Math.min(1,cosP)))*180/Math.PI;
  const [ox,oy]=ts(0,0);
  const tA=Math.atan2(vA[1],vA[0]),tB=Math.atan2(vB[1],vB[0]);
  const arcR=36;const ax=CX+arcR*Math.cos(-tA),ay=CY+arcR*Math.sin(-tA),bx=CX+arcR*Math.cos(-tB),by=CY+arcR*Math.sin(-tB);
  const large=phi>180?1:0;
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:13,color:"#818cf8",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 1 · ANGLE BETWEEN VECTORS</span>
      <span style={{background:"#1e293b",color:"#818cf8",borderRadius:6,padding:"3px 12px",fontSize:14,fontWeight:800}}>φ = {phi.toFixed(1)}°</span>
    </div>
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block",cursor:drag?"grabbing":"crosshair"}}
      onMouseMove={onMove} onMouseUp={()=>setDrag(null)} onMouseLeave={()=>setDrag(null)} onTouchMove={onMove} onTouchEnd={()=>setDrag(null)}>
      {[-2,-1,0,1,2].map(i=>{const[x1,y1]=ts(i,-3),[x2,y2]=ts(i,3),[x3,y3]=ts(-2,i),[x4,y4]=ts(3,i);return<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/><line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/></g>;})}
      <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/><line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>
      <path d={`M ${ax} ${ay} A ${arcR} ${arcR} 0 ${large} ${tA>tB?0:1} ${bx} ${by}`} fill="rgba(129,140,248,0.12)" stroke="#818cf8" strokeWidth={1.5}/>
      <text x={(ax+bx)/2-8} y={(ay+by)/2-4} fill="#818cf8" fontSize={11} fontWeight="700">φ</text>
      <Arrow from={[0,0]} to={vA} color="#6366f1" label="A⃗"/><Arrow from={[0,0]} to={vB} color="#f59e0b" label="B⃗"/>
      {[["A",vA,"#6366f1"],["B",vB,"#f59e0b"]].map(([id,v,c])=>{const[hx,hy]=ts(v[0],v[1]);return<circle key={id} cx={hx} cy={hy} r={7} fill={c} stroke="#0f172a" strokeWidth={2} style={{cursor:"grab"}} onMouseDown={()=>setDrag(id)} onTouchStart={()=>setDrag(id)}/>;} )}
      <circle cx={CX} cy={CY} r={3} fill="#475569"/>
    </svg>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 20px 20px"}}>
      {[{label:"A⃗·B⃗",val:dot.toFixed(3),color:"#0ea5e9"},{label:"cosφ",val:cosP.toFixed(4),color:"#818cf8"},{label:"φ = arccos(A⃗·B⃗ / |A⃗||B⃗|)",val:phi.toFixed(2)+"°",color:"#818cf8"}].map(({label,val,color})=>(
        <div key={label} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:"#64748b"}}>{label}</div><div style={{fontSize:14,fontWeight:800,color}}>{val}</div></div>
      ))}
    </div>
    <div style={{padding:"0 20px 14px",fontSize:12,color:"#475569"}}>Drag either vector. φ = arccos(A⃗·B⃗ / |A⃗||B⃗|) updates live. The shaded arc shows the angle.</div>
  </div>);
}
