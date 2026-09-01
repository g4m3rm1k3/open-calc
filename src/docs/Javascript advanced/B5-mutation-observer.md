# Lesson 11: `MutationObserver` — Reacting to Changes You Didn't Cause

**What you will build:** a real bug in Lesson 10's own event-based item
counter — proven by having a piece of code stand in for something
outside this project's control (a browser extension, a third-party
library, code in a different file entirely) add a to-do item directly,
completely bypassing `notifyChanged` — and a `MutationObserver`-based
fix that notices the change anyway, because it watches the real DOM
itself rather than waiting to be told about it.

**What you need to know first:** Lesson 9 — `document.createDocumentFragment`
and the live-collection proof that batching writes reduces how many
times the real page is actually touched; this lesson's own batching
behavior, for notifications rather than writes, is a direct parallel.
Lesson 10 — `CustomEvent`, `dispatchEvent`, and the item-count listener
this lesson's first Concept Unit proves broken under a specific,
realistic condition that lesson's own design never accounted for.

**Terms used in this lesson:**

- **Live collection** — a collection whose contents continuously
  reflect the page's actual current state. It matters here because
  this lesson's fix, like Lesson 10's before it, reads `list.children
  .length` fresh, directly off the real page, rather than trying to
  track a running count some other way.
- **Decoupling** — reducing how much one piece of code needs to know
  about another in order to work correctly together. It matters here
  because this lesson pushes decoupling one step further than Lesson
  10 did: Lesson 10's fix still required every change-causing function
  to explicitly cooperate, by calling `notifyChanged`; this lesson's
  fix requires no cooperation from the code causing a change at all.
- **Publish–subscribe (pub/sub)** — one piece of code announcing that
  something happened, with separate code independently reacting to
  that announcement, neither side needing to know about the other. It
  matters here as the direct point of contrast: this lesson's own
  mechanism reacts to changes without anything having to "publish" an
  announcement in the first place.

**Objects and methods used:**

- **`MutationObserver`**
  - *What it is:* a real, built-in class that watches a specific part
    of the DOM and calls a provided function whenever qualifying
    changes happen to it — regardless of what code caused those
    changes.
  - *Implementation:* `new MutationObserver(callback)` — a constructor,
    called with `new`, taking one function; that function is later
    called, automatically, with an array of `MutationRecord` objects,
    each one describing one batch of related changes that occurred
    since the observer last reported.
  - *Its use:* this lesson's core tool — watching the to-do list's own
    container directly, so a change to it is noticed no matter which
    code caused it, including code this project never wrote and has no
    way to modify.
  - *Type:* a real, `new`-able class.
  - *Responsibility:* to detect qualifying DOM changes to whatever it's
    told to watch, and deliver a batched report of them to its own
    callback — nothing about what caused those changes, and nothing
    about what the callback actually does in response.
  - *Depends on:* a callback function to eventually call.
  - *Connects to:* constructed once in this lesson's own project code;
    its `observe` method (below) is what actually tells it what to
    watch; its callback reads `list.children.length` directly, the
    same live-collection technique used throughout this curriculum,
    rather than depending on anything describing what specifically
    changed.
  - *Shape:* a public, standard Web-platform API — specifically
    designed for exactly the situation this lesson opens with: reacting
    to changes from code that can't be relied on to announce itself.
- **`MutationObserver.prototype.observe`**
  - *What it is:* a real instance method on a `MutationObserver` that
    actually starts it watching a specific node, for specific kinds of
    changes.
  - *Implementation:* `observer.observe(target, options)` — an instance
    method taking the node to watch and an options object describing
    which kinds of changes matter; `{ childList: true }`, this lesson's
    own configuration, means "notify me when this node's direct
    children are added or removed" — other options (not used in this
    lesson) can also watch attribute changes or text content changes.
  - *Its use:* this lesson's tool for actually activating a constructed
    observer against the real to-do list container.
  - *Type:* an instance method on `MutationObserver`.
  - *Responsibility:* to begin watching exactly the node and change
    types specified — nothing happens, and the observer's own callback
    is never called, until `observe` has actually been called at least
    once.
  - *Depends on:* an existing node to watch, and at least one option
    set to `true` specifying what kind of change to watch for.
  - *Connects to:* called once in this lesson's own project code,
    directly on `list` — the same shared container every other lesson
    in this module has already worked with.
  - *Shape:* a public, standard Web-platform API surface.
