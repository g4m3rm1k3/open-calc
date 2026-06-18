/**
 * Ch2_RopeBridge.jsx
 * Book 1, Chapter 2 — "The Rope Bridge"
 * Topic: Ratios, proportions, cross-multiplication proved from balance principle
 *
 * Drop into: src/components/viz/react/Ch2_RopeBridge.jsx
 * Register:  VizFrame.jsx → Ch2_RopeBridge: lazy(() => import('./react/Ch2_RopeBridge.jsx'))
 */

import { useState, useEffect, useRef } from "react";

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

function WhyPanel({ depth = 0, tag, children }) {
  const [open, setOpen] = useState(false);
  const colors = [
    { border: "#059669", bg: "#ecfdf5", text: "#047857" },
    { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" },
    { border: "#6366f1", bg: "#eef2ff", text: "#4338ca" },
  ];
  const c = colors[Math.min(depth, colors.length - 1)];
  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: open ? c.bg : "transparent",
          border: `1px solid ${c.border}`,
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 500,
          color: c.border,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
        }}
      >
        <span
          style={{
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: c.border,
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {open ? "−" : "?"}
        </span>
        {open ? "Close" : tag}
      </button>
      {open && (
        <div
          style={{
            marginTop: 8,
            padding: "12px 14px",
            background: "var(--color-background-secondary)",
            borderLeft: `3px solid ${c.border}`,
            borderRadius: "0 8px 8px 0",
            fontSize: 13,
            color: "var(--color-text-secondary)",
            lineHeight: 1.65,
            animation: "slideIn .18s ease-out",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function StepBlock({ num, label, tex, note, ready, accentColor = "#059669" }) {
  const [mathEl, setMathEl] = useState(null);
  useEffect(() => {
    if (ready && mathEl && window.katex && tex) {
      try {
        window.katex.render(tex, mathEl, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (_) {
        if (mathEl) mathEl.textContent = tex;
      }
    }
  }, [tex, ready, mathEl]);
  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            minWidth: 20,
            height: 20,
            borderRadius: "50%",
            background: accentColor,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {num}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
        >
          {label}
        </span>
      </div>
      <div
        ref={(el) => setMathEl(el)}
        style={{
          background: "var(--color-background-secondary)",
          borderRadius: 6,
          padding: "10px",
          textAlign: "center",
          overflowX: "auto",
          marginBottom: 6,
        }}
      />
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
        {note}
      </div>
    </div>
  );
}

const STEPS = [
  {
    label: "Write the proportion",
    tex: "\\frac{3.4}{2.8} = \\frac{x}{4.2}",
    note: "Rope-to-crossing-distance ratio is equal on both sides.",
  },
  {
    label: "Multiply both sides by 4.2",
    tex: "4.2 \\times \\frac{3.4}{2.8} = 4.2 \\times \\frac{x}{4.2}",
    note: "Multiplication Property of Equality — same operation, both sides. The scale stays balanced.",
  },
  {
    label: "Right side simplifies",
    tex: "4.2 \\times \\frac{3.4}{2.8} = x",
    note: "4.2 ÷ 4.2 = 1, so the right side becomes just x. This is the goal — isolate the unknown.",
  },
  {
    label: "Compute the left side",
    tex: "x = \\frac{4.2 \\times 3.4}{2.8} = \\frac{14.28}{2.8} = 5.1 \\text{ m}",
    note: "Multiply numerators, divide by denominator. This IS cross-multiplication — but now you see exactly why it works.",
  },
];

export default function Ch2_RopeBridge({ params = {} }) {
  const [creek, setCreek] = useState(4.2);
  const ready = useMath();
  const x = (creek * 3.4) / 2.8;

  const panel = {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
  };
  const hdr = (tag, tagStyle, title) => (
    <div
      style={{
        padding: "10px 18px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-secondary)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          padding: "2px 8px",
          borderRadius: 4,
          ...tagStyle,
        }}
      >
        {tag}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--color-text-primary)",
        }}
      >
        {title}
      </span>
    </div>
  );
  const body = { padding: "16px 20px" };
  const insight = (color = "#059669") => ({
    padding: "12px 14px",
    borderLeft: `3px solid ${color}`,
    background: "var(--color-background-secondary)",
    borderRadius: "0 8px 8px 0",
    fontSize: 13,
    color: "var(--color-text-secondary)",
    lineHeight: 1.65,
    margin: "10px 0",
  });
  const mbox = {
    background: "var(--color-background-secondary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: 8,
    padding: "12px 16px",
    textAlign: "center",
    overflowX: "auto",
    margin: "10px 0",
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        padding: ".5rem 0",
        maxWidth: 740,
      }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 12px",
          borderRadius: 20,
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          fontSize: 11,
          fontWeight: 500,
          color: "var(--color-text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: ".08em",
          marginBottom: 16,
        }}
      >
        Book 1 · Chapter 2
      </div>

      <div
        style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            color: "var(--color-text-tertiary)",
            marginBottom: 5,
          }}
        >
          The situation
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            lineHeight: 1.45,
          }}
        >
          John wants to build a rope bridge across the creek. His test rope
          crossed 2.8 m of creek using 3.4 m of rope. The actual creek is 4.2 m
          wide. He thinks one measurement is enough. Mic disagrees — then agrees
          — then makes John prove why it works.
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Story",
          { background: "#dcfce7", color: "#166534" },
          "The rope bridge",
        )}
        <div
          style={{
            ...body,
            fontSize: 14,
            lineHeight: 1.8,
            color: "var(--color-text-primary)",
          }}
        >
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            spread a hand-drawn sketch on the ground.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "The creek is 4.2 metres wide. My test rope crossed 2.8 metres of
              creek using 3.4 metres of rope. Same ratio — I just need to scale
              up."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            looked at the numbers.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Scale up how? By how much? You keep saying 'same ratio' like that
              means something you've proved."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            crouched over the sketch.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Write it as a fraction. You have two ratios — rope-to-distance —
              and you're claiming they're equal. Set them equal and solve."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            wrote{" "}
            <span
              style={{
                background: "var(--color-background-secondary)",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              3.4 / 2.8 = x / 4.2
            </span>{" "}
            and stared at it.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "I don't remember how to solve this."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            looked at{" "}
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Neither do I. Not properly. Why does cross-multiplication work?"
            </em>{" "}
            Albert picked up a stick.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Let me show you from scratch."
            </em>
          </p>
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#dcfce7", color: "#166534" },
          "Why cross-multiplication works — proved from one rule",
        )}
        <div style={body}>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
              marginBottom: 14,
            }}
          >
            Albert draws a balance scale. An equation is a balance — two sides
            with equal weight. The only rule: whatever you do to one side, you
            must do to the other. One operation, four words:{" "}
            <em>same thing, both sides.</em>
          </p>

          {STEPS.map((step, i) => (
            <StepBlock
              key={i}
              num={i + 1}
              label={step.label}
              tex={step.tex}
              note={step.note}
              ready={ready}
            />
          ))}

          <div
            style={{
              marginTop: 14,
              marginBottom: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            Now try it — adjust the creek width:
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <span
              style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
            >
              Creek width (m)
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={creek}
              step={0.1}
              onChange={(e) => setCreek(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 220 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>
              {creek.toFixed(1)} m
            </span>
          </div>

          <div style={mbox}>
            {ready && (
              <M
                t={`\\frac{3.4}{2.8} = \\frac{x}{${creek.toFixed(1)}} \\implies x = \\frac{${creek.toFixed(1)} \\times 3.4}{2.8} = ${x.toFixed(2)} \\text{ m}`}
                display
                ready={ready}
              />
            )}
          </div>

          <div style={insight()}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              John needs {x.toFixed(2)} metres of rope
            </strong>{" "}
            to cross a {creek.toFixed(1)} m creek, given that 3.4 m of rope
            crossed 2.8 m.
          </div>

          <WhyPanel
            tag="Why is multiplying both sides by the same number always valid?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              An equation A = B says two expressions have the same value. Think
              of a balance scale: both pans weigh the same. If you add equal
              weight to both pans, it stays balanced. This is the Multiplication
              Property of Equality — it follows from the field axioms of
              arithmetic.
            </p>
            <p style={{ marginBottom: 8 }}>
              Number example: 6 = 6. Multiply both sides by 5: 30 = 30. ✓
              Nothing changed except the scale.
            </p>
            <WhyPanel tag="Why can't we multiply only one side?" depth={1}>
              <p style={{ marginBottom: 8 }}>
                If A = B and we multiply only the left: we get 5A on the left
                but B on the right. Now 5A ≠ B (unless A = 0). The balance tips
                — the equation is no longer true.
              </p>
              <p>
                The only exception: multiplying by 1 (identity) or adding 0.
                Everything else must be applied to both sides simultaneously.
              </p>
            </WhyPanel>
          </WhyPanel>

          <WhyPanel
            tag="When is a proportion NOT valid? When can't you just scale?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              Proportions require a linear relationship — one quantity is a
              constant multiple of the other. Rope and crossing distance have
              this property.
            </p>
            <p style={{ marginBottom: 8 }}>
              Non-linear counter-example: the area of a square does NOT scale
              proportionally with its side. Double the side, quadruple the area
              (2² = 4×). Proportion would wrongly predict doubling the area.
            </p>
            <p>
              Real-world trap: John assumes the rope hangs straight. It doesn't
              — it curves (a catenary). The actual rope needed is longer than
              the crossing distance. The proportion gives a useful starting
              estimate but not the exact answer. Knowing when your model fails
              is as important as knowing when it works.
            </p>
          </WhyPanel>
        </div>
      </div>

      <div
        style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderTop: "2px solid #b45309",
          borderRadius: "0 0 10px 10px",
          padding: "12px 16px",
          fontSize: 13,
          color: "var(--color-text-secondary)",
          lineHeight: 1.65,
        }}
      >
        <strong style={{ fontWeight: 500, color: "#b45309" }}>
          Coming next:
        </strong>{" "}
        The support beam for John's bridge needs to be cut at a precise angle —
        but the protractor is broken. Mic has only lengths. Can you find an
        angle from distances alone? Chapter 3: <em>The Missing Angle.</em>
      </div>
    </div>
  );
}
