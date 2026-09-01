# Lesson 15: Native Drag-and-Drop, Part 2 — Pointer Events Instead

**What you will build:** the identical to-do list reorder feature from
Lesson 14, rebuilt from scratch on the Pointer Events API —
`pointerdown`, `pointerup`, `setPointerCapture`, and
`document.elementFromPoint` — instead of the native HTML5 Drag and Drop
API. This lesson opens by establishing, with current, verified
information rather than received wisdom, exactly why that rebuild is
worth doing at all: native drag-and-drop's real-world touch support is
genuinely inconsistent across major browsers today, in a way Pointer
Events was specifically designed to avoid.

**What you need to know first:** Lesson 8 — event delegation and
`Element.prototype.closest`, reused here exactly as before. Lesson 9 —
`Element.prototype.insertAdjacentElement`, again the actual mechanism
that performs the reorder once a drop target is known. Lesson 14 — the
native Drag and Drop version of this exact feature, which this lesson
directly compares against, function for function.

**Terms used in this lesson:**

- **Event delegation** — attaching one listener to a shared ancestor
  and using the event's own target plus ancestor-walking to identify
  which specific descendant was involved. It matters here exactly as it
  did in Lesson 14: this lesson's own pointer listeners are attached
  once, to the shared list container.
- **`closest`** — an instance method on any `Element` that walks
  upward through its own ancestors, including itself, testing each one
  against a CSS selector. It matters here as the tool used to resolve
  both where a drag begins and where it ends, exactly as in Lesson 14.
- **Pointer Events** — a real, standard family of events
  (`pointerdown`, `pointermove`, `pointerup`, and others) that unify
  mouse, touch, and pen input into one single event model, rather than
  requiring separate code for `mousedown`/`mouseup` and
  `touchstart`/`touchend`. It exists specifically to solve the problem
  this lesson opens with: code written once, against Pointer Events,
  correctly handles a mouse click, a finger tap, or a stylus touch,
  without needing to detect which kind of input device is actually in
  use at all.
- **`pointerType`** — a real, standard property on every pointer event,
  reporting which *kind* of input device produced it — `"mouse"`,
  `"touch"`, or `"pen"` — as a plain string. It exists for the rare
  cases where code genuinely needs to behave differently per input
  type; this lesson's own reorder logic never reads it at all, which is
  itself the point — the same code handles every input type identically
  without needing to.
- **Pointer capture** — a real, standard mechanism that redirects every
  subsequent pointer event for one specific, ongoing gesture — even a
  `pointermove` or `pointerup` that would otherwise fire on whatever
  element the pointer happens to currently be over — to one explicitly
  chosen element instead, for as long as that gesture continues. It
  exists because, once a drag genuinely begins, code almost always
  wants every further update about that same gesture routed
  predictably to the element that owns it, rather than scattered across
  whatever elements the pointer happens to physically pass over along
  the way.

**Objects and methods used:**

- **`PointerEvent`**
  - *What it is:* a real, built-in event class, extending the
    browser's own `MouseEvent`, representing input from a mouse, a
    finger, or a stylus through one unified shape.
  - *Implementation:* fired automatically by the browser as
    `pointerdown`, `pointermove`, `pointerup`, and others; carries every
    property an ordinary mouse event does (`clientX`, `clientY`, and
    the rest), plus `pointerId` (a number uniquely identifying one
    specific, ongoing contact — one specific finger, in a multi-touch
    gesture, or the one mouse) and `pointerType` (defined in Terms,
    above).
  - *Its use:* this lesson's tool for detecting when a drag gesture
    begins and ends, replacing Lesson 14's own `dragstart`/`drop` pair
    with a mechanism that fires identically regardless of input device.
  - *Type:* a real, built-in event class.
  - *Responsibility:* to represent one specific input event, from any
    supported device type, with the same shape regardless of which
    device produced it — nothing about interpreting a whole gesture
    (a drag, a swipe); that remains entirely the responsibility of
    whatever code is listening.
  - *Depends on:* nothing beyond a real input device — this lesson's
    own verification, per the methodological note below, constructs
    these events directly rather than waiting for real hardware.
  - *Connects to:* dispatched by the browser on `pointerdown` and
    `pointerup`; read inside this lesson's own listeners for `pointerId`
    (used with `setPointerCapture`) and `clientX`/`clientY` (used with
    `elementFromPoint`).
  - *Shape:* a public, standard Web-platform API, specifically designed
    to replace separate mouse-specific and touch-specific event
    handling with one shared model.
