# Lesson 25: Special Methods — Making Objects Feel Like Python

What you will build: The reader understands Python's special (dunder) methods: `__repr__`, `__str__`, `__eq__`, `__lt__`, `__add__`, `__len__`, `__contains__`, `__iter__`, `__getitem__`. These make user-defined classes work with Python's built-in functions and operators. The transferable insight: Python's operators and built-ins are backed by method calls. `+` calls `__add__`. `len()` calls `__len__`. `in` calls `__contains__`. By implementing these methods, your class integrates with Python's entire ecosystem of tools (`sorted`, `max`, `in`, `print`, `==`, etc.).

What you need to know first: Lessons 00-24.

**Terms used in this lesson**
- **Special methods (dunder methods)** — Methods with double underscores before and after their names (e.g., `__init__`). They are called implicitly by Python when objects are used with standard operators and built-in functions, allowing custom classes to emulate built-in behavior.
- **Generator** — A function that returns an iterator that produces a sequence of values one at a time using `yield`, preserving state between calls. It solves the problem of returning multiple values without storing them all in memory at once.
- **Context manager** — An object that defines the runtime context established when executing a `with` statement. It guarantees that setup and teardown actions (like closing a file or stopping a timer) happen reliably, even if an exception occurs.

**Objects and methods used**
- **`__repr__`**
  - *What it is:* A special method for the "official" string representation of an object.
  - *Implementation:* `def __repr__(self): ...` returning a string.
  - *Its use:* Used for debugging and logging.
  - *Type:* Instance method.
  - *Responsibility:* Returns a string that ideally looks like a valid Python expression that could be used to recreate an object with the same value.
  - *Depends on:* The object's internal state.
  - *Connects to:* Called by the built-in `repr()` function and when an object is inspected in the interactive interpreter.
  - *Shape:* A standard part of Python's data model interface.
- **`__str__`**
  - *What it is:* A special method for the "informal" or nicely printable string representation of an object.
  - *Implementation:* `def __str__(self): ...` returning a string.
  - *Its use:* Used to present the object to an end user.
  - *Type:* Instance method.
  - *Responsibility:* Returns a human-readable string.
  - *Depends on:* The object's internal state.
  - *Connects to:* Called by the built-in `str()` function and `print()`.
  - *Shape:* A standard part of Python's data model interface.
- **`__eq__`**
  - *What it is:* A special method for equality comparison.
  - *Implementation:* `def __eq__(self, other): ...` returning a boolean or `NotImplemented`.
  - *Its use:* Used to define when two objects of the class are considered equal.
  - *Type:* Instance method.
  - *Responsibility:* Evaluates `self == other`.
  - *Depends on:* The object and the `other` operand.
  - *Connects to:* Called by the `==` operator.
  - *Shape:* A standard part of Python's data model interface.
- **`__lt__`**
  - *What it is:* A special method for less-than comparison.
  - *Implementation:* `def __lt__(self, other): ...` returning a boolean.
  - *Its use:* Used for sorting and `<` operator.
  - *Type:* Instance method.
  - *Responsibility:* Evaluates `self < other`.
  - *Depends on:* The object and the `other` operand.
  - *Connects to:* Called by the `<` operator and built-ins like `sorted()`.
  - *Shape:* A standard part of Python's data model interface.
- **`functools.total_ordering`**
  - *What it is:* A class decorator.
  - *Implementation:* `@total_ordering` placed above a class definition.
  - *Its use:* Automatically supplies missing comparison methods if at least `__eq__` and one ordering method are defined.
  - *Type:* Class decorator.
  - *Responsibility:* Reduces boilerplate code for rich comparisons.
  - *Depends on:* A class defining `__eq__` and one of `__lt__`, `__le__`, `__gt__`, or `__ge__`.
  - *Connects to:* Injected into the class dictionary to provide missing comparison methods.
  - *Shape:* Utility decorator in the `functools` standard library.
- **`__add__`**
  - *What it is:* A special method for addition.
  - *Implementation:* `def __add__(self, other): ...` returning a new object.
  - *Its use:* Used to define how two instances are added together.
  - *Type:* Instance method.
  - *Responsibility:* Evaluates `self + other`.
  - *Depends on:* The object and the `other` operand.
  - *Connects to:* Called by the `+` operator.
  - *Shape:* A standard part of Python's data model interface.
- **`__len__`**
  - *What it is:* A special method for length.
  - *Implementation:* `def __len__(self): ...` returning an integer.
  - *Its use:* Used to define the "size" or number of items in an object.
  - *Type:* Instance method.
  - *Responsibility:* Returns the length of the container.
  - *Depends on:* The object's internal collection.
  - *Connects to:* Called by the built-in `len()` function.
  - *Shape:* A standard part of Python's data model interface.
