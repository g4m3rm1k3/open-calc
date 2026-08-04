# Lesson 10: Putting Something on the Screen, and Making It React
### (Project 4 — Browser Kanban, JavaScript)

**What you will build.** A `Card` class, a function that turns a `Card`
into a real DOM element, a function that renders a whole list of them
onto a page, and a button that adds a new card when clicked — including
hitting, and fixing, the exact `this`-binding crash previewed at the end
of Phase 1. The transferable problems this lesson is actually about:
turning in-memory data into something visible on a page, and the very
first real collision between "a method that needs its own object" and
"a callback that gets called by something else, on its own terms."

**What you need to know first.** Everything the phase-transition note
named as carrying over directly: object shape (Project 1, Lesson 1),
functions as values (Project 2, Lesson 3), and Observer, which this
lesson explicitly connects to something JavaScript already has built
in. Nothing from Project 3 is reused directly — this is a new project,
in a new language.

---

## Concept Unit: A Card Object

### The Problem

Project 4 needs its own core piece of data — a task card on a Kanban
board — the same role `Note` played in Project 1 and `Task` played in
Project 2. JavaScript's class syntax looks almost identical to Python's
from a distance, but "looks similar" and "is proven to work the same
way" are different claims, and this curriculum doesn't let the second
one stand on the first without checking.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `card.js`.
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none; plain JavaScript, no packages.

### The New Code

```javascript
class Card {
  constructor(title) {
    this.title = title;
  }
}

module.exports = Card;
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const p = new Point(3, 4);
console.log(p.x, p.y);
```

Real output:

```
3 4
```

The shape is genuinely close to Python's `Point` from Project 1, Lesson
1 — `class`, a constructor, attributes set inside it — but three
specific things differ, worth naming exactly rather than gesturing at
"it's basically the same": `constructor` is the fixed name JavaScript
looks for automatically (Python's equivalent name, `__init__`, was a
convention this curriculum chose to follow, but JavaScript's is a
required, exact keyword); `this` plays the same role as Python's
`self`, but is never written as an explicit first parameter — it's
implicit inside every method; and building a new instance requires the
`new` keyword in front of the call (`new Point(3, 4)`, not `Point(3, 4)`)
— leaving it off doesn't error immediately in every case, but produces
subtly broken behavior, which is exactly why it's called out here before
it can cause confusion silently.

### Discard the throwaway example

`Point` is deleted — it only existed to prove JS class syntax behaves
the way it looks like it should, and to name the three concrete
differences from Python's version precisely, isolated from `Card`
entirely.

### Mechanical walkthrough

- `class Card {` — **(b) hard concept reappearing**, the same class
  concept from Project 1 Lesson 1, new syntax.
- `constructor(title) {` — **(a) first appearance** of the fixed
  `constructor` method name, covered above.
