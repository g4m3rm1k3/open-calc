# Lesson 6: Validating Input Before Acting On It

- **What you will build.** Two real improvements to the Add form from
  the previous lesson: pressing Enter in the amount field now adds a
  button, the same as clicking Add — and the Add button itself becomes
  genuinely unclickable whenever the typed value isn't a real, usable
  amount. The transferable problem: every feature this curriculum has
  built so far trusted its input completely — a click always meant
  "do the thing." This lesson's feature is the first one that has to
  treat its own input as something that might be wrong, and has to
  decide, continuously, whether acting on it right now is even safe.

- **What you need to know first.** Lesson 5's `element.value`,
  `document.createElement`, and the Add-button feature this lesson
  extends directly. Lesson 3's `if` statement and `!==` — this
  lesson's own validation logic builds on the identical idea of a
  guarded action.

- **Terms used in this lesson**

  - **`function` declaration** — a way to declare a named, reusable
    function using the `function` keyword, distinct from the arrow
    function syntax this curriculum has used since Lesson 1. It exists
    as the language's original function syntax, predating arrow
    functions; the real, practical reason to reach for it here rather
    than another arrow function is naming — a `function` declaration
    gives a piece of logic a real, callable name that shows up
    meaningfully in error messages and stack traces, which matters
    once the same logic needs to be triggered from more than one
    place, as this lesson's own validation and add-button logic now
    are.
  - **`keydown` event** — an event the browser dispatches the instant
    any key is pressed down while a specific element has focus. It
    exists because not every meaningful user action is a click — a
    user pressing Enter to submit a value they just typed is one of
    the most common interaction patterns on the web, and a program
    needs a real way to detect a specific key being pressed, not just
    detect that *some* typing happened.
  - **`input` event** — an event the browser dispatches every single
    time a form field's own value actually changes, whether by typing,
    pasting, or being cleared. It exists because reacting only to a
    final submission (a click, or Enter) is often too late — a program
    frequently needs to know about *every* change as it happens, to
    give real-time feedback (like disabling a button) rather than only
    finding out something was wrong after the user already tried to
    act on it.

- **Objects and methods used**

  - **`element.addEventListener(type, callback)`** *(reappearing —
    full treatment restated)*
    - *What it is:* a method, on any DOM element, that registers a
      function to run whenever a specific event happens on that
      element.
    - *Implementation:* takes an event-type string and a callback
      function; returns nothing meaningful.
    - *Its use:* this lesson registers it twice more, on the same
      `amountInput` element — once for `'keydown'`, once for
      `'input'` — two new, real event types this curriculum hasn't
      used yet, on top of the `'click'` type used everywhere before
      this lesson.
    - *Type:* an instance method, called on an `Element`.
    - *Responsibility:* maintain a list of callbacks registered for a
      given event type on this specific element, and invoke each one,
      in order, every time that event fires.
    - *Depends on:* an element to call it on, an event-type string, and
      a callback.
    - *Connects to:* called on `amountInput`; each callback is
      application code the browser decides when to run.
    - *Shape:* a callback boundary between application code and the
      browser's event-dispatch system.

  - **`Number.isNaN(value)`**
    - *What it is:* a method that determines whether a given value is
      genuinely the special value `NaN` ("Not a Number").
    - *Implementation:* takes one argument and returns a real boolean —
      `true` only if the value is genuinely `NaN` itself, `false` for
      everything else, including ordinary numbers, strings, and other
      types.
    - *Its use:* `Number(someInvalidString)` (the same conversion
      function Lessons 4 and 5 already established) produces `NaN`
      when the string doesn't look like a real number at all —
      `Number.isNaN` is how this lesson's code detects that failure
      and treats it as invalid input, rather than silently letting a
      broken conversion through.
    - *Type:* a `static` method on the built-in `Number` object — not
      called on any particular value, but on `Number` itself.
    - *Responsibility:* answer, correctly and only, whether a given
      value genuinely is `NaN` — nothing about converting, parsing, or
      validating more broadly; strictly and only that one, specific
      check.
    - *Depends on:* one value to check.
    - *Connects to:* called on the result of `Number(...)`, inside this
      lesson's own validation function.
    - *Shape:* a public, global-adjacent utility — a `static` member
      of a built-in type, not an instance method on any value this
      project owns.

  - **`String.prototype.trim()`**
    - *What it is:* a method, available on every string, that returns a
      new string with whitespace removed from both the start and end.
    - *Implementation:* takes no arguments; returns a new string —
      the original string itself is never modified, since strings in
      JavaScript are immutable.
    - *Its use:* a user could type only spaces into the amount field,
      which would otherwise pass right past an empty-string check
      undetected — trimming first is what makes "nothing meaningful
      was typed" detectable regardless of whether that "nothing" is
      truly empty or just whitespace.
    - *Type:* an instance method, called on any string value.
    - *Responsibility:* produce a version of the calling string with
      no leading or trailing whitespace — nothing about validating or
      converting; strictly that one transformation.
    - *Depends on:* the string it's called on.
    - *Connects to:* called on `amountInput.value`, inside this
      lesson's own validation function; its result is compared against
      an empty string and handed to `Number(...)`.
    - *Shape:* a public, built-in string utility.

  - **`element.disabled`**
    - *What it is:* a property on interactive form elements (buttons,
      inputs) controlling whether the element can currently be
      interacted with at all.
    - *Implementation:* a real boolean-typed property; setting it to
      `true` makes the element genuinely unclickable/unfocusable —
      the browser itself enforces this, not just a visual style — and
      reflects it in the real, rendered markup as a `disabled`
      attribute; setting it to `false` restores normal interactivity.
    - *Its use:* this is the actual mechanism that makes the Add
      button genuinely unusable while the typed amount is invalid,
      rather than merely looking discouraged to click.
    - *Type:* an instance property (read/write) on interactive form
      elements specifically.
    - *Responsibility:* control, at the browser's own enforcement
      level, whether this specific element currently accepts user
      interaction at all.
    - *Depends on:* the element it's set on.
    - *Connects to:* written to directly by this lesson's `input`
      handler, below, and by the successful-add path inside
      `addNewQuickAddButton`.
    - *Shape:* a mutation API — the seam where a real validity check
      becomes an actual, browser-enforced restriction, not just a
      cosmetic one.

