# Lesson 4: Wiring Many Elements at Once

- **What you will build.** Three "quick add" buttons — `+1`, `+5`,
  `+10` — that each add their own amount straight to the count,
  without writing three separate, nearly-identical
  `addEventListener` calls by hand. The transferable problem: every
  feature this curriculum has built so far selected and wired exactly
  one element per action. Real pages routinely have a *set* of
  similar elements — a row of buttons, a list of items, a grid of
  cards — that all need the same kind of behavior wired onto every
  one of them, and hand-copying the same `addEventListener` block once
  per element doesn't scale past two or three before it becomes real,
  repetitive, error-prone code.

- **What you need to know first.** Lesson 1's `document.querySelector`
  and `element.addEventListener`. Lesson 2's `let`/reassignment and
  `element.textContent` (write). Lesson 3's guard pattern isn't reused
  directly, but this lesson's own new elements coexist with everything
  Lesson 3 built.

- **Terms used in this lesson**

  - **`data-*` attribute** — a custom HTML attribute, prefixed with
    `data-`, that lets a page attach its own arbitrary information
    directly onto an element in the markup itself. It exists because
    HTML's built-in attributes (`id`, `class`, `href`, and so on) only
    cover the browser's own predefined needs — a page frequently needs
    to store its *own* extra facts about an element (how much a
    button should add, which record an item represents) somewhere the
    browser won't touch or reinterpret, and `data-*` is the
    standard-sanctioned place to put exactly that.

