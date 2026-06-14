export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-07-controlled-inputs',
  title: '07. Controlled Inputs',
  chapter: 'react-ch2',
  language: 'react',
  checkpoints: [
    { id: 'cp-controlled-text', label: 'Controlled Text Input' },
    { id: 'cp-controlled-select', label: 'Controlled Select' },
    { id: 'cp-full-form', label: 'Full Controlled Form' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro-controlled',
      text: "An input is 'uncontrolled' when the DOM owns its value — you can type freely but React doesn't know what's in it. A 'controlled' input has its value driven by React state: you pass a `value` prop, and an `onChange` handler that updates that state on every keystroke. React is now the single source of truth for the field's content.",
      code: `const { useState } = React

function App() {
  // Controlled: React owns this value
  const [controlled, setControlled] = useState('')

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Controlled vs Uncontrolled</h2>

      <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
        Uncontrolled (no value prop — DOM owns it)
      </label>
      <input
        placeholder="Type freely..."
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '20px' }}
      />

      <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
        Controlled (value + onChange — React owns it)
      </label>
      <input
        value={controlled}
        onChange={e => setControlled(e.target.value)}
        placeholder="Type here..."
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '12px' }}
      />
      <p style={{ color: '#38bdf8', margin: 0, fontSize: '0.9rem' }}>
        React sees: "{controlled}"
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
      id: 'controlled-text',
      text: "The controlled text input pattern is simple: `value={state}` and `onChange={e => setState(e.target.value)}`. Because state updates trigger a re-render, React always displays the current state value. This lets you do things that are impossible with uncontrolled inputs — live validation, character limits, formatting as you type.",
      code: `const { useState } = React

function App() {
  const [username, setUsername] = useState('')

  const isValid = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)
  const isEmpty = username.length === 0

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Live Validation</h2>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Choose a username..."
        style={{
          width: '100%', background: '#0f172a', padding: '10px 14px', borderRadius: '6px',
          fontSize: '1rem', boxSizing: 'border-box', marginBottom: '10px',
          border: isEmpty ? '1px solid #334155' : isValid ? '1px solid #10b981' : '1px solid #ef4444',
          color: '#f1f5f9',
        }}
      />
      {!isEmpty && (
        <p style={{ color: isValid ? '#10b981' : '#ef4444', margin: '0', fontSize: '0.85rem' }}>
          {isValid ? '✓ Valid username' : 'Min 3 chars, letters/numbers/underscore only'}
        </p>
      )}
      <p style={{ color: '#475569', margin: '16px 0 0', fontSize: '0.8rem' }}>
        Characters: {username.length}
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
      id: 'cp-controlled-text'
    },
    {
      type: 'narration',
      id: 'controlled-textarea',
      text: "A `<textarea>` is controlled the same way as an `<input>`: give it a `value` and an `onChange`. In HTML a textarea's content goes between its tags; in React it's always the `value` prop. You can now read, validate, or limit the textarea's content at any time because it's just state.",
      code: `const { useState } = React

function App() {
  const [bio, setBio] = useState('')
  const MAX = 160

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 16px', color: '#e2e8f0' }}>Controlled Textarea</h2>
      <textarea
        value={bio}
        onChange={e => setBio(e.target.value.slice(0, MAX))}
        placeholder="Write your bio..."
        rows={4}
        style={{
          width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
          padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', resize: 'vertical',
          boxSizing: 'border-box', fontFamily: 'sans-serif',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <span style={{ color: '#475569', fontSize: '0.8rem' }}>
          {bio.length === MAX ? 'Limit reached' : 'Keep it short'}
        </span>
        <span style={{ color: bio.length >= MAX * 0.9 ? '#f59e0b' : '#475569', fontSize: '0.8rem' }}>
          {MAX - bio.length} left
        </span>
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
      id: 'controlled-select',
      text: "A `<select>` dropdown is controlled with `value` and `onChange` on the `<select>` element itself — not on the individual `<option>` tags. The value should match one of the `<option>` values. When the user picks a different option, `e.target.value` gives you the selected option's value string.",
      code: `const { useState } = React

const PLANS = [
  { value: 'free', label: 'Free — $0/mo', desc: 'Up to 3 projects' },
  { value: 'pro', label: 'Pro — $12/mo', desc: 'Unlimited projects' },
  { value: 'team', label: 'Team — $49/mo', desc: 'Up to 20 seats' },
]

function App() {
  const [plan, setPlan] = useState('free')

  const selected = PLANS.find(p => p.value === plan)

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Controlled Select</h2>
      <select
        value={plan}
        onChange={e => setPlan(e.target.value)}
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', marginBottom: '16px' }}
      >
        {PLANS.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{selected.desc}</p>
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
      id: 'cp-controlled-select'
    },
    {
      type: 'narration',
      id: 'controlled-checkbox',
      text: "Checkboxes use `checked` instead of `value`, and the `onChange` reads `e.target.checked` (a boolean) instead of `e.target.value`. This distinction matters: always use `checked` for checkboxes, `value` for text inputs and selects. Mixing them up gives you a perpetually stuck or always-flipping checkbox.",
      code: `const { useState } = React

function App() {
  const [agreed, setAgreed] = useState(false)
  const [newsletter, setNewsletter] = useState(true)

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Controlled Checkboxes</h2>
      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '14px' }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
        />
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>I agree to the terms of service</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
        <input
          type="checkbox"
          checked={newsletter}
          onChange={e => setNewsletter(e.target.checked)}
          style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
        />
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Subscribe to newsletter</span>
      </label>
      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' }}>
        agreed: <span style={{ color: agreed ? '#10b981' : '#ef4444' }}>{String(agreed)}</span>
        {' · '}
        newsletter: <span style={{ color: newsletter ? '#10b981' : '#ef4444' }}>{String(newsletter)}</span>
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
      id: 'multi-field-form',
      text: "Real forms have multiple fields. One approach: store each field in its own state variable. A cleaner approach: store the entire form as one object — `const [form, setForm] = useState({ email: '', password: '' })`. Then each `onChange` uses the spread operator to update just the changed field: `setForm(prev => ({ ...prev, [field]: value }))`. The computed property key `[field]` uses the field name as the key.",
      code: `const { useState } = React

function App() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  const inputStyle = {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px',
    fontSize: '1rem', boxSizing: 'border-box',
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '380px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Login Form</h2>
      {!submitted ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input value={form.email} onChange={handleChange('email')} type="email" placeholder="Email address" style={inputStyle} />
          <input value={form.password} onChange={handleChange('password')} type="password" placeholder="Password" style={inputStyle} />
          <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '11px', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>
            Sign In
          </button>
        </form>
      ) : (
        <div>
          <p style={{ color: '#10b981', marginBottom: '12px' }}>Submitted!</p>
          <pre style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            {JSON.stringify(form, null, 2)}
          </pre>
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
      id: 'cp-full-form'
    },
    {
      type: 'narration',
      id: 'controlled-number',
      text: "Number inputs work like text inputs but return a string from `e.target.value`. If you need a real number in state, convert it with `Number()` or `parseFloat()`. A controlled number input gives you things like clamping a value to a range, or snapping to steps — something impossible with uncontrolled inputs.",
      code: `const { useState } = React

function App() {
  const [qty, setQty] = useState(1)

  function handleChange(e) {
    const n = Number(e.target.value)
    // Clamp between 1 and 99
    setQty(Math.max(1, Math.min(99, n || 1)))
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '320px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Quantity Picker</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setQty(q => Math.max(1, q - 1))}
          style={{ width: '36px', height: '36px', background: '#334155', border: 'none', color: '#f1f5f9', borderRadius: '6px', fontSize: '1.2rem', cursor: 'pointer' }}
        >−</button>
        <input
          type="number"
          value={qty}
          onChange={handleChange}
          min={1}
          max={99}
          style={{ width: '70px', textAlign: 'center', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px', borderRadius: '6px', fontSize: '1.1rem' }}
        />
        <button
          onClick={() => setQty(q => Math.min(99, q + 1))}
          style={{ width: '36px', height: '36px', background: '#334155', border: 'none', color: '#f1f5f9', borderRadius: '6px', fontSize: '1.2rem', cursor: 'pointer' }}
        >+</button>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
        Total: <strong style={{ color: '#38bdf8' }}>\${(qty * 29.99).toFixed(2)}</strong>
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
      type: 'challenge',
      id: 'ch-char-counter',
      text: "Build a character-counting textarea. The textarea must be controlled (value + onChange). Set a maximum of 100 characters — slice the input to enforce it. Show how many characters remain. Change the remaining count color to '#ef4444' (red) when 10 or fewer characters are left.",
      hint: "Use useState for the textarea value. In onChange: setBio(e.target.value.slice(0, 100)). Compute remaining = 100 - bio.length. Style the counter red when remaining <= 10.",
      startCode: `const { useState } = React

const MAX = 100

function App() {
  // 1. State for the textarea value

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 16px', color: '#e2e8f0' }}>Write a bio</h2>
      {/* 2. Controlled textarea — value + onChange, max MAX chars */}
      <textarea
        rows={4}
        placeholder="Tell us about yourself..."
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'sans-serif' }}
      />
      {/* 3. Show remaining characters — red when <= 10 */}
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
        return /useState/.test(code) &&
          /value=/.test(code) &&
          /onChange/.test(code) &&
          /slice\(/.test(code) &&
          /100/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-signup-form',
      text: "Build a signup form with three controlled fields: name, email, and password. Store all three in a single state object. Below the form, render a live JSON preview of the form state. On submit, prevent the default and show a success message instead of the form.",
      hint: "Use useState({ name: '', email: '', password: '' }). Each input's onChange should call setForm(prev => ({ ...prev, fieldName: e.target.value })). Use JSON.stringify(form, null, 2) in a <pre> tag for the preview.",
      startCode: `const { useState } = React

function App() {
  // 1. Single state object for all fields: { name, email, password }
  // 2. State to track if submitted

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#e2e8f0' }}>Create Account</h2>
      {/* 3. Form with name, email, password inputs — all controlled */}
      {/* 4. JSON preview below the form */}
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
        return /useState/.test(code) &&
          /value=/.test(code) &&
          /onChange/.test(code) &&
          /JSON\.stringify/.test(code) &&
          /preventDefault/.test(code)
      }
    }
  ]
}
