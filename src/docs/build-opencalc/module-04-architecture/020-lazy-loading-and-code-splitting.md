# 020 — Lazy Loading and Code Splitting

*Bundle analysis, dynamic imports, and loading code on demand*

---

## What You Will Build

You will measure the current bundle size, split lab components into separate chunks using dynamic imports, and verify that lab code only loads when the user navigates to that lab. The browser's Network tab will show the separate chunk loading.

---

## What You Need to Know First

Lesson 007 — Build Tools and the Dev Server. Vite produces the bundle.

Lesson 019 — React Router. Routes are where you apply lazy loading.

---

## The Lesson

### Why bundle size matters

From lesson 018: the initial JavaScript bundle must load before anything renders. A user visiting the home page does not need the calculator component, the robot arm simulation, or any other lab. But if all labs are imported at the top of `App.jsx`:

```javascript
import Calculator       from './Calculator.jsx'
import RobotArmSim      from './labs/RobotArmSim.jsx'
import SpaceInvaders    from './labs/SpaceInvaders.jsx'
import LinearAlgebra    from './labs/LinearAlgebra.jsx'
```

All four labs are included in the initial bundle. The user downloads code they may never use.

For the open-calc platform with 30+ labs (each potentially hundreds of kilobytes for simulation code), eager loading all labs means the initial bundle could be multiple megabytes. On a mobile connection, this could take 10 seconds to download — violating the non-functional requirement from lesson 001.

---

**CS lens — the module graph and bundle analysis:**

In lesson 005, you learned that the module graph is a directed dependency graph: each import statement is an edge from the importing module to the imported module. The build tool (Vite/webpack) traverses this graph to find all code that must be included in the bundle.

A **bundle** is the output of traversing the module graph: all reachable modules concatenated into one (or a few) JavaScript files.

**Code splitting** divides the module graph into multiple chunks. The initial chunk contains only code reachable from the entry point via synchronous imports. Additional chunks contain code reachable only via dynamic (async) imports. The browser downloads the initial chunk first; additional chunks are downloaded on demand.

The split point is the dynamic import: `import('./Component.jsx')`. This creates a **split boundary** in the graph — Vite puts everything reachable from `./Component.jsx` into a separate chunk.

---

### Measure the current bundle

Run the production build:

```bash
npm run build
```

Vite outputs to `dist/`. Examine the output:

```
dist/
├── index.html
└── assets/
    ├── index-[hash].js      ← main bundle
    ├── index-[hash].css     ← styles (if any)
    └── [other chunks].js
```

The `[hash]` is a content hash — a fingerprint of the file's content. If the file changes, the hash changes. This enables long-term browser caching: the file name changes when the content changes, so browsers can safely cache files indefinitely.

Check the main bundle size:

```bash
ls -lh dist/assets/*.js
```

With all lab components imported eagerly, this file grows with every lab added. With code splitting, the main bundle stays small; each lab is a separate chunk downloaded only when needed.

---

**SE lens — the performance budget:**

A **performance budget** is a constraint on a measurable performance metric. For the platform: "any lab loads within 2 seconds on a 4G connection." A 4G connection delivers roughly 5 Mbps = 625 KB/s. In 2 seconds, a browser can download 1.25 MB. This is the budget for the initial load of any lab.

Code splitting is how you stay within this budget. The initial page load delivers only the shell code (small). Each lab loads only its own code (isolated). Labs with large simulation code (robot arm: potentially 400KB of WASM or physics code) do not affect the initial load of the calculator lab.

Performance budgets are a design constraint that shapes architectural decisions. Without the budget, lazy loading is optional. With it, lazy loading is mandatory for any lab whose code exceeds a fraction of the budget.

---

### Dynamic imports

JavaScript has a dynamic `import()` function (not the same as the `import` declaration at the top of the file):

```javascript
// Static import — always loaded at module parse time
import Calculator from './Calculator.jsx'

// Dynamic import — returns a Promise, loaded when called
const { default: Calculator } = await import('./Calculator.jsx')
```

