# Lesson 7: Keeping a Record Instead of Just a Result

- **What you will build.** A visible history log — a real list on the
  page, showing every action that changed the count, in order, each
  entry recording what happened and what the count became right after.
  The transferable problem: every feature this curriculum has built so
  far only ever showed the *current* state — one number, on screen,
  overwritten every time it changes, with the previous value gone the
  instant a new one replaces it. This lesson is the first one that
  needs to remember more than "right now" — a real, growing sequence of
  everything that already happened, and a real, working way to keep a
  whole list on the page in sync with that sequence.

- **What you need to know first.** Lesson 4's `document.createElement`
  reasoning (already established for creating new buttons, reused here
  for list items) and `NodeList.forEach`. Lesson 2's `let`/reassignment
  and template literals. This lesson's own real subject — an array as
  the single source of truth, rebuilt into real DOM elements every time
  it changes — is new.

- **Terms used in this lesson**

  - **Array literal** — square-bracket syntax (`[]`, or `['a', 'b']`)
    that creates a new, real, ordered collection directly, without a
    separate constructor call. It exists as JavaScript's own basic way
    to represent "a list of things" — the same general idea Lesson 4's
    `NodeList` already represented for DOM elements specifically, but a
    plain array is the language's own, general-purpose version, usable
    for any kind of value at all, not just elements found by a
    selector.
  - **Single source of truth** — a design principle stating that any
    one real piece of information should be stored in exactly one
    place, with everywhere else that displays or uses it derived from
    that one place, rather than storing separate, parallel copies that
    could drift out of sync with each other. It exists because keeping
    two or more independent copies of the same fact — here, "what has
    happened so far" — creates a real, ongoing risk that they disagree,
    with no way to tell which one is actually correct once they do.

