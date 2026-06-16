import { useState } from "react";

const FORMS = [
  { id:"par", label:"Parallelogram (tail-to-tail)", formula:"Draw A⃗ and B⃗ from the same point → diagonal = R⃗", when:"2 vectors, geometric insight needed", color:"#6366f1" },
  { id:"tot", label:"Tip-to-toe / head-to-tail", formula:"Chain tails to tips → closing arrow = R⃗", when:"2+ vectors, quick sketch", color:"#f59e0b" },
  { id:"comp", label:"Component method (DSMD)", formula:"Rₓ=ΣAₓ, Rᵧ=ΣAᵧ → |R⃗|, θ", when:"Any situation; the only exact method", color:"#10b981" },
  { id:"cos", label:"Law of cosines", formula:"|R⃗|²=|A⃗|²+|B⃗|²+2|A⃗||B⃗|cosφ", when:"2 vectors, angle φ between them is known", color:"#0ea5e9", note:"φ = angle between vectors (not angle of resultant)" },
  { id:"perp", label:"Perpendicular special case", formula:"|R⃗|=√(|A⃗|²+|B⃗|²)", when:"A⃗ ⊥ B⃗", color:"#818cf8" },
  { id:"tri", label:"Triangle inequality", formula:"||A⃗|−|B⃗|| ≤ |R⃗| ≤ |A⃗|+|B⃗|", when:"Bounding the resultant without computing it", color:"#f43f5e" },
  { id:"com", label:"Commutativity", formula:"A⃗ + B⃗ = B⃗ + A⃗", when:"Reordering vectors in a sum", color:"#34d399" },
  { id:"assoc", label:"Associativity", formula:"(A⃗+B⃗)+C⃗ = A⃗+(B⃗+C⃗)", when:"Regrouping three or more vectors", color:"#34d399" },
];

const RECALL = [
  { q:"What is the parallelogram law condition?", a:"Tails at the same point; diagonal = R⃗." },
  { q:"When does |R⃗| = |A⃗| + |B⃗|?", a:"Only when A⃗ and B⃗ point in the same direction (angle = 0°)." },
  { q:"Formula for |R⃗| when A⃗ ⊥ B⃗?", a:"|R⃗| = √(|A⃗|² + |B⃗|²)  — Pythagorean theorem." },
  { q:"Law of cosines for vectors?", a:"|R⃗|² = |A⃗|² + |B⃗|² + 2|A⃗||B⃗|cosφ  where φ = angle between them." },
  { q:"What does A⃗ + B⃗ = B⃗ + A⃗ tell you about the parallelogram?", a:"Both diagonal directions give the same vector — the parallelogram is symmetric." },
  { q:"If |R⃗| = 0, what does the tip-to-toe diagram look like?", a:"The vectors form a closed polygon — last tip = first tail." },
];