- **`__iter__`**
  - *What it is:* A special method for iteration.
  - *Implementation:* `def __iter__(self): ...` returning an iterator.
  - *Its use:* Used to define how to iterate over the object.
  - *Type:* Instance method.
  - *Responsibility:* Provides an iterator for the container.
  - *Depends on:* The object's internal state.
  - *Connects to:* Called by `for` loops, `iter()`, and functions like `list()`.
  - *Shape:* A standard part of Python's data model interface.
- **`__getitem__`**
  - *What it is:* A special method for indexing.
  - *Implementation:* `def __getitem__(self, index): ...` returning a value.
  - *Its use:* Used to access elements via `obj[index]`.
  - *Type:* Instance method.
  - *Responsibility:* Returns the item at the specified index or key.
  - *Depends on:* The given index.
  - *Connects to:* Called by the subscript operator `[]`.
  - *Shape:* A standard part of Python's data model interface.
- **`__enter__`** and **`__exit__`**
  - *What it is:* Special methods for context management.
  - *Implementation:* `def __enter__(self): ...` and `def __exit__(self, exc_type, exc_val, exc_tb): ...`.
  - *Its use:* Used to define setup and teardown for `with` blocks.
  - *Type:* Instance methods.
  - *Responsibility:* Manage resources deterministically around a block of code.
  - *Depends on:* Execution context.
  - *Connects to:* Called automatically by the `with` statement.
  - *Shape:* A standard part of Python's data model interface.

## Concept Unit: `__repr__` and `__str__` — string representations

### The Problem
When you print an object in Python, you often get a generic string like `<__main__.Point object at 0x...>`. If you want to log what's actually inside the object, this is useless. How can we make our object format itself nicely when printed, or precisely when debugged?

### Introduce the concept in isolation
```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f'Point({self.x!r}, {self.y!r})'

    def __str__(self):
        return f'({self.x}, {self.y})'

p = Point(3, 4)
print(repr(p))   # Point(3, 4)
print(str(p))    # (3, 4)
print(p)         # (3, 4)
```
This proves that Python hooks the built-in functions `repr()`, `str()`, and `print()` directly to the **special methods** `__repr__` and `__str__` defined on the class. `__repr__` returns an unambiguous representation, while `__str__` returns a readable one.

### Discard the throwaway
This isolated `Point` code is discarded and will not appear in our project.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `point.py` (created)
- **Change type**: add
- **Location**: brand-new file
- **Dependencies**: None.

### The New Code
```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        # Goal: unambiguous, ideally evaluable: eval(repr(p)) == p
        return f'Point({self.x!r}, {self.y!r})'

    def __str__(self):
        # Goal: human-readable
        return f'({self.x}, {self.y})'
```

### The Updated Project
```python
1: class Point:
2:     def __init__(self, x, y):
3:         self.x = x
4:         self.y = y
5: 
6:     def __repr__(self): # ← new
7:         # Goal: unambiguous, ideally evaluable: eval(repr(p)) == p
8:         return f'Point({self.x!r}, {self.y!r})' # ← new
9: 
10:    def __str__(self): # ← new
11:        # Goal: human-readable
12:        return f'({self.x}, {self.y})' # ← new
```
We now have a class with dedicated methods for string formatting.

### Mechanical walkthrough
- `def __repr__(self):` defines the method called by `repr()`.
- `return f'Point({self.x!r}, {self.y!r})'` uses an f-string to inject the values. The `!r` suffix specifically calls `repr()` on `self.x` and `self.y`, ensuring strings get quotes around them.
- `def __str__(self):` defines the method called by `str()` and implicitly by `print()`.
- `return f'({self.x}, {self.y})'` returns a purely human-readable format.

### CS lens
Data representation. Every system distinguishes between "how data is stored" and "how data is serialized for communication." This mirrors serialization formats like JSON, debugging views in IDEs, and logging payloads.

### SE lens
Separation of concerns for output. By having two different methods, Python explicitly acknowledges that developers need rigorous detail (for debugging and logging) and users need clean summaries (for display). We don't have to pollute one with the constraints of the other.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `Point(3, 4)` for `repr(p)` and `(3, 4)` for `str(p)`.

### One sentence connecting to previous unit
Now that we can display objects meaningfully, we need a way to compare them structurally instead of just by identity.

## Concept Unit: `__eq__` and `__lt__` — comparison operators

### The Problem
If you create `Point(1, 2)` and another `Point(1, 2)`, Python considers them unequal by default because they occupy different memory addresses. How do we tell Python that equality should be based on their coordinates?

