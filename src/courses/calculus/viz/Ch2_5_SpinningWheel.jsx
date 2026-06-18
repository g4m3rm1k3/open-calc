/**
 * Ch2_5_SpinningWheel.jsx
 * Book 2, Chapter 5 — "The Spinning Wheel"
 * Topic: Radian measure — why radians are necessary, not arbitrary
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

function WheelCanvas({ angleDeg }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const cx = 160,
      cy = H / 2,
      r = 110;
    const rad = (angleDeg * Math.PI) / 180;
    const arcLen = r * rad;
    // circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = isDark ? "#6b7280" : "#9ca3af";
    ctx.lineWidth = 1;
    ctx.stroke();
    // arc highlight
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, -rad, true);
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 4;
    ctx.stroke();
    // radius
    const px = cx + r * Math.cos(-rad),
      py = cy + r * Math.sin(-rad);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2;
    ctx.stroke();
    // reference radius (horizontal)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r, cy);
    ctx.strokeStyle = isDark ? "#6b7280" : "#9ca3af";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // labels
    ctx.fillStyle = isDark ? "#fcd34d" : "#92400e";
    ctx.font = "12px var(--font-sans,sans-serif)";
    ctx.textAlign = "center";
    ctx.fillText("arc length = " + arcLen.toFixed(1), cx, cy + r + 20);
    ctx.fillText("r = " + r, cx, cy + r + 36);
    ctx.fillText(
      "angle = " + angleDeg + "° = " + rad.toFixed(3) + " rad",
      cx,
      cy + r + 52,
    );
    // right panel: formula
    const rx = 360;
    ctx.fillStyle = isDark ? "#e2e8f0" : "#374151";
    ctx.font = "13px var(--font-sans,sans-serif)";
    ctx.textAlign = "left";
    ctx.fillText("Radian definition:", rx, 40);
    ctx.fillStyle = isDark ? "#fcd34d" : "#b45309";
    ctx.fillText("θ (rad) = arc length / radius", rx, 60);
    ctx.fillStyle = isDark ? "#e2e8f0" : "#374151";
    ctx.fillText("= " + arcLen.toFixed(1) + " / " + r, rx, 80);
    ctx.fillText("= " + rad.toFixed(4) + " rad", rx, 100);
    ctx.fillText("", rx, 120);
    ctx.fillText("In degrees: " + angleDeg + "°", rx, 130);
    ctx.fillText("Conversion: " + angleDeg + " × π/180", rx, 150);
    ctx.fillText("= " + rad.toFixed(4) + " ✓", rx, 170);
    ctx.fillStyle = isDark ? "#9ca3af" : "#6b7280";
    ctx.font = "11px var(--font-sans,sans-serif)";
    ctx.fillText("When arc = radius, angle = 1 radian", rx, 210);
    ctx.fillText("= 57.296°", rx, 226);
  }, [angleDeg]);
  return (
    <canvas
      ref={ref}
      width={580}
      height={240}
      style={{ width: "100%", borderRadius: 8, display: "block" }}
    />
  );
}

export default function Ch2_5_SpinningWheel({ params = {} }) {
  const [angle, setAngle] = useState(90);
  const ready = useMath();
  const rad = (angle * Math.PI) / 180;

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
    borderLeft: "3px solid #d97706",
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
        Book 2 · Chapter 5
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
          The telescope mount uses a wheel with a gear ratio. John asks why
          Albert uses radians instead of degrees — "360 is a nicer number."
          Albert explains that 360 is arbitrary, radians are not, and without
          radians the derivative of sin would be wrong by a factor of π/180.
        </div>
      </div>
      <div style={panel}>
        {hdr(
          "Story",
          { background: "#fffbeb", color: "#92400e" },
          "The spinning wheel",
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
            <span style={{ color: "#065f46", fontWeight: 500 }}>John</span> was
            adjusting the gear ratio on the telescope mount.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Why do you always write everything in radians? 360 is a much
              rounder number than 6.283."
            </em>
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span>{" "}
            put down his pencil.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "360 is arbitrary. The Babylonians chose it because they liked
              that it's divisible by many numbers. Radians were not chosen. They
              were discovered — they're what you get when you measure arc
              length."
            </em>
          </p>
          <p style={{ marginBottom: 0 }}>
            <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span>{" "}
            looked up.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "And if you use degrees in calculus?"
            </em>{" "}
            Albert shook his head.{" "}
            <em style={{ color: "var(--color-text-secondary)" }}>
              "Then d/dx[sin x] = (π/180)cos x. The constant contaminates every
              derivative, every integral, every Taylor series — forever. Radians
              make it clean."
            </em>
          </p>
        </div>
      </div>
      <div style={panel}>
        {hdr(
          "Discovery",
          { background: "#fffbeb", color: "#92400e" },
          "Radians — the angle that arc length defines",
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
            One radian is the angle subtended by an arc of length equal to the
            radius. It's not defined from a human convention — it's the ratio of
            arc length to radius, which is a pure geometric fact.
          </p>
          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <WheelCanvas angleDeg={angle} />
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
              Angle
            </span>
            <input
              type="range"
              min={10}
              max={360}
              value={angle}
              step={5}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              style={{ flex: 1, maxWidth: 220 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 50 }}>
              {angle}° = {rad.toFixed(3)} rad
            </span>
          </div>
          <div style={mbox}>
            {ready && (
              <M
                t={`\\theta_{\\text{rad}} = \\frac{\\text{arc length}}{r} = \\frac{${(110 * rad).toFixed(1)}}{110} = ${rad.toFixed(4)}`}
                display
                ready={ready}
              />
            )}
          </div>
          <div style={insight}>
            <strong
              style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
            >
              The calculus consequence:
            </strong>{" "}
            The limit as h→0 of (sin h)/h = 1 only holds in radians. In degrees:
            the limit as h→0 of (sin h°)/h = π/180 ≈ 0.01745. Every trig
            derivative would carry this factor. Radians are the angle unit where
            sin behaves "naturally" under differentiation — that naturalness is
            not a preference, it's a mathematical fact.
          </div>
          <WhyPanel
            tag="Why does the area of a sector equal ½r²θ in radians?"
            depth={0}
          >
            <p style={{ marginBottom: 8 }}>
              A full circle (θ = 2π radians) has area πr². A sector of angle θ
              is the fraction θ/(2π) of the full circle. Area = (θ/2π) × πr² =
              ½r²θ. This formula only works cleanly when θ is in radians. In
              degrees: Area = (θ/360) × πr², which has no clean closed form.
            </p>
            <p>
              This sector area formula is exactly what we use in the Squeeze
              Theorem proof of lim(sin h/h) = 1 — the bedrock limit under all of
              trig calculus.
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
        A ship sends a distress signal. The angle to the signal is known — but
        Mic needs the bearing in compass degrees, not a trig ratio. He needs to
        run sin and cos backwards. Chapter 6: <em>The Echo Problem.</em>
      </div>
    </div>
  );
}
