# Lesson 5.4: Nine Real Pieces

**What you will build:** This slice's own opening lesson proved, with a real, isolated, throwaway lab, exactly what tokenizing means and why it matters; this lesson makes that same real mechanism permanent — a real, tested `tokenize` function, living in this project's own actual source tree for the first time, applied to this project's own actual target expression, `3 + 5 × (2 − 8)`, using this project's own real operator symbols rather than a generic stand-in. By the end of this lesson, this project can turn that real string into a real, ordered list of nine real tokens — proven not by a throwaway `println`, but by real, permanent, executed JUnit tests.

**What you need to know first:** Tokenization itself — what a token is, and the accumulate-digits-and-split mechanism that produces one — already proven with a real, isolated, throwaway lab earlier in this slice. This project's own real operator symbols, `+`, `−`, `×`, `÷`, already established via `operatorSymbols`. Unit testing and the Arrange/Act/Assert shape, established since this project's own real `CalculatorTest.kt`. Classes, functions, and `MutableList`, all already established throughout this project's own real, prior work.

## Terms used in this lesson

- **`package` declaration** — a statement at the top of a Kotlin file naming which package that file belongs to, already established from every real file this project has. This word exists because two files in the *same* package can reference each other's top-level declarations directly, with no `import` needed at all — the specific, concrete reason this lesson's new file can declare `package com.example.calculator`, the identical package this project's own `Calculator.kt` and `MainActivity.kt` already use, and be callable from either one without a single new import line.
- **`@Test`** — an annotation marking a function as a real, executable test case that a test runner (here, plain JUnit, no Robolectric involved) discovers and runs automatically, already established from this project's own real `CalculatorTest.kt`. This word exists because a test function needs to be recognizable as a test *by tooling*, not just by a human reading its name — the annotation is what a real test runner actually looks for.

## Objects and methods used

- **`tokenize(expression: String): List<String>`**
  - *What it is:* This lesson's own real, permanent function — this project's first real, tested tokenizer, turning a raw expression string into an ordered list of real tokens.
  - *Implementation:* `fun tokenize(expression: String): List<String>`, a top-level, pure function — no class, no mutable state outside its own local variables, no side effects — living in a new file, `Tokenizer.kt`.
  - *Its use:* Every one of this slice's own coming lessons — Shunting-Yard, evaluation, and everything between — needs a real, ordered list of tokens to work from, rather than a raw, undifferentiated string; this function is the one real place that transformation happens.
  - *Type:* A top-level, pure function.
  - *Responsibility:* Splitting a raw expression string into an ordered list of meaningful pieces — digits grouped into whole numbers, every other character its own token — and nothing about whether those pieces form a *valid* expression, which is deliberately a separate concern this function doesn't take on.
  - *Depends on:* The raw `String` expression it's called with; nothing else — no `CalculatorState`, no `Operator`, no Android or Compose machinery of any kind.
  - *Connects to:* Called directly by this lesson's own real, permanent tests; not yet called by any other real project code, since this project has no Scientific-mode screen yet to feed it real user input — the same real, honest "built before it has a caller" shape this project's own domain logic (`Operation`/`Calculator`) had for ten real lessons before Stage 1 ever wired it into a screen.
  - *Shape:* A real, permanent, public function — this project's own new public API surface for turning text into structure, the first piece of what this slice's real expression evaluator will be built from.

**Everything else in the file, not this lesson's subject but still explained.** Every entry below is supporting cast: real standard-library methods `tokenize`'s own body depends on, each already established earlier in this slice, given full treatment again here per the Repetition Rule, plus the real JUnit mechanism this lesson's own new test file depends on.

- **`Char.isDigit()`**
  - *What it is:* An instance method on `Char` answering whether a single character represents a decimal digit, already established from this slice's own opening lesson and from this project's own real `nextState`.
  - *Implementation:* `fun Char.isDigit(): Boolean`, part of the Kotlin standard library.
  - *Its use:* `tokenize` calls this once per character, deciding whether that character belongs to a multi-character number token or starts something else.
  - *Type:* An extension function on `Char`.
  - *Responsibility:* Answering exactly one question about one character, with no side effects.
  - *Depends on:* The single `Char` it's called on.
  - *Connects to:* Called once per loop iteration inside `tokenize`; its `Boolean` result decides which branch runs next.
  - *Shape:* A standard-library predicate, reappearing here in this project's own first real, permanent tokenizer.
