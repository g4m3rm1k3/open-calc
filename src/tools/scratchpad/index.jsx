import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Stage, Layer, Line, Circle as KonvaCircle, Ellipse as KonvaEllipse, Arc, Text as KonvaText, Group } from 'react-konva'
import Editor from '@monaco-editor/react'
import {
  X, Trash2, Undo2, Pencil, Eraser, Sun, Moon, Minus, Plus,
  Check, MousePointer2, Triangle, Square, Circle, Hexagon,
  Grid3x3, Magnet, Crosshair, Ruler, PenLine, FolderOpen, Save, Download, FileCode2,
  Maximize2, Minimize2,
} from 'lucide-react'
import { buildSvgDocument, parseSvgToShapes } from './shapesToSvg.js'

const DEV_FS_API = '/api/dev-fs'
const DEFAULT_DIAGRAMS_DIR = 'src/courses/geometry/diagrams'

export const meta = {
  label: 'Scratchpad',
  group: 'engine',
  order: 10,
  icon: PenLine,
  colorClass: 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30',
  eventTool: 'scratchpad',
}

// ─── Constants ─────────────────────────────────────────────────────────────

const PALETTE = [
  '#ef4444','#f97316','#facc15','#22c55e',
  '#06b6d4','#6366f1','#a855f7','#ec4899',
  '#ffffff','#94a3b8','#1e293b',
]
const LINES_KEY  = 'oc-pad-lines'
const SHAPES_KEY = 'oc-pad-shapes'
const SELECTED_SHAPE_KEY = 'oc-pad-selected-shape-id'
const SIZE_KEY   = 'oc-pad-size'
const GRID_KEY   = 'oc-pad-grid'
// Bumped from the old quick-doodle defaults (680x520) — Scratchpad now also
// has to fit a file bar, shape panel, and an optional code pane, none of
// which existed when those numbers were picked.
const MIN_W = 300, MIN_H = 220, DEFAULT_W = 960, DEFAULT_H = 680
const SNAP_DIST = 14
const SNAP_MARGIN = 80

const GEO_TOOLS = [
  { id:'select',   label:'Select',   Icon:MousePointer2 },
  { id:'segment',  label:'Segment',  Icon:()=><span style={{fontSize:13,lineHeight:1}}>╱</span> },
  { id:'rect',     label:'Rect',     Icon:Square },
  { id:'circle',   label:'Circle',   Icon:Circle },
  { id:'ellipse',  label:'Ellipse',  Icon:()=><span style={{fontSize:13,lineHeight:1}}>⬭</span> },
  { id:'triangle', label:'Triangle', Icon:Triangle },
  { id:'polygon',  label:'Polygon',  Icon:Hexagon },
  { id:'sine',     label:'Sine',     Icon:()=><span style={{fontSize:13,lineHeight:1}}>∿</span> },
  { id:'text',     label:'Text',     Icon:()=><span style={{fontSize:13,lineHeight:1,fontWeight:700}}>T</span> },
]

// Fields shown in the shape panel per type
const SHAPE_FIELDS = {
  segment:  [['x1','X1'],['y1','Y1'],['x2','X2'],['y2','Y2']],
  rect:     [['x','X'],['y','Y'],['w','W'],['h','H']],
  circle:   [['cx','CX'],['cy','CY'],['r','R']],
  ellipse:  [['cx','CX'],['cy','CY'],['rx','RX'],['ry','RY']],
  triangle: [['x1','X1'],['y1','Y1'],['x2','X2'],['y2','Y2'],['x3','X3'],['y3','Y3']],
  polygon:  [['sides','N'],['cx','CX'],['cy','CY'],['r','R']],
  sine:     [['x','X'],['y','Y'],['w','W'],['h','Height'],['cycles','Cycles']],
  text:     [['x','X'],['y','Y'],['fontSize','Size'],['rotation','Rotate °']],
}

const DEFAULTS = {
  segment:  { x1:80,  y1:160, x2:280, y2:160 },
  rect:     { x:80,   y:80,   w:200,  h:140  },
  circle:   { cx:180, cy:180, r:80           },
  ellipse:  { cx:180, cy:180, rx:100, ry:50  },
  triangle: { x1:180, y1:60,  x2:80,  y2:260, x3:280, y3:260 },
  polygon:  { sides:6, cx:180, cy:180, r:100  },
  sine:     { x:80,   y:140,  w:240,  h:80,    cycles:2 },
  text:     { x:140,  y:140,  fontSize:18, rotation:0 },
}

// Sample a sine curve into a flat [x0,y0,x1,y1,...] point array — used for
// both rendering (ShapeDisplay) and live preview (ShapePreview). Baseline
// runs along the vertical center of the bounding box; amplitude = h/2.
function sampleSine(x, y, w, h, cycles, steps = 48) {
  const baseline = y + h / 2
  const amp = h / 2
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    pts.push(x + t * w, baseline - amp * Math.sin(2 * Math.PI * cycles * t))
  }
  return pts
}

// ─── Math ───────────────────────────────────────────────────────────────────

const dist  = (x1,y1,x2,y2) => Math.sqrt((x2-x1)**2+(y2-y1)**2)
// Parses an SVG viewBox string ("x y w h") into {x,y,w,h}, or null if malformed.
function parseViewBoxStr(s) {
  const p=(s||'').trim().split(/\s+/).map(Number)
  if(p.length!==4||p.some(Number.isNaN)) return null
  return {x:p[0],y:p[1],w:p[2],h:p[3]}
}
const fmt   = n => (+n).toFixed(1)

// Ported from the old SvgEditor.jsx (retired this session): updates/adds a
// translate() on an element's transform attribute, preserving any other
// transform functions already on it. This is what lets passthrough SVG
// elements — curved paths, <g> groups, anything the shape model can't fully
// parse — still be moved as a whole, without needing to understand their
// internal structure at all.
function applyTranslate(el, dx, dy) {
  const existing = el.getAttribute('transform') || ''
  const m = existing.match(/translate\(\s*([^,)]+)(?:,\s*([^)]+))?\)/)
  let baseDx = 0, baseDy = 0
  if (m) { baseDx = parseFloat(m[1]) || 0; baseDy = parseFloat(m[2] ?? '0') || 0 }
  const other = existing.replace(/translate\([^)]*\)/g, '').trim()
  const newTranslate = `translate(${(baseDx + dx).toFixed(1)},${(baseDy + dy).toFixed(1)})`
  el.setAttribute('transform', other ? `${newTranslate} ${other}` : newTranslate)
}

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
    case 'sine': {
      const w=Math.abs(p[2]-p[0]),h=Math.abs(p[3]-p[1])
      return {x:+fmt(Math.min(p[0],p[2])),y:+fmt(Math.min(p[1],p[3])),w:+fmt(w),h:+fmt(h),cycles:shape.cycles??2}
    }
    case 'circle': {
      const r=dist(p[0],p[1],p[2],p[3])
      return {cx:+fmt(p[0]),cy:+fmt(p[1]),r:+fmt(r)}
    }
    case 'ellipse': {
      const rx=Math.abs(p[2]-p[0])/2,ry=Math.abs(p[3]-p[1])/2
      return {cx:+fmt((p[0]+p[2])/2),cy:+fmt((p[1]+p[3])/2),rx:+fmt(rx),ry:+fmt(ry)}
    }
    case 'text': return {x:+fmt(p[0]),y:+fmt(p[1]),fontSize:shape.fontSize??18}
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
    case 'sine':     return [n('x'),n('y'),n('x')+n('w'),n('y')+n('h')]
    case 'circle':   return [n('cx'),n('cy'),n('cx')+n('r'),n('cy')]
    case 'ellipse':  return [n('cx')-n('rx'),n('cy')-n('ry'),n('cx')+n('rx'),n('cy')+n('ry')]
    case 'text':     return [n('x'),n('y')]
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

// ─── OSNAP — object snap ────────────────────────────────────────────────────

const OSNAP_THRESH = 18

/** Precompute all discrete snap points for a shape set */
function getSnapPoints(shapes) {
  const pts = []
  for (const s of shapes) {
    const p = s.points
    if (s.type === 'segment') {
      pts.push({x:p[0],y:p[1],type:'endpoint',sid:s.id})
      pts.push({x:p[2],y:p[3],type:'endpoint',sid:s.id})
      pts.push({x:(p[0]+p[2])/2,y:(p[1]+p[3])/2,type:'midpoint',sid:s.id})
    } else if (s.type === 'rect') {
      const rx=Math.min(p[0],p[2]),ry=Math.min(p[1],p[3])
      const rw=Math.abs(p[2]-p[0]),rh=Math.abs(p[3]-p[1])
      pts.push({x:rx,     y:ry,      type:'endpoint',sid:s.id})
      pts.push({x:rx+rw,  y:ry,      type:'endpoint',sid:s.id})
      pts.push({x:rx+rw,  y:ry+rh,   type:'endpoint',sid:s.id})
      pts.push({x:rx,     y:ry+rh,   type:'endpoint',sid:s.id})
      pts.push({x:rx+rw/2,y:ry,      type:'midpoint',sid:s.id})
      pts.push({x:rx+rw,  y:ry+rh/2, type:'midpoint',sid:s.id})
      pts.push({x:rx+rw/2,y:ry+rh,   type:'midpoint',sid:s.id})
      pts.push({x:rx,     y:ry+rh/2, type:'midpoint',sid:s.id})
      pts.push({x:rx+rw/2,y:ry+rh/2, type:'center',  sid:s.id})
    } else if (s.type === 'circle') {
      const [cx,cy,rx,ry]=p, r=dist(cx,cy,rx,ry)
      pts.push({x:cx,   y:cy,   type:'center',   sid:s.id})
      pts.push({x:cx+r, y:cy,   type:'quadrant', sid:s.id})
      pts.push({x:cx-r, y:cy,   type:'quadrant', sid:s.id})
      pts.push({x:cx,   y:cy+r, type:'quadrant', sid:s.id})
      pts.push({x:cx,   y:cy-r, type:'quadrant', sid:s.id})
    } else if (s.type === 'ellipse') {
      const ecx=(p[0]+p[2])/2,ecy=(p[1]+p[3])/2
      const erx=Math.abs(p[2]-p[0])/2,ery=Math.abs(p[3]-p[1])/2
      pts.push({x:ecx,    y:ecy,    type:'center',   sid:s.id})
      pts.push({x:ecx+erx,y:ecy,    type:'quadrant', sid:s.id})
      pts.push({x:ecx-erx,y:ecy,    type:'quadrant', sid:s.id})
      pts.push({x:ecx,    y:ecy+ery,type:'quadrant', sid:s.id})
      pts.push({x:ecx,    y:ecy-ery,type:'quadrant', sid:s.id})
    } else if (s.type==='triangle'||s.type==='polygon') {
      const n=p.length/2
      for(let i=0;i<n;i++){
        pts.push({x:p[i*2],y:p[i*2+1],type:'endpoint',sid:s.id})
        const j=(i+1)%n
        pts.push({x:(p[i*2]+p[j*2])/2,y:(p[i*2+1]+p[j*2+1])/2,type:'midpoint',sid:s.id})
      }
      const [gcx,gcy]=centroidOf(p)
      pts.push({x:gcx,y:gcy,type:'center',sid:s.id})
    } else if (s.type === 'sine') {
      const rx=Math.min(p[0],p[2]),ry=Math.min(p[1],p[3])
      const rw=Math.abs(p[2]-p[0]),rh=Math.abs(p[3]-p[1])
      pts.push({x:rx,        y:ry+rh/2, type:'endpoint',sid:s.id})
      pts.push({x:rx+rw,     y:ry+rh/2, type:'endpoint',sid:s.id})
      pts.push({x:rx+rw/2,   y:ry+rh/2, type:'center',  sid:s.id})
    } else if (s.type === 'text') {
      pts.push({x:p[0],y:p[1],type:'endpoint',sid:s.id})
    }
  }
  return pts
}

