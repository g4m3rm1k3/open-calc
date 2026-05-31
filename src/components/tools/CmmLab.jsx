import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const D = {
  bg: '#080b0f', surface: '#0d1117', raised: '#131920', card: '#1a2230',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.13)',
  text: '#e8f0f8', muted: '#7a90a8', faint: '#334455',
  green: '#00e5a0', cyan: '#38bdf8', amber: '#fbbf24',
  red: '#f87171', violet: '#a78bfa', blue: '#60a5fa',
}

// ─────────────────────────────────────────────────────────────────────────────
// MATH
// ─────────────────────────────────────────────────────────────────────────────
const transpose  = A => A[0].map((_,j) => A.map(r => r[j]))
const matMul     = (A,B) => A.map(r => B[0].map((_,j) => r.reduce((s,v,k) => s+v*B[k][j],0)))
const vecDot     = (a,b) => a.reduce((s,v,i) => s+v*b[i],0)
const vecNorm    = v => { const m=Math.sqrt(vecDot(v,v)); return m<1e-12?v:v.map(x=>x/m) }
const f4         = n => { const v=Math.abs(n)<5e-5?0:n; return (v>=0?' ':'')+v.toFixed(4) }
const f3         = (n,d=3) => (Math.abs(n)<5e-5?0:n).toFixed(d)

function gaussNoise(s=1){
  const u=Math.random(),v=Math.random()
  return s*Math.sqrt(-2*Math.log(u+1e-10))*Math.cos(2*Math.PI*v)
}

function solveLinear(A,b){
  const n=A.length, M=A.map((r,i)=>[...r,b[i]])
  for(let col=0;col<n;col++){
    let best=col
    for(let r=col+1;r<n;r++) if(Math.abs(M[r][col])>Math.abs(M[best][col])) best=r
    ;[M[col],M[best]]=[M[best],M[col]]
    const pv=M[col][col]; if(Math.abs(pv)<1e-12) continue
    for(let c=col;c<=n;c++) M[col][c]/=pv
    for(let r=0;r<n;r++){
      if(r===col) continue; const f=M[r][col]
      for(let c=col;c<=n;c++) M[r][c]-=f*M[col][c]
    }
  }
  return M.map(r=>r[n])
}
function solveNormal(A,b){ const At=transpose(A); return solveLinear(matMul(At,A),At.map(r=>vecDot(r,b))) }
function condEst(A){
  const At=transpose(A), AtA=matMul(At,A)
  const d=AtA.map((r,i)=>Math.abs(r[i]))
  const mx=Math.max(...d), mn=Math.min(...d.filter(v=>v>1e-10))
  return mn>0?mx/mn:Infinity
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUTH MODELS  (1 unit = 1 mm)
// Nominal bore D=25mm (r=12.5), nominal cylinder D=25mm (h=60mm)
// ─────────────────────────────────────────────────────────────────────────────
const TRUTH = {
  circle: {
    cx: 0.047, cz: -0.031, r: 12.437,
    circ: a => 0.18*Math.sin(3*a) + 0.12*Math.cos(5*a),
  },
  plane: {
    tiltX: 0.003, tiltZ: -0.0015, offset: 0.002,
    bump: (x,z) => 0.04*Math.sin(x*0.08)*Math.cos(z*0.05),
  },
  cylinder: {
    cx: 0.031, cz: -0.018, r: 12.465,
    circ: (a,y) => 0.15*Math.sin(2*a)+0.08*Math.cos(4*a)+0.01*y/30,
  },
}

function getTruthPt(feat, hx, hy, hz, ns) {
  if(feat==='circle'){
    const a=Math.atan2(hz,hx), T=TRUTH.circle
    const r=T.r+T.circ(a)
    return { x:T.cx+r*Math.cos(a)+gaussNoise(ns), y:hy+gaussNoise(ns*0.3), z:T.cz+r*Math.sin(a)+gaussNoise(ns) }
  }
  if(feat==='plane'){
    const T=TRUTH.plane
    return { x:hx+gaussNoise(ns*0.2), y:T.tiltX*hx+T.tiltZ*hz+T.offset+T.bump(hx,hz)+gaussNoise(ns), z:hz+gaussNoise(ns*0.2) }
  }
  if(feat==='cylinder'){
    const a=Math.atan2(hz,hx), T=TRUTH.cylinder
    const r=T.r+T.circ(a,hy)
    return { x:T.cx+r*Math.cos(a)+gaussNoise(ns), y:hy+gaussNoise(ns*0.3), z:T.cz+r*Math.sin(a)+gaussNoise(ns) }
  }
  return {x:hx,y:hy,z:hz}
}

// ─────────────────────────────────────────────────────────────────────────────
// FITS
// ─────────────────────────────────────────────────────────────────────────────
function fitCircle(pts){
  if(pts.length<3) return null
  const A=pts.map(p=>[p.x,p.y,1])
  const bv=pts.map(p=>-(p.x*p.x+p.y*p.y))
  try{
    const sol=solveNormal(A,bv), [D_,E,F]=sol
    const cx=-D_/2, cy=-E/2, r=Math.sqrt(Math.max(0,cx*cx+cy*cy-F))
    const res=pts.map(p=>Math.sqrt((p.x-cx)**2+(p.y-cy)**2)-r)
    return { cx,cy,r,residuals:res,A,sol,AtA:matMul(transpose(A),A),cond:condEst(A),
      form:Math.max(...res.map(Math.abs))-Math.min(...res.map(Math.abs)) }
  }catch{ return null }
}

function fitPlane(pts){
  if(pts.length<3) return null
  const A=pts.map(p=>[p.x,p.y,1])
  const bv=pts.map(p=>p.z)
  try{
    const sol=solveNormal(A,bv), [a,b,c]=sol
    const normal=vecNorm([-a,-b,1])
    const res=pts.map(p=>p.z-(a*p.x+b*p.y+c))
    return { a,b,c,normal,residuals:res,sol,AtA:matMul(transpose(A),A),cond:condEst(A),
      flatness:Math.max(...res)-Math.min(...res) }
  }catch{ return null }
}

function computeFit(feat, probes){
  if(probes.length<3) return null
  try{
    if(feat==='circle'||feat==='cylinder'){
      const cf=fitCircle(probes.map(p=>({x:p.x,y:p.z})))
      if(!cf) return null
      return { type:'circle', cx:cf.cx, cz:cf.cy, r:cf.r,
        diameter:cf.r*2, circularity:cf.form, residuals:cf.residuals,
        AtA:cf.AtA, sol:cf.sol, cond:cf.cond }
    }
    if(feat==='plane'){
      const pf=fitPlane(probes.map(p=>({x:p.x,y:p.z,z:p.y})))
      if(!pf) return null
      return { type:'plane', a:pf.a, b:pf.b, c:pf.c, normal:pf.normal,
        flatness:pf.flatness, residuals:pf.residuals,
        AtA:pf.AtA, sol:pf.sol, cond:pf.cond }
    }
  }catch{ return null }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBE TRANSFORM MATRIX  (4×4 homogeneous)
// ─────────────────────────────────────────────────────────────────────────────
function probeMatrix(feat, px, py, pz){
  if(feat==='circle'||feat==='cylinder'){
    const a=Math.atan2(pz,px), c=Math.cos(a), s=Math.sin(a)
    return [[(-s).toFixed(3),(0).toFixed(3),c.toFixed(3),px.toFixed(3)],
            [(0).toFixed(3),(1).toFixed(3),(0).toFixed(3),py.toFixed(3)],
            [c.toFixed(3),(0).toFixed(3),s.toFixed(3),pz.toFixed(3)],
            ['0','0','0','1']]
  }
  if(feat==='plane'){
    return [['1','0','0',px.toFixed(3)],
            ['0','1','0',py.toFixed(3)],
            ['0','0','1',pz.toFixed(3)],
            ['0','0','0','1']]
  }
  return [['1','0','0','0'],['0','1','0','0'],['0','0','1','0'],['0','0','0','1']]
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS + SURFACE NORMAL HELPER
// ─────────────────────────────────────────────────────────────────────────────
const NOM_R   = 12.5
const RUBY_R  = 1.5   // radius of ruby ball tip (mm)
const HOVER_GAP = 8   // distance from surface to hover before touching

// Returns unit normal pointing AWAY from solid into probe space
function getSurfaceNormal(feat, hx, hy, hz){
  if(feat==='circle'){
    const len=Math.hypot(hx,hz)||1
    return { nx:-hx/len, ny:0, nz:-hz/len }  // inward toward bore axis
  }
  if(feat==='plane'){
    return { nx:0, ny:1, nz:0 }
  }
  if(feat==='cylinder'){
    const len=Math.hypot(hx,hz)||1
    return { nx:hx/len, ny:0, nz:hz/len }    // outward away from shaft
  }
  return { nx:0, ny:1, nz:0 }
}

// ─────────────────────────────────────────────────────────────────────────────
// WARPED GEOMETRY BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
// VIS_SCALE exaggerates truth errors so they're visible at CMM tolerances
const VIS_SCALE = 18

function buildWarpedCylGeo(nomR, height, circ_fn, segs=64, hSegs=8){
  const halH=height/2, rows=hSegs+1, cols=segs+1
  const positions=[]
  for(let ri=0;ri<rows;ri++){
    const y=-halH+ri*height/hSegs
    for(let ci=0;ci<cols;ci++){
      const a=ci*Math.PI*2/segs
      const dr=circ_fn?circ_fn(a,y)*VIS_SCALE:0
      const r=nomR+dr
      positions.push(r*Math.cos(a), y, r*Math.sin(a))
    }
  }
  const indices=[]
  for(let ri=0;ri<hSegs;ri++){
    for(let ci=0;ci<segs;ci++){
      const a=ri*cols+ci, b=ri*cols+ci+1
      const d=(ri+1)*cols+ci, e=(ri+1)*cols+ci+1
      indices.push(a,b,d, b,e,d)
    }
  }
  const geo=new THREE.BufferGeometry()
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
  geo.setIndex(indices); geo.computeVertexNormals()
  return geo
}

function buildWarpedPlaneGeo(w, depth, height_fn, segs=32){
  const hw=w/2, hd=depth/2, rows=segs+1, cols=segs+1
  const positions=[]
  for(let ri=0;ri<rows;ri++){
    const z=-hd+ri*depth/segs
    for(let ci=0;ci<cols;ci++){
      const x=-hw+ci*w/segs
      const y=height_fn?height_fn(x,z):0
      positions.push(x,y,z)
    }
  }
  const indices=[]
  for(let ri=0;ri<segs;ri++){
    for(let ci=0;ci<segs;ci++){
      const a=ri*cols+ci, b=ri*cols+ci+1
      const dd=(ri+1)*cols+ci, e=(ri+1)*cols+ci+1
      indices.push(a,b,dd, b,e,dd)
    }
  }
  const geo=new THREE.BufferGeometry()
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
  geo.setIndex(indices); geo.computeVertexNormals()
  return geo
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS SCENE BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
function buildCircleScene(){
  const g = new THREE.Group()
  // Workpiece block
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(60,14,60),
    new THREE.MeshStandardMaterial({ color:0x1a2d45, transparent:true, opacity:0.75, roughness:0.6, metalness:0.3 })
  )
  g.add(block)

  // Visible bore: WARPED inner surface (BackSide — visible from inside)
  const boreGeo=buildWarpedCylGeo(NOM_R,15,(a)=>TRUTH.circle.circ(a))
  const boreVis = new THREE.Mesh(boreGeo,
    new THREE.MeshStandardMaterial({ color:0x0d1e3a, side:THREE.BackSide, roughness:0.12, metalness:0.75, transparent:true, opacity:0.9 })
  )
  g.add(boreVis)

  // Invisible hit mesh (nominal, DoubleSide for raycasting)
  const boreHit = new THREE.Mesh(
    new THREE.CylinderGeometry(NOM_R,NOM_R,15,64),
    new THREE.MeshBasicMaterial({ transparent:true, opacity:0, side:THREE.DoubleSide, depthWrite:false })
  )
  g.add(boreHit); g.userData.hitMesh = boreHit

  // Nominal rings
  ;[-7,7].forEach(y=>{
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(NOM_R,0.3,8,64),
      new THREE.MeshBasicMaterial({ color:0x38bdf8, transparent:true, opacity:0.5 })
    )
    ring.rotation.x=Math.PI/2; ring.position.y=y; g.add(ring)
  })
  // Axis
  g.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-9,0),new THREE.Vector3(0,9,0)]),
    new THREE.LineBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.35})
  ))
  return g
}