- `this.title = title;` — **(a) first appearance** of `this` used
  implicitly (no explicit parameter, unlike Python's `self`), otherwise
  the same attribute-assignment idea from Project 1.
- `module.exports = Card;` — **(a) first appearance** of Node's module
  system: makes `Card` available to other files via `require(...)`, the
  rough JavaScript counterpart to Python's `from card import Card`
  import statement from Project 1, Lesson 2 — different mechanism,
  same purpose.

### CS lens

Nothing new here beyond what Project 1, Lesson 1 already covered for
objects in general — worth stating plainly, the same way this was
handled for `Task` back in Project 2, Lesson 5, rather than manufacturing
a lens that isn't genuinely there.

### SE lens

No real alternative being weighed yet — this is the smallest possible
version of representing a card, mirroring `Note` and `Task`'s own first
appearances. The interesting design decisions (how a card connects to
the page, how it reacts to being clicked) start in the next two units.

### Commands needed

`node -e "..."` — runs a short snippet of JavaScript directly from the
command line, without a separate file, useful for quick checks like the
one above; real project files will be run with `node <file>.js`.

### Run it

Shown above — `3 4`.

### Connecting sentence

`Card` can hold a title exactly the way `Note` and `Task` could — the
next unit is where JavaScript actually starts looking different from
anything built in Phase 1: turning that object into something visible.

---

## Concept Unit: Rendering an Object to the Page

### The Problem

A `Card` object sitting in memory is invisible — nothing about Phase 1
ever needed to solve this, because a terminal script's whole job was
printing text, not drawing a page. A Kanban board needs an actual visual
element on screen for every card, and that element has to come from
somewhere: it has to be built, and placed into the page's actual
structure.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `board.js`.
- **Change type** — add.
- **Location** — new file, alongside `card.js`.
- **Dependencies** — a browser's built-in `document` object — nothing
  to install; this lesson's throwaway lab uses `jsdom`, a package that
  simulates a browser's DOM in Node, purely so this lesson's own code
  can be run and its real output verified without opening an actual
  browser window.

### The New Code

```javascript
function renderCard(card) {
  const el = document.createElement("div");
  el.className = "card";
  el.textContent = card.title;
  return el;
}
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

```javascript
const el = document.createElement("div");
el.textContent = "Hello, board!";
document.getElementById("board").appendChild(el);

console.log(document.getElementById("board").innerHTML);
```

Real output (against a starting page containing just
`<div id="board"></div>`):

```
<div>Hello, board!</div>
```

Three operations, run in order, each proven by that one line of output:
`document.createElement("div")` built a brand-new, empty `<div>` element
— not yet visible anywhere, just sitting in memory, the DOM's own
version of `Note("Groceries", "Milk, eggs, bread")` building an object
before anything's done with it. `el.textContent = "Hello, board!"` set
what text appears inside that element. `document.getElementById("board").appendChild(el)`
is what actually placed it into the page's real structure, inside the
element whose `id` is `"board"` — and `innerHTML` afterward proves it's
really there, showing the exact HTML that now exists as a result.

### Discard the throwaway example

The standalone `el` above is deleted — it only existed to prove
`createElement`/`textContent`/`appendChild` work as three separate,
composable steps, isolated from `Card` entirely.

### Mechanical walkthrough

- `function renderCard(card) {` — **(b) hard concept reappearing**, a
  plain function taking one argument, same shape as any Python function
  from Phase 1, minus `self` since this isn't a method.
- `const el = document.createElement("div");` — **(a) first appearance**
  of `document`, the browser's (or, here, `jsdom`'s simulated) built-in
  object representing the entire page, and `createElement`, which
  builds a new, detached element of the given HTML tag type.
- `el.className = "card";` — **(a) first appearance**: sets the
  element's CSS class, used later for styling — not covered further
  here, since this lesson's concern is structure and behavior, not
  visual design.
- `el.textContent = card.title;` — **(b) hard concept reappearing**,
  the same property-assignment mechanism from the isolated lab, this
  time reading from a real `Card` object's `title` instead of a fixed
  string.
- `return el;` — **(c) already basic.**

### CS lens

This is turning a plain data object into a **view** — a visual
representation derived from underlying data, kept conceptually separate
from that data itself. Also recognized in: any templating system
(a server rendering HTML from a database row), a spreadsheet's cell
display versus its stored formula, a video game's sprite versus the
game-state object it's drawn from.

### SE lens

`renderCard` deliberately takes a `Card` and returns a new element
rather than mutating some element that already exists on the page. That
costs a small amount of work rebuilding elements that might already
exist; in exchange, `renderCard` has no dependency on the page's current
state at all — call it with any `Card`, at any time, and it always
produces a correct, freestanding element. The alternative — a function
that reaches into the existing page and edits specific pieces in place
— gets meaningfully more complex the moment more than one thing can
change at once, which the next unit's list of many cards already
starts to demonstrate.

### Commands needed

None new for this unit specifically — the isolated lab and the demo
below both run via `node`.

### Run it

```javascript
const card = new Card("Write lesson 10");
const el = renderCard(card);
document.getElementById("board").appendChild(el);

console.log(document.getElementById("board").innerHTML);
```

```
<div class="card">Write lesson 10</div>
```

### Connecting sentence

One `Card` now genuinely becomes one real element on a real page — the
next unit does this for an entire list at once, the DOM equivalent of
Project 1, Lesson 2's `for note in notes: print(note.summary())`.

---

## Concept Unit: Rendering a List of Cards

### The Problem

A Kanban board with exactly one card isn't a Kanban board. The project
needs to hold many `Card`s — an array, JavaScript's direct counterpart
to a Python list — and put all of them on the page at once, the same
core need Project 1, Lesson 2 solved for notes, now solved for something
visible instead of something printed.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `board.js`.
- **Change type** — add.
- **Location** — new function, alongside `renderCard`.
- **Dependencies** — `renderCard`, this lesson's previous unit.

### The New Code

```javascript
function renderBoard(cards, container) {
  container.innerHTML = "";
  for (const card of cards) {
    container.appendChild(renderCard(card));
  }
}
```

### The Updated Project

```javascript
function renderCard(card) {
  const el = document.createElement("div");
  el.className = "card";
  el.textContent = card.title;
  return el;
}

function renderBoard(cards, container) {          // ← new
  container.innerHTML = "";                         // ← new
  for (const card of cards) {                        // ← new
    container.appendChild(renderCard(card));          // ← new
  }
}
```

`board.js` now has two functions working together: `renderCard` turns
one `Card` into one element; `renderBoard` clears whatever's currently
shown and rebuilds the whole display from a full list of cards, calling
`renderCard` once per item.

### Introduce the concept in isolation

No new syntax to isolate beyond `for...of`, which is close enough to
Python's `for` loop over a list — Project 2, Lesson 5 — to explain
directly in the real code rather than manufacturing a separate lab for
it.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `function renderBoard(cards, container) {` — **(c) already basic.**
- `container.innerHTML = "";` — **(a) first appearance** of `innerHTML`
  used as a write target (the isolated lab in the previous unit only
  *read* it, to check the result): assigning an empty string wipes out
  everything currently inside `container`, the same way
  `TaskList.load()` in Project 2, Lesson 2 replaced `self.tasks`
  entirely rather than appending onto whatever was already there.
- `for (const card of cards) {` — **(b) hard concept reappearing**:
  `for...of` iterates over each item in an array, the direct JavaScript
  counterpart to Python's `for card in cards:` — the difference is
  syntax (`of` instead of `in`, parentheses required), not the
  underlying idea.
- `container.appendChild(renderCard(card));` — **(b) hard concept
  reappearing**: `renderCard(card)` builds one element, exactly as
  proven in the previous unit; `appendChild` places it, the same call
  from the isolated lab two units back.

### CS lens

Nothing new beyond what "iterate and act on each item" already covered
in Phase 1 — again, worth stating directly rather than inventing a lens
that isn't there. What is worth naming: `container.innerHTML = ""`
followed by rebuilding everything from scratch is the simplest possible
strategy for "keep what's on screen in sync with the underlying data" —
correct, but wasteful the moment a board has hundreds of cards and only
one changes. That's a real, named limit — the seed of "virtual DOM"
ideas that the project map lists for later in this phase, not solved
here.

### SE lens

The alternative — finding and updating only the specific DOM elements
that actually changed, rather than wiping and rebuilding everything —
is genuinely more efficient, and genuinely more complex to get right:
it means tracking which element corresponds to which `Card`, and
handling additions, removals, and edits as three separate cases instead
of one uniform "just render everything again." For a Kanban board with
a handful of cards, correctness and simplicity win outright; the cost
of `innerHTML = ""` — throwing away and rebuilding DOM elements that
didn't actually need to change — becomes a real problem only at a scale
this project isn't at yet, the same honest-debt shape as Project 2,
Lesson 6's linear search.

### Commands needed

None new.

### Run it

```javascript
const cards = [
  new Card("Write lesson 10"),
  new Card("Buy groceries"),
  new Card("Call the dentist"),
];
renderBoard(cards, document.getElementById("board"));

console.log(document.getElementById("board").innerHTML);
```

```
<div class="card">Write lesson 10</div><div class="card">Buy groceries</div><div class="card">Call the dentist</div>
```

### Connecting sentence

A whole list of cards now renders correctly, every time — what's still
missing is any way for a person actually looking at this page to change
what's on it.

---

## Concept Unit: Reacting to a Click, and the `this` Problem

### The Problem

A Kanban board needs an "Add" button that, when clicked, reads whatever
title was typed into a text input, creates a new `Card`, and re-renders
the board. This is the first genuinely new *shape* of problem in this
curriculum: everything up to this point ran in a predictable order the
code itself controlled. A click happens whenever a person decides to
click — the code has to register *in advance* what should happen, and
then wait, with no control over exactly when it'll actually run.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `kanban_board.js`.
- **Change type** — add.
- **Location** — new file, alongside `card.js` and `board.js`.
- **Dependencies** — `card.js`, `board.js`.

### The New Code

```javascript
class KanbanBoard {
  constructor(container, input) {
    this.container = container;
    this.input = input;
    this.cards = [];
  }

  addCard() {
    this.cards.push(new Card(this.input.value));
    this.input.value = "";
    renderBoard(this.cards, this.container);
  }
}
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

First, the wiring, written the way it looks most natural to write:

```javascript
const board = new KanbanBoard(
  document.getElementById("board"),
  document.getElementById("new-card")
);

document.getElementById("new-card").value = "Write lesson 10";
document.getElementById("add-button").addEventListener("click", board.addCard);

document.getElementById("add-button").dispatchEvent(new MouseEvent("click"));
```

Real output — this crashes:

```
TypeError: Cannot read properties of undefined (reading 'push')
    at HTMLButtonElement.addCard (kanban_board.js:12:16)
```

This is the exact gap flagged at the end of Phase 1, now landing for
real, inside actual project code. `addEventListener("click", board.addCard)`
handed over the *function itself* — detached from `board` — the same
way `loose = counter.increment` detached a method from its object in the
phase-transition preview. When the browser (or, here, `jsdom`) later
calls that function because of a real click, it calls it as a bare
function, not as `board.addCard()` — so inside `addCard`, `this` isn't
`board` at all, and `this.cards` is `undefined`, which is exactly why
`.push` fails.

The fix:

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count = this.count + 1;
    console.log(this.count);
  }
}

const counter = new Counter();
const wrapped = () => counter.increment();

const loose = wrapped;
loose();
loose();
```

Real output:

```
1
2
```

`wrapped` is an **arrow function** — `() => counter.increment()` —  and
unlike a regular function, an arrow function never gets its own `this`
at all; it always uses whatever `this` was in scope where it was
*written*, not where it's *called* from. Because `counter.increment()`
is written directly inside `wrapped`, with `counter` referred to by name
(not through `this`), detaching `wrapped` into `loose` and calling it
completely disconnected from `counter` still works — `wrapped` never
depended on being called in any particular way to know which counter it
meant.

### Discard the throwaway example

The broken direct-reference version and the `Counter`/`wrapped` lab are
both deleted — the first proved the crash is real, the second proved
exactly why wrapping in an arrow function fixes it, both isolated from
`KanbanBoard` itself.

### Project Change (real, fixed code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `kanban_demo.js` (the wiring that uses
  `KanbanBoard`).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `kanban_board.js`.

### The New Code

```javascript
document.getElementById("add-button").addEventListener(
  "click",
  () => board.addCard()
);
```

### The Updated Project

```javascript
const board = new KanbanBoard(
  document.getElementById("board"),
  document.getElementById("new-card")
);

document.getElementById("new-card").value = "Write lesson 10";
document.getElementById("add-button").addEventListener(       // ← changed
  "click",                                                     // ← changed
  () => board.addCard()                                        // ← changed
);
```

Wrapping the call in an arrow function is the fix: `addEventListener`
now holds onto a small anonymous function that, whenever it's called,
looks up `board` by name (still correctly connected, exactly as the
`Counter` lab proved) and calls `board.addCard()` properly — `this`
inside `addCard` is now bound the normal way, because it was called as
a real method call, not handed over bare.

### Mechanical walkthrough

- `document.getElementById("add-button")` — **(a) first appearance**
  of looking up an element by its `id` attribute directly, rather than
  by a container reference already held, like `document.getElementById("board")`
  used throughout this lesson.
- `.addEventListener("click", handlerFunction)` — **(a) first
  appearance.** Registers `handlerFunction` to be called automatically,
  later, whenever a `"click"` event happens on this element — this is
  the exact Observer pattern from Project 2, Lesson 7, already built by
  the browser itself: the button is the subject, the handler function
  is the observer, and `addEventListener` is `add_observer`/`notify`
  combined into one built-in call.
- `() => board.addCard()` — **(b) hard concept reappearing**: the arrow
  function shape from the isolated `Counter` lab, applied directly to
  fix the real crash.
- `dispatchEvent(new MouseEvent("click"))` — **(a) first appearance**,
  used only in this lesson's own testing, not real project code:
  manually triggers a click event, the same way a real mouse click
  would, useful here specifically because there's no physical mouse in
  this environment to click with.

### CS lens

This is Observer, recognized rather than rebuilt — exactly the payoff
the phase-transition note promised. `TaskList.add_observer`/`notify`
from Project 2, Lesson 7 were written by hand because Python's standard
library has no generic "broadcast an event" primitive built in.
JavaScript's DOM has one, everywhere, for free: any element, any event
type, `addEventListener`. Also recognized in: `EventEmitter` in Node's
own standard library (a general-purpose version of exactly this),
Vue/React's event-binding syntax underneath, which compiles down to
`addEventListener` calls exactly like this one.

### SE lens

The alternative to fixing this with an arrow function is `.bind(board)`
— `addEventListener("click", board.addCard.bind(board))` — which
achieves the same result by explicitly locking `this` to `board`
*before* handing the function over, rather than sidestepping the
problem the way an arrow function does by never having its own `this`
to lose in the first place. Both are genuinely common in real
JavaScript code; the arrow-function version is used here because it
reads closer to "call this method" at the point where the intent is
clearest, and needs no separate explanation of what `.bind` does
underneath. The real cost being accepted either way: forgetting this
entirely — handing a method over bare, the way this unit's first,
broken version did — fails silently at the type-checking level (nothing
about `addEventListener("click", board.addCard)` looks wrong when
you write it) and only surfaces the moment the event actually fires.
That's a genuinely sharp edge in JavaScript with no real Python
equivalent, worth remembering exactly because it doesn't announce
itself early.

### Commands needed

None new.

### Run it

```javascript
document.getElementById("new-card").value = "Write lesson 10";
document.getElementById("add-button").dispatchEvent(new MouseEvent("click"));

console.log(document.getElementById("board").innerHTML);
console.log("input value after add:", JSON.stringify(document.getElementById("new-card").value));

document.getElementById("new-card").value = "Buy groceries";
document.getElementById("add-button").dispatchEvent(new MouseEvent("click"));
console.log(document.getElementById("board").innerHTML);
```

Real output:

```
<div class="card">Write lesson 10</div>
input value after add: ""
<div class="card">Write lesson 10</div><div class="card">Buy groceries</div>
```

Two real, separate simulated clicks, each one reading whatever was in
the input at that moment, adding a card, clearing the input (confirmed
by the empty-string check), and re-rendering the whole board correctly
both times.

### Connecting sentence

A button click now genuinely adds a real card to a real page — using
the exact Observer shape Project 2 built by hand, this time free,
built into the browser, with one real, specific sharp edge (`this`)
that Python's own version of the same pattern never had to worry about.

---

## Closing

**Connect the pieces.** One click, start to finish: a person types
`"Write lesson 10"` into the input and clicks "Add"; `addEventListener`
fires the registered arrow function; `() => board.addCard()` calls
`addCard` as a genuine method on `board`, so `this` inside it correctly
refers to `board`; `this.input.value` reads the typed text, a `new
Card(...)` is built from it and pushed onto `this.cards`; `this.input.value
= ""` clears the box; `renderBoard(this.cards, this.container)` wipes
the board's current contents and rebuilds every card — including the
brand-new one — by calling `renderCard` once per item, each call
building a fresh `<div class="card">` element via `document.createElement`.
One click, six functions, one visible new card.

**What breaks without this.** Already shown directly in this lesson's
last unit — that traceback is this lesson's own "what breaks" section,
placed where it happened rather than repeated here, since the whole
point was seeing it land in real project code, not in a contrived
example after the fact.

**Exercises.**
1. Add a "Remove" behavior: a small `×` button rendered inside each
   card (in `renderCard`) with its own click handler that removes that
   specific card from `this.cards` and re-renders — you'll need a way
   for the handler to know *which* card it belongs to.
2. `renderBoard`'s `innerHTML = ""` approach was named as a real,
   accepted limit in this lesson. Add a `console.time`/`console.timeEnd`
   measurement around a `renderBoard` call with 10,000 cards, and record
   the real number — the same kind of honest measurement Project 2,
   Lesson 6 and Project 3, Lesson 9 did for Python.
3. Try removing the arrow-function wrapper and using `.bind(board)`
   instead, confirm it produces the exact same working output as the
   arrow-function version, and write one sentence on which reads clearer
   to you and why.

**Definition of done.**
- [ ] `Card`, `renderCard`, and `renderBoard` all exist and produce the
      exact HTML output shown above when run.
- [ ] You've triggered the real `this`-binding crash from handing
      `board.addCard` to `addEventListener` directly, read the
      traceback, and understand exactly why `this.cards` was
      `undefined`.
- [ ] The fixed version adds a card, clears the input, and re-renders
      correctly across two separate real clicks, confirmed by real
      output.
- [ ] You can say, in one sentence, why `addEventListener` is Observer
      without needing `TaskList`'s own `add_observer`/`notify` methods
      anywhere in sight.
- [ ] Commit with a message explaining why — e.g. `"Render cards from
      data instead of hardcoding HTML, and wire Add via addEventListener
      with an arrow function so this stays bound to the board"` — not
      `"add kanban board"`.

**Next lesson** stays in Project 4: moving a card between columns —
where the board's structure stops being a flat list and needs a real
tree, and where drag-and-drop introduces a second, different kind of
event entirely.
