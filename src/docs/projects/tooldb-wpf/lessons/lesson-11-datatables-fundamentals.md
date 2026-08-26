# Lesson 11: Enhancing What the Page Already Has

**What you will build.** `local.html` gains a real, visible list — not just a
one-line summary — of every tool in `tools.db`: a genuine HTML `<table>`,
filled with one row per tool by JavaScript itself, then handed to a second
library, DataTables, which adds sorting and instant searching to it without
this project writing a single line of sort or search logic by hand. The
transferable problem underneath the feature has two separate halves. First:
so far, every real value shown on this page (Lesson 7's summary line, Lesson
10's count) has been one string, written directly by hand. Real data is a
*collection* — showing all of it means code has to build repeated structure
from a loop, not type it once. Second: once that structure exists, a whole
category of further behavior (sorting a column, filtering by typed text)
is common enough, and tricky enough to get right, that it makes sense to
reach for an already-solved library rather than writing it from scratch —
provided that library can be handed markup that already exists, instead of
demanding to own and rebuild it.

**What you need to know first.** Lesson 7 — `window.chrome.webview
.addEventListener('message', ...)`, `event.data`, template literals. Lesson
9 — the real `tools JOIN vendors` query, and `Manufacturer` as a real field
on every `Tool` reaching the browser as JSON. Lesson 10 — `$()`/`jQuery()`,
`.text()`, `.on()`, real CSS selector syntax, the jQuery object, and loading
an external library via a `<script src="...">` CDN tag.

**Terms used in this lesson**

- **library** — reappearing from Lesson 10: a collection of pre-written
  functions, loaded into a page, that a page's own `<script>` code can then
  call. It exists so common problems don't have to be solved from scratch by
  every project that needs them. This lesson brings in a second one,
  DataTables, alongside Lesson 10's own jQuery.
- **CDN (Content Delivery Network)** — reappearing from Lesson 10: a network
  of servers, run by a third party, that hosts a copy of a public file and
  serves it quickly to whoever requests it, so a project doesn't have to
  host a copy of a popular library itself. This lesson's own DataTables
  files are reached the same way jQuery's own file was.
- **jQuery plugin** — a library that, rather than introducing its own
  separate top-level name, adds new methods directly onto jQuery's own
  object (the same `$`/`jQuery` Lesson 10 already made real) once both have
  loaded, in the right order. It exists so a specialized library (here,
  table behavior) can build directly on general-purpose element-selection
  and DOM tooling a page has already loaded, instead of re-implementing its
  own version of `$()`/`.text()`/`.on()` from scratch just to reach the
  elements it needs to enhance.
- **external stylesheet link (`<link rel="stylesheet">`)** — an HTML tag
  that tells the browser to fetch a CSS file from a URL and apply the
  styling rules inside it to the current page, the same way `<script
  src="...">` (Lesson 10) fetches and runs a JavaScript file instead of
  running code written inline. It exists so visual styling can be written
  once, in its own file, and reused across many pages — this lesson only
  covers *that* it loads a stylesheet, not how to write CSS rules, which is
  a separate concept this curriculum covers on its own later.
- **table structure elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`,
  `<th>`, `<td>`)** — a family of HTML tags that, together, describe a grid
  of rows and columns: `<table>` is the whole grid, `<thead>` groups the
  header row(s), `<tbody>` groups the real data rows, `<tr>` is one row
  (inside either), and `<th>`/`<td>` are one cell each — `<th>` for a header
  cell, `<td>` for an ordinary data cell. They exist because a grid of rows
  and columns is common and structured enough to deserve its own dedicated
  markup, rather than being faked out of nested `<div>`s with no shared
  meaning a browser (or a library like DataTables) could rely on.
- **array (JavaScript `Array`)** — an ordered, real, built-in JavaScript
  container type holding any number of values, indexed from `0`, that can
  grow or shrink at runtime — `tools` (Lesson 7, 9, 10) is already one,
  and this lesson's own `rows` is a second, new one this lesson's own code
  creates and fills. It exists as its own real, general-purpose type,
  separate from any one project's own data, so both `.push()` and `.join()`
  (both below) work identically on any array, tool data or otherwise.
- **`for...of` loop** — a JavaScript statement that runs its body once for
  each value in something iterable (an array, here), binding a fresh
  variable to the current value on every pass — the direct JavaScript
  counterpart to Python's own `for x in some_list:`, which this lesson's own
  reader already knows. It exists because "do this once per item" is one of
  the most common shapes of code there is, and writing it by hand with an
  index and a length check every time would be repetitive and error-prone.
- **client-side rendering** — building the actual visible content of a page
  by running code *in the browser itself*, from data the browser already
  has, rather than receiving already-built HTML from somewhere else. This
  lesson's own new table rows are never sent from C# as markup — C# sends
  plain data (Lesson 7, 9), and this lesson's own JavaScript is what turns
  that data into real `<tr>` elements. It exists as a named, distinct
  approach because the alternative — building the HTML on the sending side
  and shipping finished markup — is a real, different design with its own
  tradeoffs, not the only way to get data onto a screen.
- **jQuery object** — reappearing from Lesson 10: the value `$(...)`
  returns, a wrapper around zero, one, or many matched DOM elements,
  carrying jQuery's own extra methods. This lesson calls a new one of those
  methods, `.html()`, on it.
- **CSS selector syntax** — reappearing from Lesson 10: the same pattern
  language CSS itself uses to target elements for styling, reused as the
  argument to `$(...)`. This lesson uses a selector *shape* Lesson 10 never
  needed: a **descendant combinator** — two selectors separated by a space
  (`#tools-table tbody`), meaning "an element matching the second selector,
  found somewhere inside an element matching the first" — not a single flat
  lookup like `#output` was.
- **template literal** — reappearing from Lesson 7: a backtick string with
  `${...}` interpolation slots. This lesson's own new code builds one
  `<tr>...</tr>` string per tool this way, the same mechanism Lesson 7's own
  summary sentence already used, just called once per loop iteration instead
  of once total.

**Objects and methods used**

- **`jQuery()` / `$()`**
  - *What it is:* reappearing from Lesson 10 — jQuery's own single
    entry-point function, used to find page elements matching a given
    selector.
  - *Implementation:* per jQuery's own official documentation (fetched
    Lesson 10, unchanged), it "Return[s] a collection of matched elements
    either found in the DOM based on passed argument(s)... searching through
    the DOM for any elements that match the provided selector," using real
    CSS selector syntax (Terms, above). `$` is an ordinary JavaScript
    variable, a shorthand alias for the same function also reachable as
    `jQuery`.
  - *Its use:* `$('#tools-table tbody')` and `$('#tools-table')`, both this
    lesson, the first using the new descendant-combinator selector shape
    (Terms, above) to reach the `<tbody>` living *inside* `#tools-table`,
    the second reaching the table element itself directly by its own `id`.
  - *Type:* a free function, called directly as `$(...)` — not a method on
    any object, the same shape as Lesson 10's own calls.
  - *Responsibility:* search the page's real DOM tree for every element
    matching the given selector, and hand back one jQuery object (Terms,
    above) wrapping whatever it found.
  - *Depends on:* the page's own DOM already existing at the moment `$(...)`
    is called, and a valid selector string — this lesson's own descendant
    selector additionally depends on `#tools-table` already existing as a
    real ancestor element of the `<tbody>` it's searching for.
  - *Connects to:* called directly by this lesson's own new code; its return
    value is what `.html()` and `.DataTable()` (both below) are then called
    *on*.
  - *Shape:* the single public entry point the entire jQuery library is
    reached through, unchanged since Lesson 10.
