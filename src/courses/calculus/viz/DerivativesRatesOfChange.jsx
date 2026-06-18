/**
 * DerivativesRatesOfChange.jsx
 *
 * Self-contained lesson: 3.4 Derivatives as Rates of Change
 * Covers: amount of change formula, marginal cost/revenue/profit,
 *         population change, all with full derivations and examples.
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
  { border:"#6366f1",bg:"#eef2ff",text:"#4338ca",panelBg:"var(--color-background-secondary)" },
  { border:"#0891b2",bg:"#ecfeff",text:"#0e7490",panelBg:"var(--color-background-primary)" },
  { border:"#059669",bg:"#ecfdf5",text:"#047857",panelBg:"var(--color-background-secondary)" },
];

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DS[Math.min(depth,2)];
  const lbl = why.tag||["Why?","But why?","Prove it"][Math.min(depth,2)];
  return (
    <div style={{ marginLeft:depth*14,marginTop:8 }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ display:"inline-flex",alignItems:"center",gap:6,background:open?d.bg:"transparent",border:`1px solid ${d.border}`,borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:500,color:d.border,cursor:"pointer" }}>
        <span style={{ width:14,height:14,borderRadius:"50%",background:d.border,color:"#fff",fontSize:9,fontWeight:700,flexShrink:0,display:"inline-flex",alignItems:"center",justifyContent:"center" }}>{open?"−":"?"}</span>
        {open?"Close":lbl}
      </button>
      {open&&(
        <div style={{ marginTop:6,padding:"12px 14px",background:d.panelBg,border:`0.5px solid ${d.border}22`,borderLeft:`3px solid ${d.border}`,borderRadius:"0 8px 8px 0",animation:"sd .16s ease-out" }}>
          <span style={{ fontSize:10,fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",padding:"2px 7px",borderRadius:4,marginBottom:8,display:"inline-block",background:d.bg,color:d.text }}>{lbl}</span>
          <p style={{ fontSize:13,lineHeight:1.7,color:"var(--color-text-primary)",marginBottom:why.math||why.steps?10:0 }}>{why.explanation}</p>
          {why.math&&<div style={{ background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:6,padding:"10px 14px",textAlign:"center",overflowX:"auto",marginBottom:6 }}><M t={why.math} display ready={ready}/></div>}
          {why.steps&&<div style={{ marginTop:8 }}>{why.steps.map((st,i)=>(
            <div key={i} style={{ display:"flex",gap:8,marginBottom:8,alignItems:"flex-start" }}>
              <div style={{ minWidth:20,height:20,borderRadius:"50%",background:d.border,color:"#fff",fontSize:10,fontWeight:700,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>{i+1}</div>
              <div><p style={{ fontSize:12,lineHeight:1.6,color:"var(--color-text-primary)",marginBottom:st.math?4:0 }}>{st.text}</p>
              {st.math&&<div style={{ background:"var(--color-background-secondary)",borderRadius:6,padding:"6px 10px",textAlign:"center",overflowX:"auto",marginTop:3 }}><M t={st.math} display ready={ready}/></div>}</div>
            </div>
          ))}</div>}
          {why.why&&<WhyPanel why={why.why} depth={depth+1} ready={ready}/>}
        </div>
      )}
    </div>
  );
}

// ── Interactive graph: tangent line as amount of change ───────────────────
function AmountOfChangeViz({ ready }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dx, setDx] = useState(1.0);

  useEffect(()=>{
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { bg:"transparent",axis:isDark?"#475569":"#94a3b8",grid:isDark?"#1e293b":"#f1f5f9",curve:isDark?"#38bdf8":"#0284c7",tan:isDark?"rgba(251,191,36,0.7)":"rgba(217,119,6,0.6)",actual:isDark?"#34d399":"#059669",text:isDark?"#94a3b8":"#64748b",pt:isDark?"#fbbf24":"#d97706",err:isDark?"#f87171":"#ef4444" };
      const W = containerRef.current?.clientWidth || 500, H = 200;
      const x0 = 1.5;
      const f = x => 0.4*x*x;
      const fp = x => 0.8*x;
      const xd = [0,4], yd = [0,7];
      const xS = d3.scaleLinear().domain(xd).range([32,W-8]);
      const yS = d3.scaleLinear().domain(yd).range([H-8,8]);
      const svg = d3.select(svgRef.current); svg.selectAll("*").remove();
      svg.attr("width",W).attr("height",H);
      // Axes
      svg.append("line").attr("x1",32).attr("y1",yS(0)).attr("x2",W-8).attr("y2",yS(0)).attr("stroke",C.axis).attr("stroke-width",1.5);
      svg.append("line").attr("x1",xS(0)).attr("y1",8).attr("x2",xS(0)).attr("y2",H-8).attr("stroke",C.axis).attr("stroke-width",1.5);
      // Curve
      const pts=[]; for(let i=0;i<=200;i++){const x=xd[0]+i*(xd[1]-xd[0])/200;pts.push([x,f(x)]);}
      svg.append("path").datum(pts).attr("fill","none").attr("stroke",C.curve).attr("stroke-width",2.5).attr("d",d3.line().x(d=>xS(d[0])).y(d=>yS(d[1])).curve(d3.curveCatmullRom));
      // Actual change (green bar)
      const x1 = x0+dx;
      svg.append("line").attr("x1",xS(x1)).attr("y1",yS(f(x0))).attr("x2",xS(x1)).attr("y2",yS(f(x1))).attr("stroke",C.actual).attr("stroke-width",3);
      // Tangent approximation (amber)
      const tanY1 = f(x0)+fp(x0)*dx;
      svg.append("line").attr("x1",xS(x1)).attr("y1",yS(f(x0))).attr("x2",xS(x1)).attr("y2",yS(tanY1)).attr("stroke",C.pt).attr("stroke-width",3).attr("stroke-dasharray","4,3");
      // Tangent line
      svg.append("line").attr("x1",xS(0.5)).attr("y1",yS(f(x0)+fp(x0)*(0.5-x0))).attr("x2",xS(3.5)).attr("y2",yS(f(x0)+fp(x0)*(3.5-x0))).attr("stroke",C.pt).attr("stroke-width",1.5).attr("stroke-dasharray","5,4");
      // Points
      svg.append("circle").attr("cx",xS(x0)).attr("cy",yS(f(x0))).attr("r",6).attr("fill",C.pt).attr("stroke","var(--color-background-primary)").attr("stroke-width",2);
      svg.append("circle").attr("cx",xS(x1)).attr("cy",yS(f(x1))).attr("r",6).attr("fill",C.actual).attr("stroke","var(--color-background-primary)").attr("stroke-width",2);
      // Labels
      const actualChange = (f(x1)-f(x0)).toFixed(3);
      const approxChange = (fp(x0)*dx).toFixed(3);
      const err = Math.abs(f(x1)-f(x0)-fp(x0)*dx).toFixed(4);
      svg.append("text").attr("x",xS(x0)-4).attr("y",yS(f(x0))-8).attr("text-anchor","end").attr("fill",C.pt).attr("font-size",11).text(`x₀=${x0}`);
      svg.append("text").attr("x",xS(x1)+4).attr("y",yS(f(x1))-8).attr("fill",C.actual).attr("font-size",11).text(`Δy=${actualChange}`);
      svg.append("text").attr("x",xS(x1)+4).attr("y",yS(tanY1)+4).attr("fill",C.pt).attr("font-size",11).text(`f′·Δx≈${approxChange}`);
      svg.append("text").attr("x",xS(x1)+4).attr("y",yS((f(x1)+tanY1)/2)).attr("fill",C.err).attr("font-size",10).text(`err=${err}`);
    };
    const ro = new ResizeObserver(draw);
    if(containerRef.current) ro.observe(containerRef.current);
    draw();
    return ()=>ro.disconnect();
  },[dx]);

  return (
    <div ref={containerRef}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
        <span style={{ fontSize:12,color:"var(--color-text-secondary)" }}>Δx = {dx.toFixed(2)}</span>
        <input type="range" min={0.05} max={2.5} step={0.05} value={dx} onChange={e=>setDx(parseFloat(e.target.value))} style={{ flex:1,accentColor:"#fbbf24" }}/>
      </div>
      <svg ref={svgRef} style={{ width:"100%",display:"block",borderRadius:8,background:"var(--color-background-secondary)" }}/>
      <p style={{ fontSize:11,color:"var(--color-text-tertiary)",marginTop:4 }}>
        Green = actual change Δy = f(x₀+Δx) − f(x₀). Amber dashed = approximation f′(x₀)·Δx. Error shrinks as Δx→0.
      </p>
    </div>
  );
}

const EXAMPLES = [
  {
    title:"Marginal cost: C(x) = 200 + 4x − 0.01x²",
    context:"A factory produces x units. C(x) is the total cost in dollars.",
    steps:[
      { label:"Marginal cost = C′(x)", math:"C'(x) = 4 - 0.02x", note:"Derivative of the cost function. This approximates the cost of producing ONE MORE unit." },
      { label:"Marginal cost at x = 100", math:"C'(100) = 4 - 0.02(100) = 4 - 2 = 2", note:"Producing the 101st unit costs approximately $2." },
      { label:"Verify with actual cost", math:"C(101)-C(100) = [200+404-102.01]-[200+400-100] = 501.99-500 = 1.99", note:"The actual cost is $1.99. Marginal cost ($2.00) is a close approximation." },
      { label:"Interpretation", math:"C'(x) = 0 \\Rightarrow 4 - 0.02x = 0 \\Rightarrow x = 200", note:"At x=200, marginal cost=0. This is where C is minimised (cost no longer rising with production)." },
    ],
    watchFor:"Marginal cost ≈ cost of one more unit. It is NOT the cost of x units total. C′(100)=2 means the 101st unit adds ~$2 to total cost.",
  },
  {
    title:"Population growth: P(t) = 2000·e^(0.03t)",
    context:"P(t) is population at time t years.",
    steps:[
      { label:"Growth rate = P′(t)", math:"P'(t) = 2000 \\cdot 0.03 \\cdot e^{0.03t} = 60e^{0.03t}", note:"Chain rule: d/dt[e^(0.03t)] = 0.03e^(0.03t)." },
      { label:"Rate at t=10 years", math:"P'(10) = 60e^{0.3} \\approx 60(1.3499) \\approx 80.99", note:"About 81 people per year at t=10." },
      { label:"Relative (percentage) growth rate", math:"\\frac{P'(t)}{P(t)} = \\frac{60e^{0.03t}}{2000e^{0.03t}} = \\frac{60}{2000} = 0.03 = 3\\%", note:"The e^(0.03t) cancels. The relative growth rate is constant at 3%. This is the definition of exponential growth." },
    ],
    watchFor:"P′(t) is people per year (absolute rate). P′(t)/P(t) is the fraction per year (relative rate = 3%). Both appear on exams.",
  },
  {
    title:"Amount of change approximation: f(x) = √x, approximate f(4.02)",
    steps:[
      { label:"Amount of change formula", math:"\\Delta f \\approx f'(x_0) \\cdot \\Delta x", note:"Use this when Δx is small and exact computation is hard." },
      { label:"Identify x₀ and Δx", math:"x_0 = 4, \\; \\Delta x = 0.02, \\; f(4) = 2", note:"We know f(4) = √4 = 2 exactly." },
      { label:"f′(x₀) = 1/(2√x₀)", math:"f'(4) = \\frac{1}{2\\sqrt{4}} = \\frac{1}{4} = 0.25", note:"Derivative of √x evaluated at x=4." },
      { label:"Approximate", math:"f(4.02) \\approx f(4) + f'(4)(0.02) = 2 + 0.25(0.02) = 2.005", note:"Actual: √4.02 ≈ 2.00499. Error < 0.0001." },
    ],
    watchFor:"x₀ must be a point where f(x₀) is easy to compute exactly. Choose x₀ as the nearest perfect square, cube, etc.",
  },
];

const card = { background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",border:"0.5px solid var(--color-border-tertiary)",marginBottom:8 };

export default function DerivativesRatesOfChange({ params={} }) {
  const ready = useMath();
  const [tab, setTab] = useState("formula");
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

      <div style={{ ...card,borderLeft:"3px solid #1D9E75",borderRadius:0,background:"#E1F5EE",marginBottom:14 }}>
        <div style={{ fontSize:15,fontWeight:500,color:"#085041",marginBottom:4 }}>Derivatives as Rates of Change — Section 3.4</div>
        <div style={{ fontSize:13,color:"#0F6E56",lineHeight:1.7 }}>
          A derivative IS a rate of change. f′(x) = how fast f is changing at x. The derivative connects pure calculus to real applications: marginal cost in economics, population growth in biology, velocity in physics. The key approximation: <M t={"\\Delta f \\approx f'(x_0)\\cdot\\Delta x"} ready={ready}/> is how engineers use derivatives in practice.
        </div>
      </div>

      <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:14 }}>
        {[["formula","Amount of change formula","#1D9E75"],["marginal","Marginal cost & revenue","#7F77DD"],["examples","Worked examples","#BA7517"]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setTab(k)} style={tabBtn(k,l,c)}>{l}</button>
        ))}
      </div>

      {tab==="formula" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ ...card }}>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:10 }}>The amount of change formula — where it comes from</div>
            <M t={"\\Delta f = f(x_0 + \\Delta x) - f(x_0) \\approx f'(x_0) \\cdot \\Delta x"} display ready={ready}/>
            <div style={{ fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.7,marginTop:10 }}>
              This comes directly from the definition of the derivative. f′(x₀) = lim(Δx→0) [f(x₀+Δx)−f(x₀)]/Δx. For small but non-zero Δx: f′(x₀) ≈ [f(x₀+Δx)−f(x₀)]/Δx. Multiply both sides by Δx and rearrange.
            </div>
            <WhyPanel why={{ tag:"When is this approximation good?", explanation:"The approximation Δf ≈ f′(x₀)·Δx is a linear (tangent line) approximation. It is most accurate when Δx is small AND the function is smooth (continuous, differentiable) near x₀. The error is roughly (1/2)f″(x₀)·(Δx)², so if Δx is halved, the error drops by a factor of 4.", steps:[{text:"Small Δx: the tangent line closely tracks the curve."},{text:"Large Δx: the approximation can be very wrong if the curve bends significantly."},{text:"On exams: Δx is always given as a small number (0.01, 0.1, etc.)."}], why:null }} depth={0} ready={ready}/>
          </div>
          <AmountOfChangeViz ready={ready}/>
        </div>
      )}

      {tab==="marginal" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ ...card,borderLeft:"3px solid #7F77DD",borderRadius:0,background:"#EEEDFE" }}>
            <div style={{ fontSize:13,fontWeight:500,color:"#26215C",marginBottom:8 }}>The economic interpretation — marginal analysis</div>
            <div style={{ fontSize:13,color:"#3C3489",lineHeight:1.7 }}>
              In economics, "marginal" always means derivative — the instantaneous rate of change. The key insight: the derivative C′(x) approximates C(x+1)−C(x), the cost of producing one additional unit. This approximation improves as production becomes large.
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,margin:"12px 0" }}>
            {[{fn:"C(x)",d:"C'(x)",name:"Marginal Cost",desc:"Approx cost of producing one more unit.",color:"#7F77DD"},{fn:"R(x)",d:"R'(x)",name:"Marginal Revenue",desc:"Approx revenue from selling one more unit.",color:"#1D9E75"},{fn:"P(x)=R−C",d:"P'(x)=R'−C'",name:"Marginal Profit",desc:"Profit maximised when R′(x) = C′(x).",color:"#BA7517"}].map((item,i)=>(
              <div key={i} style={{ padding:"10px 12px",borderRadius:8,border:`1.5px solid ${item.color}`,background:item.color+"12" }}>
                <div style={{ fontSize:11,fontWeight:600,color:item.color,marginBottom:4 }}>{item.name}</div>
                <div style={{ fontSize:13,marginBottom:4 }}><M t={item.d} ready={ready}/></div>
                <div style={{ fontSize:11,color:"var(--color-text-secondary)" }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:6 }}>Profit maximisation — the key result</div>
            <M t={"P(x) = R(x) - C(x) \\quad\\Rightarrow\\quad P'(x) = R'(x) - C'(x)"} display ready={ready}/>
            <M t={"P'(x) = 0 \\iff R'(x) = C'(x) \\quad \\text{(Marginal Revenue = Marginal Cost)}"} display ready={ready}/>
            <div style={{ fontSize:13,color:"var(--color-text-secondary)",marginTop:8,lineHeight:1.7 }}>
              This is the fundamental theorem of microeconomics: profit is maximised when the revenue from one more unit exactly equals its cost.
            </div>
            <WhyPanel why={{ tag:"Why does R′=C′ maximise profit?", explanation:"P=R−C, so P′=R′−C′. Setting P′=0 gives R′=C′. This is a critical point. To confirm it's a maximum (not minimum), check P″<0 or verify that P′ changes from positive to negative at that point. If R′>C′ you're making more per unit than you're spending — produce more. If R′<C′ you're spending more than you earn — produce less.", why:null }} depth={0} ready={ready}/>
          </div>
        </div>
      )}

      {tab==="examples" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ display:"flex",gap:5,marginBottom:12,flexWrap:"wrap" }}>
            {EXAMPLES.map((e,i)=>(
              <button key={i} onClick={()=>{setExIdx(i);setReveal(0);}} style={{ padding:"4px 11px",borderRadius:14,fontSize:12,cursor:"pointer",fontWeight:i===exIdx?600:400,border:`0.5px solid ${i===exIdx?"var(--color-border-info)":"var(--color-border-secondary)"}`,background:i===exIdx?"var(--color-background-info)":"transparent",color:i===exIdx?"var(--color-text-info)":"var(--color-text-secondary)" }}>
                {i===0?"Marginal cost":i===1?"Population":"Amount of change"}
              </button>
            ))}
          </div>
          {ex.context&&<div style={{ fontSize:13,color:"var(--color-text-secondary)",fontStyle:"italic",marginBottom:8 }}>{ex.context}</div>}
          <div style={{ fontSize:14,fontWeight:500,marginBottom:10 }}>{ex.title}</div>
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
          {reveal===ex.steps.length-1&&ex.watchFor&&(
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