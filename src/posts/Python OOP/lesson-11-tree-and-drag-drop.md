# Lesson 11: A Board Is a Tree, and Moving a Card Is Three Events
### (Project 4 — Browser Kanban, JavaScript)

**What you will build.** The single flat list of cards from Lesson 10
becomes a real board: several named columns, each holding its own cards
— and a card can be dragged from one column and dropped into another,
using the browser's real drag-and-drop events, moving the underlying
data correctly, not just what's shown on screen. The transferable
problems this lesson is actually about: recognizing when a plain list
has quietly become a tree, and handling a user action that isn't one
event but a coordinated sequence of three, each with its own specific
job.

**What you need to know first.** Lesson 10 — `Card`, `renderCard`,
`renderBoard`, and `addEventListener` as Observer, recognized rather
than rebuilt.

---

## Concept Unit: A Board Is a Tree

### The Problem

Lesson 10's board was one flat array of cards. A real Kanban board has
named columns — "To Do," "In Progress," "Done" — each holding its own
cards, and a card belongs to exactly one column at a time. `Card`
objects alone can't represent that; something needs to own the grouping
itself.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `column.js`.
- **Change type** — add.
- **Location** — new file, alongside `card.js`.
- **Dependencies** — none.

### The New Code

```javascript
class Column {
  constructor(title) {
    this.title = title;
    this.cards = [];
  }
}

module.exports = Column;
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

```javascript
const board = {
  title: "Sprint Board",
  columns: [
    { title: "To Do", cards: ["Write lesson 11"] },
    { title: "Done", cards: ["Write lesson 10"] },
  ],
};

for (const column of board.columns) {
  console.log(column.title + ":");
  for (const card of column.cards) {
    console.log("  -", card);
  }
}
```

Real output:

```
To Do:
  - Write lesson 11
Done:
  - Write lesson 10
