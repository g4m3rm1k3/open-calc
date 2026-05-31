const sim2_009 = {
  id: "sim2-009",
  slug: "analysis-tools",
  chapter: "sim2",
  order: 9,
  title: "Analysis Tools",
  subtitle:
    "Add a numerical derivative, a moveable tangent line, and an automatic zero-crossing scanner — turning the static plotter into a lightweight calculus tool.",
  tags: [
    "derivative",
    "tangent line",
    "zero crossings",
    "numerical methods",
    "central difference",
    "canvas",
  ],
  timeToComplete: 40,
  coreConcept:
    "Numerical differentiation (central difference) approximates f'(x) ≈ (f(x+h) − f(x−h)) / (2h). A tangent line is drawn by evaluating f and f' at one x position and extending the resulting line across the viewport. Zero crossings are found by scanning for sign changes in the function's output.",

  hook: {
    question:
      "A CAS system shows you a tangent line that moves as you drag a slider. Where does it get the slope from — and how does it find the zeros without solving the equation symbolically?",
    realWorldContext:
      "Root-finding algorithms (Newton's method, bisection) power everything from circuit simulators to machine-learning optimisers. The sign-change scan you write here is the first step of bisection — the numerical backbone used when closed-form solutions don't exist. Every scientific computing library has these tools; this lesson shows you how they work at the pixel level.",
  },

  intuition: {
    prose: [
      "**Central difference approximates the derivative.** `f'(x) ≈ (f(x+h) − f(x−h)) / (2h)`. Using symmetric points on both sides of x makes the error proportional to h², much smaller than the one-sided difference `(f(x+h) − f(x)) / h` whose error is proportional to h. A step of `h = 0.001` gives about 6 significant digits of accuracy for smooth functions.",
      "**Choose h carefully.** Too large and the approximation is inaccurate (it averages over too wide a region). Too small and floating-point cancellation destroys precision — subtracting two nearly-equal numbers amplifies relative error. For 64-bit doubles, `h ≈ 1e-5` is close to optimal for smooth functions; `h = 0.001` is a safe, readable default that works for most plotter expressions.",
      "**Tangent line from one point and a slope.** The tangent at `x₀` has equation `y − y₀ = m(x − x₀)` where `y₀ = f(x₀)` and `m = f'(x₀)`. To draw the line across the full viewport, evaluate it at `x = xMin` and `x = xMax`, map both endpoints with `w2c`, and connect them. If either endpoint falls outside the canvas, the line segment will be clipped automatically.",
      "**Zero crossings by sign-change scan.** Walk `x` from `xMin` to `xMax` in small steps. Whenever `f(x_prev)` and `f(x_curr)` have opposite signs, a root lies between them. Use linear interpolation to refine: `x_root ≈ x_prev + |f(x_prev)| / (|f(x_prev)| + |f(x_curr)|) × step`. This is the bisection method collapsed to one step — accurate enough to place a dot on the canvas.",
      "**Overlay vs redraw.** Analysis overlays (tangent line, zero dots) are drawn on top of the existing function trace every time `redraw()` is called. All three layers — grid, trace, overlays — are redrawn from scratch each time. This is simpler than layered canvases and fast enough for event-driven (non-animated) plotting.",
    ],
    callouts: [
      {
        type: "sequencing",
        title: "Lesson 9 of 10 — Analysis Tools",
        body: "**Previous:** Lesson 8 — Axes and Viewport. The `w2c`, `c2w`, tick marks, and drag-pan code carry forward.\n**This lesson:** Numerical derivative, tangent line, and zero-crossing scanner.\n**Next:** Lesson 10 — Capstone. Combine all tools into a single polished plotter with animation and presets.",
      },
      {
        type: "definition",
        title: "Central Difference Formula",
        body: "```js\nfunction deriv(f, x, h) {\n  return (f(x + h, 0) - f(x - h, 0)) / (2 * h)\n}\n```\n\nDefault `h = 0.001` works well for smooth expressions. The error is O(h²) — ten times smaller h gives one hundred times better accuracy (until floating-point cancellation dominates around h ≈ 1e-7).",
      },
      {
        type: "procedure",
        title: "Drawing the Tangent Line",
        body: "```js\nconst y0 = f(x0, 0)\nconst m  = deriv(f, x0)\n// Extend to viewport edges\nconst yLeft  = m * (vp.xMin - x0) + y0\nconst yRight = m * (vp.xMax - x0) + y0\nconst [px1,py1] = w2c(vp.xMin, yLeft)\nconst [px2,py2] = w2c(vp.xMax, yRight)\nctx.beginPath(); ctx.moveTo(px1,py1); ctx.lineTo(px2,py2); ctx.stroke()\n```",
      },
      {
        type: "warning",
        title: "Avoid h = 0 and Very Small h",
        body: "Setting `h = 0` gives `0/0 = NaN`. Setting `h` below ~1e-8 causes floating-point cancellation: `f(x + 1e-15) === f(x)` for most functions because `x + 1e-15` rounds back to `x`. The safe range for 64-bit doubles is roughly `h ∈ [1e-7, 0.1]`.",
      },
      {
        type: "insight",
        title: "Sign-Change Root Refinement",
        body: "Linear interpolation between `(xA, fA)` and `(xB, fB)` where `fA` and `fB` have opposite signs:\n\n```js\nconst t = fA / (fA - fB)   // fraction across [xA, xB] where zero lies\nconst x_root = xA + t * (xB - xA)\n```\n\nThis is one step of the false-position method. It is more accurate than using the midpoint `(xA + xB) / 2`.",
      },
      {
        type: "strategy",
        title: "Scan Resolution vs Accuracy",
        body: "Use 400 scan steps across the viewport for the zero finder — fine enough to catch closely-spaced roots like those of `sin(20*x)`, coarse enough to stay fast. After locating a sign-change interval, refine with linear interpolation rather than increasing the step count. Increasing steps improves coverage; interpolation improves precision within a found interval.",
      },
    ],
    visualizations: [
      {
        id: "SimNotebook",
        title: "Analysis Tools — Four Cells",
        mathBridge:
          "Work through the four cells in order. Cell 1 implements the numerical derivative and displays f'(x). Cell 2 adds the tangent line with a draggable slider. Cell 3 scans for zero crossings. Cell 4 combines all three tools.",
        initialProps: {
          initialCells: [
            {
              id: 1,
              mode: "html",
              cellTitle: "Numerical Derivative",
              prose: [
                "Implement the central difference formula. The readout shows f(x₀), f'(x₀), and the slope angle in degrees. Drag the slider to move x₀ across the domain.",
                "Try `tan(x)` near ±π/2 and observe the derivative exploding — that is the vertical asymptote captured numerically.",
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .row{display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:80px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    input[type=range]{flex:1;max-width:200px;accent-color:var(--accent)}
    button{padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px}
    .kv{font-size:12px;color:var(--text);font-variant-numeric:tabular-nums}
    .lbl{font-size:12px;color:var(--muted)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="expr" type="text" value="sin(x)*x/3" placeholder="expression">
      <button id="plot">Plot</button>
    </div>
    <div class="row">
      <span class="lbl">x₀</span>
      <input type="range" id="sl" min="-7" max="7" step="0.05" value="1">
      <span class="kv" id="out">—</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const H_STEP=0.001
function deriv(f,x){return(f(x+H_STEP,0)-f(x-H_STEP,0))/(2*H_STEP)}

let expr='sin(x)*x/3', f=makeFunc(expr)

function redraw(){
  const C=getC(), x0=parseFloat(app.querySelector('#sl').value)
  ctx.clearRect(0,0,W,H)
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.border+'88'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  // Trace
  ctx.strokeStyle=C.border; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
  // Derivative marker
  const y0=f(x0,0), m=deriv(f,x0)
  if(isFinite(y0)&&isFinite(m)){
    const[px0,py0]=w2c(x0,y0)
    ctx.fillStyle=C.accent; ctx.beginPath(); ctx.arc(px0,py0,5,0,2*Math.PI); ctx.fill()
    // Vertical dashed line at x0
    ctx.setLineDash([4,4]); ctx.strokeStyle=C.accent+'99'; ctx.lineWidth=1
    ctx.beginPath(); ctx.moveTo(px0,0); ctx.lineTo(px0,H); ctx.stroke()
    ctx.setLineDash([])
    app.querySelector('#out').textContent=
      'x₀='+x0.toFixed(3)+'  f(x₀)='+y0.toFixed(4)+'  f\\'(x₀)='+m.toFixed(4)+'  angle='+Math.atan(m).toFixed(3)+'rad'
  }
}

app.querySelector('#plot').addEventListener('click',()=>{
  expr=app.querySelector('#expr').value.trim()||expr; f=makeFunc(expr); redraw()
})
app.querySelector('#sl').addEventListener('input',redraw)
redraw()`,
            },
            {
              id: 2,
              mode: "html",
              cellTitle: "Moving Tangent Line",
              prose: [
                "Extend the point marker into a full tangent line: compute f'(x₀), evaluate the tangent equation at xMin and xMax, then draw a line between those two endpoints.",
                "Try `x*x/4` near x=0 (slope=0, flat tangent) then near x=4 (slope=2, steep). The tangent line is always the best linear approximation to the curve at that point.",
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .row{display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:80px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    input[type=range]{flex:1;max-width:200px;accent-color:var(--accent)}
    button{padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px}
    .kv{font-size:12px;color:var(--text);font-variant-numeric:tabular-nums}
    .lbl{font-size:12px;color:var(--muted)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="expr" type="text" value="x*x/4" placeholder="expression">
      <button id="plot">Plot</button>
    </div>
    <div class="row">
      <span class="lbl">x₀</span>
      <input type="range" id="sl" min="-6" max="6" step="0.05" value="2">
      <span class="kv" id="out">—</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-4,yMax:12}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const H_STEP=0.001
function deriv(f,x){return(f(x+H_STEP,0)-f(x-H_STEP,0))/(2*H_STEP)}

let expr='x*x/4', f=makeFunc(expr)

function redraw(){
  const C=getC(), x0=parseFloat(app.querySelector('#sl').value)
  ctx.clearRect(0,0,W,H)
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.border+'88'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  // Curve
  ctx.strokeStyle=C.border; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
  // Tangent line
  const y0=f(x0,0), m=deriv(f,x0)
  if(isFinite(y0)&&isFinite(m)){
    const yLeft =m*(VP.xMin-x0)+y0
    const yRight=m*(VP.xMax-x0)+y0
    const[px1,py1]=w2c(VP.xMin,yLeft),[px2,py2]=w2c(VP.xMax,yRight)
    ctx.strokeStyle=C.accent; ctx.lineWidth=2
    ctx.beginPath(); ctx.moveTo(px1,py1); ctx.lineTo(px2,py2); ctx.stroke()
    const[px0,py0]=w2c(x0,y0)
    ctx.fillStyle=C.accent; ctx.beginPath(); ctx.arc(px0,py0,5,0,2*Math.PI); ctx.fill()
    app.querySelector('#out').textContent='slope f\\'('+x0.toFixed(2)+') = '+m.toFixed(4)
  }
}

app.querySelector('#plot').addEventListener('click',()=>{
  expr=app.querySelector('#expr').value.trim()||expr; f=makeFunc(expr); redraw()
})
app.querySelector('#sl').addEventListener('input',redraw)
redraw()`,
            },
            {
              id: 3,
              mode: "html",
              cellTitle: "Zero Crossings",
              prose: [
                "Walk x from xMin to xMax in small steps. When adjacent samples have opposite signs, a root lies between them. Linear interpolation refines the estimate to sub-pixel accuracy.",
                "Try `sin(x)` — six zeros visible in [−7, 7]. Try `tan(x)` — notice the scanner correctly ignores the sign changes at the asymptotes because those points are non-finite.",
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .row{display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:80px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    button{padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px}
    .kv{font-size:12px;color:var(--text)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="expr" type="text" value="sin(x)" placeholder="expression">
      <button id="plot">Find Zeros</button>
      <span class="kv" id="out">—</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

function findZeros(f,xMin,xMax,steps){
  const zeros=[]
  let prevX=xMin, prevY=f(xMin,0)
  for(let i=1;i<=steps;i++){
    const x=xMin+(i/steps)*(xMax-xMin), y=f(x,0)
    if(isFinite(prevY)&&isFinite(y)&&prevY*y<0){
      const t=prevY/(prevY-y)
      zeros.push(prevX+t*(x-prevX))
    }
    prevX=x; prevY=y
  }
  return zeros
}

let expr='sin(x)', f=makeFunc(expr)

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.border+'88'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  // Curve
  ctx.strokeStyle=C.border; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
  // Zeros
  const zeros=findZeros(f,VP.xMin,VP.xMax,400)
  ctx.fillStyle=C.accent
  for(const x of zeros){
    const[px,py]=w2c(x,0)
    ctx.beginPath(); ctx.arc(px,py,5,0,2*Math.PI); ctx.fill()
  }
  app.querySelector('#out').textContent=zeros.length+' zero'+(zeros.length!==1?'s':'')+
    (zeros.length?': '+zeros.map(z=>z.toFixed(3)).join(', '):'')
}

app.querySelector('#plot').addEventListener('click',()=>{
  expr=app.querySelector('#expr').value.trim()||expr; f=makeFunc(expr); redraw()
})
redraw()`,
            },
            {
              id: 4,
              mode: "html",
              cellTitle: "Combined Analysis Widget",
              prose: [
                "Combine tangent line and zero crossing into one interactive tool. The tangent slider and zero scan both respond to the same function — toggle each overlay with a checkbox.",
                "Try `sin(x)*exp(-x/5)` (damped oscillation): the zero crossings are spaced by π, and the tangent slope decays toward zero as the amplitude fades.",
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:5px;overflow:hidden}
    .row{display:flex;gap:6px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:80px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    input[type=range]{flex:1;max-width:180px;accent-color:var(--accent)}
    button{padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px}
    label{font-size:12px;color:var(--text);display:flex;align-items:center;gap:4px}
    .kv{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="expr" type="text" value="sin(x)*exp(-x/5)" placeholder="expression">
      <button id="plot">Plot</button>
    </div>
    <div class="row">
      <label><input type="checkbox" id="showTan" checked> Tangent</label>
      <label><input type="checkbox" id="showZeros" checked> Zeros</label>
      <input type="range" id="sl" min="-7" max="7" step="0.05" value="0">
      <span class="kv" id="out">—</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-2,yMax:2}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const H_STEP=0.001
function deriv(f,x){return(f(x+H_STEP,0)-f(x-H_STEP,0))/(2*H_STEP)}
function findZeros(f,xMin,xMax,steps){
  const z=[];let px=xMin,py=f(xMin,0)
  for(let i=1;i<=steps;i++){
    const x=xMin+(i/steps)*(xMax-xMin),y=f(x,0)
    if(isFinite(py)&&isFinite(y)&&py*y<0){const t=py/(py-y);z.push(px+t*(x-px))}
    px=x;py=y
  }
  return z
}

let expr='sin(x)*exp(-x/5)', f=makeFunc(expr)

function redraw(){
  const C=getC(), x0=parseFloat(app.querySelector('#sl').value)
  const showTan=app.querySelector('#showTan').checked
  const showZeros=app.querySelector('#showZeros').checked
  ctx.clearRect(0,0,W,H)
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.border+'88'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  ctx.strokeStyle=C.border; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
  if(showZeros){
    const zeros=findZeros(f,VP.xMin,VP.xMax,400)
    ctx.fillStyle='#f59e0b'
    for(const x of zeros){const[px,py]=w2c(x,0);ctx.beginPath();ctx.arc(px,py,5,0,2*Math.PI);ctx.fill()}
  }
  if(showTan){
    const y0=f(x0,0), m=deriv(f,x0)
    if(isFinite(y0)&&isFinite(m)){
      const[px1,py1]=w2c(VP.xMin,m*(VP.xMin-x0)+y0),[px2,py2]=w2c(VP.xMax,m*(VP.xMax-x0)+y0)
      ctx.strokeStyle=C.accent; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(px1,py1); ctx.lineTo(px2,py2); ctx.stroke()
      const[px0,py0]=w2c(x0,y0)
      ctx.fillStyle=C.accent; ctx.beginPath(); ctx.arc(px0,py0,5,0,2*Math.PI); ctx.fill()
      app.querySelector('#out').textContent='f('+x0.toFixed(2)+')='+y0.toFixed(4)+'  f\\'='+m.toFixed(4)
    }
  }
}

app.querySelector('#plot').addEventListener('click',()=>{
  expr=app.querySelector('#expr').value.trim()||expr; f=makeFunc(expr); redraw()
})
app.querySelector('#sl').addEventListener('input',redraw)
app.querySelector('#showTan').addEventListener('change',redraw)
app.querySelector('#showZeros').addEventListener('change',redraw)
redraw()`,
            },

            // ── Challenges ──────────────────────────────────────────────────────
            {
              id: "c1",
              isChallenge: true,
              mode: "html",
              challengeTitle: "Adjust h and Observe Precision",
              difficulty: "easy",
              prompt:
                "The `H_STEP` constant controls how far apart the two sample points are in the central-difference formula. Change it from 0.001 to 1.0, then to 0.000001, and observe how the displayed slope changes. At what value does the approximation become noticeably wrong?",
              hint: "Try `H_STEP = 1.0` for `sin(x)` at x₀ = 0. The true derivative is cos(0) = 1.0. The central difference gives (sin(1) − sin(−1)) / 2 ≈ 0.841. Try `H_STEP = 1e-10` — floating-point cancellation returns 0 or NaN for many expressions.",
              code: `const H_STEP = 0.001   // TODO: change to 1.0, then 0.1, then 0.000001 — observe slope change

app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .row{display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=range]{flex:1;max-width:200px;accent-color:var(--accent)}
    .kv{font-size:12px;color:var(--text);font-variant-numeric:tabular-nums}
    .lbl{font-size:12px;color:var(--muted)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="row">
      <span class="lbl">x₀</span>
      <input type="range" id="sl" min="-7" max="7" step="0.05" value="0">
      <span class="kv" id="out">—</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

function deriv(f,x){return(f(x+H_STEP,0)-f(x-H_STEP,0))/(2*H_STEP)}

const f=makeFunc('sin(x)')

function redraw(){
  const C=getC(), x0=parseFloat(app.querySelector('#sl').value)
  ctx.clearRect(0,0,W,H)
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.border+'88'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  ctx.strokeStyle=C.border; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
  const y0=f(x0,0), m=deriv(f,x0)
  const[px1,py1]=w2c(VP.xMin,m*(VP.xMin-x0)+y0),[px2,py2]=w2c(VP.xMax,m*(VP.xMax-x0)+y0)
  ctx.strokeStyle=C.accent; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(px1,py1); ctx.lineTo(px2,py2); ctx.stroke()
  const[px0,py0]=w2c(x0,y0)
  ctx.fillStyle=C.accent; ctx.beginPath(); ctx.arc(px0,py0,5,0,2*Math.PI); ctx.fill()
  app.querySelector('#out').textContent=
    'h='+H_STEP+'  f\\'('+x0.toFixed(2)+')≈'+m.toFixed(6)+'  exact='+Math.cos(x0).toFixed(6)
}

app.querySelector('#sl').addEventListener('input',redraw)
redraw()`,
            },
            {
              id: "c2",
              isChallenge: true,
              mode: "html",
              challengeTitle: "Mark All Zero Crossings",
              difficulty: "medium",
              prompt:
                "The plotter draws the curve but doesn't yet highlight the zeros. Fill in the `findZeros` scan loop: walk x from xMin to xMax in 400 steps, detect sign changes, refine each root with linear interpolation, and draw a colored dot at each zero on the x-axis.",
              hint: "Linear interpolation for the root: `const t = prevY / (prevY - y)` gives the fraction across the interval [prevX, x] where the zero is. `x_root = prevX + t * (x - prevX)`. Then `w2c(x_root, 0)` gives the canvas position for the dot.",
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .row{display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:80px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    button{padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px}
    .kv{font-size:12px;color:var(--text)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="expr" type="text" value="sin(x)" placeholder="expression">
      <button id="plot">Find Zeros</button>
      <span class="kv" id="out">—</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

function findZeros(f, xMin, xMax, steps) {
  const zeros = []
  let prevX = xMin, prevY = f(xMin, 0)
  for (let i = 1; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin)
    const y = f(x, 0)
    // TODO: check if prevY and y are both finite and have opposite signs (prevY * y < 0)
    // TODO: if so, compute t = prevY / (prevY - y) and push prevX + t * (x - prevX) onto zeros
    prevX = x; prevY = y
  }
  return zeros
}

let expr = 'sin(x)', f = makeFunc(expr)

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.border+'88'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  ctx.strokeStyle=C.border; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
  const zeros = findZeros(f, VP.xMin, VP.xMax, 400)
  // TODO: draw a dot at each zero — w2c(x, 0) gives the canvas position
  // ctx.fillStyle = C.accent
  // for (const x of zeros) {
  //   const [px, py] = w2c(x, 0)
  //   ctx.beginPath(); ctx.arc(px, py, 5, 0, 2 * Math.PI); ctx.fill()
  // }
  app.querySelector('#out').textContent = zeros.length + ' zero(s) found'
}

app.querySelector('#plot').addEventListener('click',()=>{ expr=app.querySelector('#expr').value.trim()||expr; f=makeFunc(expr); redraw() })
redraw()`,
            },
            {
              id: "c3",
              isChallenge: true,
              mode: "html",
              challengeTitle: "Riemann Sum Area",
              difficulty: "hard",
              prompt:
                'Add a "Show Area" checkbox. When checked, fill N rectangles under the curve between x=−3 and x=3 (midpoint Riemann sum) and display the total area. Use a `<input type="range">` slider to control N (from 4 to 200 rectangles).',
              hint: "For each rectangle i of N: `x_mid = −3 + (i + 0.5) / N * 6`, `height = f(x_mid, 0)`. The rectangle area is `height * (6 / N)`. Sum all heights × dx. To draw: `w2c(x_left, 0)` and `w2c(x_right, height)` give two corners; use `ctx.fillRect`. Use `ctx.globalAlpha = 0.3` for semi-transparent fill.",
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:5px;overflow:hidden}
    .row{display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:80px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    input[type=range]{flex:1;max-width:150px;accent-color:var(--accent)}
    button{padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px}
    label{font-size:12px;color:var(--text);display:flex;align-items:center;gap:4px}
    .kv{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="expr" type="text" value="sin(x)" placeholder="expression">
      <button id="plot">Plot</button>
    </div>
    <div class="row">
      <label><input type="checkbox" id="showArea" checked> Area x∈[−3,3]</label>
      <span class="kv">N=</span><input type="range" id="nSl" min="4" max="200" value="20" step="1">
      <span class="kv" id="out">—</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

let expr='sin(x)', f=makeFunc(expr)
const A=-3, B=3   // integration bounds

function drawRiemann(C, N){
  const dx=(B-A)/N
  let sum=0
  ctx.fillStyle=C.accent; ctx.globalAlpha=0.25
  for(let i=0;i<N;i++){
    const xMid=A+(i+0.5)*dx
    const y=f(xMid,0)
    if(!isFinite(y)) continue
    sum+=y*dx
    // TODO: draw the rectangle
    // xLeft = A + i * dx, xRight = xLeft + dx
    // const [px1] = w2c(xLeft, 0)   // left pixel x
    // const [px2] = w2c(xRight, 0)  // right pixel x
    // const [, py0] = w2c(0, 0)     // canvas y of y=0 (x-axis)
    // const [, pyH] = w2c(0, y)     // canvas y of y=height
    // ctx.fillRect(px1, Math.min(py0, pyH), px2-px1, Math.abs(py0-pyH))
  }
  ctx.globalAlpha=1
  return sum
}

function redraw(){
  const C=getC(), N=parseInt(app.querySelector('#nSl').value)
  const showArea=app.querySelector('#showArea').checked
  ctx.clearRect(0,0,W,H)
  const[,oy]=w2c(0,0),[ox]=w2c(0,0)
  ctx.strokeStyle=C.border+'88'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  if(showArea){
    const sum=drawRiemann(C,N)
    app.querySelector('#out').textContent='N='+N+'  ∫≈'+sum.toFixed(5)
  } else { app.querySelector('#out').textContent='' }
  ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin),my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my); first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

app.querySelector('#plot').addEventListener('click',()=>{ expr=app.querySelector('#expr').value.trim()||expr; f=makeFunc(expr); redraw() })
app.querySelector('#nSl').addEventListener('input',redraw)
app.querySelector('#showArea').addEventListener('change',redraw)
redraw()`,
            },
          ],
        },
      },
    ],
  },
};

export default sim2_009;
