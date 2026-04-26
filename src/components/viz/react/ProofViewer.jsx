/**
 * ProofViewer.jsx
 * Reusable step-by-step proof renderer.
 * Takes a `proof` data object (same shape as ImplicitDiffProof PROOF constant).
 * Usage: <ProofViewer proof={myProofObject} />
 *
 * ALL visual styling lives in src/styles/proof.css — edit tokens there.
 */

import { useState, useEffect, useRef } from "react";

// ─── KaTeX loader ──────────────────────────────────────────────────────────────
function useMath() {
  const [ready, setReady] = useState(
    typeof window !== "undefined" && !!window.katex,
  );
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
    const s    = document.createElement("script");
    s.src      = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    s.onload   = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

function M({ t, display = false, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !window.katex || !t) return;
    try {
      window.katex.render(t, ref.current, { throwOnError: false, displayMode: display });
    } catch (_) {
      if (ref.current) ref.current.textContent = t;
    }
  }, [t, display, ready]);
  if (!t) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

// ─── Depth accent colours for WhyPanel (JS-driven, can't live in CSS) ─────────
const DEPTH_ACCENTS = [
  "#6366f1", // indigo
  "#0891b2", // cyan
  "#059669", // emerald
  "#d97706", // amber
  "#9ca3af", // slate
];
const DEPTH_LABELS = ["Why?", "But why?", "Prove it", "From scratch", "Axioms"];

// ─── WhyPanel ──────────────────────────────────────────────────────────────────
function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;

  const color = DEPTH_ACCENTS[Math.min(depth, DEPTH_ACCENTS.length - 1)];
  const label = why.tag || DEPTH_LABELS[Math.min(depth, DEPTH_LABELS.length - 1)];

  return (
    <div style={{ marginLeft: depth * 14, marginTop: 12 }}>
      <button
        className="proof-why-btn"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: open ? `${color}22` : `${color}14`,
          border:     `1px solid ${color}`,
          color:      color,
          boxShadow:  open ? `0 0 16px ${color}2e` : "none",
        }}
      >
        <span className="proof-why-dot" style={{ background: color }}>
          {open ? "−" : "?"}
        </span>
        {open ? "CLOSE" : label.toUpperCase()}
      </button>

      {open && (
        <div
          className="proof-why-panel"
          style={{ borderLeft: `4px solid ${color}` }}
        >
          <span className="proof-why-tag-badge" style={{ background: color }}>
            {label}
          </span>

          <p className="proof-why-text">{why.explanation}</p>

          {why.math && (
            <div className="proof-well proof-well--compact">
              <M t={why.math} display ready={ready} />
            </div>
          )}

          {why.steps && (
            <div style={{ marginTop: 10 }}>
              {why.steps.map((st, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      minWidth: 24, height: 24, borderRadius: 8,
                      background: color, color: "#fff",
                      fontSize: 12, fontWeight: 900, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 3px 10px ${color}44`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="proof-why-step-text">{st.text}</p>
                    {st.math && (
                      <div className="proof-well proof-well--compact" style={{ marginTop: 6 }}>
                        <M t={st.math} display ready={ready} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {why.why && <WhyPanel why={why.why} depth={depth + 1} ready={ready} />}
        </div>
      )}
    </div>
  );
}

// ─── Single proof step ─────────────────────────────────────────────────────────
function ProofStep({ step, idx, total, ready }) {
  return (
    <div className="proof-step-card">
      <div className="proof-ribbon">
        <div className="proof-ribbon-number">{idx + 1}</div>
        <span className="proof-ribbon-tag">{step.tag}</span>
        <span className="proof-ribbon-counter">STEP {idx + 1} / {total}</span>
      </div>

      <div style={{ padding: "0 4px" }}>
        <p className="proof-instruction">{step.instruction}</p>

        <div className="proof-well">
          <M t={step.math} display ready={ready} />
        </div>

        {step.note && (
          <p className="proof-note">{step.note}</p>
        )}

        <div style={{ paddingBottom: 12 }}>
          <WhyPanel why={step.why} depth={0} ready={ready} />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ProofViewer({ proof }) {
  const [step, setStep] = useState(0);
  const ready = useMath();
  const steps = proof?.steps ?? [];

  useEffect(() => { setStep(0); }, [proof]);

  if (!proof) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--proof-meta-color)", fontFamily: "var(--font-sans)" }}>
      No proof available yet for this formula.
    </div>
  );

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "0 8px 32px" }}>

      {/* Header */}
      <div className="proof-header">
        {proof.category && (
          <div className="proof-category">{proof.category}</div>
        )}
        <div className="proof-title">{proof.title}</div>
        {proof.subtitle && (
          <div className="proof-subtitle">{proof.subtitle}</div>
        )}
        <div className="proof-well proof-well--hero">
          <M t={proof.problem} display ready={ready} />
        </div>
        {proof.preamble && (
          <p className="proof-preamble">{proof.preamble}</p>
        )}
      </div>

      {/* Progress pips */}
      <div className="proof-progress">
        {steps.map((_, i) => (
          <div
            key={i}
            className={
              "proof-pip" +
              (i < step ? " proof-pip--done" : i === step ? " proof-pip--current" : "")
            }
            onClick={() => setStep(i)}
            title={`Step ${i + 1}: ${steps[i].tag}`}
          />
        ))}
      </div>

      {/* Current step */}
      <ProofStep
        key={`${proof.title}-${step}`}
        step={steps[step]}
        idx={step}
        total={steps.length}
        ready={ready}
      />

      {/* Navigation */}
      <div className="proof-nav">
        <button
          className="proof-nav-btn proof-nav-btn--prev"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          ← Previous
        </button>
        <span className="proof-nav-counter">{step + 1} / {steps.length}</span>
        <button
          className="proof-nav-btn proof-nav-btn--next"
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
        >
          Next →
        </button>
      </div>

    </div>
  );
}
