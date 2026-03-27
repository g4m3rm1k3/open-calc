/**
 * Ch3_2_GettingCloser.jsx  — Limit laws proved from ε-δ
 * Ch3_3_InfiniteStaircase.jsx — Continuity, IVT, completeness
 * Ch3_4_SineOfAlmostNothing.jsx — lim(sin x/x) = 1, squeeze theorem
 * Ch3_5_BrokenFunction.jsx — Indeterminate forms, 0/0
 * Ch3_6_BridgeTocalculus.jsx — Derivative definition preview
 *
 * Each is a named export. Register all five in VizFrame.jsx.
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
    { border: "#6366f1", bg: "#eef2ff", text: "#4338ca" },
    { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" },
    { border: "#059669", bg: "#ecfdf5", text: "#047857" },
    { border: "#d97706", bg: "#fffbeb", text: "#92400e" },
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
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Shared layout helpers ────────────────────────────────────────────────────
const panel = {
  background: "var(--color-background-primary)",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: 12,
  overflow: "hidden",
  marginBottom: 14,
};
const hdr = (tag, ts, title) => (
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
        ...ts,
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
const mbox = {
  background: "var(--color-background-secondary)",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: 8,
  padding: "12px 16px",
  textAlign: "center",
  overflowX: "auto",
  margin: "10px 0",
};
const insight = (col = "#6366f1") => ({
  padding: "12px 14px",
  borderLeft: `3px solid ${col}`,
  background: "var(--color-background-secondary)",
  borderRadius: "0 8px 8px 0",
  fontSize: 13,
  color: "var(--color-text-secondary)",
  lineHeight: 1.65,
  margin: "10px 0",
});
const badge = (book, ch) => (
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
  >{`Book ${book} · Chapter ${ch}`}</div>
);
const hook = (text) => (
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
      {text}
    </div>
  </div>
);
const seed = (text) => (
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
    {text}
  </div>
);
function StepBlock({ num, label, tex, note, ready, col = "#6366f1" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ready && ref.current && window.katex && tex) {
      try {
        window.katex.render(tex, ref.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (_) {
        if (ref.current) ref.current.textContent = tex;
      }
    }
  }, [tex, ready]);
  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            minWidth: 20,
            height: 20,
            borderRadius: "50%",
            background: col,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
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
        ref={ref}
        style={{
          background: "var(--color-background-secondary)",
          borderRadius: 6,
          padding: 8,
          textAlign: "center",
          overflowX: "auto",
          marginBottom: 5,
        }}
      />
      {note && (
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {note}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Ch3_2 — Getting Closer (Limit Laws)
// ════════════════════════════════════════════════════════════════════════════
export function Ch3_2_GettingCloser({ params = {} }) {
  const [f, setF] = useState(3);
  const [g, setG] = useState(4);
  const ready = useMath();
  const lawSteps = [
    {
      label: "Sum Law",
      tex:
        "\\lim[f + g] = \\lim f + \\lim g = " + f + " + " + g + " = " + (f + g),
      note: "Proved from ε-δ: bound |f(x)+g(x)−L−M| ≤ |f(x)−L| + |g(x)−M| < ε.",
    },
    {
      label: "Product Law",
      tex:
        "\\lim[f \\cdot g] = \\lim f \\cdot \\lim g = " +
        f +
        " \\times " +
        g +
        " = " +
        f * g,
      note: "Proved by writing f(x)g(x)−LM = f(x)(g(x)−M) + M(f(x)−L) and bounding each piece.",
    },
    {
      label: "Quotient Law (g≠0)",
      tex:
        "\\lim[f / g] = \\lim f \\;/\\; \\lim g = " +
        f +
        " / " +
        g +
        " = " +
        (f / g).toFixed(4),
      note: "Requires lim g ≠ 0. If lim g = 0, the quotient law fails and the limit may not exist in the usual sense.",
    },
    {
      label: "Power Law",
      tex: "\\lim[f^n] = (\\lim f)^n = " + f + "^2 = " + f * f,
      note: "Follows from repeated application of the Product Law. lim[f²] = lim[f·f] = lim f · lim f = L².",
    },
  ];
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        padding: ".5rem 0",
        maxWidth: 740,
      }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 2)}
      {hook(
        "Albert wants to compute limits quickly, without the full ε-δ argument every time. He discovers that limits obey simple arithmetic laws — but only when both limits exist and are finite. Each law requires a proof.",
      )}
      <div style={panel}>
        {hdr(
          "Story",
          { background: "#eef2ff", color: "#3730a3" },
          "Getting closer",
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
            <em style={{ color: "var(--color-text-secondary)" }}>
              "If lim f = 3 and lim g = 4,"
            </em>{" "}
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            said,{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "can I just say lim(f+g) = 7?"
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            looked at him.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Can you? Or are you assuming you can?"
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            There was a pause.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Those are different questions,"
            </em>{" "}
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            said slowly.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "I need to prove each law separately. Then I can use them freely."
            </em>
          </p>
        </div>
      </div>
      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#eef2ff", color: "#3730a3" },
          "The four limit laws — each requires a proof",
        )}
        <div style={body}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {[
              ["lim f =", f, 1, 8, setF],
              ["lim g =", g, 1, 8, setG],
            ].map(([label, val, min, max, setter]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-secondary)",
                    minWidth: 52,
                  }}
                >
                  {label}
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={val}
                  step={1}
                  onChange={(e) => setter(parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 16 }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
          {lawSteps.map((s, i) => (
            <StepBlock
              key={i}
              num={i + 1}
              label={s.label}
              tex={s.tex}
              note={s.note}
              ready={ready}
            />
          ))}
          <div style={insight()}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              Why prove them?
            </strong>{" "}
            These laws are so convenient that students use them without
            thinking. But each has conditions: the Product Law requires both
            limits to be finite; the Quotient Law requires the denominator limit
            to be nonzero. The Chain Rule (Book 4) relies on the Product Law in
            its proof. Using a law you haven't proved is assuming the
            conclusion.
          </div>
          <WhyPanel
            tag="What happens when lim g = 0 in the Quotient Law?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              The Quotient Law fails. lim[f/g] cannot be computed as (lim
              f)/(lim g) = L/0 — that's undefined. The limit might still exist
              (via L'Hôpital or algebraic manipulation), might be infinite, or
              might not exist. The 0/0 case is what Chapter 3.5 is about.
            </p>
          </WhyPanel>
        </div>
      </div>
      {seed(
        <>
          <strong style={{ fontWeight: 500, color: "#b45309" }}>
            Coming next:
          </strong>{" "}
          John asks what happens at a "jump" in a function — where it teleports
          from one value to another. Albert explains continuity and shows that
          some jumps make limits fail entirely. Chapter 3:{" "}
          <em>The Infinite Staircase.</em>
        </>,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Ch3_3 — The Infinite Staircase (Continuity + IVT)
// ════════════════════════════════════════════════════════════════════════════
export function Ch3_3_InfiniteStaircase({ params = {} }) {
  const [x, setX] = useState(1.5);
  const ready = useMath();
  // step function: floor(x)
  const fval = Math.floor(x);
  const limit_exists = !Number.isInteger(x);

  const panel2 = panel;
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        padding: ".5rem 0",
        maxWidth: 740,
      }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 3)}
      {hook(
        "The harbor has a tide gauge that records only whole numbers — it jumps from 3m to 4m without any value in between. John asks: does the limit exist at the jump? Albert explains continuity — what it means for a function to have no gaps — and why the answer determines whether calculus can even be applied.",
      )}
      <div style={panel2}>
        {hdr(
          "Story",
          { background: "#eef2ff", color: "#3730a3" },
          "The infinite staircase",
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
            The tide gauge readout was a staircase: flat at 3 for twenty
            minutes, then an instantaneous jump to 4.{" "}
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            stared at it.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "What's the tide height at the exact moment of the jump?"
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            drew the step function on paper.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "That's a discontinuity. The limit from the left is 3. The limit
              from the right is 4. They disagree — so the limit at that point
              does not exist."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            looked up.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "And if you can't take the limit, you can't take the derivative.
              Which means you can't find the rate of change at that point."
            </em>{" "}
            Albert nodded.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Differentiability requires continuity. Continuity requires the
              limit to exist. It's a chain of requirements."
            </em>
          </p>
        </div>
      </div>
      <div style={panel2}>
        {hdr(
          "Discovery",
          { background: "#eef2ff", color: "#3730a3" },
          "Continuity — and what breaks it",
        )}
        <div style={body}>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
              marginBottom: 12,
            }}
          >
            Drag x through the integers. At non-integer points, the floor
            function is continuous — the limit exists and equals the function
            value. At integers, the left and right limits disagree —
            discontinuity.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <span
              style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
            >
              x
            </span>
            <input
              type="range"
              min={0.01}
              max={4.99}
              value={x}
              step={0.01}
              onChange={(e) => setX(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 220 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>
              {x.toFixed(2)}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {[
              ["f(x) = ⌊x⌋", fval, "var(--color-text-primary)"],
              [
                "lim exists?",
                limit_exists ? "Yes" : "No",
                limit_exists ? "#059669" : "#dc2626",
              ],
              [
                "Continuous?",
                limit_exists ? "Yes" : "No (jump)",
                limit_exists ? "#059669" : "#dc2626",
              ],
            ].map(([label, val, col]) => (
              <div
                key={label}
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: 8,
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-tertiary)",
                    marginBottom: 3,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 500, color: col }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
          {ready && (
            <div style={mbox}>
              <M
                t={`\\text{Continuity at } x_0:\\quad \\lim_{x\\to x_0}f(x) = f(x_0)`}
                display
                ready={ready}
              />
            </div>
          )}
          <div style={insight()}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              Three requirements for continuity at x₀:
            </strong>{" "}
            (1) f(x₀) must be defined. (2) the limit as x→x₀ of f(x) must exist.
            (3) They must be equal. Fail any one: discontinuity. A function is
            differentiable at x₀ only if it's continuous there — but continuity
            alone doesn't guarantee differentiability (|x| at x=0).
          </div>
          <WhyPanel
            tag="The Intermediate Value Theorem — why it needs continuity"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              IVT: if f is continuous on [a,b] and k is between f(a) and f(b),
              then f(c) = k for some c in (a,b). A continuous function can't
              jump over a value. A step function CAN jump over values — which is
              why IVT fails for discontinuous functions. IVT is used in the
              proof of the Fundamental Theorem of Calculus.
            </p>
            <WhyPanel
              tag="Why does IVT fail for rational numbers (ℚ)?"
              depth={1}
            >
              <p>
                f(x) = x² − 2 is continuous. f(1) = −1, f(2) = 2. By IVT over ℝ:
                f(c) = 0 for some c in (1,2) — namely c = √2. But √2 is
                irrational. Over ℚ, √2 doesn't exist, so the IVT fails. This is
                why calculus requires ℝ (complete) rather than ℚ (incomplete) —
                completeness guarantees that limits land somewhere.
              </p>
            </WhyPanel>
          </WhyPanel>
        </div>
      </div>
      {seed(
        <>
          <strong style={{ fontWeight: 500, color: "#b45309" }}>
            Coming next:
          </strong>{" "}
          Mic needs lim(sin x / x) as x→0 to compute the derivative of sine —
          but plugging in x=0 gives 0/0. Albert says the answer is 1, and proves
          it with a geometry argument that requires the squeeze theorem. Chapter
          4: <em>The Sine of Almost Nothing.</em>
        </>,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Ch3_4 — The Sine of Almost Nothing (lim sin x/x = 1)
// ════════════════════════════════════════════════════════════════════════════
export function Ch3_4_SineOfAlmostNothing({ params = {} }) {
  const [h, setH] = useState(0.5);
  const ready = useMath();
  const ratio = (Math.sin(h) / h).toFixed(6);
  const cosh = Math.cos(h).toFixed(4);

  const steps = [
    {
      label: "Area of triangle OAB (lower bound)",
      tex: "\\text{Area}_{\\triangle} = \\tfrac{1}{2}\\sin h",
      note: "The triangle with vertices at origin, (1,0), and (cos h, sin h). Base = 1, height = sin h.",
    },
    {
      label: "Area of sector OAB (middle)",
      tex: "\\text{Area}_{\\text{sector}} = \\tfrac{1}{2}h",
      note: "Sector area = ½r²θ = ½(1²)(h) = ½h. This formula only works in radians — that's why radians matter.",
    },
    {
      label: "Area of triangle OAT (upper bound)",
      tex: "\\text{Area}_{\\triangle OAT} = \\tfrac{1}{2}\\tan h",
      note: "The larger triangle with the tangent line. tan h = sin h / cos h.",
    },
    {
      label: "Divide by ½ sin h to get the squeeze",
      tex: "\\cos h < \\frac{\\sin h}{h} < 1",
      note: "As h→0, cos h→1 and 1→1. By the Squeeze Theorem, (sin h)/h → 1.",
    },
  ];

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        padding: ".5rem 0",
        maxWidth: 740,
      }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 4)}
      {hook(
        "Mic needs the derivative of sin — which requires knowing what (sin h)/h approaches as h→0. It's a 0/0 form. Albert proves it equals exactly 1 using a geometric inequality on the unit circle and the Squeeze Theorem. This single limit is the foundation of all trig calculus.",
      )}
      <div style={panel}>
        {hdr(
          "Story",
          { background: "#eef2ff", color: "#3730a3" },
          "The sine of almost nothing",
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
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> had
            reached the wall.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "To prove d/dx[sin x] = cos x from the definition, I need to
              evaluate lim(sin h / h) as h→0. But sin(0)/0 = 0/0."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            pulled out the unit circle diagram.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "We can't compute it directly. But we can trap it between two
              things that both go to 1."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            looked up from the corner.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Isn't (sin h)/h just approximately 1 for small h? Why prove it?"
            </em>{" "}
            Mic looked at him steadily.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Because approximately is not a proof. And if this limit were
              π/180 instead of 1 — which it would be in degrees — every trig
              derivative would be wrong by that factor forever."
            </em>
          </p>
        </div>
      </div>
      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#eef2ff", color: "#3730a3" },
          "The area squeeze — proving lim(sin h/h) = 1",
        )}
        <div style={body}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <span
              style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
            >
              h (radians)
            </span>
            <input
              type="range"
              min={0.01}
              max={1.5}
              value={h}
              step={0.01}
              onChange={(e) => setH(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 220 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 50 }}>
              {h.toFixed(2)} rad
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {[
              ["cos h (lower)", cosh, "#059669"],
              ["(sin h)/h", ratio, "#6366f1"],
              ["1 (upper)", "1.0000", "#d97706"],
            ].map(([label, val, col]) => (
              <div
                key={label}
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: 8,
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-tertiary)",
                    marginBottom: 3,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 500, color: col }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
          {steps.map((s, i) => (
            <StepBlock
              key={i}
              num={i + 1}
              label={s.label}
              tex={s.tex}
              note={s.note}
              ready={ready}
              col="#6366f1"
            />
          ))}
          <div style={insight()}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              Why this is load-bearing:
            </strong>{" "}
            The proof that d/dx[sin x] = cos x requires this limit in the final
            step. The companion limit lim((cos h−1)/h) = 0 follows from this one
            algebraically. Both are needed for the derivative of sin — and
            neither can be assumed.
          </div>
          <WhyPanel
            tag="Why does the area proof require radians specifically?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              The sector area formula Area = ½r²θ = ½h (for r=1) holds only when
              θ is in radians. In degrees: Area = ½r²·(θ°·π/180) = ½h·π/180. The
              squeeze would then give lim(sin h°/h°) = π/180 ≈ 0.01745. Every
              trig derivative would carry this factor — d/dx[sin x°] =
              (π/180)cos x°. Radians eliminate this permanently.
            </p>
          </WhyPanel>
        </div>
      </div>
      {seed(
        <>
          <strong style={{ fontWeight: 500, color: "#b45309" }}>
            Coming next:
          </strong>{" "}
          John tries to evaluate lim (x²−4)/(x−2) at x=2. He gets 0/0 and
          declares there's no answer. Mic shows him the form is indeterminate —
          not impossible. Chapter 5: <em>The Broken Function.</em>
        </>,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Ch3_5 — The Broken Function (Indeterminate Forms)
// ════════════════════════════════════════════════════════════════════════════
export function Ch3_5_BrokenFunction({ params = {} }) {
  const [xval, setXval] = useState(2.5);
  const ready = useMath();
  const frac = xval === 2 ? "0/0" : ((xval * xval - 4) / (xval - 2)).toFixed(4);
  const simplified = xval === 2 ? "4" : (xval + 2).toFixed(4);

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        padding: ".5rem 0",
        maxWidth: 740,
      }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 5)}
      {hook(
        "John tries to evaluate (x²−4)/(x−2) at x=2. He gets 0/0 and declares it impossible. Mic factors the numerator and shows the function is perfectly well-behaved near x=2 — the 0/0 is a removable discontinuity, not a dead end. 0/0 is indeterminate, not undefined.",
      )}
      <div style={panel}>
        {hdr(
          "Story",
          { background: "#eef2ff", color: "#3730a3" },
          "The broken function",
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
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span> had
            written{" "}
            <span
              style={{
                background: "var(--color-background-secondary)",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              limit as x→2 of (x²−4)/(x−2)
            </span>{" "}
            on the board and crossed it out.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "It's 0/0 at x=2. No answer."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            looked at it.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Factor the top."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "x²−4 = (x−2)(x+2). So the fraction is (x−2)(x+2)/(x−2) = x+2."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "But at x=2 you divided by zero."
            </em>{" "}
            Mic shook his head.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "In the limit, we never reach x=2. We only approach it. So
              (x−2)/(x−2) = 1 for every x near 2 — just not at 2. The limit is
              4."
            </em>
          </p>
        </div>
      </div>
      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#eef2ff", color: "#3730a3" },
          "Indeterminate ≠ impossible — factoring reveals the limit",
        )}
        <div style={body}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <span
              style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
            >
              x
            </span>
            <input
              type="range"
              min={0.1}
              max={4}
              value={xval}
              step={0.01}
              onChange={(e) => setXval(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 220 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>
              {xval.toFixed(2)}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {[
              [
                "(x²−4)/(x−2)",
                frac,
                xval === 2 ? "#dc2626" : "var(--color-text-primary)",
              ],
              ["x+2 (simplified)", simplified, "#059669"],
            ].map(([label, val, col]) => (
              <div
                key={label}
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: 8,
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-tertiary)",
                    marginBottom: 3,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 500, color: col }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
          {ready && (
            <div style={mbox}>
              <M
                t={`\\lim_{x\\to 2}\\frac{x^2-4}{x-2} = \\lim_{x\\to 2}\\frac{(x-2)(x+2)}{x-2} = \\lim_{x\\to 2}(x+2) = 4`}
                display
                ready={ready}
              />
            </div>
          )}
          <div style={insight()}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              0/0 is indeterminate, not impossible.
            </strong>{" "}
            It means "we need more information." Depending on how fast the top
            and bottom approach 0, the limit could be any number, infinite, or
            nonexistent. Factoring, multiplying by conjugates, and L'Hôpital's
            Rule (Book 4, Ch 4.5) are the tools for resolving 0/0.
          </div>
          <WhyPanel
            tag="What's the difference between undefined and indeterminate?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              Undefined: no value is possible. 1/0 is undefined — no number
              multiplied by 0 gives 1. The expression has no meaning.
            </p>
            <p>
              Indeterminate: the value exists but can't be determined from the
              form alone. 0/0 could be 1 (lim x/x), 0 (lim x²/x = lim x), ∞ (lim
              1/x²·x = lim 1/x), or anything else. The form doesn't tell you the
              limit — you need more work.
            </p>
          </WhyPanel>
        </div>
      </div>
      {seed(
        <>
          <strong style={{ fontWeight: 500, color: "#b45309" }}>
            Coming next:
          </strong>{" "}
          Mic connects everything: average speed, shrinking intervals, limits,
          and the slope of a curve. He writes the definition of the derivative —
          and recognizes it as the same limit idea they've been using all along.
          Chapter 6: <em>The Bridge to Calculus.</em>
        </>,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Ch3_6 — The Bridge to Calculus (Derivative Definition Preview)
// ════════════════════════════════════════════════════════════════════════════
export function Ch3_6_BridgeToCalculus({ params = {} }) {
  const [dx, setDx] = useState(1.0);
  const ready = useMath();
  const x0 = 2;
  // f(x) = x^2 + 1
  const f = (x) => x * x + 1;
  const slope = (f(x0 + dx) - f(x0)) / dx;
  const trueSlope = 2 * x0; // derivative of x^2+1 at x=2

  const steps = [
    {
      label: "Start with average rate of change",
      tex: "\\frac{f(x+h)-f(x)}{h} = \\frac{(x+h)^2+1-(x^2+1)}{h}",
      note: "This is the slope of the secant line — the line through two points on the curve.",
    },
    {
      label: "Expand and cancel",
      tex: "= \\frac{x^2+2xh+h^2+1-x^2-1}{h} = \\frac{2xh+h^2}{h} = 2x+h",
      note: "The h in the denominator cancels with an h from every term in the numerator. This only works because h ≠ 0 in the limit.",
    },
    {
      label: "Take the limit as h→0",
      tex: "f'(x) = \\lim_{h\\to 0}(2x+h) = 2x",
      note: "As h→0, the h term vanishes. The derivative of x²+1 is 2x — the slope at any point x.",
    },
    {
      label: "At x = 2 specifically",
      tex: "f'(2) = 2(2) = 4 \\text{ m/s}",
      note: "This is the instantaneous speed of John's cart at t=2 seconds. The answer Mic has been seeking since Chapter 3.1.",
    },
  ];

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        padding: ".5rem 0",
        maxWidth: 740,
      }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 6)}
      {hook(
        "Mic has all the tools: limits, continuity, the algebra of 0/0. Now he puts them together. The derivative is the limit of the average rate of change as the interval shrinks to zero. It's the slope of the curve at a single point. And for f(x) = x²+1, it gives the exact answer John wanted in Chapter 3.1.",
      )}
      <div style={panel}>
        {hdr(
          "Story",
          { background: "#eef2ff", color: "#3730a3" },
          "The bridge to calculus",
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
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> had
            three pages of notes in front of him. Limits. Continuity. The
            algebra for removing 0/0. The sine limit. All separate tools.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "They all point to the same thing."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            looked at the notes.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "The derivative."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "The instantaneous rate of change. The slope at a single point.
              The limit of the difference quotient."
            </em>{" "}
            Mic wrote it on the board.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "It's the same operation we've been building toward since Chapter
              1.4."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            looked at the board.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "And this tells me exactly how fast the cart was going at the
              fence?"
            </em>{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>"Exactly,"</em>{" "}
            Mic said.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Not approximately. Exactly."
            </em>
          </p>
        </div>
      </div>
      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#eef2ff", color: "#3730a3" },
          "The derivative — built from everything in Books 1 through 3",
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
            f(x) = x²+1 — John's cart position. Drag h toward 0 and watch the
            secant slope converge to the tangent slope = 4 at x = 2.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <span
              style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
            >
              h (interval)
            </span>
            <input
              type="range"
              min={0.01}
              max={2}
              value={dx}
              step={0.01}
              onChange={(e) => setDx(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 220 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 50 }}>
              {dx.toFixed(2)}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {[
              ["Secant slope", slope.toFixed(4), "#6366f1"],
              ["True slope f′(2)", trueSlope, "#059669"],
              ["Error", Math.abs(slope - trueSlope).toFixed(4), "#d97706"],
            ].map(([label, val, col]) => (
              <div
                key={label}
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: 8,
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-tertiary)",
                    marginBottom: 3,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 500, color: col }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
          {steps.map((s, i) => (
            <StepBlock
              key={i}
              num={i + 1}
              label={s.label}
              tex={s.tex}
              note={s.note}
              ready={ready}
              col="#6366f1"
            />
          ))}
          <div style={insight()}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              What just happened:
            </strong>{" "}
            Three books of mathematics converged on a single formula. The
            slope-as-limit idea (Book 1), the radian/trig prerequisites (Book
            2), the limit machinery (Book 3) — all of it was preparation for
            this moment. In Book 4, we prove every major differentiation rule
            from this definition.
          </div>
          <WhyPanel
            tag="Why do we need all of Books 1–3 to get here?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              The derivative of sin x requires: the angle addition formula (Book
              2, Ch 2.4), the limit lim(sin h)/h = 1 (Book 3, Ch 3.4), and the
              limit laws (Book 3, Ch 3.2). Without those, the proof is
              impossible. The derivative of x³ requires the Binomial Theorem
              (Book 1, Ch 1.5). Every rule in Book 4 has dependencies that reach
              back through the series.
            </p>
          </WhyPanel>
        </div>
      </div>
      <div
        style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderTop: "2px solid #059669",
          borderRadius: "0 0 10px 10px",
          padding: "14px 16px",
          fontSize: 13,
          color: "var(--color-text-secondary)",
          lineHeight: 1.65,
        }}
      >
        <strong style={{ fontWeight: 500, color: "#059669" }}>
          Book 3 complete. Books 1 through 3 complete.
        </strong>{" "}
        Mic has the definition of the derivative. Albert knows where it comes
        from. John has finally found out exactly how fast his cart was going. In
        Book 4, they prove every differentiation rule from scratch — starting
        with the problem that began the whole series: h(x) = sin(x³).
      </div>
    </div>
  );
}
