# 019 — React Router

*Declarative routing, URL params, the Link component, and replacing the manual History API*

---

## What You Will Build

You will replace the manual SPA navigation from lesson 018 with React Router. The routes `GET /`, `/labs`, `/labs/:id`, and `/about` will be declared in JSX. The URL parameter `:id` will be read with a hook. Navigation will use `<Link>` instead of `<a>` with `preventDefault`. The History API is still used under the hood — React Router just manages it.

---

## What You Need to Know First

Lesson 018 — Single-Page Applications. You know what `pushState` does and why SPAs need URL synchronisation.

Lesson 007 — Build Tools and the Dev Server. You need to configure Vite to serve `index.html` for all routes.

---

## The Lesson

### What React Router provides

From lesson 018: the manual implementation required:
- A `navigate` function that called `pushState` and `setRoute`
- A `popstate` listener for back/forward buttons
- `getRouteFromURL()` to parse the current URL
- Passing `onNavigate` props down the component tree
- `e.preventDefault()` on every navigation link

React Router encapsulates all of this behind three primitives:
- `<BrowserRouter>` — a context provider that reads the URL and provides routing context to all descendant components
- `<Routes>` + `<Route>` — declarative route definitions matching URL patterns to components
- `<Link to="...">` — a component that renders an anchor but intercepts clicks for SPA navigation
- Hooks: `useNavigate` (programmatic navigation), `useParams` (URL parameters), `useLocation` (current URL)

---

**CS lens — routing as pattern matching:**

URL routing is a **pattern matching** problem: given a URL string, find the matching route definition. React Router implements this with a declarative pattern syntax:

- `/labs` — exact match
- `/labs/:id` — matches `/labs/calculator`, `/labs/robot-arm`, etc. The `:id` is a **named parameter** — a variable segment of the URL
- `*` — a wildcard that matches anything (used for 404 pages)
- `/labs/*` — matches any URL starting with `/labs/`

React Router compares each route's pattern against the current URL, collecting the best match. "Best match" uses specificity: more specific patterns (more segments, exact segments vs params) win over less specific ones.

This is the same concept as CSS selector specificity: multiple patterns can apply, but the most specific wins.

---

### Install React Router

```bash
npm install react-router-dom
```

`react-router-dom` — the browser-specific React Router package. There is also `react-router-native` for React Native. Both share the same core (`react-router`); the `dom` version adds browser-specific components (`<Link>`, `<BrowserRouter>`).

---

### Configure Vite for SPA routing

The problem: when a user visits `localhost:5173/labs` directly (typed in the address bar or from a bookmark), the dev server tries to find a file at `src/labs` — which does not exist. It returns a 404.

Add `historyApiFallback` to `vite.config.js`:

```javascript
// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
})
```

`server.historyApiFallback: true` — when the dev server receives a request for a path that has no corresponding file (like `/labs`), it responds with `index.html` instead of a 404. The browser receives the HTML, loads the JavaScript, and React Router reads the URL (`/labs`) and renders the correct component.

For production deployments, the web server (Nginx, Netlify, Vercel) needs equivalent configuration. The common Nginx rule:

```nginx
location / {
  try_files $uri /index.html;
}
```

"Try to serve the requested file; if it does not exist, serve `index.html`."

---

**SE lens — the SPA server configuration contract:**

SPAs require a specific server configuration: serve `index.html` for all paths. This is a deployment requirement that must be documented and implemented for every hosting environment.

Without it, sharing a link like `localhost:5173/labs/calculator` would fail for the recipient — they would get a 404 from the server before the JavaScript could load and handle the URL. The URL is "correct" in the SPA sense (the app knows how to render it) but the server does not know that.

This is why the server configuration is part of the SPA contract, not an optional detail. The app's routing assumes the server will always return `index.html`, regardless of path.

---

### Update App.jsx with React Router

