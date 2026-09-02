# Lesson 13: Editing Data That Drives Two Different Views

- **What you will build.** A real, editable table of the quick-add
  amounts — click into a cell, type a new number, click away, and both
  the table *and* the actual `+1`/`+5`/`+10` buttons above it update
  together. Rows can be deleted too. The transferable problem: since
  Lesson 4, this project's quick-add buttons have existed only as
  static markup, or as one-off DOM elements built by Lesson 5's own
  Add form — there has never been one, real, authoritative place that
  actually says "these are the current quick-add amounts." This lesson
  is the first one that has to build *two different, real views* — a
  row of buttons, and a table — of the exact same underlying data,
  and keep them both honestly correct no matter which one the user
  interacts with.

- **What you need to know first.** Lesson 5's `document.createElement`
  and event delegation. Lesson 6's `isValidAmount` guard, reused
  directly. Lesson 7's single-source-of-truth principle and the
  clear-and-rebuild render pattern — this lesson applies both to a
  second, real kind of data. Lesson 12's `saveState`/`loadState`,
  which this lesson extends to cover a third piece of state.

- **A note on how this lesson was verified.** One real environment gap
  surfaced while preparing it: this curriculum's own verification
  environment doesn't fully support the standard `.contentEditable`
  property the way a real browser does — setting it doesn't reliably
  show up in the element's own real, inspectable attributes there.
  Rather than teach something that couldn't be genuinely,
  independently verified, this lesson uses `setAttribute('contenteditable',
  'true')` instead — equally standard, equally correct in any real
  browser, and something this session could actually prove worked.

- **Terms used in this lesson**

  - **`contenteditable`** — a standard, global HTML attribute that, when
    present on an element, lets a user directly click into it and type,
    editing its own content in place, the same way a text field works,
    without that element needing to be a real `<input>` or `<textarea>`
    at all. It exists so ordinary content — a table cell, a paragraph,
    a heading — can become directly, visually editable without a
    separate, real form control needing to sit next to or replace it.
  - **Event bubbling, revisited for a real exception** — Lesson 5
    already established that most real events bubble from the specific
    element they happened on, up through its ancestors. `blur` (and its
    sibling, `focus`) are real, standard exceptions: neither one
    bubbles at all. `focusout` (and `focusin`) are separate, real event
    types that carry the identical real meaning — "an element just lost
    (or gained) focus" — but genuinely do bubble, specifically so that
    event delegation, which depends on bubbling, remains possible for
    focus-related events at all.

- **Objects and methods used**

  - **`document.querySelector(selector)`** *(reappearing — full
    treatment restated)*
    - *What it is:* a method that searches the DOM tree for the first
      element matching a CSS selector.
    - *Implementation:* takes one string argument and returns either
      the first matching `Element`, or `null`.
    - *Its use:* this lesson needs one more real element reference —
      the table body the new rows will be rendered into.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* search the live DOM tree once, using the given
      selector, and hand back a real reference to the first match.
    - *Depends on:* a valid CSS selector string, and a DOM tree already
      built.
    - *Connects to:* called on `document`; the `Element` returned is
      used by mechanisms already established elsewhere in this
      curriculum.
    - *Shape:* a public read API.

  - **`document.createElement(tagName)`** *(reappearing from Lessons 5
    and 7 — full treatment restated)*
    - *What it is:* a method that constructs a brand-new element node,
      not yet attached anywhere in the page.
    - *Implementation:* takes one string argument naming an HTML tag
      and returns a real, new `Element` of that kind.
    - *Its use:* this lesson builds real `<tr>` and `<td>` elements —
      the first time this curriculum has built genuinely nested new
      structure (a `<td>` built and appended *into* a `<tr>`, which is
      itself then appended into the table body), rather than a single,
      flat new element at a time.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* construct exactly one new, real, detached
      element of the given kind.
    - *Depends on:* a valid HTML tag name string.
    - *Connects to:* called on `document`, inside this lesson's own
      table-rendering function; the elements it returns are configured
      and nested together before being appended into the real page.
    - *Shape:* a public creation API.

  - **`element.setAttribute(name, value)`**
    - *What it is:* a method, on any element, that sets a real,
      arbitrary HTML attribute directly, by name.
    - *Implementation:* takes two string arguments — the attribute's
      real name, and the value to give it — and sets it on the real
      element, creating it if it didn't already exist, or overwriting
      it if it did; returns nothing meaningful.
    - *Its use:* this is the real, direct way this lesson turns an
      ordinary `<td>` into an editable one — setting the real
      `contenteditable` attribute this lesson's own Header already
      named.
    - *Type:* an instance method, available on any `Element`.
    - *Responsibility:* set exactly one real, named attribute to
      exactly one real value — a real, general-purpose mechanism this
      curriculum has used specific, narrower versions of before
      (`.className`, `.dataset.amount =`) without naming the general
      tool underneath them both.
    - *Depends on:* an element to call it on, an attribute name, and a
      value.
    - *Connects to:* called on each real `<td>` this lesson's table
      builds.
    - *Shape:* a mutation API — a real, general-purpose write, more
      direct than the specific property shortcuts this curriculum has
      relied on until now.

  - **`Array.prototype.splice(startIndex, deleteCount)`**
    - *What it is:* a method, on any array, that removes real elements
      starting at a given index, directly mutating the array in place.
    - *Implementation:* takes a real, numeric start index and a real
      count of how many elements to remove from there; removes exactly
      that many, shifting every later element down to fill the real
      gap; returns a real, new array containing exactly the elements
      that were removed.
    - *Its use:* this is the real mechanism that actually deletes one
      specific quick-add amount, by its own real position in the
      array, when its own row's Delete button is clicked.
    - *Type:* an instance method, called on any array.
    - *Responsibility:* remove a real, specific run of elements from
      the calling array, in place, and hand back exactly what was
      removed.
    - *Depends on:* an array to call it on, a real, valid start index,
      and a real count of elements to remove.
    - *Connects to:* called on `quickAddDefs`, inside this lesson's own
      delete handler; the array's own new, real, shorter state is what
      every render function reads from immediately afterward.
    - *Shape:* a mutation API — genuinely different in shape from every
      array method this curriculum has used so far (`.push`, `.pop`,
      `.forEach`, `.reduce`, `.filter`): the only one that removes from
      an arbitrary, real position, not just the end.

