import { useState } from "react";

const W = 300, H = 240, SC = 46, CX = 100, CY = 150;
function ts(x, y) { return [CX + x * SC, CY - y * SC]; }

function SArrow({ from, to, color, w=2.5, label, lo=[10,-8] }) {
  const [fx,fy]=ts(from[0],from[1]), [tx,ty]=ts(to[0],to[1]);
  const dx=tx-fx, dy=ty-fy, len=Math.sqrt(dx*dx+dy*dy);
  if (len<3) return null;
  const ux=dx/len, uy=dy/len, hl=10;
  const ex=tx-ux*hl, ey=ty-uy*hl;
  return (
    <g>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round"/>
      <polygon points={`${tx},${ty} ${ex-uy*5},${ey+ux*5} ${ex+uy*5},${ey-ux*5}`} fill={color}/>
      {label && <text x={tx+lo[0]} y={ty+lo[1]} fill={color} fontSize={12} fontWeight="700">{label}</text>}
    </g>
  );
}

export default function ParallelogramAngleExplorer({ params={} }) {
  const [angleBDeg, setAngleBDeg] = useState(90);
  const magA = 2.2, magB = 1.6;

  const angleA = 0; // A fixed along x
  const angleB = angleBDeg * Math.PI / 180;

  const VA = [magA * Math.cos(angleA), magA * Math.sin(angleA)];
  const VB = [magB * Math.cos(angleB), magB * Math.sin(angleB)];
  const VR = [VA[0]+VB[0], VA[1]+VB[1]];
  const magR = Math.sqrt(VR[0]**2+VR[1]**2);

  // Triangle inequality bounds
  const maxR = magA + magB;
  const minR = Math.abs(magA - magB);

  // Magnitude vs angle curve data for mini chart
  const chartW = 270, chartH = 80;
  const points = [];
  for (let a = 0; a <= 180; a += 3) {
    const rad = a * Math.PI / 180;
    const r = Math.sqrt(magA**2 + magB**2 + 2*magA*magB*Math.cos(rad));
    const x = 20 + (a / 180) * (chartW - 40);
    const y = chartH - 16 - ((r - minR) / (maxR - minR)) * (chartH - 28);
    points.push([x, y]);
  }
  const polyline = points.map(([x,y])=>`${x},${y}`).join(" ");

  // Current dot on chart
  const curX = 20 + (angleBDeg / 180) * (chartW - 40);
  const curY = chartH - 16 - ((magR - minR) / (maxR - minR)) * (chartH - 28);

  const [ox,oy]=ts(0,0);

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px 0"}}>
        <span style={{fontSize:13,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 4 · ANGLE EXPLORER</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
          {[-2,-1,0,1,2,3].map(i=>{
            const [x1,y1]=ts(i,-3),[x2,y2]=ts(i,3);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/>;
          })}
          {[-2,-1,0,1,2].map(i=>{
            const [x3,y3]=ts(-2,i),[x4,y4]=ts(4,i);
            return <line key={i} x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/>;
          })}
          <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/>
          <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>

          {/* Parallelogram ghost */}
          <polygon points={[ts(0,0),ts(VA[0],VA[1]),ts(VR[0],VR[1]),ts(VB[0],VB[1])].map(([x,y])=>`${x},${y}`).join(" ")}
            fill="#6366f1" opacity={0.07}/>
          <SArrow from={VB} to={VR} color="#6366f1" w={1.5}/>
          <SArrow from={VA} to={VR} color="#f59e0b" w={1.5}/>

          <SArrow from={[0,0]} to={VA} color="#6366f1" label="A⃗" lo={[6,-10]}/>
          <SArrow from={[0,0]} to={VB} color="#f59e0b" label="B⃗" lo={[8,-8]}/>
          <SArrow from={[0,0]} to={VR} color="#10b981" w={3} label="R⃗" lo={[8,-10]}/>
          <circle cx={CX} cy={CY} r={3} fill="#475569"/>
        </svg>

        <div style={{padding:"16px 16px 16px 0",display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b",marginBottom:4}}>
              <span>Angle between A⃗ and B⃗</span>
              <span style={{color:"#e2e8f0",fontWeight:700}}>{angleBDeg}°</span>
            </div>
            <input type="range" min={0} max={180} step={1} value={angleBDeg}
              onChange={e=>setAngleBDeg(parseInt(e.target.value))}
              style={{width:"100%"}}/>
          </div>
          {[
            {label:"|R⃗|", val:magR.toFixed(3), color:"#10b981"},
            {label:"Max |A|+|B|", val:(magA+magB).toFixed(2), color:"#475569"},
            {label:"Min ||A|−|B||", val:Math.abs(magA-magB).toFixed(2), color:"#475569"},
          ].map(({label,val,color})=>(
            <div key={label} style={{background:"#1e293b",borderRadius:8,padding:"8px 12px"}}>
              <div style={{fontSize:10,color:"#64748b"}}>{label}</div>
              <div style={{fontSize:16,fontWeight:800,color}}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini magnitude chart */}
      <div style={{padding:"0 20px 20px"}}>
        <div style={{fontSize:11,color:"#475569",marginBottom:6}}>|R⃗| vs angle between vectors (0° → 180°)</div>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{display:"block",background:"#1e293b",borderRadius:8}}>
          <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth={1.5}/>
          <line x1={20} y1={chartH-16-((maxR-minR)/(maxR-minR))*(chartH-28)} x2={chartW-20} y2={chartH-16-((maxR-minR)/(maxR-minR))*(chartH-28)}
            stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3"/>
          <line x1={20} y1={chartH-16} x2={chartW-20} y2={chartH-16} stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3"/>
          <circle cx={curX} cy={curY} r={4} fill="#10b981"/>
          <text x={20} y={12} fill="#475569" fontSize={8}>max={maxR.toFixed(1)}</text>
          <text x={20} y={chartH-4} fill="#475569" fontSize={8}>min={minR.toFixed(1)}</text>
          <text x={curX-2} y={curY-6} fill="#10b981" fontSize={9} textAnchor="middle">{magR.toFixed(2)}</text>
        </svg>
      </div>
    </div>
  );
}
