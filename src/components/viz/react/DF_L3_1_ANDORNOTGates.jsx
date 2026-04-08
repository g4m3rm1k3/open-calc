/**
 * DF_L3_1_ANDORNOTGates.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Digital Fundamentals — Unit 3, Lesson 1
 * "AND, OR, NOT: The Three Primitive Gates"
 *
 * What this lesson teaches:
 *   - AND, OR, NOT: the three gates from which every other gate is built
 *   - Truth tables for each gate — from first principles, not memorisation
 *   - Boolean expressions: dot (AND), plus (OR), overbar (NOT)
 *   - Reading a logic symbol and identifying inputs/outputs
 *   - Real IC packages: 7408 (quad AND), 7432 (quad OR), 7404 (hex NOT)
 *   - Pin-out diagrams and how to read them
 *   - Timing diagrams: how gate outputs respond to changing inputs
 *   - The universal NOT-AND-OR construction: any function from just these three
 *
 * Five tabs:
 *   1. The three gates — side-by-side truth tables, symbols, expressions
 *   2. Why these three — AND=intersection, OR=union, NOT=complement in set theory
 *   3. Real ICs        — 7408/7432/7404 pin-outs, package diagram
 *   4. Timing diagrams — interactive: set input waveforms, see output
 *   5. Key terms       — filterable reference
 *
 * Register: DF_L3_1: lazy(() => import('./react/DF_L3_1_ANDORNOTGates.jsx'))
 */
import { useState, useEffect, useRef, useCallback } from "react";

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

const card = { background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md,8px)", padding:"12px 14px", border:"0.5px solid var(--color-border-tertiary)", marginBottom:8 };
const ok   = { borderLeft:"3px solid #059669", borderRadius:0, background:"var(--color-background-success,#ecfdf5)" };
const warn = { borderLeft:"3px solid #d97706", borderRadius:0, background:"var(--color-background-warning,#fffbeb)" };
const info = { borderLeft:"3px solid #0891b2", borderRadius:0, background:"#ecfeff" };
const purp = { borderLeft:"3px solid #7c3aed", borderRadius:0, background:"#eef2ff" };

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = [
    { border:"#6366f1", bg:"#eef2ff" },
    { border:"#0891b2", bg:"#ecfeff" },
    { border:"#059669", bg:"#ecfdf5" },
  ][Math.min(depth, 2)];
  const lbl = why.tag || ["Why?","But why?","Prove it"][Math.min(depth, 2)];
  return (
    <div style={{ marginLeft:depth*14, marginTop:8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display:"inline-flex",alignItems:"center",gap:6,background:open?d.bg:"transparent",border:`1px solid ${d.border}`,borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:500,color:d.border,cursor:"pointer" }}>
        <span style={{ width:14,height:14,borderRadius:"50%",background:d.border,color:"#fff",fontSize:9,fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center" }}>{open?"−":"?"}</span>
        {open?"Close":lbl}
      </button>
      {open && (
        <div style={{ marginTop:6,padding:"12px 14px",background:"var(--color-background-secondary)",borderLeft:`3px solid ${d.border}`,borderRadius:"0 8px 8px 0",animation:"sd .16s ease-out" }}>
          <p style={{ fontSize:13,lineHeight:1.75,color:"var(--color-text-primary)" }}>{why.explanation}</p>
          {why.math && <div style={{ background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:6,padding:"10px",textAlign:"center",overflowX:"auto",marginTop:8 }}><M t={why.math} display ready={ready}/></div>}
          {why.why && <WhyPanel why={why.why} depth={depth+1} ready={ready}/>}
        </div>
      )}
    </div>
  );
}

function isDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme:dark)").matches;
}

// ── SVG gate symbol drawing on canvas ─────────────────────────────────────────
function drawGate(ctx, type, x, y, w, h, col, active) {
  const mx = x + w/2, my = y + h/2;
  const fill   = active ? col+"33" : (isDark()?"#1e293b":"#f8fafc");
  const stroke = active ? col : (isDark()?"#475569":"#94a3b8");

  ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = active ? 2 : 1.5;

  if (type === "NOT") {
    ctx.beginPath();
    ctx.moveTo(x+4, y+4); ctx.lineTo(x+w-14, my); ctx.lineTo(x+4, y+h-4); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+w-10, my, 5, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, my); ctx.lineTo(x+4, my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+w-5, my); ctx.lineTo(x+w, my); ctx.stroke();
  } else if (type === "AND") {
    ctx.beginPath();
    ctx.moveTo(x+4, y+4); ctx.lineTo(mx-4, y+4);
    ctx.arc(mx-4, my, h/2-4, -Math.PI/2, Math.PI/2);
    ctx.lineTo(x+4, y+h-4); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
    const iy1 = y+h*0.3, iy2 = y+h*0.7;
    ctx.beginPath(); ctx.moveTo(x, iy1); ctx.lineTo(x+6, iy1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, iy2); ctx.lineTo(x+6, iy2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+w-4, my); ctx.lineTo(x+w, my); ctx.stroke();
  } else if (type === "OR") {
    ctx.beginPath();
    ctx.moveTo(x+4, y+4);
    ctx.quadraticCurveTo(mx-10, my, x+4, y+h-4);
    ctx.quadraticCurveTo(mx, y+h, x+w-14, my);
    ctx.quadraticCurveTo(mx, y, x+4, y+4);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
    const iy1 = y+h*0.3, iy2 = y+h*0.7;
    ctx.beginPath(); ctx.moveTo(x, iy1); ctx.lineTo(x+12, iy1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, iy2); ctx.lineTo(x+12, iy2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+w-4, my); ctx.lineTo(x+w, my); ctx.stroke();
  }
}

