# Lesson 9: Creating, Moving, and Removing Nodes for Real

**What you will build:** a proper node-creation pipeline for the to-do
list — replacing the hardcoded `<li>` elements sitting directly in
`todo.html` with a `seedTodos` function that builds several items at
once and writes them into the real page in a single operation using
`DocumentFragment`, a way to insert a new item at a precise position
using `insertAdjacentElement`, and, wired directly into Lesson 8's
existing delegated click handler, a real duplicate-item feature built
on `cloneNode` and a real delete-item feature built on `remove`.

**What you need to know first:** Lesson 7 — `document.createElement`,
live vs. static collections, and `Element.prototype.children`. Lesson
8 — event delegation, `event.target`, and `Element.prototype.closest`,
which this lesson's own duplicate and delete features are added
directly into.

**Terms used in this lesson:**

- **Live collection** — a collection object that continuously reflects
  the page's actual current state rather than a fixed snapshot. It
  matters in this lesson because it's the direct tool this lesson uses
  to *prove* `DocumentFragment` actually batches writes: watching a
  live collection's own length change (or not change) is how "one write
  instead of several" becomes something demonstrated rather than
  claimed.
- **Event delegation** — attaching one event listener to a shared
  ancestor, and using the event's own target plus ancestor-walking to
  figure out which specific descendant was involved, rather than
  attaching a separate listener to every element that might need one.
  It matters in this lesson because this lesson's new duplicate and
  delete features are both added directly inside the one delegated
  listener Lesson 8 already built, rather than requiring any new
  listener of their own.
- **`event.target`** — the specific element an event actually
  originated from, regardless of which ancestor's listener is currently
  handling it. It matters in this lesson because distinguishing a click
  on a delete button from a click on an item's label — two different
  features, needing two different responses — depends entirely on
  checking exactly what `event.target` was.
- **`closest`** — an instance method on any `Element` that walks
  upward through that element's own ancestors, including the element
  itself, testing each one against a CSS selector and returning the
  first match, or `null` if none is found. It matters in this lesson as
  the tool both the duplicate and the delete feature use to get from
  whatever was actually clicked back to the specific `.todo-item` it
  belongs to.

**Objects and methods used:**

- **`document.createElement`**
  - *What it is:* a real method on the global `document` object that
    builds a brand-new element of a specified tag type.
  - *Implementation:* `document.createElement(tagName)` — an instance
    method taking one string argument (an HTML tag name, case-insensitive)
    and returning a new `Element` of that type, existing only in memory
    — not yet attached anywhere in the visible page.
  - *Its use:* this lesson's basic building block, used repeatedly
    inside a new helper function to construct each piece of a to-do
    item from scratch, before any of those pieces are ever attached to
    the real page.
  - *Type:* an instance method on `document`.
  - *Responsibility:* to allocate a new, disconnected element of the
    requested type — nothing about attaching it anywhere, and nothing
    about its attributes or content, both of which have to be set
    separately afterward.
  - *Depends on:* a valid HTML tag name string.
  - *Connects to:* called several times inside this lesson's own
    `createTodoElement` function, once per piece of a to-do item's
    structure; its results are assembled together with `appendChild`
    before ever reaching the real, visible page.
  - *Shape:* a public, standard Web-platform API — the fundamental tool
    for building new page content from JavaScript.
- **`Node.prototype.appendChild`**
  - *What it is:* a real method on any `Node` that attaches another
    node as its very last child.
  - *Implementation:* `someNode.appendChild(childNode)` — an instance
    method taking one existing node and moving it (not copying it) to
    become the last child of the node it's called on; if `childNode`
    was already attached somewhere else in the tree, it's detached from
    there first.
  - *Its use:* this lesson's tool both for assembling a to-do item's
    own internal pieces together, and — critically, per this lesson's
    own central proof — for the single, final write that actually
    attaches a whole batch of new items to the real, visible list at
    once.
  - *Type:* an instance method, available on any `Node`.
  - *Responsibility:* to move exactly one node to become the last child
    of another — nothing about the moved node's own contents, and
    nothing about any other children already present, which are left
    exactly where they were.
  - *Depends on:* an existing node to call it on, and an existing node
    to move.
  - *Connects to:* called on individual elements while building one
    to-do item's internal structure, and called once, separately, on
    the real page's list container, to attach an entire batch at once —
    this lesson's own proof turns on the difference between those two
    uses.
  - *Shape:* a public, standard Web-platform API surface.
