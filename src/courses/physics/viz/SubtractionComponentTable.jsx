// SubtractionComponentTable.jsx — L8 Pillar 4
import { useState } from "react";

export default function SubtractionComponentTable({ params = {} }) {
  const [mode, setMode] = useState("subtract"); // add | subtract
  const [rows, setRows] = useState([
    { label: "A⃗", mag: 60, angle: 20, color: "#6366f1" },
    { label: "B⃗", mag: 45, angle: 110, color: "#f59e0b" },
  ]);

  function update(i, field, val) {
    setRows(r => { const n = [...r]; n[i] = { ...n[i], [field]: val }; return n; });
  }

  const computed = rows.map(r => ({
    ...r,
    vx: r.mag * Math.cos(r.angle * Math.PI / 180),
    vy: r.mag * Math.sin(r.angle * Math.PI / 180),
  }));

  const sign = mode === "subtract" ? -1 : 1;
  const Rx = computed[0].vx + sign * computed[1].vx;
  const Ry = computed[0].vy + sign * computed[1].vy;
  const magR = Math.sqrt(Rx ** 2 + Ry ** 2);
  const thetaR = Math.atan2(Ry, Rx) * 180 / Math.PI;

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · ADD vs SUBTRACT TOGGLE</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["add", "subtract"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              background: mode === m ? (m === "subtract" ? "#f43f5e" : "#10b981") : "#1e293b",
              color: mode === m ? "#fff" : "#64748b",
              border: `1.5px solid ${m === "subtract" ? "#f43f5e" : "#10b981"}`,
              borderRadius: 8, padding: "4px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer"
            }}>A⃗ {m === "add" ? "+" : "−"} B⃗</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 20px 0", marginBottom: 4 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
          {mode === "subtract" ? "B⃗ row is negated (signs flipped on Bₓ and Bᵧ)" : "Normal addition — no sign change"}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>{["Vector", "|v|", "θ (°)", "vₓ", "vᵧ"].map(h => (
              <th key={h} style={{ padding: "5px 8px", color: "#64748b", fontSize: 11, fontWeight: 600, textAlign: "center", borderBottom: "1px solid #334155" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {computed.map((r, i) => {
              const effectiveVx = i === 1 ? sign * r.vx : r.vx;
              const effectiveVy = i === 1 ? sign * r.vy : r.vy;
              const isNegated = i === 1 && mode === "subtract";
              return (
                <tr key={i} style={{ background: isNegated ? "#1a0d0d" : "transparent" }}>
                  <td style={{ padding: "8px 8px", textAlign: "center" }}>
                    <span style={{ color: r.color, fontWeight: 800, fontSize: 14 }}>{isNegated ? `−${r.label}` : r.label}</span>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <input type="number" value={r.mag} step="1" min="0" onChange={e => update(i, "mag", parseFloat(e.target.value) || 0)}
                      style={{ width: 52, background: "#1e293b", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "3px 5px", fontSize: 12, textAlign: "center" }} />
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <input type="number" value={r.angle} step="1" onChange={e => update(i, "angle", parseFloat(e.target.value) || 0)}
                      style={{ width: 56, background: "#1e293b", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "3px 5px", fontSize: 12, textAlign: "center" }} />
                  </td>
                  <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: isNegated ? "#f87171" : "#f59e0b", fontSize: 12 }}>
                    {isNegated && "−"}{Math.abs(effectiveVx).toFixed(2)}
                  </td>
                  <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: isNegated ? "#f87171" : "#10b981", fontSize: 12 }}>
                    {isNegated && "−"}{Math.abs(effectiveVy).toFixed(2)}
                  </td>
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid #334155" }}>
              <td style={{ padding: "10px 8px", fontWeight: 700, color: "#e2e8f0", textAlign: "center" }}>R⃗</td>
              <td style={{ padding: "10px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#818cf8", fontSize: 12 }}>{magR.toFixed(2)}</td>
              <td style={{ padding: "10px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#818cf8", fontSize: 12 }}>{thetaR.toFixed(1)}°</td>
              <td style={{ padding: "10px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#f59e0b", fontWeight: 700, fontSize: 12 }}>{Rx.toFixed(2)}</td>
              <td style={{ padding: "10px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#10b981", fontWeight: 700, fontSize: 12 }}>{Ry.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ padding: "12px 20px 16px", fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
        Toggle between A⃗+B⃗ and A⃗−B⃗. Only the sign on Bₓ and Bᵧ changes — that is the entire difference between addition and subtraction.
      </div>
    </div>
  );
}
