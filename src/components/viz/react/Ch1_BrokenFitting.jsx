/**
 * Ch1_BrokenFitting.jsx
 * Book 1, Chapter 1 — "The Broken Fitting"
 * Topic: Measurement, fractions, area of a circle (πr² derived from triangles)
 *
 * Drop into: src/components/viz/react/Ch1_BrokenFitting.jsx
 * Register:  VizFrame.jsx → Ch1_BrokenFitting: lazy(() => import('./react/Ch1_BrokenFitting.jsx'))
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

function PolygonCanvas({ slices }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const cx = W / 2,
      cy = H / 2 - 10,
      r = 90;
    const n = slices;

    // filled polygon
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n - Math.PI / 2;
      const x = cx + r * Math.cos(a),
        y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)";
    ctx.fill();
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // spokes
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      ctx.strokeStyle = isDark
        ? "rgba(99,102,241,0.25)"
        : "rgba(99,102,241,0.2)";
      ctx.lineWidth = 0.75;
      ctx.stroke();
    }

    // ghost circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = isDark
      ? "rgba(99,102,241,0.45)"
      : "rgba(99,102,241,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#6366f1";
    ctx.fill();

    const apothem = r * Math.cos(Math.PI / n);
    const arcLen = 2 * r * Math.sin(Math.PI / n);
    const polyArea = 0.5 * n * arcLen * apothem;
    const circArea = Math.PI * r * r;
    const pct = ((polyArea / circArea) * 100).toFixed(1);

    ctx.fillStyle = isDark ? "#c7d2fe" : "#3730a3";
    ctx.font = "12px var(--font-sans, sans-serif)";
    ctx.textAlign = "center";
    ctx.fillText(`${n} triangles — covers ${pct}% of circle area`, cx, H - 10);
  }, [slices]);

  return (
    <canvas
      ref={ref}
      width={640}
      height={220}
      style={{ width: "100%", borderRadius: 8, display: "block" }}
    />
  );
}

function WhyPanel({ depth = 0, tag, children }) {
  const [open, setOpen] = useState(false);
  const colors = [
    { border: "#6366f1", bg: "#eef2ff", text: "#4338ca" },
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

export default function Ch1_BrokenFitting({ params = {} }) {
  const [slices, setSlices] = useState(6);
  const ready = useMath();
  const apothem = (90 * Math.cos(Math.PI / slices)).toFixed(1);
  const perimeter = (slices * 2 * 90 * Math.sin(Math.PI / slices)).toFixed(1);
  const polyArea = (0.5 * parseFloat(perimeter) * parseFloat(apothem)).toFixed(
    0,
  );

  const s = {
    fontFamily: "var(--font-sans)",
    padding: ".5rem 0",
    maxWidth: 740,
  };
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
  const mbox = {
    background: "var(--color-background-secondary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: 8,
    padding: "12px 16px",
    textAlign: "center",
    overflowX: "auto",
    margin: "10px 0",
  };
  const insight = {
    padding: "12px 14px",
    borderLeft: "3px solid #6366f1",
    background: "var(--color-background-secondary)",
    borderRadius: "0 8px 8px 0",
    fontSize: 13,
    color: "var(--color-text-secondary)",
    lineHeight: 1.65,
    margin: "10px 0",
  };

  return (
    <div style={s}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Badge */}
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
        Book 1 · Chapter 1
      </div>

      {/* Hook */}
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
          A bronze fitting sheared off a boat hull. To order a replacement, Mic
          needs the cross-sectional area and wall thickness ratio — but the
          catalog uses formulas, not measurements.
        </div>
      </div>

      {/* Story */}
      <div style={panel}>
        {hdr(
          "Story",
          { background: "#e0f2fe", color: "#0369a1" },
          "The broken fitting",
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
            The piece sat on the workbench like an accusation. It had sheared
            clean — a small bronze fitting, no bigger than{" "}
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>'s
            fist, that was apparently the reason the boat had been sitting in
            dry dock for two weeks.
          </p>
          <p style={{ marginBottom: 12 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Measure it,"
            </em>{" "}
            his uncle said.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Order the replacement. Shouldn't take more than an hour."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            measured carefully: outer diameter{" "}
            <span
              style={{
                background: "var(--color-background-secondary)",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              34.5 mm
            </span>
            , inner bore{" "}
            <span
              style={{
                background: "var(--color-background-secondary)",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              22 mm
            </span>
            . Then he opened the catalog. The fitting was listed by{" "}
            <em>cross-sectional area</em> — not diameter.
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            looked over his shoulder.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Area of a circle is pi r squared. You learned that in year
              seven."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            stared at him.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "I know the formula. I don't know why it works. And I'm not
              ordering a two-hundred-dollar part on a formula I can't prove."
            </em>{" "}
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>,
            who had arrived uninvited, smiled.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "He's right. Let's derive it."
            </em>
          </p>
        </div>
      </div>

      {/* Discovery */}
      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#ede9fe", color: "#5b21b6" },
          "Where does πr² come from?",
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
            Albert's idea: cut the circle into thin triangular slices, like a
            pie. Each triangle has height ≈ r and base = one arc segment.
            Rearrange them into a rectangle. As slices → ∞, the rectangle
            becomes exact.
          </p>

          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <PolygonCanvas slices={slices} />
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
              Slices
            </span>
            <input
              type="range"
              min={3}
              max={64}
              value={slices}
              step={1}
              onChange={(e) => setSlices(parseInt(e.target.value))}
              style={{ flex: 1, maxWidth: 200 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 24 }}>
              {slices}
            </span>
          </div>

          <div style={mbox}>
            {ready && (
              <M
                t={`\\text{Area} = \\frac{1}{2} \\times \\underbrace{${perimeter}}_{\\text{perimeter}} \\times \\underbrace{${apothem}}_{\\text{apothem}} = ${polyArea} \\approx \\pi r^2 = ${(Math.PI * 90 * 90).toFixed(0)}`}
                display
                ready={ready}
              />
            )}
          </div>

          <div style={insight}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              The key insight:
            </strong>{" "}
            As slices → ∞, perimeter → 2πr and apothem → r. Total area = ½ × 2πr
            × r = <strong>πr²</strong>. The formula is a geometric fact, not a
            magic constant.
          </div>

          <WhyPanel tag="Why does sum of arc lengths equal 2πr?" depth={0}>
            <p style={{ marginBottom: 8 }}>
              The circumference of a circle with radius r is defined as 2πr.
              This is the definition of π itself — the ratio of any circle's
              circumference to its diameter: π = C / d = C / (2r), so C = 2πr.
            </p>
            <p style={{ marginBottom: 8 }}>
              Number check: r = 17.25 mm. Circumference = 2 × 3.14159 × 17.25 ≈
              108.4 mm. The sum of all arc segments in our slices equals exactly
              108.4 mm.
            </p>
            <WhyPanel
              tag="Why does height ≈ r require a limit — why not exactly r?"
              depth={1}
            >
              <p style={{ marginBottom: 8 }}>
                Each triangle's height is the apothem — the distance from the
                center to the middle of the base. For a polygon, this is always
                slightly less than r. Only as n → ∞ does the apothem reach r
                exactly. This is what the word "limit" means — a value
                approached but never quite reached for any finite n. The idea
                returns in Book 3.
              </p>
            </WhyPanel>
          </WhyPanel>
        </div>
      </div>

      {/* The math */}
      <div style={panel}>
        {hdr(
          "The math",
          { background: "#ecfdf5", color: "#065f46" },
          "Calculating what the catalog actually needs",
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
            With outer radius r₁ = 17.25 mm and inner radius r₂ = 11 mm, Mic
            needs three numbers for the catalog.
          </p>

          {[
            {
              tag: "Step 1",
              tagStyle: { background: "#e0f2fe", color: "#0369a1" },
              title: "Outer cross-sectional area",
              tex: "\\pi r_1^2 = \\pi \\times (17.25)^2 \\approx 934.8 \\text{ mm}^2",
              note: "π × (17.25)² = π × 297.56 ≈ 934.8 mm²",
              whyTag: "Why use radius, not diameter?",
              why: "The formula πr² uses radius because area scales with r². Using diameter d would give π(d/2)² = πd²/4 — same answer, more steps. Number check: r=5 → area = π×25 ≈ 78.5. d=10 → π×100/4 = π×25 ≈ 78.5 ✓",
            },
            {
              tag: "Step 2",
              tagStyle: { background: "#e0f2fe", color: "#0369a1" },
              title: "Wall thickness and wall factor",
              tex: "\\text{wall} = 17.25 - 11 = 6.25 \\text{ mm} \\qquad \\text{wall factor} = \\frac{6.25}{17.25} \\approx 0.362",
              note: "0.362 < 1 — the wall is thinner than the radius, which matches the physical object.",
              whyTag: "How do I know which way to divide?",
              why: "The catalog says 'thickness divided by outer radius.' The words give the order. 0.362 means 0.362 mm of wall per mm of radius — less than 1, physically sensible. If you got 2.76 (radius ÷ thickness), the wall would be nearly 3× the radius — clearly wrong just by looking at the part. Always check the answer against reality.",
            },
          ].map((item, i) => (
            <div key={i} style={{ ...panel, marginBottom: 10 }}>
              {hdr(item.tag, item.tagStyle, item.title)}
              <div style={body}>
                <div style={mbox}>
                  {ready && <M t={item.tex} display ready={ready} />}
                </div>
                <div style={insight}>{item.note}</div>
                <WhyPanel tag={item.whyTag} depth={0}>
                  <p>{item.why}</p>
                </WhyPanel>
              </div>
            </div>
          ))}

          <div style={{ ...panel, marginBottom: 0 }}>
            {hdr(
              "Result",
              { background: "#ecfdf5", color: "#065f46" },
              "What goes in the catalog order",
            )}
            <div style={body}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                {[
                  ["Cross-section area", "934.8", "mm²"],
                  ["Wall thickness", "6.25", "mm"],
                  ["Wall factor", "0.362", "dimensionless"],
                ].map(([label, val, unit]) => (
                  <div
                    key={label}
                    style={{
                      background: "var(--color-background-secondary)",
                      borderRadius: 8,
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-tertiary)",
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {val}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {unit}
                    </div>
                  </div>
                ))}
              </div>
              <div style={insight}>
                The part was ordered. The boat would float. But standing at the
                harbor, Mic looked at the curved hull sweeping from bow to stern
                and wondered — the hull isn't a circle. How would you find the
                area of a shape with no formula?
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seed */}
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
        John insists he can build a rope bridge using only one measurement. He
        is wrong — but his mistake leads to the most useful idea in early
        mathematics. Chapter 2: <em>The Rope Bridge.</em>
      </div>
    </div>
  );
}