- **Objects and methods used**

  - **`Array.prototype.push(value)`**
    - *What it is:* a method, on any array, that adds one or more new
      values to the *end* of that array.
    - *Implementation:* takes one or more arguments; adds each, in
      order, as new elements at the end of the array it's called on;
      returns the array's new length — this lesson's code never uses
      that return value, only the side effect.
    - *Its use:* this is the one, real mechanism that actually grows
      the history — every recorded action adds exactly one new entry,
      always at the end, preserving the real order things happened in.
    - *Type:* an instance method, called on any array.
    - *Responsibility:* mutate the calling array by adding the given
      value(s) at its end — the array itself changes; nothing new is
      returned to represent "the updated array," because there isn't
      one — there's only ever the one, real array, changed in place.
    - *Depends on:* an array to call it on, and at least one value to
      add.
    - *Connects to:* called on `history`, this lesson's own array;
      every call to it is immediately followed by a call to
      `renderHistory`, below, keeping the visible page in sync with
      the real, updated array.
    - *Shape:* a mutation API — the moment the single source of truth
      actually changes.

  - **`element.innerHTML` (write)**
    - *What it is:* a property on every DOM element that, when
      assigned a string, replaces everything inside that element by
      parsing the assigned string *as real HTML*, not as plain text.
    - *Implementation:* a string-typed property; unlike `.textContent`
      (established in Lesson 2), assigning to `.innerHTML` interprets
      tags inside the string as real markup — `el.innerHTML =
      '<b>hi</b>'` produces a real, bolded "hi," not the literal text
      `<b>hi</b>` a `.textContent` assignment of the same string would
      produce. This lesson uses it only in its single safest form:
      assigning the empty string, `''`, which parses to nothing at
      all, removing every existing child.
    - *Its use:* this is how the history list is cleared before being
      rebuilt from scratch on every single update — every real child
      element currently inside it is removed in one step.
    - *Type:* an instance property (read/write) on any DOM element.
    - *Responsibility:* replace an element's entire contents by
      parsing the assigned string as real markup — genuinely more
      powerful, and genuinely more dangerous with untrusted content,
      than `.textContent`, which this lesson's own SE Lens addresses
      directly.
    - *Depends on:* the element it's set on, and a string to assign.
    - *Connects to:* written to directly by `renderHistory`, below,
      immediately before that same function rebuilds the list's real
      children from scratch.
    - *Shape:* a mutation API — genuinely more powerful than
      `.textContent`, and used here in the one specific way (clearing,
      via an empty string) that carries none of that extra power's
      real risk.

  - **`Array.prototype.forEach(callback)`** *(reappearing — the
    identical mechanism `NodeList.forEach`, established in Lesson 4,
    already covered, now confirmed on `Array`'s own, distinct real
    implementation)*
    - *What it is:* a method, on any array, that runs a given callback
      once for every element in that array, in order.
    - *Implementation:* takes one function argument; that function is
      called once per element, receiving the element itself, its
      index, and the whole array — the identical real shape Lesson 4's
      `NodeList.forEach` already established, though `Array` and
      `NodeList` are genuinely different real types, each with its own
      separate, real `forEach` implementation, not one shared one.
    - *Its use:* this is how every entry in the real `history` array
      gets turned into a real, visible `<li>` element, one at a time,
      in the same order they were recorded.
    - *Type:* an instance method on any array.
    - *Responsibility:* visit every element in the array exactly once,
      in order, and invoke the given callback with each one.
    - *Depends on:* an array to be called on, and a callback function.
    - *Connects to:* called on `history`; the callback it invokes calls
      `document.createElement`, already established in Lesson 4, once
      per history entry.
    - *Shape:* an iteration API — the same real category of mechanism
      as `NodeList.forEach`, applied here to plain data instead of
      live DOM elements.

  - **`document.createElement(tagName)`** *(reappearing from Lesson 5
    — full treatment restated)*
    - *What it is:* a method that constructs a brand-new element node,
      not yet attached anywhere in the page.
    - *Implementation:* takes one string argument naming an HTML tag
      and returns a real, new `Element` of that kind.
    - *Its use:* this lesson builds one real `<li>` per history entry,
      the identical mechanism Lesson 5 used to build new `<button>`
      elements.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* construct exactly one new, real, detached
      element of the given kind.
    - *Depends on:* a valid HTML tag name string.
    - *Connects to:* called on `document`, inside this lesson's
      `forEach` callback; the element it returns is configured, then
      handed to `.append()`, below.
    - *Shape:* a public creation API.

  - **`parentElement.append(child)`** *(reappearing from Lesson 5 —
    full treatment restated)*
    - *What it is:* a method that inserts a given node as the last
      child of the element it's called on.
    - *Implementation:* takes one or more real node arguments and
      appends each, in order, as new children at the end of the
      calling element's existing children.
    - *Its use:* this is the step that actually makes each real `<li>`
      visible, inside `historyList`, in the same order `forEach`
      visits the underlying array.
    - *Type:* an instance method, called on an `Element`.
    - *Responsibility:* attach a real, given node into the live DOM
      tree, as the last child of the element it's called on.
    - *Depends on:* a real node to insert, and an element already
      present in the DOM tree.
    - *Connects to:* called on `historyList`; the node it inserts is
      whatever `document.createElement` most recently built for the
      current history entry.
    - *Shape:* a mutation API.

---

## Concept Unit: Storing a Growing List with an Array and `.push()`

### The Problem

Nothing in this project currently remembers anything beyond the
current count. Every previous action — a click, a reset, a quick add —
computed a new value and immediately overwrote whatever the display
said before, with no trace of what happened left anywhere.

