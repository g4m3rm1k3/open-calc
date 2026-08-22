# Lesson 7.2: Gone the Moment the Process Is

- **What you will build** — This lesson builds no new real feature — it's
  a purely diagnostic lesson, proving, with real, executed evidence, the
  problem the rest of Stage 7 exists to solve. `AndroidCalculator`'s own
  real `CalculatorState.history` genuinely records every
  calculation performed — but only in RAM, inside whichever
  `CalculatorViewModel` instance the Android OS happens to be running
  right now. This lesson proves, concretely, exactly what that means:
  what "persistence" actually requires beyond RAM, what shape persisted
  data almost always takes (tables and records), and what real
  operations (CRUD) any persistent store has to support — the exact
  vocabulary the next two lessons (Room, then a real repository) build
  on to finally make this project's own history survive an app restart.
- **What you need to know first** —
  - Lesson 7.1 (What Already Happened Doesn't Change):
    `CalculatorState.history` and `Calculation` — the real, in-memory
    feature this whole lesson's problem is about.
  - Lesson 4.3 (An Owner That Outlives the Screen): `CalculatorViewModel`,
    and exactly what "survives a configuration change" already means for
    this project — the real boundary this lesson pushes past.
  - Lesson 0.8 (A Fixed Set of Choices and a Record of What Happened):
    `data class`, reused throughout this lesson's own throwaway labs.
  - Lesson 0.4 (Holding Many Values at Once): `List`/`MutableList`,
    reused throughout this lesson's own throwaway labs.

## Terms used in this lesson

- **`val`** — declares a read-only local binding, assigned exactly once;
  used throughout this lesson's own throwaway labs.
- **`for` (loop)** — iterates once over each element of a collection, in
  order; already established in this project's own real
  `CalculatorScreen` keypad loop, reused here to print every real row of
  a throwaway table.
- **String template** — a `$name` or `${expression}` sequence inside a
  double-quoted string, replaced at runtime with that value's own string
  representation; used throughout this lesson's own throwaway labs to
  print real, computed values.
- **`==`** — Kotlin's structural equality, calling the left operand's
  own `equals`; used inside this lesson's own throwaway lambdas
  (`it.id == 1`) to identify one specific real record among several.
- **Lambda expression (`{ it.id == 1 }`)** — a function literal, already
  established in this project's own Stage 0 work; used here as the real
  argument to `find`/`indexOfFirst`/`removeAll`, each one calling this
  lambda once per element to decide which real record it applies to.

## Objects and methods used

- **`List<LabRow>` / `listOf`**
  - What it is: this project's own already-established, real, read-only
    collection type, and the real top-level function that builds one
    from a fixed set of elements.
  - Implementation: `interface List<out E>`; `fun <T> listOf(vararg elements: T): List<T>`
    — already used in this project's own real `keypadRows`
    (`MainActivity.kt`) and throughout Stage 5's own parser work.
  - Its use: this lesson's own second unit builds a small, throwaway
    `List<LabRow>`, standing in for a real database table, to prove a
    real, concrete point: a `List` of a `data class` already *is* a
    table, in miniature — one element per row, one property per column.
  - Type: an `interface`, plus a top-level factory function.
  - Responsibility: holds a fixed, ordered collection of elements, with
    no way to add, remove, or replace any of them after construction.
  - Depends on: the elements to hold, supplied at construction.
  - Connects to: iterated by this lesson's own `for` loop, printing
    every real row it holds.
  - Shape: a small, standard-library type, already fully established in
    this project, reused here as a concrete, working stand-in for a
    database table.

- **`data class LabRow` / `LabRecord`**
  - What it is: two small, throwaway `data class` types this lesson's
    own labs define, each standing in for one real, uniform record shape
    a table might hold.
  - Implementation: `data class LabRow(val id: Int, val name: String, val amount: Double)`;
    `data class LabRecord(val id: Int, val value: String)` — ordinary
    `data class` declarations, using the same real mechanism already
    proven for `CalculatorState` and `Calculation`.
  - Its use: `LabRow` grounds this lesson's own Tables & Records unit;
    `LabRecord` grounds its CRUD unit — two intentionally minimal,
    disposable shapes, never meant to become real project code.
  - Type: `data class`.
  - Responsibility: represents one uniform record's own real shape —
    a fixed set of named, typed fields, identical across every instance.
  - Depends on: nothing external.
  - Connects to: held inside this lesson's own throwaway `List`/
    `MutableList` variables, never referenced by any real project file.
  - Shape: throwaway, isolated lab types — discarded the moment each
    unit's own lab is understood.

- **`mutableListOf()` / `.add()`**
  - What it is: this project's own already-established, real, growable
    collection constructor and its real, mutating append method.
  - Implementation: `fun <T> mutableListOf(vararg elements: T): MutableList<T>`;
    `fun add(element: E): Boolean` — already fully treated in this
    project's own earlier work, where a `MutableList` field was proven
    to be the *wrong* choice for `CalculatorState.history` specifically.
  - Its use: this lesson's own CRUD lab deliberately uses a real,
    ordinary `MutableList` this time — not inside any `data class` this
    lesson touches, so none of that same aliasing danger applies here;
    it's simply standing in for a real, mutable database table.
  - Type: a top-level factory function; an instance method on
    `MutableList`.
  - Responsibility: builds a real, growable collection; appends one
    element to it, in place.
  - Depends on: nothing to construct; an element to append.
  - Connects to: built once, at the top of this lesson's own CRUD lab;
    appended to twice, to demonstrate a real Create operation.
  - Shape: a real, standard-library type, already established in this
    project, reused here as a stand-in for a mutable database table.

- **`.find { }`**
  - What it is: a new, real, standard-library extension function on
    `Collection`, returning the first element matching a given
    condition, or `null` if none does.
  - Implementation: `inline fun <T> Iterable<T>.find(predicate: (T) -> Boolean): T?`
    — walks the collection in order, calling `predicate` on each
    element, returning the first one it returns `true` for.
  - Its use: this lesson's own CRUD lab calls it to demonstrate a real
    Read operation — looking up one specific record by its own `id`,
    the same real shape any persistent store's own "read one record"
    operation takes.
  - Type: an `inline` extension function on `Iterable<T>`.
  - Responsibility: searches a collection, in order, for the first
    element satisfying a real condition, and reports whether one exists.
  - Depends on: the collection to search; a predicate lambda deciding
    what counts as a match.
  - Connects to: called once, on this lesson's own throwaway `table`,
    immediately after two real records have been added to it.
  - Shape: a small, standard-library utility, new to this project.

- **`.indexOfFirst { }`**
  - What it is: a new, real, standard-library extension function on
    `List`, returning the real, zero-based position of the first element
    matching a given condition, or `-1` if none does.
  - Implementation: `inline fun <T> List<T>.indexOfFirst(predicate: (T) -> Boolean): Int`
    — walks the list in order, calling `predicate` on each element,
    returning the first matching index.
  - Its use: this lesson's own CRUD lab needs a real *position*, not
    just the matching element itself, since replacing an element inside
    a `MutableList` (the real mechanism behind Update) requires knowing
    exactly where it lives.
  - Type: an `inline` extension function on `List<T>`.
  - Responsibility: locates one real element's own position within an
    ordered collection.
  - Depends on: the list to search; a predicate lambda.
  - Connects to: called once, its real result used immediately afterward
    to index into the same `table` and replace that one element.
  - Shape: a small, standard-library utility, new to this project.

- **`.removeAll { }`**
  - What it is: a new, real, mutating extension function on
    `MutableCollection`, removing every element matching a given
    condition, in place.
  - Implementation: `fun <T> MutableCollection<T>.removeAll(predicate: (T) -> Boolean): Boolean`
    — walks the collection, removing each element `predicate` returns
    `true` for, and returns whether anything was actually removed.
  - Its use: this lesson's own CRUD lab calls it to demonstrate a real
    Delete operation, removing one specific record by its own `id`.
  - Type: an extension function on `MutableCollection<T>`.
  - Responsibility: removes every real element satisfying a condition
    from the collection it's called on, mutating it in place.
  - Depends on: the mutable collection to remove from; a predicate
    lambda.
  - Connects to: called last, in this lesson's own CRUD lab, after
    Create, Read, and Update have already been demonstrated in sequence.
  - Shape: a small, standard-library mutating utility, new to this
    project.

### Everything else in the file, not this lesson's subject but still explained

- **This project's own real `Calculator.kt`/`Calculation.kt`, reproduced
  verbatim**
  - What it is: this lesson's own first unit needs a real, working
    `CalculatorState`/`nextState`/`Calculation` to demonstrate a genuine
    real gap against — so its own throwaway lab opens with an exact,
    unchanged copy of this project's own current, real `Calculator.kt`
    and `Calculation.kt`, compiled standalone.
  - Implementation: identical, byte-for-byte, to the real files this
    project already ships — `Operation`/`Addition`/`Subtraction`/
    `Multiplication`/`Division`/`Modulo`/`Operator`/`operatorSymbols`/
    `Display`/`Calculation`/`CalculatorState`/`nextState`.
  - Its use: gives this lesson's own real, temporary `main()` (the
    actual new part) something genuine to drive a real calculation
    through, exactly the way this project's own real app would.
  - Type: a verbatim reproduction of several already-real project types
    and one already-real project function.
  - Responsibility: unchanged from every one of these constructs' own
    real, permanent responsibility, already given full treatment in the
    lessons that introduced them, from this project's very first working
    program through its own most recent history work.
  - Depends on: nothing new — every real dependency here was already
    established before this lesson began.
  - Connects to: called from this lesson's own new `main()`, the same
    real way `CalculatorViewModel.onButtonClick` calls it in the actual
    app.
  - Shape: real, permanent project code, reproduced only so this
    throwaway lab can compile and run standalone, outside the real
    Gradle project — nothing about any of it is new, changed, or this
    lesson's own subject.

