---
concept: 025-errors
name: Errors
---

## Definition

An error is a signal that something went wrong during a program's compilation or
execution — a value or event that interrupts normal flow so the problem can be
noticed and handled instead of silently producing wrong results.

## Problem

Without a distinct concept of "error," a program that hits a bad file path,
divides by zero, or receives invalid input would either crash unpredictably or
silently continue running on garbage data. Programs need a specific mechanism to
detect and separate "something is wrong" from "business as usual."

## Computer Science

Errors split into three categories with very different consequences. Compile-time
errors are caught by the compiler or parser before the program ever runs (a syntax
error). Runtime errors occur during execution (dividing by zero, accessing an
invalid index). Logic errors are the hardest: the program runs to completion
without any signal at all, but produces a wrong answer — nothing ever throws.

Tags: Compile-time errors, Runtime errors, Logic errors, Fault classification

## Software Engineering

Which category an error falls into determines the fix. Compile errors are caught
by the toolchain before anything ships. Runtime errors need handling code (see
Exceptions, throw, try/catch). Logic errors need tests, since by definition
nothing will ever throw to reveal them.

Tags: Fault tolerance, Testing, Toolchain feedback loops

## Common Mistakes

- Treating "no error was thrown" as proof the code is correct — logic errors never throw anything at all.
- Assuming a runtime error is a problem with the user's environment ("it works on my machine") instead of a real fault the code should handle.

## Exercises

- In the JavaScript example, change the index to something in bounds and observe that no error occurs at all — the error only fires on the specific invalid access.
- Predict, before running: for the same out-of-bounds array access, does JavaScript, Python, or Java raise an error immediately at the access itself, or only later when the bad value is used?

## javascript

```javascript
const numbers = [10, 20, 30]
console.log(numbers[5].toFixed(2))
```
Walkthrough: `numbers[5]` is out of bounds, but JavaScript doesn't raise anything
for the access itself — it just returns `undefined`. The actual runtime error
(`TypeError: Cannot read properties of undefined`) only fires one step later, when
`.toFixed()` is called on that `undefined`.

## python

```python
numbers = [10, 20, 30]
print(numbers[5])
```
Walkthrough: unlike JavaScript, Python raises an `IndexError` immediately at the
invalid access itself — the error happens at the exact line and moment the bad
index is used, not one step later.

## java

```java
int[] numbers = {10, 20, 30};
System.out.println(numbers[5]);
```
Walkthrough: Java also raises immediately, like Python — an
`ArrayIndexOutOfBoundsException` — but enforced at the JVM level: every array
access is bounds-checked by the runtime itself, not by a language-level check
written into `List` the way Python's is.
