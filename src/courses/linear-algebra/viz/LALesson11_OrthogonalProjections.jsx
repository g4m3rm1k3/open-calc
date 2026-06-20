import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, TransformControls, Html, Line } from "@react-three/drei";
import Katex from "katex-react";

// --- Vector Helper Component ---
function VectorArrow({ start, end, color }) {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  
  if (length < 0.001) return null;
  
  return (
    <arrowHelper
      args={[dir.clone().normalize(), start, length, color, Math.max(0.2, length * 0.1), Math.max(0.1, length * 0.05)]}
    />
  );
}

// --- Main 3D Scene ---
function ProjectionScene({ targetPos, setTargetPos }) {
  const lineDir = useMemo(() => new THREE.Vector3(1, 0.5, 0).normalize(), []);
  
  // Calculate projection: p = (b \cdot a) / (a \cdot a) * a
  const b = new THREE.Vector3(...targetPos);
  const a = lineDir.clone();
  
  const scalar = b.dot(a) / a.dot(a);
  const p = a.clone().multiplyScalar(scalar);
  const e = b.clone().sub(p);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      
      <Grid
        args={[20, 20]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        cellColor="#334155"
        sectionColor="#475569"
        fadeDistance={25}
        infiniteGrid
      />

      {/* The Subspace (Line) */}
      <Line
        points={[lineDir.clone().multiplyScalar(-10), lineDir.clone().multiplyScalar(10)]}
        color="#94a3b8"
        lineWidth={3}
        dashed
        dashSize={0.2}
        gapSize={0.1}
      />
      <Html position={lineDir.clone().multiplyScalar(4)}>
        <div className="text-slate-400 font-bold text-sm bg-slate-900/80 px-2 py-1 rounded backdrop-blur-sm select-none">
          Subspace (Line)
        </div>
      </Html>

      {/* Vector b (Target) */}
      <VectorArrow start={new THREE.Vector3(0,0,0)} end={b} color="#ef4444" />
      <Html position={b} center>
        <div className="text-red-400 font-bold text-lg pointer-events-none select-none drop-shadow-md">
          b
        </div>
      </Html>

      {/* Vector p (Projection) */}
      <VectorArrow start={new THREE.Vector3(0,0,0)} end={p} color="#3b82f6" />
      <Html position={p} center>
        <div className="text-blue-400 font-bold text-lg pointer-events-none select-none drop-shadow-md">
          p
        </div>
      </Html>

      {/* Vector e (Error) */}
      <VectorArrow start={p} end={b} color="#22c55e" />
      <Html position={p.clone().add(e.clone().multiplyScalar(0.5))} center>
        <div className="text-green-400 font-bold text-lg pointer-events-none select-none drop-shadow-md">
          e
        </div>
      </Html>

      {/* Right angle indicator */}
      {e.length() > 0.1 && (
        <RightAngle p={p} e={e} a={a} />
      )}

      {/* Draggable control for b */}
      <TransformControls
        position={b}
        mode="translate"
        size={0.7}
        showX showY showZ
        onObjectChange={(e) => {
          if (e.target.object) {
            const pos = e.target.object.position;
            setTargetPos([pos.x, pos.y, pos.z]);
          }
        }}
      >
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
        </mesh>
      </TransformControls>
    </>
  );
}

// Right angle square
function RightAngle({ p, e, a }) {
  const size = 0.3;
  const eNorm = e.clone().normalize().multiplyScalar(size);
  const aNorm = a.clone().normalize().multiplyScalar(size);
  
  if (e.length() < size * 1.5) return null;

  const p1 = p.clone().add(aNorm);
  const p2 = p.clone().add(aNorm).add(eNorm);
  const p3 = p.clone().add(eNorm);

  return (
    <Line
      points={[p1, p2, p3]}
      color="#22c55e"
      lineWidth={2}
    />
  );
}