`import('./Calculator.jsx')` returns a Promise that resolves to the module's exports when the module is loaded. The `default` property is the default export. Destructuring and renaming in one step: `const { default: Calculator } = ...`.

Vite sees `import('./Calculator.jsx')` and creates a separate chunk for `Calculator.jsx` and all its dependencies.

---

**CS lens — promises and asynchronous loading:**

`import()` is asynchronous — it returns a Promise. The browser must:
1. Request the chunk file from the server
2. Download it
3. Parse and execute the JavaScript
4. Resolve the Promise with the module exports

This takes time (one network round trip). While waiting, the UI can show a loading indicator.

React's `lazy` and `Suspense` provide a declarative way to handle this:

```jsx
const Calculator = React.lazy(() => import('./Calculator.jsx'))

<Suspense fallback={<div>Loading...</div>}>
  <Calculator />
</Suspense>
```

`React.lazy(() => import('./path'))` — takes a function that returns a dynamic import Promise. Returns a lazy component that loads the actual component only when it first renders.

`<Suspense fallback={...}>` — a boundary that shows the `fallback` UI while any lazy component inside it is loading. When the lazy component finishes loading, the fallback disappears and the component renders.

---

### Apply lazy loading to lab routes

Update `src/App.jsx` to lazily load lab components:

```jsx
// src/App.jsx

import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useMemo, lazy, Suspense } from 'react'
import AppShell     from './AppShell.jsx'
import AppHeader    from './AppHeader.jsx'
import ContentArea  from './ContentArea.jsx'
import Card         from './Card.jsx'
import LabCard      from './LabCard.jsx'

// ---- Lazy imports for lab components ----
// Each import() creates a separate chunk in the build output.
// The chunk loads only when the user navigates to that lab.

const Calculator = lazy(() => import('./Calculator.jsx'))

// Note: other labs do not have implementations yet.
// When they are added, their imports go here:
// const RobotArmSim   = lazy(() => import('./labs/RobotArmSim.jsx'))
// const RubiksCube    = lazy(() => import('./labs/RubiksCube.jsx'))

const labs = [
  { id: 'calculator',     title: 'Calculator',              description: 'A working calculator with history and statistics.',    category: 'code',  difficulty: 'beginner'     },
  { id: 'robot-arm',      title: 'Robot Arm Simulator',     description: 'Program a 3-axis robot arm using MATLAB and Python.', category: 'code',  difficulty: 'intermediate' },
  { id: 'rubiks-cube',    title: "Rubik's Cube Solver",     description: "Explore group theory through the Rubik's Cube.",      category: 'math',  difficulty: 'advanced'     },
  { id: 'linear-algebra', title: 'Linear Algebra Visualiser', description: 'See matrix operations visualised in real time.',    category: 'math',  difficulty: 'beginner'     },
]

// ---- Lab component registry (preview of lesson 022) ----
// Maps lab IDs to their lazy-loaded components
const labComponents = {
  'calculator': Calculator,
}

// ---- Loading fallback ----
function LabLoader() {
  return (
    <div style={{
      padding: '80px 24px',
      textAlign: 'center',
      color: '#999',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e0e0e0',
        borderTopColor: '#1a1a2e',
        borderRadius: '50%',
        margin: '0 auto 16px',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ margin: 0 }}>Loading lab...</p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ---- Page components ----

function HomePage() {
  const navigate = useNavigate()
  return (
    <Card padding="32px" elevation="raised">
      <h1 style={{ margin: '0 0 12px', fontSize: '28px' }}>my-platform</h1>
      <p style={{ margin: '0 0 24px', color: '#666', lineHeight: 1.6, maxWidth: '480px' }}>
        An interactive learning platform for mathematics, science, and computer science.
      </p>
      <button
        onClick={() => navigate('/labs')}
        style={{ padding: '12px 24px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}
      >
        Browse Labs
      </button>
    </Card>
  )
}

function LabsPage() {
  const navigate = useNavigate()
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
  const { id }   = useParams()
  const navigate = useNavigate()
  const lab      = useMemo(() => labs.find((l) => l.id === id), [id])
  const LabComponent = labComponents[id]

  if (lab === undefined) {
    return (
      <Card padding="32px" elevation="raised">
        <p style={{ color: '#999' }}>Lab not found: {id}</p>
        <button onClick={() => navigate('/labs')} style={{ marginTop: '16px', cursor: 'pointer' }}>← Back to Labs</button>
      </Card>
    )
  }

  return (
    <Card padding="24px 32px" elevation="raised">
      <button
        onClick={() => navigate('/labs')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a2e', fontSize: '14px', padding: 0, marginBottom: '20px' }}
      >
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
            Lab component coming in lesson 022
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
      <p style={{ color: '#666', lineHeight: 1.7 }}>
        my-platform is built as a case study in this lesson series.
      </p>
    </Card>
  )
}

function AppLayout() {
  return (
    <AppShell>
      <AppHeader platformName="my-platform" />
      <ContentArea>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/labs"     element={<LabsPage />} />
          <Route path="/labs/:id" element={<LabPage />} />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="*"         element={<HomePage />} />
        </Routes>
      </ContentArea>
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

**Walkthrough:**

`const Calculator = lazy(() => import('./Calculator.jsx'))` — `lazy` takes a factory function that returns a dynamic import. The factory is not called immediately — it is called when `<Calculator>` first renders. The result (after the Promise resolves) is the Calculator component.

`const labComponents = { 'calculator': Calculator }` — a preview of the lab registry pattern from lesson 022. Maps lab IDs to their lazy-loaded components. `labComponents[id]` looks up the component for the current lab. If `undefined` (lab exists in the list but has no component yet), shows the "coming in lesson 022" placeholder.

`<Suspense fallback={<LabLoader />}>` — wraps any lazy component that might be loading. While `Calculator` is downloading, `<LabLoader>` renders. When the download completes, `<Calculator>` renders.

The spinning animation in `<LabLoader>`:

```jsx
<div style={{
  width: '32px',
  height: '32px',
  border: '3px solid #e0e0e0',
  borderTopColor: '#1a1a2e',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}} />
