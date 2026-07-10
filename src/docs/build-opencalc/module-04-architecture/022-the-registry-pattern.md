# 022 — The Registry Pattern

*Decoupling the shell from its content, modules registering themselves, and adding labs without touching the shell*

---

## What You Will Build

You will build a lab registry: a central lookup that maps lab IDs to their components and metadata. You will register the Calculator lab in the registry. The shell reads the registry — without knowing which labs exist or how many. Adding a new lab means adding one entry to the registry. The shell does not change.

This is the architectural pattern that makes the real open-calc platform extensible.

---

## What You Need to Know First

Lesson 021 — The App Shell Pattern. The shell is the persistent outer structure.

Lesson 020 — Lazy Loading. Lab components are lazy-loaded chunks.

Lesson 019 — React Router. The URL parameter `:id` identifies the current lab.

---

## The Lesson

### The current problem

In `LabPage`, the component selection is hardcoded:

```jsx
{lab.id === 'calculator'
  ? <Calculator />
  : <div>Lab component coming in lesson 022</div>
}
```

Adding a second lab requires adding another `else if` condition. Adding ten labs requires ten conditions. The `LabPage` component grows with every new lab. Worse: `LabPage` imports every lab, creating direct dependencies between the shell and every lab. The module graph looks like:

```
App.jsx → LabPage → Calculator.jsx
                  → RobotArmSim.jsx
                  → SpaceInvaders.jsx
                  → ...
```

Every lab is a dependency of `LabPage`. Every lab developer who wants to add a lab must modify `LabPage`. This is a violation of the **open/closed principle** from lesson 012: `LabPage` is not closed for modification.

---

**CS lens — the registry pattern:**

A **registry** is a data structure that maps identifiers to implementations. It enables a **plugin** or **extensible** architecture: new implementations can be registered without modifying the consumer.

Common registries in software:
- **Operating system**: file format associations (`.jpg` → the image viewer application)
- **Dependency injection containers**: service names mapped to implementations
- **React component libraries**: component registries used by design systems
- **Express/Koa**: route registries (URL patterns mapped to handler functions)

The pattern has two participants:
- **The registry** — a central lookup table, initially empty, populated at startup
- **Registrants** — modules that register themselves into the registry at load time

The consumer (the shell, in this case) reads from the registry without knowing which registrants are present.

---

**SE lens — inverting the dependency:**

In the current (pre-registry) implementation, `LabPage` depends on `Calculator`:

```
LabPage → Calculator (direct import)
```

With the registry, the dependency is inverted:

```
Calculator → Registry (registers itself)
LabPage    → Registry (reads the component)
```

`LabPage` depends on the registry, not on `Calculator`. `Calculator` depends on the registry (to register). They never depend on each other.

This is the **Dependency Inversion Principle**: high-level modules should not depend on low-level modules. Both should depend on abstractions (the registry). The registry is the abstraction.

The practical result: adding `RobotArmSim.jsx` does not require modifying `LabPage`. `RobotArmSim.jsx` imports the registry and calls `register()`. The shell automatically handles it.

---

### Build the registry

Create `src/registry.js`:

```javascript
// src/registry.js
//
// Lab registry: maps lab IDs to their registration records.
//
// The shell reads the registry to find the component for the current URL.
// Labs add themselves to the registry at module load time.
//
// The shell has ZERO direct imports from any lab.
// Labs have ONE import: from registry.js.
// registry.js imports NOTHING from any lab.

const registry = new Map()

export function register({ id, component, metadata }) {
  if (registry.has(id)) {
    console.warn(`[Registry] Duplicate registration for id: "${id}". Skipping.`)
    return
  }
  registry.set(id, { component, metadata })
}

export function getComponent(id) {
  return registry.get(id)?.component ?? null
}

export function getMetadata(id) {
  return registry.get(id)?.metadata ?? null
}

export function getAllLabs() {
  return Array.from(registry.entries()).map(([id, { metadata }]) => ({
    id,
    ...metadata,
  }))
}
```

**Walkthrough:**

