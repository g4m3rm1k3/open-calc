# Lesson 5.9: The Tree That Finally Stayed

**What you will build:** This slice's own Trees lesson built this project's own real expression tree by hand, once, and discarded it. This slice's own Recursion lesson built the identical tree again, by hand, a second time, and discarded that one too. Both times, the tree was proven correct — but never kept. This lesson finally keeps it: a real, permanent `Node` type, and a real, permanent function that *builds* a tree automatically from any real postfix token list, rather than requiring seven hand-typed `val` declarations every time. By the end, this project's own real pipeline — `tokenize`, then `toPostfix`, then this lesson's own new `buildTree` — runs start to finish on this project's own real target expression for the first time, proven by a real, executed test that chains all three together.

**What you need to know first:** This project's own real `tokenize` and `toPostfix` functions, and this slice's own real, already-proven expression tree shape for `3 + 5 × (2 − 8)`. Data classes and the real, structural `equals()` they generate, established since this project's own early work. Recursion, base case, and recursive case, established from this slice's own immediately preceding lesson.

## Terms used in this lesson

- **Abstract Syntax Tree (AST)** — a tree that represents an expression's own real grammatical structure — which operator applies to which operands, and how deeply nested each part is — rather than the raw sequence of characters or tokens the expression was originally written in. This word exists to name this *specific* real use of a tree: "abstract" because it discards irrelevant surface detail an expression's own raw text carries (this project's real AST for `3 + 5 × (2 − 8)` needs no parentheses at all — the tree's own shape already encodes exactly what they were for); "syntax tree" because what it represents is the expression's own grammatical structure, not its computed value.

## Objects and methods used

- **`data class Node(val value: String, val left: Node? = null, val right: Node? = null)`**
  - *What it is:* This project's own real, permanent type representing one piece of a real Abstract Syntax Tree — a value, and, optionally, a left and right child.
  - *Implementation:* `data class Node(val value: String, val left: Node? = null, val right: Node? = null)`, living in a new file, `AST.kt` — the identical real shape this slice's own Trees and Recursion lessons already proved twice as a throwaway `class`, now a real, permanent `data class`.
  - *Its use:* Every real node in this project's own expression trees — leaves holding a number, internal nodes holding an operator with two real children — is a `Node`.
  - *Type:* A `data class` with three constructor properties, two of them nullable and defaulted.
  - *Responsibility:* Representing exactly one piece of a tree's own structure — nothing about how a whole tree gets built or read, both of which are other functions' own jobs.
  - *Depends on:* Nothing to construct a leaf (`left`/`right` default to `null`); an internal node depends on two already-built `Node`s to reference as children.
  - *Connects to:* Built, repeatedly, by `buildTree` (below); read by whatever future lesson evaluates a real tree.
  - *Shape:* This project's own real, permanent domain type — the first time this exact shape has outlived the lesson that built it.
- **`fun buildTree(postfix: List<String>): Node`**
  - *What it is:* This project's own real, permanent function that constructs a complete, real AST from a real postfix token list, automatically.
  - *Implementation:* `fun buildTree(postfix: List<String>): Node`, living in the same new file, `AST.kt`, alongside `Node`.
  - *Its use:* Given this project's own real `toPostfix`'s own output, `buildTree` produces the exact real tree this slice has now proven, by hand, twice — automatically, for any valid postfix sequence, not just this project's own one target expression.
  - *Type:* A top-level, pure function.
  - *Responsibility:* Turning a flat, correctly-ordered postfix sequence into the equivalent tree structure — and nothing about whether that sequence is actually valid postfix in the first place, a deliberately separate concern, per this slice's own opening lesson's own already-established Grammar/Tokenizing split.
  - *Depends on:* A real `List<String>` already in valid postfix order.
  - *Connects to:* Called directly by this lesson's own new, real tests, using this project's own real `tokenize` and `toPostfix` functions to produce its own real input for the first time — the first real, executed proof this project's separately-built pipeline stages actually compose.
  - *Shape:* This project's own real, permanent third stage of its coming expression evaluator — tokens in, a postfix sequence in the middle, a real tree out.

