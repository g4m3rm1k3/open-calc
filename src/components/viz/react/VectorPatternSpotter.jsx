import { useState } from "react";

const ROUNDS = [
  { quantity: "12 m/s west", answer: "vector", reason: "Velocity — has both speed (12 m/s) and direction (west).", symbol: "v⃗" },
  { quantity: "100 J", answer: "scalar", reason: "Energy is always a scalar — no direction involved.", symbol: "E" },
  { quantity: "9.8 m/s² downward", answer: "vector", reason: "Gravitational acceleration always has a direction (toward Earth's centre).", symbol: "g⃗" },
  { quantity: "273 K", answer: "scalar", reason: "Temperature is a pure number — it makes no sense to say temperature points north.", symbol: "T" },
  { quantity: "50 N at 30°", answer: "vector", reason: "Force with a direction — classic vector. Giving only '50 N' would be a scalar (magnitude).", symbol: "F⃗" },
  { quantity: "3.0 kg", answer: "scalar", reason: "Mass is scalar. Weight (the gravitational force on that mass) is a vector.", symbol: "m" },
  { quantity: "Δr = 5 m north", answer: "vector", reason: "Displacement is the vector version of distance — it encodes direction.", symbol: "Δr⃗" },
  { quantity: "60 W", answer: "scalar", reason: "Power is the rate of doing work — a scalar. You can't point at power.", symbol: "P" },
];

const BADGE = {
  vector: { bg: "#1a2744", border: "#6366f1", text: "#818cf8", label: "VECTOR" },
  scalar: { bg: "#1a2a1a", border: "#10b981", text: "#34d399", label: "SCALAR" },
};

export default function VectorPatternSpotter({ params = {} }) {
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(null); // 'correct' | 'wrong'
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);

  const r = ROUNDS[round];

  function choose(ans) {
    if (answered) return;
    const correct = ans === r.answer;
    setChosen(ans);
    setAnswered(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setHistory(h => [...h, { quantity: r.quantity, correct, chosen: ans, correct_ans: r.answer }]);
  }

  function next() {
    if (round + 1 >= ROUNDS.length) {
      setDone(true);
    } else {
      setRound(n => n + 1);
      setAnswered(null);
      setChosen(null);
    }
  }

  function reset() {
    setRound(0); setAnswered(null); setChosen(null);
    setDone(false); setScore(0); setHistory([]);
  }

  if (done) {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, padding: 28 }}>
        <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12 }}>PILLAR 3 · PATTERN RECOGNITION</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0", marginBottom: 8 }}>
          {score} / {ROUNDS.length}
        </div>
        <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 24 }}>
          {score === ROUNDS.length ? "Perfect — you can classify any quantity cold." : score >= 6 ? "Strong. Review the misses below." : "Keep drilling — this becomes reflexive with practice."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {history.map((h, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: h.correct ? "#0d2a1e" : "#2a0d0d",
              borderRadius: 8, padding: "8px 14px",
              borderLeft: `3px solid ${h.correct ? "#10b981" : "#f43f5e"}`
            }}>
              <span style={{ fontSize: 16 }}>{h.correct ? "✓" : "✗"}</span>
              <span style={{ fontSize: 13, color: "#e2e8f0", flex: 1 }}>{h.quantity}</span>
              <span style={{ fontSize: 12, color: h.correct ? "#34d399" : "#f87171" }}>
                {h.correct_ans.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
        <button onClick={reset} style={{
          background: "#6366f1", color: "#fff", border: "none",
          borderRadius: 10, padding: "12px 24px", fontSize: 14,
          fontWeight: 700, cursor: "pointer", width: "100%"
        }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 3 · PATTERN RECOGNITION</span>
        <div style={{ display: "flex", gap: 6 }}>
          {ROUNDS.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i < round ? "#10b981" : i === round ? "#6366f1" : "#1e293b"
            }} />
          ))}
        </div>
      </div>

      {/* Round counter */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Round {round + 1} of {ROUNDS.length} · Score: {score}</div>

        {/* Quantity card */}
        <div style={{
          background: "#1e293b", borderRadius: 12, padding: "28px 24px",
          textAlign: "center", marginBottom: 20,
          border: answered
            ? `2px solid ${answered === "correct" ? "#10b981" : "#f43f5e"}`
            : "2px solid #334155"
        }}>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Classify this quantity:</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0", marginBottom: 6 }}>{r.quantity}</div>
          <div style={{ fontSize: 13, color: "#475569" }}>Vector or scalar?</div>
        </div>

        {/* Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {["vector", "scalar"].map(opt => {
            const b = BADGE[opt];
            const isChosen = chosen === opt;
            const isCorrect = opt === r.answer;
            let bg = "#1e293b", border = "#334155", textC = "#94a3b8";
            if (answered) {
              if (isCorrect) { bg = b.bg; border = b.border; textC = b.text; }
              else if (isChosen && !isCorrect) { bg = "#2a0d0d"; border = "#f43f5e"; textC = "#f87171"; }
            } else if (isChosen) {
              bg = b.bg; border = b.border; textC = b.text;
            }
            return (
              <button key={opt} onClick={() => choose(opt)}
                style={{
                  background: bg, border: `2px solid ${border}`,
                  borderRadius: 10, padding: "16px",
                  fontSize: 15, fontWeight: 700, color: textC,
                  cursor: answered ? "default" : "pointer",
                  transition: "all 0.2s", letterSpacing: "0.06em"
                }}>
                {b.label}
              </button>
            );
          })}
        </div>

        {/* Reveal */}
        {answered && (
          <div style={{
            background: answered === "correct" ? "#0d2a1e" : "#2a0d0d",
            borderRadius: 10, padding: "14px 16px", marginBottom: 16,
            borderLeft: `3px solid ${answered === "correct" ? "#10b981" : "#f43f5e"}`
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: answered === "correct" ? "#34d399" : "#f87171", marginBottom: 6 }}>
              {answered === "correct" ? "✓ Correct!" : `✗ Not quite — it's a ${r.answer}.`}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{r.reason}</div>
            {r.answer === "vector" && (
              <div style={{ marginTop: 8, fontSize: 20, color: "#818cf8" }}>→ {r.symbol}</div>
            )}
          </div>
        )}

        {answered && (
          <button onClick={next} style={{
            width: "100%", background: "#6366f1", color: "#fff",
            border: "none", borderRadius: 10, padding: "14px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            marginBottom: 20
          }}>
            {round + 1 >= ROUNDS.length ? "See Results →" : "Next Round →"}
          </button>
        )}
      </div>
    </div>
  );
}
