import { useState } from "react";

const FORMS=[
  {label:"DSMD — the four-step acronym",formula:"Decompose → Sum → Magnitude → Direction",note:"Say this before every multi-vector problem. It never fails.",color:"#10b981"},
  {label:"Step 1: Decompose",formula:"vₓ = |v⃗|cosθ,   vᵧ = |v⃗|sinθ",note:"θ must be the standard angle from +x, counterclockwise. Convert non-standard angles first.",color:"#6366f1"},
  {label:"Step 2: Sum",formula:"Rₓ = ΣAₓ = A₁ₓ+A₂ₓ+...,   Rᵧ = ΣAᵧ",note:"This IS vector addition — not an approximation of it.",color:"#f59e0b"},
  {label:"Step 3: Magnitude",formula:"|R⃗| = √(Rₓ² + Rᵧ²)",note:"Pythagorean theorem. Always non-negative. This is the exact magnitude.",color:"#818cf8"},
  {label:"Step 4: Direction",formula:"θ = atan2(Rᵧ, Rₓ)",note:"atan2 returns angle in (−180°, 180°] with correct quadrant. Plain arctan only covers (−90°, 90°).",color:"#f43f5e"},
  {label:"Subtraction",formula:"A⃗ − B⃗ = A⃗ + (−B⃗);  −Bₓ, −Bᵧ",note:"Negate every component of B⃗, then apply DSMD normally.",color:"#0ea5e9"},
  {label:"Component table",formula:"| v⃗ | vₓ | vᵧ | — sum at bottom",note:"One row per vector. Sum bottom row for Rₓ, Rᵧ. Errors become visible before they propagate.",color:"#34d399"},
  {label:"Rounding rule",formula:"Carry 4+ sig figs through; round only at final answer",note:"Rounding intermediate results compounds errors. Use full calculator precision throughout.",color:"#fcd34d"},
];

const RECALL=[
  {q:"State the four-step method in order.",a:"Decompose → Sum → Magnitude → Direction  (DSMD)"},
  {q:"What is Step 1?",a:"vₓ = |v⃗|cosθ,  vᵧ = |v⃗|sinθ  (θ standard from +x)"},
  {q:"What is Step 2?",a:"Rₓ = ΣAₓ  and  Rᵧ = ΣAᵧ — add each axis separately"},
  {q:"What is Step 3?",a:"|R⃗| = √(Rₓ² + Rᵧ²)"},
  {q:"What is Step 4, and why not plain arctan?",a:"θ = atan2(Rᵧ, Rₓ). Plain arctan only covers (−90°, 90°); atan2 handles all four quadrants."},
  {q:"How do you handle vector subtraction?",a:"Replace B⃗ with −B⃗ (negate all components), then add normally."},
  {q:"Why is the component method exact, not an approximation?",a:"Component addition IS the definition of vector addition in ℝⁿ. There is no approximation involved."},
];

export default function NumericalFormRecogniser({params={}}){
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

  if(mode==="recall"&&rdone)return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,padding:24}}>
      <div style={{fontSize:13,color:"#10b981",fontWeight:700,marginBottom:12}}>PILLAR 5 · DSMD RECALL</div>
      <div style={{fontSize:28,fontWeight:900,color:"#e2e8f0",marginBottom:16}}>{rs}/{RECALL.length}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {rh.map((h,i)=><div key={i} style={{background:h.knew?"#0d2a1e":"#2a0d0d",borderRadius:8,
          padding:"10px 14px",borderLeft:`2px solid ${h.knew?"#10b981":"#f43f5e"}`}}>
          <div style={{fontSize:12,color:"#64748b",marginBottom:2}}>{h.q}</div>
          <div style={{fontSize:13,fontFamily:"'Fira Code',monospace",color:"#e2e8f0"}}>{h.a}</div>
        </div>)}
      </div>
      <button onClick={()=>{setMode("table");setRi(0);setShown(false);setRs(0);setRdone(false);setRh([]);}}
        style={{width:"100%",background:"#10b981",color:"#0f172a",border:"none",borderRadius:10,
          padding:12,fontSize:14,fontWeight:800,cursor:"pointer"}}>Back to Reference</button>
    </div>
  );

  if(mode==="recall"){
    const q=RECALL[ri];
    return(
      <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"#10b981",fontWeight:700}}>PILLAR 5 · DSMD RECALL</span>
          <span style={{fontSize:12,color:"#475569"}}>{ri+1}/{RECALL.length}</span>
        </div>
        <div style={{height:3,background:"#1e293b"}}>
          <div style={{height:"100%",width:`${(ri/RECALL.length)*100}%`,background:"#10b981",transition:"width 0.3s"}}/>
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
              <div style={{background:"#0c1a2e",borderLeft:"3px solid #10b981",borderRadius:10,
                padding:"14px 18px",marginBottom:12,fontFamily:"'Fira Code',monospace",fontSize:13,color:"#6ee7b7"}}>{q.a}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <button onClick={()=>nextR(false)} style={{background:"#2a0d0d",color:"#f87171",border:"2px solid #f43f5e",
                  borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>✗ Didn't know</button>
                <button onClick={()=>nextR(true)} style={{background:"#0d2a1e",color:"#34d399",border:"2px solid #10b981",
                  borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>✓ Knew it</button>
              </div>
            </>}
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#10b981",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 5 · DSMD COMPLETE REFERENCE</span>
        <button onClick={()=>setMode("recall")} style={{background:"#1e293b",color:"#10b981",border:"1px solid #10b981",
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
            {expanded===i&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #334155",
              fontSize:13,color:"#94a3b8",lineHeight:1.6}}>{f.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
