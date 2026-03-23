import { useState, useCallback } from "react";

const VECTORS = [
  { label:"A⃗", v:[2.0,0.5], color:"#6366f1" },
  { label:"B⃗", v:[0.5,1.8], color:"#f59e0b" },
  { label:"C⃗", v:[-1.2,0.8], color:"#10b981" },
];

const W=460,H=280,SC=46,CX=130,CY=200;
function ts(x,y){return[CX+x*SC,CY-y*SC];}

function Arrow({from,to,color,w=2.5,label,dashed=false}){
  const [fx,fy]=ts(from[0],from[1]),[tx,ty]=ts(to[0],to[1]);
  const dx=tx-fx,dy=ty-fy,len=Math.sqrt(dx*dx+dy*dy);
  if(len<3)return null;
  const ux=dx/len,uy=dy/len,hl=10;
  const ex=tx-ux*hl,ey=ty-uy*hl;
  return(
    <g>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w}
        strokeDasharray={dashed?"5 3":"none"} strokeLinecap="round"/>
      <polygon points={`${tx},${ty} ${ex-uy*5},${ey+ux*5} ${ex+uy*5},${ey-ux*5}`} fill={color}/>
      {label&&<text x={tx+9} y={ty-7} fill={color} fontSize={12} fontWeight="700">{label}</text>}
    </g>
  );
}

function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

export default function TipToToeOrderProof({params={}}){
  const [order,setOrder]=useState([0,1,2]);
  const [highlight,setHighlight]=useState(null);

  const R=VECTORS.reduce((s,v)=>[s[0]+v.v[0],s[1]+v.v[1]],[0,0]);
  const magR=Math.sqrt(R[0]**2+R[1]**2).toFixed(3);

  // Build chain for current order
  const chain=[[0,0]];
  for(const i of order) chain.push([chain[chain.length-1][0]+VECTORS[i].v[0],chain[chain.length-1][1]+VECTORS[i].v[1]]);

  const [ox,oy]=ts(0,0);

  // Component sum display
  const Rx=VECTORS.reduce((s,v)=>s+v.v[0],0).toFixed(2);
  const Ry=VECTORS.reduce((s,v)=>s+v.v[1],0).toFixed(2);

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 3 · ORDER INDEPENDENCE</span>
        <button onClick={()=>setOrder(o=>shuffle(o))} style={{
          background:"#f59e0b",color:"#0f172a",border:"none",borderRadius:8,
          padding:"6px 16px",fontSize:12,fontWeight:800,cursor:"pointer"}}>
          Shuffle Order ↺
        </button>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
        {[-3,-2,-1,0,1,2,3,4].map(i=>{
          const [x1,y1]=ts(i,-3),[x2,y2]=ts(i,3);
          const [x3,y3]=ts(-2,i),[x4,y4]=ts(5,i);
          return<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/>
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/></g>;
        })}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/>
        <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>

        {order.map((vi,i)=>{
          const v=VECTORS[vi];
          return<Arrow key={vi} from={chain[i]} to={chain[i+1]} color={v.color} label={v.label}/>;
        })}
        <Arrow from={[0,0]} to={R} color="#e2e8f0" w={3.5} dashed label="R⃗"/>
        <circle cx={CX} cy={CY} r={4} fill="#475569"/>
      </svg>

      {/* Order display */}
      <div style={{padding:"0 20px",display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:12,color:"#64748b"}}>Current order:</span>
        {order.map((vi,i)=>(
          <span key={i} style={{background:VECTORS[vi].color,color:"#0f172a",borderRadius:6,
            padding:"3px 10px",fontSize:13,fontWeight:800}}>{VECTORS[vi].label}</span>
        ))}
        <span style={{fontSize:12,color:"#64748b",marginLeft:8}}>→ R⃗ = {magR} ← always</span>
      </div>

      {/* Component table */}
      <div style={{padding:"0 20px 20px"}}>
        <div style={{background:"#1e293b",borderRadius:10,padding:"12px 16px"}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>Component sums (order-independent)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
            {VECTORS.map(v=>(
              <div key={v.label} style={{textAlign:"center"}}>
                <div style={{fontSize:11,color:v.color,fontWeight:700}}>{v.label}</div>
                <div style={{fontSize:12,color:"#94a3b8"}}>({v.v[0]}, {v.v[1]})</div>
              </div>
            ))}
            <div style={{textAlign:"center",borderLeft:"1px solid #334155",paddingLeft:8}}>
              <div style={{fontSize:11,color:"#10b981",fontWeight:700}}>R⃗</div>
              <div style={{fontSize:12,color:"#10b981",fontWeight:700}}>({Rx}, {Ry})</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{padding:"0 20px 14px",fontSize:12,color:"#475569"}}>
        Click Shuffle to change the chain order. R⃗ never changes — addition is commutative and associative.
      </div>
    </div>
  );
}
