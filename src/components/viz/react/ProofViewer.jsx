/**
 * ProofViewer.jsx
 * Reusable step-by-step proof renderer.
 * Takes a `proof` data object (same shape as ImplicitDiffProof PROOF constant).
 * Usage: <ProofViewer proof={myProofObject} />
 */

import { useState, useEffect, useRef } from "react"

// ─── KaTeX loader ──────────────────────────────────────────────────────────────
function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex)
  useEffect(() => {
    if (window.katex) { setReady(true); return }
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
    document.head.appendChild(link)
    const s = document.createElement("script")
    s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
    s.onload = () => setReady(true)
    document.head.appendChild(s)
  }, [])
  return ready
}

function M({ t, display = false, ready }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ready || !ref.current || !window.katex || !t) return
    try { window.katex.render(t, ref.current, { throwOnError: false, displayMode: display }) }
    catch (_) { if (ref.current) ref.current.textContent = t }
  }, [t, display, ready])
  if (!t) return null
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />
}

// ─── WhyPanel ──────────────────────────────────────────────────────────────────
const DEPTH_STYLES = [
  { border: "#6366f1", tagBg: "#eef2ff", tagText: "#4338ca", panelBg: "var(--color-background-secondary)" },
  { border: "#0891b2", tagBg: "#ecfeff", tagText: "#0e7490", panelBg: "var(--color-background-primary)" },
  { border: "#059669", tagBg: "#ecfdf5", tagText: "#047857", panelBg: "var(--color-background-secondary)" },
  { border: "#d97706", tagBg: "#fffbeb", tagText: "#b45309", panelBg: "var(--color-background-primary)" },
  { border: "#9ca3af", tagBg: "#f9fafb", tagText: "#6b7280", panelBg: "var(--color-background-secondary)" },
]
const DEPTH_BTN_LABELS = ["Why?", "But why?", "Prove it", "From scratch", "Axioms"]

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false)
  if (!why) return null
  const d = DEPTH_STYLES[Math.min(depth, DEPTH_STYLES.length - 1)]
  const btnLabel = why.tag || DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)]

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
          cursor: "pointer", fontFamily: "var(--font-sans)",
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
          animation: "slideDown .18s ease-out",
        }}>
          <span style={{
            display: "inline-block", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.07em", textTransform: "uppercase",
            padding: "2px 8px", borderRadius: 4, marginBottom: 10,
            background: d.tagBg, color: d.tagText, border: `0.5px solid ${d.border}44`,
          }}>
            {why.tag || DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)]}
          </span>

          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)", marginBottom: (why.math || why.steps) ? 12 : 0 }}>
            {why.explanation}
          </p>

          {why.math && (
            <div style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 8, padding: "12px 16px",
              textAlign: "center", overflowX: "auto", marginBottom: 8,
            }}>
              <M t={why.math} display ready={ready} />
            </div>
          )}

          {why.steps && (
            <div style={{ marginTop: 10 }}>
              {why.steps.map((st, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{
                    minWidth: 22, height: 22, borderRadius: "50%", background: d.border,
                    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--color-text-primary)", marginBottom: st.math ? 5 : 0 }}>
                      {st.text}
                    </p>
                    {st.math && (
                      <div style={{
                        background: "var(--color-background-secondary)",
                        borderRadius: 6, padding: "8px 12px",
                        textAlign: "center", overflowX: "auto", marginTop: 4,
                      }}>
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
  )
}

// ─── Single step card ──────────────────────────────────────────────────────────
function ProofStep({ step, idx, total, ready }) {
  const tc = step.tagStyle
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 12, overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 20px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-secondary)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--color-text-primary)", color: "var(--color-background-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600, flexShrink: 0,
        }}>{idx + 1}</div>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase",
          padding: "3px 10px", borderRadius: 20,
          background: tc.bg, color: tc.text, border: `0.5px solid ${tc.border}`,
        }}>{step.tag}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-tertiary)" }}>
          {idx + 1} of {total}
        </span>
      </div>
      <div style={{ padding: "18px 20px 0" }}>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: "var(--color-text-primary)", marginBottom: 16 }}>
          {step.instruction}
        </p>
        <div style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10, padding: "20px 16px",
          textAlign: "center", overflowX: "auto", fontSize: 18, marginBottom: 12,
        }}>
          <M t={step.math} display ready={ready} />
        </div>
        {step.note && (
          <p style={{
            fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6,
            fontStyle: "italic", paddingLeft: 12,
            borderLeft: "2px solid var(--color-border-secondary)", marginBottom: 10,
          }}>{step.note}</p>
        )}
        <div style={{ paddingBottom: 18 }}>
          <WhyPanel why={step.why} depth={0} ready={ready} />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ProofViewer({ proof }) {
  const [step, setStep] = useState(0)
  const ready = useMath()
  const steps = proof?.steps ?? []

  // Reset to step 0 whenever the proof changes
  useEffect(() => { setStep(0) }, [proof])

  if (!proof) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)" }}>
      No proof available yet for this formula.
    </div>
  )

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "0", maxWidth: 740 }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12, padding: "8px 22px", marginBottom: 20,
      }}>
        {proof.category && (
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--color-text-tertiary)", marginBottom: 4 }}>
            Proof · {proof.category}
          </div>
        )}
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
          {proof.title}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 14 }}>
          {proof.subtitle}
        </div>
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 8, padding: "14px 16px", textAlign: "center", overflowX: "auto", marginBottom: 12,
        }}>
          <M t={proof.problem} display ready={ready} />
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: 0 }}>
          {proof.preamble}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            title={`Step ${i + 1}: ${steps[i].tag}`}
            style={{
              flex: 1, height: 5, borderRadius: 3, cursor: "pointer",
              background: i < step
                ? "var(--color-text-tertiary)"
                : i === step
                  ? "var(--color-text-primary)"
                  : "var(--color-border-tertiary)",
              transform: i === step ? "scaleY(1.6)" : "scaleY(1)",
              transition: "background .2s, transform .15s",
            }}
          />
        ))}
      </div>

      {/* Current step */}
      <div style={{ marginBottom: 16 }}>
        <ProofStep key={`${proof.title}-${step}`} step={steps[step]} idx={step} total={steps.length} ready={ready} />
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            flex: 1, padding: "10px 16px", borderRadius: 8, cursor: step === 0 ? "not-allowed" : "pointer",
            background: step === 0 ? "var(--color-background-secondary)" : "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            color: step === 0 ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
            fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)",
          }}
        >
          ← Previous
        </button>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 80, textAlign: "center" }}>
          {step + 1} / {steps.length}
        </span>
        <button
          onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          style={{
            flex: 1, padding: "10px 16px", borderRadius: 8, cursor: step === steps.length - 1 ? "not-allowed" : "pointer",
            background: step === steps.length - 1 ? "var(--color-background-secondary)" : "var(--color-text-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            color: step === steps.length - 1 ? "var(--color-text-tertiary)" : "var(--color-background-primary)",
            fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
