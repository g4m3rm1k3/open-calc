# Lesson F6: Routing

**What you will build**
Real, distinct URLs — `/`, `/feed`, `/members/:id` — each rendering a different page, using `react-router`. The problem we're solving: everything so far renders inside one single `App`, at one single URL — no way to link directly to a specific member's profile, bookmark a page, or navigate without losing all component state to a full reload.

**What you need to know first**
F4 (component composition). Backend Lesson 3 (path parameters — today's `useParams` is the direct client-side counterpart).

---

## Concept Unit: Routes and Navigation

### The Problem

A plain `<a href="/members/1">` works, but triggers a full browser page reload — reloading the entire JavaScript bundle, resetting every component's state, for what should just be swapping which component renders. We need URL changes handled entirely inside the already-running app.

### Introduce the concept in isolation

```bash
npm install react-router-dom
```

Create `frontend/src/lab/MiniRouter.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() { return <p>Home page</p>; }
function About() { return <p>About page</p>; }

function MiniRouter() {
    return (
        <BrowserRouter>
            <Link to="/">Home</Link> | <Link to="/about">About</Link>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </BrowserRouter>
    );
}
```

Render it, click between links — the URL bar changes, the content swaps, and the browser's network tab shows *no new page request* at all.

*What this proves:* `Link` intercepted the click and updated the URL using the browser's History API directly, without a real navigation ever happening — `Routes` then re-evaluates which `Route`'s `path` matches the current URL and renders that one's `element`. Nothing about this involved the server at all; it's a purely client-side illusion of separate pages.

### Explain the mechanism

The browser's **History API** (`pushState`) lets JavaScript change the URL shown in the address bar and add a browser-history entry, without actually requesting a new page from any server. `react-router`'s `Link` calls this instead of letting the browser's native `<a>` behavior run — the same "opt out of the default" instinct as F5's `e.preventDefault()`, applied to link clicks instead of form submissions.

### Discard the throwaway example

Delete `frontend/src/lab/`. Build the real app's routes.

### Project Change

* **Files affected:** Modify `src/App.tsx`. Create `src/pages/FeedPage.tsx`, `src/pages/MemberPage.tsx`.
* **Change type:** Add + Modify.

### The New Code

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import FeedPage from "./pages/FeedPage";
import MemberPage from "./pages/MemberPage";
import MemberList from "./MemberList";

function App() {
    return (
        <BrowserRouter>
            <nav><Link to="/">Members</Link> | <Link to="/feed">Feed</Link></nav>
            <Routes>
                <Route path="/" element={<MemberList />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/members/:id" element={<MemberPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
```

```tsx
// src/pages/MemberPage.tsx
import { useParams } from "react-router-dom";

function MemberPage() {
    const { id } = useParams();
    return <p>Viewing member {id}</p>;
}

export default MemberPage;
```

### Mechanical walkthrough

1. `path="/members/:id"`: (first appearance of a **route parameter**, `:id`). Directly parallel to backend Lesson 3's `{member_id}` path parameter — a placeholder segment in the URL, extracted rather than hardcoded.
2. `useParams()`: (first appearance). Reads whatever matched `:id` in the current URL — the client-side equivalent of FastAPI automatically extracting and passing `member_id` into a route function.

### CS Lens

**Client-side routing is a UI illusion built entirely on the History API — no actual navigation occurs.** This is worth being precise about: the server never sees a request for `/members/1` unless the page is *hard*-reloaded (e.g., a bookmark opened fresh) — for that to also work correctly, the backend or a static file server needs to be configured to serve the same `index.html` for every path, letting `react-router` take over client-side once loaded. This is a real, easy-to-miss deployment detail, worth flagging now even though F18 covers deployment properly.

### SE Lens

**`Link` over `<a>` for the same underlying reason as F5's `e.preventDefault()`.** Both intercept a browser default (full navigation, full form submit) to keep control inside the running React app instead — recognizing this as the same instinct in two different contexts is more valuable than treating each as an unrelated rule to memorize.

### Commands needed

```bash
npm run dev
```

### Run it. Show the real output.

Clicking between "Members" and "Feed" swaps content without a page reload; navigating to `/members/1` directly shows "Viewing member 1", `useParams` having correctly extracted `1` from the URL.

---

## Closing

**Connect the pieces**
`BrowserRouter` and `Routes` intercept navigation via the History API instead of letting the browser reload; `useParams` extracts URL segments the same way backend path parameters do server-side, just entirely client-side.

**What breaks without this**
Without client-side routing, every navigation would be a full page reload — losing all component state (F3's fetched members, F5's login token) on every single click, making a genuinely app-like experience impossible.

**Exercises**
1. Add a `/posts/:id` route rendering a placeholder `PostPage`, in preparation for F10's real feed UI.
2. Add a `Navigate` redirect (from `react-router-dom`) for any unmatched path, back to `/`.

**Definition of Done**
* [x] Real routes for `/`, `/feed`, `/members/:id`.
* [x] Navigation via `Link`, no full page reloads.
* [x] Can explain, without notes, why a hard-reloaded `/members/1` needs server/static-host configuration to work.
* [x] Commit: `feat: client-side routing with react-router`

---

## Context Snapshot (End of Lesson F6)

**Frontend File Tree:** adds `src/pages/FeedPage.tsx`, `src/pages/MemberPage.tsx`; modifies `src/App.tsx`

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| History API (`pushState`) | F6 | Browser mechanism for changing the URL/history without a real navigation |
| Route parameter (`:id`) | F6 | URL placeholder, client-side counterpart to backend path parameters |
| `useParams()` | F6 | Reads matched route parameters from the current URL |

**Lesson Completion State:**
- Completed: F1-F6, Interludes E, F
- Next: F7 — Auth Token Handling

**Maps to backend:** `useParams()`'s `:id` is the client-side mirror of backend Lesson 3's `{member_id}` — same concept, opposite side of the network boundary.