- **`document.createDocumentFragment`**
  - *What it is:* a real method on `document` that builds a special
    kind of container — a `DocumentFragment` — meant to temporarily
    hold a group of nodes that aren't yet part of the visible page.
  - *Implementation:* `document.createDocumentFragment()` — an instance
    method taking no arguments, returning a new, empty
    `DocumentFragment`; nodes can be appended into it exactly like any
    other node, but a `DocumentFragment` itself is never rendered — it
    has no visual presence on the page at all, even while it holds real
    elements.
  - *Its use:* this lesson's central tool — a scratch space to build an
    entire batch of new to-do items in, before ever touching the real,
    visible list.
  - *Type:* an instance method on `document`.
  - *Responsibility:* to provide a real, functioning container — nodes
    can be appended to it, queried inside it, and removed from it the
    same as any other node — that exists purely as an in-memory staging
    area, never as part of the rendered page.
  - *Depends on:* nothing beyond `document` itself.
  - *Connects to:* built once per batch of new items in this lesson's
    own project code; each new item is appended into it first, and the
    fragment itself is then appended, as a single unit, to the real
    list.
  - *Shape:* a public, standard Web-platform API — specifically
    designed as a performance and batching tool, not a general-purpose
    container meant to be kept around.
- **`Element.prototype.insertAdjacentElement`**
  - *What it is:* a real method on any `Element` that inserts another
    element at one of four precise positions relative to the element
    it's called on, without needing to know or reference that element's
    parent directly.
  - *Implementation:* `someElement.insertAdjacentElement(position,
    newElement)` — an instance method taking a position string —
    `"beforebegin"` (immediately before this element, as a sibling),
    `"afterbegin"` (as this element's own first child), `"beforeend"`
    (as this element's own last child), or `"afterend"` (immediately
    after this element, as a sibling) — and the element to insert;
    moves `newElement` into that exact position.
  - *Its use:* this lesson's tool for inserting a brand-new item
    immediately next to a specific, already-existing item — used both
    for precise, arbitrary positioning and, later in this lesson, as
    the mechanism behind the duplicate-item feature, which needs a
    copy to land directly after its original.
  - *Type:* an instance method, available on any `Element`.
  - *Responsibility:* to move exactly one element into exactly one of
    four well-defined positions relative to the element it's called
    on — nothing about any other elements already at that position,
    which are simply shifted to make room, the same way any ordinary
    insertion works.
  - *Depends on:* an existing reference element to position relative
    to, one of the four exact position strings, and an existing element
    to insert.
  - *Connects to:* called directly on a specific `.todo-item` in this
    lesson's own project code, positioning a new element precisely
    beside it rather than only ever at the end of the whole list.
  - *Shape:* a public, standard Web-platform API surface.
- **`Node.prototype.cloneNode`**
  - *What it is:* a real method on any `Node` that produces a copy of
    it, optionally including its entire descendant structure.
  - *Implementation:* `someNode.cloneNode(deep)` — an instance method
    taking one boolean; `false` (or omitted) produces a **shallow**
    copy — the node itself, with its own attributes, but none of its
    children; `true` produces a **deep** copy — the node and its entire
    descendant tree, copied recursively. The returned node is a
    genuinely separate object, not attached anywhere in the page,
    identical in structure to the original but sharing no further
    connection to it.
  - *Its use:* this lesson's tool for the duplicate-item feature —
    producing a complete, independent copy of an existing to-do item,
    including its nested label and delete button, without rebuilding
    that structure by hand a second time using `createElement`.
  - *Type:* an instance method, available on any `Node`.
  - *Responsibility:* to produce a structurally identical, but entirely
    independent, copy of the node it's called on — it does not attach
    the copy anywhere, and changes made to the copy afterward never
    affect the original, or vice versa.
  - *Depends on:* an existing node to copy, and an explicit choice of
    shallow or deep.
  - *Connects to:* called on a specific `.todo-item`, found via
    `closest`, inside this lesson's delegated click handler; its result
    is passed directly to `insertAdjacentElement` to place the copy
    immediately after the original.
  - *Shape:* a public, standard Web-platform API surface.
- **`Element.prototype.remove`**
  - *What it is:* a real method on any `Element` that detaches it from
    its parent, removing it from the visible page.
  - *Implementation:* `someElement.remove()` — an instance method
    taking no arguments; after it runs, the element is no longer a
    child of anything, though the element object itself still exists in
    memory (any variable still referencing it still works) — only its
    position in the visible page is gone.
  - *Its use:* this lesson's tool for the delete-item feature — removing
    exactly the one `.todo-item` a delete button belongs to, found the
    same way the duplicate feature finds its own target, via `closest`.
  - *Type:* an instance method, available on any `Element`.
  - *Responsibility:* to detach exactly the element it's called on from
    its current parent — nothing about any other elements, and nothing
    about the element's own internal structure, which remains completely
    intact even after removal.
  - *Depends on:* an existing element that currently has a parent to be
    removed from.
  - *Connects to:* called on a `.todo-item` found via `closest`, inside
    the same delegated click handler the duplicate feature also uses,
    distinguished from it by checking `event.target` first.
  - *Shape:* a public, standard Web-platform API surface.

---

## Concept Unit: Batching Writes with `DocumentFragment`

### The Problem

`todo.html` currently hardcodes its starting to-do items directly in
its own markup — Lesson 7 and 8's own three `<li>` elements are written
out by hand in the HTML file itself. A real to-do app needs to build
its starting items from JavaScript instead — from a saved list, say —
which means calling `document.createElement` and `appendChild`
repeatedly, once per item, directly against the real, live list.
Lesson 7 already proved that a live collection like `list.children`
notices every single change to the real page the moment it happens —
which raises a real question: does adding several items this way, one
`appendChild` call at a time, actually touch the real, visible page
once per item, or is there a way to build a whole batch first and only
touch the real page once, at the very end?

> **Try this before reading on:** Lesson 7's own live `HTMLCollection`
> proof showed `list.children.length` updating the instant a new child
> was appended. If three separate `list.appendChild(...)` calls run one
> after another, each attaching one new item directly to the real
> `list`, what would you expect `list.children.length` to report if you
> checked it *between* each of those three calls — does it jump straight
> from its starting value to the final value, or does it pass through
> every value in between? What would have to be different about *where*
> new elements are being appended to for that in-between growth to stop
> happening?

### Isolated Example

This lesson's isolated examples use the same real, standards-compliant
DOM implementation as Lessons 7 and 8.

```js
const names = ["Do laundry", "Pay bills", "Call mom"];

names.forEach(function (name) {
  const li = document.createElement("li");
  li.textContent = name;
  list.appendChild(li);
  console.log("list.children.length after appending", name, "->", list.children.length);
});
```

Run against a page with an empty `<ul id="list">`. Run for real, not
predicted — whether `list.children.length` genuinely changes on every
single call, or only once at the end, is exactly the kind of
environment behavior the Verification Rule requires proof for.

**Real output:**
```
list.children.length after appending Do laundry -> 1
list.children.length after appending Pay bills -> 2
list.children.length after appending Call mom -> 3
```

Exactly as Lesson 7's own live-collection proof would predict:
`list.children`, read fresh each time, reports a different number after
every single `appendChild` call — three separate writes to the real,
live page, one per item.

**A second run, proving the alternative — building the same three
items inside a `DocumentFragment` first:**

```js
const fragment = document.createDocumentFragment();

names.forEach(function (name) {
  const li = document.createElement("li");
  li.textContent = name;
  fragment.appendChild(li);
  console.log("list.children.length while building fragment:", list.children.length);
  console.log("fragment.childNodes.length:", fragment.childNodes.length);
});

console.log("--- appending fragment to the real list now ---");
list.appendChild(fragment);
console.log("list.children.length after one appendChild(fragment):", list.children.length);
console.log("fragment.childNodes.length after append:", fragment.childNodes.length);
```

**Real output:**
```
list.children.length while building fragment: 0
fragment.childNodes.length: 1
list.children.length while building fragment: 0
fragment.childNodes.length: 2
list.children.length while building fragment: 0
fragment.childNodes.length: 3
--- appending fragment to the real list now ---
list.children.length after one appendChild(fragment): 3
fragment.childNodes.length after append: 0
```

While all three items are being built, `list.children.length` never
moves off `0` — the real, visible list is completely untouched, because
every `appendChild` during this phase targets the fragment, not `list`.
Only the single `list.appendChild(fragment)` line actually changes the
real page, jumping straight from `0` to `3` in one write. And
`fragment.childNodes.length` drops to `0` immediately afterward — proof
that `appendChild` **moved** the fragment's contents into `list` rather
than copying them; a `DocumentFragment` that's just been appended is
left genuinely empty, ready to be discarded or reused for the next
batch.

This throwaway example is now discarded — this specific loop and
fragment never appear in the project again, though the exact technique
is what the project's own `seedTodos` function performs next.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.html` (the three hardcoded
  `<li>` elements from Lesson 7 are removed, leaving an empty
  `<ul id="todo-list">`) and `todo.js` (a new `createTodoElement` and
  `seedTodos` function are added, and `seedTodos` is called once to
  build the starting items instead).
