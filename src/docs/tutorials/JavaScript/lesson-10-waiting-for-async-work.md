# Lesson 10: Waiting for Something That Isn't Instant

- **What you will build.** A Sync button that simulates saving the
  history to a server — a real, deliberate delay, a "Saving..."
  status while it's in progress, and a real, different outcome
  depending on whether there's anything to sync at all. The
  transferable problem: every single action this project has taken so
  far — a click, a keypress, a DOM update — has completed instantly,
  finishing before the very next line of code runs. Real work talking
  to a server never does. This lesson is the first one where "the
  action started" and "the action finished" are genuinely two
  different moments in time, with real, meaningful code that needs to
  run in between them, and a real possibility that it fails.

- **What you need to know first.** Lesson 6's `if`/`return` guard
  pattern and `element.disabled`. Lesson 8's `history.length` and
  object field access. Lesson 1's control-flow/timing trace format —
  this lesson leans on it more than any lesson since.

- **Terms used in this lesson**

  - **Asynchronous** — describing code whose result isn't available
    the moment it's called, but arrives later, without blocking
    anything else from running in the meantime. It exists because some
    real work — a network request, a timer, reading a large file —
    takes real, unpredictable time, and a program that simply froze,
    doing nothing else, until that work finished would be unable to
    stay responsive (redraw the page, react to other clicks) while
    waiting.
  - **Promise** — a real, built-in JavaScript object representing a
    value that doesn't exist yet, but will (or won't) at some point in
    the future. It exists as a standard, real container for "the
    eventual result of asynchronous work" — a single, consistent shape
    every asynchronous operation can be represented with, rather than
    every different kind of async operation inventing its own,
    incompatible way of reporting "done" or "failed."
  - **`async` function** — a function declared with the `async`
    keyword, which always returns a real Promise, and inside which the
    `await` keyword becomes legal to use. It exists to let
    asynchronous code be *written* in an ordinary, top-to-bottom,
    sequential style — the same shape every function in this
    curriculum has already used — instead of the older, real,
    callback-nesting style that async code historically required.
  - **`await`** — a keyword, usable only inside an `async` function,
    that pauses that specific function's own execution until a given
    Promise settles, then resumes with its real, resolved value —
    without blocking anything else on the page from running while it
    waits. It exists so a real, asynchronous wait can be written as a
    single, ordinary line of code, rather than as a callback that runs
    "whenever the Promise is ready," letting async code read in the
    same real, sequential order it actually happens in.