- **`fun main()`**
  - What it is: the real, standard entry-point function each of this
    lesson's own throwaway labs is run through.
  - Implementation: `fun main()`.
  - Its use: gives each isolated lab a real, runnable starting point,
    compiled and executed directly via `kotlinc`, entirely outside this
    project's own Android/Gradle build.
  - Type: a top-level function, specially recognized by the Kotlin
    compiler as a program's real entry point.
  - Responsibility: the one function the JVM calls first when a compiled
    Kotlin file runs.
  - Depends on: nothing required beyond existing as a real top-level
    declaration.
  - Connects to: calls every other function each lab needs.
  - Shape: the outermost real boundary of each throwaway lab — never
    present in this project's own permanent files.

- **`println`**
  - What it is: a real, top-level standard-library function printing a
    value's string representation to standard output.
  - Implementation: `fun println(message: Any?)`.
  - Its use: makes every real, computed value in this lesson's own three
    labs visible, since they exist only to be read and then discarded.
  - Type: a top-level function.
  - Responsibility: writes one value's textual representation to the
    console, nothing else.
  - Depends on: one argument to print.
  - Connects to: called repeatedly across all three of this lesson's own
    labs; never appears in this project's own real, permanent code.
  - Shape: a small, standard-library utility, used here exclusively for
    temporary lab output.

