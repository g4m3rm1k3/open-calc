import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Line, Circle as KonvaCircle, Arc, Text as KonvaText, Group } from 'react-konva'
import {
  X, Trash2, Undo2, Pencil, Eraser, Sun, Moon, Minus, Plus,
  Check, MousePointer2, Triangle, Square, Circle, Hexagon,
  Grid3x3, Magnet,
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
const GRID_KEY   = 'oc-pad-grid'
const MIN_W = 300, MIN_H = 220, DEFAULT_W = 680, DEFAULT_H = 520
const SNAP_DIST = 14

const GEO_TOOLS = [
  { id:'select',   label:'Select',   Icon:MousePointer2 },
  { id:'segment',  label:'Segment',  Icon:()=><span style={{fontSize:13,lineHeight:1}}>╱</span> },
  { id:'rect',     label:'Rect',     Icon:Square },
  { id:'circle',   label:'Circle',   Icon:Circle },
  { id:'triangle', label:'Triangle', Icon:Triangle },
  { id:'polygon',  label:'Polygon',  Icon:Hexagon },
]

// Fields shown in the shape panel per type
const SHAPE_FIELDS = {
  segment:  [['x1','X1'],['y1','Y1'],['x2','X2'],['y2','Y2']],
  rect:     [['x','X'],['y','Y'],['w','W'],['h','H']],
  circle:   [['cx','CX'],['cy','CY'],['r','R']],
  triangle: [['x1','X1'],['y1','Y1'],['x2','X2'],['y2','Y2'],['x3','X3'],['y3','Y3']],
  polygon:  [['sides','N'],['cx','CX'],['cy','CY'],['r','R']],
}

const DEFAULTS = {
  segment:  { x1:80,  y1:160, x2:280, y2:160 },
  rect:     { x:80,   y:80,   w:200,  h:140  },
  circle:   { cx:180, cy:180, r:80           },
  triangle: { x1:180, y1:60,  x2:80,  y2:260, x3:280, y3:260 },
  polygon:  { sides:6, cx:180, cy:180, r:100  },
}

// ─── Math ───────────────────────────────────────────────────────────────────

const dist  = (x1,y1,x2,y2) => Math.sqrt((x2-x1)**2+(y2-y1)**2)
const fmt   = n => (+n).toFixed(1)

function angleBetween(ax,ay,vx,vy,bx,by) {
  const dax=ax-vx,day=ay-vy,dbx=bx-vx,dby=by-vy
  const dot=dax*dbx+day*dby
  const mag=Math.sqrt(dax**2+day**2)*Math.sqrt(dbx**2+dby**2)
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

// Ramer-Douglas-Peucker — reduces saved point count without visual change
function rdpFlat(flat,eps=2.5) {
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
  return den<1e-10?dist(x0,y0,x1,y1):num/den
}

// ─── Form ↔ shape point conversions ────────────────────────────────────────

function shapeToForm(shape) {
  const p=shape.points
  switch(shape.type) {
    case 'segment':  return {x1:+fmt(p[0]),y1:+fmt(p[1]),x2:+fmt(p[2]),y2:+fmt(p[3])}
    case 'rect': {
      const w=Math.abs(p[2]-p[0]),h=Math.abs(p[3]-p[1])
      return {x:+fmt(Math.min(p[0],p[2])),y:+fmt(Math.min(p[1],p[3])),w:+fmt(w),h:+fmt(h)}
    }
    case 'circle': {
      const r=dist(p[0],p[1],p[2],p[3])
      return {cx:+fmt(p[0]),cy:+fmt(p[1]),r:+fmt(r)}
    }
    case 'triangle': return {x1:+fmt(p[0]),y1:+fmt(p[1]),x2:+fmt(p[2]),y2:+fmt(p[3]),x3:+fmt(p[4]),y3:+fmt(p[5])}
    case 'polygon': {
      const [gcx,gcy]=centroidOf(p)
      const r=dist(gcx,gcy,p[0],p[1])
      return {sides:p.length/2,cx:+fmt(gcx),cy:+fmt(gcy),r:+fmt(r)}
    }
    default: return {}
  }
}

function formToPoints(type,f) {
  const n=k=>+(f[k]??0)
  switch(type) {
    case 'segment':  return [n('x1'),n('y1'),n('x2'),n('y2')]
    case 'rect':     return [n('x'),n('y'),n('x')+n('w'),n('y')+n('h')]
    case 'circle':   return [n('cx'),n('cy'),n('cx')+n('r'),n('cy')]
    case 'triangle': return [n('x1'),n('y1'),n('x2'),n('y2'),n('x3'),n('y3')]
    case 'polygon': {
      const sides=Math.max(3,Math.round(n('sides')))
      const pts=[]
      for(let i=0;i<sides;i++){
        const a=(i/sides)*Math.PI*2-Math.PI/2
        pts.push(n('cx')+n('r')*Math.cos(a), n('cy')+n('r')*Math.sin(a))
      }
      return pts
    }
    default: return []
  }
}

// Translate all points by dx,dy
function translatePts(pts,dx,dy) {
  return pts.map((v,i)=>i%2===0?v+dx:v+dy)
}

// ─── Storage ────────────────────────────────────────────────────────────────

const load=(k,fb)=>{try{return JSON.parse(localStorage.getItem(k)??'null')??fb}catch{return fb}}
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}

// ─── Geometry Konva components ──────────────────────────────────────────────

const TS={fontSize:11,fontFamily:'monospace',listening:false}

function AngleArc({ax,ay,vx,vy,bx,by,color}) {
  const dax=ax-vx,day=ay-vy,dbx=bx-vx,dby=by-vy
  const cross=dax*dby-day*dbx
  const startDeg=Math.atan2(cross>=0?day:dby,cross>=0?dax:dbx)*180/Math.PI
  const sweep=angleBetween(ax,ay,vx,vy,bx,by)
  return <Arc x={vx} y={vy} innerRadius={0} outerRadius={16}
    rotation={startDeg} angle={sweep} stroke={color} strokeWidth={1} fill={color+'22'} listening={false}/>
}

function ShapeDisplay({shape,selected,darkCanvas,onSelect,onDragEnd,draggable}) {
  const lc=darkCanvas?'#e2e8f0':'#1e293b'
  const sc=selected?'#f97316':shape.color
  const selProps={
    onClick:e=>{e.cancelBubble=true;onSelect(shape.id)},
    onTap:  e=>{e.cancelBubble=true;onSelect(shape.id)},
  }
  const dragProps=draggable?{
    draggable:true,
    onDragEnd:e=>{
      const dx=e.target.x(),dy=e.target.y()
      e.target.x(0);e.target.y(0)
      onDragEnd(shape.id,dx,dy)
    },
    // show selected on drag start too
    onDragStart:e=>{e.cancelBubble=true;onSelect(shape.id)},
  }:{}

  const groupProps={...selProps,...dragProps}

  if(shape.type==='segment') {
    const [x1,y1,x2,y2]=shape.points
    const len=dist(x1,y1,x2,y2)
    return <Group {...groupProps}>
      <Line points={shape.points} stroke={sc} strokeWidth={shape.sw} lineCap="round" hitStrokeWidth={12}/>
      <KonvaCircle x={x1} y={y1} radius={4} fill={sc} listening={false}/>
      <KonvaCircle x={x2} y={y2} radius={4} fill={sc} listening={false}/>
      <KonvaText x={(x1+x2)/2+6} y={(y1+y2)/2-10} text={`${fmt(len)} u`} {...TS} fill={lc}/>
    </Group>
  }

  if(shape.type==='rect') {
    const [x1,y1,x2,y2]=shape.points
    const w=Math.abs(x2-x1),h=Math.abs(y2-y1)
    const rx=Math.min(x1,x2),ry=Math.min(y1,y2)
    const pts=[rx,ry,rx+w,ry,rx+w,ry+h,rx,ry+h]
    return <Group {...groupProps}>
      <Line points={pts} closed stroke={sc} strokeWidth={shape.sw} fill={sc+'1a'}/>
      <KonvaText x={rx+w/2-20} y={ry+h+5}   text={`${fmt(w)} u`}       {...TS} fill={lc}/>
      <KonvaText x={rx+w+5}    y={ry+h/2-6}  text={`${fmt(h)} u`}       {...TS} fill={lc}/>
      <KonvaText x={rx+w/2-34} y={ry+h/2-6}  text={`A≈${fmt(w*h)} u²`} {...TS} fill={lc}/>
    </Group>
  }

  if(shape.type==='circle') {
    const [cx,cy,rx,ry]=shape.points
    const r=dist(cx,cy,rx,ry)
    return <Group {...groupProps}>
      <KonvaCircle x={cx} y={cy} radius={r} stroke={sc} strokeWidth={shape.sw} fill={sc+'1a'}/>
      <Line points={[cx,cy,rx,ry]} stroke={sc} strokeWidth={1} dash={[4,3]} listening={false}/>
      <KonvaCircle x={cx} y={cy} radius={3} fill={sc} listening={false}/>
      <KonvaText x={(cx+rx)/2+4} y={(cy+ry)/2-12} text={`r=${fmt(r)} u`}             {...TS} fill={lc}/>
      <KonvaText x={cx-32}       y={cy+6}          text={`A≈${fmt(Math.PI*r*r)} u²`} {...TS} fill={lc}/>
    </Group>
  }

  if(shape.type==='triangle') {
    const [x1,y1,x2,y2,x3,y3]=shape.points
    const pts=shape.points
    const [gcx,gcy]=centroidOf(pts)
    const verts=[[x1,y1],[x2,y2],[x3,y3]]
    const prev=[[x3,y3],[x1,y1],[x2,y2]]
    const next=[[x2,y2],[x3,y3],[x1,y1]]
    const sides=[dist(x1,y1,x2,y2),dist(x2,y2,x3,y3),dist(x3,y3,x1,y1)]
    const angles=[angleBetween(x3,y3,x1,y1,x2,y2),angleBetween(x1,y1,x2,y2,x3,y3),angleBetween(x2,y2,x3,y3,x1,y1)]
    return <Group {...groupProps}>
      <Line points={pts} closed stroke={sc} strokeWidth={shape.sw} fill={sc+'1a'}/>
      {verts.map(([vx,vy],i)=><AngleArc key={i} ax={prev[i][0]} ay={prev[i][1]} vx={vx} vy={vy} bx={next[i][0]} by={next[i][1]} color={sc}/>)}
      {verts.map(([vx,vy],i)=>{const ox=(gcx-vx)*0.3,oy=(gcy-vy)*0.3;return <KonvaText key={i} x={vx+ox-16} y={vy+oy-7} text={`${fmt(angles[i])}°`} {...TS} fill={lc}/>})}
      {verts.map(([vx,vy],i)=>{const [nx,ny]=next[i];const mx=(vx+nx)/2,my=(vy+ny)/2;const ox=(mx-gcx)*0.2,oy=(my-gcy)*0.2;return <KonvaText key={i} x={mx+ox-16} y={my+oy-7} text={`${fmt(sides[i])} u`} {...TS} fill={lc}/>})}
    </Group>
  }

  if(shape.type==='polygon') {
    const pts=shape.points
    const [gcx,gcy]=centroidOf(pts)
    return <Group {...groupProps}>
      <Line points={pts} closed stroke={sc} strokeWidth={shape.sw} fill={sc+'1a'}/>
      <KonvaText x={gcx-36} y={gcy-8} text={`P=${fmt(perimeterOf(pts))} u`} {...TS} fill={lc}/>
      <KonvaText x={gcx-36} y={gcy+6} text={`A=${fmt(shoelaceArea(pts))} u²`} {...TS} fill={lc}/>
    </Group>
  }

  return null
}

function ShapePreview({inProg,mx,my,color,sw}) {
  if(!inProg||!inProg.points.length) return null
  const pts=inProg.points
  if(inProg.type==='segment')
    return <Line points={[...pts,mx,my]} stroke={color} strokeWidth={sw} dash={[5,4]} lineCap="round" listening={false}/>
  if(inProg.type==='rect')
    return <Line points={[pts[0],pts[1],mx,pts[1],mx,my,pts[0],my]} closed stroke={color} strokeWidth={sw} dash={[5,4]} fill={color+'18'} listening={false}/>
  if(inProg.type==='circle') {
    const r=dist(pts[0],pts[1],mx,my)
    return <KonvaCircle x={pts[0]} y={pts[1]} radius={r} stroke={color} strokeWidth={sw} dash={[5,4]} fill={color+'18'} listening={false}/>
  }
  if(inProg.type==='triangle') {
    const placed=pts.length/2
    if(placed===1) return <Line points={[...pts,mx,my]} stroke={color} strokeWidth={sw} dash={[5,4]} lineCap="round" listening={false}/>
    return <Group>
      <Line points={pts} stroke={color} strokeWidth={sw} lineCap="round" listening={false}/>
      <Line points={[pts[pts.length-2],pts[pts.length-1],mx,my]} stroke={color} strokeWidth={sw} lineCap="round" listening={false}/>
      <Line points={[mx,my,pts[0],pts[1]]} stroke={color} strokeWidth={sw} dash={[5,4]} listening={false}/>
    </Group>
  }
  if(inProg.type==='polygon') {
    const canClose=pts.length>=6&&dist(pts[0],pts[1],mx,my)<SNAP_DIST
    return <Group>
      <Line points={[...pts,mx,my]} stroke={color} strokeWidth={sw} lineCap="round" listening={false}/>
      {canClose&&<KonvaCircle x={pts[0]} y={pts[1]} radius={10} stroke={color} strokeWidth={2} listening={false}/>}
    </Group>
  }
  return null
}

// ─── Grid layer ─────────────────────────────────────────────────────────────

function GridLayer({width, height, step, darkCanvas}) {
  const s = Math.max(5, Math.round(step))
  // How often to draw a labelled (thicker) line — keep labels ≥ 40 px apart
  const labelEvery = s * Math.ceil(40 / s)

  const gridFaint  = darkCanvas ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.28)'
  const gridStrong = darkCanvas ? 'rgba(148,163,184,0.22)' : 'rgba(100,116,139,0.40)'
  const axisC      = darkCanvas ? 'rgba(99,102,241,0.55)'  : 'rgba(99,102,241,0.60)'
  const lblC       = darkCanvas ? '#4b5e72'                : '#94a3b8'
  const oriC       = '#6366f1'

  const elems = []

  // Vertical lines
  for (let x = s; x < width; x += s) {
    const major = x % labelEvery === 0
    elems.push(
      <Line key={`v${x}`} points={[x, 0, x, height]}
        stroke={major ? gridStrong : gridFaint}
        strokeWidth={major ? 1 : 0.5} listening={false} />
    )
    if (major)
      elems.push(<KonvaText key={`vl${x}`} x={x + 2} y={3} text={String(x)}
        fontSize={8} fontFamily="monospace" fill={lblC} listening={false} />)
  }

  // Horizontal lines
  for (let y = s; y < height; y += s) {
    const major = y % labelEvery === 0
    elems.push(
      <Line key={`h${y}`} points={[0, y, width, y]}
        stroke={major ? gridStrong : gridFaint}
        strokeWidth={major ? 1 : 0.5} listening={false} />
    )
    if (major)
      elems.push(<KonvaText key={`hl${y}`} x={3} y={y + 2} text={String(y)}
        fontSize={8} fontFamily="monospace" fill={lblC} listening={false} />)
  }

  // Axis lines along top/left edges
  elems.push(<Line key="ax" points={[0, 0, width, 0]} stroke={axisC} strokeWidth={1} listening={false} />)
  elems.push(<Line key="ay" points={[0, 0, 0, height]} stroke={axisC} strokeWidth={1} listening={false} />)

  // Origin marker
  elems.push(<KonvaCircle key="ori" x={0} y={0} radius={5} fill={oriC} listening={false} />)
  elems.push(<KonvaText key="orilbl" x={7} y={4} text="(0,0)"
    fontSize={8} fontFamily="monospace" fill={oriC} listening={false} />)

  return <Layer listening={false}>{elems}</Layer>
}

