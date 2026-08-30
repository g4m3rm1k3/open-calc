# Lesson 9: Deriving Facts Instead of Tracking Them

- **What you will build.** A real stats panel — total number of
  actions, net change across all of them, and how many were resets —
  computed fresh from `history` every time it changes, rather than
  tracked as separate counters updated by hand. The transferable
  problem: every new fact this project has ever needed about its own
  state, up through Lesson 8, was tracked by adding a new variable and
  remembering to update it in exactly the right places. This lesson's
  three new facts are all already fully determined by data this
  project already has — `history` itself — and the real subject here
  is computing them directly from that data, on demand, rather than
  inventing three more variables that would need to be kept correct by
  hand, forever, alongside everything else.

- **What you need to know first.** Lesson 8's `history` array of
  objects (`{ label, amount, resultingCount }`) and dot-notation field
  access. Lesson 7's `.push()` and the single-source-of-truth
  principle — this lesson extends that principle one step further.

- **Terms used in this lesson**

  - **Derived state** — a value that is always fully computable from
    other, already-existing data, rather than being independently
    stored and independently updated. It exists as the natural
    consequence of the single-source-of-truth principle (Lesson 7):
    once some data is the real source of truth, anything that can be
    calculated *from* that data shouldn't also be stored separately —
    doing so would create a second copy of information the first copy
    already fully determines, with the same real risk of the two
    quietly disagreeing that motivated single-source-of-truth in the
    first place.

- **Objects and methods used**

  - **`document.querySelector(selector)`** *(reappearing — full
    treatment restated)*
    - *What it is:* a method that searches the DOM tree for the first
      element matching a CSS selector.
    - *Implementation:* takes one string argument and returns either
      the first matching `Element`, or `null`.
    - *Its use:* this lesson needs three more real element references
      — one per stat this lesson displays.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* search the live DOM tree once, using the given
      selector, and hand back a real reference to the first match.
    - *Depends on:* a valid CSS selector string, and a DOM tree already
      built.
    - *Connects to:* called on `document`; each `Element` returned is
      written to directly by `renderStats`, below.
    - *Shape:* a public read API.

  - **`Array.prototype.reduce(callback, initialValue)`**
    - *What it is:* a method, on any array, that combines every
      element into a single, real result by repeatedly applying a
      callback, carrying an accumulated value forward from one element
      to the next.
    - *Implementation:* takes a callback and a starting value; the
      callback itself receives the accumulated value so far and the
      current element, and returns the new accumulated value; `reduce`
      calls this callback once per array element, in order, starting
      from the given initial value, and returns whatever the callback
      returned on its final call — on an empty array, it simply
      returns the initial value untouched, since the callback never
      runs at all.
    - *Its use:* this is the real mechanism that turns an entire array
      of individual deltas into one, single number — the net change
      across every recorded action, whatever their number or sign.
    - *Type:* an instance method on any array.
    - *Responsibility:* visit every element in order, carrying one
      running value forward and letting the callback fold each element
      into it, and hand back the final, single, combined result.
    - *Depends on:* an array to be called on, a callback describing how
      to combine one more element into the running value, and a real
      starting value for that running total.
    - *Connects to:* called on `history`, inside `renderStats`, below;
      its real, single numeric result is written directly into the
      page.
    - *Shape:* an aggregation API — genuinely different in shape from
      `.forEach` (Lessons 4 and 7), which visits every element but
      produces no combined result at all.

  - **`Array.prototype.filter(callback)`**
    - *What it is:* a method, on any array, that returns a *new* array
      containing only the elements for which a given callback returns
      `true`.
    - *Implementation:* takes one callback, called once per element;
      elements for which it returns a truthy value are included, in
      order, in a real, new array; elements for which it returns a
      falsy value are excluded entirely — the original array is never
      modified.
    - *Its use:* this is the real mechanism that isolates exactly the
      `'Reset'`-labeled entries out of the full history, so their
      count can be reported separately from everything else.
    - *Type:* an instance method on any array.
    - *Responsibility:* visit every element and produce a real, new,
      possibly-shorter array containing only the ones the callback
      accepts — nothing about combining values into one result, the
      way `.reduce` does; strictly selection.
    - *Depends on:* an array to be called on, and a callback that
      decides, per element, whether to keep it.
    - *Connects to:* called on `history`, inside `renderStats`; the
      new array it returns is read for its own `.length`, the real
      number of matching entries.
    - *Shape:* a selection API — a real, different real shape from
      both `.forEach` (visits, returns nothing) and `.reduce`
      (combines everything into one value); `.filter` visits and keeps
      a real subset, still as a real array.