**Everything else in the file, not this lesson's subject but still explained.**

- **`mutableListOf<T>()` / `MutableList<T>`, `MutableList.add(element)`, `MutableList.removeAt(index)`**
  - *What it is:* The real standard-library collection type and methods already established throughout this slice's own Stack, Queue, and Trees lessons.
  - *Implementation:* `fun <T> mutableListOf(): MutableList<T>`; `fun add(element: E): Boolean`; `fun removeAt(index: Int): T` — all part of the Kotlin standard library.
  - *Its use:* `buildTree` uses a plain `MutableList<Node>` as an explicit stack, in the identical shape this slice's own Stack lesson already proved — deliberately not this project's own real, permanent `Stack` class, since that class is built specifically to hold `String`, and making it generic enough to also hold `Node` would need real generics, deliberately still outside this curriculum's own current scope.
  - *Type:* A factory function and two instance methods.
  - *Responsibility:* Growable, ordered, indexable storage.
  - *Depends on:* The list instance and, where relevant, an index or element.
  - *Connects to:* `add` pushes a real `Node` onto `buildTree`'s own internal stack; `removeAt(size - 1)` pops one back off, real LIFO order, exactly as this slice's own Stack lesson proved.
  - *Shape:* Standard-library data structure and methods, reappearing here unchanged.
- **`String.toIntOrNull()`**
  - *What it is:* A method attempting to parse a `String` as an `Int`, returning `null` on failure, already established from this slice's own opening lesson.
  - *Implementation:* `fun String.toIntOrNull(): Int?`, part of the Kotlin standard library.
  - *Its use:* `buildTree`'s own first check, on every token, is whether it's a real number — deciding whether to push a new leaf directly, or to combine two already-built nodes under a new operator node instead.
  - *Type:* An extension function on `String`.
  - *Responsibility:* Attempting a numeric parse and reporting success or failure through its own return type.
  - *Depends on:* The `String` it's called on.
  - *Connects to:* Called once per token, first, inside `buildTree`'s own `if` check.
  - *Shape:* A standard-library method, reappearing here unchanged.
- **`for` loop**
  - *What it is:* Already-established iteration over a collection, from this project's own earliest real code.
  - *Implementation:* `for (token in postfix)`, iterating a real `List<String>`.
  - *Its use:* Walks every real token in `buildTree`'s own input, once each, in order.
  - *Type:* A control-flow construct.
  - *Responsibility:* Running its body once per element of the collection it iterates.
  - *Depends on:* The collection being iterated.
  - *Connects to:* Wraps `buildTree`'s own entire per-token decision.
  - *Shape:* Already-established Kotlin syntax, reappearing here unchanged.
- **Compiler-generated `equals()` / `hashCode()` / `toString()`**
  - *What it is:* The real methods every `data class` receives automatically, already established from this project's own real, permanent data classes.
  - *Implementation:* Generated by the compiler from a `data class`'s own constructor properties — `equals()` compares every property structurally; `hashCode()` is consistent with it; `toString()` prints every property by name.
  - *Its use:* This lesson's own new tests compare two real, separately-constructed `Node` trees with `assertEquals` — possible, and meaningful, only because `Node`'s own real `equals()` compares every value and every child structurally, all the way down, rather than only asking whether the two are the exact same object in memory.
  - *Type:* Compiler-generated instance methods, present on every `data class` automatically.
  - *Responsibility:* Answering "are these two values structurally the same," not "are these two references to the exact same object."
  - *Depends on:* The full, real, nested structure of both `Node`s being compared.
  - *Connects to:* Called implicitly by `assertEquals` inside both of this lesson's own new tests, and, recursively, by every nested `Node.equals()` call that comparison triggers along the way — a leaf's own generated `equals()` short-circuits correctly since both its own `left`/`right` are `null` on both sides.
  - *Shape:* Compiler-generated, standard behavior — the concrete, motivated reason `Node` is a `data class` here rather than the plain `class` this slice's own throwaway versions used, since only a `data class` gives real, structural equality for free.
