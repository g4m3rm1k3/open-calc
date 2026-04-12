import React, { useState, useMemo } from "react";

const CONNECTIVES = {
  "¬": { name: "NOT", symbol: "¬", description: "Flips truth value" },
  "∧": { name: "AND", symbol: "∧", description: "Both must be true" },
  "∨": { name: "OR", symbol: "∨", description: "At least one true" },
  "→": { name: "IMPLIES", symbol: "→", description: "If P then Q" },
  "↔": { name: "IFF", symbol: "↔", description: "If and only if" },
};

function evaluateSimple(expr, p, q) {
  switch (expr) {
    case "¬P":
      return !p;
    case "¬Q":
      return !q;
    case "P∧Q":
      return p && q;
    case "P∨Q":
      return p || q;
    case "P→Q":
      return !p || q;
    case "P↔Q":
      return p === q;
    case "¬(P∧Q)":
      return !(p && q);
    case "¬(P∨Q)":
      return !(p || q);
    case "¬P∨Q":
      return !p || q;
    default:
      return null;
  }
}

export default function LogicConnectiveBuilder() {
  const [p, setP] = useState(true);
  const [q, setQ] = useState(false);
  const [selectedConnective, setSelectedConnective] = useState("∧");

  const expressions = useMemo(() => {
    const baseExpr = `P${selectedConnective}Q`;
    const negConj = "¬(P∧Q)";
    const negDisj = "¬(P∨Q)";
    const impEquiv = "¬P∨Q";

    return [
      { expr: baseExpr, result: evaluateSimple(baseExpr, p, q) },
      { expr: negConj, result: evaluateSimple(negConj, p, q) },
      { expr: negDisj, result: evaluateSimple(negDisj, p, q) },
      { expr: impEquiv, result: evaluateSimple(impEquiv, p, q) },
    ];
  }, [p, q, selectedConnective]);

  const connective = CONNECTIVES[selectedConnective];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Build Your Own Logic Expressions
      </h2>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Proposition P</h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={p === true}
                  onChange={() => setP(true)}
                  className="mr-2"
                />
                True
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={p === false}
                  onChange={() => setP(false)}
                  className="mr-2"
                />
                False
              </label>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Current value:{" "}
              <span
                className={`font-bold ${p ? "text-green-600" : "text-red-600"}`}
              >
                {p ? "TRUE" : "FALSE"}
              </span>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Proposition Q</h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={q === true}
                  onChange={() => setQ(true)}
                  className="mr-2"
                />
                True
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={q === false}
                  onChange={() => setQ(false)}
                  className="mr-2"
                />
                False
              </label>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Current value:{" "}
              <span
                className={`font-bold ${q ? "text-green-600" : "text-red-600"}`}
              >
                {q ? "TRUE" : "FALSE"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">Choose a Logical Connective</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(CONNECTIVES).map(([symbol, info]) => (
              <button
                key={symbol}
                onClick={() => setSelectedConnective(symbol)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  selectedConnective === symbol
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                }`}
              >
                <div className="text-2xl font-bold mb-1">{symbol}</div>
                <div className="text-xs">{info.name}</div>
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <strong>
              {connective.name} ({connective.symbol}):
            </strong>{" "}
            {connective.description}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Expression Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expressions.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="font-mono text-lg mb-2">
                {item.expr
                  .replace("∧", " ∧ ")
                  .replace("∨", " ∨ ")
                  .replace("→", " → ")
                  .replace("↔", " ↔ ")}
              </div>
              <div className="text-sm">
                Result:{" "}
                <span
                  className={`font-bold ${item.result ? "text-green-600" : "text-red-600"}`}
                >
                  {item.result ? "TRUE" : "FALSE"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Key Insights</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>De Morgan's Laws:</strong> ¬(P∧Q) ≡ ¬P∨¬Q and ¬(P∨Q) ≡ ¬P∧¬Q
          </p>
          <p>
            <strong>Implication Equivalence:</strong> P→Q ≡ ¬P∨Q
          </p>
          <p>
            <strong>Current Expression:</strong> P{" "}
            {connective.name.toLowerCase()} Q ={" "}
            {expressions[0].result ? "TRUE" : "FALSE"}
          </p>
          <p>
            <strong>Try this:</strong> Set P=True, Q=False and try different
            connectives to see how they behave!
          </p>
        </div>
      </div>
    </div>
  );
}
