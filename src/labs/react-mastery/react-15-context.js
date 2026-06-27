export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-15-context',
  title: '15. Context: Avoiding Prop Drilling',
  chapter: 'react-ch4',
  language: 'react',
  checkpoints: [
    { id: 'cp-create-context', label: 'createContext' },
    { id: 'cp-use-context', label: 'useContext' },
    { id: 'cp-provider', label: 'Provider' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'prop-drilling-problem',
      text: "Imagine passing a user's name through five layers of components just so a deeply nested avatar can display it. Every intermediate component has to accept and forward a prop it doesn't use. This is prop drilling — the data equivalent of passing a package through three people who don't need it. Context is React's built-in solution.",
      code: `const { useState } = React

// Without context: every level must pass the prop down
function Level3({ username }) {
  return (
    <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#38bdf8', fontSize: '0.85rem' }}>
      Finally got it: {username}
    </div>
  )
}
function Level2({ username }) {
  return (
    <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px dashed #334155' }}>
      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 8px' }}>Level2 (doesn't need username, just passes it)</p>
      <Level3 username={username} />
    </div>
  )
}
function Level1({ username }) {
  return (
    <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px dashed #334155' }}>
      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 8px' }}>Level1 (doesn't need username, just passes it)</p>
      <Level2 username={username} />
    </div>
  )
}

function App() {
  const username = 'Maya'
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '420px' }}>
      <h2 style={{ color: '#f87171', marginTop: 0, fontSize: '1rem' }}>Problem: Prop Drilling</h2>
      <Level1 username={username} />
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
      id: 'create-context',
      text: "createContext() creates a context object with a default value. You call it once at the module level, outside any component. The returned object has two things: a Provider component for supplying the value, and the context reference you pass to useContext. The default value is only used when a component reads context but has no Provider above it.",
      code: `const { createContext } = React

// Call createContext once, outside components
const UserContext = createContext('guest')

// The default 'guest' is only used without a Provider
function Avatar() {
  // Reading context without a Provider — gets the default
  const username = React.useContext(UserContext)
  return (
    <div style={{ background: '#0f172a', padding: '10px 16px', borderRadius: '6px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.9rem' }}>
      User (from context): {username}
    </div>
  )
}

function App() {
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '420px', color: '#f1f5f9' }}>
      <h2 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1rem' }}>createContext — No Provider</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>No Provider above Avatar, so it reads the default value.</p>
      <Avatar />
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
      id: 'cp-create-context'
    },
    {
      type: 'narration',
      id: 'use-context',
      text: "useContext(MyContext) reads the nearest Provider's value above the calling component in the tree. It's a direct subscription — when the Provider's value changes, every component calling useContext with that context re-renders automatically. No prop forwarding needed at any level in between.",
      code: `const { createContext, useContext, useState } = React

const UserContext = createContext(null)

// Deep inside the tree — reads context directly, no props needed
function UserBadge() {
  const user = useContext(UserContext)
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0f172a', padding: '8px 14px', borderRadius: '999px', border: '1px solid #334155' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>
        {user.name[0]}
      </div>
      <span style={{ color: '#f1f5f9', fontSize: '0.85rem' }}>{user.name}</span>
      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{user.role}</span>
    </div>
  )
}

function Toolbar() {
  return (
    <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px', border: '1px dashed #334155', marginBottom: '8px' }}>
      <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 8px' }}>Toolbar (doesn't need user prop)</p>
      <UserBadge />
    </div>
  )
}

function App() {
  const user = { name: 'Maya', role: 'Admin' }
  return (
    <UserContext.Provider value={user}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '420px' }}>
        <h2 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1rem' }}>useContext — Direct Access</h2>
        <Toolbar />
      </div>
    </UserContext.Provider>
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
      id: 'cp-use-context'
    },
    {
      type: 'narration',
      id: 'provider-pattern',
      text: "The standard pattern is to wrap your context in a custom Provider component. This hides the context internals, co-locates the state with the context, and exports a clean hook like useTheme() instead of exposing the raw context object. It's the pattern used by React Router, Redux, and every major library.",
      code: `const { createContext, useContext, useState } = React

const ThemeContext = createContext()

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true)
  const toggle = () => setDark(d => !d)
  const theme = {
    dark,
    bg: dark ? '#1e293b' : '#f1f5f9',
    card: dark ? '#0f172a' : '#ffffff',
    text: dark ? '#f1f5f9' : '#1e293b',
    muted: dark ? "rgb(var(--tw-custom-slate-400))" : "rgb(var(--tw-custom-slate-500))",
    accent: '#38bdf8',
    toggle,
  }
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

function useTheme() { return useContext(ThemeContext) }

