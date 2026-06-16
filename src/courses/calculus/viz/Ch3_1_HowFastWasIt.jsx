/**
 * Ch3_1_HowFastWasIt.jsx
 * Book 3, Chapter 1 — "How Fast Was It?"
 * Topic: The limit concept — instantaneous speed, ε-δ built from average speed
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

function SpeedCanvas({ dt }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // position function s(t) = t^2 (simplification)
    const ox = 50,
      oy = H - 40,
      xscale = (W - 100) / 5,
      yscale = 5;
    const t0 = 3;
    ctx.strokeStyle = isDark ? "#374151" : "#e5e7eb";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(W - 50, oy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, 20);
    ctx.lineTo(ox, oy);
    ctx.stroke();
    // curve s = t^2
    ctx.beginPath();
    for (let t = 0; t <= 5; t += 0.05) {
      const s = t * t;
      const px = ox + t * xscale,
        py = oy - s * yscale;
      t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.stroke();
    // secant line through (t0, t0^2) and (t0+dt, (t0+dt)^2)
    const s0 = t0 * t0,
      s1 = (t0 + dt) * (t0 + dt);
    const avgV = (s1 - s0) / dt;
    const px0 = ox + t0 * xscale,
      py0 = oy - s0 * yscale;
    const px1 = ox + (t0 + dt) * xscale,
      py1 = oy - s1 * yscale;
    // extend secant a bit
    const extLeft = px0 - 20,
      extRight = px1 + 20;
    const slope = (py1 - py0) / (px1 - px0);
    ctx.beginPath();
    ctx.moveTo(extLeft, py0 + slope * (extLeft - px0));
    ctx.lineTo(extRight, py0 + slope * (extRight - px0));
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    // points
    [
      [px0, py0],
      [px1, py1],
    ].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#6366f1";
      ctx.fill();
    });
    // labels
    ctx.fillStyle = isDark ? "#e2e8f0" : "#374151";
    ctx.font = "11px var(--font-sans,sans-serif)";
    ctx.textAlign = "center";
    ctx.fillText("t = " + t0, px0, oy + 16);
    ctx.fillText("t = " + (t0 + dt).toFixed(2), px1, oy + 16);
    ctx.fillStyle = isDark ? "#fbbf24" : "#92400e";
    ctx.fillText("avg speed = " + avgV.toFixed(3), (px0 + px1) / 2, py0 - 14);
    ctx.fillStyle = isDark ? "#9ca3af" : "#6b7280";
    ctx.font = "11px var(--font-sans,sans-serif)";
    ctx.textAlign = "left";
    ctx.fillText("s(t) = t²", ox + 4, 30);
    ctx.fillText("As Δt→0, avg speed → 2×3 = 6 (instantaneous)", ox, H - 8);
  }, [dt]);
  return (
    <canvas
      ref={ref}
      width={580}
      height={220}
      style={{ width: "100%", borderRadius: 8, display: "block" }}
    />
  );
}

export default function Ch3_1_HowFastWasIt({ params = {} }) {
  const [dt, setDt] = useState(1.0);
  const ready = useMath();
  const t0 = 3,
    s0 = 9,
    s1 = (t0 + dt) * (t0 + dt);
  const avgV = ((s1 - s0) / dt).toFixed(4);

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
        Book 3 · Chapter 1
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
          John's cart hit the fence. The crash happened at one specific instant.
          Mic wants to know how fast it was going at that exact moment — not the
          average speed over a second, not over a minute. Exactly at the instant
          of impact. Algebra cannot answer this. Something new is needed.
        </div>
      </div>
      <div style={panel}>
        {hdr(
          "Story",
          { background: "#eef2ff", color: "#3730a3" },
          "How fast was it?",
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
            The cart's dent in the fence was impressive.{" "}
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span> was
            proud.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "How fast do you think I was going?"
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> had
            the position data — a table of distances at each second.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Average speed over the last second: 7 metres per second. But
              that's not how fast it was going at the instant of impact. Speed
              changes. It was accelerating."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "So measure a shorter interval,"
            </em>{" "}
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            said.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Half a second. A tenth of a second. A thousandth."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <em style={{ color: "var(--color-text-secondary)" }}>
              "But at zero seconds, the distance is also zero. You get zero over
              zero."
            </em>{" "}
            Mic stared at his notebook.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "The answer exists. We can see the cart's speed approaching
              something. But we can't divide by zero to get it. We need a
              different concept."
            </em>
          </p>
        </div>
      </div>
      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#eef2ff", color: "#3730a3" },
          "Shrinking the interval — the limit appears",
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
            Model: position s(t) = t² (metres). At t = 3 seconds, the cart hits
            the fence. Average speed over interval Δt = [s(3+Δt) − s(3)] / Δt.
            Drag Δt toward zero and watch the average speed converge.
          </p>
          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <SpeedCanvas dt={dt} />
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
              Δt (interval)
            </span>
            <input
              type="range"
              min={0.01}
              max={2}
              value={dt}
              step={0.01}
              onChange={(e) => setDt(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: 220 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 50 }}>
              {dt.toFixed(2)} s
            </span>
          </div>
          <div style={mbox}>
            {ready && (
              <M
                t={`\\text{avg speed} = \\frac{s(3+${dt.toFixed(2)}) - s(3)}{${dt.toFixed(2)}} = \\frac{${s1.toFixed(4)} - 9}{${dt.toFixed(2)}} = ${avgV}`}
                display
                ready={ready}
              />
            )}
          </div>
          <div style={insight}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              The limit:
            </strong>{" "}
            As Δt → 0, the average speed approaches exactly 6 m/s. We can't set
            Δt = 0 (that gives 0/0), but we can ask what value it approaches.
            That value is the instantaneous speed — and asking this question is
            the definition of a limit.
          </div>
          <WhyPanel
            tag="Why does the average speed approach 6 exactly — not 5.99 or 6.01?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              Average speed = [s(3+Δt) − s(3)] / Δt = [(3+Δt)² − 9] / Δt = [9 +
              6Δt + (Δt)² − 9] / Δt = [6Δt + (Δt)²] / Δt = 6 + Δt. As Δt → 0,
              this equals exactly 6. The algebra guarantees it — the (Δt)² term
              vanishes and 6 is the exact limit.
            </p>
            <WhyPanel tag="What is the formal definition of a limit?" depth={1}>
              <p style={{ marginBottom: 8 }}>
                The statement "limit as x→a of f(x) equals L" means: for every ε
                &gt; 0, there exists δ &gt; 0 such that whenever 0 &lt; |x−a|
                &lt; δ, we have |f(x)−L| &lt; ε. In words: you can make f(x) as
                close to L as you want by making x close enough to a. The formal
                definition quantifies "close enough."
              </p>
            </WhyPanel>
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
        Albert wants to compute limits of products and quotients without doing
        the full shrinking-interval calculation every time. Are there shortcuts?
        Chapter 2: <em>Getting Closer.</em>
      </div>
    </div>
  );
}
