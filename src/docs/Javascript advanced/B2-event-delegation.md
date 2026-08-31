# Lesson 8: Event Delegation

**What you will build:** a click handler for the to-do list that
correctly responds to clicks on any item — including items added to
the page after the handler was written — using exactly one
`addEventListener` call on the list's own container, instead of one
call per item. This lesson first builds and proves the naive,
one-listener-per-item approach broken, using Lesson 7's own static
`NodeList` behavior as the direct cause, then replaces it with a single
delegated listener that uses event bubbling and `closest` to figure out
what was actually clicked.

**What you need to know first:** Lesson 6 — call-site binding, and
arrow functions having no `this` of their own; both matter directly
here, because `addEventListener` itself decides what `this` is inside
a handler, and this lesson proves that decision changes depending on
whether the handler is an ordinary function or an arrow function.
Lesson 7 — `querySelectorAll` producing a static `NodeList`,
`Element.prototype.closest`, and `Element.prototype.matches`; this
lesson's entire fix is built directly on `closest`.

**Terms used in this lesson:**

- **Static collection (snapshot)** — a collection whose contents are
  fixed permanently at the moment it's created, never updated even if
  the page changes afterward. It matters in this lesson because it's
  the concrete, already-proven reason the naive per-item approach this
  lesson opens with cannot possibly work for an item added later — the
  `NodeList` it loops over to attach listeners was already frozen
  before that later item existed.
- **`this` inside a function** — a value bound fresh on every call,
  determined by how the function was actually called, per **call-site
  binding**. It matters in this lesson because `addEventListener` is
  itself a specific, real example of a call site — one this lesson
  proves sets `this` to a particular value, on purpose, as part of its
  own documented contract.
- **Arrow function** — a function with no `this` of its own, reusing
  whatever `this` already existed in its surrounding code at the moment
  it was written, regardless of how it's later called. It matters in
  this lesson because it's the one case where `addEventListener`'s
  usual `this`-setting behavior has no effect at all — proven directly,
  by contrast with an ordinary function handler.
- **`closest`** — an instance method on any `Element` that walks
  upward through that element's own ancestors, including the element
  itself, testing each one against a CSS selector and returning the
  first match, or `null` if none is found. It matters in this lesson as
  the exact tool that turns "something inside the list was clicked"
  into "specifically *this* to-do item was clicked."
- **Event** — a real object the browser creates automatically whenever
  something happens that JavaScript might care about — a click, a key
  press, a page finishing loading — carrying information about what
  happened and where. It exists so code reacting to "the user did
  something" has a single, structured object to inspect, rather than
  needing a separate ad-hoc signal for every different kind of thing
  that could happen.
- **Event target** — the specific element an event actually happened
  on, in the sense of being the most deeply nested element involved —
  for a click on a `<span>` sitting inside an `<li>` sitting inside a
  `<ul>`, the event's target is the `<span>` specifically, not either
  of its ancestors, even if a listener is attached to one of them. It
  exists to answer "what, precisely, did the user actually interact
  with," independent of which element happens to be listening for it.
- **Event bubbling** — the default way a browser delivers most events:
  starting at the event's own target, the same event is then also
  delivered to that target's parent, then that parent's parent, and so
  on, all the way up to the document root — a single click on a deeply
  nested element "bubbles" upward, triggering any listener attached to
  any of its ancestors along the way, not just a listener on the exact
  element clicked. It exists so a listener doesn't have to sit on the
  exact element an event happens on; it can sit anywhere above it in
  the tree and still be notified.
- **Event delegation** — the software engineering pattern of attaching
  one event listener to a shared ancestor element, rather than
  attaching a separate listener to every individual element that might
  need to respond, and relying on event bubbling plus inspection of the
  event's own target to figure out, inside that one listener, which
  specific descendant was actually involved. It exists to solve exactly
  the problem this lesson opens with: a fixed set of per-item listeners
  cannot automatically extend itself to cover elements that don't exist
  yet.

**Objects and methods used:**