---

## Concept Unit: Selecting the Stats Elements

### The Problem

Before any stat can be displayed, the script needs real references to
the three elements meant to show them.

> **Before reading on:** you've written this exact lookup many times
> now. Given `<p id="totalActions">`, `<p id="netChange">`, and
> `<p id="resetCount">` all exist in the HTML, what would you type,
> without looking anything up, to get real references to all three?

### Introduce the Concept in Isolation

A fresh throwaway lab, against a new element:

```js
const found = document.querySelector('#s');
console.log(found.tagName);
```

Against a throwaway `<p id="s">stats</p>`. Real run (Node + jsdom):

```
found: true | tagName: P
```

This reconfirms the lookup mechanism, unchanged from every previous
use in this curriculum.

### Discard the Throwaway Example

This throwaway `<p id="s">` isn't part of the counter project. It
existed only to reconfirm the lookup mechanism before selecting the
three real stats elements.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `index.html` (modified — a new stats panel
  added, after the Undo button); `script.js` (modified — three new
  `const` declarations added).
- **Change type:** add.
- **Location:** `index.html` — after `<button id="undoBtn">`;
  `script.js` — after the existing `undoBtn` declaration.
- **Dependencies:** none new.

### The New Code

```js
const totalActionsEl = document.querySelector('#totalActions');
const netChangeEl = document.querySelector('#netChange');
const resetCountEl = document.querySelector('#resetCount');
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
25    <h3>History</h3>
26    <ul id="historyList"></ul>
27    <button id="undoBtn">Undo</button>
28
29    <div id="stats">                                              <!-- ← new -->
30      <p id="totalActions">Total actions: 0</p>                   <!-- ← new -->
31      <p id="netChange">Net change: 0</p>                         <!-- ← new -->
32      <p id="resetCount">Resets: 0</p>                             <!-- ← new -->
33    </div>                                                         <!-- ← new -->
34
35    <script src="script.js"></script>
36  </body>
37  </html>
```

`script.js`'s own relevant section, in full, this unit's new lines
marked:

```js
1  const historyList = document.querySelector('#historyList');
2  const undoBtn = document.querySelector('#undoBtn');
3  const totalActionsEl = document.querySelector('#totalActions');   // ← new
4  const netChangeEl = document.querySelector('#netChange');         // ← new
5  const resetCountEl = document.querySelector('#resetCount');       // ← new
```

### Mechanical Walkthrough

- **`const`** — declares a binding that won't be reassigned; explained
  in full in Lesson 1.
- **`totalActionsEl`** / **`netChangeEl`** / **`resetCountEl`** — the
  three new variable names, each describing what it holds; suffixed
  `El` to distinguish them from the real, computed values they'll
  display, which this lesson's next units compute separately.
- **`=`** — the assignment operator, explained in full in Lesson 1.
- **`document`** — the global page object, explained in full in
  earlier lessons.
- **`.querySelector`** — the method itself, explained in full above.
- **`(`...`)`** — call syntax, three separate times.
- **`'#totalActions'`** / **`'#netChange'`** / **`'#resetCount'`** —
  string literal CSS selectors; the identical `#id` mechanism used
  throughout this curriculum.
- **`;`** — statement terminator, three times.

### CS Lens

Not applicable beyond this curriculum's own already-covered concept —
element selection by CSS selector.

### SE Lens

The same real tradeoff already named repeatedly: selecting by a stable
`id` keeps each lookup correct regardless of page structure, at the
cost of three more elements now carrying unique `id`s.

