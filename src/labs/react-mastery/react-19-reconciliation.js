export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-19-reconciliation',
  title: '19. Keys & Reconciliation',
  chapter: 'react-ch5',
  language: 'react',
  checkpoints: [
    { id: 'cp-key-identity', label: 'Key as Identity' },
    { id: 'cp-index-problem', label: 'Index Key Problem' },
    { id: 'cp-force-reset', label: 'Forced Reset' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "React's reconciler compares the previous virtual DOM tree to the new one after each state change. It updates only the DOM nodes that actually changed. Keys are how it tracks identity across list items — the same key means 'same element, update it'; a missing key means 'new element, create it'; a removed key means 'gone, destroy it'.",
      code: `const { useState } = React

// React reconciler in action — only the changed item updates
function App() {
  const [items, setItems] = useState([
    { id: 1, text: 'First', color: '#3b82f6' },
    { id: 2, text: 'Second', color: '#10b981' },
    { id: 3, text: 'Third', color: '#f59e0b' },
  ])

  function addItem() {
    const n = items.length + 1
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    setItems(prev => [...prev, { id: Date.now(), text: 'Item ' + n, color: colors[n % colors.length] }])
  }

  function removeFirst() {
    setItems(prev => prev.slice(1))
  }

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '320px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Reconciler Demo</h2>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={addItem} style={{ flex: 1, background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Add</button>
        <button onClick={removeFirst} style={{ flex: 1, background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Remove first</button>
      </div>
      {items.map(item => (
        // key is the identity — React tracks this across renders
        <div key={item.id} style={{ background: item.color + '20', border: '1px solid ' + item.color + '40', padding: '10px 14px', borderRadius: '6px', color: item.color, fontWeight: 600 }}>
          {item.text} (id: {item.id})
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
      type: 'narration',
      id: 'no-key-problem',
      text: "Without keys, React uses position to identify list items. When you remove an item from the front, everything shifts — React updates every item instead of removing one. With correct keys, React knows exactly which element was removed and only unmounts that one.",
      code: `const { useState } = React

// Track renders with a color flash
function Item({ text, id }) {
  return (
    <div style={{ padding: '10px 14px', background: '#1e293b', borderRadius: '6px', color: '#f1f5f9', fontFamily: 'sans-serif', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
      <span>{text}</span>
      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>id:{id}</span>
    </div>
  )
}

function App() {
  const [items, setItems] = useState([
    { id: 10, text: 'Alpha' },
    { id: 20, text: 'Beta' },
    { id: 30, text: 'Gamma' },
  ])

  return (
    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '10px', maxWidth: '340px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 4px' }}>With stable ID keys — React only removes the targeted item:</p>
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Item text={item.text} id={item.id} />
          <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0 }}>
            ×
          </button>
        </div>
      ))}
      <button onClick={() => setItems([{ id: 10, text: 'Alpha' }, { id: 20, text: 'Beta' }, { id: 30, text: 'Gamma' }])} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', marginTop: '4px' }}>
        Reset
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
      id: 'cp-key-identity'
    },
    {
      type: 'narration',
      id: 'index-key-bug',
      text: "Using array index as key is almost always wrong for dynamic lists. When you remove index 0, what was index 1 becomes index 0. React thinks element 0 is still there (same key) and just updates its props. If that element had internal state — like a controlled input — that state is now attached to the wrong element.",
      code: `const { useState } = React

// The classic index-as-key bug with controlled inputs
function App() {
  const [items, setItems] = useState(['React', 'Angular', 'Vue'])

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0 0 8px', fontWeight: 600 }}>
        Bug: Index keys + controlled inputs
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 8px' }}>
        1. Type in the first input. 2. Remove "React". Watch the typed text stay — it moved to the wrong item!
      </p>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', gap: '8px' }}>   {/* BAD: key=index */}
          <span style={{ color: '#f1f5f9', fontSize: '0.9rem', width: '70px', lineHeight: '36px' }}>{item}</span>
          <input placeholder={'Notes for ' + item + '...'} style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem' }} />
          <button onClick={() => setItems(prev => prev.filter((_, i) => i !== index))} style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>
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
      type: 'narration',
      id: 'fix-with-id',
      text: "Fix: use a stable unique ID as the key. Now when 'React' is removed, React correctly unmounts its input (along with whatever the user typed). The remaining items keep their correct state. The ID stays with the data, not with the position.",
      code: `const { useState } = React

let nextId = 4

function App() {
  const [items, setItems] = useState([
    { id: 1, label: 'React' },
    { id: 2, label: 'Angular' },
    { id: 3, label: 'Vue' },
  ])

  function addItem() {
    setItems(prev => [...prev, { id: nextId++, label: 'Framework ' + (nextId - 1) }])
  }

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ color: '#10b981', fontSize: '0.85rem', margin: '0 0 8px', fontWeight: 600 }}>
        Fixed: Stable ID keys
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 8px' }}>
        Type in any input, then remove another item. Your text stays with the right item.
      </p>
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', gap: '8px' }}>  {/* GOOD: key=item.id */}
          <span style={{ color: '#f1f5f9', fontSize: '0.9rem', width: '80px', lineHeight: '36px' }}>{item.label}</span>
          <input placeholder={'Notes...'} style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem' }} />
          <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>
        </div>
      ))}
      <button onClick={addItem} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', marginTop: '4px' }}>
        Add Framework
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
      id: 'cp-index-problem'
    },
    {
      type: 'narration',
      id: 'key-for-reset',
      text: "There's a powerful trick: changing a component's key forces React to unmount the old instance and mount a fresh one. This resets all internal state. Instead of wiring up a complex 'reset to initial values' flow, just change the key. Increment a counter or use a game ID.",
      code: `const { useState } = React

function GameBoard({ onWin }) {
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  function handleMove() {
    const next = moves + 1
    setMoves(next)
    if (next >= 5) {
      setWon(true)
      setTimeout(onWin, 800)
    }
  }

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', textAlign: 'center', maxWidth: '280px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{won ? '🏆' : '🎮'}</div>
      <div style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '0.9rem' }}>
        {won ? 'You won!' : 'Moves: ' + moves + ' / 5'}
      </div>
      {!won && (
        <button onClick={handleMove} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Make Move
        </button>
      )}
    </div>
  )
}

function App() {
  const [gameId, setGameId] = useState(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', fontFamily: 'sans-serif' }}>
      {/* Changing key completely resets GameBoard's internal state */}
      <GameBoard key={gameId} onWin={() => {}} />
      <button onClick={() => setGameId(id => id + 1)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
        New Game (key: {gameId})
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
      id: 'fragment-keys',
      text: "Fragments can also have keys when used in lists. Use the explicit `<React.Fragment key={id}>` form — the shorthand `<>` doesn't support the key prop. This is useful when each list item renders multiple sibling elements that shouldn't be wrapped in an extra div.",
      code: `const { Fragment } = React

function App() {
  const entries = [
    { id: 1, label: 'Name', value: 'Maya Chen' },
    { id: 2, label: 'Role', value: 'Senior Engineer' },
    { id: 3, label: 'Team', value: 'Platform' },
  ]

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '320px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px', fontSize: '1rem' }}>Profile Details</h2>
      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
        {entries.map(entry => (
          // Fragment with key — no wrapper div in the DOM
          <Fragment key={entry.id}>
            <dt style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>{entry.label}</dt>
            <dd style={{ color: '#f1f5f9', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>{entry.value}</dd>
          </Fragment>
        ))}
      </dl>
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
      id: 'cp-force-reset'
    },
    {
      type: 'challenge',
      id: 'ch-stable-keys',
      text: "Build a todo list where items can be added and deleted. Each todo has a text input beside it (for notes). Use a stable ID (not index) as the key. Add a 'Delete first' button. Typing notes in the first item then clicking delete should not move those notes to the second item.",
      hint: "Generate IDs with let nextId = 1. When adding: { id: nextId++, title: text }. Use key={todo.id}. Delete by filtering: setTodos(prev => prev.filter(t => t.id !== id)).",
      startCode: `const { useState } = React

let nextId = 1

function App() {
  const [todos, setTodos] = useState([
    { id: nextId++, title: 'Buy groceries' },
    { id: nextId++, title: 'Write tests' },
  ])
  const [input, setInput] = useState('')

  function addTodo() {
    if (!input.trim()) return
    // Add with stable ID
    setInput('')
  }

  function deleteFirst() {
    // Remove the first todo
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '400px', width: '100%', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="New todo..." style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }} />
          <button onClick={addTodo} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
        </div>
        <button onClick={deleteFirst} style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Delete First Todo
        </button>
        {todos.map(todo => (
          // Use todo.id as key — NOT the index
          <div key={/* YOUR KEY HERE */0} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#f1f5f9', fontSize: '0.9rem', minWidth: '100px' }}>{todo.title}</span>
            <input placeholder="Notes..." style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /key=\{todo\.id\}/.test(code) || /key=\{[a-z]+\.id\}/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-key-reset',
      text: "Build a `Timer` component that counts up from 0 every second using useEffect and useState. In the parent `App`, add a 'Reset Timer' button. Instead of adding a reset mechanism to Timer, use the key prop trick: increment a `gameKey` state in App, and pass it as the key on Timer to force a fresh mount.",
      hint: "const [gameKey, setGameKey] = useState(0). Render <Timer key={gameKey} />. The Reset button does setGameKey(k => k + 1). Timer only needs to count up — no reset logic needed.",
      startCode: `const { useState, useEffect } = React

function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '3rem', fontWeight: 700, color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>
        {seconds}s
      </div>
    </div>
  )
}

function App() {
  // Use a key state to reset Timer via remounting
  // Don't add any reset logic to Timer itself

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', fontFamily: 'sans-serif' }}>
        {/* Render Timer with a key prop */}
        <Timer />
        <button
          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          Reset Timer
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /key=\{/.test(code) && /useState/.test(code) && /Timer/.test(code)
      }
    }
  ]
}