- **Objects and methods used**

  - **`setTimeout(callback, delayMs)`**
    - *What it is:* a global, browser-provided function that schedules
      a callback to run once, after at least the given number of
      milliseconds has passed.
    - *Implementation:* takes a callback function and a real number of
      milliseconds; returns immediately, without running the callback;
      the callback itself runs later, on its own, once the real delay
      has elapsed — never before, though real-world scheduling can
      make it run somewhat after, never exactly at the requested
      moment.
    - *Its use:* this is the real mechanism this lesson uses to
      *simulate* a genuinely asynchronous operation — a real network
      request would take real, unpredictable time the same way, and
      `setTimeout` is the simplest, real, standard way to reproduce
      that same "not instant" shape without needing an actual server.
    - *Type:* a global function, not a method on any particular
      object.
    - *Responsibility:* schedule exactly one future call to the given
      callback, after the given real delay, without blocking anything
      else from running in the meantime.
    - *Depends on:* a callback function, and a real number of
      milliseconds to wait.
    - *Connects to:* called inside this lesson's own `simulatedSave`
      function; its callback is what actually calls `resolve` or
      `reject`, below, determining how the surrounding Promise
      eventually settles.
    - *Shape:* a public, global, asynchronous scheduling primitive —
      the real, foundational building block every other asynchronous
      mechanism in this lesson is built on top of.

  ```
  // Promise's real declared shape (the members this lesson touches)
  interface Promise<T> {
    // constructed via: new Promise((resolve, reject) => { ... })
    then(onFulfilled: (value: T) => void): Promise;
    catch(onRejected: (error: Error) => void): Promise;
  }
  ```

  - **`new Promise((resolve, reject) => {`...`})`**
    - *What it is:* the real, standard way to construct a new Promise
      by hand, wrapping asynchronous work that doesn't already return
      one itself.
    - *Implementation:* takes one argument — a function, called the
      "executor" — which itself receives two real, provided functions,
      `resolve` and `reject`; calling `resolve(value)` inside the
      executor makes the whole Promise settle successfully, with that
      real value; calling `reject(error)` makes it settle as failed,
      with that real error; the executor runs immediately,
      synchronously, the instant `new Promise(...)` is evaluated —
      only the real, asynchronous work happening *inside* it (here, a
      `setTimeout` callback) is what actually happens later.
    - *Its use:* this is how `simulatedSave` wraps a `setTimeout`-based
      delay — which, on its own, has no real concept of "success" or
      "failure" — into a real, standard Promise that the rest of this
      lesson's code can `await`.
    - *Type:* a built-in, global constructor, invoked with `new`.
    - *Responsibility:* produce one real Promise object, and provide
      the executor function with the exact two real functions
      (`resolve`, `reject`) needed to eventually settle it, one way or
      the other, exactly once.
    - *Depends on:* an executor function.
    - *Connects to:* constructed inside `simulatedSave`; its eventual,
      settled value or error is what `await`, inside `handleSync`,
      below, actually receives.
    - *Shape:* a public, global construction API — the real bridge
      between "some non-Promise-based asynchronous mechanism"
      (`setTimeout`) and "a real, standard Promise everything else in
      modern JavaScript expects to work with."

  - **`document.querySelector(selector)`** *(reappearing — full
    treatment restated)*
    - *What it is:* a method that searches the DOM tree for the first
      element matching a CSS selector.
    - *Implementation:* takes one string argument and returns either
      the first matching `Element`, or `null`.
    - *Its use:* this lesson needs two more real element references —
      the Sync button and its status display.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* search the live DOM tree once, using the given
      selector, and hand back a real reference to the first match.
    - *Depends on:* a valid CSS selector string, and a DOM tree already
      built.
    - *Connects to:* called on `document`; each `Element` returned is
      used by `addEventListener` and `.textContent`, both already
      established.
    - *Shape:* a public read API.

  - **`element.addEventListener(type, callback)`** *(reappearing —
    full treatment restated)*
    - *What it is:* a method, on any DOM element, that registers a
      function to run whenever a specific event happens on that
      element.
    - *Implementation:* takes an event-type string and a callback
      function; returns nothing meaningful.
    - *Its use:* this lesson's Sync button needs to react to clicks,
      the same mechanism every button in this project already uses.
    - *Type:* an instance method, called on an `Element`.
    - *Responsibility:* maintain a list of callbacks registered for a
      given event type on this specific element, and invoke each one,
      in order, every time that event fires.
    - *Depends on:* an element to call it on, an event-type string, and
      a callback.
    - *Connects to:* called on `syncBtn`; the callback is application
      code the browser decides when to run.
    - *Shape:* a callback boundary between application code and the
      browser's event-dispatch system.

---

## Concept Unit: Scheduling Work with `setTimeout`

### The Problem

Every action this project has taken so far finishes the instant it
runs — `count = count + 1` is done before the very next line executes.
This lesson needs the opposite: real code that deliberately doesn't
finish right away, to genuinely stand in for the kind of delay a real
network request would have.

