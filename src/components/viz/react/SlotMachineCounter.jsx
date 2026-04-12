import { useMemo, useState } from "react";

export default function SlotMachineCounter() {
  const [reels, setReels] = useState(3);
  const [symbols, setSymbols] = useState(5);
  const outcomes = useMemo(() => Math.pow(symbols, reels), [symbols, reels]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Slot Machine Counter</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Each reel can show several symbols. Multiply choices on each reel to
        count total slot outcomes.
      </p>
      <div className="grid gap-3 sm:grid-cols-3 mb-4 text-sm">
        <label className="block">
          Reels
          <input
            type="number"
            min={1}
            value={reels}
            onChange={(e) => setReels(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          Symbols per reel
          <input
            type="number"
            min={1}
            value={symbols}
            onChange={(e) =>
              setSymbols(Math.max(1, Number(e.target.value) || 1))
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm">
        <div className="font-semibold mb-2">Total slot machine outcomes</div>
        <div className="text-xl font-semibold">
          {symbols}^{reels} = {outcomes}
        </div>
        <div className="text-slate-500 dark:text-slate-400 mt-2">
          Every reel multiplies the outcome count by {symbols}.
        </div>
      </div>
    </div>
  );
}
