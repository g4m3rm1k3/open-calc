/**
 * Ch1Review.jsx — OpenStax Calc Vol 1
 * End-of-chapter review: Functions & Graphs
 * Bridge preview: How functions set up limits
 *
 * Sections covered: 1.1 Review of Functions, 1.2 Basic Classes,
 * 1.3 Trig, 1.4 Inverse Functions, 1.5 Exp & Log
 *
 * Self-contained. KaTeX + D3 from CDN.
 */
import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(l);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    s.onload = () => setReady(true); document.head.appendChild(s);
  }, []);
  return ready;
}
function M({ t, display = false, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !t) return;
    try { window.katex.render(t, ref.current, { throwOnError: false, displayMode: display }); }
    catch (_) { if (ref.current) ref.current.textContent = t; }
  }, [t, display, ready]);
  if (!t) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

// ── Interactive: show secant → tangent approaching a point (limit preview) ─
function LimitPreviewViz() {
  const svgRef = useRef(null);
  const cRef = useRef(null);
  const [h, setH] = useState(1.5);
  // f(x) = x² − x + 1, approaching x=1
  const f = x => x * x - x + 1;
  const x0 = 1;

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { axis: isDark ? "#475569" : "#94a3b8", grid: isDark ? "#1e293b" : "#f1f5f9", curve: isDark ? "#38bdf8" : "#0284c7", sec: isDark ? "#fbbf24" : "#d97706", tan: isDark ? "#34d399" : "#059669", pt: isDark ? "#f472b6" : "#db2777", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 200;
      const xd = [-0.5, 3], yd = [-0.2, 5];
      const xS = d3.scaleLinear().domain(xd).range([32, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove();
      svg.attr("width", W).attr("height", H);
      xS.ticks(5).forEach(v => svg.append("line").attr("x1", xS(v)).attr("y1", 8).attr("x2", xS(v)).attr("y2", H - 8).attr("stroke", C.grid).attr("stroke-width", 1));
      yS.ticks(4).forEach(v => svg.append("line").attr("x1", 32).attr("y1", yS(v)).attr("x2", W - 8).attr("y2", yS(v)).attr("stroke", C.grid).attr("stroke-width", 1));
      svg.append("line").attr("x1", 32).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.axis).attr("stroke-width", 1.5);
      svg.append("line").attr("x1", xS(0)).attr("y1", 8).attr("x2", xS(0)).attr("y2", H - 8).attr("stroke", C.axis).attr("stroke-width", 1.5);
      // curve
      const pts = []; for (let i = 0; i <= 300; i++) { const x = xd[0] + i * (xd[1] - xd[0]) / 300; pts.push([x, f(x)]); }
      svg.append("path").datum(pts).attr("fill", "none").attr("stroke", C.curve).attr("stroke-width", 2.5).attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom));
      // secant
      const x1 = x0 + h;
      const slope = (f(x1) - f(x0)) / (x1 - x0);
      const trueDeriv = 2 * x0 - 1; // f'(x) = 2x-1
      const secLine = x => f(x0) + slope * (x - x0);
      const tanLine = x => f(x0) + trueDeriv * (x - x0);
      svg.append("line").attr("x1", xS(xd[0])).attr("y1", yS(secLine(xd[0]))).attr("x2", xS(xd[1])).attr("y2", yS(secLine(xd[1]))).attr("stroke", C.sec).attr("stroke-width", 2).attr("stroke-dasharray", "6,3");
      if (h < 0.15) svg.append("line").attr("x1", xS(xd[0])).attr("y1", yS(tanLine(xd[0]))).attr("x2", xS(xd[1])).attr("y2", yS(tanLine(xd[1]))).attr("stroke", C.tan).attr("stroke-width", 2);
      svg.append("circle").attr("cx", xS(x0)).attr("cy", yS(f(x0))).attr("r", 5).attr("fill", C.pt).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      svg.append("circle").attr("cx", xS(x1)).attr("cy", yS(f(x1))).attr("r", 5).attr("fill", C.sec).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      svg.append("text").attr("x", W - 10).attr("y", 18).attr("text-anchor", "end").attr("fill", C.sec).attr("font-size", 11).text(`Secant slope = ${slope.toFixed(4)}`);
      svg.append("text").attr("x", W - 10).attr("y", 34).attr("text-anchor", "end").attr("fill", C.tan).attr("font-size", 11).text(`True slope at x=1: ${trueDeriv}`);
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [h]);

  return (
    <div ref={cRef}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 80 }}>h = {h.toFixed(3)}</span>
        <input type="range" min={0.01} max={1.5} step={0.01} value={h} onChange={e => setH(parseFloat(e.target.value))} style={{ flex: 1, accentColor: "#fbbf24" }} />
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
        Blue = f(x) = x²−x+1 · Gold dashed = secant line through (1, f(1)) and (1+h, f(1+h)) · As h→0, the secant becomes the tangent (green). This is the limit that defines the derivative — Chapter 2's entire project.
      </p>
    </div>
  );
}

