# Lesson 10: What the Compiler Actually Knows

**What you will build:** Standalone Dart snippets working with a value
that might be missing, a compiler that gets smarter about a variable
partway through a function, a function written once but usable for many
different types, and, deliberately, one variable that opts *out* of all of
that — proven, with a real crash, to actually cost something. None of
this joins a real project yet. This lesson also pays off a promise Lesson
9 deferred: `List<int>` and `Map<String, int>` both used a generic type
parameter narrowly, without ever explaining what a generic class or
function actually *is*, or how to write your own.

**What you need to know first:** Lesson 5's `int?`, `null`, and sound null
safety — restated here in full, not cited, since this lesson builds
directly on top of it. Lesson 6's `if` and its own comparison operators.
Lesson 9's narrow, undefined use of `<int>`/`<String, int>` as generic
type parameters, and its real, run-verified proof that `dart analyze` and
`dart run` can disagree about whether code is a problem — reused directly
in this lesson's own final unit.

**Terms used in this lesson:**

- **Integer literal** — reappearing from Lesson 5, restated in full: a
  whole number written directly into source code with no decimal point,
  understood by Dart as an `int` value.
- **Assignment (`=`)** — reappearing from Lesson 5, restated in full: the
  operator that stores a value into a variable, whether that variable's
  declared type is `int`, `String`, a nullable type, or, this lesson's
  final term, `dynamic`.
- **Null-coalescing operator (`??`)** — evaluates its left side; if that's
  not `null`, the whole expression is that value; if it *is* `null`, the
  whole expression is instead the right side. It exists as a compact
  alternative to writing a full `if`/`else` (Lesson 6) every time a
  nullable value needs a fallback for the specific case where it turns out
  to be missing.
- **Null assertion operator (`!`)** — placed directly after a nullable
  expression, tells the compiler "trust me, this is not actually `null`
  right now," and lets the rest of the code treat it as the non-nullable
  version of its own type. If that trust turns out to be wrong — the value
  really was `null` — it throws a real runtime error the instant it runs,
  rather than silently continuing. It exists for the rare case where a
  programmer genuinely knows more about a value's real state than the
  compiler's own static analysis can prove on its own.
- **Type promotion** — the compiler's own ability to treat a variable as a
  *narrower*, more specific type than its own declared type, for a
  specific stretch of code where it can prove that narrower type must
  hold — most commonly, treating a nullable variable as its non-nullable
  version inside an `if` block that already checked it isn't `null`. It
  exists so a value already proven not to be `null` doesn't need a second,
  redundant assertion (the previous term, `!`) to actually be used as
  such.
- **Control flow analysis** — the specific technique a compiler uses to
  achieve type promotion: tracing every possible path execution could take
  through a function, and, for each one, working out what must be true
  about a variable's value at that exact point, based on every condition
  already checked along the way to get there. It exists because a
  variable's own declared type is fixed for its entire lifetime, but what
  can be *proven* about its value at one specific line often isn't fixed
  the same way — it depends on which `if`/`else` branches execution
  actually took to reach that line.
- **Generic type parameter (`<T>`)** — reappearing from Lesson 9, given
  its full, general treatment for the first time: a placeholder type name,
  written in angle brackets directly after a function or class name,
  standing for whatever real type a specific call or instance actually
  uses — not fixed once, the way `int` or `String` are, but chosen fresh
  each time the generic function or class is actually used.
