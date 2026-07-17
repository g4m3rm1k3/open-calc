---
concept: 163-scope
name: Scope
---

## Definition

Scope determines where in a program a variable is visible and accessible
— a variable declared inside a function is typically only visible within
that function (local scope), while one declared outside any function may
be visible everywhere (global scope), with nested functions able to see
variables from their enclosing scopes.

## Problem

Without scoping rules, every variable would be visible everywhere, all
the time — any function could accidentally read or overwrite ANY other
function's variables just by using the same name, since there'd be no way
to keep them separate. Scope creates boundaries so variables with the
same name in different functions don't collide, and so a function's
internal details stay genuinely private unless deliberately exposed.

## Execution

A variable declared at the top level exists in global scope
↓
An outer function declares its own local variable, then defines a nested
inner function that declares ITS OWN local variable
↓
Inside the inner function: its own variable is accessible (its own local
scope), the outer function's variable is accessible (from the ENCLOSING
scope), and the global variable is accessible too — inner can see all
three, following the chain outward
↓
But the outer function itself CANNOT access the inner function's
variable — that variable only exists within the inner function's own
local scope, and that scope doesn't leak outward to its enclosing
function

## Computer Science

This nested visibility follows what's called "lexical scoping" — a
variable's scope is determined by WHERE it's written in the source code
(its nesting structure), not by which function happened to call which;
this is why an inner function can see its outer function's variables
(it's nested inside it in the code), but the outer function can't see the
inner function's variables (nesting only grants visibility INWARD →
OUTWARD, never the other way).

Tags: Lexical scoping, Nested functions, Scope chain, Closures

## Software Engineering

Keeping variables in the smallest scope that actually needs them (rather
than declaring everything globally) is a core practice for avoiding
naming collisions and making code easier to reason about — a variable
declared inside a function can't accidentally be read or overwritten by
unrelated code elsewhere, which becomes a real risk once a codebase has
many global variables with common names.

Tags: Minimal scope, Naming collisions, Encapsulation

## Common Mistakes

- Declaring variables globally "for convenience" when they're only actually needed inside one function — this increases the risk of naming collisions and makes it harder to reason about where a variable might be changed from.
- Assuming an outer function can access variables declared inside a nested inner function — visibility only flows inward-to-outward (inner sees outer), never the reverse.

## Exercises

- Trace through the example above and explain specifically why the inner function can log all three variables but the outer function on its own could only log two of them.
- Identify one variable in a program you've written that was declared with broader scope than it actually needed, and explain what risk that created.

## javascript

```javascript
// Demonstrating lexical (nested) scoping directly: inner scopes can see
// outer variables, but outer scopes can't see inner ones.
let x = 'global'

function outer() {
  let y = 'outer'
  function inner() {
    let z = 'inner'
    return `${x}, ${y}, ${z}`   // inner sees ALL THREE -- its own, outer's, and global
  }
  return inner()
}

console.log(outer())   // 'global, outer, inner' -- inner's scope chain reaches all the way out to global

try {
  console.log(z)   // z was never visible outside inner() at all
} catch (err) {
  console.log(err.constructor.name)   // 'ReferenceError' -- z simply doesn't exist in this outer scope
}
```
Walkthrough: `inner()` successfully reads `x` (global), `y` (from
`outer`'s enclosing scope), and its own `z`, following the scope chain
outward. But attempting to read `z` from OUTSIDE `inner()` throws a
`ReferenceError` — `z`'s scope never extends beyond the function it was
declared in, demonstrating that visibility flows inward-to-outward only,
never the reverse.

## python

```python
x = 'global'


def outer():
    y = 'outer'

    def inner():
        z = 'inner'
        return f'{x}, {y}, {z}'   # inner sees ALL THREE -- its own, outer's, and global

    return inner()


print(outer())   # global, outer, inner -- inner's scope chain reaches all the way out to global

try:
    print(z)   # z was never visible outside inner() at all
except NameError as err:
    print(type(err).__name__)   # NameError -- z simply doesn't exist in this outer scope
```
Walkthrough: identical nested-scope-chain mechanics as the JavaScript
version — `inner()` can see all three variables by following the chain
outward, while `z` remains completely inaccessible outside `inner()`'s
own local scope, raising a `NameError` when attempted.