<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
```

A CSS animation defined inline with a `<style>` tag inside JSX. The `@keyframes spin` defines the animation: a full 360-degree rotation. `animation: 'spin 0.8s linear infinite'` applies it: 0.8 seconds per rotation, constant speed, indefinitely. The element has a solid border on three sides and a coloured border on the top — as it rotates, this produces the spinner effect.

`borderTopColor: '#1a1a2e'` — only the top border has a dark colour. The other three sides are `#e0e0e0` (light grey). As the element rotates, the dark segment visually "spins."

---

### Verify code splitting works

Run the production build:

```bash
npm run build
```

Check the `dist/assets/` directory. You should see two JavaScript files where there was previously one:

```
dist/assets/
├── index-[hash].js          ← main bundle (small)
└── Calculator-[hash].js     ← calculator chunk (separate)
```

The main bundle should be smaller than before. The calculator code is now in its own file.

To verify lazy loading in the browser:
1. `npm run preview` — serves the production build locally
2. Open `localhost:4173`
3. Open browser Developer Tools → Network tab
4. Filter to "JS" files
5. Load the home page — only the main bundle loads
6. Navigate to `/labs/calculator` — the `Calculator-[hash].js` chunk loads at this moment

This confirms that calculator code is not downloaded until the user explicitly navigates to the calculator lab.

---

**CS lens — prefetching:**

A performance optimisation beyond lazy loading: **prefetching** the next likely chunk before the user navigates. Vite supports `/* @vite-ignore */` and link rel="prefetch" strategies.

A simpler approach: on hover over a lab card, start loading the chunk:

```jsx
// In LabCard — trigger prefetch on hover
<div onMouseEnter={() => {
  const component = labComponents[lab.id]
  if (component?._payload?.status === 0) {
    // Status 0 = not yet loaded — trigger load
    import(`./labs/${lab.id}.jsx`)
  }
}}>
```

This is implementation-specific and not recommended for production without the proper API. The standard approach is to use React Router's `loader` API (React Router 6.4+) for data prefetching, or to use a Link element that React Router automatically prefetches on hover.

