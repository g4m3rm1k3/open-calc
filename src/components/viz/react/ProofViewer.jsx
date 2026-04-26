/**
 * ProofViewer.jsx
 * Reusable step-by-step proof renderer.
 * Takes a `proof` data object (same shape as ImplicitDiffProof PROOF constant).
 * Usage: <ProofViewer proof={myProofObject} />
 */

import { useState, useEffect, useRef } from "react";

// ─── KaTeX loader ──────────────────────────────────────────────────────────────
function useMath() {
  const [ready, setReady] = useState(
    typeof window !== "undefined" && !!window.katex,
  );
  useEffect(() => {
    if (window.katex) {
      setReady(true);
      return;
    }
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
    try {
      window.katex.render(t, ref.current, {
        throwOnError: false,
        displayMode: display,
      });
    } catch (_) {
      if (ref.current) ref.current.textContent = t;
    }
  }, [t, display, ready]);
  if (!t) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

// ─── WhyPanel ──────────────────────────────────────────────────────────────────
const DEPTH_STYLES = [
  {
    border: "#6366f1",
    tagBg: "#eef2ff",
    tagText: "#4338ca",
    panelBg: "var(--color-background-secondary)",
  },
  {
    border: "#0891b2",
    tagBg: "#ecfeff",
    tagText: "#0e7490",
    panelBg: "var(--color-background-primary)",
  },
  {
    border: "#059669",
    tagBg: "#ecfdf5",
    tagText: "#047857",
    panelBg: "var(--color-background-secondary)",
  },
  {
    border: "#d97706",
    tagBg: "#fffbeb",
    tagText: "#b45309",
    panelBg: "var(--color-background-primary)",
  },
  {
    border: "#9ca3af",
    tagBg: "#f9fafb",
    tagText: "#6b7280",
    panelBg: "var(--color-background-secondary)",
  },
];
const DEPTH_BTN_LABELS = [
  "Why?",
  "But why?",
  "Prove it",
  "From scratch",
  "Axioms",
];

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DEPTH_STYLES[Math.min(depth, DEPTH_STYLES.length - 1)];
  const btnLabel =
    why.tag || DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)];

  return (
    <div style={{ marginLeft: depth * 14, marginTop: 12 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: open ? `${d.border}22` : `${d.border}12`,
          border: `1px solid ${d.border}`,
          borderRadius: 12,
          padding: "6px 16px",
          fontSize: 12,
          fontWeight: 700,
          color: d.border,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          transition: "all 0.2s",
          boxShadow: open ? `0 0 15px ${d.border}44` : "none",
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: d.border,
            color: "#fff",
            fontSize: 11,
            fontWeight: 900,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {open ? "−" : "?"}
        </span>
        {open ? "CLOSE ANALYSIS" : btnLabel.toUpperCase()}
      </button>

      {open && (
        <div
          className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10"
          style={{
            marginTop: 10,
            padding: "20px",
            borderLeft: `4px solid ${d.border}`,
            borderRadius: "0 16px 16px 0",
            animation: "slideDown .25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 6,
              marginBottom: 14,
              background: d.border,
              color: "#ffffff",
            }}
          >
            {why.tag ||
              DEPTH_BTN_LABELS[Math.min(depth, DEPTH_BTN_LABELS.length - 1)]}
          </span>

          <p
            className="text-slate-700 dark:text-white/90"
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              marginBottom: why.math || why.steps ? 16 : 0,
              fontWeight: 500,
            }}
          >
            {why.explanation}
          </p>

          {why.math && (
            <div
              className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              style={{
                borderRadius: 12,
                padding: "16px",
                textAlign: "center",
                overflowX: "auto",
                marginBottom: 16,
              }}
            >
              <M t={why.math} display ready={ready} />
            </div>
          )}

          {why.steps && (
            <div style={{ marginTop: 12 }}>
              {why.steps.map((st, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    marginBottom: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: 8,
                      background: d.border,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 900,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 10px ${d.border}44`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p
                      className="text-indigo-950 dark:text-slate-200"
                      style={{
                        fontSize: 13,
                        lineHeight: 1.7,
                        marginBottom: st.math ? 8 : 0,
                        fontWeight: 500,
                      }}
                    >
                      {st.text}
                    </p>
                    {st.math && (
                      <div
                        className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                        style={{
                          borderRadius: 10,
                          padding: "10px 16px",
                          textAlign: "center",
                          overflowX: "auto",
                          marginTop: 6,
                        }}
                      >
                        <M t={st.math} display ready={ready} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {why.why && (
            <WhyPanel why={why.why} depth={depth + 1} ready={ready} />
          )}
        </div>
      )}
    </div>
  );
}

function ProofStep({ step, idx, total, ready }) {
  return (
    <div
      className="bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-[0_30px_60px_-12px_rgba(79,70,229,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      style={{
        borderRadius: 20,
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Dynamic Navigation Ribbon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 28px",
          borderRadius: 24,
          background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
          color: "#ffffff",
          marginBottom: 32,
          boxShadow: "0 20px 40px -10px rgba(67, 56, 202, 0.4)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "rgba(255,255,255,0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 950,
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.4)",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {idx + 1}
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 950,
            letterSpacing: ".3em",
            textTransform: "uppercase",
            padding: "6px 20px",
            borderRadius: 12,
            background: "rgba(0,0,0,0.25)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {step.tag}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 900,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: ".2em",
          }}
        >
          STEP {idx + 1} / {total}
        </span>
      </div>

      <div style={{ padding: "0 12px 12px" }}>
        <p
          className="text-indigo-950 dark:text-white"
          style={{
            fontSize: 24,
            fontWeight: 950,
            lineHeight: 1.4,
            marginBottom: 32,
            tracking: "-0.03em",
          }}
        >
          {step.instruction}
        </p>

        {/* High-Contrast Equation Well */}
        <div
          className="bg-slate-50 dark:bg-black/40 border-2 border-slate-200 dark:border-[#22d3ee]/60 text-slate-950 dark:text-white shadow-xl dark:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          style={{
            borderRadius: 16,
            padding: "20px 16px",
            textAlign: "center",
            overflowX: "auto",
            fontSize: 22,
            marginBottom: 20,
          }}
        >
          <M t={step.math} display ready={ready} />
        </div>

        {step.note && (
          <p
            className="text-slate-500 dark:text-white/60"
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              fontStyle: "italic",
              paddingLeft: 20,
              borderLeft: "3px solid #7c3aed",
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            {step.note}
          </p>
        )}
        <div style={{ paddingBottom: 20 }}>
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

  useEffect(() => {
    setStep(0);
  }, [proof]);

  if (!proof)
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          color: "var(--color-text-tertiary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        No proof available yet for this formula.
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        padding: "0 8px 32px",
      }}
    >
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header - Transparent Laboratory HUD */}
      <div
        className="bg-white/90 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        style={{
          borderRadius: 32,
          padding: "32px 40px",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Luminous Top Accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef)",
          }}
        />

        {proof.category && (
          <div
            className="text-indigo-600 dark:text-blue-400 font-black"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".3em",
              marginBottom: 12,
            }}
          >
            {proof.category}
          </div>
        )}
        <div
          className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400"
          style={{
            fontSize: 36,
            fontWeight: 950,
            marginBottom: 12,
            tracking: "-0.05em",
            lineHeight: 1.1,
          }}
        >
          {proof.title}
        </div>
        <div
          className="text-indigo-900/60 dark:text-slate-400 font-bold"
          style={{ fontSize: 16, marginBottom: 28, maxWidth: "80%" }}
        >
          {proof.subtitle}
        </div>

        {/* Luminous Aurora Well (Problem Box) - Light Mode Glow Enabled */}
        <div
          className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-2 border-indigo-400/30 dark:border-blue-400/30 text-indigo-950 dark:text-white shadow-[0_0_30px_rgba(99,102,241,0.2)] dark:shadow-[0_0_40px_rgba(34,211,238,0.25)]"
          style={{
            borderRadius: 24,
            padding: "40px",
            width: "100%",
            textAlign: "center",
            overflowX: "auto",
            marginBottom: 20,
            boxShadow: "inset 0 0 20px rgba(255,255,255,0.8)",
          }}
        >
          <M t={proof.problem} display ready={ready} />
        </div>

        <p
          className="text-indigo-900/60 dark:text-slate-400 text-center leading-relaxed"
          style={{ fontSize: 15, margin: 0, fontWeight: 600, maxWidth: "90%" }}
        >
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
              flex: 1,
              height: 5,
              borderRadius: 3,
              cursor: "pointer",
              background:
                i < step
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
        <ProofStep
          key={`${proof.title}-${step}`}
          step={steps[step]}
          idx={step}
          total={steps.length}
          ready={ready}
        />
      </div>

      {/* Navigation */}
      {/* Navigation - High End Glass Pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 12,
        }}
      >
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className={
            step === 0
              ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer"
          }
          style={{
            flex: 1,
            padding: "14px 24px",
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "var(--font-sans)",
            transition: "all 0.2s",
            textTransform: "uppercase",
            letterSpacing: ".1em",
          }}
        >
          ← Previous
        </button>
        <span
          className="text-slate-400 dark:text-slate-400"
          style={{
            fontSize: 13,
            minWidth: 80,
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: ".1em",
          }}
        >
          {step + 1} / {steps.length}
        </span>
        <button
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          className={
            step === steps.length - 1
              ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "border border-transparent cursor-pointer"
          }
          style={{
            flex: 1,
            padding: "14px 24px",
            borderRadius: 16,
            background:
              step === steps.length - 1
                ? undefined
                : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: step === steps.length - 1 ? undefined : "#ffffff",
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "var(--font-sans)",
            boxShadow:
              step === steps.length - 1
                ? "none"
                : "0 10px 20px -5px rgba(79, 70, 229, 0.4)",
            transition: "all 0.2s",
            textTransform: "uppercase",
            letterSpacing: ".1em",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
