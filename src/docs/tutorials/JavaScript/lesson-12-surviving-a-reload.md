# Lesson 12: Surviving a Reload

- **What you will build.** Real persistence — refresh the page, or
  close the tab and come back later, and the count and full history
  are still exactly where they were. The transferable problem: every
  single thing this project has built, across eleven lessons, lives
  entirely in memory — a real, running script's own variables — which
  means every one of it, without exception, is completely and silently
  gone the instant the page reloads. This lesson is the first one
  where "the user did something" needs to survive past the one, real,
  running instance of the page they did it on.

- **What you need to know first.** Lesson 8's object literals and
  `history` array of `{ label, amount, resultingCount }` records.
  Lesson 9's `renderHistory`/`renderStats` and the single-source-of-
  truth principle — this lesson adds a second, real place that same
  source of truth now also has to reach.

- **Terms used in this lesson**

  - **Persistence** — data that survives past the one, particular
    running instance of a program that created it — outliving a page
    reload, a browser restart, or the computer itself being turned
    off and back on. It exists because a real, useful application
    frequently needs to remember things across sessions, not just
    within one — an in-memory variable, no matter how carefully
    managed, is erased completely the moment the page or process that
    held it stops running.

- **Objects and methods used**

  - **`localStorage`**
    - *What it is:* a real, browser-provided storage area, tied to the
      specific page's own origin, that persists real string data on
      the user's own device, across reloads and browser restarts.
    - *Implementation:* a real, global, key-value store — every value
      stored and retrieved is always a real string, nothing else;
      there's exactly one `localStorage` per origin, shared by every
      tab or window open to that same site, and it survives until
      something explicitly clears it or the user clears their own
      browser data.
    - *Its use:* this is the real, standard mechanism this lesson uses
      to make `count` and `history` survive a reload — nothing this
      project has used before persists past the running page at all.
    - *Type:* a global, browser-provided object (an instance of the
      `Storage` interface).
    - *Responsibility:* hold real, string key-value pairs, durably, on
      the user's own device, independent of any one running page.
    - *Depends on:* nothing from your code — provided automatically by
      the browser.
    - *Connects to:* `.setItem`/`.getItem`, below, are called on it
      directly.
    - *Shape:* a public, global, persistent storage API — the first
      real mechanism in this curriculum whose effect outlives the
      page itself.

  - **`localStorage.setItem(key, value)`**
    - *What it is:* a method that stores a real string value under a
      real string key, persistently.
    - *Implementation:* takes two string arguments; overwrites
      whatever was previously stored under that exact key, if
      anything; returns nothing meaningful — its entire, real effect
      is the persistent write itself.
    - *Its use:* this is the one, real place this lesson's own state —
      `count` and `history` together — actually gets written to
      durable storage.
    - *Type:* an instance method, called on `localStorage`.
    - *Responsibility:* durably store exactly one real string value
      under exactly one real string key.
    - *Depends on:* a key string, and a value that must itself already
      be a string — never an object or array directly.
    - *Connects to:* called inside this lesson's own `saveState`
      function, with a value built by `JSON.stringify`, below.
    - *Shape:* a mutation API — real, durable, and, unlike every other
      mutation this curriculum has covered, outliving the page itself.

  - **`localStorage.getItem(key)`**
    - *What it is:* a method that retrieves the real string
      previously stored under a given key.
    - *Implementation:* takes one string argument; returns the real,
      stored string if that key exists, or `null` if it was never set
      — never `undefined`, and never an error, even for a genuinely
      missing key.
    - *Its use:* this is how this project checks, the instant the page
      loads, whether any real, previously-saved state actually exists.
    - *Type:* an instance method, called on `localStorage`.
    - *Responsibility:* read back exactly the real string most
      recently stored under the given key, or report its real absence
      with `null`.
    - *Depends on:* a key string.
    - *Connects to:* called inside this lesson's own `loadState`
      function; its real, returned string, when present, is handed to
      `JSON.parse`, below.
    - *Shape:* a public read API — the real, durable counterpart to
      `.setItem`.

  - **`JSON.stringify(value)`**
    - *What it is:* a function that converts a real JavaScript value —
      an object, an array, or a primitive — into its real, equivalent
      JSON text.
    - *Implementation:* takes one argument, any real, JSON-representable
      JavaScript value, and returns a real string — the same real,
      standard text format this curriculum's own `response.json()`
      (Lesson 11) already consumes in reverse.
    - *Its use:* `localStorage.setItem` only ever accepts a real
      string — this is the real, necessary step that turns `count`
      and `history`, a real number and a real array of real objects,
      into one real string `setItem` can actually store.
    - *Type:* a `static` method on the built-in `JSON` object.
    - *Responsibility:* faithfully convert a real, in-memory
      JavaScript value into its real, equivalent, standard text
      representation.
    - *Depends on:* a value that's actually representable as real
      JSON — plain objects, arrays, strings, numbers, booleans, and
      `null`; not, for instance, a function.
    - *Connects to:* called inside `saveState`, on an object literal
      combining `count` and `history`; its real, returned string is
      what `.setItem` actually stores.
    - *Shape:* a public, global conversion utility — the real, exact
      inverse of `JSON.parse`, below.

  - **`JSON.parse(text)`**
    - *What it is:* a function that converts real JSON text back into
      its real, equivalent JavaScript value.
    - *Implementation:* takes one string argument and returns the
      real, parsed value — an object, array, or primitive, depending
      on what the real text actually represented; throws a real
      `SyntaxError` if the given string isn't genuinely valid JSON.
    - *Its use:* this is the real, exact inverse of `JSON.stringify` —
      turning the real string `localStorage.getItem` returns back into
      a real, usable object with real `count` and `history` fields.
    - *Type:* a `static` method on the built-in `JSON` object.
    - *Responsibility:* faithfully convert real, standard JSON text
      back into its real, equivalent, in-memory JavaScript value.
    - *Depends on:* a string that's genuinely valid JSON.
    - *Connects to:* called inside `loadState`, on the real string
      `localStorage.getItem` returns; its real, parsed result is what
      this lesson's final unit reads `count` and `history` back out
      of.
    - *Shape:* a public, global conversion utility.