// ════════════════════════════════════════════════════════════════════════
// TAB 1: THE THREE GATES
// ════════════════════════════════════════════════════════════════════════
const GATES_DEF = {
  AND: {
    name:"AND", color:"#0891b2",
    expr:"F = A \\cdot B",
    mnemonic:"ALL inputs must be HIGH",
    description:"The AND gate outputs 1 only when every input is 1. One LOW input forces the output LOW, regardless of all others. It models logical conjunction: 'A is true AND B is true.'",
    physics:"In CMOS: two NMOS transistors in series (pull-down). Both must be ON for current to flow to GND. Equivalently: two PMOS in parallel (pull-up), either OFF disconnects VDD.",
    rows:[[0,0,0],[0,1,0],[1,0,0],[1,1,1]],
    cols:["A","B","A·B"],
    practical:"Door alarm: armed AND door open → alarm. Safety interlock: button AND sensor → machine runs.",
  },
  OR: {
    name:"OR", color:"#7c3aed",
    expr:"F = A + B",
    mnemonic:"ANY input being HIGH is enough",
    description:"The OR gate outputs 1 when at least one input is 1. All inputs must be LOW to force the output LOW. It models logical disjunction: 'A is true OR B is true (or both).'",
    physics:"In CMOS: two NMOS in parallel (pull-down). Either ON pulls output to GND. Two PMOS in series (pull-up): both must be ON to connect VDD.",
    rows:[[0,0,0],[0,1,1],[1,0,1],[1,1,1]],
    cols:["A","B","A+B"],
    practical:"Burglar alarm: window open OR door open → alarm. Error flag: overflow OR underflow → exception.",
  },
  NOT: {
    name:"NOT", color:"#059669",
    expr:"F = \\bar{A}",
    mnemonic:"Output is the opposite of input",
    description:"The NOT gate (inverter) has one input and outputs its complement. HIGH becomes LOW, LOW becomes HIGH. It is the most fundamental gate — every other gate contains at least one inverter.",
    physics:"In CMOS: one PMOS + one NMOS. When input is HIGH, NMOS conducts (pulls output LOW) and PMOS is off. When input is LOW, PMOS conducts (pulls output HIGH) and NMOS is off.",
    rows:[[0,1],[1,0]],
    cols:["A","Ā"],
    practical:"Enable logic inversion: active-LOW signals. Complement generation for subtractors. Edge detection circuits.",
  },
};