- **`.html()`**
  - *What it is:* this lesson's own new subject, alongside `.push()`/
    `.join()`/`.DataTable()` — reads or replaces the HTML markup contained
    inside every element a jQuery object wraps.
  - *Implementation:* per jQuery's own official documentation (fetched this
    session), called with no arguments it "Get[s] the HTML contents of the
    first element in the set of matched elements." Called with one string
    argument, it "Set[s] the HTML contents of each element in the set of
    matched elements" — and, critically, unlike `.text()` (Lesson 10), that
    string is *parsed as real markup*: any `<tr>`/`<td>` tags inside it
    become real elements, not literal visible text. jQuery's own
    documentation draws the contrast directly by name, noting `.text()` — not
    `.html()` — is the correct method whenever content should never be
    interpreted as markup.
  - *Its use:* `$('#tools-table tbody').html(rows.join(''))`, this lesson's
    own third unit, replacing the empty `<tbody>` established in this
    lesson's own second unit with real `<tr>` markup built from `tools`.
  - *Type:* an instance method, callable only on a jQuery object (Terms,
    above) — the same category as `.text()`/`.on()` (Lesson 10).
  - *Responsibility:* own the raw HTML markup inside whatever real
    element(s) the jQuery object it's called on currently wraps — reading
    it back, or replacing it outright and having the browser parse the
    replacement as real elements, depending on whether an argument is
    given.
  - *Depends on:* a jQuery object wrapping at least one real matched
    element, and, when setting, a string this lesson's own code is
    responsible for building as valid HTML — `.html()` itself does not
    validate or escape anything in that string.
  - *Connects to:* called directly on `$('#tools-table tbody')`'s own
    return value; the string it's given comes from this lesson's own
    `rows.join('')`, below.
  - *Shape:* the markup-setting sibling of Lesson 10's own `.text()` — same
    calling shape, opposite trust assumption about its own argument.
This lesson calls two related members of the same real type, JavaScript's
own built-in `Array` — per MDN's own official documentation (fetched this
session), their real declared shape, restricted to only the two members
this lesson actually calls:

```
push(...items) -> number    // appends items in place; returns the new length
join(separator) -> string   // combines all elements into one string; does not mutate
```

