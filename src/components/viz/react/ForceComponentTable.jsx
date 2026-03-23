// ForceComponentTable.jsx — L9 Pillar 4
import { useState } from "react";

export default function ForceComponentTable({ params = {} }) {
  const [forces, setForces] = useState([
    { name: "F₁", mag: 50, angle: 0 },
    { name: "F₂", mag: 70, angle: 130 },
    { name: "F₃", mag: 40, angle: 250 },
  ]);
  const [mass, setMass] = useState(5);

  function update(i, field, val) { setForces(f => { const n = [...f]; n[i] = { ...n[i], [field]: val }; return n; }); }
  function addRow() { if (forces.length < 5) setForces(f => [...f, { name: `F${f.length + 1}`, mag: 20, angle: 0 }]); }

  const rows = forces.map(f => ({ ...f, fx: f.mag * Math.cos(f.angle * Math.PI / 180), fy: f.mag * Math.sin(f.angle * Math.PI / 180) }));
  const Rx = rows.reduce((s, r) => s + r.fx, 0), Ry = rows.reduce((s, r) => s + r.fy, 0);
  const Fnet = Math.sqrt(Rx ** 2 + Ry ** 2), theta = Math.atan2(Ry, Rx) * 180 / Math.PI;
  const ax = Rx / mass, ay = Ry / mass, aMag = Fnet / mass;
  const equilibrium = Fnet < 0.5;

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · FORCE COMPONENT TABLE</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {equilibrium && <span style={{ background: "#0d2a1e", color: "#34d399", border: "1px solid #10b981", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⚖ Equilibrium</span>}
          {forces.length < 5 && <button onClick={addRow} style={{ background: "#1e293b", color: "#10b981", border: "1px solid #10b981", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Row</button>}
        </div>
      </div>
      <div style={{ padding: "12px 20px 0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr>{["Force", "|F| (N)", "θ (°)", "Fₓ = |F|cosθ", "Fᵧ = |F|sinθ"].map(h => (
            <th key={h} style={{ padding: "5px 8px", color: "#64748b", fontSize: 10, fontWeight: 600, textAlign: "center", borderBottom: "1px solid #334155" }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: "6px 8px", textAlign: "center" }}>
                  <input value={r.name} onChange={e => update(i, "name", e.target.value)} style={{ width: 36, background: "#1e293b", border: "1px solid #334155", borderRadius: 4, color: "#e2e8f0", padding: "2px 4px", fontSize: 12, textAlign: "center" }} />
                </td>
                <td style={{ padding: "6px 4px" }}>
                  <input type="number" value={r.mag} step="1" min="0" onChange={e => update(i, "mag", parseFloat(e.target.value) || 0)} style={{ width: 52, background: "#1e293b", border: "1px solid #334155", borderRadius: 4, color: "#e2e8f0", padding: "2px 5px", fontSize: 12, textAlign: "center" }} />
                </td>
                <td style={{ padding: "6px 4px" }}>
                  <input type="number" value={r.angle} step="1" onChange={e => update(i, "angle", parseFloat(e.target.value) || 0)} style={{ width: 56, background: "#1e293b", border: "1px solid #334155", borderRadius: 4, color: "#e2e8f0", padding: "2px 5px", fontSize: 12, textAlign: "center" }} />
                </td>
                <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#f59e0b", fontSize: 12 }}>{r.fx.toFixed(2)}</td>
                <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#10b981", fontSize: 12 }}>{r.fy.toFixed(2)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid #334155" }}>
              <td colSpan={3} style={{ padding: "8px 8px", fontWeight: 700, color: "#e2e8f0", fontSize: 12 }}>F⃗net</td>
              <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#f59e0b", fontWeight: 700, fontSize: 12 }}>{Rx.toFixed(2)}</td>
              <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Fira Code',monospace", color: "#10b981", fontWeight: 700, fontSize: 12 }}>{Ry.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 60px", gap: 8, marginTop: 10 }}>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 12px" }}><div style={{ fontSize: 10, color: "#64748b" }}>|F⃗net|</div><div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0" }}>{Fnet.toFixed(2)} N</div></div>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 12px" }}><div style={{ fontSize: 10, color: "#64748b" }}>θ</div><div style={{ fontSize: 15, fontWeight: 800, color: "#818cf8" }}>{theta.toFixed(1)}°</div></div>
          <div style={{ background: equilibrium ? "#0d2a1e" : "#1e293b", borderRadius: 8, padding: "8px 12px" }}><div style={{ fontSize: 10, color: "#64748b" }}>|a| = F/m</div><div style={{ fontSize: 15, fontWeight: 800, color: equilibrium ? "#34d399" : "#e2e8f0" }}>{aMag.toFixed(3)} m/s²</div></div>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>m (kg)</div>
            <input type="number" value={mass} step="1" min="0.1" onChange={e => setMass(parseFloat(e.target.value) || 1)} style={{ width: "100%", background: "transparent", border: "none", color: "#e2e8f0", fontSize: 14, fontWeight: 700 }} />
          </div>
        </div>
      </div>
      <div style={{ padding: "10px 20px 16px", fontSize: 12, color: "#475569" }}>Edit any force. The table recalculates instantly. Equilibrium badge appears when |F⃗net| &lt; 0.5 N.</div>
    </div>
  );
}
