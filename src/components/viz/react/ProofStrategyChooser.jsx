import React, { useState } from "react";

const STRATEGIES = {
  direct: {
    name: "Direct Proof",
    description: "Assume P, derive Q step by step",
    when: "When the logical path from assumption to conclusion is visible",
    example: "Prove: if n is even, then n² is even",
    steps: [
      "Assume n is even: n = 2k",
      "Then n² = (2k)² = 4k² = 2(2k²)",
      "Since 2(2k²) is divisible by 2, n² is even ✓",
    ],
  },
  contradiction: {
    name: "Proof by Contradiction",
    description: "Assume ¬Q, derive a contradiction",
    when: "When the direct path is unclear, or proving non-existence",
    example: "Prove: √2 is irrational",
    steps: [
      "Assume √2 = p/q in lowest terms",
      "Then 2 = p²/q² ⇒ p² = 2q² (p² even)",
      "So p is even: p = 2k ⇒ 4k² = 2q² ⇒ q² = 2k² (q² even)",
      "So q is even. But p,q both even contradicts lowest terms ✗",
    ],
  },
  contrapositive: {
    name: "Proof by Contrapositive",
    description: "Prove ¬Q → ¬P instead of P → Q",
    when: "When working backward is easier than forward",
    example: "Prove: if n² is odd, then n is odd",
    steps: [
      "Contrapositive: if n is even, then n² is even",
      "n = 2k ⇒ n² = 4k² = 2(2k²) which is even ✓",
      "So original statement holds",
    ],
  },
  cases: {
    name: "Proof by Cases",
    description: "Split into exhaustive cases, prove each",
    when: "When different subcategories behave differently",
    example: "Prove: |xy| = |x|·|y|",
    steps: [
      "Case 1: x ≥ 0, y ≥ 0: |xy| = xy = |x|·|y| ✓",
      "Case 2: x < 0, y ≥ 0: |xy| = |x|·|y| ✓",
      "Case 3: x ≥ 0, y < 0: |xy| = |x|·|y| ✓",
      "Case 4: x < 0, y < 0: |xy| = |x|·|y| ✓",
    ],
  },
};

const CLAIM_TYPES = [
  {
    type: "conditional",
    description: "If P, then Q (P → Q)",
    examples: [
      "If n is even, n² is even",
      "If triangle has 3 equal sides, angles equal",
    ],
    strategies: ["direct", "contrapositive"],
  },
  {
    type: "nonexistence",
    description: "There is no X such that...",
    examples: [
      "No rational square root of 2",
      "No integer solutions to x² + y² = z² + 1",
    ],
    strategies: ["contradiction"],
  },
  {
    type: "categorization",
    description: "X has property Y",
    examples: [
      "Every integer > 1 has prime factors",
      "Real numbers are rational or irrational",
    ],
    strategies: ["cases"],
  },
  {
    type: "equivalence",
    description: "X is equivalent to Y",
    examples: [
      "Two sets have same cardinality",
      "Two expressions are equal for all values",
    ],
    strategies: ["direct", "cases"],
  },
];

export default function ProofStrategyChooser() {
  const [selectedClaim, setSelectedClaim] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState("direct");

  const claimType = CLAIM_TYPES[selectedClaim];
  const strategy = STRATEGIES[selectedStrategy];

  const isRecommended = claimType.strategies.includes(selectedStrategy);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Which Proof Strategy Should I Use?
      </h2>

      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">
            What kind of claim are you trying to prove?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CLAIM_TYPES.map((claim, index) => (
              <button
                key={index}
                onClick={() => setSelectedClaim(index)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedClaim === index
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                }`}
              >
                <div className="font-semibold mb-1">{claim.type}</div>
                <div className="text-sm opacity-80 mb-2">
                  {claim.description}
                </div>
                <div className="text-xs opacity-60">
                  Examples: {claim.examples[0]}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">
            Current Claim Type: {claimType.type}
          </h3>
          <p className="mb-2">
            <strong>Description:</strong> {claimType.description}
          </p>
          <p className="mb-2">
            <strong>Recommended strategies:</strong>{" "}
            {claimType.strategies.map((s) => STRATEGIES[s].name).join(", ")}
          </p>
          <div className="text-sm text-gray-600">
            <strong>Examples:</strong>
            <ul className="list-disc list-inside mt-1">
              {claimType.examples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Choose a Proof Strategy</h3>
          <div className="space-y-3">
            {Object.entries(STRATEGIES).map(([key, strat]) => (
              <button
                key={key}
                onClick={() => setSelectedStrategy(key)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  selectedStrategy === key
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{strat.name}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      claimType.strategies.includes(key)
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {claimType.strategies.includes(key)
                      ? "Recommended"
                      : "Alternative"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {strat.description}
                </p>
                <p className="text-xs text-gray-500">Use when: {strat.when}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Strategy Details</h3>
          <div
            className={`p-4 rounded-lg border-2 mb-4 ${
              isRecommended
                ? "border-green-300 bg-green-50"
                : "border-yellow-300 bg-yellow-50"
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-lg font-bold mr-2">{strategy.name}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  isRecommended
                    ? "bg-green-200 text-green-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {isRecommended ? "✓ Good Choice" : "⚠ Alternative"}
              </span>
            </div>
            <p className="text-sm mb-3">{strategy.description}</p>
            <p className="text-xs text-gray-600">
              <strong>When to use:</strong> {strategy.when}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Example: {strategy.example}</h4>
            <div className="space-y-1">
              {strategy.steps.map((step, index) => (
                <div
                  key={index}
                  className="text-sm font-mono bg-white p-2 rounded border"
                >
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">
          Decision Tree for Choosing Strategies
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span>
              Can you see a direct logical path from P to Q? →{" "}
              <strong>Direct Proof</strong>
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span>
              Are you proving something doesn't exist? →{" "}
              <strong>Contradiction</strong>
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span>
              Would the contrapositive be easier to prove? →{" "}
              <strong>Contrapositive</strong>
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span>
              Do different cases behave differently? →{" "}
              <strong>Proof by Cases</strong>
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-600">
          <strong>Pro Tip:</strong> Most proofs are direct proofs. Don't
          overcomplicate — start with the obvious approach!
        </p>
      </div>
    </div>
  );
}
