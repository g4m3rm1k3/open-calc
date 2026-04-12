import { useMemo, useState } from "react";

function isPrime(value) {
  if (value < 2) return false;
  for (let i = 2; i * i <= value; i += 1) {
    if (value % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function modInverse(a, m) {
  let m0 = m;
  let x0 = 0;
  let x1 = 1;
  if (m === 1) return 0;
  while (a > 1) {
    const q = Math.floor(a / m);
    [a, m] = [m, a % m];
    [x0, x1] = [x1 - q * x0, x0];
  }
  return x1 < 0 ? x1 + m0 : x1;
}

export default function RSAMiniDemo() {
  const [p, setP] = useState(11);
  const [q, setQ] = useState(17);
  const [e, setE] = useState(7);
  const [message, setMessage] = useState(42);
  const { n, phi, d, valid, cipher, plain } = useMemo(() => {
    const P = Math.max(2, Number(p));
    const Q = Math.max(2, Number(q));
    const N = P * Q;
    const PHI = (P - 1) * (Q - 1);
    const D = gcd(e, PHI) === 1 ? modInverse(e, PHI) : null;
    const C = D ? Math.pow(message, e) % N : null;
    const PLAIN = D ? Math.pow(C, D) % N : null;
    return {
      n: N,
      phi: PHI,
      d: D,
      valid: isPrime(P) && isPrime(Q),
      cipher: C,
      plain: PLAIN,
    };
  }, [p, q, e, message]);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-3">RSA Mini Demo</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Pick two small primes and a public exponent. Watch key generation and
        simple encryption / decryption.
      </p>
      <div className="grid gap-3 sm:grid-cols-4 mb-4 text-sm">
        <label className="block">
          p
          <input
            type="number"
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          q
          <input
            type="number"
            value={q}
            onChange={(e) => setQ(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          e
          <input
            type="number"
            value={e}
            onChange={(e) => setE(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          message
          <input
            type="number"
            value={message}
            onChange={(e) => setMessage(Number(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
      <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm">
        <div className="grid gap-2 sm:grid-cols-2 mb-3">
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <div className="font-semibold">n = p × q</div>
            <div>{n}</div>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <div className="font-semibold">φ(n)</div>
            <div>{phi}</div>
          </div>
        </div>
        <div className="mb-3 text-sm">
          {valid ? (
            <span className="text-emerald-600 dark:text-emerald-300">
              p and q are prime.
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">
              Choose primes for p and q.
            </span>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <div className="font-semibold">Public exponent e</div>
            <div>{e}</div>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <div className="font-semibold">Private exponent d</div>
            <div>{d ?? "none"}</div>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <div className="font-semibold">cipher</div>
            <div>{cipher ?? "—"}</div>
          </div>
        </div>
        <div className="mt-4 text-sm">
          {d ? (
            <span className="text-emerald-600 dark:text-emerald-300">
              Decrypted message = {plain}
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Adjust e to be coprime with φ(n) to compute d.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
