---
concept: 009-function
name: Function
---

## Definition

A function is a named, reusable block of code that can be called from anywhere,
optionally accepting inputs (parameters) and optionally producing an output
(a return value).

## Problem

Without functions, any logic used more than once has to be copy-pasted everywhere
it's needed — and every future fix has to be applied to every copy, individually,
without missing one.

## Execution

Call greet('Alice')
↓
A new stack frame is pushed, binding the parameter name → 'Alice'
↓
The function body runs inside that frame, using the bound parameter
↓
The body reaches a return — the result value is computed
↓
The stack frame is popped, discarding its local bindings
↓
Execution resumes at the call site, with the return value in hand

## Computer Science

Calling a function pushes a new **stack frame** onto the call stack — memory
holding that call's parameters, local variables, and where to resume execution
when it returns. When the function returns, its frame is popped, and execution
resumes exactly where the call happened.

Tags: Call stack, Stack frames, Subroutines

## Software Engineering

A function with one clear job, named for what it does, is one of the most
reliable ways to make code readable — `calculateTax(price)` tells a reader what
happens without them reading the implementation. A function doing several
unrelated things under one name is a common source of code nobody wants to touch.

Tags: Single responsibility, Naming, Reusability

## Common Mistakes

- Writing a function that does too many unrelated things, making its name (and its tests) awkward because there's no one thing it actually does.
- Forgetting that a function's parameters are separate variables from whatever was passed in — reassigning a parameter inside the function doesn't change the caller's original variable, only the local copy of a primitive value (see Reference vs Copy).

## Exercises

- Add a second parameter to the `greet` function in each language and use it in the returned string.
- Predict what happens if you call the JavaScript function with no arguments at all.

## javascript

```javascript
function greet(name) {
  return `Hello, ${name}!`
}

console.log(greet('Alice'))
```
Walkthrough: `greet` takes one parameter, `name`. Calling `greet('Alice')` pushes a
new stack frame binding `name` to `'Alice'`, runs the template-string expression,
and returns the resulting string back to the caller, where `console.log` prints it.

## python

```python
def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))
```
Walkthrough: `def` declares the function. Python's f-string (`f"..."`) is its
equivalent of JavaScript's template literal — both interpolate a variable directly
into a string. Everything else about the call/return mechanics is the same as
JavaScript's version.

## java

```java
static String greet(String name) {
    return "Hello, " + name + "!";
}

System.out.println(greet("Alice"));
```
Walkthrough: Java requires declaring both the parameter's type (`String name`) and
the function's return type (`String` before the name) — consistent with Java's
static typing (see the Type concept). `static` here means this method belongs to
the class itself, not to any particular instance of it (relevant once classes and
instances are introduced).
