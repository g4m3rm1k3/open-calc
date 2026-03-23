// OrthogonalityIntuition.jsx
import { useState, useRef, useCallback } from "react";
const W=380,H=260,SC=46,CX=150,CY=160;
function ts(x,y){return[CX+x*SC,CY-y*SC];}function fs(sx,sy){return[(sx-CX)/SC,(CY-sy)/SC];}
function Arrow({from,to,color,w=2.8,label}){const [fx,fy]=ts(from[0],from[1]),[tx,ty]=ts(to[0],to[1]);const dx=tx-fx,dy=ty-fy,len=Math.sqrt(dx*dx+dy*dy);if(len<3)return null;const ux=dx/len,uy=dy/len,hl=10,ex=tx-ux*hl,ey=ty-uy*hl;return(<g><line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round"/><polygon points={`${tx},${ty} ${ex-uy*5},${ey+ux*5} ${ex+uy*5},${ey-ux*5}`} fill={color}/>{label&&<text x={tx+9} y={ty-8} fill={color} fontSize={12} fontWeight="800">{label}</text>}</g>);}
export default function OrthogonalityIntuition({params={}}){
  const svgRef=useRef(null);
  const [vA,setVA]=useState([2.0,1.5]);
  const [drag,setDrag]=useState(false);
  const getSVG=useCallback((e)=>{const r=svgRef.current.getBoundingClientRect();const cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;return fs((cx-r.left)*(W/r.width),(cy-r.top)*(H/r.height));},[]);
  const onMove=useCallback((e)=>{if(!drag)return;const[mx,my]=getSVG(e);setVA([Math.max(-2.5,Math.min(2.5,mx)),Math.max(-2.5,Math.min(2.5,my))]);},[drag,getSVG]);
  // Perpendicular vector to A is (−Ay, Ax)
  const perpB=[-vA[1],vA[0]];
  const dot=vA[0]*perpB[0]+vA[1]*perpB[1];
  const [ox,oy]=ts(0,0);
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:13,color:"#818cf8",fontWeight:700,letterSpacing:"0.08em"}}>ORTHOGONALITY VISUALISER</span>
      <span style={{background:"#1e293b",color:Math.abs(dot)<0.01?"#818cf8":"#64748b",borderRadius:6,padding:"3px 12px",fontSize:13,fontWeight:800}}>A⃗·B⃗ = {dot.toFixed(2)}</span>
    </div>
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block",cursor:drag?"grabbing":"crosshair"}}
      onMouseMove={onMove} onMouseUp={()=>setDrag(false)} onMouseLeave={()=>setDrag(false)} onTouchMove={onMove} onTouchEnd={()=>setDrag(false)}>
      {[-2,-1,0,1,2].map(i=>{const[x1,y1]=ts(i,-3),[x2,y2]=ts(i,3),[x3,y3]=ts(-3,i),[x4,y4]=ts(3,i);return<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/><line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/></g>;})}
      <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/><line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>
      {/* Right angle marker */}
      {(()=>{const s=18,ax=vA[0]/Math.sqrt(vA[0]**2+vA[1]**2),ay=vA[1]/Math.sqrt(vA[0]**2+vA[1]**2);const px=-ay,py=ax;const[c1x,c1y]=ts(ax*s/SC,ay*s/SC),[c2x,c2y]=ts((ax+px)*s/SC,(ay+py)*s/SC),[c3x,c3y]=ts(px*s/SC,py*s/SC);return<path d={`M ${c1x} ${c1y} L ${c2x} ${c2y} L ${c3x} ${c3y}`} fill="none" stroke="#818cf8" strokeWidth={1.5}/>;})()} 
      <Arrow from={[0,0]} to={vA} color="#6366f1" label="A⃗"/>
      <Arrow from={[0,0]} to={perpB} color="#818cf8" label="B⃗ (⊥A⃗)"/>
      <circle cx={ts(vA[0],vA[1])[0]} cy={ts(vA[0],vA[1])[1]} r={7} fill="#6366f1" stroke="#0f172a" strokeWidth={2} style={{cursor:"grab"}} onMouseDown={()=>setDrag(true)} onTouchStart={()=>setDrag(true)}/>
      <circle cx={CX} cy={CY} r={3} fill="#475569"/>
    </svg>
    <div style={{padding:"0 20px 14px",fontSize:12,color:"#475569"}}>B⃗ is always kept perpendicular to A⃗. Dot product = 0 exactly. Drag A⃗ to see it hold for any direction.</div>
  </div>);
}
