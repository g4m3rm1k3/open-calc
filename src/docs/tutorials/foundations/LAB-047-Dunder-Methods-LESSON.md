# FOUNDATIONS — LAB-047 — Python: Dunder Methods and the Data Model

**Series:** FOUNDATIONS — Part VIII: Python Features
**Environment:** Python REPL (`python3`)
**Time:** 50–65 minutes.

---

## What You Will Build

A custom collection class that supports `len()`, indexing, iteration, `in`, arithmetic operators, and string representation — by implementing the appropriate dunder methods. After this lab you will understand Python's data model: the system of protocols that makes custom classes behave like built-in types.

---

## What You Need to Know First

**From LAB-043 (Iterators):** The iterator protocol (`__iter__`, `__next__`) is one set of dunder methods. This lab shows the rest of the data model.

**From LAB-012 (Classes):** You understand Python classes. Dunder methods are special methods that Python calls automatically for built-in operations.

---

> **Quick Check — try to answer before reading:**
>
> 1. What dunder method does `len(obj)` call?
> 2. What dunder method does `obj[i]` call?
> 3. What dunder method does `print(obj)` call first?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Python Data Model

Python's data model is the set of protocols that define how objects behave in Python. Every operation in Python calls a dunder (double-underscore) method on the involved objects.

**Dunder methods are not magic** — they are a systematic protocol. When Python evaluates `a + b`, it calls `a.__add__(b)`. When it evaluates `len(a)`, it calls `a.__len__()`. When it evaluates `for item in a`, it calls `a.__iter__()`. You implement these methods to make your class participate in Python's built-in syntax.

This is why you can do `len("hello")`, `len([1,2,3])`, and `len(my_custom_class())` with the same syntax — all three implement `__len__`.

---

### Step 2 — Building a Custom Collection

```python
from typing import Iterator, TypeVar, Generic

T = TypeVar('T')

class BoundedList(Generic[T]):
    """A list with a maximum capacity — raises when full."""

    def __init__(self, capacity: int) -> None:
        self._capacity = capacity
        self._items: list[T] = []

    # --- Sequence protocol ---

    def __len__(self) -> int:
        """Called by len(bounded_list)."""
        return len(self._items)

    def __getitem__(self, index: int) -> T:
        """Called by bounded_list[i]."""
        return self._items[index]

    def __setitem__(self, index: int, value: T) -> None:
        """Called by bounded_list[i] = value."""
        self._items[index] = value

    def __delitem__(self, index: int) -> None:
        """Called by del bounded_list[i]."""
        del self._items[index]

    def __contains__(self, value: object) -> bool:
        """Called by 'value in bounded_list'."""
        return value in self._items

    def __iter__(self) -> Iterator[T]:
        """Called by 'for item in bounded_list'."""
        return iter(self._items)

    # --- String representation ---

    def __repr__(self) -> str:
        """Called by repr(bounded_list) and in the REPL."""
        return f"BoundedList(capacity={self._capacity}, items={self._items!r})"

    def __str__(self) -> str:
        """Called by str(bounded_list) and print(bounded_list)."""
        return f"[{', '.join(str(item) for item in self._items)}] (max {self._capacity})"

    # --- Custom methods ---

    def append(self, value: T) -> None:
        if len(self._items) >= self._capacity:
            raise OverflowError(f"BoundedList is full (capacity {self._capacity})")
        self._items.append(value)

    @property
    def is_full(self) -> bool:
        return len(self._items) >= self._capacity
```

**The walkthrough — using all the dunder methods:**

```python
bl = BoundedList[int](capacity=3)

bl.append(10)
bl.append(20)
bl.append(30)

print(len(bl))         # 3 — calls __len__
print(bl[1])           # 20 — calls __getitem__(1)
print(20 in bl)        # True — calls __contains__
print(repr(bl))        # BoundedList(capacity=3, items=[10, 20, 30])
print(str(bl))         # [10, 20, 30] (max 3)

for item in bl:        # calls __iter__
    print(item)        # 10, 20, 30

bl[0] = 99             # calls __setitem__(0, 99)
del bl[2]              # calls __delitem__(2)

try:
    bl.append(100)
    bl.append(200)     # raises OverflowError — capacity is 3
except OverflowError as error:
    print(error)       # "BoundedList is full (capacity 3)"
```

---

### Step 3 — `__repr__` vs `__str__`

The distinction is subtle but important:

- **`__repr__`** is for developers — it should produce a string that, when `eval()`-ed, recreates the object. Always implement `__repr__`. Used in the REPL, `repr()`, and container's `__repr__`.
- **`__str__`** is for end users — a readable, human-friendly representation. Used by `print()`, `str()`, and f-string `{obj}`. If `__str__` is not defined, Python falls back to `__repr__`.

```python
from datetime import datetime

now = datetime.now()
print(repr(now))  # datetime.datetime(2026, 6, 13, 12, 30, 0, 123456) — reconstructable
print(str(now))   # 2026-06-13 12:30:00.123456 — human-readable
```

**The SE lens — implement `__repr__` first:** Every class should have `__repr__`. Without it, all instances appear as `<MyClass object at 0x...>` in debugging sessions, making it impossible to see the state. With `__repr__`, the REPL becomes a debugger.

