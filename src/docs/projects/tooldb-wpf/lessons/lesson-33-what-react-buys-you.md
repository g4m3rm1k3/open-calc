# Lesson 33: The Same Table, Described Differently (What React Buys You)

**What you will build.** A new, real, standalone file,
`ToolDB/react-demo.html`, rendering the identical real tool data this
project's own DataTables-based table (DataTables Fundamentals) already
shows — built instead as a real React component, using real JSX, with a
real, live-filtering search box. Deliberately not yet wired into
`local.html` or the real C#↔JS bridge — that's Wiring React Into the Same
Bridge's own job. The transferable problem underneath the feature: this
project's own existing JS (jQuery Basics onward) always describes *how*
to change the page — find this element, set its text, rebuild that
table's own rows by hand. React asks for something different: describe
*what* the page should look like for the data you currently have, and
let the library work out how to get the real, live page there.

**What you need to know first.** DataTables Fundamentals — the real
table this lesson's own React component deliberately reproduces, so the
comparison is concrete, not abstract. jQuery Basics — the real
`$('#tools-table tbody').html(rows.join(''))` rebuild-by-hand style this
lesson's own approach is directly contrasted against.

**Terms used in this lesson**

- **component** — a real, reusable JavaScript function (or class, not
  used in this project) that returns a description of what part of a
  page should look like, given some real, current input. It exists so a
  UI can be broken into real, independent, nameable pieces — `ToolRow`,
  `App` — each responsible for describing one real part of the page,
  rather than one large, tangled block of DOM-manipulation code.
- **JSX** — a real, non-standard JavaScript syntax extension, letting
  HTML-like markup be written directly inside real JavaScript code. Per
  React's own real, fetched documentation (`react.dev/learn/writing-markup-with-jsx`),
  "JSX is a syntax extension for JavaScript that lets you write
  HTML-like markup inside a JavaScript file," and its own real reasoning
  is direct: "in React, rendering logic and markup live together in the
  same place—components," which "ensures that they stay in sync with
  each other on every edit." It exists so a component's own real markup
  and the real logic that decides what that markup should be don't drift
  apart in two separate real files or sections.
- **state** — real, current data a component owns that can change over
  the real lifetime of a running page, where a real change should cause
  that component to redraw itself. It exists so a real, interactive page
  — one that responds to what a person actually does, like typing into a
  real search box — has a genuine, named place to keep "what's true right
  now," distinct from data that only ever gets set once.
- **virtual DOM** — a real, internal technique React uses: rather than
  directly rewriting real, live DOM elements every time a component
  re-runs, React first builds a real, lightweight, in-memory description
  of what the page *should* look like, compares it against the real,
  previous description, and only actually touches the real, live DOM
  where the two real descriptions differ. It exists so a component can
  be written as if it redraws its entire own output every single time,
  without that actually meaning a real, full page rebuild happens on
  every real change — the exact real problem this project's own
  hand-written `renderTools` (Enhancing What the Page Already Has) avoids
  by hand, calling `.DataTable({ destroy: true })` explicitly, every
  time, itself.

**Objects and methods used**

- **`ReactDOM.createRoot(Element)` / `.render(...)`**
  - *What it is:* `createRoot` is a real, top-level ReactDOM function
    that turns one real, existing DOM element into a real "root" React
    will manage entirely; `.render(...)` tells that real root what
    component to actually display.
  - *Implementation:* real, standard shape: `const root =
    ReactDOM.createRoot(document.getElementById('root')); root.render(<App
    />);`.
  - *Its use:* the one real, necessary bridge between this project's own
    plain HTML (`<div id="root"></div>`) and everything React itself
    manages from that point on.
  - *Type:* `createRoot` is a real, `static`-style top-level function;
    the object it returns has a real `render` instance method.
  - *Responsibility:* its full real charter is taking over one real DOM
    element completely, and, from then on, keeping whatever component is
    passed to `.render(...)` correctly reflected inside it, using the
    virtual DOM (Terms, above) to decide exactly what real, live DOM
    changes are actually needed.
  - *Depends on:* a real, already-existing DOM element to attach to.
  - *Connects to:* called exactly once, at the bottom of this lesson's
    own real script, handing control to `App` (this lesson's own root
    component).
  - *Shape:* the real, one-time setup step every real React page needs —
    everything else in this lesson's own code only ever runs *inside*
    the component tree this one real call establishes.

