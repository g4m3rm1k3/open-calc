# Lesson 5.11: The Parenthesis That Was Never Checked

**What you will build:** This project's own real pipeline — `tokenize`, `toPostfix`, `buildTree`, `evaluate` — already works, proven against this project's own one real target expression and a couple of simpler cases. This lesson tests it harder: real division, real chained same-precedence operators, real multiple and nested parentheses, a real deep expression combining every one of this project's four real operators at once. Every one of those, tested for real, turns out correct. But testing harder also means testing what happens when the input *isn't* well-formed — and that turns up a real, previously-unknown crash this project's own pipeline has carried, silently, since the lesson that first tokenized a string: an expression missing a closing parenthesis doesn't fail cleanly. It fails with a real, unhelpful, low-level exception, because nothing in this pipeline has ever actually checked.

**What you need to know first:** This project's own complete real pipeline — `tokenize`, `toPostfix`, `buildTree`, and `evaluate` — and this slice's own already-established, deliberate choice that validating whether a token sequence is well-formed is a separate concern from tokenizing, one this pipeline has never actually built. `assertThrows`, established since this project's own real division-by-zero fix.

## Terms used in this lesson

- **Regression test** — a real, permanent, automated test whose entire job is confirming that something which already works keeps working, catching the moment a future change accidentally breaks it. This word exists because "prove it works once" and "prove it keeps working" are different real guarantees — a regression test is specifically the second one, run automatically, forever, rather than checked once by hand and trusted afterward.
- **Characterization test** — a real, permanent test that records a piece of code's own actual, current behavior — including behavior nobody deliberately designed, like a specific real exception on malformed input — without asserting that behavior is *correct* or *ideal*. This word exists because "this is what the code does right now" and "this is what the code should do" are genuinely different claims; a characterization test makes only the first one, on purpose, so a real, current behavior stays visible and intentional rather than silently drifting the next time someone touches the code.

## Objects and methods used

- **`private fun evaluateExpression(expression: String): Int`**
  - *What it is:* A real, permanent, private helper function inside this lesson's own new test class, chaining this project's entire real pipeline in one call.
  - *Implementation:* `private fun evaluateExpression(expression: String): Int { return evaluate(buildTree(toPostfix(tokenize(expression)))) }`, a member of `ParserTest`, visible only inside that class.
  - *Its use:* Every real test in this lesson's own new file needs the identical four-function chain — `evaluate(buildTree(toPostfix(tokenize(...))))` — to turn a raw expression into a real result; this helper says that once, instead of seven times.
  - *Type:* A `private` instance method on a test class.
  - *Responsibility:* Composing this project's own four real, already-independently-tested pipeline functions into the one operation every test in this file actually needs.
  - *Depends on:* A raw expression `String`, and this project's own real `tokenize`, `toPostfix`, `buildTree`, and `evaluate` functions, all already established.
  - *Connects to:* Called once per real test in `ParserTest`; internally calls all four real pipeline stages, in order, each one's real output feeding the next.
  - *Shape:* A real, permanent, test-only convenience — this project's own first private helper method living inside a test class rather than inside production code.

**Everything else in the file, not this lesson's subject but still explained.**

- **`tokenize` / `toPostfix` / `buildTree` / `evaluate`**
  - *What it is:* This project's own real, permanent pipeline functions, each already established from this slice's own prior four real-code lessons.
  - *Implementation:* Unchanged since each was written.
  - *Its use:* Composed together, in order, inside `evaluateExpression`, above — the same real composition this project's own `EvaluatorTest.kt` already proved once, now reused as the foundation every test in this lesson depends on.
  - *Type:* Top-level, pure functions.
  - *Responsibility:* Splitting a raw expression, reordering it into postfix, building the equivalent tree, and computing its real value.
  - *Depends on:* Each one's own real input, as already established.
  - *Connects to:* Chained inside `evaluateExpression`.
  - *Shape:* This project's own real, permanent functions, reappearing here as a single, composed unit rather than four separate calls.