- **Generic function** — a function (Lesson 8's term) declared with its
  own generic type parameter, letting the *exact same* function body work
  correctly for more than one concrete type, without being rewritten once
  per type or falling back to `dynamic` (this lesson's own final term)
  and losing static type-checking altogether.
- **Type safety** — reappearing from Lesson 5 and 6, restated in full: the
  guarantee that operations are only ever performed on data of a kind
  they're actually defined for, checked mechanically by the compiler
  rather than trusted to a programmer's memory. This lesson's own final
  unit shows, with a real, deliberately triggered crash, exactly what's
  lost when that guarantee is turned off.
- **Static typing** — reappearing from Lesson 5, restated in full:
  checking that every variable's type is correct while translating the
  program, before it ever runs.
- **Dynamic typing** — reappearing from Lesson 5, restated in full: a
  language design where the same check either happens only once a
  specific line actually executes, or, as this lesson's final unit shows
  for Dart's own opt-out mechanism, doesn't happen at compile time at all.
- **`dynamic`** — a real Dart type that deliberately turns *off* static
  type checking for one specific variable: any operation at all can be
  written against it, and the compiler raises no objection, no matter how
  nonsensical, deferring every check until the exact line actually runs.
  It exists as Dart's own explicit, visible escape hatch out of static
  typing — used rarely, and, as this lesson's own real crash proves, at a
  real cost.

**Objects and methods used:**

- **`int`, `String`**
  - *What they are:* the same real `dart:core` classes Lesson 5
    introduced.
  - *Implementation:* `abstract final class int extends num`; `abstract
    final class String implements Comparable<String>, Pattern` (both
    verified in Lesson 5).
  - *Their use:* this lesson's nullable-type and type-promotion units use
    `int?`/`String?`; its generics unit uses both as the concrete type a
    single generic function is called with, in two separate calls.
  - *Type:* abstract classes (`String`), an abstract class extending
    `num` (`int`).
  - *Responsibility:* unchanged from Lesson 5.
  - *Depends on:* a literal or expression of the matching kind.
  - *Connects to:* combined with `?` (Lesson 5's nullable-type term,
    reappearing) throughout this lesson; substituted in for this lesson's
    own generic function's type parameter.
  - *Shape:* `dart:core` standard-library surface, unchanged from Lesson
    5.
- **`Object.runtimeType`**
  - *What it is:* a real getter defined on `Object` — the one class every
    other class in Dart, including every class this curriculum has used,
    ultimately builds on (Lessons 11 and 12 cover what that actually means
    and costs; this lesson only needs the one getter it provides).
  - *Implementation:* `Type get runtimeType`, returning a real `Type`
    object representing the value's own actual, concrete type at the
    moment it's read — regardless of what static type (or lack of one,
    for `dynamic`) the variable holding it was declared with.
  - *Its use:* this lesson's final unit reads it off a `dynamic` variable
    to prove that variable still holds one real, concrete type
    underneath, even though `dynamic` turns off static checking of what's
    done with it.
  - *Type:* an instance getter, available on every single value in Dart,
    inherited from `Object`.
  - *Responsibility:* report the exact, real, concrete type of whichever
    specific value it's read from.
  - *Depends on:* nothing beyond the value it's read from already
    existing.
  - *Connects to:* read directly off a `dynamic` variable in this
    lesson's final unit, printed by `print`.
  - *Shape:* part of `Object`'s own base contract, inherited by literally
    every value this curriculum has ever printed, not something specific
    to `dynamic`.
- **`NoSuchMethodError`**
  - *What it is:* a real `dart:core` class representing the specific
    runtime failure of calling a method that doesn't actually exist on a
    value's real, concrete type.
  - *Implementation:* thrown automatically by the Dart runtime itself —
    not something this lesson's code constructs directly — whenever a
    method call resolves, at runtime, against a type that has no matching
    method.
  - *Its use:* this lesson's final unit triggers one for real, deliberately,
    by calling a `String`-only method on a value that's actually an `int`,
    through a `dynamic`-typed variable that let the mismatched call
    compile in the first place.
  - *Type:* a class representing one specific real, thrown runtime error.
  - *Responsibility:* carry information about exactly which method was
    called, on what, and why it failed, back to whoever is running the
    program (here, printed directly to the terminal since nothing caught
    it — Lesson 14 covers actually catching an error like this).
  - *Depends on:* a real runtime method-resolution failure to actually be
    thrown.
  - *Connects to:* thrown by the Dart runtime itself; this lesson's own
    real run shows its complete, real, uncaught printed form.
  - *Shape:* a real, standard-library exception type — proof this
    lesson's own crash isn't a vague, unexplained failure, but a genuine,
    named, inspectable object with its own real shape.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type:* a top-level function in `dart:core`.
  - *Responsibility:* convert one value to text and write it, plus a
    newline, to standard output.
  - *Depends on:* one argument.
  - *Connects to:* called throughout this lesson's snippets.
  - *Shape:* `dart:core`'s public standard-library surface, unchanged
    since Lesson 1.

---

## Concept Unit: Working With a Value That Might Be Missing

### The Problem

Lesson 5 proved, with a real compile error, that a plain `int` can never
hold `null`, and that `int?` can. But Lesson 5 stopped there — it never
showed what happens *next*, once you actually have a nullable value and
need to do something useful with it. If a Sudoku game's own saved
high score might not exist yet (a brand-new player), how do you fall back
to a sensible default without writing a full `if`/`else` every single
time?

> **Stop and think before reading on:** Given Lesson 6's `if`/`else`
> already lets you branch on whether a value is `null`, what would a
> single, compact *operator* — rather than a whole `if`/`else` statement —
> need to do to express "use this value, or, if it's missing, use this
> other one instead" in one line?

### Project Change

- **Reference Source:** No reference counterpart — no persisting project
  exists yet.
- **Files affected:** `src/docs/flutter/verification/lesson-10/type_system_demo.dart`
  — created, containing this unit's code; Concept Units 2 and 3 will each
  add their own code to this same file before it's run once, as one real
  batch.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
int? maybeScore;
int score = maybeScore ?? 10;
print(score);

int? definitelyScore = 5;
int forced = definitelyScore!;
print(forced);
```

### The Updated Project

Not applicable — this is the file's brand-new starting content.

### Introduce the concept in isolation

Not run standalone — batched with the rest of this lesson (full output in
Concept Unit 3's own "Run it" step). Real, verified output for this exact
slice:

```
10
5
```

### Discarding this example

`maybeScore` and `definitelyScore`'s own values are disposable. What
carries forward: `??` supplies a fallback for a `null` left side, without
changing anything when the left side already has a real value; `!` forces
a nullable value to be treated as non-nullable, trusting the programmer
over the compiler's own proof.

### Mechanical walkthrough

- **`int? maybeScore;`** — a nullable type (Lesson 5's term, reappearing):
  declared with no initializer, so, per Lesson 5's own real proof, it
  automatically starts as `null`.
- **`int score = maybeScore ?? 10;`** — the null-coalescing operator: since
  `maybeScore` is `null`, the whole expression becomes its right side,
  `10` — an integer literal (Lesson 5's term, reappearing) — which is then
  stored, via assignment (Lesson 5's term, reappearing), into a plain,
  non-nullable `int`.
- **`int? definitelyScore = 5;`** — the same kind of nullable declaration,
  this time given a real value immediately.
- **`int forced = definitelyScore!;`** — the null assertion operator:
  `definitelyScore` genuinely isn't `null` here, so this succeeds,
  producing a plain `int` the compiler will now treat as non-nullable —
  proven safe in this specific case, though nothing stops `!` from being
  written against a value that actually *is* `null`, in which case it
  would throw a real runtime error the moment this exact line ran.

### CS lens

Providing a compact operator for "use this, or a fallback if it's
missing," rather than requiring a full conditional every time, is a
specific application of the same **conditional branching** idea Lesson 6
introduced, narrowed to the one extremely common case of "is this value
present at all."

```
Also recognized in: Kotlin's own `?:` (Elvis operator), JavaScript's
`??`, SQL's `COALESCE()` function, a form's "or leave blank for
default" instruction
```

### SE lens

`!`'s real cost is exactly what its own name in other languages often
signals it as — Kotlin calls its equivalent operator the "not-null
assertion," and its documentation is blunt that overusing it defeats
much of the point of null safety in the first place: every `!` is a
promise the compiler *cannot verify itself*, handed entirely to trust in
the programmer instead. This project will prefer `??` (a real, provided
fallback) or genuine type promotion (this lesson's next unit) wherever
either is possible, reaching for `!` only when a value's non-null state is
truly certain from context the compiler has no way to see — and treating
every `!` in this project's own code, from here on, as worth a second look
during review.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run standalone — per the Verification Rule's Batching clause, this
unit's code is combined with Concept Units 2 and 3's own code into one
file, run once. Complete real output shown in Concept Unit 3's own "Run
it" step, saved in
`src/docs/flutter/verification/lesson-10/run-log.md`.

### Connecting this unit

This unit forced a nullable value's hand, either with a fallback or with
trust. The next unit shows a case where the compiler doesn't need either —
it can prove non-nullability on its own.

---

## Concept Unit: When the Compiler Already Knows

### The Problem

The previous unit's `!` requires trusting the programmer, with no
compiler-verified proof at all. But an ordinary `if (x != null)` check
already *contains* real, verifiable proof that `x` isn't `null` inside its
own block. Does the compiler notice that proof, or does even a plain,
already-null-checked nullable value still need an explicit `!` to be used
afterward?

> **Stop and think before reading on:** Once code is already inside an `if
> (x != null) { ... }` block, is there any real doubt left, at that
> specific point in the program, about whether `x` could be `null`? If the
> compiler could see that same fact, would it still need to be told, a
> second time, that `x` is safe to use as non-nullable?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-10/type_system_demo.dart`
  — modified, appending this unit's function.
- **Change type:** Add (new function in the file created in Concept Unit
  1).
- **Location:** Appended before the previous unit's own code (a top-level
  function declaration, placed above `main`).
