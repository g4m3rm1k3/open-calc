/**
 * Ch6_TwoTanks.jsx
 * Book 1, Chapter 6 — "Two Tanks, One Valve"
 * Topic: Systems of linear equations — substitution and elimination, both proved
 *
 * Drop into: src/components/viz/react/Ch6_TwoTanks.jsx
 * Register:  VizFrame.jsx → Ch6_TwoTanks: lazy(() => import('./react/Ch6_TwoTanks.jsx'))
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
    { border: "#1d9e75", bg: "#ecfdf5", text: "#065f46" },
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

function TankViz({ time, rateA = 8, rateB = -3, startA = 120, startB = 220 }) {
  const vA = Math.max(0, startA + rateA * time);
  const vB = Math.max(0, startB + rateB * time);
  const maxV = 320;
  const tEq = (startB - startA) / (rateA - rateB);
  const isEq = Math.abs(time - tEq) < 0.4;

  const tankStyle = (color, volume) => ({
    position: "relative",
    width: 110,
    height: 160,
    border: `2px solid ${color}`,
    borderRadius: 6,
    overflow: "hidden",
    background: "var(--color-background-primary)",
  });

  const fillH = (v) => Math.min(158, Math.round((v / maxV) * 158));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 40,
        justifyContent: "center",
        padding: "16px 0",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#0369a1",
            marginBottom: 8,
          }}
        >
          Tank A (filling)
        </div>
        <div style={tankStyle("#0369a1", vA)}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: fillH(vA),
              background: "#B5D4F4",
              transition: "height .3s",
            }}
          />
          {isEq && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: fillH(vA),
                height: 2,
                background: "#f59e0b",
              }}
            />
          )}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "#0369a1",
            marginTop: 8,
          }}
        >
          {vA.toFixed(0)} L
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
          +{rateA} L/min
        </div>
      </div>

      <div style={{ textAlign: "center", paddingBottom: 40 }}>
        {isEq ? (
          <div
            style={{
              padding: "8px 14px",
              background: "#ecfdf5",
              borderRadius: 8,
              border: "1px solid #6ee7b7",
              fontSize: 13,
              fontWeight: 500,
              color: "#065f46",
            }}
          >
            Equalized!
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>
            t = {time.toFixed(1)} min
          </div>
        )}
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-tertiary)",
            marginTop: 6,
          }}
        >
          Eq. at {tEq.toFixed(2)} min
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#0f766e",
            marginBottom: 8,
          }}
        >
          Tank B (draining)
        </div>
        <div style={tankStyle("#0f766e", vB)}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: fillH(vB),
              background: "#9FE1CB",
              transition: "height .3s",
            }}
          />
          {isEq && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: fillH(vB),
                height: 2,
                background: "#f59e0b",
              }}
            />
          )}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "#0f766e",
            marginTop: 8,
          }}
        >
          {vB.toFixed(0)} L
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
          {rateB} L/min
        </div>
      </div>
    </div>
  );
}

const SUB_STEPS = [
  {
    label: "Write both equations",
    tex: "A(t) = 120 + 8t \\qquad B(t) = 220 - 3t",
  },
  {
    label: "Set A = B — the equilibrium condition",
    tex: "120 + 8t = 220 - 3t",
  },
  { label: "Collect t terms: add 3t to both sides", tex: "120 + 11t = 220" },
  { label: "Subtract 120 from both sides", tex: "11t = 100" },
  {
    label: "Divide both sides by 11",
    tex: "t = \\frac{100}{11} \\approx 9.09 \\text{ minutes}",
  },
  {
    label: "Find the equalized volume",
    tex: "A(9.09) = 120 + 8(9.09) \\approx 192.7 \\text{ L} \\checkmark",
  },
];

const ELIM_STEPS = [
  {
    label: "Subtract equation B from equation A",
    tex: "(120+8t) - (220-3t) = 0",
  },
  { label: "Expand and simplify", tex: "-100 + 11t = 0 \\implies 11t = 100" },
  {
    label: "Same answer",
    tex: "t = \\frac{100}{11} \\approx 9.09 \\text{ min} \\checkmark",
  },
];

export default function Ch6_TwoTanks({ params = {} }) {
  const [time, setTime] = useState(0);
  const ready = useMath();

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
    borderLeft: "3px solid #1d9e75",
    background: "var(--color-background-secondary)",
    borderRadius: "0 8px 8px 0",
    fontSize: 13,
    color: "var(--color-text-secondary)",
    lineHeight: 1.65,
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
        Book 1 · Chapter 6
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
          Two harbor tanks need to equalize before the tide. Tank A: 120 L,
          filling at 8 L/min. Tank B: 220 L, draining at 3 L/min. The harbor
          master needs to know when — in advance. Two equations, one unknown,
          two methods.
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Story",
          { background: "#d1fae5", color: "#065f46" },
          "Two tanks, one valve",
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
            The harbor master wanted both tanks equalized before the tide. He
            didn't say when — he said it would happen automatically once the
            valve opened.{" "}
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> stood
            in front of the tanks with a notebook.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Tank A is at 120 litres, filling at 8 per minute. Tank B is at
              220, draining at 3 per minute. When are they equal?"
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span>{" "}
            stared at the tanks.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Can't you just watch them?"
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "I need to tell him in 12 minutes whether they'll be equal before
              or after the valve opens."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            wrote two equations — one for each tank.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "At equilibrium, A = B. That's the third equation. Two equations
              that describe the same moment. That's a system — and there are two
              ways to solve it."
            </em>
          </p>
        </div>
      </div>

      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#d1fae5", color: "#065f46" },
          "Two methods, one truth",
        )}
        <div style={body}>
          {/* Live tank viz */}
          <TankViz time={time} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <span
              style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
            >
              Time (min)
            </span>
            <input
              type="range"
              min={0}
              max={20}
              value={time}
              step={0.5}
              onChange={(e) => setTime(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 240 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 50 }}>
              {time.toFixed(1)} min
            </span>
          </div>

          {/* Substitution */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              marginBottom: 8,
            }}
          >
            Method 1 — Substitution
          </div>
          {SUB_STEPS.map((step, i) => (
            <div
              key={i}
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
                    background: "#1d9e75",
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
                  padding: 8,
                  textAlign: "center",
                  overflowX: "auto",
                }}
              >
                {ready && <M t={step.tex} display ready={ready} />}
              </div>
            </div>
          ))}

          {/* Elimination */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              margin: "14px 0 8px",
            }}
          >
            Method 2 — Elimination (same answer, different path)
          </div>
          {ELIM_STEPS.map((step, i) => (
            <div
              key={i}
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
                  padding: 8,
                  textAlign: "center",
                  overflowX: "auto",
                }}
              >
                {ready && <M t={step.tex} display ready={ready} />}
              </div>
            </div>
          ))}

          <div style={insight}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              Both methods preserve equality.
            </strong>{" "}
            Substitution replaces one expression with an equal one. Elimination
            adds equal quantities to both sides. Both are the same four
            operations (add, subtract, multiply, divide) applied to keep the
            balance. The answer — t = 100/11 ≈ 9.09 min — is the same because
            there is only one moment when A = B.
          </div>

          <WhyPanel
            tag="What makes a 'system' — why two equations instead of one?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              One equation with one unknown can always be solved (if a solution
              exists). But if you have two unknowns, one equation isn't enough —
              infinitely many pairs (x,y) satisfy a single equation. You need
              one equation per unknown.
            </p>
            <p style={{ marginBottom: 8 }}>
              Here we have one unknown (t) and two equations — more than needed.
              But both must be true simultaneously. Setting them equal uses both
              constraints at once.
            </p>
            <p>
              In general: n unknowns require n independent equations. This is a
              foundational principle of linear algebra. You'll see it again in
              Book 4 when working with systems of differential equations in
              engineering.
            </p>
          </WhyPanel>

          <WhyPanel
            tag="What if the two equations have no solution — parallel lines?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              If both tanks filled at the same rate with different starting
              levels, their "lines" on a graph would be parallel — same slope,
              different y-intercept. They never cross. No time t exists where
              they equalize.
            </p>
            <p style={{ marginBottom: 8 }}>
              Algebraically: the t terms cancel and you get a false statement
              like 0 = 100. This isn't an error — it's the system telling you no
              solution exists. The information is in the algebra.
            </p>
            <p>
              If both equations are identical (same line, same rate, same
              start), there are infinitely many solutions — any t satisfies
              both. Algebraically: 0 = 0. Both of these cases are as important
              to recognize as finding a unique solution.
            </p>
          </WhyPanel>
        </div>
      </div>

      {/* Book close */}
      <div
        style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderTop: "2px solid #1d9e75",
          borderRadius: "0 0 10px 10px",
          padding: "14px 16px",
          fontSize: 13,
          color: "var(--color-text-secondary)",
          lineHeight: 1.65,
        }}
      >
        <strong style={{ fontWeight: 500, color: "#065f46" }}>
          End of Book 1.
        </strong>{" "}
        Mic can measure, proportion, find unknowns, understand steepness, solve
        quadratics, and handle systems. But the harbor hull curve still has no
        area formula. The slope of the road changes at every point. And John
        wants to know exactly how fast his cart was moving at the moment it hit
        the fence. None of these can be answered with algebra alone.{" "}
        <em>
          Book 2 begins with a telescope, a broken protractor, and a question
          about the stars.
        </em>
      </div>
    </div>
  );
}