- **Objects and methods used**

  - **`document.querySelectorAll(selector)`**
    - *What it is:* a method that searches the DOM tree for *every*
      element matching a CSS selector, not just the first.
    - *Implementation:* takes one string argument (a CSS selector) and
      returns a `NodeList` — a real, array-like collection — containing
      every matching element, in document order. If nothing matches,
      it returns an empty `NodeList`, never `null`.
    - *Its use:* this lesson needs all three quick-add buttons at once,
      as a group, rather than one specific element by a unique `id`.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* search the live DOM tree once, using the given
      selector, and hand back every real, matching element together,
      as a single collection — never a partial result, never
      auto-updating if the page changes after the call.
    - *Depends on:* a valid CSS selector string, and a DOM tree already
      built.
    - *Connects to:* called on `document`, the same global object
      `querySelector` is called on; the `NodeList` it returns is what
      `.forEach`, below, is called on.
    - *Shape:* a public read API — a query returning a group, not a
      mutation.

  ```
  // NodeList's real declared shape (the members this lesson touches)
  interface NodeList {
    readonly length: number;
    forEach(callback: (item: Element, index: number, list: NodeList) => void): void;
    [index: number]: Element;
  }
  ```

  - **`NodeList.forEach(callback)`**
    - *What it is:* a method on `NodeList` that runs a given callback
      once for every element in the collection, in order.
    - *Implementation:* takes one function argument; that function is
      called once per item, receiving the item itself, its numeric
      index within the collection, and the whole collection, in that
      order — this lesson's code only uses the first of those three.
    - *Its use:* this is the mechanism that actually wires all three
      buttons at once — one `forEach` call, instead of three separate,
      hand-written statements.
    - *Type:* an instance method on the `NodeList` `querySelectorAll`
      returns.
    - *Responsibility:* visit every item in the collection exactly
      once, in document order, and invoke the given callback with
      each one — nothing more; it doesn't collect or return a new
      value the way some similar array methods do.
    - *Depends on:* a `NodeList` to be called on, and a callback
      function to invoke per item.
    - *Connects to:* called on the `NodeList` `querySelectorAll`
      returns; the callback it invokes is where this lesson's own
      `addEventListener` call, below, actually happens — once per
      button.
    - *Shape:* an iteration API — the mechanism this lesson uses to
      turn "one action, repeated for a group" into a single statement.

  - **`document`** *(reappearing from Lessons 1–3 — full treatment
    restated)*
    - *What it is:* the single, global object every page gets,
      representing the whole loaded page.
    - *Implementation:* provided automatically by the browser; exactly
      one per page.
    - *Its use:* the entry point `querySelectorAll`, above, is called
      on.
    - *Type:* a global, browser-provided object (an instance of the
      `Document` interface).
    - *Responsibility:* represents the entire loaded page and acts as
      the root access point for every DOM-reading and DOM-writing
      operation.
    - *Depends on:* nothing from your code.
    - *Connects to:* your script calls `querySelectorAll` on it.
    - *Shape:* a public, global API surface.

  - **`element.addEventListener(type, callback)`** *(reappearing —
    full treatment restated)*
    - *What it is:* a method, on any DOM element, that registers a
      function to run whenever a specific event happens on that
      element.
    - *Implementation:* takes an event-type string (`'click'`) and a
      callback function; returns nothing meaningful.
    - *Its use:* this lesson calls it once *per button*, from inside
      the `forEach` callback, rather than once total — the same
      mechanism, applied automatically to every element in a group.
    - *Type:* an instance method, called on an `Element`.
    - *Responsibility:* maintain a list of callbacks registered for a
      given event type on this specific element, and invoke each one,
      in order, every time that event fires.
    - *Depends on:* an element to call it on, an event-type string, and
      a callback.
    - *Connects to:* called on each individual button `forEach` visits;
      the callback is application code the browser decides when to
      run.
    - *Shape:* a callback boundary between application code and the
      browser's event-dispatch system.

  - **`element.dataset`**
    - *What it is:* a live property on every DOM element exposing its
      `data-*` attributes as a plain, readable object.
    - *Implementation:* a `data-amount="5"` attribute in the HTML
      becomes accessible as `element.dataset.amount`, and its value is
      always a string — `data-*` attributes carry no real type
      information of their own; HTML attributes are text, full stop.
    - *Its use:* this is how each quick-add button's own callback
      finds out *which* amount it specifically should add, without
      three separate, hardcoded callbacks.
    - *Type:* an instance property (read) on any `Element`.
    - *Responsibility:* expose every `data-*` attribute on this
      element as a plain, readable object property, always as a
      string — no automatic conversion, no automatic parsing.
    - *Depends on:* the element it belongs to; nothing else.
    - *Connects to:* read inside this lesson's `forEach` callback; its
      string result is handed to `Number()`, below, immediately.
    - *Shape:* a public read API — a bridge between markup-level data
      and script-level access.

  - **`Number(value)`**
    - *What it is:* a global, built-in function that converts its
      argument into a numeric value.
    - *Implementation:* called with one argument; if that argument is
      a string that looks like a valid number, it returns the real
      numeric equivalent; if the string doesn't look like a number at
      all, it returns the special value `NaN` ("Not a Number").
    - *Its use:* `element.dataset.amount` is always a string, even
      though its content (`"1"`, `"5"`, `"10"`) looks numeric — adding
      it to `count` without converting it first would use `+` as
      string concatenation, not arithmetic, and silently produce the
      wrong result.
    - *Type:* a global function, not a method on any particular object.
    - *Responsibility:* take one value and produce its real numeric
      equivalent, or `NaN` if that's not meaningfully possible — this
      lesson relies on it being given only well-formed numeric strings
      from a `data-amount` attribute this project itself controls.
    - *Depends on:* one value to convert.
    - *Connects to:* called on the string `element.dataset` returns;
      its numeric result is what actually gets added to `count`.
    - *Shape:* a public, global conversion utility.

  - **`element.textContent` (write)** *(reappearing from Lessons 2–3 —
    full treatment restated)*
    - *What it is:* a property on every DOM element that, when
      assigned a string, replaces everything inside that element with
      a new text node containing exactly that string.
    - *Implementation:* a plain string-typed property; assigning to it
      discards whatever was previously inside the element.
    - *Its use:* this lesson reuses it, identically to Lesson 2, to
      display the count after a quick-add click changes it.
    - *Type:* an instance property (read/write) on any DOM node.
    - *Responsibility:* keep the element's visible text in sync with
      whatever string it was last assigned.
    - *Depends on:* the element it's set on, and a string value to
      assign.
    - *Connects to:* written to directly by this lesson's quick-add
      handler, below.
    - *Shape:* a mutation API — the seam where a string in your code
      becomes visible pixels on the page.

---

## Concept Unit: Selecting Every Matching Element with `querySelectorAll`

### The Problem

Three new buttons need to exist before anything else in this lesson
can happen — but unlike every previous lesson's single element,
they're a genuine *group*, all sharing the same behavior, that this
lesson needs to reach all at once.

> **Before reading on:** `document.querySelector` returns the *first*
> match for a selector, and only that one. If three real elements on
> the page all shared the same CSS class, what do you think a method
> that returns *all* of them, instead of just the first, might be
> named, given the name of the one you already know?

### Introduce the Concept in Isolation

Throwaway HTML — `<ul><li>a</li><li>b</li><li>c</li></ul>` — and this
script:

```js
const found = document.querySelectorAll('li');
console.log(found.length);
console.log(found[0].textContent);
```

