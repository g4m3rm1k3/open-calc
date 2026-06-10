# FlowBoard Masterclass — Series Specification

**Series name:** FlowBoard Masterclass  
**What we are building:** A full-stack Trello-style board application called FlowBoard — a task/project management tool with cards, lists, and boards. By the end of the series it is a real, deployable app you can extend into a manufacturing workflow tool.  
**Teaching document:** Every lab in this series is written following `LESSON-REQUIREMENTS-UNIVERSAL.md`. Before writing any lab, that document is read in full and every quality checklist item is verified before the lab is marked done.
**Curriculum source of truth:** `flowboard-masterclass/FLOWBOARD-CURRICULUM.md` (complete lab sequence 00–63 for planning and session handoff)
**Session efficiency protocol:** `flowboard-masterclass/SESSION-USAGE-PLAN.md` (batch generation targets and handoff rules for paid-session optimization)
**Multi-agent merge rubric:** `flowboard-masterclass/MULTI-AGENT-LESSON-RUBRIC.md` (objective scoring to prefer abstraction transfer over writing style)

---

## The Core Promise

This series teaches the two things every other course skips:

1. **CSS as a design system** — not as a list of properties to memorize, but as a mental model that transfers to Qt, Flutter, WPF, or any other UI toolkit you ever touch.
2. **Database design from scratch** — not a pre-made schema handed to you, but the process of drawing entities, spotting repetition, and deciding when to split, join, or embed data.

Every other skill — React, TypeScript, FastAPI, testing — is taught in service of those two goals.

---

## What the Learner Already Knows

**Assumed — the learner knows these things exist:**
- HTML tags (`<div>`, `<p>`, `<button>`, `<input>`) — not mastered, just recognized
- CSS rules (`color: red`, `font-size: 16px`) — knows the syntax exists, not the model
- Basic data types — string, number, boolean, array, object — knows they exist
- An `if` statement — knows what branching means

**Not assumed — everything else is taught from zero:**

*Languages and frameworks:*
- TypeScript — zero assumed, taught from the first type annotation
- React — zero assumed, taught from "what is a component"
- FastAPI / Python web frameworks — zero assumed
- MongoDB or any database — zero assumed
- Any CSS layout system (Flexbox, Grid) — zero assumed
- HTTP, REST, APIs — zero assumed
- Git workflow — zero assumed
- Testing of any kind — zero assumed
- Terminal commands beyond "I've run something before" — zero assumed

*Object-Oriented Programming (OOP) — taught as needed, not as a prerequisite:*
- Class, instance, constructor — zero assumed
- Inheritance, extends, override — zero assumed
- Encapsulation — what it means, why it exists — zero assumed
- Polymorphism — zero assumed
- Interface vs abstract class — zero assumed

*Functional Programming (FP) — taught as needed, not as a prerequisite:*
- Pure function — what makes a function "pure" — zero assumed
- Side effect — the term and what counts as one — zero assumed
- Immutability — why you'd want it — zero assumed
- Higher-order function — a function that takes or returns a function — zero assumed
- `.map()`, `.filter()`, `.reduce()` — the pattern, not just the syntax — zero assumed
- Closure — what it captures and why that matters — zero assumed
- Composition — building behavior by combining functions — zero assumed

