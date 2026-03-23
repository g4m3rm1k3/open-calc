import { useState, useCallback } from "react";

const ROUNDS = [
  { expression: "F⃗", type: "vector", note: "Arrow over the letter = vector." },
  { expression: "|F⃗|", type: "scalar", note: "Vertical bars strip the direction. Result is a positive number." },
  { expression: "k̂", type: "unit vector", note: "Hat notation = unit vector. Magnitude is exactly 1, direction only." },
  { expression: "Fₓ", type: "scalar", note: "A single component (subscript x, y, or z) is just a number — a scalar." },
  { expression: "𝐀", type: "vector", note: "Bold in a printed textbook = vector. Equivalent to A⃗." },
  { expression: "Aₓî + Aᵧĵ", type: "vector", note: "Sum of scalar × unit-vector terms — always a vector." },
  { expression: "√(Aₓ²+Aᵧ²)", type: "scalar", note: "This computes |A⃗|. The formula is a number — the magnitude." },
  { expression: "(3, −4)", type: "vector", note: "Ordered pair = component notation for a vector." },
  { expression: "10 · n̂", type: "vector", note: "Scalar × unit vector = vector. The scalar sets the magnitude; the hat sets direction." },
  { expression: "5 N", type: "scalar", note: "No direction given — this is a magnitude (force strength), a scalar." },
];

const TYPE_COLORS = {
  vector: { bg: "#1a1a3e", border: "#6366f1", text: "#818cf8" },
  scalar: { bg: "#0d2a1e", border: "#10b981", text: "#34d399" },
  "unit vector": { bg: "#2a1a0e", border: "#f59e0b", text: "#fcd34d" },
};

const ALL_TYPES = ["vector", "scalar", "unit vector"];

export default function NotationPatternSpotter({ params = {} }) {
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState([]);

  const r = ROUNDS[round];

  function choose(t) {
    if (revealed) return;
    setChosen(t);
    setRevealed(true);
    const correct = t === r.type;
    if (correct) setScore(s => s + 1);
    setHistory(h => [...h, { expression: r.expression, correct, type: r.type }]);
  }

  function next() {
    if (round + 1 >= ROUNDS.length) {
      setFinished(true);
    } else {
      setRound(n => n + 1);
      setChosen(null);
      setRevealed(false);
    }
  }

  function reset() {
    setRound(0); setChosen(null); setRevealed(false);
    setScore(0); setFinished(false); setHistory([]);
  }

  if (finished) {
    const pct = Math.round((score / ROUNDS.length) * 100);
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>PILLAR 3 · NOTATION RECOGNITION</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0" }}>{pct}%</div>
        <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 24 }}>
          {score} / {ROUNDS.length} — {pct === 100 ? "Flawless." : pct >= 80 ? "Strong. Review the misses." : "Keep drilling."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {history.map((h, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: h.correct ? "#0d2a1e" : "#2a0d0d",
              borderRadius: 8, padding: "8px 12px",
              borderLeft: `2px solid ${h.correct ? "#10b981" : "#f43f5e"}`
            }}>
              <span style={{ fontSize: 15, minWidth: 32, textAlign: "center" }}>{h.correct ? "✓" : "✗"}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0", minWidth: 80 }}>{h.expression}</span>
              <span style={{ fontSize: 12, color: TYPE_COLORS[h.type]?.text }}>{h.type.toUpperCase()}</span>
            </div>
          ))}
        </div>
        <button onClick={reset} style={{
          background: "#f59e0b", color: "#0f172a", border: "none",
          borderRadius: 10, padding: "12px 0", fontSize: 14,
          fontWeight: 800, cursor: "pointer", width: "100%"
        }}>Try Again</button>
      </div>
    );
  }

  const progress = round / ROUNDS.length;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 3 · NOTATION RECOGNITION</span>
        <div style={{ display: "flex", gap: 6 }}>
          {ROUNDS.map((_, i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: i < round ? "#10b981" : i === round ? "#f59e0b" : "#1e293b"
            }} />
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 3, background: "#1e293b" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: "#f59e0b", transition: "width 0.3s" }} />
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>
          Round {round + 1} / {ROUNDS.length} · Score: {score}
        </div>

        {/* Expression card */}
        <div style={{
          background: "#1e293b", borderRadius: 12, padding: "36px 24px",
          textAlign: "center", marginBottom: 20,
          border: revealed
            ? `2px solid ${TYPE_COLORS[r.type]?.border}`
            : "2px solid #334155"
        }}>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>What type of quantity is this?</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#e2e8f0", letterSpacing: "0.02em" }}>{r.expression}</div>
        </div>

        {/* Answer buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {ALL_TYPES.map(t => {
            const isCorrect = t === r.type;
            const isChosen = t === chosen;
            const c = TYPE_COLORS[t];
            let bg = "#1e293b", border = "#334155", textC = "#64748b";
            if (revealed) {
              if (isCorrect) { bg = c.bg; border = c.border; textC = c.text; }
              else if (isChosen && !isCorrect) { bg = "#2a0d0d"; border = "#f43f5e"; textC = "#f87171"; }
            }
            return (
              <button key={t} onClick={() => choose(t)}
                style={{
                  flex: 1, background: bg, border: `2px solid ${border}`,
                  borderRadius: 10, padding: "12px 0",
                  fontSize: 12, fontWeight: 700, color: textC,
                  cursor: revealed ? "default" : "pointer",
                  transition: "all 0.2s", letterSpacing: "0.05em"
                }}>
                {t.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && (
          <>
            <div style={{
              background: chosen === r.type ? "#0d2a1e" : "#2a0d0d",
              borderLeft: `3px solid ${chosen === r.type ? "#10b981" : "#f43f5e"}`,
              borderRadius: 10, padding: "14px 16px", marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: chosen === r.type ? "#34d399" : "#f87171", marginBottom: 6 }}>
                {chosen === r.type ? "✓ Correct" : `✗ This is a ${r.type}`}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{r.note}</div>
            </div>
            <button onClick={next} style={{
              width: "100%", background: "#f59e0b", color: "#0f172a",
              border: "none", borderRadius: 10, padding: 14,
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