---

## Concept Unit: Turning Real State into a Real String with `JSON.stringify`

### The Problem

`localStorage`, as this lesson's own Header already stated, only ever
stores real strings — but this project's own real state is a real
number (`count`) and a real array of real objects (`history`), neither
of which is a string at all.

> **Before reading on:** Lesson 11's own `response.json()` already
> turned real JSON *text* into a real, usable object. Given this
> lesson needs the exact opposite direction — a real object turned
> back into real text — and this lesson's own Header already named
> the real function that does exactly that, what would calling it on
> `{ count: 6, history: [...] }` actually produce?

### Introduce the Concept in Isolation

Throwaway code, no DOM:

```js
const state = { count: 6, history: [{ label: '+1', amount: 1, resultingCount: 1 }] };
const asString = JSON.stringify(state);
console.log(typeof asString);
console.log(asString);
```

Real run (Node):

```
typeof asString: string
asString: {"count":6,"history":[{"label":"+1","amount":1,"resultingCount":1}]}
```

This proves `JSON.stringify` genuinely converts a real object —
`typeof state` would be `object` — into a real string, faithfully
preserving every real field, including the array nested inside it.

### Discard the Throwaway Example

This standalone `state`/`asString` pair isn't part of the counter
project. It existed only to prove `JSON.stringify` correctly converts
a real object into real, equivalent text.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new `saveState`
  function begun).
- **Change type:** add.
- **Location:** after `renderStats`.
- **Dependencies:** `count`, `history`, both already established.

### The New Code

```js
function saveState() {
  const asString = JSON.stringify({ count, history });
}
```

### The Updated Project

`script.js`'s own new function, in full, this unit's new lines marked:

```js
1  function saveState() {                                            // ← new
2    const asString = JSON.stringify({ count, history });              // ← new
3  }                                                                    // ← new
```

`asString` now genuinely holds this project's own current, real state,
converted to text — nothing yet stores it anywhere durable; the next
unit is what actually does.

### Mechanical Walkthrough

- **`function saveState()`** — a named function declaration, explained
  in full in Lesson 6.
- **`const asString = `...`;`** — the declaration and assignment,
  explained in full in Lessons 1 and 2.
- **`JSON.stringify`** — the function itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `JSON.stringify` with one
  argument.
