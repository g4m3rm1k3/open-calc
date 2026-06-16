/**
 * Ch4_RampSlope.jsx
 * Book 1, Chapter 4 — "The Ramp That Fought Back"
 * Topic: Slope as rise/run, scale invariance, preview of derivative
 *
 * Drop into: src/components/viz/react/Ch4_RampSlope.jsx
 * Register:  VizFrame.jsx → Ch4_RampSlope: lazy(() => import('./react/Ch4_RampSlope.jsx'))
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
    { border: "#d97706", bg: "#fffbeb", text: "#92400e" },
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
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function RampCanvas({ rise, run }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const slope = rise / run;
    const maxRun = 340,
      maxRise = 160;
    const scale = Math.min(maxRun / run, maxRise / rise);
    const pRise = rise * scale,
      pRun = run * scale;
    const ox = 80,
      oy = H - 45;

    // triangle fill
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + pRun, oy);
    ctx.lineTo(ox + pRun, oy - pRise);
    ctx.closePath();
    ctx.fillStyle = isDark ? "rgba(217,119,6,0.15)" : "rgba(217,119,6,0.1)";
    ctx.fill();

    // hypotenuse (the ramp)
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + pRun, oy - pRise);
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // base and height
    ctx.strokeStyle = isDark ? "#6b7280" : "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + pRun, oy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox + pRun, oy);
    ctx.lineTo(ox + pRun, oy - pRise);
    ctx.stroke();

    // right angle
    ctx.beginPath();
    ctx.moveTo(ox + pRun - 10, oy);
    ctx.lineTo(ox + pRun - 10, oy - 10);
    ctx.lineTo(ox + pRun, oy - 10);
    ctx.stroke();

    // angle arc
    const ang = Math.atan2(rise, run);
    ctx.beginPath();
    ctx.arc(ox, oy, 30, -ang, 0);
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = isDark ? "#fbbf24" : "#92400e";
    ctx.font = "12px var(--font-sans, sans-serif)";
    ctx.textAlign = "center";
    ctx.fillText(((ang * 180) / Math.PI).toFixed(1) + "°", ox + 46, oy - 12);
    ctx.fillText("run = " + run.toFixed(1) + " m", ox + pRun / 2, oy + 18);
    ctx.fillText(
      "rise = " + rise.toFixed(1) + " m",
      ox + pRun + 50,
      oy - pRise / 2,
    );

    // safety color band at top
    const safe = slope <= 0.5;
    const warn = slope <= 0.8;
    const col = safe ? "#059669" : warn ? "#d97706" : "#dc2626";
    ctx.fillStyle = col;
    ctx.font = "bold 12px var(--font-sans, sans-serif)";
    ctx.textAlign = "left";
    ctx.fillText(
      safe
        ? "Safe (slope ≤ 0.5)"
        : warn
          ? "Steep — may slide on wet days"
          : "Too steep — will slide",
      ox,
      22,
    );
  }, [rise, run]);

  return (
    <canvas
      ref={ref}
      width={640}
      height={220}
      style={{ width: "100%", borderRadius: 8, display: "block" }}
    />
  );
}

export default function Ch4_RampSlope({ params = {} }) {
  const [rise, setRise] = useState(1.5);
  const [run, setRun] = useState(3.0);
  const ready = useMath();
  const slope = rise / run;
  const slopeStr = slope.toFixed(3);
  const angDeg = ((Math.atan2(rise, run) * 180) / Math.PI).toFixed(1);

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
    borderLeft: "3px solid #d97706",
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
        Book 1 · Chapter 4
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
          John builds a ramp for his cart. The cart slides back. He makes it
          steeper. It falls over. Mic asks: what is steepness, really — and why
          is rise/run the right way to measure it, not rise alone or run alone?
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Story",
          { background: "#fffbeb", color: "#92400e" },
          "The ramp that fought back",
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
            The cart had rolled back again.{" "}
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            stood at the bottom of the ramp watching it come to rest against the
            fence. This was the fourth time.
          </p>
          <p style={{ marginBottom: 12 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "The problem,"
            </em>{" "}
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> said,{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "is that you keep changing the height without thinking about the
              length. Steepness isn't height — it's the ratio of height to
              horizontal distance."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            frowned.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Rise over run. I know that."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Do you know why that specific ratio? Why not run over rise? Why
              not just height?"
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            was already beside the ramp with a tape measure.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Because we want a number that stays the same no matter how long
              the ramp is. A ramp twice as long with twice the rise is the same
              steepness — and rise/run captures that. Let me show you."
            </em>
          </p>
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#fffbeb", color: "#92400e" },
          "Why rise/run — the invariance argument",
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
            A good measure of steepness should be scale-invariant — a longer
            version of the same ramp has the same slope number. Albert shows
            that rise/run is the only simple combination of rise and run with
            this property.
          </p>

          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <RampCanvas rise={rise} run={run} />
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
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                minWidth: 60,
              }}
            >
              Rise (m)
            </span>
            <input
              type="range"
              min={0.5}
              max={4}
              value={rise}
              step={0.1}
              onChange={(e) => setRise(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 200 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 36 }}>
              {rise.toFixed(1)}
            </span>
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
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                minWidth: 60,
              }}
            >
              Run (m)
            </span>
            <input
              type="range"
              min={1}
              max={8}
              value={run}
              step={0.1}
              onChange={(e) => setRun(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 200 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 36 }}>
              {run.toFixed(1)}
            </span>
          </div>

          <div style={mbox}>
            {ready && (
              <M
                t={`\\text{slope} = \\frac{\\text{rise}}{\\text{run}} = \\frac{${rise.toFixed(1)}}{${run.toFixed(1)}} = ${slopeStr} \\qquad \\text{angle} = ${angDeg}°`}
                display
                ready={ready}
              />
            )}
          </div>

          <div
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 10,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
              }}
            >
              Doubling the ramp — same steepness, same slope number:
            </div>
            <div style={mbox}>
              {ready && (
                <M
                  t={`\\frac{${rise.toFixed(1)}}{${run.toFixed(1)}} = \\frac{2 \\times ${rise.toFixed(1)}}{2 \\times ${run.toFixed(1)}} = \\frac{${(2 * rise).toFixed(1)}}{${(2 * run).toFixed(1)}} = ${slopeStr} \\quad \\checkmark`}
                  display
                  ready={ready}
                />
              )}
            </div>
          </div>

          <div style={insight}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              Scale invariance:
            </strong>{" "}
            rise/run = (k·rise)/(k·run) = rise/run for any scale factor k. The
            ratio absorbs the scaling. Adding rise + run would give a different
            number for a longer ramp at the same steepness — it fails the
            invariance test.
          </div>

          <WhyPanel tag="Why is slope also the tangent of the angle?" depth={0}>
            <p style={{ marginBottom: 8 }}>
              From Chapter 3: tan(θ) = opposite/adjacent. In the ramp triangle:
              opposite = rise, adjacent = run. So tan(θ) = rise/run = slope.
              Slope and angle are two names for the same thing — one is a ratio,
              one is a degree measurement.
            </p>
            <p>
              Engineers usually prefer slope because it's exact arithmetic.
              arctan requires a calculator. For ramp safety, slope ≤ 0.5 is the
              standard guideline (equivalent to ≤ 26.6°).
            </p>
          </WhyPanel>

          <WhyPanel tag="What does negative slope mean?" depth={0}>
            <p style={{ marginBottom: 8 }}>
              Slope is signed. Positive slope: line goes up moving right (rise
              &gt; 0). Negative slope: line goes down (rise &lt; 0, or the ramp
              descends). A slope of −0.5 is the same physical steepness as +0.5,
              just in the other direction.
            </p>
            <p>
              Slope of 0 = perfectly flat. Undefined slope = vertical line — run
              = 0, which would require dividing by zero. A vertical ramp is a
              wall, and walls have no slope in the usual sense. This connects to
              the singularity we'll see in Book 4 when differentiating vertical
              tangent lines.
            </p>
          </WhyPanel>

          <WhyPanel
            tag="What does slope have to do with calculus? (preview)"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              For a straight ramp, slope = rise/run is constant everywhere. But
              what about a curved road? The slope changes at every single point
              — the ramp is steeper at the bottom and shallower at the top, or
              vice versa.
            </p>
            <p style={{ marginBottom: 8 }}>
              Calculus answers: what is the slope at exactly one point on a
              curve? It shrinks the run to an infinitesimally small interval and
              asks what the ratio rise/run approaches. That limit is called the
              derivative — the slope of the curve at a single point.
            </p>
            <p>
              Mic noticed this at the end of Chapter 1, looking at the curved
              hull with no formula. This straight-line slope concept is the
              foundation that the derivative is built on. Book 3 and 4 are the
              continuation of this exact question.
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
        Albert wants to predict exactly when the shadow of the harbor lighthouse
        will fall on a specific spot. The relationship isn't linear — it curves.
        And a curved equation needs a completely different kind of solution.
        Chapter 5: <em>The Quadratic Shadow.</em>
      </div>
    </div>
  );
}
