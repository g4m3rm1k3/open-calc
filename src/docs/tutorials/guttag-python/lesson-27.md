# Lesson 27: Dataclasses and Named Tuples — Lightweight Records

What you will build: The reader understands @dataclass (auto-generates `__init__`, `__repr__`, `__eq__`, with optional ordering and freezing) and collections.namedtuple / typing.NamedTuple (immutable, tuple-compatible records with named fields). The transferable insight: most custom classes that just hold data should be dataclasses. Writing `__init__`, `__repr__`, and `__eq__` by hand is repetitive boilerplate. @dataclass generates them for you from field annotations.

What you need to know first: Lessons 00-26.

## Terms used in this lesson
- **@dataclass** — A decorator that automatically generates boilerplate methods for data-holding classes, eliminating the need to write repetitive `__init__`, `__repr__`, and `__eq__` implementations.
- **Boilerplate** — Repetitive code that must be written in many places with little to no variation, which distracts from the core logic.
- **Decorator** — A special syntax starting with `@` that modifies or wraps a class or function to change its behavior dynamically.
- **Frozen** — A state where an object cannot be modified after it is created; making it immutable.
- **Immutable** — An object whose state cannot be changed after creation, making it safe to share across code or use as a dictionary key.
- **Tuple compatibility** — The ability for an object to behave like a standard Python tuple, such as allowing index access (`p[0]`) and unpacking (`x, y = p`).

## Objects and methods used
- **`dataclass`**
  - *What it is*: A class decorator.
  - *Implementation*: `@dataclass(init=True, repr=True, eq=True, order=False, unsafe_hash=False, frozen=False)`
  - *Its use*: We use it to turn a plain class into a lightweight record without writing standard initialization methods.
  - *Type*: Decorator function.
  - *Responsibility*: Generates dunder methods (`__init__`, `__repr__`, `__eq__`, etc.) dynamically based on the class's type hints.
  - *Depends on*: The target class having type annotations for its fields.
  - *Connects to*: Modifies the target class definition at creation time.
  - *Shape*: Public API of the `dataclasses` standard library module.
- **`field`**
  - *What it is*: A function used to customize the behavior of individual fields in a dataclass.
  - *Implementation*: `field(*, default=MISSING, default_factory=MISSING, init=True, repr=True, hash=None, compare=True, metadata=None, kw_only=MISSING)`
  - *Its use*: We use it to supply a default factory for mutable defaults (like `tuple` or `list`) and to exclude a field from comparisons.
  - *Type*: Function returning a `Field` instance.
  - *Responsibility*: Provides per-field configuration that the `@dataclass` decorator reads when generating methods.
  - *Depends on*: Being assigned to a class attribute inside a dataclass.
  - *Connects to*: Used by the `@dataclass` decorator during class creation.
  - *Shape*: Public API of the `dataclasses` standard library module.
- **`collections.namedtuple`**
  - *What it is*: A factory function for creating tuple subclasses with named fields.
  - *Implementation*: `namedtuple(typename, field_names, *, rename=False, defaults=None, module=None)`
  - *Its use*: We use it to create simple, immutable data types that have both attribute access and tuple behavior.
  - *Type*: Factory function.
  - *Responsibility*: Generates and returns a new tuple subclass.
  - *Depends on*: A string name and an iterable (or space-separated string) of field names.
  - *Connects to*: Returns a new class type inheriting from `tuple`.
  - *Shape*: Public API of the `collections` standard library module.
- **`typing.NamedTuple`**
  - *What it is*: A typed version of `collections.namedtuple`.
  - *Implementation*: `class NamedTuple(tuple)`
  - *Its use*: We use it as a base class to define a named tuple using class definition syntax and type annotations.
  - *Type*: Class (acts as a metaclass/base class for typed named tuples).
  - *Responsibility*: Generates a tuple subclass with named attributes based on type hints.
  - *Depends on*: Subclassing and providing typed class attributes.
  - *Connects to*: Creates an immutable tuple-like record class.
  - *Shape*: Public API of the `typing` standard library module.