```jsx
// src/App.jsx

import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import AppShell     from './AppShell.jsx'
import AppHeader    from './AppHeader.jsx'
import ContentArea  from './ContentArea.jsx'
import Card         from './Card.jsx'
import LabCard      from './LabCard.jsx'
import Calculator   from './Calculator.jsx'

const labs = [
  { id: 'calculator',     title: 'Calculator',              description: 'A working calculator with history and statistics.',       category: 'code',    difficulty: 'beginner'     },
  { id: 'robot-arm',      title: 'Robot Arm Simulator',     description: 'Program a 3-axis robot arm using MATLAB and Python.',    category: 'code',    difficulty: 'intermediate' },
  { id: 'rubiks-cube',    title: "Rubik's Cube Solver",     description: "Explore group theory through the Rubik's Cube.",         category: 'math',    difficulty: 'advanced'     },
  { id: 'linear-algebra', title: 'Linear Algebra Visualiser', description: 'See matrix operations visualised in real time.',       category: 'math',    difficulty: 'beginner'     },
]

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

  if (lab === undefined) {
    return (
      <Card padding="32px" elevation="raised">
        <p style={{ color: '#999' }}>Lab not found: {id}</p>
        <button onClick={() => navigate('/labs')} style={{ marginTop: '16px', cursor: 'pointer' }}>
          ← Back to Labs
        </button>
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

      {lab.id === 'calculator'
        ? <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}><Calculator /></div>
        : <div style={{ padding: '60px 24px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#999' }}>Lab component (lesson 022)</div>
      }
    </Card>
  )
}

function AboutPage() {
  return (
    <Card padding="32px" elevation="raised">
      <h1 style={{ margin: '0 0 16px', fontSize: '22px' }}>About</h1>
      <p style={{ color: '#666', lineHeight: 1.7 }}>
        my-platform is built as a case study in this lesson series. Each feature demonstrates
        a software engineering principle.
      </p>
    </Card>
  )
}

// ---- Shell component with routing ----

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

`<BrowserRouter>` — the outermost component, wrapping everything. It reads the current URL from `window.location`, subscribes to URL changes (back/forward buttons), and provides this information to all descendant components through React context. All React Router hooks (`useNavigate`, `useParams`, `useLocation`) require `<BrowserRouter>` to be an ancestor in the tree.

`<Routes>` — renders the first `<Route>` whose `path` matches the current URL. Only one `<Route>` renders at a time.

`<Route path="/labs/:id" element={<LabPage />} />` — declares a route. `path` is the URL pattern; `element` is what renders when the pattern matches. `:id` is a named URL parameter — its value is available inside `LabPage` via `useParams`.

`const { id } = useParams()` — inside `LabPage`, reads the `:id` parameter from the current URL. If the URL is `/labs/calculator`, `id` is `'calculator'`. `useParams` returns an object with all named parameters; destructuring extracts `id`.

`const navigate = useNavigate()` — returns a function that performs programmatic navigation. Calling `navigate('/labs')` is equivalent to calling `pushState` + updating the route state from lesson 018. React Router handles both internally.

`useMemo(() => labs.find((l) => l.id === id), [id])` — memoised lab lookup. `id` changes when the route changes. The find runs only when `id` changes (not on every render).

`<Route path="*" element={<HomePage />} />` — a catch-all route. Any URL not matched by the preceding routes renders `<HomePage>`. This is the 404 handler — in a production app, this would render a 404 page instead.

---

### Update AppHeader to use Link

Update `src/AppHeader.jsx` to use React Router's `<Link>`:

```jsx
// src/AppHeader.jsx

import { Link, useLocation } from 'react-router-dom'

