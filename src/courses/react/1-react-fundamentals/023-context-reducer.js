export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-23-context-reducer',
  title: '23. Context + useReducer: App State',
  chapter: 'react-ch6',
  language: 'react',
  checkpoints: [
    { id: 'cp-pattern', label: 'The Pattern' },
    { id: 'cp-dual-context', label: 'Dual Context' },
    { id: 'cp-store-hook', label: 'Store Hook' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "As an app grows, useState scattered across components becomes hard to follow. Actions that modify shared state get passed as props through layers of components that don't use them. Combining useReducer with context gives you predictable centralized state without an external library: actions in, state out.",
      code: `const { useReducer } = React

// useReducer alone: centralized logic, but no sharing between components
function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return { ...state, count: state.count + 1 }
    case 'REMOVE': return { ...state, count: Math.max(0, state.count - 1) }
    case 'RESET':  return { count: 0, history: [] }
    case 'LOG':    return { ...state, history: [...state.history, action.payload] }
    default: return state
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, { count: 0, history: [] })

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>useReducer Alone</h2>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f1f5f9', textAlign: 'center' }}>{state.count}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { dispatch({ type: 'ADD' }); dispatch({ type: 'LOG', payload: '+1 at ' + new Date().toLocaleTimeString() }) }} style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>+</button>
        <button onClick={() => dispatch({ type: 'REMOVE' })} style={{ flex: 1, background: '#334155', color: '#94a3b8', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>-</button>
        <button onClick={() => dispatch({ type: 'RESET' })} style={{ flex: 1, background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>Reset</button>
      </div>
      <div style={{ maxHeight: '80px', overflow: 'auto' }}>
        {state.history.map((h, i) => <div key={i} style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>{h}</div>)}
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
      id: 'add-context',
      text: "Add context to share the state and dispatch across the entire tree. Create two contexts: one for state, one for dispatch. Separate contexts matter for performance — a component that only dispatches actions won't re-render when state changes, because it only reads from DispatchContext.",
      code: `const { useReducer, createContext, useContext } = React

const StateCtx   = createContext(null)
const DispatchCtx = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':    return { ...state, items: [...state.items, action.payload] }
    case 'REMOVE_ITEM': return { ...state, items: state.items.filter(i => i !== action.payload) }
    case 'CLEAR':       return { ...state, items: [] }
    default: return state
  }
}

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>
        {children}
      </DispatchCtx.Provider>
    </StateCtx.Provider>
  )
}

// Component that only reads state
function ItemCount() {
  const { items } = useContext(StateCtx)
  return <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '2px 8px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>{items.length}</span>
}

// Component that only dispatches — doesn't re-render on state change
function AddButton({ label }) {
  const dispatch = useContext(DispatchCtx)
  return (
    <button onClick={() => dispatch({ type: 'ADD_ITEM', payload: label + '-' + Date.now() })} style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
      Add {label}
    </button>
  )
}

// Component that reads and dispatches
function ItemList() {
  const { items } = useContext(StateCtx)
  const dispatch = useContext(DispatchCtx)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {items.map(item => (
        <div key={item} style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '6px 10px', borderRadius: '6px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace' }}>{item}</span>
          <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item })} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}>×</button>
        </div>
      ))}
    </div>
  )
}

