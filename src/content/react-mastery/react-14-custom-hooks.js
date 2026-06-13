export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-14-custom-hooks',
  title: '14. Custom Hooks',
  chapter: 'react-ch4',
  language: 'react',
  checkpoints: [
    { id: 'cp-extract', label: 'Extracting Logic' },
    { id: 'cp-use-prefix', label: 'The use Prefix' },
    { id: 'cp-reuse', label: 'Reusing Hooks' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "Two components both manage a counter with increment, decrement, and reset. The logic is identical but you've copy-pasted useState and three handlers twice. Custom hooks let you extract that stateful logic into a reusable function. The hook owns the state; each component that calls it gets its own independent instance.",
      code: `const { useState } = React

// Before: duplicated logic in two components
function Counter1() {
  const [count, setCount] = useState(0)
  return (
    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', fontFamily: 'sans-serif', marginBottom: '8px' }}>
      <span style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginRight: '12px' }}>{count}</span>
      <button onClick={() => setCount(c => c + 1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' }}>+</button>
      <button onClick={() => setCount(c => c - 1)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' }}>-</button>
      <button onClick={() => setCount(0)} style={{ background: '#334155', color: '#64748b', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
    </div>
  )
}

function Counter2() {
  const [count, setCount] = useState(0) // duplicated!
  return (
    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <span style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginRight: '12px' }}>{count}</span>
      <button onClick={() => setCount(c => c + 1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' }}>+</button>
      <button onClick={() => setCount(c => c - 1)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' }}>-</button>
      <button onClick={() => setCount(0)} style={{ background: '#334155', color: '#64748b', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <div>
      <p style={{ color: '#64748b', fontFamily: 'sans-serif', marginBottom: '12px', fontSize: '0.8rem' }}>Duplicated logic — two separate counters:</p>
      <Counter1 />
      <Counter2 />
    </div>
  </div>
)`
    },
    {
      type: 'narration',
      id: 'extract-hook',
      text: "Extract the logic into a custom hook: a plain JavaScript function whose name starts with `use` and that calls other hooks inside it. It returns whatever the component needs. Each component that calls useCounter gets completely independent state — not shared.",
      code: `const { useState } = React

// After: extracted hook
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial)
  return {
    count,
    increment: () => setCount(c => c + 1),
    decrement: () => setCount(c => c - 1),
    reset:     () => setCount(initial),
  }
}

function Counter({ label }) {
  const { count, increment, decrement, reset } = useCounter(0)

  return (
    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', fontFamily: 'sans-serif', marginBottom: '8px' }}>
      <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginRight: '8px' }}>{label}:</span>
      <span style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginRight: '12px' }}>{count}</span>
      <button onClick={increment} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' }}>+</button>
      <button onClick={decrement} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' }}>-</button>
      <button onClick={reset} style={{ background: '#334155', color: '#64748b', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <div>
      <p style={{ color: '#64748b', fontFamily: 'sans-serif', marginBottom: '12px', fontSize: '0.8rem' }}>Same hook — each instance is independent:</p>
      <Counter label="Counter A" />
      <Counter label="Counter B" />
    </div>
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-extract'
    },
    {
      type: 'narration',
      id: 'use-prefix-rule',
      text: "The `use` prefix is not just convention — it's required. React uses it to enforce the rules of hooks: hooks can only be called at the top level of a component or another hook. If you name your function without `use`, React won't enforce those rules for it, and you'll get hard-to-debug bugs.",
      code: `const { useState } = React

// useToggle: simple boolean with a flip function
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  return [on, () => setOn(v => !v)]
}

function DarkModeToggle() {
  const [dark, toggleDark] = useToggle(false)

  return (
    <div style={{ background: dark ? '#0f172a' : '#f8fafc', padding: '28px', borderRadius: '10px', maxWidth: '280px', fontFamily: 'sans-serif', transition: 'all 0.2s', border: '1px solid ' + (dark ? '#334155' : '#e2e8f0') }}>
      <h2 style={{ color: dark ? '#f1f5f9' : '#1e293b', margin: '0 0 16px', fontSize: '1.1rem' }}>
        {dark ? 'Dark Mode' : 'Light Mode'}
      </h2>
      <button
        onClick={toggleDark}
        style={{ background: dark ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
      >
        Toggle
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#334155', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <DarkModeToggle />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'uselocalstorage',
      text: "Custom hooks can combine multiple hooks. `useLocalStorage` uses useState but initializes from localStorage and syncs back on every change. The component using it doesn't know or care about localStorage — it just gets a value and a setter, like useState.",
      code: `const { useState } = React

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  function setAndStore(next) {
    const val = typeof next === 'function' ? next(value) : next
    setValue(val)
    try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
  }

  return [value, setAndStore]
}

function App() {
  const [name, setName] = useLocalStorage('username', '')
  const [count, setCount] = useLocalStorage('visit-count', 0)

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px', fontSize: '1.1rem' }}>Persists on Reload</h2>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name (persists!)"
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '12px' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => setCount(c => c + 1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer' }}>
          Click count: {count}
        </button>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Reload to verify persistence</span>
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
      id: 'cp-use-prefix'
    },
    {
      type: 'narration',
      id: 'usewindowsize',
      text: "Custom hooks make side-effect patterns reusable. `useWindowSize` returns the current window dimensions and updates them when the window resizes. Any component can call it — each gets its own listener set up and torn down automatically.",
      code: `const { useState, useEffect } = React

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

function App() {
  const { width, height } = useWindowSize()
  const breakpoint = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px', fontSize: '1.1rem' }}>Window Size</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, background: '#0f172a', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '4px' }}>WIDTH</div>
          <div style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700 }}>{width}</div>
        </div>
        <div style={{ flex: 1, background: '#0f172a', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '4px' }}>HEIGHT</div>
          <div style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700 }}>{height}</div>
        </div>
      </div>
      <div style={{ background: '#3b82f620', border: '1px solid #3b82f640', padding: '10px 14px', borderRadius: '6px', color: '#38bdf8', fontWeight: 600, textAlign: 'center' }}>
        {breakpoint}
      </div>
      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '12px 0 0' }}>Resize the browser window to see live updates.</p>
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
      id: 'usedebounce',
      text: "`useDebounce` is a hook that delays updating a value until the input stops changing for a specified delay. It's perfect for search inputs — you don't want to fire a network request on every keystroke, only after the user pauses.",
      code: `const { useState, useEffect } = React

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)  // cleanup on next change
  }, [value, delay])

  return debounced
}

function App() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)
  const [callCount, setCallCount] = useState(0)

  useEffect(() => {
    if (debouncedQuery) {
      setCallCount(n => n + 1)  // simulate API call
    }
  }, [debouncedQuery])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px', fontSize: '1.1rem' }}>Debounced Search</h2>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type fast — only fires after pause"
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '12px' }}
      />
      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Live value: <span style={{ color: '#f1f5f9' }}>{query}</span></div>
      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Debounced: <span style={{ color: '#10b981' }}>{debouncedQuery}</span></div>
      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>API calls fired: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{callCount}</span></div>
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
      id: 'cp-reuse'
    },
    {
      type: 'narration',
      id: 'same-hook-twice',
      text: "Two components using the same custom hook each get their own isolated state. The hook is just a function — calling it twice creates two independent instances. This is the key insight: hooks compose behavior, not share state. If you want shared state, you need Context or a state manager.",
      code: `const { useState } = React