> **Before reading on:** every function this curriculum has written
> runs top to bottom, finishing completely before returning control to
> whatever called it. If you needed a specific piece of code to run,
> but only after a real, deliberate pause — not instantly, and not by
> making the whole page freeze and wait — what real, general shape
> would that need: could an ordinary function call, on its own, ever
> "come back later" on its own?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
console.log('before setTimeout');
setTimeout(() => {
  console.log('this runs later, after a real delay');
}, 20);
console.log('setTimeout has returned immediately, callback has not run yet');
```

Real run (Node), with a small, real, added wait afterward to let the
delayed callback actually finish before this lab's own script exits:

```
step 1: before setTimeout
step 2: setTimeout has returned immediately, callback has not run yet
step 3: this runs later, after a real delay
step 4: the delayed callback already ran above
```

This is a control-flow/timing trace, the identical shape Lesson 1
established for `addEventListener`:

1. `setTimeout(() => {...}, 20)` — schedules the callback and returns
   immediately; nothing inside it has run yet.
2. `console.log('step 2: ...')` — prints *before* the callback's own
   log line, proving `setTimeout` genuinely didn't run anything on the
   spot.
3. Only after the real, requested delay does the callback actually
   run, printing "step 3."
4. Code that was waiting for this — in the real lab, a small wrapper
   confirming the delay had elapsed — resumes only after step 3 has
   already happened.

This proves `setTimeout` schedules, rather than runs, its callback —
this exact same shape (register now, run later) is the identical real
mechanism `addEventListener` already uses for *user-triggered* events;
`setTimeout` is the same idea applied to *time-triggered* ones.

### Discard the Throwaway Example

This standalone `setTimeout` call isn't part of the counter project.
It existed only to prove scheduling and running are two separate,
real moments in time.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none yet — `setTimeout` is used *inside* a
  function this lesson's next unit builds; this unit's own real
  contribution is proving the mechanism, not yet adding tracked
  project code.
- **Change type:** none (concept proven in isolation; used for real in
  the next unit).
- **Location:** not applicable.
- **Dependencies:** none.

### The New Code

Not applicable — this unit's own throwaway lab, above, is the entire
real demonstration; the next unit is where `setTimeout` first appears
inside real, tracked project code.

### The Updated Project

Not applicable — no file changes yet.

### Mechanical Walkthrough

- **`setTimeout`** — the function itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `setTimeout` with two
  arguments.
- **`() => {`...`}`** — an arrow function, explained in full in Lesson
  1; the callback to run once the delay elapses.
- **`,`** — separates `setTimeout`'s two arguments.
- **`20`** — a numeric literal, the real number of milliseconds to
  wait before running the callback.

### CS Lens

Scheduling a real callback to run after a real delay, without blocking
anything else, is a concrete instance of **asynchronous scheduling** —
named in full as this lesson's own Term, above — the foundational
mechanism every other real async operation (a real network request, a
real file read, a real animation frame) ultimately builds on.

Also recognized in: a kitchen timer, letting other cooking continue
while it counts down; an alarm clock, set once and left alone until it
actually goes off; a calendar reminder, scheduled now but delivered
later; an operating system's own task scheduler, deciding when a
queued job actually gets to run.

### SE Lens

The real alternative not chosen — and the one that makes this whole
mechanism necessary — is a genuinely blocking wait: real code that
simply loops, doing nothing, checking a clock over and over until the
real delay has passed. That would work, technically, but would freeze
the entire page for its whole duration — no click could be handled, no
animation could play, nothing else on the page could run at all, since
JavaScript in a browser runs on one, real, shared thread. `setTimeout`
avoids this entirely: the real wait happens without occupying that
shared thread at all, which is the entire reason asynchronous
mechanisms like this exist rather than everything simply blocking.

### Commands Needed

None.

### Run It

Real output shown above, proving `setTimeout` genuinely schedules
rather than runs.

### Connection

Scheduling now works — the next unit is what turns a scheduled delay
into something with a real, meaningful success or failure outcome.

---

## Concept Unit: Wrapping the Delay in a Real `Promise`

### The Problem

`setTimeout` can schedule work, but on its own, it has no real concept
of "succeeded" or "failed" — it only ever runs its callback, once,
after a delay, with no standard way for other code to `await` its
result or find out whether it went well.

> **Before reading on:** this lesson's own Header already named
> `resolve` and `reject` as two real functions a Promise's own
> executor receives. Given this project's real, current state — an
> array called `history` — what real, concrete condition might
> reasonably decide whether a simulated "save" should succeed or fail?
> What would calling `resolve` versus calling `reject`, inside a
> `setTimeout` callback, need to look like?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
function delayedValue(value, ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}
const result = await delayedValue('hello', 10).then((v) => {
  console.log('.then received:', v);
  return v.toUpperCase();
});
console.log('final result:', result);

function alwaysRejects() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('simulated failure')), 10);
  });
}
await alwaysRejects().catch((err) => {
  console.log('.catch received:', err.message);
});
```

Real run (Node):

```
calling delayedValue...
  .then received: hello
final result: HELLO
  .catch received: simulated failure
```

This proves two real, complementary things: `resolve('hello')`,
called inside the real `setTimeout` callback, correctly becomes the
value `.then`'s own callback receives, real, delayed, and correctly
transformed (`'hello'` → `'HELLO'`) by returning a new value from
inside `.then`; and `reject(new Error(...))`, the same real mechanism
used to signal failure instead, correctly becomes the value `.catch`'s
own callback receives — a real `Error` object, with a real, readable
`.message`.

### Discard the Throwaway Example

