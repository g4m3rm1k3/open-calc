# Lesson 7: Traversal and Live vs. Static Collections

**What you will build:** a small real-world page — a to-do list — and
the first JavaScript in this curriculum that actually reads and walks
a real DOM instead of plain JavaScript objects. Across four small
scripts against the same page, this lesson proves, with real DOM
behavior rather than assumption, the single most consequential fact
about querying the DOM: two methods that look interchangeable —
`querySelectorAll` and `getElementsByClassName` — return two genuinely
different kinds of collection, one frozen at the moment it's created,
one that keeps watching the page and changing size on its own.

**What you need to know first:** Lesson 1 — prototype, prototype
chain, and delegation, used here to explain why the two collection
types this lesson compares support different methods despite looking
almost identical on the surface. Lesson 6 — arrow function syntax,
used here for callbacks passed into a collection's own iteration
method.

**Terms used in this lesson:**

- **Prototype chain** — the sequence of linked prototypes a property
  lookup walks through: object → its prototype → that prototype's own
  prototype → ... → `null`. It matters in this lesson because it's the
  actual, verifiable reason one of this lesson's two collection types
  has a `forEach` method available on it and the other genuinely does
  not — not a stylistic inconsistency, but two different prototype
  chains.
- **Arrow function** — a function written with `(...) => {...}`
  syntax, with no `this` of its own — it reuses whatever `this` already
  existed in the surrounding code where it was written. It matters in
  this lesson only for its syntax, as the callback shape passed into
  collection iteration; none of this lesson's own callbacks read `this`
  at all.
- **DOM (Document Object Model)** — the browser's own live, in-memory,
  object-based representation of the page currently loaded — every tag
  in the page's markup exists, at runtime, as a real JavaScript object
  your code can read and change. It exists because a browser needs
  *some* concrete way to expose "the page" to running JavaScript, and
  representing it as an actual object tree — rather than, say, raw text
  the script would have to re-parse itself — lets ordinary JavaScript
  property access and method calls do the work of reading and changing
  what's on screen.
- **Node** — the DOM's own base category that nearly everything in a
  page's structure belongs to: an element, a run of plain text, an HTML
  comment. It exists as the DOM's most general shared category — code
  that only cares about tree structure (does this have children? what
  comes after it?) rather than specifically about HTML tags can be
  written once, against `Node`, and work for all of these.
- **Element** — a more specific kind of `Node`, representing
  specifically an HTML tag (`<li>`, `<ul>`, `<span>`) rather than plain
  text or a comment. It exists because most of what this lesson (and
  DOM manipulation generally) actually cares about — attributes,
  classes, matching against CSS selectors — only makes sense for tags,
  not for a stray run of text sitting between them; `Element` is the
  category those capabilities belong to.
- **`document`** — a single, already-existing global object,
  automatically provided by the browser in every page, representing the
  currently loaded page as a whole and serving as the entry point for
  nearly every DOM query this lesson performs. It exists because
  something has to be the starting point for "find me an element
  somewhere in this page" — every query in this lesson begins by
  calling a method on `document` itself.
- **Live collection** — a collection object whose contents are not
  fixed at the moment it's created, but continue to reflect the actual,
  current state of the page: if a matching element is added to the page
  later, a live collection you already hold a reference to grows to
  include it, with no need to query again. It exists because some DOM
  APIs were designed, historically, to always answer "what matches
  right now," which is convenient for code that holds onto a collection
  across time, but can also be a source of surprising bugs — this
  lesson's second Concept Unit proves both the convenience and the
  surprise directly.
- **Static collection (snapshot)** — a collection object whose contents
  are fixed permanently at the exact moment it's created — a snapshot
  of what matched then, which does not grow, shrink, or otherwise
  change even if the page itself changes afterward. It exists because
  the opposite guarantee — "this list will never silently change out
  from under me" — is exactly what a lot of code actually wants, and
  this lesson's first Concept Unit proves it directly, in contrast with
  the live version.

**Objects and methods used:**

