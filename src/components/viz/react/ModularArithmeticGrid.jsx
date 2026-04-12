import { useMemo, useState } from "react";
import SliderControl from "../SliderControl.jsx";

function buildGrid(modulus, op) {
  return Array.from({ length: modulus }, (_, a) =>
    Array.from({ length: modulus }, (_, b) => {
      if (op === "add") return (a + b) % modulus;
      return (a * b) % modulus;
    }),
  );
}

function isPrime(value) {
  if (value < 2) return false;
  for (let i = 2; i * i <= value; i += 1) {
    if (value % i === 0) return false;
  }
  return true;
}

export default function ModularArithmeticGrid() {
  const [modulus, setModulus] = useState(7);
  const [operation, setOperation] = useState("add");
  const [selected, setSelected] = useState(null);
  const grid = useMemo(
    () => buildGrid(modulus, operation),
    [modulus, operation],
  );
  const prime = useMemo(() => isPrime(modulus), [modulus]);
  const selectedInfo = selected
    ? {
        row: selected.row,
        col: selected.col,
        value: grid[selected.row][selected.col],
      }
    : null;

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Modular Arithmetic Grid</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Explore the full addition or multiplication table modulo n. Click any
        cell to inspect the congruence class it produces.
      </p>

      <div className="space-y-4 mb-4">
        <SliderControl
          label={`modulus n = ${modulus}`}
          min={2}
          max={17}
          step={1}
          value={modulus}
          onChange={(value) => setModulus(Math.max(2, value))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm">
            <span>Operation</span>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="add">Addition</option>
              <option value="mult">Multiplication</option>
            </select>
          </label>
          <div className="rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm">
            <div className="font-semibold mb-2">Prime modulus?</div>
            <div>
              {prime
                ? "Yes — every nonzero element has a multiplicative inverse"
                : "No — zero divisors appear in multiplication"}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white dark:bg-slate-950 p-2 text-left text-slate-500">
                {operation === "add" ? "+" : "×"}
              </th>
              {Array.from({ length: modulus }, (_, i) => (
                <th
                  key={i}
                  className="border border-slate-200 bg-slate-50 px-2 py-1 text-center font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, a) => (
              <tr key={a}>
                <td className="sticky left-0 z-10 border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  {a}
                </td>
                {row.map((value, b) => {
                  const active = selected?.row === a && selected?.col === b;
                  return (
                    <td
                      key={`${a}-${b}`}
                      onClick={() => setSelected({ row: a, col: b })}
                      className={`cursor-pointer border border-slate-200 px-2 py-1 text-center text-slate-700 transition ${active ? "bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200" : "hover:bg-slate-100 dark:hover:bg-slate-800"} dark:border-slate-800`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-2">What does this tell us?</div>
          <p className="text-slate-600 dark:text-slate-300">
            The table shows the congruence class of every pair of inputs. For
            addition, each row is a shifted version of the first row. For
            multiplication, patterns depend critically on whether n is prime.
          </p>
        </div>
        {selectedInfo ? (
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="font-semibold mb-2">Selected cell</div>
            <div className="text-slate-700 dark:text-slate-200">
              {selectedInfo.row} {operation === "add" ? "+" : "×"}{" "}
              {selectedInfo.col} ≡ {selectedInfo.value} (mod {modulus})
            </div>
            <div className="mt-2 text-slate-500 dark:text-slate-400">
              Click any cell to explore the modular arithmetic result directly.
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500">
            Click a cell in the table to inspect the congruence output.
          </div>
        )}
      </div>
    </div>
  );
}