- **`tokenize` / `toPostfix`**
  - *What it is:* This project's own real, permanent functions, already established from this slice's own prior two real-code lessons.
  - *Implementation:* `fun tokenize(expression: String): List<String>`; `fun toPostfix(tokens: List<String>): List<String>` — both unchanged since they were written.
  - *Its use:* This lesson's own first new test chains both together — `toPostfix(tokenize("3+5×(2−8)"))` — producing real input for `buildTree` directly from this project's own real target expression, the first time all three of this project's own real pipeline stages have actually run together, in sequence, for real.
  - *Type:* Top-level, pure functions.
  - *Responsibility:* Splitting a raw expression into tokens; reordering those tokens into postfix.
  - *Depends on:* Each one's own real input, as already established.
  - *Connects to:* Composed directly, for the first time, inside this lesson's own new test.
  - *Shape:* This project's own real, permanent functions — reappearing here not just individually, but *composed*, for the first time.
- **`org.junit.Assert.assertEquals`**
  - *What it is:* A real, static JUnit method comparing an expected value against an actual one, already established from this project's own real test files.
  - *Implementation:* One of twelve real, overloaded static methods on `org.junit.Assert`.
  - *Its use:* Each of this lesson's own two new tests calls it once, comparing a real, hand-constructed expected `Node` tree against whatever `buildTree` actually returned.
  - *Type:* A `static` method.
  - *Responsibility:* Comparing two values for equality and halting the test with a real, informative failure message if they differ.
  - *Depends on:* Two values, expected and actual.
  - *Connects to:* Called once per test in `ASTTest.kt`, relying directly on `Node`'s own real, structural `equals()`, documented above.
  - *Shape:* A standard, external JUnit API, reappearing here unchanged.
- **`@Test`**
  - *What it is:* An annotation marking a function as a real, executable test case, already established from this project's own real test files.
  - *Implementation:* A JUnit annotation, discovered and run automatically by a real test runner.
  - *Its use:* Marks each of this lesson's own two new test functions.
  - *Type:* An annotation.
  - *Responsibility:* Making a function recognizable as a test by real tooling.
  - *Depends on:* Nothing.
  - *Connects to:* Applied to each of `ASTTest.kt`'s own two real functions.
  - *Shape:* Already-established JUnit vocabulary, reappearing here unchanged.
- **`package` declaration**
  - *What it is:* A statement naming which package a file belongs to, already established from every real file this project has.
  - *Implementation:* `package com.example.calculator`, at the top of both new files.
  - *Its use:* Puts `AST.kt` in the same real package as `Tokenizer.kt` and `ShuntingYard.kt` — the concrete reason `ASTTest.kt` can call `tokenize`, `toPostfix`, and `buildTree` together, with no import needed for any of them.
  - *Type:* A file-level declaration.
  - *Responsibility:* Establishing which other declarations a file can reach without an explicit import.
  - *Depends on:* Nothing.
  - *Connects to:* Shared identically across every real file in this project's own source tree.
  - *Shape:* Already-established Kotlin vocabulary, reappearing here unchanged.

## Concept Unit: Building a Real AST From a Real Postfix Sequence

### The Problem

This slice has now proven, twice, by hand, that this project's own real target expression forms one specific, correct tree — but "by hand" means seven separate `val` declarations, written out fresh, every single time. This project's own real `toPostfix` already produces the flat sequence `["3", "5", "2", "8", "−", "×", "+"]` automatically, for any expression, not just this one — is there a way to turn *that* automatically into the equivalent tree, the same way, without hand-typing a single `Node`?

