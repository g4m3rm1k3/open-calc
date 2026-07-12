# Routing Fundamentals: How UpSkillOS Turns a URL Into a Screen

Today we study **client-side routing** — how a single-page app shows different
content for different URLs without ever asking a server for a new HTML page. Our
case study is real code: `src/App.jsx`'s route table, and
`src/pages/LessonPage.jsx`, the real component rendered when you open any lesson
anywhere in this app.

---

## What You Will Build

A real, new route — `/#/roadmap` — rendering a small real component, reachable by
typing the URL directly or clicking a link, reading no parameters. Then you'll
extend it to `/#/roadmap/:topic`, a **dynamic** route segment, and read that
parameter in the component the same way `LessonPage.jsx` reads `chapterId` and
`lessonSlug` today.

---

## What You Need to Know First

`useState` and reading props (Flutter Playground Lessons 1 and 3). Nothing else is
assumed.

---

## The Lesson

### Step 1 — Why Client-Side Routing Exists At All

A traditional website has one URL per HTML file, and every navigation is a full
round trip: the browser asks a server for a new page, the server sends back a
complete new HTML document, and the browser throws away everything and starts over.
That's simple, but it means the entire app — its JavaScript, its loaded data, any
in-memory state — is destroyed and rebuilt on every single click.

A **single-page app** (this entire codebase) loads one real HTML file exactly once,
and everything after that — every "page" you visit — is the *same* running
JavaScript program, swapping out what's rendered without ever reloading. **Routing**
is the piece that decides *what to render*, based on the current URL, entirely
inside that one running program. `react-router-dom` (the specific library this app
uses, already imported in files you've read: `LessonPage.jsx`'s
`import { useParams, Link, useNavigate } from "react-router-dom"`) is a mature,
widely-used implementation of exactly this idea.

### Step 2 — Why This App's URLs Have a `#` In Them

Notice every URL in this app looks like `http://localhost:5173/#/lab/decomp-lab` —
that `#` is not decorative. `App.jsx` wraps the whole app in `<HashRouter>` rather
than the alternative, `<BrowserRouter>`. **Everything after the `#` is called the
**fragment** — historically used for jumping to a named anchor within a page — and,
critically, a browser **never sends the fragment to the server** when it requests a
page; only everything *before* the `#` is sent. `HashRouter` deliberately exploits
this: it stores the current route entirely in the fragment, so navigating
client-side never even looks like a new request to any server watching network
traffic, and — the practical reason it's used here — a static file host serving this
app's build output doesn't need any special server-side configuration to make deep
links (a link straight to `/#/lab/decomp-lab`) work correctly on first load; the
server only ever sees a request for `/`, and the app's own JavaScript reads the
fragment once it's running. `BrowserRouter` (no `#`) produces cleaner-looking URLs
but requires the server to be configured to redirect every path back to the same
`index.html` — real server configuration this app's deployment doesn't require by
choosing `HashRouter` instead.

**SE lens:** this is a real, deliberate tradeoff between URL aesthetics and
deployment simplicity — not a default nobody thought about. Naming *why* a specific
technical choice was made, not just what it is, is exactly the "connect to
production reasoning" this whole curriculum keeps insisting on.

### Step 3 — Reading `App.jsx`'s Route Table

Open `App.jsx` and find a route you already recognize the shape of:

```javascript
<Route path="lab/:labKey" element={<EntryShell paramKey="labKey" loader={getLabEntry} ... />} />
```

**`<Route path="..." element={<Component />} />`** — a `<Route>` is not a component
you render directly in the visible tree; it's a **declaration**, read by the nearest
enclosing `<Routes>` component, saying "if the current URL matches this `path`,
render this `element`." Multiple `<Route>`s sit inside one `<Routes>`, and exactly
one — the first one whose `path` matches — is chosen and rendered.

**`path="lab/:labKey"`** — the `:labKey` segment is a **dynamic route parameter**.
Anything after `lab/` in the URL — `lab/decomp-lab`, `lab/image-lab`,
`lab/anything-at-all` — matches this same route, and whatever text actually
appeared there becomes available inside the rendered component under the name
`labKey`. This is precisely how one single `<Route>` declaration serves every lab in
this entire app, rather than needing one hardcoded `<Route>` per lab.