---

### Step 4 — Arithmetic Operators

```python
from dataclasses import dataclass

@dataclass
class Vector2D:
    x: float
    y: float

    def __add__(self, other: 'Vector2D') -> 'Vector2D':
        """Called by v1 + v2."""
        return Vector2D(self.x + other.x, self.y + other.y)

    def __sub__(self, other: 'Vector2D') -> 'Vector2D':
        """Called by v1 - v2."""
        return Vector2D(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float) -> 'Vector2D':
        """Called by v * 2.0."""
        return Vector2D(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar: float) -> 'Vector2D':
        """Called by 2.0 * v (right-side multiplication)."""
        return self.__mul__(scalar)

    def __abs__(self) -> float:
        """Called by abs(v) — returns magnitude."""
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector2D):
            return NotImplemented
        return self.x == other.x and self.y == other.y

v1 = Vector2D(1, 2)
v2 = Vector2D(3, 4)

print(v1 + v2)      # Vector2D(x=4, y=6)
print(v1 - v2)      # Vector2D(x=-2, y=-2)
print(v1 * 3)       # Vector2D(x=3, y=6)
print(3 * v1)       # Vector2D(x=3, y=6) — uses __rmul__
print(abs(v2))      # 5.0 — magnitude of (3,4)
```

**The CS lens — operator overloading:** Python resolves `a + b` as `a.__add__(b)`. If that returns `NotImplemented`, Python tries `b.__radd__(a)`. This protocol lets you define how your objects behave with Python's operators — the same mechanism that makes numpy arrays support `array + 5` for element-wise addition.

---

### Step 5 — Comparison and Hashing

```python
from functools import total_ordering

@total_ordering  # generates __le__, __gt__, __ge__ from __eq__ and __lt__
class Temperature:
    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius == other.celsius

    def __lt__(self, other: 'Temperature') -> bool:
        return self.celsius < other.celsius

    def __hash__(self) -> int:
        return hash(self.celsius)  # needed to use in sets/dicts

    def __repr__(self) -> str:
        return f"Temperature({self.celsius}°C)"

t1 = Temperature(20)
t2 = Temperature(30)
print(t1 < t2)   # True
print(t1 > t2)   # False — generated by @total_ordering
print(t1 <= t2)  # True — generated

temps = {t1, t2}  # works because __hash__ is implemented
print(sorted([t2, t1]))  # [Temperature(20°C), Temperature(30°C)]
```

**The CS lens — `__hash__` and mutability:** If you define `__eq__`, Python sets `__hash__ = None` by default, making instances unhashable. You must define `__hash__` explicitly if you want to use instances in sets or as dict keys. The rule: objects that are equal must have the same hash. Mutable objects should generally not be hashable (use `frozen=True` in dataclasses).

---

## Connect the Pieces

- **NumPy arrays** implement all arithmetic dunder methods for element-wise operations — `array1 + array2` calls `__add__` and produces a new array.
- **Pandas DataFrames** implement comparison dunder methods — `df > 0` returns a boolean DataFrame.
- **SQLAlchemy columns** override `__eq__` to produce SQL comparison expressions — `User.name == 'Alice'` produces a SQL WHERE clause, not a Python boolean.

---

## What Breaks Without This

**Not returning `NotImplemented` from `__eq__`:**

```python
class BadVector:
    def __eq__(self, other):
        return self.x == other.x  # crashes if other has no .x
```

`BadVector() == "hello"` raises `AttributeError: 'str' object has no attribute 'x'`. The correct pattern: return `NotImplemented` when the other object is not a compatible type. Python then tries the reflected operation (`"hello".__eq__(BadVector())`), which also returns `NotImplemented`, and Python concludes the objects are not equal — no crash.

---

## Definition of Done

- [ ] `len(bounded_list)` works correctly
- [ ] `bounded_list[0]` and `bounded_list[0] = value` work correctly
- [ ] `20 in bounded_list` returns `True`
- [ ] `for item in bounded_list` iterates all items
- [ ] `repr(bounded_list)` shows a reconstructable representation
- [ ] `Vector2D(1,2) + Vector2D(3,4)` returns `Vector2D(x=4, y=6)`
- [ ] `3 * Vector2D(1,2)` works via `__rmul__`

**Git commit:**

```
git add src/
git commit -m "LAB-047: Python dunder methods — data model protocols make custom classes behave as built-in types; __repr__ vs __str__ explained; operator overloading via __add__/__rmul__"
```

---

## Quick Check Answers

1. **`__len__`.** `len(obj)` calls `obj.__len__()`. Python raises `TypeError: object of type 'X' has no len()` if `__len__` is not defined.
2. **`__getitem__`.** `obj[i]` calls `obj.__getitem__(i)`. Slice notation `obj[1:3]` calls `obj.__getitem__(slice(1, 3))`.
3. **`__str__`.** `print(obj)` calls `str(obj)` which calls `obj.__str__()`. If `__str__` is not defined, Python falls back to `obj.__repr__()`. If neither is defined, Python uses the default `object.__repr__` which returns `<ClassName object at 0x...>`.
