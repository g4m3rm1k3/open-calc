# Lesson 5.10: The Answer Is Negative Twenty-Seven

**What you will build:** This slice's own opening lesson proved, with a real, executed probe, that this project could not correctly evaluate `3 + 5 × 2` — producing `10` instead of the correct `13`, because nothing in this project's original design let an operator wait its turn. Every lesson since has built one real piece of the fix: a real tokenizer, a real Shunting-Yard converter, a real tree, a real way to build that tree automatically. This lesson is the last piece. A real, recursive function reads this project's own real AST and computes what it actually means — and for the first time since this slice began, this project can evaluate its own real target expression, `3 + 5 × (2 − 8)`, to the one real number it has always equaled: `−27`.

**What you need to know first:** This project's own real, permanent `Node` and `buildTree`, and this project's own real, complete pipeline so far: `tokenize`, then `toPostfix`, then `buildTree`. Recursion, base case, and recursive case, established from this slice's own immediately preceding work. This project's own original real domain logic — `Operator`, `operatorSymbols`, and `Operation.apply` — unchanged since this project's very first real Android lesson.

## Terms used in this lesson

- **Evaluation** — the act of computing the one real value an expression, or an expression tree, actually represents. This word exists to name the specific, final step every stage of this slice's own work has been building toward: tokenizing, reordering, and tree-building all transform an expression's own *representation*, but none of them, by themselves, produce a number — evaluation is the one step that actually does.

## Objects and methods used

- **`fun evaluate(node: Node): Int`**
  - *What it is:* This project's own real, permanent, recursive function that computes the one real number a given AST represents.
  - *Implementation:* `fun evaluate(node: Node): Int`, a top-level, pure, recursive function, living in a new file, `Evaluator.kt`.
  - *Its use:* Given the real tree `buildTree` produces, `evaluate` is the one real function that finally turns it into the one real number it represents — the last stage of this project's own real expression pipeline.
  - *Type:* A top-level, pure, recursive function.
  - *Responsibility:* Computing the real value of a `Node` — a leaf's own real numeric value directly, or, for an internal node, its own operator applied to both of its own children's already-computed real values.
  - *Depends on:* A real `Node`, and, for any internal node, this project's own real `operatorSymbols` map to translate its own value back into a real `Operator`.
  - *Connects to:* Called directly by this lesson's own new, real tests, on trees produced by this project's own real `buildTree`; calls itself recursively, once per child, on every internal node; calls this project's own real `Operation.apply`, unchanged since this project's very first real Android lesson, to perform the actual arithmetic.
  - *Shape:* This project's own real, permanent, final stage of its coming expression evaluator — the one piece that finally closes the loop this slice opened.

**Everything else in the file, not this lesson's subject but still explained.**

- **`Node`**
  - *What it is:* This project's own real, permanent AST node type, already established from this slice's own immediately preceding lesson.
  - *Implementation:* `data class Node(val value: String, val left: Node? = null, val right: Node? = null)`.
  - *Its use:* `evaluate` reads a `Node`'s own `value`, `left`, and `right` directly to decide whether it's a leaf or an internal node, and, for an internal node, which two already-computed values its own operator applies to.
  - *Type:* A `data class`.
  - *Responsibility:* Representing one piece of a real AST's own structure.
  - *Depends on:* Nothing to construct a leaf; two already-built `Node`s for an internal one.
  - *Connects to:* Read, not modified, by `evaluate`.
  - *Shape:* This project's own real, permanent domain type, reappearing here unchanged.
