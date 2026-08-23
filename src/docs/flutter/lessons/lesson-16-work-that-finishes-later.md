# Lesson 16: Work That Finishes Later

**What you will build:** A function that schedules work to complete a few
milliseconds from now, proven, for real, to still let every other line of
`main` run *first*; the same idea rewritten with `async`/`await` instead
of a raw callback; a `Stream` producing several values one at a time
instead of a single eventual one; and a close look at the one mechanism —
Dart's own single-threaded event loop — underneath all of it. None of
this joins a real project yet. This is Phase 1's final lesson before its
own console Sudoku engine milestone.

**What you need to know first:** Lesson 8's functions and return values.
Lesson 7's `for` and `for-in` loops, both echoed by this lesson's own
`Stream`-walking syntax. Lesson 15's closures, reused directly by
`.then`'s own callback argument.

**Terms used in this lesson:**

- **Synchronous** — code that runs to completion, one statement after
  another, with nothing else able to run in between, before control
  returns to whatever called it. Every single line of code this
  curriculum has written before this lesson has been synchronous.
- **Asynchronous** — work that doesn't finish immediately when it starts —
  a network request, a timer, a file read — represented as a value
  (`Future`, below) standing in for a result that will exist *later*,
  letting the rest of the program keep running in the meantime rather
  than freezing until that work finishes.
- **`Future<T>`** — a real class representing a value of type `T` that
  either already exists, or will exist at some point in the future, not
  necessarily by the time code immediately after it runs. It exists so
  asynchronous work can be represented as an ordinary value — passed
  around, stored, returned — rather than requiring the entire program to
  physically pause and wait for it.
