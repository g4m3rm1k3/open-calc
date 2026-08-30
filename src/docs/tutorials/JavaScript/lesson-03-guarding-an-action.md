# Lesson 3: Guarding an Action with a Condition

- **What you will build.** A Reset button that sets the click count
  back to zero — but only does anything at all if there's actually
  something to reset. The transferable problem: every feature this
  curriculum has built so far runs its full body unconditionally,
  every single time its event fires. This lesson's feature is the
  first one that has to ask a real question first — "is this action
  even meaningful right now?" — and only proceed if the answer is yes.

- **What you need to know first.** Lesson 1's `document.querySelector`
  and `element.addEventListener`. Lesson 2's `let`/reassignment and
  `element.textContent` (write) — this lesson reuses all four
  directly, plus introduces the first real branching logic this
  curriculum has needed.

- **Terms used in this lesson**

  - **`if` statement** — a control-flow construct that runs a block of
    code only when a given condition evaluates to `true`, and skips it
    entirely otherwise. It exists because not every action a program
    performs should always happen — a program needs some way to say
    "do this, but only under this specific circumstance," rather than
    running every line unconditionally from top to bottom.
  - **`!==` (strict inequality operator)** — compares two values and
    produces `true` if they are *not* equal, `false` if they are. It
    exists as the direct counterpart to `===` (strict equality): a
    program frequently needs to ask "is this NOT the case" just as
    often as "is this the case," and writing `!(count === 0)` to mean
    the same thing as `count !== 0` is legal but less direct — `!==`
    exists so "not equal" can be written as its own single operator
    instead of a negation wrapped around an equality check.

- **Objects and methods used**

  - **`document`** *(reappearing from Lessons 1–2 — full treatment
    restated)*
    - *What it is:* the single, global object every page gets,
      representing the whole loaded page.
    - *Implementation:* provided automatically by the browser; exactly
      one per page, never constructed by your own code.
    - *Its use:* the entry point this lesson's new Reset button
      lookup starts from, identical to every previous element lookup
      in this curriculum.
    - *Type:* a global, browser-provided object (an instance of the
      `Document` interface).
    - *Responsibility:* represents the entire loaded page and acts as
      the root access point for every DOM-reading and DOM-writing
      operation a script performs.
    - *Depends on:* nothing from your code.
    - *Connects to:* your script calls `querySelector` on it, below.
    - *Shape:* a public, global API surface.

  - **`document.querySelector(selector)`** *(reappearing — full
    treatment restated)*
    - *What it is:* a method that searches the DOM tree for the first
      element matching a CSS selector.
    - *Implementation:* takes one string argument (a CSS selector) and
      returns either the first matching `Element`, or `null`.
    - *Its use:* this lesson needs one more real element reference —
      the Reset button — the identical need every previous lesson had.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* search the live DOM tree once, using the given
      selector, and hand back a real reference to the first match (or
      `null`).
    - *Depends on:* a valid CSS selector string, and a DOM tree already
      built.
    - *Connects to:* called on `document`; the `Element` returned is
      what `addEventListener`, below, gets called on.
    - *Shape:* a public read API — a query, not a mutation.

  - **`element.addEventListener(type, callback)`** *(reappearing —
    full treatment restated)*
    - *What it is:* a method, on any DOM element, that registers a
      function to run whenever a specific event happens on that
      element.
    - *Implementation:* takes an event-type string (`'click'`) and a
      callback function; returns nothing meaningful.
    - *Its use:* this lesson's Reset button needs to react to clicks,
      exactly the same mechanism the previous two lessons already used
      for their own buttons.
    - *Type:* an instance method, called on an `Element`.
    - *Responsibility:* maintain a list of callbacks registered for a
      given event type on this specific element, and invoke each one,
      in order, every time that event fires.
    - *Depends on:* an element to call it on, an event-type string, and
      a callback.
    - *Connects to:* called on the `Element` `querySelector` returned;
      the callback is application code the browser decides when to
      run.
    - *Shape:* a callback boundary between application code and the
      browser's event-dispatch system.

  - **`element.textContent` (write)** *(reappearing from Lesson 2 —
    full treatment restated)*
    - *What it is:* a property on every DOM element that, when
      assigned a string, replaces everything inside that element with
      a new text node containing exactly that string.
    - *Implementation:* a plain string-typed property; assigning to it
      discards whatever was previously inside the element and replaces
      it with the assigned string, as plain text.
    - *Its use:* this lesson uses it to put the page back to "Clicked
      0 times" — the identical mechanism Lesson 2 used to display the
      running count, now assigned a fixed string instead of a
      template-literal-built one.
    - *Type:* an instance property (read/write) on any DOM node.
    - *Responsibility:* keep the element's visible text in sync with
      whatever string it was last assigned.
    - *Depends on:* the element it's set on, and a string value to
      assign.
    - *Connects to:* written to directly by this lesson's reset
      handler, below.
    - *Shape:* a mutation API — the seam where a string in your code
      becomes visible pixels on the page.

