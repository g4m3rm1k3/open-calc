/**
 * RelatedRatesEngine.jsx
 *
 * Abstract intuition viz: "The Machine Behind Every Related Rates Problem"
 *
 * Goal: make the STRUCTURE of related rates intuitive — not one example,
 *       but the pattern that makes every example the same.
 *
 * Four tabs:
 *   1. The Machine   — animated gear diagram: two quantities locked by geometry,
 *                      the chain rule as the connecting gear, drag one rate and
 *                      watch the other respond
 *   2. Anatomy       — what every related rates problem is made of:
 *                      the static equation, the rates equation, the substitution
 *                      shown as a colour-coded dissection you can click through
 *   3. Scenarios     — five different problems (plane, ladder, cone, shadow, car)
 *                      each reduced to its geometric equation and rates equation.
 *                      Shows they are all the same structure.
 *   4. Build your own — type in a relationship equation (e.g. x²+y²=z²) and
 *                       pick which rate is given and which is wanted. The viz
 *                       shows the differentiated form and labels the roles.
 *
 * Register: RelatedRatesEngine: lazy(() => import('./react/RelatedRatesEngine.jsx'))
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

// ── Theme hook ────────────────────────────────────────────────────────────────
function useIsDark() {
  const isDark = () => document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const Ccard = { background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md,8px)", padding:"12px 14px", border:"0.5px solid var(--color-border-tertiary)", marginBottom:8 };
function makeC(dark) {
  return {
    card:   Ccard,
    warn:   { borderLeft:"3px solid #d97706", borderRadius:0, background: dark ? "#1c0a00" : "#fffbeb" },
    ok:     { borderLeft:"3px solid #059669", borderRadius:0, background: dark ? "#052e16" : "#ecfdf5" },
    info:   { borderLeft:"3px solid #0891b2", borderRadius:0, background: dark ? "#083344" : "#ecfeff" },
    purple: { borderLeft:"3px solid #7F77DD", borderRadius:0, background: dark ? "#1a1547" : "#EEEDFE" },
  };
}

// ── WhyPanel ──────────────────────────────────────────────────────────────────
function WhyPanel({ why, depth = 0, ready, dark }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const DS = dark ? [
    { border:"#818cf8", bg:"#1e1b4b", text:"#a5b4fc" },
    { border:"#22d3ee", bg:"#083344", text:"#67e8f9" },
    { border:"#34d399", bg:"#052e16", text:"#6ee7b7" },
  ] : [
    { border:"#6366f1", bg:"#eef2ff", text:"#4338ca" },
    { border:"#0891b2", bg:"#ecfeff", text:"#0e7490" },
    { border:"#059669", bg:"#ecfdf5", text:"#047857" },
  ];
  const d = DS[Math.min(depth, 2)];
  const lbl = why.tag || ["Why?","But why?","Prove it"][Math.min(depth, 2)];
  return (
    <div style={{ marginLeft:depth*14, marginTop:8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display:"inline-flex",alignItems:"center",gap:6,background:open?d.bg:"transparent",border:`1px solid ${d.border}`,borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:500,color:d.border,cursor:"pointer" }}>
        <span style={{ width:14,height:14,borderRadius:"50%",background:d.border,color:"#fff",fontSize:9,fontWeight:700,flexShrink:0,display:"inline-flex",alignItems:"center",justifyContent:"center" }}>{open?"−":"?"}</span>
        {open ? "Close" : lbl}
      </button>
      {open && (
        <div style={{ marginTop:6,padding:"12px 14px",background:"var(--color-background-secondary)",borderLeft:`3px solid ${d.border}`,borderRadius:"0 8px 8px 0",animation:"sd .16s ease-out" }}>
          <p style={{ fontSize:13,lineHeight:1.7,color:"var(--color-text-primary)" }}>{why.explanation}</p>
          {why.math && <div style={{ background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:6,padding:"10px",textAlign:"center",overflowX:"auto",marginTop:8 }}><M t={why.math} display ready={ready}/></div>}
          {why.why && <WhyPanel why={why.why} depth={depth+1} ready={ready}/>}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1: THE MACHINE — animated gear canvas
// ════════════════════════════════════════════════════════════════════════════
function MachineTab({ ready, dark }) {
  const canvasRef = useRef(null);
  const cWrap     = useRef(null);
  const animRef   = useRef(null);
  const stateRef  = useRef({ angle: 0, givenRate: 3, t: 0 });
  const [givenRate, setGivenRate] = useState(3);
  const [gearState, setGearState] = useState({ given: 3, wanted: 0, geomVal: 25 });

  // Update ref immediately so animation loop picks it up without re-render
  useEffect(() => { stateRef.current.givenRate = givenRate; }, [givenRate]);

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c || !cWrap.current) return;
    c.width = cWrap.current.clientWidth;
    c.height = 280;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;

    const col = {
      bg:      dark ? "#0f172a" : "#f8fafc",
      panel:   dark ? "#1e293b" : "#ffffff",
      border:  dark ? "#334155" : "#e2e8f0",
      text:    dark ? "#e2e8f0" : "#1e293b",
      muted:   dark ? "#64748b" : "#94a3b8",
      given:   dark ? "#38bdf8" : "#0284c7",   // blue — the given rate
      gear:    dark ? "#a78bfa" : "#7c3aed",   // purple — chain rule gear
      wanted:  dark ? "#34d399" : "#059669",   // green — the wanted rate
      geom:    dark ? "#fbbf24" : "#d97706",   // amber — geometry box
    };

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = dark ? "#0c1220" : "#f1f5f9";
    ctx.roundRect(0, 0, W, H, 10); ctx.fill();

    const { angle, givenRate: gr, t } = stateRef.current;
    // Spinning speeds: given gear large (r=52), chain gear medium (r=36), wanted gear (r=44)
    // Position three gears across the canvas
    const g1 = { x: W * 0.22, y: H * 0.45, r: 52, speed: gr * 0.3, label: "given\nrate", col: col.given, teeth: 10 };
    const g2 = { x: W * 0.50, y: H * 0.45, r: 36, speed: -(g1.speed * g1.r / 36), label: "Chain\nRule", col: col.gear, teeth: 7 };
    const g3 = { x: W * 0.78, y: H * 0.45, r: 44, speed: g2.speed * 36 / 44, label: "wanted\nrate", col: col.wanted, teeth: 9 };

    function drawGear(g, ang) {
      const { x, y, r, col: gc, teeth } = g;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      // Teeth
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * 2 * Math.PI;
        const inner = r, outer = r + 10, w = 0.22;
        ctx.beginPath();
        ctx.moveTo(inner * Math.cos(a - w), inner * Math.sin(a - w));
        ctx.lineTo(outer * Math.cos(a - w * 0.5), outer * Math.sin(a - w * 0.5));
        ctx.lineTo(outer * Math.cos(a + w * 0.5), outer * Math.sin(a + w * 0.5));
        ctx.lineTo(inner * Math.cos(a + w), inner * Math.sin(a + w));
        ctx.closePath();
        ctx.fillStyle = gc + (dark ? "cc" : "99");
        ctx.fill();
      }
      // Body
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 2*Math.PI);
      ctx.fillStyle = gc + (dark ? "33" : "22");
      ctx.fill();
      ctx.strokeStyle = gc; ctx.lineWidth = 2; ctx.stroke();
      // Hub
      ctx.beginPath(); ctx.arc(0, 0, r*0.2, 0, 2*Math.PI);
      ctx.fillStyle = gc; ctx.fill();
      ctx.restore();
    }

    drawGear(g1, angle * g1.speed);
    drawGear(g2, angle * g2.speed);
    drawGear(g3, angle * g3.speed);

    // Connection axles between gears (dashed)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = col.border; ctx.lineWidth = 1;
    [[g1,g2],[g2,g3]].forEach(([a, b]) => {
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      const nx = dx/d, ny = dy/d;
      ctx.beginPath();
      ctx.moveTo(a.x + nx * a.r, a.y + ny * a.r);
      ctx.lineTo(b.x - nx * b.r, b.y - ny * b.r);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Labels above gears
    [g1, g2, g3].forEach(g => {
      const lines = g.label.split("\n");
      ctx.fillStyle = g.col; ctx.font = "500 13px system-ui"; ctx.textAlign = "center";
      lines.forEach((ln, i) => ctx.fillText(ln, g.x, g.y - g.r - 16 + i * 16));
    });

    // Geometry box between g1 and g3 (below)
    const boxY = H * 0.82, boxH = 32, boxW = W * 0.55, boxX = W * 0.5 - boxW/2;
    ctx.beginPath(); ctx.roundRect(boxX, boxY - boxH/2, boxW, boxH, 6);
    ctx.fillStyle = col.geom + "22"; ctx.fill();
    ctx.strokeStyle = col.geom; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = col.geom; ctx.font = "13px system-ui"; ctx.textAlign = "center";
    ctx.fillText("Geometric equation   (the lock between variables)", W/2, boxY + 5);

    // Curved dotted lines from gear bases down to geometry box
    [[g1, boxX + 10],[g3, boxX + boxW - 10]].forEach(([g, bx]) => {
      ctx.beginPath();
      ctx.moveTo(g.x, g.y + g.r + 10);
      ctx.bezierCurveTo(g.x, g.y + g.r + 30, bx, boxY - boxH/2 - 20, bx, boxY - boxH/2);
      ctx.strokeStyle = col.geom + "88"; ctx.lineWidth = 1; ctx.setLineDash([3,3]); ctx.stroke();
      ctx.setLineDash([]);
    });

    // Live rate readout
    const wantedRate = gr * g1.r / g3.r;
    ctx.fillStyle = col.muted; ctx.font = "11px system-ui"; ctx.textAlign = "left";
    ctx.fillText(`given rate = ${gr.toFixed(1)} →  wanted rate = ${wantedRate.toFixed(3)}`, 12, H - 8);

    setGearState({ given: gr, wanted: +wantedRate.toFixed(4), geomVal: +(g1.r * g1.r).toFixed(0) });

    stateRef.current.angle += 0.015;
    animRef.current = requestAnimationFrame(draw);
  }, [dark]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => { if (animRef.current) cancelAnimationFrame(animRef.current); animRef.current = requestAnimationFrame(draw); });
    if (cWrap.current) ro.observe(cWrap.current);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, [draw]);

  const C = makeC(dark);
  return (
    <div>
      <div style={{ ...C.card, marginBottom:12 }}>
        <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.75 }}>
          Every related rates problem is this machine. Two quantities are <strong style={{color:"var(--color-text-primary)"}}>locked together</strong> by a geometric equation — so when one moves, the other is forced to move too.
          The Chain Rule is the <strong style={{color:"#7c3aed"}}>connecting gear</strong>: it transmits the rate from the one you know to the one you want.
          Drag the slider to change the given rate — watch the wanted rate respond.
        </p>
      </div>
      <div ref={cWrap} style={{ marginBottom:10 }}>
        <canvas ref={canvasRef} style={{ width:"100%", display:"block", borderRadius:8 }}/>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <span style={{ fontSize:12, color:"var(--color-text-secondary)", minWidth:72 }}>Given rate</span>
        <input type="range" min={0.5} max={10} step={0.1} value={givenRate}
          onChange={e => { const v = parseFloat(e.target.value); setGivenRate(v); stateRef.current.givenRate = v; }}
          style={{ flex:1, accentColor:"#0284c7" }}/>
        <span style={{ fontSize:13, fontWeight:500, minWidth:36, textAlign:"right" }}>{givenRate.toFixed(1)}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {[
          { label:"Given rate", val:gearState.given.toFixed(2), col:"#0284c7", sub:"you know this" },
          { label:"Chain Rule ratio", val:"×" + (52/44).toFixed(3), col:"#7c3aed", sub:"from the geometry" },
          { label:"Wanted rate", val:gearState.wanted.toFixed(4), col:"#059669", sub:"what you find" },
        ].map(({ label, val, col, sub }) => (
          <div key={label} style={{ ...C.card, background:"var(--color-background-primary)", textAlign:"center" }}>
            <div style={{ fontSize:10, color:"var(--color-text-tertiary)", marginBottom:3 }}>{label}</div>
            <div style={{ fontSize:18, fontWeight:500, color:col }}>{val}</div>
            <div style={{ fontSize:10, color:"var(--color-text-tertiary)", marginTop:2 }}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ ...C.card, ...C.purple, marginTop:4 }}>
        <div style={{ fontSize:12, fontWeight:600, color:dark?"#c4b5fd":"#534AB7", marginBottom:4 }}>The one sentence that unlocks every related rates problem</div>
        <div style={{ fontSize:13, color:dark?"#a5b4fc":"#3C3489", lineHeight:1.7 }}>
          If two variables are connected by an equation, differentiating that equation (with respect to time) connects their rates.
          The geometric equation is the <em>lock</em>. The Chain Rule is the <em>key</em>.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2: ANATOMY — colour-coded dissection of the structure
// ════════════════════════════════════════════════════════════════════════════
const ANATOMY_STEPS = [
  {
    id: "static",
    label: "Static equation",
    color: "#d97706",
    bg: "#faeeda",
    text: "#412402",
    title: "Step 1: The geometric lock",
    prose: "Every related rates problem has a static equation — a geometric or physical relationship that is always true, regardless of time. This is just the formula you already know from geometry or physics. At this stage, nothing is moving yet.",
    examples: [
      { context:"Sphere", eq:"V = \\tfrac{4}{3}\\pi r^3" },
      { context:"Right triangle (Pythagorean)", eq:"a^2 + b^2 = c^2" },
      { context:"Cone", eq:"V = \\tfrac{1}{3}\\pi r^2 h" },
      { context:"Similar triangles", eq:"\\tfrac{x}{h} = \\tfrac{r}{H}" },
    ],
    insight: "This is NOT a calculus step. You are reading geometry. The harder part is knowing which geometry applies — that's why you draw a diagram first.",
  },
  {
    id: "differentiate",
    label: "Differentiate w.r.t. t",
    color: "#7c3aed",
    bg: "#eef2ff",
    text: "#3730a3",
    title: "Step 2: Turn the lock with the Chain Rule",
    prose: "Differentiate both sides of the static equation with respect to time (t). Every variable that changes with time gets a rate (d/dt) tag. The Chain Rule is what produces these tags automatically — this is the only calculus step.",
    examples: [
      { context:"Sphere", eq:"\\frac{dV}{dt} = 4\\pi r^2 \\cdot \\frac{dr}{dt}" },
      { context:"Pythagorean", eq:"2a\\frac{da}{dt} + 2b\\frac{db}{dt} = 2c\\frac{dc}{dt}" },
      { context:"Cone (r fixed)", eq:"\\frac{dV}{dt} = \\tfrac{1}{3}\\pi r^2 \\cdot \\frac{dh}{dt}" },
      { context:"Similar triangles", eq:"\\frac{1}{h}\\frac{dx}{dt} - \\frac{x}{h^2}\\frac{dh}{dt} = 0" },
    ],
    insight: "Notice the pattern: every term gets a d(var)/dt multiplier for every variable that changes with time. Constants stay constants. This step has a rigid, mechanical structure — it's just the Chain Rule applied systematically.",
  },
  {
    id: "substitute",
    label: "Substitute & solve",
    color: "#059669",
    bg: "#ecfdf5",
    text: "#065f46",
    title: "Step 3: Plug in the frozen moment",
    prose: "You are asked about one specific instant — 'when r = 5' or 'when the ladder is 6m from the wall'. Plug in all known values (both rates and instantaneous measurements) into the rates equation. What remains is one unknown rate. Solve with algebra.",
    examples: [
      { context:"Sphere (r=5, dV/dt=2)", eq:"2 = 4\\pi(25)\\cdot\\frac{dr}{dt} \\Rightarrow \\frac{dr}{dt} = \\frac{1}{50\\pi}" },
      { context:"Pythagorean (a=6, da/dt=1, c=10)", eq:"2(6)(1)+2b\\frac{db}{dt}=0 \\Rightarrow \\frac{db}{dt} = -\\tfrac{6}{b}" },
    ],
    insight: "After substitution, the calculus is completely done. Everything left is algebra — isolate the unknown rate. This is where students lose sign errors: negative rates mean that quantity is shrinking.",
    watchFor: "Substitute AFTER differentiating, never before. Plugging in the geometric values first turns a variable into a constant, making its derivative zero — the unknown rate disappears before you can find it.",
  },
];

const STEP_DARK = [
  { bg:"#2a1500", text:"#fcd34d" },
  { bg:"#1a1547", text:"#c4b5fd" },
  { bg:"#052e16", text:"#6ee7b7" },
];

function AnatomyTab({ ready, dark }) {
  const [activeStep, setActiveStep] = useState(0);
  const step = ANATOMY_STEPS[activeStep];
  const C = makeC(dark);
  const stepBg   = dark ? STEP_DARK[activeStep].bg   : step.bg;
  const stepText = dark ? STEP_DARK[activeStep].text : step.text;

  return (
    <div>
      <div style={{ ...C.card, marginBottom:12 }}>
        <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.75 }}>
          Strip away every specific example. Every related rates problem is built from the same three-layer structure.
          Click each layer to see what it looks like across four different problem types simultaneously.
        </p>
      </div>
      {/* Layer selector */}
      <div style={{ display:"flex", gap:0, marginBottom:14, borderRadius:8, overflow:"hidden", border:"0.5px solid var(--color-border-tertiary)" }}>
        {ANATOMY_STEPS.map((s, i) => {
          const sBg   = dark ? STEP_DARK[i].bg   : s.bg;
          const sText = dark ? STEP_DARK[i].text : s.text;
          return (
            <button key={s.id} onClick={() => setActiveStep(i)} style={{ flex:1, padding:"10px 8px", border:"none", borderRight:i<2?"0.5px solid var(--color-border-tertiary)":"none", background:activeStep===i ? sBg : "var(--color-background-secondary)", color:activeStep===i ? sText : "var(--color-text-secondary)", fontSize:12, fontWeight:activeStep===i?600:400, cursor:"pointer", lineHeight:1.4 }}>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:".07em", textTransform:"uppercase", marginBottom:3, color:activeStep===i?s.color:"var(--color-text-tertiary)" }}>{i+1}</div>
              {s.label}
            </button>
          );
        })}
      </div>
      {/* Active step detail */}
      <div key={step.id} style={{ animation:"sd .18s ease-out" }}>
        <div style={{ ...C.card, borderLeft:`3px solid ${step.color}`, borderRadius:0, background:stepBg, marginBottom:10 }}>
          <div style={{ fontSize:14, fontWeight:500, color:stepText, marginBottom:6 }}>{step.title}</div>
          <div style={{ fontSize:13, color:stepText, lineHeight:1.75, opacity:0.85 }}>{step.prose}</div>
        </div>
        {/* Four examples side by side */}
        <div style={{ fontSize:11, fontWeight:600, color:"var(--color-text-tertiary)", letterSpacing:".07em", textTransform:"uppercase", marginBottom:8 }}>
          Same step, four different problems
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
          {step.examples.map(({ context, eq }) => (
            <div key={context} style={{ ...C.card, background:"var(--color-background-primary)" }}>
              <div style={{ fontSize:11, color:step.color, fontWeight:600, marginBottom:6 }}>{context}</div>
              <M t={eq} display ready={ready}/>
            </div>
          ))}
        </div>
        {step.watchFor && (
          <div style={{ ...C.card, ...C.warn }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#d97706", marginBottom:4, textTransform:"uppercase", letterSpacing:".06em" }}>Watch out for</div>
            <div style={{ fontSize:13, lineHeight:1.6 }}>{step.watchFor}</div>
          </div>
        )}
        <div style={{ ...C.card, ...C.ok }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#059669", marginBottom:4 }}>Key insight</div>
          <div style={{ fontSize:13, lineHeight:1.6 }}>{step.insight}</div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3: SCENARIOS — five problems, same structure
// ════════════════════════════════════════════════════════════════════════════
const SCENARIOS = [
  {
    name: "Balloon (sphere)",
    icon: "○",
    iconColor: "#0284c7",
    situation: "Air is pumped in at a fixed rate. How fast does the radius grow?",
    geometry: "V = \\tfrac{4}{3}\\pi r^3",
    geoNote: "Volume of a sphere. Both V and r change with t.",
    rates: "\\frac{dV}{dt} = 4\\pi r^2 \\cdot \\frac{dr}{dt}",
    ratesNote: "Chain Rule on r³ gives 3r²·dr/dt. The 4π/3 times 3 simplifies to 4π.",
    given: "dV/dt (pump rate)",
    want: "dr/dt (how fast radius expands)",
    pattern: "Rate of one dimension → rate of another, same object",
    insight: "As r grows, 4πr² (surface area) grows too — so dr/dt shrinks. Same volume rate, smaller radius rate.",
  },
  {
    name: "Plane & observer",
    icon: "△",
    iconColor: "#7c3aed",
    situation: "A plane flies at constant altitude. An observer on the ground watches. How fast does the distance to the plane change?",
    geometry: "D^2 = x^2 + h^2",
    geoNote: "Pythagorean theorem. D = distance observer→plane, x = horizontal distance, h = altitude (constant).",
    rates: "2D\\frac{dD}{dt} = 2x\\frac{dx}{dt} + 0",
    ratesNote: "dh/dt = 0 because altitude is constant. The plane only moves horizontally.",
    given: "dx/dt (horizontal speed of plane)",
    want: "dD/dt (rate distance is changing)",
    pattern: "Two legs of a right triangle — one changing, find rate of hypotenuse",
    insight: "When the plane is directly overhead (x=0), D=h and dD/dt=0 — distance isn't changing at that instant. As the plane flies away, dD/dt approaches the plane's speed.",
    yourIdea: true,
  },
  {
    name: "Sliding ladder",
    icon: "╱",
    iconColor: "#d97706",
    situation: "A ladder leans against a wall. The base slides outward. How fast does the top slide down?",
    geometry: "x^2 + y^2 = L^2",
    geoNote: "Pythagorean theorem. x = base distance, y = height, L = ladder length (constant).",
    rates: "2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0",
    ratesNote: "dL/dt = 0 because the ladder doesn't stretch. The 2s cancel: x·(dx/dt) + y·(dy/dt) = 0.",
    given: "dx/dt (base sliding out)",
    want: "dy/dt (top sliding down — will be negative)",
    pattern: "Two legs of a right triangle — both changing, constraint is constant hypotenuse",
    insight: "dy/dt = −(x/y)·(dx/dt). When the top is high (y large), it slides slowly. Near the ground (y small), it slides catastrophically fast.",
  },
  {
    name: "Draining cone",
    icon: "▽",
    iconColor: "#059669",
    situation: "Water drains from a conical tank. The radius-to-height ratio is fixed. How fast does the water level drop?",
    geometry: "V = \\tfrac{1}{3}\\pi r^2 h \\;\\xrightarrow{r = kh}\\; V = \\tfrac{1}{3}\\pi k^2 h^3",
    geoNote: "Use similar triangles to eliminate r: r/h = constant k. Substitute to get V as a function of h only.",
    rates: "\\frac{dV}{dt} = \\pi k^2 h^2 \\cdot \\frac{dh}{dt}",
    ratesNote: "After substituting r = kh, V depends only on h. Chain Rule on h³ gives 3h²·dh/dt, and the (1/3) cancels with the 3.",
    given: "dV/dt (drain rate, negative)",
    want: "dh/dt (how fast water level drops)",
    pattern: "Use a constraint (similar triangles) to reduce to one variable before differentiating",
    insight: "The constraint r = kh is the key move. It lets you eliminate r so the equation has only one variable (h). Always look for a constraint that lets you reduce variables.",
  },
  {
    name: "Shadow length",
    icon: "◫",
    iconColor: "#A32D2D",
    situation: "A person walks away from a streetlight. How fast does their shadow lengthen?",
    geometry: "\\frac{H}{x+s} = \\frac{h}{s}",
    geoNote: "Similar triangles: light height H, person height h, person's distance from pole x, shadow length s.",
    rates: "\\frac{ds}{dt} = \\frac{h}{H-h}\\cdot\\frac{dx}{dt}",
    ratesNote: "Cross-multiply first to get s = hx/(H−h), then differentiate. H and h are constants.",
    given: "dx/dt (walking speed)",
    want: "ds/dt (shadow lengthening rate)",
    pattern: "Similar triangles constraint → algebraic rearrangement before differentiating",
    insight: "The shadow grows at a constant rate (no variable in the final formula — it's a pure ratio). The shadow tip moves faster than the person: at speed (H/(H−h))·dx/dt.",
  },
];

function ScenariosTab({ ready, dark }) {
  const [idx, setIdx] = useState(1); // default to plane (your idea)
  const sc = SCENARIOS[idx];
  const C = makeC(dark);

  return (
    <div>
      <div style={{ ...C.card, marginBottom:12 }}>
        <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.75 }}>
          Five completely different physical situations. Every one follows the same three-step structure.
          The only thing that changes is which geometric equation you start with.
        </p>
      </div>
      {/* Scenario selector */}
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {SCENARIOS.map((s, i) => (
          <button key={s.name} onClick={() => setIdx(i)} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:16, fontSize:12, cursor:"pointer", fontWeight:i===idx?600:400, border:`0.5px solid ${i===idx ? s.iconColor : "var(--color-border-secondary)"}`, background:i===idx ? s.iconColor+"18" : "transparent", color:i===idx ? s.iconColor : "var(--color-text-secondary)" }}>
            <span style={{ fontSize:14 }}>{s.icon}</span>
            {s.name}
            {s.yourIdea && <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:6, background:s.iconColor, color:"#fff" }}>yours</span>}
          </button>
        ))}
      </div>

      <div key={sc.name} style={{ animation:"sd .18s ease-out" }}>
        {/* Situation */}
        <div style={{ ...C.card, borderLeft:`3px solid ${sc.iconColor}`, borderRadius:0, background:sc.iconColor+"12", marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:600, color:sc.iconColor, letterSpacing:".07em", textTransform:"uppercase", marginBottom:4 }}>The situation</div>
          <div style={{ fontSize:14, color:"var(--color-text-primary)", lineHeight:1.7 }}>{sc.situation}</div>
        </div>
        {/* Three-column structure */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
          <div style={{ ...C.card, background:"var(--color-background-primary)" }}>
            <div style={{ fontSize:10, fontWeight:600, color:"#d97706", letterSpacing:".07em", textTransform:"uppercase", marginBottom:6 }}>Step 1 — Geometric equation</div>
            <M t={sc.geometry} display ready={ready}/>
            <div style={{ fontSize:11, color:"var(--color-text-tertiary)", marginTop:6, lineHeight:1.5 }}>{sc.geoNote}</div>
          </div>
          <div style={{ ...C.card, background:"var(--color-background-primary)" }}>
            <div style={{ fontSize:10, fontWeight:600, color:"#7c3aed", letterSpacing:".07em", textTransform:"uppercase", marginBottom:6 }}>Step 2 — Rates equation (after d/dt)</div>
            <M t={sc.rates} display ready={ready}/>
            <div style={{ fontSize:11, color:"var(--color-text-tertiary)", marginTop:6, lineHeight:1.5 }}>{sc.ratesNote}</div>
          </div>
          <div style={{ ...C.card, background:"var(--color-background-primary)" }}>
            <div style={{ fontSize:10, fontWeight:600, color:"#0891b2", letterSpacing:".07em", textTransform:"uppercase", marginBottom:6 }}>What's given</div>
            <div style={{ fontSize:13, color:"var(--color-text-primary)" }}>{sc.given}</div>
          </div>
          <div style={{ ...C.card, background:"var(--color-background-primary)" }}>
            <div style={{ fontSize:10, fontWeight:600, color:"#059669", letterSpacing:".07em", textTransform:"uppercase", marginBottom:6 }}>What you want</div>
            <div style={{ fontSize:13, color:"var(--color-text-primary)" }}>{sc.want}</div>
          </div>
        </div>
        <div style={{ ...C.card, ...C.ok }}>
          <div style={{ fontSize:11, fontWeight:600, color:"#059669", marginBottom:4, textTransform:"uppercase", letterSpacing:".06em" }}>The physical insight</div>
          <div style={{ fontSize:13, lineHeight:1.65 }}>{sc.insight}</div>
        </div>
        <div style={{ ...C.card, marginTop:4 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--color-text-tertiary)", marginBottom:4, textTransform:"uppercase", letterSpacing:".06em" }}>Pattern type</div>
          <div style={{ fontSize:13, color:"var(--color-text-secondary)" }}>{sc.pattern}</div>
        </div>
        <WhyPanel why={{ tag:"Why does the plane problem use the Pythagorean theorem?", explanation:"The observer is on the ground. The plane is at altitude h. The horizontal distance is x. These three lengths form a right triangle: D² = x² + h². D is the direct-line distance from observer to plane. As the plane moves, x changes, h stays fixed, and D changes. Differentiating D² = x² + h² gives 2D·(dD/dt) = 2x·(dx/dt). So dD/dt = (x/D)·(dx/dt). When x is large, D ≈ x and dD/dt ≈ dx/dt — the distance changes at nearly the plane's speed. When x=0 (directly overhead), dD/dt = 0 — at that instant the distance is momentarily not changing.", math:"D^2 = x^2 + h^2 \\Rightarrow 2D\\frac{dD}{dt} = 2x\\frac{dx}{dt} \\Rightarrow \\frac{dD}{dt} = \\frac{x}{D}\\cdot\\frac{dx}{dt}", why:null }} depth={0} ready={ready} dark={dark}/>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 4: DECISION GUIDE — how to choose the geometric equation
// ════════════════════════════════════════════════════════════════════════════
function DecisionTab({ ready, dark }) {
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const C = makeC(dark);

  const reset = () => { setQ1(null); setQ2(null); };

  const RESULT = {
    "same-same": { eq:"V = f(r)\\text{ or }A = f(r,h)\\text{ etc.}", note:"Volume/area formula for the shape (sphere, cone, cylinder, cube). One object, multiple dimensions all changing.", examples:["Sphere: V = (4/3)πr³","Cone: V = (1/3)πr²h","Cylinder: V = πr²h"] },
    "same-diff": { eq:"V = f(r)\\text{ then eliminate via constraint}", note:"Find a constraint between the dimensions (e.g. similar triangles give r = kh). Substitute to reduce to one variable.", examples:["Conical tank with fixed r/h ratio: V = (π/3)k²h³","Cube where all sides equal: V = s³"] },
    "diff-same": { eq:"a^2 + b^2 = c^2\\text{ or trig ratio}", note:"Right triangle geometry. Use Pythagoras if you have two legs and a hypotenuse. Use sin/cos/tan if you have angles.", examples:["Ladder: x² + y² = L²","Plane: D² = x² + h²","Angle: tan(θ) = x/h"] },
    "diff-diff": { eq:"\\text{Similar triangles: }\\frac{a}{b} = \\frac{c}{d}", note:"When the geometry involves proportional lengths. Set up the ratio, cross-multiply to get a clean equation, then differentiate.", examples:["Shadow problem: H/(x+s) = h/s","Water level in similar-shaped tank"] },
  };

  const key = q1 && q2 ? `${q1}-${q2}` : null;
  const result = key ? RESULT[key] : null;

  return (
    <div>
      <div style={{ ...C.card, marginBottom:12 }}>
        <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.75 }}>
          The hardest part of related rates is often identifying which geometric equation to start with.
          Answer two questions about the problem to find the right type.
        </p>
      </div>
      <div style={{ fontSize:12, fontWeight:600, color:"var(--color-text-primary)", marginBottom:8 }}>
        Question 1: Are the two changing quantities part of the <em>same object</em> or <em>different objects/positions</em>?
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["same","Same object (radius & volume of one balloon)"],["diff","Different positions (plane & observer)"]].map(([v,l]) => (
          <button key={v} onClick={() => { setQ1(v); setQ2(null); }} style={{ flex:1, padding:"10px 12px", borderRadius:8, border:`0.5px solid ${q1===v?"#7c3aed":"var(--color-border-secondary)"}`, background:q1===v?(dark?"#1a1547":"#eef2ff"):"transparent", color:q1===v?(dark?"#c4b5fd":"#3730a3"):"var(--color-text-secondary)", fontSize:13, cursor:"pointer", textAlign:"left" }}>
            {l}
          </button>
        ))}
      </div>
      {q1 && (
        <>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--color-text-primary)", marginBottom:8 }}>
            Question 2: Does the diagram have a <em>constraint that eliminates a variable</em> (like similar triangles or a fixed ratio)?
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {[["same","No — all variables appear directly"],["diff","Yes — there's a proportional relationship or fixed ratio"]].map(([v,l]) => (
              <button key={v} onClick={() => setQ2(v)} style={{ flex:1, padding:"10px 12px", borderRadius:8, border:`0.5px solid ${q2===v?"#059669":"var(--color-border-secondary)"}`, background:q2===v?(dark?"#052e16":"#ecfdf5"):"transparent", color:q2===v?(dark?"#6ee7b7":"#065f46"):"var(--color-text-secondary)", fontSize:13, cursor:"pointer", textAlign:"left" }}>
                {l}
              </button>
            ))}
          </div>
        </>
      )}
      {result && (
        <div key={key} style={{ animation:"sd .18s ease-out" }}>
          <div style={{ ...C.card, ...C.ok, marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#059669", marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Geometric equation type</div>
            <M t={result.eq} display ready={ready}/>
            <div style={{ fontSize:13, color:"var(--color-text-secondary)", marginTop:8, lineHeight:1.6 }}>{result.note}</div>
          </div>
          <div style={{ ...C.card }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--color-text-tertiary)", marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Classic problems of this type</div>
            {result.examples.map((ex, i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:4 }}>
                <span style={{ color:"#059669", flexShrink:0 }}>▸</span>
                <span style={{ fontSize:13, color:"var(--color-text-secondary)" }}>{ex}</span>
              </div>
            ))}
          </div>
          <button onClick={reset} style={{ marginTop:4, padding:"4px 12px", borderRadius:8, border:"0.5px solid var(--color-border-secondary)", background:"transparent", color:"var(--color-text-secondary)", cursor:"pointer", fontSize:12 }}>← Start over</button>
        </div>
      )}
      <div style={{ ...C.card, ...C.purple, marginTop:12 }}>
        <div style={{ fontSize:12, fontWeight:600, color:dark?"#c4b5fd":"#534AB7", marginBottom:4 }}>Remember: the geometric equation is always a fact about the shape</div>
        <div style={{ fontSize:13, color:dark?"#a5b4fc":"#3C3489", lineHeight:1.7 }}>
          It is not derived — it is looked up. Volume of a sphere, Pythagorean theorem, similar triangle ratios.
          The calculus only starts when you differentiate that fact with respect to time.
          If you're stuck on step 1, you're stuck on geometry, not calculus.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════
