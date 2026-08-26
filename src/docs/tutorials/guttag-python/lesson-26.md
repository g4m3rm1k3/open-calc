# Lesson 26: Polymorphism and Duck Typing

In this lesson, you will build a polymorphic report generator and a shape hierarchy. You will learn about polymorphism — how the same operation can work differently on different types — which is achieved through method dispatch rather than type checking. You will learn about duck typing, which means if an object has the methods you need, you can use it without verifying its type. You will also learn about Python protocols (informal interfaces like the sequence protocol) and how they differ from strict inheritance.

**What you need to know first:**
- Lesson 25 covers special methods and classes.
- Nothing else is needed.

**Terms used in this lesson:**
- **Polymorphism** — The ability for different classes to provide different implementations for the same method name. It allows a single function to operate on objects of multiple types without needing to know exactly what type they are.
- **Duck typing** — A programming concept where the type or the class of an object is less important than the methods it defines. "If it walks like a duck and quacks like a duck, it is a duck." It solves the problem of rigid type restrictions by focusing on behavior instead of inheritance.
- **Method dispatch** — The mechanism by which the runtime determines which implementation of a method or function to call, based on the type of the object. It prevents you from needing long `if/elif` chains checking object types.
- **Protocol** — In Python, an informal interface defined only by documentation and convention. If a class implements certain special methods, it fulfills a protocol, solving the need for rigid abstract base classes.
- **Single dispatch** — A form of polymorphism where the implementation chosen depends on the type of a single argument (typically the first one).
- **Mixin** — A class that provides methods to other classes but is not considered a base class itself. It solves the problem of code duplication without creating deep, restrictive inheritance trees.
- **Strategy pattern** — A design pattern that enables selecting an algorithm at runtime. It solves the problem of hardcoding different behaviors by encapsulating them into interchangeable objects.

**Objects and methods used:**
- **`sum`**
  - *What it is:* A built-in Python function that adds up a sequence of items.
  - *Implementation:* `sum(iterable, start=0)`
  - *Its use:* Used here to calculate the total area of multiple shapes easily.
  - *Type:* Built-in function.
  - *Responsibility:* Iterates over an iterable and returns the sum of its items plus the start value.
  - *Depends on:* An iterable containing objects that support addition.
  - *Connects to:* Calls `__add__` on the items in the iterable.
  - *Shape:* A standard library utility.
- **`math.pi`**
  - *What it is:* A mathematical constant representing the ratio of a circle's circumference to its diameter.
  - *Implementation:* `math.pi` (a float, approximately 3.14159).
  - *Its use:* Used to calculate the area of a circle.
  - *Type:* Module-level float constant.
  - *Responsibility:* Provides a high-precision value for Pi.
  - *Depends on:* The `math` module being imported.
  - *Connects to:* Used in arithmetic expressions.
  - *Shape:* An internal constant in the math module.
- **`isinstance`**
  - *What it is:* A built-in function that checks if an object is an instance or subclass of a class.
  - *Implementation:* `isinstance(object, classinfo)`
  - *Its use:* Used to demonstrate the "wrong way" to handle different types by explicitly checking them.
  - *Type:* Built-in function.
  - *Responsibility:* Returns True if the object is of the specified type, False otherwise.
  - *Depends on:* An object and a class or tuple of classes.
  - *Connects to:* The `__class__` attribute of the object.
  - *Shape:* Built-in utility function.
- **`functools.singledispatch`**
  - *What it is:* A decorator that transforms a function into a generic function.
  - *Implementation:* `@singledispatch`
  - *Its use:* Used to define explicit polymorphism by type for a standalone function.
  - *Type:* Function decorator.
  - *Responsibility:* Routes function calls to different implementations based on the type of the first argument.
  - *Depends on:* A base function to decorate and subsequent `register` calls.
  - *Connects to:* The Python type system and function registry.
  - *Shape:* Standard library decorator.