---

## Concept Unit: Persistence

### The Problem

This project's own real `CalculatorState.history` genuinely
records every calculation performed, for real, tested, and correct. But
where does that `history` actually *live*? `CalculatorState` is held
inside `CalculatorViewModel`, a real, plain Kotlin object, sitting in
this app's own process memory — RAM. This project's own earlier
ViewModel work already proved that
object survives a *configuration change* (a screen rotation) — Android
specifically preserves a `ViewModel` across exactly that one kind of
destroy-and-recreate. But what about the Android OS simply killing this
app's entire process — something it does routinely, to reclaim memory
from apps the user isn't currently looking at — followed by the user
reopening the app later? Does `history` survive *that*?

> **Stop and think, before reading on:**
> - This project's own earlier ViewModel work already proved a
>   `ViewModel` survives a screen rotation. Given what you know about
>   *where* a `ViewModel`'s own real data
>   actually lives (a plain Kotlin object, in RAM) — what do you think
>   happens to that same object if the Android OS kills the app's
>   entire process to free up memory?
> - If a brand-new `CalculatorViewModel()` — with no special code doing
>   anything to help it — were constructed from scratch, what would you
>   expect its own `history` to contain?
> - What's fundamentally different about writing a value into a
>   variable held in RAM versus writing it into a file on disk, in
>   terms of what survives a full power-off?

