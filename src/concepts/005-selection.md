---
concept: 005-selection
name: Selection (if / else)
---

## Definition

Selection is choosing which block of code runs based on a condition — the
`if`/`else` family of control flow.

## Problem

A program that always executes the exact same steps in the exact same order can't
respond to different situations — a different user, a different input, an error
versus a success. Selection is what lets a program's behavior branch.

## Computer Science

Selection evaluates a boolean expression and transfers control to exactly one of
its branches — this is a fork in the program's control flow graph. Only one branch
ever executes for a given evaluation; the others are skipped entirely, not
evaluated and discarded.

Tags: Control flow, Branching, Boolean expressions

## Software Engineering

Deeply nested `if`/`else` chains are a common source of hard-to-follow code —
each level of nesting doubles the number of paths a reader has to mentally track.
Early returns ("guard clauses") that handle edge cases first and let the main
logic run unindented are a widely-used technique for flattening this.

Tags: Guard clauses, Cyclomatic complexity, Readability

## Common Mistakes

- Writing `if (x = 5)` (assignment) instead of `if (x == 5)` (comparison) in languages that allow it — the condition silently becomes "was the assignment successful," not "does x equal 5."
- Nesting `if`/`else` many levels deep instead of using early returns, making the actual logic hard to find.

## Exercises

- In the Python example, add an `elif` branch for a third case (e.g., a temperature exactly at freezing) and predict which branch runs.
- Rewrite the JavaScript example using an early return instead of if/else and compare readability.

## javascript

```javascript
const temperature = 15
if (temperature < 0) {
  console.log('freezing')
} else if (temperature < 20) {
  console.log('cool')
} else {
  console.log('warm')
}
```
Walkthrough: JavaScript checks `temperature < 0` first — false, since 15 is not
less than 0 — then checks `temperature < 20` — true — so `'cool'` prints and no
further branch is checked, even though the final `else` exists.

## python

```python
temperature = 15
if temperature < 0:
    print('freezing')
elif temperature < 20:
    print('cool')
else:
    print('warm')
```
Walkthrough: same evaluation order as JavaScript — `elif` is Python's word for
"else if," combining the two into one keyword. Indentation (not curly braces)
defines which lines belong to which branch — this is significant whitespace, a
real syntactic difference from JavaScript and Java, not just a style preference.

## java

```java
int temperature = 15;
if (temperature < 0) {
    System.out.println("freezing");
} else if (temperature < 20) {
    System.out.println("cool");
} else {
    System.out.println("warm");
}
```
Walkthrough: identical control flow to JavaScript's version — Java's `if`/`else if`/`else`
syntax is nearly character-for-character the same as JavaScript's, since both
descend from C's syntax for this construct.