`const registry = new Map()` — a `Map` is a key-value data structure that accepts any type as a key (unlike a plain object, which coerces keys to strings). Here keys are lab ID strings and values are `{ component, metadata }` objects. `Map` preserves insertion order, which means `getAllLabs()` returns labs in the order they were registered.

`new Map()` at module scope — the registry is a module-level singleton. When `registry.js` is imported, JavaScript's module system guarantees it is executed once. Every importer shares the same `registry` instance. This is the **singleton pattern**: one instance, shared by all consumers.

`export function register({ id, component, metadata })` — the registration API. Destructures the registration record. Takes:
- `id` — the URL slug (matches the `:id` parameter in `/labs/:id`)
- `component` — the React component (lazy-loaded, for code splitting)
- `metadata` — display information: `{ title, description, category, difficulty }`

`if (registry.has(id))` — guard against duplicate registration. If the same ID is registered twice (a module imported in two places), log a warning and skip. The first registration wins. This prevents accidental overwriting.

`export function getComponent(id)` — public API for the shell. Returns the component or `null`. The shell checks for `null` to render a "lab not found" message.

`export function getAllLabs()` — returns all registered labs as an array, suitable for rendering the lab gallery. This is how the gallery populates without knowing which labs exist.

---

### Register the Calculator lab

Create `src/labs/calculator/index.jsx` (or update the existing path):

First, move the Calculator component to a labs directory:

```bash
mkdir -p src/labs/calculator
```

Create `src/labs/calculator/index.jsx` with the Calculator component content from lesson 016. Then register it:

```javascript
// At the bottom of src/labs/calculator/index.jsx

import { register } from '../../registry.js'

// Self-registration — runs when this module is imported
register({
  id: 'calculator',
  component: lazy(() => import('./Calculator.jsx')),
  metadata: {
    title:       'Calculator',
    description: 'A working calculator with history and statistics. Covers useState, useEffect, and derived state.',
    category:    'code',
    difficulty:  'beginner',
  },
})
```

Wait — there is a problem. The component (in the index file) cannot lazily import itself. Self-registration and lazy loading require a small restructuring:

Create `src/labs/calculator/Calculator.jsx` — the actual component (moved from `src/Calculator.jsx`).

Create `src/labs/calculator/index.js` — the registration file:

```javascript
// src/labs/calculator/index.js
//
// Calculator lab registration.
// Import this file to register the lab.
// The lazy import ensures Calculator.jsx is NOT in the initial bundle.

import { lazy }     from 'react'
import { register } from '../../registry.js'

register({
  id: 'calculator',
  component: lazy(() => import('./Calculator.jsx')),
  metadata: {
    title:       'Calculator',
    description: 'A working calculator with history, statistics, and localStorage persistence.',
    category:    'code',
    difficulty:  'beginner',
  },
})
```

---

**CS lens — module execution order:**

When `src/labs/calculator/index.js` is imported, JavaScript executes it:
1. `import { lazy } from 'react'` — React module is loaded (or already cached)
2. `import { register } from '../../registry.js'` — registry module is loaded (or already cached)
3. `register({ id: 'calculator', ... })` — `register` is called immediately

The `lazy()` call wraps the import function but does not execute it. The `() => import('./Calculator.jsx')` factory is stored inside the lazy wrapper. It is not called until `<CalculatorLazy>` first renders.

This is the correct order: the registry entry is created at module load time (synchronous), but the component code loads asynchronously only when needed.

---

### Load lab registrations in main.jsx

The lab registration files must be imported somewhere. They run at import time — they register themselves. The correct place is `main.jsx` (or a dedicated `src/labs/index.js` that imports all registration files):

Create `src/labs/index.js`:

```javascript
// src/labs/index.js
//
// Lab registration loader.
// Importing this file causes all lab self-registrations to run.
// The shell imports this file once; new labs are added here.

// Each import runs the registration code in that file.
// The component itself (e.g., Calculator.jsx) is NOT imported here —
// it is lazy-loaded inside each registration.

import './calculator/index.js'

// Future labs:
// import './robot-arm/index.js'
// import './rubiks-cube/index.js'
// import './space-invaders/index.js'
```

Import it in `src/main.jsx`:

