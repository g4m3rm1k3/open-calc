---
concept: 229-protocols
name: Protocols (Swift)
---

## Definition

A protocol defines a set of methods and properties a TYPE must implement
to conform to it — Swift's equivalent of an interface, letting unrelated
types (classes, structs, enums) all satisfy the same contract and be used
interchangeably wherever that protocol is expected.

## Problem

Writing generic code that works with "anything that can do X" requires
SOME shared contract multiple, otherwise-unrelated types can all satisfy
— without protocols, code would need to know about every CONCRETE type
individually, or rely on inheritance (which structs and enums can't use
in Swift at all). Protocols let a struct, a class, AND an enum all
conform to the SAME protocol, letting generic code work uniformly across
all of them.

## Execution

A protocol defines a REQUIRED method, with no implementation yet
↓
A STRUCT conforms to the protocol with its own implementation
↓
A completely unrelated CLASS ALSO conforms to the SAME protocol, with a
different implementation
↓
A function accepts ANYTHING conforming to the protocol, regardless of
whether it's a struct, class, or enum
↓
Calling that function with instances of BOTH types works identically,
since both satisfy the protocol's contract

## Computer Science

Protocols work across ALL of Swift's type categories (structs, classes,
enums) uniformly, unlike class inheritance (which only works for
classes) — this is precisely why Swift's official guidance favors
"protocol-oriented programming" over class-based inheritance hierarchies
for a huge amount of everyday code, since protocols compose more
flexibly across Swift's full range of type kinds.

Tags: Protocol-oriented programming, Cross-type-category conformance, Structs/classes/enums unified

## Software Engineering

Protocols are Swift's primary tool for dependency injection, testability
(defining a small protocol describing exactly what a piece of code
needs, then supplying either a real implementation or a test mock/fake
that both conform to it), and for expressing "any type that can do X"
without committing to a specific concrete type upfront.

Tags: Dependency injection, Testability, Mock-friendly design

## Common Mistakes

- Reaching for class inheritance by default, when a protocol (potentially conformed to by a struct instead) would be more flexible and avoid the overhead/reference semantics of a class — see Value vs Reference Types for why this distinction matters.
- Defining an overly large protocol requiring many methods, making it hard for new types to conform — smaller, focused protocols (sometimes composed together) are generally easier for a wide range of types to actually satisfy.

## Exercises

- Trace through what the example's `introduce` function does when called with a THIRD, brand-new type that also conforms to `Greetable` — does `introduce`'s own code need to change at all to support it?
- Explain why a `struct` can conform to a protocol just as easily as a `class` can, while a struct could NEVER inherit from a class-based base type — why does this distinction matter for protocol design?

## swift

```swift
protocol Greetable {
    func greet() -> String
}

struct Person: Greetable {
    let name: String
    func greet() -> String {
        return "Hi, I'm \(name)"
    }
}

class Robot: Greetable {
    func greet() -> String {
        return "BEEP BOOP HELLO"
    }
}

func introduce(_ thing: Greetable) {
    print(thing.greet())
}

introduce(Person(name: "Alice"))
introduce(Robot())
```
Walkthrough: `introduce` accepts anything conforming to `Greetable`, with
zero knowledge of whether it's actually a `struct` or a `class` — calling
it with `Person` (a struct) and `Robot` (a class) both work identically
from `introduce`'s perspective, each dispatching to its own type's
`greet()` implementation.