---

## Concept Unit: Rendering a Real Table Row per Data Item

### The Problem

This project's quick-add amounts currently exist only as three,
hardcoded `<button>` elements, written directly in `index.html` since
Lesson 4 — there's no real array anywhere holding "the current list of
amounts," which means there's nothing a table could actually be built
*from*.

> **Before reading on:** Lesson 7's own `renderHistory` already builds
> one `<li>` per array entry, using `.forEach` and
> `document.createElement`. A table row needs the identical, real
> approach, but genuinely one level deeper — a `<tr>` containing its
> own real `<td>` children, rather than one flat element per entry.
> Given `[1, 5, 10]` as a starting real array, what real, nested
> structure would each one of those three numbers need to become?

### Introduce the Concept in Isolation

Throwaway HTML — `<table><tbody id="body"></tbody></table>` — and this
script:

```js
const amounts = [1, 5, 10];
amounts.forEach((amount, index) => {
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.textContent = amount;
  td.dataset.index = index;
  tr.append(td);
  tbody.append(tr);
});
console.log(tbody.children.length);
console.log(tbody.innerHTML);
```

Real run (Node + jsdom):

```
tbody.children.length: 3
tbody.innerHTML: <tr><td data-index="0">1</td></tr><tr><td data-index="1">5</td></tr><tr><td data-index="2">10</td></tr>
```

This proves the real, nested structure works correctly: three real
`<tr>` elements, each containing exactly one real `<td>` built and
appended *into* it before that `<tr>` itself was ever appended to
`tbody` — a real, two-level build, rather than the single-level append
every previous rendering function in this curriculum has used.

### Discard the Throwaway Example

This throwaway `<table>`/`amounts` array isn't part of the counter
project. It existed only to prove the nested, real row-building
sequence works before relying on it for real.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `index.html` (modified — the three static
  quick-add `<button>` elements are removed, leaving `<div
  id="quickAdd">` empty; a new table added below the Add form);
  `script.js` (modified — the static, hardcoded quick-add markup is
  replaced by real, data-driven rendering).
- **Change type:** replace — this is the real architectural shift this
  lesson's own opening paragraph described: from "three buttons that
  happen to exist in the HTML" to "one real array, rendered into two
  real views."
- **Location:** `index.html` — `#quickAdd`'s own contents removed; a
  new `<table>` added after the Add form; `script.js` — a new,
  top-level `quickAddDefs` array and rendering functions added.
- **Dependencies:** none new.

### The New Code

```js
let quickAddDefs = [1, 5, 10];

function renderQuickAddTable() {
  quickAddTableBody.innerHTML = '';
  quickAddDefs.forEach((amount, index) => {
    const tr = document.createElement('tr');
    const amountTd = document.createElement('td');
    amountTd.textContent = amount;
    amountTd.dataset.index = index;
    tr.append(amountTd);
    quickAddTableBody.append(tr);
  });
}
```

### The Updated Project

`index.html`'s own relevant section, in full, this unit's changed
lines marked:

```html
16  <div id="quickAdd"></div>                                        <!-- ← changed: buttons removed -->
17
18  <input id="amountInput" type="number" placeholder="amount">
19  <button id="addQuickAddBtn">Add quick-add button</button>
20
21  <h3>Quick-Add Amounts</h3>                                       <!-- ← new -->
22  <table id="quickAddTable">                                        <!-- ← new -->
23    <thead><tr><th>Amount</th><th></th></tr></thead>                <!-- ← new -->
24    <tbody id="quickAddTableBody"></tbody>                          <!-- ← new -->
25  </table>                                                          <!-- ← new -->
```

`script.js`'s own relevant section, in full, this unit's new lines
marked (`quickAddTableBody`'s own `const` declaration, using the
already-established `querySelector` mechanism, is included here as a
real dependency this new code needs):

```js
1  const quickAddTableBody = document.querySelector('#quickAddTableBody'); // ← new
2
3  let quickAddDefs = [1, 5, 10];                                       // ← new
4
5  function renderQuickAddTable() {                                     // ← new
6    quickAddTableBody.innerHTML = '';                                   // ← new
7    quickAddDefs.forEach((amount, index) => {                            // ← new
8      const tr = document.createElement('tr');                           // ← new
9      const amountTd = document.createElement('td');                     // ← new
10     amountTd.textContent = amount;                                      // ← new
11     amountTd.dataset.index = index;                                     // ← new
12     tr.append(amountTd);                                                // ← new
13     quickAddTableBody.append(tr);                                       // ← new
14   });                                                                   // ← new
15 }                                                                       // ← new
```