- **Dependencies:** The file created in Concept Unit 1.

### The New Code

```dart
int describeLength(String? maybeText) {
  if (maybeText != null) {
    return maybeText.length;
  }
  return -1;
}
```

### The Updated Project

```dart
 1: int describeLength(String? maybeText) {  // ← new
 2:   if (maybeText != null) {                // ← new
 3:     return maybeText.length;              // ← new
 4:   }                                       // ← new
 5:   return -1;                              // ← new
 6: }                                        // ← new
 7:
 8: void main() {
 9:   int? maybeScore;
10:   int score = maybeScore ?? 10;
11:   print(score);
12:
13:   int? definitelyScore = 5;
14:   int forced = definitelyScore!;
15:   print(forced);
16: }
```

### Introduce the concept in isolation

Whether `maybeText.length` genuinely compiles with no `!` at all, inside
the `if` block, is worth real proof rather than assumption — this
function's own real, successful compilation and real output (batched with
this lesson's other units) is that proof:

```
5
-1
```

`describeLength('hello')` returns `5` — `maybeText.length` really did
compile and run, with no `!` anywhere, *inside* the `if` block that had
already proven `maybeText` wasn't `null`. `describeLength(null)` returns
`-1`, taking the fall-through path instead. Had `maybeText.length` been
written *outside* the `if` block, in a spot the compiler cannot prove is
only reached when `maybeText` is non-`null`, it would be rejected exactly
the way Lesson 5's `int cellValue = null;` was rejected — the entire
difference is what the compiler can prove is true at one specific line.

