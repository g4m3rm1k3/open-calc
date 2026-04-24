// CadPro2.jsx — Professional Parametric CAD  (standalone, not in app router yet)
// R3F + Three.js rendering | BSP-tree CSG | Sketch→Extrude/Cut/Revolve | Assembly+Mates

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport, Grid } from "@react-three/drei";
import * as THREE from "three";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const D = {
  bg:"#07111e", p1:"#0f172a", p2:"#132033", p3:"#1e293b", p4:"#334155",
  bd:"#2b3a55", bd2:"#475569",
  blue:"#63b8ff", blue2:"#94b8ff", blueBg:"rgba(33,102,255,0.10)",
  green:"#46d89f", green2:"#6ee7b7", greenBg:"rgba(70,216,159,0.1)",
  amber:"#f0b44c", amberBg:"rgba(240,180,76,0.1)",
  red:"#ff8b8b", redBg:"rgba(255,139,139,0.1)",
  purple:"#b89cff", teal:"#31d0c4",
  txt:"#e6eefb", txt2:"#90a4c2", txt3:"#61738e",
};

// ─── CSG ENGINE (BSP tree — port of csg.js algorithm) ────────────────────────
const CSG_EPS = 1e-5;
const [COPLANAR, FRONT, BACK, SPANNING] = [0, 1, 2, 3];

class CsgPlane {
  constructor(n, w) { this.n = n.clone(); this.w = w; }
  static fromPts(a, b, c) {
    const n = new THREE.Vector3().crossVectors(
      new THREE.Vector3().subVectors(b, a),
      new THREE.Vector3().subVectors(c, a)
    ).normalize();
    return new CsgPlane(n, n.dot(a));
  }
  clone() { return new CsgPlane(this.n.clone(), this.w); }
  flip() { return new CsgPlane(this.n.clone().negate(), -this.w); }
  classify(v) {
    const d = this.n.dot(v) - this.w;
    return d < -CSG_EPS ? BACK : d > CSG_EPS ? FRONT : COPLANAR;
  }
  split(poly, cf, cb, f, b) {
    let pt = 0;
    const ts = poly.verts.map(v => { const t = this.classify(v.pos); pt |= t; return t; });
    if (pt === COPLANAR) { (this.n.dot(poly.plane.n) > 0 ? cf : cb).push(poly); return; }
    if (pt === FRONT)  { f.push(poly); return; }
    if (pt === BACK)   { b.push(poly); return; }
    const fa = [], ba = [];
    for (let i = 0; i < poly.verts.length; i++) {
      const j = (i + 1) % poly.verts.length;
      const ti = ts[i], tj = ts[j], vi = poly.verts[i], vj = poly.verts[j];
      if (ti !== BACK)  fa.push(vi);
      if (ti !== FRONT) ba.push(vi);
      if ((ti | tj) === SPANNING) {
        const t = (this.w - this.n.dot(vi.pos)) / this.n.dot(new THREE.Vector3().subVectors(vj.pos, vi.pos));
        const sv = { pos: vi.pos.clone().lerp(vj.pos, t), nrm: vi.nrm.clone().lerp(vj.nrm, t).normalize() };
        fa.push(sv); ba.push(sv);
      }
    }
    if (fa.length >= 3) f.push(new CsgPoly(fa));
    if (ba.length >= 3) b.push(new CsgPoly(ba));
  }
}

class CsgPoly {
  constructor(verts) {
    this.verts = verts;
    if (verts.length >= 3) this.plane = CsgPlane.fromPts(verts[0].pos, verts[1].pos, verts[2].pos);
  }
  clone() { return new CsgPoly(this.verts.map(v => ({ pos: v.pos.clone(), nrm: v.nrm.clone() }))); }
  flip() { return new CsgPoly([...this.verts].reverse().map(v => ({ pos: v.pos.clone(), nrm: v.nrm.clone().negate() }))); }
}

class CsgNode {
  constructor(polys) { this.plane = null; this.front = null; this.back = null; this.polys = []; if (polys?.length) this.build(polys); }
  clone() { const n = new CsgNode(); if (this.plane) n.plane = this.plane.clone(); if (this.front) n.front = this.front.clone(); if (this.back) n.back = this.back.clone(); n.polys = this.polys.map(p => p.clone()); return n; }
  invert() { this.polys = this.polys.map(p => p.flip()); if (this.plane) this.plane = this.plane.flip(); if (this.front) this.front.invert(); if (this.back) this.back.invert(); [this.front, this.back] = [this.back, this.front]; }
  clip(polys) { if (!this.plane) return polys.slice(); let f = [], b = []; polys.forEach(p => this.plane.split(p, f, b, f, b)); if (this.front) f = this.front.clip(f); if (this.back) b = this.back.clip(b); else b = []; return [...f, ...b]; }
  clipTo(bsp) { this.polys = bsp.clip(this.polys); if (this.front) this.front.clipTo(bsp); if (this.back) this.back.clipTo(bsp); }
  all() { let p = this.polys.slice(); if (this.front) p = [...p, ...this.front.all()]; if (this.back) p = [...p, ...this.back.all()]; return p; }
  build(polys) {
    if (!polys.length) return;
    if (!this.plane) this.plane = polys[0].plane?.clone();
    if (!this.plane) { this.polys.push(...polys); return; }
    const f = [], b = [];
    polys.forEach(p => this.plane.split(p, this.polys, this.polys, f, b));
    if (f.length) { if (!this.front) this.front = new CsgNode(); this.front.build(f); }
    if (b.length) { if (!this.back)  this.back  = new CsgNode(); this.back.build(b);  }
  }
}

function csgSubtract(pa, pb) {
  const a = new CsgNode(pa.map(p => p.clone())), b = new CsgNode(pb.map(p => p.clone()));
  a.invert(); a.clipTo(b); b.clipTo(a); b.invert(); b.clipTo(a); b.invert(); a.build(b.all()); a.invert();
  return a.all();
}
function csgUnion(pa, pb) {
  const a = new CsgNode(pa.map(p => p.clone())), b = new CsgNode(pb.map(p => p.clone()));
  a.clipTo(b); b.clipTo(a); b.invert(); b.clipTo(a); b.invert(); a.build(b.all());
  return a.all();
}

// ─── GEOM ↔ CSG CONVERSION ───────────────────────────────────────────────────
function geomToPolys(geom) {
  geom.computeVertexNormals();
  const pos = geom.attributes.position.array;
  const nrm = geom.attributes.normal.array;
  const polys = [];
  for (let i = 0; i < pos.length / 9; i++) {
    const verts = [];
    for (let j = 0; j < 3; j++) {
      const k = (i * 3 + j) * 3;
      verts.push({ pos: new THREE.Vector3(pos[k], pos[k+1], pos[k+2]), nrm: new THREE.Vector3(nrm[k], nrm[k+1], nrm[k+2]) });
    }
    const p = new CsgPoly(verts);
    if (p.plane) polys.push(p);
  }
  return polys;
}