- **`.push()`**
  - *What it is:* this lesson's own new subject — adds one or more values to
    the end of a real JavaScript array.
  - *Implementation:* per MDN's own official JavaScript documentation
    (fetched this session), `push()` "adds the specified elements to the
    end of an array and returns the new length of the array" — and is
    explicitly a *mutating* method: "it changes the length and content of
    the original array" in place, rather than returning a new one.
  - *Its use:* `rows.push(...)`, called once per pass of this lesson's own
    `for...of` loop, each time with one newly built `<tr>...</tr>` string.
  - *Type:* an instance method, callable on any real JavaScript `Array` —
    the first `Array` method this project's own JavaScript has used.
  - *Responsibility:* grow one specific array, in place, by exactly the
    element(s) given — nothing about formatting, joining, or reading the
    array back.
  - *Depends on:* an already-existing array to be called on (`rows`, this
    lesson's own `const rows = [];`) and at least one value to add.
  - *Connects to:* called once per loop iteration on `rows`; everything
    `.push()` adds is later read back by `.join()`, below, once the loop
    finishes.
  - *Shape:* the append side of this lesson's own build-then-combine
    pattern — `.push()` grows the array across many iterations, `.join()`
    (below) collapses it into the one string `.html()` actually needs.
- **`.join()`**
  - *What it is:* this lesson's own new subject, alongside `.push()` —
    combines every element of a real JavaScript array into a single string.
  - *Implementation:* per MDN's own official JavaScript documentation
    (fetched this session), `join(separator)` "returns a new string that is
    the concatenation of all elements in the array, separated by commas or
    a specified separator string" — called with `''` (an empty string), as
    this lesson's own code does, elements are concatenated with nothing
    between them at all. Unlike `.push()`, `.join()` does not mutate the
    original array; it returns a brand-new string and leaves `rows` itself
    unchanged.
  - *Its use:* `rows.join('')`, this lesson's own third unit, called once,
    after the loop has finished adding every `<tr>` string to `rows`.
  - *Type:* an instance method, callable on any real JavaScript `Array` —
    the same category as `.push()`, above.
  - *Responsibility:* read every element currently in the array and produce
    one combined string — a pure, read-only operation with no effect on the
    array itself.
  - *Depends on:* an array whose elements are (or can convert cleanly to)
    strings — true here, since every element `.push()` added was already a
    real template-literal string.
  - *Connects to:* called on `rows` after `.push()` has finished adding to
    it; its own return value is passed directly into `.html()`, above,
    without an intermediate variable.
  - *Shape:* the combine side of the build-then-combine pattern this
    lesson's own third unit is built around.
- **`.DataTable()`**
  - *What it is:* this lesson's own culminating subject — DataTables' own
    jQuery-plugin entry point, called on a jQuery object wrapping a real,
    already-populated `<table>`, to enhance it with sorting, searching, and
    paging.
  - *Implementation:* per DataTables' own official documentation (fetched
    this session), calling it "enhances" an existing table — DataTables
    "adds several controls to a document when it enhances a table" — and
    returns "a DataTables API instance," a real object with its own further
    methods this lesson's own code doesn't call, among them `.search()`
    ("Search for data in the table"), `.order()` ("Get / set the ordering
    applied to the table"), and `.draw()` ("Redraw the table") — shown here
    because `.DataTable()`'s return value is a real, multi-method object,
    not a single plain value, even though this lesson only ever discards
    it. Called with no arguments, as this lesson's own code does, DataTables
    runs in what its own documentation calls zero-configuration mode: "no
    additional configuration" needed for "searching, ordering and paging
    goodness" to be "immediately added to the table."
  - *Its use:* `$('#tools-table').DataTable();`, this lesson's own fourth
    unit, called with no arguments, after this lesson's own third unit has
    already filled `#tools-table`'s `<tbody>` with real rows.
  - *Type:* an instance method, callable on a jQuery object — registered
    onto `$`'s own prototype by the DataTables library file itself (this
    lesson's own first unit), not a method jQuery ships with on its own.
  - *Responsibility:* read whatever real `<thead>`/`<tbody>` markup
    `#tools-table` already contains at the moment it's called, and, from
    that point forward, take over the table's own visible sorting, paging,
    and search-filtering behavior — a real, ongoing responsibility, not a
    one-time formatting pass.
  - *Depends on:* a jQuery object wrapping exactly one real `<table>` whose
    `<thead>`/`<tbody>` markup already exists in the DOM, and DataTables'
    own CSS and JS files (this lesson's own first unit) already loaded.
  - *Connects to:* called on `$('#tools-table')`'s own return value, after
    this lesson's own third unit's `.html()` call has already run in the
    same handler; everything it does afterward runs entirely inside
    DataTables' own code, invisible to and untouched by the rest of this
    project.
  - *Shape:* the single top-level entry point the entire DataTables plugin
    is invoked through — the same "one function, many capabilities behind
    it" shape `$()` itself already has for jQuery.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`window.chrome.webview.addEventListener('message', event => { ... })`**
  - *What it is:* reappearing from Lesson 7 — the real, WebView2-injected
    object and event this project uses to receive `tools.db` data from C#.
  - *Implementation:* established in Lesson 7, unchanged — fires once per
    real `PostWebMessageAsJson` call from `MainWindow.xaml.cs`.
  - *Its use:* still the only real place this lesson's own new code runs
    from — every new line this lesson adds lives inside this same handler,
    after the summary-line logic Lesson 7/9/10 already established.
- **`let tools = []; ... tools = event.data;`**
  - *What it is:* reappearing from Lesson 10 — a page-level variable,
    reassigned inside the `message` handler, holding whatever tool data
    arrived most recently.
  - *Implementation:* established in Lesson 10 — `let` (not `const`)
    specifically because both the `message` handler and Lesson 10's own
    click handler both need to read the same, most-recently-received data.
  - *Its use:* this lesson's own `for...of` loop reads this exact variable
    — every tool this lesson's own new table shows comes from it.
- **`$('#output').text(...)` and its template literal**
  - *What it is:* reappearing from Lesson 7 (the template literal) and
    Lesson 10 (`$()`/`.text()`) — the existing one-line summary shown above
    the new table.
  - *Implementation:* established in those lessons, unchanged.
  - *Its use:* still runs, unmodified, every time a `message` event fires —
    this lesson adds a second, richer way to see the same data (the table)
    alongside it, rather than replacing it.
- **`$('#show-count').on('click', () => { ... })`**
  - *What it is:* reappearing from Lesson 10 — the button click handler
    showing a shorter, count-only summary.
  - *Implementation:* established in Lesson 10, unchanged.
  - *Its use:* untouched by this lesson — still reads the same hoisted
    `tools` variable this lesson's own new code also reads.

---

## Concept Unit: Loading a Plugin That Extends What's Already There

### The Problem

`local.html` can show one summary line (Lesson 7, 10), but nothing on this
page can yet show every tool at once, and nothing on it knows how to sort
or filter anything. Writing sortable, searchable table behavior by hand —
comparator functions per column, re-rendering rows on every keystroke,
tracking which column is currently sorted and which direction — is real,
substantial code this project hasn't written and doesn't have to: DataTables
already solved this problem, the same reasoning Lesson 10 already used to
bring in jQuery instead of hand-writing selector logic.

> **Try this first:** Lesson 10's own `<script src="https://code.jquery.com
> /jquery-3.7.1.min.js">` fetched and ran an external JavaScript file by
> URL. jQuery's own `$()` documentation (Lesson 10's Header) also states it
> accepts real CSS selector syntax — the same pattern language CSS itself
> uses for *styling*, a topic this project hasn't touched directly yet, only
> borrowed vocabulary from. Given that a `<script src="...">` tag already
> fetches an external *script* by URL, what tag and attribute do you
> predict does the equivalent job for fetching an external *stylesheet* —
> one that exists purely to affect how a page looks, not what it does?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
- **Change type** — add (one new `<link>` tag, one new `<script>` tag).
- **Location** — inside `<head>`, immediately after the existing jQuery
  `<script src="...">` tag established in Lesson 10 — after, specifically,
  because DataTables' own documentation states jQuery must already be
  loaded first for DataTables to register itself onto it.
- **Dependencies** — jQuery already loaded (Lesson 10) and a real network
  path to DataTables' own CDN reachable from wherever `ToolDB` runs.

### The New Code

```html
<link rel="stylesheet" href="https://cdn.datatables.net/3.0.2/css/dataTables.dataTables.css" />
<script src="https://cdn.datatables.net/3.0.2/js/dataTables.js"></script>
```

### The Updated Project

`local.html`'s own `<head>`, in full, new lines marked:

```html
1  <head>
2      <title>ToolDB</title>
3      <script src="https://code.jquery.com/jquery-3.7.1.min.js"
4              integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
5              crossorigin="anonymous"></script>
6      <link rel="stylesheet" href="https://cdn.datatables.net/3.0.2/css/dataTables.dataTables.css" />   // ← new
7      <script src="https://cdn.datatables.net/3.0.2/js/dataTables.js"></script>                          // ← new
8  </head>
```

`<head>` now loads two real libraries instead of one, in a real, load-bearing
order: jQuery first (lines 3–5, unchanged since Lesson 10), then DataTables'
own stylesheet and script (lines 6–7, new) — DataTables' own script runs
after jQuery's own has already finished, so the global `jQuery`/`$` it
depends on already exists by the time it runs.

### Proving It in Isolation

No throwaway example exists for this unit — like Lesson 10's own first
unit, these two tags are already the smallest possible fragment; a
throwaway version would be identical to the real one. What's worth proving
instead is this unit's own central, currently invisible claim: that loading
DataTables' script *after* jQuery's is what actually makes `.DataTable()`
become a real, callable method on every jQuery object, without this
project writing any registration code itself. DataTables' own official
documentation (fetched this session) states this plainly: DataTables
"automatically detects jQuery's presence via the global `jQuery` variable
and registers itself as a plugin," to the point that, once both scripts
have run, `$.fn.dataTable === DataTable` — jQuery's own plugin slot and
DataTables' own real class become literally the same thing. This project's
own standing constraint (no live WPF window observed this session,
established since Lesson 5) means that exact registration wasn't
independently re-confirmed by watching it happen in a real running browser
this session — the same honest limitation this project has named at every
lesson touching real browser behavior since Lesson 5.

### Discard the Throwaway Example

No throwaway code exists for this unit, for the same reason given above.

### Mechanical Walkthrough

- `<link rel="stylesheet" href="https://cdn.datatables.net/3.0.2/css/dataTables.dataTables.css" />` —
  a **`<link>`** tag, first appearing in this project: an HTML element that,
  unlike `<script>`, never contains its own content between an opening and
  closing tag — it's entirely described by its own attributes, and is
  written self-closed here (`/>`), matching the shape of an empty element
  with nothing to nest inside it.
- `rel="stylesheet"` — a required attribute, first appearing here, naming
  *what relationship* the linked file has to this page — specifically that
  it's a stylesheet, not, say, an alternate version of the page or an icon;
  a browser reads this to decide how to treat the fetched file at all,
  since `<link>` itself is used for several different kinds of external
  references beyond stylesheets.
- `href="https://cdn.datatables.net/3.0.2/css/dataTables.dataTables.css"` —
  first appearing on `<link>`, though the same attribute name (`href`) is
  the general HTML attribute for "the URL this tag points to" — here, the
  real CSS file DataTables' own CDN serves for its own default visual
  styling (borders, hover highlighting, the sort-arrow icons in each header
  cell).
- `<script src="https://cdn.datatables.net/3.0.2/js/dataTables.js">
  </script>` — the same `<script src="...">` shape Lesson 10 already
  established for jQuery's own file, reused here unchanged: the browser
  fetches and runs this URL's own JavaScript instead of running inline
  code. Notably absent this time: an `integrity` or `crossorigin`
  attribute — DataTables' own official installation example, fetched this
  session, does not include either, unlike jQuery's own CDN example
  Lesson 10 used.

### CS Lens

A library that adds new capability onto an object it doesn't itself define
— DataTables extending jQuery's own `$` rather than introducing a separate,
competing top-level name — is a specific instance of extending existing
behavior from the outside, without touching or forking the original code.
Also recognized in: Python's own monkey-patching (reassigning or adding
attributes onto a class after it's already been defined elsewhere), Ruby's
"open classes" (the same idea, built into the language's own rules rather
than a workaround), and a browser extension that adds a new right-click
menu entry to every webpage without changing any website's own code.

### SE Lens

Why rely on a CDN for DataTables' own files, the same choice Lesson 10 made
for jQuery, rather than downloading and hosting a local copy inside this
project? The same real tradeoff applies again: a local copy would keep
`local.html` fully working with no network access at all — a real cost this
choice accepts — in exchange for a good chance the exact file is already
cached from some other site using the same CDN URL, and never having to
manually track or re-download a security update. Worth naming honestly,
though, is a real gap this unit's own walkthrough already flagged: jQuery's
own CDN example included a real `integrity` attribute, a cryptographic
check refusing to run a tampered file; DataTables' own official example
doesn't. That's not this project inventing a shortcut — it's exactly what
DataTables' own current documentation shows — but it's a real, honest
difference in how carefully two different libraries' own CDN guidance
protect against a compromised or altered file, worth noticing rather than
assuming every CDN reference carries the same protection just because one
example happened to.

### Run It

No `dotnet build` needed — no C# file changed, and `ToolDB.csproj`'s own
`<Content Include="local.html" ...>` item (Lesson 6) already copies this
file's changes into the build output automatically.

### Connecting Back

`.DataTable()` is now a real, callable method on every jQuery object, for
the first time — but nothing exists yet for it to enhance. The next unit
gives it a real, if still empty, table to work with.

---

## Concept Unit: A Real Table, Still Empty

### The Problem

A `Tool` has five real, visible fields (`Name`, `Manufacturer`,
`OverallDiameter`, `OverallLength`, `FluteCount`) and `tools.db` could hold
many of them — nothing in `local.html` has any structure capable of showing
several rows of several columns each; `<h1>`, `<p>`, and `<button>` each
hold exactly one thing.

> **Try this first:** Since Lesson 4/9, this project's own SQL `SELECT`
> already returns exactly this shape — many rows, each with the same fixed
> set of named columns. Given that HTML has its own dedicated markup for a
> grid of rows and columns rather than making every project fake one out of
> generic containers, what would you expect that markup to need, at
> minimum, to describe: a header row naming each column, and then some
> number of real data rows underneath it?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
- **Change type** — add (one new `<table>` element and its own children).
- **Location** — inside `<body>`, immediately after the existing `<button
  id="show-count">` established in Lesson 10, before the existing
  `<script>` block.
- **Dependencies** — none beyond `<body>`'s own existing content, unchanged.

### The New Code

```html
<table id="tools-table">
    <thead>
        <tr>
            <th>Name</th>
            <th>Manufacturer</th>
            <th>Overall Diameter</th>
            <th>Overall Length</th>
            <th>Flute Count</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

### The Updated Project

`local.html`'s own `<body>`, in full, new lines marked (the existing
`<script>` block is shown in full too, unchanged by this unit):

```html
 1  <body>
 2      <h1>ToolDB</h1>
 3      <p id="output">Waiting for tool data from C#...</p>
 4      <button id="show-count">Show Count Only</button>
 5      <table id="tools-table">                             // ← new
 6          <thead>                                           // ← new
 7              <tr>                                          // ← new
 8                  <th>Name</th>                              // ← new
 9                  <th>Manufacturer</th>                       // ← new
10                  <th>Overall Diameter</th>                   // ← new
11                  <th>Overall Length</th>                     // ← new
12                  <th>Flute Count</th>                        // ← new
13              </tr>                                         // ← new
14          </thead>                                          // ← new
15          <tbody></tbody>                                   // ← new
16      </table>                                              // ← new
17      <script>
18          let tools = [];
19
20          window.chrome.webview.addEventListener('message', event => {
21              tools = event.data;
22              $('#output').text(
23                  `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`
24              );
25          });
26
27          $('#show-count').on('click', () => {
28              $('#output').text(`${tools.length} tool(s) loaded.`);
29          });
30      </script>
31  </body>
```

`<body>` now holds a real, structured grid alongside its existing summary
line and button — one that already has a real header row (lines 6–14), but
whose `<tbody>` (line 15) is still deliberately empty; nothing yet writes
real rows into it, which is exactly why this unit's own new markup can be
proven correct — or wrong — before any data-handling code touches it at
all.

### Proving It in Isolation

The real markup above already has five real columns and a real, meaningful
`id` — enough real detail to make it easy to miss the general shape
underneath it. A smaller, unrelated throwaway example isolates that shape
on its own first:

```html
<table>
    <thead>
        <tr>
            <th>Fruit</th>
            <th>Count</th>
        </tr>
    </thead>
    <tbody>
        <tr><td>Apple</td><td>3</td></tr>
        <tr><td>Pear</td><td>1</td></tr>
    </tbody>
</table>
```

Nothing about this needs to be run to know what it produces: a browser
renders exactly the structure written, with total confidence and no
execution required, per the Verification Rule's own exemption for output
this certain — two visible header cells ("Fruit," "Count"), then two visible
rows underneath them ("Apple"/"3," "Pear"/"1"), in source order, because
plain HTML markup like this has no computed or conditional behavior at all
to produce a surprise. What this small, two-column, two-row example proves
about the shape: `<thead>` and `<tbody>` divide "the columns' own names"
from "the real rows," regardless of how many columns or rows either one
ends up holding — this is exactly what `#tools-table` above does, just
with five columns instead of two, and one already-known real row instead of
two made-up ones. Both `<thead>` and `<tbody>`, in the real markup above,
are performing the identical structural job this throwaway example already
proved, at whatever size the real data actually is.

Worth stating directly, back on the real code: `<thead>`'s header row was
written by hand, once, rather than generated from a tool object's own field
names at runtime — a deliberate choice this unit's own SE Lens, below,
explains. Note also what the real code deliberately leaves out: `Id`,
`Tool`'s own first field — a primary key exists for the database's own
internal row identity and for joining against vendor data, not because
anyone reading this table needs to see it.

### Discard the Throwaway Example

The `Fruit`/`Count` table above is discarded now — it never appears in this
project again. What's proven is the shape (header rows and data rows as two
structurally separate groups), not this specific fruit data.

