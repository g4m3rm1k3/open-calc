// ForceVectorIntuition.jsx — L9 Pillar 1
import { useState } from "react";

const W = 460, H = 320, SC = 44, CX = 180, CY = 190;
const FORCE_COLORS = ["#6366f1","#f59e0b","#10b981","#f43f5e"];
function ts(x,y){return[CX+x*SC,CY-y*SC];}

function Arrow({from,to,color,w=2.8,label}){
  const [fx,fy]=ts(from[0],from[1]),[tx,ty]=ts(to[0],to[1]);
  const dx=tx-fx,dy=ty-fy,len=Math.sqrt(dx*dx+dy*dy);
  if(len<3)return null;
  const ux=dx/len,uy=dy/len,hl=11;
  const ex=tx-ux*hl,ey=ty-uy*hl;
  return(<g><line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round"/>
    <polygon points={`${tx},${ty} ${ex-uy*5},${ey+ux*5} ${ex+uy*5},${ey-ux*5}`} fill={color}/>
    {label&&<text x={tx+9} y={ty-8} fill={color} fontSize={12} fontWeight="800">{label}</text>}</g>);
}

export default function ForceVectorIntuition({params={}}){
  const [forces,setForces]=useState([
    {mag:2.5,angle:0,color:FORCE_COLORS[0],label:"F₁"},
    {mag:2.0,angle:130,color:FORCE_COLORS[1],label:"F₂"},
    {mag:1.5,angle:250,color:FORCE_COLORS[2],label:"F₃"},
  ]);
  const [count,setCount]=useState(3);

  function update(i,field,val){setForces(f=>{const n=[...f];n[i]={...n[i],[field]:val};return n;});}
  function addForce(){
    if(count>=4)return;
    setForces(f=>[...f,{mag:1.5,angle:45,color:FORCE_COLORS[count],label:`F${count+1}`}]);
    setCount(c=>c+1);
  }

  const active=forces.slice(0,count);
  const Rx=active.reduce((s,f)=>s+f.mag*Math.cos(f.angle*Math.PI/180),0);
  const Ry=active.reduce((s,f)=>s+f.mag*Math.sin(f.angle*Math.PI/180),0);
  const magNet=Math.sqrt(Rx**2+Ry**2);
  const thetaNet=Math.atan2(Ry,Rx)*180/Math.PI;
  const inEquilibrium=magNet<0.08;
  const [ox,oy]=ts(0,0);

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#10b981",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 1 · FREE BODY DIAGRAM</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {inEquilibrium&&<span style={{background:"#0d2a1e",color:"#34d399",border:"1px solid #10b981",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>⚖ Equilibrium</span>}
          {count<4&&<button onClick={addForce} style={{background:"#1e293b",color:"#10b981",border:"1px solid #10b981",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Force</button>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr auto"}}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
          {[-3,-2,-1,0,1,2,3].map(i=>{
            const [x1,y1]=ts(i,-3),[x2,y2]=ts(i,3),[x3,y3]=ts(-3,i),[x4,y4]=ts(3,i);
            return<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/><line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/></g>;
          })}
          <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/>
          <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>

          {active.map((f,i)=>{
            const vx=f.mag*Math.cos(f.angle*Math.PI/180),vy=f.mag*Math.sin(f.angle*Math.PI/180);
            return<Arrow key={i} from={[0,0]} to={[vx,vy]} color={f.color} label={f.label}/>;
          })}
          {!inEquilibrium&&<Arrow from={[0,0]} to={[Rx,Ry]} color="#e2e8f0" w={3.5} label="F⃗net"/>}
          {inEquilibrium&&<circle cx={CX} cy={CY} r={16} fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="6 4"/>}
          <circle cx={CX} cy={CY} r={6} fill="#475569"/>
        </svg>

        {/* Controls */}
        <div style={{padding:"12px 16px 12px 0",display:"flex",flexDirection:"column",gap:12,minWidth:140}}>
          {active.map((f,i)=>(
            <div key={i} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px",borderLeft:`3px solid ${f.color}`}}>
              <div style={{fontSize:11,color:f.color,fontWeight:700,marginBottom:4}}>{f.label}</div>
              <div style={{fontSize:10,color:"#64748b",marginBottom:2}}>|F| (N)</div>
              <input type="range" min={0.2} max={3.5} step={0.1} value={f.mag}
                onChange={e=>update(i,"mag",parseFloat(e.target.value))} style={{width:"100%",marginBottom:4}}/>
              <div style={{fontSize:10,color:"#64748b",marginBottom:2}}>θ (°)</div>
              <input type="range" min={-180} max={180} step={5} value={f.angle}
                onChange={e=>update(i,"angle",parseInt(e.target.value))} style={{width:"100%"}}/>
              <div style={{fontSize:9,color:"#475569",marginTop:2}}>{f.mag.toFixed(1)}N @ {f.angle}°</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 20px 16px"}}>
        {[
          {label:"ΣFₓ",val:Rx.toFixed(3),color:"#f59e0b"},
          {label:"ΣFᵧ",val:Ry.toFixed(3),color:"#10b981"},
          {label:"|F⃗net|",val:magNet.toFixed(3)+" N @ "+thetaNet.toFixed(1)+"°",color:inEquilibrium?"#34d399":"#e2e8f0"},
        ].map(({label,val,color})=>(
          <div key={label} style={{background:"#1e293b",borderRadius:8,padding:"8px 12px"}}>
            <div style={{fontSize:10,color:"#64748b"}}>{label}</div>
            <div style={{fontSize:13,fontWeight:800,color}}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