function polysToGeom(polys) {
  const pos = [], nrm = [];
  polys.forEach(poly => {
    for (let i = 1; i < poly.verts.length - 1; i++) {
      [poly.verts[0], poly.verts[i], poly.verts[i+1]].forEach(v => {
        pos.push(v.pos.x, v.pos.y, v.pos.z);
        nrm.push(v.nrm.x, v.nrm.y, v.nrm.z);
      });
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal",   new THREE.Float32BufferAttribute(nrm, 3));
  return g;
}

// ─── GEOMETRY BUILDERS ───────────────────────────────────────────────────────
function sketchProfile(entities) {
  const circle = entities.find(e => e.type === "circle");
  if (circle) {
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      pts.push(new THREE.Vector2(circle.cx + circle.r * Math.cos(a), circle.cy + circle.r * Math.sin(a)));
    }
    return pts;
  }
  const lines = entities.filter(e => e.type === "line");
  if (lines.length < 3) return null;
  const EPS = 0.5;
  const eq = (a, b) => Math.abs(a.x-b.x) < EPS && Math.abs(a.y-b.y) < EPS;
  const used = new Set();
  const loop = [{ x: lines[0].x1, y: lines[0].y1 }];
  used.add(0);
  let cur = { x: lines[0].x2, y: lines[0].y2 };
  for (let iter = 0; iter < lines.length * 2; iter++) {
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (used.has(i)) continue;
      const l = lines[i];
      if (eq(cur, {x:l.x1,y:l.y1})) { loop.push({x:l.x1,y:l.y1}); cur={x:l.x2,y:l.y2}; used.add(i); found=true; break; }
      if (eq(cur, {x:l.x2,y:l.y2})) { loop.push({x:l.x2,y:l.y2}); cur={x:l.x1,y:l.y1}; used.add(i); found=true; break; }
    }
    if (!found || eq(cur, loop[0])) break;
  }
  return loop.length >= 3 ? loop.map(p => new THREE.Vector2(p.x, p.y)) : null;
}

const PLANE_MAT = {
  XY: new THREE.Matrix4(),
  XZ: new THREE.Matrix4().makeRotationX(-Math.PI / 2),
  YZ: new THREE.Matrix4().makeRotationY( Math.PI / 2),
};

function extrudePolys(profile2D, depth, planeMat) {
  if (!profile2D?.length) return null;
  const shape = new THREE.Shape(profile2D);
  const geom  = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  if (planeMat) geom.applyMatrix4(planeMat);
  geom.computeVertexNormals();
  return geomToPolys(geom);
}

function revolvePolys(profile2D, angleDeg, segs) {
  if (!profile2D?.length) return null;
  const pts  = profile2D.map(p => new THREE.Vector2(Math.abs(p.x), p.y));
  const geom = new THREE.LatheGeometry(pts, segs ?? 48, 0, (angleDeg ?? 360) * Math.PI / 180);
  geom.computeVertexNormals();
  return geomToPolys(geom);
}

function cylinderPolys(r, h, cx, cz) {
  const geom = new THREE.CylinderGeometry(r, r, h + 2, 32, 1);
  geom.applyMatrix4(new THREE.Matrix4().makeTranslation(cx ?? 0, h / 2, cz ?? 0));
  geom.computeVertexNormals();
  return geomToPolys(geom);
}

// ─── FEATURE EVALUATOR ───────────────────────────────────────────────────────
function evaluateFeatures(features) {
  let polys = null;
  for (const f of features) {
    if (f.suppressed) continue;

    if (f.type === "extrude_boss" || f.type === "extrude") {
      const sk = features.find(s => s.id === f.sketchId && s.type === "sketch");
      if (!sk) continue;
      const prof = sketchProfile(sk.entities);
      if (!prof) continue;
      const mat = f.planeOverride ? PLANE_MAT[f.planeOverride] : (PLANE_MAT[sk.planeId] ?? PLANE_MAT.XY);
      const np = extrudePolys(prof, f.depth ?? 20, mat);
      if (!np) continue;
      polys = polys ? csgUnion(polys, np) : np;
    }

    else if (f.type === "extrude_cut") {
      if (!polys) continue;
      const sk = features.find(s => s.id === f.sketchId && s.type === "sketch");
      if (!sk) continue;
      const prof = sketchProfile(sk.entities);
      if (!prof) continue;
      const baseMat = PLANE_MAT[sk.planeId] ?? PLANE_MAT.XY;
      // offset -0.1 to ensure clean cut through solid
      const mat = baseMat.clone().premultiply(new THREE.Matrix4().makeTranslation(0, 0, -0.1));
      const depth = (f.depth ?? 100) + 0.2;
      const np = extrudePolys(prof, depth, mat);
      if (!np) continue;
      polys = csgSubtract(polys, np);
    }

    else if (f.type === "revolve") {
      const sk = features.find(s => s.id === f.sketchId && s.type === "sketch");
      if (!sk) continue;
      const prof = sketchProfile(sk.entities);
      if (!prof) continue;
      const np = revolvePolys(prof, f.angle ?? 360, f.segs ?? 48);
      if (!np) continue;
      polys = polys ? csgUnion(polys, np) : np;
    }

    else if (f.type === "hole") {
      if (!polys) continue;
      const np = cylinderPolys(f.dia / 2, f.depth ?? 100, f.cx ?? 0, f.cz ?? 0);
      polys = csgSubtract(polys, np);
    }
  }
  return polys ? polysToGeom(polys) : null;
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
let _uid = 100;
const uid = () => ++_uid;

const makePart = (name, features, color) => ({ id: uid(), name, features, color: color ?? "#63b8ff" });

const DEMO_PART = makePart("Base Block", [
  { id:1, type:"sketch", name:"Sketch1", planeId:"XZ", entities:[
    {id:10,type:"line",x1:-30,y1:-20,x2:30,y2:-20},
    {id:11,type:"line",x1:30,y1:-20,x2:30,y2:20},
    {id:12,type:"line",x1:30,y1:20,x2:-30,y2:20},
    {id:13,type:"line",x1:-30,y1:20,x2:-30,y2:-20},
  ], constraints:[] },
  { id:2, type:"extrude", name:"Extrude1", sketchId:1, depth:25 },
  { id:3, type:"sketch", name:"Sketch2", planeId:"XZ", entities:[
    {id:20,type:"circle",cx:0,cy:0,r:8},
  ], constraints:[] },
  { id:4, type:"extrude_cut", name:"Cut1", sketchId:3, depth:30,
    planeOverride: null },
], "#63b8ff");

const DEMO_PART2 = makePart("Cylinder", [
  { id:5, type:"sketch", name:"Sketch1", planeId:"XZ", entities:[
    {id:30,type:"circle",cx:0,cy:0,r:12},
  ], constraints:[] },
  { id:6, type:"extrude", name:"Extrude1", sketchId:5, depth:40 },
  { id:7, type:"sketch", name:"Sketch2", planeId:"XZ", entities:[
    {id:40,type:"circle",cx:0,cy:0,r:5},
  ], constraints:[] },
  { id:8, type:"extrude_cut", name:"Cut1", sketchId:7, depth:50 },
], "#46d89f");

const initState = () => ({
  docType: "part",          // "part" | "assembly"
  activePart: DEMO_PART,    // single-part editing

  // Assembly
  parts: [DEMO_PART, DEMO_PART2],
  instances: [
    { id:uid(), partId: DEMO_PART.id,  name:"Block<1>",    pos:[0,0,0],    rot:[0,0,0] },
    { id:uid(), partId: DEMO_PART2.id, name:"Cylinder<1>", pos:[50,0,0],   rot:[0,0,0] },
  ],
  mates: [],
  activeInstanceId: null,

  // 3D / Sketch mode
  mode: "3d",
  activeFeatureId: null,
  activeSketchId: null,
  sketchTool: "select",
  sketchDrawing: false,
  sketchPts: [],
  selection: { type: null, ids: [] },
  hoveredFaceNormal: null,
});

// ─── FEATURE META ─────────────────────────────────────────────────────────────
const FMETA = {
  sketch:      { icon:"✏", col:"#63b8ff", bg:"rgba(99,184,255,0.12)" },
  extrude:     { icon:"⬆", col:"#46d89f", bg:"rgba(70,216,159,0.12)" },
  extrude_boss:{ icon:"⬆", col:"#46d89f", bg:"rgba(70,216,159,0.12)" },
  extrude_cut: { icon:"⬇", col:"#ff8b8b", bg:"rgba(255,139,139,0.12)" },
  revolve:     { icon:"↻", col:"#b89cff", bg:"rgba(184,156,255,0.12)" },
  fillet:      { icon:"⌒", col:"#f0b44c", bg:"rgba(240,180,76,0.12)" },
  chamfer:     { icon:"∠", col:"#f0b44c", bg:"rgba(240,180,76,0.12)" },
  hole:        { icon:"○", col:"#ff8b8b", bg:"rgba(255,139,139,0.12)" },
  shell:       { icon:"⬜", col:"#31d0c4", bg:"rgba(49,208,196,0.12)" },
  pattern:     { icon:"⊞", col:"#f0b44c", bg:"rgba(240,180,76,0.12)" },
  mirror:      { icon:"⇌", col:"#b89cff", bg:"rgba(184,156,255,0.12)" },
};

// ─── R3F: SOLID MESH ─────────────────────────────────────────────────────────
function SolidMesh({ features, color, selected, onClick }) {
  const geom = useMemo(() => evaluateFeatures(features), [features]);
  const meshRef = useRef();

  if (!geom) return null;
  return (
    <mesh ref={meshRef} geometry={geom} onClick={onClick} castShadow receiveShadow>
      <meshStandardMaterial
        color={selected ? "#94b8ff" : color ?? "#63b8ff"}
        metalness={0.25}
        roughness={0.45}
        envMapIntensity={0.8}
      />
    </mesh>
  );
}

// Edges wireframe overlay
function SolidEdges({ features, visible }) {
  const geom = useMemo(() => {
    const g = evaluateFeatures(features);
    if (!g) return null;
    return new THREE.EdgesGeometry(g, 15);
  }, [features]);
  if (!geom || !visible) return null;
  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color="#94b8ff" linewidth={1} />
    </lineSegments>
  );
}

// ─── R3F: SKETCH PLANE INDICATOR ─────────────────────────────────────────────
function SketchPlaneIndicator({ planeId }) {
  const mat = PLANE_MAT[planeId] ?? PLANE_MAT.XY;
  const euler = new THREE.Euler().setFromRotationMatrix(mat);
  return (
    <mesh rotation={euler} position={[0, 0.01, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial color="#63b8ff" transparent opacity={0.04} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── R3F: SCENE ──────────────────────────────────────────────────────────────
function Scene({ state, dispatch }) {
  const orbitRef = useRef();
  const { camera } = useThree();

  const setStdView = useCallback((view) => {
    const d = 200;
    const views = {
      iso:    [d*0.7, d*0.7, d*0.7],
      front:  [0, 0, d],
      back:   [0, 0, -d],
      top:    [0, d, 0],
      bottom: [0, -d, 0],
      right:  [d, 0, 0],
      left:   [-d, 0, 0],
    };
    const p = views[view] ?? views.iso;
    camera.position.set(...p);
    camera.lookAt(0, 0, 0);
    if (orbitRef.current) orbitRef.current.target.set(0, 0, 0);
  }, [camera]);

  // Expose setStdView via dispatch
  useEffect(() => { dispatch({ type: "SET_VIEW_FN", fn: setStdView }); }, [setStdView]);

  const sketchMode = state.mode === "sketch";
  const activeSk = state.activePart?.features.find(f => f.id === state.activeSketchId && f.type === "sketch");

  return (
    <>
      <color attach="background" args={["#0B1424"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 150, 100]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-80, 50, -60]} intensity={0.4} color="#aaccff" />
      <hemisphereLight args={["#1a3a5c", "#0a1020", 0.6]} />

      <Grid
        args={[400, 400]}
        cellSize={10}
        cellThickness={0.5}
        cellColor="#1e3040"
        sectionSize={50}
        sectionThickness={1}
        sectionColor="#2a4060"
        fadeDistance={600}
        position={[0, -0.1, 0]}
      />

      {/* Origin axes */}
      <arrowHelper args={[new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 40, 0xff4444, 5, 3]} />
      <arrowHelper args={[new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 40, 0x44ff44, 5, 3]} />
      <arrowHelper args={[new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 40, 0x4444ff, 5, 3]} />

      {state.docType === "part" && state.activePart && (
        <>
          <SolidMesh
            features={state.activePart.features}
            color={state.activePart.color}
            selected={false}
            onClick={(e) => { e.stopPropagation(); dispatch({ type:"SELECT_FACE", normal: e.face?.normal }); }}
          />
          <SolidEdges features={state.activePart.features} visible={!sketchMode} />
          {sketchMode && activeSk && <SketchPlaneIndicator planeId={activeSk.planeId} />}
        </>
      )}

      {state.docType === "assembly" && state.instances.map(inst => {
        const part = state.parts.find(p => p.id === inst.partId);
        if (!part) return null;
        return (
          <group key={inst.id} position={inst.pos} rotation={inst.rot}>
            <SolidMesh
              features={part.features}
              color={part.color}
              selected={state.activeInstanceId === inst.id}
              onClick={(e) => { e.stopPropagation(); dispatch({ type:"SELECT_INSTANCE", id: inst.id }); }}
            />
            <SolidEdges features={part.features} visible={true} />
          </group>
        );
      })}

      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.08}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={["#ff4444","#44ff44","#4444ff"]} labelColor="white" />
      </GizmoHelper>
    </>
  );
}

// ─── SKETCH CANVAS OVERLAY ───────────────────────────────────────────────────
function SketchOverlay({ state, dispatch }) {
  const cvsRef  = useRef(null);
  const contRef = useRef(null);
  const scaleRef = useRef(3);   // px per mm
  const panRef  = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ on: false, lx: 0, ly: 0, btn: 0 });
  const ptRef   = useRef(null); // live mouse point

  const sk = state.activePart?.features.find(f => f.id === state.activeSketchId && f.type === "sketch");

  const w2s = useCallback((wx, wy) => {
    const cvs = cvsRef.current; if (!cvs) return {sx:0,sy:0};
    return { sx: cvs.width/2 + panRef.current.x + wx * scaleRef.current,
             sy: cvs.height/2 - panRef.current.y - wy * scaleRef.current };
  }, []);

  const s2w = useCallback((sx, sy) => {
    const cvs = cvsRef.current; if (!cvs) return {wx:0,wy:0};
    const wx = (sx - cvs.width/2  - panRef.current.x) / scaleRef.current;
    const wy = -(sy - cvs.height/2 + panRef.current.y) / scaleRef.current;
    const gsnap = 5;
    return { wx: Math.round(wx/gsnap)*gsnap, wy: Math.round(wy/gsnap)*gsnap };
  }, []);

  const draw = useCallback(() => {
    const cvs = cvsRef.current; if (!cvs || !sk) return;
    const ctx = cvs.getContext("2d");
    const W = cvs.width, H = cvs.height;
    ctx.fillStyle = "#0B1828"; ctx.fillRect(0,0,W,H);

    // Grid
    const step = 10 * scaleRef.current;
    const ox = W/2 + panRef.current.x, oy = H/2 - panRef.current.y;
    ctx.strokeStyle = "#131c28"; ctx.lineWidth = 0.5;
    for (let x = (ox % step) - step; x < W + step; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = (oy % step) - step; y < H + step; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // Major grid (50mm)
    const mstep = 50 * scaleRef.current;
    ctx.strokeStyle = "#1e3040"; ctx.lineWidth = 1;
    for (let x = (ox % mstep) - mstep; x < W + mstep; x += mstep) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for (let y = (oy % mstep) - mstep; y < H + mstep; y += mstep) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }
    // Origin cross
    ctx.strokeStyle = "#2a5080"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ox-20,oy); ctx.lineTo(ox+20,oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox,oy-20); ctx.lineTo(ox,oy+20); ctx.stroke();
    ctx.fillStyle = D.blue; ctx.font = "bold 10px system-ui";
    ctx.fillText("X", ox+22, oy+4); ctx.fillText("Y", ox+4, oy-22);

    // Entities
    sk.entities.forEach(e => {
      ctx.strokeStyle = D.blue; ctx.lineWidth = 1.5; ctx.setLineDash([]);
      if (e.type === "line") {
        const a = w2s(e.x1, e.y1), b = w2s(e.x2, e.y2);
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
        // Endpoint dots
        [a,b].forEach(p => { ctx.fillStyle = D.blue; ctx.beginPath(); ctx.arc(p.sx,p.sy,3,0,Math.PI*2); ctx.fill(); });
      }
      if (e.type === "circle") {
        const c = w2s(e.cx, e.cy);
        const er = w2s(e.cx + e.r, e.cy);
        const sr = Math.sqrt((er.sx-c.sx)**2+(er.sy-c.sy)**2);
        ctx.strokeStyle = D.purple; ctx.beginPath(); ctx.arc(c.sx,c.sy,sr,0,Math.PI*2); ctx.stroke();
        ctx.fillStyle = D.purple; ctx.beginPath(); ctx.arc(c.sx,c.sy,3,0,Math.PI*2); ctx.fill();
      }
      if (e.type === "arc") {
        const c = w2s(e.cx, e.cy);
        const er = w2s(e.cx + e.r, e.cy);
        const sr = Math.sqrt((er.sx-c.sx)**2+(er.sy-c.sy)**2);
        ctx.strokeStyle = D.purple; ctx.beginPath();
        ctx.arc(c.sx, c.sy, sr, -e.startAngle, -e.endAngle, true); ctx.stroke();
      }
    });

    // Live preview while drawing
    const tool = state.sketchTool;
    const pt   = ptRef.current;
    if (state.sketchDrawing && state.sketchPts.length && pt) {
      const p0 = state.sketchPts[0];
      const s0 = w2s(p0.x, p0.y);
      ctx.strokeStyle = D.amber; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
      if (tool === "line") {
        const sp = w2s(pt.wx, pt.wy);
        ctx.beginPath(); ctx.moveTo(s0.sx, s0.sy); ctx.lineTo(sp.sx, sp.sy); ctx.stroke();
      }
      if (tool === "circle") {
        const r = Math.sqrt((pt.wx-p0.x)**2+(pt.wy-p0.y)**2);
        const sr = r * scaleRef.current;
        ctx.beginPath(); ctx.arc(s0.sx, s0.sy, sr, 0, Math.PI*2); ctx.stroke();
      }
      if (tool === "rect") {
        const sp = w2s(pt.wx, pt.wy);
        ctx.beginPath(); ctx.rect(s0.sx, s0.sy, sp.sx-s0.sx, sp.sy-s0.sy); ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Snap dot
    if (pt) {
      const sp = w2s(pt.wx, pt.wy);
      ctx.strokeStyle = D.amber; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sp.sx-6,sp.sy); ctx.lineTo(sp.sx+6,sp.sy);
      ctx.moveTo(sp.sx,sp.sy-6); ctx.lineTo(sp.sx,sp.sy+6);
      ctx.stroke();
    }
  }, [sk, state.sketchDrawing, state.sketchPts, state.sketchTool, w2s]);

  useEffect(() => {
    const cvs = cvsRef.current; if (!cvs) return;
    const cont = contRef.current;
    const ro = new ResizeObserver(() => {
      cvs.width  = cont.offsetWidth;
      cvs.height = cont.offsetHeight;
      draw();
    });
    ro.observe(cont);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => { draw(); }, [draw, sk, state]);

  const onMouseMove = useCallback(e => {
    const rect = cvsRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const wpt = s2w(sx, sy);
    ptRef.current = wpt;
    if (dragRef.current.on && dragRef.current.btn !== 0) {
      panRef.current.x += e.clientX - dragRef.current.lx;
      panRef.current.y -= e.clientY - dragRef.current.ly;
      dragRef.current.lx = e.clientX; dragRef.current.ly = e.clientY;
    }
    draw();
  }, [s2w, draw]);

  const onMouseDown = useCallback(e => {
    dragRef.current = { on: true, btn: e.button, lx: e.clientX, ly: e.clientY };
    if (e.button !== 0) return;
    const rect = cvsRef.current.getBoundingClientRect();
    const pt = s2w(e.clientX - rect.left, e.clientY - rect.top);
    const tool = state.sketchTool;

    if (tool === "select") return;

    if (!state.sketchDrawing) {
      dispatch({ type:"SK_START", pt });
    } else {
      const p0 = state.sketchPts[0];
      if (tool === "line") {
        dispatch({ type:"SK_ADD_LINE", x1:p0.x, y1:p0.y, x2:pt.wx, y2:pt.wy });
        dispatch({ type:"SK_START", pt: {wx:pt.wx, wy:pt.wy} });
      } else if (tool === "circle") {
        const r = Math.sqrt((pt.wx-p0.x)**2+(pt.wy-p0.y)**2);
        dispatch({ type:"SK_ADD_CIRCLE", cx:p0.x, cy:p0.y, r: Math.max(1,r) });
        dispatch({ type:"SK_STOP" });
      } else if (tool === "rect") {
        const x1=p0.x, y1=p0.y, x2=pt.wx, y2=pt.wy;
        dispatch({ type:"SK_ADD_RECT", x1,y1,x2,y2 });
        dispatch({ type:"SK_STOP" });
      }
    }
  }, [state.sketchTool, state.sketchDrawing, state.sketchPts, s2w, dispatch]);

  const onMouseUp   = useCallback(() => { dragRef.current.on = false; }, []);
  const onWheel     = useCallback(e => { scaleRef.current = Math.max(0.5, Math.min(30, scaleRef.current * (e.deltaY < 0 ? 1.1 : 0.9))); draw(); }, [draw]);
  const onDblClick  = useCallback(() => { if (state.sketchTool === "line") dispatch({ type:"SK_STOP" }); }, [state.sketchTool, dispatch]);
  const onKeyDown   = useCallback(e => { if (e.key === "Escape") dispatch({ type:"SK_STOP" }); }, [dispatch]);

  if (state.mode !== "sketch") return null;

  return (
    <div ref={contRef} style={{ position:"absolute", inset:0, zIndex:10 }}
      tabIndex={0} onKeyDown={onKeyDown}>
      <canvas ref={cvsRef}
        onMouseMove={onMouseMove} onMouseDown={onMouseDown}
        onMouseUp={onMouseUp} onWheel={onWheel} onDoubleClick={onDblClick}
        style={{ display:"block", width:"100%", height:"100%", cursor: state.sketchTool === "select" ? "default" : "crosshair" }} />
    </div>
  );
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────
let _viewFn = null;

function reducer(state, action) {
  switch (action.type) {
    case "SET_VIEW_FN": { _viewFn = action.fn; return state; }

    case "SET_DOC_TYPE": return { ...state, docType: action.docType };

    case "SET_ACTIVE_FEATURE": return { ...state, activeFeatureId: action.id };

    case "SELECT_FACE": return { ...state, selection: { type:"face", ids:[], normal: action.normal } };

    case "SELECT_INSTANCE": return { ...state, activeInstanceId: action.id };

    case "ENTER_SKETCH": {
      const sk = state.activePart?.features.find(f => f.id === action.id && f.type === "sketch");
      if (!sk) return state;
      return { ...state, mode:"sketch", activeSketchId: action.id, sketchTool:"select", sketchDrawing:false, sketchPts:[] };
    }

    case "EXIT_SKETCH":
      return { ...state, mode:"3d", activeSketchId:null, sketchDrawing:false, sketchPts:[] };

    case "SET_SKETCH_TOOL":
      return { ...state, sketchTool: action.tool, sketchDrawing:false, sketchPts:[] };

    case "SK_START":
      return { ...state, sketchDrawing:true, sketchPts:[{ x: action.pt.wx, y: action.pt.wy }] };

    case "SK_STOP":
      return { ...state, sketchDrawing:false, sketchPts:[] };

    case "SK_ADD_LINE": {
      const part = state.activePart;
      const features = part.features.map(f =>
        f.id === state.activeSketchId
          ? { ...f, entities:[...f.entities, { id:uid(), type:"line", x1:action.x1, y1:action.y1, x2:action.x2, y2:action.y2 }] }
          : f
      );
      return { ...state, activePart:{ ...part, features } };
    }

    case "SK_ADD_CIRCLE": {
      const part = state.activePart;
      const features = part.features.map(f =>
        f.id === state.activeSketchId
          ? { ...f, entities:[...f.entities, { id:uid(), type:"circle", cx:action.cx, cy:action.cy, r:action.r }] }
          : f
      );
      return { ...state, activePart:{ ...part, features } };
    }

    case "SK_ADD_RECT": {
      const { x1,y1,x2,y2 } = action;
      const lines = [
        { id:uid(), type:"line", x1, y1, x2, y2:y1 },
        { id:uid(), type:"line", x1:x2, y1, x2, y2 },
        { id:uid(), type:"line", x1:x2, y1:y2, x2, y2 },
        { id:uid(), type:"line", x1, y1:y2, x2:x1, y2 },
      ];
      const part = state.activePart;
      const features = part.features.map(f =>
        f.id === state.activeSketchId
          ? { ...f, entities:[...f.entities, ...lines] }
          : f
      );
      return { ...state, activePart:{ ...part, features } };
    }

    case "ADD_FEATURE": {
      const part = state.activePart;
      const f = action.feature;
      return { ...state, activePart:{ ...part, features:[...part.features, f] }, activeFeatureId: f.id };
    }

    case "DELETE_FEATURE": {
      const part = state.activePart;
      return { ...state, activePart:{ ...part, features: part.features.filter(f => f.id !== action.id) } };
    }

    case "UPDATE_FEATURE_PARAM": {
      const part = state.activePart;
      const features = part.features.map(f =>
        f.id === action.id ? { ...f, [action.key]: action.val } : f
      );
      return { ...state, activePart:{ ...part, features } };
    }

    case "TOGGLE_SUPPRESSED": {
      const part = state.activePart;
      const features = part.features.map(f =>
        f.id === action.id ? { ...f, suppressed: !f.suppressed } : f
      );
      return { ...state, activePart:{ ...part, features } };
    }

    case "CLEAR_SKETCH_ENTITIES": {
      const part = state.activePart;
      const features = part.features.map(f =>
        f.id === action.id ? { ...f, entities:[] } : f
      );
      return { ...state, activePart:{ ...part, features } };
    }

    case "ADD_SKETCH": {
      const part = state.activePart;
      const newSk = { id:uid(), type:"sketch", name:`Sketch${part.features.filter(f=>f.type==="sketch").length+1}`,
        planeId: action.planeId ?? "XZ", entities:[], constraints:[] };
      return { ...state, activePart:{ ...part, features:[...part.features, newSk] },
        mode:"sketch", activeSketchId: newSk.id, activeFeatureId: newSk.id, sketchTool:"line", sketchDrawing:false, sketchPts:[] };
    }

    case "ADD_EXTRUDE": {
      const sketchId = state.activeSketchId ?? state.activePart?.features.slice().reverse().find(f=>f.type==="sketch")?.id;
      if (!sketchId) return state;
      const f = { id:uid(), type: action.cut ? "extrude_cut" : "extrude", name: action.cut ? `Cut${uid()}` : `Extrude${uid()}`, sketchId, depth: action.depth ?? 20 };
      const part = state.activePart;
      return { ...state, activePart:{ ...part, features:[...part.features, f] }, activeFeatureId: f.id };
    }

    case "ADD_REVOLVE": {
      const sketchId = state.activeSketchId ?? state.activePart?.features.slice().reverse().find(f=>f.type==="sketch")?.id;
      if (!sketchId) return state;
      const f = { id:uid(), type:"revolve", name:`Revolve${uid()}`, sketchId, angle: action.angle ?? 360 };
      const part = state.activePart;
      return { ...state, activePart:{ ...part, features:[...part.features, f] }, activeFeatureId: f.id };
    }

    case "ADD_HOLE": {
      const f = { id:uid(), type:"hole", name:`Hole${uid()}`, dia: action.dia ?? 10, depth: action.depth ?? 50, cx: action.cx ?? 0, cz: action.cz ?? 0 };
      const part = state.activePart;
      return { ...state, activePart:{ ...part, features:[...part.features, f] }, activeFeatureId: f.id };
    }

    case "ADD_MATE": {
      return { ...state, mates:[...state.mates, { id:uid(), ...action.mate }] };
    }

    case "MOVE_INSTANCE": {
      const instances = state.instances.map(i =>
        i.id === action.id ? { ...i, pos: action.pos } : i
      );
      return { ...state, instances };
    }

    case "SWITCH_PART": {
      const part = state.parts.find(p => p.id === action.id);
      if (!part) return state;
      return { ...state, activePart: part };
    }

    case "RENAME_FEATURE": {
      const part = state.activePart;
      const features = part.features.map(f => f.id === action.id ? { ...f, name: action.name } : f);
      return { ...state, activePart:{ ...part, features } };
    }

    default: return state;
  }
}

// ─── PANELS ──────────────────────────────────────────────────────────────────
function Btn({ children, onClick, color, small, style }) {
  const [hov, setHov] = useState(false);
  const c = color ?? D.blue;
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background: hov ? `${c}22` : "transparent", border:`1px solid ${hov?c:D.bd}`,
        color: hov ? c : D.txt2, borderRadius:3, padding: small ? "2px 7px" : "4px 10px",
        fontSize: small ? 9 : 10, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
        transition:"all 0.15s", ...style }}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
      <div style={{ fontSize:9, color:D.txt3, width:70, flexShrink:0 }}>{label}</div>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  );
}