- **`MutationObserver.prototype.disconnect`**
  - *What it is:* a real instance method on a `MutationObserver` that
    permanently stops it from watching anything and from calling its
    callback again.
  - *Implementation:* `observer.disconnect()` — an instance method
    taking no arguments; after it runs, no future change to the
    previously-watched node triggers the callback, though the observer
    object itself still exists and could, in principle, be told to
    `observe` something again later.
  - *Its use:* this lesson's tool for proving, directly, that
    `MutationObserver`'s own watching behavior is a real, ongoing
    subscription that can be turned off — not an automatic, permanent
    fact about the node itself.
  - *Type:* an instance method on `MutationObserver`.
  - *Responsibility:* to stop exactly one observer from continuing to
    watch and report — it has no effect on any other observer that
    might also be watching the same node.
  - *Depends on:* an observer that's currently watching something.
  - *Connects to:* called in this lesson's own isolated lab, directly
    after a first observed change, to prove a second change afterward
    produces no further callback at all.
  - *Shape:* a public, standard Web-platform API surface.

---

## Concept Unit: A Change Lesson 10's Listener Never Sees

### The Problem

Lesson 10's item-count listener works correctly for every change this
project's own code causes — seeding, duplicating, deleting — because
every one of those functions was specifically written to call
`notifyChanged` afterward. But real pages are rarely touched only by
their own first-party code: a browser extension, a piece of debugging
code typed directly into the console, or, later in this curriculum,
a third-party library like jQuery or DataTables, can all add or remove
elements directly, with absolutely no reason to know this project's
own `notifyChanged` function exists, let alone call it.

> **Try this before reading on:** Lesson 10's own item-count listener
> only ever runs because something calls `list.dispatchEvent(...)`
> directly. If a completely separate piece of code — one this project
> never wrote and has no way to edit — calls `list.appendChild(...)`
> directly, with no call to `notifyChanged` anywhere near it, does
> anything about Lesson 10's own listener notice that at all? Given
> everything Lesson 10 already proved about how `dispatchEvent` and
> `addEventListener` work together, is there any way for a listener
> that's only subscribed to `"todo:changed"` events to react to a
> change that never dispatched one?

### Isolated Example

This lesson's isolated examples use the same real, standards-compliant
DOM implementation as every earlier lesson in this module.

```js
list.addEventListener("todo:changed", function (event) {
  countDisplay.textContent = list.children.length + " items (via event: " + event.detail.action + ")";
});

function notifyChanged(action, item) {
  const event = new CustomEvent("todo:changed", { detail: { action, item } });
  list.dispatchEvent(event);
}

function seedTodos(names) {
  const fragment = document.createDocumentFragment();
  names.forEach(n => fragment.appendChild(createTodoElement(n)));
  list.appendChild(fragment);
  notifyChanged("seed", null);
}

seedTodos(["Buy milk", "Walk dog"]);
console.log("after seed:", countDisplay.textContent);

const externalItem = createTodoElement("Externally added item");
list.appendChild(externalItem);

console.log("after external append (event-based display, still stale):", countDisplay.textContent);
console.log("real list.children.length:", list.children.length);
```

Run against a page with an empty `<ul id="todo-list">`, a `<p
id="item-count">`, and `createTodoElement` already defined exactly as
in Lesson 9. Run for real, not predicted — whether the display actually
goes stale, and by how much, is exactly the kind of claim the
Verification Rule requires proof for.

**Real output:**
```
after seed: 2 items (via event: seed)
after external append (event-based display, still stale): 2 items (via event: seed)
real list.children.length: 3
```

The display correctly reports `2` after seeding, because `seedTodos`
correctly calls `notifyChanged`. But after a third item is added
directly — `list.appendChild(externalItem)`, with no call to
`notifyChanged` anywhere near it — the display still reads `2`, while
`list.children.length` itself, read fresh, correctly reports `3`. Lesson
10's own listener never ran at all for this change, because nothing
ever dispatched a `"todo:changed"` event for it — the display isn't
merely delayed, it's permanently wrong until something else happens to
trigger a real event again.

This throwaway example is now discarded — this specific `externalItem`
and its surrounding scenario never appear in the project again, though
the exact staleness it demonstrates is the problem the rest of this
lesson exists to fix.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none. This unit adds no new code to `todo.js` —
  its own project-code proof, shown in this unit's own isolated lab
  above, runs against a faithful reconstruction of the real project's
  existing Lesson 10 code, demonstrating a gap in it rather than adding
  anything new.
- **Change type:** none (demonstration only).
- **Location:** not applicable.
- **Dependencies:** `notifyChanged`, `seedTodos`, and the Lesson 10
  item-count listener, all already established.