Now the richer, real example — `LessonPage.jsx`'s own routes, also in `App.jsx`:

```javascript
<Route path="chapter/:chapterId" element={<ChapterPage />} />
<Route path="chapter/:chapterId/:lessonSlug" element={<LessonPage />} />
<Route path="chapter/:chapterId/:lessonSlug/*" element={<LessonPage />} />
```

Three separate routes, all starting with `chapter/:chapterId`, distinguished by what
comes after. `/*` at the end of the third one is a **wildcard** — it matches
anything at all past that point (including nothing), which is why `LessonPage.jsx`
itself, in the code you already saw a reference to, destructures a field literally
named `"*"` out of its params:

```javascript
const { chapterId, lessonSlug, "*": rest } = useParams();
```

**`useParams()`** — a hook (again, the `use` prefix — this is a real hook, not a
regular function) returning a plain object with one key per dynamic segment in
whichever `<Route>` matched. For the URL
`/#/chapter/linear-algebra/eigenvalues/practice-problems`, `chapterId` would be
`"linear-algebra"`, `lessonSlug` would be `"eigenvalues"`, and `rest` (destructured
from the special key `"*"`, using the object-destructuring-with-renaming syntax
`"*": rest` — you cannot name a JavaScript variable `*` directly, so this syntax
lets you pull that exact key out under a legal name instead) would be
`"practice-problems"`.

**Execution trace — matching a real URL against these three routes:**
```
URL: /#/chapter/linear-algebra
  → matches Route 1 (chapter/:chapterId) — chapterId = "linear-algebra"
  → renders <ChapterPage />

URL: /#/chapter/linear-algebra/eigenvalues
  → matches Route 2 (chapter/:chapterId/:lessonSlug) — chapterId = "linear-algebra", lessonSlug = "eigenvalues"
  → renders <LessonPage />

URL: /#/chapter/linear-algebra/eigenvalues/practice-problems
  → Route 2 does NOT match (too many segments)
  → matches Route 3 (chapter/:chapterId/:lessonSlug/*) — chapterId, lessonSlug as above, rest = "practice-problems"
  → renders <LessonPage /> (the same component as Route 2 — it reads `rest` internally to decide what extra to show)
```

**CS lens:** This whole table is a **pattern-matching dispatcher** — given one
input string (the URL), find the first declared pattern it matches, and dispatch to
the associated handler. The exact same shape as a `switch` statement, a regular
expression alternation, or (closer to home) the `BUILT_IN_FUNCTIONS['sin']` dispatch
table from `LESSON_CONTRACT.md`'s own example — a mapping from a key (here, a URL
shape) to a behavior (here, a component), rather than a long chain of manual
`if`/`else if` checks.

**SE lens:** Reusing one `<Route>` per *shape* of URL (`chapter/:chapterId/...`)
rather than one per actual chapter is the same **data-driven, not hardcoded**
principle behind this app's lab/course registries — the URL structure is declared
once, and every real chapter or lesson that ever gets added is served by that same
declaration automatically, with zero new routing code required.

---

### Step 4 — `useNavigate`: Changing the URL From Code

