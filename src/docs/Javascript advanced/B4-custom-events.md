# Lesson 10: Custom Events — `CustomEvent`, `dispatchEvent`, and `detail`

**What you will build:** a real application-level event, `todo:changed`,
fired every time the to-do list's own seed, duplicate, or delete
functions actually change it — and a completely separate piece of code,
listening for that event, that keeps a visible item-count display
accurate without ever being called directly by any of those three
functions. The transferable problem this lesson is actually about:
every feature this curriculum has built so far — the delegated click
handler, the duplicate and delete branches inside it — has code that
*causes* a change directly calling whatever code *reacts* to it, wired
together by a direct function call. This lesson builds the first
alternative: code that announces what happened, and lets anything that
cares listen for it, with neither side needing to know the other
exists.

**What you need to know first:** Lesson 8 — `EventTarget.prototype
.addEventListener`, `event.target`, and event bubbling; this lesson's
own custom events are dispatched and received using exactly the same
method and the same bubbling mechanism already proven there, applied to
events this project defines itself rather than events the browser
generates. Lesson 9 — `seedTodos`, and the delegated handler's existing
duplicate and delete branches, which this lesson modifies directly.

**Terms used in this lesson:**

- **Event** — a real object the browser (or, as this lesson proves,
  application code itself) creates, describing something that
  happened, and delivers to any listener registered for that specific
  kind of event. It matters here because this lesson's own custom
  events are genuinely real `Event` objects, delivered through the
  identical mechanism as a click — the only real difference is who
  created them and what they're named.
- **Event bubbling** — the default way most events are delivered:
  starting at the event's own target, the same event is also delivered
  to that target's parent, then that parent's parent, and so on upward.
  It matters here because this lesson's own custom events, dispatched
  with bubbling enabled, are received the same way a click is — a
  listener doesn't need to sit on the exact element that dispatched the
  event.
- **`closest`** — an instance method on any `Element` that walks
  upward through its own ancestors, including itself, testing each one
  against a CSS selector, returning the first match or `null`. It
  matters here only because it's reused, unchanged, inside this
  lesson's own modified duplicate and delete branches — this lesson
  doesn't change how items are found, only what happens once they are.
- **Decoupling** — the software engineering goal of reducing how much
  one piece of code needs to know about another piece of code in order
  to work correctly together. Two pieces of code are *coupled* when one
  calls the other directly by name — `seedTodos` calling
  `updateItemCount()` directly, say, would mean `seedTodos` has to know
  that function exists, under that exact name, and has to be edited
  every time a *second* thing also needs to react to seeding. Code is
  *decoupled* when the piece causing a change doesn't call the reacting
  code directly at all — it only announces that something happened, and
  anything that cares can listen for that announcement independently.
  It exists because tightly coupled code becomes harder to change safely
  as a project grows — a change to `seedTodos` risks breaking anything
  it calls directly, whether or not that risk is obvious from reading
  `seedTodos`'s own code.
- **Publish–subscribe (pub/sub)** — the specific pattern this lesson
  builds: one piece of code "publishes" an announcement that something
  happened, without knowing or caring who, if anyone, is listening;
  separate pieces of code independently "subscribe" to that
  announcement, reacting to it without needing to know or care who
  published it. It exists as the concrete mechanism decoupling is
  usually achieved through in event-driven systems — this lesson's
  `dispatchEvent` call is the "publish" half, and `addEventListener`,
  listening for this lesson's own custom event name, is the "subscribe"
  half.

**Objects and methods used:**