- **`String.toInt()`**
  - *What it is:* A method parsing a `String` as an `Int`, throwing a real exception on failure, already established from this project's own real, shipped code.
  - *Implementation:* `fun String.toInt(): Int`, part of the Kotlin standard library — non-nullable return type, throwing rather than returning `null` on a failed parse.
  - *Its use:* `evaluate`'s own base case calls this on a leaf's own `value`, trusting — the same way this project's own real `nextState` already trusts it, and the same way this slice's own AST lesson already trusted `Map.getValue` — that a leaf built by this project's own real `buildTree` is always a real, valid number, since `buildTree` never constructs a leaf any other way.
  - *Type:* An extension function on `String`.
  - *Responsibility:* Producing a real numeric value from a string trusted, by the caller, to already look like one.
  - *Depends on:* The `String` it's called on.
  - *Connects to:* Called once, inside `evaluate`'s own base case.
  - *Shape:* A standard-library method, already load-bearing throughout this project's own real code, reappearing here in a genuinely new context.
- **`Map.getValue(key)`**
  - *What it is:* A method retrieving the value stored under a given key, throwing a real exception if the key isn't present, already established from this slice's own immediately preceding lesson.
  - *Implementation:* `fun <K, V> Map<K, V>.getValue(key: K): V`, part of the Kotlin standard library.
  - *Its use:* `evaluate` calls this on this project's own real `operatorSymbols` to translate an internal node's own `value` (a real symbol, like `"×"`) back into the real `Operator` constant it names.
  - *Type:* An extension function on `Map<K, V>`.
  - *Responsibility:* Retrieving a value the caller already knows must be present.
  - *Depends on:* The `Map` instance and the key being looked up.
  - *Connects to:* Called once per internal node `evaluate` processes.
  - *Shape:* A standard-library method, reappearing here unchanged.
- **`Operator` / `operatorSymbols` / `Operation.apply`**
  - *What it is:* This project's own real, original domain logic — an enum naming this project's five real arithmetic operations, a map from real keypad symbol to `Operator`, and the real method that actually performs one operation's own arithmetic — unchanged since this project's very first real Android lesson.
  - *Implementation:* `fun interface Operation { fun apply(current: Int, amount: Int): Int }`; `enum class Operator(val operation: Operation) { PLUS(Addition()), MINUS(Subtraction()), TIMES(Multiplication()), DIVIDE(Division()), MODULO(Modulo()) }`; `val operatorSymbols = mapOf("+" to Operator.PLUS, "−" to Operator.MINUS, "×" to Operator.TIMES, "÷" to Operator.DIVIDE)`.
  - *Its use:* `evaluate` calls `operator.operation.apply(evaluate(left), evaluate(right))` on every internal node — the exact same real method this project's own `nextState` has called for every Basic-mode `"="` press since this project's own first working calculator, now called for the first time from a completely different real caller.
  - *Type:* A `fun interface`, an `enum class`, and a top-level `Map`.
  - *Responsibility:* `Operation.apply` performs one real arithmetic operation; `Operator` names each of this project's five real operations and carries its own `Operation`; `operatorSymbols` connects a real keypad symbol to the `Operator` it means.
  - *Depends on:* `Operation.apply` depends on two real `Int`s; `Operator` depends on one real `Operation` per constant; `operatorSymbols` depends on nothing at runtime.
  - *Connects to:* Called by both `nextState` (Basic mode, since this project's own first working calculator) and now, for the first time, `evaluate` (this slice's own real expression pipeline) — two genuinely different real callers reaching the identical real arithmetic, real, concrete proof this project's own original domain logic was never tied to Basic mode's own specific design.
  - *Shape:* This project's own real, permanent, original domain logic — the oldest real code in this entire project, still doing exactly the same real job it always has.
- **`if` / `== null` / `!= null`**
  - *What it is:* Already-established control flow and null comparisons, from this project's own earliest real code.
  - *Implementation:* Ordinary conditional and equality checks.
  - *Its use:* `evaluate`'s own base-case check, distinguishing a leaf (both children `null`) from an internal node.
  - *Type:* Control flow and comparison operators.
  - *Responsibility:* Branching based on whether a real value is present.
  - *Depends on:* The nullable values being checked.
  - *Connects to:* Guards `evaluate`'s own early return.
  - *Shape:* Already-established Kotlin syntax, reappearing here unchanged.
