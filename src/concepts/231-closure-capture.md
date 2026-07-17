---
concept: 231-closure-capture
name: Closure Capture (Swift)
---

## Definition

A closure in Swift automatically CAPTURES variables from its surrounding
scope, keeping them alive and accessible even after that scope has
otherwise ended — but capturing a REFERENCE type (like a class instance)
risks a "retain cycle" (a memory leak) if not handled carefully, since
the closure and the captured object can end up keeping each other alive
forever.

## Problem

A closure that outlives the function it was created in (stored for
later, like a completion handler) still needs access to variables from
that original scope — Swift's automatic capturing solves this by keeping
captured variables alive as long as the closure itself exists. But if a
class instance holds a closure that captures the instance right back
(directly or indirectly), neither can ever be deallocated, since each
keeps a strong reference to the other — a retain cycle.

## Execution

A function returns a closure that CAPTURES a local variable by
reference, keeping it alive even after the enclosing function itself has
returned
↓
Calling the returned closure repeatedly increments the SAME captured
variable each time, proving it persists across calls, not reset each
time
↓
A class whose closure captures `self` STRONGLY by default risks a
RETAIN CYCLE if that class also holds a strong reference to the closure
— the class keeps the closure alive, and the closure keeps the class
alive
↓
Using a `[weak self]` CAPTURE LIST breaks the cycle — the closure now
holds a WEAK reference to `self`, which doesn't keep it alive, letting
the class instance be deallocated normally when nothing else references
it

## Computer Science

Swift uses automatic reference counting (ARC, see Reference Counting) for
class instances — a retain cycle is EXACTLY the same structural problem
as Rust's `Rc` cycles (see Reference Counting) or a similar issue in
C++'s `shared_ptr` (see Smart Pointers (C++)): two objects holding strong
references to each other prevent their reference counts from ever
reaching zero, regardless of how many OTHER references exist.

Tags: ARC (automatic reference counting), Retain cycles, Cross-language pattern parallel

## Software Engineering

The idiomatic fix for closures that capture `self` and are STORED
somewhere `self` also owns (a property) is a `[weak self]` capture list —
this is specifically needed when the closure OUTLIVES the immediate
function call and is held onto by the very object it references, not for
every closure that happens to reference `self`.

Tags: [weak self] idiom, When capture lists matter, Memory leak prevention

## Common Mistakes

- Capturing `self` strongly in a closure that's STORED as a property of `self` (or otherwise kept alive by something `self` owns) — this is the specific pattern that creates a retain cycle, silently leaking memory since neither object's reference count ever reaches zero.
- Overusing `[weak self]` even in closures that DON'T create a retain cycle (e.g., a short-lived closure passed directly to a function and not stored anywhere) — this adds unnecessary optional-unwrapping complexity where a strong capture would have been perfectly safe.

## Exercises

- Trace through what the counter closure below returns on its THIRD call — does the captured count keep incrementing indefinitely across calls?
- Explain specifically why `[weak self]` is necessary for a closure captured in a stored property but would be UNNECESSARY for a closure passed directly to a function and never stored.

## swift

```swift
func makeCounter() -> () -> Int {
    var count = 0
    return {
        count += 1
        return count
    }
}

let counter = makeCounter()
print(counter())
print(counter())
print(counter())
```
Walkthrough: each call to `counter()` increments the SAME captured
`count` variable, which persists across calls even though `makeCounter`
itself already returned — printing `1`, then `2`, then `3` — direct
evidence that the closure genuinely captured `count` by reference,
keeping it alive rather than re-creating it fresh on every call.