### Commands Needed

None.

### Run It

Exercised as part of this lesson's closing full-project run, below.

### Connection

This unit gets the three new references this lesson needs — the next
two units are what actually compute the real values to put in them.

---

## Concept Unit: Combining Every Entry into One Number with `reduce`

### The Problem

`history` holds every action's own real `amount`, but nothing yet
combines all of them into one real, single total — a real net change
across the whole history, whatever its length or mix of positive and
negative deltas.

> **Before reading on:** you've already used `.forEach` (Lessons 4 and
> 7) to visit every element in an array, and `.filter` — named in this
> lesson's own Header — to keep only some of them. Given every history
> entry has a real `amount` field, and you need one, single, real
> number that's the sum of *all* of them, what real, running value
> would you need to carry forward from one entry to the next, and what
> would it need to start at, before any entry has been added to it?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
const history = [
  { label: '+1', amount: 1, resultingCount: 1 },
  { label: '+5', amount: 5, resultingCount: 6 },
  { label: 'Reset', amount: -6, resultingCount: 0 },
  { label: '+10', amount: 10, resultingCount: 10 },
];
const netChange = history.reduce((sum, entry) => {
  console.log(`accumulating: sum=${sum} + entry.amount=${entry.amount} -> ${sum + entry.amount}`);
  return sum + entry.amount;
}, 0);
console.log('final netChange:', netChange);
console.log([].reduce((sum, entry) => sum + entry.amount, 0));
```

Real run (Node):

```
accumulating: sum=0 + entry.amount=1 -> 1
accumulating: sum=1 + entry.amount=5 -> 6
accumulating: sum=6 + entry.amount=-6 -> 0
accumulating: sum=0 + entry.amount=10 -> 10
final netChange: 10
reduce on empty array with initial value 0: 0
```

This is a real execution trace over changing state, one line per real
call to the callback:

- `sum=0 + entry.amount=1 -> 1` — caused by `reduce`'s own starting
  value, `0` (the second argument), being the very first `sum` the
  callback ever sees, combined with the first entry's real `amount`,
  `1`.
- `sum=1 + entry.amount=5 -> 6` — caused by the callback's own
  previous return value, `1`, becoming `sum` on this next call,
  combined with the second entry's real `amount`, `5`.
- `sum=6 + entry.amount=-6 -> 0` — the same mechanism, now adding a
  real, negative amount (the Reset entry's own recorded delta,
  established in Lesson 8), correctly bringing the running total back
  toward zero.
- `sum=0 + entry.amount=10 -> 10` — the same mechanism, one final
  time, producing `reduce`'s own final, real return value.

The empty-array case, `[].reduce((sum, entry) => sum + entry.amount, 0)`
correctly returning `0`, proves `reduce` never even calls the callback
when there's nothing to visit — it simply hands back the given initial
value untouched, exactly the correct real answer for "the net change
of zero actions."

### Discard the Throwaway Example

This throwaway `history` array isn't part of the counter project's own
data — the real `reduce` call this lab proves correct is added, for
real, in the next step.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new `renderStats`
  function added).
- **Change type:** add.
- **Location:** after `renderHistory`.
- **Dependencies:** `history`, already established.

### The New Code

```js
const netChange = history.reduce((sum, entry) => sum + entry.amount, 0);
```

### The Updated Project

`script.js`'s own new function, in full, this unit's new line marked
(the two other stats this function will eventually compute are added
in the next unit — this unit's own real contribution is line 3 alone):

```js
1  function renderStats() {
2    const totalActions = history.length;
3    const netChange = history.reduce((sum, entry) => sum + entry.amount, 0);  // ← new
4  }
```

Line 2, `history.length`, is already an established mechanism (first
covered on `NodeList` in Lesson 4, general to any real array) — shown
here as this function's very first real stat, computed with no new
method at all. Line 3 is this unit's own real subject: the net change
across every entry, computed in one real expression.

### Mechanical Walkthrough

- **`const netChange = `...`;`** — the declaration and assignment,
  explained in full in Lessons 1 and 2.
- **`history`** — the array, already established.
- **`.reduce`** — the method itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `reduce` with two arguments.
- **`(sum, entry) => sum + entry.amount`** — an arrow function,
  explained in full in Lesson 1; here written without braces, since its
  entire body is a single expression whose value is automatically
  returned — the same shorthand form Lesson 1's own `shout` isolated
  lab first demonstrated, reused here for the first time inside this
  actual project; `sum` is the running total `reduce` carries forward;
  `entry` is the current history object; `entry.amount`, dot-notation
  field access, explained in full in Lesson 8, reads that entry's own
  real delta.
- **`,`** — separates `reduce`'s two arguments.
- **`0`** — the initial value; chosen specifically because `0` is the
  real, correct starting point for a running sum — adding zero to
  the first real entry's own amount changes nothing, exactly as a sum
  of zero terms should be zero.

### CS Lens

Combining every element of a collection into a single, accumulated
result — carrying a running value forward, one element at a time — is
the general shape of a **fold** (also called reduction, hence the real
method name): the same conceptual family the trace above proved
concretely, generalized beyond just summing numbers to any way of
combining a running value with the next element.

Also recognized in: a spreadsheet's own `SUM` function, folding every
cell in a range into one total; a shopping cart's own subtotal,
combining every line item's own price; a compiler folding a whole
source file's tokens into one final parsed result; the general
mathematical idea of folding a list, which the method's real name
directly comes from.

### SE Lens

The real alternative not chosen is a plain `for` loop with a
hand-declared running-total variable, initialized before the loop and
manually reassigned inside it — real, equally correct code, and
arguably more familiar to someone coming from a language without
`.reduce`. The real cost of that alternative: it needs a mutable
variable (`let total = 0;`) declared *outside* the loop, whose own
correctness depends on nobody accidentally reading or reassigning it
mid-loop, plus real, separate loop-control syntax (`for (let i = 0;
...)`) that has nothing to do with the actual computation being
performed. `.reduce` bundles the entire operation — start value, how
to combine each element, and the iteration itself — into one real,
self-contained expression, with no loose, mutable variable living
outside it at all.

### Commands Needed

None.

### Run It

Real output shown above, including the real accumulator trace and the
empty-array case. Exercised as part of this lesson's closing
full-project run, below.

### Connection

Net change can now be computed correctly from any real history — the
next unit is what isolates one specific kind of entry to count
separately.

---

## Concept Unit: Isolating a Subset with `filter`

### The Problem

`renderStats` can now compute how many total actions happened, and
their combined net effect — but nothing yet answers a narrower, real
question: specifically how many of those actions were resets, as
opposed to any other kind.

> **Before reading on:** given every history entry has a real `label`
> field, and a Reset entry's own `label` is always exactly the string
> `'Reset'` (established in Lesson 8), what real, single condition
> would need to be true for one entry to count as a reset? Given
> `.filter`, named in this lesson's own Header, keeps only entries a
> callback accepts, what would that callback need to check?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
const history = [
  { label: '+1', amount: 1, resultingCount: 1 },
  { label: 'Reset', amount: -1, resultingCount: 0 },
  { label: '+5', amount: 5, resultingCount: 5 },
  { label: 'Reset', amount: -5, resultingCount: 0 },
];
const resets = history.filter((entry) => entry.label === 'Reset');
console.log(history.length, resets.length, resets);
console.log([].filter((entry) => entry.label === 'Reset'));
```

