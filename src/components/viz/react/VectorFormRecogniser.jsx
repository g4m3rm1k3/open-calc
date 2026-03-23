import { useState } from "react";

const FORMS = [
  {
    notation: "A⃗",
    label: "Arrow notation",
    example: "F⃗ = 10 N east",
    description: "Standard handwritten form. The arrow over the letter is the signal.",
    isVector: true,
    color: "#6366f1",
  },
  {
    notation: "𝐀",
    label: "Bold notation",
    example: "𝐯 = 3 m/s north",
    description: "Printed textbooks (physics & linear algebra) bold the letter instead of adding an arrow.",
    isVector: true,
    color: "#6366f1",
  },
  {
    notation: "(Aₓ, Aᵧ)",
    label: "Component / bracket form",
    example: "d⃗ = (4, −3) m",
    description: "Ordered pair of components. Direction is encoded by the signs and relative sizes.",
    isVector: true,
    color: "#6366f1",
  },
  {
    notation: "|A⃗|  or  A",
    label: "Magnitude — scalar",
    example: "|F⃗| = 10 N",
    description: "Vertical bars strip the direction. The result is a positive scalar (always ≥ 0).",
    isVector: false,
    color: "#10b981",
  },
  {
    notation: "|A⃗| ∠ θ",
    label: "Magnitude–angle (polar) form",
    example: "|v⃗| = 5 m/s ∠ 37°",
    description: "Common in engineering. Gives magnitude and angle from +x axis in one compact notation.",
    isVector: true,
    color: "#6366f1",
  },
  {
    notation: "Aₓ î + Aᵧ ĵ",
    label: "Unit-vector (component) notation",
    example: "F⃗ = 3î − 4ĵ N",
    description: "Expands the vector into basis vectors. Most common in physics problem-solving.",
    isVector: true,
    color: "#6366f1",
  },
  {
    notation: "Â  (hat)",
    label: "Unit vector — magnitude = 1",
    example: "v̂ = (0.6, 0.8)",
    description: "The hat signals a pure direction with no magnitude. |Â| = 1 always.",
    isVector: true,
    color: "#f59e0b",
    special: "magnitude = 1",
  },
  {
    notation: "−A⃗",
    label: "Negative vector",
    example: "If A⃗ = (3,4) then −A⃗ = (−3,−4)",
    description: "Same magnitude, opposite direction. Negating flips every component's sign.",
    isVector: true,
    color: "#f43f5e",
  },
];

export default function VectorFormRecogniser({ params = {} }) {
  const [selected, setSelected] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizHistory, setQuizHistory] = useState([]);

  const shuffled = [...FORMS].sort(() => Math.random() - 0.5);

  function answerQuiz(isVec) {
    if (quizAnswered) return;
    const correct = isVec === shuffled[quizIdx].isVector;
    setQuizAnswered(correct ? "correct" : "wrong");
    if (correct) setQuizScore(s => s + 1);
    setQuizHistory(h => [...h, { ...shuffled[quizIdx], playerCorrect: correct }]);
  }

  function nextQuiz() {
    if (quizIdx + 1 >= FORMS.length) {
      setQuizMode(false);
    } else {
      setQuizIdx(n => n + 1);
      setQuizAnswered(null);
    }
  }

  if (quizMode) {
    const q = shuffled[quizIdx];
    const progress = (quizIdx / FORMS.length) * 100;
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 5 · NOTATION DRILL</span>
          <span style={{ fontSize: 13, color: "#475569" }}>{quizIdx + 1} / {FORMS.length} · {quizScore} correct</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 3, background: "#1e293b" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#6366f1", transition: "width 0.3s" }} />
        </div>

        <div style={{ padding: "24px 20px" }}>
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>Is this expression a vector or a scalar?</div>

          <div style={{
            background: "#1e293b", borderRadius: 12, padding: "32px",
            textAlign: "center", marginBottom: 20,
            border: quizAnswered ? `2px solid ${quizAnswered === "correct" ? "#10b981" : "#f43f5e"}` : "2px solid #334155"
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#e2e8f0", marginBottom: 8 }}>{q.notation}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{q.example}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[{ label: "VECTOR →", val: true, color: "#6366f1" }, { label: "SCALAR", val: false, color: "#10b981" }].map(({ label, val, color }) => {
              const chosen = quizAnswered && val === q.isVector;
              const wrong = quizAnswered && val !== q.isVector && val === (quizAnswered === "wrong" ? !q.isVector : null);
              return (
                <button key={label} onClick={() => answerQuiz(val)}
                  style={{
                    background: chosen ? (quizAnswered === "correct" ? "#0d2a1e" : (val === q.isVector ? "#0d2a1e" : "#2a0d0d")) : "#1e293b",
                    border: `2px solid ${chosen ? color : "#334155"}`,
                    borderRadius: 10, padding: 16,
                    fontSize: 15, fontWeight: 700,
                    color: chosen ? color : "#64748b",
                    cursor: quizAnswered ? "default" : "pointer"
                  }}>{label}</button>
              );
            })}
          </div>

          {quizAnswered && (
            <>
              <div style={{
                background: quizAnswered === "correct" ? "#0d2a1e" : "#2a0d0d",
                borderRadius: 10, padding: "14px 16px", marginBottom: 16,
                borderLeft: `3px solid ${quizAnswered === "correct" ? "#10b981" : "#f43f5e"}`
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: quizAnswered === "correct" ? "#34d399" : "#f87171", marginBottom: 4 }}>
                  {quizAnswered === "correct" ? "✓ Correct" : `✗ This is a ${q.isVector ? "vector" : "scalar"}`}
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{q.description}</div>
                {q.special && <div style={{ marginTop: 6, fontSize: 12, color: "#f59e0b" }}>Note: {q.special}</div>}
              </div>
              <button onClick={nextQuiz} style={{
                width: "100%", background: "#6366f1", color: "#fff",
                border: "none", borderRadius: 10, padding: 14,
                fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>
                {quizIdx + 1 >= FORMS.length ? "Finish →" : "Next →"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 5 · EVERY FORM A VECTOR WEARS</span>
        <button onClick={() => { setQuizMode(true); setQuizIdx(0); setQuizAnswered(null); setQuizScore(0); setQuizHistory([]); }}
          style={{
            background: "#1e293b", color: "#818cf8", border: "1px solid #6366f1",
            borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer"
          }}>
          Quiz Mode →
        </button>
      </div>

      <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {FORMS.map((f, i) => (
          <div key={i}
            onClick={() => setSelected(selected === i ? null : i)}
            style={{
              background: selected === i ? "#1a1a3e" : "#1e293b",
              borderRadius: 10, padding: "14px 16px",
              border: `1px solid ${selected === i ? "#6366f1" : "#334155"}`,
              cursor: "pointer", transition: "all 0.2s"
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: f.color, minWidth: 80 }}>{f.notation}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{f.example}</div>
                </div>
              </div>
              <span style={{
                background: f.isVector ? "#1a1a3e" : "#0d2a1e",
                color: f.isVector ? "#818cf8" : "#34d399",
                borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700
              }}>
                {f.isVector ? "VECTOR" : "SCALAR"}
                {f.special && ` · ${f.special}`}
              </span>
            </div>

            {selected === i && (
              <div style={{
                marginTop: 12, paddingTop: 12, borderTop: "1px solid #334155",
                fontSize: 13, color: "#94a3b8", lineHeight: 1.7
              }}>
                {f.description}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 16px", fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
        Click any row to expand. When you can read all 8 forms without thinking, you're ready for any textbook.
      </div>
    </div>
  );
}