### Introduce the Concept in Isolation

```kotlin
fun interface Operation {
    fun apply(current: Int, amount: Int): Int
}

private class Addition : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current + amount
    }
}

private class Subtraction : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current - amount
    }
}

private class Multiplication : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current * amount
    }
}

private class Division : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current / amount
    }
}

private class Modulo : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current % amount
    }
}

enum class Operator(val operation: Operation) {
    PLUS(Addition()),
    MINUS(Subtraction()),
    TIMES(Multiplication()),
    DIVIDE(Division()),
    MODULO(Modulo())
}

val operatorSymbols = mapOf(
    "+" to Operator.PLUS,
    "−" to Operator.MINUS,
    "×" to Operator.TIMES,
    "÷" to Operator.DIVIDE
)

sealed class Display {
    data class Value(val text: String) : Display()
    object Error : Display()
}

private fun Display.textOrZero(): String = when (this) {
    is Display.Value -> text
    Display.Error -> "0"
}

data class Calculation(
    val operator: Operator,
    val operandA: Int,
    val operandB: Int,
    val result: Int
)

data class CalculatorState(
    val display: Display = Display.Value("0"),
    val firstOperand: Int? = null,
    val pendingOperator: Operator? = null,
    val history: List<Calculation> = emptyList()
)

fun nextState(current: CalculatorState, label: String): CalculatorState {
    return when {
        label[0].isDigit() -> {
            val currentText = current.display.textOrZero()
            val newText = if (currentText == "0") label else currentText + label
            current.copy(display = Display.Value(newText))
        }
        label == "C" -> current.copy(display = Display.Value("0"))
        label in operatorSymbols -> current.copy(
            firstOperand = current.display.textOrZero().toInt(),
            pendingOperator = operatorSymbols[label],
            display = Display.Value("0")
        )
        label == "=" -> {
            val operator = current.pendingOperator
            val first = current.firstOperand
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
        }
        else -> current
    }
}

fun main() {
    var state = CalculatorState()
    state = nextState(state, "7")
    state = nextState(state, "+")
    state = nextState(state, "3")
    state = nextState(state, "=")
    println("Before a simulated restart: ${state.history}")

    val restarted = CalculatorState()
    println("After a simulated restart (a fresh instance, same as a new process): ${restarted.history}")
}
```

Real, executed output:

```
Before a simulated restart: [Calculation(operator=PLUS, operandA=7, operandB=3, result=10)]
After a simulated restart (a fresh instance, same as a new process): []
```

This lesson's own first unit needs a real, working `CalculatorState`/
`nextState`/`Calculation` to demonstrate a genuine gap against, so this
lab opens with an exact, unchanged reproduction of this project's own
current, real `Calculator.kt` and `Calculation.kt` — every one of those
constructs already has its own full, real treatment in the lessons that
introduced them, and nothing about any of them is new or different
here. The one genuinely new part is the `main()` at the bottom: it
drives a real `7 + 3 =` through the real, unmodified `nextState`,
confirming `history` really does hold the real, expected
`Calculation` — then builds a *second*, completely fresh
`CalculatorState()`, standing in for exactly what a new, restarted
process would start with, since nothing about a real process restart
carries any of the old process's own RAM forward. Its own `history`
prints as `[]` — real, executed, decisive proof that this app's own
real calculation history, as it exists right now, does not survive a
restart at all. This is called **persistence** — data that survives
beyond the lifetime of the process that created it, by being written
somewhere durable (disk), not just held in RAM.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: this project's own real
history is not yet persistent, and "restarting" a `CalculatorState`
really does lose everything, exactly as a real app restart would.

### Mechanical Walkthrough

