# Lesson 8: Reversing an Action by Remembering Its Cause

- **What you will build.** An Undo button that removes the most recent
  history entry and restores the count to exactly what it was before
  that action happened — correctly, even after a Reset. The
  transferable problem: Lesson 7's history entries were plain strings
  — `"+5 → 6"` — genuinely enough to *display*, but not enough to
  *reverse*. Reading a number back out of a formatted display string
  is fragile and roundabout; this lesson's real subject is storing
  what actually happened — as real, structured data — instead of only
  storing a description of it, so an action can be undone by directly
  reversing its own real, recorded cause, not by trying to reconstruct
  it from text meant for a human to read.

- **What you need to know first.** Lesson 7's `history` array,
  `.push()`, and `renderHistory`/`recordAction` functions — this
  lesson rebuilds both directly. Lesson 3's `if` statement. Lesson 6's
  early-return guard pattern.

- **Terms used in this lesson**

  - **Object literal** — curly-brace syntax (`{ key: value, ... }`)
    that creates a new, real object directly, with named properties,
    without a separate constructor call. It exists as JavaScript's own
    basic way to represent "a record with several, named, related
    fields" — where an array (Lesson 7) represents an ordered list of
    similar things, an object literal represents one single thing with
    several different, named facts about it, each reachable by its own
    name rather than only by position.

- **Objects and methods used**

  - **`document.querySelector(selector)`** *(reappearing — full
    treatment restated)*
    - *What it is:* a method that searches the DOM tree for the first
      element matching a CSS selector.
    - *Implementation:* takes one string argument and returns either
      the first matching `Element`, or `null`.
    - *Its use:* this lesson needs one more real element reference —
      the Undo button.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* search the live DOM tree once, using the given
      selector, and hand back a real reference to the first match.
    - *Depends on:* a valid CSS selector string, and a DOM tree already
      built.
    - *Connects to:* called on `document`; the `Element` returned is
      what `addEventListener`, below, gets called on.
    - *Shape:* a public read API.

  - **`element.addEventListener(type, callback)`** *(reappearing —
    full treatment restated)*
    - *What it is:* a method, on any DOM element, that registers a
      function to run whenever a specific event happens on that
      element.
    - *Implementation:* takes an event-type string and a callback
      function; returns nothing meaningful.
    - *Its use:* this lesson's Undo button needs to react to clicks,
      the same mechanism every other button in this project already
      uses.
    - *Type:* an instance method, called on an `Element`.
    - *Responsibility:* maintain a list of callbacks registered for a
      given event type on this specific element, and invoke each one,
      in order, every time that event fires.
    - *Depends on:* an element to call it on, an event-type string, and
      a callback.
    - *Connects to:* called on `undoBtn`; the callback is application
      code the browser decides when to run.
    - *Shape:* a callback boundary between application code and the
      browser's event-dispatch system.

  - **`Array.prototype.pop()`**
    - *What it is:* a method, on any array, that removes the *last*
      element and returns it.
    - *Implementation:* takes no arguments; removes the array's own
      final element, shortening the array's real length by one, and
      returns exactly that removed element — the direct, real
      counterpart to `.push()`, established in Lesson 7, which adds to
      the end; `.pop()` removes from the end.
    - *Its use:* this is the real mechanism that makes Undo possible at
      all — it both identifies *which* action was most recent (the
      last one recorded) and hands back the real, structured record of
      exactly what that action did, in one step.
    - *Type:* an instance method, called on any array.
    - *Responsibility:* remove the calling array's own last element,
      genuinely shortening it, and hand that exact element back to the
      caller — a real, two-part job (mutate, and return what was
      removed), not just one or the other.
    - *Depends on:* an array to call it on, with at least one element
      — calling it on an empty array returns `undefined` rather than
      throwing, though this lesson's own code guards against that case
      before ever calling it.
    - *Connects to:* called on `history`; its real, returned object is
      read directly afterward to determine exactly how much to reverse
      `count` by.
    - *Shape:* a mutation API — the real, structural opposite of
      `.push()`.

---

## Concept Unit: Selecting the Undo Button

### The Problem

Before Undo can do anything, the script needs a real reference to the
Undo button itself.

> **Before reading on:** you've written this exact lookup many times
> now. Given `<button id="undoBtn">` exists in the HTML, what would
> you type, without looking anything up, to get a real reference to
> it?

### Introduce the Concept in Isolation

