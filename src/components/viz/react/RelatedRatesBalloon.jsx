/**
 * RelatedRatesBalloon.jsx
 *
 * Self-contained lesson: Related Rates — Balloon Problem
 * Covers: what related rates is, why radius slows as balloon grows,
 *         the 4-step method, full worked solution with step accordion,
 *         connection to implicit differentiation.
 *
 * Five tabs:
 *   1. Intuition   — live balloon + sliders showing dr/dt shrink as r grows
 *   2. The theorem — what related rates means, implicit diff connection
 *   3. Solution    — step-by-step worked accordion with WhyPanels
 *   4. The graph   — dr/dt vs r curve (1/r² decay), live pump speed slider
 *   5. Strategy    — 4-step method for any related rates problem
 *
 * Register: RelatedRatesBalloon: lazy(() => import('./react/RelatedRatesBalloon.jsx'))
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ── KaTeX ─────────────────────────────────────────────────────────────────────
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

// ── Shared style tokens ───────────────────────────────────────────────────────
const card = { background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md,8px)", padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 };
const warn = { borderLeft: "3px solid #d97706", borderRadius: 0, background: "var(--color-background-warning,#fffbeb)" };
const ok = { borderLeft: "3px solid #059669", borderRadius: 0, background: "var(--color-background-success,#ecfdf5)" };
const prose = { fontSize: 14, lineHeight: 1.75, color: "var(--color-text-secondary)" };

// ── WhyPanel ──────────────────────────────────────────────────────────────────
const DS = [
    { border: "#6366f1", bg: "#eef2ff", text: "#4338ca" },
    { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" },
    { border: "#059669", bg: "#ecfdf5", text: "#047857" },
];
function WhyPanel({ why, depth = 0, ready }) {
    const [open, setOpen] = useState(false);
    if (!why) return null;
    const d = DS[Math.min(depth, 2)];
    const lbl = why.tag || ["Why?", "But why?", "Prove it"][Math.min(depth, 2)];
    return (
        <div style={{ marginLeft: depth * 14, marginTop: 8 }}>
            <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? d.bg : "transparent", border: `1px solid ${d.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 500, color: d.border, cursor: "pointer" }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: d.border, color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{open ? "−" : "?"}</span>
                {open ? "Close" : lbl}
            </button>
            {open && (
                <div style={{ marginTop: 6, padding: "12px 14px", background: "var(--color-background-secondary)", borderLeft: `3px solid ${d.border}`, borderRadius: "0 8px 8px 0", animation: "sd .16s ease-out" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, marginBottom: 8, display: "inline-block", background: d.bg, color: d.text }}>{lbl}</span>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-primary)", marginTop: 6 }}>{why.explanation}</p>
                    {why.math && <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "10px 14px", textAlign: "center", overflowX: "auto", marginTop: 8 }}><M t={why.math} display ready={ready} /></div>}
                    {why.why && <WhyPanel why={why.why} depth={depth + 1} ready={ready} />}
                </div>
            )}
        </div>
    );
}

// ── Balloon canvas ────────────────────────────────────────────────────────────
function BalloonCanvas({ r, dvRate }) {
    const ref = useRef(null);
    const draw = useCallback(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext("2d");
        const W = c.width, H = c.height;
        const cx = W / 2, cy = H / 2;
        const maxPx = Math.min(W, H) / 2 - 16;
        const px = (r / 10) * maxPx;
        const dark = window.matchMedia("(prefers-color-scheme:dark)").matches;
        ctx.clearRect(0, 0, W, H);
        // Ghost ring showing max size
        ctx.beginPath(); ctx.arc(cx, cy, maxPx, 0, 2 * Math.PI);
        ctx.strokeStyle = dark ? "#334155" : "#e2e8f0";
        ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
        // Balloon
        const grad = ctx.createRadialGradient(cx - px * 0.25, cy - px * 0.25, px * 0.1, cx, cy, px);
        grad.addColorStop(0, dark ? "#60a5fa" : "#93c5fd");
        grad.addColorStop(0.75, dark ? "#2563eb" : "#3b82f6");
        grad.addColorStop(1, dark ? "#1e40af" : "#1d4ed8");
        ctx.beginPath(); ctx.arc(cx, cy, px, 0, 2 * Math.PI);
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = dark ? "#93c5fd" : "#1d4ed8"; ctx.lineWidth = 1.5; ctx.stroke();
        // Radius arrow
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + px, cy);
        ctx.strokeStyle = dark ? "#fbbf24" : "#d97706"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = dark ? "#fbbf24" : "#d97706";
        ctx.font = "11px system-ui"; ctx.textAlign = "center";
        ctx.fillText(`r = ${r.toFixed(1)}`, cx + px / 2, cy - 8);
        // dr/dt arrow at surface
        const sa = 4 * Math.PI * r * r;
        const drNow = dvRate / sa;
        const arrowLen = Math.min(28, drNow * 3500);
        ctx.beginPath(); ctx.moveTo(cx + px, cy); ctx.lineTo(cx + px + arrowLen, cy);
        ctx.strokeStyle = dark ? "#34d399" : "#059669"; ctx.lineWidth = 2.5; ctx.stroke();
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(cx + px + arrowLen, cy);
        ctx.lineTo(cx + px + arrowLen - 5, cy - 4);
        ctx.lineTo(cx + px + arrowLen - 5, cy + 4);
        ctx.closePath();
        ctx.fillStyle = dark ? "#34d399" : "#059669"; ctx.fill();
        ctx.fillStyle = dark ? "#34d399" : "#059669";
        ctx.font = "10px system-ui"; ctx.textAlign = "left";
        ctx.fillText("dr/dt", cx + px + arrowLen + 5, cy + 4);
    }, [r, dvRate]);

    useEffect(() => { draw(); }, [draw]);
    return <canvas ref={ref} width={220} height={220} style={{ width: "100%", maxWidth: 220, display: "block", borderRadius: 8, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)" }} />;
}

// ── Rate graph canvas ─────────────────────────────────────────────────────────
function RateGraph({ dvRate }) {
    const ref = useRef(null);
    const cRef = useRef(null);

    const draw = useCallback(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext("2d");
        const W = c.width, H = c.height;
        const dark = window.matchMedia("(prefers-color-scheme:dark)").matches;
        const PI = Math.PI;
        ctx.clearRect(0, 0, W, H);
        const pad = { l: 50, r: 20, t: 20, b: 40 };
        const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
        const rMin = 0.5, rMax = 10;
        const drMax = dvRate / (4 * PI * rMin * rMin);
        const xS = r => pad.l + (r - rMin) / (rMax - rMin) * iW;
        const yS = dr => pad.t + iH - Math.min(dr / drMax, 1) * iH;
        // Grid
        ctx.strokeStyle = dark ? "#1e293b" : "#f1f5f9"; ctx.lineWidth = 0.5;
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(r => { ctx.beginPath(); ctx.moveTo(xS(r), pad.t); ctx.lineTo(xS(r), pad.t + iH); ctx.stroke(); });
        // Axes
        ctx.strokeStyle = dark ? "#475569" : "#94a3b8"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + iH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pad.l, pad.t + iH); ctx.lineTo(pad.l + iW, pad.t + iH); ctx.stroke();
        // Axis labels
        ctx.fillStyle = dark ? "#475569" : "#94a3b8"; ctx.font = "10px system-ui"; ctx.textAlign = "center";
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(r => ctx.fillText(r, xS(r), pad.t + iH + 14));
        ctx.fillText("radius r (cm)", pad.l + iW / 2, H - 4);
        ctx.save(); ctx.translate(13, pad.t + iH / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText("dr/dt (cm/s)", 0, 0); ctx.restore();
        // Curve
        ctx.beginPath();
        for (let i = 0; i <= 300; i++) {
            const r = rMin + i * (rMax - rMin) / 300;
            const dr = dvRate / (4 * PI * r * r);
            i === 0 ? ctx.moveTo(xS(r), yS(dr)) : ctx.lineTo(xS(r), yS(dr));
        }
        ctx.strokeStyle = dark ? "#38bdf8" : "#0284c7"; ctx.lineWidth = 2.5; ctx.stroke();
        // r=5 marker
        const dr5 = dvRate / (4 * PI * 25);
        ctx.beginPath(); ctx.arc(xS(5), yS(dr5), 5, 0, 2 * PI);
        ctx.fillStyle = dark ? "#fbbf24" : "#d97706"; ctx.fill();
        ctx.fillStyle = dark ? "#fbbf24" : "#d97706"; ctx.font = "11px system-ui"; ctx.textAlign = "left";
        ctx.fillText(`r=5: ${dr5.toFixed(5)}`, xS(5) + 8, yS(dr5) - 5);
        // Label
        ctx.fillStyle = dark ? "#38bdf8" : "#0284c7"; ctx.textAlign = "right";
        ctx.fillText("dr/dt ∝ 1/r²", pad.l + iW - 8, pad.t + 16);
    }, [dvRate]);

    useEffect(() => { draw(); }, [draw]);

    useEffect(() => {
        const ro = new ResizeObserver(() => {
            if (ref.current && cRef.current) {
                ref.current.width = cRef.current.clientWidth;
                ref.current.height = 180;
                draw();
            }
        });
        if (cRef.current) ro.observe(cRef.current);
        return () => ro.disconnect();
    }, [draw]);

    return (
        <div ref={cRef}>
            <canvas ref={ref} width={480} height={180} style={{ width: "100%", display: "block", borderRadius: 8, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)" }} />
        </div>
    );
}

// ── Step accordion item ───────────────────────────────────────────────────────
function StepItem({ num, title, desc, numColor, numBg, children }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ padding: "10px 8px", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", borderRadius: 6 }}
            onClick={() => setOpen(o => !o)}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: numBg, color: numColor, border: `1px solid ${numColor}`, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{num}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{desc}</div>
                    {open && <div style={{ animation: "sd .16s ease-out" }}>{children}</div>}
                </div>
                <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", flexShrink: 0, marginTop: 4 }}>{open ? "▲" : "▼"}</span>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RelatedRatesBalloon({ params = {} }) {
    const ready = useMath();
    const [tab, setTab] = useState("intuition");
    const [r, setR] = useState(5);
    const [dvRate, setDvRate] = useState(2);
    const [dvGraph, setDvGraph] = useState(2);

    const PI = Math.PI;
    const sa = 4 * PI * r * r;
    const drNow = dvRate / sa;
    const drAt1 = dvRate / (4 * PI);
    const slowerFactor = (r * r).toFixed(1);

    const tabBtn = (key, label, color) => ({
        padding: "5px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === key ? 500 : 400,
        border: `0.5px solid ${tab === key ? color : "var(--color-border-secondary)"}`,
        background: tab === key ? color + "22" : "transparent", color: tab === key ? color : "var(--color-text-secondary)",
    });

    return (
        <div style={{ fontFamily: "var(--font-sans,system-ui)", padding: "4px 0" }}>
            <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {/* Header */}
            <div style={{ ...card, borderLeft: "3px solid #0891b2", borderRadius: 0, background: "#ecfeff", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#0891b2", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Related Rates — Worked Example</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#0e7490", marginBottom: 4 }}>The Balloon Problem</div>
                <div style={{ fontSize: 13, color: "#0e7490", lineHeight: 1.7 }}>
                    Air is pumped into a balloon at 2 cm³/sec. How fast is the radius growing when r = 5 cm?
                    This single problem contains every idea in related rates.
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                {[["intuition", "Intuition", "#0891b2"], ["theorem", "What it means", "#7F77DD"], ["solution", "Step-by-step", "#1D9E75"], ["graph", "Rate graph", "#BA7517"], ["strategy", "4-step method", "#A32D2D"]].map(([k, l, c]) => (
                    <button key={k} onClick={() => setTab(k)} style={tabBtn(k, l, c)}>{l}</button>
                ))}
            </div>

            {/* ── TAB 1: INTUITION ── */}
            {tab === "intuition" && (
                <div style={{ animation: "sd .2s ease-out" }}>
                    <div style={{ ...card, marginBottom: 12 }}>
                        <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-secondary)", marginBottom: 10 }}>
                            Most people's first instinct: the radius grows at a constant rate. <strong style={{ color: "var(--color-text-primary)" }}>It doesn't.</strong> As the balloon gets bigger,
                            that same 2 cm³ of air has to spread over more and more inner surface — so the radius slows down.
                            Drag the sliders to see this happen live.
                        </div>
                        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                            <div style={{ flex: "0 0 auto" }}>
                                <BalloonCanvas r={r} dvRate={dvRate} />
                                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 60 }}>Radius r</span>
                                        <input type="range" min={1} max={10} step={0.1} value={r} onChange={e => setR(parseFloat(e.target.value))} style={{ flex: 1, accentColor: "#fbbf24" }} />
                                        <span style={{ fontSize: 12, fontWeight: 500, minWidth: 48, textAlign: "right" }}>{r.toFixed(1)} cm</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 60 }}>dV/dt</span>
                                        <input type="range" min={1} max={20} step={1} value={dvRate} onChange={e => setDvRate(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#0891b2" }} />
                                        <span style={{ fontSize: 12, fontWeight: 500, minWidth: 48, textAlign: "right" }}>{dvRate} cm³/s</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ ...card, background: "var(--color-background-primary)" }}>
                                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>Surface area 4πr²</div>
                                    <div style={{ fontSize: 20, fontWeight: 500 }}>{sa.toFixed(1)} cm²</div>
                                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>the "spreading surface"</div>
                                </div>
                                <div style={{ ...card, background: "var(--color-background-primary)" }}>
                                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>dr/dt (radius speed)</div>
                                    <div style={{ fontSize: 20, fontWeight: 500, color: "#059669" }}>{drNow.toFixed(5)} cm/s</div>
                                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>= dV/dt ÷ surface area</div>
                                </div>
                                <div style={{ ...card, background: "var(--color-background-primary)" }}>
                                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>vs r = 1 cm</div>
                                    <div style={{ fontSize: 20, fontWeight: 500, color: "#d97706" }}>{r === 1 ? "baseline" : `${slowerFactor}× slower`}</div>
                                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>radius grows slower as balloon grows</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ ...card, ...ok }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>The swimming pool analogy</div>
                        <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>
                            Pour a cup of water into a tall thin glass — the level rises fast. Pour the same cup into a swimming pool — barely moves.
                            Same volume rate, very different level rate. The balloon is the same: as r grows, dr/dt falls — always proportional to 1/r².
                        </div>
                    </div>
                    <WhyPanel why={{ tag: "Why exactly 1/r²?", explanation: "dr/dt = dV/dt ÷ 4πr². With dV/dt fixed, dr/dt = constant / r². That's an inverse-square relationship. Double r → one-quarter the radius speed. Triple r → one-ninth. The surface area (4πr²) grows as r², so the rate shrinks as 1/r².", math: "\\frac{dr}{dt} = \\frac{dV/dt}{4\\pi r^2} \\propto \\frac{1}{r^2}", why: null }} depth={0} ready={ready} />
                </div>
            )}

            {/* ── TAB 2: WHAT IT MEANS ── */}
            {tab === "theorem" && (
                <div style={{ animation: "sd .2s ease-out" }}>
                    <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE", marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#26215C", marginBottom: 6 }}>The core idea</div>
                        <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7 }}>
                            V and r are linked by geometry. Because both change with time, their <em>rates of change</em> are also linked — by the Chain Rule. Differentiating both sides with respect to t is the bridge.
                        </div>
                    </div>
                    <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center", marginBottom: 10 }}>
                        <M t={"V = \\tfrac{4}{3}\\pi r^3 \\quad\\xrightarrow{\\frac{d}{dt}\\text{ both sides}}\\quad \\frac{dV}{dt} = 4\\pi r^2 \\cdot \\frac{dr}{dt}"} display ready={ready} />
                        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 6 }}>static geometry → dynamic rates (Chain Rule applied to both sides)</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                        {[{ q: "dV/dt", a: "The pump speed — given as 2. Constant." }, { q: "dr/dt", a: "What we want. Depends on current r." }, { q: "4πr²", a: "Surface area — the denominator. Gets bigger as balloon grows." }, { q: "The equation", a: "dr/dt = dV/dt ÷ 4πr². Radius speed = pump speed ÷ surface area." }].map(({ q, a }, i) => (
                            <div key={i} style={{ ...card, background: "var(--color-background-primary)" }}>
                                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}><M t={q} ready={ready} /></div>
                                <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{a}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ ...card, borderLeft: "3px solid #7F77DD", borderRadius: 0, background: "#EEEDFE" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#534AB7", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Connection to implicit differentiation</div>
                        <div style={{ fontSize: 13, color: "#3C3489", lineHeight: 1.7, marginBottom: 8 }}>
                            Related rates IS implicit differentiation — with time (t) as the variable instead of x.
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {[{ l: "Implicit diff", items: ["Variable: x", "Dependent: y", "Tag: dy/dx", "Goal: slope"] }, { l: "Related rates", items: ["Variable: t (time)", "Dependent: r, V, h…", "Tag: dr/dt", "Goal: speed"] }].map(({ l, items }, i) => (
                                <div key={i} style={{ ...card, background: "var(--color-background-primary)" }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", marginBottom: 6 }}>{l}</div>
                                    {items.map((it, j) => <div key={j} style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{it}</div>)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <WhyPanel why={{ tag: "Why does differentiating r³ give two 'r' terms?", explanation: "Chain Rule: d/dt[r³] = 3r² · dr/dt. The '3r²' is the outer derivative (power rule on r³). The 'dr/dt' is the inner derivative — because r itself is a function of t, the chain rule forces you to multiply by dr/dt. So you get two pieces, both containing r. One gets a number substituted (25 when r=5), the other stays as the unknown dr/dt.", math: "\\frac{d}{dt}[r^3] = \\underbrace{3r^2}_{\\text{outer: power rule}} \\cdot \\underbrace{\\frac{dr}{dt}}_{\\text{inner: r depends on t}}", why: null }} depth={0} ready={ready} />
                </div>
            )}

            {/* ── TAB 3: SOLUTION ── */}
            {tab === "solution" && (
                <div style={{ animation: "sd .2s ease-out" }}>
                    <div style={{ ...card, marginBottom: 12 }}>
                        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            Given: dV/dt = 2 cm³/s. Find dr/dt when r = 5 cm. Click each step to expand.
                        </div>
                    </div>
                    <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
                        <StepItem num={1} title="Write the static geometric relationship" desc="What equation connects V and r at any frozen moment?" numColor="#0c447c" numBg="#e6f1fb">
                            <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center", marginTop: 10 }}>
                                <M t={"V = \\frac{4}{3}\\pi r^3"} display ready={ready} />
                            </div>
                            <p style={{ ...prose, fontSize: 13 }}>This is just the sphere volume formula — nothing calculus yet. It is the <em>static</em> relationship, true at any single frozen moment.</p>
                            <WhyPanel why={{ tag: "Why do we need a geometric equation?", explanation: "Related rates problems always start with a relationship between the variables — before either of them is changing. That's the 'static' equation. Calculus (the Chain Rule) then converts it into a relationship between their rates. You cannot skip straight to rates — you need the geometry first.", why: null }} depth={0} ready={ready} />
                        </StepItem>

                        <StepItem num={2} title="Differentiate both sides with respect to t" desc="Both V and r change with time — apply d/dt to every term" numColor="#0c447c" numBg="#e6f1fb">
                            <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center", marginTop: 10 }}>
                                <M t={"\\frac{d}{dt}[V] = \\frac{d}{dt}\\!\\left[\\frac{4}{3}\\pi r^3\\right]"} display ready={ready} />
                                <M t={"\\frac{dV}{dt} = 4\\pi r^2 \\cdot \\frac{dr}{dt}"} display ready={ready} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                                <div style={{ ...card, borderLeft: "3px solid #0891b2", borderRadius: 0 }}>
                                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>Outer: differentiate r³</div>
                                    <div style={{ fontSize: 13 }}>→ 3r² (power rule)</div>
                                </div>
                                <div style={{ ...card, borderLeft: "3px solid #d97706", borderRadius: 0 }}>
                                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>Inner: r depends on t</div>
                                    <div style={{ fontSize: 13 }}>→ multiply by dr/dt</div>
                                </div>
                            </div>
                            <WhyPanel why={{ tag: "Why does the chain rule force a dr/dt here?", explanation: "When you differentiate r³ with respect to t, r is not the independent variable — t is. So r is a composition: r(t). The chain rule says: d/dt[f(r(t))] = f′(r(t)) · r′(t). Here f(r) = r³, so f′(r) = 3r², and r′(t) = dr/dt. Multiplying them: d/dt[r³] = 3r² · dr/dt. Without the dr/dt, you'd be treating r as a constant — which it's not.", math: "\\frac{d}{dt}[r^3] = 3r^2 \\cdot \\frac{dr}{dt}", why: null }} depth={0} ready={ready} />
                        </StepItem>

                        <StepItem num={3} title="Substitute what you know at r = 5" desc="Plug in dV/dt = 2 and r = 5 — now it's one equation, one unknown" numColor="#0c447c" numBg="#e6f1fb">
                            <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center", marginTop: 10 }}>
                                <M t={"2 = 4\\pi \\cdot (5)^2 \\cdot \\frac{dr}{dt}"} display ready={ready} />
                                <M t={"2 = 4\\pi \\cdot 25 \\cdot \\frac{dr}{dt}"} display ready={ready} />
                                <M t={"2 = 100\\pi \\cdot \\frac{dr}{dt}"} display ready={ready} />
                            </div>
                            <div style={{ ...card, ...warn, marginTop: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#d97706", marginBottom: 4 }}>The "disappearing r" explained</div>
                                <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>
                                    The r² term became 25 because you substituted r = 5. The dr/dt term stayed symbolic because it's the unknown you're solving for.
                                    One r "disappeared" by becoming a constant — the other stays until the last step.
                                </div>
                            </div>
                            <WhyPanel why={{ tag: "Why must we substitute AFTER differentiating?", explanation: "If you plug r=5 into V = (4/3)πr³ first, you get V = 500π/3 — a constant. Its derivative is 0. You'd end up with 2 = 0, which is nonsense. The substitution can only happen after differentiation because differentiation is what produced the dr/dt term. Always: differentiate first, substitute second.", why: null }} depth={0} ready={ready} />
                        </StepItem>

                        <StepItem num={4} title="Solve for dr/dt — pure algebra" desc="Divide both sides by 100π" numColor="#085041" numBg="#e1f5ee">
                            <div style={{ ...card, background: "var(--color-background-primary)", textAlign: "center", marginTop: 10 }}>
                                <M t={"\\frac{dr}{dt} = \\frac{2}{100\\pi} = \\frac{1}{50\\pi} \\approx 0.00637 \\text{ cm/sec}"} display ready={ready} />
                            </div>
                            <div style={{ ...card, ...ok, marginTop: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", marginBottom: 4 }}>Units check</div>
                                <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>
                                    dV/dt has units cm³/s. 4πr² has units cm². Dividing: cm³/s ÷ cm² = cm/s. That's the correct unit for dr/dt — speed of the radius expanding outward. ✓
                                </div>
                            </div>
                            <WhyPanel why={{ tag: "What does the textbook's r′(t) notation mean vs dr/dt?", explanation: "They mean exactly the same thing: r′(t) is Lagrange's notation, dr/dt is Leibniz's notation. The textbook uses r′(t) because it's compact. Leibniz's notation (dr/dt) is often preferred in related rates problems because it explicitly reminds you what is changing relative to what — r relative to t.", why: null }} depth={0} ready={ready} />
                        </StepItem>
                    </div>
                </div>
            )}

            {/* ── TAB 4: RATE GRAPH ── */}
            {tab === "graph" && (
                <div style={{ animation: "sd .2s ease-out" }}>
                    <div style={{ ...card, marginBottom: 12 }}>
                        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            With dV/dt fixed, dr/dt = dV/dt ÷ 4πr² is <strong style={{ color: "var(--color-text-primary)" }}>inversely proportional to r²</strong>.
                            Double the radius → one-quarter the radius speed. The yellow dot marks r = 5 cm.
                            Change the pump speed — the curve scales up or down, but the shape never changes.
                        </div>
                    </div>
                    <RateGraph dvRate={dvGraph} />
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 60 }}>dV/dt</span>
                        <input type="range" min={1} max={20} step={1} value={dvGraph} onChange={e => setDvGraph(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#BA7517" }} />
                        <span style={{ fontSize: 12, fontWeight: 500, minWidth: 52, textAlign: "right" }}>{dvGraph} cm³/s</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ ...card, background: "var(--color-background-primary)" }}>
                            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>dr/dt at r = 1</div>
                            <div style={{ fontSize: 17, fontWeight: 500 }}>{(dvGraph / (4 * PI)).toFixed(5)}</div>
                        </div>
                        <div style={{ ...card, background: "var(--color-background-primary)" }}>
                            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>dr/dt at r = 5</div>
                            <div style={{ fontSize: 17, fontWeight: 500, color: "#d97706" }}>{(dvGraph / (4 * PI * 25)).toFixed(5)}</div>
                        </div>
                        <div style={{ ...card, background: "var(--color-background-primary)" }}>
                            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>dr/dt at r = 10</div>
                            <div style={{ fontSize: 17, fontWeight: 500 }}>{(dvGraph / (4 * PI * 100)).toFixed(5)}</div>
                        </div>
                        <div style={{ ...card, background: "var(--color-background-primary)" }}>
                            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>r=10 vs r=1</div>
                            <div style={{ fontSize: 17, fontWeight: 500, color: "#A32D2D" }}>100× slower</div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 5: STRATEGY ── */}
            {tab === "strategy" && (
                <div style={{ animation: "sd .2s ease-out" }}>
                    <div style={{ ...card, borderLeft: "3px solid #A32D2D", borderRadius: 0, background: "#FCEBEB", marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#501313", marginBottom: 4 }}>The 4-step method — works for every related rates problem</div>
                        <div style={{ fontSize: 13, color: "#791F1F", lineHeight: 1.7 }}>Ladder, shadow, cone draining, balloon expanding — all four steps, every time. No exceptions.</div>
                    </div>
                    {[
                        { n: 1, c: "#0c447c", bg: "#e6f1fb", title: "Draw a diagram. Label all quantities.", desc: "Identify which quantities change with time (give them d/dt tags mentally) and which are constant at the instant you care about." },
                        { n: 2, c: "#0c447c", bg: "#e6f1fb", title: "Write the static geometric equation.", desc: "Volume formula, Pythagorean theorem, similar triangles, trig ratio — whatever connects your variables. Do NOT differentiate yet.", note: "This step is where students most often get stuck. The equation comes from geometry, not calculus." },
                        { n: 3, c: "#0c447c", bg: "#e6f1fb", title: "Differentiate both sides with respect to t.", desc: "Chain rule every variable that depends on t. Each one gets a d(var)/dt multiplier. This is the 'rates equation.'" },
                        { n: 4, c: "#085041", bg: "#e1f5ee", title: "Substitute known values. Solve algebraically.", desc: "Plug in every known rate and every known instantaneous value. The calculus is done — from here it's algebra only." },
                    ].map(({ n, c, bg, title, desc, note }) => (
                        <div key={n} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: bg, color: c, border: `1px solid ${c}`, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 3 }}>{title}</div>
                                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{desc}</div>
                                {note && <div style={{ fontSize: 12, color: "#d97706", marginTop: 4, fontStyle: "italic" }}>{note}</div>}
                            </div>
                        </div>
                    ))}
                    <div style={{ ...card, ...warn, marginTop: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#d97706", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>The most common mistake</div>
                        <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>
                            Substituting the known values BEFORE differentiating. If you plug r=5 into V = ⅓πr³ first, you get a constant — and its derivative is zero.
                            The unknown rate disappears before you can find it. <strong>Always differentiate first, substitute second.</strong>
                        </div>
                    </div>
                    <WhyPanel why={{ tag: "What geometric equations should I know for common related rates problems?", explanation: "Sphere: V = (4/3)πr³, SA = 4πr². Cone: V = (1/3)πr²h. Cylinder: V = πr²h. Pythagorean theorem: a²+b²=c². Similar triangles (ratios of sides). Trig: sin=opp/hyp, tan=opp/adj. You don't need calculus to find these — they're geometry. The calculus only happens in step 3.", why: null }} depth={0} ready={ready} />
                </div>
            )}
        </div>
    );
}