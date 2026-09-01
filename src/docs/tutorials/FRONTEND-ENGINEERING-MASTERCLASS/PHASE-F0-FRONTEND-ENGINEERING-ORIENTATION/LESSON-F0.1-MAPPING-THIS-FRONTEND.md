# Lesson F0.1: Mapping This Frontend

*File paths under src/... refer to the real manufacturing-platform repository's frontend. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, small tool that mechanically finds every real, role-guarded route this frontend actually defines - then a direct trace of one real route through its real guard component, all the way to the exact branch that decides whether a visitor needs to be logged in at all. The transferable problem: the same habit already proven on a Python backend - verify a claim about a codebase by searching for real structure, then read a guard's actual control flow rather than trusting its name - carries over unchanged to a TypeScript/React frontend.

**What you need to know first:** Verifying a claim about a codebase by mechanically searching its real source instead of trusting a name, a comment, or a glance; reading a guard/decorator-style construct's real control flow branch by branch.

## Terms used in this lesson

- **Client-side routing** — Mapping a URL to a component entirely inside the browser, without a new request to a server for each navigation - a router library watches the current URL and renders whichever component is registered for it. It exists so navigating between views feels instant and preserves in-memory state, at the cost of the server never seeing which "page" a visitor is actually on.
- **Route guard** — A component or function sitting between a route and the page it would otherwise render, deciding whether that page is actually allowed to render for the current visitor. It exists so authorization logic lives in one place instead of being duplicated inside every page component it protects.

## Objects and methods used

- **`Route`**
  - *What it is:* A React Router component declaring one real mapping from a URL path to the element that should render for it.
  - *Implementation:* `<Route path={string} element={JSX.Element} />`, from the `react-router-dom` package.
  - *Its use:* This lesson's real tool searches for every real usage of this exact shape in `App.tsx`, to find every path this frontend actually registers.
  - *Type:* A component, exported by the `react-router-dom` library.
  - *Responsibility:* Record one real path-to-element mapping so the surrounding `Routes` container can pick the right one to render for the current URL.
  - *Depends on:* Being rendered inside a `Routes` container, which is itself rendered inside a router (`HashRouter`, in this app).
  - *Connects to:* Its `element` prop is what actually renders - in this app, that's almost always `ProtectedRoute` wrapping a real page component, below.
  - *Shape:* Takes a path string and one element; renders nothing itself - it's read by its parent `Routes` container, not rendered directly.

