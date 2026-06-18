export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-10-useeffect',
  title: '10. useEffect: Side Effects',
  chapter: 'react-ch3',
  language: 'react',
  checkpoints: [
    { id: 'cp-effect-basics', label: 'Effect Basics' },
    { id: 'cp-deps-array', label: 'Dependency Array' },
    { id: 'cp-mount-effects', label: 'Mount Effects' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'what-is-side-effect',
      text: "A side effect is anything a component does beyond returning JSX: updating the document title, setting a timer, logging to the console, talking to an API. React renders components in a pure way — no side effects during render. useEffect is the escape hatch that lets you run side effects after React has updated the DOM.",
      code: `const { useState, useEffect } = React

function App() {
  const [count, setCount] = useState(0)

  // Side effect: updating the browser tab title
  useEffect(() => {
    document.title = 'Count: ' + count
  })

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 8px' }}>Side Effects with useEffect</h2>
      <p style={{ color: '#94a3b8', margin: '0 0 20px', fontSize: '0.9rem' }}>
        Watch the browser tab title change as you click!
      </p>
      <div style={{ fontSize: '3rem', fontWeight: 700, textAlign: 'center', margin: '20px 0', color: '#f1f5f9' }}>
        {count}
      </div>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
      >
        Increment
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
      id: 'effect-syntax',
      text: "useEffect takes two arguments: a callback function (the effect), and an optional dependency array. The callback runs after the component renders. Without a dependency array it runs after every render. This is rarely what you want — the dependency array is the key to controlling when effects fire.",
      code: `const { useState, useEffect } = React

function App() {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [log, setLog] = useState([])

  // No deps array — runs after EVERY render
  useEffect(() => {
    setLog(prev => [...prev.slice(-4), 'Effect ran (a=' + a + ', b=' + b + ')'])
  })

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Effect runs every render</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setA(a + 1)} style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          A: {a}
        </button>
        <button onClick={() => setB(b + 1)} style={{ flex: 1, padding: '10px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          B: {b}
        </button>
      </div>
      <div style={{ background: '#0f172a', borderRadius: '6px', padding: '12px', minHeight: '80px' }}>
        {log.map((entry, i) => (
          <div key={i} style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '2px 0' }}>{entry}</div>
        ))}
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
      type: 'narration',
      id: 'document-title-effect',
      text: "A common real-world use: sync document.title with component state. Put the value you want to watch in the dependency array — React runs the effect again only when that value changes. This is the 'reactive' model: declare what your effect depends on, React handles the rest.",
      code: `const { useState, useEffect } = React

function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('World')

  // Only re-runs when count changes
  useEffect(() => {
    document.title = 'Count is ' + count
  }, [count])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Syncing document.title</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px' }}>
        Only the count effect watches the tab title. Changing the name does not trigger the effect.
      </p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', marginBottom: '12px', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => setCount(c => c + 1)} style={{ padding: '10px 24px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
          +1
        </button>
        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>Count: {count}</span>
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
      id: 'cp-effect-basics'
    },
    {
      type: 'narration',
      id: 'empty-deps-array',
      text: "An empty dependency array `[]` means 'run this effect once, when the component first mounts'. React sees: no dependencies, nothing can change, so never re-run. This is the correct way to do one-time setup: connecting to a service, fetching initial data, or starting a timer that runs for the component's lifetime.",
      code: `const { useState, useEffect } = React

function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [mounted, setMounted] = useState('')

  // Empty deps [] — runs only on mount
  useEffect(() => {
    setMounted('Mounted at: ' + new Date().toLocaleTimeString())
  }, [])

  // [time]? No — we update time inside the effect,
  // so we use [] here and rely on setInterval
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 8px' }}>Empty [] — Run Once on Mount</h2>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', margin: '20px 0', color: '#f1f5f9', letterSpacing: '2px' }}>
        {time}
      </div>
      <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
        {mounted}
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
      type: 'narration',
      id: 'deps-comparison',
      text: "Here is the full picture: no deps array means 'every render', empty array means 'mount only', and `[val]` means 'mount, plus whenever val changes'. React compares the previous deps to the current deps using Object.is — if anything changed, the effect re-runs. Multiple effects in one component are perfectly fine — split them by concern.",
      code: `const { useState, useEffect } = React

function App() {
  const [count, setCount] = useState(0)
  const [color, setColor] = useState('#38bdf8')
  const [log, setLog] = useState([])

  const addLog = (msg) => setLog(p => [msg, ...p].slice(0, 6))

  // Runs on mount only
  useEffect(() => {
    addLog('Mounted!')
  }, [])

  // Runs when count changes
  useEffect(() => {
    if (count > 0) addLog('count changed: ' + count)
  }, [count])

  // Runs when color changes
  useEffect(() => {
    addLog('color changed: ' + color)
  }, [color])

  const colors = ['#38bdf8', '#f59e0b', '#10b981', '#f43f5e']

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Deps Array Comparison</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setCount(c => c + 1)} style={{ padding: '8px 16px', background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer' }}>
          Count: {count}
        </button>
        {colors.map(c => (
          <button key={c} onClick={() => setColor(c)} style={{ width: 32, height: 32, background: c, border: color === c ? '3px solid white' : 'none', borderRadius: '6px', cursor: 'pointer' }} />
        ))}
      </div>
      <div style={{ background: '#0f172a', borderRadius: '6px', padding: '12px', minHeight: '100px' }}>
        {log.map((l, i) => (
          <div key={i} style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '2px 0' }}>{l}</div>
        ))}
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
      id: 'cp-deps-array'
    },
    {
      type: 'narration',
      id: 'clock-interval',
      text: "A live clock is the classic useEffect demo. Start a setInterval inside the effect, update state on every tick, and pass an empty deps array so the interval starts once. We return a cleanup function — clearInterval — so the interval stops if the component is removed from the DOM. Cleanup functions are the subject of a later lesson.",
      code: `const { useState, useEffect } = React

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)   // cleanup — covered in lesson 12
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const h = pad(time.getHours())
  const m = pad(time.getMinutes())
  const s = pad(time.getSeconds())

  return (
    <div style={{ background: '#1e293b', padding: '36px 40px', borderRadius: '16px', fontFamily: 'monospace', color: '#f1f5f9', textAlign: 'center' }}>
      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Live Clock</div>
      <div style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '4px', color: '#38bdf8' }}>
        {h}:{m}:{s}
      </div>
      <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '16px' }}>
        useEffect + setInterval + empty deps
      </div>
    </div>
  )
}

