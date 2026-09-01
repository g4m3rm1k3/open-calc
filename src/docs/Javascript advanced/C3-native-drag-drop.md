# Lesson 14: Native Drag-and-Drop, Part 1 — the HTML5 DnD API

**What you will build:** real drag-to-reorder for the to-do list, using
the browser's own native HTML5 Drag and Drop API — `draggable`,
`dragstart`, `dragover`, `drop`, and `dataTransfer` — letting a user
pick up any item and drop it anywhere else in the list to reorder it.
This lesson pays particular attention to one specific, well-documented
trap: a drop target does nothing at all, by default, unless one
specific event is explicitly told to allow it.

**What you need to know first:** Lesson 8 — event delegation,
`event.target`, and `Element.prototype.closest`; this lesson's own
drag listeners are attached once, to the shared list container, exactly
the same delegation pattern already established there. Lesson 9 —
`Element.prototype.insertAdjacentElement`, reused directly as the
mechanism that actually moves a dropped item into its new position.

**Terms used in this lesson:**

- **Event delegation** — attaching one listener to a shared ancestor
  and using the event's own target plus ancestor-walking to identify
  which specific descendant was involved. It matters here because this
  lesson's three new listeners are all attached once, to the shared
  list container, rather than once per item.
- **`closest`** — an instance method on any `Element` that walks
  upward through its own ancestors, including itself, testing each one
  against a CSS selector. It matters here as the tool every one of this
  lesson's three new listeners uses to get from wherever a drag event
  actually fired to the specific `.todo-item` it concerns.
- **`draggable`** — a real, standard HTML attribute controlling
  whether an element can be picked up and dragged by the user at all.
  Some elements (images, links) are draggable by default; most,
  including a plain `<li>`, are not, and must have `draggable="true"`
  written explicitly for the browser to allow a drag to begin on them
  in the first place.
- **`dragstart`** — a real, standard event that fires once, on the
  exact element a drag gesture begins on, the instant the user starts
  dragging it.
- **`dragover`** — a real, standard event that fires repeatedly,
  continuously, on whatever element the dragged item is currently being
  moved over, for as long as the drag gesture continues over it. It
  exists to let a potential drop target continuously indicate whether
  it's currently willing to accept a drop.
- **`drop`** — a real, standard event that fires once, on the element
  the user actually releases the drag over — but, as this lesson
  proves, only under one specific condition involving `dragover`,
  covered in full in this lesson's second Concept Unit.

**Objects and methods used:**

- **`DataTransfer`** (accessed via `event.dataTransfer`)
  - *What it is:* a real, built-in object, automatically attached to
    every drag-related event, used to carry data between the element a
    drag started on and whatever element it's eventually dropped onto.
  - *Implementation:* `event.dataTransfer` is a `DataTransfer` instance
    exposing `setData(format, data)` and `getData(format)` — both take
    a MIME-type-like format string (`"text/plain"`, among others); data
    passed to `setData` is always stored, and always retrieved, as a
    plain string, regardless of what type was originally passed in.
    `DataTransfer` also exposes `effectAllowed`, a plain string property
    (`"move"`, `"copy"`, and others) hinting to the browser what kind of
    visual cursor feedback to show during the drag.
  - *Its use:* this lesson's tool for identifying, later, in the `drop`
    listener, which specific item was actually being dragged — since
    the `drop` event fires on a completely different element than the
    one `dragstart` fired on, nothing about the drop event itself says
    which item started the gesture without this object carrying that
    information across.
  - *Type:* a real, built-in object, one instance shared automatically
    across every event belonging to the same single drag gesture.
  - *Responsibility:* to carry string-keyed data from wherever a drag
    begins to wherever it ends — nothing about the elements involved
    directly; only the data explicitly stored in it via `setData`.
  - *Depends on:* an active drag gesture already in progress; outside
    of a drag-related event, `dataTransfer` doesn't exist.
  - *Connects to:* written to inside this lesson's own `dragstart`
    listener; read from inside this lesson's own `drop` listener —
    the same object, passed along automatically by the browser for the
    entire gesture, connecting two listeners that never call each
    other directly.
  - *Shape:* a public, standard Web-platform API surface, specifically
    designed to work not just within one page, but across different
    windows, and even different applications entirely — which is
    exactly why it only ever carries plain, serializable string data,
    never a live JavaScript object or DOM reference; a real drop target
    might be a completely different program on the user's computer,
    with no access to this page's own in-memory objects at all.
    **A methodological note for this lesson:** the real DOM environment
    this curriculum's own verification has used since Lesson 7 does not
    implement `DragEvent` or `DataTransfer` at all — the same
    documented gap already noted for `ClipboardEvent` in the previous
    lesson. This lesson's own drag-and-drop proofs, below, are run for
    real, but against plain `Event` objects with a hand-built
    `dataTransfer`-shaped object attached to each one, backed by a real,
    working `setData`/`getData` implementation storing values in a
    plain object — standing in for what a real browser provides
    automatically, the same substitution technique already used and
    disclosed for the Clipboard API.

