# Lesson 26: Polymorphism and Duck Typing

What you will build: The reader understands Python polymorphism: the same operation working on different types (via method overriding), and duck typing ('if it walks like a duck and quacks like a duck, it IS a duck'). The transferable insight: Python does not check types before calling a method. It just calls the method. If the method exists and works: success. If not: AttributeError at runtime. This is duck typing. It enables writing functions that work on any object with the right interface, without requiring a shared base class.

What you need to know first: Lessons 00-25.

**Terms used in this lesson:**
- **Polymorphism** — the provision of a single interface to entities of different types. It allows one function or operator to act on multiple types of objects without needing type-checking logic.
- **Duck typing** — a programming style where the type or class of an object is less important than the methods it defines. Python checks for the presence of a method, not the class inheritance.
- **EAFP (Easier to Ask Forgiveness than Permission)** — a common Python coding style that assumes the existence of valid keys or attributes and catches exceptions if the assumption proves false, rather than checking beforehand.
- **Protocol (structural typing)** — an informal or formal interface specifying that an object must have a certain set of methods.
- **Operator overloading** — providing a custom implementation for standard operators (like `+` or `len()`) for user-defined classes by defining special methods like `__add__` or `__len__`.

**Objects and methods used:**
- **`sum()`**
  - *What it is:* A built-in function that adds items of an iterable from left to right and returns the total.
  - *Implementation:* `sum(iterable, /, start=0)`
  - *Its use:* Used to add up the sequence of area values.
  - *Type:* Built-in function.
  - *Responsibility:* Computes the numerical sum of elements in an iterable.
  - *Depends on:* An iterable yielding numbers.
  - *Connects to:* Calls `__iter__` on the iterable and adds the resulting numbers.
  - *Shape:* A standard library mathematical utility.
- **`isinstance()`**
  - *What it is:* A built-in function that checks if an object is an instance or subclass of a class or a tuple of classes.
  - *Implementation:* `isinstance(object, classinfo)`
  - *Its use:* Used to demonstrate explicit runtime structural type checking against a Protocol.
  - *Type:* Built-in function.
  - *Responsibility:* Determines object ancestry or protocol satisfaction at runtime.
  - *Depends on:* An instance object and a class or Protocol type.
  - *Connects to:* Evaluates the internal `__class__` and inheritance chain or `__subclasscheck__`.
  - *Shape:* Runtime type-checking primitive.
- **`typing.Protocol`**
  - *What it is:* A base class for creating structural types in type hints.
  - *Implementation:* `class typing.Protocol`
  - *Its use:* Used to define a formal interface `HasArea` for static and runtime type checking.
  - *Type:* Class (metaclass).
  - *Responsibility:* Defines an expected structural interface rather than nominal inheritance.
  - *Depends on:* Method signatures defined in its body.
  - *Connects to:* Used by static type checkers (like mypy) and `isinstance` (if runtime_checkable).
  - *Shape:* Type hinting structure.
- **`typing.runtime_checkable`**
  - *What it is:* A decorator to mark a protocol class as a runtime protocol.
  - *Implementation:* `@runtime_checkable`
  - *Its use:* Allows `isinstance()` checks to work with the `HasArea` Protocol.
  - *Type:* Decorator.
  - *Responsibility:* Injects structural `isinstance` checking capabilities into a Protocol.
  - *Depends on:* A `Protocol` subclass.
  - *Connects to:* Modifies the Protocol to support `__instancecheck__`.
  - *Shape:* Type system utility decorator.

## Concept Unit: Polymorphism via method overriding

### The Problem
When you have a list of different geometric shapes, how do you calculate the total area without writing a massive `if/elif` chain checking the specific type of each shape? What happens if you add a new shape type later? If you use a single loop calling `.area()` on every shape, how does Python know which shape's area calculation to run?

### Introduce the concept in isolation
We will define a small script with a base class and two subclasses that override the base class method. 

```python
class Animal:
    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"

animals = [Dog(), Cat()]
for animal in animals:
    print(animal.speak())
```

This prints `Woof!` then `Meow!`. What this proves: we can call the exact same method name (`speak`) on different objects, and Python executes the specific method implementation belonging to each object's class. This is called **Polymorphism**.

### Discard the throwaway
This `Animal` script is discarded and will not be used in the project.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
Files affected: created `shapes.py`.
Change type: add.
Location: new file.
Dependencies: None.

