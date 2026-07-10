// @ts-nocheck
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Vec3 { x: number; y: number; z: number }
interface Vec2 { x: number; y: number }

interface CADFace {
  verts: number[];
  normal: Vec3;
  id: string;
}
interface CADEdge { a: number; b: number; id: string }

interface SolidGeometry {
  verts: Vec3[];
  faces: CADFace[];
  edges: CADEdge[];
  type: string;
  params: Record<string, unknown>;
}

type SketchEntityType = 'line' | 'circle' | 'arc' | 'point';
interface SketchEntity {
  id: number;
  type: SketchEntityType;
  x?: number; y?: number;
  x1?: number; y1?: number; x2?: number; y2?: number;
  cx?: number; cy?: number; r?: number;
  startAngle?: number; endAngle?: number;
  construction?: boolean;
  [key: string]: unknown;
}

type ConstraintType = 'horizontal' | 'vertical' | 'coincident' | 'distance' | 'radius' | 'angle' | string;
interface SketchConstraint {
  id: number;
  type: ConstraintType;
  entityIds: number[];
  value?: number;
}

type FeatureType = 'box' | 'cylinder' | 'sketch' | 'extrude' | 'revolve' | string;
interface CADFeature {
  id: string;
  type: FeatureType;
  name: string;
  sketchId?: string;
  depth?: number;
  angle?: number;
  width?: number;
  height?: number;
  depth2?: number;
  radius?: number;
  entities?: SketchEntity[];
  constraints?: SketchConstraint[];
  plane?: string;
  position?: Vec3;
  dimensions?: Record<string, number>;
}

interface SelectionState {
  type: 'face' | 'edge' | 'feature' | 'entity' | string;
  ids: string[];
}

interface SketchToolType { name: string; [key: string]: unknown }

interface CADState {
  features: CADFeature[];
  activeFeatureId: string | null;
  activeSketchId: string | null;
  mode: 'model' | 'sketch' | string;
  selection: SelectionState;
  sketchTool: string;
}

interface CameraState {
  azimuth: number;
  elevation: number;
  dist: number;
  px: number;
  py: number;
  zoom: number;
}

interface SolidEntry {
  solid: SolidGeometry | null;
  featureId: string;
  feature: CADFeature;
}

interface CADProProps {
  onSendToCnc?: ((gcode: string) => void) | null;
}

// ─── PALETTE (matches CNC Sim) ─────────────────────────────────────────────
const PALETTE_DARK = {
  bg:"#07111e", p1:"#0f172a", p2:"#132033", p3:"#1e293b", p4:"#334155",
  bd:"#2b3a55", bd2:"#475569",
  blue:"#63b8ff", blue2:"#94b8ff", blueBg:"rgba(33,102,255,0.10)",
  green:"#46d89f", green2:"#6ee7b7", greenBg:"rgba(70,216,159,0.1)",
  amber:"#f0b44c", amber2:"#fcd34d", amberBg:"rgba(240,180,76,0.1)",
  red:"#ff8b8b", red2:"#fca5a5", redBg:"rgba(255,139,139,0.1)",
  purple:"#b89cff", teal:"#31d0c4",
  txt:"#e6eefb", txt2:"#90a4c2", txt3:"#61738e",
  grad:"linear-gradient(135deg,#091324 0%,#0a314e 52%,#0f5f64 100%)",
  gradBorder:"rgba(148,184,255,0.18)",
  vpBg:"#0B1424", codeBg:"#0f172a", brandTxt:"#ffffff",
  grid:"#131c28", axBd:"#1e3040",
  face:"rgba(99,184,255,0.12)", faceHov:"rgba(99,184,255,0.25)", faceEdge:"#2a5080",
  sketchLine:"#63b8ff", sketchArc:"#b89cff", sketchDim:"#f0b44c",
  selEdge:"#46d89f", selFace:"rgba(70,216,159,0.18)",
  construction:"rgba(99,184,255,0.4)",
};
const PALETTE_LIGHT = {
  bg:"#f4f7fb", p1:"#ffffff", p2:"#edf4ff", p3:"#e2e8f0", p4:"#cbd5e1",
  bd:"#d5dfef", bd2:"#94a3b8",
  blue:"#1769d1", blue2:"#10243e", blueBg:"rgba(23,105,209,0.10)",
  green:"#198754", green2:"#059669", greenBg:"rgba(25,135,84,0.1)",
  amber:"#b36d05", amber2:"#d97706", amberBg:"rgba(179,109,5,0.1)",
  red:"#c03535", red2:"#dc2626", redBg:"rgba(192,53,53,0.1)",
  purple:"#6f42c1", teal:"#0f8d85",
  txt:"#15253a", txt2:"#607188", txt3:"#8a99ae",
  grad:"linear-gradient(135deg,#eef6ff 0%,#daeefe 48%,#ddfbf3 100%)",
  gradBorder:"rgba(23,105,209,0.16)",
  vpBg:"#f0f4fa", codeBg:"#f8fbff", brandTxt:"#10243e",
  grid:"#d5dfef", axBd:"#cbd5e1",
  face:"rgba(23,105,209,0.08)", faceHov:"rgba(23,105,209,0.18)", faceEdge:"#93b8e0",
  sketchLine:"#1769d1", sketchArc:"#6f42c1", sketchDim:"#b36d05",
  selEdge:"#198754", selFace:"rgba(25,135,84,0.15)",
  construction:"rgba(23,105,209,0.35)",
};
let C = { ...PALETTE_DARK };

// ─── 3D MATH ──────────────────────────────────────────────────────────────────
const v3 = (x,y,z) => ({x,y,z});
const vadd = (a,b) => v3(a.x+b.x, a.y+b.y, a.z+b.z);
const vsub = (a,b) => v3(a.x-b.x, a.y-b.y, a.z-b.z);
const vscale = (v,s) => v3(v.x*s, v.y*s, v.z*s);
const vdot = (a,b) => a.x*b.x + a.y*b.y + a.z*b.z;
const vcross = (a,b) => v3(a.y*b.z-a.z*b.y, a.z*b.x-a.x*b.z, a.x*b.y-a.y*b.x);
const vlen = v => Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
const vnorm = v => { const l=vlen(v); return l<1e-10?v3(0,0,0):vscale(v,1/l); };
const vlerp = (a,b,t) => vadd(vscale(a,1-t),vscale(b,t));

// Mat4 column-major
const mat4id = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
function mat4mul(a,b) {
  const r=new Array(16);
  for(let i=0;i<4;i++) for(let j=0;j<4;j++) {
    r[i+j*4]=a[i]*b[j*4]+a[i+4]*b[j*4+1]+a[i+8]*b[j*4+2]+a[i+12]*b[j*4+3];
  }
  return r;
}
function mat4rotX(a) { const c=Math.cos(a),s=Math.sin(a); return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; }
function mat4rotY(a) { const c=Math.cos(a),s=Math.sin(a); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; }
function mat4rotZ(a) { const c=Math.cos(a),s=Math.sin(a); return [c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]; }
function mat4trans(x,y,z) { return [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]; }
function mat4scale(x,y,z) { return [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1]; }
function transformPoint(m, p) {
  const x=m[0]*p.x+m[4]*p.y+m[8]*p.z+m[12];
  const y=m[1]*p.x+m[5]*p.y+m[9]*p.z+m[13];
  const z=m[2]*p.x+m[6]*p.y+m[10]*p.z+m[14];
  const w=m[3]*p.x+m[7]*p.y+m[11]*p.z+m[15];
  return v3(x/w,y/w,z/w);
}
function transformNormal(m, n) {
  // Use upper 3x3
  const x=m[0]*n.x+m[4]*n.y+m[8]*n.z;
  const y=m[1]*n.x+m[5]*n.y+m[9]*n.z;
  const z=m[2]*n.x+m[6]*n.y+m[10]*n.z;
  return vnorm(v3(x,y,z));
}

// Perspective projection
function perspProj(p, fov, aspect, near, far) {
  const f = 1/Math.tan(fov/2);
  const nf = 1/(near-far);
  return v3(
    p.x*f/aspect,
    p.y*f,
    (p.z*(near+far)*nf) - (2*near*far*nf)
  );
}

// ─── SOLID GEOMETRY ─────────────────────────────────────────────────────────
// Each solid is a list of { verts, tris, normals, material }
// We store parametric features and rebuild geometry when params change

function makeBox(w,h,d) {
  const hw=w/2, hh=h/2, hd=d/2;
  const verts = [
    v3(-hw,-hh,-hd), v3( hw,-hh,-hd), v3( hw, hh,-hd), v3(-hw, hh,-hd),
    v3(-hw,-hh, hd), v3( hw,-hh, hd), v3( hw, hh, hd), v3(-hw, hh, hd),
  ];
  const faces = [
    { verts:[0,1,2,3], normal:v3(0,0,-1), id:"back"  },
    { verts:[5,4,7,6], normal:v3(0,0, 1), id:"front" },
    { verts:[4,0,3,7], normal:v3(-1,0,0), id:"left"  },
    { verts:[1,5,6,2], normal:v3( 1,0,0), id:"right" },
    { verts:[4,5,1,0], normal:v3(0,-1,0), id:"bottom"},
    { verts:[3,2,6,7], normal:v3(0, 1,0), id:"top"   },
  ];
  const edges = [];
  // 12 edges of a box
  const edgePairs = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  edgePairs.forEach(([a,b],i)=>edges.push({a,b,id:`e${i}`}));
  return {verts,faces,edges,type:"box",params:{w,h,d}};
}

function makeCylinder(r,h,segs=32) {
  const verts = [];
  const step = 2*Math.PI/segs;
  // Bottom circle verts
  for(let i=0;i<segs;i++) verts.push(v3(r*Math.cos(i*step),0,r*Math.sin(i*step)));
  // Top circle verts
  for(let i=0;i<segs;i++) verts.push(v3(r*Math.cos(i*step),h,r*Math.sin(i*step)));
  verts.push(v3(0,0,0));   // bottom center = segs*2
  verts.push(v3(0,h,0));  // top center = segs*2+1

  const faces = [];
  // Side faces (quads)
  for(let i=0;i<segs;i++) {
    const n=(i+1)%segs;
    faces.push({verts:[i,n,n+segs,i+segs], normal:vnorm(v3(Math.cos((i+0.5)*step),0,Math.sin((i+0.5)*step))), id:`side${i}`});
  }
  // Bottom cap
  const botVerts = Array.from({length:segs},(_,i)=>i);
  faces.push({verts:botVerts.reverse(), normal:v3(0,-1,0), id:"bottom"});
  // Top cap
  const topVerts = Array.from({length:segs},(_,i)=>i+segs);
  faces.push({verts:topVerts, normal:v3(0,1,0), id:"top"});

  const edges = [];
  for(let i=0;i<segs;i++){
    edges.push({a:i,b:(i+1)%segs,id:`bot${i}`});
    edges.push({a:i+segs,b:((i+1)%segs)+segs,id:`top${i}`});
    if(i%4===0) edges.push({a:i,b:i+segs,id:`vert${i}`});
  }
  return {verts,faces,edges,type:"cylinder",params:{r,h,segs}};
}

// Extrude a 2D sketch profile along Z
function extrudeProfile(profile, depth) {
  const pts = profile; // array of {x,y}
  const n = pts.length;
  const verts = [];
  // Bottom face (z=0)
  pts.forEach(p => verts.push(v3(p.x, p.y, 0)));
  // Top face (z=depth)
  pts.forEach(p => verts.push(v3(p.x, p.y, depth)));

  const faces = [];
  // Side faces
  for(let i=0;i<n;i++) {
    const j=(i+1)%n;
    const mid = {x:(pts[i].x+pts[j].x)/2, y:(pts[i].y+pts[j].y)/2};
    const dx=pts[j].x-pts[i].x, dy=pts[j].y-pts[i].y;
    const normal = vnorm(v3(dy, -dx, 0));
    faces.push({verts:[i,j,j+n,i+n], normal, id:`side${i}`});
  }
  // Bottom cap
  faces.push({verts:Array.from({length:n},(_,i)=>i).reverse(), normal:v3(0,0,-1), id:"bottom"});
  // Top cap
  faces.push({verts:Array.from({length:n},(_,i)=>i+n), normal:v3(0,0,1), id:"top"});

  const edges = [];
  for(let i=0;i<n;i++){
    edges.push({a:i,b:(i+1)%n,id:`bot${i}`});
    edges.push({a:i+n,b:((i+1)%n)+n,id:`top${i}`});
    edges.push({a:i,b:i+n,id:`vert${i}`});
  }
  return {verts,faces,edges,type:"extrude",params:{profile:pts,depth}};
}

