import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Line, Circle as KonvaCircle, Arc, Text as KonvaText, Group } from 'react-konva'
import {
  X, Trash2, Undo2, Pencil, Eraser, Sun, Moon, Minus, Plus,
  Check, MousePointer2, Triangle, Square, Circle, Hexagon,
} from 'lucide-react'

// ─── Constants ─────────────────────────────────────────────────────────────

const PALETTE = [
  '#ef4444','#f97316','#facc15','#22c55e',
  '#06b6d4','#6366f1','#a855f7','#ec4899',
  '#ffffff','#94a3b8','#1e293b',
]

const LINES_KEY  = 'oc-pad-lines'
const SHAPES_KEY = 'oc-pad-shapes'
const SIZE_KEY   = 'oc-pad-size'
const MIN_W = 300, MIN_H = 220, DEFAULT_W = 640, DEFAULT_H = 480

// point where polygon auto-snaps closed (px)
const SNAP_DIST = 14

const GEO_TOOLS = [
  { id: 'select',   label: 'Select',   Icon: MousePointer2 },
  { id: 'segment',  label: 'Segment',  Icon: () => <span style={{fontSize:13,lineHeight:1}}>╱</span> },
  { id: 'rect',     label: 'Rect',     Icon: Square },
  { id: 'circle',   label: 'Circle',   Icon: Circle },
  { id: 'triangle', label: 'Triangle', Icon: Triangle },
  { id: 'polygon',  label: 'Polygon',  Icon: Hexagon },
]

// ─── Math helpers ───────────────────────────────────────────────────────────

const dist   = (x1,y1,x2,y2) => Math.sqrt((x2-x1)**2+(y2-y1)**2)
const fmt    = n => n.toFixed(1)

function angleBetween(ax,ay,vx,vy,bx,by) {
  const dax=ax-vx, day=ay-vy, dbx=bx-vx, dby=by-vy
  const dot = dax*dbx+day*dby
  const mag = Math.sqrt(dax**2+day**2)*Math.sqrt(dbx**2+dby**2)
  return mag<1e-10 ? 0 : Math.acos(Math.max(-1,Math.min(1,dot/mag)))*180/Math.PI
}

function shoelaceArea(pts) {
  const n=pts.length/2; let a=0
  for(let i=0;i<n;i++){const j=(i+1)%n;a+=pts[i*2]*pts[j*2+1]-pts[j*2]*pts[i*2+1]}
  return Math.abs(a)/2
}

function perimeterOf(pts,closed=true) {
  const n=pts.length/2; let p=0
  for(let i=0;i<n-1;i++) p+=dist(pts[i*2],pts[i*2+1],pts[(i+1)*2],pts[(i+1)*2+1])
  if(closed&&n>1) p+=dist(pts[(n-1)*2],pts[(n-1)*2+1],pts[0],pts[1])
  return p
}

function centroidOf(pts) {
  const n=pts.length/2; let cx=0,cy=0
  for(let i=0;i<n;i++){cx+=pts[i*2];cy+=pts[i*2+1]}
  return [cx/n,cy/n]
}

// Ramer-Douglas-Peucker stroke decimation — keeps visual fidelity, cuts storage
function rdpFlat(flat, eps=2.5) {
  const n=flat.length/2; if(n<=2) return flat
  const pts=Array.from({length:n},(_,i)=>[flat[i*2],flat[i*2+1]])
  return rdp(pts,eps).flat()
}
function rdp(pts,eps) {
  if(pts.length<=2) return pts
  const [s,e]=[pts[0],pts[pts.length-1]]
  let md=0,mi=0
  for(let i=1;i<pts.length-1;i++){const d=ptSeg(pts[i],s,e);if(d>md){md=d;mi=i}}
  if(md>eps) return [...rdp(pts.slice(0,mi+1),eps).slice(0,-1),...rdp(pts.slice(mi),eps)]
  return [s,e]
}
function ptSeg([x0,y0],[x1,y1],[x2,y2]) {
  const num=Math.abs((y2-y1)*x0-(x2-x1)*y0+x2*y1-y2*x1)
  const den=Math.sqrt((y2-y1)**2+(x2-x1)**2)
  return den<1e-10 ? dist(x0,y0,x1,y1) : num/den
}

// ─── Storage ────────────────────────────────────────────────────────────────

