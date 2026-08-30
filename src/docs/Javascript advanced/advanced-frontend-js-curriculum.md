# Advanced Front-End JavaScript — Curriculum Plan
### (Built against the Lesson Schema you provided)

You know loops, control flow, data types, `var`/`let`/`const`, and hoisting.
Everything below is scoped to start right past that line and build up to:
OOP done properly, real DOM manipulation, drag-and-drop reorder,
collapsible UI, editable fields, saving a modified static page back to
disk, and working with jQuery, DataTables, and D3.

This document has three parts:

1. **The curriculum map** — every lesson, grouped into modules, with what
   each one builds and what it assumes.
2. **How the schema's own rules land on this specific material** — the
   parts of the schema that are easy to read abstractly but change shape
   once you point them at real DOM/OOP content.
3. **One lesson written completely to spec** (Module A, Lesson 1), so you
   have a real template — not just a description of the format — to hold
   the rest of the series against.

---

## Part 1 — The Curriculum Map

### Module A — JavaScript OOP, Actually Understood
*(Prototypes first, `class` second — because `class` is sugar over
prototypes, and teaching it first hides the mechanism the rest of the
module depends on.)*

- **A1 — The Object That Isn't a Class: Prototypes and `Object.create`**
  What you'll build: a small shape hierarchy (`shape` → `circle`) using
  raw `Object.create`, no `class` keyword at all, so the delegation
  mechanism is visible before syntax hides it.
- **A2 — Constructor Functions and `new`**
  What you'll build: the same shapes, this time with `function`
  constructors and `new`, tracing exactly what `new` does step by step.
- **A3 — `class`, `extends`, and `super` as Sugar, Not Magic**
  What you'll build: the same hierarchy a third time in `class` syntax,
  with a side-by-side proof (via `Object.getPrototypeOf`) that it
  compiles to the same prototype chain as A1/A2.
- **A4 — Encapsulation: Closures vs. Private Fields (`#`)**
  What you'll build: a `Counter` with truly private state two ways —
  closure-based (pre-ES2022 idiom) and `#`-field-based — and a proof
  that external code can't reach either.
- **A5 — Composition Over Inheritance**
  What you'll build: refactor a deep, brittle inheritance chain into
  composed behaviors (mixins via `Object.assign`, or small function
  factories), with a concrete "why the inheritance version broke" scene.
- **A6 — `this`, Binding, and Arrow Functions Inside Methods**
  What you'll build: an event-handler bug caused by `this` losing its
  binding, fixed three ways (`bind`, arrow function, class field
  arrow), with a real broken run shown before each fix.

### Module B — Real DOM Manipulation (Beyond `getElementById`)

- **B1 — Traversal and Live vs. Static Collections**
  `querySelectorAll` vs. `getElementsByClassName`, `NodeList` vs.
  `HTMLCollection`, `closest`, `matches`, parent/child/sibling walking.
- **B2 — Event Delegation**
  Why binding one listener on a container beats binding N listeners on
  N children; `event.target` vs `event.currentTarget`; building a
  delegated click handler for a dynamic list.
- **B3 — Creating, Moving, and Removing Nodes for Real**
  `document.createElement`, `DocumentFragment` (and why it exists —
  batching DOM writes), `insertAdjacentElement`, `cloneNode`, `remove`.
- **B4 — Custom Events**
  `CustomEvent`, `dispatchEvent`, `detail` payloads — building your own
  app-level events (`item:reordered`, `field:saved`) so UI pieces can
  talk without being wired directly to each other.
- **B5 — The `MutationObserver`**
  Reacting to DOM changes you didn't cause yourself (useful once you're
  later debugging jQuery/DataTables interactions with your own code).

### Module C — Interactive UI Patterns
*(This is the drag-and-drop / collapsible / editable-fields module.)*

- **C1 — Collapsible Regions, Built from Scratch**
  `aria-expanded`, `hidden` attribute vs. CSS `display`, a reusable
  `<button>`-driven toggle — accessibility-correct, not just visually
  correct.