---

## Concept Unit: Naming the Add Action as a Real Function

### The Problem

This lesson needs the exact same "add a new quick-add button" action to
run from two different places — a click on Add, and pressing Enter in
the input. Right now, that logic only exists as an anonymous arrow
function, written once, directly inside a single `addEventListener`
call — there's no way to run it a second time from somewhere else
without copying its whole body.

> **Before reading on:** Lesson 5's own Add-button callback is an
> arrow function, written inline, with no name. If you needed the
> identical logic to run from a second, different trigger, what would
> need to change about how that logic is written — could an anonymous
> function, defined only inside one specific `addEventListener` call,
> ever be called from somewhere else too?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
function greet(name) {
  return `Hello, ${name}!`;
}
console.log(greet('Ada'));
console.log(greet('Grace'));
```

Real run (Node):

```
Hello, Ada!
Hello, Grace!
```

This proves a `function` declaration produces a real, named,
independently callable piece of logic — `greet` is called twice, from
two separate lines, using its own real name, something an anonymous
arrow function assigned inline to a single `addEventListener` call
never has the chance to do. This is called a **`function` declaration**.

### Discard the Throwaway Example

This standalone `greet` function isn't part of the counter project. It
existed only to prove a named function can genuinely be called from
more than one place.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — Lesson 5's inline arrow
  function, passed directly to `addQuickAddBtn.addEventListener`, is
  extracted into its own named `function` declaration).
- **Change type:** refactor — the real behavior doesn't change yet;
  only how it's organized does, specifically to make it callable from
  a second place this lesson is about to add.
- **Location:** replacing the inline callback currently passed to
  `addQuickAddBtn.addEventListener('click', ...)`.
- **Dependencies:** everything the original inline callback already
  used — `amountInput`, `quickAddContainer`, `addQuickAddBtn`.

### The New Code

```js
function addNewQuickAddButton() {
  const amount = Number(amountInput.value);
  const newBtn = document.createElement('button');
  newBtn.className = 'quickAddBtn';
  newBtn.dataset.amount = amount;
  newBtn.textContent = `+${amount}`;
  quickAddContainer.append(newBtn);
  amountInput.value = '';
}