export default function AppHeader({ platformName = 'my-platform', activeLabName = null }) {
  const location = useLocation()

  function navLink(to, label) {
    const isActive = location.pathname === to || (to === '/labs' && location.pathname.startsWith('/labs'))

    return (
      <Link
        to={to}
        style={{
          color: isActive ? '#fff' : '#aaa',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {label}
      </Link>
    )
  }

  return (
    <header style={{ background: '#1a1a2e', color: '#fff', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px', color: '#fff', textDecoration: 'none' }}>
          {platformName}
        </Link>
        {activeLabName !== null && (
          <>
            <span style={{ color: '#555' }}>›</span>
            <span style={{ fontSize: '15px', color: '#ccc' }}>{activeLabName}</span>
          </>
        )}
      </div>
      <nav style={{ display: 'flex', gap: '20px' }}>
        {navLink('/',      'Home')}
        {navLink('/labs',  'Labs')}
        {navLink('/about', 'About')}
      </nav>
    </header>
  )
}
```

**Walkthrough:**

`import { Link, useLocation } from 'react-router-dom'` — imports two React Router exports:
- `Link` — a component that renders an anchor but intercepts clicks for SPA navigation (no `e.preventDefault()` needed — React Router handles it internally)
- `useLocation` — a hook that returns the current location object: `{ pathname, search, hash, state, key }`

`const location = useLocation()` — reads the current URL location. `location.pathname` is the path portion of the URL: `/`, `/labs`, `/labs/calculator`, etc. React Router re-renders this component when the URL changes, so `location` is always current.

`const isActive = location.pathname === to || (to === '/labs' && location.pathname.startsWith('/labs'))` — determines if this link points to the current page. The `/labs` case is active for any URL starting with `/labs` (including `/labs/calculator`), since the user is "in the labs section."

`<Link to="/labs">Labs</Link>` — renders as `<a href="/labs">Labs</a>` in the DOM but intercepts clicks: instead of a page reload, it calls `pushState` internally and updates the React Router context. The browser history stack is updated; the back button works.

---

**CS lens — context and the provider-consumer pattern:**

`<BrowserRouter>` is a **context provider** — it stores the current URL in React context, and all descendant components that use React Router hooks are **consumers** of that context.

React context is a mechanism for sharing values across a component tree without passing them as props through every intermediate component. `BrowserRouter` stores the location; `AppHeader` reads it via `useLocation()`; `LabPage` reads URL params via `useParams()` — neither component receives the URL as a prop. They consume it from context.

The React Context API:
- `React.createContext(defaultValue)` — creates a context object
- `<Context.Provider value={...}>` — provides a value to all descendants
- `useContext(Context)` — reads the value in a descendant

React Router builds its routing context on top of this API. Lesson 022 uses context directly for the lab registry.

---

**SE lens — declarative routing as a specification:**

The `<Routes>` block is a specification of the application's URL structure:

```jsx
<Routes>
  <Route path="/"         element={<HomePage />} />
  <Route path="/labs"     element={<LabsPage />} />
  <Route path="/labs/:id" element={<LabPage />} />
  <Route path="/about"    element={<AboutPage />} />
  <Route path="*"         element={<HomePage />} />
</Routes>
```

Reading this, you know every valid URL the application supports and what renders for each. This is the application's URL contract — what URLs exist, what they display, and how they are parameterised.

This specification is more readable and maintainable than the manual `getRouteFromURL` function from lesson 018. Adding a new route is one new `<Route>` line. Renaming a route changes one `path` prop. The structure is immediately clear to any developer reading the code for the first time.

---

## Connect the Pieces

**Connection to lesson 018:** Every mechanism React Router uses internally is the History API from lesson 018. `<Link>` calls `pushState`. `<BrowserRouter>` listens for `popstate`. The abstraction is built on the same browser primitives.

**Connection to lesson 021:** The `AppLayout` component (shell + routes) is the app shell pattern. The shell renders once; the `<Routes>` content changes with the URL. Lesson 021 formalises this.

**Connection to lesson 022:** The lab registry (lesson 022) will replace the hardcoded `lab.id === 'calculator'` check in `LabPage`. Instead, the registry will provide the correct component for each lab ID, loaded on demand.

**Connection to lesson 020:** `<Route path="/labs/:id" element={<LabPage />} />` currently loads the `Calculator` component eagerly (it is imported at the top of the file). Lesson 020 replaces it with a lazy import so lab code only loads when the user navigates to that lab.

---

## What Breaks Without This

**Hooks outside the router context:**

```jsx
// In index.jsx — wrong order
import App from './App.jsx'

createRoot(root).render(<App />)
```

```jsx
// In App.jsx — BrowserRouter is wrapping AppHeader
function App() {
  return (
    <AppHeader />  // AppHeader uses useLocation() — but no BrowserRouter above it!
    <BrowserRouter>...</BrowserRouter>
  )
}
```

```
Error: useLocation() may be used only in the context of a <Router> component.
```

`useLocation`, `useNavigate`, `useParams`, and all React Router hooks require `<BrowserRouter>` (or another router) to be a parent in the component tree. The hooks read from the router's React context; without a provider, the context value is `undefined` and the hook throws.

**`<Link>` outside the router:**

Same error. `<Link>` also reads from the router context to call `navigate`. `<Link>` and all React Router components must be inside a `<BrowserRouter>`.

**Accessing `id` before null check:**

```jsx
function LabPage() {
  const { id } = useParams()
  const lab = labs.find((l) => l.id === id)

  // lab can be undefined if id doesn't match any lab
  return <h1>{lab.title}</h1>  // TypeError: Cannot read properties of undefined
}
```

Always guard against `undefined` after `find`:

```jsx
if (lab === undefined) return <NotFoundPage />
return <h1>{lab.title}</h1>
```

---

## Definition of Done

- [ ] `react-router-dom` is installed and in `package.json`
- [ ] `vite.config.js` has `server: { historyApiFallback: true }`
- [ ] `src/App.jsx` wraps `AppLayout` in `<BrowserRouter>`
- [ ] `<Routes>` declares routes for `/`, `/labs`, `/labs/:id`, `/about`, and `*`
- [ ] `<LabPage>` reads the lab ID via `useParams()`
- [ ] `<AppHeader>` uses `<Link>` for navigation and `useLocation` for active state
- [ ] Navigating between all four pages works without page reloads
- [ ] Visiting `localhost:5173/labs` directly shows the labs page (Vite fallback)
- [ ] Browser back and forward buttons work correctly
- [ ] Active nav links are highlighted based on `location.pathname`
- [ ] You can explain what `<BrowserRouter>` does (the context provider)
- [ ] You can explain how `:id` in a route path becomes accessible in `useParams()`
- [ ] You can explain why `<Link>` does not need `e.preventDefault()`
- [ ] Git commit:
  ```
  git add package.json package-lock.json vite.config.js src/App.jsx src/AppHeader.jsx
  git commit -m "Replace manual History API routing with React Router

  BrowserRouter provides URL context to all descendant components.
  Routes + Route declare the URL-to-component mapping declaratively.
  Link handles SPA navigation without e.preventDefault.
  useParams reads :id from /labs/:id; useNavigate for programmatic nav.
  Vite configured with historyApiFallback for direct URL access."
  ```