- **`ProtectedRoute`**
  - *What it is:* This project's own real guard component, wrapping a page element and deciding whether it's actually allowed to render.
  - *Implementation:* `function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps)`, defined in `src/App.tsx:382-433`.
  - *Its use:* Every real, role-guarded route in this app (all 13 found by this lesson's own tool) wraps its real page element in this component.
  - *Type:* A function component, defined directly in `App.tsx` - not imported from a library.
  - *Responsibility:* Read the real, current authentication state via `useAuth`, then decide, branch by branch, whether to render the real children it was given, redirect elsewhere, or render nothing yet.
  - *Depends on:* `useAuth`, below, for the real current authentication state; an `allowedRoles` list passed in by whichever `Route` uses it.
  - *Connects to:* Called with the specific `allowedRoles` from `routes.<key>.roles` (defined in `src/config/routes.ts`) at each real call site; renders either its real `children` prop, or a real `Navigate` redirect.
  - *Shape:* Takes a real page element (`children`) and an optional list of role strings; renders either that same element unchanged, `null`, or a `Navigate` redirect - never a modified copy of the children.

- **`useAuth`**
  - *What it is:* This project's own real custom hook exposing the current authentication state to any component that calls it.
  - *Implementation:* `function useAuth()`, defined in `src/context/AuthContext.tsx`, returning `{ user, login, logout, isAuthenticated, loading }`.
  - *Its use:* `ProtectedRoute` calls it to read the real, current `isAuthenticated`, `user`, and `loading` values before deciding what to render.
  - *Type:* A custom hook, built on React's own `useContext`.
  - *Responsibility:* Read the current value of `AuthContext` and return it directly, throwing a real error if called outside the real `AuthProvider` that supplies it.
  - *Depends on:* Being called from inside a component that's a real descendant of `AuthProvider` - true everywhere in this app, since `AuthProvider` wraps the whole real component tree in `main.tsx`.
  - *Connects to:* Its `isAuthenticated`/`user`/`loading` values are read directly by `ProtectedRoute`'s own real branches, below.
  - *Shape:* Takes no arguments; returns one real object with `user` (the current user or `null`), `login`/`logout` (functions), `isAuthenticated` (a boolean), and `loading` (a boolean) - the same real shape every time it's called.

## Concept Unit: Finding Every Real Guarded Route Mechanically

### The Problem

This frontend registers more than a dozen real routes in `src/App.tsx`. Reading the file top to bottom to find every one that's actually role-guarded, and by which real role list, is exactly the kind of task that's easy to get wrong by eye - a route added later, or one whose guard was written slightly differently, is easy to miss on a read-through.

Before reading on:

- Given that every real guarded route in this file follows the same real, repeated shape - a `Route`'s `path` and its `ProtectedRoute`-wrapped `element` - what would a program need to search for, mechanically, to find every one without missing any?
- This exact kind of question - 'which real routes does this file actually define, and how do I know for sure' - was already answered mechanically on a different, Python backend. Does the method change because the file is TypeScript now, or only the exact pattern being searched for?

### Project Change

- **Reference Source:** `src/App.tsx`, read in full this session - specifically its real `<Routes>` block (lines 543-650+), where every guarded route follows the identical shape `path={routes.<key>.path}` followed by `element={<ProtectedRoute allowedRoles={routes.<key>.roles}>`.
- **Files affected:** `verification/frontend-phase-00/lab_find_real_routes.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's standard library `pathlib` and `re` modules only.

Rather than trust a read-through, this unit builds a small, real tool that searches the actual file text for that exact real shape, and reports every real match.

### The New Code

New code, typed into a new throwaway file - the whole file at once, since there's no existing structure to return to for something this small. Python, searching real TypeScript source text - the tool doesn't need to be written in the same language as the file it searches:

**File:** `verification/frontend-phase-00/lab_find_real_routes.py` (new)

```python
import re
from pathlib import Path

app_source = Path("src/App.tsx").read_text(encoding="utf-8")

for match in re.finditer(
    r'path=\{routes\.(\w+)\.path\}\s*\n\s*element=\{<ProtectedRoute allowedRoles=\{routes\.(\w+)\.roles\}>',
    app_source,
):
    route_key = match.group(1)
    print(f"routes.{route_key} -> guarded by routes.{match.group(2)}.roles")
```

### Mechanical Walkthrough

- `app_source = Path("src/App.tsx").read_text(encoding="utf-8")` — Reads the real, current text of the real file this lesson is investigating - the same real `pathlib` habit already proven on the backend, pointed at a `.tsx` file instead of a `.py` one; nothing about `Path`/`read_text` cares which.
- `for match in re.finditer(r'path=\{routes\.(\w+)\.path\}\s*\n\s*element=\{<ProtectedRoute allowedRoles=\{routes\.(\w+)\.roles\}>', app_source):` — `re.finditer` searches the real text for every real match of this app's own actual JSX shape - a `path={routes.KEY.path}` line immediately followed by an `element={<ProtectedRoute allowedRoles={routes.KEY.roles}>` line - capturing the real route key both times via the pattern's own two parenthesized groups. The first version of this pattern assumed a literal string path (`path="/dashboard"`) and matched nothing - the real file uses `path={routes.dashboard.path}`, a real expression referencing the shared config object, not a literal string. Fixed only after actually running it and seeing zero real matches, not by reasoning about what the file probably looked like.
- `route_key = match.group(1)` — Reads the first real captured group - the route's own key in the shared `routes` config object (basic Python).
- `print(f"routes.{route_key} -> guarded by routes.{match.group(2)}.roles")` — Prints the real route key alongside the real role-list reference guarding it - an f-string (basic Python).

### CS Lens

This is still static analysis - the identical real approach already proven finding real Flask routes and real decorator calls on the backend, now searching JSX text instead of Python source. The underlying idea doesn't change with the language: a real, repeated syntactic shape can be found mechanically, across an entire file, without reading every line by eye.

### SE Lens

The real alternative not chosen: reading `App.tsx` top to bottom and trusting a manual count. The real, honest cost of the regex approach actually used here: it only recognizes routes written in exactly this app's own real, consistent shape (`path={routes.KEY.path}` immediately followed by the `ProtectedRoute` wrapper on the next line) - a route guarded a structurally different real way elsewhere in this codebase would be missed by this exact script, the same honest limitation already named for the backend's own AST-based route finder.

### Commands needed

- `python verification/frontend-phase-00/lab_find_real_routes.py` — Run from the manufacturing-platform repository root, so the relative path to src/App.tsx resolves correctly.

### Verification

```text
routes.dashboard -> guarded by routes.dashboard.roles
routes.operator -> guarded by routes.operator.roles
routes.quality -> guarded by routes.quality.roles
routes.parts -> guarded by routes.parts.roles
routes.partDetail -> guarded by routes.partDetail.roles
routes.tooling -> guarded by routes.tooling.roles
routes.machines -> guarded by routes.machines.roles
routes.programmerOperations -> guarded by routes.programmerOperations.roles
routes.templates -> guarded by routes.templates.roles
routes.admin -> guarded by routes.admin.roles
routes.settings -> guarded by routes.settings.roles
routes.gitlabSettings -> guarded by routes.gitlabSettings.roles
routes.status -> guarded by routes.status.roles
```

Full saved run: `verification/frontend-phase-00/lab_find_real_routes_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: Tracing One Real Route Through Its Real Guard

### The Problem

The unit above found 13 real, guarded routes - but "guarded" doesn't yet say what actually happens when one of them is visited. `routes.dashboard` is one of the 13 - tracing it through `ProtectedRoute`'s own real code is the only way to know what "guarded" actually means here, mechanically, rather than assumed from the component's name.

Before reading on:

- `ProtectedRoute` takes an `allowedRoles` list. Before reading its real body: what real, different outcomes would you expect it to produce for a visitor who isn't logged in at all, versus one who's logged in but lacks the right role?

### Project Change

- **Reference Source:** `src/App.tsx:382-433` (`ProtectedRoute`) and its real usage at the `routes.dashboard` route (`App.tsx:607-610`), both read verbatim this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A
- **Dependencies:** None beyond the real repository already checked out on disk.

The real component below is what actually runs for every one of the 13 routes found above; the real usage below it is one concrete case, `routes.dashboard`, whose `roles` array (`src/config/routes.ts`) includes `'operator'`.

### The Updated Project

**File:** `src/App.tsx` (already exists — read-only, nothing to type)

```typescript
function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (allowedRoles && allowedRoles.includes('operator' as UserRole)) {
        return children;
    }

    if (!isAuthenticated) {
        return <Navigate to="/operator" replace />;
    }

    const currentRole = user?.role;

    if (allowedRoles && currentRole && !allowedRoles.includes(currentRole as UserRole)) {
        return <Navigate to="/operator" replace />;
    }

    return children;
}
```

**File:** `src/App.tsx` (already exists — read-only, nothing to type)

```typescript
<Route
    path={routes.dashboard.path}
    element={<ProtectedRoute allowedRoles={routes.dashboard.roles}><DashboardPage /></ProtectedRoute>}
/>
```

### Mechanical Walkthrough

- `const { isAuthenticated, user, loading } = useAuth();` — Reads the real, current authentication state once, at the top of the component, via the real `useAuth` hook - every branch below reads from these same three real values.
- `if (loading) return null;` — While the real stored user is still being read from `localStorage` (see `AuthContext.tsx`'s own real initialization effect), renders nothing at all rather than briefly showing an incorrect logged-out state.
- `if (allowedRoles && allowedRoles.includes('operator' as UserRole)) { return children; }` — The real branch this unit exists to find: if `'operator'` is anywhere in this specific route's own `allowedRoles` list, the real children render immediately - no authentication check happens at all. `routes.dashboard.roles` is `ALL_ROLES`, which includes `'operator'` (`src/config/routes.ts`) - so this exact branch is the one `routes.dashboard` actually takes.
- `if (!isAuthenticated) { return <Navigate to="/operator" replace />; }` — Only reached for a route whose `allowedRoles` does NOT include `'operator'` - redirects a real, not-logged-in visitor to `/operator` instead of rendering the protected page.
- `const currentRole = user?.role; if (allowedRoles && currentRole && !allowedRoles.includes(currentRole as UserRole)) { return <Navigate to="/operator" replace />; }` — For a real, logged-in visitor whose real role isn't in this route's `allowedRoles`, redirects the same way - `?.` (basic TypeScript optional chaining) reads `role` safely even if `user` were `null` here, though the branch above already guarantees `isAuthenticated` is true by this point.
- `return children;` — Reached only once every check above has passed - renders the real, real protected page element unchanged.

### Mental Model

```text
<ProtectedRoute allowedRoles={routes.dashboard.roles}>
            |
            v
      loading? --yes--> render nothing
            | no
            v
'operator' in allowedRoles? --yes--> render children
      (true for routes.dashboard -           (no auth check
       ALL_ROLES includes 'operator')          ever happens)
            | no
            v
      isAuthenticated? --no--> redirect to /operator
            | yes
            v
      role in allowedRoles? --no--> redirect to /operator
            | yes
            v
      render children

For routes.dashboard specifically, the real path taken is
always the second branch - every visitor reaches the dashboard
with no login check at all, the same real shape as every other
route (12 more, per the unit above) whose roles list happens to
include 'operator'.
```

### CS Lens

This is the same real shape as a control-flow trace already run on a completely different, Python backend: a guard whose documented intent (skip login for shared, low-stakes views) is real and stated in its own comments, but whose actual, mechanical condition checks only whether one string is present in a list - with no separate signal distinguishing "this route was designed to be public" from "this route's role list happens to include operator for an unrelated reason." Two completely independent real implementations - a Python decorator, a TypeScript component - built by the same real project, arrived at the identical real shape, including the identical real justifying comment style ("shop floor," "physical access controls instead of login").

### SE Lens

The real alternative not chosen: a guard scoped to routes explicitly marked as intentionally public, rather than to any route whose `allowedRoles` happens to include `'operator'` for some other legitimate reason (`routes.dashboard`'s own real roles list, `ALL_ROLES`, includes `'operator'` alongside `'admin'`, `'engineering'`, `'quality'`, and five other roles - not because the dashboard was designed as an anonymous public view specifically). The real, honest cost, visible directly in the code shown above: this frontend guard and the backend's own equivalent guard both carry the identical real risk, independently, on both sides of the same application - a route reachable by `ProtectedRoute` with no login is very likely also reachable through the backend API directly with no token, since both real guards key off the exact same real role, `'operator'`, the same way.

### Verification

Not applicable under the Verification Rule's own exemption: no execution is required for this unit's actual claim. Both real excerpts above are quoted verbatim from already-existing source, read this session - they establish the real control flow being examined (that `routes.dashboard`'s real roles list takes the operator-bypass branch). They do not establish runtime behavior - what a real browser actually renders for an unauthenticated visit to `/#/dashboard` - which would need a real, driven browser session to prove, not a citation.

### Connection to the previous unit

The unit above found 13 real routes guarded by `ProtectedRoute`; this unit read that same guard's real code directly, and showed that one of those 13 - `routes.dashboard` - takes the branch that skips authentication entirely.

## Connect the pieces

One real route, found two ways: first mechanically, by the tool built above, listing `routes.dashboard` among 13 real matches directly from `App.tsx`'s own real JSX structure; then traced directly - `routes.dashboard.roles` is `ALL_ROLES` (`src/config/routes.ts`), which includes `'operator'`, so `ProtectedRoute` (`App.tsx:382-433`) takes its real operator-bypass branch and renders the dashboard with no authentication check at all. The same real question - "is this route actually protected" - only had a real answer once both the mechanical search and the real code trace were done; neither the route's name nor the guard component's name settled it alone.

**Next lesson:** Applying this same verification habit to the real stack this frontend is actually built on - React, TypeScript, Zustand, React Router, Three.js, Socket.IO - each tied to a real, cited usage rather than assumed from `package.json` alone.