addQuickAddBtn.addEventListener('click', addNewQuickAddButton);
```

### The Updated Project

`script.js`'s own relevant section, in full, this unit's changed lines
marked:

```js
1  function addNewQuickAddButton() {                                 // ← new
2    const amount = Number(amountInput.value);
3    const newBtn = document.createElement('button');
4    newBtn.className = 'quickAddBtn';
5    newBtn.dataset.amount = amount;
6    newBtn.textContent = `+${amount}`;
7    quickAddContainer.append(newBtn);
8    amountInput.value = '';
9  }                                                                  // ← new
10
11 addQuickAddBtn.addEventListener('click', addNewQuickAddButton);    // ← new
```

Lines 2–8, the actual behavior, are identical to Lesson 5's own inline
version — nothing about what happens changed. What's new is lines 1
and 9, wrapping that same behavior in a real, named function, and line
11, which now passes that function *by name* to `addEventListener`,
rather than defining a fresh, anonymous one inline. Clicking Add still
does exactly what it did at the end of Lesson 5 — this unit is
preparation for what comes next, not a behavior change on its own.

### Mechanical Walkthrough

- **`function`** — the keyword itself, explained in full above (Terms);
  begins a named function declaration.
- **`addNewQuickAddButton`** — the function's own real name, chosen to
  describe what it does; this exact name is now what appears in a
  stack trace or debugger, rather than an anonymous `(anonymous)`
  entry an inline arrow function would produce.
- **`(`...`)`** — the parameter list; empty here, since this function
  needs nothing passed in — everything it uses (`amountInput`,
  `quickAddContainer`, `addQuickAddBtn`) is read from the surrounding
  script directly, the identical closure mechanism already explained
  in full back in Lesson 2's SE Lens.
- **`{`...`}`** — the function body; identical in content to Lesson
  5's own inline callback body — every line inside was already given
  full treatment in Lesson 5.
- **`addQuickAddBtn.addEventListener('click', addNewQuickAddButton)`**
  — the same `addEventListener` call this curriculum has made many
  times, explained in full above; the one real difference from every
  previous use is the second argument: `addNewQuickAddButton`, written
  with no `(`...`)` after it — this passes the function itself, as a
  value, the same "function as a value" idea Lesson 1 established for
  arrow functions, rather than calling it immediately (which
  `addNewQuickAddButton()`, with parentheses, would do — running it
  once, right now, instead of handing it over to run later on click).

### CS Lens

Extracting shared, repeated logic into one, real, named unit — rather
than copying its body everywhere it's needed — is the concrete,
everyday instance of **abstraction via naming**: giving a piece of
logic a real identity separate from any one place that uses it, so
every caller shares exactly one real implementation instead of several
copies that could quietly drift apart over time.

Also recognized in: a recipe's own numbered steps, referenced by
number rather than rewritten each time a cookbook cross-references
them; a shared utility function in any real codebase, called from
multiple files; a subroutine in assembly language, called by address
rather than duplicated inline at every call site; a spreadsheet's own
named range, referenced by name in multiple formulas instead of each
formula repeating the same cell range.

### SE Lens

The real alternative not chosen is leaving the logic anonymous and
inline, and instead having the future `keydown` handler literally call
`addQuickAddBtn.click()` — programmatically simulating a real click,
rather than calling the underlying logic directly. That would work,
but real, honestly, indirectly: it means "pressing Enter" secretly
means "pretend the mouse clicked a button," which is a strange, brittle
thing for the code's own intent to depend on — if the button were ever
disabled (which, as this lesson's own later units add, it genuinely
can be), a simulated `.click()` on a disabled button does nothing at
all, silently, which is real, correct browser behavior but a confusing
way to discover it. Extracting a real, named function and calling that
same function from both places keeps the actual intent — "run the add
logic" — explicit at both call sites, rather than routing one of them
through a simulated user action.

### Commands Needed

None.

### Run It

Real output shown above, proving named functions can be called from
multiple places. The real project's own refactored version — behavior
identical to Lesson 5's — is exercised as part of this lesson's closing
full-project run, below.

### Connection

The add logic now has a real name and can be called from anywhere —
the next unit is what calls it from a second, new place.

---

## Concept Unit: Submitting with Enter via `keydown`

### The Problem

Right now, the only way to add a new quick-add button is clicking Add
with the mouse — a real, common, and genuinely slower pattern than
just pressing Enter after typing a number, which many users expect to
work.

> **Before reading on:** this lesson's own Header already named
> `keydown` as an event the browser dispatches when a key is pressed.
> Given `addNewQuickAddButton` now exists as a real, callable,
> named function, what real, concrete condition would need to be true
> — out of every possible key someone could press while typing in the
> amount field — for pressing Enter, specifically, to trigger it?

### Introduce the Concept in Isolation

Throwaway HTML — `<input id="i">` — and this script:

```js
input.addEventListener('keydown', (e) => {
  console.log(e.key, e.key === 'Enter');
});
input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
```

Real run (Node + jsdom):

```
key pressed: "a" | is Enter: false
key pressed: "Enter" | is Enter: true
```

This proves `e.key` genuinely reports which real key was pressed, as a
real string, and that comparing it against the exact string `'Enter'`
correctly distinguishes an ordinary character key from the Enter key
specifically — pressing `'a'` reports `false`; pressing `'Enter'`
reports `true`.

### Discard the Throwaway Example

This throwaway `<input id="i">` isn't part of the counter project. It
existed only to prove `e.key` correctly identifies which specific key
was pressed.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** after the `addQuickAddBtn.addEventListener(...)` line
  added in the previous unit.
- **Dependencies:** `amountInput`, already established;
  `addNewQuickAddButton`, from the previous unit.

### The New Code

```js
amountInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addNewQuickAddButton();
  }
});
```

### The Updated Project

`script.js`'s own relevant section, in full, this unit's new lines
marked:

```js
 1  function addNewQuickAddButton() {
 2    const amount = Number(amountInput.value);
 3    const newBtn = document.createElement('button');
 4    newBtn.className = 'quickAddBtn';
 5    newBtn.dataset.amount = amount;
 6    newBtn.textContent = `+${amount}`;
 7    quickAddContainer.append(newBtn);
 8    amountInput.value = '';
 9  }
