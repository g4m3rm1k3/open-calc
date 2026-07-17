---
concept: 079-template-literals
name: Template Literals / String Interpolation
---

## Definition

Template literals (or f-strings) let a variable or expression be embedded
directly inside a string, evaluated and inserted at that exact position —
instead of manually concatenating string pieces with a variable's value.

## Problem

Building a string out of a mix of literal text and variable values by
concatenating pieces together is verbose and easy to get wrong — misplaced
spaces, a missing concatenation operator, manually converting a number to a
string. Interpolation lets the variable be written directly where its
value should appear in the final string.

## Execution

name = "Alice", age = 30
↓
Template: `Hello, ${name}! You are ${age} years old.`
↓
Each `${...}` expression is evaluated first — name → "Alice", age → 30
↓
Each result is converted to its string form and spliced into that exact position
↓
Final string: "Hello, Alice! You are 30 years old."

## Computer Science

Under the hood, a template literal or f-string is usually just syntactic
sugar compiled into ordinary string concatenation (or a dedicated
string-building call) — the interpolated version and the equivalent
concatenated version produce the identical runtime value. The interpolation
syntax exists purely for the author's convenience and readability, not
because it does something concatenation couldn't.

Tags: Syntactic sugar, String concatenation, Compile-time desugaring

## Software Engineering

Interpolated strings are far more readable than concatenation once more
than one or two variables are involved, and they eliminate an entire class
of bugs caused by a forgotten operator or a missing space between
concatenated pieces. Nearly every modern language has converged on some form
of this as the default way to build a string with embedded values.

Tags: Readability, String formatting, Cross-language convergence

## Common Mistakes

- Forgetting the special interpolation syntax (backticks and `$` in JS, the `f` prefix in Python) and ending up with the literal, un-evaluated placeholder text in the output instead of the variable's value.
- Interpolating user-provided input directly into a string that's then used as a SQL query or shell command — this is exactly the injection vulnerability class that parameterized queries and proper escaping exist to prevent; interpolation itself is safe for building display text, not for building code or queries from untrusted input.

## Exercises

- Build the same output string using plain concatenation instead of interpolation, and count how many more characters — and opportunities for a typo — it takes.
- Predict what a JavaScript template literal prints if the `$` is forgotten and only `{name}` is written inside backticks — then confirm by running it.

## javascript

```javascript
const name = 'Alice'
const age = 30

console.log(`Hello, ${name}! You are ${age} years old.`)
console.log(`Next year you'll be ${age + 1}.`)   // expressions, not just variables, work too
```
Walkthrough: each `${...}` is evaluated as a real expression first —
`age + 1` actually computes `31` — then converted to a string and spliced
into that exact position in the surrounding template, all in one step,
without any explicit concatenation operator.

## python

```python
name = 'Alice'
age = 30

print(f'Hello, {name}! You are {age} years old.')
print(f"Next year you'll be {age + 1}.")   # expressions, not just variables, work too
```
Walkthrough: identical interpolation behavior to JavaScript's template
literals — the `f` prefix marks this as an f-string, and each `{...}` is
evaluated as a real expression before being spliced into the final string.
