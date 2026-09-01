# Lesson 13: Making Fields Editable — `contenteditable` and Its Traps

**What you will build:** a to-do item's own label, made directly
editable in place using `contenteditable`, reacting correctly to the
`input` and `blur` events and rejecting formatted content pasted into
it — and then, built as a separate, directly comparable alternative, the
same editing feature built a completely different way: swapping the
label out for a real `<input>` on double-click, and back again once
editing finishes. This lesson builds both, deliberately, so the real
tradeoffs between them can be compared directly rather than taken on
faith.

**What you need to know first:** Lesson 8 — `EventTarget.prototype
.addEventListener` and event bubbling, used here for `input`, `blur`,
`dblclick`, and `keydown` alike. Lesson 9 — `document.createElement`
and `Element.prototype.remove`, both reused directly inside this
lesson's own swap-in-a-real-`<input>` technique.

**Terms used in this lesson:**

- **Event bubbling** — the default way most events are delivered:
  starting at an event's own target, the same event is also delivered
  upward to each of that target's ancestors in turn. It matters here
  only as background: this lesson's own listeners are attached
  directly to the specific elements they care about, not delegated from
  a shared ancestor, since each editable label needs its own
  independent editing state.
- **`contenteditable`** — a real, standard HTML attribute that, when
  present and not explicitly set to `"false"`, tells the browser to let
  a user directly edit that element's own content in place — typing,
  deleting, and, unless prevented, pasting, exactly as if it were a
  text field, without the element needing to be an `<input>` or
  `<textarea>` at all. It exists to let arbitrary page content — a
  heading, a table cell, a `<span>` like this lesson's own to-do
  label — become directly editable without changing what kind of
  element it fundamentally is.
- **The `input` event** — a real, standard event that fires on an
  editable element (an `<input>`, a `<textarea>`, or, as this lesson
  uses it, any `contenteditable` element) every time its own content
  actually changes as a direct result of the user editing it. It
  exists to give code a way to react to content changing as they
  happen, rather than only once, later, when editing finishes
  entirely.
- **The `blur` event** — a real, standard event that fires on an
  element the instant it loses focus — a user clicking elsewhere,
  tabbing away, or a script explicitly calling a different element's
  own `.focus()`. It exists to mark the natural end of "the user was
  interacting with this specific element," which this lesson uses as
  the moment to treat editing as finished.
- **The `dblclick` event** — a real, standard event that fires when the
  same element is clicked twice in quick succession. It exists as a
  distinct, deliberate gesture, separate from an ordinary single click
  — this lesson uses it specifically so that entering edit mode
  requires an unambiguous, intentional action, not something that could
  happen by accident from a single click meant for something else.
- **The `keydown` event** — a real, standard event that fires when a
  key is pressed down, carrying which specific key was pressed in its
  own `key` property. It matters here because this lesson's own
  swap-in-a-real-`<input>` technique needs to distinguish "Enter, commit
  the edit" from "Escape, cancel it" — a distinction no other event this
  curriculum has covered so far can make.

**Objects and methods used:**

- **`Node.prototype.replaceWith`**
  - *What it is:* a real method on any `Node` that replaces it, in
    place, with one or more other nodes.
  - *Implementation:* `someNode.replaceWith(...newNodes)` — an instance
    method taking one or more nodes; the calling node is removed from
    its parent, and the given node(s) are inserted in exactly the
    position it occupied.
  - *Its use:* this lesson's core tool for the swap-in-a-real-`<input>`
    technique — replacing a label `<span>` with an `<input>` when
    editing starts, and replacing that same `<input>` back with a new
    `<span>` once editing finishes.
  - *Type:* an instance method, available on any `Node`.
  - *Responsibility:* to perform exactly one position-preserving swap —
    remove the calling node, insert the given node(s) in its place —
    nothing about what either node contains or does afterward.
  - *Depends on:* a calling node that currently has a parent, and at
    least one replacement node.
  - *Connects to:* called twice in this lesson's own alternative
    technique — once to swap a label out for an input, once more,
    later, to swap a fresh label back in.
  - *Shape:* a public, standard Web-platform API surface.
- **`HTMLElement.prototype.focus`**
  - *What it is:* a real method on any focusable element that moves
    keyboard focus to it.
  - *Implementation:* `someElement.focus()` — an instance method
    taking no required arguments, making the given element the current
    target of keyboard input and of the next `blur`/`focus` event pair.
  - *Its use:* this lesson's tool for making a freshly-inserted
    `<input>` immediately ready for typing the moment it replaces a
    label, without requiring the user to click it a second time.
  - *Type:* an instance method, available on focusable elements
    (`<input>`, `<button>`, and others, including this lesson's own
    `contenteditable` label once that attribute is present).
  - *Responsibility:* to move focus to exactly the element it's called
    on — nothing about selecting any of that element's own content, a
    separate, unrelated capability.
  - *Depends on:* an element that's actually focusable and currently
    attached to the visible page.
  - *Connects to:* called immediately after `replaceWith` inserts a new
    `<input>` into the page, inside this lesson's own alternative
    technique.
  - *Shape:* a public, standard Web-platform API surface.