- **`mutableListOf<T>()` / `MutableList<T>`**
  - *What it is:* A standard-library factory function producing a new, empty, growable list, and the mutable list type it returns, already established from this slice's own opening lesson.
  - *Implementation:* `fun <T> mutableListOf(): MutableList<T>`, part of the Kotlin standard library.
  - *Its use:* `tokenize` needs somewhere to accumulate real tokens, one at a time, in order, as it walks the real expression string.
  - *Type:* `mutableListOf` is a top-level generic function; `MutableList<T>` is a standard-library interface.
  - *Responsibility:* Holding an ordered sequence of elements that can grow after the collection already exists.
  - *Depends on:* Nothing to construct an empty one.
  - *Connects to:* Created once at the top of `tokenize`; every `tokens.add(...)` call writes into this same instance; `tokenize`'s own `return tokens` hands it back, implicitly upcast to the declared, read-only `List<String>` return type.
  - *Shape:* A standard-library data structure — the real, private working storage behind this project's own first real, permanent tokenizer.
- **`MutableList.add(element)`**
  - *What it is:* An instance method on `MutableList` that appends one new element to the end of the list, already established from this slice's own opening lesson.
  - *Implementation:* `fun add(element: E): Boolean`, part of the Kotlin standard library.
  - *Its use:* Called every time `tokenize` has finished recognizing one complete token, appending it to the running list.
  - *Type:* An instance method on `MutableList<E>`.
  - *Responsibility:* Growing the list by exactly one element, at the end.
  - *Depends on:* The list instance and the element being added.
  - *Connects to:* Called twice inside `tokenize`'s own loop body and once more after it ends.
  - *Shape:* A standard-library mutation method — this project's own first real, permanent use of it for token-building.
- **`String.isNotEmpty()`**
  - *What it is:* An instance method on `String` answering whether it contains at least one character, already established from this slice's own opening lesson.
  - *Implementation:* `fun CharSequence.isNotEmpty(): Boolean`, part of the Kotlin standard library.
  - *Its use:* `tokenize` checks this before flushing its `number` accumulator into the token list, avoiding a phantom empty-string token.
  - *Type:* An extension function on `CharSequence`.
  - *Responsibility:* Answering one question about a string's own length.
  - *Depends on:* The `String` it's called on.
  - *Connects to:* Called twice inside `tokenize`, each guarding a flush of the `number` accumulator.
  - *Shape:* A standard-library predicate, reappearing here unchanged.
- **`Char.toString()`**
  - *What it is:* An instance method converting a single `Char` into a one-character `String`, already established from this slice's own opening lesson.
  - *Implementation:* `fun Any?.toString(): String`, specialized for `Char` to produce exactly the one-character string containing it.
  - *Its use:* `tokenize` needs every element of its `List<String>` to actually be a `String`; converting a non-digit `Char` this way produces the one-character token that character becomes.
  - *Type:* An instance method inherited from `Any`.
  - *Responsibility:* Producing a `String` representation of whatever value it's called on.
  - *Depends on:* The `Char` it's called on.
  - *Connects to:* Called once per non-digit character inside `tokenize`, its result passed directly into `tokens.add(...)`.
  - *Shape:* A universal standard-library method, reappearing here unchanged.
- **`String.plus` (called through `+=`)**
  - *What it is:* The real operator method backing `+`/`+=` between a `String` and another value, already established from this slice's own opening lesson.
  - *Implementation:* `operator fun String.plus(other: Any?): String`, part of the Kotlin standard library.
  - *Its use:* `number += char` builds up a run of digit characters into one growing `String`, one character at a time.
  - *Type:* An `operator fun`.
  - *Responsibility:* Building a brand-new `String` combining the receiver with the argument's own string representation, never mutating the original.
  - *Depends on:* The `String` it's called on and one `Any?` value to append.
  - *Connects to:* Invoked implicitly every time `number += char` runs inside `tokenize`'s digit-accumulation branch.
  - *Shape:* A standard-library operator overload, reappearing here unchanged.
