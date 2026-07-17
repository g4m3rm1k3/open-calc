---
concept: 218-smart-pointers-cpp
name: Smart Pointers (C++)
---

## Definition

A smart pointer (`std::unique_ptr`, `std::shared_ptr`) is a class that
wraps a raw pointer and automatically manages the memory it points to via
RAII (see RAII (C++)) — the pointed-to memory is freed automatically when
the smart pointer's destructor runs, eliminating the need for manual
`new`/`delete` pairing.

## Problem

Manually pairing every `new` with a matching `delete` is error-prone in
the exact same way as any other manual resource management — forgetting
to `delete`, or having an early return/exception skip it, leaks memory;
deleting TWICE (a double-free) corrupts the heap. Smart pointers wrap the
raw pointer in an RAII class, so the memory is freed automatically and
exactly once, tied to the smart pointer's own scope-based lifetime.

## Execution

`std::make_unique` allocates memory on the heap, owned EXCLUSIVELY by
one `unique_ptr`
↓
`std::unique_ptr` CANNOT be copied (only MOVED, see Move Semantics
(C++)) — this enforces exactly ONE owner at a time, similar to Rust's
ownership model (see Ownership (Rust))
↓
When the `unique_ptr` goes out of scope, its destructor automatically
calls `delete` on the underlying pointer — no manual cleanup needed
↓
`std::shared_ptr` CAN be copied, using REFERENCE COUNTING (see Reference
Counting) — the underlying memory is only freed once the LAST
`shared_ptr` pointing to it is destroyed

## Computer Science

`unique_ptr` and `shared_ptr` represent the same "exclusive owner" versus
"multiple owners via reference counting" tradeoff as Rust's `Box<T>`
versus `Rc<T>` (see Smart Pointers (Rust)) — C++ arrived at essentially
the same two-tier smart pointer design independently, reflecting that
these are the two fundamental, genuinely different ownership patterns
real programs need.

Tags: Exclusive vs shared ownership, Reference counting, Cross-language pattern parallel

## Software Engineering

Modern C++ style strongly favors smart pointers over raw `new`/`delete`
for owning heap memory — raw pointers are still used, but conventionally
only for NON-owning references (borrowing, in Rust terminology) where the
actual ownership and cleanup responsibility clearly lies elsewhere, with
a smart pointer.

Tags: Modern C++ idioms, Raw pointers for non-ownership, RAII by default

## Common Mistakes

- Mixing manual `new`/`delete` with smart pointers on the SAME piece of memory — this risks a double-free, since both the manual `delete` and the smart pointer's own automatic cleanup might try to free the same memory.
- Creating a `shared_ptr` cycle (two objects each holding a `shared_ptr` to the other) — like Rust's `Rc` cycles (see Reference Counting), this prevents the reference count from ever reaching zero, leaking the memory; `std::weak_ptr` exists specifically to break such cycles.

## Exercises

- Trace through what happens if you try to COPY a `std::unique_ptr` directly (rather than moving it) — what specific compiler error occurs?
- Explain why `shared_ptr`'s reference count only reaches zero (freeing the memory) after the LAST copy is destroyed, not the first.

## cpp

```cpp
#include <iostream>
#include <memory>

int main() {
    auto ptr = std::make_unique<int>(42);
    std::cout << *ptr << std::endl;

    auto shared1 = std::make_shared<int>(10);
    std::cout << "count after creating shared1: " << shared1.use_count() << std::endl;

    auto shared2 = shared1;   // COPY -- both now share ownership
    std::cout << "count after copying to shared2: " << shared1.use_count() << std::endl;

    std::cout << "shared1: " << *shared1 << ", shared2: " << *shared2 << std::endl;
    return 0;
}
```
Walkthrough: `make_unique<int>(42)` allocates and owns an `int`
exclusively via `ptr`, with automatic cleanup when `ptr` goes out of
scope. `shared1`'s reference count starts at `1`; copying it into
`shared2` increments the count to `2` WITHOUT copying the underlying
`int` itself — both `shared1` and `shared2` genuinely share ownership of
the exact same heap-allocated value.