- **`asdict`**
  - *What it is*: A helper function to convert a dataclass instance to a dictionary.
  - *Implementation*: `asdict(obj, *, dict_factory=dict)`
  - *Its use*: We use it to easily serialize our dataclass instances into JSON.
  - *Type*: Function.
  - *Responsibility*: Recursively converts a dataclass instance and its nested dataclass fields into dictionaries.
  - *Depends on*: A valid dataclass instance.
  - *Connects to*: Returns a standard Python dictionary.
  - *Shape*: Public API of the `dataclasses` standard library module.
- **`astuple`**
  - *What it is*: A helper function to convert a dataclass instance to a tuple.
  - *Implementation*: `astuple(obj, *, tuple_factory=tuple)`
  - *Its use*: We use it to extract just the values of a dataclass as a tuple.
  - *Type*: Function.
  - *Responsibility*: Recursively converts a dataclass instance and its nested dataclass fields into tuples.
  - *Depends on*: A valid dataclass instance.
  - *Connects to*: Returns a standard Python tuple.
  - *Shape*: Public API of the `dataclasses` standard library module.
- **`json.dumps`**
  - *What it is*: A function to serialize an object to a JSON formatted string.
  - *Implementation*: `json.dumps(obj, *, skipkeys=False, ensure_ascii=True, ...)`
  - *Its use*: We use it to serialize our generated dictionary from `asdict` into JSON for storage or transmission.
  - *Type*: Function.
  - *Responsibility*: Converts Python objects into a JSON string representation.
  - *Depends on*: A serializable Python object (like a dict from `asdict`).
  - *Connects to*: Returns a string containing the JSON data.
  - *Shape*: Public API of the `json` standard library module.

## Concept Unit: @dataclass — auto-generated boilerplate

### The Problem
If you need a class just to hold x and y coordinates, you have to write an `__init__` method to assign them, a `__repr__` method to print it nicely, and an `__eq__` method to compare two instances. Why should you have to write all this repetitive boilerplate code for something so simple? What if the language could generate it for you?

### Introduce the concept in isolation
```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p1 = Point(3.0, 4.0)
print(p1)
```
Predicted confidently: `Point(x=3.0, y=4.0)`. This proves that the **@dataclass** decorator automatically generates a custom `__repr__` method behind the scenes just from reading the type annotations.

### Discard the throwaway
This isolated throwaway code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `lesson_27_dataclasses.py` (created)
- **Change type**: add
- **Location**: brand-new file
- **Dependencies**: None

### The New Code
```python
from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float

p1 = Point(3.0, 4.0)
p2 = Point(3.0, 4.0)
p3 = Point(1.0, 2.0)

print(p1)
print(p1 == p2)
print(p1 == p3)
print(p1.x)
```

### The Updated Project
```python
# 1: from dataclasses import dataclass, field # <- new
# 2: 
# 3: @dataclass # <- new
# 4: class Point: # <- new
# 5:     x: float # <- new
# 6:     y: float # <- new
# 7: 
# 8: p1 = Point(3.0, 4.0) # <- new
# 9: p2 = Point(3.0, 4.0) # <- new
# 10: p3 = Point(1.0, 2.0) # <- new
# 11: 
# 12: print(p1) # <- new
# 13: print(p1 == p2) # <- new
# 14: print(p1 == p3) # <- new
# 15: print(p1.x) # <- new
```
This is a brand new file defining our `@dataclass` point and demonstrating its automatically generated methods in action.

### Mechanical walkthrough
- `from dataclasses import dataclass, field`: Imports the decorator and field configurator from the standard library.
- `@dataclass`: The decorator applied to the `Point` class. It tells Python to automatically add special methods like `__init__`, `__repr__`, and `__eq__` to the class based on the type annotations below.
- `class Point:`: Defines the class `Point`.
- `x: float` and `y: float`: Type annotations defining the fields of the dataclass. `@dataclass` reads these to know what attributes the class should have.
- `Point(3.0, 4.0)`: Calls the automatically generated `__init__(self, x: float, y: float)` method, setting `self.x=3.0` and `self.y=4.0`.
- `print(p1)`: Calls the automatically generated `__repr__`, formatting the output as `Point(x=3.0, y=4.0)`.
- `p1 == p2`: Calls the automatically generated `__eq__`, comparing the `x` and `y` fields. Since `3.0 == 3.0` and `4.0 == 4.0`, it returns `True`.
- `p1 == p3`: Compares the fields, which are different, returning `False`.
- `p1.x`: Accesses the attribute `x` directly, returning `3.0`.

