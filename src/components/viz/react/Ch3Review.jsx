/**
 * Ch3Review.jsx — OpenStax Calc Vol 1
 * End-of-chapter review: Derivatives
 * Bridge: How differentiation rules enable optimisation
 *
 * Sections: 3.1 Tangent Lines, 3.2 Derivative as Function,
 *   3.3 Differentiation Rules, 3.4 Rates of Change,
 *   3.5 Chain Rule, 3.6 Implicit Diff, 3.7 Derivatives of Inverse,
 *   3.8 Exp/Log Derivatives, 3.9 Higher Order
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

// ── Rule decision tree visual ────────────────────────────────────────────────
function RuleDecisionTree({ ready }) {
  const steps = [
    { q: "What is the OUTERMOST structure?", opts: ["Sum / Difference", "Product f·g", "Quotient f/g", "Composition f(g(x))"] },
    { q: "Sum/Difference → split and differentiate each term separately.", formula: "(f \\pm g)' = f' \\pm g'", color: "#7F77DD" },
    { q: "Product → product rule. Each factor may need chain rule inside.", formula: "(fg)' = f'g + fg'", color: "#1D9E75" },
    { q: "Quotient → quotient rule. Or rewrite as f·g⁻¹ (product).", formula: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}", color: "#0891b2" },
    { q: "Composition → chain rule. Work outside → inside.", formula: "(f \\circ g)' = f'(g(x))\\cdot g'(x)", color: "#BA7517" },
  ];
  const [sel, setSel] = useState(null);
  return (
    <div>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>{steps[0].q}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {steps[0].opts.map((opt, i) => (
            <button key={i} onClick={() => setSel(i + 1)} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${sel === i + 1 ? ["#7F77DD", "#1D9E75", "#0891b2", "#BA7517"][i] : "var(--color-border-secondary)"}`, background: sel === i + 1 ? ["#EEEDFE", "#E1F5EE", "#ecfeff", "#FAEEDA"][i] : "transparent", color: sel === i + 1 ? ["#7F77DD", "#1D9E75", "#0891b2", "#BA7517"][i] : "var(--color-text-secondary)", cursor: "pointer", fontSize: 13, textAlign: "left" }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
      {sel && (
        <div style={{ background: "var(--color-background-primary)", border: `1.5px solid ${steps[sel].color}`, borderRadius: 8, padding: "12px 14px", animation: "sd .16s ease-out" }}>
          <div style={{ fontSize: 13, color: steps[sel].color, marginBottom: 8 }}>{steps[sel].q}</div>
          <M t={steps[sel].formula} display ready={ready} />
        </div>
      )}
    </div>
  );
}

// ── f, f', f'' simultaneous graph ───────────────────────────────────────────
function ThreeDerivGraph() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [fnKey, setFnKey] = useState("cubic");
  const fns = {
    cubic: { label: "x³−3x", f: x => x ** 3 - 3 * x, fp: x => 3 * x ** 2 - 3, fpp: x => 6 * x },
    sin: { label: "sin(x)", f: Math.sin, fp: Math.cos, fpp: x => -Math.sin(x) },
    exp: { label: "eˣ/4", f: x => Math.exp(x) / 4, fp: x => Math.exp(x) / 4, fpp: x => Math.exp(x) / 4 },
  };
  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { axis: isDark ? "#475569" : "#94a3b8", grid: isDark ? "#1e293b" : "#f1f5f9", f: isDark ? "#38bdf8" : "#0284c7", fp: isDark ? "#34d399" : "#059669", fpp: isDark ? "#fbbf24" : "#d97706", text: isDark ? "#94a3b8" : "#64748b" };
      const { f, fp, fpp } = fns[fnKey];
      const W = cRef.current?.clientWidth || 480, H = 180;
      const xd = [-3, 3], yd = [-4, 4];
      const xS = d3.scaleLinear().domain(xd).range([32, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      xS.ticks(6).forEach(v => svg.append("line").attr("x1", xS(v)).attr("y1", 8).attr("x2", xS(v)).attr("y2", H - 8).attr("stroke", C.grid).attr("stroke-width", 1));
      svg.append("line").attr("x1", 32).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.axis).attr("stroke-width", 1.5);
      const drawC = (fn, col, dash) => {
        const pts = []; for (let i = 0; i <= 300; i++) { const x = xd[0] + i * (xd[1] - xd[0]) / 300; const y = fn(x); if (isFinite(y) && y >= yd[0] - 0.5 && y <= yd[1] + 0.5) pts.push([x, y]); }
        if (pts.length < 2) return;
        svg.append("path").datum(pts).attr("fill", "none").attr("stroke", col).attr("stroke-width", 2.5).attr("stroke-dasharray", dash || "none").attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom));
      };
      drawC(f, C.f); drawC(fp, C.fp); drawC(fpp, C.fpp, "5,3");
      [{ c: C.f, l: "f" }, { c: C.fp, l: "f′" }, { c: C.fpp, l: "f″", d: "5,3" }].forEach(({ c, l, d }, i) => {
        svg.append("line").attr("x1", 38).attr("y1", 16 + i * 16).attr("x2", 54).attr("y2", 16 + i * 16).attr("stroke", c).attr("stroke-width", 2).attr("stroke-dasharray", d || "none");
        svg.append("text").attr("x", 58).attr("y", 20 + i * 16).attr("fill", C.text).attr("font-size", 11).text(l);
      });
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [fnKey]);
  return (
    <div ref={cRef}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {Object.entries({ cubic: "x³−3x", sin: "sin(x)", exp: "eˣ/4" }).map(([k, l]) => (
          <button key={k} onClick={() => setFnKey(k)} style={{ padding: "3px 10px", borderRadius: 14, fontSize: 12, cursor: "pointer", border: `0.5px solid ${fnKey === k ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: fnKey === k ? "var(--color-background-info)" : "transparent", color: fnKey === k ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>Note for eˣ: all three curves are identical. d/dx[eˣ] = eˣ — it is its own derivative at every order.</p>
    </div>
  );
}

const RULES = [
  { name: "Power", formula: "\\frac{d}{dx}x^n = nx^{n-1}", note: "Works for all real n — positive, negative, fractional." },
  { name: "Product", formula: "(fg)' = f'g + fg'", note: "Two terms. The first factor differentiates, the second stays. Then swap." },
  { name: "Quotient", formula: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}", note: "Minus sign in numerator — order matters. Low·d(high) − high·d(low) all over low-squared." },
  { name: "Chain", formula: "(f\\circ g)' = f'(g(x))\\cdot g'(x)", note: "Outer derivative evaluated at inner, times inner derivative. Work outside-in." },
  { name: "sin/cos", formula: "(\\sin x)' = \\cos x \\qquad (\\cos x)' = -\\sin x", note: "The negative belongs to cos, not sin. Cycle: sin→cos→−sin→−cos→sin." },
  { name: "eˣ / ln", formula: "(e^x)' = e^x \\qquad (\\ln x)' = \\frac{1}{x}", note: "eˣ is its own derivative. ln(x) has domain x>0." },
  { name: "arctan/arcsin", formula: "(\\arctan x)' = \\frac{1}{1+x^2} \\qquad (\\arcsin x)' = \\frac{1}{\\sqrt{1-x^2}}", note: "Derived by implicit differentiation on tan(y)=x and sin(y)=x." },
];

const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export default function Ch3Review({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("rules");
  const [ruleIdx, setRuleIdx] = useState(0);

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ ...card, borderLeft: "3px solid #0891b2", borderRadius: 0, background: "#ecfeff", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#0891b2", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 3 Review</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "#0e7490", marginBottom: 4 }}>Derivatives</div>
        <div style={{ fontSize: 13, color: "#0e7490", lineHeight: 1.7 }}>
          Chapter 3 is the computational engine of calculus. You learned rules for differentiating every function you know. Chapter 4 uses those rules to answer real questions: where are maxima? When is a curve concave up? What is the optimal solution?
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["rules", "Differentiation rules"], ["decision", "Which rule to use"], ["higher", "f, f′, f″"], ["bridge", "Bridge → Ch 4: Applications"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === k ? 500 : 400, border: `0.5px solid ${tab === k ? "#0891b2" : "var(--color-border-secondary)"}`, background: tab === k ? "#ecfeff" : "transparent", color: tab === k ? "#0e7490" : "var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>

      {tab === "rules" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
            {RULES.map((r, i) => (
              <button key={i} onClick={() => setRuleIdx(i)} style={{ padding: "4px 10px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === ruleIdx ? 600 : 400, border: `0.5px solid ${i === ruleIdx ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === ruleIdx ? "var(--color-background-info)" : "transparent", color: i === ruleIdx ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>{r.name}</button>
            ))}
          </div>
          <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center", marginBottom: 8 }}>
            <M t={RULES[ruleIdx].formula} display ready={ready} />
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{RULES[ruleIdx].note}</div>
          </div>
        </div>
      )}

      {tab === "decision" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #BA7517", borderRadius: 0, background: "#FAEEDA", marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: "#412402", lineHeight: 1.7 }}>
              The decision is always: look at the OUTERMOST structure. That determines which rule applies first. Then recurse inward. This is the "PEMDAS" of differentiation.
            </div>
          </div>
          <RuleDecisionTree ready={ready} />
        </div>
      )}

      {tab === "higher" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <ThreeDerivGraph />
          <div style={{ ...card, marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>What f′ and f″ tell you about f's shape</div>
            {[
              { cond: "f′ > 0", meaning: "f is increasing — moving up as x increases" },
              { cond: "f′ < 0", meaning: "f is decreasing — moving down as x increases" },
              { cond: "f′ = 0", meaning: "Critical point — candidate for local max or min" },
              { cond: "f″ > 0", meaning: "Concave up — curve bends upward (holds water)" },
              { cond: "f″ < 0", meaning: "Concave down — curve bends downward (spills water)" },
              { cond: "f″ = 0, changes sign", meaning: "Inflection point — concavity switches" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "6px 0", borderBottom: i < 5 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ minWidth: 100, fontSize: 13, fontFamily: "var(--font-serif)" }}><M t={row.cond} ready={ready} /></div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{row.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "bridge" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #A32D2D", borderRadius: 0, background: "#FCEBEB", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#501313", marginBottom: 6 }}>Chapter 3 → Chapter 4: Using derivatives to analyse functions</div>
            <div style={{ fontSize: 13, color: "#791F1F", lineHeight: 1.7 }}>
              Chapter 3 taught you how to compute f′(x). Chapter 4 teaches you what to do with it: find where a function is largest or smallest, sketch curves precisely, and solve real-world optimisation problems.
            </div>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Every Chapter 4 tool uses Chapter 3 computation</div>
            {[
              { ch3: "Compute f′(x)", ch4: "→ Set f′=0 to find critical points (Fermat's Theorem)" },
              { ch3: "Compute f″(x)", ch4: "→ Second Derivative Test: f″>0 at crit point → local min, f″<0 → local max" },
              { ch3: "Sign of f′ on an interval", ch4: "→ First Derivative Test: f′ changes + to − → local max, − to + → local min" },
              { ch3: "Sign of f″ on an interval", ch4: "→ Concavity: f″>0 → concave up, f″<0 → concave down" },
              { ch3: "Find where f′=0 and f″=0", ch4: "→ Closed interval method: evaluate f at critical points + endpoints → absolute extrema" },
            ].map((row, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 4 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "#ecfeff", color: "#0891b2", fontWeight: 600, flexShrink: 0 }}>Ch 3</span>
                  <span style={{ fontSize: 13 }}>{row.ch3}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "#FCEBEB", color: "#A32D2D", fontWeight: 600, flexShrink: 0 }}>Ch 4</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{row.ch4}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
