---
concept: 013-error-handling
name: Error Handling (try/catch)
---

## Definition

Error handling lets a program detect that something went wrong during execution
and respond deliberately — retry, show a message, clean up — instead of crashing
immediately or silently continuing with bad data.

## Problem

Some failures are only knowable at runtime — a file that doesn't exist, a network
request that times out, a division by zero. Without a way to catch these, the
first one that occurs stops the entire program.

## Computer Science

Throwing an exception immediately stops normal execution and unwinds the call
stack — popping one frame after another — searching each one for a matching
`catch`/`except` block. If none is found all the way up to the program's entry
point, the program terminates. This is a fundamentally different control flow
from a normal return: it can jump out of many nested function calls at once,
skipping all their remaining code.

Tags: Stack unwinding, Control flow, Exception propagation

## Software Engineering

Catching an exception only where you can actually do something meaningful about
it — retry, fall back to a default, show the user something useful — is the goal.
Catching everything immediately and silently ignoring it ("swallowing" the error)
hides real bugs and makes them far harder to find later.

Tags: Fail fast, Swallowed exceptions, Graceful degradation

## Common Mistakes

- Catching an exception and doing nothing with it (an empty `catch` block) — the program continues as if nothing happened, and the real problem resurfaces somewhere else, much harder to trace back to its actual cause.
- Using error handling for normal, expected control flow (e.g. catching an exception to check if a key exists in a map) instead of an explicit check — this is usually both slower and less readable than the direct check.

## Exercises

- In the JavaScript example, change the divisor to a non-zero number and confirm the catch block never runs.
- In Python, add a second `except` clause for a different exception type and trigger it deliberately.

## javascript

```javascript
function safeDivide(a, b) {
  try {
    if (b === 0) throw new Error('Cannot divide by zero')
    return a / b
  } catch (error) {
    console.log('Error caught:', error.message)
    return null
  }
}

console.log(safeDivide(10, 0))
```
Walkthrough: `throw` immediately stops normal execution inside the `try` block and
jumps to the matching `catch`. `error.message` holds the string passed to `Error`.
The function then returns `null` instead of letting the error propagate further
up — the caller gets a clean, predictable result instead of a crash.

## python

```python
def safe_divide(a, b):
    try:
        if b == 0:
            raise ValueError('Cannot divide by zero')
        return a / b
    except ValueError as error:
        print('Error caught:', error)
        return None

print(safe_divide(10, 0))
```
Walkthrough: `raise` is Python's `throw`. `except ValueError as error` only
catches that specific exception type — a different exception type raised inside
the `try` block would not be caught here and would propagate further up, unlike a
bare `except:` which would catch anything.

## java

```java
static Double safeDivide(int a, int b) {
    try {
        if (b == 0) throw new ArithmeticException("Cannot divide by zero");
        return (double) a / b;
    } catch (ArithmeticException error) {
        System.out.println("Error caught: " + error.getMessage());
        return null;
    }
}

System.out.println(safeDivide(10, 0));
```
Walkthrough: same shape as the other two — `catch (ArithmeticException error)`
only catches that specific exception class (and its subclasses), consistent with
Python's typed `except`. Java additionally distinguishes **checked** exceptions
(which the compiler forces calling code to handle or declare) from **unchecked**
ones like `ArithmeticException` — a real, Java-specific distinction neither Python
nor JavaScript has.
