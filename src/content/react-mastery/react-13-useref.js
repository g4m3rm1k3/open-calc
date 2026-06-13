export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-13-useref',
  title: '13. useRef: DOM Access & Mutable Values',
  chapter: 'react-ch4',
  language: 'react',
  checkpoints: [
    { id: 'cp-dom-ref', label: 'DOM Refs' },
    { id: 'cp-mutable-ref', label: 'Mutable Values' },
    { id: 'cp-ref-vs-state', label: 'Ref vs State' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "Sometimes you need to directly interact with a DOM element — focus an input, measure its dimensions, or trigger an animation. React controls the DOM through its virtual DOM, but useRef gives you an escape hatch: a reference to the actual DOM node. Unlike state, changing a ref does NOT trigger a re-render.",
      code: `const { useRef, useEffect } = React

function App() {
  const inputRef = useRef(null)  // ref starts as null

  useEffect(() => {
    // After mount, ref.current is the actual DOM input element
    inputRef.current.focus()
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px', fontSize: '1.1rem' }}>Auto-focused Input</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 12px' }}>
        This input is focused automatically on mount via useRef.
      </p>
      <input
        ref={inputRef}
        placeholder="I'm focused!"
        style={{ width: '100%', background: '#0f172a', border: '2px solid #3b82f6', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
      />
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
      id: 'ref-on-demand',
      text: "Refs don't have to be used on mount. You can imperatively focus an input in response to a user event — like clicking an Edit button. The ref gives you direct DOM access at any time, not just on mount.",
      code: `const { useRef, useState } = React

function App() {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('Maya Chen')
  const inputRef = useRef(null)

  function startEdit() {
    setEditing(true)
    // Schedule focus AFTER re-render shows the input
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px', fontSize: '1.1rem' }}>Edit on Demand</h2>
      {editing ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ flex: 1, background: '#0f172a', border: '1px solid #3b82f6', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.95rem' }}
          />
          <button onClick={() => setEditing(false)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#f1f5f9', fontSize: '1rem' }}>{name}</span>
          <button onClick={startEdit} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
        </div>
      )}
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
      id: 'scroll-into-view',
      text: "You can also use refs to call any native DOM method. `scrollIntoView`, `getBoundingClientRect`, `play`, `pause` on a video — all accessible through `ref.current`. React's virtual DOM doesn't expose these; refs are the bridge.",
      code: `const { useRef } = React

function App() {
  const bottomRef = useRef(null)
  const topRef = useRef(null)

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', height: '300px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexShrink: 0 }}>
        <button onClick={() => topRef.current.scrollIntoView({ behavior: 'smooth' })} style={{ flex: 1, background: '#334155', color: '#94a3b8', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Scroll to Top
        </button>
        <button onClick={() => bottomRef.current.scrollIntoView({ behavior: 'smooth' })} style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Scroll to Bottom
        </button>
      </div>
      <div style={{ overflow: 'auto', flex: 1 }}>
        <div ref={topRef} style={{ color: '#38bdf8', fontWeight: 600, marginBottom: '8px' }}>Top of list</div>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ color: '#94a3b8', padding: '6px 0', borderBottom: '1px solid #1e293b', fontSize: '0.85rem' }}>
            Item {i + 1}
          </div>
        ))}
        <div ref={bottomRef} style={{ color: '#10b981', fontWeight: 600, marginTop: '8px' }}>Bottom of list</div>
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
      id: 'cp-dom-ref'
    },
    {
      type: 'narration',
      id: 'mutable-value',
      text: "useRef's second power: storing mutable values that persist across renders without triggering a re-render. Think of ref.current as an instance variable — it survives re-renders but changing it doesn't cause one. This is perfect for interval IDs, previous values, and 'is mounted' flags.",
      code: `const { useState, useRef } = React

// Stopwatch: interval ID stored in ref (not state)
// because we never want to re-render just because the interval ID changed

function Stopwatch() {
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  function start() {
    if (running) return
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setTime(t => t + 1)
    }, 100)
  }

  function stop() {
    clearInterval(intervalRef.current)
    setRunning(false)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setTime(0)
  }

  const secs = (time / 10).toFixed(1)

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '300px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', fontWeight: 700, color: running ? '#10b981' : '#f1f5f9', marginBottom: '20px', fontVariantNumeric: 'tabular-nums' }}>
        {secs}s
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={start} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer' }}>Start</button>
        <button onClick={stop} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer' }}>Stop</button>
        <button onClick={reset} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer' }}>Reset</button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <Stopwatch />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'previous-value',
      text: "A classic use: tracking the previous value of a state variable. On each render, you want to compare current to previous. Since setState schedules a re-render, you can capture the previous value in a ref inside useEffect — it runs after the render, so ref.current at that point holds last render's value.",
      code: `const { useState, useRef, useEffect } = React

function usePrevious(value) {
  const prevRef = useRef(undefined)
  useEffect(() => {
    prevRef.current = value  // store AFTER current render
  })
  return prevRef.current   // return BEFORE current render's effect runs
}

function App() {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '320px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px', fontSize: '1.1rem' }}>Previous Value Tracker</h2>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>{count}</div>
      <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>
        Previous: {prevCount === undefined ? 'none' : prevCount}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={() => setCount(c => c - 1)} style={{ background: '#334155', color: '#f1f5f9', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.2rem' }}>−</button>
        <button onClick={() => setCount(c => c + 1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
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
      id: 'cp-mutable-ref'
    },
    {
      type: 'narration',
      id: 'ref-vs-state',
      text: "The rule: use state when the UI should react to the change (re-render). Use ref when you need to remember a value across renders but the UI doesn't need to reflect it. Interval IDs, socket connections, previous values, and DOM nodes are all refs. Anything displayed on screen is state.",
      code: `const { useState, useRef } = React

function App() {
  // STATE: displayed on screen → triggers re-render
  const [score, setScore] = useState(0)
  const [log, setLog] = useState([])

  // REF: not displayed, just needed internally → no re-render
  const clickCountRef = useRef(0)
  const lastClickRef = useRef(null)

  function handleClick() {
    clickCountRef.current++           // silent, no re-render
    lastClickRef.current = Date.now() // silent, no re-render

    setScore(s => s + 10)  // triggers re-render
    if (clickCountRef.current % 5 === 0) {
      setLog(l => [...l, 'Bonus at click ' + clickCountRef.current])
    }
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '320px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 4px', fontSize: '1.1rem' }}>Click Game</h2>
      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 20px' }}>ref tracks clicks silently; state drives the UI</p>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f1f5f9', textAlign: 'center', marginBottom: '16px' }}>{score}</div>
      <button onClick={handleClick} style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', marginBottom: '16px' }}>
        Click (+10pts)
      </button>
      {log.map((msg, i) => (
        <div key={i} style={{ color: '#10b981', fontSize: '0.8rem', marginBottom: '4px' }}>{msg}</div>
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
      id: 'cp-ref-vs-state'
    },
    {
      type: 'challenge',
      id: 'ch-focus-ref',
      text: "Build a component with a text input and a 'Clear & Focus' button. When clicked, the button should: clear the input value (via controlled state), then focus the input (via useRef). The input should be focused and empty after clicking.",
      hint: "Use useState for the value and useRef for the DOM ref. In the button's onClick: setValue('') then inputRef.current.focus().",
      startCode: `const { useState, useRef } = React

function App() {
  const [value, setValue] = useState('')
  // Create a ref for the input element

  function clearAndFocus() {
    // Clear the value and focus the input
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '360px', width: '100%', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1.1rem' }}>Clear & Focus</h2>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Type something..."
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem' }}
        />
        <button
          onClick={clearAndFocus}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          Clear & Focus
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useRef/.test(code) && /\.focus\(\)/.test(code) && /setValue/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-render-counter',
      text: "Build a component that shows a state counter and also displays how many times the component has rendered. Use a ref (not state) to count renders — so the render count itself doesn't cause extra renders. Increment the ref at the top of the function body.",
      hint: "const renderCount = useRef(0); renderCount.current++ at the top of the component (not in useEffect). Display renderCount.current in the JSX. State increments trigger re-renders; the ref silently records them.",
      startCode: `const { useState, useRef } = React

function App() {
  const [count, setCount] = useState(0)
  // Create a ref to count renders
  // Increment it at the TOP of the function (not in useEffect)

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '300px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px' }}>
          Render count: {/* show renderCount.current */}
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' }}>
          {count}
        </div>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
        >
          Increment
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useRef/.test(code) && /\.current\+\+|\.current\s*=.*\+\s*1/.test(code)
      }
    }
  ]
}