10
11  addQuickAddBtn.addEventListener('click', addNewQuickAddButton);
12
13  amountInput.addEventListener('keydown', (e) => {                 // ← new
14    if (e.key === 'Enter') {                                        // ← new
15      addNewQuickAddButton();                                       // ← new
16    }                                                                // ← new
17  });                                                                // ← new
```

Lines 1–11, everything from before this unit, are unchanged. Lines
13–17 register a second, real listener on `amountInput` — pressing any
key while it has focus now runs this callback, which checks whether
that specific key was Enter, and if so, calls the exact same
`addNewQuickAddButton` function the Add button's own click already
calls.

### Mechanical Walkthrough

- **`amountInput`** — the variable from Lesson 5, holding the real
  `<input>` reference; the object this listener is registered on.
- **`.addEventListener`** — the method itself, explained in full
  above.
- **`(`...`)`** — call syntax, invoking `addEventListener` with two
  arguments.
- **`'keydown'`** — a string literal naming the event type, explained
  in full above (Terms); the first event type this curriculum has
  used besides `'click'`.
- **`,`** — separates the two arguments.
- **`(e) => {`...`}`** — an arrow function, the same syntax fully
  explained in Lesson 1; takes one parameter, `e`, the same real event
  object Lesson 5's delegation unit already introduced, here carrying
  keyboard-specific information instead of click-specific information.
- **`if`** — the keyword, explained in full in Lesson 3; begins a
  conditional block.
- **`(`...`)`** — encloses the condition.
- **`e.key`** — a property on the event object, naming exactly which
  real key was pressed, as a string.
- **`===`** — the strict equality operator; the direct counterpart to
  Lesson 3's `!==` — compares `e.key` against the literal string
  `'Enter'` and produces `true` only if they match exactly.
- **`'Enter'`** — a string literal naming the specific key this
  condition checks for; this exact string is the real, standard value
  the browser reports for the Enter key, not something this project
  invented.
- **`{`...`}`** — the block that runs only when the condition holds.
- **`addNewQuickAddButton()`** — a call to the real, named function
  from the previous unit — note the `(`...`)` here, in contrast to
  this same name written *without* parentheses when it was handed to
  `addEventListener` a few lines above; with parentheses, it runs
  immediately, right here, which is exactly what should happen the
  instant Enter is confirmed pressed.

### CS Lens

Not applicable as a new hard concept — this reuses `if` (Lesson 3) and
the Observer-pattern mechanism (Lesson 1) together, applied to a new
event type.

### SE Lens

The real alternative not chosen is listening for `'keypress'` instead
of `'keydown'` — an older, real event type that also exists for
keyboard input, but one that doesn't reliably fire for every key
(certain keys, across certain browsers, historically don't trigger it
at all) and is considered legacy by current standards. `'keydown'` is
the real, current, reliable choice specifically because it fires for
every real key press, consistently, which matters here since Enter
specifically needs to be reliably caught every time, not most of the
time.

### Commands Needed

None.

### Run It

Real output shown above, proving `e.key === 'Enter'` correctly
distinguishes the target key. Exercised as part of this lesson's
closing full-project run, below.

### Connection

Enter now genuinely triggers the same add action as clicking — the
next units are what stop that action from running on invalid input.

---

## Concept Unit: Deciding What Counts as Valid

### The Problem

Right now, both triggers — click and Enter — run `addNewQuickAddButton`
unconditionally, exactly like Lesson 5 left it. Type nothing, or type
letters instead of a number, and `Number(amountInput.value)` produces
`NaN` — a real, broken button would get created, showing `+NaN` and
doing nothing useful when clicked.

> **Before reading on:** `Number('')` and `Number('abc')` both produce
> the real, special value `NaN`. Given this lesson's own Header already
> named a method specifically for detecting `NaN`, and a method for
> removing stray whitespace from a string, what real, concrete
> conditions — checked in what order — would need to be true for a
> typed value to count as genuinely valid?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
function isValidAmount(value) {
  const trimmed = value.trim();
  if (trimmed === '') return false;
  return !Number.isNaN(Number(trimmed));
}
['  25  ', '', '   ', 'abc', '5abc'].forEach((c) => {
  console.log(`isValidAmount(${JSON.stringify(c)}) =`, isValidAmount(c));
});
```

