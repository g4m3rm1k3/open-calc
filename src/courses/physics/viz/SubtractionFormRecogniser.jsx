// SubtractionFormRecogniser.jsx — Pillar 5, Lesson 7
import { useState } from "react";

const FORMS = [
  { label: "Definition", formula: "A⃗ − B⃗ = A⃗ + (−B⃗)", note: "Subtraction is addition of the additive inverse. No new rules needed.", color: "#f43f5e" },
  { label: "Component form", formula: "A⃗ − B⃗ = (Aₓ−Bₓ,  Aᵧ−Bᵧ)", note: "Subtract each component independently. Exact.", color: "#6366f1" },
  { label: "Negative vector", formula: "−B⃗ = (−Bₓ, −Bᵧ)  — same |B⃗|, opposite direction", note: "Flip all signs. The additive inverse satisfies B⃗ + (−B⃗) = 0⃗.", color: "#f59e0b" },
  { label: "Tail-to-tail shortcut", formula: "Tails at origin → A⃗−B⃗ goes from tip(B⃗) to tip(A⃗)", note: "Fastest graphical method when both vectors already share a tail.", color: "#10b981" },
  { label: "Non-commutativity", formula: "A⃗−B⃗ = −(B⃗−A⃗)  — antiparallel", note: "Order matters. Swapping gives the opposite vector.", color: "#f43f5e" },
  { label: "Change in velocity", formula: "Δv⃗ = v⃗_f − v⃗_i  (tip of v⃗_i → tip of v⃗_f)", note: "|Δv⃗| ≠ |v_f| − |v_i|. The vector magnitude and scalar speed difference are different numbers.", color: "#818cf8" },
  { label: "Law of cosines for difference", formula: "|A⃗−B⃗|² = |A⃗|²+|B⃗|²−2|A⃗||B⃗|cosφ", note: "φ = angle between A⃗ and B⃗. Compare with |A⃗+B⃗|² which has +2|A||B|cosφ.", color: "#0ea5e9" },
];

const RECALL = [
  { q: "A⃗ = (7, 2), B⃗ = (3, 5). What is A⃗ − B⃗?", a: "(7−3, 2−5) = (4, −3)" },
  { q: "What is −B⃗ if B⃗ = (−2, 4)?", a: "(2, −4) — negate every component" },
  { q: "In the tail-to-tail method, where does A⃗−B⃗ point?", a: "From the tip of B⃗ to the tip of A⃗" },
  { q: "A⃗−B⃗ and B⃗−A⃗: what is their relationship?", a: "Antiparallel — same magnitude, opposite direction" },
  { q: "v⃗_i = 4 m/s east, v⃗_f = 3 m/s north. What is |Δv⃗|?", a: "√(4²+3²) = 5 m/s  (NOT |3−4| = 1 m/s)" },
];

export default function SubtractionFormRecogniser({ params = {} }) {
  const [mode, setMode] = useState("table");
  const [expanded, setExpanded] = useState(null);
  const [ri, setRi] = useState(0);
  const [shown, setShown] = useState(false);
  const [rs, setRs] = useState(0);
  const [rdone, setRdone] = useState(false);
  const [rh, setRh] = useState([]);

  function nextR(knew) {
    setRh(h => [...h, { ...RECALL[ri], knew }]);
    if (knew) setRs(s => s + 1);
    if (ri + 1 >= RECALL.length) setRdone(true);
    else { setRi(n => n + 1); setShown(false); }
  }

  if (mode === "recall" && rdone) return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, marginBottom: 12 }}>PILLAR 5 · RECALL RESULTS</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#e2e8f0", marginBottom: 16 }}>{rs}/{RECALL.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {rh.map((h, i) => <div key={i} style={{ background: h.knew ? "#0d2a1e" : "#2a0d0d", borderRadius: 8, padding: "10px 14px", borderLeft: `2px solid ${h.knew ? "#10b981" : "#f43f5e"}` }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{h.q}</div>
          <div style={{ fontSize: 13, fontFamily: "'Fira Code',monospace", color: "#e2e8f0" }}>{h.a}</div>
        </div>)}
      </div>
      <button onClick={() => { setMode("table"); setRi(0); setShown(false); setRs(0); setRdone(false); setRh([]); }}
        style={{ width: "100%", background: "#f43f5e", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Back</button>
    </div>
  );

  if (mode === "recall") {
    const q = RECALL[ri];
    return (
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700 }}>PILLAR 5 · RECALL</span>
          <span style={{ fontSize: 12, color: "#475569" }}>{ri + 1}/{RECALL.length}</span>
        </div>
        <div style={{ height: 3, background: "#1e293b" }}><div style={{ height: "100%", width: `${(ri / RECALL.length) * 100}%`, background: "#f43f5e", transition: "width 0.3s" }} /></div>
        <div style={{ padding: 24 }}>
          <div style={{ background: "#1e293b", borderRadius: 12, padding: "22px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{q.q}</div>
          </div>
          {!shown
            ? <button onClick={() => setShown(true)} style={{ width: "100%", background: "#1e293b", color: "#94a3b8", border: "2px solid #334155", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Show Answer</button>
            : <>
              <div style={{ background: "#0c1a2e", borderLeft: "3px solid #f43f5e", borderRadius: 10, padding: "14px 18px", marginBottom: 12, fontFamily: "'Fira Code',monospace", fontSize: 14, color: "#fda4af" }}>{q.a}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => nextR(false)} style={{ background: "#2a0d0d", color: "#f87171", border: "2px solid #f43f5e", borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✗ Didn't know</button>
                <button onClick={() => nextR(true)} style={{ background: "#0d2a1e", color: "#34d399", border: "2px solid #10b981", borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ Knew it</button>
              </div>
            </>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", background: "#0c1122", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 5 · SUBTRACTION REFERENCE</span>
        <button onClick={() => setMode("recall")} style={{ background: "#1e293b", color: "#f87171", border: "1px solid #f43f5e", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Recall →</button>
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
            {expanded === i && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #334155", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{f.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
