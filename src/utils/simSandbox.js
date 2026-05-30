// Shared sandbox srcdoc for SimLabPage and SimNotebook
// Supports mode '3d' (Three.js), mode '2d' (Canvas2D), and mode 'html' (DOM)
// Globals injected to user code:
//   3d: scene, camera, renderer, controls, THREE
//   2d: canvas, ctx, W, H
//   html: app (root div element)
export function buildSandbox() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box }
  body { background:#02060f; overflow:hidden; transition:background 0.25s }
  body > canvas { position:absolute; top:0; left:0; display:block }
  #c2d { position:absolute; top:0; left:0; display:none }
  #app { display:none; width:100%; min-height:100%; font-family:system-ui,sans-serif }
  #err { position:fixed; bottom:0; left:0; right:0; padding:8px 14px;
         background:rgba(20,4,4,0.95); color:#ff6b6b; font:11px/1.6 monospace;
         white-space:pre-wrap; border-top:1px solid #ff4444; display:none;
         z-index:9; max-height:7em; overflow-y:auto }
</style>
</head>
<body>
<div id="err"></div>
<canvas id="c2d"></canvas>
<div id="app"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script>
let animId=null, userUpdate=null, lastTs=0, currentMode='3d'
const c2d = document.getElementById('c2d')

// ── Three.js ─────────────────────────────────────────────────────────────────
const scene    = new THREE.Scene()
scene.background = new THREE.Color(0x02060f)
scene.fog = new THREE.FogExp2(0x02060f, 0.01)
const camera   = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000)
camera.position.set(0, 8, 20)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)
const controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08

window.addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  if (currentMode === '2d') { c2d.width = innerWidth; c2d.height = innerHeight }
})

function addDefaultLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.35))
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(8, 16, 8); sun.castShadow = true
  scene.add(sun)
}
function clearScene() {
  while (scene.children.length) scene.remove(scene.children[0])
  addDefaultLights()
}
function switchMode(mode) {
  currentMode = mode
  const app = document.getElementById('app')
  if (mode === '3d') {
    renderer.domElement.style.display='block'; c2d.style.display='none'; app.style.display='none'
    document.body.style.overflow='hidden'; document.body.style.background='#02060f'
  } else if (mode === '2d') {
    renderer.domElement.style.display='none'; c2d.style.display='block'; c2d.width=innerWidth; c2d.height=innerHeight
    app.style.display='none'; document.body.style.overflow='hidden'; document.body.style.background='#02060f'
  } else if (mode === 'html') {
    renderer.domElement.style.display='none'; c2d.style.display='none'
    app.style.display='block'; app.innerHTML=''
    document.body.style.overflow='auto'; document.body.style.background='#f8fafc'
  }
}

// ── Error / console ───────────────────────────────────────────────────────────
function showError(msg) { const el=document.getElementById('err'); el.textContent=msg; el.style.display='block' }
function hideError()    { document.getElementById('err').style.display='none' }
const _log=console.log.bind(console); console.log=(...a)=>{ _log(...a); parent.postMessage({type:'log',level:'log',args:a.map(String)},'*') }
const _warn=console.warn.bind(console); console.warn=(...a)=>{ _warn(...a); parent.postMessage({type:'log',level:'warn',args:a.map(String)},'*') }
const _err2=console.error.bind(console); console.error=(...a)=>{ _err2(...a); parent.postMessage({type:'log',level:'error',args:a.map(String)},'*') }

// ── Loops ─────────────────────────────────────────────────────────────────────
function loop3d(ts) {
  animId=requestAnimationFrame(loop3d)
  const dt=Math.min((ts-lastTs)/1000,0.05); lastTs=ts
  controls.update()
  if (userUpdate) { try { userUpdate(dt) } catch(e) { showError(e.message); userUpdate=null } }
}
function loop2d(ts) {
  animId=requestAnimationFrame(loop2d)
  const dt=Math.min((ts-lastTs)/1000,0.05); lastTs=ts
  if (userUpdate) { try { userUpdate(dt) } catch(e) { showError(e.message); userUpdate=null } }
}
function stopLoop() { if(animId){cancelAnimationFrame(animId);animId=null} userUpdate=null }

// ── Message handler ────────────────────────────────────────────────────────────
window.addEventListener('message', ({ data }) => {
  if (!data) return
  if (data.type === 'run') {
    stopLoop(); hideError()
    const mode = data.mode || '3d'
    switchMode(mode)
    if (mode === 'html') {
      const app = document.getElementById('app')
      try {
        const fn=new Function('app', data.code)
        fn(app)
      } catch(e) { showError(e.toString()); parent.postMessage({type:'error',message:e.toString()},'*') }
    } else if (mode === '2d') {
      const ctx=c2d.getContext('2d'), W=c2d.width, H=c2d.height
      try {
        const fn=new Function('canvas','ctx','W','H', data.code+'\\nreturn {init,update}')
        const {init,update}=fn(c2d,ctx,W,H)
        init(); userUpdate=update; lastTs=performance.now(); animId=requestAnimationFrame(loop2d)
      } catch(e) { showError(e.toString()); parent.postMessage({type:'error',message:e.toString()},'*') }
    } else {
      clearScene()
      try {
        const fn=new Function('scene','camera','renderer','controls','THREE', data.code+'\\nreturn {init,update}')
        const {init,update}=fn(scene,camera,renderer,controls,THREE)
        init(); userUpdate=update; lastTs=performance.now(); animId=requestAnimationFrame(loop3d)
      } catch(e) { showError(e.toString()); parent.postMessage({type:'error',message:e.toString()},'*') }
    }
  }
  if (data.type === 'reset') {
    stopLoop(); hideError()
    if (currentMode==='3d') { clearScene(); renderer.render(scene,camera) }
    else { const ctx=c2d.getContext('2d'); ctx.clearRect(0,0,c2d.width,c2d.height) }
  }
  if (data.type === 'theme') {
    if (currentMode === 'html') {
      document.body.style.background=data.dark?'#0f172a':'#f8fafc'
    } else {
      const bg=data.dark?'#02060f':'#e8f0f8'
      document.body.style.background=bg
      scene.background=new THREE.Color(data.dark?0x02060f:0xe8f0f8)
    }
  }
})

// ── Boot ──────────────────────────────────────────────────────────────────────
addDefaultLights()
renderer.render(scene, camera)
parent.postMessage({ type: 'sim_ready' }, '*')
</script>
</body>
</html>`
}
