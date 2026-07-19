// A pure diagram — no computation, just the flow that pre-empts the most
// common beginner misconception ("hashing is how login works" collapsing
// into "the server can just un-hash it") by showing the two moments a
// password is hashed are different moments, doing different things.
export default function RegistrationLoginFlow() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
          Registration (once)
        </p>
        <div className="space-y-2 font-mono text-sm">
          <div className="rounded bg-slate-100 dark:bg-slate-800 px-3 py-2">password</div>
          <div className="text-center text-slate-400">↓ hash</div>
          <div className="rounded bg-emerald-100 dark:bg-emerald-900/40 px-3 py-2 text-emerald-700 dark:text-emerald-300">
            hash stored in database
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
          Login (every time)
        </p>
        <div className="space-y-2 font-mono text-sm">
          <div className="rounded bg-slate-100 dark:bg-slate-800 px-3 py-2">password (typed again)</div>
          <div className="text-center text-slate-400">↓ hash again</div>
          <div className="rounded bg-brand-100 dark:bg-brand-900/40 px-3 py-2 text-brand-700 dark:text-brand-300">
            compare to the stored hash
          </div>
        </div>
      </div>
      <p className="sm:col-span-2 text-sm text-slate-600 dark:text-slate-400 mt-2">
        The server never stores your password and never "un-hashes" anything
        to check it — it hashes what you just typed and compares the two
        hashes. This is why a real login can never email you your old
        password back: nobody, including the server, has it anymore.
      </p>
    </div>
  )
}
