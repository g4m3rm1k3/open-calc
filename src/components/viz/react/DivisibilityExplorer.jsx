import { useMemo, useState } from "react";

function divisors(n) {
  if (n === 0) return [];
  const absN = Math.abs(n);
  const result = [];
  for (let i = 1; i <= absN; i += 1) {
    if (absN % i === 0) result.push(i);
  }
  return result;
}

export default function DivisibilityExplorer() {
  const [a, setA] = useState(18);
  const [b, setB] = useState(30);

  const result = useMemo(() => {
    const divA = divisors(a);
    const divB = divisors(b);
    const common = divA.filter((value) => divB.includes(value));
    return { divA, divB, common, gcd: common[common.length - 1] ?? 1 };
  }, [a, b]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Divisibility Explorer</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Enter two numbers and inspect their divisor lattices. The greatest
        common divisor is the highest shared node.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 mb-4 text-sm">
        <label className="block">
          A
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          B
          <input
            type="number"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 text-sm">
        <div className="rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-2">Divisors of {a}</div>
          <div className="flex flex-wrap gap-2">
            {result.divA.map((value) => (
              <span
                key={value}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-2">Divisors of {b}</div>
          <div className="flex flex-wrap gap-2">
            {result.divB.map((value) => (
              <span
                key={value}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="font-semibold mb-2">Common divisors</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {result.common.map((value) => (
              <span
                key={value}
                className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                {value}
              </span>
            ))}
          </div>
          <div className="text-sm font-semibold">
            gcd({a}, {b}) = {result.gcd}
          </div>
        </div>
      </div>
    </div>
  );
}