Real run (Node):

```
isValidAmount("  25  ") = true
isValidAmount("") = false
isValidAmount("   ") = false
isValidAmount("abc") = false
isValidAmount("5abc") = false
```

This proves the function correctly accepts a real number even with
surrounding whitespace, and correctly rejects an empty string, a
whitespace-only string, and non-numeric text alike. One honest gap,
worth naming directly rather than hiding: this same function returns
`true` for `'-3'` — a real, negative number is still a real number, as
far as `Number.isNaN` is concerned, even though a negative click amount
probably isn't what this feature actually intends. This function
checks *numeric validity*, not *business-rule validity* — a real,
deliberate scope boundary, not an oversight.

### Discard the Throwaway Example

This standalone `isValidAmount` test isn't part of the counter
project's throwaway material — the function itself, unlike this
lab's own test array, *is* real, permanent project code, added in the
next step.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** before the `addNewQuickAddButton` function declared
  earlier in this lesson.
- **Dependencies:** none new.

### The New Code

```js
function isValidAmount(value) {
  const trimmed = value.trim();
  if (trimmed === '') return false;
  return !Number.isNaN(Number(trimmed));
}
```

### The Updated Project

`script.js`'s own relevant section, in full, this unit's new lines
marked:

```js
 1  function isValidAmount(value) {                                  // ← new
 2    const trimmed = value.trim();                                   // ← new
 3    if (trimmed === '') return false;                                // ← new
 4    return !Number.isNaN(Number(trimmed));                           // ← new
 5  }                                                                  // ← new
 6
 7  function addNewQuickAddButton() {
 8    const amount = Number(amountInput.value);
 9    const newBtn = document.createElement('button');
10    newBtn.className = 'quickAddBtn';
11    newBtn.dataset.amount = amount;
12    newBtn.textContent = `+${amount}`;
13    quickAddContainer.append(newBtn);
14    amountInput.value = '';
15  }
```

Line 1–5 add a real, new, standalone function — nothing calls it yet.
`addNewQuickAddButton` itself, lines 7–15, is shown here unchanged;
the next unit is what actually makes it consult this new function
before doing anything.

### Mechanical Walkthrough

- **`function isValidAmount(value)`** — a named function declaration,
  explained in full above; takes one parameter, `value`, rather than
  reading directly from `amountInput` the way `addNewQuickAddButton`
  does — a deliberate difference explained in this unit's own SE Lens,
  below.
- **`const trimmed = value.trim();`** — declares a new binding,
  explained in full in Lesson 1; `.trim()`, the method itself,
  explained in full above.
- **`if (trimmed === '') return false;`** — the `if` statement,
  explained in full in Lesson 3; `===`, explained in full in this
  lesson's previous unit; an empty string here means either nothing
  was typed, or only whitespace was (since `trimmed` has already had
  whitespace removed) — either way, this function immediately reports
  invalid and exits, without ever reaching the line below.
