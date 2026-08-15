# Project-Based Curriculum

## What This Is

A curriculum that teaches software engineering, computer science, and mathematics
through building real, working software. Nothing is implicit. Every concept —
whether it is a design pattern, an algorithm, or a piece of maths — is named,
explained, and taught directly.

## Lesson Standard

Every lesson in this curriculum must meet the [Lesson Contract](../LESSON_CONTRACT.md).
It defines what teaching means here — two lenses on every code block, smallest runnable
units, explicit connections, maths derived not assumed.

## How It Works

Every lesson produces working software. You do not build a parser before you can
see it work. You do not learn CSS variables after you have already written a hundred
hardcoded colours. You do not add tests after the fact. The right approach is taught
from the first lesson and applied consistently throughout.

Each lesson explicitly covers:

- **The software engineering being practised** — naming, design patterns, TDD,
  agile delivery, CSS architecture, API design, separation of concerns
- **The computer science being applied** — data structures, algorithms, state machines,
  recursion, type systems, evaluation strategies
- **The mathematics involved** — wherever the code touches maths, the maths is taught

## Projects

### 1. OpenMAT — Interpreter + Visualiser
**Folder:** `openmat/`

Build a working language interpreter and a visualiser that renders the maths it
computes. You will write code, run it in a console you built, and watch a triangle
transform on screen because of maths you wrote and understand.

---

### 2. The Calculator — Graphing, Tables, and Solvers
**Folder:** `calculator/` — [Full lesson plan](calculator/README.md)

Build a graphing calculator inspired by the TI-84 and others. Not a clone — an MVP
that grows one vertical slice at a time. Each slice is something you can use immediately.

The calculator teaches a different set of problems than the interpreter. The interpreter
taught you how a language pipeline works. The calculator teaches you how a stateful
interactive application works — input handling, persistent state, rendering a
coordinate plane, evaluating a function across a domain, and finding roots numerically.

**MVPs in order:**

1. A display that shows a number — the simplest possible calculator
2. Arithmetic — add, subtract, multiply, divide
3. A history — every calculation is stored and shown
4. Variables — store a value, recall it by name
5. Functions — define `f(x)`, evaluate at a point
6. Graphing — plot `f(x)` across a domain on a canvas
7. Tables — show `x` and `f(x)` side by side for a range of values
8. Multiple graphs — plot `f(x)` and `g(x)` together, find intersections visually
9. Solvers — find the root of `f(x) = 0` numerically

Each MVP is a lesson. Each lesson ends with a calculator you can use.

**Software engineering taught:**
State management, event-driven UI, component boundaries, CSS architecture,
TDD, agile delivery, separation of concerns between input, evaluation, and rendering.

**Computer science taught:**
Expression parsing (builds on OpenMAT), coordinate space mapping, function sampling,
floating point arithmetic, numerical methods, data structures for history and tables.

**Mathematics taught:**
Functions and their graphs, domain and range, roots and intersections, Newton's method
for root finding, derivatives as the basis of Newton's method, trigonometric and
polynomial functions.

---

### 3. CAD/CAM — 3D Modelling, Toolpaths, and G-code
**Folder:** `cam/` — [Full lesson plan](cam/README.md)

Build a browser-based CAD/CAM application: draw constrained 2D sketches, extrude
them into 3D solids, generate toolpaths, and export G-code. Three.js for 3D rendering,
React for the UI, Python backend for geometry computation.

Three.js for 3D rendering, React for the UI, Python backend for geometry computation.
Every concept needed is taught in the lesson that needs it.

---

### 4. The Frontend Client — A Real UI for a Real API
**Folder:** `frontend-client/` — [Full lesson plan](frontend-client/README.md)

Build a complete frontend, in plain TypeScript/HTML/CSS with no framework, for
Conduit — a live, publicly-hosted implementation of the RealWorld API spec (a real
social blogging platform: articles, comments, favorites, JWT auth). No invented data:
every lesson calls a real production-style backend the student does not control.

Every capability — fetching, rendering, components, routing, forms, auth, search,
pagination, a notification service, caching, and a production deployment — is added
as its own vertical slice, motivated by a real, felt problem in the code that already
exists, never introduced because "you'll need this eventually."

**Software engineering taught:**
Separation of concerns (data/presentation/orchestration), the component pattern
discovered from first principles, service vs. component, the observer pattern,
client-side vs. server-side validation, environment-based configuration.

**Computer science taught:**
The event loop and `Promise`/`async`/`await`, type narrowing and discriminated
unions, debouncing, race conditions, memoization/caching with TTL-based invalidation,
bundling and code splitting.

**Web and networking taught:**
REST, JSON, CORS, HTTP methods and status codes, JWTs, XSS, offset-based pagination,
client-side routing and why it deploys cleanly to any static host.

---

### 5. React Studio — A Low-Code Application Builder
**Folder:** `react-studio/` — [Full lesson plan](react-studio/README.md)