Real run (Node):

```
original length: 4
filtered (Reset only) length: 2
filtered contents: [{"label":"Reset","amount":-1,"resultingCount":0},{"label":"Reset","amount":-5,"resultingCount":0}]
filter on empty array: [] | length: 0
```

This proves `.filter` genuinely keeps only the two real entries whose
`label` matches `'Reset'`, discarding the other two entirely — the
original array's own length (`4`) is untouched, since `.filter`
produces a real, new array rather than modifying the one it's called
on. The empty-array case correctly produces an empty result, with no
error.

### Discard the Throwaway Example

This throwaway `history` array isn't part of the counter project's own
data — the real `.filter` call this lab proves correct is added, for
real, in the next step.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `renderStats` gains its
  own second computed value, and its own three real, final
  `.textContent` writes).
- **Change type:** add.
- **Location:** inside `renderStats`, after the `netChange` line from
  the previous unit.
- **Dependencies:** `history`, already established;
  `totalActionsEl`/`netChangeEl`/`resetCountEl`, from this lesson's
  first unit.

### The New Code

```js
const resets = history.filter((entry) => entry.label === 'Reset');
totalActionsEl.textContent = `Total actions: ${totalActions}`;
netChangeEl.textContent = `Net change: ${netChange}`;
resetCountEl.textContent = `Resets: ${resets.length}`;
```