### The New Code
```python
class Shape:
    def area(self):
        raise NotImplementedError

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        import math
        return math.pi * self.radius ** 2

class Square(Shape):
    def __init__(self, side):
        self.side = side
    def area(self):
        return self.side ** 2

class Triangle(Shape):
    def __init__(self, base, height):
        self.base = base
        self.height = height
    def area(self):
        return 0.5 * self.base * self.height

def total_area(shapes):
    return sum(s.area() for s in shapes)  # same call, different behavior
```

### The Updated Project
```python
1: class Shape:
2:     def area(self):
3:         raise NotImplementedError
4: 
5: class Circle(Shape):
6:     def __init__(self, radius):
7:         self.radius = radius
8:     def area(self):
9:         import math
10:         return math.pi * self.radius ** 2
11: 
12: class Square(Shape):
13:     def __init__(self, side):
14:         self.side = side
15:     def area(self):
16:         return self.side ** 2
17: 
18: class Triangle(Shape):
19:     def __init__(self, base, height):
20:         self.base = base
21:         self.height = height
22:     def area(self):
23:         return 0.5 * self.base * self.height
24: 
25: def total_area(shapes):
26:     return sum(s.area() for s in shapes)  # same call, different behavior
```

### Mechanical walkthrough
- `class Shape:` defines the base class.
- `def area(self):` is the method signature expected in subclasses.
- `raise NotImplementedError` ensures subclasses must provide their own `area()` implementation.
- `class Circle(Shape):` defines a subclass inheriting from `Shape`.
- `def __init__(self, radius):` is the constructor.
- `self.radius = radius` stores state.
- `def area(self):` overrides the base class method.
- `import math` brings in mathematical constants.
- `return math.pi * self.radius ** 2` performs the circle area math.
- `class Square(Shape):` creates a square subclass.
- `return self.side ** 2` performs the square area math.
- `class Triangle(Shape):` creates a triangle subclass.
- `return 0.5 * self.base * self.height` performs the triangle area math.
- `def total_area(shapes):` defines a function taking an iterable of shapes.
- `sum(...)` computes the numerical total.
- `s.area() for s in shapes` is a generator expression invoking the polymorphic `area()` method on each object.

### CS lens
This is **Polymorphism**. In computer science, this is subtyping polymorphism where an operation (like `.area()`) behaves differently depending on the type of object it is invoked upon. You see this in user interface rendering systems (calling `.draw()` on varied widgets), file systems (calling `.read()` on different file descriptor types), and payment processors (calling `.process()` on different credit card handlers).

### SE lens
Design Principle: The Open-Closed Principle. You can add new shapes (like `Hexagon`) without modifying the `total_area` function. Alternative NOT chosen: an `if isinstance(s, Circle): ... elif isinstance(s, Square): ...` block. The tradeoff is that the logic for calculating an area is decentralized into many classes instead of living in one procedural function, making it harder to see all area formulas at once but much easier to extend.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```python
shapes = [Circle(5), Square(3), Triangle(4, 3)]
for s in shapes:
    print(f'{type(s).__name__}: area = {s.area():.2f}')
print(f'Total: {total_area(shapes):.2f}')
# Circle: area = 78.54
# Square: area = 9.00
# Triangle: area = 6.00
# Total: 93.54
```

### One sentence connecting to previous unit
We've seen that subclasses can override a base class method, but what happens if we drop the base class entirely?

## Concept Unit: Duck typing — no inheritance required

### The Problem
Does Python actually care that `Circle` and `Square` inherit from `Shape`? What if we pass an object to `total_area` that doesn't inherit from `Shape`, but still has an `.area()` method?

### Introduce the concept in isolation
```python
class Duck:
    def quack(self):
        return "Quack!"

class Person:
    def quack(self):
        return "I am impersonating a duck."

def make_it_quack(obj):
    print(obj.quack())

make_it_quack(Duck())
make_it_quack(Person())
```
This prints `Quack!` and `I am impersonating a duck.`. What this proves: `Person` doesn't inherit from `Duck`, but because it has a `quack()` method, Python calls it successfully. Python checks for the method's presence at runtime, not the object's pedigree. This is called **Duck typing**.

### Discard the throwaway
This `Duck` and `Person` script is discarded and will not be used in the project.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
Files affected: modified `shapes.py`.
Change type: add.
Location: appended to the file.
Dependencies: the previous code block in `shapes.py`.

