// NumericalPatternSpotter.jsx — Pillar 3
import { useState } from "react";

const ROUNDS=[
  {q:"A⃗=(3,4), B⃗=(−1,2). What is R⃗?",options:["(2,6)","(4,2)","(2,2)","(−3,8)"],correct:"(2,6)",why:"Add component-wise: Rₓ=3+(−1)=2, Rᵧ=4+2=6."},
  {q:"|A⃗|=5N@0°, |B⃗|=5N@180°. What is R⃗?",options:["10N","0N","5N@90°","5√2 N"],correct:"0N",why:"0°and 180° are opposite directions. Components: Rₓ=5+(−5)=0, Rᵧ=0+0=0."},
  {q:"R⃗ has Rₓ=−4, Rᵧ=3. In which quadrant?",options:["I","II","III","IV"],correct:"II",why:"Rₓ<0 and Rᵧ>0 → Quadrant II. The angle is 90°<θ<180°."},
  {q:"Which is the only exact method for adding vectors?",options:["Parallelogram","Tip-to-toe","Component (DSMD)","Law of cosines"],correct:"Component (DSMD)",why:"Graphical methods are approximate; law of cosines only gives magnitude. DSMD gives exact Rₓ, Rᵧ, |R⃗|, and θ."},
  {q:"Rₓ=0, Rᵧ=−7. What is θ?",options:["0°","90°","270° (or −90°)","180°"],correct:"270° (or −90°)",why:"atan2(−7, 0) = −90° = 270°. The vector points straight down."},
  {q:"Three forces: 10N@0°, 10N@120°, 10N@240°. What is |R⃗|?",options:["30N","0N","10N","10√3 N"],correct:"0N",why:"Symmetric forces 120° apart sum to zero. Rₓ=10+10cos120°+10cos240°=10−5−5=0. Same for Rᵧ."},
  {q:"To subtract B⃗ from A⃗, what do you do to B⃗ first?",options:["Double it","Negate it (flip sign of all components)","Halve its magnitude","Rotate 90°"],correct:"Negate it (flip sign of all components)",why:"A⃗−B⃗ = A⃗+(−B⃗). Negating flips direction; then add normally."},
];

export function NumericalPatternSpotter({params={}}){
  const [round,setRound]=useState(0);
  const [chosen,setChosen]=useState(null);
  const [revealed,setRevealed]=useState(false);
  const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);
  const [history,setHistory]=useState([]);
  const r=ROUNDS[round];

  function choose(opt){
    if(revealed)return;
    setChosen(opt);setRevealed(true);
    const ok=opt===r.correct;
    if(ok)setScore(s=>s+1);
    setHistory(h=>[...h,{q:r.q,correct:ok,answer:r.correct}]);
  }
  function next(){
    if(round+1>=ROUNDS.length)setDone(true);
    else{setRound(n=>n+1);setChosen(null);setRevealed(false);}
  }
  function reset(){setRound(0);setChosen(null);setRevealed(false);setScore(0);setDone(false);setHistory([]);}

  if(done)return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,padding:24}}>
      <div style={{fontSize:13,color:"#10b981",fontWeight:700,marginBottom:16}}>PILLAR 3 · NUMERICAL PATTERNS</div>
      <div style={{fontSize:32,fontWeight:900,color:"#e2e8f0",marginBottom:16}}>{score}/{ROUNDS.length}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {history.map((h,i)=><div key={i} style={{background:h.correct?"#0d2a1e":"#2a0d0d",borderRadius:8,
          padding:"8px 14px",borderLeft:`2px solid ${h.correct?"#10b981":"#f43f5e"}`}}>
          <span style={{fontSize:12,color:"#64748b"}}>{h.q.substring(0,50)}</span>
          <span style={{float:"right",color:h.correct?"#34d399":"#f87171",fontWeight:700,fontSize:12}}>{h.answer}</span>
        </div>)}
      </div>
      <button onClick={reset} style={{width:"100%",background:"#10b981",color:"#0f172a",border:"none",
        borderRadius:10,padding:12,fontSize:14,fontWeight:800,cursor:"pointer"}}>Try Again</button>
    </div>
  );

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#10b981",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 3 · NUMERICAL PATTERNS</span>
        <div style={{display:"flex",gap:5}}>
          {ROUNDS.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:"50%",
            background:i<round?"#6366f1":i===round?"#10b981":"#1e293b"}}/>)}
        </div>
      </div>
      <div style={{height:3,background:"#1e293b"}}>
        <div style={{height:"100%",width:`${(round/ROUNDS.length)*100}%`,background:"#10b981",transition:"width 0.3s"}}/>
      </div>
      <div style={{padding:"18px 20px 0"}}>
        <div style={{background:"#1e293b",borderRadius:12,padding:"18px 20px",marginBottom:14,
          border:revealed?`2px solid ${chosen===r.correct?"#10b981":"#f43f5e"}`:"2px solid #334155"}}>
          <div style={{fontSize:12,color:"#64748b",marginBottom:6}}>Round {round+1}/{ROUNDS.length}</div>
          <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0"}}>{r.q}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {r.options.map(opt=>{
            const isC=opt===r.correct,isCh=opt===chosen;
            let bg="#1e293b",border="#334155",textC="#94a3b8";
            if(revealed){if(isC){bg="#0d2a1e";border="#10b981";textC="#34d399";}
              else if(isCh){bg="#2a0d0d";border="#f43f5e";textC="#f87171";}}
            return<button key={opt} onClick={()=>choose(opt)} style={{background:bg,border:`2px solid ${border}`,
              borderRadius:10,padding:"12px",fontSize:13,fontWeight:700,color:textC,
              cursor:revealed?"default":"pointer",transition:"all 0.2s",fontFamily:"'Fira Code',monospace"}}>{opt}</button>;
          })}
        </div>
        {revealed&&<>
          <div style={{background:chosen===r.correct?"#0d2a1e":"#2a0d0d",borderRadius:10,
            padding:"12px 16px",borderLeft:`3px solid ${chosen===r.correct?"#10b981":"#f43f5e"}`,marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:chosen===r.correct?"#34d399":"#f87171",marginBottom:4}}>
              {chosen===r.correct?"✓ Correct":"✗ "+r.correct}
            </div>
            <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>{r.why}</div>
          </div>
          <button onClick={next} style={{width:"100%",background:"#10b981",color:"#0f172a",border:"none",
            borderRadius:10,padding:12,fontSize:14,fontWeight:800,cursor:"pointer",marginBottom:20}}>
            {round+1>=ROUNDS.length?"Results →":"Next →"}
          </button>
        </>}
      </div>
    </div>
  );
}

export default NumericalPatternSpotter;
