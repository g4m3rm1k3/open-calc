# 018 — Single-Page Applications

*What an SPA is, how navigation works without page reloads, and the History API*

---

## What You Will Build

You will implement client-side navigation manually: clicking "Labs", "Home", and "About" in the header updates the URL (using the browser's History API) and renders different content — without any page reload. Then you will understand why React Router (lesson 019) is the standard way to do this.

---

## What You Need to Know First

Lesson 013 — What Is State. Active view determined by state.

Lesson 012 — Component Composition. `AppShell`, `AppHeader`, `ContentArea` exist.

---

## The Lesson

### Traditional navigation vs SPA navigation

**Traditional web navigation (Multi-Page Application, MPA):**

1. User clicks a link: `<a href="/labs">`
2. Browser sends an HTTP GET request to the server for `/labs`
3. Server returns a complete HTML document
4. Browser parses the HTML, fetches CSS and JavaScript, renders the page
5. JavaScript re-initialises from scratch

Total time: one full round trip to the server plus parse-render time. All application state is lost — form inputs, scroll positions, in-memory data. Users experience a white flash between pages.

**Single-page application navigation (SPA):**

1. User clicks a link (or a button styled as a link)
2. JavaScript intercepts the click, reads the target URL
3. JavaScript calls the History API to update the URL bar without reloading
4. A state variable changes to reflect the new route
5. React re-renders with the new route — different components render in `ContentArea`

Total time: one state update, one reconciliation pass, one DOM patch. No network round trip. No white flash. Application state (open calculators, form values) is preserved across navigation.

This is the performance basis for the non-functional requirement from lesson 001: "navigation between previously-visited pages takes under 100ms." Only SPA navigation can achieve this — MPA navigation is bounded by network latency.

---

**CS lens — the client-server model:**

In traditional web applications, the server owns all rendering. The client (browser) is a display terminal — it requests documents, the server generates them, the client renders them.

In an SPA, rendering moves to the client. The server serves one HTML document (the app shell), one CSS file, and one JavaScript bundle — once, at initial load. All subsequent "pages" are rendered entirely by JavaScript running in the browser, using data fetched from APIs as needed.

This is a shift in the client-server boundary:
- **Traditional**: server renders HTML, client displays it
- **SPA**: server provides data (via API), client renders HTML from that data

The trade-offs:
- **SPA advantages**: faster perceived navigation, richer interactions, better offline capability
- **SPA trade-offs**: initial load is larger (must load the full JavaScript bundle), search engine indexing is harder (crawlers may not execute JavaScript), requires careful attention to accessibility and back-button behaviour

---

**SE lens — the SPA and state management complexity:**

SPAs move responsibility from the server to the client. With that responsibility comes complexity.

In a traditional MPA, there is no URL state, no navigation state, no "current page" to track — the URL always matches the HTML returned by the server. In an SPA, the URL and the rendered content are both managed by JavaScript, and they must be kept in sync.

If a user bookmarks `localhost:5173/labs`, they expect that URL to always show the labs page. If they press the browser's back button, they expect it to navigate backward through their history. If they share the URL, the recipient expects to see the same content.

All of this requires careful URL and history management. This is why React Router exists — it handles the synchronisation between URL and rendered content so individual components do not have to.

This lesson shows the manual implementation first. Lesson 019 replaces it with React Router to demonstrate why the abstraction is worth its complexity.

---

### The History API

The browser provides the History API for managing the browser's navigation history without full page reloads.

**`window.history.pushState(state, title, url)`** — adds a new entry to the browser's history stack and updates the URL bar.
- `state` — any JavaScript value, serialised and attached to this history entry. Accessible later via `window.history.state`.
- `title` — currently ignored by all browsers. Pass `''`.
- `url` — the URL to display. Can be a full URL or a path-relative URL. Cannot change the origin (scheme + domain + port) — you cannot use `pushState` to navigate to a different website.

**`window.history.replaceState(state, title, url)`** — replaces the current history entry without adding a new one. Used for the initial route and for redirects.

**`window.onpopstate`** — event fired when the user presses the browser's back or forward button. The event object has a `state` property containing the state from the history entry being navigated to.

Note: `pushState` does not fire `popstate`. The event fires only on user navigation (back/forward), not on programmatic `pushState` calls.

---

**CS lens — the browser history as a stack:**

The browser history is a stack data structure with a current position marker (not strictly a stack in the technical sense, since navigation can go backward — it is more accurately a doubly-linked list with a current pointer).

Operations:
- `pushState` — push a new entry after the current position, discarding entries that were "forward" of the current position. Set current to the new entry.
- `replaceState` — replace the current entry. No addition.
- Back button — move current pointer one position backward.
- Forward button — move current pointer one position forward.

This explains a subtle behaviour: if you navigate A → B → C, then press back twice (returning to A), then navigate to D, the forward entries (B, C) are discarded. The history is now [A, D] with current at D.

---

### Manual SPA implementation

Update `src/App.jsx` to use the History API:

```jsx
// src/App.jsx

import { useState, useEffect } from 'react'
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

// Read the current route from window.location.pathname
// Returns: '/', '/labs', '/about', or '/labs/calculator' etc.
function getRouteFromURL() {
  const path = window.location.pathname

  if (path === '/' || path === '') return { page: 'home', labId: null }

  const labMatch = path.match(/^\/labs\/(.+)$/)
  if (labMatch) return { page: 'lab', labId: labMatch[1] }

  if (path === '/labs')  return { page: 'labs',  labId: null }
  if (path === '/about') return { page: 'about', labId: null }

  return { page: 'home', labId: null }
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromURL)

  // Listen for back/forward navigation
  useEffect(() => {
    function handlePopState() {
      setRoute(getRouteFromURL())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(path) {
    window.history.pushState({}, '', path)
    setRoute(getRouteFromURL())
  }

  // ---- Page components ----

  function HomePage() {
    return (
      <Card padding="32px" elevation="raised">
        <h1 style={{ margin: '0 0 12px', fontSize: '28px' }}>my-platform</h1>
        <p style={{ margin: '0 0 24px', color: '#666', lineHeight: 1.6, maxWidth: '480px' }}>
          An interactive learning platform for mathematics, science, and computer science.
          Each lab combines theory with hands-on exercises.
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

  function LabPage({ labId }) {
    const lab = labs.find((l) => l.id === labId)

    if (lab === undefined) {
      return (
        <Card padding="32px" elevation="raised">
          <p style={{ color: '#999' }}>Lab not found: {labId}</p>
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
          my-platform is built as a case study in this lesson series. Each feature
          demonstrates a software engineering principle. The codebase starts from
          zero (lesson 001) and grows to a full React SPA with routing, state management,
          TypeScript, and a tested component library.
        </p>
      </Card>
    )
  }

  // ---- Active lab for header breadcrumb ----
  const activeLab = route.labId !== null ? labs.find((l) => l.id === route.labId) : null

  // ---- Render the current page ----
  function renderPage() {
    if (route.page === 'home')  return <HomePage />
    if (route.page === 'labs')  return <LabsPage />
    if (route.page === 'about') return <AboutPage />
    if (route.page === 'lab')   return <LabPage labId={route.labId} />
    return <HomePage />
  }

  return (
    <AppShell>
      <AppHeader
        platformName="my-platform"
        activeLabName={activeLab?.title ?? null}
        onNavigate={navigate}
      />
      <ContentArea>
        {renderPage()}
      </ContentArea>
    </AppShell>
  )
}
```

**Walkthrough:**

`const [route, setRoute] = useState(getRouteFromURL)` — lazy initial state: `getRouteFromURL` is called once on first render to read the current URL. Useful when the page is loaded from a bookmarked URL (e.g. `localhost:5173/labs/calculator` directly). The initial route is read from the actual URL, not hardcoded.

`const labMatch = path.match(/^\/labs\/(.+)$/)` — a **regular expression** match. The pattern `/^\/labs\/(.+)$/` matches paths that start with `/labs/` and captures everything after it:
- `^` — asserts start of string
- `\/labs\/` — literal `/labs/`
- `(.+)` — captures one or more characters into group 1
- `$` — asserts end of string

`path.match(regex)` returns `null` if no match, or an array where `match[1]` is the first capture group. The result `labMatch[1]` is the lab ID (e.g., `'calculator'`).

```javascript
useEffect(() => {
  function handlePopState() {
    setRoute(getRouteFromURL())
  }
  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [])
```

This effect runs once on mount. It adds a `popstate` listener to the `window` — fired when the user presses the browser's back or forward button. The cleanup removes the listener when `App` unmounts (which in a real SPA, is never — but correct practice regardless).

Without this effect, the browser's back button would not work: the URL would change, but `setRoute` would not be called, so the rendered content would not update.

`navigate(path)` — the function that performs SPA navigation. Two steps:
1. `pushState` — updates the URL bar, adds a history entry. No page reload.
2. `setRoute(getRouteFromURL())` — re-reads the URL (now updated) and sets the route state. React re-renders `App` with the new route.

Update `AppHeader` to accept and use the `onNavigate` prop:

```jsx
// In AppHeader.jsx — update the nav links to use onNavigate
export default function AppHeader({ platformName = 'my-platform', activeLabName = null, onNavigate }) {
  function link(href, label) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault()  // prevent the browser's default navigation (page reload)
          if (onNavigate) onNavigate(href)
        }}
        style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}
      >
        {label}
      </a>
    )
  }

  return (
    <header style={{ background: '#1a1a2e', color: '#fff', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span
          onClick={() => onNavigate?.('/')}
          style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px', cursor: 'pointer' }}
        >
          {platformName}
        </span>
        {activeLabName !== null && (
          <>
            <span style={{ color: '#555' }}>›</span>
            <span style={{ fontSize: '15px', color: '#ccc' }}>{activeLabName}</span>
          </>
        )}
      </div>
      <nav style={{ display: 'flex', gap: '20px' }}>
        {link('/',      'Home')}
        {link('/labs',  'Labs')}
        {link('/about', 'About')}
      </nav>
    </header>
  )
}
```

`e.preventDefault()` — prevents the browser's default behaviour for the click event on an `<a>` element. The default behaviour is to navigate to the `href`, causing a full page reload. Calling `preventDefault()` cancels this, and the `onNavigate` handler runs instead.

`onNavigate?.('/')` — optional chaining on a function call. If `onNavigate` is `undefined` (prop not provided), this does nothing instead of throwing `TypeError: onNavigate is not a function`.

---

**SE lens — why React Router replaces this:**

The manual implementation has several limitations:
- **Vite dev server configuration**: visiting `localhost:5173/labs` directly returns a 404 because the dev server does not have a `/labs` file. Vite must be configured with `historyApiFallback: true` to serve `index.html` for all routes.
- **Production deployment**: the web server (Nginx, Apache, Netlify) must also be configured to serve `index.html` for all paths.
- **No route matching patterns**: the manual `getRouteFromURL` function must be updated for every new route.
- **No route parameters**: extracting lab IDs requires manual regex.
- **No nested routes**: the pattern does not scale to layouts with multiple levels.

React Router (lesson 019) handles all of these with a declarative API:

```jsx
<Routes>
  <Route path="/"           element={<HomePage />} />
  <Route path="/labs"       element={<LabsPage />} />
  <Route path="/labs/:id"   element={<LabPage />} />
  <Route path="/about"      element={<AboutPage />} />
</Routes>
```

This is the motivation for lesson 019: the manual implementation is educational (it reveals what the History API does), but React Router is the production-appropriate tool.

---

## Connect the Pieces

**Connection to lesson 019:** This lesson demonstrates the problem React Router solves. The `navigate` function, the `popstate` listener, and the route state are all replaced by React Router's declarative primitives.

**Connection to lesson 021:** The app shell pattern — a persistent layout with changing content — is the SPA architecture exactly. The shell (`AppShell`, `AppHeader`) renders once and stays. The content changes with the route. Lesson 021 makes this explicit.

**Connection to lesson 020:** The concern about initial JavaScript bundle size (the trade-off of SPAs). Lazy loading (lesson 020) addresses this by loading lab code only when the user navigates to that lab.

---

## What Breaks Without This

**`pushState` without `setRoute`:**

```javascript
function navigate(path) {
  window.history.pushState({}, '', path)
  // Missing: setRoute(...)
}
```

The URL bar updates. No re-render. The content shows the previous page. The URL and the content are out of sync — the broken invariant this architecture is designed to prevent.

**`setRoute` without `pushState`:**

```javascript
function navigate(path) {
  // Missing: window.history.pushState(...)
  setRoute(getRouteFromURL())
}
```

The content updates. The URL bar does not change. Pressing the browser back button has no effect (no history entries were added). Bookmarking shows the old URL. Same broken invariant, different symptom.

**Without `e.preventDefault()`:**

```jsx
<a href="/labs" onClick={() => onNavigate('/labs')}>Labs</a>
```

Without `preventDefault`, clicking the link: (1) fires the click handler (calls `onNavigate`, which calls `pushState` and `setRoute`), then (2) fires the browser's default navigation — a full page reload to `/labs`. Two navigations for one click. The SPA navigation happens and is immediately undone by the page reload.

---

## Definition of Done

- [ ] Clicking "Home", "Labs", "About" in the header updates the URL and content without page reload
- [ ] Clicking "Browse Labs" on the home page navigates to `/labs`
- [ ] Clicking a lab card navigates to `/labs/[lab-id]`
- [ ] Clicking "← Back to Labs" navigates to `/labs`
- [ ] The browser's back button works (navigates to the previous route)
- [ ] The header breadcrumb shows the active lab name when on a lab page
- [ ] You can explain what `pushState` does and why `setRoute` must also be called
- [ ] You can explain what `e.preventDefault()` does on the anchor click
- [ ] You can explain what the `popstate` event is and when it fires
- [ ] You can name three limitations of the manual implementation that React Router solves
- [ ] Git commit:
  ```
  git add src/App.jsx src/AppHeader.jsx
  git commit -m "Implement manual SPA navigation using History API

  navigate() calls pushState to update URL, then setRoute to re-render.
  popstate listener handles browser back/forward buttons.
  getRouteFromURL reads pathname to determine initial route.
  e.preventDefault() on links prevents MPA-style page reloads.
  This manual implementation motivates React Router in lesson 019."
  ```
