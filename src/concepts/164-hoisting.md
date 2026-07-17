---
concept: 164-hoisting
name: Hoisting
---

## Definition

Hoisting is JavaScript's behavior of processing variable and function
DECLARATIONS before executing any code in a scope — meaning a function
declared later in the code can still be called from earlier lines, and a
`var`-declared variable exists (as `undefined`) even before the line that
declares it runs.

## Problem

Code that reads top-to-bottom, line by line, would suggest that using a
variable or function BEFORE its declaration line should fail — but
JavaScript's actual execution model processes declarations first, which
can either help (calling a function defined later in the file works fine)
or confuse (reading a `var` before its declaration line silently gives
`undefined` instead of an error, hiding what would otherwise be an
obvious bug).

## Execution

Logging a `var`-declared variable BEFORE its declaration line prints
`undefined`, NOT an error
↓
The DECLARATION was hoisted to the top of the scope (so the variable
already existed as `undefined`), but the ASSIGNMENT stays exactly where
it was written
↓
Calling a function BEFORE its definition appears in the code still WORKS
↓
Function DECLARATIONS (this specific form) are hoisted completely,
including their body, not just their name
↓
By contrast: reading a `let`/`const` variable before its declaration line
throws a ReferenceError — they're hoisted too, technically, but left in
an inaccessible "temporal dead zone" until that line actually runs

## Computer Science

Hoisting reflects a two-phase execution model — JavaScript first scans a
scope for declarations (creating the variable/function bindings), THEN
executes the code line by line; `var` and function declarations get
useful default behavior in the first phase (initialized to `undefined`,
or the full function body respectively), while `let`/`const` are
recognized in phase one but deliberately left inaccessible until their
actual declaration line executes.

Tags: Two-phase execution, Temporal dead zone, var vs let/const

## Software Engineering

Relying on hoisting behavior (calling a function before its definition,
reading a `var` before its declaration) makes code harder to read
top-to-bottom and easy to misunderstand — the near-universal modern
practice is to declare everything with `let`/`const` (which fail loudly
via the temporal dead zone rather than silently returning `undefined`)
and to define functions before using them, treating hoisting as an
implementation detail to understand, not a feature to lean on.

Tags: Code readability, let/const preference, Avoiding hoisting reliance

## Common Mistakes

- Relying on `var` hoisting and being surprised that a variable is `undefined` (not an error) when read before its declared line — this often masks what should have been an obvious bug, which is exactly why `let`/`const`'s stricter behavior (throwing instead) is now preferred.
- Assuming ALL function syntax is hoisted the same way — function DECLARATIONS are, but function EXPRESSIONS assigned to a `var`/`let`/`const` are not (the variable follows that declaration type's own hoisting rules, and the function body isn't available until the assignment line runs).

## Exercises

- Trace through what happens if a function were instead written as a function expression assigned to a `const` and called before that line — would it still work?
- Explain why reading a `let` variable before its declaration throws an error while reading a `var` in the same position returns `undefined` instead — what does this difference actually protect against?

## javascript

```javascript
// Demonstrating var-hoisting (declaration hoisted, assignment stays put)
// vs. let's temporal dead zone (inaccessible until its own line runs).
console.log(hoistedVar)   // undefined -- NOT an error; the declaration was hoisted, but not yet assigned
var hoistedVar = 'value'
console.log(hoistedVar)   // 'value' -- now assigned, since we've passed that line

console.log(sayHi())   // 'hi' -- function DECLARATIONS are hoisted with their full body, callable before their line
function sayHi() { return 'hi' }

try {
  console.log(letVar)   // this line never completes
  let letVar = 'value'
} catch (err) {
  console.log(err.constructor.name)   // 'ReferenceError' -- let is left inaccessible until ITS OWN line runs
}
```
Walkthrough: `hoistedVar` prints `undefined` (not an error) before its
declaration line, since `var` declarations are hoisted but not their
assignments. `sayHi()` works before its own definition appears in the
code, since function declarations are hoisted completely, body included.
Reading `letVar` before its `let` line, by contrast, throws a
`ReferenceError` — `let` is intentionally left inaccessible (the
"temporal dead zone") until its own declaration line actually executes.

## python

```python
# Python has NO hoisting at all -- names simply don't exist until their
# defining statement has actually executed, for every kind of declaration.
try:
    print(not_yet_defined)   # this line never completes
    not_yet_defined = 'value'
except NameError as err:
    print(type(err).__name__)   # NameError -- there is no hoisted, pre-existing "undefined" state at all


def say_hi():
    return 'hi'


print(say_hi())   # 'hi' -- this works, but only because Python executed the def statement above
                    # before say_hi() is actually CALLED here -- calling it earlier in the file would fail
```
Walkthrough: Python has no hoisting mechanism whatsoever — a name simply
doesn't exist until the statement that creates it has run, which is why
`not_yet_defined` raises a `NameError` rather than resolving to some
placeholder value like JavaScript's hoisted `var`. `say_hi()` works here
only because its `def` already executed earlier in this same top-to-
bottom script, unlike JavaScript's function-declaration hoisting, which
would make it work even if called BEFORE its `def` line.
