/**
 * HigherOrderDerivatives.jsx
 *
 * Self-contained lesson: Higher-Order Derivatives
 * Covers: notation, computation, meaning of f″, trig cycles,
 *         concavity connection, midterm-style worked examples.
 */
import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const lnk = document.createElement("link"); lnk.rel = "stylesheet";
    lnk.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(lnk);
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

const DS = [
  { border: "#6366f1", bg: "#eef2ff", text: "#4338ca", panelBg: "var(--color-background-secondary)" },
  { border: "#0891b2", bg: "#ecfeff", text: "#0e7490", panelBg: "var(--color-background-primary)" },
  { border: "#059669", bg: "#ecfdf5", text: "#047857", panelBg: "var(--color-background-secondary)" },
];

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DS[Math.min(depth, 2)];
  const lbl = why.tag || ["Why?","But why?","Prove it"][Math.min(depth,2)];
  return (
    <div style={{ marginLeft: depth * 14, marginTop: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display:"inline-flex",alignItems:"center",gap:6,background:open?d.bg:"transparent",border:`1px solid ${d.border}`,borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:500,color:d.border,cursor:"pointer" }}>
        <span style={{ width:14,height:14,borderRadius:"50%",background:d.border,color:"#fff",fontSize:9,fontWeight:700,flexShrink:0,display:"inline-flex",alignItems:"center",justifyContent:"center" }}>{open?"−":"?"}</span>
        {open?"Close":lbl}
      </button>
      {open && (
        <div style={{ marginTop:6,padding:"12px 14px",background:d.panelBg,border:`0.5px solid ${d.border}22`,borderLeft:`3px solid ${d.border}`,borderRadius:"0 8px 8px 0",animation:"sd .16s ease-out" }}>
          <span style={{ fontSize:10,fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",padding:"2px 7px",borderRadius:4,marginBottom:8,display:"inline-block",background:d.bg,color:d.text }}>{lbl}</span>
          <p style={{ fontSize:13,lineHeight:1.7,color:"var(--color-text-primary)",marginBottom:why.math||why.steps?10:0 }}>{why.explanation}</p>
          {why.math && <div style={{ background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:6,padding:"10px 14px",textAlign:"center",overflowX:"auto",marginBottom:6 }}><M t={why.math} display ready={ready} /></div>}
          {why.steps && <div style={{ marginTop:8 }}>{why.steps.map((st,i)=>(
            <div key={i} style={{ display:"flex",gap:8,marginBottom:8,alignItems:"flex-start" }}>
              <div style={{ minWidth:20,height:20,borderRadius:"50%",background:d.border,color:"#fff",fontSize:10,fontWeight:700,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>{i+1}</div>
              <div><p style={{ fontSize:12,lineHeight:1.6,color:"var(--color-text-primary)",marginBottom:st.math?4:0 }}>{st.text}</p>
              {st.math&&<div style={{ background:"var(--color-background-secondary)",borderRadius:6,padding:"6px 10px",textAlign:"center",overflowX:"auto",marginTop:3 }}><M t={st.math} display ready={ready}/></div>}</div>
            </div>
          ))}</div>}
          {why.why && <WhyPanel why={why.why} depth={depth+1} ready={ready}/>}
        </div>
      )}
    </div>
  );
}

// ── Graph component ──────────────────────────────────────────────────────────
function DerivGraph({ ready }) {
  const ref = useRef(null);
  const [fn, setFn] = useState("poly");
  const fns = {
    poly:  { label:"x³ − 3x", f: x => x**3-3*x, fp: x => 3*x**2-3, fpp: x => 6*x },
    sin:   { label:"sin(x)",  f: Math.sin, fp: Math.cos, fpp: x => -Math.sin(x) },
    gauss: { label:"e^(−x²)", f: x=>Math.exp(-x*x), fp: x=>-2*x*Math.exp(-x*x), fpp: x=>(4*x*x-2)*Math.exp(-x*x) },
  };
  const cur = fns[fn];

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { bg:"transparent", axis:isDark?"#475569":"#94a3b8", grid:isDark?"#1e293b":"#f1f5f9", f:isDark?"#38bdf8":"#0284c7", fp:isDark?"#34d399":"#059669", fpp:isDark?"#fbbf24":"#d97706", zero:isDark?"#f87171":"#ef4444", text:isDark?"#94a3b8":"#64748b" };
      const el = ref.current; if (!el) return;
      const W = el.clientWidth, H = 200;
      const xd = [-3,3], yd = [-4,4];
      const xS = d3.scaleLinear().domain(xd).range([32,W-8]);
      const yS = d3.scaleLinear().domain(yd).range([H-8,8]);
      const svg = d3.select(el); svg.selectAll("*").remove();
      svg.attr("width",W).attr("height",H);
      // Grid
      xS.ticks(6).forEach(v=>svg.append("line").attr("x1",xS(v)).attr("y1",8).attr("x2",xS(v)).attr("y2",H-8).attr("stroke",C.grid).attr("stroke-width",1));
      yS.ticks(4).forEach(v=>svg.append("line").attr("x1",32).attr("y1",yS(v)).attr("x2",W-8).attr("y2",yS(v)).attr("stroke",C.grid).attr("stroke-width",1));
      // Axes
      svg.append("line").attr("x1",32).attr("y1",yS(0)).attr("x2",W-8).attr("y2",yS(0)).attr("stroke",C.axis).attr("stroke-width",1.5);
      svg.append("line").attr("x1",xS(0)).attr("y1",8).attr("x2",xS(0)).attr("y2",H-8).attr("stroke",C.axis).attr("stroke-width",1.5);
      // Draw curves
      const drawCurve = (fn2, col, w, dash) => {
        const pts=[], N=300;
        for(let i=0;i<=N;i++){const x=xd[0]+i*(xd[1]-xd[0])/N; const y=fn2(x); if(isFinite(y)&&y>=yd[0]-0.5&&y<=yd[1]+0.5) pts.push([x,y]);}
        if(pts.length<2)return;
        const line=d3.line().x(d=>xS(d[0])).y(d=>yS(d[1])).curve(d3.curveCatmullRom);
        svg.append("path").datum(pts).attr("fill","none").attr("stroke",col).attr("stroke-width",w).attr("stroke-dasharray",dash||"none").attr("d",line);
      };
      drawCurve(cur.f, C.f, 2.5);
      drawCurve(cur.fp, C.fp, 2);
      drawCurve(cur.fpp, C.fpp, 2, "5,3");
      // Legend
      [{col:C.f,lbl:"f(x)"},{col:C.fp,lbl:"f′(x)"},{col:C.fpp,lbl:"f″(x)",dash:"5,3"}].forEach(({col,lbl,dash},i)=>{
        svg.append("line").attr("x1",38).attr("y1",16+i*16).attr("x2",58).attr("y2",16+i*16).attr("stroke",col).attr("stroke-width",2).attr("stroke-dasharray",dash||"none");
        svg.append("text").attr("x",64).attr("y",20+i*16).attr("fill",C.text).attr("font-size",11).text(lbl);
      });
    };
    const ro = new ResizeObserver(draw);
    if(ref.current) ro.observe(ref.current);
    draw();
    return ()=>ro.disconnect();
  },[fn]);

  return (
    <div>
      <div style={{ display:"flex",gap:6,marginBottom:8 }}>
        {Object.entries({ poly:"x³−3x", sin:"sin(x)", gauss:"e^(−x²)" }).map(([k,lbl])=>(
          <button key={k} onClick={()=>setFn(k)} style={{ padding:"3px 10px",borderRadius:14,fontSize:12,cursor:"pointer",border:`0.5px solid ${fn===k?"var(--color-border-info)":"var(--color-border-secondary)"}`,background:fn===k?"var(--color-background-info)":"transparent",color:fn===k?"var(--color-text-info)":"var(--color-text-secondary)" }}>{lbl}</button>
        ))}
      </div>
      <svg ref={ref} style={{ width:"100%",display:"block",borderRadius:8,background:"var(--color-background-secondary)" }} />
      <p style={{ fontSize:11,color:"var(--color-text-tertiary)",marginTop:4 }}>Blue = f · Green = f′ · Gold dashed = f″. Where f″ &gt; 0: f curves upward (concave up). Where f″ &lt; 0: f curves downward.</p>
    </div>
  );
}