A fresh throwaway lab, against a new button:

```js
const found = document.querySelector('#u');
console.log(found.tagName);
```

Against a throwaway `<button id="u">undo</button>`. Real run (Node +
jsdom):

```
found: true | tagName: BUTTON
```

This reconfirms the lookup mechanism, unchanged from every previous
use in this curriculum.

### Discard the Throwaway Example

This throwaway `<button id="u">` isn't part of the counter project. It
existed only to reconfirm the lookup mechanism before selecting the
real Undo button.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `index.html` (modified — one new button added,
  after the history list); `script.js` (modified — one new `const`
  declaration added).
- **Change type:** add.
- **Location:** `index.html` — after `</ul>` closing `#historyList`;
  `script.js` — after the existing `historyList` declaration.
- **Dependencies:** none new.

### The New Code

```js
const undoBtn = document.querySelector('#undoBtn');
```

### The Updated Project

`index.html`, in full, this unit's new line marked:

```html
 1  <!DOCTYPE html>
 2  <html>
 3  <head>
 4    <style>
 5      .hidden { display: none; }
 6    </style>
 7  </head>
 8  <body>
 9    <button id="toggleBtn">Show message</button>
10    <p id="message" class="hidden">Hello, this was hidden.</p>
11
12    <button id="countBtn">Click me</button>
13    <p id="countDisplay">Clicked 0 times</p>
14    <button id="resetBtn">Reset</button>
15
16    <div id="quickAdd">
17      <button class="quickAddBtn" data-amount="1">+1</button>
18      <button class="quickAddBtn" data-amount="5">+5</button>
19      <button class="quickAddBtn" data-amount="10">+10</button>
20    </div>
21
22    <input id="amountInput" type="number" placeholder="amount">
23    <button id="addQuickAddBtn">Add quick-add button</button>
24
25    <h3>History</h3>
26    <ul id="historyList"></ul>
27    <button id="undoBtn">Undo</button>                            <!-- ← new -->
28
29    <script src="script.js"></script>
30  </body>
31  </html>
```

`script.js`'s own relevant section, in full, this unit's new line
marked:

```js
1  const historyList = document.querySelector('#historyList');
2  const undoBtn = document.querySelector('#undoBtn');                // ← new
```

### Mechanical Walkthrough

- **`const`** — declares a binding that won't be reassigned; explained
  in full in Lesson 1.
- **`undoBtn`** — the new variable name.
- **`=`** — the assignment operator, explained in full in Lesson 1.
- **`document`** — the global page object, explained in full in
  earlier lessons.
- **`.querySelector`** — the method itself, explained in full above.
- **`(`...`)`** — call syntax.
- **`'#undoBtn'`** — a string literal CSS selector; leading `#` means
  "match by `id`," identical mechanism used throughout this
  curriculum.
- **`;`** — statement terminator.

### CS Lens

Not applicable beyond this curriculum's own already-covered concept —
element selection by CSS selector.

### SE Lens

The same real tradeoff already named repeatedly in this curriculum:
selecting by a stable `id` keeps this lookup correct regardless of
where `undoBtn` sits in the page, at the cost of one more element that
now carries a unique `id`.

### Commands Needed

None.

### Run It

Exercised as part of this lesson's closing full-project run, below.

### Connection

This unit gets the one new reference this lesson needs — the next two
units are what change *what* gets recorded in the first place, before
Undo can reverse anything real.

---

## Concept Unit: Storing a Real Record with an Object Literal

### The Problem

Lesson 7's `history` array holds plain strings like `"+5 → 6"` —
enough to display, but nothing in that string can be safely,
mechanically taken back apart to answer "exactly how much did this
action add, so Undo can subtract it back out." Parsing a number back
out of text built for a human to read is exactly the kind of fragile
work this lesson's real subject exists to avoid entirely.

> **Before reading on:** if you needed to remember *several*, real,
> separate facts about one single event — what it was called, how much
> it changed the count by, and what the count became as a result — all
> three staying together as one real unit, rather than three separate,
> unrelated arrays that could get out of sync with each other, what
> real kind of value would let you name and hold all three at once?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
const entry = { label: '+5', amount: 5, resultingCount: 5 };
console.log(entry, typeof entry);

