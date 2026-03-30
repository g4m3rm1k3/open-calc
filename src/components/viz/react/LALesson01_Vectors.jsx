import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import Katex from "katex-react";
import 'katex/dist/katex.min.css';

// ─── Arrow with axis label ────────────────────────────────────────────────────
function LabeledArrow({ direction, origin = [0, 0, 0], length, color }) {
  const dir = useMemo(() => new THREE.Vector3(...direction).normalize(), [direction]);
  const org = new THREE.Vector3(...origin);

  if (length < 0.01) return null;

  return (
    <arrowHelper args={[dir, org, length, color, 0.18, 0.1]} />
  );
}

// ─── Dashed component lines ───────────────────────────────────────────────────
function ComponentLines({ x, y, z }) {
  const points = useMemo(() => {
    const origin = new THREE.Vector3(0, 0, 0);
    const xEnd   = new THREE.Vector3(x, 0, 0);
    const xyEnd  = new THREE.Vector3(x, y, 0);
    const xyzEnd = new THREE.Vector3(x, y, z);
    return [
      [origin, xEnd],
      [xEnd,   xyEnd],
      [xyEnd,  xyzEnd],
    ];
  }, [x, y, z]);

  return (
    <>
      {points.map(([a, b], i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={0x888888} transparent opacity={0.5} />
        </line>
      ))}
    </>
  );
}

// ─── Scalar multiplication ghost ─────────────────────────────────────────────
function ScalarArrow({ vector, scalar }) {
  const scaled = useMemo(
    () => new THREE.Vector3(vector.x, vector.y, vector.z).multiplyScalar(scalar),
    [vector, scalar]
  );
  const len = scaled.length();
  const dir = scaled.clone().normalize();
  if (len < 0.01) return null;
  return (
    <arrowHelper
      args={[dir, new THREE.Vector3(0, 0, 0), len, scalar >= 0 ? 0x00bfff : 0xff6b6b, 0.18, 0.1]}
    />
  );
}

