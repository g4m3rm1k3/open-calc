import { useState, useEffect, useRef } from "react";

function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

function M({ t, display = false, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !window.katex || !t) return;
    try { window.katex.render(t, ref.current, { throwOnError: false, displayMode: display }); }
    catch (_) { if (ref.current) ref.current.textContent = t; }
  }, [t, display, ready]);
  if (!t) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

const DEPTH_STYLES = [
  { border: "#6366f1", tagBg: "#eef2ff", tagText: "#4338ca", panelBg: "var(--color-bg-sidebar, #f8fafc)" },
  { border: "#0891b2", tagBg: "#ecfeff", tagText: "#0e7490", panelBg: "var(--color-bg-base, #ffffff)" },
  { border: "#059669", tagBg: "#ecfdf5", tagText: "#047857", panelBg: "var(--color-bg-sidebar, #f8fafc)" },
];
const DEPTH_BTN_LABELS = ["Why?", "But why?", "Axioms"];

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DEPTH_STYLES[Math.min(depth, DEPTH_STYLES.length - 1)];
  const btnLabel = why.tag || DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)];

  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: open ? d.tagBg : "transparent",
          border: `1px solid ${d.border}`,
          borderRadius: 6, padding: "4px 12px",
          fontSize: 12, fontWeight: 500, color: d.border,
          cursor: "pointer",
        }}
      >
        <span style={{
          width: 15, height: 15, borderRadius: "50%", background: d.border,
          color: "#fff", fontSize: 10, fontWeight: 700,
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{open ? "−" : "?"}</span>
        {open ? "Close" : btnLabel}
      </button>

      {open && (
        <div style={{
          marginTop: 8, padding: "14px 16px",
          background: d.panelBg,
          border: `0.5px solid ${d.border}22`,
          borderLeft: `3px solid ${d.border}`,
          borderRadius: "0 8px 8px 0",
        }}>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{why.explanation}</p>
          {why.math && (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px", textAlign: "center", marginTop: 8 }}>
              <M t={why.math} display ready={ready} />
            </div>
          )}
          {why.why && <WhyPanel why={why.why} depth={depth + 1} ready={ready} />}
        </div>
      )}
    </div>
  );
}

function ProofStep({ step, idx, total, ready }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 12, overflow: "hidden",
      marginBottom: 16,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 20px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "#334155", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 600,
        }}>{idx + 1}</div>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{step.tag}</span>
      </div>

      <div style={{ padding: "20px" }}>
        <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{step.instruction}</p>
        <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "20px", textAlign: "center", marginBottom: 12 }}>
          <M t={step.math} display ready={ready} />
        </div>
        {step.note && <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic", marginBottom: 12 }}>{step.note}</p>}
        <WhyPanel why={step.why} ready={ready} />
      </div>
    </div>
  );
}

export default function StepByStepMathViz({ solution }) {
  const [step, setStep] = useState(0);
  const ready = useMath();
  const steps = solution?.steps || [];

  if (!solution) return null;

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 740, margin: "0 auto" }}>
      <div style={{ background: "#f1f5f9", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 10px 0" }}>{solution.title}</h3>
        <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>{solution.preamble}</p>
      </div>

      {steps.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {steps.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} style={{
                flex: 1, height: 6, borderRadius: 3, cursor: "pointer",
                background: i <= step ? "#334155" : "#e2e8f0",
              }} />
            ))}
          </div>

          <ProofStep step={steps[step]} idx={step} total={steps.length} ready={ready} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Previous</button>
            <span style={{ fontSize: 14 }}>Step {step + 1} of {steps.length}</span>
            <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}
