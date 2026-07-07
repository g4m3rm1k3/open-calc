# React Calculator — Lesson 28 — Tabs Without a Router

## What You Will Build

Basic, Scientific, and Settings become three real, separate views, switched
by clicking a tab — and by editing the URL's hash directly, since the
current view now genuinely lives in the address bar, not just in a
component's memory.

---

## What You Need to Know First

Lesson 27 — a complete, safe calculator with a working error boundary.

---

## Step 1 — A Router, Built by Hand, So It's Never a Black Box

Create `useHashRoute.ts`:

```typescript
function useHashRoute(defaultRoute: string): [string, (route: string) => void] {
  const [route, setRouteState] = React.useState(() => window.location.hash.slice(1) || defaultRoute);

  React.useEffect(() => {
    function handleHashChange(): void {
      setRouteState(window.location.hash.slice(1) || defaultRoute);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [defaultRoute]);

  function setRoute(newRoute: string): void {
    window.location.hash = newRoute;
  }

  return [route, setRoute];
}
```

**Walkthrough — `window.location.hash`, a browser API used for the first
time.** Every URL can carry a **hash fragment** — the part after a `#`,
like `#scientific`. Uniquely among the parts of a URL, changing the hash
does **not** cause the browser to reload the page or ask the server for
anything new — it's a piece of URL state the page itself can read and
change freely. `window.location.hash` reads it (always including the `#`
itself, hence `.slice(1)` to drop it), and assigning to
`window.location.hash` changes it.

**Walkthrough — the `hashchange` event, and the cleanup function, used for
the first time.** Assigning `window.location.hash` — or the user manually
editing the URL, or clicking a browser back/forward button — fires a real
browser event, `hashchange`, on `window`. `window.addEventListener("hashchange",
handleHashChange)` subscribes to it. Lesson 23 mentioned, briefly, that a
`useEffect` can return a **cleanup function**, without yet having a real
case that needed one — this is that case. Returning `() =>
window.removeEventListener("hashchange", handleHashChange)` tells React:
"before running this effect again, or when this component is removed from
the page entirely, undo what the effect did." Without it, every time this
effect re-ran, a *second* listener would be added on top of the first,
never removed — each future hash change would trigger `handleHashChange`
twice, then three times, then more, a real and classic memory leak this
one line prevents.

**SE lens — this hook is not a toy, it's the same idea every router
actually uses, made visible.** This entire learning platform — the
application hosting HTML Lab itself — is built on `react-router-dom`'s
`HashRouter`. The address you used to reach this very lesson,
`#/lab/html-lab`, is that exact mechanism, already running, the whole time
you've been using this project. A real router library does more than this
hook — matching URL patterns, nested routes, passing URL parameters to
components — genuinely worth learning for a real project. But underneath
all of that, a router is fundamentally this: read the current URL, decide
what to render based on it, and update the URL when navigation happens.
Nothing about that core idea is more mysterious in a full library than it
is here.

---

## Step 2 — A `Tabs` Component

Create `Tabs.tsx`:

```tsx
interface Route {
  key: string;
  label: string;
}

interface TabsProps {
  activeRoute: string;
  routes: Route[];
  onNavigate: (route: string) => void;
}

function Tabs({ activeRoute, routes, onNavigate }: TabsProps) {
  return (
    <div className="tabs">
      {routes.map((route) => (
        <button
          key={route.key}
          className={activeRoute === route.key ? "tab-active" : "tab"}
          onClick={() => onNavigate(route.key)}
        >
          {route.label}
        </button>
      ))}
    </div>
  );
}
```

**Walkthrough — `routes` as a prop, not hardcoded inside `Tabs`.** `Tabs`
has no idea what "Basic," "Scientific," or "Settings" mean — it just
renders whatever list of `{ key, label }` pairs it's given, highlighting
whichever one matches `activeRoute`. This is composition again, the same
instinct from lesson 02: `Tabs` is reusable for any set of named views,
because it was never written to know about calculators specifically.

---

## Step 3 — Replace `scientificMode` With Real Routing

In `Calculator.tsx`, remove `scientificMode` entirely and add:

```tsx
const [route, setRoute] = useHashRoute("basic");
```

Replace the old toggle button with:

```tsx
<Tabs
  activeRoute={route}
  routes={[
    { key: "basic", label: "Basic" },
    { key: "scientific", label: "Scientific" },
    { key: "settings", label: "Settings" },
  ]}
  onNavigate={setRoute}
/>
{route === "scientific" && (
  <ScientificPad onFunction={(name) => dispatch({ type: "function", name, angleMode })} />
)}
{route === "settings" && <p>Settings arrives in the next lesson.</p>}
```

Click **▶ Preview**. Click "Scientific" — the scientific row appears, and
the URL's hash changes to `#scientific`. Click "Basic" — it disappears,
hash changes to `#basic`. Manually edit the address bar's hash to
`#scientific` and press Enter — the tab switches to match, entirely
through the `hashchange` listener, without a single tab button being
clicked.

**Walkthrough — why this still counts as conditional rendering, not a new
concept.** `{route === "scientific" && <ScientificPad ... />}` is exactly
lesson 15's technique, unchanged — a boolean expression deciding whether a
component renders at all. What changed is *where the boolean comes from*:
instead of a `useState` flag private to this component, it's now derived
from `route`, a value that lives in the URL itself and can be reached from
outside this component entirely — bookmarked, shared as a link, or
navigated to with the browser's own back button.

---

## Connect the Pieces

```
useHashRoute.ts   a small, real router — reads and writes the URL's hash,
                  with a proper effect cleanup preventing duplicate
                  listeners
Tabs.tsx          a reusable, generic tab bar — knows nothing about
                  calculators
Calculator.tsx    scientificMode replaced by route; Settings gets a real
                  place in the tree, ready for lesson 29
```

---

## What Breaks Without This

**Omitting the cleanup function in `useHashRoute`'s effect:** if this
hook were ever used more than once, or the dependency array ever caused
the effect to re-run, each run would add another `hashchange` listener on
top of the previous one, all still active. Every future hash change would
trigger the handler multiple times — extra, redundant re-renders that get
worse the longer the page runs, with no error anywhere pointing at the
actual cause.

---

## Definition of Done

- [ ] Clicking each tab shows the correct view and updates the URL's hash
- [ ] Manually editing the hash and pressing Enter also switches the active tab
- [ ] You can explain what a `useEffect` cleanup function does and why this hook needed one
- [ ] You can explain, in your own words, what a router fundamentally does

---

*Next: Lesson 29 — Settings: Theme, Precision, Angle Mode. The Settings
tab gets real content — and a famous floating-point bug finally gets its
full explanation.*
