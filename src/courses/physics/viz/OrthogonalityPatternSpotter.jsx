// OrthogonalityPatternSpotter.jsx
import { useState } from "react";
const ROUNDS = [
  { q: "A⃗ = (3, 4), B⃗ = (8, −6). Are they perpendicular?", opts: ["Yes","No"], correct: "Yes", why: "A⃗·B⃗ = 3×8 + 4×(−6) = 24−24 = 0. Zero dot product means perpendicular." },
  { q: "A⃗ = (1, 2), B⃗ = (2, 1). Are they perpendicular?", opts: ["Yes","No"], correct: "No", why: "A⃗·B⃗ = 1×2 + 2×1 = 4 ≠ 0. Not perpendicular." },
  { q: "î and ĵ. Are they perpendicular?", opts: ["Yes","No"], correct: "Yes", why: "î·ĵ = 1×0 + 0×1 = 0. The basis vectors are orthogonal by definition." },
  { q: "A⃗ and A⃗. Are they perpendicular?", opts: ["Yes — if |A⃗|=0","No — never (unless A⃗=0⃗)","Always","Only in 3D"], correct: "No — never (unless A⃗=0⃗)", why: "A⃗·A⃗ = |A⃗|² ≥ 0. It's zero only if A⃗=0⃗. A non-zero vector can't be perpendicular to itself." },
  { q: "A⃗ = (a, b). What vector is always perpendicular to A⃗?", opts: ["(−a,−b)","(b,−a)","(a,−b)","(−b,a) or (b,−a)"], correct: "(−b,a) or (b,−a)", why: "(a,b)·(−b,a) = −ab+ba = 0. Rotating 90° gives a perpendicular vector." },
];
export default function OrthogonalityPatternSpotter({ params = {} }) {
  const [round, setRound] = useState(0); const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false); const [score, setScore] = useState(0);
  const [done, setDone] = useState(false); const [history, setHistory] = useState([]);
  const r = ROUNDS[round]; const C = "#818cf8";
  function choose(opt) { if (revealed) return; setChosen(opt); setRevealed(true); const ok = opt === r.correct; if (ok) setScore(s => s + 1); setHistory(h => [...h, { q: r.q, correct: ok, answer: r.correct }]); }
  function next() { if (round + 1 >= ROUNDS.length) setDone(true); else { setRound(n => n + 1); setChosen(null); setRevealed(false); } }
  function reset() { setRound(0); setChosen(null); setRevealed(false); setScore(0); setDone(false); setHistory([]); }
  if (done) return (<div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}><div style={{ fontSize: 13, color: C, fontWeight: 700, marginBottom: 12 }}>PILLAR 3 · ORTHOGONALITY</div><div style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0", marginBottom: 16 }}>{score}/{ROUNDS.length}</div><div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>{history.map((h, i) => <div key={i} style={{ background: h.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "8px 14px", borderLeft: `2px solid ${h.correct ? "#10b981" : "#f43f5e"}` }}><div style={{ fontSize: 12, color: "#64748b" }}>{h.q.substring(0, 55)}</div><div style={{ fontSize: 12, fontWeight: 700, color: h.correct ? "#34d399" : "#f87171" }}>{h.answer}</div></div>)}</div><button onClick={reset} style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Try Again</button></div>);
  return (<div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
    <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 13, color: C, fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 3 · ORTHOGONALITY</span><div style={{ display: "flex", gap: 5 }}>{ROUNDS.map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < round ? "#10b981" : i === round ? C : "#1e293b" }} />)}</div></div>
    <div style={{ height: 3, background: "#1e293b" }}><div style={{ height: "100%", width: `${(round / ROUNDS.length) * 100}%`, background: C, transition: "width 0.3s" }} /></div>
    <div style={{ padding: "18px 20px 0" }}>
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "18px", marginBottom: 14, border: revealed ? `2px solid ${chosen === r.correct ? "#10b981" : "#f43f5e"}` : "2px solid #334155" }}><div style={{ fontSize: 12, color: "#64748b", marginBottom: 5 }}>Round {round + 1}/{ROUNDS.length}</div><div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{r.q}</div></div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${r.opts.length},1fr)`, gap: 8, marginBottom: 12 }}>
        {r.opts.map(opt => { const isC = opt === r.correct, isCh = opt === chosen; let bg = "#1e293b", border = "#334155", tc = "#94a3b8"; if (revealed) { if (isC) { bg = "#0d2a1e"; border = "#10b981"; tc = "#34d399"; } else if (isCh) { bg = "#2a0d0d"; border = "#f43f5e"; tc = "#f87171"; } } return <button key={opt} onClick={() => choose(opt)} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 700, color: tc, cursor: revealed ? "default" : "pointer" }}>{opt}</button>; })}
      </div>
      {revealed && <><div style={{ background: chosen === r.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 10, padding: "12px 16px", borderLeft: `3px solid ${chosen === r.correct ? "#10b981" : "#f43f5e"}`, marginBottom: 12 }}><div style={{ fontSize: 13, fontWeight: 700, color: chosen === r.correct ? "#34d399" : "#f87171", marginBottom: 4 }}>{chosen === r.correct ? "✓ Correct" : "✗ " + r.correct}</div><div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{r.why}</div></div><button onClick={next} style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 20 }}>{round + 1 >= ROUNDS.length ? "Results →" : "Next →"}</button></>}
    </div>
  </div>);
}