- **`org.junit.Assert.assertEquals`**
  - *What it is:* A real, static JUnit method comparing an expected value against an actual one, already established from this project's own real test files.
  - *Implementation:* One of twelve real, overloaded static methods on `org.junit.Assert`.
  - *Its use:* Confirms each of this lesson's own real, valid-expression tests produces exactly the expected real number.
  - *Type:* A `static` method.
  - *Responsibility:* Comparing two values for equality and halting the test with a real, informative failure message if they differ.
  - *Depends on:* Two values, expected and actual.
  - *Connects to:* Called once per valid-expression test in `ParserTest.kt`.
  - *Shape:* A standard, external JUnit API, reappearing here unchanged.
- **`org.junit.Assert.assertThrows`**
  - *What it is:* A real, static JUnit method asserting that running a piece of code throws a specific real exception type, already established from this project's own real division-by-zero fix.
  - *Implementation:* `fun <T : Throwable> assertThrows(expectedType: Class<T>, runnable: ThrowingRunnable): T`, part of JUnit — running the given code, and failing the test if it either throws nothing, or throws the wrong real exception type.
  - *Its use:* This lesson's own three real "can't succeed" tests each use it to confirm a specific real exception genuinely happens, rather than just avoiding a crash by accident.
  - *Type:* A `static` method.
  - *Responsibility:* Confirming that a specific real failure actually occurs, not merely that no *other* failure occurs.
  - *Depends on:* The expected exception's own real `Class`, and a real block of code to run.
  - *Connects to:* Called once per exception-documenting test, each wrapping a real call to `evaluateExpression`.
  - *Shape:* A standard, external JUnit API, reappearing here unchanged.
- **`IndexOutOfBoundsException`**
  - *What it is:* A real, standard exception representing an attempt to access a position that doesn't exist in an indexed structure — here, a real, empty list.
  - *Implementation:* `kotlin.IndexOutOfBoundsException`, a subclass of `RuntimeException` — thrown by real standard-library methods like `MutableList.removeAt` and `List.get` when the given index doesn't exist in the collection's own current bounds.
  - *Its use:* This project's own real `Stack.pop()` and `Stack.peek()` both ultimately call a real, index-based list operation on an empty underlying list when handed malformed input — one real exception type, reached from two genuinely different real code paths, documented in this lesson's own two exception tests.
  - *Type:* A concrete exception class.
  - *Responsibility:* Signaling, at the moment it happens, that an indexed access genuinely has nowhere valid to point.
  - *Depends on:* Nothing to be thrown; the JVM raises it automatically the moment an index falls outside a real collection's own current bounds.
  - *Connects to:* Thrown, potentially, from inside `Stack.pop()`/`Stack.peek()`, called from either `toPostfix` or `buildTree`, depending on exactly which way an expression is malformed.
  - *Shape:* A standard JVM/Kotlin exception type — this lesson's own first real use of it, surfacing a real gap neither `toPostfix` nor `buildTree` currently guards against.
- **`::class.java`**
  - *What it is:* A real Kotlin expression producing the actual, concrete `java.lang.Class` object for a given type, already established from this project's own real division-by-zero fix.
  - *Implementation:* `SomeType::class` produces a real Kotlin `KClass`; `.java` converts it to the real Java `Class` object JUnit's own `assertThrows` requires.
  - *Its use:* Each of this lesson's own three exception tests passes `SomeException::class.java` as `assertThrows`'s own first real argument, naming exactly which exception type is expected.
  - *Type:* A class-reference expression.
  - *Responsibility:* Producing a real, runtime-inspectable representation of a type, rather than an instance of it.
  - *Depends on:* The type named before `::class`.
  - *Connects to:* Passed directly into each call to `assertThrows`.
  - *Shape:* Already-established Kotlin syntax, reappearing here unchanged.
- **`@Test`**
  - *What it is:* An annotation marking a function as a real, executable test case, already established from this project's own real test files.
  - *Implementation:* A JUnit annotation, discovered and run automatically by a real test runner.
  - *Its use:* Marks each of this lesson's own seven new test functions.
  - *Type:* An annotation.
  - *Responsibility:* Making a function recognizable as a test by real tooling.
  - *Depends on:* Nothing.
  - *Connects to:* Applied to each of `ParserTest.kt`'s own seven real functions.
  - *Shape:* Already-established JUnit vocabulary, reappearing here unchanged.
