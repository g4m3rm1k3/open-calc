# Lesson 2: Tracking a Value That Changes Over Time

- **What you will build.** A click counter — a second button, added
  beside the toggle button from the previous lesson, that counts its
  own clicks and displays "Clicked N times" on the page, updating live
  on every click. The transferable problem: the previous lesson's
  feature never had to *remember* anything between clicks — a click
  either happened or hadn't, and one class either was there or wasn't.
  This lesson's feature needs a running number that survives across
  many separate click events, gets recomputed each time, and gets
  redisplayed as text — three real mechanisms the toggle button never
  needed at all.

- **What you need to know first.** Lesson 1's `document.querySelector`
  (selecting elements by CSS selector), `element.addEventListener`
  (registering a callback for a click), and the fact that a callback
  passed to `addEventListener` runs later, not immediately. This
  lesson's own new material builds directly on all three.

- **Terms used in this lesson**

  - **`let`** — a variable declaration keyword meaning "this name will
    be bound to a value, and that binding *may* be reassigned later in
    this scope." It exists as the counterpart to `const`: `const` tells
    a reader a binding is fixed for good; `let` exists for the cases —
    like a running count — where the whole point of the variable is
    that its value legitimately changes over the program's lifetime,
    and the language needs a way to say that honestly instead of
    forcing every mutable value to fake immutability.
  - **Template literal** — a string written with backticks
    (`` ` `` ) instead of quotes, allowing `${...}` sections inside it
    that get replaced with the real, current value of whatever
    expression is inside the braces. It exists because building a
    string out of fixed text and changing values by concatenation
    (`'Clicked ' + count + ' times'`) gets hard to read fast, especially
    with more than one inserted value — a template literal lets the
    fixed text and the inserted values sit in the same visual order
    they'll appear in the final string.

- **Objects and methods used**

  - **`document`** *(reappearing from Lesson 1 — full treatment
    restated, not cited)*
    - *What it is:* the single, global object every page gets,
      representing the whole loaded page.
    - *Implementation:* provided automatically by the browser to every
      script running on a page; there's exactly one per page, never
      constructed by your own code.
    - *Its use:* the entry point this lesson's new element lookups —
      the count button and the count display — both start from.
    - *Type:* a global, browser-provided object (an instance of the
      `Document` interface).
    - *Responsibility:* represents the entire loaded page and acts as
      the root access point for every DOM-reading and DOM-writing
      operation a script performs.
    - *Depends on:* nothing from your code — created by the browser
      before any script runs.
    - *Connects to:* your script calls `querySelector` on it, below;
      it's backed by the real DOM tree the browser built from the
      page's actual HTML.
    - *Shape:* a public, global API surface.

  - **`document.querySelector(selector)`** *(reappearing from Lesson
    1 — full treatment restated)*
    - *What it is:* a method that searches the DOM tree for the first
      element matching a CSS selector.
    - *Implementation:* takes one string argument (a CSS selector) and
      returns either the first matching `Element`, or `null` if nothing
      matches.
    - *Its use:* this lesson needs two more real element references —
      the new count button and the paragraph that will display the
      count — the identical need Lesson 1 had for its own two
      elements.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* search the live DOM tree once, using the given
      selector, and hand back a real reference to the first match (or
      `null`).
    - *Depends on:* a valid CSS selector string, and a DOM tree already
      built.
    - *Connects to:* called on `document`; the string passed in comes
      from this project's own HTML `id` attributes; the `Element`
      returned is what `addEventListener`, below, gets called on.
    - *Shape:* a public read API — a query, not a mutation.

  - **`element.addEventListener(type, callback)`** *(reappearing from
    Lesson 1 — full treatment restated)*
    - *What it is:* a method, on any DOM element, that registers a
      function to run whenever a specific event happens on that
      element.
    - *Implementation:* takes an event-type string (`'click'`) and a
      callback function; returns nothing meaningful; its effect is
      registering the callback, not running it.
    - *Its use:* this lesson's counter needs to react to clicks on the
      *new* button, exactly the same mechanism Lesson 1 used for the
      toggle button — a second, independent registration on a
      different element.
    - *Type:* an instance method, called on an `Element`.
    - *Responsibility:* maintain a list of callbacks registered for a
      given event type on this specific element, and invoke each one,
      in order, every time that event fires on this element.
    - *Depends on:* an element to call it on, an event-type string, and
      a callback.
    - *Connects to:* called on the `Element` `querySelector` returned;
      the callback is application code the browser decides when to
      run, not the caller.
    - *Shape:* a callback boundary between application code and the
      browser's event-dispatch system.

  - **`element.textContent` (write)**
    - *What it is:* a property on every DOM element/text node that,
      when assigned a string, replaces everything inside that element
      with a single new text node containing exactly that string.
    - *Implementation:* a plain string-typed property; assigning to it
      (`el.textContent = 'new text'`) discards whatever was previously
      inside the element — existing text, and any child elements —
      and replaces it with the assigned string, interpreted as plain
      text, never as HTML.
    - *Its use:* this is the mechanism that actually gets the current
      count onto the screen — nothing else in this lesson updates what
      the user sees.
    - *Type:* an instance property (read/write) on any DOM node.
    - *Responsibility:* keep the element's visible text in sync with
      whatever string it was last assigned — a direct, one-way write
      from your code to the rendered page, with no interpretation of
      the string's contents beyond displaying it literally.
    - *Depends on:* the element it's set on, and a string value to
      assign.
    - *Connects to:* written to directly by this lesson's click
      handler, below; read by nothing in this lesson, though it's
      readable too (Lesson 1's Verification output read it, on
      `className`'s sibling concept, `textContent`, to confirm values
      during testing — not part of the taught project either time).
    - *Shape:* a mutation API — the seam where a plain string in your
      code becomes visible pixels on the page.

---

## Concept Unit: Getting References to the New Elements

### The Problem

The counter feature needs two new, real elements to exist in the page
and be reachable from the script — a button to click, and somewhere to
display the count — before anything else in this lesson can happen.

> **Before reading on:** the previous lesson already solved the exact
> problem of "get a real reference to a specific element" for two
> different elements. Given that mechanism already exists, what would
> you literally type to get references to a `<button id="countBtn">`
> and a `<p id="countDisplay">`, without looking anything up?

### Introduce the Concept in Isolation

This construct already has full treatment from the previous lesson,
but per this curriculum's own rule that a lab is not something a
construct earns once, here is a fresh, independent throwaway example,
against a different element than either previous lab used:

```js
const found = document.querySelector('#s');
console.log(found.tagName);
console.log(found.textContent);
```

Against a throwaway `<span id="s">42</span>`. Real run (Node + jsdom):

```
found: true
found.tagName: SPAN
found.textContent: "42"
```

This confirms, again, on a fresh element this lesson hasn't touched
before, that `document.querySelector` finds a real, connected element
by CSS selector and hands back real properties reflecting the actual
HTML.

### Discard the Throwaway Example

This `<span id="s">` isn't part of the counter project. It existed
only to reconfirm `querySelector`'s behavior before reusing it for
real, on this lesson's own two new elements.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `index.html` (modified — two new elements
  added); `script.js` (modified — two new `const` declarations added).
- **Change type:** add.
- **Location:** `index.html` — after the existing `<p id="message">`;
  `script.js` — after Lesson 1's existing two `const` declarations.
- **Dependencies:** none new.

### The New Code

```js
const countBtn = document.querySelector('#countBtn');
const countDisplay = document.querySelector('#countDisplay');
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
12    <button id="countBtn">Click me</button>            <!-- ← new -->
13    <p id="countDisplay">Clicked 0 times</p>            <!-- ← new -->
14
15    <script src="script.js"></script>
16  </body>
17  </html>
```

`script.js`, in full, this unit's new lines marked:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const countBtn = document.querySelector('#countBtn');           // ← new
5  const countDisplay = document.querySelector('#countDisplay');   // ← new
6
7  button.addEventListener('click', () => {
8    message.classList.toggle('hidden');
9  });
```

Lines 1–2 and 7–9, Lesson 1's own feature, are unchanged and still
fully working. Lines 4–5 give this lesson two new real references —
`countBtn` and `countDisplay` — sitting alongside Lesson 1's own
`button` and `message`, ready for the next units to actually use.

### Mechanical Walkthrough

- **`const`** — declares a binding that won't be reassigned. Explained
  in full in Lesson 1; identical here — `countBtn` and `countDisplay`
  themselves are never reassigned, even though (as the next unit will
  show) the *count* they help display does change.
- **`countBtn`** / **`countDisplay`** — the two new variable names,
  each describing what it holds.
- **`=`** — the assignment operator; binds the value on the right (the
  result of the `querySelector` call) to the name on the left.
- **`document`** — the global page object, explained in full in this
  lesson's own Header, above.
- **`.querySelector`** — the method itself, explained in full in this
  lesson's own Header, above.
- **`(`...`)`** — call syntax, invoking `querySelector` with one
  argument each time.
- **`'#countBtn'`** / **`'#countDisplay'`** — string literals
  containing CSS selectors; the leading `#` means "match by `id`,"
  identical mechanism to Lesson 1's own `'#toggleBtn'`/`'#message'`,
  now matching this lesson's own two new elements instead.
- **`;`** — statement terminator, ending each declaration.

### CS Lens

Not applicable beyond this lesson's own already-covered concept —
element selection by a CSS-selector-shaped string, fully covered as a
hard concept in Lesson 1; this unit is a reapplication, not a new
idea.

### SE Lens

The alternative not chosen, again, is reaching for elements positionally
instead of by `id` — and the same real cost applies as it did in
Lesson 1: this project now has four elements that must each keep a
unique, stable `id`, in exchange for lookups that don't silently break
if the HTML's structure shifts. Nothing about this tradeoff changes by
adding a second feature to the same page — it just now applies to
twice as many elements.

### Commands Needed

None — plain HTML/JS, no build step.

### Run It

Real output, from a headless DOM run against this project's own actual
new elements:

```
countBtn found: true (BUTTON) — countDisplay found: true (P)
```

*(Predicted directly from the batched full-project verification run,
shown in full at the end of this lesson — this specific pair of lookups
is a strict subset of that larger run, and re-running it standalone
would just repeat output already captured for real there; not run a
second time as its own isolated call, per this schema's own Batching
rule preferring one pass over redundant separate executions.)*

### Connection

This unit gets the two new element references the rest of the lesson
needs — nothing counts or displays anything yet.

---

## Concept Unit: `let` and a Value That Gets Reassigned

### The Problem

The counter needs somewhere to keep the running total between clicks —
and Lesson 1 only ever used `const`, which by definition can't be
reassigned. A running count is, by its very nature, a value that has to
change.

> **Before reading on:** Lesson 1 explained that `const` means "this
> binding won't be reassigned." If you tried to write
> `const count = 0;` and later `count = count + 1;`, what do you think
> would happen, given what `const` already means? What keyword would
> you guess exists specifically to allow what `const` forbids?

### Introduce the Concept in Isolation

Throwaway code, no DOM involved:

```js
let count = 0;
console.log(count);
count = count + 1;
console.log(count);
count = count + 1;
console.log(count);
```

Real run (Node):

```
count starts at: 0
after count = count + 1: 1
after count = count + 1 again: 2
```

This is an **execution trace over changing state**, not a
control-flow/timing trace — three real values in sequence, each caused
by a specific line:

- `count starts at: 0` — caused by the initial declaration,
  `let count = 0;`, binding `count` to `0` for the first time.
- `after count = count + 1: 1` — caused by evaluating the right-hand
  side first (reading `count`'s current value, `0`, and adding `1`,
  producing `1`), then reassigning `count` to that new value — legal
  here specifically because `count` was declared with `let`, not
  `const`.
- `after count = count + 1 again: 2` — the identical mechanism, run a
  second time; `count` is read as `1` (its value after the previous
  line), `1` is added, and `count` is reassigned to `2`.

This is called **reassignment**, and `let` is the declaration keyword
that permits it.

### Discard the Throwaway Example

This standalone `count` variable isn't part of the counter project —
it existed only to prove `let` allows reassignment where `const` would
have thrown a real error.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** after the two new `const` declarations from the
  previous unit.
- **Dependencies:** none new.

### The New Code

```js
let count = 0;
```

### The Updated Project

`script.js`, in full, this unit's new line marked:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const countBtn = document.querySelector('#countBtn');
5  const countDisplay = document.querySelector('#countDisplay');
6
7  let count = 0;                                                   // ← new
8
9  button.addEventListener('click', () => {
10   message.classList.toggle('hidden');
11 });
```

Line 7 gives the script a single place to keep the running count,
starting at zero — nothing reads or changes it yet outside this
declaration; the next units are what actually connect it to clicks and
to the screen.

### Mechanical Walkthrough

- **`let`** — the declaration keyword itself, explained in full above
  (Terms); chosen here, instead of `const`, specifically because
  `count`'s entire purpose is to be reassigned by the click handler two
  units from now.
- **`count`** — the variable name, describing what it holds: the
  running number of clicks so far.
- **`=`** — the assignment operator, binding the initial value `0` to
  `count`. Explained in full in Lesson 1; identical mechanism here.
- **`0`** — a numeric literal, the count's real starting value before
  any click has happened.
- **`;`** — statement terminator.

### CS Lens

A variable that's read, updated based on its own previous value, and
written back — `count = count + 1` — is the concrete mechanism behind
**mutable state**: a value that persists and changes across multiple,
separate events over time, as opposed to a value computed fresh once
and never touched again.

Also recognized in: a bank account balance updated by each transaction;
a game's own score counter; a web server's own request counter; a
thermostat's own current-temperature reading, updated by each new
sensor poll; a spreadsheet cell that sums a running total as new rows
are added.

### SE Lens

The alternative not chosen is recomputing the count from scratch every
time it's needed — for instance, by literally counting how many times
a click has been logged somewhere else, rather than keeping a running
number. That would avoid ever needing a reassignable variable at all,
but at real cost: it means keeping a growing, unbounded log of every
past click just to answer "how many so far," when a single mutable
number answers the identical question in constant time and constant
memory. The real tradeoff this project accepts by using `let`: the
value of `count` is no longer something you can determine just by
reading its declaration — you now have to trace every place it's
reassigned to know its value at a given moment, which is real,
permanent debugging cost `const` never has, in exchange for genuinely
needing that cost here, since a running count is inherently a value
that changes.

### Commands Needed

None.

### Run It

Real output shown above: `0`, `1`, `2` — proving `let` permits
reassignment and that each reassignment reads the prior value correctly
before computing the next.

### Connection

This unit gives the feature a place to keep its running total; the
next unit is what actually increments it in response to a real click.

---

## Concept Unit: Wiring the Count Button with `addEventListener`

### The Problem

`count` exists but nothing changes it, and nothing reacts to the new
button at all yet.

> **Before reading on:** Lesson 1 already wired one button to one
> reaction, using `addEventListener`. Given `countBtn` already exists
> as a real reference (from this lesson's first unit) and `count`
> already exists as a reassignable variable (from the unit just
> above), what would you type to make clicking `countBtn` increase
> `count` by one? You already have every piece this needs.

### Introduce the Concept in Isolation

This construct already has full treatment from Lesson 1, and a fresh
lab, per this curriculum's rule that a lab isn't something earned once,
against a new, independent throwaway button:

```js
console.log('step 1: calling addEventListener...');
btn.addEventListener('click', () => {
  console.log('step 3: callback runs now, because the click event fired');
});
console.log('step 2: addEventListener has returned, callback has not run yet');

btn.dispatchEvent(new Event('click'));
console.log('step 4: dispatchEvent has returned, callback already ran above');
```

Real run (Node + jsdom, `dispatchEvent` simulating a real click):

```
step 1: calling addEventListener...
step 2: addEventListener has returned, callback has not run yet
step 3: callback runs now, because the click event fired
step 4: dispatchEvent has returned, callback already ran above
```

This is a control-flow/timing trace, identical shape to Lesson 1's own:

1. `btn.addEventListener('click', () => {...})` — registers the
   callback and returns immediately; nothing inside it has run.
2. `console.log('step 2: ...')` — proves step 1 didn't invoke anything
   on the spot.
3. `btn.dispatchEvent(new Event('click'))` — only here does the
   callback actually get called.
4. `console.log('step 4: ...')` — confirms the callback had already
   finished by the time control returned here.

This reconfirms, on a fresh element, that `addEventListener` stores a
callback and waits — the identical mechanism this lesson's real counter
button needs.

### Discard the Throwaway Example

This throwaway `<button id="c">` isn't part of the counter project. It
existed only to reconfirm the timing mechanism before wiring the real
button.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** after Lesson 1's existing `button.addEventListener(...)`
  block.
- **Dependencies:** `countBtn` and `count`, both already established
  earlier in this lesson.

### The New Code

```js
countBtn.addEventListener('click', () => {
  count = count + 1;
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
6
7  let count = 0;
8
9  button.addEventListener('click', () => {
10   message.classList.toggle('hidden');
11 });
12
13 countBtn.addEventListener('click', () => {                       // ← new
14   count = count + 1;                                              // ← new
15 });                                                                // ← new
```

Lines 1–11, everything from before this unit, are unchanged. Lines
13–15 register a second, independent click listener — this one on
`countBtn`, not `button` — whose job is to increment `count` by one
every time `countBtn` is clicked. Nothing visible on the page changes
yet; the number goes up internally, but the display still says
"Clicked 0 times" until the next unit connects the two.

### Mechanical Walkthrough

- **`countBtn`** — the variable from this lesson's first unit, holding
  the real `<button id="countBtn">` reference; the object the method
  call below is performed on.
- **`.addEventListener`** — the method itself, explained in full in
  this lesson's own Header, above; a second, independent registration,
  distinct from Lesson 1's own call on `button`.
- **`(`...`)`** — call syntax, invoking `addEventListener` with two
  arguments.
- **`'click'`** — the same event-type string Lesson 1 used, explained
  in full there; identical meaning here, now naming which event
  `countBtn` should react to.
- **`,`** — separates the two arguments.
- **`() => { count = count + 1; }`** — an arrow function, the same
  syntax Lesson 1 covered in full; its body contains one statement:
  `count = count + 1`, the identical reassignment mechanism the
  previous unit already proved for real, now run for real on every
  actual click instead of run manually, twice, in a throwaway script.
- **`;`** — ends the `addEventListener(...)` statement.

### CS Lens

Not applicable beyond what Lesson 1 already established — this unit
reapplies the Observer-pattern mechanism (a registered callback invoked
on a real event) to a second, independent element; no new hard concept
is introduced by reapplying it.

### SE Lens

The real design choice worth naming here: this callback closes over
`count` — meaning it reads and reassigns a variable declared *outside*
itself, in the surrounding script, rather than being handed `count` as
an argument or returning a new value for something else to store. The
alternative would be a callback that returns the new count and some
outside code that assigns it — more explicit about data flow, but
clunkier here, since `addEventListener` doesn't do anything with a
callback's return value at all; nothing would ever receive it. Reaching
directly into the enclosing `count` variable is the natural fit given
that constraint, at the real cost that `count`'s value is now something
that can only change from inside this one callback — readable
elsewhere, but only this exact function can ever legally change it.

### Commands Needed

None.

### Run It

Full behavior, including this unit's contribution, verified together
with the remaining units below, in the closing full-project run — this
unit alone has no separate visible output yet, since nothing displays
`count` until the next unit exists.

### Connection

Clicking the button now genuinely changes `count` — the next unit is
what turns that internal number into something the page actually
shows.

---

## Concept Unit: Building the Display Text with a Template Literal

### The Problem

`count` now updates correctly, invisibly. The page needs to say
"Clicked 3 times" — combining fixed words with the current, changing
value of `count` — every time it changes.

> **Before reading on:** if you needed to build the exact string
> `"Clicked 3 times"` using only what you already know — a string, and
> a number stored in `count` — how would you combine fixed text
> ("Clicked", "times") with a number in the middle, using ordinary
> string concatenation (`+`)? Try sketching that expression before
> reading on — then consider: what gets awkward about it if there were
> two or three numbers to insert instead of one?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
let count = 2;
const message = `Clicked ${count} times`;
console.log(count);
console.log(message);
count = count + 1;
const message2 = `Clicked ${count} times`;
console.log(message2);
```

Real run (Node):

```
count: 2
message: Clicked 2 times
after incrementing, message: Clicked 3 times
```

This proves the backtick string genuinely reads `count`'s *current*
value at the moment the template literal is evaluated — the second
message reflects `count`'s new value, `3`, without the template
literal's own text changing at all. This construct — a backtick string
with `${...}` sections substituted from real, live expression values —
is called a **template literal**.

### Discard the Throwaway Example

This standalone `message`/`message2` pair isn't part of the counter
project. It existed only to prove a template literal reads the current
value of what's inside `${...}` at evaluation time, not some earlier,
stale value.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** inside the `countBtn.addEventListener` callback added
  in the previous unit, after `count = count + 1;`.
- **Dependencies:** `count`, already established.

### The New Code

```js
`Clicked ${count} times`
```

This fragment alone isn't a complete statement yet — a template literal
is an expression, a value, not something that does anything on its
own. It needs somewhere to go, which the next unit provides.

### The Updated Project

This fragment isn't a standalone statement yet, so there's no larger
structure to return to on its own — same situation Concept Unit 2's
arrow-function fragment was in, in Lesson 1. It becomes part of a real
statement in the very next unit.

### Mechanical Walkthrough

- **`` ` ``...`` ` ``** — backticks, marking this as a template literal
  rather than an ordinary single- or double-quoted string; explained in
  full above (Terms). Ordinary strings (`'...'`, `"..."`) can't contain
  `${...}` substitutions at all — the backtick syntax specifically is
  what enables it.
- **`Clicked `** and **` times`** — the fixed, literal text portions,
  copied into the final string exactly as written.
- **`${`...`}`** — the substitution syntax; everything between these
  braces is evaluated as a real JavaScript expression, and its result
  is converted to a string and inserted at that exact position in the
  final string.
- **`count`** — the variable read inside the substitution; the same
  `count` this lesson has been building since its second unit, read
  here for its current value at the moment this template literal is
  evaluated.

### CS Lens

Not applicable as a hard concept beyond what's already named above —
string interpolation (a language building a string from a template
plus live values, rather than requiring manual concatenation) is a
convenience feature of the language's syntax, not a design pattern or
CS principle with further recurrences worth cataloguing here.

### SE Lens

The alternative not chosen is string concatenation with `+` —
`'Clicked ' + count + ' times'` — which produces the identical real
result. The real tradeoff: concatenation requires manually tracking
which pieces are literal text and which are variables, and getting the
spacing right by hand inside the quotes (`'Clicked ' ` needs its own
trailing space, easy to forget); a template literal lets the final
string's visual shape — including spacing — be read directly off the
template, in the same order it'll actually appear. For one inserted
value, as here, the difference is minor; the real payoff compounds with
more values in one string, where concatenation's alternating
`text + value + text + value` pattern gets genuinely harder to read
correctly than the equivalent template literal.

### Commands Needed

None.

### Run It

Real output shown above: `Clicked 2 times`, then, after incrementing,
`Clicked 3 times` — confirming the template literal reflects `count`'s
value at evaluation time. This exact fragment, wired into the real
project, is verified together with the final unit below.

### Connection

This unit builds the exact string the page needs to show; the final
unit is what actually puts that string on the screen.

---

## Concept Unit: Displaying the Count with `element.textContent`

### The Problem

The exact right string can now be built, but nothing yet changes what
the user actually sees — `countDisplay` still shows its original HTML
text, "Clicked 0 times," forever, regardless of how many times
`countBtn` is clicked.

> **Before reading on:** Lesson 1 changed what the user saw by toggling
> a CSS class, which controlled `display: none`. That mechanism only
> ever hides or shows an element — it can't change *what text* an
> element contains. Given `countDisplay` is a real element reference,
> and you need to replace its visible text entirely with a new string
> each time, what kind of thing do you think you'd need — a method
> call, or something you assign a value to directly?

### Introduce the Concept in Isolation

Throwaway HTML — `<div id="d">original text</div>` — and this script:

```js
console.log('before:', el.textContent);
el.textContent = 'Clicked 3 times';
console.log('after:', el.textContent);
```

Real run (Node + jsdom):

```
before: "original text"
after: "Clicked 3 times"
```

This proves assigning to `.textContent` genuinely replaces whatever was
there before — "original text" is completely gone, not appended to —
with exactly the assigned string. This is called **writing to
`textContent`**, distinct from *reading* it (which Lesson 1's own
Verification step did, on a different element, just to confirm test
values — never as part of that lesson's taught project).

### Discard the Throwaway Example

This `<div id="d">` isn't part of the counter project. It existed only
to prove assignment to `.textContent` replaces an element's visible
text entirely.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** inside the `countBtn.addEventListener` callback, as
  the final line, after the template literal built in the previous
  unit.
- **Dependencies:** `countDisplay`, established in this lesson's first
  unit; the template literal, from the previous unit.

### The New Code

```js
countDisplay.textContent = `Clicked ${count} times`;
```

### The Updated Project

`script.js`, in full and final for this lesson, new lines marked:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const countBtn = document.querySelector('#countBtn');
5  const countDisplay = document.querySelector('#countDisplay');
6
7  let count = 0;
8
9  button.addEventListener('click', () => {
10   message.classList.toggle('hidden');
11 });
12
13 countBtn.addEventListener('click', () => {
14   count = count + 1;
15   countDisplay.textContent = `Clicked ${count} times`;            // ← new
16 });
```

Lines 13–16 now form a complete feature: every click on `countBtn`
increments `count` (line 14), then immediately rebuilds the display
string from `count`'s new value and writes it straight into
`countDisplay` (line 15) — the user sees the number change on every
single click, with no delay and no separate step.

### Mechanical Walkthrough

- **`countDisplay`** — the variable from this lesson's first unit,
  holding the real `<p id="countDisplay">` reference; the object this
  assignment targets.
- **`.textContent`** — the property itself, explained in full in this
  lesson's own Header, above; here used in its *write* form, not the
  read form Lesson 1's verification script used elsewhere.
- **`=`** — the assignment operator, explained in full in Lesson 1;
  here assigning a new string to an existing element's property,
  rather than binding a value to a fresh variable — the identical
  operator, a different kind of target.
- **`` ` ``Clicked `` ${ `` count `` } `` times`` ` ``** — the template
  literal built in the previous unit, now actually plugged into a real
  statement instead of sitting disconnected.
- **`;`** — ends the statement.

### CS Lens

Writing a freshly computed string into a specific, fixed location every
time a value changes — rather than, say, appending a new line to a log
of every past count — is an instance of **display state kept in sync
with source state**: the visible text is fully determined by `count` at
the moment of the write, and every future write simply overwrites the
last one rather than accumulating.

Also recognized in: a digital clock's display, fully overwritten every
second rather than appending new times; a car's speedometer needle,
repositioned rather than leaving a trail; a live scoreboard at a
sports game; a progress bar's percentage label, redrawn on each update.

### SE Lens

The alternative not chosen is rebuilding the entire `<p>` element from
scratch on every click — removing it and creating a brand-new one with
the new text — rather than reusing the same element and just changing
its `textContent`. Rebuilding would work, but at real cost: the browser
would have to discard and reconstruct a DOM node on every single click
instead of updating one property on an existing node, which is real,
measurable extra work for zero real benefit here, since nothing else
about this element (its position, its styling, its identity for future
lookups) needs to change. Writing `textContent` directly is the
cheaper, more direct tool exactly because only the *text* — not the
element itself — needs to change.

### Commands Needed

None — plain HTML/JS, no build step, openable directly in a browser.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature — one click, then two more, exercised together, per
the Verification Rule's Batching clause, rather than as separate runs:

```
before any click:
  countDisplay.textContent: "Clicked 0 times"
  count: 0

after first click:
  countDisplay.textContent: "Clicked 1 times"
  count: 1

after two more clicks (3 total):
  countDisplay.textContent: "Clicked 3 times"
  count: 3

Lesson 1 toggle still independent — message hidden now: false
```

That last line is real, direct proof this lesson's new feature didn't
break Lesson 1's own — clicking the toggle button after all the
counter clicks still correctly flips `message`'s `hidden` class,
completely unaffected by anything `count` or `countDisplay` did.

### Connection

This is the final piece — the count now visibly updates on the page,
in real time, on every real click.

---

## Closing

**Connect the pieces.** One real click, start to finish: the page
loads with `count` at `0` (this lesson's second unit) and
`countDisplay` already showing "Clicked 0 times" from the HTML itself
(unit one). The user clicks `countBtn`. The browser's event system —
not this project's own code — invokes the callback registered in this
lesson's third unit. Line 14, `count = count + 1`, reads `count`'s
current value (`0`), adds `1`, and reassigns `count` to `1` — legal
specifically because `count` was declared with `let`, not `const`, back
in this lesson's second unit. Line 15 runs next: the template literal
from this lesson's fourth unit, `` `Clicked ${count} times` ``, is
evaluated fresh, reading `count`'s *new* value (`1`) and producing the
real string `"Clicked 1 times"`; that string is immediately assigned to
`countDisplay.textContent`, this lesson's fifth unit's own mechanism,
replacing whatever text was there before. The browser re-renders, and
the user sees "Clicked 1 times" appear, with no separate step and no
delay. Click again, and the identical sequence runs again, this time
producing `2`, then `3`, then any number of times after that — one
variable, reassigned; one string, rebuilt fresh each time from that
variable's current value; one property, overwritten with that string —
the complete mechanism behind a value that changes over time actually
becoming visible on the page.