function buildPlaneScene(){
  const g = new THREE.Group()
  // Plate base
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(80,4,80),
    new THREE.MeshStandardMaterial({ color:0x132030, roughness:0.55, metalness:0.25 })
  )
  plate.position.y=-2; g.add(plate)

  // Visible top surface: WARPED (shows tilt + bumps)
  const T=TRUTH.plane
  const surfGeo=buildWarpedPlaneGeo(80,80,(x,z)=>
    (T.tiltX*x + T.tiltZ*z + T.offset + T.bump(x,z))
  )
  const surfVis=new THREE.Mesh(surfGeo,
    new THREE.MeshStandardMaterial({ color:0x1a3050, roughness:0.42, metalness:0.55 })
  )
  g.add(surfVis)

  // Invisible hit mesh (flat plane for raycasting)
  const hit=new THREE.Mesh(
    new THREE.PlaneGeometry(80,80),
    new THREE.MeshBasicMaterial({ transparent:true, opacity:0, side:THREE.DoubleSide, depthWrite:false })
  )
  hit.rotation.x=-Math.PI/2; g.add(hit)
  g.userData.hitMesh=hit

  // Grid lines on surface
  for(let i=-40;i<=40;i+=10){
    const m=new THREE.LineBasicMaterial({color:0x0d2035,transparent:true,opacity:0.5})
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0.06,-40),new THREE.Vector3(i,0.06,40)]),m))
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-40,0.06,i),new THREE.Vector3(40,0.06,i)]),m))
  }
  return g
}

function buildCylScene(){
  const g = new THREE.Group()
  // Visible shaft: WARPED outer surface
  const cylGeo=buildWarpedCylGeo(NOM_R,60,(a,y)=>TRUTH.cylinder.circ(a,y))
  const shaft=new THREE.Mesh(cylGeo,
    new THREE.MeshStandardMaterial({ color:0x1a2d45, roughness:0.3, metalness:0.65, transparent:true, opacity:0.88 })
  )
  g.add(shaft)

  // Invisible hit mesh (nominal, DoubleSide)
  const hit=new THREE.Mesh(
    new THREE.CylinderGeometry(NOM_R,NOM_R,60,64),
    new THREE.MeshBasicMaterial({ transparent:true, opacity:0, side:THREE.DoubleSide, depthWrite:false })
  )
  g.add(hit); g.userData.hitMesh=hit

  // Level rings
  ;[-20,0,20].forEach(y=>{
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(NOM_R+0.4,0.22,8,64),
      new THREE.MeshBasicMaterial({ color:0x38bdf8, transparent:true, opacity:0.3 })
    )
    ring.rotation.x=Math.PI/2; ring.position.y=y; g.add(ring)
  })
  // Caps
  ;[-30,30].forEach(y=>{
    const cap=new THREE.Mesh(
      new THREE.CylinderGeometry(NOM_R,NOM_R,0.5,64),
      new THREE.MeshStandardMaterial({ color:0x2a4060, metalness:0.5, roughness:0.4 })
    )
    cap.position.y=y; g.add(cap)
  })
  // Axis
  g.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-32,0),new THREE.Vector3(0,32,0)]),
    new THREE.LineBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.25})
  ))
  return g
}