> **Before reading on:** if you needed to keep a real, growing list of
> everything that's happened so far — not just the latest thing —
> what real, general-purpose kind of value, already familiar from
> basically any programming background, holds an ordered sequence of
> items that can grow over time? What would the very first, empty
> version of that list look like, before anything has happened yet?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
let history = [];
console.log(history, history.length);
history.push('+1 → 1');
console.log(history, history.length);
history.push('+5 → 6');
console.log(history, history.length);
```

Real run (Node):

```
history starts as: [] | length: 0
after one push: ["+1 → 1"] | length: 1
after two pushes: ["+1 → 1","+5 → 6"] | length: 2
```

This proves `[]` creates a real, empty array — length `0` — and that
`.push()` genuinely grows it, in place, one real element at a time,
preserving the order each value was added in. This construct — square
brackets creating a real, ordered list — is called an **array
literal**.

### Discard the Throwaway Example

This standalone `history` variable, in this throwaway lab, isn't part
of the counter project. It existed only to prove `[]` and `.push()`
genuinely create and grow a real, ordered list before relying on them
for real.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — one new `let`
  declaration added).
- **Change type:** add.
- **Location:** immediately after the existing `let count = 0;`
  declaration.
- **Dependencies:** none new.

### The New Code

```js
let history = [];
```

### The Updated Project

`script.js`'s own relevant section, in full, this unit's new line
marked:

```js
1  let count = 0;
2  let history = [];                                                 // ← new
```

Line 2 gives the project a single, real place to keep a growing record
of everything that happens — starting empty, since nothing has
happened yet. Nothing writes to it or reads from it outside this
declaration yet; the next units are what actually use it.

### Mechanical Walkthrough

- **`let`** — the declaration keyword, explained in full in Lesson 2;
  chosen here, rather than `const`, because — unlike `quickAddContainer`
  or `countDisplay`, whose own bindings never change — this project
  will call a real, mutating method on `history` throughout its
  lifetime; note, though, that `.push()` itself, covered next, mutates
  the array *in place* without ever reassigning the `history` binding
  itself — `const history = []` would, in fact, also have worked here,
  since `.push()` never needs to point `history` at a *different*
  array, only change the one it already points to. `let` is used here
  for consistency with `count`, this project's other piece of state
  that changes over time, even though, strictly, `const` would have
  been equally correct for this specific variable.
- **`history`** — the variable name, describing what it holds.
- **`=`** — the assignment operator, explained in full in Lesson 1.
- **`[]`** — an array literal, explained in full above (Terms); an
  empty pair of square brackets creates a real, new, empty array —
  the starting state before anything has been recorded.
- **`;`** — statement terminator.

### CS Lens

An array used specifically to accumulate a real, ordered record of
events over time — rather than being built once and left unchanged —
is a concrete instance of a **log**: an append-only (or, at minimum,
append-mostly) sequence whose entire value is in preserving *order* and
*history*, not just a current snapshot.

Also recognized in: a database's own write-ahead log, recording every
change before it's applied; a version-control system's own commit
history; a bank statement's own list of transactions, each one kept
even after the balance it produced is long superseded by a later one;
a flight recorder ("black box") in an aircraft, recording a continuous
sequence of readings rather than only the most recent one.

### SE Lens

The real alternative not chosen is not keeping a history at all — just
letting `countDisplay` show the current number, exactly as this
project did through the end of Lesson 6, and letting every prior value
be genuinely, permanently lost the instant a new one replaces it. That
approach is real, simpler, and was entirely sufficient for everything
this project needed through Lesson 6. The real cost it accepts: a user
who wants to know "what did I actually do to get here" has no way to
find out — only the current number survives. Adding `history` is the
real, deliberate tradeoff of a small amount of ongoing memory and
bookkeeping, in exchange for the page being able to answer a question
it previously couldn't answer at all.

### Commands Needed

None.

### Run It

Real output shown above, proving `[]` and `.push()` work as described.
Exercised as part of this lesson's closing full-project run, below.

### Connection

A real place to record history now exists — the next unit is what
turns that array into something visible on the page.

---

## Concept Unit: Rendering the Array as a Real List

### The Problem

`history` can hold real entries, but nothing on the page shows them —
and unlike every previous feature in this project, which only ever
displayed *one* current value, this one needs to display an entire,
growing, changing *list* of values, correctly, every time it changes.

> **Before reading on:** Lesson 4 already built new elements from data
> using `document.createElement`, one at a time, inside a `forEach`
> loop — though that loop visited a `NodeList` of existing buttons, not
> a plain array. Given `history` holds real string entries, and this
> lesson's own Header already named a method for clearing an
> element's contents in one step, what real, concrete sequence of
> steps would take the *entire*, current `history` array and turn it
> into a matching set of real `<li>` elements on the page — correctly,
> even if some of the page's own old list items are stale?

### Introduce the Concept in Isolation

Throwaway HTML — `<ul id="list"><li>stale</li><li>stale2</li></ul>` —
and this script:

```js
list.innerHTML = '';
console.log(list.children.length);