---

## Concept Unit: `draggable` and `dragstart` — Identifying What's Being Dragged

### The Problem

None of the to-do list's own `<li>` elements can currently be dragged
at all — most ordinary elements, unlike an image or a link, aren't
draggable by default. And even once dragging is enabled, the moment a
user actually drops an item somewhere else in the list, the code
handling that drop needs to know *which* item was being dragged in the
first place — information that has to somehow travel from wherever the
drag began to wherever it ends.

> **Try this before reading on:** if a drag gesture could genuinely end
> on a target outside this page entirely — a different browser window,
> or even a different application — would a plain JavaScript variable,
> holding a direct reference to the dragged element, be able to survive
> that trip at all? Given that limitation, what kind of information
> *could* survive being handed to something that might not even be
> running the same JavaScript — and what would a tool built specifically
> to carry that information need to guarantee about the data passed
> into it?

### Isolated Example

This lesson's isolated examples use the same real, standards-compliant
DOM implementation as earlier lessons — with the exception noted in
this lesson's own header, above, for `DragEvent` and `DataTransfer`
specifically.

```js
function makeFakeDataTransfer() {
  const store = {};
  return {
    setData: function (type, value) { store[type] = String(value); },
    getData: function (type) { return store[type] || ""; }
  };
}

const dt = makeFakeDataTransfer();
dt.setData("text/plain", 42);
console.log("getData result:", dt.getData("text/plain"));
console.log("typeof getData result:", typeof dt.getData("text/plain"));
console.log("getData for a format never set:", JSON.stringify(dt.getData("text/html")));
```

Run for real, not predicted — whether data survives a round trip
through `setData`/`getData` unchanged in type, or is silently converted
to a string along the way, is exactly the kind of behavioral claim the
Verification Rule requires proof for, and it's a documented, real
`DataTransfer` behavior this stand-in deliberately reproduces.

**Real output:**
```
getData result: 42
typeof getData result: string
getData for a format never set: ""
```

`42`, a real JavaScript number, was passed to `setData` — and
`getData` returns it back as `"42"`, a string, not a number; `typeof`
confirms this directly. This matches `DataTransfer`'s own real,
documented behavior: it only ever stores and returns plain strings,
regardless of what's originally passed in — proof that this API was
never meant to carry arbitrary JavaScript values, only serializable
text. Requesting a format that was never set returns an empty string,
not `null` and not an error — a real, documented edge case worth
knowing before relying on it.

This throwaway example is now discarded — this specific `dt` never
appears in the project again, though `makeFakeDataTransfer` itself is
reused, unmodified, throughout the rest of this lesson's own
verification.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`. `createTodoElement` gains
  a `draggable` attribute and a unique identifier on every item it
  builds; a new, delegated `dragstart` listener is added on the shared
  list container.
- **Change type:** add.
- **Location:** inside `createTodoElement`, on the `<li>` itself; a new
  listener block appended near Lesson 8's existing delegated click
  listener.
- **Dependencies:** `createTodoElement` and the shared `list`
  container, both already established.

### The New Code

```js
let nextItemId = 1;

function createTodoElement(text) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.setAttribute("draggable", "true");
  li.setAttribute("data-item-id", String(nextItemId));
  nextItemId += 1;

  // ...existing label, delete button, and listener setup from earlier lessons...

  return li;
}