- `fun main()` — this lab's own new entry point, the only
  genuinely new code in the whole file.
  - `var state = CalculatorState()` — builds a real, initial state,
    using `CalculatorState`'s own already-established default values.
  - `state = nextState(state, "7")` / `"+"` / `"3"` / `"="` — drives the
    real, unmodified `nextState` through a real `7 + 3 =` sequence, the
    identical real mechanism this project's own app uses on every
    keypad press.
  - `println("Before a simulated restart: ${state.history}")` — prints
    the real, resulting `history`, using a string template to embed its
    own `toString()` directly inside the message.
  - `val restarted = CalculatorState()` — builds a second, completely
    independent `CalculatorState`, using the exact same no-argument
    constructor call as the first one — nothing links it to `state` at
    all, the same real relationship a genuinely new process's own first
    object would have to whatever the old process once held.
  - `println("After a simulated restart ...: ${restarted.history}")` —
    prints `restarted`'s own real, empty `history`.

### CS Lens

**Persistence** — data that survives beyond the process that created
it, by living in durable storage instead of only RAM — is a real,
foundational computer science idea:

```
Also recognized in: a video game's own save file, surviving a console
power-off that would otherwise erase all in-memory progress; a word
processor's own autosave, protecting against a crash; a web browser's
own cookies and local storage, surviving a tab close; any real server's
own database, surviving a process restart or deployment that would
otherwise wipe every bit of in-memory request state.
```

### SE Lens

Why not just write every real change straight to disk immediately, all
the time, instead of keeping a separate notion of "in-memory state" at
all? A real alternative exists: some systems do write through on every
change. This project doesn't, and shouldn't — real disk I/O is
dramatically slower than RAM, and constant writes waste real battery and
real flash-storage wear; `CalculatorState`, held entirely in RAM via
`CalculatorViewModel`, is exactly the right tool for fast, frequently
changing values (each digit press, each operator choice) that don't
need to survive a crash mid-calculation. Only the *final*, completed
`Calculation` — once it's actually done — is worth the real cost of
durable persistence. The real, accepted cost of this split: anything
not yet written to durable storage really is lost the instant the
process ends, exactly as this unit's own lab just proved.

### Commands Needed

- `kotlinc lab1_process_death.kt lab2_tables_and_records.kt lab3_crud.kt -include-runtime -d labs.jar`
  — compiles all three of this lesson's own throwaway labs together in
  one real, batched pass, per the Verification Rule's own batching
  requirement — safe here since none of the three labs share a
  colliding top-level name.
- `java -cp labs.jar Lab1_process_deathKt` — runs this unit's own
  specific lab directly from the shared, compiled `.jar`.

### Run It

Already shown above — the real, executed output was:

```
Before a simulated restart: [Calculation(operator=PLUS, operandA=7, operandB=3, result=10)]
After a simulated restart (a fresh instance, same as a new process): []
```

### Connect the Pieces

This unit proved the real problem: this project's own real history
doesn't survive a restart. The next unit asks what shape data actually
needs to take before it can be written somewhere durable enough to fix
that.

---

## Concept Unit: Tables & Records

### The Problem

If this project's own history is ever going to survive a real restart,
it has to be written somewhere durable — and almost every real system
built for exactly that job (including Room, this project's own very
next step) organizes durable data using one shape in particular. This
project's own real `Calculation` already has four fixed, real fields:
`operator`, `operandA`, `operandB`, `result` — every single calculation
this app has ever performed has exactly those four, never more, never
fewer. What does a real, durable place to store many of them actually
look like?

> **Stop and think, before reading on:**
> - This project's own real `Calculation` already has four real fields.
>   If you had to write every completed calculation to a plain text
>   file, one calculation per line, what would each line need to
>   contain?
> - A spreadsheet is a real, everyday example of rows and columns. If
>   each row held one real `Calculation`, what would the columns be?
> - Given that a `List<Calculation>` already holds every real
>   calculation this project has ever performed, in order — what does
>   that suggest about the real relationship between a Kotlin `List`
>   and a database *table*?

### Introduce the Concept in Isolation

