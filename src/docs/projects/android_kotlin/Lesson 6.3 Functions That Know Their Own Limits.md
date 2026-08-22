# Lesson 6.3: Functions That Know Their Own Limits

**What you will build:** No new feature ships from this lesson — this is a real, executed investigation, staying conceptual for the identical honest reason this slice's own immediately preceding lesson stayed conceptual. This project already has one real, shipped example of a **domain error** — dividing by zero — caught and handled since this project's own real division-by-zero fix. Real `sqrt` and `log`, this slice's own coming scientific functions, have domain restrictions of their own: a negative input to `sqrt`, a non-positive input to `log`. This lesson proves, with real, executed, integer-only code, exactly what those restrictions mean and why they exist, without needing the one real numeric tool — `Double` — this project still doesn't have.

**What you need to know first:** This project's own real, shipped division-by-zero fix — a real `ArithmeticException`, caught and converted into a real `Display.Error` instead of a crash — and the real concepts that fix was already built on: exceptions, invalid state, domain errors, user-facing errors. `while` loops, established since this slice's own Recursion and Queue work. `try`/`catch`, established from this project's own real division-by-zero fix.

## Terms used in this lesson

- **Domain** — the complete set of inputs a function is actually defined for. This word exists because a function's own real code can often be *written* to accept a wider range of inputs than it can *correctly answer* — division's own real domain excludes a divisor of `0` not because Kotlin's own `/` operator refuses to compile with one, but because no real integer answer to "how many zeros fit into this number" actually exists.
- **Domain error** — already established from this project's own real division-by-zero fix, reappearing here in a new context: the real, specific failure that happens when a function is given an input genuinely outside its own domain — not a bug in the function's own logic, but a real, honest report that the question itself has no valid answer for that input.

## Objects and methods used

- **`IllegalArgumentException`**
  - *What it is:* A real, standard exception representing a method being called with an argument it cannot legitimately accept.
  - *Implementation:* `kotlin.IllegalArgumentException`, a subclass of `RuntimeException` — thrown explicitly by code, via `throw`, rather than raised automatically by the JVM the way this project's own real `ArithmeticException` is.
  - *Its use:* This unit's own throwaway lab throws it explicitly, from inside two hand-written functions, the moment their own real input falls outside what they're actually defined to handle.
  - *Type:* A concrete exception class.
  - *Responsibility:* Signaling that a real, specific argument value is the actual reason an operation cannot proceed.
  - *Depends on:* Nothing to construct — built directly with a real, descriptive message string.
  - *Connects to:* Thrown explicitly inside this unit's own two throwaway functions; caught explicitly by this unit's own throwaway `main`.
  - *Shape:* A standard JVM/Kotlin exception type — this lesson's own first use of it, contrasting directly with this project's own real `ArithmeticException`, which the JVM throws automatically rather than a real, explicit `throw` statement.
