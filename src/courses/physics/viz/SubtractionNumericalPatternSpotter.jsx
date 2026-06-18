// SubtractionNumericalPatternSpotter.jsx — L8 Pillar 3
import { useState } from "react";

const ROUNDS = [
  { q: "A⃗ = 60N@20°, B⃗ = 45N@110°. What is the FIRST step to find A⃗ − B⃗?", opts: ["Find |A⃗| − |B⃗|","Negate B⃗ components","Draw the parallelogram","Find φ between them"], correct: "Negate B⃗ components", why: "Step 0 before DSMD: flip all signs on B. Then proceed with normal addition." },
  { q: "Bₓ = −20.48, Bᵧ = 14.34. What are −Bₓ and −Bᵧ?", opts: ["20.48 and 14.34","−20.48 and −14.34","20.48 and −14.34","14.34 and 20.48"], correct: "20.48 and −14.34", why: "Negation flips every sign independently. −(−20.48) = +20.48 and −(14.34) = −14.34." },
  { q: "|A⃗ − B⃗|² = |A⃗|² + |B⃗|² − 2|A⃗||B⃗|cosφ. Compare with |A⃗ + B⃗|².", opts: ["Same formula","Only the sign on the cos term differs","Only |A⃗| changes","They're unrelated"], correct: "Only the sign on the cos term differs", why: "Addition: +2|A||B|cosφ. Subtraction: −2|A||B|cosφ. Everything else is identical." },
  { q: "A⃗ − B⃗ vs A⃗ + B⃗ in the component table — what changes?", opts: ["All of column Aₓ, Aᵧ","Only the sign of Bₓ and Bᵧ","The angle column","The magnitude of A⃗"], correct: "Only the sign of Bₓ and Bᵧ", why: "Subtraction = flipping Bₓ → −Bₓ and Bᵧ → −Bᵧ. Everything else stays the same." },
  { q: "Is vector subtraction commutative? A⃗ − B⃗ = B⃗ − A⃗?", opts: ["Yes always","No — they're antiparallel","Only if perpendicular","Only if equal magnitude"], correct: "No — they're antiparallel", why: "B⃗ − A⃗ = −(A⃗ − B⃗). Same magnitude, opposite direction. Subtraction is not commutative." },
  { q: "A⃗ = 10N@0°, B⃗ = 10N@0°. What is |A⃗ − B⃗|?", opts: ["20N","10N","0N","5N"], correct: "0N", why: "Same vector subtracted from itself: (10−10, 0−0) = (0,0). Zero vector." },
];

export default function SubtractionNumericalPatternSpotter({ params = {} }) {
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const r = ROUNDS[round];
  function choose(opt) { if (revealed) return; setChosen(opt); setRevealed(true); const ok = opt === r.correct; if (ok) setScore(s => s + 1); setHistory(h => [...h, { q: r.q, correct: ok, answer: r.correct }]); }
  function next() { if (round + 1 >= ROUNDS.length) setDone(true); else { setRound(n => n + 1); setChosen(null); setRevealed(false); } }
  function reset() { setRound(0); setChosen(null); setRevealed(false); setScore(0); setDone(false); setHistory([]); }
  const C = "#f43f5e";
  if (done) return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 13, color: C, fontWeight: 700, marginBottom: 12 }}>PILLAR 3 · NUMERICAL SUBTRACTION</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0", marginBottom: 16 }}>{score}/{ROUNDS.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {history.map((h, i) => <div key={i} style={{ background: h.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "8px 14px", borderLeft: `2px solid ${h.correct ? "#10b981" : C}` }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>{h.q.substring(0, 55)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: h.correct ? "#34d399" : "#f87171" }}>{h.answer}</div>
        </div>)}
      </div>
      <button onClick={reset} style={{ width: "100%", background: C, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Try Again</button>
    </div>
  );
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: C, fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 3 · NUMERICAL SUBTRACTION</span>
        <div style={{ display: "flex", gap: 5 }}>{ROUNDS.map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < round ? "#10b981" : i === round ? C : "#1e293b" }} />)}</div>
      </div>
      <div style={{ height: 3, background: "#1e293b" }}><div style={{ height: "100%", width: `${(round / ROUNDS.length) * 100}%`, background: C, transition: "width 0.3s" }} /></div>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ background: "#1e293b", borderRadius: 12, padding: "18px", marginBottom: 14, border: revealed ? `2px solid ${chosen === r.correct ? "#10b981" : C}` : "2px solid #334155" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5 }}>Round {round + 1}/{ROUNDS.length} · {score} correct</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{r.q}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {r.opts.map(opt => {
            const isC = opt === r.correct, isCh = opt === chosen;
            let bg = "#1e293b", border = "#334155", tc = "#94a3b8";
            if (revealed) { if (isC) { bg = "#0d2a1e"; border = "#10b981"; tc = "#34d399"; } else if (isCh) { bg = "#2a0d0d"; border = C; tc = "#f87171"; } }
            return <button key={opt} onClick={() => choose(opt)} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: "12px", fontSize: 12, fontWeight: 700, color: tc, cursor: revealed ? "default" : "pointer", transition: "all 0.2s" }}>{opt}</button>;
          })}
        </div>
        {revealed && <><div style={{ background: chosen === r.correct ? "#0d2a1e" : "#2a0d0d", borderRadius: 10, padding: "12px 16px", borderLeft: `3px solid ${chosen === r.correct ? "#10b981" : C}`, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: chosen === r.correct ? "#34d399" : "#f87171", marginBottom: 4 }}>{chosen === r.correct ? "✓ Correct" : "✗ " + r.correct}</div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{r.why}</div>
        </div>
          <button onClick={next} style={{ width: "100%", background: C, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 20 }}>{round + 1 >= ROUNDS.length ? "Results →" : "Next →"}</button>
        </>}
      </div>
    </div>
  );
}