```kotlin
data class LabRow(val id: Int, val name: String, val amount: Double)

fun main() {
    val table: List<LabRow> = listOf(
        LabRow(1, "coffee", 4.50),
        LabRow(2, "lunch", 12.00)
    )
    println("Columns: id, name, amount")
    for (row in table) {
        println("Row: ${row.id}, ${row.name}, ${row.amount}")
    }
}
```

Real, executed output:

```
Columns: id, name, amount
Row: 1, coffee, 4.5
Row: 2, lunch, 12.0
```

This proves the real, concrete idea directly: `LabRow`'s own three real
properties (`id`, `name`, `amount`) *are* a real table's columns —
fixed, named, and identical across every row — and `table`'s own two
real elements *are* two real rows, each one a complete, uniform record.
This is called a **table** (the whole collection) made of **records**
(each individual row) — the same real shape a spreadsheet, a CSV file,
and every SQL database (including SQLite, which Room is built directly
on top of) all use. One small, real, worth-noticing detail in the
output: `4.50` prints as `4.5`, and `12.00` prints as `12.0` — `Double`
doesn't preserve a literal's own trailing zero, since `4.50` and `4.5`
are the exact same real value once stored.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: a `List` of a uniform
`data class` already *is* a table, in miniature, and this project's own
real `Calculation` is already shaped exactly like one real row.

### Mechanical Walkthrough

- `data class LabRow(val id: Int, val name: String, val amount: Double)`
  — declares a new, throwaway, uniform record shape, using the same
  real `data class` mechanism already proven for `CalculatorState` and
  `Calculation`; its three real properties are this throwaway table's
  own three real columns.
- `val table: List<LabRow> = listOf(...)` — builds a real, read-only
  `List`, already established in this project, holding two real
  `LabRow` instances — standing in, concretely, for a real database
  table holding two real rows.
  - `LabRow(1, "coffee", 4.50)` / `LabRow(2, "lunch", 12.00)` — two real
    constructor calls, each one a complete, real record — every field
    filled in, nothing partial or missing, the same uniformity every
    real row in a real table has to have.
- `println("Columns: id, name, amount")` — prints this throwaway
  table's own column names directly, as a literal string, since nothing
  in a plain `List<LabRow>` stores column *names* the way a real
  database table's own schema does — Kotlin only knows the real
  property names at compile time, not as a runtime value to print.
- `for (row in table)` — iterates once over each real element of
  `table`, in order, the same real loop mechanism already established
  in this project's own real `CalculatorScreen` keypad construction.
  - `println("Row: ${row.id}, ${row.name}, ${row.amount}")` — prints
    one real row's own three real column values, using a string
    template to read each property directly off the current `row`.

### CS Lens

The **relational (tabular) data model** — uniform records, organized
into named tables — is one of the most successful, foundational data-
organization ideas in all of computing:

```
Also recognized in: a spreadsheet's own rows and columns; every SQL
database ever built (MySQL, PostgreSQL, and SQLite specifically, the
real engine Room, this project's own very next step, is built directly
on top of); a plain CSV file, the simplest possible plain-text version
of the same idea; a phone's own real contacts list, one record per
contact, one column per field (name, number, email).
```

### SE Lens