Build a small, working version of Figma or Retool — drag widgets onto a canvas,
select and resize them, edit properties in a panel, group them, undo mistakes, wire
up click actions, save your work, and preview the result. The deliberate sibling to
[The Frontend Client](frontend-client/README.md): that project teaches architecture
in plain TypeScript so the reasons frameworks exist are felt first; this one teaches
**React** itself, using a project where the UI is the entire product, not an
interface bolted onto someone else's data.

Every major React concept is introduced at the exact moment the feature already
being built cannot proceed without it — state lifting appears because two sibling
components must agree on the truth; `useReducer` appears because undo needs a
structured history; Context appears because a button nested inside groups cannot
reach app state any other way; a registry replaces scattered switch statements
because adding a sixth widget type made the cost of not having one impossible to
ignore.

**React concepts taught:**
JSX and the virtual DOM, components and props, `useState`, list rendering and keys,
lifting state up, controlled components, discriminated unions in props, recursive
components, `useReducer`, `useContext` and custom Context hooks, custom hooks,
`React.memo` and `useCallback`, Portals, and a plugin-style registry architecture.

---

### 6. Video Notes — A Study Companion, Built in HTML Lab
**Folder:** `video-notes/` — [Full lesson plan](video-notes/README.md)

Build a real note-taking application for watching lecture and tutorial videos:
paste a YouTube link, write notes timestamped to the exact moment in the video,
tag and search and sort and reorder them, and carry the whole library out as a
file and back in. The deliberate sibling to [The Frontend Client](frontend-client/README.md)
and [React Studio](react-studio/README.md): those two teach TypeScript and React;
this one teaches plain HTML, CSS, and JavaScript, built entirely inside this
site's own **HTML Lab** — no framework, no terminal, no build step, nothing to
install. Written for a learner who has never coded at all as much as one who
already knows JavaScript and wants every gap filled in.

Every capability arrives because the application genuinely needs it, not
because a lesson invented a reason to use it: a plain `<iframe>` embed is used
first, and is only replaced by the real YouTube IFrame Player API once
"jump to the moment this note was written about" turns out to require it.
By the final lesson, a growing pile of independent functions is reorganised
into one class — motivated by repetition the student has already felt directly,
not introduced as a rule to memorise.

**Software engineering taught:**
Separation of concerns, deriving views from one source of truth instead of
duplicating state, encapsulation and refactoring toward a class, honest data
migration, debouncing, the extract-protect-reinsert pattern for safely mixing
generated and user content.

**Computer science taught:**
Closures, comparator functions and `Array.prototype.sort`, regular expressions
and capture groups, event bubbling, array destructuring, a small tokenizer-style
text-transform parser.

**Web and browser APIs taught:**
The YouTube IFrame Player API, `localStorage`, the HTML5 Drag and Drop API,
`FileReader` and `Blob` downloads, loading third-party libraries from a CDN at
runtime (KaTeX, optionally Monaco), and XSS — the first time this project
renders user-typed text as real HTML instead of plain text.

---

### 7. Pocket Inventory (WPF) — C#, XAML, and SQLite
**Folder:** `pocket-inventory-wpf/` — [Full lesson plan](pocket-inventory-wpf/README.md)

Build a desktop inventory manager in WPF: a real application shell, data-bound
screens backed by a real SQLite database, search and filtering, relational
suppliers, undo/redo, and a published, installable Windows executable. The
deliberate desktop sibling to [`track/`](track/) — the same "name it, save it,
find it again" product idea, built on Android there and WPF here, so the
platform-specific ceremony and the universal software-engineering ideas
underneath it become visible by contrast.

Code-behind is used first and MVVM is introduced only once the pain of
manually wiring click handlers is actually felt (Lesson 23) — not assumed
from lesson one. Persistence starts with raw `Microsoft.Data.Sqlite` and
hand-written SQL, the same choice this curriculum's Python/FastAPI sibling
([`inventory/`](inventory/)) made, before any ORM is discussed.

**Software engineering taught:**
Separation of concerns via MVVM, the Command pattern (and its Memento-backed
undo/redo extension), the soft-delete pattern, boundary validation, DRY
applied to XAML via styles and resource dictionaries, composable predicate
filtering, the dev/production gap in a published desktop build.

**Computer science taught:**
The Observer pattern (data binding), finite state machines (borrow/return
status), relational joins and aggregate queries, shallow vs. deep copy,
stack-based undo history, UI virtualization and the frame-time budget.

**C# and .NET taught:**
Static typing and `var` vs. Python's dynamic assignment, nullable value
types, `decimal` vs. floating point, enums, LINQ-adjacent collection types,
`ICommand`, and the .NET publishing pipeline (`dotnet publish`,
self-contained deployment).

---