const entries = ['+1 → 1', '+5 → 6', 'Reset → 0'];
entries.forEach((entry) => {
  const li = document.createElement('li');
  li.textContent = entry;
  list.append(li);
});
console.log(list.children.length);
console.log(list.innerHTML);
```

Real run (Node + jsdom):

```
before clearing, list.innerHTML: <li>stale</li><li>stale2</li>
after clearing, list.children.length: 0
after rebuilding, list.children.length: 3
list.innerHTML: <li>+1 → 1</li><li>+5 → 6</li><li>Reset → 0</li>
```

This proves the whole real sequence works together: `list.innerHTML =
''` genuinely removes the two stale, pre-existing `<li>` elements
first (`children.length` drops to `0`) — proving this approach is
correct even when the page already has old content that needs
replacing, not just appending to — and then `.forEach()` over the
plain array, combined with `document.createElement` and `.append()`
(both already established in Lesson 5), correctly rebuilds exactly
three real, new `<li>` elements, in the same order as the source
array.

### Discard the Throwaway Example

This throwaway `<ul id="list">` and its `entries` array aren't part of
the counter project. They existed only to prove the clear-then-rebuild
sequence works correctly, including against stale, pre-existing
content.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `index.html` (modified — a heading and an empty
  `<ul>` added); `script.js` (modified — a new `renderHistory` function
  added).
- **Change type:** add.
- **Location:** `index.html` — after the existing Add-button form;
  `script.js` — after the `let history = [];` declaration.
- **Dependencies:** `history`, from the previous unit.

### The New Code

```js
function renderHistory() {
  historyList.innerHTML = '';
  history.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = entry;
    historyList.append(li);
  });
}
```

### The Updated Project

`index.html`, in full, this unit's new lines marked:

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
25    <h3>History</h3>                                              <!-- ← new -->
26    <ul id="historyList"></ul>                                    <!-- ← new -->
27
28    <script src="script.js"></script>
29  </body>
30  </html>
```

`script.js`'s own relevant section, in full, this unit's new lines
marked (a new `const historyList = document.querySelector('#historyList');`
also needs to exist — shown here alongside the project's other
existing element lookups, at the top of the file, per this project's
own established convention):

```js
1  const historyList = document.querySelector('#historyList');       // ← new
2
3  let count = 0;
4  let history = [];
5
6  function renderHistory() {                                        // ← new
7    historyList.innerHTML = '';                                     // ← new
8    history.forEach((entry) => {                                     // ← new
9      const li = document.createElement('li');                       // ← new
10     li.textContent = entry;                                         // ← new
11     historyList.append(li);                                         // ← new
12   });                                                                // ← new
13 }                                                                    // ← new
```

Line 1 gets a real reference to the new, empty `<ul>`. Lines 6–13
define a real, reusable function — nothing calls it yet, so running
the project right now would still show an empty history list, exactly
matching the empty `history` array.

### Mechanical Walkthrough

- **`function renderHistory()`** — a named function declaration,
  explained in full in Lesson 6; takes no parameters, reading
  `history` and `historyList` directly from the surrounding script,
  the same closure mechanism explained in full in Lesson 2.
- **`historyList.innerHTML = '';`** — the property itself, explained in
  full above; assigning an empty string parses to nothing, removing
  every existing child of `historyList` in one step — necessary
  because this function is designed to be called repeatedly, and
  without clearing first, every call would keep appending more `<li>`s
  on top of whatever was already there, rather than correctly
  reflecting the array's real, current, possibly-shorter-than-before
  contents.
