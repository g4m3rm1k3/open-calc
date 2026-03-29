/**
 * Ch4Review.jsx — OpenStax Calc Vol 1
 * End-of-chapter review: Applications of Derivatives
 * Bridge: How the shape analysis tools connect to integration
 *
 * Sections: 4.1 Related Rates, 4.2 Linear Approximation,
 *   4.3 Maxima/Minima, 4.4 Mean Value Theorem,
 *   4.5 Curve Sketching, 4.6 Optimisation, 4.7 L'Hôpital's Rule
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

// ── Curve sketching interactive ──────────────────────────────────────────────
function CurveSketchViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  // f(x) = x³ − 3x² − 9x + 5
  const f = x => x ** 3 - 3 * x ** 2 - 9 * x + 5;
  const fp = x => 3 * x ** 2 - 6 * x - 9;   // = 3(x-3)(x+1)
  const fpp = x => 6 * x - 6;

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { axis: isDark ? "#475569" : "#94a3b8", curve: isDark ? "#38bdf8" : "#0284c7", max: isDark ? "#f87171" : "#ef4444", min: isDark ? "#34d399" : "#059669", inf: isDark ? "#fbbf24" : "#d97706", up: isDark ? "rgba(52,211,153,0.12)" : "rgba(5,150,105,0.07)", dn: isDark ? "rgba(244,114,182,0.08)" : "rgba(219,39,119,0.05)", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 220;
      const xd = [-3, 5], yd = [-30, 30];
      const xS = d3.scaleLinear().domain(xd).range([32, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      // Concavity shading: concave up where x>1 (fpp>0), down where x<1
      svg.append("rect").attr("x", 32).attr("y", 8).attr("width", xS(1) - 32).attr("height", H - 16).attr("fill", C.dn);
      svg.append("rect").attr("x", xS(1)).attr("y", 8).attr("width", W - 8 - xS(1)).attr("height", H - 16).attr("fill", C.up);
      // Axes
      svg.append("line").attr("x1", 32).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.axis).attr("stroke-width", 1.5);
      svg.append("line").attr("x1", xS(0)).attr("y1", 8).attr("x2", xS(0)).attr("y2", H - 8).attr("stroke", C.axis).attr("stroke-width", 1.5);
      // Curve
      const pts = []; for (let i = 0; i <= 400; i++) { const x = xd[0] + i * (xd[1] - xd[0]) / 400; const y = f(x); if (y >= yd[0] - 2 && y <= yd[1] + 2) pts.push([x, y]); }
      svg.append("path").datum(pts).attr("fill", "none").attr("stroke", C.curve).attr("stroke-width", 2.5).attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom));
      // Local max at x=−1
      svg.append("circle").attr("cx", xS(-1)).attr("cy", yS(f(-1))).attr("r", 7).attr("fill", C.max).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      svg.append("text").attr("x", xS(-1) - 10).attr("y", yS(f(-1)) - 10).attr("text-anchor", "end").attr("fill", C.max).attr("font-size", 11).text("Local max (−1, 10)");
      // Local min at x=3
      svg.append("circle").attr("cx", xS(3)).attr("cy", yS(f(3))).attr("r", 7).attr("fill", C.min).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      svg.append("text").attr("x", xS(3) + 10).attr("y", yS(f(3)) + 14).attr("fill", C.min).attr("font-size", 11).text("Local min (3, −22)");
      // Inflection at x=1
      svg.append("circle").attr("cx", xS(1)).attr("cy", yS(f(1))).attr("r", 5).attr("fill", C.inf).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      svg.append("text").attr("x", xS(1) + 4).attr("y", yS(f(1)) - 6).attr("fill", C.inf).attr("font-size", 10).text("Inflection (1, −6)");
      // Shading labels
      svg.append("text").attr("x", xS(-1.5)).attr("y", H - 12).attr("fill", isDark ? "#db2777" : "#db2777").attr("font-size", 10).attr("text-anchor", "middle").text("concave down");
      svg.append("text").attr("x", xS(3)).attr("y", H - 12).attr("fill", isDark ? "#059669" : "#059669").attr("font-size", 10).attr("text-anchor", "middle").text("concave up");
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, []);

  return (
    <div ref={cRef}>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
        f(x)=x³−3x²−9x+5. Red=local max, Green=local min, Gold=inflection. Pink shading=concave down (f″&lt;0), green shading=concave up (f″&gt;0). All found from f′ and f″ — Chapter 3 tools applied in Chapter 4.
      </p>
    </div>
  );
}

// ── MVT visual ───────────────────────────────────────────────────────────────
function MVTViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const f = x => x * x / 3, a = 0, b = 3;
  const avgSlope = (f(b) - f(a)) / (b - a); // = 1
  const cVal = avgSlope / (2 / 3); // fp(c) = 2c/3 = avgSlope → c = 3/2

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { curve: isDark ? "#38bdf8" : "#0284c7", sec: isDark ? "#fbbf24" : "#d97706", tan: isDark ? "#34d399" : "#059669", pt: isDark ? "#f472b6" : "#db2777", axis: isDark ? "#475569" : "#94a3b8", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 180;
      const xd = [-0.5, 3.5], yd = [-0.2, 4];
      const xS = d3.scaleLinear().domain(xd).range([32, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      svg.append("line").attr("x1", 32).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.axis).attr("stroke-width", 1.5);
      const pts = []; for (let i = 0; i <= 200; i++) { const x = xd[0] + i * (xd[1] - xd[0]) / 200; pts.push([x, f(x)]); }
      svg.append("path").datum(pts).attr("fill", "none").attr("stroke", C.curve).attr("stroke-width", 2.5).attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom));
      // Secant (a,b)
      svg.append("line").attr("x1", xS(a)).attr("y1", yS(f(a))).attr("x2", xS(b)).attr("y2", yS(f(b))).attr("stroke", C.sec).attr("stroke-width", 2);
      // Tangent at c parallel to secant
      const len = 1.2;
      svg.append("line").attr("x1", xS(cVal - len)).attr("y1", yS(f(cVal) - avgSlope * len)).attr("x2", xS(cVal + len)).attr("y2", yS(f(cVal) + avgSlope * len)).attr("stroke", C.tan).attr("stroke-width", 2);
      [a, b, cVal].forEach((x, i) => {
        svg.append("circle").attr("cx", xS(x)).attr("cy", yS(f(x))).attr("r", 5).attr("fill", [C.sec, C.sec, C.tan][i]).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      });
      svg.append("text").attr("x", xS(cVal) + 6).attr("y", yS(f(cVal)) - 6).attr("fill", C.tan).attr("font-size", 11).text(`c = ${cVal} (parallel tangent)`);
      svg.append("text").attr("x", xS((a + b) / 2)).attr("y", yS(f((a + b) / 2) + 0.4)).attr("text-anchor", "middle").attr("fill", C.sec).attr("font-size", 10).text("secant");
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, []);

  return (
    <div ref={cRef}>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
        MVT: somewhere between a and b there is a point c where the tangent slope (green) equals the secant slope (gold). f(x)=x²/3 on [0,3]: average slope = 1. MVT guarantees c = 3/2 where f′(3/2) = 1.
      </p>
    </div>
  );
}

const CH4_SECTIONS = [
  { sec: "4.1", title: "Related Rates", color: "#7F77DD", key: "Implicit differentiation applied to quantities changing with time. Chain rule: d/dt[x²] = 2x·(dx/dt). Draw a diagram, write the geometric relationship, differentiate both sides with respect to t." },
  { sec: "4.2", title: "Linear Approximation & Differentials", color: "#1D9E75", key: "L(x) = f(a) + f′(a)(x−a) is the tangent line — the best linear approximation near a. Differentials: dy = f′(x)·dx approximates the actual change Δy." },
  { sec: "4.3", title: "Maxima & Minima", color: "#0891b2", key: "EVT: continuous on [a,b] → max and min exist. Fermat: local extremum at c → f′(c)=0. Closed interval method: evaluate f at critical points + endpoints." },
  { sec: "4.4", title: "Mean Value Theorem", color: "#BA7517", key: "If f continuous on [a,b] and differentiable on (a,b), then ∃c ∈ (a,b) with f′(c) = [f(b)−f(a)]/(b−a). The instantaneous rate equals the average rate somewhere." },
  { sec: "4.5", title: "Curve Sketching", color: "#A32D2D", key: "Use f′ for intervals of increase/decrease and critical points. Use f″ for concavity and inflection points. Combine with domain, intercepts, asymptotes." },
  { sec: "4.6", title: "Applied Optimisation", color: "#6366f1", key: "Write the objective function (what to maximise/minimise). Write the constraint. Use it to eliminate a variable. Differentiate, set = 0, verify with first or second derivative test." },
  { sec: "4.7", title: "L'Hôpital's Rule", color: "#0891b2", key: "0/0 or ∞/∞ form: lim f/g = lim f′/g′. Only apply when the indeterminate form is confirmed first. Can be applied repeatedly." },
];

const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export default function Ch4Review({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("map");
  const [secIdx, setSecIdx] = useState(0);

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ ...card, borderLeft: "3px solid #A32D2D", borderRadius: 0, background: "#FCEBEB", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#A32D2D", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 4 Review</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "#501313", marginBottom: 4 }}>Applications of Derivatives</div>
        <div style={{ fontSize: 13, color: "#791F1F", lineHeight: 1.7 }}>
          Chapter 3 was computation. Chapter 4 is interpretation: what does the derivative tell us about the real world? Optimisation, curve shape, related rates, approximation — all built on f′ and f″.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["map", "Section map"], ["sketch", "Curve sketching"], ["mvt", "Mean Value Theorem"], ["bridge", "Bridge → Ch 5: Integration"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === k ? 500 : 400, border: `0.5px solid ${tab === k ? "#A32D2D" : "var(--color-border-secondary)"}`, background: tab === k ? "#FCEBEB" : "transparent", color: tab === k ? "#791F1F" : "var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>

      {tab === "map" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
            {CH4_SECTIONS.map((s, i) => (
              <button key={i} onClick={() => setSecIdx(i)} style={{ padding: "4px 10px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === secIdx ? 600 : 400, border: `0.5px solid ${i === secIdx ? s.color : "var(--color-border-secondary)"}`, background: i === secIdx ? s.color + "18" : "transparent", color: i === secIdx ? s.color : "var(--color-text-secondary)" }}>{s.sec}</button>
            ))}
          </div>
          <div style={{ ...card, borderLeft: `3px solid ${CH4_SECTIONS[secIdx].color}`, borderRadius: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: CH4_SECTIONS[secIdx].color, marginBottom: 6 }}>{CH4_SECTIONS[secIdx].title}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{CH4_SECTIONS[secIdx].key}</div>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>The one algorithm you must know cold — Closed Interval Method</div>
            {["Find f′(x). Solve f′(x)=0. Note where f′ doesn't exist. These are critical points.", "Discard critical points NOT in [a,b].", "Build a table: evaluate f at every critical point in [a,b] AND at x=a and x=b.", "Largest value in table = absolute maximum. Smallest = absolute minimum."].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "#A32D2D", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "sketch" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <CurveSketchViz />
          <div style={{ ...card, marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Curve sketching checklist</div>
            {["Domain: where is f defined?", "Intercepts: f(0) = y-intercept. Solve f(x)=0 for x-intercepts.", "Asymptotes: vertical where denominator=0, horizontal via limit as x→±∞.", "f′: find critical points, determine increase/decrease intervals.", "f″: find inflection points, determine concavity intervals.", "Sketch: combine all above. Label key points."].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, fontSize: 13 }}>
                <span style={{ color: "#A32D2D", fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
                <span style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "mvt" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #BA7517", borderRadius: 0, background: "#FAEEDA", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#412402", marginBottom: 6 }}>Mean Value Theorem</div>
            <M t={"\\text{If } f \\in C[a,b] \\text{ and differentiable on } (a,b) \\Rightarrow \\exists c: f'(c) = \\frac{f(b)-f(a)}{b-a}"} display ready={ready} />
            <div style={{ fontSize: 13, color: "#633806", lineHeight: 1.7, marginTop: 8 }}>
              The instantaneous rate somewhere equals the average rate over the whole interval. Real meaning: if you average 60 mph over a trip, at some exact moment you were going exactly 60 mph.
            </div>
          </div>
          <MVTViz />
        </div>
      )}

      {tab === "bridge" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#085041", marginBottom: 6 }}>Chapter 4 → Chapter 5: The anti-problem</div>
            <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>
              Chapter 4 used derivatives to understand functions. Chapter 5 asks the reverse: given f′(x), what is f(x)? This is antidifferentiation — and it leads to the integral, the area problem, and the most beautiful theorem in calculus.
            </div>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>How Chapter 4 previews integration</div>
            {[
              { ch4: "MVT: if f′(c) = 0 on (a,b), then f is constant on (a,b)", ch5: "Antiderivatives differ by at most a constant — the +C in every integral" },
              { ch4: "Linear approximation: Δy ≈ f′(x)·Δx", ch5: "Riemann sum: total area ≈ Σf(xᵢ)·Δx — sum of thin rectangles" },
              { ch4: "f′ > 0 means f increasing — rate of change positive", ch5: "If f′ > 0 on [a,b], the net change f(b)−f(a) = ∫f′ dt > 0 (FTC)" },
              { ch4: "L'Hôpital's rule uses derivatives to evaluate limits", ch5: "Improper integrals and convergence also require limit analysis" },
            ].map((row, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 3 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: "#FCEBEB", color: "#A32D2D", fontWeight: 600, flexShrink: 0, marginTop: 1 }}>Ch 4</span>
                  <span style={{ fontSize: 13 }}>{row.ch4}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 4 }}>
                  <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: "#E1F5EE", color: "#1D9E75", fontWeight: 600, flexShrink: 0 }}>Ch 5</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{row.ch5}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