- **`Element.prototype.setPointerCapture`**
  - *What it is:* a real method on any `Element` that redirects all
    future events for one specific pointer gesture to it, per this
    lesson's own **pointer capture** definition, above.
  - *Implementation:* `someElement.setPointerCapture(pointerId)` — an
    instance method taking the `pointerId` of an active, ongoing
    pointer gesture; after it's called, every subsequent event for that
    same `pointerId` — including a `pointerup` that occurs while the
    pointer is visually over a completely different element — is
    delivered to the capturing element instead.
  - *Its use:* this lesson's tool for guaranteeing the element a drag
    started on keeps receiving that same drag's own events for its
    entire duration, even once the pointer has physically moved well
    away from it.
  - *Type:* an instance method, available on any `Element`.
  - *Responsibility:* to redirect one specific, ongoing pointer
    gesture's future events to the element it's called on — nothing
    about any other, unrelated pointer gesture, and nothing about
    events that aren't part of the same gesture.
  - *Depends on:* an active pointer gesture, identified by its
    `pointerId`, already in progress.
  - *Connects to:* called inside this lesson's own `pointerdown`
    listener, on the item the drag actually started on, immediately
    after that item is identified.
  - *Shape:* a public, standard Web-platform API surface. **A
    methodological note for this lesson, matching Lesson 14's own
    disclosure:** the real DOM environment this curriculum's own
    verification has used since Lesson 7 does implement `PointerEvent`
    itself, but does not implement `setPointerCapture`'s actual
    redirecting behavior, or `document.elementFromPoint` (below) at
    all — both require genuine page layout and geometry this
    environment's DOM implementation doesn't calculate. This lesson's
    own verification, below, uses a disclosed, minimal stand-in for
    each, exactly as earlier lessons stood in for `ClipboardEvent` and
    `DataTransfer`.
- **`document.elementFromPoint`**
  - *What it is:* a real method on `document` that returns whichever
    element is currently rendered at a specific pixel coordinate on the
    page.
  - *Implementation:* `document.elementFromPoint(x, y)` — an instance
    method taking two numbers (coordinates relative to the current
    viewport, the same coordinate space a pointer event's own
    `clientX`/`clientY` use), returning whichever element is visually on
    top at that exact point, or `null` if nothing is there.
  - *Its use:* this lesson's tool for answering the one question
    `setPointerCapture` deliberately makes impossible to answer any
    other way: once a drag has captured the pointer, "what is visually
    underneath the pointer right now" can no longer be read from
    `event.target` at all, since every captured event's target is now
    the capturing element, regardless of where the pointer actually is.
  - *Type:* an instance method on `document`.
  - *Responsibility:* to report exactly one thing — which element is
    currently rendered at one exact point — computed fresh, from the
    page's real, current layout, every time it's called.
  - *Depends on:* two numeric coordinates, and a page that's actually
    been laid out (rendered) — this method cannot function against
    markup that was never actually displayed at all.
  - *Connects to:* called inside this lesson's own `pointerup`
    listener, using that same event's own `clientX`/`clientY`, to find
    out what the pointer was actually released over.
  - *Shape:* a public, standard Web-platform API surface.

---

## Concept Unit: Why Native Drag-and-Drop Needs a Backup Plan

### The Problem

Lesson 14's reorder feature works correctly — in a desktop browser,
with a mouse. Real users increasingly interact with real pages using a
finger on a touchscreen instead, and Lesson 14's own feature has never
actually been tested against that case at all.

> **Try this before reading on:** `dragstart`, the very first event
> Lesson 14's whole feature depends on, is triggered by the browser
> recognizing a specific, mouse-oriented gesture — pressing a button
> down and moving while it's held. A finger touching a screen is a
> genuinely different kind of input, with no "button" involved at all.
> Given that difference, do you expect every browser, on every kind of
> touch device, to have implemented some equivalent way of recognizing
> "the user intends to drag this" from a finger gesture instead — or is
> it at least plausible that different browsers made different, real,
> inconsistent decisions about whether and how to support that at all?