---

## Concept Unit: Selecting the Reset Button

### The Problem

Before anything can happen on a Reset click, the script needs a real
reference to the Reset button itself — the same starting requirement
every feature in this curriculum has had.

> **Before reading on:** you've now written this exact kind of lookup
> three separate times, for three separate elements. Given a
> `<button id="resetBtn">` exists in the HTML, what would you type,
> without looking anything up, to get a real reference to it?

### Introduce the Concept in Isolation

A fresh throwaway lab, per this curriculum's own rule that a lab isn't
something earned once, against a new element:

```js
const found = document.querySelector('#link');
console.log(found.tagName);
```

Against a throwaway `<a id="link">click me</a>`. Real run (Node +
jsdom):

```
found: true
found.tagName: A
```

This reconfirms, on a fresh element type this curriculum hasn't
selected before (an `<a>` tag, not a `<button>` or `<p>`), that
`document.querySelector` finds any real element matching its selector,
regardless of tag.

### Discard the Throwaway Example

This `<a id="link">` isn't part of the counter project. It existed only
to reconfirm the lookup mechanism works identically across different
tag types, before reusing it for the real Reset button.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `index.html` (modified — one new button added);
  `script.js` (modified — one new `const` declaration added).
- **Change type:** add.
- **Location:** `index.html` — after the existing `<p id="countDisplay">`;
  `script.js` — after the existing `countDisplay` declaration.
- **Dependencies:** none new.

### The New Code

```js
const resetBtn = document.querySelector('#resetBtn');
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
14    <button id="resetBtn">Reset</button>                <!-- ← new -->
15
16    <script src="script.js"></script>
17  </body>
18  </html>
```

`script.js`, in full, this unit's new line marked:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const countBtn = document.querySelector('#countBtn');
5  const countDisplay = document.querySelector('#countDisplay');
6  const resetBtn = document.querySelector('#resetBtn');           // ← new
7
8  let count = 0;
9
10 button.addEventListener('click', () => {
11   message.classList.toggle('hidden');
12 });
13
14 countBtn.addEventListener('click', () => {
15   count = count + 1;
16   countDisplay.textContent = `Clicked ${count} times`;
17 });
```

Lines 1–5 and 8–17, everything from before this unit, are unchanged.
Line 6 gives this lesson its one new element reference — nothing reacts
to it yet.

### Mechanical Walkthrough

- **`const`** — declares a binding that won't be reassigned; explained
  in full in Lesson 1; identical here.
- **`resetBtn`** — the new variable name, describing what it holds.
- **`=`** — the assignment operator, explained in full in Lesson 1.
- **`document`** — the global page object, explained in full above.
- **`.querySelector`** — the method itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `querySelector` with one
  argument.
- **`'#resetBtn'`** — a string literal CSS selector; the leading `#`
  means "match by `id`," identical mechanism to every previous
  selector string in this curriculum, now matching this lesson's new
  button.
- **`;`** — statement terminator.

### CS Lens

Not applicable beyond this curriculum's own already-covered concept —
element selection by CSS selector, fully covered as a hard concept in
Lesson 1.

### SE Lens

The same tradeoff already named in Lessons 1 and 2 applies again,
unchanged: selecting by a stable `id` instead of by position keeps this
lookup working regardless of where `resetBtn` sits in the page, at the
cost of one more element that has to carry a unique `id` going forward.

### Commands Needed

None.

### Run It

This lookup is exercised for real as part of this lesson's closing
full-project run, below — not re-run standalone here, per the
Verification Rule's Batching clause, since that larger run already
covers it.

### Connection

This unit gets the one new element reference this lesson needs —
nothing reacts to Reset yet.

---

## Concept Unit: Wiring the Reset Button