- **`tokenize` / `toPostfix` / `buildTree`**
  - *What it is:* This project's own real, permanent pipeline functions, each already established from this slice's own prior three real-code lessons.
  - *Implementation:* Unchanged since each was written.
  - *Its use:* This lesson's own new tests chain all three together — `buildTree(toPostfix(tokenize(expression)))` — producing real input for `evaluate` directly from a raw expression string, the first time this project's own complete real pipeline has run start to finish.
  - *Type:* Top-level, pure functions.
  - *Responsibility:* Splitting a raw expression, reordering it into postfix, and building the equivalent tree.
  - *Depends on:* Each one's own real input, as already established.
  - *Connects to:* Composed together, for the first time all four deep, inside this lesson's own new tests.
  - *Shape:* This project's own real, permanent functions, reappearing here composed into a complete, working whole.
- **`org.junit.Assert.assertEquals`**
  - *What it is:* A real, static JUnit method comparing an expected value against an actual one, already established from this project's own real test files.
  - *Implementation:* One of twelve real, overloaded static methods on `org.junit.Assert`.
  - *Its use:* Each of this lesson's own two new tests calls it once, comparing a real, expected `Int` against `evaluate`'s own real, computed result.
  - *Type:* A `static` method.
  - *Responsibility:* Comparing two values for equality and halting the test with a real, informative failure message if they differ.
  - *Depends on:* Two values, expected and actual.
  - *Connects to:* Called once per test in `EvaluatorTest.kt`.
  - *Shape:* A standard, external JUnit API, reappearing here unchanged.
- **`@Test`**
  - *What it is:* An annotation marking a function as a real, executable test case, already established from this project's own real test files.
  - *Implementation:* A JUnit annotation, discovered and run automatically by a real test runner.
  - *Its use:* Marks each of this lesson's own two new test functions.
  - *Type:* An annotation.
  - *Responsibility:* Making a function recognizable as a test by real tooling.
  - *Depends on:* Nothing.
  - *Connects to:* Applied to each of `EvaluatorTest.kt`'s own two real functions.
  - *Shape:* Already-established JUnit vocabulary, reappearing here unchanged.
- **`package` declaration**
  - *What it is:* A statement naming which package a file belongs to, already established from every real file this project has.
  - *Implementation:* `package com.example.calculator`, at the top of both new files.
  - *Its use:* Puts `Evaluator.kt` in the same real package as `Calculator.kt`, `AST.kt`, and every other real file this project has — the concrete reason `evaluate` can call `operatorSymbols` and `EvaluatorTest.kt` can call `tokenize`, `toPostfix`, `buildTree`, and `evaluate` together, with no import needed for any of them.
  - *Type:* A file-level declaration.
  - *Responsibility:* Establishing which other declarations a file can reach without an explicit import.
  - *Depends on:* Nothing.
  - *Connects to:* Shared identically across every real file in this project's own source tree.
  - *Shape:* Already-established Kotlin vocabulary, reappearing here unchanged.

## Concept Unit: Evaluating a Real AST

### The Problem

This project's own real pipeline can now turn `"3+5×(2−8)"` into a real, correctly-shaped tree — but a tree, by itself, is not a number. This project's own original domain logic, `Operator`/`Operation.apply`, has been able to perform real arithmetic since this project's very first Android lesson — but it has only ever been called from one place, `nextState`, reacting to one button press against one pending operator. Nothing yet reads an entire tree and produces the one real value it represents.

> A leaf node holds nothing but a number, like `"3"` — what should evaluating it produce? An internal node holds an operator and two children, each of which might itself be another internal node — if you already trusted a recursive call on the left child to correctly compute *that* subtree's own real value, and the same for the right, what real, single step is left to finish evaluating the node itself? This project's own `Operation.apply` already knows how to combine two real numbers with one real operator — does evaluating a tree need anything genuinely new, or is it this slice's own already-proven recursion, finally reaching all the way down to real arithmetic this project already had?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — a real, executed proof that a tree can be evaluated recursively, using the exact real tree shape this slice has now built four separate times:

```kotlin
class Node(val value: String, val left: Node? = null, val right: Node? = null)

fun evaluate(node: Node): Int {
    val left = node.left
    val right = node.right
    if (left == null || right == null) {
        return node.value.toInt()
    }
    val leftResult = evaluate(left)
    val rightResult = evaluate(right)
    return when (node.value) {
        "+" -> leftResult + rightResult
        "-" -> leftResult - rightResult
        "*" -> leftResult * rightResult
        "/" -> leftResult / rightResult
        else -> throw IllegalArgumentException("Unknown operator: ${node.value}")
    }
}

fun main() {
    val tree = Node("+", Node("3"), Node("*", Node("5"), Node("-", Node("2"), Node("8"))))
    println(evaluate(tree))
}
```

Compiled and run for real, this produced:

```
-27
```

Tracing `evaluate` on this tree — the identical real shape this slice has now built four separate times, this time actually computed:

1. `evaluate(root)` — `root.value` is `"+"`, and both `left` (`Node("3")`) and `right` (`Node("×"...)`) are present, so this is **not** the base case. Before this node's own operator can run, both children need their own real values first.
2. `evaluate(left)` — `Node("3")` has no children at all, so the **base case** applies immediately: `"3".toInt()` returns `3`.
3. `evaluate(right)` — `Node("*", Node("5"), Node("-", Node("2"), Node("8")))` also has children, so it recurses the same way: `evaluate` on its own left child, `Node("5")`, hits the base case and returns `5`. `evaluate` on its own right child, `Node("-", Node("2"), Node("8"))`, recurses once more — both `Node("2")` and `Node("8")` are base cases, returning `2` and `8` — and `"-"` combines them: `2 - 8 = -6`.
4. Back in step 3's own call, `"*"` combines its own two already-computed results: `5 * -6 = -30`.
5. Back in step 1's own call, `"+"` combines *its* own two results — `3` from step 2, `-30` from step 3 — producing the real, final answer: `3 + -30 = -27`.

The real, executed output, `-27`, matches this trace exactly — and matches the one real number `3 + 5 × (2 − 8)` has always actually equaled, confirmed here for the first time by running real code rather than doing the arithmetic by hand.

### Discard the Throwaway Example

This throwaway `Node` and `evaluate` are deleted now. What follows reads this project's own real, permanent tree using this project's own real, original arithmetic, rather than a generic reimplementation of it.

### Project Change

- **Reference Source** — No reference counterpart. This is a from-scratch addition — the real algorithm proven correct moments ago, in this same lesson's own isolated lab, now connected to this project's own real, existing `Operator`/`Operation.apply`.
- **Files affected** — Two new files: `app/src/main/java/com/example/calculator/Evaluator.kt` and `app/src/test/java/com/example/calculator/EvaluatorTest.kt`.
- **Change type** — Add.
- **Location** — Both are brand-new files. `Evaluator.kt` sits alongside `AST.kt`, `ShuntingYard.kt`, and `Tokenizer.kt`: computing a tree's own value is a distinct responsibility from building that tree, the same real Cohesion reasoning already applied three times in this slice.
- **Dependencies** — None beyond what this project already has — no new Gradle dependency; `evaluate` needs only `Node` (from `AST.kt`) and `operatorSymbols` (from `Calculator.kt`), both already in the same real package.

### The New Code

```kotlin
fun evaluate(node: Node): Int {
    val left = node.left
    val right = node.right
    if (left == null || right == null) {
        return node.value.toInt()
    }
    val operator = operatorSymbols.getValue(node.value)
    return operator.operation.apply(evaluate(left), evaluate(right))
}
```

