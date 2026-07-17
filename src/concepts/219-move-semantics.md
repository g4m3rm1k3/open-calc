---
concept: 219-move-semantics
name: Move Semantics (C++)
---

## Definition

Move semantics let a value's underlying resources (heap memory, a file
handle) be TRANSFERRED from one object to another cheaply, by stealing
the internal pointer/handle rather than making a full, expensive COPY —
invoked via `std::move`, which signals "I'm done with this object; you
can take its resources instead of copying them."

## Problem

Copying a large object (a big `std::vector`, a heap-allocated buffer)
every time it's returned from a function or passed around is wasteful —
the OLD copy is often about to be discarded anyway, making a deep copy
pure overhead. Move semantics let C++ instead TRANSFER ownership of the
underlying resource directly, leaving the old object in a
valid-but-empty state, avoiding the expensive copy entirely when the
source is about to be discarded.

## Execution

A function returns a LOCAL vector variable — modern C++ MOVES (or elides
entirely) the vector's internal buffer into the caller's variable, rather
than copying every element, since the local was about to be destroyed
anyway
↓
`std::move` EXPLICITLY marks an object as safe to move from
↓
The target now owns the underlying buffer, and the source is left in a
valid-but-UNSPECIFIED (typically empty) state
↓
Accessing the source AFTER moving from it is legal (it's not undefined
behavior, since it's left in a valid state) but its actual CONTENTS
should not be relied upon — the whole POINT was to signal "I'm done with
its old value"

## Computer Science

A move constructor/assignment operator does the SAME thing a copy
constructor would (transfers state into the new object), but instead of
ALLOCATING new memory and copying every element, it simply steals the
SOURCE object's internal pointer and resets the source to an empty/null
state — an O(1) pointer swap instead of an O(n) element-by-element copy.

Tags: Rvalue references, Move constructors, O(1) vs O(n) transfer, Resource stealing

## Software Engineering

`std::move` doesn't actually MOVE anything by itself — it's just a CAST
that marks its argument as "moveable" (an rvalue reference), signaling to
the compiler which constructor/assignment overload to prefer; the ACTUAL
moving happens in the target type's move constructor/assignment
operator, which must be correctly implemented (or compiler-generated) to
steal resources rather than copy them.

Tags: std::move is just a cast, Move constructor implementation, Rvalue reference casting

## Common Mistakes

- Using a variable's VALUE after moving from it, expecting its old contents to still be there — a moved-from object is left in a valid but typically EMPTY or unspecified state; only its old resources are gone, not the variable itself (which remains safely destructible/reassignable).
- Calling `std::move` on something you still need afterward — since the whole point of `std::move` is to signal "take this, I'm done with it," using the object's OLD value again afterward is a logic bug, even though it won't crash.

## Exercises

- Trace through what a vector's size would be immediately after `std::move` is used to construct a new vector from it — is the source guaranteed to be empty, or just "valid but unspecified"?
- Explain why moving a `std::vector`'s contents is O(1) (just swapping a few pointers) while copying it is O(n) (copying every element).

## cpp

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> a = {1, 2, 3, 4, 5};
    std::cout << "a size before move: " << a.size() << std::endl;

    std::vector<int> b = std::move(a);   // transfers a's internal buffer into b
    std::cout << "b size after move: " << b.size() << std::endl;
    std::cout << "a size after move: " << a.size() << std::endl;   // a is left empty (typical, though unspecified)

    std::cout << "b contents: ";
    for (int x : b) std::cout << x << " ";
    std::cout << std::endl;

    return 0;
}
```
Walkthrough: `b` ends up with all 5 elements that ORIGINALLY belonged to
`a`, transferred via `std::move` rather than copied — `a`'s size drops to
`0` afterward, confirming its internal buffer was actually stolen (moved
out), not duplicated. This demonstrates the core move-semantics
mechanic: resources migrate from source to destination, leaving the
source empty, instead of an expensive full copy.
