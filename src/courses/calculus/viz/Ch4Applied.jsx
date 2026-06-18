/**
 * Ch4Applied.jsx — Optimisation in the Real World
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

// ── Box optimisation interactive ─────────────────────────────────────────────
function BoxViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [x, setX] = useState(2); // cut size
  const side = 12;
  const V = c => c * (side - 2 * c) ** 2;
  const maxX = 2; // optimal: dV/dc=0 → c=2
  const maxV = V(maxX);

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const col = { axis: isDark ? "#475569" : "#94a3b8", curve: isDark ? "#38bdf8" : "#0284c7", max: isDark ? "#34d399" : "#059669", cur: isDark ? "#fbbf24" : "#d97706", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 180;
      const xd = [0, 6], yd = [0, 130];
      const xS = d3.scaleLinear().domain(xd).range([36, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      svg.append("line").attr("x1", 36).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", col.axis).attr("stroke-width", 1.5);
      svg.append("line").attr("x1", 36).attr("y1", 8).attr("x2", 36).attr("y2", H - 8).attr("stroke", col.axis).attr("stroke-width", 1.5);
      const pts = []; for (let i = 0; i <= 200; i++) { const c = 0.01 + i * 5.98 / 200; pts.push([c, V(c)]); }
      svg.append("path").datum(pts).attr("fill", "none").attr("stroke", col.curve).attr("stroke-width", 2.5).attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom));
      // Max
      svg.append("circle").attr("cx", xS(maxX)).attr("cy", yS(maxV)).attr("r", 6).attr("fill", col.max).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      svg.append("text").attr("x", xS(maxX) + 8).attr("y", yS(maxV) - 6).attr("fill", col.max).attr("font-size", 10).text(`Max V=${maxV.toFixed(1)} at x=${maxX}`);
      // Current
      svg.append("circle").attr("cx", xS(x)).attr("cy", yS(V(x))).attr("r", 5).attr("fill", col.cur).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      svg.append("line").attr("x1", xS(x)).attr("y1", yS(0)).attr("x2", xS(x)).attr("y2", yS(V(x))).attr("stroke", col.cur).attr("stroke-width", 1).attr("stroke-dasharray", "3,3");
      svg.append("text").attr("x", W - 10).attr("y", 16).attr("text-anchor", "end").attr("fill", col.cur).attr("font-size", 11).text(`x=${x}: V=${V(x).toFixed(1)} cm³`);
      [0, 1, 2, 3, 4, 5, 6].forEach(v => svg.append("text").attr("x", xS(v)).attr("y", H - 0).attr("text-anchor", "middle").attr("fill", col.text).attr("font-size", 9).text(v));
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [x]);

  return (
    <div ref={cRef}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 80 }}>Cut = {x} cm</span>
        <input type="range" min={0.1} max={5.9} step={0.1} value={x} onChange={e => setX(parseFloat(e.target.value))} style={{ flex: 1, accentColor: "#fbbf24" }} />
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
        12×12 cm sheet. Cut corner squares of side x. Fold up to make a box. V(x) = x(12−2x)². Drag to find the optimal cut. Green dot = maximum volume at x=2 cm.
      </p>
    </div>
  );
}

const CH4_PROBLEMS = [
  { title: "Open box — max volume", setup: "V(x) = x(12-2x)^2 \\quad 0 < x < 6", steps: [{ label: "Expand and differentiate", math: "V(x) = x(144-48x+4x^2) = 144x-48x^2+4x^3" }, { label: "V′(x) = 0", math: "V'(x) = 144-96x+12x^2 = 12(12-8x+x^2) = 12(x-2)(x-6) = 0" }, { label: "Critical points: x=2 (in domain), x=6 (boundary)", math: "x=2: V(2)=2(8)^2=128 \\text{ cm}^3 \\quad V''(2)=12(2\\cdot2-8)=-48<0 \\Rightarrow \\text{max}" }], answer: "Cut 2 cm squares from each corner. Maximum volume = 128 cm³.", watchFor: "Always check that critical points are IN the domain. x=6 gives V=0 (the box collapses) — valid mathematically but useless physically." },
  { title: "Minimum material for a cylinder", setup: "\\text{Volume }= \\pi r^2 h = 500 \\Rightarrow h = \\frac{500}{\\pi r^2}", steps: [{ label: "Surface area to minimise", math: "S = 2\\pi r^2 + 2\\pi rh = 2\\pi r^2 + \\frac{1000}{r}" }, { label: "dS/dr = 0", math: "S'(r) = 4\\pi r - \\frac{1000}{r^2} = 0 \\Rightarrow r^3 = \\frac{250}{\\pi} \\Rightarrow r = \\left(\\frac{250}{\\pi}\\right)^{1/3}" }, { label: "Optimal dimensions", math: "r \\approx 4.30 \\text{ cm} \\quad h = \\frac{500}{\\pi(4.30)^2} \\approx 8.60 \\text{ cm} \\quad (h = 2r)" }], answer: "Optimal can: height = diameter (h=2r). This is why most standard cans are approximately as tall as they are wide.", watchFor: "Eliminate one variable using the constraint FIRST. You cannot optimise a function of two variables directly." },
];

const c4card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export function Ch4Applied({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("box");
  const [probIdx, setProbIdx] = useState(0);
  const [reveal, setReveal] = useState(0);
  const p = CH4_PROBLEMS[probIdx];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ ...c4card, borderLeft: "3px solid #BA7517", borderRadius: 0, background: "#FAEEDA", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#BA7517", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 4 — Applied Problems</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#412402", marginBottom: 4 }}>Optimisation in the Real World</div>
        <div style={{ fontSize: 13, color: "#633806", lineHeight: 1.7 }}>Optimisation is calculus meeting the real world. Every engineering design, business decision, and physical process has a quantity to maximise or minimise — and calculus finds it.</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["box", "Box optimisation", "#BA7517"], ["problems", "Worked problems", "#A32D2D"]].map(([k, l, c]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === k ? 500 : 400, border: `0.5px solid ${tab === k ? c : "var(--color-border-secondary)"}`, background: tab === k ? c + "22" : "transparent", color: tab === k ? c : "var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>
      {tab === "box" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...c4card }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>The five-step optimisation method</div>
            {["Draw a diagram. Label all quantities.", "Identify what to maximise/minimise — write the objective function.", "Write the constraint equation. Use it to eliminate one variable.", "Differentiate the objective function. Set = 0. Solve.", "Verify it's a max/min (second derivative test or closed interval method)."].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <div style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#BA7517", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{step}</div>
              </div>
            ))}
          </div>
          <BoxViz />
        </div>
      )}
      {tab === "problems" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            {CH4_PROBLEMS.map((pr, i) => <button key={i} onClick={() => { setProbIdx(i); setReveal(0); }} style={{ padding: "4px 11px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === probIdx ? 600 : 400, border: `0.5px solid ${i === probIdx ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === probIdx ? "var(--color-background-info)" : "transparent", color: i === probIdx ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>{["Open box", "Can design"][i]}</button>)}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
          <div style={{ ...c4card, background: "var(--color-background-primary)", textAlign: "center" }}><M t={p.setup} display ready={ready} /></div>
          {p.steps.map((st, i) => { if (i > reveal) return null; return <div key={i} style={{ ...c4card, borderLeft: "3px solid #BA7517", borderRadius: 0, animation: "sd .16s ease-out" }}><div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{st.label}</div><M t={st.math} display ready={ready} /></div>; })}
          {reveal < p.steps.length - 1 && <button onClick={() => setReveal(r => r + 1)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer", fontSize: 13, fontWeight: 500, marginTop: 4 }}>▶ Next step</button>}
          {reveal === p.steps.length - 1 && <>
            <div style={{ ...c4card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "var(--color-background-success)", marginTop: 6 }}><div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-success)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Answer</div><div style={{ fontSize: 13 }}>{p.answer}</div></div>
            <div style={{ ...c4card, borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning)" }}><div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Watch out for</div><div style={{ fontSize: 13 }}>{p.watchFor}</div></div>
          </>}
        </div>
      )}
    </div>
  );
}

/**
 * Ch5Applied.jsx — Integration in the Real World
 */
