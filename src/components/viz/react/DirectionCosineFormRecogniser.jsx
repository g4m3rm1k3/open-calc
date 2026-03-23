// DirectionCosineFormRecogniser.jsx — Pillar 5
import { useState } from "react";

const FORMS = [
  {
    label: "Definition",
    formula: "cosα = Aₓ/|A⃗|,   cosβ = Aᵧ/|A⃗|,   cosγ = Az/|A⃗|",
    note: "α is the angle from the +x axis, β from +y, γ from +z. Each cosine is a component divided by the magnitude.",
    color: "#818cf8",
  },
  {
    label: "Identity (always true)",
    formula: "cos²α + cos²β + cos²γ = 1",
    note: "Follows directly from the 3D Pythagorean theorem. If three numbers satisfy this, they can be direction cosines of some vector.",
    color: "#10b981",
  },
  {
    label: "Unit vector from direction cosines",
    formula: "Â = cosα î + cosβ ĵ + cosγ k̂",
    note: "The direction cosines are exactly the components of the unit vector in that direction.",
    color: "#6366f1",
  },
  {
    label: "Recover direction cosines from components",
    formula: "|A⃗| = √(Aₓ²+Aᵧ²+Az²),  then divide each component",
    note: "Step 1: find |A⃗|. Step 2: cosα=Aₓ/|A⃗|, cosβ=Aᵧ/|A⃗|, cosγ=Az/|A⃗|.",
    color: "#f59e0b",
  },
  {
    label: "Angles from direction cosines",
    formula: "α = arccos(Aₓ/|A⃗|),   β = arccos(Aᵧ/|A⃗|),   γ = arccos(Az/|A⃗|)",
    note: "arccos returns angles in [0°, 180°]. Direction cosines specify orientation unambiguously in 3D.",
    color: "#0ea5e9",
  },
  {
    label: "Special cases",
    formula: "Along +x: (1,0,0). Along +y: (0,1,0). Along +z: (0,0,1)",
    note: "Vectors along the axes have one direction cosine equal to ±1 and the others equal to 0.",
    color: "#f43f5e",
  },
  {
    label: "Alternative notation",
    formula: "(l, m, n) = (cosα, cosβ, cosγ),   l²+m²+n² = 1",
    note: "Engineering texts often use l, m, n for the three direction cosines. Same concept.",
    color: "#64748b",
  },
];

const RECALL = [
  { q: "Formula for cosα?", a: "cosα = Aₓ / |A⃗|  (x-component divided by magnitude)" },
  { q: "The direction cosine identity?", a: "cos²α + cos²β + cos²γ = 1  (always)" },
  { q: "A⃗ = (2,3,6). Find all three direction cosines.", a: "|A⃗|=7. cosα=2/7, cosβ=3/7, cosγ=6/7" },
  { q: "What is the unit vector in the direction of A⃗?", a: "Â = cosα î + cosβ ĵ + cosγ k̂  (direction cosines are its components)" },
  { q: "A vector has cosα=0.5, cosβ=0.5. What is cosγ?", a: "cos²γ = 1−0.25−0.25 = 0.5, so cosγ = √0.5 ≈ 0.707, γ ≈ 45°" },
];

export default function DirectionCosineFormRecogniser({ params = {} }) {
  const [mode, setMode] = useState("table");
  const [expanded, setExpanded] = useState(null);
  const [ri, setRi] = useState(0);
  const [shown, setShown] = useState(false);
  const [rs, setRs] = useState(0);
  const [rdone, setRdone] = useState(false);
  const [rh, setRh] = useState([]);
  const C = "#818cf8";

  function nextR(knew) {
    setRh(h => [...h, { ...RECALL[ri], knew }]);
    if (knew) setRs(s => s + 1);
    if (ri + 1 >= RECALL.length) setRdone(true);
    else { setRi(n => n + 1); setShown(false); }
  }

  if (mode === "recall" && rdone) return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 13, color: C, fontWeight: 700, marginBottom: 12 }}>PILLAR 5 RECALL RESULTS</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#e2e8f0", marginBottom: 16 }}>{rs}/{RECALL.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {rh.map((h, i) => (
          <div key={i} style={{ background: h.knew ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "10px 14px", borderLeft: `2px solid ${h.knew ? "#10b981" : "#f43f5e"}` }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{h.q}</div>
            <div style={{ fontSize: 13, fontFamily: "'Fira Code',monospace", color: "#e2e8f0" }}>{h.a}</div>
          </div>
        ))}
      </div>
      <button onClick={() => { setMode("table"); setRi(0); setShown(false); setRs(0); setRdone(false); setRh([]); }}
        style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Back</button>
    </div>
  );

  if (mode === "recall") {
    const q = RECALL[ri];
    return (
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: C, fontWeight: 700 }}>PILLAR 5 RECALL</span>
          <span style={{ fontSize: 12, color: "#475569" }}>{ri + 1}/{RECALL.length}</span>
        </div>
        <div style={{ height: 3, background: "#1e293b" }}>
          <div style={{ height: "100%", width: `${(ri / RECALL.length) * 100}%`, background: C, transition: "width 0.3s" }} />
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ background: "#1e293b", borderRadius: 12, padding: "22px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{q.q}</div>
          </div>
          {!shown ? (
            <button onClick={() => setShown(true)} style={{ width: "100%", background: "#1e293b", color: "#94a3b8", border: "2px solid #334155", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Show Answer
            </button>
          ) : (
            <>
              <div style={{ background: "#0c1a2e", borderLeft: `3px solid ${C}`, borderRadius: 10, padding: "14px 18px", marginBottom: 12, fontFamily: "'Fira Code',monospace", fontSize: 14, color: "#c4b5fd" }}>{q.a}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => nextR(false)} style={{ background: "#2a0d0d", color: "#f87171", border: "2px solid #f43f5e", borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✗ Didn't know</button>
                <button onClick={() => nextR(true)} style={{ background: "#0d2a1e", color: "#34d399", border: "2px solid #10b981", borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ Knew it</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: C, fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 5 · DIRECTION COSINE REFERENCE</span>
        <button onClick={() => setMode("recall")} style={{ background: "#1e293b", color: "#c4b5fd", border: `1px solid ${C}`, borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Recall →</button>
      </div>
      <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {FORMS.map((f, i) => (
          <div key={i} onClick={() => setExpanded(expanded === i ? null : i)}
            style={{ background: expanded === i ? "#0c1a2e" : "#1e293b", borderRadius: 10, padding: "12px 16px", border: `1px solid ${expanded === i ? f.color : "#334155"}`, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.label}</div>
                <div style={{ fontSize: 11, fontFamily: "'Fira Code',monospace", color: "#64748b", marginTop: 2 }}>{f.formula}</div>
              </div>
              <span style={{ color: "#475569", fontSize: 12 }}>{expanded === i ? "▲" : "▼"}</span>
            </div>
            {expanded === i && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #334155", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{f.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