- **`__len__`**
  - *What it is:* A special method that returns the length of an object.
  - *Implementation:* `def __len__(self): return int`
  - *Its use:* Used to implement the sequence protocol.
  - *Type:* Instance method.
  - *Responsibility:* Defines how the built-in `len()` function interacts with the object.
  - *Depends on:* The internal state of the object.
  - *Connects to:* Called by `len()` and sometimes boolean evaluation.
  - *Shape:* Data model protocol method.
- **`__getitem__`**
  - *What it is:* A special method that allows instance indexing.
  - *Implementation:* `def __getitem__(self, key): return value`
  - *Its use:* Used to retrieve an item by index, completing the sequence protocol.
  - *Type:* Instance method.
  - *Responsibility:* Defines behavior for `obj[key]` access.
  - *Depends on:* A valid key or index.
  - *Connects to:* Indexing operators, `for` loops, and `in` operators.
  - *Shape:* Data model protocol method.
- **`json.dumps`**
  - *What it is:* A function that serializes a Python object to a JSON formatted string.
  - *Implementation:* `json.dumps(obj)`
  - *Its use:* Used in a mixin to provide JSON export capabilities.
  - *Type:* Standard library function.
  - *Responsibility:* Converts Python dictionaries and lists into valid JSON strings.
  - *Depends on:* The `json` module and a serializable object.
  - *Connects to:* The object's properties.
  - *Shape:* Standard library utility.
- **`json.loads`**
  - *What it is:* A function that deserializes a JSON string to a Python object.
  - *Implementation:* `json.loads(s)`
  - *Its use:* Used in a mixin to recreate state from a JSON string.
  - *Type:* Standard library function.
  - *Responsibility:* Parses JSON strings and returns standard Python objects (like dicts).
  - *Depends on:* A valid JSON formatted string.
  - *Connects to:* Python memory allocation for new objects.
  - *Shape:* Standard library utility.
- **`__new__`**
  - *What it is:* A special method responsible for creating a new instance of a class.
  - *Implementation:* `def __new__(cls, *args, **kwargs): return super().__new__(cls)`
  - *Its use:* Used to bypass `__init__` when deserializing an object from JSON.
  - *Type:* Static class method.
  - *Responsibility:* Allocates memory and returns a fresh, uninitialized object instance.
  - *Depends on:* The class being instantiated.
  - *Connects to:* Object creation lifecycle.
  - *Shape:* Data model method.
- **`__dict__`**
  - *What it is:* A dictionary or mapping object used to store an object's writable attributes.
  - *Implementation:* `self.__dict__`
  - *Its use:* Used to quickly serialize and deserialize all attributes of an object.
  - *Type:* Object attribute (dictionary).
  - *Responsibility:* Holds the dynamic state of an instance.
  - *Depends on:* The object having a standard attribute dictionary.
  - *Connects to:* Attribute access operations (`getattr`, `setattr`).
  - *Shape:* Internal data storage.

---

## Concept Unit: Polymorphism — same name, different behavior

### The Problem
When you have different kinds of shapes, you might want to calculate the total area of a list of them. Without polymorphism, you would have to write a complex function that checks what kind of shape it is looking at, and then runs a specific mathematical formula. How can we make the shapes calculate their own area, so the outer code can simply ask them for it? What happens if you add a new shape later?

### Introduce the concept in isolation
We will define a generic list of objects and call a shared method name on them.
```python
class Dog:
    def speak(self): return "Woof!"

class Cat:
    def speak(self): return "Meow!"

animals = [Dog(), Cat()]
for animal in animals:
    print(animal.speak())
# Output:
# Woof!
# Meow!
```
This is called **polymorphism**. The output proves that the loop doesn't care whether `animal` is a `Dog` or a `Cat`. It simply calls `.speak()`, and Python dispatches the call to the correct implementation on the object.