const load = (k,fb) => { try{return JSON.parse(localStorage.getItem(k)??'null')??fb}catch{return fb} }
const save = (k,v)  => { try{localStorage.setItem(k,JSON.stringify(v))}catch{} }

// ─── Geometry Konva components ──────────────────────────────────────────────

const TS = { fontSize:11, fontFamily:'monospace', listening:false }

// Arc showing an interior angle at vertex V between neighbors A and B
function AngleArc({ax,ay,vx,vy,bx,by,color}) {
  const dax=ax-vx, day=ay-vy, dbx=bx-vx, dby=by-vy
  const cross=dax*dby-day*dbx
  // start from whichever neighbor is CW-first
  const startDeg=Math.atan2(cross>=0?day:dby, cross>=0?dax:dbx)*180/Math.PI
  const sweep=angleBetween(ax,ay,vx,vy,bx,by)
  return (
    <Arc x={vx} y={vy} innerRadius={0} outerRadius={16}
      rotation={startDeg} angle={sweep}
      stroke={color} strokeWidth={1} fill={color+'22'} listening={false}/>
  )
}

// Renders a completed shape with its measurements
function ShapeDisplay({shape, selected, darkCanvas, onSelect}) {
  const lc = darkCanvas ? '#e2e8f0' : '#1e293b'
  const sc = selected ? '#f97316' : shape.color
  const sel = {
    onClick: e=>{ e.cancelBubble=true; onSelect(shape.id) },
    onTap:   e=>{ e.cancelBubble=true; onSelect(shape.id) },
  }

  if(shape.type==='segment') {
    const [x1,y1,x2,y2]=shape.points
    const len=dist(x1,y1,x2,y2)
    const mx=(x1+x2)/2, my=(y1+y2)/2
    return <Group>
      <Line points={shape.points} stroke={sc} strokeWidth={shape.sw} lineCap="round" {...sel}/>
      <KonvaCircle x={x1} y={y1} radius={4} fill={sc} listening={false}/>
      <KonvaCircle x={x2} y={y2} radius={4} fill={sc} listening={false}/>
      <KonvaText x={mx+6} y={my-10} text={`${fmt(len)} u`} {...TS} fill={lc}/>
    </Group>
  }

  if(shape.type==='rect') {
    const [x1,y1,x2,y2]=shape.points
    const w=Math.abs(x2-x1), h=Math.abs(y2-y1)
    const rx=Math.min(x1,x2), ry=Math.min(y1,y2)
    const pts=[rx,ry, rx+w,ry, rx+w,ry+h, rx,ry+h]
    return <Group>
      <Line points={pts} closed stroke={sc} strokeWidth={shape.sw} fill={sc+'1a'} {...sel}/>
      <KonvaText x={rx+w/2-20} y={ry+h+5}   text={`${fmt(w)} u`}          {...TS} fill={lc}/>
      <KonvaText x={rx+w+5}    y={ry+h/2-6}  text={`${fmt(h)} u`}          {...TS} fill={lc}/>
      <KonvaText x={rx+w/2-34} y={ry+h/2-6}  text={`A≈${fmt(w*h)} u²`}    {...TS} fill={lc}/>
    </Group>
  }

  if(shape.type==='circle') {
    const [cx,cy,rx,ry]=shape.points
    const r=dist(cx,cy,rx,ry)
    const mx=(cx+rx)/2, my=(cy+ry)/2
    return <Group>
      <KonvaCircle x={cx} y={cy} radius={r} stroke={sc} strokeWidth={shape.sw} fill={sc+'1a'} {...sel}/>
      <Line points={[cx,cy,rx,ry]} stroke={sc} strokeWidth={1} dash={[4,3]} listening={false}/>
      <KonvaCircle x={cx} y={cy} radius={3} fill={sc} listening={false}/>
      <KonvaText x={mx+4}  y={my-12} text={`r=${fmt(r)} u`}             {...TS} fill={lc}/>
      <KonvaText x={cx-32} y={cy+6}  text={`A≈${fmt(Math.PI*r*r)} u²`} {...TS} fill={lc}/>
    </Group>
  }

  if(shape.type==='triangle') {
    const [x1,y1,x2,y2,x3,y3]=shape.points
    const pts=shape.points
    const [gcx,gcy]=centroidOf(pts)
    const verts=[[x1,y1],[x2,y2],[x3,y3]]
    const prev=[[x3,y3],[x1,y1],[x2,y2]]
    const next=[[x2,y2],[x3,y3],[x1,y1]]
    const sides=[dist(x1,y1,x2,y2), dist(x2,y2,x3,y3), dist(x3,y3,x1,y1)]
    const angles=[
      angleBetween(x3,y3,x1,y1,x2,y2),
      angleBetween(x1,y1,x2,y2,x3,y3),
      angleBetween(x2,y2,x3,y3,x1,y1),
    ]
    return <Group>
      <Line points={pts} closed stroke={sc} strokeWidth={shape.sw} fill={sc+'1a'} {...sel}/>
      {verts.map(([vx,vy],i)=>(
        <AngleArc key={i}
          ax={prev[i][0]} ay={prev[i][1]}
          vx={vx} vy={vy}
          bx={next[i][0]} by={next[i][1]}
          color={sc}/>
      ))}
      {verts.map(([vx,vy],i)=>{
        const ox=(gcx-vx)*0.3, oy=(gcy-vy)*0.3
        return <KonvaText key={i} x={vx+ox-16} y={vy+oy-7} text={`${fmt(angles[i])}°`} {...TS} fill={lc}/>
      })}
      {verts.map(([vx,vy],i)=>{
        const [nx,ny]=next[i]
        const mx=(vx+nx)/2, my=(vy+ny)/2
        const ox=(mx-gcx)*0.2, oy=(my-gcy)*0.2
        return <KonvaText key={i} x={mx+ox-16} y={my+oy-7} text={`${fmt(sides[i])} u`} {...TS} fill={lc}/>
      })}
    </Group>
  }

  if(shape.type==='polygon') {
    const pts=shape.points
    const [gcx,gcy]=centroidOf(pts)
    const area=shoelaceArea(pts)
    const perim=perimeterOf(pts,true)
    return <Group>
      <Line points={pts} closed stroke={sc} strokeWidth={shape.sw} fill={sc+'1a'} {...sel}/>
      <KonvaText x={gcx-36} y={gcy-8} text={`P=${fmt(perim)} u`} {...TS} fill={lc}/>
      <KonvaText x={gcx-36} y={gcy+6} text={`A=${fmt(area)} u²`} {...TS} fill={lc}/>
    </Group>
  }

  return null
}