Real run (Node + jsdom):

```
found.length: 3
found instanceof NodeList: NodeList
found[0].textContent: "a"
```

This proves `querySelectorAll` genuinely finds *every* match, not just
one — `found.length` is `3`, matching all three `<li>` elements, and
individual items are reachable by index (`found[0]`), the same way an
array's items are. This construct — a method that returns every
matching element as a group — is called, straightforwardly enough,
**element selection returning a collection**, and the collection's own
real type, confirmed above, is `NodeList`, not a plain array.

### Discard the Throwaway Example

This `<ul>`/`<li>` structure isn't part of the counter project. It
existed only to prove `querySelectorAll` returns every match, as a real
collection with a real `length` and index access.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `index.html` (modified — three new buttons
  added, inside a new wrapping `<div>`); `script.js` (modified — one
  new `const` declaration added).
- **Change type:** add.
- **Location:** `index.html` — after the existing `<button
  id="resetBtn">`; `script.js` — after the existing `resetBtn`
  declaration.
- **Dependencies:** none new.

### The New Code

```js
const quickAddButtons = document.querySelectorAll('.quickAddBtn');
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
16    <div id="quickAdd">                                          <!-- ← new -->
17      <button class="quickAddBtn" data-amount="1">+1</button>    <!-- ← new -->
18      <button class="quickAddBtn" data-amount="5">+5</button>    <!-- ← new -->
19      <button class="quickAddBtn" data-amount="10">+10</button>  <!-- ← new -->
20    </div>                                                        <!-- ← new -->
21
22    <script src="script.js"></script>
23  </body>
24  </html>
```