- **`package` declaration**
  - *What it is:* A statement naming which package a file belongs to, already established from every real file this project has.
  - *Implementation:* `package com.example.calculator`, at the top of the new file.
  - *Its use:* Puts `ParserTest.kt` in the same real package as every real pipeline function it tests, the concrete reason it can call `tokenize`, `toPostfix`, `buildTree`, and `evaluate` together with no import needed for any of them.
  - *Type:* A file-level declaration.
  - *Responsibility:* Establishing which other declarations a file can reach without an explicit import.
  - *Depends on:* Nothing.
  - *Connects to:* Shared identically across every real file in this project's own source tree.
  - *Shape:* Already-established Kotlin vocabulary, reappearing here unchanged.

## Concept Unit: Testing the Complete Real Pipeline, End to End

### The Problem

This project's own real pipeline has only ever been tested against one real target expression and a couple of simpler cases — never against division, never against multiple parentheses at once, never against an expression using every one of this project's four real operators together. And every real function this pipeline is built from was written trusting its own input was already correct — `toPostfix` and `buildTree` both assume, without checking, that every opening parenthesis has a real, matching close. Does that assumption actually hold up once real, harder expressions get thrown at it — and what happens the one time it doesn't?

> This project's own real division is already known to be left-associative in isolation — but has that actually been tested all the way through the *complete* pipeline, tokenizer through evaluator, or only proven for subtraction? What would a genuinely harder real expression look like — one combining multi-digit numbers, more than one parenthesized group, and more than one kind of operator all at once — and do you expect it to still come out correct, or is there a real reason to doubt it? If an expression is missing a closing parenthesis, `toPostfix`'s own final step drains every operator still sitting on the stack, with no check for what kind of token it's draining — what do you think happens to a stray, un-closed `"("` once it reaches `buildTree`, a function that treats *every* non-number token as a real operator needing two real operands?

### Project Change

- **Reference Source** — No reference counterpart. This lesson adds real, permanent tests against this project's own already-existing, unmodified real pipeline — no new production behavior, only new, real, executed proof of how the existing one behaves.
- **Files affected** — One new file: `app/src/test/java/com/example/calculator/ParserTest.kt`.
- **Change type** — Add.
- **Location** — A brand-new file, alongside this project's own other real test files. Not added to `EvaluatorTest.kt`: that file's own real job is proving `evaluate` itself works, using inputs already known to be well-formed; this lesson's own real job is proving the *whole, assembled pipeline* holds up under a real, escalating range of difficulty, including malformed input — a genuinely different real scope, the same Cohesion reasoning already applied to every other file in this project.
- **Dependencies** — None beyond what this project already has.

### The New Code