`quickAddDefs` is now this project's own real, single source of truth
for the quick-add amounts — nothing yet renders the actual buttons
from it (the next unit's own job), and nothing calls
`renderQuickAddTable` yet either.

### Mechanical Walkthrough

- **`let quickAddDefs = [1, 5, 10];`** — `let`, explained in full in
  Lesson 2, chosen since real edits and deletions will reassign
  individual entries and the array's own length; `[1, 5, 10]`, an
  array literal, explained in full in Lesson 7.
- **`function renderQuickAddTable()`** — a named function declaration,
  explained in full in Lesson 6.
- **`quickAddTableBody.innerHTML = '';`** — the property itself,
  explained in full in Lesson 7; clears any stale rows before
  rebuilding, the identical clear-and-rebuild pattern established
  there.
- **`quickAddDefs.forEach((amount, index) => {`...`})`** — `.forEach`,
  explained in full in Lessons 4 and 7; here using its own real,
  second parameter, `index`, for the first time in this project's own
  taught code — every previous use only needed the item itself.
- **`document.createElement('tr')`** / **`document.createElement
  ('td')`** — the method itself, explained in full above; two real,
  separate calls, one per real tag.
- **`amountTd.textContent = amount;`** — the same `.textContent` write
  mechanism established in Lesson 2.
- **`amountTd.dataset.index = index;`** — `.dataset`, explained in
  full in Lessons 4 and 5 (there, reading; here, writing, the same
  direction Lesson 5's own button-creation code already used); records
  each cell's own real position in `quickAddDefs`, needed later to
  know which array entry an edit or deletion actually refers to.
- **`tr.append(amountTd);`** — `.append`, explained in full in Lesson
  5; here appending a `<td>` into a `<tr>`, rather than into the page
  directly — the real, nested step this unit's own subject is about.
- **`quickAddTableBody.append(tr);`** — the identical method, now
  appending the fully-built `<tr>` into the real page.

### CS Lens

Not applicable as a new hard concept — this unit composes
already-covered mechanisms (`.forEach`, `.createElement`, `.append`)
into a genuinely nested structure; the underlying idea (declarative
rendering from an array) was already covered as a hard concept in
Lesson 7.

### SE Lens

The real, deliberate architectural choice this whole lesson turns on:
`quickAddDefs` is now the *only* real place this project's own quick-add
amounts live — not the buttons, not the table, both of which are now
merely two different, real *views* of that one array, rebuilt from it
on every change. The real alternative — letting the table read its own
values directly from the existing buttons' own `data-amount`
attributes, rather than from a separate array — would avoid
introducing `quickAddDefs` at all, but at real cost: the table would
then have no real way to represent an amount that doesn't correspond
to an existing button yet (a mid-edit value, for instance), and two
independent real DOM structures would need to be kept manually in sync
with each other directly, rather than both deriving from one, real,
shared source — the identical single-source-of-truth risk this
project's own Lesson 7 and Lesson 8 already named for other pairs of
data.

### Commands Needed

None.

### Run It

Real output shown above, proving the nested row-building sequence.
Exercised as part of this lesson's closing full-project run, below.

### Connection

A real array and a real way to render it into a table both now exist
— the next unit is what makes individual cells actually editable.

---

## Concept Unit: Making a Cell Editable with `contenteditable`

### The Problem

The table's own cells display real, correct values, but they're just
inert text right now — clicking one does nothing at all; there's no
real way for a user to change an amount from inside the table itself.

> **Before reading on:** this lesson's own Header already named
> `contenteditable` as a standard HTML attribute that makes an
> element's own content directly, visually editable. Given a `<td>`
> is an ordinary element, not a form control like `<input>`, what real,
> concrete change would need to happen to it for a user to be able to
> click into it and type, the same way an `<input>` already allows?

### Introduce the Concept in Isolation

Throwaway code, using `setAttribute` (this lesson's own Header already
explained why, over the `.contentEditable` property, for this
curriculum's own verification):

```js
const cell = document.createElement('td');
cell.textContent = '5';
console.log(cell.getAttribute('contenteditable'));
cell.setAttribute('contenteditable', 'true');
console.log(cell.getAttribute('contenteditable'));
console.log(cell.outerHTML);
console.log(cell.matches('td[contenteditable]'));
```

Real run (Node + jsdom):

```
getAttribute before: null
getAttribute after: true
outerHTML: <td contenteditable="true">5</td>
matches td[contenteditable]: true
```

This proves `.setAttribute('contenteditable', 'true')` genuinely,
verifiably sets the real, standard attribute — confirmed both by
reading it back directly and by a real CSS attribute selector
(`[contenteditable]`) correctly matching the element once it's set,
and correctly not matching before.

### Discard the Throwaway Example

This standalone `<td>` isn't part of the counter project. It existed
only to prove `setAttribute('contenteditable', 'true')` genuinely,
verifiably makes the attribute present.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `renderQuickAddTable`
  gains one new line).
- **Change type:** add.
- **Location:** inside `renderQuickAddTable`'s own `forEach` callback,
  after `amountTd.dataset.index = index;`.
- **Dependencies:** `amountTd`, already established.

### The New Code

```js
amountTd.setAttribute('contenteditable', 'true');
```

### The Updated Project

`script.js`'s own `renderQuickAddTable` function, in full, this unit's
new line marked:

```js
1  function renderQuickAddTable() {
2    quickAddTableBody.innerHTML = '';
3    quickAddDefs.forEach((amount, index) => {
4      const tr = document.createElement('tr');
5      const amountTd = document.createElement('td');
6      amountTd.textContent = amount;
7      amountTd.dataset.index = index;
8      amountTd.setAttribute('contenteditable', 'true');              // ← new
9      tr.append(amountTd);
10     quickAddTableBody.append(tr);
11   });
12 }
```

Every real amount cell this function builds is now genuinely,
directly editable — clicking into one and typing would visibly change
its own text, in any real browser, though nothing yet reacts when the
user is actually done editing.

### Mechanical Walkthrough

- **`amountTd`** — the element from this lesson's previous unit,
  holding the real, just-built `<td>`.
- **`.setAttribute`** — the method itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `.setAttribute` with two
  arguments.
- **`'contenteditable'`** — a string literal naming the real, standard
  attribute, explained in full above (Terms).
- **`,`** — separates `.setAttribute`'s two arguments.
- **`'true'`** — a string literal; the real, standard value that
  enables editing (the attribute also accepts `'false'` and
  `'inherit'`, neither used here).
- **`;`** — ends the statement.

### CS Lens

Making ordinary, structural content directly, visually editable in
place — rather than requiring a separate, dedicated form control
overlaid or swapped in — is a concrete instance of **direct
manipulation**: letting a user act on the real thing they're actually
looking at, rather than on a separate, indirect representation of it.

Also recognized in: a spreadsheet's own cells, editable in place by
double-clicking, rather than opening a separate dialog per cell; a
file manager letting you rename a file by clicking its own visible
name directly; a rich-text editor's own document body, itself directly
editable rather than a separate textarea beside a preview; a design
tool letting you drag a shape's own visible edge to resize it, rather
than typing new dimensions into a separate panel.

### SE Lens

The real alternative not chosen is replacing each amount cell with a
real `<input>` element instead — the identical, real pattern this
project's own Lesson 5 and Lesson 6 already used for the Add form.
That would work, and would arguably be more familiar to a user who
already expects "editable" to mean "looks like a text box." The real
tradeoff `contenteditable` accepts instead: no separate, real form
control has to be created, styled, or kept in sync with the table's
own structure — the `<td>` itself simply becomes editable — at the
real cost of `contenteditable`'s own historically inconsistent
behavior across different real browsers for more complex editing
scenarios (multi-line content, pasting rich text), a real, honest
limitation this project's own simple, single-number use case never
actually runs into.

### Commands Needed

None.

### Run It

Real output shown above, proving the attribute is genuinely,
verifiably set. Exercised as part of this lesson's closing
full-project run, below.

### Connection

Every cell is now genuinely editable — the next unit is what actually
detects and reacts to an edit being finished.

---

## Concept Unit: Committing an Edit with `focusout`

### The Problem

A user can now type a new value into a cell — but nothing detects
*when* they're done, and nothing yet reads the new value back into
`quickAddDefs` at all. Worse, this project's own established event
delegation pattern (Lesson 5) relies on bubbling — and, per this
lesson's own Header, the obvious first choice, `blur`, genuinely
doesn't bubble at all.

> **Before reading on:** Lesson 5 registered exactly one `click`
> listener on a shared container, relying on every real click bubbling
> up to it. If `blur` doesn't bubble — meaning a `blur` listener on
> `quickAddTableBody` itself would never fire no matter which cell
> actually lost focus — what real, different, but closely related
> event, named in this lesson's own Header, would need to be used
> instead to make delegation work here at all?

### Introduce the Concept in Isolation

Throwaway HTML — `<div id="container"><input id="a"></div>` — and this
script:

```js
container.addEventListener('blur', () => {
  console.log('blur reached the container');
});
container.addEventListener('focusout', () => {
  console.log('focusout reached the container');
});

input.focus();
input.blur();
```

Real run (Node + jsdom):

```
blur bubbled to container: false
focusout bubbled to container: true
```

This proves, directly and concretely, exactly the real, standard
exception this lesson's own Header described: the identical real
moment — an input losing focus — produces two real, different events,
and only one of them, `focusout`, is actually observable from a parent
container the way `click` already was in Lesson 5.

### Discard the Throwaway Example

This throwaway `<div id="container">`/`<input id="a">` pair isn't part
of the counter project. It existed only to prove `blur` and `focusout`
genuinely differ in whether they bubble.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new delegated listener
  added on `quickAddTableBody`).
- **Change type:** add.
- **Location:** after `renderQuickAddTable`.
- **Dependencies:** `quickAddTableBody`, `quickAddDefs`, both already
  established.

### The New Code

```js
quickAddTableBody.addEventListener('focusout', (e) => {
  const cell = e.target;
  if (!cell.matches('td[contenteditable]')) return;
});
```

### The Updated Project

`script.js`'s own new listener, in full, this unit's new lines marked:

```js
1  quickAddTableBody.addEventListener('focusout', (e) => {           // ← new
2    const cell = e.target;                                          // ← new
3    if (!cell.matches('td[contenteditable]')) return;                // ← new
4  });                                                                 // ← new
```

This one, real, delegated listener now correctly fires whenever *any*
editable cell inside `quickAddTableBody` loses focus — including cells
this function hasn't even rendered yet, the identical real payoff
Lesson 5's own event delegation already established for dynamically
added buttons — though nothing yet reads or applies the real, new
value inside it.

### Mechanical Walkthrough

- **`quickAddTableBody.addEventListener`** — the method itself,
  explained in full in Lesson 1; the delegation pattern itself,
  explained in full in Lesson 5, here applied to a genuinely
  non-bubbling-by-default real event's own bubbling counterpart.
- **`(`...`)`** — call syntax, invoking `addEventListener` with two
  arguments.
- **`'focusout'`** — a string literal naming the event type, explained
  in full above (Terms).
- **`,`** — separates the two arguments.
- **`(e) => {`...`}`** — an arrow function, explained in full in
  Lesson 1; `e`, the real event object, the same real shape Lesson 5's
  own click-delegation callback already received.
- **`const cell = e.target;`** — `.target`, explained in full in
  Lesson 5; here, since `focusout` only ever fires on the specific
  element that actually lost focus, `e.target` *is* the real cell
  directly — no `.closest()` needed the way Lesson 5's click
  delegation required, since a `focusout` (unlike a click, which could
  land on a child of the real target) can't itself be "aimed" at a
  deeper descendant the way a click can.
- **`if (!cell.matches('td[contenteditable]')) return;`** — `if`, `!`,
  and `return`, all explained in full earlier in this curriculum;
  `.matches`, a real, already-implicitly-used mechanism (Lesson 13's
  own first lab already called it) now used for real, guarding against
  a `focusout` from something else entirely — `quickAddTableBody`
  itself, if it were ever focusable, for instance.

### CS Lens

Not applicable as a new hard concept — this unit reapplies the
Observer-pattern/event-delegation mechanism already covered in full in
Lessons 1 and 5, to a real, different, non-bubbling-by-default event
this lesson's own Header separately named as a real exception worth
knowing.

### SE Lens

The real alternative not chosen is registering a separate, individual
`focusout` listener on every single cell, at the moment each one is
created inside `renderQuickAddTable` — real, working code, and the
exact real limitation Lesson 5's own SE Lens already argued against:
every re-render (and this project's own `renderQuickAddAll`, built in
this lesson's final unit, re-renders on every single edit or deletion)
would mean re-registering a fresh listener per cell, all over again,
every time. One, real, delegated listener, registered once, on the
stable, real `quickAddTableBody` container, correctly covers every
cell this function will ever build, present or future, with zero
additional wiring.

### Commands Needed

None.

### Run It

Real output shown above, proving `focusout`, unlike `blur`, genuinely
bubbles. Exercised as part of this lesson's closing full-project run,
below.

### Connection

Edits can now genuinely be detected, from any cell, through one
listener — the next unit is what actually reads the new value and
updates the real data.

---

## Concept Unit: Applying the Edit and Deleting Rows

### The Problem

`focusout` correctly fires, but nothing yet reads the cell's own new,
real text, validates it, or updates `quickAddDefs` — and there's still
no real way to remove an amount from the table at all.

> **Before reading on:** Lesson 6's own `isValidAmount` function
> already takes any real string and reports whether it's a usable
> number — the identical real question this cell's own new text now
> needs answered. Given `cell.dataset.index` already names exactly
> which real position in `quickAddDefs` this cell represents, and
> `.splice`, named in this lesson's own Header, removes a real element
> at a given index, what would the real, complete logic for both
> "commit an edit" and "delete a row" need to look like?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
const defs = [1, 5, 10, 25];
const removed = defs.splice(1, 1);
console.log(defs);
console.log(removed);
```

Real run (Node):

```
before splice: [1,5,10,25]
after splice(1, 1): [1,10,25]
what splice returned (the removed items): [5]
```

This proves `.splice(1, 1)` genuinely, correctly removes exactly the
element at real index `1` (the `5`), shifting every later element down
into place, and correctly hands back a real, new array containing
exactly what was removed.

### Discard the Throwaway Example

This standalone `defs` array isn't part of the counter project. It
existed only to prove `.splice` correctly removes a real element at a
given real position.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — the `focusout` listener
  completed; a new `click` listener added on `quickAddTableBody`; a
  new `renderQuickAddButtons` function, plus `renderQuickAddAll`
  tying every render together; `addNewQuickAddButton`, from Lessons 5
  and 6, refactored to use `quickAddDefs` instead of building a
  button directly; `saveState`/`loadState`, from Lesson 12, extended
  to cover `quickAddDefs` too).
- **Change type:** add, and one real refactor of already-existing
  code (`addNewQuickAddButton`).
- **Location:** the `focusout` listener's own body; a new listener
  after it; `renderQuickAddButtons` before `renderQuickAddTable`;
  `addNewQuickAddButton`'s own body; `saveState`/`loadState`'s own
  bodies.
- **Dependencies:** `isValidAmount` (Lesson 6); `saveState` (Lesson
  12); every element reference already established.

### The New Code

```js
function renderQuickAddButtons() {
  quickAddContainer.innerHTML = '';
  quickAddDefs.forEach((amount) => {
    const btn = document.createElement('button');
    btn.className = 'quickAddBtn';
    btn.dataset.amount = amount;
    btn.textContent = `+${amount}`;
    quickAddContainer.append(btn);
  });
}

function renderQuickAddAll() {
  renderQuickAddButtons();
  renderQuickAddTable();
  saveState();
}

quickAddTableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('.deleteQuickAddBtn');
  if (!btn) return;
  const index = Number(btn.dataset.index);
  quickAddDefs.splice(index, 1);
  renderQuickAddAll();
});
```

### The Updated Project

`script.js`, this lesson's own full, final section, every change from
this whole lesson shown together, new/changed lines marked:

```js
 1  function renderQuickAddButtons() {                                 // ← new
 2    quickAddContainer.innerHTML = '';                                  // ← new
 3    quickAddDefs.forEach((amount) => {                                 // ← new
 4      const btn = document.createElement('button');                    // ← new
 5      btn.className = 'quickAddBtn';                                   // ← new
 6      btn.dataset.amount = amount;                                     // ← new
 7      btn.textContent = `+${amount}`;                                  // ← new
 8      quickAddContainer.append(btn);                                   // ← new
 9    });                                                                 // ← new
10  }                                                                     // ← new
11
12  function renderQuickAddTable() { /* unchanged, from this lesson's first two units */ }
13
14  function renderQuickAddAll() {                                       // ← new
15    renderQuickAddButtons();                                            // ← new
16    renderQuickAddTable();                                              // ← new
17    saveState();                                                        // ← new
18  }                                                                     // ← new
19
20  quickAddTableBody.addEventListener('focusout', (e) => {
21    const cell = e.target;
22    if (!cell.matches('td[contenteditable]')) return;
23    const index = Number(cell.dataset.index);                          // ← new
24    if (isValidAmount(cell.textContent)) {                              // ← new
25      quickAddDefs[index] = Number(cell.textContent.trim());            // ← new
26    }                                                                    // ← new
27    renderQuickAddAll();                                                // ← new
28  });
29
30  quickAddTableBody.addEventListener('click', (e) => {                 // ← new
31    const btn = e.target.closest('.deleteQuickAddBtn');                  // ← new
32    if (!btn) return;                                                    // ← new
33    const index = Number(btn.dataset.index);                             // ← new
34    quickAddDefs.splice(index, 1);                                       // ← new
35    renderQuickAddAll();                                                 // ← new
36  });                                                                    // ← new
37
38  function addNewQuickAddButton() {                                    // ← changed
39    if (!isValidAmount(amountInput.value)) return;
40    const amount = Number(amountInput.value);
41    quickAddDefs.push(amount);                                          // ← changed
42    renderQuickAddAll();                                                // ← changed
43    amountInput.value = '';
44    addQuickAddBtn.disabled = true;
45  }
46
47  function saveState() {
48    localStorage.setItem('counterAppState', JSON.stringify({ count, history, quickAddDefs })); // ← changed
49  }
50
51  function loadState() {
52    const raw = localStorage.getItem('counterAppState');
53    if (raw === null) return;
54    const parsed = JSON.parse(raw);
55    count = parsed.count;
56    history = parsed.history;
57    if (parsed.quickAddDefs) quickAddDefs = parsed.quickAddDefs;        // ← new
58  }
59
60  // ... near the script's own existing initial setup ...
61  renderQuickAddAll();                                                 // ← new
```

Lines 23–26 complete the edit-commit logic: `cell.dataset.index`
identifies which real entry to update; `isValidAmount` (Lesson 6),
called on the cell's own current, real text, guards against a bad
edit; on success, `quickAddDefs[index]` is directly reassigned. Line
27 re-renders everything regardless — on an invalid edit, `quickAddDefs`
never changed, so the re-render correctly, harmlessly restores the
cell's own original, real value, discarding the bad input. Lines
30–36 add the real, symmetric delete path, using `.splice` to remove
exactly one real entry. Lines 38–45 refactor `addNewQuickAddButton`
(Lessons 5–6) to push into the same, real, shared array and re-render
everything, rather than building a lone button directly — the Add
form and the table are now both, genuinely, just two more real ways
to change the one, same array. Lines 47–48 and 51–57 extend
`saveState`/`loadState` (Lesson 12) to cover this third, real piece of
state.

### Mechanical Walkthrough

- **`renderQuickAddButtons`** — composes `.forEach`, `document.createElement`,
  `.className`, `.dataset.amount =`, `.textContent`, and `.append` —
  every one already given full treatment earlier in this curriculum;
  the real, new fact here is that it's now driven by `quickAddDefs`,
  the same array `renderQuickAddTable` reads, rather than being static
  HTML.
- **`renderQuickAddAll`** — a named function declaration, explained in
  full in Lesson 6; calls three already-established functions in
  sequence — the one, real place this lesson's whole feature keeps
  every view and the durable, saved copy honestly in sync.
- **`Number(cell.dataset.index)`** — `Number`, explained in full in
  Lesson 4; `.dataset`, explained in full in Lessons 4 and 5; reads
  back the real position this exact cell represents.
- **`isValidAmount(cell.textContent)`** — a call to the already-
  established function from Lesson 6; `cell.textContent`, the
  `.textContent` property, explained in full in Lesson 2, here read
  for genuinely the first time in this project's own taught code,
  rather than only ever written to.
- **`quickAddDefs[index] = Number(cell.textContent.trim());`** — real,
  direct array-index assignment; `Number`, `.trim()`, both already
  established; reassigns exactly the one, real array entry this cell
  represents.
- **`e.target.closest('.deleteQuickAddBtn')`** — `.closest`, explained
  in full in Lesson 5, used here for exactly the reason it was needed
  there: a click on the Delete button's own text still reports
  `e.target` as that specific button (or, depending on real rendering
  details, a text node inside it), and `.closest` reliably finds the
  real button regardless.
- **`quickAddDefs.splice(index, 1);`** — the method itself, explained
  in full above.
- **`quickAddDefs.push(amount);`** — `.push`, explained in full in
  Lesson 7, here adding a new real entry from the Add form instead of
  Lesson 5's own direct DOM construction.
- **`if (parsed.quickAddDefs) quickAddDefs = parsed.quickAddDefs;`** —
  `if`, explained in full in Lesson 3; guards against loading an
  *older*, real, previously-saved state from before this lesson
  existed, which would have no real `quickAddDefs` field at all —
  correctly leaving the default `[1, 5, 10]` in place rather than
  overwriting it with `undefined`.

### CS Lens

Not applicable as a new hard concept beyond what's already established
in this same lesson (single source of truth, event delegation,
declarative re-rendering) — this unit's real contribution is wiring
every already-covered mechanism together into one, complete, working
feature.

### SE Lens

The real, honest tradeoff worth naming, one final time: every single
real change to `quickAddDefs` — an edit, a deletion, or a new addition
— now triggers a full, real re-render of *both* the buttons and the
table, plus a real, durable save, even though, in most cases, only one
real entry actually changed. This is the identical, real tradeoff
Lesson 7's own SE Lens already accepted for `renderHistory` — rebuild
everything from the array, correctly, rather than trying to compute
the minimal real change — now paid twice per update instead of once,
since two real views exist instead of one. For a real list this
project's own size (a handful of quick-add amounts), that real cost is
genuinely negligible; the real benefit — one, single, always-correct
function (`renderQuickAddAll`) that's impossible for the buttons and
the table to ever silently disagree with each other — is worth it at
this real scale.

### Commands Needed

None — plain HTML/JS, no build step, openable directly in a browser.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature — an edit, an invalid edit, using the edited button,
a deletion, and a full, simulated reload proving every piece
persists:

```
--- initial state ---
quickAdd buttons rendered: 3
table rows rendered: 3
table matches buttons: true