const c5card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

const CH5_PROBLEMS = [
  { title: "Net displacement vs total distance", setup: "v(t) = t^2 - 4t + 3 = (t-1)(t-3) \\quad t \\in [0,4]", steps: [{ label: "Net displacement = ∫v dt", math: "\\int_0^4(t^2-4t+3)\\,dt = \\left[\\frac{t^3}{3}-2t^2+3t\\right]_0^4 = \\frac{64}{3}-32+12 = \\frac{4}{3}" }, { label: "v=0 at t=1 and t=3 (direction reversals)", math: "\\int_0^1|v|\\,dt + \\int_1^3|v|\\,dt + \\int_3^4|v|\\,dt" }, { label: "Total distance", math: "= \\frac{2}{3} + \\frac{4}{3} + \\frac{2}{3} = \\frac{8}{3} \\approx 2.67 \\text{ m}" }], answer: "Net displacement = 4/3 m (ends up 4/3 m to the right of start). Total distance = 8/3 m (total path length). These differ because the particle reverses direction.", watchFor: "Displacement = ∫v dt (can be negative). Distance = ∫|v| dt (always positive). Always check if v changes sign on [a,b] — if yes, split the integral." },
  { title: "Total cost from marginal cost", setup: "MC(x) = 3 + 0.02x \\quad C(0) = 200 \\text{ (fixed cost)}", steps: [{ label: "C(x) = fixed cost + ∫₀ˣ MC dt", math: "C(x) = 200 + \\int_0^x(3+0.02t)\\,dt" }, { label: "Evaluate the integral", math: "= 200 + \\left[3t + 0.01t^2\\right]_0^x = 200 + 3x + 0.01x^2" }, { label: "Cost at x=100", math: "C(100) = 200 + 300 + 100 = \\$600" }], answer: "C(x) = 200 + 3x + 0.01x². This is exactly the reverse of taking the derivative — integration reconstructs total cost from marginal cost. The constant 200 (fixed cost) must be added separately.", watchFor: "The fixed cost is the +C constant of integration. You need one known value (like C(0) = 200) to determine it." },
  { title: "Average value of a function", setup: "f(x) = x^2 + 1 \\text{ on } [0,3]. \\text{ Find the average value.}", steps: [{ label: "Average value formula", math: "\\bar{f} = \\frac{1}{b-a}\\int_a^b f(x)\\,dx = \\frac{1}{3}\\int_0^3(x^2+1)\\,dx" }, { label: "Evaluate", math: "= \\frac{1}{3}\\left[\\frac{x^3}{3}+x\\right]_0^3 = \\frac{1}{3}(9+3) = 4" }], answer: "The average value of f(x)=x²+1 on [0,3] is 4. This means there exists a c in [0,3] where f(c)=4 (Mean Value Theorem for integrals). Here c=√3 ≈ 1.73.", watchFor: "Average value = (1/(b−a))·∫f dx, NOT ∫f dx alone. The 1/(b−a) scaling factor is always required." },
];