// Revolve a 2D sketch profile around Y axis
function revolveProfile(profile, angle=Math.PI*2, segs=32) {
  const pts = profile; // array of {x,y} — x is radius, y is height
  const nPts = pts.length;
  const step = angle/segs;
  const verts = [];
  for(let s=0;s<=segs;s++) {
    const a = s*step;
    pts.forEach(p => verts.push(v3(p.x*Math.cos(a), p.y, p.x*Math.sin(a))));
  }
  const faces = [];
  for(let s=0;s<segs;s++) {
    for(let i=0;i<nPts-1;i++) {
      const a=s*nPts+i, b=s*nPts+i+1, c=(s+1)*nPts+i+1, d=(s+1)*nPts+i;
      const n1=vsub(verts[b],verts[a]), n2=vsub(verts[d],verts[a]);
      const normal=vnorm(vcross(n1,n2));
      faces.push({verts:[a,b,c,d], normal, id:`s${s}p${i}`});
    }
  }
  const edges = [];
  for(let i=0;i<nPts-1;i++) edges.push({a:i,b:i+1,id:`profile${i}`});
  return {verts,faces,edges,type:"revolve",params:{profile:pts,angle,segs}};
}

// ─── SKETCH ENTITY IDS ───────────────────────────────────────────────────────
let _eid = 1;
const newId = () => _eid++;

