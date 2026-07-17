---
concept: 197-magic-methods
name: Magic Methods (Python)
---

## Definition

Magic methods (also called "dunder methods," for their double-underscore
naming like `__init__`, `__str__`, `__add__`) are special methods Python
calls automatically in response to built-in operations — defining them
lets a custom class integrate with Python's own syntax (`+`, `len()`,
`str()`, `for`) as if it were a built-in type.

## Problem

Without magic methods, a custom class couldn't participate in Python's
built-in operators and functions at all — you'd need a specially-named
method for every operation, and callers would need to know your class's
specific API rather than using familiar, universal syntax. Magic methods
let custom objects respond to the SAME syntax built-in types already use.

## Execution

`__init__` is called AUTOMATICALLY when constructing a new instance
↓
Defining `__add__` lets `+` work directly on instances of that class
↓
Using `+` on two instances automatically calls `__add__` behind the
scenes, since `+` looks for that method on the left operand
↓
Defining `__str__` lets `str()` and `print()` produce a readable
representation, instead of the default unhelpful object representation
↓
Defining `__len__` lets `len()` work on instances, participating in the
SAME built-in function used for lists, strings, and dicts

## Computer Science

Magic methods are Python's version of operator overloading — the
language defines a fixed PROTOCOL (which method name corresponds to
which operator/builtin), and any class implementing the right method
automatically gains that operator's/builtin's support, without needing to
declare any special relationship or inherit from a specific base class.

Tags: Operator overloading, Protocols, Duck typing (structural), Built-in integration

## Software Engineering

Overusing or misusing magic methods (implementing `__add__` to do
something unrelated to addition, for instance) violates the PRINCIPLE OF
LEAST SURPRISE — since `+` on a custom class should behave analogously to
`+` on built-in numeric types, or callers will be legitimately confused
by unexpected behavior hiding behind familiar syntax.

Tags: Principle of least surprise, Semantic consistency, API design

## Common Mistakes

- Implementing a magic method with behavior unrelated to what that operator conventionally means — this creates genuinely surprising, hard-to-predict code for anyone using that operator on the class.
- Forgetting `__repr__`/`__str__` on a class meant to be printed or debugged — without them, printing an instance shows Python's unhelpful default representation instead of something meaningful.

## Exercises

- Trace through what printing an instance would show WITHOUT a `__str__` method defined, versus WITH one — what's Python's default fallback representation?
- Implement `__eq__` on the `Vector` class below so that two vectors with the same `x` and `y` compare as equal with `==` — what does Python do WITHOUT this method defined?

## python

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __len__(self):
        return 2


v1 = Vector(1, 2)
v2 = Vector(3, 4)

v3 = v1 + v2   # Python calls v1.__add__(v2) behind the scenes
print(v3)      # (4, 6) -- calls __str__ automatically, via print()

print(len(v1))   # 2 -- len() calls __len__ automatically
```
Walkthrough: `v1 + v2` works directly on `Vector` instances because
`__add__` is defined — Python translates the `+` operator into a call to
`v1.__add__(v2)` automatically. `print(v3)` calls `__str__` behind the
scenes to get a readable string instead of the default object
representation. `len(v1)` similarly calls `__len__`, letting `Vector`
participate in the same built-in `len()` function used for lists and
strings.