### Discard the throwaway example
The `Dog` and `Cat` classes are deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are building a standalone shape calculator.
- **Files affected**: Create `shapes.py`.
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code
```python
import math

class Circle:
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return math.pi * self.radius ** 2

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    def area(self):
        return self.width * self.height

class Triangle:
    def __init__(self, base, height):
        self.base = base
        self.height = height
    def area(self):
        return 0.5 * self.base * self.height

def total_area(shapes):
    return sum(shape.area() for shape in shapes)

shapes_list = [Circle(5), Rectangle(4, 6), Triangle(3, 8)]
print(f'{total_area(shapes_list):.2f}')
# Output:
# 114.54
```

### The Updated Project
```python
1: import math
2: 
3: class Circle:
4:     def __init__(self, radius):
5:         self.radius = radius
6:     def area(self):
7:         return math.pi * self.radius ** 2
8: 
9: class Rectangle:
10:     def __init__(self, width, height):
11:         self.width = width
12:         self.height = height
13:     def area(self):
14:         return self.width * self.height
15: 
16: class Triangle:
17:     def __init__(self, base, height):
18:         self.base = base
19:         self.height = height
20:     def area(self):
21:         return 0.5 * self.base * self.height
22: 
23: def total_area(shapes):
24:     return sum(shape.area() for shape in shapes)
25: 
26: shapes_list = [Circle(5), Rectangle(4, 6), Triangle(3, 8)]
27: print(f'{total_area(shapes_list):.2f}')
```
This file now defines three shape classes and a function that calculates their total area without checking their types.

### Mechanical Walkthrough
- `import math` imports the standard math module to give us access to `math.pi`.
- `class Circle:` defines a class.
- `def __init__(self, radius):` is the constructor that takes a radius.
- `self.radius = radius` stores the radius.
- `def area(self):` defines the polymorphic method.
- `return math.pi * self.radius ** 2` calculates the circle's area.
- `class Rectangle:` defines the rectangle shape.
- `def __init__(self, width, height):` initializes the width and height.
- `self.width = width` stores the width.
- `self.height = height` stores the height.
- `def area(self):` provides the specific implementation for a rectangle.
- `return self.width * self.height` calculates the rectangle's area.
- `class Triangle:` defines the triangle shape.
- `def __init__(self, base, height):` initializes base and height.
- `self.base = base` stores base.
- `self.height = height` stores height.
- `def area(self):` provides the triangle's area formula.
- `return 0.5 * self.base * self.height` returns the triangle's area.
- `def total_area(shapes):` defines a function accepting a list of shapes.
- `sum(...)` uses the built-in function to add numbers.
- `shape.area()` calls the area method on whatever shape object it currently has. This is polymorphism: method dispatch routes the call based on the object's actual class.
- `for shape in shapes` iterates through the list.
- `shapes_list = [...]` creates a list containing one of each shape.
- `print(...)` displays the result formatted to two decimal places.

---

## Concept Unit: Duck typing — type checking vs protocol checking

### The Problem
If you don't use polymorphism, you might write code that explicitly checks if an object is a `Circle` or a `Rectangle` using `isinstance()`. What happens if someone passes an object that is neither, but still has an `area()` method? Python prefers you to look at an object's capabilities rather than its exact class.

### Introduce the concept in isolation
```python
def make_it_quack(thing):
    try:
        return thing.quack()
    except AttributeError:
        return "Doesn't quack"

class RealDuck:
    def quack(self): return "Quack!"

class ToyDuck:
    def quack(self): return "Squeak!"

print(make_it_quack(RealDuck()))
print(make_it_quack(ToyDuck()))
# Output:
# Quack!
# Squeak!
```
This is **duck typing**. The output proves that `make_it_quack` doesn't enforce that `thing` is a `RealDuck` — it only cares that it has a `quack()` method.

### Discard the throwaway example
The ducks and `make_it_quack` are deleted.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `shapes.py`.
- **Change type**: Add.
- **Location**: Bottom of the file.
- **Dependencies**: The existing classes in `shapes.py`.

