import { useMemo, useState } from "react";

function factorial(n) {
  let result = 1n;
  for (let i = 2n; i <= n; i += 1n) {
    result *= i;
  }
  return result;
}

export default function FactorialExplorer() {
  const [n, setN] = useState(5);
  const fact = useMemo(() => factorial(BigInt(Math.max(0, n))), [n]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Factorial Explorer</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Explore n! as the product of all positive integers up to n. Factorials
        grow very fast.
      </p>
      <label className="block mb-4 text-sm">
        n
        <input
          type="number"
          min={0}
          value={n}
          onChange={(e) => setN(Math.max(0, Number(e.target.value) || 0))}
          className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </label>
      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          {n}! =
        </div>
        <div className="text-xl font-semibold break-words">
          {fact.toString()}
        </div>
      </div>
    </div>
  );
}