### What's Actually True Today

This is worth checking directly rather than assuming, since browser
support is exactly the kind of fact that changes over time and is easy
to get wrong from memory or outdated received wisdom. As of current,
verified information: Safari on iOS and iPadOS added native support for
touch-triggered drag-and-drop starting with iOS/iPadOS 15 — a real,
meaningful improvement over its own earlier versions, which had none at
all. Chrome and Firefox on Android, however, still do not reliably fire
native drag events from an ordinary finger touch at all — Samsung
Internet, for instance, exposes the same `DragEvent` interface in its
JavaScript engine, but a typical finger-touch session on it still never
fires a drag event; only a connected mouse, a stylus, or a
desktop-mode pointer reliably triggers one. In other words: native
drag-and-drop's own real-world touch support is not simply "supported"
or "unsupported" — it genuinely varies by specific browser and specific
platform, in ways that have changed materially even within the last
several years, and a page relying on it exclusively risks silently
failing to work at all for a meaningful share of real, current mobile
users, with no error and no visible warning — the exact same *shape* of
silent failure Lesson 14's own `preventDefault` trap already
demonstrated, here operating at the level of an entire input device
category instead of one missing method call.

### Project Change

This unit makes no code change of its own — it establishes the real,
verified motivation for the rest of this lesson, which the following
unit acts on directly.

### CS Lens

This is **device abstraction** — the general computing idea of
providing one consistent interface over genuinely different underlying
hardware, so that software written against the interface doesn't need
to know or care which specific hardware is actually in use.

```
Also recognized in: an operating system's own generic printer driver
interface, letting application software send print jobs without
knowing which specific printer model is actually connected, a game
controller API that reports "button A pressed" identically whether
the physical controller is a specific console's gamepad or a generic
USB device, a database driver layer letting application code issue
the same queries regardless of which specific underlying database
engine is actually running
```

### SE Lens

The alternative to building a Pointer-Events version at all would be
accepting Lesson 14's own native-DnD feature as the project's only
reorder mechanism, on the reasoning that it's simpler and already
built. That choice's real cost, stated plainly by this unit's own
verified research: a meaningful, real portion of this project's actual
users — anyone on Android Chrome or Firefox, using a finger, today —
would find the reorder feature simply doesn't work at all, with
nothing on screen to explain why, since nothing about a failed
`dragstart` produces any visible error. Building a second,
input-agnostic implementation costs real, additional code — this
lesson's entire remaining length — in exchange for a feature that
actually works for the users Lesson 14's own version silently excludes.

---

## Concept Unit: Rebuilding Reorder with `pointerdown`, `pointerup`, and `elementFromPoint`

### The Problem

Lesson 14's own reorder logic depends on three distinct native DnD
concepts with no direct Pointer Events equivalent at all: `dataTransfer`
(a value carried automatically between two different event listeners),
`dragover`'s own explicit permission requirement, and the browser's own
built-in tracking of "what element is the drag currently over."
Pointer Events provides none of these automatically — everything
Lesson 14 got from the platform for free, this lesson has to build by
hand instead.

> **Try this before reading on:** without `dataTransfer` carrying a
> value automatically between two separate listener calls, what would
> a `pointerdown` listener need to do instead to remember which item a
> drag started on, given that `pointerup` is a completely separate
> function call, with no shared parameter connecting the two? And
> without a browser-provided `drop` event that already knows what's
> underneath the pointer, once `setPointerCapture` has redirected every
> future event's own `target` to the *original* item rather than
> wherever the pointer physically is — what tool, already introduced in
> this lesson's own header, would let code find out what's actually
> under the pointer at the exact moment it's released?

### Isolated Example

```js
let draggedItem = null;

list.addEventListener("pointerdown", function (event) {
  const item = event.target.closest(".todo-item");
  if (item === null) return;
  draggedItem = item;
  item.setPointerCapture(event.pointerId);
});

list.addEventListener("pointerup", function (event) {
  if (draggedItem === null) return;
  const targetElement = document.elementFromPoint(event.clientX, event.clientY);
  const targetItem = targetElement ? targetElement.closest(".todo-item") : null;
  if (targetItem !== null && targetItem !== draggedItem) {
    targetItem.insertAdjacentElement("beforebegin", draggedItem);
  }
  draggedItem = null;
});
```