`script.js`, in full, this unit's new line marked:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const countBtn = document.querySelector('#countBtn');
5  const countDisplay = document.querySelector('#countDisplay');
6  const resetBtn = document.querySelector('#resetBtn');
7  const quickAddButtons = document.querySelectorAll('.quickAddBtn');  // ← new
8
9  let count = 0;
10
11 button.addEventListener('click', () => {
12   message.classList.toggle('hidden');
13 });
14
15 countBtn.addEventListener('click', () => {
16   count = count + 1;
17   countDisplay.textContent = `Clicked ${count} times`;
18 });
19
20 resetBtn.addEventListener('click', () => {
21   if (count !== 0) {
22     count = 0;
23     countDisplay.textContent = 'Clicked 0 times';
24   }
25 });
```

Lines 1–6 and 9–25, everything from before this unit, are unchanged.
Line 7 gives this lesson a single reference to *all three* new buttons
at once, as one collection — nothing wired to them yet.

### Mechanical Walkthrough

- **`const`** — declares a binding that won't be reassigned; explained
  in full in Lesson 1; `quickAddButtons` itself is never reassigned,
  even though, as later units show, code runs once per item inside it.
- **`quickAddButtons`** — the new variable name; plural, describing
  that it holds several elements, not one.
- **`=`** — the assignment operator, explained in full in Lesson 1.
- **`document`** — the global page object, explained in full above.
- **`.querySelectorAll`** — the method itself, explained in full above;
  distinct from `.querySelector`, which this project has used four
  times already, in that this one returns every match, not just the
  first.
- **`(`...`)`** — call syntax, invoking `querySelectorAll` with one
  argument.
- **`'.quickAddBtn'`** — a string literal CSS selector; the leading
  `.` means "match by class," not by `id` — this project's `<style>`
  block already used the identical `.` class-selector syntax for
  `.hidden` in Lesson 1; here it selects *every* element carrying the
  `quickAddBtn` class, which is exactly why all three buttons share
  that one class instead of each getting a unique `id` the way every
  previous element in this project has.
- **`;`** — statement terminator.

### CS Lens

Selecting a *group* of elements sharing a common trait — rather than
one specific, uniquely identified element — is the DOM-specific
instance of a much more general idea: **querying a collection by a
shared predicate**, rather than by a unique key.

Also recognized in: a database `SELECT ... WHERE category = 'X'`
returning every matching row, not one; a file-system glob pattern
(`*.txt`) matching every file with that extension; a search engine
returning every page matching a query; `grep` returning every matching
line in a file, not just the first.

### SE Lens

The real alternative here was giving each button its own unique `id`
(`quickAdd1`, `quickAdd5`, `quickAdd10`) and selecting each one
individually with three separate `querySelector` calls — exactly the
pattern every previous lesson in this curriculum has used. That would
still work, but the real cost compounds with every new button added
later: a fourth quick-add button would need a fourth unique `id`, a
fourth `querySelector` call, and a fourth copy of whatever wiring code
follows. Selecting by a shared class instead means adding a fourth
button to the HTML is *automatically* picked up by the same,
already-written `querySelectorAll('.quickAddBtn')` call, with zero
changes to `script.js` at all — the real tradeoff being that a shared
class carries less individual identity than a unique `id`, so anything
that needs to single out *one specific* button (this lesson's own
`Number(btn.dataset.amount)`, ahead) has to read something else about
it to tell them apart, rather than relying on the selector itself.

### Commands Needed

None.

### Run It

Exercised as part of this lesson's closing full-project run, below —
not re-run standalone here, per the Verification Rule's Batching
clause.

### Connection

This unit gets a single reference to all three new buttons together;
the next unit is what actually visits each one.

---

## Concept Unit: Visiting Every Item with `NodeList.forEach`

### The Problem

`quickAddButtons` holds all three real buttons, but nothing has
touched any of them individually yet — `addEventListener`, from
Lessons 1–3, only ever runs on one element at a time.

> **Before reading on:** if you needed to do the exact same thing to
> every item in a group — printing each one, say — one at a time, in
> order, what would the general shape of that need to look like? What
> two pieces of information would code doing that need for each item:
> the item itself, and what else might be useful to know about its
> position in the group?

### Introduce the Concept in Isolation

Throwaway HTML — the identical `<ul><li>a</li><li>b</li><li>c</li></ul>`
from the previous unit — and this script:

```js
const items = document.querySelectorAll('li');
const seen = [];
items.forEach((item, index) => {
  seen.push(`index ${index}: ${item.textContent}`);
});
console.log(seen.join(' | '));
```

Real run (Node + jsdom):

```
index 0: a | index 1: b | index 2: c
```

This proves `forEach` visits every item, in order, and hands the
callback both the item itself and its numeric position — `index 0`
through `index 2`, matching the three real `<li>` elements in document
order. This construct — running a callback once per item in a
collection — is called **iteration**, and `forEach` is the specific
method performing it here.

### Discard the Throwaway Example

This `<ul>`/`<li>` structure and the `seen` array aren't part of the
counter project. They existed only to prove `forEach` visits every
item, in order, with real per-item data.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** after the existing `resetBtn.addEventListener(...)`
  block.
- **Dependencies:** `quickAddButtons`, from the previous unit.

### The New Code

```js
quickAddButtons.forEach((btn) => {

});
```

This fragment's callback body is intentionally empty for now — the
next two units are what fill it in; this unit's own job is only to
prove the visiting mechanism itself runs, once per button.

### The Updated Project

`script.js`, in full, this unit's new lines marked:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const countBtn = document.querySelector('#countBtn');
5  const countDisplay = document.querySelector('#countDisplay');
6  const resetBtn = document.querySelector('#resetBtn');
7  const quickAddButtons = document.querySelectorAll('.quickAddBtn');
8
9  let count = 0;
10
11 button.addEventListener('click', () => {
12   message.classList.toggle('hidden');
13 });
14
15 countBtn.addEventListener('click', () => {
16   count = count + 1;
17   countDisplay.textContent = `Clicked ${count} times`;
18 });
19
20 resetBtn.addEventListener('click', () => {
21   if (count !== 0) {
22     count = 0;
23     countDisplay.textContent = 'Clicked 0 times';
24   }
25 });
26
27 quickAddButtons.forEach((btn) => {                                // ← new
28
29 });                                                                // ← new
```

Lines 1–25, everything from before this unit, are unchanged. Lines
27–29 add the iteration itself — right now it does nothing per button,
but the mechanism that will run once per button, in order, now exists
and is ready to be filled in.

### Mechanical Walkthrough

- **`quickAddButtons`** — the variable from the previous unit, holding
  all three real button references.
- **`.forEach`** — the method itself, explained in full above; called
  on the `NodeList` `quickAddButtons` holds.
- **`(`...`)`** — call syntax, invoking `forEach` with one argument: a
  callback.
- **`(btn) => {`...`}`** — an arrow function, the same syntax explained
  in full in Lesson 1; here it takes one parameter, `btn`, which
  `forEach` fills in with each individual button in turn — the
  callback's own body runs three separate times, once per button, with
  `btn` referring to a different, real element each time.
- **`;`** — ends the `forEach(...)` statement.

### CS Lens

Not applicable beyond this unit's own already-covered concept —
iteration over a collection, fully covered as a hard concept just
above, in this same unit.

### SE Lens