- **`document.querySelectorAll`**
  - *What it is:* a real method on the global `document` object (and,
    identically, on any individual `Element`) that finds every element
    in the page matching a given CSS selector.
  - *Implementation:* `document.querySelectorAll(selector)` — an
    instance method taking one string argument (an ordinary CSS
    selector, the same syntax used in a stylesheet) and returning a
    `NodeList` — a **static collection**, fixed at the moment the call
    runs.
  - *Its use:* this lesson's first querying tool, and the half of this
    lesson's central live-vs-static comparison that proves the "static"
    side, directly, by mutating the page after querying and showing the
    result doesn't change.
  - *Type:* an instance method, available on `document` and on any
    `Element`.
  - *Responsibility:* to search the page (or, called on a specific
    element, that element's own descendants) for every match against
    the given selector, once, at the moment it's called, and package
    the results into a new `NodeList` — it does not keep watching the
    page afterward.
  - *Depends on:* a valid CSS selector string, and an existing DOM tree
    to search.
  - *Connects to:* called directly on `document` in this lesson's own
    project code; its return value is stored in a variable and later
    compared, item-count-wise, against the page's actual live state
    after a mutation.
  - *Shape:* a public, standard Web-platform API — the single most
    common way real front-end code selects elements to work with.
- **`document.getElementsByClassName`**
  - *What it is:* a real method on `document` (and on any `Element`)
    that finds every element in the page carrying a given CSS class.
  - *Implementation:* `document.getElementsByClassName(className)` —
    an instance method taking one string argument (a class name, with
    no leading `.`, unlike a CSS selector) and returning an
    `HTMLCollection` — a **live collection**.
  - *Its use:* this lesson's second querying tool, and the half of the
    central comparison that proves the "live" side — the exact same
    mutate-after-query test as `querySelectorAll`'s, with the opposite,
    verified result.
  - *Type:* an instance method, available on `document` and on any
    `Element`.
  - *Responsibility:* to return a collection object that always
    reflects the page's *current* elements carrying the given class —
    not a one-time snapshot, but a standing, continuously-accurate view
    that the DOM itself keeps updated whenever matching elements are
    added or removed.
  - *Depends on:* a class name string, and an existing DOM tree.
  - *Connects to:* called directly on `document`; its return value is
    stored and, in this lesson's own proof, checked for its length both
    before and after the page is mutated, with both checks against the
    *same* stored collection.
  - *Shape:* a public, standard Web-platform API, older than
    `querySelectorAll` and kept for backward compatibility — still
    genuinely useful specifically because it's live.
- **`Element.prototype.children`**
  - *What it is:* a real, read-only accessor property on any `Element`,
    returning that element's direct child elements only.
  - *Implementation:* `someElement.children` — an instance accessor
    property (a getter, not a method you call with `()`), returning an
    `HTMLCollection` — live, per the same collection type explained
    above — containing only direct child `Element`s, never grandchildren
    and never plain text nodes.
  - *Its use:* this lesson's tool for walking downward from a container
    to its immediate contents, used to reach a specific list item by
    position.
  - *Type:* an instance accessor property, available on any `Element`.
  - *Responsibility:* to expose exactly this element's direct
    `Element` children, live, with no filtering beyond "is this
    specifically an `Element`, one level down" — it says nothing about
    grandchildren or about non-element nodes like stray text.
  - *Depends on:* an existing `Element` to read it from.
  - *Connects to:* read directly off a container element in this
    lesson's own project code; its result is indexed to reach one
    specific item, which is then used as the starting point for the
    next unit's sideways and upward walking.
  - *Shape:* a public, standard Web-platform API surface.
- **`Element.prototype.parentElement`**
  - *What it is:* a real, read-only accessor property on any `Element`,
    returning that element's direct parent, if that parent is itself an
    `Element`.
  - *Implementation:* `someElement.parentElement` — an instance
    accessor property returning a single `Element` (or `null` if there
    is no parent, or the parent isn't an `Element` at all — the
    top-level `<html>` element's own parent is the `document` object
    itself, which is not an `Element`).
  - *Its use:* this lesson's tool for walking upward, one level, from
    a specific item back to its container.
  - *Type:* an instance accessor property.
  - *Responsibility:* to expose exactly one element's direct parent
    element, nothing further up the chain.
  - *Depends on:* an existing `Element` to read it from.
  - *Connects to:* read directly off a list item in this lesson's own
    project code, and compared by identity against the container
    element originally queried, to prove the relationship goes both
    directions.
  - *Shape:* a public, standard Web-platform API surface.
- **`Element.prototype.nextElementSibling`**
  - *What it is:* a real, read-only accessor property on any `Element`,
    returning the next `Element` at the same level of the tree, or
    `null` if there isn't one.
  - *Implementation:* `someElement.nextElementSibling` — an instance
    accessor property returning a single `Element` or `null`.
  - *Its use:* this lesson's tool for walking sideways, from one list
    item directly to the next, without needing to re-query the page or
    go back up to the container and index into `children` again.
  - *Type:* an instance accessor property.
  - *Responsibility:* to expose exactly the one `Element` immediately
    following this one among its siblings — skipping over any plain
    text nodes that might sit between them in the underlying tree,
    reporting only the next actual tag.
  - *Depends on:* an existing `Element` to read it from, with at least
    one sibling `Element` after it for the result to be non-`null`.
  - *Connects to:* read directly off a list item in this lesson's own
    project code, chained twice in sequence to walk from the first item
    to the third.
  - *Shape:* a public, standard Web-platform API surface.
- **`Element.prototype.matches`**
  - *What it is:* a real method on any `Element` that tests whether
    that specific element itself matches a given CSS selector, without
    searching anywhere else in the page.
  - *Implementation:* `someElement.matches(selector)` — an instance
    method taking one CSS selector string and returning a plain
    `true`/`false`.
  - *Its use:* this lesson's tool for testing one specific, already-in-hand
    element against a selector — used directly, and used again, under
    the hood, by `closest` (below) as the test it repeats while walking
    upward.
  - *Type:* an instance method, available on any `Element`.
  - *Responsibility:* to answer exactly one yes/no question about the
    one element it's called on — it does not search descendants,
    ancestors, or siblings at all.
  - *Depends on:* a valid CSS selector string.
  - *Connects to:* called directly on individual elements in this
    lesson's own project code, and referenced conceptually as the exact
    test `closest` performs at every step of its own upward walk.
  - *Shape:* a public, standard Web-platform API surface.
- **`Element.prototype.closest`**
  - *What it is:* a real method on any `Element` that walks upward
    through that element's own ancestors — including the element
    itself — testing each one against a given selector with the same
    logic as `matches`, and returns the first one that matches.
  - *Implementation:* `someElement.closest(selector)` — an instance
    method taking one CSS selector string, returning either the
    nearest matching `Element` (checking the element itself first,
    then its parent, then that parent's parent, and so on) or `null` if
    the walk reaches the top of the document with no match found.
  - *Its use:* this lesson's tool for the extremely common real-world
    pattern of starting from something small and specific (a label
    inside a list item) and finding the meaningful container around it
    (the list item itself), without knowing or caring exactly how many
    levels separate them.
  - *Type:* an instance method, available on any `Element`.
  - *Responsibility:* to find the nearest ancestor (or the element
    itself) matching a given selector, walking upward one level at a
    time and stopping at the first match — never searching downward
    or sideways at all.
  - *Depends on:* a valid CSS selector string, and the element's own
    position in the DOM tree, which determines what ancestors even
    exist to check.
  - *Connects to:* called on a deeply nested element in this lesson's
    own project code, walking up through however many levels actually
    separate it from its meaningful container, with the result compared
    against a value obtained a different way (indexing into `children`)
    to prove both paths reach the identical element.
  - *Shape:* a public, standard Web-platform API surface — this exact
    method is what a real click-delegation handler almost always
    reaches for first, once a click's target is known but the
    meaningful container around it is not.

---

## Concept Unit: `querySelectorAll` and the Static `NodeList`

### The Problem

A to-do list page needs its JavaScript to find every to-do item
currently on the page, so it can be counted, styled, or acted on. The
most natural tool for that — matching elements by a CSS selector, the
same selector syntax already familiar from writing stylesheets — is
`document.querySelectorAll`. But a to-do list is also exactly the kind
of page where items get added *after* the page first loads, without a
full reload — so a real question follows immediately: if new items
are added to the page after a script has already queried for them,
does the script's already-held collection notice?

> **Try this before reading on:** think about what
> `document.querySelectorAll` would plausibly have to *do*, mechanically,
> to answer "find every element matching this selector" — search the
> whole page once, right now, and hand back whatever it found at that
> exact moment? Or set up some ongoing watch that keeps re-checking the
> page forever after? Which of those two would be cheaper for the
> browser to actually implement, and which one would you, as the
> method's own name suggests ("query," a single action, not "watch" or
> "observe"), expect it to be?

### Isolated Example

This lesson's isolated examples use a small helper, `JSDOM`, to build a
real, standards-compliant DOM tree to test against, exactly the same
underlying DOM implementation every browser exposes — the calls
themselves (`querySelectorAll`, `children`, `closest`, and so on) are
the identical, real Web-platform API a browser's own console would
run.

```js
const items = document.querySelectorAll(".todo-item");
console.log("initial length:", items.length);

const list = document.getElementById("todo-list");
const newItem = document.createElement("li");
newItem.className = "todo-item";
newItem.textContent = "Read book";
list.appendChild(newItem);

console.log("length after adding a new .todo-item:", items.length);
console.log("constructor name:", items.constructor.name);
```

Run against a page starting with two `.todo-item` elements. This is run
for real, not predicted — whether an already-held collection actually
notices a later page change is exactly the kind of environment-specific
behavior the Verification Rule requires proof for, not an assumption
carried in from ordinary JavaScript array behavior.

**Real output:**
```
initial length: 2
length after adding a new .todo-item: 2
constructor name: NodeList
```

The collection's `length` is `2` both before and after a third
`.todo-item` was added to the actual page — the collection itself never
changed, even though the page it was queried from genuinely did.
`items.constructor.name` confirms what kind of object this actually is:
a `NodeList`, not a plain JavaScript array — it happens to support
`length` and index access (`items[0]`) the way an array does, but it is
a distinct, DOM-specific type.

This throwaway example's specific page markup is now discarded — this
exact two-item, then three-item page never appears in the project
again, though the technique it demonstrates is exactly what the
project's own first script performs next.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, the first project of this new module.
- **Files affected:** created — `todo.html` (the page itself) and
  `todo.js` (this lesson's script, loaded by the page).
- **Change type:** add.
- **Location:** both are brand-new, empty files.
- **Dependencies:** none — plain HTML and JavaScript, no packages, no
  build step.

### The New Code

```html
<ul id="todo-list">
  <li class="todo-item">Buy milk</li>
  <li class="todo-item">Walk dog</li>
</ul>
<script src="todo.js" defer></script>
```

```js
const items = document.querySelectorAll(".todo-item");
console.log(items.length);
```

### The Updated Project

`todo.html`:
```
1  <ul id="todo-list">                        // ← new
2    <li class="todo-item">Buy milk</li>       // ← new
3    <li class="todo-item">Walk dog</li>        // ← new
4  </ul>                                         // ← new
5  <script src="todo.js" defer></script>          // ← new
```

`todo.js`:
```
1  const items = document.querySelectorAll(".todo-item");   // ← new
2  console.log(items.length);                                // ← new
```

`todo.html` now holds a minimal to-do list — one `<ul>` container with
two `<li class="todo-item">` entries — plus a `<script>` tag loading
`todo.js`, which queries for every `.todo-item` on the page and logs
how many were found.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`<ul id="todo-list">...</ul>` (HTML, lines 1–4).** Ordinary HTML
  markup — a `<ul>` element carrying an `id` attribute, containing two
  `<li>` children, each carrying a `class` attribute. This is the
  actual page structure the rest of this lesson's JavaScript reads and
  walks — every DOM object this lesson's code touches corresponds
  directly to one of these tags.
- **`<script src="todo.js" defer></script>` (line 5).** An ordinary
  `<script>` tag, loading `todo.js` as a separate file rather than
  writing JavaScript inline; the `defer` attribute tells the browser to
  wait until the page's own HTML has finished being parsed before
  running the script — meaning by the time `todo.js`'s own code runs,
  the `<ul>` and both `<li>` elements above are already guaranteed to
  exist as real DOM objects.
- **`document.querySelectorAll(".todo-item")` (JS, line 1).**
  `document.querySelectorAll` (full CRC treatment in the header,
  above), called with the CSS selector string `".todo-item"` — the same
  class-selector syntax used in a stylesheet, here interpreted by the
  DOM instead. This call searches the entire page, once, at the moment
  it runs, for every element carrying the `todo-item` class, and
  returns a `NodeList` — a **static collection** (defined in Terms,
  above) — containing both current `<li>` elements.
- **`items.length` (line 2).** An ordinary property read — `NodeList`
  carries a real `length` property, the same shape as an array's own
  `length`, reporting how many elements this specific `NodeList`
  contains.

### CS Lens

This is a **snapshot** — a copy of some state captured at one specific
moment, deliberately disconnected from further changes to the original
source afterward.

```
Also recognized in: a database transaction's own isolated view of
a table, unaffected by other transactions committing changes while
it's still running, a version control system's own commit — a
frozen snapshot of a repository's files at one point in history —
a photograph, capturing a scene as it existed at the moment the
shutter opened, unaffected by anything that happens in that scene
afterward
```

### SE Lens

The alternative not chosen here is a collection that keeps watching the
page after being created — which the next Concept Unit builds and
proves directly. `querySelectorAll`'s static behavior has a real
advantage: code that holds onto a `NodeList` across time can trust that
its contents won't silently change out from under it — counting
`items.length` twice in a row, with unrelated page changes happening in
between, is guaranteed to produce the same number both times. The real
cost: if the actual current state of the page *is* what's needed
(exactly the to-do-list scenario this lesson opened with, where items
get added after the page loads), a static `NodeList` requires
re-querying by hand, every time, to stay accurate — `querySelectorAll`
itself provides no way to ask an already-held `NodeList` "has anything
changed"; the only way to find out is to call `querySelectorAll` again
and get a brand-new, separately-frozen snapshot.

### Commands Needed

None — open `todo.html` directly in a browser (double-clicking the file
or dragging it into a browser window both work, since nothing here
requires a server) and open the browser's own developer console to see
`todo.js`'s output.

### Run It

```js
console.log(items.length);
```

**Real output:**
```
2
```

Two `.todo-item` elements, matching the two `<li>` tags already present
in `todo.html`'s own markup at the moment the page loaded.

### Connecting to what came before

This unit's `NodeList` is a real, verified snapshot — frozen the moment
`querySelectorAll` ran, as this unit's own isolated lab proved directly
by mutating the page afterward and watching the count stay unchanged.
The next unit repeats the identical experiment against a different
query method, with the opposite result.

---

## Concept Unit: `getElementsByClassName` and the Live `HTMLCollection`

### The Problem

`todo.js` currently only reports how many `.todo-item` elements existed
at the moment the page first loaded. A real to-do list needs code that
can add new items later — and once that happens, anything that needs
an always-current count or an always-current list of items would have
to remember to re-run `querySelectorAll` by hand, every single time,
per the previous unit's own SE Lens. Is there a query method that
avoids that, by staying accurate on its own?

> **Try this before reading on:** `document.getElementsByClassName` is
> an older method than `querySelectorAll`, predating it by years, and
> its name itself doesn't include the word "query" at all — it's
> phrased as "get the elements," present tense, rather than "search
> right now." Given the previous unit's own proof that
> `querySelectorAll` produces a one-time snapshot, and given that these
> two methods answer what sounds like the identical question ("which
> elements match?"), what would have to be genuinely different about
> `getElementsByClassName`'s own returned object for it to behave
> differently at all — and how would you actually test whether it
> does, using the exact same mutate-after-query technique the previous
> unit already used?

### Isolated Example

```js
const items = document.getElementsByClassName("todo-item");
console.log("initial length:", items.length);

const list = document.getElementById("todo-list");
const newItem = document.createElement("li");
newItem.className = "todo-item";
newItem.textContent = "Read book";
list.appendChild(newItem);

console.log("length after adding a new .todo-item:", items.length);
console.log("constructor name:", items.constructor.name);
```

The identical test as the previous unit's isolated lab, against the
identical starting page — with only the query method itself changed.
Run for real, not predicted, for the same reason as before: whether
this collection notices a later page change is exactly the kind of
behavior that has to be demonstrated, not assumed from the method's
superficial similarity to `querySelectorAll`.

**Real output:**
```
initial length: 2
length after adding a new .todo-item: 3
constructor name: HTMLCollection
```

Unlike the previous unit's `NodeList`, this collection's `length`
changed — from `2` to `3` — after the exact same `appendChild` mutation,
with no re-query performed at all; the same `items` variable, read a
second time, simply reports the page's new, current state. This is a
**live collection** (defined in Terms, above), and `items.constructor.name`
confirms it's a different concrete type entirely: `HTMLCollection`, not
`NodeList`.

**A second run, proving the concrete reason these two types aren't
just differently-named versions of the same thing** — per this
lesson's own header claim that `NodeList` and `HTMLCollection` support
different methods:

```js
const nodeList = document.querySelectorAll(".todo-item");
console.log("NodeList has forEach:", typeof nodeList.forEach);

const htmlCollection = document.getElementsByClassName("todo-item");
console.log("HTMLCollection has forEach:", typeof htmlCollection.forEach);
```

**Real output:**
```
NodeList has forEach: function
HTMLCollection has forEach: undefined
```

`NodeList.prototype` includes a real `forEach` method; `HTMLCollection
.prototype` does not. This is exactly the **prototype chain** (defined
in Terms, above) at work, the identical mechanism proven back in
Lesson 1: `nodeList.forEach` is found by delegation, walking up to
`NodeList.prototype`, where the method actually lives; `htmlCollection
.forEach` triggers the same delegation walk, up to `HTMLCollection
.prototype` instead — a genuinely different object, on which no
`forEach` was ever defined, so the lookup returns `undefined`, the
identical "reached the end of the chain with nothing found" outcome
Lesson 1's own very first isolated example proved for a plain object.

This throwaway example's specific page markup is discarded — but,
unlike the previous unit's lab, the technique proven here — checking
for `forEach` specifically — is directly reused in this unit's own
project code next, since it changes how the project's script has to be
written.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`.
- **Change type:** add (a second query, using the live method,
  alongside the existing static one).
- **Location:** appended after the existing `querySelectorAll` line
  from the previous Concept Unit, which is left unchanged.
- **Dependencies:** the `todo.html` page and its existing
  `.todo-item` elements from the previous Concept Unit.

### The New Code

```js
const liveItems = document.getElementsByClassName("todo-item");

function addTodo(text) {
  const list = document.getElementById("todo-list");
  const newItem = document.createElement("li");
  newItem.className = "todo-item";
  newItem.textContent = text;
  list.appendChild(newItem);
}

addTodo("Read book");
console.log("static count:", items.length);
console.log("live count:", liveItems.length);
```

### The Updated Project

`todo.js`:
```
1  const items = document.querySelectorAll(".todo-item");
2  console.log(items.length);
3
4  const liveItems = document.getElementsByClassName("todo-item");   // ← new
5
6  function addTodo(text) {                                          // ← new
7    const list = document.getElementById("todo-list");                // ← new
8    const newItem = document.createElement("li");                     // ← new
9    newItem.className = "todo-item";                                   // ← new
10   newItem.textContent = text;                                         // ← new
11   list.appendChild(newItem);                                           // ← new
12 }                                                                       // ← new
13
14 addTodo("Read book");                                                  // ← new
15 console.log("static count:", items.length);                            // ← new
16 console.log("live count:", liveItems.length);                          // ← new
```

`todo.js` now queries the page two different ways at load time — once
statically, once live — defines a reusable `addTodo` function that
actually adds a new item to the real page, calls it once, and reports
both collections' counts afterward, so the file itself demonstrates the
live-versus-static difference on the real project page, not just in a
disposable lab.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`document.getElementsByClassName("todo-item")` (line 4).**
  `document.getElementsByClassName` (full CRC treatment in the header,
  above), called with the plain class name `"todo-item"` — no leading
  `.`, unlike a `querySelectorAll` selector, because this method only
  ever matches by class, never by the fuller CSS-selector language.
  Its return value, a **live collection**, is stored in `liveItems`.
- **`function addTodo(text) { ... }` (lines 6–12).** An ordinary
  function declaration, the same construct used throughout every
  earlier lesson — its parameter, `text`, is the new item's intended
  label.
- **`document.getElementById("todo-list")` (line 7).** A DOM query
  method, similar in spirit to `querySelectorAll` but matching by `id`
  specifically rather than by CSS selector, returning a single element
  or `null` rather than a collection — used here, inside `addTodo`, to
  reach the `<ul>` container fresh on every call, rather than reusing a
  reference captured once outside the function.
- **`document.createElement("li")` (line 8).** A DOM method that builds
  a brand-new, real `<li>` element — not yet attached anywhere in the
  page — which is exactly why the following lines exist: an element
  that exists only in memory, disconnected from the visible page, until
  something explicitly attaches it.
- **`newItem.className = "todo-item"` (line 9) and `newItem.textContent
  = text` (line 10).** Ordinary property assignments — `className` sets
  the element's `class` attribute; `textContent` sets what text appears
  inside it — both writable properties on any real DOM element, the
  same assignment mechanism used for a plain JavaScript object's own
  properties throughout this curriculum, here happening to control what
  actually renders on screen.
- **`list.appendChild(newItem)` (line 11).** A DOM method that attaches
  `newItem` as the last child of `list`, the single line that actually
  makes the new item visible on the page — this is the exact mutation
  this unit's own isolated lab used to distinguish live from static
  collections, now performed for real inside the project's own code.
- **`addTodo("Read book")` (line 14).** An ordinary function call,
  running everything inside `addTodo`'s body once, actually adding a
  third `.todo-item` to the live page.
- **`items.length` and `liveItems.length` (lines 15–16).** Two ordinary
  property reads, on two collections that were both created *before*
  `addTodo` ran — the entire point of this unit's project code being to
  show, on the real project's own page rather than a disposable lab,
  that these two numbers now genuinely disagree.

### CS Lens

This is a **live view** — an object that doesn't hold a copy of some
data at all, but continuously reflects an underlying source of truth
(here, the actual page) that it doesn't own.

```
Also recognized in: a spreadsheet formula cell that recalculates
automatically whenever any cell it references changes, a SQL
database VIEW, which stores no rows of its own and instead
re-runs its defining query against the real tables every time it's
read, a live folder or "smart playlist" in a file browser or music
app, which doesn't store a fixed file list but continuously
re-matches its own filter criteria against whatever files or songs
currently exist
```

### SE Lens

The alternative not chosen here is the previous unit's static approach.
`getElementsByClassName`'s live behavior has a real advantage exactly
where `querySelectorAll`'s static behavior had a cost: code that needs
an always-current view — a running item counter displayed somewhere on
the page, say — can query once, hold the result, and simply re-read
`.length` whenever it needs the current number, with no re-querying
required at all. The real cost, and the reason `querySelectorAll` is
the more commonly reached-for default in modern code despite being
newer: a live collection can produce genuinely surprising bugs in code
that iterates over it while also modifying the page — removing an item
from a live collection *while looping over that same collection* can
skip elements or terminate early, because the collection's own length
is shrinking under the loop as it runs, a category of bug a static
`NodeList`, frozen at the start of the loop, cannot produce at all.
Neither type is a strictly safer default; the safe choice depends on
which guarantee — "stable while I use it" or "always current" — the
calling code actually needs.

### Commands Needed

None — open `todo.html` in a browser, exactly as before; `todo.js`'s
new lines run automatically as part of loading the same page.

### Run It

```js
console.log("static count:", items.length);
console.log("live count:", liveItems.length);
```

**Real output:**
```
static count: 2
live count: 3
```

The exact same disagreement this unit's own isolated lab already
proved, now shown on the real project's own two collections: `items`
(from `querySelectorAll`, queried before `addTodo` ran) stayed frozen
at `2`; `liveItems` (from `getElementsByClassName`, queried at the same
moment) reports `3`, correctly reflecting the page's real, current
state after `addTodo("Read book")` actually ran.

### Connecting to what came before

This unit repeats the previous unit's exact experiment against a
different query method and gets the opposite, equally real result —
together, the two units turn "live versus static" from a claim into
something directly demonstrated, on both a disposable lab and the
project's own real page. The next unit turns from *finding* elements
by selector to *walking* between elements that are already in hand.

---

## Concept Unit: Walking the Tree — `children`, `parentElement`, and `nextElementSibling`

### The Problem

`addTodo` currently has no way to reach a *specific* item once it's on
the page — only the whole collection, or a freshly-created one it just
built itself. Real DOM code constantly needs to move relative to an
element it already has a reference to: given one list item, find the
container it belongs to; given a container, reach its second child
directly; given one item, find the very next one, without re-querying
the whole page or walking back up and down again.

> **Try this before reading on:** if you already have a reference to
> the `<ul id="todo-list">` element itself — no re-querying needed —
> what relationship would let you reach its second `<li>` directly, by
> position, the same way you'd index into a plain JavaScript array? And
> going the *other* direction — starting from one specific `<li>` you
> already have a reference to — what relationship would get you back to
> the `<ul>` that contains it? Do you expect either of these to require
> a fresh call to `document.querySelectorAll` at all, given that both
> elements are already directly in hand?

### Isolated Example

```js
const list = document.getElementById("todo-list");
console.log("children.length:", list.children.length);
console.log("children constructor:", list.children.constructor.name);

const second = list.children[1];
console.log("second item text:", second.textContent);
console.log("second.parentElement === list:", second.parentElement === list);
console.log("second.nextElementSibling text:", second.nextElementSibling.textContent);

const third = second.nextElementSibling;
console.log("third.nextElementSibling:", third.nextElementSibling);
```

Run against a page with three `.todo-item` elements. Run for real, not
predicted — whether `parentElement` genuinely points back to the exact
same object `children` was read from (identity, not just similarity),
and what a sibling walk returns once it runs off the end of the list,
are both internal-structure claims the Verification Rule requires proof
for.

**Real output:**
```
children.length: 3
children constructor: HTMLCollection
second item text: Walk dog
second.parentElement === list: true
second.nextElementSibling text: Read book
third.nextElementSibling: null
```

`list.children` is itself an `HTMLCollection` — the identical live
collection type from the previous unit, here returned by a property
read rather than a method call, and live for the identical reason: it
continuously reflects `list`'s actual current children. `list
.children[1]` reaches the second item by ordinary array-style indexing.
`second.parentElement === list` proves, by identity — not merely by
both objects looking similar — that walking down via `children` and
then back up via `parentElement` returns to the exact same object,
never a copy. `second.nextElementSibling` reaches the third item
directly, with no further indexing or re-querying. Walking one step
further, off the end of the list, produces `null` — the documented,
real signal that there is no next sibling, not an error and not
`undefined`.

This throwaway example is now discarded — this specific `list`,
`second`, and `third` never appear in the project again, though the
exact technique is what the project's own next script performs.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.html` (one more `<li>` added, so
  there's a genuine third item to walk to) and `todo.js`.
- **Change type:** add.
- **Location:** `todo.html`'s new `<li>` is appended inside the
  existing `<ul>`, after the two from the first Concept Unit. `todo.js`'s
  new code is appended after the existing lines from the previous
  Concept Unit.
- **Dependencies:** the existing `todo-list` container and its
  `.todo-item` children.

### The New Code

```html
<li class="todo-item">Read book</li>
```

```js
const list = document.getElementById("todo-list");
const secondItem = list.children[1];
const thirdItem = secondItem.nextElementSibling;

console.log(secondItem.textContent, "->", thirdItem.textContent);
console.log(secondItem.parentElement === list);
```

### The Updated Project

`todo.html`:
```
1  <ul id="todo-list">
2    <li class="todo-item">Buy milk</li>
3    <li class="todo-item">Walk dog</li>
4    <li class="todo-item">Read book</li>   // ← new
5  </ul>
6  <script src="todo.js" defer></script>
```

`todo.js` (new lines only shown in full; earlier lines unchanged from
the previous two units):
```
17 const list = document.getElementById("todo-list");            // ← new
18 const secondItem = list.children[1];                            // ← new
19 const thirdItem = secondItem.nextElementSibling;                 // ← new
20
21 console.log(secondItem.textContent, "->", thirdItem.textContent);  // ← new
22 console.log(secondItem.parentElement === list);                     // ← new
```

`todo.html` now starts with three real `.todo-item` entries already in
its markup, rather than two plus one added by script — giving this
unit's walking code real, pre-existing siblings to move between.
`todo.js` reaches the container once by `id`, then walks entirely by
relationship from there: down to the second item, sideways to the
third, and back up to confirm the relationship holds in both
directions.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`<li class="todo-item">Read book</li>` (HTML).** Ordinary markup,
  identical in shape to the two `<li>` elements already in the page —
  its only purpose here is giving this unit's walking code a genuine
  third sibling to reach.
- **`document.getElementById("todo-list")` (JS, line 17).** The same
  `id`-based query method used inside `addTodo` in the previous unit,
  here storing the container directly in a top-level variable instead
  of re-fetching it inside a function each time.
- **`list.children[1]` (line 18).** `Element.prototype.children` (full
  CRC treatment in the header, above), read off `list`, followed by
  ordinary array-style index access, `[1]`, reaching the second
  `Element` child — `children` only counts actual elements, so this
  index reliably means "the second `<li>`," regardless of any
  whitespace text nodes the browser's own HTML parser might otherwise
  insert between tags in the underlying tree.
- **`secondItem.nextElementSibling` (line 19).**
  `Element.prototype.nextElementSibling` (full CRC treatment in the
  header, above), read off `secondItem` — reaching the very next
  `Element` at the same level, with no re-querying and no walking back
  up to the container first.
- **`secondItem.textContent` and `thirdItem.textContent` (line 21).**
  Ordinary property reads, the same `textContent` property assigned
  inside `addTodo` in the previous unit, here read instead of written —
  reporting each element's own visible text.
- **`secondItem.parentElement === list` (line 22).**
  `Element.prototype.parentElement` (full CRC treatment in the header,
  above), read off `secondItem`, compared by identity (`===`) against
  `list` — proving the upward relationship reaches the exact same
  object originally queried, not merely an equivalent one.

### CS Lens

This is **tree traversal** — moving between related nodes in a
hierarchical structure by following explicit links (parent, child,
sibling) rather than by searching the whole structure from scratch
every time.

```
Also recognized in: a file system's own directory structure,
navigated by parent/child paths rather than by searching every file
on disk for each lookup, a linked list's own next/previous pointers,
an org chart, walked from an employee up to their manager or across
to a peer without re-scanning the entire company directory each time
```

### SE Lens

The alternative not chosen here is what every query so far has done at
the top level: search the whole document again, by selector, for
whatever's needed next. Relationship-based walking has a real
advantage once an element is already in hand: no re-search of the
entire page is needed at all, which matters for performance on a large
page, and it also expresses *intent* more precisely — "the element
right after this one" is a more specific, more efficient claim than
"search everywhere for something matching this selector, and hope it's
the right one." The real cost: relationship-based code is fragile
against markup changes in a way selector-based code often isn't — if
`todo.html`'s structure changes so that a `<span>` wrapper is
introduced around each `<li>`'s text, `list.children[1]` and `.
nextElementSibling` both silently start reaching different elements
than intended, with no error at all, because they only ever reason
about *position*, never about *meaning* the way a class-based selector
does.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
console.log(secondItem.textContent, "->", thirdItem.textContent);
console.log(secondItem.parentElement === list);
```

**Real output:**
```
Walk dog -> Read book
true
```

The second item's text, an arrow, and the third item's text, confirming
the sideways walk landed on the correct element; and `true`, confirming
the upward walk from that same second item lands back on the exact
container it was originally reached from.

### Connecting to what came before

This unit's relationship-based walking reaches elements without a
single call to `querySelectorAll` or `getElementsByClassName` — a
different tool entirely from the previous two units, useful
specifically once an element is already in hand. The final unit
combines this idea with selector matching directly, for the single most
common real-world traversal pattern: starting from something small and
walking upward until a meaningful match is found.

---

## Concept Unit: Matching and Walking Upward — `matches` and `closest`

### The Problem

A real to-do item is rarely just bare text directly inside an `<li>` —
it commonly has its own internal structure, a `<span>` wrapping the
label, say, so it can be styled or targeted separately from the `<li>`
itself. Code that ends up holding a reference to that inner `<span>` —
exactly the situation a real click handler is in, once it knows what
was clicked, a scenario the next lesson in this curriculum builds
directly — needs a reliable way to answer "which `.todo-item` does this
actually belong to," without knowing or hardcoding exactly how many
levels of nesting separate the two.

> **Try this before reading on:** the previous unit's `parentElement`
> reaches exactly one level up, unconditionally. If the element you
> actually care about might be one level up, or two, or however many —
> depending on markup that could change — what would a method need to
> do differently from `parentElement` to reliably find it: keep walking
> upward automatically until *something* matches a condition you
> specify, rather than stopping after exactly one step regardless of
> whether that step was actually far enough?

### Isolated Example

```js
const label = document.querySelector(".label");
console.log("label.matches('.label'):", label.matches(".label"));
console.log("label.matches('.todo-item'):", label.matches(".todo-item"));

const item = label.closest(".todo-item");
console.log("closest found:", item !== null);
console.log("closest text:", item.textContent.trim());
console.log("closest === label:", item === label);

const list = document.getElementById("todo-list");
console.log("list.closest('.todo-item'):", list.closest(".todo-item"));
```

Run against a page where one `.todo-item` `<li>` contains a nested
`<span class="label">`. Run for real, not predicted — whether `closest`
actually includes the starting element itself in its own check, and
what it returns when no ancestor matches at all, are both behavioral
claims the Verification Rule requires proof for.

**Real output:**
```
label.matches('.label'): true
label.matches('.todo-item'): false
closest found: true
closest text: Buy milk
closest === label: false
list.closest('.todo-item'): null
```

`label.matches('.label')` is `true` — the label itself carries that
class. `label.matches('.todo-item')` is `false` — the label itself does
not carry *that* class; `matches` never looks anywhere but at the exact
element it's called on. `label.closest('.todo-item')` succeeds anyway,
walking upward past the label itself (which doesn't match) to its
containing `<li>` (which does) — `item === label` is `false`, confirming
`closest` genuinely walked to a different, ancestor element rather than
trivially matching the starting point. The final line proves the other
real edge case: `closest`, called on the `<ul>` container itself,
searching for `.todo-item` — a class the `<ul>` doesn't carry, and none
of *its* ancestors carry either — returns `null`, exactly like
`nextElementSibling` did at the end of a sibling chain, rather than
throwing an error.

This throwaway example is now discarded — this specific `label` and
`item` never appear in the project again, though the same pattern is
what the project's own next script performs, against real markup.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.html` (each `.todo-item` gets an
  inner `<span class="label">` wrapping its text) and `todo.js`.
- **Change type:** refactor (`todo.html`'s markup) plus add (`todo.js`).
- **Location:** each existing `<li class="todo-item">` in `todo.html`
  has its bare text replaced with a `<span class="label">` wrapping the
  same text. `todo.js`'s new code is appended after the previous unit's
  lines.
- **Dependencies:** the existing `todo-list` container and its three
  `.todo-item` children.

### The New Code

```html
<li class="todo-item"><span class="label">Buy milk</span></li>
```

```js
const firstLabel = document.querySelector(".label");
console.log(firstLabel.matches(".todo-item"));

const owningItem = firstLabel.closest(".todo-item");
console.log(owningItem === list.children[0]);
```

### The Updated Project

`todo.html` (each `<li>` now wraps its text in a `<span
class="label">`; shown for the first item, with the same change applied
identically to the other two):
```
1  <ul id="todo-list">
2    <li class="todo-item"><span class="label">Buy milk</span></li>  // ← changed
3    <li class="todo-item"><span class="label">Walk dog</span></li>  // ← changed
4    <li class="todo-item"><span class="label">Read book</span></li> // ← changed
5  </ul>
6  <script src="todo.js" defer></script>
```

`todo.js` (new lines only; earlier lines unchanged):
```
23 const firstLabel = document.querySelector(".label");        // ← new
24 console.log(firstLabel.matches(".todo-item"));                // ← new
25
26 const owningItem = firstLabel.closest(".todo-item");           // ← new
27 console.log(owningItem === list.children[0]);                  // ← new
```

`todo.html`'s three list items now each carry a nested `<span
class="label">` instead of bare text directly inside the `<li>`.
`todo.js` reaches the first such label directly by selector, confirms
it does *not* itself carry the `.todo-item` class, then walks upward
from it with `closest` to find the `<li>` that does — and confirms, by
identity against `list.children[0]` (the previous unit's own
technique), that both paths land on the exact same element.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`<span class="label">Buy milk</span>` (HTML, nested inside the
  existing `<li>`).** Ordinary markup — a `<span>`, an inline element
  with no inherent visual styling of its own, wrapping the same text
  that previously sat directly inside the `<li>`. This is a genuinely
  common real-world pattern: a container element (`<li>`) for structure
  and spacing, with an inner element (`<span>`) specifically for the
  piece of content that might need its own separate styling or event
  handling later.
- **`document.querySelector(".label")` (JS, line 23).** A DOM query
  method, closely related to `querySelectorAll` from the first Concept
  Unit but returning a single element — the first match — rather than a
  collection of every match.
- **`firstLabel.matches(".todo-item")` (line 24).**
  `Element.prototype.matches` (full CRC treatment in the header,
  above), testing `firstLabel` itself against the `.todo-item` selector
  — checking only this one specific element, never its ancestors or
  descendants.
- **`firstLabel.closest(".todo-item")` (line 26).**
  `Element.prototype.closest` (full CRC treatment in the header,
  above), starting from `firstLabel` and walking upward — checking
  `firstLabel` itself first (which this unit's own line 24 already
  proved fails), then its parent `<li>` (which matches) — and returning
  that `<li>` element.
- **`owningItem === list.children[0]` (line 27).** An identity
  comparison, the same `===` operator used throughout this curriculum,
  confirming that the element reached by walking upward from a nested
  label with `closest` is the exact same object reached by indexing
  directly into the container's `children` — two completely different
  traversal paths, proven to land on one identical element.

### CS Lens

This is a **predicate-driven ancestor search** — walking upward through
a tree, testing each node against a condition (a predicate) rather than
moving a fixed number of steps, and stopping at the first node that
satisfies it.

```
Also recognized in: a file system's own directory-walking search
for the nearest enclosing configuration file (a `.git` directory, a
`package.json`) — checking the current directory, then its parent,
then that parent's parent, exactly the same "check, then step
upward, repeat" shape as `closest`, a CSS's own :is()/:where()
ancestor-combinator matching logic performing conceptually the same
upward test internally, an exception's propagation up a call stack,
checked against each enclosing handler in turn until one matches
```

### SE Lens

The alternative not chosen here is the previous unit's fixed-distance
`parentElement`, used repeatedly by hand
(`label.parentElement.parentElement`, and so on) until the right level
is reached. That approach's real advantage is transparency — exactly
how many levels are being walked is visible directly in the code. Its
real cost is fragility, named already in the previous unit's own SE
Lens: hardcoding "exactly two levels up" breaks silently the moment a
designer or a future refactor adds one more wrapping element anywhere
in between. `closest`'s real advantage is that it expresses the actual
intent — "find the nearest meaningful container" — without committing
to *how far away* that container currently happens to be, which is
exactly why it tolerates markup changes the previous unit's fixed-step
walking does not. Its own cost: `closest` walks upward through
potentially many ancestors performing a real selector-matching test at
each one, which — while genuinely fast in practice — is doing
meaningfully more work per call than a single, direct `parentElement`
read; using `closest` in place of a known, fixed single-level
relationship is reaching for more generality than the situation
actually needs.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
console.log(firstLabel.matches(".todo-item"));
console.log(owningItem === list.children[0]);
```

**Real output:**
```
false
true
```

`false` confirms the label itself doesn't carry the `.todo-item` class
— proving `closest` genuinely had to walk upward rather than trivially
matching on the very first check. `true` confirms that walk landed on
the exact same element this project's own `children`-based indexing
already reaches — two different traversal techniques, proven to agree.

### Connecting to what came before

This unit combines the first unit's selector-matching (`matches` is,
in effect, `querySelectorAll`'s own matching test, applied to a single
already-in-hand element instead of searching the whole page) with the
third unit's upward walking (`parentElement`, generalized from exactly
one step to "as many steps as it takes"), arriving at the single most
common real pattern for connecting something small and specific back to
the meaningful container around it.

---

## Connect the Pieces

One element, followed through every technique this lesson built: the
`<span class="label">` wrapping `"Buy milk"`. `document.querySelectorAll
(".todo-item")`, run once at page load, produced a static `NodeList`
that never counts this label directly (it only ever matches `<li>`
elements) and never grows even as later items are added — proven by
this lesson's own first mutation test.
`document.getElementsByClassName("todo-item")`, run at the same moment,
produced a live `HTMLCollection` that *would* grow to include a new
`.todo-item` added later, proven by the identical test with the
opposite result. Neither collection is where this element itself is
ultimately reached from, though: `document.querySelector(".label")`
finds the label directly, by its own class. From there,
`firstLabel.matches(".todo-item")` proves, correctly, that the label
itself isn't a to-do item — and `firstLabel.closest(".todo-item")`
walks upward exactly as many steps as it actually takes (one, in this
page's current markup) to reach the `<li>` that is, landing on the
identical element this lesson's third unit already reached by an
entirely different path: `list.children[0]`. One label, two unrelated
ways to find its owning item, and — because this lesson checked, rather
than assumed — a real, verified guarantee that both ways agree.

## What's Next

Lesson 8 turns to the reason `closest` matters as much as it does in
real code: instead of attaching a separate click listener to every
individual `.todo-item`, one listener on the shared `<ul id="todo-list">`
container can catch clicks on *any* item inside it, using
`event.target` to find out what was actually clicked and this lesson's
own `closest` to walk from that target back to the specific `.todo-item`
responsible — a pattern called event delegation, and the first lesson
in this curriculum to use `addEventListener` for real.
