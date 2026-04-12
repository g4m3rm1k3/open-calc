import React, { useState } from "react";

const POSTAGE_PROBLEM = {
  title: "Postage Stamp Problem",
  description: "What amounts of postage can you make with 3¢ and 5¢ stamps?",
  rule: "Use only 3¢ and 5¢ stamps",
  target: 23,
  solution: [
    { amount: 3, stamps: [3], explanation: "Base case: 3¢ stamp" },
    { amount: 5, stamps: [5], explanation: "Base case: 5¢ stamp" },
    { amount: 6, stamps: [3, 3], explanation: "3 + 3 = 6" },
    { amount: 8, stamps: [3, 5], explanation: "3 + 5 = 8" },
    { amount: 9, stamps: [3, 3, 3], explanation: "3 + 3 + 3 = 9" },
    { amount: 10, stamps: [5, 5], explanation: "5 + 5 = 10" },
    { amount: 11, stamps: [3, 3, 5], explanation: "3 + 3 + 5 = 11" },
    { amount: 12, stamps: [3, 3, 3, 3], explanation: "3 + 3 + 3 + 3 = 12" },
    { amount: 13, stamps: [3, 5, 5], explanation: "3 + 5 + 5 = 13" },
    { amount: 14, stamps: [3, 3, 3, 5], explanation: "3 + 3 + 3 + 5 = 14" },
    {
      amount: 15,
      stamps: [3, 3, 3, 3, 3],
      explanation: "3 + 3 + 3 + 3 + 3 = 15",
    },
    { amount: 16, stamps: [3, 3, 5, 5], explanation: "3 + 3 + 5 + 5 = 16" },
    {
      amount: 17,
      stamps: [3, 3, 3, 3, 5],
      explanation: "3 + 3 + 3 + 3 + 5 = 17",
    },
    {
      amount: 18,
      stamps: [3, 3, 3, 3, 3, 3],
      explanation: "3 + 3 + 3 + 3 + 3 + 3 = 18",
    },
    {
      amount: 19,
      stamps: [3, 3, 3, 5, 5],
      explanation: "3 + 3 + 3 + 5 + 5 = 19",
    },
    {
      amount: 20,
      stamps: [3, 3, 3, 3, 3, 5],
      explanation: "3 + 3 + 3 + 3 + 3 + 5 = 20",
    },
    {
      amount: 21,
      stamps: [3, 3, 3, 3, 3, 3, 3],
      explanation: "3 + 3 + 3 + 3 + 3 + 3 + 3 = 21",
    },
    {
      amount: 22,
      stamps: [3, 3, 3, 3, 5, 5],
      explanation: "3 + 3 + 3 + 3 + 5 + 5 = 22",
    },
    {
      amount: 23,
      stamps: [3, 3, 3, 3, 3, 3, 5],
      explanation: "3 + 3 + 3 + 3 + 3 + 3 + 5 = 23",
    },
  ],
};

const FIBONACCI_PROBLEM = {
  title: "Fibonacci Number Property",
  description:
    "Prove that every natural number n ≥ 3 can be written as sum of distinct Fibonacci numbers (no two consecutive)",
  rule: "Use Fibonacci numbers: 1, 2, 3, 5, 8, 13, 21, ...",
  target: 12,
  solution: [
    { amount: 1, stamps: [1], explanation: "F₂ = 1" },
    { amount: 2, stamps: [2], explanation: "F₃ = 2" },
    { amount: 3, stamps: [3], explanation: "F₄ = 3" },
    { amount: 4, stamps: [1, 3], explanation: "1 + 3 = 4 (skip F₃=2)" },
    { amount: 5, stamps: [5], explanation: "F₅ = 5" },
    { amount: 6, stamps: [1, 5], explanation: "1 + 5 = 6" },
    { amount: 7, stamps: [2, 5], explanation: "2 + 5 = 7" },
    { amount: 8, stamps: [8], explanation: "F₆ = 8" },
    { amount: 9, stamps: [1, 8], explanation: "1 + 8 = 9" },
    { amount: 10, stamps: [2, 8], explanation: "2 + 8 = 10" },
    { amount: 11, stamps: [1, 2, 8], explanation: "1 + 2 + 8 = 11" },
    { amount: 12, stamps: [3, 8], explanation: "3 + 8 = 12" },
  ],
};