- **`{ count, history }`** — an object literal, explained in full in
  Lesson 8; uses the identical real shorthand already established
  there — `count` and `history` here are shorthand for `count: count`
  and `history: history`, legal because variables of those exact names
  already exist in this scope.

### CS Lens

Converting a real, in-memory structure into a real, portable text
representation is a concrete instance of **serialization** — the
general, real problem of taking something that only exists as live
memory inside one running program and turning it into a real, durable
or transmittable form, the exact same real problem `JSON.stringify`'s
own real inverse, `.json()` (Lesson 11), already solved in the
opposite direction for network data.

Also recognized in: saving a real video game's own progress to a real
file; a document editor's own "Save" writing real, in-memory content
to a real file on disk; a database dump exporting real, live table
data into a real, portable file; any real object sent across a network
connection, which has to be serialized into real bytes before it can
travel at all.

### SE Lens

The real alternative not chosen is storing `count` and `history` as
two *separate* real `localStorage` entries, under two different real
keys, rather than combined into one real object first. That would
avoid `JSON.stringify`/`JSON.parse` for the `count` half entirely
(`String(count)` alone would do) — but the real cost is exactly the
same "two things that have to stay in sync" risk this project's own
Lesson 7 and Lesson 8 SE Lenses already warned against, now at the
level of storage keys instead of in-memory variables: a real bug that
updates one key but not the other would silently corrupt the saved
state in a way nothing would catch. Combining them into one real
object, serialized together, in one real write, keeps them
structurally inseparable — the same single-source-of-truth principle,
carried through to how this project's own state is actually stored.

### Commands Needed

None.

### Run It

Real output shown above, proving `JSON.stringify` correctly converts
this project's own real state shape. Exercised as part of this
lesson's closing full-project run, below.

### Connection

Real state can now become real text — the next unit is what actually
stores that text durably.

---

## Concept Unit: Storing the Real Text with `localStorage.setItem`

### The Problem

`saveState` can build a real string, but nothing yet writes it
anywhere that would survive a reload — it's still just a local
variable inside a function, gone the moment that function returns.

> **Before reading on:** this lesson's own Header already named
> `localStorage.setItem` as the real method that durably stores a
> string under a key. Given `asString` already holds this project's
> own real, current state as text, what would the one, real line that
> actually saves it durably need to look like?

### Introduce the Concept in Isolation

Real code, using a real `localStorage` (via a real, in-memory
implementation jsdom provides, tied to a real page origin):

```js
console.log(localStorage.length);
localStorage.setItem('counterAppState', '{"count":6,"history":[]}');
console.log(localStorage.length);
console.log(localStorage.getItem('counterAppState'));
```

Real run (Node + jsdom):

```
localStorage.length before: 0
localStorage.length after: 1
getItem right back: {"count":6,"history":[]}
```

This proves `.setItem` genuinely, durably stores a real value —
`localStorage.length`, a real count of stored entries, correctly goes
from `0` to `1`, and reading the exact same key back immediately
returns the exact real string that was stored.

### Discard the Throwaway Example

This standalone `localStorage` write isn't part of the counter
project's own tracked code — it existed only to prove `.setItem`
genuinely, durably stores a value.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `saveState` completed).
- **Change type:** add.
- **Location:** immediately after the `JSON.stringify` call added in
  the previous unit.
- **Dependencies:** `asString`, from the previous unit.

### The New Code

```js
localStorage.setItem('counterAppState', asString);
```

### The Updated Project

`script.js`'s own `saveState` function, in full, this unit's new line
marked:

```js
1  function saveState() {
2    const asString = JSON.stringify({ count, history });
3    localStorage.setItem('counterAppState', asString);               // ← new
4  }
```

`saveState` is now genuinely complete — calling it durably stores
this project's own current, real state, under one, real, fixed key,
surviving past this exact function call.

### Mechanical Walkthrough

- **`localStorage`** — the global object itself, explained in full
  above.
- **`.setItem`** — the method itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `.setItem` with two arguments.
- **`'counterAppState'`** — a string literal naming the real key this
  project's own state is stored under; chosen to be specific enough
  that it's unlikely to collide with anything else stored under the
  same real origin.
