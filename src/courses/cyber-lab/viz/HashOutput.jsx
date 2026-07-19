import { useEffect, useState } from 'react'
import md5 from 'js-md5'

const ALGORITHMS = ['MD5', 'SHA-1', 'SHA-256']

// Real hashes only — MD5/SHA-1 via js-md5/SubtleCrypto (both genuinely
// broken as password hashes, which is the point), SHA-256 via SubtleCrypto.
// Nothing here is simulated.
async function computeHash(algorithm, text) {
  if (algorithm === 'MD5') return md5(text)
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest(algorithm, bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// The base primitive every other Cyber Lab hashing viz builds on: type text,
// pick an algorithm, see a real hash. `params` are just starting values —
// interacting with the widget only changes local state, never fed back
// through onParamChange, since nothing here needs to survive a fullscreen
// expand/collapse remount.
export default function HashOutput({ params = {} }) {
  const [text, setText] = useState(params.text ?? 'password123')
  const [algorithm, setAlgorithm] = useState(params.algorithm ?? 'SHA-256')
  const [hash, setHash] = useState('')

  useEffect(() => {
    let cancelled = false
    computeHash(algorithm, text).then((result) => {
      if (!cancelled) setHash(result)
    })
    return () => {
      cancelled = true
    }
  }, [text, algorithm])

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
        Input
      </label>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 mb-4"
      />
      <div className="flex gap-2 mb-4">
        {ALGORITHMS.map((a) => (
          <button
            key={a}
            onClick={() => setAlgorithm(a)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              algorithm === a
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
        Hash
      </label>
      <div className="rounded-lg bg-slate-900 dark:bg-black px-3 py-2.5 font-mono text-sm text-emerald-400 break-all min-h-[2.5rem]">
        {hash}
      </div>
    </div>
  )
}
