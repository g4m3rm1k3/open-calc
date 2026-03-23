import { useState } from "react";

const CONVENTIONS = [
  {
    name: "Standard — angle from +x, counterclockwise",
    given: "|A⃗|, θ (from +x CCW)",
    horizontal: "|A⃗| cosθ",
    vertical: "|A⃗| sinθ",
    notes: "The default. No conversion needed. All textbook formulas assume this.",
    color: "#6366f1",
    example: { mag: 10, angle: 30, Ax: "8.66", Ay: "5.00" },
  },
  {
    name: "Angle from +y axis (from vertical / from north)",
    given: "|A⃗|, φ (from +y axis)",
    horizontal: "|A⃗| sinφ",
    vertical: "|A⃗| cosφ",
    notes: "sin and cos swap because the reference axis rotated 90°. Common in navigation.",
    color: "#f59e0b",
    example: { mag: 10, angle: 30, Ax: "5.00 (=10 sin30°)", Ay: "8.66 (=10 cos30°)" },
    convertNote: "θ_standard = 90° − φ",
  },
  {
    name: "Angle below the +x axis",
    given: "|A⃗|, α below +x",
    horizontal: "|A⃗| cosα",
    vertical: "−|A⃗| sinα",
    notes: "The y-component is negative because the vector points downward. Don't forget the sign.",
    color: "#f43f5e",
    example: { mag: 10, angle: 30, Ax: "8.66", Ay: "−5.00 (negative!)" },
    convertNote: "θ_standard = −α",
  },
  {
    name: "Given two components directly",
    given: "Aₓ, Aᵧ",
    horizontal: "Aₓ (already known)",
    vertical: "Aᵧ (already known)",
    notes: "Nothing to compute for components. Use √(Aₓ²+Aᵧ²) for magnitude and atan2(Aᵧ,Aₓ) for angle.",
    color: "#10b981",
    example: { mag: "10", angle: "36.9°", Ax: "8", Ay: "6" },
  },
  {
    name: "Compass bearing N α° E (east of north)",
    given: "|A⃗|, α (east of due north)",
    horizontal: "|A⃗| sinα   (east component)",
    vertical: "|A⃗| cosα   (north component)",
    notes: "Bearing starts from north. East uses sin; north uses cos. Opposite to the standard convention.",
    color: "#0ea5e9",
    example: { mag: 200, angle: 30, Ax: "100 east", Ay: "173 north" },
    convertNote: "θ_standard = 90° − α",
  },
];

const RECALL_QS = [
  { q: "For standard angle θ from +x, what gives the x-component?", a: "|A⃗| cosθ" },
  { q: "For standard angle θ from +x, what gives the y-component?", a: "|A⃗| sinθ" },
  { q: "An angle is given as 40° from the vertical. What is the standard angle?", a: "90° − 40° = 50°" },
  { q: "A vector points 25° below the +x axis. What is vᵧ?", a: "−|v⃗| sin25°  (negative because it points down)" },
  { q: "A ship has bearing N 45° E at 100 km/h. What are east and north components?", a: "east = 100 sin45° = 70.7, north = 100 cos45° = 70.7" },
  { q: "Given Aₓ = −3, Aᵧ = 4. What is |A⃗|?", a: "√(9+16) = 5" },
  { q: "Given Aₓ = −3, Aᵧ = 4. What is θ?", a: "atan2(4,−3) ≈ 127°  (Quadrant II, so add 180° to reference 53.1°)" },
];

