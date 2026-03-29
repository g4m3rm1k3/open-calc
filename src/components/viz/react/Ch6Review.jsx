/**
 * Ch6Review.jsx — OpenStax Calc Vol 1
 * End-of-chapter review: Applications of Integration
 * Bridge: What Calc 2 extends from here
 *
 * Sections: 6.1 Areas between curves, 6.2 Volumes by slicing,
 *   6.3 Cylindrical shells, 6.4 Arc length, 6.5 Physical apps,
 *   6.6 Moments/centres, 6.8 Exp growth/decay
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

// ── Area between curves interactive ─────────────────────────────────────────
function AreaViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [split, setSplit] = useState(false);
  const f = x => x * x - 2, g = x => x;

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { axis: isDark ? "#475569" : "#94a3b8", f: isDark ? "#38bdf8" : "#0284c7", g: isDark ? "#f472b6" : "#db2777", fill: isDark ? "rgba(52,211,153,0.2)" : "rgba(5,150,105,0.15)", neg: isDark ? "rgba(248,113,113,0.15)" : "rgba(239,68,68,0.1)", text: isDark ? "#94a3b8" : "#64748b" };
      // Intersections: x²−2 = x → x²−x−2=0 → (x−2)(x+1)=0 → x=−1, x=2
      const W = cRef.current?.clientWidth || 480, H = 200;
      const xd = [-2.5, 3], yd = [-4, 5];
      const xS = d3.scaleLinear().domain(xd).range([32, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      svg.append("line").attr("x1", 32).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.axis).attr("stroke-width", 1.5);
      svg.append("line").attr("x1", xS(0)).attr("y1", 8).attr("x2", xS(0)).attr("y2", H - 8).attr("stroke", C.axis).attr("stroke-width", 1.5);
      // Filled region
      const area = d3.area().x(d => xS(d[0])).y0(d => yS(d[2])).y1(d => yS(d[1])).curve(d3.curveCatmullRom);
      const regionPts = []; for (let i = 0; i <= 200; i++) { const x = -1 + i * 3 / 200; regionPts.push([x, g(x), f(x)]); }
      svg.append("path").datum(regionPts).attr("fill", C.fill).attr("d", area);
      // Curves
      const drawC = (fn, col) => { const pts = []; for (let i = 0; i <= 300; i++) { const x = xd[0] + i * (xd[1] - xd[0]) / 300; const y = fn(x); if (y >= yd[0] - 0.5 && y <= yd[1] + 0.5) pts.push([x, y]); } svg.append("path").datum(pts).attr("fill", "none").attr("stroke", col).attr("stroke-width", 2.5).attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)); };
      drawC(f, C.f); drawC(g, C.g);
      // Intersection points
      [[-1, -1], [2, 2]].forEach(([x, y]) => svg.append("circle").attr("cx", xS(x)).attr("cy", yS(y)).attr("r", 5).attr("fill", "var(--color-text-primary)").attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2));
      svg.append("text").attr("x", xS(-1) - 6).attr("y", yS(-1) - 8).attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 10).text("(−1, −1)");
      svg.append("text").attr("x", xS(2) + 6).attr("y", yS(2) - 8).attr("fill", C.text).attr("font-size", 10).text("(2, 2)");
      svg.append("text").attr("x", xS(0.5)).attr("y", yS(0)).attr("text-anchor", "middle").attr("fill", "#059669").attr("font-size", 11).text("Area = 9/2");
      // Labels
      svg.append("text").attr("x", xS(2.5)).attr("y", yS(f(2.5)) - 6).attr("fill", C.f).attr("font-size", 11).text("y=x²−2");
      svg.append("text").attr("x", xS(2.3)).attr("y", yS(g(2.3)) + 14).attr("fill", C.g).attr("font-size", 11).text("y=x");
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, []);

  return (
    <div ref={cRef}>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
        Area between y=x and y=x²−2 from x=−1 to x=2. Top function minus bottom: ∫₋₁² [x−(x²−2)] dx = ∫₋₁² (−x²+x+2) dx = 9/2.
      </p>
    </div>
  );
}

const APPLICATIONS = [
  {
    name: "Area between curves", color: "#1D9E75",
    formula: "A = \\int_a^b [f(x)-g(x)]\\,dx \\quad (f \\text{ on top})",
    steps: ["Find intersection points — solve f(x)=g(x) for the limits.", "Determine which function is on top (substitute a test point).", "If curves cross, split the integral at crossing points.", "Integrate (top−bottom) over each sub-interval."],
    trap: "If curves cross inside [a,b], you must split. Taking one integral without splitting gives the NET signed area, not total area.",
  },
  {
    name: "Volumes — disk method", color: "#0891b2",
    formula: "V = \\pi\\int_a^b [R(x)]^2\\,dx",
    steps: ["Identify the axis of rotation and the function being rotated.", "R(x) = distance from the axis to the curve.", "Each cross-section is a circle (disk) of area πR².", "Integrate to sum all disks."],
    trap: "For rotation around y=k (not y=0), R(x) = f(x)−k, not just f(x). Forgetting to subtract k is the most common error.",
  },
  {
    name: "Volumes — washer method", color: "#7F77DD",
    formula: "V = \\pi\\int_a^b \\left([R(x)]^2 - [r(x)]^2\\right)\\,dx",
    steps: ["Two curves: outer R(x), inner r(x).", "Each cross-section is a washer (ring) = big circle minus small circle.", "Area of washer = π(R²−r²).", "Integrate."],
    trap: "π(R²−r²) ≠ π(R−r)². You CANNOT subtract before squaring. This is the single most common algebra error in volumes.",
  },
  {
    name: "Exponential growth/decay", color: "#BA7517",
    formula: "y = y_0 e^{kt} \\quad (k>0 \\text{ growth, } k<0 \\text{ decay})",
    steps: ["The ODE dy/dt = ky has solution y = y₀eᵏᵗ.", "Half-life (decay): solve y₀/2 = y₀eᵏᵗ → t = ln(2)/|k|.", "Doubling time (growth): t = ln(2)/k.", "Newton's law of cooling: T(t) = Tₑ + (T₀−Tₑ)eᵏᵗ."],
    trap: "Don't confuse k with the growth rate percentage. If bacteria grow at 3% per hour, k = 0.03 (as a decimal, not 3).",
  },
];

const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export default function Ch6Review({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("applications");
  const [appIdx, setAppIdx] = useState(0);
  const app = APPLICATIONS[appIdx];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#534AB7", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 6 Review — Final Chapter of Calc 1</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "#26215C", marginBottom: 4 }}>Applications of Integration</div>
        <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>
          Chapter 6 is integration put to work. Areas, volumes, arc lengths, centres of mass, exponential models — all use the definite integral as a measurement tool. The pattern is always the same: slice into infinitely thin pieces, integrate the pieces.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["applications", "Applications"], ["area", "Area between curves"], ["strategy", "Problem strategy"], ["bridge", "Bridge → Calc 2"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === k ? 500 : 400, border: `0.5px solid ${tab === k ? "#7F77DD" : "var(--color-border-secondary)"}`, background: tab === k ? "#EEEDFE" : "transparent", color: tab === k ? "#534AB7" : "var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>

      {tab === "applications" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
            {APPLICATIONS.map((a, i) => (
              <button key={i} onClick={() => setAppIdx(i)} style={{ padding: "4px 10px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === appIdx ? 600 : 400, border: `0.5px solid ${i === appIdx ? a.color : "var(--color-border-secondary)"}`, background: i === appIdx ? a.color + "18" : "transparent", color: i === appIdx ? a.color : "var(--color-text-secondary)" }}>{a.name.split(" ")[0]}</button>
            ))}
          </div>
          <div style={{ ...card, borderLeft: `3px solid ${app.color}`, borderRadius: 0, background: app.color + "10" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: app.color, marginBottom: 6 }}>{app.name}</div>
          </div>
          <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center" }}>
            <M t={app.formula} display ready={ready} />
          </div>
          <div style={{ ...card }}>
            {app.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <div style={{ minWidth: 20, height: 20, borderRadius: "50%", background: app.color, color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card, borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Common trap</div>
            <div style={{ fontSize: 13 }}>{app.trap}</div>
          </div>
        </div>
      )}

      {tab === "area" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <AreaViz />
          <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center", marginTop: 10 }}>
            <M t={"\\int_{-1}^{2}[x-(x^2-2)]\\,dx = \\int_{-1}^{2}(-x^2+x+2)\\,dx = \\left[-\\frac{x^3}{3}+\\frac{x^2}{2}+2x\\right]_{-1}^{2} = \\frac{9}{2}"} display ready={ready} />
          </div>
        </div>
      )}

      {tab === "strategy" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Universal strategy for Ch 6 problems</div>
            {["Identify what is being integrated (area, volume, length, etc.).", "Draw a diagram. Label all relevant quantities.", "Set up the representative element — the thin slice (strip, disk, shell, segment).", "Write the integral in terms of one variable. Use the constraint to eliminate others.", "Evaluate using FTC: find an antiderivative, apply the bounds."].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "#7F77DD", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Disk vs Washer vs Shell — which to use?</div>
            {[
              { method: "Disk", when: "Rotating a single curve around an axis, no hole in the solid", formula: "\\pi\\int R^2" },
              { method: "Washer", when: "Rotating two curves (hollow solid) — gap between inner and outer radius", formula: "\\pi\\int(R^2-r^2)" },
              { method: "Shell", when: "Rotating around a vertical axis but integrating with respect to x (or vice versa)", formula: "2\\pi\\int x\\cdot f(x)" },
            ].map((row, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 2 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "#EEEDFE", color: "#7F77DD", fontWeight: 600 }}>{row.method}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{row.when}</span>
                </div>
                <div style={{ marginTop: 4, overflowX: "auto" }}><M t={row.formula} ready={ready} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "bridge" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#085041", marginBottom: 6 }}>The end of Calc 1 — and the start of Calc 2</div>
            <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>
              You have now covered the complete foundation: functions, limits, derivatives, and integrals. Calc 2 extends each of these in power and depth. The tools stay the same; the problems get harder.
            </div>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>What Calc 2 builds on each Calc 1 chapter</div>
            {[
              { from: "Ch 2: Limits", to: "Improper integrals (limits at ∞), sequences and series (limits of sequences)" },
              { from: "Ch 3: Derivatives", to: "Differential equations (solving dy/dx = f(x,y)), parametric/polar calculus" },
              { from: "Ch 4: Optimisation", to: "LaGrange multipliers, constrained optimisation in higher dimensions" },
              { from: "Ch 5: Integration basics", to: "Integration by parts, trig sub, partial fractions — more powerful techniques" },
              { from: "Ch 6: Applications", to: "More volume methods, infinite series, Taylor/Maclaurin series for approximation" },
            ].map((row, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 4 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#7F77DD", marginBottom: 3 }}>{row.from}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{row.to}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#26215C", marginBottom: 6 }}>The single most important thing to carry into Calc 2</div>
            <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>
              The Fundamental Theorem of Calculus is still true. Differentiation and integration are inverse operations. Every technique in Calc 2 is built on that foundation. If you understand why FTC works (not just that it does), Calc 2 will feel like extensions — not new territory.
            </div>
            <div style={{ background: "var(--color-background-primary)", borderRadius: 6, padding: "10px 14px", textAlign: "center", marginTop: 8 }}>
              <M t={"\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x) \\qquad \\int_a^b f'(x)\\,dx = f(b)-f(a)"} display ready={ready} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
