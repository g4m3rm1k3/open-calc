---
concept: 168-currying
name: Currying
---

## Definition

Currying transforms a function that takes multiple arguments into a
sequence of functions that each take ONE argument — calling the curried
function with the first argument returns a new function waiting for the
second, and so on, until all arguments have been supplied and the final
result is computed.

## Problem

A regular multi-argument function requires ALL its arguments at once,
every time it's called — but sometimes you want to fix SOME arguments
early and supply the rest later (e.g., a generic "multiply" function
specialized into a reusable "double" function by fixing one argument to
2). Currying makes this partial-application pattern natural, since each
step returns a new function waiting for the next argument.

## Execution

A regular add function requires BOTH arguments together to produce a
result
↓
A curried version instead takes the first argument and returns a NEW
function still waiting for the second
↓
Calling that returned function with the second argument NOW computes the
final result
↓
Saving that intermediate function creates a reusable, specialized
function (e.g., "add 2 to anything")
↓
That specialized function can be reused with different second arguments,
without re-supplying the first

## Computer Science

Currying is a direct application of first-class functions and closures —
each returned function "remembers" (via closure) the argument(s) already
supplied, which is exactly what lets the final function, called much
later, still have access to the earlier arguments even though the outer
function call has long since returned.

Tags: Closures, Partial application, Function composition

## Software Engineering

Currying/partial application is genuinely useful for creating
specialized, reusable versions of a generic function (e.g., a generic
HTTP request function curried into a `getFromApi` function, reused across
many specific endpoints) — though in practice, many languages/codebases
achieve the same specialization goal with an explicit "partial
application" helper instead of manually writing nested curried functions.

Tags: Partial application helpers, Specialization, Reusable configuration

## Common Mistakes

- Confusing currying (transforming into a CHAIN of single-argument functions) with simply having default arguments or an argument object — currying specifically means each step returns a new callable function, not just a function with optional parameters.
- Over-currying simple functions that are always called with all their arguments together anyway — currying adds real indirection, which is only worth it when partial application is actually a pattern you need.

## Exercises

- Trace through calling the curried function with just its first argument, WITHOUT immediately supplying the second — what is the actual value at that point (a number, or something else)?
- Write a curried `multiply` function, then create a specialized `double` function from it by fixing one argument.

## javascript

```javascript
// A hand-written curried function, demonstrating partial application via
// closures -- each returned function remembers its already-supplied argument.
function curriedAdd(a) {
  return function(b) {
    return a + b
  }
}

console.log(typeof curriedAdd(2))   // 'function' -- curriedAdd(2) alone is NOT the final result, it's another function
console.log(curriedAdd(2)(3))       // 5 -- supplying the second argument computes the final result

const add2 = curriedAdd(2)   // save the intermediate function -- a specialized, reusable "add 2" function
console.log(add2(10))        // 12
console.log(add2(100))       // 102 -- reused with different second arguments, `a` still remembered via closure
```
Walkthrough: `curriedAdd(2)` alone returns a FUNCTION, not a number — it
takes a second call, `(3)`, to actually produce `5`. Saving that
intermediate function as `add2` creates a genuinely reusable, specialized
function that still remembers `a = 2` from the first call, thanks to
closures, letting it be called repeatedly with different second
arguments.

## python

```python
def curried_add(a):
    def inner(b):
        return a + b
    return inner


print(callable(curried_add(2)))   # True -- curried_add(2) alone is NOT the final result, it's another function
print(curried_add(2)(3))          # 5 -- supplying the second argument computes the final result

add2 = curried_add(2)   # save the intermediate function -- a specialized, reusable "add 2" function
print(add2(10))         # 12
print(add2(100))        # 102 -- reused with different second arguments, `a` still remembered via closure
```
Walkthrough: identical closure-based currying mechanics as the JavaScript
version — `curried_add(2)` returns a callable function still waiting for
`b`, and `add2` remains a reusable, specialized function remembering
`a = 2`.