// ─── Resize handle ──────────────────────────────────────────────────────────

function ResizeHandle({direction,onResize,darkCanvas}) {
  const drag=useRef(false),start=useRef({})
  const onPD=e=>{e.stopPropagation();e.preventDefault();drag.current=true;start.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)}
  const onPM=e=>{if(!drag.current)return;const dx=e.clientX-start.current.x,dy=e.clientY-start.current.y;start.current={x:e.clientX,y:e.clientY};onResize(direction,dx,dy)}
  const onPU=()=>{drag.current=false}
  const base={position:'absolute',zIndex:10,background:'transparent'}
  const styles={top:{...base,top:0,left:8,right:8,height:8,cursor:'ns-resize'},left:{...base,left:0,top:8,bottom:8,width:8,cursor:'ew-resize'},corner:{...base,top:0,left:0,width:16,height:16,cursor:'nwse-resize'}}
  return (
    <div style={styles[direction]} onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU}>
      {direction==='top'&&<div style={{position:'absolute',top:2,left:'50%',transform:'translateX(-50%)',width:36,height:3,borderRadius:2,background:darkCanvas?'#475569':'#cbd5e1'}}/>}
    </div>
  )
}

// ─── UI micro-components ────────────────────────────────────────────────────

const Div=({c})=><div style={{width:1,height:18,background:c,flexShrink:0,margin:'0 3px'}}/>

