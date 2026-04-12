import React, { useState } from "react";

const FIB_EXAMPLE = {
  name: "Fibonacci Sequence",
  definition: "F(n) = F(n-1) + F(n-2), F(0) = 0, F(1) = 1",
  values: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
};

const FACTORIAL_EXAMPLE = {
  name: "Factorial Function",
  definition: "n! = n × (n-1)!, 0! = 1",
  values: [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880],
};

const POWER_EXAMPLE = {
  name: "Exponentiation",
  definition: "x^n = x × x^(n-1), x^0 = 1",
  values: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
};

const EXAMPLES = [FIB_EXAMPLE, FACTORIAL_EXAMPLE, POWER_EXAMPLE];

const buildRecursionTree = (example, depth, maxDepth = 4) => {
  if (depth > maxDepth) return null;

  const nodes = [];
  const value = example.values[depth] || "?";

  if (example === FIB_EXAMPLE && depth >= 2) {
    nodes.push(buildRecursionTree(example, depth - 1, maxDepth));
    nodes.push(buildRecursionTree(example, depth - 2, maxDepth));
  } else if (example === FACTORIAL_EXAMPLE && depth >= 1) {
    nodes.push(buildRecursionTree(example, depth - 1, maxDepth));
  } else if (example === POWER_EXAMPLE && depth >= 1) {
    nodes.push(buildRecursionTree(example, depth - 1, maxDepth));
  }

  return {
    value,
    depth,
    children: nodes.filter((n) => n !== null),
  };
};

export default function RecursionTreeViz() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [maxDepth, setMaxDepth] = useState(4);
  const [showComputation, setShowComputation] = useState(false);

  const example = EXAMPLES[selectedExample];
  const tree = buildRecursionTree(example, maxDepth, maxDepth);

  const renderTree = (node, x = 400, y = 50, level = 0) => {
    if (!node) return null;

    const children = node.children || [];
    const childSpacing = 300 / Math.max(1, children.length);
    const startX = x - ((children.length - 1) * childSpacing) / 2;

    return (
      <g key={`${node.depth}-${x}-${y}`}>
        {/* Lines to children */}
        {children.map((child, index) => (
          <line
            key={`line-${node.depth}-${index}`}
            x1={x}
            y1={y + 20}
            x2={startX + index * childSpacing}
            y2={y + 80}
            stroke="#666"
            strokeWidth="2"
          />
        ))}

        {/* Node circle */}
        <circle
          cx={x}
          cy={y}
          r="25"
          fill={level === 0 ? "#4CAF50" : "#2196F3"}
          stroke="#fff"
          strokeWidth="3"
        />

        {/* Node value */}
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="white"
        >
          {node.value}
        </text>

        {/* Depth label */}
        <text x={x + 35} y={y + 5} fontSize="12" fill="#666">
          n={node.depth}
        </text>

        {/* Children */}
        {children.map((child, index) =>
          renderTree(child, startX + index * childSpacing, y + 80, level + 1),
        )}
      </g>
    );
  };

  const getComputationSteps = () => {
    if (!showComputation) return [];

    const steps = [];
    for (let i = 0; i <= maxDepth; i++) {
      if (example === FIB_EXAMPLE) {
        if (i === 0) steps.push("F(0) = 0 [base case]");
        else if (i === 1) steps.push("F(1) = 1 [base case]");
        else
          steps.push(
            `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${example.values[i - 1]} + ${example.values[i - 2]} = ${example.values[i]}`,
          );
      } else if (example === FACTORIAL_EXAMPLE) {
        if (i === 0) steps.push("0! = 1 [base case]");
        else
          steps.push(
            `${i}! = ${i} × ${i - 1}! = ${i} × ${example.values[i - 1]} = ${example.values[i]}`,
          );
      } else if (example === POWER_EXAMPLE) {
        if (i === 0) steps.push("2^0 = 1 [base case]");
        else
          steps.push(
            `2^${i} = 2 × 2^${i - 1} = 2 × ${example.values[i - 1]} = ${example.values[i]}`,
          );
      }
    }
    return steps;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">
        The Tree of Recursion: How Functions Call Themselves
      </h2>

      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Choose a Recursive Function</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {EXAMPLES.map((ex, index) => (
              <button
                key={index}
                onClick={() => setSelectedExample(index)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedExample === index
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                }`}
              >
                <div className="font-semibold mb-1">{ex.name}</div>
                <div className="text-sm opacity-80">{ex.definition}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Current Function: {example.name}</h3>
          <p className="mb-2">
            <strong>Definition:</strong> {example.definition}
          </p>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Recursion Depth: {maxDepth}
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowComputation(!showComputation)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              {showComputation ? "Hide" : "Show"} Computation Steps
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-center">Recursion Tree</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <svg width="800" height="500" className="w-full border rounded">
            {renderTree(tree)}
          </svg>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Each node represents a function call. Lines show which calls depend on
          which subcalls.
        </p>
      </div>

      {showComputation && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 text-center">
            Step-by-Step Computation
          </h3>
          <div className="bg-yellow-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {getComputationSteps().map((step, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded border font-mono text-sm"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-green-700">
            ✓ Base Case
          </h3>
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🎯</div>
            <div className="font-mono text-lg">F(0) = 0, F(1) = 1</div>
          </div>
          <p className="text-sm text-gray-600">
            The recursion must stop somewhere. Base cases provide the "ground
            truth" that everything else builds upon. Without them, recursion
            goes forever.
          </p>
        </div>

        <div className="border-2 border-blue-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-blue-700">
            → Recursive Case
          </h3>
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🔄</div>
            <div className="font-mono text-lg">F(n) = F(n-1) + F(n-2)</div>
          </div>
          <p className="text-sm text-gray-600">
            Express the problem in terms of smaller instances of itself. Each
            call breaks down the problem until it hits the base case, then
            builds back up.
          </p>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">
          Recursion vs Iteration: Different Perspectives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <h4 className="font-bold text-blue-600 mb-1">Recursion (Tree)</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Expresses solution in terms of smaller problems</li>
              <li>Natural for tree-like structures</li>
              <li>Can be inefficient (repeated work)</li>
              <li>Matches mathematical induction</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded border">
            <h4 className="font-bold text-green-600 mb-1">Iteration (Loop)</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Builds solution step by step</li>
              <li>Usually more efficient</li>
              <li>Matches mathematical induction too</li>
              <li>Sometimes clearer to follow</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-600">
          <strong>Key Insight:</strong> Every recursive function can be
          rewritten iteratively, and vice versa. The choice depends on which is
          more natural for the problem and which performs better.
        </p>
      </div>
    </div>
  );
}