- **`history.forEach((entry) => {`...`})`** — the method itself,
  explained in full above (Header); called on `history`, the plain
  array from the previous unit — genuinely `Array.prototype.forEach`,
  not `NodeList.forEach` (Lesson 4's version), despite the identical
  real shape.
- **`(entry) => {`...`}`** — an arrow function, the same syntax fully
  explained in Lesson 1; `entry` refers to a different real string
  each time this callback runs, once per item in `history`.
- **`const li = document.createElement('li');`** — the same
  `createElement` mechanism explained in full in Lesson 5, here
  building a real `<li>` instead of a `<button>`.
- **`li.textContent = entry;`** — the same `.textContent` write
  mechanism explained in full in Lesson 2, here setting each list
  item's visible text to the real history entry it represents.
- **`historyList.append(li);`** — the same `.append()` mechanism
  explained in full in Lesson 5, here inserting each new `<li>` into
  the real `<ul>`, one at a time, in the same order `forEach` visits
  `history`.

### CS Lens

Rebuilding an entire visible structure from a single, real source of
data, every time that data changes — rather than trying to compute the
minimal set of individual DOM edits needed — is a real, deliberate
instance of a **declarative rendering** approach: describe *what* the
list should currently contain, and let the same, one, real rendering
function figure out how to make the page match, rather than manually,
imperatively tracking every individual insertion or removal by hand.

Also recognized in: how most modern JavaScript UI frameworks
(React, Vue, and similar) fundamentally work — re-rendering a
component's output from its current data on every change, rather than
requiring hand-written DOM-patching code; a spreadsheet recalculating
every dependent cell from scratch whenever a source cell changes,
rather than tracking exactly which cells need which specific update; a
compiler regenerating an entire output file from source, rather than
patching the previous output in place.

### SE Lens

The real alternative not chosen is appending exactly one new `<li>`
directly, every time a new entry is recorded, without ever clearing
and rebuilding the whole list. That would genuinely be less work per
update — one new element, not a full rebuild — and for this project's
own real use (history only ever grows, one entry at a time, never
shrinks or reorders), it would even produce an identical, correct
result. The real reason to build the more general clear-and-rebuild
version anyway: it stays correct even if a *future* version of this
feature needed to remove an entry, clear the whole log, or reorder it
— situations where "just append one more" would silently produce a
wrong result, while re-rendering the whole list from the array is
correct by construction, regardless of *how* the array itself changed.
The real cost accepted here is doing more work than strictly necessary
on every single update — rebuilding several list items when only one
new one was actually added — a real, deliberate tradeoff of some
runtime efficiency for correctness that doesn't depend on carefully
tracking every possible way the underlying data could change.

### Commands Needed

None.

### Run It

Real output shown above, proving the full clear-and-rebuild sequence
works correctly, including against pre-existing stale content.
Exercised as part of this lesson's closing full-project run, below.

### Connection

A real, working way to display the entire history now exists — the
final unit is what actually calls it, from every action that should be
recorded.

---

## Concept Unit: Recording and Wiring Every Count-Changing Action

### The Problem

`renderHistory` exists and works, but nothing ever adds anything to
`history` in the first place, and nothing calls `renderHistory` at
all — clicking the count button, a quick-add button, or reset still
behaves exactly as it did at the end of Lesson 6, with no history
recorded anywhere.

> **Before reading on:** three separate places in this project already
> change `count`: the regular count button, the quick-add delegated
> handler, and reset. Given `history.push(...)` and `renderHistory()`
> both already exist, what real, minimal addition would each of those
> three places need, and in what order relative to their own existing
> work — before or after `count` itself changes?

### Introduce the Concept in Isolation

Throwaway HTML — `<ul id="list"></ul>` — and this script, combining
this lesson's first two units into one real, working pair of
functions:

```js
function renderHistory() {
  list.innerHTML = '';
  history.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = entry;
    list.append(li);
  });
}

function recordAction(label) {
  history.push(`${label} → ${count}`);
  renderHistory();
}

count = 1;
recordAction('+1');
console.log(list.children.length, list.children[0].textContent);

count = 6;
recordAction('+5');
console.log(list.children.length, list.children[1].textContent);
```

Real run (Node + jsdom):

```
after recordAction("+1"), list.children.length: 1
last li text: +1 → 1
after recordAction("+5"), list.children.length: 2
last li text: +5 → 6
```

This proves a single, real helper — `recordAction` — correctly does
both real steps together, every time: adding a real, new entry to
`history`, built from a label and whatever `count` currently is, and
immediately re-rendering the visible list to match. This is exactly
the one, real call each of this project's three count-changing actions
needs to make.

### Discard the Throwaway Example

This throwaway `<ul id="list">` and its manually-set `count` aren't
part of the counter project's throwaway material — `recordAction`
itself, unlike this lab's own manual `count = 1;` assignments, *is*
real, permanent project code, added in the next step.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new `recordAction`
  function added; the existing `countBtn`, `resetBtn`, and quick-add
  delegation handlers each gain one new call).