- **`org.junit.Assert.assertEquals`**
  - *What it is:* A real, static JUnit method comparing an expected value against an actual one, already established from this project's own real `CalculatorTest.kt`.
  - *Implementation:* One of twelve real, overloaded static methods on `org.junit.Assert`, confirmed by this project's own earlier real `javap` inspection; for two non-primitive arguments like the two `List<String>` values this lesson's own tests compare, Kotlin resolves the call to the `Object, Object` overload, which reports failure unless `expected.equals(actual)` is `true`.
  - *Its use:* This lesson's own new tests call it once each, comparing the real, expected token list against whatever `tokenize` actually returned.
  - *Type:* A `static` method — callable without any `Assert` instance.
  - *Responsibility:* Comparing two values for equality and, if they differ, halting the test with a real, informative failure message.
  - *Depends on:* Two values, expected and actual.
  - *Connects to:* Called once per test in this lesson's own new `TokenizerTest.kt`, each call's real result already proven for real by this lesson's own executed test run: a real, freshly-built `listOf(...)` and a real, separately-built list `tokenize` returned compared equal, structurally, despite being two genuinely different list instances — proof, without any further inspection needed, that Kotlin's own `List` implements real, structural `equals()` rather than only comparing object identity.
  - *Shape:* A standard, external JUnit API — reappearing here on this project's own first real Stage-5 test file.

## Concept Unit: A Real Tokenizer for This Project's Own Expression

### The Problem

This slice's own opening lesson already proved the tokenizing mechanism works, in isolation, on a generic example. It has never once run against this project's own actual target expression, `3 + 5 × (2 − 8)`, using this project's own actual operator symbols — and it has never existed as real, permanent, tested project code at all. Every one of this slice's coming lessons needs a real list of tokens to build on; nothing in this project can produce one yet.

> Given the already-proven digit-accumulation mechanism from earlier in this slice, would it need to change at all to correctly handle this project's own real symbols — `×`, `÷`, `−`, `(`, `)` — instead of the generic example it was first proven against? Why, or why not, based on how that mechanism actually decides what counts as one token? If `tokenize` encounters a character it's never seen before — one that isn't a digit and isn't one of this project's own recognized operators — what do you think it should do, given that deciding whether a token sequence is *valid* was already established, earlier in this slice, as a deliberately separate concern from tokenizing itself?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — it proves the already-established mechanism works correctly against this project's own real symbols, before any of it becomes permanent:

```kotlin
fun tokenize(expression: String): List<String> {
    val tokens = mutableListOf<String>()
    var number = ""
    for (char in expression) {
        if (char.isDigit()) {
            number += char
        } else {
            if (number.isNotEmpty()) {
                tokens.add(number)
                number = ""
            }
            tokens.add(char.toString())
        }
    }
    if (number.isNotEmpty()) {
        tokens.add(number)
    }
    return tokens
}

fun main() {
    println(tokenize("3+5×(2−8)"))
}
```

Compiled and run for real, this produced:

```
[3, +, 5, ×, (, 2, −, 8, )]
```

Nine real tokens, in order, from this project's own real target expression — every digit correctly kept whole, every operator and every parenthesis correctly split into its own token, with no changes needed to the mechanism already proven earlier in this slice. The parentheses needed no special handling at all: `tokenize`'s own `else` branch already treats *any* non-digit character as its own single-character token, and `(`/`)` are simply two more characters that aren't digits — the same real logic that already handles `+`, `−`, `×`, and `÷`.

### Discard the Throwaway Example

This throwaway file is deleted now. What follows is the identical, real mechanism, written into this project's own actual source tree for the first time.

### Project Change