// ── Content ─────────────────────────────────────────────────────────────────
const NOTATION = [
  { order:"1st",leibniz:"\\dfrac{dy}{dx}",prime:"f'(x)",dot:"\\dot{y}",meaning:"Rate of change of f" },
  { order:"2nd",leibniz:"\\dfrac{d^2y}{dx^2}",prime:"f''(x)",dot:"\\ddot{y}",meaning:"Rate of change of the slope — concavity" },
  { order:"3rd",leibniz:"\\dfrac{d^3y}{dx^3}",prime:"f'''(x)",dot:"",meaning:"Rate of change of concavity — 'jerk' in physics" },
  { order:"nth",leibniz:"\\dfrac{d^ny}{dx^n}",prime:"f^{(n)}(x)",dot:"",meaning:"Apply derivative n times" },
];

const TRIG_CYCLE = [
  { fn:"\\sin(x)", d:"\\cos(x)", color:"#7F77DD" },
  { fn:"\\cos(x)", d:"-\\sin(x)", color:"#1D9E75" },
  { fn:"-\\sin(x)", d:"-\\cos(x)", color:"#BA7517" },
  { fn:"-\\cos(x)", d:"\\sin(x)", color:"#A32D2D" },
];

const EXAMPLES = [
  {
    title:"Find f″(x) for f(x) = x⁴ − 3x² + 2",
    steps:[
      { label:"f′(x)", math:"4x^3 - 6x", note:"Power rule on each term." },
      { label:"f″(x)", math:"12x^2 - 6", note:"Power rule again on f′." },
      { label:"Evaluate f″(2)", math:"12(4)-6 = 48-6 = 42", note:"Substitute x=2." },
    ],
    answer:"f''(x) = 12x^2 - 6",
    watchFor:"Each differentiation is a complete, fresh application of all rules. Don't differentiate once and copy.",
  },
  {
    title:"Find the 35th derivative of sin(x)",
    steps:[
      { label:"Cycle of 4", math:"\\sin\\to\\cos\\to-\\sin\\to-\\cos\\to\\sin\\to\\cdots", note:"Period = 4." },
      { label:"35 ÷ 4", math:"35 = 4(8) + 3 \\quad \\text{remainder }3", note:"The remainder tells you where in the cycle you land." },
      { label:"3rd derivative of sin", math:"f'''(x) = -\\cos(x)", note:"Position 3 in the cycle is −cos." },
    ],
    answer:"f^{(35)}(x) = -\\cos(x)",
    watchFor:"Use the remainder after dividing by 4. Remainder 0 = sin, 1 = cos, 2 = −sin, 3 = −cos.",
  },
  {
    title:"Find f″(x) for f(x) = x·eˣ",
    steps:[
      { label:"f′(x) — product rule", math:"(1)e^x + x \\cdot e^x = e^x(1+x)", note:"" },
      { label:"f″(x) — product rule again on e^x(1+x)", math:"e^x(1+x) + e^x(1) = e^x(2+x)", note:"d/dx[eˣ(1+x)]: eˣ is one factor, (1+x) the other. Product rule." },
    ],
    answer:"f''(x) = e^x(x+2)",
    watchFor:"When you differentiate a product result, you need product rule again — it's a fresh differentiation, not a continuation.",
  },
];

