import React, { useState } from "react";

const FAILURE_SCENARIOS = [
  {
    name: "Domino Chain",
    description:
      "A chain of dominoes where each falls if the previous one falls",
    baseCase: "First domino falls",
    inductiveStep: "If nth domino falls, then (n+1)th domino falls",
    failure: "Gap between dominoes - nth falls but (n+1)th is too far away",
    visual: "🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴",
    failurePoint: 4,
  },
  {
    name: "Ladder Climbing",
    description: "Climbing a ladder where each rung supports your weight",
    baseCase: "First rung holds you",
    inductiveStep: "If nth rung holds you, then (n+1)th rung holds you",
    failure: "Weak rung - nth holds but (n+1)th breaks",
    visual: "🪜🪜🪜🪜🪜🪜🪜🪜🪜🪜",
    failurePoint: 6,
  },
  {
    name: "Mathematical Sum",
    description: "Proving ∑(2k-1) = n² for all n",
    baseCase: "For n=1: 1 = 1² ✓",
    inductiveStep: "Assume ∑(2k-1) = n², show ∑(2k-1) = (n+1)²",
    failure: "Off-by-one error in the inductive step",
    visual: "1 + 3 + 5 + 7 + 9 + 11 + 13 + 15 + 17 + 19",
    failurePoint: 3,
  },
  {
    name: "Recursive Function",
    description: "A function that calls itself with smaller input",
    baseCase: "f(0) = 1",
    inductiveStep: "f(n) = n × f(n-1)",
    failure: "Wrong base case - f(0) = 0 causes everything to be zero",
    visual:
      "f(10) → f(9) → f(8) → f(7) → f(6) → f(5) → f(4) → f(3) → f(2) → f(1) → f(0)",
    failurePoint: 10,
  },
];

export default function InductionFailureViz() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [showFailure, setShowFailure] = useState(false);

  const scenario = FAILURE_SCENARIOS[selectedScenario];

  const renderVisual = () => {
    if (!showFailure) {
      return <div className="text-4xl text-center my-8">{scenario.visual}</div>;
    }

    const chars = scenario.visual.split("");
    return (
      <div className="text-4xl text-center my-8">
        {chars.map((char, index) => (
          <span
            key={index}
            className={
              index >= scenario.failurePoint ? "text-red-500" : "text-green-500"
            }
          >
            {char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Why Induction Fails: The Domino Effect of Errors
      </h2>

      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Choose a Scenario to Break</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FAILURE_SCENARIOS.map((scenario, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedScenario(index);
                  setShowFailure(false);
                }}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedScenario === index
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                }`}
              >
                <div className="font-semibold mb-1">{scenario.name}</div>
                <div className="text-sm opacity-80">{scenario.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Current Scenario: {scenario.name}</h3>
          <p className="mb-3">
            <strong>Description:</strong> {scenario.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded border">
              <div className="font-semibold text-green-600 mb-1">
                ✓ Base Case
              </div>
              <div className="text-sm">{scenario.baseCase}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-semibold text-blue-600 mb-1">
                → Inductive Step
              </div>
              <div className="text-sm">{scenario.inductiveStep}</div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowFailure(!showFailure)}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold"
            >
              {showFailure ? "Hide Failure" : "Show Where It Breaks"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-center">
          Visual Demonstration
        </h3>
        {renderVisual()}

        {showFailure && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-300">
            <h4 className="font-bold text-red-700 mb-2">💥 Failure Point</h4>
            <p className="text-red-700">{scenario.failure}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-green-700">
            What Makes Induction Work
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Base Case:</strong> Must be absolutely true
            </p>
            <p>
              <strong>Inductive Step:</strong> Must guarantee the next case
            </p>
            <p>
              <strong>Domain:</strong> Must include all natural numbers
            </p>
            <p>
              <strong>Logic:</strong> Each step must follow necessarily
            </p>
          </div>
        </div>

        <div className="border-2 border-red-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-red-700">
            Common Failure Modes
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Weak Base:</strong> Base case doesn't hold
            </p>
            <p>
              <strong>Gap in Logic:</strong> Step doesn't bridge n to n+1
            </p>
            <p>
              <strong>Wrong Domain:</strong> Doesn't cover all cases
            </p>
            <p>
              <strong>Circular Reasoning:</strong> Assumes what you're proving
            </p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">
          The Mathematics of Failure Propagation
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Single Point of Failure:</strong> One bad step contaminates
            everything after it
          </p>
          <p>
            <strong>Transitive Error:</strong> If n fails, then n+1 fails, then
            n+2 fails...
          </p>
          <p>
            <strong>Verification Strategy:</strong> Check base case, then verify
            each inductive step independently
          </p>
          <p>
            <strong>Debugging Tip:</strong> When induction fails, isolate the
            smallest n where the pattern breaks
          </p>
          <p>
            <strong>Mathematical Reality:</strong> Most "intuitive" inductive
            arguments are wrong. Always verify!
          </p>
        </div>
      </div>
    </div>
  );
}
