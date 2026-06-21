import React, { useState, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, TransformControls, Html, Line } from "@react-three/drei";
import Katex from "katex-react";
import 'katex/dist/katex.min.css';
import { useIsDark } from "../../../hooks/useIsDark.js";
import { card, mutedText, divider, overlayPanel, getSceneColors } from "./styles.js";

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
function ProjectionScene({ targetPos, setTargetPos, isDark, orbitControlsRef }) {
  const lineDir = useMemo(() => new THREE.Vector3(1, 0.5, 0).normalize(), []);
  const scene = getSceneColors(isDark);

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
        cellColor={scene.cellColor}
        sectionColor={scene.sectionColor}
        fadeDistance={25}
        infiniteGrid
      />

      {/* The Subspace (Line) */}
      <Line
        points={[lineDir.clone().multiplyScalar(-10), lineDir.clone().multiplyScalar(10)]}
        color={scene.lineColor}
        lineWidth={3}
        dashed
        dashSize={0.2}
        gapSize={0.1}
      />
      <Html position={lineDir.clone().multiplyScalar(4)}>
        <div className={`font-bold text-sm px-2 py-1 rounded backdrop-blur-sm select-none ${overlayPanel}`}>
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
        size={1}
        showX showY showZ
        // drei's auto-disable-orbit-while-dragging only works if OrbitControls
        // already registered itself as the default controls before this
        // effect runs, which isn't guaranteed by render/mount order — so
        // disable it explicitly instead of relying on that race.
        onMouseDown={() => {
          if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
        }}
        onMouseUp={() => {
          if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
        }}
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

// katex-react's <Latex> only reads a `children` string (no `math` prop
// exists on it at all — passing math={...} silently renders nothing,
// which was making this entire HUD sidebar blank). It also only treats
// content as math when wrapped in delimiters, so bare LaTeX source needs
// explicit \[...\] wrapping to render instead of printing as literal text.
function MathLine({ expr }) {
  return <Katex displayMode>{`\\[${expr}\\]`}</Katex>;
}

export default function LALesson11_OrthogonalProjections() {
  const isDark = useIsDark();
  const orbitControlsRef = useRef(null);
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
    <div className={`w-full h-full min-h-[550px] relative rounded-xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/50 flex flex-col sm:flex-row ${card}`}>

      {/* 3D Canvas */}
      <div className="flex-1 relative cursor-crosshair">
        <Canvas camera={{ position: [4, 4, 6], fov: 45 }}>
          <color attach="background" args={[isDark ? "#020617" : "#f8fafc"]} />
          <ProjectionScene targetPos={targetPos} setTargetPos={setTargetPos} isDark={isDark} orbitControlsRef={orbitControlsRef} />
          <OrbitControls ref={orbitControlsRef} makeDefault enablePan={false} maxDistance={20} minDistance={2} />
        </Canvas>

        {/* Instructions Overlay */}
        <div className={`absolute top-4 left-4 px-4 py-3 rounded-xl pointer-events-none ${overlayPanel}`}>
          <h3 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">Orthogonal Projection</h3>
          <p className={`${mutedText} text-xs flex items-center gap-2`}>
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Drag the red sphere (b)
          </p>
        </div>
      </div>

      {/* Math HUD */}
      <div className={`w-full sm:w-[320px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t sm:border-t-0 sm:border-l ${divider} p-6 flex flex-col overflow-y-auto`}>
        <div className={`text-xs font-bold uppercase tracking-widest ${mutedText} mb-6`}>Real-Time Calculus</div>

        <div className="space-y-6">
          <div>
            <div className={`${mutedText} text-xs mb-2`}>Target Vector (b)</div>
            <div className="text-red-600 dark:text-red-400 text-sm overflow-x-auto pb-2">
              <MathLine expr={`\\mathbf{b} = ${bStr}`} />
            </div>
          </div>

          <div>
            <div className={`${mutedText} text-xs mb-2`}>Line Direction (a)</div>
            <div className="text-slate-700 dark:text-slate-300 text-sm overflow-x-auto pb-2">
              <MathLine expr={`\\mathbf{a} = ${aStr}`} />
            </div>
          </div>

          <div className={`h-px w-full ${divider} border-t`} />

          <div>
            <div className={`${mutedText} text-xs mb-2`}>Projection (p)</div>
            <div className="text-blue-600 dark:text-blue-400 text-sm overflow-x-auto pb-2">
              <MathLine expr={`\\mathbf{p} = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{\\mathbf{a} \\cdot \\mathbf{a}} \\mathbf{a} = ${pStr}`} />
            </div>
          </div>

          <div>
            <div className={`${mutedText} text-xs mb-2`}>Error (e)</div>
            <div className="text-green-600 dark:text-green-400 text-sm overflow-x-auto pb-2">
              <MathLine expr={`\\mathbf{e} = \\mathbf{b} - \\mathbf{p} = ${eStr}`} />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
            <div className={`${mutedText} text-xs mb-2`}>Perpendicular Check</div>
            <div className="text-emerald-600 dark:text-emerald-400 text-sm">
              <MathLine expr={`\\mathbf{a} \\cdot \\mathbf{e} = ${Math.abs(dotProd) < 0.001 ? '0.000' : dotProd.toFixed(3)}`} />
            </div>
            <p className={`${mutedText} text-[10px] mt-2 leading-relaxed`}>
              Because the dot product is exactly 0, we know the error vector is perfectly orthogonal to the line.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