/** Find nearest snap — checks precomputed points + nearest-on-circle circumference */
function findNearestSnap(mx, my, snapPts, shapes, thresh=OSNAP_THRESH) {
  let best=null, bd=thresh
  for(const pt of snapPts){
    const d=dist(pt.x,pt.y,mx,my)
    if(d<bd){bd=d;best=pt}
  }
  // nearest on circle circumference (tangent snap)
  for(const s of shapes){
    if(s.type!=='circle') continue
    const [cx,cy,rx,ry]=s.points, r=dist(cx,cy,rx,ry)
    const dEdge=Math.abs(dist(mx,my,cx,cy)-r)
    if(dEdge<bd){
      const a=Math.atan2(my-cy,mx-cx)
      bd=dEdge
      best={x:cx+r*Math.cos(a),y:cy+r*Math.sin(a),type:'tangent',sid:s.id}
    }
  }
  return best
}

/** Draggable handles for a selected shape's vertices */
function getHandles(shape) {
  const p=shape.points
  switch(shape.type){
    case 'segment':
      return [
        {x:p[0],y:p[1],fn:(nx,ny)=>{const n=[...p];n[0]=nx;n[1]=ny;return n}},
        {x:p[2],y:p[3],fn:(nx,ny)=>{const n=[...p];n[2]=nx;n[3]=ny;return n}},
      ]
    case 'rect':{
      const rx=Math.min(p[0],p[2]),ry=Math.min(p[1],p[3])
      const rw=Math.abs(p[2]-p[0]),rh=Math.abs(p[3]-p[1])
      return [
        {x:rx,    y:ry,    fn:(nx,ny)=>[nx,ny,rx+rw,ry+rh]},
        {x:rx+rw, y:ry,    fn:(nx,ny)=>[rx,ny,nx,ry+rh]},
        {x:rx+rw, y:ry+rh, fn:(nx,ny)=>[rx,ry,nx,ny]},
        {x:rx,    y:ry+rh, fn:(nx,ny)=>[nx,ry,rx+rw,ny]},
      ]}
    case 'circle':{
      const [cx,cy,rx,ry]=p, r=dist(cx,cy,rx,ry), dx=rx-cx, dy=ry-cy
      return [
        {x:cx,  y:cy,   fn:(nx,ny)=>[nx,ny,nx+dx,ny+dy]},
        {x:cx+r,y:cy,   fn:(nx,ny)=>{const nr=dist(cx,cy,nx,ny);return [cx,cy,cx+nr,cy]}},
        {x:cx-r,y:cy,   fn:(nx,ny)=>{const nr=dist(cx,cy,nx,ny);return [cx,cy,cx+nr,cy]}},
        {x:cx,  y:cy+r, fn:(nx,ny)=>{const nr=dist(cx,cy,nx,ny);return [cx,cy,cx+nr,cy]}},
        {x:cx,  y:cy-r, fn:(nx,ny)=>{const nr=dist(cx,cy,nx,ny);return [cx,cy,cx+nr,cy]}},
      ]}
    case 'triangle':
    case 'polygon':{
      const n=p.length/2
      return Array.from({length:n},(_,i)=>({
        x:p[i*2],y:p[i*2+1],
        fn:(nx,ny)=>{const q=[...p];q[i*2]=nx;q[i*2+1]=ny;return q}
      }))}
    case 'ellipse':{
      // Bounding-box handles, same shape as rect's — rx/ry are re-derived
      // from the box at render time, so dragging a corner resizes freely.
      const rx=Math.min(p[0],p[2]),ry=Math.min(p[1],p[3])
      const rw=Math.abs(p[2]-p[0]),rh=Math.abs(p[3]-p[1])
      return [
        {x:rx,    y:ry,    fn:(nx,ny)=>[nx,ny,rx+rw,ry+rh]},
        {x:rx+rw, y:ry,    fn:(nx,ny)=>[rx,ny,nx,ry+rh]},
        {x:rx+rw, y:ry+rh, fn:(nx,ny)=>[rx,ry,nx,ny]},
        {x:rx,    y:ry+rh, fn:(nx,ny)=>[nx,ry,rx+rw,ny]},
      ]}
    case 'sine':{
      // Same 4-corner bounding-box handles as rect — the curve is re-derived
      // from the box + cycles at render time, so resizing "just works".
      const rx=Math.min(p[0],p[2]),ry=Math.min(p[1],p[3])
      const rw=Math.abs(p[2]-p[0]),rh=Math.abs(p[3]-p[1])
      return [
        {x:rx,    y:ry,    fn:(nx,ny)=>[nx,ny,rx+rw,ry+rh]},
        {x:rx+rw, y:ry,    fn:(nx,ny)=>[rx,ny,nx,ry+rh]},
        {x:rx+rw, y:ry+rh, fn:(nx,ny)=>[rx,ry,nx,ny]},
        {x:rx,    y:ry+rh, fn:(nx,ny)=>[nx,ry,rx+rw,ny]},
      ]}
    default: return []
  }
}