### The Updated Project

`script.js`'s own `renderStats` function, in full and final for this
lesson, new lines marked:

```js
1  function renderStats() {
2    const totalActions = history.length;
3    const netChange = history.reduce((sum, entry) => sum + entry.amount, 0);
4    const resets = history.filter((entry) => entry.label === 'Reset');  // ← new
5    totalActionsEl.textContent = `Total actions: ${totalActions}`;       // ← new
6    netChangeEl.textContent = `Net change: ${netChange}`;                // ← new
7    resetCountEl.textContent = `Resets: ${resets.length}`;               // ← new
8  }
```

Lines 2–4 now compute all three real stats this lesson set out to
build. Lines 5–7 write each one onto the page, using the same
`.textContent` and template-literal mechanisms established in Lesson
2, reused three times here. `renderStats` itself is complete — the
next unit is what actually calls it, from every place `count` and
`history` already change.

### Mechanical Walkthrough

- **`const resets = `...`;`** — the declaration, explained in full in
  Lesson 1.
- **`history.filter`** — the method itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `filter` with one argument.
- **`(entry) => entry.label === 'Reset'`** — an arrow function, the
  same braceless, single-expression shorthand this lesson's previous
  unit already established; `entry.label`, dot-notation field access,
  explained in full in Lesson 8; `===`, explained in full in Lesson 6;
  `'Reset'`, a string literal matching the exact label Lesson 8's own
  `recordAction('Reset', -count)` call already produces.
- **`totalActionsEl.textContent = `...`;`** / **`netChangeEl.textContent
  = `...`;`** / **`resetCountEl.textContent = `...`;`** — the same
  `.textContent` write mechanism established in Lesson 2, here writing
  three separate, real computed values, each built with a template
  literal, the identical mechanism also established in Lesson 2.
- **`resets.length`** — the already-established `.length` property,
  read here off the real, filtered array — the actual count of
  matching entries, not the entries themselves.

### CS Lens

Not applicable as a new hard concept beyond what's already established
in this same unit (filtering) and this lesson's previous unit
(reducing) — this unit's real contribution is completing
`renderStats`, not introducing a fourth, separate idea.

### SE Lens

The real alternative not chosen is folding the reset-counting logic
into the same single `.reduce` call already computing `netChange` —
tracking two running values at once (a sum, and a separate reset
tally) inside one, more complicated accumulator object, rather than
two, separate, simpler calls. That would technically visit `history`
only once instead of twice, real, marginal efficiency gained — at the
real cost of a `.reduce` callback doing two genuinely unrelated jobs
at once, harder to read and harder to verify independently than two
separate, clearly-named operations, each doing exactly one thing.
Given `history` in this real project is never going to be large enough
for visiting it twice to matter, keeping `.reduce` and `.filter` as two
separate, clearly-scoped calls is the real, deliberate tradeoff of a
small, likely-irrelevant amount of performance for real, meaningful
clarity.

### Commands Needed

None.

### Run It

Real output shown above, proving `.filter` correctly isolates matching
entries, including the empty case. Exercised as part of this lesson's
closing full-project run, below.

### Connection

`renderStats` is now complete and correct — the final unit is what
actually calls it, keeping the stats panel honestly in sync with every
real change to `history`.

