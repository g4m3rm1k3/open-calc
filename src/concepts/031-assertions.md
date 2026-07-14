---
concept: 031-assertions
name: Assertions
---

## Definition

An assertion is a check on a condition you believe must always be true at that
exact point in the program, which fails immediately and loudly if it isn't —
used to catch bugs in the program's own logic, not to validate external input.

## Problem

Some bugs don't crash a program right away — they corrupt a value quietly, and
the program keeps running with bad data until the bug finally surfaces somewhere
far away from where it actually happened, making it hard to trace back. An
assertion catches the violation at the exact point it occurs, with the exact
state that caused it.

## Execution

Execution reaches an assert statement
↓
The condition is evaluated
↓
If true, nothing happens — execution continues as if the assert weren't there
↓
If false, the program stops immediately with an error identifying exactly which
assertion failed and where

## Computer Science

Assertions encode invariants — conditions the programmer believes are always true
at a specific point, based on the logic that led there. An assertion failing
means the code's actual behavior contradicts the programmer's own understanding
of it — a logic bug, not a bad user input.

Tags: Invariants, Program correctness, Precondition checking

## Software Engineering

Assertions are for catching bugs in your own code during development, not for
validating data that comes from outside the program — that's what Validation is
for. Many languages let assertions be stripped out entirely in production
builds, which is only safe if the program's correctness never actually depends on
one having run.

Tags: Development-time checks, Defensive programming, Debug builds

## Common Mistakes

- Using an assertion to validate external input (like a user's age from a form) instead of a real validation path — assertions are for the programmer's own logic errors, and may not even run in production.
- Writing an assertion with a side effect inside its condition — if assertions get stripped out in production, that side effect silently stops happening too.

## Exercises

- In the Python example, fix `average` by adding a real guard clause before the assert, and compare how the error each one produces differs.
- In Java, change the assertion's condition to something always true, and confirm nothing observable happens — a passing assertion is silent by design.

## javascript

```javascript
function assert(condition, message) {
  if (!condition) throw new Error('Assertion failed: ' + message)
}

function average(numbers) {
  assert(numbers.length > 0, 'average() called with an empty array')
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}
console.log(average([]))
```
Walkthrough: JavaScript has no built-in assert statement, so this defines a small
`assert` helper that throws when its condition is false — the same shape as
Python's and Java's built-in `assert`. Calling `average([])` violates the
assertion immediately, so the division by zero never happens; the thrown error
stops execution right at the point the programmer's own assumption was broken.

## python

```python
def average(numbers):
    assert len(numbers) > 0, 'average() called with an empty list'
    return sum(numbers) / len(numbers)

print(average([]))
```
Walkthrough: Python's `assert` raises an `AssertionError` and stops execution
immediately when the condition is false — the division by zero never even
happens, because the assertion fails first.

## java

```java
static double average(double[] numbers) {
    assert numbers.length > 0 : "average() called with an empty array";
    double sum = 0;
    for (double n : numbers) sum += n;
    return sum / numbers.length;
}

System.out.println(average(new double[0]));
```
Walkthrough: Java's `assert` has to be explicitly enabled with `-ea` at runtime —
disabled by default, exactly as it is here, this assertion is silently skipped
entirely, and the division by zero happens anyway (`0.0 / 0`, printing `NaN`).
That's exactly why assertions are for catching bugs during development, not for
logic your program depends on in production.
