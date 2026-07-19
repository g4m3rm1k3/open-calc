import { useEffect, useState } from 'react'

async function sha256(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function DiffHash({ hash, other }) {
  return (
    <div className="rounded-lg bg-slate-900 dark:bg-black px-3 py-2.5 font-mono text-sm break-all min-h-[2.5rem]">
      {[...hash].map((ch, i) => (
        <span key={i} className={other[i] === ch ? 'text-slate-500' : 'text-rose-400 font-bold'}>
          {ch}
        </span>
      ))}
    </div>
  )
}

// Real SHA-256 of two near-identical inputs, diffed hex-digit by hex-digit —
// proves the avalanche effect (a one-character change flips roughly half the
// output) instead of just asserting it in prose.
export default function AvalancheDiff({ params = {} }) {
  const [textA, setTextA] = useState(params.textA ?? 'password')
  const [textB, setTextB] = useState(params.textB ?? 'passworE')
  const [hashA, setHashA] = useState('')
  const [hashB, setHashB] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([sha256(textA), sha256(textB)]).then(([a, b]) => {
      if (!cancelled) {
        setHashA(a)
        setHashB(b)
      }
    })
    return () => {
      cancelled = true
    }
  }, [textA, textB])

  const changedCount = hashA && hashB ? [...hashA].filter((ch, i) => ch !== hashB[i]).length : 0
  const percent = hashA ? Math.round((changedCount / hashA.length) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Input A</label>
          <input
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Input B</label>
          <input
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">SHA-256(A)</label>
      {hashA && <DiffHash hash={hashA} other={hashB} />}
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3 mb-1.5">SHA-256(B)</label>
      {hashB && <DiffHash hash={hashB} other={hashA} />}
      {hashA && hashB && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-bold text-rose-500 dark:text-rose-400">{percent}%</span> of the hex output
          changed from a single-character difference in the input. This is the
          <strong> avalanche effect</strong> — a well-built hash function should
          flip roughly half its output for any change, no matter how small.
        </p>
      )}
    </div>
  )
}