function App() {
  return (
    <StoreProvider>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Store Demo</h2>
          <ItemCount />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <AddButton label="Widget" />
          <AddButton label="Gadget" />
        </div>
        <ItemList />
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
      type: 'checkpoint',
      id: 'cp-pattern'
    },
    {
      type: 'narration',
      id: 'custom-hooks-for-store',
      text: "Wrap the context reads in custom hooks to make the API clean and throw a helpful error if used outside the provider. `useStore()` returns the state, `useDispatch()` returns the dispatch function. Components never see the context directly.",
      code: `const { useReducer, createContext, useContext } = React

const StateCtx    = createContext(null)
const DispatchCtx = createContext(null)

// Custom hooks with error guards
function useStore() {
  const ctx = useContext(StateCtx)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

function useDispatch() {
  const ctx = useContext(DispatchCtx)
  if (!ctx) throw new Error('useDispatch must be used inside <StoreProvider>')
  return ctx
}

function notificationsReducer(state, action) {
  switch (action.type) {
    case 'ADD':     return { ...state, list: [...state.list, { id: Date.now(), msg: action.payload, type: action.kind || 'info' }] }
    case 'DISMISS': return { ...state, list: state.list.filter(n => n.id !== action.id) }
    default: return state
  }
}

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(notificationsReducer, { list: [] })
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>
        {children}
      </DispatchCtx.Provider>
    </StateCtx.Provider>
  )
}

function NotificationList() {
  const { list } = useStore()
  const dispatch = useDispatch()
  const colors = { info: '#3b82f6', success: '#10b981', error: '#ef4444' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {list.map(n => (
        <div key={n.id} style={{ background: (colors[n.type] || '#3b82f6') + '20', border: '1px solid ' + (colors[n.type] || '#3b82f6') + '40', color: colors[n.type] || '#3b82f6', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
          {n.msg}
          <button onClick={() => dispatch({ type: 'DISMISS', id: n.id })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7 }}>×</button>
        </div>
      ))}
      {list.length === 0 && <p style={{ color: '#475569', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>No notifications</p>}
    </div>
  )
}

function Controls() {
  const dispatch = useDispatch()
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {[['info','Info'], ['success','Success'], ['error','Error']].map(([kind, label]) => (
        <button key={kind} onClick={() => dispatch({ type: 'ADD', payload: label + ' notification', kind })} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
          + {label}
        </button>
      ))}
    </div>
  )
}

function App() {
  return (
    <StoreProvider>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem', fontFamily: 'sans-serif' }}>Notification Store</h2>
        <Controls />
        <NotificationList />
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
      type: 'checkpoint',
      id: 'cp-dual-context'
    },
    {
      type: 'narration',
      id: 'shopping-cart',
      text: "A full shopping cart demonstrates the pattern at scale. ProductList dispatches ADD_TO_CART. CartSidebar reads items and dispatches REMOVE. CartTotal reads items to compute the sum. All three are siblings — no prop drilling, no callbacks passed three levels deep.",
      code: `const { useReducer, createContext, useContext } = React

const CartCtx = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const exists = state.find(i => i.id === action.item.id)
      if (exists) return state.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...state, { ...action.item, qty: 1 }]
    }
    case 'REMOVE': return state.filter(i => i.id !== action.id)
    case 'CLEAR':  return []
    default: return state
  }
}

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [])
  return <CartCtx.Provider value={{ cart, dispatch }}>{children}</CartCtx.Provider>
}

const PRODUCTS = [
  { id: 1, name: 'Keyboard', price: 89 },
  { id: 2, name: 'Monitor', price: 299 },
  { id: 3, name: 'Webcam', price: 59 },
]

function ProductList() {
  const { dispatch } = useContext(CartCtx)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {PRODUCTS.map(p => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '10px 12px', borderRadius: '6px', fontFamily: 'sans-serif' }}>
          <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{p.name} — {p.price}</span>
          <button onClick={() => dispatch({ type: 'ADD', item: p })} style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Add</button>
        </div>
      ))}
    </div>
  )
}

function CartSummary() {
  const { cart, dispatch } = useContext(CartCtx)
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  return (
    <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cart ({cart.reduce((s, i) => s + i.qty, 0)})</div>
      {cart.length === 0 && <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0 0 8px' }}>Empty</p>}
      {cart.map(item => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '4px' }}>
          <span>{item.name} x{item.qty}</span>
          <button onClick={() => dispatch({ type: 'REMOVE', id: item.id })} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>×</button>
        </div>
      ))}
      {cart.length > 0 && <div style={{ color: '#38bdf8', fontWeight: 700, marginTop: '8px', fontSize: '1rem' }}>Total: {total}</div>}
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem', fontFamily: 'sans-serif' }}>Shop</h2>
        <ProductList />
        <CartSummary />
      </div>
    </CartProvider>
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
      id: 'when-external-lib',
      text: "This pattern covers 80% of real app state needs. Reach for Zustand or Redux Toolkit when: you have very frequent updates where context re-renders are measurable, you need time-travel debugging, you need state across browser tabs, or your team already knows the library. Don't add a state management library by default — earn it.",
      code: `const { useReducer, createContext, useContext } = React

// The pattern in its simplest form — study this template
const Ctx = createContext(null)

function reducer(state, action) {
  // All state transitions in one place — easy to test
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload }
    case 'LOGOUT':   return { ...state, user: null }
    case 'SET_THEME': return { ...state, theme: action.payload }
    default: return state
  }
}

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { user: null, theme: 'dark' })
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

function useApp() { return useContext(Ctx) }

function Header() {
  const { state, dispatch } = useApp()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 16px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem' }}>App ({state.theme})</span>
      {state.user ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{state.user}</span>
          <button onClick={() => dispatch({ type: 'LOGOUT' })} style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Logout</button>
        </div>
      ) : (
        <button onClick={() => dispatch({ type: 'SET_USER', payload: 'Maya' })} style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Login</button>
      )}
    </div>
  )
}

function ThemeToggle() {
  const { state, dispatch } = useApp()
  return (
    <button onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>
      Toggle theme (current: {state.theme})
    </button>
  )
}

function App() {
  return (
    <AppProvider>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Header />
        <ThemeToggle />
      </div>
    </AppProvider>
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
      id: 'cp-store-hook'
    },
    {
      type: 'challenge',
      id: 'ch-notification-store',
      text: "Build a global notification system using context + useReducer. Actions: ADD_NOTIFICATION (with id, message, type) and DISMISS (by id). A `Controls` component dispatches ADD. A `NotificationList` component reads and renders notifications. Both are siblings under a `NotificationProvider`.",
      hint: "Create NotificationCtx, wrap in Provider with useReducer. Controls reads dispatch from context, NotificationList reads state. Wire ADD_NOTIFICATION and DISMISS in the reducer.",
      startCode: `const { useReducer, createContext, useContext } = React