### Discarding this example

`describeLength`'s own text is disposable. What carries forward: an `if
(x != null)` check narrows `x`'s own usable type inside that block, with
no `!` needed — called **type promotion**.

### Mechanical walkthrough

- **`int describeLength(String? maybeText)`** — a function declaration
  (Lesson 8's term, reappearing): `int` as the return type; `String?` as a
  nullable parameter type (Lesson 5's term, reappearing).
- **`if (maybeText != null)`** — Lesson 6's `if` statement, its condition
  the same inequality operator (Lesson 6's term, reappearing) checking
  `maybeText` against `null` (Lesson 5's term, reappearing).
- **`return maybeText.length;`** — the `return` statement (Lesson 8's
  term, reappearing); `maybeText.length` reads `String`'s own real
  `length` getter — legal here, with no `!`, because the compiler has
  already proven, from the enclosing `if`'s own condition, that
  `maybeText` cannot be `null` at this exact point in the code. This is
  **type promotion**: the compiler treating `maybeText` as `String` (not
  `String?`) for the specific stretch of code the `if`'s own condition
  guarantees it.
- **`return -1;`** — reached only when the `if`'s condition was `false`
  (meaning `maybeText` really is `null`); an integer literal, chosen as a
  clearly-invalid "no real length" signal.

### CS lens

Proving a fact about a variable's narrower type at one specific point in a
program, by tracing which conditions were already checked to reach that
point, is **control flow analysis** (this lesson's own term, above) — a
real, general compiler technique, not something specific to null safety;
it's the same category of reasoning that lets a compiler warn about
unreachable code, or prove a variable is used before being given a value.

```
Also recognized in: TypeScript's own type narrowing after an
`instanceof` or `typeof` check, Kotlin's smart casts, a detective
narrowing a list of suspects using only facts already established
earlier in the same case
```

### SE lens

Without type promotion, every single already-null-checked use of a
nullable value would need its own redundant `!` — technically safe (the
check already happened), but a visible, repeated assertion at every use
site instead of once, at the check itself. Type promotion's real value is
letting the *one* place a fact is actually verified (the `if`'s own
condition) be the *only* place that verification has to be stated — every
subsequent use inside that same block gets the benefit for free, with
nothing further to write or maintain.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Not run standalone; full output in Concept Unit 3's own "Run it" step.

### Connecting this unit

This unit let the compiler prove non-nullability on its own, with no
programmer trust required. The next unit turns to a completely different
question this lesson still owes: what does it mean for one function to
work correctly across more than one type?

---

## Concept Unit: One Function, Many Types

### The Problem

Lesson 9 used `List<int>` and `Map<String, int>` without ever explaining
what `<int>` or `<String, int>` actually *is* — a promise explicitly
deferred to here. If a Sudoku engine needed "give me the first item of a
list" for a list of `int`s, and separately for a list of `String`s, would
two nearly-identical functions really be necessary, differing only in
their parameter and return types?

> **Stop and think before reading on:** If one function's own logic
> ("return the item at index `0`") has nothing to do with *which* type
> that item actually is, what do you think should be allowed to vary
> between different calls to it — and what, if anything, should stay
> fixed?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-10/type_system_demo.dart`
  — modified, appending this unit's function.
