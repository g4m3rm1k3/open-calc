export const lesson = {
  series: { id: 'react-mastery', title: 'React 0 to Mastery' },
  id: 'react-21-compound-components',
  title: '21. Compound Components Pattern',
  chapter: 'react-ch6',
  language: 'react',
  checkpoints: [
    { id: 'cp-problem', label: 'Prop Explosion' },
    { id: 'cp-internal-context', label: 'Internal Context' },
    { id: 'cp-compound-api', label: 'Compound API' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: "A flexible Tabs component starts with 3 props. Then someone wants custom tab styling. Then a disabled state. Then tab icons. Soon it has 15 props and a render prop. The component API has become a configuration nightmare. Compound components solve this by splitting one rigid component into cooperating sub-components that share state invisibly.",
      code: `const { useState } = React

// The prop explosion problem
// This Tabs API keeps growing as requirements change:
function RigidTabs({ tabs, activeIndex, onChange, size, variant, showBorder, closeButton }) {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: '4px', background: '#0f172a', padding: '4px', borderRadius: '8px', marginBottom: '16px' }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => onChange(i)} style={{ padding: '7px 16px', background: i === activeIndex ? '#3b82f6' : 'transparent', color: i === activeIndex ? '#fff' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{tabs[activeIndex]?.content}</div>
    </div>
  )
}

function App() {
  const [active, setActive] = useState(0)
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px' }}>
      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 12px' }}>Props approach — rigid, hard to customize:</p>
      <RigidTabs
        tabs={[{ label: 'Overview', content: 'Overview content here.' }, { label: 'Details', content: 'Detailed info here.' }]}
        activeIndex={active}
        onChange={setActive}
        size="md"
        variant="pill"
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
      id: 'native-example',
      text: "You already use compound components daily. The browser's native `<select>` + `<option>` is the original: `<select>` manages state, `<option>` elements describe choices — they cooperate without props connecting them. `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` are the same pattern. React lets you build your own.",
      code: `function App() {
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px', fontSize: '1rem' }}>Native Compound Components</h2>

      {/* select + option: compound. State is in select, choices in option. */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Framework (select + option):</label>
        <select style={{ background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem', width: '100%' }}>
          <option>React</option>
          <option>Vue</option>
          <option>Svelte</option>
        </select>
      </div>

      {/* details + summary: compound. open state lives in details. */}
      <details style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
        <summary style={{ color: '#e2e8f0', cursor: 'pointer', fontWeight: 500 }}>
          details + summary (click to expand)
        </summary>
        <p style={{ color: '#94a3b8', margin: '12px 0 0', fontSize: '0.9rem', lineHeight: 1.6 }}>
          The details element manages the open/closed state. Summary is the trigger. Both are separate elements cooperating silently — exactly the compound component pattern.
        </p>
      </details>
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
      id: 'build-tabs',
      text: "Build compound Tabs using context internally. The parent `Tabs` component creates a context with the active tab and a setter. `Tabs.List` renders the tab button container. `Tabs.Tab` reads the context to know if it's active. `Tabs.Panel` reads context to know if it should render. The consumer writes clean, readable JSX.",
      code: `const { useState, createContext, useContext } = React

const TabsContext = createContext(null)

function Tabs({ defaultTab, children }) {
  const [active, setActive] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div style={{ fontFamily: 'sans-serif' }}>{children}</div>
    </TabsContext.Provider>
  )
}

Tabs.List = function TabList({ children }) {
  return (
    <div style={{ display: 'flex', gap: '4px', background: '#0f172a', padding: '4px', borderRadius: '8px', marginBottom: '16px' }}>
      {children}
    </div>
  )
}

Tabs.Tab = function Tab({ id, children }) {
  const { active, setActive } = useContext(TabsContext)
  const isActive = id === active
  return (
    <button
      onClick={() => setActive(id)}
      style={{ padding: '7px 18px', background: isActive ? '#3b82f6' : 'transparent', color: isActive ? '#fff' : '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.15s' }}
    >
      {children}
    </button>
  )
}

Tabs.Panel = function Panel({ id, children }) {
  const { active } = useContext(TabsContext)
  if (id !== active) return null
  return <div style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.6 }}>{children}</div>
}

function App() {
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px' }}>
      <Tabs defaultTab="overview">
        <Tabs.List>
          <Tabs.Tab id="overview">Overview</Tabs.Tab>
          <Tabs.Tab id="api">API</Tabs.Tab>
          <Tabs.Tab id="examples">Examples</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="overview">Tabs share context internally — no prop threading needed.</Tabs.Panel>
        <Tabs.Panel id="api">The API is clean JSX composition. Each subcomponent reads context.</Tabs.Panel>
        <Tabs.Panel id="examples">Used in dashboards, settings pages, and documentation sites.</Tabs.Panel>
      </Tabs>
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
      id: 'accordion-compound',
      text: "Accordions are another classic fit. The parent Accordion tracks which item is open. AccordionItem reads context to know if it's open and whether to render its content. The user gets a clean API without any explicit open state management.",
      code: `const { useState, createContext, useContext } = React

const AccordionCtx = createContext(null)

function Accordion({ children }) {
  const [openId, setOpenId] = useState(null)
  return (
    <AccordionCtx.Provider value={{ openId, setOpenId }}>
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {children}
      </div>
    </AccordionCtx.Provider>
  )
}

function AccordionItem({ id, title, children }) {
  const { openId, setOpenId } = useContext(AccordionCtx)
  const isOpen = openId === id
  return (
    <div style={{ background: '#1e293b', borderRadius: '8px', overflow: 'hidden', border: '1px solid ' + (isOpen ? '#3b82f640' : '#334155') }}>
      <button
        onClick={() => setOpenId(isOpen ? null : id)}
        style={{ width: '100%', background: 'none', border: 'none', color: '#e2e8f0', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 500 }}
      >
        {title}
        <span style={{ color: isOpen ? '#3b82f6' : '#64748b' }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 16px 14px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '10px', maxWidth: '380px', width: '100%' }}>
      <Accordion>
        <AccordionItem id="jsx" title="What is JSX?">
          JSX is syntactic sugar over React.createElement. Babel compiles it before the browser sees it.
        </AccordionItem>
        <AccordionItem id="state" title="What is State?">
          State is mutable data owned by a component. Changing it triggers a re-render.
        </AccordionItem>
        <AccordionItem id="hooks" title="What are Hooks?">
          Hooks let you use React features like state and effects inside function components.
        </AccordionItem>
      </Accordion>
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
      id: 'cp-internal-context'
    },
    {
      type: 'narration',
      id: 'static-properties',
      text: "Attaching sub-components as static properties on the parent (Tabs.Tab, Tabs.Panel) keeps the API namespaced. It's just JavaScript property assignment on a function. The benefit: imports are one line — `import { Tabs } from './Tabs'` — and the component hierarchy is visually obvious in JSX.",
      code: `const { useState, createContext, useContext } = React

// Static properties keep the API clean and co-located
const MenuCtx = createContext(null)

function Menu({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <MenuCtx.Provider value={{ open, setOpen }}>
      <div style={{ position: 'relative', display: 'inline-block', fontFamily: 'sans-serif' }}>
        {children}
      </div>
    </MenuCtx.Provider>
  )
}

Menu.Trigger = function Trigger({ children }) {
  const { setOpen } = useContext(MenuCtx)
  return (
    <button onClick={() => setOpen(o => !o)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
      {children}
    </button>
  )
}

Menu.Items = function Items({ children }) {
  const { open } = useContext(MenuCtx)
  if (!open) return null
  return (
    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', minWidth: '160px', zIndex: 10, overflow: 'hidden' }}>
      {children}
    </div>
  )
}

Menu.Item = function Item({ children, onClick }) {
  const { setOpen } = useContext(MenuCtx)
  return (
    <button onClick={() => { onClick?.(); setOpen(false) }} style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: '#e2e8f0', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>
      {children}
    </button>
  )
}

function App() {
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px' }}>
      <h2 style={{ color: '#38bdf8', margin: '0 0 20px', fontSize: '1rem' }}>Compound Menu</h2>
      <Menu>
        <Menu.Trigger>Options ▾</Menu.Trigger>
        <Menu.Items>
          <Menu.Item onClick={() => alert('Profile')}>Profile</Menu.Item>
          <Menu.Item onClick={() => alert('Settings')}>Settings</Menu.Item>
          <Menu.Item onClick={() => alert('Logout')}>Log out</Menu.Item>
        </Menu.Items>
      </Menu>
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
      id: 'when-to-use',
      text: "Use compound components when: multiple sibling elements need shared state, the consumer needs layout flexibility (reorder tabs, put panels anywhere), or the component would otherwise need many configuration props. Avoid them for simple components — a `<Button>` with a few variants doesn't need compound components.",
      code: `const { useState, createContext, useContext } = React

// Good compound component candidate: wizard/stepper
const WizardCtx = createContext(null)

function Wizard({ children, onComplete }) {
  const [step, setStep] = useState(0)
  const steps = React.Children.toArray(children)
  return (
    <WizardCtx.Provider value={{ step, setStep, total: steps.length, onComplete }}>
      <div style={{ fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= step ? '#3b82f6' : '#334155', transition: 'background 0.2s' }} />
          ))}
        </div>
        {steps[step]}
      </div>
    </WizardCtx.Provider>
  )
}

function WizardStep({ title, children }) {
  const { step, setStep, total, onComplete } = useContext(WizardCtx)
  const isLast = step === total - 1
  return (
    <div>
      <h3 style={{ color: '#38bdf8', margin: '0 0 12px' }}>{title}</h3>
      <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>{children}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer' }}>Back</button>}
        <button onClick={() => isLast ? onComplete?.() : setStep(s => s + 1)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          {isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '380px' }}>
      <Wizard onComplete={() => alert('Done!')}>
        <WizardStep title="Step 1: Basics">JSX is HTML-like syntax inside JavaScript files.</WizardStep>
        <WizardStep title="Step 2: Components">Functions that return JSX and can accept props.</WizardStep>
        <WizardStep title="Step 3: State">useState lets components remember values between renders.</WizardStep>
      </Wizard>
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
      id: 'cp-compound-api'
    },
    {
      type: 'challenge',
      id: 'ch-tabs',
      text: "Build a compound `Tabs` component with `Tabs`, `Tabs.List`, `Tabs.Tab`, and `Tabs.Panel` sub-components. Use internal context to share the active tab state. In App, render 3 tabs (Code, Preview, Docs) with corresponding panels. Clicking a tab shows its panel.",
      hint: "const TabsCtx = createContext(null). Tabs holds useState, wraps children in Provider. Tabs.Tab reads context and calls setActive on click. Tabs.Panel returns null if its id !== active.",
      startCode: `const { useState, createContext, useContext } = React

const TabsCtx = createContext(null)

function Tabs({ defaultTab, children }) {
  // Hold active tab state, provide context
}

Tabs.List = function TabList({ children }) {
  return (
    <div style={{ display: 'flex', gap: '4px', background: '#0f172a', padding: '4px', borderRadius: '8px', marginBottom: '16px' }}>
      {children}
    </div>
  )
}

Tabs.Tab = function Tab({ id, children }) {
  // Read context, style based on isActive, call setActive on click
}

Tabs.Panel = function Panel({ id, children }) {
  // Read context, return null if not active
}

function App() {
  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '420px', width: '100%', fontFamily: 'sans-serif' }}>
        <Tabs defaultTab="code">
          <Tabs.List>
            <Tabs.Tab id="code">Code</Tabs.Tab>
            <Tabs.Tab id="preview">Preview</Tabs.Tab>
            <Tabs.Tab id="docs">Docs</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="code">
            <p style={{ color: '#94a3b8' }}>Your code editor goes here.</p>
          </Tabs.Panel>
          <Tabs.Panel id="preview">
            <p style={{ color: '#94a3b8' }}>Live preview renders here.</p>
          </Tabs.Panel>
          <Tabs.Panel id="docs">
            <p style={{ color: '#94a3b8' }}>API documentation lives here.</p>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /createContext/.test(code) &&
          /useContext/.test(code) &&
          /Tabs\.Tab/.test(code) &&
          /Tabs\.Panel/.test(code) &&
          /Provider/.test(code)
      }
    },
    {
      type: 'challenge',
      id: 'ch-accordion',
      text: "Build a compound `Accordion` where only one item can be open at a time. Create `Accordion` (holds state) and `AccordionItem` (reads context, toggles open/closed). Render 3 items. Clicking an open item should close it; clicking a closed one should open it and close the previously open one.",
      hint: "AccordionCtx provides { openId, setOpenId }. In AccordionItem: const isOpen = openId === id; onClick: setOpenId(isOpen ? null : id).",
      startCode: `const { useState, createContext, useContext } = React

const AccordionCtx = createContext(null)

function Accordion({ children }) {
  // Hold openId state, provide context
}

function AccordionItem({ id, title, children }) {
  // Read context, show/hide children based on openId
  const isOpen = false // replace with context check

  return (
    <div style={{ borderBottom: '1px solid #334155' }}>
      <button
        style={{ width: '100%', background: 'none', border: 'none', color: '#e2e8f0', padding: '14px 0', textAlign: 'left', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between' }}
      >
        {title}
        <span style={{ color: '#64748b' }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <p style={{ color: '#94a3b8', margin: '0 0 14px', fontSize: '0.9rem', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
          {children}
        </p>
      )}
    </div>
  )
}

function App() {
  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '10px', maxWidth: '420px', width: '100%' }}>
        <Accordion>
          <AccordionItem id="q1" title="What is React?">
            React is a JavaScript library for building user interfaces with a component model.
          </AccordionItem>
          <AccordionItem id="q2" title="What are hooks?">
            Hooks are functions that let you use React state and lifecycle features in function components.
          </AccordionItem>
          <AccordionItem id="q3" title="What is the virtual DOM?">
            A lightweight copy of the real DOM that React uses to compute minimal updates.
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`,
      validate: (ctx) => {
        const code = ctx.code || ''
        return /createContext/.test(code) &&
          /useContext/.test(code) &&
          /openId/.test(code) &&
          /setOpenId/.test(code)
      }
    }
  ]
}
