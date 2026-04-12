import { useMemo, useState } from "react";

export default function ComplementaryCountingViz() {
  const [total, setTotal] = useState(100);
  const [include, setInclude] = useState(30);
  const outside = useMemo(() => Math.max(0, total - include), [total, include]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Complementary Counting</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Count the complement instead of direct outcomes when the complement is
        easier to describe.
      </p>
      <div className="grid gap-3 sm:grid-cols-3 mb-4 text-sm">
        <label className="block">
          Total outcomes
          <input
            type="number"
            min={0}
            value={total}
            onChange={(e) => setTotal(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          Included outcomes
          <input
            type="number"
            min={0}
            value={include}
            onChange={(e) =>
              setInclude(Math.max(0, Number(e.target.value) || 0))
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm">
        <div className="font-semibold mb-2">Complement count</div>
        <div className="text-xl font-semibold">{outside}</div>
        <div className="text-slate-500 dark:text-slate-400 mt-2">
          Because total − included = complement.
        </div>
      </div>
    </div>
  );
}