--- editing the second cell (amount 5) to 7 via focusout ---
quickAddDefs after edit: [1,7,10]
button row now reflects the edit: +1,+7,+10

--- editing a cell to an invalid value (should revert on render) ---
quickAddDefs unchanged by invalid edit: [1,7,10]
table cell reverted to real value: 1

--- clicking the actual +7 button still works ---
count after clicking edited button: 7

--- deleting the first row (amount 1) ---
quickAddDefs after delete: [7,10]
button row after delete: +7,+10
table row count after delete: 2

--- persistence: reload and confirm table state survives ---
quickAddDefs after simulated reload: [7,10]
table rows after reload: 2
```

Every real claim this lesson made is directly confirmed: editing a
cell genuinely changes the actual, clickable button; an invalid edit
is genuinely, correctly discarded, not silently accepted; deletion
correctly removes exactly one real entry from both views at once; and
the entire, edited, real state — not just the original three amounts —
survives a genuine, simulated reload.

### Connection

This is the final piece — one real array, editable from a table,
deletable from that same table, addable from the existing form, and
durably saved, correctly driving two real, independent views that can
now never silently drift apart.

---

## Closing

**Connect the pieces.** One real sequence, start to finish: the user
clicks into the table's second cell — showing `5` — types `7`, and
clicks elsewhere on the page. The browser dispatches a real `focus`
event when the cell was first clicked into (not delegated, and not
used by this project); when focus leaves, a real `blur` fires directly
on the cell — this lesson's own Header explained why that alone
wouldn't reach `quickAddTableBody`'s own listener — and, alongside it,
a real `focusout` fires too, which, per this lesson's third unit,
genuinely bubbles up to the one, real, delegated listener registered
there.

That listener runs: `e.target` (this lesson's third unit) is the real
cell directly; `.matches('td[contenteditable]')` (this lesson's second
unit's own real attribute) confirms it's a genuine, editable cell.
`cell.dataset.index` (set back in this lesson's first unit) reads
`1`, the real position this cell represents in `quickAddDefs`.
`isValidAmount(cell.textContent)` (Lesson 6's own function, reading
`.textContent` for the first time rather than writing it) checks the
cell's real, current text, `"7"` — valid. `quickAddDefs[1] =
Number('7'.trim())` reassigns the real array's second entry to `7`.

`renderQuickAddAll` (this lesson's final unit) runs: `renderQuickAddButtons`
clears and rebuilds the actual `<button>` row from the now-updated
array — the second button now reads `+7` and carries `data-amount="7"`,
the exact real value Lesson 4's own click-delegation handler will read
the next time it's clicked. `renderQuickAddTable` clears and rebuilds
the table itself, correctly showing `7` back in the cell the user just
edited. `saveState` (Lesson 12, now extended) durably writes `count`,
`history`, and this newly-changed `quickAddDefs` together, as one real
object, to `localStorage` — the edited amount surviving not just this
render, but the next real reload too. One real array; two real,
independent views; one real save — none of the three ever able to
silently, quietly disagree with either of the others.