- **`throw`**
  - *What it is:* A real Kotlin keyword that raises an exception explicitly, immediately halting normal execution of the code that contains it.
  - *Implementation:* `throw SomeException("message")` — constructs a real exception instance and raises it, the same way an automatic failure like integer division by zero already does internally, but written directly by the programmer instead of triggered by the JVM.
  - *Its use:* Both of this unit's own throwaway functions check their own real input first, and `throw` a real, descriptive `IllegalArgumentException` the moment that input falls outside their own real domain — before any real computation runs at all.
  - *Type:* A control-flow keyword.
  - *Responsibility:* Halting execution and raising a real, specific exception on purpose.
  - *Depends on:* A real exception instance to raise.
  - *Connects to:* Used once inside each of this unit's own two throwaway functions, each one's own real check running first, before any real arithmetic.
  - *Shape:* Already-established Kotlin syntax (this project's own real code has caught exceptions before), reappearing here as the source of one for the first time, rather than only the receiving end.
- **`while` loop**
  - *What it is:* A control structure repeating its body for as long as a condition stays `true`, already established from this slice's own Big-O, Queue, and Recursion work.
  - *Implementation:* `while (condition) { body }`.
  - *Its use:* Both of this unit's own throwaway functions use one to compute their own real, integer answer — one counting upward until it overshoots, the other dividing downward until it can't anymore.
  - *Type:* A control-flow keyword.
  - *Responsibility:* Deciding, fresh, before every repetition, whether to run the body again.
  - *Depends on:* A `Boolean` condition, re-evaluated every time control reaches the top of the loop.
  - *Connects to:* Drives the real, iterative computation inside both of this unit's own throwaway functions.
  - *Shape:* A fundamental control structure, reappearing here unchanged.
- **`try` / `catch` (as a statement)**
  - *What it is:* A control structure attempting to run some code and recovering if a specific real exception occurs, already established from this project's own real division-by-zero fix — there, used as an *expression*, producing a real value either way; here, used as a plain *statement*, valued only for what it does, not for any result it produces.
  - *Implementation:* `try { riskyCode() } catch (e: SomeException) { handleIt() }` — when neither branch's own final line is used as a value, `try`/`catch` runs purely for its own real side effects.
  - *Its use:* This unit's own throwaway `main` wraps each real, expected-to-fail call in its own `try`/`catch`, printing the real exception's own message instead of letting the whole program crash.
  - *Type:* A control-flow construct.
  - *Responsibility:* Running code that might fail, and defining exactly what happens if it does.
  - *Depends on:* A block of code to attempt, and a real exception type to catch.
  - *Connects to:* Wraps each of the two real, deliberately-domain-violating calls in this unit's own throwaway `main`.
  - *Shape:* Already-established Kotlin syntax, reappearing here in its other real shape — a statement, not an expression.
- **`Throwable.message`**
  - *What it is:* A real, standard property on every real exception, giving the descriptive text it was constructed with, if any.
  - *Implementation:* `val message: String?`, part of `kotlin.Throwable`, the real, common superclass every real exception in Kotlin ultimately extends — nullable, since not every real exception is guaranteed to carry one.
  - *Its use:* This unit's own throwaway `main` reads it directly, printing the exact real, descriptive text each thrown `IllegalArgumentException` was built with.
  - *Type:* A read-only property.
  - *Responsibility:* Carrying whatever real, human-readable explanation the code that threw the exception chose to attach.
  - *Depends on:* The real exception instance it's read from.
  - *Connects to:* Read twice in this unit's own throwaway `main`, once per real caught exception.
  - *Shape:* A standard, already-present property on every real exception — this lesson's own first use of it.
- **String templates**
  - *What it is:* Already-established string interpolation syntax, from this project's own earliest real code.
  - *Implementation:* `"$expression"` or `"${expression}"` embeds a real value directly inside a string literal.
  - *Its use:* Both of this unit's own throwaway functions build their own real exception message this way, embedding the real, actual invalid input value directly into the text.
  - *Type:* Already-established string syntax.
  - *Responsibility:* Building a string with real, live values embedded in it.
  - *Depends on:* Whatever expression is being interpolated.
  - *Connects to:* Used inside both of this unit's own throwaway `throw` statements.
  - *Shape:* Already-established Kotlin syntax, reappearing here unchanged.

## Concept Unit: What "Domain" Actually Means

### The Problem

This project already has one real, shipped domain error — dividing by zero, caught since this project's own real division-by-zero fix. This slice's own coming real functions, `sqrt` and `log`, have real domain restrictions of their own: a negative input to `sqrt`, a non-positive input to `log`. But this project doesn't have real `sqrt` or `log` yet — both need real floating-point arithmetic this project still doesn't have. Is there a genuine, honest way to prove exactly what a domain restriction *means*, and exactly what a real function should do when it's violated, without needing the one real tool this project doesn't have yet?

> This project's own real division already refuses to answer "how many zeros fit into `10`" — not because the question is hard, but because it has no real answer at all. Is "what's the square root of `-1`" the same *kind* of unanswerable question, or a different kind — hard, but not truly undefined? If you tried computing a square root by counting upward from `0`, checking each candidate's own square against the target, and started that same count from a negative target instead, what would actually happen — a real error, or a count that simply never finds what it's looking for? If a real function's own input can be checked *before* any real computation runs, what real, honest thing should happen the moment that check fails — silently return something arbitrary, or say, clearly, that this specific input was never valid to begin with?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — two real, hand-written, integer-only functions, each with a genuine domain restriction of its own, deliberately shaped to preview exactly what real `sqrt` and `log` will eventually need to check:

```kotlin
fun integerSquareRoot(n: Int): Int {
    if (n < 0) {
        throw IllegalArgumentException("Cannot take the square root of a negative number: $n")
    }
    var candidate = 0
    while ((candidate + 1) * (candidate + 1) <= n) {
        candidate++
    }
    return candidate
}

fun integerLog2(n: Int): Int {
    if (n <= 0) {
        throw IllegalArgumentException("Cannot take the logarithm of a non-positive number: $n")
    }
    var value = n
    var count = 0
    while (value > 1) {
        value /= 2
        count++
    }
    return count
}

fun main() {
    println(integerSquareRoot(16))
    println(integerSquareRoot(17))
    println(integerLog2(8))
    try {
        integerSquareRoot(-1)
    } catch (e: IllegalArgumentException) {
        println("integerSquareRoot(-1) -> ${e.message}")
    }
    try {
        integerLog2(0)
    } catch (e: IllegalArgumentException) {
        println("integerLog2(0) -> ${e.message}")
    }
}
```

Compiled and run for real, this produced:

```
4
4
3
integerSquareRoot(-1) -> Cannot take the square root of a negative number: -1
integerLog2(0) -> Cannot take the logarithm of a non-positive number: 0
```

`integerSquareRoot(16)` returns `4` exactly — `4 × 4 = 16`. `integerSquareRoot(17)` also returns `4` — `17` isn't a perfect square, so this real function returns the largest whole number whose square doesn't exceed it, `⌊√17⌋`. `integerLog2(8)` returns `3` — `2³ = 8`, exactly. Both real functions check their own input *first*, before any real loop runs at all — and both real checks fire exactly where this unit's own name says they should: `integerSquareRoot(-1)` and `integerLog2(0)` each throw a real, specific, descriptive `IllegalArgumentException` instead of returning any number at all, correct or not. This is the real, concrete shape of a **domain error**: not a bug in either function's own real logic, but an honest, explicit report that the specific input given was never inside what the function is actually defined for.

### Discard the Throwaway Example

This `integerSquareRoot` and `integerLog2` are deleted now and will not appear in this project again. This project's own real division-by-zero handling is completely unmodified — this unit's own job was proving, concretely, what a domain restriction means and how a real function should respond to one, using integer-only arithmetic this project already has, before any real `sqrt` or `log` — needing real floating-point precision this project still doesn't have — gets built for real.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `fun integerSquareRoot(n: Int): Int` — a function declaration, already established, taking one `Int` and returning one.
- `if (n < 0) { throw IllegalArgumentException("Cannot take the square root of a negative number: $n") }` — the real domain check, running first: an already-established comparison, the real `throw` keyword documented above, constructing a real `IllegalArgumentException`, documented above, with a real string template, already established, embedding the actual invalid value.
- `var candidate = 0` — a `var`, already established, starting the search for the real integer square root at `0`.
- `while ((candidate + 1) * (candidate + 1) <= n)` — the real `while` loop documented above: as long as the *next* candidate's own square wouldn't overshoot `n`, it's safe to advance.
- `candidate++` — already established, advancing to the next candidate.
- `return candidate` — already established: once the loop stops, `candidate` is the largest whole number whose square doesn't exceed `n`.
- `fun integerLog2(n: Int): Int` — the identical real shape, for a different real operation.
- `if (n <= 0) { throw IllegalArgumentException("Cannot take the logarithm of a non-positive number: $n") }` — the real domain check for this function specifically: zero and every negative number are both outside `log`'s own real domain, not just negatives alone.
- `var value = n`, `var count = 0` — already established, `value` tracking the number as it shrinks, `count` tracking how many times it's been halved.
- `while (value > 1) { value /= 2; count++ }` — the real `while` loop documented above, using integer division, already established, repeatedly halving `value` and counting each halving, until `value` can't be halved again without going below `1`.
- `return count` — already established.
- `fun main()`, `println(integerSquareRoot(16))`, `println(integerSquareRoot(17))`, `println(integerLog2(8))` — already established, three real calls with valid, in-domain input.
- `try { integerSquareRoot(-1) } catch (e: IllegalArgumentException) { println("integerSquareRoot(-1) -> ${e.message}") }` — the real `try`/`catch` statement documented above, deliberately calling `integerSquareRoot` with an out-of-domain input, catching the real exception it throws, and reading its own real `message` property, documented above, to print exactly what went wrong.
- `try { integerLog2(0) } catch (e: IllegalArgumentException) { println("integerLog2(0) -> ${e.message}") }` — the identical real shape, for the other real function's own domain violation.

### CS Lens

A function explicitly checking its own real domain before attempting any real computation is a foundational, widely-reused real pattern, distinct from — and complementary to — an operation simply failing partway through, the way this project's own real division-by-zero already does automatically.

```
Also recognized in: every real math library's own documented domain
restrictions (real `sqrt`, real `log`, real `asin`/`acos` all
restrict their own real input), real input-validation code at any
API boundary, a real database's own constraint checks rejecting a
row before it's ever written, a real compiler's own type checker
rejecting code whose values could never be valid before it's ever run
```

### SE Lens

The alternative not chosen here: skip the explicit domain check entirely, and let each real function simply compute whatever its own real formula produces, even for genuinely invalid input — the same real shape this project's own division already has, where the JVM itself detects the real problem only partway through, not before. The real tradeoff: this project's own real division-by-zero fix already works precisely because integer division's own real failure is automatic and unambiguous — there's no way to silently produce a wrong-but-plausible-looking answer. A hand-written function like `integerSquareRoot`, computing its own real answer manually with a `while` loop, has no such automatic protection: without a real, explicit check, calling it with a negative number wouldn't throw at all — the loop's own condition, `(candidate + 1) * (candidate + 1) <= n`, would immediately be `false` for any negative `n`, since `1 * 1 = 1` is never `<=` a negative number, and the function would silently return `0`, a real, plausible-looking, completely wrong answer, with no error at all. Checking the real domain explicitly, first, is what turns a silent wrong answer into an honest, visible failure.

### Commands Needed

`kotlinc lab1_domain_errors.kt -include-runtime -d lab1.jar` compiles this file into a real, standalone, executable `.jar`, exactly as established throughout this project's own prior work; `java -jar lab1.jar` runs it.

### Run It

Real command run: `kotlinc lab1_domain_errors.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`. Real, executed output:

```
4
4
3
integerSquareRoot(-1) -> Cannot take the square root of a negative number: -1
integerLog2(0) -> Cannot take the logarithm of a non-positive number: 0
```

### Connect the Pieces

A domain error is now proven, concretely, to be a real, specific, honest kind of failure — not a bug, not an automatic crash, but an explicit, checked report that a real input was never valid to begin with — the exact real shape this slice's own coming `sqrt` and `log` will need to give their own real, negative and non-positive inputs, the moment real floating-point arithmetic makes those functions possible at all.

## Connect the Pieces

Follow one real question through both of this unit's own real functions. `integerSquareRoot(16)` and `integerSquareRoot(17)` both answered correctly, `4` both times, computed one real candidate at a time until the next one would overshoot — real, working proof the mechanism itself is sound. `integerSquareRoot(-1)` never reached that computation at all: a real, explicit check, running first, threw a real `IllegalArgumentException` naming exactly what was wrong, the moment the input was seen to be outside the function's own real domain. `integerLog2(8)` answered `3` the same honest way, and `integerLog2(0)` was rejected the identical real way — a domain restricted to positive numbers, checked explicitly, before any real halving began. This project's own real division-by-zero fix already proved, once, that a domain error deserves a real, honest report instead of either a silent wrong answer or an uncontrolled crash; this unit proved the identical real principle applies just as directly to functions this project hasn't built yet, using nothing but integer arithmetic it already has. Nothing about this project's own permanent code changed — no real `sqrt`, no real `log`, and no real domain-checking code exist in the real project yet. What exists now is a real, concrete understanding of exactly what those real functions will need to check, and exactly how they should fail, the moment this slice's own coming work finally gives them the real floating-point arithmetic to exist at all.
