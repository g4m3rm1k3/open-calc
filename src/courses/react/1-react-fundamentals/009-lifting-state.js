export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-09-lifting-state',
  title: '09. Lifting State Up',
  chapter: 'react-ch2',
  language: 'react',
  checkpoints: [
    { id: 'cp-problem', label: 'The Problem' },
    { id: 'cp-lifting', label: 'Lifting State' },
    { id: 'cp-siblings', label: 'Sibling Communication' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "Two components need to share data. A CartIcon needs to know how many items are in the cart. A CartPanel needs to show those items. They're siblings — neither is the parent of the other. Local useState in each component gives each one its own isolated copy. They can't talk to each other. That's the problem.",
      code: `const { useState } = React

// Problem: CartIcon and CartCount are siblings.
// Each has its own count — they're NOT in sync.

function CartIcon() {
  const [count, setCount] = useState(0) // isolated!
  return (
    <button
      onClick={() => setCount(c => c + 1)}
      style={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'sans-serif' }}
    >
      Cart ({count})
    </button>
  )
}

function CartCount() {
  const [count] = useState(0) // different count — always 0!
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#94a3b8', fontSize: '0.9rem' }}>
      Items in cart: {count} (stays 0 — isolated from CartIcon)
    </div>
  )
}

function App() {
  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '360px' }}>
      <CartIcon />
      <CartCount />
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
      id: 'solution-concept',
      text: "The solution: find the nearest common ancestor of the two components and move the state there. The parent holds the single source of truth, passes the current value down as props, and passes a callback so children can request updates. This is called lifting state up.",
      code: `const { useState } = React

// Solution: state lives in App (nearest common ancestor)
// CartIcon receives count + onAdd as props
// CartCount receives count as prop

function CartIcon({ count, onAdd }) {
  return (
    <button
      onClick={onAdd}
      style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 600 }}
    >
      Cart ({count}) — click to add
    </button>
  )
}

function CartCount({ count }) {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
      Items in cart: {count} — stays in sync!
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0) // single source of truth

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '360px' }}>
      <CartIcon count={count} onAdd={() => setCount(c => c + 1)} />
      <CartCount count={count} />
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
      id: 'cp-problem'
    },
    {
      type: 'narration',
      id: 'data-flows-down',
      text: "Data flows down (parent to child via props) and events flow up (child to parent via callback props). This is React's one-way data flow. A child never directly modifies parent state — it calls a function the parent provided. The parent decides how state changes.",
      code: `const { useState } = React

// Data flows DOWN as props
// Events flow UP as callback calls

function Slider({ value, onChange, label }) {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
        {label}: {value}
      </label>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}  // events UP
        style={{ width: '100%' }}
      />
    </div>
  )
}

function App() {
  const [r, setR] = useState(100)
  const [g, setG] = useState(150)
  const [b, setB] = useState(200)

  const color = 'rgb(' + r + ', ' + g + ', ' + b + ')'

  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: 80, borderRadius: '8px', background: color, transition: 'background 0.1s' }} />
      <Slider value={r} onChange={setR} label="Red" />
      <Slider value={g} onChange={setG} label="Green" />
      <Slider value={b} onChange={setB} label="Blue" />
      <code style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{color}</code>
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
      id: 'find-common-ancestor',
      text: "How to find where to lift state: trace both components that need the data up the component tree until you find the first component that is an ancestor of both. That's where state belongs. If you lift too high, irrelevant components re-render. Too low and siblings can't share it.",
      code: `const { useState } = React

// Tree: App > Row > [TemperatureC, TemperatureF]
// Both displays need the same temperature value
// → state belongs in Row (nearest common ancestor)

function TempInput({ label, value, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '6px', fontFamily: 'sans-serif' }}>{label}</div>
      <input
        type="number" value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '1.1rem', boxSizing: 'border-box' }}
      />
    </div>
  )
}

function Row() {
  const [celsius, setCelsius] = useState(20)
  const fahrenheit = celsius * 9/5 + 32

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <TempInput label="Celsius °C" value={celsius} onChange={setCelsius} />
      <TempInput label="Fahrenheit °F" value={fahrenheit.toFixed(1)} onChange={f => setCelsius((f - 32) * 5/9)} />
    </div>
  )
}

function App() {
  return (
    <div style={{ background: '#1e293b', padding: '28px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px', fontSize: '1.1rem' }}>Temperature Converter</h2>
      <Row />
      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '16px 0 0' }}>Edit either field — they stay in sync.</p>
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
      id: 'cp-lifting'
    },
    {
      type: 'narration',
      id: 'tabs-example',
      text: "Tabs are the classic sibling-communication pattern. Each Tab button and each Panel are siblings. The parent holds `activeTab` state. Each Tab receives its id and a click handler. Each Panel receives whether it's active. The parent orchestrates; the children just respond.",
      code: `const { useState } = React

function TabButton({ id, label, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        padding: '8px 18px',
        background: isActive ? '#3b82f6' : 'transparent',
        color: isActive ? '#fff' : '#94a3b8',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: 'sans-serif',
        fontSize: '0.9rem',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function TabPanel({ id, activeTab, children }) {
  if (id !== activeTab) return null
  return (
    <div style={{ color: '#e2e8f0', fontFamily: 'sans-serif', lineHeight: 1.6, fontSize: '0.9rem' }}>
      {children}
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('overview')  // state lives here

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '400px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#0f172a', padding: '4px', borderRadius: '8px' }}>
        <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
        <TabButton id="details" label="Details" isActive={activeTab === 'details'} onClick={setActiveTab} />
        <TabButton id="code" label="Code" isActive={activeTab === 'code'} onClick={setActiveTab} />
      </div>
      <TabPanel id="overview" activeTab={activeTab}>
        Overview: Lifting state up means moving state to the nearest common ancestor.
      </TabPanel>
      <TabPanel id="details" activeTab={activeTab}>
        Details: The parent holds the active tab ID and passes it down. Children call onTabChange to request a switch.
      </TabPanel>
      <TabPanel id="code" activeTab={activeTab}>
        <code style={{ color: '#38bdf8' }}>const [activeTab, setActiveTab] = useState('overview')</code>
      </TabPanel>
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
      id: 'shopping-cart',
      text: "A shopping cart connects two unrelated-looking components: a product list that adds items and a cart summary that shows totals. Both need `cartItems`. The parent holds the array, passes it and an `onAdd` callback to ProductList, passes it directly to CartSummary.",
      code: `const { useState } = React

const PRODUCTS = [
  { id: 1, name: 'React Course', price: 49 },
  { id: 2, name: 'TypeScript Guide', price: 29 },
  { id: 3, name: 'Node.js Workshop', price: 39 },
]

function ProductList({ onAdd }) {
  return (
    <div>
      <h3 style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products</h3>
      {PRODUCTS.map(p => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{p.name}</span>
          <button onClick={() => onAdd(p)} style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Add
          </button>
        </div>
      ))}
    </div>
  )
}