const card = { background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",border:"0.5px solid var(--color-border-tertiary)",marginBottom:8 };

export default function HigherOrderDerivatives({ params={} }) {
  const ready = useMath();
  const [tab, setTab] = useState("intuition");
  const [exIdx, setExIdx] = useState(0);
  const [reveal, setReveal] = useState(0);
  const ex = EXAMPLES[exIdx];

  const tabBtn = (key, label, color) => ({
    padding:"5px 13px",borderRadius:20,fontSize:12,cursor:"pointer",fontWeight:tab===key?500:400,
    border:`0.5px solid ${tab===key?color:"var(--color-border-secondary)"}`,
    background:tab===key?color+"22":"transparent",color:tab===key?color:"var(--color-text-secondary)",
  });

  return (
    <div style={{ fontFamily:"var(--font-sans)",padding:"4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ ...card,borderLeft:"3px solid #7F77DD",borderRadius:0,background:"#EEEDFE",marginBottom:14 }}>
        <div style={{ fontSize:15,fontWeight:500,color:"#26215C",marginBottom:4 }}>Higher-Order Derivatives</div>
        <div style={{ fontSize:13,color:"#3C3489",lineHeight:1.7 }}>
          Differentiate a derivative and you get a higher-order derivative. f″ measures how the slope is changing — whether the curve is bending up or down. In physics, if position is f, then f′ = velocity, f″ = acceleration, f‴ = jerk. Every time you apply d/dx, you move up one order.
        </div>
      </div>

      <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:14 }}>
        {[["intuition","Intuition + graphs","#7F77DD"],["notation","Notation","#1D9E75"],["trig","Trig cycles","#0891b2"],["examples","Worked examples","#BA7517"]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setTab(k)} style={tabBtn(k,l,c)}>{l}</button>
        ))}
      </div>

      {tab==="intuition" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ ...card }}>
            <div style={{ fontSize:13,fontWeight:500,color:"var(--color-text-primary)",marginBottom:8 }}>What f″ actually measures</div>
            <div style={{ fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.7,marginBottom:10 }}>
              f′ measures slope — how fast f is rising or falling. f″ measures how fast <em>the slope itself</em> is changing.
              If f″ &gt; 0, the slope is increasing: the curve is <strong style={{color:"#0891b2"}}>concave up</strong> (bowl shape, holds water).
              If f″ &lt; 0, the slope is decreasing: the curve is <strong style={{color:"#d97706"}}>concave down</strong> (hill shape, spills water).
            </div>
            <DerivGraph ready={ready} />
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:6 }}>Physics interpretation</div>
            {[["f(t)","Position of a particle"],["f′(t)","Velocity — how fast position changes"],["f″(t)","Acceleration — how fast velocity changes"],["f‴(t)","Jerk — how fast acceleration changes (relevant in vehicle design)"]].map(([fn,meaning],i)=>(
              <div key={i} style={{ display:"flex",gap:10,padding:"6px 0",borderBottom:i<3?"0.5px solid var(--color-border-tertiary)":"none" }}>
                <div style={{ minWidth:60,fontSize:13,fontFamily:"var(--font-serif)" }}><M t={fn} ready={ready}/></div>
                <div style={{ fontSize:13,color:"var(--color-text-secondary)" }}>{meaning}</div>
              </div>
            ))}
            <WhyPanel why={{ tag:"Why do we need derivatives beyond f′?", explanation:"f′ tells you the slope at a moment. f″ tells you whether that slope is getting steeper or shallower — is the function accelerating or decelerating? In optimisation (your next topic), f″ tells you whether a critical point is a max or a min. If f′=0 and f″>0: slope just changed from negative to positive → minimum. If f″<0: maximum.", steps:[{text:"At a minimum: f is concave up (f″>0). The slope f′ was negative, hit 0, is now positive."},{text:"At a maximum: f is concave down (f″<0). The slope f′ was positive, hit 0, is now negative."},{text:"This is the Second Derivative Test — on your midterm."}], why:null }} depth={0} ready={ready}/>
          </div>
        </div>
      )}

      {tab==="notation" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ ...card,background:"var(--color-background-primary)" }}>
            <div style={{ fontSize:13,color:"var(--color-text-secondary)",marginBottom:10 }}>Three notation systems — all mean the same thing</div>
            {NOTATION.map((row,i)=>(
              <div key={i} style={{ display:"grid",gridTemplateColumns:"50px 1fr 1fr 2fr",gap:8,alignItems:"center",padding:"10px 0",borderBottom:i<NOTATION.length-1?"0.5px solid var(--color-border-tertiary)":"none" }}>
                <div style={{ fontSize:11,fontWeight:600,color:"var(--color-text-tertiary)" }}>{row.order}</div>
                <div style={{ overflowX:"auto" }}><M t={row.leibniz} ready={ready}/></div>
                <div style={{ overflowX:"auto" }}><M t={row.prime} ready={ready}/></div>
                <div style={{ fontSize:12,color:"var(--color-text-secondary)" }}>{row.meaning}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:6 }}>Important: the Leibniz notation for 2nd derivative</div>
            <M t={"\\frac{d^2y}{dx^2} = \\frac{d}{dx}\\!\\left(\\frac{dy}{dx}\\right)"} display ready={ready}/>
            <div style={{ fontSize:13,color:"var(--color-text-secondary)",marginTop:8,lineHeight:1.7 }}>
              The 2 in d²y is NOT an exponent on y. It means "differentiate twice." The dx² in the denominator means "with respect to x, twice." This notation is consistent: d/dx applied to dy/dx gives d²y/dx².
            </div>
            <WhyPanel why={{ tag:"Why write d²y/dx² not (dy/dx)²?", explanation:"(dy/dx)² would mean 'square the derivative' — multiply it by itself. d²y/dx² means 'differentiate twice.' These are completely different operations. For y=x², dy/dx=2x and d²y/dx²=2, but (dy/dx)²=4x². The exponent notation in Leibniz is indicating the order of differentiation, not a power.", why:null }} depth={0} ready={ready}/>
          </div>
        </div>
      )}

      {tab==="trig" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ ...card,borderLeft:"3px solid #0891b2",borderRadius:0,background:"#ecfeff" }}>
            <div style={{ fontSize:13,fontWeight:500,color:"#0e7490",marginBottom:8 }}>The trig derivative cycle — period 4</div>
            <div style={{ fontSize:13,color:"#0e7490",lineHeight:1.7 }}>
              Differentiating sin(x) four times returns you to sin(x). This 4-cycle is the key to finding any nth derivative of trig functions instantly.
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:4,margin:"12px 0" }}>
            {TRIG_CYCLE.map((c,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:4 }}>
                <div style={{ padding:"8px 14px",borderRadius:8,border:`1.5px solid ${c.color}`,background:c.color+"18",fontSize:14 }}>
                  <M t={c.fn} ready={ready}/>
                </div>
                <div style={{ fontSize:18,color:"var(--color-text-tertiary)" }}>{i<3?"→":"↺"}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:8 }}>How to find the nth derivative fast</div>
            {[["Divide n by 4","Find the remainder r = n mod 4"],["Look up r in the table","r=0→sin, r=1→cos, r=2→−sin, r=3→−cos"],["Same for cos(x)","r=0→cos, r=1→−sin, r=2→−cos, r=3→sin"]].map(([step,note],i)=>(
              <div key={i} style={{ display:"flex",gap:10,marginBottom:8 }}>
                <div style={{ minWidth:22,height:22,borderRadius:"50%",background:"#0891b2",color:"#fff",fontSize:11,fontWeight:700,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>{i+1}</div>
                <div><div style={{ fontSize:13,fontWeight:500 }}>{step}</div><div style={{ fontSize:12,color:"var(--color-text-secondary)" }}>{note}</div></div>
              </div>
            ))}
            <WhyPanel why={{ tag:"Why does the cycle have period 4?", explanation:"d/dx[sin] = cos. d/dx[cos] = −sin. d/dx[−sin] = −cos. d/dx[−cos] = sin. Four steps bring you back to sin. This is because sin and cos are solutions to y″ = −y — differentiating twice gives the negative back. The period of the differentiation cycle equals the period of the trig relationship.", why:null }} depth={0} ready={ready}/>
          </div>
        </div>
      )}

      {tab==="examples" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ display:"flex",gap:5,marginBottom:12,flexWrap:"wrap" }}>
            {EXAMPLES.map((e,i)=>(
              <button key={i} onClick={()=>{setExIdx(i);setReveal(0);}} style={{ padding:"4px 11px",borderRadius:14,fontSize:12,cursor:"pointer",fontWeight:i===exIdx?600:400,border:`0.5px solid ${i===exIdx?"var(--color-border-info)":"var(--color-border-secondary)"}`,background:i===exIdx?"var(--color-background-info)":"transparent",color:i===exIdx?"var(--color-text-info)":"var(--color-text-secondary)" }}>
                Problem {i+1}
              </button>
            ))}
          </div>
          <div style={{ fontSize:14,fontWeight:500,color:"var(--color-text-primary)",marginBottom:10 }}>{ex.title}</div>
          {ex.steps.map((st,i)=>{
            if(i>reveal) return null;
            return (
              <div key={i} style={{ ...card,borderLeft:`3px solid ${i===ex.steps.length-1?"#1D9E75":"#7F77DD"}`,borderRadius:0,animation:"sd .16s ease-out" }}>
                <div style={{ fontSize:11,color:"var(--color-text-tertiary)",marginBottom:3 }}>{st.label}</div>
                <M t={st.math} display ready={ready}/>
                {st.note&&<div style={{ fontSize:12,color:"var(--color-text-secondary)",fontStyle:"italic",marginTop:4 }}>{st.note}</div>}
              </div>
            );
          })}
          {reveal<ex.steps.length-1&&<button onClick={()=>setReveal(r=>r+1)} style={{ width:"100%",padding:10,borderRadius:8,border:"0.5px solid var(--color-border-info)",background:"var(--color-background-info)",color:"var(--color-text-info)",cursor:"pointer",fontSize:13,fontWeight:500,marginTop:4 }}>▶ Next step</button>}
          {reveal===ex.steps.length-1&&(
            <div style={{ ...card,borderLeft:"3px solid #d97706",borderRadius:0,background:"var(--color-background-warning)",marginTop:6 }}>
              <div style={{ fontSize:11,fontWeight:600,color:"var(--color-text-warning)",marginBottom:4,textTransform:"uppercase",letterSpacing:".06em" }}>Watch out for</div>
              <div style={{ fontSize:13,color:"var(--color-text-primary)" }}>{ex.watchFor}</div>
            </div>
          )}
          {reveal>0&&<button onClick={()=>setReveal(0)} style={{ marginTop:8,padding:"4px 12px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"transparent",color:"var(--color-text-secondary)",cursor:"pointer",fontSize:12 }}>← Reset</button>}
        </div>
      )}
    </div>
  );
}