- **Change type:** refactor (`todo.html`'s markup) plus add (`todo.js`).
- **Location:** `todo.html`'s three `<li>` elements are deleted from
  inside the existing `<ul id="todo-list">`, which remains. `todo.js`'s
  new functions are added near the top of the file, before Lesson 8's
  existing delegated listener, which is otherwise unchanged.
- **Dependencies:** the existing `todo-list` container (`list`) from
  Lesson 7.

### The New Code

```js
function createTodoElement(text) {
  const li = document.createElement("li");
  li.className = "todo-item";

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = text;
  li.appendChild(label);

  return li;
}

function seedTodos(names) {
  const fragment = document.createDocumentFragment();
  names.forEach(function (name) {
    fragment.appendChild(createTodoElement(name));
  });
  list.appendChild(fragment);
}

seedTodos(["Buy milk", "Walk dog", "Read book"]);
```

### The Updated Project

`todo.html`:
```
1  <ul id="todo-list"></ul>                    // ← changed
2  <script src="todo.js" defer></script>
```

`todo.js` (new lines, inserted before Lesson 8's existing delegated
listener; `list` itself is still the same variable defined back in
Lesson 7):
```
 1  function createTodoElement(text) {          // ← new
 2    const li = document.createElement("li");    // ← new
 3    li.className = "todo-item";                   // ← new
 4
 5    const label = document.createElement("span");  // ← new
 6    label.className = "label";                        // ← new
 7    label.textContent = text;                          // ← new
 8    li.appendChild(label);                               // ← new
 9
10    return li;                                            // ← new
11  }                                                         // ← new
12
13  function seedTodos(names) {                              // ← new
14    const fragment = document.createDocumentFragment();      // ← new
15    names.forEach(function (name) {                            // ← new
16      fragment.appendChild(createTodoElement(name));             // ← new
17    });                                                           // ← new
18    list.appendChild(fragment);                                    // ← new
19  }                                                                  // ← new
20
21  seedTodos(["Buy milk", "Walk dog", "Read book"]);                  // ← new
```

`todo.html` now starts with a genuinely empty list — every visible item
comes entirely from `todo.js`. `todo.js` builds each item's full
structure with `createTodoElement`, collects a whole batch of them
inside a single `DocumentFragment` via `seedTodos`, and writes that
batch to the real page in exactly one `appendChild` call.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`document.createElement("li")` and `document.createElement("span")`
  (lines 2, 5).** `document.createElement` (full CRC treatment in the
  header, above), building two separate, disconnected elements — a
  container `<li>` and an inner `<span>` for the item's own label,
  mirroring the nested structure Lesson 7's own markup already
  established, now built from JavaScript instead of written by hand in
  HTML.
- **`li.className = "todo-item"` and `label.className = "label"` (lines
  3, 6).** Ordinary property assignments, the identical mechanism used
  inside `addTodo` back in Lesson 7, setting each element's class.
- **`label.textContent = text` (line 7).** The same property assignment
  pattern, setting the label's visible text to whatever string
  `createTodoElement` was called with.
- **`li.appendChild(label)` (line 8).** `Node.prototype.appendChild`
  (full CRC treatment in the header, above), attaching the label
  *inside* the `<li>` — this specific call never touches the real,
  visible page at all, because at this point `li` itself isn't attached
  to anything either; it's purely internal assembly of one item's own
  structure.
- **`return li` (line 10).** An ordinary `return` statement, handing the
  finished, but still fully disconnected, `<li>` back to whatever called
  `createTodoElement`.
- **`document.createDocumentFragment()` (line 14).**
  `document.createDocumentFragment` (full CRC treatment in the header,
  above), building one, empty, in-memory staging container for this
  entire batch.
- **`names.forEach(function (name) {...})` (line 15).** An ordinary
  array method, iterating over whatever list of name strings
  `seedTodos` was called with.
- **`fragment.appendChild(createTodoElement(name))` (line 16).** Two
  things happening in one line: `createTodoElement(name)` builds one
  complete, disconnected item, and `fragment.appendChild(...)` attaches
  it into the fragment — not into the real `list` — which is exactly
  why this unit's own isolated lab proved `list.children.length` stays
  at `0` for the entire duration of this loop.
- **`list.appendChild(fragment)` (line 18).** The single line that
  actually touches the real, visible page — moving every item the loop
  just built, all at once, out of the fragment and into `list`, per
  this unit's own proof that `appendChild` moves a fragment's children
  rather than copying them.
- **`seedTodos(["Buy milk", "Walk dog", "Read book"])` (line 21).** An
  ordinary function call, actually running the whole batching pipeline
  once, with the same three starting items Lesson 7's markup used to
  hardcode directly in HTML.

### CS Lens

This is **batching** — collecting several individual operations
together and applying them as one combined operation, specifically to
reduce the number of times a slower, shared resource (here, the real,
rendered page) needs to be touched.

```
Also recognized in: a database transaction wrapping several
individual INSERT statements so the database only has to commit
once instead of once per row, a text editor's own "undo" grouping a
multi-character paste as a single undo step instead of one step per
character, a network client batching several small outgoing
messages into one larger packet instead of sending each one
separately, each with its own overhead
```

### SE Lens

The alternative not chosen here is what this unit's own first isolated
lab already proved: calling `appendChild` directly against the real
list, once per item. That approach's real advantage is simplicity —
one line per item, with nothing extra to set up. Its real cost, proven
directly, is that every single append is a separate write to the real,
live page — for three items the difference is negligible, but a
real-world seed operation loading dozens or hundreds of saved items
this way would trigger that many separate live-page mutations, each one
a real (if often small) piece of work for the browser to process
immediately. `DocumentFragment`'s real advantage is collapsing all of
that into one write, proven directly by this unit's own
`list.children.length` staying at `0` throughout the whole batch. Its
own cost: a small amount of extra code (creating and populating the
fragment) for a benefit that only matters once a batch is large enough,
or the page complex enough, for the difference to be worth measuring at
all — for a single, one-off insertion, reaching for a `DocumentFragment`
at all is more ceremony than the situation calls for.

### Commands Needed

None — open `todo.html` in a browser, as in earlier lessons.

### Run It

```js
console.log(Array.from(list.children).map(li => li.querySelector(".label").textContent));
```

**Real output:**
```
[ 'Buy milk', 'Walk dog', 'Read book' ]
```

All three seeded items are present, built entirely from JavaScript,
attached to the real page in a single write, with the exact same
starting content Lesson 7's own hardcoded markup used to provide
directly.

### Connecting to what came before

This unit replaces Lesson 7's hardcoded starting markup with a real
node-creation pipeline, using Lesson 7's own live-collection behavior
as the direct proof that batching through a `DocumentFragment` really
does reduce the number of real writes to the page, not merely
reorganize the same number of writes differently. The next unit adds a
way to insert a new item at a precise position, rather than only ever
at the end of the whole list.

---

## Concept Unit: Precise Positioning with `insertAdjacentElement`

### The Problem

`seedTodos` and `Node.prototype.appendChild` both only ever add
elements at the very end of whatever they're appending into. Real
to-do-list behavior often needs more precision than that — inserting a
new item directly next to a specific existing one, regardless of where
that existing one happens to sit in the list.

> **Try this before reading on:** if you already have a reference to
> one specific `.todo-item` — not the list container itself, just that
> one item — and you want a brand-new item to land immediately after
> it, specifically, no matter how many items come after it in the list
> today, would `appendChild` (which only ever adds as the very *last*
> child of whatever it's called on) be able to do that directly? What
> additional piece of information — beyond just "attach this somewhere
> inside the list" — would a method need to accept in order to support
> inserting relative to one specific, arbitrary element instead of only
> ever at one fixed end?

### Isolated Example

```js
target.insertAdjacentElement("beforebegin", makeLi("beforebegin item"));
target.insertAdjacentElement("afterend", makeLi("afterend item"));

console.log(Array.from(list.children).map(li => li.textContent));
```

Run against a page with one existing `<li id="target">Walk dog</li>`
inside `list`, and a small helper, `makeLi`, building a plain `<li>`
with the given text. Run for real — the exact final ordering produced
by two different position keywords is exactly the kind of behavioral
claim the Verification Rule requires proof for.

**Real output:**
```
[ 'beforebegin item', 'Walk dog', 'afterend item' ]
```

`"beforebegin"` placed a brand-new item immediately before `target`, as
a sibling — not inside it. `"afterend"` placed a second new item
immediately after `target`, also as a sibling. Both insertions happened
relative to `target` specifically, with no need to reference `list`
(the actual parent) at all, and no need to know or care how many other
items existed elsewhere in the list.

This throwaway example is now discarded — `target` and `makeLi` never
appear in the project again, though the exact `"afterend"` technique
demonstrated here is reused directly, unmodified, in this lesson's next
Concept Unit.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none, permanently. Per this schema's own
  provision for a unit whose code doesn't modify the tracked project
  file but depends on code already established: this unit demonstrates
  `insertAdjacentElement` directly against the real, seeded project
  page from the previous unit, without adding any new line to `todo.js`
  — the technique itself is what the following unit's own permanent
  code change actually uses.
- **Change type:** none (demonstration only).
- **Location:** not applicable.
- **Dependencies:** the `seedTodos`-built list from the previous
  Concept Unit in this lesson.

### The New Code

```js
const secondItem = list.children[1];
const newItem = createTodoElement("Vacuum living room");
secondItem.insertAdjacentElement("afterend", newItem);
```

### The Updated Project

Not applicable in the usual sense — `todo.js` itself is not
permanently modified by this unit. Shown above is a temporary
demonstration, run directly against the real, already-seeded project
list from the previous unit, using `createTodoElement` — the same
helper function that unit already added — to build the new item being
positioned.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`list.children[1]` (line 1).** `Element.prototype.children`, from
  Lesson 7 — a live `HTMLCollection` of `list`'s direct child elements,
  indexed to reach the second seeded item, `"Walk dog"`.
- **`createTodoElement("Vacuum living room")` (line 2).** The exact
  helper function the previous unit added, reused here unchanged,
  building one fully-structured, but still disconnected, new to-do
  item.
- **`secondItem.insertAdjacentElement("afterend", newItem)` (line 3).**
  `Element.prototype.insertAdjacentElement` (full CRC treatment in the
  header, above), called on `secondItem` specifically — not on `list`
  — with the `"afterend"` position, placing `newItem` immediately after
  `secondItem` as a sibling, regardless of how many other items exist
  elsewhere in the list or what their own positions are.

### CS Lens

This is **relative positioning** — specifying where something goes in
terms of its relationship to an existing, specific reference point,
rather than in terms of an absolute position (like "index 4") or a
fixed end (like "last").

```
Also recognized in: a text editor's cursor-relative insertion
("insert this character right where the cursor currently is,"
regardless of the document's overall length), a linked list's own
insert-after-node operation, which only ever needs a reference to
one specific existing node, never the list's own head or an
absolute index, a calendar app scheduling a new event "right after"
an existing one, unaffected by how many other events exist earlier
or later in the day
```

### SE Lens

The alternative not chosen here is what `seedTodos` already does:
always append at one fixed end, then, separately, work out the desired
final order by controlling what order things get appended in in the
first place. That approach works well for building an entire list from
scratch, in order, but breaks down the moment a new item needs to be
inserted relative to something that's already on the page — reordering
around a fixed-end-only tool would require detaching and reattaching
existing elements just to make room, extra work `insertAdjacentElement`
avoids entirely by taking the reference point as a direct argument.
`insertAdjacentElement`'s own real cost: because it takes a plain
string for position (`"beforebegin"`, `"afterbegin"`, `"beforeend"`,
`"afterend"`) rather than, say, four separate differently-named
methods, a typo in that string (`"afterEnd"`, capitalized wrong, or a
misremembered word) fails silently rather than being caught by any
tooling — the method simply does nothing detectable as broken until the
page is inspected and the new element isn't where it was expected.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
console.log(Array.from(list.children).map(li => li.querySelector(".label").textContent));
```

**Real output:**
```
[ 'Buy milk', 'Walk dog', 'Vacuum living room', 'Read book' ]
```

The new item landed exactly where `"afterend"` specified — directly
after `"Walk dog"`, regardless of `"Read book"` already sitting further
down the list.

### Connecting to what came before

This unit adds a way to insert relative to a specific, already-known
element, in direct contrast with the previous unit's always-append-at-
the-end batching. The final unit combines this exact `"afterend"`
technique with `cloneNode`, wiring both directly into Lesson 8's
existing delegated click handler for a real duplicate-item feature —
paired with `remove`, for a real delete-item feature.

---

## Concept Unit: Duplicating and Removing Items — `cloneNode` and `remove`

### The Problem

A real to-do list commonly needs two more actions, both acting on one
specific, already-existing item: duplicate it (useful for a recurring
task, say), and delete it outright. Rebuilding a duplicate by calling
`createTodoElement` a second time, by hand, with the same text passed
in again, would work for this lesson's simple items — but a real
item might carry extra state (a due date, a completion flag, custom
styling) that `createTodoElement` was never written to reproduce.
Is there a way to duplicate an *existing* element directly, exactly as
it currently is, without rebuilding it from scratch at all?

> **Try this before reading on:** if an existing `.todo-item` already
> has its own internal structure — a `<span class="label">`, and, as
> this unit is about to add, a delete `<button>` — and you wanted an
> exact copy of it, including everything nested inside it, what would a
> method need to do differently from `createElement` (which only ever
> builds one brand-new, completely empty element of a given tag) to
> produce that copy? And once such a copy exists, would it automatically
> appear anywhere on the page, or would it still need one more step —
> using a tool this lesson already built — to actually place it
> somewhere real?

### Isolated Example

```js
const shallow = original.cloneNode(false);
console.log("shallow.outerHTML:", shallow.outerHTML);
console.log("shallow.children.length:", shallow.children.length);

const deep = original.cloneNode(true);
console.log("deep.outerHTML:", deep.outerHTML);
console.log("deep === original:", deep === original);
console.log("deep.querySelector('.label').textContent:", deep.querySelector(".label").textContent);

original.insertAdjacentElement("afterend", deep);
console.log("count after insert:", list.children.length);

deep.remove();
console.log("count after remove:", list.children.length);
console.log("deep.parentElement after remove:", deep.parentElement);
```

Run against a page with one existing `.todo-item` containing a nested
`<span class="label">Buy milk</span>`. Run for real — the exact
difference between a shallow and a deep clone, and what state a removed
element is left in afterward, are both internal-structure claims the
Verification Rule requires proof for.

**Real output:**
```
shallow.outerHTML: <li class="todo-item"></li>
shallow.children.length: 0
deep.outerHTML: <li class="todo-item"><span class="label">Buy milk</span></li>
deep === original: false
deep.querySelector('.label').textContent: Buy milk
count after insert: 2
count after remove: 1
deep.parentElement after remove: null
```

`cloneNode(false)` — shallow — copied `original`'s own tag and class,
but none of its nested content; `shallow.children.length` is `0`.
`cloneNode(true)` — deep — copied the entire nested structure, label
included; `deep.querySelector('.label').textContent` correctly reports
`"Buy milk"`, proving the copy is structurally complete, not just
superficially similar. `deep === original` is `false` — a genuinely
separate object, confirmed by identity, not merely by looking alike.
`original.insertAdjacentElement("afterend", deep)` — this unit's own
reuse of the previous unit's exact technique — is what actually makes
the clone visible on the page at all; before this line, `deep` existed
only in memory, exactly like any freshly-`createElement`d node. Finally,
`deep.remove()` drops the live count back down, and `deep.parentElement`
afterward is `null` — proof that `remove()` detaches the element from
its parent without destroying the element object itself; `deep` is
still a completely intact, fully-structured `<li>`, simply no longer
attached anywhere.

This throwaway example is now discarded — this specific `original` and
`deep` never appear in the project again, though the exact
`cloneNode`/`insertAdjacentElement`/`remove` combination is what the
project's own updated click handler performs next.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`. `createTodoElement` (from
  the first Concept Unit in this lesson) is extended to include a
  delete button on every item; Lesson 8's existing delegated click
  handler is extended with duplicate and delete behavior.
- **Change type:** add (a delete button inside `createTodoElement`)
  plus add (new branches inside the existing delegated handler).
- **Location:** inside `createTodoElement`, after the existing label is
  appended. Inside Lesson 8's delegated `list.addEventListener("click",
  ...)` handler, before its existing `closest`/`null`-check logic.
- **Dependencies:** `createTodoElement` and the delegated listener, both
  already established earlier in this curriculum.

### The New Code

```js
function createTodoElement(text) {
  const li = document.createElement("li");
  li.className = "todo-item";

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = text;
  li.appendChild(label);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "\u00d7";
  li.appendChild(deleteBtn);

  return li;
}
```

```js
list.addEventListener("click", function (event) {
  if (event.target.matches(".delete-btn")) {
    const item = event.target.closest(".todo-item");
    item.remove();
    return;
  }

  const item = event.target.closest(".todo-item");
  if (item === null) {
    return;
  }
  const copy = item.cloneNode(true);
  item.insertAdjacentElement("afterend", copy);
});
```

### The Updated Project

`todo.js`'s `createTodoElement`, in full, with this unit's own new
lines marked (everything above the delete-button block is unchanged
from the first Concept Unit in this lesson):
```
 1  function createTodoElement(text) {
 2    const li = document.createElement("li");
 3    li.className = "todo-item";
 4
 5    const label = document.createElement("span");
 6    label.className = "label";
 7    label.textContent = text;
 8    li.appendChild(label);
 9
10    const deleteBtn = document.createElement("button");   // ← new
11    deleteBtn.className = "delete-btn";                    // ← new
12    deleteBtn.textContent = "\u00d7";                        // ← new
13    li.appendChild(deleteBtn);                                // ← new
14
15    return li;
16  }
```

`todo.js`'s delegated click handler, in full, with this unit's own new
lines marked (Lesson 8's original `closest`/`null`-check/log logic is
kept, now reached only once the new duplicate branch below it has
already handled the delete case):
```
 1  list.addEventListener("click", function (event) {
 2    if (event.target.matches(".delete-btn")) {          // ← new
 3      const item = event.target.closest(".todo-item");    // ← new
 4      item.remove();                                        // ← new
 5      return;                                                // ← new
 6    }                                                          // ← new
 7
 8    const item = event.target.closest(".todo-item");
 9    if (item === null) {
10      return;
11    }
12    const copy = item.cloneNode(true);                       // ← new
13    item.insertAdjacentElement("afterend", copy);              // ← new
14  });
```

`createTodoElement` now builds a delete button into every to-do item it
creates, seeded items included, since `seedTodos` calls it for each
starting item. The delegated handler first checks whether the actual
click landed on a delete button specifically; if so, it removes that
button's owning item and stops. Otherwise, it falls through to a
duplicate action, cloning whichever item was clicked (or clicked inside)
and inserting the copy directly after the original.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`document.createElement("button")`, `deleteBtn.className =
  "delete-btn"`, `deleteBtn.textContent = "\u00d7"`, `li.appendChild
  (deleteBtn)` (`createTodoElement`, lines 10–13).** The identical
  element-building pattern already established for the label earlier in
  the same function — a new element, a class, some text content, and
  attachment into the item's own internal structure — applied here to a
  `<button>` instead of a `<span>`.
- **`event.target.matches(".delete-btn")` (handler, line 2).**
  `Element.prototype.matches`, from Lesson 7, testing whether the
  specific element the click actually landed on — not any ancestor,
  just the real target — carries the delete button's own class. This
  is checked *before* the existing duplicate-handling logic, so a click
  on the delete button never falls through to the duplicate branch
  below it.
- **`event.target.closest(".todo-item")` (handler, line 3, inside the
  new `if` block).** `closest`, from Lesson 7, walking from the delete
  button upward to find its owning `.todo-item` — the same technique
  Lesson 8's own delegated handler already used, applied here starting
  from a different `event.target` than the one that block was originally
  written for.
- **`item.remove()` (handler, line 4).** `Element.prototype.remove`
  (full CRC treatment in the header, above), called on the specific
  item found by the line above — detaching exactly that one item from
  the real, visible list.
- **`return` (handler, line 5).** An ordinary early return, ending this
  specific call to the handler immediately after handling the delete
  case, so the duplicate-handling code below it never runs for this
  same click.
- **`item.cloneNode(true)` (handler, line 12).** `Node.prototype
  .cloneNode` (full CRC treatment in the header, above), called with
  `true` — a deep clone — on whichever `.todo-item` the click (that
  wasn't on a delete button) was found to belong to, via the existing
  `closest` call directly above it, unchanged from Lesson 8.
- **`item.insertAdjacentElement("afterend", copy)` (handler, line 13).**
  The exact technique from the previous Concept Unit, reused unchanged
  — placing the freshly-cloned copy immediately after the original item
  it was cloned from.

### CS Lens

`cloneNode` is a real, built-in implementation of the **prototype
pattern** from a completely different angle than Lesson 1's own use of
that term: there, "prototype" meant one shared object other objects
delegate lookups to; here, it means duplicating a fully-built, concrete
object directly, as a faster or more faithful alternative to
rebuilding an equivalent one from a separate blueprint.

```
Also recognized in: a version control system's own branch operation,
copying an entire existing commit history as a starting point rather
than replaying every original commit from scratch, an image editor's
"duplicate layer" feature, copying a layer's complete pixel data
and settings rather than requiring the user to recreate them by
hand, a virtual machine's snapshot-and-clone feature, producing a
fully running, independent copy of an existing machine's exact disk
state
```

### SE Lens

The alternative not chosen here for duplication is calling
`createTodoElement` a second time with the same text. That approach's
real advantage is that it doesn't require an existing element to copy
from at all — it can build a to-do item purely from data. Its real
cost, named in this unit's own Problem: it only reproduces whatever
`createTodoElement` itself knows how to build — any state that exists
on the real element but isn't represented in that function's own
parameters (a `checked` class toggled after creation, say, once this
curriculum's later lessons add that capability) would be silently lost
by a rebuild-from-scratch duplicate, but preserved automatically by
`cloneNode(true)`, which copies the element exactly as it currently
is, whatever that turns out to include. The real cost specific to
`remove`: unlike `cloneNode`, which the previous paragraph already
covered, `remove()` itself is close to unconditionally the right tool
for detaching a single element — its one real limitation is that it
only removes the exact element it's called on, nothing about its
children (which are simply removed along with it, still attached to
each other, just no longer attached to the page) and nothing about
tidying up anything external that might still be tracking a reference
to the now-detached element, which remains a live, functioning object
in memory for as long as anything still holds onto it.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
console.log("initial items:", Array.from(list.children).map(li => li.querySelector(".label").textContent));

const secondLabel = list.children[1].querySelector(".label");
secondLabel.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log("after duplicating item 2:", Array.from(list.children).map(li => li.querySelector(".label").textContent));

const firstDelete = list.children[0].querySelector(".delete-btn");
firstDelete.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log("after deleting item 1:", Array.from(list.children).map(li => li.querySelector(".label").textContent));
```

**Real output:**
```
initial items: [ 'Buy milk', 'Walk dog', 'Read book' ]
after duplicating item 2: [ 'Buy milk', 'Walk dog', 'Walk dog', 'Read book' ]
after deleting item 1: [ 'Walk dog', 'Walk dog', 'Read book' ]
```

Clicking the second item's label duplicated it, inserting the copy
directly after the original — the list grows from three items to four,
with `"Walk dog"` now appearing twice, adjacent to each other, exactly
as `"afterend"` positioning guarantees. Clicking the first item's
delete button then removes it — the list drops back to three items,
with the original `"Buy milk"` gone and both `"Walk dog"` copies still
present and still correctly ordered.

### Connecting to what came before

This unit combines the previous unit's exact `insertAdjacentElement`
technique with `cloneNode`, and wires both — along with `remove` — directly
into Lesson 8's existing delegated handler, extending it rather than
replacing it: the same single listener that already resolved clicks
down to a specific `.todo-item` now also distinguishes, by checking
`event.target` first, between a click that should delete that item and
a click that should duplicate it.

---

## Connect the Pieces

One item, followed through every technique this lesson built: `"Walk
dog"`, seeded originally as part of a batch of three names passed to
`seedTodos`. `createTodoElement` built its full structure —
`<li class="todo-item">`, a nested `<span class="label">`, and, once
this lesson's final unit extended the function, a nested delete
`<button>` — entirely in memory, untouched by the real page. That whole
structure was appended into a `DocumentFragment`, alongside the other
two seeded items, and the real, visible list was touched exactly once,
when the completed fragment was appended to it — proven, by this
lesson's own first unit, to be a single write rather than three. Later,
a click on that same item's label reaches the delegated handler
Lesson 8 built; `event.target.matches(".delete-btn")` reports `false`,
so the click falls through to the duplicate branch; `event.target
.closest(".todo-item")` resolves to the `"Walk dog"` item itself;
`cloneNode(true)` produces a complete, independent copy of it, delete
button included; `insertAdjacentElement("afterend", copy)` places that
copy immediately next to the original. A later click on the *first*
item's own delete button takes the other new branch instead:
`event.target.matches(".delete-btn")` reports `true` this time, and
`remove()` detaches that first item from the page entirely — leaving
both `"Walk dog"` items, and the original `"Read book"`, exactly where
this lesson's own verified run showed them.

## What's Next

Lesson 10 introduces `CustomEvent` and `dispatchEvent` — building this
curriculum's own application-level events (an `item:duplicated` event,
say, fired the moment this lesson's own duplicate feature runs) so that
separate pieces of a page's own code can react to what happened without
being wired directly into the same function that made it happen, the
way this lesson's delegated handler currently is.