export default function ComponentFormRecogniser({ params = {} }) {
  const [mode, setMode] = useState("table");
  const [expanded, setExpanded] = useState(null);
  const [recallIdx, setRecallIdx] = useState(0);
  const [recallShown, setRecallShown] = useState(false);
  const [recallScore, setRecallScore] = useState(0);
  const [recallDone, setRecallDone] = useState(false);
  const [recallHistory, setRecallHistory] = useState([]);

  function nextRecall(knew) {
    setRecallHistory(h => [...h, { ...RECALL_QS[recallIdx], knew }]);
    if (recallIdx + 1 >= RECALL_QS.length) setRecallDone(true);
    else { setRecallIdx(n => n + 1); setRecallShown(false); }
    if (knew) setRecallScore(s => s + 1);
  }

  function resetRecall() {
    setMode("table"); setRecallIdx(0); setRecallShown(false);
    setRecallScore(0); setRecallDone(false); setRecallHistory([]);
  }

  if (mode === "recall" && recallDone) {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700, marginBottom: 16 }}>PILLAR 5 · RECALL RESULTS</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#e2e8f0", marginBottom: 8 }}>{recallScore} / {RECALL_QS.length}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {recallHistory.map((h, i) => (
            <div key={i} style={{
              background: h.knew ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "10px 14px",
              borderLeft: `2px solid ${h.knew ? "#10b981" : "#f43f5e"}`
            }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{h.q}</div>
              <div style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color: "#e2e8f0" }}>{h.a}</div>
            </div>
          ))}
        </div>
        <button onClick={resetRecall} style={{
          width: "100%", background: "#10b981", color: "#0f172a",
          border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer"
        }}>Back to Reference</button>
      </div>
    );
  }

  if (mode === "recall") {
    const q = RECALL_QS[recallIdx];
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 5 · RECALL DRILL</span>
          <span style={{ fontSize: 12, color: "#475569" }}>{recallIdx + 1} / {RECALL_QS.length}</span>
        </div>
        <div style={{ height: 3, background: "#1e293b" }}>
          <div style={{ height: "100%", width: `${(recallIdx / RECALL_QS.length) * 100}%`, background: "#10b981", transition: "width 0.3s" }} />
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ background: "#1e293b", borderRadius: 12, padding: "24px 20px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.5 }}>{q.q}</div>
          </div>
          {!recallShown ? (
            <button onClick={() => setRecallShown(true)} style={{
              width: "100%", background: "#1e293b", color: "#94a3b8",
              border: "2px solid #334155", borderRadius: 10, padding: 12,
              fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 16
            }}>Show Answer</button>
          ) : (
            <>
              <div style={{
                background: "#0c1a2e", borderLeft: "3px solid #10b981",
                borderRadius: 10, padding: "14px 18px", marginBottom: 14,
                fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#6ee7b7"
              }}>{q.a}</div>
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

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 5 · EVERY ANGLE CONVENTION</span>
        <button onClick={() => setMode("recall")} style={{
          background: "#1e293b", color: "#10b981",
          border: "1px solid #10b981", borderRadius: 8,
          padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer"
        }}>Recall Drill →</button>
      </div>

      <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {CONVENTIONS.map((c, i) => (
          <div key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              background: expanded === i ? "#0c1a2e" : "#1e293b",
              borderRadius: 10, padding: "12px 16px",
              border: `1px solid ${expanded === i ? c.color : "#334155"}`,
              cursor: "pointer", transition: "all 0.2s"
            }}>
            {/* Row header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Given: {c.given}</div>
              </div>
              <span style={{ color: "#475569", fontSize: 14 }}>{expanded === i ? "▲" : "▼"}</span>
            </div>

            {/* Expanded */}
            {expanded === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #334155" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 12px", borderLeft: `3px solid #f59e0b` }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Horizontal (x)</div>
                    <div style={{ fontSize: 14, fontFamily: "'Fira Code', monospace", color: "#fcd34d" }}>{c.horizontal}</div>
                  </div>
                  <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 12px", borderLeft: `3px solid #10b981` }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Vertical (y)</div>
                    <div style={{ fontSize: 14, fontFamily: "'Fira Code', monospace", color: "#6ee7b7" }}>{c.vertical}</div>
                  </div>
                </div>
                {c.convertNote && (
                  <div style={{ background: "#1a1500", borderRadius: 6, padding: "7px 10px", marginBottom: 8, fontSize: 12, color: "#fcd34d" }}>
                    💡 Convert: {c.convertNote}
                  </div>
                )}
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 8 }}>{c.notes}</div>
                <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                  <span style={{ color: "#64748b" }}>Example: </span>
                  <span style={{ color: "#e2e8f0" }}>
                    |A⃗|={c.example.mag}, θ={c.example.angle}°
                    {" → "}Aₓ = {c.example.Ax}, Aᵧ = {c.example.Ay}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 16px", fontSize: 12, color: "#475569" }}>
        Click any convention to expand. Close the panel and try to recall all 5 from memory.
      </div>
    </div>
  );
}