- **Callback** — a function (Lesson 8's term, reappearing) handed to
  another piece of code to be called later, once some specific event
  occurs — here, once a `Future` actually resolves. `.then`'s own
  argument, in this lesson's first unit, is exactly this: a closure
  (Lesson 15's term, reappearing) that doesn't run immediately at the
  call site, but later, once the `Future` it's attached to completes.
- **Event loop** — the single mechanism Dart's runtime uses to decide what
  runs next: it runs all currently-available synchronous code to
  completion first, and only once there's genuinely nothing else waiting
  to run does it check whether any scheduled asynchronous callback is
  ready to run. It exists because Dart, like JavaScript, runs on a single
  thread — nothing here happens on a separate, simultaneous thread of
  execution; "asynchronous" means *reordered*, not *simultaneous*.
- **`async`** — a keyword placed on a function's own declaration, marking
  it as one whose body may use `await` (below), and automatically wrapping
  whatever it returns in a `Future` (or, for a function returning nothing
  meaningful, `Future<void>`), even if the function's own body never
  mentions `Future` at all.
- **`await`** — used only inside an `async` function, pauses that
  function's own execution at the exact point it's written, until the
  `Future` it's given actually resolves, then resumes with that
  `Future`'s own real value — without blocking the rest of the program,
  which is free to keep running via the event loop in the meantime.
- **`Stream<T>`** — a real class representing a sequence of values of
  type `T` arriving over time, rather than `Future<T>`'s single, one-time
  eventual value. It exists for genuinely repeated asynchronous data — a
  series of user taps, a sequence of incoming network messages — where a
  single `Future` could only ever represent one of them.
- **`async*`, `yield`** — `async*` marks a function as one that produces a
  `Stream` rather than a single `Future`; `yield`, used inside it, produces
  one more value into that stream each time it runs, pausing there until
  whatever is consuming the stream is ready for the next one.
- **`await for`** — a loop (structurally similar to Lesson 7's `for-in`)
  that consumes a `Stream`, one value at a time, running its own body once
  per value as each one actually arrives.
- **Event-driven programming** — structuring a program around responding
  to events as they occur (a `Future` resolving, a `Stream` producing a
  new value, and, once Phase 3 introduces Flutter, a screen tap) rather
  than a single, fixed, top-to-bottom sequence of steps. It exists because
  real interactive programs — including every game this curriculum builds
  toward — don't run once and finish; they run continuously, reacting to
  whatever happens next, in whatever order it actually happens.

**Objects and methods used:**

- **`Future<T>`**
  - *What it is:* a real, generic class from `dart:async`.
  - *Implementation:* relevant real members used here: `Future.delayed`
    (a named constructor producing a `Future` that resolves after a given
    `Duration`, running a given callback to produce its value) and
    `.then` (registering a callback to run once the `Future` resolves,
    handed that resolved value as its own argument).
  - *Its use:* Concept Unit 1's `computeDigitLater` returns one, real-
    proved to resolve strictly after every synchronous line already
    written in `main`.
  - *Type:* a generic class.
  - *Responsibility:* represent one eventual value, and let other code
    register what should happen once it actually arrives, without
    blocking anything in the meantime.
  - *Depends on:* whatever asynchronous work (here, `Future.delayed`'s own
    timer) actually produces its value.
  - *Connects to:* produced by `Future.delayed`; consumed by `.then` in
    Concept Unit 1, and by `await` in Concept Units 2 and 3.
  - *Shape:* the foundational type every asynchronous operation in Dart —
    and, later in this curriculum, every network call and database
    query — is built on.
- **`Duration`**
  - *What it is:* a real `dart:core` class representing a span of time.
  - *Implementation:* `const Duration({int milliseconds = 0, ...})` — a
    `const` constructor (Lesson 13's term, reappearing), taking several
    optional named parameters (Lesson 8's term, reappearing) for
    different units of time.
  - *Its use:* Concept Unit 1 uses one to specify how long
    `Future.delayed` should wait.
  - *Type:* a class representing one fixed span of time.
  - *Responsibility:* represent an amount of elapsed time, independent of
    any specific clock or calendar date.
  - *Depends on:* the specific unit(s) of time supplied to its
    constructor.
  - *Connects to:* handed to `Future.delayed` to control its own timing.
  - *Shape:* a small, real, supporting value type — proof `Future.delayed`
    isn't special magic, just a real function taking a real, ordinary
    argument.
- **`Stream<T>`**
  - *What it is:* a real, generic class from `dart:async`.
  - *Implementation:* relevant real member used here: `.fold` (walks
    every value the stream produces, combining them one at a time with a
    given function, into one final result — structurally similar to
    Lesson 9's own `Iterable` methods, but over values arriving across
    time rather than already all present at once).
  - *Its use:* Concept Unit 4's `countCells` produces one, consumed two
    different real ways.
  - *Type:* a generic class.
  - *Responsibility:* represent a sequence of values arriving over time,
    and let other code consume them as they arrive.
  - *Depends on:* something actually producing values into it — here, an
    `async*` function's own `yield` statements.
  - *Connects to:* produced by `countCells`; consumed by `await for` and
    by `.fold`.
  - *Shape:* `Future`'s own multi-value counterpart, sharing much of its
    conceptual shape with Lesson 9's `Iterable`, but for asynchronous data.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: A Value That Doesn't Exist Yet

### The Problem

Every function this curriculum has written returns its value immediately —
`addPoints(3, 4)` (Lesson 8) hands back `7` the instant it finishes. Real
work — reading a file, waiting for a network response, even just a short,
deliberate delay — can't return its result immediately, because that
result doesn't exist yet when the function is called. How does a function
hand back something it doesn't have yet?

> **Stop and think before reading on:** If a function scheduled some work
> to finish in 5 milliseconds, and then the very next line of code in
> `main` ran immediately after calling it, which do you think happens
> first: that next line, or the scheduled work's own result becoming
> available? What do you think Dart actually does while that 5
> milliseconds is elapsing?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-16/async_demo.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
Future<int> computeDigitLater() {
  return Future.delayed(const Duration(milliseconds: 5), () => 42);
}

void main() {
  print('1: before scheduling the future');
  computeDigitLater().then((value) {
    print('3: future resolved with $value');
  });
  print('2: right after scheduling, future has not resolved yet');
}
```

### The Updated Project

Not applicable — this is the file's brand-new, complete content.

### Introduce the concept in isolation

This unit's own Socratic question is exactly the kind of claim worth real
proof, not confidence — run for real:

```
1: before scheduling the future
2: right after scheduling, future has not resolved yet
3: future resolved with 42
```

Line `2` runs **before** line `3`, even though `2` sits, in the source,
physically *after* `.then` was already called — proving the scheduled
`Future`'s own callback did not run immediately, and did not run before
the rest of `main`'s own synchronous code finished, regardless of the
delay being only 5 milliseconds.

### Discarding this example

`computeDigitLater`'s own fixed delay and value are disposable. What
carries forward: `Future<T>` represents a value that will exist later;
`.then` registers a callback to run once it actually does, without
blocking anything else in the meantime.

### Mechanical walkthrough

- **`Future<int> computeDigitLater()`** — a function declaration whose
  return type is `Future<int>` (this lesson's header): a generic type
  parameter (Lesson 9's term, reappearing), `<int>`, fixing what type of
  value this `Future` will eventually hold.
- **`Future.delayed(const Duration(milliseconds: 5), () => 42)`** —
  `Future.delayed` (this lesson's header), a real named constructor;
  `const Duration(milliseconds: 5)` (this lesson's header) specifies the
  wait; `() => 42` is an anonymous function (Lesson 9's term,
  reappearing) with no parameters at all, run once the delay elapses, to
  actually produce the `Future`'s own value, `42`.
- **`computeDigitLater().then((value) { ... })`** — a method call
  (Lesson 9's term, reappearing), `.then` (this lesson's header),
  registering a callback (this lesson's term): `(value) { ... }`, an
  anonymous function that will run later, handed `42` as `value` once the
  `Future` actually resolves.
- **`print('2: ...')`** — the same `print` function from this lesson's
  header, appearing physically after `.then` in the source, but, per the
  real proof above, still running before `.then`'s own callback does.

### CS lens

Representing a not-yet-available result as an ordinary value, rather than
physically pausing an entire program until it arrives, is the core idea
behind **asynchronous programming** — distinguishing *asynchronous*
(reordered, still on one thread) from *concurrent*/*parallel* (genuinely
simultaneous, usually on separate threads or cores), a distinction Lesson
89 (Performance Profiling) returns to.

```
Also recognized in: JavaScript's own Promise (the direct model
`Future` is based on); a restaurant giving you a buzzer instead of
making you stand at the counter until your order is ready; a claim
ticket at a dry cleaner, letting you leave and come back rather than
wait on the spot
```

### SE lens

If Dart instead physically froze the entire program for every 5-
millisecond delay (or every real network request, which can take far
longer), an interactive program — including every game this curriculum
builds toward — would become completely unresponsive for that entire
span, unable to process a single keypress or screen tap in the meantime.
`Future`'s real cost is a different, less linear-looking style of code (a
callback that runs "later," not the next physical line); its real benefit,
proven directly by this unit's own run, is that nothing else in the
program has to stop and wait for it.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Real, verified output:

```
1: before scheduling the future
2: right after scheduling, future has not resolved yet
3: future resolved with 42
```

Real, saved in full in
`src/docs/flutter/verification/lesson-16/run-log.md`.

### Connecting this unit

This unit proved a `Future`'s callback always runs after already-scheduled
synchronous code. The next unit introduces a different, more linear-
looking way to write the exact same waiting relationship.

---

## Concept Unit: Writing "Wait for This" Without a Callback

### The Problem

The previous unit's `.then` works, but nesting several dependent
asynchronous steps this way (a second `Future` that depends on the
first one's result, inside `.then`'s own callback, inside another
`.then`) quickly grows deeply indented and hard to read in order. Is
there a way to write "do this, then wait, then do the next thing" that
reads top-to-bottom, the way ordinary synchronous code already does?

> **Stop and think before reading on:** If a function's own body could
> pause partway through, at the exact line where it needs a `Future`'s
> value, and resume once that value actually arrives — continuing on to
> the very next line, in order — would the rest of the *program* (not
> just this one function) still be free to keep running during that
> pause, the same way Concept Unit 1's own proof showed for `.then`?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-16/async_await_demo.dart`
  — created, containing this unit's function; Concept Units 4 and 5 will
  each add their own code to this same file.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
Future<int> computeDigitLater() {
  return Future.delayed(const Duration(milliseconds: 5), () => 42);
}

Future<void> placeDigitAsync() async {
  print('1: about to await');
  int digit = await computeDigitLater();
  print('2: resumed after await with $digit');
}
```

### The Updated Project

Not applicable — this file's brand-new starting content.

### Introduce the concept in isolation

Real, verified output (batched with the rest of this lesson):

```
1: about to await
2: resumed after await with 42
```

`placeDigitAsync`'s own two `print` calls run in the exact order they're
written, top to bottom — the `await` on the middle line genuinely paused
execution there until `computeDigitLater()`'s `Future` resolved, then
resumed with its real value, `42`, stored directly into `digit`.

### Discarding this example

`placeDigitAsync`'s own specific delay and value are disposable. What
carries forward: `async` marks a function as one that can use `await`;
`await` pauses that function's own body at one specific line until a
`Future` resolves, then continues on to the next line with its real
value — reading top-to-bottom, unlike Concept Unit 1's own nested
`.then` callback.

### Mechanical walkthrough

- **`Future<void> placeDigitAsync() async`** — `async` (this lesson's
  term), placed directly after the parameter list; this automatically
  wraps whatever the function returns in a `Future` — here, `Future<void>`,
  since this function's own body never explicitly returns a value.
- **`print('1: about to await');`** — runs immediately, synchronously,
  the instant `placeDigitAsync` is called — nothing about `async` delays
  a function's own body from starting right away.
- **`int digit = await computeDigitLater();`** — `await` (this lesson's
  term): pauses `placeDigitAsync`'s own execution at exactly this line
  until `computeDigitLater()`'s returned `Future` resolves; once it does,
  execution resumes here, and `digit` is assigned the `Future`'s own real
  value, `42` — the same real value Concept Unit 1's own `.then` callback
  received, now obtained without a separate, nested callback at all.
- **`print('2: resumed after await with $digit');`** — runs only after
  the `await` above has actually resumed, using string interpolation
  (Lesson 4's term, reappearing) to show the real, resolved value.

### CS lens

`async`/`await` is **syntactic sugar**: code that reads as though it
pauses and resumes in a straight line, while the compiler transforms it,
underneath, into the exact same callback-based machinery Concept Unit 1
already showed directly — proven by both units producing the identical
real ordering guarantee, just written two different ways.

```
Also recognized in: JavaScript's own `async`/`await` (built directly
on Promises, the same relationship Dart's has to `Future`); C#'s
`async`/`await`; Python's `async`/`await` over its own coroutines —
all four languages converged on nearly identical syntax for the
identical underlying idea
```

### SE lens

`.then`'s own real cost, compared to `await`, grows with how many
dependent asynchronous steps a piece of code needs — each one nests one
level deeper inside the previous one's callback. `await` keeps the same
underlying behavior (proven identical to `.then` by this lesson's own two
units) while reading top-to-bottom regardless of how many steps are
chained — a real, practical readability win with no change in what
actually runs or when.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's code is combined with Concept Unit 4's own Stream code into one
file, run once. Complete output shown in Concept Unit 4's own "Run it"
step.

### Connecting this unit

This unit showed how to wait for one eventual value cleanly. The next
unit turns to a genuinely different shape of problem: waiting for
*several* values, arriving one at a time.

---

## Concept Unit: Several Values, Arriving Over Time

### The Problem

`Future<T>` represents exactly one eventual value. A Sudoku engine
processing a live sequence of player moves, one at a time as they happen,
isn't waiting for one value — it's waiting for a whole, ongoing sequence
of them, with no way to know in advance how many there will be or when
each one will arrive.

> **Stop and think before reading on:** Given Lesson 7's `for-in` already
> walks a fixed, already-complete collection one value at a time, what do
> you predict a similar-looking loop would need to do differently to walk
> a sequence of values that don't all exist yet — arriving one at a time,
> over real time, instead?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-16/async_await_demo.dart`
  — modified, adding a `Stream`-producing function and two ways of
  consuming it, completing the file.
- **Change type:** Add (new function; new code in `main`).
- **Location:** Appended after `placeDigitAsync`; new code inside `main`.
- **Dependencies:** The file created in Concept Unit 2.

### The New Code

```dart
Stream<int> countCells() async* {
  for (int i = 1; i <= 3; i++) {
    yield i;
  }
}
```

And, in `main`:

```dart
await for (var count in countCells()) {
  print('cell $count');
}

var total = await countCells().fold<int>(0, (sum, value) => sum + value);
print('total: $total');
```

### The Updated Project

The complete, final file for this lesson's `async`/`await`/`Stream`
demonstrations (new lines marked; everything above is exactly what
Concept Unit 2 left it as):

```dart
 1: Future<int> computeDigitLater() {
 2:   return Future.delayed(const Duration(milliseconds: 5), () => 42);
 3: }
 4:
 5: Future<void> placeDigitAsync() async {
 6:   print('1: about to await');
 7:   int digit = await computeDigitLater();
 8:   print('2: resumed after await with $digit');
 9: }
10:
11: Stream<int> countCells() async* {              // ← new
12:   for (int i = 1; i <= 3; i++) {                 // ← new
13:     yield i;                                     // ← new
14:   }                                              // ← new
15: }                                                // ← new
16:
17: Future<void> main() async {                       // ← changed: main is now async
18:   await placeDigitAsync();                         // ← new
19:
20:   await for (var count in countCells()) {          // ← new
21:     print('cell $count');                          // ← new
22:   }                                                // ← new
23:
24:   var total = await countCells().fold<int>(0, (sum, value) => sum + value);  // ← new
25:   print('total: $total');                          // ← new
26: }
```

`main` itself is now declared `async`, which is what makes `await`
usable directly inside it at all.

### Introduce the concept in isolation

Real, verified output (completing this lesson's one batched run):

```
1: about to await
2: resumed after await with 42
cell 1
cell 2
cell 3
total: 6
```

`await for` visits `1`, `2`, then `3`, each `yield`ed one at a time by
`countCells`, printing each as it actually arrives — not all three at
once. `.fold`, used separately afterward, walks the same stream again and
sums it to `6`.

### Discarding this example

`countCells`'s own fixed range is disposable. What carries forward:
`async*` marks a function that produces a `Stream`; `yield` produces one
value at a time into it; `await for` consumes one at a time, in order, as
each one arrives; `.fold` (structurally like Lesson 9's own `Iterable`
methods) can combine every value a stream ever produces into one final
result.

### Mechanical walkthrough

- **`Stream<int> countCells() async*`** — `async*` (this lesson's term):
  marks this function as producing a `Stream<int>` (this lesson's
  header) rather than a single `Future`.
- **`for (int i = 1; i <= 3; i++) { yield i; }`** — Lesson 7's `for` loop
  (reappearing), its body using **`yield`** (this lesson's term) instead
  of `return`: each `yield i;` produces one more value into the stream,
  rather than ending the function the way `return` would.
- **`await for (var count in countCells())`** — **`await for`** (this
  lesson's term): structurally similar to Lesson 7's own `for-in`, but
  over a `Stream` instead of an already-complete `List`; each repetition
  waits for the next value to actually be produced before running its own
  body.
- **`countCells().fold<int>(0, (sum, value) => sum + value)`** — `.fold`
  (this lesson's header), a real `Stream` method; `0` is its starting
  accumulator value; `(sum, value) => sum + value` is an anonymous
  function (Lesson 9's term, reappearing) combining the running total
  with each new value as it arrives.

### CS lens

Producing a sequence of values over time, rather than a single eventual
one, is the asynchronous analogue of Lesson 9's own `Iterable` —
`Stream` is to `Future` what a whole collection is to a single value.

```
Also recognized in: RxJS and other "reactive" programming libraries;
a live sports score feed, updating repeatedly rather than reporting
a single final value; a sensor reporting a continuous stream of
readings rather than one measurement
```

### SE lens

Modeling repeated asynchronous events as a single `Future` (say, one that
only resolves once "enough" moves have happened) would lose each
individual moment they actually occurred — a `Stream` preserves the real
timing and sequence of each one, at the real cost of genuinely more
complex consumption code (`await for`, `.fold`, and more) than a single
`await`.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for this lesson's entire batched file:

```
1: about to await
2: resumed after await with 42
cell 1
cell 2
cell 3
total: 6
```

Real, saved in full in
`src/docs/flutter/verification/lesson-16/run-log.md`.

### Connecting this unit

This unit handled several values arriving over time. The final unit names
the single mechanism underneath everything this lesson has shown.

---

## Concept Unit: One Loop, Deciding What Runs Next

### The Problem

Every real proof in this lesson — `.then` running after already-scheduled
synchronous code (Concept Unit 1), `await` pausing and resuming in order
(Concept Unit 2), a `Stream` producing values one at a time (Concept Unit
3) — is really the same one underlying mechanism, viewed from three
different angles. What is that mechanism, actually?

> **Stop and think before reading on:** If Dart runs on a single thread —
> nothing here happens on a separate, simultaneous thread of execution —
> what has to be true about *how* a `Future`'s callback and an ordinary
> synchronous statement both eventually get their turn to run, given that
> only one of them can ever be running at any single instant?

### Project Change

- **Reference Source:** No reference counterpart — this unit reasons
  about the mechanism underneath the previous three units' own real
  evidence, rather than introducing significant new code.
- **Files affected:** None beyond what earlier units already created.
- **Change type:** N/A — reasoning.
- **Location:** N/A.
- **Dependencies:** Concept Units 1 through 4.

### The New Code

No new code — this unit names the mechanism behind Concept Unit 1's own
real proof, restated: synchronous code (lines `1` and `2`) always finished
before the asynchronous callback (line `3`) ran, even with only a
5-millisecond delay.

### The Updated Project

Not applicable — no new code changes.

### Introduce the concept in isolation

Nothing new to run — this unit's own claim is exactly what Concept Unit
1's real output already proved directly.

### Discarding this example

Nothing to discard — this unit reasons over already-real evidence.

### Mechanical walkthrough

- **The mechanism, named precisely:** Dart's **event loop** (this
  lesson's term) maintains queues of work waiting to run; it processes
  everything already runnable (ordinary synchronous code, already-
  resolved `Future` callbacks) to completion first, and only checks
  whether a pending, not-yet-ready callback (like a timer's) has become
  ready once there's genuinely nothing left in those queues — which is
  exactly why Concept Unit 1's line `2` always ran before line `3`,
  regardless of how short the delay was: the delayed callback couldn't
  even be considered until `main`'s own synchronous body had already
  finished entirely.

### CS lens

A single loop deciding, moment to moment, what runs next based on what's
actually ready, is **event-driven programming** (this lesson's own term)
— the same underlying model, at a larger scale, that every interactive
program this curriculum will eventually build (starting with Phase 3's
own first Flutter app) is built on: a screen tap, a timer firing, and a
network response completing are all, to Dart's own runtime, just three
more things arriving in the exact same event loop this lesson's own small
examples already demonstrated.

```
Also recognized in: JavaScript's own identical single-threaded event
loop (Node.js and every web browser); a single customer-service
representative handling one call at a time, from a shared queue,
regardless of which line rang first; an air traffic controller
processing one radio call at a time from a shared queue of pending
requests
```

### SE lens

Understanding that Dart is genuinely single-threaded — "asynchronous"
here means *reordered*, never *simultaneous* — has a real, practical
consequence this project will rely on repeatedly: two pieces of Dart code
can never run at the exact same instant and corrupt shared state by both
touching it "at once," the way genuinely parallel code on separate
threads could. The real cost of this simplicity: one single, slow,
purely-synchronous piece of code (an enormous loop with no `await` inside
it at all) blocks *everything* else — every pending `Future`, every
`Stream` value, every future UI interaction — until it finishes, since the
event loop has no way to interrupt code that never yields control back to
it.

### Commands needed

None — this unit performs no new run.

### Run it

Not applicable — this unit reasons over Concept Unit 1's own already-real
evidence.

### Connecting this unit

This unit named the one mechanism every earlier unit in this lesson was
really demonstrating from a different angle, closing out Phase 1's own
final lesson.

---

## Connect the Pieces

Trace one Sudoku-flavored idea through everything this lesson built:
loading a saved puzzle from storage before letting a player continue.
Concept Unit 1's `Future<T>` could represent that eventual, not-yet-loaded
puzzle, real-proved to let the rest of a program's own synchronous setup
finish first, regardless of how quick the load turns out to be. Concept
Unit 2's `async`/`await` could write that same loading step to read
top-to-bottom, real-proved identical in behavior to Concept Unit 1's own
callback style, just easier to follow. Concept Unit 3's `Stream` could
instead represent a genuinely ongoing sequence — every move a player
makes during a live session, one at a time, real-proved to arrive and be
processed in the exact order they actually occur, not all bundled
together. And Concept Unit 4 named the one real mechanism — Dart's single
event loop — underneath every one of those three real proofs at once.

Phase 1 is now complete: Lessons 5 through 16 gave this curriculum real,
named values and their real shapes; decisions and repetition; functions,
collections, and this language's own real type system; classes built on
classes; a fixed set of named possibilities; what to do when something
goes wrong; behavior treated as a value; and, finally, work that finishes
later. Every deferred promise this phase carried is paid in full. What
remains is this phase's own milestone: a real, working console Sudoku
engine, built in Dart, with no Flutter at all — the first place this
curriculum's own code needs to survive from one step to the next, rather
than staying disposable.