- **`return`** — a keyword that immediately exits a function, handing
  back the given value to whatever called it; this is the first time
  this curriculum has used `return` inside a multi-line function body
  to exit early, though Lesson 5's `if (!btn) return;` already used
  the identical mechanism to exit a callback early.
- **`false`** — a boolean literal, the value handed back when the
  input is empty or whitespace-only.
- **`return !Number.isNaN(Number(trimmed));`** — reached only if the
  line above didn't already return; `Number(trimmed)`, explained in
  full in Lesson 4, converts the trimmed string to a real number (or
  `NaN`, if it isn't one); `Number.isNaN(...)`, explained in full
  above, checks whether that result genuinely is `NaN`; `!`, explained
  in full in Lesson 5, negates that check — so this line reads,
  correctly, as "return true if the converted value is *not* `NaN`."

### CS Lens

A function that takes real input and returns a real boolean answering
one specific yes/no question, with no other side effects, is a
concrete instance of a **predicate**: a piece of logic whose entire
job is classification — true or false — rather than performing an
action or producing a broader result.

Also recognized in: a spam filter's own "is this spam" check; a form
library's own field-level validators; a database query's own `WHERE`
clause, itself a predicate deciding which rows qualify; a security
system's own "is this person authorized" check — every one of them a
function whose whole contract is a yes/no answer, safely reusable
anywhere that specific question needs asking.

### SE Lens

The real design choice worth naming: `isValidAmount` takes `value` as
a real parameter, rather than reading `amountInput.value` directly the
way `addNewQuickAddButton` reads its own dependencies from the
surrounding script. The real reason: a predicate that only knows how
to check "whatever is currently in this one specific input" can only
ever be used for that one input — passing the value in directly means
the exact same validity check could, if this project ever grew a
second amount field somewhere else, be reused immediately, with zero
changes, on a value that never came from `amountInput` at all. The real
cost of this choice: every caller now has to remember to actually pass
in the value, rather than the function fetching it automatically — a
small, real amount of extra typing at each call site, in exchange for
a function that isn't quietly, invisibly tied to one specific element.

### Commands Needed

None.

### Run It

Real output shown above, covering five real, distinct cases: valid
with whitespace, empty, whitespace-only, non-numeric, and
number-with-trailing-text. Exercised as part of this lesson's closing
full-project run, below.

### Connection

A real, reusable way to answer "is this valid" now exists — the final
unit is what actually uses it, live, as the user types.

---

## Concept Unit: Reacting Live with `input` and `element.disabled`

### The Problem

`isValidAmount` exists but nothing calls it yet, and `addNewQuickAddButton`
still runs unconditionally on both click and Enter. Right now, typing
`"abc"` and clicking Add would still create a real, broken `+NaN`
button.

> **Before reading on:** this lesson's own Header already named
> `input` as an event that fires on every real change to a field's own
> value, and `element.disabled` as the property that genuinely
> prevents interaction. Given `isValidAmount` already exists, what
> would need to happen, on every single keystroke, to keep the Add
> button's own disabled state honestly in sync with whatever is
> currently typed?

### Introduce the Concept in Isolation

Two short, related throwaway labs — first, the `input` event's own
timing:

```js
input.addEventListener('input', () => {
  console.log('input event fired, current value:', input.value);
});
input.value = '5';
input.dispatchEvent(new Event('input'));
input.value = '5a';
input.dispatchEvent(new Event('input'));
```

Real run (Node + jsdom):

```
input event fired, current value: "5"
input event fired, current value: "5a"
```

This proves the `input` event fires on each real, individual change —
twice here, once per simulated change, each time reflecting the
field's own current value at that exact moment.

Second, `element.disabled` itself:

```js
console.log(btn.disabled);
btn.disabled = true;
console.log(btn.disabled, btn.outerHTML);
btn.disabled = false;
console.log(btn.disabled);
```

Real run (Node + jsdom):

```
disabled before: false
disabled after setting true: true
outerHTML while disabled: <button id="b" disabled="">Add</button>
disabled after setting false: false
```

This proves setting `.disabled = true` genuinely changes the element's
real, rendered markup — a real `disabled` attribute appears — and
setting it back to `false` genuinely removes that restriction again.

### Discard the Throwaway Example

Neither throwaway `<input>` nor the throwaway `<button id="b">` are
part of the counter project. They existed only to prove the `input`
event's own timing and `.disabled`'s own real effect, separately,
before combining both in the real project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new listener added; the
  existing `addNewQuickAddButton` function gains a guard at its own
  start).
