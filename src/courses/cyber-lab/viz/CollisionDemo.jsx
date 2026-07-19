import { useEffect, useState } from 'react'
import md5 from 'js-md5'

// A real, published MD5 collision — Wang, Feng, Lai & Yu, 2004 (reproduced
// on Wikipedia's MD5 article). Two DIFFERENT 128-byte messages, differing in
// exactly 6 bytes, that hash to the identical MD5 digest. This is not a toy
// example or a live-generated collision (finding a fresh MD5 collision is
// still expensive even today) — it's the real, historical pair that helped
// end MD5's use for anything security-sensitive. Verified directly against
// this exact js-md5 build before shipping: both inputs below really do hash
// to 79054025255fb1a26e4bc422aef54eb4.
const MESSAGE_A_HEX =
  'd131dd02c5e6eec4693d9a0698aff95c2fcab58712467eab4004583eb8fb7f8' +
  '955ad340609f4b30283e488832571415a085125e8f7cdc99fd91dbdf280373' +
  'c5bd8823e3156348f5bae6dacd436c919c6dd53e2b487da03fd02396306d24' +
  '8cda0e99f33420f577ee8ce54b67080a80d1ec69821bcb6a8839396f9652b6' +
  'ff72a70'
const MESSAGE_B_HEX =
  'd131dd02c5e6eec4693d9a0698aff95c2fcab50712467eab4004583eb8fb7f8' +
  '955ad340609f4b30283e4888325f1415a085125e8f7cdc99fd91dbd7280373' +
  'c5bd8823e3156348f5bae6dacd436c919c6dd53e23487da03fd02396306d24' +
  '8cda0e99f33420f577ee8ce54b67080280d1ec69821bcb6a8839396f965ab6' +
  'ff72a70'

function hexToBytes(hex) {
  const bytes = []
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16))
  return bytes
}

function diffCount(hexA, hexB) {
  const a = hexToBytes(hexA)
  const b = hexToBytes(hexB)
  return a.filter((byte, i) => byte !== b[i]).length
}

export default function CollisionDemo() {
  const [hashA, setHashA] = useState('')
  const [hashB, setHashB] = useState('')

  useEffect(() => {
    setHashA(md5(hexToBytes(MESSAGE_A_HEX)))
    setHashB(md5(hexToBytes(MESSAGE_B_HEX)))
  }, [])

  const collides = hashA && hashB && hashA === hashB

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Two genuinely different 128-byte messages, differing in exactly{' '}
        <strong>{diffCount(MESSAGE_A_HEX, MESSAGE_B_HEX)} bytes</strong> — a
        real collision published by Wang, Feng, Lai &amp; Yu in 2004, not a
        made-up example.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Message A (128 bytes)</label>
          <div className="rounded-lg bg-slate-100 dark:bg-slate-950 px-3 py-2 font-mono text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 break-all">
            {MESSAGE_A_HEX}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Message B (128 bytes)</label>
          <div className="rounded-lg bg-slate-100 dark:bg-slate-950 px-3 py-2 font-mono text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 break-all">
            {MESSAGE_B_HEX}
          </div>
        </div>
      </div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">MD5(A)</label>
      <div className="rounded-lg bg-slate-900 dark:bg-black px-3 py-2.5 font-mono text-sm text-emerald-400 break-all mb-2">{hashA}</div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">MD5(B)</label>
      <div className="rounded-lg bg-slate-900 dark:bg-black px-3 py-2.5 font-mono text-sm text-emerald-400 break-all">{hashB}</div>
      {collides && (
        <p className="mt-4 text-sm font-semibold text-rose-600 dark:text-rose-400">
          ⚠ Identical hash from different input — this is exactly why MD5 (and
          later SHA-1, broken the same way by Google &amp; CWI's 2017
          "SHAttered" attack) is no longer trusted anywhere collisions matter:
          digital signatures, certificates, integrity checks.
        </p>
      )}
    </div>
  )
}
