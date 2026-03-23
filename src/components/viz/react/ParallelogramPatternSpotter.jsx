import { useState } from "react";

const ROUNDS = [
  { scenario: "Two forces pull a hook. You know each magnitude and the angle between them. Find the resultant.", best: "parallelogram", why: "Classic two-vector case with a known angle between them. Parallelogram / law of cosines is the direct approach." },
  { scenario: "Three displacements: 5 km E, 3 km N, 4 km at 60°. Find total displacement.", best: "tip-to-toe", why: "Three vectors — parallelogram only handles two. Tip-to-toe chains all three; component method gives the exact answer." },
  { scenario: "You have A⃗ = (3, 4) and B⃗ = (−1, 2). Find A⃗ + B⃗.", best: "components", why: "Components are already given — just add them directly. No need for any graphical construction." },
  { scenario: "Is |A⃗ + B⃗| ever larger than |A⃗| + |B⃗|?", best: "never", why: "Triangle inequality: |A⃗ + B⃗| ≤ |A⃗| + |B⃗|, with equality only when vectors are parallel." },
  { scenario: "Two equal forces at 120° — quick estimate of resultant?", best: "parallelogram", why: "Two vectors, symmetric setup. The parallelogram gives an instant geometric answer: the resultant equals either force." },
  { scenario: "What does |A⃗ + B⃗|² = |A⃗|² + |B⃗|² tell you about A⃗ and B⃗?", best: "perpendicular", why: "This is the vector Pythagorean theorem: the dot product A⃗·B⃗ = 0, meaning A⃗ ⊥ B⃗." },
  { scenario: "Forces: 10 N at 37°, 15 N at 112°, 8 N at 200°. Find exact R⃗.", best: "components", why: "Three vectors with non-trivial angles. Only the component method gives an exact answer efficiently." },
  { scenario: "The resultant of A⃗ and B⃗ is zero. What does the tip-to-toe diagram look like?", best: "closed triangle", why: "If R⃗ = 0, the tip of B⃗ lands exactly on the tail of A⃗ — the vectors form a closed triangle." },
];

const OPTIONS = {
  "parallelogram": { color: "#6366f1", short: "Parallelogram" },
  "tip-to-toe": { color: "#f59e0b", short: "Tip-to-toe" },
  "components": { color: "#10b981", short: "Component method" },
  "never": { color: "#f43f5e", short: "Never — triangle ineq." },
  "perpendicular": { color: "#0ea5e9", short: "They're perpendicular" },
  "closed triangle": { color: "#818cf8", short: "Closed triangle" },
};

export default function ParallelogramPatternSpotter({ params = {} }) {
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);

  const r = ROUNDS[round];
  // Build 3 choices: correct + 2 distractors
  const allKeys = Object.keys(OPTIONS);
  const distractors = allKeys.filter(k => k !== r.best).sort(() => Math.random()-0.5).slice(0,2);
  const choices = [r.best, ...distractors].sort(() => Math.random()-0.5);

  function choose(c) {
    if (revealed) return;
    setChosen(c);
    setRevealed(true);
    const ok = c === r.best;
    if (ok) setScore(s => s+1);
    setHistory(h => [...h, { scenario: r.scenario, correct: ok, answer: r.best }]);
  }

  function next() {
    if (round+1 >= ROUNDS.length) setDone(true);
    else { setRound(n=>n+1); setChosen(null); setRevealed(false); }
  }

  function reset() {
    setRound(0); setChosen(null); setRevealed(false);
    setScore(0); setDone(false); setHistory([]);
  }

  if (done) return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,padding:24}}>
      <div style={{fontSize:13,color:"#6366f1",fontWeight:700,letterSpacing:"0.08em",marginBottom:16}}>PILLAR 3 · VECTOR ADDITION PATTERNS</div>
      <div style={{fontSize:32,fontWeight:900,color:"#e2e8f0",marginBottom:8}}>{score}/{ROUNDS.length}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {history.map((h,i)=>(
          <div key={i} style={{background:h.correct?"#0d2a1e":"#2a0d0d",borderRadius:8,padding:"8px 14px",
            borderLeft:`2px solid ${h.correct?"#10b981":"#f43f5e"}`}}>
            <span style={{fontSize:12,color:"#94a3b8"}}>{h.scenario.substring(0,60)}…</span>
            <span style={{float:"right",fontSize:13,color:OPTIONS[h.answer]?.color,fontWeight:700}}>{OPTIONS[h.answer]?.short}</span>
          </div>
        ))}
      </div>
      <button onClick={reset} style={{width:"100%",background:"#6366f1",color:"#fff",border:"none",
        borderRadius:10,padding:12,fontSize:14,fontWeight:800,cursor:"pointer"}}>Try Again</button>
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#6366f1",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 3 · PATTERN RECOGNITION</span>
        <div style={{display:"flex",gap:5}}>
          {ROUNDS.map((_,i)=><div key={i} style={{width:7,height:7,borderRadius:"50%",
            background:i<round?"#10b981":i===round?"#6366f1":"#1e293b"}}/>)}
        </div>
      </div>
      <div style={{height:3,background:"#1e293b"}}>
        <div style={{height:"100%",width:`${(round/ROUNDS.length)*100}%`,background:"#6366f1",transition:"width 0.3s"}}/>
      </div>

      <div style={{padding:"20px 20px 0"}}>
        <div style={{background:"#1e293b",borderRadius:12,padding:"20px",marginBottom:16,
          border:revealed?`2px solid ${OPTIONS[r.best]?.color}`:"2px solid #334155"}}>
          <div style={{fontSize:12,color:"#64748b",marginBottom:6}}>Scenario — {round+1}/{ROUNDS.length}:</div>
          <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0",lineHeight:1.5}}>{r.scenario}</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {choices.map(c=>{
            const opt = OPTIONS[c];
            const isCorrect = c===r.best, isChosen = c===chosen;
            let bg="#1e293b",border="#334155",textC="#94a3b8";
            if (revealed) {
              if (isCorrect) { bg="#0d1e30"; border=opt.color; textC=opt.color; }
              else if (isChosen) { bg="#2a0d0d"; border="#f43f5e"; textC="#f87171"; }
            }
            return (
              <button key={c} onClick={()=>choose(c)} style={{background:bg,border:`2px solid ${border}`,
                borderRadius:10,padding:"12px 16px",fontSize:13,fontWeight:700,color:textC,
                cursor:revealed?"default":"pointer",transition:"all 0.2s",textAlign:"left"}}>
                {opt.short}
              </button>
            );
          })}
        </div>

        {revealed && (
          <>
            <div style={{background:chosen===r.best?"#0d2a1e":"#2a0d0d",borderRadius:10,padding:"12px 16px",
              borderLeft:`3px solid ${chosen===r.best?"#10b981":"#f43f5e"}`,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:chosen===r.best?"#34d399":"#f87171",marginBottom:5}}>
                {chosen===r.best?"✓ Correct":"✗ Not quite"} — {OPTIONS[r.best]?.short}
              </div>
              <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>{r.why}</div>
            </div>
            <button onClick={next} style={{width:"100%",background:"#6366f1",color:"#fff",
              border:"none",borderRadius:10,padding:12,fontSize:14,fontWeight:800,
              cursor:"pointer",marginBottom:20}}>
              {round+1>=ROUNDS.length?"Results →":"Next →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
