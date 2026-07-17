---
concept: 187-implicit-interfaces
name: Implicit Interfaces (Go)
---

## Definition

In Go, a type satisfies an interface automatically, just by implementing
that interface's methods — there's no explicit "implements" declaration
required (unlike Java's `implements` keyword); if a type has the right
methods, it satisfies the interface, structurally and implicitly.

## Problem

Explicit interface implementation (declaring up front "this type
implements that interface") couples a type to knowing about every
interface it might ever need to satisfy, including ones defined LATER, by
code that doesn't own the type. Go's implicit/structural approach lets
ANY type satisfy an interface it happens to match — including interfaces
defined AFTER the type itself, by completely unrelated code — without
either side needing to know about the other in advance.

## Execution

An interface defines ONE required method
↓
A struct is defined that does NOT mention the interface anywhere
↓
Implementing a method with the RIGHT signature on that struct
↓
Assigning a value of that struct to a variable of the interface type
compiles successfully — the struct satisfies the interface PURELY
because it has a matching method, with zero explicit declaration linking
the two
↓
This works even if the interface were defined in a completely different,
unrelated package that the struct's package doesn't import or know about

## Computer Science

This is "structural typing" (also called "duck typing," but checked at
COMPILE time in Go, not at runtime) — a type's identity is defined by its
actual SHAPE (the methods it has), not by any explicit declared
relationship, which is a fundamentally different interface model from
Java/C#'s nominal typing (where `implements` must be declared
explicitly).

Tags: Structural typing, Duck typing (compile-time), Nominal vs structural typing

## Software Engineering

This is what makes Go interfaces so composable for testing and
decoupling — a package can define a small interface describing exactly
what IT needs (e.g., just a `Write` method), and ANY type anywhere that
happens to have that method can be passed in, including types the
interface's author never anticipated or even knew existed.

Tags: Testability, Small interfaces, Decoupling, Mock-friendly design

## Common Mistakes

- Assuming a type needs some explicit declaration to satisfy an interface — in Go, having the right METHODS is sufficient; there's no `implements` keyword at all, and looking for one is a common early confusion coming from Java/C#.
- Defining overly large interfaces with many required methods — Go's idiomatic style favors small, focused interfaces (often just one or two methods), since implicit satisfaction makes small interfaces easy for many different types to naturally satisfy.

## Exercises

- Trace through what would happen if the example below's `Write` method had a slightly different signature (e.g., returning only `error`, no `int`) — would the assignment still compile?
- Explain why implicit interface satisfaction lets a type satisfy an interface defined in a completely different package that the type's own package never imports.

## go

```go
package main

import "fmt"

type Writer interface {
	Write(p []byte) (n int, err error)
}

type MyLogger struct{}

func (l MyLogger) Write(p []byte) (int, error) {
	fmt.Print(string(p))
	return len(p), nil
}

func main() {
	var w Writer = MyLogger{}   // compiles successfully -- MyLogger satisfies Writer implicitly
	w.Write([]byte("hello via the Writer interface\n"))
}
```
Walkthrough: `MyLogger` never mentions `Writer` anywhere in its own
definition, yet `var w Writer = MyLogger{}` compiles successfully —
`MyLogger` satisfies `Writer` purely because it has a `Write` method with
a matching signature, demonstrating Go's implicit, structural interface
satisfaction.