This standalone `delayedValue`/`alwaysRejects` pair isn't part of the
counter project. It existed only to prove `resolve`/`reject`,
`.then`/`.catch` genuinely connect a Promise's own eventual outcome to
real, later code.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new `simulatedSave`
  function added).
- **Change type:** add.
- **Location:** after the existing quick-add delegation handler.
- **Dependencies:** `history`, already established.

### The New Code

```js
function simulatedSave() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (history.length === 0) {
        reject(new Error('Nothing to sync'));
      } else {
        resolve(`Synced ${history.length} action(s)`);
      }
    }, 20);
  });
}
```

### The Updated Project

`script.js`'s own new function, in full, this unit's new lines marked:

```js
1  function simulatedSave() {                                        // ← new
2    return new Promise((resolve, reject) => {                        // ← new
3      setTimeout(() => {                                              // ← new
4        if (history.length === 0) {                                    // ← new
5          reject(new Error('Nothing to sync'));                         // ← new
6        } else {                                                        // ← new
7          resolve(`Synced ${history.length} action(s)`);                 // ← new
8        }                                                                // ← new
9      }, 20);                                                          // ← new
10   });                                                                // ← new
11 }                                                                    // ← new
```

This function, called on its own, returns a real Promise immediately —
though nothing has settled yet at that instant. After a real, 20
millisecond delay, it settles one of two real ways, depending on
`history`'s own real, current length at that moment.

### Mechanical Walkthrough

- **`function simulatedSave()`** — a named function declaration,
  explained in full in Lesson 6.
- **`return new Promise((resolve, reject) => {`...`});`** — `return`,
  explained in full in Lesson 6; `new Promise(...)`, the constructor
  itself, explained in full above; `(resolve, reject) => {`...`}`, an
  arrow function, explained in full in Lesson 1 — this specific one is
  the executor, receiving the two real functions the Promise
  constructor provides.
- **`setTimeout(() => {`...`}, 20)`** — the function itself, explained
  in full in this lesson's previous unit; the real, asynchronous work
  this Promise is wrapping.
- **`if (history.length === 0) {`...`} else {`...`}`** — the `if`/
  `else` shape, explained in full in Lesson 3; `history.length`, an
  already-established property; `===`, explained in full in Lesson 6;
  the real, concrete condition deciding which outcome this simulated
  save produces.
- **`reject(new Error('Nothing to sync'));`** — `reject`, the real
  function the executor received, called here to make the Promise
  settle as failed; `new Error(...)`, a built-in constructor producing
  a real, standard error object with a real, readable `.message`
  property — the first appearance of `Error` in this curriculum,
  though its shape is exactly what any real, thrown or caught error in
  JavaScript already carries.
- **`resolve(`...`);`** — `resolve`, the real function the executor
  received, called here to make the Promise settle successfully, with
  a real, computed message built from a template literal, explained in
  full in Lesson 2.

### CS Lens

Wrapping a real, callback-based asynchronous mechanism (`setTimeout`,
which has no built-in concept of success or failure) inside a real
Promise is the concrete instance of **adapting one interface to
another** — giving old-style, callback-based asynchronous code a real,
standard, modern shape the rest of this lesson's code can consistently
`await`, without needing to know or care that a plain `setTimeout` is
what's actually running underneath.

Also recognized in: a translator adapting one language's grammar into
another's, so a sentence's real meaning survives the conversion; a
power adapter letting a device built for one country's outlets plug
into another's; a legacy API wrapped in a modern client library, so
callers never touch the old, awkward interface directly; a shipping
container standardizing wildly different real cargo into one uniform
shape every crane and ship can handle identically.

### SE Lens

The real alternative not chosen is having every caller of
`simulatedSave` deal with `setTimeout` and a raw callback directly,
rather than wrapping it in a real Promise at all. That would work, but
the real cost compounds immediately: this project already needs to
`await` the real result inside an `async` function (the next unit),
and raw callbacks don't compose with `await` at all — they'd force
this lesson's own calling code back into real, nested,
callback-inside-callback style, the exact shape modern JavaScript's
Promise/`async`/`await` trio exists specifically to avoid. Wrapping
the messy, callback-based mechanism once, here, inside `simulatedSave`,
means every real caller gets to use the clean, sequential `await`
style this lesson's next unit relies on.

### Commands Needed

None.

### Run It

Real output shown above, proving `resolve`/`reject` and `.then`/
`.catch` correctly connect. `simulatedSave` itself is exercised as
part of this lesson's closing full-project run, below.

