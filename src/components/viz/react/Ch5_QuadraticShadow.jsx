/**
 * Ch5_QuadraticShadow.jsx
 * Book 1, Chapter 5 — "The Quadratic Shadow"
 * Topic: Quadratic equations, completing the square derived geometrically, two solutions
 *
 * Drop into: src/components/viz/react/Ch5_QuadraticShadow.jsx
 * Register:  VizFrame.jsx → Ch5_QuadraticShadow: lazy(() => import('./react/Ch5_QuadraticShadow.jsx'))
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
    { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" },
    { border: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" },
    { border: "#059669", bg: "#ecfdf5", text: "#047857" },
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

function ParabolaCanvas({ target }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const ox = 60,
      oy = H - 30,
      xscale = 38,
      yscale = 5;

    // grid
    ctx.strokeStyle = isDark ? "#374151" : "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= 12; x += 2) {
      ctx.beginPath();
      ctx.moveTo(ox + x * xscale, 20);
      ctx.lineTo(ox + x * xscale, oy);
      ctx.stroke();
    }
    for (let y = 0; y <= 35; y += 5) {
      ctx.beginPath();
      ctx.moveTo(ox, oy - y * yscale);
      ctx.lineTo(ox + 12 * xscale, oy - y * yscale);
      ctx.stroke();
    }

    // parabola: y = x² + 3x - 10
    ctx.beginPath();
    let first = true;
    for (let x = 0; x <= 12; x += 0.05) {
      const y = x * x + 3 * x - 10;
      if (y < 0 || y > 40) continue;
      const px = ox + x * xscale,
        py = oy - y * yscale;
      first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      first = false;
    }
    ctx.strokeStyle = "#0891b2";
    ctx.lineWidth = 2;
    ctx.stroke();

    // target line
    ctx.beginPath();
    ctx.moveTo(ox, oy - target * yscale);
    ctx.lineTo(ox + 12 * xscale, oy - target * yscale);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // intersection dots
    const disc = 9 + 4 * (target + 10);
    if (disc >= 0) {
      const x1 = (-3 + Math.sqrt(disc)) / 2;
      const x2 = (-3 - Math.sqrt(disc)) / 2;
      [x1, x2].forEach((x) => {
        if (x >= 0 && x <= 12) {
          ctx.beginPath();
          ctx.arc(ox + x * xscale, oy - target * yscale, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "#ef4444";
          ctx.fill();
        }
      });
    }

    // axis labels
    ctx.fillStyle = isDark ? "#9ca3af" : "#6b7280";
    ctx.font = "11px var(--font-sans, sans-serif)";
    ctx.textAlign = "left";
    ctx.fillText("shadow length (m)", 4, 18);
    ctx.fillText("hours after noon", ox + 12 * xscale - 110, oy + 16);

    // target label
    ctx.fillStyle = "#ef4444";
    ctx.textAlign = "right";
    ctx.fillText(target.toFixed(1) + " m", ox - 4, oy - target * yscale + 4);
  }, [target]);

  return (
    <canvas
      ref={ref}
      width={640}
      height={200}
      style={{ width: "100%", borderRadius: 8, display: "block" }}
    />
  );
}

const CTS_STEPS = [
  {
    label: "Write the equation",
    tex: "x^2 + 3x - 24 = 0 \\implies x^2 + 3x = 24",
    note: "Move the constant to the right side. The x² + 3x side is what we need to make a perfect square.",
  },
  {
    label: "Find the completing term: (b/2)²",
    tex: "\\left(\\frac{3}{2}\\right)^2 = 2.25",
    note: "Take half the coefficient of x (which is 3), then square it. Geometrically: this is the missing corner square.",
  },
  {
    label: "Add 2.25 to both sides",
    tex: "x^2 + 3x + 2.25 = 24 + 2.25 = 26.25",
    note: "Same number added to both sides — equality preserved. Now the left side is a perfect square.",
  },
  {
    label: "Factor the left side",
    tex: "(x + 1.5)^2 = 26.25",
    note: "x² + 3x + 2.25 = (x + 1.5)². This works because of the completing term we added.",
  },
  {
    label: "Take the square root of both sides",
    tex: "x + 1.5 = \\pm\\sqrt{26.25} \\approx \\pm 5.123",
    note: "Square root gives ±. Both +5.123 and −5.123 are valid — two solutions.",
  },
  {
    label: "Solve for x",
    tex: "x = -1.5 + 5.123 \\approx 3.62 \\quad \\text{or} \\quad x = -1.5 - 5.123 \\approx -6.62",
    note: "x ≈ 3.62 hours after noon (≈ 3:37pm) the shadow reaches 14m. x ≈ −6.62 is before sunrise — not physically relevant.",
  },
];

export default function Ch5_QuadraticShadow({ params = {} }) {
  const [target, setTarget] = useState(14);
  const ready = useMath();
  const disc = 9 + 4 * (target + 10);
  const x1 = disc >= 0 ? ((-3 + Math.sqrt(disc)) / 2).toFixed(2) : null;

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
  const insight = {
    padding: "12px 14px",
    borderLeft: "3px solid #0891b2",
    background: "var(--color-background-secondary)",
    borderRadius: "0 8px 8px 0",
    fontSize: 13,
    color: "var(--color-text-secondary)",
    lineHeight: 1.65,
    margin: "10px 0",
  };
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
        Book 1 · Chapter 5
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
          Albert is trying to predict exactly when the shadow of the harbor
          lighthouse will fall on a specific spot. The shadow length follows a
          quadratic equation — it curves. Solving it requires a technique Albert
          calls "completing the square," which turns out to be a geometric idea.
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Story",
          { background: "#ecfeff", color: "#155e75" },
          "The quadratic shadow",
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
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            had been watching the shadow for two hours. His table of
            measurements showed a curve, not a line — at 2pm the shadow was
            growing twice as fast as at noon.
          </p>
          <p style={{ marginBottom: 12 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "It's a parabola,"
            </em>{" "}
            he said.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "The equation has an x-squared term. I need to find when the
              shadow equals exactly 14 metres — that's when it reaches the
              sundial in the corner of the yard."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            looked at the equation Albert had written:{" "}
            <span
              style={{
                background: "var(--color-background-secondary)",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              x² + 3x − 10 = 14
            </span>
            .{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Why can't you just move the 14 over and solve it like a normal
              equation?"
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "I can move it over. That gives x² + 3x − 24 = 0. The problem is
              the x-squared. When there are two different powers of x, dividing
              doesn't isolate x — you need a different technique."
            </em>{" "}
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            pulled out paper.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Let's derive it from scratch."
            </em>
          </p>
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#ecfeff", color: "#155e75" },
          "Completing the square — a geometric argument",
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
            The technique called "completing the square" has a literal geometric
            meaning. x² + 3x represents an x-by-x square plus a 3-by-x
            rectangle. To "complete" the square means adding the missing corner
            piece — making the whole thing a perfect square we can take the root
            of.
          </p>

          {CTS_STEPS.map((step, i) => (
            <div
              key={i}
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
                    background: "#0891b2",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {step.label}
                </span>
              </div>
              <div
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: 6,
                  padding: 10,
                  textAlign: "center",
                  overflowX: "auto",
                  marginBottom: 6,
                }}
              >
                {ready && <M t={step.tex} display ready={ready} />}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
              >
                {step.note}
              </div>
            </div>
          ))}

          <div style={insight}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              The quadratic formula
            </strong>{" "}
            is just these steps done once, generally, for ax² + bx + c = 0.
            Memorizing the formula is fine — but knowing it comes from a literal
            geometric square means you can re-derive it from scratch if you
            forget it.
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              margin: "14px 0 8px",
            }}
          >
            Explore the shadow parabola (y = x² + 3x − 10):
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
              Target length (m)
            </span>
            <input
              type="range"
              min={5}
              max={30}
              value={target}
              step={0.5}
              onChange={(e) => setTarget(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 200 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>
              {target.toFixed(1)} m
            </span>
          </div>

          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <ParabolaCanvas target={target} />
          </div>

          <div style={mbox}>
            {ready && x1 && parseFloat(x1) >= 0 && (
              <M
                t={`x^2 + 3x - 10 = ${target} \\implies x \\approx ${x1} \\text{ hours after noon}`}
                display
                ready={ready}
              />
            )}
            {(!x1 || parseFloat(x1) < 0) && (
              <span
                style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
              >
                No positive solution — shadow never reaches {target.toFixed(1)}{" "}
                m in daylight
              </span>
            )}
          </div>

          <WhyPanel tag="Why can a quadratic have two solutions?" depth={0}>
            <p style={{ marginBottom: 8 }}>
              When you take a square root, you get ±: √9 = +3 or −3, because 3²
              = 9 and (−3)² = 9. In the quadratic formula, the ± appears from
              √(b²−4ac).
            </p>
            <p style={{ marginBottom: 8 }}>
              Geometrically: a horizontal line can cross a parabola at zero,
              one, or two points. Two solutions means the target shadow length
              is reached twice — once while the shadow is growing (afternoon),
              once while it's shrinking (if applicable).
            </p>
            <p>
              In this problem: x ≈ 3.62 (≈ 3:37pm, shadow growing to 14m) and x
              ≈ −6.62 (before sunrise — physically impossible). Both are
              mathematically valid; only one makes physical sense.
            </p>
          </WhyPanel>

          <WhyPanel
            tag="What if b²−4ac is negative? (the discriminant)"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              If b²−4ac &lt; 0, then √(b²−4ac) is the square root of a negative
              — no real solution exists. Geometrically: the parabola never
              reaches the target line. The target shadow length is physically
              impossible.
            </p>
            <p style={{ marginBottom: 8 }}>
              Example: asking for a 100m shadow from a 12m lighthouse when the
              sun hasn't set yet. The math correctly tells you it can't happen.
            </p>
            <p>
              In later mathematics, √(−1) = i defines imaginary numbers —
              essential in electrical engineering and Euler's formula (e^(iπ) +
              1 = 0), which we encounter in Book 5.
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
        The harbor has two water tanks. One is filling, one is draining. When do
        they equalize? Two unknowns — well, one unknown but two equations.
        That's a system, and it needs a new strategy. Chapter 6:{" "}
        <em>Two Tanks, One Valve.</em>
      </div>
    </div>
  );
}
