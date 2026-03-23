// ForcePatternSpotter.jsx — L9 Pillar 3
import { useState } from "react";
const ROUNDS = [
  { q: "Forces 30N east and 40N north act on an object. What is |F⃗_net|?", opts: ["70N","50N","10N","35N"], correct: "50N", why: "Perpendicular forces → Pythagorean theorem: √(30²+40²) = 50N. Never add magnitudes directly." },
  { q: "ΣFₓ = 0 but ΣFᵧ = 5N. Is the object in equilibrium?", opts: ["Yes","No — it accelerates vertically","No — it accelerates horizontally","Depends on mass"], correct: "No — it accelerates vertically", why: "Equilibrium requires BOTH ΣFₓ=0 AND ΣFᵧ=0 simultaneously. One non-zero component breaks equilibrium." },
  { q: "Three forces of 10N each at 0°, 120°, 240°. What is |F⃗_net|?", opts: ["30N","10N","0N","17.3N"], correct: "0N", why: "Symmetric forces 120° apart cancel perfectly. ΣFₓ=ΣFᵧ=0. This is the equilateral triangle of forces." },
  { q: "Newton's 2nd law in vector form is…", opts: ["F = ma","F⃗_net = ma⃗","ΣF = m|a|","F⃗ = m/a⃗"], correct: "F⃗_net = ma⃗", why: "Both sides are vectors. The direction of acceleration equals the direction of net force." },
  { q: "A 2kg object has ΣFₓ=6N, ΣFᵧ=8N. What is |a⃗|?", opts: ["7 m/s²","5 m/s²","10 m/s²","3 m/s²"], correct: "5 m/s²", why: "|F⃗_net|=√(36+64)=10N. |a|=F/m=10/2=5 m/s²." },
];
export default function ForcePatternSpotter({ params = {} }) {
  const [round, setRound] = useState(0); const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false); const [score, setScore] = useState(0);
  const [done, setDone] = useState(false); const [history, setHistory] = useState([]);
  const r = ROUNDS[round]; const C = "#10b981";
  function choose(opt) { if (revealed) return; setChosen(opt); setRevealed(true); const ok = opt === r.correct; if (ok) setScore(s => s + 1); setHistory(h => [...h, { q: r.q, correct: ok, answer: r.correct }]); }
  function next() { if (round + 1 >= ROUNDS.length) setDone(true); else { setRound(n => n + 1); setChosen(null); setRevealed(false); } }
  function reset() { setRound(0); setChosen(null); setRevealed(false); setScore(0); setDone(false); setHistory([]); }
  if (done) return (<div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
    <div style={{ fontSize: 13, color: C, fontWeight: 700, marginBottom: 12 }}>PILLAR 3 · FORCE PATTERNS</div>
    <div style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0", marginBottom: 16 }}>{score}/{ROUNDS.length}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>{history.map((h, i) => <div key={i} style={{ background: h.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "8px 14px", borderLeft: `2px solid ${h.correct ? C : "#f43f5e"}` }}><div style={{ fontSize: 12, color: "#64748b" }}>{h.q.substring(0, 55)}</div><div style={{ fontSize: 12, fontWeight: 700, color: h.correct ? "#34d399" : "#f87171" }}>{h.answer}</div></div>)}</div>
    <button onClick={reset} style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Try Again</button>
  </div>);
  return (<div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
    <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: C, fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 3 · FORCE PATTERNS</span>
      <div style={{ display: "flex", gap: 5 }}>{ROUNDS.map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < round ? "#6366f1" : i === round ? C : "#1e293b" }} />)}</div>
    </div>
    <div style={{ height: 3, background: "#1e293b" }}><div style={{ height: "100%", width: `${(round / ROUNDS.length) * 100}%`, background: C, transition: "width 0.3s" }} /></div>
    <div style={{ padding: "18px 20px 0" }}>
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "18px", marginBottom: 14, border: revealed ? `2px solid ${chosen === r.correct ? C : "#f43f5e"}` : "2px solid #334155" }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5 }}>Round {round + 1}/{ROUNDS.length}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{r.q}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {r.opts.map(opt => {
          const isC = opt === r.correct, isCh = opt === chosen;
          let bg = "#1e293b", border = "#334155", tc = "#94a3b8";
          if (revealed) { if (isC) { bg = "#0d2a1e"; border = C; tc = "#34d399"; } else if (isCh) { bg = "#2a0d0d"; border = "#f43f5e"; tc = "#f87171"; } }
          return <button key={opt} onClick={() => choose(opt)} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 700, color: tc, cursor: revealed ? "default" : "pointer" }}>{opt}</button>;
        })}
      </div>
      {revealed && <><div style={{ background: chosen === r.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 10, padding: "12px 16px", borderLeft: `3px solid ${chosen === r.correct ? C : "#f43f5e"}`, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: chosen === r.correct ? "#34d399" : "#f87171", marginBottom: 4 }}>{chosen === r.correct ? "✓ Correct" : "✗ " + r.correct}</div>
        <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{r.why}</div>
      </div>
        <button onClick={next} style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 20 }}>{round + 1 >= ROUNDS.length ? "Results →" : "Next →"}</button>
      </>}
    </div>
  </div>);
}