const entries = [];
entries.push({ label: '+1', amount: 1, resultingCount: 1 });
entries.push({ label: '+5', amount: 5, resultingCount: 6 });
console.log(entries.length, entries);
```

Real run (Node):

```
entry: {"label":"+5","amount":5,"resultingCount":5}
typeof entry: object
entries.length: 2
entries: [{"label":"+1","amount":1,"resultingCount":1},{"label":"+5","amount":5,"resultingCount":6}]
```

This proves `{ key: value, ... }` genuinely creates one real object
holding three separate, named facts together — `typeof entry` confirms
it's a real `object`, distinct from a plain string or number — and
that `.push()`, the identical mechanism Lesson 7 already established
for strings, works exactly the same way when what's being pushed is a
real object instead. This construct is called an **object literal**.

### Discard the Throwaway Example

This standalone `entry`/`entries` pair isn't part of the counter
project. It existed only to prove object literals genuinely bundle
several named facts into one real value.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `recordAction`'s own
  signature and body change; every call site is updated to match).
- **Change type:** replace — Lesson 7's `recordAction(label)`, which
  read `count` but never changed it directly (callers updated `count`
  themselves, beforehand), is replaced by a version that takes the
  real, exact delta and does the state change itself, centralizing
  where `count` actually gets modified.
- **Location:** `recordAction`'s own declaration; the three existing
  call sites inside `countBtn`, `resetBtn`, and the quick-add
  delegation handler.
- **Dependencies:** `count`, `history`, `countDisplay`, all already
  established.

### The New Code

```js
function recordAction(label, amount) {
  count = count + amount;
  countDisplay.textContent = `Clicked ${count} times`;
  history.push({ label, amount, resultingCount: count });
  renderHistory();
}
```

### The Updated Project

`script.js`'s own relevant section, in full, this unit's changed lines
marked:

```js
 1  function recordAction(label, amount) {                            // ← changed signature
 2    count = count + amount;                                          // ← new
 3    countDisplay.textContent = `Clicked ${count} times`;              // ← new
 4    history.push({ label, amount, resultingCount: count });           // ← changed
 5    renderHistory();
 6  }
 7
 8  countBtn.addEventListener('click', () => {
 9    recordAction('+1', 1);                                            // ← changed
10  });
11
12  resetBtn.addEventListener('click', () => {
13    if (count !== 0) {
14      recordAction('Reset', -count);                                  // ← changed
15    }
16  });
17
18  quickAddContainer.addEventListener('click', (e) => {
19    const btn = e.target.closest('.quickAddBtn');
20    if (!btn) return;
21    const amount = Number(btn.dataset.amount);
22    recordAction(`+${amount}`, amount);                                // ← changed
23  });
```

`recordAction` itself now does real, complete work: it takes the exact
real amount to apply (positive to add, negative to subtract), updates
`count` and `countDisplay` itself, and stores a real object — not a
formatted string — recording exactly what happened. Every caller
correspondingly simplifies: `countBtn`'s handler no longer touches
`count` or `countDisplay` itself at all, just states *what happened*
(`'+1'`, amount `1`) and lets `recordAction` do the rest. Line 14's own
`-count` is the real, deliberate choice that makes Reset expressible
in the exact same shape as every other action: "subtract exactly
`count`'s current value," which always, correctly, lands on `0`,
regardless of what `count` currently is.

### Mechanical Walkthrough

- **`function recordAction(label, amount)`** — a named function
  declaration, explained in full in Lesson 6; now takes two
  parameters instead of one — `label`, unchanged from Lesson 7, and
  `amount`, new, the real, exact numeric delta this action represents.
- **`count = count + amount;`** — a reassignment, explained in full in
  Lesson 2; this exact operation used to live inside each individual
  handler — now it lives here, once, run identically regardless of
  which handler triggered it.
- **`` `Clicked ${count} times` ``** — a template literal, explained
  in full in Lesson 2; likewise moved here from each individual
  handler.
- **`history.push(`...`);`** — the method itself, explained in full in
  Lesson 7.
- **`{ label, amount, resultingCount: count }`** — an object literal,
  explained in full above; `label` and `amount` here use a real
  shorthand — writing just `label` inside the braces, rather than
  `label: label`, is legal precisely because a variable already named
  `label` exists in this exact scope (the function's own parameter),
  and JavaScript lets a property take its name directly from a
  same-named variable rather than repeating it; `resultingCount: count`
  can't use that same shorthand, since the property's own name
  (`resultingCount`) and the variable supplying its value (`count`)
  are genuinely different names, so both have to be written out.
- **`-count`** (at the `resetBtn` call site) — the unary minus
  operator, applied to `count`'s own current value, producing its
  negative — the first appearance of unary minus in this curriculum;
  distinct from the binary `-` that would subtract one value from
  another, this one flips the sign of a single value.

### CS Lens

Grouping several, real, named, related facts about one event into a
single value — rather than three separate, parallel arrays that have
to be kept manually in sync by matching index — is a concrete instance
of a **record** (sometimes called a struct in other languages): a
composite value whose whole point is that its fields travel together,
always describing the same one, real thing.

Also recognized in: a database row, where every column value for one
row is understood as describing that one, same real entity; a JSON API
response representing one resource as one object with several fields;
a struct in C or Rust; a class instance in any object-oriented
language, before any of its own methods are even considered — just the
bundled data alone.

### SE Lens

The real alternative not chosen — and the one Lesson 7 actually used —
is three separate, parallel arrays: `labels`, `amounts`,
`resultingCounts`, with entry `i` of each array describing "the same"
real action only by sharing the same numeric index. That works, and
avoids object literals entirely, but the real cost compounds
immediately: every `.push()` now has to happen three times, in the
same order, on all three arrays, every single time, with nothing in
the language itself enforcing that they can never drift out of sync —
a single missed or misordered push on just one of the three arrays
would silently corrupt every entry after it. One array of real
objects, each object bundling its own three related facts together,
makes "these three facts describe the same event" a structural fact of
the data itself, not a discipline the programmer has to maintain by
hand across three separate collections.

### Commands Needed

None.

### Run It

Real output shown above, proving object literals bundle real,
independently-named facts correctly. Exercised as part of this
lesson's closing full-project run, below.

### Connection

`history` now stores real, structured records instead of formatted
text — the next unit is what reads them back out correctly on the
display side.

---

## Concept Unit: Reading a Record's Fields with Dot Notation

### The Problem

`renderHistory`, unchanged since Lesson 7, still expects each history
entry to be a plain string it can hand straight to `.textContent`.
Now that entries are real objects, that assumption is broken —
`li.textContent = entry` would display something like
`"[object Object]"`, not a real, readable line.

> **Before reading on:** given `entry` is now a real object with real
> `label`, `amount`, and `resultingCount` fields, and this project
> already reads named fields off of objects constantly — `btn.dataset`
> in Lesson 4, `e.target` in Lesson 5 — what real syntax would you use
> to read `entry`'s own `label` and `resultingCount` fields
> specifically, to rebuild the same kind of display line Lesson 7
> showed?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
const entry = { label: '+5', amount: 5, resultingCount: 6 };
console.log(entry.label);
console.log(entry.amount);
console.log(entry.resultingCount);
const display = `${entry.label} → ${entry.resultingCount}`;
console.log(display);
```