- **`React.useState(initialValue)`**
  - *What it is:* a real React function — a "Hook" — giving a real
    function component its own real, persistent state (Terms, above)
    across re-renders.
  - *Implementation:* per React's own real, fetched documentation
    (`react.dev/reference/react/useState`), it "returns an array with
    exactly two values" — "the current state" and "the set function,"
    used here as `const [filter, setFilter] = React.useState("");` — a
    real starting value of an empty string.
  - *Its use:* `App`'s own real filter text box — `filter` holds
    whatever's currently typed; `setFilter` is called every time it
    changes.
  - *Type:* a real, top-level React function (a "Hook," by React's own
    real naming convention for this category of function).
  - *Responsibility:* its full real charter is remembering one real
    value across every real re-render of the component that called it,
    and, per that same real documentation, "request[ing] a re-render"
    with the real, new value whenever its own real setter function is
    called — never mutating the old value in place.
  - *Depends on:* being called directly inside a real function component
    (a real React rule this lesson's own code already follows, not
    demonstrated as a separate failure here).
  - *Connects to:* `filter`'s own real, current value flows directly into
    both the real `<input value={filter} .../>` and the real
    `tools.filter(...)` computation just below it, in the same
    component.
  - *Shape:* the real, foundational mechanism behind every interactive
    React component this project will ever build — the one real way a
    component remembers anything at all between renders.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`Array.prototype.map` / `Array.prototype.filter`**
  - *What it is:* real, standard JavaScript array methods —
    reappearing, established this project's own real `for...of` loops
    (Enhancing What the Page Already Has) conceptually, though this
    exact real method pair is used here for the first time in this
    project's own code, in place of a hand-written loop.
  - *Implementation:* real, standard shapes: `array.map(item =>
    newValue)` returns a real, new array of transformed values;
    `array.filter(item => condition)` returns a real, new array
    containing only the real items the given condition returned `true`
    for.
  - *Its use:* `tools.map(tool => <ToolRow key={tool.Id} tool={tool}
    />)` turns each real tool into one real `ToolRow` element;
    `tools.filter(tool => tool.Name.toLowerCase().includes(...))`
    narrows the real list before it's ever mapped.
  - *Type:* real, built-in `Array` instance methods.
  - *Responsibility:* unchanged from their own real, standard JavaScript
    definitions — transforming or narrowing a real array without
    mutating the original.
  - *Depends on:* a real array and a real, per-element callback function.
  - *Connects to:* `filter`'s own real output is what `map` then turns
    into real JSX elements, inside `App`'s own real return value.
  - *Shape:* ordinary, real, standard JavaScript — not React-specific at
    all, used here simply because JSX expects a real array of elements
    wherever `{...}` is used to render a real list.

---

## Concept Unit: Components & JSX — Describing a Table Instead of Building One

### The Problem

`renderTools` (Enhancing What the Page Already Has) already shows every
real tool — but by hand-building a real HTML string, row by row, and
handing it to jQuery. What would it look like to describe the same real
table as a real, reusable, named piece — one that could be handed a
real tool and asked "show yourself," rather than a function that builds
a whole string from scratch every time?

> **Try this first:** this project's own `renderTools` (established
> Enhancing What the Page Already Has) already loops over `tools` and
> pushes one real HTML-string fragment per tool. Given that a **component**
> (Terms, above) is just a real function that returns a description of
> markup, what would the smallest possible real component look like for
> rendering *one* tool's own row — and how might a real, second component
> use several of those to build the whole real table?

### Introduce the Concept in Isolation

A real, minimal component, `ToolRow`, rendering one real tool as a real
table row, written in real JSX:

```jsx
function ToolRow({ tool }) {
    return (
        <tr>
            <td>{tool.Name}</td>
            <td>{tool.Manufacturer}</td>
            <td>{tool.OverallDiameter}</td>
            <td>{tool.OverallLength}</td>
            <td>{tool.FluteCount}</td>
        </tr>
    );
}
```

