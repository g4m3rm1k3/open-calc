---
concept: 161-mutability
name: Mutability
---

## Definition

Mutability describes whether a value can be changed in place after it's
created — a mutable value's contents can be modified directly, while an
immutable value can never be changed once created; any "modification" of
an immutable value actually produces a brand new value instead.

## Problem

If a value is mutable and shared (referenced from multiple places),
changing it through ONE reference silently affects every other reference
to the SAME value — this can cause confusing bugs where code far away
from where a bug appears is actually where the mutation happened.
Immutability eliminates this entire class of bug: if a value can never
change, sharing a reference to it is always safe.

## Execution

Mutable array: two references point at the same array
↓
Pushing a new item onto the array mutates it IN PLACE
↓
The second reference now ALSO shows the new item — since it was never a
separate copy, just another reference to the same mutable object
↓
Immutable value: two references point at the same string
↓
Any "modification" like uppercasing returns a BRAND NEW string — the
original is completely unchanged, and the second reference was never at
risk either, since strings are immutable

## Computer Science

Mutability interacts directly with reference semantics (see Pass by
Value/Reference) — mutation bugs specifically require BOTH a mutable
value AND multiple references to the same value; either one alone
(immutable+shared, or mutable+never-shared) is safe, which is why either
"make it immutable" or "never share references to mutable state"
independently prevents this bug category.

Tags: Reference semantics, Aliasing, Shared state, Copy-on-write

## Software Engineering

Many modern frameworks (React among them) rely on treating state as
immutable specifically so they can cheaply detect changes — comparing "is
this the SAME reference as before" (a fast check) instead of
deep-comparing every field, which only works correctly if updates always
produce a NEW object rather than mutating the old one in place.

Tags: Immutable state management, Reference equality, Change detection

## Common Mistakes

- Mutating a shared object directly (e.g., pushing onto an array) when other code holds a reference to the same array and doesn't expect it to change — this is one of the most common sources of "spooky action at a distance" bugs.
- In frameworks that rely on immutable state updates (like React), mutating state directly instead of creating a new object — this can silently break change detection, since the reference never actually changed even though the contents did.

## Exercises

- Trace through what happens if the second reference in the mutable example above is passed to a function that pushes another item — does the original array see that change too?
- Identify one built-in JS or Python type that's mutable and one that's immutable, and explain a bug that could occur if the mutable one were assumed to behave like the immutable one.

## javascript

```javascript
// Mutable: arrays can be changed in place -- both references see the change
const arr = [1, 2, 3]
const otherRef = arr   // same array, NOT a copy
arr.push(4)
console.log(otherRef)   // [ 1, 2, 3, 4 ] -- otherRef sees arr's mutation, since they're the SAME object

// Immutable: strings can never be changed in place -- "modifying" produces a NEW string
const str = 'hello'
const otherStr = str
const upper = str.toUpperCase()   // returns a brand NEW string
console.log(str)      // 'hello' -- completely unchanged
console.log(otherStr) // 'hello' -- was never at risk, since str itself never mutated
console.log(upper)    // 'HELLO' -- a separate, new value
```
Walkthrough: `otherRef` and `arr` point at the exact SAME mutable array,
so `arr.push(4)` is visible through both references. `str`, by contrast,
is immutable — calling `.toUpperCase()` cannot change `str` itself, it
can only return a brand new string (`upper`), leaving both `str` and
`otherStr` completely unaffected.

## python

```python
# Mutable: lists can be changed in place -- both references see the change
arr = [1, 2, 3]
other_ref = arr   # same list, NOT a copy
arr.append(4)
print(other_ref)   # [1, 2, 3, 4] -- other_ref sees arr's mutation, since they're the SAME object

# Immutable: strings can never be changed in place -- "modifying" produces a NEW string
s = 'hello'
other_s = s
upper = s.upper()   # returns a brand NEW string
print(s)         # hello -- completely unchanged
print(other_s)   # hello -- was never at risk, since s itself never mutated
print(upper)      # HELLO -- a separate, new value
```
Walkthrough: identical mutable-array-vs-immutable-string contrast as the
JavaScript version — `other_ref` reflects `arr`'s in-place mutation since
they're the same list object, while `s` remains completely unchanged by
`.upper()`, which only produces a new string instead of modifying `s`.
