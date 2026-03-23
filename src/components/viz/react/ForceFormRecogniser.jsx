import { useState } from "react";
const FORMS = [
  { label: "Newton's 2nd law (vector)", formula: "F⃗_net = Σᵢ F⃗ᵢ = ma⃗", note: "Both sides are vectors. Direction of acceleration = direction of net force.", color: "#10b981" },
  { label: "Component equations", formula: "ΣFₓ = maₓ   and   ΣFᵧ = maᵧ", note: "The two axes are independent. Solve each independently.", color: "#6366f1" },
  { label: "Net force components", formula: "F_net,x = Σ|Fᵢ|cosθᵢ,   F_net,y = Σ|Fᵢ|sinθᵢ", note: "DSMD: decompose every force, sum by axis.", color: "#f59e0b" },
  { label: "Magnitude and direction", formula: "|F⃗_net| = √(Fₓ²+Fᵧ²),   θ = atan2(Fᵧ,Fₓ)", note: "Steps 3 and 4 of DSMD. Same as any vector magnitude/direction.", color: "#818cf8" },
  { label: "Equilibrium", formula: "ΣFₓ = 0  AND  ΣFᵧ = 0  ⟺  a⃗ = 0⃗", note: "Must hold on BOTH axes simultaneously. One non-zero component → acceleration.", color: "#34d399" },
  { label: "Acceleration from net force", formula: "a⃗ = F⃗_net / m,   |a⃗| = |F⃗_net| / m", note: "Direction of a⃗ equals direction of F⃗_net. Divide magnitude by mass for scalar.", color: "#f43f5e" },
];
const RECALL = [
  { q: "Vector form of Newton's 2nd law?", a: "F⃗_net = Σ F⃗ᵢ = ma⃗" },
  { q: "Equilibrium condition in components?", a: "ΣFₓ = 0 AND ΣFᵧ = 0 — both must be zero simultaneously" },
  { q: "Forces 6N east and 8N north, mass 2kg. What is |a⃗|?", a: "|F_net|=√(36+64)=10N. |a|=10/2=5 m/s²" },
  { q: "Why can't you just add force magnitudes?", a: "Forces are vectors — direction matters. Only components along the same axis add directly." },
];
export default function ForceFormRecogniser({ params = {} }) {
  const [mode, setMode] = useState("table"); const [expanded, setExpanded] = useState(null);
  const [ri, setRi] = useState(0); const [shown, setShown] = useState(false);
  const [rs, setRs] = useState(0); const [rdone, setRdone] = useState(false); const [rh, setRh] = useState([]);
  function nextR(knew) { setRh(h => [...h, { ...RECALL[ri], knew }]); if (knew) setRs(s => s + 1); if (ri + 1 >= RECALL.length) setRdone(true); else { setRi(n => n + 1); setShown(false); } }
  const C = "#10b981";
  if (mode === "recall" && rdone) return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 13, color: C, fontWeight: 700, marginBottom: 12 }}>PILLAR 5 RECALL</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#e2e8f0", marginBottom: 16 }}>{rs}/{RECALL.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>{rh.map((h, i) => <div key={i} style={{ background: h.knew ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "10px 14px", borderLeft: `2px solid ${h.knew ? C : "#f43f5e"}` }}><div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{h.q}</div><div style={{ fontSize: 13, fontFamily: "'Fira Code',monospace", color: "#e2e8f0" }}>{h.a}</div></div>)}</div>
      <button onClick={() => { setMode("table"); setRi(0); setShown(false); setRs(0); setRdone(false); setRh([]); }} style={{ width: "100%", background: C, color: "#0f172a", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Back</button>
    </div>
  );
  if (mode === "recall") { const q = RECALL[ri]; return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 13, color: C, fontWeight: 700 }}>PILLAR 5 RECALL</span><span style={{ fontSize: 12, color: "#475569" }}>{ri + 1}/{RECALL.length}</span></div>
      <div style={{ height: 3, background: "#1e293b" }}><div style={{ height: "100%", width: `${(ri / RECALL.length) * 100}%`, background: C, transition: "width 0.3s" }} /></div>
      <div style={{ padding: 24 }}>
        <div style={{ background: "#1e293b", borderRadius: 12, padding: "22px", textAlign: "center", marginBottom: 20 }}><div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{q.q}</div></div>
        {!shown ? <button onClick={() => setShown(true)} style={{ width: "100%", background: "#1e293b", color: "#94a3b8", border: "2px solid #334155", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Show Answer</button>
          : <><div style={{ background: "#0c1a2e", borderLeft: `3px solid ${C}`, borderRadius: 10, padding: "14px 18px", marginBottom: 12, fontFamily: "'Fira Code',monospace", fontSize: 14, color: "#6ee7b7" }}>{q.a}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => nextR(false)} style={{ background: "#2a0d0d", color: "#f87171", border: "2px solid #f43f5e", borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✗ Didn't know</button>
              <button onClick={() => nextR(true)} style={{ background: "#0d2a1e", color: "#34d399", border: `2px solid ${C}`, borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ Knew it</button>
            </div></>}
      </div>
    </div>
  ); }
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: C, fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 5 · FORCE VECTOR REFERENCE</span>
        <button onClick={() => setMode("recall")} style={{ background: "#1e293b", color: "#6ee7b7", border: `1px solid ${C}`, borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Recall →</button>
      </div>
      <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {FORMS.map((f, i) => (
          <div key={i} onClick={() => setExpanded(expanded === i ? null : i)} style={{ background: expanded === i ? "#0c1a2e" : "#1e293b", borderRadius: 10, padding: "12px 16px", border: `1px solid ${expanded === i ? f.color : "#334155"}`, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.label}</div><div style={{ fontSize: 11, fontFamily: "'Fira Code',monospace", color: "#64748b", marginTop: 2 }}>{f.formula}</div></div>
              <span style={{ color: "#475569", fontSize: 12 }}>{expanded === i ? "▲" : "▼"}</span>
            </div>
            {expanded === i && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #334155", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{f.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