### Mechanical Walkthrough

- `<table id="tools-table">` — the outermost table element, first
  appearing in this project; its `id` attribute, the same kind Lesson 5's
  `<p id="output">` and Lesson 10's `<button id="show-count">` already
  established, is what this lesson's own later units select it by.
- `<thead>` — first appearing here: groups the row(s) that name each
  column, kept structurally separate from `<tbody>`'s own real data rows so
  a browser (and, later, DataTables itself) can tell "this is the header"
  from "this is the data" without guessing from position alone.
- `<tr>` (inside `<thead>`) — first appearing here: one table row; every
  `<th>` or `<td>` in this project's own tables lives inside exactly one
  `<tr>`.
- `<th>Name</th>` through `<th>Flute Count</th>` — five header cells, first
  appearing here, one per real `Tool` field this lesson chooses to display
  — `<th>` specifically (not `<td>`) marks each as a *header* cell; browsers
  render it distinctly (bold, centered, by default) precisely so a reader's
  eye can tell column labels apart from real row data at a glance.
- `<tbody>` — first appearing here: groups the real data rows, kept
  separate from `<thead>` the same way a `SELECT`'s own column list
  (Lesson 4, 9) is conceptually separate from the actual rows it returns.
- `<tbody></tbody>`, empty — a real, valid, empty element: no rows exist
  inside it yet because nothing in this unit's own code populates it; the
  next unit's entire job is filling exactly this element.

