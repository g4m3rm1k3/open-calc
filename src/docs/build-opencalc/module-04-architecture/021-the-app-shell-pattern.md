# 021 — The App Shell Pattern

*Separating the persistent shell from the transient content, and why navigation is fast*

---

## What You Will Build

You will extract the app shell into its own component that is responsible for exactly one thing: the persistent outer structure. You will add a secondary navigation sidebar, keyboard shortcut handling, and a notification banner — features that persist across page changes. You will understand why these features live in the shell and not in individual pages.

---

## What You Need to Know First

Lesson 019 — React Router. Routes are defined, `<BrowserRouter>` provides context.

Lesson 012 — Component Composition. `AppShell`, `AppHeader`, `ContentArea` are built.

---

## The Lesson

### The shell and the content

In the platform so far, navigation between labs shows the correct page content. But the header always renders — it never unmounts, never re-fetches its data, never re-initialises. This is the shell.

The **app shell** is the part of the UI that:
- Renders on the initial load
- Persists across all navigations
- Is cached by the browser after first load
- Contains no page-specific content

In `AppLayout`:

```jsx
function AppLayout() {
  return (
    <AppShell>
      <AppHeader platformName="my-platform" />  {/* Shell — always rendered */}
      <ContentArea>
        <Routes>
          {/* Content — changes with route */}
        </Routes>
      </ContentArea>
    </AppShell>
  )
}
```

`AppHeader` is the shell. The `<Routes>` output is the content. When the user navigates from `/labs` to `/labs/calculator`, React re-renders `AppLayout`. `AppHeader` receives the same props; React's reconciler sees no changes, produces no DOM operations. The header stays mounted. The `<Routes>` output changes; React patches the content area.

This is why navigation is fast: the shell does not reload. Only the content changes.

---

**CS lens — incremental DOM updates:**

When the user navigates from `/labs` to `/labs/calculator`, React produces a new virtual DOM tree for `AppLayout`. The reconciler diffs the new tree against the previous tree:

- `AppShell` — same type, same props → **no DOM changes**
- `AppHeader` — same type, same props → **no DOM changes**
- `ContentArea` — same type, same props → **check children**
- `<Routes>` output — previously `<LabsPage>`, now `<LabPage>` → **replace children**

The total DOM changes: the content area's children are replaced. The header DOM nodes are untouched. The layout DOM nodes are untouched.

This is the reconciler's contribution to performance: it identifies the minimal set of DOM changes. Without reconciliation (the naive approach: delete everything and re-render), every navigation would cause the header to flash and all its DOM nodes to be recreated.

---

**SE lens — the shell as infrastructure:**

From lesson 012: infrastructure components are page-agnostic. The shell is the clearest example.

`AppHeader` does not know it is rendering above a calculator lab. It does not import `Calculator`. It does not read calculator state. It receives `activeLabName` (derived from the route) and renders a header.

`ContentArea` does not know what page it contains. It provides the layout container; the route determines what is inside.

This separation enables independent development:
- A designer can change the header layout without touching any lab component
- Adding a new lab does not require touching the shell
- The shell can be tested in isolation from all content
- The shell's caching behaviour improves with every new page added (the same cached shell is reused for all of them)

---

### What belongs in the shell

**Features that belong in the shell:**
- Persistent navigation (header, sidebar, footer)
- Global notification banners (maintenance alerts, update prompts)
- Keyboard shortcuts that apply globally (Ctrl+K search, Escape to close modals)
- Theme/dark mode toggle (affects all pages)
- Authentication status indicators
- Analytics event listeners (page view tracking)
- Error boundaries that catch crashes in content

**Features that do NOT belong in the shell:**
- Page-specific state (which lab is active beyond what the URL provides)
- Lab component code
- Form data for specific pages
- Page-specific error states

The criterion: if the feature needs to work regardless of what page is showing, it belongs in the shell. If it only matters on one page, it belongs in that page's component.

---

### Add shell features

**Feature 1 — keyboard shortcut: press `/` to focus the search (placeholder for now)**

```jsx
// In AppLayout or a new ShellFeatures component
useEffect(() => {
  function handleKeyDown(event) {
    // Focus search on '/' key (common web convention)
    if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
      const activeEl = document.activeElement
      const isInputFocused = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA'
      if (!isInputFocused) {
        event.preventDefault()
        console.log('Search triggered — placeholder for search implementation')
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [])
```