export default function LALesson11_OrthogonalProjections() {
  const [targetPos, setTargetPos] = useState([1.5, 3, 2]);

  // Derived calculations for HUD
  const bStr = `\\begin{bmatrix} ${targetPos[0].toFixed(1)} \\\\ ${targetPos[1].toFixed(1)} \\\\ ${targetPos[2].toFixed(1)} \\end{bmatrix}`;
  const a = new THREE.Vector3(1, 0.5, 0).normalize();
  const aStr = `\\begin{bmatrix} ${a.x.toFixed(2)} \\\\ ${a.y.toFixed(2)} \\\\ ${a.z.toFixed(2)} \\end{bmatrix}`;
  
  const bVec = new THREE.Vector3(...targetPos);
  const scalar = bVec.dot(a) / a.dot(a);
  const pVec = a.clone().multiplyScalar(scalar);
  const pStr = `\\begin{bmatrix} ${pVec.x.toFixed(1)} \\\\ ${pVec.y.toFixed(1)} \\\\ ${pVec.z.toFixed(1)} \\end{bmatrix}`;

  const eVec = bVec.clone().sub(pVec);
  const eStr = `\\begin{bmatrix} ${eVec.x.toFixed(1)} \\\\ ${eVec.y.toFixed(1)} \\\\ ${eVec.z.toFixed(1)} \\end{bmatrix}`;
  
  const dotProd = a.dot(eVec);

  return (
    <div className="w-full h-full min-h-[550px] relative bg-slate-950 rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800 flex flex-col sm:flex-row">
      
      {/* 3D Canvas */}
      <div className="flex-1 relative cursor-crosshair">
        <Canvas camera={{ position: [4, 4, 6], fov: 45 }}>
          <ProjectionScene targetPos={targetPos} setTargetPos={setTargetPos} />
          <OrbitControls makeDefault enablePan={false} maxDistance={20} minDistance={2} />
        </Canvas>
        
        {/* Instructions Overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/50 pointer-events-none">
          <h3 className="text-white font-bold text-sm mb-1">Orthogonal Projection</h3>
          <p className="text-slate-400 text-xs flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Drag the red sphere (b)
          </p>
        </div>
      </div>

      {/* Math HUD */}
      <div className="w-full sm:w-[320px] bg-slate-900/90 backdrop-blur-xl border-l border-slate-800 p-6 flex flex-col overflow-y-auto">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Real-Time Calculus</div>
        
        <div className="space-y-6">
          <div>
            <div className="text-slate-400 text-xs mb-2">Target Vector (b)</div>
            <div className="text-red-400 text-sm overflow-x-auto pb-2">
              <Katex math={`\\mathbf{b} = ${bStr}`} />
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs mb-2">Line Direction (a)</div>
            <div className="text-slate-300 text-sm overflow-x-auto pb-2">
              <Katex math={`\\mathbf{a} = ${aStr}`} />
            </div>
          </div>

          <div className="h-px bg-slate-800 w-full" />

          <div>
            <div className="text-slate-400 text-xs mb-2">Projection (p)</div>
            <div className="text-blue-400 text-sm overflow-x-auto pb-2">
              <Katex math={`\\mathbf{p} = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{\\mathbf{a} \\cdot \\mathbf{a}} \\mathbf{a} = ${pStr}`} />
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs mb-2">Error (e)</div>
            <div className="text-green-400 text-sm overflow-x-auto pb-2">
              <Katex math={`\\mathbf{e} = \\mathbf{b} - \\mathbf{p} = ${eStr}`} />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="text-slate-400 text-xs mb-2">Perpendicular Check</div>
            <div className="text-emerald-400 text-sm">
              <Katex math={`\\mathbf{a} \\cdot \\mathbf{e} = ${Math.abs(dotProd) < 0.001 ? '0.000' : dotProd.toFixed(3)}`} />
            </div>
            <p className="text-slate-500 text-[10px] mt-2 leading-relaxed">
              Because the dot product is exactly 0, we know the error vector is perfectly orthogonal to the line.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
