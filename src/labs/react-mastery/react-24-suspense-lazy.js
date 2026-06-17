export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-24-suspense-lazy',
  title: '24. Suspense & Lazy Loading',
  chapter: 'react-ch6',
  language: 'react',
  checkpoints: [
    { id: 'cp-lazy-concept', label: 'Code Splitting' },
    { id: 'cp-suspense', label: 'Suspense Fallback' },
    { id: 'cp-error-boundary', label: 'Error Boundary' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "Large React apps ship a single JavaScript bundle. Every component is downloaded upfront, even those the user may never visit. Code splitting breaks the bundle into smaller chunks that load on demand. React.lazy and Suspense are the built-in tools for this — no webpack config changes needed.",
      code: `const { useState } = React

// In a real app with a bundler, you'd do:
// const HeavyChart = React.lazy(() => import('./HeavyChart'))
//
// In this sandbox, we simulate the concept with a fake "heavy module"
// that takes 1.5 seconds to "load"

function createFakeLazy(Component, delay = 1500) {
  let resolvedComponent = null
  const fakeImport = () => new Promise(resolve => {
    setTimeout(() => {
      resolvedComponent = Component
      resolve({ default: Component })
    }, delay)
  })

  // Simulate the React.lazy promise state machine
  let status = 'pending'
  let promise = fakeImport().then(() => { status = 'resolved' })

  return function LazyWrapper(props) {
    if (status === 'pending') throw promise  // Suspense catches this!
    return React.createElement(resolvedComponent, props)
  }
}

function HeavyDashboard() {
  return (
    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px' }}>
      <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '12px', fontFamily: 'sans-serif' }}>Dashboard Loaded!</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {['Revenue', 'Users', 'Orders', 'MRR'].map(m => (
          <div key={m} style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{m}</div>
            <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '1.2rem' }}>{Math.floor(Math.random() * 1000)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const LazyDashboard = createFakeLazy(HeavyDashboard)

function App() {
  const [show, setShow] = useState(false)
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Lazy Load Demo</h2>
      <button onClick={() => setShow(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}>
        Load Dashboard
      </button>
      {show && (
        <React.Suspense fallback={<div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading dashboard chunk...</div>}>
          <LazyDashboard />
        </React.Suspense>
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
      id: 'suspense-fallback',
      text: "Suspense wraps lazy components and shows a fallback while the chunk loads. The fallback can be anything: a spinner, a skeleton screen, a loading message. Suspense is hierarchical — you can nest multiple Suspense boundaries for granular loading states on different parts of the page.",
      code: `const { useState } = React

// Skeleton loader fallback — much better UX than a spinner
function Skeleton({ height = 16, width = '100%', style = {} }) {
  return (
    <div style={{ height, width, background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)', backgroundSize: '200% 100%', borderRadius: '4px', animation: 'shimmer 1.5s infinite', ...style }} />
  )
}

function CardSkeleton() {
  return (
    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton height={12} width="60%" />
      <Skeleton height={10} width="100%" />
      <Skeleton height={10} width="80%" />
      <Skeleton height={32} width="40%" style={{ borderRadius: '6px' }} />
    </div>
  )
}

function LoadingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <Skeleton height={24} width="40%" />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}

function ActualContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1.1rem', fontFamily: 'sans-serif' }}>Content Loaded</h2>
      {['Article One', 'Article Two'].map(title => (
        <div key={title} style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
          <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '8px' }}>{title}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>Content that was worth the wait. Skeleton loaders set accurate expectations.</div>
        </div>
      ))}
    </div>
  )
}

