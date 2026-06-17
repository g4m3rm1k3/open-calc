export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-16-usereducer',
  title: '16. useReducer: Complex State',
  chapter: 'react-ch4',
  language: 'react',
  checkpoints: [
    { id: 'cp-reducer-fn', label: 'Reducer Function' },
    { id: 'cp-dispatch', label: 'Dispatch' },
    { id: 'cp-complex-state', label: 'Complex State' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'why-usereducer',
      text: "useState works great for a single value. But when your state has multiple sub-values that change together, or when the next state depends on which action was taken, useState starts to produce a tangle of setters scattered everywhere. useReducer centralises all state transitions in one function, making complex state predictable and easy to reason about.",
      code: `const { useState } = React

// Multiple useState calls that must stay in sync — fragile
function CounterBad() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  const [history, setHistory] = useState([0])

  const increment = () => {
    const next = count + step
    setCount(next)
    setHistory(h => [...h, next])   // easy to forget
  }

  return (
    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '380px' }}>
      <h2 style={{ color: '#f87171', marginTop: 0, fontSize: '0.95rem' }}>Multiple useState — fragile</h2>
      <p style={{ color: '#f1f5f9', margin: '0 0 10px' }}>Count: {count} | Step: {step}</p>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 14px' }}>History: [{history.join(', ')}]</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={increment} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>+{step}</button>
        <button onClick={() => setStep(s => s + 1)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Step++</button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <CounterBad />
  </div>
)`
    },
    {
      type: 'narration',
      id: 'reducer-syntax',
      text: "useReducer takes two arguments: a reducer function and an initial state. It returns the current state and a dispatch function. The reducer is a pure function: it takes the current state and an action object, and returns the next state. You never mutate state — you return a new value. The action object always has a type string, and optionally a payload.",
      code: `const { useReducer } = React

// The reducer: (state, action) => newState
// Pure — no side-effects, no mutation
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT': return { count: state.count + 1 }
    case 'DECREMENT': return { count: state.count - 1 }
    case 'RESET':     return { count: 0 }
    default:          return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 })

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '380px', textAlign: 'center' }}>
      <h2 style={{ color: '#38bdf8', marginTop: 0 }}>useReducer Counter</h2>
      <p style={{ color: '#f1f5f9', fontSize: '3rem', fontWeight: 700, margin: '0 0 24px' }}>{state.count}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => dispatch({ type: 'DECREMENT' })} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
        <button onClick={() => dispatch({ type: 'RESET' })} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Reset</button>
        <button onClick={() => dispatch({ type: 'INCREMENT' })} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <Counter />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-reducer-fn'
    },
    {
      type: 'narration',
      id: 'dispatch-and-actions',
      text: "dispatch(action) is how you trigger a state change. The action is a plain object — by convention it has a type string and an optional payload field for extra data. Dispatching is synchronous: the reducer runs immediately and the component re-renders with the new state. You never call the reducer directly; dispatch does that for you.",
      code: `const { useReducer } = React

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      // payload: { name, price }
      return { ...state, items: [...state.items, action.payload], total: state.total + action.payload.price }
    case 'REMOVE_LAST':
      if (state.items.length === 0) return state
      const removed = state.items[state.items.length - 1]
      return { ...state, items: state.items.slice(0, -1), total: state.total - removed.price }
    case 'CLEAR':
      return { items: [], total: 0 }
    default:
      return state
  }
}

const PRODUCTS = [
  { name: 'React Course', price: 29 },
  { name: 'TypeScript Pack', price: 19 },
  { name: 'Node Bundle', price: 25 },
]