Real run (Node):

```
entry.label: +5
entry.amount: 5
entry.resultingCount: 6
built display string: +5 → 6
```

This proves each named field is genuinely, individually reachable off
the real object by name, and that combining two of them with a
template literal (the identical mechanism established in Lesson 2)
correctly rebuilds the exact same, real display line Lesson 7's own
plain-string version already showed.

### Discard the Throwaway Example

This standalone `entry`/`display` pair isn't part of the counter
project. It existed only to prove field access by name reads the
correct, real values back out.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `renderHistory`'s own
  `li.textContent` line changes).
- **Change type:** replace.
- **Location:** inside `renderHistory`, the line that sets each new
  `<li>`'s text.
- **Dependencies:** `history`'s new, object-based entries, from the
  previous unit.

### The New Code

```js
li.textContent = `${entry.label} → ${entry.resultingCount}`;
```

### The Updated Project

`script.js`'s own `renderHistory` function, in full, this unit's
changed line marked:

```js
1  function renderHistory() {
2    historyList.innerHTML = '';
3    history.forEach((entry) => {
4      const li = document.createElement('li');
5      li.textContent = `${entry.label} → ${entry.resultingCount}`;    // ← changed
6      historyList.append(li);
7    });
8  }
```

Line 5 replaces Lesson 7's plain `li.textContent = entry;` — now that
`entry` is a real object, not a string, this line rebuilds the
identical visible display Lesson 7 already produced, by reading the
two specific fields it needs and combining them the same way Lesson
7's own `recordAction` originally did.

