export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-12-effect-cleanup',
  title: '12. Effect Cleanup & Dependencies',
  chapter: 'react-ch3',
  language: 'react',
  checkpoints: [
    { id: 'cp-cleanup-fn', label: 'Cleanup Function' },
    { id: 'cp-abort-controller', label: 'AbortController' },
    { id: 'cp-stale-closure', label: 'Stale Closures' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'why-cleanup',
      text: "When a component unmounts, any ongoing side effects it started — intervals, event listeners, open connections — keep running unless you explicitly stop them. React solves this with the cleanup function: whatever you return from a useEffect callback, React calls it before running the effect again or when the component unmounts. No return means no cleanup.",
      code: `const { useState, useEffect } = React

function Timer({ label, color }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    // Returning a function = cleanup
    return () => {
      clearInterval(id)
      console.log(label + ' cleaned up')
    }
  }, [])

  return (
    <div style={{ background: '#0f172a', padding: '14px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color, fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#f1f5f9', fontFamily: 'monospace', fontSize: '1.2rem' }}>{tick}s</span>
    </div>
  )
}

function App() {
  const [show, setShow] = useState(true)
  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Cleanup on Unmount</h2>
      {show && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <Timer label="Timer A" color="#38bdf8" />
          <Timer label="Timer B" color="#a78bfa" />
        </div>
      )}
      <button onClick={() => setShow(s => !s)} style={{ padding: '10px 20px', background: show ? '#f43f5e' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
        {show ? 'Unmount Timers (cleans up!)' : 'Mount Timers'}
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'clearinterval-cleanup',
      text: "The most common cleanup: clearing a setInterval. Without clearInterval, unmounting a component leaves an orphaned interval incrementing state that no longer exists — a memory leak. The pattern is always: capture the interval ID in a variable, return a cleanup that calls clearInterval with that ID.",
      code: `const { useState, useEffect } = React

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return      // nothing to clean up when stopped

    const id = setInterval(() => {
      setElapsed(e => e + 1)
    }, 1000)

    return () => clearInterval(id)   // ← cleanup runs when running changes or component unmounts
  }, [running])

  const fmt = s => {
    const m = String(Math.floor(s / 60)).padStart(2, '0')
    const sec = String(s % 60).padStart(2, '0')
    return m + ':' + sec
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '360px', textAlign: 'center' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px' }}>Stopwatch</h2>
      <div style={{ fontSize: '4rem', fontWeight: 700, fontFamily: 'monospace', marginBottom: '24px', color: running ? '#f1f5f9' : '#475569' }}>
        {fmt(elapsed)}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => setRunning(true)} disabled={running} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.5 : 1 }}>Start</button>
        <button onClick={() => setRunning(false)} disabled={!running} style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: !running ? 'not-allowed' : 'pointer', opacity: !running ? 0.5 : 1 }}>Stop</button>
        <button onClick={() => { setRunning(false); setElapsed(0) }} style={{ padding: '10px 20px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Reset</button>
      </div>
    </div>
  )
}

