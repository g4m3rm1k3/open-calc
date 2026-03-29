/**
 * Ch5Review.jsx — OpenStax Calc Vol 1
 * End-of-chapter review: Integration
 * Bridge: How integrals enable the applications in Chapter 6
 *
 * Sections: 5.1 Approximating Areas, 5.2 Definite Integral,
 *   5.3 FTC, 5.4 Net Change, 5.5 Substitution,
 *   5.6 Exp/Log Integrals, 5.7 Inverse Trig Integrals
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

// ── Riemann sums interactive ─────────────────────────────────────────────────
function RiemannViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [n, setN] = useState(4);
  const [method, setMethod] = useState("left");
  const f = x => x * x / 2 + 1, a = 0, b = 3;
  const exact = (b ** 3 / 6 + b) - (a ** 3 / 6 + a); // = 4.5

  const riemannSum = () => {
    const dx = (b - a) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const x = method === "left" ? a + i * dx : method === "right" ? a + (i + 1) * dx : a + (i + 0.5) * dx;
      sum += f(x) * dx;
    }
    return sum;
  };

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { axis: isDark ? "#475569" : "#94a3b8", curve: isDark ? "#38bdf8" : "#0284c7", rect: isDark ? "rgba(56,189,248,0.25)" : "rgba(2,132,199,0.15)", rectBorder: isDark ? "#38bdf8" : "#0284c7", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 200;
      const xd = [-0.2, 3.5], yd = [-0.2, 5.5];
      const xS = d3.scaleLinear().domain(xd).range([32, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      svg.append("line").attr("x1", 32).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.axis).attr("stroke-width", 1.5);
      svg.append("line").attr("x1", xS(0)).attr("y1", 8).attr("x2", xS(0)).attr("y2", H - 8).attr("stroke", C.axis).attr("stroke-width", 1.5);
      // Rectangles
      const dx = (b - a) / n;
      for (let i = 0; i < n; i++) {
        const xl = a + i * dx;
        const xSamp = method === "left" ? xl : method === "right" ? xl + dx : xl + dx / 2;
        const h = f(xSamp);
        svg.append("rect").attr("x", xS(xl)).attr("y", yS(h)).attr("width", xS(xl + dx) - xS(xl)).attr("height", yS(0) - yS(h)).attr("fill", C.rect).attr("stroke", C.rectBorder).attr("stroke-width", 1);
      }
      // Curve
      const pts = []; for (let i = 0; i <= 200; i++) { const x = xd[0] + i * (xd[1] - xd[0]) / 200; pts.push([x, f(x)]); }
      svg.append("path").datum(pts).attr("fill", "none").attr("stroke", C.curve).attr("stroke-width", 2.5).attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom));
      const sum = riemannSum();
      svg.append("text").attr("x", W - 10).attr("y", 16).attr("text-anchor", "end").attr("fill", C.rectBorder).attr("font-size", 12).text(`Sum = ${sum.toFixed(4)}`);
      svg.append("text").attr("x", W - 10).attr("y", 30).attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 11).text(`Exact = ${exact.toFixed(4)}`);
      svg.append("text").attr("x", W - 10).attr("y", 44).attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 11).text(`Error = ${Math.abs(sum - exact).toFixed(4)}`);
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [n, method]);

  return (
    <div ref={cRef}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        {["left", "right", "midpoint"].map(m => (
          <button key={m} onClick={() => setMethod(m)} style={{ padding: "3px 10px", borderRadius: 14, fontSize: 12, cursor: "pointer", border: `0.5px solid ${method === m ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: method === m ? "var(--color-background-info)" : "transparent", color: method === m ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>{m}</button>
        ))}
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", alignSelf: "center" }}>n = {n}</span>
        <input type="range" min={1} max={50} step={1} value={n} onChange={e => setN(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#0284c7" }} />
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
        As n→∞, error→0 and the Riemann sum → the definite integral. This IS the definition of ∫₀³ (x²/2+1)dx = 4.5.
      </p>
    </div>
  );
}

const FTC_STEPS = [
  { tag: "Part 1", tagStyle: { bg: "#E1F5EE", text: "#085041", border: "#1D9E75" }, instruction: "Define g(x) = ∫ₐˣ f(t) dt. This is an accumulation function — it accumulates area from a to x.", math: "g(x) = \\int_a^x f(t)\\,dt \\quad\\Rightarrow\\quad g'(x) = f(x)" },
  { tag: "Part 2", tagStyle: { bg: "#ecfeff", text: "#0e7490", border: "#0891b2" }, instruction: "If F is any antiderivative of f (F′=f), then the definite integral equals F(b)−F(a).", math: "\\int_a^b f(x)\\,dx = F(b) - F(a) \\quad \\text{where } F' = f" },
  { tag: "Why it connects", tagStyle: { bg: "#FAEEDA", text: "#412402", border: "#BA7517" }, instruction: "FTC unifies the area problem (integration) and the tangent problem (differentiation). They are inverse operations.", math: "\\text{Differentiation and integration are inverses: } \\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)" },
];

const INTEGRALS = [
  { name: "Power", formula: "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)", note: "The +1 and the n≠−1 are both essential." },
  { name: "1/x", formula: "\\int \\frac{1}{x}\\,dx = \\ln|x| + C", note: "The absolute value handles x<0. The antiderivative of 1/x is ln|x|, not ln(x)." },
  { name: "eˣ", formula: "\\int e^x\\,dx = e^x + C", note: "eˣ is its own antiderivative." },
  { name: "sin/cos", formula: "\\int \\sin x\\,dx = -\\cos x + C \\qquad \\int \\cos x\\,dx = \\sin x + C", note: "The negative sign belongs to the sin integral, not cos." },
  { name: "arctan", formula: "\\int \\frac{1}{1+x^2}\\,dx = \\arctan(x) + C", note: "One of the two key inverse trig integrals. Arises in completing the square problems." },
  { name: "arcsin", formula: "\\int \\frac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin(x) + C", note: "The other key inverse trig integral. Domain: |x|<1." },
];

const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export default function Ch5Review({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("riemann");
  const [ftcStep, setFtcStep] = useState(0);
  const [intIdx, setIntIdx] = useState(0);

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#1D9E75", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 5 Review</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "#085041", marginBottom: 4 }}>Integration</div>
        <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>
          Chapter 5 closes the loop. Derivatives describe rates of change. Integrals accumulate those rates back into totals. The Fundamental Theorem of Calculus (FTC) proves they are inverse operations — the most important result in the entire course.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["riemann", "Riemann sums"], ["ftc", "FTC — the big theorem"], ["integrals", "Antiderivative formulas"], ["sub", "u-substitution"], ["bridge", "Bridge → Ch 6: Applications"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === k ? 500 : 400, border: `0.5px solid ${tab === k ? "#1D9E75" : "var(--color-border-secondary)"}`, background: tab === k ? "#E1F5EE" : "transparent", color: tab === k ? "#085041" : "var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>

      {tab === "riemann" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE", marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>
              A definite integral is defined as the limit of Riemann sums. We chop [a,b] into n subintervals, multiply each height f(xᵢ) by the width Δx, and sum. As n→∞, Δx→0, and the sum → the area exactly.
            </div>
            <M t={"\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty}\\sum_{i=1}^n f(x_i^*)\\,\\Delta x"} display ready={ready} />
          </div>
          <RiemannViz />
        </div>
      )}

      {tab === "ftc" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {FTC_STEPS.map((_, i) => (
              <div key={i} onClick={() => setFtcStep(i)} style={{ flex: 1, height: 5, borderRadius: 3, cursor: "pointer", background: i === ftcStep ? "#1D9E75" : "var(--color-border-tertiary)", transform: i === ftcStep ? "scaleY(1.5)" : "scaleY(1)", transition: "background .2s" }} />
            ))}
          </div>
          {(() => {
            const s = FTC_STEPS[ftcStep]; const tc = s.tagStyle;
            return (
              <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 20, background: tc.bg, color: tc.text, border: `0.5px solid ${tc.border}` }}>{s.tag}</span>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{s.instruction}</p>
                  <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "16px", textAlign: "center", overflowX: "auto" }}>
                    <M t={s.math} display ready={ready} />
                  </div>
                </div>
              </div>
            );
          })()}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={() => setFtcStep(s => Math.max(0, s - 1))} disabled={ftcStep === 0} style={{ flex: 1, padding: 8, borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: ftcStep === 0 ? "var(--color-text-tertiary)" : "var(--color-text-secondary)", cursor: ftcStep === 0 ? "not-allowed" : "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={() => setFtcStep(s => Math.min(2, s + 1))} disabled={ftcStep === 2} style={{ flex: 1, padding: 8, borderRadius: 8, border: "0.5px solid #1D9E75", background: ftcStep === 2 ? "transparent" : "#E1F5EE", color: ftcStep === 2 ? "var(--color-text-tertiary)" : "#085041", cursor: ftcStep === 2 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500 }}>Next →</button>
          </div>
        </div>
      )}

      {tab === "integrals" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
            {INTEGRALS.map((r, i) => (
              <button key={i} onClick={() => setIntIdx(i)} style={{ padding: "4px 10px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === intIdx ? 600 : 400, border: `0.5px solid ${i === intIdx ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === intIdx ? "var(--color-background-info)" : "transparent", color: i === intIdx ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>{INTEGRALS[i].name}</button>
            ))}
          </div>
          <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center" }}>
            <M t={INTEGRALS[intIdx].formula} display ready={ready} />
          </div>
          <div style={{ ...card }}><div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{INTEGRALS[intIdx].note}</div></div>
        </div>
      )}

      {tab === "sub" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #0891b2", borderRadius: 0, background: "#ecfeff", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#0e7490", marginBottom: 6 }}>u-Substitution — the chain rule in reverse</div>
            <M t={"\\int f(g(x))g'(x)\\,dx = \\int f(u)\\,du \\quad\\text{where } u=g(x)"} display ready={ready} />
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>The four-step algorithm</div>
            {["Choose u = g(x): pick the inner function of a composition, or the piece whose derivative also appears.", "Compute du = g′(x)dx. Solve for dx if needed.", "Substitute: replace every x with u and dx with du/g′(x). The integral must be entirely in terms of u.", "Integrate in terms of u, then substitute back u = g(x)."].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "#0891b2", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center" }}>
            <M t={"\\int 2x\\cos(x^2)\\,dx \\xrightarrow{u=x^2} \\int \\cos(u)\\,du = \\sin(u)+C = \\sin(x^2)+C"} display ready={ready} />
          </div>
        </div>
      )}

      {tab === "bridge" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#26215C", marginBottom: 6 }}>Chapter 5 → Chapter 6: What integrals can compute</div>
            <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>
              Chapter 5 defined the integral and gave you the tools to compute it. Chapter 6 uses the definite integral to calculate real quantities: areas between curves, volumes of solids, arc lengths, work, and probability. The integral is a measurement machine.
            </div>
          </div>
          <div style={{ ...card }}>
            {[
              { app: "Area between curves", formula: "\\int_a^b [f(x)-g(x)]\\,dx", note: "Subtract the lower function from the upper. Split the integral if they cross." },
              { app: "Volume by slicing (disk method)", formula: "V = \\pi\\int_a^b [f(x)]^2\\,dx", note: "Each cross-section is a circle of radius f(x). Sum the volumes of thin disks." },
              { app: "Arc length", formula: "L = \\int_a^b \\sqrt{1+[f'(x)]^2}\\,dx", note: "Pythagorean theorem applied infinitesimally: ds² = dx² + dy²." },
              { app: "Work (force × distance)", formula: "W = \\int_a^b F(x)\\,dx", note: "When force varies, integrate it. Constant force: W = F·d." },
            ].map((row, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 3 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#7F77DD", marginBottom: 4 }}>{row.app}</div>
                <div style={{ overflowX: "auto", marginBottom: 4 }}><M t={row.formula} display ready={ready} /></div>
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{row.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