### The New Code

Not applicable for this Concept Unit — no permanent code is added.
This unit's own isolated lab, above, doubles as its project-code proof,
run directly against the real project's own existing functions rather
than a disposable, unrelated scenario.

### The Updated Project

Not applicable — `todo.js` is unchanged by this unit.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in this unit's own
isolated-lab code that wasn't already fully explained in Lesson 10:

- **`const externalItem = createTodoElement("Externally added item")`
  and `list.appendChild(externalItem)`.** `createTodoElement`, from
  Lesson 9, builds a complete, disconnected item exactly as it always
  has; `Node.prototype.appendChild`, also from Lesson 9, attaches it
  directly to `list` — this is the entire point of this unit's own
  demonstration: an ordinary, correct-looking two-line change, using
  tools this curriculum already fully explained, that happens not to
  route through `notifyChanged` at all. Nothing about these two lines
  is unusual or incorrect on their own; the bug is entirely in what
  they *don't* do, not in what they do.

### CS Lens

This is the general problem of **observability from outside a
system**: Lesson 10's own event system only reports what it was
explicitly told to report, which means its accuracy depends entirely on
every relevant piece of code cooperating with it — a real limitation of
any pub/sub system, not specific to this project's own design.

```
Also recognized in: a company's official sales dashboard missing a
transaction that was entered directly into the database instead of
through the sales system the dashboard was actually built to
watch, a build system's incremental cache going stale because a
file was edited by a tool that didn't know to notify the file
watcher, a version control system failing to track a change made by
directly editing a file outside of any commit at all
```

### SE Lens

Lesson 10's own SE Lens already named the real cost of its own
decoupled design honestly: `notifyChanged` requires the code causing a
change to explicitly cooperate. This unit's own proof is that cost made
concrete rather than theoretical — cooperation isn't just a design
preference to maintain, it's a hard requirement Lesson 10's system
silently depends on, one that any code outside this project's own
direct control has no way to know about, let alone honor.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

Identical to this unit's own isolated lab, above, since this unit's
proof runs directly against the real project's existing functions
rather than a separately staged scenario.

### Connecting to what came before

This unit turns Lesson 10's own honestly-stated limitation into a
concrete, verified bug — the item count is provably, permanently wrong
after a change that never went through `notifyChanged`. The next unit
builds a fix that doesn't depend on cooperation from the code causing
the change at all.

---

## Concept Unit: Watching the DOM Directly with `MutationObserver`

### The Problem

The previous unit's bug can't be fixed by trying harder to remember to
call `notifyChanged` everywhere — by definition, the whole scenario is
code this project doesn't control and can't edit. What's needed is a
way to notice that the list's children changed by watching the list
itself, directly, rather than waiting for an announcement from whatever
code happened to cause the change.

> **Try this before reading on:** if something could watch a specific
> DOM element directly — not listening for an event any code has to
> remember to fire, but actually noticing when that element's own
> children change, the same way a live `HTMLCollection` notices a
> change in its own `.length` — would it matter, to that something,
> whether the change came from `seedTodos`, from this lesson's own
> `externalItem` scenario, or from code in a completely different file
> this project has never seen? What would such a tool need to be told,
> up front, in order to know what to actually watch?

### Isolated Example

```js
const observer = new MutationObserver(function (mutations) {
  console.log("mutations received:", mutations.length);
  mutations.forEach(function (m) {
    console.log("type:", m.type, "addedNodes:", m.addedNodes.length, "removedNodes:", m.removedNodes.length);
  });
});

observer.observe(box, { childList: true });

const a = document.createElement("li");
const b = document.createElement("li");
const c = document.createElement("li");
box.appendChild(a);
box.appendChild(b);
box.appendChild(c);

console.log("three synchronous appendChild calls just ran");
```

Run against a page with an empty `<ul id="box">`. Run for real, not
predicted — whether the callback fires synchronously, right when each
`appendChild` runs, or is delayed and batched somehow, is exactly the
kind of timing behavior the Verification Rule requires proof for.

**Real output:**
```
three synchronous appendChild calls just ran
mutations received: 3
type: childList addedNodes: 1 removedNodes: 0
type: childList addedNodes: 1 removedNodes: 0
type: childList addedNodes: 1 removedNodes: 0
```