```kotlin
package com.example.calculator

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class ParserTest {
    private fun evaluateExpression(expression: String): Int {
        return evaluate(buildTree(toPostfix(tokenize(expression))))
    }

    @Test
    fun evaluatesDivisionCorrectly() {
        assertEquals(5, evaluateExpression("10÷2"))
    }

    @Test
    fun evaluatesChainedDivisionLeftAssociatively() {
        assertEquals(5, evaluateExpression("100÷10÷2"))
    }

    @Test
    fun evaluatesMultipleParenthesizedGroupsAtTheSameLevel() {
        assertEquals(21, evaluateExpression("(1+2)×(3+4)"))
    }

    @Test
    fun evaluatesADeepMultiDigitExpressionUsingAllFourOperators() {
        assertEquals(-362, evaluateExpression("12+34×(56−78)÷2"))
    }

    @Test
    fun anExpressionMissingAClosingParenthesisThrowsARealException() {
        assertThrows(IndexOutOfBoundsException::class.java) {
            evaluateExpression("(1+2")
        }
    }

    @Test
    fun anExpressionWithAnUnmatchedClosingParenthesisThrowsARealException() {
        assertThrows(IndexOutOfBoundsException::class.java) {
            evaluateExpression("1+2)")
        }
    }

    @Test
    fun divisionByZeroPropagatesTheRealArithmeticExceptionAllTheWayUp() {
        assertThrows(ArithmeticException::class.java) {
            evaluateExpression("1÷0")
        }
    }
}
```

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `class ParserTest` — already established: a real test class.
- `private fun evaluateExpression(expression: String): Int { return evaluate(buildTree(toPostfix(tokenize(expression)))) }` — a `private` function, already-established `private` visibility applied here, for the first time, to a *method* rather than a property; chains this project's own four real pipeline functions, documented above, each one's real return value feeding directly into the next.
- `fun evaluatesDivisionCorrectly()`, `assertEquals(5, evaluateExpression("10÷2"))` — the real `assertEquals` method documented above, comparing the literal `5` against this lesson's own new helper's real, computed result for a real division this pipeline has never been tested against end to end before.
- `fun evaluatesChainedDivisionLeftAssociatively()`, `assertEquals(5, evaluateExpression("100÷10÷2"))` — the identical shape, this time asserting real left-associativity: `100 ÷ 10 ÷ 2` must equal `(100 ÷ 10) ÷ 2 = 5`, not `100 ÷ (10 ÷ 2) = 20` — the second, independent, real confirmation this project's `>=` precedence comparison correctly handles same-precedence chaining, this time for division instead of subtraction.
- `fun evaluatesMultipleParenthesizedGroupsAtTheSameLevel()`, `assertEquals(21, evaluateExpression("(1+2)×(3+4)"))` — asserting a real expression with *two* separate parenthesized groups, neither nested inside the other, evaluates correctly: `3 × 7 = 21`.
- `fun evaluatesADeepMultiDigitExpressionUsingAllFourOperators()`, `assertEquals(-362, evaluateExpression("12+34×(56−78)÷2"))` — a real, deliberately harder expression combining multi-digit numbers, all four of this project's real operators, and parentheses in one real test: `56 − 78 = -22`; `34 × -22 = -748`; `-748 ÷ 2 = -374` (`×` and `÷` share precedence, left-associative, so this one runs before the outer addition); `12 + -374 = -362`.
- `fun anExpressionMissingAClosingParenthesisThrowsARealException()`, `assertThrows(IndexOutOfBoundsException::class.java) { evaluateExpression("(1+2") }` — the real `assertThrows` and `::class.java` documented above, confirming that a real, currently-unvalidated expression genuinely throws the real `IndexOutOfBoundsException` documented above, rather than silently producing a wrong answer or hanging.
- `fun anExpressionWithAnUnmatchedClosingParenthesisThrowsARealException()`, `assertThrows(IndexOutOfBoundsException::class.java) { evaluateExpression("1+2)") }` — the identical real assertion shape, for the opposite malformation: a closing parenthesis with nothing open to match it.
- `fun divisionByZeroPropagatesTheRealArithmeticExceptionAllTheWayUp()`, `assertThrows(ArithmeticException::class.java) { evaluateExpression("1÷0") }` — confirming, for the first time with a real, executed test rather than a stated prediction, that this project's own real division-by-zero exception really does propagate, unhandled, all the way from `Operation.apply` up through `evaluate`, exactly as this slice's own immediately preceding lesson already predicted it would.

### CS Lens

Testing a system's own real boundaries — not just the inputs it was designed for, but the ones it wasn't — is how real, hidden gaps get found on purpose, rather than by a real user first.

```
Also recognized in: fuzz testing a real compiler or parser with
deliberately malformed input, boundary-value testing in any real
software test suite, a real API's own contract tests distinguishing
documented behavior from accidental behavior, chaos engineering
deliberately introducing real failures to see what actually happens
```

### SE Lens

The alternative not chosen here: build a real grammar-validation stage, checking that parentheses are balanced and every token is well-formed, before `toPostfix` or `buildTree` ever run — genuinely fixing the crash this lesson's own tests just found, rather than only documenting it. The real tradeoff: a real validation stage is a real, legitimate feature — this slice's own opening lesson explicitly named it as a deliberately separate concern from tokenizing — but building one now would be solving a problem `brd.md`'s own Slice 5 never actually asked for; nothing in this project's own real, current UI can produce malformed input at all, since there is no real Scientific-mode screen yet for a user to type an unbalanced expression into. Writing `assertThrows` tests capturing the *real, current* behavior, honestly, is what keeps this a known, deliberate, tested gap rather than an unknown one — real validation becomes genuinely necessary the moment a real UI gives a real user the chance to type something malformed, not before.

