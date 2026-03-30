import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import katex from "katex";
import "katex/dist/katex.min.css";

// ─── Math Renderer ───────────────────────────────────────────────────────────
function MathBlock({ tex, display = false }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      katex.render(tex, ref.current, {
        throwOnError: false,
        displayMode: display,
      });
    }
  }, [tex, display]);
  return <span ref={ref} />;
}

// ─── Vector Visualization ────────────────────────────────────────────────────
function ProjectionVisualization({ vector, target }) {
  const sceneRef = useRef();

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous objects
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Add grid lines
    const gridHelper = new THREE.GridHelper(10, 10, "#94a3b8", "#e2e8f0");
    scene.add(gridHelper);

    // Normalize target vector
    const targetNormalized = target.clone().normalize();

    // Compute projection
    const dotProduct = vector.dot(targetNormalized);
    const projection = targetNormalized.clone().multiplyScalar(dotProduct);

    // Compute error vector
    const error = vector.clone().sub(projection);

    // Add original vector (red)
    const vectorGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      vector,
    ]);
    const vectorMaterial = new THREE.LineBasicMaterial({ color: "red" });
    const vectorLine = new THREE.Line(vectorGeometry, vectorMaterial);
    scene.add(vectorLine);

    // Add projection vector (green)
    const projectionGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      projection,
    ]);
    const projectionMaterial = new THREE.LineBasicMaterial({ color: "green" });
    const projectionLine = new THREE.Line(projectionGeometry, projectionMaterial);
    scene.add(projectionLine);

    // Add error vector (blue)
    const errorGeometry = new THREE.BufferGeometry().setFromPoints([
      projection,
      vector,
    ]);
    const errorMaterial = new THREE.LineBasicMaterial({ color: "blue" });
    const errorLine = new THREE.Line(errorGeometry, errorMaterial);
    scene.add(errorLine);

    // Add arrows to vectors
    const arrowHelperV = new THREE.ArrowHelper(
      vector.clone().normalize(),
      new THREE.Vector3(0, 0, 0),
      vector.length(),
      "red"
    );
    scene.add(arrowHelperV);

    const arrowHelperProj = new THREE.ArrowHelper(
      projection.clone().normalize(),
      new THREE.Vector3(0, 0, 0),
      projection.length(),
      "green"
    );
    scene.add(arrowHelperProj);

    const arrowHelperError = new THREE.ArrowHelper(
      error.clone().normalize(),
      projection,
      error.length(),
      "blue"
    );
    scene.add(arrowHelperError);
  }, [vector, target]);

  return <scene ref={sceneRef} />;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function OrthogonalProjection() {
  const [vector, setVector] = useState(new THREE.Vector3(3, 4, 0));
  const [target, setTarget] = useState(new THREE.Vector3(1, 0, 0));
  const [step, setStep] = useState(0);

  const steps = [
    {
      label: "Step 1: Define the problem",
      explanation:
        "We want to project the vector \\( \\mathbf{v} \\) onto the vector \\( \\mathbf{u} \\).",
      formula: "\\text{proj}_u(v) = \\frac{\\mathbf{v} \\cdot \\mathbf{u}}{\\|\\mathbf{u}\\|^2} \\cdot \\mathbf{u}",
    },
    {
      label: "Step 2: Compute the dot product",
      explanation:
        "The dot product \\( \\mathbf{v} \\cdot \\mathbf{u} \\) measures how much \\( \\mathbf{v} \\) aligns with \\( \\mathbf{u} \\).",
      formula: `\\mathbf{v} \\cdot \\mathbf{u} = ${vector.dot(target).toFixed(2)}`,
    },
    {
      label: "Step 3: Normalize the target vector",
      explanation:
        "We normalize \\( \\mathbf{u} \\) to ensure the projection is scaled correctly.",
      formula: `\\|\\mathbf{u}\\|^2 = ${target.lengthSq().toFixed(2)}`,
    },
    {
      label: "Step 4: Compute the projection",
      explanation:
        "Multiply the normalized \\( \\mathbf{u} \\) by the scalar \\( \\frac{\\mathbf{v} \\cdot \\mathbf{u}}{\\|\\mathbf{u}\\|^2} \\).",
      formula: `\\text{proj}_u(v) = (${vector.dot(target).toFixed(2)} / ${target
        .lengthSq()
        .toFixed(2)}) \\cdot \\mathbf{u}`,
    },
    {
      label: "Step 5: Visualize the result",
      explanation:
        "The green vector is the projection, and the blue vector is the error (perpendicular to \\( \\mathbf{u} \\)).",
      formula: "",
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Orthogonal Projection</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        This lesson demonstrates how to project a vector <strong>v</strong> onto
        another vector <strong>u</strong>. Follow the steps below to understand
        the process.
      </p>

      {/* Step Navigation */}
      <div className="flex gap-2 mb-4">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`px-4 py-2 rounded ${
              i === step
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Explanation */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{steps[step].label}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {steps[step].explanation}
        </p>
        {steps[step].formula && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
            <MathBlock tex={steps[step].formula} display={true} />
          </div>
        )}
      </div>

      {/* Interactive Visualization */}
      <div className="h-96 border border-gray-300 dark:border-gray-700 rounded">
        <Canvas>
          <ProjectionVisualization vector={vector} target={target} />
          <OrbitControls />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-4">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300">
            Vector v (x, y, z):
          </label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={vector.x}
            onChange={(e) =>
              setVector(new THREE.Vector3(parseFloat(e.target.value), vector.y, vector.z))
            }
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300">
            Target u (x, y, z):
          </label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={target.x}
            onChange={(e) =>
              setTarget(new THREE.Vector3(parseFloat(e.target.value), target.y, target.z))
            }
          />
        </div>
      </div>
    </div>
  );
}