- **`EventTarget.prototype.addEventListener`**
  - *What it is:* a real method available on every DOM node (`Element`,
    `document`, and others), used to register a function to be called
    whenever a specified kind of event occurs on that node — or bubbles
    up to it.
  - *Implementation:* `someNode.addEventListener(eventType, handler)` —
    an instance method taking an event-type string (`"click"`, among
    many others) and a function; when a matching event occurs on the
    node itself, or bubbles up to it from a descendant, the browser
    calls `handler`, passing it one argument — a real `Event` object —
    and, critically, calling it with `this` set to the node
    `addEventListener` was called on, exactly the way `.bind` in Lesson
    6 permanently fixed a function's `this` ahead of time, except this
    binding is provided automatically by the browser itself, only when
    the handler is an ordinary function.
  - *Its use:* this lesson's core tool — registered exactly once, on
    the to-do list's own container, rather than once per item.
  - *Type:* an instance method, available on `Element`, `document`, and
    other DOM node types.
  - *Responsibility:* to register a function so it's called whenever a
    matching event reaches the node it was called on — through bubbling
    from a descendant, or directly — passing that function the real
    `Event` object describing what happened; it does not, itself,
    determine or restrict *which* descendant triggered the call, only
    that some qualifying event reached this node.
  - *Depends on:* an event-type string, and a function to call.
  - *Connects to:* called once on the to-do list's container element in
    this lesson's own project code; the function it registers reads
    properties directly off the `Event` object it's automatically
    passed, and calls `closest` on one of them to find the specific
    item involved.
  - *Shape:* a public, standard Web-platform API — the single most
    common way real front-end code reacts to user interaction.
- **`Event.prototype.target`**
  - *What it is:* a real, read-only property on every `Event` object,
    identifying the specific element the event actually happened on.
  - *Implementation:* `event.target` — an instance accessor property,
    returning the most deeply nested `Element` (or other `Node`)
    involved in the event, fixed for the entire lifetime of that one
    event object, regardless of which ancestor's listener happens to be
    running when it's read.
  - *Its use:* this lesson's starting point for figuring out what was
    actually clicked — the element bubbling delivered the click
    *because of*, as opposed to the element the listener merely happens
    to be attached to.
  - *Type:* an instance accessor property on `Event`.
  - *Responsibility:* to report exactly which element the event
    originated from — nothing about which listener is currently
    handling it, and nothing about that listener's own position in the
    tree.
  - *Depends on:* an existing `Event` object, itself supplied
    automatically to a handler by `addEventListener`.
  - *Connects to:* read inside this lesson's own delegated handler,
    immediately passed to `closest` to walk from wherever the click
    actually landed back up to the meaningful `.todo-item` container.
  - *Shape:* a public, standard Web-platform API surface.
- **`Event.prototype.currentTarget`**
  - *What it is:* a real, read-only property on every `Event` object,
    identifying the specific element whose listener is *currently
    running* — as opposed to `target`, which never changes no matter
    which ancestor's listener is executing.
  - *Implementation:* `event.currentTarget` — an instance accessor
    property; during event bubbling, this value changes as the same
    event object is passed to each ancestor's own listener in turn,
    always reporting whichever element's listener is presently
    executing.
  - *Its use:* this lesson's proof that `addEventListener`'s own
    `this`-setting behavior isn't arbitrary — it sets `this` to exactly
    this value, proven directly by comparing the two with `===` inside
    a running handler.
  - *Type:* an instance accessor property on `Event`.
  - *Responsibility:* to report which element's own listener is
    currently executing — distinct from `target`, which reports where
    the event originated, and distinct from any other ancestor the
    event might go on to bubble to afterward.
  - *Depends on:* an existing `Event` object, currently being
    dispatched to some listener.
  - *Connects to:* read and compared, by identity, against both `this`
    and the container element directly, inside this lesson's own
    isolated lab, to prove `addEventListener`'s `this`-binding contract
    directly rather than merely asserting it.
  - *Shape:* a public, standard Web-platform API surface.

---

## Concept Unit: Why One Listener Per Item Breaks

### The Problem

The most direct way to make every to-do item respond to a click would
seem to be: find every `.todo-item`, and attach a listener to each one
individually. Lesson 7 already built the tool for the first half of
that — `document.querySelectorAll(".todo-item")` — and Lesson 7's own
`NodeList` result supports `forEach`, exactly as proven back then. But
Lesson 7's central proof was also that a `NodeList` is a **static
collection** — frozen at the exact moment it's created, never updated
afterward — and this lesson's to-do list is exactly the kind of page
where new items get added after the page first loads.