const NotificationCtx = createContext(null)

function reducer(state, action) {
  // Handle ADD_NOTIFICATION and DISMISS actions
  switch (action.type) {
    default: return state
  }
}

function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { notifications: [] })
  return (
    <NotificationCtx.Provider value={{ state, dispatch }}>
      {children}
    </NotificationCtx.Provider>
  )
}

function Controls() {
  const { dispatch } = useContext(NotificationCtx)
  // Add buttons to dispatch ADD_NOTIFICATION with type 'info', 'success', 'error'
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {/* Buttons here */}
    </div>
  )
}

function NotificationList() {
  const { state, dispatch } = useContext(NotificationCtx)
  // Render state.notifications, each with a dismiss button
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Map over state.notifications */}
    </div>
  )
}

function App() {
  return (
    <NotificationProvider>
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', width: '100%', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1rem' }}>Notification Store</h2>
          <Controls />
          <NotificationList />
        </div>
      </div>
    </NotificationProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useReducer/.test(code) &&
          /createContext/.test(code) &&
          /ADD_NOTIFICATION|ADD/.test(code) &&
          /DISMISS/.test(code) &&
          /dispatch/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-cart-store',
      text: "Build a cart store with context + useReducer. Actions: ADD_ITEM (adds or increments qty), REMOVE_ITEM, CLEAR_CART. A ProductList component dispatches ADD_ITEM. A CartBadge component reads the total item count from context. Both are siblings inside CartProvider.",
      hint: "CartCtx provides { cart, dispatch }. ADD_ITEM checks if item exists — if so increment qty, else add new item. CartBadge reads cart from context and shows cart.length or total qty.",
      startCode: `const { useReducer, createContext, useContext } = React

const CartCtx = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    // ADD_ITEM: add new or increment existing
    // REMOVE_ITEM: filter out by id
    // CLEAR_CART: return []
    default: return state
  }
}

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [])
  return (
    <CartCtx.Provider value={{ cart, dispatch }}>
      {children}
    </CartCtx.Provider>
  )
}

function CartBadge() {
  const { cart } = useContext(CartCtx)
  const total = cart.reduce((s, i) => s + i.qty, 0)
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem' }}>
      Cart: {total} items
    </div>
  )
}

function ProductList() {
  const { dispatch } = useContext(CartCtx)
  const products = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 29 },
    { id: 3, name: 'Desk', price: 249 },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {products.map(p => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '10px 12px', borderRadius: '6px', fontFamily: 'sans-serif', alignItems: 'center' }}>
          <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{p.name}</span>
          <button onClick={() => dispatch({ type: 'ADD_ITEM', item: p })} style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Add
          </button>
        </div>
      ))}
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <CartBadge />
          <ProductList />
        </div>
      </div>
    </CartProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useReducer/.test(code) &&
          /ADD_ITEM/.test(code) &&
          /REMOVE_ITEM/.test(code) &&
          /dispatch/.test(code) &&
          /CartCtx/.test(code)
      }
    }
  ]
}
