export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-06-events',
  title: '06. Event Handlers',
  chapter: 'react-ch2',
  language: 'react',
  checkpoints: [
    { id: 'cp-click-events', label: 'Click Events' },
    { id: 'cp-event-object', label: 'Event Object' },
    { id: 'cp-prevent-default', label: 'Prevent Default' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro-events',
      text: "Every interactive UI starts with an event. A user clicks a button, types in a field, or submits a form — and your app needs to respond. React handles this through event handler props like `onClick`, `onChange`, and `onSubmit`. These are camelCase attributes that accept a function, and React wires them up to the real browser events for you.",
      code: `const { useState } = React

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ background: '#1e293b', padding: '32px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '360px', textAlign: 'center' }}>
      <h2 style={{ margin: '0 0 8px', color: '#e2e8f0' }}>Event Demo</h2>
      <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: '0.9rem' }}>
        Click the button — React calls your handler.
      </p>
      <div style={{ fontSize: '3rem', fontWeight: 700, color: '#38bdf8', margin: '0 0 24px' }}>
        {count}
      </div>
      <button
        onClick={() => setCount(count + 1)}
        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}
      >
        Click me
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
      id: 'named-vs-inline',
      text: "You can pass an inline arrow function directly to `onClick`, or you can define a named function first and reference it. Both work — but named handlers keep your JSX clean when the logic is more than one line. The key rule: pass the function reference, not a call. Write `onClick={handleClick}`, not `onClick={handleClick()}`. The second version calls the function immediately during render.",
      code: `const { useState } = React

function App() {
  const [log, setLog] = useState([])

  // Named handler — clean and reusable
  function handleBlueClick() {
    setLog(prev => [...prev, 'Blue clicked'])
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Named vs Inline</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {/* Named handler — reference only, no () */}
        <button
          onClick={handleBlueClick}
          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
        >
          Named handler
        </button>
        {/* Inline arrow — fine for simple logic */}
        <button
          onClick={() => setLog(prev => [...prev, 'Red clicked'])}
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
        >
          Inline arrow
        </button>
      </div>
      <div style={{ background: '#0f172a', borderRadius: '6px', padding: '12px', minHeight: '80px', fontSize: '0.85rem', color: '#94a3b8' }}>
        {log.length === 0
          ? 'Click a button...'
          : log.map((entry, i) => <div key={i}>{entry}</div>)
        }
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
      id: 'event-object',
      text: "React passes a synthetic event object as the first argument to every handler. It mirrors the native browser event: `e.target` is the DOM element that fired the event, `e.target.value` is an input's current value, `e.type` is the event name. React normalizes these across browsers so you always get the same API.",
      code: `const { useState } = React

function App() {
  const [value, setValue] = useState('')
  const [info, setInfo] = useState(null)

  function handleChange(e) {
    setValue(e.target.value)
    setInfo({
      type: e.type,
      tagName: e.target.tagName,
      value: e.target.value,
    })
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 16px', color: '#e2e8f0' }}>The Event Object</h2>
      <input
        value={value}
        onChange={handleChange}
        placeholder="Type something..."
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '16px' }}
      />
      {info && (
        <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', fontSize: '0.85rem' }}>
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>e.type: <span style={{ color: '#38bdf8' }}>{info.type}</span></div>
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>e.target.tagName: <span style={{ color: '#38bdf8' }}>{info.tagName}</span></div>
          <div style={{ color: '#94a3b8' }}>e.target.value: <span style={{ color: '#38bdf8' }}>"{info.value}"</span></div>
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
      type: 'checkpoint',
      id: 'cp-click-events'
    },
    {
      type: 'narration',
      id: 'prevent-default',
      text: "Forms have a default behavior: when submitted, the browser navigates to the form's action URL and reloads the page. In a React SPA that would wipe your entire app. Call `e.preventDefault()` inside your `onSubmit` handler to block that reload and handle the data in JavaScript instead.",
      code: `const { useState } = React

function App() {
  const [submitted, setSubmitted] = useState(null)
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()   // ← stops the page reload
    setSubmitted(name)
    setName('')
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Form Submit</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name..."
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem' }}
        />
        <button
          type="submit"
          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}
        >
          Submit
        </button>
      </form>
      {submitted && (
        <p style={{ marginTop: '16px', color: '#10b981' }}>
          Hello, {submitted}! (page did not reload)
        </p>
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
      id: 'passing-args',
      text: "A common mistake: you want to pass an argument to a handler, so you write `onClick={handleDelete(id)}`. That calls the function immediately during render instead of on click. The fix: wrap it in an arrow function — `onClick={() => handleDelete(id)}`. The arrow creates a new function that calls `handleDelete(id)` only when clicked.",
      code: `const { useState } = React

function App() {
  const [items, setItems] = useState(['React', 'Vue', 'Angular', 'Svelte'])

  // Handler takes an argument — must be wrapped in arrow
  function handleRemove(item) {
    setItems(prev => prev.filter(i => i !== item))
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '360px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Passing Args to Handlers</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px' }}>
            <span style={{ color: '#94a3b8' }}>{item}</span>
            {/* () => handleRemove(item) — arrow wraps the call */}
            <button
              onClick={() => handleRemove(item)}
              style={{ background: 'transparent', border: '1px solid #475569', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Remove
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ color: '#475569', textAlign: 'center', padding: '20px' }}>All removed!</p>
        )}
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
      id: 'cp-event-object'
    },
    {
      type: 'narration',
      id: 'mouse-events',
      text: "Beyond clicks, React exposes `onMouseEnter` and `onMouseLeave` for hover effects without CSS classes. These are perfect for interactive highlights, tooltips, and hover states that depend on dynamic data. Combined with state, they give you full control over hover-driven UI in pure React.",
      code: `const { useState } = React

const CARDS = [
  { id: 1, label: 'Dashboard', icon: '▦' },
  { id: 2, label: 'Analytics', icon: '▲' },
  { id: 3, label: 'Settings', icon: '⚙' },
]

function NavItem({ label, icon }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
        background: hovered ? '#334155' : 'transparent',
        color: hovered ? '#38bdf8' : '#94a3b8',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ fontWeight: hovered ? 600 : 400 }}>{label}</span>
    </div>
  )
}

function App() {
  return (
    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', fontFamily: 'sans-serif', width: '220px' }}>
      <p style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 16px' }}>Navigation</p>
      {CARDS.map(c => <NavItem key={c.id} label={c.label} icon={c.icon} />)}
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
      id: 'synthetic-events',
      text: "React's event system is built on top of the browser's native events, but React wraps them in a 'synthetic event' object. This means all events — regardless of browser — have the same API. You don't need to worry about `e.which` vs `e.keyCode`, or IE-specific quirks. React normalizes everything. The object also pools and reuses events for performance, so don't hold onto event references asynchronously without calling `e.persist()` first (in older React — v17+ this is automatic).",
      code: `const { useState } = React

function App() {
  const [keys, setKeys] = useState([])

  function handleKeyDown(e) {
    // Synthetic event — same API in every browser
    const info = {
      key: e.key,
      code: e.code,
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
    }
    setKeys(prev => [info, ...prev].slice(0, 5))
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 16px', color: '#e2e8f0' }}>Synthetic Events</h2>
      <input
        onKeyDown={handleKeyDown}
        placeholder="Press any key..."
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '16px' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {keys.map((k, i) => (
          <div key={i} style={{ background: '#0f172a', padding: '8px 12px', borderRadius: '4px', fontSize: '0.82rem', color: '#94a3b8', fontFamily: 'monospace' }}>
            key: <span style={{ color: '#38bdf8' }}>"{k.key}"</span>
            {' · '}code: <span style={{ color: '#a78bfa' }}>{k.code}</span>
            {k.shift && <span style={{ color: '#fbbf24' }}> · SHIFT</span>}
            {k.ctrl && <span style={{ color: '#f87171' }}> · CTRL</span>}
          </div>
        ))}
        {keys.length === 0 && <p style={{ color: '#475569', fontSize: '0.85rem' }}>No keys yet...</p>}
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
      id: 'events-summary',
      text: "Event handlers are functions passed as props — `onClick`, `onChange`, `onSubmit`, `onMouseEnter`, `onKeyDown`, and many more. Always pass a function reference, not a call. Use `e.target.value` to read input values, `e.preventDefault()` to stop default browser behavior, and wrap argument-passing calls in arrow functions. These patterns cover 90% of interactive React UIs.",
      code: `const { useState } = React

// A small interactive quiz summarising the rules
const QUESTIONS = [
  { q: 'How do you stop a form reload?', a: 'e.preventDefault()' },
  { q: 'How do you read an input value?', a: 'e.target.value' },
  { q: 'Pass args: onClick={fn(id)} — correct?', a: 'No — use onClick={() => fn(id)}' },
]

function App() {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)

  function next() {
    setIdx(i => (i + 1) % QUESTIONS.length)
    setRevealed(false)
  }

  const q = QUESTIONS[idx]

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#38bdf8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Events Quick Quiz</h2>
      <p style={{ color: '#e2e8f0', marginBottom: '20px', minHeight: '48px' }}>{q.q}</p>
      {revealed
        ? <p style={{ color: '#10b981', background: '#10b98120', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px' }}>{q.a}</p>
        : <button onClick={() => setRevealed(true)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginBottom: '16px', display: 'block' }}>Reveal Answer</button>
      }
      <button onClick={next} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer' }}>
        Next →
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
      type: 'checkpoint',
      id: 'cp-prevent-default'
    },
    {
      type: 'challenge',
      id: 'ch-color-picker',
      text: "Build a color picker. Define an array of 4 color strings (e.g. '#ef4444', '#3b82f6', '#10b981', '#f59e0b'). Render a button for each color. When a button is clicked, store that color in state. Show a preview div whose background color is the selected color.",
      hint: "Use useState for the selected color. Map over your colors array to render buttons. Each button's onClick should call () => setSelected(color). Set the preview div's background style to the selected color.",
      startCode: `const { useState } = React

function App() {
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b']
  // 1. Create state for the selected color (default to colors[0])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '360px' }}>
      <h2 style={{ color: '#e2e8f0', margin: '0 0 20px' }}>Color Picker</h2>
      {/* 2. Render 4 buttons — clicking each sets the selected color */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
      </div>
      {/* 3. Show a preview div with the selected color as background */}
      <div style={{ height: '80px', borderRadius: '8px' }}>
      </div>
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
        return /useState/.test(code) &&
          /onClick/.test(code) &&
          /\.map\(/.test(code) &&
          /background/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-form-list',
      text: "Build a form with a text input and a submit button. On submit: call e.preventDefault(), add the input text to a list stored in state, and clear the input. Render the list of submitted items below the form.",
      hint: "Use two pieces of state: one for the input value (controlled with onChange), one for the list array. In handleSubmit: e.preventDefault(), setList([...list, inputValue]), setInputValue('').",
      startCode: `const { useState } = React

function App() {
  // 1. State for the input value
  // 2. State for the list of items

  function handleSubmit(e) {
    // 3. Prevent default, add item to list, clear input
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Task List</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          placeholder="Add a task..."
          style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem' }}
        />
        <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          Add
        </button>
      </form>
      {/* 4. Render the list */}
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
        return /preventDefault/.test(code) &&
          /onSubmit/.test(code) &&
          /useState/.test(code) &&
          /\.map\(/.test(code)
      }
    }
  ]
}
