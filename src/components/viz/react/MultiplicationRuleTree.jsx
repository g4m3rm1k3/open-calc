import { useMemo, useState } from "react";

export default function MultiplicationRuleTree() {
  const [levels, setLevels] = useState(3);
  const [choices, setChoices] = useState(4);
  const total = useMemo(() => Math.pow(choices, levels), [choices, levels]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Multiplication Rule Tree</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Model sequential choices as a branching tree, where each level
        multiplies the number of outcomes.
      </p>
      <div className="grid gap-3 sm:grid-cols-3 mb-4 text-sm">
        <label className="block">
          Levels
          <input
            type="number"
            min={1}
            value={levels}
            onChange={(e) =>
              setLevels(Math.max(1, Number(e.target.value) || 1))
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          Choices per level
          <input
            type="number"
            min={1}
            value={choices}
            onChange={(e) =>
              setChoices(Math.max(1, Number(e.target.value) || 1))
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm">
        <div className="font-semibold mb-2">Total outcomes</div>
        <div className="text-xl font-semibold">
          {choices}ⁿ = {total}
        </div>
        <div className="text-slate-500 dark:text-slate-400 mt-2">
          Each level multiplies by {choices}.
        </div>
      </div>
    </div>
  );
}