function Inp({ value, onChange, type, step, min, style }) {
  return (
    <input type={type ?? "text"} value={value} step={step} min={min}
      onChange={e => onChange(type==="number" ? parseFloat(e.target.value)||0 : e.target.value)}
      style={{ width:"100%", background:D.bg, border:`1px solid ${D.bd}`, color:D.txt,
        borderRadius:3, padding:"3px 6px", fontSize:10, fontFamily:"'JetBrains Mono',monospace", ...style }} />
  );
}

function Sel({ value, onChange, opts }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", background:D.bg, border:`1px solid ${D.bd}`, color:D.txt,
        borderRadius:3, padding:"3px 6px", fontSize:10, fontFamily:"inherit" }}>
      {opts.map(o => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
    </select>
  );
}

function PropRow({ label, value, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"3px 8px",
      borderBottom:`1px solid ${D.bd}22`, fontSize:10 }}>
      <span style={{ color:D.txt3 }}>{label}</span>
      <span style={{ color: color ?? D.txt2, fontFamily:"'JetBrains Mono',monospace" }}>{value}</span>
    </div>
  );
}

function FeatureTreePanel({ state, dispatch }) {
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const features = state.activePart?.features ?? [];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Part selector */}
      {state.docType === "part" && state.parts.length > 1 && (
        <div style={{ padding:"4px 8px", borderBottom:`1px solid ${D.bd}`, fontSize:9, color:D.txt3 }}>
          {state.parts.map(p => (
            <button key={p.id} onClick={() => dispatch({ type:"SWITCH_PART", id:p.id })}
              style={{ marginRight:4, padding:"2px 7px", background: state.activePart?.id===p.id ? D.blueBg : "transparent",
                border:`1px solid ${state.activePart?.id===p.id ? D.blue : D.bd}`,
                color: state.activePart?.id===p.id ? D.blue2 : D.txt3,
                borderRadius:3, fontSize:9, cursor:"pointer" }}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto", padding:"4px 0" }}>
        {features.map(f => {
          const meta = FMETA[f.type] ?? FMETA.sketch;
          const isActive = f.id === state.activeFeatureId;
          const isSk = f.id === state.activeSketchId;
          return (
            <div key={f.id}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 8px",
                background: isActive ? D.blueBg : "transparent",
                borderLeft:`2px solid ${isActive ? D.blue : "transparent"}`,
                opacity: f.suppressed ? 0.4 : 1, cursor:"pointer" }}
              onClick={() => dispatch({ type:"SET_ACTIVE_FEATURE", id:f.id })}>
              <div style={{ width:18, height:18, borderRadius:3, background:meta.bg,
                color:meta.col, display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, flexShrink:0 }}>
                {meta.icon}
              </div>
              {renaming === f.id ? (
                <input autoFocus value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  onBlur={() => { dispatch({ type:"RENAME_FEATURE", id:f.id, name:renameVal }); setRenaming(null); }}
                  onKeyDown={e => { if(e.key==="Enter"||e.key==="Escape"){dispatch({type:"RENAME_FEATURE",id:f.id,name:renameVal});setRenaming(null);}}}
                  style={{ flex:1, background:"transparent", border:`1px solid ${D.blue}`,
                    color:D.txt, fontSize:10, borderRadius:2, padding:"1px 4px" }} />
              ) : (
                <span style={{ flex:1, fontSize:10, color: isActive ? D.blue2 : D.txt,
                  textDecoration: f.suppressed ? "line-through" : "none" }}
                  onDoubleClick={() => { if(f.type==="sketch") dispatch({type:"ENTER_SKETCH",id:f.id}); else { setRenaming(f.id); setRenameVal(f.name); } }}>
                  {f.name}
                </span>
              )}
              <div style={{ display:"flex", gap:2 }}>
                {f.type === "sketch" && (
                  <button onClick={e=>{e.stopPropagation();dispatch({type:"ENTER_SKETCH",id:f.id});}}
                    style={{background:"none",border:"none",color:isSk?D.green2:D.txt3,cursor:"pointer",fontSize:9,padding:0}}>
                    {isSk?"•edit":"edit"}
                  </button>
                )}
                <button onClick={e=>{e.stopPropagation();dispatch({type:"TOGGLE_SUPPRESSED",id:f.id});}}
                  style={{background:"none",border:"none",color:D.txt3,cursor:"pointer",fontSize:9,padding:0}}>
                  {f.suppressed?"show":"hide"}
                </button>
                <button onClick={e=>{e.stopPropagation();dispatch({type:"DELETE_FEATURE",id:f.id});}}
                  style={{background:"none",border:"none",color:D.red+"80",cursor:"pointer",fontSize:11,padding:0}}>
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add buttons */}
      <div style={{ padding:"6px 8px", borderTop:`1px solid ${D.bd}`, display:"flex", flexWrap:"wrap", gap:4 }}>
        <Btn small onClick={() => dispatch({ type:"ADD_SKETCH" })}>+ Sketch</Btn>
        <Btn small onClick={() => dispatch({ type:"ADD_EXTRUDE" })}>⬆ Boss</Btn>
        <Btn small onClick={() => dispatch({ type:"ADD_EXTRUDE", cut:true })}>⬇ Cut</Btn>
        <Btn small onClick={() => dispatch({ type:"ADD_REVOLVE" })}>↻ Revolve</Btn>
        <Btn small onClick={() => dispatch({ type:"ADD_HOLE", dia:10, depth:30 })}>○ Hole</Btn>
      </div>
    </div>
  );
}

function PropertiesPanel({ state, dispatch }) {
  const f = state.activePart?.features.find(f => f.id === state.activeFeatureId);
  const meta = f ? (FMETA[f.type] ?? FMETA.sketch) : null;

  if (!f) return (
    <div style={{ padding:12, fontSize:10, color:D.txt3 }}>
      Select a feature to view properties.
    </div>
  );

  return (
    <div style={{ padding:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8,
        background:D.bg, border:`1px solid ${D.bd}`, borderRadius:4, padding:"8px 10px" }}>
        <div style={{ width:28, height:28, borderRadius:4, background:meta.bg,
          color:meta.col, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
          {meta.icon}
        </div>
        <div>
          <div style={{ fontWeight:600, fontSize:11 }}>{f.name}</div>
          <div style={{ fontSize:9, color:D.txt3, textTransform:"uppercase", letterSpacing:1 }}>{f.type}</div>
        </div>
      </div>

      {(f.type === "extrude" || f.type === "extrude_boss" || f.type === "extrude_cut") && (<>
        <Field label="Depth (mm)">
          <Inp type="number" value={f.depth ?? 20} step={1} min={0.1}
            onChange={v => dispatch({ type:"UPDATE_FEATURE_PARAM", id:f.id, key:"depth", val:v })} />
        </Field>
        <Field label="Sketch">
          <Sel value={f.sketchId ?? ""} onChange={v => dispatch({ type:"UPDATE_FEATURE_PARAM", id:f.id, key:"sketchId", val:parseInt(v) })}
            opts={state.activePart?.features.filter(s=>s.type==="sketch").map(s=>({v:s.id,l:s.name})) ?? []} />
        </Field>
        <PropRow label="Operation" value={f.type === "extrude_cut" ? "Subtract" : "Add"} color={f.type==="extrude_cut"?D.red:D.green2} />
      </>)}

      {f.type === "revolve" && (<>
        <Field label="Angle (°)">
          <Inp type="number" value={f.angle ?? 360} step={1} min={1} max={360}
            onChange={v => dispatch({ type:"UPDATE_FEATURE_PARAM", id:f.id, key:"angle", val:Math.max(1,Math.min(360,v)) })} />
        </Field>
        <Field label="Sketch">
          <Sel value={f.sketchId ?? ""} onChange={v => dispatch({ type:"UPDATE_FEATURE_PARAM", id:f.id, key:"sketchId", val:parseInt(v) })}
            opts={state.activePart?.features.filter(s=>s.type==="sketch").map(s=>({v:s.id,l:s.name})) ?? []} />
        </Field>
      </>)}

      {f.type === "hole" && (<>
        <Field label="Diameter">
          <Inp type="number" value={f.dia ?? 10} step={0.5} min={0.1}
            onChange={v => dispatch({ type:"UPDATE_FEATURE_PARAM", id:f.id, key:"dia", val:v })} />
        </Field>
        <Field label="Depth">
          <Inp type="number" value={f.depth ?? 30} step={1} min={0.1}
            onChange={v => dispatch({ type:"UPDATE_FEATURE_PARAM", id:f.id, key:"depth", val:v })} />
        </Field>
        <Field label="Center X">
          <Inp type="number" value={f.cx ?? 0} step={1}
            onChange={v => dispatch({ type:"UPDATE_FEATURE_PARAM", id:f.id, key:"cx", val:v })} />
        </Field>
        <Field label="Center Z">
          <Inp type="number" value={f.cz ?? 0} step={1}
            onChange={v => dispatch({ type:"UPDATE_FEATURE_PARAM", id:f.id, key:"cz", val:v })} />
        </Field>
      </>)}

      {f.type === "sketch" && (<>
        <Field label="Plane">
          <Sel value={f.planeId ?? "XZ"} onChange={v => dispatch({ type:"UPDATE_FEATURE_PARAM", id:f.id, key:"planeId", val:v })}
            opts={[{v:"XZ",l:"XZ (Top)"},{v:"XY",l:"XY (Front)"},{v:"YZ",l:"YZ (Right)"}]} />
        </Field>
        <PropRow label="Entities" value={f.entities.length} />
        <div style={{ marginTop:6, display:"flex", gap:4 }}>
          <Btn small onClick={() => dispatch({ type:"ENTER_SKETCH", id:f.id })}>✏ Edit Sketch</Btn>
          <Btn small onClick={() => dispatch({ type:"CLEAR_SKETCH_ENTITIES", id:f.id })}>Clear</Btn>
        </div>
      </>)}
    </div>
  );
}

function AssemblyPanel({ state, dispatch }) {
  return (
    <div style={{ padding:8 }}>
      <div style={{ fontSize:9, color:D.txt3, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Instances</div>
      {state.instances.map(inst => {
        const part = state.parts.find(p => p.id === inst.partId);
        const isActive = inst.id === state.activeInstanceId;
        return (
          <div key={inst.id}
            style={{ padding:"5px 8px", marginBottom:2, borderRadius:3,
              background: isActive ? D.blueBg : D.bg,
              border:`1px solid ${isActive ? D.blue : D.bd}`,
              cursor:"pointer" }}
            onClick={() => dispatch({ type:"SELECT_INSTANCE", id:inst.id })}>
            <div style={{ fontSize:10, color: isActive ? D.blue2 : D.txt }}>{inst.name}</div>
            <div style={{ fontSize:9, color:D.txt3 }}>{part?.name} — [{inst.pos.map(v=>v.toFixed(0)).join(", ")}]</div>
          </div>
        );
      })}

      {state.activeInstanceId && (() => {
        const inst = state.instances.find(i => i.id === state.activeInstanceId);
        if (!inst) return null;
        return (
          <div style={{ marginTop:8, padding:8, background:D.bg, border:`1px solid ${D.bd}`, borderRadius:4 }}>
            <div style={{ fontSize:9, color:D.txt3, marginBottom:6 }}>POSITION</div>
            {["X","Y","Z"].map((axis, i) => (
              <Field key={axis} label={axis}>
                <Inp type="number" value={inst.pos[i]} step={5}
                  onChange={v => {
                    const pos = [...inst.pos]; pos[i] = v;
                    dispatch({ type:"MOVE_INSTANCE", id:inst.id, pos });
                  }} />
              </Field>
            ))}
          </div>
        );
      })()}

      <div style={{ marginTop:8, fontSize:9, color:D.txt3, textTransform:"uppercase", letterSpacing:1 }}>Mates</div>
      {state.mates.length === 0 && (
        <div style={{ fontSize:9, color:D.txt3, padding:"6px 0" }}>No mates yet. Select two faces, then add a mate.</div>
      )}
      {state.mates.map(m => (
        <div key={m.id} style={{ padding:"4px 8px", marginBottom:2, background:D.bg, border:`1px solid ${D.bd}`, borderRadius:3 }}>
          <span style={{ fontSize:9, color:D.green2 }}>{m.type}</span>
          <span style={{ fontSize:9, color:D.txt3, marginLeft:6 }}>{m.instanceA} ↔ {m.instanceB}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CadPro2() {
  const [state, dispatch] = useMemo(() => {
    let s = initState();
    const d = (action) => { s = reducer(s, action); };
    return [s, d];
  }, []);

  const [, forceUpdate] = useState(0);
  const stateRef = useRef(state);

  const disp = useCallback(action => {
    stateRef.current = reducer(stateRef.current, action);
    forceUpdate(n => n + 1);
  }, []);

  const liveState = stateRef.current;
  const [leftTab, setLeftTab] = useState("tree");
  const [rightTab, setRightTab] = useState("props");
  const sketchMode = liveState.mode === "sketch";
  const activeSk = liveState.activePart?.features.find(f => f.id === liveState.activeSketchId && f.type === "sketch");

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:D.bg,
      color:D.txt, fontFamily:"system-ui, sans-serif", overflow:"hidden" }}>

      {/* TOP BAR */}
      <div style={{ height:36, background:D.p1, borderBottom:`1px solid ${D.bd}`,
        display:"flex", alignItems:"center", gap:8, padding:"0 10px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontWeight:700, fontSize:13, color:"#fff" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="#63b8ff" strokeWidth="1.5"/>
            <rect x="5" y="5" width="6" height="6" rx="1" fill="#63b8ff"/>
          </svg>
          CAD·PRO <span style={{ fontSize:8, color:"rgba(255,255,255,0.4)", letterSpacing:2 }}>2.0</span>
        </div>

        <div style={{ width:1, height:20, background:D.bd, margin:"0 2px" }} />

        {/* Doc type toggle */}
        {["part","assembly"].map(t => (
          <button key={t} onClick={() => disp({ type:"SET_DOC_TYPE", docType:t })}
            style={{ padding:"3px 10px", background: liveState.docType===t ? D.blueBg : "transparent",
              border:`1px solid ${liveState.docType===t ? D.blue : D.bd}`,
              color: liveState.docType===t ? D.blue2 : D.txt3,
              borderRadius:3, fontSize:9, fontWeight:700, cursor:"pointer", textTransform:"uppercase" }}>
            {t}
          </button>
        ))}

        <div style={{ width:1, height:20, background:D.bd, margin:"0 2px" }} />

        {/* Sketch mode indicator / toolbar */}
        {sketchMode ? (<>
          <div style={{ background:D.greenBg, border:`1px solid ${D.green}30`, color:D.green2,
            padding:"2px 9px", borderRadius:3, fontSize:9, fontWeight:700 }}>
            SKETCH — {activeSk?.name}
          </div>
          {[
            { t:"select", l:"▷ Select" }, { t:"line", l:"⟋ Line" },
            { t:"circle", l:"○ Circle" }, { t:"rect", l:"□ Rect" },
          ].map(({ t, l }) => (
            <button key={t} onClick={() => disp({ type:"SET_SKETCH_TOOL", tool:t })}
              style={{ padding:"2px 8px", background: liveState.sketchTool===t ? D.blueBg : "transparent",
                border:`1px solid ${liveState.sketchTool===t ? D.blue : D.bd}`,
                color: liveState.sketchTool===t ? D.blue2 : D.txt3,
                borderRadius:3, fontSize:9, fontWeight:700, cursor:"pointer" }}>
              {l}
            </button>
          ))}
          <Btn onClick={() => disp({ type:"EXIT_SKETCH" })}>✓ Exit Sketch</Btn>
        </>) : (<>
          {/* Standard views */}
          {["iso","front","top","right"].map(v => (
            <button key={v} onClick={() => _viewFn?.(v)}
              style={{ padding:"2px 7px", background:"transparent", border:`1px solid ${D.bd}`,
                color:D.txt3, borderRadius:3, fontSize:9, cursor:"pointer", textTransform:"uppercase" }}>
              {v}
            </button>
          ))}
        </>)}

        <div style={{ flex:1 }} />
        <div style={{ fontSize:9, color:D.txt3 }}>
          {liveState.activePart?.features.length ?? 0} features
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* LEFT PANEL */}
        <div style={{ width:220, background:D.p1, borderRight:`1px solid ${D.bd}`,
          display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden" }}>
          <div style={{ display:"flex", borderBottom:`1px solid ${D.bd}` }}>
            {(liveState.docType === "part" ? ["tree"] : ["tree","assembly"]).map(t => (
              <div key={t} onClick={() => setLeftTab(t)}
                style={{ flex:1, padding:"6px 0", textAlign:"center", fontSize:9, fontWeight:700,
                  color: leftTab===t ? D.blue2 : D.txt3, cursor:"pointer",
                  borderBottom:`2px solid ${leftTab===t ? D.blue : "transparent"}`,
                  textTransform:"uppercase", letterSpacing:1 }}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ flex:1, overflow:"hidden" }}>
            {leftTab === "tree" && <FeatureTreePanel state={liveState} dispatch={disp} />}
            {leftTab === "assembly" && <AssemblyPanel state={liveState} dispatch={disp} />}
          </div>
        </div>

        {/* VIEWPORT */}
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
          <Canvas
            camera={{ position:[120, 90, 120], fov:45, near:0.1, far:5000 }}
            shadows
            style={{ display:"block", width:"100%", height:"100%" }}>
            <Scene state={liveState} dispatch={disp} />
          </Canvas>

          <SketchOverlay state={liveState} dispatch={disp} />

          {/* HUD */}
          <div style={{ position:"absolute", top:8, left:8, background:`${D.p1}E0`,
            border:`1px solid ${D.bd}`, borderRadius:4, padding:"5px 10px",
            fontSize:9, lineHeight:1.8, color:D.txt, pointerEvents:"none" }}>
            <div style={{ fontFamily:"monospace" }}>
              <b style={{ color:D.blue2 }}>CAD·PRO 2.0</b><br/>
              Mode: <span style={{ color:D.amber }}>{liveState.mode.toUpperCase()}</span><br/>
              {sketchMode && <>Tool: <span style={{ color:D.green2 }}>{liveState.sketchTool}</span><br/></>}
              {sketchMode && <><span style={{ color:D.txt3 }}>Dbl-click=finish line | ESC=stop</span><br/></>}
              {!sketchMode && <><span style={{ color:D.txt3 }}>LMB=rotate | RMB=pan | scroll=zoom</span><br/></>}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width:230, background:D.p1, borderLeft:`1px solid ${D.bd}`,
          display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden" }}>
          <div style={{ display:"flex", borderBottom:`1px solid ${D.bd}` }}>
            {["props","mates"].map(t => (
              <div key={t} onClick={() => setRightTab(t)}
                style={{ flex:1, padding:"6px 0", textAlign:"center", fontSize:9, fontWeight:700,
                  color: rightTab===t ? D.blue2 : D.txt3, cursor:"pointer",
                  borderBottom:`2px solid ${rightTab===t ? D.blue : "transparent"}`,
                  textTransform:"uppercase", letterSpacing:1 }}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {rightTab === "props" && <PropertiesPanel state={liveState} dispatch={disp} />}
            {rightTab === "mates" && <AssemblyPanel state={liveState} dispatch={disp} />}
          </div>
        </div>
      </div>
    </div>
  );
}
