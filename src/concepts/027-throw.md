---
concept: 027-throw
name: throw
---

## Definition

`throw` is the statement that actually raises an exception — it hands a specific
error object to the runtime and immediately stops the current function's
execution at that exact point.

## Problem

A function that detects an invalid state (an argument out of range, a required
resource missing) needs a way to stop right there and signal the failure to
whoever called it, instead of continuing to run on bad data or silently returning
a wrong result.

## Execution

throw is reached with an error object
↓
The current function stops immediately — nothing after the throw in that
function executes
↓
Control transfers to the nearest enclosing catch that matches, skipping any
remaining code in between
↓
If no catch exists anywhere up the call stack, the program terminates and
reports the error

## Computer Science

`throw` is what makes an exception a genuine control-flow instruction, not a
wrapper around a normal return — it's closer to a non-local jump than a
`return`, since it can exit many nested calls at once, decided entirely by where
a matching catch happens to exist, not by any code between the throw and that
catch.

Tags: Control transfer, Non-local exit, Signaling

## Software Engineering

The value thrown matters as much as the act of throwing. Throwing a plain string
or generic error object gives a catcher almost nothing to work with, while
throwing a specific, well-named error type lets calling code make an informed
decision about how to respond — or at minimum, log something actually useful.

Tags: Error design, Fail-fast, Diagnostic quality

## Common Mistakes

- Throwing a bare string instead of an actual error object — most languages' catch machinery, stack traces, and tooling all assume a real error object, and a bare string loses that.
- Throwing deep inside a function without checking whether it's already inside a `try` that expects a *different* kind of failure — the throw still propagates correctly, but the catch that handles it may not make sense for this particular failure.

## Exercises

- In the JavaScript example, change the threshold check and confirm the function returns normally (no throw) when the input is valid — throw only interrupts the specific path that reaches it.
- In Python, change `raise ValueError(...)` to `raise TypeError(...)` and reason about how that would change which `except` clause could catch it, even before `except` is covered.

## javascript

```javascript
function withdraw(balance, amount) {
  if (amount > balance) throw new Error(`Cannot withdraw ${amount}, balance is only ${balance}`)
  return balance - amount
}
console.log(withdraw(100, 150))
```
Walkthrough: the `if` check finds the withdrawal too large, and `throw` fires —
`withdraw` stops on the spot, the subtraction on the next line never runs, and
the `Error` propagates straight out to the uncaught top level.

## python

```python
def withdraw(balance, amount):
    if amount > balance:
        raise ValueError(f'Cannot withdraw {amount}, balance is only {balance}')
    return balance - amount

print(withdraw(100, 150))
```
Walkthrough: `raise` is Python's `throw` — same effect, stopping `withdraw`
immediately at the raise, and the `ValueError` propagates uncaught since nothing
here catches it.

## java

```java
static int withdraw(int balance, int amount) {
    if (amount > balance) throw new IllegalStateException("Cannot withdraw " + amount + ", balance is only " + balance);
    return balance - amount;
}

System.out.println(withdraw(100, 150));
```
Walkthrough: same shape — `throw` stops `withdraw` at that exact line,
`balance - amount` never executes, and the `IllegalStateException` propagates out
of `withdraw` and out of `main`, uncaught.
