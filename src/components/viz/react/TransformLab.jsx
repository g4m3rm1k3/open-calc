import { useState, useRef, useEffect, useCallback } from "react";

// ─── Theme — synced to the app's dark/light mode ──────────────────────────
const THEMES = {
  light: {
    bg: "#f8fafc", bg2: "#ffffff", bg3: "#f1f5f9",
    border: "#e2e8f0", border2: "#cbd5e1",
    text: "#1e293b", text2: "#475569", text3: "#94a3b8",
    accent: "#8b5cf6", accentBg: "#ede9fe", accentText: "#6d28d9",
    green: "#16a34a", greenBg: "#f0fdf4",
    red: "#ef4444", redBg: "#fef2f2",
    purple: "#9333ea", purpleBg: "#faf5ff",
    canvasBg: "#ffffff", canvasGrid: "rgba(148, 163, 184, 0.2)", canvasGridBold: "rgba(148, 163, 184, 0.4)",
    canvasAxis: "rgba(148, 163, 184, 0.6)", shapeOrig: "#cbd5e1", shapeMain: "#8b5cf6",
    shapeSolved: "#22c55e", code: "#1e293b", codeBg: "#f8fafc",
  },
  dark: {
    bg: "#0f172a", bg2: "#020617", bg3: "#1e293b",
    border: "#334155", border2: "#475569",
    text: "#f1f5f9", text2: "#cbd5e1", text3: "#94a3b8",
    accent: "#8b5cf6", accentBg: "#2e1065", accentText: "#c4b5fd",
    green: "#22c55e", greenBg: "#14532d",
    red: "#f87171", redBg: "#7f1d1d",
    purple: "#c084fc", purpleBg: "#581c87",
    canvasBg: "#020617", canvasGrid: "rgba(51, 65, 85, 0.5)", canvasGridBold: "rgba(71, 85, 105, 0.8)",
    canvasAxis: "rgba(148, 163, 184, 0.5)", shapeOrig: "#334155", shapeMain: "#8b5cf6",
    shapeSolved: "#22c55e", code: "#f1f5f9", codeBg: "#0f172a",
  },
};

const MONO = "ui-monospace, 'Cascadia Code', 'Fira Code', monospace";

// ─── Canvas constants ─────────────────────────────────────────────────────
const CW = 420, CH = 420;
const UNITS = 8;
const CELL = CW / (UNITS * 2);
const OX = CW / 2, OY = CH / 2;

function px(x) { return OX + x * CELL; }
function py(y) { return OY - y * CELL; }
function cpt([x, y]) { return [px(x), py(y)]; }
function fmtS(n, d = 2) { return Number(n).toFixed(d); }
function rad(d) { return d * Math.PI / 180; }
function applyMat([a, b, c, d], [x, y]) { return [a*x + b*y, c*x + d*y]; }