- **Change type:** Add (new function).
- **Location:** Appended directly after `describeLength`, before `main`.
- **Dependencies:** The file created in Concept Unit 1, extended in
  Concept Unit 2.

### The New Code

```dart
T firstOf<T>(List<T> items) {
  return items[0];
}
```

### The Updated Project

The complete, final file for this lesson's type-system demonstrations
(new lines marked; everything else is exactly what Concept Units 1 and 2
left it as):

```dart
 1: int describeLength(String? maybeText) {
 2:   if (maybeText != null) {
 3:     return maybeText.length;
 4:   }
 5:   return -1;
 6: }
 7:
 8: T firstOf<T>(List<T> items) {   // ← new
 9:   return items[0];              // ← new
10: }                               // ← new
11:
12: void main() {
13:   print(describeLength('hello'));
14:   print(describeLength(null));
15:
16:   int? maybeScore;
17:   int score = maybeScore ?? 10;
18:   print(score);
19:
20:   int? definitelyScore = 5;
21:   int forced = definitelyScore!;
22:   print(forced);
23:
24:   print(firstOf<int>([7, 3, 9]));   // ← new
25:   print(firstOf<String>(['a', 'b'])); // ← new
26: }
```

### Introduce the concept in isolation

Whether the *exact same* function body genuinely works, unmodified, for
two entirely different types is worth real proof, not assumption — batched
with the rest of this lesson:

```
7
a
```

`firstOf<int>([7, 3, 9])` returns `7`; `firstOf<String>(['a', 'b'])`
returns `'a'` — the identical function, `firstOf`, called twice with
`<T>` fixed to two different real types each time, with no second copy of
its own logic written anywhere.

### Discarding this example

`firstOf`'s own two calls are disposable. What carries forward: `<T>`
after a function's name declares a generic type parameter (this lesson's
term, reappearing from Lesson 9, now fully explained); `List<T>` and the
return type `T` both refer to that same placeholder, fixed to whatever
real type a specific call actually supplies.

### Mechanical walkthrough

- **`T firstOf<T>(List<T> items)`** — a function declaration: `<T>`,
  directly after the function's own name, declares a generic type
  parameter — a placeholder standing for whatever real type this function
  is called with; `T` in the return-type position means "whatever `T`
  actually is for this call"; `List<T> items` means the one parameter must
  be a `List` holding elements of that exact same placeholder type — not
  merely "a list of anything," but specifically a list matching whatever
  `T` gets fixed to for this call.