```jsx
// src/main.jsx

import { StrictMode }    from 'react'
import { createRoot }    from 'react-dom/client'
import App               from './App.jsx'
import './labs/index.js'  // Run all lab registrations

const rootElement = document.getElementById('root')
if (rootElement === null) {
  throw new Error('Root element #root not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

---

### Update the shell to use the registry

Update `src/App.jsx` to read from the registry instead of hardcoding:

```jsx
// src/App.jsx
//
// The shell reads labs from the registry.
// No direct imports from any lab component.

import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useMemo, Suspense }  from 'react'
import { getComponent, getAllLabs } from './registry.js'
import AppShell    from './AppShell.jsx'
import AppHeader   from './AppHeader.jsx'
import ContentArea from './ContentArea.jsx'
import Card        from './Card.jsx'
import LabCard     from './LabCard.jsx'
import Sidebar     from './Sidebar.jsx'

function LabLoader() {
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: '#999' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTopColor: '#1a1a2e', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ margin: 0 }}>Loading lab...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()
  return (
    <Card padding="32px" elevation="raised">
      <h1 style={{ margin: '0 0 12px', fontSize: '28px' }}>my-platform</h1>
      <p style={{ margin: '0 0 24px', color: '#666', lineHeight: 1.6 }}>
        An interactive learning platform for mathematics, science, and computer science.
      </p>
      <button onClick={() => navigate('/labs')} style={{ padding: '12px 24px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}>
        Browse Labs
      </button>
    </Card>
  )
}

function LabsPage() {
  const navigate = useNavigate()
  // Read labs from registry — no hardcoded list
  const labs = useMemo(() => getAllLabs(), [])

  return (
    <Card padding="24px 32px" elevation="raised">
      <h1 style={{ margin: '0 0 8px', fontSize: '22px' }}>Labs</h1>
      <p style={{ margin: '0 0 24px', color: '#666' }}>{labs.length} labs available</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {labs.map((lab) => (
          <LabCard
            key={lab.id}
            title={lab.title}
            description={lab.description}
            category={lab.category}
            difficulty={lab.difficulty}
            onLaunch={() => navigate(`/labs/${lab.id}`)}
          />
        ))}
      </div>
    </Card>
  )
}

function LabPage() {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const allLabs        = useMemo(() => getAllLabs(), [])
  const lab            = useMemo(() => allLabs.find((l) => l.id === id), [allLabs, id])
  const LabComponent   = getComponent(id)  // from registry

  if (!lab) {
    return (
      <Card padding="32px" elevation="raised">
        <p style={{ color: '#999' }}>Lab not found: <code>{id}</code></p>
        <button onClick={() => navigate('/labs')} style={{ marginTop: '16px', cursor: 'pointer' }}>← Back to Labs</button>
      </Card>
    )
  }

  return (
    <Card padding="24px 32px" elevation="raised">
      <button onClick={() => navigate('/labs')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a2e', fontSize: '14px', padding: 0, marginBottom: '20px' }}>
        ← Back to Labs
      </button>
      <h1 style={{ margin: '0 0 8px', fontSize: '22px' }}>{lab.title}</h1>
      <p style={{ margin: '0 0 24px', color: '#666' }}>{lab.description}</p>

      {LabComponent
        ? (
          <Suspense fallback={<LabLoader />}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <LabComponent />
            </div>
          </Suspense>
        )
        : (
          <div style={{ padding: '60px 24px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#999' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{lab.title}</p>
            <p style={{ margin: 0, fontSize: '13px' }}>No component registered for this lab yet.</p>
          </div>
        )
      }
    </Card>
  )
}

function AboutPage() {
  return (
    <Card padding="32px" elevation="raised">
      <h1 style={{ margin: '0 0 16px', fontSize: '22px' }}>About</h1>
      <p style={{ color: '#666', lineHeight: 1.7 }}>my-platform is built as a case study in this lesson series.</p>
    </Card>
  )
}

function AppLayout() {
  return (
    <AppShell>
      <AppHeader platformName="my-platform" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <ContentArea>
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/labs"     element={<LabsPage />} />
            <Route path="/labs/:id" element={<LabPage />} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="*"         element={<HomePage />} />
          </Routes>
        </ContentArea>
      </div>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
```

**Key change**: `LabsPage` calls `getAllLabs()` — no hardcoded `labs` array. `LabPage` calls `getComponent(id)` — no `lab.id === 'calculator'` condition.

Adding a new lab: add one line to `src/labs/index.js`. Zero changes to the shell.

---

**CS lens — the module graph after the registry:**

Before the registry:
```
App.jsx → LabPage → Calculator.jsx (direct import)
```

After the registry:
```
main.jsx → labs/index.js → labs/calculator/index.js → registry.js
                                                     → lazy(Calculator.jsx)  [not loaded yet]
App.jsx  → registry.js (reads)
```

The shell (`App.jsx`) and the lab (`Calculator.jsx`) no longer have a path between them in the module graph. They are decoupled. The registry is the intermediary.

This is why the Dependency Inversion Principle matters structurally: the module graph reflects the coupling. Fewer paths between modules = less coupling = easier to change one without affecting the other.

---

## Connect the Pieces

**Connection to lesson 005:** The module system's import mechanism is what makes self-registration work. When `labs/index.js` is imported, `labs/calculator/index.js` runs, which calls `register()`. This is the module graph at work.

**Connection to lesson 020:** Each lab's registration uses `lazy()` — the component loads only when the route is activated. The registry enables lazy loading at the correct granularity: one lazy chunk per lab.

**Connection to lesson 023:** TypeScript makes the registry contract explicit. `register()` accepts `{ id: string, component: React.LazyExoticComponent, metadata: LabMetadata }`. Without TypeScript, passing wrong types is a silent error. With TypeScript, it is a compile error.

---

## What Breaks Without This

**Forgetting to import the registration file:**

If `src/labs/index.js` does not import `./calculator/index.js`, the registry is empty. `getAllLabs()` returns `[]`. The labs page shows "0 labs available." No error — the registry is simply empty.

This is a silent failure. The fix: in development, log when `getAllLabs()` returns an empty array; assert that at least one lab is registered.

**Registering with a duplicate ID:**

```javascript
register({ id: 'calculator', ... })  // in calculator/index.js
register({ id: 'calculator', ... })  // in some-other-file.js (mistake)
```

The guard in `register()` logs a warning and skips the second registration. The first registration wins. Without the guard, the second would silently overwrite the first.

**The component and registration file in the wrong order:**

```javascript
// In calculator/index.js
register({
  id: 'calculator',
  component: lazy(() => import('./Calculator.jsx')),  // correct
  // component: Calculator,  // WRONG — static import, not lazy
})
```

Using a static `Calculator` import (not lazy) puts `Calculator.jsx` in the same chunk as `index.js`. Since `index.js` is imported by `main.jsx` (synchronously), `Calculator.jsx` is in the initial bundle — defeating the purpose of the registry. Always use `lazy()` for the component in registry entries.

---

## Definition of Done

- [ ] `src/registry.js` exists with `register`, `getComponent`, `getMetadata`, `getAllLabs`
- [ ] `src/labs/index.js` exists and imports `./calculator/index.js`
- [ ] `src/labs/calculator/index.js` exists and calls `register()` with lazy component
- [ ] `src/main.jsx` imports `./labs/index.js`
- [ ] `LabsPage` uses `getAllLabs()` — no hardcoded labs array in `App.jsx`
- [ ] `LabPage` uses `getComponent(id)` — no `lab.id === 'calculator'` condition
- [ ] The calculator lab appears in the gallery and works when launched
- [ ] You can explain the dependency inversion: which file depends on which
- [ ] You can explain why the component in the registry must use `lazy()`, not a static import
- [ ] You can explain what happens if the registration file is never imported
- [ ] Git commit:
  ```
  git add src/registry.js src/labs/ src/main.jsx src/App.jsx
  git commit -m "Add lab registry for extensible shell-lab decoupling

  registry.js: Map of id → {component, metadata}; register/getComponent/getAllLabs.
  labs/calculator/index.js: self-registers with lazy component.
  labs/index.js: single import point for all registrations.
  App.jsx: no direct lab imports; reads from registry.
  Adding a new lab = one line in labs/index.js. Shell unchanged."
  ```
