import React, { useState } from "react";

const SCENARIOS = [
  {
    premise: "It rains tomorrow",
    conclusion: "I carry an umbrella",
    expression: "Rain → Umbrella",
    cases: [
      {
        p: true,
        q: true,
        description: "It rains AND I carry an umbrella",
        valid: true,
      },
      {
        p: true,
        q: false,
        description: "It rains BUT I don't carry an umbrella",
        valid: false,
      },
      {
        p: false,
        q: true,
        description: "It doesn't rain BUT I carry an umbrella anyway",
        valid: true,
      },
      {
        p: false,
        q: false,
        description: "It doesn't rain AND I don't carry an umbrella",
        valid: true,
      },
    ],
  },
  {
    premise: "You score 90% on the test",
    conclusion: "You get an A",
    expression: "Score90 → GetA",
    cases: [
      {
        p: true,
        q: true,
        description: "You score 90% AND get an A",
        valid: true,
      },
      {
        p: true,
        q: false,
        description: "You score 90% BUT don't get an A",
        valid: false,
      },
      {
        p: false,
        q: true,
        description: "You score <90% BUT still get an A",
        valid: true,
      },
      {
        p: false,
        q: false,
        description: "You score <90% AND don't get an A",
        valid: true,
      },
    ],
  },
  {
    premise: "Pigs can fly",
    conclusion: "I give you $1,000,000",
    expression: "PigsFly → MillionDollars",
    cases: [
      {
        p: true,
        q: true,
        description: "Pigs fly AND I give you a million",
        valid: true,
      },
      {
        p: true,
        q: false,
        description: "Pigs fly BUT I don't give you a million",
        valid: false,
      },
      {
        p: false,
        q: true,
        description: "Pigs don't fly BUT I give you a million anyway",
        valid: true,
      },
      {
        p: false,
        q: false,
        description: "Pigs don't fly AND I don't give you a million",
        valid: true,
      },
    ],
  },
];

export default function ImplicationExplorer() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [selectedCase, setSelectedCase] = useState(null);

  const scenario = SCENARIOS[selectedScenario];
  const selectedCaseData =
    selectedCase !== null ? scenario.cases[selectedCase] : null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Implication: When Is a Promise Broken?
      </h2>

      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Choose a Real-World Promise</h3>
          <div className="grid grid-cols-1 gap-2">
            {SCENARIOS.map((s, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedScenario(index);
                  setSelectedCase(null);
                }}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedScenario === index
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                }`}
              >
                <div className="font-semibold">{s.expression}</div>
                <div className="text-sm opacity-80">
                  If {s.premise.toLowerCase()}, then{" "}
                  {s.conclusion.toLowerCase()}.
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Current Promise</h3>
          <p className="text-lg mb-2">
            <strong>If</strong> {scenario.premise.toLowerCase()},{" "}
            <strong>then</strong> {scenario.conclusion.toLowerCase()}.
          </p>
          <p className="text-sm text-gray-600">
            This promise is only broken when the premise is met but the
            conclusion fails.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Test All Possible Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenario.cases.map((caseData, index) => (
            <button
              key={index}
              onClick={() => setSelectedCase(index)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedCase === index
                  ? "border-blue-500 bg-blue-50"
                  : caseData.valid
                    ? "border-green-300 bg-green-50 hover:bg-green-100"
                    : "border-red-300 bg-red-50 hover:bg-red-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-bold px-2 py-1 rounded ${
                    caseData.valid
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {caseData.valid ? "VALID" : "INVALID"}
                </span>
                <span className="text-sm text-gray-500">Case {index + 1}</span>
              </div>
              <p className="text-sm">{caseData.description}</p>
              <div className="mt-2 text-xs">
                Premise:{" "}
                <span
                  className={
                    caseData.p
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {caseData.p ? "TRUE" : "FALSE"}
                </span>{" "}
                → Conclusion:{" "}
                <span
                  className={
                    caseData.q
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {caseData.q ? "TRUE" : "FALSE"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedCaseData && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            selectedCaseData.valid
              ? "bg-green-100 border border-green-300"
              : "bg-red-100 border border-red-300"
          }`}
        >
          <h3 className="font-bold mb-2">Analysis of Selected Case</h3>
          <p className="mb-2">
            <strong>Scenario:</strong> {selectedCaseData.description}
          </p>
          <p className="mb-2">
            <strong>Promise Status:</strong>
            <span
              className={`font-bold ml-2 ${selectedCaseData.valid ? "text-green-600" : "text-red-600"}`}
            >
              {selectedCaseData.valid
                ? "KEPT (Valid implication)"
                : "BROKEN (Invalid implication)"}
            </span>
          </p>
          <p className="text-sm text-gray-700">
            {selectedCaseData.valid
              ? "The implication holds because either the premise wasn't met (so the promise wasn't invoked) or both premise and conclusion are true."
              : "The implication fails because the premise is true but the conclusion is false — the promise was made and broken."}
          </p>
        </div>
      )}

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">The Key Insight</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Implication Logic:</strong> P → Q is equivalent to "NOT P OR
            Q"
          </p>
          <p>
            <strong>Truth Table:</strong> Only false when P=True and Q=False
          </p>
          <p>
            <strong>Real Meaning:</strong> "Whenever P happens, Q must also
            happen"
          </p>
          <p>
            <strong>Common Confusion:</strong> People think P→Q means P causes
            Q, but it only means they're correlated when P is true.
          </p>
          <p>
            <strong>Interactive Tip:</strong> Click on the "pigs fly" scenario
            to see why impossible premises make implications vacuously true!
          </p>
        </div>
      </div>
    </div>
  );
}
