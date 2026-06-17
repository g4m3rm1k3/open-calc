export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-03-props',
  title: '03. Props: Passing Data Down',
  chapter: 'react-ch1',
  language: 'react',
  checkpoints: [
    { id: 'cp-basic-props', label: 'Basic Props' },
    { id: 'cp-children', label: 'Children Prop' },
    { id: 'cp-callback-props', label: 'Callback Props' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'props-intro',
      text: "The last lesson's components had text hardcoded inside them — every `<Card />` would show the exact same thing. Props fix that. Props are the arguments you pass to a component. You write them like HTML attributes: `<Card title=\"React\" />`. Inside the component, props arrive as the first argument to the function.",
      code: `// Without props — every Greeting is identical
// function Greeting() { return <h2>Hello, stranger</h2> }

// With props — each Greeting can be different
function Greeting({ name, role }) {
  return (
    <div style={{
      background: '#1e293b',
      padding: '18px 22px',
      borderRadius: '10px',
      fontFamily: 'sans-serif',
      color: '#f1f5f9',
      borderLeft: '3px solid #38bdf8',
    }}>
      <strong style={{ color: '#38bdf8' }}>{name}</strong>
      <span style={{ color: '#94a3b8' }}> — {role}</span>
    </div>
  )
}

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
      <Greeting name="Maya" role="Engineer" />
      <Greeting name="Alex" role="Designer" />
      <Greeting name="Jordan" role="PM" />
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
      id: 'destructuring-props',
      text: "Props arrive as a single object. You can receive them as `props` and access `props.name`, or destructure them directly in the parameter list: `function Card({ title, description })`. Destructuring is the preferred style — it makes the component's interface obvious at a glance.",
      code: `// Style 1: props object (verbose but explicit)
function CardA(props) {
  return (
    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', marginBottom: '12px' }}>
      <strong style={{ color: '#38bdf8' }}>CardA:</strong>{' '}
      <span style={{ color: '#94a3b8' }}>{props.title}</span>
    </div>
  )
}

// Style 2: destructured (preferred)
function CardB({ title, description }) {
  return (
    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9' }}>
      <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>CardB: {title}</div>
      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{description}</div>
    </div>
  )
}

function App() {
  return (
    <div style={{ maxWidth: '360px' }}>
      <CardA title="Using props.title" />
      <CardB title="Destructured" description="Clean, readable, preferred" />
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
      id: 'default-props',
      text: "Props can have default values using standard JavaScript default parameter syntax: `function Button({ label = 'Click me', size = 'md' })`. If the parent doesn't pass a value, the default kicks in. This makes components resilient — they degrade gracefully without required boilerplate.",
      code: `function StatusBadge({ label = 'Unknown', color = '#64748b' }) {
  return (
    <span style={{
      background: color + '22',
      color,
      border: \`1px solid \${color}55\`,
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '0.8rem',
      fontWeight: 600,
      fontFamily: 'sans-serif',
    }}>
      {label}
    </span>
  )
}

function App() {
  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      maxWidth: '340px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <h3 style={{ margin: '0 0 4px', color: '#f1f5f9' }}>Default Props Demo</h3>

      {/* All props provided */}
      <StatusBadge label="Active" color="#10b981" />

      {/* Only label — color uses default */}
      <StatusBadge label="Pending" />

      {/* No props — both defaults apply */}
      <StatusBadge />
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
      id: 'cp-basic-props'
    },
    {
      type: 'narration',
      id: 'children-prop',
      text: "There is one special prop called `children`. It contains whatever you put between the opening and closing tags: `<Card>Hello</Card>` — inside Card, `props.children` is `\"Hello\"`. It can be text, other JSX, even other components. The `children` prop is how you build wrapper or layout components.",
      code: `function Panel({ title, children }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '360px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: '#0f172a',
        borderBottom: '1px solid #334155',
        padding: '12px 20px',
        color: '#94a3b8',
        fontSize: '0.85rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {title}
      </div>
      <div style={{ padding: '20px', color: '#f1f5f9' }}>
        {children}
      </div>
    </div>
  )
}

function App() {
  return (
    <Panel title="Project Overview">
      <h3 style={{ margin: '0 0 10px', color: '#38bdf8' }}>React Dashboard</h3>
      <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
        A real-time analytics board with live data and interactive charts.
      </p>
      <span style={{
        background: '#10b98122', color: '#10b981',
        border: '1px solid #10b98155', padding: '3px 10px',
        borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
      }}>
        In Progress
      </span>
    </Panel>
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
      id: 'children-flexible',
      text: "Because `children` is just a prop, you can pass anything: a string, a number, a block of JSX, or even another component. This flexibility is what lets you build truly general-purpose wrapper components like modals, tooltips, cards, and layout shells.",
      code: `function Callout({ type, children }) {
  const styles = {
    info:    { border: '#38bdf8', bg: '#38bdf822', icon: 'i' },
    success: { border: '#10b981', bg: '#10b98122', icon: 'ok' },
    warning: { border: '#f59e0b', bg: '#f59e0b22', icon: '!' },
  }
  const s = styles[type] || styles.info

  return (
    <div style={{
      background: s.bg,
      border: \`1px solid \${s.border}55\`,
      borderLeft: \`4px solid \${s.border}\`,
      borderRadius: '8px',
      padding: '14px 16px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      fontFamily: 'sans-serif',
      maxWidth: '380px',
      marginBottom: '12px',
    }}>
      <span style={{ color: s.border, fontWeight: 700, fontSize: '0.9rem', marginTop: '1px', minWidth: 20, textAlign: 'center' }}>
        [{s.icon}]
      </span>
      <div style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  )
}

function App() {
  return (
    <div>
      <Callout type="info">Your build is running. This may take a few seconds.</Callout>
      <Callout type="success">Deployment successful! All 3 tests passed.</Callout>
      <Callout type="warning">API rate limit approaching — 80% used.</Callout>
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
      id: 'cp-children'
    },
    {
      type: 'narration',
      id: 'callback-props',
      text: "Props aren't limited to strings and numbers. You can pass functions too. A parent defines a function, passes it as a prop, and the child calls it at the right moment. This is how child components communicate back up to their parent — the child fires an event, the parent decides what to do.",
      code: `const { useState } = React

function LikeButton({ onLike }) {
  return (
    <button
      onClick={onLike}
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        color: '#f1f5f9',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>Like</span>
    </button>
  )
}

function App() {
  const [count, setCount] = useState(0)

  // Parent defines the function
  function handleLike() {
    setCount(c => c + 1)
  }

  return (
    <div style={{
      background: '#1e293b',
      padding: '28px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      maxWidth: '320px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
        {count}
      </div>
      <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>
        {count === 1 ? 'like' : 'likes'}
      </div>
      {/* Parent passes the function as a prop */}
      <LikeButton onLike={handleLike} />
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
      id: 'callback-with-args',
      text: "Callback props can also receive arguments. The child calls `onSelect(item.id)` and the parent receives that value in its handler. This is the React data flow: props go down (parent to child), events go up (child to parent via callback). Data flows one way.",
      code: `const { useState } = React

function TabButton({ label, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(label)}
      style={{
        background: active ? '#38bdf8' : 'transparent',
        color: active ? '#0f172a' : '#94a3b8',
        border: 'none',
        padding: '8px 18px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: active ? 700 : 400,
        fontSize: '0.9rem',
        fontFamily: 'sans-serif',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function App() {
  const [active, setActive] = useState('Overview')
  const tabs = ['Overview', 'Commits', 'Issues']

  const content = {
    Overview: 'Project summary and key metrics.',
    Commits: '342 commits across 18 contributors.',
    Issues: '7 open issues, 3 in review.',
  }

  return (
    <div style={{
      background: '#1e293b',
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
      maxWidth: '380px',
    }}>
      <div style={{ background: '#0f172a', padding: '8px 12px', display: 'flex', gap: '4px' }}>
        {tabs.map(t => (
          <TabButton key={t} label={t} active={active === t} onSelect={setActive} />
        ))}
      </div>
      <div style={{ padding: '20px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
        {content[active]}
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
      id: 'props-are-readonly',
      text: "Props are read-only. A component must never modify the props it receives. If you need to derive a new value, compute it in the function body. If you need to change what the parent passed, call a callback prop and let the parent update. This constraint keeps data flow predictable.",
      code: `function TemperatureCard({ celsius }) {
  // Derive values from props — do NOT mutate celsius
  const fahrenheit = (celsius * 9 / 5 + 32).toFixed(1)
  const feel = celsius < 10 ? 'Cold' : celsius < 25 ? 'Mild' : 'Hot'
  const color = celsius < 10 ? '#38bdf8' : celsius < 25 ? '#10b981' : '#f97316'

  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      maxWidth: '280px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.8rem', fontWeight: 700, color, lineHeight: 1 }}>
        {celsius}°C
      </div>
      <div style={{ color: '#64748b', margin: '6px 0 16px', fontSize: '0.9rem' }}>
        {fahrenheit}°F
      </div>
      <span style={{
        background: color + '22', color,
        border: \`1px solid \${color}55\`,
        padding: '4px 14px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600,
      }}>
        {feel}
      </span>
    </div>
  )
}

function App() {
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <TemperatureCard celsius={5} />
      <TemperatureCard celsius={22} />
      <TemperatureCard celsius={35} />
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
      id: 'cp-callback-props'
    },
    {
      type: 'challenge',
      id: 'ch-alert-component',
      text: "Build an `Alert` component that accepts `message` (string) and `type` ('success' | 'error') props. Style it differently based on `type`: green tones for success, red tones for error. Render one of each inside `App`.",
      hint: "Use an object to map type to colors: `const colors = { success: '#10b981', error: '#ef4444' }`. Then use `colors[type]` in the style.",
      startCode: `// Build an Alert component styled by type prop
// 'success' → green theme, 'error' → red theme

function Alert({ message, type }) {
  // Map type to colors
  // Return a styled div with the message
}

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px' }}>
      <Alert type="success" message="Your changes have been saved." />
      <Alert type="error" message="Something went wrong. Please try again." />
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
        return /function Alert/.test(code) &&
          /message/.test(code) &&
          /type/.test(code) &&
          /<Alert/.test(code) &&
          /success/.test(code) &&
          /error/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-button-component',
      text: "Build a `Button` component with `label` (string), `onClick` (function), and optional `disabled` (boolean, default false) props. When disabled, grey out the button and disable clicking. Render three buttons in App: a normal one, one with a click counter that logs clicks, and a disabled one.",
      hint: "Use `disabled` as both an HTML attribute and to conditionally set styles. For the click counter, `useState` in App. Pass `onClick={() => setCount(c => c + 1)}` as a prop.",
      startCode: `const { useState } = React

// Build a Button with label, onClick, and optional disabled props
function Button({ label, onClick, disabled = false }) {
  // Style differently when disabled
  // Use the disabled attribute on <button>
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start',
      padding: '24px', background: '#1e293b', borderRadius: '12px',
      fontFamily: 'sans-serif', maxWidth: '320px',
    }}>
      <p style={{ margin: '0 0 4px', color: '#94a3b8', fontSize: '0.9rem' }}>Clicked: {count}</p>
      {/* Render 3 Button instances: normal, click-counter, disabled */}
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
        return /function Button/.test(code) &&
          /label/.test(code) &&
          /onClick/.test(code) &&
          /disabled/.test(code) &&
          (code.match(/<Button/g) || []).length >= 3
      }
    }
  ]
}