### Introduce the concept in isolation
```python
from functools import total_ordering

@total_ordering
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __lt__(self, other):
        return (self.x**2 + self.y**2) < (other.x**2 + other.y**2)

    def __repr__(self):
        return f'Point({self.x}, {self.y})'

p1 = Point(1, 2)
p2 = Point(1, 2)
p3 = Point(3, 4)
print(p1 == p2)
print(sorted([p3, p1, p2]))
```
This proves that overriding **special methods** `__eq__` and `__lt__` completely redefines how `==` and sorting behave for these instances.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `point.py` (modified)
- **Change type**: configure
- **Location**: added directly into the `Point` class.
- **Dependencies**: None.

### The New Code
```python
    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __lt__(self, other):
        # Compare by distance from origin
        return (self.x**2 + self.y**2) < (other.x**2 + other.y**2)
```

### The Updated Project
```python
1: class Point:
2:     def __init__(self, x, y):
3:         self.x, self.y = x, y
4: 
5:     def __eq__(self, other): # ← new
6:         if not isinstance(other, Point): # ← new
7:             return NotImplemented # ← new
8:         return self.x == other.x and self.y == other.y # ← new
9: 
10:    def __lt__(self, other): # ← new
11:        # Compare by distance from origin
12:        return (self.x**2 + self.y**2) < (other.x**2 + other.y**2) # ← new
13: 
14:    def __repr__(self):
15:        return f'Point({self.x}, {self.y})'
```
The `Point` class now supports rich comparison operators natively.

### Mechanical walkthrough
- `def __eq__(self, other):` is called when `p1 == p2` is evaluated. `self` is `p1`, `other` is `p2`.
- `if not isinstance(other, Point):` guards against comparing a `Point` to unrelated types like strings.
- `return NotImplemented` tells Python to fall back to other comparison strategies or return `False`.
- `return self.x == other.x and self.y == other.y` defines structural equality based on fields.
- `def __lt__(self, other):` is called when `p1 < p2` is evaluated.
- `return (self.x**2 + self.y**2) < (other.x**2 + other.y**2)` compares the squared distance from the origin for each point.

### CS lens
Value semantics vs. Reference semantics. By default, user-defined classes in Python use reference equality (memory address). Overriding `__eq__` switches the class to value equality, treating objects with identical data as mathematically identical.

### SE lens
Fail-safe typing. Returning `NotImplemented` instead of raising an error allows Python's operator resolution to attempt the comparison from the reverse direction (`other.__eq__(self)`) before cleanly giving up. It is cooperative rather than destructive.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `p1 == p2` evaluates to `True`. `sorted` yields `[Point(1, 2), Point(1, 2), Point(3, 4)]`.

### One sentence connecting to previous unit
If we can redefine comparison operators like `==`, we can also redefine mathematical operators like `+`.

## Concept Unit: `__add__`, `__mul__`, `__len__` — arithmetic and sizing

### The Problem
If we have two vectors, mathematically we should be able to add them directly like `v1 + v2`. Python natively restricts `+` to numbers and strings. How do we teach the `+` operator to understand a custom `Vector` class?

### Introduce the concept in isolation
```python
class Vector:
    def __init__(self, *components):
        self.components = tuple(components)

    def __add__(self, other):
        return Vector(*(a + b for a, b in zip(self.components, other.components)))

    def __mul__(self, scalar):
        return Vector(*(x * scalar for x in self.components))

    def __rmul__(self, scalar):
        return self.__mul__(scalar)

    def __len__(self):
        return len(self.components)
        
v1 = Vector(1, 2, 3)
print(v1 + Vector(4, 5, 6))
```
This proves that by defining **special methods** for arithmetic (`__add__`, `__mul__`) and sizing (`__len__`), custom objects act identical to built-in numbers and collections.

### Discard the throwaway
This vector throwaway code is discarded.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `vector.py` (created)
- **Change type**: add
- **Location**: brand-new file
- **Dependencies**: None.

### The New Code
```python
class Vector:
    def __init__(self, *components):
        self.components = tuple(components)

    def __add__(self, other):
        if len(self) != len(other):
            raise ValueError('Vectors must have same dimension')
        return Vector(*(a + b for a, b in zip(self.components, other.components)))

    def __mul__(self, scalar):
        return Vector(*(x * scalar for x in self.components))

    def __rmul__(self, scalar):  # scalar * vector
        return self.__mul__(scalar)

    def __len__(self):
        return len(self.components)

    def __repr__(self):
        return f'Vector{self.components}'
```

