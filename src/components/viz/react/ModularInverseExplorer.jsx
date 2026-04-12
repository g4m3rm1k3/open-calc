import { useMemo, useState } from "react";
import SliderControl from "../SliderControl.jsx";

function positiveMod(value, mod) {
  return ((value % mod) + mod) % mod;
}

function modInverse(a, n) {
  let t = 0;
  let newT = 1;
  let r = n;
  let newR = positiveMod(a, n);
  while (newR !== 0) {
    const q = Math.floor(r / newR);
    [t, newT] = [newT, t - q * newT];
    [r, newR] = [newR, r - q * newR];
  }
  if (r > 1) return null;
  return positiveMod(t, n);
}

export default function ModularInverseExplorer() {
  const [a, setA] = useState(3);
  const [n, setN] = useState(11);
  const [selectedX, setSelectedX] = useState(1);
  const inverse = useMemo(() => modInverse(a, n), [a, n]);
  const row = useMemo(
    () =>
      Array.from({ length: n }, (_, x) => ({
        x,
        value: positiveMod(a * x, n),
      })),
    [a, n],
  );

  const selectedValue = row.find((entry) => entry.x === selectedX)?.value;

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Modular Inverse Explorer</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Explore the multiplication row for a modulo n and find the x that makes
        ax ≡ 1 (mod n).
      </p>

      <div className="space-y-4 mb-4">
        <SliderControl
          label={`a = ${a}`}
          min={1}
          max={20}
          step={1}
          value={a}
          onChange={setA}
        />
        <SliderControl
          label={`n = ${n}`}
          min={2}
          max={29}
          step={1}
          value={n}
          onChange={setN}
        />
      </div>

      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="font-semibold mb-3">Multiplication row</div>
        <div className="flex flex-wrap gap-2">
          {row.map((entry) => {
            const isInverse = entry.value === 1;
            const isSelected = entry.x === selectedX;
            return (
              <button
                key={entry.x}
                type="button"
                onClick={() => setSelectedX(entry.x)}
                className={`rounded-xl border px-3 py-2 text-sm transition ${isSelected ? "border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-400 dark:bg-blue-900/50 dark:text-blue-200" : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}
              >
                x={entry.x} → {entry.value}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <div className="font-semibold mb-2">Selected multiplier</div>
            <div>
              {a}×{selectedX} ≡ {selectedValue} (mod {n})
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <div className="font-semibold mb-2">Inverse check</div>
            {inverse === null ? (
              <div className="text-rose-600 dark:text-rose-400">
                No inverse exists because gcd({a}, {n}) &ne; 1.
              </div>
            ) : (
              <div className="text-emerald-600 dark:text-emerald-300">
                Inverse: {a}⁻¹ ≡ {inverse} (mod {n})
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
