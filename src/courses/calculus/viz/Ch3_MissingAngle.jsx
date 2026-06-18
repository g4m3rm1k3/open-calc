/**
 * Ch3_MissingAngle.jsx
 * Book 1, Chapter 3 — "The Missing Angle"
 * Topic: Linear equations, variables as placeholders, intro to trig ratios
 *
 * Drop into: src/components/viz/react/Ch3_MissingAngle.jsx
 * Register:  VizFrame.jsx → Ch3_MissingAngle: lazy(() => import('./react/Ch3_MissingAngle.jsx'))
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
    { border: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" },
    { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" },
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

function TriangleCanvas({ angleDeg, hypotenuse = 130 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const rad = (angleDeg * Math.PI) / 180;
    const opp = hypotenuse * Math.sin(rad);
    const adj = hypotenuse * Math.cos(rad);
    const scale = Math.min(300 / adj, 180 / opp, 1.2);
    const ps = adj * scale,
      po = opp * scale;
    const ox = 80,
      oy = H - 40;

    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + ps, oy);
    ctx.lineTo(ox + ps, oy - po);
    ctx.closePath();
    ctx.fillStyle = isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)";
    ctx.fill();
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 2;
    ctx.stroke();

    // right angle marker
    ctx.beginPath();
    ctx.moveTo(ox + ps - 12, oy);
    ctx.lineTo(ox + ps - 12, oy - 12);
    ctx.lineTo(ox + ps, oy - 12);
    ctx.strokeStyle = isDark ? "#6b7280" : "#9ca3af";
    ctx.lineWidth = 1;
    ctx.stroke();

    // angle arc
    ctx.beginPath();
    ctx.arc(ox, oy, 28, -rad, 0);
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = isDark ? "#c4b5fd" : "#5b21b6";
    ctx.font = "bold 13px var(--font-sans, sans-serif)";
    ctx.textAlign = "left";
    ctx.fillText(angleDeg + "°", ox + 34, oy - 8);

    ctx.fillStyle = isDark ? "#e2e8f0" : "#374151";
    ctx.font = "12px var(--font-sans, sans-serif)";
    ctx.textAlign = "center";
    ctx.fillText("adjacent = " + adj.toFixed(1), ox + ps / 2, oy + 18);
    ctx.fillText("opposite = " + opp.toFixed(1), ox + ps + 52, oy - po / 2);
    ctx.save();
    ctx.translate((ox + ox + ps + ps + oy + oy - po) / 4, (oy + oy - po) / 2);
    ctx.rotate(-rad / 2);
    ctx.fillText("hyp = " + hypotenuse, 0, -8);
    ctx.restore();
  }, [angleDeg, hypotenuse]);

  return (
    <canvas
      ref={ref}
      width={640}
      height={220}
      style={{ width: "100%", borderRadius: 8, display: "block" }}
    />
  );
}

export default function Ch3_MissingAngle({ params = {} }) {
  const [angle, setAngle] = useState(52);
  const ready = useMath();
  const rad = (angle * Math.PI) / 180;
  const h = 130;
  const opp = (h * Math.sin(rad)).toFixed(1);
  const adj = (h * Math.cos(rad)).toFixed(1);
  const sinVal = Math.sin(rad).toFixed(4);
  const beamLen = (parseFloat(opp) / parseFloat(sinVal)).toFixed(1);

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
    borderLeft: "3px solid #7c3aed",
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

  const eqSteps = [
    {
      label: "Write the equation",
      tex: `\\sin(${angle}°) \\times h = \\text{opposite side}`,
      note: "Sin of the angle times the hypotenuse gives the opposite side length.",
    },
    {
      label: "Substitute the known value of sin",
      tex: `${sinVal} \\times h = \\text{opposite}`,
      note: `sin(${angle}°) ≈ ${sinVal} — looked up from a trig table or calculator.`,
    },
    {
      label: "Set opposite = required length",
      tex: `${sinVal} \\times h = ${opp}`,
      note: `The spec requires the opposite side to be ${opp} mm. Now one equation, one unknown.`,
    },
    {
      label: "Divide both sides by sin(θ)",
      tex: `h = \\frac{${opp}}{${sinVal}} = ${beamLen} \\text{ mm}`,
      note: `Dividing isolates h. The beam must be cut to ${beamLen} mm.`,
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
        Book 1 · Chapter 3
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
          John's rope bridge needs a diagonal support beam at exactly 52°. The
          protractor is broken. Mic has only a tape measure and three known
          lengths. Albert says the angle is hiding inside the lengths — you just
          have to know how to look.
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Story",
          { background: "#ede9fe", color: "#5b21b6" },
          "The missing angle",
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
            The protractor had snapped in half.{" "}
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span> held
            the two pieces up sadly.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Well. That happened."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            examined the beam spec. The angle had to be exactly{" "}
            <span
              style={{
                background: "var(--color-background-secondary)",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              52°
            </span>
            . Without a protractor, how do you cut to 52°?
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            was looking at his notebook.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "You don't need a protractor. You need three lengths. Every angle
              corresponds to exactly one ratio of sides — the ratio IS the
              angle, just written differently."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            looked up.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "So if we set up the right triangle with the right sides, the beam
              will automatically be at the right angle. No protractor needed."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Exactly. But first,"
            </em>{" "}
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            said,{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "you need to understand what an unknown actually is."
            </em>
          </p>
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#ede9fe", color: "#5b21b6" },
          "A variable is a placeholder for something real",
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
            Albert's insight: instead of saying "I don't know the beam length,"
            write it as h. The letter isn't mysterious — it represents a
            specific number we'll find by reasoning. Adjust the angle and watch
            every side length update automatically.
          </p>

          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <TriangleCanvas angleDeg={angle} hypotenuse={h} />
          </div>

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
              Target angle
            </span>
            <input
              type="range"
              min={10}
              max={80}
              value={angle}
              step={1}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              style={{ flex: 1, maxWidth: 220 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 30 }}>
              {angle}°
            </span>
          </div>

          <div style={mbox}>
            {ready && (
              <M
                t={`\\sin(${angle}°) = \\frac{\\text{opposite}}{\\text{hypotenuse}} = \\frac{${opp}}{${h}} = ${sinVal}`}
                display
                ready={ready}
              />
            )}
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              margin: "14px 0 8px",
            }}
          >
            Solve for beam length h — given a required opposite side:
          </div>

          {eqSteps.map((step, i) => (
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
                    background: "#7c3aed",
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
              The key idea:
            </strong>{" "}
            A variable like h isn't unknowable — it's a placeholder for a number
            we isolate using the balance principle. Every step preserves
            equality by doing the same operation to both sides.
          </div>

          <WhyPanel tag="What does 'solving for h' actually mean?" depth={0}>
            <p style={{ marginBottom: 8 }}>
              An equation is a statement that two expressions are equal.
              "Solving for h" means rewriting until it says h = (some number) —
              h alone on one side. Every step is an allowed operation that
              preserves equality.
            </p>
            <p style={{ marginBottom: 8 }}>
              The allowed operations: add the same thing to both sides, subtract
              the same thing, multiply both sides by the same non-zero number,
              divide both sides by the same non-zero number. That's it — those
              four operations cover everything in algebra.
            </p>
            <WhyPanel tag="Why can't you divide by zero?" depth={1}>
              <p style={{ marginBottom: 8 }}>
                If 6 = 6 and we divide both by 3: 2 = 2. ✓ If we divide by 0:
                6/0 = 6/0. But 6/0 is undefined — no number when multiplied by 0
                gives 6. Division by zero breaks arithmetic and allows false
                "proofs" like 1 = 2. The field axioms explicitly exclude it.
              </p>
            </WhyPanel>
          </WhyPanel>

          <WhyPanel
            tag="Why does sin(angle) give the ratio — where does that come from?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              Sin, cos, and tan are defined by the unit circle — a circle of
              radius 1. For angle θ, the point on the unit circle has
              coordinates (cos θ, sin θ). In a right triangle with hypotenuse h:
              opposite = h·sin θ and adjacent = h·cos θ. This comes from scaling
              the unit circle point by h.
            </p>
            <p>
              So sin θ = opposite/hypotenuse by definition. The ratio and the
              angle contain exactly the same information — one is just a
              different representation of the other. We prove this geometrically
              in Book 2.
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
        John builds a ramp for his cart. The cart keeps sliding back. Making it
        steeper makes it fall over. What is the right steepness — and what does
        slope actually measure? Chapter 4: <em>The Ramp That Fought Back.</em>
      </div>
    </div>
  );
}
