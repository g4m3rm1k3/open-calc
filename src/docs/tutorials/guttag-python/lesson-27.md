# Lesson 27: Dataclasses and Named Tuples — Lightweight Records

**What you will build**
The reader will use `collections.namedtuple`, `typing.NamedTuple`, and `@dataclass` to create lightweight record types with minimal boilerplate. The transferable problems: (1) `@dataclass` auto-generates `__init__`, `__repr__`, `__eq__`, and optionally `__hash__` and `__lt__` — write the fields, not the plumbing; (2) `frozen=True` makes the dataclass immutable and hashable; (3) knowing when to use a namedtuple (pure data, no methods, immutable) vs a dataclass (richer behavior, optional mutability) vs a full class (complex invariants, private state).

**What you need to know first**
Lessons 0–26.

**Terms used in this lesson**
- **Record** — a data structure that groups related fields together. It exists to bundle data logically without necessarily requiring full object-oriented behavior.
- **Immutable** — state that cannot be modified after creation. It exists to guarantee data integrity and enable safe use as dictionary keys or in sets.
- **Hashable** — an object that has a hash value that never changes during its lifetime, allowing it to be looked up efficiently in a hash table. It exists to support sets and dictionary keys.
- **Boilerplate** — repetitive code needed in many places with little to no alteration. It exists as a necessary evil in language design but is often targeted for elimination.
- **Type hint** — a formal indication of the type of a value. It exists to aid static analysis, IDE autocompletion, and self-documenting code.
- **Decorator** — a function that modifies the behavior of another function or class. It exists to cleanly separate cross-cutting concerns from core logic.
- **Default factory** — a function used to generate default values for a field dynamically. It exists to prevent the shared-mutable-default trap in class definitions.

**Objects and methods used**
- **`collections.namedtuple`**
  - *What it is:* A factory function for creating tuple subclasses with named fields.
  - *Implementation:* `def namedtuple(typename, field_names, ...): ...`
  - *Its use:* Used when data is a simple record, no methods are needed, and immutability is desired.
  - *Type:* Free function.
  - *Responsibility:* Generates a new subclass of `tuple` that allows accessing fields by name as well as by position.
  - *Depends on:* The name of the new type and an iterable (or space-separated string) of field names.
  - *Connects to:* Called by the developer; returns a class that can be instantiated.
  - *Shape:* A standard library utility boundary for defining lightweight types.
- **`typing.NamedTuple`**
  - *What it is:* A class-based syntax for creating named tuples with type hints.
  - *Implementation:* `class NamedTuple(tuple): ...`
  - *Its use:* Used when type annotations and default values are desired for a named tuple.
  - *Type:* Class (used as a base class).
  - *Responsibility:* Provides a structured way to define typed, immutable records with optional methods.
  - *Depends on:* Class body with type-annotated fields.
  - *Connects to:* Subclassed by the developer; instantiated to create record objects.
  - *Shape:* A typing module boundary for typed immutable data.
- **`dataclasses.dataclass`**
  - *What it is:* A decorator that automatically adds generated special methods to classes.
  - *Implementation:* `def dataclass(cls=None, /, *, init=True, repr=True, eq=True, order=False, unsafe_hash=False, frozen=False, match_args=True, kw_only=False, slots=False, weakref_slot=False): ...`
  - *Its use:* Used to eliminate boilerplate for classes that primarily store state.
  - *Type:* Decorator function.
  - *Responsibility:* Inspects a class for type annotations and injects `__init__`, `__repr__`, `__eq__`, etc.
  - *Depends on:* A class definition with typed attributes.
  - *Connects to:* Wraps a developer-defined class.
  - *Shape:* A metaprogramming boundary altering class definition.
- **`dataclasses.field`**
  - *What it is:* A function to customize the behavior of a specific dataclass field.
  - *Implementation:* `def field(*, default=MISSING, default_factory=MISSING, init=True, repr=True, hash=None, compare=True, metadata=None, kw_only=MISSING): ...`
  - *Its use:* Used to provide default factories (like empty lists) or exclude fields from `__repr__` or `__init__`.
  - *Type:* Free function.
  - *Responsibility:* Returns an object that configures how the `@dataclass` decorator processes the field.
  - *Depends on:* Configuration arguments like `default_factory`.
  - *Connects to:* Assigned to class attributes within a dataclass.
  - *Shape:* A configuration boundary for individual fields.
