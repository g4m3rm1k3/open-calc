import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import Katex from "katex-react";
import 'katex/dist/katex.min.css';

// ─── Vector Visualization ────────────────────────────────────────────────────
function ProjectionVisualization({ v, u }) {
  const u_normalized = useMemo(() => u.clone().normalize(), [u]);
  const proj_v_on_u = useMemo(
    () => u_normalized.clone().multiplyScalar(v.dot(u_normalized)),
    [v, u_normalized]
  );
  const error = useMemo(() => v.clone().sub(proj_v_on_u), [v, proj_v_on_u]);

  return (
    <>
      <axesHelper args={[5]} />
      <Grid args={[10, 10]} />

      {/* Vector v */}
      <arrowHelper args={[v.clone().normalize(), new THREE.Vector3(0,0,0), v.length(), 0xff0000]} />
      
      {/* Target vector u */}
      <arrowHelper args={[u.clone().normalize(), new THREE.Vector3(0,0,0), u.length(), 0x0000ff]} />

      {/* Projection of v onto u */}
      <arrowHelper args={[proj_v_on_u.clone().normalize(), new THREE.Vector3(0,0,0), proj_v_on_u.length(), 0x00ff00]} />
      
      {/* Error vector */}
      <arrowHelper args={[error.clone().normalize(), proj_v_on_u, error.length(), 0xffa500]} />

      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([proj_v_on_u.x, proj_v_on_u.y, proj_v_on_u.z, v.x, v.y, v.z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color={0xffa500} dashSize={0.2} gapSize={0.1} />
      </line>
    </>
  );
}

// ─── UI Components ───────────────────────────────────────────────────────────

function VectorControl({ label, vector, onChange, color }) {
  const [x, y, z] = vector.toArray();

  const handleSliderChange = (component, value) => {
    const newVector = new THREE.Vector3(x, y, z);
    newVector[component] = parseFloat(value);
    onChange(newVector);
  };
  
  return (
    <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
        <h4 className="font-bold mb-2" style={{color: color}}>{label}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {['x', 'y', 'z'].map(comp => (
                <div key={comp}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {comp.toUpperCase()}: {vector[comp].toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.1"
                        value={vector[comp]}
                        onChange={e => handleSliderChange(comp, e.target.value)}
                        className="w-full"
                    />
                </div>
            ))}
        </div>
    </div>
  );
}


// ─── Main Component ──────────────────────────────────────────────────────────
export default function OrthogonalProjection() {
  const [v, setV] = useState(new THREE.Vector3(3, 4, 2));
  const [u, setU] = useState(new THREE.Vector3(5, 0, 0));
  const [step, setStep] = useState(0);

  const dotProduct = useMemo(() => v.dot(u), [v, u]);
  const uLengthSq = useMemo(() => u.lengthSq(), [u]);

  const steps = [
    {
      label: "Introduction",
      explanation:
        "This lesson explores orthogonal projections. In simple terms, we're finding the 'shadow' that one vector (\\(\\mathbf{v}\\), in red) casts onto another (\\(\\mathbf{u}\\), in blue). This shadow, shown in green, is the projection. This is one of the most fundamental operations in linear algebra.",
      formula: "\\text{proj}_\\mathbf{u}(\\mathbf{v}) = \\frac{\\mathbf{v} \\cdot \\mathbf{u}}{\\|\\mathbf{u}\\|^2} \\mathbf{u}",
    },
    {
        label: "Why is this useful?",
        explanation:
            "Orthogonal projections are incredibly useful. For example, in **computer graphics**, they are essential for calculating lighting and shadows. In **machine learning**, they are the basis for finding the 'best fit' line in linear regression. In **physics**, they are used to determine the component of a force acting in a specific direction. Understanding projections is key to solving many real-world problems.",
        formula: "",
    },
    {
        label: "The Dot Product",
        explanation:
          "The first step is to compute the dot product of \\(\\mathbf{v}\\) and \\(\\mathbf{u}\\). The dot product is a scalar that tells us about the alignment of the two vectors. If they point in similar directions, the dot product is positive. If they are orthogonal, it's zero.",
        formula: `\\mathbf{v} \\cdot \\mathbf{u} = (v_x u_x) + (v_y u_y) + (v_z u_z) = ${dotProduct.toFixed(2)}`,
    },
    {
        label: "Scaling Factor",
        explanation:
            "The term \\( \\frac{\\mathbf{v} \\cdot \\mathbf{u}}{\\|\\mathbf{u}\\|^2} \\) is a scalar that tells us how much to scale \\(\\mathbf{u}\\) to get the projection vector. It's the ratio of the dot product to the squared length of \\(\\mathbf{u}\\).",
        formula: `\\frac{\\mathbf{v} \\cdot \\mathbf{u}}{\\|\\mathbf{u}\\|^2} = \\frac{${dotProduct.toFixed(2)}}{${uLengthSq.toFixed(2)}} = ${(dotProduct / uLengthSq).toFixed(2)}`,
    },
    {
      label: "The Projection Vector",
      explanation:
        "Now, we multiply the scaling factor by the vector \\(\\mathbf{u}\\) to get the projection vector \\(\\text{proj}_\\mathbf{u}(\\mathbf{v})\\). This new vector (in green) lies on the same line as \\(\\mathbf{u}\\).",
      formula: `\\text{proj}_\\mathbf{u}(\\mathbf{v}) = ${(dotProduct / uLengthSq).toFixed(2)} \\cdot \\mathbf{u}`,
    },
    {
        label: "The Error Vector",
        explanation:
          "The orange vector is the 'error' or 'rejection' vector. It is the difference between \\(\\mathbf{v}\\) and its projection onto \\(\\mathbf{u}\\). Notice that it is always orthogonal (perpendicular) to \\(\\mathbf{u}\\). This is a key property of orthogonal projections!",
        formula: "\\mathbf{e} = \\mathbf{v} - \\text{proj}_\\mathbf{u}(\\mathbf{v})",
      },
    {
      label: "Challenge: Orthogonality",
      explanation:
        "Adjust vector \\(\\mathbf{v}\\) using the controls below. Can you make the projection of \\(\\mathbf{v}\\) onto \\(\\mathbf{u}\\) equal to the zero vector? What does this imply about the relationship between \\(\\mathbf{v}\\) and \\(\\mathbf{u}\\)?",
      formula: `\\text{proj}_\\mathbf{u}(\\mathbf{v}) = \\mathbf{0} \\implies \\mathbf{v} \\cdot \\mathbf{u} = 0`,
    },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Interactive Lesson: Orthogonal Projections</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-96 md:h-[500px] border border-gray-300 dark:border-gray-700 rounded-lg">
          <Canvas camera={{ position: [5, 5, 5], fov: 35 }}>
            <ProjectionVisualization v={v} u={u} />
            <OrbitControls />
          </Canvas>
        </div>

        <div className="flex flex-col gap-4">
            <VectorControl label="Vector v" vector={v} onChange={setV} color="#ff0000" />
            <VectorControl label="Vector u" vector={u} onChange={setU} color="#0000ff" />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-2 mb-4 flex-wrap">
            {steps.map((s, i) => (
                <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                    i === step
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                >
                {i+1}. {s.label}
                </button>
            ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{steps[step].label}</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 prose">
            <Katex>{steps[step].explanation}</Katex>
          </p>
          {steps[step].formula && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded text-center">
              <Katex block>{steps[step].formula}</Katex>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}