const SECTIONS = [
  {
    id: "functions", color: "#7F77DD", bg: "#EEEDFE",
    title: "1.1–1.2 Functions & Their Families",
    keyIdeas: [
      { term: "Function", def: "A rule f: A→B where every input has exactly one output. Vertical line test." },
      { term: "Domain & Range", def: "Domain = valid inputs. Range = actual outputs. Both must be stated." },
      { term: "Composition", def: "(f∘g)(x) = f(g(x)). Order matters: f∘g ≠ g∘f in general." },
      { term: "One-to-one", def: "Each output comes from exactly one input. Passes horizontal line test. Required for inverse to exist." },
    ],
    formula: "f \\circ g(x) = f(g(x)) \\qquad (f \\circ g \\neq g \\circ f \\text{ in general})",
    hardPart: "Composition vs multiplication: f(g(x)) ≠ f(x)·g(x). Always substitute the entire inner function into every x of the outer.",
    bridgeNote: null,
  },
  {
    id: "trig", color: "#1D9E75", bg: "#E1F5EE",
    title: "1.3 Trigonometric Functions",
    keyIdeas: [
      { term: "Unit circle", def: "sin(θ) = y-coordinate, cos(θ) = x-coordinate of point at angle θ on the unit circle." },
      { term: "Key values", def: "sin(0)=0, sin(π/2)=1, sin(π)=0, sin(3π/2)=−1. cos is the same shifted left π/2." },
      { term: "Identities", def: "sin²(x)+cos²(x)=1. sin(2x)=2sin(x)cos(x). These appear constantly in limits and derivatives." },
      { term: "Periodicity", def: "sin and cos have period 2π. tan has period π." },
    ],
    formula: "\\sin^2 x + \\cos^2 x = 1 \\qquad \\lim_{x\\to 0}\\frac{\\sin x}{x} = 1 \\;\\leftarrow \\text{Ch 2 preview}",
    hardPart: "The limit lim(sin x)/x = 1 as x→0 is the single most important trig limit. You'll prove it rigorously in Chapter 2 using the Squeeze Theorem.",
    bridgeNote: "lim(x→0) sin(x)/x = 1",
  },
  {
    id: "inverse", color: "#0891b2", bg: "#ecfeff",
    title: "1.4 Inverse Functions",
    keyIdeas: [
      { term: "Inverse exists iff", def: "f is one-to-one (monotone on the relevant interval). Restrict domain if needed." },
      { term: "Reflection", def: "Graph of f⁻¹ is the graph of f reflected over y=x. Coordinates (a,b) and (b,a) swap." },
      { term: "arcsin, arctan", def: "sin restricted to [−π/2,π/2] → arcsin. tan restricted to (−π/2,π/2) → arctan." },
      { term: "Cancellation", def: "f(f⁻¹(x)) = x and f⁻¹(f(x)) = x. They undo each other." },
    ],
    formula: "f^{-1}(f(x)) = x \\qquad f(f^{-1}(x)) = x",
    hardPart: "arcsin(sin(5π/6)) ≠ 5π/6. arcsin outputs only in [−π/2,π/2]. sin(5π/6)=1/2, so arcsin(1/2)=π/6. Always check principal range.",
    bridgeNote: null,
  },
  {
    id: "explog", color: "#BA7517", bg: "#FAEEDA",
    title: "1.5 Exponential & Logarithmic Functions",
    keyIdeas: [
      { term: "eˣ and ln(x)", def: "Inverse pair. e^(ln x) = x for x>0. ln(eˣ) = x for all x." },
      { term: "Log rules", def: "ln(ab) = ln(a)+ln(b). ln(a/b) = ln(a)−ln(b). ln(aⁿ) = n·ln(a)." },
      { term: "Growth vs decay", def: "y = Ae^(kt): k>0 → exponential growth. k<0 → exponential decay." },
      { term: "e defined via limit", def: "e = lim(n→∞)(1+1/n)ⁿ ≈ 2.71828. This limit is a Chapter 2 concept." },
    ],
    formula: "e = \\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n \\approx 2.718 \\quad \\leftarrow \\text{first real limit}",
    hardPart: "ln and log base 10 are different. ln = log base e. Never confuse them. On exams, 'log' without a base usually means ln in calculus.",
    bridgeNote: "e = lim(1+1/n)ⁿ as n→∞",
  },
];