- **`return items[0];`** — the `return` statement, reading the list's
  first element via the index operator (Lesson 9's term, reappearing);
  its real type is `T` — whatever `T` was fixed to for this specific
  call — matching the function's own declared return type exactly.
- **`firstOf<int>([7, 3, 9])`** (call site) — `<int>` explicitly fixes
  `T` to `int` for this one call; `[7, 3, 9]` is a list literal (Lesson
  7's term, reappearing) of `int`s, matching `List<T>`'s own requirement
  once `T` is `int`.
- **`firstOf<String>(['a', 'b'])`** (call site) — the same function,
  `<T>` fixed to `String` instead; `['a', 'b']` is a list literal of
  `String`s.

### CS lens

Writing one piece of logic that works correctly across many types,
without duplicating it per type and without giving up static type
checking (the way `dynamic`, this lesson's final term, would), is
**generic programming** (also called **parametric polymorphism**) — a
foundational idea for building reusable library code, and exactly how
`List<E>`, `Set<E>`, and `Map<K, V>` (Lesson 9) are themselves written,
underneath their own real `dart:core` source.

```
Also recognized in: Java and C#'s own generics, C++ templates,
a vending machine's identical dispensing mechanism working for
any snack that fits the same-shaped slot, a shipping container's
standardized size working for goods of any kind inside it
```

### SE lens

Writing a separate, near-duplicate function per type (`firstOfInts`,
`firstOfStrings`, and so on) works, at the real, compounding cost of every
future bug fix or improvement needing to be applied to every single copy
separately — exactly the same drift risk Lesson 8's own SE lens named for
un-named, duplicated logic. The alternative extreme — a single function
typed to accept and return `dynamic` instead of using a generic type
parameter — would also work for any type, at the real cost this lesson's
final unit demonstrates directly: `dynamic` gives up static checking
entirely, while a generic type parameter keeps it, just deferred until a
specific call site fixes what `T` actually is.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this lesson.

### Run it

Real, verified, complete output for this lesson's entire type-system demo
file:

```
5
-1
10
5
7
a
```

Real, saved in full in
`src/docs/flutter/verification/lesson-10/run-log.md`.

### Connecting this unit

This unit proved one function body can genuinely serve many types, with
static checking intact. The next unit steps back to name the general
principle every prior unit in this curriculum has actually been building
toward.

---

## Concept Unit: What All of This Has Actually Been Protecting

### The Problem

Across ten lessons, this curriculum has repeatedly shown a mistake caught
before the program ever ran: `int wrong = 42.5;` (Lesson 5), `int
cellValue = null;` (Lesson 5), reassigning a `final` variable (Lesson 5),
a required named parameter left out (Lesson 8). What single idea do all of
these specific, previously-separate proofs actually share?

> **Stop and think before reading on:** Looking back at every real,
> run-verified compiler error this curriculum has produced so far, what do
> they all have in common about *when*, relative to the program actually
> running, each mistake was caught?

### Project Change

- **Reference Source:** No reference counterpart — this unit reasons
  about already-shown code from earlier lessons rather than introducing
  new code of its own.
- **Files affected:** None.
- **Change type:** N/A — analysis of already-existing, already-verified
  facts.
- **Location:** N/A.
- **Dependencies:** Every real, run-verified error this curriculum has
  produced through Lesson 9.

### The New Code

No new code — this unit reasons over facts this curriculum already
proved for real:

- Lesson 5: `int wrong = 42.5;` → rejected before running.
- Lesson 5: `int cellValue = null;` → rejected before running.
- Lesson 5: reassigning a `final` variable → rejected before running.
- Lesson 8: a required named parameter left out → rejected before
  running.

### The Updated Project

Not applicable — no code changes; pure reasoning about already-existing,
already-verified evidence.

### Introduce the concept in isolation

Nothing new to run — the evidence is every real error already captured in
earlier lessons' own verification logs, restated here as a single pattern:
every one of them is `dart analyze` (or `dart run`, which performs the
same check before executing anything) refusing to proceed, based purely on
reading the source code — never once by actually running the mistaken
line and observing it misbehave.

### Discarding this example

Nothing to discard — this unit introduces no throwaway code of its own.

### Mechanical walkthrough

- **Every listed mistake, in turn:** each one is a place where a value's
  real, concrete kind (a `double`, `null`, an already-assigned `final`
  variable, a missing argument) conflicts with what the surrounding code's
  own declared types require — and in every single case, that conflict was
  found by *reading* the source, not by *executing* it.
- **The one thing genuinely new here:** naming what all four already have
  in common, rather than treating each as its own isolated, unrelated
  fact.

### CS lens

The umbrella idea underneath every one of those four separate proofs is
**type safety**: a language design where the compiler mechanically
verifies that operations are only performed on data of a kind they're
actually valid for, catching an entire category of mistake at the moment
the source is written, rather than leaving it to be discovered only if
and when a specific buggy line actually executes.

```
Also recognized in: a shipping label's own size/weight restrictions
checked before a package is accepted, not after a truck tries to
carry it; an electrical outlet's own physical shape preventing the
wrong plug from even being inserted; a building code inspected
before a building is occupied, not after it's already in use
```

### SE lens

Type safety's real, honest cost is exactly what this curriculum's own
lessons have shown, over and over: a program has to state its intentions
more explicitly (a type annotation, a `required` keyword, a generic type
parameter) than a language without these checks would demand. The real
benefit, proven by every one of those four real errors, is that an entire
category of mistake simply cannot make it into a running program at all —
not "probably won't," a mechanically-enforced "cannot." This project will
lean on that guarantee increasingly heavily as its own code grows past
what any one person can hold in their head at once — the compiler, not
memory or discipline, is what actually keeps a large, evolving codebase
honest.

### Commands needed

None — this unit performs no new run.

### Run it

Not applicable — this unit reasons over already-real, already-saved
evidence from earlier lessons rather than producing a new run of its own.

### Connecting this unit

This unit named the principle every earlier lesson's own real proofs were
quietly building toward. The final unit shows, directly, what's actually
lost the moment that principle is deliberately switched off.

---

## Concept Unit: What It Costs to Turn This Off

### The Problem

Dart provides an explicit way to opt *out* of everything the previous unit
just named: a type called `dynamic`. If static checking genuinely
prevents real mistakes, what specifically happens once a variable stops
being checked that way — does the mistake simply vanish, or does it just
move somewhere else?

> **Stop and think before reading on:** If a variable's type is `dynamic`,
> and code calls a method on it that doesn't actually exist for whatever
> value it holds, do you think `dart analyze` would catch that the same
> way it caught Lesson 5's `int wrong = 42.5;`? If not — when, if ever,
> would the mistake actually surface?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/docs/flutter/verification/lesson-10/dynamic_risk_demo.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
dynamic value = 5;
print(value.runtimeType);
print(value.substring(1));
```

### The Updated Project

Not applicable — a brand-new, freestanding file.

### Introduce the concept in isolation

This unit's entire point is a claim about hidden, easy-to-get-wrong
behavior — exactly the kind the Verification Rule requires proof for, not
confidence. First, static analysis:

```
Analyzing dynamic_risk_demo.dart...
No issues found!
```

`dart analyze` — the same tool that caught Lesson 5's `int wrong = 42.5;`
instantly — finds *nothing* wrong here, even though `.substring` is a
`String`-only method and `value` actually holds an `int`. Then, actually
running it:

```
int
Unhandled exception:
NoSuchMethodError: Class 'int' has no instance method 'substring'.
Receiver: 5
Tried calling: substring(1)
```

`value.runtimeType` prints `int` — proving `value` really does hold one
real, concrete type underneath, `dynamic` only hides that from the
*compiler*, not from reality. Then the program crashes for real, with a
genuine `NoSuchMethodError` (this lesson's header) and a non-zero exit
code, the instant `.substring(1)` actually runs.

### Discarding this example

`value`'s own mismatched call is disposable. What carries forward:
`dynamic` genuinely disables static checking — proven by `dart analyze`
finding nothing — and the exact mistake that checking would have caught
instead surfaces as a real runtime crash, proven by actually running it.

### Mechanical walkthrough

- **`dynamic value = 5;`** — `dynamic` (this lesson's term): a real type
  that opts this one variable out of static type checking entirely; `5`,
  an integer literal (Lesson 5's term, reappearing), is stored into it,
  same as any other assignment.
- **`value.runtimeType`** — `Object.runtimeType` (this lesson's header),
  read here specifically to prove `value` still holds one real, concrete
  type (`int`) at runtime, regardless of its own declared type being
  `dynamic` rather than `int`.
- **`value.substring(1)`** — a method call (Lesson 9's term, reappearing)
  on `value`; because `value`'s declared type is `dynamic`, the compiler
  makes no attempt at all to check whether `.substring` is even a real
  member of whatever `value` turns out to hold — that check is deferred
  entirely until this exact line actually runs, at which point Dart
  discovers, for real, that `int` has no such method, and throws a real
  `NoSuchMethodError`.

### CS lens

Deferring a type check from compile time to runtime — and, specifically,
discovering at runtime that no matching method exists at all — is exactly
what a genuinely **dynamically-typed** language (this lesson's term,
reappearing from Lesson 5) does for *every* variable, all the time, not
just one explicitly opted-out variable the way Dart's `dynamic` does.

```
Also recognized in: Python and JavaScript's own `AttributeError`/
`TypeError: ... is not a function`, both discovered only once the
offending line actually executes, in a language with no static type
checking to catch it earlier at all
```

### SE lens

`dynamic` is not free — this unit's own real crash is the direct, honest
cost of using it: a mistake that would have been a `dart analyze` error,
caught the moment the file was saved, instead became a production crash,
caught only by whichever real user happened to run this exact code path.
This project will use `dynamic` only in the rare, genuine cases where a
value's type truly cannot be known until runtime (decoding arbitrary JSON,
for instance, a real need this curriculum will meet honestly in Phase 9) —
never as a shortcut to avoid writing out a real type, which is precisely
what erases the guarantee this entire lesson has been building toward.

### Commands needed

- **`dart analyze <file>`** — reappearing from Lesson 5, restated in full:
  statically checks a file for compile-time errors without running it.
- **`dart run <file>`** — reappearing from Lesson 1, restated in full:
  translates and executes a file immediately.

### Run it

Real, verified output, both commands:

```
Analyzing dynamic_risk_demo.dart...
No issues found!
```

```
int
Unhandled exception:
NoSuchMethodError: Class 'int' has no instance method 'substring'.
Receiver: 5
Tried calling: substring(1)
```

Real, saved in full in
`src/docs/flutter/verification/lesson-10/run-log.md`.

### Connecting this unit

This unit proved, with a real crash, exactly what every earlier lesson's
compile-time errors had been quietly preventing all along.

---

## Connect the Pieces

Trace one Sudoku-flavored value through everything this lesson built:
whether a saved high score exists yet for a brand-new player. Concept
Unit 1's `??` could supply a sensible default, `10`, the instant that
score turns out to be `null` — proven for real, not assumed. Its own `!`
could force a value already known to be present, at the real, accepted
cost of trusting the programmer over the compiler. Concept Unit 2 showed
a case needing neither: once code is already inside an `if (score !=
null)` check, the compiler itself proves `score` is safe to use, real-run-
verified with `.length` compiling and running with no `!` in sight.
Concept Unit 3's generic `firstOf<T>` could fetch the first entry of
*any* Sudoku-related list — difficulties, high scores, candidate digits —
from one written function body, proven for real against two genuinely
different types. Concept Unit 4 stepped back and named what every one of
those, and every real error since Lesson 5, actually shared: a mistake
caught by reading source code, never by watching it misbehave. And
Concept Unit 5 proved, with a real, uncaught crash, exactly what
disappears the moment that guarantee is switched off with `dynamic`.

Lesson 9 gave this curriculum its first real generic classes, used but
not explained; this lesson explained them, and everything else Dart's
compiler has quietly been checking since Lesson 5. Lesson 11 turns to a
different kind of structure entirely: not a value or a collection of
them, but a whole new *shape* of data this curriculum defines for itself.