// ─── Canvas drawing helpers ───────────────────────────────────────────────
function drawGrid(ctx, T) {
  ctx.strokeStyle = T.canvasGrid; ctx.lineWidth = 0.5;
  for (let i = -UNITS; i <= UNITS; i++) {
    ctx.beginPath(); ctx.moveTo(px(i), py(-UNITS)); ctx.lineTo(px(i), py(UNITS)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px(-UNITS), py(i)); ctx.lineTo(px(UNITS), py(i)); ctx.stroke();
  }
  ctx.strokeStyle = T.canvasGridBold; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(px(-UNITS), py(0)); ctx.lineTo(px(UNITS), py(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px(0), py(-UNITS)); ctx.lineTo(px(0), py(UNITS)); ctx.stroke();
  ctx.fillStyle = T.text3; ctx.font = `9px ${MONO}`; ctx.textAlign = "center";
  for (let i = -UNITS; i <= UNITS; i += 2) {
    if (i === 0) continue;
    ctx.fillText(i, px(i), py(0) + 11);
    ctx.textAlign = "right"; ctx.fillText(i, px(0) - 5, py(i) + 3); ctx.textAlign = "center";
  }
}

function drawPoly(ctx, pts, stroke, fill, lw = 2, dashed = false, alpha = 1) {
  if (!pts || pts.length < 2) return;
  const cp = pts.map(cpt);
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.moveTo(cp[0][0], cp[0][1]);
  for (let i = 1; i < cp.length; i++) ctx.lineTo(cp[i][0], cp[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (dashed) ctx.setLineDash([5, 5]);
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
}

function drawVerts(ctx, pts, color, r = 4) {
  pts.forEach(pt => {
    const [x, y] = cpt(pt);
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  });
}

function drawVertLabels(ctx, pts, color, T, prefix = "v") {
  pts.forEach((pt, i) => {
    const [cx2, cy2] = cpt(pt);
    ctx.save(); ctx.font = `10px ${MONO}`;
    const label = `${prefix}${i}`;
    const w = ctx.measureText(label).width;
    const ox = pt[0] >= 0 ? 8 : -w - 8;
    const oy = pt[1] >= 0 ? -10 : 16;
    ctx.fillStyle = T.bg2 + "ee";
    ctx.beginPath(); ctx.roundRect(cx2+ox-2, cy2+oy-10, w+5, 14, 2); ctx.fill();
    ctx.fillStyle = color; ctx.textAlign = "left";
    ctx.fillText(label, cx2+ox, cy2+oy);
    ctx.restore();
  });
}

function drawArrow(ctx, from, to, color, lw = 1.5) {
  const [fx,fy]=cpt(from),[tx,ty]=cpt(to);
  const dx=tx-fx,dy=ty-fy,d=Math.sqrt(dx*dx+dy*dy);
  if(d<3)return;
  const ux=dx/d,uy=dy/d,hs=8;
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=lw; ctx.lineCap="round";
  ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(tx-ux*hs*.7,ty-uy*hs*.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx,ty);
  ctx.lineTo(tx-ux*hs-uy*hs*.4,ty-uy*hs+ux*hs*.4);
  ctx.lineTo(tx-ux*hs+uy*hs*.4,ty-uy*hs-ux*hs*.4);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function canvasTag(ctx, text, pt, color, bgColor, ox = 8, oy = -10) {
  const [x, y] = cpt(pt);
  ctx.save(); ctx.font = `10px ${MONO}`;
  const w = ctx.measureText(text).width;
  ctx.fillStyle = bgColor; ctx.beginPath();
  ctx.roundRect(x+ox-3, y+oy-10, w+7, 14, 2); ctx.fill();
  ctx.fillStyle = color; ctx.textAlign = "left"; ctx.fillText(text, x+ox, y+oy);
  ctx.restore();
}

// ─── Shape definitions ────────────────────────────────────────────────────
const SHAPE_DEFS = {
  arrow:   { label: "Arrow",   pts: [[0,0],[3,0],[3,1],[5,0],[3,-1],[3,0]] },
  house:   { label: "House",   pts: [[-2,0],[2,0],[2,2.5],[0,4.5],[-2,2.5]] },
  L:       { label: "L-shape", pts: [[0,0],[2,0],[2,1],[1,1],[1,3],[0,3]] },
  hex:     { label: "Hexagon", pts: Array.from({length:6},(_,i)=>{ const a=i*Math.PI/3-Math.PI/6; return [Math.cos(a)*3, Math.sin(a)*3]; }) },
};

// ─── Matrix display ───────────────────────────────────────────────────────
function Mtx({ data, label, color, highlight, footer, small }) {
  const fs = small ? 11 : 13;
  const pad = small ? "5px 8px" : "8px 12px";
  return (
    <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"flex-start", gap:2 }}>
      {label && <div style={{fontSize:9,letterSpacing:2,marginBottom:3,opacity:.6,fontFamily:MONO}}>{label}</div>}
      <div style={{ fontFamily:MONO, fontSize:fs,
        background:"var(--codeBg,#f4f3ef)", border:"1px solid var(--border,#e2e0d8)", borderRadius:5,
        padding:pad, lineHeight:1.9, whiteSpace:"nowrap" }}>
        {data.map((row, ri) => (
          <div key={ri} style={{display:"flex",gap:0,alignItems:"center"}}>
            <span style={{color:"var(--text3,#8a887e)",marginRight:3}}>{ri===0?"⎡":ri===data.length-1?"⎣":"⎢"}</span>
            {row.map((cell, ci) => {
              const isHl = highlight && highlight.some(h => h[0]===ri && h[1]===ci);
              return (
                <span key={ci} style={{
                  minWidth: small?28:38, textAlign:"right", paddingRight:ci<row.length-1?10:0,
                  color: isHl ? color : "var(--text2,#5a584f)",
                  background: isHl ? color+"22" : "transparent",
                  borderRadius: isHl ? 2 : 0, fontWeight: isHl ? "600":"normal",
                }}>
                  {typeof cell === "number" ? fmtS(cell,2) : cell}
                </span>
              );
            })}
            <span style={{color:"var(--text3,#8a887e)",marginLeft:3}}>{ri===0?"⎤":ri===data.length-1?"⎦":"⎥"}</span>
          </div>
        ))}
      </div>
      {footer && <div style={{fontSize:9,opacity:.5,marginTop:3,letterSpacing:1,fontFamily:MONO}}>{footer}</div>}
    </div>
  );
}

function MtxEq({ children }) {
  return <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>{children}</div>;
}

function Op({ children }) {
  return <span style={{fontSize:18,color:"var(--text3,#8a887e)",fontFamily:MONO,padding:"0 2px"}}>{children}</span>;
}

// ─── Slot input ───────────────────────────────────────────────────────────
function Slot({ value, onChange, placeholder, width=90, status, T }) {
  const col = status==="ok" ? T.green : status==="err" ? T.red : T.accent;
  const bg  = status==="ok" ? T.greenBg : status==="err" ? T.redBg : T.accentBg;
  return (
    <input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      spellCheck={false}
      style={{ width, padding:"2px 8px", fontFamily:MONO, fontSize:12,
        background:bg, border:`1.5px solid ${col}`, borderRadius:3,
        color:col, outline:"none", textAlign:"center",
        boxShadow: status==="ok" ? `0 0 0 2px ${col}22` : "none",
      }}
    />
  );
}

// ─── Code block ───────────────────────────────────────────────────────────
function CodeBlock({ lines, T }) {
  const typeColor = {
    kw: T.purple, fn: T.accent, num: T.green,
    comment: T.text3, plain: T.text, str: T.green, op: T.text3,
  };
  return (
    <div style={{ fontFamily:MONO, fontSize:12, lineHeight:1.9,
      background:T.codeBg, border:`1px solid ${T.border}`, borderRadius:6,
      padding:"14px 16px", overflowX:"auto" }}>
      {lines.map((line, li) => (
        <div key={li} style={{display:"flex",alignItems:"center",gap:0}}>
          <span style={{color:T.border,fontSize:9,minWidth:20,userSelect:"none",marginRight:12}}>
            {li+1}
          </span>
          <span style={{marginLeft:(line.indent||0)*16}}>
            {(line.parts||[]).map((p, pi) => (
              p.type === "slot" ? p.node :
              <span key={pi} style={{color:typeColor[p.type]||T.text}}>{p.text}</span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Hint box ─────────────────────────────────────────────────────────────
function HintBox({ text, T }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={()=>setOpen(o=>!o)} style={{ padding:"4px 12px", background:T.bg3,
        border:`1px solid ${T.border2}`, color:T.text3, fontSize:11, borderRadius:4,
        cursor:"pointer", fontFamily:MONO, letterSpacing:1 }}>
        {open?"▲ HIDE HINT":"▼ HINT"}
      </button>
      {open && (
        <div style={{ marginTop:6, padding:"10px 14px", background:T.accentBg,
          border:`1px solid ${T.accent}`, borderRadius:5, fontSize:11,
          color:T.accentText, lineHeight:1.7, fontFamily:MONO, whiteSpace:"pre-line" }}>
          {text}
        </div>
      )}
    </div>
  );
}

function Label({ children, T }) {
  return <div style={{fontSize:10,color:T.text3,letterSpacing:2,textTransform:"uppercase",
    marginBottom:2,fontFamily:MONO}}>{children}</div>;
}

// ─── Step 0: Place a Shape ────────────────────────────────────────────────
function Step0({ vals, set, errors, solved, T }) {
  const shapeKey = vals.shape || "house";
  const shape = SHAPE_DEFS[shapeKey];
  const ox = parseFloat(vals.ox)||0, oy2 = parseFloat(vals.oy)||0;
  const placed = shape.pts.map(([x,y])=>[x+ox, y+oy2]);

  return {
    canvas(ctx) {
      ctx.fillStyle = T.canvasBg; ctx.fillRect(0,0,CW,CH);
      drawGrid(ctx, T);
      drawPoly(ctx, shape.pts, T.shapeOrig, T.shapeOrig+"18", 1, true, 0.5);
      drawVertLabels(ctx, shape.pts, T.text3, T, "v");
      if (ox!==0||oy2!==0) {
        drawPoly(ctx, placed, T.shapeMain, T.shapeMain+"22", 2.5);
        drawVerts(ctx, placed, T.shapeMain, 4);
        drawVertLabels(ctx, placed, T.shapeMain, T, "p");
        drawArrow(ctx, [0,0], [ox,oy2], T.accent, 1.5);
        canvasTag(ctx, `t=[${ox}, ${oy2}]`, [ox/2, oy2/2], T.accent, T.bg2+"ee");
      }
      if(solved) {
        drawPoly(ctx, placed, T.shapeSolved, T.shapeSolved+"22", 2.5);
        drawVerts(ctx, placed, T.shapeSolved, 4);
      }
    },
    ui: (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <Label T={T}>1. Choose a shape</Label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
            {Object.entries(SHAPE_DEFS).map(([k,v])=>(
              <button key={k} onClick={()=>set("shape",k)}
                style={{ padding:"5px 12px", borderRadius:4, fontSize:11, cursor:"pointer",
                  fontFamily:MONO, letterSpacing:1,
                  background: k===shapeKey?T.accentBg:T.bg3,
                  border: `1px solid ${k===shapeKey?T.accent:T.border}`,
                  color: k===shapeKey?T.accent:T.text2 }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label T={T}>2. The shape as a matrix — each column is a vertex [x, y]ᵀ</Label>
          <div style={{marginTop:8,overflowX:"auto"}}>
            <MtxEq>
              <Mtx label="SHAPE MATRIX  S" data={[
                shape.pts.map(([x])=>x),
                shape.pts.map(([,y])=>y),
              ]} color={T.accent}
                footer={`${shape.pts.length} vertices → ${shape.pts.length} columns`}
              />
            </MtxEq>
          </div>
          <div style={{fontSize:11,color:T.text3,marginTop:8,lineHeight:1.7,fontFamily:MONO}}>
            Row 0 = all x-coordinates. Row 1 = all y-coordinates.<br/>
            Each column = one vertex. This is how every geometry engine stores shapes.
          </div>
        </div>

        <div>
          <Label T={T}>3. Place it — translate to position [ox, oy]</Label>
          <div style={{marginTop:8,display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:11,color:T.text2,fontFamily:MONO}}>ox =</span>
            <Slot T={T} value={vals.ox} onChange={v=>set("ox",v)} placeholder="0" width={60}
              status={!vals.ox?"":errors.ox?"err":"ok"} />
            <span style={{fontSize:11,color:T.text2,marginLeft:8,fontFamily:MONO}}>oy =</span>
            <Slot T={T} value={vals.oy} onChange={v=>set("oy",v)} placeholder="0" width={60}
              status={!vals.oy?"":errors.oy?"err":"ok"} />
          </div>
          {(errors.ox||errors.oy) && <div style={{fontSize:10,color:T.red,marginTop:4}}>{errors.ox||errors.oy}</div>}
          <div style={{fontSize:11,color:T.text3,marginTop:6,fontFamily:MONO}}>
            Try ox=3, oy=1 to place it in the upper-right quadrant.
          </div>
        </div>

        {(vals.ox||vals.oy) && (
          <div>
            <Label T={T}>Matrix notation: every column of S gets vector t added</Label>
            <div style={{marginTop:8,overflowX:"auto"}}>
              <MtxEq>
                <Mtx data={[shape.pts.map(([x])=>x),shape.pts.map(([,y])=>y)]} color={T.accent} small/>
                <Op>+</Op>
                <Mtx data={[shape.pts.map(()=>ox),shape.pts.map(()=>oy2)]} color={T.purple} small/>
                <Op>=</Op>
                <Mtx data={[placed.map(([x])=>x),placed.map(([,y])=>y)]} color={solved?T.green:T.accent} small/>
              </MtxEq>
            </div>
          </div>
        )}

        <HintBox T={T} text="Set ox somewhere between 2–4 and oy between 1–3. Watch the shape slide on the canvas." />
      </div>
    ),
  };
}

// ─── Step 1: Rotate ───────────────────────────────────────────────────────
function Step1({ vals, set, errors, solved, T, prevShape, prevOx, prevOy }) {
  const shape = SHAPE_DEFS[prevShape || "house"];
  const placed = shape.pts.map(([x,y])=>[x+prevOx,y+prevOy]);
  const deg = parseFloat(vals.deg||"");
  const validDeg = !isNaN(deg) && deg >= -360 && deg <= 360;
  const r = validDeg ? rad(deg) : 0;
  const c = Math.cos(r), s = Math.sin(r);
  const rotated = placed.map(pt => applyMat([c,-s,s,c], pt));
  const showRot = validDeg && Math.abs(deg) > 0.5;
  const nxOk = ["c*x-s*y","x*c-y*s"].includes(vals.nx?.trim().replace(/\s/g,""));
  const nyOk = ["s*x+c*y","x*s+y*c","c*y+s*x"].includes(vals.ny?.trim().replace(/\s/g,""));

  return {
    canvas(ctx) {
      ctx.fillStyle = T.canvasBg; ctx.fillRect(0,0,CW,CH);
      drawGrid(ctx, T);
      drawPoly(ctx, placed, T.shapeOrig, T.shapeOrig+"18", 1.5, true, 0.6);
      drawVertLabels(ctx, placed, T.text3, T, "p");
      if (showRot && (nxOk || nyOk)) {
        const partial = placed.map(([x,y])=>[nxOk?c*x-s*y:x, nyOk?s*x+c*y:y]);
        drawPoly(ctx, partial, T.shapeMain, T.shapeMain+"18", 2, false, 0.8);
        if(nxOk&&nyOk) { drawVerts(ctx, partial, T.shapeMain, 4); drawVertLabels(ctx, partial, T.shapeMain, T, "r"); }
      }
      if (solved && showRot) {
        drawPoly(ctx, rotated, T.shapeSolved, T.shapeSolved+"22", 2.5);
        drawVerts(ctx, rotated, T.shapeSolved, 4);
        drawVertLabels(ctx, rotated, T.shapeSolved, T, "r");
        ctx.save(); ctx.strokeStyle=T.accent+"66"; ctx.lineWidth=1.5; ctx.setLineDash([4,5]);
        ctx.beginPath(); ctx.arc(px(prevOx),py(prevOy), 28, 0, -r, r<0); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
        canvasTag(ctx,`θ=${deg}°`,[prevOx+0.8,prevOy+0.5],T.accent,T.bg2+"ee");
      }
    },
    ui: (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{padding:"12px 14px",background:T.bg3,borderRadius:6,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:10,color:T.text3,letterSpacing:2,marginBottom:4,fontFamily:MONO}}>YOUR SHAPE FROM STEP 1</div>
          <div style={{overflowX:"auto"}}>
            <MtxEq>
              <Mtx label="placed shape P" data={[placed.map(([x])=>x),placed.map(([,y])=>y)]} color={T.text2} small/>
            </MtxEq>
          </div>
        </div>

        <div>
          <Label T={T}>1. The rotation matrix for angle θ</Label>
          <div style={{marginTop:8,overflowX:"auto"}}>
            <MtxEq>
              <Mtx label="R(θ)" data={[["cos θ", "−sin θ"],["sin θ", " cos θ"]]} color={T.purple}/>
              {validDeg && (
                <><Op>=</Op>
                <Mtx label={`R(${deg}°)`} data={[[c,-s],[s,c]]} color={T.accent}
                  highlight={[[0,0],[0,1],[1,0],[1,1]]}
                  footer={`cos(${deg}°)=${fmtS(c,3)}  sin(${deg}°)=${fmtS(s,3)}`}/></>
              )}
            </MtxEq>
          </div>
        </div>

        <div>
          <Label T={T}>2. Set the rotation angle</Label>
          <div style={{display:"flex",gap:8,alignItems:"center",marginTop:6}}>
            <span style={{fontSize:11,color:T.text2,fontFamily:MONO}}>θ =</span>
            <Slot T={T} value={vals.deg} onChange={v=>set("deg",v)} placeholder="45" width={70}
              status={!vals.deg?"":errors.deg?"err":"ok"} />
            <span style={{fontSize:11,color:T.text2,fontFamily:MONO}}>degrees</span>
          </div>
          {errors.deg && <div style={{fontSize:10,color:T.red,marginTop:4}}>{errors.deg}</div>}
        </div>

        <div>
          <Label T={T}>3. Write the rotation formula — applied to every point [x, y]</Label>
          <div style={{marginTop:8}}>
            <CodeBlock T={T} lines={[
              {parts:[{text:"// R(θ) × [x, y]",type:"comment"}]},
              {parts:[{text:"function ",type:"kw"},{text:"rotatePoint",type:"fn"},{text:"([x, y], c, s) {",type:"plain"}]},
              {indent:1,parts:[{text:"return ",type:"kw"},{text:"[",type:"plain"},
                {type:"slot",node:<Slot key="nx" T={T} value={vals.nx} onChange={v=>set("nx",v)} placeholder="new x" width={110}
                  status={!vals.nx?"":nxOk?"ok":"err"}/>},
                {text:",",type:"plain"},
                {type:"slot",node:<Slot key="ny" T={T} value={vals.ny} onChange={v=>set("ny",v)} placeholder="new y" width={110}
                  status={!vals.ny?"":nyOk?"ok":"err"}/>},
                {text:"];",type:"plain"}]},
              {parts:[{text:"}",type:"plain"}]},
            ]}/>
          </div>
          {vals.nx && !nxOk && <div style={{fontSize:10,color:T.red,marginTop:4}}>new x: try  c*x - s*y</div>}
          {vals.ny && !nyOk && <div style={{fontSize:10,color:T.red,marginTop:4}}>new y: try  s*x + c*y</div>}
        </div>

        {solved && validDeg && (
          <div>
            <Label T={T}>Result: R(θ) × P</Label>
            <div style={{marginTop:8,overflowX:"auto"}}>
              <MtxEq>
                <Mtx data={[[c,-s],[s,c]]} color={T.purple} small/>
                <Op>×</Op>
                <Mtx data={[placed.map(([x])=>x),placed.map(([,y])=>y)]} color={T.text2} small/>
                <Op>=</Op>
                <Mtx data={[rotated.map(([x])=>x),rotated.map(([,y])=>y)]} color={T.green} small footer="rotated shape"/>
              </MtxEq>
            </div>
            <div style={{fontSize:11,color:T.text3,marginTop:8,lineHeight:1.7,fontFamily:MONO}}>
              Each column = R(θ) × that vertex. Your CAD tool does this to every vertex when you hit Rotate.
            </div>
          </div>
        )}

        <HintBox T={T} text={`new x = c*x - s*y  (cos·x minus sin·y)\nnew y = s*x + c*y  (sin·x plus cos·y)\nThese come directly from the rotation matrix rows.`} />
      </div>
    ),
  };
}

// ─── Step 2: Mirror ───────────────────────────────────────────────────────
function Step2({ vals, set, errors, solved, T, prevShape, prevOx, prevOy, prevDeg }) {
  const shape = SHAPE_DEFS[prevShape || "house"];
  const placed = shape.pts.map(([x,y])=>[x+prevOx,y+prevOy]);
  const pr = prevDeg ? rad(prevDeg) : 0;
  const pc = Math.cos(pr), ps = Math.sin(pr);
  const rotated = placed.map(pt=>applyMat([pc,-ps,ps,pc],pt));
  const mirrorChoice = vals.mirror || "";
  const mirrors = {
    y:  { label:"Mirror Y-axis",  M:[-1,0,0,1],  desc:"x → −x,  y → y" },
    x:  { label:"Mirror X-axis",  M:[1,0,0,-1],  desc:"x → x,   y → −y" },
    o:  { label:"Mirror Origin",  M:[-1,0,0,-1], desc:"x → −x,  y → −y  (180° rotation)" },
    d:  { label:"Mirror y=x",     M:[0,1,1,0],   desc:"x → y,   y → x  (diagonal flip)" },
  };
  const mDef = mirrors[mirrorChoice];
  const mirrored = mDef ? rotated.map(pt=>applyMat(mDef.M,pt)) : [];
  const nxOk = vals.nx?.trim().replace(/\s/g,"") === (mirrorChoice==="y"?"-x":mirrorChoice==="x"?"x":mirrorChoice==="o"?"-x":"y");
  const nyOk = vals.ny?.trim().replace(/\s/g,"") === (mirrorChoice==="y"?"y":mirrorChoice==="x"?"-y":mirrorChoice==="o"?"-y":"x");

  return {
    canvas(ctx) {
      ctx.fillStyle = T.canvasBg; ctx.fillRect(0,0,CW,CH);
      drawGrid(ctx, T);
      if(mirrorChoice==="y"){ ctx.save(); ctx.strokeStyle=T.accent+"44"; ctx.lineWidth=1.5; ctx.setLineDash([6,5]); ctx.beginPath(); ctx.moveTo(px(0),py(-UNITS)); ctx.lineTo(px(0),py(UNITS)); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
      if(mirrorChoice==="x"){ ctx.save(); ctx.strokeStyle=T.accent+"44"; ctx.lineWidth=1.5; ctx.setLineDash([6,5]); ctx.beginPath(); ctx.moveTo(px(-UNITS),py(0)); ctx.lineTo(px(UNITS),py(0)); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
      if(mirrorChoice==="d"){ ctx.save(); ctx.strokeStyle=T.accent+"44"; ctx.lineWidth=1.5; ctx.setLineDash([6,5]); ctx.beginPath(); ctx.moveTo(px(-UNITS),py(-UNITS)); ctx.lineTo(px(UNITS),py(UNITS)); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
      drawPoly(ctx, rotated, T.shapeOrig, T.shapeOrig+"18", 1.5, true, 0.6);
      drawVertLabels(ctx, rotated, T.text3, T, "r");
      if(mDef && (nxOk||nyOk)){
        const partial = rotated.map(([x,y])=>[nxOk?mDef.M[0]*x+mDef.M[1]*y:x, nyOk?mDef.M[2]*x+mDef.M[3]*y:y]);
        drawPoly(ctx, partial, T.shapeMain, T.shapeMain+"18", 2);
      }
      if(solved && mDef){
        drawPoly(ctx, mirrored, T.shapeSolved, T.shapeSolved+"22", 2.5);
        drawVerts(ctx, mirrored, T.shapeSolved, 4);
        drawVertLabels(ctx, mirrored, T.shapeSolved, T, "m");
        rotated.forEach((pt,i)=>{ drawArrow(ctx,pt,mirrored[i],T.accent+"66",1); });
      }
    },
    ui: (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{padding:"12px 14px",background:T.bg3,borderRadius:6,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:10,color:T.text3,letterSpacing:2,marginBottom:6,fontFamily:MONO}}>CURRENT SHAPE (after rotation)</div>
          <div style={{overflowX:"auto"}}>
            <MtxEq>
              <Mtx data={[rotated.map(([x])=>x),rotated.map(([,y])=>y)]} color={T.text2} small footer="rotated shape — this is what you'll mirror"/>
            </MtxEq>
          </div>
        </div>

        <div>
          <Label T={T}>1. Choose what to mirror across</Label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
            {Object.entries(mirrors).map(([k,v])=>(
              <button key={k} onClick={()=>set("mirror",k)}
                style={{ padding:"5px 12px", borderRadius:4, fontSize:11, cursor:"pointer",
                  fontFamily:MONO, letterSpacing:1,
                  background:k===mirrorChoice?T.accentBg:T.bg3,
                  border:`1px solid ${k===mirrorChoice?T.accent:T.border}`,
                  color:k===mirrorChoice?T.accent:T.text2 }}>
                {v.label}
              </button>
            ))}
          </div>
          {mDef && (
            <div style={{marginTop:8,overflowX:"auto"}}>
              <MtxEq>
                <Mtx label="Mirror matrix M" data={[[mDef.M[0],mDef.M[1]],[mDef.M[2],mDef.M[3]]]}
                  color={T.purple} footer={mDef.desc}/>
              </MtxEq>
            </div>
          )}
        </div>

        {mirrorChoice && (
          <div>
            <Label T={T}>2. Write the mirror formula for this axis</Label>
            <div style={{marginTop:8}}>
              <CodeBlock T={T} lines={[
                {parts:[{text:"function ",type:"kw"},{text:"mirrorPoint",type:"fn"},{text:"([x, y]) {",type:"plain"}]},
                {indent:1,parts:[{text:"return ",type:"kw"},{text:"[",type:"plain"},
                  {type:"slot",node:<Slot key="nx" T={T} value={vals.nx} onChange={v=>set("nx",v)} placeholder="new x" width={70}
                    status={!vals.nx?"":nxOk?"ok":"err"}/>},
                  {text:",",type:"plain"},
                  {type:"slot",node:<Slot key="ny" T={T} value={vals.ny} onChange={v=>set("ny",v)} placeholder="new y" width={70}
                    status={!vals.ny?"":nyOk?"ok":"err"}/>},
                  {text:"];",type:"plain"}]},
                {parts:[{text:"}",type:"plain"}]},
              ]}/>
            </div>
            {vals.nx&&!nxOk&&<div style={{fontSize:10,color:T.red,marginTop:4}}>new x: {mirrorChoice==="y"?"try -x":mirrorChoice==="x"?"try x":mirrorChoice==="o"?"try -x":"try y"}</div>}
            {vals.ny&&!nyOk&&<div style={{fontSize:10,color:T.red,marginTop:4}}>new y: {mirrorChoice==="y"?"try y":mirrorChoice==="x"?"try -y":mirrorChoice==="o"?"try -y":"try x"}</div>}
          </div>
        )}

        {solved && mDef && (
          <div>
            <Label T={T}>Result: M × rotated shape</Label>
            <div style={{marginTop:8,overflowX:"auto"}}>
              <MtxEq>
                <Mtx data={[[mDef.M[0],mDef.M[1]],[mDef.M[2],mDef.M[3]]]} color={T.purple} small/>
                <Op>×</Op>
                <Mtx data={[rotated.map(([x])=>x),rotated.map(([,y])=>y)]} color={T.text2} small/>
                <Op>=</Op>
                <Mtx data={[mirrored.map(([x])=>x),mirrored.map(([,y])=>y)]} color={T.green} small footer="mirrored"/>
              </MtxEq>
            </div>
          </div>
        )}

        <HintBox T={T} text={mDef ? `For "${mDef.label}": new x = ${mirrorChoice==="y"?"-x":mirrorChoice==="x"?"x":mirrorChoice==="o"?"-x":"y"}, new y = ${mirrorChoice==="y"?"y":mirrorChoice==="x"?"-y":mirrorChoice==="o"?"-y":"x"}` : "Pick a mirror axis above first."} />
      </div>
    ),
  };
}

// ─── Step 3: Chain Transforms ─────────────────────────────────────────────
function Step3({ vals, set, errors, solved, T, prevShape, prevOx, prevOy, prevDeg }) {
  const shape = SHAPE_DEFS[prevShape||"house"];
  const placed = shape.pts.map(([x,y])=>[x+prevOx,y+prevOy]);
  const pr = prevDeg ? rad(prevDeg) : 0;
  const pc = Math.cos(pr), ps = Math.sin(pr);
  const rotated = placed.map(pt=>applyMat([pc,-ps,ps,pc],pt));
  const sx = parseFloat(vals.sx)||1, sy = parseFloat(vals.sy)||1;
  const scaleM = [sx,0,0,sy];
  const scaled = rotated.map(pt=>applyMat(scaleM,pt));
  const chainM = [sx*pc, sx*(-ps), sy*ps, sy*pc];
  const chained = placed.map(pt=>applyMat(chainM,pt));
  const sxOk = vals.sx&&!isNaN(parseFloat(vals.sx))&&Math.abs(parseFloat(vals.sx))>0.1;
  const syOk = vals.sy&&!isNaN(parseFloat(vals.sy))&&Math.abs(parseFloat(vals.sy))>0.1;

  return {
    canvas(ctx) {
      ctx.fillStyle=T.canvasBg; ctx.fillRect(0,0,CW,CH);
      drawGrid(ctx,T);
      drawPoly(ctx,placed,T.shapeOrig,T.shapeOrig+"18",1,true,0.4);
      drawPoly(ctx,rotated,T.shapeOrig,T.shapeOrig+"18",1.5,true,0.7);
      canvasTag(ctx,"after rotate",rotated[0]||[0,0],T.text3,T.bg2+"cc",8,-12);
      if(sxOk||syOk){
        drawPoly(ctx,scaled,T.shapeMain,T.shapeMain+"1a",2.5);
        drawVerts(ctx,scaled,T.shapeMain,4);
      }
      if(solved){
        drawPoly(ctx,chained,T.shapeSolved,T.shapeSolved+"22",2.5);
        drawVerts(ctx,chained,T.shapeSolved,4);
        canvasTag(ctx,"S×R chained",chained[0]||[0,0],T.shapeSolved,T.bg2+"ee",8,-12);
      }
    },
    ui: (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{padding:"12px 14px",background:T.bg3,borderRadius:6,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:11,color:T.text2,lineHeight:1.7,fontFamily:MONO}}>
            In CAD you constantly chain transforms: <em>rotate then scale</em>, <em>translate then rotate</em>.
            Matrix multiplication lets you combine them into <strong>one matrix</strong> — applied in a single pass over all vertices.
          </div>
        </div>

        <div>
          <Label T={T}>1. Scale matrix — stretch x by sx, y by sy</Label>
          <div style={{display:"flex",gap:12,alignItems:"center",marginTop:8,flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:11,color:T.text2,fontFamily:MONO}}>sx =</span>
              <Slot T={T} value={vals.sx} onChange={v=>set("sx",v)} placeholder="1.5" width={60} status={!vals.sx?"":sxOk?"ok":"err"}/>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:11,color:T.text2,fontFamily:MONO}}>sy =</span>
              <Slot T={T} value={vals.sy} onChange={v=>set("sy",v)} placeholder="0.5" width={60} status={!vals.sy?"":syOk?"ok":"err"}/>
            </div>
            {sxOk&&syOk&&(
              <Mtx data={[[sx,0],[0,sy]]} color={T.accent} highlight={[[0,0],[1,1]]} footer="scale matrix S"/>
            )}
          </div>
        </div>

        {sxOk&&syOk&&(
          <>
            <div>
              <Label T={T}>2. Chain = S × R — one matrix for both transforms</Label>
              <div style={{marginTop:8,overflowX:"auto"}}>
                <MtxEq>
                  <Mtx label="S" data={[[sx,0],[0,sy]]} color={T.accent} small/>
                  <Op>×</Op>
                  <Mtx label="R" data={[[pc,-ps],[ps,pc]]} color={T.purple} small/>
                  <Op>=</Op>
                  <Mtx label="S×R" data={[[sx*pc,sx*(-ps)],[sy*ps,sy*pc]]}
                    color={T.green} small footer="apply this ONE matrix to every vertex"/>
                </MtxEq>
              </div>
              <div style={{fontSize:11,color:T.text3,marginTop:8,lineHeight:1.7,fontFamily:MONO}}>
                Two passes (rotate all points, then scale all points) collapse into one. This is why matrix multiplication exists.
              </div>
            </div>
            <div>
              <Label T={T}>3. Applied to your full shape</Label>
              <div style={{marginTop:8,overflowX:"auto"}}>
                <MtxEq>
                  <Mtx data={[[sx*pc,sx*(-ps)],[sy*ps,sy*pc]]} color={T.green} small/>
                  <Op>×</Op>
                  <Mtx data={[placed.map(([x])=>x),placed.map(([,y])=>y)]} color={T.text2} small/>
                  <Op>=</Op>
                  <Mtx data={[chained.map(([x])=>x),chained.map(([,y])=>y)]}
                    color={solved?T.green:T.text2} small footer="chained result"/>
                </MtxEq>
              </div>
            </div>
          </>
        )}

        <HintBox T={T} text="Try sx=1.5, sy=0.5 — stretches wide and squishes tall. The combined matrix encodes both at once."/>
      </div>
    ),
  };
}

// ─── Step definitions ─────────────────────────────────────────────────────
const STEP_DEFS = [
  {
    title: "Place a Shape",
    subtitle: "Vertices → Matrix → Translate",
    tag: "STEP 01",
    check(vals) { const ox=parseFloat(vals.ox),oy=parseFloat(vals.oy); return !isNaN(ox)&&!isNaN(oy)&&Math.abs(ox)>0.5&&Math.abs(oy)>=0; },
    errors(vals) { const ox=parseFloat(vals.ox),oy=parseFloat(vals.oy); const e={}; if(vals.ox&&isNaN(ox))e.ox="Enter a number"; if(vals.oy&&isNaN(oy))e.oy="Enter a number"; return e; },
  },
  {
    title: "Rotate the Shape",
    subtitle: "Rotation Matrix × Shape Matrix",
    tag: "STEP 02",
    check(vals) { const deg=parseFloat(vals.deg); const nxOk=["c*x-s*y","x*c-y*s"].includes(vals.nx?.trim().replace(/\s/g,"")); const nyOk=["s*x+c*y","x*s+y*c","c*y+s*x"].includes(vals.ny?.trim().replace(/\s/g,"")); return !isNaN(deg)&&Math.abs(deg)>0.5&&nxOk&&nyOk; },
    errors(vals) { const e={}; if(vals.deg&&isNaN(parseFloat(vals.deg)))e.deg="Enter a number in degrees"; return e; },
  },
  {
    title: "Mirror the Shape",
    subtitle: "Reflection Matrices",
    tag: "STEP 03",
    check(vals) { const m=vals.mirror; if(!m)return false; const expected={y:["-x","y"],x:["x","-y"],o:["-x","-y"],d:["y","x"]}; const [ex,ey]=expected[m]||[]; return vals.nx?.trim().replace(/\s/g,"")=== ex&&vals.ny?.trim().replace(/\s/g,"")=== ey; },
    errors(){return {};},
  },
  {
    title: "Chain Transforms",
    subtitle: "Matrix Multiplication = Composed Transforms",
    tag: "STEP 04",
    check(vals) { const sx=parseFloat(vals.sx),sy=parseFloat(vals.sy); return !isNaN(sx)&&!isNaN(sy)&&Math.abs(sx)>0.1&&Math.abs(sy)>0.1; },
    errors(){return {};},
  },
];

// ─── Main export ──────────────────────────────────────────────────────────
export default function TransformLab({ params = {} }) {
  // Sync dark mode to the app's theme
  const isDark = () => typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // startStep lets lessons open on a specific step (e.g. la2-002 opens on chain step)
  const startStep = Math.min(Math.max(parseInt(params.startStep ?? 0), 0), 3);
  const [stepIdx, setStepIdx] = useState(startStep);
  const [completed, setCompleted] = useState(new Set());
  const [stepVals, setStepVals] = useState([{},{},{},{}]);
  const canvasRef = useRef(null);

  const T = dark ? THEMES.dark : THEMES.light;
  const stepDef = STEP_DEFS[stepIdx];

  function setVal(k,v) {
    setStepVals(sv=>sv.map((s,i)=>i===stepIdx?{...s,[k]:v}:s));
  }

  const vals = stepVals[stepIdx];
  const errors = stepDef.errors(vals);
  const solved = stepDef.check(vals);

  const shape0 = stepVals[0].shape||"house";
  const ox0 = parseFloat(stepVals[0].ox)||0;
  const oy0 = parseFloat(stepVals[0].oy)||0;
  const deg1 = parseFloat(stepVals[1].deg)||0;

  const stepContent = (() => {
    const props = { vals, set:setVal, errors, solved, T,
      prevShape:shape0, prevOx:ox0, prevOy:oy0, prevDeg:deg1 };
    if(stepIdx===0) return Step0(props);
    if(stepIdx===1) return Step1(props);
    if(stepIdx===2) return Step2(props);
    if(stepIdx===3) return Step3(props);
    return { canvas:()=>{}, ui:<div/> };
  })();

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,CW,CH);
    stepContent.canvas(ctx);
  });

  useEffect(()=>{
    if(solved) setCompleted(s=>new Set([...s,stepIdx]));
  },[solved,stepIdx]);

  return (
    <div style={{ background:T.bg, display:"flex", flexDirection:"column",
      fontFamily:MONO, color:T.text, borderRadius:8, overflow:"hidden",
      border:`1px solid ${T.border}` }}>

      {/* Step tabs */}
      <div style={{ display:"flex", alignItems:"center", padding:"0 16px", height:44,
        borderBottom:`1px solid ${T.border}`, background:T.bg2, gap:4 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:T.accent, marginRight:8 }}>
          TRANSFORM LAB
        </div>
        <div style={{ flex:1 }}/>
        {STEP_DEFS.map((s,i)=>{
          const done=completed.has(i), active=i===stepIdx;
          return (
            <button key={i} onClick={()=>setStepIdx(i)}
              style={{ padding:"5px 12px", borderRadius:4, fontSize:9, letterSpacing:1,
                fontFamily:MONO, cursor:"pointer", border:"none",
                background: active?T.accent:T.bg3,
                color: active?T.bg:done?T.green:T.text3,
                fontWeight: active?"700":"400" }}>
              {done&&!active?"✓ ":""}{s.tag}
            </button>
          );
        })}
      </div>

      {/* Body — canvas left, UI right */}
      <div style={{ display:"flex", minHeight:0, flexWrap:"wrap" }}>

        {/* Canvas panel */}
        <div style={{ flexShrink:0, borderRight:`1px solid ${T.border}`, background:T.canvasBg }}>
          <canvas ref={canvasRef} width={CW} height={CH} style={{ display:"block" }}/>
          <div style={{ padding:"8px 12px", borderTop:`1px solid ${T.border}`,
            display:"flex", gap:12, flexWrap:"wrap" }}>
            {[
              { color:T.shapeOrig, label:"ghost/original" },
              { color:T.shapeMain, label:"in progress" },
              { color:T.shapeSolved, label:"solved" },
              { color:T.accent, label:"transform" },
            ].map(({color,label})=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:color}}/>
                <span style={{fontSize:9,color:T.text3,letterSpacing:1}}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex:1, minWidth:280, display:"flex", flexDirection:"column", overflowY:"auto" }}>
          {/* Step header */}
          <div style={{ padding:"14px 18px 10px", borderBottom:`1px solid ${T.border}`,
            background:T.bg2, flexShrink:0 }}>
            <div style={{ fontSize:9, color:T.accent, letterSpacing:3, marginBottom:4 }}>
              {stepDef.tag}  ·  {stepIdx+1} of {STEP_DEFS.length}
            </div>
            <div style={{ fontSize:16, fontWeight:700, letterSpacing:1, marginBottom:2 }}>
              {stepDef.title}
            </div>
            <div style={{ fontSize:11, color:T.text3, letterSpacing:1 }}>{stepDef.subtitle}</div>
          </div>

          {/* Step UI */}
          <div style={{ padding:"16px 18px", flex:1 }}>{stepContent.ui}</div>

          {/* Status bar + nav */}
          <div style={{ padding:"12px 18px", borderTop:`1px solid ${T.border}`,
            background:T.bg2, flexShrink:0, display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0,
                background: solved?T.green:T.border2,
                boxShadow: solved?`0 0 8px ${T.green}`:"none", transition:"all .3s" }}/>
              <span style={{ fontSize:11, color:solved?T.green:T.text3 }}>
                {solved ? "Step complete — great work." : "Fill in the fields above to continue."}
              </span>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {stepIdx > 0 && (
                <button onClick={()=>setStepIdx(i=>i-1)}
                  style={{ padding:"7px 14px", borderRadius:4, fontSize:11, cursor:"pointer",
                    fontFamily:MONO, letterSpacing:1, background:T.bg3,
                    border:`1px solid ${T.border}`, color:T.text2 }}>
                  ← BACK
                </button>
              )}
              <button onClick={()=>{ if(solved&&stepIdx<STEP_DEFS.length-1) setStepIdx(i=>i+1); }}
                disabled={!solved}
                style={{ padding:"7px 16px", borderRadius:4, fontSize:11,
                  cursor:solved?"pointer":"default", fontFamily:MONO, letterSpacing:1,
                  fontWeight:solved?"700":"400",
                  background: solved?T.accent:T.bg3,
                  border: `1px solid ${solved?T.accent:T.border}`,
                  color: solved?T.bg:T.text3 }}>
                {stepIdx===STEP_DEFS.length-1?"COMPLETE ✓":"NEXT STEP →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
