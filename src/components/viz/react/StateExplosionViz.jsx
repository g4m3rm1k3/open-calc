import { useMemo, useState } from "react";

export default function StateExplosionViz() {
  const [branch, setBranch] = useState(2);
  const [depth, setDepth] = useState(5);
  const total = useMemo(
    () => Math.pow(Math.max(1, branch), Math.max(0, depth)),
    [branch, depth],
  );

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">State Explosion</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Increase depth or branching factor and watch how fast the number of
        reachable states grows.
      </p>
      <div className="grid gap-3 sm:grid-cols-3 mb-4 text-sm">
        <label className="block">
          Branching factor
          <input
            type="number"
            min={1}
            value={branch}
            onChange={(e) =>
              setBranch(Math.max(1, Number(e.target.value) || 1))
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          Depth
          <input
            type="number"
            min={0}
            value={depth}
            onChange={(e) => setDepth(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm">
        <div className="font-semibold mb-2">Number of states</div>
        <div className="text-xl font-semibold">
          {branch}^{depth} = {total}
        </div>
        <div className="text-slate-500 dark:text-slate-400 mt-2">
          The state space grows exponentially with depth.
        </div>
      </div>
    </div>
  );
}