list.addEventListener("dragstart", function (event) {
  const item = event.target.closest(".todo-item");
  if (item === null) {
    return;
  }
  event.dataTransfer.setData("text/plain", item.getAttribute("data-item-id"));
  event.dataTransfer.effectAllowed = "move";
});
```

### The Updated Project

`todo.js`'s `createTodoElement`, showing only its new lines in their
real position (every line from earlier lessons — the label, its three
listeners, and the delete button — is unchanged and omitted here only
for space; nothing about it is elided in the real file):
```
 1  let nextItemId = 1;                                      // ← new
 2
 3  function createTodoElement(text) {
 4    const li = document.createElement("li");
 5    li.className = "todo-item";
 6    li.setAttribute("draggable", "true");                    // ← new
 7    li.setAttribute("data-item-id", String(nextItemId));       // ← new
 8    nextItemId += 1;                                            // ← new
 9
10    const label = document.createElement("span");
11    label.className = "label";
12    label.contentEditable = "true";
13    label.textContent = text;
14    li.appendChild(label);
15
16    label.addEventListener("input", function () { notifyChanged("edit", label); });
17    label.addEventListener("blur", function () { label.textContent = label.textContent.trim(); });
18    label.addEventListener("paste", function (event) {
19      event.preventDefault();
20      const text2 = event.clipboardData.getData("text/plain");
21      document.execCommand("insertText", false, text2);
22    });
23
24    const deleteBtn = document.createElement("button");
25    deleteBtn.className = "delete-btn";
26    deleteBtn.textContent = "\u00d7";
27    li.appendChild(deleteBtn);
28
29    return li;
30  }
```

New listener, appended after Lesson 8's existing delegated click
handler:
```
1  list.addEventListener("dragstart", function (event) {   // ← new
2    const item = event.target.closest(".todo-item");        // ← new
3    if (item === null) {                                      // ← new
4      return;                                                   // ← new
5    }                                                             // ← new
6    event.dataTransfer.setData("text/plain", item.getAttribute("data-item-id"));  // ← new
7    event.dataTransfer.effectAllowed = "move";                     // ← new
8  });                                                                // ← new
```

Every to-do item is now draggable, and carries its own permanent,
unique `data-item-id` attribute — assigned once, when it's created,
whether by `seedTodos` or by this project's own duplicate feature. A
new delegated listener on `list` fires the instant any item's drag
begins, recording that item's own id onto the drag gesture's shared
`dataTransfer` object.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`let nextItemId = 1` (line 1).** An ordinary variable declaration,
  using `let` rather than `const` specifically because this value is
  deliberately reassigned on every call to `createTodoElement` — a
  simple, module-level counter, guaranteeing every item this project
  ever creates receives a genuinely unique id.
- **`li.setAttribute("draggable", "true")` (line 6).**
  `Element.prototype.setAttribute`, from Lesson 12, writing the
  **`draggable`** attribute (defined in full in Terms, above) directly
  onto every new item — without this line, none of this lesson's
  remaining code would ever run at all, since the browser refuses to
  even begin a drag gesture on an element that isn't marked draggable.
- **`li.setAttribute("data-item-id", String(nextItemId))` (line 7).**
  The same `setAttribute` method, writing a custom, project-defined
  attribute — `data-item-id` is not a standard HTML attribute the way
  `draggable` is; the `data-` prefix is itself a real, standard
  convention specifically reserved for attributes an application
  invents for its own purposes. `String(nextItemId)` converts the
  counter's own numeric value to a string explicitly, since
  `setAttribute` always stores a string regardless.
- **`nextItemId += 1` (line 8).** An ordinary compound-assignment
  operator, already familiar from earlier lessons, incrementing the
  shared counter so the *next* call to `createTodoElement` receives a
  different id.
- **`list.addEventListener("dragstart", function (event) {...})`
  (listener, line 1).** `EventTarget.prototype.addEventListener`, from
  Lesson 8, listening for **`dragstart`** (defined in full in Terms,
  above) on the shared container — the same delegation pattern already
  established for `click`, since `dragstart`, like a click, bubbles
  from wherever it actually begins up through its ancestors.
- **`event.target.closest(".todo-item")` (listener, line 2).**
  `Element.prototype.closest`, from Lesson 7, resolving from wherever
  the drag gesture actually started — which could be the label, the
  delete button, or the `<li>` itself — back to the specific
  `.todo-item` responsible, the identical pattern already used inside
  Lesson 8's own click handler.
- **`event.dataTransfer.setData("text/plain", item.getAttribute
  ("data-item-id"))` (listener, line 6).** `DataTransfer.prototype
  .setData` (full CRC treatment in the header, above), storing the
  dragged item's own unique id — read back with `getAttribute`, from
  Lesson 12 — as plain text, the only kind of value this object can
  actually carry.
- **`event.dataTransfer.effectAllowed = "move"` (listener, line 7).**
  An ordinary property assignment on the same `DataTransfer` object,
  hinting to the browser that this drag represents *moving* the item
  (as opposed to copying it) — a purely cosmetic signal affecting only
  the visual cursor shown during the drag, with no effect on this
  lesson's own reordering logic.

### CS Lens

Carrying only a small, serializable identifier — rather than the
dragged element itself — across a boundary that might not share memory
at all is the same idea as **passing a reference by value, not by
identity**, generalized to a boundary far wider than anything inside a
single running program.

```
Also recognized in: a web API returning a database row's own ID in
a response, rather than trying to serialize and transmit the actual
in-memory database object a server-side program is using internally,
a distributed system passing a job's ID between two separate
services, each of which independently looks up the job's own full
details when it actually needs them, a URL's own query string
carrying a product's ID, rather than the product's entire data,
between one page and the next
```

### SE Lens

The alternative not chosen here is exactly what the previous unit's own
Socratic prompt raised: a plain, module-level JavaScript variable,
set inside `dragstart` and read inside `drop`, holding a direct
reference to the dragged element itself, with no `dataTransfer`
involved at all. For this project specifically — a same-page reorder,
never actually dropped onto a different window or application — that
alternative would, honestly, work correctly; nothing about this
project's own real use case requires `dataTransfer`'s cross-boundary
guarantees. The real reason to prefer it anyway: `dataTransfer` is the
platform's own documented, idiomatic mechanism for this exact API,
recognizable to any other developer reading this code, and it avoids a
subtler risk a shared mutable variable carries — if a second drag
gesture somehow began before the first one's `drop` had finished being
handled (a genuinely unusual, but not impossible, sequence of browser
events), a single shared variable could be overwritten mid-gesture in a
way `dataTransfer`, scoped automatically to one gesture by the browser
itself, simply cannot be.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
const item = createTodoElement("Buy milk");
list.appendChild(item);

const dt = makeFakeDataTransfer();
const dragstartEvent = new Event("dragstart", { bubbles: true });
dragstartEvent.dataTransfer = dt;

item.querySelector(".label").dispatchEvent(dragstartEvent);

console.log("stored id:", dt.getData("text/plain"));
console.log("matches item's own id:", dt.getData("text/plain") === item.getAttribute("data-item-id"));
```