---

## Concept Unit: Calling `renderStats` on Every Change

### The Problem

`renderStats` computes and displays all three real stats correctly
when called — but right now, nothing calls it at all. The panel would
sit frozen at "Total actions: 0" forever, regardless of anything the
user actually does.

> **Before reading on:** `history` changes in exactly two real places
> in this project — inside `recordAction` (Lesson 8) and inside
> `undoLastAction` (also Lesson 8), both of which already call
> `renderHistory()` immediately after changing it. Given `renderStats`
> needs to stay honestly in sync with `history` the identical way
> `renderHistory` already does, what would you add, and where,
> relative to each existing `renderHistory()` call?

### Introduce the Concept in Isolation

No new isolated lab — calling one already-proven function
(`renderStats`) from two more places is the identical, already-covered
"function as a reusable, callable unit" mechanism Lesson 6 established
for `addNewQuickAddButton`, applied here to a second function; nothing
about calling it a second and third time from new locations introduces
a new construct to isolate.

### Discard the Throwaway Example

Not applicable.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — one new line added
  inside `recordAction`, one inside `undoLastAction`; one new line
  added near the bottom of the script, alongside `undoBtn.disabled =
  true;`, to correctly initialize the panel at load time).
- **Change type:** add.
- **Location:** immediately after each existing `renderHistory();`
  call.
- **Dependencies:** `renderStats`, from this lesson's previous two
  units.

### The New Code

```js
renderStats();
```

(added, verbatim, in three places — inside `recordAction`, inside
`undoLastAction`, and once, standalone, near the script's own initial
setup)

### The Updated Project

`script.js`, this lesson's own full, final section, every change from
this whole lesson shown together, new lines marked:

```js
 1  const historyList = document.querySelector('#historyList');
 2  const undoBtn = document.querySelector('#undoBtn');
 3  const totalActionsEl = document.querySelector('#totalActions');
 4  const netChangeEl = document.querySelector('#netChange');
 5  const resetCountEl = document.querySelector('#resetCount');
 6
 7  let count = 0;
 8  let history = [];
 9
10  function renderHistory() {
11    historyList.innerHTML = '';
12    history.forEach((entry) => {
13      const li = document.createElement('li');
14      li.textContent = `${entry.label} → ${entry.resultingCount}`;
15      historyList.append(li);
16    });
17  }
18
19  function renderStats() {
20    const totalActions = history.length;
21    const netChange = history.reduce((sum, entry) => sum + entry.amount, 0);
22    const resets = history.filter((entry) => entry.label === 'Reset');
23    totalActionsEl.textContent = `Total actions: ${totalActions}`;
24    netChangeEl.textContent = `Net change: ${netChange}`;
25    resetCountEl.textContent = `Resets: ${resets.length}`;
26  }
27
28  function recordAction(label, amount) {
29    count = count + amount;
30    countDisplay.textContent = `Clicked ${count} times`;
31    history.push({ label, amount, resultingCount: count });
32    renderHistory();
33    renderStats();                                                  // ← new
34    undoBtn.disabled = history.length === 0;
35  }
36
37  // ... countBtn / resetBtn / quickAddContainer handlers, unchanged ...
38
39  function undoLastAction() {
40    if (history.length === 0) return;
41    const last = history.pop();
42    count = count - last.amount;
43    countDisplay.textContent = `Clicked ${count} times`;
44    renderHistory();
45    renderStats();                                                  // ← new
46    undoBtn.disabled = history.length === 0;
47  }
48
49  undoBtn.addEventListener('click', undoLastAction);
50  undoBtn.disabled = true;
51  renderStats();                                                    // ← new
```

Lines 33 and 45 keep the stats panel honestly in sync with `history`,
the moment it changes, in both real directions this project supports
(recording a new action, and undoing one). Line 51 runs once, at
load time, correctly displaying "Total actions: 0 / Net change: 0 /
Resets: 0" from the start, matching `history`'s own real, empty
starting state — the identical initialization role `undoBtn.disabled =
true;`, immediately above it, already plays for a different piece of
UI.