### The New Code
```python
def bad_area(shape):
    if isinstance(shape, Circle):
        import math
        return math.pi * shape.radius**2
    elif isinstance(shape, Rectangle):
        return shape.width * shape.height
    else:
        raise TypeError('Unknown shape')

def good_area(shape):
    return shape.area()

class LandParcel:
    def __init__(self, sq_meters):
        self.sq_meters = sq_meters
    def area(self):
        return self.sq_meters

print(good_area(LandParcel(500)))
try:
    print(bad_area(LandParcel(500)))
except TypeError as e:
    print(f"Error: {e}")
# Output:
# 500
# Error: Unknown shape
```

### The Updated Project
```python
29: def bad_area(shape):
30:     if isinstance(shape, Circle):
31:         import math
32:         return math.pi * shape.radius**2
33:     elif isinstance(shape, Rectangle):
34:         return shape.width * shape.height
35:     else:
36:         raise TypeError('Unknown shape')
37: 
38: def good_area(shape):
39:     return shape.area()
40: 
41: class LandParcel:
42:     def __init__(self, sq_meters):
43:         self.sq_meters = sq_meters
44:     def area(self):
45:         return self.sq_meters
46: 
47: print(good_area(LandParcel(500)))
48: try:
49:     print(bad_area(LandParcel(500)))
50: except TypeError as e:
51:     print(f"Error: {e}")
```
The file now demonstrates why checking exact types (`isinstance`) is brittle compared to simply invoking the behavior (`good_area`).

### Mechanical Walkthrough
- `def bad_area(shape):` defines a function checking types explicitly.
- `if isinstance(shape, Circle):` checks if the object is exactly a `Circle`.
- `import math` imports math locally.
- `return math.pi * shape.radius**2` extracts the radius and computes area.
- `elif isinstance(shape, Rectangle):` checks if it's a `Rectangle`.
- `return shape.width * shape.height` computes area.
- `else:` triggers if it is neither.
- `raise TypeError('Unknown shape')` throws an error.
- `def good_area(shape):` defines the duck-typed version.
- `return shape.area()` asks the object for its area directly.
- `class LandParcel:` defines a new class outside our shape hierarchy.
- `def __init__(self, sq_meters):` initializes it.
- `self.sq_meters = sq_meters` stores the area.
- `def area(self):` provides the polymorphic method.
- `return self.sq_meters` returns the area.
- `print(good_area(LandParcel(500)))` succeeds and prints 500 because the object walks and quacks like a shape (it has `.area()`).
- `print(bad_area(LandParcel(500)))` fails because the function stubbornly checks for hardcoded classes.

---

## Concept Unit: Python's built-in polymorphism

### The Problem
You've probably noticed that `len()` works on strings, lists, and dictionaries. How does Python achieve this? Python has polymorphism built right into the language using special methods.

### Introduce the concept in isolation
```python
print(len('hello'))
print(len([1,2,3]))
print(len({'a':1}))

print(str(42))
print(str([1,2]))
print(str(True))
# Output:
# 5
# 3
# 1
# 42
# [1, 2]
# True
```
This is **built-in polymorphism**. The output proves that `len()` and `str()` don't care what exact type you pass them, as long as the objects implement `__len__` or `__str__` internally.

### Discard the throwaway example
The prints are discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `shapes.py`.
- **Change type**: Add.
- **Location**: Bottom of file.
- **Dependencies**: None.

### The New Code
```python
class CustomCollection:
    def __init__(self, items):
        self.items = items
    def __len__(self):
        return len(self.items)

c = CustomCollection([10, 20, 30])
print(len(c))
# Output:
# 3
```

### The Updated Project
```python
53: class CustomCollection:
54:     def __init__(self, items):
55:         self.items = items
56:     def __len__(self):
57:         return len(self.items)
58: 
59: c = CustomCollection([10, 20, 30])
60: print(len(c))
```
The file now demonstrates that custom classes can hook into Python's built-in polymorphic functions like `len()`.