```

Two nested loops, one inside the other — `board` holds `columns`, each
`column` holds `cards` — proving this structure has genuine *depth*:
getting from the board down to one specific card means going through
exactly one column first, not reaching in directly. This is called a
**tree**: `board` is the **root**, each column is a **child** of the
root, and each card is a **child** of its column (sometimes called a
**leaf**, since nothing sits below it). `Column`'s real `cards` array
plays exactly this role — each `Column` instance is one node in the same
shape, one level below wherever the board holds its list of columns.

### Discard the throwaway example

The plain object literal `board` above is deleted — it only existed to
prove the nested-loop, two-level structure works and to name it a tree,
isolated from `Column` itself.

### Mechanical walkthrough

- `class Column {` — **(b) hard concept reappearing**, the same class
  shape as `Card` from Lesson 10.
- `constructor(title) {` — **(c) already basic.**
- `this.title = title;` — **(c) already basic.**
- `this.cards = [];` — **(b) hard concept reappearing**: an empty array
  as starting state, the same pattern as `KanbanBoard.cards` in Lesson
  10, now living on each individual `Column` instead of the board as a
  whole.

### CS lens

A tree is one of the most common shapes in software specifically
because so much real data is naturally hierarchical — a thing containing
things that themselves contain things. Also recognized in: a
filesystem (folders containing files and other folders), an HTML
document itself (elements containing elements — the exact DOM this
project has been building all along), a company's org chart, a JSON
object with nested objects inside it.

### SE lens

The alternative — keeping one flat array of cards, with each card
carrying a `column` field naming which column it's in (`{ title: "...",
column: "To Do" }`) — is a genuinely valid design too, and it's worth
naming honestly why this lesson didn't choose it: with a real `Column`
class holding its own `cards` array, "all cards in this column" is just
`column.cards` — free, direct, no searching required. The flat version
would need a filter or search through the *entire* list every time any
one column needs to be displayed — the same cost tradeoff Project 2,
Lesson 6 already named for linear search, showing up again in a new
shape. The cost being accepted here instead: moving a card between
columns means removing it from one array and adding it to another —
two operations instead of one field update — which is exactly what the
next unit's drop handler has to get right.

### Commands needed

None new.

### Run it

Shown above.

### Connecting sentence

The board's data now genuinely has the same two-level shape a real
Kanban board needs — the next unit renders that shape onto the page, and
the one after gives a person a way to move a card from one branch of
this tree to another.

---

## Concept Unit: Rendering the Tree

### The Problem

Lesson 10's `renderBoard` only knew how to draw a flat list of cards.
With columns now holding their own cards, the page needs to draw each
column as its own visible group, with that column's cards nested inside
it — the DOM's own structure needs to mirror the data's tree shape,
level for level.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `board.js`.
- **Change type** — add (`renderColumn`); modify `renderBoard`.
- **Location** — `board.js`, alongside the existing `renderCard`.
- **Dependencies** — `renderCard`, Lesson 10.

### The New Code

```javascript
function renderColumn(column) {
  const el = document.createElement("div");
  el.className = "column";

  const heading = document.createElement("h3");
  heading.textContent = column.title;
  el.appendChild(heading);

  for (const card of column.cards) {
    el.appendChild(renderCard(card));
  }

  return el;
}
```

and `renderBoard` changes to:

```javascript
function renderBoard(columns, container) {
  container.innerHTML = "";
  for (const column of columns) {
    container.appendChild(renderColumn(column));
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

function renderColumn(column) {                          // ← new
  const el = document.createElement("div");                // ← new
  el.className = "column";                                  // ← new

  const heading = document.createElement("h3");               // ← new
  heading.textContent = column.title;                          // ← new
  el.appendChild(heading);                                       // ← new

  for (const card of column.cards) {                              // ← new
    el.appendChild(renderCard(card));                                // ← new
  }

  return el;                                                          // ← new
}

function renderBoard(columns, container) {
  container.innerHTML = "";
  for (const column of columns) {                          // ← changed
    container.appendChild(renderColumn(column));             // ← changed
  }
}
```

`renderBoard` no longer calls `renderCard` directly at all — it now
delegates one level down to `renderColumn`, which in turn calls
`renderCard` for each card inside that specific column. The rendering
code's own shape now mirrors the data's tree shape exactly: one function
per level.

### Introduce the concept in isolation

No new syntax to isolate — `document.createElement`, `.textContent`,
`.appendChild`, and the `for...of` loop were all proven in Lesson 10.
What's genuinely new is only the *structure*: one render function
calling another, one tree level at a time, shown directly in the real
code above.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `function renderColumn(column) {` — **(c) already basic**, same
  function shape as `renderCard`.
- `const heading = document.createElement("h3");` — **(b) hard concept
  reappearing**, `createElement` from Lesson 10, building a heading
  element instead of a card `<div>`.
- `el.appendChild(heading);` — **(b) hard concept reappearing.**
- `for (const card of column.cards) { el.appendChild(renderCard(card));
  }` — **(b) hard concept reappearing**, the exact loop-and-render shape
  from Lesson 10's `renderBoard`, now nested one level inside
  `renderColumn` instead of being `renderBoard`'s own top-level job.
- `return el;` — **(c) already basic.**

### CS lens

This is **recursive-shaped rendering**, even though `renderColumn`
doesn't literally call itself: a tree with `n` levels of nesting is
naturally handled by code with `n` matching layers of "render this
node, then render each of its children" — here, exactly two layers,
because the board's tree is exactly two levels deep (columns, then
cards). Also recognized in: any UI framework rendering nested
components (a component tree rendered by walking it, level by level,
the same shape shown here), a file explorer drawing folders and their
contents, any function that prints a nested outline.

### SE lens

The alternative — one single function trying to build the entire board,
columns and cards together, in one long block of code — would work for
exactly this two-level structure and get harder to follow with every
additional level of nesting a more complex board might eventually need
(a column with sub-groups, say). Splitting `renderCard` and
`renderColumn` into two small, focused functions costs nothing extra to
call — `renderBoard` still just loops — and in exchange, each function
only has to reason about one level of the tree at a time.

### Commands needed

None new.

### Run it

```javascript
const todo = new Column("To Do");
todo.cards.push(new Card("Write lesson 11"));

const done = new Column("Done");
done.cards.push(new Card("Write lesson 10"));

renderBoard([todo, done], document.getElementById("board"));
console.log(document.getElementById("board").innerHTML);
```

```
<div class="column"><h3>To Do</h3><div class="card">Write lesson 11</div></div><div class="column"><h3>Done</h3><div class="card">Write lesson 10</div></div>
```

Two columns, each with its own heading and its own cards nested
correctly inside it — the DOM structure now visibly mirrors the data's
own two-level shape.

### Connecting sentence

The board's tree now renders correctly onto the page — the last unit
gives a person a way to actually rearrange that tree, by dragging a card
from one column's branch to another's.

---

## Concept Unit: Drag and Drop as Three Coordinated Events

### The Problem

Moving a card between columns by clicking wouldn't feel like a real
Kanban board — dragging is the expected interaction. But a drag isn't
one click-like moment; it's a sequence: the user starts dragging
*something* (a card), drags it *over* a valid drop target (another
column), and releases it there (the actual drop). Each of those three
moments needs its own handler, and — critically — the code has to
remember *which* card was picked up in the first moment, so the third
moment, which fires on a completely different element, still knows what
to move.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `kanban_board.js`.
- **Change type** — add.
- **Location** — new file, alongside `card.js`, `column.js`, `board.js`.
- **Dependencies** — `board.js`, this lesson's previous unit.

### The New Code

```javascript
class KanbanBoard {
  constructor(container) {
    this.container = container;
    this.columns = [];
    this.draggedCard = null;
  }

  render() {
    renderBoard(this.columns, this.container);
    this.wireDragAndDrop();
  }

  wireDragAndDrop() {
    const cardElements = this.container.querySelectorAll(".card");
    let cardIndex = 0;
    for (const column of this.columns) {
      for (const card of column.cards) {
        const el = cardElements[cardIndex];
        el.draggable = true;
        el.addEventListener("dragstart", () => {
          this.draggedCard = { card, fromColumn: column };
        });
        cardIndex++;
      }
    }

    const columnElements = this.container.querySelectorAll(".column");
    this.columns.forEach((column, i) => {
      const el = columnElements[i];
      el.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      el.addEventListener("drop", () => {
        this.moveCard(column);
      });
    });
  }

  moveCard(toColumn) {
    if (!this.draggedCard) return;
    const { card, fromColumn } = this.draggedCard;
    fromColumn.cards = fromColumn.cards.filter((c) => c !== card);
    toColumn.cards.push(card);
    this.draggedCard = null;
    this.render();
  }
}
```

### The Updated Project

Brand-new file, shown whole above — the whole point of `KanbanBoard` is
coordinating all three drag events against the shared `this.draggedCard`
field, so no single handler has to know about the other two directly.

### Introduce the concept in isolation

First, why `dragover` specifically needs `preventDefault()` — proven,
not asserted:

```javascript
col.addEventListener("dragover", (e) => {
  console.log("dragover fired, defaultPrevented:", e.defaultPrevented);
});

const overEvent = new Event("dragover", { bubbles: true, cancelable: true });
const notCancelled = col.dispatchEvent(overEvent);
console.log("dispatchEvent returned (true = not cancelled):", notCancelled);
```

Real output, with no `preventDefault()` call inside the handler:

```
dragover fired, defaultPrevented: false
dispatchEvent returned (true = not cancelled): true
```

By default, a browser refuses to allow a drop on most elements at all —
`dragover`'s **default action** is "don't allow dropping here." Calling
`e.preventDefault()` inside the `dragover` handler is what overrides
that default and tells the browser "this element genuinely accepts
drops" — without it, the later `drop` event on that same element would
never fire in a real browser, no matter how correctly the `drop` handler
itself is written. This is why `wireDragAndDrop()` calls
`e.preventDefault()` inside its `dragover` listener even though the
listener does nothing else — that single call is the entire reason the
listener needs to exist at all.

Second, why `draggedCard` needs to live on `this` — a plain variable
wouldn't survive between the two separate events:

```javascript
let draggedCardTemp;

function onDragStart(card) {
  draggedCardTemp = card;
}

function onDrop() {
  console.log("dropped:", draggedCardTemp);
}

onDragStart("Write lesson 11");
onDrop();
```

Real output:

```
dropped: Write lesson 11
```

A plain variable declared *outside* both functions, in the same
enclosing scope, is exactly what makes this work — `onDragStart` and
`onDrop` are two separate function calls, fired at two separate moments,
by two separate DOM elements, and the only thing connecting them is
that shared variable remembering what happened in between.
`this.draggedCard` on `KanbanBoard` plays exactly this role, in the real
code: `dragstart`'s handler writes to it, `drop`'s handler — on an
entirely different element — reads it back.

### Discard the throwaway example

Both `col`/`overEvent` and `draggedCardTemp`/`onDragStart`/`onDrop` are
deleted — the first proved why `preventDefault()` is required, the
second proved why shared state between two separate event handlers
needs to live somewhere both can reach, isolated from `KanbanBoard`
entirely.

### Mechanical walkthrough

- `this.draggedCard = null;` — **(b) hard concept reappearing**, the
  shared-state idea just proven in the isolated lab, starting as `null`
  — Project 2, Lesson 6's "no value" — since nothing is being dragged
  yet.
- `render() { renderBoard(...); this.wireDragAndDrop(); }` — **(a) first
  appearance** of a real, necessary consequence of Lesson 10's own
  `innerHTML = ""` limitation, named honestly there: every time
  `renderBoard` rebuilds the DOM from scratch, the *old* elements —
  along with any event listeners attached to them — are thrown away
  entirely, so every render has to re-wire drag events onto the
  brand-new elements it just created. This is real, extra cost directly
  caused by that earlier design choice, not a separate decision made
  fresh here.
- `this.container.querySelectorAll(".card")` — **(a) first appearance**
  of `querySelectorAll`: finds every element matching a CSS selector —
  here, every element with class `"card"` — and returns them in
  document order, the same order `renderBoard`/`renderColumn` just built
  them in.
- `el.draggable = true;` — **(a) first appearance.** Without this, a
  browser won't let a user pick the element up to drag it at all — a
  real, easy-to-forget requirement with no error message if it's
  missing; the element would simply refuse to drag.
- `el.addEventListener("dragstart", () => { this.draggedCard = { card,
  fromColumn: column }; });` — **(b) hard concept reappearing**,
  `addEventListener` and the arrow-function-preserves-`this` fix, both
  from Lesson 10 — storing *which* card and *which column it came from*
  together, since `moveCard` will need both.
- `this.columns.forEach((column, i) => {` — **(a) first appearance** of
  `.forEach()`: an array method that calls a given function once per
  item, automatically passing both the item and its index — used here
  specifically because both `column` and its matching position `i` (to
  find the right DOM element) are needed together, which a plain
  `for...of` wouldn't hand over as conveniently.
- `el.addEventListener("drop", () => { this.moveCard(column); });` —
  **(b) hard concept reappearing** — note `column` here is *this
  column*, the drop target, deliberately distinct from
  `this.draggedCard.fromColumn`, the column the card started in.
- `fromColumn.cards = fromColumn.cards.filter((c) => c !== card);` —
  **(a) first appearance** of `.filter()`: builds a *new* array
  containing only the items where the given function returns true —
  here, every card except the one being moved, using `!==` to exclude
  the exact object being dragged.
- `toColumn.cards.push(card);` — **(b) hard concept reappearing**,
  `.push()` from Project 2's stack lessons, here just appending to a
  plain array.

### CS lens

`dragstart`/`dragover`/`drop` together are a small **state machine**:
the interaction only makes sense as a specific sequence — a drag can't
be dropped before it's started, and `dragover` has to keep firing
repeatedly while hovering, distinct from the one-time `dragstart` and
one-time `drop`. `this.draggedCard` is the state that machine carries
between its steps. Also recognized in: a multi-step checkout flow
(cart → shipping → payment, each step needing to remember what came
before), a TCP connection's own handshake sequence, a parser tracking
"currently inside a string literal" across multiple characters.

### SE lens

The alternative to storing `draggedCard` on `this` — a module-level
variable outside any class, the shape the isolated lab used — would
technically work too, but would mean only one `KanbanBoard` could ever
exist safely at a time on a page; two independent boards would silently
share the same "currently dragged card," corrupting each other's state
the instant both were used together. Keeping it on `this` costs nothing
extra and, echoing Lesson 8's dependency-injection proof for two
independent servers, keeps two independent `KanbanBoard` instances fully
isolated from each other by construction, not by convention.

### Commands needed

None new.

### Run it

```javascript
const board = new KanbanBoard(document.getElementById("board"));
board.columns = [todo, done];
board.render();

const cardEl = document.querySelectorAll(".card")[0];       // "Write lesson 11" in To Do
const doneColumnEl = document.querySelectorAll(".column")[1]; // Done column

cardEl.dispatchEvent(new Event("dragstart", { bubbles: true }));
doneColumnEl.dispatchEvent(new Event("dragover", { bubbles: true, cancelable: true }));
doneColumnEl.dispatchEvent(new Event("drop", { bubbles: true }));

console.log(document.getElementById("board").innerHTML);
```

Real output, before and after:

```
--- before drag ---
<div class="column"><h3>To Do</h3><div class="card" draggable="true">Write lesson 11</div></div><div class="column"><h3>Done</h3><div class="card" draggable="true">Write lesson 10</div></div>
--- after dragging 'Write lesson 11' into Done ---
<div class="column"><h3>To Do</h3></div><div class="column"><h3>Done</h3><div class="card" draggable="true">Write lesson 10</div><div class="card" draggable="true">Write lesson 10</div></div>
```

"Write lesson 11" genuinely left the "To Do" column — it's empty
afterward — and genuinely arrived in "Done," appended after the card
already there, using three separately dispatched events against two
different elements, exactly the way a real drag would fire them.

### Connecting sentence

A card now moves between real branches of the board's tree, driven by
three coordinated browser events sharing one small piece of state — the
same shared-state idea a state machine needs anywhere it shows up, this
time for something a person actually did with a mouse.

---

## Closing

**Connect the pieces.** One drag, start to finish: `dragstart` fires on
a card element, and its handler writes `{ card, fromColumn: column }`
onto `this.draggedCard` — the only thing connecting this moment to what
happens next. `dragover` fires repeatedly while hovering over the
"Done" column, and its handler's only job, `e.preventDefault()`, is what
makes the browser allow a `drop` here at all. `drop` finally fires, and
its handler calls `this.moveCard(doneColumn)`, which reads
`this.draggedCard` back out, filters the card out of `fromColumn.cards`,
pushes it onto `toColumn.cards`, clears `this.draggedCard` back to
`null`, and calls `this.render()` — which rebuilds the entire DOM tree
from the now-updated data and re-wires every drag handler fresh, onto
brand-new elements, ready for the next drag.

**What breaks without this.** Comment out `e.preventDefault()` inside
the `dragover` handler, and — in a real browser — dragging a card over
any column would never even trigger a `drop` event at all; the browser
would show its default "not a valid drop target" cursor and release the
drag with nothing happening. This particular failure can't be shown as
a crash with a traceback the way earlier lessons' failures were — it's
a *silent* failure, the interaction simply not working, which is arguably
worse: nothing in the console points at the missing line. That's worth
sitting with honestly rather than glossing over: some bugs announce
themselves loudly, and some just quietly don't work, and `preventDefault()`
being easy to forget with no error message is exactly why it got its
own explicit proof earlier in this lesson instead of a one-line mention.

**Exercises.**
1. Right now, dropping a card back into the *same* column it started in
   still removes and re-appends it, moving it to the end of that
   column's list. Decide whether that's the behavior you want, and if
   not, fix `moveCard` to detect `fromColumn === toColumn` and do
   nothing in that case.
2. Add a real drop *position*, not just a target column — dropping a
   card should be able to land between two existing cards, not always
   at the end. You'll need to figure out which existing card element the
   drop happened nearest to.
3. Write a test (using `jsdom` directly, the same tool this lesson used
   to verify its own examples) proving that dragging a card from column
   A to column B leaves column A's `cards` array one shorter and column
   B's one longer, with the same card object present in B afterward.

**Definition of done.**
- [ ] `Column` exists, and `renderBoard`/`renderColumn`/`renderCard`
      together render a real two-level tree of columns and cards,
      matching the HTML shown above.
- [ ] A full drag sequence — `dragstart`, `dragover`, `drop` — genuinely
      moves a card from one column's `cards` array to another's,
      confirmed by real rendered output before and after.
- [ ] You can explain, in one sentence, why `dragover`'s handler calling
      `preventDefault()` is required for `drop` to ever fire at all.
- [ ] You've confirmed, by removing `preventDefault()` and reasoning
      through it (a real browser needed for the actual silent-failure
      behavior, not just this lesson's own event dispatch), why this
      specific bug wouldn't show up as an error anywhere.
- [ ] Commit with a message explaining why — e.g. `"Model the board as
      a two-level tree of columns and cards, and move cards between
      columns via dragstart/dragover/drop sharing state on the board
      itself"` — not `"add drag and drop"`.

**Next lesson** moves to Project 5 — a Markdown Editor — where text
typed by a user needs to be parsed and re-rendered on every keystroke,
which is exactly fast enough to become a real problem: this is where
**debouncing** and **throttling** earn their place, the first DSA/timing
techniques in this curriculum with no real equivalent in anything built
so far.
