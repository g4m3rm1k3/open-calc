---
concept: 235-destructuring
name: Destructuring (JavaScript)
---

## Definition

Destructuring lets you unpack values from arrays or properties from
objects directly into individual variables in a single, concise
expression — `const { x, y } = point` or `const [first, second] = list`
— instead of accessing each one separately by index or property name.

## Problem

Extracting several individual values from an array or object one at a
time is repetitive boilerplate for what's conceptually a single "unpack
this into named parts" operation. Destructuring expresses that unpacking
directly and concisely, in one declaration, and can even rename
variables or provide defaults for missing values along the way.

## Execution

Object destructuring unpacks multiple properties into individually-named
variables in ONE line
↓
A property can be RENAMED while destructuring
↓
A DEFAULT VALUE is used when the source object has no matching property
at all
↓
Array destructuring unpacks by POSITION rather than name, and a REST
pattern (`...rest`) can collect everything remaining into a new array
↓
Destructuring also works directly in FUNCTION PARAMETERS — unpacking an
object argument's properties directly in the parameter list

## Computer Science

Destructuring is fundamentally pattern matching against a value's SHAPE
— the syntax on the left side of `=` describes a STRUCTURE to match
against (which properties/positions to pull out), conceptually similar to
pattern matching in languages like Rust or Haskell, though JS's version
is simpler (no exhaustiveness checking, just direct extraction).

Tags: Structural pattern matching, Positional vs named extraction, Simplified compared to full pattern matching

## Software Engineering

Destructuring in function parameters is a common, idiomatic way to
accept a single "options object" argument while still getting the
readability of individually-named parameters — a caller passes one
object, but the function body can use each field as if it were declared
as a separate named parameter.

Tags: Options object pattern, Function parameter idioms, Readable function signatures

## Common Mistakes

- Destructuring a property that doesn't exist on the source object without providing a default — the resulting variable becomes `undefined`, not an error, which can silently propagate a missing value further than expected.
- Confusing array destructuring's POSITIONAL matching with object destructuring's NAME-based matching — reordering elements in an array changes which variable gets which value, while reordering an object's declared properties in the destructuring pattern doesn't matter at all, since it matches by name.

## Exercises

- Trace through what a default-valued destructured property produces if the source object DOES have that property with some other value — does the default still get used, or does the actual value win?
- Rewrite a function that currently takes several individual positional parameters to instead take a single destructured options object parameter, and consider what changes for callers.

## javascript

```javascript
const point = { x: 1, y: 2 }

const { x, y } = point
console.log(x, y)   // 1 2

const { x: horizontalPos } = point   // renamed while destructuring
console.log(horizontalPos)   // 1

const { z = 0 } = point   // z doesn't exist on point -- default used
console.log(z)   // 0

const [first, second, ...rest] = [1, 2, 3, 4, 5]
console.log(first, second, rest)   // 1 2 [ 3, 4, 5 ]

function distance({ x, y }) {
  return Math.sqrt(x * x + y * y)
}
console.log(distance(point))   // 2.23606797749979
```
Walkthrough: `{ x, y } = point` unpacks both properties by name in one
line. `{ x: horizontalPos }` renames `x` on the way out. `{ z = 0 }`
falls back to the default `0`, since `point` has no `z` property at all.
Array destructuring pulls values out by POSITION instead, with `...rest`
collecting everything beyond the first two into a new array. `distance`
demonstrates destructuring directly in a function's parameter list.