function TBtn({children,active,onClick,title,dark}) {
  return <button onClick={onClick} title={title} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 7px',borderRadius:8,border:'none',cursor:'pointer',flexShrink:0,background:active?(dark?'#3b4f6e':'#dbeafe'):'transparent',color:active?'#6366f1':(dark?'#94a3b8':'#64748b'),fontSize:11,fontFamily:'system-ui,sans-serif',whiteSpace:'nowrap'}}>{children}</button>
}
function IBtn({children,onClick,color,title,disabled}) {
  return <button onClick={onClick} title={title} disabled={disabled} style={{display:'flex',alignItems:'center',padding:'5px',borderRadius:8,border:'none',cursor:disabled?'default':'pointer',flexShrink:0,background:'transparent',color,opacity:disabled?0.3:1}}>{children}</button>
}
function Swatch({c,active,onClick}) {
  return <button onClick={onClick} title={c} style={{width:18,height:18,borderRadius:'50%',flexShrink:0,background:c,cursor:'pointer',border:active?'2px solid #6366f1':'1.5px solid rgba(0,0,0,0.18)',outline:active?'2px solid #818cf8':'none',outlineOffset:1}}/>
}

// ─── Shape input panel ──────────────────────────────────────────────────────

function ShapePanel({type, form, setForm, onCreate, onUpdate, selectedId, darkCanvas}) {
  const fields = SHAPE_FIELDS[type] || []
  const tbBg   = darkCanvas ? '#162032' : '#eef2f7'
  const bdr    = darkCanvas ? '#2d3f52' : '#d4dbe6'
  const ic     = darkCanvas ? '#94a3b8' : '#64748b'
  const inputStyle = {
    width:62, padding:'4px 6px', borderRadius:7, border:`1px solid ${bdr}`,
    background:darkCanvas?'#1e293b':'#fff', color:darkCanvas?'#e2e8f0':'#1e293b',
    fontSize:12, fontFamily:'monospace', outline:'none',
  }
  const btnStyle=(accent)=>({
    padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer',
    background:accent, color:'#fff', fontSize:11, fontWeight:600, flexShrink:0,
  })

  return (
    <div style={{background:tbBg,borderBottom:`1px solid ${bdr}`,padding:'7px 12px',display:'flex',flexWrap:'wrap',gap:8,alignItems:'flex-end',flexShrink:0}}>
      {fields.map(([key,label])=>(
        <label key={key} style={{display:'flex',flexDirection:'column',gap:3}}>
          <span style={{fontSize:9,textTransform:'uppercase',letterSpacing:'0.07em',color:ic,fontFamily:'system-ui'}}>{label}</span>
          <input
            type="number"
            value={form[key]??''}
            onChange={e=>setForm(prev=>({...prev,[key]:e.target.value}))}
            style={inputStyle}
          />
        </label>
      ))}
      <div style={{display:'flex',gap:6,alignItems:'flex-end',paddingBottom:1}}>
        <button style={btnStyle('#6366f1')} onClick={onCreate}>+ Create</button>
        {selectedId&&<button style={btnStyle('#22c55e')} onClick={onUpdate}>✓ Update</button>}
      </div>
    </div>
  )
}