- **`__post_init__`**
  - *What it is:* A special method called by the generated `__init__` in a dataclass.
  - *Implementation:* `def __post_init__(self): ...`
  - *Its use:* Used for validation or initialization that depends on multiple fields.
  - *Type:* Instance method.
  - *Responsibility:* Executes custom logic immediately after the auto-generated `__init__` completes.
  - *Depends on:* The instance being fully initialized by the generated `__init__`.
  - *Connects to:* Called automatically by the generated `__init__`.
  - *Shape:* A lifecycle hook boundary in dataclasses.

## Concept Unit: `collections.namedtuple`

### The Problem
When grouping simple data (like coordinates or a playing card), an ordinary tuple like `(3, 4)` is memory-efficient but forces you to remember what each index means. A dictionary `{"x": 3, "y": 4}` provides names but consumes more memory and doesn't guarantee immutability. How can we have the memory efficiency and immutability of a tuple, but access fields by name instead of index?
- What would happen if you tried to add a property to a built-in tuple?
- How could a function generate a new class definition dynamically?
- What is the difference between a dictionary and an object with named attributes?

### The Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating the built-in `collections` module.
- **Files affected**: `src/records.py` (created)
- **Change type**: add
- **Location**: Top of file
- **Dependencies**: The standard library `collections` module.

### The New Code
```python
from collections import namedtuple

Card = namedtuple('Card', ['rank', 'suit'])
```

### The Updated Project
```python
// 1: from collections import namedtuple
// 2: 
// 3: Card = namedtuple('Card', ['rank', 'suit']) // ← new
```
We now have a `Card` class that we can use to instantiate card objects.

### Mechanical Walkthrough
- **`from collections import namedtuple`**: Imports the `namedtuple` factory function from the standard library. A factory function creates and returns new classes or objects.
- **`Card`**: A variable being assigned the newly created class object.
- **`=`**: The assignment operator, binding the class to the name `Card`.
- **`namedtuple(`**: Calls the factory function.
- **`'Card'`**: A string literal providing the name for the new class.
- **`['rank', 'suit']`**: A list of strings defining the field names for this record.
- **`)`**: Closes the function call.

### Isolate and Discard
Let's isolate `namedtuple` to see how it works and what it proves.

```python
from collections import namedtuple

Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 4)
print(p)
print(p.x)
print(p[0])
print(p._asdict())

ace = namedtuple('Card', 'rank suit')('A', 'spades')
print(ace)
print(isinstance(p, tuple))

try:
    ace.rank = 'K'
except AttributeError as e:
    print(f"Error: {e}")
```
Output:
```text
Point(x=3, y=4)
3
3
{'x': 3, 'y': 4}
Card(rank='A', suit='spades')
True
Error: can't set attribute
```
**This is called a named tuple.** The output proves that namedtuples are immutable, hashable, memory-efficient (because `isinstance(p, tuple)` is `True`), and self-documenting. They provide `__repr__` automatically. We will discard this throwaway code; it will not appear in our project.

## Concept Unit: `typing.NamedTuple`

### The Problem
`collections.namedtuple` is great, but the fields have no type annotations. In modern Python, we rely on type hints for static analysis and IDE support. Furthermore, `collections.namedtuple` doesn't allow you to easily define default values or custom methods. How can we define a named tuple that includes type hints and allows method definitions?
- If you wanted to add a method to a `collections.namedtuple`, how would you do it?
- Why might type hinting a tuple be difficult?

### The Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating the `typing` module.
- **Files affected**: `src/records.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: The standard library `typing` module.

### The New Code
```python
from typing import NamedTuple

class Employee(NamedTuple):
    name: str
    department: str
    salary: float = 50000.0