- **C2 — Making Fields Editable: `contenteditable` and Its Traps**
  `contenteditable`, `input`/`blur` events on non-form elements,
  sanitizing pasted content, and why a real `<input>` swapped in on
  double-click is often the safer alternative — built both ways so you
  can compare.
- **C3 — Native Drag-and-Drop, Part 1: the HTML5 DnD API**
  `draggable`, `dragstart`/`dragover`/`drop`, `dataTransfer` — reordering
  a flat list.
- **C4 — Native Drag-and-Drop, Part 2: Pointer Events Instead**
  Why the native DnD API is genuinely bad on touch devices, and
  rebuilding the same reorder feature on `pointerdown`/`pointermove`/
  `pointerup` instead — a real, common industry substitution.
- **C5 — Persisting Reorder/Edit State to `localStorage`**
  Serializing DOM-derived state to JSON, restoring it on load, and the
  staleness problem when your saved shape and your markup drift apart.
- **C6 — Saving the Whole Page: Blob, `URL.createObjectURL`, and Download**
  Taking the live, edited DOM and writing it back out as a downloadable
  static `.html` file the user can keep — `XMLSerializer`/`outerHTML`,
  `Blob`, and a synthetic `<a download>` click.

### Module D — jQuery and DataTables
*(Taught as "what problem did this solve, and what does modern vanilla
JS now give you for free" — not as if it's the only way to do DOM work.)*

- **D1 — Why jQuery Existed, and What `$(...)` Actually Is**
  Cross-browser DOM inconsistency circa 2006, jQuery's wrapped-set
  object, chaining — and an honest map of which jQuery methods are now
  redundant with vanilla JS you already know from Module B.
- **D2 — jQuery Events and `.on()` Delegation**
  Direct comparison against B2's vanilla delegation — same problem,
  library's syntax.
- **D3 — DataTables: Turning a Plain `<table>` Into a Sortable, Searchable
  Grid**
  Initialization, column definitions, and the plugin's own event hooks
  — wiring DataTables' row-reorder feature into the custom events you
  built in B4.

### Module E — D3.js: Data-Driven Documents
*(D3 is a different mental model from jQuery/DataTables — selections
bound to data, not imperative DOM edits — so it gets its own on-ramp.)*

- **E1 — Selections and the Enter/Update/Exit Pattern**
  `d3.select`/`d3.selectAll`, `.data()`, `.join()` — the core mental
  model, built with a trivial list before any chart appears.
- **E2 — Scales and Axes**
  `d3.scaleLinear`, `d3.axisBottom` — mapping data space to pixel space.
- **E3 — A Real Chart, Bound to Live-Editable Data**
  Wiring E1/E2 to the editable fields from C2, so editing a number in
  the page redraws the chart — the module's payoff, and the point where
  Module C and Module E actually meet.

### Module F — Capstone
- **F1 — The Editable, Reorderable, Saveable Dashboard**
  One project pulling every prior module together: a DataTable of
  records, drag-to-reorder rows (C3/C4), inline-editable cells (C2),
  a D3 chart that updates live off the table's data (E3), and a
  "Save Page" button that exports the current state as a standalone
  `.html` file (C6).

---

## Part 2 — How the Schema's Rules Land on This Material Specifically

The schema is generic; here's what each load-bearing rule actually means
once it's pointed at DOM/OOP content like this.

**The Repetition Rule, applied here, is the single biggest cost driver
of this series — and it's worth understanding why before you start
writing.** `this` gets explained in full every single time it appears —
in A2's constructor functions, in A6's event handler bug, in C2's
`blur` listener, in D2's jQuery callback (where `this` means something
*different* — the DOM element, not undefined/module — which is exactly
the kind of reappearance that needs full re-explanation, not a
reminder). Same for `addEventListener`: full treatment in B2, and full
treatment again in C1, C3, C4, D1 even though it's "the same method."
This is deliberate under the schema, not an oversight to trim — but it's
the thing to budget for: a 6-lesson module like C is not 6 lessons'
worth of new material, it's 6 lessons' worth of *fully-explained*
material, much of it revisiting the same handful of APIs from B.