export function Ch5Applied({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("problems");
  const [probIdx, setProbIdx] = useState(0);
  const [reveal, setReveal] = useState(0);
  const p = CH5_PROBLEMS[probIdx];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ ...c5card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#1D9E75", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 5 — Applied Problems</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#085041", marginBottom: 4 }}>Integration in the Real World</div>
        <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>Integration accumulates. It answers: given a rate, what is the total? Given marginal cost, what is total cost? Given velocity, what is displacement? Given a rate of change, what is the net change?</div>
      </div>
      <div style={{ ...c5card, background: "#E1F5EE", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#085041", marginBottom: 6 }}>Net Change Theorem — the master formula</div>
        <M t={"\\int_a^b f'(x)\\,dx = f(b) - f(a) \\quad \\text{Total change = integral of the rate}"} display ready={ready} />
        <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7, marginTop: 8 }}>In words: if you know how fast something is changing at every instant, integrate to get the total change over an interval. This is FTC Part 2, applied.</div>
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
        {CH5_PROBLEMS.map((pr, i) => <button key={i} onClick={() => { setProbIdx(i); setReveal(0); }} style={{ padding: "4px 11px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === probIdx ? 600 : 400, border: `0.5px solid ${i === probIdx ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === probIdx ? "var(--color-background-info)" : "transparent", color: i === probIdx ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>{["Distance", "Total cost", "Average value"][i]}</button>)}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
      <div style={{ ...c5card, background: "var(--color-background-primary)", textAlign: "center" }}><M t={p.setup} display ready={ready} /></div>
      {p.steps.map((st, i) => { if (i > reveal) return null; return <div key={i} style={{ ...c5card, borderLeft: `3px solid ${i === p.steps.length - 1 ? "#1D9E75" : "#1D9E75"}`, borderRadius: 0, animation: "sd .16s ease-out" }}><div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{st.label}</div><M t={st.math} display ready={ready} /></div>; })}
      {reveal < p.steps.length - 1 && <button onClick={() => setReveal(r => r + 1)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer", fontSize: 13, fontWeight: 500, marginTop: 4 }}>▶ Next step</button>}
      {reveal === p.steps.length - 1 && <>
        <div style={{ ...c5card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "var(--color-background-success)", marginTop: 6 }}><div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-success)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Answer</div><div style={{ fontSize: 13 }}>{p.answer}</div></div>
        <div style={{ ...c5card, borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning)" }}><div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Watch out for</div><div style={{ fontSize: 13 }}>{p.watchFor}</div></div>
      </>}
      {reveal > 0 && <button onClick={() => setReveal(0)} style={{ marginTop: 8, padding: "4px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12 }}>← Reset</button>}
    </div>
  );
}

/**
 * Ch6Applied.jsx — Integration Applications in the Real World
 */
const c6card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

const CH6_PROBLEMS = [
  { title: "Consumer surplus: area between demand and price", setup: "D(q) = 50 - 2q \\quad P^* = 20 \\quad q^* = 15", steps: [{ label: "Consumer surplus = area above price, below demand", math: "CS = \\int_0^{15}(50-2q)\\,dq - 20(15)" }, { label: "Evaluate", math: "= \\left[50q-q^2\\right]_0^{15} - 300 = (750-225)-300 = 225" }], answer: "Consumer surplus = $225. This is the total benefit consumers gain by paying P*=$20 when some were willing to pay up to $50. The integral measures that 'bonus' as an area.", watchFor: "Consumer surplus = ∫D(q)dq − P*·q*. It's the area ABOVE the price line and BELOW the demand curve. Not just ∫D." },
  { title: "Radioactive decay: when is 10% remaining?", setup: "A(t) = A_0 e^{-0.0001216t} \\quad (\\text{Carbon-14, half-life }5730 \\text{ yr})", steps: [{ label: "Set A(t) = 0.1·A₀", math: "A_0 e^{-0.0001216t} = 0.1 A_0 \\Rightarrow e^{-0.0001216t} = 0.1" }, { label: "Solve for t", math: "t = \\frac{-\\ln(0.1)}{0.0001216} = \\frac{2.3026}{0.0001216} \\approx 18,940 \\text{ years}" }], answer: "10% remains after ≈18,940 years — about 3.3 half-lives. The exponential model y=Ae^(kt) is a solution to the differential equation dy/dt = ky (rate of decay proportional to amount present).", watchFor: "When solving Ae^(kt) = target, divide both sides by A first (so A cancels), then take ln of both sides. Don't take ln before dividing." },
  { title: "Volume of a cone by disk method", setup: "y = \\frac{r}{h}x \\text{ rotated around x-axis on } [0,h]", steps: [{ label: "Disk method: R(x) = r·x/h", math: "V = \\pi\\int_0^h\\left(\\frac{r}{h}x\\right)^2 dx = \\frac{\\pi r^2}{h^2}\\int_0^h x^2\\,dx" }, { label: "Integrate", math: "= \\frac{\\pi r^2}{h^2}\\cdot\\frac{h^3}{3} = \\frac{1}{3}\\pi r^2 h" }], answer: "V = (1/3)πr²h — the volume formula for a cone. This is where the 1/3 comes from. Without calculus, this result requires a geometric limit argument. With calculus, it takes two lines.", watchFor: "The disk radius R(x) is the y-value of the curve at position x. Find R(x) from the equation of the curve being rotated." },
];

export function Ch6Applied({ params = {} }) {
  const ready = useMath();
  const [probIdx, setProbIdx] = useState(0);
  const [reveal, setReveal] = useState(0);
  const p = CH6_PROBLEMS[probIdx];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ ...c6card, borderLeft: "3px solid #6366f1", borderRadius: 0, background: "#eef2ff", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#4338ca", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 6 — Applied Problems</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#26215C", marginBottom: 4 }}>Integration Applications in the Real World</div>
        <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>Chapter 6 is integration put to work measuring things: economic surplus, radioactive decay, volumes of real 3D objects. The pattern is always: set up the representative slice, integrate to accumulate.</div>
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
        {CH6_PROBLEMS.map((pr, i) => <button key={i} onClick={() => { setProbIdx(i); setReveal(0); }} style={{ padding: "4px 11px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === probIdx ? 600 : 400, border: `0.5px solid ${i === probIdx ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === probIdx ? "var(--color-background-info)" : "transparent", color: i === probIdx ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>{["Consumer surplus", "Radioactive decay", "Cone volume"][i]}</button>)}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
      <div style={{ ...c6card, background: "var(--color-background-primary)", textAlign: "center" }}><M t={p.setup} display ready={ready} /></div>
      {p.steps.map((st, i) => { if (i > reveal) return null; return <div key={i} style={{ ...c6card, borderLeft: `3px solid ${i === p.steps.length - 1 ? "#1D9E75" : "#6366f1"}`, borderRadius: 0, animation: "sd .16s ease-out" }}><div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{st.label}</div><M t={st.math} display ready={ready} /></div>; })}
      {reveal < p.steps.length - 1 && <button onClick={() => setReveal(r => r + 1)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer", fontSize: 13, fontWeight: 500, marginTop: 4 }}>▶ Next step</button>}
      {reveal === p.steps.length - 1 && <>
        <div style={{ ...c6card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "var(--color-background-success)", marginTop: 6 }}><div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-success)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Answer</div><div style={{ fontSize: 13 }}>{p.answer}</div></div>
        <div style={{ ...c6card, borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning)" }}><div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Watch out for</div><div style={{ fontSize: 13 }}>{p.watchFor}</div></div>
      </>}
      {reveal > 0 && <button onClick={() => setReveal(0)} style={{ marginTop: 8, padding: "4px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12 }}>← Reset</button>}
    </div>
  );
}

export default Ch4Applied;
