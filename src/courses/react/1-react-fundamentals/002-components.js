export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-02-components',
  title: '02. Components: Building Blocks',
  chapter: 'react-ch1',
  language: 'react',
  checkpoints: [
    { id: 'cp-function-component', label: 'Function Components' },
    { id: 'cp-composition', label: 'Composition' },
    { id: 'cp-reuse', label: 'Reuse' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'what-is-component',
      text: "A React component is just a JavaScript function that returns JSX. The one rule that makes it a component: the name must start with a capital letter. Lowercase names are treated as plain HTML tags. Uppercase names are treated as components. That single convention is how React tells them apart.",
      code: `// lowercase → HTML tag (built-in)
// const el = <div /> → React knows this is a DOM element

// Uppercase → component (your code)
// const el = <Greeting /> → React calls the Greeting function

function Greeting() {
  return (
    <div style={{
      background: '#1e293b',
      padding: '28px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      color: '#f1f5f9',
      maxWidth: '360px',
    }}>
      <p style={{ color: '#94a3b8', margin: '0 0 8px', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        React Component
      </p>
      <h2 style={{ margin: '0 0 12px', color: '#e2e8f0', fontSize: '1.4rem' }}>
        Hello from Greeting!
      </h2>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
        This function returns JSX — that makes it a component.
      </p>
    </div>
  )
}

function App() {
  return <Greeting />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'plain-fn-vs-component',
      text: "A plain JavaScript function and a React component look almost identical — but their jobs are different. A plain function runs once and returns a value. A React component can re-run whenever the UI needs to update, returning fresh JSX each time. React manages that lifecycle for you.",
      code: `// Plain JS function — called like a function, returns a value
function formatScore(score) {
  return score >= 90 ? 'A' : score >= 80 ? 'B' : 'C'
}

// React component — called by React as <ScoreCard />, returns JSX
function ScoreCard() {
  const score = 92

  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      color: '#f1f5f9',
      maxWidth: '320px',
    }}>
      <h3 style={{ margin: '0 0 8px', color: '#38bdf8' }}>Score Card</h3>
      <p style={{ margin: 0, color: '#94a3b8' }}>
        Raw score: <strong style={{ color: '#f1f5f9' }}>{score}</strong>
      </p>
      <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>
        Grade:{' '}
        <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>
          {formatScore(score)}
        </strong>
      </p>
    </div>
  )
}

