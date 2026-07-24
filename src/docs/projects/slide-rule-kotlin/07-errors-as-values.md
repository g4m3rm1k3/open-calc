# Lesson 7: A Closed Set of Outcomes, Checked by the Compiler

*(Errors as Values — Sealed Classes)*

**User Story**
> As a user, dividing by zero (or typing something unparseable) should show
> a clean inline error, never a crash or a raw "Infinity" on screen.

**What you will build**
`evaluate("5÷0")` currently returns `Double.POSITIVE_INFINITY` silently —
Kotlin's `Double` division never throws, unlike Java's integer division.
This lesson wraps every evaluation in a real `Ok`/`Error` result type and
makes the display show a real error message instead of the word "Infinity."

**What you need to know first**
Lesson 6's `evaluate`. Lesson 0's `when` and `data class` — this lesson
combines both into one new construct.

---

## Concept Unit: The Silent Bug

### The Problem

Prove the bug exists before fixing it.

```kotlin
val result = 5.0 / 0.0
println(result)
println(result.isInfinite())
```

Run it:

```bash
kotlin divzero.kts
```

Real output — verified this session:

```text
Infinity
true
```

*What this proves:* dividing by zero with `Double` values never throws an
exception — Kotlin (like Java) follows IEEE 754 floating-point rules here,
where division by zero produces `Infinity`, not a crash. If `evaluate`'s
result is displayed as-is, a user who types `5÷0` sees the literal text
"Infinity" on their calculator screen — technically correct, not remotely
what a calculator should show.

### Discard the throwaway example

Deleted. `isInfinite()` is the exact check the real fix uses next.

---

## Concept Unit: `sealed class` as a Closed Set of Outcomes

### The Problem

`evaluate` needs to communicate two fundamentally different kinds of
outcome — "here's a valid number" or "this failed, here's why" — and the
rest of the app needs to be *forced*, by the compiler, to handle both. A
Java-style approach (return a `Double` and separately throw an exception, or
return a magic sentinel value like `-1.0`) relies on every caller
remembering to check, with nothing enforcing it.

### Introduce the concept in isolation

```kotlin
sealed class CalcResult {
    data class Ok(val value: Double) : CalcResult()
    data class Error(val message: String) : CalcResult()
}

fun safeEvaluate(expression: String, compute: (String) -> Double): CalcResult {
    return try {
        val value = compute(expression)
        if (value.isNaN() || value.isInfinite()) {
            CalcResult.Error("Cannot divide by zero")
        } else {
            CalcResult.Ok(value)
        }
    } catch (e: Exception) {
        CalcResult.Error("Invalid expression")
    }
}

fun describe(result: CalcResult): String = when (result) {
    is CalcResult.Ok -> "Result: ${result.value}"
    is CalcResult.Error -> "Error: ${result.message}"
}

println(describe(safeEvaluate("7+3") { 10.0 }))
println(describe(safeEvaluate("5÷0") { 5.0 / 0.0 }))
println(describe(safeEvaluate("bad") { throw NumberFormatException() }))
```

Run it:

```bash
kotlin sealed.kts
```

Real output — verified this session:

```text
Result: 10.0
Error: Cannot divide by zero
Error: Invalid expression
```

*What this proves:* `safeEvaluate` never returns a raw `Double` — every
caller receives a `CalcResult` and must ask "is this `Ok` or `Error`?"
before getting at a number. The three test calls show all three real
failure paths this app needs: a clean success, a silent-`Infinity` case
caught explicitly, and a genuinely thrown exception caught by `try`/`catch`.

Now prove the compiler actually enforces handling both cases — remove the
`Error` branch from `describe`:

```kotlin
fun describe(result: CalcResult): String = when (result) {
    is CalcResult.Ok -> "Result: ${result.value}"
}
```

Compile it for real (not the lenient script runner — use a real file):

```bash
kotlinc SealedBad.kt -include-runtime -d out.jar
```

Real output — verified this session:

```text
SealedBad.kt:6:44: error: 'when' expression must be exhaustive. Add the 'is Error' branch or an 'else' branch.
fun describe(result: CalcResult): String = when (result) {
                                           ^^^^
```

*What this proves:* because `CalcResult` is `sealed`, the compiler knows
its *complete* set of possible subtypes (`Ok` and `Error`, and nothing
else, ever, from any file) and refuses to compile a `when` expression that
doesn't account for all of them — no `else` fallback needed or wanted; the
compiler is checking real, specific coverage.

### Discard the throwaway examples

Both scripts are discarded. `CalcResult` and `safeEvaluate`'s shape move
into the real app next, adapted to wrap Lesson 6's actual `evaluate`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `CalcResult.kt`; `onButtonPressed` in the
  calculator screen.
- **Change type:** Add + modify.
- **Location:** `"=" -> evaluate(expression).toString()` from Lesson 6.
- **Dependencies:** Lesson 6's `evaluate`.

### The New Code

