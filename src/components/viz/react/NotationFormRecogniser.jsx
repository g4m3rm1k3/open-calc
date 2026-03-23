import { useState } from "react";

// Reuses similar structure to VectorFormRecogniser but focused on notation fluency
const FORMS = [
  { notation: "A⃗", meaning: "Vector A — handwritten / intro texts", type: "vector", color: "#6366f1", example: "F⃗ = 10 N" },
  { notation: "𝐀", meaning: "Vector A — printed / linear algebra texts", type: "vector", color: "#6366f1", example: "𝐯 = 3 m/s" },
  { notation: "(Aₓ, Aᵧ)", meaning: "Component form — 2D ordered pair", type: "vector", color: "#6366f1", example: "(3, 4)" },
  { notation: "Aₓî + Aᵧĵ + A_z k̂", meaning: "Unit-vector form — 3D", type: "vector", color: "#6366f1", example: "2î − 6ĵ + 3k̂" },
  { notation: "|A⃗| ∠ θ", meaning: "Magnitude-angle (polar) form", type: "vector", color: "#6366f1", example: "5 ∠ 37°" },
  { notation: "Â = A⃗/|A⃗|", meaning: "Unit vector — direction only, |Â| = 1", type: "special", color: "#f59e0b", example: "(0.6, 0.8)" },
  { notation: "|A⃗| or A", meaning: "Magnitude of A — scalar (≥ 0)", type: "scalar", color: "#10b981", example: "|F⃗| = 10" },
  { notation: "Aₓ (one component)", meaning: "Single component — scalar (signed)", type: "scalar", color: "#10b981", example: "vₓ = −3 m/s" },
];

const RECALL = [
  { prompt: "How do you write 'vector A' in handwriting?", answer: "A⃗" },
  { prompt: "What does |A⃗| return?", answer: "A scalar — the magnitude (length). Always ≥ 0." },
  { prompt: "What does the hat mean in Â?", answer: "Unit vector: same direction as A⃗, but magnitude = 1 exactly." },
  { prompt: "How do you find Â from A⃗?", answer: "Â = A⃗ / |A⃗|  (divide every component by the magnitude)" },
  { prompt: "What is the 3D unit-vector form?", answer: "A⃗ = Aₓî + Aᵧĵ + A_zk̂" },
  { prompt: "If A⃗ = (3, 4), what is |A⃗|?", answer: "5  (Pythagorean theorem: √(9+16) = 5)" },
  { prompt: "What's the difference between A⃗ and A (no arrow)?", answer: "A⃗ is the full vector. A (or |A⃗|) is the magnitude — a positive scalar." },
  { prompt: "Name three equivalent notations for the same vector.", answer: "A⃗ = 𝐀 = (Aₓ, Aᵧ) = Aₓî + Aᵧĵ = |A⃗| ∠ θ" },
];

export default function NotationFormRecogniser({ params = {} }) {
  const [mode, setMode] = useState("table"); // table | recall
  const [recallIdx, setRecallIdx] = useState(0);
  const [recallShown, setRecallShown] = useState(false);
  const [recallHistory, setRecallHistory] = useState([]);

  function nextRecall(knew) {
    setRecallHistory(h => [...h, { ...RECALL[recallIdx], knew }]);
    if (recallIdx + 1 >= RECALL.length) {
      setMode("results");
    } else {
      setRecallIdx(n => n + 1);
      setRecallShown(false);
    }
  }

  function resetRecall() {
    setMode("table");
    setRecallIdx(0);
    setRecallShown(false);
    setRecallHistory([]);
  }

  if (mode === "results") {
    const knew = recallHistory.filter(h => h.knew).length;
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>PILLAR 5 · RECALL RESULTS</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#e2e8f0", marginBottom: 6 }}>{knew} / {RECALL.length}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 20 }}>
          {knew === RECALL.length ? "Every notation internalised." : "Review the ones you missed, then try again."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {recallHistory.map((h, i) => (
            <div key={i} style={{
              background: h.knew ? "#0d2a1e" : "#2a0d0d",
              borderRadius: 8, padding: "10px 14px",
              borderLeft: `2px solid ${h.knew ? "#10b981" : "#f43f5e"}`
            }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>{h.prompt}</div>
              <div style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color: "#e2e8f0" }}>{h.answer}</div>
            </div>
          ))}
        </div>
        <button onClick={resetRecall} style={{
          width: "100%", background: "#818cf8", color: "#0f172a",
          border: "none", borderRadius: 10, padding: 12,
          fontSize: 14, fontWeight: 800, cursor: "pointer"
        }}>Back to Reference</button>
      </div>
    );
  }

  if (mode === "recall") {
    const q = RECALL[recallIdx];
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 5 · RECALL DRILL</span>
          <span style={{ fontSize: 12, color: "#475569" }}>{recallIdx + 1} / {RECALL.length}</span>
        </div>
        <div style={{ height: 3, background: "#1e293b" }}>
          <div style={{ height: "100%", width: `${(recallIdx / RECALL.length) * 100}%`, background: "#818cf8", transition: "width 0.3s" }} />
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ background: "#1e293b", borderRadius: 12, padding: "28px 20px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 10 }}>Recall from memory:</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.5 }}>{q.prompt}</div>
          </div>

          {!recallShown ? (
            <button onClick={() => setRecallShown(true)} style={{
              width: "100%", background: "#1e293b", color: "#94a3b8",
              border: "2px solid #334155", borderRadius: 10, padding: 14,
              fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 16
            }}>Reveal Answer</button>
          ) : (
            <>
              <div style={{
                background: "#0c1a2e", borderRadius: 10, padding: "14px 18px",
                borderLeft: "3px solid #818cf8", marginBottom: 16,
                fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#c7d2fe", lineHeight: 1.7
              }}>{q.answer}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => nextRecall(false)} style={{
                  background: "#2a0d0d", color: "#f87171", border: "2px solid #f43f5e",
                  borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer"
                }}>✗ Didn't know</button>
                <button onClick={() => nextRecall(true)} style={{
                  background: "#0d2a1e", color: "#34d399", border: "2px solid #10b981",
                  borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer"
                }}>✓ Knew it</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Table mode
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 5 · COMPLETE NOTATION REFERENCE</span>
        <button onClick={() => setMode("recall")} style={{
          background: "#1e293b", color: "#818cf8",
          border: "1px solid #6366f1", borderRadius: 8,
          padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer"
        }}>Recall Drill →</button>
      </div>

      <div style={{ padding: "16px 20px 20px" }}>
        {/* Type legend */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          {[
            { type: "vector", label: "Vector", color: "#6366f1", bg: "#1a1a3e" },
            { type: "scalar", label: "Scalar", color: "#10b981", bg: "#0d2a1e" },
            { type: "special", label: "Unit vector", color: "#f59e0b", bg: "#2a1a0e" },
          ].map(({ type, label, color, bg }) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FORMS.map((f, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "90px 1fr 80px",
              alignItems: "center", gap: 12,
              background: "#1e293b", borderRadius: 10, padding: "12px 16px",
              borderLeft: `3px solid ${f.color}`
            }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: f.color }}>{f.notation}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{f.meaning}</div>
                <div style={{ fontSize: 11, color: "#475569", fontFamily: "'Fira Code', monospace" }}>{f.example}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: f.type === "vector" ? "#818cf8" : f.type === "scalar" ? "#34d399" : "#fcd34d",
                textAlign: "right", letterSpacing: "0.05em"
              }}>
                {f.type.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 16px", fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
        Close this and try to write every notation from memory. Then use the Recall Drill to check.
      </div>
    </div>
  );
}