**Real output:**
```
stored id: 1
matches item's own id: true
```

Dispatching a `dragstart`-shaped event directly on the item's nested
label — not the `<li>` itself — still correctly resolved, through
`closest`, to the right item's own id, confirming the delegated
listener works regardless of exactly which descendant a real drag
gesture happens to begin on.

### Connecting to what came before

This unit makes every item draggable and records which one a drag
gesture started on, using `dataTransfer` specifically because it's the
platform's own correct tool for a value that has to survive to wherever
the gesture eventually ends — even though, for this project, that
somewhere else is still the same page. The next unit builds that
"somewhere else": the drop target logic, and the one, easy-to-miss step
that has to happen before a drop can be accepted at all.

---

## Concept Unit: `dragover`, `drop`, and the `preventDefault` Trap

### The Problem

Dragging an item currently records its id, but dropping it anywhere
else in the list does nothing at all — no `drop` listener exists yet,
and, as this unit is about to prove, even adding one naively wouldn't
be enough on its own.

> **Try this before reading on:** browsers refuse to allow most
> elements to accept a drop, by default, the same way most elements
> aren't `draggable` by default either. Given that `dragover` fires
> repeatedly, continuously, the entire time a dragged item hovers over
> a potential target, what do you think a listener on `dragover` would
> need to explicitly do, every single time it fires, to tell the
> browser "yes, dropping here is allowed" — and, given this
> curriculum's own prior use of `preventDefault()` to block a
> browser's default behavior (Lesson 13's own paste handling), what
> would it mean for *this* event's own default behavior to specifically
> be "disallow the drop"?