### CS lens
This is **Metaprogramming** / **Code Generation**. The program writes code for you dynamically at load time. Real-world examples include Object-Relational Mappers (ORMs) generating SQL queries, compilers generating boilerplate C code from schemas, and dependency injection frameworks auto-generating factory classes.

### SE lens
**Don't Repeat Yourself (DRY)**. The alternative not chosen is writing `__init__`, `__repr__`, and `__eq__` manually. The tradeoff is that there is a slight performance overhead when the class is first imported and decorated, and it obscures exactly what code is running (magic behavior). But it vastly reduces bug-prone boilerplate, making the intent clearer.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
Point(x=3.0, y=4.0)
True
False
3.0
```

### One sentence connecting to previous unit
Now that we have basic dataclasses, we can configure them further to be read-only or sortable.

## Concept Unit: Default values, frozen, and ordering

### The Problem
What if we want to sort objects in a list, or ensure that once created, an object's fields cannot be altered? How can we enforce these properties without writing complex custom equality and hash methods?

### Introduce the concept in isolation
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Score:
    value: int

s = Score(100)
# s.value = 50  # This would crash!
print(s.value)
```
Predicted confidently: `100`. This proves that the **frozen** parameter creates an immutable class where assigning to an attribute after instantiation is prevented.

### Discard the throwaway
This isolated throwaway code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `lesson_27_dataclasses.py` (modified)
- **Change type**: add
- **Location**: Append to the end of the file.
- **Dependencies**: None

### The New Code
```python
@dataclass(order=True, frozen=True)
class Student:
    name: str
    grade: float
    courses: tuple = field(default_factory=tuple, compare=False)

    def gpa_letter(self):
        if self.grade >= 90: return 'A'
        if self.grade >= 80: return 'B'
        return 'C'

s1 = Student('Alice', 92.5)
s2 = Student('Bob', 87.0)
s3 = Student('Charlie', 92.5)

print(s1 < s2)
print(s1 == s3)
print(sorted([s2, s3, s1]))
```

### The Updated Project
```python
# ...unchanged from here up
# 16: 
# 17: @dataclass(order=True, frozen=True) # <- new
# 18: class Student: # <- new
# 19:     name: str # <- new
# 20:     grade: float # <- new
# 21:     courses: tuple = field(default_factory=tuple, compare=False) # <- new
# 22: 
# 23:     def gpa_letter(self): # <- new
# 24:         if self.grade >= 90: return 'A' # <- new
# 25:         if self.grade >= 80: return 'B' # <- new
# 26:         return 'C' # <- new
# 27: 
# 28: s1 = Student('Alice', 92.5) # <- new
# 29: s2 = Student('Bob', 87.0) # <- new
# 30: s3 = Student('Charlie', 92.5) # <- new
# 31: 
# 32: print(s1 < s2) # <- new
# 33: print(s1 == s3) # <- new
# 34: print(sorted([s2, s3, s1])) # <- new
```
We added a `Student` dataclass that is immutable, sortable, uses the `field` function for defaults, and contains a custom method.

### Mechanical walkthrough
- `@dataclass(order=True, frozen=True)`: Instructs the decorator to generate ordering methods (`__lt__`, `__le__`, etc.) and to make the instance immutable (raising an `AttributeError` on mutation).
- `class Student:`: Declares the class.
- `name: str` and `grade: float`: Fields that will be part of initialization, comparison, and ordering.
- `courses: tuple = field(default_factory=tuple, compare=False)`: Uses the `field` function. `default_factory=tuple` means if no courses are provided, a new empty tuple is created. `compare=False` tells the dataclass to ignore this field when checking equality or ordering.
- `def gpa_letter(self):`: Dataclasses can still have normal methods defined.
- `s1 = Student('Alice', 92.5)`: Initializes the object. `courses` gets the default empty tuple.
- `s1 < s2`: Uses the generated `__lt__` method. It compares fields in declaration order: first `name`, then `grade`. Since `'Alice' < 'Bob'`, it evaluates to `True`.
- `s1 == s3`: Compares the generated `__eq__`. The names differ, so it's `False`.
- `sorted([s2, s3, s1])`: Uses the generated ordering to sort the list of students by `name` then `grade`.

### CS lens
This is **Immutability**. An immutable object's state cannot be modified after it is created. Real-world examples include strings in most high-level languages, functional programming data structures, and database transaction logs.