`LessonPage.jsx` also has `const navigate = useNavigate();`. Unlike `<Link to="...">`
(a clickable JSX element — you've likely seen these throughout this app without it
being named yet: it renders as a real `<a>` tag, but intercepts the click and
updates the route via `HashRouter` instead of letting the browser do a full page
load), `navigate(path)` is a **function**, called from inside your own code, for
navigation that isn't a direct user click on a link — after a form submits
successfully, after an async operation finishes, or (you'll recognize this exact
call from earlier session work if you've read `NavClock.jsx`) `navigate('/calendar')`,
triggered by clicking a button that isn't itself a `<Link>`.

### Step 5 — Build a Real Route

Create `src/pages/RoadmapPage.tsx`:

```typescript
import { useNavigate, useParams } from 'react-router-dom'

const TOPICS = ['typescript', 'react', 'testing'] as const

export default function RoadmapPage() {
  const navigate = useNavigate()
  const { topic } = useParams()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black">Learning Roadmap</h1>
      <p className="mt-2 text-sm text-slate-500">
        {topic ? `Currently viewing: ${topic}` : 'No topic selected — pick one below.'}
      </p>
      <div className="mt-4 flex gap-2">
        {TOPICS.map(topicName => (
          <button
            key={topicName}
            onClick={() => navigate(`/roadmap/${topicName}`)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
          >
            {topicName}
          </button>
        ))}
      </div>
    </div>
  )
}
```

Register both routes in `App.jsx`, near the other `<Route>` declarations:

```javascript
const RoadmapPage = lazy(() => import("./pages/RoadmapPage.tsx"));
// ...
<Route path="roadmap" element={<RoadmapPage />} />
<Route path="roadmap/:topic" element={<RoadmapPage />} />
```

**`lazy(() => import("./pages/RoadmapPage.tsx"))`** — every page component in this
app is loaded this way, not with a plain `import` at the top of the file. `lazy`
(from `react`) delays actually downloading and running this file's code until the
first time this route is visited, instead of it being part of the app's initial,
very first bundle — every page nobody has visited yet costs nothing on first load.
This is why `App.jsx` needs a `<Suspense>` wrapper somewhere above the routes (you
can find it in the real file) — `Suspense` shows a fallback (typically a spinner)
while a lazily-loaded component's code is still downloading.

**`TOPICS.map(...)` with `key={topicName}`** — the same list-rendering pattern from
Flutter Playground Lesson 5's dropdown, now producing clickable buttons instead of
`<option>`s.

Run the app, visit `/#/roadmap` directly by typing it into the address bar.
**Expected output:** "No topic selected." Click one of the three buttons.
**Expected output:** the URL itself changes to `/#/roadmap/react` (or whichever you
clicked), and the text updates to "Currently viewing: react" — with no page
reload, because `navigate()` updated the route entirely inside the already-running
app, exactly Step 1's whole point, now something you triggered and watched happen
yourself. Use the browser's back button. **Expected output:** it returns to
`/#/roadmap` with no topic selected — proving `HashRouter` genuinely integrates with
the browser's real history, not just its own internal state.

---

## Connect the Pieces

`RoadmapPage.tsx` uses exactly the same two tools — `useParams` for reading a
dynamic segment, `useNavigate` for changing the URL from code — as the real
`LessonPage.jsx` you read in Step 3, applied to a much simpler two-route case
instead of a three-route, wildcard-including one. Once dynamic segments and
`useParams`/`useNavigate` are understood at this small scale, `LessonPage.jsx`'s
extra `rest`/`"*"` wildcard-handling is the only genuinely new piece left to read,
and it's a small addition on top of a shape you now fully know.

---

## What Breaks Without This

Register only `<Route path="roadmap" .../>` and omit the `:topic` variant entirely:
visiting `/#/roadmap/react` directly (typed URL, or a bookmark) matches **no**
route at all — this app's route table (check `App.jsx`'s end) has a catch-all
"not found" route for exactly this situation, so the user sees a real "page not
found" state instead of your component, even though `RoadmapPage.tsx` itself is
perfectly capable of handling a `topic` parameter — the component being correct
doesn't help if no route ever routes to it with that parameter present.

---

## Definition of Done

- [ ] `src/pages/RoadmapPage.tsx` exists, is lazily imported, and both
      `/#/roadmap` and `/#/roadmap/:topic` are registered and work
- [ ] Clicking a topic button changes the URL and the rendered content with no full
      page reload — you watched the URL bar change yourself
- [ ] The browser back button correctly returns to the previous route
- [ ] You can explain why this app uses `HashRouter` instead of `BrowserRouter`
- [ ] You can correctly predict, without running it, which of `LessonPage.jsx`'s
      three real routes matches a given example URL (try writing out the trace for
      `/#/chapter/python/intro` yourself before checking against Step 3's own trace)
- [ ] You can explain the difference between `<Link to="...">` and calling
      `navigate(...)` — when you'd reach for each one
- [ ] `git commit` explaining why: for example, "Add a small dynamic-route example
      page (RoadmapPage) demonstrating useParams/useNavigate against this app's
      real HashRouter setup"
