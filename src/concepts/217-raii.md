---
concept: 217-raii
name: RAII (C++)
---

## Definition

RAII (Resource Acquisition Is Initialization) is a C++ idiom where a
resource (memory, a file handle, a lock) is acquired in a constructor and
automatically released in the corresponding destructor — tying a
resource's lifetime directly to an object's lifetime, so it's cleaned up
automatically when that object goes out of scope, regardless of how the
scope is exited.

## Problem

Manually pairing every resource acquisition with an explicit release call
(opening a file, then remembering to close it at every possible exit
point, including early returns and exceptions) is error-prone — any exit
path that skips the release call leaks the resource. RAII ties release to
an object's DESTRUCTOR, which C++ guarantees runs automatically when that
object goes out of scope, for ANY reason (normal return, early return, or
an exception unwinding the stack).

## Execution

A class acquires a resource in its CONSTRUCTOR, and releases it in its
DESTRUCTOR
↓
When the object's enclosing scope ENDS, its destructor runs
AUTOMATICALLY, releasing the resource — no explicit cleanup call needed
at the end
↓
Even if an EXCEPTION is thrown partway through the scope, C++ still
guarantees the destructor runs during stack unwinding — the resource is
released regardless of HOW the scope was exited
↓
This is the exact mechanism underlying `std::unique_ptr` (see Smart
Pointers (C++)) and `std::lock_guard` — both are RAII wrappers around a
raw resource (heap memory, a mutex), providing the same
automatic-cleanup guarantee

## Computer Science

RAII ties a resource's lifetime EXACTLY to an object's scope-based
lifetime, which C++ (unlike garbage-collected languages) determines
deterministically and immediately — the destructor runs the INSTANT the
object goes out of scope, not at some later, unpredictable
garbage-collection pass, making RAII both a safety mechanism AND a way to
get precise, immediate cleanup timing.

Tags: Deterministic destruction, Stack unwinding, Scope-based lifetime, Exception safety

## Software Engineering

RAII is C++'s primary answer to the same "guaranteed cleanup regardless
of exit path" problem that Python's `with` (see Context Managers
(Python)), Go's `defer` (see Defer (Go)), and Rust's ownership all solve
in their own ways — recognizing this same underlying pattern across
languages helps transfer the intuition, even though the concrete syntax
differs.

Tags: Cross-language pattern parallel, Guaranteed cleanup, Exception safety by design

## Common Mistakes

- Manually managing a resource (calling acquire/release functions directly) instead of wrapping it in an RAII class — this reintroduces the exact "forgot to release on some exit path" risk RAII exists to eliminate.
- Writing an RAII class without also handling COPYING correctly (or explicitly disabling it) — if a class manages a resource but its default copy constructor just copies the raw pointer/handle, TWO objects can end up trying to release the SAME resource, causing a double-free.

## Exercises

- Trace through what happens to a resource if an exception is thrown INSIDE the scope where its RAII guard object lives — does the resource still get released, and by what mechanism?
- Explain why `std::unique_ptr` is described as "RAII for heap memory" — what does its constructor acquire, and what does its destructor release?

## cpp

```cpp
#include <iostream>
#include <string>

class ResourceGuard {
    std::string name;
public:
    ResourceGuard(const std::string& n) : name(n) {
        std::cout << "acquiring " << name << std::endl;
    }
    ~ResourceGuard() {
        std::cout << "releasing " << name << std::endl;
    }
};

int main() {
    std::cout << "before scope" << std::endl;
    {
        ResourceGuard guard("file handle");
        std::cout << "using resource" << std::endl;
    }   // guard's destructor runs HERE, automatically, as soon as this scope ends
    std::cout << "after scope" << std::endl;
    return 0;
}
```
Walkthrough: `ResourceGuard`'s constructor runs when `guard` is created,
and its destructor runs AUTOMATICALLY the instant the enclosing `{ }`
block ends — printing "releasing file handle" right after "using
resource", BEFORE "after scope" ever prints — demonstrating that cleanup
happens deterministically at scope exit, with no explicit release call
written anywhere.
