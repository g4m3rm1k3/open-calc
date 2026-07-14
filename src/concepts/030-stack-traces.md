---
concept: 030-stack-traces
name: Stack Traces
---

## Definition

A stack trace is a report of exactly which function calls were active — and in
what order — at the moment an exception was thrown, from the point of failure
back up through every caller that led there.

## Problem

A thrown exception on its own only says what went wrong and where it was thrown
from — it doesn't say how the program got there. When a deeply nested call fails,
you need the whole chain of calls that led to that point to actually find the
bug, not just the last line.

## Execution

An exception is thrown inside some deeply nested function call
↓
The runtime is already tracking every active call as a stack frame, from the
program's entry point down to the function that just threw
↓
That list of frames — in order, most recent first — is captured as the stack trace
↓
If the exception goes uncaught, the stack trace is what actually gets printed,
showing every frame from the throw site back to the entry point

## Computer Science

A stack trace is a direct, human-readable view of the call stack at one specific
instant — every line corresponds to one stack frame that was still active when
the exception fired, in the exact order those calls were made.

Tags: Call stack, Debugging, Program state inspection

## Software Engineering

Reading a stack trace from the top down tells you exactly where to start looking
— the top line is the throw site itself, and each line below it is one caller
further back. The bug is very often at or near the top, but the full trace tells
you the path that led there, which matters when the same function is called from
many different places.

Tags: Debugging workflow, Root cause analysis, Log readability

## Common Mistakes

- Reading a stack trace bottom-to-top out of habit — the most useful information (where the exception actually fired) is at the top, not the bottom.
- Catching an exception and only logging its message, discarding the stack trace — this throws away the exact call path that would have made the bug fast to find.

## Exercises

- In the Java example, add a fourth layer of function calls before the one that throws, and predict how many lines the stack trace will grow by before running it.
- In Python, compare `str(err)` (just the message) against printing the full traceback, and notice how much more the full trace tells you.

## javascript

```javascript
function validateAge(age) {
  if (age < 0) throw new RangeError('age cannot be negative')
}
function createProfile(age) {
  validateAge(age)
}
function signUp(age) {
  createProfile(age)
}
signUp(-3)
```
Walkthrough: the uncaught `RangeError`'s stack trace lists `validateAge`, then
`createProfile`, then `signUp` — the exact chain of calls, in order, that led to
the throw, even though the error only actually happened inside `validateAge`.

## python

```python
def validate_age(age):
    if age < 0:
        raise ValueError('age cannot be negative')

def create_profile(age):
    validate_age(age)

def sign_up(age):
    create_profile(age)

sign_up(-3)
```
Walkthrough: Python's traceback reads top-to-bottom as "most recent call last" —
the opposite visual order from reading a JavaScript trace, but the same
information: `sign_up` called `create_profile` called `validate_age`, which is
where the actual `raise` happened.

## java

```java
static void validateAge(int age) {
    if (age < 0) throw new IllegalArgumentException("age cannot be negative");
}
static void createProfile(int age) {
    validateAge(age);
}
static void signUp(int age) {
    createProfile(age);
}

signUp(-3);
```
Walkthrough: the uncaught exception's stack trace shows `at Main.validateAge`,
`at Main.createProfile`, `at Main.signUp`, `at Main.main` — four frames, each one
exactly where the call to the next frame down was made.