### SE lens
**Configuration vs Boilerplate**. The alternative not chosen is implementing `__lt__`, `__le__`, `__gt__`, `__ge__`, `__eq__`, and `__hash__` manually just to allow sorting and immutability. The tradeoff is that the explicit ordering logic is hidden, meaning readers must know that `@dataclass` compares fields top-to-bottom sequentially.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
True
False
[Student(name='Alice', grade=92.5, courses=()), Student(name='Bob', grade=87.0, courses=()), Student(name='Charlie', grade=92.5, courses=())]
```

### One sentence connecting to previous unit
Dataclasses are powerful, but sometimes we need a lightweight record that specifically acts like a built-in tuple.

## Concept Unit: collections.namedtuple — immutable named tuple

### The Problem
If you need an object that can be accessed via dot notation (`p.x`) but MUST also be perfectly compatible with older code that unpacks a sequence (`x, y = p`), how do you bridge the gap? 

### Introduce the concept in isolation
```python
from collections import namedtuple

PointTuple = namedtuple('PointTuple', ['x', 'y'])
pt = PointTuple(1, 2)
print(pt[0])
```
Predicted confidently: `1`. This proves that **namedtuple** produces a real tuple subclass that allows index-based access, despite having named attributes.

### Discard the throwaway
This isolated throwaway code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `lesson_27_dataclasses.py` (modified)
- **Change type**: add
- **Location**: Append to the end of the file.
- **Dependencies**: None

### The New Code
```python
from collections import namedtuple

PointNamed = namedtuple('PointNamed', ['x', 'y'])
Color = namedtuple('Color', 'red green blue')

p = PointNamed(3, 4)
c = Color(255, 128, 0)

print(p)
print(p.x)
print(p[0])
print(p._asdict())

x, y = p
print(p == (3, 4))

p2 = p._replace(x=10)
print(p2)
print(p)
```

### The Updated Project
```python
# ...unchanged from here up
# 35: 
# 36: from collections import namedtuple # <- new
# 37: 
# 38: PointNamed = namedtuple('PointNamed', ['x', 'y']) # <- new
# 39: Color = namedtuple('Color', 'red green blue') # <- new
# 40: 
# 41: p = PointNamed(3, 4) # <- new
# 42: c = Color(255, 128, 0) # <- new
# 43: 
# 44: print(p) # <- new
# 45: print(p.x) # <- new
# 46: print(p[0]) # <- new
# 47: print(p._asdict()) # <- new
# 48: 
# 49: x, y = p # <- new
# 50: print(p == (3, 4)) # <- new
# 51: 
# 52: p2 = p._replace(x=10) # <- new
# 53: print(p2) # <- new
# 54: print(p) # <- new
```
We demonstrate `namedtuple` factory function, showing both attribute access and pure tuple behavior.

### Mechanical walkthrough
- `from collections import namedtuple`: Imports the factory function.
- `namedtuple('PointNamed', ['x', 'y'])`: Generates a new tuple subclass called `PointNamed` with fields `x` and `y`.
- `namedtuple('Color', 'red green blue')`: An alternative syntax passing a space-separated string of field names instead of a list.
- `PointNamed(3, 4)`: Instantiates the tuple.
- `p.x`: Attribute access, returning `3`.
- `p[0]`: Index access, demonstrating it is fundamentally a tuple, returning `3`.
- `p._asdict()`: A built-in method of namedtuples to convert the tuple into a dictionary. Returns `{'x': 3, 'y': 4}`.
- `x, y = p`: Demonstrates unpacking compatibility.
- `p == (3, 4)`: Evaluates to `True`, because `namedtuple` instances are literally tuple instances and compare equal to plain tuples with the same elements.
- `p._replace(x=10)`: Since it is immutable, `_replace` is used to return a *new* instance with the specified fields swapped out.
- `print(p)`: The original object remains unchanged.

### CS lens
This is **Structural Subtyping** (behavioral compatibility). The `namedtuple` perfectly mimics a tuple's structure, allowing it to seamlessly drop into older APIs expecting plain arrays or tuples. Real-world examples include Unix file descriptors, duck-typed iterables in dynamically typed languages, and standard POSIX interfaces.

### SE lens
**Backward Compatibility**. The alternative not chosen is rewriting every legacy function that expects a `(x, y)` tuple to instead take a custom class object. The tradeoff is that namedtuple exposes confusing internal methods prefixed with underscores (like `_asdict` or `_replace`) to avoid naming collisions with user fields, which looks messy.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
PointNamed(x=3, y=4)
3
3
{'x': 3, 'y': 4}
True
PointNamed(x=10, y=4)
PointNamed(x=3, y=4)
```

