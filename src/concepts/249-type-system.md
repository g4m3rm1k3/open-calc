---
concept: 249-type-system
name: Type System (Julia)
---

## Definition

Julia's type system is built around a hierarchy of ABSTRACT types (which
can't be instantiated, exist only to group related concrete types) and
CONCRETE types (which CAN be instantiated) — every value has exactly one
concrete type, and abstract types let generic code and multiple dispatch
(see Multiple Dispatch) target WHOLE FAMILIES of related types at once,
not just one specific type.

## Problem

Writing a separate, identical-looking function for every specific
numeric type that should behave the same way would duplicate code
needlessly. Julia's abstract type hierarchy lets a function be written
ONCE against an abstract type (like `Number` or `Real`), and it
automatically works for EVERY concrete subtype, without needing to
enumerate them individually.

## Execution

An ABSTRACT type is declared — it cannot be instantiated directly
↓
CONCRETE types are declared as SUBTYPES of the abstract type, using the
`<:` operator ("is a subtype of")
↓
A function written against the ABSTRACT type works for ANY concrete
subtype, including ones defined LATER
↓
Calling it with a concrete subtype's instance is valid, since that type
IS-A subtype of the abstract type the function was written against, even
though the function never mentions that concrete type specifically

## Computer Science

Julia's type hierarchy is a TREE (every type has exactly one direct
supertype, all the way up to the universal `Any`), and abstract types
exist PURELY for this organizational/dispatch purpose — they carry no
fields or data of their own, unlike a base class in typical
object-oriented languages, which often DOES carry shared data/
implementation.

Tags: Type hierarchy tree, Abstract vs concrete types, No shared implementation in abstract types

## Software Engineering

Writing functions against the MOST GENERAL abstract type that still
makes sense (`Number` instead of `Float64`, if the function genuinely
works for any number) maximizes REUSE — the same function then
automatically works for every current AND future concrete subtype,
without ever needing to be rewritten or duplicated.

Tags: Generic programming, Writing against abstract types, Automatic future compatibility

## Common Mistakes

- Writing a function's parameter type annotation as an overly SPECIFIC concrete type when the logic would work identically for any broader category — this needlessly prevents the function from being reused with other subtypes without modification.
- Trying to instantiate an abstract type directly — abstract types exist purely to organize the type hierarchy and enable dispatch; only concrete types can actually be constructed into real values.

## Exercises

- Trace through what happens if a function constrained to an abstract type is called with a value that is NOT a subtype of it at all — what specific error occurs, and why?
- Explain why writing a function against a broad abstract numeric type instead of one specific concrete type makes the function automatically work for other numeric subtypes too, without any additional code.

## julia

```julia
abstract type Shape end

struct Circle <: Shape
    radius::Float64
end

struct Square <: Shape
    side::Float64
end

describe(s::Shape) = "some shape"
area(c::Circle) = pi * c.radius^2
area(s::Square) = s.side^2

println(describe(Circle(5.0)))
println(area(Circle(2.0)))
println(area(Square(3.0)))
println(Circle <: Shape)
```
Walkthrough: `describe` is written against the ABSTRACT `Shape` type, so
it works for `Circle(5.0)` (a concrete subtype) with no modification
needed. `area` instead has separate, specialized methods per concrete
type, demonstrating multiple dispatch (see Multiple Dispatch) working
alongside the type hierarchy. `Circle <: Shape` confirms directly that
`Circle` is indeed registered as a subtype of `Shape`.