// Live preview while placing a shape
function ShapePreview({inProg, mx, my, color, sw}) {
  if(!inProg || inProg.points.length===0) return null
  const pts=inProg.points

  if(inProg.type==='segment')
    return <Line points={[...pts,mx,my]} stroke={color} strokeWidth={sw} dash={[5,4]} lineCap="round" listening={false}/>

  if(inProg.type==='rect')
    return <Line points={[pts[0],pts[1], mx,pts[1], mx,my, pts[0],my]}
      closed stroke={color} strokeWidth={sw} dash={[5,4]} fill={color+'18'} listening={false}/>

  if(inProg.type==='circle') {
    const r=dist(pts[0],pts[1],mx,my)
    return <KonvaCircle x={pts[0]} y={pts[1]} radius={r}
      stroke={color} strokeWidth={sw} dash={[5,4]} fill={color+'18'} listening={false}/>
  }

  if(inProg.type==='triangle') {
    const placed=pts.length/2
    if(placed===1) return <Line points={[...pts,mx,my]} stroke={color} strokeWidth={sw} dash={[5,4]} lineCap="round" listening={false}/>
    // 2 points placed → show both placed edges + ghost closing edge
    return <Group>
      <Line points={pts} stroke={color} strokeWidth={sw} lineCap="round" listening={false}/>
      <Line points={[pts[pts.length-2],pts[pts.length-1],mx,my]} stroke={color} strokeWidth={sw} lineCap="round" listening={false}/>
      <Line points={[mx,my,pts[0],pts[1]]} stroke={color} strokeWidth={sw} dash={[5,4]} listening={false}/>
    </Group>
  }

  if(inProg.type==='polygon') {
    const canClose=pts.length>=6 && dist(pts[0],pts[1],mx,my)<SNAP_DIST
    return <Group>
      <Line points={[...pts,mx,my]} stroke={color} strokeWidth={sw} lineCap="round" listening={false}/>
      {canClose && <Line points={[mx,my,pts[0],pts[1]]} stroke={color} strokeWidth={sw} dash={[4,3]} listening={false}/>}
      {/* snap indicator */}
      {canClose && <KonvaCircle x={pts[0]} y={pts[1]} radius={8} stroke={color} strokeWidth={2} listening={false}/>}
    </Group>
  }

  return null
}

