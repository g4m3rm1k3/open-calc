const sim2_007 = {
  id: 'sim2-007',
  slug: 'multiple-functions',
  chapter: 'sim2',
  order: 7,
  title: 'Multiple Functions',
  subtitle: 'Store expressions in an array, loop over them to draw colour-coded traces, and build a live legend — the data-driven pattern behind every real graphing calculator.',
  tags: ['multiple traces', 'legend', 'array', 'expression', 'color', 'canvas'],
  timeToComplete: 35,
  coreConcept: 'Separate data from rendering: each function lives in an {expr, color, visible} object; a single draw loop iterates the array. Adding a new trace is one array push — the drawing code never changes.',

  hook: {
    question: 'A graphing calculator plots sin(x), cos(x), and x² simultaneously with different colors. How does it avoid writing separate drawing code for each function?',
    realWorldContext: 'Matplotlib, D3, and Plotly all use the same architecture: a list of series, each with its own data and style properties, processed by a single generic render pass. The pattern you learn here — separate "what to draw" from "how to draw it" — is the foundation of every professional plotting library.',
  },

  intuition: {
    prose: [
      '**One draw loop, many functions.** Previous lessons hardcoded one expression. The upgrade is minimal: replace `const f = makeFunc(\'sin(x)\')` with `const fns = [{expr:\'sin(x)\',color:\'#0ea5e9\'}, ...]`. The draw loop becomes `for (const fn of fns) { plotTrace(fn) }`. Every function is handled identically — the loop does not know or care how many traces there are.',
      '**`makeFunc` wraps eval safely.** `new Function(\'x\',\'t\', code)` compiles an expression string into a callable function without exposing the page\'s global scope the way `eval()` does. A try/catch inside the function body returns `NaN` for domain errors — `log(-1)`, `sqrt(-9)` — rather than throwing. The plotter skips `NaN` and `Infinity` with a `first = true` reset, producing natural gaps at asymptotes.',
      '**Color cycling.** When the user adds a function without picking a color, assign `palette[fns.length % palette.length]` — the next color in a fixed perceptual palette. A palette of 6–8 blue/orange/green/purple/red/teal hues covers most practical cases and recycles gracefully for longer lists.',
      '**Legend design.** Connect each trace to its expression with a `<div>` list. Each entry shows a color swatch (`<span style="background:fn.color">`) and the expression string. When the user toggles visibility via a checkbox, set `fn.visible = false` and call `redraw()` — the loop skips entries where `fn.visible` is falsy.',
      '**Event-driven redraw.** This plotter does not need a continuous rAF loop. It redraws once whenever state changes: a function is added, removed, or toggled. Call `redraw()` at the end of every event handler. This is cheaper than animation and keeps the canvas perfectly in sync with the data array.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 7 of 10 — Multiple Functions',
        body: '**Previous:** Lesson 6 — Unit Circle. The viewport coordinate transform and `getColors()` patterns carry forward unchanged.\n**This lesson:** Array-driven trace list — separating the data model from the render loop.\n**Next:** Lesson 8 — Axes and Viewport. Replace the fixed viewport with interactive zoom and pan.',
      },
      {
        type: 'definition',
        title: 'makeFunc — Safe Expression Evaluation',
        body: '```js\nfunction makeFunc(expr) {\n  return new Function(\'x\', \'t\',\n    \'\"use strict\";\'\n    + \'const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;\'\n    + \'try{return \' + expr + \'}catch{return NaN}\'\n  )\n}\n```\nCompiles a string into a function. Domain errors return `NaN`; the plotter skips `NaN` pixels automatically.',
      },
      {
        type: 'warning',
        title: 'Never Use Raw eval()',
        body: '`eval(expr)` executes in the caller\'s scope — a malicious expression can read or overwrite your variables. `new Function(...)` creates an isolated scope with only the named arguments. Always use `new Function` with `"use strict"` for user-supplied expressions.',
      },
      {
        type: 'procedure',
        title: 'Per-Trace Plot Loop',
        body: 'Walk canvas columns left-to-right:\n\n```js\nfor (let i = 0; i <= W; i++) {\n  const mx = VP.xMin + (i/W) * (VP.xMax - VP.xMin)\n  const my = f(mx, 0)\n  if (!isFinite(my) || Math.abs(my) > 1e4) { first=true; continue }\n  // w2c → moveTo or lineTo\n}\n```\n\nThe `Math.abs(my) > 1e4` clamp prevents long vertical lines at asymptotes like `tan(x)`.',
      },
      {
        type: 'insight',
        title: 'Separation of Concerns',
        body: 'The array owns *what* to draw. The render loop owns *how*. This means:\n- Add a trace → `fns.push({...})`, call `redraw()`\n- Change color → mutate `fn.color`, call `redraw()`\n- Hide a trace → set `fn.visible = false`, call `redraw()`\n\nThe drawing code never changes for any of these operations.',
      },
      {
        type: 'strategy',
        title: 'Cache Compiled Functions',
        body: 'Store compiled functions alongside expressions: `fn._f = makeFunc(fn.expr)`. Only call `makeFunc` when an expression is first added — not inside `redraw()`. For a few functions this is a micro-optimisation, but for 20+ traces it avoids recompiling on every frame.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Multiple Functions — Four Cells',
        mathBridge: 'Work through the four cells in order. Cell 1 establishes the viewport and single-trace plotter. Cell 2 introduces the array of functions. Cell 3 adds live add/remove controls. Cell 4 builds the full legend with visibility toggles.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              mode: 'html',
              cellTitle: 'Single Trace — Foundation',
              prose: [
                'Set up the viewport object, `w2c` coordinate transform, and `makeFunc` evaluator — these three ingredients appear in every lesson from here on.',
                'The plot loop walks each canvas pixel column, maps the pixel to a math x, evaluates f(x), converts back to a pixel, and connects the dots. Non-finite values reset the pen to avoid drawing across asymptotes.',
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
    <h3>Single trace: y = sin(x)</h3>
    <canvas id="cv"></canvas>
    <p class="note">Viewport x ∈ [−7, 7] y ∈ [−3.5, 3.5] — each pixel column maps to one math x value.</p>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),accent:g('--accent'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const C=getC()
const oy=w2c(0,0)[1], ox=w2c(0,0)[0]
ctx.strokeStyle=C.muted; ctx.lineWidth=1
ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()

const f=makeFunc('sin(x)')
ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.beginPath()
let first=true
for(let i=0;i<=W;i++){
  const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin), my=f(mx,0)
  if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
  const[px,py]=w2c(mx,my)
  first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
}
ctx.stroke()
ctx.fillStyle=C.accent; ctx.font='12px system-ui'; ctx.textAlign='left'; ctx.fillText('y = sin(x)',8,20)`,
            },
            {
              id: 2,
              mode: 'html',
              cellTitle: 'Array of Functions',
              prose: [
                'Replace the single function with an array of `{expr, color}` objects. The draw loop iterates the array — the drawing code itself never changes, only the data does.',
                'A `plotTrace` helper keeps the loop clean. Adding `{expr:\'cos(2*x)\', color:\'#10b981\'}` to the array produces a third trace without touching the draw logic.',
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:12px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    h3{font-size:13px;font-weight:600;color:var(--text);margin:0;flex-shrink:0}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
    .legend{display:flex;gap:12px;flex-shrink:0;flex-wrap:wrap}
    .leg-item{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text)}
    .swatch{width:14px;height:14px;border-radius:2px;flex-shrink:0}
  </style>
  <div class="wrap">
    <h3>Multiple traces</h3>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height

const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const fns=[
  {expr:'sin(x)',   color:'#0ea5e9'},
  {expr:'x*x/4-1', color:'#f59e0b'},
  {expr:'cos(2*x)', color:'#10b981'},
]

function plotTrace(f,color){
  ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin), my=f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  const oy=w2c(0,0)[1],ox=w2c(0,0)[0]
  ctx.strokeStyle=C.border; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  for(const fn of fns) plotTrace(makeFunc(fn.expr),fn.color)
  app.querySelector('#leg').innerHTML=fns.map(fn=>
    '<div class="leg-item"><span class="swatch" style="background:'+fn.color+'"></span><span>y = '+fn.expr+'</span></div>'
  ).join('')
}
redraw()`,
            },
            {
              id: 3,
              mode: 'html',
              cellTitle: 'Dynamic Add and Remove',
              prose: [
                'A text input + "Add" button lets the user type any expression. A "×" button next to each legend entry removes it. Both operations call `redraw()` to sync the canvas.',
                'Caching `fn._f = makeFunc(fn.expr)` at add-time means `redraw()` never recompiles — it only calls the already-compiled function.',
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .row{display:flex;gap:6px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:100px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    input[type=color]{width:32px;height:30px;padding:2px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:var(--surface2)}
    button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px}
    button:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
    .legend{display:flex;flex-direction:column;gap:3px;flex-shrink:0;max-height:72px;overflow-y:auto}
    .leg-item{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text)}
    .swatch{width:12px;height:12px;border-radius:2px;flex-shrink:0}
    .rm{font-size:11px;padding:1px 5px;border-radius:4px;margin-left:auto;border:1px solid var(--border);background:var(--surface2);color:var(--muted);cursor:pointer}
    .rm:hover{background:#ef444422;color:#ef4444}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="expr" type="text" value="tan(x)" placeholder="expression in x">
      <input id="clr" type="color" value="#a855f7">
      <button id="add">+ Add</button>
    </div>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const fns=[
  {expr:'sin(x)', color:'#0ea5e9', _f:null},
  {expr:'cos(x)', color:'#f59e0b', _f:null},
]
fns.forEach(fn=>fn._f=makeFunc(fn.expr))

function plotTrace(fn){
  ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin), my=fn._f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  const oy=w2c(0,0)[1],ox=w2c(0,0)[0]
  ctx.strokeStyle=C.border; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  for(const fn of fns) plotTrace(fn)
  app.querySelector('#leg').innerHTML=fns.map((fn,i)=>
    '<div class="leg-item">'+
    '<span class="swatch" style="background:'+fn.color+'"></span>'+
    '<span>y = '+fn.expr+'</span>'+
    '<button class="rm" data-i="'+i+'">×</button>'+
    '</div>'
  ).join('')
  app.querySelectorAll('.rm').forEach(btn=>btn.addEventListener('click',()=>{
    fns.splice(parseInt(btn.dataset.i),1); redraw()
  }))
}

app.querySelector('#add').addEventListener('click',()=>{
  const expr=app.querySelector('#expr').value.trim()
  const color=app.querySelector('#clr').value
  if(!expr) return
  fns.push({expr,color,_f:makeFunc(expr)}); redraw()
})
redraw()`,
            },
            {
              id: 4,
              mode: 'html',
              cellTitle: 'Legend with Visibility Toggles',
              prose: [
                'Add a checkbox per trace. When unchecked, `fn.visible = false` and `plotTrace` is skipped for that entry. The canvas stays in sync because `redraw()` is called immediately.',
                'Uncheck all but one trace to isolate it, then re-check others to compare. This pattern appears in every professional charting tool.',
              ],
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .row{display:flex;gap:6px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:100px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    input[type=color]{width:32px;height:30px;padding:2px;border:1px solid var(--border);border-radius:6px;cursor:pointer}
    button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px}
    button:hover{background:var(--accent-bg)}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
    .legend{display:flex;flex-direction:column;gap:3px;flex-shrink:0;max-height:80px;overflow-y:auto}
    .leg-item{display:flex;align-items:center;gap:6px;font-size:12px}
    .leg-item.hidden .expr{color:var(--muted);text-decoration:line-through}
    .swatch{width:12px;height:12px;border-radius:2px;flex-shrink:0}
    .rm{font-size:11px;padding:1px 5px;border-radius:4px;margin-left:auto;border:1px solid var(--border);background:var(--surface2);color:var(--muted);cursor:pointer}
    .rm:hover{background:#ef444422;color:#ef4444}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="expr" type="text" value="sin(2*x)" placeholder="expression in x">
      <input id="clr" type="color" value="#a855f7">
      <button id="add">+ Add</button>
    </div>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const fns=[
  {expr:'sin(x)',    color:'#0ea5e9', visible:true, _f:null},
  {expr:'x*x/4-1',  color:'#f59e0b', visible:true, _f:null},
  {expr:'cos(2*x)', color:'#10b981', visible:true, _f:null},
]
fns.forEach(fn=>fn._f=makeFunc(fn.expr))

function plotTrace(fn){
  ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin), my=fn._f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  const oy=w2c(0,0)[1],ox=w2c(0,0)[0]
  ctx.strokeStyle=C.border; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  for(const fn of fns) if(fn.visible) plotTrace(fn)
  app.querySelector('#leg').innerHTML=fns.map((fn,i)=>
    '<div class="leg-item'+(fn.visible?'':' hidden')+'">'+
    '<input type="checkbox" data-i="'+i+'"'+(fn.visible?' checked':'')+'>'+
    '<span class="swatch" style="background:'+fn.color+'"></span>'+
    '<span class="expr">y = '+fn.expr+'</span>'+
    '<button class="rm" data-i="'+i+'">×</button>'+
    '</div>'
  ).join('')
  app.querySelectorAll('input[type=checkbox]').forEach(cb=>cb.addEventListener('change',()=>{
    fns[parseInt(cb.dataset.i)].visible=cb.checked; redraw()
  }))
  app.querySelectorAll('.rm').forEach(btn=>btn.addEventListener('click',()=>{
    fns.splice(parseInt(btn.dataset.i),1); redraw()
  }))
}

app.querySelector('#add').addEventListener('click',()=>{
  const expr=app.querySelector('#expr').value.trim(),color=app.querySelector('#clr').value
  if(!expr) return
  fns.push({expr,color,visible:true,_f:makeFunc(expr)}); redraw()
})
redraw()`,
            },

            // ── Challenges ──────────────────────────────────────────────────────
            {
              id: 'c1',
              isChallenge: true,
              mode: 'html',
              challengeTitle: 'Add a Fourth Trace',
              difficulty: 'easy',
              prompt: 'Add a fourth function to the `fns` array using the expression `abs(sin(x))` and color `#a855f7`. Run the code and verify four traces appear in the legend.',
              hint: 'Each entry needs `expr`, `color`, `visible: true`, and `_f: null`. The `fns.forEach` line below the array compiles `_f` for you automatically.',
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:12px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    h3{font-size:13px;font-weight:600;color:var(--text);margin:0;flex-shrink:0}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
    .legend{display:flex;gap:10px;flex-shrink:0;flex-wrap:wrap}
    .leg-item{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text)}
    .swatch{width:12px;height:12px;border-radius:2px}
  </style>
  <div class="wrap">
    <h3>Multiple traces</h3>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const fns=[
  {expr:'sin(x)',  color:'#0ea5e9', visible:true, _f:null},
  {expr:'cos(x)',  color:'#f59e0b', visible:true, _f:null},
  {expr:'x/3',     color:'#10b981', visible:true, _f:null},
  // TODO: add {expr:'abs(sin(x))', color:'#a855f7', visible:true, _f:null}
]
fns.forEach(fn=>fn._f=makeFunc(fn.expr))

function plotTrace(fn){
  ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin), my=fn._f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  const oy=w2c(0,0)[1],ox=w2c(0,0)[0]
  ctx.strokeStyle=C.border; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  for(const fn of fns) if(fn.visible) plotTrace(fn)
  app.querySelector('#leg').innerHTML=fns.map(fn=>
    '<div class="leg-item"><span class="swatch" style="background:'+fn.color+'"></span><span>y = '+fn.expr+'</span></div>'
  ).join('')
}
redraw()`,
            },
            {
              id: 'c2',
              isChallenge: true,
              mode: 'html',
              challengeTitle: 'Visibility Checkboxes',
              difficulty: 'medium',
              prompt: 'The legend shows each trace\'s color and expression but has no controls yet. Add a checkbox before each entry. When unchecked, set `fn.visible = false` and call `redraw()` to hide that trace.',
              hint: 'In the legend HTML string, prepend `<input type="checkbox" data-i="${i}" checked>` to each item. After rebuilding the legend, attach change listeners: `fns[parseInt(cb.dataset.i)].visible = cb.checked; redraw()`. The `plotTrace` call is already guarded by `if (fn.visible)` — you just need to wire up the checkboxes.',
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    h3{font-size:13px;font-weight:600;color:var(--text);margin:0;flex-shrink:0}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
    .legend{display:flex;flex-direction:column;gap:4px;flex-shrink:0;max-height:72px;overflow-y:auto}
    .leg-item{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text)}
    .swatch{width:12px;height:12px;border-radius:2px;flex-shrink:0}
  </style>
  <div class="wrap">
    <h3>Visibility toggles</h3>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const fns=[
  {expr:'sin(x)',    color:'#0ea5e9', visible:true, _f:null},
  {expr:'cos(x)',    color:'#f59e0b', visible:true, _f:null},
  {expr:'sin(2*x)', color:'#10b981', visible:true, _f:null},
  {expr:'x*x/6-1',  color:'#a855f7', visible:true, _f:null},
]
fns.forEach(fn=>fn._f=makeFunc(fn.expr))

function plotTrace(fn){
  ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin), my=fn._f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  const oy=w2c(0,0)[1],ox=w2c(0,0)[0]
  ctx.strokeStyle=C.border; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  for(const fn of fns){
    if(!fn.visible) continue   // TODO: uncomment this line once checkboxes work
    plotTrace(fn)
  }
  app.querySelector('#leg').innerHTML=fns.map((fn,i)=>
    '<div class="leg-item">'+
    // TODO: add <input type="checkbox" data-i="'+i+'" checked> here
    '<span class="swatch" style="background:'+fn.color+'"></span>'+
    '<span>y = '+fn.expr+'</span>'+
    '</div>'
  ).join('')
  // TODO: attach change listeners to each checkbox
  // app.querySelectorAll('input[type=checkbox]').forEach(cb =>
  //   cb.addEventListener('change', () => { fns[parseInt(cb.dataset.i)].visible = cb.checked; redraw() })
  // )
}
redraw()`,
            },
            {
              id: 'c3',
              isChallenge: true,
              mode: 'html',
              challengeTitle: 'Live Color Picker',
              difficulty: 'hard',
              prompt: 'Replace each static color swatch in the legend with `<input type="color">`. When the user changes a color, update `fn.color` and call `redraw()` — the trace on the canvas should instantly change color.',
              hint: 'Replace the static swatch span with `<input type="color" value="${fn.color}" data-i="${i}">`. After rebuilding the legend HTML, attach `\'input\'` event listeners (not `\'change\'` — the `\'input\'` event fires while the picker is open): `colorInputs.forEach(inp => inp.addEventListener(\'input\', () => { fns[parseInt(inp.dataset.i)].color = inp.value; redraw() }))`.',
              code: `app.innerHTML = \`
  <style>
    html,body{height:100%;margin:0}*{box-sizing:border-box;font-family:system-ui,sans-serif}
    body,#app{background:var(--bg)}
    .wrap{height:100%;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
    .row{display:flex;gap:6px;align-items:center;flex-shrink:0;flex-wrap:wrap}
    input[type=text]{flex:1;min-width:100px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px}
    input[type=color]{width:28px;height:26px;padding:1px;border:1px solid var(--border);border-radius:4px;cursor:pointer}
    button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:13px}
    canvas{flex:1;min-height:0;width:100%;display:block;border-radius:4px;background:var(--surface)}
    .legend{display:flex;flex-direction:column;gap:3px;flex-shrink:0;max-height:80px;overflow-y:auto}
    .leg-item{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text)}
    .rm{font-size:11px;padding:1px 5px;border-radius:4px;margin-left:auto;border:1px solid var(--border);background:var(--surface2);color:var(--muted);cursor:pointer}
    .rm:hover{background:#ef444422;color:#ef4444}
  </style>
  <div class="wrap">
    <div class="row">
      <input id="exprIn" type="text" value="sin(x)" placeholder="expression">
      <input id="clrIn" type="color" value="#a855f7">
      <button id="add">+ Add</button>
    </div>
    <canvas id="cv"></canvas>
    <div class="legend" id="leg"></div>
  </div>
\`
const cv=app.querySelector('#cv')
cv.width=cv.clientWidth||440; cv.height=cv.clientHeight||280
const ctx=cv.getContext('2d'), W=cv.width, H=cv.height
const VP={xMin:-7,xMax:7,yMin:-3.5,yMax:3.5}
function w2c(mx,my){return[(mx-VP.xMin)/(VP.xMax-VP.xMin)*W, H-(my-VP.yMin)/(VP.yMax-VP.yMin)*H]}
function getC(){const s=getComputedStyle(document.documentElement),g=v=>s.getPropertyValue(v).trim()||'#888';return{text:g('--text'),muted:g('--muted'),border:g('--border')}}
function makeFunc(expr){return new Function('x','t','"use strict";const {sin,cos,tan,abs,sqrt,exp,log,PI,E}=Math;try{return '+expr+'}catch{return NaN}')}

const fns=[
  {expr:'sin(x)', color:'#0ea5e9', _f:null},
  {expr:'cos(x)', color:'#f59e0b', _f:null},
]
fns.forEach(fn=>fn._f=makeFunc(fn.expr))

function plotTrace(fn){
  ctx.strokeStyle=fn.color; ctx.lineWidth=2; ctx.beginPath()
  let first=true
  for(let i=0;i<=W;i++){
    const mx=VP.xMin+(i/W)*(VP.xMax-VP.xMin), my=fn._f(mx,0)
    if(!isFinite(my)||Math.abs(my)>1e4){first=true;continue}
    const[px,py]=w2c(mx,my)
    first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
  }
  ctx.stroke()
}

function redraw(){
  const C=getC()
  ctx.clearRect(0,0,W,H)
  const oy=w2c(0,0)[1],ox=w2c(0,0)[0]
  ctx.strokeStyle=C.border; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  for(const fn of fns) plotTrace(fn)
  app.querySelector('#leg').innerHTML=fns.map((fn,i)=>
    '<div class="leg-item">'+
    // TODO: replace static swatch with <input type="color" value="'+fn.color+'" data-i="'+i+'">
    '<span style="width:12px;height:12px;border-radius:2px;background:'+fn.color+';flex-shrink:0;display:inline-block"></span>'+
    '<span>y = '+fn.expr+'</span>'+
    '<button class="rm" data-i="'+i+'">×</button>'+
    '</div>'
  ).join('')
  // TODO: attach 'input' event listeners to each color input
  // app.querySelectorAll('input[type=color][data-i]').forEach(inp =>
  //   inp.addEventListener('input', () => { fns[parseInt(inp.dataset.i)].color = inp.value; redraw() })
  // )
  app.querySelectorAll('.rm').forEach(btn=>btn.addEventListener('click',()=>{
    fns.splice(parseInt(btn.dataset.i),1); redraw()
  }))
}

app.querySelector('#add').addEventListener('click',()=>{
  const expr=app.querySelector('#exprIn').value.trim(),color=app.querySelector('#clrIn').value
  if(!expr) return
  fns.push({expr,color,_f:makeFunc(expr)}); redraw()
})
redraw()`,
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
      text: 'Each trace is stored as `{expr, color, _f}` where expr is the string and _f is the compiled function. Why store both?',
      options: [
        'expr is needed for display (showing the formula in UI) while _f is needed for fast evaluation (no re-parsing each frame). Compiling the function once and reusing it avoids calling `new Function()` 60 × N times per second during animation',
        'JavaScript cannot call a function stored inside an object',
        'The browser caches _f automatically but not expr',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Adding a new function trace is one line: `fns.push({expr, color, _f: makeFunc(expr)})` followed by `redraw()`. Why does the draw loop not need any changes?',
      options: [
        'The draw loop is replaced each time a new function is added',
        'The draw loop iterates over the `fns` array generically: `fns.forEach(fn => drawTrace(fn))`. It draws whatever is in the array without knowing how many traces exist. Data and rendering are separated — a new data item automatically appears in the next render',
        'JavaScript arrays automatically trigger redraws when pushed to',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A toggle (visible: true/false) hides a trace rather than removing it from the array. What is the advantage over array removal?',
      options: [
        'Array splice is an O(n) operation that is too slow',
        'Toggling preserves the trace\'s position in the list, its color, and its compiled function. Removing and re-adding would require the user to re-enter the expression and pick a color again, losing their work. The toggle is reversible with zero data loss',
        'Array removal would cause a JavaScript memory leak',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The lesson\'s core concept is "separate data from rendering." What specific maintenance benefit does this provide when you want to add a feature like "export all traces as CSV"?',
      options: [
        'The canvas can be converted to CSV format using ctx.getImageData()',
        'Because all trace data lives in the `fns` array as plain objects, a new feature just reads from that array — it does not need to inspect the canvas or know anything about how drawing works. The rendering code is similarly shielded: adding an export feature does not touch a single drawing function',
        'Separate data means the rendering thread and the logic thread run in parallel',
      ],
      correct: 1,
    },
  ],
}

export default sim2_007