The real alternative not chosen is writing out three separate
`addEventListener` calls by hand, once per button — real, working
code, and for exactly three buttons, arguably not even much more
typing. The real cost that alternative accumulates: if this project
later adds a fourth quick-add button, three-hand-written calls become
four hand-written calls, each one an easy place to accidentally copy a
button's own hardcoded amount incorrectly. `forEach` instead means the
exact same, single piece of wiring logic runs identically for every
button in the collection, with the number of buttons only ever
determined by the HTML — the code itself never needs to know or care
whether there are three quick-add buttons or thirty.

### Commands Needed

None.

### Run It

Exercised as part of this lesson's closing full-project run, below.

### Connection

Every button is now individually visited, once each — the next unit is
what actually wires each one to a click reaction.

---

## Concept Unit: Wiring Each Button's Click Reaction

### The Problem

`forEach` visits each button, but nothing happens on click yet — the
same gap every previous lesson's very first `addEventListener` unit
started from, now happening once per button instead of once total.

> **Before reading on:** inside the `forEach` callback, `btn` refers to
> whichever button is currently being visited. Given that, and given
> you've now written `element.addEventListener('click', ...)` three
> separate times in this curriculum already, what would you type
> inside this callback to register a click reaction on `btn`
> specifically?

### Introduce the Concept in Isolation

A fresh throwaway lab, per this curriculum's rule that a lab isn't
something earned once, against a new element:

```js
console.log('step 1: calling addEventListener...');
btn.addEventListener('click', () => {
  console.log('step 3: callback runs now, because the click event fired');
});
console.log('step 2: addEventListener has returned, callback has not run yet');

btn.dispatchEvent(new Event('click'));
console.log('step 4: dispatchEvent has returned, callback already ran above');
```

Against a throwaway `<button id="q">quick add</button>`. Real run (Node
+ jsdom):

```
step 1: calling addEventListener...
step 2: addEventListener has returned, callback has not run yet
step 3: callback runs now, because the click event fired
step 4: dispatchEvent has returned, callback already ran above
```

The identical control-flow/timing trace shape as every previous
`addEventListener` lab in this curriculum — reconfirmed here before
this exact call gets run automatically, three separate times, once per
button, inside the `forEach` from the previous unit.

### Discard the Throwaway Example

This throwaway `<button id="q">` isn't part of the counter project. It
existed only to reconfirm the timing mechanism before relying on it
inside the loop.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** inside the `quickAddButtons.forEach` callback added in
  the previous unit.
- **Dependencies:** `btn`, the previous unit's own callback parameter.

### The New Code

```js
btn.addEventListener('click', () => {

});
```

### The Updated Project

