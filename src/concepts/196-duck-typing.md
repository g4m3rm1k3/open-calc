---
concept: 196-duck-typing
name: Duck Typing (Python)
---

## Definition

Duck typing means an object's suitability for an operation is determined
by whether it has the right METHODS/BEHAVIOR ("if it walks like a duck
and quacks like a duck"), not by its declared TYPE — Python code often
calls a method or accesses an attribute without checking the object's
class first, trusting that IF the object supports that operation, it'll
work correctly regardless of its actual type.

## Problem

Explicitly checking an object's type before every operation couples code
tightly to specific concrete classes, rejecting other objects that would
have worked just fine even though they're not that exact type. Duck
typing lets code work with ANY object that happens to support the needed
operations, without requiring a shared base class or explicit type
declaration.

## Execution

A function calls `.quack()` on whatever it's given — no type check
anywhere, just calls the method directly
↓
One class genuinely represents a duck, and has `.quack()`
↓
A completely unrelated class also happens to have a `.quack()` method,
despite not being a duck at all
↓
Calling the function with the real duck works, calling `Duck.quack`
↓
Calling the function with the unrelated class ALSO works, calling that
class's OWN `.quack()` — the function never checked either object's
actual TYPE, only that `.quack()` existed and worked when called

## Computer Science

This is Python's default RUNTIME structural typing — unlike Go's
implicit interfaces (see Implicit Interfaces (Go)), which are CHECKED at
compile time, Python's duck typing has NO compile-time check at all; if
the object doesn't actually support the called operation, the failure
only surfaces as an `AttributeError` at RUNTIME, the exact moment the
missing method is actually called.

Tags: Runtime structural typing, No compile-time check, AttributeError

## Software Engineering

Duck typing is why Python code often favors "ask forgiveness, not
permission" (try the operation, catch the exception if it fails) over
"look before you leap" (check the type first) — checking types explicitly
(`isinstance`) works against duck typing's whole flexibility benefit, and
is generally reserved for cases where genuinely different behavior is
needed per type, not just as a defensive guard.

Tags: EAFP vs LBYL, isinstance overuse, Pythonic error handling

## Common Mistakes

- Adding unnecessary `isinstance` checks before calling a method, when duck typing would have handled any object supporting that method correctly anyway — this needlessly restricts what types of objects can be passed in, defeating one of Python's core flexibility benefits.
- Assuming an object supports an operation just because it "seems like" it should, without either checking or handling the resulting `AttributeError` if it turns out not to — duck typing trades compile-time safety for flexibility, and that tradeoff means runtime errors ARE possible if an incompatible object sneaks in.

## Exercises

- Trace through what happens if the quacking function were called with an object that has NO `.quack()` method at all — what specific error occurs, and at what point (when the function is called, or only when `.quack()` is actually accessed)?
- Explain why Python's duck typing is a RUNTIME check, while Go's implicit interface satisfaction is a COMPILE-TIME check, even though both avoid requiring an explicit "implements" declaration.

## python

```python
class Duck:
    def quack(self):
        return "Quack!"


class Person:
    def quack(self):
        return "I'm quacking like a duck!"


def make_it_quack(duck):
    return duck.quack()   # no type check anywhere -- just calls .quack() directly


print(make_it_quack(Duck()))     # Quack!
print(make_it_quack(Person()))   # I'm quacking like a duck! -- Person isn't a Duck at all, but it still works

try:
    make_it_quack(object())   # a plain object has no .quack() method
except AttributeError as e:
    print(f"failed: {e}")
```
Walkthrough: `make_it_quack` works identically on `Duck()` and `Person()`
— two completely unrelated classes — since it never checks either
object's actual type, only that `.quack()` exists and works when called.
Passing a plain `object()` (which has no `.quack()` method) raises an
`AttributeError` only at the moment `.quack()` is actually accessed
inside `make_it_quack`, demonstrating that duck typing's compatibility
check happens entirely at RUNTIME, not before.
