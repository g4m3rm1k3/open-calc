import { useState } from "react";

export default function NumericalAdditionTable({ params = {} }) {
  const [rows, setRows] = useState([
    { label: "A⃗", mag: 40, angle: 30, color: "#6366f1" },
    { label: "B⃗", mag: 25, angle: 145, color: "#f59e0b" },
  ]);

  function update(i, field, val) {
    setRows(r => { const n = [...r]; n[i] = { ...n[i], [field]: val }; return n; });
  }

  function addRow() {
    const labels = ["C⃗","D⃗","E⃗","F⃗"];
    const colors = ["#10b981","#f43f5e","#0ea5e9","#818cf8"];
    const idx = rows.length - 2;
    if (rows.length >= 5) return;
    setRows(r => [...r, { label: labels[idx] || "V⃗", mag: 10, angle: 0, color: colors[idx] || "#475569" }]);
  }

  // Compute
  const computed = rows.map(r => ({
    ...r,
    vx: r.mag * Math.cos(r.angle * Math.PI / 180),
    vy: r.mag * Math.sin(r.angle * Math.PI / 180),
  }));
  const Rx = computed.reduce((s, r) => s + r.vx, 0);
  const Ry = computed.reduce((s, r) => s + r.vy, 0);
  const magR = Math.sqrt(Rx ** 2 + Ry ** 2);
  const thetaR = Math.atan2(Ry, Rx) * 180 / Math.PI;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · LIVE COMPONENT TABLE</span>
        {rows.length < 5 && (
          <button onClick={addRow} style={{ background: "#1e293b", color: "#10b981", border: "1px solid #10b981", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add vector</button>
        )}
      </div>

      <div style={{ padding: "16px 20px 20px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["Vector", "|v|", "θ (°)", "vₓ = |v|cosθ", "vᵧ = |v|sinθ"].map(h => (
                <th key={h} style={{ padding: "6px 10px", color: "#64748b", fontWeight: 600, fontSize: 11, textAlign: "center", borderBottom: "1px solid #334155" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {computed.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                  <span style={{ color: r.color, fontWeight: 800, fontSize: 15 }}>{r.label}</span>
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <input type="number" value={r.mag} step="1" min="0"
                    onChange={e => update(i, "mag", parseFloat(e.target.value) || 0)}
                    style={{ width: 56, background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", padding: "4px 6px", fontSize: 13, textAlign: "center" }} />
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <input type="number" value={r.angle} step="1"
                    onChange={e => update(i, "angle", parseFloat(e.target.value) || 0)}
                    style={{ width: 60, background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", padding: "4px 6px", fontSize: 13, textAlign: "center" }} />
                </td>
                <td style={{ padding: "8px 10px", textAlign: "center", fontFamily: "'Fira Code', monospace", color: "#f59e0b" }}>{r.vx.toFixed(3)}</td>
                <td style={{ padding: "8px 10px", textAlign: "center", fontFamily: "'Fira Code', monospace", color: "#10b981" }}>{r.vy.toFixed(3)}</td>
              </tr>
            ))}
            {/* Sum row */}
            <tr style={{ borderTop: "2px solid #334155" }}>
              <td style={{ padding: "10px", fontWeight: 700, color: "#e2e8f0", textAlign: "center" }}>R⃗</td>
              <td style={{ padding: "10px", textAlign: "center", fontFamily: "'Fira Code', monospace", color: "#818cf8" }}>{magR.toFixed(3)}</td>
              <td style={{ padding: "10px", textAlign: "center", fontFamily: "'Fira Code', monospace", color: "#818cf8" }}>{thetaR.toFixed(1)}°</td>
              <td style={{ padding: "10px", textAlign: "center", fontFamily: "'Fira Code', monospace", color: "#f59e0b", fontWeight: 700 }}>{Rx.toFixed(3)}</td>
              <td style={{ padding: "10px", textAlign: "center", fontFamily: "'Fira Code', monospace", color: "#10b981", fontWeight: 700 }}>{Ry.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>

        {/* Quadrant indicator */}
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          {[
            { label: "|R⃗|", val: magR.toFixed(4), color: "#818cf8" },
            { label: "θ", val: thetaR.toFixed(2) + "°", color: "#818cf8" },
            { label: "Quadrant", val: Rx >= 0 && Ry >= 0 ? "I" : Rx < 0 && Ry >= 0 ? "II" : Rx < 0 && Ry < 0 ? "III" : "IV", color: "#10b981" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 14px", flex: 1 }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "#475569" }}>
          Edit any magnitude or angle. The table recalculates instantly. Add up to 5 vectors.
        </div>
      </div>
    </div>
  );
}