`script.js`, in full, this unit's new lines marked:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const countBtn = document.querySelector('#countBtn');
5  const countDisplay = document.querySelector('#countDisplay');
6  const resetBtn = document.querySelector('#resetBtn');
7  const quickAddButtons = document.querySelectorAll('.quickAddBtn');
8
9  let count = 0;
10
11 button.addEventListener('click', () => {
12   message.classList.toggle('hidden');
13 });
14
15 countBtn.addEventListener('click', () => {
16   count = count + 1;
17   countDisplay.textContent = `Clicked ${count} times`;
18 });
19
20 resetBtn.addEventListener('click', () => {
21   if (count !== 0) {
22     count = 0;
23     countDisplay.textContent = 'Clicked 0 times';
24   }
25 });
26
27 quickAddButtons.forEach((btn) => {
28   btn.addEventListener('click', () => {                           // ← new
29
30   });                                                              // ← new
31 });
```

Lines 1–25, everything from before this unit, are unchanged. Lines
28–30 register a real, independent click listener on *every* button
`forEach` visits — three separate, real listeners now exist, one per
button, from this one piece of code, though the innermost callback
still does nothing yet.

### Mechanical Walkthrough

- **`btn`** — the parameter from the previous unit's `forEach`
  callback; refers to a real, different button each of the three times
  this outer callback runs.
- **`.addEventListener`** — the method itself, explained in full above;
  called here on `btn`, so each of the three calls this loop makes
  registers a listener on a *different* real element, not the same one
  three times.
- **`(`...`)`** — call syntax, invoking `addEventListener` with two
  arguments.
- **`'click'`** — the same event-type string used by every listener in
  this curriculum so far.
- **`,`** — separates the two arguments.
- **`() => {`...`}`** — the inner arrow function; its own body is what
  will actually run when a specific button is actually clicked — still
  empty here, filled in by the next unit.

### CS Lens

Not applicable beyond what's already established — this reapplies the
Observer-pattern mechanism (Lesson 1's CS Lens) three separate times in
a row, once per button, rather than once total.

### SE Lens

The real design choice worth naming: each button gets its *own*,
independent listener, closing over that specific `btn` — rather than a
single, shared listener attached once to the wrapping `<div
id="quickAdd">` that inspects which button was actually clicked
afterward (a real, alternative technique called event delegation).
Both are legitimate; per-button listeners, as used here, are the
simpler mental model for a small, fixed group of three buttons that
won't grow or shrink after the page loads — the real cost that
delegation would avoid, and per-button listeners accept, is that a
truly large or dynamically-changing set of buttons would mean a
correspondingly large or dynamically-changing number of individual
listeners instead of one shared one.

### Commands Needed

None.

### Run It

Exercised as part of this lesson's closing full-project run, below.

### Connection

Every button can now genuinely react to its own click — the next unit
is what each reaction actually does.

---

## Concept Unit: Reading the Amount with `dataset` and `Number`

### The Problem

Every button's click callback runs now, but has no way yet to know
*which* button was clicked, specifically how much it's supposed to add
— `+1`, `+5`, and `+10` all currently do exactly the same (nothing).

> **Before reading on:** this lesson's Terms section already
> introduced `data-*` attributes, and each button's HTML already
> carries one: `data-amount="1"`, `data-amount="5"`,
> `data-amount="10"`. Given `btn` refers to whichever specific button
> was clicked, and this lesson's Header already named the real
> property that exposes `data-*` attributes to script, what would you
> guess `btn`'s own amount is accessible as?

### Introduce the Concept in Isolation

Throwaway HTML — `<button id="b" data-amount="5">+5</button>` — and
this script:

```js
const raw = btn.dataset.amount;
console.log(raw, typeof raw);
const converted = Number(raw);
console.log(converted, typeof converted);
console.log('raw + 1:', raw + 1);
console.log('converted + 1:', converted + 1);
```

Real run (Node + jsdom):

```
btn.dataset.amount: "5" | typeof: string
Number(raw): 5 | typeof: number
raw + 1 (string concatenation!): 51
converted + 1 (real addition): 6
```

This proves two real things at once: `dataset.amount` genuinely reads
the HTML's `data-amount="5"` attribute correctly, and its result is
genuinely a `string`, not a `number` — proven directly by `raw + 1`
producing `"51"` (`+` concatenating two strings, `"5"` and the string
form of `1`) instead of `6`. `Number(raw)` converts it to a real
number, and `converted + 1` then genuinely adds, producing `6`. This
gap between "looks like a number" and "is a number" is exactly why
`Number()` is needed here, not optional polish.

### Discard the Throwaway Example

This throwaway `<button id="b" data-amount="5">` isn't part of the
counter project. It existed only to prove the string/number gap for
real, before relying on `Number()` to close it in the real project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** inside the inner `btn.addEventListener` callback added
  in the previous unit.
- **Dependencies:** `btn`, already established.

### The New Code

```js
const amount = Number(btn.dataset.amount);
count = count + amount;
```

### The Updated Project

`script.js`, in full, this unit's new lines marked:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const countBtn = document.querySelector('#countBtn');
5  const countDisplay = document.querySelector('#countDisplay');
6  const resetBtn = document.querySelector('#resetBtn');
7  const quickAddButtons = document.querySelectorAll('.quickAddBtn');
8
9  let count = 0;
10
11 button.addEventListener('click', () => {
12   message.classList.toggle('hidden');
13 });
14
15 countBtn.addEventListener('click', () => {
16   count = count + 1;
17   countDisplay.textContent = `Clicked ${count} times`;
18 });
19
20 resetBtn.addEventListener('click', () => {
21   if (count !== 0) {
22     count = 0;
23     countDisplay.textContent = 'Clicked 0 times';
24   }
25 });
26
27 quickAddButtons.forEach((btn) => {
28   btn.addEventListener('click', () => {
29     const amount = Number(btn.dataset.amount);                    // ← new
30     count = count + amount;                                       // ← new
31   });
32 });
```

Lines 1–25 and 27–28, 31–32, everything from before this unit, are
unchanged. Lines 29–30 now give each button's click a real, distinct
effect: reading that specific button's own `data-amount`, converting
it to a real number, and adding it to `count` — `count` genuinely
changes correctly now, though nothing on the page shows it yet.

### Mechanical Walkthrough

