export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-17-memo',
  title: '17. React.memo: Preventing Re-renders',
  chapter: 'react-ch5',
  language: 'react',
  checkpoints: [
    { id: 'cp-memo-basics', label: 'React.memo' },
    { id: 'cp-render-counting', label: 'Seeing Re-renders' },
    { id: 'cp-when-to-memo', label: 'When to Use' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "Every time a parent component re-renders, all its children re-render too — even if the props they receive haven't changed. For cheap components this doesn't matter. For a component that renders a huge list or runs expensive calculations, unnecessary re-renders waste CPU. React.memo wraps a component so it only re-renders when its props change.",
      code: `const { useState, memo } = React

// Without memo: List re-renders every time App state changes
function List({ items }) {
  console.log('List rendered')  // runs on every parent re-render
  return (
    <div>
      {items.map(item => (
        <div key={item} style={{ color: '#94a3b8', padding: '4px 0', fontSize: '0.85rem', borderBottom: '1px solid #334155', fontFamily: 'sans-serif' }}>{item}</div>
      ))}
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const items = ['React', 'Props', 'State', 'Effects', 'Hooks']  // same array ref every render

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '320px', fontFamily: 'sans-serif' }}>
      <button onClick={() => setCount(c => c + 1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '16px' }}>
        Click {count} — List re-renders every time (check console)
      </button>
      <List items={items} />
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
      id: 'with-memo',
      text: "Wrap the component in `React.memo()`. Now React shallowly compares the old and new props before re-rendering. If all props are the same (by reference), the render is skipped entirely. The `memo` function takes a component and returns a memoized version.",
      code: `const { useState, memo } = React

// With memo: List only re-renders when items prop changes
const List = memo(function List({ items }) {
  console.log('List rendered')  // now only fires when items actually changes

  return (
    <div>
      {items.map(item => (
        <div key={item} style={{ color: '#10b981', padding: '4px 0', fontSize: '0.85rem', borderBottom: '1px solid #1e293b', fontFamily: 'sans-serif' }}>{item}</div>
      ))}
    </div>
  )
})

function App() {
  const [count, setCount] = useState(0)
  const [addedItem, setAddedItem] = useState(false)

  // items is recreated on every render — we'll fix this with useCallback/useMemo later
  const items = addedItem
    ? ['React', 'Props', 'State', 'Effects', 'Hooks', 'Custom Hooks']
    : ['React', 'Props', 'State', 'Effects', 'Hooks']

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '320px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setCount(c => c + 1)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Click {count} (List skips!)
        </button>
        <button onClick={() => setAddedItem(true)} style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Add item (List updates)
        </button>
      </div>
      <List items={items} />
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
      id: 'cp-memo-basics'
    },
    {
      type: 'narration',
      id: 'render-counter',
      text: "To see re-renders visually, add a render counter to a component. Use a ref to count renders (not state — that would cause extra renders). Flash a background color briefly on each render to make wasted renders obvious. This is the poor man's profiler.",
      code: `const { useState, useRef, memo } = React

function withRenderCount(Component, color) {
  return function Wrapped(props) {
    const renderCount = useRef(0)
    renderCount.current++

    return (
      <div style={{ position: 'relative', outline: '2px solid ' + color, outlineOffset: '2px', borderRadius: '6px' }}>
        <div style={{ position: 'absolute', top: '-10px', right: '4px', background: color, color: '#fff', fontSize: '9px', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
          renders: {renderCount.current}
        </div>
        <Component {...props} />
      </div>
    )
  }
}

function Header({ title }) {
  return <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px', color: '#f1f5f9', fontFamily: 'sans-serif', fontWeight: 600 }}>{title}</div>
}

function Body({ count }) {
  return <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px', color: '#94a3b8', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>Count: {count}</div>
}

const TrackedHeader = withRenderCount(memo(Header), '#3b82f6')
const TrackedBody   = withRenderCount(Body, '#ef4444')  // no memo

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '320px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Blue = memo'd (stays at 1). Red = not memo'd (increments).</p>
      <TrackedHeader title="Static Header" />
      <TrackedBody count={count} />
      <button onClick={() => setCount(c => c + 1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
        Re-render parent
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
      id: 'shallow-comparison',
      text: "React.memo uses shallow comparison: primitive props (strings, numbers, booleans) compare by value. Object and array props compare by reference. A new array literal `[]` is never equal to another `[]` even if the contents are the same. This is why memo'd components often still re-render — their array/function props are recreated on every parent render.",
      code: `const { useState, memo } = React

const Tag = memo(function Tag({ label, style }) {
  console.log('Tag rendered:', label)
  return (
    <span style={{ ...style, padding: '4px 10px', borderRadius: '999px', fontSize: '0.8rem', fontFamily: 'sans-serif', fontWeight: 600 }}>
      {label}
    </span>
  )
})

function App() {
  const [count, setCount] = useState(0)

  // These are new object references every render — memo won't help!
  const goodStyle = { background: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }  // new object every render
  const badStyle  = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440' }

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px' }}>
        Both tags re-render despite memo — their style props are new objects each render. Fix: move style objects outside the component or use useMemo.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Tag label="Saved" style={goodStyle} />
        <Tag label="Error" style={badStyle} />
      </div>
      <button onClick={() => setCount(c => c + 1)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
        Trigger parent re-render ({count})
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
      id: 'cp-render-counting'
    },
    {
      type: 'narration',
      id: 'custom-comparator',
      text: "React.memo accepts a second argument: a custom comparison function `(prevProps, nextProps) => boolean`. Return true to skip re-render, false to allow it. This is useful when you only care about specific fields of a complex prop object.",
      code: `const { useState, memo } = React

// Only re-render if the user's ID changes — ignore name changes
const UserCard = memo(
  function UserCard({ user }) {
    console.log('UserCard rendered for ID:', user.id)
    return (
      <div style={{ background: '#0f172a', padding: '14px 16px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{user.name}</div>
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>ID: {user.id}</div>
      </div>
    )
  },
  // Custom comparator: only re-render when ID changes
  (prev, next) => prev.user.id === next.user.id
)

function App() {
  const [userId, setUserId] = useState(1)
  const [theme, setTheme] = useState('dark')  // unrelated state change

  const user = { id: userId, name: 'User #' + userId + ' (' + theme + ' theme)' }

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '340px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
        Changing theme doesn't re-render UserCard. Changing ID does.
      </p>
      <UserCard user={user} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setUserId(id => id + 1)} style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Change ID (re-renders)
        </button>
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ flex: 1, background: '#334155', color: '#94a3b8', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Change Theme (skipped)
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
      type: 'narration',
      id: 'when-not-to-memo',
      text: "Don't memo everything. The comparison itself costs CPU. Memo helps when: the component is expensive to render, the props are genuinely stable, and you've measured a real performance problem. Cheap components, components that always receive new props, and components deep in a simple tree are all poor candidates for memo.",
      code: `const { useState, memo } = React

// Good memo candidate: renders a large expensive list
const ExpensiveList = memo(function ExpensiveList({ items, filterFn }) {
  const filtered = items.filter(filterFn)  // "expensive" filter
  return (
    <div style={{ maxHeight: '120px', overflow: 'auto' }}>
      {filtered.map(item => (
        <div key={item.id} style={{ color: '#94a3b8', fontSize: '0.75rem', padding: '2px 0', fontFamily: 'monospace' }}>
          {item.name}
        </div>
      ))}
    </div>
  )
})

// Bad memo candidate: trivial component, always re-renders anyway
// const Label = memo(function Label({ text }) { return <span>{text}</span> })

function App() {
  const [query, setQuery] = useState('')
  const [other, setOther] = useState(0)
  const items = Array.from({ length: 50 }, (_, i) => ({ id: i, name: 'Item-' + i }))

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '340px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Memo Best Practices</h2>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter items..." style={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }} />
      <button onClick={() => setOther(n => n + 1)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
        Unrelated state change ({other}) — List stays put if query unchanged
      </button>
      <ExpensiveList items={items} filterFn={item => item.name.includes(query)} />
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
      id: 'cp-when-to-memo'
    },
    {
      type: 'challenge',
      id: 'ch-memo-list',
      text: "Build a parent with a counter and a `TaskList` component that receives a `tasks` array prop. Without memo, TaskList re-renders every time the counter changes. Wrap TaskList in React.memo to prevent that. Add a visible render counter (using useRef) inside TaskList to prove it stops re-rendering.",
      hint: "const TaskList = memo(function TaskList({ tasks }) { const renderCount = useRef(0); renderCount.current++; return <div>renders: {renderCount.current} ...</div> })",
      startCode: `const { useState, useRef, memo } = React

// Wrap this in React.memo
function TaskList({ tasks }) {
  // Add a useRef render counter here to prove memo works

  return (
    <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', marginTop: '12px' }}>
      <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '8px' }}>
        TaskList renders: {/* render count here */}
      </div>
      {tasks.map(t => (
        <div key={t.id} style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '4px 0', fontFamily: 'sans-serif' }}>
          {t.title}
        </div>
      ))}
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const tasks = [
    { id: 1, title: 'Learn React.memo' },
    { id: 2, title: 'Understand shallow comparison' },
    { id: 3, title: 'Profile before optimizing' },
  ]

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', width: '100%', fontFamily: 'sans-serif' }}>
        <button onClick={() => setCount(c => c + 1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
          Parent renders: {count}
        </button>
        <TaskList tasks={tasks} />
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /memo\(/.test(code) && /useRef/.test(code) && /\.current\+\+|\.current\s*=.*\+/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-custom-comparator',
      text: "Build a `ScoreCard` component wrapped in React.memo with a custom comparator that only re-renders when the `score` prop changes — not when `label` changes. The parent has two buttons: one changes the score, one changes the label. The ScoreCard should skip re-render on label changes.",
      hint: "React.memo(Component, (prev, next) => prev.score === next.score) — returning true means SKIP re-render.",
      startCode: `const { useState, useRef, memo } = React

// Wrap in memo with a custom comparator
// Only re-render when score changes, not when label changes
function ScoreCard({ score, label }) {
  const renderCount = useRef(0)
  renderCount.current++

  return (
    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <div style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '8px' }}>renders: {renderCount.current}</div>
      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 700 }}>{score}</div>
    </div>
  )
}

function App() {
  const [score, setScore] = useState(0)
  const [label, setLabel] = useState('Player Score')

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '300px', width: '100%', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ScoreCard score={score} label={label} />
        <button onClick={() => setScore(s => s + 10)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
          Change Score (should re-render)
        </button>
        <button onClick={() => setLabel(l => l === 'Player Score' ? 'High Score' : 'Player Score')} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
          Change Label (should skip)
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /memo\(/.test(code) && /prev.*next|next.*prev/.test(code)
      }
    }
  ]
}
