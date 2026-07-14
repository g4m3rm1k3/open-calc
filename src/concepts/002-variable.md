---
concept:002-variable
name: Variable
---

## Definition

A variable is a named storage location that holds a value, which the program can
read or replace by name instead of by memory address.

## Problem

A program needs to remember values between steps — a running total, a user's name,
a loop's current position. Without a name to refer back to, each of those values
would only exist for the instant it was computed.

## Computer Science

A variable is a binding between a name (an identifier) and a value, held in the
current scope. Looking up `age` doesn't search memory directly — it looks up the
name in a symbol table for the current scope, which holds the actual value or a
reference to it.

Tags: Symbol table, Binding, Identifier, Scope

## Software Engineering

A descriptive variable name is documentation that never goes stale — `daysUntilExpiry`
communicates intent in a way `d` never can. Reusing one variable for two unrelated
purposes in the same function is a common source of bugs that a second, clearly-named
variable would have avoided entirely.

Tags: Naming, Readability, Self-documenting code

## Common Mistakes

- Giving variables names that describe their type instead of their purpose (`stringValue` instead of `userName`).
- Reassigning a variable to hold something unrelated to its original name partway through a function, making the code lie about what the variable contains.

## Exercises

- In the Python example, add a second variable and use it to compute something from the first before printing.
- Predict what happens if you try to read a variable in JavaScript before the line that declares it with `let`.

## javascript

```javascript
let score = 0
console.log(score)
score = score + 10
console.log(score)
```
Walkthrough: `let score = 0` creates the binding and stores `0`. `score = score + 10`
reads the current value, adds 10, and stores the result back under the same name —
`score` now refers to `10`. The name never changed; only the value it points to did.

## python

```python
score = 0
print(score)
score = score + 10
print(score)
```
Walkthrough: identical behavior to JavaScript here — `score` is rebound to a new
value each assignment. Python has no separate "declare" step the way `let` is one
in JavaScript; the first assignment to a name **is** its declaration, valid
anywhere that name doesn't already exist in the current scope.

## java

```java
int score = 0;
System.out.println(score);
score = score + 10;
System.out.println(score);
```
Walkthrough: `int score = 0;` both declares the variable's type (`int`) and its
initial value in one statement — unlike Python and JavaScript, Java requires the
type to be fixed at declaration and never change afterward (Java is statically
typed; see the Type concept). `score = score + 10;` updates the stored value the
same way, just within that fixed type.