- **`const`** — declares a binding that won't be reassigned; `amount`
  itself is computed fresh, once, every time this callback runs (once
  per real click), never reassigned within a single run.
- **`amount`** — the new variable name, holding this specific
  button's own numeric contribution.
- **`=`** — the assignment operator, explained in full in Lesson 1.
- **`Number`** — the function itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `Number` with one argument.
- **`btn`** — the parameter referring to whichever button was actually
  clicked, from two units ago.
- **`.dataset`** — the property itself, explained in full above; reads
  `btn`'s own `data-*` attributes as an object.
- **`.amount`** — reads specifically the `amount` key of that object,
  corresponding to the HTML's own `data-amount="..."` attribute on this
  exact button.
- **`;`** — ends the `const amount = ...` statement.
- **`count`** — the running total, read here for its current value,
  before this line reassigns it.
- **`= count + amount`** — a reassignment; the same mechanism Lesson 2
  established (`count = count + 1`), here adding a real, variable
  amount instead of always exactly `1`.
- **`;`** — ends the reassignment statement.

### CS Lens

Reading a value out of markup as a string and explicitly converting it
before using it numerically is a concrete instance of **type
coercion boundaries** — the real, general fact that data crossing from
one representation (HTML attribute text) into another (a program's own
numeric type) doesn't automatically carry its intended meaning across
that boundary; something on the receiving side has to make the
conversion explicit.

Also recognized in: reading a number typed into an HTML `<input>`
field (also always a string, always needing conversion); parsing a
number out of a JSON payload that happened to encode it as text;
reading a command-line argument (always a string, regardless of what
the person typed); reading an environment variable (always a string,
even for something like a port number).

### SE Lens

The real alternative not chosen is skipping `Number()` and relying on
`+` to "just work" — which, as this unit's own lab proved directly,
doesn't: string concatenation, not addition, would silently produce
`"01"`, `"05"`, `"010"`-style wrong results instead of a real error,
because JavaScript's `+` operator does real, valid string concatenation
whenever either side is a string, with no warning that this probably
wasn't the intent. The real cost of skipping the conversion isn't a
crash — it's a silent, wrong result that would look almost correct at
a glance (the count would still go up, just to the wrong number),
making it a genuinely harder bug to notice than an outright error would
be.

### Commands Needed

None.

### Run It

Exercised as part of this lesson's closing full-project run, below.

### Connection

`count` now genuinely changes by the right amount per button — the
final unit is what makes that change visible on the page.

---

## Concept Unit: Updating the Display After a Quick Add

### The Problem

`count` updates correctly now, invisibly — the same gap Lesson 2's own
final unit closed for the regular count button, now needing the
identical fix for these three new buttons.

> **Before reading on:** you've now written the line that displays
> `count` on the page twice already, in two previous lessons. Given
> `count` and `countDisplay` both already exist here, what would you
> type to make the display reflect `count`'s new value after a
> quick-add click?

### Introduce the Concept in Isolation

A fresh throwaway lab, against a different starting value than any
previous `textContent` lab used:

```js
console.log('before:', el.textContent);
el.textContent = 'Clicked 7 times';
console.log('after:', el.textContent);
```

Against a throwaway `<p id="p">Clicked 2 times</p>`. Real run (Node +
jsdom):

```
before: "Clicked 2 times"
after: "Clicked 7 times"
```

This reconfirms, once more, on a fresh starting value, that assigning
to `.textContent` replaces the element's entire visible text in one
step.

### Discard the Throwaway Example

This throwaway `<p id="p">` isn't part of the counter project. It
existed only to reconfirm the write-replaces-entirely behavior before
reusing it a third time in the real project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** inside the inner `btn.addEventListener` callback,
  after the reassignment added in the previous unit.
- **Dependencies:** `countDisplay`, `count`, both already established.

### The New Code

```js
countDisplay.textContent = `Clicked ${count} times`;
```

### The Updated Project

`script.js`, in full and final for this lesson, new line marked:

```js
 1  const button = document.querySelector('#toggleBtn');
 2  const message = document.querySelector('#message');
 3
 4  const countBtn = document.querySelector('#countBtn');
 5  const countDisplay = document.querySelector('#countDisplay');
 6  const resetBtn = document.querySelector('#resetBtn');
 7  const quickAddButtons = document.querySelectorAll('.quickAddBtn');
 8
 9  let count = 0;
10
11  button.addEventListener('click', () => {
12    message.classList.toggle('hidden');
13  });
14
15  countBtn.addEventListener('click', () => {
16    count = count + 1;
17    countDisplay.textContent = `Clicked ${count} times`;
18  });
19
20  resetBtn.addEventListener('click', () => {
21    if (count !== 0) {
22      count = 0;
23      countDisplay.textContent = 'Clicked 0 times';
24    }
25  });
26
27  quickAddButtons.forEach((btn) => {
28    btn.addEventListener('click', () => {
29      const amount = Number(btn.dataset.amount);
30      count = count + amount;
31      countDisplay.textContent = `Clicked ${count} times`;         // ← new
32    });
33  });
```