> **Try this before reading on:** if code loops over a `NodeList`
> captured by `querySelectorAll` and calls `addEventListener` on each
> element it contains, and a brand-new `.todo-item` is added to the
> page a moment later — after that loop has already finished running —
> does anything about that new item cause the same loop, or any part of
> it, to run again automatically? Given Lesson 7's own proof that a
> `NodeList` never grows on its own, what do you expect to happen if
> that new item is clicked?

### Isolated Example

This lesson's isolated examples use the same real, standards-compliant
DOM implementation as Lesson 7 to build and interact with an actual DOM
tree, including dispatching real events against it — the same
underlying Web-platform behavior a browser's own console would show.

```js
const items = document.querySelectorAll(".todo-item");
items.forEach(function (item) {
  item.addEventListener("click", function () {
    console.log("clicked item:", this.textContent.trim());
  });
});

const newItem = document.createElement("li");
newItem.className = "todo-item";
const newLabel = document.createElement("span");
newLabel.className = "label";
newLabel.textContent = "Read book";
newItem.appendChild(newLabel);
list.appendChild(newItem);

console.log("attempting to click the new item...");
newItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log("(nothing above this line means nothing fired)");
```

Run against a page starting with two `.todo-item` elements, a `list`
variable already referencing their shared `<ul>` container. Run for
real, not predicted — whether a genuinely new element, added after the
listener-attaching loop already ran, responds to a click at all is
exactly the kind of environment behavior the Verification Rule requires
proof for.

**Real output:**
```
attempting to click the new item...
(nothing above this line means nothing fired)
```

The click handler never runs for the new item — no `"clicked item:"`
line appears at all. This is the direct, proven consequence of Lesson
7's own static-`NodeList` result: `items` was frozen at two elements
the moment `querySelectorAll` ran; the loop that called
`addEventListener` on each one only ever touched those original two;
the third item, created afterward, was never inside `items` at all and
so never received a listener of its own.