```kotlin
sealed class CalcResult {
    data class Ok(val value: Double) : CalcResult()
    data class Error(val message: String) : CalcResult()
}

fun safeEvaluate(expression: String): CalcResult = try {
    val value = evaluate(expression)
    if (value.isNaN() || value.isInfinite()) {
        CalcResult.Error("Cannot divide by zero")
    } else {
        CalcResult.Ok(value)
    }
} catch (e: Exception) {
    CalcResult.Error("Invalid expression")
}
```

### The Updated Project

```kotlin
fun onButtonPressed(label: String) {
    expression = when (label) {
        "C" -> ""
        "=" -> when (val result = safeEvaluate(expression)) {   // ← changed
            is CalcResult.Ok -> result.value.toString()
            is CalcResult.Error -> result.message
        }
        else -> expression + label
    }
}
```

Pressing `=` on `"5÷0"` now shows "Cannot divide by zero" on screen instead
of "Infinity" — every other branch is unchanged from Lesson 6.

### Mechanical walkthrough

1. `sealed class CalcResult` — (first appearance) `sealed` restricts every
   direct subtype of `CalcResult` to being declared in the same file (or
   module, for a newer Kotlin feature not needed here) — the compiler can
   therefore enumerate *all* of them, which is exactly what makes
   exhaustive `when` checking possible.
2. `data class Ok(val value: Double) : CalcResult()` — (hard concept
   reappearing) Lesson 0's `data class`, now as a subtype of a sealed
   class — a `data class` and `sealed class` combine constantly in Kotlin,
   each solving a different half of the same problem (value semantics,
   closed set of cases).
3. `when (val result = safeEvaluate(expression)) { is CalcResult.Ok -> ...`
   — (first appearance) a `when` **subject with its own `val` declared
   inline** — `result` is scoped only to this `when` block. `is
   CalcResult.Ok` is a **type-check branch**, matching when `result` is
   specifically that subtype — and inside that branch, `result` is
   automatically **smart-cast** to `CalcResult.Ok`, so `result.value` is
   directly accessible with no manual cast.

### CS Lens

This is a **sum type** (also called a tagged union or discriminated
union) — a value that is *exactly one of* a fixed, known set of shapes,
each possibly carrying different data. Also recognized in: TypeScript's
discriminated unions, Rust's `enum` (a much more central feature there than
Java's plain `enum`), Swift's `enum` with associated values, and Haskell/ML's
algebraic data types — a feature increasingly standard across modern
languages, notably absent from Java itself.

### SE Lens

The real tradeoff versus Java's usual approach (throw an exception, or
return a nullable/sentinel value): sealed classes make every possible
outcome an explicit, compiler-checked branch at the point you consume the
result, rather than an exception that can be silently caught (or not
caught) anywhere up the call stack, invisible from a function's signature
alone. The cost: more upfront ceremony defining the result type — worth it
here specifically because "divide by zero" is an *expected*, routine input
to a calculator, not an exceptional circumstance; a real thrown exception
is still used underneath for the genuinely unexpected case (malformed
input), caught once at this boundary and converted into the same `Error`
shape.

### Connection

Every place in this course that can meaningfully fail — Epic 5's linear
system solver (a system with no solution), Epic 6's calculus operations at
a discontinuity — reuses this exact `sealed class` shape rather than
inventing a new error-handling convention each time.

---

## Closing

### Connect the pieces

`5.0 / 0.0` silently produces `Infinity` (unit 1) — a real bug if displayed
raw. `CalcResult` (unit 2) forces every evaluation outcome into exactly one
of two compiler-known shapes, checked with `isInfinite()`/`isNaN()` and a
`try`/`catch` around the genuinely-throwing case. `onButtonPressed` now
branches exhaustively on the result, showing a real message for both
`Infinity` and malformed input, instead of a raw floating-point value.

### What breaks without this

You already ran the exact broken version above (`SealedBad.kt`) and saw the
real `'when' expression must be exhaustive` error — that's this lesson's
"what breaks," proven before the fix rather than after it, because seeing
the compiler reject the incomplete version is the entire point of `sealed`.

### Exercises

- Add a third outcome, `CalcResult.DivisionByZero` (no message, just a
  marker), replacing the current string-based `Error("Cannot divide by
  zero")` case — update `onButtonPressed`'s `when` and confirm the compiler
  now demands a third branch.
- Trigger the `catch (e: Exception)` branch on purpose by typing something
  `evaluate` can't parse (an operator with nothing after it) and confirm
  "Invalid expression" appears instead of a crash.

### Definition of done

- [ ] `5÷0` shows "Cannot divide by zero" on screen, not "Infinity".
- [ ] A malformed expression shows "Invalid expression", not a crash.
- [ ] You triggered the real exhaustiveness compiler error yourself.
- [ ] You can explain, concretely, why `sealed` is what makes exhaustive
      `when` checking possible — not just "it's required."
- [ ] Commit: `git commit -m "Wrap evaluation in a sealed CalcResult — division by zero and bad input now show real messages"`.