// ─── CONSTRAINT SOLVER (simplified) ─────────────────────────────────────────
// Apply constraints to sketch points, return solved positions
function solveConstraints(entities, constraints) {
  // We do a simple iterative solver
  const pts = {};
  entities.forEach(e => {
    if(e.type==="point") pts[e.id]={x:e.x,y:e.y,fixed:e.fixed};
    if(e.type==="line") {
      pts[`${e.id}_a`]={x:e.x1,y:e.y1,fixed:false};
      pts[`${e.id}_b`]={x:e.x2,y:e.y2,fixed:false};
    }
    if(e.type==="circle") pts[`${e.id}_c`]={x:e.cx,y:e.cy,fixed:false};
    if(e.type==="arc") {
      pts[`${e.id}_c`]={x:e.cx,y:e.cy,fixed:false};
    }
  });

  // Apply constraints iteratively
  for(let iter=0;iter<20;iter++) {
    constraints.forEach(c => {
      if(c.type==="fixed") {
        const p=pts[c.ptId];
        if(p){p.x=c.x;p.y=c.y;}
      }
      if(c.type==="horizontal") {
        const a=pts[c.ptA],b=pts[c.ptB];
        if(a&&b){const my=(a.y+b.y)/2;if(!a.fixed)a.y=my;if(!b.fixed)b.y=my;}
      }
      if(c.type==="vertical") {
        const a=pts[c.ptA],b=pts[c.ptB];
        if(a&&b){const mx=(a.x+b.x)/2;if(!a.fixed)a.x=mx;if(!b.fixed)b.x=mx;}
      }
      if(c.type==="coincident") {
        const a=pts[c.ptA],b=pts[c.ptB];
        if(a&&b){const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;if(!a.fixed){a.x=mx;a.y=my;}if(!b.fixed){b.x=mx;b.y=my;}}
      }
      if(c.type==="horizontal_dim") {
        const a=pts[c.ptA],b=pts[c.ptB];
        if(a&&b&&!b.fixed){b.x=a.x+c.val;}
      }
      if(c.type==="vertical_dim") {
        const a=pts[c.ptA],b=pts[c.ptB];
        if(a&&b&&!b.fixed){b.y=a.y+c.val;}
      }
      if(c.type==="radius") {
        const cpt=pts[`${c.entId}_c`];
        // radius constraint: store for display only
      }
    });
  }
  return pts;
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const initCADState = (): CADState => ({
  // Feature tree
  features: [
    { id:1, type:"sketch", name:"Sketch1", planeId:"XY", entities:[
      {id:10,type:"line",x1:-30,y1:-20,x2:30,y2:-20},
      {id:11,type:"line",x1:30,y1:-20,x2:30,y2:20},
      {id:12,type:"line",x1:30,y1:20,x2:-30,y2:20},
      {id:13,type:"line",x1:-30,y1:20,x2:-30,y2:-20},
    ], constraints:[
      {id:20,type:"horizontal_dim",ptA:"10_a",ptB:"10_b",val:60,x:0,y:-35,label:"60"},
      {id:21,type:"vertical_dim",ptA:"11_a",ptB:"11_b",val:40,x:40,y:0,label:"40"},
    ], solved:true },
    { id:2, type:"extrude", name:"Extrude1", sketchId:1, depth:25, dir:1, solid:null },
    { id:3, type:"sketch", name:"Sketch2", planeId:"top", entities:[
      {id:30,type:"circle",cx:0,cy:0,r:8},
    ], constraints:[], solved:true },
    { id:4, type:"extrude", name:"Extrude2", sketchId:3, depth:30, dir:1, solid:null },
    { id:5, type:"fillet", name:"Fillet1", edgeIds:["e0","e1","e2","e3"], radius:3 },
  ],
  activeFeatureId: 2,
  selection: { type:null, ids:[] },
  mode: "3d", // "3d" | "sketch"
  activeSketchId: null,
  sketchTool: "select", // select|line|arc|circle|rect|dimension|constraint
  sketchDrawing: false,
  sketchPts: [],
  snapMode: { grid:true, points:true, midpoint:true },
  hoveredEntity: null,
  hoveredEdge: null,
  hoveredFace: null,
  editingDimId: null,
  editingDimVal: "",
  undoStack: [],
  redoStack: [],
});

// ─── GEOMETRY CACHE ───────────────────────────────────────────────────────────
function buildSolid(feature, features) {
  if(feature.type==="extrude") {
    const sketch = features.find(f=>f.id===feature.sketchId);
    if(!sketch) return null;
    // Extract closed profile from sketch lines/circles
    const ents = sketch.entities;
    // Try to find a closed polygon from lines
    const lines = ents.filter(e=>e.type==="line");
    if(lines.length>=3) {
      // Build polygon from connected lines
      const profile = [
        {x:lines[0].x1,y:lines[0].y1},
        {x:lines[0].x2,y:lines[0].y2},
        {x:lines[1].x2,y:lines[1].y2},
        {x:lines[2].x2,y:lines[2].y2},
      ];
      if(lines.length===4) profile.push({x:lines[3].x2,y:lines[3].y2});
      // For XY plane, extrude along Z
      const solid = extrudeProfile(profile.slice(0,-1), feature.depth);
      // Apply plane transform
      if(sketch.planeId==="top") {
        // Top face: Y=depth of previous extrude
        const prevExtrude = features.slice(0,features.indexOf(feature)).reverse().find(f=>f.type==="extrude");
        const yOff = prevExtrude?prevExtrude.depth:0;
        solid.verts = solid.verts.map(v=>v3(v.x, v.z+yOff, v.y));
        solid.faces.forEach(f=>{
          f.normal = v3(f.normal.x, f.normal.z, f.normal.y);
        });
      }
      return solid;
    }
    // Circle → cylinder
    const circles = ents.filter(e=>e.type==="circle");
    if(circles.length>=1) {
      const c=circles[0];
      const prevExtrude = features.slice(0,features.indexOf(feature)).reverse().find(f=>f.type==="extrude");
      const yOff = prevExtrude?prevExtrude.depth:0;
      const solid = makeCylinder(c.r, feature.depth, 32);
      solid.verts = solid.verts.map(v=>v3(v.x+c.cx, v.y+yOff, v.z+c.cy));
      return solid;
    }
  }
  return null;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const getCSS = () => `
.cad *{box-sizing:border-box;margin:0;padding:0}
.cad{font-family:'Inter',sans-serif;font-size:12px;background:${C.bg};color:${C.txt};display:grid;grid-template-rows:42px 1fr;height:100vh;width:100vw;overflow:hidden}
.topbar{background:${C.grad};border-bottom:1px solid ${C.gradBorder};color:${C.brandTxt};display:flex;align-items:center;padding:0;z-index:20;overflow:hidden}
.brand{color:inherit;font-weight:700;font-size:13px;padding:0 14px;border-right:1px solid ${C.gradBorder};height:100%;display:flex;align-items:center;gap:8px;white-space:nowrap;letter-spacing:.5px}
.tseg{display:flex;align-items:center;gap:5px;padding:0 10px;border-right:1px solid ${C.gradBorder};height:100%;white-space:nowrap}
.tlbl{font-size:9px;color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase}
.tval{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600}
.bdg{border-radius:3px;padding:2px 7px;font-size:9px;font-weight:700;border:1px solid}
.bdg-bl{background:${C.blueBg};color:${C.blue2};border-color:${C.blue}30}
.bdg-gr{background:${C.greenBg};color:${C.green2};border-color:${C.green}30}
.bdg-am{background:${C.amberBg};color:${C.amber2};border-color:${C.amber}30}
.bdg-rd{background:${C.redBg};color:${C.red2};border-color:${C.red}30}
.bdg-mt{background:${C.p2};color:${C.txt3};border-color:${C.bd}}
.main{display:grid;grid-template-columns:236px minmax(0,1fr) 260px;overflow:hidden;height:100%;min-height:0}
.panel{background:${C.p1};border-right:1px solid ${C.bd};display:flex;flex-direction:column;overflow:hidden}
.panel-r{border-right:none;border-left:1px solid ${C.bd}}
.tabrow{display:flex;background:${C.bg};border-bottom:1px solid ${C.bd};flex-shrink:0}
.tab{flex:1;padding:6px 2px;text-align:center;font-size:9px;font-weight:700;letter-spacing:.5px;color:${C.txt3};cursor:pointer;border-bottom:2px solid transparent;text-transform:uppercase}
.tab.on{color:${C.blue};border-bottom-color:${C.blue};background:${C.blueBg}}
.pscroll{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px}
.pscroll::-webkit-scrollbar{width:4px}
.pscroll::-webkit-scrollbar-thumb{background:${C.bd2};border-radius:2px}
.sec{font-size:9px;font-weight:700;letter-spacing:2px;color:${C.txt3};text-transform:uppercase;margin:10px 0 6px;padding-bottom:4px;border-bottom:1px solid ${C.bd}}
.sec:first-child{margin-top:0}
.div{height:1px;background:${C.bd};margin:9px 0}
input,select,textarea{background:${C.p2};border:1px solid ${C.bd};color:${C.txt};border-radius:3px;padding:4px 7px;font-family:inherit;font-size:11px;width:100%;outline:none;transition:.15s}
input:focus,select:focus{border-color:${C.blue};background:${C.p3}}
select option{background:${C.p2}}
.lbl{font-size:9px;font-weight:600;color:${C.txt3};text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.field{margin-bottom:5px}
.frow{display:flex;gap:5px}
.frow>.field{flex:1;min-width:0}
.btn{background:${C.p3};border:1px solid ${C.bd2};color:${C.txt};border-radius:3px;padding:5px 10px;font-family:inherit;font-size:11px;font-weight:500;cursor:pointer;white-space:nowrap}
.btn:hover{border-color:${C.blue};color:${C.blue2}}
.btn-bl{background:${C.blueBg};color:${C.blue2};border-color:${C.blue}30}
.btn-gr{background:${C.greenBg};color:${C.green2};border-color:${C.green}30}
.btn-am{background:${C.amberBg};color:${C.amber2};border-color:${C.amber}30}
.btn-rd{background:${C.redBg};color:${C.red2};border-color:${C.red}30}
.btn.full{width:100%;text-align:center}
.btn.lg{padding:7px 14px;font-size:12px;font-weight:600}
.btnrow{display:flex;gap:4px}
.ftree-item{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:3px;cursor:pointer;font-size:10px;border:1px solid transparent}
.ftree-item:hover{background:${C.p3};border-color:${C.bd}}
.ftree-item.active{background:${C.blueBg};border-color:${C.blue}30;color:${C.blue2}}
.ftree-item.suppressed{opacity:.4}
.ftree-icon{width:16px;height:16px;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0}
.ftree-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ftree-status{font-size:8px;color:${C.txt3};flex-shrink:0}
.proprow{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid ${C.bd}}
.proprow:last-child{border-bottom:none}
.prop-l{font-size:9px;color:${C.txt3}}
.prop-v{font-family:'JetBrains Mono',monospace;font-size:10px;color:${C.txt2}}
#vpWrap{position:relative;background:${C.vpBg};overflow:hidden;flex:1;min-height:0}
#vpCvs{display:block;position:absolute;inset:0;width:100%;height:100%}
.vp-hud{position:absolute;top:10px;left:10px;background:${C.p1}E6;border:1px solid ${C.bd};border-radius:4px;padding:7px 11px;font-size:10px;line-height:1.9;pointer-events:none;z-index:5;color:${C.txt}}
.vp-hud span{font-family:'JetBrains Mono',monospace;font-weight:600}
.vp-toolbar{position:absolute;top:10px;right:10px;display:flex;gap:4px;z-index:5;flex-direction:column}
.vp-btn{background:${C.p1}E6;border:1px solid ${C.bd};color:${C.txt3};border-radius:3px;padding:4px 9px;font-size:9px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap}
.vp-btn:hover{border-color:${C.blue};color:${C.blue}}
.vp-btn.on{border-color:${C.green};color:${C.green};background:${C.greenBg}}
.sketch-toolbar{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:4px;z-index:10;background:${C.p1}F0;border:1px solid ${C.bd};border-radius:6px;padding:5px 8px}
.sktool{background:${C.p3};border:1px solid ${C.bd};color:${C.txt3};border-radius:3px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit}
.sktool:hover{border-color:${C.blue};color:${C.blue2}}
.sktool.on{background:${C.blueBg};border-color:${C.blue};color:${C.blue2}}
.dim-popup{position:absolute;background:${C.p1};border:1px solid ${C.blue};border-radius:4px;padding:6px 8px;z-index:20;display:flex;gap:6px;align-items:center}
.dim-popup input{width:80px;font-family:'JetBrains Mono',monospace;font-size:12px}
.snap-dot{position:absolute;pointer-events:none;z-index:8;transform:translate(-50%,-50%)}
.mini{display:flex;justify-content:space-between;align-items:center;padding:3px 7px;background:${C.bg};border:1px solid ${C.bd};border-radius:3px;margin-bottom:2px}
.mini-l{font-size:9px;color:${C.txt3};font-family:monospace}
.mini-v{font-family:'JetBrains Mono',monospace;font-size:10px;color:${C.txt2}}
.ctrlbar{background:${C.p1};border-bottom:1px solid ${C.bd};padding:5px 10px;display:flex;align-items:center;gap:5px;flex-shrink:0;overflow-x:auto}
.ctrl-div{width:1px;height:22px;background:${C.bd};margin:0 2px;flex-shrink:0}
.plane-indicator{position:absolute;bottom:10px;left:10px;display:flex;gap:8px;pointer-events:none;z-index:5}
.axis-label{font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;padding:2px 6px;border-radius:3px;border:1px solid}
`;

// ─── FEATURE ICONS ────────────────────────────────────────────────────────────
const FEATURE_COLORS = {
  sketch:   { bg:"rgba(99,184,255,0.15)", col:"#63b8ff", icon:"✏" },
  extrude:  { bg:"rgba(70,216,159,0.12)", col:"#46d89f", icon:"⬆" },
  revolve:  { bg:"rgba(184,156,255,0.12)", col:"#b89cff", icon:"↻" },
  fillet:   { bg:"rgba(240,180,76,0.12)", col:"#f0b44c", icon:"⌒" },
  chamfer:  { bg:"rgba(255,139,139,0.12)", col:"#ff8b8b", icon:"∠" },
  shell:    { bg:"rgba(49,208,196,0.12)", col:"#31d0c4", icon:"⬜" },
  pattern:  { bg:"rgba(240,180,76,0.12)", col:"#f0b44c", icon:"⊞" },
  mirror:   { bg:"rgba(184,156,255,0.12)", col:"#b89cff", icon:"⇌" },
  hole:     { bg:"rgba(255,139,139,0.12)", col:"#ff8b8b", icon:"○" },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CADPro({ onSendToCnc = null }: CADProProps = {}) {
  const isDarkFn = useCallback(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"), []);
  const [dark, setDark] = useState(isDarkFn);
  useEffect(()=>{ const ob=new MutationObserver(()=>setDark(isDarkFn())); ob.observe(document.documentElement,{attributes:true,attributeFilter:["class"]}); return()=>ob.disconnect(); },[isDarkFn]);
  useEffect(()=>{ Object.assign(C, dark?PALETTE_DARK:PALETTE_LIGHT); },[dark]);
  const CSS = useMemo(()=>getCSS(),[dark]);

  const [state, setState] = useState<CADState>(initCADState);
  const [leftTab, setLeftTab] = useState<string>("tree");
  const [rightTab, setRightTab] = useState<string>("props");
  const [camState, setCamState] = useState<CameraState>({ azimuth:-0.6, elevation:0.5, dist:200, px:0, py:0, zoom:1 });
  const [mousePos, setMousePos] = useState<{x:number;y:number;wx:number;wy:number}>({x:0,y:0,wx:0,wy:0});
  const [snapPt, setSnapPt] = useState(null);
  const [dimPopup, setDimPopup] = useState(null);
  const [dimVal, setDimVal] = useState("");
  const [newFeatureType, setNewFeatureType] = useState("extrude");
  const [extrudeDepth, setExtrudeDepth] = useState(25);
  const [filletRadius, setFilletRadius] = useState(3);
  const [chamferDist, setChamferDist] = useState(2);
  const [holeType, setHoleType] = useState("simple");
  const [holeDia, setHoleDia] = useState(8);
  const [holeDep, setHoleDep] = useState(20);
  const [editingFeature, setEditingFeature] = useState(null);

  const vpRef = useRef(null);
  const cvsRef = useRef(null);
  const camRef = useRef({ azimuth:-0.6, elevation:0.5, dist:200, px:0, py:0, zoom:1 });
  const dragRef = useRef({ on:false, btn:0, lx:0, ly:0 });
  const stateRef = useRef(state);
  useEffect(()=>{ stateRef.current=state; },[state]);

  // Build solid cache
  const solids = useMemo(()=>{
    const result = [];
    state.features.forEach(f=>{
      if(f.type==="extrude"||f.type==="revolve") {
        const solid = buildSolid(f, state.features);
        if(solid) result.push({featureId:f.id, solid, feature:f});
      }
    });
    return result;
  },[state.features]);

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  const draw = useCallback(()=>{
    const cvs=cvsRef.current; if(!cvs)return;
    const ctx=cvs.getContext("2d");
    const W=cvs.width, H=cvs.height;
    ctx.fillStyle=C.vpBg; ctx.fillRect(0,0,W,H);

    const cam=camRef.current;
    const mode=stateRef.current.mode;

    // Build view matrix from camera
    const mRot = mat4mul(mat4rotX(-cam.elevation), mat4rotY(-cam.azimuth));
    const viewDist = cam.dist;

    // Project 3D → 2D
    const proj3d = (p) => {
      const r = transformPoint(mRot, p);
      // Simple perspective
      const fov = 50 * Math.PI/180;
      const f = 1/Math.tan(fov/2);
      const z = r.z + viewDist;
      if(z<1) return null;
      const scale = f * viewDist / z;
      return {
        sx: W/2 + (r.x + cam.px)*scale*cam.zoom*(W/600),
        sy: H/2 - (r.y + cam.py)*scale*cam.zoom*(W/600),
        z: r.z,
        depth: z
      };
    };

    // ─── GRID ─────────────────────────────────────────────────────────────────
    const drawGrid = () => {
      const size=200, step=10;
      ctx.strokeStyle=C.grid; ctx.lineWidth=0.5;
      for(let x=-size;x<=size;x+=step) {
        const a=proj3d(v3(x,0,-size)), b=proj3d(v3(x,0,size));
        if(!a||!b)continue;
        ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.stroke();
      }
      for(let z=-size;z<=size;z+=step) {
        const a=proj3d(v3(-size,0,z)), b=proj3d(v3(size,0,z));
        if(!a||!b)continue;
        ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.stroke();
      }
      // Axis lines
      [
        [v3(-size,0,0),v3(size,0,0), C.red,    "X"],
        [v3(0,-size,0),v3(0,size,0), C.green,  "Y"],
        [v3(0,0,-size),v3(0,0,size), C.blue,   "Z"],
      ].forEach(([a,b,col,lbl])=>{
        const pa=proj3d(a), pb=proj3d(b); if(!pa||!pb)return;
        ctx.strokeStyle=col+"80"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(pa.sx,pa.sy); ctx.lineTo(pb.sx,pb.sy); ctx.stroke();
        // Label at positive end
        const pend=proj3d(v3(b.x?size*0.7:0, b.y?size*0.7:0, b.z?size*0.7:0));
        if(pend){ctx.fillStyle=col; ctx.font="bold 11px system-ui"; ctx.fillText(lbl,pend.sx+4,pend.sy-3);}
      });
    };

    if(mode==="3d") {
      drawGrid();

      // ─── DRAW SOLIDS ────────────────────────────────────────────────────────
      // Sort faces by depth for painter's algorithm
      const allFaces = [];
      solids.forEach(({solid,featureId,feature})=>{
        if(!solid) return;
        solid.faces.forEach(face => {
          const faceVerts = face.verts.map(vi=>solid.verts[vi]);
          const worldCenter = faceVerts.reduce((acc,v)=>vadd(acc,v),v3(0,0,0));
          const avgWorldCenter = vscale(worldCenter, 1/faceVerts.length);
          const camVerts = faceVerts.map(v => transformPoint(mRot, v));
          const center = camVerts.reduce((acc,v)=>vadd(acc,v),v3(0,0,0));
          const pc = proj3d(avgWorldCenter);
          if(!pc) return;
          // Backface culling must be done in camera space because the scene is rotated into view.
          const camNormal = transformNormal(mRot, face.normal);
          if(camNormal.z >= 0.02) return;
          allFaces.push({face, faceVerts, featureId, solid, depth:pc.depth, normal:camNormal});
        });
      });
      allFaces.sort((a,b)=>b.depth-a.depth);

      const sel = stateRef.current.selection;
      const hovFace = stateRef.current.hoveredFace;
      const hovEdge = stateRef.current.hoveredEdge;

      allFaces.forEach(({face, faceVerts, featureId, depth, normal})=>{
        const pts2d = faceVerts.map(v=>proj3d(v)).filter(Boolean);
        if(pts2d.length<3) return;

        // Lighting
        const lightDir = vnorm(v3(-0.5,0.8,-0.6));
        const diff = Math.max(0, vdot(normal, lightDir));
        const ambient = 0.35;
        const brightness = ambient + diff*(1-ambient);

        const isSelected = sel.type==="face"&&sel.ids.includes(face.id);
        const isHovered  = hovFace === `${featureId}_${face.id}`;

        // Fill
        let fillAlpha = brightness;
        if(isSelected) fillAlpha = Math.min(1, fillAlpha+0.3);
        if(isHovered)  fillAlpha = Math.min(1, fillAlpha+0.15);

        ctx.beginPath();
        ctx.moveTo(pts2d[0].sx,pts2d[0].sy);
        pts2d.slice(1).forEach(p=>ctx.lineTo(p.sx,p.sy));
        ctx.closePath();

        if(isSelected) ctx.fillStyle=`rgba(70,216,159,${0.2+fillAlpha*0.3})`;
        else if(isHovered) ctx.fillStyle=`rgba(99,184,255,${0.15+fillAlpha*0.2})`;
        else ctx.fillStyle=`rgba(${dark?`${Math.round(30+fillAlpha*50)},${Math.round(60+fillAlpha*80)},${Math.round(90+fillAlpha*110)}`:`${Math.round(180+fillAlpha*60)},${Math.round(200+fillAlpha*40)},${Math.round(220+fillAlpha*30)}`},${0.85+fillAlpha*0.1})`;
        ctx.fill();

        // Edge stroke
        ctx.strokeStyle = isSelected ? C.selEdge : `rgba(${dark?"99,184,255":"23,105,209"},0.4)`;
        ctx.lineWidth = isSelected ? 1.5 : 0.7;
        ctx.stroke();
      });

      // Draw edges for selected solid
      solids.forEach(({solid,featureId})=>{
        if(!solid) return;
        const isActiveSolid = stateRef.current.activeFeatureId===featureId;
        solid.edges.forEach(edge=>{
          const pa=proj3d(solid.verts[edge.a]);
          const pb=proj3d(solid.verts[edge.b]);
          if(!pa||!pb) return;
          const isHovEdge = hovEdge===`${featureId}_${edge.id}`;
          const isSelEdge = sel.type==="edge"&&sel.ids.includes(`${featureId}_${edge.id}`);
          if(isHovEdge||isSelEdge) {
            ctx.strokeStyle = isSelEdge ? C.selEdge : C.blue;
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(pa.sx,pa.sy); ctx.lineTo(pb.sx,pb.sy); ctx.stroke();
          }
        });
      });

      // ─── SKETCH OVERLAY (3D) ────────────────────────────────────────────────
      state.features.filter(f=>f.type==="sketch").forEach(sk=>{
        const isActive = sk.id===state.activeSketchId;
        sk.entities.forEach(e=>{
          const alpha = isActive?1:0.4;
          if(e.type==="line") {
            const pa=proj3d(sk.planeId==="top"?v3(e.x1,30,e.y1):v3(e.x1,0,e.y1)); // simplify
            const pb=proj3d(sk.planeId==="top"?v3(e.x2,30,e.y2):v3(e.x2,0,e.y2));
            if(!pa||!pb) return;
            ctx.strokeStyle=C.sketchLine+`${Math.round(alpha*255).toString(16).padStart(2,"0")}`;
            ctx.lineWidth=isActive?1.5:1;
            ctx.setLineDash(isActive?[]:[4,3]);
            ctx.beginPath(); ctx.moveTo(pa.sx,pa.sy); ctx.lineTo(pb.sx,pb.sy); ctx.stroke();
            ctx.setLineDash([]);
          }
          if(e.type==="circle") {
            const pc=proj3d(sk.planeId==="top"?v3(e.cx,30,e.cy):v3(e.cx,0,e.cy));
            const pr=proj3d(sk.planeId==="top"?v3(e.cx+e.r,30,e.cy):v3(e.cx+e.r,0,e.cy));
            if(!pc||!pr) return;
            const screenR=Math.sqrt((pr.sx-pc.sx)**2+(pr.sy-pc.sy)**2);
            ctx.strokeStyle=C.sketchArc; ctx.lineWidth=isActive?1.5:1;
            ctx.beginPath(); ctx.arc(pc.sx,pc.sy,screenR,0,Math.PI*2); ctx.stroke();
          }
        });

        // Dimensions
        if(isActive) {
          sk.constraints.forEach(c=>{
            if(!c.label) return;
            const isEditing = stateRef.current.editingDimId===c.id;
            if(c.type==="horizontal_dim") {
              const midPt = proj3d(v3(c.x||0, sk.planeId==="top"?30:0, (c.y||0)-15));
              if(!midPt) return;
              ctx.fillStyle=isEditing?C.amber:C.sketchDim;
              ctx.font=`bold 10px JetBrains Mono, monospace`;
              ctx.fillText(c.label+"mm", midPt.sx, midPt.sy);
            }
            if(c.type==="vertical_dim") {
              const midPt = proj3d(v3((c.x||0)+20, sk.planeId==="top"?30:0, c.y||0));
              if(!midPt) return;
              ctx.fillStyle=isEditing?C.amber:C.sketchDim;
              ctx.font=`bold 10px JetBrains Mono, monospace`;
              ctx.fillText(c.label+"mm", midPt.sx, midPt.sy);
            }
          });
        }
      });

    } else if(mode==="sketch") {
      // ─── SKETCH 2D MODE ──────────────────────────────────────────────────────
      const sk = state.features.find(f=>f.id===state.activeSketchId);
      const scale = camRef.current.dist/2 * camRef.current.zoom;
      const ox=W/2+cam.px*scale, oy=H/2-cam.py*scale;
      const s2s=(x,y)=>({sx:ox+x*scale/80, sy:oy-y*scale/80});
      const toWorld=(sx,sy)=>({x:(sx-ox)*80/scale, y:-(sy-oy)*80/scale});

      // Grid
      const gstep=10;
      ctx.strokeStyle=C.grid; ctx.lineWidth=0.5;
      for(let x=-200;x<=200;x+=gstep){const{sx,sy}=s2s(x,0);ctx.beginPath();ctx.moveTo(sx,-H);ctx.lineTo(sx,2*H);ctx.stroke();}
      for(let y=-200;y<=200;y+=gstep){const{sx,sy}=s2s(0,y);ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke();}
      // Major grid
      ctx.strokeStyle=C.axBd; ctx.lineWidth=1;
      for(let x=-200;x<=200;x+=50){const{sx}=s2s(x,0);ctx.beginPath();ctx.moveTo(sx,-H);ctx.lineTo(sx,2*H);ctx.stroke();}
      for(let y=-200;y<=200;y+=50){const{sy}=s2s(0,y);ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke();}
      // Origin
      const O=s2s(0,0);
      ctx.strokeStyle=C.blue+"60"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(O.sx-15,O.sy); ctx.lineTo(O.sx+15,O.sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(O.sx,O.sy-15); ctx.lineTo(O.sx,O.sy+15); ctx.stroke();
      ctx.fillStyle=C.blue; ctx.font="bold 9px system-ui";
      ctx.fillText("X",O.sx+18,O.sy+4); ctx.fillText("Y",O.sx+4,O.sy-18);

      if(sk) {
        const hov=stateRef.current.hoveredEntity;
        const selIds=stateRef.current.selection.ids;

        sk.entities.forEach(e=>{
          const isHov=hov===e.id;
          const isSel=selIds.includes(e.id);
          const lw=isHov||isSel?2.5:1.5;

          if(e.type==="line") {
            const a=s2s(e.x1,e.y1), b=s2s(e.x2,e.y2);
            ctx.strokeStyle=isSel?C.selEdge:isHov?C.blue:C.sketchLine;
            ctx.lineWidth=lw;
            ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.stroke();
            // Endpoints
            [a,b].forEach(p=>{
              ctx.fillStyle=isSel?C.selEdge:C.sketchLine;
              ctx.beginPath(); ctx.arc(p.sx,p.sy,3,0,Math.PI*2); ctx.fill();
            });
          }
          if(e.type==="arc") {
            const c=s2s(e.cx,e.cy);
            const rs=s2s(e.cx+e.r,e.cy);
            const screenR=Math.abs(rs.sx-c.sx);
            ctx.strokeStyle=isSel?C.selEdge:isHov?C.blue:C.sketchArc;
            ctx.lineWidth=lw;
            ctx.beginPath(); ctx.arc(c.sx,c.sy,screenR,e.a0,e.a1,e.ccw); ctx.stroke();
          }
          if(e.type==="circle") {
            const c=s2s(e.cx,e.cy);
            const rs=s2s(e.cx+e.r,e.cy);
            const screenR=Math.abs(rs.sx-c.sx);
            ctx.strokeStyle=isSel?C.selEdge:isHov?C.blue:C.sketchArc;
            ctx.lineWidth=lw;
            ctx.beginPath(); ctx.arc(c.sx,c.sy,screenR,0,Math.PI*2); ctx.stroke();
            ctx.fillStyle=C.sketchArc+"20"; ctx.fill();
            ctx.fillStyle=C.sketchArc;
            ctx.beginPath(); ctx.arc(c.sx,c.sy,3,0,Math.PI*2); ctx.fill();
          }
          if(e.type==="point") {
            const p=s2s(e.x,e.y);
            ctx.fillStyle=isSel?C.selEdge:C.sketchLine;
            ctx.beginPath(); ctx.arc(p.sx,p.sy,4,0,Math.PI*2); ctx.fill();
          }
        });

        // Dimensions
        sk.constraints.forEach(c=>{
          if(!c.label) return;
          const isEditing=stateRef.current.editingDimId===c.id;

          if(c.type==="horizontal_dim") {
            // Find the line entity
            const ent=sk.entities.find(e=>e.id.toString()===c.ptA?.split("_")[0]);
            if(!ent||ent.type!=="line") return;
            const a=s2s(ent.x1,ent.y1), b=s2s(ent.x2,ent.y2);
            const yOff=-20;
            ctx.strokeStyle=isEditing?C.amber:C.sketchDim; ctx.lineWidth=1;
            ctx.setLineDash([3,2]);
            ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(a.sx,a.sy+yOff); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(b.sx,b.sy); ctx.lineTo(b.sx,b.sy+yOff); ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath(); ctx.moveTo(a.sx,a.sy+yOff); ctx.lineTo(b.sx,b.sy+yOff);
            ctx.strokeStyle=isEditing?C.amber:C.sketchDim; ctx.lineWidth=1.5;
            ctx.stroke();
            const mx=(a.sx+b.sx)/2, my=(a.sy+b.sy)/2+yOff-4;
            ctx.fillStyle=isEditing?C.amber:C.sketchDim;
            ctx.font=`bold 10px JetBrains Mono, monospace`;
            ctx.textAlign="center"; ctx.fillText(c.label+"mm",mx,my); ctx.textAlign="left";
            // Click hotspot (invisible rect for interaction)
            if(isEditing) {
              ctx.strokeStyle=C.amber; ctx.lineWidth=1.5;
              ctx.strokeRect(mx-22,my-11,44,14);
            }
          }
          if(c.type==="vertical_dim") {
            const ent=sk.entities.find(e=>e.id.toString()===c.ptA?.split("_")[0]);
            if(!ent||ent.type!=="line") return;
            const a=s2s(ent.x1,ent.y1), b=s2s(ent.x2,ent.y2);
            const xOff=20;
            ctx.strokeStyle=isEditing?C.amber:C.sketchDim; ctx.lineWidth=1;
            ctx.setLineDash([3,2]);
            ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(a.sx+xOff,a.sy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(b.sx,b.sy); ctx.lineTo(b.sx+xOff,b.sy); ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath(); ctx.moveTo(a.sx+xOff,a.sy); ctx.lineTo(b.sx+xOff,b.sy);
            ctx.strokeStyle=isEditing?C.amber:C.sketchDim; ctx.lineWidth=1.5;
            ctx.stroke();
            const mx=a.sx+xOff+16, my=(a.sy+b.sy)/2;
            ctx.fillStyle=isEditing?C.amber:C.sketchDim;
            ctx.font=`bold 10px JetBrains Mono, monospace`;
            ctx.fillText(c.label+"mm",mx,my);
          }
          if(c.type==="radius") {
            const ent=sk.entities.find(e=>e.id===c.entId);
            if(!ent||(ent.type!=="circle"&&ent.type!=="arc")) return;
            const c2=s2s(ent.cx,ent.cy);
            const re=s2s(ent.cx+ent.r,ent.cy);
            ctx.strokeStyle=C.sketchDim; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(c2.sx,c2.sy); ctx.lineTo(re.sx,re.sy); ctx.stroke();
            ctx.fillStyle=C.sketchDim; ctx.font="bold 10px JetBrains Mono, monospace";
            ctx.fillText("R"+c.label,re.sx+4,re.sy);
          }
        });

        // In-progress draw
        if(state.sketchDrawing&&state.sketchPts.length>0) {
          const cur=mousePos; // screen coords
          ctx.strokeStyle=C.blue; ctx.lineWidth=1.5; ctx.setLineDash([5,3]);
          if(state.sketchTool==="line"||state.sketchTool==="rect") {
            const sp=s2s(state.sketchPts[0].x, state.sketchPts[0].y);
            ctx.beginPath(); ctx.moveTo(sp.sx,sp.sy); ctx.lineTo(cur.x,cur.y); ctx.stroke();
          }
          if(state.sketchTool==="circle") {
            const sp=s2s(state.sketchPts[0].x, state.sketchPts[0].y);
            const r=Math.sqrt((cur.x-sp.sx)**2+(cur.y-sp.sy)**2);
            ctx.beginPath(); ctx.arc(sp.sx,sp.sy,r,0,Math.PI*2); ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        // Snap indicator
        if(snapPt) {
          const sp=s2s(snapPt.x,snapPt.y);
          ctx.strokeStyle=C.blue; ctx.lineWidth=1.5;
          ctx.strokeRect(sp.sx-5,sp.sy-5,10,10);
          ctx.fillStyle=C.blue+"40"; ctx.fillRect(sp.sx-4,sp.sy-4,8,8);
        }
      }
    }

    // Cursor pos indicator
    if(state.mode==="sketch") {
      ctx.fillStyle=C.txt3; ctx.font="9px JetBrains Mono, monospace";
      ctx.fillText(`X:${mousePos.wx?.toFixed(2)||"0.00"} Y:${mousePos.wy?.toFixed(2)||"0.00"}`, 10, H-10);
    }

  },[dark,state,solids,mousePos,snapPt]);

  // ─── RESIZE ──────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const cvs=cvsRef.current,vp=vpRef.current; if(!cvs||!vp)return;
    const resize = () => {
      const rect = vp.getBoundingClientRect();
      const nextW = Math.max(1, Math.floor(rect.width || vp.clientWidth || 1));
      const nextH = Math.max(1, Math.floor(rect.height || vp.clientHeight || 1));
      if (cvs.width !== nextW) cvs.width = nextW;
      if (cvs.height !== nextH) cvs.height = nextH;
      draw();
    };
    const raf = requestAnimationFrame(resize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(vp);
    resize();
    window.addEventListener("resize", resize);
    return()=>{
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
    };
  },[draw]);

  useEffect(()=>{draw();},[draw,state,camState,mousePos,snapPt]);

  // ─── WHEEL ───────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const cvs=cvsRef.current; if(!cvs)return;
    const h=e=>{
      e.preventDefault();
      const delta=e.deltaY>0?0.88:1.14;
      camRef.current = {...camRef.current, zoom:Math.max(0.05,Math.min(20,camRef.current.zoom*delta))};
      setCamState({...camRef.current});
      draw();
    };
    cvs.addEventListener("wheel",h,{passive:false});
    return()=>cvs.removeEventListener("wheel",h);
  },[draw]);

  // ─── SKETCH WORLD COORDS ─────────────────────────────────────────────────────
  const screenToSketch = useCallback((sx,sy)=>{
    const cvs=cvsRef.current; if(!cvs)return{x:0,y:0};
    const W=cvs.width,H=cvs.height;
    const cam=camRef.current;
    const scale=cam.dist/2*cam.zoom;
    const ox=W/2+cam.px*scale, oy=H/2-cam.py*scale;
    return{x:(sx-ox)*80/scale, y:-(sy-oy)*80/scale};
  },[]);

  // ─── SNAP ────────────────────────────────────────────────────────────────────
  const computeSnap = useCallback((wx,wy)=>{
    const s=stateRef.current;
    const sk=s.features.find(f=>f.id===s.activeSketchId);
    let best=null, bestDist=10; // 10 world units snap threshold
    // Grid snap (10mm)
    const gx=Math.round(wx/10)*10, gy=Math.round(wy/10)*10;
    const gd=Math.sqrt((wx-gx)**2+(wy-gy)**2);
    if(gd<bestDist){bestDist=gd;best={x:gx,y:gy,type:"grid"};}

    if(sk&&s.snapMode.points) {
      // Endpoint snap
      sk.entities.forEach(e=>{
        const check=(px,py)=>{const d=Math.sqrt((wx-px)**2+(wy-py)**2);if(d<bestDist){bestDist=d;best={x:px,y:py,type:"endpoint"};}};
        if(e.type==="line"){check(e.x1,e.y1);check(e.x2,e.y2);}
        if(e.type==="circle"||e.type==="arc")check(e.cx,e.cy);
      });
    }
    if(sk&&s.snapMode.midpoint) {
      sk.entities.forEach(e=>{
        if(e.type==="line"){const mx=(e.x1+e.x2)/2,my=(e.y1+e.y2)/2;const d=Math.sqrt((wx-mx)**2+(wy-my)**2);if(d<bestDist){bestDist=d;best={x:mx,y:my,type:"midpoint"};}}
      });
    }
    return best||{x:wx,y:wy,type:"free"};
  },[]);

  // ─── MOUSE ───────────────────────────────────────────────────────────────────
  const onMouseMove = useCallback((e)=>{
    const d=dragRef.current;
    const rect=cvsRef.current?.getBoundingClientRect();
    const mx=rect?e.clientX-rect.left:0, my=rect?e.clientY-rect.top:0;

    if(d.on) {
      const dx=e.clientX-d.lx, dy=e.clientY-d.ly;
      if(stateRef.current.mode==="3d") {
        if(d.btn===1){
          camRef.current.azimuth  -= dx*0.008;
          camRef.current.elevation = Math.max(-1.5,Math.min(1.5,camRef.current.elevation+dy*0.008));
        } else if(d.btn===2||d.btn===4) {
          const sc=camRef.current.dist/2*camRef.current.zoom;
          camRef.current.px += dx/(sc/80);
          camRef.current.py -= dy/(sc/80);
        }
      } else {
        // Pan in sketch mode
        if(d.btn===2||d.btn===4) {
          const sc=camRef.current.dist/2*camRef.current.zoom;
          camRef.current.px += dx/(sc/80);
          camRef.current.py -= dy/(sc/80);
        }
      }
      dragRef.current.lx=e.clientX; dragRef.current.ly=e.clientY;
      setCamState({...camRef.current});
      draw();
    }

    if(stateRef.current.mode==="sketch") {
      const wp=screenToSketch(mx,my);
      const sn=computeSnap(wp.x,wp.y);
      setSnapPt(sn);
      setMousePos({x:mx,y:my,wx:sn.x,wy:sn.y});

      // Hover detection
      const s=stateRef.current;
      const sk=s.features.find(f=>f.id===s.activeSketchId);
      if(sk) {
        let hovId=null;
        sk.entities.forEach(e=>{
          if(e.type==="line") {
            // Distance from point to line segment
            const dx=e.x2-e.x1,dy=e.y2-e.y1;
            const t=Math.max(0,Math.min(1,((sn.x-e.x1)*dx+(sn.y-e.y1)*dy)/(dx*dx+dy*dy)));
            const d=Math.sqrt((sn.x-(e.x1+t*dx))**2+(sn.y-(e.y1+t*dy))**2);
            if(d<3) hovId=e.id;
          }
          if(e.type==="circle"||e.type==="arc") {
            const d=Math.abs(Math.sqrt((sn.x-e.cx)**2+(sn.y-e.cy)**2)-e.r);
            if(d<3) hovId=e.id;
          }
        });
        setState(p=>({...p,hoveredEntity:hovId}));
      }
    } else {
      setMousePos({x:mx,y:my,wx:0,wy:0});
      // TODO: 3D hover detection for faces/edges
    }
  },[screenToSketch,computeSnap,draw]);

  const onMouseDown = useCallback((e)=>{
    dragRef.current={on:true,btn:e.buttons,lx:e.clientX,ly:e.clientY};

    if(stateRef.current.mode==="sketch"&&e.button===0) {
      const pt=snapPt||{x:0,y:0};
      const s=stateRef.current;
      const tool=s.sketchTool;

      if(tool==="line") {
        if(!s.sketchDrawing) {
          setState(p=>({...p,sketchDrawing:true,sketchPts:[{x:pt.x,y:pt.y}]}));
        } else {
          // Finish line
          const p0=s.sketchPts[0];
          const newLine={id:newId(),type:"line",x1:p0.x,y1:p0.y,x2:pt.x,y2:pt.y};
          setState(p=>{
            const sk=p.features.find(f=>f.id===p.activeSketchId);
            if(!sk) return p;
            const updFeatures=p.features.map(f=>f.id===sk.id?{...f,entities:[...f.entities,newLine]}:f);
            return{...p,features:updFeatures,sketchPts:[{x:pt.x,y:pt.y}],sketchDrawing:true};
          });
        }
      } else if(tool==="circle") {
        if(!s.sketchDrawing) {
          setState(p=>({...p,sketchDrawing:true,sketchPts:[{x:pt.x,y:pt.y}]}));
        } else {
          const p0=s.sketchPts[0];
          const r=Math.sqrt((pt.x-p0.x)**2+(pt.y-p0.y)**2);
          const newCircle={id:newId(),type:"circle",cx:p0.x,cy:p0.y,r:Math.max(1,r)};
          setState(p=>{
            const sk=p.features.find(f=>f.id===p.activeSketchId);
            if(!sk) return p;
            const updFeatures=p.features.map(f=>f.id===sk.id?{...f,entities:[...f.entities,newCircle]}:f);
            return{...p,features:updFeatures,sketchDrawing:false,sketchPts:[],sketchTool:"select"};
          });
        }
      } else if(tool==="rect") {
        if(!s.sketchDrawing) {
          setState(p=>({...p,sketchDrawing:true,sketchPts:[{x:pt.x,y:pt.y}]}));
        } else {
          const p0=s.sketchPts[0];
          const x1=p0.x,y1=p0.y,x2=pt.x,y2=pt.y;
          const lines=[
            {id:newId(),type:"line",x1,y1,x2,y2:y1},
            {id:newId(),type:"line",x1:x2,y1,x2,y2},
            {id:newId(),type:"line",x1:x2,y1:y2,x2:x1,y2},
            {id:newId(),type:"line",x1,y1:y2,x2,y2:y1},
          ];
          setState(p=>{
            const sk=p.features.find(f=>f.id===p.activeSketchId);
            if(!sk) return p;
            const updFeatures=p.features.map(f=>f.id===sk.id?{...f,entities:[...f.entities,...lines]}:f);
            return{...p,features:updFeatures,sketchDrawing:false,sketchPts:[],sketchTool:"select"};
          });
        }
      } else if(tool==="select") {
        // Select/deselect entity
        const sk=s.features.find(f=>f.id===s.activeSketchId);
        if(sk) {
          let clickedId=null;
          sk.entities.forEach(e=>{
            if(e.type==="line"){const dx=e.x2-e.x1,dy=e.y2-e.y1;const t=Math.max(0,Math.min(1,((pt.x-e.x1)*dx+(pt.y-e.y1)*dy)/(dx*dx+dy*dy)));const d=Math.sqrt((pt.x-(e.x1+t*dx))**2+(pt.y-(e.y1+t*dy))**2);if(d<3)clickedId=e.id;}
            if(e.type==="circle"||e.type==="arc"){const d=Math.abs(Math.sqrt((pt.x-e.cx)**2+(pt.y-e.cy)**2)-e.r);if(d<3)clickedId=e.id;}
          });
          setState(p=>({...p,selection:clickedId?{type:"sketch",ids:[clickedId]}:{type:null,ids:[]}}));
        }
      } else if(tool==="dimension") {
        // Click on entity to add dimension
        const sk=s.features.find(f=>f.id===s.activeSketchId);
        if(sk) {
          let clickedEnt=null;
          sk.entities.forEach(e=>{
            if(e.type==="line"){const dx=e.x2-e.x1,dy=e.y2-e.y1;const t=Math.max(0,Math.min(1,((pt.x-e.x1)*dx+(pt.y-e.y1)*dy)/(dx*dx+dy*dy)));const d=Math.sqrt((pt.x-(e.x1+t*dx))**2+(pt.y-(e.y1+t*dy))**2);if(d<3)clickedEnt=e;}
            if(e.type==="circle"||e.type==="arc"){const d=Math.abs(Math.sqrt((pt.x-e.cx)**2+(pt.y-e.cy)**2)-e.r);if(d<3)clickedEnt=e;}
          });
          if(clickedEnt) {
            const rect=cvsRef.current?.getBoundingClientRect();
            const sx=rect?e.clientX-rect.left:200, sy=rect?e.clientY-rect.top:200;
            let dimType="", ptA="",ptB="",initVal="";
            if(clickedEnt.type==="line") {
              const dxl=Math.abs(clickedEnt.x2-clickedEnt.x1),dyl=Math.abs(clickedEnt.y2-clickedEnt.y1);
              if(dxl>dyl){dimType="horizontal_dim";ptA=`${clickedEnt.id}_a`;ptB=`${clickedEnt.id}_b`;initVal=dxl.toFixed(1);}
              else{dimType="vertical_dim";ptA=`${clickedEnt.id}_a`;ptB=`${clickedEnt.id}_b`;initVal=dyl.toFixed(1);}
            }
            if(clickedEnt.type==="circle"){dimType="radius";initVal=clickedEnt.r.toFixed(1);}
            if(dimType) {
              setDimPopup({sx,sy,dimType,entId:clickedEnt.id,ptA,ptB,initVal});
              setDimVal(initVal);
            }
          }
        }
      }
    }
  },[snapPt]);

  const onMouseUp = useCallback(()=>{ dragRef.current.on=false; },[]);
  const onContextMenu = useCallback((e)=>{
    e.preventDefault();
    setState(p=>({...p,sketchDrawing:false,sketchPts:[]}));
  },[]);

  // Confirm dimension
  const confirmDim = useCallback(()=>{
    if(!dimPopup) return;
    const val=parseFloat(dimVal);
    if(isNaN(val)||val<=0) return;
    const cid=newId();
    setState(p=>{
      const sk=p.features.find(f=>f.id===p.activeSketchId);
      if(!sk) return p;
      let newConstraint;
      if(dimPopup.dimType==="horizontal_dim"||dimPopup.dimType==="vertical_dim") {
        newConstraint={id:cid,type:dimPopup.dimType,ptA:dimPopup.ptA,ptB:dimPopup.ptB,val,label:val.toFixed(1),x:0,y:0};
        // Update entity
        const ent=sk.entities.find(e=>e.id===dimPopup.entId);
        let updEnt=ent?{...ent}:null;
        if(ent&&dimPopup.dimType==="horizontal_dim"){
          const sign=ent.x2>=ent.x1?1:-1;
          updEnt={...ent,x2:ent.x1+sign*val};
        }
        if(ent&&dimPopup.dimType==="vertical_dim"){
          const sign=ent.y2>=ent.y1?1:-1;
          updEnt={...ent,y2:ent.y1+sign*val};
        }
        const updFeatures=p.features.map(f=>f.id===sk.id?{
          ...f,
          entities:updEnt?f.entities.map(e=>e.id===updEnt.id?updEnt:e):f.entities,
          constraints:[...f.constraints,newConstraint]
        }:f);
        return{...p,features:updFeatures,editingDimId:null};
      }
      if(dimPopup.dimType==="radius") {
        const ent=sk.entities.find(e=>e.id===dimPopup.entId);
        if(ent) {
          const updEnt={...ent,r:val};
          newConstraint={id:cid,type:"radius",entId:dimPopup.entId,label:val.toFixed(1)};
          const updFeatures=p.features.map(f=>f.id===sk.id?{
            ...f,
            entities:f.entities.map(e=>e.id===updEnt.id?updEnt:e),
            constraints:[...f.constraints,newConstraint]
          }:f);
          return{...p,features:updFeatures};
        }
      }
      return p;
    });
    setDimPopup(null);
  },[dimPopup,dimVal]);

  // ─── ENTER SKETCH ────────────────────────────────────────────────────────────
  const enterSketch = useCallback((sketchId)=>{
    setState(p=>({...p,mode:"sketch",activeSketchId:sketchId,sketchTool:"select",sketchDrawing:false,sketchPts:[]}));
  },[]);
  const exitSketch = useCallback(()=>{
    setState(p=>({...p,mode:"3d",activeSketchId:null,sketchTool:"select",sketchDrawing:false,sketchPts:[]}));
  },[]);

  // ─── ADD FEATURE ─────────────────────────────────────────────────────────────
  const addFeature = useCallback((type)=>{
    const id=newId();
    setState(p=>{
      let newFeat;
      if(type==="sketch") {
        newFeat={id,type:"sketch",name:`Sketch${p.features.filter(f=>f.type==="sketch").length+1}`,planeId:"XY",entities:[],constraints:[],solved:false};
      } else if(type==="extrude") {
        const sketches=p.features.filter(f=>f.type==="sketch");
        if(!sketches.length) return p;
        const lastSketch=sketches[sketches.length-1];
        newFeat={id,type:"extrude",name:`Extrude${p.features.filter(f=>f.type==="extrude").length+1}`,sketchId:lastSketch.id,depth:extrudeDepth,dir:1};
      } else if(type==="revolve") {
        const sketches=p.features.filter(f=>f.type==="sketch");
        if(!sketches.length) return p;
        const lastSketch=sketches[sketches.length-1];
        newFeat={id,type:"revolve",name:`Revolve${p.features.filter(f=>f.type==="revolve").length+1}`,sketchId:lastSketch.id,angle:Math.PI*2,segs:32};
      } else if(type==="fillet") {
        const selEdges=p.selection.type==="edge"?p.selection.ids:[];
        newFeat={id,type:"fillet",name:`Fillet${p.features.filter(f=>f.type==="fillet").length+1}`,edgeIds:selEdges,radius:filletRadius};
      } else if(type==="chamfer") {
        const selEdges=p.selection.type==="edge"?p.selection.ids:[];
        newFeat={id,type:"chamfer",name:`Chamfer${p.features.filter(f=>f.type==="chamfer").length+1}`,edgeIds:selEdges,dist:chamferDist};
      } else if(type==="hole") {
        newFeat={id,type:"hole",name:`Hole${p.features.filter(f=>f.type==="hole").length+1}`,holeType,dia:holeDia,depth:holeDep,sketchId:null};
      } else return p;
      return{...p,features:[...p.features,newFeat],activeFeatureId:id};
    });
    if(type==="sketch") {
      setTimeout(()=>setState(p=>({...p,mode:"sketch",activeSketchId:id,sketchTool:"line"})),0);
    }
  },[extrudeDepth,filletRadius,chamferDist,holeType,holeDia,holeDep]);

  // ─── DELETE FEATURE ───────────────────────────────────────────────────────────
  const deleteFeature = useCallback((id)=>{
    setState(p=>({...p,features:p.features.filter(f=>f.id!==id),activeFeatureId:null}));
  },[]);

  const updateFeatureParam = useCallback((fid,key,val)=>{
    setState(p=>({...p,features:p.features.map(f=>f.id===fid?{...f,[key]:val}:f)}));
  },[]);

  const deleteSelectedEntity = useCallback(()=>{
    const s=stateRef.current;
    if(s.mode!=="sketch"||!s.activeSketchId) return;
    setState(p=>{
      const sk=p.features.find(f=>f.id===p.activeSketchId);
      if(!sk) return p;
      const selIds=p.selection.ids;
      const updFeatures=p.features.map(f=>f.id===sk.id?{...f,entities:f.entities.filter(e=>!selIds.includes(e.id))}:f);
      return{...p,features:updFeatures,selection:{type:null,ids:[]}};
    });
  },[]);

  // ─── KEYBOARD ────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const h=e=>{
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      if(e.code==="Escape"){
        setState(p=>({...p,sketchDrawing:false,sketchPts:[],sketchTool:"select"}));
        setDimPopup(null);
      }
      if(e.code==="Delete"||e.code==="Backspace") deleteSelectedEntity();
      if(e.code==="KeyF"&&!e.shiftKey) setState(p=>({...p,sketchTool:"select"}));
      if(e.code==="KeyL") setState(p=>p.mode==="sketch"?{...p,sketchTool:"line"}:p);
      if(e.code==="KeyC") setState(p=>p.mode==="sketch"?{...p,sketchTool:"circle"}:p);
      if(e.code==="KeyR") setState(p=>p.mode==="sketch"?{...p,sketchTool:"rect"}:p);
      if(e.code==="KeyD") setState(p=>p.mode==="sketch"?{...p,sketchTool:"dimension"}:p);
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[deleteSelectedEntity]);

  // ─── VIEW PRESET ─────────────────────────────────────────────────────────────
  const setView = useCallback((v)=>{
    const presets={
      iso:{azimuth:-0.65,elevation:0.5},
      front:{azimuth:0,elevation:0},
      top:{azimuth:0,elevation:Math.PI/2-0.01},
      right:{azimuth:Math.PI/2,elevation:0},
      back:{azimuth:Math.PI,elevation:0},
      left:{azimuth:-Math.PI/2,elevation:0},
    };
    const p=presets[v]||presets.iso;
    camRef.current={...camRef.current,...p,px:0,py:0};
    setCamState({...camRef.current}); draw();
  },[draw]);

  // ─── SELECTED FEATURE PROPS ───────────────────────────────────────────────────
  const activeFeature = state.features.find(f=>f.id===state.activeFeatureId);

  // ─── EXPORT G-CODE ──────────────────────────────────────────────────────────
  const buildGCode = ()=>{
    const lines=["(CAD-PRO EXPORT)","G21 G90 G17 G40 G49","T1 M06","G43 H1","S1500 M03","M08",""];
    let bn=10; const N=()=>`N${bn+=10}`;
    solids.forEach(({solid,feature})=>{
      if(!solid) return;
      lines.push(`(${feature.name})`);
      lines.push(`${N()} G00 Z5.`);
      if(solid.type==="extrude"&&solid.params?.profile) {
        const prof=solid.params.profile;
        lines.push(`${N()} G00 X${prof[0].x.toFixed(3)} Y${prof[0].y.toFixed(3)}`);
        lines.push(`${N()} G01 Z-${solid.params.depth?.toFixed(3)||"25.000"} F80`);
        prof.forEach(p=>lines.push(`${N()} G01 X${p.x.toFixed(3)} Y${p.y.toFixed(3)} F200`));
        lines.push(`${N()} G01 X${prof[0].x.toFixed(3)} Y${prof[0].y.toFixed(3)}`);
      }
      lines.push(`${N()} G00 Z50.`);
    });
    lines.push("","M09","M05","M30");
    return lines.join("\n");
  };

  const exportGCode = ()=>{
    const gcode = buildGCode();
    const blob=new Blob([gcode],{type:"text/plain"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download="cad_export.nc"; a.click();
  };

  const sendToCnc = ()=>{
    if(onSendToCnc) onSendToCnc(buildGCode());
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  const sketchInProgress = state.mode==="sketch";
  const sk = state.features.find(f=>f.id===state.activeSketchId);

  return(<>
    <style>{CSS}</style>
    <div className="cad">

      {/* TOPBAR */}
      <div className="topbar">
        <div className="brand">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke={C.blue2} strokeWidth="1.5"/><rect x="5" y="5" width="6" height="6" rx="1" fill={C.blue2}/></svg>
          CAD·PRO <span style={{fontSize:8,color:"rgba(255,255,255,0.5)",letterSpacing:2}}>v1</span>
        </div>
        {sketchInProgress&&<div className="tseg">
          <span style={{background:C.greenBg,border:`1px solid ${C.green}30`,color:C.green2,padding:"2px 9px",borderRadius:3,fontSize:9,fontWeight:700}}>SKETCH MODE — {sk?.name||""}</span>
          <button className="btn btn-am" style={{padding:"3px 10px",fontSize:9}} onClick={exitSketch}>✓ Exit Sketch</button>
        </div>}
        {!sketchInProgress&&<>
          <div className="tseg"><span className="tlbl">Mode</span><span className="bdg bdg-bl">3D Model</span></div>
          <div className="tseg"><span className="tlbl">Features</span><span className="tval" style={{color:C.blue2}}>{state.features.length}</span></div>
          {state.selection.ids.length>0&&<div className="tseg"><span className="tlbl">Selected</span><span className="bdg bdg-gr">{state.selection.type} × {state.selection.ids.length}</span></div>}
        </>}
        <div style={{flex:1}}/>
        <div className="tseg">
          <button className="btn btn-am" style={{fontSize:9,padding:"3px 10px"}} onClick={exportGCode}>↓ Export G-Code</button>
        </div>
        <button onClick={()=>window.history.back()} style={{margin:"0 10px",padding:"4px 12px",background:"transparent",border:`1px solid ${C.bd}`,borderRadius:5,color:C.txt3,fontSize:11,fontWeight:700,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.color=C.red}
          onMouseLeave={e=>e.currentTarget.style.color=C.txt3}>✕</button>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* LEFT: FEATURE TREE */}
        <div className="panel">
          <div className="tabrow">
            {["tree","sketch"].map(t=><div key={t} className={`tab${leftTab===t?" on":""}`} onClick={()=>setLeftTab(t)}>{t.toUpperCase()}</div>)}
          </div>
          <div className="pscroll">

            {leftTab==="tree"&&<>
              <div className="sec">Feature Tree</div>
              {state.features.map((f,fi)=>{
                const meta=FEATURE_COLORS[f.type]||FEATURE_COLORS.sketch;
                const isActive=f.id===state.activeFeatureId;
                return(
                  <div key={f.id} style={{marginBottom:2}}>
                    <div className={`ftree-item${isActive?" active":""}`}
                      onClick={()=>setState(p=>({...p,activeFeatureId:f.id}))}
                      onDoubleClick={()=>f.type==="sketch"?enterSketch(f.id):setEditingFeature(f.id)}>
                      <div className="ftree-icon" style={{background:meta.bg,color:meta.col}}>{meta.icon}</div>
                      <span className="ftree-name" style={{color:isActive?C.blue2:C.txt}}>{f.name}</span>
                      {f.type==="sketch"&&<button style={{background:"none",border:"none",color:C.txt3,cursor:"pointer",fontSize:9,padding:0}} onClick={e=>{e.stopPropagation();enterSketch(f.id);}}>Edit</button>}
                      <button style={{background:"none",border:"none",color:C.txt3,cursor:"pointer",fontSize:10,padding:0,marginLeft:4}} onClick={e=>{e.stopPropagation();deleteFeature(f.id);}}>✕</button>
                    </div>
                    {isActive&&editingFeature===f.id&&(
                      <div style={{background:C.bg,border:`1px solid ${C.bd}`,borderRadius:4,padding:"8px 10px",margin:"4px 0 4px 22px",fontSize:10}}>
                        {f.type==="extrude"&&<>
                          <div className="field"><div className="lbl">Depth</div>
                            <input type="number" value={f.depth} step={0.1} onChange={e=>updateFeatureParam(f.id,"depth",parseFloat(e.target.value)||1)}/>
                          </div>
                          <div className="field"><div className="lbl">Direction</div>
                            <select value={f.dir} onChange={e=>updateFeatureParam(f.id,"dir",parseInt(e.target.value))}>
                              <option value={1}>Forward</option><option value={-1}>Reverse</option>
                            </select>
                          </div>
                        </>}
                        {f.type==="fillet"&&<div className="field"><div className="lbl">Radius</div><input type="number" value={f.radius} step={0.1} onChange={e=>updateFeatureParam(f.id,"radius",parseFloat(e.target.value)||0.5)}/></div>}
                        {f.type==="chamfer"&&<div className="field"><div className="lbl">Distance</div><input type="number" value={f.dist} step={0.1} onChange={e=>updateFeatureParam(f.id,"dist",parseFloat(e.target.value)||0.5)}/></div>}
                        {f.type==="hole"&&<>
                          <div className="field"><div className="lbl">Diameter</div><input type="number" value={f.dia} step={0.1} onChange={e=>updateFeatureParam(f.id,"dia",parseFloat(e.target.value)||1)}/></div>
                          <div className="field"><div className="lbl">Depth</div><input type="number" value={f.depth} step={0.1} onChange={e=>updateFeatureParam(f.id,"depth",parseFloat(e.target.value)||1)}/></div>
                        </>}
                        <button className="btn btn-rd" style={{fontSize:9,padding:"2px 8px"}} onClick={()=>setEditingFeature(null)}>Close</button>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="div"/>
              <div className="sec">Add Feature</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                {[
                  {type:"sketch",icon:"✏",label:"New Sketch"},
                  {type:"extrude",icon:"⬆",label:"Extrude"},
                  {type:"revolve",icon:"↻",label:"Revolve"},
                  {type:"fillet",icon:"⌒",label:"Fillet"},
                  {type:"chamfer",icon:"∠",label:"Chamfer"},
                  {type:"hole",icon:"○",label:"Hole"},
                  {type:"shell",icon:"⬜",label:"Shell"},
                  {type:"pattern",icon:"⊞",label:"Pattern"},
                ].map(({type,icon,label})=>{
                  const meta=FEATURE_COLORS[type]||FEATURE_COLORS.sketch;
                  return(
                    <button key={type} className="btn" style={{padding:"5px 4px",textAlign:"center",display:"flex",alignItems:"center",gap:5,fontSize:9}}
                      onClick={()=>addFeature(type)}>
                      <span style={{color:meta.col}}>{icon}</span>{label}
                    </button>
                  );
                })}
              </div>
              <div className="div"/>
              <div className="sec">Extrude Options</div>
              <div className="field"><div className="lbl">Depth</div>
                <input type="number" value={extrudeDepth} step={0.1} onChange={e=>setExtrudeDepth(parseFloat(e.target.value)||1)}/>
              </div>
              <div className="sec">Fillet / Chamfer</div>
              <div className="frow">
                <div className="field"><div className="lbl">Fillet R</div><input type="number" value={filletRadius} step={0.1} onChange={e=>setFilletRadius(parseFloat(e.target.value)||0.5)}/></div>
                <div className="field"><div className="lbl">Chamfer D</div><input type="number" value={chamferDist} step={0.1} onChange={e=>setChamferDist(parseFloat(e.target.value)||0.5)}/></div>
              </div>
              <div className="sec">Hole</div>
              <div className="frow">
                <div className="field"><div className="lbl">Ø dia</div><input type="number" value={holeDia} step={0.1} onChange={e=>setHoleDia(parseFloat(e.target.value)||1)}/></div>
                <div className="field"><div className="lbl">Depth</div><input type="number" value={holeDep} step={0.1} onChange={e=>setHoleDep(parseFloat(e.target.value)||1)}/></div>
              </div>
              <select value={holeType} onChange={e=>setHoleType(e.target.value)} style={{marginBottom:6}}>
                <option value="simple">Simple through</option><option value="blind">Blind</option>
                <option value="countersink">Countersink</option><option value="counterbore">Counterbore</option>
              </select>
            </>}

            {leftTab==="sketch"&&sketchInProgress&&sk&&<>
              <div className="sec">Sketch Tools</div>
              {[
                {tool:"select",label:"Select (F)",key:"F"},
                {tool:"line",label:"Line (L)",key:"L"},
                {tool:"arc",label:"Arc (A)",key:"A"},
                {tool:"circle",label:"Circle (C)",key:"C"},
                {tool:"rect",label:"Rectangle (R)",key:"R"},
                {tool:"dimension",label:"Dimension (D)",key:"D"},
              ].map(({tool,label})=>(
                <div key={tool} className={`ftree-item${state.sketchTool===tool?" active":""}`}
                  style={{cursor:"pointer",marginBottom:2}}
                  onClick={()=>setState(p=>({...p,sketchTool:tool,sketchDrawing:false,sketchPts:[]}))}>
                  <span style={{fontWeight:600,fontSize:10}}>{label}</span>
                </div>
              ))}
              <div className="div"/>
              <div className="sec">Constraints</div>
              {[
                {type:"horizontal",label:"Horizontal"},
                {type:"vertical",label:"Vertical"},
                {type:"coincident",label:"Coincident"},
                {type:"tangent",label:"Tangent"},
                {type:"equal",label:"Equal"},
                {type:"parallel",label:"Parallel"},
                {type:"perpendicular",label:"Perpendicular"},
                {type:"midpoint",label:"Midpoint"},
                {type:"symmetric",label:"Symmetric"},
                {type:"fix",label:"Fix Point"},
              ].map(c=>(
                <button key={c.type} className="btn" style={{marginBottom:3,fontSize:9,padding:"3px 8px",width:"100%",textAlign:"left"}}>
                  {c.label}
                </button>
              ))}
              <div className="div"/>
              <div className="sec">Snap ({state.snapMode.grid?"●":"○"} Grid {state.snapMode.points?"●":"○"} Pts)</div>
              <div className="btnrow">
                <button className={`btn${state.snapMode.grid?" btn-bl":""}`} style={{flex:1,fontSize:9}} onClick={()=>setState(p=>({...p,snapMode:{...p.snapMode,grid:!p.snapMode.grid}}))}>Grid</button>
                <button className={`btn${state.snapMode.points?" btn-bl":""}`} style={{flex:1,fontSize:9}} onClick={()=>setState(p=>({...p,snapMode:{...p.snapMode,points:!p.snapMode.points}}))}>Points</button>
                <button className={`btn${state.snapMode.midpoint?" btn-bl":""}`} style={{flex:1,fontSize:9}} onClick={()=>setState(p=>({...p,snapMode:{...p.snapMode,midpoint:!p.snapMode.midpoint}}))}>Mid</button>
              </div>
              <div className="div"/>
              <div className="sec">Entities ({sk.entities.length})</div>
              {sk.entities.map(e=>{
                const isSel=state.selection.ids.includes(e.id);
                return(
                  <div key={e.id} className={`ftree-item${isSel?" active":""}`} style={{marginBottom:2}}
                    onClick={()=>setState(p=>({...p,selection:{type:"sketch",ids:[e.id]}}))}>
                    <span style={{color:C.txt3,fontFamily:"monospace",fontSize:9,minWidth:20}}>{e.id}</span>
                    <span style={{flex:1,fontSize:9}}>{e.type} {e.type==="circle"?`R${e.r?.toFixed(1)}`:e.type==="line"?`(${e.x1?.toFixed(0)},${e.y1?.toFixed(0)})→(${e.x2?.toFixed(0)},${e.y2?.toFixed(0)})`:`(${e.cx?.toFixed(0)},${e.cy?.toFixed(0)})`}</span>
                    <button style={{background:"none",border:"none",color:C.txt3,cursor:"pointer",fontSize:10}} onClick={e2=>{e2.stopPropagation();setState(p=>{const sk=p.features.find(f=>f.id===p.activeSketchId);const updFeatures=p.features.map(f=>f.id===sk.id?{...f,entities:f.entities.filter(ent=>ent.id!==e.id)}:f);return{...p,features:updFeatures};});}}>✕</button>
                  </div>
                );
              })}
              <div className="div"/>
              <div className="sec">Dimensions ({sk.constraints.filter(c=>c.label).length})</div>
              {sk.constraints.filter(c=>c.label).map(c=>(
                <div key={c.id} className="mini" style={{cursor:"pointer"}} onClick={()=>{setState(p=>({...p,editingDimId:c.id}));setDimVal(c.label);}}>
                  <span className="mini-l">{c.type.replace("_dim","").toUpperCase()}</span>
                  <span className="mini-v" style={{color:state.editingDimId===c.id?C.amber:C.txt2}}>{c.label}mm</span>
                </div>
              ))}
              <div className="div"/>
              <button className="btn btn-gr full lg" onClick={exitSketch} style={{marginTop:4}}>✓ Finish Sketch</button>
            </>}

            {leftTab==="sketch"&&!sketchInProgress&&<>
              <div style={{color:C.txt3,fontSize:10,padding:"12px 0",lineHeight:1.8}}>
                No active sketch.<br/>
                Double-click a Sketch in the feature tree, or create a new one.
              </div>
              <button className="btn btn-bl full lg" onClick={()=>addFeature("sketch")}>+ New Sketch</button>
            </>}
          </div>
        </div>

        {/* CENTER: VIEWPORT */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0,minHeight:0}}>
          {/* Mini toolbar */}
          <div className="ctrlbar">
            {sketchInProgress?<>
              {["select","line","arc","circle","rect","dimension"].map(tool=>(
                <button key={tool} className={`btn${state.sketchTool===tool?" btn-bl":""}`} style={{fontSize:10,padding:"3px 8px"}}
                  onClick={()=>setState(p=>({...p,sketchTool:tool,sketchDrawing:false,sketchPts:[]}))}>
                  {tool}
                </button>
              ))}
              <div className="ctrl-div"/>
              <span style={{fontSize:9,color:C.txt3}}>Snap:</span>
              <button className={`btn${state.snapMode.grid?" btn-bl":""}`} style={{fontSize:9,padding:"3px 6px"}} onClick={()=>setState(p=>({...p,snapMode:{...p.snapMode,grid:!p.snapMode.grid}}))}>Grid</button>
              <button className={`btn${state.snapMode.points?" btn-bl":""}`} style={{fontSize:9,padding:"3px 6px"}} onClick={()=>setState(p=>({...p,snapMode:{...p.snapMode,points:!p.snapMode.points}}))}>Pts</button>
              <div style={{flex:1}}/>
              <button className="btn btn-gr" style={{fontSize:10}} onClick={exitSketch}>✓ Finish Sketch</button>
            </>:<>
              <span style={{fontSize:9,color:C.txt3}}>View:</span>
              {["iso","front","top","right","left","back"].map(v=>(
                <button key={v} className="btn" style={{fontSize:9,padding:"3px 6px"}} onClick={()=>setView(v)}>{v}</button>
              ))}
              <div className="ctrl-div"/>
              <span style={{fontSize:9,color:C.txt3}}>Select:</span>
              {["face","edge","solid"].map(t=>(
                <button key={t} className={`btn${state.selection.type===t?" btn-bl":""}`} style={{fontSize:9,padding:"3px 6px"}}
                  onClick={()=>setState(p=>({...p,selection:{type:t,ids:[]}}))}>
                  {t}
                </button>
              ))}
            </>}
          </div>

          <div id="vpWrap" ref={vpRef} style={{flex:1,position:"relative",minHeight:0}}>
            <canvas id="vpCvs" ref={cvsRef}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove}
              onMouseUp={onMouseUp} onContextMenu={onContextMenu}
              style={{cursor:sketchInProgress&&state.sketchTool!=="select"?"crosshair":"default"}}/>

            <div className="vp-hud">
              {sketchInProgress
                ?<>X: <span>{(mousePos.wx||0).toFixed(2)}</span> Y: <span>{(mousePos.wy||0).toFixed(2)}</span>{snapPt&&<><br/>Snap: <span>{snapPt.type}</span></>}</>
                :<>Az: <span>{(camState.azimuth*180/Math.PI).toFixed(0)}°</span> El: <span>{(camState.elevation*180/Math.PI).toFixed(0)}°</span><br/>Zoom: <span>{(camState.zoom||1).toFixed(2)}×</span></>
              }
              <br/>{sketchInProgress?"Left: draw · Right: cancel · Esc: stop":"Left-drag: orbit · Right-drag: pan · Scroll: zoom"}
            </div>

            <div className="vp-toolbar">
              {!sketchInProgress&&["iso","top","front","right"].map(v=>(
                <button key={v} className="vp-btn" onClick={()=>setView(v)}>{v.toUpperCase()}</button>
              ))}
              {sketchInProgress&&<button className="vp-btn on" onClick={exitSketch}>✓ Exit Sketch</button>}
            </div>

            {/* Axis labels */}
            <div className="plane-indicator">
              {sketchInProgress
                ?<><span className="axis-label" style={{color:C.red,borderColor:C.red+"40"}}>X</span>
                  <span className="axis-label" style={{color:C.green,borderColor:C.green+"40"}}>Y</span></>
                :<><span className="axis-label" style={{color:C.red,borderColor:C.red+"40"}}>X</span>
                  <span className="axis-label" style={{color:C.green,borderColor:C.green+"40"}}>Y</span>
                  <span className="axis-label" style={{color:C.blue,borderColor:C.blue+"40"}}>Z</span></>
              }
            </div>

            {/* Sketch bottom toolbar */}
            {sketchInProgress&&<div className="sketch-toolbar">
              {[
                {tool:"select",label:"▶ Select",key:"F"},
                {tool:"line",label:"/ Line",key:"L"},
                {tool:"arc",label:"( Arc",key:"A"},
                {tool:"circle",label:"○ Circle",key:"C"},
                {tool:"rect",label:"□ Rect",key:"R"},
                {tool:"dimension",label:"↔ Dim",key:"D"},
              ].map(({tool,label,key})=>(
                <button key={tool} className={`sktool${state.sketchTool===tool?" on":""}`}
                  onClick={()=>setState(p=>({...p,sketchTool:tool,sketchDrawing:false,sketchPts:[]}))}>
                  {label} <span style={{fontSize:8,color:C.txt3}}>({key})</span>
                </button>
              ))}
              <div style={{width:1,background:C.bd,margin:"0 4px"}}/>
              <button className="sktool" style={{color:C.green2,borderColor:C.green+"30",background:C.greenBg}} onClick={exitSketch}>✓ Done</button>
            </div>}

            {/* Dimension popup */}
            {dimPopup&&<div className="dim-popup" style={{left:dimPopup.sx,top:dimPopup.sy-40}}>
              <span style={{fontSize:9,color:C.txt3,fontFamily:"monospace"}}>{dimPopup.dimType.replace("_dim","").toUpperCase()}:</span>
              <input type="number" value={dimVal} step={0.1} autoFocus
                onChange={e=>setDimVal(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")confirmDim();if(e.key==="Escape"){setDimPopup(null);}}}
                style={{width:70,fontFamily:"'JetBrains Mono',monospace"}}/>
              <span style={{fontSize:9,color:C.txt3}}>mm</span>
              <button className="btn btn-gr" style={{fontSize:9,padding:"2px 6px"}} onClick={confirmDim}>✓</button>
              <button className="btn" style={{fontSize:9,padding:"2px 6px"}} onClick={()=>setDimPopup(null)}>✕</button>
            </div>}
          </div>
        </div>

        {/* RIGHT: PROPERTIES */}
        <div className="panel panel-r">
          <div className="tabrow">
            {["props","measure","materials","export"].map(t=>(
              <div key={t} className={`tab${rightTab===t?" on":""}`} onClick={()=>setRightTab(t)}>{t.toUpperCase()}</div>
            ))}
          </div>
          <div className="pscroll">

            {rightTab==="props"&&<>
              <div className="sec">Active Feature</div>
              {activeFeature?(<>
                <div style={{display:"flex",alignItems:"center",gap:8,background:C.bg,border:`1px solid ${C.bd}`,borderRadius:4,padding:"8px 10px",marginBottom:8}}>
                  <div style={{width:28,height:28,borderRadius:4,background:(FEATURE_COLORS[activeFeature.type]||FEATURE_COLORS.sketch).bg,color:(FEATURE_COLORS[activeFeature.type]||FEATURE_COLORS.sketch).col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>
                    {(FEATURE_COLORS[activeFeature.type]||FEATURE_COLORS.sketch).icon}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:11}}>{activeFeature.name}</div>
                    <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:1}}>{activeFeature.type}</div>
                  </div>
                </div>
                {activeFeature.type==="extrude"&&<>
                  <div className="proprow"><span className="prop-l">Depth</span><span className="prop-v">{activeFeature.depth} mm</span></div>
                  <div className="proprow"><span className="prop-l">Direction</span><span className="prop-v">{activeFeature.dir===1?"Forward":"Reverse"}</span></div>
                  <div className="proprow"><span className="prop-l">Sketch</span><span className="prop-v">{state.features.find(f=>f.id===activeFeature.sketchId)?.name||"—"}</span></div>
                  <div className="div"/>
                  <div className="field"><div className="lbl">Depth</div>
                    <input type="number" value={activeFeature.depth} step={0.1}
                      onChange={e=>updateFeatureParam(activeFeature.id,"depth",parseFloat(e.target.value)||1)}/>
                  </div>
                  <div className="field"><div className="lbl">Direction</div>
                    <select value={activeFeature.dir} onChange={e=>updateFeatureParam(activeFeature.id,"dir",parseInt(e.target.value))}>
                      <option value={1}>Forward (+Z)</option><option value={-1}>Reverse (-Z)</option>
                    </select>
                  </div>
                  <div className="field"><div className="lbl">Sketch</div>
                    <select value={activeFeature.sketchId} onChange={e=>updateFeatureParam(activeFeature.id,"sketchId",parseInt(e.target.value))}>
                      {state.features.filter(f=>f.type==="sketch").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </>}
                {activeFeature.type==="sketch"&&<>
                  <div className="proprow"><span className="prop-l">Plane</span><span className="prop-v">{activeFeature.planeId}</span></div>
                  <div className="proprow"><span className="prop-l">Entities</span><span className="prop-v">{activeFeature.entities.length}</span></div>
                  <div className="proprow"><span className="prop-l">Constraints</span><span className="prop-v">{activeFeature.constraints.length}</span></div>
                  <div className="proprow"><span className="prop-l">Status</span><span className="prop-v" style={{color:C.green2}}>Defined</span></div>
                  <div className="div"/>
                  <div className="field"><div className="lbl">Plane</div>
                    <select value={activeFeature.planeId} onChange={e=>updateFeatureParam(activeFeature.id,"planeId",e.target.value)}>
                      <option value="XY">XY (Top)</option><option value="XZ">XZ (Front)</option><option value="YZ">YZ (Right)</option>
                      <option value="top">Top face</option><option value="front">Front face</option>
                    </select>
                  </div>
                  <button className="btn btn-bl full lg" onClick={()=>enterSketch(activeFeature.id)}>✏ Edit Sketch</button>
                </>}
                {activeFeature.type==="fillet"&&<>
                  <div className="proprow"><span className="prop-l">Radius</span><span className="prop-v">{activeFeature.radius} mm</span></div>
                  <div className="proprow"><span className="prop-l">Edges</span><span className="prop-v">{activeFeature.edgeIds?.length||0}</span></div>
                  <div className="div"/>
                  <div className="field"><div className="lbl">Radius</div>
                    <input type="number" value={activeFeature.radius} step={0.1}
                      onChange={e=>updateFeatureParam(activeFeature.id,"radius",parseFloat(e.target.value)||0.5)}/>
                  </div>
                </>}
                {activeFeature.type==="chamfer"&&<>
                  <div className="proprow"><span className="prop-l">Distance</span><span className="prop-v">{activeFeature.dist} mm</span></div>
                  <div className="proprow"><span className="prop-l">Edges</span><span className="prop-v">{activeFeature.edgeIds?.length||0}</span></div>
                  <div className="div"/>
                  <div className="field"><div className="lbl">Distance</div>
                    <input type="number" value={activeFeature.dist} step={0.1}
                      onChange={e=>updateFeatureParam(activeFeature.id,"dist",parseFloat(e.target.value)||0.5)}/>
                  </div>
                </>}
                {activeFeature.type==="hole"&&<>
                  <div className="proprow"><span className="prop-l">Type</span><span className="prop-v">{activeFeature.holeType}</span></div>
                  <div className="proprow"><span className="prop-l">Diameter</span><span className="prop-v">{activeFeature.dia} mm</span></div>
                  <div className="proprow"><span className="prop-l">Depth</span><span className="prop-v">{activeFeature.depth} mm</span></div>
                  <div className="div"/>
                  <div className="field"><div className="lbl">Type</div>
                    <select value={activeFeature.holeType} onChange={e=>updateFeatureParam(activeFeature.id,"holeType",e.target.value)}>
                      <option value="simple">Simple through</option><option value="blind">Blind</option>
                      <option value="countersink">Countersink</option><option value="counterbore">Counterbore</option>
                    </select>
                  </div>
                  <div className="field"><div className="lbl">Diameter</div>
                    <input type="number" value={activeFeature.dia} step={0.1}
                      onChange={e=>updateFeatureParam(activeFeature.id,"dia",parseFloat(e.target.value)||1)}/>
                  </div>
                  <div className="field"><div className="lbl">Depth</div>
                    <input type="number" value={activeFeature.depth} step={0.1}
                      onChange={e=>updateFeatureParam(activeFeature.id,"depth",parseFloat(e.target.value)||1)}/>
                  </div>
                </>}
                {activeFeature.type==="revolve"&&<>
                  <div className="proprow"><span className="prop-l">Angle</span><span className="prop-v">{(activeFeature.angle*180/Math.PI).toFixed(0)}°</span></div>
                  <div className="proprow"><span className="prop-l">Sketch</span><span className="prop-v">{state.features.find(f=>f.id===activeFeature.sketchId)?.name||"—"}</span></div>
                  <div className="div"/>
                  <div className="field"><div className="lbl">Angle (°)</div>
                    <input type="number" value={(activeFeature.angle*180/Math.PI).toFixed(0)} step={1} min={1} max={360}
                      onChange={e=>updateFeatureParam(activeFeature.id,"angle",parseFloat(e.target.value||360)*Math.PI/180)}/>
                  </div>
                </>}
              </>):<div style={{color:C.txt3,fontSize:10,lineHeight:1.8}}>
                Click a feature in the tree to see its properties.<br/><br/>
                <b style={{color:C.txt2}}>Tip:</b> Double-click to edit inline.
              </div>}

              <div className="div"/>
              <div className="sec">Selection</div>
              {state.selection.ids.length?(<>
                <div className="proprow"><span className="prop-l">Type</span><span className="prop-v">{state.selection.type}</span></div>
                <div className="proprow"><span className="prop-l">Count</span><span className="prop-v">{state.selection.ids.length}</span></div>
                <button className="btn btn-rd full" style={{marginTop:4,fontSize:9}} onClick={()=>setState(p=>({...p,selection:{type:null,ids:[]}}))}>Clear Selection</button>
              </>):<div style={{color:C.txt3,fontSize:9}}>No selection</div>}
            </>}

            {rightTab==="measure"&&<>
              <div className="sec">Measurements</div>
              {solids.map(({solid,featureId,feature})=>{
                if(!solid) return null;
                // Bounding box
                const xs=solid.verts.map(v=>v.x), ys=solid.verts.map(v=>v.y), zs=solid.verts.map(v=>v.z);
                const bbx=[Math.min(...xs),Math.max(...xs)];
                const bby=[Math.min(...ys),Math.max(...ys)];
                const bbz=[Math.min(...zs),Math.max(...zs)];
                const dims={x:bbx[1]-bbx[0],y:bby[1]-bby[0],z:bbz[1]-bbz[0]};
                const vol=dims.x*dims.y*dims.z;
                return(
                  <div key={featureId} style={{background:C.bg,border:`1px solid ${C.bd}`,borderRadius:4,padding:"8px",marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:10,marginBottom:6,color:C.txt}}>{feature.name}</div>
                    <div className="proprow"><span className="prop-l">Width (X)</span><span className="prop-v">{dims.x.toFixed(2)} mm</span></div>
                    <div className="proprow"><span className="prop-l">Height (Y)</span><span className="prop-v">{dims.y.toFixed(2)} mm</span></div>
                    <div className="proprow"><span className="prop-l">Depth (Z)</span><span className="prop-v">{dims.z.toFixed(2)} mm</span></div>
                    <div className="proprow"><span className="prop-l">Volume (est)</span><span className="prop-v">{(vol/1000).toFixed(2)} cm³</span></div>
                    <div className="proprow"><span className="prop-l">Faces</span><span className="prop-v">{solid.faces.length}</span></div>
                    <div className="proprow"><span className="prop-l">Verts</span><span className="prop-v">{solid.verts.length}</span></div>
                  </div>
                );
              })}
              {!solids.length&&<div style={{color:C.txt3,fontSize:9}}>No solids in model</div>}
            </>}

            {rightTab==="materials"&&<>
              <div className="sec">Material</div>
              <div className="field"><div className="lbl">Material</div>
                <select defaultValue="alum6061">
                  <option value="alum6061">Aluminium 6061</option>
                  <option value="alum7075">Aluminium 7075</option>
                  <option value="steel1018">Steel 1018</option>
                  <option value="steel4140">Steel 4140</option>
                  <option value="ss304">Stainless 304</option>
                  <option value="ss316">Stainless 316</option>
                  <option value="brass360">Brass 360</option>
                  <option value="copper">Copper</option>
                  <option value="titanium">Titanium Ti-6Al-4V</option>
                  <option value="abs">ABS Plastic</option>
                  <option value="nylon">Nylon PA66</option>
                  <option value="delrin">Delrin (POM)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="div"/>
              <div className="sec">Physical Properties</div>
              {[
                ["Density","2.70 g/cm³"],["Yield Strength","276 MPa"],["UTS","310 MPa"],
                ["Elastic Modulus","68.9 GPa"],["Poisson Ratio","0.33"],["Hardness","95 HB"],
              ].map(([l,v])=><div key={l} className="proprow"><span className="prop-l">{l}</span><span className="prop-v">{v}</span></div>)}
              <div className="div"/>
              <div className="sec">Machining Properties</div>
              {[
                ["Machinability","Good"],["Cutting Speed","200–400 m/min"],["Feed Rate","0.1–0.3 mm/rev"],
                ["Coolant","Recommended"],
              ].map(([l,v])=><div key={l} className="proprow"><span className="prop-l">{l}</span><span className="prop-v">{v}</span></div>)}
              <div className="div"/>
              <div className="sec">Mass Estimate</div>
              {solids.map(({solid,featureId,feature})=>{
                if(!solid) return null;
                const xs=solid.verts.map(v=>v.x),ys=solid.verts.map(v=>v.y),zs=solid.verts.map(v=>v.z);
                const vol=(Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys))*(Math.max(...zs)-Math.min(...zs))/1000;
                const mass=(vol*2.70).toFixed(1);
                return <div key={featureId} className="proprow"><span className="prop-l">{feature.name}</span><span className="prop-v">{mass} g</span></div>;
              })}
            </>}

            {rightTab==="export"&&<>
              <div className="sec">Export Options</div>
              <div style={{fontSize:10,color:C.txt3,lineHeight:1.7,marginBottom:8}}>Export the CAD model for CNC machining, simulation, or other tools.</div>
              <button className="btn btn-gr full lg" onClick={exportGCode} style={{marginBottom:6}}>↓ Export G-Code (.nc)</button>
              <button className="btn full" style={{marginBottom:6,fontSize:10}} onClick={()=>{
                const d={features:state.features,version:1};
                const b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});
                const a=document.createElement("a");a.href=URL.createObjectURL(b);
                a.download="model.cadpro";a.click();
              }}>↓ Save Model (.cadpro)</button>
              <button className="btn full" style={{marginBottom:6,fontSize:10}} onClick={()=>{
                const fileIn=document.createElement("input");fileIn.type="file";fileIn.accept=".cadpro,.json";
                fileIn.onchange=e=>{
                  const f=e.target.files[0];if(!f)return;
                  const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(d.features)setState(p=>({...p,features:d.features}));}catch{}};r.readAsText(f);
                };fileIn.click();
              }}>↑ Load Model (.cadpro)</button>
              <div className="div"/>
              <div className="sec">G-Code Settings</div>
              <div className="field"><div className="lbl">Units</div><select><option>mm (G21)</option><option>inch (G20)</option></select></div>
              <div className="field"><div className="lbl">Post Processor</div>
                <select><option>Generic Fanuc</option><option>Siemens 840D</option><option>Heidenhain</option><option>Mazatrol</option><option>Haas</option></select>
              </div>
              <div className="field"><div className="lbl">Tolerance</div>
                <select><option>0.01 mm (fine)</option><option>0.05 mm (standard)</option><option>0.1 mm (rough)</option></select>
              </div>
              <div className="div"/>
              <div className="sec">CNC Sim Integration</div>
              <div style={{fontSize:9,color:C.txt3,lineHeight:1.8,marginBottom:6}}>Send G-Code directly to the CNC Simulator to verify the toolpath before machining.</div>
              {onSendToCnc&&<button className="btn btn-bl full" style={{marginBottom:6,fontSize:10}} onClick={sendToCnc}>→ Send to CNC Sim</button>}
              {!onSendToCnc&&<div style={{fontSize:9,color:C.txt3,fontStyle:"italic"}}>Open the CAD+CNC Workspace to enable live send.</div>}
              <div className="div"/>
              <div className="sec">Model Info</div>
              {[
                ["Features",state.features.length],
                ["Solids",solids.length],
                ["Sketches",state.features.filter(f=>f.type==="sketch").length],
              ].map(([l,v])=><div key={l} className="proprow"><span className="prop-l">{l}</span><span className="prop-v">{v}</span></div>)}
            </>}
          </div>
        </div>

      </div>
    </div>
  </>);
}