// ─── ResizeHandle (DOM) ─────────────────────────────────────────────────────

function ResizeHandle({direction, onResize, darkCanvas}) {
  const dragging=useRef(false), start=useRef({})
  const onPD = e=>{e.stopPropagation();e.preventDefault();dragging.current=true;start.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)}
  const onPM = e=>{
    if(!dragging.current) return
    const dx=e.clientX-start.current.x, dy=e.clientY-start.current.y
    start.current={x:e.clientX,y:e.clientY}
    onResize(direction,dx,dy)
  }
  const onPU=()=>{dragging.current=false}
  const base={position:'absolute',zIndex:10,background:'transparent'}
  const styles={
    top:    {...base,top:0,left:8,right:8,height:8,cursor:'ns-resize'},
    left:   {...base,left:0,top:8,bottom:8,width:8,cursor:'ew-resize'},
    corner: {...base,top:0,left:0,width:16,height:16,cursor:'nwse-resize'},
  }
  return (
    <div style={styles[direction]} onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU}>
      {direction==='top' && (
        <div style={{position:'absolute',top:2,left:'50%',transform:'translateX(-50%)',width:36,height:3,borderRadius:2,background:darkCanvas?'#475569':'#cbd5e1'}}/>
      )}
    </div>
  )
}

// ─── Toolbar sub-components ─────────────────────────────────────────────────

const Div=({c})=><div style={{width:1,height:18,background:c,flexShrink:0,margin:'0 3px'}}/>

function TBtn({children,active,onClick,title,dark,label}) {
  return (
    <button onClick={onClick} title={title} style={{
      display:'flex',alignItems:'center',gap:4,
      padding:'5px 7px',borderRadius:8,border:'none',cursor:'pointer',flexShrink:0,
      background:active?(dark?'#3b4f6e':'#dbeafe'):'transparent',
      color:active?'#6366f1':(dark?'#94a3b8':'#64748b'),
      fontSize:11,fontFamily:'system-ui,sans-serif',whiteSpace:'nowrap',
    }}>
      {children}
      {label && <span style={{fontSize:10}}>{label}</span>}
    </button>
  )
}

function IBtn({children,onClick,color,title,disabled}) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{
      display:'flex',alignItems:'center',padding:'5px',borderRadius:8,
      border:'none',cursor:disabled?'default':'pointer',flexShrink:0,
      background:'transparent',color,opacity:disabled?0.3:1,
    }}>
      {children}
    </button>
  )
}

