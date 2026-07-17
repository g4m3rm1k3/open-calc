---
concept: 220-references-vs-pointers
name: References vs Pointers (C++)
---

## Definition

A reference (`T&`) is an alias for an existing variable — it must be
initialized when declared, can never be reseated to refer to something
else, and can never be null; a pointer (`T*`) is a separate variable
holding a memory ADDRESS — it can be reassigned to point elsewhere, and
can be null, requiring explicit dereferencing (`*ptr`) to access the
value.

## Problem

Sometimes code needs an ALWAYS-VALID alias to an existing value with no
possibility of it being null or unset (a reference is ideal); other times
code genuinely needs the ability to represent "nothing" (null) or to be
REASSIGNED to point at different objects over time (a pointer is needed
for that flexibility). Having both lets C++ code express the specific
guarantee actually needed, rather than one mechanism trying to cover both
cases.

## Execution

A reference is declared as an ALIAS for an existing variable — MUST be
initialized immediately, and the two now refer to the SAME memory
↓
Modifying through the reference modifies the original variable directly,
since the reference IS that variable, just under another name
↓
A pointer HOLDS the ADDRESS of a variable — can be declared uninitialized,
reassigned later, or set to `nullptr`
↓
DEREFERENCING the pointer modifies the value it points to
↓
A pointer CAN be reseated to point at something else entirely — a
reference could NEVER do this; declaring a new reference to a different
variable just creates ANOTHER separate reference, not a reseat

## Computer Science

A reference is essentially a pointer with restricted, safer semantics
enforced by the compiler (can't be null, can't be reseated, no explicit
dereference syntax needed) — many compilers even implement references
internally AS pointers, but the LANGUAGE-LEVEL guarantees (always valid,
always refers to the same thing) are what make references safer to use
in many contexts.

Tags: Compiler-enforced safety, Aliasing, Non-nullable by design

## Software Engineering

A common convention: use references for function parameters that must
always refer to a valid object (avoiding null checks entirely), and use
pointers specifically when "no value" (null) is a genuinely valid
possibility, or when the pointed-to target might need to change over the
pointer's own lifetime.

Tags: Function parameter conventions, Null as a valid state, API design

## Common Mistakes

- Assuming a reference can be null or reassigned like a pointer — neither is possible; a reference is permanently bound to whatever it was initialized with, for its entire lifetime.
- Forgetting to check a pointer for `nullptr` before dereferencing it — unlike a reference (which the language guarantees is always valid), a pointer can legitimately be null, and dereferencing a null pointer is undefined behavior (typically a crash).

## Exercises

- Trace through what a reference's value becomes after the original variable is modified directly (not through the reference) — does the reference "see" that change too?
- Explain why declaring a reference with no initializer is a compile error, while declaring a pointer with no initializer compiles fine, even though the pointer's value is then technically indeterminate.

## cpp

```cpp
#include <iostream>

int main() {
    int x = 10;
    int& ref = x;   // ref is an ALIAS for x -- must be initialized here
    ref = 20;       // modifies x directly, since ref IS x
    std::cout << "x after ref = 20: " << x << std::endl;

    int* ptr = &x;   // ptr HOLDS the address of x
    *ptr = 30;        // dereference to modify the value x holds
    std::cout << "x after *ptr = 30: " << x << std::endl;

    int y = 100;
    ptr = &y;   // pointers CAN be reseated -- ptr now points at y instead
    std::cout << "*ptr after reseating to y: " << *ptr << std::endl;
    std::cout << "x is still: " << x << std::endl;   // x is unaffected by reseating ptr

    return 0;
}
```
Walkthrough: `ref = 20` changes `x` directly, since `ref` is just another
name for `x`, not a separate variable. `*ptr = 30` dereferences `ptr` to
modify `x` too, but unlike `ref`, `ptr` can later be reseated to `&y`
instead — after which `*ptr` refers to `y`, while `x` remains completely
unaffected by that reseating, demonstrating the key flexibility
difference between the two.
