import { useState, useEffect, useRef } from "react";

function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
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

function WhyPanel({ depth = 0, tag, children }) {
  const [open, setOpen] = useState(false);
  const colors = [
    { border: "#4f46e5", bg: "#eef2ff", text: "#3730a3" },
    { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" },
    { border: "#059669", bg: "#ecfdf5", text: "#047857" },
    { border: "#d97706", bg: "#fffbeb", text: "#92400e" },
  ];
  const c = colors[Math.min(depth, colors.length - 1)];
  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? c.bg : "transparent", border: `1px solid ${c.border}`, borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: c.border, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        <span style={{ width: 15, height: 15, borderRadius: "50%", background: c.border, color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{open ? "−" : "?"}</span>
        {open ? "Close" : tag}
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: "12px 14px", background: "var(--color-background-secondary)", borderLeft: `3px solid ${c.border}`, borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PostulateCanvas({ active, showParallel }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const col = isDark ? "#e2e8f0" : "#1e293b";
    const muted = isDark ? "#6b7280" : "#94a3b8";
    const accent = "#4f46e5";
    ctx.font = "13px var(--font-sans, sans-serif)";
    ctx.textAlign = "left";
    ctx.fillStyle = col;

    const dot = (x, y, r = 4) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = accent; ctx.fill(); };
    const line = (x1, y1, x2, y2, color = col, w = 1.5) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke(); };

    if (active === 0) {
      // P1: line through any two points
      dot(120, H / 2); dot(380, H / 2);
      line(80, H / 2, 420, H / 2, accent, 2);
      ctx.fillStyle = col; ctx.fillText("A", 108, H / 2 - 12); ctx.fillText("B", 368, H / 2 - 12);
      ctx.fillStyle = muted; ctx.font = "12px var(--font-sans,sans-serif)";
      ctx.fillText("A straight line can be drawn between any two points.", 60, H - 20);
    } else if (active === 1) {
      // P2: extend a line indefinitely
      line(60, H / 2, 420, H / 2, muted, 1);
      ctx.setLineDash([6, 4]);
      line(420, H / 2, 520, H / 2, accent, 1.5);
      line(60, H / 2, -20, H / 2, accent, 1.5);
      ctx.setLineDash([]);
      dot(180, H / 2); dot(340, H / 2);
      ctx.fillStyle = col; ctx.fillText("A", 168, H / 2 - 12); ctx.fillText("B", 328, H / 2 - 12);
      ctx.fillStyle = muted; ctx.font = "12px var(--font-sans,sans-serif)";
      ctx.fillText("Any line segment can be extended indefinitely in both directions.", 60, H - 20);
    } else if (active === 2) {
      // P3: circle with any centre and radius
      const cx = 240, cy = H / 2, r = 80;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.stroke();
      dot(cx, cy, 4);
      dot(cx + r, cy, 3);
      line(cx, cy, cx + r, cy, muted, 1);
      ctx.fillStyle = col; ctx.fillText("centre", cx + 6, cy - 8);
      ctx.fillStyle = muted; ctx.textAlign = "center"; ctx.fillText("radius r", cx + r / 2, cy - 8);
      ctx.font = "12px var(--font-sans,sans-serif)"; ctx.textAlign = "left";
      ctx.fillStyle = muted;
      ctx.fillText("A circle can be drawn with any centre and any radius.", 60, H - 20);
    } else if (active === 3) {
      // P4: all right angles equal
      const drawRight = (ox, oy, size, label) => {
        line(ox, oy, ox + size, oy, col, 1.5);
        line(ox, oy, ox, oy - size, col, 1.5);
        ctx.beginPath(); ctx.moveTo(ox + 14, oy); ctx.lineTo(ox + 14, oy - 14); ctx.lineTo(ox, oy - 14);
        ctx.strokeStyle = accent; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = col; ctx.fillText(label + " = 90°", ox + 20, oy - 20);
      };
      drawRight(100, H / 2 + 30, 90, "∠A");
      drawRight(280, H / 2 + 30, 90, "∠B");
      ctx.fillStyle = muted; ctx.font = "12px var(--font-sans,sans-serif)";
      ctx.fillText("All right angles are equal to each other.", 80, H - 20);
    } else if (active === 4) {
      // P5: parallel postulate
      if (!showParallel) {
        line(60, 80, 440, 80, col, 1.5);
        line(60, 160, 440, 160, col, 1.5);
        line(200, 40, 280, 200, accent, 1.5);
        ctx.fillStyle = accent; ctx.font = "12px var(--font-sans,sans-serif)";
        ctx.fillText("angles sum < 180° → lines meet", 60, H - 20);
        ctx.fillStyle = muted; ctx.fillText("(on this side)", 320, H - 20);
      } else {
        line(60, 80, 440, 80, col, 1.5);
        line(60, 160, 440, 160, "#dc2626", 2);
        line(200, 40, 200, 200, accent, 1.5);
        ctx.setLineDash([5, 4]);
        line(200, 200, 200, H - 10, "#dc2626", 1.5);
        ctx.setLineDash([]);
        ctx.fillStyle = "#dc2626"; ctx.font = "12px var(--font-sans,sans-serif)";
        ctx.fillText("Without P5: many parallel lines possible!", 60, H - 20);
      }
    }
  }, [active, showParallel]);
  return <canvas ref={ref} width={520} height={200} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

const POSTULATES = [
  { title: "P1: Two points determine a line", summary: "Through any two distinct points, exactly one straight line can be drawn.", insight: "This is an assumption — not something we prove. It defines what a line IS in Euclidean geometry. Without it, geometry has no starting point." },
  { title: "P2: A line segment can be extended indefinitely", summary: "Any finite line segment can be extended to an infinite line in both directions.", insight: "This postulate says the plane has no boundary. Space doesn't 'run out.' It's the foundation of infinite geometry." },
  { title: "P3: A circle can be drawn with any centre and radius", summary: "Given a point (centre) and a length (radius), a circle exists.", insight: "This is the compass postulate. It defines what it means to have a circle — and gives the compass its mathematical legitimacy." },
  { title: "P4: All right angles are equal", summary: "Every right angle is 90° — a right angle is the same everywhere in the plane.", insight: "This says the plane is uniform. Space doesn't warp or stretch. A right angle in the corner is the same as a right angle at the harbour." },
  { title: "P5: The Parallel Postulate", summary: "If a line crosses two lines and makes interior angles summing to less than 180° on one side, those two lines will meet on that side.", insight: "This is the strange one. It's far more complex than the others, and for 2000 years mathematicians tried to prove it from P1–P4. They couldn't — because it's independent. Removing P5 gives non-Euclidean geometry (curved space, the geometry of the universe at large scales)." },
];

export default function G1_1_FivePostulates({ params = {} }) {
  const [active, setActive] = useState(0);
  const [showParallel, setShowParallel] = useState(false);

  const S = { fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 };
  const panel = { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 14 };
  const hdr = (tag, ts, title) => (<div style={{ padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, ...ts }}>{tag}</span><span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</span></div>);
  const body = { padding: "16px 20px" };
  const insight = (col = "#4f46e5") => ({ padding: "12px 14px", borderLeft: `3px solid ${col}`, background: "var(--color-background-secondary)", borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: "10px 0" });

  const p = POSTULATES[active];

  return (
    <div style={S}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Geometry · Book 1 · Chapter 1</div>

      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--color-text-tertiary)", marginBottom: 5 }}>The situation</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.45 }}>Albert finds a copy of Euclid's Elements in the library. He insists they read it properly — not as facts to memorise, but as a logical system. Everything in the book follows from exactly five assumptions. If you understand those five, you understand all of Euclidean geometry.</div>
      </div>

      <div style={panel}>
        {hdr("Story", { background: "#ede9fe", color: "#4f46e5" }, "The five postulates")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> set the book on the workbench. <em style={{ color: "var(--color-text-secondary)" }}>"Euclid wrote this in 300 BC. Every theorem in here — hundreds of them — follows from five statements that he simply declares to be true."</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> picked it up. <em style={{ color: "var(--color-text-secondary)" }}>"Why five? Why not prove everything?"</em></p>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"You can't prove everything. At some point you have to start somewhere. You choose the smallest set of assumptions you can, and prove everything else from them. Those assumptions are called axioms or postulates."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> looked at the first page. <em style={{ color: "var(--color-text-secondary)" }}>"And nobody's proved these from something even simpler?"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> shook his head. <em style={{ color: "var(--color-text-secondary)" }}>"The first four, people tried. The fifth — that one broke all of mathematics when someone finally gave up trying."</em></p>
        </div>
      </div>

      <div style={panel}>
        {hdr("Discovery", { background: "#ede9fe", color: "#4f46e5" }, "Euclid's five postulates — what geometry is built on")}
        <div style={body}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 14 }}>Select each postulate. The diagram shows what it says. The fifth postulate reveals why it's different from the others.</p>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {POSTULATES.map((po, i) => (
              <button key={i} onClick={() => { setActive(i); setShowParallel(false); }} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", border: `1px solid ${i === active ? "#4f46e5" : "var(--color-border-tertiary)"}`, background: i === active ? "#ede9fe" : "transparent", color: i === active ? "#3730a3" : "var(--color-text-secondary)" }}>
                P{i + 1}
              </button>
            ))}
          </div>

          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 14 }}>
            <PostulateCanvas active={active} showParallel={showParallel} />
          </div>

          {active === 4 && (
            <div style={{ marginBottom: 10 }}>
              <button onClick={() => setShowParallel(s => !s)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", border: "1px solid #dc2626", background: showParallel ? "#fef2f2" : "transparent", color: "#dc2626" }}>
                {showParallel ? "Show standard version" : "Show what happens without P5"}
              </button>
            </div>
          )}

          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#4f46e5", marginBottom: 6 }}>{p.title}</div>
            <p style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.65, marginBottom: 8 }}>{p.summary}</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, fontStyle: "italic" }}>{p.insight}</p>
          </div>

          <WhyPanel tag="What is an axiom, and why can't we prove everything?" depth={0}>
            <p style={{ marginBottom: 8 }}>In any logical system, you need starting points — statements accepted as true without proof. These are axioms (or postulates). Without them, every proof would require a proof of its premises, which would require a proof of its premises, infinitely. Axioms break the infinite regress.</p>
            <p style={{ marginBottom: 8 }}>The goal is to choose the smallest, most obvious set of axioms and derive everything else. Euclid chose 5. Modern formal geometry (Hilbert, 1899) uses 20, because Euclid's 5 had hidden gaps. But Euclid's system was correct for 2000 years of practical geometry.</p>
            <WhyPanel tag="What is non-Euclidean geometry — what breaks when you remove P5?" depth={1}>
              <p style={{ marginBottom: 8 }}>If you replace P5 with "through a point not on a line, there are NO parallel lines," you get spherical geometry (like the surface of the Earth, where all "straight lines" — great circles — eventually meet). If you allow "infinitely many parallels," you get hyperbolic geometry. Both are internally consistent. The universe at cosmological scales follows hyperbolic geometry, not Euclidean. Einstein's general relativity is built on this.</p>
            </WhyPanel>
          </WhyPanel>

          <WhyPanel tag="Why is P5 called 'the Parallel Postulate'? It doesn't mention parallels." depth={0}>
            <p style={{ marginBottom: 8 }}>P5 as Euclid stated it is equivalent to: "Through a point not on a given line, exactly one line can be drawn parallel to the given line." This equivalent form (Playfair's axiom) is simpler and more commonly used. The two are logically equivalent — each can be proved from the other using P1–P4.</p>
            <p>The 2000-year project of proving P5 from P1–P4 failed because it's genuinely independent. Every "proof" of P5 turned out to secretly assume something equivalent to P5 in a different form. In 1829, Lobachevsky proved this by constructing a consistent geometry where P5 is false.</p>
          </WhyPanel>
        </div>
      </div>

      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #b45309", borderRadius: "0 0 10px 10px", padding: "12px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Now that the system is defined, Albert starts proving things from it. First target: the angles around a point. John is certain vertical angles are equal — Albert makes him prove it. Chapter 2: <em>The Angles at a Point.</em>
      </div>
    </div>
  );
}