Run for real this session — not in a real browser, but through a real
Babel transpile plus `react-dom/server`, this project's own real
substitute for "no live browser" (the same category as "no live WPF
window"):

```
--- Real Babel-transpiled output ---
function ToolRow({ tool }) {
  return React.createElement("tr", null,
    React.createElement("td", null, tool.Name),
    React.createElement("td", null, tool.Manufacturer),
    ...
  );
}
```

This real, captured output proves the Socratic question's own answer
directly: JSX (Terms, above) is not a real, separate templating
language at all — it's compiled, by real Babel, into ordinary, real
`React.createElement(...)` calls, each one a real, plain JavaScript
function call describing one real element, its real attributes, and its
real children. `<tr>...</tr>` is not real HTML being interpreted at run
time; it's real syntax sugar for a real function call tree.

### Discard the Throwaway Example

Not applicable — `ToolRow` is real, permanent project code from the
moment it's introduced (Concept Isolation Rule; this Concept Unit's own
"isolated" proof is showing the real component's own compiled output in
isolation, not a separate throwaway component).

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/react-demo.html`, created.
  `ToolDB/ToolDB.csproj`, modified (new `<Content Include="react-demo.html"
  ... />` item).
- **Change type** — add.
- **Location** — a brand-new file, alongside `local.html`.
- **Dependencies** — real CDN scripts: `react@18`, `react-dom@18`,
  `@babel/standalone` (Commands Needed, below).

### The New Code

```jsx
function ToolRow({ tool }) {
    return (
        <tr>
            <td>{tool.Name}</td>
            <td>{tool.Manufacturer}</td>
            <td>{tool.OverallDiameter}</td>
            <td>{tool.OverallLength}</td>
            <td>{tool.FluteCount}</td>
        </tr>
    );
}