- **Change type:** add, and one small modification to
  `addNewQuickAddButton` itself.
- **Location:** a new `amountInput.addEventListener('input', ...)`
  block, after the `'keydown'` listener; one new guard line at the top
  of `addNewQuickAddButton`; one new line inside it, right before
  clearing the input; and one line at the very end of the script,
  setting the initial disabled state.
- **Dependencies:** `isValidAmount`, from the previous unit;
  `addQuickAddBtn`, `amountInput`, both already established.

### The New Code

```js
if (!isValidAmount(amountInput.value)) return;
// ... (existing body of addNewQuickAddButton) ...
addQuickAddBtn.disabled = true;

amountInput.addEventListener('input', () => {
  addQuickAddBtn.disabled = !isValidAmount(amountInput.value);
});

addQuickAddBtn.disabled = true;
```

### The Updated Project

`script.js`, this lesson's own section, in full and final, every
change from this whole lesson shown together, new/changed lines
marked:

```js
 1  function isValidAmount(value) {
 2    const trimmed = value.trim();
 3    if (trimmed === '') return false;
 4    return !Number.isNaN(Number(trimmed));
 5  }
 6
 7  function addNewQuickAddButton() {
 8    if (!isValidAmount(amountInput.value)) return;                  // ← new
 9    const amount = Number(amountInput.value);
10    const newBtn = document.createElement('button');
11    newBtn.className = 'quickAddBtn';
12    newBtn.dataset.amount = amount;
13    newBtn.textContent = `+${amount}`;
14    quickAddContainer.append(newBtn);
15    amountInput.value = '';
16    addQuickAddBtn.disabled = true;                                  // ← new
17  }
18
19  addQuickAddBtn.addEventListener('click', addNewQuickAddButton);
20
21  amountInput.addEventListener('keydown', (e) => {
22    if (e.key === 'Enter') {
23      addNewQuickAddButton();
24    }
25  });
26
27  amountInput.addEventListener('input', () => {                     // ← new
28    addQuickAddBtn.disabled = !isValidAmount(amountInput.value);      // ← new
29  });                                                                 // ← new
30
31  addQuickAddBtn.disabled = true;                                    // ← new
```

Line 8 now guards `addNewQuickAddButton` itself, defensively, against
ever running with an invalid value — even if somehow triggered while
the button visually appears enabled (a real safety net, not just
relying on the disabled attribute alone). Line 16 re-disables the Add
button immediately after a successful add, since the input is cleared
right after (line 15), and an empty input is never valid. Lines 27–29
add the real, live feedback loop: every keystroke re-checks validity
and updates `.disabled` to match. Line 31 sets the correct real initial
state — the page loads with an empty input, so Add correctly starts
disabled, before the user has typed anything at all.

### Mechanical Walkthrough

- **`if (!isValidAmount(amountInput.value)) return;`** — the `if`
  statement and `!`, both explained in full earlier in this
  curriculum; `isValidAmount(amountInput.value)` calls this lesson's
  own new function, passing in the input's real, current string value;
  `!` negates the result, so this line reads as "if this is *not*
  valid, exit immediately" — the same early-return guard shape Lesson
  5's delegation handler already established.
- **`addQuickAddBtn.disabled = true;`** (inside `addNewQuickAddButton`)
  — the property itself, explained in full above; set here so the
  button correctly reflects that the now-cleared input is, once again,
  not valid.
- **`amountInput.addEventListener('input', () => {`...`})`** — the
  same `addEventListener` mechanism explained in full above, now
  registered for the `'input'` event type, explained in full above
  (Terms).
- **`addQuickAddBtn.disabled = !isValidAmount(amountInput.value);`** —
  reads `amountInput`'s current value on every single keystroke,
  checks its validity, negates that result, and assigns it directly to
  `.disabled` — when the value is valid, `!true` is `false`, so
  `disabled` becomes `false` (enabled); when invalid, `!false` is
  `true`, so `disabled` becomes `true`.
- **`addQuickAddBtn.disabled = true;`** (the final, standalone line) —
  sets the real, correct initial state the instant the script runs,
  before any user interaction at all.

### CS Lens