> Look at the postfix sequence `["3", "5", "2", "8", "−", "×", "+"]` one token at a time. The first four are all numbers — what would it mean to just set each one aside as its own tiny, one-node tree, in order? The fifth token, `"−"`, is the first operator — given the two most recently set-aside trees are `"2"` and `"8"`, what would combining them under a new `"−"` node actually look like? If you kept doing that — combine the two most recent pending trees under the next operator, every time one shows up — what structure feels like the natural place to keep track of "the trees built so far, most recent easiest to reach"?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — a real, executed proof that a postfix sequence can be turned into a tree automatically, and that two separately-built trees can be compared directly for real, structural equality:

```kotlin
data class Node(val value: String, val left: Node? = null, val right: Node? = null)

fun buildTree(postfix: List<String>): Node {
    val stack = mutableListOf<Node>()
    for (token in postfix) {
        if (token.toIntOrNull() != null) {
            stack.add(Node(token))
        } else {
            val right = stack.removeAt(stack.size - 1)
            val left = stack.removeAt(stack.size - 1)
            stack.add(Node(token, left, right))
        }
    }
    return stack.removeAt(stack.size - 1)
}

fun main() {
    val tree = buildTree(listOf("3", "5", "2", "8", "-", "*", "+"))
    println(tree)

    val expected = Node("+", Node("3"), Node("*", Node("5"), Node("-", Node("2"), Node("8"))))
    println(tree == expected)
}
```

Compiled and run for real, this produced:

```
Node(value=+, left=Node(value=3, left=null, right=null), right=Node(value=*, left=Node(value=5, left=null, right=null), right=Node(value=-, left=Node(value=2, left=null, right=null), right=Node(value=8, left=null, right=null))))
true
```

Tracing `buildTree(["3", "5", "2", "8", "-", "*", "+"])` — a `MutableList<Node>` standing in as an explicit stack, the identical real mechanism this slice's own Stack lesson already proved:

1. `token = "3"` — `"3".toIntOrNull()` succeeds, so a new leaf, `Node("3")`, is pushed directly. `stack = [Node("3")]`.
2. `token = "5"` — the same shape: push `Node("5")`. `stack = [Node("3"), Node("5")]`.
3. `token = "2"` — push `Node("2")`. `stack = [Node("3"), Node("5"), Node("2")]`.
4. `token = "8"` — push `Node("8")`. `stack = [Node("3"), Node("5"), Node("2"), Node("8")]`.
5. `token = "-"` — not a number, so the operator branch runs: `right = stack.removeAt(stack.size - 1)` pops `Node("8")` (the most recently pushed — real LIFO order); `left = stack.removeAt(stack.size - 1)` pops `Node("2")` next. A new node, `Node("-", Node("2"), Node("8"))`, combining both under the operator, is pushed. `stack = [Node("3"), Node("5"), Node("-", 2, 8)]`.
6. `token = "*"` — the same operator shape: pop `right = Node("-", 2, 8)`, pop `left = Node("5")`, push `Node("*", Node("5"), Node("-", 2, 8))`. `stack = [Node("3"), Node("*", 5, (-,2,8))]`.
7. `token = "+"` — the final operator: pop `right = Node("*", 5, (-,2,8))`, pop `left = Node("3")`, push `Node("+", Node("3"), Node("*", 5, (-,2,8)))`. `stack = [Node("+", 3, (*,5,(-,2,8)))]` — exactly one tree left.
8. `return stack.removeAt(stack.size - 1)` — the one remaining tree, popped and returned as the real, complete result.

The real, printed structure matches this trace exactly, and `tree == expected` prints `true` — real, structural proof, not merely a visual match: `Node`'s own compiler-generated `equals()` compared every value and every child, all the way down, and found them identical.

### Discard the Throwaway Example

This throwaway `Node` and `buildTree` are deleted now. What follows is the identical real mechanism, written into this project's own actual source tree for the first time — a tree this slice has now proven correct three separate times finally gets to stay.

### Project Change