```

### The Updated Project
```python
// 1: from collections import namedtuple
// 2: from typing import NamedTuple // ← new
// 3: 
// 4: Card = namedtuple('Card', ['rank', 'suit'])
// 5: 
// 6: class Employee(NamedTuple): // ← new
// 7:     name: str               // ← new
// 8:     department: str         // ← new
// 9:     salary: float = 50000.0 // ← new
```
We now have an `Employee` class that extends `NamedTuple`, providing typed fields and a default salary.

### Mechanical Walkthrough
- **`class Employee(NamedTuple):`**: Defines a new class `Employee` that inherits from `NamedTuple`. This syntax triggers a metaclass that generates the underlying tuple structure.
- **`name: str`**: A type annotation indicating the `name` field should be a string.
- **`department: str`**: A type annotation indicating the `department` field should be a string.
- **`salary: float = 50000.0`**: A type annotation indicating the `salary` field should be a float, and an assignment providing a default value of `50000.0` if not specified during instantiation.

### Isolate and Discard
Let's isolate `typing.NamedTuple` to see how it works and what it proves.

```python
from typing import NamedTuple

class Employee(NamedTuple):
    name: str
    department: str
    salary: float = 50000.0

e1 = Employee('Alice', 'Engineering', 95000)
e2 = Employee('Bob', 'Marketing')
print(e1)
print(e2.salary)
print(e1 > e2)
print(Employee._fields)
```
Output:
```text
Employee(name='Alice', department='Engineering', salary=95000.0)
50000.0
False
('name', 'department', 'salary')
```
**This is called a typed named tuple.** The output proves that `typing.NamedTuple` allows type annotations and default values, automatically handles default instantiation, and provides tuple-like comparison (left-to-right). We will discard this throwaway code; it will not appear in our project.

## Concept Unit: `@dataclass` — the basics

### The Problem
Named tuples are tuples, meaning they are immutable. Sometimes you want a record that is mutable (e.g., an entity in a database whose state changes). If you write a standard class, you have to manually implement `__init__`, `__repr__`, and `__eq__`, resulting in a lot of boilerplate. How can we have the convenience of auto-generated methods for a standard, mutable class?
- What repetitive code do you usually write inside `__init__`?
- How does Python normally compare two custom objects if you don't implement `__eq__`?

### The Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating the `dataclasses` module.
- **Files affected**: `src/records.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: The standard library `dataclasses` module.

### The New Code
```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float
```

### The Updated Project
```python
// 10: 
// 11: from dataclasses import dataclass // ← new
// 12: 
// 13: @dataclass // ← new
// 14: class Point: // ← new
// 15:     x: float // ← new
// 16:     y: float // ← new
```
We now have a `Point` class decorated with `@dataclass`, which automatically writes the boilerplate methods for us.

### Mechanical Walkthrough
- **`@dataclass`**: A decorator function applied to the `Point` class. It inspects the class annotations and automatically injects methods like `__init__`, `__repr__`, and `__eq__`.
- **`class Point:`**: Defines a new standard Python class.
- **`x: float`**: An annotated class attribute defining a field `x` of type float. The decorator uses this to build the `__init__` arguments.
- **`y: float`**: An annotated class attribute defining a field `y` of type float.

### Isolate and Discard
Let's isolate `@dataclass` to see how it works and what it proves.

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p1 = Point(1.0, 2.0)
p2 = Point(1.0, 2.0)
p3 = Point(3.0, 4.0)

print(p1)
print(p1 == p2)
print(p1 == p3)
print(p1.x)
p1.x = 5.0
print(p1)
```
Output:
```text
Point(x=1.0, y=2.0)
True
False
1.0
Point(x=5.0, y=2.0)
```
**This is called a dataclass.** The output proves that `@dataclass` automatically generates `__repr__` (printing nicely) and `__eq__` (comparing by value, not memory address), and that fields are mutable by default. We will discard this throwaway code; it will not appear in our project.

## Concept Unit: `@dataclass` — defaults, `field()`, and `post_init`

### The Problem
What if a dataclass field needs a default value that is mutable, like an empty list? In a standard class, using `[]` as a default argument creates the shared-mutable-default trap, where all instances share the same list. Also, what if we need to validate data right after initialization, but we didn't write the `__init__` method ourselves?
- Why is `def __init__(self, history=[]):` dangerous in Python?
- If the decorator generates `__init__`, how can you inject your own setup logic?

### The Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating dataclass field configuration.
- **Files affected**: `src/records.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: `dataclasses.field`, `typing.List`

### The New Code
```python
from dataclasses import field
from typing import List

@dataclass
class BankAccount:
    owner: str
    balance: float = 0.0
    history: List[str] = field(default_factory=list)

    def __post_init__(self):
        if self.balance < 0:
            raise ValueError('Initial balance cannot be negative')
```