### Isolated Example

```js
function order() {
  return Array.from(list.children).map(li => li.querySelector(".label").textContent);
}
console.log("initial order:", order());

const thirdLabel = list.children[2].querySelector(".label");
const firstLabel = list.children[0].querySelector(".label");
const dt = makeFakeDataTransfer();

const dragstartEvent = new Event("dragstart", { bubbles: true });
dragstartEvent.dataTransfer = dt;
thirdLabel.dispatchEvent(dragstartEvent);

const dragoverEvent = new Event("dragover", { bubbles: true, cancelable: true });
dragoverEvent.dataTransfer = dt;
firstLabel.dispatchEvent(dragoverEvent);

const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
dropEvent.dataTransfer = dt;
firstLabel.dispatchEvent(dropEvent);

console.log("order after drop:", order());
```

Run against a page with three seeded to-do items. Per this lesson's own
header note, `dragoverEvent` and `dropEvent` are plain `Event` objects
with a hand-built `dataTransfer` attached, standing in for what a real
browser supplies automatically during an actual drag gesture — this
environment's own DOM implementation cannot enforce the real browser
rule that a `drop` event only fires at all if the preceding `dragover`
had its default prevented, so this specific lab dispatches `drop`
directly to verify the *reordering logic itself* is correct; that
platform-level rule connecting the two is documented, standard browser
behavior, covered directly in this unit's own project code and Run It
step instead. Run for real — whether the reordering logic itself
correctly moves the right item to the right position is exactly the
kind of claim the Verification Rule requires proof for.

**Real output:**
```
initial order: [ 'Buy milk', 'Walk dog', 'Read book' ]
order after drop: [ 'Read book', 'Buy milk', 'Walk dog' ]
```

The third item, `"Read book"`, correctly moved to the very front of the
list — dropped onto the first item, `"Buy milk"`, it was inserted
directly before it, exactly matching a real drag-and-drop reorder
gesture.

This throwaway example is now discarded — but the exact `dragover`/
`drop` handler logic exercised here is what the project's own code
gains next, unchanged.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`.
- **Change type:** add.
- **Location:** appended after the previous Concept Unit's `dragstart`
  listener.
- **Dependencies:** the `dragstart` listener and `data-item-id`
  attributes from the previous Concept Unit in this lesson.

### The New Code

```js
list.addEventListener("dragover", function (event) {
  event.preventDefault();
});