### Mechanical Walkthrough

- **`li.textContent`** — the property itself, explained in full in
  Lesson 2 and reused since; the write target for this line.
- **`=`** — the assignment operator, explained in full in Lesson 1.
- **`` ` ``...`` ` ``** — a template literal, explained in full in
  Lesson 2.
- **`${`...`}`** (first) — the substitution syntax, explained in full
  in Lesson 2; contains `entry.label`.
- **`entry`** — the current object, from `forEach`'s own callback
  parameter, one lesson-8 history record.
- **`.label`** — dot notation, reading the real `label` field off
  `entry`; the identical real access mechanism as `btn.dataset` in
  Lesson 4 or `e.target` in Lesson 5 — a named property, read directly
  off a real object.
- **`${`...`}`** (second) — a second substitution, containing
  `entry.resultingCount`.
- **`.resultingCount`** — dot notation, reading the real
  `resultingCount` field off the same object.
- **`;`** — ends the statement.

### CS Lens

Not applicable as a new hard concept — dot-notation field access is
the direct, structural counterpart to the previous unit's own object
literal (construction); this unit is the read side of the identical
mechanism, not a separate idea.

### SE Lens

The real alternative not chosen is storing the already-formatted
display string *inside* the object too — an object like `{ label,
amount, resultingCount, displayText: '+5 → 6' }` — computed once, at
push time, and read directly here without rebuilding it. That would
save rebuilding the same string on every single re-render, at the real
cost of a fourth field that exists purely to cache something
`renderHistory` could always recompute correctly from the other three
— and, worse, a real risk that `displayText` could someday drift out
of sync with the fields it was supposedly built from, if some future
change updated `resultingCount` without remembering to also rebuild
`displayText`. Recomputing the display string fresh, every render,
directly from the real, authoritative fields (`label`,
`resultingCount`), is the same single-source-of-truth principle
Lesson 7 already named, applied one level deeper: never store a fact
that's fully, cheaply derivable from another fact already being
stored.

### Commands Needed

None.

### Run It

Real output shown above, proving field access correctly rebuilds the
display line. Exercised as part of this lesson's closing full-project
run, below.

### Connection

History now correctly displays again, from real, structured data — the
final unit is what actually uses that structure to reverse an action.

---

## Concept Unit: Reversing the Last Action with `Array.pop()`

### The Problem

`history` now holds exactly the real information needed to undo an
action — but nothing yet removes an entry, or uses one to actually roll
`count` back.

> **Before reading on:** this lesson's own Header already named a
> method that's the real, structural opposite of `.push()` — removing
> from the end instead of adding to it, and handing back what it
> removed. Given the most recent history entry's own real `amount`
> field records exactly how much that action added to `count`, what
> real, single arithmetic operation would undo it?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
const history = [
  { label: '+1', amount: 1, resultingCount: 1 },
  { label: '+5', amount: 5, resultingCount: 6 },
];
console.log(history.length);
const removed = history.pop();
console.log(history.length);
console.log(removed);
console.log(history);
```

Real run (Node):

```
before pop, length: 2
after pop, length: 1
removed: {"label":"+5","amount":5,"resultingCount":6}
remaining: [{"label":"+1","amount":1,"resultingCount":1}]
```

This proves `.pop()` genuinely removes the array's real, final
element — length drops from `2` to `1` — and correctly hands back
exactly that removed object, fully intact, with every one of its own
real fields still readable.

### Discard the Throwaway Example

This throwaway `history` array isn't part of the counter project. It
existed only to prove `.pop()` removes and returns the real, last
element correctly.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new `undoLastAction`
  function added, plus the Undo button's own click wiring).
- **Change type:** add.
- **Location:** after `recordAction`.
- **Dependencies:** `history`, `count`, `countDisplay`, `renderHistory`,
  `undoBtn`, all already established.

### The New Code

```js
function undoLastAction() {
  if (history.length === 0) return;
  const last = history.pop();
  count = count - last.amount;
  countDisplay.textContent = `Clicked ${count} times`;
  renderHistory();
}

