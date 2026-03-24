// FreeFallPatternSpotter.jsx — Ch2 L12-18 Pillar 3
import { useState } from "react";

const G = 9.8;
const ROUNDS = [
  { q: "A ball is thrown upward. At the highest point, what is its acceleration?", opts: ["0", "−g", "+g", "undefined"], correct: "−g", why: `Acceleration due to gravity is always −g = −9.8 m/s² (upward positive), even at the peak. The ball is momentarily at rest but still accelerating downward.` },
  { q: "A stone is dropped from 80 m. How long until it hits the ground? (g=9.8)", opts: ["≈ 2.0 s", "≈ 4.0 s", "≈ 8.2 s", "≈ 4.5 s"], correct: "≈ 4.0 s", why: `Δx=½gt² → 80=½(9.8)t² → t=√(160/9.8)≈4.04 s.` },
  { q: "Ball thrown up at 20 m/s. What is its speed when it returns to the launch point?", opts: ["0 m/s", "10 m/s", "20 m/s", "40 m/s"], correct: "20 m/s", why: `By symmetry (or v²=v₀²+2aΔx with Δx=0): v²=400, so |v|=20 m/s. It returns at the same speed it left.` },
  { q: "Two objects — one dropped, one thrown horizontally from the same height. Which hits the ground first?", opts: ["Dropped","Thrown horizontally","Same time","Depends on speed"], correct: "Same time", why: `Vertical motion is independent of horizontal motion. Both fall with the same acceleration g and the same initial vertical velocity (0). They land simultaneously.` },
  { q: "Ball thrown up at 30 m/s. What is the maximum height? (g=9.8)", opts: ["45.9 m", "30 m", "91.8 m", "61.2 m"], correct: "45.9 m", why: `h = v₀²/(2g) = 900/(19.6) ≈ 45.9 m.` },
  { q: "At what point during free-fall (thrown upward) is the object slowing down?", opts: ["Never — it always accelerates", "On the way up only", "On the way down only", "Throughout the flight"], correct: "On the way up only", why: `On the way up, v is positive and a is negative — speed decreases. On the way down, v is negative and a is also negative — speed increases.` },
];

export default function FreeFallPatternSpotter({ params = {} }) {
  const [r, setR] = useState(0); const [chosen, setChosen] = useState(null); const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0); const [done, setDone] = useState(false); const [history, setHistory] = useState([]);
  const q = ROUNDS[r]; const C = "#818cf8";
  function choose(opt) { if (revealed) return; setChosen(opt); setRevealed(true); const ok = opt === q.correct; if (ok) setScore(s => s + 1); setHistory(h => [...h, { q: q.q, correct: ok, answer: q.correct }]); }
  function next() { if (r + 1 >= ROUNDS.length) setDone(true); else { setR(n => n + 1); setChosen(null); setRevealed(false); } }
  function reset() { setR(0); setChosen(null); setRevealed(false); setScore(0); setDone(false); setHistory([]); }
  if (done) return (<div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}><div style={{ fontSize: 13, color: C, fontWeight: 700, marginBottom: 12 }}>FREE FALL PATTERNS</div><div style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0", marginBottom: 16 }}>{score}/{ROUNDS.length}</div><div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>{history.map((h, i) => <div key={i} style={{ background: h.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "8px 14px", borderLeft: `2px solid ${h.correct ? "#10b981" : "#f43f5e"}` }}><div style={{ fontSize: 12, color: "#64748b" }}>{h.q.substring(0, 55)}</div><div style={{ fontSize: 12, fontWeight: 700, color: h.correct ? "#34d399" : "#f87171" }}>{h.answer}</div></div>)}</div><button onClick={reset} style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Try Again</button></div>);
  return (<div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
    <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 13, color: C, fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 3 · FREE FALL PATTERNS</span><div style={{ display: "flex", gap: 5 }}>{ROUNDS.map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < r ? "#10b981" : i === r ? C : "#1e293b" }} />)}</div></div>
    <div style={{ height: 3, background: "#1e293b" }}><div style={{ height: "100%", width: `${(r / ROUNDS.length) * 100}%`, background: C, transition: "width 0.3s" }} /></div>
    <div style={{ padding: "18px 20px 0" }}>
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "18px", marginBottom: 14, border: revealed ? `2px solid ${chosen === q.correct ? "#10b981" : "#f43f5e"}` : "2px solid #334155" }}><div style={{ fontSize: 12, color: "#64748b", marginBottom: 5 }}>Round {r + 1}/{ROUNDS.length}</div><div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{q.q}</div></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {q.opts.map(opt => { const isC = opt === q.correct, isCh = opt === chosen; let bg = "#1e293b", border = "#334155", tc = "#94a3b8"; if (revealed) { if (isC) { bg = "#0d2a1e"; border = "#10b981"; tc = "#34d399"; } else if (isCh) { bg = "#2a0d0d"; border = "#f43f5e"; tc = "#f87171"; } } return <button key={opt} onClick={() => choose(opt)} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: "11px", fontSize: 12, fontWeight: 700, color: tc, cursor: revealed ? "default" : "pointer" }}>{opt}</button>; })}
      </div>
      {revealed && <><div style={{ background: chosen === q.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 10, padding: "12px 16px", borderLeft: `3px solid ${chosen === q.correct ? "#10b981" : "#f43f5e"}`, marginBottom: 12 }}><div style={{ fontSize: 13, fontWeight: 700, color: chosen === q.correct ? "#34d399" : "#f87171", marginBottom: 4 }}>{chosen === q.correct ? "✓ Correct" : "✗ " + q.correct}</div><div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{q.why}</div></div><button onClick={next} style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 20 }}>{r + 1 >= ROUNDS.length ? "Results →" : "Next →"}</button></>}
    </div>
  </div>);
}