// Palette swatch
function Swatch({c,active,onClick}) {
  return (
    <button onClick={onClick} title={c} style={{
      width:18,height:18,borderRadius:'50%',flexShrink:0,
      background:c,cursor:'pointer',
      border:active?'2px solid #6366f1':'1.5px solid rgba(0,0,0,0.18)',
      outline:active?'2px solid #818cf8':'none',outlineOffset:1,
    }}/>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function ScratchPad({isOpen, onClose}) {
  // draw state
  const [lines,  setLines]  = useState(()=>load(LINES_KEY,[]))
  const [tool,   setTool]   = useState('brush')
  const [color,  setColor]  = useState('#6366f1')
  const [sw,     setSw]     = useState(4)

  // geo state
  const [mode,       setMode]       = useState('draw') // 'draw' | 'geo'
  const [geoTool,    setGeoTool]    = useState('segment')
  const [shapes,     setShapes]     = useState(()=>load(SHAPES_KEY,[]))
  const [inProg,     setInProg]     = useState(null)   // shape being placed
  const [mousePos,   setMousePos]   = useState({x:0,y:0})
  const [selectedId, setSelectedId] = useState(null)

  // shared
  const [darkCanvas, setDarkCanvas] = useState(()=>document.documentElement.classList.contains('dark'))

  // panel size
  const saved = load(SIZE_KEY,null)
  const [panelW, setPanelW] = useState(saved?.w ?? DEFAULT_W)
  const [panelH, setPanelH] = useState(saved?.h ?? DEFAULT_H)

  const isDrawing  = useRef(false)
  const stageRef   = useRef(null)
  const containerRef=useRef(null)
  const [canvasSize,setCanvasSize]=useState({w:0,h:0})

  const [isMobile, setIsMobile]=useState(()=>window.innerWidth<640)
  useEffect(()=>{
    const chk=()=>setIsMobile(window.innerWidth<640)
    window.addEventListener('resize',chk)
    return()=>window.removeEventListener('resize',chk)
  },[])

  // Measure canvas container
  useEffect(()=>{
    if(!isOpen) return
    const measure=()=>{
      if(containerRef.current) setCanvasSize({w:containerRef.current.offsetWidth,h:containerRef.current.offsetHeight})
    }
    measure()
    const ro=new ResizeObserver(measure)
    if(containerRef.current) ro.observe(containerRef.current)
    return()=>ro.disconnect()
  },[isOpen,panelW,panelH,isMobile])

  // Persist
  useEffect(()=>{save(LINES_KEY,lines)},[lines])
  useEffect(()=>{save(SHAPES_KEY,shapes)},[shapes])
  useEffect(()=>{if(!isMobile)save(SIZE_KEY,{w:panelW,h:panelH})},[panelW,panelH,isMobile])

  // Keyboard: Delete/Backspace removes selected shape; Escape cancels inProg
  useEffect(()=>{
    if(!isOpen) return
    const h=e=>{
      if(['Delete','Backspace'].includes(e.key)&&selectedId&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){
        setShapes(prev=>prev.filter(s=>s.id!==selectedId))
        setSelectedId(null)
      }
      if(e.key==='Escape') setInProg(null)
    }
    window.addEventListener('keydown',h)
    return()=>window.removeEventListener('keydown',h)
  },[isOpen,selectedId])

  // Resize panel
  const handleResize=useCallback((dir,dx,dy)=>{
    if(dir==='top'||dir==='corner') setPanelH(h=>Math.max(MIN_H,Math.min(h-dy,window.innerHeight-80)))
    if(dir==='left'||dir==='corner') setPanelW(w=>Math.max(MIN_W,Math.min(w-dx,window.innerWidth-24)))
  },[])

  // ── Freehand draw handlers ─────────────────────────────────────────────
  const getPos=e=>e.target.getStage().getPointerPosition()

  const handleDrawDown=useCallback(e=>{
    if(mode!=='draw') return
    isDrawing.current=true
    const pos=getPos(e)
    setLines(prev=>[...prev,{tool,color:tool==='eraser'?null:color,sw,points:[pos.x,pos.y]}])
  },[mode,tool,color,sw])

  const handleDrawMove=useCallback(e=>{
    const pos=getPos(e)
    setMousePos(pos)
    if(mode!=='draw'||!isDrawing.current) return
    e.evt.preventDefault()
    setLines(prev=>{
      const upd=[...prev]
      const last={...upd[upd.length-1]}
      last.points=[...last.points,pos.x,pos.y]
      upd[upd.length-1]=last
      return upd
    })
  },[mode])

  const handleDrawUp=useCallback(()=>{
    if(mode!=='draw') return
    isDrawing.current=false
    // Apply RDP decimation to last stroke to keep localStorage lean
    setLines(prev=>{
      if(!prev.length) return prev
      const upd=[...prev]
      const last={...upd[upd.length-1]}
      last.points=rdpFlat(last.points)
      upd[upd.length-1]=last
      return upd
    })
  },[mode])

  // ── Geometry click handler ─────────────────────────────────────────────
  const addShape=useCallback(shape=>{
    setShapes(prev=>[...prev,{...shape,id:Date.now()+Math.random()}])
  },[])

  const handleGeoClick=useCallback(e=>{
    if(mode!=='geo') return
    // ignore clicks on shapes (they stop propagation)
    if(e.target!==e.target.getStage()) return

    const pos=getPos(e)

    if(geoTool==='select') { setSelectedId(null); return }

    const NEEDS={segment:2,rect:2,circle:2,triangle:3}

    if(!inProg) {
      setInProg({type:geoTool,points:[pos.x,pos.y],color,sw})
      return
    }

    const newPts=[...inProg.points,pos.x,pos.y]
    const nPts=newPts.length/2

    if(geoTool==='polygon') {
      // close if snapping to first point
      if(nPts>=3&&dist(newPts[0],newPts[1],pos.x,pos.y)<SNAP_DIST) {
        addShape({...inProg})
        setInProg(null)
      } else {
        setInProg({...inProg,points:newPts})
      }
      return
    }

    if(nPts>=NEEDS[geoTool]) {
      addShape({...inProg,points:newPts})
      setInProg(null)
    } else {
      setInProg({...inProg,points:newPts})
    }
  },[mode,geoTool,inProg,color,sw,addShape])

  const finishPolygon=()=>{
    if(inProg?.type==='polygon'&&inProg.points.length>=6) {
      addShape(inProg)
      setInProg(null)
    }
  }

  // ── Undo / Clear ──────────────────────────────────────────────────────
  const undo=()=>{
    if(inProg) { setInProg(null); return }
    if(mode==='geo') setShapes(prev=>prev.slice(0,-1))
    else             setLines(prev=>prev.slice(0,-1))
  }

  const clear=()=>{
    setLines([])
    setShapes([])
    setInProg(null)
    setSelectedId(null)
  }

  // ─── Colors + active tool for palette ────────────────────────────────
  const pickColor=c=>{ setColor(c); if(mode==='draw') setTool('brush') }
  const brushActive=mode==='draw'&&tool==='brush'

  const bg    = darkCanvas ? '#0f172a' : '#f8fafc'
  const tbBg  = darkCanvas ? '#1e293b' : '#f1f5f9'
  const bdr   = darkCanvas ? '#334155' : '#e2e8f0'
  const ic    = darkCanvas ? '#94a3b8' : '#64748b'

  const canUndo = !!(inProg || (mode==='geo'?shapes.length:lines.length))

  if(!isOpen) return null

  // ─── Panel positioning ─────────────────────────────────────────────────
  const mobileStyle={
    position:'fixed',bottom:0,left:0,right:0,
    height:Math.max(MIN_H,Math.min(panelH,window.innerHeight-60)),
    zIndex:120,display:'flex',flexDirection:'column',
    borderRadius:'16px 16px 0 0',overflow:'hidden',
    boxShadow:'0 -8px 40px rgba(0,0,0,0.3)',
    borderTop:`1px solid ${bdr}`,background:darkCanvas?'#1e293b':'#fff',
  }
  const desktopStyle={
    position:'fixed',bottom:'1rem',right:'1rem',width:panelW,height:panelH,
    zIndex:120,display:'flex',flexDirection:'column',
    borderRadius:16,overflow:'hidden',
    boxShadow:'0 8px 40px rgba(0,0,0,0.22)',
    border:`1px solid ${bdr}`,background:darkCanvas?'#1e293b':'#fff',
  }

  // ─── Toolbar row style helper ──────────────────────────────────────────
  const rowStyle={
    display:'flex',alignItems:'center',gap:4,
    padding:'5px 10px',
    background:tbBg,flexShrink:0,
    overflowX:'auto',overflowY:'hidden',
    scrollbarWidth:'none',msOverflowStyle:'none',
    WebkitOverflowScrolling:'touch',
    userSelect:'none',
  }

  const polygonInProgress=inProg?.type==='polygon'&&inProg.points.length>=6
  const showFinish=mode==='geo'&&polygonInProgress

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div style={isMobile?mobileStyle:desktopStyle}>

      {/* Desktop resize handles */}
      {!isMobile&&<>
        <ResizeHandle direction="top"    onResize={handleResize} darkCanvas={darkCanvas}/>
        <ResizeHandle direction="left"   onResize={handleResize} darkCanvas={darkCanvas}/>
        <ResizeHandle direction="corner" onResize={handleResize} darkCanvas={darkCanvas}/>
      </>}
      {/* Mobile height-only resize */}
      {isMobile&&<ResizeHandle direction="top" onResize={handleResize} darkCanvas={darkCanvas}/>}

      {/* ═══ MOBILE TOOLBAR ═══ */}
      {isMobile ? <>
        {/* Row 1: mode tabs + actions + close */}
        <div style={{...rowStyle,paddingTop:14,borderBottom:`1px solid ${bdr}`,gap:6}}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:ic,flexShrink:0}}>Scratch</span>
          <Div c={bdr}/>
          <TBtn active={mode==='draw'} onClick={()=>setMode('draw')} dark={darkCanvas}>Draw</TBtn>
          <TBtn active={mode==='geo'}  onClick={()=>setMode('geo')}  dark={darkCanvas}>Geo</TBtn>
          <div style={{flex:1}}/>
          {/* Size +/- only in draw mode */}
          {mode==='draw'&&<>
            <IBtn onClick={()=>setSw(w=>Math.max(1,w-2))} color={ic}><Minus size={13}/></IBtn>
            <div style={{width:Math.max(6,sw)+4,height:Math.max(6,sw)+4,borderRadius:'50%',background:tool==='eraser'?(darkCanvas?'#475569':'#cbd5e1'):color,border:`1.5px solid ${bdr}`,flexShrink:0}}/>
            <IBtn onClick={()=>setSw(w=>Math.min(32,w+2))} color={ic}><Plus size={13}/></IBtn>
            <Div c={bdr}/>
          </>}
          <IBtn onClick={()=>setDarkCanvas(d=>!d)} color={ic}>{darkCanvas?<Sun size={15}/>:<Moon size={15}/>}</IBtn>
          <IBtn onClick={undo}  color={ic}    disabled={!canUndo}><Undo2 size={15}/></IBtn>
          <IBtn onClick={clear} color="#ef4444" disabled={!lines.length&&!shapes.length}><Trash2 size={15}/></IBtn>
          <Div c={bdr}/>
          {/* Close always visible on mobile */}
          <IBtn onClick={onClose} color={ic}><X size={16}/></IBtn>
        </div>

        {/* Row 2: draw tools OR geo tools */}
        <div style={{...rowStyle,borderBottom:`1px solid ${bdr}`,gap:4,flexWrap:'nowrap'}}>
          {mode==='draw' ? <>
            <TBtn active={tool==='brush'}  onClick={()=>setTool('brush')}  dark={darkCanvas}><Pencil size={14}/> Brush</TBtn>
            <TBtn active={tool==='eraser'} onClick={()=>setTool('eraser')} dark={darkCanvas}><Eraser size={14}/> Erase</TBtn>
          </> : <>
            {GEO_TOOLS.map(({id,label,Icon})=>(
              <TBtn key={id} active={geoTool===id} onClick={()=>{setGeoTool(id);setInProg(null)}} dark={darkCanvas}>
                <Icon size={13}/> {label}
              </TBtn>
            ))}
            {showFinish&&(
              <TBtn active={false} onClick={finishPolygon} dark={darkCanvas} label="">
                <Check size={13}/> Finish
              </TBtn>
            )}
          </>}
        </div>

        {/* Row 3: color palette — 4-column grid on mobile */}
        <div style={{...rowStyle,flexWrap:'wrap',gap:8,padding:'8px 12px',borderBottom:`1px solid ${bdr}`,display:'grid',gridTemplateColumns:'repeat(4,1fr)',justifyItems:'center'}}>
          {PALETTE.map(c=>(
            <Swatch key={c} c={c} active={brushActive&&color===c} onClick={()=>pickColor(c)}/>
          ))}
        </div>
      </>

      /* ═══ DESKTOP TOOLBAR ═══ */
      : <div style={{...rowStyle,borderBottom:`1px solid ${bdr}`,paddingTop:10,gap:4}}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:ic,flexShrink:0,marginRight:2}}>Scratch</span>
          <Div c={bdr}/>

          {/* Mode tabs */}
          <TBtn active={mode==='draw'} onClick={()=>setMode('draw')} dark={darkCanvas}><Pencil size={13}/> Draw</TBtn>
          <TBtn active={mode==='geo'}  onClick={()=>setMode('geo')}  dark={darkCanvas}><Triangle size={13}/> Geo</TBtn>
          <Div c={bdr}/>

          {/* Draw tools */}
          {mode==='draw' ? <>
            <TBtn active={tool==='brush'}  onClick={()=>setTool('brush')}  dark={darkCanvas}><Pencil size={13}/></TBtn>
            <TBtn active={tool==='eraser'} onClick={()=>setTool('eraser')} dark={darkCanvas}><Eraser size={13}/></TBtn>
            <Div c={bdr}/>
            <IBtn onClick={()=>setSw(w=>Math.max(1,w-2))} color={ic}><Minus size={12}/></IBtn>
            <div style={{width:Math.max(6,sw)+6,height:Math.max(6,sw)+6,borderRadius:'50%',background:tool==='eraser'?(darkCanvas?'#475569':'#cbd5e1'):color,border:`1.5px solid ${bdr}`,flexShrink:0}}/>
            <IBtn onClick={()=>setSw(w=>Math.min(32,w+2))} color={ic}><Plus size={12}/></IBtn>
          </> : <>
            {/* Geo tools */}
            {GEO_TOOLS.map(({id,label,Icon})=>(
              <TBtn key={id} active={geoTool===id} onClick={()=>{setGeoTool(id);setInProg(null)}} dark={darkCanvas}>
                <Icon size={13}/> <span style={{fontSize:10}}>{label}</span>
              </TBtn>
            ))}
            {showFinish&&<TBtn active={false} onClick={finishPolygon} dark={darkCanvas}><Check size={13}/> <span style={{fontSize:10}}>Finish</span></TBtn>}
          </>}

          <Div c={bdr}/>

          {/* Palette — single row on desktop */}
          <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
            {PALETTE.map(c=>(
              <Swatch key={c} c={c} active={brushActive&&color===c} onClick={()=>pickColor(c)}/>
            ))}
          </div>

          <div style={{flex:1}}/>

          <IBtn onClick={()=>setDarkCanvas(d=>!d)} color={ic}>{darkCanvas?<Sun size={15}/>:<Moon size={15}/>}</IBtn>
          <Div c={bdr}/>
          <IBtn onClick={undo}  color={ic}       disabled={!canUndo}><Undo2 size={15}/></IBtn>
          <IBtn onClick={clear} color="#ef4444"  disabled={!lines.length&&!shapes.length}><Trash2 size={15}/></IBtn>
          <Div c={bdr}/>
          <IBtn onClick={onClose} color={ic}><X size={15}/></IBtn>
        </div>
      }

      {/* ═══ CANVAS ═══ */}
      <div
        ref={containerRef}
        style={{
          flex:1,overflow:'hidden',
          background:bg,
          cursor:mode==='draw'?(tool==='eraser'?'cell':'crosshair'):(geoTool==='select'?'default':'crosshair'),
          touchAction:'none',
        }}
      >
        {canvasSize.w>0&&(
          <Stage
            ref={stageRef}
            width={canvasSize.w}
            height={canvasSize.h}
            onMouseDown={handleDrawDown}
            onMousemove={handleDrawMove}
            onMouseup={handleDrawUp}
            onTouchStart={handleDrawDown}
            onTouchMove={handleDrawMove}
            onTouchEnd={handleDrawUp}
            onClick={handleGeoClick}
            onTap={handleGeoClick}
          >
            {/* Layer 1: freehand strokes (eraser uses destination-out on this layer's canvas) */}
            <Layer>
              {lines.map((line,i)=>(
                <Line key={i} points={line.points}
                  stroke={line.tool==='eraser'?bg:line.color}
                  strokeWidth={line.sw}
                  tension={0.4} lineCap="round" lineJoin="round"
                  globalCompositeOperation={line.tool==='eraser'?'destination-out':'source-over'}
                />
              ))}
            </Layer>

            {/* Layer 2: completed geometry shapes */}
            <Layer>
              {shapes.map(shape=>(
                <ShapeDisplay
                  key={shape.id}
                  shape={shape}
                  selected={shape.id===selectedId}
                  darkCanvas={darkCanvas}
                  onSelect={id=>{setSelectedId(prev=>prev===id?null:id)}}
                />
              ))}
              {/* In-progress preview */}
              <ShapePreview inProg={inProg} mx={mousePos.x} my={mousePos.y} color={color} sw={sw}/>
              {/* Placed vertex dots while building */}
              {inProg&&inProg.points&&Array.from({length:inProg.points.length/2},(_,i)=>(
                <KonvaCircle key={i} x={inProg.points[i*2]} y={inProg.points[i*2+1]}
                  radius={4} fill={color} listening={false}/>
              ))}
            </Layer>
          </Stage>
        )}
      </div>

      {/* Selected shape info bar */}
      {selectedId&&(
        <div style={{
          padding:'5px 12px',background:tbBg,borderTop:`1px solid ${bdr}`,
          display:'flex',alignItems:'center',gap:8,flexShrink:0,
        }}>
          <span style={{fontSize:11,color:ic}}>
            {shapes.find(s=>s.id===selectedId)?.type} selected
          </span>
          <div style={{flex:1}}/>
          <span style={{fontSize:11,color:ic,opacity:0.6}}>Delete / Backspace to remove</span>
          <IBtn onClick={()=>{setShapes(prev=>prev.filter(s=>s.id!==selectedId));setSelectedId(null)}} color="#ef4444">
            <Trash2 size={13}/>
          </IBtn>
        </div>
      )}
    </div>
  )
}
