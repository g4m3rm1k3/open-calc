import { useMemo, useState } from "react";

function factorial(n) {
  let result = 1n;
  for (let i = 2n; i <= n; i += 1n) {
    result *= i;
  }
  return result;
}

export default function PermutationVsCombinationAnimator() {
  const [n, setN] = useState(6);
  const [k, setK] = useState(3);
  const { perm, comb } = useMemo(() => {
    const bigN = BigInt(Math.max(0, n));
    const bigK = BigInt(Math.min(Math.max(0, k), n));
    const numerator = factorial(bigN);
    const permValue = numerator / factorial(bigN - bigK);
    const combValue = permValue / factorial(bigK);
    return { perm: permValue, comb: combValue };
  }, [n, k]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Permutation vs Combination</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Compare order-sensitive arrangements (permutations) against order-free
        selections (combinations).
      </p>
      <div className="grid gap-3 sm:grid-cols-3 mb-4 text-sm">
        <label className="block">
          n
          <input
            type="number"
            min={0}
            value={n}
            onChange={(e) => setN(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          k
          <input
            type="number"
            min={0}
            max={n}
            value={k}
            onChange={(e) =>
              setK(Math.max(0, Math.min(Number(e.target.value) || 0, n)))
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <div className="font-semibold">Permutations</div>
            <div>
              {n}P{k} = {perm.toString()}
            </div>
            <div className="text-slate-500 dark:text-slate-400 mt-2">
              Order matters
            </div>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <div className="font-semibold">Combinations</div>
            <div>
              {n}C{k} = {comb.toString()}
            </div>
            <div className="text-slate-500 dark:text-slate-400 mt-2">
              Order does not matter
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