### CS Lens

Describing data as a fixed set of named columns, with any number of rows
underneath, is the same shape this project's own SQL already committed to
back in Lesson 2 — a table's own `CREATE TABLE` names columns once, then
holds any number of rows matching that shape. HTML's own `<table>` is a
second, independent notation for the identical idea: structure named once,
data repeated underneath it. Also recognized in: a spreadsheet's own
row/column grid, and a CSV file's own header line followed by its real data
lines.

### SE Lens

Why write `<thead>`'s five headers by hand, rather than generating them
from the first real tool object's own field names at runtime, the same way
this unit's own data rows (next unit) get built from real data? The
alternative not chosen — computing headers dynamically — was rejected
because it would silently follow wherever `Tool`'s own shape happens to go:
if a future lesson renames or reorders one of `Tool`'s five fields, or adds
a sixth, dynamically-generated headers would just as silently rename or
reorder themselves with no review step at all. Writing them by hand makes
"these are the columns this table shows, in this order" a real, visible
decision in this project's own markup — one a future change has to
deliberately revisit, not one that quietly drifts. The honest cost: if
`Tool`'s own shape does change later, `<thead>`'s own five `<th>` cells
have to be updated by hand too, in a second place, rather than following
automatically.

### Run It

No `dotnet build` needed — same reasoning as the previous unit. Nothing in
this unit's own new markup computes anything: a `<table>` with a filled-in
`<thead>` and an empty `<tbody>` renders exactly as it reads, with total
confidence and no execution required — five column headers visible, no
data rows yet, per the Verification Rule's own exemption for output this
certain.

### Connecting Back

A real, structured table now exists — headers visible, body deliberately
empty. The next unit is where real tool data actually reaches it.

---

## Concept Unit: Filling the Table From Data You Already Have

### The Problem