### Mechanical Walkthrough
- `class CustomCollection:` defines a new wrapper class.
- `def __init__(self, items):` takes a list of items.
- `self.items = items` stores them.
- `def __len__(self):` implements the special method for length.
- `return len(self.items)` delegates the length calculation to the underlying list.
- `c = CustomCollection([10, 20, 30])` creates an instance.
- `print(len(c))` calls the built-in `len()`, which in turn delegates to our custom `__len__` method, printing 3.

---

## Concept Unit: The `@functools.singledispatch` decorator — explicit polymorphism by type

### The Problem
Duck typing is great when you control the classes and can add methods to them. But what if you have a function that needs to process built-in types (like `int`, `list`, `str`) differently? You can't add a `.describe()` method to Python's `int`. How do you dispatch by type without using messy `if isinstance(...)` chains?

### Introduce the concept in isolation
```python
from functools import singledispatch

@singledispatch
def handle_data(data):
    return "Generic fallback"

@handle_data.register(int)
def _(data):
    return "Handled integer"

print(handle_data("test"))
print(handle_data(99))
# Output:
# Generic fallback
# Handled integer
```
This is **single dispatch**. The output proves that the decorator automatically routes the call to the correct implementation based on the type of the first argument.

### Discard the throwaway example
The `handle_data` function is deleted.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `shapes.py`.
- **Change type**: Add.
- **Location**: Bottom of file.
- **Dependencies**: Standard library `functools`.

### The New Code
```python
from functools import singledispatch

@singledispatch
def describe(obj):
    return f'Unknown: {obj!r}'

@describe.register(int)
def _(obj):
    return f'Integer: {obj}'

@describe.register(list)
def _(obj):
    return f'List with {len(obj)} elements'

@describe.register(str)
def _(obj):
    return f'String of length {len(obj)}: {obj!r}'

print(describe(42))
print(describe([1,2,3]))
print(describe('hello'))
print(describe(3.14))
# Output:
# Integer: 42
# List with 3 elements
# String of length 5: 'hello'
# Unknown: 3.14
```

### The Updated Project
```python
62: from functools import singledispatch
63: 
64: @singledispatch
65: def describe(obj):
66:     return f'Unknown: {obj!r}'
67: 
68: @describe.register(int)
69: def _(obj):
70:     return f'Integer: {obj}'
71: 
72: @describe.register(list)
73: def _(obj):
74:     return f'List with {len(obj)} elements'
75: 
76: @describe.register(str)
77: def _(obj):
78:     return f'String of length {len(obj)}: {obj!r}'
79: 
80: print(describe(42))
81: print(describe([1,2,3]))
82: print(describe('hello'))
83: print(describe(3.14))
```
The file now implements a generic `describe` function that exhibits different behaviors for ints, lists, and strings.

### Mechanical Walkthrough
- `from functools import singledispatch` imports the decorator.
- `@singledispatch` decorates the base generic function.
- `def describe(obj):` defines the fallback function.
- `return f'Unknown: {obj!r}'` returns the default formatting string.
- `@describe.register(int)` registers a specific handler for the `int` type.
- `def _(obj):` defines the handler. Using `_` is a convention indicating the function name doesn't matter, as the dispatcher looks it up.
- `return f'Integer: {obj}'` returns the integer format.
- `@describe.register(list)` registers a handler for lists.
- `return f'List with {len(obj)} elements'` returns the list format.
- `@describe.register(str)` registers a handler for strings.
- `return f'String of length {len(obj)}: {obj!r}'` returns the string format.
- `print(describe(42))` calls the `int` version.
- `print(describe([1,2,3]))` calls the `list` version.
- `print(describe('hello'))` calls the `str` version.
- `print(describe(3.14))` calls the fallback version since `float` was not registered.

---

## Concept Unit: Protocols vs abstract base classes

### The Problem
In languages like Java, to make an object iterable or accessible by index, you must formally declare that the class implements a specific interface (like `Iterable`). In Python, how do you integrate seamlessly into built-in operators like loops and indexing without subclassing anything?

