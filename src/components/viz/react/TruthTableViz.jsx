import React, { useState, useMemo } from "react";

const VAR_NAMES = ["P", "Q", "R", "S"];

function evaluateExpression(expr, rowObj) {
  if (!expr || !expr.trim()) return "";

  let js = expr
    .toUpperCase()
    .replace(/\bNOT\b/g, "!")
    .replace(/~/g, "!")
    .replace(/\bAND\b/g, "&")
    .replace(/\bOR\b/g, "|")
    .replace(/\bIFF\b/g, "=")
    .replace(/<->/g, "=")
    .replace(/\bIMPLIES\b/g, ">")
    .replace(/->/g, ">")
    .replace(/&&?/g, " && ")
    .replace(/\|\|?/g, " || ")
    .replace(/===?/g, " === ")
    .replace(/>/g, " <= ");

  const keys = [...Object.keys(rowObj), "T", "F", "TRUE", "FALSE"];
  const vals = [...Object.values(rowObj), true, false, true, false];

  try {
    const fn = new Function(...keys, `return !!(${js});`);
    const result = fn(...vals);
    return result ? "T" : "F";
  } catch (e) {
    return "Err";
  }
}

export default function TruthTableViz() {
  const [numVars, setNumVars] = useState(2);
  const [expression, setExpression] = useState("P AND Q");

  const activeVars = VAR_NAMES.slice(0, numVars);
  const numRows = Math.pow(2, numVars);

  const tableData = useMemo(() => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      const rowObj = {};
      for (let j = 0; j < numVars; j++) {
        rowObj[VAR_NAMES[j]] = (i & (1 << (numVars - 1 - j))) !== 0;
      }
      const result = evaluateExpression(expression, rowObj);
      rows.push({ ...rowObj, result });
    }
    return rows;
  }, [numVars, expression]);

  const isTautology = tableData.every((row) => row.result === "T");
  const isContradiction = tableData.every((row) => row.result === "F");

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Truth Table Visualizer
      </h2>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Variables:
            </label>
            <select
              value={numVars}
              onChange={(e) => setNumVars(parseInt(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Logical Expression:
            </label>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value.toUpperCase())}
              placeholder="P AND Q"
              className="w-full border rounded px-3 py-2 font-mono"
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>
            <strong>Syntax:</strong> Use AND, OR, NOT, IMPLIES (-&gt;), IFF
            (&lt;-&gt;), or symbols ∧ ∨ ¬ → ↔
          </p>
          <p>
            <strong>Example:</strong> (P AND Q) -&gt; R
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {activeVars.map((varName) => (
                <th
                  key={varName}
                  className="border border-gray-300 px-4 py-2 text-center font-bold"
                >
                  {varName}
                </th>
              ))}
              <th className="border border-gray-300 px-4 py-2 text-center font-bold">
                {expression || "Expression"}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {activeVars.map((varName) => (
                  <td
                    key={varName}
                    className="border border-gray-300 px-4 py-2 text-center font-mono"
                  >
                    {row[varName] ? "T" : "F"}
                  </td>
                ))}
                <td
                  className={`border border-gray-300 px-4 py-2 text-center font-mono font-bold ${
                    row.result === "T"
                      ? "text-green-600"
                      : row.result === "F"
                        ? "text-red-600"
                        : "text-orange-600"
                  }`}
                >
                  {row.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">Analysis:</h3>
        <div className="space-y-1">
          <p>
            <strong>Expression:</strong> {expression || "None"}
          </p>
          <p>
            <strong>Rows:</strong> {numRows}
          </p>
          <p>
            <strong>Tautology:</strong>{" "}
            <span
              className={
                isTautology ? "text-green-600 font-bold" : "text-gray-600"
              }
            >
              {isTautology ? "YES" : "NO"}
            </span>{" "}
            (always true)
          </p>
          <p>
            <strong>Contradiction:</strong>{" "}
            <span
              className={
                isContradiction ? "text-red-600 font-bold" : "text-gray-600"
              }
            >
              {isContradiction ? "YES" : "NO"}
            </span>{" "}
            (always false)
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Interactive Tip:</strong> Try expressions like "P OR NOT P"
          (tautology), "P AND NOT P" (contradiction), or "(P → Q) ↔ (¬P ∨ Q)"
          (implication equivalence).
        </p>
      </div>
    </div>
  );
}