const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export default function Ch1Review({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("map");
  const [secIdx, setSecIdx] = useState(0);

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Chapter header */}
      <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#534AB7", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 1 Review — OpenStax Calc Vol 1</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "#26215C", marginBottom: 4 }}>Functions & Graphs</div>
        <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>
          This chapter is the vocabulary of calculus. Every concept in Chapters 2–6 lives inside a function. The more fluently you read and compose functions, the faster limits and derivatives will click.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["map", "Chapter map"], ["review", "Section by section"], ["bridge", "Bridge → Ch 2: Limits"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === k ? 500 : 400, border: `0.5px solid ${tab === k ? "#7F77DD" : "var(--color-border-secondary)"}`, background: tab === k ? "#EEEDFE" : "transparent", color: tab === k ? "#534AB7" : "var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>

      {tab === "map" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>What Chapter 1 gives you — and why each piece matters later</div>
            {[
              { ch: "1.1–1.2", topic: "Functions & families", why: "You cannot differentiate something that isn't a function. Domain awareness prevents errors on every exam problem.", color: "#7F77DD" },
              { ch: "1.3", topic: "Trig functions", why: "sin, cos, tan appear in limits (sin x/x), derivatives (cos = d/dx sin), and integrals. Trig is not optional in calc.", color: "#1D9E75" },
              { ch: "1.4", topic: "Inverse functions", why: "arcsin, arctan have specific derivatives (1/√(1−x²), 1/(1+x²)). You derived these from the slope-reciprocal theorem.", color: "#0891b2" },
              { ch: "1.5", topic: "Exp & log", why: "eˣ is its own derivative — the most important function in calculus. ln(x) appears in every integration problem.", color: "#BA7517" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < 3 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ minWidth: 40, fontSize: 11, fontWeight: 600, color: row.color, paddingTop: 2 }}>{row.ch}</div>
                <div style={{ minWidth: 140, fontSize: 13, fontWeight: 500 }}>{row.topic}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{row.why}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>The hardest ideas — what trips students up</div>
            {["Composition f(g(x)) ≠ multiplication f(x)·g(x). Substitute the whole inner function into every x of the outer.",
              "Domain of a composition: must restrict to inputs where g(x) is defined AND g(x) is in the domain of f.",
              "Inverse notation: f⁻¹(x) means the INVERSE function, not 1/f(x). These are completely different things.",
              "ln is log base e, not log base 10. In calculus, 'log' usually means ln. Always clarify."
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#7F77DD", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>!</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "review" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
            {SECTIONS.map((s, i) => (
              <button key={i} onClick={() => setSecIdx(i)} style={{ padding: "4px 11px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === secIdx ? 600 : 400, border: `0.5px solid ${i === secIdx ? s.color : "var(--color-border-secondary)"}`, background: i === secIdx ? s.bg : "transparent", color: i === secIdx ? s.color : "var(--color-text-secondary)" }}>{s.id}</button>
            ))}
          </div>
          {(() => {
            const s = SECTIONS[secIdx];
            return (
              <div style={{ animation: "sd .16s ease-out" }}>
                <div style={{ ...card, borderLeft: `3px solid ${s.color}`, borderRadius: 0, background: s.bg, marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: s.color }}>{s.title}</div>
                </div>
                {s.keyIdeas.map((idea, i) => (
                  <div key={i} style={{ ...card, marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.color, marginBottom: 3 }}>{idea.term}</div>
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{idea.def}</div>
                  </div>
                ))}
                <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center" }}>
                  <M t={s.formula} display ready={ready} />
                </div>
                <div style={{ ...card, borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Common trap</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{s.hardPart}</div>
                </div>
                {s.bridgeNote && (
                  <div style={{ ...card, borderLeft: "3px solid #059669", borderRadius: 0, background: "var(--color-background-success)", marginTop: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-success)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Preview of Chapter 2</div>
                    <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{s.bridgeNote} — this is the first real limit in the book.</div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {tab === "bridge" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #059669", borderRadius: 0, background: "#E1F5EE", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#085041", marginBottom: 6 }}>Chapter 1 → Chapter 2: The Central Question</div>
            <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>
              Chapter 1 defined functions. Chapter 2 asks: what happens to f(x) as x approaches (but never reaches) some value? This is a limit — and it is built entirely on your understanding of functions. The secant line below is a function of h. As h→0, it approaches the tangent. That is your first real limit.
            </div>
          </div>
          <LimitPreviewViz />
          <div style={{ ...card, marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Three Chapter 1 ideas that become Chapter 2 limits</div>
            {[
              { from: "f(x) = (x²−1)/(x−1) — a function with a hole at x=1", to: "lim(x→1) (x²−1)/(x−1) = 2. The limit exists even though the function doesn't. Factoring (algebra from Ch1) reveals it." },
              { from: "sin(x)/x — a trig function divided by x", to: "lim(x→0) sin(x)/x = 1. This is the Squeeze Theorem in action. Used to derive d/dx[sin x] = cos x." },
              { from: "e = lim(1+1/n)ⁿ — the limit definition of e", to: "Exponential growth rates: lim(h→0) (eʰ−1)/h = 1. Used to prove d/dx[eˣ] = eˣ." },
            ].map((item, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ fontSize: 12, color: "#7F77DD", fontWeight: 600, marginBottom: 4 }}>Ch 1: {item.from}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Ch 2: {item.to}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