This throwaway example is now discarded — this specific broken
attempt never appears in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`.
- **Change type:** replace (the naive per-item approach is written
  once, here, specifically to be proven broken, then replaced entirely
  in the next Concept Unit — it never becomes part of the project's own
  lasting code).
- **Location:** appended after Lesson 7's existing code; nothing from
  Lesson 7 is removed yet.
- **Dependencies:** the existing `todo-list` container and its
  `.todo-item` children from Lesson 7.

### The New Code

```js
const currentItems = document.querySelectorAll(".todo-item");
currentItems.forEach(function (item) {
  item.addEventListener("click", function () {
    console.log("clicked item:", this.textContent.trim());
  });
});
```

### The Updated Project

`todo.js` (new lines only; Lesson 7's own lines above this are
unchanged):
```
28 const currentItems = document.querySelectorAll(".todo-item");   // ← new
29 currentItems.forEach(function (item) {                           // ← new
30   item.addEventListener("click", function () {                    // ← new
31     console.log("clicked item:", this.textContent.trim());          // ← new
32   });                                                                 // ← new
33 });                                                                    // ← new
```

`todo.js` now attaches a click listener to each `.todo-item` currently
on the page, individually — a real, working piece of code for the
three items already present, and, per this unit's own isolated lab,
silently non-functional for any item added afterward.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`document.querySelectorAll(".todo-item")` (line 28).** The same
  method from Lesson 7, returning the same kind of **static
  collection** already proven frozen at the moment it's called.
- **`currentItems.forEach(function (item) {...})` (line 29).** `forEach`
  on a `NodeList` — proven, in Lesson 7's own second Concept Unit, to
  exist on `NodeList.prototype` specifically (unlike `HTMLCollection`,
  which lacks it) — called with an ordinary function, receiving each
  matched `.todo-item` element in turn as `item`.
- **`item.addEventListener("click", function () {...})` (line 30).**
  `EventTarget.prototype.addEventListener` (full CRC treatment in the
  header, above), called on one specific `item`, registering a new
  ordinary function to run whenever that specific element is clicked —
  and, critically, only that specific, already-existing element; this
  line runs once per element already inside `currentItems`, and never
  again for any element created afterward.
- **`this.textContent.trim()` (line 31).** `this` here resolves per
  `addEventListener`'s own documented contract (explained in full in
  the header's Objects and methods section, above): set to the element
  the listener was attached to. `.trim()` is a real string method,
  removing leading and trailing whitespace — used here because this
  element's own text, read via `textContent`, includes the surrounding
  indentation whitespace from the HTML source itself.

### CS Lens

This is a **fixed, enumerated registration** — a one-time pass over a
known set of items, wiring each one up individually, with nothing
tracking or reacting to the set itself changing afterward.

```
Also recognized in: a printed guest list checked once at the door
of an event, with no mechanism for admitting anyone who arrives
after the list was finalized, a compiled program's fixed jump
table, built once at compile time, unable to route to a function
that didn't exist yet when the table was generated, a phone
directory printed on paper, accurate only as of its printing date
```

### SE Lens

The alternative this unit is building toward — one listener on a shared
container instead of many on individual items — is the entire subject
of the rest of this lesson, so this unit's own SE Lens focuses on
naming the debt this approach carries honestly, since it's easy to miss
in code that otherwise looks correct: this pattern doesn't merely
handle new items poorly, it fails *silently*. Nothing throws an error
when the new item is clicked in this unit's own isolated lab — the
click event fires, bubbles, finds no listener anywhere along its path
that cares about it, and is simply discarded. A codebase relying on
this pattern would need a *second*, separate mechanism — re-running the
same attachment loop every time an item is added — just to keep up,
and that second mechanism is one more place for the same class of bug
to reappear if it's ever forgotten at a second call site that also adds
items.

### Commands Needed

None — open `todo.html` in a browser, as in Lesson 7.

### Run It

```js
console.log("attempting to click the new item...");
newItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log("(nothing above this line means nothing fired)");
```

**Real output:**
```
attempting to click the new item...
(nothing above this line means nothing fired)
```

The identical silent failure as the isolated lab, now confirmed against
this lesson's own real project code.

### Connecting to what came before

This unit turns Lesson 7's own, already-proven static-`NodeList`
behavior from an abstract fact into a concrete bug — a real, silently
broken feature. The next unit removes this code entirely and replaces
it with a single listener that doesn't depend on any fixed, enumerated
list of items at all.

---

## Concept Unit: One Listener, `event.target`, and `closest`

### The Problem

Instead of one listener per item, a single listener on the shared
`<ul id="todo-list">` container could, in principle, notice a click
anywhere inside it — the container itself never changes, only its
contents do, so a listener attached to it once never needs
re-attaching. But a click event delivered to the container's own
listener doesn't, on its own, say *which* item was actually clicked —
it might have landed on a `<span class="label">`, or the `<li>` itself,
or, in principle, directly on the `<ul>` between items. Something has
to translate "a click happened somewhere inside this container" into
"specifically, this to-do item was clicked."

> **Try this before reading on:** if a listener is attached to the
> `<ul>` itself, and a user clicks directly on a `<span class="label">`
> nested two levels inside it, does the `<ul>`'s own listener actually
> get notified at all? (Consider Lesson 7's own tree structure — the
> `<span>` sits inside an `<li>`, which sits inside the `<ul>` — and
> this lesson's own **event bubbling** term, above, before answering.)
> If it does get notified, what tool from Lesson 7 would let that
> listener figure out, starting from wherever the click actually
> landed, which specific `.todo-item` ancestor it belongs to?

### Isolated Example

```js
list.addEventListener("click", function (event) {
  const item = event.target.closest(".todo-item");
  if (item === null) {
    return;
  }
  console.log("clicked item:", item.textContent.trim());
});

