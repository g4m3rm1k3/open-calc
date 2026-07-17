---
concept: 222-const-correctness
name: Const Correctness (C++)
---

## Definition

Const correctness is the practice of marking variables, function
parameters, and member functions `const` wherever they're not meant to be
modified — letting the COMPILER verify and enforce immutability
throughout a program, rather than just trusting code to not accidentally
mutate something it shouldn't.

## Problem

Without `const`, nothing stops a function from accidentally modifying
data it was only supposed to READ (a reference parameter that's meant to
be inspected, not changed) — such a bug might not surface until much
later, when the caller is surprised their data changed unexpectedly.
Marking things `const` lets the COMPILER catch any accidental mutation
attempt as a compile error, rather than relying on discipline alone.

## Execution

A function parameter taken as `const std::string&` promises the CALLER
that the function will only READ it, never modify it — attempting to
mutate it inside the function would be a COMPILE ERROR
↓
Marking a MEMBER FUNCTION `const` promises it won't modify the object's
own member variables — attempting to assign to a member inside that
function would be a compile error
↓
A `const` OBJECT can only call `const` member functions — calling a
non-const method on it is a compile error, since the compiler can't
guarantee that method won't try to modify it
↓
A pointer to `const int` can't have its pointed-to value modified through
it, though the POINTER itself can still be reseated to point elsewhere —
this is DIFFERENT from a const pointer to a regular int, where the
POINTER itself is fixed but the pointed-to value can be modified

## Computer Science

`const` is a compile-time-only, zero-runtime-cost guarantee — like
Rust's borrow checker (see Borrowing (Rust)) or TypeScript's readonly
properties, it exists entirely to let the compiler VERIFY a promise about
mutation, with no actual runtime check or overhead once compiled;
violating it is caught before the program ever runs, not detected at
runtime.

Tags: Compile-time verification, Zero runtime cost, Immutability guarantees

## Software Engineering

A common, valuable habit is "const by default" — mark parameters, member
functions, and variables `const` unless there's a SPECIFIC reason they
need to be mutable, rather than the reverse (leaving everything mutable
and only adding `const` as an afterthought) — this maximizes the amount
of code the compiler can verify won't accidentally mutate something.

Tags: Const by default, Defensive API design, Compiler-verified contracts

## Common Mistakes

- Forgetting `const` on a reference/pointer parameter that's only meant to be read, allowing the function to accidentally (or carelessly) modify the caller's data — the caller has no compiler-enforced guarantee their data will be left alone.
- Forgetting to mark a read-only member function `const`, which then prevents it from being called on `const` instances of the class at all, even though the function never actually modifies anything.

## Exercises

- Trace through what specific compile error occurs if a `const`-marked member function tried to modify one of the object's own members despite the `const` promise.
- Explain the difference between `const int* ptr` (pointer to a const int) and `int* const ptr` (a const pointer to a regular int) — which one allows reseating the pointer, and which one allows modifying the pointed-to value?

## cpp

```cpp
#include <iostream>

class Circle {
    double radius;
public:
    Circle(double r) : radius(r) {}

    double getArea() const {   // promises not to modify the Circle
        return 3.14159 * radius * radius;
    }

    void setRadius(double r) {   // NOT const -- this one is allowed to modify
        radius = r;
    }
};

void printArea(const Circle& c) {   // promises only to READ c, never modify it
    std::cout << "area: " << c.getArea() << std::endl;   // fine -- getArea() is const, callable on a const reference
}

int main() {
    Circle c(5.0);
    printArea(c);

    c.setRadius(10.0);   // fine -- c itself is not const, and setRadius is a valid mutating call
    printArea(c);

    return 0;
}
```
Walkthrough: `printArea` takes `const Circle&`, so it can only call
`const`-marked member functions like `getArea()` — calling a hypothetical
non-const method inside `printArea` would be a compile error. `main`'s
`c` itself is NOT const, so `c.setRadius(10.0)` is perfectly valid there,
demonstrating that const-correctness restricts what's ALLOWED at each
specific usage point (a const reference vs. the original mutable
object), not the class itself.