### One sentence connecting to previous unit
`collections.namedtuple` is great, but it lacks the modern Python type hints that our `@dataclass` examples utilized.

## Concept Unit: typing.NamedTuple — typed named tuple

### The Problem
If we want the perfect backwards compatibility of a namedtuple, but we *also* want the strict type hints and default values that we got from our dataclass, how do we combine them?

### Introduce the concept in isolation
```python
from typing import NamedTuple

class Simple(NamedTuple):
    val: int

s = Simple(5)
print(s.val)
```
Predicted confidently: `5`. This proves that **NamedTuple** allows creating named tuples using modern class-based syntax and type hints.

### Discard the throwaway
This isolated throwaway code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `lesson_27_dataclasses.py` (modified)
- **Change type**: add
- **Location**: Append to the end of the file.
- **Dependencies**: None

### The New Code
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
print(e1._fields)
print(list(e1))

employees = [e1, e2]
print(sorted(employees, key=lambda e: e.salary, reverse=True))
```

### The Updated Project
```python
# ...unchanged from here up
# 55: 
# 56: from typing import NamedTuple # <- new
# 57: 
# 58: class Employee(NamedTuple): # <- new
# 59:     name: str # <- new
# 60:     department: str # <- new
# 61:     salary: float = 50000.0 # <- new
# 62: 
# 63: e1 = Employee('Alice', 'Engineering', 95000) # <- new
# 64: e2 = Employee('Bob', 'Marketing') # <- new
# 65: 
# 66: print(e1) # <- new
# 67: print(e2.salary) # <- new
# 68: print(e1._fields) # <- new
# 69: print(list(e1)) # <- new
# 70: 
# 71: employees = [e1, e2] # <- new
# 72: print(sorted(employees, key=lambda e: e.salary, reverse=True)) # <- new
```
We define an `Employee` as a typed named tuple, using type hints and defaults, while preserving tuple behavior.

### Mechanical walkthrough
- `from typing import NamedTuple`: Imports the base class for typed named tuples.
- `class Employee(NamedTuple):`: Defines the new tuple by subclassing `NamedTuple`. This is syntax sugar that triggers a metaclass generation under the hood.
- `name: str` and `department: str`: Typed fields.
- `salary: float = 50000.0`: A typed field with a default value.
- `Employee('Alice', 'Engineering', 95000)`: Uses `__new__` (since tuples are immutable) to instantiate the tuple.
- `Employee('Bob', 'Marketing')`: Uses the default `salary`.
- `e1._fields`: A generated property containing the tuple of field names: `('name', 'department', 'salary')`.
- `list(e1)`: Since it's a tuple, it's iterable, so it easily converts to a list: `['Alice', 'Engineering', 95000]`.
- `sorted(..., key=lambda e: e.salary, reverse=True)`: Sorts the iterable using a custom lambda function targeting the `salary` attribute.

### CS lens
This is **Static Typing Integration**. Python is fundamentally dynamic, but this construct allows static analysis tools (like `mypy`) to verify data correctness before the program ever runs. Real-world examples include TypeScript layering types over JavaScript, Rust's strict compiler checks, and GraphQL schema validation.

### SE lens
**Developer Experience (DX)**. The alternative not chosen is sticking with `collections.namedtuple`. The tradeoff is that the class-based syntax of `NamedTuple` is slightly more verbose, but it drastically improves IDE autocompletion and type checker visibility, saving debug time later.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
Employee(name='Alice', department='Engineering', salary=95000)
50000.0
('name', 'department', 'salary')
['Alice', 'Engineering', 95000]
[Employee(name='Alice', department='Engineering', salary=95000), Employee(name='Bob', department='Marketing', salary=50000.0)]
```

### One sentence connecting to previous unit
Now that we have several ways to build lightweight records, we need a guide to choose between them and serialize them.

## Concept Unit: Choosing between dataclass, NamedTuple, and plain class