undoBtn.addEventListener('click', undoLastAction);
```

### The Updated Project

`script.js`, this lesson's own full, final section, every change from
this whole lesson shown together, new/changed lines marked:

```js
 1  const historyList = document.querySelector('#historyList');
 2  const undoBtn = document.querySelector('#undoBtn');
 3
 4  let count = 0;
 5  let history = [];
 6
 7  function renderHistory() {
 8    historyList.innerHTML = '';
 9    history.forEach((entry) => {
10     const li = document.createElement('li');
11     li.textContent = `${entry.label} → ${entry.resultingCount}`;
12     historyList.append(li);
13   });
14  }
15
16  function recordAction(label, amount) {
17    count = count + amount;
18    countDisplay.textContent = `Clicked ${count} times`;
19    history.push({ label, amount, resultingCount: count });
20    renderHistory();
21    undoBtn.disabled = history.length === 0;                         // ← new
22  }
23
24  countBtn.addEventListener('click', () => {
25    recordAction('+1', 1);
26  });
27
28  resetBtn.addEventListener('click', () => {
29    if (count !== 0) {
30      recordAction('Reset', -count);
31    }
32  });
33
34  quickAddContainer.addEventListener('click', (e) => {
35    const btn = e.target.closest('.quickAddBtn');
36    if (!btn) return;
37    const amount = Number(btn.dataset.amount);
38    recordAction(`+${amount}`, amount);
39  });
40
41  function undoLastAction() {                                        // ← new
42    if (history.length === 0) return;                                 // ← new
43    const last = history.pop();                                       // ← new
44    count = count - last.amount;                                      // ← new
45    countDisplay.textContent = `Clicked ${count} times`;                // ← new
46    renderHistory();                                                   // ← new
47    undoBtn.disabled = history.length === 0;                           // ← new
48  }                                                                    // ← new
49
50  undoBtn.addEventListener('click', undoLastAction);                  // ← new
51  undoBtn.disabled = true;                                            // ← new
```

Line 21, added to `recordAction`, keeps Undo correctly enabled the
moment there's real history to undo, and correctly disabled again the
moment there isn't. Lines 41–48 add the real reversal logic itself.
Line 51 sets the correct initial state — Undo starts disabled, since
`history` starts empty.

### Mechanical Walkthrough

- **`function undoLastAction()`** — a named function declaration,
  explained in full in Lesson 6.
- **`if (history.length === 0) return;`** — the `if` statement,
  explained in full in Lesson 3; `.length`, an already-established
  property (first covered on `NodeList` in Lesson 4, general to any
  real array or array-like collection); `===`, explained in full in
  Lesson 6; `return`, explained in full in Lesson 6; together, this
  line exits immediately if there's nothing to undo — the identical
  early-return guard shape as Lesson 5's `if (!btn) return;` and
  Lesson 6's own validation guard.
- **`const last = history.pop();`** — the declaration, explained in
  full in Lesson 1; `.pop()`, the method itself, explained in full
  above; `last` now holds the real, complete object describing exactly
  what the most recent action was.
- **`count = count - last.amount;`** — a reassignment, explained in
  full in Lesson 2; `last.amount`, dot-notation field access, explained
  in full in the previous unit; this is the real, single line that
  actually reverses the action — subtracting back out exactly what
  `recordAction` had added, whatever that real amount happened to be
  (a positive quick-add amount, or a negative Reset delta — the
  identical formula correctly handles both, since `recordAction`
  already stored the real, signed delta rather than a separate
  "was this an add or a reset" flag).
- **`countDisplay.textContent = `...`;`** — the same display-update
  mechanism established in Lesson 2 and reused throughout.
- **`renderHistory();`** — a call to the already-established function,
  re-rendering the now-one-shorter list.
- **`undoBtn.disabled = history.length === 0;`** — the property
  itself, explained in full in Lesson 6; correctly reflects whether
  there's anything left to undo, immediately after this real removal.
- **`undoBtn.addEventListener('click', undoLastAction);`** — the same
  `addEventListener` mechanism explained in full above, passing the
  real, named function by reference — the identical "function as a
  value" pattern Lesson 6 already established for `addNewQuickAddButton`.

### CS Lens

Reversing an action by directly undoing its own, real, recorded effect
— rather than recomputing some entirely different, independent "previous
state" from scratch — is a concrete instance of the **command
pattern**'s own undo mechanism: each real action is represented as a
real, storable record of what it did, specifically so that record
alone is enough to reverse it later, without needing any separate,
independently-maintained history of prior states.

Also recognized in: a text editor's own Ctrl+Z, which reverses the
last specific edit rather than restoring an entire earlier saved
snapshot of the whole document; a database transaction's own rollback,
undoing exactly the operations within that transaction; a version
control system's own `revert` of a single commit, undoing exactly that
commit's own changes rather than resetting the whole repository to an
earlier point; a physical accounting ledger's own reversing entry,
which cancels out a specific prior transaction with an equal and
opposite one, rather than erasing and rewriting the books.

### SE Lens

The real alternative not chosen is keeping a *second*, separate history
of full `count` snapshots — an array like `[0, 1, 6, 16]`, one entry
per action, and undoing by simply reading the previous snapshot
directly, rather than subtracting an amount at all. That would avoid
the arithmetic in `count = count - last.amount` entirely, real,
working code either way — but it means maintaining *two* real,
parallel histories (the display-oriented `history` this lesson already
has, and a second, undo-oriented snapshot list) that would need to
stay in perfect lockstep forever, the identical real risk this
project's own Lesson 7 SE Lens already warned against for a different
pair of parallel structures. Storing the real, signed delta once, per
action, and using ordinary arithmetic to reverse it, means exactly one
real history exists, serving both display and undo — the same
single-source-of-truth principle carried through consistently, rather
than solved twice, in two different, potentially-diverging ways.

### Commands Needed

None — plain HTML/JS, no build step, openable directly in a browser.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature — a real sequence of add actions, multiple undos,
undo correctly refusing to run past empty, and undo correctly
reversing a Reset:

```
--- Undo starts disabled (history empty) ---
undoBtn.disabled: true