The principle: lazy loading avoids loading code you may never need. Prefetching loads code you are likely to need, before the user explicitly requests it. Both reduce perceived latency through different mechanisms.

---

**SE lens — the trade-off: simplicity vs performance:**

Code splitting adds complexity:
- `lazy()` and `Suspense` are new concepts
- Loading states must be handled
- Error boundaries must be considered (what if the chunk fails to download?)
- Build output has more files to manage

The justification: the alternative (one large bundle) eventually becomes untenable. When 30 labs are registered, the initial bundle would be enormous without splitting. Code splitting is an architectural investment — pay complexity now to avoid a performance ceiling later.

The right threshold: split when the bundle causes measurable user impact. For this project, measure with the production build and a realistic network throttle (4G = 10-50ms latency, 5-12 Mbps). If the calculator lab loads in under 2 seconds on a throttled connection without splitting, splitting is not yet necessary.

For the platform with real labs (Robot Arm: WebAssembly, Space Invaders: canvas rendering code), splitting is the right default from the start.

---

## Connect the Pieces

**Connection to lesson 007:** The Vite build produces separate chunks instead of one bundle. This is `vite build`'s code splitting, triggered by dynamic imports.

**Connection to lesson 019:** Route-level lazy loading is the most impactful application of code splitting — the main entry point for each URL segment.

**Connection to lesson 022:** The `labComponents` registry preview here becomes the registry system in lesson 022. Each lab registers itself with a lazy-loaded component reference.

---

## What Breaks Without This

**Missing `<Suspense>` around a lazy component:**

```jsx
const Calculator = lazy(() => import('./Calculator.jsx'))

function LabPage() {
  // Missing Suspense wrapper
  return <Calculator />
}
```

```
Error: A component suspended while rendering, but no fallback UI was specified.
Add a <Suspense> fallback to the tree above the component that suspended.
```

React cannot render a lazy component that has not yet loaded. It "suspends" — pauses the render and throws to the nearest `<Suspense>` boundary. If no `<Suspense>` exists, the error propagates to the nearest error boundary or crashes the app.

**Loading a chunk in a loop:**

```jsx
// This creates many chunks, one per lab
labs.map((lab) => import(`./labs/${lab.id}.jsx`))
```

Dynamic imports with template literals are supported by Vite, but they create one chunk per variation. For 30 labs, this creates 30 network requests on the first load. Better to group related code into one chunk per logical feature area.

**Wrong import path in lazy:**

```javascript
const Calculator = lazy(() => import('./Calculater.jsx'))  // typo
```

The error is not caught at build time (unlike static imports, which fail to build). The error surfaces when the user navigates to the calculator lab and the chunk fails to load. An `<ErrorBoundary>` component around `<Suspense>` is the production solution for handling chunk load failures.

---

## Definition of Done

- [ ] `Calculator` is imported with `lazy(() => import('./Calculator.jsx'))` not a static import
- [ ] `<Suspense fallback={<LabLoader />}>` wraps the `<LabComponent>` in `LabPage`
- [ ] `npm run build` produces at least two JS files in `dist/assets/`
- [ ] The Calculator chunk file is smaller than the main bundle
- [ ] `npm run preview` → Network tab shows the calculator chunk loading only when navigating to the calculator lab
- [ ] The loading spinner shows briefly when first navigating to the calculator (may be instantaneous in dev)
- [ ] You can explain what a dynamic import does and how it differs from a static import
- [ ] You can explain what a code split "chunk" is
- [ ] You can explain why `<Suspense>` is required with lazy components
- [ ] You can explain the prefetching concept as distinct from lazy loading
- [ ] Git commit:
  ```
  git add src/App.jsx
  git commit -m "Apply lazy loading and Suspense to lab routes

  Calculator imported with React.lazy instead of static import.
  Suspense with LabLoader spinner wraps the lazy component.
  npm run build now produces a separate Calculator chunk.
  Bundle analysis confirms calculator code excluded from initial load."
  ```
