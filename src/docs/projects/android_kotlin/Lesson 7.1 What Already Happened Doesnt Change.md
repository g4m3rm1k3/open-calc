# Lesson 7.1: What Already Happened Doesn't Change

- **What you will build** — This lesson gives `AndroidCalculator` its
  first real memory of its own past: a new, permanent `Calculation`
  data class recording exactly what one completed calculation was —
  its operator, both operands, and its result — and a new
  `history: List<Calculation>` field on `CalculatorState` that grows,
  safely and immutably, every time `=` successfully produces a real
  answer. The transferable problem underneath both: designing a data
  type that represents a *fact about something that already happened*,
  which must never be allowed to become internally inconsistent or
  silently shared and mutated behind its owner's back — a concern that
  spans an audit log, a financial ledger, a version-control system, or a
  game's own replay history, not just a calculator.
- **What you need to know first** —
  - Lesson 0.8 (A Fixed Set of Choices and a Record of What Happened):
    `data class`, `.copy()`, and the original console calculator's own
    `Calculation` type — including the specific, already-flagged "stale
    result" gap this lesson finally resolves for real.
  - Lesson 3.3 (A Shape the Compiler Won't Let You Forget):
    `CalculatorState` itself, and this project's own discipline of
    representing its state as one immutable value, replaced wholesale
    via `.copy()`, never mutated in place.
  - Lesson 0.4 (Holding Many Values at Once): `List`/`MutableList`,
    reused here to hold a growing collection of `Calculation` records.
  - Lesson 2.5 (A Failure the Compiler Allows): the `try`/`catch`
    domain-error-catching shape `nextState`'s own `"="` branch already
    uses, restructured further in this lesson.

## Terms used in this lesson

- **`data class`** — a class whose compiler-generated members
  (`equals`, `hashCode`, `toString`, `copy`) are derived automatically
  from its own primary-constructor properties; reused here for
  `Calculation`, the same real mechanism already proven for
  `CalculatorState` and the original console calculator's own
  `Calculation` — chosen because every one of `Calculation`'s own real
  fields genuinely participates in what makes two calculations "the
  same," which is exactly the comparison a `data class`'s generated
  `equals` performs automatically.
- **`val`** — declares a read-only property or local binding, assigned
  exactly once; every field this lesson's `Calculation` and
  `CalculatorState` hold is a `val`, never a `var` — nothing in either
  type is ever meant to change after construction.
- **`==` (structural equality)** — calls a `data class`'s own generated
  `equals` method, comparing every real property rather than object
  identity; used in this lesson's own throwaway lab to reveal a real,
  dangerous case where two objects that should be independent are
  reported equal because they secretly share the same underlying list.
- **`if` / `else`** — a conditional branch; this lesson's own restructured
  `"="` branch uses it to decide, up front, whether a real calculation
  can happen at all (a pending operator and a first operand both exist)
  before doing any of the real work that depends on them.
- **`try` / `catch`** — `try` marks a block whose exceptions should be
  caught rather than propagate uncaught; `catch (e: SomeType) { ... }`
  names the exception type to intercept; this lesson's own restructured
  `"="` branch still uses it exactly as it did before, now wrapped
  around a real computation that also needs to build a `Calculation`
  from the same values, not just format a `Display`.
- **Arrange-Act-Assert (`// Arrange` / `// Act` / `// Assert`)** — this
  project's own established test-shape convention, marking, with plain
  comments, the section of a test that builds its starting state, the
  section that performs the real action under test, and the section
  that checks the real result — reused here, unchanged, in this
  lesson's own two new tests, so every test in this file keeps reading
  the same real, predictable way.

## Objects and methods used

- **`Calculation`**
  - What it is: a new, real, permanent `data class` this lesson adds to
    this project — an immutable record of one completed calculation.
  - Implementation: `data class Calculation(val operator: Operator, val operandA: Int, val operandB: Int, val result: Int)`,
    in a new file, `Calculation.kt` — four `val` properties, no methods
    of its own beyond what `data class` generates automatically.
  - Its use: the real, permanent closing of a gap this curriculum's own
    earlier console-calculator work already flagged — a `Calculation`
    type that exists purely to be created once, read, and never
    modified again, closing the
    original "stale result" danger by removing any legitimate reason to
    call `.copy()` on one at all.
  - Type: a `data class`.
  - Responsibility: represents, completely and permanently, one real
    calculation this app actually performed — which operator, which two
    operands, and what real result they produced — with no further
    behavior of its own.
  - Depends on: nothing external; it's a pure, self-contained record.
  - Connects to: constructed inside `nextState`'s own restructured
    `"="` branch, the moment a real calculation succeeds; held inside
    `CalculatorState`'s own new `history` list.
  - Shape: a small, public, immutable value type inside this project's
    own domain layer, alongside `Calculator.kt`'s existing types — no
    Android or Compose dependency of any kind.

- **`.copy()`**
  - What it is: a real, compiler-generated method every `data class`
    automatically receives, producing a new instance with the same
    property values as the original except for whichever named
    parameters are explicitly overridden.
  - Implementation: for a `data class` with properties `p1, p2, ..., pn`,
    the compiler generates `fun copy(p1: T1 = this.p1, ..., pn: Tn = this.pn): ClassName`
    — every parameter defaults to the original object's own current
    value, so only the properties actually named at a call site change.
  - Its use: this lesson's own throwaway lab calls it twice, on two
    different data classes, to reveal two different real dangers —
    `LabCalculation.copy(operandB = 100)` silently produces an
    internally inconsistent record; `LabState.copy()` silently produces
    a second object that still secretly shares its first object's own
    mutable list.
  - Type: a compiler-generated instance method on any `data class`.
  - Responsibility: builds one new, independent object from an existing
    one, changing only the specific properties a caller names.
  - Depends on: an existing `data class` instance to copy from, and,
    optionally, new values for any subset of its properties.
  - Connects to: called inside `nextState`'s own restructured `"="`
    branch (twice — once for a successful calculation, once for a
    failed one), each time producing the real, new `CalculatorState`
    that becomes this app's next real state.
  - Shape: a real, standard, compiler-provided member of every
    `data class` in this project — not something any of this project's
    own code defines or could turn off.

- **`println`**
  - What it is: a real, top-level function in the Kotlin standard
    library, printing a value's string representation to standard
    output, followed by a newline.
  - Implementation: `fun println(message: Any?)`, converting its
    argument via `toString()` and writing it to `System.out`.
  - Its use: this lesson's own throwaway labs use it to make each real,
    computed value — a `Calculation`, a `MutableList`, a `Boolean`, a
    `List` — visible, since these labs exist only to be read and then
    discarded.
  - Type: a top-level (free) function.
  - Responsibility: writes one value's textual representation to the
    console and nothing else.
  - Depends on: one argument (of nearly any type) to print.
  - Connects to: called repeatedly inside both of this lesson's own
    throwaway labs; never appears in this project's own real, permanent
    code, which reports results through function return values and
    test assertions instead.
  - Shape: a small, standard-library utility, used here exclusively for
    temporary, human-facing lab output.

- **`MutableList` / `mutableListOf()`**
  - What it is: a real, standard-library collection type whose contents
    can change after construction — items added, removed, or replaced in
    place — and the real top-level function that constructs one.
  - Implementation: `interface MutableList<E> : List<E>, MutableCollection<E>`,
    adding real, mutating members (`add`, `remove`, `set`, ...) on top
    of everything `List` already provides; `fun <T> mutableListOf(vararg elements: T): MutableList<T>`
    builds a real, growable instance, already used elsewhere in this
    project (`Stack`, `Tokenizer`, `ShuntingYard`) to accumulate results
    one step at a time.
  - Its use: this lesson's own throwaway lab deliberately uses it as the
    *wrong* choice for `CalculatorState`'s own history field, to make
    the real danger of a shared, mutable reference concrete before this
    lesson's real code avoids it.
  - Type: an `interface`, extending `List`, plus a top-level factory
    function.
  - Responsibility: holds an ordered, growable, in-place-editable
    collection of elements, giving up the immutability guarantee plain
    `List` offers in exchange for cheaper, in-place updates.
  - Depends on: nothing to construct one; existing elements to mutate
    afterward.
  - Connects to: held by `LabState` in this lesson's own throwaway lab
    only — never used for `CalculatorState`'s own real `history` field,
    which is deliberately plain `List` instead, for reasons this
    lesson's own second unit proves concretely.
  - Shape: a real, standard-library type, already established elsewhere
    in this project, reused here specifically as a demonstrated
    counterexample.

- **`.add()`**
  - What it is: a real, mutating instance method on `MutableList`,
    appending one new element to the end of the list it's called on.
  - Implementation: `fun add(element: E): Boolean` — mutates the
    receiver in place and returns `true` (per `MutableList`'s own real
    contract, always `true` for a plain `ArrayList`-backed list, since
    it can always grow).
  - Its use: this lesson's own throwaway lab calls it on `stateA.items`
    and, separately, on `stateB.items` — two calls that, because both
    `LabState` instances secretly share the very same real `MutableList`
    object, both end up mutating one single, shared list.
  - Type: an instance method on `MutableList`.
  - Responsibility: grows the list it's called on by exactly one
    element, in place — it does not, and cannot, create a new list.
  - Depends on: an existing `MutableList` instance; the element to
    append.
  - Connects to: called twice in this lesson's own throwaway lab, on
    what looks like two independent lists but is really one shared
    object — the exact real mechanism behind this unit's own central
    finding.
  - Shape: a real, standard-library mutating method, deliberately shown
    here as the source of a real bug, not a recommended pattern for this
    project's own permanent code.

- **`emptyList()`**
  - What it is: a real, top-level function in the Kotlin standard
    library, returning a real, immutable, empty `List`.
  - Implementation: `fun <T> emptyList(): List<T>` — returns a real,
    shared, singleton empty-list instance under the hood, since an empty
    list has no state that could ever differ between two callers.
  - Its use: `CalculatorState`'s own new `history` property defaults to
    it, so every freshly created `CalculatorState` — including the very
    first one this app ever builds — starts with a real, genuinely
    empty history, never `null`.
  - Type: a top-level (free), generic function.
  - Responsibility: produces a real, valid, empty `List` of whatever
    type its caller needs, with no elements and no way to add any
    (since it returns `List`, not `MutableList`).
  - Depends on: nothing; it takes no arguments.
  - Connects to: used once, as `CalculatorState.history`'s own default
    value; this lesson's own throwaway lab also builds one directly
    (`val history: List<Int> = emptyList()`) to prove the growth
    mechanism this unit is actually teaching.
  - Shape: a small, standard-library utility, the immutable counterpart
    to `mutableListOf()`.

- **`List<T>.plus` (the `+` operator)**
  - What it is: a real operator, defined on `List`, that builds and
    returns a brand-new list containing every element of the original
    list plus one more, leaving the original list completely untouched.
  - Implementation: `operator fun <T> List<T>.plus(element: T): List<T>`
    — a real, standard-library extension function, invoked through
    Kotlin's own operator-overloading syntax whenever `+` appears
    between a `List` and a single value; internally, it copies every
    existing element into a new list and appends the new one, rather
    than modifying anything in place.
  - Its use: `nextState`'s own restructured `"="` branch builds the new
    history with `current.history + Calculation(...)` — producing a
    genuinely new `List`, never touching `current.history`'s own
    original contents, keeping `CalculatorState` itself fully immutable
    even though one of its fields is now a growing collection.
  - Type: a real, standard-library `operator fun`, extending `List<T>`.
  - Responsibility: builds and returns one new, independent list; it
    has no side effect on the list it's called on at all.
  - Depends on: an existing `List<T>`; one new element of the same type
    to add.
  - Connects to: called once, inside `nextState`'s own `"="` branch,
    every time a real calculation succeeds; proven, in this lesson's own
    throwaway lab, to leave an original list completely unchanged after
    being used twice in a row to build two further, independent lists.
  - Shape: a small, standard-library operator, the safe, non-mutating
    counterpart to `MutableList.add()`.

- **`CalculatorState`**
  - What it is: this project's own real, permanent, single source of
    truth for everything the calculator screen currently shows — already
    real since this project's own state-consolidation work, now growing
    a fourth real property.
  - Implementation: `data class CalculatorState(val display: Display = Display.Value("0"), val firstOperand: Int? = null, val pendingOperator: Operator? = null, val history: List<Calculation> = emptyList())`
    — the same three original properties, plus a new, fourth one,
    `history`, added at the end with its own default value so every
    existing call site that builds a `CalculatorState` without naming
    `history` explicitly still compiles unchanged.
  - Its use: now the one real object holding both this app's
    in-progress calculation *and* its permanent record of every
    calculation that's already finished — two genuinely different kinds
    of data, deliberately still held in the one object Compose already
    watches for changes.
  - Type: a `data class`.
  - Responsibility: represents the calculator screen's entire real
    state at any one moment — the number currently shown, any pending
    operator and first operand mid-calculation, and now, permanently,
    every calculation this session has already completed.
  - Depends on: nothing to construct a default instance; a `Display`, an
    optional `Int`, an optional `Operator`, and a `List<Calculation>` to
    construct any other one.
  - Connects to: read by `CalculatorScreen` (via `CalculatorViewModel`)
    to render the display; produced, over and over, by `nextState`,
    which is the only real function in this project that ever builds a
    new one.
  - Shape: a public, central data type sitting at the boundary between
    this project's pure domain logic (`nextState`) and its real UI
    layer (`CalculatorScreen`/`CalculatorViewModel`).

### Everything else in the file, not this lesson's subject but still explained

- **`nextState`**
  - What it is: this project's own real, permanent, pure function
    deciding what every button press means — already real since Lesson
    3.3, now restructured inside its own `"="` branch.
  - Implementation: `fun nextState(current: CalculatorState, label: String): CalculatorState`
    — a `when` with branches for a digit, `"C"`, an operator symbol, and
    `"="`; this lesson only changes the body of the `"="` branch.
  - Its use: still the one real function every button press in this
    app's own UI ultimately calls, now additionally responsible for
    deciding when a real `Calculation` record should be added to
    `history`.
  - Type: a top-level (free), pure function — same input always produces
    the same output, no side effects.
  - Responsibility: computes the next real `CalculatorState` from the
    current one and whichever label was just pressed — including,
    starting this lesson, deciding whether the event that just happened
    is worth permanently remembering.
  - Depends on: a `CalculatorState` to start from; a `String` label
    naming which button was pressed; `operatorSymbols`, to resolve an
    operator symbol to a real `Operator`.
  - Connects to: called from `CalculatorViewModel.onButtonClick`, its
    one real caller in this entire project; calls `Calculation`'s own
    constructor and `List.plus` internally, both new to this lesson.
  - Shape: this project's own central, pure, Compose-free domain
    function — unchanged in its own overall shape, restructured only
    inside the one branch this lesson's own real job touches.

---

## Concept Unit: A Record That's Never Copied

### The Problem

This project's own earlier console-calculator work already built a
`Calculation` data class once before — and that same earlier work
already found and flagged a real, honest gap: calling `.copy()` on a
`Calculation` to change one field, like `operandB`, does not recompute
`result`, because a generated `copy()` has no idea the two are related
at all. That gap was left open on purpose back then, since the console
calculator's own `Calculation` was never actually reused for anything
that would call `.copy()` on it. Now Stage 7 gives this project a real
reason to build a `Calculation` type again — a real history feature,
finally — which means this old, deferred gap can't just stay flagged
forever. It has to actually be resolved this time.

> **Stop and think, before reading on:**
> - This project's own earlier console-calculator work already flagged a
>   real gap: calling `.copy()` on a `Calculation`-shaped data class to
>   change one field
>   (like `operandB`) doesn't recompute `result`. Now that this project
>   needs a real `Calculation` type again, for a real history feature —
>   what real rule could you follow when *using* this type, to make sure
>   that gap can never actually cause a wrong record?
> - If a `Calculation`'s own `result` field is only ever correct because
>   it was computed at the exact same moment as `operandA`/`operandB`,
>   what does that suggest about whether this type should ever be
>   modified at all, once it's first created?
> - Given `data class`'s own generated `toString()`, already proven real
>   by this project's own earlier work — what would you predict
>   `LabCalculation("+", 2, 2, 4).copy(operandB = 100)` prints, before
>   running it?

### Introduce the Concept in Isolation

```kotlin
data class LabCalculation(
    val operator: String,
    val operandA: Int,
    val operandB: Int,
    val result: Int
)

fun main() {
    val original = LabCalculation("+", 2, 2, 4)
    println(original)

    val corrupted = original.copy(operandB = 100)
    println(corrupted)
}
```

Real, executed output:

```
LabCalculation(operator=+, operandA=2, operandB=2, result=4)
LabCalculation(operator=+, operandA=2, operandB=100, result=4)
```

This proves the exact real danger this project's own earlier work
already flagged, made concrete: `corrupted` claims, in real, printed
text, that
`"+", 2, 100` produces `4` — a real, internally inconsistent record,
since `2 + 100` is genuinely `102`, not `4`. `.copy()` itself did nothing
wrong — it did exactly what it always does, building a new object with
`operandB` replaced and every other field, including `result`, carried
over unchanged from the original. The real problem is that `result`
was never an independent fact about this object; it's a value that's
only correct because it was computed *at the same moment* as the two
operands it depends on. This is called a **derived value trapped inside
an immutable record** — and the real fix isn't a smarter `copy()`, it's
a rule about how this type gets *used*: a `Calculation` should be
created exactly once, fully formed, and never copied or modified again.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: `.copy()` on a
`Calculation`-shaped type is a real, standing danger the moment any of
its fields depend on the others, and the correct response is a
discipline (never call it), not a code change.

### Project Change

- **Reference Source**: no reference counterpart — this is a
  from-scratch addition. `brd.md`'s own BRD entry for this lesson names
  only "Data Modeling — Create `Calculation`," with no reference
  implementation to build toward; the design (four `val` properties, no
  methods) follows
  this project's own established `data class` pattern, already proven
  for `CalculatorState`.
- **Files affected**: created
  `app/src/main/java/com/example/calculator/Calculation.kt`.
- **Change type**: add (a brand-new file).
- **Location**: n/a — a brand-new file, with nothing existing yet to
  locate a position within.
- **Dependencies**: `Operator`, this project's own real, existing enum
  (`Calculator.kt`), needed as the type of `Calculation`'s own
  `operator` property.

### The New Code

```kotlin
data class Calculation(
    val operator: Operator,
    val operandA: Int,
    val operandB: Int,
    val result: Int
)
```

### The Updated Project

Since `Calculation.kt` is a brand-new file, the code above *is* the
whole file so far — shown here in full, with its own `package`
declaration:

```kotlin
package com.example.calculator

data class Calculation(
    val operator: Operator,
    val operandA: Int,
    val operandB: Int,
    val result: Int
)
```

This file now holds this project's own real, permanent record type —
ready to be constructed the moment a real calculation succeeds, with no
Android or Compose dependency of any kind, and, per this unit's own
central finding, no legitimate reason for any real code in this project
to ever call `.copy()` on one.

### Mechanical Walkthrough

- `package com.example.calculator` — declares this file's own namespace,
  the same one every other real file in this project already shares, so
  `Calculator.kt` and every other file here can reference `Calculation`
  by its bare name, with no import required between them.
- `data class Calculation(...)` — declares a new, real, named type,
  using the same `data class` mechanism already proven for
  `CalculatorState`: the compiler automatically generates real
  `equals`, `hashCode`, `toString`, and `copy` members from the four
  properties listed, with no manual implementation needed for any of
  them.
  - `val operator: Operator` — the real `Operator` enum constant (already
    established, `Calculator.kt`) this calculation used — `PLUS`,
    `MINUS`, `TIMES`, `DIVIDE`, or `MODULO`.
  - `val operandA: Int` — the real first operand this calculation was
    performed on, captured as a plain `Int`, the same type this project's
    own arithmetic has used since Stage 0.
  - `val operandB: Int` — the real second operand.
  - `val result: Int` — the real, already-computed answer — present here
    specifically so it never has to be recomputed from the other three
    fields later, and, per this unit's own central finding, never
    updated independently of them either.

### CS Lens

Distinguishing **mutable state** (what's true *right now*, replaced
wholesale as things change — `CalculatorState` itself) from an
**immutable historical record** (a fact about something that already
happened, permanent the instant it's created) is a real, recognized
software design idea, not unique to this project:

```
Also recognized in: event-sourcing systems, where an event log is
append-only and a past event is never edited, only ever superseded by a
new one; a version-control system's own commits, where a past commit's
content never changes — a correction becomes a brand-new commit
instead; financial accounting, where a posted ledger entry is never
edited directly, only reversed by a new, offsetting entry; an audit
log, whose entire value depends on old entries staying exactly as they
were recorded.
```

### SE Lens

Why build a dedicated `Calculation` type at all, instead of just storing
a list of past `CalculatorState` snapshots? A real alternative was
considered: `CalculatorState` already exists, already holds a `display`
and the operands involved — reusing it for history would mean no new
type at all. This project doesn't do that — `CalculatorState` also
carries fields that only make sense mid-calculation (`firstOperand`,
`pendingOperator`), which a permanent history entry has no use for once
a calculation is finished; a dedicated, minimal `Calculation` keeps each
historical record exactly as large as the real fact it represents, with
nothing transient riding along. The real, honest cost: this project now
has two separate types that both describe "a calculation" in some
sense — `CalculatorState` for what's happening *now*, `Calculation` for
what already happened — and any future change to how this app performs
arithmetic has to be checked against both.

### Commands Needed

- `kotlinc lab1_calculation_copy.kt -include-runtime -d lab1.jar` —
  invokes the real Kotlin compiler on this lab's own single file,
  `-include-runtime` bundles the Kotlin standard library into the
  output so the result can run standalone, `-d lab1.jar` names the real
  compiled output file. Success produces no output at all.
- `java -jar lab1.jar` — runs the real, compiled program directly with
  the JVM, printing this lab's own real output to the terminal.

### Run It

Already shown above, under "Introduce the Concept in Isolation" — the
real, executed output was:

```
LabCalculation(operator=+, operandA=2, operandB=2, result=4)
LabCalculation(operator=+, operandA=2, operandB=100, result=4)
```

### Connect the Pieces

`Calculation` is now real and permanent — but on its own, sitting in a
brand-new file with nothing constructing one yet, it can't actually
record anything. The next unit gives it a real place to live,
`CalculatorState`'s own new `history` field, and a real, safe way for
that history to grow one calculation at a time.

---

## Concept Unit: Growing a List Without Touching It

### The Problem

`CalculatorState` needs a new way to hold a *growing* collection of
`Calculation` records — every calculation this session performs,
accumulating one after another. This project already has a real,
proven tool for exactly this shape of job: `MutableList`, already used
inside `Stack`, `Tokenizer`, and `ShuntingYard` to build up a result one
step at a time. But `CalculatorState` itself has followed one strict
rule since it was first introduced: it's a fully immutable value,
replaced wholesale via `.copy()` on every real change, never mutated in
place — and this project's own real Compose UI, wired up in its own
ViewModel work, depends on that immutability to correctly detect when
the screen actually needs to
redraw. The real question this unit has to answer: does reaching for
`MutableList` here — the obvious, already-familiar tool — actually
break that guarantee?

> **Stop and think, before reading on:**
> - If two `CalculatorState` objects are built by calling `.copy()` on
>   the same original, and one of them holds a `MutableList`, what do
>   you think happens if code adds an item to *one* of those two
>   states' own list — does it also affect the other?
> - This project's own `map`/`filter` functions already proved that some
>   list operations return a brand-new list without touching the
>   original at all. Given that, what would you guess the `+` operator
>   does when used between a `List` and one new element?
> - This project's own real Compose UI relies on detecting when
>   `CalculatorState` has genuinely changed, to decide whether to
>   redraw. If `history` were a `MutableList` that got silently mutated
>   in place rather than replaced, what real problem might that cause
>   for that detection?

### Introduce the Concept in Isolation

```kotlin
data class LabState(val items: MutableList<Int> = mutableListOf())

fun main() {
    val stateA = LabState()
    stateA.items.add(1)
    val stateB = stateA.copy()
    stateB.items.add(2)
    println(stateA.items)
    println(stateB.items)
    println(stateA == stateB)

    val history: List<Int> = emptyList()
    val updatedHistory = history + 1
    val furtherUpdatedHistory = updatedHistory + 2
    println(history)
    println(updatedHistory)
    println(furtherUpdatedHistory)
}
```

Real, executed output:

```
[1, 2]
[1, 2]
true
[]
[1]
[1, 2]
```

This proves the real danger a `MutableList` field creates: `stateB`
was built from `stateA.copy()`, which should mean two genuinely
independent objects — but `stateB.items.add(2)` also changed
`stateA.items`, because `.copy()` only copies the *reference* to the
same underlying `MutableList`, never the list's own contents. Both
states end up showing `[1, 2]`, and `stateA == stateB` prints `true` —
two objects that were supposed to represent two different moments in
time, now reported as identical. The second half proves the real fix:
`history + 1` and `updatedHistory + 2` each build a genuinely new,
independent `List`, and the *original* `history` — printed last, but
built first — still shows `[]`, completely untouched by either
operation. This is called an **immutable, persistent collection
update** — "persistent" meaning old versions stay valid and unchanged
even after a new version exists, not that it's saved to disk.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: a `MutableList` field
inside an otherwise-immutable `data class` silently breaks that
immutability, and `List`'s own `+` operator is the real, safe
alternative.

### Project Change

- **Reference Source**: no reference counterpart — this is a
  from-scratch addition, for the same reason the unit above gave.
- **Files affected**: modified
  `app/src/main/java/com/example/calculator/Calculator.kt`; modified
  `app/src/test/java/com/example/calculator/CalculatorStateTest.kt`.
- **Change type**: add (a new field on `CalculatorState`) and refactor
  (`nextState`'s own `"="` branch, restructured to build a real
  `Calculation` alongside its existing display/error logic).
- **Location**: in `Calculator.kt`, `history` is added as
  `CalculatorState`'s own fourth constructor property; `nextState`'s
  `"="` branch is rewritten in place, immediately below its own already
  -existing `val operator = current.pendingOperator` /
  `val first = current.firstOperand` lines. In
  `CalculatorStateTest.kt`, one existing test's own expected value is
  corrected, and two new tests are added immediately after it.
- **Dependencies**: `Calculation`, from the unit above; `List.plus`,
  the Kotlin standard library's own `+` operator on `List`, no new
  Gradle dependency needed.

### The New Code

`CalculatorState` gains one new property:

```kotlin
val history: List<Calculation> = emptyList()
```

`nextState`'s own `"="` branch is rewritten, starting immediately after
its existing `val operator`/`val first` lines:

```kotlin
if (operator != null && first != null) {
    val second = current.display.textOrZero().toInt()
    try {
        val result = operator.operation.apply(first, second)
        current.copy(
            display = Display.Value(result.toString()),
            firstOperand = null,
            pendingOperator = null,
            history = current.history + Calculation(operator, first, second, result)
        )
    } catch (invalidOperation: ArithmeticException) {
        current.copy(display = Display.Error, firstOperand = null, pendingOperator = null)
    }
} else {
    current
}
```

This same unit also updates and adds real, permanent tests, proving
history accumulates correctly and a failed calculation never pollutes
it:

```kotlin
@Test
fun pressingFiveDivideZeroEqualsDoesNotRecordAFailedCalculation() {
    // Arrange
    var state = CalculatorState()

    // Act
    state = nextState(state, "5")
    state = nextState(state, "÷")
    state = nextState(state, "0")
    state = nextState(state, "=")

    // Assert
    assertEquals(emptyList<Calculation>(), state.history)
}

@Test
fun chainedCalculationsAccumulateInHistoryInOrder() {
    // Arrange
    var state = CalculatorState()

    // Act
    state = nextState(state, "7")
    state = nextState(state, "+")
    state = nextState(state, "3")
    state = nextState(state, "=")
    state = nextState(state, "+")
    state = nextState(state, "5")
    state = nextState(state, "=")

    // Assert
    assertEquals(
        listOf(
            Calculation(Operator.PLUS, 7, 3, 10),
            Calculation(Operator.PLUS, 10, 5, 15)
        ),
        state.history
    )
}
```

### The Updated Project

`CalculatorState`, in full, numbered, with its new property marked:

```kotlin
1: data class CalculatorState(
2:     val display: Display = Display.Value("0"),
3:     val firstOperand: Int? = null,
4:     val pendingOperator: Operator? = null,
5:     val history: List<Calculation> = emptyList()  // ← new
6: )
```

`nextState`, in full, numbered, with this unit's new and changed lines
marked:

```kotlin
 1: fun nextState(current: CalculatorState, label: String): CalculatorState {
 2:     return when {
 3:         label[0].isDigit() -> {
 4:             val currentText = current.display.textOrZero()
 5:             val newText = if (currentText == "0") label else currentText + label
 6:             current.copy(display = Display.Value(newText))
 7:         }
 8:         label == "C" -> current.copy(display = Display.Value("0"))
 9:         label in operatorSymbols -> current.copy(
10:             firstOperand = current.display.textOrZero().toInt(),
11:             pendingOperator = operatorSymbols[label],
12:             display = Display.Value("0")
13:         )
14:         label == "=" -> {
15:             val operator = current.pendingOperator
16:             val first = current.firstOperand
17:             if (operator != null && first != null) {                                        // ← new
18:                 val second = current.display.textOrZero().toInt()                            // ← new
19:                 try {                                                                          // ← new
20:                     val result = operator.operation.apply(first, second)                      // ← new
21:                     current.copy(                                                              // ← new
22:                         display = Display.Value(result.toString()),                            // ← new
23:                         firstOperand = null,                                                   // ← new
24:                         pendingOperator = null,                                                // ← new
25:                         history = current.history + Calculation(operator, first, second, result) // ← new
26:                     )                                                                           // ← new
27:                 } catch (invalidOperation: ArithmeticException) {                              // ← new
28:                     current.copy(display = Display.Error, firstOperand = null, pendingOperator = null) // ← new
29:                 }                                                                               // ← new
30:             } else {                                                                            // ← new
31:                 current                                                                         // ← new
32:             }                                                                                    // ← new
33:         }
34:         else -> current
35:     }
36: }
```

`nextState`'s own overall job hasn't changed — it's still the one real
function deciding what every button press means — but its `"="` branch
now does two real things at once on success: it still formats the real
result for display, and it now also builds a permanent `Calculation`
record and appends it to `history`, all inside the same `copy()` call
that produces the next real state.

`CalculatorStateTest.kt`, in full, numbered, with the corrected and new
tests marked:

```kotlin
  1: package com.example.calculator
  2:
  3: import org.junit.Assert.assertEquals
  4: import org.junit.Test
  5:
  6: class CalculatorStateTest {
  7:
  8:     @Test
  9:     fun pressingDigitFromInitialStateReplacesLeadingZero() {
 10:         // Arrange
 11:         val state = CalculatorState()
 12:
 13:         // Act
 14:         val result = nextState(state, "7")
 15:
 16:         // Assert
 17:         assertEquals(CalculatorState(display = Display.Value("7")), result)
 18:     }
 19:
 20:     @Test
 21:     fun pressingSevenPlusThreeEqualsProducesTen() {
 22:         // Arrange
 23:         var state = CalculatorState()
 24:
 25:         // Act
 26:         state = nextState(state, "7")
 27:         state = nextState(state, "+")
 28:         state = nextState(state, "3")
 29:         state = nextState(state, "=")
 30:
 31:         // Assert
 32:         assertEquals(  // ← changed
 33:             CalculatorState(  // ← changed
 34:                 display = Display.Value("10"),  // ← changed
 35:                 history = listOf(Calculation(Operator.PLUS, 7, 3, 10))  // ← changed
 36:             ),  // ← changed
 37:             state  // ← changed
 38:         )  // ← changed
 39:     }
 40:
 41:     @Test  // ← new
 42:     fun pressingFiveDivideZeroEqualsDoesNotRecordAFailedCalculation() {  // ← new
 43:         // Arrange  // ← new
 44:         var state = CalculatorState()  // ← new
 45:
 46:         // Act  // ← new
 47:         state = nextState(state, "5")  // ← new
 48:         state = nextState(state, "÷")  // ← new
 49:         state = nextState(state, "0")  // ← new
 50:         state = nextState(state, "=")  // ← new
 51:
 52:         // Assert  // ← new
 53:         assertEquals(emptyList<Calculation>(), state.history)  // ← new
 54:     }
 55:
 56:     @Test  // ← new
 57:     fun chainedCalculationsAccumulateInHistoryInOrder() {  // ← new
 58:         // Arrange  // ← new
 59:         var state = CalculatorState()  // ← new
 60:
 61:         // Act  // ← new
 62:         state = nextState(state, "7")  // ← new
 63:         state = nextState(state, "+")  // ← new
 64:         state = nextState(state, "3")  // ← new
 65:         state = nextState(state, "=")  // ← new
 66:         state = nextState(state, "+")  // ← new
 67:         state = nextState(state, "5")  // ← new
 68:         state = nextState(state, "=")  // ← new
 69:
 70:         // Assert  // ← new
 71:         assertEquals(  // ← new
 72:             listOf(  // ← new
 73:                 Calculation(Operator.PLUS, 7, 3, 10),  // ← new
 74:                 Calculation(Operator.PLUS, 10, 5, 15)  // ← new
 75:             ),  // ← new
 76:             state.history  // ← new
 77:         )  // ← new
 78:     }
 79:
 80:     @Test
 81:     fun pressingFiveDivideZeroEqualsProducesError() {
 82:         // Arrange
 83:         var state = CalculatorState()
 84:
 85:         // Act
 86:         state = nextState(state, "5")
 87:         state = nextState(state, "÷")
 88:         state = nextState(state, "0")
 89:         state = nextState(state, "=")
 90:
 91:         // Assert
 92:         assertEquals(CalculatorState(display = Display.Error), state)
 93:     }
 94:
 95:     @Test
 96:     fun pressingOperatorAfterErrorStartsFreshInsteadOfCrashing() {
 97:         // Arrange
 98:         var state = CalculatorState()
 99:         state = nextState(state, "5")
100:         state = nextState(state, "÷")
101:         state = nextState(state, "0")
102:         state = nextState(state, "=")
103:
104:         // Act
105:         state = nextState(state, "+")
106:
107:         // Assert
108:         assertEquals(
109:             CalculatorState(display = Display.Value("0"), firstOperand = 0, pendingOperator = Operator.PLUS),
110:             state
111:         )
112:     }
113: }
```

`pressingSevenPlusThreeEqualsProducesTen` already existed before this
lesson — it's corrected here, not newly added, because `history`'s own
default value (`emptyList()`) no longer matches this test's own real
result the moment a real calculation actually succeeds; without this
fix, this exact, already-shipped test would now fail for real. Every
other test in the file — `pressingDigitFromInitialStateReplacesLeadingZero`,
`pressingFiveDivideZeroEqualsProducesError`,
`pressingOperatorAfterErrorStartsFreshInsteadOfCrashing` — is shown here
unchanged, real, and still passing, none of them touched by this
lesson's own real work.

### Mechanical Walkthrough

- `val history: List<Calculation> = emptyList()` (`CalculatorState`,
  line 5) — a fourth real constructor property, typed `List<Calculation>`
  (never `MutableList`, per this unit's own central finding), defaulting
  to `emptyList()` so every `CalculatorState` this project has ever
  built without naming `history` explicitly — including every one of
  this project's own already-existing tests — still compiles and starts
  with a real, empty, non-`null` history.
- `if (operator != null && first != null)` (`nextState`, line 17) — the
  same real null-check this branch always had, now written as a
  standalone `if`/`else` instead of feeding an intermediate
  `newDisplay` variable, since this branch now needs to build a whole
  new `CalculatorState` — not just one `Display` value — on the success
  path.
- `val second = current.display.textOrZero().toInt()` (line 18) — reads
  the real second operand once, into its own named value, instead of
  computing it inline as part of a single expression the way the
  original code did — needed because this same real value is now used
  twice: once inside `operator.operation.apply(...)`, and again inside
  the new `Calculation(...)` call.
- `val result = operator.operation.apply(first, second)` (line 20) —
  calls this project's own already-established `Operation.apply`
  (`Calculator.kt`) directly, capturing its real, raw `Int` result in
  its own named value — needed because this same real value is now used
  twice: once to build the displayed string, once to build the real
  `Calculation` record.
- `current.copy(display = Display.Value(result.toString()), firstOperand = null, pendingOperator = null, history = current.history + Calculation(operator, first, second, result))`
  (lines 21–26) — one real `copy()` call, on the calculator's own
  current state, replacing four properties at once: `display` becomes
  the real result formatted as text; `firstOperand`/`pendingOperator`
  are cleared, exactly as before; and, new this lesson, `history`
  becomes `current.history + Calculation(...)` — the real, immutable
  `+` operator this unit's own lab already proved, building a brand-new
  list holding every prior calculation plus this one, real, freshly
  constructed `Calculation`.
- `catch (invalidOperation: ArithmeticException) { current.copy(display = Display.Error, firstOperand = null, pendingOperator = null) }`
  (lines 27–28) — the same real catch this branch always had, still
  clearing `firstOperand`/`pendingOperator`, still showing
  `Display.Error` — deliberately *not* passed a `history` argument at
  all, so `.copy()`'s own default (`current.history`, unchanged)
  applies: a failed calculation adds nothing to history.
- `else -> current` (lines 30–31) — when there's no real pending
  operator or first operand at all, this branch now simply returns
  `current` unchanged, the same real, no-op effect the original code's
  own `newDisplay = current.display` produced, written more directly
  now that there's no shared `newDisplay` variable left to reuse.
- `// Arrange` / `// Act` / `// Assert` (both new test functions) — this
  project's own already-established Arrange-Act-Assert convention,
  marking which section of each new test builds its starting
  `CalculatorState`, which section drives it through a real sequence of
  button presses, and which section checks the real, resulting
  `history` — the identical shape every other test in this file already
  follows.

### CS Lens

**Persistent (immutable) data structures** — a collection type where an
"update" always produces a new version while every old version stays
valid and unchanged — is a real, recognized computer science idea:

```
Also recognized in: Git's own object model, where a commit never
modifies an existing tree or blob, only creates new ones; functional
programming languages whose default collections (Clojure's, Haskell's)
are immutable by design; React's and Jetpack Compose's own reliance on
structural immutability to detect real state changes cheaply, exactly
the mechanism this unit's own real code depends on; a version-controlled
document system keeping every past revision addressable, never
overwritten by a later edit.
```

### SE Lens

Why `List<Calculation>` plus the `+` operator, instead of the more
familiar `MutableList<Calculation>` plus `.add()`? A real alternative
was seriously available: `MutableList`/`.add()` is simpler, more
familiar, and avoids allocating a brand-new list every single time `=`
succeeds — a real, if tiny, memory cost this project's own chosen
design does pay. This project chooses the immutable approach anyway,
because `CalculatorState` is a `data class` whose own correctness — and
Compose's own change-detection machinery, wired up in this project's
own ViewModel work — depends on every one of its fields staying
genuinely, structurally
immutable; this unit's own lab proved, concretely, that a `MutableList`
field silently breaks that guarantee, letting two supposedly
independent states secretly share and corrupt each other's data. The
real, accepted cost: a new `List` object is allocated on every single
`=` press — genuinely wasteful at a large enough scale, but a real,
honest, acceptable tradeoff at the scale a single user's own calculation
history will ever actually reach.

### Commands Needed

- `kotlinc lab1_calculation_copy.kt lab2_immutable_growth.kt -include-runtime -d labs.jar`
  — compiles both of this lesson's own throwaway labs together in one
  real, batched pass, per the Verification Rule's own batching
  requirement — safe here since the two labs share no top-level names.
- `java -cp labs.jar Lab2_immutable_growthKt` — runs this unit's own
  specific lab directly from the shared, compiled `.jar`, naming its
  real, compiler-generated entry-point class explicitly.
- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.CalculatorStateTest"`
  — runs this project's real Gradle wrapper, scoped to only
  `CalculatorStateTest`, confirming this unit's own real changes —
  the corrected test and the two new ones — compile and pass on their
  own.

### Run It

Real, executed lab output, already shown above:

```
[1, 2]
[1, 2]
true
[]
[1]
[1, 2]
```

Real, executed test-report output (this session):

```
<testsuite name="com.example.calculator.CalculatorStateTest" tests="6" skipped="0" failures="0" errors="0" timestamp="2026-08-22T19:26:46" hostname="Michaels-Mac-mini.local" time="0.013">
  <testcase name="pressingFiveDivideZeroEqualsDoesNotRecordAFailedCalculation" classname="com.example.calculator.CalculatorStateTest" time="0.005"/>
  <testcase name="chainedCalculationsAccumulateInHistoryInOrder" classname="com.example.calculator.CalculatorStateTest" time="0.008"/>
  <testcase name="pressingSevenPlusThreeEqualsProducesTen" classname="com.example.calculator.CalculatorStateTest" time="0.0"/>
  <testcase name="pressingDigitFromInitialStateReplacesLeadingZero" classname="com.example.calculator.CalculatorStateTest" time="0.0"/>
  <testcase name="pressingOperatorAfterErrorStartsFreshInsteadOfCrashing" classname="com.example.calculator.CalculatorStateTest" time="0.0"/>
  <testcase name="pressingFiveDivideZeroEqualsProducesError" classname="com.example.calculator.CalculatorStateTest" time="0.0"/>
</testsuite>
```

All six real tests pass, including the corrected
`pressingSevenPlusThreeEqualsProducesTen` and both of this unit's own
new tests — real, confirmed proof that a successful calculation is
recorded, a failed one is not, and chained calculations accumulate in
the correct, real order.

### Connect the Pieces

The unit above gave this project a real, permanent `Calculation` type
with one strict rule: create it once, never copy it. This unit gives it
a real, permanent home — `CalculatorState.history` — and a real,
provably safe way to grow that home one calculation at a time, using
the exact same immutability discipline `CalculatorState` itself has
followed since it was first introduced, now proven to extend correctly
to a growing collection, not just a handful of scalar fields.

---

## Connect the pieces

Trace one real calculation, `7 + 3 =`, followed immediately by a second,
chained one, `+ 5 =`, all the way through both of this lesson's own
units. Before either unit's own code exists, `nextState` already
computes the right numeric answers — `10`, then `15` — but has no way to
remember either fact happened at all once the display moves on. The
first unit's own real, permanent `Calculation` type gives this project
the *shape* of a memory: `operator`, `operandA`, `operandB`, `result`,
four fields, fixed forever the instant one is built, with this unit's
own lab standing as real, executed proof that calling `.copy()` on one
would silently corrupt it. The second unit gives that shape a real place
to accumulate: `nextState`'s own restructured `"="` branch now builds a
real `Calculation(Operator.PLUS, 7, 3, 10)` the moment the first `=` in
this sequence succeeds, and appends it to `CalculatorState.history` via
the real, non-mutating `+` operator this unit's own lab already proved
leaves every earlier version of that list completely untouched. When the
second `=` succeeds, `Calculation(Operator.PLUS, 10, 5, 15)` is built the
same way and appended the same way — and because `+` never mutates
anything, the very `CalculatorState` object holding the first
calculation's own history is never at risk of being silently changed out
from under it; only a genuinely new, longer list, holding both real
calculations in the real order they happened, ever gets built. This
project's own real, executed test — `chainedCalculationsAccumulateInHistoryInOrder`
— is the permanent, tested proof that this is exactly what happens, not
just what's intended: `state.history` really does end up holding both
records, `7 + 3 = 10` and `10 + 5 = 15`, in that order, real and
unchanged, the first genuine memory this calculator has ever had of its
own past.
