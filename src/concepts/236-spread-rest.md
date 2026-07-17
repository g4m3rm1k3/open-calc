---
concept: 236-spread-rest
name: Spread and Rest (JavaScript)
---

## Definition

The spread operator (`...`) EXPANDS an array or object's
elements/properties into individual values (in a function call, an array
literal, or an object literal), while the REST parameter (also written
`...`, but in a DIFFERENT position) does the OPPOSITE — COLLECTS multiple
individual values back into a single array — the same three-dot syntax
serving opposite purposes depending on context.

## Problem

Combining multiple arrays/objects into one, or passing an array's
elements as individual function arguments, or capturing "everything
else" beyond some fixed set of destructured values, would otherwise
require manual loops or index-based code. Spread and rest express these
operations directly and concisely with a single, consistent `...`
syntax.

## Execution

SPREAD in an array literal EXPANDS both source arrays' elements into a
single new array
↓
SPREAD in an object literal EXPANDS both objects' properties into a
single new object (later spreads OVERWRITE earlier ones on key
collision)
↓
SPREAD in a function call EXPANDS an array's elements into individual,
separate ARGUMENTS to the function
↓
REST in a function parameter (see *args and **kwargs (Python) for the
Python equivalent) COLLECTS however many arguments are passed into a
single array
↓
REST in destructuring COLLECTS everything beyond the already-named
values into a new array

## Computer Science

Spread and rest are syntactic OPPOSITES sharing identical `...` syntax —
spread EXPANDS a single collection into many individual values (used
where multiple values are expected: a function call's argument list, an
array/object literal), while rest COLLECTS many individual values into a
single collection (used where a single binding is being defined: a
function parameter, a destructuring pattern) — which operation applies
depends entirely on the SYNTACTIC POSITION `...` appears in.

Tags: Expand vs collect, Position-dependent meaning, Consistent syntax opposite operations

## Software Engineering

Spread is the idiomatic, concise way to create IMMUTABLE updates to
arrays/objects (spreading old state plus an updated field into a new
object) — a pattern especially common in frameworks like React that rely
on detecting NEW object references for change detection (see Mutability,
Caching) rather than deep-comparing mutated ones.

Tags: Immutable update pattern, React state updates, Reference-based change detection

## Common Mistakes

- Confusing spread (expand) and rest (collect) since they look identical (`...`) — the actual behavior depends entirely on WHERE the `...` appears: before an existing collection being expanded (spread), or in a parameter/destructuring position collecting incoming values (rest).
- Assuming object spread performs a DEEP copy — it's a SHALLOW copy; nested objects/arrays inside the spread object are still shared by reference between the original and the copy, not independently duplicated.

## Exercises

- Trace through what spreading two objects with the SAME key but different values produces — which one wins, and why?
- Explain why a rest parameter can accept any number of arguments, while a rest element in destructuring must be the LAST element in the pattern, not the first.

## javascript

```javascript
const arr1 = [1, 2]
const arr2 = [3, 4]
const combined = [...arr1, ...arr2]   // SPREAD -- expands both arrays into one
console.log(combined)   // [ 1, 2, 3, 4 ]

const obj1 = { a: 1, b: 2 }
const obj2 = { b: 99, c: 3 }
const merged = { ...obj1, ...obj2 }   // SPREAD -- obj2's b OVERWRITES obj1's b, since it comes later
console.log(merged)   // { a: 1, b: 99, c: 3 }

const numbers = [5, 10, 15]
console.log(Math.max(...numbers))   // SPREAD in a function call -- expands into individual arguments -- 15

function sum(...nums) {   // REST -- collects any number of arguments into one array
  return nums.reduce((a, b) => a + b, 0)
}
console.log(sum(1, 2, 3, 4))   // 10

const [first, ...others] = [1, 2, 3]   // REST in destructuring -- collects everything after first
console.log(first, others)   // 1 [ 2, 3 ]
```
Walkthrough: `[...arr1, ...arr2]` and `{ ...obj1, ...obj2 }` both SPREAD
(expand) their sources into a new combined collection, with later spreads
overwriting earlier keys on collision. `Math.max(...numbers)` spreads an
array into individual call arguments. `sum(...nums)` and
`[first, ...others]` both instead use `...` to COLLECT — gathering
multiple values into a single array — demonstrating spread and rest as
the same syntax used for opposite operations depending on position.