### Introduce the concept in isolation
```python
class CountToThree:
    def __getitem__(self, i):
        if i >= 3: raise IndexError
        return i + 1

for num in CountToThree():
    print(num)
# Output:
# 1
# 2
# 3
```
This is a **protocol**. The output proves that merely implementing `__getitem__` is enough for Python's `for` loop to recognize the object as iterable — no explicit inheritance required.

### Discard the throwaway example
The `CountToThree` class is deleted.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `shapes.py`.
- **Change type**: Add.
- **Location**: Bottom of file.
- **Dependencies**: None.

### The New Code
```python
class Fibonacci:
    def __len__(self):
        return 100

    def __getitem__(self, n):
        if isinstance(n, slice):
            return [self[i] for i in range(*n.indices(100))]
        if n < 0:
            n = 100 + n
        a, b = 0, 1
        for _ in range(n):
            a, b = b, a + b
        return a

fibs = Fibonacci()
print(fibs[0])
print(fibs[10])
print(fibs[-1])
print(list(fibs[:5]))
print(55 in fibs)
# Output:
# 0
# 55
# 218922995834555169026
# [0, 1, 1, 2, 3]
# True
```

### The Updated Project
```python
85: class Fibonacci:
86:     def __len__(self):
87:         return 100
88: 
89:     def __getitem__(self, n):
90:         if isinstance(n, slice):
91:             return [self[i] for i in range(*n.indices(100))]
92:         if n < 0:
93:             n = 100 + n
94:         a, b = 0, 1
95:         for _ in range(n):
96:             a, b = b, a + b
97:         return a
98: 
99: fibs = Fibonacci()
100: print(fibs[0])
101: print(fibs[10])
102: print(fibs[-1])
103: print(list(fibs[:5]))
104: print(55 in fibs)
```
The file now includes a class that formally acts as a Sequence purely by implementing `__len__` and `__getitem__`.

### Mechanical Walkthrough
- `class Fibonacci:` defines the class.
- `def __len__(self):` implements part of the sequence protocol.
- `return 100` hardcodes a length of 100 elements.
- `def __getitem__(self, n):` implements indexing.
- `if isinstance(n, slice):` detects slicing (`[:]`).
- `return [self[i] for i in range(*n.indices(100))]` dynamically processes the slice bounds.
- `if n < 0:` checks for negative indices.
- `n = 100 + n` converts it to a positive index.
- `a, b = 0, 1` sets up Fibonacci generation.
- `for _ in range(n):` iterates `n` times.
- `a, b = b, a + b` calculates the next Fibonacci number.
- `return a` returns the calculated number.
- `fibs = Fibonacci()` creates an instance.
- `print(fibs[0])` accesses the 0th element.
- `print(fibs[10])` accesses the 10th.
- `print(fibs[-1])` leverages negative indexing gracefully.
- `print(list(fibs[:5]))` leverages slicing.
- `print(55 in fibs)` leverages the `in` operator, which automatically iterates using `__getitem__` until it finds the value.

---

## Concept Unit: Mixins — composable behavior without inheritance

### The Problem
You have multiple unrelated classes (like a `BankAccount` and a `Customer`), and you want them all to serialize themselves to JSON. You don't want to duplicate the code, and you shouldn't force them all to inherit from some generic `BaseObject` class because that limits future inheritance options. How can you add functionality horizontally across classes?

### Introduce the concept in isolation
```python
class LoudMixin:
    def shout(self):
        return f"{self.name.upper()}!"

class Person(LoudMixin):
    def __init__(self, name):
        self.name = name

p = Person("Alice")
print(p.shout())
# Output:
# ALICE!
```
This is a **mixin**. The output proves that `Person` gained the `shout()` method purely by inheriting from the `LoudMixin` class, which accesses `self.name` even though it doesn't define it.

### Discard the throwaway example
`LoudMixin` and `Person` are discarded.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `shapes.py`.
- **Change type**: Add.
- **Location**: Bottom of file.
- **Dependencies**: The `json` module.

