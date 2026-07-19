import { useEffect, useRef, useState } from 'react'

// A real, common weak-password wordlist (the kind that tops every published
// breach-analysis top-10 list) — not sensitive, just well-known.
const WORDLIST = [
  'password', '123456', 'qwerty', 'letmein', 'football',
  'monkey', 'dragon', 'baseball', 'iloveyou', 'trustno1',
  'sunshine', 'master', 'welcome', 'shadow', 'superman',
]

async function sha256(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Demonstrates the REAL reason salt matters: an attacker's precomputed
// "rainbow table" (hashes of the wordlist, computed once, with no salt)
// instantly matches an unsalted target — but the exact same table produces
// zero matches against a salted target, even though the plain password IS
// in the wordlist. Salt doesn't make any one guess slower to compute — it
// makes a precomputed table useless, forcing the attacker to redo the work
// specifically for this one salted hash.
export default function DictionaryAttack({ params = {} }) {
  const target = params.target ?? 'football'
  const demoSalt = params.salt ?? 'x7q2f9'
  const [salted, setSalted] = useState(false)
  const [running, setRunning] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [result, setResult] = useState(null) // { found: bool, word, hash }
  const cancelRef = useRef(false)

  const targetHash = useRef({ value: '' })

  // If this component unmounts (the lesson is navigated away from, the viz
  // is collapsed/removed) while runAttack's loop is still mid-flight, the
  // next state update after that would fire on an unmounted component —
  // this is what cancelRef actually guards against; nothing in the UI can
  // trigger a second overlapping run, since the button is disabled while
  // one is already in progress.
  useEffect(() => {
    return () => {
      cancelRef.current = true
    }
  }, [])

  const runAttack = async () => {
    setRunning(true)
    setResult(null)
    cancelRef.current = false

    const real = await sha256(salted ? demoSalt + target : target)
    targetHash.current.value = real

    for (let i = 0; i < WORDLIST.length; i++) {
      if (cancelRef.current) return
      setCurrentIndex(i)
      // The attacker's table was built WITHOUT salt, regardless of whether
      // the real target is salted — that mismatch is the entire point.
      const guessHash = await sha256(WORDLIST[i])
      await new Promise((resolve) => setTimeout(resolve, 220))
      if (guessHash === real) {
        setResult({ found: true, word: WORDLIST[i], hash: guessHash })
        setRunning(false)
        return
      }
    }
    setResult({ found: false })
    setRunning(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input type="checkbox" checked={salted} onChange={(e) => setSalted(e.target.checked)} disabled={running} />
          Target hash is salted (salt: <code className="font-mono">{demoSalt}</code>)
        </label>
        <button
          onClick={runAttack}
          disabled={running}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-brand-500 text-white disabled:opacity-50"
        >
          {running ? 'Attacking…' : 'Run precomputed-table attack'}
        </button>
      </div>
      <div className="space-y-1 font-mono text-xs">
        {WORDLIST.map((word, i) => {
          const isCurrent = i === currentIndex && running
          const isMatch = result?.found && result.word === word
          return (
            <div
              key={word}
              className={`px-2 py-1 rounded flex justify-between ${
                isMatch
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold'
                  : isCurrent
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'text-slate-500 dark:text-slate-500'
              }`}
            >
              <span>{word}</span>
              {isMatch && <span>✓ Found</span>}
              {isCurrent && !isMatch && <span>checking…</span>}
            </div>
          )
        })}
      </div>
      {result && !result.found && (
        <p className="mt-4 text-sm text-rose-600 dark:text-rose-400 font-semibold">
          ✗ Not found — the attacker's precomputed table has no entry that matches
          this salted hash, even though "{target}" is right there in the wordlist.
        </p>
      )}
      {result?.found && (
        <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
          ✓ Cracked in {WORDLIST.indexOf(result.word) + 1} guesses using a table the
          attacker built once, long before this leak ever happened.
        </p>
      )}
    </div>
  )
}