function App() {
    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Manufacturer</th>
                    <th>Overall Diameter</th>
                    <th>Overall Length</th>
                    <th>Flute Count</th>
                </tr>
            </thead>
            <tbody>
                {tools.map(tool => <ToolRow key={tool.Id} tool={tool} />)}
            </tbody>
        </table>
    );
}
```

### The Updated Project

`ToolDB/react-demo.html`, a brand-new file (Project Change already
covers the "brand-new file" case):

```html
1  <!DOCTYPE html>
2  <html>
3  <head>
4      <title>ToolDB — React Demo</title>
5      <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
6      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
7      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
8  </head>
9  <body>
10     <div id="root"></div>
11     <script type="text/babel" data-presets="react">
12         const tools = [
13             { Id: 1, Name: "1/2 in 4-Flute Carbide End Mill", Manufacturer: "O'Brien Carbide Tools", OverallDiameter: 0.5, OverallLength: 3.0, FluteCount: 4 },
14             { Id: 2, Name: "3/8 in HSS Drill Bit", Manufacturer: "O'Brien Carbide Tools", OverallDiameter: 0.375, OverallLength: 2.5, FluteCount: 2 }
15         ];
16
17         function ToolRow({ tool }) {
18             return (
19                 <tr>
20                     <td>{tool.Name}</td>
21                     <td>{tool.Manufacturer}</td>
22                     <td>{tool.OverallDiameter}</td>
23                     <td>{tool.OverallLength}</td>
24                     <td>{tool.FluteCount}</td>
25                 </tr>
26             );
27         }
28
29         function App() {
30             return (
31                 <table>
32                     <thead>
33                         <tr>
34                             <th>Name</th>
35                             <th>Manufacturer</th>
36                             <th>Overall Diameter</th>
37                             <th>Overall Length</th>
38                             <th>Flute Count</th>
39                         </tr>
40                     </thead>
41                     <tbody>
42                         {tools.map(tool => <ToolRow key={tool.Id} tool={tool} />)}
43                     </tbody>
44                 </table>
45             );
46         }
47
48         const root = ReactDOM.createRoot(document.getElementById('root'));
49         root.render(<App />);
50     </script>
51 </body>
52 </html>
```

Real tool data is deliberately given the identical real, PascalCase
shape (`Name`, `Manufacturer`, `OverallDiameter`, `OverallLength`,
`FluteCount`) this project's own real `JsonSerializer.Serialize` output
already uses (Passing C# Data to HTML) — a deliberate choice, explained
directly in this unit's own SE Lens, anticipating this exact real data
eventually replacing the throwaway array Wiring React Into the Same
Bridge's own job.

### Mechanical Walkthrough

- `function ToolRow({ tool })` — `function` (reappearing) declares a
  real component (Terms, above); `{ tool }` is real JavaScript
  destructuring (a real, first-appearing JS syntax in this project,
  though `[List<Tool> Tools, List<string> Errors]`-style destructuring
  already appeared on the C# side, established Aggregating Many Users'
  Files Automatically) — React always calls a component with one real
  object of named "props," and this real syntax pulls `tool` straight
  out of it.
- `<tr>{...}</tr>` — real JSX (Terms, above); every `<td>{tool.Name}</td>`
  -style expression embeds a real, ordinary JavaScript expression
  (`tool.Name`) directly inside real, HTML-like markup, evaluated and
  inserted as real text.
- `function App() { ... }` — a second real component — this project's
  own first real example of one component (`App`) using another
  (`ToolRow`) as a real building block.
- `{tools.map(tool => <ToolRow key={tool.Id} tool={tool} />)}` —
  `.map` (Header, above) transforms the real `tools` array into a real
  array of `<ToolRow>` elements; `key={tool.Id}` is a real, required
  React convention for any real list of elements — a real, stable
  identifier letting React's own virtual DOM (Terms, above) tell, across
  renders, which real row is which, even if the real list's own order
  changes later; `tool={tool}` passes the current real tool as that
  component's own real `tool` prop.
- `const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);` — Header, above — the real, one-time real setup
  connecting this real component tree to the real, live page.

### CS Lens

Rendering `App` as "call this real function, get back a real
description of the whole page, let the library figure out what actually
changed" is a concrete instance of **declarative programming** —
stating *what* the result should look like for the current real data,
rather than *how* to transform the real, existing page step by step, the
way this project's own jQuery-based `renderTools` (imperative: find
this, set that, rebuild this) already does. The virtual DOM (Terms,
above) is the real, specific mechanism making that declarative style
practical without a real, full-page rebuild on every real change — React
computes the real, minimal set of actual DOM edits by diffing two real,
in-memory descriptions, the same real idea, at a different real layer,
as this project's own SQLite `EXPLAIN QUERY PLAN` (Indexes & Query
Planning) choosing the real, minimal real work needed to answer a query,
rather than always scanning everything. Also recognized in: SQL itself
(`SELECT` describes *what* rows you want, not the real steps to find
them); a real spreadsheet formula, describing a cell's own real value in
terms of others, recalculated automatically rather than by a person
re-typing it.

### SE Lens

Why give the real, throwaway `tools` array this exact PascalCase shape,
rather than the more idiomatic real JavaScript convention (`camelCase`
— `name`, `manufacturer`) this lesson's own React code otherwise follows
throughout (`filter`, `setFilter`)? The real alternative — `camelCase`
data, matching JS convention — was rejected here deliberately: this
lesson's own real data is a stand-in for what Wiring React Into the Same
Bridge will eventually feed this exact component for real — the
identical real JSON `JsonSerializer.Serialize` already produces (Passing
C# Data to HTML), which is PascalCase because it mirrors `Tool`'s own
real C# property names directly, with no case conversion applied on
either side of the bridge. Matching that real shape now avoids a real,
avoidable rename later. The real, honest cost: this file's own data now
reads slightly against ordinary JS convention, worth flagging directly
rather than leaving unexplained.

### Run It

A real Babel transpile and a real `react-dom/server` static render were
both run this session, via a real, temporary Node.js project — this
project's own standing "no live browser" constraint (parallel to "no
live WPF window") means the real, rendered result was never watched in
an actual browser tab this session. Real source and captured output
saved in `verification/lesson-33/lab1-jsx-and-state-real-babel-and-ssr.md`.

### Connecting Back

`react-demo.html` now renders the identical real tool data this
project's own DataTables table already shows, built instead as two real,
composed components — proven, by a real transpile and a real static
render, to produce the correct real markup. The next unit makes it
genuinely interactive.

---

## Concept Unit: State — A Component That Remembers What It's Doing

### The Problem

`App` currently renders the same real table every single time it runs —
nothing about it can change in response to anything a real person does.
A real, live filter box needs somewhere to keep "what's currently
typed" and needs that value to actually affect what gets rendered. Where
does a real, plain JavaScript function — which, by itself, forgets
everything the instant it returns — keep something like that?

> **Try this first:** `AboutViewModel`'s own real `_toolCount` field
> (XAML Data Binding & MVVM Basics) is a real, ordinary, private field —
> C# objects already have somewhere real to keep state between calls,
> because an object instance persists. A real React component,
> `function App() { ... }`, is just a real function — it has no real
> object instance of its own to hold a private field in. Given that,
> what real mechanism would a component need, specifically, to remember
> a real value the *next* time it's called — and how would it know to
> get called again at all, once that value changes?

### Introduce the Concept in Isolation

`React.useState` (Header, above), added directly to the real, permanent
`App` component, with a real, live filter box:

```jsx
function App() {
    const [filter, setFilter] = React.useState("");
    const filteredTools = tools.filter(tool => tool.Name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div>
            <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter by name"
            />
            <table>
                {/* ...thead unchanged... */}
                <tbody>
                    {filteredTools.map(tool => <ToolRow key={tool.Id} tool={tool} />)}
                </tbody>
            </table>
        </div>
    );
}
```

Real, captured proof, run this session via the identical real Babel/SSR
technique — first, the real, default render:

```html
<div><input placeholder="Filter by name" value=""/>...both real tools shown...</div>
```

Then, with the real filter value set to `"drill"` (simulating what a
real, typed character would produce, since this session's own real
Node-based check has no real browser DOM to fire a genuine `onChange`
event through):

```html
<div><input placeholder="Filter by name" value="drill"/>...only the real "3/8 in HSS Drill Bit" row remains...</div>
```

This real, captured pair of outputs proves the Socratic question's own
answer directly: `useState` gives `App` a real, persistent value
(`filter`) that survives across real re-renders, and the real filtering
computation, `tools.filter(...)`, genuinely narrows the rendered real
output based on it — proven correct for two real, different values of
that state, not merely one.

### Discard the Throwaway Example

Not applicable — `useState` and the real filter box are added directly
to `App`, this project's own real, permanent component, with no separate
throwaway version (Concept Isolation Rule; this unit's own real,
temporary substitution of the initial state value, used only to prove
the filtering logic without a real browser event, is itself the
isolated proof, discarded from the permanent file the moment this
lesson's own verification was captured).

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `ToolDB/react-demo.html`, modified (`App`
  extended with real state and a real filter input).
- **Change type** — add.
- **Location** — `react-demo.html`'s own `App` component, established
  this lesson's first unit.
- **Dependencies** — `tools` (this lesson's first unit).

### The New Code

```jsx
const [filter, setFilter] = React.useState("");
const filteredTools = tools.filter(tool => tool.Name.toLowerCase().includes(filter.toLowerCase()));
```

### The Updated Project

`react-demo.html`'s own `App` component, with real state and a real
filter box added directly inside it:

```jsx
29  function App() {
30      const [filter, setFilter] = React.useState("");                                              // ← new
31      const filteredTools = tools.filter(tool => tool.Name.toLowerCase().includes(filter.toLowerCase()));  // ← new
32
33      return (
34          <div>                                                                                       // ← changed
35              <input                                                                                   // ← new
36                  value={filter}                                                                        // ← new
37                  onChange={e => setFilter(e.target.value)}                                             // ← new
38                  placeholder="Filter by name"                                                          // ← new
39              />                                                                                        // ← new
40              <table>
41                  <thead>
42                      <tr>
43                          <th>Name</th>
44                          <th>Manufacturer</th>
45                          <th>Overall Diameter</th>
46                          <th>Overall Length</th>
47                          <th>Flute Count</th>
48                      </tr>
49                  </thead>
50                  <tbody>
51                      {filteredTools.map(tool => <ToolRow key={tool.Id} tool={tool} />)}                // ← changed
52                  </tbody>
53              </table>
54          </div>                                                                                       // ← changed
55      );
56  }
```

`App` is now this project's own first real, interactive React component
— typing into its own real filter box narrows the real, rendered table
live, with no real page reload and no hand-written DOM manipulation
anywhere in this new real code.

### Mechanical Walkthrough

- `const [filter, setFilter] = React.useState("");` — `useState`
  (Header, above) called with a real, initial `""`; real array
  destructuring (reappearing, `{ tool }` from this lesson's first unit,
  the array-shaped form here instead of the object-shaped one) unpacks
  its own real, two-element real return array into `filter` and
  `setFilter`.
- `const filteredTools = tools.filter(tool => tool.Name.toLowerCase()
  .includes(filter.toLowerCase()));` — `.filter` (Header, above); `
  .toLowerCase()`/`.includes(...)` are real, ordinary `String` methods —
  reappearing in spirit from this project's own C# `string` handling,
  first real JS appearance here — making the real match
  case-insensitive.
- `<input value={filter} onChange={e => setFilter(e.target.value)}
  placeholder="Filter by name" />` — a real, self-closing JSX element
  (Header, above); `value={filter}` binds the real input's own displayed
  text to the current real state — this is what makes it a real
  "controlled" input, React's own real term for an input whose value is
  always driven by real state rather than the browser's own internal
  memory; `onChange={e => setFilter(e.target.value)}` is a real, inline
  arrow function (reappearing) — `e.target.value` reads the real,
  current text out of the real, native DOM event, and `setFilter`
  (Header, above) requests a real re-render with it.
- `{filteredTools.map(tool => <ToolRow key={tool.Id} tool={tool} />)}` —
  reappearing from this lesson's first unit, now mapping the real,
  already-narrowed `filteredTools` instead of the full real `tools`
  array.

### CS Lens

`useState`'s own real, two-part shape — read the current real value,
call a real function to request the next one, never mutate in place —
is a concrete instance of **immutable state transition** — the same
real discipline this project's own `Tool` record already embodies at
the C# layer (Records & Strong Types): a new real value replaces the
old one instead of being edited in place, which is exactly what lets
React's own virtual DOM (Terms, above) reliably compare "before" and
"after" to compute the real, minimal set of DOM changes needed. Also
recognized in: this project's own already-established immutable `Tool`
record, reappearing at a different real layer of the same application;
a real version-control commit, which never edits history in place, only
ever adds a new, real snapshot; a real functional-programming language's
own insistence that a "changed" value is really a new value, not the old
one mutated.

### SE Lens

Why keep `filteredTools` as a real, separate, derived value recomputed
on every render, rather than storing the real, already-filtered list
itself in a second `useState`? The real alternative — a second, real
`filteredTools` state variable, updated manually inside `onChange` — was
rejected here because it would create two real, independent sources of
truth (`filter` and `filteredTools`) that could genuinely drift apart if
a future real code change updated one without the other; deriving
`filteredTools` fresh, every render, directly from `filter` and `tools`
guarantees it can never be stale, the identical real "single source of
truth" principle this project's own Wiring Live Data Into Both UIs
lesson already named for its own, different real reason. The real,
honest cost: `tools.filter(...)` genuinely re-runs on every real
keystroke, recomputing the whole real, filtered list from scratch each
time — a real, deliberate, currently-harmless tradeoff for this
project's own small, real tool count, and not yet a real problem this
lesson needs to optimize.

### Run It

A real Babel transpile and a real `react-dom/server` static render were
both run this session, for two real, distinct state values (`""` and
`"drill"`), via the identical real Node.js setup as this lesson's first
unit. This project's own standing "no live browser" constraint applies
here too — a genuine, real `onChange` DOM event was never fired in an
actual browser this session; the real filtering logic itself was proven
correct by directly substituting the state `useState` starts from,
which is mathematically identical to what a real `setFilter` call would
produce, without requiring a real, live DOM to generate that call from.
Real source and captured output saved in
`verification/lesson-33/lab1-jsx-and-state-real-babel-and-ssr.md`.

### Connecting Back

`react-demo.html`'s own `App` component is now genuinely interactive —
proven correct for more than one real state value, not just its own
initial one — while still living entirely apart from this project's own
real C#↔JS bridge and its own real, live `tools.db` data.

---

## Connect the Pieces

The same two real, throwaway tools — an end mill and a drill bit —
traced through both units:

1. `ToolRow` and `App`, two real, composed React components, were built
   and proven, through a real Babel transpile and a real
   `react-dom/server` render, to produce the identical real table
   structure this project's own DataTables-based table already shows —
   described declaratively, not built by hand, row by row (Unit 1).
2. `React.useState` gave `App` a real, persistent filter value, proven
   correct against two real, distinct states — narrowing the real,
   rendered table live, entirely inside this one, real, self-contained
   component, with no jQuery, no manual DOM rebuilding, and no real
   C#↔JS bridge involved at all yet (Unit 2).

## Commands Needed

No terminal commands were required this lesson — `react-demo.html`
loads React, ReactDOM, and Babel standalone directly from real CDN
`<script>` tags (`unpkg.com`), the identical real, no-build-step pattern
this project has already used for jQuery and DataTables (jQuery Basics,
DataTables Fundamentals), rather than a real, separate Node.js/npm
build pipeline. `npm`/`node` were used this session only for real,
temporary verification (`verification/lesson-33/`), never as part of
this project's own real, shipped code.

**Next lesson:** 34 — Wiring React Into the Same Bridge (reusing the
Slice 3 C#↔JS bridge to drive React state instead of DataTables
redraws).
