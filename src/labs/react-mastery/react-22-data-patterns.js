export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-22-data-patterns',
  title: '22. Data Fetching Patterns',
  chapter: 'react-ch6',
  language: 'react',
  checkpoints: [
    { id: 'cp-four-states', label: 'Four States' },
    { id: 'cp-dependent-fetch', label: 'Dependent Fetch' },
    { id: 'cp-optimistic', label: 'Optimistic Update' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "Every data fetching operation has four possible states: idle (nothing requested yet), loading (request in flight), error (request failed), success (data arrived). A robust component handles all four. Most bugs come from treating fetch as two-state: loading or done. The error case is always the one that gets forgotten.",
      code: `const { useState, useEffect } = React

function App() {
  const [status, setStatus] = useState('idle')   // idle | loading | error | success
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function fetchUser() {
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/users/1')
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      setData(json)
      setStatus('success')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Four-State Pattern</h2>
      <button onClick={fetchUser} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
        Fetch User
      </button>

      {status === 'idle' && <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Click to fetch.</p>}
      {status === 'loading' && <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Loading...</p>}
      {status === 'error' && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>Error: {error}</p>}
      {status === 'success' && (
        <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px' }}>
          <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{data.name}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{data.email}</div>
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
      id: 'abort-controller',
      text: "When a component unmounts before a fetch completes, the callback still fires and tries to setState on an unmounted component — a memory leak and a potential bug. AbortController cancels the request on cleanup. Return the abort call from the useEffect cleanup function.",
      code: `const { useState, useEffect } = React

function UserCard({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setUser(null)

    fetch('https://jsonplaceholder.typicode.com/users/' + userId, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false) })
      .catch(err => { if (err.name !== 'AbortError') setLoading(false) })

    return () => controller.abort()  // cleanup: cancel if userId changes or unmounts
  }, [userId])

  if (loading) return <div style={{ color: '#94a3b8', fontFamily: 'sans-serif', padding: '14px' }}>Loading user {userId}...</div>
  if (!user) return null

  return (
    <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{user.name}</div>
      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{user.email} · {user.company?.name}</div>
    </div>
  )
}