- **Reference Source** — No reference counterpart. This is a from-scratch addition: this project has no pre-existing conventional Android app being ported from, and this exact function was proven correct moments ago, in this same lesson's own isolated lab, against this project's own real target expression.
- **Files affected** — Two new files created: `app/src/main/java/com/example/calculator/Tokenizer.kt` and `app/src/test/java/com/example/calculator/TokenizerTest.kt`.
- **Change type** — Add.
- **Location** — Both are brand-new files; `Tokenizer.kt` sits alongside `Calculator.kt` in this project's own domain-logic package, not inside `Calculator.kt` itself — tokenizing a whole, pre-existing expression string is a genuinely different responsibility from `nextState`'s own job of reacting to one button press against existing state, the same real Cohesion argument this project already proved for itself earlier in this stage.
- **Dependencies** — None beyond what this project already has; no new Gradle dependency, since `tokenize` needs nothing beyond the plain Kotlin standard library already in use throughout `Calculator.kt`.

### The New Code

```kotlin
fun tokenize(expression: String): List<String> {
    val tokens = mutableListOf<String>()
    var number = ""
    for (char in expression) {
        if (char.isDigit()) {
            number += char
        } else {
            if (number.isNotEmpty()) {
                tokens.add(number)
                number = ""
            }
            tokens.add(char.toString())
        }
    }
    if (number.isNotEmpty()) {
        tokens.add(number)
    }
    return tokens
}
```

This is the whole of the new file's real content — `Tokenizer.kt` has nothing surrounding it to show as an enclosing structure, per this project's own already-established convention for a brand-new file with nothing else in it yet.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `fun tokenize(expression: String): List<String>` — a function declaration, already established, taking one `String` parameter and returning a real, read-only `List<String>`.
- `val tokens = mutableListOf<String>()` — a `val` binding holding a real, empty `MutableList<String>`, documented above.
- `var number = ""` — a `var` binding, reassigned on every digit accumulated, serving as the running number-in-progress.
- `for (char in expression)` — a `for` loop iterating `expression`'s own individual `Char`s, already established.
- `if (char.isDigit())` — the real standard-library method documented above, deciding which branch runs.
- `number += char` — the compound-assignment operator, already established, backed by the real `String.plus` method documented above.
- `else` branch — running whenever the current character is not a digit.
- `if (number.isNotEmpty())` — the real standard-library method documented above, guarding against a phantom empty token.
- `tokens.add(number)` — the real `MutableList.add` method documented above, flushing a completed number.
- `number = ""` — resetting the accumulator for the next run of digits, if any.
- `tokens.add(char.toString())` — appending the current non-digit character, converted to a one-character `String` via the real method documented above.
- `if (number.isNotEmpty()) { tokens.add(number) }`, after the loop — the same guarded flush, run once more to catch a number that reaches the very end of `expression` with nothing after it.
- `return tokens` — already established, handing back the completed list.

### CS Lens

This unit's own real subject — a general, already-proven mechanism becoming the specific, real, permanent tool one particular real system actually needs — is itself a recognizable pattern, distinct from tokenization's own CS Lens, already given in this slice's opening lesson.

```
Also recognized in: adapting a general-purpose library into an
application's own thin wrapper suited to its real, specific needs,
a compiler front-end's own real, project-specific lexer built from
textbook tokenizing theory, any reusable algorithm textbook example
turned into a real, tested function inside a real codebase
```

### SE Lens

The alternative not chosen here: return a richer, typed representation of each token — a `sealed class Token` with distinct cases for a number, an operator, an open parenthesis, and a close parenthesis — instead of a plain `List<String>`. The real tradeoff: a typed `Token` hierarchy would let later stages of this slice's own work distinguish token kinds without re-parsing strings each time, the same real type-safety argument that already justified `Display`'s own sealed class back in this project's real UI work — but that argument was justified there by a real, already-reproduced crash a bare `String` sentinel caused; nothing in this project has yet shown a bare `List<String>` causing a real problem for anything this slice has built so far. Introducing a typed `Token` hierarchy now would be solving a hypothetical problem, not a present one — left as a real, open, live design question for whichever later lesson (Shunting-Yard or AST construction are the most likely candidates) first runs into a concrete, present reason a `List<String>` isn't enough.

### Commands Needed

`kotlinc lab1_tokenize_real_symbols.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`, for the isolated lab, exactly as established throughout this slice. For the real project itself: `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.TokenizerTest"` runs only this lesson's own new tests — `--tests` narrows a Gradle test run to a specific real class by its fully-qualified name, useful here to confirm this lesson's own new code in isolation from the rest of this project's real suite; `./gradlew :app:testDebugUnitTest :app:assembleDebug` runs this project's own complete real test suite and produces a real, installable `.apk`, exactly as every real-project lesson in this curriculum has already established.