export default function RelatedRatesEngine({ params = {} }) {
  const ready = useMath();
  const dark = useIsDark();
  const [tab, setTab] = useState("machine");
  const C = makeC(dark);

  const TABS = [
    ["machine",   "The machine",    "#7c3aed"],
    ["anatomy",   "Anatomy",        "#d97706"],
    ["scenarios", "Scenarios",      "#0891b2"],
    ["decision",  "Which equation?","#059669"],
  ];

  return (
    <div style={{ fontFamily:"var(--font-sans,system-ui)", padding:"4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ ...C.card, borderLeft:"3px solid #7c3aed", borderRadius:0, background:dark?"#1a1547":"#eef2ff", marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:600, color:"#7c3aed", letterSpacing:".07em", textTransform:"uppercase", marginBottom:3 }}>Related Rates — Abstract Intuition</div>
        <div style={{ fontSize:15, fontWeight:500, color:dark?"#c4b5fd":"#3730a3", marginBottom:4 }}>The Machine Behind Every Problem</div>
        <div style={{ fontSize:13, color:dark?"#a5b4fc":"#4338ca", lineHeight:1.7 }}>
          Every related rates problem is the same machine: two quantities locked by geometry, the Chain Rule connecting their speeds.
          This viz teaches the structure so you can apply it to anything — balloon, plane, ladder, shadow, cone.
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
        {TABS.map(([k,l,c]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding:"5px 13px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:tab===k?500:400, border:`0.5px solid ${tab===k?c:"var(--color-border-secondary)"}`, background:tab===k?c+"22":"transparent", color:tab===k?c:"var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>

      {tab === "machine"   && <div style={{animation:"sd .2s ease-out"}}><MachineTab  ready={ready} dark={dark}/></div>}
      {tab === "anatomy"   && <div style={{animation:"sd .2s ease-out"}}><AnatomyTab  ready={ready} dark={dark}/></div>}
      {tab === "scenarios" && <div style={{animation:"sd .2s ease-out"}}><ScenariosTab ready={ready} dark={dark}/></div>}
      {tab === "decision"  && <div style={{animation:"sd .2s ease-out"}}><DecisionTab  ready={ready} dark={dark}/></div>}
    </div>
  );
}