- **`CustomEvent`**
  - *What it is:* a real, built-in class, extending the browser's own
    `Event`, specifically meant for application-defined events that
    need to carry custom data along with them.
  - *Implementation:* `new CustomEvent(type, options)` — a constructor,
    called with `new` exactly like any class from this curriculum's own
    Module A, taking an event-type string (an arbitrary name this
    lesson's project itself chooses, like `"todo:changed"`, not one of
    the browser's own built-in event types like `"click"`) and an
    optional options object; the most relevant option, `detail`, can
    hold any value at all and becomes directly readable later as
    `event.detail`.
  - *Its use:* this lesson's core tool for creating this project's own
    application-level events — a way to represent "the to-do list just
    changed, specifically like *this*" as a real, dispatchable event
    object, the same kind of object a real click already is.
  - *Type:* a real, `new`-able class — an instance method's worth of
    machinery, not a static function or a plain object.
  - *Responsibility:* to construct a complete, real `Event` object of a
    custom, application-chosen type, optionally carrying arbitrary data
    in its `detail` property — nothing about delivering that event to
    anyone; that's `dispatchEvent`'s own separate job, below.
  - *Depends on:* an event-type name string, and, optionally, whatever
    data should travel with the event.
  - *Connects to:* constructed inside this lesson's own `notifyChanged`
    helper function, immediately passed to `dispatchEvent`; its
    `detail` property is read later, independently, inside a
    completely separate listener function.
  - *Shape:* a public, standard Web-platform API — specifically
    designed for exactly this lesson's own use case, application-defined
    events, as opposed to the browser's own built-in ones.
- **`EventTarget.prototype.dispatchEvent`**
  - *What it is:* a real method available on any DOM node — the same
    category of object `addEventListener` is available on — used to
    actually fire an event, triggering every registered listener that
    qualifies to receive it.
  - *Implementation:* `someNode.dispatchEvent(event)` — an instance
    method taking one already-constructed `Event` object (or, as here,
    a `CustomEvent`, since `CustomEvent` extends `Event`) and delivering
    it, synchronously, to every listener registered for that event's
    type on the node it's called on, and, if the event was constructed
    with bubbling enabled, on every ancestor of that node as well.
  - *Its use:* this lesson's tool for actually firing the custom events
    `CustomEvent` only constructs — nothing this lesson's project
    reacts to happens until `dispatchEvent` is actually called.
  - *Type:* an instance method, available on any `EventTarget`
    (`Element`, `document`, and others).
  - *Responsibility:* to deliver one already-built event object to
    every qualifying listener, synchronously — it does not construct
    the event itself, and it does not decide who's listening; it simply
    triggers whichever listeners already happen to be registered at the
    moment it's called.
  - *Depends on:* an already-constructed `Event` (or `CustomEvent`)
    object.
  - *Connects to:* called once inside this lesson's own `notifyChanged`
    helper, on the shared list container — the exact same element
    Lesson 8's delegated click listener is already attached to — so a
    listener for this lesson's own custom event, attached to that same
    element, receives it through the identical mechanism.
  - *Shape:* a public, standard Web-platform API surface — the same
    underlying delivery mechanism behind every real click this
    curriculum has already worked with, here triggered manually by
    application code instead of automatically by the browser.
- **`CustomEvent.prototype.detail`**
  - *What it is:* a real, read-only property on a `CustomEvent`
    instance, holding whatever value was passed as `detail` when the
    event was constructed.
  - *Implementation:* `event.detail` — an instance accessor property,
    returning exactly the value passed into the `detail` option of
    `CustomEvent`'s own constructor, completely unchanged, with no
    restriction on what kind of value it can be — a plain object, in
    this lesson's own case.
  - *Its use:* this lesson's tool for actually passing meaningful,
    structured information along with an announcement, rather than only
    announcing that *some* unspecified change happened.
  - *Type:* an instance accessor property, specific to `CustomEvent`
    (an ordinary browser-generated `Event`, like a click, does not
    carry meaningful custom data through this property the way this
    lesson's own events do).
  - *Responsibility:* to expose exactly the data its own event was
    constructed with — nothing about validating that data's shape, and
    nothing about what any particular listener does with it once read.
  - *Depends on:* an event actually constructed with a `detail` option
    in the first place; reading `.detail` on an event that wasn't given
    one reports `null`.
  - *Connects to:* set once, inside this lesson's own `notifyChanged`
    helper, at the moment a `CustomEvent` is constructed; read later,
    independently, inside this lesson's own separate listener,
    completely disconnected from the code that set it.
  - *Shape:* a public, standard Web-platform API surface.

---

## Concept Unit: Announcing a Change with `CustomEvent` and `dispatchEvent`

### The Problem

Right now, if the to-do list needs a second feature that reacts every
time it changes — an item counter, say — the only way to build it,
using only tools this curriculum has covered so far, would be to call
that counter-updating code directly, by name, from inside `seedTodos`,
and separately from inside the delegated handler's duplicate branch,
and separately again from inside its delete branch — three different
places, all needing to know the counter-updating function exists, under
its exact name, and all needing to be found and edited again if a
*second* reacting feature (a "you have unsaved changes" banner, say)
is ever added on top.

> **Try this before reading on:** Lesson 8 already proved that a real
> click is just an `Event` object, delivered to whatever's listening
> via `addEventListener`. If application code could build its *own*
> `Event`-like object — one it invents the meaning of entirely itself —
> and hand it to the exact same delivery mechanism a real click already
> uses, what would that let separate pieces of code do without calling
> each other directly at all? What two separate steps would that
> require: one step to actually build such an event, and a second,
> different step to actually make it happen — the same two-step split
> you'd expect from Lesson 7's own distinction between building a
> disconnected element with `createElement` and separately attaching it
> to the real page?

### Isolated Example

This lesson's isolated examples use the same real, standards-compliant
DOM implementation as Lessons 7 through 9.

```js
box.addEventListener("widget:ready", function (event) {
  console.log("heard it! type:", event.type);
  console.log("event instanceof CustomEvent:", event instanceof CustomEvent);
});

const ev = new CustomEvent("widget:ready");
box.dispatchEvent(ev);
```

Run against a page with one plain `<div id="box">`, already referenced
by the variable `box`. Run for real, not predicted — whether a
listener registered for an invented, application-chosen event name
actually fires at all, and whether the resulting event object really is
a genuine `CustomEvent` rather than some lesser stand-in, are exactly
the kind of claims the Verification Rule requires proof for.

**Real output:**
```
heard it! type: widget:ready
event instanceof CustomEvent: true
```

The listener fired — for an event type, `"widget:ready"`, that the
browser itself has no built-in meaning for at all; it exists purely
because this code invented it. `event.type` correctly reports the exact
string passed to `CustomEvent`'s own constructor. `event instanceof
CustomEvent` confirms the object the listener received really is a
genuine `CustomEvent` instance — not a plain object shaped similarly,
the genuine class from the header, above.

This throwaway example is now discarded — `box` and `ev` never appear
in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.html` (a new `<p id="item-count">`
  element is added, for the next Concept Unit's own listener to
  eventually update) and `todo.js` (a new `notifyChanged` helper is
  added, and `seedTodos` is modified to call it).
- **Change type:** add.
- **Location:** `todo.html`'s new `<p>` is added directly after the
  existing `<ul id="todo-list">`. `todo.js`'s new `notifyChanged`
  function is added near `createTodoElement` and `seedTodos`;
  `seedTodos` itself gains one new line, at its very end.
- **Dependencies:** `seedTodos` and the shared `list` container, both
  already established in Lesson 9.

### The New Code

```js
function notifyChanged() {
  const event = new CustomEvent("todo:changed");
  list.dispatchEvent(event);
}
```

```js
function seedTodos(names) {
  const fragment = document.createDocumentFragment();
  names.forEach(function (name) {
    fragment.appendChild(createTodoElement(name));
  });
  list.appendChild(fragment);
  notifyChanged();
}
```

### The Updated Project

`todo.html`:
```
1  <ul id="todo-list"></ul>
2  <p id="item-count"></p>       // ← new
3  <script src="todo.js" defer></script>
```

`todo.js` — the new `notifyChanged` helper:
```
1  function notifyChanged() {                       // ← new
2    const event = new CustomEvent("todo:changed");   // ← new
3    list.dispatchEvent(event);                         // ← new
4  }                                                      // ← new
```

`todo.js` — `seedTodos`, with this unit's one new line marked (every
other line is unchanged from Lesson 9):
```
1  function seedTodos(names) {
2    const fragment = document.createDocumentFragment();
3    names.forEach(function (name) {
4      fragment.appendChild(createTodoElement(name));
5    });
6    list.appendChild(fragment);
7    notifyChanged();                                  // ← new
8  }
```

`todo.html` now has an empty `<p id="item-count">`, not yet updated by
anything. `todo.js` gains a small helper, `notifyChanged`, whose entire
job is constructing and dispatching one `todo:changed` event on the
shared list container — and `seedTodos` now calls it once, at the very
end, after actually finishing its own batched write.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`function notifyChanged() { ... }` (helper, lines 1–4).** An
  ordinary function declaration, the same construct used throughout
  this curriculum — deliberately small, with exactly one job.
- **`new CustomEvent("todo:changed")` (line 2).** `CustomEvent` (full
  CRC treatment in the header, above), constructed with an
  application-chosen event-type string — `"todo:changed"` is not a
  browser-recognized event name the way `"click"` is; it means whatever
  this project's own code decides it means, purely by convention.
- **`list.dispatchEvent(event)` (line 3).** `EventTarget.prototype
  .dispatchEvent` (full CRC treatment in the header, above), called on
  `list` — the same shared container variable Lesson 8's own delegated
  click listener is already attached to — actually delivering the
  event synchronously to any listener registered for `"todo:changed"`
  on that element (none exist yet; this unit's own project code doesn't
  add one).
- **`notifyChanged()` (inside `seedTodos`, line 7).** An ordinary
  function call, placed as the very last line of `seedTodos`'s own
  body — deliberately after `list.appendChild(fragment)`, the line that
  actually performs the real change, so the announcement reflects the
  list's true, already-updated state rather than firing before the
  change has actually happened.

### CS Lens

This is the **publish** half of **publish–subscribe** (both defined in
full in Terms, above) — `notifyChanged` publishes an announcement with
no knowledge of, or dependency on, anything that might be listening.

```
Also recognized in: a newsletter publisher that has no idea how many
subscribers exist or what any of them do with each issue, a stock
exchange's own ticker feed, broadcasting price changes without any
awareness of which trading systems are consuming that feed or how,
a smoke detector, which sounds an alarm without knowing or caring
whether anyone is actually in the building to hear it
```

### SE Lens

The alternative not chosen here is direct coupling — `seedTodos` calling
a hypothetical `updateItemCount()` function by name, directly. That
approach's real advantage is traceability: reading `seedTodos`'s own
code tells you exactly what happens as a result of seeding, with no
indirection. Its real cost, named in this unit's own Problem: every new
piece of code that needs to react to seeding requires editing
`seedTodos` itself to add another direct call, and `seedTodos` — a
function whose actual job is building and inserting elements — ends up
also knowing about, and depending on, code that has nothing to do with
that job at all. `notifyChanged`'s real advantage is that `seedTodos`
never needs to change again, no matter how many separate features end
up reacting to a to-do list change — each one simply listens for
`"todo:changed"` independently. The real cost, worth stating honestly:
nothing about reading `seedTodos`'s own code, in isolation, tells you
*what* reacts to `notifyChanged()` being called, or whether anything
does at all — that information only exists by searching the rest of
the codebase for `addEventListener` calls listening for
`"todo:changed"`, a real form of indirection that direct coupling never
has, traded deliberately for the flexibility named above.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
list.addEventListener("todo:changed", function () {
  console.log("todo:changed fired");
});

seedTodos(["Buy milk", "Walk dog"]);
```

**Real output:**
```
todo:changed fired
```

A temporary listener, added purely to prove the event actually fires,
confirms `seedTodos` really does announce its own completion — with no
listener at all yet permanently wired into the project for the next
unit to build on top of.

### Connecting to what came before

This unit builds the "publish" half of this lesson's own pattern —
proven to fire, but with nothing permanent yet listening or reacting to
it. The next unit adds real data to the announcement, and builds the
first genuine, permanent "subscribe" side: a listener that actually
keeps the page's item-count display accurate.

---

## Concept Unit: Carrying Data with `detail`, and a Real Subscriber

### The Problem

`notifyChanged()` currently announces only that *something* changed —
nothing about what kind of change, or which item was involved. A real
item-count display doesn't strictly need that detail (it could just
re-read `list.children.length` itself, every time), but a more
informative feature — a small activity log reading "duplicated 'Walk
dog'," say — would need to know not just that a change happened, but
what specifically happened and to which item. And, separately from
carrying more information, this event has no permanent listener at all
yet — nothing in the actual project reacts to it once the previous
unit's own temporary proof-listener is gone.

> **Try this before reading on:** `CustomEvent`'s own constructor,
> proven in the previous unit, accepts a second, optional argument
> alongside the event-type string. If that argument could carry
> arbitrary data — not just a flag, but a whole object, with whatever
> shape this project's own code decides — what data would actually be
> useful to attach to a `"todo:changed"` event, given that this
> project's own three change-causing places (seeding, duplicating,
> deleting) are all, structurally, different kinds of change? And once
> a permanent listener for `"todo:changed"` exists, does it need to
> live anywhere near `seedTodos`'s own code at all, given everything
> this lesson has already established about decoupling?

### Isolated Example

```js
box.addEventListener("order:placed", function (event) {
  console.log("item:", event.detail.item);
  console.log("qty:", event.detail.qty);
});

const ev = new CustomEvent("order:placed", {
  detail: { item: "Coffee", qty: 2 }
});
box.dispatchEvent(ev);
```

Run for real — whether arbitrary structured data actually survives the
trip from construction to a completely separate listener function is
exactly the kind of claim the Verification Rule requires proof for.

**Real output:**
```
item: Coffee
qty: 2
```

The listener — a function with no direct relationship to the code that
constructed the event, beyond both agreeing on the event's type string
— correctly reads back the exact object passed as `detail`, unchanged.

**A second run, proving a genuinely surprising fact worth knowing before
relying on `detail` elsewhere** — that `detail` isn't unique to
`CustomEvent`; it already exists, with a completely unrelated meaning,
on some of the browser's own built-in events:

```js
box.addEventListener("click", function (event) {
  console.log("plain click event.detail:", event.detail);
});
box.dispatchEvent(new MouseEvent("click"));
```

**Real output:**
```
plain click event.detail: 0
```

An ordinary `MouseEvent`'s own `detail` property already exists — it's
a real, standard property reporting the click count (how many times in
quick succession the same spot was clicked), a completely unrelated
built-in meaning that predates `CustomEvent`'s own reuse of the same
property name for arbitrary application data. This isn't a conflict in
practice — a `"todo:changed"` event and a `"click"` event are never the
same object, so there's no actual collision — but it's worth knowing
that `detail` is a genuinely overloaded name in the DOM's own history,
not a name this project invented.

This throwaway example is now discarded — `box`, `ev`, and this
specific click test never appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`. `notifyChanged` gains
  parameters and a `detail` payload; `seedTodos` and the delegated
  handler's duplicate and delete branches are each updated to pass
  meaningful data through it; a new, permanent listener is added,
  independent of all of them, to keep the item-count display accurate.
- **Change type:** add (parameters on `notifyChanged`, three call-site
  updates, one new listener).
- **Location:** `notifyChanged`'s own definition; the single
  `notifyChanged()` call inside `seedTodos`; the two `notifyChanged()`
  calls this unit adds inside the delegated handler's existing
  duplicate and delete branches from Lesson 9; and a new block appended
  at the end of `todo.js`.
- **Dependencies:** `notifyChanged`, `seedTodos`, and the delegated
  handler, all already established earlier in this lesson and in
  Lesson 9.

### The New Code

```js
function notifyChanged(action, item) {
  const event = new CustomEvent("todo:changed", {
    detail: { action: action, item: item }
  });
  list.dispatchEvent(event);
}
```

```js
list.addEventListener("todo:changed", function (event) {
  const countDisplay = document.getElementById("item-count");
  countDisplay.textContent = list.children.length + " items (" + event.detail.action + ")";
});
```

### The Updated Project

`todo.js` — `notifyChanged`, with this unit's changes marked:
```
1  function notifyChanged(action, item) {                    // ← changed
2    const event = new CustomEvent("todo:changed", {           // ← changed
3      detail: { action: action, item: item }                    // ← new
4    });                                                            // ← new
5    list.dispatchEvent(event);
6  }
```

`todo.js` — the three call sites, each now passing real data (only the
changed lines are shown, in their surrounding, already-established
context; everything else in each function is unchanged from earlier in
this lesson and from Lesson 9):
```
 seedTodos, last line:
 7    notifyChanged("seed", null);                              // ← changed

 delegated handler, delete branch:
 4    item.remove();
 5    notifyChanged("delete", item);                             // ← new
 6    return;

 delegated handler, duplicate branch:
12    const copy = item.cloneNode(true);
13    item.insertAdjacentElement("afterend", copy);
14    notifyChanged("duplicate", copy);                          // ← new
```

`todo.js` — the new, permanent listener, appended at the end of the
file, entirely separate from `seedTodos` and from the delegated click
handler:
```
1  list.addEventListener("todo:changed", function (event) {    // ← new
2    const countDisplay = document.getElementById("item-count"); // ← new
3    countDisplay.textContent = list.children.length + " items (" + event.detail.action + ")";  // ← new
4  });                                                            // ← new
```

`notifyChanged` now accepts an `action` string and the `item` element
involved, and attaches both as `detail` on the event it dispatches.
Every place that already called `notifyChanged()` now passes real,
specific information describing what actually happened. A brand-new
listener, living at the very end of the file with no direct call from
anywhere else, reads that information back out and keeps
`<p id="item-count">` accurate — the first genuinely decoupled feature
this project has, added without a single edit to `seedTodos` or the
delegated handler's own core logic.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`function notifyChanged(action, item) { ... }` (lines 1–6).** The
  same function from the previous unit, now taking two parameters —
  ordinary function parameters, ordinary named local values, no
  different in kind from any function parameter used throughout this
  curriculum.
- **`new CustomEvent("todo:changed", { detail: { action: action, item:
  item } })` (lines 2–4).** The same `CustomEvent` constructor from the
  previous unit, now given a second argument — an options object
  containing a `detail` key, itself holding another plain object
  literal built from the function's own two parameters. `detail`'s
  shape here — `{ action, item }` — is entirely this project's own
  invention; `CustomEvent` places no constraint on it beyond "any
  value."
- **`list.dispatchEvent(event)` (line 5).** Unchanged from the previous
  unit — the identical delivery mechanism, now carrying a genuinely
  informative event instead of an empty one.
- **`notifyChanged("seed", null)` (in `seedTodos`).** An ordinary
  function call, passing `"seed"` as the action and `null` as the item
  — `seedTodos` builds several items at once, not one specific item, so
  there's no single element that makes sense to attach here.
- **`notifyChanged("delete", item)` (in the delegated handler's delete
  branch).** An ordinary function call, passing the specific `item`
  element `closest` already found in that same branch — reusing a
  value the surrounding code already had in hand, rather than looking
  it up a second time.
- **`notifyChanged("duplicate", copy)` (in the delegated handler's
  duplicate branch).** The same pattern, passing `copy` — the newly
  cloned element, not the original — reflecting that the "new" thing
  this specific change produced is the duplicate, not the item it was
  cloned from.
- **`list.addEventListener("todo:changed", function (event) {...})`
  (the new listener block, line 1).** `EventTarget.prototype
  .addEventListener`, from Lesson 8, listening for this lesson's own
  custom event type on the exact same element it's dispatched from —
  legal and correct, since dispatching and listening on the same
  element requires no bubbling at all; this listener would also have
  fired if it were instead attached to `list`'s own parent, since
  `CustomEvent`'s default options include bubbling, but attaching it
  directly to `list` is simplest here since that's the element the
  event is always dispatched from.
- **`document.getElementById("item-count")` (line 2 of the listener).**
  The same query method used throughout this curriculum, reaching the
  `<p>` element `todo.html` gained in the previous unit.
- **`list.children.length + " items (" + event.detail.action + ")"`
  (line 3 of the listener).** `list.children`, from Lesson 7 — a live
  `HTMLCollection`, read fresh at the exact moment this listener runs,
  correctly reflecting the list's real, current size regardless of
  which of the three change-causing functions just ran.
  `event.detail.action` (full CRC treatment in the header, above for
  `detail` itself) reads back the specific string each call site
  passed in, completely independent of which function actually
  dispatched the event this listener is currently handling. String
  concatenation with `+`, already familiar from your existing
  background, assembles the final display text.

### CS Lens

This unit adds the **subscribe** half of **publish–subscribe** —
`list.addEventListener("todo:changed", ...)`, reacting to an
announcement without any direct call from, or reference to, any of the
three functions that produce it.

```
Also recognized in: a newsletter subscriber reading whatever the
publisher sends, with no ability to demand a particular issue and
no dependency on knowing how the newsletter is written or produced,
a trading system subscribed to a stock exchange's price feed,
reacting to whatever ticks arrive without knowing which specific
trade caused each one, a smart home's automation rule ("turn on the
porch light when the front door sensor fires") subscribing to a
sensor event without needing to know anything about how that sensor
actually detects the door opening
```

### SE Lens

The alternative not chosen here is passing the item count, or the
changed item, as a direct argument to a directly-called function — the
same direct-coupling alternative named in the previous unit's own SE
Lens, now extended with a second consideration specific to `detail`:
what shape to give the payload itself. This project chose
`{ action, item }` — a small, deliberately generic shape any future
listener can pattern-match against (`if (event.detail.action ===
"delete")`, say). The real cost of that genericness: nothing enforces
that every future `notifyChanged()` call site actually provides a
sensible `action` string, or that every future listener correctly
handles an `action` value it doesn't recognize — unlike a set of
distinctly-named events (`"todo:seeded"`, `"todo:duplicated"`,
`"todo:deleted"`, each fired separately) would, at the cost of every
listener needing to register for however many separate event names it
actually cares about instead of one. This project's single
`"todo:changed"` event, discriminated by `detail.action`, trades a
small amount of listener-side type safety for a simpler subscription
story — one `addEventListener` call covers every kind of change, at the
cost of that call's own handler needing an internal branch to tell them
apart.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
seedTodos(["Buy milk", "Walk dog"]);
console.log(document.getElementById("item-count").textContent);

const label = list.children[0].querySelector(".label");
label.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log(document.getElementById("item-count").textContent);

const del = list.children[0].querySelector(".delete-btn");
del.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log(document.getElementById("item-count").textContent);
```

**Real output:**
```
2 items (seed)
3 items (duplicate)
2 items (delete)
```

Every one of the three change-causing operations correctly updated the
visible count and correctly reported which kind of change caused it —
and not one line inside `seedTodos`, the duplicate branch, or the
delete branch calls the counting code directly; all three only ever
call `notifyChanged`, unaware that anything is listening for it at all.

### Connecting to what came before

This unit completes the pattern the previous unit only half-built:
`notifyChanged` now carries real, specific information, and a genuine,
permanent listener — living apart from every function that triggers
it — reacts to that information to keep a real feature of the page
accurate, without a single direct call connecting the two sides.

---

## Connect the Pieces

One click, followed through this lesson's own decoupled architecture:
a user clicks the delete button on a to-do item. Lesson 8's delegated
handler, unchanged in how it identifies what was clicked, resolves the
click to that specific `.todo-item` via `event.target.matches
(".delete-btn")` and `closest`, exactly as Lesson 9 already built. It
calls `item.remove()`, detaching the item from the real page — and
then, per this lesson's own addition, calls `notifyChanged("delete",
item)`. Inside `notifyChanged`, a `CustomEvent` is constructed, type
`"todo:changed"`, carrying `{ action: "delete", item }` as its
`detail` — and `list.dispatchEvent(event)` delivers it, synchronously,
to whatever's listening on `list`. The delegated click handler itself
has no idea this listener exists, and the listener has no idea a click,
specifically, caused this — it only ever sees a `"todo:changed"` event
with a `detail.action` of `"delete"`, reads `list.children.length` for
itself, and updates `<p id="item-count">` accordingly. Two pieces of
code, cooperating correctly, with no line in either one naming the
other.

## What's Next

Lesson 11 introduces `MutationObserver` — a way to react to DOM changes
without needing the code that causes them to cooperate at all, not even
to the extent of remembering to call `notifyChanged()`. Where this
lesson's events require every change-causing function to explicitly
opt in to announcing itself, `MutationObserver` watches the DOM
directly and notices changes regardless of what caused them —
including changes made by code, like a third-party library, that was
never written with this project's own event system in mind at all.
