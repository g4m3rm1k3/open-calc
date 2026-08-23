# Lesson 15: Treating Behavior as a Value

**What you will build:** A function stored directly in a variable, a
function handed into another function as an ordinary argument, a function
*returned* from a function — remembering, correctly, a value that no
longer exists anywhere else once it returns — and a collection that
genuinely refuses to be changed, proven with a real crash rather than
assumed. None of this joins a real project yet. This lesson pays off a
promise Lesson 9 deferred: `(x) => x * x`, used narrowly there just to call
`.map`/`.where`, gets its full treatment here — a function is a value,
exactly like an `int` or a `String`, that can be stored, passed, and
returned like any other.

**What you need to know first:** Lesson 8's real, run-verified
`impureIncrement`/`pureSquare` contrast — restated here in full, not
re-derived. Lesson 5's `final`/`const`. Lesson 9's narrow, unexplained
`(x) => x * x` syntax, and its own real proof that `.map`/`.where` are
lazy — both build directly on this lesson's own subject.

**Terms used in this lesson:**

- **Pure function** — reappearing from Lesson 8, restated in full: a
  function whose result depends only on its own parameters, with no
  reliance on and no change to anything outside itself.
- **Side effect** — reappearing from Lesson 8, restated in full: any
  change a function makes to something outside its own return value.