function App() {
  return <Clock />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'effect-logging',
      text: "Effects are ideal for syncing with external systems that need to know about state changes. Here an effect logs every time a specific piece of state changes — imagine this as an analytics call or a WebSocket message. The key insight: the effect is a reaction to state, not something you call manually.",
      code: `const { useState, useEffect } = React

function App() {
  const [page, setPage] = useState('home')
  const [visits, setVisits] = useState({ home: 0, about: 0, contact: 0 })

  // React to every page change — like analytics
  useEffect(() => {
    setVisits(v => ({ ...v, [page]: v[page] + 1 }))
  }, [page])

  const pages = ['home', 'about', 'contact']

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Page Visit Tracker</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ flex: 1, padding: '10px', background: page === p ? '#38bdf8' : '#0f172a', color: page === p ? '#0f172a' : '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
            {p}
          </button>
        ))}
      </div>
      <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
        <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Visit Log</div>
        {pages.map(p => (
          <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
            <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{p}</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{visits[p]}</span>
          </div>
        ))}
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
      type: 'narration',
      id: 'fetch-preview',
      text: "One important rule: don't fetch data in useEffect without a cleanup. If the component unmounts while a fetch is still in flight, the callback will try to update state on an unmounted component. The next lesson covers the AbortController pattern — the correct way to cancel in-flight requests. For now, treat useEffect + fetch as a two-lesson topic.",
      code: `const { useState, useEffect } = React

function App() {
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    // WITHOUT cleanup — works for simple cases
    // but can cause issues if the component unmounts
    setStatus('fetching...')
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(r => r.json())
      .then(data => setStatus('Got: "' + data.title + '"'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 12px' }}>Fetch Preview (no cleanup yet)</h2>
      <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
        {status}
      </div>
      <div style={{ marginTop: '16px', background: '#451a03', border: '1px solid #92400e', padding: '12px 16px', borderRadius: '8px' }}>
        <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>Next lesson:</span>
        <span style={{ color: '#fde68a', fontSize: '0.85rem' }}> AbortController + cleanup</span>
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
      id: 'cp-mount-effects'
    },
    {
      type: 'narration',
      id: 'summary',
      text: "Summary: useEffect lets you run side effects after render. No deps array means every render; empty array means mount only; [val] means mount plus whenever val changes. Every effect should do one thing — split multiple concerns into multiple effects. The dependency array is your contract with React about when the effect needs to re-run.",
      code: `const { useState, useEffect } = React

function Summary() {
  const rules = [
    { deps: 'useEffect(fn)',       when: 'Every render',            color: '#f43f5e' },
    { deps: 'useEffect(fn, [])',   when: 'Mount only',              color: '#f59e0b' },
    { deps: 'useEffect(fn, [x])',  when: 'Mount + when x changes',  color: '#10b981' },
  ]

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '480px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px' }}>useEffect Cheat Sheet</h2>
      {rules.map(r => (
        <div key={r.deps} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '14px 0', borderBottom: '1px solid #334155' }}>
          <div style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', color: r.color, flexShrink: 0 }}>
            {r.deps}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', paddingTop: '8px' }}>{r.when}</div>
        </div>
      ))}
      <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '16px' }}>
        Tip: split multiple concerns into separate useEffect calls.
      </p>
    </div>
  )
}

function App() { return <Summary /> }

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'challenge',
      id: 'ch-document-title',
      text: "Build a component with a count (starts at 0) and an 'Add' button. Use useEffect with [count] in the deps array so that document.title updates to show 'Score: N' every time the count changes. Display the current count on screen.",
      hint: "useEffect(() => { document.title = 'Score: ' + count }, [count]) — put this inside your component, after the useState call.",
      startCode: `const { useState, useEffect } = React

function App() {
  const [count, setCount] = useState(0)

  // Add a useEffect here that sets document.title to 'Score: N'
  // whenever count changes

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '360px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px' }}>Score Tracker</h2>
      {/* Show count and an Add button */}
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
          /document\.title/.test(code) &&
          /count/.test(code) &&
          /useState/.test(code) &&
          /setCount|setScore/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-stopwatch',
      text: "Build a stopwatch. Show elapsed seconds (starting at 0). Provide Start and Stop buttons. When running, useEffect should manage a setInterval that increments the elapsed time every second. When stopped, the interval should be cleared.",
      hint: "Use a boolean 'running' state to control whether the interval is active. useEffect with [running] as the dep: if running, start interval and return () => clearInterval(id). If not running, do nothing.",
      startCode: `const { useState, useEffect } = React

function App() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  // useEffect: when 'running' is true, start setInterval
  // Return a cleanup that clears the interval

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '360px', textAlign: 'center' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px' }}>Stopwatch</h2>
      {/* Show seconds, Start and Stop buttons */}
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
          /running/.test(code) &&
          /seconds|elapsed/.test(code)
      }
    }
  ]
}