function buildProbeGroup(){
  const g = new THREE.Group()
  // Ruby ball (tip at y=0 of group — this is the contact point)
  const ruby=new THREE.Mesh(
    new THREE.SphereGeometry(RUBY_R,20,20),
    new THREE.MeshStandardMaterial({ color:0xff1155, emissive:0x660022, emissiveIntensity:0.7, roughness:0.2, metalness:0.15 })
  )
  // Stylus extends from ruby center upward
  const styl=new THREE.Mesh(
    new THREE.CylinderGeometry(0.28,0.28,38,8),
    new THREE.MeshStandardMaterial({ color:0xaaaacc, roughness:0.35, metalness:0.75 })
  )
  styl.position.y=19+RUBY_R
  const shank=new THREE.Mesh(
    new THREE.CylinderGeometry(2,2,12,12),
    new THREE.MeshStandardMaterial({ color:0x334466, roughness:0.5, metalness:0.6 })
  )
  shank.position.y=38+RUBY_R+6
  g.add(ruby); g.add(styl); g.add(shank)
  return g
}

function buildFitOverlay(feat, fit){
  const g=new THREE.Group()
  const mat=new THREE.MeshBasicMaterial({ color:0x00e5a0, wireframe:true, transparent:true, opacity:0.7 })
  if(fit.type==='circle'){
    const torus=new THREE.Mesh(new THREE.TorusGeometry(fit.r,0.4,8,64),mat)
    torus.rotation.x=Math.PI/2; torus.position.set(fit.cx,0,fit.cz)
    const dot=new THREE.Mesh(new THREE.SphereGeometry(0.8,12,12),
      new THREE.MeshBasicMaterial({color:0x00e5a0}))
    dot.position.set(fit.cx,0,fit.cz); g.add(torus); g.add(dot)
  }
  if(fit.type==='plane'){
    const pgeo=new THREE.PlaneGeometry(70,70)
    const pmesh=new THREE.Mesh(pgeo,new THREE.MeshBasicMaterial({color:0x00e5a0,wireframe:true,transparent:true,opacity:0.5,side:THREE.DoubleSide}))
    pmesh.rotation.x=-Math.PI/2
    const tiltX=Math.atan(fit.a), tiltZ=Math.atan(fit.b)
    pmesh.rotation.x=-Math.PI/2+tiltX; pmesh.rotation.z=-tiltZ
    pmesh.position.y=fit.c; g.add(pmesh)
    const n=fit.normal
    const arrowDir=new THREE.Vector3(n[0],n[2],n[1]).normalize()
    g.add(new THREE.ArrowHelper(arrowDir,new THREE.Vector3(0,fit.c,0),12,0x00e5a0,3,2))
  }
  return g
}