**Concept files are where this series should lean hard**, because so
much of Module A/B genuinely recurs outside this curriculum too. Strong
candidates for `src/docs/concepts/`: `prototype-chain.md`,
`event-delegation.md`, `closures-for-encapsulation.md`,
`custom-events.md`. Genuinely narrow to *this* curriculum and staying
inline: the specific reorder algorithm in C3, the specific export
format in C6.

**The Concept Isolation Rule means C3/C4 in particular need real
labs, not a shared one.** Native HTML5 DnD and Pointer Events are
different APIs solving the same problem — per the schema's "familiar-
sounding is a trap" clause, C4 gets its own full throwaway lab even
though it's conceptually "the same feature as C3." Don't isolate them
together; the whole teaching point of C4 is that the pointer-event
version is a *different* mechanism, not a restatement.

**The Verification Rule is mostly not exemptable in this series.**
Almost everything here touches a runtime whose exact behavior you
shouldn't assert from memory: `dataTransfer` payload shape on `drop`,
what `MutationObserver`'s callback actually receives, DataTables'
initialized DOM structure, D3's `.join()` output. Plan to actually run
this code — a static HTML file plus a headless browser check, or a
browser console session with output pasted back in — for nearly every
Concept Unit in Modules B through E. A1–A6 (pure prototypes/classes, no
DOM) are the one place Verification's exemption realistically applies
often, since plain object/prototype output is usually predictable cold.

**Pipeline diagram applicability:** Module C and F are where this
matters. Once C5 (persist to `localStorage`) exists, every later lesson
touching saved state (C6, F1) should open by restating something like
`DOM edit → serialize → localStorage → restore on load → export as
file`, marking which stage that lesson adds, carried through with one
concrete example record end to end — not just its own new stage in
isolation.

**Reference Source applies loosely here** — this isn't a port of an
existing app, so most Concept Units will honestly state "No reference
counterpart — this is a from-scratch addition." Where it *does* apply
for real: D3/D1/D3(DataTables) lessons that lean on documented library
contracts should treat the library's own official docs and source as
the "reference" to quote from, per the demystification requirement in
step 7 (show the real `jQuery.fn.on` or D3 `.join()` source when it's
short enough to be illuminating, fetched fresh rather than recalled).

---

## Part 3 — Lesson A1, Written to Full Spec

# Lesson 1: The Object That Isn't a Class

**What you will build:** a tiny two-shape hierarchy (`shape`,
`circle`) using `Object.create` directly — no `class` keyword anywhere
in this lesson. The transferable problem this lesson is actually about:
what "inheritance" in JavaScript really *is* underneath any syntax that
later hides it — one object delegating property/method lookups to
another object it's linked to, not a copy of a blueprint.

**What you need to know first:** Nothing — this is Lesson 1.

**Terms used in this lesson:**
- **Prototype** — every JavaScript object has an internal link to
  another object (or to `null`), called its prototype. It exists so
  that objects can share behavior without each object carrying its own
  copy of every method — a lookup that fails on the object itself keeps
  going up this chain instead of failing immediately.
- **Prototype chain** — the sequence of linked prototypes a property
  lookup walks through, object → its prototype → that prototype's own
  prototype → ... → `null`. It exists because a single link (object →
  one prototype) wouldn't be enough to model multi-level sharing
  (`circle` shares from `shape`, and `shape` in turn could share from
  something more general) with only one hop.
- **Property lookup / delegation** — the algorithm the engine runs
  every time you read `obj.prop`: check `obj` itself first; if not
  found, check `obj`'s prototype; repeat up the chain; return
  `undefined` only once the chain ends at `null`. It exists so that
  "shared" behavior can live in exactly one place in memory instead of
  being duplicated onto every object that uses it.