- **Immutability** — reappearing from Lesson 13 (there applied to a value
  object's own fields), restated in full and widened here to a whole
  collection: a value that, once created, can never be changed again by
  anyone holding a reference to it.
- **`List.unmodifiable`** — a real `dart:core` constructor producing a
  `List` that genuinely refuses every mutating operation — `.add`, and
  others like it — at the moment they're actually called, not merely by
  convention.
- **Function type (`int Function(int)`)** — a type describing not a
  specific function, but the *shape* any function must have to be usable
  wherever this type is expected: here, "takes one `int`, returns one
  `int`." It exists so a variable, parameter, or return type can require
  "some function with this exact shape" without caring which specific
  function it actually is.
- **First-class function** — a function treated as an ordinary value:
  storable in a variable, passable as an argument, returnable from
  another function — exactly like an `int` or a `String`, rather than
  only ever callable by its own fixed name. This lesson's own three units
  each prove one of those three capabilities directly.
- **Higher-order function** — a function that takes another function as a
  parameter, returns one, or both. Lesson 9's `.map`/`.where` were already
  real examples, narrowly explained; this lesson's own `applyTwice` and
  `makeAdder` are this curriculum's first *self-declared* ones.
- **Closure** — a function that captures a variable from the scope it was
  created in, continuing to use that exact captured value even after that
  outer scope has already finished running. It exists so a function
  returned from another function isn't limited to only global data or its
  own parameters — it can carry a piece of the context it was born in
  along with it.

**Objects and methods used:**

- **`List`**
  - *What it is:* the same real, generic `dart:core` class Lesson 9
    introduced.
  - *Implementation:* `abstract interface class List<E> implements
    Iterable<E>, _ListIterable<E>` (verified in Lesson 9); relevant
    member reused here: `void add(E value)`, and a real, separate
    constructor, `List.unmodifiable(Iterable elements)` (this lesson's
    header), producing an implementation that refuses to run `.add` (and
    every other mutating member) at all.
  - *Its use:* Concept Unit 2 builds a genuinely unchangeable list from an
    ordinary one.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 9, except that this lesson's own instance is built through a
    different, non-default constructor producing a deliberately
    restricted implementation.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: A Function That Promises Nothing but Its Own Input

### The Problem

Lesson 8 already proved, with a real, contrasted run, that
`impureIncrement()` produced two different results across two identical
calls, while `pureSquare(4)` produced the same result both times. This
lesson picks that exact distinction back up as its own real subject,
rather than a side note inside a lesson about something else.

> **Stop and think before reading on:** Without looking back at Lesson 8:
> from memory, what made `pureSquare` trustworthy in a way
> `impureIncrement` wasn't? What, specifically, would you need to check
> about *any* function to know which category it falls into?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** None — this unit restates and reasons about Lesson
  8's own already-real, already-saved evidence rather than introducing new
  code.
- **Change type:** N/A — restatement and reasoning.
- **Location:** N/A.
- **Dependencies:** Lesson 8's own `functions_demo.dart` and its real,
  saved run.

### The New Code

No new code — Lesson 8's own real, already-run functions, restated:

```dart
int impureIncrement() {
  callCount += 1;
  return callCount;
}

int pureSquare(int x) {
  return x * x;
}
```

### The Updated Project

Not applicable — no code changes; this unit reasons about already-
existing, already-verified evidence.

### Introduce the concept in isolation

Nothing new to run — Lesson 8's own real, saved output already proved
this:

```
1
2
16
16
```

`impureIncrement()`, called twice, produced `1` then `2` — different
results from identical calls. `pureSquare(4)`, called twice, produced `16`
both times — restated in full here as this lesson's own real evidence,
not a fresh claim.

### Discarding this example

Nothing to discard — this is Lesson 8's own real, permanent evidence,
reused directly.

### Mechanical walkthrough

- **`pureSquare(x)`'s own guarantee, restated precisely:** its result
  depends on nothing but `x`; it reads no variable declared outside
  itself and mutates nothing outside itself — the definition of a **pure
  function** (this lesson's term).
- **`impureIncrement()`'s own violation, restated precisely:** it mutates
  `callCount`, a variable declared outside itself, and its own result
  depends on that same variable's value from before the call — a **side
  effect** (this lesson's term), and a genuine dependency on state outside
  its own parameters.

### CS lens

Restricting a function's own behavior to depend only on its declared
inputs is **referential transparency**: a call to a pure function can
always be replaced by its own result, anywhere in a program, with no
change in what the program does — not true of `impureIncrement()`, whose
result depends on *when* it's called, not just what it's called with.

```
Also recognized in: a mathematical function in the strict sense
(already named in Lesson 8); a spreadsheet formula cell; a hash
function; any operation safe to run twice without changing the
outcome (an "idempotent" operation, a related but distinct idea)
```

### SE lens

A pure function's real, practical benefit — the reason this lesson
returns to it directly rather than treating Lesson 8's own proof as
sufficient — is what it unlocks for *testing* and *reasoning*: calling it
with the same input, in a test, anywhere, at any time, in any order
relative to other tests, always produces the same, checkable result.
`impureIncrement()`-shaped code requires a test to also control or reset
whatever external state it depends on, or risk a test passing or failing
depending on what ran before it — a real, common source of unreliable
("flaky") tests in real codebases, not a hypothetical concern.

### Commands needed

None — this unit performs no new run.

### Run it

Not applicable — this unit reasons over Lesson 8's own already-real,
already-saved evidence.

### Connecting this unit

This unit restated what makes a function trustworthy on its own. The next
unit widens the same idea from a function's own behavior to a whole
piece of data.

---

## Concept Unit: A Collection That Cannot Be Changed

### The Problem

Lesson 13's `final`/`const` already guaranteed a single value, once set,
never changes. A `List` (Lesson 9) is different: `final List<int> digits
= [1, 2, 3];` stops `digits` from being reassigned to a *different* list,
but nothing stops `digits.add(4)` from changing the list it already
points to. Is there a way to make an entire collection itself genuinely
unchangeable, not just the variable pointing at it?

> **Stop and think before reading on:** If a `List`'s own `.add` method
> (Lesson 9) still exists on an "unmodifiable" list — nothing removes it
> from the type — what do you predict happens if code actually calls it:
> does it silently do nothing, silently succeed anyway, or something
> else?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-15/functional_demo.dart`
  — created, containing this unit's list; Concept Units 4 and 5 will add
  their own code to this same file before it's run once, as one real
  batch. `src/docs/flutter/verification/lesson-15/immutable_mutation_check.dart`
  — created, for this unit's own real, deliberate crash.
- **Change type:** Add (new files).
- **Location:** Brand-new files.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
var fixedDigits = List.unmodifiable([1, 2, 3]);
print(fixedDigits);
```

And, separately, a deliberate attempt to mutate it:

```dart
fixedDigits.add(4);
```

### The Updated Project

Not applicable — brand-new, freestanding code in two separate files.

### Introduce the concept in isolation

The working case is confidently predictable (a direct echo of the
elements already on the page); the mutation attempt is exactly the kind
of hidden-behavior claim worth real proof:

```
[1, 2, 3]
```

```
Unhandled exception:
Unsupported operation: Cannot add to an unmodifiable list
#0      UnmodifiableListMixin.add (dart:_internal/list.dart:112:5)
#1      main (...)
```

`.add` genuinely still exists — the call compiles with no static error at
all, the same real method signature every `List` has (Lesson 9) — but
throws a real runtime error, `UnsupportedError`, the instant it's
actually called. This is different from every earlier lesson's own
compile-time-caught mistakes: this immutability is enforced by the
concrete implementation refusing the operation at runtime, not by the
static type system rejecting the call before the program runs.

### Discarding this example

`fixedDigits`'s own three values are disposable. What carries forward:
`List.unmodifiable` produces a real `List` whose mutating methods exist,
compile, and are rejected only once actually called.

### Mechanical walkthrough

- **`List.unmodifiable([1, 2, 3])`** — a real, named constructor on
  `List` (this lesson's header), taking an existing collection of
  elements and producing a new, deliberately restricted `List` holding
  copies of them.
- **`fixedDigits.add(4)`** — `List`'s own real `void add(E value)`
  (Lesson 9's header), called normally; the specific implementation
  `List.unmodifiable` produces overrides this method's own body to throw
  instead of actually appending.

### CS lens

Making a collection's own contents permanently fixed after creation,
rather than only fixing which collection a variable points to, is
**structural immutability** — a stronger, whole-object version of the
single-value immutability Lesson 5's `final` already provided.

```
Also recognized in: a tuple in Python (fixed-size and unchangeable,
unlike a list); a frozen JavaScript object (`Object.freeze`); a
read-only file permission, rejecting a write attempt at the
operating-system level rather than simply not offering a "save"
button
```

### SE lens

An ordinary, mutable `List` handed to another part of a program (or
another function entirely) carries a real, easy-to-miss risk: any code
holding that same reference can change it, and every other holder of that
same reference sees the change immediately, whether that was intended or
not — exactly Lesson 9's own `.sort()` SE lens risk, generalized. An
unmodifiable list removes that risk structurally: a function handed one
can read it freely without any need to defensively copy it first, secure
in the real, run-verified guarantee that nothing else can change it out
from under it.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Real, verified output, both cases:

```
[1, 2, 3]
```

```
Unhandled exception:
Unsupported operation: Cannot add to an unmodifiable list
#0      UnmodifiableListMixin.add (dart:_internal/list.dart:112:5)
#1      main (file:///.../immutable_mutation_check.dart:3:15)
```

Real, saved in full in
`src/docs/flutter/verification/lesson-15/run-log.md`.

### Connecting this unit

This unit made a whole collection genuinely unchangeable. The next unit
returns to side effects directly, asking what immutability actually buys
a program in terms of what *can't* silently happen.

---

## Concept Unit: What Immutability Actually Removes

### The Problem

Lesson 8 defined a side effect as any change a function makes outside its
own return value. The previous unit's `List.unmodifiable` didn't change
any function's own definition at all — it changed the *data*. What's the
actual connection between an immutable value and a function's own purity?

> **Stop and think before reading on:** If every single value a function
> touched were genuinely immutable — no `List`, `Map`, or object it
> receives or creates could ever be mutated by anyone, ever — what entire
> *category* of side effect would become structurally impossible for that
> function to have, even if its author tried?

### Project Change

- **Reference Source:** No reference counterpart — this unit reasons
  about the relationship between Concept Units 1 and 2 rather than
  introducing significant new code of its own.
- **Files affected:** None beyond what Concept Unit 2 already created.
- **Change type:** N/A — reasoning, connecting already-established facts.
- **Location:** N/A.
- **Dependencies:** Concept Units 1 and 2.

### The New Code

No new code — this unit reasons about the previous two units' own
already-real evidence.

### The Updated Project

Not applicable — no new code changes.

### Introduce the concept in isolation

Nothing new to run. The reasoning: a side effect that mutates a shared
`List`, `Map`, or object's own fields is only possible because that data
is mutable in the first place. Concept Unit 2's own real, run-verified
proof — `fixedDigits.add(4)` genuinely crashing rather than silently
succeeding — is direct evidence that an entire category of side effect
(secretly mutating a collection some other part of the program also holds
a reference to) is structurally ruled out once that collection is
genuinely immutable.

### Discarding this example

Nothing to discard — pure reasoning over already-real evidence.

### Mechanical walkthrough

- **The connection, stated precisely:** a side effect that mutates shared
  data requires that data to actually be mutable. `List.unmodifiable`
  doesn't make a *function* pure by itself — a function could still read
  from or write to some *other*, genuinely mutable variable — but it does
  remove one entire, common category of side effect (mutating a
  collection passed in from elsewhere) as a structural impossibility for
  any code holding a reference to it, proven directly by Concept Unit 2's
  own real crash.

### CS lens

Removing entire categories of possible side effects, rather than merely
trusting every function's author to avoid them by discipline, is the same
principle Lesson 5's `final`/`const` already applied to a single value,
generalized to whole collections — a recurring, deliberate design
strategy across this curriculum: make an entire class of mistake
impossible to write, rather than merely inadvisable.

```
Also recognized in: functional programming languages (Haskell, Elm)
that make *all* data immutable by default, eliminating this entire
category of bug language-wide rather than case by case; a legal
contract's own immutable, notarized terms, preventing either party
from silently altering them after signing
```

### SE lens

Code that passes mutable collections freely between functions has a real,
recurring cost: any function receiving one has to either trust every
caller not to mutate it unexpectedly, or defensively copy it first (real,
repeated overhead) just to be safe. Passing immutable data instead
removes that entire tradeoff: no copy is needed, because nothing can
mutate it regardless — proven, not assumed, by this lesson's own real
crash.

### Commands needed

None — this unit performs no new run.

### Run it

Not applicable — pure reasoning over Concept Units 1 and 2's own already-
real evidence.

### Connecting this unit

This unit connected immutability directly to eliminating side effects.
The next unit turns to functions themselves as values — the third
building block this lesson set out to demonstrate.

---

## Concept Unit: A Function Stored, Passed, and Returned

### The Problem

Every function this curriculum has written so far is called only by its
own fixed name (`print(...)`, `addPoints(3, 4)`). Lesson 9's `.map((x) =>
x * x)` handed a small function *into* another function, without ever
explaining that this is legal for exactly the same reason passing an
`int` is: because a function is itself a value.

> **Stop and think before reading on:** If a function is a value like any
> other, what do you predict should be legal that isn't legal for, say, a
> language keyword like `if`: storing it in a variable? Handing it as an
> argument into a completely different function? Having a function
> *return* another function, the way `addPoints` (Lesson 8) returns an
> `int`?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-15/functional_demo.dart`
  — modified, adding this unit's three demonstrations.
- **Change type:** Add (new code in the file created in Concept Unit 2).
- **Location:** Appended before `main`, plus new lines inside `main`.
- **Dependencies:** The file created in Concept Unit 2.

### The New Code

```dart
int applyTwice(int Function(int) fn, int value) {
  return fn(fn(value));
}

int Function(int) makeAdder(int amount) {
  return (x) => x + amount;
}
```

And, in `main`:

```dart
int Function(int) doubler = (x) => x * 2;
print(doubler(5));
print(applyTwice(doubler, 5));

var addThree = makeAdder(3);
var addTen = makeAdder(10);
print(addThree(5));
print(addTen(5));
print(addThree(5));
```

### The Updated Project

```dart
 1: int applyTwice(int Function(int) fn, int value) {   // ← new
 2:   return fn(fn(value));                              // ← new
 3: }                                                    // ← new
 4:
 5: int Function(int) makeAdder(int amount) {             // ← new
 6:   return (x) => x + amount;                           // ← new
 7: }                                                     // ← new
 8:
 9: void main() {
10:   var fixedDigits = List.unmodifiable([1, 2, 3]);
11:   print(fixedDigits);
12:
13:   int Function(int) doubler = (x) => x * 2;           // ← new
14:   print(doubler(5));                                  // ← new
15:   print(applyTwice(doubler, 5));                       // ← new
16:
17:   var addThree = makeAdder(3);                         // ← new
18:   var addTen = makeAdder(10);                           // ← new
19:   print(addThree(5));                                  // ← new
20:   print(addTen(5));                                    // ← new
21:   print(addThree(5));                                  // ← new
22: }
```

### Introduce the concept in isolation

Whether a returned closure genuinely remembers its own distinct captured
value — and isn't shared or overwritten by a second call to the same
factory function — is worth real proof, not assumption. Run for real:

```
10
20
8
15
8
```

`doubler(5)` is `10` — a function, stored in a variable, called normally.
`applyTwice(doubler, 5)` is `20` — `doubler` handed *as a value* into a
different function, which called it twice internally. `addThree(5)` is
`8`, and `addTen(5)` is `15` — two functions, both *returned* from
separate calls to `makeAdder`, each one correctly remembering its own
distinct `amount` (`3` and `10`). Calling `addThree(5)` again, after
`addTen` was created and used, still produces `8` — proving `addThree`'s
own captured `3` was never disturbed by `addTen`'s separate existence.

### Discarding this example

Nothing discarded — real, permanent content, part of this lesson's
complete final file.

### Mechanical walkthrough

- **`int Function(int) doubler = (x) => x * 2;`** — a function type (this
  lesson's term): `int Function(int)` means "takes one `int`, returns one
  `int`"; `(x) => x * 2` is an anonymous function (Lesson 9's term,
  reappearing), assigned directly into a variable exactly the way any
  other value would be.
- **`int applyTwice(int Function(int) fn, int value)`** — a function
  declaration (Lesson 8's term, reappearing) whose own first parameter,
  `fn`, has a function type — this is a **higher-order function** (this
  lesson's term): it takes a function as an ordinary argument.
- **`fn(fn(value))`** — calling `fn` (whichever function was actually
  passed in) twice, feeding its own first result back in as the second
  call's argument.
- **`int Function(int) makeAdder(int amount)`** — a function declaration
  whose own *return type* is a function type — another **higher-order
  function**, this time returning one instead of accepting one.
- **`return (x) => x + amount;`** — the anonymous function returned here
  is a **closure** (this lesson's term): it reads `amount`, a parameter
  belonging to `makeAdder`'s own already-finished call, not to itself —
  and, proven above, correctly keeps using that exact captured value
  every time it's later called, long after `makeAdder` itself has already
  returned.
- **`makeAdder(3)`, `makeAdder(10)`** (at the call sites) — two entirely
  separate calls, each producing its own separate closure with its own
  separate captured `amount` — proven by `addThree` and `addTen`
  producing genuinely different real results for the identical argument
  `5`.

### CS lens

A function capturing and remembering a variable from its own creation
context, even after that context has finished, is a **closure** — one of
the most foundational ideas in functional programming, and the actual
mechanism underneath every callback, every event handler, and, later in
this curriculum, every Flutter widget's own build logic.

```
Also recognized in: JavaScript's own closures (the same idea, same
name); a sealed, addressed envelope carrying a message that still
makes sense to whoever opens it later, regardless of what's happened
back at the sender's own location since; a factory machine
configured once with a specific setting, then producing identically-
configured output repeatedly, without needing to be reconfigured
each time
```

### SE lens

Without first-class functions, `applyTwice`'s own job — "run some
operation twice" — would need a separate, near-duplicate function per
operation (`doublerTwice`, `incrementTwice`, and so on), exactly the same
duplication problem Lesson 10's own generics solved for *types*, here
solved for *behavior* instead. `makeAdder`'s own real value is
configuration: one small function, `makeAdder`, can produce any number of
differently-configured adders, each remembering its own setting
correctly and independently — proven directly by this unit's own real
run, not merely claimed.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for this lesson's entire batched file:

```
[1, 2, 3]
10
20
8
15
8
```

Real, saved in full in
`src/docs/flutter/verification/lesson-15/run-log.md`.

### Connecting this unit

This unit proved a function is a genuine, storable, passable, returnable
value — the promise Lesson 9 deferred, now fully paid. The final unit
asks why any of this — purity, immutability, first-class functions —
actually matters specifically for the kind of software this curriculum is
building toward.

---

## Concept Unit: Why This Matters for a Game

### The Problem

Every idea in this lesson has been demonstrated with small, disposable
examples — none of them a real Sudoku concern yet. Does any of it
actually matter for the game this curriculum is building toward, or is it
abstract theory with no real payoff?

> **Stop and think before reading on:** Phase 2 of this curriculum
> (Lesson 22) is titled "Deterministic puzzle generation" — generating the
> exact same puzzle again from the exact same starting seed. Given this
> lesson's own definition of a pure function, what property would a
> puzzle-generation function specifically need to have for that to even
> be possible? Separately: if a Sudoku game needed an "undo" button,
> what would immutable game states (rather than one mutable board,
> constantly overwritten) let a program do trivially, that a single,
> ever-changing mutable board could not?

### Project Change

- **Reference Source:** No reference counterpart — this unit reasons
  about this lesson's own already-established ideas applied to concrete,
  forward-looking Sudoku scenarios, rather than introducing large new
  code.
- **Files affected:** None.
- **Change type:** N/A — reasoning and forward connection.
- **Location:** N/A.
- **Dependencies:** Every earlier unit in this lesson.

### The New Code

No new code — this unit reasons about applying earlier units' own real
findings to two concrete, named future milestones in this curriculum:
deterministic puzzle generation (Lesson 22) and undo/redo (a natural
extension of Lesson 36's own `GameSession` state, Phase 4).

### The Updated Project

Not applicable — no new code.

### Introduce the concept in isolation

Nothing new to run — the reasoning: a puzzle generator built as a pure
function of its own seed (`Board generate(int seed)`, taking no hidden
input beyond `seed` and mutating nothing outside itself) would, by this
lesson's own Concept Unit 1 definition, produce the exact same board every
single time it's called with the same seed — precisely what "deterministic
puzzle generation" (Lesson 22's own name) actually requires. An impure
generator that instead read, say, the system clock, or mutated some
shared, external "last puzzle" variable, could not offer that guarantee at
all, by the same real distinction Lesson 8's `impureIncrement` already
demonstrated.

For undo: if each game state were an immutable snapshot (Concept Unit 2's
own `List.unmodifiable`, generalized to a whole game state) rather than
one board mutated in place, "undo" becomes trivially keeping a list of
every previous snapshot and stepping back through it — nothing to
carefully reverse, because nothing was ever destructively changed in the
first place. A single, ever-mutated board has no such history at all
once each change overwrites the last.

### Discarding this example

Nothing to discard — this unit's reasoning, not throwaway code, is the
actual content.

### Mechanical walkthrough

- **Deterministic generation, precisely:** a function's own purity
  (Concept Unit 1) is not a nice-to-have here — it is the *literal
  definition* of what "deterministic" means for a generator: same input,
  same output, every time, provably, by the same reasoning Lesson 8
  proved for `pureSquare`.
- **Undo/redo, precisely:** immutability (Concept Unit 2) turns "step
  backward through history" from an operation that has to carefully
  reverse each individual mutation into simply keeping old, already-
  frozen snapshots around and pointing at an earlier one — each old
  snapshot guaranteed, by the same real proof Concept Unit 2 already gave,
  to never have silently changed underneath the program while it wasn't
  looking.

### CS lens

Both of this unit's own examples are specific cases of a much more general
idea: **reasoning locally**. A pure function or an immutable value can be
understood, tested, and trusted entirely on its own — without needing to
trace through the rest of a program to know what else might affect it or
be affected by it.

```
Also recognized in: React's own state-management philosophy
(treating UI state as immutable snapshots, recomputing rather than
mutating); Git's own commit history (each commit an immutable
snapshot, letting you check out any earlier one exactly); a
scientific experiment's own requirement of reproducibility — same
conditions, same result, every time
```

### SE lens

None of this is free: a pure, deterministic generator can't take
shortcuts that depend on hidden state (like reusing a previous run's
partial work); an immutable-snapshot approach to game state uses more
memory than one board mutated in place, since old states genuinely stick
around rather than being overwritten. This project will accept both real
costs deliberately, specifically for the two concrete cases this unit
named — puzzle generation and game-session history — because the real
benefit (reproducible puzzles from a shared seed; free, correct undo) is
worth more, for exactly those two features, than the resource savings a
more careless, mutable, impure approach would offer instead.

### Commands needed

None — this unit performs no new run.

### Run it

Not applicable — pure reasoning applying this lesson's own already-real
findings to two concrete, named future milestones.

### Connecting this unit

This unit closed this lesson by naming exactly where its own ideas will
actually pay off later in this curriculum, rather than leaving them as
abstract theory.

---

## Connect the Pieces

Trace one Sudoku-flavored idea through everything this lesson built.
Concept Unit 1 restated, precisely, what Lesson 8 already proved for
real: a pure function's result depends only on its own input. Concept
Unit 2 proved, with a real crash, that a whole collection can be made
genuinely unchangeable, not merely discouraged from changing. Concept
Unit 3 connected the two directly: immutable data structurally rules out
an entire category of side effect. Concept Unit 4 proved a function is a
real, first-class value — stored in `doubler`, passed into `applyTwice`,
and returned from `makeAdder` as a closure correctly remembering its own
distinct captured value, real-verified against a second, independently-
configured closure. And Concept Unit 5 named exactly where all of this
pays off: a pure puzzle generator is what "deterministic" (Lesson 22's
own name) actually *means*; immutable game snapshots are what makes undo
free rather than painstaking.

Lesson 9 deferred first-class functions to here; they're now fully paid
off, alongside a direct, honest connection to two real features this
curriculum's own Sudoku game will eventually need. Lesson 16 turns to a
kind of "later" this curriculum hasn't touched yet: code that doesn't
finish immediately, closing out this entire phase before its own console
Sudoku engine milestone.
