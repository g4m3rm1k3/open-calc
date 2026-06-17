export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-04-lists-keys',
  title: '04. Lists & Keys',
  chapter: 'react-ch1',
  language: 'react',
  checkpoints: [
    { id: 'cp-map-keys', label: 'Map & Keys' },
    { id: 'cp-conditional', label: 'Conditional Rendering' },
    { id: 'cp-filter', label: 'Filter' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'map-intro',
      text: "To render a list in JSX, you use JavaScript's `Array.map()`. Each item in the array becomes a JSX element. This is not a special React API — it's plain JavaScript returning an array of JSX nodes. React knows how to render an array of elements automatically.",
      code: `function App() {
  const languages = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go']

  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      maxWidth: '320px',
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#38bdf8' }}>Languages</h3>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {languages.map(lang => (
          <li style={{
            background: '#0f172a',
            color: '#f1f5f9',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            borderLeft: '3px solid #334155',
          }}>
            {lang}
          </li>
        ))}
      </ul>
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
      id: 'keys-why',
      text: "The code above works but produces a console warning: each child in a list should have a unique `key` prop. React uses keys to identify which items changed, were added, or were removed between renders. Without keys, React has to guess — which causes bugs when items are reordered or deleted. Keys must be unique among siblings.",
      code: `function App() {
  const tasks = [
    { id: 'task-1', label: 'Set up project' },
    { id: 'task-2', label: 'Build components' },
    { id: 'task-3', label: 'Add routing' },
    { id: 'task-4', label: 'Deploy to production' },
  ]

  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      maxWidth: '340px',
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#f1f5f9' }}>Tasks</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map(task => (
          // key goes on the OUTERMOST element returned from map
          <div key={task.id} style={{
            background: '#0f172a',
            padding: '12px 16px',
            borderRadius: '8px',
            color: '#94a3b8',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ color: '#334155', fontSize: '0.8rem' }}>{task.id}</span>
            {task.label}
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
      id: 'key-placement',
      text: "The `key` must be on the outermost element you return from `.map()`. If you return a component, `key` goes on the component tag — not on the root element inside the component. And never use the array index as a key if the list can be reordered or filtered — use a stable, unique ID from your data.",
      code: `function TaskRow({ label, status }) {
  const color = status === 'done' ? '#10b981' : status === 'active' ? '#38bdf8' : '#64748b'

  return (
    <div style={{
      background: '#0f172a',
      padding: '12px 16px',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'sans-serif',
    }}>
      <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{label}</span>
      <span style={{
        background: color + '22', color,
        border: \`1px solid \${color}44\`,
        padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
      }}>
        {status}
      </span>
    </div>
  )
}

function App() {
  const tasks = [
    { id: 'a1', label: 'Design mockups', status: 'done' },
    { id: 'a2', label: 'Build auth flow', status: 'active' },
    { id: 'a3', label: 'Write tests', status: 'todo' },
  ]

  return (
    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {tasks.map(t => (
        // key on the component tag — not inside TaskRow
        <TaskRow key={t.id} label={t.label} status={t.status} />
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
      id: 'cp-map-keys'
    },
    {
      type: 'narration',
      id: 'conditional-and',
      text: "Conditional rendering means showing something only when a condition is true. The shortest syntax is the `&&` short-circuit: `{condition && <Element />}`. If condition is true, React renders the element. If false, it renders nothing. Use this for simple show/hide cases.",
      code: `const { useState } = React

function NotificationBanner({ message }) {
  return (
    <div style={{
      background: '#38bdf822',
      border: '1px solid #38bdf855',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#38bdf8',
      fontSize: '0.9rem',
      fontFamily: 'sans-serif',
      marginBottom: '16px',
    }}>
      {message}
    </div>
  )
}

function App() {
  const [hasNotification, setHasNotification] = useState(true)
  const [count, setCount] = useState(3)

  return (
    <div style={{
      background: '#1e293b', padding: '24px', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '360px',
    }}>
      {/* && short-circuit: only renders when true */}
      {hasNotification && (
        <NotificationBanner message="You have 3 new messages." />
      )}

      {/* count > 0 — show count, else show nothing */}
      {count > 0 && (
        <p style={{ color: '#94a3b8', margin: '0 0 16px' }}>Items remaining: {count}</p>
      )}

      <button
        onClick={() => setHasNotification(false)}
        style={{
          background: '#0f172a', border: '1px solid #334155', color: '#94a3b8',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
          marginRight: '8px',
        }}
      >
        Dismiss
      </button>
      <button
        onClick={() => setCount(c => Math.max(0, c - 1))}
        style={{
          background: '#0f172a', border: '1px solid #334155', color: '#94a3b8',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
        }}
      >
        Remove item
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
      id: 'conditional-ternary',
      text: "The ternary operator handles the either/or case: `{condition ? <A /> : <B />}`. Render A when true, B when false. Ternaries work well for toggling between two states. For more complex branching — more than two cases — extract the logic into a variable above the return.",
      code: `const { useState } = React

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div style={{
      background: '#1e293b',
      padding: '32px',
      borderRadius: '14px',
      fontFamily: 'sans-serif',
      maxWidth: '360px',
      textAlign: 'center',
    }}>
      {/* Ternary: one of two completely different UIs */}
      {isLoggedIn ? (
        <div>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '1.3rem',
            margin: '0 auto 14px',
          }}>
            M
          </div>
          <h3 style={{ margin: '0 0 6px', color: '#f1f5f9' }}>Welcome back, Maya!</h3>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.85rem' }}>You are signed in.</p>
        </div>
      ) : (
        <div>
          <p style={{ color: '#94a3b8', margin: '0 0 20px' }}>Please sign in to continue.</p>
        </div>
      )}

      <button
        onClick={() => setIsLoggedIn(v => !v)}
        style={{
          background: isLoggedIn ? '#334155' : '#3b82f6',
          color: 'white', border: 'none', padding: '10px 24px',
          borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
        }}
      >
        {isLoggedIn ? 'Sign Out' : 'Sign In'}
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
      id: 'empty-state',
      text: "A common pattern is the empty-state: when a list is empty, render a helpful message instead of nothing. Use a ternary or early-return: if the array is empty, show the empty state; otherwise map over the items. Always handle the zero-items case — a blank screen is confusing.",
      code: `const { useState } = React

function App() {
  const [items, setItems] = useState(['Deploy API', 'Update docs', 'Write tests'])

  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      maxWidth: '360px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#f1f5f9' }}>Tasks ({items.length})</h3>
        <button
          onClick={() => setItems([])}
          style={{
            background: 'transparent', border: '1px solid #334155', color: '#64748b',
            padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
          }}
        >
          Clear all
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>---</div>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>No tasks. You are all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map(item => (
            <div key={item} style={{
              background: '#0f172a', padding: '10px 14px', borderRadius: '8px',
              color: '#94a3b8', fontSize: '0.9rem',
            }}>
              {item}
            </div>
          ))}
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
      id: 'cp-conditional'
    },
    {
      type: 'narration',
      id: 'filter-list',
      text: "You can combine `.filter()` and `.map()` in JSX. Filter first to narrow the array, then map to render. The pattern `array.filter(predicate).map(render)` is idiomatic React. The key still goes on the outermost element of each mapped item.",
      code: `const { useState } = React

function App() {
  const [query, setQuery] = useState('')

  const repos = [
    { id: 1, name: 'react-dashboard', stars: 342 },
    { id: 2, name: 'cli-tools',       stars: 89 },
    { id: 3, name: 'auth-kit',        stars: 217 },
    { id: 4, name: 'react-hooks',     stars: 580 },
    { id: 5, name: 'design-system',   stars: 124 },
  ]

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div style={{
      background: '#1e293b', padding: '24px', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '360px',
    }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search repos..."
        style={{
          width: '100%', background: '#0f172a', border: '1px solid #334155',
          color: '#f1f5f9', padding: '10px 14px', borderRadius: '8px',
          fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '16px',
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 && (
          <p style={{ color: '#475569', textAlign: 'center', padding: '12px 0', margin: 0, fontSize: '0.9rem' }}>
            No repos match "{query}"
          </p>
        )}
        {filtered.map(repo => (
          <div key={repo.id} style={{
            background: '#0f172a', padding: '10px 16px', borderRadius: '8px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: '#38bdf8', fontSize: '0.9rem' }}>{repo.name}</span>
            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{repo.stars} stars</span>
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
      id: 'map-derived-content',
      text: "Map can return anything — including conditionally-styled elements. You don't need a separate filter step if you just want to change appearance based on data. Compute styles or classes inside `.map()` directly from each item's properties.",
      code: `function App() {
  const commits = [
    { id: 'c1', hash: 'a3f2c1', message: 'feat: add auth module', type: 'feat' },
    { id: 'c2', hash: 'b91d4e', message: 'fix: resolve token expiry bug', type: 'fix' },
    { id: 'c3', hash: 'c55a0f', message: 'chore: update dependencies', type: 'chore' },
    { id: 'c4', hash: 'd12e7a', message: 'feat: add dark mode toggle', type: 'feat' },
    { id: 'c5', hash: 'e8b309', message: 'fix: correct padding in sidebar', type: 'fix' },
  ]

  const typeColor = { feat: '#38bdf8', fix: '#f87171', chore: '#94a3b8' }

  return (
    <div style={{
      background: '#1e293b', padding: '20px', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '420px',
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontSize: '1rem' }}>Recent Commits</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {commits.map(c => {
          const color = typeColor[c.type] || '#64748b'
          return (
            <div key={c.id} style={{
              background: '#0f172a', padding: '10px 14px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <code style={{ color: '#475569', fontSize: '0.78rem', minWidth: 52 }}>{c.hash}</code>
              <span style={{
                background: color + '22', color, border: \`1px solid \${color}44\`,
                padding: '1px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
              }}>
                {c.type}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{c.message.replace(/^\w+: /, '')}</span>
            </div>
          )
        })}
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
      id: 'cp-filter'
    },
    {
      type: 'challenge',
      id: 'ch-task-list',
      text: "Render a list of task objects: `[{ id: 1, name: 'Buy groceries', done: true }, { id: 2, name: 'Write tests', done: false }, { id: 3, name: 'Fix bug', done: true }]`. Map over them and render each as a `<div>` with a `key`. Apply a strikethrough (`textDecoration: 'line-through'`) to tasks where `done` is true.",
      hint: "Use `key={task.id}` on the outer div. For the style, compute `textDecoration: task.done ? 'line-through' : 'none'` and apply it to the text element.",
      startCode: `// Render a list of tasks
// Strike through tasks where done === true
// key on each task div

function App() {
  const tasks = [
    { id: 1, name: 'Buy groceries', done: true },
    { id: 2, name: 'Write tests', done: false },
    { id: 3, name: 'Fix bug', done: true },
    { id: 4, name: 'Update README', done: false },
  ]

  return (
    <div style={{
      background: '#1e293b', padding: '24px', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '340px',
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#f1f5f9' }}>Tasks</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Map over tasks, key on each, strikethrough if done */}
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
        return /\.map\(/.test(code) &&
          /key=/.test(code) &&
          /line-through/.test(code) &&
          /done/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-filtered-list',
      text: "Build a searchable list. Start with an array of at least 5 fruit or language names. Add a text input that updates a `query` state. Filter the list to items that include the query (case-insensitive) and render the filtered results with keys. Show a 'No results' message when nothing matches.",
      hint: "Use `useState('')` for query. Filter with `.filter(item => item.toLowerCase().includes(query.toLowerCase()))`. Render the filtered array with `.map()`. Add a condition for empty results.",
      startCode: `const { useState } = React

function App() {
  const [query, setQuery] = useState('')

  const items = [
    // Add at least 5 items here
  ]

  // Filter items based on query
  const filtered = []

  return (
    <div style={{
      background: '#1e293b', padding: '24px', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '340px',
    }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
        style={{
          width: '100%', background: '#0f172a', border: '1px solid #334155',
          color: '#f1f5f9', padding: '10px 14px', borderRadius: '8px',
          fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '16px', outline: 'none',
        }}
      />
      {/* Render filtered items with keys */}
      {/* Show a "No results" message when filtered is empty */}
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
        return /\.filter\(/.test(code) &&
          /\.map\(/.test(code) &&
          /key=/.test(code) &&
          /includes/.test(code) &&
          /query/.test(code)
      }
    }
  ]
}
