export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-20-forms',
  title: '20. Forms & Validation',
  chapter: 'react-ch6',
  language: 'react',
  checkpoints: [
    { id: 'cp-form-submit', label: 'Form Submit Pattern' },
    { id: 'cp-validation', label: 'Validation & Errors' },
    { id: 'cp-async-submit', label: 'Async Submission' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro-forms',
      text: "Forms in React follow a controlled input pattern: each field's value is bound to a state variable, and every keystroke updates state through an onChange handler. This gives you a single source of truth — the form state lives in React, not in the DOM. The submit handler reads directly from state rather than querying DOM elements.",
      code: `const { useState } = React

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  const inputStyle = {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px',
    fontSize: '1rem', boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#38bdf8' }}>Controlled Form</h2>
      {submitted ? (
        <div style={{ color: '#10b981', background: '#10b98120', border: '1px solid #10b98140', padding: '14px 18px', borderRadius: '8px' }}>
          Submitted! Name: <strong>{name}</strong>, Email: <strong>{email}</strong>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Email</label>
            <input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <button type="submit" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
            Submit
          </button>
        </form>
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
      id: 'validation-on-submit',
      text: "Basic form validation runs in the submit handler before any API call. You build an errors object, check each field, and if any errors exist you set state and bail out early. Storing errors as an object keyed by field name lets you render targeted messages next to each input rather than a single generic alert.",
      code: `const { useState } = React

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Name is required'
  if (!values.email.trim()) errors.email = 'Email is required'
  else if (!values.email.includes('@')) errors.email = 'Enter a valid email'
  return errors
}

function App() {
  const [values, setValues] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSuccess(true)
  }

  const inputStyle = (field) => ({
    width: '100%', background: '#0f172a',
    border: \`1px solid \${errors[field] ? '#ef4444' : '#334155'}\`,
    color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px',
    fontSize: '1rem', boxSizing: 'border-box', outline: 'none',
  })

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#38bdf8' }}>Validation on Submit</h2>
      {success ? (
        <p style={{ color: '#10b981' }}>All good! Form is valid.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Name</label>
            <input style={inputStyle('name')} name="name" value={values.name} onChange={handleChange} placeholder="Your name" />
            {errors.name && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '4px 0 0' }}>{errors.name}</p>}
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Email</label>
            <input style={inputStyle('email')} name="email" value={values.email} onChange={handleChange} placeholder="you@example.com" />
            {errors.email && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '4px 0 0' }}>{errors.email}</p>}
          </div>
          <button type="submit" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
            Submit
          </button>
        </form>
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
      id: 'cp-form-submit'
    },
    {
      type: 'narration',
      id: 'touched-state',
      text: "Showing errors immediately on page load is a bad UX — users haven't had a chance to fill anything in yet. The 'touched' pattern fixes this: you track which fields the user has interacted with (on blur), and only display an error for a field once it's been touched. Errors are still computed on every render, but only rendered when the field has been visited.",
      code: `const { useState } = React

function App() {
  const [values, setValues] = useState({ name: '', email: '' })
  const [touched, setTouched] = useState({})

  function getErrors(vals) {
    const e = {}
    if (!vals.name.trim()) e.name = 'Name is required'
    if (!vals.email.includes('@')) e.email = 'Valid email required'
    return e
  }

  function handleChange(e) {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleBlur(e) {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  const errors = getErrors(values)

  const fieldStyle = (name) => ({
    width: '100%', background: '#0f172a', boxSizing: 'border-box',
    border: \`1px solid \${touched[name] && errors[name] ? '#ef4444' : '#334155'}\`,
    color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', outline: 'none',
  })

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 6px', color: '#38bdf8' }}>Touched State</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 20px' }}>Click a field then leave it empty — error appears on blur.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {['name', 'email'].map(field => (
          <div key={field}>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px', textTransform: 'capitalize' }}>{field}</label>
            <input
              style={fieldStyle(field)}
              name={field}
              value={values[field]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={field === 'email' ? 'you@example.com' : 'Your name'}
            />
            {touched[field] && errors[field] && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '4px 0 0' }}>{errors[field]}</p>
            )}
          </div>
        ))}
      </div>
      <p style={{ color: '#10b981', marginTop: '16px', fontSize: '0.85rem' }}>
        {Object.keys(errors).length === 0 ? 'All fields valid!' : \`\${Object.keys(errors).length} error(s) remaining\`}
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
      id: 'inline-errors',
      text: "Field-level error messages should appear directly below the relevant input, not in a summary at the top of the form. This creates a clear spatial relationship between the error and the field that caused it. Use a consistent layout — label, input, error message — and reserve the error slot in the DOM even when empty to prevent layout shift.",
      code: `const { useState } = React

function Field({ label, name, value, onChange, onBlur, error, touched, type = 'text', placeholder = '' }) {
  const showError = touched && error
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          background: '#0f172a', border: \`1px solid \${showError ? '#ef4444' : '#334155'}\`,
          color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px',
          fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />
      <p style={{ color: '#ef4444', fontSize: '0.78rem', margin: 0, minHeight: '18px' }}>
        {showError ? error : ''}
      </p>
    </div>
  )
}

function App() {
  const [values, setValues] = useState({ username: '', email: '', password: '' })
  const [touched, setTouched] = useState({})

  function getErrors(v) {
    const e = {}
    if (!v.username.trim()) e.username = 'Username is required'
    if (!v.email.includes('@')) e.email = 'Invalid email address'
    if (v.password.length < 6) e.password = 'At least 6 characters'
    return e
  }

  const errors = getErrors(values)
  const allValid = Object.keys(errors).length === 0

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#38bdf8' }}>Inline Field Errors</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[
          { label: 'Username', name: 'username', placeholder: 'johndoe' },
          { label: 'Email', name: 'email', placeholder: 'john@example.com' },
          { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
        ].map(f => (
          <Field
            key={f.name}
            {...f}
            value={values[f.name]}
            error={errors[f.name]}
            touched={!!touched[f.name]}
            onChange={e => setValues(p => ({ ...p, [e.target.name]: e.target.value }))}
            onBlur={e => setTouched(p => ({ ...p, [e.target.name]: true }))}
          />
        ))}
        <div style={{ marginTop: '4px', padding: '10px 14px', borderRadius: '6px', background: allValid ? '#10b98120' : '#ef444420', color: allValid ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
          {allValid ? 'Form is valid — ready to submit' : 'Please fix the errors above'}
        </div>
      </form>
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
      id: 'cp-validation'
    },
    {
      type: 'narration',
      id: 'async-submission',
      text: "Real form submissions hit an API and take time. Model this with a loading state: set `isLoading = true` before the async work, disable the submit button, show a spinner or loading text, then set it back to false when done — whether success or failure. Always handle both the happy path and errors to avoid leaving the form in a broken state.",
      code: `const { useState } = React

function fakeApiCall(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.3 ? resolve({ ok: true }) : reject(new Error('Server error'))
    }, 1500)
  })
}

function App() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(null) // null | 'success' | 'error'
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.includes('@')) { setStatus('error'); setMessage('Enter a valid email'); return }
    setIsLoading(true)
    setStatus(null)
    try {
      await fakeApiCall({ email })
      setStatus('success')
      setMessage('Subscribed! Check your inbox.')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage('Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 8px', color: '#38bdf8' }}>Async Submit</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 20px' }}>70% success rate to demo both paths.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={isLoading}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', outline: 'none', opacity: isLoading ? 0.6 : 1 }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{ background: isLoading ? '#1e40af' : '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isLoading ? (
            <>
              <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #0f172a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Submitting...
            </>
          ) : 'Subscribe'}
        </button>
        {status && (
          <p style={{ color: status === 'success' ? '#10b981' : '#ef4444', margin: 0, fontSize: '0.9rem', background: status === 'success' ? '#10b98120' : '#ef444420', padding: '10px 14px', borderRadius: '6px' }}>
            {message}
          </p>
        )}
      </form>
      <style>{"@keyframes spin { to { transform: rotate(360deg) } }"}</style>
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
      id: 'form-reset',
      text: "After a successful submission, reset the form by setting all state back to initial values. This is one advantage of controlled inputs: a single `setState` call clears everything. Also clear touched and errors so the reset form starts clean — not pre-highlighted in red. Some apps redirect away; others show a success message and reset in place.",
      code: `const { useState } = React

const INITIAL = { name: '', email: '', message: '' }

function App() {
  const [values, setValues] = useState(INITIAL)
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    setValues(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsLoading(false)
    setSubmitted(true)
    // Reset everything after success
    setValues(INITIAL)
    setTouched({})
    setTimeout(() => setSubmitted(false), 3000)
  }

  const inputStyle = {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#38bdf8' }}>Form Reset on Success</h2>
      {submitted && (
        <div style={{ background: '#10b98120', border: '1px solid #10b98150', color: '#10b981', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
          Message sent! Form cleared. (Resets automatically)
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[
          { name: 'name', placeholder: 'Your name' },
          { name: 'email', placeholder: 'your@email.com' },
        ].map(f => (
          <input key={f.name} {...f} value={values[f.name]} onChange={handleChange} style={inputStyle} />
        ))}
        <textarea
          name="message"
          value={values.message}
          onChange={handleChange}
          placeholder="Your message..."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <button type="submit" disabled={isLoading} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
          {isLoading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
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
      id: 'cp-async-submit'
    },
    {
      type: 'narration',
      id: 'full-form-example',
      text: "Putting it all together: a complete form combines controlled inputs, touched tracking, validation, async submission with loading state, and reset on success. Each concern is isolated — validation is a pure function, submission logic is async, field rendering is a reusable component. The form never calls DOM APIs — all state flows through React.",
      code: `const { useState } = React

const INIT = { username: '', email: '', password: '' }

function validate(v) {
  const e = {}
  if (v.username.length < 3) e.username = 'Min 3 characters'
  if (!v.email.includes('@')) e.email = 'Valid email required'
  if (v.password.length < 8) e.password = 'Min 8 characters'
  return e
}

function Field({ label, name, type = 'text', placeholder, value, onChange, onBlur, error, touched }) {
  const showErr = touched && error
  return (
    <div>
      <label style={{ color: '#94a3b8', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder}
        style={{ width: '100%', background: '#0f172a', border: \`1px solid \${showErr ? '#ef4444' : '#334155'}\`, color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
      />
      <p style={{ color: '#ef4444', fontSize: '0.78rem', margin: '4px 0 0', minHeight: '16px' }}>{showErr ? error : ''}</p>
    </div>
  )
}

function App() {
  const [values, setValues] = useState(INIT)
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const errors = validate(values)
  const isValid = Object.keys(errors).length === 0

  const handleChange = e => setValues(p => ({ ...p, [e.target.name]: e.target.value }))
  const handleBlur = e => setTouched(p => ({ ...p, [e.target.name]: true }))

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ username: true, email: true, password: true })
    if (!isValid) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSuccess(true)
    setValues(INIT)
    setTouched({})
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#38bdf8' }}>Complete Registration Form</h2>
      {success && <div style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98150', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>Account created successfully!</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Field label="Username" name="username" placeholder="johndoe" value={values.username} onChange={handleChange} onBlur={handleBlur} error={errors.username} touched={!!touched.username} />
        <Field label="Email" name="email" placeholder="john@example.com" value={values.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} touched={!!touched.email} />
        <Field label="Password" name="password" type="password" placeholder="••••••••" value={values.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} touched={!!touched.password} />
        <button type="submit" disabled={loading} style={{ marginTop: '8px', background: loading ? '#0369a1' : '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
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
      id: 'ch-registration-form',
      text: "Build a registration form with three fields: username (min 3 chars), email (must contain @), and password (min 8 chars). Show inline error messages below each field when the form is submitted and a field is invalid. On valid submission, show a success message.",
      hint: "Build a validate(values) function that returns an error object. In handleSubmit, call validate and if Object.keys(errors).length > 0, set errors state and return early. Render {errors.username && <p style={{color:'#ef4444'}}>{errors.username}</p>} below each input.",
      startCode: `const { useState } = React

function App() {
  const [values, setValues] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  function validate(v) {
    // Return an object with error messages for invalid fields
    // username: min 3 chars
    // email: must contain '@'
    // password: min 8 chars
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Call validate, set errors, bail out if any errors
    // On success, setSuccess(true)
  }

  const inputStyle = {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px',
    fontSize: '1rem', boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '400px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#38bdf8' }}>Registration</h2>
      {success && <p style={{ color: '#10b981' }}>Registered successfully!</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <input name="username" value={values.username} onChange={e => setValues(p => ({...p, username: e.target.value}))} placeholder="Username" style={inputStyle} />
          {/* Show errors.username here */}
        </div>
        <div>
          <input name="email" value={values.email} onChange={e => setValues(p => ({...p, email: e.target.value}))} placeholder="Email" style={inputStyle} />
          {/* Show errors.email here */}
        </div>
        <div>
          <input name="password" type="password" value={values.password} onChange={e => setValues(p => ({...p, password: e.target.value}))} placeholder="Password" style={inputStyle} />
          {/* Show errors.password here */}
        </div>
        <button type="submit" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Register</button>
      </form>
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
        return /validate/.test(code) &&
          /errors/.test(code) &&
          /ef4444/.test(code) &&
          /username/.test(code) &&
          /password/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-async-contact-form',
      text: "Build a contact form with name and message fields. When submitted, show a loading spinner for 1 second (using setTimeout in an async handler), then show a success message and reset the form. The submit button should be disabled and show 'Sending...' while loading.",
      hint: "Use async function handleSubmit, set isLoading = true, then await new Promise(r => setTimeout(r, 1000)), then setIsLoading(false) and setSuccess(true). Reset form values to empty strings after success.",
      startCode: `const { useState } = React

function App() {
  const [values, setValues] = useState({ name: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    // 1. Set isLoading to true
    // 2. Await a 1-second delay: await new Promise(r => setTimeout(r, 1000))
    // 3. Set isLoading false, success true
    // 4. Reset form values
  }

  const inputStyle = {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px',
    fontSize: '1rem', boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', color: '#f1f5f9', maxWidth: '420px' }}>
      <h2 style={{ margin: '0 0 20px', color: '#38bdf8' }}>Contact Us</h2>
      {success && <p style={{ color: '#10b981' }}>Message sent!</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input value={values.name} onChange={e => setValues(p => ({...p, name: e.target.value}))} placeholder="Your name" style={inputStyle} />
        <textarea value={values.message} onChange={e => setValues(p => ({...p, message: e.target.value}))} placeholder="Your message" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        {/* Button: disabled while loading, shows 'Sending...' text */}
        <button type="submit" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          Send
        </button>
      </form>
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
        return /isLoading/.test(code) &&
          /setTimeout/.test(code) &&
          /success/.test(code) &&
          /disabled/.test(code)
      }
    }
  ]
}
