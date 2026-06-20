const sim2_010 = {
  id: "sim2-010",
  slug: "capstone",
  chapter: "sim2",
  order: 10,
  title: "Capstone — Full Plotter",
  subtitle:
    "Assemble everything — dynamic viewport, multiple colour-coded traces, analysis overlays, an animated time parameter, and a presets library — into a polished, self-contained graphing calculator.",
  tags: [
    "capstone",
    "plotter",
    "animation",
    "presets",
    "multiple functions",
    "viewport",
    "analysis",
    "canvas",
  ],
  timeToComplete: 50,
  coreConcept:
    "The capstone plotter is a composition of independent tools: the viewport engine (Lesson 8) provides w2c and pan/zoom; the trace loop (Lesson 7) draws multiple expressions; the analysis layer (Lesson 9) adds derivative and zeros; and the rAF loop (Lesson 6) animates a time parameter t in any expression.",

  hook: {
    question:
      "Every graphing calculator — from a Ti-84 to Desmos — is built from the same handful of primitives you have written over the past nine lessons. What does it take to assemble them into a cohesive tool?",
    realWorldContext:
      "The architecture you finalise here is identical to production plotting tools: a state object (functions, viewport, settings), a pure `render(state)` function that redraws everything, and event handlers that mutate state and call `render`. Desmos, GeoGebra, and matplotlib all share this shape. Learning to recognise it means you can read and extend any of them.",
  },

  intuition: {
    prose: [
      "**State + render.** The cleanest architecture holds all mutable state in one object: `{ fns, vp, showTangent, showZeros, x0, t, running }`. The `render()` function reads that object and redraws everything from scratch. Event handlers mutate state and call `render()`. With this shape, adding a new feature is just adding a new field to state and a new drawing step inside `render()`.",
      "**The t parameter adds time.** `makeFunc` already accepts two arguments: `x` and `t`. For static plots `t = 0`. For animated plots, `t` increments via the rAF loop using the delta-time pattern from Lesson 6. Expressions like `sin(x - t)` produce a travelling wave; `sin(x) * cos(t)` produce a pulsing amplitude. Time-varying expressions are drawn identically to static ones — the loop does not know which expressions use `t` and which ignore it.",
      "**Presets make the plotter inviting.** A preset is just a name paired with an array of `{expr, color}` objects and an optional viewport. Clicking a preset button replaces `state.fns` with the preset's functions and optionally resets the viewport. A gallery of interesting presets — Lissajous, damped oscillator, Fourier approximation — turns a blank tool into a teaching instrument.",
      "**Graceful error handling.** `makeFunc` already returns `NaN` for domain errors. At the UI level, wrap the `Add` button in a try/catch: if `makeFunc(expr)(0, 0)` returns `NaN` for several test values, show an inline error rather than silently adding a blank trace. This is the difference between a toy and a tool.",
      "**Separation into helpers keeps `render()` short.** Extract `drawAxesAndTicks()`, `plotAllTraces()`, `drawTangent()`, `drawZeros()` as separate functions each reading from `state`. `render()` then reads as a clear sequence of drawing steps — easy to extend, easy to debug.",
    ],
    callouts: [
      {
        type: "sequencing",
        title: "Lesson 10 of 10 — Capstone",
        body: "**All previous lessons converge here.**\n- Lesson 6: rAF animation loop + delta-time pattern (for the `t` parameter)\n- Lesson 7: Multi-function array + legend\n- Lesson 8: Dynamic viewport — `w2c`, tick marks, zoom, pan\n- Lesson 9: Central-difference derivative, tangent line, zero-crossing scan",
      },
      {
        type: "definition",
        title: "t — The Time Parameter",
        body: "Expressions can use `t` as well as `x`. When the animation loop runs:\n\n```js\nfunction loop(ts) {\n  const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0\n  lastTs = ts; state.t += dt\n  render(); animId = requestAnimationFrame(loop)\n}\n```\n\n`sin(x - t)` produces a rightward-travelling wave. `sin(x) * cos(t)` pulses in amplitude.",
      },
      {
        type: "procedure",
        title: "Preset Structure",
        body: "```js\nconst PRESETS = [\n  { name: 'Sine',     fns: [{expr:'sin(x)', color:'#0ea5e9'}] },\n  { name: 'Wave',     fns: [{expr:'sin(x-t)',color:'#0ea5e9'}] },\n  { name: 'Fourier',  fns: [\n    {expr:'sin(x)',       color:'#0ea5e9'},\n    {expr:'sin(3*x)/3',   color:'#f59e0b'},\n    {expr:'sin(5*x)/5',   color:'#10b981'},\n  ]},\n]\n```\nActivating a preset: `state.fns = preset.fns.map(fn => ({...fn, _f: makeFunc(fn.expr)}))`.",
      },
      {
        type: "warning",
        title: "Cancel rAF Before Rebuilding State",
        body: "If the user switches presets while the animation is running, cancel the old rAF loop before replacing `state.fns`. Failing to cancel leaves an orphaned loop still calling `render()` with stale state. Pattern: `if (animId) { cancelAnimationFrame(animId); animId = null }`.",
      },
      {
        type: "insight",
        title: "render() as a Pure Snapshot",
        body: "`render()` reads `state` but does not modify it (except through the rAF loop incrementing `state.t`). This makes it safe to call `render()` from anywhere — button click, slider input, resize event — without side effects. The canvas always reflects the current state exactly.",
      },
      {
        type: "strategy",
        title: "Build Cell by Cell",
        body: "Start with the minimal plotter (Cell 1 — viewport + traces). Add analysis overlays (Cell 2). Add animation (Cell 3). Add presets (Cell 4). Each cell is a self-contained increment — if Cell 3 breaks, Cell 2 still works. This layered approach is how real tools are built: ship a working core, then add features.",
      },
    ],
    visualizations: [
      {
        id: "SimNotebook",
        title: "Capstone Plotter — Four Cells",
        mathBridge:
          "Each cell adds one layer to the final plotter. Cell 1: core plotter. Cell 2: analysis overlays. Cell 3: animated t parameter. Cell 4: presets library. By Cell 4 you have a complete graphing calculator in ~200 lines.",
        initialProps: {
          initialCells: [
            {
              id: 1,
              mode: "html",
              cellTitle: "Core Plotter — Viewport + Multiple Traces",
              prose: [
                "The foundation: a dynamic viewport with zoom/pan, multiple colour-coded traces with add/remove, and a legend with visibility toggles. All lessons 7 and 8 in one widget.",
                "Notice how `state` holds everything and `render()` reads it. Neither function modifies the other's concerns.",
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:8px;display:flex;flex-direction:column;gap:5px;overflow:hidden}
    .row{display:flex;gap:5px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:80px;padding:4px 7px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:12px}
    input[type=color]{width:28px;height:26px;padding:1px;border:1px solid var(--border);border-radius:4px;cursor:pointer}
    button{padding:3px 10px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:12px}
    button:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface);cursor:grab}
    canvas.drag{cursor:grabbing}
    .legend{display:flex;flex-direction:column;gap:2px;flex-shrink:0;max-height:60px;overflow-y:auto}
    .leg{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text)}
    .leg.off .lx{color:var(--muted);text-decoration:line-through}
    .sw{width:10px;height:10px;border-radius:2px;flex-shrink:0}
    .rm{font-size:10px;padding:0 4px;border-radius:3px;margin-left:auto;border:1px solid var(--border);background:var(--surface2);color:var(--muted);cursor:pointer}
    .rm:hover{color:#ef4444}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="ei" type="text" value="sin(x)" placeholder="expr">
      <input id="ci" type="color" value="#a855f7">
      <button id="add">+</button>
      <button id="zin">＋</button><button id="zout">－</button><button id="home">⌂</button>
    </div>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const DEFAULT={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
const state={
  fns:[
    {expr:'sin(x)',    color:'#0ea5e9',visible:true,_f:null},
    {expr:'cos(x)/2',  color:'#f59e0b',visible:true,_f:null},
  ],
  vp:{...DEFAULT},
}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
state.fns.forEach(fn=>fn._f=makeFunc(fn.expr))
function w2c(mx,my){const{xMin,xMax,yMin,yMax}=state.vp;return[(mx-xMin)/(xMax-xMin)*W, H-(my-yMin)/(yMax-yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function niceStep(range,n){const r=range/n,m=Math.pow(10,Math.floor(Math.log10(r))),f=r/m;return(f<1.5?1:f<3.5?2:f<7.5?5:10)*m}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}
function zoom(factor){const{xMin,xMax,yMin,yMax}=state.vp,cx=(xMin+xMax)/2,cy=(yMin+yMax)/2,hw=(xMax-xMin)/2*factor,hh=(yMax-yMin)/2*factor;state.vp={xMin:cx-hw,xMax:cx+hw,yMin:cy-hh,yMax:cy+hh};render()}

let drag=null
cv.addEventListener('mousedown',e=>{drag={sx:e.offsetX,sy:e.offsetY,vp:{...state.vp}};cv.classList.add('drag')})
cv.addEventListener('mousemove',e=>{if(!drag)return;const dpx=e.offsetX-drag.sx,dpy=e.offsetY-drag.sy,xr=drag.vp.xMax-drag.vp.xMin,yr=drag.vp.yMax-drag.vp.yMin;state.vp={xMin:drag.vp.xMin-dpx/W*xr,xMax:drag.vp.xMax-dpx/W*xr,yMin:drag.vp.yMin+dpy/H*yr,yMax:drag.vp.yMax+dpy/H*yr};render()})
cv.addEventListener('mouseup',()=>{drag=null;cv.classList.remove('drag')})
cv.addEventListener('mouseleave',()=>{drag=null;cv.classList.remove('drag')})

function drawAxes(C){
  const{xMin,xMax,yMin,yMax}=state.vp
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xs=niceStep(xMax-xMin,8); ctx.fillStyle=C.muted; ctx.font='10px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(xMin/xs)*xs;x<=xMax+xs*0.01;x+=xs){
    if(Math.abs(x)<xs*0.001) continue
    const px=w2c(x,0)[0]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke()
    ctx.fillText(fmt(x),px,Math.min(oy+13,H-3))
  }
  const ys=niceStep(yMax-yMin,6); ctx.textAlign='right'
  for(let y=Math.ceil(yMin/ys)*ys;y<=yMax+ys*0.01;y+=ys){
    if(Math.abs(y)<ys*0.001) continue
    const py=w2c(0,y)[1]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke()
    ctx.fillText(fmt(y),Math.max(ox-4,26),py+4)
  }
}

function plotTraces(){
  for(const fn of state.fns){
    if(!fn.visible) continue
    ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
    let first=true
    for(let i=0;i<=W;i++){
      const mx=state.vp.xMin+(i/W)*(state.vp.xMax-state.vp.xMin),my=fn._f(mx,0)
      if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
      const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
    }
    ctx.stroke()
  }
}

function render(){
  const C=getC(); ctx.clearRect(0,0,W,H); drawAxes(C); plotTraces()
  app.querySelector('#leg').innerHTML=state.fns.map((fn,i)=>
    '<div class="leg'+(fn.visible?'':' off')+'">'+
    '<input type="checkbox" data-i="'+i+'"'+(fn.visible?' checked':'')+'>'+
    '<span class="sw" style="background:'+fn.color+'"></span>'+
    '<span class="lx">y = '+fn.expr+'</span>'+
    '<button class="rm" data-i="'+i+'">×</button></div>'
  ).join('')
  app.querySelectorAll('input[type=checkbox][data-i]').forEach(cb=>cb.addEventListener('change',()=>{state.fns[parseInt(cb.dataset.i)].visible=cb.checked;render()}))
  app.querySelectorAll('.rm').forEach(btn=>btn.addEventListener('click',()=>{state.fns.splice(parseInt(btn.dataset.i),1);render()}))
}

app.querySelector('#add').addEventListener('click',()=>{const e=app.querySelector('#ei').value.trim(),c=app.querySelector('#ci').value;if(!e)return;state.fns.push({expr:e,color:c,visible:true,_f:makeFunc(e)});render()})
app.querySelector('#zin').addEventListener('click',()=>zoom(0.7))
app.querySelector('#zout').addEventListener('click',()=>zoom(1/0.7))
app.querySelector('#home').addEventListener('click',()=>{state.vp={...DEFAULT};render()})
render()`,
            },
            {
              id: 2,
              mode: "html",
              cellTitle: "Add Analysis Overlays",
              prose: [
                "Layer derivative and zero-crossing tools on top of the core plotter. A checkbox panel toggles each overlay independently. The tangent always applies to the first visible trace.",
                "The overlays are drawn after the traces — they appear on top without any special layering code.",
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:8px;display:flex;flex-direction:column;gap:5px;overflow:hidden}
    .row{display:flex;gap:5px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:80px;padding:4px 7px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:12px}
    input[type=range]{flex:1;max-width:140px;accent-color:var(--accent)}
    button{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:12px}
    button:hover{background:var(--accent-bg)}
    label{font-size:11px;color:var(--text);display:flex;align-items:center;gap:3px}
    .kv{font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface);cursor:grab}
    canvas.drag{cursor:grabbing}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="ei" type="text" value="sin(x)*x/3" placeholder="expr">
      <button id="plot">Plot</button>
      <button id="zin">＋</button><button id="zout">－</button><button id="home">⌂</button>
    </div>
    <div class="row">
      <label><input type="checkbox" id="showTan" checked> Tangent</label>
      <label><input type="checkbox" id="showZeros" checked> Zeros</label>
      <span class="kv">x₀</span>
      <input type="range" id="sl" min="-7" max="7" step="0.05" value="1">
      <span class="kv" id="info">—</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const DEFAULT={xMin:-7,xMax:7,yMin:-4,yMax:4}
const state={vp:{...DEFAULT},expr:'sin(x)*x/3',f:null}
state.f=makeFunc(state.expr)

function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
function w2c(mx,my){const{xMin,xMax,yMin,yMax}=state.vp;return[(mx-xMin)/(xMax-xMin)*W,H-(my-yMin)/(yMax-yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function niceStep(range,n){const r=range/n,m=Math.pow(10,Math.floor(Math.log10(r))),f=r/m;return(f<1.5?1:f<3.5?2:f<7.5?5:10)*m}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}
function zoom(factor){const{xMin,xMax,yMin,yMax}=state.vp,cx=(xMin+xMax)/2,cy=(yMin+yMax)/2,hw=(xMax-xMin)/2*factor,hh=(yMax-yMin)/2*factor;state.vp={xMin:cx-hw,xMax:cx+hw,yMin:cy-hh,yMax:cy+hh};render()}
const H_STEP=0.001
function deriv(f,x){return(f(x+H_STEP,0)-f(x-H_STEP,0))/(2*H_STEP)}
function findZeros(f,xMin,xMax,steps){const z=[];let px=xMin,py=f(xMin,0);for(let i=1;i<=steps;i++){const x=xMin+(i/steps)*(xMax-xMin),y=f(x,0);if(isFinite(py)&&isFinite(y)&&py*y<0){const t=py/(py-y);z.push(px+t*(x-px))}px=x;py=y}return z}

let drag=null
cv.addEventListener('mousedown',e=>{drag={sx:e.offsetX,sy:e.offsetY,vp:{...state.vp}};cv.classList.add('drag')})
cv.addEventListener('mousemove',e=>{if(!drag)return;const dpx=e.offsetX-drag.sx,dpy=e.offsetY-drag.sy,xr=drag.vp.xMax-drag.vp.xMin,yr=drag.vp.yMax-drag.vp.yMin;state.vp={xMin:drag.vp.xMin-dpx/W*xr,xMax:drag.vp.xMax-dpx/W*xr,yMin:drag.vp.yMin+dpy/H*yr,yMax:drag.vp.yMax+dpy/H*yr};render()})
cv.addEventListener('mouseup',()=>{drag=null;cv.classList.remove('drag')})
cv.addEventListener('mouseleave',()=>{drag=null;cv.classList.remove('drag')})

function drawAxes(C){
  const{xMin,xMax,yMin,yMax}=state.vp,[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xs=niceStep(xMax-xMin,8); ctx.fillStyle=C.muted; ctx.font='10px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(xMin/xs)*xs;x<=xMax+xs*0.01;x+=xs){if(Math.abs(x)<xs*0.001)continue;const px=w2c(x,0)[0];ctx.strokeStyle=C.border+'44';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,H);ctx.stroke();ctx.fillText(fmt(x),px,Math.min(oy+13,H-3))}
  const ys=niceStep(yMax-yMin,6); ctx.textAlign='right'
  for(let y=Math.ceil(yMin/ys)*ys;y<=yMax+ys*0.01;y+=ys){if(Math.abs(y)<ys*0.001)continue;const py=w2c(0,y)[1];ctx.strokeStyle=C.border+'44';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(W,py);ctx.stroke();ctx.fillText(fmt(y),Math.max(ox-4,26),py+4)}
}

function render(){
  const C=getC(), x0=parseFloat(app.querySelector('#sl').value)
  const showTan=app.querySelector('#showTan').checked, showZeros=app.querySelector('#showZeros').checked
  ctx.clearRect(0,0,W,H); drawAxes(C)
  ctx.strokeStyle=C.border; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){const mx=state.vp.xMin+(i/W)*(state.vp.xMax-state.vp.xMin),my=state.f(mx,0);if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}const[px,py]=w2c(mx,my);first?ctx.moveTo(px,py):ctx.lineTo(px,py);first=false}
  ctx.stroke()
  if(showZeros){
    const z=findZeros(state.f,state.vp.xMin,state.vp.xMax,400)
    ctx.fillStyle='#f59e0b'
    for(const x of z){const[px,py]=w2c(x,0);ctx.beginPath();ctx.arc(px,py,5,0,2*Math.PI);ctx.fill()}
  }
  if(showTan){
    const y0=state.f(x0,0),m=deriv(state.f,x0)
    if(isFinite(y0)&&isFinite(m)){
      const[px1,py1]=w2c(state.vp.xMin,m*(state.vp.xMin-x0)+y0),[px2,py2]=w2c(state.vp.xMax,m*(state.vp.xMax-x0)+y0)
      ctx.strokeStyle=C.accent; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(px1,py1); ctx.lineTo(px2,py2); ctx.stroke()
      const[px0,py0]=w2c(x0,y0); ctx.fillStyle=C.accent; ctx.beginPath(); ctx.arc(px0,py0,5,0,2*Math.PI); ctx.fill()
      app.querySelector('#info').textContent='f\\'='+m.toFixed(4)
    }
  }
}

app.querySelector('#plot').addEventListener('click',()=>{const e=app.querySelector('#ei').value.trim();if(e){state.expr=e;state.f=makeFunc(e)}render()})
app.querySelector('#sl').addEventListener('input',render)
app.querySelector('#showTan').addEventListener('change',render)
app.querySelector('#showZeros').addEventListener('change',render)
app.querySelector('#zin').addEventListener('click',()=>zoom(0.7))
app.querySelector('#zout').addEventListener('click',()=>zoom(1/0.7))
app.querySelector('#home').addEventListener('click',()=>{state.vp={...DEFAULT};render()})
render()`,
            },
            {
              id: 3,
              mode: "html",
              cellTitle: "Animated t Parameter",
              prose: [
                "Add the rAF animation loop. `state.t` increments each frame; `plotTraces` passes `t` to each compiled function. Expressions that ignore `t` are unaffected — only those that reference `t` animate.",
                'Try the "Travelling Wave" preset: `sin(x - t)` moves right at 1 radian/second. Try `sin(x) * cos(t)` for a pulsing amplitude.',
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:8px;display:flex;flex-direction:column;gap:5px;overflow:hidden}
    .row{display:flex;gap:5px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:80px;padding:4px 7px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:12px}
    input[type=color]{width:28px;height:26px;padding:1px;border:1px solid var(--border);border-radius:4px;cursor:pointer}
    button{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:12px}
    button:hover{background:var(--accent-bg)}
    .kv{font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface);cursor:grab}
    canvas.drag{cursor:grabbing}
    .legend{display:flex;flex-direction:column;gap:2px;flex-shrink:0;max-height:48px;overflow-y:auto}
    .leg{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text)}
    .sw{width:10px;height:10px;border-radius:2px;flex-shrink:0}
    .rm{font-size:10px;padding:0 4px;border-radius:3px;margin-left:auto;border:1px solid var(--border);background:var(--surface2);color:var(--muted);cursor:pointer}
    .rm:hover{color:#ef4444}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="ei" type="text" value="sin(x - t)" placeholder="expr (can use t)">
      <input id="ci" type="color" value="#0ea5e9">
      <button id="add">+</button>
      <button id="play">▶ Play</button>
      <button id="home">⌂</button>
      <span class="kv" id="tv">t=0.000</span>
    </div>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const DEFAULT={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
const state={fns:[],vp:{...DEFAULT},t:0,running:false}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
function addFn(expr,color){state.fns.push({expr,color,visible:true,_f:makeFunc(expr)})}
addFn('sin(x - t)','#0ea5e9')

function w2c(mx,my){const{xMin,xMax,yMin,yMax}=state.vp;return[(mx-xMin)/(xMax-xMin)*W,H-(my-yMin)/(yMax-yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function niceStep(range,n){const r=range/n,m=Math.pow(10,Math.floor(Math.log10(r))),f=r/m;return(f<1.5?1:f<3.5?2:f<7.5?5:10)*m}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}
function zoom(factor){const{xMin,xMax,yMin,yMax}=state.vp,cx=(xMin+xMax)/2,cy=(yMin+yMax)/2,hw=(xMax-xMin)/2*factor,hh=(yMax-yMin)/2*factor;state.vp={xMin:cx-hw,xMax:cx+hw,yMin:cy-hh,yMax:cy+hh};if(!state.running)render()}

let drag=null
cv.addEventListener('mousedown',e=>{drag={sx:e.offsetX,sy:e.offsetY,vp:{...state.vp}};cv.classList.add('drag')})
cv.addEventListener('mousemove',e=>{if(!drag)return;const dpx=e.offsetX-drag.sx,dpy=e.offsetY-drag.sy,xr=drag.vp.xMax-drag.vp.xMin,yr=drag.vp.yMax-drag.vp.yMin;state.vp={xMin:drag.vp.xMin-dpx/W*xr,xMax:drag.vp.xMax-dpx/W*xr,yMin:drag.vp.yMin+dpy/H*yr,yMax:drag.vp.yMax+dpy/H*yr};if(!state.running)render()})
cv.addEventListener('mouseup',()=>{drag=null;cv.classList.remove('drag')})
cv.addEventListener('mouseleave',()=>{drag=null;cv.classList.remove('drag')})

function drawAxes(C){
  const{xMin,xMax,yMin,yMax}=state.vp,[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xs=niceStep(xMax-xMin,8); ctx.fillStyle=C.muted; ctx.font='9px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(xMin/xs)*xs;x<=xMax+xs*0.01;x+=xs){if(Math.abs(x)<xs*0.001)continue;ctx.fillText(fmt(x),w2c(x,0)[0],Math.min(oy+12,H-2))}
}

function render(){
  const C=getC(); ctx.clearRect(0,0,W,H); drawAxes(C)
  for(const fn of state.fns){
    if(!fn.visible) continue
    ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
    let first=true
    for(let i=0;i<=W;i++){
      const mx=state.vp.xMin+(i/W)*(state.vp.xMax-state.vp.xMin),my=fn._f(mx,state.t)
      if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
      const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
    }
    ctx.stroke()
  }
  app.querySelector('#tv').textContent='t='+state.t.toFixed(3)
  app.querySelector('#leg').innerHTML=state.fns.map((fn,i)=>
    '<div class="leg"><input type="checkbox" data-i="'+i+'"'+(fn.visible?' checked':'')+'><span class="sw" style="background:'+fn.color+'"></span><span>'+fn.expr+'</span><button class="rm" data-i="'+i+'">×</button></div>'
  ).join('')
  app.querySelectorAll('input[type=checkbox][data-i]').forEach(cb=>cb.addEventListener('change',()=>{state.fns[parseInt(cb.dataset.i)].visible=cb.checked;if(!state.running)render()}))
  app.querySelectorAll('.rm').forEach(btn=>btn.addEventListener('click',()=>{state.fns.splice(parseInt(btn.dataset.i),1);if(!state.running)render()}))
}

let animId=null, lastTs=null
function loop(ts){
  const dt=lastTs?Math.min((ts-lastTs)/1000,0.05):0; lastTs=ts; state.t+=dt
  render(); animId=requestAnimationFrame(loop)
}

app.querySelector('#play').addEventListener('click',()=>{
  if(state.running){cancelAnimationFrame(animId);animId=null;lastTs=null;state.running=false;app.querySelector('#play').textContent='▶ Play'}
  else{state.running=true;app.querySelector('#play').textContent='⏸ Pause';animId=requestAnimationFrame(loop)}
})
app.querySelector('#add').addEventListener('click',()=>{const e=app.querySelector('#ei').value.trim(),c=app.querySelector('#ci').value;if(!e)return;addFn(e,c);if(!state.running)render()})
app.querySelector('#home').addEventListener('click',()=>{state.vp={...DEFAULT};if(!state.running)render()})
render()`,
            },
            {
              id: 4,
              mode: "html",
              cellTitle: "Presets Library",
              prose: [
                "A preset library makes the plotter useful from first open. Each button replaces the function list with a curated set of expressions and sets an appropriate viewport.",
                'The "Fourier Square" preset demonstrates how sin, sin(3x)/3, sin(5x)/5 sum toward a square wave — a beautiful demonstration of Fourier series in ~50 pixels of canvas.',
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:8px;display:flex;flex-direction:column;gap:5px;overflow:hidden}
    .row{display:flex;gap:4px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    .pbtn{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:11px}
    .pbtn:hover,.pbtn.active{background:var(--accent-bg);border-color:var(--accent)}
    input[type=text]{flex:1;min-width:80px;padding:4px 7px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:12px}
    input[type=color]{width:26px;height:24px;padding:1px;border:1px solid var(--border);border-radius:4px;cursor:pointer}
    button.add{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:12px}
    button.ctrl{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:12px;font-weight:600}
    button.ctrl:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface);cursor:grab}
    canvas.drag{cursor:grabbing}
    .legend{display:flex;flex-direction:column;gap:2px;flex-shrink:0;max-height:44px;overflow-y:auto}
    .leg{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text)}
    .sw{width:10px;height:10px;border-radius:2px;flex-shrink:0}
    .rm{font-size:10px;padding:0 4px;border-radius:3px;margin-left:auto;border:1px solid var(--border);background:var(--surface2);color:var(--muted);cursor:pointer}
    .rm:hover{color:#ef4444}
  </style>
  <div class="wrap">
    <div class="row" id="presets"></div>
    <div class="row">
      <input id="ei" type="text" value="sin(x)" placeholder="expr (x, t)">
      <input id="ci" type="color" value="#a855f7">
      <button class="add" id="add">+</button>
      <button class="ctrl" id="play">▶</button>
      <button class="ctrl" id="zin">＋</button>
      <button class="ctrl" id="zout">－</button>
      <button class="ctrl" id="home">⌂</button>
    </div>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const PRESETS=[
  {name:'Sine',     vp:{xMin:-7,xMax:7,yMin:-2,yMax:2},    fns:[{expr:'sin(x)',color:'#0ea5e9'}]},
  {name:'Parabola', vp:{xMin:-5,xMax:5,yMin:-1,yMax:7},    fns:[{expr:'x*x/3',color:'#f59e0b'}]},
  {name:'Wave',     vp:{xMin:-7,xMax:7,yMin:-2,yMax:2},    fns:[{expr:'sin(x-t)',color:'#0ea5e9'}]},
  {name:'Fourier',  vp:{xMin:-7,xMax:7,yMin:-1.8,yMax:1.8},fns:[
    {expr:'sin(x)',     color:'#0ea5e9'},
    {expr:'sin(3*x)/3', color:'#f59e0b'},
    {expr:'sin(5*x)/5', color:'#10b981'},
    {expr:'sin(7*x)/7', color:'#a855f7'},
  ]},
  {name:'Damped',   vp:{xMin:-7,xMax:7,yMin:-1.5,yMax:1.5},fns:[{expr:'sin(x)*exp(-abs(x)/5)',color:'#0ea5e9'}]},
]

function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
const DEFAULT={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
const state={fns:[],vp:{...DEFAULT},t:0,running:false}
function loadPreset(p){
  if(state.running){cancelAnimationFrame(animId);animId=null;lastTs=null;state.running=false;app.querySelector('#play').textContent='▶'}
  state.t=0; state.vp={...p.vp}
  state.fns=p.fns.map(fn=>({...fn,visible:true,_f:makeFunc(fn.expr)}))
  render()
}
loadPreset(PRESETS[0])

function w2c(mx,my){const{xMin,xMax,yMin,yMax}=state.vp;return[(mx-xMin)/(xMax-xMin)*W,H-(my-yMin)/(yMax-yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function niceStep(range,n){const r=range/n,m=Math.pow(10,Math.floor(Math.log10(r))),f=r/m;return(f<1.5?1:f<3.5?2:f<7.5?5:10)*m}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}
function zoom(factor){const{xMin,xMax,yMin,yMax}=state.vp,cx=(xMin+xMax)/2,cy=(yMin+yMax)/2,hw=(xMax-xMin)/2*factor,hh=(yMax-yMin)/2*factor;state.vp={xMin:cx-hw,xMax:cx+hw,yMin:cy-hh,yMax:cy+hh};if(!state.running)render()}

let drag=null
cv.addEventListener('mousedown',e=>{drag={sx:e.offsetX,sy:e.offsetY,vp:{...state.vp}};cv.classList.add('drag')})
cv.addEventListener('mousemove',e=>{if(!drag)return;const dpx=e.offsetX-drag.sx,dpy=e.offsetY-drag.sy,xr=drag.vp.xMax-drag.vp.xMin,yr=drag.vp.yMax-drag.vp.yMin;state.vp={xMin:drag.vp.xMin-dpx/W*xr,xMax:drag.vp.xMax-dpx/W*xr,yMin:drag.vp.yMin+dpy/H*yr,yMax:drag.vp.yMax+dpy/H*yr};if(!state.running)render()})
cv.addEventListener('mouseup',()=>{drag=null;cv.classList.remove('drag')})
cv.addEventListener('mouseleave',()=>{drag=null;cv.classList.remove('drag')})

function drawAxes(C){
  const{xMin,xMax,yMin,yMax}=state.vp,[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xs=niceStep(xMax-xMin,8); ctx.fillStyle=C.muted; ctx.font='9px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(xMin/xs)*xs;x<=xMax+xs*0.01;x+=xs){if(Math.abs(x)<xs*0.001)continue;const px=w2c(x,0)[0];ctx.strokeStyle=C.border+'33';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,H);ctx.stroke();ctx.fillText(fmt(x),px,Math.min(oy+12,H-2))}
  const ys=niceStep(yMax-yMin,6); ctx.textAlign='right'
  for(let y=Math.ceil(yMin/ys)*ys;y<=yMax+ys*0.01;y+=ys){if(Math.abs(y)<ys*0.001)continue;const py=w2c(0,y)[1];ctx.strokeStyle=C.border+'33';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(W,py);ctx.stroke();ctx.fillText(fmt(y),Math.max(ox-4,24),py+3)}
}

function render(){
  const C=getC(); ctx.clearRect(0,0,W,H); drawAxes(C)
  for(const fn of state.fns){
    if(!fn.visible) continue
    ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
    let first=true
    for(let i=0;i<=W;i++){
      const mx=state.vp.xMin+(i/W)*(state.vp.xMax-state.vp.xMin),my=fn._f(mx,state.t)
      if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
      const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
    }
    ctx.stroke()
  }
  app.querySelector('#leg').innerHTML=state.fns.map((fn,i)=>
    '<div class="leg"><input type="checkbox" data-i="'+i+'"'+(fn.visible?' checked':'')+'><span class="sw" style="background:'+fn.color+'"></span><span>'+fn.expr+'</span><button class="rm" data-i="'+i+'">×</button></div>'
  ).join('')
  app.querySelectorAll('input[type=checkbox][data-i]').forEach(cb=>cb.addEventListener('change',()=>{state.fns[parseInt(cb.dataset.i)].visible=cb.checked;if(!state.running)render()}))
  app.querySelectorAll('.rm').forEach(btn=>btn.addEventListener('click',()=>{state.fns.splice(parseInt(btn.dataset.i),1);if(!state.running)render()}))
  // Update preset button active state
  app.querySelectorAll('.pbtn').forEach(b=>b.classList.remove('active'))
}

let animId=null, lastTs=null
function loop(ts){const dt=lastTs?Math.min((ts-lastTs)/1000,0.05):0;lastTs=ts;state.t+=dt;render();animId=requestAnimationFrame(loop)}

// Build preset buttons
app.querySelector('#presets').innerHTML=PRESETS.map((p,i)=>'<button class="pbtn" data-i="'+i+'">'+p.name+'</button>').join('')
app.querySelectorAll('.pbtn').forEach(btn=>btn.addEventListener('click',()=>{
  app.querySelectorAll('.pbtn').forEach(b=>b.classList.remove('active')); btn.classList.add('active')
  loadPreset(PRESETS[parseInt(btn.dataset.i)])
}))
app.querySelector('.pbtn').classList.add('active')

app.querySelector('#add').addEventListener('click',()=>{const e=app.querySelector('#ei').value.trim(),c=app.querySelector('#ci').value;if(!e)return;state.fns.push({expr:e,color:c,visible:true,_f:makeFunc(e)});if(!state.running)render()})
app.querySelector('#play').addEventListener('click',()=>{
  if(state.running){cancelAnimationFrame(animId);animId=null;lastTs=null;state.running=false;app.querySelector('#play').textContent='▶'}
  else{state.running=true;app.querySelector('#play').textContent='⏸';animId=requestAnimationFrame(loop)}
})
app.querySelector('#zin').addEventListener('click',()=>zoom(0.7))
app.querySelector('#zout').addEventListener('click',()=>zoom(1/0.7))
app.querySelector('#home').addEventListener('click',()=>{state.vp={...DEFAULT};if(!state.running)render()})`,
            },

            // ── Challenges ──────────────────────────────────────────────────────
            {
              id: "c1",
              isChallenge: true,
              mode: "html",
              challengeTitle: "Add a Custom Preset",
              difficulty: "easy",
              prompt:
                'Add a sixth preset called "Lissajous" to the PRESETS array. It should show three traces: `sin(x)`, `sin(2*x)`, and `sin(3*x)` in three different colors, with viewport x ∈ [−7, 7], y ∈ [−1.5, 1.5].',
              hint: "Copy the format of an existing entry: `{ name: 'Lissajous', vp: { xMin: -7, xMax: 7, yMin: -1.5, yMax: 1.5 }, fns: [...] }`. The preset button is added automatically by the `PRESETS.map(...)` loop.",
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:8px;display:flex;flex-direction:column;gap:5px;overflow:hidden}
    .row{display:flex;gap:4px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    .pbtn{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:11px}
    .pbtn:hover,.pbtn.active{background:var(--accent-bg);border-color:var(--accent)}
    button{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:12px;font-weight:600}
    button:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
    .legend{display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0}
    .leg{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text)}
    .sw{width:10px;height:10px;border-radius:2px;flex-shrink:0}
  </style>
  <div class="wrap">
    <div class="row" id="presets"></div>
    <div class="row">
      <button id="zin">＋</button><button id="zout">－</button><button id="home">⌂</button>
    </div>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const PRESETS=[
  {name:'Sine',     vp:{xMin:-7,xMax:7,yMin:-2,yMax:2},    fns:[{expr:'sin(x)',color:'#0ea5e9'}]},
  {name:'Fourier',  vp:{xMin:-7,xMax:7,yMin:-1.8,yMax:1.8},fns:[
    {expr:'sin(x)',     color:'#0ea5e9'},
    {expr:'sin(3*x)/3', color:'#f59e0b'},
    {expr:'sin(5*x)/5', color:'#10b981'},
  ]},
  {name:'Damped',   vp:{xMin:-7,xMax:7,yMin:-1.5,yMax:1.5},fns:[{expr:'sin(x)*exp(-abs(x)/5)',color:'#0ea5e9'}]},
  // TODO: add { name: 'Lissajous', vp: { xMin: -7, xMax: 7, yMin: -1.5, yMax: 1.5 },
  //   fns: [
  //     { expr: 'sin(x)',    color: '#0ea5e9' },
  //     { expr: 'sin(2*x)', color: '#f59e0b' },
  //     { expr: 'sin(3*x)', color: '#10b981' },
  //   ] }
]

function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
const DEFAULT={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
let vp={...DEFAULT}, fns=[]
function loadPreset(p){vp={...p.vp};fns=p.fns.map(fn=>({...fn,_f:makeFunc(fn.expr)}));render()}
loadPreset(PRESETS[0])

function w2c(mx,my){return[(mx-vp.xMin)/(vp.xMax-vp.xMin)*W,H-(my-vp.yMin)/(vp.yMax-vp.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function niceStep(r,n){const m=Math.pow(10,Math.floor(Math.log10(r/n))),f=(r/n)/m;return(f<1.5?1:f<3.5?2:f<7.5?5:10)*m}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}
function zoom(f){const cx=(vp.xMin+vp.xMax)/2,cy=(vp.yMin+vp.yMax)/2,hw=(vp.xMax-vp.xMin)/2*f,hh=(vp.yMax-vp.yMin)/2*f;vp={xMin:cx-hw,xMax:cx+hw,yMin:cy-hh,yMax:cy+hh};render()}

function render(){
  const C=getC(); ctx.clearRect(0,0,W,H)
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xs=niceStep(vp.xMax-vp.xMin,8); ctx.fillStyle=C.muted; ctx.font='9px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(vp.xMin/xs)*xs;x<=vp.xMax+xs*0.01;x+=xs){if(Math.abs(x)<xs*0.001)continue;ctx.fillText(fmt(x),w2c(x,0)[0],Math.min(oy+12,H-2))}
  for(const fn of fns){
    ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
    let first=true
    for(let i=0;i<=W;i++){
      const mx=vp.xMin+(i/W)*(vp.xMax-vp.xMin),my=fn._f(mx,0)
      if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
      const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
    }
    ctx.stroke()
  }
  app.querySelector('#leg').innerHTML=fns.map(fn=>'<div class="leg"><span class="sw" style="background:'+fn.color+'"></span><span>'+fn.expr+'</span></div>').join('')
  app.querySelectorAll('.pbtn').forEach(b=>b.classList.remove('active'))
}

app.querySelector('#presets').innerHTML=PRESETS.map((p,i)=>'<button class="pbtn" data-i="'+i+'">'+p.name+'</button>').join('')
app.querySelectorAll('.pbtn').forEach(btn=>btn.addEventListener('click',()=>{
  app.querySelectorAll('.pbtn').forEach(b=>b.classList.remove('active')); btn.classList.add('active')
  loadPreset(PRESETS[parseInt(btn.dataset.i)])
}))
app.querySelector('.pbtn').classList.add('active')
app.querySelector('#zin').addEventListener('click',()=>zoom(0.7))
app.querySelector('#zout').addEventListener('click',()=>zoom(1/0.7))
app.querySelector('#home').addEventListener('click',()=>{vp={...DEFAULT};render()})
render()`,
            },
            {
              id: "c2",
              isChallenge: true,
              mode: "html",
              challengeTitle: "Export to PNG",
              difficulty: "medium",
              prompt:
                'Add an "Export PNG" button. When clicked, call `cv.toDataURL(\'image/png\')` to get a base64 PNG, create a temporary `<a>` element with `href` set to that URL and `download="plot.png"`, click it programmatically, then remove it. The browser will save the canvas as a PNG file.',
              hint: "The pattern:\n```js\nconst url = cv.toDataURL('image/png')\nconst a = document.createElement('a')\na.href = url; a.download = 'plot.png'\ndocument.body.appendChild(a); a.click(); document.body.removeChild(a)\n```\nNote: `cv.toDataURL` must be called on the same origin — this works in the sandboxed iframe context.",
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:8px;display:flex;flex-direction:column;gap:5px;overflow:hidden}
    .row{display:flex;gap:4px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    .pbtn{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:11px}
    .pbtn:hover,.pbtn.active{background:var(--accent-bg);border-color:var(--accent)}
    button{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:12px;font-weight:600}
    button:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="row" id="presets"></div>
    <div class="row">
      <button id="zin">＋</button><button id="zout">－</button><button id="home">⌂</button>
      <button id="play">▶</button>
      <!-- TODO: add an Export PNG button here -->
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const PRESETS=[
  {name:'Sine',  vp:{xMin:-7,xMax:7,yMin:-2,yMax:2}, fns:[{expr:'sin(x)',color:'#0ea5e9'}]},
  {name:'Wave',  vp:{xMin:-7,xMax:7,yMin:-2,yMax:2}, fns:[{expr:'sin(x-t)',color:'#0ea5e9'},{expr:'cos(x+t)',color:'#f59e0b'}]},
  {name:'Fourier',vp:{xMin:-7,xMax:7,yMin:-1.8,yMax:1.8},fns:[
    {expr:'sin(x)',color:'#0ea5e9'},{expr:'sin(3*x)/3',color:'#f59e0b'},{expr:'sin(5*x)/5',color:'#10b981'}
  ]},
]

function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
const DEFAULT={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
const state={fns:[],vp:{...DEFAULT},t:0,running:false}
function loadPreset(p){
  if(state.running){cancelAnimationFrame(animId);animId=null;lastTs=null;state.running=false;app.querySelector('#play').textContent='▶'}
  state.t=0; state.vp={...p.vp}; state.fns=p.fns.map(fn=>({...fn,_f:makeFunc(fn.expr)})); render()
}
loadPreset(PRESETS[0])

function w2c(mx,my){const{xMin,xMax,yMin,yMax}=state.vp;return[(mx-xMin)/(xMax-xMin)*W,H-(my-yMin)/(yMax-yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function niceStep(r,n){const m=Math.pow(10,Math.floor(Math.log10(r/n))),f=(r/n)/m;return(f<1.5?1:f<3.5?2:f<7.5?5:10)*m}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}
function zoom(f){const{xMin,xMax,yMin,yMax}=state.vp,cx=(xMin+xMax)/2,cy=(yMin+yMax)/2,hw=(xMax-xMin)/2*f,hh=(yMax-yMin)/2*f;state.vp={xMin:cx-hw,xMax:cx+hw,yMin:cy-hh,yMax:cy+hh};if(!state.running)render()}

function render(){
  const C=getC(); ctx.clearRect(0,0,W,H)
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xs=niceStep(state.vp.xMax-state.vp.xMin,8); ctx.fillStyle=C.muted; ctx.font='9px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(state.vp.xMin/xs)*xs;x<=state.vp.xMax+xs*0.01;x+=xs){if(Math.abs(x)<xs*0.001)continue;const px=w2c(x,0)[0];ctx.strokeStyle=C.border+'33';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,H);ctx.stroke();ctx.fillText(fmt(x),px,Math.min(oy+12,H-2))}
  const ys=niceStep(state.vp.yMax-state.vp.yMin,6); ctx.textAlign='right'
  for(let y=Math.ceil(state.vp.yMin/ys)*ys;y<=state.vp.yMax+ys*0.01;y+=ys){if(Math.abs(y)<ys*0.001)continue;const py=w2c(0,y)[1];ctx.strokeStyle=C.border+'33';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(W,py);ctx.stroke();ctx.fillText(fmt(y),Math.max(ox-4,24),py+3)}
  for(const fn of state.fns){
    ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
    let first=true
    for(let i=0;i<=W;i++){
      const mx=state.vp.xMin+(i/W)*(state.vp.xMax-state.vp.xMin),my=fn._f(mx,state.t)
      if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
      const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
    }
    ctx.stroke()
  }
}

let animId=null, lastTs=null
function loop(ts){const dt=lastTs?Math.min((ts-lastTs)/1000,0.05):0;lastTs=ts;state.t+=dt;render();animId=requestAnimationFrame(loop)}

app.querySelector('#presets').innerHTML=PRESETS.map((p,i)=>'<button class="pbtn" data-i="'+i+'">'+p.name+'</button>').join('')
app.querySelectorAll('.pbtn').forEach(btn=>btn.addEventListener('click',()=>{app.querySelectorAll('.pbtn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');loadPreset(PRESETS[parseInt(btn.dataset.i)])}))
app.querySelector('.pbtn').classList.add('active')

// TODO: wire up the Export PNG button
// app.querySelector('#export').addEventListener('click', () => {
//   const url = cv.toDataURL('image/png')
//   const a = document.createElement('a')
//   a.href = url; a.download = 'plot.png'
//   document.body.appendChild(a); a.click(); document.body.removeChild(a)
// })

app.querySelector('#play').addEventListener('click',()=>{
  if(state.running){cancelAnimationFrame(animId);animId=null;lastTs=null;state.running=false;app.querySelector('#play').textContent='▶'}
  else{state.running=true;app.querySelector('#play').textContent='⏸';animId=requestAnimationFrame(loop)}
})
app.querySelector('#zin').addEventListener('click',()=>zoom(0.7))
app.querySelector('#zout').addEventListener('click',()=>zoom(1/0.7))
app.querySelector('#home').addEventListener('click',()=>{state.vp={...DEFAULT};if(!state.running)render()})
render()`,
            },
            {
              id: "c3",
              isChallenge: true,
              mode: "html",
              challengeTitle: "Parametric Curves",
              difficulty: "hard",
              prompt:
                'Add a "Parametric" mode. In this mode, the user enters two expressions: `x(t)` and `y(t)`. The plotter samples t from 0 to 2π in small steps and draws a curve through the resulting (x, y) points — tracing a path in 2D space rather than a function graph. Wire up a checkbox that switches between function mode and parametric mode.',
              hint: "In parametric mode, the plot loop changes: `for (let i = 0; i <= STEPS; i++) { const t = i / STEPS * 2 * Math.PI; const px = w2c(xFn(t), yFn(t)) }`. You need two separate compiled functions. Good test: `x(t) = cos(t)`, `y(t) = sin(t)` draws a circle. `x(t) = cos(3*t)`, `y(t) = sin(2*t)` draws a Lissajous figure.",
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:8px;display:flex;flex-direction:column;gap:5px;overflow:hidden}
    .row{display:flex;gap:5px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{width:120px;padding:4px 7px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:12px}
    button{padding:3px 10px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:12px;font-weight:600}
    button:hover{background:var(--accent-bg)}
    label{font-size:12px;color:var(--text);display:flex;align-items:center;gap:4px}
    .lbl{font-size:12px;color:var(--muted)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="row">
      <label><input type="checkbox" id="paraMode"> Parametric mode</label>
    </div>
    <div class="row" id="fnRow">
      <span class="lbl">y =</span>
      <input id="fnExpr" type="text" value="sin(x)">
      <button id="plot">Plot</button>
    </div>
    <div class="row" id="paraRow" style="display:none">
      <span class="lbl">x(t) =</span><input id="xExpr" type="text" value="cos(t)">
      <span class="lbl">y(t) =</span><input id="yExpr" type="text" value="sin(t)">
      <button id="plotPara">Plot</button>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-2,xMax:2,yMin:-1.5,yMax:1.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W,H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
// makeT compiles a function of t only (for parametric expressions)
function makeT(expr){return new Function('t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

let paraMode=false, fnF=makeFunc('sin(x)'), xF=makeT('cos(t)'), yF=makeT('sin(t)')

function drawAxes(C){
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
}

function render(){
  const C=getC(); ctx.clearRect(0,0,W,H); drawAxes(C)
  ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
  if(!paraMode){
    let first=true
    for(let i=0;i<=W;i++){
      const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin),my=fnF(mx,0)
      if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
      const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
    }
  } else {
    // TODO: parametric mode — sample t from 0 to 2π in STEPS steps
    // const STEPS = 600
    // for (let i = 0; i <= STEPS; i++) {
    //   const t = (i / STEPS) * 2 * Math.PI
    //   const mx = xF(t), my = yF(t)
    //   if (!isFinite(mx) || !isFinite(my)) { first = true; continue }
    //   const [px, py] = w2c(mx, my)
    //   i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    // }
  }
  ctx.stroke()
}

app.querySelector('#paraMode').addEventListener('change',e=>{
  paraMode=e.target.checked
  app.querySelector('#fnRow').style.display=paraMode?'none':'flex'
  app.querySelector('#paraRow').style.display=paraMode?'flex':'none'
  render()
})
app.querySelector('#plot').addEventListener('click',()=>{ fnF=makeFunc(app.querySelector('#fnExpr').value.trim()||'sin(x)'); render() })
app.querySelector('#plotPara').addEventListener('click',()=>{
  xF=makeT(app.querySelector('#xExpr').value.trim()||'cos(t)')
  yF=makeT(app.querySelector('#yExpr').value.trim()||'sin(t)')
  render()
})
render()`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The capstone assembles the viewport engine (Lesson 8), trace loop (Lesson 7), analysis layer (Lesson 9), and rAF loop (Lesson 5). What design principle does this demonstrate?',
      options: [
        'Monolithic architecture — one file contains everything',
        'Composition: each lesson built a focused, independently testable piece. The capstone snaps them together with minimal glue. Because each piece has a clean interface (w2c takes a world coordinate; drawTrace takes an fn object), they combine without rewriting. This is why good abstractions pay off at integration time',
        'Object-oriented inheritance — the capstone class extends each lesson class',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Parametric curves use x(t) and y(t) instead of y = f(x). What kind of curve cannot be drawn as y = f(x) but can be drawn parametrically?',
      options: [
        'Any polynomial function — polynomials require parametric form',
        'Closed curves like circles and ellipses. y = f(x) requires exactly one y per x — a vertical slice through a circle gives two y values, so it fails the vertical-line test. Parametric form (cos(t), sin(t)) traces both halves continuously without restriction',
        'Discontinuous functions like floor(x)',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Including `t` as a variable in expressions allows writing `sin(x + t)`. As t increases from 0, what does the sin(x + t) wave do?',
      options: [
        'The amplitude increases proportionally to t',
        'The wave shifts left (phase shift). sin(x + t) = sin(x − (−t)), so increasing t shifts the pattern in the −x direction. The wave appears to travel to the left across the screen — you are watching a moving wave, which is how all wave animations work',
        'The frequency doubles each time t passes an integer value',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Building the plotter over 10 incremental lessons rather than all at once has a specific pedagogical and engineering benefit. What is it?',
      options: [
        'Each lesson produces a smaller file that is faster to download',
        'Each increment adds one tested capability on top of a working foundation. If something breaks, you know exactly which new piece caused it. Trying to build the full plotter in one step means debugging an untested system where any of ten interacting parts might be wrong — with no working baseline to compare against',
        'Incremental lessons allow parallel development by multiple team members',
      ],
      correct: 1,
    },
  ],
};

export default sim2_010;