Why organize persisted data as strictly *uniform* records — every row
sharing the exact same columns — rather than a loose, freeform
collection where each entry could have a different shape? A real
alternative exists and is a real, legitimate choice elsewhere: a
document-oriented store, where no two entries need the same fields at
all. This project's own real `Calculation` is a strong, natural fit for
the rigid, uniform shape instead — every real calculation this app
performs has exactly the same four real fields, with no calculation
ever needing an extra one or missing one — and a rigid, uniform table
is exactly what lets a real query language (SQL, arriving with Room)
ask precise, structured questions efficiently ("every calculation using
`PLUS`"), something a freeform store makes meaningfully harder. The
real, honest cost: a rigid table genuinely can't hold an irregular
record without either leaving some columns unused or redesigning the
whole table — not a real problem for this project's own simple,
uniform `Calculation`, but a real constraint worth knowing about before
assuming every persistence problem fits this same shape.

### Commands Needed

- `java -cp labs.jar Lab2_tables_and_recordsKt` — runs this unit's own
  specific lab directly from the already-compiled, shared `.jar` built
  in the unit above.

### Run It

Already shown above — the real, executed output was:

```
Columns: id, name, amount
Row: 1, coffee, 4.5
Row: 2, lunch, 12.0
```

### Connect the Pieces

The unit above proved this project's own real history *needs* to be
written somewhere durable. This unit proved *what shape* that durable
storage almost always takes — a table of uniform records, exactly
matching `Calculation`'s own real shape. The next unit asks what real
operations a table like that actually has to support.

---

## Concept Unit: CRUD

### The Problem

Now that persisted data lives in tables made of uniform records, what
real operations does any real persistence system actually need to
support? This project's own real history feature already does *some*
of them, right now, to its own real `Calculation` records — the real
question is which ones, and whether it does all of them.

> **Stop and think, before reading on:**
> - This project's own `nextState` already does one of four possible
>   things to `history` every time `=` succeeds:
>   `current.history + Calculation(...)`. Of Create, Read, Update, and
>   Delete — which one is that?
> - This project's own earlier history work established a strict rule:
>   never call `.copy()` on a `Calculation`. Given the same four
>   operations, which one does that rule permanently forbid this project
>   from ever doing to a saved calculation?
> - If a user wanted to clear their entire calculator history, which of
>   the four operations would that require — and does this project have
>   any real code that does it yet?

### Introduce the Concept in Isolation

```kotlin
data class LabRecord(val id: Int, val value: String)

fun main() {
    val table = mutableListOf<LabRecord>()

    // Create
    table.add(LabRecord(1, "first"))
    table.add(LabRecord(2, "second"))
    println("After Create: $table")

    // Read
    val found = table.find { it.id == 1 }
    println("Read id=1: $found")

    // Update
    val index = table.indexOfFirst { it.id == 2 }
    table[index] = table[index].copy(value = "second, updated")
    println("After Update: $table")

    // Delete
    table.removeAll { it.id == 1 }
    println("After Delete: $table")
}
```

Real, executed output:

```
After Create: [LabRecord(id=1, value=first), LabRecord(id=2, value=second)]
Read id=1: LabRecord(id=1, value=first)
After Update: [LabRecord(id=1, value=first), LabRecord(id=2, value=second, updated)]
After Delete: [LabRecord(id=2, value=second, updated)]
```

This proves all four real operations directly, one at a time, on one
shared, real, throwaway table: **Create** (`.add(...)`, twice, growing
the table from empty to two real rows), **Read** (`.find { }`, locating
one specific real record by its own `id` without changing anything),
**Update** (`.indexOfFirst { }` locating a real position, then
replacing that one element with a real, `.copy()`-modified version),
and **Delete** (`.removeAll { }`, permanently removing one real record
by its own `id`). This is called **CRUD** — Create, Read, Update,
Delete — the four fundamental operations essentially every real
persistent data system, from a phone's own contacts app to a bank's own
ledger, is built to support in some form.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: all four CRUD operations
are real, distinct, and each one changes (or deliberately doesn't
change) a real table in its own specific way.

### Mechanical Walkthrough

- `data class LabRecord(val id: Int, val value: String)` — a small,
  throwaway, uniform record shape, the same real `data class`
  mechanism used throughout this lesson.
- `val table = mutableListOf<LabRecord>()` — builds a real, empty,
  growable `MutableList`, already established in this project — a
  genuinely mutable stand-in for a real database table, deliberately
  not wrapped inside any `data class` this lesson touches, so none of
  this project's own already-established aliasing danger applies here.
- `table.add(LabRecord(1, "first"))` / `table.add(LabRecord(2, "second"))`
  — two real calls to `MutableList.add`, each appending one real record
  in place — the real mechanism behind **Create**.
- `println("After Create: $table")` — prints the real table's own
  current contents via a string template.
- `val found = table.find { it.id == 1 }` — calls the new, real
  `find` extension function, passing a real lambda,
  `{ it.id == 1 }`, checked against each element in order; `it` refers
  to whichever `LabRecord` is currently being checked. Returns the
  first real match, or `null` — the real mechanism behind **Read**.
- `val index = table.indexOfFirst { it.id == 2 }` — calls the new, real
  `indexOfFirst` extension function, returning the real, zero-based
  position of the first matching element, needed because updating a
  `MutableList` in place requires a real position, not just the
  matching value.
- `table[index] = table[index].copy(value = "second, updated")` —
  reads the real element currently at `index`, calls its own real,
  compiler-generated `.copy()` to build a new instance with `value`
  replaced, then assigns that new instance back into `table` at the
  same real position — the real mechanism behind **Update**.
- `table.removeAll { it.id == 1 }` — calls the new, real `removeAll`
  extension function, passing a real lambda; removes every real element
  matching it, in place — the real mechanism behind **Delete**.

### CS Lens

**CRUD** is the foundational vocabulary computing uses to describe what
any persistent data system actually does:

```
Also recognized in: a REST API's own real HTTP verbs (POST for Create,
GET for Read, PUT or PATCH for Update, DELETE for Delete — literally
named after CRUD); a spreadsheet application's own real toolbar (insert
a row, view a cell, edit a cell, delete a row); a file system's own
real operations (create a file, read its contents, overwrite it, delete
it); any real SQL database's own statements (INSERT, SELECT, UPDATE,
DELETE).
```

### SE Lens

Why does this project's own real `Calculation` history support Create
and Read, but permanently forbid Update, and not yet build Delete at
all? A real alternative exists: a fully CRUD-capable history, letting a
user edit or remove individual past calculations, is a real, plausible
design other apps make. This project deliberately doesn't allow
Update — this project's own earlier history work already proved why: a
`Calculation`'s own `result` is only correct because it was computed at
the exact same moment as its own operands, so editing any field
afterward would either require silently recomputing `result` behind the
caller's back, or risk recreating the exact inconsistent record that
same earlier work already proved is dangerous. Delete remains a real,
honest, unbuilt gap — a
legitimate, plausible future feature (a "clear history" button), simply
not yet needed by anything this project has actually built; the real
cost of leaving it unbuilt is that a user who wants a clean slate
currently has no way to get one.

### Commands Needed

- `java -cp labs.jar Lab3_crudKt` — runs this unit's own specific lab
  directly from the already-compiled, shared `.jar` built in the first
  unit above.

### Run It

Already shown above — the real, executed output was:

```
After Create: [LabRecord(id=1, value=first), LabRecord(id=2, value=second)]
Read id=1: LabRecord(id=1, value=first)
After Update: [LabRecord(id=1, value=first), LabRecord(id=2, value=second, updated)]
After Delete: [LabRecord(id=2, value=second, updated)]
```

### Connect the Pieces

The unit above proved what shape persisted data takes — tables of
uniform records. This unit proved what real operations act on that
shape — Create, Read, Update, Delete — and, applied honestly to this
project's own real `Calculation` history: Create and Read are already
real; Update is permanently, deliberately forbidden; Delete is a real,
open, unbuilt gap.

---

## Connect the pieces

Trace this project's own real history feature through all three of this
lesson's own units. The first unit proved the real, current gap: a real
`Calculation` — `7 + 3 = 10` — genuinely exists in `CalculatorState.history`
right up until the process ends, and a freshly restarted app starts
with nothing, `history` reading `[]`, exactly as if the calculation had
never happened at all. The second unit proved what shape a real, durable
fix would need to take: `Calculation`'s own four fixed, real fields
(`operator`, `operandA`, `operandB`, `result`) are already exactly the
shape of one row in a real table — nothing about this project's own
existing design needs to change to fit that shape, it already does. The
third unit proved what real operations a table like that has to support,
and, applied honestly back to this project's own real code: `nextState`'s
own `current.history + Calculation(...)` is already a real Create; a
future history screen reading `state.history` would already be a real
Read; Update is permanently forbidden, by this project's own deliberate
design; Delete is real, honest, unbuilt territory. None of this lesson's
own three real findings required a single line of new project code —
but together, they're the exact vocabulary (persistence, tables,
records, CRUD) the next lesson, Room, needs already in place before a
single real line of Room code can make any sense at all.