- **Own property** — a property that exists directly on the object
  itself, found at the very first step of a lookup, before any
  delegation happens. It matters here because it's the thing that
  distinguishes "this circle's own radius" from "the `describe` method
  every shape shares."

**Objects and methods used:**

- **`Object.create`**
  - *What it is:* a built-in static function on the global `Object`
    object that constructs a brand-new object with a specified
    prototype.
  - *Implementation:* `Object.create(proto[, propertiesObject])` — a
    `static` function (not a constructor you call with `new`), taking
    an object (or `null`) as its first argument and returning a new,
    empty object whose internal prototype link points at that argument.
  - *Its use:* this lesson uses it to build `circle` with `shape` as
    its prototype directly and visibly, with no constructor function or
    `class` syntax standing between the code and the actual mechanism.
  - *Type:* a `static` function hanging off the `Object` global — not a
    constructor, not an instance method; there is no `new
    Object.create(...)`.
  - *Responsibility:* to allocate a new, empty plain object and wire its
    internal prototype link to whatever object (or `null`) was passed
    in as the first argument — nothing more; it does not copy
    properties from the prototype onto the new object.
  - *Depends on:* the object you want to use as the new object's
    prototype must already exist and be passed in as the first
    argument; passing `null` produces an object with no prototype at
    all, not even the default `Object.prototype` chain.
  - *Connects to:* called directly by this lesson's own top-level code;
    it returns a plain object that this lesson then assigns methods and
    properties to, and later passes to `Object.getPrototypeOf` to prove
    the link exists.
  - *Shape:* a public, standard-library API surface — every JavaScript
    engine implements it identically; it's a foundational primitive
    other constructs (including `class extends`, in a later lesson)
    are themselves built on top of.

- **`Object.getPrototypeOf`**
  - *What it is:* a built-in static function that reads back an
    object's internal prototype link.
  - *Implementation:* `Object.getPrototypeOf(obj)` — a `static`
    function taking one object argument and returning whatever object
    (or `null`) that object's internal prototype link currently points
    to.
  - *Its use:* this lesson uses it as proof — to show, by inspection at
    runtime, that `circle`'s prototype really is the exact `shape`
    object this lesson built, not just a same-shaped copy of it.
  - *Type:* a `static` function on the `Object` global.
  - *Responsibility:* strictly read-only inspection of the internal
    `[[Prototype]]` link; it never modifies the object it's given.
  - *Depends on:* any single object to inspect; nothing else.
  - *Connects to:* called on the `circle` object this lesson builds
    with `Object.create`, immediately after it's built, and its return
    value is compared with `===` against the original `shape` object to
    prove identity, not similarity.
  - *Shape:* a public, standard-library inspection API — the kind of
    tool this schema's own step 7 calls for when a claim about hidden
    structure ("circle is linked to shape") needs proof instead of a
    confident sentence.

---

## Concept Unit: Delegating Property Lookups with `Object.create`

### The Problem

Two shapes, a generic `shape` and a more specific `circle`, both need a
`describe()` behavior that reports their name and area. `circle` also
needs its own `radius`, which `shape` has no business knowing about.
Without some kind of sharing mechanism, `describe()` would have to be
written out twice, once per shape — and a third shape later would mean
a third copy, each one a separate place a future bug fix has to be
applied.

> **Try this before reading on:** if all you had were plain object
> literals (`{ name: "circle", radius: 4 }`) and no other JavaScript
> feature at all, how would you avoid writing `describe()` twice? What
> would have to be true about `circle` for a single `describe()`
> written once to still work when called as `circle.describe()`? If you
> called `circle.describe()` and `circle` itself had no `describe`
> property at all, what do you think should happen — an immediate
> error, or something else?

### Isolated Example