### The Updated Project
```python
// 17: 
// 18: from dataclasses import field // ← new
// 19: from typing import List // ← new
// 20: 
// 21: @dataclass // ← new
// 22: class BankAccount: // ← new
// 23:     owner: str // ← new
// 24:     balance: float = 0.0 // ← new
// 25:     history: List[str] = field(default_factory=list) // ← new
// 26:  // ← new
// 27:     def __post_init__(self): // ← new
// 28:         if self.balance < 0: // ← new
// 29:             raise ValueError('Initial balance cannot be negative') // ← new
```
We now have a `BankAccount` dataclass with a safe mutable default field and validation logic.

### Mechanical Walkthrough
- **`history: List[str]`**: A type hint for a list of strings.
- **`=`**: Assignment operator.
- **`field(`**: Calls the `dataclasses.field` function to configure this specific field.
- **`default_factory=list`**: A keyword argument telling the dataclass to call `list()` to generate a new, distinct list for every new instance, avoiding the shared-mutable-default trap.
- **`)`**: Closes the `field` call.
- **`def __post_init__(self):`**: Defines the special method `__post_init__`, which the generated `__init__` will automatically call at the very end of its execution.
- **`if self.balance < 0:`**: A standard conditional check.
- **`raise ValueError(...)`**: Throws an exception if the condition is met.

### Isolate and Discard
Let's isolate `field()` and `__post_init__` to see how they work and what they prove.

```python
from dataclasses import dataclass, field
from typing import List

@dataclass
class BankAccount:
    owner: str
    balance: float = 0.0
    history: List[str] = field(default_factory=list)

    def __post_init__(self):
        if self.balance < 0:
            raise ValueError('Initial balance cannot be negative')

    def deposit(self, amount):
        self.balance += amount
        self.history.append(f'deposit: {amount}')

a = BankAccount('Alice', 100.0)
a.deposit(50)
print(a.balance)
print(a.history)
print(a)

b = BankAccount('Bob')
print(b.balance)
print(b.history)
```
Output:
```text
150.0
['deposit: 50']
BankAccount(owner='Alice', balance=150.0, history=['deposit: 50'])
0.0
[]
```
**This is called dataclass field configuration.** The output proves that `default_factory=list` creates a new, distinct list for each instance (because `b.history` is empty despite `a.history` having an item). It also shows `__post_init__` runs correctly for validation. We will discard this throwaway code; it will not appear in our project.

## Concept Unit: `frozen=True` — immutable dataclasses

### The Problem
Sometimes you want a full class with methods and defaults, but you want to enforce immutability so that instances can be used as keys in a dictionary or placed in a set. A standard dataclass is mutable and therefore unhashable by default. How can we make a dataclass immutable?
- What error do you get if you try to put a mutable object into a `set`?
- How does Python know if an object should be allowed to change?

### The Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating frozen dataclasses.
- **Files affected**: `src/records.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: None.

### The New Code
```python
@dataclass(frozen=True)
class FrozenPoint:
    x: float
    y: float
```

### The Updated Project
```python
// 30: 
// 31: @dataclass(frozen=True) // ← new
// 32: class FrozenPoint: // ← new
// 33:     x: float // ← new
// 34:     y: float // ← new
```
We now have a `FrozenPoint` dataclass that is immutable and hashable.

### Mechanical Walkthrough
- **`@dataclass(`**: Invokes the dataclass decorator with arguments.
- **`frozen=True`**: A keyword argument instructing the decorator to generate a `__setattr__` method that raises an error on modification, effectively making the instance immutable, and to generate a `__hash__` method.
- **`)`**: Closes the decorator call.
- **`class FrozenPoint:`**: Defines the class.
- **`x: float`**: Defines the `x` field.
- **`y: float`**: Defines the `y` field.

### Isolate and Discard
Let's isolate `frozen=True` to see how it works and what it proves.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class FrozenPoint:
    x: float
    y: float

    def distance_from_origin(self):
        return (self.x**2 + self.y**2) ** 0.5

p = FrozenPoint(3.0, 4.0)
print(p.distance_from_origin())
print(hash(p) is not None)
points = {FrozenPoint(0, 0), FrozenPoint(1, 1), FrozenPoint(0, 0)}
print(len(points))

try:
    p.x = 10.0
except Exception as e:
    print(f"Error: {type(e).__name__}")
```
Output:
```text
5.0
True
2
Error: FrozenInstanceError
```
**This is called a frozen dataclass.** The output proves that `frozen=True` generates a valid hash (allowing it to be placed in a set where duplicates are removed) and prevents mutation by raising a `FrozenInstanceError`. We will discard this throwaway code; it will not appear in our project.