// ─── 3D Scene ─────────────────────────────────────────────────────────────────
function VectorScene({ vector, scalar, showComponents, showScaled }) {
  const len = vector.length();
  const dir = [vector.x, vector.y, vector.z];

  return (
    <>
      <ambientLight intensity={0.6} />
      <axesHelper args={[4]} />
      <Grid
        args={[10, 10]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        cellColor="#444"
        sectionColor="#666"
        fadeDistance={12}
        infiniteGrid
      />

      {/* Main vector v */}
      <LabeledArrow direction={dir} length={len} color={0xff4444} />

      {/* Scalar multiple */}
      {showScaled && scalar !== 1 && (
        <ScalarArrow vector={vector} scalar={scalar} />
      )}

      {/* Component lines */}
      {showComponents && (
        <ComponentLines x={vector.x} y={vector.y} z={vector.z} />
      )}
    </>
  );
}

// ─── Slider control ───────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, color = "#e2e8f0" }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color }}>{label}</span>
        <span className="font-mono text-slate-300">{Number(value).toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-red-400"
      />
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────
function buildSteps(v, scalar) {
  const len = v.length().toFixed(3);
  const scaledLen = (v.length() * Math.abs(scalar)).toFixed(3);
  const s = scalar.toFixed(2);

  return [
    {
      label: "What is a vector?",
      explanation:
        "The red arrow is a vector \\(\\mathbf{v}\\). It has two defining properties: a **length** (magnitude) and a **direction**. It does NOT have a position — moving the same arrow anywhere in space gives the exact same vector. Drag the sliders on the right to change \\(x\\), \\(y\\), and \\(z\\). Watch the arrow respond.",
      formula: `\\mathbf{v} = \\begin{bmatrix} ${v.x.toFixed(2)} \\\\ ${v.y.toFixed(2)} \\\\ ${v.z.toFixed(2)} \\end{bmatrix}`,
    },
    {
      label: "Three perspectives",
      explanation:
        "**Physics:** An arrow in space — length and direction only. " +
        "**Computer science:** An ordered list of numbers \\([x,\\, y,\\, z]\\). " +
        "**Math:** Anything you can add and scale. " +
        "These are the same object viewed three ways. In this course we constantly translate between all three.",
      formula: `\\mathbf{v} = \\begin{bmatrix} ${v.x.toFixed(2)} \\\\ ${v.y.toFixed(2)} \\\\ ${v.z.toFixed(2)} \\end{bmatrix} \\quad |\\mathbf{v}| = ${len}`,
    },
    {
      label: "Components",
      explanation:
        "Toggle **Show Components** to see the grey staircase. Each step is one component: first move \\(x\\) units along the x-axis (red), then \\(y\\) units up (green), then \\(z\\) units forward (blue). The three numbers are a precise recipe for walking from the origin to the tip of the arrow.",
      formula: `v_x = ${v.x.toFixed(2)},\\quad v_y = ${v.y.toFixed(2)},\\quad v_z = ${v.z.toFixed(2)}`,
    },
    {
      label: "Scalars",
      explanation:
        "A **scalar** is just a number. Multiplying a vector by a scalar scales it. Use the Scalar slider and toggle **Show Scaled**. " +
        "When \\(c > 1\\): the arrow gets longer. " +
        "When \\(0 < c < 1\\): shorter. " +
        "When \\(c = -1\\): flips direction exactly. " +
        "When \\(c = 0\\): collapses to the zero vector.",
      formula: `c \\cdot \\mathbf{v} = ${s} \\cdot \\mathbf{v} \\quad \\Rightarrow \\quad |c \\cdot \\mathbf{v}| = |${s}| \\cdot ${v.length().toFixed(2)} = ${scaledLen}`,
    },
    {
      label: "Magnitude",
      explanation:
        "The **magnitude** \\(\\|\\mathbf{v}\\|\\) is the length of the arrow — how far the vector reaches from the origin. It is always non-negative. " +
        "We compute it with the 3D Pythagorean theorem: square all three components, add them, take the square root.",
      formula: `\\|\\mathbf{v}\\| = \\sqrt{v_x^2 + v_y^2 + v_z^2} = \\sqrt{${v.x.toFixed(2)}^2 + ${v.y.toFixed(2)}^2 + ${v.z.toFixed(2)}^2} = ${len}`,
    },
    {
      label: "Unit vector",
      explanation:
        "A **unit vector** has magnitude exactly 1. It represents pure direction with no length information. " +
        "To create one, divide every component by the magnitude — this is called **normalizing**. " +
        "Unit vectors are written with a hat: \\(\\hat{v}\\).",
      formula: `\\hat{v} = \\frac{\\mathbf{v}}{\\|\\mathbf{v}\\|} = \\frac{1}{${len}} \\begin{bmatrix} ${v.x.toFixed(2)} \\\\ ${v.y.toFixed(2)} \\\\ ${v.z.toFixed(2)} \\end{bmatrix}`,
    },
    {
      label: "Challenge",
      explanation:
        "Can you set the vector so that \\(\\|\\mathbf{v}\\| = 5\\) exactly? " +
        "Hint: try \\(x=3, y=4, z=0\\) — that is a classic 3-4-5 right triangle. " +
        "Then try finding another combination that also gives 5. " +
        "There are infinitely many — they all lie on a sphere of radius 5.",
      formula: `\\sqrt{x^2 + y^2 + z^2} = 5`,
    },
  ];
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LALesson01_Vectors() {
  const [x, setX] = useState(2);
  const [y, setY] = useState(3);
  const [z, setZ] = useState(1);
  const [scalar, setScalar] = useState(1.5);
  const [step, setStep] = useState(0);
  const [showComponents, setShowComponents] = useState(false);
  const [showScaled, setShowScaled] = useState(false);

  const vector = useMemo(() => new THREE.Vector3(x, y, z), [x, y, z]);
  const steps  = useMemo(() => buildSteps(vector, scalar), [vector, scalar]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-slate-100">
        Interactive: Vectors in 3D
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ── 3D canvas ── */}
        <div className="md:col-span-2 h-80 md:h-[460px] rounded-lg overflow-hidden border border-slate-700">
          <Canvas camera={{ position: [6, 5, 6], fov: 40 }}>
            <VectorScene
              vector={vector}
              scalar={scalar}
              showComponents={showComponents}
              showScaled={showScaled}
            />
            <OrbitControls makeDefault />
          </Canvas>
        </div>

        {/* ── Controls ── */}
        <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Vector v — drag to reshape
          </p>
          <Slider label="x" value={x} min={-4} max={4} step={0.1} onChange={setX} color="#ff8888" />
          <Slider label="y" value={y} min={-4} max={4} step={0.1} onChange={setY} color="#88ff88" />
          <Slider label="z" value={z} min={-4} max={4} step={0.1} onChange={setZ} color="#88aaff" />

          <hr className="border-slate-600 my-1" />

          <p className="text-xs text-slate-400 uppercase tracking-wider">
            Scalar c (step 4)
          </p>
          <Slider
            label="scalar c"
            value={scalar}
            min={-3}
            max={3}
            step={0.05}
            onChange={setScalar}
            color="#00bfff"
          />

          <hr className="border-slate-600 my-1" />

          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showComponents}
              onChange={e => setShowComponents(e.target.checked)}
              className="accent-teal-400"
            />
            Show Components (step 3)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showScaled}
              onChange={e => setShowScaled(e.target.checked)}
              className="accent-blue-400"
            />
            Show Scaled Vector (step 4)
          </label>

          <div className="mt-2 bg-slate-900 rounded p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Magnitude ‖v‖</p>
            <p className="text-2xl font-mono font-bold text-red-400">
              {vector.length().toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Step buttons ── */}
      <div className="mt-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                i === step
                  ? "bg-red-600 text-white font-semibold"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-600"
              }`}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        {/* ── Step explanation ── */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-base font-semibold text-slate-100 mb-2">
            {steps[step].label}
          </h3>
          <div className="text-slate-300 text-sm leading-relaxed mb-3 prose prose-invert max-w-none">
            <Katex>{steps[step].explanation}</Katex>
          </div>
          {steps[step].formula && (
            <div className="bg-slate-900 rounded p-4 text-center overflow-x-auto">
              <Katex block>{steps[step].formula}</Katex>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