function CartSummary({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0)
  return (
    <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px' }}>
      <h3 style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cart ({items.length})</h3>
      {items.length === 0 ? <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>Empty</p> : items.map((item, i) => (
        <div key={i} style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>{item.name}</div>
      ))}
      {items.length > 0 && <div style={{ color: '#38bdf8', fontWeight: 700, marginTop: '10px', fontSize: '1rem' }}>Total: {total}</div>}
    </div>
  )
}

function App() {
  const [cartItems, setCartItems] = useState([])

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '360px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ProductList onAdd={item => setCartItems(prev => [...prev, item])} />
      <CartSummary items={cartItems} />
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
      id: 'cp-siblings'
    },
    {
      type: 'narration',
      id: 'when-not-to-lift',
      text: "Lift state only as high as necessary. A form's field values don't need to live in the root — just in the form component. Lifting too high causes unrelated components to re-render on every keystroke. The rule: keep state as close to where it's used as possible, and only lift when two or more distant components need it.",
      code: `const { useState } = React

// Good: form state stays local — nothing else needs it
function SearchForm({ onSearch }) {
  const [query, setQuery] = useState('')  // local — stays here

  return (
    <form onSubmit={e => { e.preventDefault(); onSearch(query) }} style={{ display: 'flex', gap: '8px' }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
        style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', fontSize: '0.9rem' }}
      />
      <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
        Go
      </button>
    </form>
  )
}

// Only the results state is lifted to App (results shown in a sibling)
function Results({ term }) {
  if (!term) return <p style={{ color: '#475569', fontSize: '0.85rem' }}>Enter a search term above.</p>
  return <p style={{ color: '#10b981', fontSize: '0.9rem' }}>Showing results for: <strong>{term}</strong></p>
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')  // lifted — shared

  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1.1rem' }}>State Scoping</h2>
      <SearchForm onSearch={setSearchTerm} />
      <Results term={searchTerm} />
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
      id: 'ch-lift-counter',
      text: "Build a parent `App` with two `Counter` child components. Each Counter receives a `value` and `onIncrement` prop — no local state inside Counter. The parent holds the count for each. Display the sum of both counts in App, above the two counters.",
      hint: "App holds [count1, count2] or two useState calls. Counter is purely presentational: it renders the value and calls onIncrement when clicked.",
      startCode: `const { useState } = React

function Counter({ value, onIncrement }) {
  // No useState here — render value prop, call onIncrement on click
  return (
    <button
      onClick={onIncrement}
      style={{ padding: '12px 24px', background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', borderRadius: '8px', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '1.1rem' }}
    >
      Count: {value}
    </button>
  )
}

function App() {
  // Hold state for both counters here
  // Show the total above the two counters

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Total: ? */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Two Counter components */}
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useState/.test(code) &&
          /<Counter/.test(code) &&
          /onIncrement/.test(code) &&
          /value/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-accordion',
      text: "Build an Accordion where only one panel can be open at a time. Three `AccordionItem` components receive `title`, `content`, `isOpen`, and `onToggle` props. The parent `App` tracks which item is open by its ID. Clicking an open item closes it.",
      hint: "App holds [openId, setOpenId]. Each AccordionItem calls onToggle(id) on click. Parent does setOpenId(id === openId ? null : id). Children are purely presentational.",
      startCode: `const { useState } = React

function AccordionItem({ id, title, content, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid #334155' }}>
      <button
        onClick={() => onToggle(id)}
        style={{ width: '100%', background: 'none', border: 'none', color: '#e2e8f0', padding: '14px 0', textAlign: 'left', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between' }}
      >
        {title}
        <span style={{ color: '#94a3b8' }}>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <p style={{ color: '#94a3b8', margin: '0 0 14px', fontSize: '0.9rem', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
          {content}
        </p>
      )}
    </div>
  )
}

function App() {
  // Track which accordion item is open (by id, or null)

  const items = [
    { id: 'a', title: 'What is React?', content: 'React is a JavaScript library for building user interfaces.' },
    { id: 'b', title: 'What are props?', content: 'Props are read-only inputs passed from parent to child components.' },
    { id: 'c', title: 'What is state?', content: 'State is mutable data that triggers a re-render when changed.' },
  ]

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '420px', width: '100%' }}>
        {/* Render AccordionItems — pass isOpen and onToggle */}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /useState/.test(code) &&
          /<AccordionItem/.test(code) &&
          /onToggle/.test(code) &&
          /isOpen/.test(code)
      }
    }
  ]
}
