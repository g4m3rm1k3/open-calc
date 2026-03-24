// FreeFallExplorer.jsx — Ch2 L12-18 Pillar 4
import { useState } from "react";

const G = 9.8;

export default function FreeFallExplorer({ params = {} }) {
  const [convention, setConvention] = useState("up"); // "up" = up positive, "down" = down positive
  const [v0, setV0] = useState(20);
  const [problem, setProblem] = useState("maxHeight"); // maxHeight | timeUp | landing | velocity

  const sign = convention === "up" ? 1 : -1;
  const g = convention === "up" ? -G : G;

  const tPeak = Math.abs(v0) / G;
  const hMax = v0 * v0 / (2 * G);
  const tTotal = 2 * tPeak;

  const PROBLEMS = {
    maxHeight: {
      label: "Max height",
      steps: [
        { label: "At peak, v = 0", eq: `v = 0` },
        { label: "Use v² = v₀² + 2aΔx", eq: `0 = (${v0})² + 2(${g.toFixed(1)})h` },
        { label: "Solve for h", eq: `h = ${v0}² / (2×${G}) = ${hMax.toFixed(2)} m` },
      ],
      answer: `h_max = ${hMax.toFixed(2)} m`,
    },
    timeUp: {
      label: "Time to peak",
      steps: [
        { label: "At peak, v = 0", eq: `v = 0` },
        { label: "Use v = v₀ + at", eq: `0 = ${v0} + (${g.toFixed(1)})t` },
        { label: "Solve for t", eq: `t = ${v0} / ${G} = ${tPeak.toFixed(3)} s` },
      ],
      answer: `t_peak = ${tPeak.toFixed(3)} s`,
    },
    landing: {
      label: "Total flight time",
      steps: [
        { label: "Returns to Δx = 0", eq: `Δx = 0` },
        { label: "Use Δx = v₀t + ½at²", eq: `0 = ${v0}t + ½(${g.toFixed(1)})t²` },
        { label: "Factor out t", eq: `t(${v0} + ½(${g.toFixed(1)})t) = 0` },
        { label: "Non-zero solution", eq: `t = 2×${v0}/${G} = ${tTotal.toFixed(3)} s` },
      ],
      answer: `t_total = ${tTotal.toFixed(3)} s`,
    },
    velocity: {
      label: "Speed on return",
      steps: [
        { label: "Use v² = v₀² + 2aΔx", eq: `v² = (${v0})² + 2(${g.toFixed(1)})(0)` },
        { label: "Simplify", eq: `v² = ${v0 * v0}` },
        { label: "Take root (falling = negative)", eq: `v = −${v0.toFixed(0)} m/s` },
      ],
      answer: `v_return = −${v0} m/s`,
    },
  };

  const P = PROBLEMS[problem];

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · FREE FALL EXPLORER</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["up", "down"].map(c => (
            <button key={c} onClick={() => setConvention(c)} style={{
              background: convention === c ? "#818cf8" : "#1e293b",
              color: convention === c ? "#0f172a" : "#64748b",
              border: `1px solid ${convention === c ? "#818cf8" : "#334155"}`,
              borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer"
            }}>{c === "up" ? "↑ up positive" : "↓ down positive"}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
          <span>v₀ (upward initial velocity)</span>
          <span style={{ color: "#818cf8", fontWeight: 700 }}>{v0} m/s</span>
        </div>
        <input type="range" min={5} max={40} step={1} value={v0} onChange={e => setV0(parseInt(e.target.value))} style={{ width: "100%", marginBottom: 14 }} />

        {/* Sign convention banner */}
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 14px", marginBottom: 12, display: "flex", gap: 16, fontSize: 12 }}>
          <span style={{ color: "#64748b" }}>Convention:</span>
          <span style={{ color: "#818cf8", fontWeight: 700 }}>v₀ = {convention === "up" ? "+" : "−"}{v0} m/s</span>
          <span style={{ color: "#f43f5e", fontWeight: 700 }}>a = {g.toFixed(1)} m/s²</span>
        </div>

        {/* Problem selector */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {Object.entries(PROBLEMS).map(([key, { label }]) => (
            <button key={key} onClick={() => setProblem(key)} style={{
              background: problem === key ? "#818cf8" : "#1e293b",
              color: problem === key ? "#0f172a" : "#64748b",
              border: `1px solid ${problem === key ? "#818cf8" : "#334155"}`,
              borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer"
            }}>{label}</button>
          ))}
        </div>

        {/* Step-by-step solution */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {P.steps.map(({ label, eq }, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", background: "#1e293b",
                color: "#818cf8", fontSize: 11, fontWeight: 700, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{label}</div>
                <div style={{ background: "#1e293b", borderRadius: 6, padding: "6px 12px", fontFamily: "'Fira Code',monospace", fontSize: 13, color: "#e2e8f0" }}>{eq}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#0d2a1e", borderRadius: 10, padding: "12px 16px", borderLeft: "3px solid #10b981" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Answer</div>
          <div style={{ fontFamily: "'Fira Code',monospace", fontSize: 16, fontWeight: 700, color: "#34d399" }}>{P.answer}</div>
        </div>
      </div>
      <div style={{ padding: "12px 20px 16px", fontSize: 12, color: "#475569" }}>
        Toggle sign convention — the numbers change but the physics is identical. Always define your positive direction before writing equations.
      </div>
    </div>
  );
}
