---
concept: 162-pass-by-value-reference
name: Pass by Value vs Pass by Reference
---

## Definition

When a value is passed to a function, "pass by value" copies the value
itself into the function (changes inside don't affect the caller's
original), while "pass by reference" (or, in JS/Python, passing a
reference to a mutable object) passes a reference to the SAME underlying
data, so mutations inside the function ARE visible to the caller.

## Problem

Confusing which passing behavior applies to a given value type causes
real bugs — expecting a function to be able to "modify" a number passed
to it (which it can't, since primitives are passed by value) or being
surprised that a function mutated an array you passed in (since
objects/arrays are passed "by reference" in the sense of sharing the
underlying data). Understanding which applies to which type prevents both
classes of confusion.

## Execution

Passing a number to a function that reassigns its parameter: the
caller's original variable is STILL unchanged afterward, since the
parameter received a COPY of the value, and reassigning it inside the
function has no effect outside
↓
Passing an array to a function that pushes onto it: the caller's array IS
changed, since the parameter refers to the SAME array object as the
caller, and mutating it through the parameter is visible through the
caller's own reference too
↓
Passing an array to a function that REASSIGNS its parameter to a new
array: the caller's original array is STILL unchanged, since reassigning
the parameter only changes what the LOCAL copy of the reference points to

## Computer Science

JavaScript and Python are both technically "pass by value" for EVERY
argument — but for objects/arrays, the "value" being copied is a
REFERENCE (a pointer to the shared data), not the data itself; this is
why mutating through that reference is visible to the caller, but
REASSIGNING the local reference variable is not — the copy of the
reference gets reassigned, not the caller's original reference.

Tags: References, Aliasing, Call semantics, Reassignment vs mutation

## Software Engineering

The practical rule that actually matters day to day: for primitives
(numbers, strings, booleans), a function can never affect the caller's
variable at all; for objects/arrays, a function CAN mutate the caller's
data through methods like push or property assignment, but CANNOT make
the caller's variable point somewhere else by reassigning the parameter.

Tags: Primitives vs objects, Function side effects, API design

## Common Mistakes

- Expecting a function to be able to modify a number, string, or boolean passed to it by reassigning the parameter inside — this NEVER affects the caller's original variable, regardless of language, since primitives are always copied.
- Not realizing a function can silently mutate an object/array passed into it (via push, property assignment, etc.) — if a function isn't SUPPOSED to modify its input, it needs to make an explicit copy first.

## Exercises

- Trace through what the reassignment example above prints for the caller's array, and explain specifically why reassigning the parameter inside the function doesn't affect the caller's variable, even though both examples involve "passing an array."
- Write a function that takes an array and safely returns a NEW, sorted copy without mutating the caller's original array — what specific step makes this safe?

## javascript

```javascript
// Primitives: always copied -- the function can never affect the caller's variable
function tryChangeNumber(n) { n = 99 }
let x = 5
tryChangeNumber(x)
console.log(x)   // 5 -- completely unaffected; n was a COPY of the value

// Objects: the reference is copied, so mutating THROUGH it is visible to the caller
function pushItem(arr) { arr.push(99) }
let list = [1, 2]
pushItem(list)
console.log(list)   // [ 1, 2, 99 ] -- arr and list refer to the SAME array, so the mutation is visible

// But REASSIGNING the parameter itself does NOT affect the caller's variable
function reassignArray(arr) { arr = [100] }
let list2 = [1, 2]
reassignArray(list2)
console.log(list2)   // [ 1, 2 ] -- unaffected; only the LOCAL copy of the reference was reassigned
```
Walkthrough: `tryChangeNumber` can't affect `x` at all, since numbers are
copied. `pushItem` DOES affect `list`, since `arr` is a copy of the
REFERENCE to the same array, and `.push()` mutates the shared data
through it. `reassignArray` does NOT affect `list2`, since `arr = [100]`
only changes what the LOCAL copy of the reference points to, leaving
`list2`'s own reference (to the original array) untouched.

## python

```python
# Primitives (ints, strings): always copied -- the function can never affect the caller's variable
def try_change_number(n):
    n = 99

x = 5
try_change_number(x)
print(x)   # 5 -- completely unaffected; n was a COPY of the value

# Objects (lists): the reference is copied, so mutating THROUGH it is visible to the caller
def push_item(arr):
    arr.append(99)

my_list = [1, 2]
push_item(my_list)
print(my_list)   # [1, 2, 99] -- arr and my_list refer to the SAME list, so the mutation is visible

# But REASSIGNING the parameter itself does NOT affect the caller's variable
def reassign_list(arr):
    arr = [100]

list2 = [1, 2]
reassign_list(list2)
print(list2)   # [1, 2] -- unaffected; only the LOCAL copy of the reference was reassigned
```
Walkthrough: identical copy-of-the-reference mechanics as the JavaScript
version — mutating through the parameter (`.append()`) is visible to the
caller, but reassigning the parameter itself only redirects the LOCAL
copy of the reference, leaving the caller's own variable pointing at the
original list.