*Software engineering terms — defined when first used:*
- Separation of concerns — zero assumed
- Single responsibility principle — zero assumed
- DRY (Don't Repeat Yourself) — acronym explained on first use
- CRUD (Create, Read, Update, Delete) — acronym explained on first use
- REST (Representational State Transfer) — explained on first use
- API (Application Programming Interface) — explained on first use
- Abstraction — the concept, not just the word — zero assumed
- Dependency — what it means for one thing to depend on another — zero assumed
- Coupling and cohesion — zero assumed
- Idempotency — zero assumed (appears with HTTP methods)
- Race condition — zero assumed (appears with concurrent edits)
- Optimistic vs pessimistic — zero assumed (appears with concurrency)
- Schema — zero assumed (appears with first database design)
- Migration — zero assumed (appears with first schema change)
- Index (database) — zero assumed
- Foreign key — zero assumed
- Normalization — zero assumed
- N+1 query problem — zero assumed
- Authentication vs Authorization — both terms explained on first use
- JWT (JSON Web Token) — acronym and concept explained on first use
- Middleware — zero assumed
- Component (in the React sense and the generic SE sense) — both defined
- State — what "state" means in a UI context — zero assumed
- Rendering — what "render" means in a React context — zero assumed
- Props — zero assumed
- Hook — zero assumed (React-specific term)
- Async / await — zero assumed
- Promise — zero assumed
- Callback — zero assumed
- Event loop — zero assumed (appears when async is introduced)
- Design pattern — the term itself — zero assumed
- Gang of Four — zero assumed (cited when patterns are named)

**The define-before-use rule from the spec applies strictly here.** If a term would trip up someone who knows only the base list above, it gets a definition block — no exceptions, no "this is obvious" shortcuts.

---

## Teaching Philosophy Additions (Series-Specific)

### Alternative Implementation Rule

When a real project would use a library to solve a problem, the lab does both:

1. **Raw implementation first** — build it with only the platform (CSS, vanilla JS, browser APIs). Understand the mechanism.
2. **Library version second** — swap in the library, see what it replaces, understand what it hides and what it costs.

This applies to:
- Drag and drop: raw CSS + pointer events → then `@dnd-kit/core`
- Animations: raw CSS transitions/keyframes → then Framer Motion (optional)
- Form validation: raw state + logic → then React Hook Form
- HTTP: raw `fetch` → then a query library
- Date handling: raw JS Date → then `date-fns`

The student never uses a library as a black box. They always see the raw version first so they know what the library is actually doing.

### UI Variant Rule

The Trello board is the teaching vehicle, not the only thing we build. Optional view modes are introduced when the underlying concept (layout, data shape, query) is interesting enough to teach. These are not extras — they are the point where the CSS and database lessons become truly generalized.

Planned variants (taught when the underlying concept is ready):

| View | CSS concept taught | DB/query concept taught |
|---|---|---|
| Board (Kanban) | Flexbox — horizontal scroll, fixed-width columns | Simple document read, list membership |
| Table view | CSS Grid — named areas, sticky headers | Aggregation, column-oriented thinking |
| Gantt chart | CSS Grid + positioning — date-to-pixel mapping | Date range queries, dependencies |
| Calendar view | Grid — implicit vs explicit grid | Grouping by date field |
| List view | Flow layout, spacing rhythm | Pagination, cursor-based |

Each variant is introduced as a **layout challenge** — you already have the data, now show it differently.

### Styling Progression

CSS is not taught all at once. It deepens across the series:

| Phase | What is taught | Mechanism |
|---|---|---|
| Phase 1 (Labs 1–4) | The box model — every element is a box with margin, border, padding, content | Build a card from scratch, one property at a time |
| Phase 2 (Labs 5–8) | Flexbox — one-dimensional layout, how children negotiate space inside a parent | Board columns laid out |
| Phase 3 (Labs 9–13) | Intrinsic sizing — why things don't grow or shrink the way you expect | Cards that stretch, truncate, or overflow |
| Phase 4 (Labs 14–17) | CSS custom properties (variables) — a design token system | Theming, dark mode |
| Phase 5 (Labs 18–21) | CSS Grid — two-dimensional layout | Table view, Gantt |
| Phase 6 (Labs 22+) | Motion — transitions, keyframes, when animation communicates vs decorates | Drag feedback, state transitions |

**The transferable principle taught at each phase:**  
Every phase ends with a section called "This in Qt / other toolkits" that maps the CSS concept to its equivalent in a desktop or native UI system. The student finishes each phase able to apply the same mental model in a different environment.

---

## The Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| Frontend language | TypeScript | 5.x | Type safety forces you to model data before rendering it — the best database design teacher |
| Frontend framework | React | 19.x | Component model teaches separation of concerns naturally |
| Build tool | Vite | 6.x | Instant dev server, zero config to start |
| Styling | Raw CSS → CSS Modules | — | Learn the model before adding structure |
| Backend language | Python | 3.12+ | Readable, fast to prototype |
| Backend framework | FastAPI | 0.110+ | Automatic docs, type-safe with Pydantic, async-first |
| Database Phase 1 | MongoDB (local) | 7.x | Document model matches the board shape naturally — fast to start |
| Database Phase 2 | PostgreSQL | 16.x | Taught via deliberate migration when MongoDB's limits appear |
| ORM | SQLAlchemy | 2.x | Taught after raw SQL — you see what it hides |
| Auth | JWT + FastAPI OAuth2 | — | Industry standard, full flow taught from scratch |
| Testing backend | Pytest | — | Unit + integration at the DB layer |
| Testing frontend | Vitest + React Testing Library | — | Component behavior, not implementation |
| Deployment | Docker + Railway or Render | — | Module 6+ |

---

## Module Map

### Module 1 — The Card (Labs 1–4)
**Theme:** Get one thing on screen and make it look like something.  
**CSS taught:** The box model — margin, padding, border, background, border-radius, box-shadow  
**DB taught:** Nothing yet — data is hardcoded  
**TS taught:** Interfaces (the `Card` type), props typing  
**React taught:** What a component is, JSX, props  

- Lab 01 — Project setup: Vite + React + TS. A `<div>` with text on screen.
- Lab 02 — The Card component: structure first (unstyled), then one CSS rule at a time.
- Lab 03 — Card props: TypeScript interface for a Card. Multiple cards from an array.
- Lab 04 — Card list layout: fix card contrast and optional description rendering, then Flexbox column list spacing with spread-props map usage.

---

### Module 2 — The Board (Labs 5–8)
**Theme:** Multiple lists side by side. The Trello shape.  
**CSS taught:** Flexbox — row direction, horizontal scroll, flex-shrink, min-width  
**DB taught:** Nothing yet — hardcoded data with real shape  
**TS taught:** Discriminated unions, type narrowing  
**React taught:** Lifting state up, component composition  

- Lab 05 — The List component: a titled column of cards.
- Lab 06 — The Board component: lists side by side. Horizontal scroll.
- Lab 07 — TypeScript data model: `Board → List → Card` type hierarchy designed on paper first.
- Lab 08 — Sidebar navigation: fixed sidebar layout. CSS position model taught here.

---

### Module 3 — The Backend Arrives (Labs 9–12)
**Theme:** Replace hardcoded data with a real API.  
**CSS taught:** Loading states — skeleton UI, opacity, animation  
**DB taught:** MongoDB document design — you draw the schema before writing a line  
**TS taught:** `async/await`, `Promise`, type-safe fetch  
**React taught:** `useEffect`, `useState`, async data fetching  

- Lab 09 — FastAPI setup: one GET endpoint, automatic docs at `/docs`, Pydantic model matches TS type.
- Lab 10 — MongoDB connection: design the schema yourself (no starter files). Insert and read documents.
- Lab 11 — Wiring React to FastAPI: `fetch`, loading state, error state. CSS skeleton while loading.
- Lab 12 — Full CRUD: Create, Read, Update, Delete cards via API. Each operation one lab step.

---

### Module 4 — Real Interaction (Labs 13–16)
**Theme:** Users create and edit things. Drag and drop.  
**CSS taught:** Intrinsic sizing, overflow, z-index and stacking context  
**DB taught:** Ordering — how do you store "card position in a list"?  
**TS taught:** Generics, utility types (`Partial`, `Omit`, `Pick`)  
**React taught:** Controlled inputs, forms, optimistic updates  

- Lab 13 — Add card form: controlled input, submit handler, POST to API.
- Lab 14 — Inline editing: click a title to edit it. PATCH to API.
- Lab 15 — Drag and drop RAW: pointer events, CSS transform, manual drop detection. No library.
- Lab 16 — Drag and drop with `@dnd-kit`: swap in the library. Compare what it replaced. Persist card order to DB.

---

### Module 5 — Auth and Multiple Users (Labs 17–20)
**Theme:** Login, per-user boards, shared boards, admin roles.  
**CSS taught:** CSS custom properties — design tokens, dark mode  
**DB taught:** The permissions problem — who owns what, join tables  
**TS taught:** Discriminated union for auth state, type guards  
**React taught:** Context API, protected routes, React Router  

- Lab 17 — JWT auth: the full flow from first principles. Sign up, log in, token storage.
- Lab 18 — Protected routes: React Router, redirect if not logged in.
- Lab 19 — Per-user boards: the `owner_id` field. DB query filtering by user.
- Lab 20 — Roles and invites: `admin` vs `member` role on the user record. Admin generates a single-use invite token. Recipient clicks invite link, sets their own password, token is consumed. Teaches RBAC, token expiry, and multi-step auth flows.

---

### Module 6 — The Hard Problems (Labs 21–24)
**Theme:** The things that break at real scale.  
**CSS taught:** CSS Grid — table view, named grid areas  
**DB taught:** N+1 queries, indexes, concurrent write conflicts  
**TS taught:** Discriminated unions for API responses, error types  
**React taught:** `useReducer`, optimistic locking in the UI  

- Lab 21 — The N+1 problem: you hit it naturally. Measure it. Fix it with aggregation/population.
- Lab 22 — Concurrent edits: two tabs, same card, last-write-wins. Then optimistic locking with `version`.
- Lab 23 — Table view: same data, Grid layout. A completely different visual representation.
- Lab 24 — Indexes: why queries slow down and how to fix it. Run `explain()` and read the output.

---

### Module 7 — Quality (Labs 25–27)
**Theme:** Make it trustworthy.  
**Testing taught:** What to test and why — not everything, the right things  

- Lab 25 — Backend testing: Pytest, testing the DB layer (queries have rules, rules get tests).
- Lab 26 — Frontend testing: Vitest + React Testing Library. Test behavior, not implementation.
- Lab 27 — The PostgreSQL migration: same data, relational schema. Write raw SQL first, then SQLAlchemy.

---

### Module 8 — The Manufacturing Spin (Labs 28+)
**Theme:** Your domain. Designed in collaboration after Module 7.  
**Core architectural addition: Typed Board Templates**

The generic FlowBoard data model (Workspace → Project → Board → List → Card) is extended with a `boardType` field. Each board type has a `BoardTemplate` — a predefined schema of default columns and card field definitions — stored in the database. Creating a board from a template clones that schema, enforces mandatory fields, and enables type-specific views and reports.

**Why this beats Monday:** Monday gives you one blank board for every need. Typed templates give you a board that already knows what it is — the right columns, the right fields, mandatory fields enforced — while still being customizable per instance.

**Planned board types for manufacturing context:**

| Board Type | Default lists | Key card fields |
|---|---|---|
| **New Part Launch** | Design → Prototype → Validation → Production Ready | Part number, drawing revision, approval status, responsible engineer |
| **Floor Issue** | Open → Investigating → Root Cause Found → Resolved | Machine, shift, severity (low/medium/high), root cause, corrective action |
| **Tooling** | Requested → Ordered → Received → Qualified | Tool number, supplier, lead time days, location, linked operation |
| **Work Order** | Queued → In Progress → QC → Complete → Shipped | Part number, quantity, machine assignment, operator, due date |

**Technical concepts this teaches:**
- Discriminated unions in TypeScript — `type CardData = TaskCard | IssueCard | ToolingCard | WorkOrderCard` — TypeScript enforces that each type has its correct fields
- DB polymorphism — how to store different card shapes in one table (JSON column for type-specific fields vs separate tables per type — both patterns taught with tradeoffs)
- Template cloning — INSERT from a template record, not from user input
- Dynamic forms — React renders different input fields based on `boardType` at runtime

**Other planned extensions:**
- Machine assignment (a card assigned to a resource, not just a person)
- Gantt chart view (date ranges, dependencies between work orders)
- Reporting dashboard (MongoDB aggregations or PostgreSQL GROUP BY)

**Integration layer — the key architectural differentiator:**

FlowBoard for manufacturing is not a manual data entry tool. It is a view into data that already exists. The app has an ingestion API — a set of FastAPI endpoints that external scripts and scrapers POST data to. The board auto-populates from that data rather than requiring someone to type it in.

Existing data sources to integrate (owned by the user — not built in this course):

| Source | What it provides | Where it feeds |
|---|---|---|
| CNC program file scraper | Tools used per program, part number, programmer name | Tooling board cards auto-created per tool; Work Order cards pre-filled |
| Historical parts/tools database | Part history, tool history, known programmers | Lookup/autocomplete in card forms; pre-population on card creation |
| Responsibility matrix database | Who owns which part number | Card `assignee` field pre-filled on work order creation |
| PDM / revision control app | Current drawing revision, operational sequence, process data | Linked fields on work order cards; revision shown live from PDM API |
| Machine data feeds | Current job running, machine state, cycle status | Machine Status board — live dashboard updated via WebSocket push |

**The four data layers of the full system:**

| Layer | Description | Update pattern |
|---|---|---|
| Board/Task layer | FlowBoard — the app being built | Event-driven — users and scrapers create/update cards |
| Machine status layer | What job is running on which machine, live | State-driven — machine feeds push updates continuously via WebSocket |
| Document/revision layer | PDM — drawings, revisions, operational data | Pull on demand — FlowBoard fetches current revision from PDM API when card is opened |
| Historical layer | Parts, tools, programmers, past jobs | Batch ingestion — periodic scraper runs POST to ingestion endpoints |

**Machine Status board — architectural distinction:**

This board is fundamentally different from task boards. Cards are not created by users — they reflect the current state of physical machines, updated automatically when a machine reports a state change. The board is a live dashboard, not a task list. Technically:
- Machine data feeds POST to a FastAPI `/machines/status` ingestion endpoint
- FlowBoard server pushes the update to all connected browser clients via WebSocket
- React updates the board card in real time without a page refresh
- This is the same WebSocket infrastructure used for real-time collaboration (Module 7) — the machine is just another "client" pushing state changes

**Development testing strategy:**
Historical data is the test dataset. The database is seeded with real historical jobs, tools, and parts — no fabricated test data needed. This means the UI is tested against realistic data volumes and shapes from day one.

**Long-term vision:**
When the PDM app (revision control + operational data) is fully built, the two systems merge at the API level — FlowBoard becomes the operational interface, PDM becomes the document source of truth. FlowBoard cards link to PDM records by part number and revision. This is the system the entire learning journey is building toward.

**What this means for the data model:**

Cards have two kinds of fields: **native fields** (created and edited inside FlowBoard) and **linked fields** (read from an external record, not editable inside the app — the source of truth is external). A work order card's `toolList` is a linked field — it came from the scraper and FlowBoard displays it but does not own it.

This is a real architectural pattern called **system of record** vs **system of engagement**. The ERP / historical DB is the system of record (owns the data). FlowBoard is the system of engagement (the place people work with it). The integration layer keeps them in sync.

**Technical concepts this teaches (Module 8):**
- Ingestion endpoints — FastAPI routes that accept POST from external scripts, not from the UI
- Idempotent writes — the scraper may POST the same part twice; the second POST updates, not duplicates (`upsert` in MongoDB / `INSERT ... ON CONFLICT DO UPDATE` in PostgreSQL)
- Linked vs native fields — the data model distinguishes fields FlowBoard owns from fields it displays but does not control
- Webhook pattern — optionally, FlowBoard pushes notifications back to external systems when a card status changes

**Design constraint:** The integration layer is additive — it uses the same Board/List/Card model. An ingested work order card and a manually created task card are the same underlying type. The scraper is just another client of the API.

**Design constraint:** The base data model (Board → List → Card) must not be changed to support typed boards — the template system extends it. This constraint is intentional: it ensures the generic app built in Modules 1–7 continues to work while the manufacturing layer adds on top.

The specific labs in this module are designed after Module 7 is complete, based on the actual manufacturing problem to solve.

---

## Complete Topic Coverage — The Master Checklist

This is the authoritative list of every topic this series teaches. Every item must appear in at least one lab with a full concept block. When writing a lab, check items off here. When a lab is done, mark each item with the lab number that teaches it.

**Reading this list:** `[ ]` = not yet taught. `[LAB-NN]` = taught in that lab. A concept appears on this list only once — the lab that first teaches it owns it. Later labs that use it reference back.

---

### CSS — Complete Coverage

**The Box Model**
- [LAB-02] What the box model is — content, padding, border, margin
- [ ] `box-sizing: border-box` — why it changes how width is calculated
- [LAB-02] `padding` — shorthand and individual sides
- [LAB-01] `margin` — shorthand, individual sides, margin collapse (the surprising behavior)
- [LAB-02] `border` — width, style, color shorthand
- [LAB-02] `border-radius` — rounding corners, pill shape, circle
- [LAB-02] `width` and `height` — explicit sizing — *width taught in LAB-02; height in a later lab*
- [ ] `min-width`, `max-width`, `min-height`, `max-height` — constraint-based sizing
- [LAB-02] `box-shadow` — offset-x, offset-y, blur, spread, color, inset

**Color and Typography**
- [LAB-01] Color formats — hex (`#rrggbb`), `rgb()`, `hsl()`, named colors, when to use each
- [LAB-01] `color` — text color
- [LAB-01] `background-color`
- [ ] `background-image` — gradients as background
- [LAB-01] `font-family` — system fonts, web-safe stacks
- [LAB-01] `font-size` — px, rem, em — the difference and when to use each
- [LAB-01] `font-weight` — numeric scale (100–900)
- [ ] `font-style` — italic
- [ ] `line-height` — unitless values and why they are preferred
- [LAB-01] `letter-spacing`
- [ ] `text-align` — left, center, right, justify
- [ ] `text-decoration` — underline, none, line-through
- [ ] `text-transform` — uppercase, capitalize
- [ ] `text-overflow` — ellipsis with overflow hidden
- [ ] `white-space` — nowrap, pre, pre-wrap
- [ ] `word-break` — break-word

**Gradients**
- [ ] `linear-gradient()` — direction, color stops, percentages
- [ ] `radial-gradient()` — shape, position, color stops
- [ ] `conic-gradient()` — for pie charts and loading spinners
- [ ] Multiple backgrounds — stacking gradients
- [ ] Gradient as border trick (using `background-clip`)

**Selectors and Specificity**
- [ ] Element selector (`h1`, `div`)
- [ ] Class selector (`.card`)
- [ ] ID selector (`#root`) — and why to avoid for styling
- [ ] Descendant combinator (`div p`)
- [ ] Child combinator (`div > p`)
- [ ] Adjacent sibling (`h2 + p`)
- [ ] General sibling (`h2 ~ p`)
- [ ] Attribute selector (`[type="text"]`)
- [ ] Specificity — how the browser decides which rule wins
- [ ] `!important` — what it does and why it is a last resort
- [ ] The cascade — order, specificity, inheritance

**Pseudo-classes**
- [ ] `:hover` — pointer over element
- [ ] `:focus` — keyboard/click focus
- [ ] `:focus-visible` — focus only when navigating by keyboard
- [ ] `:active` — while being clicked
- [ ] `:visited` — for links
- [ ] `:checked` — for checkboxes and radios
- [ ] `:disabled` — for form elements
- [ ] `:first-child`, `:last-child`, `:nth-child(n)`
- [ ] `:not(selector)` — negation
- [ ] `:empty` — element with no children
- [ ] `:placeholder-shown` — when placeholder is visible

**Pseudo-elements**
- [ ] `::before` and `::after` — generated content, decorative shapes
- [ ] `::placeholder` — style placeholder text
- [ ] `::selection` — style selected text
- [ ] `::first-line`, `::first-letter`

**Layout — The Position Model**
- [ ] `display` — block, inline, inline-block, none
- [ ] `position: static` — the default, in normal flow
- [ ] `position: relative` — offset from its natural position, creates stacking context
- [ ] `position: absolute` — removed from flow, positioned to nearest positioned ancestor
- [ ] `position: fixed` — relative to the viewport, stays on scroll
- [ ] `position: sticky` — hybrid: in flow until threshold, then fixed
- [ ] `top`, `right`, `bottom`, `left` — offsets for positioned elements
- [ ] `z-index` — stacking order
- [ ] Stacking context — what creates one, why z-index stops working
- [ ] `overflow` — visible, hidden, scroll, auto
- [ ] `overflow-x`, `overflow-y` — independent axis control
- [ ] `float` — historical, but still appears (taught to demystify, not to use)
- [ ] `clear` — clearing floats

**Layout — Flexbox**
- [LAB-01] `display: flex` — activating Flexbox on a container — *introduced in context only; fully taught in LAB-06*
- [ ] Main axis vs cross axis — the two directions Flexbox controls
- [ ] `flex-direction` — row, column, row-reverse, column-reverse
- [ ] `flex-wrap` — nowrap, wrap, wrap-reverse
- [LAB-01] `justify-content` — main axis alignment (start, end, center, space-between, space-around, space-evenly) — *introduced in context only; fully taught in LAB-06*
- [LAB-01] `align-items` — cross axis alignment (stretch, start, end, center, baseline) — *introduced in context only; fully taught in LAB-06*
- [ ] `align-content` — cross axis alignment when wrapping (same values as justify-content)
- [ ] `gap`, `row-gap`, `column-gap` — spacing between flex items
- [ ] `flex-grow` — how an item claims extra space
- [ ] `flex-shrink` — how an item gives up space
- [ ] `flex-basis` — the item's starting size before grow/shrink
- [ ] `flex` shorthand — `flex: 1`, `flex: 0 0 auto`, etc.
- [ ] `align-self` — override align-items for one item
- [ ] `order` — reorder items visually without changing the DOM
- [ ] `min-width: 0` on flex children — why flex items overflow by default

**Layout — CSS Grid**
- [ ] `display: grid` — activating Grid on a container
- [ ] `grid-template-columns` — defining column tracks
- [ ] `grid-template-rows` — defining row tracks
- [ ] `fr` unit — fractional space
- [ ] `repeat()` — repeating track patterns
- [ ] `minmax()` — responsive tracks with min and max
- [ ] `auto-fill` vs `auto-fit` — the difference for responsive grids
- [ ] `grid-template-areas` — named areas for semantic layout
- [ ] `grid-area` — assigning an item to a named area
- [ ] `grid-column`, `grid-row` — span and placement shorthand
- [ ] `grid-column-start`, `grid-column-end` — explicit placement
- [ ] `gap` in Grid — same as Flexbox
- [ ] Implicit vs explicit grid — what happens when items overflow the defined tracks
- [ ] `grid-auto-rows`, `grid-auto-columns` — sizing implicit tracks
- [ ] `grid-auto-flow` — row, column, dense
- [ ] Subgrid — aligning nested grids to a parent grid

**Intrinsic Sizing**
- [ ] `min-content` — smallest the element can be without overflow
- [ ] `max-content` — as wide as the content wants to be
- [ ] `fit-content` — clamp between min-content and a given max
- [ ] `auto` — context-dependent sizing
- [ ] Why flex items don't shrink below their content (min-width: auto)

**CSS Custom Properties (Variables)**
- [ ] Declaring a variable — `--color-primary: #fff`
- [ ] Using a variable — `var(--color-primary)`
- [ ] Fallback values — `var(--color-primary, #000)`
- [ ] Scope — `:root` for global, component class for local
- [ ] Overriding variables for theming (dark mode)
- [ ] Computed variables — setting a variable based on another variable

**Transitions**
- [ ] `transition` shorthand — property, duration, timing-function, delay
- [ ] `transition-property` — which property to animate
- [ ] `transition-duration` — how long
- [ ] `transition-timing-function` — ease, linear, ease-in, ease-out, ease-in-out, `cubic-bezier()`
- [ ] `transition-delay`
- [ ] What can and cannot be transitioned
- [ ] Transitioning `opacity` vs `visibility` — the difference for accessibility
- [ ] Transitioning `transform` — the performant way to animate position

**Animations (`@keyframes`)**
- [ ] `@keyframes` — defining an animation sequence
- [ ] `animation-name`
- [ ] `animation-duration`
- [ ] `animation-timing-function`
- [ ] `animation-delay`
- [ ] `animation-iteration-count` — number or `infinite`
- [ ] `animation-direction` — normal, reverse, alternate, alternate-reverse
- [ ] `animation-fill-mode` — none, forwards, backwards, both
- [ ] `animation-play-state` — paused, running
- [ ] `animation` shorthand
- [ ] Multiple animations on one element
- [ ] `prefers-reduced-motion` — accessibility media query for animations

**Transform**
- [ ] `transform` — applying multiple transforms in sequence
- [ ] `translate()`, `translateX()`, `translateY()`, `translate3d()`
- [ ] `scale()`, `scaleX()`, `scaleY()`
- [ ] `rotate()`, `rotate3d()`
- [ ] `skew()`, `skewX()`, `skewY()`
- [ ] `transform-origin` — the pivot point
- [ ] Why `transform` is preferred over changing `top`/`left` for animation (GPU compositing)
- [ ] `will-change` — hinting the browser for smoother animation
- [ ] `perspective` — enabling 3D transforms
- [ ] `backface-visibility`

**Responsive Design**
- [ ] `@media` — media queries
- [ ] `min-width` vs `max-width` breakpoints — mobile-first vs desktop-first
- [ ] Common breakpoints and why they are arbitrary
- [ ] `em` vs `rem` vs `px` in media queries
- [ ] Viewport units — `vw`, `vh`, `vmin`, `vmax`, `dvh`
- [ ] `clamp()` — fluid sizing between a min and max
- [ ] Container queries (`@container`) — responding to parent size not viewport
- [ ] `aspect-ratio`
- [ ] Responsive images — `max-width: 100%`, `object-fit`

**CSS Modules (project-specific structure)**
- [ ] What CSS Modules are — local scope by default
- [ ] `import styles from './Card.module.css'`
- [ ] `styles.cardTitle` vs global `.card-title`
- [ ] `:global()` — opting out of scoping
- [ ] `composes` — extending another class

**Miscellaneous CSS**
- [ ] `cursor` — pointer, default, grab, grabbing, not-allowed
- [ ] `user-select` — none, text, all
- [ ] `pointer-events` — none (for pass-through)
- [ ] `outline` vs `border` — why they differ and when to use each
- [ ] `visibility: hidden` vs `display: none` vs `opacity: 0` — the three ways to hide
- [ ] `scroll-behavior: smooth`
- [ ] `scroll-snap` — snap scrolling for carousels
- [ ] `resize` — for textarea
- [ ] CSS reset vs normalize — what they solve and why this project uses a minimal reset
- [ ] `calc()` — mixing units in calculations
- [ ] `clamp()` — three-value fluid property
- [ ] `min()`, `max()` — single-value clamp alternatives

---

### TypeScript — Complete Coverage

**Types and Type Annotations**
- [ ] Primitive types — `string`, `number`, `boolean`, `null`, `undefined`
- [LAB-01] Type annotation syntax — `const name: string = "value"`
- [LAB-01] Type inference — when TypeScript figures it out without annotation
- [ ] `any` — what it does, why it defeats the purpose
- [ ] `unknown` — the safe alternative to `any`
- [ ] `never` — a type that cannot have a value (exhaustive checks)
- [ ] `void` — for functions that return nothing
- [ ] `object` type vs object literal type
- [ ] Array types — `string[]` and `Array<string>`
- [ ] Tuple types — `[string, number]`
- [ ] `readonly` — immutable properties and arrays
- [ ] Type assertions — `as Type` and when they are legitimate
- [ ] Non-null assertion — `!` and why it is risky
- [ ] `typeof` — type narrowing with runtime type check
- [ ] `instanceof` — type narrowing with class instances

**Interfaces and Type Aliases**
- [LAB-03] `interface` — defining an object shape
- [ ] `type` alias — naming any type, not just objects
- [ ] `interface` vs `type` — when to use each and the differences
- [LAB-03] Optional properties — `title?: string`
- [ ] Readonly properties — `readonly id: string`
- [ ] Index signatures — `[key: string]: number`
- [ ] Extending interfaces — `interface B extends A`
- [ ] Intersection types — `TypeA & TypeB`
- [ ] Union types — `TypeA | TypeB`
- [ ] Discriminated unions — a union where a literal field identifies the variant
- [ ] Literal types — `type Direction = 'left' | 'right'`
- [ ] Template literal types — `` `card-${string}` ``

**Functions**
- [ ] Function type annotations — parameters and return type
- [ ] Arrow functions — `(x: number) => number`
- [ ] Optional parameters — `function fn(x?: number)`
- [ ] Default parameters — `function fn(x = 0)`
- [ ] Rest parameters — `...args: string[]`
- [ ] Function overloads — multiple signatures for one implementation
- [ ] `void` return type
- [ ] Callbacks typed as function types
- [ ] Higher-order functions — functions that take or return functions

**Generics**
- [ ] What generics are — parameterizing types
- [ ] Generic functions — `function identity<T>(value: T): T`
- [ ] Generic interfaces — `interface Box<T> { contents: T }`
- [ ] Generic constraints — `<T extends { id: string }>`
- [ ] Multiple type parameters — `<T, U>`
- [ ] Default type parameters — `<T = string>`
- [ ] Generic utility types (built-in)

**Utility Types**
- [ ] `Partial<T>` — all properties optional
- [ ] `Required<T>` — all properties required
- [ ] `Readonly<T>` — all properties readonly
- [ ] `Pick<T, K>` — select a subset of properties
- [ ] `Omit<T, K>` — exclude properties
- [ ] `Record<K, V>` — object with keys of type K and values of type V
- [ ] `Exclude<T, U>` — remove union members
- [ ] `Extract<T, U>` — keep matching union members
- [ ] `NonNullable<T>` — remove null and undefined
- [ ] `ReturnType<T>` — infer the return type of a function
- [ ] `Parameters<T>` — infer the parameter types of a function
- [ ] `Awaited<T>` — unwrap a Promise type

**Type Narrowing and Guards**
- [ ] `typeof` narrowing
- [ ] `in` operator narrowing
- [ ] `instanceof` narrowing
- [ ] Truthiness narrowing — `if (value)`
- [ ] Custom type guard functions — `function isCard(x): x is Card`
- [ ] Discriminated union narrowing — narrowing by a shared literal field
- [ ] `satisfies` operator — validating type without widening

**Enums and Const**
- [ ] `enum` — named constants
- [ ] `const enum` — inlined at compile time
- [ ] String enums vs numeric enums
- [ ] Why `const` object with `as const` is often preferred over `enum`
- [ ] `as const` — making an object's values literal types

**Modules**
- [LAB-01] `import` / `export` — ES module syntax
- [LAB-01] `export default` vs named exports
- [ ] Re-exporting — `export { X } from './module'`
- [ ] Type-only imports — `import type { Card } from './types'`
- [ ] `tsconfig.json` path aliases — `@/components` instead of `../../components`

**Classes (TypeScript-specific)**
- [ ] Class syntax — `class Card { ... }`
- [ ] Constructor — `constructor(private title: string)`
- [ ] Access modifiers — `public`, `private`, `protected`
- [ ] `readonly` class fields
- [ ] `abstract` classes and methods
- [ ] Implementing an interface — `class X implements ICard`
- [ ] When to use classes vs plain objects in this project

**Advanced Types**
- [ ] Mapped types — `{ [K in keyof T]: ... }`
- [ ] Conditional types — `T extends U ? X : Y`
- [ ] Infer keyword in conditional types
- [ ] Template literal types
- [ ] Recursive types — types that reference themselves

---

### React — Complete Coverage

**Component Fundamentals**
- [LAB-01] Function components — the only kind used in this series
- [LAB-01] JSX — the return value of a component
- [LAB-02] Component composition — components inside components
- [ ] `children` prop — the slot pattern
- [LAB-03] `key` prop — why React needs it for lists and what happens without it
- [ ] `Fragment` — `<>...</>` — returning multiple elements without a wrapper
- [LAB-03] Conditional rendering — `&&`, ternary, early return — *`&&` taught in LAB-03; ternary and early return in a later lab*
- [LAB-03] Rendering lists — `.map()` and the key requirement
- [ ] `null` as a render return — rendering nothing

**Props**
- [LAB-03] Passing props — `<Card title="Fix bug" />`
- [LAB-03] Receiving props — typed with TypeScript interface
- [ ] Default prop values
- [ ] Spreading props — `<Card {...cardData} />`
- [ ] `children` typed as `React.ReactNode`
- [ ] Event handler props — `onClick: () => void`
- [ ] Prop drilling — the problem, not just the term
- [ ] When prop drilling is fine vs when it is a problem

**State — `useState`**
- [ ] `useState` — declaring state and the setter
- [ ] State is a snapshot — not a live variable
- [ ] State updates are asynchronous — you don't see the new value immediately
- [ ] Functional update form — `setCount(prev => prev + 1)`
- [ ] Object state — updating without mutation (`...spread`)
- [ ] Array state — adding, removing, updating items immutably
- [ ] `useState` with TypeScript — explicit type parameter
- [ ] When to use local state vs lifting state

**Effects — `useEffect`**
- [ ] `useEffect` — running code after render
- [ ] The dependency array — what it controls
- [ ] Empty array `[]` — run once on mount
- [ ] No array — run after every render (and why that is almost never what you want)
- [ ] Cleanup function — returned from useEffect, runs on unmount or before re-run
- [ ] `useEffect` for data fetching — the pattern and its limitations
- [ ] Strict Mode double-invocation — why effects run twice in development
- [ ] Common mistakes — missing dependencies, infinite loops

**Refs — `useRef`**
- [ ] `useRef` — mutable value that does not trigger re-render
- [ ] `ref` on a DOM element — accessing the DOM node
- [ ] The difference between a ref and state — when to use each
- [ ] `forwardRef` — passing a ref to a child component

**Performance Hooks**
- [ ] `useMemo` — memoizing an expensive computation
- [ ] `useCallback` — memoizing a function reference
- [ ] When they help and when they are premature optimization
- [ ] `React.memo` — preventing re-renders of a component

**Reducers and Context**
- [ ] `useReducer` — state + dispatch + action pattern
- [ ] Action types as discriminated unions
- [ ] When `useReducer` is better than `useState`
- [ ] `createContext` — creating a context
- [ ] `useContext` — consuming a context
- [ ] Context Provider — wrapping a tree to supply a value
- [ ] Context performance — why large contexts cause unnecessary re-renders
- [ ] Splitting context — one context for data, one for dispatch

**Custom Hooks**
- [ ] What a custom hook is — a function that uses other hooks
- [ ] The `use` prefix rule — why it matters
- [ ] `useFetch` — a custom hook wrapping fetch + loading + error state
- [ ] `useLocalStorage` — persisting state in localStorage
- [ ] `useDebounce` — delaying a value update
- [ ] `useClickOutside` — closing a dropdown when clicking outside
- [ ] When to extract a custom hook vs keep logic inline

**React Router**
- [ ] `BrowserRouter` — wrapping the app
- [ ] `Routes` and `Route` — declaring routes
- [ ] `Link` and `NavLink` — navigation without page reload
- [ ] `useNavigate` — programmatic navigation
- [ ] `useParams` — reading URL parameters
- [ ] `useSearchParams` — reading query string parameters
- [ ] Nested routes — layouts that persist across child routes
- [ ] Protected routes — redirecting unauthenticated users
- [ ] 404 routes — catch-all

**Forms**
- [ ] Controlled inputs — `value` + `onChange`
- [ ] Uncontrolled inputs — `defaultValue` + `ref`
- [ ] `onSubmit` with `event.preventDefault()`
- [ ] Form validation — raw state-based approach
- [ ] React Hook Form — the library version, what it replaces
- [ ] `useForm`, `register`, `handleSubmit`, `formState`
- [ ] Field-level vs form-level validation

**Error Handling**
- [ ] Error boundaries — class-based, where they are still needed
- [ ] `react-error-boundary` library — the practical solution
- [ ] Error state in data fetching
- [ ] `try/catch` in async functions
- [ ] User-facing error messages vs developer error messages

**Suspense and Lazy Loading**
- [ ] `React.lazy` — code-splitting a component
- [ ] `Suspense` — showing a fallback while a lazy component loads
- [ ] Suspense for data fetching (React 19 approach)

**React 19 Additions**
- [ ] `use()` hook — reading a promise or context
- [ ] Server Components concept — what they are, where they fit
- [ ] `useOptimistic` — optimistic UI updates
- [ ] `useFormStatus` and `useFormState` — form integration with actions
- [ ] `useTransition` — marking a state update as non-urgent

**React Patterns**
- [ ] Compound components — components that share implicit state
- [ ] Render props — passing a function as a child
- [ ] Higher-order components (HOC) — historical, taught to recognize
- [ ] Container / Presentational split — when and why
- [ ] Controlled vs uncontrolled components — for any interactive element

---

### Database — Complete Coverage

**Core Database Concepts (language-agnostic)**
- [ ] What a database is — persistent, structured storage separate from the application
- [ ] Row vs document vs key-value — three fundamental storage models
- [ ] Schema — the definition of data shape
- [ ] Query — asking the database for data
- [ ] Index — a data structure that speeds up queries at the cost of write speed
- [ ] Transaction — a group of operations that all succeed or all fail
- [ ] ACID properties — Atomicity, Consistency, Isolation, Durability
- [ ] Primary key — the unique identifier for a record
- [ ] Foreign key — a reference to a primary key in another table
- [ ] Normalization — organizing data to reduce redundancy
- [ ] Denormalization — intentional redundancy for read performance
- [ ] Constraint — a rule the database enforces on data

**MongoDB**
- [ ] Document model — JSON-like documents in collections
- [ ] Collections vs tables — the conceptual mapping
- [ ] `_id` field — MongoDB's automatic primary key
- [ ] Inserting documents — `insertOne`, `insertMany`
- [ ] Reading documents — `findOne`, `find`, query filters
- [ ] Query operators — `$eq`, `$gt`, `$lt`, `$in`, `$and`, `$or`, `$not`
- [ ] Projection — selecting which fields to return
- [ ] Updating documents — `updateOne`, `updateMany`, `replaceOne`
- [ ] Update operators — `$set`, `$unset`, `$push`, `$pull`, `$inc`
- [ ] Deleting documents — `deleteOne`, `deleteMany`
- [ ] Sorting — `.sort()`
- [ ] Limiting and skipping — `.limit()`, `.skip()`
- [ ] Counting — `.countDocuments()`
- [ ] Embedding vs referencing — the core MongoDB design decision
- [ ] `ObjectId` — the type of `_id` and how to compare it
- [ ] Aggregation pipeline — `$match`, `$group`, `$project`, `$sort`, `$limit`, `$lookup`
- [ ] `$lookup` — the MongoDB equivalent of a SQL JOIN
- [ ] `$unwind` — flattening an array field
- [ ] Indexes in MongoDB — `createIndex`, compound indexes, text indexes
- [ ] `explain()` — reading a query plan
- [ ] Transactions in MongoDB — multi-document transactions
- [ ] Connection pooling — why connections are expensive to create
- [ ] PyMongo — the Python driver
- [ ] Motor — the async Python driver (used with FastAPI)

**SQL and PostgreSQL**
- [ ] What SQL is — Structured Query Language, the language of relational databases
- [ ] `SELECT` — reading data
- [ ] `WHERE` — filtering rows
- [ ] `ORDER BY` — sorting
- [ ] `LIMIT` and `OFFSET` — pagination
- [ ] `INSERT INTO` — adding rows
- [ ] `UPDATE` — modifying rows
- [ ] `DELETE` — removing rows
- [ ] `CREATE TABLE` — defining a table schema
- [ ] `ALTER TABLE` — modifying a schema after creation
- [ ] `DROP TABLE` — removing a table
- [ ] Data types — `TEXT`, `VARCHAR`, `INTEGER`, `BIGINT`, `BOOLEAN`, `TIMESTAMP`, `UUID`, `JSONB`
- [ ] `NOT NULL` constraint
- [ ] `UNIQUE` constraint
- [ ] `PRIMARY KEY`
- [ ] `FOREIGN KEY` and `REFERENCES`
- [ ] `ON DELETE CASCADE` vs `ON DELETE SET NULL`
- [ ] `DEFAULT` values
- [ ] `CHECK` constraint
- [ ] `INNER JOIN` — rows present in both tables
- [ ] `LEFT JOIN` — all rows from left, matched rows from right
- [ ] `RIGHT JOIN`
- [ ] `FULL OUTER JOIN`
- [ ] `JOIN` with multiple conditions
- [ ] Subqueries — a query inside a query
- [ ] Common Table Expressions (CTE) — `WITH name AS (...)`
- [ ] `GROUP BY` — aggregating rows
- [ ] `HAVING` — filtering aggregated groups
- [ ] Aggregate functions — `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`
- [ ] Window functions — `ROW_NUMBER()`, `RANK()`, `LAG()`, `LEAD()`, `OVER()`
- [ ] `DISTINCT`
- [ ] `IN`, `NOT IN`, `EXISTS`, `NOT EXISTS`
- [ ] `BETWEEN`
- [ ] `LIKE` and `ILIKE` — pattern matching
- [ ] `COALESCE` — first non-null value
- [ ] `CASE WHEN` — conditional logic in SQL
- [ ] `RETURNING` — getting the inserted/updated row back
- [ ] Transactions — `BEGIN`, `COMMIT`, `ROLLBACK`
- [ ] Isolation levels — READ COMMITTED, REPEATABLE READ, SERIALIZABLE
- [ ] `SELECT FOR UPDATE` — pessimistic locking
- [ ] Optimistic locking — `version` column pattern
- [ ] Indexes — B-tree, Hash, GIN (for JSONB and arrays)
- [ ] Partial indexes — indexes with a `WHERE` clause
- [ ] `EXPLAIN` and `EXPLAIN ANALYZE` — reading a query plan
- [ ] Migrations — versioned schema changes, up and down

**Database Design**
- [ ] Entity-Relationship (ER) modeling — drawing before coding
- [ ] One-to-many relationship — design and implementation
- [ ] Many-to-many relationship — the join table
- [ ] Self-referential relationship — a row that references another row in the same table
- [ ] 1NF, 2NF, 3NF — normalization forms, taught through feeling the pain first
- [ ] When to denormalize — and what you trade
- [ ] Soft delete — `deleted_at` timestamp instead of removing rows
- [ ] Audit trail — `created_at`, `updated_at`, `created_by`
- [ ] UUID vs auto-increment IDs — tradeoffs
- [ ] Cursor-based pagination vs offset pagination

**ORM — SQLAlchemy**
- [ ] What an ORM is — Object-Relational Mapping — the concept before the library
- [ ] Declarative models — mapping a class to a table
- [ ] Session — the unit of work pattern
- [ ] `query()` vs `select()` (SQLAlchemy 2.x style)
- [ ] `add()`, `commit()`, `rollback()`, `close()`
- [ ] Relationships — `relationship()`, `back_populates`
- [ ] Lazy vs eager loading — `lazy='select'` vs `joinedload()`
- [ ] The N+1 problem as generated by ORM lazy loading
- [ ] Alembic — migrations for SQLAlchemy
- [ ] When to drop down to raw SQL — and how to do it with SQLAlchemy

---

### HTTP and APIs — Complete Coverage

- [ ] What HTTP is — HyperText Transfer Protocol
- [ ] Request and response — the fundamental exchange
- [ ] HTTP methods — GET, POST, PUT, PATCH, DELETE, OPTIONS
- [ ] Status codes — 200, 201, 204, 400, 401, 403, 404, 409, 422, 500
- [ ] Headers — Content-Type, Authorization, Accept, CORS headers
- [ ] Request body — JSON, form data
- [ ] Query parameters vs path parameters vs request body — when to use each
- [ ] REST — Representational State Transfer — the convention
- [ ] RESTful resource naming — `/boards`, `/boards/:id`, `/boards/:id/lists`
- [ ] Idempotency — which methods are idempotent and why it matters
- [ ] CORS — why browsers block cross-origin requests and how to allow them
- [ ] `fetch` API — the browser's built-in HTTP client
- [ ] `async/await` with `fetch`
- [ ] Error handling with `fetch` — why a 404 is not a thrown error
- [ ] Pydantic — data validation in FastAPI
- [ ] FastAPI dependency injection — `Depends()`
- [ ] FastAPI middleware
- [ ] WebSockets — real-time communication (introduced for live board updates)

---

### Auth — Complete Coverage

- [ ] Authentication vs Authorization — the distinction
- [ ] Session-based auth — the old model
- [ ] Token-based auth — why it replaced sessions for APIs
- [ ] JWT — JSON Web Token — header, payload, signature
- [ ] JWT signing — HS256 symmetric vs RS256 asymmetric
- [ ] Access token vs refresh token
- [ ] Token storage — localStorage vs httpOnly cookie — security tradeoffs
- [ ] Password hashing — bcrypt, why plain text is never acceptable
- [ ] OAuth2 — the protocol (not just "login with Google")
- [ ] FastAPI OAuth2PasswordBearer
- [ ] Protected endpoints — `Depends(get_current_user)`
- [ ] Role-based access control (RBAC) — `admin` vs `member` role on the user record; FastAPI checks role on protected routes
- [ ] Row-level security — a user can only see their own data
- [ ] Invite tokens — admin generates a single-use signed token with expiry; recipient redeems it to complete registration; token is marked consumed after use
- [ ] Multi-step auth flows — the "pending" user state; completing registration in a second step
- [ ] Token consumption — why a single-use token must be invalidated immediately on use

---

### Testing — Complete Coverage

- [ ] What testing is for — not coverage, not proving correctness, catching regressions
- [ ] Unit test — testing one function in isolation
- [ ] Integration test — testing multiple parts working together
- [ ] End-to-end test — testing the whole system from the user's perspective
- [ ] Test pyramid — why most tests should be unit, some integration, few E2E
- [ ] What NOT to test — implementation details, simple data passthrough
- [ ] What TO test — business rules, query logic, API contracts, component behavior
- [ ] Pytest — Python test runner
- [ ] Test fixtures — `@pytest.fixture`
- [ ] `conftest.py` — shared fixtures
- [ ] Parametrized tests — testing one function with many inputs
- [ ] Mocking — replacing a dependency with a fake
- [ ] `pytest-asyncio` — testing async FastAPI routes
- [ ] `TestClient` — FastAPI's built-in test client
- [ ] Database tests — using a test database, rolling back between tests
- [ ] Vitest — the JavaScript test runner (same API as Jest)
- [ ] React Testing Library — testing component behavior
- [ ] `render`, `screen`, `fireEvent`, `userEvent`
- [ ] Queries — `getByRole`, `getByText`, `findBy` (async), `queryBy` (nullable)
- [ ] Testing accessibility — why `getByRole` is preferred
- [ ] Mocking fetch in React tests
- [ ] `vi.mock()` — mocking a module in Vitest

---

## The "This in Qt" Sections

Every CSS phase ends with a mapping. Format:

```
### This Mental Model in Other UI Systems

The concept you just learned — [name] — is not CSS-specific.
Here is how the same decision appears in other toolkits:

| Toolkit | Equivalent concept | How it differs |
|---|---|---|
| Qt (C++) | QHBoxLayout / QVBoxLayout | ... |
| Flutter | Row / Column widgets | ... |
| WPF (.NET) | StackPanel / DockPanel | ... |
| SwiftUI | HStack / VStack | ... |

The decision is always the same: you are telling a container how to distribute
space among its children. The syntax changes. The model does not.
```

---

## Lab File Naming Convention

```
LAB-01-Project-Setup.md
LAB-02-The-Card-Component.md
LAB-03-Card-Props-and-TypeScript.md
...
```

Each lab file is self-contained. A student can hand it to any AI session and say "help me with this lab" and the context is complete.

---

## Before Every Lab Is Written

The author (human or AI) must:

1. Read `LESSON-REQUIREMENTS-UNIVERSAL.md` in full — no exceptions, every time
2. Read `CONCEPT-REGISTRY.md` — confirm no concept is re-introduced as new if it was already taught
3. Read the **Complete Topic Coverage Master Checklist** in this file — identify which unchecked items this lab will cover and mark them with the lab number when done
4. Confirm the lab's Step 1 produces something visible within 5 minutes
5. Confirm no concept appears before its definition block
6. Confirm every step passes the Dead Code Test, Visible Change Test, and Removal Test
7. Run the full Quality Checklist before marking the lab done
8. After the lab is written: update `CONCEPT-REGISTRY.md` with every new concept introduced, and mark the corresponding items in the Master Checklist with `[LAB-NN]`

No lab ships without a passing checklist. No topic on the Master Checklist is left permanently unchecked — if it is not covered by a planned lab, a lab is added.

---

## Drift Prevention Protocol

Drift is the gradual erosion of spec compliance across a long series. The most common causes:

- **Session amnesia** — a new AI session has no memory of previous labs and silently reintroduces defined concepts as new, skips definition blocks, or uses different names for the same concept
- **Familiarity shortcuts** — concepts that feel "obviously understood by now" skip their definition blocks
- **Step merging** — two small steps get combined because "they're related" — violating one concept per step
- **CSS shortcutting** — CSS rules added without a CSS AND SEE block because "it's just styling"
- **Concept name drift** — "component" becomes "widget" becomes "element" across labs — confusing the learner

### The Three Drift Defenses

**Defense 1 — The Lab Prompt Template (hardest to drift past)**

Every new session that writes or continues a lab begins by pasting `LAB-PROMPT-TEMPLATE.md`. This template includes:
- A pointer to read LESSON-REQUIREMENTS-UNIVERSAL.md before writing anything
- A pointer to read SERIES-SPEC.md for series-level rules
- A pointer to read CONCEPT-REGISTRY.md to know what is already taught
- The five drift check questions (below)
- The previous lab's final state summary

**Defense 2 — The Five Drift Check Questions**

Before writing the first word of any lab, answer these five questions. If any answer is "I'm not sure," read the relevant section of the spec before continuing:

1. Does Step 1 of this lab produce something visible in under 5 minutes?
2. Is every concept that appears in this lab either (a) in the Concept Registry as already taught, or (b) given a full definition block before its first use?
3. Does every step introduce exactly one new concept or one new visible feature — not two?
4. Does every step that changes appearance have a CSS AND SEE block?
5. Does every step that changes behavior have a SAVE AND TRY block with a specific output, a console test, and a change-something experiment?

If all five are yes — proceed. If any is no — fix it before writing.

**Defense 3 — The Concept Registry**

`CONCEPT-REGISTRY.md` is a running log of every concept taught, in which lab it was introduced, and the exact name used. Rules:

- A concept is only "taught" when it has received a full concept block — not when it appeared in code comments
- If a lab uses a concept without a concept block, check the registry. If it's there — reference it ("first taught in LAB-X"). If it's not there — add a concept block now.
- The registry is updated at the end of every lab, not during — to avoid adding concepts that were planned but not written
- If the same concept appears under two different names in two different labs, that is drift. Pick one name, update the registry, update the older lab.

---

## The Goal

By the end of Module 7, the learner can:

- Design a database schema from scratch for any domain — draw it on paper, write the SQL or document model themselves
- Style any UI from zero — know exactly why something doesn't grow, why a layout breaks, how to add spacing rhythmically
- Apply the same layout thinking to Qt, Flutter, or any toolkit
- Build a full CRUD API with auth and know what every line does
- Write tests that catch real bugs, not tests that inflate coverage numbers
- Look at a manufacturing app problem and know exactly where to start

Module 8 is where that knowledge is applied to a real work problem.