Run against a page with three seeded to-do items. Per this lesson's own
header note, `setPointerCapture` is stubbed as a harmless no-op for
this specific environment (the real code above calls it exactly as
shown, unconditionally, the way real production code would), and
`document.elementFromPoint` is temporarily overridden, for one call, to
return a specific, known element — standing in for the real geometry
calculation a browser performs automatically. Run for real — whether
the module-level `draggedItem` variable correctly survives between two
genuinely separate function calls, and whether the reorder itself lands
in the right position, are exactly the kind of claims the Verification
Rule requires proof for.

**Real output:**
```
initial order: [ 'Buy milk', 'Walk dog', 'Read book' ]
draggedItem set: true text: Read book
order after pointerup: [ 'Read book', 'Buy milk', 'Walk dog' ]
draggedItem reset: true
```

The third item was correctly identified and remembered across the gap
between the two separate listener calls — not through any object the
platform carried automatically, the way `dataTransfer` did in Lesson
14, but through an ordinary, shared JavaScript variable, exactly the
alternative Lesson 14's own SE Lens named and set aside for that
lesson's own cross-window use case, here genuinely appropriate since
this feature never needs to leave the page at all. The final reorder
result is identical to Lesson 14's own native-DnD version, confirming
this rebuild achieves the same real behavior through an entirely
different mechanism.

This throwaway example is now discarded — this specific standalone
scenario never appears in the project again, though this exact handler
logic is what the project's own code gains next, unchanged.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`. This does not remove
  Lesson 14's own native-DnD listeners — both implementations coexist,
  deliberately, so they remain directly, permanently comparable; a real
  project shipping this feature would ordinarily choose one, not both,
  a choice this lesson's own SE Lens addresses directly.
- **Change type:** add.
- **Location:** appended after Lesson 14's own `dragstart`/`dragover`/
  `drop` listeners.
- **Dependencies:** the shared `list` container and `notifyChanged`,
  already established.

### The New Code

```js
let draggedItem = null;

list.addEventListener("pointerdown", function (event) {
  const item = event.target.closest(".todo-item");
  if (item === null) {
    return;
  }
  draggedItem = item;
  item.setPointerCapture(event.pointerId);
});

list.addEventListener("pointerup", function (event) {
  if (draggedItem === null) {
    return;
  }
  const targetElement = document.elementFromPoint(event.clientX, event.clientY);
  const targetItem = targetElement ? targetElement.closest(".todo-item") : null;
  if (targetItem !== null && targetItem !== draggedItem) {
    targetItem.insertAdjacentElement("beforebegin", draggedItem);
    notifyChanged("reorder", draggedItem);
  }
  draggedItem = null;
});
```

### The Updated Project

`todo.js` (new lines only; Lesson 14's own three drag listeners remain,
unchanged, directly above this):
```
24  let draggedItem = null;                                          // ← new
25
26  list.addEventListener("pointerdown", function (event) {            // ← new
27    const item = event.target.closest(".todo-item");                  // ← new
28    if (item === null) {                                                // ← new
29      return;                                                            // ← new
30    }                                                                      // ← new
31    draggedItem = item;                                                    // ← new
32    item.setPointerCapture(event.pointerId);                                // ← new
33  });                                                                        // ← new
34
35  list.addEventListener("pointerup", function (event) {                      // ← new
36    if (draggedItem === null) {                                                // ← new
37      return;                                                                    // ← new
38    }                                                                              // ← new
39    const targetElement = document.elementFromPoint(event.clientX, event.clientY);  // ← new
40    const targetItem = targetElement ? targetElement.closest(".todo-item") : null;    // ← new
41    if (targetItem !== null && targetItem !== draggedItem) {                            // ← new
42      targetItem.insertAdjacentElement("beforebegin", draggedItem);                        // ← new
43      notifyChanged("reorder", draggedItem);                                                // ← new
44    }                                                                                          // ← new
45    draggedItem = null;                                                                          // ← new
46  });                                                                                              // ← new
```