This is the whole of `Evaluator.kt`'s own real content — nothing surrounding it to show, since this is a brand-new file.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order (the isolated lab's identical recursive shape was already fully traced, step by step, above; this walkthrough highlights what's genuinely different in the real, permanent version):

- `fun evaluate(node: Node): Int` — a function declaration, already established, taking this project's own real `Node` type and returning `Int`.
- `val left = node.left` / `val right = node.right` — already established, reading both children into local `val`s.
- `if (left == null || right == null) { return node.value.toInt() }` — the real **base case**: if either child is missing, this node must be a leaf (since `buildTree` only ever constructs a node with *both* children or *neither*), so its own value is read directly as a real number, via the real `String.toInt()` method documented above; reading `left`/`right` into local `val`s first, rather than checking `node.left`/`node.right` directly, is what lets the compiler smart-cast both to non-null for the rest of the function, avoiding `!!` entirely.
- `val operator = operatorSymbols.getValue(node.value)` — the real **recursive case** begins here: the real `Map.getValue` method documented above, translating this node's own operator symbol back into the real `Operator` it names, using this project's own real, original lookup table.
- `return operator.operation.apply(evaluate(left), evaluate(right))` — the real recursive case's own final step: two real recursive calls, `evaluate(left)` and `evaluate(right)`, each computing one child's own real value, passed directly into this project's own real `Operation.apply` — the exact same real method `nextState` has called since this project's very first working calculator, now performing the identical real arithmetic for a tree instead of a single pending operator.

### CS Lens

Recursively evaluating a tree whose own shape mirrors a recursive function's own structure is the natural, final step of the same pattern this slice's own AST lesson already named — reading a tree back, rather than building one.

```
Also recognized in: every real compiler or interpreter's own tree-
walking evaluator (exactly what this unit's own real code now is),
a spreadsheet engine evaluating a formula's own dependency tree, any
real expression-evaluation library, a real calculator app's own
internal implementation, wherever one genuinely exists as an AST
rather than being computed some other way
```

### SE Lens

The alternative not chosen here: give `evaluate` its own, separate arithmetic logic — a `when` block directly computing `+`/`−`/`×`/`÷`, the way this unit's own isolated lab did — instead of reusing this project's own real `Operator`/`Operation.apply`. The real tradeoff: a separate `when` block would work, and would need nothing from `Calculator.kt` at all — but it would mean this project's own arithmetic rules exist in *two* real places, `Operation`'s own five real classes and a second, independent copy inside `evaluate`, with no guarantee the two ever agree, and no reason for a future bug fix in one to reach the other. Reusing `operatorSymbols`/`Operation.apply` directly means Basic mode and this project's own coming expression evaluator share the *exact same* real arithmetic, by construction — division by zero would throw the identical real `ArithmeticException` in both, the same real exception this project already caught once, for Basic mode, converting it into a safe `"Error"` display instead of a crash; a fix to that shared arithmetic would apply to both without any separate work. Genuinely catching that same exception here, for a real Scientific-mode screen, remains a real, deliberately deferred, honest gap — there is no real UI yet to catch it in.

### Commands Needed

`kotlinc lab1_evaluate_tree.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`, for the isolated lab, exactly as established throughout this slice. For the real project: `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.EvaluatorTest"` runs only this lesson's own new tests; `./gradlew :app:testDebugUnitTest :app:assembleDebug` runs this project's own complete real suite and produces a real, installable `.apk`.

### Run It

Real, permanent test file, `EvaluatorTest.kt`:

```kotlin
package com.example.calculator

import org.junit.Assert.assertEquals
import org.junit.Test

class EvaluatorTest {
    @Test
    fun evaluatingTheProjectsOwnTargetExpressionProducesTheCorrectRealAnswer() {
        // Arrange
        val tree = buildTree(toPostfix(tokenize("3+5×(2−8)")))

        // Act
        val result = evaluate(tree)

        // Assert
        assertEquals(-27, result)
    }

    @Test
    fun evaluatingTheSimplerPrecedenceCaseFromEarlierInThisSliceProducesTheCorrectAnswer() {
        // Arrange
        val tree = buildTree(toPostfix(tokenize("3+5×2")))

        // Act
        val result = evaluate(tree)

        // Assert
        assertEquals(13, result)
    }
}
```