function useCounter({ min = 0, max = 10, initial = 0 } = {}) {
  const [count, setCount] = useState(initial)
  return {
    count,
    increment: () => setCount(c => Math.min(max, c + 1)),
    decrement: () => setCount(c => Math.max(min, c - 1)),
    isMin: count <= min,
    isMax: count >= max,
  }
}

function BoundedCounter({ label, min, max, initial, color }) {
  const { count, increment, decrement, isMin, isMax } = useCounter({ min, max, initial })

  return (
    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', fontFamily: 'sans-serif', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ color: '#94a3b8', fontSize: '0.8rem', width: '80px' }}>{label}</span>
      <button onClick={decrement} disabled={isMin} style={{ background: isMin ? '#1e293b' : '#334155', color: isMin ? '#475569' : '#94a3b8', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: isMin ? 'not-allowed' : 'pointer' }}>-</button>
      <span style={{ color: color, fontWeight: 700, fontSize: '1.1rem', width: '30px', textAlign: 'center' }}>{count}</span>
      <button onClick={increment} disabled={isMax} style={{ background: isMax ? '#1e293b' : color + '20', color: isMax ? '#475569' : color, border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: isMax ? 'not-allowed' : 'pointer' }}>+</button>
      <span style={{ color: '#475569', fontSize: '0.7rem' }}>[{min}..{max}]</span>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <div>
      <p style={{ color: '#64748b', fontFamily: 'sans-serif', fontSize: '0.8rem', marginBottom: '12px' }}>Same hook, three independent instances:</p>
      <BoundedCounter label="Volume" min={0} max={10} initial={5} color="#3b82f6" />
      <BoundedCounter label="Brightness" min={1} max={5} initial={3} color="#f59e0b" />
      <BoundedCounter label="Players" min={2} max={4} initial={2} color="#10b981" />
    </div>
  </div>
)`
    },
    {
      type: 'challenge',
      id: 'ch-use-toggle',
      text: "Build a `useToggle` hook that returns `[value, toggle]` where `toggle` flips the boolean. Then use it in a component to power 3 independent switches — one for 'Notifications', one for 'Dark Mode', one for 'Auto-save'. Each switch shows its current on/off state.",
      hint: "function useToggle(initial = false) { const [on, setOn] = useState(initial); return [on, () => setOn(v => !v)]; }",
      startCode: `const { useState } = React

function useToggle(initial = false) {
  // Return [value, toggleFn]
}

function Switch({ label, value, onToggle }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
      <span style={{ color: '#e2e8f0', fontFamily: 'sans-serif' }}>{label}</span>
      <button
        onClick={onToggle}
        style={{ background: value ? '#3b82f6' : '#334155', color: value ? '#fff' : '#94a3b8', border: 'none', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
      >
        {value ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}

function App() {
  // Use useToggle 3 times for independent switches

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '340px', width: '100%' }}>
        <h2 style={{ color: '#38bdf8', margin: '0 0 16px', fontFamily: 'sans-serif', fontSize: '1.1rem' }}>Settings</h2>
        {/* Three Switch components, each driven by useToggle */}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /function useToggle/.test(code) &&
          /useToggle/.test(code.replace(/function useToggle[^}]+}/, '')) &&
          /useState/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-use-fetch',
      text: "Build a `useFetch(url)` hook that returns `{ data, loading, error }`. It should fetch on mount, set loading to true while fetching, set data on success, set error on failure. Use it in a component to fetch https://jsonplaceholder.typicode.com/todos/1 and display the todo's title.",
      hint: "Inside useFetch: useState for data/loading/error, useEffect that calls fetch, sets loading=true, then sets data or error. Return { data, loading, error }.",
      startCode: `const { useState, useEffect } = React

function useFetch(url) {
  // Return { data, loading, error }
  // Fetch the url on mount, track loading and error states
}

function App() {
  const { data, loading, error } = useFetch('https://jsonplaceholder.typicode.com/todos/1')

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#38bdf8', margin: '0 0 16px', fontSize: '1.1rem' }}>Fetched Todo</h2>
        {/* Show loading, error, or data.title */}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /function useFetch/.test(code) &&
          /useEffect/.test(code) &&
          /loading/.test(code) &&
          /useFetch\(/.test(code.replace(/function useFetch[^}]+}/, ''))
      }
    }
  ]
}
