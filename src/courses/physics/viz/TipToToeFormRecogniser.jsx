import { useState } from "react";

const FORMS=[
  {label:"2 vectors: tip-to-toe",formula:"Place tail of B⃗ at tip of A⃗ → R⃗ from tail(A⃗) to tip(B⃗)",note:"Equivalent to parallelogram method.",color:"#f59e0b"},
  {label:"n vectors: polygon chain",formula:"Chain all vectors; R⃗ = tail of first → tip of last",note:"Generalises to any count. Closed polygon ↔ R⃗ = 0⃗.",color:"#f59e0b"},
  {label:"Equilibrium condition",formula:"A⃗+B⃗+C⃗+... = 0⃗  ↔  closed polygon",note:"The vectors form a closed shape — last tip returns to first tail.",color:"#10b981"},
  {label:"Commutativity",formula:"A⃗+B⃗ = B⃗+A⃗  (reorder freely)",note:"Proved by component-wise real-number commutativity.",color:"#6366f1"},
  {label:"Associativity",formula:"(A⃗+B⃗)+C⃗ = A⃗+(B⃗+C⃗)",note:"Grouping doesn't matter. All orderings give the same R⃗.",color:"#6366f1"},
  {label:"Subtraction as addition",formula:"A⃗−B⃗ = A⃗+(−B⃗)",note:"Negate B⃗ (flip all component signs), then add tip-to-toe.",color:"#f43f5e"},
  {label:"Component sum (exact)",formula:"Rₓ=ΣAₓ, Rᵧ=ΣAᵧ → |R⃗|=√(Rₓ²+Rᵧ²)",note:"Graphical method shows structure; component method gives precision.",color:"#818cf8"},
];

const RECALL=[
  {q:"In tip-to-toe with 3 vectors, what is R⃗?",a:"The arrow from the tail of the first vector to the tip of the last."},
  {q:"If the chain closes, what does that mean for equilibrium?",a:"R⃗ = 0⃗ — the object is in static equilibrium."},
  {q:"Why can you reorder the vectors in the chain?",a:"Because real-number addition is commutative and associative — the component sums don't change."},
  {q:"How do you subtract vectors tip-to-toe?",a:"Replace B⃗ with −B⃗ (flip all signs), then chain normally."},
  {q:"What is the minimum number of vectors that can form a closed polygon?",a:"3 — a triangle."},
];

export default function TipToToeFormRecogniser({params={}}){
  const [mode,setMode]=useState("table");
  const [expanded,setExpanded]=useState(null);
  const [ri,setRi]=useState(0);
  const [shown,setShown]=useState(false);
  const [rs,setRs]=useState(0);
  const [rdone,setRdone]=useState(false);
  const [rh,setRh]=useState([]);

  function nextR(knew){
    setRh(h=>[...h,{...RECALL[ri],knew}]);
    if(knew)setRs(s=>s+1);
    if(ri+1>=RECALL.length)setRdone(true);
    else{setRi(n=>n+1);setShown(false);}
  }

  if(mode==="recall"&&rdone) return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,padding:24}}>
      <div style={{fontSize:13,color:"#f59e0b",fontWeight:700,marginBottom:12}}>PILLAR 5 · RECALL RESULTS</div>
      <div style={{fontSize:28,fontWeight:900,color:"#e2e8f0",marginBottom:16}}>{rs}/{RECALL.length}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {rh.map((h,i)=><div key={i} style={{background:h.knew?"#0d2a1e":"#2a0d0d",borderRadius:8,
          padding:"10px 14px",borderLeft:`2px solid ${h.knew?"#10b981":"#f43f5e"}`}}>
          <div style={{fontSize:12,color:"#64748b",marginBottom:2}}>{h.q}</div>
          <div style={{fontSize:13,fontFamily:"'Fira Code',monospace",color:"#e2e8f0"}}>{h.a}</div>
        </div>)}
      </div>
      <button onClick={()=>{setMode("table");setRi(0);setShown(false);setRs(0);setRdone(false);setRh([]);}}
        style={{width:"100%",background:"#f59e0b",color:"#0f172a",border:"none",borderRadius:10,
          padding:12,fontSize:14,fontWeight:800,cursor:"pointer"}}>Back</button>
    </div>
  );

  if(mode==="recall"){
    const q=RECALL[ri];
    return(
      <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"#f59e0b",fontWeight:700}}>PILLAR 5 · RECALL</span>
          <span style={{fontSize:12,color:"#475569"}}>{ri+1}/{RECALL.length}</span>
        </div>
        <div style={{height:3,background:"#1e293b"}}>
          <div style={{height:"100%",width:`${(ri/RECALL.length)*100}%`,background:"#f59e0b",transition:"width 0.3s"}}/>
        </div>
        <div style={{padding:24}}>
          <div style={{background:"#1e293b",borderRadius:12,padding:"22px",textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0"}}>{q.q}</div>
          </div>
          {!shown
            ?<button onClick={()=>setShown(true)} style={{width:"100%",background:"#1e293b",color:"#94a3b8",
                border:"2px solid #334155",borderRadius:10,padding:12,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12}}>
                Show Answer</button>
            :<>
              <div style={{background:"#0c1a2e",borderLeft:"3px solid #f59e0b",borderRadius:10,
                padding:"14px 18px",marginBottom:12,fontFamily:"'Fira Code',monospace",fontSize:14,color:"#fcd34d"}}>{q.a}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <button onClick={()=>nextR(false)} style={{background:"#2a0d0d",color:"#f87171",border:"2px solid #f43f5e",
                  borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>✗ Didn't know</button>
                <button onClick={()=>nextR(true)} style={{background:"#0d2a1e",color:"#34d399",border:"2px solid #10b981",
                  borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>✓ Knew it</button>
              </div>
            </>
          }
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 5 · ALL ADDITION FORMS</span>
        <button onClick={()=>setMode("recall")} style={{background:"#1e293b",color:"#f59e0b",border:"1px solid #f59e0b",
          borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Recall →</button>
      </div>
      <div style={{padding:"16px 20px 20px",display:"flex",flexDirection:"column",gap:8}}>
        {FORMS.map((f,i)=>(
          <div key={i} onClick={()=>setExpanded(expanded===i?null:i)}
            style={{background:expanded===i?"#0c1a2e":"#1e293b",borderRadius:10,padding:"12px 16px",
              border:`1px solid ${expanded===i?f.color:"#334155"}`,cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:f.color}}>{f.label}</div>
                <div style={{fontSize:11,fontFamily:"'Fira Code',monospace",color:"#64748b",marginTop:2}}>{f.formula}</div>
              </div>
              <span style={{color:"#475569",fontSize:12}}>{expanded===i?"▲":"▼"}</span>
            </div>
            {expanded===i&&(
              <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #334155",
                fontSize:13,color:"#94a3b8",lineHeight:1.6}}>{f.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