Real command run: `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.EvaluatorTest" --rerun-tasks`, producing:

```
BUILD SUCCESSFUL in 3s
27 actionable tasks: 27 executed
```

Both of this lesson's own new tests passed for real. The first is this project's own real, complete pipeline, running start to finish for the first time: `tokenize`, `toPostfix`, `buildTree`, and now `evaluate`, together, on this project's own real target expression — the real, computed result, `-27`, is the exact number this whole slice has been building toward since its own opening lesson. The second closes the specific, simpler gap that opening lesson actually proved: `evaluate` on `"3+5×2"` produces `13`, not the `10` this project's own real, unmodified `nextState` has produced since this slice began. A full, real run of this project's own complete suite, `./gradlew :app:testDebugUnitTest :app:assembleDebug --rerun-tasks`, produced:

```
com.example.calculator.HapticsTest > pressingKeypadButtonTriggersHapticFeedback FAILED
    androidx.test.espresso.AppNotIdleException at HapticsTest.kt:35

com.example.calculator.ThemeTest > calculatorThemeProvidesRealCustomPrimaryColor FAILED
    androidx.test.espresso.AppNotIdleException at ThemeTest.kt:29

36 tests completed, 2 failed
```

Thirty-six real tests now exist in this project — the prior thirty-four plus this lesson's own two new ones — and neither of this lesson's own tests is among the two real failures shown here: both are the same already-documented, pre-existing, intermittent flake this project has already found and confirmed unrelated more than once. A separate, real, immediately-following run, forced fresh via `--rerun-tasks`, produced a fully clean result instead:

```
BUILD SUCCESSFUL in 8s
43 actionable tasks: 43 executed
```

confirming this project's own complete real suite, all thirty-six tests, genuinely does pass together, and that a real, installable `.apk` still builds successfully with `Evaluator.kt` now part of this project's own real source.

### Connect the Pieces

The one real piece this entire slice has been missing since its own opening lesson now exists: a real function that reads a real tree and produces the real number it represents, using this project's own original, unmodified arithmetic — closing, completely, the exact gap this slice opened with.

## Connect the Pieces

Follow this project's own real target expression through its own now-complete real pipeline. `"3+5×(2−8)"` becomes nine real tokens, then a real postfix sequence, then a real tree — all already proven, across this slice's own prior four real-code lessons. This lesson's own real `evaluate` function, given that tree, computed its own real value the same way this slice's own Recursion lesson already proved general tree-processing works: a base case for each real leaf, reading its own numeric value directly; a recursive case for each real internal node, trusting its own two recursive calls to already have the correct values for its own children, then combining them with this project's own real, original `Operation.apply` — the identical real method `nextState` has called since this project's very first working calculator. The real, computed result, confirmed by a real, executed test chaining all four real pipeline stages together for the first time, is `-27` — exactly, and for the first time verified by running real code rather than doing arithmetic by hand, the one real number `3 + 5 × (2 − 8)` has always equaled. A second real test closed the specific, simpler gap this slice's own opening lesson proved: `3 + 5 × 2` now evaluates to the correct `13`, not the `10` this project's own real, unmodified Basic mode has produced the entire time this slice has been running. Thirty-six real tests now pass. Nothing about `CalculatorState`, `nextState`, or this project's existing real, shipped Basic-mode behavior changed — every real function this slice has built, from `tokenize` through `evaluate`, exists as new, additive, fully tested capability, composed together for the first time in this lesson's own real tests, with no real UI caller yet. What began, in this slice's own opening lesson, as a real, executed proof that this project could not evaluate its own real target expression correctly, ends here with a real, executed proof that it now can.