### The Updated Project
```python
1: class Vector: # ← new
2:     def __init__(self, *components): # ← new
3:         self.components = tuple(components) # ← new
4: 
5:     def __add__(self, other): # ← new
6:         if len(self) != len(other): # ← new
7:             raise ValueError('Vectors must have same dimension') # ← new
8:         return Vector(*(a + b for a, b in zip(self.components, other.components))) # ← new
9: 
10:    def __mul__(self, scalar): # ← new
11:        return Vector(*(x * scalar for x in self.components)) # ← new
12: 
13:    def __rmul__(self, scalar):  # scalar * vector # ← new
14:        return self.__mul__(scalar) # ← new
15: 
16:    def __len__(self): # ← new
17:        return len(self.components) # ← new
18: 
19:    def __repr__(self): # ← new
20:        return f'Vector{self.components}' # ← new
```
We now have a mathematically functional vector.

### Mechanical walkthrough
- `def __add__(self, other):` binds to the `+` operator.
- `len(self) != len(other)` checks dimensions by implicitly calling `self.__len__()`.
- `Vector(*(a + b for a, b in zip(self.components, other.components)))` pairwise-adds the elements and unpacks them into a new `Vector` instance.
- `def __mul__(self, scalar):` binds to `*` when the vector is on the left (`v * 3`).
- `def __rmul__(self, scalar):` binds to `*` when the vector is on the right (`3 * v`). Python tries `3.__mul__(v)`, fails, and falls back to `v.__rmul__(3)`.
- `def __len__(self):` binds to the built-in `len()` function, delegating to the tuple's length.

### CS lens
Operator overloading. By enabling user types to participate in native language syntax (like `+` or `len`), languages reduce boilerplate function calls (`v1.add(v2)`) and increase readability for domains like math and graphics.

### SE lens
Immutability. `__add__` and `__mul__` return entirely new `Vector` instances rather than modifying `self`. This prevents side effects when passing vectors around the system.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `v1 + v2` creates `Vector(5, 7, 9)`. `len(v1)` yields `3`.

### One sentence connecting to previous unit
Beyond arithmetic, collections also need to support being looped over.

## Concept Unit: `__iter__` and `__getitem__` — iteration protocol

### The Problem
If we have a custom range of numbers, how do we make `for x in my_range:` work? Python's `for` loop doesn't inherently know how to get the "next" item from a custom class.

### Introduce the concept in isolation
```python
class NumberRange:
    def __init__(self, start, stop):
        self.start, self.stop = start, stop

    def __iter__(self):
        current = self.start
        while current < self.stop:
            yield current
            current += 1

r = NumberRange(3, 8)
print(list(r))
```
This proves that by yielding values via the **special method** `__iter__`, an object acts as an iterable sequence.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `range.py` (created)
- **Change type**: add
- **Location**: brand-new file
- **Dependencies**: None.

### The New Code
```python
class NumberRange:
    def __init__(self, start, stop):
        self.start = start
        self.stop = stop

    def __iter__(self):
        current = self.start
        while current < self.stop:
            yield current         # generator: one value at a time
            current += 1

    def __contains__(self, item):
        return self.start <= item < self.stop

    def __len__(self):
        return max(0, self.stop - self.start)

    def __getitem__(self, index):
        if index < 0 or index >= len(self):
            raise IndexError(index)
        return self.start + index
```

### The Updated Project
```python
1: class NumberRange: # ← new
2:     def __init__(self, start, stop): # ← new
3:         self.start = start # ← new
4:         self.stop = stop # ← new
5: 
6:     def __iter__(self): # ← new
7:         current = self.start # ← new
8:         while current < self.stop: # ← new
9:             yield current         # generator: one value at a time # ← new
10:            current += 1 # ← new
11: 
12:    def __contains__(self, item): # ← new
13:        return self.start <= item < self.stop # ← new
14: 
15:    def __len__(self): # ← new
16:        return max(0, self.stop - self.start) # ← new
17: 
18:    def __getitem__(self, index): # ← new
19:        if index < 0 or index >= len(self): # ← new
20:            raise IndexError(index) # ← new
21:        return self.start + index # ← new
```
We now have a custom container that fully integrates with iteration and indexing.

### Mechanical walkthrough
- `def __iter__(self):` binds to `iter()`, which is called implicitly by `for` loops.
- `yield current` turns `__iter__` into a **Generator**. It pauses execution, returns `current`, and resumes from that spot on the next loop iteration.
- `def __contains__(self, item):` binds to the `in` operator (e.g., `5 in r`).
- `def __getitem__(self, index):` binds to the bracket syntax `r[index]`.
- `raise IndexError(index)` adheres to Python's contract: invalid indices must raise an `IndexError` to stop implicit iterations appropriately.