- **Reference Source** — No reference counterpart. This is a from-scratch addition, implementing a well-known real algorithm (building an expression tree from postfix, the natural counterpart to Shunting-Yard) — proven correct moments ago, in this same lesson's own isolated lab.
- **Files affected** — Two new files: `app/src/main/java/com/example/calculator/AST.kt` (`Node` and `buildTree`) and `app/src/test/java/com/example/calculator/ASTTest.kt`.
- **Change type** — Add.
- **Location** — Both are brand-new files. `AST.kt` sits alongside `Tokenizer.kt` and `ShuntingYard.kt`: building a tree from an already-ordered token sequence is a distinct responsibility from either tokenizing raw text or reordering tokens by precedence, the same real Cohesion reasoning already applied twice in this slice.
- **Dependencies** — None beyond what this project already has.

### The New Code

```kotlin
data class Node(val value: String, val left: Node? = null, val right: Node? = null)

fun buildTree(postfix: List<String>): Node {
    val stack = mutableListOf<Node>()
    for (token in postfix) {
        if (token.toIntOrNull() != null) {
            stack.add(Node(token))
        } else {
            val right = stack.removeAt(stack.size - 1)
            val left = stack.removeAt(stack.size - 1)
            stack.add(Node(token, left, right))
        }
    }
    return stack.removeAt(stack.size - 1)
}
```

This is the whole of `AST.kt`'s own real content — nothing surrounding it to show, since this is a brand-new file.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order (the isolated lab's identical shape was already fully enumerated, step by step, in this unit's own execution trace above; this walkthrough highlights what's newly permanent):

- `data class Node(val value: String, val left: Node? = null, val right: Node? = null)` — already established from the Header's own entry, above: a `data class`, deliberately chosen over a plain `class` specifically so two separately-built trees can be compared with real, structural `==`.
- `fun buildTree(postfix: List<String>): Node` — a function declaration, already established.
- `val stack = mutableListOf<Node>()` — a real, empty `MutableList<Node>`, documented above, serving as this function's own explicit stack.
- `for (token in postfix)` — already established.
- `if (token.toIntOrNull() != null)` — the real standard-library method documented above, distinguishing a number token from an operator token.
- `stack.add(Node(token))` — pushing a new leaf, already established.
- `else` — the operator branch, running for any token that isn't a number.
- `val right = stack.removeAt(stack.size - 1)` — popping the most recently pushed tree, already established, real LIFO order.
- `val left = stack.removeAt(stack.size - 1)` — popping the next one, which — because it was pushed *before* the one just popped — is correctly the *left* operand.
- `stack.add(Node(token, left, right))` — pushing one new, combined tree, the operator token as its own value, the two just-popped trees as its real children.
- `return stack.removeAt(stack.size - 1)` — already established: by the time every token has been processed, exactly one tree remains on the stack — the complete result.

### CS Lens

Building a tree from a linear, already-ordered token sequence — the natural counterpart to reading a tree back out in that same order — is exactly the second half of the real relationship this slice's own Trees lesson first revealed between a tree and its own linearized form.

```
Also recognized in: every real compiler or interpreter's own parser
(building an AST is usually its single most important real job),
JSON and XML parsers building an in-memory document tree from raw
text, any real expression-evaluation library reconstructing structure
from a flat, serialized form
```

### SE Lens

The alternative not chosen here: keep building this project's own real expression tree by hand, one `val` per node, the way this slice's own Trees and Recursion lessons both did. The real tradeoff: hand-building only ever works for one expression this project's own author already knows the shape of — it cannot handle a real expression a real user actually types, since nobody can hand-write `val` declarations for input that doesn't exist yet. `buildTree` trades that one-time convenience for real generality: given any correctly-formed postfix sequence, not just this project's own one example, it produces the equivalent tree automatically — the real, necessary shape a genuine calculator's own expression evaluator needs, rather than a fixed demonstration of one already-known case.

### Commands Needed

`kotlinc lab1_build_tree.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`, for the isolated lab, exactly as established throughout this slice. For the real project: `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ASTTest"` runs only this lesson's own new tests; `./gradlew :app:testDebugUnitTest :app:assembleDebug` runs this project's own complete real suite and produces a real, installable `.apk`.

### Run It

