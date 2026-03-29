/**
 * Ch2Applied.jsx — Limits in the Real World
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

function DrugConcentrationViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [dose, setDose] = useState(100);
  const [t, setT] = useState(4);
  const C = (d, time) => d * Math.exp(-0.3 * time);
  const halfLife = Math.log(2) / 0.3;

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const col = { axis: isDark ? "#475569" : "#94a3b8", curve: isDark ? "#38bdf8" : "#0284c7", thres: isDark ? "#f87171" : "#ef4444", pt: isDark ? "#fbbf24" : "#d97706", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 180;
      const td = [0, 20], cd = [0, dose + 10];
      const xS = d3.scaleLinear().domain(td).range([36, W - 8]);
      const yS = d3.scaleLinear().domain(cd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      svg.append("line").attr("x1", 36).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", col.axis).attr("stroke-width", 1.5);
      svg.append("line").attr("x1", 36).attr("y1", 8).attr("x2", 36).attr("y2", H - 8).attr("stroke", col.axis).attr("stroke-width", 1.5);
      // Therapeutic threshold
      const thresh = dose * 0.2;
      svg.append("line").attr("x1", 36).attr("y1", yS(thresh)).attr("x2", W - 8).attr("y2", yS(thresh)).attr("stroke", col.thres).attr("stroke-width", 1).attr("stroke-dasharray", "5,3");
      svg.append("text").attr("x", W - 10).attr("y", yS(thresh) - 4).attr("text-anchor", "end").attr("fill", col.thres).attr("font-size", 10).text("Therapeutic minimum");
      const pts = []; for (let i = 0; i <= 200; i++) { const time = td[0] + i * td[1] / 200; pts.push([time, C(dose, time)]); }
      svg.append("path").datum(pts).attr("fill", "none").attr("stroke", col.curve).attr("stroke-width", 2.5).attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom));
      svg.append("circle").attr("cx", xS(t)).attr("cy", yS(C(dose, t))).attr("r", 6).attr("fill", col.pt).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      svg.append("text").attr("x", xS(t) + 8).attr("y", yS(C(dose, t)) - 6).attr("fill", col.pt).attr("font-size", 10).text(`C=${C(dose, t).toFixed(1)} mg`);
      // Axis labels
      [0, 5, 10, 15, 20].forEach(v => svg.append("text").attr("x", xS(v)).attr("y", H - 0).attr("text-anchor", "middle").attr("fill", col.text).attr("font-size", 9).text(v));
      svg.append("text").attr("x", W / 2).attr("y", H + 10).attr("text-anchor", "middle").attr("fill", col.text).attr("font-size", 9).text("Time (hours)");
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [dose, t]);

  return (
    <div ref={cRef}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
        <div><div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>Dose = {dose} mg</div><input type="range" min={50} max={300} step={10} value={dose} onChange={e => setDose(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#0284c7" }} /></div>
        <div><div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>Time = {t.toFixed(1)} hrs</div><input type="range" min={0} max={20} step={0.2} value={t} onChange={e => setT(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#fbbf24" }} /></div>
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)", marginBottom: 6 }} />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
        C(t) = {dose}e^(−0.3t). As t→∞, C→0 (limit = 0). Half-life = ln(2)/0.3 ≈ {halfLife.toFixed(1)} hrs. Horizontal asymptote = 0 mg.
      </p>
    </div>
  );
}

const CH2_PROBLEMS = [
  { title: "Average cost as production scales", setup: "C(x) = 1000 + 5x \\qquad \\bar{C}(x) = \\frac{C(x)}{x} = \\frac{1000}{x} + 5", q: "What happens to average cost as x→∞?", steps: [{ label: "Compute the limit", math: "\\lim_{x\\to\\infty}\\bar{C}(x) = \\lim_{x\\to\\infty}\\left(\\frac{1000}{x}+5\\right) = 0+5 = 5" }, { label: "Interpretation", math: "\\text{Average cost approaches }\\$5\\text{ (the variable cost per unit).}" }], answer: "The fixed cost gets 'diluted' over more and more units. This is economies of scale — why large manufacturers have lower per-unit costs.", watchFor: "The average cost never equals $5 exactly (that would require x=∞), but it approaches it. This is what a horizontal asymptote means." },
  { title: "Drug dosing: limit from right vs left", setup: "f(t) = \\begin{cases}0 & t<0 \\\\ 100e^{-0.3t} & t\\geq 0\\end{cases}", q: "Is f continuous at t=0? What does this mean medically?", steps: [{ label: "Left limit as t→0⁻", math: "\\lim_{t\\to 0^-}f(t) = 0 \\quad \\text{(no drug before dose)}" }, { label: "Right limit as t→0⁺", math: "\\lim_{t\\to 0^+}f(t) = 100e^0 = 100 \\quad \\text{(drug at time of dose)}" }, { label: "Conclusion", math: "\\text{Left} \\neq \\text{Right} \\Rightarrow \\text{discontinuity at } t=0" }], answer: "The jump from 0 to 100 mg at t=0 is a discontinuity — modelling the instant the drug enters the bloodstream. The limit doesn't exist at t=0. This is physically realistic.", watchFor: "One-sided limits being unequal means the two-sided limit doesn't exist. But the function is still well-defined — it just has a jump." },
];

const card2 = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export function Ch2Applied({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("drug");
  const [probIdx, setProbIdx] = useState(0);
  const [reveal, setReveal] = useState(0);
  const p = CH2_PROBLEMS[probIdx];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ ...card2, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#1D9E75", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 2 — Applied Problems</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#085041", marginBottom: 4 }}>Limits in the Real World</div>
        <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>Limits model what happens at the edge — as time grows without bound, as production scales up, as a drug clears from the body. Continuity determines whether real physical processes can have sudden jumps.</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["drug", "Drug concentration", "#1D9E75"], ["problems", "Worked problems", "#0891b2"]].map(([k, l, c]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === k ? 500 : 400, border: `0.5px solid ${tab === k ? c : "var(--color-border-secondary)"}`, background: tab === k ? c + "22" : "transparent", color: tab === k ? c : "var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>
      {tab === "drug" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card2 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Drug clearance: C(t) = D·e^(−kt)</div>
            <DrugConcentrationViz />
          </div>
          <div style={{ ...card2 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Three limit facts about drug concentration</div>
            {[{ fact: "lim(t→∞) C(t) = 0", meaning: "The drug always clears eventually. Zero is a horizontal asymptote — the concentration approaches but never reaches it.", math: "\\lim_{t\\to\\infty}De^{-kt} = D\\cdot 0 = 0" }, { fact: "Half-life: C(t½) = D/2", meaning: "Solve De^(−kt½) = D/2 → t½ = ln(2)/k. A limit-based calculation.", math: "t_{1/2} = \\frac{\\ln 2}{k} \\approx \\frac{0.693}{0.3} = 2.31 \\text{ hrs}" }].map((row, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1D9E75", marginBottom: 3 }}>{row.fact}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>{row.meaning}</div>
                <M t={row.math} display ready={ready} />
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "problems" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            {CH2_PROBLEMS.map((pr, i) => <button key={i} onClick={() => { setProbIdx(i); setReveal(0); }} style={{ padding: "4px 11px", borderRadius: 14, fontSize: 12, cursor: "pointer", fontWeight: i === probIdx ? 600 : 400, border: `0.5px solid ${i === probIdx ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, background: i === probIdx ? "var(--color-background-info)" : "transparent", color: i === probIdx ? "var(--color-text-info)" : "var(--color-text-secondary)" }}>{["Avg cost", "Continuity"][i]}</button>)}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
          <div style={{ ...card2, background: "var(--color-background-primary)", textAlign: "center" }}><M t={p.setup} display ready={ready} /></div>
          <div style={{ ...card2, borderLeft: "3px solid #1D9E75", borderRadius: 0 }}><div style={{ fontSize: 13, fontWeight: 500 }}>Question: {p.q}</div></div>
          {p.steps.map((st, i) => { if (i > reveal) return null; return <div key={i} style={{ ...card2, borderLeft: "3px solid #1D9E75", borderRadius: 0, animation: "sd .16s ease-out" }}><div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{st.label}</div><M t={st.math} display ready={ready} /></div>; })}
          {reveal < p.steps.length - 1 && <button onClick={() => setReveal(r => r + 1)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer", fontSize: 13, fontWeight: 500, marginTop: 4 }}>▶ Next step</button>}
          {reveal === p.steps.length - 1 && <>
            <div style={{ ...card2, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "var(--color-background-success)", marginTop: 6 }}><div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-success)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Answer</div><div style={{ fontSize: 13 }}>{p.answer}</div></div>
            <div style={{ ...card2, borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning)" }}><div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Watch out for</div><div style={{ fontSize: 13 }}>{p.watchFor}</div></div>
          </>}
        </div>
      )}
    </div>
  );
}

export default Ch2Applied;
