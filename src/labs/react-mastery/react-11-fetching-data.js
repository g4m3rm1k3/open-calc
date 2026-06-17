export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-11-fetching-data',
  title: '11. Fetching Data',
  chapter: 'react-ch3',
  language: 'react',
  checkpoints: [
    { id: 'cp-fetch-pattern', label: 'Fetch Pattern' },
    { id: 'cp-three-states', label: 'Three States' },
    { id: 'cp-async-effect', label: 'Async in Effect' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'fetch-in-effect',
      text: "Fetching data from a server is the most common side effect in React apps. The pattern is always the same: call fetch inside useEffect, put the result into state, and render based on that state. The empty deps array `[]` means the fetch happens once — right after the component first appears on screen.",
      code: `const { useState, useEffect } = React

function App() {
  const [todo, setTodo] = useState(null)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(res => res.json())
      .then(data => setTodo(data))
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>First Fetch</h2>
      {todo ? (
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px' }}>TODO #{todo.id}</div>
          <div style={{ color: '#f1f5f9', marginBottom: '8px' }}>{todo.title}</div>
          <div style={{ color: todo.completed ? '#10b981' : '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
            {todo.completed ? 'Completed' : 'Pending'}
          </div>
        </div>
      ) : (
        <div style={{ color: '#475569' }}>Loading...</div>
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
      id: 'loading-state',
      text: "Every fetch has three possible states: loading (request in flight), success (data arrived), and error (something went wrong). Track all three with separate state variables. Never skip the loading state — users need to know something is happening, and your UI needs to handle the moment between mount and data arrival.",
      code: `const { useState, useEffect } = React

function App() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status)
        return res.json()
      })
      .then(json => { setData(json); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#94a3b8', maxWidth: '420px' }}>
      Fetching user data...
    </div>
  )
  if (error) return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f43f5e', maxWidth: '420px' }}>
      Error: {error}
    </div>
  )

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>{data.name}</h2>
      <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span>{data.email}</span>
        <span>{data.company.name}</span>
        <span>{data.address.city}</span>
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
      id: 'async-iife',
      text: "You can't mark the useEffect callback itself as async — React expects it to either return nothing or return a cleanup function, not a Promise. The fix: define an async function inside the effect and immediately call it. This is called an async IIFE (Immediately Invoked Function Expression). It's the standard pattern.",
      code: `const { useState, useEffect } = React

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Can't do: useEffect(async () => { ... }, [])
    // Instead: define + call async inside

    async function fetchPosts() {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=4')
      const data = await res.json()
      setPosts(data)
      setLoading(false)
    }

    fetchPosts()
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '480px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Posts (async IIFE pattern)</h2>
      {loading ? (
        <div style={{ color: '#475569' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {posts.map(p => (
            <div key={p.id} style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.95rem' }}>{p.title}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Post #{p.id}</div>
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
      id: 'cp-fetch-pattern'
    },
    {
      type: 'narration',
      id: 'three-state-pattern',
      text: "The loading / error / data pattern is so common it's worth cementing as a mental model. Render three completely different UIs depending on which state you're in. A skeleton — a placeholder with the right shape — is better than a spinner because it prevents layout shift when data arrives.",
      code: `const { useState, useEffect } = React

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ height: '14px', background: '#1e3a5f', borderRadius: '4px', width: '70%', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '10px', background: '#1e3a5f', borderRadius: '4px', width: '40%' }} />
        </div>
      ))}
    </div>
  )
}

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users?_limit=3')
        if (!res.ok) throw new Error('Network error')
        setUsers(await res.json())
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px' }}>Users</h2>
      {loading && <Skeleton />}
      {error && <div style={{ color: '#f43f5e', padding: '12px', background: '#2d0a0a', borderRadius: '8px' }}>{error}</div>}
      {!loading && !error && users.map(u => (
        <div key={u.id} style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', marginBottom: '10px' }}>
          <div style={{ fontWeight: 600 }}>{u.name}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{u.email}</div>
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
      type: 'checkpoint',
      id: 'cp-three-states'
    },
    {
      type: 'narration',
      id: 'fetch-on-click',
      text: "Not all fetches happen on mount. Sometimes you want to fetch when the user clicks a button — a search, a 'load more', or a profile lookup. Put the fetch logic in a regular async function and call it from an onClick handler. useEffect is not required when the trigger is a user action rather than a lifecycle event.",
      code: `const { useState } = React

function App() {
  const [userId, setUserId] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function lookup() {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/users/' + userId)
      if (!res.ok) throw new Error('User not found')
      setUser(await res.json())
    } catch (e) {
      setUser(null)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Fetch on Click</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="number" min="1" max="10" placeholder="User ID (1-10)"
          value={userId} onChange={e => setUserId(e.target.value)}
          style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem' }}
        />
        <button onClick={lookup} disabled={loading} style={{ padding: '10px 20px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          {loading ? '...' : 'Go'}
        </button>
      </div>
      {error && <div style={{ color: '#f43f5e', marginBottom: '12px' }}>{error}</div>}
      {user && (
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px' }}>{user.name}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{user.email}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{user.company.name}</div>
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
      id: 'fetch-on-state-change',
      text: "When you want to re-fetch whenever a state variable changes, put that variable in the useEffect deps array. React will run the effect (and re-fetch) every time the value changes. This is the pattern for search-as-you-type, pagination, or any data that depends on user-controlled filters.",
      code: `const { useState, useEffect } = React

function App() {
  const [userId, setUserId] = useState(1)
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Re-fetch whenever userId changes
  useEffect(() => {
    setLoading(true)
    setUser(null)
    fetch('https://jsonplaceholder.typicode.com/users/' + userId)
      .then(r => r.json())
      .then(d => { setUser(d); setLoading(false) })
  }, [userId])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Re-fetch on State Change</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[1,2,3,4,5].map(id => (
          <button key={id} onClick={() => setUserId(id)} style={{ padding: '8px 14px', background: userId === id ? '#38bdf8' : '#0f172a', color: userId === id ? '#0f172a' : '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontWeight: userId === id ? 700 : 400 }}>
            {id}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ color: '#475569' }}>Loading user {userId}...</div>
      ) : user ? (
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user.name}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>{user.email}</div>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>{user.address.city}</div>
        </div>
      ) : null}
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
      id: 'error-handling',
      text: "Always wrap fetch logic in try/catch. Errors come from two places: network failures (fetch rejects) and bad HTTP status codes (fetch resolves but res.ok is false). Check res.ok before calling res.json() — a 404 won't throw on its own. Using finally ensures loading is always set to false whether the request succeeds or fails.",
      code: `const { useState, useEffect } = React

function App() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  // Try changing 999 to a real ID like 2
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users/999')
        if (!res.ok) throw new Error('Status ' + res.status + ': user not found')
        setData(await res.json())
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Error Handling</h2>
      {loading && <div style={{ color: '#475569' }}>Fetching...</div>}
      {error && (
        <div style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', padding: '14px', borderRadius: '8px' }}>
          <div style={{ color: '#f87171', fontWeight: 600, marginBottom: '4px' }}>Fetch failed</div>
          <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{error}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px' }}>Change 999 to a valid ID (1-10) to see success.</div>
        </div>
      )}
      {data && <div style={{ color: '#10b981' }}>Loaded: {data.name}</div>}
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
      id: 'cp-async-effect'
    },
    {
      type: 'narration',
      id: 'fetch-list',
      text: "Rendering a list of fetched items follows the same three-state pattern. Map over the data array to produce JSX. Always provide a key prop — use the item's id if available. Conditional rendering using && lets you keep each branch readable without nested ternaries.",
      code: `const { useState, useEffect } = React

function App() {
  const [todos, setTodos]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos?_limit=6')
      .then(r => r.json())
      .then(d => { setTodos(d); setLoading(false) })
  }, [])

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '480px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px' }}>Todo List from API</h2>
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '40px', background: '#0f172a', borderRadius: '6px' }} />)}
        </div>
      )}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {todos.map(todo => (
            <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0f172a', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: todo.completed ? '#10b981' : '#334155', flexShrink: 0 }} />
              <span style={{ color: todo.completed ? '#94a3b8' : '#f1f5f9', fontSize: '0.9rem', textDecoration: todo.completed ? 'line-through' : 'none' }}>
                {todo.title}
              </span>
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
      type: 'challenge',
      id: 'ch-post-list',
      text: "Fetch from https://jsonplaceholder.typicode.com/posts?_limit=5 and render a list of post titles. Show a 'Loading...' message while the request is in flight. Each post title should be in its own styled div with the post id visible.",
      hint: "useEffect with [] deps, async IIFE inside, setLoading(false) in finally. Map over posts to render each one.",
      startCode: `const { useState, useEffect } = React

function App() {
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch https://jsonplaceholder.typicode.com/posts?_limit=5
  // Store in posts state, set loading to false when done

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '480px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Posts</h2>
      {/* Show loading message, then list of posts */}
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
          /fetch/.test(code) &&
          /posts\?_limit=5/.test(code) &&
          /\.map\(/.test(code) &&
          /loading/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-user-by-id',
      text: "Build a user lookup: an input for user ID (1-10) and a 'Load' button. When the button is clicked, fetch https://jsonplaceholder.typicode.com/users/{id} and display the user's name and email. Show a loading state while fetching.",
      hint: "Store the typed ID in state. onClick handler: set loading, fetch using the current ID, then update user state. No useEffect needed here — the fetch is triggered by a click, not a lifecycle.",
      startCode: `const { useState } = React

function App() {
  const [id, setId]       = useState(1)
  const [user, setUser]   = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadUser() {
    // Fetch https://jsonplaceholder.typicode.com/users/ + id
    // setUser with the result
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>User Lookup</h2>
      {/* Input for ID, Load button, display user name + email */}
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
        return /fetch/.test(code) &&
          /jsonplaceholder\.typicode\.com\/users/.test(code) &&
          /user/.test(code) &&
          /name|email/.test(code) &&
          /loading/.test(code)
      }
    }
  ]
}
