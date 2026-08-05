---
series: kotlin-fundamentals
level: 20
title: Unit Testing Basics
lang: kotlin
---

# Unit Testing Basics

Every challenge in this entire series has been checked by a real `assert` line — a statement of exactly what a correct answer looks like, run automatically, reporting pass or fail. That is, in miniature, exactly what a professional **unit test** does. This lesson names the pattern directly and builds a small, real test structure by hand — the same shape real frameworks like JUnit and Kotlin's own `kotlin.test` library use, dressed in their own annotations and assertion functions.

## Arrange, Act, Assert

```kotlin
var passCount = 0
var failCount = 0

fun checkEqual(expected: Any?, actual: Any?, testName: String) {
    if (expected == actual) {
        passCount++
        println("PASS: $testName")
    } else {
        failCount++
        println("FAIL: $testName (expected $expected, got $actual)")
    }
}

fun add(a: Int, b: Int): Int = a + b

fun main() {
    checkEqual(5, add(2, 3), "add positive numbers")
    checkEqual(0, add(-5, 5), "add resulting in zero")
    checkEqual(-2, add(-1, -1), "add negative numbers")
    println("$passCount passed, $failCount failed")
}
```

```text
PASS: add positive numbers
PASS: add resulting in zero
PASS: add negative numbers
3 passed, 0 failed
```

Every one of these three checks follows the same, standard three-part shape:
- **Arrange** — set up the inputs (`2, 3`, or `-5, 5`, or `-1, -1`).
- **Act** — call the real code being tested (`add(...)`).
- **Assert** — state what the correct result should be, and let a real comparison decide pass or fail, rather than eyeballing printed output.

`checkEqual(expected, actual, testName)` is a small, hand-built version of exactly what a real test library's own `assertEquals` does: compare two values, report which test this was, keep a running tally. `expected == actual` works correctly here for any type — Level 5 established that `data class` equality (and, for ordinary values like `Int`, built-in structural equality) is exactly what `==` checks in Kotlin, unlike Java, where `==` on objects checks reference identity and `.equals()` is required for content comparison instead.

**SE lens:** This is the exact same discipline every `` ```test `` fence under every challenge in this series already runs, automatically, every time you submit one — a real, professional test is nothing more than a named assertion, run without a person needing to read raw output and judge for themselves whether it looks right.

## A Test That Deliberately Fails

```kotlin
var passCount = 0
var failCount = 0

fun checkEqual(expected: Any?, actual: Any?, testName: String) {
    if (expected == actual) {
        passCount++
        println("PASS: $testName")
    } else {
        failCount++
        println("FAIL: $testName (expected $expected, got $actual)")
    }
}

fun add(a: Int, b: Int): Int = a + a   // BUG: should be a + b

fun main() {
    checkEqual(5, add(2, 3), "add positive numbers")
    println("$passCount passed, $failCount failed")
}
```

```text
FAIL: add positive numbers (expected 5, got 4)
0 passed, 1 failed
```

**Walkthrough:** `add(a: Int, b: Int): Int = a + a` has a real, deliberately-planted bug — it ignores `b` entirely and doubles `a` instead. `checkEqual(5, add(2, 3), ...)` calls the buggy `add(2, 3)`, which returns `2 + 2 = 4`, not the expected `5` — the test correctly reports `FAIL`, with both the expected and actual values printed, exactly enough information to locate the bug without re-running anything in a debugger.

**CS lens:** This is the entire value proposition of automated testing stated as concretely as possible: the bug in `add` produces a wrong number that *looks* like a perfectly normal integer — nothing crashes, nothing throws, the program runs to completion successfully. Only a test that states the *expected* value in advance, and compares against it automatically, catches this. Reading the output of `add(2, 3)` in isolation gives no reason to suspect `4` is wrong; only checking it against a known-correct expectation does.

## Grouping Related Checks

```kotlin
class TestResults {
    private var passCount = 0
    private var failCount = 0

    fun checkEqual(expected: Any?, actual: Any?, testName: String) {
        if (expected == actual) {
            passCount++
            println("PASS: $testName")
        } else {
            failCount++
            println("FAIL: $testName (expected $expected, got $actual)")
        }
    }

    fun summary(): String = "$passCount passed, $failCount failed"
}

fun isPalindrome(text: String): Boolean {
    val cleaned = text.lowercase().filter { it.isLetter() }
    return cleaned == cleaned.reversed()
}

fun main() {
    val results = TestResults()

    results.checkEqual(true, isPalindrome("racecar"), "simple palindrome")
    results.checkEqual(false, isPalindrome("hello"), "non-palindrome")
    results.checkEqual(true, isPalindrome("A man a plan a canal Panama"), "palindrome with spaces and case")
    results.checkEqual(true, isPalindrome(""), "empty string is trivially a palindrome")

    println(results.summary())
}
```

```text
PASS: simple palindrome
PASS: non-palindrome
PASS: palindrome with spaces and case
PASS: empty string is trivially a palindrome
4 passed, 0 failed
```

**Walkthrough:** `class TestResults` gathers the same pass/fail tallying from before into a real object (Level 4's classes and properties, applied here), so that different groups of related tests — one `TestResults` per function under test, say — don't share a single pair of global counters. `isPalindrome` is the actual function under test: `text.lowercase().filter { it.isLetter() }` (Level 8's `filter`) strips out spaces and punctuation and normalizes case, then compares the cleaned string against its own `.reversed()`. Four separate test cases each check one specific, meaningfully different scenario — a plain palindrome, a non-palindrome, one with spaces and mixed case, and the edge case of an empty string — rather than one single check standing in for "does this function work."

**SE lens:** The final summary line, `4 passed, 0 failed`, is computed entirely from `passCount` and `failCount` — nobody read the four `PASS` lines above it and tallied them by eye. That's the actual point of `summary()` existing as real code: a hundred test cases summarize exactly as reliably as four, because the counting was never a manual step to begin with.

## Recognition

```text
Today: Arrange-Act-Assert, hand-built test tallying, deliberately-planted bugs

Also recognized in: JUnit's @Test and assertEquals (Java's dominant testing
framework, and Level 22 of java-fundamentals' own subject), Kotlin's own
kotlin.test library (a thin, Kotlin-idiomatic wrapper providing the same
assertEquals/assertTrue functions), pytest's assert statements in Python,
and Jest's expect(...).toBe(...) in JavaScript — every one of these is the
same Arrange-Act-Assert shape, in a different language's own syntax.
```

## Challenge: test_runner

Write `class TestRunner` with:
- `private var passCount = 0` and `private var failCount = 0`
- `fun check(expected: Any?, actual: Any?, testName: String)` — following the `checkEqual` pattern above, incrementing the right counter (no need to print anything)
- `fun passed(): Int` and `fun failed(): Int` returning the current counts

```challenge
class TestRunner {
    private var passCount = 0
    private var failCount = 0

    fun check(expected: Any?, actual: Any?, testName: String) {
    }

    fun passed(): Int {
        return passCount
    }

    fun failed(): Int {
        return failCount
    }
}
```

```test
val runner = TestRunner()

runner.check(4, 2 + 2, "addition")
runner.check(9, 3 * 3, "multiplication")
assert runner.passed() == 2
assert runner.failed() == 0

runner.check(10, 2 + 2, "wrong expectation")
assert runner.passed() == 2
assert runner.failed() == 1

runner.check("hello", "hello", "string equality")
assert runner.passed() == 3
```