function App() {
  const [userId, setUserId] = useState(1)
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>AbortController Demo</h2>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1,2,3,4,5].map(id => (
          <button key={id} onClick={() => setUserId(id)} style={{ flex: 1, background: id === userId ? '#3b82f6' : '#334155', color: id === userId ? '#fff' : '#94a3b8', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            {id}
          </button>
        ))}
      </div>
      <UserCard userId={userId} />
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
      id: 'cp-four-states'
    },
    {
      type: 'narration',
      id: 'dependent-fetch',
      text: "Dependent fetches: fetch A, then use A's result to fetch B. The wrong approach is nesting fetches inside callbacks. The right approach: two useEffect calls where the second depends on data from the first. Or a single useEffect that awaits both in sequence.",
      code: `const { useState, useEffect } = React

function App() {
  const [userId, setUserId] = useState(1)
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      setUser(null)
      setPosts([])

      // Step 1: fetch user
      const userRes = await fetch('https://jsonplaceholder.typicode.com/users/' + userId)
      const userData = await userRes.json()
      if (cancelled) return
      setUser(userData)

      // Step 2: fetch that user's posts (depends on userId)
      const postsRes = await fetch('https://jsonplaceholder.typicode.com/posts?userId=' + userId + '&_limit=3')
      const postsData = await postsRes.json()
      if (cancelled) return
      setPosts(postsData)
      setLoading(false)
    }
    fetchAll()
    return () => { cancelled = true }
  }, [userId])

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Dependent Fetch</h2>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1,2,3].map(id => (
          <button key={id} onClick={() => setUserId(id)} style={{ flex: 1, background: id === userId ? '#3b82f6' : '#334155', color: id === userId ? '#fff' : '#94a3b8', border: 'none', padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            User {id}
          </button>
        ))}
      </div>
      {loading && <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Fetching user then their posts...</p>}
      {user && <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px' }}><div style={{ color: '#f1f5f9', fontWeight: 600 }}>{user.name}</div><div style={{ color: '#64748b', fontSize: '0.8rem' }}>{user.email}</div></div>}
      {posts.map(post => (
        <div key={post.id} style={{ background: '#0f172a', padding: '10px 12px', borderRadius: '6px', color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>
          <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>{post.title}</strong>
          {post.body.slice(0, 80)}...
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
      id: 'polling',
      text: "Polling is fetching on a schedule — every N seconds — to stay up to date without WebSockets. Pattern: set up an interval inside useEffect, fetch on each tick, return clearInterval for cleanup. The deps array should be empty if the fetch URL doesn't depend on state.",
      code: `const { useState, useEffect } = React

function App() {
  const [time, setTime] = useState(null)
  const [pollCount, setPollCount] = useState(0)
  const [polling, setPolling] = useState(true)

  useEffect(() => {
    if (!polling) return

    async function fetchTime() {
      try {
        const res = await fetch('https://worldtimeapi.org/api/ip')
        const data = await res.json()
        setTime(new Date(data.datetime).toLocaleTimeString())
        setPollCount(n => n + 1)
      } catch {
        // Use a fallback if the API is down
        setTime(new Date().toLocaleTimeString() + ' (local)')
        setPollCount(n => n + 1)
      }
    }

    fetchTime()  // fetch immediately
    const id = setInterval(fetchTime, 5000)  // then every 5s
    return () => clearInterval(id)  // cleanup
  }, [polling])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '320px', fontFamily: 'sans-serif', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Polling Demo (5s interval)</h2>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9' }}>{time || 'Fetching...'}</div>
      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Poll count: {pollCount}</div>
      <button onClick={() => setPolling(p => !p)} style={{ background: polling ? '#ef444420' : '#10b98120', color: polling ? '#ef4444' : '#10b981', border: '1px solid ' + (polling ? '#ef444440' : '#10b98140'), padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
        {polling ? 'Stop Polling' : 'Start Polling'}
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
      id: 'cp-dependent-fetch'
    },
    {
      type: 'narration',
      id: 'optimistic-update',
      text: "Optimistic update: apply the change to UI immediately, then send the request. If the request fails, roll back. This makes the UI feel instant even on slow connections. The pattern: save old state, apply new state, await request, revert on error.",
      code: `const { useState } = React

function App() {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(142)
  const [pending, setPending] = useState(false)

  async function handleLike() {
    if (pending) return
    // Optimistically update
    const wasLiked = liked
    const prevCount = count
    setLiked(!wasLiked)
    setCount(c => wasLiked ? c - 1 : c + 1)
    setPending(true)

    // Simulate request (50% failure chance for demo)
    try {
      await new Promise((resolve, reject) => setTimeout(() => Math.random() > 0.5 ? resolve() : reject(new Error('Server error')), 800))
    } catch {
      // Rollback on error
      setLiked(wasLiked)
      setCount(prevCount)
      alert('Failed to save! Rolled back.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '300px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Optimistic Like</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Click updates instantly. 50% chance of simulated failure (rolls back).</p>
      <button
        onClick={handleLike}
        disabled={pending}
        style={{ background: liked ? '#ef444420' : '#334155', color: liked ? '#f87171' : '#94a3b8', border: '1px solid ' + (liked ? '#ef444440' : '#475569'), padding: '10px 20px', borderRadius: '8px', cursor: pending ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: pending ? 0.7 : 1, transition: 'all 0.15s' }}
      >
        {pending ? '...' : liked ? '♥' : '♡'} {count}
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
      id: 'cp-optimistic'
    },
    {
      type: 'challenge',
      id: 'ch-four-states',
      text: "Build a user fetcher component that implements all four states: idle (button to start), loading (spinner text), error (red message), success (show user name and email). Fetch from https://jsonplaceholder.typicode.com/users/1. Add a retry button on the error state.",
      hint: "Use a status state: 'idle' | 'loading' | 'error' | 'success'. In the fetch catch block, setStatus('error'). Show a 'Retry' button that calls fetchUser again when status === 'error'.",
      startCode: `const { useState } = React

function App() {
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function fetchUser() {
    // Implement: set loading, fetch, handle success and error
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', width: '100%', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>User Fetcher</h2>

        {/* idle: show fetch button */}
        {status === 'idle' && (
          <button onClick={fetchUser} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            Fetch User
          </button>
        )}

        {/* loading: show loading message */}

        {/* error: show error + retry button */}

        {/* success: show user name and email */}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /loading/.test(code) &&
          /error/.test(code) &&
          /success/.test(code) &&
          /fetch\(/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-optimistic-todo',
      text: "Build a todo list with optimistic add. When the user submits a new todo, immediately add it to the list (with a 'pending' visual state). Then simulate a 1-second async save (80% success, 20% failure). On failure, remove the todo from the list and show an error message.",
      hint: "On submit: add { id: Date.now(), text, pending: true } to todos immediately. After await: if success, update todo.pending to false. If error, filter the todo out and show error.",
      startCode: `const { useState } = React

function App() {
  const [todos, setTodos] = useState([{ id: 1, text: 'Existing todo', pending: false }])
  const [input, setInput] = useState('')
  const [saveError, setSaveError] = useState(null)

  async function addTodo() {
    if (!input.trim()) return
    const newTodo = { id: Date.now(), text: input, pending: true }
    // 1. Optimistically add to list
    setInput('')
    setSaveError(null)

    // 2. Simulate async save (80% success)
    try {
      await new Promise((resolve, reject) =>
        setTimeout(() => Math.random() > 0.2 ? resolve() : reject(new Error('Save failed')), 1000)
      )
      // 3. On success: mark as not pending
    } catch {
      // 4. On error: remove the todo, show error
    }
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', width: '100%', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Optimistic Todos</h2>
        {saveError && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>{saveError}</p>}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="New todo..." style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }} />
          <button onClick={addTodo} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Add</button>
        </div>
        {todos.map(todo => (
          <div key={todo.id} style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: todo.pending ? '#64748b' : '#f1f5f9', fontSize: '0.9rem', opacity: todo.pending ? 0.6 : 1, display: 'flex', justifyContent: 'space-between' }}>
            {todo.text}
            {todo.pending && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>saving...</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /pending/.test(code) &&
          /catch/.test(code) &&
          /filter/.test(code)
      }
    }
  ]
}
