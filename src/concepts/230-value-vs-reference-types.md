---
concept: 230-value-vs-reference-types
name: Value vs Reference Types (Swift)
---

## Definition

In Swift, `struct` and `enum` are VALUE types (copied on assignment or
when passed to a function — each copy is fully independent), while
`class` is a REFERENCE type (assignment copies just a REFERENCE, so
multiple variables can point to and mutate the SAME underlying instance).

## Problem

Sometimes code needs each variable to hold its own genuinely independent
copy of data (mutating one shouldn't affect any other copy) — value types
provide this automatically. Other times code needs multiple parts of a
program to share and mutate the SAME underlying instance (a shared
cache, a view controller referenced from multiple places) — reference
types provide that instead. Choosing the wrong one for a given need
causes real, sometimes subtle bugs.

## Execution

A `struct` instance is assigned to a second variable — the second
variable gets a COPY of the value
↓
Modifying the second variable's copy affects ONLY that copy — the
original remains completely unaffected
↓
A `class` instance is assigned to a second variable — the second
variable gets a REFERENCE to the SAME underlying instance, NOT a copy
↓
Modifying through the second variable affects the SHARED instance — the
original is ALSO changed, since both variables refer to the exact same
object

## Computer Science

This value/reference distinction is exactly the same underlying idea as
JavaScript/Python's primitives-vs-objects split (see Pass by Value vs
Pass by Reference), but Swift makes it an EXPLICIT, deliberate choice per
type (`struct`/`enum` vs `class`) rather than a fixed rule tied to
whether something is "primitive" — any custom type's author decides which
semantics fits their use case.

Tags: Copy semantics, Reference semantics, Deliberate type category choice

## Software Engineering

Swift's standard library favors VALUE types by default (`Array`,
`Dictionary`, `String` are all structs) — this is a deliberate design
choice, since value semantics eliminate an entire category of "who else
might be mutating my data" bugs; reference types (classes) are reserved
specifically for cases genuinely needing shared, mutable identity.

Tags: Value semantics by default, Standard library design, Shared mutable state avoidance

## Common Mistakes

- Assuming a `struct` behaves like a `class` (shared reference) when passed around or assigned — every assignment/pass of a struct creates an independent COPY, so mutating one copy never affects another, unlike a class instance.
- Choosing `class` by habit (coming from a language where everything is reference-based) when a `struct` would avoid unintended sharing bugs and better match the actual need (independent, copyable data).

## Exercises

- Trace through what each struct variable reports after modifying one copy in the example below — do they diverge, and why?
- Trace through the equivalent class example and explain specifically why the original changes too, even though only the second variable was assigned to directly.

## swift

```swift
struct PointStruct {
    var x: Int
}

class PointClass {
    var x: Int
    init(x: Int) { self.x = x }
}

var a = PointStruct(x: 1)
var b = a
b.x = 99
print("a.x: \(a.x), b.x: \(b.x)")

let c = PointClass(x: 1)
let d = c
d.x = 99
print("c.x: \(c.x), d.x: \(d.x)")
```
Walkthrough: `b = a` copies the struct, so `b.x = 99` leaves `a.x`
completely unaffected at `1` — two genuinely independent values. `d = c`
instead copies only a REFERENCE to the same class instance, so `d.x = 99`
is visible through `c` too — both print `99`, since `c` and `d` point at
the exact same underlying object.