function App() {
  const [loaded, setLoaded] = useState(false)
  return (
    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '10px', maxWidth: '380px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'sans-serif' }}>
      <style>{"@keyframes shimmer { to { background-position: -200% 0 } }"}</style>
      <button onClick={() => { setLoaded(false); setTimeout(() => setLoaded(true), 2000) }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}>
        Simulate Load
      </button>
      {loaded ? <ActualContent /> : <LoadingPage />}
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
      id: 'cp-lazy-concept'
    },
    {
      type: 'narration',
      id: 'error-boundary',
      text: "Error boundaries catch JavaScript errors in child components and display a fallback UI instead of crashing the whole app. They must be class components — there is no hook equivalent yet. Wrap Suspense in an error boundary to catch failed lazy loads (network error, chunk not found).",
      code: `class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#ef444420', border: '1px solid #ef444440', padding: '16px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
          <div style={{ color: '#f87171', fontWeight: 600, marginBottom: '8px' }}>Something went wrong</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px' }}>{this.state.error?.message}</div>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ background: '#ef444440', color: '#f87171', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function BrokenComponent() {
  throw new Error('This component always crashes!')
}

function SafeComponent() {
  return <div style={{ background: '#10b98120', border: '1px solid #10b98140', padding: '16px', borderRadius: '8px', color: '#10b981', fontFamily: 'sans-serif' }}>This component is safe.</div>
}

const { useState } = React

function App() {
  const [showBroken, setShowBroken] = useState(false)

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Error Boundary</h2>
      <button onClick={() => setShowBroken(b => !b)} style={{ background: showBroken ? '#334155' : '#ef444420', color: showBroken ? '#94a3b8' : '#ef4444', border: '1px solid ' + (showBroken ? '#334155' : '#ef444440'), padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-start' }}>
        {showBroken ? 'Show safe' : 'Throw error'}
      </button>
      <ErrorBoundary>
        {showBroken ? <BrokenComponent /> : <SafeComponent />}
      </ErrorBoundary>
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
      id: 'nested-suspense',
      text: "Nested Suspense boundaries let different parts of the page load independently. The header loads fast, the sidebar loads medium, the main content loads slow. Each gets its own skeleton. The user sees progressive content rather than waiting for everything.",
      code: `const { useState, useEffect } = React

// Simulate components that take different amounts of time to load
function useSimulatedLoad(delay) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(id)
  }, [delay])
  return ready
}

function FastHeader() {
  const ready = useSimulatedLoad(200)
  if (!ready) return <div style={{ height: '40px', background: '#334155', borderRadius: '6px', animation: 'pulse 1s infinite' }} />
  return <div style={{ background: '#3b82f620', padding: '10px 16px', borderRadius: '8px', color: '#38bdf8', fontWeight: 700, fontFamily: 'sans-serif' }}>Header (200ms)</div>
}

function MediumSidebar() {
  const ready = useSimulatedLoad(800)
  if (!ready) return <div style={{ height: '120px', background: '#334155', borderRadius: '6px', animation: 'pulse 1s infinite' }} />
  return (
    <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '8px' }}>Sidebar (800ms)</div>
      {['Link A', 'Link B', 'Link C'].map(l => <div key={l} style={{ color: '#64748b', padding: '4px 0', fontSize: '0.85rem' }}>{l}</div>)}
    </div>
  )
}

function SlowContent() {
  const ready = useSimulatedLoad(1500)
  if (!ready) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[1,2,3].map(i => <div key={i} style={{ height: '60px', background: '#334155', borderRadius: '6px', animation: 'pulse 1s infinite' }} />)}
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Main content (1500ms)</div>
      {['Article A', 'Article B', 'Article C'].map(a => (
        <div key={a} style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', color: '#e2e8f0', fontSize: '0.85rem' }}>{a}</div>
      ))}
    </div>
  )
}

