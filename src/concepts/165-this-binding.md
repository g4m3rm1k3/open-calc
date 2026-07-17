---
concept: 165-this-binding
name: this Binding
---

## Definition

In JavaScript, `this` refers to the object a function is currently being
called ON — its value is determined by HOW the function is called (as a
method, standalone, with `new`, or via `.call()`/`.apply()`/`.bind()`),
not by where the function was originally defined.

## Problem

Because `this` depends on the CALL SITE rather than the function's
definition, the same function can have a completely different `this`
depending on how it's invoked — passing a method as a callback (e.g., to
`setTimeout` or an event handler) often "loses" its intended `this`,
becoming `undefined` or the wrong object, a very common source of
confusing bugs.

## Execution

An object has a `greet` method reading `this.name`
↓
Calling it AS A METHOD on the object — `this` is the object, so it
returns the name correctly
↓
Extracting the SAME function, now unattached to the object, and calling
it standalone — `this` is `undefined` (in strict mode) — reading
`this.name` throws, since `this` is no longer the original object
↓
Explicitly forcing `this` back to the original object for one call via
`.call()` — returns the correct name again, since `.call()` lets you set
`this` manually regardless of how the function is normally invoked

## Computer Science

`this` is fundamentally different from a normal variable — it isn't
resolved via lexical scope (see Scope) at all, but is instead set FRESH
on every function call based on the call site, which is precisely why
extracting a method and calling it separately changes its behavior even
though the function's own code never changed.

Tags: Call site, Dynamic binding, Method extraction, Strict mode

## Software Engineering

Arrow functions deliberately do NOT have their own `this` — they capture
`this` lexically from their ENCLOSING scope at definition time, which is
exactly why they're commonly used for callbacks inside methods (to
preserve the outer `this`) instead of regular functions, sidestepping the
"detached method" problem entirely.

Tags: Arrow functions, Lexical this, Callback patterns

## Common Mistakes

- Passing an object's method directly as a callback without binding it — this detaches the method from its object, so `this` inside it is no longer that object when it eventually runs.
- Assuming `this` is determined by where a function is DEFINED (like a normal variable would be) — it's actually determined by how it's CALLED, which is a fundamentally different rule from ordinary scoping.

## Exercises

- Trace through what the detached function would return if it were instead attached to a completely different object and called through that one — what does `this` become in THAT call?
- Explain why an arrow function defined inside a method can safely use `this` to refer to the method's own object, even when passed elsewhere as a callback.

## javascript

```javascript
const obj = {
  name: 'Alice',
  greet() { return this.name }
}

console.log(obj.greet())   // 'Alice' -- called AS A METHOD on obj, so `this` is obj

const detached = obj.greet   // extract the function -- same code, no longer attached to obj
try {
  detached()   // called standalone -- `this` is undefined in strict mode (module code is strict by default)
} catch (err) {
  console.log(err.constructor.name)   // 'TypeError' -- this.name fails since `this` is undefined here
}

console.log(detached.call(obj))   // 'Alice' -- .call() explicitly sets `this` back to obj for this one call

const obj2 = { name: 'Bob' }
obj2.greetAsBob = detached   // attach the SAME function to a DIFFERENT object
console.log(obj2.greetAsBob())   // 'Bob' -- `this` is now obj2, since that's what it's called ON this time
```
Walkthrough: the exact same `greet` function returns `'Alice'`,
`undefined`/error, `'Alice'` again, and `'Bob'` across four different
calls — its own code never changes at all; only HOW it's called
(as a method, standalone, via `.call()`, or on a different object) changes
what `this` refers to each time.

## python

```python
# Python's analogous mechanic: `self` is explicitly passed as the first
# argument, bound automatically ONLY when called through an instance
# (obj.method()) -- there's no separate "detached this" surprise the way
# JS has, since Python is explicit about `self` at the call site.
class Greeter:
    def __init__(self, name):
        self.name = name

    def greet(self):
        return self.name


alice = Greeter('Alice')
print(alice.greet())   # 'Alice' -- called through the instance, self is bound to alice automatically

detached = alice.greet   # Python's bound methods stay bound to their instance when extracted
print(detached())        # 'Alice' -- still works! bound methods carry their `self` with them, unlike JS's plain functions

# calling the underlying function directly, unbound, DOES require explicit self
unbound = Greeter.greet
print(unbound(alice))   # 'Alice' -- self must be passed explicitly when going through the class, not an instance
```
Walkthrough: unlike JavaScript, Python's bound methods (`alice.greet`)
remain bound to their instance even when extracted into a separate
variable, so `detached()` still works correctly — Python avoids JS's
"detached method loses its receiver" surprise specifically because
`self` is bound at method-lookup time via the instance, not re-derived
dynamically from an ambiguous call site the way JS's `this` is.