Lines 1–30 and 32–33, everything from before this unit, are unchanged.
Line 31 completes the feature: every quick-add click now both changes
`count` correctly and immediately shows the new value on the page,
using the identical template-literal mechanism Lesson 2 established.

### Mechanical Walkthrough

- **`countDisplay`** — the variable from Lesson 2's first unit, holding
  the real `<p id="countDisplay">` reference; the same single display
  element every counting feature in this project writes to.
- **`.textContent`** — the property itself, explained in full above;
  used here in its write form, the identical mechanism used twice
  already in this curriculum.
- **`=`** — the assignment operator, explained in full in Lesson 1.
- **`` ` ``Clicked `` ${ `` count `` } `` times`` ` ``** — a template
  literal, explained in full in Lesson 2; reads `count`'s current
  value — now potentially changed by `+1`, `+5`, or `+10`, depending on
  which button was actually clicked — at the moment this line runs.
- **`;`** — ends the statement.

### CS Lens

Not applicable — reuses this project's already-covered mechanism
(Lesson 2's own display-state-in-sync CS Lens); no new hard concept.

### SE Lens

The real choice worth naming: `countDisplay` is written to from *four*
separate places now (the regular count button, reset, and this
`forEach` loop covering three more buttons) — every one of them
targeting the identical single element, using the identical
mechanism. The real alternative would be giving each feature its own
separate display element; the real cost of *that* would be a page with
several numbers on it that all claim to represent "the count," with no
single, obvious place to look — keeping one shared `countDisplay`,
written to from every feature that changes `count`, is what keeps
"what does the page currently say the count is" a question with
exactly one honest answer.

### Commands Needed

None — plain HTML/JS, no build step.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature — three quick-add clicks, then the regular count
button, then reset, all exercised together per the Verification Rule's
Batching clause:

```
quickAddButtons.length: 3

--- clicking +1 ---
count: 1 | display: "Clicked 1 times"

--- clicking +5 ---
count: 6 | display: "Clicked 6 times"

--- clicking +10 ---
count: 16 | display: "Clicked 16 times"

--- regular countBtn still works alongside quick-add ---
count: 17 | display: "Clicked 17 times"

--- reset still works after quick-add usage ---
count: 0 | display: "Clicked 0 times"

--- Lesson 1 toggle still independent ---
message hidden now: false
```

`quickAddButtons.length: 3` confirms `querySelectorAll` found all
three real buttons. Each click adds the correct real amount
(`1`, then `5` more to reach `6`, then `10` more to reach `16`) —
direct, real proof `dataset`/`Number` read the right value per button,
not the same value three times. The last three lines confirm nothing
in this lesson's change disturbed Lessons 2, 3, or 1.

### Connection

This is the final piece — all three quick-add buttons now genuinely
work, independently, correctly, and stay in sync with every other
feature already built.

---

## Closing

**Connect the pieces.** One real click on the `+5` button, start to
finish: `document.querySelectorAll('.quickAddBtn')`, run once when the
page loaded, already holds all three real buttons as one collection.
`forEach`, also run once at load time, already visited each one and
registered an individual `addEventListener('click', ...)` on it — three
real, independent listeners, one of them sitting on this specific `+5`
button.

The user clicks it. The browser's event system invokes that one
button's own registered callback. Line 29 runs first:
`btn.dataset.amount` reads the real string `"5"` off this exact
button's own `data-amount="5"` HTML attribute; `Number(...)` converts
it to the real number `5`. Line 30 runs next: `count = count + amount`
reads `count`'s current value, adds the real `5` just read, and
reassigns `count` to the result — genuine arithmetic, not string
concatenation, specifically because of the conversion on the line
before. Line 31 runs last: the same template-literal mechanism Lesson
2 established rebuilds the display string from `count`'s new value and
writes it straight into `countDisplay`. The `+1` and `+10` buttons work
identically, each reading its own real `data-amount`, through the
exact same three lines — one shared piece of wiring code, correctly
producing three different, correct real effects, entirely because each
button carries its own real data for that one shared code to read.