`tools`, the hoisted array Lesson 10 already established, holds every real
tool this project has as soon as a `message` event fires — but nothing
reads it more than once (`tools.length`) or reads more than its first
element (`tools[0]`, Lesson 7/9/10's own summary line). Showing *every*
tool means running the same row-building logic once per tool, not once,
by hand, per tool that happens to exist right now.

> **Try this first:** Python's own `for x in some_list:` runs its own body
> once per item in `some_list`, in order, until none remain — knowledge
> this lesson's own reader already has. Given the Header's own **`for...of`
> loop** entry states JavaScript's version does the identical job for a
> real array, and given `tools` currently holds real `Tool`-shaped objects
> (`Name`, `Manufacturer`, `OverallDiameter`, `OverallLength`,
> `FluteCount` — Lesson 4, 9), what would the body of `for (const tool of
> tools) { ... }` need to build, once per pass, to eventually end up with
> one `<tr>` per real tool? And given the previous unit already left a real,
> empty `<tbody>` waiting for exactly this content, would you hand jQuery
> one finished string once the loop ends, or call `.html()` fresh inside
> the loop on every single pass?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
- **Change type** — add (new statements inside the existing `message`
  handler).
- **Location** — inside `window.chrome.webview.addEventListener('message',
  event => { ... })`, established Lesson 7, immediately after the existing
  `$('#output').text(...)` summary-line call (Lesson 7/9/10) — that line
  stays untouched; this unit's own code runs right after it, in the same
  handler.
- **Dependencies** — the previous unit's own `<table id="tools-table">`
  markup, already present in the DOM by the time any real `message` event
  can fire.

### The New Code

```javascript
const rows = [];
for (const tool of tools) {
    rows.push(`<tr><td>${tool.Name}</td><td>${tool.Manufacturer}</td><td>${tool.OverallDiameter}</td><td>${tool.OverallLength}</td><td>${tool.FluteCount}</td></tr>`);
}
$('#tools-table tbody').html(rows.join(''));
```

### The Updated Project

`local.html`'s own `<script>` block, in full, new lines marked:

```html
 1  <script>
 2      let tools = [];
 3
 4      window.chrome.webview.addEventListener('message', event => {
 5          tools = event.data;
 6          $('#output').text(
 7              `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`
 8          );
 9
10          const rows = [];                                                    // ← new
11          for (const tool of tools) {                                         // ← new
12              rows.push(`<tr><td>${tool.Name}</td><td>${tool.Manufacturer}</td><td>${tool.OverallDiameter}</td><td>${tool.OverallLength}</td><td>${tool.FluteCount}</td></tr>`);  // ← new
13          }                                                                    // ← new
14          $('#tools-table tbody').html(rows.join(''));                        // ← new
15      });
16
17      $('#show-count').on('click', () => {
18          $('#output').text(`${tools.length} tool(s) loaded.`);
19      });
20  </script>
```

The `message` handler now does three things instead of one every time real
tool data arrives: updates `#output`'s own summary line (lines 6–8,
unchanged since Lesson 10), builds one real `<tr>` string per tool and
writes all of them into `#tools-table`'s own `<tbody>` (lines 10–14, new).
Both read the exact same `tools` array (line 5); neither depends on the
other's own result.

### Proving It in Isolation

Throwaway code, run for real this session, in a domain with nothing to do
with tools or SQL — proving the loop-then-join shape on its own terms
before it meets this project's own real data:

```javascript
const recipes = [
    { title: 'Toast', minutes: 3 },
    { title: 'Omelette', minutes: 8 },
    { title: 'Soup', minutes: 25 }
];

const rows = [];
for (const recipe of recipes) {
    rows.push(`<li>${recipe.title} — ${recipe.minutes} min</li>`);
}
console.log(rows.join(''));
```

Run for real with Node this session:

```
<li>Toast — 3 min</li><li>Omelette — 8 min</li><li>Soup — 25 min</li>
```

This is called a **map-and-join pattern** — not a JavaScript keyword, but a
real, common shape: transform each element of a collection into a string,
collect the results, then combine them into one. The real output above
proves two separate things at once: the `for...of` loop really did run its
body three times, once per real element of `recipes` (not once, and not
zero times), and `.join('')` really did concatenate all three resulting
strings with nothing between them — no comma, no space — exactly as `''`
requests.

**Execution trace**, matching this real run:

1. `const rows = [];` — `rows` starts as a real, empty array; `rows.length`
   is `0` at this point, though nothing yet reads it.
2. `for (const recipe of recipes)`, pass 1 — `recipe` is bound to
   `{ title: 'Toast', minutes: 3 }`, the first real element of `recipes`,
   because `for...of` always starts at an iterable's first value.
3. `rows.push(...)`, pass 1 — `rows` becomes `["<li>Toast — 3 min</li>"]`;
   `.push()`'s own real, mutating behavior (Header, above) means this
   exact array, not a new one, now holds one real string.
4. `for...of`, pass 2 — `recipe` is reassigned to `{ title: 'Omelette',
   minutes: 8 }`, the second real element, because a `for...of` loop always
   advances to the next value in order once its body finishes a pass.
5. `rows.push(...)`, pass 2 — `rows` becomes `["<li>Toast — 3 min</li>",
   "<li>Omelette — 8 min</li>"]`.
6. `for...of`, pass 3 — `recipe` is reassigned to `{ title: 'Soup',
   minutes: 25 }`, the third and, since `recipes` has exactly three
   elements, final real value `for...of` will ever bind `recipe` to.
7. `rows.push(...)`, pass 3 — `rows` now holds all three real strings; the
   loop's own condition (per `for...of`'s own real definition, Header,
   above — continue while the iterable still has unread values) has
   nothing left to advance to, so the loop ends here, not because of any
   explicit check this code wrote itself.
8. `rows.join('')` — reads all three strings back, in the same order
   `.push()` added them, and concatenates them with `''` between each pair
   — the real, single-line output shown above, with zero separator
   characters anywhere in it.

### Discard the Throwaway Example

The `recipes` example above is discarded now — it never appears in this
project again. What's proven is the shape, not this specific data: loop
once per real element, `.push()` a string each time, `.join('')` once at
the end.

### Mechanical Walkthrough

- `const rows = [];` — a `const` array declaration (the array literal
  syntax itself, `[]`, first appearing in this project's own JavaScript,
  though already familiar from this project's own C# `List<Tool>`, Lesson
  4) — `const` here means the *variable* `rows` is never reassigned to
  point at a different array, not that the array's own contents can't
  change; `.push()`, next, changes its contents without reassigning `rows`
  itself.
- `for (const tool of tools)` — the **`for...of` loop** (Terms, above),
  first appearing in this project — binds `tool`, a fresh `const` on every
  pass (never reused or mutated across iterations), to each real element of
  `tools` in turn, running its own body once per element with no manual
  index or length check written anywhere in this code.