### The New Code
```python
class JsonMixin:
    def to_json(self):
        import json
        return json.dumps(self.__dict__)

    @classmethod
    def from_json(cls, json_str):
        import json
        data = json.loads(json_str)
        obj = cls.__new__(cls)
        obj.__dict__.update(data)
        return obj

class BankAccount(JsonMixin):
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

account = BankAccount('Alice', 1000)
json_str = account.to_json()
print(json_str)

restored = BankAccount.from_json(json_str)
print(restored.owner)
print(restored.balance)
# Output:
# {"owner": "Alice", "balance": 1000}
# Alice
# 1000
```

### The Updated Project
```python
106: class JsonMixin:
107:     def to_json(self):
108:         import json
109:         return json.dumps(self.__dict__)
110: 
111:     @classmethod
112:     def from_json(cls, json_str):
113:         import json
114:         data = json.loads(json_str)
115:         obj = cls.__new__(cls)
116:         obj.__dict__.update(data)
117:         return obj
118: 
119: class BankAccount(JsonMixin):
120:     def __init__(self, owner, balance):
121:         self.owner = owner
122:         self.balance = balance
123: 
124: account = BankAccount('Alice', 1000)
125: json_str = account.to_json()
126: print(json_str)
127: 
128: restored = BankAccount.from_json(json_str)
129: print(restored.owner)
130: print(restored.balance)
```
The file now contains a `JsonMixin` that provides standard JSON capabilities to any class that inherits it, like `BankAccount`.

### Mechanical Walkthrough
- `class JsonMixin:` defines the mixin.
- `def to_json(self):` is the serialization method.
- `import json` brings in the JSON library.
- `return json.dumps(self.__dict__)` dumps the object's instance dictionary into a JSON string.
- `@classmethod` makes the next method callable on the class itself.
- `def from_json(cls, json_str):` defines the deserialization factory method.
- `import json` imports it locally.
- `data = json.loads(json_str)` parses the string into a dictionary.
- `obj = cls.__new__(cls)` bypasses `__init__` and creates a raw instance. This is required because we might not know what arguments `__init__` expects.
- `obj.__dict__.update(data)` forcefully injects the deserialized dictionary into the new object's state.
- `return obj` returns the reconstructed object.
- `class BankAccount(JsonMixin):` creates a class that uses the mixin.
- `def __init__(self, owner, balance):` sets up standard state.
- `self.owner = owner` and `self.balance = balance` set the fields.
- `account = BankAccount('Alice', 1000)` instantiates it.
- `json_str = account.to_json()` calls the mixin method.
- `print(json_str)` displays the raw JSON string.
- `restored = BankAccount.from_json(json_str)` uses the mixin class method to rebuild it.
- `print(restored.owner)` and `print(restored.balance)` prove the state was fully restored.

---

## Concept Unit: A polymorphic report generator

### The Problem
You need to generate reports in CSV, HTML, and Markdown. If you hardcode this logic in a single `ReportGenerator` class, you have to keep adding `if/elif` statements whenever a new format is requested. How do you design a system where new formats can be added completely invisibly to the central generator?

### Introduce the concept in isolation
```python
class AddOne:
    def apply(self, x): return x + 1

class Double:
    def apply(self, x): return x * 2

def execute_strategy(strategy, num):
    return strategy.apply(num)

print(execute_strategy(AddOne(), 5))
print(execute_strategy(Double(), 5))
# Output:
# 6
# 10
```
This is the **Strategy pattern**. The output proves that `execute_strategy` doesn't care *how* the operation is performed, only that it can pass data to the `.apply()` method of the strategy object.

### Discard the throwaway example
`AddOne`, `Double`, and `execute_strategy` are deleted.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modify `shapes.py`.
- **Change type**: Add.
- **Location**: Bottom of file.
- **Dependencies**: None.

