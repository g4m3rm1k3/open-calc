---
concept: 166-first-class-functions
name: First-Class Functions
---

## Definition

A language has first-class functions when functions can be treated like
any other value — assigned to variables, passed as arguments to other
functions, returned from functions, and stored in data structures —
rather than being a special, restricted kind of thing.

## Problem

If functions couldn't be passed around like other values, patterns like
"run this specific piece of logic later, when some event happens"
(callbacks) or "here's a generic sort, but YOU decide the comparison
logic" (higher-order functions) would be impossible without significant
special-case language support. Treating functions as first-class values
makes these patterns simple and uniform, no different from passing a
number or string.

## Execution

A function assigned to a variable, just like a number could be
↓
A function that accepts ANOTHER function as an argument, just like any
other value
↓
Passing a function itself (not calling it) into that accepting function —
the function is passed AS A VALUE
↓
A function that RETURNS another function, just like it could return any
other value
↓
The returned function can be called just like any function assigned
normally

## Computer Science

This is what makes higher-order functions, callbacks, and closures
possible at all — none of these patterns require special syntax beyond
ordinary variable assignment, argument passing, and return values,
specifically because functions are just another kind of value the
language already knows how to pass around.

Tags: Higher-order functions, Closures, Callbacks, Functions as values

## Software Engineering

First-class functions are the foundation of common patterns like event
handlers, array methods (`.map()`, `.filter()`), and dependency injection
(passing a function implementation into code that uses it) — all of these
rely on functions being ordinary, passable values.

Tags: Event handlers, Array methods, Dependency injection

## Common Mistakes

- Calling a function immediately when you meant to pass a REFERENCE to it — this passes the RESULT of calling the function (a value) instead of the function itself.
- Assuming only certain "special" functions can be passed around — in a language with first-class functions, ANY function (named, anonymous, a method) can be treated as a plain value with no special syntax needed.

## Exercises

- Trace through the difference between passing a function itself versus passing the RESULT of calling it — what value ends up being received in each case?
- Identify one place in code you've written where you passed a function as an argument (a callback, a comparator, an event handler), and explain what would break if the language DIDN'T support first-class functions.

## javascript

```javascript
const greet = function() { return 'hi' }

function callTwice(fn) { return [fn(), fn()] }
console.log(callTwice(greet))   // [ 'hi', 'hi' ] -- greet was passed AS A VALUE, then called twice inside callTwice

function makeGreeter() {
  return function() { return 'hi there' }   // returning a function, just like returning any other value
}
const g = makeGreeter()
console.log(g())   // 'hi there' -- the returned function works exactly like any normally-defined function

const functionList = [greet, g]   // functions stored in an array, just like numbers or strings could be
console.log(functionList.map(fn => fn()))   // [ 'hi', 'hi there' ]
```
Walkthrough: `greet` is passed into `callTwice` as a plain value (not
called until INSIDE `callTwice`), `makeGreeter` returns a function that
works identically to one defined normally, and `functionList` stores
functions in an array exactly like any other value — all three
demonstrate functions being treated as ordinary, first-class values with
no special syntax required.

## python

```python
def greet():
    return 'hi'


def call_twice(fn):
    return [fn(), fn()]


print(call_twice(greet))   # ['hi', 'hi'] -- greet was passed AS A VALUE, then called twice inside call_twice


def make_greeter():
    return lambda: 'hi there'   # returning a function, just like returning any other value


g = make_greeter()
print(g())   # 'hi there' -- the returned function works exactly like any normally-defined function

function_list = [greet, g]   # functions stored in a list, just like numbers or strings could be
print([fn() for fn in function_list])   # ['hi', 'hi there']
```
Walkthrough: identical first-class-function mechanics as the JavaScript
version — `greet` is passed as a plain value, `make_greeter` returns a
callable function, and `function_list` stores functions in a list exactly
like any other value.
