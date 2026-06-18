const sim2_008 = {
  id: 'sim2-008',
  slug: 'axes-and-viewport',
  chapter: 'sim2',
  order: 8,
  title: 'Axes and Viewport',
  subtitle: 'Replace the fixed coordinate window with a live viewport: draw labelled tick marks, zoom in and out from the centre, and drag the canvas to pan — the engine inside every graphing calculator.',
  tags: ['viewport', 'w2c', 'c2w', 'zoom', 'pan', 'tick marks', 'axes', 'canvas'],
  timeToComplete: 40,
  coreConcept: 'The viewport is four numbers (xMin, xMax, yMin, yMax). Two helpers — w2c and c2w — translate between math world and canvas pixels. Zoom scales those four numbers around the centre; pan shifts them uniformly. Every other drawing operation stays the same.',

  hook: {
    question: 'A graphing calculator lets you zoom in on a curve\'s inflection point and zoom back out to see its full shape. How does it keep the axes, tick marks, and traces all in sync without rewriting the drawing code?',
    realWorldContext: 'Map tiles, satellite imagery viewers, and financial chart libraries all solve the same problem: a "camera" defined by four numbers that determine which slice of an infinite plane is visible. Pan and zoom are just arithmetic on those four numbers — the rest of the rendering pipeline is unchanged. You are building the same camera system here.',
  },

  intuition: {
    prose: [
      '**The viewport is four numbers.** `xMin`, `xMax`, `yMin`, `yMax` define a rectangle in math space. Everything else — tick marks, traces, labels — is derived from these four numbers by `w2c`. Change the numbers and the entire picture updates on the next `redraw()` call.',
      '**w2c and c2w are each other\'s inverse.** `w2c(mx, my)` converts a math coordinate to a canvas pixel: `px = (mx − xMin) / (xMax − xMin) × W`. `c2w(px, py)` inverts it: `mx = xMin + (px / W) × (xMax − xMin)`. You need both: `w2c` for drawing, `c2w` for mapping a mouse click back to a math coordinate.',
      '**Tick step calculation.** You want roughly 6–8 ticks across the viewport, always at "nice" intervals — 1, 2, 5, 10, 0.5, 0.1 etc. Compute the rough step `range / 8`, find the nearest power of 10 below it, then choose 1, 2, or 5 times that power of 10. This `niceStep` function produces readable labels at any zoom level.',
      '**Zoom from the centre.** To zoom in by factor f (e.g. 0.7 = 70% of current range), compute the centre point `cx = (xMin + xMax) / 2` and shrink the half-width: `newXMin = cx − halfW × f`. Zooming always keeps the centre of the view fixed. To zoom toward the mouse position instead, use `c2w` on the mouse pixel and zoom toward that point.',
      '**Pan by dragging.** On mousedown, record the viewport state and the starting pixel. On mousemove, compute the pixel delta and convert it to a world delta: `dworld_x = (dpx / W) × (xMax − xMin)`. Shift xMin and xMax by −dworld_x (dragging right exposes lower x values — the world moves with your finger). Do the equivalent for y, but with the sign flipped because canvas y is inverted.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 8 of 10 — Axes and Viewport',
        body: '**Previous:** Lesson 7 — Multiple Functions. The `plotTrace` and `makeFunc` patterns carry forward.\n**This lesson:** Dynamic viewport — tick marks, zoom, and pan.\n**Next:** Lesson 9 — Analysis Tools. Use `c2w` to map a slider pixel to a math x for the tangent line.',
      },
      {
        type: 'definition',
        title: 'w2c and c2w',
        body: '```js\nfunction w2c(mx, my) {\n  return [\n    (mx - vp.xMin) / (vp.xMax - vp.xMin) * W,\n    H - (my - vp.yMin) / (vp.yMax - vp.yMin) * H\n  ]\n}\nfunction c2w(px, py) {\n  return [\n    vp.xMin + (px / W) * (vp.xMax - vp.xMin),\n    vp.yMin + ((H - py) / H) * (vp.yMax - vp.yMin)\n  ]\n}\n```\nNote the `H − py` in `c2w` — canvas y is flipped relative to math y.',
      },
      {
        type: 'procedure',
        title: 'niceStep — Readable Tick Intervals',
        body: '```js\nfunction niceStep(range, maxTicks) {\n  const rough = range / maxTicks\n  const mag = Math.pow(10, Math.floor(Math.log10(rough)))\n  const frac = rough / mag\n  return (frac < 1.5 ? 1 : frac < 3.5 ? 2 : frac < 7.5 ? 5 : 10) * mag\n}\n```\nInput: the visible range and desired tick count. Output: a "nice" step like 1, 2, 5, 0.5, 0.2, 10.',
      },
      {
        type: 'warning',
        title: 'Zoom Around Centre, Not Origin',
        body: 'Zooming toward the origin looks wrong unless the origin is centred. The correct formula zooms around the current viewport centre:\n\n```js\nconst cx = (vp.xMin + vp.xMax) / 2\nconst hw = (vp.xMax - vp.xMin) / 2 * factor\nvp.xMin = cx - hw; vp.xMax = cx + hw\n```\n\nUse this pattern for both x and y.',
      },
      {
        type: 'insight',
        title: 'Pan Direction Convention',
        body: 'When the user drags right by `dpx` pixels, the world moves right — you see content that was to the left (lower x values). So `xMin` decreases: `xMin_new = xMin − dpx/W × xRange`. When the user drags down (`dpy` positive), canvas y increases but math y decreases — you see higher y values: `yMin_new = yMin + dpy/H × yRange`.',
      },
      {
        type: 'strategy',
        title: 'Store Drag State in One Object',
        body: '`let drag = null`. On mousedown: `drag = { startX: e.offsetX, startY: e.offsetY, vp: {...vp} }`. On mousemove: compute delta against `drag.startX` and `drag.vp` (the *snapshot* of the viewport at drag start). On mouseup or mouseleave: `drag = null`. Always pan from the snapshot — never accumulate deltas.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Axes and Viewport — Four Cells',
        mathBridge: 'Work through the four cells in order. Cell 1 introduces w2c/c2w and draws a grid. Cell 2 adds readable tick labels. Cell 3 wires up zoom buttons. Cell 4 implements click-drag pan.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              mode: 'html',
              cellTitle: 'w2c, c2w and Grid',
              prose: [
                '`w2c` maps math (x, y) → canvas pixel. `c2w` maps canvas pixel → math (x, y). Draw thin gridlines at every integer to verify the transform is correct — they should cross exactly at the origin.',
                'The grid is drawn with `ctx.strokeStyle = C.border` at low `lineWidth` so traces stand out on top of it.',
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:12px;display:flex;flex-direction:column;gap:8px;overflow:hidden}
    h3{font-size:13px;font-weight:600;color:var(--text);margin:0;flex-shrink:0}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
    .note{font-size:12px;color:var(--muted);flex-shrink:0}
  </style>
  <div class="wrap">
    <h3>w2c / c2w — grid lines at integers</h3>
    <canvas id="cv"></canvas>
    <p class="note" id="info">Click the canvas to see c2w in action.</p>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

let vp={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-vp.xMin)/(vp.xMax-vp.xMin)*W, H-(my-vp.yMin)/(vp.yMax-vp.yMin)*H]}
function c2w(px,py){return[vp.xMin+(px/W)*(vp.xMax-vp.xMin), vp.yMin+((H-py)/H)*(vp.yMax-vp.yMin)]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  // Grid lines
  ctx.strokeStyle=C.border+'55'; ctx.lineWidth=0.5
  for(let x=Math.ceil(vp.xMin);x<=vp.xMax;x++){
    const px=w2c(x,0)[0]
    ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke()
  }
  for(let y=Math.ceil(vp.yMin);y<=vp.yMax;y++){
    const py=w2c(0,y)[1]
    ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke()
  }
  // Axes
  ctx.strokeStyle=C.muted; ctx.lineWidth=1.5
  const[,oy]=w2c(0,0); ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  const[ox]=w2c(0,0);   ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  // Trace
  const f=makeFunc('sin(x)')
  ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=vp.xMin+(i/W)*(vp.xMax-vp.xMin), my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}
redraw()

cv.addEventListener('click',e=>{
  const[mx,my]=c2w(e.offsetX,e.offsetY)
  app.querySelector('#info').textContent=
    'canvas ('+Math.round(e.offsetX)+', '+Math.round(e.offsetY)+')  →  math ('+mx.toFixed(2)+', '+my.toFixed(2)+')'
})`,
            },
            {
              id: 2,
              mode: 'html',
              cellTitle: 'Tick Marks and Labels',
              prose: [
                '`niceStep` computes a readable tick interval for any zoom level — it always produces 1, 2, 5, 0.1, 0.2 etc. The tick loop starts at `Math.ceil(xMin / step) * step` to align ticks to multiples of `step`.',
                'Clamp label positions to stay inside the canvas: `Math.min(oy + 14, H − 4)` keeps x-axis labels visible even when the x-axis is near the bottom edge.',
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:12px;display:flex;flex-direction:column;gap:8px;overflow:hidden}
    h3{font-size:13px;font-weight:600;color:var(--text);margin:0;flex-shrink:0}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <h3>Tick marks and labels</h3>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

let vp={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-vp.xMin)/(vp.xMax-vp.xMin)*W, H-(my-vp.yMin)/(vp.yMax-vp.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

function niceStep(range,maxTicks){
  const rough=range/maxTicks, mag=Math.pow(10,Math.floor(Math.log10(rough))), frac=rough/mag
  return(frac<1.5?1:frac<3.5?2:frac<7.5?5:10)*mag
}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}

function drawAxesAndTicks(C){
  const[,oy]=w2c(0,0), [ox]=w2c(0,0)
  // Axes
  ctx.strokeStyle=C.muted; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  // X ticks
  const xStep=niceStep(vp.xMax-vp.xMin,8)
  ctx.fillStyle=C.muted; ctx.font='10px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(vp.xMin/xStep)*xStep; x<=vp.xMax+xStep*0.01; x+=xStep){
    if(Math.abs(x)<xStep*0.001) continue
    const px=w2c(x,0)[0]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5
    ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke()
    ctx.fillText(fmt(x), px, Math.min(oy+14, H-4))
  }
  // Y ticks
  const yStep=niceStep(vp.yMax-vp.yMin,6)
  ctx.textAlign='right'
  for(let y=Math.ceil(vp.yMin/yStep)*yStep; y<=vp.yMax+yStep*0.01; y+=yStep){
    if(Math.abs(y)<yStep*0.001) continue
    const py=w2c(0,y)[1]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5
    ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke()
    ctx.fillText(fmt(y), Math.max(ox-4, 28), py+4)
  }
}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  drawAxesAndTicks(C)
  const f=makeFunc('sin(x)')
  ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=vp.xMin+(i/W)*(vp.xMax-vp.xMin), my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}
redraw()`,
            },
            {
              id: 3,
              mode: 'html',
              cellTitle: 'Zoom Buttons',
              prose: [
                'Zoom in multiplies both half-widths by 0.7 (shrink the range to 70%). Zoom out divides by 0.7 (multiply by 1/0.7 ≈ 1.43). Both operations keep the viewport centre fixed.',
                'A Home button restores the original viewport — useful when you zoom too far and get lost.',
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .bar{display:flex;gap:6px;align-items:center;flex-shrink:0}
    button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px;font-weight:600}
    button:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
    .note{font-size:12px;color:var(--muted);flex-shrink:0}
  </style>
  <div class="wrap">
    <div class="bar">
      <button id="zin">＋ Zoom In</button>
      <button id="zout">－ Zoom Out</button>
      <button id="home">⌂ Home</button>
      <span class="note" id="info"></span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const DEFAULT={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
let vp={...DEFAULT}
function w2c(mx,my){return[(mx-vp.xMin)/(vp.xMax-vp.xMin)*W, H-(my-vp.yMin)/(vp.yMax-vp.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
function niceStep(range,maxTicks){const rough=range/maxTicks,mag=Math.pow(10,Math.floor(Math.log10(rough))),frac=rough/mag;return(frac<1.5?1:frac<3.5?2:frac<7.5?5:10)*mag}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}

function zoom(factor){
  const cx=(vp.xMin+vp.xMax)/2, cy=(vp.yMin+vp.yMax)/2
  const hw=(vp.xMax-vp.xMin)/2*factor, hh=(vp.yMax-vp.yMin)/2*factor
  vp={xMin:cx-hw,xMax:cx+hw,yMin:cy-hh,yMax:cy+hh}
  redraw()
}

function drawAxesAndTicks(C){
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xStep=niceStep(vp.xMax-vp.xMin,8)
  ctx.fillStyle=C.muted; ctx.font='10px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(vp.xMin/xStep)*xStep;x<=vp.xMax+xStep*0.01;x+=xStep){
    if(Math.abs(x)<xStep*0.001) continue
    const px=w2c(x,0)[0]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5
    ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke()
    ctx.fillText(fmt(x),px,Math.min(oy+14,H-4))
  }
  const yStep=niceStep(vp.yMax-vp.yMin,6)
  ctx.textAlign='right'
  for(let y=Math.ceil(vp.yMin/yStep)*yStep;y<=vp.yMax+yStep*0.01;y+=yStep){
    if(Math.abs(y)<yStep*0.001) continue
    const py=w2c(0,y)[1]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5
    ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke()
    ctx.fillText(fmt(y),Math.max(ox-4,28),py+4)
  }
}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  drawAxesAndTicks(C)
  const f=makeFunc('sin(x)*x/3')
  ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=vp.xMin+(i/W)*(vp.xMax-vp.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
  app.querySelector('#info').textContent='x: ['+vp.xMin.toFixed(1)+', '+vp.xMax.toFixed(1)+']'
}

app.querySelector('#zin').addEventListener('click',()=>zoom(0.7))
app.querySelector('#zout').addEventListener('click',()=>zoom(1/0.7))
app.querySelector('#home').addEventListener('click',()=>{ vp={...DEFAULT}; redraw() })
redraw()`,
            },
            {
              id: 4,
              mode: 'html',
              cellTitle: 'Click-Drag Pan',
              prose: [
                'On mousedown, snapshot the current viewport and the starting pixel. On every mousemove, compute the pixel delta from the snapshot and convert it to a world shift. Reset `drag` to null on mouseup or mouseleave.',
                'Always pan against the *snapshot* viewport — never accumulate deltas. Accumulation causes drift from floating-point rounding over many mousemove events.',
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .bar{display:flex;gap:6px;align-items:center;flex-shrink:0}
    button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px;font-weight:600}
    button:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface);cursor:grab}
    canvas.dragging{cursor:grabbing}
    .note{font-size:12px;color:var(--muted);flex-shrink:0}
  </style>
  <div class="wrap">
    <div class="bar">
      <button id="zin">＋</button>
      <button id="zout">－</button>
      <button id="home">⌂</button>
      <span class="note">Drag to pan · +/− to zoom</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const DEFAULT={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
let vp={...DEFAULT}
function w2c(mx,my){return[(mx-vp.xMin)/(vp.xMax-vp.xMin)*W, H-(my-vp.yMin)/(vp.yMax-vp.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
function niceStep(range,maxTicks){const rough=range/maxTicks,mag=Math.pow(10,Math.floor(Math.log10(rough))),frac=rough/mag;return(frac<1.5?1:frac<3.5?2:frac<7.5?5:10)*mag}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}

function zoom(factor){
  const cx=(vp.xMin+vp.xMax)/2,cy=(vp.yMin+vp.yMax)/2
  const hw=(vp.xMax-vp.xMin)/2*factor,hh=(vp.yMax-vp.yMin)/2*factor
  vp={xMin:cx-hw,xMax:cx+hw,yMin:cy-hh,yMax:cy+hh}; redraw()
}

let drag=null
cv.addEventListener('mousedown',e=>{
  drag={startX:e.offsetX,startY:e.offsetY,vp:{...vp}}
  cv.classList.add('dragging')
})
cv.addEventListener('mousemove',e=>{
  if(!drag) return
  const dpx=e.offsetX-drag.startX, dpy=e.offsetY-drag.startY
  const xr=drag.vp.xMax-drag.vp.xMin, yr=drag.vp.yMax-drag.vp.yMin
  vp={
    xMin:drag.vp.xMin-dpx/W*xr, xMax:drag.vp.xMax-dpx/W*xr,
    yMin:drag.vp.yMin+dpy/H*yr, yMax:drag.vp.yMax+dpy/H*yr,
  }
  redraw()
})
cv.addEventListener('mouseup',()=>{ drag=null; cv.classList.remove('dragging') })
cv.addEventListener('mouseleave',()=>{ drag=null; cv.classList.remove('dragging') })

function drawAxesAndTicks(C){
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xStep=niceStep(vp.xMax-vp.xMin,8)
  ctx.fillStyle=C.muted; ctx.font='10px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(vp.xMin/xStep)*xStep;x<=vp.xMax+xStep*0.01;x+=xStep){
    if(Math.abs(x)<xStep*0.001) continue
    const px=w2c(x,0)[0]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5
    ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke()
    ctx.fillText(fmt(x),px,Math.min(oy+14,H-4))
  }
  const yStep=niceStep(vp.yMax-vp.yMin,6)
  ctx.textAlign='right'
  for(let y=Math.ceil(vp.yMin/yStep)*yStep;y<=vp.yMax+yStep*0.01;y+=yStep){
    if(Math.abs(y)<yStep*0.001) continue
    const py=w2c(0,y)[1]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5
    ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke()
    ctx.fillText(fmt(y),Math.max(ox-4,28),py+4)
  }
}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  drawAxesAndTicks(C)
  const f=makeFunc('sin(x)*x/3')
  ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=vp.xMin+(i/W)*(vp.xMax-vp.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

app.querySelector('#zin').addEventListener('click',()=>zoom(0.7))
app.querySelector('#zout').addEventListener('click',()=>zoom(1/0.7))
app.querySelector('#home').addEventListener('click',()=>{ vp={...DEFAULT}; redraw() })
redraw()`,
            },

            // ── Challenges ──────────────────────────────────────────────────────
            {
              id: 'c1',
              isChallenge: true,
              mode: 'html',
              challengeTitle: 'Change the Default Viewport',
              difficulty: 'easy',
              prompt: 'Change the default viewport to show only the first period of sin(x): x from 0 to 2π, y from −1.5 to 1.5. The tick marks and trace should automatically adapt to the new range.',
              hint: '2π ≈ 6.283. Set `DEFAULT = { xMin: 0, xMax: 6.283, yMin: -1.5, yMax: 1.5 }`. That is the only change needed — `niceStep` will compute appropriate tick intervals automatically.',
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .bar{display:flex;gap:6px;align-items:center;flex-shrink:0}
    button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px;font-weight:600}
    button:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="bar">
      <button id="zin">＋</button><button id="zout">－</button><button id="home">⌂ Home</button>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

// TODO: change these values to show x ∈ [0, 2π], y ∈ [−1.5, 1.5]
const DEFAULT={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
let vp={...DEFAULT}

function w2c(mx,my){return[(mx-vp.xMin)/(vp.xMax-vp.xMin)*W, H-(my-vp.yMin)/(vp.yMax-vp.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
function niceStep(range,maxTicks){const rough=range/maxTicks,mag=Math.pow(10,Math.floor(Math.log10(rough))),frac=rough/mag;return(frac<1.5?1:frac<3.5?2:frac<7.5?5:10)*mag}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}
function zoom(factor){const cx=(vp.xMin+vp.xMax)/2,cy=(vp.yMin+vp.yMax)/2,hw=(vp.xMax-vp.xMin)/2*factor,hh=(vp.yMax-vp.yMin)/2*factor;vp={xMin:cx-hw,xMax:cx+hw,yMin:cy-hh,yMax:cy+hh};redraw()}

function drawAxesAndTicks(C){
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xStep=niceStep(vp.xMax-vp.xMin,8)
  ctx.fillStyle=C.muted; ctx.font='10px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(vp.xMin/xStep)*xStep;x<=vp.xMax+xStep*0.01;x+=xStep){
    if(Math.abs(x)<xStep*0.001) continue
    const px=w2c(x,0)[0]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke()
    ctx.fillText(fmt(x),px,Math.min(oy+14,H-4))
  }
  const yStep=niceStep(vp.yMax-vp.yMin,6); ctx.textAlign='right'
  for(let y=Math.ceil(vp.yMin/yStep)*yStep;y<=vp.yMax+yStep*0.01;y+=yStep){
    if(Math.abs(y)<yStep*0.001) continue
    const py=w2c(0,y)[1]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke()
    ctx.fillText(fmt(y),Math.max(ox-4,28),py+4)
  }
}

function redraw(){
  const C=getC(); ctx.clearRect(0,0,W,H); drawAxesAndTicks(C)
  const f=makeFunc('sin(x)')
  ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=vp.xMin+(i/W)*(vp.xMax-vp.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

app.querySelector('#zin').addEventListener('click',()=>zoom(0.7))
app.querySelector('#zout').addEventListener('click',()=>zoom(1/0.7))
app.querySelector('#home').addEventListener('click',()=>{ vp={...DEFAULT}; redraw() })
redraw()`,
            },
            {
              id: 'c2',
              isChallenge: true,
              mode: 'html',
              challengeTitle: 'Scroll-Wheel Zoom',
              difficulty: 'medium',
              prompt: 'Add mouse-wheel zoom. Scrolling up should zoom in (smaller range), scrolling down should zoom out (larger range). Zoom toward the mouse position, not the centre, so the point under the cursor stays fixed.',
              hint: 'Listen for the `\'wheel\'` event on the canvas. `e.deltaY > 0` means scrolling down (zoom out, factor > 1). `e.deltaY < 0` means scrolling up (zoom in, factor < 1). To zoom toward the mouse: use `c2w(e.offsetX, e.offsetY)` to get the world point under the cursor, zoom the viewport, then shift it so that world point maps back to the same pixel.',
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .bar{display:flex;gap:6px;align-items:center;flex-shrink:0}
    button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px;font-weight:600}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface);cursor:crosshair}
    .note{font-size:12px;color:var(--muted);flex-shrink:0}
  </style>
  <div class="wrap">
    <div class="bar">
      <button id="home">⌂ Home</button>
      <span class="note">Scroll to zoom · drag to pan</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const DEFAULT={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
let vp={...DEFAULT}
function w2c(mx,my){return[(mx-vp.xMin)/(vp.xMax-vp.xMin)*W, H-(my-vp.yMin)/(vp.yMax-vp.yMin)*H]}
function c2w(px,py){return[vp.xMin+(px/W)*(vp.xMax-vp.xMin), vp.yMin+((H-py)/H)*(vp.yMax-vp.yMin)]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
function niceStep(range,maxTicks){const rough=range/maxTicks,mag=Math.pow(10,Math.floor(Math.log10(rough))),frac=rough/mag;return(frac<1.5?1:frac<3.5?2:frac<7.5?5:10)*mag}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}

// TODO: implement scroll-wheel zoom
// cv.addEventListener('wheel', e => {
//   e.preventDefault()
//   const factor = e.deltaY > 0 ? 1.15 : 0.87   // scroll down = zoom out, up = zoom in
//   const [mx, my] = c2w(e.offsetX, e.offsetY)   // world point under cursor
//   // Scale the viewport ranges around the cursor world point:
//   vp = {
//     xMin: mx + (vp.xMin - mx) * factor,
//     xMax: mx + (vp.xMax - mx) * factor,
//     yMin: my + (vp.yMin - my) * factor,
//     yMax: my + (vp.yMax - my) * factor,
//   }
//   redraw()
// }, { passive: false })

let drag=null
cv.addEventListener('mousedown',e=>{drag={startX:e.offsetX,startY:e.offsetY,vp:{...vp}}})
cv.addEventListener('mousemove',e=>{
  if(!drag) return
  const dpx=e.offsetX-drag.startX,dpy=e.offsetY-drag.startY
  const xr=drag.vp.xMax-drag.vp.xMin,yr=drag.vp.yMax-drag.vp.yMin
  vp={xMin:drag.vp.xMin-dpx/W*xr,xMax:drag.vp.xMax-dpx/W*xr,yMin:drag.vp.yMin+dpy/H*yr,yMax:drag.vp.yMax+dpy/H*yr}
  redraw()
})
cv.addEventListener('mouseup',()=>drag=null)
cv.addEventListener('mouseleave',()=>drag=null)

function drawAxesAndTicks(C){
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xStep=niceStep(vp.xMax-vp.xMin,8)
  ctx.fillStyle=C.muted; ctx.font='10px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(vp.xMin/xStep)*xStep;x<=vp.xMax+xStep*0.01;x+=xStep){
    if(Math.abs(x)<xStep*0.001) continue
    const px=w2c(x,0)[0]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke()
    ctx.fillText(fmt(x),px,Math.min(oy+14,H-4))
  }
  const yStep=niceStep(vp.yMax-vp.yMin,6); ctx.textAlign='right'
  for(let y=Math.ceil(vp.yMin/yStep)*yStep;y<=vp.yMax+yStep*0.01;y+=yStep){
    if(Math.abs(y)<yStep*0.001) continue
    const py=w2c(0,y)[1]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke()
    ctx.fillText(fmt(y),Math.max(ox-4,28),py+4)
  }
}

function redraw(){
  const C=getC(); ctx.clearRect(0,0,W,H); drawAxesAndTicks(C)
  const f=makeFunc('sin(x)*x/3')
  ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=vp.xMin+(i/W)*(vp.xMax-vp.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

app.querySelector('#home').addEventListener('click',()=>{ vp={...DEFAULT}; redraw() })
redraw()`,
            },
            {
              id: 'c3',
              isChallenge: true,
              mode: 'html',
              challengeTitle: 'Fit Viewport to Function',
              difficulty: 'hard',
              prompt: 'Add a "Fit" button. When clicked, sample the current function at 400 points across x ∈ [−10, 10], find the yMin and yMax of the finite results, and set the viewport so the function fills ~80% of the canvas height. Keep xMin/xMax unchanged.',
              hint: 'Loop `i` from 0 to 400, compute `x = −10 + i/400 * 20`, evaluate `f(x, 0)`. Collect all finite `y` values into an array. `yMin = Math.min(...ys)`, `yMax = Math.max(...ys)`. Add 10% padding: `const pad = (yMax - yMin) * 0.1; vp.yMin = yMin - pad; vp.yMax = yMax + pad`.',
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .bar{display:flex;gap:6px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:100px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px;font-weight:600}
    button:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="bar">
      <input id="exprIn" type="text" value="sin(x)*x/3" placeholder="expression">
      <button id="plot">Plot</button>
      <button id="fit">⤢ Fit</button>
      <button id="home">⌂</button>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const DEFAULT={xMin:-10,xMax:10,yMin:-5,yMax:5}
let vp={...DEFAULT}, currentExpr='sin(x)*x/3'
function w2c(mx,my){return[(mx-vp.xMin)/(vp.xMax-vp.xMin)*W, H-(my-vp.yMin)/(vp.yMax-vp.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}
function niceStep(range,maxTicks){const rough=range/maxTicks,mag=Math.pow(10,Math.floor(Math.log10(rough))),frac=rough/mag;return(frac<1.5?1:frac<3.5?2:frac<7.5?5:10)*mag}
function fmt(v){return parseFloat(v.toFixed(8)).toString()}

function fitViewport(){
  const f=makeFunc(currentExpr)
  const ys=[]
  // TODO: sample f at 400 points across x ∈ [vp.xMin, vp.xMax]
  // for(let i=0;i<=400;i++){
  //   const x=vp.xMin+(i/400)*(vp.xMax-vp.xMin), y=f(x,0)
  //   if(isFinite(y)&&Math.abs(y)<1e6) ys.push(y)
  // }
  // if(ys.length===0) return
  // TODO: compute yMin/yMax and add 10% padding, then call redraw()
  // const yMin=Math.min(...ys), yMax=Math.max(...ys)
  // const pad=(yMax-yMin)*0.1
  // vp.yMin=yMin-pad; vp.yMax=yMax+pad
  // redraw()
}

function drawAxesAndTicks(C){
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.muted; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  const xStep=niceStep(vp.xMax-vp.xMin,8)
  ctx.fillStyle=C.muted; ctx.font='10px system-ui'; ctx.textAlign='center'
  for(let x=Math.ceil(vp.xMin/xStep)*xStep;x<=vp.xMax+xStep*0.01;x+=xStep){
    if(Math.abs(x)<xStep*0.001) continue
    const px=w2c(x,0)[0]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke()
    ctx.fillText(fmt(x),px,Math.min(oy+14,H-4))
  }
  const yStep=niceStep(vp.yMax-vp.yMin,6); ctx.textAlign='right'
  for(let y=Math.ceil(vp.yMin/yStep)*yStep;y<=vp.yMax+yStep*0.01;y+=yStep){
    if(Math.abs(y)<yStep*0.001) continue
    const py=w2c(0,y)[1]
    ctx.strokeStyle=C.border+'44'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke()
    ctx.fillText(fmt(y),Math.max(ox-4,28),py+4)
  }
}

function redraw(){
  const C=getC(); ctx.clearRect(0,0,W,H); drawAxesAndTicks(C)
  const f=makeFunc(currentExpr)
  ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=vp.xMin+(i/W)*(vp.xMax-vp.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

app.querySelector('#plot').addEventListener('click',()=>{ currentExpr=app.querySelector('#exprIn').value.trim()||currentExpr; redraw() })
app.querySelector('#fit').addEventListener('click',fitViewport)
app.querySelector('#home').addEventListener('click',()=>{ vp={...DEFAULT}; redraw() })
redraw()`,
            },
          ],
        },
      },
    ],
  },
}

export default sim2_008
