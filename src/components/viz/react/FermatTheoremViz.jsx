import { useMemo, useState } from "react";

function positiveMod(value, mod) {
  return ((value % mod) + mod) % mod;
}

export default function FermatTheoremViz() {
  const [a, setA] = useState(3);
  const [p, setP] = useState(7);
  const sequence = useMemo(() => {
    const mod = Math.max(2, p);
    return Array.from({ length: mod + 1 }, (_, k) => ({
      k,
      value: positiveMod(Math.pow(a, k), mod),
    }));
  }, [a, p]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Fermat's Little Theorem</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        For a prime modulus p, aᵖ⁻¹ ≡ 1 (mod p) whenever gcd(a, p) = 1. Watch
        the powers of a cycle.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 mb-4 text-sm">
        <label className="block">
          a
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          prime p
          <input
            type="number"
            min={2}
            value={p}
            onChange={(e) => setP(Math.max(2, Number(e.target.value) || 2))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="font-semibold mb-3">Residues of aᵏ mod p</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {sequence.map((item) => (
            <div
              key={item.k}
              className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"
            >
              <div className="text-slate-500">k = {item.k}</div>
              <div className="font-semibold">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm">
          {positiveMod(Math.pow(a, p - 1), p) === 1 ? (
            <span className="text-emerald-600 dark:text-emerald-300">
              Verified: a⁽p−1⁾ mod p = 1
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">
              Not 1 yet; try a different prime or base.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