--- +1, +5, +10 in sequence ---
count: 16 | history.length: 3
history: [{"label":"+1","amount":1,"resultingCount":1},{"label":"+5","amount":5,"resultingCount":6},{"label":"+10","amount":10,"resultingCount":16}]
undoBtn.disabled: false

--- Undo once (should remove the +10, restore count to 6) ---
count: 6 | history.length: 2
countDisplay.textContent: Clicked 6 times
historyList last li: +5 → 6

--- Undo twice more (back to empty) ---
count: 0 | history.length: 0
undoBtn.disabled (should be true again): true

--- Undo with empty history does nothing (guard works) ---
count unchanged: true

--- reset uses recordAction correctly (delta = -count) ---
count before reset: 2
count after reset: 0 | last history entry: {"label":"Reset","amount":-2,"resultingCount":0}

--- undo after reset restores pre-reset count ---
count restored to: 2

--- Lesson 1 toggle still independent ---
message hidden now: false
```

The last two blocks are the real, direct proof of this lesson's own
harder claim: Reset's own delta was correctly recorded as `-2` (not a
separate "reset" flag), and Undo, using the exact same, single
`count = count - last.amount` line every other action already uses,
correctly restored `count` to `2` — proving one, real, uniform
mechanism genuinely handles every kind of action this project has,
with no special case anywhere for Reset.

### Connection

This is the final piece — every recorded action, of any real kind,
including Reset, can now be reversed by the exact same, single,
correct mechanism.

---

## Closing

**Connect the pieces.** One real sequence, start to finish: the user
clicks `+10`. This lesson's second unit's own `recordAction('+10',
10)` runs: `count` becomes `16`; a real object,
`{ label: '+10', amount: 10, resultingCount: 16 }`, is pushed onto
`history`; `renderHistory` (rebuilt in this lesson's third unit) reads
`entry.label` and `entry.resultingCount` off that exact object and
displays "+10 → 16"; `undoBtn.disabled` is set to `false`, since
`history.length` is now `3`, not `0`.

The user clicks Undo. This lesson's final unit's own
`undoLastAction` runs: `history.length === 0` is `false`, so the guard
doesn't trigger; `history.pop()` removes and returns exactly that same
real object — `{ label: '+10', amount: 10, resultingCount: 16 }` — as
`last`. `count = count - last.amount` reads `last.amount`, the real
`10` this exact action added, and subtracts it back out: `16 - 10`,
correctly landing on `6` — count's own real value from *before* this
action, recovered not by reading some separately-tracked "previous
value," but by directly, arithmetically reversing the one, real,
recorded cause. `countDisplay` updates to "Clicked 6 times";
`renderHistory` rebuilds the list, now correctly one entry shorter;
`undoBtn.disabled` is reevaluated, staying `false`, since two real
entries still remain. One real object, carrying its own action's exact
cause; one line of arithmetic, reversing it — the entire mechanism
behind undoing anything this project can do, uniformly, correctly,
every time.