### The New Code
```python
# Duck typing: Python doesn't check isinstance. It just calls the method.
# Any object with an .area() method works in total_area().

class Rectangle:     # does NOT inherit from Shape
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h

class Pentagon:      # also not a Shape subclass
    def __init__(self, side):
        self.side = side
    def area(self):
        import math
        return (math.sqrt(5*(5+2*math.sqrt(5)))/4) * self.side**2

# EAFP (Easier to Ask Forgiveness than Permission):
def get_area(obj):
    try:
        return obj.area()   # just try it
    except AttributeError:
        raise TypeError(f'{type(obj).__name__} has no area() method')
```

### The Updated Project
```python
25: def total_area(shapes):
26:     return sum(s.area() for s in shapes)
27: 
28: class Rectangle:     # does NOT inherit from Shape  # <- new
29:     def __init__(self, w, h):                       # <- new
30:         self.w, self.h = w, h                       # <- new
31:     def area(self):                                 # <- new
32:         return self.w * self.h                      # <- new
33: 
34: class Pentagon:      # also not a Shape subclass    # <- new
35:     def __init__(self, side):                       # <- new
36:         self.side = side                            # <- new
37:     def area(self):                                 # <- new
38:         import math                                 # <- new
39:         return (math.sqrt(5*(5+2*math.sqrt(5)))/4) * self.side**2  # <- new
40: 
41: def get_area(obj):                                  # <- new
42:     try:                                            # <- new
43:         return obj.area()                           # <- new
44:     except AttributeError:                          # <- new
45:         raise TypeError(f'{type(obj).__name__} has no area() method')  # <- new
```
We added two unrelated classes and an EAFP fallback helper.

### Mechanical walkthrough
- `class Rectangle:` defines a new class without `(Shape)`.
- `def __init__(self, w, h):` initializes the state.
- `def area(self):` provides the required method name for duck typing.
- `return self.w * self.h` computes area.
- `class Pentagon:` defines another standalone class.
- `import math` is used for the complex area formula.
- `def get_area(obj):` defines a helper function taking any object.
- `try:` begins a block expecting potential errors.
- `return obj.area()` attempts the method call.
- `except AttributeError:` catches the specific error if `.area()` doesn't exist.
- `raise TypeError(...)` throws a more descriptive error if it fails.

### CS lens
This is **Duck typing**. It is a form of dynamic structural typing. You see this everywhere in dynamically typed languages like Ruby or JavaScript: functions that expect "file-like" objects with `.read()` and `.write()` methods, serialization functions expecting objects with `.to_json()` methods, and loggers expecting objects with `.format()` methods. 

### SE lens
Design Principle: **EAFP (Easier to Ask Forgiveness than Permission)**. By trying `obj.area()` directly inside a `try/except` block, Python avoids the cost and fragility of an `hasattr(obj, 'area')` check. Alternative NOT chosen: "LBYL" (Look Before You Leap) checking types ahead of time. The tradeoff is that setting up a try/except block has some overhead if exceptions are frequent, but it's typically faster in Python for the common case where the operation succeeds.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```python
print(total_area([Rectangle(4, 5), Pentagon(3)]))
# 20 + 15.48... = 35.48...
```

### One sentence connecting to previous unit
If Python naturally expects objects to fulfill certain informal interfaces like having an `.area()` method, are there formal expectations built into the language itself?

## Concept Unit: Protocols and structural typing

### The Problem
If Python lets you use any object as long as it has the right methods, how does a standard function like `sum()` or `list()` know that it can loop over our objects? What is the specific informal interface those built-in tools expect?

### Introduce the concept in isolation
```python
class MySequence:
    def __getitem__(self, index):
        if index < 3:
            return index * 10
        raise IndexError

for num in MySequence():
    print(num)
```
This prints `0`, `10`, `20`. What this proves: By merely providing a `__getitem__` method, our object satisfies a sequence protocol that Python's `for` loop recognizes. This informal set of required methods is called a **Protocol**.

### Discard the throwaway
This `MySequence` script is discarded and will not be used in the project.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
Files affected: modified `shapes.py`.
Change type: add.
Location: appended to the file.
Dependencies: none.

### The New Code
```python
# A protocol is an informal interface: a set of methods an object must have.
# The 'iterable protocol': object must have __iter__ or __getitem__

class CountDown:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        i = self.n
        while i >= 0:
            yield i
            i -= 1