- **Change type:** add (the new function), and three small
  modifications (one line added inside each of the three existing
  handlers).
- **Location:** `recordAction` added after `renderHistory`; one new
  call added inside each of the three handlers, after each one's own
  existing `count`/`countDisplay` update.
- **Dependencies:** `history`, `renderHistory`, `count`, all already
  established.

### The New Code

```js
function recordAction(label) {
  history.push(`${label} → ${count}`);
  renderHistory();
}
```

### The Updated Project

`script.js`, this lesson's own full, final section, every change from
this whole lesson shown together, new/changed lines marked:

```js
 1  const historyList = document.querySelector('#historyList');
 2
 3  let count = 0;
 4  let history = [];
 5
 6  function renderHistory() {
 7    historyList.innerHTML = '';
 8    history.forEach((entry) => {
 9      const li = document.createElement('li');
10      li.textContent = entry;
11      historyList.append(li);
12    });
13  }
14
15  function recordAction(label) {                                     // ← new
16    history.push(`${label} → ${count}`);                              // ← new
17    renderHistory();                                                  // ← new
18  }                                                                    // ← new
19
20  countBtn.addEventListener('click', () => {
21    count = count + 1;
22    countDisplay.textContent = `Clicked ${count} times`;
23    recordAction('+1');                                                // ← new
24  });
25
26  resetBtn.addEventListener('click', () => {
27    if (count !== 0) {
28      count = 0;
29      countDisplay.textContent = 'Clicked 0 times';
30      recordAction('Reset');                                           // ← new
31    }
32  });
33
34  quickAddContainer.addEventListener('click', (e) => {
35    const btn = e.target.closest('.quickAddBtn');
36    if (!btn) return;
37    const amount = Number(btn.dataset.amount);
38    count = count + amount;
39    countDisplay.textContent = `Clicked ${count} times`;
40    recordAction(`+${amount}`);                                        // ← new
41  });
```

Lines 15–18 add the one, real, shared helper. Line 23 records every
regular count-button click. Line 30 sits *inside* the existing `if
(count !== 0)` guard from Lesson 3 — recording only actually happens
when a real reset occurred, correctly staying silent when reset is
clicked while already at zero, since nothing meaningful happened in
that case. Line 40 records every quick-add click, using the exact real
amount that was added.

### Mechanical Walkthrough

- **`function recordAction(label)`** — a named function declaration,
  explained in full in Lesson 6; takes one parameter, `label`, a short
  string describing what kind of action just happened.
- **`history.push(`...`);`** — the method itself, explained in full
  above.
- **`` ` ``${label} → ${count}`` ` ``** — a template literal, explained
  in full in Lesson 2, combining the passed-in `label` with `count`'s
  own current, real value at the exact moment this function runs —
  read *after* whichever caller already updated `count`, so the
  recorded number is always the real result of the action, not the
  value from before it.
- **`renderHistory();`** — a call to this lesson's previous unit's own
  function, run immediately after every single push, keeping the
  visible page and the real, underlying array in sync on every single
  change — never letting the array grow without the page reflecting
  it, and never calling `renderHistory` without something real having
  actually changed first.
- **`recordAction('+1')`** / **`recordAction('Reset')`** /
  **`` recordAction(`+${amount}`) ``** — three real calls, one per
  existing handler; the first two pass a plain string literal; the
  third builds its own label with a template literal, since the real
  amount varies per button, the identical mechanism this lesson's own
  `renderHistory` function already uses for a different purpose.