Real, permanent test file, `ASTTest.kt`:

```kotlin
package com.example.calculator

import org.junit.Assert.assertEquals
import org.junit.Test

class ASTTest {
    @Test
    fun buildingTheTreeFromTheProjectsOwnTargetExpressionMatchesTheExpectedShape() {
        // Arrange
        val postfix = toPostfix(tokenize("3+5×(2−8)"))

        // Act
        val tree = buildTree(postfix)

        // Assert
        val expected = Node("+", Node("3"), Node("×", Node("5"), Node("−", Node("2"), Node("8"))))
        assertEquals(expected, tree)
    }

    @Test
    fun buildingATreeFromASingleOperatorProducesOneNodeWithTwoLeaves() {
        // Arrange
        val postfix = listOf("3", "5", "+")

        // Act
        val tree = buildTree(postfix)

        // Assert
        assertEquals(Node("+", Node("3"), Node("5")), tree)
    }
}
```

Real command run: `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ASTTest" --rerun-tasks`, producing:

```
BUILD SUCCESSFUL in 7s
27 actionable tasks: 27 executed
```

Both of this lesson's own new tests passed for real. The first is this project's own real pipeline, running start to finish for the first time: `tokenize("3+5×(2−8)")` produces this project's own real nine tokens; `toPostfix` reorders them into `["3", "5", "2", "8", "−", "×", "+"]`; `buildTree` turns that into a real tree — and `assertEquals` confirmed, via `Node`'s own real, structural equality, that the result is exactly the tree this slice has now proven correct three separate times. A full, real run of this project's own complete suite, `./gradlew :app:testDebugUnitTest :app:assembleDebug --rerun-tasks`, produced:

```
com.example.calculator.HapticsTest > pressingKeypadButtonTriggersHapticFeedback FAILED
    androidx.test.espresso.AppNotIdleException at HapticsTest.kt:35

com.example.calculator.ThemeTest > calculatorThemeProvidesRealCustomPrimaryColor FAILED
    androidx.test.espresso.AppNotIdleException at ThemeTest.kt:29

34 tests completed, 2 failed
```

Thirty-four real tests now exist in this project — the prior thirty-two plus this lesson's own two new ones — and neither of this lesson's own tests is among the two real failures shown here: both are the same already-documented, pre-existing, intermittent flake this project has already found and confirmed unrelated more than once. A separate, real, immediately-following run, forced fresh via `--rerun-tasks`, produced a fully clean result instead:

```
BUILD SUCCESSFUL in 9s
43 actionable tasks: 43 executed
```

confirming this project's own complete real suite, all thirty-four tests, genuinely does pass together, and that a real, installable `.apk` still builds successfully with `AST.kt` now part of this project's own real source.

### Connect the Pieces

The tree this slice has now built correctly three separate times finally has a permanent home, and a real, automatic way to build it from any postfix sequence — closing this lesson's own opening question and completing the exact real pipeline this project's own expression evaluator will finish building on next.

## Connect the Pieces

Follow this project's own real target expression through its own complete real pipeline for the first time. `"3+5×(2−8)"`, passed to this project's own real `tokenize`, produces nine real tokens; passed on to this project's own real `toPostfix`, those become `["3", "5", "2", "8", "−", "×", "+"]`; passed, for the first time, to this lesson's own new, real `buildTree`, that sequence becomes a real, permanent `Node` tree — proven, by a real, executed test relying on `Node`'s own real, structural equality, to be exactly the tree this slice has now confirmed correct three independent ways: by hand in this slice's own Trees lesson, by a general recursive function in this slice's own Recursion lesson, and now, automatically, from this project's own real postfix output. A second real test confirmed the mechanism generalizes past this one example, correctly building a tree from a simpler, single-operator sequence too. Thirty-four real tests now pass. What exists now, for the first time in this entire slice, is a real, complete, working pipeline — a raw string in, a real tree out — with nothing left standing between this project and a real number except the one real step this slice's own next lesson exists to take: reading that tree and actually computing what it means.
