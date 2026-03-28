/**
 * MaximaMinima.jsx
 *
 * Self-contained lesson: 4.3 Maxima and Minima + Locating Absolute Extrema
 * Covers: absolute vs local extrema, Extreme Value Theorem, Fermat's Theorem,
 *         critical points, the closed interval method, proof of Fermat's Theorem,
 *         full worked examples with step-by-step reveal.
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
  { border:"#d97706",bg:"#fffbeb",text:"#b45309",panelBg:"var(--color-background-primary)" },
];

function WhyPanel({ why, depth = 0, ready }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
  const d = DS[Math.min(depth,3)];
  const lbl = why.tag||["Why?","But why?","Prove it","From scratch"][Math.min(depth,3)];
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

// ── Interactive extrema graph ────────────────────────────────────────────────
function ExtremaViz({ ready }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [fnKey, setFnKey] = useState("cubic");

  const fns = {
    cubic:  { label:"x³−3x on [−2,2]", f:x=>x**3-3*x, fp:x=>3*x**2-3, a:-2, b:2 },
    quartic:{ label:"x⁴−8x² on [−3,3]", f:x=>x**4-8*x**2, fp:x=>4*x**3-16*x, a:-3, b:3 },
    sin:    { label:"sin(x) on [0,2π]", f:Math.sin, fp:Math.cos, a:0, b:2*Math.PI },
  };
  const cur = fns[fnKey];

  useEffect(()=>{
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { axis:isDark?"#475569":"#94a3b8",grid:isDark?"#1e293b":"#f1f5f9",curve:isDark?"#38bdf8":"#0284c7",abs_max:isDark?"#f87171":"#ef4444",abs_min:isDark?"#34d399":"#059669",local:isDark?"#fbbf24":"#d97706",endpt:isDark?"#a78bfa":"#7c3aed",text:isDark?"#94a3b8":"#64748b",fill:isDark?"rgba(56,189,248,0.08)":"rgba(2,132,199,0.05)" };
      const { f, fp, a, b } = cur;
      // Find values
      const N=400;
      const xs=Array.from({length:N+1},(_,i)=>a+i*(b-a)/N);
      const ys=xs.map(f);
      const yMin=Math.min(...ys)-0.5, yMax=Math.max(...ys)+0.5;
      const W=containerRef.current?.clientWidth||500, H=220;
      const xS=d3.scaleLinear().domain([a,b]).range([36,W-8]);
      const yS=d3.scaleLinear().domain([yMin,yMax]).range([H-8,8]);
      const svg=d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width",W).attr("height",H);
      // Shaded interval
      svg.append("rect").attr("x",xS(a)).attr("y",8).attr("width",xS(b)-xS(a)).attr("height",H-16).attr("fill",C.fill);
      // Axes
      svg.append("line").attr("x1",36).attr("y1",yS(0)).attr("x2",W-8).attr("y2",yS(0)).attr("stroke",C.axis).attr("stroke-width",1.5);
      svg.append("line").attr("x1",xS(0)||36).attr("y1",8).attr("x2",xS(0)||36).attr("y2",H-8).attr("stroke",C.axis).attr("stroke-width",1.5);
      // Curve
      const pts=xs.map(x=>[x,f(x)]);
      svg.append("path").datum(pts).attr("fill","none").attr("stroke",C.curve).attr("stroke-width",2.5).attr("d",d3.line().x(d=>xS(d[0])).y(d=>yS(d[1])).curve(d3.curveCatmullRom));
      // Find critical points (where fp≈0)
      const critX=[];
      for(let i=0;i<xs.length-1;i++){
        if(fp(xs[i])*fp(xs[i+1])<0) critX.push((xs[i]+xs[i+1])/2);
      }
      // Endpoint values
      const endVals=[{x:a,y:f(a)},{x:b,y:f(b)}];
      const allPts=[...endVals,...critX.map(x=>({x,y:f(x)}))];
      const globalMax=allPts.reduce((m,p)=>p.y>m.y?p:m,allPts[0]);
      const globalMin=allPts.reduce((m,p)=>p.y<m.y?p:m,allPts[0]);
      // Draw critical points
      critX.forEach(cx=>{
        const cy=f(cx);
        const isMax=cy===globalMax.y||Math.abs(cy-globalMax.y)<0.001;
        const isMin=cy===globalMin.y||Math.abs(cy-globalMin.y)<0.001;
        svg.append("circle").attr("cx",xS(cx)).attr("cy",yS(cy)).attr("r",7).attr("fill",isMax?C.abs_max:isMin?C.abs_min:C.local).attr("stroke","var(--color-background-primary)").attr("stroke-width",2);
        svg.append("text").attr("x",xS(cx)).attr("y",yS(cy)+(isMax?-10:14)).attr("text-anchor","middle").attr("fill",isMax?C.abs_max:isMin?C.abs_min:C.local).attr("font-size",10).text(isMax?"Max":isMin?"Min":"CP");
      });
      // Draw endpoints
      endVals.forEach(({x,y})=>{
        const isMax=x===globalMax.x||Math.abs(y-globalMax.y)<0.001;
        const isMin=x===globalMin.x||Math.abs(y-globalMin.y)<0.001;
        svg.append("circle").attr("cx",xS(x)).attr("cy",yS(y)).attr("r",7).attr("fill",isMax?C.abs_max:isMin?C.abs_min:C.endpt).attr("stroke","var(--color-background-primary)").attr("stroke-width",2);
        svg.append("text").attr("x",xS(x)+(x===a?10:-10)).attr("y",yS(y)+(y>0?-10:14)).attr("text-anchor",x===a?"start":"end").attr("fill",isMax?C.abs_max:isMin?C.abs_min:C.endpt).attr("font-size",10).text(x===a?"a":"b");
      });
    };
    const ro=new ResizeObserver(draw);
    if(containerRef.current) ro.observe(containerRef.current);
    draw();
    return ()=>ro.disconnect();
  },[fnKey]);

  return (
    <div ref={containerRef}>
      <div style={{ display:"flex",gap:6,marginBottom:8 }}>
        {Object.entries(fns).map(([k,{label}])=>(
          <button key={k} onClick={()=>setFnKey(k)} style={{ padding:"3px 10px",borderRadius:14,fontSize:12,cursor:"pointer",border:`0.5px solid ${fnKey===k?"var(--color-border-info)":"var(--color-border-secondary)"}`,background:fnKey===k?"var(--color-background-info)":"transparent",color:fnKey===k?"var(--color-text-info)":"var(--color-text-secondary)" }}>{label}</button>
        ))}
      </div>
      <svg ref={svgRef} style={{ width:"100%",display:"block",borderRadius:8,background:"var(--color-background-secondary)" }}/>
      <p style={{ fontSize:11,color:"var(--color-text-tertiary)",marginTop:4 }}>
        Red = absolute max · Green = absolute min · Gold = other critical points · Purple = endpoints. Shaded = the closed interval [a,b].
      </p>
    </div>
  );
}

// ── Fermat's Theorem Proof ───────────────────────────────────────────────────
const PROOF_STEPS = [
  { tag:"Setup", tagStyle:{ bg:"#f0fdf4",text:"#166534",border:"#bbf7d0" }, instruction:"Suppose f has a local maximum at c. By definition, f(c) ≥ f(x) for all x near c.", math:"\\text{Assume: } f(c) \\geq f(x) \\text{ for all } x \\text{ in some open interval around } c.", note:"We assume f is differentiable at c.", why:null },
  { tag:"Two-sided limits", tagStyle:{ bg:"#eff6ff",text:"#1e40af",border:"#bfdbfe" }, instruction:"The derivative f′(c) exists. Compute it as a limit from both sides.", math:"f'(c) = \\lim_{h \\to 0} \\frac{f(c+h)-f(c)}{h}", note:"Since the limit exists, the left-hand and right-hand limits must be equal.", why:{ tag:"Why do both one-sided limits equal f′(c)?", explanation:"For a derivative to exist, the limit must be the same whether h approaches 0 from the left (h<0) or the right (h>0). We'll use each side to get an inequality, then conclude both inequalities force f′(c)=0.", why:null } },
  { tag:"Right limit (h>0)", tagStyle:{ bg:"#fff7ed",text:"#9a3412",border:"#fed7aa" }, instruction:"For small h>0: f(c+h) ≤ f(c), so f(c+h)−f(c) ≤ 0. Dividing by h>0 preserves the inequality.", math:"h>0: \\frac{f(c+h)-f(c)}{h} \\leq 0 \\quad\\Rightarrow\\quad \\lim_{h\\to 0^+}\\frac{f(c+h)-f(c)}{h} \\leq 0", note:"So f′(c) ≤ 0 from the right.", why:null },
  { tag:"Left limit (h<0)", tagStyle:{ bg:"#fff7ed",text:"#9a3412",border:"#fed7aa" }, instruction:"For small h<0: f(c+h) ≤ f(c), so f(c+h)−f(c) ≤ 0. Dividing by h<0 reverses the inequality.", math:"h<0: \\frac{f(c+h)-f(c)}{h} \\geq 0 \\quad\\Rightarrow\\quad \\lim_{h\\to 0^-}\\frac{f(c+h)-f(c)}{h} \\geq 0", note:"So f′(c) ≥ 0 from the left.", why:null },
  { tag:"Conclusion", tagStyle:{ bg:"#ecfdf5",text:"#065f46",border:"#6ee7b7" }, instruction:"f′(c) ≤ 0 AND f′(c) ≥ 0. The only number satisfying both is 0.", math:"f'(c) \\leq 0 \\text{ and } f'(c) \\geq 0 \\quad\\Rightarrow\\quad f'(c) = 0 \\qquad \\blacksquare", note:"The argument for a local minimum is identical — all inequalities reverse, same conclusion.", why:{ tag:"What does this prove?", explanation:"Fermat's Theorem: if f has a local extremum at c AND f is differentiable at c, then f′(c)=0. This tells us where to look for local extrema — only at places where f′=0 or f′ doesn't exist. But NOT every f′=0 point is an extremum (e.g. f(x)=x³ has f′(0)=0 but no extremum there).", why:null } },
];

const EXAMPLES = [
  {
    title:"Find absolute extrema of f(x) = x³−3x on [−2,2]",
    method:"Closed Interval Method",
    steps:[
      { label:"Step 1: Find f′(x) and critical points", math:"f'(x) = 3x^2 - 3 = 3(x^2-1) = 3(x-1)(x+1)", note:"Set f′=0: x=1 and x=−1. Both are in [−2,2]." },
      { label:"Step 2: Evaluate f at critical points and endpoints", math:"\\begin{array}{c|c} x & f(x) \\\\ \\hline -2 & (-2)^3-3(-2) = -8+6 = -2 \\\\ -1 & (-1)^3-3(-1) = -1+3 = 2 \\\\ 1 & (1)^3-3(1) = 1-3 = -2 \\\\ 2 & (2)^3-3(2) = 8-6 = 2 \\end{array}", note:"Compute f at x=−2, −1, 1, 2." },
      { label:"Step 3: Identify absolute max and min", math:"\\text{Absolute max} = 2 \\text{ at } x=-1 \\text{ and } x=2 \\\\ \\text{Absolute min} = -2 \\text{ at } x=-2 \\text{ and } x=1", note:"The largest value in the table is the absolute max. The smallest is the absolute min. Multiple points can share the extremum." },
    ],
    watchFor:"Do NOT stop at critical points. Always include the endpoints of the closed interval in your table. The absolute extremum can occur at an endpoint.",
  },
  {
    title:"Find absolute extrema of f(x) = x⁴−8x² on [−3,3]",
    method:"Closed Interval Method",
    steps:[
      { label:"Find f′(x) and critical points", math:"f'(x) = 4x^3 - 16x = 4x(x^2-4) = 4x(x-2)(x+2)", note:"x=0, x=2, x=−2. All in [−3,3]." },
      { label:"Table of values", math:"\\begin{array}{c|c} x & f(x) \\\\ \\hline -3 & 81-72=9 \\\\ -2 & 16-32=-16 \\\\ 0 & 0 \\\\ 2 & 16-32=-16 \\\\ 3 & 81-72=9 \\end{array}", note:"" },
      { label:"Identify extrema", math:"\\text{Absolute max} = 9 \\text{ at } x=-3 \\text{ and } x=3 \\text{ (endpoints!)}\\\\ \\text{Absolute min} = -16 \\text{ at } x=\\pm 2", note:"The absolute max occurs at the endpoints, not at any critical point." },
    ],
    watchFor:"This example shows that endpoints can give absolute maxima. Always include them.",
  },
  {
    title:"f(x) = sin(x) on [0, 2π] — all extrema",
    method:"Closed Interval Method",
    steps:[
      { label:"Find f′(x) and critical points", math:"f'(x) = \\cos(x) = 0 \\Rightarrow x = \\frac{\\pi}{2}, \\frac{3\\pi}{2}", note:"Both in [0,2π]." },
      { label:"Table of values", math:"\\begin{array}{c|c} x & f(x) \\\\ \\hline 0 & 0 \\\\ \\pi/2 & 1 \\\\ 3\\pi/2 & -1 \\\\ 2\\pi & 0 \\end{array}", note:"" },
      { label:"Identify extrema", math:"\\text{Absolute max} = 1 \\text{ at } x=\\pi/2 \\\\ \\text{Absolute min} = -1 \\text{ at } x=3\\pi/2", note:"" },
    ],
    watchFor:"For trig functions on a closed interval: always find where the derivative (cos for sin, −sin for cos) equals zero, and check those points plus the endpoints.",
  },
];

const card = { background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",border:"0.5px solid var(--color-border-tertiary)",marginBottom:8 };

export default function MaximaMinima({ params={} }) {
  const ready = useMath();
  const [tab, setTab] = useState("concepts");
  const [proofStep, setProofStep] = useState(0);
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

      <div style={{ ...card,borderLeft:"3px solid #A32D2D",borderRadius:0,background:"#FCEBEB",marginBottom:14 }}>
        <div style={{ fontSize:15,fontWeight:500,color:"#501313",marginBottom:4 }}>Maxima and Minima — Sections 4.3 + Absolute Extrema</div>
        <div style={{ fontSize:13,color:"#791F1F",lineHeight:1.7 }}>
          Finding where a function achieves its largest and smallest values is one of the central problems of calculus. The Extreme Value Theorem guarantees they exist on closed intervals. Fermat's Theorem tells us where to look. The Closed Interval Method gives the algorithm.
        </div>
      </div>

      <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:14 }}>
        {[["concepts","Concepts + graph","#A32D2D"],["evt","Extreme Value Theorem","#7F77DD"],["fermat","Fermat's Theorem (proof)","#1D9E75"],["method","Closed interval method","#BA7517"],["examples","Worked examples","#0891b2"]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setTab(k)} style={tabBtn(k,l,c)}>{l}</button>
        ))}
      </div>

      {tab==="concepts" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <ExtremaViz ready={ready}/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10 }}>
            {[
              { name:"Absolute maximum", def:"f(c) ≥ f(x) for ALL x in the domain", example:"Highest point on the entire graph", color:"#ef4444" },
              { name:"Absolute minimum", def:"f(c) ≤ f(x) for ALL x in the domain", example:"Lowest point on the entire graph", color:"#059669" },
              { name:"Local maximum", def:"f(c) ≥ f(x) for all x NEAR c", example:"Peak — higher than immediate neighbours", color:"#d97706" },
              { name:"Local minimum", def:"f(c) ≤ f(x) for all x NEAR c", example:"Valley — lower than immediate neighbours", color:"#7c3aed" },
              { name:"Critical point", def:"f′(c) = 0 OR f′(c) does not exist", example:"Candidate for local/absolute extremum", color:"#0891b2" },
            ].map(({name,def,example,color},i)=>(
              <div key={i} style={{ padding:"10px 12px",borderRadius:8,border:`1px solid ${color}`,background:color+"10" }}>
                <div style={{ fontSize:12,fontWeight:600,color,marginBottom:4 }}>{name}</div>
                <div style={{ fontSize:12,color:"var(--color-text-primary)",marginBottom:3 }}>{def}</div>
                <div style={{ fontSize:11,color:"var(--color-text-tertiary)" }}>{example}</div>
              </div>
            ))}
          </div>
          <WhyPanel why={{ tag:"Can an absolute max also be a local max?", explanation:"Yes — an absolute maximum is always also a local maximum (since f(c)≥f(x) for ALL x implies f(c)≥f(x) for x near c). But a local max is not necessarily an absolute max. A function can have many local maxima but only one absolute maximum value (though multiple points can share it).", why:null }} depth={0} ready={ready}/>
        </div>
      )}

      {tab==="evt" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ ...card,borderLeft:"3px solid #7F77DD",borderRadius:0,background:"#EEEDFE",marginBottom:12 }}>
            <div style={{ fontSize:14,fontWeight:500,color:"#26215C",marginBottom:6 }}>Extreme Value Theorem (EVT)</div>
            <M t={"\\text{If } f \\text{ is continuous on } [a,b], \\text{ then } f \\text{ attains both an} \\\\ \\text{absolute maximum and an absolute minimum on } [a,b]."} display ready={ready}/>
            <WhyPanel why={{ tag:"Why do we need closed interval AND continuity?", explanation:"Both conditions are essential. Without closed interval: f(x)=1/x on (0,1) — no maximum (approaches infinity near 0). Without continuity: f=1 for x<0, f=0 for x≥0 on [−1,1] — the max value 1 is not attained at any single point in [−1,1] due to the jump.", steps:[{text:"Open interval without continuity: f(x)=x on (0,1). Approaches 1 but never reaches it. No max."},{text:"Closed interval needed: f=x on [0,1]. Max is f(1)=1, min is f(0)=0. Attained."},{text:"Continuity needed on [a,b]: prevents jumps that skip over extreme values."}], why:null }} depth={0} ready={ready}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:8 }}>What EVT does and does NOT say</div>
            {[
              { does:"Guarantees max and min EXIST on [a,b]", doesnt:"Tell you WHERE they are" },
              { does:"Applies whenever f is continuous on [a,b]", doesnt:"Apply on open intervals" },
              { does:"Guarantee the extrema are at critical points or endpoints", doesnt:"Guarantee the only extrema are at critical points" },
            ].map(({does,doesnt},i)=>(
              <div key={i} style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:6 }}>
                <div style={{ padding:"6px 10px",borderRadius:6,background:"var(--color-background-success)",fontSize:12,color:"var(--color-text-success)" }}>✓ {does}</div>
                <div style={{ padding:"6px 10px",borderRadius:6,background:"var(--color-background-danger)",fontSize:12,color:"var(--color-text-danger)" }}>✗ {doesnt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="fermat" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ ...card,borderLeft:"3px solid #1D9E75",borderRadius:0,background:"#E1F5EE",marginBottom:12 }}>
            <div style={{ fontSize:14,fontWeight:500,color:"#085041",marginBottom:6 }}>Fermat's Theorem</div>
            <M t={"\\text{If } f \\text{ has a local extremum at } c \\text{ and } f \\text{ is differentiable at } c, \\text{ then } f'(c)=0."} display ready={ready}/>
            <div style={{ fontSize:13,color:"#0F6E56",marginTop:8,lineHeight:1.7 }}>
              This is why we look for zeros of f′ when finding extrema. But note: the converse is FALSE. f′(c)=0 does NOT guarantee an extremum (e.g. f(x)=x³ at c=0).
            </div>
          </div>
          <div style={{ display:"flex",gap:4,marginBottom:12 }}>
            {PROOF_STEPS.map((_,i)=>(
              <div key={i} onClick={()=>setProofStep(i)} style={{ flex:1,height:5,borderRadius:3,cursor:"pointer",background:i<proofStep?"var(--color-text-tertiary)":i===proofStep?"#1D9E75":"var(--color-border-tertiary)",transform:i===proofStep?"scaleY(1.5)":"scaleY(1)",transition:"background .2s" }}/>
            ))}
          </div>
          {(() => {
            const step = PROOF_STEPS[proofStep];
            const tc = step.tagStyle;
            return (
              <div style={{ background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden",marginBottom:10 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 18px",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)" }}>
                  <div style={{ width:28,height:28,borderRadius:"50%",background:"var(--color-text-primary)",color:"var(--color-background-primary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,flexShrink:0 }}>{proofStep+1}</div>
                  <span style={{ fontSize:11,fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",padding:"2px 9px",borderRadius:20,background:tc.bg,color:tc.text,border:`0.5px solid ${tc.border}` }}>{step.tag}</span>
                  <span style={{ marginLeft:"auto",fontSize:11,color:"var(--color-text-tertiary)" }}>{proofStep+1}/{PROOF_STEPS.length}</span>
                </div>
                <div style={{ padding:"14px 18px 0" }}>
                  <p style={{ fontSize:14,fontWeight:500,lineHeight:1.55,marginBottom:12 }}>{step.instruction}</p>
                  <div style={{ background:"var(--color-background-secondary)",borderRadius:8,padding:"16px 14px",textAlign:"center",overflowX:"auto",marginBottom:10 }}><M t={step.math} display ready={ready}/></div>
                  {step.note&&<p style={{ fontSize:12,color:"var(--color-text-secondary)",fontStyle:"italic",paddingLeft:10,borderLeft:"2px solid var(--color-border-secondary)",marginBottom:8 }}>{step.note}</p>}
                  <div style={{ paddingBottom:14 }}><WhyPanel why={step.why} depth={0} ready={ready}/></div>
                </div>
              </div>
            );
          })()}
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <button onClick={()=>setProofStep(s=>Math.max(0,s-1))} disabled={proofStep===0} style={{ flex:1,padding:8,borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"transparent",color:proofStep===0?"var(--color-text-tertiary)":"var(--color-text-secondary)",cursor:proofStep===0?"not-allowed":"pointer",fontSize:13 }}>← Back</button>
            <span style={{ fontSize:12,color:"var(--color-text-tertiary)",minWidth:60,textAlign:"center" }}>{proofStep+1}/{PROOF_STEPS.length}</span>
            <button onClick={()=>setProofStep(s=>Math.min(PROOF_STEPS.length-1,s+1))} disabled={proofStep===PROOF_STEPS.length-1} style={{ flex:1,padding:8,borderRadius:8,border:"0.5px solid #1D9E75",background:proofStep===PROOF_STEPS.length-1?"transparent":"#E1F5EE",color:proofStep===PROOF_STEPS.length-1?"var(--color-text-tertiary)":"#085041",cursor:proofStep===PROOF_STEPS.length-1?"not-allowed":"pointer",fontSize:13,fontWeight:500 }}>Next →</button>
          </div>
        </div>
      )}

      {tab==="method" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ ...card,borderLeft:"3px solid #BA7517",borderRadius:0,background:"var(--color-background-warning)",marginBottom:14 }}>
            <div style={{ fontSize:14,fontWeight:500,color:"var(--color-text-primary)",marginBottom:8 }}>The Closed Interval Method — The Algorithm</div>
            <div style={{ fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.7,marginBottom:10 }}>
              Use this whenever you need to find absolute max/min of a continuous function on [a,b]. Three steps, no exceptions.
            </div>
            {["Find f′(x). Set f′(x)=0 and solve. Also find where f′ does not exist. These are the critical points.","Evaluate f at every critical point IN [a,b] and at both endpoints x=a and x=b.","The largest value in your table is the absolute maximum. The smallest is the absolute minimum."].map((step,i)=>(
              <div key={i} style={{ display:"flex",gap:10,marginBottom:10 }}>
                <div style={{ minWidth:28,height:28,borderRadius:"50%",background:"#BA7517",color:"#fff",fontSize:13,fontWeight:700,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>{i+1}</div>
                <div style={{ fontSize:13,color:"var(--color-text-primary)",lineHeight:1.6,paddingTop:4 }}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:8 }}>Critical points — what counts</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {[{type:"f′(c) = 0",ex:"f(x)=x²−4x: f′=2x−4=0 → x=2",color:"#7F77DD"},{type:"f′(c) undefined",ex:"f(x)=x^(2/3): f′=(2/3)x^(−1/3) undefined at x=0",color:"#0891b2"}].map(({type,ex,color},i)=>(
                <div key={i} style={{ padding:"10px 12px",borderRadius:8,border:`1px solid ${color}`,background:color+"10" }}>
                  <div style={{ fontSize:12,fontWeight:600,color,marginBottom:4 }}>{type}</div>
                  <div style={{ fontSize:11,color:"var(--color-text-secondary)" }}>{ex}</div>
                </div>
              ))}
            </div>
            <WhyPanel why={{ tag:"Why do we include points where f′ doesn't exist?", explanation:"A corner or cusp (like |x| at x=0) has no derivative, but the function can still have a local extremum there. f(x)=|x| has a minimum at x=0 where f′ is undefined. Fermat's Theorem says: if f′ exists AND there's an extremum, then f′=0. But extrema can occur where f′ doesn't exist at all.", why:null }} depth={0} ready={ready}/>
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
          <div style={{ fontSize:14,fontWeight:500,marginBottom:4 }}>{ex.title}</div>
          <div style={{ fontSize:12,color:"var(--color-text-tertiary)",marginBottom:10,fontStyle:"italic" }}>Method: {ex.method}</div>
          {ex.steps.map((st,i)=>{
            if(i>reveal) return null;
            return (
              <div key={i} style={{ ...card,borderLeft:`3px solid ${i===ex.steps.length-1?"#1D9E75":"#BA7517"}`,borderRadius:0,animation:"sd .16s ease-out" }}>
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
              <div style={{ fontSize:13 }}>{ex.watchFor}</div>
            </div>
          )}
          {reveal>0&&<button onClick={()=>setReveal(0)} style={{ marginTop:8,padding:"4px 12px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"transparent",color:"var(--color-text-secondary)",cursor:"pointer",fontSize:12 }}>← Reset</button>}
        </div>
      )}
    </div>
  );
}