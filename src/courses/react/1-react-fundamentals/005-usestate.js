export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-05-usestate',
  title: '05. useState: Local State',
  chapter: 'react-ch2',
  language: 'react',
  checkpoints: [
    { id: 'cp-usestate-basic', label: 'useState Basics' },
    { id: 'cp-functional-update', label: 'Functional Updates' },
    { id: 'cp-object-state', label: 'Object State' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'state-intro',
      text: "Variables declared inside a component reset every render — they can't remember a value between renders. State is different: state persists across renders. The `useState` hook gives you a state variable and a setter function. When you call the setter, React re-renders the component with the new value.",
      code: `const { useState } = React

function Counter() {
  // useState returns [currentValue, setterFunction]
  const [count, setCount] = useState(0)

  // count persists across renders — variables would not

  return (
    <div style={{
      background: '#1e293b',
      padding: '32px',
      borderRadius: '14px',
      fontFamily: 'sans-serif',
      maxWidth: '280px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1, marginBottom: '8px' }}>
        {count}
      </div>
      <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '0.85rem' }}>clicks</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => setCount(count - 1)}
          style={{
            background: '#0f172a', border: '1px solid #334155', color: '#94a3b8',
            width: 44, height: 44, borderRadius: '8px', cursor: 'pointer', fontSize: '1.3rem',
          }}
        >
          −
        </button>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            background: '#3b82f6', border: 'none', color: 'white',
            width: 44, height: 44, borderRadius: '8px', cursor: 'pointer', fontSize: '1.3rem',
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}

function App() {
  return <Counter />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'destructure-convention',
      text: "The `useState` hook always returns a two-element array. The convention is to destructure it as `[value, setValue]` — name the setter `set` + the variable name, capitalized. The initial value you pass to `useState(initial)` is only used on the very first render. After that, React tracks the state internally.",
      code: `const { useState } = React

function App() {
  const [name, setName] = useState('World')

  return (
    <div style={{
      background: '#1e293b',
      padding: '28px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      maxWidth: '360px',
    }}>
      <h2 style={{ color: '#f1f5f9', margin: '0 0 20px' }}>
        Hello, <span style={{ color: '#38bdf8' }}>{name}</span>!
      </h2>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter a name..."
        style={{
          width: '100%',
          background: '#0f172a',
          border: '1px solid #334155',
          color: '#f1f5f9',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '0.95rem',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '12px', marginBottom: 0 }}>
        Initial value "World" is only used once.
      </p>
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
      id: 'functional-update',
      text: "There are two ways to call a setter: with a direct value, `setCount(5)`, or with a function, `setCount(prev => prev + 1)`. The function form (functional update) receives the current state as its argument and returns the next state. Use the function form whenever the new state depends on the old state — it's guaranteed to use the latest value.",
      code: `const { useState } = React

function App() {
  const [count, setCount] = useState(0)

  // Direct: fine for simple cases
  function resetDirect() {
    setCount(0)
  }

  // Functional: SAFE when new state depends on old state
  function increment() {
    setCount(prev => prev + 1)
  }

  function decrement() {
    setCount(prev => prev - 1)
  }

  // Both setters called in sequence — only functional form is safe here
  function addThree() {
    setCount(prev => prev + 1)
    setCount(prev => prev + 1)
    setCount(prev => prev + 1)
    // Direct form: setCount(count + 1) three times would only add 1
  }

  return (
    <div style={{
      background: '#1e293b', padding: '28px', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '320px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', fontWeight: 700, color: '#38bdf8', lineHeight: 1, marginBottom: '20px' }}>
        {count}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: '−1', action: decrement, bg: '#334155' },
          { label: '+1', action: increment, bg: '#3b82f6' },
          { label: '+3', action: addThree, bg: '#7c3aed' },
          { label: 'Reset', action: resetDirect, bg: '#0f172a' },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{
            background: btn.bg, border: '1px solid #334155',
            color: 'white', padding: '8px 16px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'sans-serif',
          }}>
            {btn.label}
          </button>
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
      id: 'cp-usestate-basic'
    },
    {
      type: 'narration',
      id: 'multiple-state',
      text: "A component can have as many `useState` calls as it needs. Each call is independent — React tracks them in the order they're called (which is why hooks can't be called conditionally). Separate unrelated state into separate `useState` calls rather than putting everything into one object.",
      code: `const { useState } = React

function ProfileForm() {
  // Three separate, independent state variables
  const [name, setName]     = useState('Maya')
  const [age, setAge]       = useState(28)
  const [active, setActive] = useState(true)

  return (
    <div style={{
      background: '#1e293b', padding: '24px', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '360px',
      display: 'flex', flexDirection: 'column', gap: '14px',
    }}>
      <h3 style={{ margin: 0, color: '#f1f5f9' }}>Profile</h3>

      <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
        Name
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            display: 'block', marginTop: '6px', width: '100%',
            background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
            padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem',
            boxSizing: 'border-box', outline: 'none',
          }}
        />
      </label>

      <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
        Age: <strong style={{ color: '#38bdf8' }}>{age}</strong>
        <input
          type="range" min={18} max={60} value={age}
          onChange={e => setAge(Number(e.target.value))}
          style={{ display: 'block', marginTop: '6px', width: '100%', accentColor: '#38bdf8' }}
        />
      </label>

      <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={active}
          onChange={e => setActive(e.target.checked)}
          style={{ accentColor: '#10b981', width: 16, height: 16 }}
        />
        Active account
      </label>

      <div style={{
        background: '#0f172a', padding: '12px', borderRadius: '8px',
        color: '#64748b', fontSize: '0.82rem', fontFamily: 'monospace',
      }}>
        {JSON.stringify({ name, age, active }, null, 2)}
      </div>
    </div>
  )
}

function App() { return <ProfileForm /> }

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'object-state',
      text: "You can store an object in state. The key rule: never mutate the state object directly. Always create a new object using the spread operator: `setState({ ...state, key: newValue })`. React compares the old and new state by reference — if you mutate in place, React won't detect the change and won't re-render.",
      code: `const { useState } = React

function App() {
  const [user, setUser] = useState({
    name: 'Alex',
    role: 'Engineer',
    score: 80,
  })

  function promote() {
    // Spread the old state, then override just what changed
    setUser(prev => ({ ...prev, role: 'Senior Engineer', score: prev.score + 5 }))
  }

  function resetScore() {
    setUser(prev => ({ ...prev, score: 80 }))
  }

  return (
    <div style={{
      background: '#1e293b', padding: '28px', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '320px',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '4px' }}>
          {user.name}
        </div>
        <div style={{ color: '#38bdf8', fontSize: '0.9rem', marginBottom: '4px' }}>{user.role}</div>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Score: {user.score}</div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={promote} style={{
          background: '#3b82f6', border: 'none', color: 'white',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
        }}>
          Promote
        </button>
        <button onClick={resetScore} style={{
          background: '#0f172a', border: '1px solid #334155', color: '#94a3b8',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
        }}>
          Reset score
        </button>
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
      id: 'cp-functional-update'
    },
    {
      type: 'narration',
      id: 'state-per-instance',
      text: "Each instance of a component has its own independent state. Rendering `<Counter />` three times gives you three separate counts — they don't share anything. This is the isolation guarantee of React components. State lives inside each instance, not in some global bucket.",
      code: `const { useState } = React

function Counter({ label, color }) {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      background: '#1e293b',
      border: \`1px solid \${color}44\`,
      borderTop: \`3px solid \${color}\`,
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      minWidth: '120px',
    }}>
      <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color, marginBottom: '14px' }}>
        {count}
      </div>
      <button
        onClick={() => setCount(prev => prev + 1)}
        style={{
          background: color + '22', border: \`1px solid \${color}55\`, color,
          padding: '6px 18px', borderRadius: '6px', cursor: 'pointer',
          fontSize: '0.9rem', fontFamily: 'sans-serif',
        }}
      >
        +1
      </button>
    </div>
  )
}

function App() {
  // Three Counter instances — each has its own count state
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Counter label="Red" color="#f87171" />
      <Counter label="Blue" color="#38bdf8" />
      <Counter label="Green" color="#34d399" />
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
      id: 'array-state',
      text: "Arrays in state follow the same rule as objects: never mutate directly. To add an item, use spread: `[...prev, newItem]`. To remove, use filter: `prev.filter(item => item.id !== id)`. To update one item, use map: `prev.map(item => item.id === id ? { ...item, done: true } : item)`. These patterns are universal in React.",
      code: `const { useState } = React

function App() {
  const [items, setItems] = useState([
    { id: 1, text: 'Learn useState', done: false },
    { id: 2, text: 'Build a counter', done: false },
  ])
  const [next, setNext] = useState('')

  function addItem() {
    if (!next.trim()) return
    setItems(prev => [...prev, { id: Date.now(), text: next, done: false }])
    setNext('')
  }

  function toggle(id) {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ))
  }

  function remove(id) {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div style={{
      background: '#1e293b', padding: '24px', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '380px',
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#f1f5f9' }}>Todo ({items.filter(i => !i.done).length} left)</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          value={next}
          onChange={e => setNext(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="New task..."
          style={{
            flex: 1, background: '#0f172a', border: '1px solid #334155',
            color: '#f1f5f9', padding: '8px 12px', borderRadius: '8px',
            fontSize: '0.9rem', outline: 'none',
          }}
        />
        <button onClick={addItem} style={{
          background: '#3b82f6', border: 'none', color: 'white',
          padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
        }}>
          Add
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map(item => (
          <div key={item.id} style={{
            background: '#0f172a', padding: '10px 12px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggle(item.id)}
              style={{ accentColor: '#10b981', width: 16, height: 16, cursor: 'pointer' }}
            />
            <span style={{
              flex: 1, color: item.done ? '#475569' : '#e2e8f0',
              textDecoration: item.done ? 'line-through' : 'none', fontSize: '0.9rem',
            }}>
              {item.text}
            </span>
            <button onClick={() => remove(item.id)} style={{
              background: 'transparent', border: 'none', color: '#475569',
              cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '2px 4px',
            }}>
              x
            </button>
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
      type: 'checkpoint',
      id: 'cp-object-state'
    },
    {
      type: 'challenge',
      id: 'ch-toggle',
      text: "Build a toggle component. Store a boolean in state. Show a button that flips between two states when clicked: when true show 'ON' with a green background, when false show 'OFF' with a dark background. Also show descriptive text that changes based on the current state.",
      hint: "Use `useState(false)`. The click handler is `() => setOn(prev => !prev)`. Apply a ternary for the button's background color: `on ? '#10b981' : '#334155'`.",
      startCode: `const { useState } = React

function App() {
  // useState for a boolean toggle
  const [on, setOn] = useState(false)

  return (
    <div style={{
      background: '#1e293b', padding: '32px', borderRadius: '14px',
      fontFamily: 'sans-serif', maxWidth: '300px', textAlign: 'center',
    }}>
      {/* Show the current state as text */}
      {/* Button that toggles on/off */}
      {/* Style the button differently for each state */}
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
          /setOn|setToggle|setActive|setEnabled|setIsOn/.test(code) &&
          /true|false/.test(code) &&
          /onClick/.test(code) &&
          (/ON|on/.test(code) || /OFF|off/.test(code))
      }
    },
    {
      type: 'challenge',
      id: 'ch-minmax-counter',
      text: "Build a counter that tracks three values: the current `count`, the `min` value seen so far, and the `max` value seen so far. Use separate `useState` calls for each. Provide + and − buttons. After every change, update min/max if the new count breaks a record. Show all three values.",
      hint: "Use functional updates: `setCount(prev => prev + 1)`. For min/max, call the setter after updating count: `setMin(prev => Math.min(prev, newCount))`. Or compute the new value first into a variable, then call all three setters.",
      startCode: `const { useState } = React

function App() {
  const [count, setCount] = useState(0)
  // Add useState for min and max

  function increment() {
    // Increment count, update max if needed
  }

  function decrement() {
    // Decrement count, update min if needed
  }

  return (
    <div style={{
      background: '#1e293b', padding: '32px', borderRadius: '14px',
      fontFamily: 'sans-serif', maxWidth: '320px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '24px' }}>
        {count}
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
        <button onClick={decrement} style={{
          background: '#0f172a', border: '1px solid #334155', color: '#94a3b8',
          width: 44, height: 44, borderRadius: '8px', cursor: 'pointer', fontSize: '1.3rem',
        }}>−</button>
        <button onClick={increment} style={{
          background: '#3b82f6', border: 'none', color: 'white',
          width: 44, height: 44, borderRadius: '8px', cursor: 'pointer', fontSize: '1.3rem',
        }}>+</button>
      </div>
      {/* Show min and max here */}
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
          (code.match(/useState/g) || []).length >= 3 &&
          /min/i.test(code) &&
          /max/i.test(code) &&
          /Math\.min|Math\.max/.test(code)
      }
    }
  ]
}