### The Problem

`resetBtn` exists but nothing happens when it's clicked. The simplest
possible version of "reset" — unconditionally setting the count back to
zero — needs to exist before this lesson's real subject (only doing
that conditionally) can be added on top of it.

> **Before reading on:** you've now wired two buttons to click
> reactions in this curriculum. Given `resetBtn`, `count`, and
> `countDisplay` all already exist, what would the simplest possible
> version of "clicking Reset sets the count back to 0 and updates the
> display" look like, ignoring for now whether that's always the
> right thing to do?

### Introduce the Concept in Isolation

A fresh throwaway lab, against a new button:

```js
console.log('step 1: calling addEventListener...');
btn.addEventListener('click', () => {
  console.log('step 3: callback runs now, because the click event fired');
});
console.log('step 2: addEventListener has returned, callback has not run yet');

btn.dispatchEvent(new Event('click'));
console.log('step 4: dispatchEvent has returned, callback already ran above');
```

Against a throwaway `<button id="r">reset</button>`. Real run (Node +
jsdom):

```
step 1: calling addEventListener...
step 2: addEventListener has returned, callback has not run yet
step 3: callback runs now, because the click event fired
step 4: dispatchEvent has returned, callback already ran above
```

The identical control-flow/timing trace shape as every previous
`addEventListener` lab in this curriculum: registering the callback
(step 1) doesn't run it; only the actual click (`dispatchEvent`, real
or simulated) does, and only after that does the callback's own code
run (step 3), confirmed by step 2 printing first.

### Discard the Throwaway Example

This throwaway `<button id="r">` isn't part of the counter project. It
existed only to reconfirm the timing mechanism before wiring the real
Reset button.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** after the existing `countBtn.addEventListener(...)`
  block.
- **Dependencies:** `resetBtn`, `count`, and `countDisplay`, all
  already established.

### The New Code

```js
resetBtn.addEventListener('click', () => {
  count = 0;
  countDisplay.textContent = 'Clicked 0 times';
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
7
8  let count = 0;
9
10 button.addEventListener('click', () => {
11   message.classList.toggle('hidden');
12 });
13
14 countBtn.addEventListener('click', () => {
15   count = count + 1;
16   countDisplay.textContent = `Clicked ${count} times`;
17 });
18
19 resetBtn.addEventListener('click', () => {                       // ← new
20   count = 0;                                                      // ← new
21   countDisplay.textContent = 'Clicked 0 times';                   // ← new
22 });                                                                // ← new
```

Lines 1–17, everything from before this unit, are unchanged. Lines
19–22 register a third, independent click listener — clicking Reset now
genuinely sets `count` back to `0` and rewrites the display to say so,
every single time it's clicked, with no distinction yet between
"there's something to reset" and "there isn't."

### Mechanical Walkthrough

- **`resetBtn`** — the variable from this lesson's first unit, holding
  the real `<button id="resetBtn">` reference.
- **`.addEventListener`** — the method itself, explained in full above;
  a third, independent registration.
- **`(`...`)`** — call syntax, invoking `addEventListener` with two
  arguments.
- **`'click'`** — the same event-type string used by every listener in
  this curriculum so far.
- **`,`** — separates the two arguments.
- **`() => {`...`}`** — an arrow function, the same syntax fully
  explained in Lesson 1; its body contains two statements.
- **`count = 0`** — a reassignment; explained in full as a mechanism
  in Lesson 2 (`count = count + 1` there), the identical operator here
  assigning a fixed literal, `0`, instead of a computed expression —
  legal for the same reason Lesson 2's reassignment was: `count` was
  declared with `let`.
- **`countDisplay.textContent = 'Clicked 0 times'`** — this exact
  mechanism (`.textContent`, write form) already has full treatment in
  this lesson's own Header, above, since it reappears from Lesson 2;
  the next Concept Unit picks this specific line back up to show its
  own fresh, isolated proof, the same deferral pattern Lesson 1 used
  between its own `addEventListener` and `classList.toggle` units.
- **`;`** — ends each statement.

### CS Lens