export default function ParallelogramFormRecogniser({ params={} }) {
  const [mode, setMode] = useState("table");
  const [expanded, setExpanded] = useState(null);
  const [ri, setRi] = useState(0);
  const [shown, setShown] = useState(false);
  const [rScore, setRScore] = useState(0);
  const [rDone, setRDone] = useState(false);
  const [rHist, setRHist] = useState([]);

  function nextRecall(knew) {
    setRHist(h=>[...h,{...RECALL[ri],knew}]);
    if (knew) setRScore(s=>s+1);
    if (ri+1>=RECALL.length) setRDone(true);
    else { setRi(n=>n+1); setShown(false); }
  }

  if (mode==="recall"&&rDone) return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,padding:24}}>
      <div style={{fontSize:13,color:"#6366f1",fontWeight:700,marginBottom:16}}>PILLAR 5 · RECALL RESULTS</div>
      <div style={{fontSize:28,fontWeight:900,color:"#e2e8f0",marginBottom:16}}>{rScore}/{RECALL.length}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {rHist.map((h,i)=>(
          <div key={i} style={{background:h.knew?"#0d2a1e":"#2a0d0d",borderRadius:8,padding:"10px 14px",
            borderLeft:`2px solid ${h.knew?"#10b981":"#f43f5e"}`}}>
            <div style={{fontSize:12,color:"#64748b",marginBottom:2}}>{h.q}</div>
            <div style={{fontSize:13,fontFamily:"'Fira Code',monospace",color:"#e2e8f0"}}>{h.a}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>{setMode("table");setRi(0);setShown(false);setRScore(0);setRDone(false);setRHist([]);}}
        style={{width:"100%",background:"#6366f1",color:"#fff",border:"none",borderRadius:10,
          padding:12,fontSize:14,fontWeight:800,cursor:"pointer"}}>Back to Reference</button>
    </div>
  );

  if (mode==="recall") {
    const q=RECALL[ri];
    return (
      <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"#6366f1",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 5 · RECALL</span>
          <span style={{fontSize:12,color:"#475569"}}>{ri+1}/{RECALL.length}</span>
        </div>
        <div style={{height:3,background:"#1e293b"}}>
          <div style={{height:"100%",width:`${(ri/RECALL.length)*100}%`,background:"#6366f1",transition:"width 0.3s"}}/>
        </div>
        <div style={{padding:24}}>
          <div style={{background:"#1e293b",borderRadius:12,padding:"24px",textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:16,fontWeight:700,color:"#e2e8f0"}}>{q.q}</div>
          </div>
          {!shown
            ? <button onClick={()=>setShown(true)} style={{width:"100%",background:"#1e293b",color:"#94a3b8",
                border:"2px solid #334155",borderRadius:10,padding:12,fontSize:14,fontWeight:700,
                cursor:"pointer",marginBottom:12}}>Show Answer</button>
            : <>
                <div style={{background:"#0c1a2e",borderLeft:"3px solid #6366f1",borderRadius:10,
                  padding:"14px 18px",marginBottom:12,fontFamily:"'Fira Code',monospace",fontSize:14,color:"#a5b4fc"}}>{q.a}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <button onClick={()=>nextRecall(false)} style={{background:"#2a0d0d",color:"#f87171",
                    border:"2px solid #f43f5e",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>✗ Didn't know</button>
                  <button onClick={()=>nextRecall(true)} style={{background:"#0d2a1e",color:"#34d399",
                    border:"2px solid #10b981",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>✓ Knew it</button>
                </div>
              </>
          }
        </div>
      </div>
    );
  }

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#6366f1",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 5 · ADDITION METHODS & LAWS</span>
        <button onClick={()=>setMode("recall")} style={{background:"#1e293b",color:"#818cf8",
          border:"1px solid #6366f1",borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          Recall Drill →</button>
      </div>
      <div style={{padding:"16px 20px 20px",display:"flex",flexDirection:"column",gap:8}}>
        {FORMS.map((f,i)=>(
          <div key={f.id} onClick={()=>setExpanded(expanded===i?null:i)}
            style={{background:expanded===i?"#0c1a2e":"#1e293b",borderRadius:10,padding:"12px 16px",
              border:`1px solid ${expanded===i?f.color:"#334155"}`,cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:f.color}}>{f.label}</div>
                <div style={{fontSize:11,color:"#475569",fontFamily:"'Fira Code',monospace",marginTop:2}}>{f.formula}</div>
              </div>
              <span style={{color:"#475569",fontSize:13}}>{expanded===i?"▲":"▼"}</span>
            </div>
            {expanded===i && (
              <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #334155"}}>
                <div style={{fontSize:12,color:"#94a3b8",marginBottom:4}}>Use when: <span style={{color:"#e2e8f0"}}>{f.when}</span></div>
                {f.note && <div style={{fontSize:12,color:"#fcd34d",background:"#1a1500",borderRadius:6,padding:"5px 8px"}}>⚠ {f.note}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