```

### The Updated Project
```python
46: 
47: class CountDown:                                      # <- new
48:     def __init__(self, n):                            # <- new
49:         self.n = n                                    # <- new
50:     def __iter__(self):                               # <- new
51:         i = self.n                                    # <- new
52:         while i >= 0:                                 # <- new
53:             yield i                                   # <- new
54:             i -= 1                                    # <- new
```
We added a class that satisfies the iterable protocol.

### Mechanical walkthrough
- `class CountDown:` defines a custom class.
- `def __init__(self, n):` saves the starting number.
- `def __iter__(self):` is the special method that satisfies the **iterable protocol**.
- `yield i` returns a value and suspends the function's execution until the next value is requested.

### CS lens
This is **Protocol satisfaction** or informal structural typing. In computer science, this is similar to interfaces in Java or traits in Rust, but implicit. You see this pattern in iterating over database cursors, streaming lines from a network socket, or lazily yielding paginated API results.

### SE lens
Design Principle: Programming to an Interface, not an Implementation. Python's built-in functions don't care if an object is a list or a dictionary; they only care if it yields values via `__iter__`. Alternative NOT chosen: restricting `list()` or `sum()` to only accept `list` objects. The tradeoff is that runtime errors occur if an object claims to implement a protocol but fails to yield the expected types, sacrificing compile-time safety for flexibility.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```python
print(list(CountDown(5)))  # [5, 4, 3, 2, 1, 0]
print(sum(CountDown(5)))   # 15
```

### One sentence connecting to previous unit
Informal protocols are great, but what if we want to formally check that an object meets an interface without breaking duck typing?

## Concept Unit: typing.Protocol — explicit structural typing

### The Problem
Duck typing is great for flexibility, but how do we catch errors *before* the code runs? If an IDE or a tool like `mypy` is checking our code, how do we tell it "this function needs any object that has an `.area()` method" without forcing everything to inherit from `Shape`?

### Introduce the concept in isolation
```python
from typing import Protocol

class CanFly(Protocol):
    def fly(self) -> None: ...

class Bird:
    def fly(self) -> None: pass

class Rock:
    pass

def launch(item: CanFly):
    item.fly()
```
What this proves: `CanFly` defines a formal structural type. A static type checker will allow passing a `Bird` to `launch` but will flag `Rock` as an error because it lacks a `fly` method, even though neither inherits from `CanFly`. This is called **explicit structural typing**.

### Discard the throwaway
This `CanFly` script is discarded and will not be used in the project.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
Files affected: modified `shapes.py`.
Change type: add.
Location: appended to the file.
Dependencies: Python's `typing` module.

### The New Code
```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class HasArea(Protocol):
    def area(self) -> float: ...

class NotAShape:
    pass

c = Circle(5)
n = NotAShape()

def print_area(shape: HasArea) -> None:
    print(f'area = {shape.area():.2f}')
```

### The Updated Project
```python
55: 
56: from typing import Protocol, runtime_checkable        # <- new
57: 
58: @runtime_checkable                                    # <- new
59: class HasArea(Protocol):                              # <- new
60:     def area(self) -> float: ...                      # <- new
61: 
62: class NotAShape:                                      # <- new
63:     pass                                              # <- new
64: 
65: c = Circle(5)                                         # <- new
66: n = NotAShape()                                       # <- new
67: 
68: def print_area(shape: HasArea) -> None:               # <- new
69:     print(f'area = {shape.area():.2f}')               # <- new
```
We introduced a formal Protocol to define what it means to have an area.

### Mechanical walkthrough
- `from typing import Protocol, runtime_checkable` imports the required tools.
- `@runtime_checkable` is a decorator that allows `isinstance()` to work with our protocol at runtime.
- `class HasArea(Protocol):` defines a structural type.
- `def area(self) -> float: ...` declares the required signature. The `...` (ellipsis) is literal syntax here acting as a placeholder.
- `class NotAShape:` creates an empty class to test failure.
- `c = Circle(5)` and `n = NotAShape()` instantiate objects.
- `def print_area(shape: HasArea) -> None:` uses the protocol as a type hint.

### CS lens
This is **Explicit Structural Typing**. Unlike nominal typing (where an object must inherit the exact type name), structural typing means an object is a match if its structure (its methods and properties) matches the requirement. You see this heavily in TypeScript's interface system and Go's interfaces.

### SE lens
Design Principle: Static Analysis and Tooling Support. Providing a `Protocol` allows tools like `mypy` to find bugs statically without abandoning the flexibility of duck typing at runtime. Alternative NOT chosen: requiring a strict `Shape` base class to satisfy type checkers. The tradeoff is adding cognitive overhead and boilerplate to define the protocol interfaces in exchange for earlier bug detection.

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```python
print(isinstance(c, HasArea))  # True: Circle has .area()
print(isinstance(n, HasArea))  # False: NotAShape has no .area()
print_area(c)   # area = 78.54
# print_area(n) # mypy error: NotAShape doesn't implement HasArea
```

### One sentence connecting to previous unit
We've explored how custom methods provide polymorphism, but what about built-in Python operators?

## Concept Unit: Operator overloading as polymorphism

### The Problem
When you use the `+` operator, it adds numbers. But if you use it on strings, it concatenates them. How does one operator know how to handle fundamentally different types of data, and how can we make our own objects support these standard operators?

### Introduce the concept in isolation
```python
class Wallet:
    def __init__(self, dollars):
        self.dollars = dollars
    def __add__(self, other):
        return Wallet(self.dollars + other.dollars)