```js
const container = { holds: "nothing yet" };
console.log(container.doesNotExist);
```

This is run for real rather than predicted, because what a property
lookup does when it *fails completely* — reaching the very end of a
chain with nothing found — is exactly the invisible mechanism this unit
exists to make visible, and asserting it from memory is exactly the
kind of claim the Verification Rule requires proof for.

**Real output:**
```
undefined
```

This proves that a failed property lookup in JavaScript does not throw
an error — it returns `undefined` only after the entire lookup chain
has been exhausted. That chain-walking-then-giving-up behavior is
called **delegation**, and it's the exact mechanism `Object.create`
below is going to give us a second, populated link in.

This throwaway example is now discarded — `container` never appears in
the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition, the first code of a new curriculum.
- **Files affected:** created — `shapes.js` (new file).
- **Change type:** add.
- **Location:** top of the new, empty file.
- **Dependencies:** none — plain JavaScript, no packages.

### The New Code

```js
const shape = {
  describe() {
    return `${this.name}, area ${this.area()}`;
  }
};

const circle = Object.create(shape);
circle.name = "circle";
circle.radius = 4;
circle.area = function () {
  return Math.PI * this.radius * this.radius;
};
```

### The Updated Project

```js
 1  const shape = {
 2    describe() {
 3      return `${this.name}, area ${this.area()}`;
 4    }
 5  };
 6
 7  const circle = Object.create(shape);   // ← new
 8  circle.name = "circle";                // ← new
 9  circle.radius = 4;                     // ← new
10  circle.area = function () {            // ← new
11    return Math.PI * this.radius * this.radius;
12  };
```

`shapes.js` as a whole now defines one shared object, `shape`, holding
the one behavior every shape will need, and one specific object,
`circle`, that both carries its own data (`name`, `radius`, `area`) and
is linked back to `shape` so that calling `circle.describe()` — a
method `circle` never defines itself — still works.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **The `shape` object literal (lines 1–5).** `{ describe() {...} }` is
  ordinary object-literal syntax you already know, holding one method,
  written here using method shorthand (`describe() {}` instead of
  `describe: function() {}`) — both forms produce an identical
  function value as the property; shorthand is purely a spelling
  convenience.
- **`this.name` and `this.area()` inside `describe` (line 3).** `this`
  inside an ordinary (non-arrow) method refers to whatever object the
  method was actually *called on* — not the object the method happens
  to be *defined on*. That distinction is the entire reason this lesson
  works at all: `describe` is defined once, on `shape`, but when it
  runs as `circle.describe()`, `this` is `circle`, so `this.name` reads
  `circle`'s own `"circle"` and `this.area()` calls `circle`'s own
  `area` method — not anything belonging to `shape`.
- **`Object.create(shape)` (line 7).** Covered in full in the header's
  Objects and methods entry above: a `static` function that allocates a
  new, empty object and links its internal prototype to the `shape`
  object passed in. The return value is assigned to `circle` — at this
  exact moment, `circle` is an empty object with nothing of its own,
  only the link.
- **`circle.name = "circle"` (line 8).** An ordinary property
  assignment, adding an **own property** (defined above, in Terms)
  directly onto `circle` itself — this does not touch `shape` in any
  way; `shape` has no `name` property before or after this line.
- **`circle.radius = 4` (line 9).** The same own-property assignment
  mechanism as line 8, this time storing a number instead of a string —
  included as its own enumerated item rather than folded into the line
  8 explanation, because per this schema's enumeration rule every
  distinct statement gets its own treatment even when the underlying
  mechanism repeats.
- **`circle.area = function () {...}` (lines 10–12).** The same
  own-property assignment mechanism a third time, this time storing a
  function value. This function is itself another own property of
  `circle`, not of `shape` — `shape`'s own `describe` method calls
  `this.area()`, and it is only because `this` is `circle` at call time
  (per the `this` explanation above) that this specific `area` function
  is the one that actually runs.