function addDot(scene, x, y, z){
  const mesh=new THREE.Mesh(
    new THREE.SphereGeometry(0.65,10,10),
    new THREE.MeshStandardMaterial({color:0x00e5a0,emissive:0x00a060,emissiveIntensity:0.9,roughness:0.25})
  )
  mesh.position.set(x,y,z); scene.add(mesh); return mesh
}

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────
function Tag({c=D.green,children}){
  return <span style={{display:'inline-block',padding:'1px 8px',background:c+'22',
    border:`1px solid ${c}44`,borderRadius:3,fontSize:9,letterSpacing:2,color:c,
    fontFamily:"'DM Mono',monospace",fontWeight:700}}>{children}</span>
}
function Def({term,c=D.cyan,children}){
  return <div style={{padding:'10px 14px',background:D.raised,border:`1px solid ${c}33`,borderRadius:7,marginBottom:10}}>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
      <Tag c={c}>DEF</Tag>
      <span style={{fontSize:12,fontWeight:700,color:c,fontFamily:"'DM Mono',monospace"}}>{term}</span>
    </div>
    <div style={{fontSize:11,color:D.muted,lineHeight:1.85}}>{children}</div>
  </div>
}
function Insight({label,c=D.green,children}){
  return <div style={{padding:'10px 14px',background:c+'0a',border:`1px solid ${c}2a`,borderRadius:7,marginBottom:10}}>
    <div style={{fontSize:9,color:c,letterSpacing:2,fontWeight:700,marginBottom:4,fontFamily:"'DM Mono',monospace"}}>↳ {label}</div>
    <div style={{fontSize:11,color:D.text,lineHeight:1.85}}>{children}</div>
  </div>
}
function Eq({children,c=D.violet}){
  return <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,background:D.raised,
    border:`1px solid ${D.border2}`,borderRadius:6,padding:'8px 14px',lineHeight:2.1,
    color:c,overflowX:'auto',marginBottom:10,whiteSpace:'pre'}}>{children}</div>
}
function Stat({label,value,pass}){
  const col=pass===true?D.green:pass===false?D.red:D.cyan
  return <div style={{padding:'7px 10px',background:D.card,borderRadius:6,border:`1px solid ${col}22`,flex:1,minWidth:70}}>
    <div style={{fontSize:15,fontWeight:700,color:col,fontFamily:"'DM Mono',monospace"}}>{value}</div>
    <div style={{fontSize:8,color:D.faint,letterSpacing:1,marginTop:2}}>{label}</div>
    {pass!==undefined&&<div style={{fontSize:8,marginTop:2,color:col,fontWeight:700}}>{pass?'PASS':'FAIL'}</div>}
  </div>
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function CmmLab({ onBack }){
  const [feat, setFeat]   = useState('circle')
  const [probes,setProbes]= useState([])
  const [topic, setTopic] = useState('linearize')
  const [noise, setNoise] = useState(0.008)
  const [probePos,setProbePos] = useState({x:0,y:40,z:0})
  const [animating,setAnimating] = useState(false)

  // THREE.js refs
  const mountRef      = useRef(null)
  const sceneRef      = useRef(null)
  const cameraRef     = useRef(null)
  const rendererRef   = useRef(null)
  const probeGrpRef   = useRef(null)
  const hitMeshRef    = useRef(null)
  const featGrpRef    = useRef(null)
  const dotsRef       = useRef([])
  const fitGrpRef     = useRef(null)
  const orbitRef      = useRef({theta:Math.PI/4,phi:1.1,r:80})
  const probePosRef   = useRef({x:0,y:40,z:0})
  const targetRef     = useRef(null)
  const pendingRef    = useRef(null)
  const animQueueRef  = useRef([])   // sequence of waypoints: retract → hover → touch
  const animIdRef     = useRef(null)
  const dragRef       = useRef({dragging:false,lx:0,ly:0,moved:0})
  const featRef       = useRef('circle')
  const noiseRef      = useRef(0.008)
  const setAnimRef    = useRef(null)
  const setPosRef     = useRef(null)
  const addProbeRef   = useRef(null)

  // keep refs in sync
  useEffect(()=>{ featRef.current=feat }, [feat])
  useEffect(()=>{ noiseRef.current=noise }, [noise])
  setAnimRef.current  = setAnimating
  setPosRef.current   = setProbePos
  addProbeRef.current = (pt) => setProbes(prev=>[...prev,pt])

  const fit = useMemo(()=>computeFit(feat,probes),[feat,probes])

  // ── THREE.JS INIT (once) ───────────────────────────────────────────────────
  useEffect(()=>{
    const mount=mountRef.current; if(!mount) return
    const W=mount.clientWidth||600, H=mount.clientHeight||500

    const scene=new THREE.Scene()
    scene.background=new THREE.Color(0x060910)
    sceneRef.current=scene

    const camera=new THREE.PerspectiveCamera(50,W/H,0.1,2000)
    cameraRef.current=camera

    const renderer=new THREE.WebGLRenderer({antialias:true})
    renderer.setSize(W,H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.shadowMap.enabled=true
    mount.appendChild(renderer.domElement)
    rendererRef.current=renderer

    scene.add(new THREE.AmbientLight(0xffffff,0.5))
    const dir=new THREE.DirectionalLight(0xffffff,0.85)
    dir.position.set(40,60,40); dir.castShadow=true; scene.add(dir)
    const fill=new THREE.DirectionalLight(0x4488ff,0.3)
    fill.position.set(-30,20,-30); scene.add(fill)
    scene.add(new THREE.PointLight(0x38bdf8,0.25,200))

    const grid=new THREE.GridHelper(160,16,0x0e1a28,0x0a1420)
    grid.position.y=-8; scene.add(grid)

    // Initial feature scene
    const fg=buildCircleScene()
    scene.add(fg); featGrpRef.current=fg; hitMeshRef.current=fg.userData.hitMesh

    // Probe
    const pg=buildProbeGroup()
    pg.position.set(0,40,0); scene.add(pg); probeGrpRef.current=pg

    // Orbit mouse
    const canvas=renderer.domElement
    const onDown=e=>{ dragRef.current={dragging:true,lx:e.clientX,ly:e.clientY,moved:0} }
    const onMove=e=>{
      const d=dragRef.current; if(!d.dragging) return
      const dx=e.clientX-d.lx, dy=e.clientY-d.ly
      d.moved+=Math.hypot(dx,dy)
      const orb=orbitRef.current
      orb.theta-=dx*0.008
      orb.phi=Math.max(0.15,Math.min(Math.PI/2-0.05,orb.phi-dy*0.008))
      d.lx=e.clientX; d.ly=e.clientY
    }
    const onUp=()=>{ dragRef.current.dragging=false }
    const onWheel=e=>{ orbitRef.current.r=Math.max(30,Math.min(200,orbitRef.current.r+e.deltaY*0.12)) }
    canvas.addEventListener('mousedown',onDown)
    window.addEventListener('mousemove',onMove)
    window.addEventListener('mouseup',onUp)
    canvas.addEventListener('wheel',onWheel,{passive:true})

    // Animation loop
    let lastPosUpdate=0
    const tick=()=>{
      animIdRef.current=requestAnimationFrame(tick)
      const orb=orbitRef.current
      camera.position.set(
        orb.r*Math.sin(orb.phi)*Math.sin(orb.theta),
        orb.r*Math.cos(orb.phi),
        orb.r*Math.sin(orb.phi)*Math.cos(orb.theta)
      )
      camera.lookAt(0,0,0)

      // Probe animation — lerp to current target, drain queue on arrival
      const pos=probePosRef.current, tgt=targetRef.current
      if(tgt){
        pos.x+=(tgt.x-pos.x)*0.14
        pos.y+=(tgt.y-pos.y)*0.14
        pos.z+=(tgt.z-pos.z)*0.14
        const pg2=probeGrpRef.current
        if(pg2) pg2.position.set(pos.x,pos.y,pos.z)
        const dist=Math.hypot(pos.x-tgt.x,pos.y-tgt.y,pos.z-tgt.z)
        if(dist<0.35){
          pos.x=tgt.x; pos.y=tgt.y; pos.z=tgt.z
          if(pg2) pg2.position.set(pos.x,pos.y,pos.z)
          // Drain queue: advance to next waypoint
          const next=animQueueRef.current.shift()
          if(next){
            targetRef.current=next
          } else {
            // All waypoints done — deposit probe point
            targetRef.current=null
            setAnimRef.current(false)
            if(pendingRef.current){
              const pt=pendingRef.current; pendingRef.current=null
              const dot=addDot(sceneRef.current,pt.x,pt.y,pt.z)
              dotsRef.current.push(dot)
              addProbeRef.current(pt)
            }
          }
        }
        const now=Date.now()
        if(now-lastPosUpdate>50){ setPosRef.current({...pos}); lastPosUpdate=now }
      }

      renderer.render(scene,camera)
    }
    tick()

    const onResize=()=>{
      const W2=mount.clientWidth, H2=mount.clientHeight
      camera.aspect=W2/H2; camera.updateProjectionMatrix()
      renderer.setSize(W2,H2)
    }
    window.addEventListener('resize',onResize)

    return ()=>{
      cancelAnimationFrame(animIdRef.current)
      canvas.removeEventListener('mousedown',onDown)
      window.removeEventListener('mousemove',onMove)
      window.removeEventListener('mouseup',onUp)
      canvas.removeEventListener('wheel',onWheel)
      window.removeEventListener('resize',onResize)
      if(mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  },[])

  // ── FEATURE CHANGE ─────────────────────────────────────────────────────────
  useEffect(()=>{
    const scene=sceneRef.current; if(!scene) return
    if(featGrpRef.current) scene.remove(featGrpRef.current)
    dotsRef.current.forEach(d=>scene.remove(d)); dotsRef.current=[]
    if(fitGrpRef.current){ scene.remove(fitGrpRef.current); fitGrpRef.current=null }
    setProbes([])
    const fg=feat==='circle'?buildCircleScene():feat==='plane'?buildPlaneScene():buildCylScene()
    scene.add(fg); featGrpRef.current=fg; hitMeshRef.current=fg.userData.hitMesh
    // Park probe safely above feature
    const start=feat==='circle'?{x:0,y:30,z:0}:feat==='plane'?{x:0,y:25,z:0}:{x:0,y:40,z:0}
    probePosRef.current={...start}
    targetRef.current=null; animQueueRef.current=[]
    if(probeGrpRef.current) probeGrpRef.current.position.set(start.x,start.y,start.z)
    setProbePos({...start})
    if(feat==='circle')      orbitRef.current={theta:Math.PI/4,phi:0.9,r:80}
    else if(feat==='plane')  orbitRef.current={theta:Math.PI/5,phi:0.65,r:120}
    else                     orbitRef.current={theta:Math.PI/4,phi:1.1,r:100}
  },[feat])

  // ── FIT OVERLAY ────────────────────────────────────────────────────────────
  useEffect(()=>{
    const scene=sceneRef.current; if(!scene) return
    if(fitGrpRef.current){ scene.remove(fitGrpRef.current); fitGrpRef.current=null }
    if(fit){ const fg=buildFitOverlay(feat,fit); scene.add(fg); fitGrpRef.current=fg }
  },[fit,feat])

  // ── CLICK TO PROBE ─────────────────────────────────────────────────────────
  const onCanvasClick=useCallback(e=>{
    if(animating) return
    const mount=mountRef.current, rend=rendererRef.current, cam=cameraRef.current
    if(!mount||!rend||!cam||!hitMeshRef.current) return
    if(dragRef.current.moved > 4) return   // was a drag, not a click

    const rect=rend.domElement.getBoundingClientRect()
    const mouse=new THREE.Vector2(
      (e.clientX-rect.left)/rect.width*2-1,
      -(e.clientY-rect.top)/rect.height*2+1
    )
    const ray=new THREE.Raycaster()
    ray.setFromCamera(mouse,cam)
    const hits=ray.intersectObject(hitMeshRef.current)
    if(!hits.length) return

    const h=hits[0].point
    const {nx,ny,nz}=getSurfaceNormal(featRef.current,h.x,h.y,h.z)

    // Ruby is tangent to surface: ball center = surface point + normal * RUBY_R
    const touchPos={x:h.x+nx*RUBY_R, y:h.y+ny*RUBY_R, z:h.z+nz*RUBY_R}
    const hoverPos={x:h.x+nx*(RUBY_R+HOVER_GAP), y:h.y+ny*(RUBY_R+HOVER_GAP), z:h.z+nz*(RUBY_R+HOVER_GAP)}

    // Safe retract position so probe never clips through geometry during transit
    const cur=probePosRef.current
    let retractPos, queue
    if(featRef.current==='circle'){
      // Bore: retract to bore center at hover height, then approach radially
      retractPos={x:0, y:hoverPos.y, z:0}
      queue=[hoverPos, touchPos]
    } else if(featRef.current==='plane'){
      // Plane: lift up to clearance height directly above target, then descend
      retractPos={x:hoverPos.x, y:20, z:hoverPos.z}
      queue=[hoverPos, touchPos]
    } else {
      // Cylinder: retract radially outward from current, transit to clearance near target, approach
      const a_cur=Math.atan2(cur.z,cur.x)
      const a_tgt=Math.atan2(h.z,h.x)
      const clearR=NOM_R+20
      retractPos={x:clearR*Math.cos(a_cur), y:hoverPos.y, z:clearR*Math.sin(a_cur)}
      const transit={x:clearR*Math.cos(a_tgt), y:hoverPos.y, z:clearR*Math.sin(a_tgt)}
      queue=[transit, hoverPos, touchPos]
    }

    const measured=getTruthPt(featRef.current,h.x,h.y,h.z,noiseRef.current)
    pendingRef.current=measured
    animQueueRef.current=queue
    targetRef.current=retractPos
    setAnimating(true)
  },[animating])

  // ── AUTO PROBE ─────────────────────────────────────────────────────────────
  const autoProbe=useCallback((n=8)=>{
    if(animating) return
    const pts=[]
    if(feat==='circle'){
      for(let i=0;i<n;i++){
        const a=(i/n)*Math.PI*2
        pts.push(getTruthPt('circle',NOM_R*Math.cos(a),0,NOM_R*Math.sin(a),noiseRef.current))
      }
    } else if(feat==='plane'){
      const side=Math.ceil(Math.sqrt(n))
      const step=60/(side-1||1), off=-30
      for(let i=0;i<side&&pts.length<n;i++)
        for(let j=0;j<side&&pts.length<n;j++)
          pts.push(getTruthPt('plane',off+i*step,0,off+j*step,noiseRef.current))
    } else {
      const levels=3, perLevel=Math.ceil(n/levels)
      for(let l=0;l<levels;l++){
        const y=-20+l*20
        for(let i=0;i<perLevel;i++){
          const a=(i/perLevel)*Math.PI*2
          pts.push(getTruthPt('cylinder',NOM_R*Math.cos(a),y,NOM_R*Math.sin(a),noiseRef.current))
        }
      }
    }
    dotsRef.current.forEach(d=>sceneRef.current?.remove(d)); dotsRef.current=[]
    if(fitGrpRef.current){ sceneRef.current?.remove(fitGrpRef.current); fitGrpRef.current=null }
    pts.forEach(pt=>{ dotsRef.current.push(addDot(sceneRef.current,pt.x,pt.y,pt.z)) })
    setProbes(pts)
    // Position probe tangent to last point
    if(pts.length){
      const last=pts[pts.length-1]
      const {nx,ny,nz}=getSurfaceNormal(feat,last.x,last.y,last.z)
      const pp={x:last.x+nx*RUBY_R, y:last.y+ny*RUBY_R, z:last.z+nz*RUBY_R}
      probePosRef.current=pp
      if(probeGrpRef.current) probeGrpRef.current.position.set(pp.x,pp.y,pp.z)
      setProbePos(pp)
    }
  },[feat,animating])

  const clearAll=useCallback(()=>{
    dotsRef.current.forEach(d=>sceneRef.current?.remove(d)); dotsRef.current=[]
    if(fitGrpRef.current){ sceneRef.current?.remove(fitGrpRef.current); fitGrpRef.current=null }
    setProbes([])
  },[])

  // ── NOMINAL VALUES FOR REPORT ──────────────────────────────────────────────
  const nomD=25.0
  const actD=fit?.type==='circle'?fit.diameter:null
  const devD=actD?Math.abs(actD-nomD):null
  const tol=0.05
  const passD=devD!=null?devD<=tol:null

  // ── CONCEPT PANEL ──────────────────────────────────────────────────────────
  const TOPICS=[
    {id:'linearize',label:'Linearize',c:D.violet},
    {id:'normal',   label:'Normal Eq',c:D.amber},
    {id:'cond',     label:'Cond #',   c:D.cyan},
    {id:'report',   label:'GD&T',     c:D.green},
  ]
  const topicC=TOPICS.find(t=>t.id===topic)?.c||D.violet

  const aRows = useMemo(()=>{
    if(!probes.length) return []
    return probes.slice(0,4).map(p=>[p.x.toFixed(3),p.z.toFixed(3),'1'])
  },[probes])

  const pmat=probeMatrix(feat,probePos.x,probePos.y,probePos.z)

  const FEATURES=[
    {id:'circle',  label:'BORE',     sub:'circle, 2D',   c:D.green},
    {id:'plane',   label:'PLANE',    sub:'flat surface', c:D.cyan},
    {id:'cylinder',label:'CYLINDER', sub:'round shaft',  c:D.violet},
  ]
  const active=FEATURES.find(f=>f.id===feat)

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',
      background:D.bg,fontFamily:"'DM Mono','Courier New',monospace",color:D.text,overflow:'hidden'}}>

      {/* NAV */}
      <div style={{height:48,display:'flex',alignItems:'center',padding:'0 16px',
        borderBottom:`1px solid ${D.border2}`,background:D.surface,flexShrink:0,gap:12}}>
        {onBack&&(
          <button onClick={onBack} style={{padding:'4px 10px',background:'transparent',
            border:`1px solid ${D.border2}`,color:D.muted,fontSize:9,borderRadius:4,
            cursor:'pointer',fontFamily:"'Space Mono',monospace",letterSpacing:2}}>← LABS</button>
        )}
        <span style={{fontSize:12,fontWeight:700,letterSpacing:4,color:D.green}}>CMM LAB</span>
        <span style={{fontSize:8,color:D.faint,letterSpacing:2}}>COORDINATE MEASURING · LEAST SQUARES · LINEAR ALGEBRA</span>
        <div style={{flex:1}}/>
        <div style={{display:'flex',background:D.raised,borderRadius:6,border:`1px solid ${D.border2}`,padding:3,gap:2}}>
          {FEATURES.map(f=>(
            <button key={f.id} onClick={()=>setFeat(f.id)}
              style={{padding:'4px 14px',borderRadius:4,fontSize:9,letterSpacing:1,
                fontFamily:"'DM Mono',monospace",cursor:'pointer',border:'none',
                background:f.id===feat?f.c+'22':'transparent',
                color:f.id===feat?f.c:D.faint,fontWeight:f.id===feat?'700':'400',transition:'all .15s'}}>
              {f.label}
              <span style={{fontSize:7,color:f.id===feat?f.c:D.faint,display:'block',letterSpacing:1}}>{f.sub}</span>
            </button>
          ))}
        </div>
        <span style={{fontSize:9,color:D.faint,padding:'4px 10px',background:D.raised,
          borderRadius:4,border:`1px solid ${D.border}`,marginLeft:4}}>
          {probes.length} pts
        </span>
      </div>

      {/* 3 COLUMNS */}
      <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>

        {/* ── LEFT: CONCEPT PANEL ── */}
        <div style={{width:280,flexShrink:0,borderRight:`1px solid ${D.border}`,
          display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',borderBottom:`1px solid ${D.border}`,background:D.surface,flexShrink:0}}>
            {TOPICS.map(t=>(
              <button key={t.id} onClick={()=>setTopic(t.id)}
                style={{flex:1,padding:'9px 4px',fontSize:8,letterSpacing:1.5,cursor:'pointer',
                  fontFamily:"'DM Mono',monospace",border:'none',
                  borderBottom:`2px solid ${t.id===topic?t.c:'transparent'}`,
                  background:t.id===topic?t.c+'0d':'transparent',
                  color:t.id===topic?t.c:D.faint,fontWeight:t.id===topic?'700':'400'}}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'14px 14px'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <Tag c={topicC}>{TOPICS.find(t=>t.id===topic)?.label}</Tag>
              <span style={{fontSize:9,color:D.faint}}>{active?.label}</span>
            </div>

            {topic==='linearize'&&<>
              {(feat==='circle'||feat==='cylinder')&&<>
                <Def term="Linearize the Circle" c={D.violet}>
                  x²+y²+Dx+Ey+F=0 is nonlinear in (cx,cy,r) — but D, E, F appear
                  <em> linearly</em>. Group x²+y² to the right side:<br/>
                  <span style={{fontFamily:"'DM Mono',monospace",color:D.violet}}>
                    xᵢD + yᵢE + F = −(xᵢ²+yᵢ²)
                  </span><br/>
                  One probe point = one row of A. Stack all probes → Ax=b.
                </Def>
                <Eq c={D.violet}>{`A = ⎡ x₁  z₁  1 ⎤   b = ⎡ -(x₁²+z₁²) ⎤
    ⎢ x₂  z₂  1 ⎥       ⎢ -(x₂²+z₂²) ⎥
    ⎢  ⋮   ⋮  ⋮ ⎥       ⎢      ⋮      ⎥
    ⎣ xₙ  zₙ  1 ⎦       ⎣ -(xₙ²+zₙ²) ⎦

Solve → [D,E,F]
cx = -D/2,  cz = -E/2
r  = √(cx²+cz²−F)`}</Eq>
                <Insight label="THE VISUAL WOBBLE IS REAL" c={D.violet}>
                  The 3D geometry is drawn with the truth model errors
                  amplified {VIS_SCALE}× so you can see them. The bore isn't
                  perfectly round — it has a 3-lobe form error. The math finds
                  the best-fit circle through your imperfect probe points.
                  Residuals = the remaining form error (circularity).
                </Insight>
              </>}
              {feat==='plane'&&<>
                <Def term="Plane is Already Linear" c={D.violet}>
                  z = ax + by + c — three unknowns that appear linearly.
                  Each probe point gives one row directly.
                  The surface tilt and undulation you can see are encoded
                  in a, b, and the residuals.
                </Def>
                <Eq c={D.violet}>{`A = ⎡ x₁  z₁  1 ⎤   b = ⎡ y₁ ⎤  (y=height)
    ⎢ x₂  z₂  1 ⎥       ⎢ y₂ ⎥
    ⎢  ⋮   ⋮  ⋮ ⎥       ⎢  ⋮ ⎥
    ⎣ xₙ  zₙ  1 ⎦       ⎣ yₙ ⎦

Solve AᵀAx̂ = Aᵀb → [a,b,c]
Normal n = normalize([−a,−b,1])`}</Eq>
                <Insight label="SAME A MATRIX STRUCTURE" c={D.violet}>
                  A = [x, z, 1] is identical for bore and plane.
                  Only b changes. One algebra, every CMM feature type.
                </Insight>
              </>}
              {probes.length>=3&&<>
                <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
                  YOUR A MATRIX (first {Math.min(4,probes.length)} of {probes.length} rows)
                </div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,lineHeight:2,padding:'6px 10px',
                  background:D.raised,borderRadius:6,border:`1px solid ${D.border2}`}}>
                  {aRows.map((r,ri)=>(
                    <div key={ri} style={{display:'flex',gap:0,alignItems:'center'}}>
                      <span style={{color:D.faint,fontSize:12,marginRight:2}}>{ri===0?'⎡':ri===aRows.length-1?'⎣':'⎢'}</span>
                      {r.map((v,ci)=><span key={ci} style={{minWidth:54,textAlign:'right',paddingRight:6,
                        color:ci===2?D.faint:D.cyan}}>{v}</span>)}
                      <span style={{color:D.faint,fontSize:12}}>{ri===0?'⎤':ri===aRows.length-1?'⎦':'⎥'}</span>
                    </div>
                  ))}
                  {probes.length>4&&<div style={{color:D.faint,paddingLeft:12}}>  ⋮  ({probes.length-4} more rows)</div>}
                </div>
              </>}
              {probes.length<3&&<Insight label="PROBE TO SEE THE MATH" c={D.faint}>
                Click on the 3D surface or use AUTO. The surface is imperfect —
                compare your measured points to the nominal geometry.
                Minimum 3 points to solve. A matrix grows with each probe.
              </Insight>}
            </>}

            {topic==='normal'&&<>
              <Def term="Normal Equation AᵀAx̂ = Aᵀb" c={D.amber}>
                With n&gt;3 probes the system is overdetermined — no exact solution
                because the bore has real form error. Least squares minimizes ‖Ax−b‖²
                by solving the 3×3 normal equation. AᵀA is always 3×3 regardless
                of how many probes you take.
              </Def>
              {fit?<>
                <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>AᵀA (3×3 LIVE)</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,lineHeight:2,padding:'6px 10px',
                  background:D.raised,borderRadius:6,border:`1px solid ${D.amber}33`,marginBottom:10}}>
                  {fit.AtA.map((row,ri)=>(
                    <div key={ri} style={{display:'flex',alignItems:'center'}}>
                      <span style={{color:D.faint,fontSize:12,marginRight:2}}>{ri===0?'⎡':ri===2?'⎣':'⎢'}</span>
                      {row.map((v,ci)=><span key={ci} style={{minWidth:64,textAlign:'right',paddingRight:4,
                        color:ri===ci?D.amber:D.muted}}>{f4(v)}</span>)}
                      <span style={{color:D.faint,fontSize:12}}>{ri===0?'⎤':ri===2?'⎦':'⎥'}</span>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>SOLUTION x̂</div>
                <div style={{padding:'8px 10px',background:D.card,borderRadius:6,border:`1px solid ${D.amber}33`,
                  fontFamily:"'DM Mono',monospace",fontSize:10,lineHeight:2,marginBottom:10}}>
                  {fit.sol.map((v,i)=>(
                    <div key={i}><span style={{color:D.faint}}>{'DEF'[i]} = </span>
                      <span style={{color:D.amber,fontWeight:700}}>{f4(v)}</span>
                    </div>
                  ))}
                </div>
                <Insight label="WHY AᵀA IS ALWAYS 3×3" c={D.amber}>
                  No matter how many probes — 3, 8, 50 — AᵀA is always 3×3
                  because you only have 3 unknowns [D,E,F]. More probes means
                  better averaging of measurement noise, not more unknowns.
                  This is why precision features get many probe points.
                </Insight>
              </>:<Insight label="ADD PROBES TO SEE AᵀA" c={D.faint}>
                Probe the surface. AᵀA appears here with ≥3 points.
              </Insight>}
            </>}

            {topic==='cond'&&<>
              <Def term="Condition Number κ(A)" c={D.cyan}>
                κ(A) = σ_max / σ_min measures sensitivity to noise. High κ →
                small measurement errors cause large errors in computed diameter.
                {fit&&<><br/><strong style={{color:fit.cond<200?D.green:D.red}}>
                  Your κ ≈ {f3(fit.cond,0)} — {fit.cond<200?'GOOD distribution':'POOR — probes too clustered'}
                </strong></>}
              </Def>
              <Insight label="WHY PROBE PLACEMENT IS A SKILL" c={D.cyan}>
                If all probes cluster in a 30° arc, AᵀA becomes nearly singular.
                κ explodes. CMM best practice: evenly distribute probes around 360°.
                Try it — compare AUTO 8pts (low κ) vs all points in one quadrant (high κ).
              </Insight>
              <Eq c={D.cyan}>{`≥ 3 pts  → unique solution
≥ 6 pts  → reliable diameter
≥ 8 pts  → circularity measurement
≥ 12 pts → high-precision form error

Even spacing → low κ → robust
Clustered    → high κ → noise amplified

Current κ: ${fit?f3(fit.cond,1):'—'}`}</Eq>
              <Def term="Rank Deficiency" c={D.cyan}>
                3 collinear probe points give a rank-deficient A matrix —
                you can't fit a unique circle through 3 collinear points.
                rank(A) must equal 3 for a unique solution.
                In practice: never probe in a straight line.
              </Def>
            </>}

            {topic==='report'&&<>
              {fit?.type==='circle'&&<>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                  <Stat label="NOM Ø (mm)" value="25.0000"/>
                  <Stat label="ACT Ø (mm)" value={f3(actD,4)} pass={passD}/>
                  <Stat label="DEV Ø" value={devD?f3(devD,4):'—'} pass={passD}/>
                  <Stat label="CIRC" value={f3(fit.circularity,4)} pass={fit.circularity<=0.02}/>
                </div>
                <Eq c={D.green}>{`Feature: ${feat==='cylinder'?'Cylinder (XZ circle)':'Circle (bore)'}
Nominal: Ø 25.0000  center (0.000, 0.000)
Actual:  Ø ${f3(actD,4)}  center (${f3(fit.cx,3)}, ${f3(fit.cz,3)})
Dev Ø:   ${f3(devD,4)} mm  ${passD?'PASS ✓':'FAIL ✗'} (tol ±0.050)
Circul:  ${f3(fit.circularity,4)} mm  ${fit.circularity<=0.02?'PASS ✓':'WARN'} (tol 0.020)
κ(A):    ${f3(fit.cond,1)}
Probes:  ${probes.length}`}</Eq>
                <Insight label="RESIDUALS = FORM ERROR" c={D.green}>
                  rᵢ = distance from probe point to best-fit circle.
                  Circularity = max(r) − min(r) = the GD&T form tolerance.
                  Least squares minimizes Σrᵢ² but can't eliminate these
                  because the bore truly isn't round.
                </Insight>
                <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>RESIDUALS (mm)</div>
                <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                  {fit.residuals.map((r,i)=>(
                    <div key={i} style={{padding:'3px 6px',borderRadius:3,
                      background:Math.abs(r)>0.02?'rgba(248,113,113,0.1)':'rgba(0,229,160,0.08)',
                      border:`1px solid ${Math.abs(r)>0.02?D.red+'44':D.green+'33'}`,
                      fontFamily:"'DM Mono',monospace",fontSize:8,
                      color:Math.abs(r)>0.02?D.red:D.green}}>
                      p{i+1}: {r>=0?'+':''}{f3(r,4)}
                    </div>
                  ))}
                </div>
              </>}
              {fit?.type==='plane'&&<>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                  <Stat label="FLATNESS" value={f3(fit.flatness,4)} pass={fit.flatness<=0.05}/>
                  <Stat label="NX" value={f3(fit.normal[0],4)}/>
                  <Stat label="NY" value={f3(fit.normal[2],4)}/>
                  <Stat label="NZ" value={f3(fit.normal[1],4)}/>
                </div>
                <Eq c={D.green}>{`Fit: y = ${f3(fit.a,4)}x + ${f3(fit.b,4)}z + ${f3(fit.c,4)}
Normal: [${f3(fit.normal[0],4)}, ${f3(fit.normal[2],4)}, ${f3(fit.normal[1],4)}]
Flatness: ${f3(fit.flatness,4)} mm  ${fit.flatness<=0.05?'PASS ✓':'FAIL ✗'} (tol 0.050)
κ(A): ${f3(fit.cond,1)}
Probes: ${probes.length}`}</Eq>
                <Insight label="FLATNESS = RANGE OF RESIDUALS" c={D.green}>
                  GD&T flatness = max(r) − min(r) = the thickness of the zone
                  containing all probe points. This is the part of b in the
                  null space of Aᵀ — least squares can't reduce it below
                  the actual surface form error.
                </Insight>
              </>}
              {!fit&&<Insight label="PROBE THE FEATURE TO SEE REPORT" c={D.faint}>
                Add at least 3 probe points to generate a GD&T measurement
                report with actual vs nominal deviation and form error.
              </Insight>}
            </>}
          </div>
        </div>

        {/* ── CENTER: THREE.JS VIEWPORT ── */}
        <div ref={mountRef} onClick={onCanvasClick}
          style={{flex:1,cursor:animating?'wait':'crosshair',overflow:'hidden',position:'relative'}}>
          <div style={{position:'absolute',bottom:10,left:'50%',transform:'translateX(-50%)',
            padding:'3px 14px',background:'rgba(8,11,15,0.75)',borderRadius:4,
            border:`1px solid ${D.border}`,fontSize:9,color:D.faint,
            fontFamily:"'DM Mono',monospace",letterSpacing:2,pointerEvents:'none'}}>
            {animating?'PROBING…':'CLICK SURFACE TO PROBE · DRAG TO ORBIT · SCROLL TO ZOOM'}
          </div>
          {/* Visual error legend */}
          <div style={{position:'absolute',top:8,left:8,padding:'4px 10px',
            background:'rgba(8,11,15,0.7)',borderRadius:4,border:`1px solid ${D.violet}33`,
            fontSize:8,color:D.violet,fontFamily:"'DM Mono',monospace",letterSpacing:1,pointerEvents:'none'}}>
            ERRORS {VIS_SCALE}× VISUAL SCALE
          </div>
        </div>

        {/* ── RIGHT: CONTROLS + PROBE MATRIX ── */}
        <div style={{width:300,flexShrink:0,borderLeft:`1px solid ${D.border}`,
          display:'flex',flexDirection:'column',overflow:'hidden',background:D.surface}}>

          {/* Controls */}
          <div style={{padding:'12px 14px',borderBottom:`1px solid ${D.border}`,flexShrink:0}}>
            <div style={{fontSize:8,color:D.faint,letterSpacing:2,marginBottom:8,fontFamily:"'DM Mono',monospace"}}>TEACH MODE — PROBE PLACEMENT</div>
            <div style={{display:'flex',gap:6,marginBottom:8}}>
              <button onClick={()=>autoProbe(feat==='cylinder'?18:8)}
                style={{flex:1,padding:'6px 8px',background:D.green+'22',border:`1px solid ${D.green}55`,
                  color:D.green,fontSize:9,borderRadius:4,cursor:'pointer',
                  fontFamily:"'DM Mono',monospace",letterSpacing:1}}>
                AUTO {feat==='cylinder'?'3×6pts':'8pts'}
              </button>
              <button onClick={()=>autoProbe(feat==='cylinder'?24:12)}
                style={{flex:1,padding:'6px 8px',background:'transparent',border:`1px solid ${D.green}44`,
                  color:D.green,fontSize:9,borderRadius:4,cursor:'pointer',
                  fontFamily:"'DM Mono',monospace",letterSpacing:1}}>
                AUTO {feat==='cylinder'?'3×8pts':'12pts'}
              </button>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:9,color:D.muted,fontFamily:"'DM Mono',monospace"}}>Probe noise (mm)</span>
                <span style={{fontSize:10,color:D.amber,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{noise.toFixed(4)}</span>
              </div>
              <input type="range" min={0.001} max={0.05} step={0.001} value={noise}
                onChange={e=>setNoise(parseFloat(e.target.value))}
                style={{width:'100%',accentColor:D.amber}}/>
            </div>
            <button onClick={clearAll}
              style={{width:'100%',padding:'5px',background:'transparent',
                border:`1px solid ${D.red}44`,color:D.red,fontSize:9,
                borderRadius:4,cursor:'pointer',fontFamily:"'DM Mono',monospace",letterSpacing:2}}>
              CLEAR ALL PROBES
            </button>
          </div>

          {/* Probe matrix */}
          <div style={{padding:'10px 14px',borderBottom:`1px solid ${D.border}`,flexShrink:0}}>
            <div style={{fontSize:8,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
              PROBE TRANSFORM MATRIX T
            </div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9.5,lineHeight:1.95,
              padding:'7px 10px',background:D.raised,borderRadius:6,border:`1px solid ${D.border2}`}}>
              {pmat.map((row,ri)=>(
                <div key={ri} style={{display:'flex',alignItems:'center'}}>
                  <span style={{color:D.faint,fontSize:12,marginRight:1}}>{ri===0?'⎡':ri===3?'⎣':'⎢'}</span>
                  {row.map((v,ci)=>(
                    <span key={ci} style={{minWidth:ci===3?52:44,textAlign:'right',paddingRight:4,
                      color:ci===3?D.green:ci<3&&ri<3?D.violet:D.faint,
                      fontWeight:ci===3&&ri<3?'700':'400'}}>
                      {v}
                    </span>
                  ))}
                  <span style={{color:D.faint,fontSize:12}}>{ri===0?'⎤':ri===3?'⎦':'⎥'}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:8,color:D.faint,marginTop:4,lineHeight:1.8}}>
              <span style={{color:D.violet}}>■ cols 0-2</span> = rotation (approach direction)
              <br/><span style={{color:D.green}}>■ col 3</span> = ball center (mm), tangent to surface
            </div>
          </div>

          {/* Live stats */}
          <div style={{padding:'10px 14px',flex:1,overflowY:'auto'}}>
            <div style={{fontSize:8,color:D.faint,letterSpacing:2,marginBottom:8,fontFamily:"'DM Mono',monospace"}}>LIVE STATS</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
              <Stat label="PROBES" value={probes.length}/>
              {fit&&<Stat label="COND(A)" value={f3(fit.cond,0)} pass={fit.cond<200}/>}
              {fit?.type==='circle'&&<>
                <Stat label="ACT Ø" value={f3(fit.diameter,4)} pass={passD}/>
                <Stat label="CIRC" value={f3(fit.circularity,4)} pass={fit.circularity<=0.02}/>
              </>}
              {fit?.type==='plane'&&<Stat label="FLAT" value={f3(fit.flatness,4)} pass={fit.flatness<=0.05}/>}
            </div>

            <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
              HOW PROBING BUILDS Ax=b
            </div>
            <div style={{fontSize:10,color:D.muted,lineHeight:1.9,padding:'8px 10px',
              background:D.raised,borderRadius:6,border:`1px solid ${D.border}`}}>
              {feat!=='plane'?<>
                Each click → 1 row of A:<br/>
                <span style={{color:D.cyan}}>[ xᵢ  zᵢ  1 ]</span><br/>
                bᵢ = <span style={{color:D.amber}}>-(xᵢ²+zᵢ²)</span><br/><br/>
                Probe ball center = surface<br/>
                + normal × {RUBY_R}mm (tangent)<br/><br/>
                Residual rᵢ = <span style={{color:D.red}}>circularity error</span><br/>
                AᵀA ← always 3×3 (D,E,F)
              </>:<>
                Each click → 1 row of A:<br/>
                <span style={{color:D.cyan}}>[ xᵢ  zᵢ  1 ]</span><br/>
                bᵢ = <span style={{color:D.amber}}>yᵢ</span> (height)<br/><br/>
                Probe ball center = surface<br/>
                + normal × {RUBY_R}mm (tangent)<br/><br/>
                Residual rᵢ = <span style={{color:D.red}}>flatness error</span><br/>
                AᵀA ← always 3×3 (a,b,c)
              </>}
            </div>

            {/* Hidden truth */}
            <div style={{marginTop:10,fontSize:9,color:D.faint,letterSpacing:2,marginBottom:4,fontFamily:"'DM Mono',monospace"}}>
              HIDDEN TRUTH (real CMM can't see this)
            </div>
            <div style={{padding:'7px 10px',background:'rgba(167,139,250,0.05)',
              borderRadius:6,border:`1px solid ${D.violet}22`,
              fontFamily:"'DM Mono',monospace",fontSize:9,color:D.faint,lineHeight:1.9}}>
              {feat==='circle'&&<>
                True cx = <span style={{color:D.violet}}>+0.047</span> mm<br/>
                True cz = <span style={{color:D.violet}}>-0.031</span> mm<br/>
                True r  = <span style={{color:D.violet}}>12.437</span> mm (nom 12.5)<br/>
                Circ err= <span style={{color:D.violet}}>±0.18</span> mm (3-lobe)<br/>
                Visual  = <span style={{color:D.violet}}>{VIS_SCALE}× exaggerated</span>
              </>}
              {feat==='plane'&&<>
                True tiltX = <span style={{color:D.violet}}>0.003</span> mm/mm<br/>
                True tiltZ = <span style={{color:D.violet}}>-0.0015</span> mm/mm<br/>
                True offset= <span style={{color:D.violet}}>0.002</span> mm<br/>
                Bump amp  = <span style={{color:D.violet}}>±0.04</span> mm<br/>
                Visual  = <span style={{color:D.violet}}>{VIS_SCALE}× exaggerated</span>
              </>}
              {feat==='cylinder'&&<>
                True cx = <span style={{color:D.violet}}>+0.031</span> mm<br/>
                True cz = <span style={{color:D.violet}}>-0.018</span> mm<br/>
                True r  = <span style={{color:D.violet}}>12.465</span> mm (nom 12.5)<br/>
                Circ err= <span style={{color:D.violet}}>±0.15</span> mm (2-lobe)<br/>
                Visual  = <span style={{color:D.violet}}>{VIS_SCALE}× exaggerated</span>
              </>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
