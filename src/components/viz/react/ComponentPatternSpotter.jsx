import { useState } from "react";

const ROUNDS = [
  {
    scenario: "|v⃗| = 10 m/s at 30° from +x axis",
    question: "What is vₓ (horizontal component)?",
    correct: "10 cos 30°",
    trap: "10 sin 30°",
    explanation: "Aₓ = |A⃗| cosθ always. cos gives the horizontal reach when θ is from the +x axis.",
    value: { correct: "10 × √3/2 ≈ 8.66 m/s", trap: "10 × 0.5 = 5.0 m/s" },
  },
  {
    scenario: "|F⃗| = 20 N at 50° above horizontal",
    question: "What is Fᵧ (vertical component)?",
    correct: "20 sin 50°",
    trap: "20 cos 50°",
    explanation: "Aᵧ = |A⃗| sinθ when θ is measured from the horizontal (+x axis). sin gives the vertical reach.",
    value: { correct: "20 × 0.766 ≈ 15.3 N", trap: "20 × 0.643 ≈ 12.9 N" },
  },
  {
    scenario: "|d⃗| = 5 m at 40° from the vertical (y-axis)",
    question: "What is dₓ? (Convert the angle first!)",
    correct: "5 cos 50°",
    trap: "5 cos 40°",
    explanation: "40° from vertical = 90° − 40° = 50° from horizontal. Convert first, then use cosθ for x.",
    note: "Angle from vertical → θ_standard = 90° − given angle",
    value: { correct: "5 × cos50° ≈ 3.21 m", trap: "5 × cos40° ≈ 3.83 m (wrong angle)" },
  },
  {
    scenario: "Aₓ = 6, Aᵧ = 8",
    question: "What is |A⃗|?",
    correct: "√(6² + 8²) = 10",
    trap: "6 + 8 = 14",
    explanation: "Use the Pythagorean theorem — never add components directly. Components are legs of a right triangle, not the hypotenuse.",
    value: { correct: "√(36+64) = √100 = 10 ✓", trap: "14 ✗ (this would only be right if they were collinear)" },
  },
  {
    scenario: "|v⃗| = 15 m/s at 60° below the +x axis",
    question: "What is vᵧ?",
    correct: "−15 sin 60°",
    trap: "15 sin 60°",
    explanation: "'Below the +x axis' means the y-component is negative. Aᵧ = |A⃗| sinθ, but θ = −60° gives a negative sin.",
    value: { correct: "−15 × √3/2 ≈ −13.0 m/s (pointing down)", trap: "+13.0 m/s (wrong sign)" },
  },
];

export default function ComponentPatternSpotter({ params = {} }) {
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState([]);

  const r = ROUNDS[round];

  function choose(isCorrect) {
    if (revealed) return;
    setChosen(isCorrect);
    setRevealed(true);
    if (isCorrect) setScore(s => s + 1);
    setHistory(h => [...h, { scenario: r.scenario, correct: isCorrect }]);
  }

  function next() {
    if (round + 1 >= ROUNDS.length) setFinished(true);
    else { setRound(n => n + 1); setChosen(null); setRevealed(false); }
  }

  function reset() {
    setRound(0); setChosen(null); setRevealed(false);
    setScore(0); setFinished(false); setHistory([]);
  }

  if (finished) {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>PILLAR 3 · COMPONENT PATTERNS</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0", marginBottom: 8 }}>{score} / {ROUNDS.length}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>
          {score === ROUNDS.length ? "Perfect. cos vs sin is automatic now." : "Review the explanations below — then drill again."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {history.map((h, i) => (
            <div key={i} style={{
              background: h.correct ? "#0d2a1e" : "#2a0d0d",
              borderRadius: 8, padding: "10px 14px",
              borderLeft: `2px solid ${h.correct ? "#10b981" : "#f43f5e"}`
            }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{h.scenario}</span>
              <span style={{ float: "right", fontSize: 14 }}>{h.correct ? "✓" : "✗"}</span>
            </div>
          ))}
        </div>
        <button onClick={reset} style={{
          width: "100%", background: "#0ea5e9", color: "#0f172a",
          border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer"
        }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 3 · COS vs SIN DRILL</span>
        <div style={{ display: "flex", gap: 5 }}>
          {ROUNDS.map((_, i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: i < round ? "#10b981" : i === round ? "#0ea5e9" : "#1e293b"
            }} />
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>Round {round + 1} / {ROUNDS.length} · {score} correct</div>

        {/* Scenario */}
        <div style={{
          background: "#1e293b", borderRadius: 12, padding: "18px 20px",
          marginBottom: 14,
          border: revealed
            ? `2px solid ${chosen ? "#10b981" : "#f43f5e"}`
            : "2px solid #334155"
        }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Given:</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{r.scenario}</div>
          <div style={{ fontSize: 13, color: "#94a3b8", borderTop: "1px solid #334155", paddingTop: 8 }}>
            {r.question}
          </div>
          {r.note && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#fcd34d", background: "#1a1500", borderRadius: 6, padding: "5px 8px" }}>
              💡 Hint: {r.note}
            </div>
          )}
        </div>

        {/* Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: r.correct, isCorrect: true },
            { label: r.trap, isCorrect: false },
          ].sort(() => Math.random() > 0.5 ? 1 : -1).map(({ label, isCorrect }) => {
            let bg = "#1e293b", border = "#334155", textC = "#94a3b8";
            if (revealed) {
              if (isCorrect) { bg = "#0d2a1e"; border = "#10b981"; textC = "#34d399"; }
              else if (!isCorrect && chosen === false) { bg = "#2a0d0d"; border = "#f43f5e"; textC = "#f87171"; }
            }
            return (
              <button key={label} onClick={() => choose(isCorrect)}
                style={{
                  background: bg, border: `2px solid ${border}`, borderRadius: 10,
                  padding: "14px 10px", fontSize: 14, fontWeight: 700, color: textC,
                  cursor: revealed ? "default" : "pointer", transition: "all 0.2s",
                  fontFamily: "'Fira Code', monospace"
                }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Reveal */}
        {revealed && (
          <>
            <div style={{
              background: "#0c1a2e", borderLeft: "3px solid #0ea5e9",
              borderRadius: 10, padding: "14px 16px", marginBottom: 10
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: chosen ? "#34d399" : "#f87171", marginBottom: 6 }}>
                {chosen ? "✓ Correct!" : "✗ Not quite."}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 8 }}>{r.explanation}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "#0d2a1e", borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#34d399" }}>
                  ✓ {r.correct}<br /><span style={{ color: "#64748b" }}>{r.value.correct}</span>
                </div>
                <div style={{ background: "#2a0d0d", borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#f87171" }}>
                  ✗ {r.trap}<br /><span style={{ color: "#64748b" }}>{r.value.trap}</span>
                </div>
              </div>
            </div>
            <button onClick={next} style={{
              width: "100%", background: "#0ea5e9", color: "#0f172a",
              border: "none", borderRadius: 10, padding: 12,
              fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 20
            }}>
              {round + 1 >= ROUNDS.length ? "See Results →" : "Next →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