### Connection

A real Promise now exists, correctly reflecting whether there's
anything to sync — the next unit is what actually consumes it.

---

## Concept Unit: Consuming the Promise with `async`/`await`

### The Problem

`simulatedSave()` returns a real Promise, but nothing yet actually
waits for it, reads its result, or reacts differently based on
success versus failure.

> **Before reading on:** this lesson's own Header already named
> `async` and `await` as the pair that lets asynchronous code read in
> ordinary, sequential order. Given `simulatedSave()` returns a real
> Promise, what would the shape of a function that calls it, waits for
> its real result, and then does something with that result, actually
> look like?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
function simulatedSave(shouldSucceed) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSucceed) {
        resolve('Synced 3 action(s)');
      } else {
        reject(new Error('Nothing to sync'));
      }
    }, 10);
  });
}

async function run() {
  console.log('before await');
  const message = await simulatedSave(true);
  console.log('after await, message:', message);
  return message;
}
const finalResult = await run();
console.log('run() resolved with:', finalResult);
```

Real run (Node):

```
before await
after await, message: Synced 3 action(s)
run() resolved with: Synced 3 action(s)
```

This is a control-flow/timing trace, the identical shape this lesson's
own first unit already used:

1. `console.log('before await')` — runs immediately, before anything
   real has actually finished waiting.
2. `await simulatedSave(true)` — pauses `run`'s own execution here,
   specifically, until the real Promise settles — nothing inside
   `run`, past this line, runs until then.
3. Only once the real, underlying `setTimeout` has actually fired and
   called `resolve('Synced 3 action(s)')` does execution resume, right
   where it paused — `message` now holds that real, resolved value.
4. `console.log('after await, ...')` proves this resumption genuinely
   happened, in order, after the real delay — not before.

This proves `await` genuinely pauses one specific function's own
execution at that exact line, resuming only once the real Promise
settles, and the whole `async function` correctly returns its own
real, final value once it's done.

### Discard the Throwaway Example

This standalone `run` function isn't part of the counter project. It
existed only to prove `async`/`await` genuinely pause and resume at
the right, real moments.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new `handleSync`
  function added).
- **Change type:** add.
- **Location:** after `simulatedSave`.
- **Dependencies:** `simulatedSave`, from the previous unit.

### The New Code

```js
async function handleSync() {
  const resultMessage = await simulatedSave();
  syncStatus.textContent = resultMessage;
}
```

### The Updated Project

`script.js`'s own new function, in full, this unit's new lines marked
(this unit's own version is deliberately incomplete — it has no error
handling yet; the next unit adds that):

```js
1  async function handleSync() {                                      // ← new
2    const resultMessage = await simulatedSave();                      // ← new
3    syncStatus.textContent = resultMessage;                           // ← new
4  }                                                                    // ← new
```

Right now, this version would work correctly *only* when
`simulatedSave` succeeds — if it ever rejects, `await` would cause a
real, unhandled error inside `handleSync` itself; the next unit is
what closes that real gap.

### Mechanical Walkthrough

- **`async`** — the keyword itself, explained in full above (Terms);
  marks `handleSync` as a function that always returns a real Promise
  and may use `await` inside itself.
- **`function handleSync()`** — a named function declaration, explained
  in full in Lesson 6, now combined with `async`.
- **`const resultMessage = `...`;`** — the declaration and assignment,
  explained in full in Lessons 1 and 2.
- **`await`** — the keyword itself, explained in full above (Terms);
  pauses `handleSync`'s own execution at this exact line until
  `simulatedSave()`'s real Promise settles.
- **`simulatedSave()`** — a call to the previous unit's own function,
  with parentheses, running it immediately and producing the real
  Promise `await` then waits on.
- **`syncStatus.textContent = resultMessage;`** — the same
  `.textContent` write mechanism established in Lesson 2, here writing
  the real, resolved message once `await` resumes.

### CS Lens

`await` pausing one specific function's own execution, without
blocking anything else on the page, while a real asynchronous
operation completes, is the concrete mechanism behind
**cooperative scheduling**: one function voluntarily yields control at
a specific, real point, trusting the surrounding system to resume it
later, rather than seizing the shared thread and refusing to let go
until it's entirely done.

Also recognized in: a chef starting a pot boiling, then moving on to
chop vegetables rather than staring at the pot; a project manager
delegating a task and continuing other work rather than blocking on
one person's response; cooperative multitasking in older operating
systems, where each running program voluntarily yields control rather
than being forcibly interrupted; a relay race, where each runner's own
leg genuinely pauses until the baton — the real, awaited value —
actually arrives.

### SE Lens

The real alternative not chosen is the older, real `.then`-chaining
style this lesson's own previous unit's isolated lab already used —
`simulatedSave().then((message) => { syncStatus.textContent = message;
})`. That's real, equally correct code, and for one single step, barely
different from `await`. The real cost that compounds with `.then` is
sequencing *several* real, dependent asynchronous steps in a row —
each additional step nests another `.then` callback inside the
previous one, producing real, deeply indented code that reads in a
genuinely different visual order than it actually executes.
`async`/`await` lets the exact same real sequence of steps be written
top-to-bottom, in the same order they actually happen — the real
reason this pair exists, on top of `.then`, which still works and
still matters for reading library documentation and older code.

### Commands Needed

None.

### Run It

Real output shown above, proving `await` pauses and resumes correctly.
`handleSync` itself, still missing error handling, is completed in the
next unit before being exercised for real.

### Connection

Syncing now genuinely works, for the success case — the next unit is
what handles the real, honest possibility that it fails.

---

## Concept Unit: Handling Failure with `try`/`catch`/`finally`

### The Problem

`handleSync`, as it stands, has no real way to handle
`simulatedSave()` rejecting — clicking Sync with an empty `history`
would currently produce a real, unhandled error, with no honest status
message shown to the user at all, and the button never getting
re-enabled.

> **Before reading on:** every guard this curriculum has used so far
> (Lessons 5, 6, 8) checked a condition *before* attempting something
> risky, to avoid the risk entirely. A rejected Promise is different —
> the risk has already been taken, and already failed, by the time
> `await` resumes with it. Given that, what real, different kind of
> language construct would you need — one built specifically to say
> "try this, and here's what to do if it goes wrong, after the fact,"
> rather than "check first, then maybe don't try at all"?

### Introduce the Concept in Isolation

Throwaway code, no DOM, deliberately using the failing case this time:

```js
function simulatedSave(shouldSucceed) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSucceed) {
        resolve('Synced 3 action(s)');
      } else {
        reject(new Error('Nothing to sync'));
      }
    }, 10);
  });
}

