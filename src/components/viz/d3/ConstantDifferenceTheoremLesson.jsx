import React from "react";

export default function ConstantDifferenceTheoremLesson({ params }) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Why Antiderivatives Differ by Constants
        </h2>
        <p className="text-lg text-gray-600">
          The mathematical proof that explains why +C is necessary
        </p>
      </div>

      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-red-800 mb-4">
          The Problem: Multiple Answers
        </h3>
        <div className="space-y-4 text-red-700">
          <p>
            When we ask "what function has derivative f(x)?", we often get
            multiple answers. This seems wrong at first — shouldn't there be
            exactly one function with a given derivative?
          </p>

          <div className="bg-white p-4 rounded border-l-4 border-red-500">
            <h4 className="font-semibold mb-2">Example: f(x) = 2x</h4>
            <p>What function has derivative 2x?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              <div className="bg-gray-100 p-2 rounded text-center">
                <p className="font-mono">F₁(x) = x²</p>
                <p className="text-sm">F₁'(x) = 2x ✓</p>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <p className="font-mono">F₂(x) = x² + 5</p>
                <p className="text-sm">F₂'(x) = 2x ✓</p>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <p className="font-mono">F₃(x) = x² - 3</p>
                <p className="text-sm">F₃'(x) = 2x ✓</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              All three functions have the same derivative!
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">
          The Mathematical Proof
        </h3>
        <div className="space-y-4">
          <p className="text-blue-700">
            <strong>Theorem:</strong> If F and G are both antiderivatives of f
            on an interval, then F(x) - G(x) = C for some constant C.
          </p>

          <div className="bg-white p-4 rounded border-l-4 border-blue-500">
            <h4 className="font-semibold mb-3">
              Proof using Mean Value Theorem:
            </h4>
            <div className="space-y-2 text-sm">
              <p>1. F'(x) = f(x) and G'(x) = f(x) for all x</p>
              <p>2. So F'(x) - G'(x) = 0</p>
              <p>3. Let H(x) = F(x) - G(x)</p>
              <p>4. Then H'(x) = 0 for all x</p>
              <p>
                5. By Mean Value Theorem corollary: constant functions are the
                only functions with derivative zero
              </p>
              <p>6. Therefore H(x) = C for some constant C</p>
              <p>7. So F(x) = G(x) + C</p>
            </div>
          </div>

          <div className="bg-yellow-100 p-4 rounded">
            <p className="font-semibold text-yellow-800">Key Insight:</p>
            <p className="text-yellow-700">
              Functions with the same derivative can only differ by a vertical
              shift. They have the same "shape" but can be moved up or down on
              the graph.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-800 mb-4">
          Why This Makes Sense Geometrically
        </h3>
        <div className="space-y-4 text-green-700">
          <p>
            Think about what derivatives represent:{" "}
            <strong>rates of change</strong>. Two functions with the same rate
            of change everywhere must be moving at the same speed in the same
            direction.
          </p>

          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold mb-2">Car Analogy:</h4>
            <div className="space-y-2">
              <p>Two cars traveling at exactly 60 mph:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Car A: Currently at mile marker 100</li>
                <li>Car B: Currently at mile marker 150</li>
              </ul>
              <p className="mt-2">
                Both cars have the same <strong>speed</strong> (derivative), but
                different
                <strong>positions</strong> (function values). The 50-mile
                difference is constant.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold mb-2">Visual Analogy:</h4>
            <p>
              Imagine two hills with exactly the same steepness everywhere (same
              derivative). One hill could be 100 feet higher than the other, but
              they'd have identical slopes. The height difference would be
              constant along the entire path.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-purple-800 mb-4">
          The Complete Answer: F(x) + C
        </h3>
        <div className="space-y-4 text-purple-700">
          <p>
            Since any two antiderivatives differ by a constant, we write the
            <strong>general antiderivative</strong> as F(x) + C, where:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded">
              <h4 className="font-semibold">F(x)</h4>
              <p>One specific antiderivative (the "particular" solution)</p>
            </div>
            <div className="bg-white p-4 rounded">
              <h4 className="font-semibold">+ C</h4>
              <p>The constant representing all possible vertical shifts</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded border-l-4 border-purple-500">
            <h4 className="font-semibold mb-2">Example:</h4>
            <p className="font-mono text-center text-lg">∫ 2x dx = x² + C</p>
            <p className="text-sm text-center mt-2 text-gray-600">
              This represents the entire family of functions whose derivative is
              2x
            </p>
          </div>

          <div className="bg-yellow-100 p-4 rounded">
            <p className="font-semibold text-yellow-800">
              Important Distinction:
            </p>
            <p className="text-yellow-700">
              The +C is not a "fudge factor" or something we add because we're
              unsure. It's mathematically necessary because the derivative
              operation loses information about the function's vertical
              position.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-indigo-800 mb-4">
          Finding the Particular Solution
        </h3>
        <div className="space-y-4 text-indigo-700">
          <p>
            To find a specific function (not just the family), we need
            additional information. This is called an{" "}
            <strong>Initial Value Problem</strong>.
          </p>

          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold mb-2">Example:</h4>
            <div className="space-y-2">
              <p>Find f(x) such that f'(x) = 2x and f(0) = 3</p>
              <p className="font-mono">∫ 2x dx = x² + C</p>
              <p>Use initial condition: f(0) = 0² + C = 3 → C = 3</p>
              <p className="font-mono font-semibold">f(x) = x² + 3</p>
            </div>
          </div>

          <p>
            The initial condition "picks out" one specific function from the
            infinite family of antiderivatives.
          </p>
        </div>
      </div>
    </div>
  );
}