The line confirming all three `appendChild` calls finished prints
*before* the observer's own callback runs at all — proving
`MutationObserver`'s callback is not called synchronously, the instant
a change happens, the way an ordinary function call would be; it's
deferred to run afterward. When it does run, it receives an array of
*three* separate `MutationRecord` objects, one per `appendChild` call —
`MutationObserver` doesn't merge separate insertions into one combined
record. What's actually batched is the callback itself: three real DOM
changes, and only one call to the function that reacts to them, with
all three records handed to that single call together, rather than the
callback being invoked three separate times, once per change.

**A second run, confirming that pattern — one callback invocation per
batch of synchronous changes, however many records that batch contains
— and proving `disconnect` genuinely turns the whole thing off:**

```js
let callbackRuns = 0;
const observer2 = new MutationObserver(function (mutations) {
  callbackRuns += 1;
  console.log("callback run #" + callbackRuns + ", mutations array length:", mutations.length);
});
observer2.observe(box2, { childList: true });

box2.appendChild(document.createElement("li"));
box2.appendChild(document.createElement("li"));

setTimeout(function () {
  console.log("total callback runs after first batch:", callbackRuns);
  observer2.disconnect();
  box2.appendChild(document.createElement("li"));
  setTimeout(function () {
    console.log("total callback runs after disconnect + another append:", callbackRuns);
  }, 0);
}, 0);
```

**Real output:**
```
callback run #1, mutations array length: 2
total callback runs after first batch: 1
total callback runs after disconnect + another append: 1
```

Two synchronous `appendChild` calls produced exactly one callback run,
with an array of two mutation records inside it — direct proof of
batching, precisely mirroring Lesson 9's own `DocumentFragment` proof
that several writes can be represented as one unit, here applied to
*notifications about* writes rather than the writes themselves.
`observer2.disconnect()`, called after that first batch, then
genuinely stops all future reporting — a third `appendChild` afterward
produces no second callback run at all; `callbackRuns` stays at `1`.

This throwaway example is now discarded — `box`, `box2`, and both
observers never appear in the project again, though the exact
`MutationObserver` construction and `observe` call used here is what
the project's own fix performs next.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`. This does not remove
  Lesson 10's own event-based listener — both coexist, deliberately,
  since Lesson 10's system still correctly and immediately reports
  *what kind* of change happened (`detail.action`) for every change
  this project's own code causes, a distinction this lesson's own
  `MutationObserver`-based addition doesn't attempt to reproduce.
- **Change type:** add.
- **Location:** appended near the end of `todo.js`, after Lesson 10's
  own `"todo:changed"` listener.
- **Dependencies:** the shared `list` container and `countDisplay`,
  already established in earlier lessons.

### The New Code

```js
const observer = new MutationObserver(function (mutations) {
  countDisplay.textContent = list.children.length + " items (via observer)";
});

observer.observe(list, { childList: true });
```

### The Updated Project

`todo.js` (new lines only; everything above, including Lesson 10's own
`"todo:changed"` listener, is unchanged):
```
1  const observer = new MutationObserver(function (mutations) {   // ← new
2    countDisplay.textContent = list.children.length + " items (via observer)";  // ← new
3  });                                                               // ← new
4
5  observer.observe(list, { childList: true });                     // ← new
```

`todo.js` now has two independent mechanisms both capable of updating
`countDisplay`: Lesson 10's event-based listener, which fires
immediately and knows exactly what kind of change occurred, but only
for changes this project's own code explicitly announces; and this
lesson's new `MutationObserver`, which fires slightly later and knows
nothing about *why* a change happened, but notices every change to
`list`'s own children regardless of what caused it.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`new MutationObserver(function (mutations) {...})` (lines 1–3).**
  `MutationObserver` (full CRC treatment in the header, above),
  constructed with a callback function; that function's own parameter,
  `mutations`, will later receive an array of `MutationRecord` objects
  — not used by name inside this specific callback's body, since this
  project's own fix doesn't need to know exactly what changed, only
  that *something* did.
- **`list.children.length` (inside the callback, line 2).**
  `Element.prototype.children`, from Lesson 7 — a live `HTMLCollection`,
  read fresh at the moment the callback actually runs, correctly
  reflecting the list's real, current size regardless of what caused
  the most recent change or changes.
- **`observer.observe(list, { childList: true })` (line 5).**
  `MutationObserver.prototype.observe` (full CRC treatment in the
  header, above), called on the constructed observer, telling it to
  watch `list` specifically, for `childList` changes specifically —
  additions or removals of `list`'s own direct children, the exact
  category of change both `seedTodos` and this lesson's own
  bypass-scenario both perform.

### CS Lens

