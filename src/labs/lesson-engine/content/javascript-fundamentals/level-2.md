---
series: javascript-fundamentals
level: 2
title: Scope & the Call Stack
lang: javascript
---

# Scope & the Call Stack

**Scope** is the set of variables a piece of code can see. Without scope rules, every variable in a program would be visible to every other piece of code — changing a variable in one function could silently break another. Scope gives each function its own private space.

This lesson teaches what scope is, how JavaScript resolves variable names by walking up scope levels, and what the call stack looks like when functions call other functions.

## Local Scope

Variables declared with `let` or `const` inside a function exist only inside that function. They are **local** to the function:

```javascript
function computeCircle(radius) {
  const pi = 3.14159
  const area = pi * radius * radius
  const circumference = 2 * pi * radius
  return area
}

console.log(computeCircle(5))
```

```text
78.53975
```

`pi`, `area`, and `circumference` exist only while `computeCircle` is running. After the function returns, they are gone. Trying to use `pi` outside the function would throw `ReferenceError: pi is not defined`.

This is the point of local scope: `computeCircle` can use `pi` without worrying that something outside the function will accidentally change it.

**Enable Debug and step through this.** Watch `pi`, `area`, and `circumference` appear in the variables panel when `computeCircle` is called, and disappear when it returns.

## Global Scope

A variable declared outside all functions is in **global scope** — visible everywhere in the file:

```javascript
const appName = "OpenCalc"

function header() {
  return appName + " — Learn to Code"
}

function footer() {
  return "© " + appName
}

console.log(header())
console.log(footer())
```

```text
OpenCalc — Learn to Code
© OpenCalc
```

`appName` is in global scope. Both `header` and `footer` can read it.

**SE lens:** Global variables are a source of bugs because any function can read or modify them. In JavaScript modules (Level 9), every file has its own module scope and nothing is truly global unless explicitly exported. Prefer `const` at the module level over true globals.

## Scope Lookup — How JavaScript Finds a Name

When JavaScript sees a name like `radius` inside a function, it looks it up in this order:

```text
1. Local scope (the current function)
2. Enclosing function scopes (outer functions, if any)
3. Global scope
4. Not found → ReferenceError
```

```javascript
const multiplier = 10

function scale(value) {
  const result = value * multiplier
  return result
}

console.log(scale(3))
console.log(scale(7))
```

```text
30
70
```

`multiplier` is not local to `scale`, so JavaScript looks outward and finds it in global scope. The lookup walks up the **scope chain** — a linked list of scopes from innermost to outermost.

## Shadowing

A local variable can have the same name as a global variable. The local one **shadows** the global one inside that function:

```javascript
const label = "global"

function showLabel() {
  const label = "local"
  console.log(label)
}

showLabel()
console.log(label)
```

```text
local
global
```

Inside `showLabel`, `label` refers to the local `"local"`. Outside, it refers to the global `"global"`. The global is not changed — just hidden from inside the function.

**CS lens:** Shadowing works because scope lookup stops at the first match. The runtime does not scan all scopes and then decide — it stops as soon as it finds the name. This is a property of lexical scoping: names resolve based on where the code is written, not how it is called.

## Block Scope

`let` and `const` are **block-scoped**: they exist only inside the nearest pair of `{ }`:

```javascript
function categorise(score) {
  let grade

  if (score >= 90) {
    grade = "A"
  } else if (score >= 70) {
    grade = "B"
  } else {
    grade = "C"
  }

  return grade
}

console.log(categorise(95))
console.log(categorise(75))
console.log(categorise(60))
```

```text
A
B
C
```

`grade` is declared before the `if` block so it is visible after it. Variables declared inside `if` blocks with `let`/`const` exist only inside that block. `var` (an older keyword) has function scope instead of block scope — avoid `var`; always use `let` or `const`.

## The Call Stack — Functions Calling Functions

When function A calls function B, JavaScript pauses A, creates a new stack frame for B, runs B to completion, then resumes A:

```javascript
function add(a, b) {
  return a + b
}

function sumSquares(x, y) {
  const xSquared = x * x
  const ySquared = y * y
  return add(xSquared, ySquared)
}

console.log(sumSquares(3, 4))
```

```text
25
```

Execution trace:
```text
call sumSquares(3, 4)
  x = 3, y = 4
  xSquared = 9
  ySquared = 16
  call add(9, 16)
    a = 9, b = 16
    return 25
  ← back in sumSquares
  return 25
← back at console.log
print 25
```

**Enable Debug and step through this.** Watch the call stack panel — it shows `sumSquares` at the bottom and `add` on top when `add` is running. When `add` returns, its frame disappears.

**CS lens:** The call stack is a LIFO (last-in, first-out) data structure. Each function call pushes a frame; each return pops one. If functions call each other in a cycle with no base case, the stack grows until it overflows — a **stack overflow** error. You will see this when you study recursion in Data Structures & Algorithms.

## Challenge: describe_range

Write a function `describeRange(minimum, maximum)` that returns a string describing the range.

`describeRange(1, 10)` → `"Range: 1 to 10, span: 9"`

The span is `maximum - minimum`. Use a template literal. The format is exactly: `"Range: ${minimum} to ${maximum}, span: ${span}"`.

```challenge
function describeRange(minimum, maximum) {
  // TODO
}
```

```test
assert describeRange(1, 10) === "Range: 1 to 10, span: 9"
assert describeRange(0, 100) === "Range: 0 to 100, span: 100"
assert describeRange(5, 5) === "Range: 5 to 5, span: 0"
assert describeRange(-10, 10) === "Range: -10 to 10, span: 20"
assert typeof describeRange(0, 1) === "string"
```