document.querySelector(".label").dispatchEvent(new MouseEvent("click", { bubbles: true }));
document.querySelectorAll(".todo-item")[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
list.dispatchEvent(new MouseEvent("click", { bubbles: true }));
```

Run against the same three-item page as before, with `list` already
referencing the shared `<ul>`. Run for real — whether a single listener
on a container actually receives clicks from deeply nested descendants
at all, and what `closest` does when a click lands somewhere with no
matching ancestor, are both behavioral claims the Verification Rule
requires proof for.

**Real output:**
```
clicked item: Buy milk
clicked item: Walk dog
```

Only two lines appear, for three dispatched clicks. The first click,
dispatched directly on a `<span class="label">` nested inside the first
`<li>`, still reached the `<ul>`'s own listener — proof of **event
bubbling** (defined in Terms, above): the click's target was the
`<span>`, but the event itself traveled upward through the `<li>` and
was delivered to the `<ul>`'s listener too. `event.target.closest
(".todo-item")` correctly walked from that `<span>` up to its owning
`<li>`. The second click, dispatched directly on a `<li class="todo-item">`
itself, also resolved correctly — `closest` checks the starting element
itself first, per Lesson 7's own proof, so no walking was even needed
that time. The third click, dispatched directly on the `<ul>` container
itself — not on any item at all — produced no output: `event.target` was
the `<ul>` itself, `closest(".todo-item")` found no match anywhere in
its own ancestor chain (the `<ul>` has no ancestor carrying that class
either), returned `null`, and the `if (item === null) { return; }`
line, an ordinary early return, correctly discarded that click without
attempting to log anything about it.

This throwaway example's specific dispatched clicks are discarded — but
the handler itself is exactly what the project's own script needs next,
unchanged.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`. The previous Concept
  Unit's entire per-item-listener block (lines 28–33) is deleted; it
  was written specifically to demonstrate a failure and was never meant
  to remain part of the project.
- **Change type:** remove (the previous unit's broken code) plus add
  (the delegated listener).
- **Location:** replacing lines 28–33 from the previous Concept Unit.
- **Dependencies:** the existing `todo-list` container (`list`, already
  defined earlier in the file per Lesson 7) and its `.todo-item`
  descendants.

### The New Code

```js
list.addEventListener("click", function (event) {
  const item = event.target.closest(".todo-item");
  if (item === null) {
    return;
  }
  console.log("clicked item:", item.textContent.trim());
});
```

### The Updated Project

`todo.js` (showing the file's tail, replacing the previous unit's
lines 28–33; everything above this point, from Lesson 7, is
unchanged):
```
28  list.addEventListener("click", function (event) {   // ← new
29    const item = event.target.closest(".todo-item");    // ← new
30    if (item === null) {                                 // ← new
31      return;                                              // ← new
32    }                                                        // ← new
33    console.log("clicked item:", item.textContent.trim());    // ← new
34  });                                                           // ← new
```

`todo.js` now attaches exactly one click listener, on the shared
container `list` — the same variable Lesson 7 already defined — with no
loop, no per-item attachment, and no dependency on how many
`.todo-item` elements currently exist on the page.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`list.addEventListener("click", function (event) {...})` (line
  28).** `addEventListener` (full CRC treatment in the header, above),
  called exactly once, directly on the shared container — not inside
  any loop, and not repeated per item. The function passed to it
  automatically receives one argument, `event` — a real `Event`
  object, supplied by the browser itself whenever a click reaches this
  element.
- **`event.target.closest(".todo-item")` (line 29).** `event.target`
  (full CRC treatment in the header, above) reads the specific element
  the click actually originated from — the deepest element involved,
  regardless of which ancestor's listener happens to be running.
  `.closest(".todo-item")`, the same method from Lesson 7, walks
  upward from that exact element, checking it and each ancestor in
  turn, stopping at the first `.todo-item` match. The result — a real
  element, or `null` — is stored in `item`.
- **`if (item === null) { return; }` (lines 30–32).** An ordinary `if`
  statement and identity comparison, both already familiar from your
  existing background, checking for `closest`'s own documented
  no-match signal (Lesson 7's own proof); `return` inside a function
  ends that specific call immediately, the same control-flow construct
  used in any earlier function — here, discarding a click that landed
  somewhere inside the container but not on or inside any actual item.
- **`item.textContent.trim()` (line 33).** The identical property read
  and string method used in the previous unit's now-deleted code,
  applied here to `item` — the element `closest` found, not the raw
  `event.target` that might have been several levels more deeply
  nested.

### CS Lens

This is **event delegation** (defined in full in Terms, above) — the
entire point of this lesson — built directly on **event bubbling**, the
underlying browser mechanism that makes it possible at all: without
bubbling, a listener on the `<ul>` would only ever fire for clicks
landing on the `<ul>` itself, never on anything nested inside it, and
delegation as a pattern simply couldn't exist.

```
Also recognized in: a building's single front-desk reception
handling requests for every office inside, rather than each office
staffing its own separate reception desk, a router in a web
framework matching one incoming request against a list of route
patterns rather than each possible URL having its own dedicated
listening process, a spreadsheet's single "on any cell changed"
recalculation hook, rather than a separate hook wired to every
individual cell
```

### SE Lens

The alternative not chosen here is the previous unit's per-item
attachment, already proven broken for future items. Delegation's real
advantage, proven directly in this lesson's own project code: exactly
one `addEventListener` call, made exactly once, correctly handles every
current and future `.todo-item`, with no second mechanism needed to
keep up as items are added — a `newItem` created and appended after
this listener was attached will be correctly matched by
`event.target.closest(".todo-item")` the moment it's clicked, because
`closest` performs its ancestor check fresh, against the page's real,
current structure, every single time it's called, with no dependency
on any earlier snapshot at all. The real cost: this single listener now
runs its own logic — the `closest` walk and the `null` check — on
*every* click anywhere inside the container, including clicks that
turn out not to be on any item at all (this unit's own third dispatched
click, on the bare `<ul>`), work a per-item listener would never have
to do because it would simply never have been attached to a
non-item element in the first place. For a small to-do list this cost
is negligible; for a container with deeply nested, complex internal
structure and very frequent clicks, the per-click `closest` walk is a
real, measurable cost delegation always pays, in exchange for never
needing to be re-attached.

### Commands Needed

None — open `todo.html` in a browser, as in Lesson 7.

### Run It

```js
document.querySelector(".label").dispatchEvent(new MouseEvent("click", { bubbles: true }));
list.dispatchEvent(new MouseEvent("click", { bubbles: true }));
```

**Real output:**
```
clicked item: Buy milk
```

One line, for two dispatched clicks — the first, on a real nested
label, correctly resolved to its owning item; the second, on the bare
container, correctly produced no output at all, exactly as this unit's
own isolated lab already proved.

### Connecting to what came before

This unit replaces the previous unit's broken, per-item approach
entirely, using exactly the tools Lesson 7 already built — `closest`
walking upward from wherever a click actually lands — combined with one
new mechanism, event bubbling, to make a single listener cover every
item without needing to know in advance how many there are or will be.
The final unit looks more closely at `this` inside this exact listener,
and at what changes if it's written as an arrow function instead.

---

## Concept Unit: `this` Inside a Listener — Ordinary Function vs. Arrow Function

### The Problem

The delegated listener's own function is written as an ordinary
`function`, not an arrow function — a choice made without comment so
far. Lesson 6 already established that an ordinary function's `this`
depends entirely on how it's called, and that an arrow function instead
keeps whatever `this` already existed in its surrounding code. Does it
matter, here, which one is used — does `addEventListener` actually set
`this` to something specific and useful for an ordinary function
handler, and does an arrow function handler genuinely lose that,
exactly the way Lesson 6 would predict?

> **Try this before reading on:** Lesson 6 proved that `.bind` produces
> a function with `this` permanently fixed, decided once, in advance,
> regardless of how that function is later called. Given
> `addEventListener`'s own documented contract (stated in full in the
> header, above) — that it calls an ordinary function handler with
> `this` set to the element the listener was attached to — is that
> meaningfully different from what `.bind` does, or is it the exact
> same idea, just performed automatically by the browser instead of
> written out by hand? And given that an arrow function never uses
> call-site binding for `this` at all, per Lesson 6, what would you
> expect `this` to be inside an arrow function passed directly to
> `addEventListener` — the element the listener is attached to, or
> something else entirely?

### Isolated Example

```js
const app = {
  name: "MyApp",
  setup() {
    list.addEventListener("click", (event) => {
      console.log("arrow this.name:", this.name);
      console.log("arrow this === app:", this === app);
      console.log("arrow this === list:", this === list);
      console.log("event.currentTarget === list:", event.currentTarget === list);
    });
  }
};

app.setup();

document.querySelector(".label").dispatchEvent(new MouseEvent("click", { bubbles: true }));
```

Run for real, not predicted — whether `addEventListener`'s `this`-setting
behavior actually applies to an arrow function handler at all is
exactly the kind of behavioral claim the Verification Rule requires
proof for, not an assumption carried over from the ordinary-function
case already proven in this lesson's second unit.

**Real output:**
```
arrow this.name: MyApp
arrow this === app: true
arrow this === list: false
event.currentTarget === list: true
```

`setup()` is called as `app.setup()` — an ordinary method call, so per
Lesson 6's own call-site binding rule, `this` inside `setup`'s body is
`app`. The arrow function passed to `addEventListener` is written
*inside* `setup`'s body, so, per Lesson 6's own arrow-function rule, it
keeps that exact same `this` permanently — `this.name` reports
`"MyApp"`, and `this === app` is `true`. `this === list` is `false` —
proving directly that `addEventListener`'s usual behavior of setting
`this` to the listening element, already proven for an ordinary
function handler in this lesson's second unit, has no effect at all
here. `event.currentTarget === list`, by contrast, is still `true` —
`currentTarget` is a property of the `Event` object itself, entirely
unrelated to `this`, and it correctly reports the listening element
regardless of which kind of function is handling it.

This throwaway example is now discarded — this specific `app` object
never appears in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none, permanently — this unit does not add or
  keep any new line inside `todo.js`. The delegated listener installed
  in the previous Concept Unit already does everything the project
  needs; this unit only asks a question about a fact that was already
  true about it the moment it was written.
- **Change type:** none (verification only). Per this schema's own
  provision for a unit whose code doesn't modify the tracked project
  file but still depends on code an earlier unit established: shown
  below is the previous unit's *exact* listener, temporarily annotated
  with two extra inspection lines, run once directly against the real
  page to answer this unit's own question — never saved back into
  `todo.js` itself.
- **Location:** not applicable — no permanent file change.
- **Dependencies:** the delegated listener from the previous Concept
  Unit in this lesson.

### The New Code

```js
list.addEventListener("click", function (event) {
  console.log("this === list:", this === list);
  console.log("event.currentTarget === list:", event.currentTarget === list);
  const item = event.target.closest(".todo-item");
  if (item === null) {
    return;
  }
  console.log("clicked item:", item.textContent.trim());
});
```

### The Updated Project

Not applicable in the usual sense — `todo.js` itself is not modified by
this unit. Shown above, instead, is the previous unit's own listener
(lines 28–34, unchanged in every line already present there) with two
temporary `console.log` calls inserted at its very top, run once as a
throwaway inspection, and discarded afterward exactly like this
lesson's other throwaway examples — the difference being that this one
is built directly out of real, already-shipped project code rather
than a freshly-invented isolated scenario.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in this unit's own New
Code — the temporarily-annotated listener — that wasn't already walked
through in the previous unit:

- **`function (event) {...}` as the handler passed to
  `addEventListener` (unchanged from the previous unit).** An ordinary
  function, not an arrow function — the same choice already made in the
  previous unit, deliberately kept unchanged here so this unit's own
  two new lines can test what that choice actually guarantees, rather
  than testing a different piece of code than the one already shipped.
- **`console.log("this === list:", this === list)` (new, temporary,
  first line inside the handler).** `this` here resolves per **call-site
  binding** and `addEventListener`'s own documented contract (full
  treatment in the header, above): because the surrounding function is
  an ordinary `function`, not an arrow function, `addEventListener`
  itself sets `this` to `list` — the exact element the listener was
  attached to — every time it calls this handler. The comparison
  `this === list` is an ordinary identity check, the same operator used
  throughout this curriculum, here directly testing that documented
  contract rather than merely trusting it.
- **`console.log("event.currentTarget === list:", event.currentTarget
  === list)` (new, temporary, second line inside the handler).**
  `Event.prototype.currentTarget` (full CRC treatment in the header,
  above), read off the same `event` object `addEventListener` always
  supplies as its handler's one argument, compared by identity against
  `list` — checking a second, independent path to the same piece of
  information `this` already provides for an ordinary function handler,
  proving the two agree here specifically because the handler is an
  ordinary function; the isolated lab, above, already proved they stop
  agreeing the moment the handler becomes an arrow function instead.
- **Everything below those two lines** — the `closest` call, the
  `null` check, and the final `console.log` — is the exact,
  already-explained code from the previous unit, included here
  unchanged only so this unit's own temporary lines sit inside a real,
  complete, working handler rather than a fragment.

### CS Lens

This is the same **call-site binding** concept from Lesson 6, now
applied to a specific, real call site this curriculum hadn't yet
covered: `addEventListener`'s own internal call to a handler is,
itself, just another call site — and, per its own documented contract,
one that deliberately sets `this` on purpose for an ordinary function,
the same way `.bind` sets it on purpose by hand.

```
Also recognized in: a plugin system that calls each registered
plugin's own hook function with `this` set to some shared context
object, by explicit design, the same contract this lesson's
`addEventListener` follows for its own handlers, a templating
engine that calls each helper function with `this` bound to the
current rendering context, letting helper authors write `this.
someValue` without needing it passed as an explicit argument
```

### SE Lens

The alternative not chosen here, for most delegated listeners including
this lesson's own, is writing the handler as an arrow function instead
of an ordinary one. Using an ordinary function, as this lesson's
delegated handler does, has a real advantage specifically because it's
a DOM listener: `this` becomes a second, free way to reach the
listening element from inside the handler, without needing
`event.currentTarget` at all — genuinely convenient, and a pattern a
lot of real-world DOM code relies on. The real cost, proven directly by
this unit: that convenience only exists for an ordinary function.
Writing the exact same handler as an arrow function — which might seem
like a harmless stylistic preference, especially given how often arrow
functions are reached for by default in modern code — silently loses
access to `this` as a way to reach the listening element, with no error
or warning, replacing it with whatever `this` happened to already be in
the surrounding code, which, in a typical top-level script, is very
often not what the author expected at all. `event.currentTarget`
remains reliable either way — proven, in this unit's own isolated lab,
to report the listening element regardless of which kind of function is
handling the event — which is precisely why it's the more robust choice
whenever a handler's own author isn't certain, or isn't in control of,
what `this` inside an arrow-function handler would actually resolve to.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
document.querySelector(".label").dispatchEvent(new MouseEvent("click", { bubbles: true }));
```

**Real output:**
```
this === list: true
event.currentTarget === list: true
clicked item: Buy milk
```

Both identity checks report `true`, confirming, directly against the
real project's own listener rather than only against the isolated
lab's separate `app` example, that `addEventListener`'s documented
`this`-binding contract genuinely holds here: with the handler written
as an ordinary function, `this` and `event.currentTarget` agree, both
correctly identifying `list` as the element the listener is attached
to. The third line, unchanged from the previous unit's own output,
confirms the rest of the handler still works exactly as before — these
two temporary inspection lines were added on top of working code, not
in place of it.

The two temporary `console.log` lines are now discarded — the version
of this listener that actually remains in `todo.js` is the previous
unit's own, unchanged.

### Connecting to what came before

This unit doesn't change the delegated listener at all — it looks more
closely at one fact about it that was already true the moment it was
written: `addEventListener` calls an ordinary handler with `this` set
to the listening element, on purpose, following the identical
call-site-binding rule Lesson 6 first proved, and that guarantee
disappears the instant the handler becomes an arrow function instead.

---

## Connect the Pieces

One click, traced through delegation end to end: a user clicks directly
on the `<span class="label">` reading "Buy milk," nested inside its own
`<li class="todo-item">`, inside the shared `<ul id="todo-list">`. Per
**event bubbling**, the browser first identifies that `<span>` as the
click's real target, then delivers the same event object first to any
listener on the `<span>` itself (there is none), then to any listener
on the `<li>` (none), then to the `<ul>`'s own listener — the single
one this lesson's second unit installed. Inside that listener,
`event.target` reports the original `<span>`, unchanged by how far the
event has bubbled; `.closest(".todo-item")`, called on that `<span>`,
walks upward — checking the span itself (no match), then its parent
`<li>` (a match) — and returns that `<li>`. Because the listener is
written as an ordinary function, `addEventListener`'s own contract
additionally sets `this`, inside that same call, to the `<ul>` itself —
a second, independent fact available for the taking, entirely separate
from the `closest`-based lookup that actually identifies which item was
clicked. One click, one listener, no loop, and no dependency at all on
how many to-do items existed when the page first loaded.

## What's Next

Lesson 9 turns from reacting to existing elements to creating and
removing them for real: `document.createElement`, `DocumentFragment`
(and the specific DOM-performance problem it exists to solve),
`insertAdjacentElement`, and `cloneNode` — the tools this lesson's own
`addTodo` function has been using in a minimal, one-line-at-a-time way
since Lesson 7, now covered in full.