- **`,`** — separates `.setItem`'s two arguments.
- **`asString`** — the variable from the previous unit, holding this
  project's own real, current state as text.
- **`;`** — ends the statement.

### CS Lens

Not applicable as a new hard concept beyond what's already established
above (`localStorage`'s own Objects/methods entry) — this unit's real
contribution is the actual, durable write, not a second, separate
idea.

### SE Lens

The real alternative not chosen — a real, remote server storing this
same state instead of `localStorage` — is exactly what Lesson 10's own
`simulatedSave` gestured toward without actually building. `localStorage`
is real, genuinely simpler for a project this size: no real network
request, no real server to run or pay for, no real possibility of the
kind of failure Lesson 10 and Lesson 11 both had to handle. The real
cost: `localStorage` is tied to one, real, specific browser, on one,
real, specific device — the same count and history typed on a phone
would not appear on a laptop, the way real, server-backed storage
could provide. For a small, personal tool like this project, that's a
real, reasonable, honest tradeoff; a real, multi-device product would
need the real, server-backed approach this project's own Lesson 10
already began exploring instead.

### Commands Needed

None.

### Run It

Real output shown above, proving `.setItem` durably stores a value.
Exercised as part of this lesson's closing full-project run, below.

### Connection

State can now be saved — the next two units are what actually read it
back, the moment the page loads again.

---

## Concept Unit: Reading the Real Text Back with `localStorage.getItem`

### The Problem

Real, saved state now exists in `localStorage` after any action — but
nothing yet reads it back. If the page reloaded right now, this
project's own script would start over from `count = 0`, `history =
[]`, exactly as it always has, completely ignoring whatever was
genuinely, durably saved.

> **Before reading on:** this lesson's own Header already named
> `localStorage.getItem` as the real, exact inverse of `.setItem`.
> Given a real key might genuinely have nothing stored under it yet —
> the very first time this page is ever opened, for instance — what
> real, specific value would you expect `.getItem` to return in that
> case, rather than an error?

### Introduce the Concept in Isolation

Real code, against a real `localStorage`:

```js
console.log(localStorage.getItem('neverSet'));
localStorage.setItem('realKey', 'hello');
console.log(localStorage.getItem('realKey'));
```

Real run (Node + jsdom):

```
getItem for a key that was never set: null
getItem for a key that was set: hello
```

This proves `.getItem` correctly, safely reports a genuinely missing
key with `null` — no error, nothing thrown — and correctly returns
the exact real string that was actually stored when the key does
exist.

### Discard the Throwaway Example

This standalone `localStorage` read isn't part of the counter
project's own tracked code — it existed only to prove `.getItem`'s
real behavior in both the present and absent cases.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new `loadState`
  function begun).
- **Change type:** add.
- **Location:** after `saveState`.
- **Dependencies:** none new.

### The New Code

```js
function loadState() {
  const raw = localStorage.getItem('counterAppState');
  if (raw === null) return;
}
```

### The Updated Project

`script.js`'s own new function, in full, this unit's new lines marked:

```js
1  function loadState() {                                            // ← new
2    const raw = localStorage.getItem('counterAppState');              // ← new
3    if (raw === null) return;                                         // ← new
4  }                                                                    // ← new
```

Line 2 reads whatever was most recently saved, if anything. Line 3
guards against the real, honest case of nothing having been saved
yet — the identical early-return shape established across this
curriculum since Lesson 5 — correctly doing nothing at all rather than
trying to use a real `null` as if it were real, saved state.

### Mechanical Walkthrough

- **`function loadState()`** — a named function declaration, explained
  in full in Lesson 6.
- **`const raw = `...`;`** — the declaration and assignment, explained
  in full in Lessons 1 and 2.
- **`localStorage.getItem`** — the method itself, explained in full
  above.
- **`(`...`)`** — call syntax, invoking `.getItem` with one argument.
- **`'counterAppState'`** — the same, exact key string `.setItem`
  already used — has to match exactly, or this line would read the
  wrong entry, or none at all.
- **`if (raw === null) return;`** — `if`, explained in full in Lesson
  3; `===`, explained in full in Lesson 6; `return`, explained in full
  in Lesson 6; the guard correctly distinguishing "nothing was ever
  saved" from "something was saved."

### CS Lens

Not applicable — the read side of `localStorage` shares the identical
real category (persistence) as `.setItem`, already covered as this
lesson's own hard concept in its earlier unit.

### SE Lens

The real, honest design decision worth naming: checking for `null`
explicitly, rather than assuming a real value will always be there, is
what makes this project's very first-ever page load — before any
action has ever been taken, by anyone, on this device — work
correctly, with no real error, rather than crashing on a genuinely
missing key the first time this feature is ever used at all.

### Commands Needed

None.

### Run It

Real output shown above, proving both the present and absent cases.
Exercised as part of this lesson's closing full-project run, below.

### Connection

The real, saved text can now be found again — the final unit is what
turns it back into real, usable state and wires the whole feature
together.

---

## Concept Unit: Restoring Real State with `JSON.parse`

### The Problem

`raw` holds the real, saved text, when it exists — but it's still just
text; nothing yet turns it back into a real `count` number and a real
`history` array this project's own code can actually use.

> **Before reading on:** this lesson's own Header already named
> `JSON.parse` as the real, exact inverse of `JSON.stringify`. Given
> `raw` holds text shaped exactly like
> `{"count":6,"history":[...]}`, what would the real, single line
> that turns it back into a real, usable object look like — and what
> would need to happen to `count` and `history` themselves,
> afterward, to make the loaded state actually take effect?

### Introduce the Concept in Isolation

Real code, no DOM, combining every mechanism this lesson has built —
a full, real round trip:

```js
function saveState(count, history) {
  localStorage.setItem('counterAppState', JSON.stringify({ count, history }));
}
function loadState() {
  const raw = localStorage.getItem('counterAppState');
  if (raw === null) return null;
  return JSON.parse(raw);
}

console.log(loadState());

saveState(16, [
  { label: '+1', amount: 1, resultingCount: 1 },
  { label: '+5', amount: 5, resultingCount: 6 },
  { label: '+10', amount: 10, resultingCount: 16 },
]);

const loaded = loadState();
console.log(loaded.count, loaded.history.length, loaded.history[2].resultingCount);
```

Real run (Node + jsdom):

```
loadState() with nothing saved yet: null
loaded.count: 16
loaded.history.length: 3
loaded.history[2].resultingCount: 16
```

This proves the entire real round trip works correctly, end to end: a
real save, followed by a real load, correctly reconstructs the exact
real `count` and every real entry of `history`, including nested,
real fields three levels deep (`history[2].resultingCount`) — and the
"nothing saved yet" case correctly, safely returns `null` rather than
failing.

### Discard the Throwaway Example

This standalone `saveState`/`loadState` pair isn't part of the counter
project's own throwaway material — the real functions themselves,
completed in this exact shape, are added to the real project in this
step.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `loadState` completed;
  `saveState()` called at the end of both `recordAction` and
  `undoLastAction`; `loadState()` called once, near the bottom of the
  script, along with the render calls needed to reflect whatever it
  restored).
- **Change type:** add.
- **Location:** `loadState`'s own remaining body; one new line inside
  `recordAction`; one new line inside `undoLastAction`; several new
  lines near the script's own existing initial setup.
- **Dependencies:** `saveState`, from this lesson's first two units;
  `count`, `history`, `renderHistory`, `renderStats`, `undoBtn`, all
  already established.

### The New Code

```js
function loadState() {
  const raw = localStorage.getItem('counterAppState');
  if (raw === null) return;
  const parsed = JSON.parse(raw);
  count = parsed.count;
  history = parsed.history;
}
```

### The Updated Project

`script.js`, this lesson's own full, final section, every change from
this whole lesson shown together, new/changed lines marked:

```js
 1  function saveState() {
 2    const asString = JSON.stringify({ count, history });
 3    localStorage.setItem('counterAppState', asString);
 4  }
 5
 6  function loadState() {
 7    const raw = localStorage.getItem('counterAppState');
 8    if (raw === null) return;
 9    const parsed = JSON.parse(raw);                                  // ← new
10   count = parsed.count;                                              // ← new
11   history = parsed.history;                                          // ← new
12 }
13
14 function recordAction(label, amount) {
15   count = count + amount;
16   countDisplay.textContent = `Clicked ${count} times`;
17   history.push({ label, amount, resultingCount: count });
18   renderHistory();
19   renderStats();
20   undoBtn.disabled = history.length === 0;
21   saveState();                                                       // ← new
22 }
23
24 // ... countBtn / resetBtn / quickAddContainer handlers, unchanged ...
25
26 function undoLastAction() {
27   if (history.length === 0) return;
28   const last = history.pop();
29   count = count - last.amount;
30   countDisplay.textContent = `Clicked ${count} times`;
31   renderHistory();
32   renderStats();
33   undoBtn.disabled = history.length === 0;
34   saveState();                                                       // ← new
35 }
36
37 undoBtn.addEventListener('click', undoLastAction);
38
39 loadState();                                                         // ← new
40 countDisplay.textContent = `Clicked ${count} times`;                 // ← new
41 renderHistory();                                                     // ← new
42 renderStats();                                                       // ← new
43 undoBtn.disabled = history.length === 0;                             // ← new
```

Lines 9–11 complete `loadState`: once real, saved text is confirmed to
exist and is parsed, `count` and `history` — this project's own two,
real, top-level pieces of mutable state, both declared with `let` all
the way back in Lessons 2 and 7 — are directly reassigned to the real,
restored values. Lines 21 and 34 make sure every real state change,
through either of this project's two real mutation paths, is
immediately, durably saved. Lines 39–43 run once, the moment the
script itself first runs: `loadState()` restores whatever was saved,
if anything, and the four lines after it bring the *visible* page
back into sync with that restored state — without them, `count` and
`history` would be correctly restored in memory, but the page itself
would still show "Clicked 0 times" and an empty history list until the
next action.

### Mechanical Walkthrough

- **`const parsed = `...`;`** — the declaration and assignment,
  explained in full in Lessons 1 and 2.
- **`JSON.parse`** — the function itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `JSON.parse` with one
  argument.
- **`raw`** — the real, saved string from earlier in this same
  function.
- **`count = parsed.count;`** — a reassignment, explained in full in
  Lesson 2; `parsed.count`, dot-notation field access, explained in
  full in Lesson 8, reading the real, restored number.
- **`history = parsed.history;`** — the identical real mechanism,
  reassigning `history` itself (not merely its contents) to the real,
  restored array `JSON.parse` produced — a genuinely new, real array,
  distinct from whatever empty one `history` started as, entirely
  replacing it.
- **`saveState();`** (inside `recordAction` and `undoLastAction`) — a
  call to this lesson's own, already-completed function, explained in
  full above; the "call a named function" mechanism itself explained
  in full since Lesson 6.
- **`loadState();`** (standalone, near the bottom) — the identical
  real call mechanism, run once, unconditionally, the moment this
  script itself runs — correctly doing nothing at all if nothing was
  ever saved, per this lesson's own third unit's real guard.
- **`countDisplay.textContent = `...`;`** / **`renderHistory();`** /
  **`renderStats();`** / **`undoBtn.disabled = `...`;`** — every one
  of these, explained in full in earlier lessons, now run once at
  startup for the same real reason they already run after every
  action: keeping the visible page honestly in sync with `count` and
  `history`'s own real, current values — here, values that may have
  just been restored from a previous, real session.

### CS Lens

Restoring a real, running program's own in-memory state from durable
storage, the instant it starts, is the concrete, complementary half of
the same **serialization** idea this lesson's own first unit already
named — **deserialization** on this side, the identical real word
Lesson 11's own `.json()` CS Lens already used for the same real
mechanism applied to network data instead of durable storage.

Also recognized in: a video game loading a real save file the instant
it launches; a text editor reopening the real files that were open
when it last closed; an operating system restoring real, previously-
open applications after a real restart; a database engine replaying
its own real write-ahead log (Lesson 7's own CS Lens) to rebuild its
real, current state after a real crash.

### SE Lens

The real, honest tradeoff worth naming one final time: `loadState`
trusts that whatever real JSON it finds in `localStorage` genuinely
matches this project's own expected shape — a real object with real
`count` and `history` fields. If this project's own data shape ever
changed in a future lesson (an additional real field added to each
history entry, say), a real, previously-saved, older-shaped value
would still load without any error at all — `JSON.parse` would
succeed, and `count`/`history` would be reassigned to whatever the
older, real shape actually contained, silently missing anything new
that later code expected to find. This is the identical, honest kind
of gap this curriculum has already named plainly more than once (Lesson
6's numeric-only validation, Lesson 9's manual `renderStats` wiring) —
real, working code, with a real, named limitation, rather than a
larger, more defensive validation layer this project's own current
size doesn't yet justify building.

### Commands Needed

None — plain HTML/JS, no build step, openable directly in a browser.
Note: `localStorage` behaves per real, browser-defined origin — for a
file opened directly (a `file://` URL), most real browsers still
support it, though its real, exact behavior across different real
browsers for local files specifically is worth checking if this
project were ever served differently later.

### Run It

Real output, from a headless DOM run genuinely simulating a full page
reload — the same `localStorage` instance is carried across two
entirely separate, fresh instances of this project's own code, the
real, honest equivalent of closing and reopening the page:

```
--- FIRST "PAGE LOAD" — nothing in localStorage yet ---
initial countDisplay: Clicked 0 times
localStorage after load (should be empty): 0

--- user clicks +1, +5, +10 ---
count: 16 | countDisplay: Clicked 16 times
localStorage now has an entry: true
raw saved value: {"count":16,"history":[{"label":"+1","amount":1,"resultingCount":1},{"label":"+5","amount":5,"resultingCount":6},{"label":"+10","amount":10,"resultingCount":16}]}

--- SIMULATING A REAL PAGE RELOAD ---
(new JSDOM instance = fresh page load, but SAME localStorage carried over)
countDisplay immediately after "reload": Clicked 16 times
history.length immediately after "reload": 3
historyList children after reload: 3

--- undo still works correctly after a reload, and re-saves ---
count after undo: 6 | countDisplay: Clicked 6 times
re-saved state reflects the undo: true

--- reset persists too ---
count after reset: 0
saved count after reset: 0

--- toggle still independent, and never touches localStorage ---
message hidden: false
localStorage entry count unchanged by toggle: true
```

The middle block is the real, direct proof this whole lesson exists
for: a genuinely fresh, second instance of this project's own code —
built from the exact same HTML, with no memory of the first instance's
own variables at all — correctly shows "Clicked 16 times" and a full,
three-entry history, immediately, before any new action happens,
because `loadState()` restored it from real, durable storage the
instant that second instance started running.

### Connection

This is the final piece — every real action this project can take now
survives past the one, particular running page that took it.

---

## Closing

**Connect the pieces.** One real sequence, spanning two genuinely
separate real page loads: the user, on their very first visit, clicks
`+1`, `+5`, `+10`. Each click runs `recordAction` (Lesson 8), and each
one, new to this lesson, ends by calling `saveState()` (this lesson's
first two units): `JSON.stringify({ count, history })` converts the
real, current `count` (`16`) and the real, three-entry `history` array
into one real string; `localStorage.setItem('counterAppState',
`...`)` durably writes it — real, genuine persistence, on the user's
own device, outliving this exact running page.

The user closes the tab. Every real, in-memory variable this script
ever had — `count`, `history`, every element reference — is gone
completely; nothing about a running JavaScript program survives its
own page closing. But `localStorage`, per this lesson's own Header, is
tied to the real origin, not the running page — the real, saved string
is still there.

The user reopens the page. This script runs again, entirely fresh,
`count` starting back at its own declared `let count = 0;` (Lesson 2)
and `history` at `let history = [];` (Lesson 7) — exactly as it always
has. But this lesson's own final unit's own standalone call,
`loadState()`, now runs immediately: `localStorage.getItem
('counterAppState')` (this lesson's third unit) finds the real, saved
string; `raw === null` is `false`, so the guard doesn't trigger;
`JSON.parse(raw)` (this lesson's final unit) reconstructs the real
object; `count = parsed.count` and `history = parsed.history` directly
reassign this project's own two, real, top-level variables to their
real, restored values. The four lines immediately after —
`countDisplay.textContent`, `renderHistory()`, `renderStats()`,
`undoBtn.disabled` — bring the visible page into sync with what was
just restored. The user sees "Clicked 16 times" and their full, real
history, exactly as they left it — never having to redo a single real
action, because the one, real, durable copy of their state was never
actually gone at all.