list.addEventListener("drop", function (event) {
  event.preventDefault();
  const draggedId = event.dataTransfer.getData("text/plain");
  const draggedItem = list.querySelector('[data-item-id="' + draggedId + '"]');
  const targetItem = event.target.closest(".todo-item");
  if (draggedItem === null || targetItem === null || draggedItem === targetItem) {
    return;
  }
  targetItem.insertAdjacentElement("beforebegin", draggedItem);
  notifyChanged("reorder", draggedItem);
});
```

### The Updated Project

`todo.js` (new lines only; the `dragstart` listener from the previous
Concept Unit is unchanged, directly above this):
```
 9  list.addEventListener("dragover", function (event) {   // ← new
10    event.preventDefault();                                // ← new
11  });                                                        // ← new
12
13  list.addEventListener("drop", function (event) {            // ← new
14    event.preventDefault();                                     // ← new
15    const draggedId = event.dataTransfer.getData("text/plain");   // ← new
16    const draggedItem = list.querySelector('[data-item-id="' + draggedId + '"]');  // ← new
17    const targetItem = event.target.closest(".todo-item");           // ← new
18    if (draggedItem === null || targetItem === null || draggedItem === targetItem) {  // ← new
19      return;                                                          // ← new
20    }                                                                    // ← new
21    targetItem.insertAdjacentElement("beforebegin", draggedItem);         // ← new
22    notifyChanged("reorder", draggedItem);                                 // ← new
23  });                                                                       // ← new
```

The to-do list now genuinely supports drag-to-reorder: a `dragover`
listener unconditionally allows a drop anywhere over the list, and a
`drop` listener looks up whichever item was originally recorded via
`dataTransfer`, finds whichever item was actually dropped onto, and
physically relocates the dragged item to sit directly before it —
announcing the change through Lesson 10's own event system, exactly
like every other change this project makes.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`list.addEventListener("dragover", function (event) { event
  .preventDefault(); })` (lines 9–11).** `addEventListener`, from
  Lesson 8, listening for **`dragover`** (defined in full in Terms,
  above); `event.preventDefault()`, a real, standard method already
  used in Lesson 13, called unconditionally, every single time this
  event fires — which, per `dragover`'s own nature, is continuously,
  for as long as the drag hovers over the list at all. This is the
  exact step this unit's own Problem identified: without it, the
  browser's own default behavior — refusing the drop — remains in
  effect, and the `drop` listener below would never run at all, no
  matter how correct its own code is.
- **`list.addEventListener("drop", function (event) {...})` (lines
  13–23).** `addEventListener` again, for **`drop`** (defined in full
  in Terms, above).
- **`event.preventDefault()` (line 14, inside `drop`).** The same
  method, called a second time — here to block a *different* default
  behavior: many browsers, left unchecked, would otherwise try to
  navigate to or open whatever was dropped (treating dropped text as a
  URL to visit, in some cases), which is never this project's own
  intent.
- **`event.dataTransfer.getData("text/plain")` (line 15).**
  `DataTransfer.prototype.getData` (full CRC treatment in the header,
  above), reading back exactly the id string the `dragstart` listener
  stored — the same shared `dataTransfer` object, passed along by the
  browser for this entire gesture.
- **`list.querySelector('[data-item-id="' + draggedId + '"]')` (line
  16).** `document.querySelector`'s own instance-method form, from
  Lesson 7 — here using an **attribute selector**, real CSS syntax
  matching an element by one of its actual attribute values, built as
  a string using ordinary string concatenation, the same operator
  already familiar from earlier lessons.
- **`event.target.closest(".todo-item")` (line 17).** `closest`, from
  Lesson 7, resolving from wherever the drop actually landed back to
  the specific item it was dropped onto — the same pattern used inside
  the `dragstart` listener, applied here to the *target*, not the
  *dragged*, item.
- **`if (draggedItem === null || targetItem === null || draggedItem
  === targetItem) { return; }` (lines 18–20).** An ordinary `if`
  statement with three conditions joined by `||` (logical OR, already
  familiar from your existing background) — guarding against three
  real, distinct failure cases: the dragged item's id somehow not
  matching any real item, the drop somehow not landing on any item at
  all, and, critically, a user dropping an item directly onto itself,
  which would otherwise attempt a meaningless, no-op reorder.
- **`targetItem.insertAdjacentElement("beforebegin", draggedItem)`
  (line 21).** `Element.prototype.insertAdjacentElement`, from Lesson
  9, moving `draggedItem` to sit immediately before `targetItem` — the
  exact same method, and the exact same `"beforebegin"` position, both
  already fully explained there; no new behavior here, only a new
  application of it.
- **`notifyChanged("reorder", draggedItem)` (line 22).** The same
  helper function from Lesson 10, reused unchanged — a fourth distinct
  action string, `"reorder"`, joining `"seed"`, `"duplicate"`,
  `"delete"`, and `"edit"` from earlier lessons.

### CS Lens

The `dragover`/`drop` relationship is a real, standard example of a
**capability negotiation protocol** — a potential recipient (the drop
target) has to actively signal willingness before an action (the drop)
is permitted to complete at all, rather than the action being allowed
unconditionally by default.

```
Also recognized in: TCP's own three-way handshake, where a
connection isn't considered open until both sides have explicitly
acknowledged each other, an HTTP CORS preflight request, where a
server has to explicitly permit a cross-origin request before the
browser allows the real request to proceed, a job application
process requiring an explicit acceptance from the employer before an
applicant is actually hired, rather than a job being granted by
default unless explicitly refused
```

### SE Lens

The alternative not chosen here — allowing every element to accept a
drop by default, with no explicit opt-in required — is, in effect, the
web platform's own actual original design for *most* interactions
(a click, for instance, needs no special "yes, I accept clicks"
signal). The real reason drag-and-drop is different, worth stating
honestly: a page has no way to know, generically, whether dropping
arbitrary content onto a given element makes any sense at all — dropping
a to-do item onto, say, an unrelated navigation menu elsewhere on the
page would be nonsensical, and requiring every potential target to
explicitly opt in, via `dragover`'s own `preventDefault()`, prevents an
entire class of "why did dropping here do something weird" bugs a
default-permissive design would invite. The real cost, proven directly
by this unit's own Problem: that opt-in is easy to forget entirely,
with no error, no warning, and no visible symptom beyond "nothing
happens when I drop" — a single missing line produces a silent failure
that looks, to someone debugging it, exactly like the `drop` listener
itself must be broken, when the actual, real cause is a completely
different, unrelated listener never granting permission in the first
place.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
const dt = makeFakeDataTransfer();

const dragstartEvent = new Event("dragstart", { bubbles: true });
dragstartEvent.dataTransfer = dt;
list.children[2].querySelector(".label").dispatchEvent(dragstartEvent);

const dragoverEvent = new Event("dragover", { bubbles: true, cancelable: true });
dragoverEvent.dataTransfer = dt;
let defaultWasPrevented = false;
list.addEventListener("dragover", () => { defaultWasPrevented = dragoverEvent.defaultPrevented; });
list.children[0].querySelector(".label").dispatchEvent(dragoverEvent);
console.log("dragover's default was prevented:", defaultWasPrevented);

const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
dropEvent.dataTransfer = dt;
list.children[0].querySelector(".label").dispatchEvent(dropEvent);

console.log("final order:", order());
```