`todo.js` now has two complete, independent, working reorder
implementations for the same feature — Lesson 14's native-DnD version,
untouched, and this lesson's own Pointer-Events version, added
alongside it.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`let draggedItem = null` (line 24).** An ordinary, module-level
  variable, using `let` because it's deliberately reassigned — this is
  the direct replacement for Lesson 14's own `dataTransfer` object;
  where that object was scoped automatically, by the browser, to one
  specific drag gesture, this plain variable has no such automatic
  scoping at all — it's this project's own responsibility to reset it
  correctly, which line 45 does.
- **`list.addEventListener("pointerdown", function (event) {...})`
  (lines 26–33).** `EventTarget.prototype.addEventListener`, from
  Lesson 8, listening for `pointerdown` — the Pointer Events equivalent
  of Lesson 14's own `dragstart`, firing the instant a drag gesture
  begins, regardless of whether it began from a mouse, a finger, or a
  pen.
- **`event.target.closest(".todo-item")` (line 27).** `closest`, from
  Lesson 7, resolving from wherever the gesture actually started to the
  specific item responsible — identical in purpose to Lesson 14's own
  use of the same method inside its `dragstart` listener.
- **`draggedItem = item` (line 31).** An ordinary assignment, storing
  the identified item directly in the shared variable — a genuine
  object reference this time, not a serialized string id the way
  Lesson 14's `dataTransfer.setData` required; this works because,
  unlike `dataTransfer`, this variable never needs to leave the current
  page's own JavaScript context at all.
- **`item.setPointerCapture(event.pointerId)` (line 32).**
  `Element.prototype.setPointerCapture` (full CRC treatment in the
  header, above), called on the item the drag started on, with the
  specific `pointerId` identifying exactly this one gesture — the step
  that guarantees this same item keeps receiving this gesture's own
  future events, even after the pointer has physically moved elsewhere.
- **`list.addEventListener("pointerup", function (event) {...})`
  (lines 35–46).** `addEventListener` again, for `pointerup` — the
  Pointer Events equivalent of Lesson 14's own `drop`.
- **`if (draggedItem === null) { return; }` (lines 36–38).** An
  ordinary guard clause, the same construct used throughout this
  curriculum — handling the case where `pointerup` fires with no drag
  actually in progress (a plain click, for instance, also fires both
  `pointerdown` and `pointerup`, and this guard ensures those don't
  accidentally attempt a meaningless reorder).
- **`document.elementFromPoint(event.clientX, event.clientY)` (line
  39).** `document.elementFromPoint` (full CRC treatment in the
  header, above), called with the exact coordinates the pointer was
  released at — this is the step that recovers the information
  `setPointerCapture` deliberately made unavailable through `event
  .target` itself.
- **`targetElement ? targetElement.closest(".todo-item") : null` (line
  40).** The ternary operator, already familiar from your existing
  background, guarding against `elementFromPoint` returning `null` (a
  release outside any rendered content at all) before attempting to
  call `closest` on it, which would otherwise throw.
- **`if (targetItem !== null && targetItem !== draggedItem) {...}`
  (line 41).** The same two-part guard from Lesson 14's own `drop`
  listener — a valid target must exist, and it must not be the same
  item that's being dragged — reused here for an identical reason.
- **`targetItem.insertAdjacentElement("beforebegin", draggedItem)`
  (line 42) and `notifyChanged("reorder", draggedItem)` (line 43).**
  Both lines identical, character for character, to Lesson 14's own
  `drop` listener — the actual reordering mechanism, and the
  announcement of it, are completely unaffected by which input API
  detected the gesture in the first place.
- **`draggedItem = null` (line 45).** An ordinary reassignment,
  resetting the shared variable — the manual equivalent of what
  `dataTransfer`'s own automatic, per-gesture scoping handled for free
  in Lesson 14; forgetting this line would leave a stale reference
  behind, ready to cause a genuinely confusing bug on the very next,
  unrelated `pointerup` anywhere on the page.

### CS Lens

Storing `draggedItem` in an ordinary shared variable, read and written
by two separate functions that never call each other directly, is
**shared mutable state used deliberately, with an explicit reset** —
distinct from Lesson 4's own warnings about uncontrolled shared state,
because here exactly one thing writes it, exactly one thing reads it,
and its entire lifetime is scoped, by convention, to one drag gesture,
ending explicitly at line 45.