- `` rows.push(`<tr>...</tr>`) `` — `.push()` (Header, above), called once
  per loop pass, each time with a freshly built template literal string
  (Terms, above — reappearing from Lesson 7) — five interpolation slots,
  `${tool.Name}`, `${tool.Manufacturer}`, `${tool.OverallDiameter}`,
  `${tool.OverallLength}`, `${tool.FluteCount}`, each a plain property
  access on the current `tool`, reading the same five real fields
  `Tool.FromReader` (Lesson 4) mapped from `tools.db`'s own real columns.
- `$('#tools-table tbody')` — `$()` (Header, above), called with a real
  **descendant-combinator** selector (Terms, above) — first appearing in
  this project — matching the one real `<tbody>` element found *inside*
  `#tools-table`, not a `<tbody>` anywhere else on the page (there is only
  one, but the selector's own meaning doesn't depend on that).
- `.html(rows.join(''))` — `.html()` (Header, above), this lesson's own new
  jQuery method, called with `.join('')`'s own real return value (Header,
  above) — replaces `#tools-table`'s own `<tbody>` empty contents
  (established the previous unit) with every real `<tr>` string, concatenated
  with no separator, parsed as real markup rather than shown as literal
  text.

### CS Lens

Running a fixed piece of logic once per element of a real collection,
producing one result per element, is the same **iteration** idea this
project's own SQL has already relied on since Lesson 4 — a `SELECT`
returning many rows, each mapped through `Tool.FromReader` inside a
`while (reader.Read())` loop, one row at a time. Also recognized in:
Python's own `for x in some_list:` (this lesson's own reader already knows
it), a factory's own assembly line performing the identical set of steps on
each unit passing through, and a printer physically stamping one page at a
time from a queued document, never all pages simultaneously.

The broader idea this whole unit builds toward — **client-side rendering**
(Terms, above) — is itself worth a second, separate real-world grounding:
also recognized in any framework that renders entirely in the browser from
already-fetched data (this project's own later Slice 8, rebuilding this
exact table in React), contrasted with **server-side rendering** — a
Python/Jinja-style web application building finished HTML on the server,
before ever sending it to a browser at all; this lesson's own C# host never
builds a single `<tr>` itself, it only ever sends plain data (Lesson 7, 9),
which is what makes this specifically client-side.

### SE Lens

Why build the whole `rows` array first and call `.html()` only once, after
the loop finishes, rather than calling jQuery's own `.append()` once per
tool, directly inside the loop? The alternative not chosen — mutating the
real, live `<tbody>` on every single pass — was rejected because each real
DOM mutation can force the browser to recompute layout for the whole
visible page; batching every row into one string and making one single
`.html()` call means that recomputation happens once, not once per tool,
regardless of how many tools `tools.db` eventually holds. The honest cost
accepted here: `rows` briefly holds every row's own string in memory before
`.join('')` combines them — trivial at this project's own real current
scale (one row), but a real, general tradeoff (batching versus immediacy)
worth knowing before it meets a much larger table.

A second, separate cost is worth naming plainly, not glossed over: `.html()`
(unlike `.text()`, Lesson 10) parses its own string argument as real markup
— so if `Name` or `Manufacturer` ever contained real `<`/`>` characters,
they would render as actual elements, not literal text, the same category
of risk this project's own Lesson 7 already named for `System.Text.Json`'s
own default HTML-safe escaping. This is safe today specifically because
`tools.db`'s own real data comes from this project's own trusted local
file, never from an outside or user-submitted source — a real, load-bearing
assumption this exact pattern would need revisiting the moment that stops
being true.

### Run It

This project's own real loop, run this session with Node against
`tools.db`'s own real current single row (`Id 1`,
`"1/2 in 4-Flute Carbide End Mill"`, `"O'Brien Carbide Tools"`, `0.5`, `3`,
`4` — re-confirmed live this session by querying `tools.db` directly),
produces:

```
<tr><td>1/2 in 4-Flute Carbide End Mill</td><td>O'Brien Carbide Tools</td><td>0.5</td><td>3</td><td>4</td></tr>
```

One real row in, one real `<tr>` out — `tools.length` is `1` right now, so
the loop above ran its body exactly once, the same real mechanics the
isolated `recipes` example already proved, just against this project's own
real data instead of throwaway data. Both this run and the earlier
throwaway `recipes` run were done via Node this session; source and output
for both are saved in this project's own new `verification/lesson-11/`
folder (`lab3-loop-isolated.js`, `step3-real-loop.js`), created this session
per this schema's own Verification Rule, since this project didn't have a
persistent verification folder before now. This project's own standing
constraint (no live WPF window observed this session) still applies to the
one thing Node alone can't prove: watching these exact `<tr>` strings
actually rendered inside a real, running browser's own `<tbody>`.

### Connecting Back

`#tools-table`'s own `<tbody>`, left deliberately empty by the previous
unit, now holds one real row per real tool `tools.db` currently has — a
plain, working HTML table, but still nothing more than that: no sorting, no
searching. The next and final unit is where that changes.

---

## Concept Unit: Handing the Table to DataTables

### The Problem

`#tools-table` is now a real, valid, populated HTML table — and a real
`<table>` element, on its own, has no sorting or searching behavior at all;
clicking a `<th>` does nothing, and there is no search box anywhere on this
page. Writing that behavior by hand — a comparator function per column, a
text input wired to re-filter and redraw rows on every keystroke, state
tracking which column is currently sorted and which direction — is real,
substantial code this project has deliberately avoided writing, per this
unit's own opening Concept Unit.

> **Try this first:** DataTables' own official documentation, quoted in
> this lesson's own Header, states plainly that it "enhances" an *existing*
> table rather than building one from scratch. Given `#tools-table` is
> already exactly that — real, valid, already holding real rows, thanks to
> the previous unit — what is the smallest possible change you'd expect
> could add sorting and searching to it, without rewriting or replacing
> anything already there? And given `.DataTable()` needs `#tools-table`'s
> own `<tbody>` to already hold real rows to have anything to enhance,
> where in this project's own existing `message` handler does that call
> have to go — before or after the previous unit's own `.html(...)` call?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
- **Change type** — add (one new statement inside the existing `message`
  handler).
- **Location** — inside `window.chrome.webview.addEventListener('message',
  event => { ... })`, immediately after the previous unit's own
  `$('#tools-table tbody').html(rows.join(''))` call, in the same handler.