### Run It

Real, permanent test file, `TokenizerTest.kt`:

```kotlin
package com.example.calculator

import org.junit.Assert.assertEquals
import org.junit.Test

class TokenizerTest {
    @Test
    fun tokenizingTheProjectsOwnTargetExpressionSplitsEveryRealSymbol() {
        // Arrange
        val expression = "3+5×(2−8)"

        // Act
        val tokens = tokenize(expression)

        // Assert
        assertEquals(listOf("3", "+", "5", "×", "(", "2", "−", "8", ")"), tokens)
    }

    @Test
    fun tokenizingKeepsMultiDigitNumbersAsOneToken() {
        // Arrange
        val expression = "12+34"

        // Act
        val tokens = tokenize(expression)

        // Assert
        assertEquals(listOf("12", "+", "34"), tokens)
    }
}
```

Real command run: `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.TokenizerTest" --rerun-tasks`, producing:

```
BUILD SUCCESSFUL in 2s
27 actionable tasks: 27 executed
```

Both of this lesson's own new tests passed for real, including the one asserting the exact nine-token result already shown by this unit's own isolated lab, now proven against the real, permanent function itself. A full, real run of this project's own complete suite, `./gradlew :app:testDebugUnitTest :app:assembleDebug --rerun-tasks`, produced:

```
com.example.calculator.HapticsTest > pressingKeypadButtonTriggersHapticFeedback FAILED
    androidx.test.espresso.AppNotIdleException at HapticsTest.kt:35

com.example.calculator.ThemeTest > calculatorThemeProvidesRealCustomPrimaryColor FAILED
    androidx.test.espresso.AppNotIdleException at ThemeTest.kt:29

29 tests completed, 2 failed
```

Twenty-nine real tests now exist in this project — the prior twenty-seven plus this lesson's own two new ones — and this lesson's own `TokenizerTest` is not among the two real failures shown here: both are the identical, already-known, already-documented intermittent flake first found during this project's own earlier architecture work, striking the same two unrelated tests, neither of which builds anything this lesson touched. A separate, real, immediately-following run, forced fresh via `--rerun-tasks`, produced a fully clean result instead:

```
BUILD SUCCESSFUL in 7s
43 actionable tasks: 43 executed
```

confirming this project's own complete real suite, all twenty-nine tests, genuinely does pass together, and that a real, installable `.apk` still builds successfully with `Tokenizer.kt` now part of this project's own real source.

### Connect the Pieces

The exact mechanism this slice's opening lesson proved in isolation is now real, permanent, and tested — the first real, working piece of this project's own actual expression evaluator, ready for whatever this slice's next real lesson builds on top of it.

## Connect the Pieces

One concrete value, followed all the way through this lesson's own real work. This project's own real target expression, `"3+5×(2−8)"`, was already proven, moments earlier in this slice, to split correctly into tokens using a throwaway, generic mechanism — this lesson's own job was making that exact mechanism real. A fresh, isolated lab confirmed it first, unchanged, against this project's own actual symbols: nine real tokens, `[3, +, 5, ×, (, 2, −, 8, )]`, with no special-casing needed for the parentheses this project had never tokenized before — they fell out of the same "any non-digit character is its own token" rule that already handled every operator. That exact function then became `Tokenizer.kt`, a real, permanent, new file in this project's own actual source tree, and two real, executed JUnit tests — one asserting this exact nine-token result, one confirming multi-digit numbers still survive as one token — both passed for real, joining this project's now twenty-nine-test real suite. Nothing about `CalculatorState`, `nextState`, or any of this project's existing real, shipped behavior changed; `tokenize` exists now purely as new, additive, tested capability, with no caller yet — the identical shape this project's own domain logic had for its first ten real lessons, before Stage 1 ever gave it a screen to serve. What this slice's own coming work inherits from here is a real, trustworthy first stage: given this project's own real expression, a real, ordered list of real tokens, ready for whatever needs to make sense of them next.