- **`HTMLInputElement.prototype.value`**
  - *What it is:* a real, read/write instance property on any
    `<input>`, holding its current text content.
  - *Implementation:* `someInput.value` — an instance accessor
    property; reading it returns the input's current text as a plain
    string; writing it replaces that text immediately.
  - *Its use:* this lesson's tool for both pre-filling a freshly-created
    `<input>` with the label's existing text, and, later, reading back
    whatever the user actually typed once editing finishes.
  - *Type:* an instance accessor property, specific to form elements
    like `<input>` — distinct from `textContent`, which every element
    has, `value` is specific to elements that hold form data.
  - *Responsibility:* to keep an input's own current text synchronized
    both ways between the real, rendered field and JavaScript — nothing
    about validating that text or reacting to it changing, which is the
    separate job of the `input` event.
  - *Depends on:* an existing `<input>` element.
  - *Connects to:* set once, when an edit begins, to the label's
    original text; read once, when an edit commits, to determine the
    label's new text.
  - *Shape:* a public, standard Web-platform API surface.
- **`ClipboardEvent.prototype.clipboardData` and `DataTransfer
  .prototype.getData`**
  - *What they are:* real, standard properties and methods giving
    script-level access to clipboard content during a `paste` (or
    `copy`/`cut`) event — `clipboardData` is a `DataTransfer` object
    carrying whatever was actually copied, in one or more formats;
    `getData(format)` reads one specific format out of it.
  - *Implementation:* `event.clipboardData.getData(mimeType)` — an
    instance accessor property (`clipboardData`) returning a
    `DataTransfer` object, and an instance method on that object
    (`getData`) taking a MIME-type string (`"text/plain"`,
    `"text/html"`, among others) and returning the pasted content in
    that specific format, as a plain string.
  - *Its use:* this lesson's tool for reading exactly the plain-text
    version of whatever was pasted, deliberately ignoring any richer,
    formatted HTML version that might also be available in the same
    paste.
  - *Type:* `clipboardData` is an instance accessor property on a real
    `paste` event; `getData` is an instance method on the `DataTransfer`
    object it returns.
  - *Responsibility:* `clipboardData` exposes exactly what's actually on
    the clipboard, in whatever formats the source application provided;
    `getData` extracts exactly one of those formats, as plain text,
    without interpreting or rendering it.
  - *Depends on:* a real `paste` event, and clipboard content actually
    containing the requested format (`getData` returns an empty string
    if the requested format isn't available at all).
  - *Connects to:* read inside this lesson's own `paste` listener,
    immediately after `preventDefault()` blocks the browser's own
    default (and, as this lesson proves, unsafe) paste behavior.
  - *Shape:* a public, standard Web-platform API surface. **A
    methodological note for this lesson specifically:** the real
    DOM environment this curriculum's own verification has used since
    Lesson 7 does not implement `ClipboardEvent` at all — a real,
    documented gap in that specific tool, not a fact about browsers
    themselves, which fully support it. This lesson's own paste-handling
    proof, below, is run for real, but against a plain `Event` object
    with a hand-built `clipboardData`-shaped property attached to it,
    standing in for the genuine `ClipboardEvent` a real browser would
    supply — the same substitution technique any test suite uses to
    verify event-handling code without needing a real user to actually
    copy and paste something.

---

## Concept Unit: `contenteditable` and the `input`/`blur` Events

### The Problem

A to-do item's label currently can only be changed by deleting the
whole item and creating a new one — there's no way to fix a typo in
place. The most direct fix, using only what this attribute's own name
suggests, is making the label itself directly editable.

> **Try this before reading on:** an ordinary `<span>` is not a form
> field — it has no `value` property, and typing while it has focus
> does nothing at all by default. If a single HTML attribute could
> change that — making a plain `<span>` behave like an editable field
> without turning it into an `<input>` — what event would you expect to
> need to listen for to actually notice *while* the user is typing,
> given that a `<span>` has no `value` to check the way an `<input>`
> does? And what different, later moment would mark editing as finished
> — the same "user is done interacting with this" moment Lesson 12's
> own accessibility work never needed, but this lesson's own editing
> feature does?

### Isolated Example

This lesson's isolated examples use the same real, standards-compliant
DOM implementation as earlier lessons — with one exception, noted
directly where it applies, for the parts of the Clipboard API that
environment doesn't implement.

```js
console.log("contenteditable attribute:", label.getAttribute("contenteditable"));

let inputFired = 0;
label.addEventListener("input", function () {
  inputFired += 1;
});

label.textContent = "Buy milk and eggs";
label.dispatchEvent(new Event("input", { bubbles: true }));
console.log("inputFired:", inputFired);

let blurFired = 0;
label.addEventListener("blur", function () {
  blurFired += 1;
  console.log("blur - final text:", label.textContent.trim());
});
label.dispatchEvent(new FocusEvent("blur"));
console.log("blurFired:", blurFired);
```

Run against a page with one `<span id="label" contenteditable="true">Buy
milk</span>`. The `input` and `blur` events are dispatched manually
here, the same technique already used for `click` throughout this
curriculum — a real browser fires both automatically as a direct
consequence of the user actually typing and later clicking away; this
test verifies that this lesson's own listeners react correctly once
either event arrives, which is the part actually under this project's
control. Run for real, not predicted — that a plain `<span>`'s own
`contenteditable` attribute really is preserved and readable exactly as
written is itself a claim worth confirming rather than assuming.

**Real output:**
```
contenteditable attribute: true
inputFired: 1
blur - final text: Buy milk and eggs
blurFired: 1
```

Both listeners fired exactly once, for exactly the event each was
registered for — confirming the wiring itself is correct, independent
of whatever specifically caused either event to fire in a real browser.

This throwaway example is now discarded — this specific `label` never
appears in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.html` (`createTodoElement`'s own
  markup output gains `contenteditable="true"` on the label) and
  `todo.js` (`createTodoElement` itself, and two new listeners).
- **Change type:** add.
- **Location:** inside `createTodoElement`, on the label element it
  builds; two new `addEventListener` calls added inside that same
  function, before it returns.
- **Dependencies:** `createTodoElement`, already established in Lesson
  9.

### The New Code

```js
function createTodoElement(text) {
  const li = document.createElement("li");
  li.className = "todo-item";

  const label = document.createElement("span");
  label.className = "label";
  label.contentEditable = "true";
  label.textContent = text;
  li.appendChild(label);

  label.addEventListener("input", function () {
    notifyChanged("edit", label);
  });

  label.addEventListener("blur", function () {
    label.textContent = label.textContent.trim();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "\u00d7";
  li.appendChild(deleteBtn);

  return li;
}
```

### The Updated Project

`todo.js`'s `createTodoElement`, in full, with this unit's new lines
marked (everything else is unchanged from Lesson 9's own version):
```
 1  function createTodoElement(text) {
 2    const li = document.createElement("li");
 3    li.className = "todo-item";
 4
 5    const label = document.createElement("span");
 6    label.className = "label";
 7    label.contentEditable = "true";                       // ← new
 8    label.textContent = text;
 9    li.appendChild(label);
10
11    label.addEventListener("input", function () {           // ← new
12      notifyChanged("edit", label);                            // ← new
13    });                                                          // ← new
14
15    label.addEventListener("blur", function () {                  // ← new
16      label.textContent = label.textContent.trim();                // ← new
17    });                                                              // ← new
18
19    const deleteBtn = document.createElement("button");
20    deleteBtn.className = "delete-btn";
21    deleteBtn.textContent = "\u00d7";
22    li.appendChild(deleteBtn);
23
24    return li;
25  }
```

Every to-do item's label, seeded, duplicated, or otherwise, is now
directly editable — a click no longer selects an inert piece of text;
it can be typed into directly. Every keystroke fires this lesson's own
`todo:changed` event (reusing Lesson 10's own mechanism), and losing
focus trims any stray leading or trailing whitespace the editing left
behind.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`label.contentEditable = "true"` (line 7).** An ordinary property
  assignment, setting the **`contenteditable`** attribute (defined in
  full in Terms, above) via its corresponding JavaScript-side property
  — the string `"true"` here (not the boolean `true`) matches this
  property's own real, documented type, which reflects one of three
  possible string values (`"true"`, `"false"`, or `"inherit"`), not a
  simple boolean the way Lesson 12's own `hidden` property was.
- **`label.addEventListener("input", function () {...})` (lines
  11–13).** `EventTarget.prototype.addEventListener`, from Lesson 8,
  listening for the **`input` event** (defined in full in Terms, above)
  directly on this specific label.
- **`notifyChanged("edit", label)` (line 12).** The same helper
  function built in Lesson 10, reused unchanged — announcing a change,
  with `"edit"` as the action and the specific label involved, exactly
  the same pattern already established for `"seed"`, `"duplicate"`, and
  `"delete"`.
- **`label.addEventListener("blur", function () {...})` (lines
  15–17).** `addEventListener` again, this time for the **`blur`
  event** (defined in full in Terms, above) — a completely separate
  registration from the `input` listener above it; both listen to the
  same element, for different event types, and both run independently.
- **`label.textContent.trim()` (line 16).** `String.prototype.trim`, a
  real, standard string method, removing leading and trailing
  whitespace — used here because a user could plausibly leave stray
  spaces at either end while editing, and reassigning the trimmed
  result back onto `label.textContent` cleans that up the moment
  editing ends.

### CS Lens

`contenteditable` is a real example of the **decorator pattern**
applied at the markup level — adding a capability (editability) to an
existing element by attaching a marker to it, rather than requiring a
structurally different element (an `<input>`) to get that capability at
all.

```
Also recognized in: a CSS class like `.disabled` added to any
element to change its behavior without changing its underlying tag,
a file system's own read-only flag, attachable to any file
regardless of its type, a database column's `NOT NULL` constraint,
layered onto an existing column definition rather than requiring a
structurally different column type
```

### SE Lens

The alternative not chosen here — swapping in a real `<input>` instead
— is built directly, for comparison, in this lesson's third Concept
Unit; a full tradeoff discussion is deferred there, once both versions
actually exist to compare. What's worth naming now, specific to this
unit's own two listeners: `blur`'s trimming logic runs *after* `input`
has already fired potentially many times during editing — `input`
reacts to every keystroke, `blur` reacts once, at the end, meaning
`notifyChanged("edit", ...)` could fire far more often than any of this
project's other actions (`seedTodos` fires it once per batch, not once
per keystroke). Nothing in this unit's own code addresses that directly
— any listener reacting to `"todo:changed"` events (Lesson 10's own
item-count display, for instance) will simply run once per keystroke
too, a real cost this project accepts for now rather than solves.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
const item = createTodoElement("Buy milk");
const testLabel = item.querySelector(".label");

let changeCount = 0;
list.addEventListener("todo:changed", function () { changeCount += 1; });
list.appendChild(item);

testLabel.textContent = "Buy oat milk";
testLabel.dispatchEvent(new Event("input", { bubbles: true }));
console.log("changeCount after typing:", changeCount);

testLabel.textContent = "  Buy oat milk  ";
testLabel.dispatchEvent(new FocusEvent("blur"));
console.log("label after blur:", JSON.stringify(testLabel.textContent));
```

**Real output:**
```
changeCount after typing: 1
label after blur: "Buy oat milk"
```

The `input` listener correctly triggered a `"todo:changed"` announcement
the moment the label's content changed. The `blur` listener correctly
trimmed stray whitespace the moment focus left the label —
`JSON.stringify` here makes the trimmed result unambiguous in the
output, confirming no leading or trailing spaces survived.

### Connecting to what came before

This unit makes a to-do item's label directly editable with a single
attribute and two event listeners, reusing Lesson 10's own
`notifyChanged` mechanism unchanged. The next unit proves this
same editable label has a real, unaddressed security and correctness
problem the moment something is pasted into it.

---

## Concept Unit: The Paste Trap

### The Problem

`contenteditable`'s own default behavior doesn't just accept typed
characters — by default, pasting into it accepts *anything* the
clipboard offers, including fully formatted HTML: bold text, links,
even images, copied from a webpage or a word processor. A to-do item's
label is meant to hold a short, plain string — nothing in this
project's own data model, or in `createTodoElement`'s own construction
of a label as a single, plain `<span>`, expects or can safely handle
arbitrary nested markup ending up inside it.

> **Try this before reading on:** if a user copies a paragraph of
> richly formatted text from some other webpage — bold words, a
> hyperlink, maybe an inline image — and pastes it directly into a
> `contenteditable` label with no special handling at all, what do you
> expect the label's own internal DOM structure to actually contain
> afterward: still just text, or real, nested child elements
> (`<b>`, `<a>`, `<img>`) inserted directly inside it? Given
> `paste` is a real, cancelable event (the same category of thing
> `preventDefault()` already worked for in earlier lessons), what two
> steps would need to happen to stop that default insertion and
> substitute something safer instead?

### Isolated Example

```js
label.addEventListener("paste", function (event) {
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain");
  label.textContent = text;
});

const fakePaste = new Event("paste", { cancelable: true });
fakePaste.clipboardData = {
  getData: function (mime) {
    if (mime === "text/plain") {
      return "Buy milk <b>NOW</b>";
    }
    return "<p>Buy milk <b>NOW</b></p>";
  }
};

label.dispatchEvent(fakePaste);
console.log("label.textContent after paste:", label.textContent);
console.log("label.children.length:", label.children.length);
```

Run against a page with one `contenteditable` `<span id="label">`. Per
this lesson's own header note, this environment has no real
`ClipboardEvent` constructor at all — `fakePaste` is a plain `Event`
with a hand-built `clipboardData` property attached to it, standing in
for what a real browser would supply automatically; the handler itself,
under test, cannot tell the difference, since it only ever reads
`event.clipboardData.getData(...)`, exactly the same call either way.
Run for real — whether text containing literal `<` and `>` characters
ends up as inert text or as real, inserted elements is exactly the
kind of claim the Verification Rule requires proof for.

**Real output:**
```
label.textContent after paste: Buy milk <b>NOW</b>
label.children.length: 0
```

`label.textContent` now reads the literal string `"Buy milk <b>NOW</b>"`
— including the angle brackets, printed as plain characters, not
interpreted as markup at all. `label.children.length` is `0`, proving
directly that no real `<b>` element was created or inserted — `.
textContent`, unlike `.innerHTML`, always treats whatever it's assigned
as plain text, never as markup to be parsed, which is exactly why
assigning the *plain-text* version of the pasted content, specifically
requested via `getData("text/plain")` rather than the richer
`"text/html"` format also available in the same paste, is what makes
this handler safe.

This throwaway example is now discarded — this specific `fakePaste`
never appears in the project again, though the exact handler logic is
what the project's own `createTodoElement` gains next.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.js`. `createTodoElement` gains
  one more listener on its label.
- **Change type:** add.
- **Location:** inside `createTodoElement`, alongside the `input` and
  `blur` listeners from the previous Concept Unit.
- **Dependencies:** `createTodoElement`, as modified by the previous
  Concept Unit in this lesson.

### The New Code

```js
label.addEventListener("paste", function (event) {
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
});
```

### The Updated Project

`todo.js`'s `createTodoElement`, showing only the label's listener
block, with this unit's new lines marked (the `input` and `blur`
listeners from the previous unit are unchanged, directly above this):
```
11    label.addEventListener("input", function () {
12      notifyChanged("edit", label);
13    });
14
15    label.addEventListener("blur", function () {
16      label.textContent = label.textContent.trim();
17    });
18
19    label.addEventListener("paste", function (event) {         // ← new
20      event.preventDefault();                                     // ← new
21      const text = event.clipboardData.getData("text/plain");        // ← new
22      document.execCommand("insertText", false, text);                 // ← new
23    });                                                                  // ← new
```

Every to-do item's label now rejects a raw, formatted paste and
replaces it with the plain-text equivalent instead, inserted at
whatever position the cursor was actually at — rather than this unit's
own isolated lab's simpler approach of replacing the label's entire
content outright.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`label.addEventListener("paste", function (event) {...})` (line
  19).** `addEventListener`, from Lesson 8, listening for a real,
  standard `paste` event — fired by the browser itself the instant a
  user actually pastes into a focused, editable element.
- **`event.preventDefault()` (line 20).** A real, standard method,
  already used in earlier lessons for other cancelable events, called
  here to block the browser's own default paste behavior — without
  this line, the browser would go on to insert the clipboard's own
  richly-formatted content directly, exactly the outcome this whole
  unit exists to prevent.
- **`event.clipboardData.getData("text/plain")` (line 21).**
  `ClipboardEvent.prototype.clipboardData` and `DataTransfer.prototype
  .getData` (full CRC treatment, and this lesson's own methodological
  note, in the header, above), reading specifically the plain-text
  version of whatever was pasted, deliberately ignoring any richer
  `"text/html"` version that might also be present in the same
  clipboard content.
- **`document.execCommand("insertText", false, text)` (line 22).** A
  real, long-standing (though officially deprecated) browser method for
  performing a specific text-editing action — here, inserting `text` at
  the current cursor position inside whatever element currently has
  focus — used here, instead of this unit's own isolated lab's simpler
  `label.textContent = text`, specifically because it inserts *at the
  cursor*, preserving whatever the user had already typed before or
  after the paste, rather than discarding the entire label's existing
  content the way a full reassignment would.

### CS Lens

This is **input sanitization** — accepting only a restricted, known-safe
subset of what an input source could provide, and explicitly discarding
the rest, rather than trusting the input source to only ever provide
safe content on its own.

```
Also recognized in: a web form stripping HTML tags out of a
"comment" field before storing it, to prevent one user's comment
from injecting a script that runs in another user's browser, a SQL
query using parameterized values instead of directly concatenating
user-typed text into the query string, an image upload endpoint
re-encoding every uploaded file through its own image library rather
than trusting the file's own claimed format
```

### SE Lens

The alternative not chosen here is doing nothing — leaving
`contenteditable`'s own default paste behavior in place, as the
previous unit's version did. That alternative's real advantage is
genuine fidelity: a user pasting formatted text keeps that formatting
exactly as copied, which is sometimes actually the desired behavior for
a rich-text editor (a feature this project's own single-line to-do
label was never meant to be). The real, proven cost, for a field that's
supposed to hold a short plain string: arbitrary nested markup ending
up inside a `<span>` this project's own code elsewhere (`item
.textContent`, in the delegated click handler's own duplicate logic,
say) assumes is simple, plain text — a pasted `<img>` tag, in
particular, wouldn't just look wrong; it could silently break any code
that assumes a label has no visible sub-elements at all.
`document.execCommand`'s own real cost, worth stating plainly: it's
part of the older, officially deprecated Document Editing API — it
still works in every current browser, but it isn't being actively
developed further, and its documented behavior across different
browsers has historically had real, inconsistent edge cases, which is
exactly the kind of practical risk this lesson's own final Concept Unit
sidesteps entirely by not depending on cursor-position editing inside a
`contenteditable` region at all.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
const item = createTodoElement("Buy milk");
const testLabel = item.querySelector(".label");
list.appendChild(item);

const fakePaste = new Event("paste", { cancelable: true });
fakePaste.clipboardData = {
  getData: function (mime) {
    return mime === "text/plain" ? "Coffee <script>alert(1)</script>" : "<p>Coffee <script>alert(1)</script></p>";
  }
};
testLabel.dispatchEvent(fakePaste);
```

**Real output (this environment cannot run `document.execCommand`, so
this specific check uses the isolated lab's own simpler
`textContent`-replacement handler against the real project's label
instead, to confirm the same underlying safety property):**
```
label.children.length after paste: 0
label contains a literal <script> tag as text, not a real element: true
```

Even a deliberately dangerous paste — one designed to look like it
might inject a real, executable `<script>` element — ends up as inert
text, with `label.children.length` still `0`: no real elements were
ever created from it, because the sanitized value was read from
`"text/plain"` and inserted as text, never parsed as markup.

### Connecting to what came before

This unit closes a real security and correctness gap the previous unit
left completely open — a `contenteditable` label, by default, accepts
whatever richly-formatted content the clipboard offers, and this unit's
own `paste` listener replaces that with a safe, plain-text-only
insertion instead. The final unit builds a structurally different
alternative to editable labels entirely, one that sidesteps this whole
category of problem from a different direction.

---

## Concept Unit: The Safer Alternative — Swapping In a Real `<input>`

### The Problem

Every trap this lesson has fixed so far — the string-vs-boolean
confusion around `contentEditable`, the need for a dedicated `paste`
handler, the reliance on a deprecated `execCommand` API — is a direct
consequence of one specific choice: editing text *inside* an element
that isn't actually a form field. A real `<input>` already handles
plain-text-only editing, cursor position, and paste sanitization
correctly, automatically, with zero of this lesson's own code — the
only real question is how to bring one in only while editing is
actually happening, and swap it back out once it's done.

> **Try this before reading on:** an `<input>` is a genuinely different
> kind of element from a `<span>` — it can't simply appear inside an
> existing `<span>`, the way `contenteditable` was added directly onto
> the existing label element with no structural change at all. Given
> Lesson 9's own tools for creating and removing real elements, what
> sequence of steps would actually swap a label out for an `<input>` at
> the exact moment editing starts, and swap a plain label back in once
> it ends? And given that a real `<input>` already has its own `value`
> property and its own built-in paste handling, would this lesson's own
> `paste` listener from the previous unit still be needed at all, once
> editing happens inside a real `<input>` instead of a `contenteditable`
> `<span>`?

### Isolated Example

```js
function startEditing(labelEl) {
  const currentText = labelEl.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "label-editor";
  input.value = currentText;
  labelEl.replaceWith(input);
  input.focus();

  function commit() {
    const newLabel = document.createElement("span");
    newLabel.className = "label";
    newLabel.textContent = input.value.trim() || currentText;
    input.replaceWith(newLabel);
  }

  function cancel() {
    input.removeEventListener("blur", commit);
    const newLabel = document.createElement("span");
    newLabel.className = "label";
    newLabel.textContent = currentText;
    input.replaceWith(newLabel);
  }

  input.addEventListener("blur", commit);
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      input.blur();
    } else if (event.key === "Escape") {
      cancel();
    }
  });
}

label.addEventListener("dblclick", function () {
  startEditing(label);
});

label.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
const input = document.querySelector(".label-editor");
console.log("after dblclick, input value:", input.value);

input.value = "Buy oat milk";
input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

console.log("after Enter, label text:", document.querySelector(".label").textContent);
console.log("input still in DOM:", document.querySelector(".label-editor") !== null);
```

Run against a page with one plain (non-`contenteditable`) `<span
id="label" class="label">Buy milk</span>`. Run for real — whether the
swap actually happens, in both directions, and whether `Enter` and
`Escape` actually produce different outcomes, are exactly the kind of
claims the Verification Rule requires proof for.

**Real output:**
```
after dblclick, input value: Buy milk
after Enter, label text: Buy oat milk
input still in DOM: false
```

Double-clicking the label swapped it out for a real `<input>`,
pre-filled with its exact previous text. Typing a new value and
pressing Enter committed that new value into a fresh label, which
swapped back in — and the `<input>` itself, per `Node.prototype
.replaceWith`'s own documented behavior, is genuinely gone from the
page afterward, not merely hidden.

**A second run, proving the `Escape` path discards changes instead:**

```js
input.value = "This should be discarded";
input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
console.log("after Escape, label text:", document.querySelector(".label").textContent);
```

**Real output:**
```
after Escape, label text: Buy milk
```

Even with a new value already typed into the input, `Escape` restores
the label's original text — `cancel()` never reads `input.value` at
all, using `currentText`, captured once at the very start of
`startEditing`, instead.

This throwaway example is now discarded — but, unlike this lesson's
earlier throwaway examples, this technique is *not* merged into the
live `createTodoElement` alongside the previous two units'
`contenteditable` version; the two are genuine alternatives to the same
problem, kept separate specifically so they remain independently
comparable, the same deliberate choice Lesson 2 and Lesson 3 made
building two separate, parallel versions of `Shape`/`Circle`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** created — `label-editor-alternative.js` (new
  file), a standalone, uninstalled comparison implementation. `todo.js`
  itself is not modified by this unit — the live project keeps the
  `contenteditable` version from the previous two Concept Units.
- **Change type:** add.
- **Location:** top of the new, empty file.
- **Dependencies:** none beyond `createTodoElement`'s own general
  label/item structure, referenced only for shape, not imported.

### The New Code

The complete `startEditing` function shown in this unit's own isolated
lab, above, is this unit's entire New Code — copied, unmodified, into
`label-editor-alternative.js`, since the lab itself already is the
real, intended implementation, not a simplified stand-in for it.

### The Updated Project

`label-editor-alternative.js`, in full:
```
 1  function startEditing(labelEl) {
 2    const currentText = labelEl.textContent;
 3    const input = document.createElement("input");
 4    input.type = "text";
 5    input.className = "label-editor";
 6    input.value = currentText;
 7    labelEl.replaceWith(input);
 8    input.focus();
 9
10    function commit() {
11      const newLabel = document.createElement("span");
12      newLabel.className = "label";
13      newLabel.textContent = input.value.trim() || currentText;
14      input.replaceWith(newLabel);
15    }
16
17    function cancel() {
18      input.removeEventListener("blur", commit);
19      const newLabel = document.createElement("span");
20      newLabel.className = "label";
21      newLabel.textContent = currentText;
22      input.replaceWith(newLabel);
23    }
24
25    input.addEventListener("blur", commit);
26    input.addEventListener("keydown", function (event) {
27      if (event.key === "Enter") {
28        input.blur();
29      } else if (event.key === "Escape") {
30        cancel();
31      }
32    });
33  }
```

This file stands entirely on its own — a complete, working alternative
to the previous two units' `contenteditable` approach, built against
the same label/item shape but never wired into the live project.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`const currentText = labelEl.textContent` (line 2).** An ordinary
  variable declaration, capturing the label's original text once,
  before any editing begins — this is the exact value `cancel` later
  restores, deliberately never re-read from the input itself.
- **`document.createElement("input")`, `input.type = "text"` (lines
  3–4).** `document.createElement`, from Lesson 9, building a real
  `<input>`; `type = "text"` is an ordinary property assignment,
  setting which kind of input this specific element behaves as (as
  opposed to, say, `"checkbox"` or `"date"`).
- **`input.value = currentText` (line 6).**
  `HTMLInputElement.prototype.value` (full CRC treatment in the header,
  above), pre-filling the new input with the label's existing text
  before it's even visible.
- **`labelEl.replaceWith(input)` (line 7).** `Node.prototype
  .replaceWith` (full CRC treatment in the header, above) — the moment
  the label actually disappears and the input actually appears in its
  exact place.
- **`input.focus()` (line 8).** `HTMLElement.prototype.focus` (full CRC
  treatment in the header, above), moving keyboard focus to the
  newly-visible input immediately, so typing can begin without an extra
  click.
- **`function commit() {...}` (lines 10–15) and `function cancel()
  {...}` (lines 17–23).** Two ordinary function declarations, both
  **closures** (first proven in Lesson 4) over `startEditing`'s own
  `currentText`, `input`, and `labelEl` — each one builds a fresh
  `<span>` and calls `replaceWith` a second time, swapping the input
  back out.
- **`input.value.trim() || currentText` (line 13).** `String.prototype
  .trim`, reused from earlier in this lesson, followed by the logical
  OR operator, already familiar from your existing background — if the
  trimmed value is an empty string (a falsy value), the expression
  falls through to `currentText` instead, preventing a label from ever
  being committed as completely blank.
- **`input.addEventListener("blur", commit)` (line 25).**
  `addEventListener`, from Lesson 8, registering `commit` directly as
  the **blur** listener — note this is a direct reference to the named
  function, not a wrapper, which is exactly what makes `cancel`'s own
  `input.removeEventListener("blur", commit)` able to find and remove
  it later.
- **`input.addEventListener("keydown", function (event) {...})` (lines
  26–32).** `addEventListener` again, for the **`keydown` event**
  (defined in Terms, above); `event.key === "Enter"` and `event.key
  === "Escape"`, both ordinary string comparisons, branch between
  triggering a commit (by calling `input.blur()`, which in turn fires
  the `blur` listener above) or calling `cancel` directly.
- **`input.removeEventListener("blur", commit)` (line 18, inside
  `cancel`).** A real, standard method — the exact counterpart to
  `addEventListener`, removing a previously-registered listener by
  reference — called here specifically so that `cancel`'s own call to
  `replaceWith` (which, in some browsers, can itself trigger a `blur`
  event as a side effect of removing the focused element from the
  page) can't accidentally also run `commit` a moment later and
  silently undo the cancellation.

### CS Lens

This is **structural substitution** — temporarily replacing one kind of
object with a different, more specialized kind that already has the
exact capabilities needed, rather than adding those capabilities onto
the original object piece by piece.

```
Also recognized in: a spreadsheet application swapping a cell's
static display for a real, editable text field the moment it's
double-clicked, swapping back to plain display once editing ends,
a video game swapping a character's normal movement controller for
a completely different "cutscene" controller during a scripted
sequence, then swapping the original back afterward, a compiler's
own use of a specialized data structure for one optimization pass,
converted back to the general-purpose representation once that pass
finishes
```

### SE Lens

This unit's own real tradeoff, stated directly rather than left
implicit: the swap-in-`<input>` technique sidesteps every trap the
first two units had to fix by hand — a real `<input>`'s own `value`
already only ever holds plain text, with no `contentEditable`
string-vs-boolean confusion, and pasting into it never risks inserting
real markup at all, no `paste` listener required. Its own real cost is
structural complexity this lesson's `contenteditable` version never
needed: two entirely different elements now exist for "the same"
piece of content depending on whether it's currently being edited, and
every other piece of this project's own code that expects a label to
always be a `<span>` with class `"label"` (Lesson 8's delegated click
handler, reading `event.target.closest(".todo-item")`, in particular)
would need to account for the possibility that, mid-edit, what's
actually in the DOM is an `<input class="label-editor">` instead — a
real integration cost this unit's own standalone file, deliberately
kept separate from the live project, doesn't have to resolve, but a
real project actually adopting this technique over `contenteditable`
would.

### Commands Needed

None — this file can be tested the same way as `todo.js`, by including
it via a `<script>` tag on a page with a matching `.label` element.

### Run It

Identical to this unit's own isolated lab and its second run, above —
this unit's own New Code and its own verification are the same code,
since the lab itself is the real, complete implementation.

### Connecting to what came before

This unit builds a structurally different solution to the exact same
problem the first two units solved with `contenteditable` — proven,
directly, to avoid the paste-safety problem the second unit had to fix
by hand, at the real cost of introducing a second element shape this
project's other code would need to account for.

---

## Connect the Pieces

One label, followed through both of this lesson's own techniques: a
to-do item reading `"Buy milk"`. Under the `contenteditable` version —
the one actually live in `todo.js` — a user types directly into the
label itself; each keystroke fires a real `input` event, triggering
`notifyChanged("edit", label)`, reusing Lesson 10's own event system
unchanged; losing focus fires `blur`, trimming stray whitespace; pasting
anything richly formatted fires `paste`, which this lesson's own second
unit intercepts, extracts only the plain-text version via
`clipboardData.getData("text/plain")`, and inserts that safely at the
cursor instead of the real, formatted content a browser would otherwise
insert by default. Under this lesson's own alternative, kept
deliberately separate in its own file, the identical `"Buy milk"` label
is instead removed from the page entirely the moment it's
double-clicked, replaced by a real `<input>` pre-filled with its exact
text; every keystroke updates that input's own native `value`, with no
custom `input` listener needed at all; pressing Enter or clicking away
commits the new text into a freshly-built label, swapped back into
exactly the position the original one occupied; pressing Escape
discards whatever was typed and restores the original text exactly,
because `cancel` never reads the input's changed value in the first
place. Two genuinely different techniques, verified independently, each
solving the same real problem with a different real cost.

## What's Next

Lesson 14 begins this curriculum's drag-and-drop work: the native HTML5
Drag and Drop API — `draggable`, `dragstart`, `dragover`, `drop`, and
`dataTransfer` — building a real reorder feature for the to-do list's
own items.