- **`Math.PI * this.radius * this.radius` (line 11).** `Math.PI` is a
  built-in numeric constant (a fixed value computed once by the engine,
  never recomputed — not a function, not an object with behavior);
  `this.radius` again resolves through `this` to `circle`'s own
  `radius`, and ordinary multiplication (already known from your
  existing control-flow background) computes the area.

### CS Lens

This is the **Prototype pattern** of object-oriented design — objects
sharing behavior by delegating to a linked object at runtime, rather
than by copying a blueprint at creation time (the class-based model
most other mainstream languages use by default).

```
Also recognized in: Self and other prototype-based languages,
CSS's own cascade (a rule "delegates" to its parent selector's
computed value when it doesn't set a property itself), Python's
MRO/attribute lookup falling through to a class when an instance
doesn't have the attribute, DNS resolution falling back up a
chain of servers when a local one has no answer
```

### SE Lens

The alternative not chosen here is **copying**: giving every new shape
object its own separate `describe` function, defined fresh each time.
Copying would avoid the "wait, where does `describe` actually live"
indirection this lesson just walked through — arguably easier to reason
about locally, for one object, in isolation. Its real cost shows up at
scale: a hundred shape objects each holding their own copy of
`describe` means a hundred separate function values sitting in memory
doing identical work, and fixing a bug in `describe` means finding and
changing all hundred, or more realistically, missing some of them.
Delegation trades a small amount of upfront indirection (you have to
know to look up the chain) for a guarantee that shared behavior exists
in exactly one place. This lesson's own code isn't yet carrying any
real debt from this choice — the debt (a `radius`-shaped assumption
baked into `shape` itself, say) shows up once a second, meaningfully
different shape is added, which is deliberately outside this lesson's
scope.

### Commands Needed

None yet — this lesson's code runs directly in a browser console or via
`node shapes.js`; no build step or package has been introduced.

### Run It

```js
console.log(circle.describe());
console.log(Object.getPrototypeOf(circle) === shape);
```

Run for real, per the Verification Rule — the second line especially is
exactly the kind of "hidden structure" claim (that `circle` really is
linked to `shape`, not just shaped like it) that this schema requires
proof for rather than a confident sentence.

**Real output:**
```
circle, area 50.26548245743669
true
```

The first line proves delegation actually worked end to end: `describe`
was never defined on `circle`, yet calling it produced a real result
built from `circle`'s own data. The second line proves *why* — `circle`
and `shape` are not just similarly-shaped objects, `circle`'s internal
prototype link is the exact same `shape` object, verified by identity
comparison (`===`), not by comparing what they each contain.

### One sentence connecting this unit to what came before

This is the lesson's only unit, so there is nothing earlier in this
lesson to connect to — the very next lesson, A2, rebuilds this identical
`shape`/`circle` pair a second time using a constructor function and
`new`, so you can see that `new` is doing exactly this same
`Object.create`-plus-property-assignment work, just with different
syntax wrapped around it.

---

## Connect the Pieces

One value, traced start to finish: the literal number `4`, entered as
`circle.radius = 4`, sits as an own property directly on `circle` and
nowhere else. When `circle.describe()` is called, JavaScript's property
lookup first checks `circle` itself for `describe` — not found — then
follows `circle`'s internal prototype link (set once, back when
`Object.create(shape)` ran) up to `shape`, finds `describe` there, and
runs it *with `this` still bound to `circle`*. Inside that call,
`this.area()` triggers a second lookup — `area` is found directly on
`circle` this time, no delegation needed — and that function reads
`this.radius`, which resolves straight to the `4` that was assigned two
lines earlier. One number, stored in exactly one place, reached through
a method that was itself stored in a completely different object.

---

## What's Next

Lesson A2 rebuilds this same pair with `function` constructors and
`new`, tracing exactly what `new` does under the hood — the next
syntax layer on top of the exact mechanism this lesson just made
visible.