function Card() {
  const t = useTheme()
  return (
    <div style={{ background: t.card, border: '1px solid #334155', padding: '16px', borderRadius: '8px', color: t.text, fontSize: '0.9rem' }}>
      <p style={{ margin: '0 0 10px', color: t.muted }}>I read theme from context.</p>
      <button onClick={t.toggle} style={{ background: t.accent, color: '#0f172a', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
        Switch to {t.dark ? 'Light' : 'Dark'}
      </button>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  )
}

function ThemeConsumer() {
  const t = useTheme()
  return (
    <div style={{ background: t.bg, padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '380px', transition: 'background 0.3s' }}>
      <h2 style={{ color: t.accent, marginTop: 0, fontSize: '1rem' }}>ThemeProvider Pattern</h2>
      <Card />
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
      id: 'cp-provider'
    },
    {
      type: 'narration',
      id: 'multiple-contexts',
      text: "You can have as many contexts as you need — just nest Providers. A common setup: ThemeContext wraps the whole app, UserContext wraps the authenticated section, and ModalContext wraps only the parts that need a modal system. Each is independent; consumers only subscribe to the context they use.",
      code: `const { createContext, useContext } = React

const ThemeContext = createContext({ accent: '#38bdf8', bg: '#1e293b' })
const UserContext = createContext({ name: 'Guest', role: 'viewer' })

function Profile() {
  const theme = useContext(ThemeContext)
  const user = useContext(UserContext)
  return (
    <div style={{ background: theme.bg, padding: '16px', borderRadius: '8px', border: '1px solid #334155', fontFamily: 'sans-serif' }}>
      <p style={{ color: theme.accent, fontWeight: 700, margin: '0 0 6px' }}>{user.name}</p>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Role: {user.role}</p>
    </div>
  )
}

function App() {
  return (
    <ThemeContext.Provider value={{ accent: '#a78bfa', bg: '#1e1b4b' }}>
      <UserContext.Provider value={{ name: 'Maya Chen', role: 'Admin' }}>
        <div style={{ background: '#0f172a', padding: '24px', borderRadius: '10px', maxWidth: '380px' }}>
          <p style={{ color: '#64748b', fontFamily: 'sans-serif', fontSize: '0.8rem', margin: '0 0 14px' }}>Two nested Providers — Profile reads both:</p>
          <Profile />
        </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
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
      id: 'when-not-to-use',
      text: "Context is not a state management system — it's a dependency injection mechanism. Every consumer re-renders when the context value changes, even if it only needs part of that value. Avoid putting fast-changing data (mouse position, scroll position, animation frames) in context. For that, keep state local or use a library like Zustand. Context shines for slow-changing global data: theme, locale, current user, auth tokens.",
      code: `const { createContext, useContext, useState, useRef } = React

// Anti-pattern demo: fast-changing value in context causes all consumers to re-render
const CountContext = createContext(0)

let renderCount = 0

function ExpensiveChild() {
  const count = useContext(CountContext)
  renderCount++
  return (
    <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#f87171' }}>
      Count: {count} — Child rendered {renderCount} times
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)
  return (
    <CountContext.Provider value={count}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '400px' }}>
        <h2 style={{ color: '#fbbf24', marginTop: 0, fontSize: '1rem' }}>Warning: Fast Context</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>Every click re-renders ALL context consumers.</p>
        <ExpensiveChild />
        <button onClick={() => setCount(c => c + 1)} style={{ marginTop: '14px', background: '#334155', color: '#f1f5f9', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Increment
        </button>
      </div>
    </CountContext.Provider>
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
      id: 'ch-theme-context',
      text: "Build a theme context: createContext for theme colors, wrap App in a ThemeProvider that holds dark/light state, and consume the theme in a nested Button and Card component. A toggle button should flip the theme for all consumers at once.",
      hint: "Create ThemeContext = createContext(). In ThemeProvider, useState for isDark and build a theme object with bg/text/accent colors. Export useTheme = () => useContext(ThemeContext). Both Button and Card call useTheme() for their styles.",
      startCode: `const { createContext, useContext, useState } = React

// 1. Create the context
const ThemeContext = createContext()

// 2. Build ThemeProvider — holds isDark state, provides theme object
function ThemeProvider({ children }) {
  // TODO: useState for isDark
  // Build theme = { bg, text, accent, toggle }
  // Return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

// 3. Custom hook
function useTheme() { return useContext(ThemeContext) }

// 4. Consumers — read theme via useTheme()
function Card() {
  // TODO: use theme colors for background and text
  return <div>Card</div>
}

function ToggleButton() {
  // TODO: call theme.toggle on click
  return <button>Toggle Theme</button>
}

function App() {
  return (
    <ThemeProvider>
      <div style={{ padding: '28px', fontFamily: 'sans-serif', maxWidth: '380px' }}>
        <ToggleButton />
        <Card />
      </div>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /createContext/.test(code) &&
          /useContext/.test(code) &&
          /Provider/.test(code) &&
          /useState/.test(code) &&
          /toggle/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-user-context',
      text: "Build a UserContext that provides { name, role }. Render a component tree 3 levels deep (App → Section → Panel → UserBadge). UserBadge reads name and role from context directly — no props passed through the middle layers.",
      hint: "const UserContext = createContext(). In App: <UserContext.Provider value={{ name: 'Alex', role: 'Editor' }}>. In UserBadge: const { name, role } = useContext(UserContext). Section and Panel just render their children without knowing about the user.",
      startCode: `const { createContext, useContext } = React

// 1. Create UserContext
const UserContext = createContext()

// 2. Deep consumer — reads from context, not props
function UserBadge() {
  // TODO: useContext(UserContext) to get name and role
  return <div>UserBadge</div>
}

// Middle layers — no user prop needed
function Panel() {
  return (
    <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px dashed #334155' }}>
      <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 8px' }}>Panel (no user prop)</p>
      <UserBadge />
    </div>
  )
}

function Section() {
  return (
    <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px dashed #334155' }}>
      <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 8px' }}>Section (no user prop)</p>
      <Panel />
    </div>
  )
}

// 3. Provider lives at the top
function App() {
  // TODO: wrap Section in UserContext.Provider with value={{ name: '...', role: '...' }}
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '380px' }}>
      <h2 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1rem' }}>UserContext — 3 Levels Deep</h2>
      <Section />
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
        return /createContext/.test(code) &&
          /useContext\(UserContext\)/.test(code) &&
          /Provider/.test(code) &&
          /name/.test(code) &&
          /role/.test(code)
      }
    }
  ]
}