function App() {
  return <ScoreCard />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'composing-components',
      text: "Components compose: you can use one component inside another just like you use a `<div>` inside another `<div>`. This is the core React pattern. Build small, focused components, then assemble them into larger ones. The `App` component is usually just a composition of other components.",
      code: `function Avatar() {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem', fontWeight: 700, color: 'white', flexShrink: 0,
    }}>
      M
    </div>
  )
}

function UserName() {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9' }}>Maya Chen</div>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Senior Engineer</div>
    </div>
  )
}

function ProfileCard() {
  // Avatar and UserName are composed inside ProfileCard
  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      maxWidth: '320px',
      border: '1px solid #334155',
    }}>
      <Avatar />
      <UserName />
    </div>
  )
}

function App() {
  // ProfileCard is composed inside App
  return <ProfileCard />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-function-component'
    },
    {
      type: 'narration',
      id: 'deep-composition',
      text: "You can go as deep as you need. A component tree might have App > Layout > Sidebar > NavItem. Each piece is a small, named function. This makes it easy to find, read, and change individual parts of the UI without touching everything else. Small components are easier to reason about than one giant render.",
      code: `function StatBadge({ label, value, color }) {
  return (
    <div style={{
      background: '#0f172a',
      borderRadius: '8px',
      padding: '12px 16px',
      textAlign: 'center',
      borderTop: \`3px solid \${color}\`,
      minWidth: '80px',
    }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

function StatsRow() {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
      <StatBadge label="Commits" value="342" color="#38bdf8" />
      <StatBadge label="PRs" value="87" color="#a78bfa" />
      <StatBadge label="Reviews" value="210" color="#34d399" />
    </div>
  )
}

function ProfileCard() {
  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '14px',
      fontFamily: 'sans-serif',
      maxWidth: '360px',
      border: '1px solid #334155',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '1.2rem',
        }}>
          A
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#f1f5f9' }}>Alex Rivera</div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Open-source contributor</div>
        </div>
      </div>
      <StatsRow />
    </div>
  )
}

function App() {
  return <ProfileCard />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-composition'
    },
    {
      type: 'narration',
      id: 'reuse',
      text: "The real power of components is reuse. Define a component once, use it many times with different data. A `<Tag>` component, a `<Card>` component, a `<Button>` component — write the shape once, render it as many times as you need. This is far cleaner than duplicating HTML blocks.",
      code: `function Tag({ text, color }) {
  return (
    <span style={{
      background: color + '22',
      color,
      border: \`1px solid \${color}44\`,
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '0.78rem',
      fontWeight: 600,
    }}>
      {text}
    </span>
  )
}

function ProjectCard({ title, description, tags }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '340px',
      fontFamily: 'sans-serif',
    }}>
      <h3 style={{ margin: '0 0 8px', color: '#f1f5f9', fontSize: '1rem' }}>{title}</h3>
      <p style={{ margin: '0 0 14px', color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>{description}</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tags.map(t => <Tag key={t.text} text={t.text} color={t.color} />)}
      </div>
    </div>
  )
}

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ProjectCard
        title="React Dashboard"
        description="Real-time analytics board with live charts and alerts."
        tags={[{ text: 'React', color: '#38bdf8' }, { text: 'TypeScript', color: '#a78bfa' }]}
      />
      <ProjectCard
        title="CLI Tool"
        description="Developer CLI for scaffolding new projects in seconds."
        tags={[{ text: 'Node.js', color: '#34d399' }, { text: 'Open Source', color: '#fb923c' }]}
      />
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
      id: 'component-scope',
      text: "Each component is an independent scope. Variables you define inside a component function are local to that function — they reset every render. Components don't share variables unless you explicitly pass data between them (that's props, coming next lesson). This isolation makes components predictable.",
      code: `function Counter() {
  // Each Counter has its own 'count' — they don't share it
  // (We'll use useState properly in lesson 05; this shows the concept)
  const label = 'Independent'

  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '10px',
      padding: '18px 22px',
      fontFamily: 'sans-serif',
      color: '#f1f5f9',
      textAlign: 'center',
    }}>
      <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>{label}</div>
      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Each instance is its own scope</div>
    </div>
  )
}

function App() {
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Counter />
      <Counter />
      <Counter />
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
      id: 'define-once-render-many',
      text: "A component is defined outside of App — never inside another component's function body. Defining a component inside another function recreates the component type on every render, destroying and remounting it every time. Always define components at the top level of the module.",
      code: `// ✓ Correct: defined at module top level
function Pill({ text }) {
  return (
    <span style={{
      background: '#0f172a',
      border: '1px solid #334155',
      color: '#94a3b8',
      padding: '6px 14px',
      borderRadius: '999px',
      fontSize: '0.85rem',
      fontFamily: 'sans-serif',
    }}>
      {text}
    </span>
  )
}

function App() {
  // ✗ BAD (not shown but avoid): const Pill = () => ... defined HERE
  // Every render would create a new Pill type → React remounts it

  const skills = ['React', 'JSX', 'Components', 'Composition']

  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      maxWidth: '400px',
    }}>
      <h3 style={{ color: '#f1f5f9', margin: '0 0 16px' }}>Skills</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {skills.map(s => <Pill key={s} text={s} />)}
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
      id: 'components-summary',
      text: "Here is the full picture so far. Every UI piece is a function that returns JSX. Name it with a capital letter. Compose components like building blocks. Reuse them as many times as you need. Define them at the top level of the file. That's everything you need to know about components before props enter the picture.",
      code: `function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ margin: '0 0 4px', color: '#f1f5f9', fontSize: '1.2rem' }}>{title}</h2>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{subtitle}</p>
    </div>
  )
}

function RuleItem({ icon, rule }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
      <span style={{ fontSize: '1rem', lineHeight: 1.4 }}>{icon}</span>
      <span style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>{rule}</span>
    </div>
  )
}

function RulesCard() {
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '14px',
      padding: '24px',
      maxWidth: '380px',
      fontFamily: 'sans-serif',
    }}>
      <SectionHeader title="Component Rules" subtitle="Everything you need to remember" />
      <RuleItem icon="A" rule="Name starts with a capital letter" />
      <RuleItem icon="R" rule="Returns JSX (one root element)" />
      <RuleItem icon="D" rule="Defined at top level — never inside another component" />
      <RuleItem icon="C" rule="Compose: use components inside components" />
      <RuleItem icon="U" rule="Reuse: render the same component multiple times" />
    </div>
  )
}

function App() {
  return <RulesCard />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <App />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-reuse'
    },
    {
      type: 'challenge',
      id: 'ch-card-component',
      text: "Build a `Card` component that renders a `title` (h3) and `description` (p) as hardcoded text inside the component — no props yet. Then render three separate `<Card />` instances inside `App`, each showing different content.",
      hint: "Define Card with its own hardcoded title and description. In App, just write <Card /> three times. Each Card can have different text baked in.",
      startCode: `// Build a Card component with a title and description
// Then render 3 separate Card instances in App

function Card() {
  // Return a styled div with an h3 title and a p description
  // Hardcode the text for now — props come next lesson
}

function App() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '16px',
      padding: '24px', background: '#1e293b', borderRadius: '14px',
      fontFamily: 'sans-serif', maxWidth: '360px',
    }}>
      {/* Render three Card components here */}
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
        return /function Card/.test(code) &&
          /<h3/.test(code) &&
          /<p/.test(code) &&
          (code.match(/<Card/g) || []).length >= 3
      }
    },
    {
      type: 'challenge',
      id: 'ch-layout-components',
      text: "Build three layout components: `Header`, `Main`, and `Footer`. Each returns a styled `<div>` with its own background color and some text identifying itself. Compose all three inside `App` so they appear stacked vertically.",
      hint: "Give Header a darker top bar feel (#1e3a5f), Main a content area (#1e293b), and Footer a subtle bottom bar (#0f172a). In App, return a <div> containing <Header />, <Main />, <Footer />.",
      startCode: `// Build Header, Main, and Footer components
// Compose them in App so they stack vertically

function Header() {
  // A top bar with your app name
}

function Main() {
  // A content area — just some placeholder text
}

function Footer() {
  // A footer with a copyright line or similar
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '420px', width: '100%', overflow: 'hidden', borderRadius: '14px' }}>
      {/* Compose Header, Main, Footer here */}
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
        return /function Header/.test(code) &&
          /function Main/.test(code) &&
          /function Footer/.test(code) &&
          /<Header/.test(code) &&
          /<Main/.test(code) &&
          /<Footer/.test(code)
      }
    }
  ]
}