const PROBLEMS = [POSTAGE_PROBLEM, FIBONACCI_PROBLEM];

export default function StrongInductionPuzzle() {
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const problem = PROBLEMS[selectedProblem];
  const maxStep = Math.min(currentStep, problem.solution.length - 1);
  const currentSolution = problem.solution[maxStep];

  const canMakeAmount = (target) => {
    return problem.solution.some((s) => s.amount === target);
  };

  const getAvailableAmounts = () => {
    return problem.solution.slice(0, maxStep + 1).map((s) => s.amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Strong Induction: Using Multiple Previous Cases
      </h2>

      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Choose a Problem</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROBLEMS.map((prob, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedProblem(index);
                  setCurrentStep(0);
                  setShowHint(false);
                }}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedProblem === index
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                }`}
              >
                <div className="font-semibold mb-1">{prob.title}</div>
                <div className="text-sm opacity-80">{prob.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Current Problem: {problem.title}</h3>
          <p className="mb-2">
            <strong>Description:</strong> {problem.description}
          </p>
          <p className="mb-2">
            <strong>Rule:</strong> {problem.rule}
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Progress: Step {currentStep + 1}
            </label>
            <input
              type="range"
              min="0"
              max={problem.solution.length - 1}
              value={currentStep}
              onChange={(e) => setCurrentStep(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Current Challenge</h3>
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {currentSolution?.amount}¢
              </div>
              <div className="text-sm text-gray-600">
                Can you make this amount?
              </div>
            </div>

            {currentSolution && (
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  {currentSolution.stamps.map((stamp, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm"
                    >
                      {stamp}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {currentSolution.explanation}
                </p>
              </div>
            )}
          </div>

          {showHint && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2">💡 Strong Induction Hint</h4>
              <p className="text-sm mb-2">
                <strong>Regular Induction:</strong> P(k) → P(k+1)
              </p>
              <p className="text-sm mb-2">
                <strong>Strong Induction:</strong> [P(1) ∧ P(2) ∧ ... ∧ P(k)] →
                P(k+1)
              </p>
              <p className="text-sm">
                You can assume ALL previous cases are true, not just the
                immediate predecessor!
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Available Amounts</h3>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: problem.target + 1 }, (_, i) => i).map(
                (amount) => {
                  const available =
                    canMakeAmount(amount) &&
                    amount <=
                      getAvailableAmounts()[getAvailableAmounts().length - 1];
                  const isCurrent = amount === currentSolution?.amount;

                  return (
                    <div
                      key={amount}
                      className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                        isCurrent
                          ? "bg-blue-500 text-white border-blue-500"
                          : available
                            ? "bg-green-200 border-green-400 text-green-800"
                            : "bg-gray-200 border-gray-300 text-gray-500"
                      }`}
                    >
                      {amount}
                    </div>
                  );
                },
              )}
            </div>
            <div className="mt-4 text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                  <span>Not yet proven</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 border border-blue-500 rounded"></div>
                  <span>Current target</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-green-700">
            Regular Induction
          </h3>
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">➡️</div>
            <div className="font-mono text-lg">P(k) → P(k+1)</div>
          </div>
          <p className="text-sm text-gray-600">
            Assumes only the immediate previous case. Good for simple patterns
            like "each number is one more than the previous."
          </p>
        </div>

        <div className="border-2 border-blue-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-center text-blue-700">
            Strong Induction
          </h3>
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🔗</div>
            <div className="font-mono text-lg">
              [P(1) ∧ ... ∧ P(k)] → P(k+1)
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Assumes ALL previous cases. Powerful for complex dependencies where
            you might need to combine multiple earlier results.
          </p>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Why Strong Induction Works Here</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Multiple Options:</strong> To make a new amount, you can add
            either a 3¢ or 5¢ stamp to ANY previously proven amount
          </p>
          <p>
            <strong>Dependency Chain:</strong> The proof for n might depend on
            n-3, n-4, n-5, etc., not just n-1
          </p>
          <p>
            <strong>Flexibility:</strong> Strong induction lets you choose
            whichever previous case is most convenient
          </p>
          <p>
            <strong>Completeness:</strong> Every number ≥ 8 can be made
            (exercise: prove this!), so the process never gets stuck
          </p>
          <p>
            <strong>Real-World Analogy:</strong> Like having access to all your
            previous tools, not just the most recent one
          </p>
        </div>
      </div>
    </div>
  );
}
