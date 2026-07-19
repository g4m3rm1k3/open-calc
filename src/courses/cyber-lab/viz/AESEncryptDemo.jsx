import { useState } from 'react'

// Real AES-256-GCM via the Web Crypto API — the same native primitive a
// browser uses for actual encrypted traffic, not a simulation. GCM is
// authenticated encryption: `encrypt` appends a 16-byte auth tag to the
// ciphertext, and `decrypt` recomputes and checks it before returning any
// plaintext at all — flip even one ciphertext byte and decrypt rejects the
// whole thing instead of returning corrupted data.
async function generateKey() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
}

async function encrypt(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
  return { iv, ciphertext: new Uint8Array(ciphertext) }
}

async function decrypt(key, iv, ciphertext) {
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(plainBuf)
}

function toHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function AESEncryptDemo({ params = {} }) {
  const [plaintext, setPlaintext] = useState(params.plaintext ?? 'Meet at the docks at midnight')
  const [key, setKey] = useState(null)
  const [iv, setIv] = useState(null)
  const [ciphertext, setCiphertext] = useState(null)
  const [decrypted, setDecrypted] = useState(null)
  const [tamperedResult, setTamperedResult] = useState(null)
  const [busy, setBusy] = useState(false)

  const runEncrypt = async () => {
    setBusy(true)
    setDecrypted(null)
    setTamperedResult(null)
    const k = key ?? (await generateKey())
    if (!key) setKey(k)
    const { iv: newIv, ciphertext: ct } = await encrypt(k, plaintext)
    setIv(newIv)
    setCiphertext(ct)
    setBusy(false)
  }

  const runDecrypt = async () => {
    setBusy(true)
    const result = await decrypt(key, iv, ciphertext)
    setDecrypted(result)
    setBusy(false)
  }

  const runTamperedDecrypt = async () => {
    setBusy(true)
    const tampered = new Uint8Array(ciphertext)
    tampered[0] ^= 0xff // flip every bit in the first byte
    try {
      const result = await decrypt(key, iv, tampered)
      setTamperedResult({ ok: true, text: result })
    } catch (e) {
      setTamperedResult({ ok: false, error: e.message })
    }
    setBusy(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Plaintext</label>
      <input
        value={plaintext}
        onChange={(e) => setPlaintext(e.target.value)}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono mb-4"
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={runEncrypt}
          disabled={busy}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-brand-500 text-white disabled:opacity-50"
        >
          {key ? 'Re-encrypt with same key' : 'Generate key & encrypt'}
        </button>
        <button
          onClick={runDecrypt}
          disabled={busy || !ciphertext}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white disabled:opacity-50"
        >
          Decrypt
        </button>
        <button
          onClick={runTamperedDecrypt}
          disabled={busy || !ciphertext}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-rose-600 text-white disabled:opacity-50"
        >
          Flip 1 bit, then try to decrypt
        </button>
      </div>

      {ciphertext && (
        <div className="space-y-2 mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">IV (random, sent alongside — not secret)</p>
            <div className="rounded-lg bg-slate-900 dark:bg-black px-3 py-2 font-mono text-xs text-slate-400 break-all">{toHex(iv)}</div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Ciphertext (last 16 bytes are the auth tag)</p>
            <div className="rounded-lg bg-slate-900 dark:bg-black px-3 py-2 font-mono text-xs text-emerald-400 break-all">{toHex(ciphertext)}</div>
          </div>
        </div>
      )}

      {decrypted !== null && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-2">
          Decrypted with the same key: <strong className="font-mono">{decrypted}</strong> — same key both directions, that's what "symmetric" means.
        </p>
      )}

      {tamperedResult && (
        <p className={`text-sm mb-2 ${tamperedResult.ok ? 'text-rose-600' : 'text-rose-700 dark:text-rose-400'}`}>
          {tamperedResult.ok
            ? `Unexpected: tampered ciphertext still decrypted to "${tamperedResult.text}"`
            : `Decryption rejected: ${tamperedResult.error} — GCM's auth tag caught the single flipped bit and refused to return anything, instead of silently returning corrupted plaintext.`}
        </p>
      )}
    </div>
  )
}