### 8. SQLite Mastery — SQL, Python, a Real Backend, and a Real Desktop App
**Folder:** `sqlite-mastery/` — [Full lesson plan](sqlite-mastery/README.md)

A from-zero database curriculum built around one real, growing SQLite
file: no assumed database knowledge at all, ending in a working desktop
app — a Python/FastAPI backend serving SQLite, and a `pywebview` shell
rendering it through jQuery DataTables — then handed a *second*,
already-existing, deliberately messy database it never designed, because
reading an unfamiliar schema is its own real skill building your own
cannot teach.

**Software engineering taught:**
The repository pattern over raw SQL, boundary validation via Pydantic,
API design and HTTP status codes, CORS and same-origin policy, schema
migrations, packaging a desktop distributable.

**Computer science taught:**
Relational algebra (joins, set operations), query planning and indexing,
transactions and ACID, the observer-free polling model of a client
requesting server-rendered pages of data, process lifecycle and
concurrency, locking.

**Database and web technologies taught:**
SQL and SQLite's own dynamic type affinity, the Python `sqlite3`
standard-library module, FastAPI and Pydantic, `pywebview`, jQuery and
jQuery DataTables (including its server-side processing protocol),
FTS5 full-text search, WAL-mode concurrency, backup/restore.

---

### 9. The Bowling Game — Test-Driven Development in Java
**Folder:** `bowling-game-tdd/` — [Full lesson plan](bowling-game-tdd/README.md)

Build Robert C. Martin's classic "Bowling Game Kata" — a ten-pin scoring
engine — strictly test-first, then grow it past the kata's original small
scope into a real multi-player, persisted bowling alley with a leaderboard
and a text console. A deliberate second TDD exercise alongside Kent Beck's
own `Money` example (which this student already owns the book for), chosen
because its incremental scoring rules (open frame → spare → strike → the
tenth frame) are naturally shaped like a red-green-refactor lesson sequence.

Every Epic 1 lesson opens with a real failing test, run and shown genuinely
failing, before any production code exists — the red-green-refactor cycle
*is* this project's adaptation of the standard Concept Unit sequence.
Lesson 8 shows the kata's famous real design fork (a flat-array scoring
engine vs. an object-oriented `Frame`-based one) side by side, with honest
tradeoffs, rather than resolving it prematurely.

**Java taught (assuming Python/JavaScript, not "no programming
experience"):** primitives vs. wrapper classes and autoboxing, `==` vs.
`.equals()`, access modifiers, generics (including bounded type
parameters), enums with real behavior, checked vs. unchecked exceptions,
the Collections Framework, `Optional`, the Stream API, and `record` —
revealed late, after hand-writing the boilerplate it replaces, and
cross-referenced directly against Kotlin's `data class` and C#'s `record`
from this curriculum's other two language tracks.

**Software engineering taught:** the TDD cycle itself, "fake it till you
make it" as a legitimate intermediate step, dependency inversion via
interfaces, and refactoring backed by a real test suite as the concrete
version of Kent Beck's central argument.

The companion values-and-practices half of this ask — pairing, sustainable
pace, courage, simplicity, from *Extreme Programming Explained* — lives
separately as an independently-readable blog-post series in `src/posts/`,
not as part of this project's lessons.

---

### 10. Snake — Objects, Messages, and Design Patterns in C#
**Folder:** `snake-csharp/` — [Full lesson plan](snake-csharp/README.md)

A classic arcade game — Snake — built entirely in a terminal, no graphics
library or engine, in C#. Deliberately standalone: assumes no other lesson in
this curriculum, only real programming experience in some other language.
Paced to be finishable in a focused week rather than a term, with every
lesson ending in a real, playable change — the whole project is built around
that immediate payoff.

Taught around Alan Kay's own reframing of "object-oriented" as fundamentally
about **messaging** between independent objects, not class hierarchies — a
direct answer to "why do real frameworks use Factory, Dependency Injection,
and Pub/Sub." Interfaces are introduced as message contracts; C# events are
shown as Kay's idea realized directly; dependency injection is taught as
"declare what messages you need answered, don't construct your own concrete
dependencies" — each one explicitly connected back to that framing, not left
implicit.

**Design patterns taught:** State (menu/playing/paused/game over as real
objects), Publish/Subscribe (C# `event`/`Action<T>`, score and achievement
systems), Dependency Injection (a swappable real/fake renderer, the
mechanism behind ASP.NET Core's DI container), Strategy (a swappable AI
opponent), Factory (food variety), and Singleton — deliberately included to
be honestly critiqued, not endorsed, and contrasted against DI as the
pattern that actually solves the same problem correctly.

**C# and .NET taught:** real-time console input and rendering,
`LinkedList<T>` as a deliberate data-structure choice (and why, over
`List<T>`), interfaces vs. abstract classes, properties and encapsulation,
generics (a hand-written generic grid), and unit testing with real `xUnit` —
made possible specifically by the dependency-injection lesson that precedes
it.