function App() { return <Stopwatch /> }

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-cleanup-fn'
    },
    {
      type: 'narration',
      id: 'abort-controller',
      text: "Fetch requests don't stop when a component unmounts — they complete in the background and then try to call setState on a dead component. The fix: AbortController. Create one inside the effect, pass its signal to fetch, and call abort() in the cleanup. If the fetch is cancelled, it throws an AbortError — check for it in your catch block so you don't show a false error.",
      code: `const { useState, useEffect } = React

function App() {
  const [userId, setUserId] = useState(1)
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(
          'https://jsonplaceholder.typicode.com/users/' + userId,
          { signal: controller.signal }   // attach signal
        )
        const data = await res.json()
        setUser(data)
      } catch (e) {
        if (e.name === 'AbortError') return   // fetch was cancelled — not an error
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()   // cleanup: cancel in-flight request
  }, [userId])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>AbortController</h2>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[1,2,3,4,5].map(id => (
          <button key={id} onClick={() => setUserId(id)} style={{ padding: '8px 14px', background: userId === id ? '#38bdf8' : '#0f172a', color: userId === id ? '#0f172a' : '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: userId === id ? 700 : 400 }}>
            {id}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ color: '#475569' }}>Loading...</div>
      ) : user ? (
        <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px' }}>
          <div style={{ fontWeight: 700 }}>{user.name}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>{user.email}</div>
        </div>
      ) : null}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'stale-closure',
      text: "A stale closure is when an effect captures a variable from render, but that variable becomes outdated before the effect runs again. This happens when the dependency array is incomplete. The symptom: your effect reads an old value. The fix: add the variable to the deps array, or use the functional form of setState — `setCount(prev => prev + 1)` — which always has the latest value.",
      code: `const { useState, useEffect } = React

function App() {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState([])

  // PROBLEM: deps missing 'count' — effect captures stale value
  useEffect(() => {
    const id = setInterval(() => {
      // count is stale here — always 0!
      setLog(prev => [...prev.slice(-4), 'stale count: ' + count])
    }, 1000)
    return () => clearInterval(id)
  }, [])  // <-- missing count in deps

  // FIX: use functional setState — always has fresh value
  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => {
        setLog(prev2 => [...prev2.slice(-4), 'fresh count: ' + prev])
        return prev + 1
      })
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 8px' }}>Stale Closure Demo</h2>
      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Count: {count}</div>
      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', minHeight: '80px' }}>
        {log.map((l, i) => (
          <div key={i} style={{ color: l.startsWith('stale') ? '#f59e0b' : '#10b981', fontSize: '0.8rem', padding: '2px 0' }}>{l}</div>
        ))}
      </div>
      <div style={{ marginTop: '12px', color: '#64748b', fontSize: '0.8rem' }}>
        Yellow = stale (wrong). Green = functional update (correct).
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-abort-controller'
    },
    {
      type: 'narration',
      id: 'deps-decision-tree',
      text: "Deciding what goes in the deps array: include every value your effect reads that could change between renders — state, props, variables derived from state or props. Exclude: things that never change (refs, setState functions, constants defined outside the component). The ESLint exhaustive-deps rule automates this — it catches missing deps before they become bugs.",
      code: `const { useState, useEffect, useCallback } = React

function App() {
  const [query, setQuery]   = useState('')
  const [result, setResult] = useState(null)
  const BASE = 'https://jsonplaceholder.typicode.com'  // constant — excluded from deps

  useEffect(() => {
    if (!query) { setResult(null); return }
    // query is in deps because the effect reads it
    fetch(BASE + '/users?_limit=3')
      .then(r => r.json())
      .then(users => {
        const match = users.filter(u =>
          u.name.toLowerCase().includes(query.toLowerCase())
        )
        setResult(match)
      })
  }, [query])  // BASE excluded — it never changes; setResult excluded — always stable

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Deps Decision Tree</h2>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type a name (Leanne, Ervin, Clementine...)"
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '16px' }}
      />
      {result && result.map(u => (
        <div key={u.id} style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600 }}>{u.name}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '10px' }}>{u.email}</span>
        </div>
      ))}
      {result && result.length === 0 && <div style={{ color: '#475569' }}>No match</div>}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'extract-outside-component',
      text: "If a function or value is stable and doesn't use component state or props, define it outside the component. That removes it from the deps concern entirely. Pure utility functions belong outside. Functions that read state belong inside (or use useCallback). This keeps the deps array minimal and accurate.",
      code: `const { useState, useEffect } = React

// Pure function — defined OUTSIDE the component
// No state, no props → never needs to be in deps
function formatUser(user) {
  return user.name + ' (' + user.email + ')'
}

function App() {
  const [id, setId]   = useState(1)
  const [info, setInfo] = useState('')

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users/' + id)
      .then(r => r.json())
      .then(u => setInfo(formatUser(u)))   // formatUser not in deps — defined outside
  }, [id])   // only id needs to be here

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Extract Pure Fns Outside</h2>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {[1,2,3].map(n => (
          <button key={n} onClick={() => setId(n)} style={{ padding: '8px 16px', background: id === n ? '#38bdf8' : '#0f172a', color: id === n ? '#0f172a' : '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: id === n ? 700 : 400 }}>
            User {n}
          </button>
        ))}
      </div>
      <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', color: '#94a3b8' }}>
        {info || 'Loading...'}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-stale-closure'
    },
    {
      type: 'narration',
      id: 'summary-cleanup',
      text: "The cleanup function is React's way of letting your effect clean up after itself. Return it from every effect that starts something ongoing: intervals, listeners, subscriptions, or in-flight requests. The rule: if you start something, return a function that stops it. Think of every effect as an open/close pair — useEffect opens, the cleanup closes.",
      code: `const { useState, useEffect } = React

function App() {
  const rules = [
    { start: 'setInterval(fn, ms)',            stop: 'clearInterval(id)',         color: '#38bdf8' },
    { start: 'setTimeout(fn, ms)',             stop: 'clearTimeout(id)',          color: '#a78bfa' },
    { start: 'addEventListener(evt, fn)',      stop: 'removeEventListener(evt, fn)', color: '#10b981' },
    { start: 'fetch(url, { signal })',         stop: 'controller.abort()',        color: '#f59e0b' },
    { start: 'WebSocket / subscription open', stop: 'socket.close() / unsub()',  color: '#f43f5e' },
  ]

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '520px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px' }}>Cleanup Cheat Sheet</h2>
      {rules.map(r => (
        <div key={r.start} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' }}>
          <code style={{ color: r.color, fontFamily: 'monospace', fontSize: '0.8rem', background: '#0f172a', padding: '4px 8px', borderRadius: '4px', minWidth: '200px' }}>{r.start}</code>
          <span style={{ color: '#475569' }}>→</span>
          <code style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.stop}</code>
        </div>
      ))}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'challenge',
      id: 'ch-debounce-fetch',
      text: "Build a search input that debounces fetching: wait 500ms after the user stops typing, then fetch matching users from https://jsonplaceholder.typicode.com/users. Use setTimeout in useEffect and return a clearTimeout cleanup so rapid typing cancels previous timers.",
      hint: "useEffect(() => { const id = setTimeout(() => { if (query) fetch(...) }, 500); return () => clearTimeout(id) }, [query])",
      startCode: `const { useState, useEffect } = React

function App() {
  const [query, setQuery]   = useState('')
  const [users, setUsers]   = useState([])

  // useEffect that sets a 500ms setTimeout to fetch users
  // Return clearTimeout(id) as the cleanup
  // When query changes the old timeout is cancelled and a new one starts

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Debounced Search</h2>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type a name..."
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '16px' }}
      />
      {/* Render matching users */}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useEffect/.test(code) &&
          /setTimeout/.test(code) &&
          /clearTimeout/.test(code) &&
          /fetch/.test(code) &&
          /query/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-countdown',
      text: "Build a countdown timer: starts at 10 and counts down to 0. Use setInterval inside useEffect. When it reaches 0, stop the interval. Add a Reset button that brings the count back to 10 and restarts the countdown. Make sure the interval is properly cleaned up.",
      hint: "Use a 'counting' state or watch for count === 0 inside the effect to clear the interval. useEffect dep on [count] or use a ref for the interval ID.",
      startCode: `const { useState, useEffect } = React

function App() {
  const [count, setCount] = useState(10)

  // useEffect: start interval that decrements count each second
  // When count reaches 0, clear the interval
  // Return cleanup function

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '360px', textAlign: 'center' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px' }}>Countdown</h2>
      {/* Show count, show 'Done!' when 0, Reset button */}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useEffect/.test(code) &&
          /setInterval/.test(code) &&
          /clearInterval/.test(code) &&
          /count/.test(code) &&
          /reset|setCount\(10\)|setCount\s*\(\s*10\s*\)/.test(code)
      }
    }
  ]
}
