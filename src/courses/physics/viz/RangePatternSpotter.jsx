// RangePatternSpotter.jsx — Ch3 L5-6 Pillar 3
import { useState } from "react";
const G = 9.8;
const ROUNDS = [
  {
    q: "v₀ = 20 m/s, θ = 45°. What is the range?",
    opts: ["40.8 m", "20.4 m", "81.6 m", "60 m"],
    correct: "40.8 m",
    why: "R = v₀²sin90°/g = 400/9.8 ≈ 40.8 m. At 45°, sin2θ = sin90° = 1 — maximum for this speed.",
  },
  {
    q: "A projectile launched at 30° has range R. What is the range at 60°?",
    opts: ["R/2", "2R", "R", "R√3"],
    correct: "R",
    why: "sin(2×30°) = sin60°, sin(2×60°) = sin120° = sin60°. Complementary angles give equal range. R(30°) = R(60°).",
  },
  {
    q: "To double the range at the same angle, by what factor must v₀ increase?",
    opts: ["×2", "×√2", "×4", "×√3"],
    correct: "×√2",
    why: "R = v₀²sin2θ/g. R is proportional to v₀². To double R, need v₀ × √2.",
  },
  {
    q: "Ball launched at 25 m/s at 53°. What is the time of flight? (sin53°≈0.8, g=9.8)",
    opts: ["4.08 s", "2.04 s", "3.06 s", "5.0 s"],
    correct: "4.08 s",
    why: "t = 2vy₀/g = 2(25×0.8)/9.8 = 40/9.8 ≈ 4.08 s.",
  },
  {
    q: "Which angle gives the greatest range on level ground?",
    opts: ["30°", "45°", "60°", "Depends on v₀"],
    correct: "45°",
    why: "R = v₀²sin2θ/g. Maximum when sin2θ = 1, i.e. 2θ = 90°, θ = 45°. Independent of v₀.",
  },
];
export default function RangePatternSpotter({ params = {} }) {
  const [r, setR] = useState(0); const [chosen, setChosen] = useState(null); const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0); const [done, setDone] = useState(false); const [history, setHistory] = useState([]);
  const q = ROUNDS[r]; const C = "#10b981";
  function choose(opt) { if (revealed) return; setChosen(opt); setRevealed(true); const ok = opt === q.correct; if (ok) setScore(s => s + 1); setHistory(h => [...h, { q: q.q, correct: ok, answer: q.correct }]); }
  function next() { if (r + 1 >= ROUNDS.length) setDone(true); else { setR(n => n + 1); setChosen(null); setRevealed(false); } }
  function reset() { setR(0); setChosen(null); setRevealed(false); setScore(0); setDone(false); setHistory([]); }
  if (done) return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 13, color: C, fontWeight: 700, marginBottom: 12 }}>RANGE PATTERNS</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0", marginBottom: 16 }}>{score}/{ROUNDS.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {history.map((h, i) => <div key={i} style={{ background: h.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "8px 14px", borderLeft: `2px solid ${h.correct ? C : "#f43f5e"}` }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>{h.q.substring(0, 55)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: h.correct ? "#34d399" : "#f87171" }}>{h.answer}</div>
        </div>)}
      </div>
      <button onClick={reset} style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Try Again</button>
    </div>
  );
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: C, fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 3 · RANGE PATTERNS</span>
        <div style={{ display: "flex", gap: 5 }}>{ROUNDS.map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < r ? "#6366f1" : i === r ? C : "#1e293b" }} />)}</div>
      </div>
      <div style={{ height: 3, background: "#1e293b" }}><div style={{ height: "100%", width: `${(r / ROUNDS.length) * 100}%`, background: C, transition: "width 0.3s" }} /></div>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ background: "#1e293b", borderRadius: 12, padding: "18px", marginBottom: 14, border: revealed ? `2px solid ${chosen === q.correct ? C : "#f43f5e"}` : "2px solid #334155" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5 }}>Round {r + 1}/{ROUNDS.length}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{q.q}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {q.opts.map(opt => { const isC = opt === q.correct, isCh = opt === chosen; let bg = "#1e293b", border = "#334155", tc = "#94a3b8"; if (revealed) { if (isC) { bg = "#0d2a1e"; border = C; tc = "#34d399"; } else if (isCh) { bg = "#2a0d0d"; border = "#f43f5e"; tc = "#f87171"; } } return <button key={opt} onClick={() => choose(opt)} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: "11px", fontSize: 13, fontWeight: 700, color: tc, cursor: revealed ? "default" : "pointer" }}>{opt}</button>; })}
        </div>
        {revealed && <>
          <div style={{ background: chosen === q.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 10, padding: "12px 16px", borderLeft: `3px solid ${chosen === q.correct ? C : "#f43f5e"}`, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: chosen === q.correct ? "#34d399" : "#f87171", marginBottom: 4 }}>{chosen === q.correct ? "✓ Correct" : "✗ " + q.correct}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{q.why}</div>
          </div>
          <button onClick={next} style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 20 }}>{r + 1 >= ROUNDS.length ? "Results →" : "Next →"}</button>
        </>}
      </div>
    </div>
  );
}