// A single proportional-scale handle for triangle/polygon, anchored just
// outside the vertex farthest from the centroid — distinct from the
// per-vertex reshape handles above (those move ONE point; this scales ALL
// of them together from the shape's center, the "resize the whole thing"
// counterpart rect/ellipse/sine already get for free via their bounding-box
// corner handles).
function getScaleHandle(shape) {
  if(shape.type!=='triangle'&&shape.type!=='polygon') return null
  const p=shape.points
  const [gcx,gcy]=centroidOf(p)
  let maxD=0,fx=p[0],fy=p[1]
  for(let i=0;i<p.length;i+=2){
    const d=dist(gcx,gcy,p[i],p[i+1])
    if(d>maxD){maxD=d;fx=p[i];fy=p[i+1]}
  }
  if(maxD<1e-6) return null
  const ux=(fx-gcx)/maxD,uy=(fy-gcy)/maxD
  const anchorD=maxD*1.2
  return {
    x:gcx+ux*anchorD, y:gcy+uy*anchorD,
    fn:(nx,ny)=>{
      const newD=dist(gcx,gcy,nx,ny)/1.2
      const factor=Math.max(0.05,newD/maxD)
      const q=[]
      for(let i=0;i<p.length;i+=2) q.push(gcx+(p[i]-gcx)*factor, gcy+(p[i+1]-gcy)*factor)
      return q
    },
  }
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

function ShapeDisplay({shape,selected,darkCanvas,onSelect,onDragEnd,draggable,selectable,showDims}) {
  // Passthrough (imported elements our shape tools can't model — text with
  // custom formatting, curved paths, gradients, etc.) isn't drawn here at
  // all; it's rendered as real SVG in a reference layer underneath the
  // canvas instead (see the PassthroughLayer near the Stage).
  if(shape.type==='passthrough') return null
  const lc=darkCanvas?'#e2e8f0':'#1e293b'
  const sc=selected?'#f97316':shape.color
  // Only attach click/tap handlers when the select tool is active
  const selProps=selectable?{
    onClick:e=>{e.cancelBubble=true;onSelect(shape.id)},
    onTap:  e=>{e.cancelBubble=true;onSelect(shape.id)},
  }:{}
  const dragProps=draggable?{
    draggable:true,
    onDragEnd:e=>{
      const dx=e.target.x(),dy=e.target.y()
      e.target.x(0);e.target.y(0)
      onDragEnd(shape.id,dx,dy)
    },
    onDragStart:e=>{e.cancelBubble=true;onSelect(shape.id)},
  }:{}
  const gp={...selProps,...dragProps}

  if(shape.type==='segment') {
    const [x1,y1,x2,y2]=shape.points
    const len=dist(x1,y1,x2,y2)
    return <Group {...gp}>
      <Line points={shape.points} stroke={sc} strokeWidth={shape.sw} dash={shape.dash} lineCap="round" hitStrokeWidth={12}/>
      <KonvaCircle x={x1} y={y1} radius={4} fill={sc} listening={false}/>
      <KonvaCircle x={x2} y={y2} radius={4} fill={sc} listening={false}/>
      {showDims&&<KonvaText x={(x1+x2)/2+6} y={(y1+y2)/2-10} text={`${fmt(len)} u`} {...TS} fill={lc}/>}
    </Group>
  }

  if(shape.type==='rect') {
    const [x1,y1,x2,y2]=shape.points
    const w=Math.abs(x2-x1),h=Math.abs(y2-y1)
    const rx=Math.min(x1,x2),ry=Math.min(y1,y2)
    const pts=[rx,ry,rx+w,ry,rx+w,ry+h,rx,ry+h]
    return <Group {...gp}>
      <Line points={pts} closed stroke={sc} strokeWidth={shape.sw} dash={shape.dash} fill={sc+'1a'}/>
      {showDims&&<>
        <KonvaText x={rx+w/2-20} y={ry+h+5}   text={`${fmt(w)} u`}       {...TS} fill={lc}/>
        <KonvaText x={rx+w+5}    y={ry+h/2-6}  text={`${fmt(h)} u`}       {...TS} fill={lc}/>
        <KonvaText x={rx+w/2-34} y={ry+h/2-6}  text={`A≈${fmt(w*h)} u²`} {...TS} fill={lc}/>
      </>}
    </Group>
  }

  if(shape.type==='circle') {
    const [cx,cy,rx,ry]=shape.points
    const r=dist(cx,cy,rx,ry)
    return <Group {...gp}>
      <KonvaCircle x={cx} y={cy} radius={r} stroke={sc} strokeWidth={shape.sw} dash={shape.dash} fill={sc+'1a'}/>
      {showDims&&<>
        <Line points={[cx,cy,rx,ry]} stroke={sc} strokeWidth={1} dash={[4,3]} listening={false}/>
        <KonvaCircle x={cx} y={cy} radius={3} fill={sc} listening={false}/>
        <KonvaText x={(cx+rx)/2+4} y={(cy+ry)/2-12} text={`r=${fmt(r)} u`}             {...TS} fill={lc}/>
        <KonvaText x={cx-32}       y={cy+6}          text={`A≈${fmt(Math.PI*r*r)} u²`} {...TS} fill={lc}/>
      </>}
    </Group>
  }

  if(shape.type==='ellipse') {
    const [x1,y1,x2,y2]=shape.points
    const ecx=(x1+x2)/2,ecy=(y1+y2)/2
    const erx=Math.abs(x2-x1)/2,ery=Math.abs(y2-y1)/2
    return <Group {...gp}>
      <KonvaEllipse x={ecx} y={ecy} radiusX={erx} radiusY={ery} stroke={sc} strokeWidth={shape.sw} dash={shape.dash} fill={sc+'1a'}/>
      {showDims&&<>
        <KonvaText x={ecx-30} y={ecy-ery-16} text={`rx=${fmt(erx)} ry=${fmt(ery)}`} {...TS} fill={lc}/>
        <KonvaText x={ecx-32} y={ecy+6}      text={`A≈${fmt(Math.PI*erx*ery)} u²`}   {...TS} fill={lc}/>
      </>}
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
    return <Group {...gp}>
      <Line points={pts} closed stroke={sc} strokeWidth={shape.sw} dash={shape.dash} fill={sc+'1a'}/>
      {showDims&&<>
        {verts.map(([vx,vy],i)=><AngleArc key={i} ax={prev[i][0]} ay={prev[i][1]} vx={vx} vy={vy} bx={next[i][0]} by={next[i][1]} color={sc}/>)}
        {verts.map(([vx,vy],i)=>{const ox=(gcx-vx)*0.3,oy=(gcy-vy)*0.3;return <KonvaText key={i} x={vx+ox-16} y={vy+oy-7} text={`${fmt(angles[i])}°`} {...TS} fill={lc}/>})}
        {verts.map(([vx,vy],i)=>{const [nx,ny]=next[i];const mx=(vx+nx)/2,my2=(vy+ny)/2;const ox=(mx-gcx)*0.2,oy=(my2-gcy)*0.2;return <KonvaText key={i} x={mx+ox-16} y={my2+oy-7} text={`${fmt(sides[i])} u`} {...TS} fill={lc}/>})}
      </>}
    </Group>
  }

  if(shape.type==='polygon') {
    const pts=shape.points
    const [gcx,gcy]=centroidOf(pts)
    return <Group {...gp}>
      <Line points={pts} closed stroke={sc} strokeWidth={shape.sw} dash={shape.dash} fill={sc+'1a'}/>
      {showDims&&<>
        <KonvaText x={gcx-36} y={gcy-8} text={`P=${fmt(perimeterOf(pts))} u`} {...TS} fill={lc}/>
        <KonvaText x={gcx-36} y={gcy+6} text={`A=${fmt(shoelaceArea(pts))} u²`} {...TS} fill={lc}/>
      </>}
    </Group>
  }

  if(shape.type==='sine') {
    const [x1,y1,x2,y2]=shape.points
    const x=Math.min(x1,x2),y=Math.min(y1,y2)
    const w=Math.abs(x2-x1),h=Math.abs(y2-y1)
    const cycles=shape.cycles??2
    const curve=sampleSine(x,y,w,h,cycles)
    return <Group {...gp}>
      <Line points={curve} stroke={sc} strokeWidth={shape.sw} lineCap="round" hitStrokeWidth={12}/>
      {showDims&&<KonvaText x={x} y={y+h+4} text={`amp=${fmt(h/2)} u · ${cycles} cycle${cycles===1?'':'s'}`} {...TS} fill={lc}/>}
    </Group>
  }

  if(shape.type==='text') {
    const [tx,ty]=shape.points
    // Text is always clickable/draggable, regardless of which geo tool is
    // active — unlike the construction shapes (which only drag in Select
    // mode so they don't fight click-to-place), forcing a tool switch just
    // to edit a label you're looking at is the opposite of "click to edit."
    return <Group
      draggable
      onClick={e=>{e.cancelBubble=true;onSelect(shape.id)}}
      onTap={e=>{e.cancelBubble=true;onSelect(shape.id)}}
      onDragStart={e=>{e.cancelBubble=true;onSelect(shape.id)}}
      onDragEnd={e=>{
        const dx=e.target.x(),dy=e.target.y()
        e.target.x(0);e.target.y(0)
        onDragEnd(shape.id,dx,dy)
      }}
    >
      <KonvaText x={tx} y={ty} rotation={shape.rotation??0} text={shape.text || 'Text'} fontSize={shape.fontSize??18}
        fill={sc} fontFamily="system-ui, sans-serif" hitStrokeWidth={8}
        opacity={shape.text ? 1 : 0.4}
      />
    </Group>
  }

  return null
}

function ShapePreview({inProg,mx,my,color,sw,cycles}) {
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
  if(inProg.type==='ellipse') {
    const ecx=(pts[0]+mx)/2,ecy=(pts[1]+my)/2
    const erx=Math.abs(mx-pts[0])/2,ery=Math.abs(my-pts[1])/2
    return <KonvaEllipse x={ecx} y={ecy} radiusX={erx} radiusY={ery} stroke={color} strokeWidth={sw} dash={[5,4]} fill={color+'18'} listening={false}/>
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
  if(inProg.type==='sine') {
    const x=Math.min(pts[0],mx),y=Math.min(pts[1],my)
    const w=Math.abs(mx-pts[0]),h=Math.abs(my-pts[1])
    const curve=sampleSine(x,y,w,h,cycles??2)
    return <Line points={curve} stroke={color} strokeWidth={sw} dash={[5,4]} lineCap="round" listening={false}/>
  }
  return null
}

// ─── Snap indicator ─────────────────────────────────────────────────────────

const SNAP_COLORS = {endpoint:'#f97316',midpoint:'#22c55e',center:'#06b6d4',quadrant:'#a855f7',tangent:'#ec4899',grid:'#94a3b8'}
const SNAP_LABELS = {endpoint:'EP',midpoint:'MID',center:'CTR',quadrant:'QD',tangent:'TAN',grid:'GRID'}

function SnapIndicator({snap, zoom=1}) {
  if(!snap) return null
  const {x,y,type}=snap
  const c=SNAP_COLORS[type]??'#f97316'
  // Screen-space size — without dividing by zoom this becomes a "giant
  // circle" once you zoom in, exactly when snapping matters most.
  const s=7/zoom, sw=1.5/zoom, sw1=1/zoom
  const marker=()=>{
    if(type==='endpoint')
      return <Line points={[x-s,y-s,x+s,y-s,x+s,y+s,x-s,y+s]} closed stroke={c} strokeWidth={sw} listening={false}/>
    if(type==='midpoint')
      return <Line points={[x,y-s,x+s,y+s,x-s,y+s]} closed stroke={c} strokeWidth={sw} listening={false}/>
    if(type==='center')
      return <Group listening={false}>
        <KonvaCircle x={x} y={y} radius={s} stroke={c} strokeWidth={sw}/>
        <Line points={[x-s-3/zoom,y,x+s+3/zoom,y]} stroke={c} strokeWidth={sw1}/>
        <Line points={[x,y-s-3/zoom,x,y+s+3/zoom]} stroke={c} strokeWidth={sw1}/>
      </Group>
    if(type==='quadrant')
      return <KonvaCircle x={x} y={y} radius={s} stroke={c} strokeWidth={sw} listening={false}/>
    if(type==='tangent')
      return <Group listening={false}>
        <KonvaCircle x={x} y={y} radius={s} stroke={c} strokeWidth={sw}/>
        <Line points={[x-s-2/zoom,y-s-2/zoom,x+s+2/zoom,y-s-2/zoom]} stroke={c} strokeWidth={sw1}/>
      </Group>
    return <Line points={[x-s,y,x+s,y,x,y,x,y-s,x,y+s]} stroke={c} strokeWidth={sw1} listening={false}/>
  }
  return <Group listening={false}>
    {marker()}
    <KonvaText x={x+10/zoom} y={y-9/zoom} text={SNAP_LABELS[type]??type} fontSize={9/zoom} fontFamily="monospace" fill={c}/>
  </Group>
}

// ─── Vertex handles ──────────────────────────────────────────────────────────

function VertexHandles({shape, snapPts, shapes, onUpdate, onSnapChange, darkCanvas, zoom=1}) {
  const handles=getHandles(shape)
  const hFill=darkCanvas?'#0f172a':'#fff'
  // Handle size is screen-space, not world-space — without dividing by zoom,
  // these balloon to huge circles once you zoom in to line things up, which
  // is exactly the situation they're most needed in.
  const r=6/zoom, hit=14/zoom, sw=2/zoom
  return <Group>
    {handles.map((h,i)=>(
      <KonvaCircle key={i} x={h.x} y={h.y} radius={r}
        fill={hFill} stroke="#f97316" strokeWidth={sw}
        draggable hitStrokeWidth={hit}
        onMouseEnter={e=>{e.target.getStage().container().style.cursor='crosshair'}}
        onMouseLeave={e=>{e.target.getStage().container().style.cursor='default'}}
        onDragMove={e=>{
          const pos=e.target.getStage().getRelativePointerPosition()
          const snap=findNearestSnap(pos.x,pos.y,snapPts,shapes)
          onSnapChange(snap)
          // .position(), not .setAbsolutePosition() — snap.x/y are world
          // (diagram) coordinates, and this node's parent Group/Layer has no
          // transform of its own (only the Stage does), so local position
          // already matches world space. setAbsolutePosition expects
          // screen-space and would be wrong at any zoom other than 1.
          if(snap) e.target.position({x:snap.x,y:snap.y})
        }}
        onDragEnd={e=>{
          const {x:nx,y:ny}=e.target.position()
          onSnapChange(null)
          onUpdate(shape.id,h.fn(nx,ny))
        }}
      />
    ))}
  </Group>
}

// A single diamond-shaped handle that scales a triangle/polygon proportionally
// from its centroid — shown in Move mode (alongside whole-shape drag), as the
// counterpart to the per-vertex reshape handles VertexHandles shows in
// Edit-points mode. No snapping (scaling doesn't have a natural "nearest
// point" the way moving a single vertex does).
function ScaleHandle({shape, onUpdate, darkCanvas, zoom=1}) {
  const h=getScaleHandle(shape)
  if(!h) return null
  const r=6/zoom, hit=14/zoom, sw=2/zoom
  return <KonvaCircle x={h.x} y={h.y} radius={r}
    fill={darkCanvas?'#0f172a':'#fff'} stroke="#22c55e" strokeWidth={sw}
    draggable hitStrokeWidth={hit}
    onMouseEnter={e=>{e.target.getStage().container().style.cursor='nwse-resize'}}
    onMouseLeave={e=>{e.target.getStage().container().style.cursor='default'}}
    onDragMove={e=>{ /* live-resize while dragging, no snap */ }}
    onDragEnd={e=>{
      const {x:nx,y:ny}=e.target.position()
      onUpdate(shape.id,h.fn(nx,ny))
    }}
  />
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
  const styles={top:{...base,top:0,left:8,right:8,height:8,cursor:'ns-resize'},left:{...base,left:0,top:8,bottom:8,width:8,cursor:'ew-resize'},right:{...base,right:0,top:8,bottom:8,width:8,cursor:'ew-resize'},corner:{...base,top:0,left:0,width:16,height:16,cursor:'nwse-resize'}}
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

function ShapePanel({type, form, setForm, onCreate, onUpdate, selectedId, onClearSelection, darkCanvas}) {
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
    <div data-scratchpad-ui style={{background:tbBg,borderBottom:`1px solid ${bdr}`,padding:'7px 12px',display:'flex',flexWrap:'wrap',gap:8,alignItems:'flex-end',flexShrink:0}}>
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
        {selectedId&&<button style={btnStyle('#64748b')} onClick={onClearSelection}>✕ Clear selection</button>}
      </div>
    </div>
  )
}

// ─── Main ScratchPad ────────────────────────────────────────────────────────

export default function ScratchPad({isOpen,onClose,onSnap,openFile}) {
  // ── draw state
  const [lines,    setLines]    = useState(()=>load(LINES_KEY,[]))
  const [tool,     setTool]     = useState('brush')
  const [color,    setColor]    = useState('#6366f1')
  const [sw,       setSw]       = useState(4)

  // ── file load/save — ScratchPad opens/edits/saves real diagram files
  // directly (talking to the dev-fs API), instead of
  // being a separate tool you have to send a sketch to.
  const [currentDir,setCurrentDir]=useState(DEFAULT_DIAGRAMS_DIR)
  const [fileList,setFileList]=useState([])
  const [filesLoaded,setFilesLoaded]=useState(false)
  const [currentFilePath,setCurrentFilePath]=useState(null)
  const [currentViewBox,setCurrentViewBox]=useState('0 0 720 480')
  const [vbEdit,setVbEdit]=useState('0 0 720 480') // editable copy — only commits to currentViewBox on Apply
  const [fileSaveMsg,setFileSaveMsg]=useState('')
  const [newFileName,setNewFileName]=useState('')
  const [showFileList,setShowFileList]=useState(true) // visible by default — hiding the only way to pick a file behind a toggle was the bug
  const [showCodePane,setShowCodePane]=useState(false)
  const pendingCodeRef=useRef(null)

  // ── geo state
  const [mode,       setMode]       = useState('draw')
  const [geoTool,    setGeoTool]    = useState('segment')
  const [shapes,     setShapes]     = useState(()=>load(SHAPES_KEY,[]))
  // Real undo history — a stack of shapes-array snapshots taken right before
  // each discrete edit (add/move/reshape/update/delete), not the old "pop
  // the last array element" behavior, which deleted whatever happened to be
  // last in the array regardless of what was actually just edited.
  const [history,setHistory]=useState([])
  const pushHistory=()=>setHistory(h=>[...h.slice(-49),shapes])
  // Monaco's onMount fires once and closes over whatever pushHistory was at
  // that moment — this ref keeps a current reference for that one call site.
  const pushHistoryRef=useRef(pushHistory)
  useEffect(()=>{ pushHistoryRef.current=pushHistory })
  const [inProg,       setInProg]       = useState(null)
  const [mousePos,     setMousePos]     = useState({x:0,y:0})
  const [selectedId,   setSelectedId]   = useState(null)
  const [snapCandidate,setSnapCandidate]= useState(null)
  const [editingTextId,setEditingTextId]= useState(null) // shape id currently showing the inline edit textarea
  // 'move' drags the selected shape as a whole; 'points' activates its
  // vertex/resize handles instead — these used to both be live at once on
  // any selected multi-point shape, so dragging a triangle near a vertex
  // reshaped it instead of moving it, with no way to choose which you meant.
  const [editMode,setEditMode]=useState('move')

  // ── shape input panel
  const [form, setForm] = useState(DEFAULTS.segment)

  // ── shared
  const [darkCanvas,setDarkCanvas]=useState(()=>document.documentElement.classList.contains('dark'))

  // ── grid
  const savedGrid=load(GRID_KEY,{show:false,step:50,snap:false,osnap:true,allDims:false})
  const [showGrid,    setShowGrid]    = useState(savedGrid.show)
  const [gridStep,    setGridStep]    = useState(savedGrid.step)
  const [snapToGrid,  setSnapToGrid]  = useState(savedGrid.snap)
  const [osnapOn,     setOsnapOn]     = useState(savedGrid.osnap??true)
  const [showAllDims, setShowAllDims] = useState(savedGrid.allDims??false)

  // Default to a large fraction of the actual screen (not a fixed pixel
  // size) so it's properly usable for file editing on any monitor — and
  // take the larger of that and whatever was previously saved, so anyone
  // who used Scratchpad before this session isn't stuck with an old tiny
  // size silently overriding it.
  const bigDefaultW=typeof window!=='undefined'?Math.min(window.innerWidth*0.9,1400):DEFAULT_W
  const bigDefaultH=typeof window!=='undefined'?Math.min(window.innerHeight*0.85,950):DEFAULT_H
  const saved=load(SIZE_KEY,null)
  const [panelW,setPanelW]=useState(Math.max(saved?.w??0,bigDefaultW))
  const [panelH,setPanelH]=useState(Math.max(saved?.h??0,bigDefaultH))
  const [panelPos,setPanelPos]=useState(null)
  const [snapSide,setSnapSide]=useState(null)
  const [maximized,setMaximized]=useState(false)

  const isDrawing   = useRef(false)
  const dragState   = useRef({active:false,moved:false,startX:0,startY:0,origX:0,origY:0})
  const stageRef    = useRef(null)
  const containerRef= useRef(null)
  const passthroughSvgRef=useRef(null)
  const [canvasSize,setCanvasSize]=useState({w:0,h:0})
  const [isMobile,  setIsMobile]  =useState(()=>window.innerWidth<640)

  // ── Canvas zoom/pan — for lining shapes up precisely without zooming the
  // whole page. Pan is just the Stage's own draggable position (Konva native),
  // only enabled in geo/select mode so it doesn't fight shape placement/drag.
  const [zoom,setZoom]=useState(1)
  const [stagePos,setStagePos]=useState({x:0,y:0})
  const ZOOM_MIN=0.2,ZOOM_MAX=5
  const zoomBy=useCallback((factor,centerX,centerY)=>{
    setZoom(prevZoom=>{
      const nextZoom=Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,prevZoom*factor))
      if(centerX!=null){
        setStagePos(prevPos=>{
          const worldX=(centerX-prevPos.x)/prevZoom, worldY=(centerY-prevPos.y)/prevZoom
          return {x:centerX-worldX*nextZoom, y:centerY-worldY*nextZoom}
        })
      }
      return nextZoom
    })
  },[])
  const handleWheelZoom=useCallback(e=>{
    e.evt.preventDefault()
    const stage=e.target.getStage()
    const pointer=stage.getPointerPosition()
    zoomBy(e.evt.deltaY<0?1.1:1/1.1, pointer.x, pointer.y)
  },[zoomBy])
  const resetZoom=useCallback(()=>{ setZoom(1); setStagePos({x:0,y:0}) },[])
  // The editing canvas used to have zero relationship to the file's actual
  // viewBox — Stage pixel size came from the panel's available space, with
  // no scaling/fit to the loaded shapes' coordinate space. That's why
  // "Apply" on viewBox visibly did nothing, and new content placed in the
  // (much bigger, unrelated-sized) canvas often landed outside the file's
  // real exportable bounds. This resets zoom/pan to fit-and-center the
  // given viewBox in the available canvas — called on file open/create and
  // whenever viewBox is explicitly applied, not continuously (so it doesn't
  // fight manual zoom/pan afterward).
  const fitToViewBox=useCallback((vbStr)=>{
    const vb=parseViewBoxStr(vbStr)
    if(!vb||vb.w<=0||vb.h<=0||canvasSize.w<=0||canvasSize.h<=0) return
    const scale=Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,Math.min(canvasSize.w/vb.w,canvasSize.h/vb.h)*0.9))
    setZoom(scale)
    setStagePos({
      x: -vb.x*scale + (canvasSize.w-vb.w*scale)/2,
      y: -vb.y*scale + (canvasSize.h-vb.h*scale)/2,
    })
  },[canvasSize])

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
  useEffect(()=>{try{
    if(selectedId==null) localStorage.removeItem(SELECTED_SHAPE_KEY)
    else localStorage.setItem(SELECTED_SHAPE_KEY,String(selectedId))
  }catch{}},[selectedId])
  useEffect(()=>{if(!isMobile)save(SIZE_KEY,{w:panelW,h:panelH})},[panelW,panelH,isMobile])
  useEffect(()=>{save(GRID_KEY,{show:showGrid,step:gridStep,snap:snapToGrid,osnap:osnapOn,allDims:showAllDims})},[showGrid,gridStep,snapToGrid,osnapOn,showAllDims])

  useEffect(()=>{
    const handleOpenForGeo=(event)=>{
      const detail=event?.detail||{}
      if(detail.mode==='geo') setMode('geo')
      if(detail.tool) setGeoTool(detail.tool)
    }
    window.addEventListener('oc-open-scratchpad',handleOpenForGeo)
    return()=>window.removeEventListener('oc-open-scratchpad',handleOpenForGeo)
  },[])

  // ── File load/save ──────────────────────────────────────────────────────

  const openFileByPath=useCallback((path)=>{
    setFileSaveMsg('Loading…')
    fetch(`${DEV_FS_API}/read?path=${encodeURIComponent(path)}`)
      .then(async r=>(r.ok ? r.text() : null)) // doesn't exist yet — start a blank canvas at this path instead of erroring
      .then(text=>{
        let vb='0 0 720 480'
        if (text == null) {
          setShapes([])
          setCurrentViewBox(vb)
        } else {
          const {shapes:parsed,viewBox}=parseSvgToShapes(text)
          setShapes(parsed)
          vb=viewBox||vb
          setCurrentViewBox(vb)
        }
        fitToViewBox(vb)
        setCurrentFilePath(path)
        // Freehand brush strokes are a separate, persisted "quick doodle"
        // layer that was never part of the SVG save/load pipeline — leaving
        // old scribbles from an unrelated session rendered on top of a real
        // diagram file is debris, not a feature.
        setLines([])
        setSelectedId(null)
        setHistory([]) // undo shouldn't be able to cross into a different file's content
        setMode('geo')
        setGeoTool('select') // opening a file is for editing what's there, not placing a new shape on top of it
        setFileSaveMsg('')
      })
      .catch(e=>{ setFileSaveMsg('Load error: '+e.message); setTimeout(()=>setFileSaveMsg(''),4000) })
  },[fitToViewBox])

  // Auto-target a course's diagrams folder (and optionally a specific file)
  // when ScratchPad is opened from the Lesson Builder's diagram buttons —
  // dir alone (no file yet) still needs to point file-list/save at the right
  // course folder, not whatever ScratchPad's own default happens to be.
  useEffect(()=>{
    if(!isOpen||!openFile) return
    if(openFile.dir) setCurrentDir(openFile.dir)
    if(openFile.filePath) openFileByPath(openFile.filePath)
  },[isOpen,openFile,openFileByPath])

  // File list for the current course's diagrams folder
  useEffect(()=>{
    setFilesLoaded(false)
    fetch(`${DEV_FS_API}/list?dir=${encodeURIComponent(currentDir)}`)
      .then(r=>r.json())
      .then(data=>setFileList(Array.isArray(data)?data:[]))
      .catch(()=>setFileList([]))
      .finally(()=>setFilesLoaded(true))
  },[currentDir])

  const saveToProject=useCallback(()=>{
    if(!currentFilePath) { setFileSaveMsg('Name a file first (use "+ New")'); setTimeout(()=>setFileSaveMsg(''),4000); return }
    setFileSaveMsg('Saving…')
    const xml=buildSvgDocument(shapes,currentViewBox)
    fetch(`${DEV_FS_API}/write`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({filePath:currentFilePath,content:xml}),
    })
      .then(r=>r.json())
      .then(data=>{
        setFileSaveMsg(data.ok?'Saved!':'Error: '+(data.error||'?'))
        if(data.ok){
          if(!fileList.some(f=>f.path===currentFilePath)){
            setFileList(prev=>[...prev,{name:currentFilePath.split('/').pop(),path:currentFilePath}])
          }
          // Lets any open LiveSvgPreview thumbnail (e.g. in the Lesson
          // Builder) know to re-fetch this exact file — a one-way "this
          // changed" signal, not a coupling back to whichever UI opened us.
          window.dispatchEvent(new CustomEvent('oc-svg-file-saved',{detail:{path:currentFilePath}}))
        }
      })
      .catch(e=>setFileSaveMsg('Error: '+e.message))
      .finally(()=>setTimeout(()=>setFileSaveMsg(''),3000))
  },[currentFilePath,currentViewBox,shapes,fileList])

  const createNewFile=useCallback(()=>{
    const name=newFileName.trim().replace(/\.svg$/i,'')+'.svg'
    if(!/^[\w-]+\.svg$/i.test(name)){ setFileSaveMsg('Use letters, numbers, - and _ only'); setTimeout(()=>setFileSaveMsg(''),4000); return }
    setShapes([])
    setCurrentViewBox('0 0 720 480')
    fitToViewBox('0 0 720 480')
    setCurrentFilePath(`${currentDir}/${name}`)
    setLines([])
    setSelectedId(null)
    setHistory([])
    setNewFileName('')
    setMode('geo')
    setGeoTool('select')
  },[newFileName,currentDir,fitToViewBox])

  const downloadSvg=useCallback(()=>{
    const filename=currentFilePath?currentFilePath.split('/').pop():'diagram.svg'
    const blob=new Blob([buildSvgDocument(shapes,currentViewBox)],{type:'image/svg+xml'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url; a.download=filename; a.click()
    URL.revokeObjectURL(url)
  },[currentFilePath,shapes,currentViewBox])

  // Keep the editable viewBox field in sync when it changes from elsewhere
  // (opening a file, creating a new one) — only typing + Apply pushes the
  // other way, so dragging shapes around doesn't fight your typing mid-edit.
  useEffect(()=>{ setVbEdit(currentViewBox) },[currentViewBox])

  // Visible page-boundary rect — the exportable bounds, drawn so "in bounds"
  // vs "scratch space outside the file" is unmistakable at a glance.
  const vb=useMemo(()=>parseViewBoxStr(currentViewBox),[currentViewBox])

  const applyViewBox=useCallback(()=>{
    const parts=vbEdit.trim().split(/\s+/).map(Number)
    if(parts.length!==4||parts.some(Number.isNaN)){ setFileSaveMsg('viewBox needs 4 numbers: x y width height'); setTimeout(()=>setFileSaveMsg(''),4000); return }
    setCurrentViewBox(vbEdit.trim())
    // Apply used to only update export metadata — the editing canvas never
    // visibly resized, so "apply a bigger size" looked like it did nothing.
    fitToViewBox(vbEdit.trim())
  },[vbEdit,fitToViewBox])

  // Sync form ↔ selected shape
  useEffect(()=>{
    setEditMode('move') // every new selection starts in Move mode
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
        pushHistory()
        setShapes(prev=>prev.filter(s=>s.id!==selectedId))
        setSelectedId(null)
      }
      if(e.key==='Escape') { setInProg(null); setSelectedId(null) }
    }
    window.addEventListener('keydown',h)
    return()=>window.removeEventListener('keydown',h)
  },[isOpen,selectedId,pushHistory])

  const handleResize=useCallback((dir,dx,dy)=>{
    const maxW=snapSide?Math.floor(window.innerWidth*0.45):window.innerWidth-24
    if(dir==='top'||dir==='corner') setPanelH(h=>Math.max(MIN_H,Math.min(h-dy,window.innerHeight-80)))
    if(dir==='left'||dir==='corner') setPanelW(w=>{const n=Math.max(MIN_W,Math.min(w-dx,maxW));if(snapSide) onSnap?.(snapSide,n);return n})
    if(dir==='right') setPanelW(w=>{const n=Math.max(MIN_W,Math.min(w+dx,maxW));if(snapSide) onSnap?.(snapSide,n);return n})
  },[snapSide,onSnap])

  const startPanelDrag=useCallback(e=>{
    if(isMobile||maximized) return
    if(e.target.closest('button,input,select,textarea,a')) return
    e.stopPropagation()
    let origX,origY
    if(snapSide==='left'){origX=0;origY=56}
    else if(snapSide==='right'){origX=window.innerWidth-panelW;origY=56}
    else if(panelPos){origX=panelPos.x;origY=panelPos.y}
    else{origX=window.innerWidth-panelW-16;origY=window.innerHeight-panelH-16}
    dragState.current={active:true,moved:false,startX:e.clientX,startY:e.clientY,origX,origY}
    if(snapSide){setSnapSide(null);onSnap?.(null,0);setPanelPos({x:origX,y:origY})}
    e.currentTarget.setPointerCapture(e.pointerId)
  },[isMobile,maximized,snapSide,panelPos,panelW,panelH,onSnap])

  const onPanelDragMove=useCallback(e=>{
    if(!dragState.current.active) return
    const dx=e.clientX-dragState.current.startX,dy=e.clientY-dragState.current.startY
    if(!dragState.current.moved&&Math.abs(dx)<5&&Math.abs(dy)<5) return
    dragState.current.moved=true
    setPanelPos({x:Math.max(0,Math.min(dragState.current.origX+dx,window.innerWidth-panelW)),y:Math.max(0,Math.min(dragState.current.origY+dy,window.innerHeight-40))})
  },[panelW])

  const onPanelDragEnd=useCallback(e=>{
    if(!dragState.current.active) return
    dragState.current.active=false
    if(!dragState.current.moved) return
    const x=dragState.current.origX+(e.clientX-dragState.current.startX)
    const maxSnapW=Math.floor(window.innerWidth*0.45)
    const snapW=Math.min(panelW,maxSnapW)
    if(x<SNAP_MARGIN){
      if(snapW!==panelW) setPanelW(snapW)
      setSnapSide('left');setPanelPos(null);onSnap?.('left',snapW)
    } else if(window.innerWidth-x-panelW<SNAP_MARGIN){
      if(snapW!==panelW) setPanelW(snapW)
      setSnapSide('right');setPanelPos(null);onSnap?.('right',snapW)
    }
  },[panelW,onSnap])

  // ── Freehand
  // Relative (not raw) pointer position — accounts for the Stage's current
  // zoom/pan transform so shape coordinates stay correct in world-space
  // regardless of how far you've zoomed in.
  const getPos=e=>e.target.getStage().getRelativePointerPosition()

  const handleDrawDown=useCallback(e=>{
    if(mode!=='draw') return
    isDrawing.current=true
    const pos=getPos(e)
    setLines(prev=>[...prev,{tool,color:tool==='eraser'?null:color,sw,points:[pos.x,pos.y]}])
  },[mode,tool,color,sw])

  const handleDrawMove=useCallback(e=>{
    const pos=getPos(e)
    // OSNAP: compute nearest snap candidate for geo mode hover/preview
    if(mode==='geo'&&!isDrawing.current){
      let snap=null
      // Object snap (endpoints, midpoints, centers, quadrants, tangents)
      if(osnapOn){
        const allPts=getSnapPoints(shapes)
        snap=findNearestSnap(pos.x,pos.y,allPts,shapes)
      }
      // Grid snap as snap candidate (only if no object snap won)
      if(!snap&&showGrid&&snapToGrid&&gridStep>=1){
        const s=gridStep
        const gx=Math.round(pos.x/s)*s, gy=Math.round(pos.y/s)*s
        if(dist(pos.x,pos.y,gx,gy)<OSNAP_THRESH) snap={x:gx,y:gy,type:'grid'}
      }
      setSnapCandidate(snap)
      setMousePos(snap??pos)
    } else {
      setSnapCandidate(null)
      setMousePos(pos)
    }
    if(mode!=='draw'||!isDrawing.current) return
    e.evt.preventDefault()
    setLines(prev=>{
      const upd=[...prev]
      const last={...upd[upd.length-1]}
      last.points=[...last.points,pos.x,pos.y]
      upd[upd.length-1]=last
      return upd
    })
  },[mode,osnapOn,showGrid,snapToGrid,gridStep,shapes])

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
    pushHistory()
    const id=shape.id??(Date.now()+Math.random())
    setShapes(prev=>[...prev,{...shape,id}])
    return id
  },[pushHistory])

  // Snap a raw canvas position to the nearest grid intersection when snap is on
  const snapPt = useCallback((x, y) => {
    if (!snapToGrid || gridStep < 1) return { x, y }
    const s = gridStep
    return { x: Math.round(x / s) * s, y: Math.round(y / s) * s }
  }, [snapToGrid, gridStep])

  const handleGeoClick=useCallback(e=>{
    if(mode!=='geo') return
    if(e.target!==e.target.getStage()) return
    // Clicking empty canvas always clears whatever was selected, regardless
    // of which tool is active — not just Select. By this point the click
    // already missed every shape (the e.target check above), so there's
    // nothing else this could be interfering with.
    setSelectedId(null); setEditingTextId(null)
    if(geoTool==='select') return
    const raw=getPos(e)
    // OSNAP takes priority over grid snap
    const {x,y}=snapCandidate??snapPt(raw.x,raw.y)
    // Text places on a single click and drops straight into inline edit —
    // no multi-click accumulation like the other tools.
    if(geoTool==='text') {
      pushHistory()
      const id=Date.now()+Math.random()
      setShapes(prev=>[...prev,{type:'text',points:[x,y],color,sw,fontSize:18,text:'',id}])
      setSelectedId(id)
      setEditingTextId(id)
      return
    }
    const NEEDS={segment:2,rect:2,circle:2,ellipse:2,triangle:3,sine:2}
    if(!inProg) { setInProg({type:geoTool,points:[x,y],color,sw}); return }
    const newPts=[...inProg.points,x,y]
    const nPts=newPts.length/2
    if(geoTool==='polygon') {
      if(nPts>=3&&dist(newPts[0],newPts[1],x,y)<SNAP_DIST) { addShape({...inProg}); setInProg(null) }
      else setInProg({...inProg,points:newPts})
      return
    }
    if(nPts>=NEEDS[geoTool]) {
      const extra=geoTool==='sine'?{cycles:+form.cycles||2}:{}
      addShape({...inProg,points:newPts,...extra}); setInProg(null)
    }
    else setInProg({...inProg,points:newPts})
  },[mode,geoTool,inProg,color,sw,addShape,snapPt,snapCandidate,form,pushHistory])

  const handleVertexUpdate=useCallback((shapeId,newPts)=>{
    pushHistory()
    setShapes(prev=>prev.map(s=>{
      if(s.id!==shapeId) return s
      const updated={...s,points:newPts}
      if(shapeId===selectedId) setForm(shapeToForm(updated))
      return updated
    }))
  },[selectedId,pushHistory])

  const finishPolygon=()=>{
    if(inProg?.type==='polygon'&&inProg.points.length>=6){ addShape(inProg); setInProg(null) }
  }

  // ── Shape drag
  const handleShapeDragEnd=useCallback((id,dx,dy)=>{
    pushHistory()
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
  },[selectedId,snapToGrid,gridStep,pushHistory])

  // ── Shape panel create / update
  const handleCreate=()=>{
    const activeType=selectedId ? shapes.find(s=>s.id===selectedId)?.type??geoTool : geoTool
    const pts=formToPoints(activeType,form)
    if(!pts.length) return
    const extra=activeType==='sine'?{cycles:+form.cycles||2}
      :activeType==='text'?{fontSize:+form.fontSize||18,text:'',rotation:+form.rotation||0}
      :{}
    const id=addShape({type:activeType,points:pts,color,sw,...extra})
    // Creating text via the form panel should drop straight into edit mode
    // too, same as clicking the canvas with the Text tool — otherwise a
    // blank placeholder appears with no obvious way to type into it.
    if(activeType==='text'){ setSelectedId(id); setEditingTextId(id) }
  }

  const handleUpdate=()=>{
    if(!selectedId) return
    const shape=shapes.find(s=>s.id===selectedId)
    if(!shape) return
    const pts=formToPoints(shape.type,form)
    if(!pts.length) return
    pushHistory()
    const extra=shape.type==='sine'?{cycles:+form.cycles||2}
      :shape.type==='text'?{fontSize:+form.fontSize||18,rotation:+form.rotation||0}
      :{}
    // Don't overwrite color here — `color` is the global toolbar swatch, not
    // this shape's own color, and was silently recoloring whatever you hit
    // Update on. Update only ever changes what the form fields show.
    setShapes(prev=>prev.map(s=>s.id===selectedId?{...s,points:pts,...extra}:s))
  }

  // ── Undo / clear
  // Real undo — restores the last shapes-array snapshot taken right before
  // an edit, not the old "chop the last array element" behavior (which
  // deleted whatever happened to be last in the array, regardless of what
  // was actually just edited).
  const undo=()=>{
    if(inProg){setInProg(null);return}
    if(mode!=='geo'){ setLines(prev=>prev.slice(0,-1)); return }
    if(!history.length) return
    const prevShapes=history[history.length-1]
    setHistory(h=>h.slice(0,-1))
    setShapes(prevShapes)
    setSelectedId(null)
  }
  const clear=()=>{ pushHistory(); setLines([]); setShapes([]); setInProg(null); setSelectedId(null) }
  // Clears only old freehand brush strokes (e.g. leftover scribbles from a
  // past doodling session that got persisted to localStorage and were
  // bleeding through on top of a real diagram) without touching the
  // diagram's actual shapes.
  const clearLines=()=>setLines([])
  const handleClose=useCallback(()=>{
    setInProg(null)
    setSelectedId(null)
    onClose?.()
  },[onClose])
  const exportSelectionToOpenMat=useCallback(()=>{
    if(!selectedId) return
    window.dispatchEvent(new CustomEvent('oc-export-scratch-geometry'))
  },[selectedId])

  const pickColor=c=>{ setColor(c); if(mode==='draw') setTool('brush') }
  const brushActive=mode==='draw'&&tool==='brush'
  const canUndo=!!(inProg||(mode==='geo'?history.length:lines.length))
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
    <IBtn onClick={()=>setShowGrid(v=>!v)} color={showGrid?'#6366f1':ic} title="Toggle grid">
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
    {mode==='geo'&&<>
      <IBtn onClick={()=>setOsnapOn(v=>!v)} color={osnapOn?'#06b6d4':ic} title="Object snap (EP/MID/CTR/QD/TAN)">
        <Crosshair size={15}/>
      </IBtn>
      <IBtn onClick={()=>setShowAllDims(v=>!v)} color={showAllDims?'#f97316':ic} title="Show all dimensions">
        <Ruler size={15}/>
      </IBtn>
    </>}
  </>

  // Zoom controls — reused in both mobile and desktop toolbars. Scroll-wheel
  // zoom on the canvas already works; these buttons cover trackpads/touch
  // and give a numeric readout so you know how zoomed in you are.
  const zoomControls = <>
    <IBtn onClick={()=>zoomBy(1/1.25)} color={ic} title="Zoom out"><Minus size={13}/></IBtn>
    <button onClick={resetZoom} title="Reset zoom" style={{fontSize:10,fontFamily:'monospace',color:ic,background:'transparent',border:'none',cursor:'pointer',padding:'0 2px',minWidth:34}}>
      {Math.round(zoom*100)}%
    </button>
    <IBtn onClick={()=>zoomBy(1.25)} color={ic} title="Zoom in"><Plus size={13}/></IBtn>
  </>

  const showFinish=mode==='geo'&&inProg?.type==='polygon'&&inProg.points.length>=6
  const activeFormType=selectedId?shapes.find(s=>s.id===selectedId)?.type??geoTool:geoTool
  const passthroughShapes=shapes.filter(s=>s.type==='passthrough')
  const codeText=useMemo(()=>buildSvgDocument(shapes,currentViewBox),[shapes,currentViewBox])

  // Merge in the old SvgEditor's universal drag-anything technique for
  // passthrough elements — curved paths, <g> groups, gradients, anything the
  // shape model can't parse into a structured shape. It worked directly on
  // the real SVG DOM: click any element, drag it, it accumulates a
  // transform="translate(dx,dy)" via getScreenCTM() for the client-to-SVG-
  // userspace conversion. getScreenCTM() walks the full transform chain
  // including this SVG's own CSS transform (the zoom/pan translate+scale
  // below), so it self-corrects for zoom/pan with no manual math needed —
  // same destination as Konva's getRelativePointerPosition, reached
  // independently, so passthrough and structured-shape coordinates stay in
  // the same world-space frame.
  useEffect(()=>{
    const svg=passthroughSvgRef.current
    if(!svg) return
    const children=Array.from(svg.children)
    // Tag each top-level element with the shape id it corresponds to, by
    // document order (matches the order passthroughShapes were joined in) —
    // lets a drag update the right entry in `shapes`, and keeps Konva's own
    // selectedId in sync with whichever passthrough element you clicked.
    children.forEach((el,i)=>{ if(passthroughShapes[i]) el.dataset.shapeId=String(passthroughShapes[i].id) })
    if(!isDraggable) return // only interactive in Select mode — otherwise it'd intercept placement/drawing clicks
    const cleanups=[]
    children.forEach(el=>{
      const shapeId=el.dataset.shapeId
      el.style.cursor='grab'
      const startDrag=e=>{
        e.stopPropagation()
        const pt=svg.createSVGPoint()
        pt.x=e.clientX; pt.y=e.clientY
        const svgPt=pt.matrixTransform(svg.getScreenCTM().inverse())
        svg.querySelectorAll('[data-sel]').forEach(s=>{s.removeAttribute('data-sel');s.style.filter=''})
        el.setAttribute('data-sel','1')
        el.style.filter='drop-shadow(0 0 6px rgba(249,115,22,0.9))'
        setEditingTextId(null)
        if(shapeId) setSelectedId(shapeId)
        const drag={startX:svgPt.x,startY:svgPt.y,origTransform:el.getAttribute('transform')||'',accDx:0,accDy:0}
        const onMove=e2=>{
          const pt2=svg.createSVGPoint()
          pt2.x=e2.clientX; pt2.y=e2.clientY
          const cur=pt2.matrixTransform(svg.getScreenCTM().inverse())
          drag.accDx=cur.x-drag.startX; drag.accDy=cur.y-drag.startY
          el.setAttribute('transform',drag.origTransform)
          applyTranslate(el,drag.accDx,drag.accDy)
        }
        const onUp=()=>{
          el.removeEventListener('pointermove',onMove)
          if((drag.accDx||drag.accDy)&&shapeId){
            pushHistoryRef.current()
            // Strip the DOM-only tracking bits (data-shape-id, the
            // selection drop-shadow, the grab cursor) from a clone before
            // persisting — the live element keeps them for visual
            // feedback, but they must never leak into the saved SVG file.
            const clone=el.cloneNode(true)
            clone.removeAttribute('data-shape-id')
            clone.removeAttribute('data-sel')
            clone.style.filter=''
            clone.style.cursor=''
            if(clone.getAttribute('style')==='') clone.removeAttribute('style')
            const newRaw=clone.outerHTML
            setShapes(prev=>prev.map(s=>s.id===shapeId?{...s,raw:newRaw}:s))
          }
        }
        el.setPointerCapture?.(e.pointerId)
        el.addEventListener('pointermove',onMove)
        el.addEventListener('pointerup',onUp,{once:true})
      }
      el.addEventListener('pointerdown',startDrag)
      cleanups.push(()=>el.removeEventListener('pointerdown',startDrag))
    })
    return ()=>cleanups.forEach(fn=>fn())
  },[passthroughShapes,isDraggable])

  if(!isOpen) return null

  const mobileStyle={position:'fixed',bottom:0,left:0,right:0,height:Math.max(MIN_H,Math.min(panelH,window.innerHeight-60)),zIndex:120,display:'flex',flexDirection:'column',borderRadius:'16px 16px 0 0',overflow:'hidden',boxShadow:'0 -8px 40px rgba(0,0,0,0.3)',borderTop:`1px solid ${bdr}`,background:darkCanvas?'#1e293b':'#fff'}
  const _shared={zIndex:120,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.22)',border:`1px solid ${bdr}`,background:darkCanvas?'#1e293b':'#fff'}
  const desktopStyle=maximized
    ?{..._shared,position:'fixed',top:12,left:12,right:12,bottom:12,width:'auto',height:'auto',borderRadius:16}
    :snapSide
    ?{..._shared,position:'fixed',top:56,[snapSide]:0,bottom:0,width:panelW,borderRadius:snapSide==='left'?'0 16px 16px 0':'16px 0 0 16px'}
    :{..._shared,position:'fixed',...(panelPos?{left:panelPos.x,top:panelPos.y}:{bottom:'1rem',right:'1rem'}),width:panelW,height:panelH,borderRadius:16}
  const rowStyle={display:'flex',alignItems:'center',gap:4,padding:'5px 10px',background:tbBg,flexShrink:0,overflowX:'auto',overflowY:'hidden',scrollbarWidth:'none',msOverflowStyle:'none',WebkitOverflowScrolling:'touch',userSelect:'none'}

  return (
    <>
      {isMobile && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 119, background: 'rgba(0,0,0,0.4)' }}
          onClick={handleClose}
        />
      )}
    <div style={isMobile?mobileStyle:desktopStyle}>

      {/* Resize handles — not shown while maximized, since size is fixed to the viewport then */}
      {!isMobile&&!maximized&&<>
        <ResizeHandle direction="top" onResize={handleResize} darkCanvas={darkCanvas}/>
        {(!snapSide||snapSide==='right')&&<ResizeHandle direction="left" onResize={handleResize} darkCanvas={darkCanvas}/>}
        {snapSide==='left'&&<ResizeHandle direction="right" onResize={handleResize} darkCanvas={darkCanvas}/>}
        {!snapSide&&<ResizeHandle direction="corner" onResize={handleResize} darkCanvas={darkCanvas}/>}
      </>}
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
          {zoomControls}
          <Div c={bdr}/>
          <IBtn onClick={undo}  color={ic}      disabled={!canUndo}><Undo2 size={15}/></IBtn>
          <IBtn onClick={clear} color="#ef4444" disabled={!canClear}><Trash2 size={15}/></IBtn>
          {mode==='geo'&&lines.length>0&&<IBtn onClick={clearLines} color="#f97316" title="Clear leftover scribbles (keeps the diagram)"><Eraser size={15}/></IBtn>}
          {mode==='geo'&&selectedId&&<><Div c={bdr}/><TBtn active={false} onClick={exportSelectionToOpenMat} dark={darkCanvas}>Send</TBtn></>}
          <Div c={bdr}/>
          <IBtn onClick={handleClose} color={ic}><X size={16}/></IBtn>
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
      :<div
        onPointerDown={startPanelDrag} onPointerMove={onPanelDragMove} onPointerUp={onPanelDragEnd}
        style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:4,padding:'6px 10px',background:tbBg,flexShrink:0,borderBottom:`1px solid ${bdr}`,cursor:'grab',userSelect:'none',touchAction:'none'}}
      >
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
        {PALETTE.map(c=><Swatch key={c} c={c} active={brushActive&&color===c} onClick={()=>pickColor(c)}/>)}
        <Div c={bdr}/>
        {gridControls}
        <Div c={bdr}/>
        {zoomControls}
        <Div c={bdr}/>
        <IBtn onClick={()=>setDarkCanvas(d=>!d)} color={ic}>{darkCanvas?<Sun size={15}/>:<Moon size={15}/>}</IBtn>
        <Div c={bdr}/>
        <IBtn onClick={undo}  color={ic}      disabled={!canUndo}><Undo2 size={15}/></IBtn>
        <IBtn onClick={clear} color="#ef4444" disabled={!canClear}><Trash2 size={15}/></IBtn>
        {mode==='geo'&&selectedId&&<><Div c={bdr}/><TBtn active={false} onClick={exportSelectionToOpenMat} dark={darkCanvas}>Send to OpenMAT</TBtn></>}
        <Div c={bdr}/>
        <IBtn onClick={()=>setMaximized(m=>!m)} color={maximized?'#6366f1':ic} title={maximized?'Restore':'Maximize'}>
          {maximized?<Minimize2 size={14}/>:<Maximize2 size={14}/>}
        </IBtn>
        <Div c={bdr}/>
        <IBtn onClick={handleClose} color={ic}><X size={15}/></IBtn>
      </div>}

      {/* ══ FILE BAR — open/save real diagram files, always available ══ */}
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',background:tbBg,borderBottom:`1px solid ${bdr}`,flexWrap:'wrap'}}>
        <IBtn onClick={()=>setShowFileList(v=>!v)} color={showFileList?'#6366f1':ic} title="Browse diagram files">
          <FolderOpen size={14}/>
        </IBtn>
        <span style={{fontSize:11,fontFamily:'monospace',color:ic,flexShrink:0,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {currentFilePath ? currentFilePath.split('/').pop() : 'No file open — sketching only'}
        </span>
        <span style={{fontSize:10,color:ic,flexShrink:0}}>viewBox:</span>
        <input
          value={vbEdit}
          onChange={e=>setVbEdit(e.target.value)}
          onKeyDown={e=>{ e.stopPropagation(); if(e.key==='Enter') applyViewBox() }}
          title="x y width height — the SVG canvas's own size, not the panel window"
          style={{fontSize:10,fontFamily:'monospace',borderRadius:6,padding:'2px 5px',border:`1px solid ${bdr}`,background:darkCanvas?'#0f172a':'#fff',color:darkCanvas?'#e2e8f0':'#1e293b',width:90,flexShrink:0}}
        />
        <button onClick={applyViewBox} style={{fontSize:10,padding:'2px 6px',borderRadius:6,border:`1px solid ${bdr}`,background:'transparent',color:ic,cursor:'pointer',flexShrink:0}}>Apply</button>
        <div style={{flex:'1 1 auto',minWidth:0}}/>
        {fileSaveMsg && <span style={{fontSize:10,color:/error/i.test(fileSaveMsg)?'#f87171':'#4ade80',flexShrink:0}}>{fileSaveMsg}</span>}
        <IBtn onClick={saveToProject} color={currentFilePath?'#22c55e':ic} title="Save to project (overwrites the open file)" disabled={!currentFilePath}>
          <Save size={14}/>
        </IBtn>
        <IBtn onClick={downloadSvg} color={ic} title="Download SVG to your machine">
          <Download size={14}/>
        </IBtn>
        <IBtn onClick={()=>setShowCodePane(v=>!v)} color={showCodePane?'#6366f1':ic} title="Toggle SVG source code pane">
          <FileCode2 size={14}/>
        </IBtn>
      </div>
      {showFileList && (
        <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',background:tbBg,borderBottom:`1px solid ${bdr}`,flexWrap:'wrap'}}>
          <input value={newFileName} onChange={e=>setNewFileName(e.target.value)}
            onKeyDown={e=>{e.stopPropagation(); if(e.key==='Enter') createNewFile()}}
            placeholder="new-diagram.svg"
            style={{fontSize:11,fontFamily:'monospace',borderRadius:6,padding:'3px 6px',border:`1px solid ${bdr}`,background:darkCanvas?'#0f172a':'#fff',color:darkCanvas?'#e2e8f0':'#1e293b',width:130}}
          />
          <button onClick={createNewFile} disabled={!newFileName.trim()} style={{fontSize:11,padding:'3px 8px',borderRadius:6,border:'none',background:'#238636',color:'#fff',cursor:'pointer',opacity:newFileName.trim()?1:0.5}}>+ New</button>
          <div style={{width:1,height:16,background:bdr}}/>
          {!filesLoaded && fileList.length===0 && <span style={{fontSize:11,color:ic,fontStyle:'italic'}}>Loading…</span>}
          {filesLoaded && fileList.length===0 && <span style={{fontSize:11,color:ic,fontStyle:'italic'}}>No diagrams yet in this course</span>}
          {fileList.length>0 && (
            <select
              value={currentFilePath||''}
              onChange={e=>{ if(e.target.value) openFileByPath(e.target.value) }}
              style={{fontSize:11,fontFamily:'monospace',borderRadius:6,padding:'3px 6px',border:`1px solid ${bdr}`,background:darkCanvas?'#0f172a':'#fff',color:darkCanvas?'#e2e8f0':'#1e293b',maxWidth:180}}
            >
              <option value="">Open existing…</option>
              {fileList.map(f=><option key={f.path} value={f.path}>{f.name}</option>)}
            </select>
          )}
        </div>
      )}

      {/* ══ SHAPE INPUT PANEL (geo mode only) ══ */}
      {mode==='geo'&&(
        <ShapePanel
          type={activeFormType}
          form={form}
          setForm={setForm}
          onCreate={handleCreate}
          onUpdate={selectedId?handleUpdate:null}
          selectedId={selectedId}
          onClearSelection={()=>{setSelectedId(null);setEditingTextId(null)}}
          darkCanvas={darkCanvas}
        />
      )}

      {/* ══ CANVAS + optional code pane, side by side ══ */}
      <div style={{display:'flex',flex:1,minHeight:0,overflow:'hidden'}}>
      <div ref={containerRef} style={{position:'relative',flex:1,overflow:'hidden',background:bg,cursor:isDraggable?'grab':mode==='draw'?tool==='eraser'?'cell':'crosshair':'crosshair',touchAction:'none'}}>
        {/* Reference layer — real SVG markup for imported elements the shape
            tools can't fully parse (curved paths, <g> groups, gradients,
            <style> blocks). Transformed to track the Konva canvas's zoom/pan
            so it stays visually aligned. Click-and-drag works on these too
            (in Select mode) via the same getScreenCTM()-based technique the
            old SvgEditor used — they're draggable as a whole even though
            they're not reshapeable/recolorable via the shape panel; deeper
            edits still go through the code pane. */}
        {passthroughShapes.length>0 && (
          <>
            <svg
              ref={passthroughSvgRef}
              width={canvasSize.w} height={canvasSize.h}
              style={{position:'absolute',top:0,left:0,pointerEvents:isDraggable?'auto':'none',transform:`translate(${stagePos.x}px,${stagePos.y}px) scale(${zoom})`,transformOrigin:'0 0'}}
              dangerouslySetInnerHTML={{__html: passthroughShapes.map(s=>s.raw).join('')}}
            />
            <div style={{position:'absolute',bottom:8,left:8,fontSize:10,fontFamily:'system-ui, sans-serif',padding:'3px 8px',borderRadius:6,background:darkCanvas?'rgba(15,23,42,0.85)':'rgba(255,255,255,0.9)',color:darkCanvas?'#94a3b8':'#64748b',pointerEvents:'none',zIndex:4}}>
              {passthroughShapes.length} reference element{passthroughShapes.length===1?'':'s'} — draggable as a whole, not reshapeable (curves/groups/gradients)
            </div>
          </>
        )}
        {canvasSize.w>0&&(
          <Stage ref={stageRef} width={canvasSize.w} height={canvasSize.h}
            scaleX={zoom} scaleY={zoom} x={stagePos.x} y={stagePos.y}
            draggable={isDraggable}
            onDragEnd={e=>{ if(e.target===e.target.getStage()) setStagePos({x:e.target.x(),y:e.target.y()}) }}
            onWheel={handleWheelZoom}
            onMouseDown={handleDrawDown} onMousemove={handleDrawMove} onMouseup={handleDrawUp}
            onTouchStart={handleDrawDown} onTouchMove={handleDrawMove} onTouchEnd={handleDrawUp}
            onClick={handleGeoClick} onTap={handleGeoClick}
          >
            {/* Layer 0: grid */}
            {showGrid&&<GridLayer width={canvasSize.w} height={canvasSize.h} step={gridStep} darkCanvas={darkCanvas}/>}
            {/* Page boundary — the file's actual viewBox, in world coordinates.
                Everything inside this dashed rect is "on the page" and will
                actually show up when the SVG is used; everything outside it
                is scratch space that gets clipped on export. */}
            {vb&&mode==='geo'&&(
              <Layer listening={false}>
                <Line
                  points={[vb.x,vb.y, vb.x+vb.w,vb.y, vb.x+vb.w,vb.y+vb.h, vb.x,vb.y+vb.h]}
                  closed stroke="#f97316" strokeWidth={1.5/zoom} dash={[8/zoom,5/zoom]} fill="transparent"
                />
              </Layer>
            )}
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
                  draggable={isDraggable && !(shape.id===selectedId && editMode==='points')}
                  selectable={geoTool==='select'}
                  showDims={showAllDims||shape.id===selectedId}
                  onSelect={id=>{
                    // Always selects the clicked shape — it used to toggle
                    // off when re-clicking an already-selected shape, which
                    // fought "hold the selection until something else is
                    // picked." Also always resolves editingTextId against
                    // the NEWLY clicked shape (clearing it for non-text),
                    // instead of leaving a stale text editor open for a
                    // shape that's no longer selected.
                    setSelectedId(id)
                    const s=shapes.find(s=>s.id===id)
                    setEditingTextId(s?.type==='text'?id:null)
                  }}
                  onDragEnd={handleShapeDragEnd}
                />
              ))}
              <ShapePreview inProg={inProg} mx={mousePos.x} my={mousePos.y} color={color} sw={sw} cycles={form.cycles}/>
              {inProg?.points&&Array.from({length:inProg.points.length/2},(_,i)=>(
                <KonvaCircle key={i} x={inProg.points[i*2]} y={inProg.points[i*2+1]} radius={4} fill={color} listening={false}/>
              ))}
            </Layer>
            {/* Layer 3: vertex handles + snap indicator (always on top) */}
            <Layer>
              {isDraggable&&selectedId&&editMode==='points'&&(()=>{
                const sel=shapes.find(s=>s.id===selectedId)
                if(!sel) return null
                const snapPts=getSnapPoints(shapes.filter(s=>s.id!==selectedId))
                return <VertexHandles
                  shape={sel}
                  zoom={zoom}
                  snapPts={snapPts}
                  shapes={shapes.filter(s=>s.id!==selectedId)}
                  onUpdate={handleVertexUpdate}
                  onSnapChange={setSnapCandidate}
                  darkCanvas={darkCanvas}
                />
              })()}
              {isDraggable&&selectedId&&editMode==='move'&&(()=>{
                const sel=shapes.find(s=>s.id===selectedId)
                if(!sel||(sel.type!=='triangle'&&sel.type!=='polygon')) return null
                return <ScaleHandle shape={sel} zoom={zoom} onUpdate={handleVertexUpdate} darkCanvas={darkCanvas}/>
              })()}
              {mode==='geo'&&<SnapIndicator snap={snapCandidate} zoom={zoom}/>}
            </Layer>
          </Stage>
        )}

        {/* Inline text editor — a real <textarea> positioned exactly over the
            Konva text node, so typing happens directly on the canvas (not in
            a popup). Stays open through ShapePanel field interactions (size,
            rotation, color) — it only closes via Escape, selecting a
            different shape, or clicking empty canvas, all of which already
            clear editingTextId explicitly elsewhere. It used to also close
            (and even delete the shape if still empty) on every blur, which
            fired the instant focus left the textarea for ANY reason —
            including clicking another field to keep editing the SAME shape
            — making selection look like it randomly broke. No onBlur here
            anymore; abandoned blank text just stays as the existing faint
            "Text" placeholder, deletable like any other shape. */}
        {editingTextId && (() => {
          const editingShape = shapes.find(s => s.id === editingTextId)
          if (!editingShape) return null
          const [tx, ty] = editingShape.points
          const stopEditing = () => setEditingTextId(null)
          return (
            <textarea
              autoFocus
              value={editingShape.text ?? ''}
              onChange={e => {
                const val = e.target.value
                setShapes(prev => prev.map(s => s.id === editingTextId ? { ...s, text: val } : s))
              }}
              onKeyDown={e => {
                e.stopPropagation()
                if (e.key === 'Escape') stopEditing()
              }}
              rows={1}
              style={{
                position: 'absolute',
                left: tx * zoom + stagePos.x,
                top: ty * zoom + stagePos.y - 2,
                // Content-driven width so this matches the actual single-line
                // Konva text render underneath — it used to only have a
                // minWidth, so the textarea wrapped narrower than the real
                // text and looked like a duplicated/broken second copy.
                width: Math.max(60, (editingShape.text ?? '').length * (editingShape.fontSize ?? 18) * zoom * 0.62) + 16,
                height: (editingShape.fontSize ?? 18) * zoom * 1.4,
                whiteSpace: 'pre',
                overflow: 'hidden',
                resize: 'none',
                fontSize: (editingShape.fontSize ?? 18) * zoom,
                fontFamily: 'system-ui, sans-serif',
                color: editingShape.color,
                background: darkCanvas ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
                border: '1px dashed #f97316',
                outline: 'none',
                padding: 0,
                lineHeight: 1.2,
                zIndex: 5,
              }}
            />
          )
        })()}
      </div>

      {/* ══ CODE PANE — live SVG source, edits apply on blur ══ */}
      {showCodePane && (
        <div style={{width:'42%',minWidth:260,borderLeft:`1px solid ${bdr}`,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'4px 10px',fontSize:10,color:ic,background:tbBg,borderBottom:`1px solid ${bdr}`,flexShrink:0}}>
            SVG source — edit and click away to apply
          </div>
          <div style={{flex:1,minHeight:0}}>
            <Editor
              value={codeText}
              language="xml"
              theme="vs-dark"
              options={{fontSize:11,minimap:{enabled:false},wordWrap:'on',scrollBeyondLastLine:false,automaticLayout:true}}
              onChange={v=>{ pendingCodeRef.current=v }}
              onMount={editor=>{
                editor.onDidBlurEditorWidget(()=>{
                  if(pendingCodeRef.current==null) return
                  pushHistoryRef.current()
                  const {shapes:parsed,viewBox}=parseSvgToShapes(pendingCodeRef.current)
                  setShapes(parsed)
                  if(viewBox) setCurrentViewBox(viewBox)
                  pendingCodeRef.current=null
                })
              }}
            />
          </div>
        </div>
      )}
      </div>

      {/* ══ SELECTED SHAPE INFO BAR ══ */}
      {selectedId&&(()=>{
        const selShape=shapes.find(s=>s.id===selectedId)
        const hasHandles=selShape&&getHandles(selShape).length>0
        return (
        <div data-scratchpad-ui style={{padding:'4px 12px',background:tbBg,borderTop:`1px solid ${bdr}`,display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <span style={{fontSize:11,color:'#f97316',fontWeight:600}}>
            {selShape?.type}
          </span>
          <span style={{fontSize:11,color:ic,opacity:0.7}}>
            {editMode==='move'?'drag to move whole shape':'drag handles to reshape'} · Delete to remove
          </span>
          {hasHandles&&(
            <div style={{display:'flex',borderRadius:8,overflow:'hidden',border:`1px solid ${bdr}`}}>
              <button onClick={()=>setEditMode('move')} style={{padding:'4px 10px',border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:editMode==='move'?'#6366f1':'transparent',color:editMode==='move'?'#fff':ic}}>✥ Move</button>
              <button onClick={()=>setEditMode('points')} style={{padding:'4px 10px',border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:editMode==='points'?'#6366f1':'transparent',color:editMode==='points'?'#fff':ic}}>⌖ Edit points</button>
            </div>
          )}
          <div style={{flex:1}}/>
          <button onClick={exportSelectionToOpenMat} style={{padding:'4px 10px',borderRadius:8,border:'none',background:'#2563eb',color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer'}}>Send to OpenMAT</button>
          <IBtn onClick={()=>{pushHistory();setShapes(prev=>prev.filter(s=>s.id!==selectedId));setSelectedId(null)}} color="#ef4444"><Trash2 size={13}/></IBtn>
        </div>
        )
      })()}
    </div>
    </>
  )
}