- **Dependencies** — this lesson's own first unit (DataTables' own CSS/JS
  already loaded) and this lesson's own third unit (`#tools-table`'s own
  `<tbody>` already filled with real rows) — in that order, both already
  true by the time this line runs.

### The New Code

```javascript
$('#tools-table').DataTable();
```

### The Updated Project

`local.html`'s own `<script>` block, in full, new line marked:

```html
 1  <script>
 2      let tools = [];
 3
 4      window.chrome.webview.addEventListener('message', event => {
 5          tools = event.data;
 6          $('#output').text(
 7              `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`
 8          );
 9
10          const rows = [];
11          for (const tool of tools) {
12              rows.push(`<tr><td>${tool.Name}</td><td>${tool.Manufacturer}</td><td>${tool.OverallDiameter}</td><td>${tool.OverallLength}</td><td>${tool.FluteCount}</td></tr>`);
13          }
14          $('#tools-table tbody').html(rows.join(''));
15
16          $('#tools-table').DataTable();                                     // ← new
17      });
18
19      $('#show-count').on('click', () => {
20          $('#output').text(`${tools.length} tool(s) loaded.`);
21      });
22  </script>
```

The `message` handler now does four things, in a real, load-bearing order,
every time real tool data arrives: update the summary line (lines 6–8),
build every real `<tr>` string (lines 10–13), write them into `#tools-table`
`<tbody>` (line 14), and only then, line 16, hand the now-populated table to
DataTables — reversing lines 14 and 16 would call `.DataTable()` on a table
whose `<tbody>` is still empty, per this unit's own Header entry on what
`.DataTable()` actually depends on.

### Proving It in Isolation

This unit's own real code is already the smallest possible fragment — one
selector, one method call, no arguments. What's worth isolating instead is
the ordering claim itself, since it's the one part of this unit a reader
could easily get backwards: DataTables' own documentation (Header, above)
states `.DataTable()` "enhances" an existing table, and this project's own
real markup (previous unit) proves `#tools-table` only has real content in
its own `<tbody>` starting at line 14, above — one line before `.DataTable()`
is ever called. Calling it any earlier in this same handler would still run
without throwing an error (DataTables doesn't require rows to exist at
initialization time in general), but would enhance a table this project's
own code hadn't finished writing into yet, defeating the entire reason this
unit's own Socratic question asked about ordering in the first place.

### Discard the Throwaway Example

No throwaway code exists for this unit, for the same reason given above.

### Mechanical Walkthrough

- `$('#tools-table')` — `$()` (Header, above), called with the same plain
  `#id`-style selector Lesson 10 already established, matching the one real
  `<table>` element by its own `id`, established this lesson's own second
  unit.
- `.DataTable()` — `.DataTable()` (Header, above), this lesson's own
  culminating subject, called with no arguments — DataTables' own real,
  documented zero-configuration mode, requiring no options object because
  this project doesn't yet need to customize anything about how sorting,
  searching, or paging behave.

### CS Lens

Adding real new capability to something that already works correctly on
its own, without changing its existing meaning or requiring anything else
to be rewritten, is a form of **progressive enhancement** — start with a
plain, functional baseline, then layer additional behavior on top of it.
Also recognized in: CSS itself layered onto plain, already-readable HTML
(a page with no stylesheet at all still shows its own real content), a
car's cruise control enhancing ordinary manual driving without removing
the ability to drive manually, and an HTML `<video>` element's own real
fallback content, shown only if a browser can't play video at all.

### SE Lens

Why reach for DataTables at all, rather than writing this project's own
sort/search logic directly against `tools` and `#tools-table`? The
alternative not chosen — hand-written sorting and filtering — was rejected
for the same reason Lesson 10 chose jQuery over hand-written selector
logic: this is common, already-solved behavior, and writing a correct,
well-tested version of it (stable multi-column sort, debounced search
input, correct handling of numeric versus text columns) is real,
nontrivial engineering this project doesn't need to own. The honest cost
accepted in exchange: this project now depends on a whole second real
library whose own internal behavior isn't understood line-by-line the way
this project's own hand-written code is — if DataTables' own default
column-type guessing ever sorts a numeric column (`Flute Count`) as if it
were text, the fix lives inside DataTables' own configuration options, a
real, separate thing to learn, not inside this project's own loop or
markup.

### Run It

No `dotnet build` needed — same reasoning as every other unit in this
lesson. This project's own standing constraint (no live WPF window
observed this session) applies here most directly of all four units: this
unit's own real sorting/searching/paging behavior was never watched running
in an actual browser this session. What's verified for real instead is
DataTables' own documented contract — that `.DataTable()` enhances an
already-populated table and returns a real API instance — quoted directly
from DataTables' own official documentation, fetched this session, the same
standard this project has applied to every WebView2/browser behavior since
Lesson 5 that couldn't be watched directly.

### Connecting Back

`#tools-table` now shows every real tool in `tools.db`, sortable by any
column and instantly searchable, without this project writing a single
line of sorting or filtering logic itself — DataTables' own real,
documented zero-configuration behavior, applied to a table this lesson's
own three previous units built and filled by hand.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. DataTables' own CSS and JS files were added to `<head>`, right after
   jQuery's own — a real, load-bearing order, since DataTables' own
   documentation states it "automatically detects jQuery's presence" and
   registers `.DataTable()` onto `$` only once both have loaded, in that
   sequence (Unit 1).
2. A real `<table id="tools-table">` was added to `<body>`, with a real,
   hand-written `<thead>` naming all five of `Tool`'s own displayable
   fields, and a deliberately empty `<tbody>` — proven, by inspection, to
   render exactly as written, with no computation involved (Unit 2).
3. Inside the existing `message` handler, a real `for...of` loop — this
   project's first JavaScript loop — built one `<tr>` string per real tool
   in `tools`, using `.push()` to grow an array and `.join('')` to combine
   it into one string, verified for real with Node against both throwaway
   data (three synthetic recipes) and this project's own real, current
   single row from `tools.db`, before jQuery's own `.html()` wrote the
   result into `#tools-table`'s own `<tbody>` (Unit 3).
4. A single new line, `$('#tools-table').DataTable();`, called only after
   that `<tbody>` already held real rows, handed the whole, now-populated
   table to DataTables — turning a plain, static grid into one with real
   sorting, searching, and paging, without this project writing any of that
   logic itself (Unit 4).

**Next lesson:** 12 — Styling & Layout (CSS for the web content).
