import { useState } from "react";

const ROUNDS = [
  { q: "A⃗ = (5, 3), B⃗ = (2, 1). What is A⃗ − B⃗?", options: ["(3, 2)", "(7, 4)", "(3, 4)", "(−3, −2)"], correct: "(3, 2)", why: "Subtract component-wise: (5−2, 3−1) = (3, 2)." },
  { q: "What is −B⃗ if B⃗ = (4, −6)?", options: ["(4, 6)", "(−4, 6)", "(−4, −6)", "(6, −4)"], correct: "(−4, 6)", why: "Negate every component: (−4, −(−6)) = (−4, 6)." },
  { q: "A⃗ − B⃗ vs B⃗ − A⃗: what is the relationship?", options: ["They're equal", "They're antiparallel", "Same direction, different size", "Unrelated"], correct: "They're antiparallel", why: "B⃗ − A⃗ = −(A⃗ − B⃗). Same magnitude, exactly opposite direction." },
  { q: "In the tail-to-tail method, A⃗ − B⃗ goes from ___", options: ["tip of A⃗ to tail of B⃗", "tip of B⃗ to tip of A⃗", "tail of A⃗ to tail of B⃗", "tip of A⃗ to tip of B⃗"], correct: "tip of B⃗ to tip of A⃗", why: "With tails at the same point, A⃗−B⃗ points from where B⃗ ends to where A⃗ ends." },
  { q: "A car changes from v⃗_i = 30 m/s east to v⃗_f = 40 m/s north. Is |Δv⃗| = 10 m/s?", options: ["Yes", "No — it's 50 m/s", "No — it's 70 m/s", "No — it's 0"], correct: "No — it's 50 m/s", why: "|Δv⃗| = √(30²+40²) = 50 m/s. Speed difference (|40−30|=10) and velocity change magnitude are completely different things." },
  { q: "If A⃗ = B⃗, what is A⃗ − B⃗?", options: ["2A⃗", "0⃗", "A⃗", "−A⃗"], correct: "0⃗", why: "A⃗ − A⃗ = (Aₓ−Aₓ, Aᵧ−Aᵧ) = (0,0) = 0⃗. The zero vector." },
  { q: "|A⃗| = 5, |B⃗| = 5, angle between them = 180°. What is |A⃗ − B⃗|?", options: ["0", "5", "10", "5√2"], correct: "10", why: "Antiparallel: A⃗ and B⃗ point in opposite directions. A⃗ − B⃗ = A⃗ + A⃗ = 2A⃗, magnitude 10." },
];

export default function SubtractionPatternSpotter({ params = {} }) {
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const r = ROUNDS[round];

  function choose(opt) {
    if (revealed) return;
    setChosen(opt); setRevealed(true);
    const ok = opt === r.correct;
    if (ok) setScore(s => s + 1);
    setHistory(h => [...h, { q: r.q, correct: ok, answer: r.correct }]);
  }
  function next() { if (round + 1 >= ROUNDS.length) setDone(true); else { setRound(n => n + 1); setChosen(null); setRevealed(false); } }
  function reset() { setRound(0); setChosen(null); setRevealed(false); setScore(0); setDone(false); setHistory([]); }

  if (done) return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, marginBottom: 12 }}>PILLAR 3 · SUBTRACTION PATTERNS</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0", marginBottom: 16 }}>{score}/{ROUNDS.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {history.map((h, i) => (
          <div key={i} style={{ background: h.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "8px 14px", borderLeft: `2px solid ${h.correct ? "#10b981" : "#f43f5e"}` }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>{h.q.substring(0, 55)}…</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: h.correct ? "#34d399" : "#f87171" }}>{h.answer}</div>
          </div>
        ))}
      </div>
      <button onClick={reset} style={{ width: "100%", background: "#f43f5e", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Try Again</button>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 3 · SUBTRACTION PATTERNS</span>
        <div style={{ display: "flex", gap: 5 }}>
          {ROUNDS.map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < round ? "#10b981" : i === round ? "#f43f5e" : "#1e293b" }} />)}
        </div>
      </div>
      <div style={{ height: 3, background: "#1e293b" }}><div style={{ height: "100%", width: `${(round / ROUNDS.length) * 100}%`, background: "#f43f5e", transition: "width 0.3s" }} /></div>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ background: "#1e293b", borderRadius: 12, padding: "18px", marginBottom: 14, border: revealed ? `2px solid ${chosen === r.correct ? "#10b981" : "#f43f5e"}` : "2px solid #334155" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5 }}>Round {round + 1}/{ROUNDS.length} · {score} correct</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{r.q}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {r.options.map(opt => {
            const isC = opt === r.correct, isCh = opt === chosen;
            let bg = "#1e293b", border = "#334155", tc = "#94a3b8";
            if (revealed) { if (isC) { bg = "#0d2a1e"; border = "#10b981"; tc = "#34d399"; } else if (isCh) { bg = "#2a0d0d"; border = "#f43f5e"; tc = "#f87171"; } }
            return <button key={opt} onClick={() => choose(opt)} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 700, color: tc, cursor: revealed ? "default" : "pointer", transition: "all 0.2s", fontFamily: "'Fira Code',monospace" }}>{opt}</button>;
          })}
        </div>
        {revealed && <>
          <div style={{ background: chosen === r.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 10, padding: "12px 16px", borderLeft: `3px solid ${chosen === r.correct ? "#10b981" : "#f43f5e"}`, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: chosen === r.correct ? "#34d399" : "#f87171", marginBottom: 4 }}>{chosen === r.correct ? "✓ Correct" : "✗ " + r.correct}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{r.why}</div>
          </div>
          <button onClick={next} style={{ width: "100%", background: "#f43f5e", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 20 }}>
            {round + 1 >= ROUNDS.length ? "Results →" : "Next →"}
          </button>
        </>}
      </div>
    </div>
  );
}