```
Also recognized in: a network protocol's own connection-state
variable, tracking whether a multi-step handshake is currently in
progress, reset explicitly once the handshake either completes or
fails, a video game's own "currently selected unit" variable, set
by one input handler and read by a completely different one later,
explicitly cleared the moment a different action deselects it, a
state machine's own "current state" variable in general, which is
exactly what `draggedItem` (either an item, or `null`) actually is
here: a two-state machine, "not dragging" and "dragging this
specific item"
```

### SE Lens

Lesson 14's own SE Lens already named this exact tradeoff in advance:
`dataTransfer`'s real advantage is its automatic, gesture-scoped
lifetime, provided by the platform; a plain shared variable's real cost
is that this project's own code has to guarantee that scoping by hand —
proven, directly, by line 45's explicit reset, a line with no
equivalent anywhere in Lesson 14's own version at all, since
`dataTransfer` never needs to be manually cleared. What this lesson
adds to that earlier tradeoff, now that both versions genuinely exist
side by side: Pointer Events' real, decisive advantage is exactly this
lesson's own opening research — one implementation, working
identically across mouse, touch, and pen, where Lesson 14's version
demonstrably does not. The real, honest cost of *this* lesson's own
version, worth stating plainly: it requires meaningfully more manual
bookkeeping (the shared variable, its explicit reset, the
`elementFromPoint` workaround for `setPointerCapture`'s own side
effect) than Lesson 14's version needed for the exact same visible
behavior — every one of those extra pieces exists specifically to
replace something the native DnD API, when it works at all, provides
automatically.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
const dragged = list.children[2].querySelector(".label");
dragged.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1 }));
console.log("draggedItem is the third item:", draggedItem !== null && draggedItem.textContent.includes("Read book"));

const target = list.children[0].querySelector(".label");
document.elementFromPoint = function () { return target; };

target.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
console.log("final order:", order());
console.log("draggedItem reset after drop:", draggedItem === null);
```

**Real output:**
```
draggedItem is the third item: true
final order: [ 'Read book', 'Buy milk', 'Walk dog' ]
draggedItem reset after drop: true
```

The identical final ordering as Lesson 14's own version, reached
through `pointerdown`/`pointerup` and a shared variable instead of
`dragstart`/`drop` and `dataTransfer` — direct, verified proof that the
two implementations, despite using completely different platform
mechanisms, produce identical, correct results.

### Connecting to what came before

This unit rebuilds Lesson 14's exact feature using Pointer Events,
replacing every piece that lesson's own native DnD API provided
automatically — cross-listener data, drop permission, and knowledge of
what's under the pointer — with explicit, hand-written equivalents,
motivated directly by this lesson's own opening, verified research into
where the original version silently fails.

---

## Connect the Pieces

One gesture, followed through this lesson's own mechanism end to end:
a user's finger touches the third to-do item, `"Read book"`, on an
Android phone running Chrome — precisely the real, current scenario
this lesson's own opening research identified as one where Lesson 14's
native-DnD version would silently fail to even begin. `pointerdown`
fires regardless — Pointer Events, unlike native DnD, doesn't
distinguish input device at all for the purpose of firing its own
events. `event.target.closest(".todo-item")` resolves to the correct
`<li>`; `draggedItem` is set to it directly, no serialization required;
`item.setPointerCapture(event.pointerId)` guarantees every further
event for this exact finger contact — even as it slides across the
screen, physically passing over other items along the way — still
targets this same original item, not whatever it happens to be
hovering over. The finger lifts over the first item, `"Buy milk"`;
`pointerup` fires, targeted, per pointer capture, at the *original*
item rather than wherever the finger actually is — which is exactly
why `document.elementFromPoint(event.clientX, event.clientY)` is
needed at all, reading the real, current coordinates to find out what's
actually underneath. It resolves to `"Buy milk"`'s own label;
`closest` finds its `<li>`; `insertAdjacentElement("beforebegin", ...)`
— the same method, the same position, as Lesson 14's own version —
moves `"Read book"` into place; `notifyChanged("reorder", ...)`
announces it, through the identical event system built all the way
back in Lesson 10. One feature, working on a device Lesson 14's own
version never could.

## What's Next

This closes Module C. The next module turns to jQuery and DataTables —
starting with why jQuery existed at all, what `$(...)` actually is
under the hood, and an honest map of which of its own methods this
curriculum has already rebuilt, natively, from Lesson 7 onward.