### Mechanical Walkthrough

- **`renderStats();`** — a call to this lesson's own, already fully
  explained function; the same "call a named function" mechanism
  explained in full in Lesson 6, applied here at three real call
  sites, each triggered by a genuine, real change to the data
  `renderStats` itself reads.

### CS Lens

Not applicable — this unit's real contribution is wiring, not a new
idea; the underlying principle (derived state, named in full as a Term
in this lesson's own Header) was already covered by this lesson's
overall existence.

### SE Lens

The real, honest tradeoff recorded here, one final time: `renderStats`
now has to be called, by hand, from every real place `history`
changes — currently two, real, known places, plus one initial call.
Nothing in the language enforces that a *future* third way of changing
`history` would remember to call it too — the identical, honest gap
Lesson 6's own SE Lens and Lesson 8's own SE Lens already named for
different guards in this same project. The real alternative — some
kind of automatic mechanism that re-renders derived state whenever its
own source data changes, with no manual call needed at each site — is
real, and exists in real frameworks (the same "declarative rendering"
idea Lesson 7's own CS Lens already named), but building one from
scratch is real, substantial work this project has deliberately not
taken on; for a project this size, with exactly two places `history`
changes, remembering to add one more line at each site is a real,
acceptable, honest cost.

### Commands Needed

None — plain HTML/JS, no build step, openable directly in a browser.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature — stats correctly tracked through a real sequence of
adds, a reset, an undo of that reset, and undoing everything back to
empty:

```
--- initial stats ---
Total actions: 0 | Net change: 0 | Resets: 0

--- +1, +5, +10 ---
Total actions: 3 | Net change: 16 | Resets: 0
(expect total 3, net change 16, resets 0)

--- reset ---
Total actions: 4 | Net change: 0 | Resets: 1
(expect total 4, net change 0, resets 1)

--- undo the reset ---
Total actions: 3 | Net change: 16 | Resets: 0
(expect total 3, net change 16, resets 0 again)

--- undo everything back to empty ---
Total actions: 0 | Net change: 0 | Resets: 0
(expect total 0, net change 0, resets 0 — matches reduce-on-empty and filter-on-empty from the labs)

--- everything else still independent ---
toggle still works, message hidden: false
```

Every real transition matches its predicted value exactly, including
the final return to a fully empty state — direct, real confirmation
that `renderStats`, `.reduce`, and `.filter` all correctly handle the
empty-array case in the real, running project, not just in this
lesson's own isolated labs.

### Connection

This is the final piece — the stats panel now stays honestly,
automatically correct through every real action this project supports,
computed fresh from `history` every time, never independently tracked.

---

## Closing

**Connect the pieces.** One real sequence, start to finish: the user
has already clicked `+1`, `+5`, and `+10`, and `history` holds three
real entries. The user clicks Reset. Lesson 8's own `recordAction
('Reset', -16)` runs first: `count` becomes `0`; a real object,
`{ label: 'Reset', amount: -16, resultingCount: 0 }`, is pushed;
`renderHistory` rebuilds the visible list.

Then, new to this lesson, line 33 runs: `renderStats()`. Inside it,
`history.length` (line 20) reads `4`, the array's own new, real
length. `history.reduce((sum, entry) => sum + entry.amount, 0)` (this
lesson's second unit) walks all four real entries: `0 + 1 = 1`,
`1 + 5 = 6`, `6 + 10 = 16`, `16 + (-16) = 0` — the real, final net
change, correctly zero, since a reset's own recorded delta is always
exactly the negative of whatever `count` was. `history.filter((entry)
=> entry.label === 'Reset')` (this lesson's third unit) walks the same
four entries and keeps exactly the one whose `label` is `'Reset'` — a
real, new array of length `1`. Lines 23–25 write all three: "Total
actions: 4," "Net change: 0," "Resets: 1" — three real facts, none of
them stored anywhere as their own, independent variable, all three
computed, correctly, fresh, from the one real array this whole project
has been building toward as its single source of truth since Lesson 7.
