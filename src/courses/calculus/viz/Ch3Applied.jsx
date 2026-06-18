/**
 * Ch3Applied.jsx — Derivatives in the Real World
 * The full marginal cost/revenue/profit lesson from the attached AI explanation,
 * made interactive. Plus motion analysis and related rates.
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

function WhyPanel({ why, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? "#eef2ff" : "transparent", border: "1px solid #6366f1", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 500, color: "#6366f1", cursor: "pointer" }}>
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#6366f1", color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{open ? "−" : "?"}</span>
        {open ? "Close" : why.tag || "Why?"}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: "12px 14px", background: "var(--color-background-secondary)", border: "0.5px solid #6366f122", borderLeft: "3px solid #6366f1", borderRadius: "0 8px 8px 0", animation: "sd .16s ease-out" }}>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-primary)" }}>{why.explanation}</p>
          {why.math && <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "10px", textAlign: "center", overflowX: "auto", marginTop: 8 }}><M t={why.math} display ready={ready} /></div>}
        </div>
      )}
    </div>
  );
}

// ── Marginal cost/revenue/profit interactive ─────────────────────────────────
function MarginalViz({ ready }) {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [x, setX] = useState(8);

  // C(x) = 200 + 3x + 0.01x²  R(x) = 15x - 0.1x²
  const C = q => 200 + 3 * q + 0.01 * q * q;
  const R = q => 15 * q - 0.1 * q * q;
  const P = q => R(q) - C(q);
  const MC = q => 3 + 0.02 * q;
  const MR = q => 15 - 0.2 * q;
  const MP = q => MR(q) - MC(q);
  // Profit max: MP=0 → 15-0.2q = 3+0.02q → 12 = 0.22q → q* ≈ 54.5
  const qStar = 12 / 0.22;

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C_col = { axis: isDark ? "#475569" : "#94a3b8", mc: isDark ? "#38bdf8" : "#0284c7", mr: isDark ? "#34d399" : "#059669", mp: isDark ? "#fbbf24" : "#d97706", zero: isDark ? "#f87171" : "#ef4444", eq: isDark ? "#a78bfa" : "#7c3aed", text: isDark ? "#94a3b8" : "#64748b" };
      const W = cRef.current?.clientWidth || 480, H = 200;
      const qd = [0, 80], md = [-8, 18];
      const xS = d3.scaleLinear().domain(qd).range([36, W - 8]);
      const yS = d3.scaleLinear().domain(md).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      // Zero line
      svg.append("line").attr("x1", 36).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C_col.zero).attr("stroke-width", 1).attr("stroke-dasharray", "4,3").attr("opacity", 0.5);
      // Axes
      svg.append("line").attr("x1", 36).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C_col.axis).attr("stroke-width", 1.5);
      svg.append("line").attr("x1", 36).attr("y1", 8).attr("x2", 36).attr("y2", H - 8).attr("stroke", C_col.axis).attr("stroke-width", 1.5);
      const drawC = (fn, col, dash) => {
        const pts = []; for (let i = 0; i <= 200; i++) { const q = qd[0] + i * (qd[1] - qd[0]) / 200; const y = fn(q); if (y >= md[0] - 1 && y <= md[1] + 1) pts.push([q, y]); }
        if (pts.length < 2) return;
        svg.append("path").datum(pts).attr("fill", "none").attr("stroke", col).attr("stroke-width", 2.5).attr("stroke-dasharray", dash || "none").attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom));
      };
      drawC(MC, C_col.mc); drawC(MR, C_col.mr); drawC(MP, C_col.mp, "5,3");
      // Profit-max line
      svg.append("line").attr("x1", xS(qStar)).attr("y1", 8).attr("x2", xS(qStar)).attr("y2", H - 8).attr("stroke", C_col.eq).attr("stroke-width", 1.5).attr("stroke-dasharray", "5,4");
      svg.append("text").attr("x", xS(qStar) + 4).attr("y", 18).attr("fill", C_col.eq).attr("font-size", 10).text(`q*=${qStar.toFixed(1)}`);
      // Current x marker
      [{ fn: MC, col: C_col.mc }, { fn: MR, col: C_col.mr }, { fn: MP, col: C_col.mp }].forEach(({ fn, col }) => {
        const y = fn(x);
        if (y >= md[0] && y <= md[1]) svg.append("circle").attr("cx", xS(x)).attr("cy", yS(y)).attr("r", 5).attr("fill", col).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);
      });
      // Axis labels
      [0, 20, 40, 60, 80].forEach(q => svg.append("text").attr("x", xS(q)).attr("y", yS(0) + 14).attr("text-anchor", "middle").attr("fill", C_col.text).attr("font-size", 9).text(q));
      // Legend
      [{ col: C_col.mc, lbl: "MC = C′" }, { col: C_col.mr, lbl: "MR = R′" }, { col: C_col.mp, lbl: "MP = P′", d: "5,3" }].forEach(({ col, lbl, d }, i) => {
        svg.append("line").attr("x1", 42).attr("y1", 16 + i * 16).attr("x2", 56).attr("y2", 16 + i * 16).attr("stroke", col).attr("stroke-width", 2).attr("stroke-dasharray", d || "none");
        svg.append("text").attr("x", 60).attr("y", 20 + i * 16).attr("fill", C_col.text).attr("font-size", 11).text(lbl);
      });
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [x]);

  const mc = MC(x), mr = MR(x), mp = MP(x);
  const decision = mp > 0.1 ? "Produce more — each unit adds profit" : mp < -0.1 ? "Produce less — each unit costs you profit" : "Optimal — you are at profit maximum";
  const decCol = mp > 0.1 ? "var(--color-text-success)" : mp < -0.1 ? "var(--color-text-danger)" : "var(--color-text-info)";

  return (
    <div ref={cRef}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 60 }}>q = {x}</span>
        <input type="range" min={0} max={80} step={1} value={x} onChange={e => setX(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#7c3aed" }} />
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 8 }}>
        {[{ label: "MC (cost of 1 more)", val: `${mc.toFixed(2)}`, color: "#0284c7" }, { label: "MR (revenue from 1 more)", val: `${mr.toFixed(2)}`, color: "#059669" }, { label: "MP (profit from 1 more)", val: `${mp.toFixed(2)}`, color: mp >= 0 ? "#059669" : "#ef4444" }, { label: "Decision", val: decision, color: decCol }].map(({ label, val, color }, i) => (
          <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: "var(--color-background-secondary)", border: `1px solid ${color}33`, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: i === 3 ? 10 : 14, fontWeight: 600, color, lineHeight: 1.3 }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 6 }}>
        C(x)=200+3x+0.01x² · R(x)=15x−0.1x² · Profit maximised at MC=MR (purple line, q*≈{qStar.toFixed(1)})
      </div>
    </div>
  );
}

// ── Motion analysis ──────────────────────────────────────────────────────────
function MotionAnalysisViz() {
  const svgRef = useRef(null); const cRef = useRef(null);
  const [t, setT] = useState(2);
  const s = t => t ** 3 - 6 * t ** 2 + 9 * t;
  const v = t => 3 * t ** 2 - 12 * t + 9;
  const a = t => 6 * t - 12;

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { axis: isDark ? "#475569" : "#94a3b8", pos: isDark ? "#38bdf8" : "#0284c7", vel: isDark ? "#34d399" : "#059669", acc: isDark ? "#fbbf24" : "#d97706", text: isDark ? "#94a3b8" : "#64748b", zero: "#ef4444" };
      const W = cRef.current?.clientWidth || 480, H = 180;
      const td = [0, 4.5], yd = [-3, 6];
      const xS = d3.scaleLinear().domain(td).range([36, W - 8]);
      const yS = d3.scaleLinear().domain(yd).range([H - 8, 8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width", W).attr("height", H);
      svg.append("line").attr("x1", 36).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.zero).attr("stroke-width", 1).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);
      svg.append("line").attr("x1", 36).attr("y1", yS(0)).attr("x2", W - 8).attr("y2", yS(0)).attr("stroke", C.axis).attr("stroke-width", 1.5);
      const drawC = (fn, col, dash) => { const pts = []; for (let i = 0; i <= 200; i++) { const x = td[0] + i * (td[1] - td[0]) / 200; const y = fn(x); if (y >= yd[0] - 0.5 && y <= yd[1] + 0.5) pts.push([x, y]); } if (pts.length > 1) svg.append("path").datum(pts).attr("fill", "none").attr("stroke", col).attr("stroke-width", 2.5).attr("stroke-dasharray", dash || "none").attr("d", d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)); };
      drawC(s, C.pos); drawC(v, C.vel); drawC(a, C.acc, "5,3");
      [{ fn: s, col: C.pos }, { fn: v, col: C.vel }, { fn: a, col: C.acc }].forEach(({ fn, col }) => { const y = fn(t); if (y >= yd[0] && y <= yd[1]) svg.append("circle").attr("cx", xS(t)).attr("cy", yS(y)).attr("r", 5).attr("fill", col).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2); });
      [{ c: C.pos, l: "s(t)=t³−6t²+9t" }, { c: C.vel, l: "v(t)=s′" }, { c: C.acc, l: "a(t)=s″", d: "5,3" }].forEach(({ c, l, d }, i) => { svg.append("line").attr("x1", 40).attr("y1", 14 + i * 16).attr("x2", 56).attr("y2", 14 + i * 16).attr("stroke", c).attr("stroke-width", 2).attr("stroke-dasharray", d || "none"); svg.append("text").attr("x", 60).attr("y", 18 + i * 16).attr("fill", C.text).attr("font-size", 10).text(l); });
    };
    const ro = new ResizeObserver(draw); if (cRef.current) ro.observe(cRef.current); draw(); return () => ro.disconnect();
  }, [t]);

  const vt = v(t), at = a(t);
  const dir = Math.abs(vt) < 0.05 ? "stopped" : vt > 0 ? "moving right" : "moving left";
  const spd = vt * at > 0 ? "speeding up" : vt * at < 0 ? "slowing down" : "constant speed";

  return (
    <div ref={cRef}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 40 }}>t = {t.toFixed(2)}</span>
        <input type="range" min={0} max={4.4} step={0.02} value={t} onChange={e => setT(parseFloat(e.target.value))} style={{ flex: 1, accentColor: "#f472b6" }} />
      </div>
      <svg ref={svgRef} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)" }} />
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 10, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }}>s={s(t).toFixed(2)} · v={vt.toFixed(2)} · a={at.toFixed(2)}</span>
        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 10, background: vt > 0 ? "var(--color-background-success)" : vt < 0 ? "var(--color-background-danger)" : "var(--color-background-secondary)", color: vt > 0 ? "var(--color-text-success)" : vt < 0 ? "var(--color-text-danger)" : "var(--color-text-secondary)" }}>{dir}</span>
        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 10, background: "var(--color-background-warning)", color: "var(--color-text-warning)" }}>{spd}</span>
      </div>
    </div>
  );
}

const MARGINAL_STEPS = [
  { tag: "Define the three functions", tagStyle: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" }, instruction: "C(x) = total cost of x units. R(x) = total revenue. P(x) = R(x) − C(x). These are functions — every x maps to exactly one dollar amount.", math: "C(x) = 200 + 3x + 0.01x^2 \\quad R(x) = 15x - 0.1x^2 \\quad P(x) = R(x)-C(x)", note: "C(0) = $200 is the fixed cost — you pay it even if you produce nothing." },
  { tag: "Define marginal = derivative", tagStyle: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" }, instruction: "Marginal = the derivative = the rate of change. MC(x) = C′(x) ≈ extra cost of producing one more unit.", math: "MC(x) = C'(x) = \\lim_{h\\to0}\\frac{C(x+h)-C(x)}{h} \\approx C(x+1)-C(x)", note: "The approximation C(x+1)−C(x) is the actual cost of one more unit. The derivative is a continuous version of this." },
  { tag: "Compute all three marginals", tagStyle: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" }, instruction: "Apply the power rule to each function.", math: "MC = 3 + 0.02x \\qquad MR = 15 - 0.2x \\qquad MP = MR - MC = 12 - 0.22x", note: "MC rises (it costs more per unit as production grows). MR falls (you have to lower the price to sell more). MP is the difference." },
  { tag: "Find the profit maximum: set MP = 0", tagStyle: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" }, instruction: "Profit is maximised when one more unit adds zero profit — MP = 0, equivalently MC = MR.", math: "MP(x)=0 \\Rightarrow 12-0.22x=0 \\Rightarrow x^* = \\frac{12}{0.22} \\approx 54.5 \\text{ units}", note: "This is the golden rule of microeconomics: produce until MC = MR. Beyond this point, each extra unit costs more than it earns." },
];

const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };

export default function Ch3Applied({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("marginal");
  const [step, setStep] = useState(0);

  const tabBtn = (key, label, color) => ({ padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === key ? 500 : 400, border: `0.5px solid ${tab === key ? color : "var(--color-border-secondary)"}`, background: tab === key ? color + "22" : "transparent", color: tab === key ? color : "var(--color-text-secondary)" });

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ ...card, borderLeft: "3px solid #0891b2", borderRadius: 0, background: "#ecfeff", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#0891b2", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Chapter 3 — Applied Problems</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#0e7490", marginBottom: 4 }}>Derivatives in the Real World</div>
        <div style={{ fontSize: 13, color: "#0e7490", lineHeight: 1.7 }}>The derivative answers one question in a hundred different contexts: how fast is something changing right now? In business that is marginal cost. In physics it is velocity. In engineering it is a rate of strain. Same tool, different labels.</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["marginal", "Marginal analysis", "#0891b2"], ["motion", "Motion analysis", "#7F77DD"], ["rates", "Related rates", "#1D9E75"]].map(([k, l, c]) => (
          <button key={k} onClick={() => setTab(k)} style={tabBtn(k, l, c)}>{l}</button>
        ))}
      </div>

      {tab === "marginal" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {MARGINAL_STEPS.map((_, i) => <div key={i} onClick={() => setStep(i)} style={{ flex: 1, height: 5, borderRadius: 3, cursor: "pointer", background: i === step ? "#0891b2" : "var(--color-border-tertiary)", transform: i === step ? "scaleY(1.5)" : "scaleY(1)", transition: "background .2s" }} />)}
          </div>
          {(() => {
            const s = MARGINAL_STEPS[step]; const tc = s.tagStyle;
            return (
              <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--color-text-primary)", color: "var(--color-background-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{step + 1}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: "2px 9px", borderRadius: 20, background: tc.bg, color: tc.text, border: `0.5px solid ${tc.border}` }}>{s.tag}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-tertiary)" }}>{step + 1}/{MARGINAL_STEPS.length}</span>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.55, marginBottom: 12 }}>{s.instruction}</p>
                  <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "14px", textAlign: "center", overflowX: "auto", marginBottom: 10 }}><M t={s.math} display ready={ready} /></div>
                  {s.note && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic", paddingLeft: 10, borderLeft: "2px solid var(--color-border-secondary)" }}>{s.note}</p>}
                  {step === 1 && <WhyPanel why={{ tag: "Why is h=1 a good approximation?", explanation: "The derivative is the limit as h→0. When h=1 (one unit), the difference quotient C(x+1)−C(x) is the actual extra cost of one more unit. For smooth cost functions with large x, the error between the approximation and the true derivative is tiny — typically less than 1%.", math: "C'(100) = 3+0.02(100)=5 \\quad C(101)-C(100) = 5.01 \\quad \\text{error: }0.01" }} ready={ready} />}
                </div>
              </div>
            );
          })()}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ flex: 1, padding: 8, borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: step === 0 ? "var(--color-text-tertiary)" : "var(--color-text-secondary)", cursor: step === 0 ? "not-allowed" : "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={() => setStep(s => Math.min(3, s + 1))} disabled={step === 3} style={{ flex: 1, padding: 8, borderRadius: 8, border: "0.5px solid #0891b2", background: step === 3 ? "transparent" : "#ecfeff", color: step === 3 ? "var(--color-text-tertiary)" : "#0e7490", cursor: step === 3 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500 }}>Next →</button>
          </div>
          <div style={{ marginTop: 14 }}><MarginalViz ready={ready} /></div>
        </div>
      )}

      {tab === "motion" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#26215C", marginBottom: 6 }}>Reading a motion problem — the three-layer cake</div>
            <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>
              Every motion problem gives you a position function s(t). Every other quantity is a derivative away. You never need a separate formula — just differentiate.
            </div>
          </div>
          <MotionAnalysisViz />
          <div style={{ ...card, marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>The five questions every motion problem asks</div>
            {[
              { q: "When is the particle stopped?", a: "Solve v(t) = 0. v = 3t²−12t+9 = 3(t−1)(t−3) → t=1 and t=3." },
              { q: "Moving right or left?", a: "Sign of v(t). v>0: right. v<0: left. v=0: momentarily stopped." },
              { q: "Speeding up or slowing down?", a: "v·a > 0: speeding up. v·a < 0: slowing down. Same sign = speeding up." },
              { q: "Total distance (not displacement)?", a: "Find every t where v=0, compute s at those times + endpoints. Sum |Δs| between each." },
              { q: "When is acceleration zero?", a: "Solve a(t) = 0. a = 6t−12 = 0 → t=2. This is where velocity changes from increasing to decreasing." },
            ].map((row, i) => (
              <div key={i} style={{ padding: "7px 0", borderBottom: i < 4 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#7F77DD", marginBottom: 3 }}>{row.q}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{row.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "rates" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "#E1F5EE", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#085041", marginBottom: 6 }}>Related rates — the strategy every time</div>
            <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>
              When two quantities are geometrically related AND both changing with time, differentiating their relationship gives you how their rates relate. The chain rule is the engine: d/dt[f(x)] = f′(x)·(dx/dt).
            </div>
          </div>
          {[{
            title: "Ladder sliding down a wall",
            setup: "A 10m ladder leans against a wall. The base slides away at 0.5 m/s. How fast is the top sliding down when the base is 6m from the wall?",
            steps: [
              { label: "Geometric relationship (Pythagoras)", math: "x^2 + y^2 = 100 \\quad (x=\\text{base dist}, y=\\text{height})" },
              { label: "Differentiate both sides with respect to t", math: "2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0" },
              { label: "At x=6: y = √(100−36) = 8. dx/dt = 0.5", math: "2(6)(0.5) + 2(8)\\frac{dy}{dt} = 0 \\Rightarrow \\frac{dy}{dt} = -\\frac{6}{16} = -0.375 \\text{ m/s}" },
            ],
            answer: "The top slides down at 0.375 m/s. Negative sign = downward (y is decreasing).",
            watchFor: "Always label what is increasing and decreasing. A negative rate means that quantity is shrinking.",
          }].map((prob, i) => (
            <div key={i} style={{ ...card }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{prob.title}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: 8 }}>{prob.setup}</div>
              {prob.steps.map((st, j) => (
                <div key={j} style={{ ...card, borderLeft: `3px solid ${j === prob.steps.length - 1 ? "#1D9E75" : "#1D9E75"}`, borderRadius: 0, marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{st.label}</div>
                  <M t={st.math} display ready={ready} />
                </div>
              ))}
              <div style={{ ...card, borderLeft: "3px solid #1D9E75", borderRadius: 0, background: "var(--color-background-success)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-success)", marginBottom: 3 }}>Answer</div>
                <div style={{ fontSize: 13 }}>{prob.answer}</div>
              </div>
              <div style={{ ...card, borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning)", marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-warning)", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".06em" }}>Watch out for</div>
                <div style={{ fontSize: 13 }}>{prob.watchFor}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