### Commands Needed

`./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ParserTest"` runs only this lesson's own new tests; `./gradlew :app:testDebugUnitTest :app:assembleDebug` runs this project's own complete real suite and produces a real, installable `.apk`, exactly as established throughout this slice.

### Run It

Real command run: `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ParserTest" --rerun-tasks`, producing:

```
BUILD SUCCESSFUL in 3s
27 actionable tasks: 27 executed
```

All seven of this lesson's own new tests passed for real — four confirming this project's own real pipeline handles genuinely harder valid expressions correctly, and three confirming, honestly, exactly how it currently fails when the input isn't valid at all. A full, real run of this project's own complete suite, `./gradlew :app:testDebugUnitTest :app:assembleDebug --rerun-tasks`, produced:

```
com.example.calculator.HapticsTest > pressingKeypadButtonTriggersHapticFeedback FAILED
    androidx.test.espresso.AppNotIdleException at HapticsTest.kt:35

com.example.calculator.ThemeTest > calculatorThemeProvidesRealCustomPrimaryColor FAILED
    androidx.test.espresso.AppNotIdleException at ThemeTest.kt:29

43 tests completed, 2 failed
```

Forty-three real tests now exist in this project — the prior thirty-six plus this lesson's own seven new ones — and none of this lesson's own tests is among the two real failures shown here: both are the same already-documented, pre-existing, intermittent flake this project has already found and confirmed unrelated more than once. A separate, real, immediately-following run, forced fresh via `--rerun-tasks`, produced a fully clean result instead:

```
BUILD SUCCESSFUL in 8s
43 actionable tasks: 43 executed
```

confirming this project's own complete real suite, all forty-three tests, genuinely does pass together, and that a real, installable `.apk` still builds successfully with `ParserTest.kt` now part of this project's own real source.

### Connect the Pieces

This project's own real pipeline is now proven correct across a genuinely harder real range of valid expressions, and its one real, honest gap — no validation of malformed input — is no longer unknown or accidental, but a real, deliberately recorded, currently-open decision, exactly as this slice's own opening lesson always intended tokenizing and validating to be separate concerns.

## Connect the Pieces

Follow this project's own real pipeline through the harder, real range this lesson actually tested it against. Real division, tested end to end for the first time, produced the correct `5` for `10÷2`; chained twice, `100÷10÷2` produced `5`, not `20`, a second, independent, real confirmation — after subtraction's own, back in this slice's Shunting-Yard lesson — that this project's real `>=` precedence comparison correctly handles same-precedence operators left to right. Two separate parenthesized groups combined correctly, `(1+2)×(3+4)` producing `21`; a genuinely harder expression, mixing multi-digit numbers and all four of this project's real operators, `12+34×(56−78)÷2`, produced the correct `-362`, confirmed by hand and by real, executed code alike. Then this lesson tested what none of this project's own prior real work ever had: input the pipeline was never actually checked against. `"(1+2"` and `"1+2)"` both throw a real `IndexOutOfBoundsException` — from two genuinely different real code paths, `toPostfix` in one case, `buildTree` in the other — now captured by two real, permanent tests documenting that exact, current, honest behavior rather than leaving it as an undiscovered surprise. A third real test confirmed division by zero propagates its own real `ArithmeticException` all the way up through `evaluate`, exactly as this slice's own immediately preceding lesson predicted, now actually proven. Forty-three real tests pass. This is the last lesson in this slice: `tokenize`, `toPostfix`, `buildTree`, `evaluate`, a real Stack, a real Queue, real Big-O measurements, and now a real, honest account of what this pipeline does and does not yet handle — a real, tested, working scientific expression calculator, exactly as this slice set out, eleven real lessons ago, to build.