// ─── Main ScratchPad ────────────────────────────────────────────────────────

export default function ScratchPad({isOpen,onClose}) {
  // ── draw state
  const [lines,    setLines]    = useState(()=>load(LINES_KEY,[]))
  const [tool,     setTool]     = useState('brush')
  const [color,    setColor]    = useState('#6366f1')
  const [sw,       setSw]       = useState(4)

  // ── geo state
  const [mode,       setMode]       = useState('draw')
  const [geoTool,    setGeoTool]    = useState('segment')
  const [shapes,     setShapes]     = useState(()=>load(SHAPES_KEY,[]))
  const [inProg,     setInProg]     = useState(null)
  const [mousePos,   setMousePos]   = useState({x:0,y:0})
  const [selectedId, setSelectedId] = useState(null)

  // ── shape input panel
  const [form, setForm] = useState(DEFAULTS.segment)

  // ── shared
  const [darkCanvas,setDarkCanvas]=useState(()=>document.documentElement.classList.contains('dark'))

  // ── grid
  const savedGrid=load(GRID_KEY,{show:false,step:50,snap:false})
  const [showGrid,   setShowGrid]   = useState(savedGrid.show)
  const [gridStep,   setGridStep]   = useState(savedGrid.step)
  const [snapToGrid, setSnapToGrid] = useState(savedGrid.snap)

  const saved=load(SIZE_KEY,null)
  const [panelW,setPanelW]=useState(saved?.w??DEFAULT_W)
  const [panelH,setPanelH]=useState(saved?.h??DEFAULT_H)

  const isDrawing   = useRef(false)
  const stageRef    = useRef(null)
  const containerRef= useRef(null)
  const [canvasSize,setCanvasSize]=useState({w:0,h:0})
  const [isMobile,  setIsMobile]  =useState(()=>window.innerWidth<640)

  useEffect(()=>{
    const chk=()=>setIsMobile(window.innerWidth<640)
    window.addEventListener('resize',chk)
    return()=>window.removeEventListener('resize',chk)
  },[])

  useEffect(()=>{
    if(!isOpen) return
    const measure=()=>{if(containerRef.current)setCanvasSize({w:containerRef.current.offsetWidth,h:containerRef.current.offsetHeight})}
    measure()
    const ro=new ResizeObserver(measure)
    if(containerRef.current) ro.observe(containerRef.current)
    return()=>ro.disconnect()
  },[isOpen,panelW,panelH,isMobile])

  useEffect(()=>{save(LINES_KEY,lines)},[lines])
  useEffect(()=>{save(SHAPES_KEY,shapes)},[shapes])
  useEffect(()=>{if(!isMobile)save(SIZE_KEY,{w:panelW,h:panelH})},[panelW,panelH,isMobile])
  useEffect(()=>{save(GRID_KEY,{show:showGrid,step:gridStep,snap:snapToGrid})},[showGrid,gridStep,snapToGrid])

  // Sync form ↔ selected shape
  useEffect(()=>{
    if(!selectedId) { setForm(DEFAULTS[geoTool]??{}); return }
    const s=shapes.find(s=>s.id===selectedId)
    if(s) setForm(shapeToForm(s))
    else  setSelectedId(null)
  },[selectedId]) // eslint-disable-line

  // When geo tool changes with nothing selected, reset form defaults
  useEffect(()=>{
    if(!selectedId) setForm(DEFAULTS[geoTool]??{})
  },[geoTool]) // eslint-disable-line

  // Keyboard
  useEffect(()=>{
    if(!isOpen) return
    const h=e=>{
      if(['Delete','Backspace'].includes(e.key)&&selectedId&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){
        setShapes(prev=>prev.filter(s=>s.id!==selectedId))
        setSelectedId(null)
      }
      if(e.key==='Escape') { setInProg(null); setSelectedId(null) }
    }
    window.addEventListener('keydown',h)
    return()=>window.removeEventListener('keydown',h)
  },[isOpen,selectedId])

  const handleResize=useCallback((dir,dx,dy)=>{
    if(dir==='top'||dir==='corner') setPanelH(h=>Math.max(MIN_H,Math.min(h-dy,window.innerHeight-80)))
    if(dir==='left'||dir==='corner') setPanelW(w=>Math.max(MIN_W,Math.min(w-dx,window.innerWidth-24)))
  },[])

  // ── Freehand
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
    setLines(prev=>{
      if(!prev.length) return prev
      const upd=[...prev]
      const last={...upd[upd.length-1]}
      last.points=rdpFlat(last.points)
      upd[upd.length-1]=last
      return upd
    })
  },[mode])

  // ── Geo click (point placement)
  const addShape=useCallback(shape=>{
    setShapes(prev=>[...prev,{...shape,id:Date.now()+Math.random()}])
  },[])

  // Snap a raw canvas position to the nearest grid intersection when snap is on
  const snapPt = useCallback((x, y) => {
    if (!snapToGrid || gridStep < 1) return { x, y }
    const s = gridStep
    return { x: Math.round(x / s) * s, y: Math.round(y / s) * s }
  }, [snapToGrid, gridStep])

  const handleGeoClick=useCallback(e=>{
    if(mode!=='geo') return
    if(e.target!==e.target.getStage()) return
    if(geoTool==='select') { setSelectedId(null); return }
    const raw=getPos(e)
    const {x,y}=snapPt(raw.x,raw.y)
    const NEEDS={segment:2,rect:2,circle:2,triangle:3}
    if(!inProg) { setInProg({type:geoTool,points:[x,y],color,sw}); return }
    const newPts=[...inProg.points,x,y]
    const nPts=newPts.length/2
    if(geoTool==='polygon') {
      if(nPts>=3&&dist(newPts[0],newPts[1],x,y)<SNAP_DIST) { addShape({...inProg}); setInProg(null) }
      else setInProg({...inProg,points:newPts})
      return
    }
    if(nPts>=NEEDS[geoTool]) { addShape({...inProg,points:newPts}); setInProg(null) }
    else setInProg({...inProg,points:newPts})
  },[mode,geoTool,inProg,color,sw,addShape,snapPt])

  const finishPolygon=()=>{
    if(inProg?.type==='polygon'&&inProg.points.length>=6){ addShape(inProg); setInProg(null) }
  }

  // ── Shape drag
  const handleShapeDragEnd=useCallback((id,dx,dy)=>{
    setShapes(prev=>prev.map(s=>{
      if(s.id!==id) return s
      let pts=translatePts(s.points,dx,dy)
      // snap: translate anchor by a snapped delta, keep all other points offset-consistent
      if(snapToGrid && gridStep>=1) {
        const sx=Math.round(pts[0]/gridStep)*gridStep - pts[0]
        const sy=Math.round(pts[1]/gridStep)*gridStep - pts[1]
        pts=pts.map((v,i)=>i%2===0?v+sx:v+sy)
      }
      const updated={...s,points:pts}
      if(id===selectedId) setForm(shapeToForm(updated))
      return updated
    }))
  },[selectedId,snapToGrid,gridStep])

  // ── Shape panel create / update
  const handleCreate=()=>{
    const activeType=selectedId ? shapes.find(s=>s.id===selectedId)?.type??geoTool : geoTool
    const pts=formToPoints(activeType,form)
    if(!pts.length) return
    addShape({type:activeType,points:pts,color,sw})
  }

  const handleUpdate=()=>{
    if(!selectedId) return
    const shape=shapes.find(s=>s.id===selectedId)
    if(!shape) return
    const pts=formToPoints(shape.type,form)
    if(!pts.length) return
    setShapes(prev=>prev.map(s=>s.id===selectedId?{...s,points:pts}:s))
  }

  // ── Undo / clear
  const undo=()=>{
    if(inProg){setInProg(null);return}
    if(mode==='geo') setShapes(prev=>prev.slice(0,-1))
    else             setLines(prev=>prev.slice(0,-1))
  }
  const clear=()=>{ setLines([]); setShapes([]); setInProg(null); setSelectedId(null) }

  const pickColor=c=>{ setColor(c); if(mode==='draw') setTool('brush') }
  const brushActive=mode==='draw'&&tool==='brush'
  const canUndo=!!(inProg||(mode==='geo'?shapes.length:lines.length))
  const canClear=!!(lines.length||shapes.length)

  const bg=darkCanvas?'#0f172a':'#f8fafc'
  const tbBg=darkCanvas?'#1e293b':'#f1f5f9'
  const bdr=darkCanvas?'#334155':'#e2e8f0'
  const ic=darkCanvas?'#94a3b8':'#64748b'

  // Derived
  const isDraggable=mode==='geo'&&geoTool==='select'

  // Shared step input style
  const stepInputStyle={
    width:44,padding:'3px 5px',borderRadius:6,
    border:`1px solid ${bdr}`,
    background:darkCanvas?'#0f172a':'#fff',
    color:darkCanvas?'#e2e8f0':'#1e293b',
    fontSize:11,fontFamily:'monospace',outline:'none',
  }

  // Grid controls — reused in both mobile and desktop toolbars
  const gridControls = <>
    <IBtn onClick={()=>setShowGrid(v=>!v)} color={showGrid?'#6366f1':ic} title="Toggle grid (G)">
      <Grid3x3 size={15}/>
    </IBtn>
    {showGrid&&<>
      <input type="number" value={gridStep} min={5} max={500} step={5}
        title="Grid step (px)"
        onChange={e=>setGridStep(Math.max(5,Math.min(500,+e.target.value||50)))}
        onKeyDown={e=>e.stopPropagation()}
        style={stepInputStyle}
      />
      <IBtn onClick={()=>setSnapToGrid(v=>!v)} color={snapToGrid?'#22c55e':ic} title="Snap to grid">
        <Magnet size={15}/>
      </IBtn>
    </>}
  </>
  const showFinish=mode==='geo'&&inProg?.type==='polygon'&&inProg.points.length>=6
  const activeFormType=selectedId?shapes.find(s=>s.id===selectedId)?.type??geoTool:geoTool

  if(!isOpen) return null

  const mobileStyle={position:'fixed',bottom:0,left:0,right:0,height:Math.max(MIN_H,Math.min(panelH,window.innerHeight-60)),zIndex:120,display:'flex',flexDirection:'column',borderRadius:'16px 16px 0 0',overflow:'hidden',boxShadow:'0 -8px 40px rgba(0,0,0,0.3)',borderTop:`1px solid ${bdr}`,background:darkCanvas?'#1e293b':'#fff'}
  const desktopStyle={position:'fixed',bottom:'1rem',right:'1rem',width:panelW,height:panelH,zIndex:120,display:'flex',flexDirection:'column',borderRadius:16,overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.22)',border:`1px solid ${bdr}`,background:darkCanvas?'#1e293b':'#fff'}
  const rowStyle={display:'flex',alignItems:'center',gap:4,padding:'5px 10px',background:tbBg,flexShrink:0,overflowX:'auto',overflowY:'hidden',scrollbarWidth:'none',msOverflowStyle:'none',WebkitOverflowScrolling:'touch',userSelect:'none'}

  return (
    <div style={isMobile?mobileStyle:desktopStyle}>

      {/* Resize handles */}
      {!isMobile&&<><ResizeHandle direction="top" onResize={handleResize} darkCanvas={darkCanvas}/><ResizeHandle direction="left" onResize={handleResize} darkCanvas={darkCanvas}/><ResizeHandle direction="corner" onResize={handleResize} darkCanvas={darkCanvas}/></>}
      {isMobile&&<ResizeHandle direction="top" onResize={handleResize} darkCanvas={darkCanvas}/>}

      {/* ══ MOBILE TOOLBAR ══ */}
      {isMobile ? <>
        {/* Row 1: mode + actions + close */}
        <div style={{...rowStyle,paddingTop:14,borderBottom:`1px solid ${bdr}`,gap:5}}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:ic,flexShrink:0}}>Scratch</span>
          <Div c={bdr}/>
          <TBtn active={mode==='draw'} onClick={()=>setMode('draw')} dark={darkCanvas}>Draw</TBtn>
          <TBtn active={mode==='geo'}  onClick={()=>setMode('geo')}  dark={darkCanvas}>Geo</TBtn>
          <div style={{flex:1}}/>
          {mode==='draw'&&<>
            <IBtn onClick={()=>setSw(w=>Math.max(1,w-2))} color={ic}><Minus size={13}/></IBtn>
            <div style={{width:Math.max(6,sw)+4,height:Math.max(6,sw)+4,borderRadius:'50%',background:tool==='eraser'?(darkCanvas?'#475569':'#cbd5e1'):color,border:`1.5px solid ${bdr}`,flexShrink:0}}/>
            <IBtn onClick={()=>setSw(w=>Math.min(32,w+2))} color={ic}><Plus size={13}/></IBtn>
            <Div c={bdr}/>
          </>}
          <IBtn onClick={()=>setDarkCanvas(d=>!d)} color={ic}>{darkCanvas?<Sun size={15}/>:<Moon size={15}/>}</IBtn>
          <Div c={bdr}/>
          {gridControls}
          <Div c={bdr}/>
          <IBtn onClick={undo}  color={ic}      disabled={!canUndo}><Undo2 size={15}/></IBtn>
          <IBtn onClick={clear} color="#ef4444" disabled={!canClear}><Trash2 size={15}/></IBtn>
          <Div c={bdr}/>
          <IBtn onClick={onClose} color={ic}><X size={16}/></IBtn>
        </div>
        {/* Row 2: tools */}
        <div style={{...rowStyle,borderBottom:`1px solid ${bdr}`}}>
          {mode==='draw'?<>
            <TBtn active={tool==='brush'}  onClick={()=>setTool('brush')}  dark={darkCanvas}><Pencil size={14}/> Brush</TBtn>
            <TBtn active={tool==='eraser'} onClick={()=>setTool('eraser')} dark={darkCanvas}><Eraser size={14}/> Erase</TBtn>
          </>:<>
            {GEO_TOOLS.map(({id,label,Icon})=><TBtn key={id} active={geoTool===id} onClick={()=>{setGeoTool(id);setInProg(null);setSelectedId(null)}} dark={darkCanvas}><Icon size={13}/> {label}</TBtn>)}
            {showFinish&&<TBtn active={false} onClick={finishPolygon} dark={darkCanvas}><Check size={13}/> Finish</TBtn>}
          </>}
        </div>
        {/* Row 3: color grid (4 cols) */}
        <div style={{background:tbBg,borderBottom:`1px solid ${bdr}`,padding:'8px 12px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,justifyItems:'center',flexShrink:0}}>
          {PALETTE.map(c=><Swatch key={c} c={c} active={brushActive&&color===c} onClick={()=>pickColor(c)}/>)}
        </div>
      </>

      /* ══ DESKTOP TOOLBAR ══ */
      :<div style={{...rowStyle,borderBottom:`1px solid ${bdr}`,paddingTop:10}}>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:ic,flexShrink:0,marginRight:2}}>Scratch</span>
        <Div c={bdr}/>
        <TBtn active={mode==='draw'} onClick={()=>setMode('draw')} dark={darkCanvas}><Pencil size={13}/> Draw</TBtn>
        <TBtn active={mode==='geo'}  onClick={()=>setMode('geo')}  dark={darkCanvas}><Triangle size={13}/> Geo</TBtn>
        <Div c={bdr}/>
        {mode==='draw'?<>
          <TBtn active={tool==='brush'}  onClick={()=>setTool('brush')}  dark={darkCanvas}><Pencil size={13}/></TBtn>
          <TBtn active={tool==='eraser'} onClick={()=>setTool('eraser')} dark={darkCanvas}><Eraser size={13}/></TBtn>
          <Div c={bdr}/>
          <IBtn onClick={()=>setSw(w=>Math.max(1,w-2))} color={ic}><Minus size={12}/></IBtn>
          <div style={{width:Math.max(6,sw)+6,height:Math.max(6,sw)+6,borderRadius:'50%',background:tool==='eraser'?(darkCanvas?'#475569':'#cbd5e1'):color,border:`1.5px solid ${bdr}`,flexShrink:0}}/>
          <IBtn onClick={()=>setSw(w=>Math.min(32,w+2))} color={ic}><Plus size={12}/></IBtn>
        </>:<>
          {GEO_TOOLS.map(({id,label,Icon})=><TBtn key={id} active={geoTool===id} onClick={()=>{setGeoTool(id);setInProg(null);setSelectedId(null)}} dark={darkCanvas}><Icon size={13}/> <span style={{fontSize:10}}>{label}</span></TBtn>)}
          {showFinish&&<TBtn active={false} onClick={finishPolygon} dark={darkCanvas}><Check size={13}/> <span style={{fontSize:10}}>Finish</span></TBtn>}
        </>}
        <Div c={bdr}/>
        <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
          {PALETTE.map(c=><Swatch key={c} c={c} active={brushActive&&color===c} onClick={()=>pickColor(c)}/>)}
        </div>
        <div style={{flex:1}}/>
        {gridControls}
        <Div c={bdr}/>
        <IBtn onClick={()=>setDarkCanvas(d=>!d)} color={ic}>{darkCanvas?<Sun size={15}/>:<Moon size={15}/>}</IBtn>
        <Div c={bdr}/>
        <IBtn onClick={undo}  color={ic}      disabled={!canUndo}><Undo2 size={15}/></IBtn>
        <IBtn onClick={clear} color="#ef4444" disabled={!canClear}><Trash2 size={15}/></IBtn>
        <Div c={bdr}/>
        <IBtn onClick={onClose} color={ic}><X size={15}/></IBtn>
      </div>}

      {/* ══ SHAPE INPUT PANEL (geo mode only) ══ */}
      {mode==='geo'&&(
        <ShapePanel
          type={activeFormType}
          form={form}
          setForm={setForm}
          onCreate={handleCreate}
          onUpdate={selectedId?handleUpdate:null}
          selectedId={selectedId}
          darkCanvas={darkCanvas}
        />
      )}

      {/* ══ CANVAS ══ */}
      <div ref={containerRef} style={{flex:1,overflow:'hidden',background:bg,cursor:isDraggable?'grab':mode==='draw'?tool==='eraser'?'cell':'crosshair':'crosshair',touchAction:'none'}}>
        {canvasSize.w>0&&(
          <Stage ref={stageRef} width={canvasSize.w} height={canvasSize.h}
            onMouseDown={handleDrawDown} onMousemove={handleDrawMove} onMouseup={handleDrawUp}
            onTouchStart={handleDrawDown} onTouchMove={handleDrawMove} onTouchEnd={handleDrawUp}
            onClick={handleGeoClick} onTap={handleGeoClick}
          >
            {/* Layer 0: grid */}
            {showGrid&&<GridLayer width={canvasSize.w} height={canvasSize.h} step={gridStep} darkCanvas={darkCanvas}/>}
            {/* Layer 1: freehand (eraser uses destination-out on this canvas) */}
            <Layer>
              {lines.map((line,i)=>(
                <Line key={i} points={line.points}
                  stroke={line.tool==='eraser'?bg:line.color}
                  strokeWidth={line.sw} tension={0.4} lineCap="round" lineJoin="round"
                  globalCompositeOperation={line.tool==='eraser'?'destination-out':'source-over'}
                />
              ))}
            </Layer>
            {/* Layer 2: geometry shapes + preview */}
            <Layer>
              {shapes.map(shape=>(
                <ShapeDisplay key={shape.id} shape={shape}
                  selected={shape.id===selectedId}
                  darkCanvas={darkCanvas}
                  draggable={isDraggable}
                  onSelect={id=>setSelectedId(prev=>prev===id?null:id)}
                  onDragEnd={handleShapeDragEnd}
                />
              ))}
              <ShapePreview inProg={inProg} mx={mousePos.x} my={mousePos.y} color={color} sw={sw}/>
              {inProg?.points&&Array.from({length:inProg.points.length/2},(_,i)=>(
                <KonvaCircle key={i} x={inProg.points[i*2]} y={inProg.points[i*2+1]} radius={4} fill={color} listening={false}/>
              ))}
            </Layer>
          </Stage>
        )}
      </div>

      {/* ══ SELECTED SHAPE INFO BAR ══ */}
      {selectedId&&(
        <div style={{padding:'4px 12px',background:tbBg,borderTop:`1px solid ${bdr}`,display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <span style={{fontSize:11,color:'#f97316',fontWeight:600}}>
            {shapes.find(s=>s.id===selectedId)?.type}
          </span>
          <span style={{fontSize:11,color:ic,opacity:0.7}}>selected — drag to move · edit fields above · Delete to remove</span>
          <div style={{flex:1}}/>
          <IBtn onClick={()=>{setShapes(prev=>prev.filter(s=>s.id!==selectedId));setSelectedId(null)}} color="#ef4444"><Trash2 size={13}/></IBtn>
        </div>
      )}
    </div>
  )
}
