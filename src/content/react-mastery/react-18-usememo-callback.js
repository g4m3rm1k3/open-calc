export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-18-usememo-callback',
  title: '18. useMemo & useCallback',
  chapter: 'react-ch5',
  language: 'react',
  checkpoints: [
    { id: 'cp-usememo', label: 'useMemo' },
    { id: 'cp-usecallback', label: 'useCallback' },
    { id: 'cp-referential', label: 'Referential Equality' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "On every render, React re-executes the entire component function. Expensive calculations inside that function run again even if their inputs haven't changed. `useMemo` memoizes the result of a calculation — it only re-runs when its dependencies change. Think of it as caching a computed value.",
      code: `const { useState, useMemo } = React

// Simulate expensive calculation
function expensiveFilter(items, query) {
  let count = 0
  const result = items.filter(item => {
    for (let i = 0; i < 50000; i++) count++ // simulate work
    return item.toLowerCase().includes(query.toLowerCase())
  })
  return result
}

function App() {
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState('dark')

  const items = Array.from({ length: 200 }, (_, i) => 'item-' + i + '-abc')

  // Without useMemo: runs on EVERY render, including theme changes
  // const filtered = expensiveFilter(items, query)

  // With useMemo: only runs when query or items changes
  const filtered = useMemo(() => expensiveFilter(items, query), [query])

  return (
    <div style={{ background: theme === 'dark' ? '#1e293b' : '#f1f5f9', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', transition: 'background 0.2s' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter..." style={{ flex: 1, background: theme === 'dark' ? '#0f172a' : '#fff', border: '1px solid #334155', color: theme === 'dark' ? '#f1f5f9' : '#1e293b', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }} />
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Theme
        </button>
      </div>
      <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '8px' }}>{filtered.length} results (filter cached with useMemo)</div>
      <div style={{ maxHeight: '120px', overflow: 'auto' }}>
        {filtered.slice(0, 10).map(item => (
          <div key={item} style={{ color: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: '0.8rem', padding: '2px 0', fontFamily: 'monospace' }}>{item}</div>
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
      id: 'usememo-deps',
      text: "useMemo takes two arguments: a factory function and a dependency array. When any dependency changes, the factory runs and returns a new memoized value. If dependencies are the same as last render, the cached value is returned. The dependency array rules are the same as useEffect.",
      code: `const { useState, useMemo } = React

function App() {
  const [numbers, setNumbers] = useState([3, 1, 4, 1, 5, 9, 2, 6])
  const [ascending, setAscending] = useState(true)
  const [highlight, setHighlight] = useState(false)  // unrelated state

  // Re-computes only when numbers or ascending change — NOT when highlight changes
  const sorted = useMemo(() => {
    console.log('sorting...')  // watch the console
    return [...numbers].sort((a, b) => ascending ? a - b : b - a)
  }, [numbers, ascending])

  const stats = useMemo(() => ({
    sum: numbers.reduce((a, b) => a + b, 0),
    avg: (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(1),
    max: Math.max(...numbers),
  }), [numbers])

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setAscending(a => !a)} style={{ flex: 1, background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Sort: {ascending ? 'ASC' : 'DESC'}
        </button>
        <button onClick={() => setHighlight(h => !h)} style={{ flex: 1, background: '#334155', color: '#94a3b8', border: 'none', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Toggle highlight (no re-sort)
        </button>
        <button onClick={() => setNumbers(n => [...n, Math.floor(Math.random() * 10)])} style={{ flex: 1, background: '#334155', color: '#94a3b8', border: 'none', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Add number
        </button>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {sorted.map((n, i) => (
          <div key={i} style={{ background: highlight ? '#3b82f620' : '#0f172a', color: highlight ? '#38bdf8' : '#f1f5f9', padding: '8px', borderRadius: '6px', fontWeight: 700, minWidth: '28px', textAlign: 'center' }}>{n}</div>
        ))}
      </div>
      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
        Sum: {stats.sum} | Avg: {stats.avg} | Max: {stats.max}
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
      id: 'cp-usememo'
    },
    {
      type: 'narration',
      id: 'usecallback-intro',
      text: "`useCallback` memoizes a function reference. Functions defined inside a component are recreated on every render — a new function object, even if the logic is identical. For a memoized child component that receives a function as a prop, this new reference breaks memo: the child sees a 'changed' prop and re-renders anyway.",
      code: `const { useState, useCallback, memo, useRef } = React

const Button = memo(function Button({ onClick, label }) {
  const renders = useRef(0)
  renders.current++
  return (
    <button onClick={onClick} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'sans-serif' }}>
      {label} (renders: {renders.current})
    </button>
  )
})

function App() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  // Without useCallback: new function reference every render
  // memo on Button is useless — it sees a new onClick every time
  const badHandler = () => setCount(c => c + 1)

  // With useCallback: same function reference unless deps change
  const goodHandler = useCallback(() => setCount(c => c + 1), [])

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Type here to cause re-renders..." style={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }} />
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
        Count: {count}. Type above and watch render counts:
      </p>
      <Button onClick={badHandler} label="No useCallback (broken memo)" />
      <Button onClick={goodHandler} label="With useCallback (memo works)" />
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
      id: 'usecallback-deps',
      text: "useCallback's dependency array works exactly like useEffect's. If your callback closes over state or props, include them in deps. Otherwise you'll read stale values. An empty `[]` means the function is created once and never recreated — fine if it doesn't close over any changing values.",
      code: `const { useState, useCallback, memo } = React

const SearchButton = memo(function SearchButton({ onSearch }) {
  return (
    <button onClick={onSearch} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'sans-serif' }}>
      Search
    </button>
  )
})

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  // Must include query in deps — the callback closes over it
  const handleSearch = useCallback(() => {
    const fakeData = ['react', 'redux', 'router', 'refs', 'render']
    setResults(fakeData.filter(item => item.includes(query.toLowerCase())))
  }, [query])  // recreated when query changes — intentionally

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }} />
        <SearchButton onSearch={handleSearch} />
      </div>
      {results.map(r => (
        <div key={r} style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{r}</div>
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
      type: 'checkpoint',
      id: 'cp-usecallback'
    },
    {
      type: 'narration',
      id: 'referential-equality',
      text: "The underlying issue for both useMemo and useCallback is referential equality: `{} !== {}` and `[] !== []` and `() => {} !== () => {}` in JavaScript, because object, array, and function values are compared by reference, not by content. React.memo compares props by reference, so a new object/function reference = changed prop = re-render.",
      code: `const { useState, useMemo, useCallback, memo } = React

// Demonstrating referential equality
const obj1 = { x: 1 }
const obj2 = { x: 1 }

const DataDisplay = memo(function DataDisplay({ config, onReset }) {
  return (
    <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#94a3b8' }}>
      Config: {JSON.stringify(config)} | Reset available: {String(!!onReset)}
    </div>
  )
})

function App() {
  const [count, setCount] = useState(0)
  const [extra, setExtra] = useState(0)

  // These recreate every render — memo is broken
  // const config = { theme: 'dark', size: count }
  // const onReset = () => setCount(0)

  // Memoized — stable references, memo works
  const config = useMemo(() => ({ theme: 'dark', size: count }), [count])
  const onReset = useCallback(() => setCount(0), [])

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
        {} === {} is <strong style={{ color: '#ef4444' }}>false</strong>. useMemo/useCallback give stable references.
      </p>
      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Count: {count} | Extra: {extra}</div>
      <DataDisplay config={config} onReset={onReset} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setCount(c => c + 1)} style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Count+</button>
        <button onClick={() => setExtra(e => e + 1)} style={{ flex: 1, background: '#334155', color: '#94a3b8', border: 'none', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Extra+ (no re-render)</button>
        <button onClick={onReset} style={{ flex: 1, background: '#ef444420', color: '#f87171', border: '1px solid #ef444440', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Reset</button>
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
      id: 'cp-referential'
    },
    {
      type: 'narration',
      id: 'golden-rule',
      text: "The golden rule: don't add useMemo and useCallback preemptively. They add complexity and a real (if small) overhead from the comparison. Profile first with React DevTools Profiler. Add memoization where you see measured wasted renders, not where you imagine they might happen. Most components don't need it.",
      code: `const { useState, useMemo } = React

// When useMemo IS worth it: expensive derive from large data
function processDataset(data, filters) {
  return data
    .filter(item => filters.every(f => f(item)))
    .map(item => ({ ...item, processed: true, score: item.value * 2 }))
    .sort((a, b) => b.score - a.score)
}

function Dashboard() {
  const [minValue, setMinValue] = useState(0)
  const [showAll, setShowAll] = useState(true)
  const [uiState, setUiState] = useState('normal')  // unrelated

  const rawData = useMemo(() => Array.from({ length: 500 }, (_, i) => ({ id: i, value: Math.random() * 100, name: 'item-' + i })), [])

  const filters = useMemo(() => {
    const f = [item => item.value >= minValue]
    if (!showAll) f.push(item => item.score > 50)
    return f
  }, [minValue, showAll])

  // Only recomputes when filters change, not when uiState changes
  const processed = useMemo(() => processDataset(rawData, filters), [rawData, filters])

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Data Dashboard (500 items)</h2>
      <input type="range" min={0} max={90} value={minValue} onChange={e => setMinValue(+e.target.value)} style={{ width: '100%' }} />
      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Min value: {minValue} | Showing {processed.length} items | UI: {uiState}</p>
      <button onClick={() => setUiState(s => s === 'normal' ? 'highlight' : 'normal')} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
        Toggle UI (no re-process)
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <Dashboard />
  </div>
)`
    },
    {
      type: 'challenge',
      id: 'ch-usememo-filter',
      text: "Build a searchable product list. The list has 100 items generated once. Filtering should use `useMemo` so it only recomputes when the search query changes — not when an unrelated `sortOrder` state changes. Add a sort toggle button that changes order without re-filtering.",
      hint: "const filtered = useMemo(() => products.filter(p => p.name.includes(query)), [products, query]); Then sort the filtered array separately, also with useMemo([filtered, sortOrder]).",
      startCode: `const { useState, useMemo } = React

function App() {
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')

  // Generate 100 products once
  const products = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: 'Product ' + String.fromCharCode(65 + (i % 26)) + '-' + i,
    price: Math.round(10 + Math.random() * 90),
  })), [])

  // 1. Filter with useMemo (deps: [products, query])
  const filtered = null // replace with useMemo

  // 2. Sort the filtered list with useMemo (deps: [filtered, sortOrder])
  const sorted = null // replace with useMemo

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', width: '100%', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..." style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }} />
          <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            {sortOrder}
          </button>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{(sorted || []).length} results</div>
        <div style={{ maxHeight: '200px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(sorted || []).slice(0, 20).map(p => (
            <div key={p.id} style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '4px 8px', background: '#0f172a', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{p.name}</span>
              <span style={{ color: '#38bdf8' }}>{p.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        const memoCount = (code.match(/useMemo/g) || []).length
        return memoCount >= 2 && /filter/.test(code) && /sort/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-usecallback',
      text: "Build a parent that has a `message` state and an unrelated `tick` counter that increments every second via useEffect. It passes an `onSend(msg)` callback to a memoized `MessageInput` child. Use `useCallback` so `MessageInput` doesn't re-render on every tick.",
      hint: "const onSend = useCallback((msg) => setSentMessages(prev => [...prev, msg]), []). Wrap MessageInput in memo. The tick state changes every second — without useCallback the child re-renders on every tick.",
      startCode: `const { useState, useEffect, useCallback, memo } = React

const MessageInput = memo(function MessageInput({ onSend }) {
  const [text, setText] = useState('')
  // Add a visible render counter with useRef

  return (
    <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', display: 'flex', gap: '8px' }}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Message..." style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }} />
      <button onClick={() => { onSend(text); setText('') }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>Send</button>
    </div>
  )
})

function App() {
  const [tick, setTick] = useState(0)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Use useCallback here so MessageInput doesn't re-render on every tick
  const handleSend = null // replace with useCallback

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', width: '100%', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Tick: {tick} (re-renders parent every second)</div>
        <div style={{ maxHeight: '120px', overflow: 'auto' }}>
          {messages.map((m, i) => <div key={i} style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '2px 0' }}>{m}</div>)}
        </div>
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useCallback/.test(code) && /memo\(/.test(code)
      }
    }
  ]
}
