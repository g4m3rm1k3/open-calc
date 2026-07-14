---
concept: 010-return-value
name: Return Value
---

## Definition

A return value is the result a function sends back to whoever called it, produced
by a `return` statement that also immediately ends the function's execution.

## Problem

A function that only prints its result is only useful for exactly that purpose —
the caller can't use that result in a calculation, store it, or pass it somewhere
else. Returning a value instead lets the caller decide what to do with it.

## Computer Science

`return` does two things at once: it hands a value back to the caller's stack
frame, and it immediately terminates the current function — any code after
`return` in the same execution path never runs.

Tags: Call stack, Control flow, Function termination

## Software Engineering

A function that sometimes returns a value and sometimes returns nothing
(`undefined`/`None`/`null`) depending on which branch executes is a common source
of bugs — the caller has to remember to check, and it's easy to forget. Being
consistent about what a function returns in every path is worth the extra thought.

Tags: Consistency, Null safety, API contracts

## Common Mistakes

- Writing code after a `return` statement in the same branch, not realizing it will never execute.
- A function that returns a value in some branches but implicitly returns nothing in others, forcing every caller to guard against an unexpected `undefined`/`None`.

## Exercises

- In the Python example, add an `else` branch that returns a different message, and predict which one runs for a negative number.
- Add a line of code directly after the `return` statement in the JavaScript example and confirm it never executes.

## javascript

```javascript
function absoluteValue(n) {
  if (n < 0) {
    return -n
  }
  return n
}

console.log(absoluteValue(-5))   // 5
console.log(absoluteValue(5))    // 5
```
Walkthrough: for `-5`, `n < 0` is true, so `return -n` runs, sending back `5` and
immediately ending the function — the second `return n` is never reached for this
call. For `5`, the first branch is skipped and the second `return n` runs instead.

## python

```python
def absolute_value(n):
    if n < 0:
        return -n
    return n

print(absolute_value(-5))   # 5
print(absolute_value(5))    # 5
```
Walkthrough: identical logic and identical behavior to the JavaScript version —
`return` ends the function the instant it runs, in every language shown here.

## java

```java
static int absoluteValue(int n) {
    if (n < 0) {
        return -n;
    }
    return n;
}

System.out.println(absoluteValue(-5));   // 5
System.out.println(absoluteValue(5));    // 5
```
Walkthrough: same behavior again, with one static-typing consequence worth
noticing: Java's compiler requires *every* possible path through the function to
return a value of the declared type (`int`) — a function declared to return `int`
that has a branch with no `return` at all fails to compile. Python and JavaScript
have no such check; a missing return path silently returns `None`/`undefined`.