function Cart() {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '400px', color: '#f1f5f9' }}>
      <h2 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1rem' }}>Cart — dispatch with payload</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {PRODUCTS.map(p => (
          <button key={p.name} onClick={() => dispatch({ type: 'ADD_ITEM', payload: p })} style={{ background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }}>
            + {p.name} (\${p.price})
          </button>
        ))}
      </div>
      <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px', marginBottom: '12px' }}>
        {cart.items.length === 0 ? <span style={{ color: '#64748b' }}>Cart is empty</span> : cart.items.map((item, i) => (
          <div key={i} style={{ color: '#cbd5e1', fontSize: '0.85rem', padding: '2px 0' }}>{item.name} — \${item.price}</div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#38bdf8', fontWeight: 700 }}>Total: \${cart.total}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => dispatch({ type: 'REMOVE_LAST' })} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Undo</button>
          <button onClick={() => dispatch({ type: 'CLEAR' })} style={{ background: '#ef444420', color: '#f87171', border: '1px solid #ef444440', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Clear</button>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <Cart />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-dispatch'
    },
    {
      type: 'narration',
      id: 'form-state',
      text: "useReducer is excellent for form state. Instead of one useState per field, you have a single state object and a single UPDATE action that merges a field by name. This pattern scales to any number of fields and makes resetting the form trivial — just dispatch RESET to return to the initial state.",
      code: `const { useReducer } = React

const initialForm = { name: '', email: '', role: 'viewer' }

function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE': return { ...state, [action.field]: action.value }
    case 'RESET':  return initialForm
    default:       return state
  }
}

const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '9px 12px', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }
const labelStyle = { color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px', display: 'block' }

function SignupForm() {
  const [form, dispatch] = useReducer(formReducer, initialForm)
  const update = (field) => (e) => dispatch({ type: 'UPDATE', field, value: e.target.value })

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '380px', color: '#f1f5f9' }}>
      <h2 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1rem' }}>Form — one reducer, any fields</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
        <div><label style={labelStyle}>Name</label><input style={inputStyle} value={form.name} onChange={update('name')} placeholder="Your name" /></div>
        <div><label style={labelStyle}>Email</label><input style={inputStyle} value={form.email} onChange={update('email')} placeholder="you@example.com" /></div>
        <div>
          <label style={labelStyle}>Role</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={update('role')}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>
        {JSON.stringify(form, null, 2)}
      </div>
      <button onClick={() => dispatch({ type: 'RESET' })} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Reset</button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <SignupForm />
  </div>
)`
    },
    {
      type: 'checkpoint',
      id: 'cp-complex-state'
    },
    {
      type: 'narration',
      id: 'reducer-plus-context',
      text: "useReducer and useContext are a natural pair. Put the state and dispatch in context, and any component in the tree can read state or dispatch actions without prop drilling. This is the same mental model as Redux, but built entirely from React primitives. It's appropriate for small-to-medium apps before you need an external store.",
      code: `const { useReducer, useContext, createContext } = React

const StoreContext = createContext()

function storeReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT': return { ...state, count: state.count + 1 }
    case 'SET_NAME':  return { ...state, name: action.payload }
    default:          return state
  }
}

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(storeReducer, { count: 0, name: 'World' })
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

function useStore() { return useContext(StoreContext) }

function CounterWidget() {
  const { state, dispatch } = useStore()
  return (
    <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Count:</span>
      <span style={{ color: '#38bdf8', fontWeight: 700 }}>{state.count}</span>
      <button onClick={() => dispatch({ type: 'INCREMENT' })} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: '5px', cursor: 'pointer', marginLeft: 'auto' }}>+1</button>
    </div>
  )
}

function GreetingWidget() {
  const { state, dispatch } = useStore()
  return (
    <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '6px' }}>
      <p style={{ color: '#f1f5f9', margin: '0 0 8px', fontSize: '0.9rem' }}>Hello, {state.name}!</p>
      <input value={state.name} onChange={e => dispatch({ type: 'SET_NAME', payload: e.target.value })} style={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', padding: '6px 10px', borderRadius: '5px', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }} />
    </div>
  )
}

function App() {
  return (
    <StoreProvider>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '380px' }}>
        <h2 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1rem' }}>useReducer + useContext = Mini Store</h2>
        <CounterWidget />
        <GreetingWidget />
      </div>
    </StoreProvider>
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
      id: 'ch-todo-reducer',
      text: "Build a todo list powered by useReducer. Actions: ADD_TODO (payload: text string), TOGGLE_TODO (payload: id), DELETE_TODO (payload: id). Each todo has { id, text, done }. Render the list with a strikethrough for completed items and a delete button per item.",
      hint: "Initial state: { todos: [] }. For ADD_TODO: [...state.todos, { id: Date.now(), text: action.payload, done: false }]. For TOGGLE_TODO: todos.map(t => t.id === action.payload ? { ...t, done: !t.done } : t). For DELETE_TODO: todos.filter(t => t.id !== action.payload).",
      startCode: `const { useReducer, useState } = React

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      // TODO: add { id: Date.now(), text: action.payload, done: false }
      return state
    case 'TOGGLE_TODO':
      // TODO: flip done for the matching id
      return state
    case 'DELETE_TODO':
      // TODO: remove item with matching id
      return state
    default:
      return state
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] })
  const [input, setInput] = useState('')

  const add = () => {
    if (!input.trim()) return
    dispatch({ type: 'ADD_TODO', payload: input.trim() })
    setInput('')
  }

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '380px', color: '#f1f5f9' }}>
      <h2 style={{ color: '#38bdf8', marginTop: 0 }}>Todos</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add a todo..." style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }} />
        <button onClick={add} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
      </div>
      {/* TODO: render state.todos — strikethrough done items, delete button each */}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <TodoApp />
  </div>
)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /ADD_TODO/.test(code) &&
          /TOGGLE_TODO/.test(code) &&
          /DELETE_TODO/.test(code) &&
          /useReducer/.test(code) &&
          /dispatch/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-bank-reducer',
      text: "Build a bank account with useReducer. Actions: DEPOSIT (payload: amount), WITHDRAW (payload: amount), RESET. If a withdrawal would make the balance negative, set an error message in state instead of changing the balance. Display the error in red. Reset clears both balance and error.",
      hint: "State: { balance: 0, error: '' }. For WITHDRAW: if state.balance < action.payload return { ...state, error: 'Insufficient funds' }. Otherwise return { balance: state.balance - action.payload, error: '' }.",
      startCode: `const { useReducer, useState } = React

function bankReducer(state, action) {
  switch (action.type) {
    case 'DEPOSIT':
      // TODO: add payload to balance, clear error
      return state
    case 'WITHDRAW':
      // TODO: if balance < payload, set error; else subtract
      return state
    case 'RESET':
      // TODO: return initial state
      return state
    default:
      return state
  }
}

function BankAccount() {
  const [state, dispatch] = useReducer(bankReducer, { balance: 0, error: '' })
  const [amount, setAmount] = useState('')

  const act = (type) => {
    const n = Number(amount)
    if (!n || n <= 0) return
    dispatch({ type, payload: n })
    setAmount('')
  }

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', fontFamily: 'sans-serif', maxWidth: '360px', color: '#f1f5f9' }}>
      <h2 style={{ color: '#38bdf8', marginTop: 0 }}>Bank Account</h2>
      <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 6px', color: state.balance < 0 ? '#f87171' : '#34d399' }}>\${state.balance}</p>
      {/* TODO: show state.error in red if it exists */}
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '12px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => act('DEPOSIT')} style={{ flex: 1, background: '#22c55e', color: '#fff', border: 'none', padding: '9px', borderRadius: '6px', cursor: 'pointer' }}>Deposit</button>
        <button onClick={() => act('WITHDRAW')} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '9px', borderRadius: '6px', cursor: 'pointer' }}>Withdraw</button>
        <button onClick={() => dispatch({ type: 'RESET' })} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '9px 14px', borderRadius: '6px', cursor: 'pointer' }}>Reset</button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <BankAccount />
  </div>
)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /DEPOSIT/.test(code) &&
          /WITHDRAW/.test(code) &&
          /RESET/.test(code) &&
          /error/.test(code) &&
          /useReducer/.test(code)
      }
    }
  ]
}
