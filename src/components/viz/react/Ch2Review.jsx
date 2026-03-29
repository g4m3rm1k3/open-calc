/**
 * Ch2Review.jsx — OpenStax Calc Vol 1
 * End-of-chapter review: Limits
 * Bridge: How limits define the derivative
 *
 * Sections: 2.1 Preview, 2.2 Limit of a Function, 2.3 Limit Laws,
 *           2.4 Continuity, 2.5 Precise Definition (ε-δ)
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

// ── ε-δ visualiser ───────────────────────────────────────────────────────────
function EpsilonDeltaViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [eps, setEps] = useState(0.8);
  // f(x) = 2x − 1, limit at x=2 is L=3
  const f = x => 2 * x - 1, a = 2, L = 3;
  const delta = eps / 2; // for this linear function, δ = ε/|slope| = ε/2

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { axis: isDark ? "#475569" : "#94a3b8", curve: isDark ? "#38bdf8" : "#0284c7", eps: isDark ? "#34d399" : "#059669", delta: isDark ? "#fbbf24" : "#d97706", pt: isDark ? "#f472b6" : "#db2777", grid: isDark ? "#1e293b" : "#f1f5f9", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 220;
      const xd = [0, 4], yd = [-0.5, 7];
      const xS = d3.scaleLinear().domain(xd).range([32, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      // ε band (horizontal)
      svg.append("rect").attr("x", 32).attr("y", yS(L + eps)).attr("width", W - 40).attr("height", yS(L - eps) - yS(L + eps)).attr("fill", isDark ? "rgba(52,211,153,0.12)" : "rgba(5,150,105,0.08)");
      // δ band (vertical)
      svg.append("rect").attr("x", xS(a - delta)).attr("y", 8).attr("width", xS(a + delta) - xS(a - delta)).attr("height", H - 16).attr("fill", isDark ? "rgba(251,191,36,0.1)" : "rgba(217,119,6,0.07)");
      // Axes
      svg.append("line").attr("x1", 32).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.axis).attr("stroke-width", 1.5);
      svg.append("line").attr("x1", xS(0)).attr("y1", 8).attr("x2", xS(0)).attr("y2", H - 8).attr("stroke", C.axis).attr("stroke-width", 1.5);
      // Curve
      svg.append("line").attr("x1", xS(xd[0])).attr("y1", yS(f(xd[0]))).attr("x2", xS(xd[1])).attr("y2", yS(f(xd[1]))).attr("stroke", C.curve).attr("stroke-width", 2.5);
      // L and a markers
      svg.append("line").attr("x1", 32).attr("y1", yS(L)).attr("x2", W - 8).attr("y2", yS(L)).attr("stroke", C.eps).attr("stroke-width", 1).attr("stroke-dasharray", "4,3");
      svg.append("line").attr("x1", xS(a)).attr("y1", 8).attr("x2", xS(a)).attr("y2", H - 8).attr("stroke", C.delta).attr("stroke-width", 1).attr("stroke-dasharray", "4,3");
      // Labels
      svg.append("text").attr("x", 36).attr("y", yS(L) - 4).attr("fill", C.eps).attr("font-size", 11).text(`L = ${L} (limit)`);
      svg.append("text").attr("x", xS(a) + 4).attr("y", 18).attr("fill", C.delta).attr("font-size", 11).text(`a = ${a}`);
      svg.append("text").attr("x", W - 10).attr("y", yS(L + eps) + 12).attr("text-anchor", "end").attr("fill", C.eps).attr("font-size", 10).text(`ε = ${eps.toFixed(2)}`);
      svg.append("text").attr("x", xS(a + delta) + 3).attr("y", H - 12).attr("fill", C.delta).attr("font-size", 10).text(`δ = ${delta.toFixed(2)}`);
      // Open circle at (a, L)
      svg.append("circle").attr("cx", xS(a)).attr("cy", yS(L)).attr("r", 6).attr("fill", "var(--color-background-primary)").attr("stroke", C.pt).attr("stroke-width", 2);
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [eps]);

  return (
    <div ref={cRef}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 60 }}>ε = {eps.toFixed(2)}</span>
        <input type="range" min={0.1} max={1.5} step={0.05} value={eps} onChange={e => setEps(parseFloat(e.target.value))} style={{ flex: 1, accentColor: "#34d399" }} />
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
        Green band = ε tolerance on the output. Gold band = δ response on the input. ε-δ definition: for any ε>0, find δ>0 so that when x is within δ of a, f(x) is within ε of L. The limit IS the L that makes this work for every ε.
      </p>
    </div>
  );
}

// ── Secant → derivative bridge viz ──────────────────────────────────────────
function DiffQuotientViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [h, setH] = useState(1.2);
  const f = x => x * x, fp = x => 2 * x, x0 = 1.5;

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { curve: isDark ? "#38bdf8" : "#0284c7", sec: isDark ? "#fbbf24" : "#d97706", tan: isDark ? "#34d399" : "#059669", pt: isDark ? "#f472b6" : "#db2777", axis: isDark ? "#475569" : "#94a3b8", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 180;
      const xd = [0, 3.5], yd = [0, 7];
      const xS = d3.scaleLinear().domain(xd).range([32, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      svg.append("line").attr("x1", 32).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.axis).attr("stroke-width", 1.5);
      const pts = []; for (let i = 0; i <= 200; i++) { const x = xd[0] + i * (xd[1] - xd[0]) / 200; pts.push([x, f(x)]); }
      svg.append("path").datum(pts).attr("fill", "none").attr("stroke", C.curve).attr("stroke-width", 2.5).attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom));
      const slope = (f(x0 + h) - f(x0)) / h;
      const tanSlope = fp(x0);
      svg.append("line").attr("x1", xS(0.5)).attr("y1", yS(f(x0) + slope * (0.5 - x0))).attr("x2", xS(3)).attr("y2", yS(f(x0) + slope * (3 - x0))).attr("stroke", C.sec).attr("stroke-width", 2).attr("stroke-dasharray", "5,3");
      svg.append("line").attr("x1", xS(0.5)).attr("y1", yS(f(x0) + tanSlope * (0.5 - x0))).attr("x2", xS(3)).attr("y2", yS(f(x0) + tanSlope * (3 - x0))).attr("stroke", C.tan).attr("stroke-width", h < 0.15 ? 2.5 : 1.5).attr("opacity", Math.max(0.3, 1 - h * 0.5));
      [x0, x0 + h].forEach((x, i) => svg.append("circle").attr("cx", xS(x)).attr("cy", yS(f(x))).attr("r", 5).attr("fill", i === 0 ? C.pt : C.sec).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2));
      svg.append("text").attr("x", W - 10).attr("y", 16).attr("text-anchor", "end").attr("fill", C.sec).attr("font-size", 11).text(`[f(x+h)−f(x)]/h = ${slope.toFixed(4)}`);
      svg.append("text").attr("x", W - 10).attr("y", 30).attr("text-anchor", "end").attr("fill", C.tan).attr("font-size", 11).text(`f′(${x0}) = ${tanSlope} ← as h→0`);
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [h]);

  return (
    <div ref={cRef}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 60 }}>h = {h.toFixed(3)}</span>
        <input type="range" min={0.005} max={1.5} step={0.005} value={h} onChange={e => setH(parseFloat(e.target.value))} style={{ flex: 1, accentColor: "#fbbf24" }} />
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
        The difference quotient [f(x+h)−f(x)]/h is a limit calculation — a Chapter 2 tool being used to define the derivative. Shrink h→0 and the secant (gold) collapses to the tangent (green). That limit IS f′(x).
      </p>
    </div>
  );
}

const TECHNIQUES = [
  { name: "Direct substitution", when: "f is continuous at a", example: "lim(x→2) (x²+1) = 5", formula: "\\lim_{x\\to a}f(x) = f(a) \\text{ if f continuous at a}" },
  { name: "Factor & cancel", when: "0/0 form — hole in graph", example: "lim(x→1)(x²−1)/(x−1) = lim(x→1)(x+1) = 2", formula: "\\lim_{x\\to 1}\\frac{x^2-1}{x-1} = \\lim_{x\\to 1}(x+1) = 2" },
  { name: "Multiply by conjugate", when: "√ in numerator/denominator", example: "lim(x→0)(√(x+1)−1)/x", formula: "\\cdot\\frac{\\sqrt{x+1}+1}{\\sqrt{x+1}+1} \\Rightarrow \\frac{x}{x(\\sqrt{x+1}+1)} \\to \\frac{1}{2}" },
  { name: "Squeeze Theorem", when: "Bounded oscillation (e.g. x·sin(1/x))", example: "lim(x→0) x·sin(1/x) = 0", formula: "-|x| \\leq x\\sin(1/x) \\leq |x| \\Rightarrow 0" },
  { name: "L'Hôpital's Rule", when: "0/0 or ∞/∞ forms (CHAPTER 4)", example: "lim(x→0)(sin x)/x — previewed here", formula: "\\lim\\frac{f}{g} = \\lim\\frac{f'}{g'} \\quad (\\text{Ch 4})" },
];

const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export default function Ch2Review({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("map");
  const [techIdx, setTechIdx] = useState(0);

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#1D9E75", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 2 Review</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "#085041", marginBottom: 4 }}>Limits</div>
        <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>
          Limits are the engine of calculus. Every derivative is a limit. Every integral is a limit. The ε-δ definition makes "approaching" rigorous. Chapter 2 asks: what value does f(x) approach as x approaches a?
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["map", "Chapter map"], ["epsdelta", "ε-δ definition"], ["techniques", "Limit techniques"], ["bridge", "Bridge → Ch 3: Derivatives"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === k ? 500 : 400, border: `0.5px solid ${tab === k ? "#1D9E75" : "var(--color-border-secondary)"}`, background: tab === k ? "#E1F5EE" : "transparent", color: tab === k ? "#085041" : "var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>

      {tab === "map" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card }}>
            {[
              { sec: "2.2", topic: "Limit of a function", key: "Left/right limits must agree. The function does NOT need to be defined at a.", color: "#1D9E75" },
              { sec: "2.3", topic: "Limit laws", key: "lim[f+g] = lim[f]+lim[g]. lim[f·g] = lim[f]·lim[g]. Etc. Only valid when both limits exist.", color: "#7F77DD" },
              { sec: "2.4", topic: "Continuity", key: "f continuous at a iff: f(a) defined, limit exists, and they're equal. IVT: continuous on [a,b] → hits every value between f(a) and f(b).", color: "#0891b2" },
              { sec: "2.5", topic: "ε-δ definition", key: "For any ε>0, there exists δ>0 such that 0<|x−a|<δ → |f(x)−L|<ε. Makes 'approaching' precise.", color: "#BA7517" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < 3 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ minWidth: 36, fontSize: 11, fontWeight: 600, color: row.color, paddingTop: 2 }}>{row.sec}</div>
                <div style={{ minWidth: 130, fontSize: 13, fontWeight: 500 }}>{row.topic}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{row.key}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>The three special limits to memorise cold</div>
            {["\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1", "\\lim_{x\\to 0}\\frac{1-\\cos x}{x} = 0", "\\lim_{x\\to 0}(1+x)^{1/x} = e"].map((f, i) => (
              <div key={i} style={{ background: "var(--color-background-primary)", borderRadius: 6, padding: "8px 12px", marginBottom: 4, textAlign: "center" }}>
                <M t={f} display ready={ready} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "epsdelta" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #BA7517", borderRadius: 0, background: "#FAEEDA", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#412402", marginBottom: 6 }}>The ε-δ definition — what it actually says</div>
            <M t={"\\lim_{x\\to a}f(x) = L \\iff \\forall\\,\\varepsilon>0,\\;\\exists\\,\\delta>0: \\; 0<|x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon"} display ready={ready} />
            <div style={{ fontSize: 13, color: "#633806", lineHeight: 1.7, marginTop: 8 }}>
              Translation: You name any tolerance ε on the output. I can find a window δ on the input so that all x within δ of a produce f(x) within ε of L. This works for every ε you could possibly name.
            </div>
          </div>
          <EpsilonDeltaViz />
        </div>
      )}

      {tab === "techniques" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
            {TECHNIQUES.map((t, i) => (
              <button key={i} onClick={() => setTechIdx(i)} style={{ padding: "4px 10px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === techIdx ? 600 : 400, border: `0.5px solid ${i === techIdx ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === techIdx ? "var(--color-background-info)" : "transparent", color: i === techIdx ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>
                {t.name.split(" ")[0]}
              </button>
            ))}
          </div>
          {(() => {
            const t = TECHNIQUES[techIdx];
            return (
              <div style={{ animation: "sd .16s ease-out" }}>
                <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#085041", marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: "#0F6E56", marginBottom: 4 }}><strong>When to use:</strong> {t.when}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{t.example}</div>
                </div>
                <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center" }}>
                  <M t={t.formula} display ready={ready} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {tab === "bridge" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#26215C", marginBottom: 6 }}>The derivative is a limit — the bridge to Chapter 3</div>
            <M t={"f'(x) = \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}"} display ready={ready} />
            <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7, marginTop: 8 }}>
              Every differentiation rule in Chapter 3 is derived by evaluating this limit. The power rule, product rule, chain rule — all proofs start here. Chapter 2 gave you the tools (factoring, conjugates, special limits). Chapter 3 uses them.
            </div>
          </div>
          <DiffQuotientViz />
          <div style={{ ...card, marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Three Chapter 2 results that drive Chapter 3</div>
            {[
              { limit: "lim(h→0) [sin(x+h)−sin(x)]/h", deriv: "= cos(x) — the derivative of sin, proved using the sin(h)/h and (cos(h)−1)/h limits" },
              { limit: "lim(h→0) [(x+h)ⁿ−xⁿ]/h", deriv: "= nxⁿ⁻¹ — the Power Rule, proved by the binomial theorem + limit laws" },
              { limit: "lim(h→0) [eˣ⁺ʰ−eˣ]/h = eˣ·lim(h→0)(eʰ−1)/h", deriv: "= eˣ — uses the limit definition of e from Chapter 1" },
            ].map((item, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 2 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ fontSize: 12, color: "#1D9E75", fontWeight: 600, marginBottom: 3 }}>Ch 2: {item.limit}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Ch 3: {item.deriv}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
