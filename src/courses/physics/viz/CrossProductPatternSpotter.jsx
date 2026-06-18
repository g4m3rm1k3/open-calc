// CrossProductPatternSpotter.jsx
import { useState } from "react";
const ROUNDS=[
  {q:"î × ĵ = ?",opts:["k̂","−k̂","0⃗","î"],correct:"k̂",why:"Standard result. Memorise the cycle: î→ĵ→k̂→î gives +. Reverse order gives −."},
  {q:"A⃗ × A⃗ = ?",opts:["|A⃗|²","0⃗","2A⃗","−A⃗"],correct:"0⃗",why:"sinφ=0 when φ=0°. A vector crossed with itself is always the zero vector."},
  {q:"A⃗ × B⃗ = 0⃗ means…",opts:["A⃗ = 0⃗","A⃗ ⊥ B⃗","A⃗ ∥ B⃗","A⃗ = B⃗"],correct:"A⃗ ∥ B⃗",why:"Zero cross product means sinφ=0 → φ=0° or 180° → vectors are parallel (or one is zero)."},
  {q:"A⃗=(1,0,0), B⃗=(0,1,0). What is A⃗×B⃗?",opts:["(0,0,1)","(0,0,−1)","(1,1,0)","(0,0,0)"],correct:"(0,0,1)",why:"î×ĵ=k̂. The result is the z-unit vector, pointing out of the xy-plane."},
  {q:"What is B⃗ × A⃗ if A⃗ × B⃗ = (2,−3,1)?",opts:["(2,−3,1)","(−2,3,−1)","(3,−2,1)","(0,0,0)"],correct:"(−2,3,−1)",why:"B⃗×A⃗ = −(A⃗×B⃗). Anti-commutativity: negate every component."},
  {q:"The direction of A⃗×B⃗ is always…",opts:["Along A⃗","Along B⃗","Perpendicular to both","In the xy-plane"],correct:"Perpendicular to both",why:"The cross product is by definition orthogonal to both input vectors. This is its defining geometric property."},
];
export default function CrossProductPatternSpotter({params={}}){
  const [round,setRound]=useState(0);const [chosen,setChosen]=useState(null);const [revealed,setRevealed]=useState(false);const [score,setScore]=useState(0);const [done,setDone]=useState(false);const [history,setHistory]=useState([]);
  const r=ROUNDS[round];const C="#f59e0b";
  function choose(opt){if(revealed)return;setChosen(opt);setRevealed(true);const ok=opt===r.correct;if(ok)setScore(s=>s+1);setHistory(h=>[...h,{q:r.q,correct:ok,answer:r.correct}]);}
  function next(){if(round+1>=ROUNDS.length)setDone(true);else{setRound(n=>n+1);setChosen(null);setRevealed(false);}}
  function reset(){setRound(0);setChosen(null);setRevealed(false);setScore(0);setDone(false);setHistory([]);}
  if(done)return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,padding:24}}><div style={{fontSize:13,color:C,fontWeight:700,marginBottom:12}}>PILLAR 3 · CROSS PRODUCT PATTERNS</div><div style={{fontSize:32,fontWeight:900,color:"#e2e8f0",marginBottom:16}}>{score}/{ROUNDS.length}</div><div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>{history.map((h,i)=><div key={i} style={{background:h.correct?"#0d2a1e":"#2a0d0d",borderRadius:8,padding:"8px 14px",borderLeft:`2px solid ${h.correct?"#10b981":"#f43f5e"}`}}><div style={{fontSize:12,color:"#64748b"}}>{h.q}</div><div style={{fontSize:12,fontWeight:700,color:h.correct?"#34d399":"#f87171"}}>{h.answer}</div></div>)}</div><button onClick={reset} style={{width:"100%",background:C,color:"#0f172a",border:"none",borderRadius:10,padding:12,fontSize:14,fontWeight:800,cursor:"pointer"}}>Try Again</button></div>);
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:C,fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 3 · CROSS PRODUCT PATTERNS</span><div style={{display:"flex",gap:5}}>{ROUNDS.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:i<round?"#10b981":i===round?C:"#1e293b"}}/>)}</div></div>
    <div style={{height:3,background:"#1e293b"}}><div style={{height:"100%",width:`${(round/ROUNDS.length)*100}%`,background:C,transition:"width 0.3s"}}/></div>
    <div style={{padding:"18px 20px 0"}}>
      <div style={{background:"#1e293b",borderRadius:12,padding:"18px",marginBottom:14,border:revealed?`2px solid ${chosen===r.correct?"#10b981":"#f43f5e"}`:"2px solid #334155"}}><div style={{fontSize:12,color:"#64748b",marginBottom:5}}>Round {round+1}/{ROUNDS.length}</div><div style={{fontSize:15,fontWeight:700,color:"#e2e8f0"}}>{r.q}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {r.opts.map(opt=>{const isC=opt===r.correct,isCh=opt===chosen;let bg="#1e293b",border="#334155",tc="#94a3b8";if(revealed){if(isC){bg="#0d2a1e";border="#10b981";tc="#34d399";}else if(isCh){bg="#2a0d0d";border="#f43f5e";tc="#f87171";}}return<button key={opt} onClick={()=>choose(opt)} style={{background:bg,border:`2px solid ${border}`,borderRadius:10,padding:"12px",fontSize:13,fontWeight:700,color:tc,cursor:revealed?"default":"pointer"}}>{opt}</button>;})}
      </div>
      {revealed&&<><div style={{background:chosen===r.correct?"#0d2a1e":"#2a0d0d",borderRadius:10,padding:"12px 16px",borderLeft:`3px solid ${chosen===r.correct?"#10b981":"#f43f5e"}`,marginBottom:12}}><div style={{fontSize:13,fontWeight:700,color:chosen===r.correct?"#34d399":"#f87171",marginBottom:4}}>{chosen===r.correct?"✓ Correct":"✗ "+r.correct}</div><div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>{r.why}</div></div><button onClick={next} style={{width:"100%",background:C,color:"#0f172a",border:"none",borderRadius:10,padding:12,fontSize:14,fontWeight:800,cursor:"pointer",marginBottom:20}}>{round+1>=ROUNDS.length?"Results →":"Next →"}</button></>}
    </div>
  </div>);
}
