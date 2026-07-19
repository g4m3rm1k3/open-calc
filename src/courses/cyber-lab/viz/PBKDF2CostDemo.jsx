import { useState } from 'react'

// Real PBKDF2 via Web Crypto — genuinely slow at a high iteration count, no
// artificial delay. Same family of function as bcrypt/scrypt/Argon2
// (deliberately expensive key derivation), used for real in things like
// WPA2 Wi-Fi and several password managers — an actual cost, not a
// simulated one.
async function pbkdf2(password, salt, iterations) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations },
    keyMaterial,
    256,
  )
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function PBKDF2CostDemo({ params = {} }) {
  const [password, setPassword] = useState(params.password ?? 'password123')
  const [iterations, setIterations] = useState(params.iterations ?? 10000)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  const run = async () => {
    setRunning(true)
    const start = performance.now()
    const key = await pbkdf2(password, 'fixed-demo-salt', iterations)
    const elapsedMs = performance.now() - start
    setResult({ key, elapsedMs })
    setRunning(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Iterations: {iterations.toLocaleString()}
          </label>
          <input
            type="range"
            min="1000"
            max="1000000"
            step="1000"
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      <button
        onClick={run}
        disabled={running}
        className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-brand-500 text-white disabled:opacity-50 mb-4"
      >
        {running ? 'Deriving…' : 'Derive key with PBKDF2-SHA256'}
      </button>
      {result && (
        <>
          <div className="rounded-lg bg-slate-900 dark:bg-black px-3 py-2.5 font-mono text-sm text-emerald-400 break-all mb-2">
            {result.key}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real measured time: <strong>{result.elapsedMs.toFixed(1)} ms</strong> — genuine
            computation, not a fake delay. Drag the slider up and re-run: the
            cost really does scale with iteration count. bcrypt, scrypt, and
            Argon2 (what real systems actually use for passwords) go further
            by also requiring a large amount of memory per guess, not just
            time — that memory-hardness resists cracking on cheap,
            massively-parallel GPU/ASIC hardware in a way plain iterated
            hashing like this isn't. This demo shows the "cost" idea honestly
            with a real primitive; it isn't literally bcrypt.
          </p>
        </>
      )}
    </div>
  )
}