function App() {
  const [loaded, setLoaded] = useState(false)
  return (
    <div style={{ background: '#0f172a', padding: '24px', maxWidth: '380px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <style>{"@keyframes pulse { 0%,100% { opacity: 0.5 } 50% { opacity: 1 } }"}</style>
      <button onClick={() => setLoaded(l => !l)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}>
        {loaded ? 'Reset' : 'Start Loading'}
      </button>
      {loaded && (
        <>
          <FastHeader />
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
            <MediumSidebar />
            <SlowContent />
          </div>
        </>
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
      id: 'cp-suspense'
    },
    {
      type: 'narration',
      id: 'use-hook-future',
      text: "React 18+ is expanding Suspense beyond code splitting to data fetching. The `use()` hook can unwrap promises and suspend automatically. A component that `use(fetchUser())` will suspend until the data arrives. This is the direction React is heading — Suspense as a universal async boundary, not just a code-splitting tool.",
      code: `const { useState } = React

// React 18 use() preview — wraps any promise
// Note: this is a simplified simulation of the 'use' hook pattern
// Real use() is available in React 18.3+ and Next.js App Router

function wrapPromise(promise) {
  let status = 'pending'
  let result
  const s = promise.then(
    val => { status = 'success'; result = val },
    err => { status = 'error'; result = err }
  )
  return {
    read() {
      if (status === 'pending') throw s       // Suspense catches this
      if (status === 'error') throw result    // ErrorBoundary catches this
      return result
    }
  }
}

function fetchUserResource(id) {
  return wrapPromise(
    fetch('https://jsonplaceholder.typicode.com/users/' + id).then(r => r.json())
  )
}

// Component suspends while reading — no useState/useEffect needed!
function UserProfile({ resource }) {
  const user = resource.read()  // suspends if not ready
  return (
    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{user.name}</div>
      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user.email}</div>
    </div>
  )
}

function App() {
  const [resource, setResource] = useState(null)
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Suspense for Data (preview)</h2>
      <button onClick={() => setResource(fetchUserResource(1))} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}>
        Fetch User
      </button>
      {resource && (
        <React.Suspense fallback={<div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Suspending for data...</div>}>
          <UserProfile resource={resource} />
        </React.Suspense>
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
      id: 'cp-error-boundary'
    },
    {
      type: 'challenge',
      id: 'ch-error-boundary',
      text: "Build an `ErrorBoundary` class component with `getDerivedStateFromError`. Wrap a `BuggyCounter` component that throws when the count reaches 5. Show a recovery UI in the boundary with a 'Reset' button that resets the error state (so the counter can try again).",
      hint: "class ErrorBoundary extends React.Component { state = { error: null }; static getDerivedStateFromError(e) { return { error: e }; } render() { if (this.state.error) return <div>Error! <button onClick={() => this.setState({ error: null })}>Reset</button></div>; return this.props.children; } }",
      startCode: `const { useState } = React

// Build your ErrorBoundary class component here
class ErrorBoundary extends React.Component {
  // Add getDerivedStateFromError and render
}

function BuggyCounter() {
  const [count, setCount] = useState(0)
  if (count >= 5) throw new Error('Counter exploded at ' + count + '!')
  return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 700, textAlign: 'center' }}>{count}</div>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
      >
        Increment (crashes at 5)
      </button>
    </div>
  )
}

function App() {
  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '300px', width: '100%' }}>
        {/* Wrap BuggyCounter in your ErrorBoundary */}
        <BuggyCounter />
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /class ErrorBoundary/.test(code) &&
          /getDerivedStateFromError/.test(code) &&
          /<ErrorBoundary/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-skeleton-loader',
      text: "Build a `UserCard` component that simulates a 1.5-second load using useEffect and useState (not real Suspense — just state-based simulation). While loading, show a skeleton placeholder (grey boxes matching the card's layout). When loaded, show a real user name and email.",
      hint: "const [ready, setReady] = useState(false); useEffect(() => { const id = setTimeout(() => setReady(true), 1500); return () => clearTimeout(id); }, []); if (!ready) return <SkeletonCard />; return <RealCard />.",
      startCode: `const { useState, useEffect } = React

function SkeletonCard() {
  return (
    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '280px' }}>
      {/* Grey placeholder boxes */}
      <div style={{ height: '16px', width: '60%', background: '#334155', borderRadius: '4px' }} />
      <div style={{ height: '12px', width: '80%', background: '#334155', borderRadius: '4px' }} />
      <div style={{ height: '12px', width: '40%', background: '#334155', borderRadius: '4px' }} />
    </div>
  )
}

function UserCard({ name, email }) {
  // Show SkeletonCard for 1.5 seconds, then show the real content
  const ready = false // replace with state + useEffect

  if (!ready) return <SkeletonCard />

  return (
    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', maxWidth: '280px', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{name}</div>
      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{email}</div>
    </div>
  )
}

function App() {
  const [key, setKey] = useState(0)
  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', flexDirection: 'column', gap: '16px' }}>
      <UserCard key={key} name="Maya Chen" email="maya@example.com" />
      <button onClick={() => setKey(k => k + 1)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'sans-serif' }}>
        Reload
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useState/.test(code) && /useEffect/.test(code) && /setTimeout/.test(code) && /SkeletonCard/.test(code)
      }
    }
  ]
}