### The New Code
```python
class CSVReport:
    def render(self, data):
        lines = [','.join(str(v) for v in row) for row in data]
        return '\n'.join(lines)

class HTMLReport:
    def render(self, data):
        rows = ''.join(
            '<tr>' + ''.join(f'<td>{v}</td>' for v in row) + '</tr>'
            for row in data
        )
        return f'<table>{rows}</table>'

class MarkdownReport:
    def render(self, data):
        lines = ['| ' + ' | '.join(str(v) for v in row) + ' |'
                 for row in data]
        return '\n'.join(lines)

def generate_report(reporter, data):
    return reporter.render(data)

report_data = [['Name', 'Score'], ['Alice', 95], ['Bob', 82]]
print(generate_report(CSVReport(), report_data))
print(generate_report(HTMLReport(), report_data))
print(generate_report(MarkdownReport(), report_data))
# Output:
# Name,Score
# Alice,95
# Bob,82
# <table><tr><td>Name</td><td>Score</td></tr><tr><td>Alice</td><td>95</td></tr><tr><td>Bob</td><td>82</td></tr></table>
# | Name | Score |
# | Alice | 95 |
# | Bob | 82 |
```

### The Updated Project
```python
132: class CSVReport:
133:     def render(self, data):
134:         lines = [','.join(str(v) for v in row) for row in data]
135:         return '\n'.join(lines)
136: 
137: class HTMLReport:
138:     def render(self, data):
139:         rows = ''.join(
140:             '<tr>' + ''.join(f'<td>{v}</td>' for v in row) + '</tr>'
141:             for row in data
142:         )
143:         return f'<table>{rows}</table>'
144: 
145: class MarkdownReport:
146:     def render(self, data):
147:         lines = ['| ' + ' | '.join(str(v) for v in row) + ' |'
148:                  for row in data]
149:         return '\n'.join(lines)
150: 
151: def generate_report(reporter, data):
152:     return reporter.render(data)
153: 
154: report_data = [['Name', 'Score'], ['Alice', 95], ['Bob', 82]]
155: print(generate_report(CSVReport(), report_data))
156: print(generate_report(HTMLReport(), report_data))
157: print(generate_report(MarkdownReport(), report_data))
```
The file now contains three different reporting strategies and a central generator that uses duck typing to execute them.

### Mechanical Walkthrough
- `class CSVReport:` defines the CSV strategy.
- `def render(self, data):` implements the expected method.
- `lines = [','.join(str(v) for v in row) for row in data]` converts each row of data into a comma-separated string.
- `return '\n'.join(lines)` joins the rows with newlines.
- `class HTMLReport:` defines the HTML strategy.
- `def render(self, data):` implements the method.
- `rows = ''.join(...)` builds the HTML string using string concatenation.
- `for row in data` iterates over the data.
- `'<tr>' + ''.join(f'<td>{v}</td>' for v in row) + '</tr>'` wraps the row in table row tags and values in table data tags.
- `return f'<table>{rows}</table>'` wraps everything in a table tag.
- `class MarkdownReport:` defines the Markdown strategy.
- `def render(self, data):` implements the method.
- `lines = ['| ' + ' | '.join(str(v) for v in row) + ' |' for row in data]` formats the rows into Markdown table syntax.
- `return '\n'.join(lines)` joins them with newlines.
- `def generate_report(reporter, data):` takes any object representing a strategy, plus the data.
- `return reporter.render(data)` simply calls `.render(data)`. Because of polymorphism and duck typing, this succeeds as long as the strategy object passed in has that method.
- `report_data = [...]` defines a sample nested list of data.
- `print(generate_report(CSVReport(), report_data))` generates the CSV output.
- `print(generate_report(HTMLReport(), report_data))` generates the HTML output.
- `print(generate_report(MarkdownReport(), report_data))` generates the Markdown output.

---

Closing: polymorphism and duck typing are the core of Python's design philosophy. They empower you to write functions that work flawlessly with entirely new data types created long after the function was written. Lesson 27 covers dataclasses and named tuples. Exercises: add a `TextReport` and a `JSONReport` to the report generator; implement the `Comparable` mixin that provides `__le__`, `__gt__`, `__ge__`, `__ne__` from just `__eq__` and `__lt__`.