### The Problem
When building a new system, how do you decide which of these data holder constructs is the right tool for the job, and how do you export that data to other systems?

### Introduce the concept in isolation
```python
from dataclasses import dataclass, asdict

@dataclass
class SimpleConfig:
    port: int = 80

c = SimpleConfig()
print(asdict(c))
```
Predicted confidently: `{'port': 80}`. This proves that the **asdict** function can dynamically inspect a dataclass and convert it to a standard dictionary.

### Discard the throwaway
This isolated throwaway code is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `lesson_27_dataclasses.py` (modified)
- **Change type**: add
- **Location**: Append to the end of the file.
- **Dependencies**: None

### The New Code
```python
from dataclasses import asdict, astuple
import json

@dataclass
class Config:
    host: str = 'localhost'
    port: int = 8080
    debug: bool = False

c = Config(port=9090)
print(asdict(c))
print(astuple(c))

print(json.dumps(asdict(c)))
```

### The Updated Project
```python
# ...unchanged from here up
# 73: 
# 74: from dataclasses import asdict, astuple # <- new
# 75: import json # <- new
# 76: 
# 77: @dataclass # <- new
# 78: class Config: # <- new
# 79:     host: str = 'localhost' # <- new
# 80:     port: int = 8080 # <- new
# 81:     debug: bool = False # <- new
# 82: 
# 83: c = Config(port=9090) # <- new
# 84: print(asdict(c)) # <- new
# 85: print(astuple(c)) # <- new
# 86: 
# 87: print(json.dumps(asdict(c))) # <- new
```
We define a mutable `Config` dataclass and demonstrate standard serialization helpers.

### Mechanical walkthrough
- `from dataclasses import asdict, astuple`: Imports the helper functions that serialize dataclasses.
- `import json`: Imports the standard library JSON module.
- `@dataclass`: We choose a regular dataclass because configs might need to mutate later, and we don't need tuple compatibility.
- `class Config:`: Defines the config block with default values.
- `Config(port=9090)`: Instantiates the object, overriding just one default.
- `asdict(c)`: Recursively converts the instance to a dictionary. Returns `{'host': 'localhost', 'port': 9090, 'debug': False}`.
- `astuple(c)`: Converts the instance to a tuple: `('localhost', 9090, False)`.
- `json.dumps(asdict(c))`: `asdict(c)` generates a raw dict, which is passed to `json.dumps`, which converts it to a serialized string for network transit: `'{"host": "localhost", "port": 9090, "debug": false}'`.

### CS lens
This is **Serialization**. Converting an in-memory object into a flat string or binary format that can be stored or transmitted across a network. Real-world examples include writing to JSON, Google's Protocol Buffers, and XML payloads.

### SE lens
**The Right Tool for the Job**. The alternative not chosen is using a plain dictionary for config. The tradeoff is that dicts lack type hints and dot-attribute access (`c.port` vs `c['port']`). 
- Choose `NamedTuple` when you strictly need an immutable record and backwards compatibility with tuples.
- Choose `@dataclass` as the default for readable, mutable, feature-rich data objects. 
- Choose `@dataclass(frozen=True)` when you want immutability but richer features than a tuple.
- Choose plain classes only when complex logic heavily outweighs pure data storage.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```
{'host': 'localhost', 'port': 9090, 'debug': False}
('localhost', 9090, False)
{"host": "localhost", "port": 9090, "debug": false}
```

### One sentence connecting to previous unit
Understanding how to choose and serialize data classes prepares us to build more robust data-processing applications in the future.

## Closing

### Connect the pieces
Throughout this lesson, we transitioned from writing repetitive boilerplate to cleanly defining data structures. If we trace a `Student` dataclass through its lifecycle:
1. `Student('Alice', 92.5)` is created instantly without us writing `__init__`, thanks to the `@dataclass` decorator dynamically building it based on the `name` and `grade` type hints.
2. Because it was defined with `order=True`, `s1 < s2` seamlessly delegates to a generated `__lt__` method that automatically checks fields sequentially.
3. Sorting a list `sorted(students)` naturally uses that same ordering capability without any custom lambda functions.
4. If we had needed that `Student` object to be sent as a JSON payload to a web API, `asdict(student)` would immediately convert it, ready for `json.dumps`.

By abstracting away the boilerplate, Python allows us to focus purely on the structure and types of the data we're handling.