Not applicable beyond what's already established — this unit reapplies
the Observer-pattern mechanism (Lesson 1's CS Lens) to a third,
independent element.

### SE Lens

The real, deliberate choice recorded here: this unit's own code resets
unconditionally, on purpose, as a genuine intermediate step — not
because it's the intended final behavior, but because building the
unconditional version first, then narrowing it with a guard in the next
unit, means each piece can be verified independently. The alternative —
writing the guarded version directly, in one step — would work
identically for the reader following along, but would make it harder
to tell, if something went wrong, whether the failure was in the reset
logic itself or in the condition wrapped around it.

### Commands Needed

None.

### Run It

Exercised as part of this lesson's closing full-project run, below.

### Connection

Reset now genuinely works — the next unit re-examines the
`textContent` line inside it on its own terms, and the unit after that
is what makes Reset only act when there's actually something to reset.

---

## Concept Unit: Writing "Clicked 0 times" with `textContent`

### The Problem

The previous unit's code already writes to `countDisplay.textContent`
— but that specific line was shown as part of a larger fragment, not
proven on its own. This lesson's rule for reappearing constructs
requires a fresh, independent proof, not a citation back to Lesson 2's.

> **Before reading on:** Lesson 2 proved that assigning to
> `.textContent` replaces an element's entire visible text. Given that,
> what do you expect `countDisplay.textContent = 'Clicked 0 times'` to
> do to whatever text was showing right before it ran — partially
> update it, or replace it completely?

### Introduce the Concept in Isolation

A fresh throwaway lab, against a different starting value than either
previous `textContent` lab used:

```js
console.log('before:', el.textContent);
el.textContent = 'Clicked 0 times';
console.log('after:', el.textContent);
```

Against a throwaway `<p id="p">Clicked 7 times</p>`. Real run (Node +
jsdom):

```
before: "Clicked 7 times"
after: "Clicked 0 times"
```

This reconfirms, starting from a nonzero display value this time, that
assigning to `.textContent` replaces the element's entire visible text
in one step — "Clicked 7 times" doesn't partially update; it's
discarded completely and replaced.

### Discard the Throwaway Example

This throwaway `<p id="p">` isn't part of the counter project. It
existed only to reconfirm the write-replaces-entirely behavior on a
fresh starting value before relying on it again in the real project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none — this unit's code, `countDisplay.textContent
  = 'Clicked 0 times'`, was already added to `script.js` as part of the
  previous unit; nothing further is added to the tracked project file
  here.
- **Change type:** none (explanation only, anchored to already-shown
  code).
- **Location:** not applicable — no new location in the tracked file.
- **Dependencies:** the line itself, already present in `script.js`
  from the previous unit (shown again below for reference).

### The New Code

Already present in `script.js`, from the previous unit — shown here
again as the dependency this unit's explanation is anchored to:

```js
countDisplay.textContent = 'Clicked 0 times';
```

### The Updated Project

Not applicable — this unit adds no new line to the tracked project
file; the line above already exists in `script.js` exactly as shown in
the previous unit's Updated Project step.

### Mechanical Walkthrough

- **`countDisplay`** — the variable from Lesson 2's first unit, holding
  the real `<p id="countDisplay">` reference; the object this
  assignment targets.
- **`.textContent`** — the property itself, explained in full in this
  lesson's own Header, above; used here in its write form, the
  identical mechanism Lesson 2 used to display the running count, now
  assigned a fixed string instead of one built from a template
  literal.
- **`=`** — the assignment operator, explained in full in Lesson 1;
  here assigning a new string directly to an existing element's
  property.
- **`'Clicked 0 times'`** — a plain string literal, not a template
  literal — no `${...}` substitution is needed here, because unlike
  Lesson 2's count display, this string never varies: resetting always
  produces the exact same text, so there's nothing to interpolate.
- **`;`** — ends the statement.

### CS Lens

Not applicable — this unit reconfirms an already-covered mechanism
(Lesson 2's CS Lens on display state kept in sync with source state);
no new hard concept.

### SE Lens

The real choice worth naming: a plain string literal was used here
instead of a template literal, even though Lesson 2 established
template literals as the tool for building `countDisplay`'s text. The
real reason: a template literal's entire value is substituting a
*varying* expression into fixed text — when the text never varies at
all, as it doesn't here, a template literal would add the visual
overhead of backticks and `${...}` syntax for zero real benefit over a
plain string. Reaching for the more powerful tool only when the
situation actually calls for it — not by default, just because it was
used nearby — is the real judgment call this unit records.

### Commands Needed

None.

### Run It

Real output shown above: `"Clicked 7 times"` → `"Clicked 0 times"`,
reconfirming the write-replaces-entirely behavior. The real project's
own use of this line is exercised in this lesson's closing full-project
run, below.

### Connection

This confirms, independently, that the reset line already wired in the
previous unit does what it's supposed to — the final unit is what
makes it run only when it should.

---

## Concept Unit: Guarding the Reset with `if` and `!==`

### The Problem

Right now, clicking Reset always runs its full body — even when
`count` is already `0`, in which case there's nothing meaningful to
reset at all. Nothing distinguishes "there's something to reset" from
"there isn't."

> **Before reading on:** given `count` already holds the current count
> as a real number, and this lesson's Terms section just introduced
> `!==` as "not equal," what would the condition "count is not
> currently zero" look like, written as a real JavaScript expression?
> What do you think should happen to the two lines already inside the
> Reset callback if that condition is false?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
function maybeReset(count) {
  console.log(`called with count = ${count}`);
  if (count !== 0) {
    console.log('  count !== 0 evaluated to true — entering the if block');
    count = 0;
    console.log('  count reset to:', count);
  } else {
    console.log('  count !== 0 evaluated to false — if block skipped entirely');
  }
  return count;
}
maybeReset(5);
maybeReset(0);
```

Real run (Node):

```
called with count = 5
  count !== 0 evaluated to true — entering the if block
  count reset to: 0

called with count = 0
  count !== 0 evaluated to false — if block skipped entirely
```

This is a control-flow trace, not a changing-value one — the point is
*which branch runs*, not a sequence of accumulating values:

1. `maybeReset(5)` — `count !== 0` compares `5` to `0`; they're not
   equal, so the comparison evaluates to `true`.
2. Because the condition is `true`, the `if` block's own body runs:
   `count` is reassigned to `0` and logged.
3. `maybeReset(0)` — `count !== 0` compares `0` to `0`; they *are*
   equal, so the comparison evaluates to `false`.
4. Because the condition is `false`, the `if` block's body is skipped
   entirely — the `else` branch's own log line runs instead, and
   `count` is returned unchanged.

This construct — running a block only when a condition evaluates to
`true`, skipping it otherwise — is called an **`if` statement**.

### Discard the Throwaway Example

This standalone `maybeReset` function isn't part of the counter
project. It existed only to prove `if`/`!==` genuinely branch — running
one path or the other, never both — before relying on that inside the
real Reset callback.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** replace — wrapping the two existing lines inside the
  Reset callback with a condition, not adding a new, separate action.
- **Location:** inside the `resetBtn.addEventListener` callback added
  two units ago.
- **Dependencies:** `count`, `countDisplay`, both already established.

### The New Code

```js
if (count !== 0) {
  count = 0;
  countDisplay.textContent = 'Clicked 0 times';
}
```

### The Updated Project

`script.js`, in full and final for this lesson, new lines marked
(the two lines that existed before are now indented one level inside
the new `if` block, marked as changed rather than newly added, since
their own content is identical — only their surrounding context
changed):

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const countBtn = document.querySelector('#countBtn');
5  const countDisplay = document.querySelector('#countDisplay');
6  const resetBtn = document.querySelector('#resetBtn');
7
8  let count = 0;
9
10 button.addEventListener('click', () => {
11   message.classList.toggle('hidden');
12 });
13
14 countBtn.addEventListener('click', () => {
15   count = count + 1;
16   countDisplay.textContent = `Clicked ${count} times`;
17 });
18
19 resetBtn.addEventListener('click', () => {
20   if (count !== 0) {                                              // ← new
21     count = 0;
22     countDisplay.textContent = 'Clicked 0 times';
23   }                                                                // ← new
24 });
```

Lines 1–17, everything from before this unit, are unchanged. Line 20
now guards the whole reset action behind a real condition; lines 21–22,
identical in content to before, only run at all when that condition
holds; line 23 closes the block. Clicking Reset when `count` is already
`0` now does nothing at all — no reassignment, no display rewrite —
where it previously ran both unconditionally every time.

### Mechanical Walkthrough

- **`if`** — the keyword itself, explained in full above (Terms);
  begins a conditional block.
- **`(`...`)`** — encloses the condition to test; not a function call
  here, but `if`'s own required syntax for where its condition goes.
- **`count`** — the variable holding the current count, read here for
  comparison, not reassigned by this line itself.
- **`!==`** — the strict inequality operator, explained in full above
  (Terms); compares `count`'s current value against `0` and produces a
  real boolean (`true` or `false`).
- **`0`** — a numeric literal, the value `count` is being compared
  against — specifically the value that means "nothing has been
  counted, nothing to reset."
- **`{`...`}`** — the block that runs only when the condition is
  `true`; contains the two lines that already existed, now
  conditionally executed instead of unconditional.
- **`count = 0`** — the reassignment; already explained in full earlier
  in this lesson.
- **`countDisplay.textContent = 'Clicked 0 times'`** — already given
  full, fresh treatment two units above.

### CS Lens

An `if` statement is the most basic real instance of **conditional
branching**: a program choosing between two possible continuations
based on a real, evaluated condition, rather than always executing the
same fixed sequence of instructions.

Also recognized in: a thermostat deciding whether to turn on heating
based on a real temperature reading; a traffic light deciding whether
to stay green based on a real sensor or timer; a spell-checker deciding
whether to flag a word based on a real dictionary lookup; a loan
application deciding approval based on real, evaluated criteria; every
`if` in every programming language that has one, which is effectively
all of them.

### SE Lens

The real alternative not chosen here is letting the reset always run,
and treating "count was already 0" as harmless — after all,
`countDisplay.textContent = 'Clicked 0 times'` when it's already
"Clicked 0 times" produces the same visible result either way. That's
true for *this specific feature*, which is exactly why the guard here
is more about correctness as a habit than a strictly necessary fix for
this one case: the real cost of skipping the guard would only show up
if this callback ever grew to do something with a real side effect
beyond a harmless rewrite — logging every reset to a server, for
instance, where "reset when there was nothing to reset" would produce a
real, incorrect log entry. Writing the guard now, even though its
absence wouldn't visibly break anything today, is the honest tradeoff:
slightly more code, in exchange for the callback's behavior matching
its actual intent — "reset if needed" — rather than happening to look
correct by coincidence.

### Commands Needed

None.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature, exercising the guard directly — clicking Reset while
already at zero, then after real clicks, then immediately again:

```
--- clicking reset while count is already 0 ---
before: "Clicked 0 times" | count: 0
after:  "Clicked 0 times" | count: 0

--- clicking count button 4 times ---
countDisplay.textContent: "Clicked 4 times" | count: 4

--- clicking reset now that count is 4 ---
countDisplay.textContent: "Clicked 0 times" | count: 0

--- clicking reset again immediately (count already 0) ---
countDisplay.textContent: "Clicked 0 times" | count: 0

--- Lesson 1 toggle still independent ---
message hidden now: false
```

The first block proves the guard genuinely does nothing when there's
nothing to reset (no error, no unnecessary write — `count` stays
exactly `0`, untouched). The middle blocks prove a real reset still
works correctly once there's something to reset. The last line proves,
again, that nothing in this lesson's change disturbed Lesson 1's own
independent feature.

### Connection

This is the final piece — Reset now only acts when there's genuinely
something to reset, completing this lesson's real subject: an action
that runs conditionally instead of unconditionally.

---

## Closing

**Connect the pieces.** One real sequence, start to finish: the page
loads with `count` at `0`. The user clicks Reset immediately, before
ever touching the count button. This lesson's final unit's own code
runs: `count !== 0` compares `0` to `0`, evaluates to `false`, and the
entire block — the reassignment and the display rewrite alike — is
skipped. Nothing changes; `countDisplay` still reads "Clicked 0 times,"
exactly as before, and no unnecessary work happened.

The user then clicks the count button four times, and Lesson 2's own
mechanism runs each time: `count` climbs to `4`, and `countDisplay`
ends up reading "Clicked 4 times." Now the user clicks Reset again.
This time `count !== 0` compares `4` to `0` — not equal, so the
condition evaluates to `true`, and the block this lesson built actually
runs: line 21 (`count = 0`, the same reassignment mechanism Lesson 2
introduced) sets `count` back to zero, and line 22 (`.textContent`,
reconfirmed fresh in this lesson's third unit) rewrites the display to
"Clicked 0 times." A second, immediate Reset click right after this one
repeats the very first scenario — `count !== 0` is `false` again, and
the guard correctly does nothing a second time. One condition,
evaluated fresh on every click, deciding — correctly, every time —
whether there's actually anything to reset.
