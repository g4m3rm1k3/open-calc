import { useMemo, useState } from "react";

export default function InclusionExclusionAnimator() {
  const [a, setA] = useState(50);
  const [b, setB] = useState(30);
  const [ab, setAB] = useState(15);
  const total = useMemo(() => a + b - ab, [a, b, ab]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">
        Inclusion-Exclusion Animator
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Visualize the formula |A ∪ B| = |A| + |B| - |A ∩ B| to avoid double
        counting.
      </p>
      <div className="grid gap-3 sm:grid-cols-3 mb-4 text-sm">
        <label className="block">
          |A|
          <input
            type="number"
            min={0}
            value={a}
            onChange={(e) => setA(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          |B|
          <input
            type="number"
            min={0}
            value={b}
            onChange={(e) => setB(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          |A ∩ B|
          <input
            type="number"
            min={0}
            value={ab}
            onChange={(e) => setAB(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm">
        <div className="font-semibold mb-2">Union size</div>
        <div className="text-xl font-semibold">
          {a} + {b} - {ab} = {total}
        </div>
        <div className="text-slate-500 dark:text-slate-400 mt-2">
          Subtract the overlap once to count all elements exactly once.
        </div>
      </div>
    </div>
  );
}
