---
concept: 221-operator-overloading
name: Operator Overloading (C++)
---

## Definition

Operator overloading lets a custom class define its own behavior for
built-in operators (`+`, `==`, `<<`) by implementing specially-named
member or free functions — letting instances of that class be used with
the SAME familiar syntax as built-in types.

## Problem

Without operator overloading, a custom class needing operations like
addition or comparison would require specially-named methods instead of
`+` or `==` for every operation, forcing callers to learn a
class-specific API rather than using familiar, universal syntax — this is
the same underlying problem Python's magic methods (see Magic Methods
(Python)) solve for that language.

## Execution

Defining `operator+` as a MEMBER FUNCTION lets `a + b` on custom class
instances compile to a method call on `a`, passing `b` as the argument —
the `+` syntax works directly on the custom type
↓
Defining `operator==` as a FREE function instead (common for symmetric
operators) lets `==` work directly on the custom type too, calling the
free function behind the scenes
↓
Both forms are translated by the compiler into ordinary function calls —
the infix operator syntax is purely a convenient way to WRITE that call

## Computer Science

Operator overloading is purely syntactic — `a + b` for a custom type
compiles down to an ordinary function call, indistinguishable at the
machine-code level from calling any other method; the LANGUAGE just
allows a special naming convention (`operator+`) that lets the compiler
translate familiar infix syntax into that call.

Tags: Syntactic sugar, Compiler-translated calls, Member vs free-function operators

## Software Engineering

Overloaded operators should behave analogously to their built-in meaning
(`+` should genuinely "combine" two values in some sensible way, `==`
should genuinely mean equivalence) — violating this (the PRINCIPLE OF
LEAST SURPRISE, same concern as Python's magic methods) produces
confusing, hard-to-predict code hiding behind familiar-looking syntax.

Tags: Principle of least surprise, Semantic consistency, API design

## Common Mistakes

- Implementing an operator with behavior unrelated to its conventional meaning — this creates genuinely surprising code for anyone using that operator on the class.
- Forgetting `const` on operator member functions (or their parameters) when the operation doesn't modify the object — this needlessly prevents the operator from being used on `const` instances (see Const Correctness).

## Exercises

- Trace through what `a + b` in the example below actually compiles down to — what's the exact underlying function call the `+` syntax represents?
- Implement `operator<<` for `Vector2D` so it can be printed directly with `std::cout << myVector`, and explain why this particular operator is conventionally implemented as a FREE function rather than a member function.

## cpp

```cpp
#include <iostream>

class Vector2D {
public:
    double x, y;

    Vector2D operator+(const Vector2D& other) const {
        return Vector2D{x + other.x, y + other.y};
    }
};

bool operator==(const Vector2D& lhs, const Vector2D& rhs) {
    return lhs.x == rhs.x && lhs.y == rhs.y;
}

int main() {
    Vector2D a{1, 2};
    Vector2D b{3, 4};
    Vector2D c = a + b;   // compiles to a.operator+(b)

    std::cout << c.x << ", " << c.y << std::endl;

    Vector2D d{4, 6};
    std::cout << (c == d) << std::endl;   // compiles to operator==(c, d)

    return 0;
}
```
Walkthrough: `a + b` calls `Vector2D`'s member `operator+`, producing a
new `Vector2D` with summed components (`c.x = 4`, `c.y = 6`). `c == d`
calls the free-function `operator==`, comparing both components for
equality — since `d` has the exact same `x`/`y` as `c`, this prints `1`
(C++'s `bool` printed as an integer), demonstrating both a member-function
and a free-function operator overload used with ordinary infix syntax.
