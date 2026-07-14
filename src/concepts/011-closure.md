---
concept: 011-closure
name: Closure
---

## Definition

A closure is a function that remembers the variables from the scope it was
created in, even after that outer scope has finished running.

## Problem

Sometimes a function needs private state that persists across multiple calls — a
counter that increments each time it's called, without exposing that counter as a
global or passing it in on every call. Closures let a function carry that state
with it.

## Computer Science

Normally, a function's local variables disappear once it returns — its stack
frame is popped. A closure keeps those variables alive by capturing a reference to
the enclosing scope, not a copy of the values at the time of creation — this is
why multiple closures created in the same outer scope all see updates to a shared
captured variable.

Tags: Lexical scope, Stack frames, Captured variables

## Software Engineering

Closures are how many languages implement "private" state without a full class —
a counter closure has state nothing outside it can directly touch, only through
whatever function the closure exposes. This is the same encapsulation goal a class
serves, achieved with just a function.

Tags: Encapsulation, Module pattern, Private state

## Common Mistakes

- Creating closures inside a loop that all capture the *same* loop variable by reference, then being surprised they all see the loop's final value instead of the value at the time each closure was created (a classic `var` vs `let` gotcha in JavaScript specifically).
- Assuming a closure captures a snapshot of a variable's value at creation time — it actually captures a live reference, so later changes to that variable are visible inside the closure too.

## Exercises

- Create two separate counters using the JavaScript example and confirm they track independently, not sharing state.
- In Python, try changing `count` inside the inner function without the `nonlocal` keyword and observe the error — this reveals a real Python-specific closure rule.

## javascript

```javascript
function makeCounter() {
  let count = 0
  return function () {
    count += 1
    return count
  }
}

const counter = makeCounter()
console.log(counter())   // 1
console.log(counter())   // 2
```
Walkthrough: `makeCounter` runs once, creating `count` and returning an inner
function. Normally `count` would vanish once `makeCounter` finishes — instead, the
returned function keeps a live reference to it. Each call to `counter()` reuses
that same `count`, incrementing it further rather than starting over at 0.

## python

```python
def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter = make_counter()
print(counter())   # 1
print(counter())   # 2
```
Walkthrough: same closure behavior as JavaScript, with one real syntactic
difference — Python requires the explicit `nonlocal count` declaration before
*reassigning* a captured variable from an inner function (reading it without
`nonlocal` works fine; writing to it does not without this line). JavaScript and
Java have no equivalent requirement.

## java

```java
import java.util.function.Supplier;

static Supplier<Integer> makeCounter() {
    int[] count = {0};   // array used as a workaround — see walkthrough
    return () -> {
        count[0] += 1;
        return count[0];
    };
}

Supplier<Integer> counter = makeCounter();
System.out.println(counter.get());   // 1
System.out.println(counter.get());   // 2
```
Walkthrough: Java's lambdas can only capture variables that are "effectively
final" — never reassigned after their first value. A plain `int count = 0;`
couldn't be incremented inside the lambda at all; wrapping it in a single-element
array works around this because the array reference itself never changes, only
its contents — this is a real, Java-specific limitation the other two languages
don't share.