`document.addEventListener('keydown', handleKeyDown)` — adds a listener to `document`, the top-level DOM node. This captures all key presses on the page, regardless of which element is focused.

`document.activeElement` — the DOM property that returns the currently focused element, or `document.body` if nothing is focused. Checking if an input is focused prevents triggering search when the user is typing in the calculator.

`event.key === '/'` — checks the pressed key by name. `event.key` is the human-readable name of the key: `'a'`, `'Enter'`, `'ArrowLeft'`, `'/'`, `' '` (space). More portable than `event.keyCode` (deprecated).

**Why this belongs in the shell:** Pressing `/` to search should work from any page. If it were in `LabsPage`, pressing `/` on the home page or a lab page would do nothing.

---

**Feature 2 — notification banner (maintenance alert)**

```jsx
// Notification state — persists across page changes
const [notification, setNotification] = useState(
  'New labs available: Robot Arm Simulator v2. Check the labs page.'
)

// Render in the shell, above ContentArea
{notification && (
  <div style={{
    background: '#1565c0',
    color: '#fff',
    padding: '10px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    flexShrink: 0,
  }}>
    <span>{notification}</span>
    <button
      onClick={() => setNotification(null)}
      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
    >
      ×
    </button>
  </div>
)}
```

**Why this belongs in the shell:** The notification should persist across page navigations. If it were in `LabsPage`, dismissing it and navigating to a lab would cause it to reappear on return. In the shell, dismissing it sets shell state to `null`, and it stays dismissed for the session (even through route changes).

---

**Feature 3 — sidebar navigation for larger screens**

Add a sidebar showing the available pages:

