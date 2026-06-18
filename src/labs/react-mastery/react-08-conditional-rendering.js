export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-08-conditional-rendering',
  title: '08. Conditional Rendering',
  chapter: 'react-ch2',
  language: 'react',
  checkpoints: [
    { id: 'cp-and-operator', label: '&& Short-Circuit' },
    { id: 'cp-ternary', label: 'Ternary Operator' },
    { id: 'cp-multi-state', label: 'Multi-State Rendering' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro-conditional',
      text: "A UI rarely looks the same in every state. A button might be hidden until a form is valid. A loading spinner replaces content while data fetches. An error banner only appears when something goes wrong. React handles all of this through conditional rendering — controlling what JSX is returned based on state or props.",
      code: `const { useState } = React

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div style={{ background: '#1e293b', padding: '32px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '360px', textAlign: 'center' }}>
      {isLoggedIn ? (
        <div>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👋</div>
          <h2 style={{ margin: '0 0 8px', color: '#e2e8f0' }}>Welcome back!</h2>
          <p style={{ color: '#94a3b8', margin: '0 0 20px', fontSize: '0.9rem' }}>You are signed in.</p>
          <button
            onClick={() => setIsLoggedIn(false)}
            style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#94a3b8', margin: '0 0 20px', fontSize: '0.9rem' }}>Please sign in to continue.</p>
          <button
            onClick={() => setIsLoggedIn(true)}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer' }}
          >
            Sign in
          </button>
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
      id: 'and-operator',
      text: "The `&&` short-circuit operator is the simplest conditional: render something only when a condition is true. If the left side is falsy, JavaScript stops and returns the falsy value — React renders nothing for `false`, `null`, and `undefined`. One gotcha: `0 && <X />` renders the number `0` on screen, not nothing. Guard against it with `count > 0 && <X />`.",
      code: `const { useState } = React

function App() {
  const [showTip, setShowTip] = useState(false)
  const [unread, setUnread] = useState(3)

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>The && Operator</h2>

      {/* Show tip only when showTip is true */}
      <button
        onClick={() => setShowTip(s => !s)}
        style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', marginBottom: '12px', display: 'block' }}
      >
        {showTip ? 'Hide tip' : 'Show tip'}
      </button>

      {showTip && (
        <div style={{ background: '#1e3a5f', border: '1px solid #3b82f620', padding: '12px', borderRadius: '6px', color: '#93c5fd', fontSize: '0.9rem', marginBottom: '20px' }}>
          Tip: && renders nothing when the left side is false.
        </div>
      )}

      {/* Safe: unread > 0 prevents rendering "0" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#94a3b8' }}>Inbox</span>
        {unread > 0 && (
          <span style={{ background: '#ef4444', color: 'white', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px' }}>
            {unread}
          </span>
        )}
        <button onClick={() => setUnread(0)} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #334155', color: '#475569', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Mark read
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
      id: 'cp-and-operator'
    },
    {
      type: 'narration',
      id: 'ternary',
      text: "The ternary operator `condition ? <A /> : <B />` renders one of two things. Unlike `&&`, it always has an explicit else branch — perfect when you need to show completely different UI based on a boolean. Keep ternaries readable: if either branch grows beyond a line or two, extract it into a variable or a separate component.",
      code: `const { useState } = React

function App() {
  const [theme, setTheme] = useState('dark')
  const isDark = theme === 'dark'

  return (
    <div style={{
      background: isDark ? '#1e293b' : '#f1f5f9',
      padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif',
      color: isDark ? '#f1f5f9' : '#1e293b', maxWidth: '380px',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Theme Toggle</h2>
        {/* Ternary on the button label and colors */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          style={{
            background: isDark ? '#334155' : '#e2e8f0',
            color: isDark ? '#94a3b8' : '#475569',
            border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
          }}
        >
          {isDark ? '☀ Light' : '☾ Dark'}
        </button>
      </div>

      {/* Ternary between two different content blocks */}
      {isDark ? (
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
          Dark mode is easier on the eyes in low-light environments.
        </p>
      ) : (
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
          Light mode gives you higher contrast in bright conditions.
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
      id: 'early-return',
      text: "An early return from a component is the cleanest way to handle a blocking state like 'loading' or 'not authenticated'. If the condition isn't met, return early with a fallback. The rest of the component's JSX is never reached. This avoids deeply nested ternaries and keeps the happy path readable.",
      code: `const { useState, useEffect } = React

function UserCard({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate a 1.5 second fetch
    const timer = setTimeout(() => {
      setUser({ name: 'Maya Chen', role: 'Senior Engineer', joined: '2022' })
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [userId])

  // Early return #1 — loading state
  if (loading) {
    return (
      <div style={{ color: '#94a3b8', fontFamily: 'sans-serif', padding: '28px', textAlign: 'center' }}>
        Loading user...
      </div>
    )
  }

  // Early return #2 — not found
  if (!user) {
    return <div style={{ color: '#ef4444', fontFamily: 'sans-serif' }}>User not found.</div>
  }

  // Happy path — only reached when user is loaded
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '300px' }}>
      <h2 style={{ margin: '0 0 8px', color: '#e2e8f0' }}>{user.name}</h2>
      <p style={{ color: '#94a3b8', margin: '0 0 4px', fontSize: '0.9rem' }}>{user.role}</p>
      <p style={{ color: '#475569', margin: 0, fontSize: '0.8rem' }}>Joined {user.joined}</p>
    </div>
  )
}

function App() {
  return <UserCard userId={1} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-ternary'
    },
    {
      type: 'narration',
      id: 'conditional-variable',
      text: "When your conditional JSX is long, extract it into a variable before the return statement. Assign JSX to a `let` variable, then use the variable in your return. This keeps the return statement clean — you can read what renders without parsing the logic inline. It's the same as using a ternary, just easier to read.",
      code: `const { useState } = React

function App() {
  const [status, setStatus] = useState('idle')

  // Extracted conditional — not inline in JSX
  let banner = null
  if (status === 'saving') {
    banner = (
      <div style={{ background: '#1e3a5f', color: '#93c5fd', padding: '10px 16px', borderRadius: '6px', fontSize: '0.9rem' }}>
        Saving changes...
      </div>
    )
  } else if (status === 'saved') {
    banner = (
      <div style={{ background: '#14532d', color: '#86efac', padding: '10px 16px', borderRadius: '6px', fontSize: '0.9rem' }}>
        ✓ All changes saved
      </div>
    )
  } else if (status === 'error') {
    banner = (
      <div style={{ background: '#450a0a', color: '#fca5a5', padding: '10px 16px', borderRadius: '6px', fontSize: '0.9rem' }}>
        ✗ Failed to save. Try again.
      </div>
    )
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Status Banner</h2>
      {banner}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        {['idle', 'saving', 'saved', 'error'].map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{ background: status === s ? '#3b82f6' : '#334155', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
            {s}
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
      type: 'narration',
      id: 'switch-rendering',
      text: "When there are more than two or three cases, a `switch` statement inside a helper function or before the return is cleaner than chained ternaries. Define a function that takes the status and returns JSX, then call it in your render. The switch makes the cases easy to scan and add to.",
      code: `const { useState } = React

function StatusView({ status }) {
  switch (status) {
    case 'loading':
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
          <p style={{ margin: 0 }}>Loading data...</p>
        </div>
      )
    case 'error':
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#fca5a5', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✗</div>
          <p style={{ margin: 0 }}>Something went wrong.</p>
        </div>
      )
    case 'empty':
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#475569', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
          <p style={{ margin: 0 }}>No items found.</p>
        </div>
      )
    case 'success':
      return (
        <ul style={{ padding: '0 0 0 20px', margin: 0, color: '#86efac', fontFamily: 'sans-serif' }}>
          {['Item A', 'Item B', 'Item C'].map(i => <li key={i} style={{ marginBottom: '6px' }}>{i}</li>)}
        </ul>
      )
    default:
      return null
  }
}

function App() {
  const [status, setStatus] = useState('loading')
  const statuses = ['loading', 'error', 'empty', 'success']

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '360px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Switch-Based Render</h2>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{ background: status === s ? '#3b82f6' : '#334155', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
            {s}
          </button>
        ))}
      </div>
      <StatusView status={status} />
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
      id: 'null-hides',
      text: "Returning `null` from a component (or using `null` in a JSX expression) renders absolutely nothing — no DOM node, no whitespace. This is the correct way to completely hide a component. `false`, `null`, and `undefined` all render nothing; the number `0` and empty string `''` render as text nodes (with `0` being visibly rendered as '0').",
      code: `const { useState } = React

function Alert({ message, type }) {
  // Returning null hides the component entirely
  if (!message) return null

  const styles = {
    success: { bg: '#14532d', color: '#86efac', icon: '✓' },
    error:   { bg: '#450a0a', color: '#fca5a5', icon: '✗' },
    info:    { bg: '#1e3a5f', color: '#93c5fd', icon: 'i' },
  }
  const s = styles[type] || styles.info

  return (
    <div style={{ background: s.bg, color: s.color, padding: '12px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>
      <span style={{ fontWeight: 700 }}>{s.icon}</span>
      {message}
    </div>
  )
}

function App() {
  const [msg, setMsg] = useState('')
  const [type, setType] = useState('info')

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>null Hides Output</h2>
      <Alert message={msg} type={type} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => { setMsg('Operation succeeded.'); setType('success') }} style={{ background: '#14532d', color: '#86efac', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Show success</button>
        <button onClick={() => { setMsg('Something went wrong.'); setType('error') }} style={{ background: '#450a0a', color: '#fca5a5', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Show error</button>
        <button onClick={() => setMsg('')} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Hide (null)</button>
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
      id: 'cp-multi-state'
    },
    {
      type: 'narration',
      id: 'combining-conditions',
      text: "Real components combine multiple conditions. A submit button might be disabled when a form is invalid OR when a request is in flight. A panel might be visible only when a user is logged in AND has the right role. Combine booleans with `&&` and `||` in your conditions, and extract complex logic to named variables to keep the JSX readable.",
      code: `const { useState } = React

function App() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit = isValid && !loading && !sent

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1500)
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Combined Conditions</h2>
      {!sent ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            type="email"
            style={{ background: '#0f172a', border: isValid ? '1px solid #10b981' : '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem' }}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            style={{ background: canSubmit ? '#3b82f6' : '#334155', color: canSubmit ? 'white' : '#475569', border: 'none', padding: '11px', borderRadius: '6px', fontSize: '1rem', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'Sending...' : 'Subscribe'}
          </button>
        </form>
      ) : (
        <p style={{ color: '#10b981', margin: 0 }}>✓ You are subscribed!</p>
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
      id: 'ch-notification',
      text: "Build a Notification component. It receives `message` (string) and `type` ('success' | 'error') props. If `message` is empty or falsy, the component should render nothing (return null). Otherwise render a styled box: green for success, red for error. Then create a parent App that has buttons to show each type and a button to dismiss (clear the message).",
      hint: "In Notification: if (!message) return null. Use a ternary or object lookup for colors based on type. In App, store message and type in state. Each button calls setMessage/setType, the dismiss button sets message to ''.",
      startCode: `const { useState } = React

function Notification({ message, type }) {
  // 1. Return null if no message

  // 2. Render success (green) or error (red) based on type
}

function App() {
  // 3. State for message and type

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Notifications</h2>
      {/* 4. Render Notification with current message and type */}
      {/* 5. Buttons: Show Success, Show Error, Dismiss */}
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
        return /return null/.test(code) &&
          /useState/.test(code) &&
          /success/.test(code) &&
          /error/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-multi-state-display',
      text: "Build a multi-state data display. Store a `status` variable in state with possible values: 'loading', 'error', 'success', 'empty'. Add a button that cycles through those states on each click. Render different UI for each state: a loading indicator for 'loading', an error message for 'error', a list of items for 'success', and an empty state message for 'empty'.",
      hint: "Store the statuses in an array: const STATES = ['loading', 'error', 'success', 'empty']. On button click: setStatus(s => STATES[(STATES.indexOf(s) + 1) % STATES.length]). Use if/else or switch to render different JSX for each status.",
      startCode: `const { useState } = React

const STATUSES = ['loading', 'error', 'success', 'empty']

function App() {
  const [status, setStatus] = useState('loading')

  function cycleStatus() {
    setStatus(s => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length])
  }

  // Render different UI based on status
  function renderContent() {
    // loading: show a loading message
    // error: show an error message
    // success: show a list of items
    // empty: show an empty state message
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#e2e8f0' }}>Status: {status}</h2>
        <button onClick={cycleStatus} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
          Next →
        </button>
      </div>
      {renderContent()}
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
        return /loading/.test(code) &&
          /error/.test(code) &&
          /success/.test(code) &&
          /empty/.test(code) &&
          /useState/.test(code)
      }
    }
  ]
}