Not applicable as a new hard concept beyond what's already
established in this same unit (the `input` event) and this lesson's
previous unit (the predicate pattern) — this unit's real contribution
is wiring those two together, not introducing a third, separate idea.

### SE Lens

The real, honest tradeoff recorded here: this feature now checks
validity in *two* real places — the `if (!isValidAmount(...)) return;`
guard inside `addNewQuickAddButton` itself, and the `.disabled` toggle
driven by the `input` listener. The real alternative would be trusting
`.disabled` alone and dropping the internal guard — real, less code,
and it would work correctly *as long as* `.disabled` is always kept
perfectly in sync with real validity at every moment a click or Enter
could possibly happen. The real risk that alternative accepts: any
future change to this feature that adds a *third* way to trigger
`addNewQuickAddButton` (a paste event, a different keyboard shortcut,
anything not yet imagined) would silently bypass validation entirely,
unless someone also remembered to keep `.disabled` correctly updated
for that new path too. Keeping the internal guard is small, real,
duplicate-seeming insurance against exactly that — the function
protects its own correctness regardless of how it gets called, rather
than trusting every possible caller to have already checked first.

### Commands Needed

None — plain HTML/JS, no build step, openable directly in a browser.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature — checking the initial disabled state, live
validation while typing, a successful Enter-triggered add, a rejected
non-Enter key, and the newly-added button actually working:

```
--- initial state: input empty, Add button should be disabled ---
addQuickAddBtn.disabled: true

--- typing "a" (invalid) ---
addQuickAddBtn.disabled: true

--- typing "20" (valid) ---
addQuickAddBtn.disabled: false

--- pressing Enter with a valid value ---
button count before: 3 | after: 4
amountInput cleared: ""
addQuickAddBtn.disabled after successful add: true

--- pressing a non-Enter key does nothing ---
button count unchanged: true

--- clicking the button just added via Enter, verifying it works ---
lastBtn data-amount: 20
count: 20 | display: Clicked 20 times

--- everything else still independent ---
reset works, count: 0
toggle still works, message hidden: false
```

Every real claim this lesson made is directly confirmed: the button
starts correctly disabled, stays disabled on invalid input, becomes
enabled on valid input, Enter genuinely creates a new button and
correctly re-disables Add afterward, an unrelated keypress does
nothing, and the newly created button is fully, correctly functional —
clicking it adds exactly `20`, the real amount that was typed.

### Connection

This is the final piece — the Add feature now genuinely validates its
own input, live, through two complementary real mechanisms, rather
than trusting every keystroke to already be correct.

---

## Closing

**Connect the pieces.** One real sequence, start to finish: the page
loads. This lesson's final unit's own last line runs immediately:
`addQuickAddBtn.disabled = true` — the button starts correctly
unusable, since `amountInput` starts empty.

The user types `"a"`. Each keystroke fires a real `input` event; this
lesson's final unit's own listener runs `isValidAmount("a")` — this
lesson's third unit's own function: `"a".trim()` is `"a"`, not empty,
so the first check passes through; `Number("a")` is `NaN`;
`Number.isNaN(NaN)` is `true`; negated, the whole function returns
`false`. `addQuickAddBtn.disabled` is set to `!false`, which is `true`
— still, correctly, disabled.

The user deletes it and types `"20"` instead. The `input` event fires
again; `isValidAmount("20")` this time: trimmed is `"20"`, not empty;
`Number("20")` is the real number `20`; `Number.isNaN(20)` is `false`;
negated, the function returns `true`. `addQuickAddBtn.disabled` becomes
`!true`, which is `false` — the button is now genuinely clickable.

The user presses Enter instead of clicking. This lesson's second
unit's own `'keydown'` listener runs: `e.key === 'Enter'` is `true`, so
`addNewQuickAddButton()` — this lesson's first unit's own named
function — is called directly. Its own first line, this lesson's
final unit's own guard, runs `isValidAmount(amountInput.value)` one
more time, redundantly but safely, confirming `true` again; the guard
does not trigger. The function's own original body, unchanged since
Lesson 5, runs: a real button is built, carrying `data-amount="20"`,
and appended to the page. `amountInput.value` is cleared. The very
next line, new to this lesson, sets `addQuickAddBtn.disabled = true`
directly — correctly anticipating that the input is now empty again,
without waiting for a separate `input` event to catch up. One
predicate, checked from two real, independent places, keeping one
button's own usability honestly in sync with whatever the user has
actually, currently typed.