```jsx
// src/Sidebar.jsx

import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()

  const navItems = [
    { to: '/',      label: 'Home',  icon: '⌂' },
    { to: '/labs',  label: 'Labs',  icon: '⬡' },
    { to: '/about', label: 'About', icon: 'ℹ' },
  ]

  return (
    <aside style={{
      width: '200px',
      background: '#fff',
      borderRight: '1px solid #e0e0e0',
      padding: '16px 0',
      flexShrink: 0,
    }}>
      <nav>
        {navItems.map(({ to, label, icon }) => {
          const isActive = location.pathname === to || (to === '/labs' && location.pathname.startsWith('/labs'))

          return (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                textDecoration: 'none',
                fontSize: '14px',
                color: isActive ? '#1a1a2e' : '#666',
                background: isActive ? '#f0f4ff' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '3px solid #1a1a2e' : '3px solid transparent',
              }}
            >
              <span style={{ fontSize: '16px' }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

**Update the shell layout to include the sidebar:**

```jsx
// Updated AppLayout
function AppLayout() {
  const [notification, setNotification] = useState(
    'Welcome to my-platform — explore the labs to get started.'
  )

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')
        if (!isInputFocused) {
          event.preventDefault()
          console.log('/ pressed — search not yet implemented (coming in a future lesson)')
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <AppShell>
      <AppHeader platformName="my-platform" />

      {notification && (
        <div style={{ background: '#1565c0', color: '#fff', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', flexShrink: 0 }}>
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
        </div>
      )}

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
```

`<div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>` — a flex row container for the sidebar and content area. `flex: 1` causes it to fill the remaining space below the header and notification banner. `overflow: 'hidden'` prevents the container from growing beyond its bounds; the sidebar and content area each handle their own overflow.

---

**CS lens — state co-location at the shell level:**

The `notification` state is in `AppLayout` — the shell component. It is:
- Not in `AppHeader` (the header does not know about notifications)
- Not in each page component (the notification persists across page changes)
- Not in `App` (the outermost component, which also wraps `<BrowserRouter>` — keeping it at the layout level is cleaner)

This illustrates the state co-location principle applied at the architecture level: state belongs at the component level where it is needed. `notification` is needed in `AppLayout` (renders it) and is affected by the user's dismiss action. It lives in `AppLayout`.

---

### Service worker and shell caching (concept)

In production, the shell can be cached by a **service worker** — a JavaScript file that intercepts network requests and can serve cached responses. With a service worker:

1. First visit: download shell (`index.html` + shell CSS/JS), cache it
2. Every subsequent visit: serve shell from cache immediately (before the network responds)
3. Content (lab chunks): fetched from network when needed, cached after first load

The result: the shell appears instantly (from cache) and content loads progressively. This is how PWAs (Progressive Web Apps) achieve offline capability and near-instant load times.

The service worker implementation is not part of this lesson series — it requires understanding of service worker lifecycle, cache strategies, and push notifications. The architectural concept is: the app shell pattern is the prerequisite for effective shell caching. Without a distinct shell, you cannot cache just the shell.

---

**SE lens — architectural patterns as composable decisions:**

The app shell pattern, lazy loading (lesson 020), and React Router (lesson 019) are three architectural decisions that compose well together:

- React Router makes the URL the source of truth for which content renders
- Lazy loading defers content code download until the route is active
- The app shell ensures the navigation infrastructure is always available and never re-downloaded

Each decision is independently valuable. But together they implement the full architecture: a fast, scalable SPA where:
- Initial load is just the shell (fast)
- Navigation is instant for previously-visited pages (shell stays mounted)
- New content loads progressively on demand (lazy loading)
- The URL always reflects the current state (bookmarkable, shareable)

This is the architecture of the open-calc platform.

---

## Connect the Pieces

**Connection to lesson 013:** `notification` state is the same pattern as `activeLabId`. The shell can have its own state for shell-level concerns (notification, search panel open/closed, sidebar collapsed/expanded). The shell is a component with its own lifecycle.

**Connection to lesson 022:** The registry pattern (lesson 022) is the mechanism that connects labs to the shell without the shell knowing about specific labs. The shell renders whichever component the registry provides for the current route.

**Connection to lesson 026:** Testing the shell means testing that: navigation updates the active sidebar item, the notification dismisses correctly, keyboard shortcuts trigger in the right contexts. These are interaction tests — the topic of lesson 028.

---

## What Breaks Without This

**Putting navigation state in a page component:**

```jsx
function LabsPage() {
  // If notification were here:
  const [notification, setNotification] = useState('Welcome to Labs...')

  // Navigating to /about and back would re-mount LabsPage
  // The notification would reappear after being dismissed
}
```

The notification reappears on every route change that unmounts and re-mounts `LabsPage`. The user dismissed it; the app shows it again. The shell is the correct location precisely because it never unmounts.

**Global side effects without cleanup:**

```javascript
useEffect(() => {
  document.addEventListener('keydown', handleKeyDown)
  // Missing: return () => document.removeEventListener(...)
}, [])
```

In development with `<StrictMode>`, the effect runs, the listener is added, then cleanup runs (the effect is torn down), then the effect runs again (double-invoke). Without a cleanup function, the double-invoke adds the listener twice. Two listeners fire for every keypress. The effect doubles on every `<StrictMode>` re-mount.

In production (no `<StrictMode>` double-invoke), this particular bug does not manifest — but the missing cleanup still means the listener is never removed if `AppLayout` were to unmount.

---

## Definition of Done

- [ ] `src/Sidebar.jsx` exists with nav items linked to `/`, `/labs`, `/about`
- [ ] Active sidebar item is highlighted based on `useLocation`
- [ ] `AppLayout` includes the notification banner with a dismiss button
- [ ] Dismissing the notification persists across page navigation (it stays dismissed)
- [ ] A `keydown` listener for `/` logs a message in the console (or is no-op if input focused)
- [ ] The shell (header, notification, sidebar) does not flash or reload on route changes
- [ ] You can explain which features belong in the shell vs in page components
- [ ] You can explain why the notification state must be in `AppLayout`, not in a page component
- [ ] You can explain what a service worker is conceptually and why the shell pattern enables it
- [ ] Git commit:
  ```
  git add src/Sidebar.jsx src/App.jsx
  git commit -m "Add app shell features: sidebar, notification banner, keyboard shortcut

  Sidebar shows active route with Link/useLocation; persists across nav.
  Notification banner in AppLayout persists session-wide (shell state).
  Keydown listener on document for '/' shortcut with cleanup.
  Shell (header, notification, sidebar) never unmounts on route changes."
  ```