This is **polling versus watching**, resolved in `MutationObserver`'s
own favor for exactly the reason this lesson opened with: rather than
this project's own code having to actively check "did anything change?"
on some schedule (polling), or relying on every possible source of
change to actively announce itself (Lesson 10's own pub/sub), the
platform itself watches the real, underlying data structure and reports
changes as they're detected — the DOM equivalent of a file system's own
change-notification API, rather than a program that repeatedly checks a
file's last-modified timestamp in a loop.

```
Also recognized in: an operating system's own file-system watch API
(inotify, FSEvents), used by tools like a live-reloading dev server
instead of polling a directory's contents on a timer, a database's
own change-data-capture feature, streaming every row modification to
subscribers instead of requiring those subscribers to repeatedly
re-query the table, a version control system's own file-watcher
integration, detecting an external edit to a tracked file without
the editor itself needing to notify it
```

### SE Lens

The alternative not chosen here, for this project's own future changes,
is relying solely on Lesson 10's event system, accepting its proven
gap as a permanent limitation. `MutationObserver`'s real advantage is
exactly what this lesson's first unit proved missing: it requires zero
cooperation from whatever code causes a change, which makes it the
right tool specifically for situations this project can't fully
control — and the curriculum's own next module, introducing jQuery and
a real third-party plugin (DataTables), is exactly such a situation:
neither library was written with this project's own `notifyChanged`
function in mind, and `MutationObserver` will be the one tool in this
curriculum capable of noticing what either of them does to the DOM
without needing either library's cooperation at all. The real cost,
proven directly by this unit's own isolated lab: `MutationObserver`'s
callback is asynchronous and batched, never synchronous — code that
needs to react to a change *immediately*, within the same synchronous
block of code that caused it (exactly what Lesson 10's own
`dispatchEvent` guarantees, since it's synchronous), cannot get that
guarantee from a `MutationObserver` at all; it will always run
afterward, once the current synchronous code has finished, batched
together with any other changes that happened in the same stretch.
Lesson 10's system and this lesson's system aren't strictly redundant —
they answer two different, real questions: "did something specific,
identifiable happen, right now" versus "did anything at all happen,
eventually, regardless of what."

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
seedTodos(["Buy milk", "Walk dog"]);
const externalItem = createTodoElement("Externally added item");
list.appendChild(externalItem);

setTimeout(function () {
  console.log("after seed + external append, observer-based display:", countDisplay.textContent);
}, 0);
```

**Real output:**
```
after seed + external append, observer-based display: 3 items (via observer)
```

Unlike this lesson's own first unit, the observer-based display
correctly reports `3` — including the externally-added item that
Lesson 10's own event-based listener, still present and still running
alongside this one, silently missed. The `setTimeout` wrapping this
check isn't incidental: per this unit's own proof, the observer's
callback needs a moment after the synchronous code finishes before it
actually runs.

### Connecting to what came before

This unit closes the exact gap the first unit proved real — a change
that bypasses `notifyChanged` entirely is still noticed, correctly,
because this lesson's fix watches the real DOM directly rather than
waiting for an announcement. Both mechanisms — Lesson 10's synchronous,
detailed events, and this lesson's asynchronous, detail-free
observation — now run side by side, each covering what the other
cannot.

---

## Connect the Pieces

One item, followed through both of this module's own reporting systems
at once: `externalItem`, built with `createTodoElement` and attached
directly with `list.appendChild(externalItem)` — code indistinguishable,
line for line, from what `seedTodos` itself does internally, deliberately
standing in for a change this project's own code didn't originate.
Lesson 10's event-based listener never runs for this specific line,
because nothing here ever constructs or dispatches a `"todo:changed"`
event — this lesson's own first unit proved that gap directly, with
`countDisplay` staying stuck at its previous, now-incorrect value.
This lesson's `MutationObserver`, watching `list` itself rather than
waiting for an announcement, detects the same `appendChild` call as a
`childList` mutation regardless of what caused it, batches it together
with whatever else happened in the same synchronous stretch of code,
and calls its own callback shortly afterward — which reads
`list.children.length` fresh, the same live-collection technique this
whole module has relied on since Lesson 7, and correctly reports `3`.
One line of code, silently invisible to one system this project already
built, and fully visible to a second system built specifically because
the first one couldn't be made to see it no matter how it was written.

## What's Next

This closes Module B. The next module turns to interactive UI patterns
built directly on top of everything this module established:
collapsible regions, editable fields, and drag-and-drop reordering —
starting with a collapsible region built from a `<button>`, `aria-
expanded`, and the `hidden` attribute.