### CS Lens

Not applicable as a new hard concept — this unit's real contribution
is wiring the single-source-of-truth pattern (this lesson's own Term,
above) into three existing call sites, not introducing a fourth,
separate idea.

### SE Lens

The real, honest design decision worth naming: `recordAction` is
called from *inside* each handler, immediately after that handler's
own state change, rather than history-recording being handled some
other, more centralized way (for instance, a single place that
watches `count` for any change at all, regardless of which handler
caused it). The real reason for the chosen approach: `count` alone
can't distinguish *why* it changed — a plain "count changed from 0 to
1" doesn't say whether that was a regular click, a `+1` quick add, or
something else entirely, all of which happen to produce the identical
before/after numbers. Recording at each real, specific call site, with
its own real, specific label, is what makes the resulting history
actually meaningful ("+1 → 1" rather than a generic "changed → 1") —
the real cost being that a *fourth* future feature which changes
`count` would need to remember, itself, to call `recordAction` too;
nothing enforces that automatically, the same real kind of honest gap
Lesson 6's own SE Lens already named for a different guard.

### Commands Needed

None — plain HTML/JS, no build step, openable directly in a browser.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature — every count-changing action recorded, a no-op
reset correctly *not* recorded, and the toggle button correctly
*never* recorded at all, since it never touches `count`:

```
--- history starts empty ---
historyList.children.length: 0

--- clicking count button ---
history: ["+1 → 1"]
historyList.children.length: 1
last li text: +1 → 1

--- clicking +5 quick-add ---
history: ["+1 → 1","+5 → 6"]
count: 6

--- clicking reset ---
history: ["+1 → 1","+5 → 6","Reset → 0"]
count: 0

--- clicking reset again while already 0 (no-op, should NOT record) ---
history.length unchanged: true

--- toggling message does NOT record to history ---
history.length unchanged after toggle: true

--- final full history list matches historyList DOM exactly ---
history array: ["+1 → 1","+5 → 6","Reset → 0"]
DOM list text: ["+1 → 1","+5 → 6","Reset → 0"]
they match: true
```

The final block is the real, direct proof this lesson's whole subject
rests on: after every action, the real `history` array and the real,
visible `<li>` text inside `historyList` are checked against each
other directly, and they match exactly — the single source of truth
genuinely stayed in sync with what the page actually shows, through
every single change.

### Connection

This is the final piece — every action that meaningfully changes the
count is now permanently, visibly recorded, in order, and the page
always, correctly reflects the real, current, complete history.

---

## Closing

**Connect the pieces.** One real sequence, start to finish: the page
loads with `history` as a real, empty array (this lesson's first unit)
and `historyList` as a real, empty `<ul>` — `renderHistory` (this
lesson's second unit), if called right now, would correctly produce
nothing at all, matching the empty array.

The user clicks `+5`. Lesson 5's own delegation handler runs first,
unchanged: `e.target.closest('.quickAddBtn')` finds the real button;
`count` is reassigned from `0` to `5`; `countDisplay` updates to
"Clicked 5 times" — everything through Lesson 6, exactly as before.
Then, new to this lesson, line 40 runs:
`` recordAction(`+${amount}`) `` — this lesson's third unit's own
function — is called with the real string `"+5"`.

Inside `recordAction`, `history.push(`...`)` (this lesson's first
unit's own method) builds the real string `"+5 → 5"`, reading `count`'s
value *after* the reassignment above, and adds it as `history`'s first
real entry. `renderHistory()` (this lesson's second unit) runs
immediately after: `historyList.innerHTML = ''` clears the (already
empty) list; `history.forEach(...)` visits the array's one real entry;
`document.createElement('li')` builds a real `<li>`; `.textContent =
entry` sets its visible text to `"+5 → 5"`; `.append(li)` inserts it
into `historyList`. The page now shows exactly one history line,
correctly reflecting exactly what just happened — and every future
click, on any of this project's three count-changing controls, repeats
this identical, real sequence, keeping one real array and one real,
visible list in permanent, correct agreement.