**Real output:**
```
dragover's default was prevented: true
final order: [ 'Read book', 'Buy milk', 'Walk dog' ]
```

The first line directly confirms the exact mechanism this unit's whole
Problem was about: the `dragover` listener's `preventDefault()` call
really did flip `defaultPrevented` to `true` on the shared event
object, the documented signal a real browser checks before allowing a
`drop` to proceed at all. The second line confirms the reorder itself
completed correctly, identically to this unit's own isolated lab.

### Connecting to what came before

This unit adds the one step the previous unit's `dragstart` listener
alone couldn't provide — explicit permission for a drop to happen at
all — and, once granted, uses Lesson 9's own `insertAdjacentElement` to
perform the actual reorder, completing the full gesture this lesson
opened with.

---

## Connect the Pieces

One drag gesture, followed start to finish: a user picks up the third
to-do item, `"Read book"`, and drops it onto the first, `"Buy milk"`.
`dragstart` fires on the label inside `"Read book"`'s own `<li>`;
`closest` resolves it to that `<li>`; `event.dataTransfer.setData
("text/plain", "3")` (assuming this was the third item created)
records its id onto the gesture's shared `DataTransfer` object — the
one piece of state that survives the entire journey from here to
wherever the drop eventually lands. As the drag moves across the page,
`dragover` fires repeatedly on whatever it's currently hovering over;
each time, `event.preventDefault()` runs, keeping the drop permitted
for as long as the gesture continues. The user releases over
`"Buy milk"`'s own label; `drop` fires there; `event.dataTransfer
.getData("text/plain")` reads back `"3"`, the exact id `dragstart`
stored; `list.querySelector('[data-item-id="3"]')` finds the real
`"Read book"` element by that id — not by any reference carried
directly from `dragstart`, only by looking it up fresh, by id, exactly
as `dataTransfer`'s own string-only nature requires;
`event.target.closest(".todo-item")` resolves the drop's own location
to `"Buy milk"`'s `<li>`; and `insertAdjacentElement("beforebegin",
...)` moves `"Read book"` to sit directly in front of it — the same
technique Lesson 9 built for a duplicate feature, reused here, unchanged,
for genuine reordering instead.

## What's Next

Lesson 15 rebuilds this exact reorder feature a second time, using
Pointer Events instead of the native Drag and Drop API — and proves,
directly, why the native API this lesson just built is genuinely poor
on touch devices, the real reason a second, different technique is
worth learning for the identical feature.