### CS lens
Lazy Evaluation. The `NumberRange` does not allocate memory for a list of numbers. It computes them only exactly when asked, via the generator, saving unbounded memory overhead.

### SE lens
Adhering to interfaces without inheritance. Python relies on "duck typing". `NumberRange` doesn't need to inherit from `List` or `Iterable` base classes; simply implementing `__iter__` and `__getitem__` is enough for Python to treat it as a full-fledged collection.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `list(r)` creates `[3, 4, 5, 6, 7]`. `5 in r` evaluates to `True`. `r[2]` yields `5`.

### One sentence connecting to previous unit
Beyond data representation and operations, we can also manage execution contexts around our code.

## Concept Unit: `__enter__` and `__exit__` — context managers

### The Problem
When you open a file, you must close it, even if an error occurs while reading it. The `with open(...) as f:` syntax guarantees this cleanup. How do we create our own objects that safely setup and teardown resources automatically in a `with` block?

### Introduce the concept in isolation
```python
class Timer:
    import time as _time
    def __enter__(self):
        self.start = self._time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = self._time.perf_counter() - self.start
        print(f'Elapsed: {self.elapsed:.4f}s')
        return False

import time
with Timer() as t:
    time.sleep(0.1)
```
This proves that the **special methods** `__enter__` and `__exit__` hook directly into the lifecycle of a `with` statement, executing predictably before and after the block.

### Discard the throwaway
This throwaway timer code is discarded.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `timer.py` (created)
- **Change type**: add
- **Location**: brand-new file
- **Dependencies**: None.

### The New Code
```python
class Timer:
    import time as _time

    def __enter__(self):
        self.start = self._time.perf_counter()
        return self                 # bound to 'as' variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = self._time.perf_counter() - self.start
        print(f'Elapsed: {self.elapsed:.4f}s')
        return False  # False: don't suppress exceptions
```

### The Updated Project
```python
1: class Timer: # ← new
2:     import time as _time # ← new
3: 
4:     def __enter__(self): # ← new
5:         self.start = self._time.perf_counter() # ← new
6:         return self                 # bound to 'as' variable # ← new
7: 
8:     def __exit__(self, exc_type, exc_val, exc_tb): # ← new
9:         self.elapsed = self._time.perf_counter() - self.start # ← new
10:        print(f'Elapsed: {self.elapsed:.4f}s') # ← new
11:        return False  # False: don't suppress exceptions # ← new
```
We have a custom context manager for profiling code duration safely.

### Mechanical walkthrough
- `def __enter__(self):` is called exactly when the `with Timer() as t:` block begins.
- `return self` specifies that the returned value is assigned to `t`, the variable named after `as`.
- `def __exit__(self, exc_type, exc_val, exc_tb):` is called exactly when the block ends, regardless of success or failure.
- `exc_type, exc_val, exc_tb` hold exception information if an error occurred inside the `with` block.
- `return False` tells Python not to silently suppress exceptions, allowing them to propagate up normally.

### CS lens
Resource acquisition is initialization (RAII). This pattern ensures that resources (locks, files, sockets, or timers) are tied inextricably to the lifespan of an object, guaranteeing cleanup upon destruction.

### SE lens
Deterministic teardown. By embedding teardown directly into `__exit__`, the caller physically cannot forget to invoke it. The API protects itself against misuse.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The output will print approximately `Elapsed: 0.1001s`.

### One sentence connecting to previous unit
These dunder methods all serve to make our classes feel natively integrated with Python.

## Closing

### Connect the pieces
Let's trace a `Vector(1, 2, 3)` through these concepts:
- **`__repr__`**: If we inspect the vector, `Vector(1, 2, 3)` is clearly logged.
- **`__add__`**: If we calculate `Vector(1, 2, 3) + Vector(4, 5, 6)`, `__add__` yields a new Vector instance `Vector(5, 7, 9)`.
- **`__mul__`**: If we do `3 * Vector(1, 2, 3)`, `__rmul__` catches the reverse operation and calls `__mul__`, returning `Vector(3, 6, 9)`.
- **`__len__`**: We can call `len(Vector(1, 2, 3))` directly, and `__len__` returns `3`.
- **`__iter__`**: Though we didn't add it to `Vector` above, if we implemented `__iter__` to yield components, we could do `for component in Vector(1, 2, 3):`.

Python's data model uses methods starting and ending with double underscores to integrate your objects with the language syntax. Overriding them transforms a basic class into a native citizen of the Python environment.
