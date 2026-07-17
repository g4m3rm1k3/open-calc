---
concept: 188-struct-embedding
name: Struct Embedding (Go)
---

## Definition

Struct embedding lets one struct include another struct as an unnamed
field, automatically PROMOTING the embedded struct's fields and methods
to the outer struct — Go's mechanism for code reuse and composition, used
instead of class inheritance (which Go doesn't have).

## Problem

Without inheritance, reusing another type's fields and methods would
otherwise require manually writing wrapper methods that just forward to
an explicitly-named inner field — repetitive boilerplate for every method
being "inherited." Struct embedding automatically promotes the embedded
type's methods and fields to the outer struct, letting the outer type
reuse them directly without writing forwarding code.

## Execution

A base struct has a field and a method
↓
Another struct EMBEDS the base struct (no field name given — just the
type)
↓
Constructing the outer struct, providing the embedded struct's value
↓
Accessing the embedded struct's field DIRECTLY on the outer struct,
promoted, without writing the full nested path
↓
Calling the embedded struct's method directly ON the outer struct,
promoted the same way — the outer type didn't need to define its own
version of that method at all

## Computer Science

Embedding is fundamentally COMPOSITION, not inheritance — the outer
struct genuinely CONTAINS the embedded struct's value as a field (just
with the field access syntax made automatic/promoted); this is different
from true inheritance, since the outer type isn't actually a SUBTYPE of
the embedded type (a function expecting the embedded type can't accept
the outer type directly, unlike real inheritance-based polymorphism).

Tags: Composition over inheritance, Method promotion, No subtyping

## Software Engineering

Method promotion via embedding is Go's primary tool for code reuse
across types, favoring "has-a" composition explicitly over "is-a"
inheritance — this avoids the classic fragile-base-class problems that
deep inheritance hierarchies in other languages can create, at the cost
of not getting automatic polymorphic substitutability.

Tags: Fragile base class avoidance, Composition patterns, No polymorphic substitution

## Common Mistakes

- Assuming embedding gives you inheritance-style polymorphism (being able to pass the outer type anywhere the embedded type is expected) — it doesn't; the outer type merely reuses the embedded type's fields/methods via promotion, but isn't actually that type, type-wise.
- Embedding a type just to reuse ONE method, when the embedded type brings along ALL its fields and methods (some possibly unwanted) — sometimes an explicitly-named field with a manually-written forwarding method is the more deliberate, precise choice.

## Exercises

- Trace through what the fully-qualified path to the embedded field and the promoted shorthand both refer to in the example below — are they the exact same underlying field?
- Explain specifically why a function expecting the embedded type CANNOT be called directly with the outer type's value, despite the outer type embedding it.

## go

```go
package main

import "fmt"

type Animal struct {
	Name string
}

func (a Animal) Describe() string {
	return "I am " + a.Name
}

type Dog struct {
	Animal
	Breed string
}

func main() {
	d := Dog{Animal: Animal{Name: "Rex"}, Breed: "Labrador"}

	fmt.Println(d.Name)         // "Rex" -- promoted directly from the embedded Animal, no d.Animal.Name needed
	fmt.Println(d.Describe())   // "I am Rex" -- Animal's method, promoted onto Dog
	fmt.Println(d.Breed)        // "Labrador" -- Dog's own field
}
```
Walkthrough: `d.Name` and `d.Describe()` both work directly on `d`,
despite being defined on the EMBEDDED `Animal`, not on `Dog` itself — Go
automatically promotes them since `Animal` is embedded (unnamed) inside
`Dog`. `d.Breed` is `Dog`'s own field, demonstrating that `Dog` combines
both its own fields and its embedded type's promoted members seamlessly.