async function run() {
  try {
    const message = await simulatedSave(false);
    console.log('try succeeded (should not print):', message);
  } catch (error) {
    console.log('catch ran with:', error.message);
  } finally {
    console.log('finally always runs, regardless of success or failure');
  }
}
await run();
```

Real run (Node):

```
catch ran with: Nothing to sync
finally always runs, regardless of success or failure
```

This proves `try`/`catch`/`finally` correctly handles the real,
failing case: the line inside `try`, `console.log('try succeeded...')`,
never runs at all, because `await simulatedSave(false)` itself throws
the real rejection reason the instant it resumes — `catch (error)`
correctly receives that exact real `Error` object, and `finally`'s own
block runs regardless, proven here running after a real failure, the
identical guarantee it would give after a real success too.

### Discard the Throwaway Example

This standalone `run` function isn't part of the counter project. It
existed only to prove `try`/`catch`/`finally` correctly handles a real,
rejected Promise.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `handleSync`'s own body
  gains real error handling, plus the disabled-button UX this lesson's
  opening paragraph promised); `index.html` (modified — Sync button
  and status paragraph added).
- **Change type:** replace (the previous unit's own incomplete
  `handleSync` body).
- **Location:** `handleSync`'s own function body; `index.html` — after
  the existing stats panel.
- **Dependencies:** `syncBtn`, a real element reference this unit adds
  alongside `syncStatus`.

### The New Code

```js
async function handleSync() {
  syncBtn.disabled = true;
  syncStatus.textContent = 'Saving...';
  try {
    const resultMessage = await simulatedSave();
    syncStatus.textContent = resultMessage;
  } catch (error) {
    syncStatus.textContent = `Error: ${error.message}`;
  } finally {
    syncBtn.disabled = false;
  }
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
25    <h3>History</h3>
26    <ul id="historyList"></ul>
27    <button id="undoBtn">Undo</button>
28
29    <div id="stats">
30      <p id="totalActions">Total actions: 0</p>
31      <p id="netChange">Net change: 0</p>
32      <p id="resetCount">Resets: 0</p>
33    </div>
34
35    <button id="syncBtn">Sync</button>                              <!-- ← new -->
36    <p id="syncStatus"></p>                                          <!-- ← new -->
37
38    <script src="script.js"></script>
39  </body>
40  </html>
```

`script.js`, this lesson's own full, final section, every change from
this whole lesson shown together, new/changed lines marked:

```js
 1  const syncBtn = document.querySelector('#syncBtn');                // ← new
 2  const syncStatus = document.querySelector('#syncStatus');          // ← new
 3
 4  function simulatedSave() {
 5    return new Promise((resolve, reject) => {
 6      setTimeout(() => {
 7        if (history.length === 0) {
 8          reject(new Error('Nothing to sync'));
 9        } else {
10         resolve(`Synced ${history.length} action(s)`);
11       }
12     }, 20);
13    });
14  }
15
16  async function handleSync() {
17    syncBtn.disabled = true;                                         // ← new
18    syncStatus.textContent = 'Saving...';                             // ← new
19    try {                                                              // ← new
20      const resultMessage = await simulatedSave();
21      syncStatus.textContent = resultMessage;
22    } catch (error) {                                                  // ← new
23      syncStatus.textContent = `Error: ${error.message}`;               // ← new
24    } finally {                                                        // ← new
25      syncBtn.disabled = false;                                        // ← new
26    }                                                                  // ← new
27  }
28
29  syncBtn.addEventListener('click', handleSync);                     // ← new
```

Lines 17–18 run immediately, the instant Sync is clicked — before any
real waiting even starts — correctly disabling the button and showing
"Saving..." right away. Lines 19–26 handle both real outcomes:
success writes the real, resolved message; failure, new to this unit,
writes a real, honest error message instead of leaving the user with
no explanation at all; `finally`'s own block, guaranteed to run either
way, re-enables the button regardless of which path was taken — a real
guarantee neither `try` nor `catch` alone could provide, since exactly
one of them runs on any given call, but never both.

### Mechanical Walkthrough

- **`syncBtn.disabled = true;`** — the property itself, explained in
  full in Lesson 6; set here to prevent a second, overlapping click
  while a sync is already in progress — the identical real reason
  Lesson 6 disabled the Add button during invalid input, now applied
  to prevent a different kind of invalid state: two syncs racing each
  other.
- **`syncStatus.textContent = 'Saving...';`** — the same `.textContent`
  write mechanism established in Lesson 2.
- **`try {`...`}`** — begins a block whose contents are attempted;
  distinct from `if`, explained in full in Lesson 3 — `if` decides
  *whether* to run code, based on a condition checked in advance;
  `try` runs code unconditionally, and exists specifically to *catch*
  a real failure that happens *during* that attempt, which couldn't
  have been checked for in advance the way an `if` guard's condition
  can.
- **`const resultMessage = await simulatedSave();`** — the identical
  mechanism explained in full in this lesson's previous unit, now
  sitting inside `try`.
- **`syncStatus.textContent = resultMessage;`** — reached only if
  `await` resumed successfully — the previous line not throwing.
- **`catch (error) {`...`}`** — begins the block that runs only if
  anything inside the matching `try` block throws or rejects; `error`
  is the real, caught value — here, the exact same `Error` object
  `simulatedSave`'s own `reject(new Error(...))` call produced.
- **`` `Error: ${error.message}` ``** — a template literal, explained
  in full in Lesson 2; `error.message`, dot-notation field access,
  explained in full in Lesson 8, reading the real, human-readable
  string off the caught `Error` object.
- **`finally {`...`}`** — begins a block guaranteed to run once,
  regardless of whether `try` completed normally or `catch` ran
  instead — the one real place in this whole function where "make
  sure this always happens" belongs, rather than duplicating
  `syncBtn.disabled = false;` inside both `try` and `catch`
  separately.
- **`syncBtn.addEventListener('click', handleSync);`** — the same
  `addEventListener` mechanism explained in full above, passing the
  real, named `async` function by reference, the identical
  "function as a value" pattern established since Lesson 1.

### CS Lens

`try`/`catch` separating "the normal path" from "the failure path"
into two, real, distinct blocks — rather than checking for every
possible failure in advance with `if` statements — is the concrete
mechanism behind **exception handling**: a real, structured way to
respond to a failure *after* it happens, for the specific real class of
problems (a network genuinely failing, a file genuinely missing) that
can't always be predicted or checked for ahead of time the way Lesson
6's own input-validation guard could.

Also recognized in: a fire alarm and sprinkler system, responding
*after* smoke is detected, rather than requiring a smoke check before
every single action in a building; a car's own airbag, deploying in
response to a real, already-happened collision; a bank's own fraud
reversal process, undoing an already-completed, already-fraudulent
transaction rather than only ever trying to prevent every one in
advance; a legal appeals process, responding to an already-rendered,
real verdict.

### SE Lens

The real alternative not chosen is checking `history.length === 0`
*before* ever calling `simulatedSave` at all, using the same
Lesson-6-style guard this project already uses elsewhere, and never
letting `simulatedSave` reject in the first place. That would work for
*this specific* real failure condition — it's genuinely knowable in
advance, right here, in this exact codebase. The real reason `catch` is
the better tool anyway: a *real* network request's own failure modes
(the server being down, the connection dropping mid-request, a
timeout) generally aren't knowable in advance, no matter how careful
the guard — `try`/`catch` handles the general, honest case where
failure genuinely can't be predicted, while an `if` guard only ever
handles the specific, narrower case where it can. Using `catch` here,
even for a condition that technically *could* have been checked in
advance, is a deliberate choice to build the real, general mechanism
this feature would actually need the moment `simulatedSave` were ever
replaced with a real, honest network call.

### Commands Needed

None — plain HTML/JS, no build step, openable directly in a browser.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature — Sync clicked with empty history (failure), a real
action recorded and synced again (success), and a third sync after
more actions:

```
--- clicking Sync with empty history (should fail) ---
immediately after click, syncBtn.disabled: true | status: "Saving..."
after awaiting, syncBtn.disabled: false | status: "Error: Nothing to sync"

--- recording a real action, then syncing again (should succeed) ---
immediately after click, syncBtn.disabled: true | status: "Saving..."
after awaiting, syncBtn.disabled: false | status: "Synced 1 action(s)"

--- adding two more actions, syncing again ---
status: "Synced 3 action(s)"

--- everything else still independent ---
toggle still works, message hidden: false
```

The first two lines of each block are the real, direct proof this
lesson's whole subject rests on: *immediately* after clicking — before
any real waiting has finished — the button is already disabled and the
status already reads "Saving...," proving lines 17–18 run synchronously,
right away, while the real, awaited work is still genuinely pending
underneath. The line after proves both real outcomes resolve
correctly, and the button correctly re-enables either way, via
`finally`, regardless of which path was taken.

### Connection

This is the final piece — syncing now genuinely, honestly reflects
real, asynchronous work: a real pending state the user can see, a real
success message, and a real, honest failure message, never leaving the
button stuck disabled or the user with no explanation at all.

---

## Closing

**Connect the pieces.** One real sequence, start to finish, through
every real, asynchronous moment this lesson built: the user has
already clicked `+1` — `history` holds one real entry. The user clicks
Sync. `handleSync` (this lesson's fourth unit) begins running,
synchronously, right away: `syncBtn.disabled = true` and
`syncStatus.textContent = 'Saving...'` both happen instantly, visible
to the user before any real delay has even started.

`try` begins. `await simulatedSave()` calls `simulatedSave` (this
lesson's second unit): a real, new Promise is constructed immediately,
its executor running synchronously — but the real work inside it, a
`setTimeout` call (this lesson's first unit) with a real, 20
millisecond delay, is only scheduled, not yet run. `await`, at this
exact point, pauses `handleSync`'s own execution — nothing past this
line runs yet — while the rest of the page stays fully responsive,
free to handle any other real click in the meantime.

Twenty real milliseconds later, the scheduled callback actually runs:
`history.length === 0` is `false`, since one real entry already
exists, so `resolve(`...`)` is called with the real string `"Synced 1
action(s)"`. This is the real, exact moment the Promise settles — and
the real, exact moment `await` resumes `handleSync`, right where it
paused, with `resultMessage` now holding that real string.
`syncStatus.textContent = resultMessage` writes it to the page. No
error was thrown, so `catch`'s own block never runs at all. `finally`
runs regardless, as it always does: `syncBtn.disabled = false` —
Sync is clickable again, correctly, whether the real outcome above it
was success or failure. One real Promise, one real pause, one real
resume — the entire, honest shape of waiting for something that
genuinely isn't instant.
