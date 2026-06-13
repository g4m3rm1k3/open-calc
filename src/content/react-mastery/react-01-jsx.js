export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-01-jsx',
  title: '01. JSX: HTML in JavaScript',
  chapter: 'react-ch1',
  language: 'react',
  checkpoints: [
    { id: 'cp-syntax', label: 'JSX Syntax' },
    { id: 'cp-expressions', label: 'Expressions' },
    { id: 'cp-rules', label: 'JSX Rules' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "You want to build a button that changes color when you click it. In plain JavaScript that means querySelector, addEventListener, createElement, appendChild — four different APIs just to show something on screen. React has a different answer: just describe what the UI should look like at any given moment, and let the framework handle the DOM. That description language is called JSX.",
      code: `const { useState } = React

function App() {
  const [clicked, setClicked] = useState(false)

  // This looks like HTML inside JavaScript — that's JSX
  return (
    <button
      onClick={() => setClicked(!clicked)}
      style={{
        background: clicked ? '#3b82f6' : '#1e293b',
        color: 'white',
        border: '1px solid #334155',
        padding: '12px 28px',
        borderRadius: '8px',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background 0.2s',
        fontFamily: 'sans-serif',
      }}
    >
      {clicked ? 'Clicked!' : 'Click me'}
    </button>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'what-is-jsx',
      text: "JSX is not HTML. It looks like HTML but it's syntactic sugar over JavaScript function calls. Babel — a compiler — transforms your JSX into React.createElement() calls before the browser ever sees it. You write the readable version; the computer gets the verbose version.",
      code: `// What you WRITE (JSX):
// const el = <h1 className="title">Hello</h1>

// What Babel COMPILES it to:
// const el = React.createElement('h1', { className: 'title' }, 'Hello')

// Both produce the same thing. JSX is just nicer to write.
// You almost never call React.createElement directly.

function App() {
  // createElement for comparison — same result as <p>Compare these</p>
  const manual = React.createElement(
    'p',
    { style: { color: '#94a3b8', fontFamily: 'monospace', margin: '8px 0' } },
    'Built with createElement'
  )

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9' }}>
      <p style={{ color: '#38bdf8', marginBottom: '16px', fontWeight: 700 }}>Built with JSX</p>
      {manual}
      <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '16px' }}>
        Same output. JSX wins every time.
      </p>
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
      id: 'curly-expressions',
      text: "Curly braces are the escape hatch from JSX back into JavaScript. Anything inside {} is evaluated as a JavaScript expression: variables, math, function calls, ternaries. You can't use if statements or for loops directly — only expressions. That's the single most important rule to internalize.",
      code: `function App() {
  const name = 'Maya'
  const score = 94
  const date = new Date().toLocaleDateString()

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '340px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>
        Welcome back, {name}!
      </h2>

      {/* Variable */}
      <p style={{ color: '#94a3b8', margin: '8px 0' }}>
        Today: {date}
      </p>

      {/* Expression */}
      <p style={{ color: '#94a3b8', margin: '8px 0' }}>
        Score: {score}/100 ({score >= 90 ? 'A' : 'B'})
      </p>

      {/* Method call */}
      <p style={{ color: '#94a3b8', margin: '8px 0' }}>
        Name chars: {name.toUpperCase()} ({name.length} letters)
      </p>

      {/* Math */}
      <p style={{ color: '#94a3b8', margin: '8px 0' }}>
        Bonus points: {score * 0.1} pts
      </p>
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
      id: 'cp-syntax'
    },
    {
      type: 'narration',
      id: 'classname',
      text: "`class` is a reserved keyword in JavaScript, so JSX uses `className`. Similarly, `for` on a label becomes `htmlFor`. Every HTML attribute name that clashes with a JS keyword gets a camelCase JSX alias. `onclick` becomes `onClick`, `tabindex` becomes `tabIndex`. CSS properties in inline styles are also camelCase.",
      code: `function App() {
  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '360px' }}>
      {/* className — NOT class */}
      <h2 style={{ color: '#38bdf8', marginTop: 0 }}>JSX Attribute Differences</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
          <code style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {'<div className="card">'}
          </code>
          <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
            ✓ className (not class)
          </span>
        </div>

        <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
          <code style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {'<label htmlFor="email">'}
          </code>
          <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
            ✓ htmlFor (not for)
          </span>
        </div>

        <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
          <code style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {'onClick, onChange, onKeyDown'}
          </code>
          <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
            ✓ camelCase events
          </span>
        </div>

        <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
          <code style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {'style={{ backgroundColor: "#000" }}'}
          </code>
          <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
            ✓ style takes an object, not a string
          </span>
        </div>
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
      id: 'single-root',
      text: "JSX must return a single root element. You can't return two siblings without wrapping them. The common fix: wrap in a `<div>`, or use a Fragment — the empty tag `<>...</>` — which groups elements without adding a real DOM node. Fragments are cleaner: no extra wrapper in the HTML output.",
      code: `function App() {
  // This would ERROR — two sibling elements:
  // return (
  //   <h1>Title</h1>
  //   <p>Paragraph</p>
  // )

  // Fix 1: wrap in <div>
  // Fix 2: use Fragment <> ... </>

  return (
    <>
      <h1 style={{ color: '#38bdf8', margin: '0 0 12px', fontFamily: 'sans-serif' }}>
        Fragment Demo
      </h1>
      <p style={{ color: '#94a3b8', margin: '0 0 8px', fontFamily: 'sans-serif' }}>
        Both of these render without a wrapper div.
      </p>
      <p style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
        Right-click → Inspect to confirm: no extra wrapper element.
      </p>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', flexDirection: 'column' }}>
    <App />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'self-closing',
      text: "In HTML, some tags are void: `<img>`, `<input>`, `<br>`. In JSX, every tag must be explicitly closed. Void tags get a self-closing slash: `<img />`, `<input />`, `<br />`. Forgetting the slash is the most common beginner parse error.",
      code: `function App() {
  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '380px' }}>
      <h2 style={{ color: '#e2e8f0', margin: '0 0 20px' }}>Self-Closing Tags</h2>

      {/* img must be self-closed */}
      <img
        src="https://via.placeholder.com/340x120/0f172a/38bdf8?text=Self-Closing+img"
        alt="placeholder"
        style={{ width: '100%', borderRadius: '6px', marginBottom: '16px' }}
      />

      {/* input must be self-closed */}
      <input
        type="text"
        placeholder="Self-closing input"
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
      />

      {/* br must be self-closed */}
      <br />

      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '12px 0 0' }}>
        All void elements need a closing slash in JSX.
      </p>
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
      id: 'cp-expressions'
    },
    {
      type: 'narration',
      id: 'jsx-comments',
      text: "Comments inside JSX use the curly-brace expression syntax: `{/* comment */}`. Regular `// comment` works only inside JS blocks — not in JSX markup. The reason: JSX markup isn't JavaScript, so `//` would be treated as invalid characters.",
      code: `function App() {
  const user = { name: 'Alex', role: 'Admin' }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '360px' }}>
      {/* This is a JSX comment — it doesn't render */}
      <h2 style={{ color: '#e2e8f0', margin: '0 0 16px' }}>
        {user.name}
        {/* Could also show: {user.name.toUpperCase()} */}
      </h2>

      {/* Conditionally show admin badge */}
      {user.role === 'Admin' && (
        <span style={{
          background: '#3b82f620',
          color: '#3b82f6',
          border: '1px solid #3b82f640',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          Admin
        </span>
      )}

      <p style={{ color: '#94a3b8', marginTop: '16px', fontSize: '0.9rem' }}>
        Role: {user.role}
      </p>
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
      id: 'inline-style-objects',
      text: "Inline styles in JSX are JavaScript objects, not CSS strings. `style={{ color: 'red' }}` — the outer braces are JSX expression syntax, the inner braces are the object literal. Property names are camelCase. Values are strings or numbers. Numbers default to pixels for length properties.",
      code: `function App() {
  const accent = '#3b82f6'
  const pad = 20 // pixels

  return (
    <div style={{
      background: '#1e293b',
      padding: pad,         // number → '20px' automatically
      borderRadius: 10,     // number → '10px'
      fontFamily: 'sans-serif',
      maxWidth: 380,
      color: '#f1f5f9',
    }}>
      <h2 style={{ color: accent, margin: '0 0 16px', fontSize: '1.3rem' }}>
        Style Object Demo
      </h2>

      {/* Style computed from variables */}
      {['bg-hover', 'bg-primary', 'bg-success'].map((name, i) => {
        const colors = ['#334155', accent, '#10b981']
        return (
          <div key={name} style={{
            background: colors[i],
            padding: '10px 16px',
            borderRadius: 6,
            marginBottom: 8,
            fontSize: '0.9rem',
          }}>
            {name}: {colors[i]}
          </div>
        )
      })}
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
      id: 'cp-rules'
    },
    {
      type: 'narration',
      id: 'putting-it-together',
      text: "All the rules together: JSX compiles to createElement, curly braces embed expressions, className not class, fragments for multiple roots, self-close void tags, comments in {}. A real component uses all of these in a few dozen lines. This profile card demonstrates the full JSX toolkit.",
      code: `const { useState } = React

function ProfileCard({ name, role, score, online }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '300px',
      fontFamily: 'sans-serif',
      color: '#f1f5f9',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.1rem',
        }}>
          {name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          {/* className would work here if we had a stylesheet */}
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{role}</div>
        </div>
        {online && (
          <div style={{
            marginLeft: 'auto', width: 10, height: 10,
            borderRadius: '50%', background: '#10b981',
          }} />
        )}
      </div>

      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px' }}>
        Score: {score}/100
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: '#0f172a', border: '1px solid #334155', color: '#94a3b8',
          padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
        }}
      >
        {expanded ? 'Less ▲' : 'More ▼'}
      </button>

      {expanded && (
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '12px' }}>
          {name} has been a {role} for 2 years with a top score of {score}.
        </p>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <ProfileCard name="Maya Chen" role="Senior Engineer" score={94} online={true} />
  </div>
)`
    },
    {
      type: 'challenge',
      id: 'ch-jsx-basics',
      text: "Build a `Badge` component that receives `label` and `color` props (as inline style values). Render a span with `backgroundColor: color`, white text, and the `label` text inside it. Then render two Badge instances inside `App` with different labels and colors.",
      hint: "function Badge({ label, color }) { return <span style={{ backgroundColor: color, color: 'white', padding: '4px 12px', borderRadius: '999px' }}>{label}</span> }",
      startCode: `// Build a Badge component that takes label and color props
// Then render two different badges inside App

function Badge({ label, color }) {
  // Return a span styled with backgroundColor: color
  // Show the label text inside
}

function App() {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '24px', background: '#1e293b', borderRadius: '10px', fontFamily: 'sans-serif' }}>
      {/* Render two Badge components with different label and color props */}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <App />
  </div>
)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /function Badge/.test(code) &&
          /backgroundColor/.test(code) &&
          /label/.test(code) &&
          /<Badge/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-expressions',
      text: "Create an `App` component that stores `const items = ['React', 'JSX', 'Components']`. Render them as a list using `items.map()` inside JSX — each item in its own `<li>` with a `key` prop. Wrap the `<li>` elements in a `<ul>`.",
      hint: "Use {items.map(item => <li key={item}>{item}</li>)} inside a <ul>. The key prop must be on the outermost element returned from map.",
      startCode: `function App() {
  const items = ['React', 'JSX', 'Components']

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '300px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 16px' }}>Topics</h2>
      {/* Render items as an unordered list */}
      {/* Each <li> needs a key prop */}
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
          /<li/.test(code) &&
          /key=/.test(code) &&
          /<ul/.test(code)
      }
    }
  ]
}