## Concept Unit: `order=True` — automatic comparison

### The Problem
If you have a list of dataclass instances, calling `sorted()` on the list will crash because Python doesn't know how to compare two instances (using `<`, `>`, etc.). Writing `__lt__`, `__le__`, `__gt__`, and `__ge__` manually is tedious. How can we make a dataclass sortable automatically?
- How does Python compare two tuples `(3, "B")` and `(3, "A")`?
- What boilerplate methods are required to support `>` and `<`?

### The Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating ordered dataclasses.
- **Files affected**: `src/records.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: None.

### The New Code
```python
@dataclass(order=True)
class Student:
    gpa: float
    name: str
```

### The Updated Project
```python
// 35: 
// 36: @dataclass(order=True) // ← new
// 37: class Student: // ← new
// 38:     gpa: float // ← new
// 39:     name: str // ← new
```
We now have a `Student` dataclass that supports ordering based on its fields.

### Mechanical Walkthrough
- **`@dataclass(`**: Invokes the dataclass decorator.
- **`order=True`**: A keyword argument instructing the decorator to generate `__lt__`, `__le__`, `__gt__`, and `__ge__` methods.
- **`)`**: Closes the decorator call.
- **`class Student:`**: Defines the class.
- **`gpa: float`**: Defines the `gpa` field. This is the first field, so it acts as the primary sort key.
- **`name: str`**: Defines the `name` field. This acts as the secondary sort key if the `gpa` fields are equal.

### Isolate and Discard
Let's isolate `order=True` to see how it works and what it proves.

```python
from dataclasses import dataclass

@dataclass(order=True)
class Student:
    gpa: float
    name: str

students = [
    Student(3.5, 'Bob'),
    Student(3.9, 'Alice'),
    Student(3.5, 'Aaron'),
    Student(2.8, 'Carol'),
]
print(sorted(students))
```
Output:
```text
[Student(gpa=2.8, name='Carol'), Student(gpa=3.5, name='Aaron'), Student(gpa=3.5, name='Bob'), Student(gpa=3.9, name='Alice')]
```
**This is called an ordered dataclass.** The output proves that `order=True` enables automatic sorting by comparing fields left to right (like tuples). Here, GPA is compared first, then name alphabetically (Aaron comes before Bob). We will discard this throwaway code; it will not appear in our project.

## Concept Unit: Choosing the right tool

### The Problem
We now have several ways to define a record in Python: plain tuples, named tuples, typed named tuples, dataclasses, frozen dataclasses, and standard classes. How do you decide which one to use?
- If you just need to group an `x` and `y` quickly inside a function, what is the lightest option?
- If you need a record with private state and complex invariants, should you use a dataclass?

### The Project Change
- **Reference Source**: No reference counterpart — this is a conceptual synthesis.
- **Files affected**: None.
- **Change type**: conceptual review.
- **Location**: N/A.
- **Dependencies**: N/A.

### The Summary
- **Plain tuple**: anonymous, by-position, immutable. Use for temporary groupings.
- **namedtuple / NamedTuple**: named fields, immutable, hashable, lightweight. Use for pure data records.
- **@dataclass**: named fields, type hints, defaults, optional mutability. Use for richer records with methods.
- **@dataclass(frozen=True)**: like namedtuple but with methods and defaults. Use for immutable records with behavior.
- **Full class with @property**: complex invariants, private state, heavy behavior. Use for domain objects.

Dataclasses eliminate boilerplate and make Python data structures expressive and self-documenting. Lesson 28 is the OOP capstone.

### Exercises
1. Implement a `Color` frozen dataclass with `r`, `g`, `b` fields (0–255), a `to_hex()` method, and `__add__` for color mixing.
2. Implement a `Config` dataclass loaded from a JSON file.