function ThreeGatesTab({ ready }) {
  const [selected, setSelected] = useState("AND");
  const [inputs, setInputs]     = useState({ A:false, B:false });
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);

  const g = GATES_DEF[selected];
  const outVal = selected==="AND" ? (inputs.A && inputs.B)
               : selected==="OR"  ? (inputs.A || inputs.B)
               :                    !inputs.A;

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c || !wrapRef.current) return;
    c.width = wrapRef.current.clientWidth; c.height = 140;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    const dark = isDark();
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = dark?"#0c1220":"#f8fafc";
    ctx.roundRect(0,0,W,H,8); ctx.fill();

    const gw=90, gh=80, gx=W/2-gw/2, gy=H/2-gh/2;
    const colA = inputs.A ? (dark?"#34d399":"#059669") : (dark?"#475569":"#94a3b8");
    const colB = inputs.B ? (dark?"#34d399":"#059669") : (dark?"#475569":"#94a3b8");
    const colOut = outVal ? (dark?"#34d399":"#059669") : (dark?"#475569":"#94a3b8");
    const ww = (v) => v ? 2.5 : 1.5;

    if (selected === "NOT") {
      ctx.strokeStyle = colA; ctx.lineWidth = ww(inputs.A);
      ctx.beginPath(); ctx.moveTo(20, H/2); ctx.lineTo(gx, H/2); ctx.stroke();
      ctx.fillStyle = colA; ctx.font="500 12px system-ui"; ctx.textAlign="center";
      ctx.fillText("A="+(inputs.A?1:0), 14, H/2-10);
    } else {
      const iy1 = gy+gh*0.3, iy2 = gy+gh*0.7;
      ctx.strokeStyle = colA; ctx.lineWidth = ww(inputs.A);
      ctx.beginPath(); ctx.moveTo(20, iy1); ctx.lineTo(gx, iy1); ctx.stroke();
      ctx.strokeStyle = colB; ctx.lineWidth = ww(inputs.B);
      ctx.beginPath(); ctx.moveTo(20, iy2); ctx.lineTo(gx, iy2); ctx.stroke();
      ctx.fillStyle = colA; ctx.font="500 12px system-ui"; ctx.textAlign="center";
      ctx.fillText("A="+(inputs.A?1:0), 14, iy1-10);
      ctx.fillStyle = colB;
      ctx.fillText("B="+(inputs.B?1:0), 14, iy2-10);
    }

    drawGate(ctx, selected, gx, gy, gw, gh, g.color, outVal);

    ctx.strokeStyle = colOut; ctx.lineWidth = ww(outVal);
    ctx.beginPath(); ctx.moveTo(gx+gw, H/2); ctx.lineTo(W-20, H/2); ctx.stroke();
    ctx.fillStyle = colOut; ctx.font="500 12px system-ui"; ctx.textAlign="center";
    ctx.fillText("F="+(outVal?1:0), W-14, H/2-10);
  }, [selected, inputs, outVal, g.color]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    const ro = new ResizeObserver(() => { if (canvasRef.current && wrapRef.current) { canvasRef.current.width = wrapRef.current.clientWidth; draw(); } });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div>
      {/* Gate selector */}
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {["AND","OR","NOT"].map(gt => (
          <button key={gt} onClick={() => { setSelected(gt); setInputs({A:false,B:false}); }}
            style={{ flex:1, padding:"8px", borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:selected===gt?600:400, border:`1.5px solid ${selected===gt?GATES_DEF[gt].color:"var(--color-border-secondary)"}`, background:selected===gt?GATES_DEF[gt].color+"18":"transparent", color:selected===gt?GATES_DEF[gt].color:"var(--color-text-secondary)" }}>
            {gt}
          </button>
        ))}
      </div>

      {/* Interactive symbol */}
      <div style={{ marginBottom:10 }}>
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          {(selected==="NOT" ? [["A",inputs.A,"A"]] : [["A",inputs.A,"A"],["B",inputs.B,"B"]]).map(([lbl,val,key]) => (
            <button key={key} onClick={() => setInputs(p => ({...p, [key]:!p[key]}))}
              style={{ padding:"6px 18px", borderRadius:8, border:`1.5px solid ${val?"#059669":"#ef4444"}`, background:val?"var(--color-background-success)":"var(--color-background-danger)", color:val?"var(--color-text-success)":"var(--color-text-danger)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {lbl} = {val?1:0}
            </button>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
            <span style={{ fontSize:12, color:"var(--color-text-secondary)" }}>F =</span>
            <div style={{ padding:"6px 18px", borderRadius:8, border:`1.5px solid ${outVal?"#059669":"#ef4444"}`, background:outVal?"var(--color-background-success)":"var(--color-background-danger)", color:outVal?"var(--color-text-success)":"var(--color-text-danger)", fontSize:16, fontWeight:700 }}>{outVal?1:0}</div>
          </div>
        </div>
        <div ref={wrapRef}>
          <canvas ref={canvasRef} style={{ width:"100%", display:"block", borderRadius:8 }}/>
        </div>
      </div>

      {/* Gate detail */}
      <div style={{ ...card, borderLeft:`3px solid ${g.color}`, borderRadius:0, background:g.color+"0f", marginBottom:10 }}>
        <div style={{ display:"flex", gap:12, alignItems:"baseline", marginBottom:6, flexWrap:"wrap" }}>
          <div style={{ fontSize:15, fontWeight:500, color:g.color }}>{g.name} gate</div>
          <div style={{ fontSize:12, color:g.color, fontStyle:"italic" }}>{g.mnemonic}</div>
        </div>
        <div style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.75, marginBottom:8 }}>{g.description}</div>
        <div style={{ marginBottom:6 }}><M t={`F = ${g.expr.replace("F = ","")}`} ready={ready}/></div>
        <div style={{ fontSize:12, color:"var(--color-text-tertiary)", lineHeight:1.5 }}><strong>Real use:</strong> {g.practical}</div>
      </div>

      {/* Truth table */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <div style={{ ...card, background:"var(--color-background-primary)" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--color-text-tertiary)", marginBottom:8, textTransform:"uppercase", letterSpacing:".06em" }}>Truth table</div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
                {g.cols.map(h => <th key={h} style={{ padding:"4px 10px", textAlign:"center", color:"var(--color-text-tertiary)", fontWeight:500 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {g.rows.map((row,i) => {
                const isActive = selected==="NOT"
                  ? row[0]===(inputs.A?1:0)
                  : row[0]===(inputs.A?1:0) && row[1]===(inputs.B?1:0);
                return (
                  <tr key={i} style={{ background:isActive?g.color+"18":"transparent", borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
                    {row.map((v,j) => (
                      <td key={j} style={{ padding:"5px 10px", textAlign:"center", fontWeight:isActive?600:400, color:j===row.length-1?(v?"#059669":"#ef4444"):"var(--color-text-primary)" }}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ ...card, background:"var(--color-background-primary)" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--color-text-tertiary)", marginBottom:8, textTransform:"uppercase", letterSpacing:".06em" }}>CMOS structure</div>
          <div style={{ fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.7 }}>{g.physics}</div>
        </div>
      </div>

      <WhyPanel why={{
        tag:"Can every logic function be built from AND, OR, and NOT?",
        explanation:"Yes — this is called functional completeness. Any truth table can be expressed as a Sum of Products (SOP): for each row where the output is 1, write an AND term covering that row's input combination, then OR all those terms together. NOT is needed to invert individual inputs. This is the proof that AND+OR+NOT is functionally complete. In practice we rarely use SOP directly — Boolean algebra and K-maps (Unit 4) find simpler implementations. But the theoretical completeness guarantees any function is implementable.",
        math:"F = \\bar{A}B + A\\bar{B}B + AB \\quad \\text{(any function as SOP of AND, OR, NOT terms)}",
        why: null,
      }} depth={0} ready={ready}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 2: WHY THESE THREE
// ════════════════════════════════════════════════════════════════════════
function WhyThreeTab({ ready }) {
  const [setA, setSetA] = useState(new Set([1,2,3,4,5]));
  const [setB, setSetB] = useState(new Set([3,4,5,6,7]));
  const universe = [1,2,3,4,5,6,7,8];

  const inA = (x) => setA.has(x);
  const inB = (x) => setB.has(x);

  const toggleA = (x) => { const n = new Set(setA); n.has(x)?n.delete(x):n.add(x); setSetA(n); };
  const toggleB = (x) => { const n = new Set(setB); n.has(x)?n.delete(x):n.add(x); setSetB(n); };

  const intersection = universe.filter(x => inA(x) && inB(x));
  const union        = universe.filter(x => inA(x) || inB(x));
  const complementA  = universe.filter(x => !inA(x));

  const OPERATIONS = [
    { op:"AND = A ∩ B", desc:"Intersection — elements in BOTH sets", result:intersection, color:"#0891b2", expr:"A \\cdot B" },
    { op:"OR  = A ∪ B", desc:"Union — elements in EITHER set",         result:union,         color:"#7c3aed", expr:"A + B"   },
    { op:"NOT = Ā",      desc:"Complement — elements NOT in set A",      result:complementA,  color:"#059669", expr:"\\bar{A}" },
  ];

  return (
    <div>
      <div style={{ ...card, marginBottom:12 }}>
        <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.75 }}>
          AND, OR, and NOT aren't arbitrary choices — they are the three fundamental operations of <strong style={{color:"var(--color-text-primary)"}}>Boolean algebra</strong>, which George Boole developed in 1847 to describe set theory and logic.
          The connection is exact: AND is set intersection, OR is set union, NOT is set complement.
          Toggle elements below to see how the set operations map directly to gate behaviour.
        </p>
      </div>

      {/* Set element toggles */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
        {[["Set A", setA, toggleA, "#0891b2"], ["Set B", setB, toggleB, "#7c3aed"]].map(([lbl, s, toggle, col]) => (
          <div key={lbl} style={{ ...card, background:"var(--color-background-primary)" }}>
            <div style={{ fontSize:12, fontWeight:600, color:col, marginBottom:8 }}>{lbl}</div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {universe.map(x => (
                <button key={x} onClick={() => toggle(x)}
                  style={{ width:32, height:32, borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer", border:`1.5px solid ${s.has(x)?col:"var(--color-border-secondary)"}`, background:s.has(x)?col+"22":"var(--color-background-secondary)", color:s.has(x)?col:"var(--color-text-tertiary)" }}>
                  {x}
                </button>
              ))}
            </div>
            <div style={{ fontSize:11, color:col, marginTop:6 }}>{"{"}{[...s].sort((a,b)=>a-b).join(", ")}{"}"}</div>
          </div>
        ))}
      </div>

      {/* Operations */}
      {OPERATIONS.map(op => (
        <div key={op.op} style={{ ...card, borderLeft:`3px solid ${op.color}`, borderRadius:0, background:op.color+"0f", marginBottom:8 }}>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
            <div style={{ fontSize:13, fontWeight:600, color:op.color, fontFamily:"var(--font-mono,monospace)" }}>{op.op}</div>
            <div style={{ fontSize:12, color:"var(--color-text-secondary)" }}>{op.desc}</div>
            <div style={{ marginLeft:"auto" }}><M t={`F = ${op.expr}`} ready={ready}/></div>
          </div>
          <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
            {universe.map(x => {
              const inResult = op.result.includes(x);
              return (
                <div key={x} style={{ width:30, height:30, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, border:`1px solid ${inResult?op.color:"var(--color-border-tertiary)"}`, background:inResult?op.color+"22":"transparent", color:inResult?op.color:"var(--color-text-tertiary)" }}>
                  {x}
                </div>
              );
            })}
            <div style={{ fontSize:12, color:op.color, alignSelf:"center", marginLeft:8 }}>
              = {"{"}{op.result.sort((a,b)=>a-b).join(", ")}{"}"}            </div>
          </div>
        </div>
      ))}

      {/* Truth table analogy */}
      <div style={{ ...card, ...purp, marginTop:4 }}>
        <div style={{ fontSize:12, fontWeight:600, color:"#7c3aed", marginBottom:6 }}>The complete equivalence</div>
        <div style={{ fontSize:13, color:"#3730a3", lineHeight:1.75 }}>
          In a truth table, 1 means "this input condition is true" — it's equivalent to "this element is in the set." The gate output tells you whether the resulting condition is in the result set. AND: is x in both A and B? OR: is x in either A or B? NOT: is x absent from A?
        </div>
      </div>

      <WhyPanel why={{
        tag:"What is Boolean algebra and who invented it?",
        explanation:"George Boole (1815–1864) published 'The Laws of Thought' in 1854, creating an algebra where variables can only be 0 or 1 and the operations are AND (·), OR (+), and NOT (overbar). In 1937, Claude Shannon demonstrated that Boole's algebra could be implemented with electrical switches, founding modern digital design. Shannon's master's thesis is often called the most important master's thesis of the 20th century. The three gate types in this lesson are Boole's three operations made physical.",
        why: null,
      }} depth={0} ready={ready}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 3: REAL ICs — 7408, 7432, 7404
// ════════════════════════════════════════════════════════════════════════
function RealICsTab({ ready }) {
  const [selIC, setSelIC] = useState("7408");

  const ICS = {
    "7408": {
      name:"SN7408 — Quad 2-input AND",
      gates:4, inputs:2,
      color:"#0891b2",
      gateType:"AND",
      description:"Contains 4 independent 2-input AND gates in a 14-pin DIP package. TTL technology. Power supply: 5V (pins 14+, 7−). Each gate is electrically isolated from the others.",
      pins:[
        {n:1,label:"1A",type:"in"},{n:2,label:"1B",type:"in"},{n:3,label:"1Y",type:"out"},
        {n:4,label:"2A",type:"in"},{n:5,label:"2B",type:"in"},{n:6,label:"2Y",type:"out"},
        {n:7,label:"GND",type:"pwr"},
        {n:8,label:"3Y",type:"out"},{n:9,label:"3A",type:"in"},{n:10,label:"3B",type:"in"},
        {n:11,label:"4Y",type:"out"},{n:12,label:"4A",type:"in"},{n:13,label:"4B",type:"in"},
        {n:14,label:"VCC",type:"pwr"},
      ],
      partNumbers:["SN7408N (TI)","74LS08 (low-power Schottky)","74HC08 (CMOS logic levels)","74AHC08 (fast CMOS)"],
    },
    "7432": {
      name:"SN7432 — Quad 2-input OR",
      gates:4, inputs:2,
      color:"#7c3aed",
      gateType:"OR",
      description:"Contains 4 independent 2-input OR gates in a 14-pin DIP package. Pin-compatible with 7408 — same power pins, same layout, only the gate function differs.",
      pins:[
        {n:1,label:"1A",type:"in"},{n:2,label:"1B",type:"in"},{n:3,label:"1Y",type:"out"},
        {n:4,label:"2A",type:"in"},{n:5,label:"2B",type:"in"},{n:6,label:"2Y",type:"out"},
        {n:7,label:"GND",type:"pwr"},
        {n:8,label:"3Y",type:"out"},{n:9,label:"3A",type:"in"},{n:10,label:"3B",type:"in"},
        {n:11,label:"4Y",type:"out"},{n:12,label:"4A",type:"in"},{n:13,label:"4B",type:"in"},
        {n:14,label:"VCC",type:"pwr"},
      ],
      partNumbers:["SN7432N (TI)","74LS32 (low-power Schottky)","74HC32 (CMOS)","74AHC32 (fast CMOS)"],
    },
    "7404": {
      name:"SN7404 — Hex Inverter (NOT)",
      gates:6, inputs:1,
      color:"#059669",
      gateType:"NOT",
      description:"Contains 6 independent single-input NOT gates (inverters) in a 14-pin DIP. Six gates fit in 14 pins because each needs only 1 input + 1 output (vs 3 pins for 2-input gates).",
      pins:[
        {n:1,label:"1A",type:"in"},{n:2,label:"1Y",type:"out"},
        {n:3,label:"2A",type:"in"},{n:4,label:"2Y",type:"out"},
        {n:5,label:"3A",type:"in"},{n:6,label:"3Y",type:"out"},
        {n:7,label:"GND",type:"pwr"},
        {n:8,label:"4Y",type:"out"},{n:9,label:"4A",type:"in"},
        {n:10,label:"5Y",type:"out"},{n:11,label:"5A",type:"in"},
        {n:12,label:"6Y",type:"out"},{n:13,label:"6A",type:"in"},
        {n:14,label:"VCC",type:"pwr"},
      ],
      partNumbers:["SN7404N (TI)","74LS04 (low-power Schottky)","74HC04 (CMOS)","74AHC04 (fast CMOS)"],
    },
  };

  const ic = ICS[selIC];
  const pinColor = (type) => type==="in"?"#0891b2":type==="out"?"#059669":"#d97706";

  // 14-pin DIP diagram
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c || !wrapRef.current) return;
    c.width = wrapRef.current.clientWidth; c.height = 220;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    const dark = isDark();
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = dark?"#0c1220":"#f8fafc"; ctx.roundRect(0,0,W,H,8); ctx.fill();

    const pkgW = W*0.45, pkgH = H*0.75;
    const pkgX = W/2 - pkgW/2, pkgY = H/2 - pkgH/2;

    // Package body
    ctx.fillStyle = dark?"#1e293b":"#e2e8f0";
    ctx.roundRect(pkgX, pkgY, pkgW, pkgH, 6); ctx.fill();
    ctx.strokeStyle = dark?"#475569":"#94a3b8"; ctx.lineWidth=1.5; ctx.stroke();

    // Notch (top centre)
    ctx.fillStyle = dark?"#0c1220":"#f8fafc";
    ctx.beginPath(); ctx.arc(W/2, pkgY, 10, 0, Math.PI); ctx.fill();

    // IC name label
    ctx.fillStyle = dark?"#94a3b8":"#64748b"; ctx.font="500 11px system-ui"; ctx.textAlign="center";
    ctx.fillText(selIC, W/2, pkgY + pkgH/2 - 6);
    ctx.font="9px system-ui";
    ctx.fillText(`${ic.gates}× ${ic.gateType}`, W/2, pkgY + pkgH/2 + 8);

    // Pins — 7 on each side
    const pinSpacing = pkgH / 8;
    const leftPins  = ic.pins.slice(0, 7);   // pins 1-7 left side top to bottom
    const rightPins = ic.pins.slice(7, 14).reverse(); // pins 8-14 right side bottom to top

    const drawPin = (pin, x, y, side) => {
      const col = pinColor(pin.type);
      const lineX2 = side==="left" ? pkgX : pkgX+pkgW;
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lineX2, y); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 4, 0, 2*Math.PI);
      ctx.fillStyle = col; ctx.fill();
      ctx.fillStyle = col; ctx.font="500 10px system-ui";
      ctx.textAlign = side==="left"?"right":"left";
      ctx.fillText(`${pin.n}: ${pin.label}`, side==="left"?x-8:x+8, y+4);
    };

    leftPins.forEach((pin, i) => drawPin(pin, pkgX-18, pkgY+pinSpacing*(i+0.5)+5, "left"));
    rightPins.forEach((pin, i) => drawPin(pin, pkgX+pkgW+18, pkgY+pinSpacing*(6-i+0.5)+5, "right"));

    // Pin 1 marker (dot)
    ctx.beginPath(); ctx.arc(pkgX+8, pkgY+8, 3, 0, 2*Math.PI);
    ctx.fillStyle = dark?"#94a3b8":"#64748b"; ctx.fill();

  }, [selIC, ic]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    const ro = new ResizeObserver(() => { if (canvasRef.current && wrapRef.current) { canvasRef.current.width = wrapRef.current.clientWidth; draw(); } });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div>
      <div style={{ ...card, marginBottom:12 }}>
        <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.75 }}>
          These three ICs are the workhorses of educational and hobbyist electronics. They are available in DIP (Dual Inline Package) form for breadboard use and have been manufactured continuously since the 1960s. Understanding pin-outs is how you go from a schematic to a working circuit.
        </p>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {Object.keys(ICS).map(k => (
          <button key={k} onClick={() => setSelIC(k)} style={{ flex:1, padding:"7px", borderRadius:8, fontSize:12, cursor:"pointer", fontWeight:selIC===k?600:400, border:`0.5px solid ${selIC===k?ICS[k].color:"var(--color-border-secondary)"}`, background:selIC===k?ICS[k].color+"18":"transparent", color:selIC===k?ICS[k].color:"var(--color-text-secondary)" }}>
            {k} ({ICS[k].gateType})
          </button>
        ))}
      </div>

      <div style={{ ...card, borderLeft:`3px solid ${ic.color}`, borderRadius:0, background:ic.color+"0f", marginBottom:10 }}>
        <div style={{ fontSize:14, fontWeight:500, color:ic.color, marginBottom:4 }}>{ic.name}</div>
        <div style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.7 }}>{ic.description}</div>
      </div>

      <div ref={wrapRef}>
        <canvas ref={canvasRef} style={{ width:"100%", display:"block", borderRadius:8, marginBottom:10 }}/>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:12, marginBottom:10, flexWrap:"wrap" }}>
        {[["Input",pinColor("in")],["Output",pinColor("out")],["Power/GND",pinColor("pwr")]].map(([lbl,col]) => (
          <div key={lbl} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:col }}/>
            <span style={{ fontSize:12, color:"var(--color-text-secondary)" }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* Part number variants */}
      <div style={{ ...card, background:"var(--color-background-primary)" }}>
        <div style={{ fontSize:11, fontWeight:600, color:"var(--color-text-tertiary)", marginBottom:8, textTransform:"uppercase", letterSpacing:".06em" }}>Common variants</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {ic.partNumbers.map(p => (
            <div key={p} style={{ fontFamily:"var(--font-mono,monospace)", fontSize:12, padding:"3px 10px", borderRadius:8, background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-secondary)", color:"var(--color-text-secondary)" }}>{p}</div>
          ))}
        </div>
        <div style={{ fontSize:12, color:"var(--color-text-tertiary)", marginTop:8, lineHeight:1.6 }}>
          The 74xx family prefix indicates the technology subfamily. Original 7400 series: 5V TTL. 74LS: low-power Schottky TTL. 74HC/HCT: CMOS speed + TTL inputs. 74AHC: advanced high-speed CMOS. All are pin-compatible — substitute freely.
        </div>
      </div>

      <WhyPanel why={{
        tag:"How do you read a 14-pin DIP in practice?",
        explanation:"Hold the chip with the notch (or dot) at the top-left. Pin 1 is the first pin on the left side, below the notch. Pins count down the left side (1–7), then continue up the right side (8–14). So pin 7 = GND (bottom-left), pin 14 = VCC (top-right). On a breadboard, straddle the centre gap so both sides of the chip connect to separate rows. Always connect VCC and GND before connecting signal pins.",
        why: null,
      }} depth={0} ready={ready}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 4: TIMING DIAGRAMS
// ════════════════════════════════════════════════════════════════════════
const N_SLOTS = 16;

function TimingTab({ ready }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const [gateType, setGateType] = useState("AND");
  const [cursor, setCursor]     = useState(8);
  // Editable waveform slots
  const [wA, setWA] = useState([0,0,0,0,1,1,1,1,0,0,1,1,0,0,1,1]);
  const [wB, setWB] = useState([0,0,1,1,0,0,1,1,0,0,0,0,1,1,1,1]);

  const computeOut = (a, b) => {
    if (gateType==="AND") return a&&b?1:0;
    if (gateType==="OR")  return a||b?1:0;
    return a?0:1; // NOT — uses only A
  };
  const wOut = wA.map((a,i) => computeOut(a===1, wB[i]===1));

  const SIGNALS = [
    { label:"A", vals:wA, color:"#0891b2", editable:true, setW:setWA },
    ...(gateType!=="NOT" ? [{ label:"B", vals:wB, color:"#7c3aed", editable:true, setW:setWB }] : []),
    { label:"OUT", vals:wOut, color:"#059669", editable:false },
  ];
  const SIG_H = 52;
  const PAD   = { l:44, r:12, t:10, b:24 };

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c || !wrapRef.current) return;
    const totalH = SIGNALS.length * SIG_H + PAD.t + PAD.b;
    c.width = wrapRef.current.clientWidth; c.height = totalH;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    const dark = isDark();
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = dark?"#0c1220":"#f8fafc"; ctx.roundRect(0,0,W,H,8); ctx.fill();

    const iW = W - PAD.l - PAD.r;
    const slotW = iW / N_SLOTS;

    // Cursor column
    ctx.fillStyle = dark?"rgba(251,191,36,0.1)":"rgba(217,119,6,0.06)";
    ctx.fillRect(PAD.l + cursor*slotW, PAD.t, slotW, H - PAD.t - PAD.b);

    // Time grid
    ctx.strokeStyle = dark?"#1e293b":"#f1f5f9"; ctx.lineWidth=0.5;
    for(let i=0;i<=N_SLOTS;i++){ ctx.beginPath(); ctx.moveTo(PAD.l+i*slotW, PAD.t); ctx.lineTo(PAD.l+i*slotW, H-PAD.b); ctx.stroke(); }

    // Signals
    SIGNALS.forEach((sig,si) => {
      const yBase = PAD.t + si*SIG_H;
      const yH = yBase + 6, yL = yBase + SIG_H - 10;

      // Separator
      ctx.strokeStyle = dark?"#1e293b":"#f1f5f9"; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(0, yBase+SIG_H-1); ctx.lineTo(W, yBase+SIG_H-1); ctx.stroke();

      // Label
      ctx.fillStyle = sig.color; ctx.font="500 12px system-ui"; ctx.textAlign="right";
      ctx.fillText(sig.label, PAD.l-4, (yH+yL)/2+4);

      // Waveform
      ctx.strokeStyle = sig.color; ctx.lineWidth = 2;
      ctx.beginPath();
      let prevY = sig.vals[0]?yH:yL;
      ctx.moveTo(PAD.l, prevY);
      for(let i=0;i<N_SLOTS;i++){
        const x = PAD.l+i*slotW;
        const nx = x+slotW;
        const y = sig.vals[i]?yH:yL;
        if(y!==prevY){ ctx.lineTo(x, prevY); ctx.lineTo(x, y); }
        ctx.lineTo(nx, y);
        prevY = y;
      }
      ctx.stroke();

      // Cursor value
      const cv = sig.vals[cursor];
      ctx.fillStyle = sig.color; ctx.font="500 11px system-ui"; ctx.textAlign="center";
      ctx.fillText(cv.toString(), PAD.l+cursor*slotW+slotW/2, cv?yH-2:yL+12);
    });

    // Time axis
    ctx.strokeStyle = dark?"#334155":"#e2e8f0"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(PAD.l, H-PAD.b); ctx.lineTo(W-PAD.r, H-PAD.b); ctx.stroke();
    for(let i=0;i<=N_SLOTS;i+=4){
      ctx.fillStyle = dark?"#475569":"#94a3b8"; ctx.font="9px system-ui"; ctx.textAlign="center";
      ctx.fillText(`t${i}`, PAD.l+i*slotW, H-PAD.b+12);
    }

    // Cursor line
    ctx.strokeStyle = dark?"#fbbf24":"#d97706"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(PAD.l+cursor*slotW, PAD.t); ctx.lineTo(PAD.l+cursor*slotW, H-PAD.b); ctx.stroke();
  }, [SIGNALS, cursor, gateType]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    const ro = new ResizeObserver(() => { if (canvasRef.current && wrapRef.current) { canvasRef.current.width = wrapRef.current.clientWidth; draw(); } });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [draw]);

  const handleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const iW = canvasRef.current.width - PAD.l - PAD.r;
    const slotW = iW / N_SLOTS;
    const slot = Math.floor((mx - PAD.l) / slotW);
    if (slot < 0 || slot >= N_SLOTS) return;

    // Determine which signal row was clicked
    const my = e.clientY - rect.top - PAD.t;
    const sigIdx = Math.floor(my / SIG_H);

    if (sigIdx >= 0 && sigIdx < SIGNALS.length && SIGNALS[sigIdx].editable) {
      const sig = SIGNALS[sigIdx];
      const newW = [...sig.vals];
      newW[slot] = newW[slot] ? 0 : 1;
      sig.setW(newW);
    }
    setCursor(slot);
  }, [SIGNALS]);

  // Cursor values readout
  const cursorVals = SIGNALS.map(s => ({ label:s.label, val:s.vals[cursor], color:s.color }));

  return (
    <div>
      <div style={{ ...card, marginBottom:12 }}>
        <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.75 }}>
          A timing diagram shows how gate outputs respond to changing inputs over time. Click the A or B rows to toggle any time slot. Click anywhere to move the cursor and read all values at that instant. The OUT row updates automatically.
        </p>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {["AND","OR","NOT"].map(gt => (
          <button key={gt} onClick={() => setGateType(gt)} style={{ flex:1, padding:"6px", borderRadius:8, fontSize:12, cursor:"pointer", fontWeight:gateType===gt?600:400, border:`0.5px solid ${gateType===gt?"#0891b2":"var(--color-border-secondary)"}`, background:gateType===gt?"#ecfeff":"transparent", color:gateType===gt?"#0e7490":"var(--color-text-secondary)" }}>{gt}</button>
        ))}
      </div>

      <div ref={wrapRef} onClick={handleClick} style={{ cursor:"crosshair" }}>
        <canvas ref={canvasRef} style={{ width:"100%", display:"block", borderRadius:8, marginBottom:8 }}/>
      </div>

      {/* Cursor readout */}
      <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
        <span style={{ fontSize:11, color:"var(--color-text-tertiary)", alignSelf:"center" }}>At t{cursor}:</span>
        {cursorVals.map(({ label, val, color }) => (
          <div key={label} style={{ padding:"3px 10px", borderRadius:10, fontSize:12, fontWeight:500, border:`1px solid ${val?"#059669":"var(--color-border-tertiary)"}`, background:val?"var(--color-background-success)":"var(--color-background-secondary)", color:val?"var(--color-text-success)":"var(--color-text-secondary)" }}>
            {label} = {val}
          </div>
        ))}
      </div>

      {/* Preset patterns */}
      <div style={{ fontSize:11, color:"var(--color-text-tertiary)", marginBottom:6 }}>Preset input patterns:</div>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        {[
          ["Clock-like A", [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], null],
          ["A high half",  [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1], null],
          ["Reset B",      null, [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
          ["Clock-like B", null, [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1]],
        ].map(([lbl, pa, pb]) => (
          <button key={lbl} onClick={() => { if(pa) setWA(pa); if(pb) setWB(pb); }}
            style={{ padding:"3px 10px", borderRadius:10, fontSize:11, cursor:"pointer", border:"0.5px solid var(--color-border-secondary)", background:"transparent", color:"var(--color-text-secondary)" }}>
            {lbl}
          </button>
        ))}
      </div>

      <WhyPanel why={{
        tag:"How does a timing diagram relate to a truth table?",
        explanation:"They are the same information presented differently. A truth table lists all possible input combinations statically. A timing diagram shows the output as inputs change over time — but at any single instant, the timing diagram is just evaluating one row of the truth table. Move the cursor to any time slot where A=1 and B=1, and you'll see OUT=1 (for AND). The timing diagram is the truth table unrolled across time, which is why it's the tool for debugging: you can see not just what the output is, but when it changes in relation to the inputs.",
        why: null,
      }} depth={0} ready={ready}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 5: KEY TERMS
// ════════════════════════════════════════════════════════════════════════
const TERMS = [
  { term:"AND gate",          def:"Output is 1 only when ALL inputs are 1. Boolean expression: F = A·B. Symbol: D-shape with flat left side." },
  { term:"OR gate",           def:"Output is 1 when ANY input is 1. Boolean expression: F = A+B. Symbol: curved shield shape." },
  { term:"NOT gate (inverter)",def:"Single input; output is the complement. F = Ā. Symbol: triangle with a bubble at the output." },
  { term:"Boolean algebra",   def:"The algebra of 0s and 1s, with operations AND (·), OR (+), and NOT (overbar). Invented by George Boole in 1854." },
  { term:"Truth table",       def:"A complete listing of all input combinations and their corresponding output. A 2-input gate has 4 rows (2² = 4)." },
  { term:"Boolean expression",def:"An algebraic formula describing a logic function. Example: F = A·B + Ā·C. The expression uniquely defines the truth table." },
  { term:"Complement",        def:"The inverse of a logic value. The complement of A is Ā (NOT A). 0 and 1 are each other's complements." },
  { term:"Functional completeness", def:"A set of gates from which any Boolean function can be built. AND + OR + NOT is functionally complete. So is NAND alone, or NOR alone." },
  { term:"Sum of Products (SOP)", def:"A Boolean expression written as an OR of AND terms. One AND term per row where output = 1. Example: F = AB + Ā·B." },
  { term:"74xx family",       def:"A widely-used family of logic IC packages. 7408 = quad AND, 7432 = quad OR, 7404 = hex NOT. All use the same 14-pin DIP layout." },
  { term:"DIP (Dual Inline Package)", def:"An IC package with two rows of pins. Pin 1 is at the notch/dot. Pins count down the left side, then up the right." },
  { term:"TTL",               def:"Transistor-Transistor Logic. 5V supply, BJT-based. The original 74xx family. Now largely superseded by CMOS." },
  { term:"74HC series",       def:"High-speed CMOS logic compatible with 74xx pin-outs. 2–6V supply, much lower power than TTL, faster switching." },
  { term:"Timing diagram",    def:"A graph of digital signal values versus time. Shows cause-and-effect relationships between inputs and outputs." },
  { term:"Rising edge",       def:"A signal transition from LOW to HIGH. Represented by a vertical line going up on a timing diagram." },
  { term:"Falling edge",      def:"A signal transition from HIGH to LOW. Represented by a vertical line going down on a timing diagram." },
  { term:"Propagation delay", def:"The time from when an input changes to when the output responds. Specified in datasheets as t_pHL (HIGH→LOW) and t_pLH (LOW→HIGH)." },
  { term:"Fan-out",           def:"The maximum number of gate inputs one gate output can drive reliably. Exceeding fan-out causes logic level degradation." },
];

function KeyTermsTab() {
  const [q, setQ] = useState("");
  const terms = q ? TERMS.filter(t => t.term.toLowerCase().includes(q.toLowerCase()) || t.def.toLowerCase().includes(q.toLowerCase())) : TERMS;
  return (
    <div>
      <input placeholder="Filter terms…" value={q} onChange={e => setQ(e.target.value)}
        style={{ width:"100%", marginBottom:10, padding:"8px 12px", borderRadius:8, border:"0.5px solid var(--color-border-secondary)", background:"var(--color-background-primary)", color:"var(--color-text-primary)", fontSize:13 }}/>
      {terms.map(({ term, def }) => (
        <div key={term} style={{ ...card, marginBottom:6 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#0891b2", marginBottom:3 }}>{term}</div>
          <div style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.6 }}>{def}</div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════
export default function DF_L3_1_ANDORNOTGates({ params = {} }) {
  const ready = useMath();
  const [tab, setTab] = useState("gates");

  const TABS = [
    ["gates", "The three gates",  "#0891b2"],
    ["why",   "Why these three",  "#7c3aed"],
    ["ics",   "Real ICs",         "#d97706"],
    ["timing","Timing diagrams",  "#059669"],
    ["terms", "Key terms",        "#64748b"],
  ];

  return (
    <div style={{ fontFamily:"var(--font-sans,system-ui)", padding:"4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ ...card, borderLeft:"3px solid #0891b2", borderRadius:0, background:"#ecfeff", marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:600, color:"#0891b2", letterSpacing:".08em", textTransform:"uppercase", marginBottom:3 }}>Digital Fundamentals · Unit 3 · Lesson 1</div>
        <div style={{ fontSize:16, fontWeight:500, color:"#0e7490", marginBottom:4 }}>AND, OR, NOT: The Three Primitive Gates</div>
        <div style={{ fontSize:13, color:"#0e7490", lineHeight:1.7 }}>
          Every logic circuit — from a simple alarm to a 20-billion-transistor CPU — is ultimately built from combinations of AND, OR, and NOT. These three gates are the complete vocabulary of Boolean logic, grounded in set theory and realised in silicon.
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
        {TABS.map(([k,l,c]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding:"5px 13px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:tab===k?500:400, border:`0.5px solid ${tab===k?c:"var(--color-border-secondary)"}`, background:tab===k?c+"22":"transparent", color:tab===k?c:"var(--color-text-secondary)" }}>{l}</button>
        ))}
      </div>

      {tab==="gates"  && <div style={{animation:"sd .2s ease-out"}}><ThreeGatesTab ready={ready}/></div>}
      {tab==="why"    && <div style={{animation:"sd .2s ease-out"}}><WhyThreeTab   ready={ready}/></div>}
      {tab==="ics"    && <div style={{animation:"sd .2s ease-out"}}><RealICsTab    ready={ready}/></div>}
      {tab==="timing" && <div style={{animation:"sd .2s ease-out"}}><TimingTab     ready={ready}/></div>}
      {tab==="terms"  && <div style={{animation:"sd .2s ease-out"}}><KeyTermsTab/></div>}
    </div>
  );
}