w1 = Wallet(10)
w2 = Wallet(20)
w3 = w1 + w2
print(w3.dollars)
```
This prints `30`. What this proves: We can define special double-underscore methods (like `__add__`) to dictate how standard operators behave on our custom objects. This is called **Operator overloading**.

### Discard the throwaway
This `Wallet` script is discarded and will not be used in the project.

### Project Change
No reference counterpart — this is a from-scratch addition because this is a standalone theory lesson.
Files affected: modified `shapes.py`.
Change type: add.
Location: appended to the file.
Dependencies: None.

### The New Code
```python
# '+' is polymorphic: works on int, str, list, etc.
# len() is polymorphic:
# sorted() is polymorphic over any iterable:
# The power: one function, many types. No if isinstance() checks needed.
```

### The Updated Project
```python
70: 
71: # '+' is polymorphic: works on int, str, list, etc.            # <- new
72: # len() is polymorphic:                                        # <- new
73: # sorted() is polymorphic over any iterable:                   # <- new
74: # The power: one function, many types. No if isinstance() checks needed. # <- new
```
We document how operators leverage polymorphism.

### Mechanical walkthrough
- `# '+' is polymorphic:` conceptually references the `__add__` method mapped to the `+` syntax.
- `# len() is polymorphic:` references the `__len__` method.
- `# sorted() is polymorphic over any iterable:` references the `__iter__` method used by the sorting utility.

### CS lens
This is **Ad-hoc Polymorphism** or **Operator Overloading**. The same symbol (like `+`) is dispatched to different implementations depending on the types of its operands. You see this in matrix math libraries (where `*` does matrix multiplication), path manipulation libraries (where `/` joins file paths), and database query builders (where `==` constructs an SQL WHERE clause).

### SE lens
Design Principle: Principle of Least Astonishment. Overloading standard operators makes custom objects feel like built-in native types, integrating smoothly into the language. Alternative NOT chosen: forcing users to call `w1.add(w2)` instead of `w1 + w2`. The tradeoff is that heavily overloaded operators can become confusing if the meaning strays too far from conventional mathematics (e.g., using `+` to mean "delete").

### Commands needed
None for this unit.

### Run it
Predicted confidently:
```python
print(1 + 2)         # 3       -- int.__add__
print('a' + 'b')     # 'ab'    -- str.__add__
print([1] + [2])     # [1, 2]  -- list.__add__

print(len('hello'))  # 5    -- str.__len__
print(len([1,2,3]))  # 3    -- list.__len__
print(len({'a':1}))  # 1    -- dict.__len__

print(sorted('hello'))          # ['e','h','l','l','o']
print(sorted({3,1,2}))          # [1,2,3]
print(sorted(range(5,0,-1)))    # [1,2,3,4,5]
```

### One sentence connecting to previous unit
All of these concepts—method overriding, duck typing, protocols, and operator overloading—are expressions of polymorphism.

## Closing

### Connect the pieces
Let's trace what happens when we call `total_area([Circle(5), Square(3), Triangle(4,3)])` through the concepts we've explored. First, **method overriding** ensures that when the loop calls `s.area()`, it executes `Circle.area` or `Square.area` respectively, dispatching to the correct implementation. Second, **duck typing** means `total_area` never checks if the objects inherit from `Shape`; it blindly trusts the objects to respond to `.area()`, allowing us to pass a `Rectangle` just as easily. Third, **protocol satisfaction** powers the `sum()` function and the `for` loop, which rely on the list's `__iter__` method to yield the geometric shapes one by one. Finally, **operator polymorphism** allows `math.pi * self.radius ** 2` to seamlessly multiply floats and integers behind the scenes. Python's power lies in trusting the object to handle the operation.
