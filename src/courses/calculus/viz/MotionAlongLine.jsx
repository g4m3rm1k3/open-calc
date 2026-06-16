/**
 * MotionAlongLine.jsx
 *
 * Self-contained lesson: Motion Along a Line
 * Covers: position, velocity, acceleration; moving right/left/stopped;
 *         speed vs velocity; speeding up vs slowing down (sign of v·a);
 *         worked examples with full step-by-step.
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

// ── Motion animation ─────────────────────────────────────────────────────────
function MotionViz({ ready }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [t, setT] = useState(2);
  // s(t) = t³ − 6t² + 9t
  const s = t => t**3 - 6*t**2 + 9*t;
  const v = t => 3*t**2 - 12*t + 9;
  const a = t => 6*t - 12;

  useEffect(()=>{
    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const C = { bg:"var(--color-background-secondary)",axis:isDark?"#475569":"#94a3b8",grid:isDark?"#1e293b":"#f1f5f9",pos:isDark?"#38bdf8":"#0284c7",vel:isDark?"#34d399":"#059669",acc:isDark?"#fbbf24":"#d97706",pt:isDark?"#f472b6":"#db2777",text:isDark?"#94a3b8":"#64748b",zero:"#ef4444" };
      const W = containerRef.current?.clientWidth||500, H = 220;
      const td=[0,4.5], sd=[-2,5];
      const xS=d3.scaleLinear().domain(td).range([36,W-8]);
      const yS=d3.scaleLinear().domain(sd).range([H-8,8]);
      const svg=d3.select(svgRef.current); svg.selectAll("*").remove(); svg.attr("width",W).attr("height",H);
      // zero line
      svg.append("line").attr("x1",36).attr("y1",yS(0)).attr("x2",W-8).attr("y2",yS(0)).attr("stroke",C.zero).attr("stroke-width",1).attr("stroke-dasharray","4,3").attr("opacity",0.5);
      // Axes
      svg.append("line").attr("x1",36).attr("y1",yS(0)).attr("x2",W-8).attr("y2",yS(0)).attr("stroke",C.axis).attr("stroke-width",1.5);
      svg.append("line").attr("x1",xS(0)).attr("y1",8).attr("x2",xS(0)).attr("y2",H-8).attr("stroke",C.axis).attr("stroke-width",1.5);
      // Draw all three curves
      const drawC=(fn,col,w,dash)=>{
        const pts=[];
        for(let i=0;i<=200;i++){const ti=td[0]+i*(td[1]-td[0])/200;const y=fn(ti);if(isFinite(y)&&y>=sd[0]-0.5&&y<=sd[1]+0.5)pts.push([ti,y]);}
        if(pts.length<2)return;
        svg.append("path").datum(pts).attr("fill","none").attr("stroke",col).attr("stroke-width",w).attr("stroke-dasharray",dash||"none").attr("d",d3.line().x(d=>xS(d[0])).y(d=>yS(d[1])).curve(d3.curveCatmullRom));
      };
      drawC(s,C.pos,2.5); drawC(v,C.vel,2); drawC(a,C.acc,2,"5,3");
      // Current t marker
      [{ fn:s,col:C.pos },{ fn:v,col:C.vel },{ fn:a,col:C.acc }].forEach(({fn,col})=>{
        const y=fn(t);
        if(y>=sd[0]-0.5&&y<=sd[1]+0.5)
          svg.append("circle").attr("cx",xS(t)).attr("cy",yS(y)).attr("r",5).attr("fill",col).attr("stroke","var(--color-background-primary)").attr("stroke-width",2);
      });
      // t-axis labels
      [0,1,2,3,4].forEach(ti=>{
        svg.append("text").attr("x",xS(ti)).attr("y",yS(0)+14).attr("text-anchor","middle").attr("fill",C.text).attr("font-size",10).text(ti);
      });
      // Legend
      [{col:C.pos,lbl:"s(t) = t³−6t²+9t"},{col:C.vel,lbl:"v(t) = s′"},{col:C.acc,lbl:"a(t) = s″",dash:"5,3"}].forEach(({col,lbl,dash},i)=>{
        svg.append("line").attr("x1",40).attr("y1",16+i*16).attr("x2",56).attr("y2",16+i*16).attr("stroke",col).attr("stroke-width",2).attr("stroke-dasharray",dash||"none");
        svg.append("text").attr("x",62).attr("y",20+i*16).attr("fill",C.text).attr("font-size",11).text(lbl);
      });
    };
    const ro=new ResizeObserver(draw);
    if(containerRef.current) ro.observe(containerRef.current);
    draw();
    return ()=>ro.disconnect();
  },[t]);

  const vt = v(t), at = a(t), st = s(t);
  const moving = Math.abs(vt)>0.001 ? (vt>0?"Moving right (v>0)":"Moving left (v<0)") : "Stopped (v=0)";
  const speedingUp = vt*at > 0 ? "Speeding up (v and a same sign)" : vt*at < 0 ? "Slowing down (v and a opposite signs)" : "Constant speed or stopped";

  return (
    <div ref={containerRef}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
        <span style={{ fontSize:12,color:"var(--color-text-secondary)" }}>t = {t.toFixed(2)}</span>
        <input type="range" min={0} max={4.4} step={0.02} value={t} onChange={e=>setT(parseFloat(e.target.value))} style={{ flex:1,accentColor:"#f472b6" }}/>
      </div>
      <svg ref={svgRef} style={{ width:"100%",display:"block",borderRadius:8 }}/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginTop:8 }}>
        {[
          { label:"Position s(t)", val:st.toFixed(3), color:"#0284c7" },
          { label:"Velocity v(t)", val:vt.toFixed(3), color:"#059669" },
          { label:"Acceleration a(t)", val:at.toFixed(3), color:"#d97706" },
          { label:"Speed |v|", val:Math.abs(vt).toFixed(3), color:"#7c3aed" },
        ].map(({label,val,color},i)=>(
          <div key={i} style={{ padding:"8px 10px",borderRadius:8,background:"var(--color-background-secondary)",border:`1px solid ${color}33`,textAlign:"center" }}>
            <div style={{ fontSize:10,color:"var(--color-text-tertiary)",marginBottom:2 }}>{label}</div>
            <div style={{ fontSize:14,fontWeight:600,color }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex",gap:6,marginTop:6,flexWrap:"wrap" }}>
        <span style={{ fontSize:12,padding:"3px 10px",borderRadius:10,background:Math.abs(vt)>0.001?(vt>0?"var(--color-background-success)":"var(--color-background-danger)"):"var(--color-background-secondary)",color:Math.abs(vt)>0.001?(vt>0?"var(--color-text-success)":"var(--color-text-danger)"):"var(--color-text-secondary)" }}>{moving}</span>
        <span style={{ fontSize:12,padding:"3px 10px",borderRadius:10,background:"var(--color-background-warning)",color:"var(--color-text-warning)" }}>{speedingUp}</span>
      </div>
    </div>
  );
}

const EXAMPLES = [
  {
    title:"s(t) = t³ − 6t² + 9t — full motion analysis",
    steps:[
      { label:"Velocity v(t) = s′(t)", math:"v(t) = 3t^2 - 12t + 9 = 3(t^2-4t+3) = 3(t-1)(t-3)", note:"Factor to find zeros." },
      { label:"Acceleration a(t) = s″(t)", math:"a(t) = 6t - 12 = 6(t-2)", note:"Linear — zero at t=2." },
      { label:"When is particle stopped?", math:"v(t)=0 \\Rightarrow t=1 \\text{ and } t=3", note:"Two moments of rest." },
      { label:"Moving right vs left", math:"\\begin{array}{l}0<t<1: v>0 \\text{ (right)}\\\\1<t<3: v<0 \\text{ (left)}\\\\t>3: v>0 \\text{ (right)}\\end{array}", note:"Check sign of v between zeros." },
      { label:"Speeding up/slowing down", math:"\\begin{array}{l}0<t<1: v>0, a<0 \\Rightarrow \\text{slowing}\\\\1<t<2: v<0, a<0 \\Rightarrow \\text{speeding up (leftward)}\\\\2<t<3: v<0, a>0 \\Rightarrow \\text{slowing (leftward)}\\\\t>3: v>0, a>0 \\Rightarrow \\text{speeding up (rightward)}\\end{array}", note:"Same signs = speeding up. Opposite = slowing down." },
      { label:"Total distance on [0,4]", math:"s(0)=0,\\;s(1)=4,\\;s(3)=0,\\;s(4)=4 \\Rightarrow d = |4-0|+|0-4|+|4-0| = 12", note:"Must account for reversals — can't just use s(4)−s(0)." },
    ],
    watchFor:"Total distance ≠ s(4)−s(0). You must find every reversal point (v=0), compute position there, and add absolute distances between reversals.",
  },
];

const card = { background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",border:"0.5px solid var(--color-border-tertiary)",marginBottom:8 };

export default function MotionAlongLine({ params={} }) {
  const ready = useMath();
  const [tab, setTab] = useState("concepts");
  const [reveal, setReveal] = useState(0);
  const ex = EXAMPLES[0];

  const tabBtn = (key, label, color) => ({
    padding:"5px 13px",borderRadius:20,fontSize:12,cursor:"pointer",fontWeight:tab===key?500:400,
    border:`0.5px solid ${tab===key?color:"var(--color-border-secondary)"}`,
    background:tab===key?color+"22":"transparent",color:tab===key?color:"var(--color-text-secondary)",
  });

  return (
    <div style={{ fontFamily:"var(--font-sans)",padding:"4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ ...card,borderLeft:"3px solid #0891b2",borderRadius:0,background:"#ecfeff",marginBottom:14 }}>
        <div style={{ fontSize:15,fontWeight:500,color:"#0e7490",marginBottom:4 }}>Motion Along a Line</div>
        <div style={{ fontSize:13,color:"#0e7490",lineHeight:1.7 }}>
          Position s(t), velocity v(t)=s′(t), acceleration a(t)=s″(t). The derivative chain tells the complete story of how an object moves. Drag the slider below to watch all three quantities update simultaneously.
        </div>
      </div>

      <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:14 }}>
        {[["concepts","Key concepts","#0891b2"],["speeding","Speeding up/slowing down","#7F77DD"],["example","Full worked example","#1D9E75"]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setTab(k)} style={tabBtn(k,l,c)}>{l}</button>
        ))}
      </div>

      {tab==="concepts" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <MotionViz ready={ready}/>
          <div style={{ ...card,marginTop:10 }}>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:10 }}>The three derivative chain</div>
            <M t={"s(t) \\xrightarrow{\\frac{d}{dt}} v(t) = s'(t) \\xrightarrow{\\frac{d}{dt}} a(t) = v'(t) = s''(t)"} display ready={ready}/>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12 }}>
              {[{q:"Moving right?",a:"v(t) > 0",c:"#059669"},{q:"Moving left?",a:"v(t) < 0",c:"#ef4444"},{q:"Stopped?",a:"v(t) = 0",c:"#d97706"},{q:"Speeding up?",a:"v·a > 0 (same sign)",c:"#059669"},{q:"Slowing down?",a:"v·a < 0 (opposite)",c:"#ef4444"},{q:"Speed?",a:"|v(t)| (always ≥ 0)",c:"#7c3aed"}].map(({q,a,c},i)=>(
                <div key={i} style={{ padding:"8px 10px",borderRadius:8,border:`1px solid ${c}33`,background:"var(--color-background-primary)" }}>
                  <div style={{ fontSize:11,color:"var(--color-text-tertiary)",marginBottom:3 }}>{q}</div>
                  <div style={{ fontSize:12,fontWeight:600,color:c }}>{a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="speeding" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ ...card,borderLeft:"3px solid #7F77DD",borderRadius:0,background:"#EEEDFE",marginBottom:12 }}>
            <div style={{ fontSize:13,fontWeight:500,color:"#26215C",marginBottom:8 }}>Speed vs Velocity — a critical distinction</div>
            <M t={"\\text{Velocity: } v(t) = s'(t) \\quad \\text{(can be negative)}"} display ready={ready}/>
            <M t={"\\text{Speed: } |v(t)| = |s'(t)| \\quad \\text{(always non-negative)}"} display ready={ready}/>
            <div style={{ fontSize:13,color:"#3C3489",marginTop:8,lineHeight:1.7 }}>
              Velocity has direction (positive = right, negative = left). Speed is magnitude only. A car at −60 mph (backing up) has speed 60 mph, velocity −60 mph.
            </div>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:10 }}>Speeding up vs Slowing down — the sign rule</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}>
              {[{cond:"v > 0 and a > 0",result:"Speeding up (moving right, accelerating right)",color:"#059669"},{cond:"v < 0 and a < 0",result:"Speeding up (moving left, accelerating left)",color:"#059669"},{cond:"v > 0 and a < 0",result:"Slowing down (moving right, decelerating)",color:"#ef4444"},{cond:"v < 0 and a > 0",result:"Slowing down (moving left, decelerating)",color:"#ef4444"}].map(({cond,result,color},i)=>(
                <div key={i} style={{ padding:"8px 10px",borderRadius:8,border:`1px solid ${color}`,background:color+"12" }}>
                  <div style={{ fontSize:12,fontWeight:600,color,marginBottom:4 }}>{cond}</div>
                  <div style={{ fontSize:11,color:"var(--color-text-secondary)" }}>{result}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:13,fontWeight:500,marginBottom:6 }}>The one-line rule</div>
            <M t={"\\text{Speeding up iff } v(t) \\cdot a(t) > 0 \\qquad \\text{Slowing down iff } v(t) \\cdot a(t) < 0"} display ready={ready}/>
            <WhyPanel why={{ tag:"Why does same sign mean speeding up?", explanation:"Speed = |v|. Speeding up means |v| is increasing. If v>0 and a>0: v is increasing, so |v| = v is increasing — speeding up. If v<0 and a<0: v is becoming more negative (e.g. −2 → −3), so |v| is increasing — speeding up in the leftward direction. If signs are opposite, |v| decreases — slowing down.", steps:[{text:"Think of a number line. If v=−3 and a=−1, then v is heading toward −4. The speed |v| is going from 3 to 4 — increasing."},{text:"If v=−3 and a=+1, v is heading toward −2. Speed is going from 3 to 2 — decreasing."}], why:null }} depth={0} ready={ready}/>
          </div>
        </div>
      )}

      {tab==="example" && (
        <div style={{ animation:"sd .2s ease-out" }}>
          <div style={{ fontSize:14,fontWeight:500,marginBottom:10 }}>{ex.title}</div>
          {ex.steps.map((st,i)=>{
            if(i>reveal) return null;
            return (
              <div key={i} style={{ ...card,borderLeft:`3px solid ${i===ex.steps.length-1?"#1D9E75":"#0891b2"}`,borderRadius:0,animation:"sd .16s ease-out" }}>
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