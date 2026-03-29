/**
 * Ch1Applied.jsx — Functions in the Real World
 * Companion to Ch1Review. Applied problems using Ch1 tools.
 * Topics: domain restrictions, piecewise pricing, composition chains,
 *         demand/supply functions, transformation meaning.
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

// ── Demand curve: how transformations shift real economics ──────────────────
function DemandViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [shift, setShift] = useState(0);    // price shift (advertising)
  const [stretch, setStretch] = useState(1); // income stretch

  // Base demand: p = 50 - 2q (price as function of quantity)
  // With shift: p = 50 + shift - 2q/stretch
  const demand = q => (50 + shift) - (2 / stretch) * q;
  const supply = q => 5 + 1.5 * q;

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { axis: isDark ? "#475569" : "#94a3b8", dem: isDark ? "#38bdf8" : "#0284c7", sup: isDark ? "#34d399" : "#059669", eq: isDark ? "#fbbf24" : "#d97706", shade: isDark ? "rgba(56,189,248,0.12)" : "rgba(2,132,199,0.08)", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 200;
      const qd = [0, 25], pd = [0, 60];
      const xS = d3.scaleLinear().domain(qd).range([40, W - 8]);
      const yS = d3.scaleLinear().domain(pd).range([H - 24, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      // Axes
      svg.append("line").attr("x1", 40).attr("y1", H - 24).attr("x2", W - 8).attr("y2", H - 24).attr("stroke", C.axis).attr("stroke-width", 1.5);
      svg.append("line").attr("x1", 40).attr("y1", 8).attr("x2", 40).attr("y2", H - 24).attr("stroke", C.axis).attr("stroke-width", 1.5);
      svg.append("text").attr("x", W / 2).attr("y", H - 6).attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 10).text("Quantity (q)");
      svg.append("text").attr("x", 14).attr("y", H / 2).attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 10).attr("transform", `rotate(-90,14,${H / 2})`).text("Price ($)");
      // Equilibrium
      // supply = demand: 5 + 1.5q = 50 + shift - (2/stretch)q → q*(1.5 + 2/stretch) = 45 + shift
      const qEq = (45 + shift) / (1.5 + 2 / stretch);
      const pEq = supply(qEq);
      // Shade consumer surplus
      const csPts = [[0, demand(0)], [qEq, pEq]];
      for (let i = 0; i <= 50; i++) { const q = qEq * i / 50; csPts.push([q, demand(q)]); }
      csPts.push([0, pEq]);
      // Draw
      svg.append("line").attr("x1", xS(0)).attr("y1", yS(demand(0))).attr("x2", xS(qd[1])).attr("y2", yS(demand(qd[1]))).attr("stroke", C.dem).attr("stroke-width", 2.5);
      svg.append("line").attr("x1", xS(0)).attr("y1", yS(supply(0))).attr("x2", xS(qd[1])).attr("y2", yS(supply(qd[1]))).attr("stroke", C.sup).attr("stroke-width", 2.5);
      // Equilibrium point
      if (qEq > 0 && qEq < qd[1]) {
        svg.append("circle").attr("cx", xS(qEq)).attr("cy", yS(pEq)).attr("r", 6).attr("fill", C.eq).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
        svg.append("line").attr("x1", 40).attr("y1", yS(pEq)).attr("x2", xS(qEq)).attr("y2", yS(pEq)).attr("stroke", C.eq).attr("stroke-width", 1).attr("stroke-dasharray", "4,3");
        svg.append("line").attr("x1", xS(qEq)).attr("y1", H - 24).attr("x2", xS(qEq)).attr("y2", yS(pEq)).attr("stroke", C.eq).attr("stroke-width", 1).attr("stroke-dasharray", "4,3");
        svg.append("text").attr("x", xS(qEq) + 6).attr("y", yS(pEq) - 6).attr("fill", C.eq).attr("font-size", 10).text(`Eq: ($${pEq.toFixed(1)}, q=${qEq.toFixed(1)})`);
      }
      // Labels
      svg.append("text").attr("x", xS(22)).attr("y", yS(demand(22)) - 6).attr("fill", C.dem).attr("font-size", 11).text("Demand");
      svg.append("text").attr("x", xS(20)).attr("y", yS(supply(20)) + 14).attr("fill", C.sup).attr("font-size", 11).text("Supply");
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [shift, stretch]);

  return (
    <div ref={cRef}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>Advertising boost (vertical shift +{shift})</div>
          <input type="range" min={-10} max={20} step={1} value={shift} onChange={e => setShift(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#0284c7" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>Income effect (horizontal stretch ×{stretch.toFixed(1)})</div>
          <input type="range" min={0.5} max={2} step={0.1} value={stretch} onChange={e => setStretch(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#059669" }} />
        </div>
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
        Advertising shifts demand UP (vertical shift — consumers willing to pay more at every quantity). Rising incomes stretch it RIGHT (horizontal stretch — consumers buy more at every price). Both are function transformations from Ch1.
      </p>
    </div>
  );
}

const PROBLEMS = [
  {
    title: "Domain restriction: why √(100−x²) fails for x>10",
    context: "A circular field has radius 10 m. The area of a rectangle inscribed in it is A(x) = 2x·√(100−x²) where x is the half-width.",
    setup: "A(x) = 2x\\sqrt{100-x^2}",
    question: "What is the domain? Why can't x = 11?",
    steps: [
      { label: "Inside the square root must be ≥ 0", math: "100 - x^2 \\geq 0 \\Rightarrow x^2 \\leq 100 \\Rightarrow -10 \\leq x \\leq 10" },
      { label: "But x is a length — must be positive", math: "0 < x < 10 \\quad \\text{(open: at endpoints area = 0, not useful)}" },
      { label: "Why x=11 fails", math: "A(11) = 2(11)\\sqrt{100-121} = 22\\sqrt{-21} \\quad \\leftarrow \\text{not real!}" },
    ],
    answer: "Domain = (0, 10). The geometry imposes the restriction — a rectangle wider than the diameter of the circle is physically impossible.",
    watchFor: "Always ask: does the formula produce a real, meaningful number? Domain isn't just algebra — it's physical feasibility.",
  },
  {
    title: "Composition: manufacturing chain cost",
    context: "Steel is melted into ingots (g), ingots are rolled into sheets (h), sheets are cut into parts (f). Total cost per unit of raw material r is f(h(g(r))).",
    setup: "g(r) = 3r,\\; h(s) = s^{1/2},\\; f(t) = 2t+10",
    question: "Find the total cost function C(r) = f(h(g(r))) and its domain.",
    steps: [
      { label: "g(r) = 3r: raw material → ingots", math: "g(r) = 3r" },
      { label: "h(g(r)) = √(3r): ingots → sheets", math: "h(g(r)) = \\sqrt{3r}" },
      { label: "f(h(g(r))): sheets → parts cost", math: "C(r) = f(\\sqrt{3r}) = 2\\sqrt{3r}+10" },
      { label: "Domain: need 3r ≥ 0", math: "r \\geq 0 \\quad \\text{(can't have negative raw material)}" },
    ],
    answer: "C(r) = 2√(3r)+10. Domain r≥0. The composition chains the three processes — and each step's output must be valid input for the next.",
    watchFor: "In a composition chain, the domain of the whole is restricted by EVERY intermediate step. If any step fails, the whole chain fails.",
  },
  {
    title: "Piecewise function: tiered pricing",
    context: "A cloud storage service charges: $0/month for 0–5 GB, $2/GB for 5–50 GB (above the free tier), $1.50/GB for usage above 50 GB.",
    setup: "C(x) = \\begin{cases} 0 & 0\\leq x\\leq 5 \\\\ 2(x-5) & 5 < x \\leq 50 \\\\ 90 + 1.5(x-50) & x > 50 \\end{cases}",
    question: "Find the monthly cost for 30 GB and 80 GB.",
    steps: [
      { label: "x = 30: use middle piece (5 < 30 ≤ 50)", math: "C(30) = 2(30-5) = 2(25) = \\$50" },
      { label: "x = 80: use bottom piece (80 > 50)", math: "C(80) = 90 + 1.5(80-50) = 90 + 45 = \\$135" },
      { label: "Check continuity at x = 50", math: "\\lim_{x\\to50^-}C(x) = 2(45)=90 \\quad C(50)=90 \\quad \\checkmark" },
    ],
    answer: "30 GB → $50. 80 GB → $135. The function is continuous at x=50 (pricing doesn't jump), but its slope changes (marginal cost drops from $2/GB to $1.50/GB).",
    watchFor: "When using a piecewise function, first identify which piece applies to your input. Using the wrong piece is the most common error.",
  },
];

const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export default function Ch1Applied({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("demand");
  const [probIdx, setProbIdx] = useState(0);
  const [reveal, setReveal] = useState(0);
  const p = PROBLEMS[probIdx];

  const tabBtn = (key, label, color) => ({ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === key ? 500 : 400, border: `0.5px solid ${tab === key ? color : "var(--color-border-secondary)"}`, background: tab === key ? color + "22" : "transparent", color: tab === key ? color : "var(--color-text-secondary)" });

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#534AB7", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 1 — Applied Problems</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#26215C", marginBottom: 4 }}>Functions in the Real World</div>
        <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>Functions are not abstract math objects — they model real systems. Domain restrictions reflect physical constraints. Composition models multi-step processes. Transformations represent real economic shifts.</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["demand", "Supply & demand", "#7F77DD"], ["problems", "Worked problems", "#1D9E75"]].map(([k, l, c]) => (
          <button key={k} onClick={() => setTab(k)} style={tabBtn(k, l, c)}>{l}</button>
        ))}
      </div>

      {tab === "demand" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Function transformations in economics</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 10 }}>
              Demand: p = 50 − 2q. Supply: p = 5 + 1.5q. These are linear functions. The equilibrium point is where they intersect — set equal and solve. Drag the sliders to see how real-world events (advertising, income changes) transform the demand function and shift the equilibrium.
            </div>
            <DemandViz />
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>What each transformation means economically</div>
            {[
              { transform: "Vertical shift up (+k)", econ: "Advertising or preference increase — consumers will pay more at every quantity", math: "p = (50+k) - 2q" },
              { transform: "Horizontal stretch (×c)", econ: "Rising incomes — consumers buy more at every price level", math: "p = 50 - (2/c)q" },
              { transform: "Vertical shift down (−k)", econ: "Competitor enters market — price consumers will pay drops", math: "p = (50-k) - 2q" },
            ].map((row, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 2 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#7F77DD", marginBottom: 3 }}>{row.transform}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{row.econ}</div>
                <M t={row.math} ready={ready} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "problems" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
            {PROBLEMS.map((pr, i) => (
              <button key={i} onClick={() => { setProbIdx(i); setReveal(0); }} style={{ padding: "4px 11px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === probIdx ? 600 : 400, border: `0.5px solid ${i === probIdx ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === probIdx ? "var(--color-background-info)" : "transparent", color: i === probIdx ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>
                {["Domain", "Composition", "Piecewise"][i]}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: 8 }}>{p.context}</div>
          <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center", marginBottom: 8 }}><M t={p.setup} display ready={ready} /></div>
          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Question: {p.question}</div>
          </div>
          {p.steps.map((st, i) => {
            if (i > reveal) return null;
            return (
              <div key={i} style={{ ...card, borderLeft: `3px solid ${i === p.steps.length - 1 ? "#1D9E75" : "#7F77DD"}`, borderRadius: 0, animation: "sd .16s ease-out" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{st.label}</div>
                <M t={st.math} display ready={ready} />
              </div>
            );
          })}
          {reveal < p.steps.length - 1 && <button onClick={() => setReveal(r => r + 1)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer", fontSize: 13, fontWeight: 500, marginTop: 4 }}>▶ Next step</button>}
          {reveal === p.steps.length - 1 && (
            <>
              <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "var(--color-background-success)", marginTop: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-success)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Answer</div>
                <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{p.answer}</div>
              </div>
              <div style={{ ...card, borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Watch out for</div>
                <div style={{ fontSize: 13 }}>{p.watchFor}</div>
              </div>
            </>
          )}
          {reveal > 0 && <button onClick={() => setReveal(0)} style={{ marginTop: 8, padding: "4px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12 }}>← Reset</button>}
        </div>
      )}
    </div>
  );
}
