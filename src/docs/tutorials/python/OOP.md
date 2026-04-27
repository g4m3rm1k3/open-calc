# � The Complete Python Object-Oriented Programming Guide
## From Zero to Expert — Everything You Need to Know

> **How to use this tutorial:** Read each section carefully, run every code block, study the comments, then attempt the challenges before looking at solutions. This guide is 3000+ lines of deep OOP knowledge.

---

## Table of Contents

- [� The Complete Python Object-Oriented Programming Guide](#-the-complete-python-object-oriented-programming-guide)
  - [From Zero to Expert — Everything You Need to Know](#from-zero-to-expert--everything-you-need-to-know)
  - [Table of Contents](#table-of-contents)
  - [1. What is OOP? The Philosophy](#1-what-is-oop-the-philosophy)
    - [Why OOP?](#why-oop)
    - [The Real-World Metaphor](#the-real-world-metaphor)
  - [2. Classes and Objects — The Foundation](#2-classes-and-objects--the-foundation)
    - [What Happens in Memory](#what-happens-in-memory)
  - [3. The `__init__` Method — Constructors](#3-the-__init__-method--constructors)
    - [The `__init__` vs `__new__` Distinction](#the-__init__-vs-__new__-distinction)
  - [4. Instance Variables vs Class Variables](#4-instance-variables-vs-class-variables)
  - [5. Methods — Functions Inside Classes](#5-methods--functions-inside-classes)
  - [6. The `self` Parameter — Deep Dive](#6-the-self-parameter--deep-dive)
  - [7. String Representation — `__str__` and `__repr__`](#7-string-representation--__str__-and-__repr__)
  - [8. Inheritance — Building on Existing Classes](#8-inheritance--building-on-existing-classes)
  - [9. Multiple Inheritance and MRO](#9-multiple-inheritance-and-mro)
  - [10. Encapsulation — Hiding Data](#10-encapsulation--hiding-data)
  - [11. Polymorphism — Many Forms](#11-polymorphism--many-forms)
  - [12. Abstraction — Abstract Base Classes](#12-abstraction--abstract-base-classes)
  - [13. Magic Methods (Dunder Methods)](#13-magic-methods-dunder-methods)
  - [14. Properties — Getters, Setters, Deleters](#14-properties--getters-setters-deleters)
  - [15. Class Methods and Static Methods](#15-class-methods-and-static-methods)
  - [16. Composition vs Inheritance](#16-composition-vs-inheritance)
  - [17. Mixins](#17-mixins)
  - [18. Descriptors](#18-descriptors)
  - [19. Metaclasses](#19-metaclasses)
  - [20. Dataclasses](#20-dataclasses)
  - [21. Design Patterns in Python OOP](#21-design-patterns-in-python-oop)
  - [22. SOLID Principles in Python](#22-solid-principles-in-python)
  - [23. Advanced Patterns and Real Projects](#23-advanced-patterns-and-real-projects)
  - [24. Final Mega Challenge](#24-final-mega-challenge)
  - [� Summary and What to Learn Next](#-summary-and-what-to-learn-next)
    - [� What to Study Next](#-what-to-study-next)

---

## 1. What is OOP? The Philosophy

Object-Oriented Programming (OOP) is a **programming paradigm** — a way of thinking about and structuring code. Instead of writing a series of instructions (procedural programming), you model your program around **objects** that have **data** (attributes) and **behavior** (methods).

### Why OOP?

Before OOP, large programs were written as long sequences of functions and global variables. As programs grew, this became nearly impossible to manage. OOP solved this with four core principles:

| Principle | What it means |
|---|---|
| **Encapsulation** | Bundle data and behavior together; hide internal details |
| **Inheritance** | New classes can reuse and extend existing ones |
| **Polymorphism** | Different objects can respond to the same interface in different ways |
| **Abstraction** | Hide complexity, expose only what's necessary |

### The Real-World Metaphor

Think about a **car**:
- It has **data**: color, speed, fuel level, engine size
- It has **behavior**: accelerate, brake, turn, refuel
- You don't need to know *how* the engine works to *drive* the car (abstraction)
- You can't directly change the fuel level without going through the fuel tank (encapsulation)
- A sports car and a truck are both cars — they share behavior but differ in specifics (inheritance/polymorphism)

This is exactly how OOP works in code.

---

## 2. Classes and Objects — The Foundation

A **class** is a blueprint. An **object** (also called an **instance**) is a specific thing built from that blueprint.

```python
# ============================================================
# BASIC CLASS DEFINITION
# ============================================================
# The 'class' keyword starts a class definition.
# By convention, class names use PascalCase (CapitalizedWords).
# ============================================================

class Dog:
    """
    A simple class representing a Dog.
    
    This docstring describes the class — always write one!
    It appears when you call help(Dog).
    """
    pass  # 'pass' means the class body is empty for now


# ============================================================
# CREATING OBJECTS (INSTANTIATION)
# ============================================================
# To create an object, you "call" the class like a function.
# This is called instantiation — creating an instance.
# ============================================================

my_dog = Dog()        # Creates one Dog object
your_dog = Dog()      # Creates a DIFFERENT Dog object

# Each object is independent — they occupy different memory locations
print(my_dog)         # <__main__.Dog object at 0x...>
print(your_dog)       # <__main__.Dog object at 0x...> (different address!)
print(my_dog is your_dog)   # False — they are NOT the same object
print(type(my_dog))         # <class '__main__.Dog'>
print(isinstance(my_dog, Dog))  # True — my_dog IS an instance of Dog


# ============================================================
# ADDING ATTRIBUTES DYNAMICALLY (not recommended, but possible)
# ============================================================
# Python allows you to add attributes to an object after creation.
# This is flexible but messy — prefer __init__ (covered next).
# ============================================================

my_dog.name = "Rex"
my_dog.breed = "German Shepherd"
my_dog.age = 3

print(my_dog.name)    # Rex
print(my_dog.breed)   # German Shepherd

# your_dog does NOT have these attributes — objects are independent
# print(your_dog.name)  # Would raise AttributeError!
```

### What Happens in Memory

When you write `my_dog = Dog()`, Python:
1. Creates a new object in memory
2. Calls the class to initialize it
3. Assigns a reference to `my_dog`

```python
# ============================================================
# UNDERSTANDING REFERENCES
# ============================================================
# Variables in Python hold REFERENCES to objects, not the objects
# themselves. This is crucial to understand.
# ============================================================

dog_a = Dog()
dog_a.name = "Buddy"

dog_b = dog_a          # dog_b now POINTS TO THE SAME object as dog_a!
dog_b.name = "Max"

print(dog_a.name)      # "Max" — because dog_a and dog_b are the SAME object!
print(dog_b.name)      # "Max"
print(dog_a is dog_b)  # True — same object in memory

# To create a truly independent copy, you'd need copy.copy() or copy.deepcopy()
import copy
dog_c = copy.copy(dog_a)    # Shallow copy — new object, same data
dog_c.name = "Charlie"

print(dog_a.name)           # Still "Max" — dog_c is independent
print(dog_c.name)           # "Charlie"
print(dog_a is dog_c)       # False — different objects
```

---

## 3. The `__init__` Method — Constructors

The `__init__` method is the **constructor** — it runs automatically when you create a new object. Use it to set up the initial state of your object.

```python
# ============================================================
# THE __init__ METHOD
# ============================================================
# __init__ stands for "initialize"
# It is called AUTOMATICALLY when you do: obj = ClassName(...)
# The double underscores (__) indicate it's a "magic" or "dunder" method
# We cover all magic methods in depth in section 13
# ============================================================

class Dog:
    """A well-defined Dog class with proper initialization."""

    def __init__(self, name, breed, age):
        """
        Initialize a new Dog.
        
        Parameters:
            name  (str): The dog's name
            breed (str): The dog's breed
            age   (int): The dog's age in years
        
        'self' refers to the object being created.
        We assign data TO the object using self.attribute = value
        """
        # These are INSTANCE VARIABLES — each Dog gets its own copy
        self.name = name
        self.breed = breed
        self.age = age


# Now creating a Dog REQUIRES the arguments
rex = Dog("Rex", "German Shepherd", 3)
bella = Dog("Bella", "Golden Retriever", 5)

print(rex.name)    # Rex
print(bella.name)  # Bella

# Each object has its own data
print(rex.age)     # 3
print(bella.age)   # 5


# ============================================================
# DEFAULT PARAMETER VALUES IN __init__
# ============================================================
# Just like regular functions, __init__ can have default values.
# This makes some arguments optional.
# ============================================================

class Cat:
    """A Cat with some optional attributes."""

    def __init__(self, name, breed="Unknown", indoor=True, lives=9):
        """
        name   — required (no default)
        breed  — optional, defaults to "Unknown"
        indoor — optional, defaults to True
        lives  — optional, defaults to 9 (cats get 9 lives!)
        """
        self.name = name
        self.breed = breed
        self.indoor = indoor
        self.lives = lives
        
        # You can also COMPUTE values during initialization
        self.is_kitten = True if lives == 9 else False


# Various ways to create a Cat
whiskers = Cat("Whiskers")                         # Only name required
luna = Cat("Luna", "Siamese")                      # name + breed
shadow = Cat("Shadow", "Black Cat", False)         # indoor=False
lucky = Cat("Lucky", lives=7)                      # Keyword argument

print(whiskers.breed)   # Unknown (default)
print(luna.breed)       # Siamese
print(shadow.indoor)    # False
print(lucky.lives)      # 7


# ============================================================
# __init__ WITH DATA VALIDATION
# ============================================================
# A powerful pattern: validate data in __init__ before storing it.
# This ensures your objects are always in a valid state.
# ============================================================

class BankAccount:
    """A bank account that validates its initial balance."""

    def __init__(self, owner, balance=0.0):
        """
        owner   — the account holder's name
        balance — initial balance, must be >= 0
        """
        # Validate before storing
        if not isinstance(owner, str) or not owner.strip():
            raise ValueError("Owner must be a non-empty string")
        
        if balance < 0:
            raise ValueError(f"Initial balance cannot be negative, got {balance}")
        
        self.owner = owner.strip()    # Strip whitespace from name
        self.balance = float(balance) # Always store as float for consistency
        self.transactions = []        # Initialize empty transaction history


# Valid account
account = BankAccount("Alice", 1000)
print(account.balance)  # 1000.0

# Invalid accounts — these raise ValueError
try:
    bad_account = BankAccount("Bob", -500)
except ValueError as e:
    print(f"Error: {e}")  # Error: Initial balance cannot be negative, got -500

try:
    empty_account = BankAccount("")
except ValueError as e:
    print(f"Error: {e}")  # Error: Owner must be a non-empty string
```

### The `__init__` vs `__new__` Distinction

```python
# ============================================================
# __new__ vs __init__ (Advanced Understanding)
# ============================================================
# __new__ actually CREATES the object (allocates memory)
# __init__ INITIALIZES the object (sets up state)
# 
# You rarely need to override __new__ — it's for advanced use cases
# like creating immutable types (int, str) or singletons.
# ============================================================

class Singleton:
    """
    A class that only ever creates ONE instance.
    This demonstrates __new__ — an advanced use case.
    """
    _instance = None   # Class variable to hold the single instance

    def __new__(cls, *args, **kwargs):
        """
        __new__ receives the CLASS (cls) not the instance (self).
        It must RETURN the new instance.
        """
        if cls._instance is None:
            # Only create a new instance if one doesn't exist
            cls._instance = super().__new__(cls)
            print("Creating new instance...")
        else:
            print("Returning existing instance...")
        return cls._instance

    def __init__(self, value):
        self.value = value


s1 = Singleton(42)    # "Creating new instance..."
s2 = Singleton(99)    # "Returning existing instance..."

print(s1 is s2)       # True — same object!
print(s1.value)       # 99 — __init__ ran again and updated value
```

---

## 4. Instance Variables vs Class Variables

This is one of the most important distinctions in Python OOP, and a common source of bugs.

```python
# ============================================================
# INSTANCE VARIABLES
# ============================================================
# - Defined inside __init__ using self.variable_name
# - Each object gets its OWN copy
# - Changes to one object don't affect others
# ============================================================

class Counter:
    """Demonstrates instance variables — each object is independent."""

    def __init__(self, start=0):
        self.count = start   # INSTANCE variable — unique to each object


c1 = Counter(0)
c2 = Counter(100)

c1.count += 1
print(c1.count)  # 1
print(c2.count)  # 100 — completely unaffected


# ============================================================
# CLASS VARIABLES
# ============================================================
# - Defined INSIDE the class but OUTSIDE any method
# - Shared by ALL instances of the class
# - Accessed via ClassName.variable or self.variable
# ============================================================

class Dog:
    """Demonstrates class variables — shared across all instances."""

    # CLASS VARIABLE — shared by ALL Dog instances
    species = "Canis lupus familiaris"
    dog_count = 0  # Track how many dogs we've created

    def __init__(self, name, age):
        self.name = name    # INSTANCE variable
        self.age = age      # INSTANCE variable
        
        # Modify the class variable through the class name (best practice)
        Dog.dog_count += 1


rex = Dog("Rex", 3)
bella = Dog("Bella", 5)
max_dog = Dog("Max", 2)

# Class variable — same for all instances
print(rex.species)    # Canis lupus familiaris
print(bella.species)  # Canis lupus familiaris
print(Dog.species)    # Canis lupus familiaris — accessed via class name

# dog_count tracks ALL dogs
print(Dog.dog_count)  # 3 — we created 3 dogs
print(rex.dog_count)  # 3 — same value when accessed via instance


# ============================================================
# THE TRICKY PART: Shadowing Class Variables
# ============================================================
# If you ASSIGN to self.class_variable, Python creates a new
# INSTANCE variable that SHADOWS the class variable.
# The class variable is unchanged!
# ============================================================

class Example:
    shared = "I am shared"    # Class variable

e1 = Example()
e2 = Example()

print(e1.shared)  # "I am shared" — reads from class
print(e2.shared)  # "I am shared" — reads from class

# Now assign to e1.shared — this CREATES an instance variable
e1.shared = "I am e1's own"

print(e1.shared)      # "I am e1's own"  — reads from INSTANCE variable
print(e2.shared)      # "I am shared"    — reads from CLASS variable (unaffected)
print(Example.shared) # "I am shared"    — CLASS variable unchanged

# Check: e1 now has an instance variable 'shared'
print('shared' in e1.__dict__)  # True — instance has its own 'shared'
print('shared' in e2.__dict__)  # False — e2 still uses class variable


# ============================================================
# MUTABLE CLASS VARIABLES — A COMMON BUG
# ============================================================
# Mutable class variables (lists, dicts) are shared AND can be
# modified in place, which affects ALL instances. Be careful!
# ============================================================

class BadStudent:
    """DANGEROUS: Mutable class variable shared by all instances."""
    grades = []  # BUG: This list is shared by ALL students!

    def __init__(self, name):
        self.name = name

    def add_grade(self, grade):
        self.grades.append(grade)  # Modifies the SHARED list!


student1 = BadStudent("Alice")
student2 = BadStudent("Bob")

student1.add_grade(95)
student2.add_grade(80)

print(student1.grades)  # [95, 80] — BOTH grades! Bug!
print(student2.grades)  # [95, 80] — Same list!


class GoodStudent:
    """CORRECT: Each student gets their own grades list."""

    def __init__(self, name):
        self.name = name
        self.grades = []  # INSTANCE variable — each student gets their own list!

    def add_grade(self, grade):
        self.grades.append(grade)


student1 = GoodStudent("Alice")
student2 = GoodStudent("Bob")

student1.add_grade(95)
student2.add_grade(80)

print(student1.grades)  # [95] — Only Alice's grade
print(student2.grades)  # [80] — Only Bob's grade
```

---

## 5. Methods — Functions Inside Classes

Methods are functions defined inside a class. They define what an object can **do**.

```python
# ============================================================
# BASIC METHODS
# ============================================================
# A method is just a function inside a class.
# The only special thing: the first parameter is always 'self'
# which refers to the instance calling the method.
# ============================================================

class Rectangle:
    """A rectangle with various useful methods."""

    def __init__(self, width, height):
        """Initialize with width and height."""
        self.width = width
        self.height = height

    # ---- INSTANCE METHODS ----
    # These operate on the specific object (self)

    def area(self):
        """Return the area of the rectangle."""
        # self.width refers to THIS rectangle's width
        return self.width * self.height

    def perimeter(self):
        """Return the perimeter of the rectangle."""
        return 2 * (self.width + self.height)

    def is_square(self):
        """Return True if this rectangle is actually a square."""
        return self.width == self.height

    def scale(self, factor):
        """
        Scale the rectangle by a factor.
        This MODIFIES the object in place.
        
        Parameters:
            factor (float): The scaling factor
        """
        self.width *= factor
        self.height *= factor

    def scaled(self, factor):
        """
        Return a NEW scaled rectangle without modifying this one.
        This is the IMMUTABLE pattern — doesn't change the original.
        
        Parameters:
            factor (float): The scaling factor
            
        Returns:
            Rectangle: A new Rectangle with scaled dimensions
        """
        return Rectangle(self.width * factor, self.height * factor)

    def describe(self):
        """Print a human-readable description."""
        shape = "square" if self.is_square() else "rectangle"
        print(f"This {shape} is {self.width}x{self.height}")
        print(f"  Area: {self.area()}")
        print(f"  Perimeter: {self.perimeter()}")


# Using the methods
r1 = Rectangle(4, 6)
r1.describe()
# This rectangle is 4x6
# Area: 24
# Perimeter: 20

r2 = Rectangle(5, 5)
print(r2.is_square())  # True

# scale() modifies in place
r1.scale(2)
print(r1.width, r1.height)  # 8.0, 12.0

# scaled() returns a new object
r3 = Rectangle(3, 4)
r4 = r3.scaled(3)
print(r3.width, r3.height)   # 3, 4 — unchanged
print(r4.width, r4.height)   # 9, 12 — new object


# ============================================================
# METHOD CHAINING
# ============================================================
# A pattern where methods return 'self', allowing you to
# chain multiple method calls in one line.
# Very common in builder patterns and libraries like pandas.
# ============================================================

class QueryBuilder:
    """A simple SQL query builder demonstrating method chaining."""

    def __init__(self, table):
        self.table = table
        self._conditions = []
        self._columns = ["*"]
        self._limit = None
        self._order = None

    def select(self, *columns):
        """Choose which columns to retrieve."""
        self._columns = list(columns)
        return self  # ← RETURNING SELF enables chaining

    def where(self, condition):
        """Add a WHERE condition."""
        self._conditions.append(condition)
        return self  # ← Must return self for chaining

    def limit(self, n):
        """Limit the number of results."""
        self._limit = n
        return self

    def order_by(self, column, desc=False):
        """Set the ORDER BY clause."""
        direction = "DESC" if desc else "ASC"
        self._order = f"{column} {direction}"
        return self

    def build(self):
        """Build and return the final SQL query string."""
        cols = ", ".join(self._columns)
        query = f"SELECT {cols} FROM {self.table}"
        
        if self._conditions:
            query += " WHERE " + " AND ".join(self._conditions)
        
        if self._order:
            query += f" ORDER BY {self._order}"
        
        if self._limit:
            query += f" LIMIT {self._limit}"
        
        return query


# Method chaining in action
query = (
    QueryBuilder("users")
    .select("id", "name", "email")
    .where("age > 18")
    .where("active = 1")
    .order_by("name")
    .limit(10)
    .build()
)

print(query)
# SELECT id, name, email FROM users WHERE age > 18 AND active = 1 ORDER BY name ASC LIMIT 10
```

---

## 6. The `self` Parameter — Deep Dive

`self` is one of the most misunderstood concepts for Python beginners. Let's demystify it completely.

```python
# ============================================================
# WHAT IS 'self'?
# ============================================================
# 'self' is NOT a keyword in Python — it's just a convention.
# You could name it anything (but never do — it confuses everyone).
# 
# When you call: my_dog.bark()
# Python translates this to: Dog.bark(my_dog)
# 
# So 'self' IS the object that called the method.
# ============================================================

class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        """When you call rex.bark(), Python sets self = rex."""
        print(f"{self.name} says: Woof!")

    def greet(self, other_dog):
        """self = the calling dog, other_dog = the argument."""
        print(f"{self.name} greets {other_dog.name}!")


rex = Dog("Rex")
bella = Dog("Bella")

# These two lines are IDENTICAL in behavior:
rex.bark()              # Standard way — Python sets self=rex
Dog.bark(rex)           # Explicit way — passing self manually

rex.greet(bella)        # self=rex, other_dog=bella
Dog.greet(rex, bella)   # Identical — explicit self


# ============================================================
# 'self' IS NOT SPECIAL — PROOF
# ============================================================

class WeirdClass:
    # You CAN use any name for the first parameter
    # But PLEASE don't do this in real code!
    
    def __init__(this_object, value):   # 'this_object' instead of 'self'
        this_object.value = value

    def show(me):                        # 'me' instead of 'self'
        print(f"My value is {me.value}")


w = WeirdClass(42)
w.show()  # My value is 42 — works fine!


# ============================================================
# HOW PYTHON RESOLVES self — THE DESCRIPTOR PROTOCOL
# ============================================================
# Functions defined in a class are "descriptors"
# When accessed through an instance, they become "bound methods"
# A bound method automatically passes the instance as the first argument
# ============================================================

class Simple:
    def method(self):
        return "called!"


s = Simple()

# 'method' accessed from class — it's an unbound function
print(type(Simple.method))   # <class 'function'>

# 'method' accessed from instance — it's a BOUND METHOD
print(type(s.method))        # <class 'method'>

# The bound method "remembers" its instance
print(s.method.__self__)     # <__main__.Simple object at 0x...>
print(s.method.__self__ is s)  # True!


# ============================================================
# USING 'self' TO CALL OTHER METHODS
# ============================================================
# Methods can call other methods on the same object using self.method_name()
# This is how you build complex behavior from simple pieces.
# ============================================================

class Circle:
    """
    A circle that demonstrates methods calling other methods.
    """
    import math as _math  # Import inside class (unusual but works)
    PI = 3.141592653589793

    def __init__(self, radius):
        if radius <= 0:
            raise ValueError("Radius must be positive")
        self.radius = radius

    def diameter(self):
        """Diameter = 2 * radius."""
        return 2 * self.radius

    def area(self):
        """Area = π * r²."""
        return Circle.PI * self.radius ** 2

    def circumference(self):
        """Circumference = π * diameter."""
        # Call another method using self — self.diameter() 
        return Circle.PI * self.diameter()

    def is_larger_than(self, other):
        """
        Compare this circle's area to another circle's area.
        'other' is expected to be another Circle instance.
        """
        return self.area() > other.area()

    def scale(self, factor):
        """Return a new circle scaled by factor."""
        return Circle(self.radius * factor)

    def info(self):
        """Print all circle information."""
        print(f"Circle with radius={self.radius:.2f}")
        print(f"  Diameter:      {self.diameter():.4f}")
        print(f"  Area:          {self.area():.4f}")
        print(f"  Circumference: {self.circumference():.4f}")


c1 = Circle(5)
c2 = Circle(3)
c1.info()
print(f"c1 larger than c2? {c1.is_larger_than(c2)}")  # True
```

---

## 7. String Representation — `__str__` and `__repr__`

Every object in Python can have two string representations. Understanding the difference is essential.

```python
# ============================================================
# __str__ vs __repr__
# ============================================================
# __repr__ — "official" representation, meant for DEVELOPERS
#           - Should be unambiguous
#           - Ideally: eval(repr(obj)) == obj
#           - Used in: repr(obj), interactive console, logging
#
# __str__  — "informal" representation, meant for USERS
#           - Should be human-readable and pretty
#           - Used in: print(obj), str(obj), f-strings
#
# If only __repr__ is defined, __str__ falls back to it.
# ============================================================

class Point:
    """A 2D point demonstrating __str__ and __repr__."""

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        """
        Developer representation.
        Ideally you can reconstruct the object: Point(3, 4)
        """
        return f"Point({self.x!r}, {self.y!r})"
        # The !r in f-strings calls repr() on the value
        # For numbers this doesn't matter, but for strings it adds quotes

    def __str__(self):
        """User-friendly representation."""
        return f"({self.x}, {self.y})"


p = Point(3, 4)

print(str(p))    # (3, 4)       — uses __str__
print(repr(p))   # Point(3, 4)  — uses __repr__
print(p)         # (3, 4)       — print() uses __str__

# In a list, repr() is used for each element
points = [Point(1, 2), Point(3, 4)]
print(points)    # [Point(1, 2), Point(3, 4)] — uses __repr__

# In an f-string, __str__ is called by default
print(f"My point: {p}")         # My point: (3, 4)
print(f"My point: {p!r}")       # My point: Point(3, 4) — force repr
print(f"My point: {p!s}")       # My point: (3, 4)      — force str


# ============================================================
# A MORE COMPLEX EXAMPLE: Book
# ============================================================

class Book:
    """A book class with rich string representations."""

    def __init__(self, title, author, year, isbn):
        self.title = title
        self.author = author
        self.year = year
        self.isbn = isbn

    def __repr__(self):
        """
        Unambiguous developer representation.
        Shows all data needed to reconstruct the object.
        """
        return (
            f"Book(title={self.title!r}, author={self.author!r}, "
            f"year={self.year!r}, isbn={self.isbn!r})"
        )

    def __str__(self):
        """Pretty, human-readable representation."""
        return f'"{self.title}" by {self.author} ({self.year})'

    def __format__(self, format_spec):
        """
        __format__ lets you customize behavior with format specifiers.
        This is called when you use format() or f-string format specs.
        """
        if format_spec == "short":
            return f'"{self.title}"'
        elif format_spec == "author":
            return f"{self.author}"
        else:
            return str(self)  # Default: use __str__


book = Book("Clean Code", "Robert Martin", 2008, "978-0132350884")

print(book)                       # "Clean Code" by Robert Martin (2008)
print(repr(book))                 # Book(title='Clean Code', author='Robert Martin', ...)

print(f"Reading: {book}")         # Reading: "Clean Code" by Robert Martin (2008)
print(f"Short: {book:short}")     # Short: "Clean Code"
print(f"Author: {book:author}")   # Author: Robert Martin


# ============================================================
# __bytes__ — The binary representation
# ============================================================

class DataPacket:
    """A network data packet that can be serialized."""

    def __init__(self, data):
        self.data = data

    def __bytes__(self):
        """Convert to bytes for network transmission."""
        return self.data.encode('utf-8')

    def __repr__(self):
        return f"DataPacket({self.data!r})"


packet = DataPacket("Hello, World!")
print(bytes(packet))    # b'Hello, World!'
```

---

## 8. Inheritance — Building on Existing Classes

Inheritance lets you create new classes that **reuse and extend** existing ones. It's the "is-a" relationship.

```python
# ============================================================
# BASIC INHERITANCE
# ============================================================
# Syntax: class ChildClass(ParentClass):
# The child inherits ALL methods and attributes of the parent.
# The parent is also called: base class, superclass
# The child is also called: derived class, subclass
# ============================================================

class Animal:
    """Base class for all animals."""

    def __init__(self, name, species, age):
        self.name = name
        self.species = species
        self.age = age
        self.is_alive = True

    def breathe(self):
        """All animals breathe."""
        print(f"{self.name} breathes...")

    def eat(self, food):
        """All animals eat."""
        print(f"{self.name} eats {food}.")

    def sleep(self):
        """All animals sleep."""
        print(f"{self.name} sleeps.")

    def describe(self):
        """Describe this animal."""
        print(f"{self.name} is a {self.species}, {self.age} years old.")

    def __repr__(self):
        return f"{self.__class__.__name__}(name={self.name!r}, age={self.age})"


class Dog(Animal):
    """
    Dog inherits from Animal.
    Dogs are Animals — they breathe, eat, sleep.
    But they also have dog-specific behaviors.
    """

    def __init__(self, name, breed, age):
        """
        We need to call the parent's __init__ to set up the base
        attributes (name, species, age, is_alive).
        
        super() returns a proxy object that refers to the parent class.
        super().__init__(...) calls Animal.__init__(self, ...)
        """
        super().__init__(name, species="Dog", age=age)
        
        # Add dog-specific attributes AFTER calling super().__init__
        self.breed = breed
        self.tricks = []

    def bark(self):
        """Dogs can bark — Animals in general cannot."""
        print(f"{self.name} says: Woof!")

    def learn_trick(self, trick):
        """Dogs can learn tricks."""
        self.tricks.append(trick)
        print(f"{self.name} learned: {trick}!")

    def show_tricks(self):
        """Show all learned tricks."""
        if self.tricks:
            print(f"{self.name}'s tricks: {', '.join(self.tricks)}")
        else:
            print(f"{self.name} doesn't know any tricks yet.")

    def fetch(self, item):
        """Dogs can fetch."""
        print(f"{self.name} fetches the {item}!")

    def describe(self):
        """
        OVERRIDING the parent's describe() method.
        We call super().describe() to get the base behavior,
        then add dog-specific information.
        """
        super().describe()  # "Rex is a Dog, 3 years old."
        print(f"  Breed: {self.breed}")
        print(f"  Tricks known: {len(self.tricks)}")


class Cat(Animal):
    """Cats are also Animals, but with their own behaviors."""

    def __init__(self, name, breed, age, indoor=True):
        super().__init__(name, species="Cat", age=age)
        self.breed = breed
        self.indoor = indoor
        self.satisfaction = 50  # Cats have a satisfaction level

    def meow(self):
        """Cats meow."""
        print(f"{self.name} says: Meow!")

    def purr(self):
        """Cats purr when happy."""
        if self.satisfaction > 70:
            print(f"{self.name} purrs contentedly...")
        else:
            print(f"{self.name} is not satisfied enough to purr.")

    def pet(self):
        """Petting a cat increases satisfaction."""
        self.satisfaction = min(100, self.satisfaction + 10)
        print(f"{self.name} enjoys being petted. Satisfaction: {self.satisfaction}")

    def ignore(self, who):
        """Cats ignore people."""
        print(f"{self.name} completely ignores {who}.")


# ---- Using the classes ----
rex = Dog("Rex", "German Shepherd", 3)
whiskers = Cat("Whiskers", "Tabby", 5)

# Inherited from Animal:
rex.breathe()      # Rex breathes...
rex.eat("kibble")  # Rex eats kibble.
rex.sleep()        # Rex sleeps.

# Dog-specific:
rex.bark()         # Rex says: Woof!
rex.learn_trick("sit")
rex.learn_trick("shake")
rex.fetch("ball")
rex.describe()

# Cat-specific:
whiskers.meow()
whiskers.pet()
whiskers.pet()
whiskers.pet()
whiskers.purr()    # Now satisfied enough to purr
whiskers.ignore(rex)


# ============================================================
# isinstance() AND issubclass()
# ============================================================
# isinstance(obj, Class) — is obj an instance of Class (or subclass)?
# issubclass(Sub, Super) — is Sub a subclass of Super?
# ============================================================

print(isinstance(rex, Dog))     # True — rex is a Dog
print(isinstance(rex, Animal))  # True — rex is ALSO an Animal (inheritance)
print(isinstance(rex, Cat))     # False — rex is not a Cat

print(issubclass(Dog, Animal))  # True — Dog inherits from Animal
print(issubclass(Cat, Animal))  # True — Cat inherits from Animal
print(issubclass(Dog, Cat))     # False — no relationship between them

# All Python classes ultimately inherit from 'object'
print(issubclass(Dog, object))  # True!
print(issubclass(Animal, object)) # True!


# ============================================================
# MULTI-LEVEL INHERITANCE
# ============================================================
# A subclass can itself be subclassed.
# Chain: GuideDog → Dog → Animal → object
# ============================================================

class GuideDog(Dog):
    """
    A guide dog for visually impaired people.
    Inherits from Dog (which inherits from Animal).
    """

    def __init__(self, name, breed, age, handler):
        super().__init__(name, breed, age)  # Calls Dog.__init__
        self.handler = handler
        self.is_working = False

    def start_work(self):
        """Guide dog begins guiding."""
        self.is_working = True
        print(f"{self.name} is now guiding {self.handler}.")

    def stop_work(self):
        """Guide dog goes off duty."""
        self.is_working = False
        print(f"{self.name} is off duty.")

    def bark(self):
        """
        Guide dogs are trained not to bark while working.
        Override bark() to respect work status.
        """
        if self.is_working:
            print(f"{self.name} is working — no barking!")
        else:
            super().bark()  # Delegate to Dog's bark when off duty


buddy = GuideDog("Buddy", "Labrador", 4, "John")
buddy.breathe()       # From Animal — inherited through Dog
buddy.fetch("ball")   # From Dog
buddy.start_work()
buddy.bark()          # Suppressed — working!
buddy.stop_work()
buddy.bark()          # Normal bark — off duty


# Check the full inheritance chain
print(GuideDog.__mro__)
# (<class 'GuideDog'>, <class 'Dog'>, <class 'Animal'>, <class 'object'>)
```

---

## 9. Multiple Inheritance and MRO

Python supports inheriting from **multiple** parent classes. The Method Resolution Order (MRO) determines which method gets called.

```python
# ============================================================
# MULTIPLE INHERITANCE
# ============================================================
# Syntax: class Child(Parent1, Parent2, Parent3):
# The child inherits from ALL listed parents.
# ============================================================

class Flyable:
    """Mixin for things that can fly."""

    def fly(self):
        print(f"{self.name} is flying!")

    def land(self):
        print(f"{self.name} lands.")

    def altitude(self, meters):
        print(f"{self.name} is at {meters}m altitude.")


class Swimmable:
    """Mixin for things that can swim."""

    def swim(self):
        print(f"{self.name} is swimming!")

    def dive(self, depth):
        print(f"{self.name} dives to {depth}m depth.")


class Duck(Flyable, Swimmable):
    """
    A duck can both fly AND swim.
    Multiple inheritance!
    """

    def __init__(self, name):
        self.name = name

    def quack(self):
        print(f"{self.name} says: Quack!")


donald = Duck("Donald")
donald.quack()          # Duck-specific
donald.fly()            # From Flyable
donald.swim()           # From Swimmable
donald.dive(2)          # From Swimmable
donald.land()           # From Flyable


# ============================================================
# METHOD RESOLUTION ORDER (MRO)
# ============================================================
# When a method is called, Python searches for it in this order:
# 1. The instance itself
# 2. The class
# 3. Parent classes, left-to-right, depth-first, no duplicates
# 
# Python uses the C3 Linearization algorithm to compute MRO.
# You can see the MRO with ClassName.__mro__ or mro() method.
# ============================================================

class A:
    def method(self):
        print("A.method")

class B(A):
    def method(self):
        print("B.method")

class C(A):
    def method(self):
        print("C.method")

class D(B, C):
    pass


# What does D().method() print?
d = D()
d.method()  # "B.method" — B comes before C in D(B, C)

# The full MRO
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)

# MRO tells us the search order:
# 1. D — no method()
# 2. B — found! Stops here


# ============================================================
# THE DIAMOND PROBLEM AND HOW PYTHON SOLVES IT
# ============================================================
# Classic problem in multiple inheritance:
#
#       A
#      / \
#     B   C
#      \ /
#       D
#
# Without MRO, calling A's method via D might call it twice.
# Python's C3 linearization ensures it's called exactly once.
# ============================================================

class Vehicle:
    def start(self):
        print("Vehicle: starting engine...")
    
    def describe(self):
        print(f"I am a {self.__class__.__name__}")


class Car(Vehicle):
    def start(self):
        print("Car: turning key...")
        super().start()   # Will call the NEXT in MRO, not necessarily Vehicle


class ElectricMixin:
    def start(self):
        print("Electric: powering up battery...")
        super().start()   # Continues the MRO chain


class ElectricCar(ElectricMixin, Car):
    def start(self):
        print("ElectricCar: initiating startup sequence...")
        super().start()   # Kicks off the MRO chain


tesla = ElectricCar()
print("MRO:", [c.__name__ for c in ElectricCar.__mro__])
# MRO: ['ElectricCar', 'ElectricMixin', 'Car', 'Vehicle', 'object']

tesla.start()
# ElectricCar: initiating startup sequence...
# Electric: powering up battery...        (ElectricMixin)
# Car: turning key...                     (Car)
# Vehicle: starting engine...             (Vehicle)

# Each super() call goes to the NEXT class in MRO — not necessarily the direct parent.
# This is why cooperative multiple inheritance with super() works so beautifully!


# ============================================================
# SUPER() WITH ARGUMENTS (PYTHON 2 STYLE, STILL VALID)
# ============================================================

class Parent:
    def __init__(self, x):
        self.x = x

class Child(Parent):
    def __init__(self, x, y):
        # super() with no args (Python 3 style — preferred)
        super().__init__(x)
        
        # Python 2 style (still works in Python 3):
        # super(Child, self).__init__(x)
        
        self.y = y


c = Child(1, 2)
print(c.x, c.y)  # 1 2
```

---

## 10. Encapsulation — Hiding Data

Encapsulation means bundling data with the methods that operate on it, and **hiding internal implementation details**.

```python
# ============================================================
# PYTHON'S APPROACH TO ENCAPSULATION
# ============================================================
# Python doesn't have true private access like Java/C++.
# Instead it uses CONVENTIONS:
#
# No underscore:   public    — anyone can use it
# Single underscore _x:      "internal" — "don't touch unless you know what you're doing"
# Double underscore __x:     "name-mangled" — harder to access from outside
#
# Python's philosophy: "we're all adults here"
# The language trusts you. Conventions communicate intent.
# ============================================================

class BankAccount:
    """
    A bank account demonstrating Python's encapsulation conventions.
    """

    def __init__(self, owner, initial_balance):
        self.owner = owner              # PUBLIC — access freely
        self._balance = initial_balance # "PROTECTED" — internal use, be careful
        self.__pin = "1234"             # "PRIVATE" — name-mangled, don't touch
        self._transaction_history = []  # "PROTECTED" internal tracking

    # ---- PUBLIC INTERFACE ----
    # These are the methods users of the class should call

    def deposit(self, amount):
        """Deposit money. Public interface."""
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self._apply_transaction(amount, "deposit")

    def withdraw(self, amount):
        """Withdraw money. Public interface."""
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self._balance:
            raise ValueError(f"Insufficient funds. Balance: {self._balance:.2f}")
        self._apply_transaction(-amount, "withdrawal")

    def get_balance(self):
        """Read-only access to balance."""
        return self._balance

    def get_history(self):
        """Get a COPY of the transaction history (immutable view)."""
        return list(self._transaction_history)  # Return copy, not the actual list

    def change_pin(self, old_pin, new_pin):
        """Change PIN — requires verification."""
        if not self._verify_pin(old_pin):
            raise ValueError("Incorrect current PIN")
        if len(str(new_pin)) != 4:
            raise ValueError("PIN must be 4 digits")
        self.__pin = str(new_pin)
        print("PIN changed successfully.")

    # ---- INTERNAL/PROTECTED METHODS ----
    # Prefixed with _ to signal "internal use"

    def _apply_transaction(self, amount, transaction_type):
        """Internal method to apply a transaction."""
        self._balance += amount
        self._transaction_history.append({
            'type': transaction_type,
            'amount': abs(amount),
            'balance_after': self._balance
        })

    def _verify_pin(self, pin):
        """Internal PIN verification."""
        return str(pin) == self.__pin


account = BankAccount("Alice", 1000)

# Public interface — this is how you SHOULD use the class
account.deposit(500)
account.withdraw(200)
print(account.get_balance())   # 1300.0
print(account.get_history())   # List of transactions

# Accessing "protected" attribute — works but signals you shouldn't
print(account._balance)        # 1300.0 — works, but frowned upon

# Accessing "name-mangled" attribute
# print(account.__pin)         # AttributeError! Can't access directly
# But Python just renamed it:
print(account._BankAccount__pin)  # "1234" — still accessible, just ugly


# ============================================================
# NAME MANGLING IN DETAIL
# ============================================================
# __x (double underscore) gets renamed to _ClassName__x
# This prevents accidental OVERRIDING in subclasses
# ============================================================

class Parent:
    def __init__(self):
        self.__secret = "parent secret"   # Stored as _Parent__secret

    def show(self):
        print(self.__secret)  # Accesses _Parent__secret


class Child(Parent):
    def __init__(self):
        super().__init__()
        self.__secret = "child secret"    # Stored as _Child__secret — DIFFERENT!

    def show_child(self):
        print(self.__secret)  # Accesses _Child__secret


c = Child()
c.show()          # "parent secret" — accesses _Parent__secret (from Parent.show)
c.show_child()    # "child secret"  — accesses _Child__secret

# Both coexist without collision:
print(c.__dict__)
# {'_Parent__secret': 'parent secret', '_Child__secret': 'child secret'}
```

---

## 11. Polymorphism — Many Forms

Polymorphism allows different objects to respond to the **same interface** in different ways.

```python
# ============================================================
# POLYMORPHISM THROUGH METHOD OVERRIDING
# ============================================================
# Different subclasses implement the same method differently.
# Code that uses the interface doesn't need to know the concrete type.
# ============================================================

class Shape:
    """Abstract base for all shapes."""

    def __init__(self, color="white"):
        self.color = color

    def area(self):
        """Every shape has an area — subclasses must implement this."""
        raise NotImplementedError("Subclasses must implement area()")

    def perimeter(self):
        """Every shape has a perimeter."""
        raise NotImplementedError("Subclasses must implement perimeter()")

    def describe(self):
        """Describe the shape — uses polymorphic area() and perimeter()."""
        print(f"{self.__class__.__name__} ({self.color}):")
        print(f"  Area:      {self.area():.4f}")
        print(f"  Perimeter: {self.perimeter():.4f}")


class Circle(Shape):
    PI = 3.141592653589793

    def __init__(self, radius, color="white"):
        super().__init__(color)
        self.radius = radius

    def area(self):
        return Circle.PI * self.radius ** 2

    def perimeter(self):
        return 2 * Circle.PI * self.radius


class Rectangle(Shape):
    def __init__(self, width, height, color="white"):
        super().__init__(color)
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)


class Triangle(Shape):
    def __init__(self, a, b, c, color="white"):
        super().__init__(color)
        self.a = a  # sides
        self.b = b
        self.c = c

    def area(self):
        """Heron's formula."""
        s = self.perimeter() / 2  # semi-perimeter
        return (s * (s-self.a) * (s-self.b) * (s-self.c)) ** 0.5

    def perimeter(self):
        return self.a + self.b + self.c


# Create a mixed list of shapes
shapes = [
    Circle(5, "red"),
    Rectangle(4, 6, "blue"),
    Triangle(3, 4, 5, "green"),
    Circle(2, "yellow"),
    Rectangle(10, 2, "purple"),
]

# POLYMORPHISM IN ACTION:
# The same code (describe(), area()) works on all shapes!
# We don't need to check what type each shape is.
print("=== All Shapes ===")
for shape in shapes:
    shape.describe()         # Works on Circle, Rectangle, Triangle equally
    print()

# Calculate total area — works on any collection of shapes
total = sum(shape.area() for shape in shapes)
print(f"Total area of all shapes: {total:.2f}")

# Find the largest shape
largest = max(shapes, key=lambda s: s.area())
print(f"Largest shape: {largest.__class__.__name__} with area {largest.area():.2f}")


# ============================================================
# DUCK TYPING — Python's Implicit Polymorphism
# ============================================================
# "If it walks like a duck and quacks like a duck, it's a duck."
# Python doesn't require inheritance for polymorphism.
# If an object has the right methods, it can be used anywhere.
# ============================================================

class Duck:
    def speak(self):
        return "Quack!"
    
    def walk(self):
        return "Waddle waddle"


class Person:
    def speak(self):
        return "Hello!"
    
    def walk(self):
        return "Step step"


class Robot:
    def speak(self):
        return "BEEP BOOP"
    
    def walk(self):
        return "Clank clank"


def make_walk_and_speak(entity):
    """
    This function works on ANY object that has speak() and walk().
    No inheritance required! This is duck typing.
    """
    print(f"{entity.__class__.__name__}: {entity.walk()} — {entity.speak()}")


# Works on completely unrelated classes
for thing in [Duck(), Person(), Robot()]:
    make_walk_and_speak(thing)


# ============================================================
# OPERATOR POLYMORPHISM
# ============================================================
# Python operators (+, *, etc.) work differently on different types.
# This is built-in polymorphism.
# ============================================================

print(1 + 2)              # 3        — integer addition
print("hello" + " world") # hello world — string concatenation
print([1,2] + [3,4])      # [1,2,3,4] — list concatenation

# The + operator calls __add__ — each type implements it differently
print((1).__add__(2))          # 3
print("hello".__add__(" world")) # hello world
```

---

## 12. Abstraction — Abstract Base Classes

Abstract Base Classes (ABCs) formally define **interfaces** — contracts that subclasses must fulfill.

```python
# ============================================================
# ABSTRACT BASE CLASSES (ABCs)
# ============================================================
# An abstract class:
# - Cannot be instantiated directly
# - Defines abstract methods that subclasses MUST implement
# - Provides a formal interface/contract
#
# Module: abc (Abstract Base Classes)
# ============================================================

from abc import ABC, abstractmethod


class Animal(ABC):
    """
    Abstract base class for all animals.
    
    Defines the interface that all concrete animal classes must implement.
    Cannot be instantiated directly.
    """

    def __init__(self, name, age):
        self.name = name
        self.age = age

    @abstractmethod
    def speak(self):
        """
        All animals must be able to speak.
        This is ABSTRACT — subclasses MUST override it.
        If a subclass doesn't, Python raises TypeError on instantiation.
        """
        pass

    @abstractmethod
    def move(self):
        """All animals must be able to move."""
        pass

    # Non-abstract methods — concrete, inherited as-is
    def breathe(self):
        """All animals breathe the same way (in this simplified model)."""
        print(f"{self.name} breathes.")

    def describe(self):
        """Uses abstract methods — relies on subclass implementations."""
        print(f"I am {self.name}, I say '{self.speak()}' and I move by: {self.move()}")


# Trying to instantiate Animal raises TypeError:
try:
    a = Animal("Generic", 5)
except TypeError as e:
    print(f"Error: {e}")
# Error: Can't instantiate abstract class Animal with abstract methods move, speak


class Dog(Animal):
    """Concrete Dog class — implements all abstract methods."""

    def speak(self):
        return "Woof!"

    def move(self):
        return "running on four legs"


class Bird(Animal):
    """Concrete Bird class."""

    def speak(self):
        return "Tweet!"

    def move(self):
        return "flying with wings"


class Fish(Animal):
    """Concrete Fish class."""

    def speak(self):
        return "..."

    def move(self):
        return "swimming with fins"


# Now these work fine — they implement all abstract methods
dog = Dog("Rex", 3)
bird = Bird("Tweety", 1)
fish = Fish("Nemo", 2)

for animal in [dog, bird, fish]:
    animal.describe()
    animal.breathe()


# ============================================================
# ABSTRACT PROPERTIES
# ============================================================

class Vehicle(ABC):
    """Abstract vehicle with abstract properties."""

    def __init__(self, make, model):
        self.make = make
        self.model = model

    @property
    @abstractmethod
    def fuel_type(self):
        """Subclasses must define what fuel they use."""
        pass

    @property
    @abstractmethod
    def max_speed(self):
        """Subclasses must define max speed in km/h."""
        pass

    @abstractmethod
    def start_engine(self):
        pass

    def describe(self):
        print(f"{self.make} {self.model}")
        print(f"  Fuel:      {self.fuel_type}")
        print(f"  Max Speed: {self.max_speed} km/h")


class GasCar(Vehicle):
    @property
    def fuel_type(self):
        return "Gasoline"

    @property
    def max_speed(self):
        return 200

    def start_engine(self):
        print(f"{self.make} {self.model}: Vroom!")


class ElectricCar(Vehicle):
    @property
    def fuel_type(self):
        return "Electric"

    @property
    def max_speed(self):
        return 250

    def start_engine(self):
        print(f"{self.make} {self.model}: *silent whirring*")


car1 = GasCar("Toyota", "Camry")
car2 = ElectricCar("Tesla", "Model S")

car1.describe()
car2.describe()
car1.start_engine()
car2.start_engine()


# ============================================================
# ABSTRACT CLASS METHODS AND STATIC METHODS
# ============================================================

class DataProcessor(ABC):
    """Abstract data processor."""

    @classmethod
    @abstractmethod
    def from_file(cls, filepath):
        """All processors must be creatable from a file."""
        pass

    @staticmethod
    @abstractmethod
    def validate(data):
        """All processors must be able to validate data."""
        pass

    @abstractmethod
    def process(self, data):
        """All processors must implement processing logic."""
        pass


class CSVProcessor(DataProcessor):
    def __init__(self, delimiter=","):
        self.delimiter = delimiter

    @classmethod
    def from_file(cls, filepath):
        """Create a CSVProcessor and load data from file."""
        processor = cls()
        print(f"Loading CSV from {filepath}")
        return processor

    @staticmethod
    def validate(data):
        """Validate that data is a list of lists."""
        return isinstance(data, list) and all(isinstance(row, list) for row in data)

    def process(self, data):
        """Process CSV data."""
        print(f"Processing {len(data)} rows with delimiter '{self.delimiter}'")
        return [self.delimiter.join(str(cell) for cell in row) for row in data]


processor = CSVProcessor.from_file("data.csv")
data = [[1, "Alice", 95], [2, "Bob", 87]]
print(CSVProcessor.validate(data))  # True
result = processor.process(data)
print(result)  # ['1,Alice,95', '2,Bob,87']
```

---

## 13. Magic Methods (Dunder Methods)

Magic methods (surrounded by double underscores) let you define how objects behave with built-in Python operations.

```python
# ============================================================
# MAGIC METHODS (DUNDER METHODS)
# ============================================================
# "Dunder" = Double UNDERscore
# These methods are called AUTOMATICALLY by Python in specific situations.
# They allow your objects to integrate with Python's syntax and built-ins.
# ============================================================


class Vector:
    """
    A 2D mathematical vector demonstrating many magic methods.
    This shows how to make your class behave like a built-in type.
    """

    def __init__(self, x, y):
        """Initialization."""
        self.x = x
        self.y = y

    # ============================================================
    # REPRESENTATION METHODS
    # ============================================================

    def __repr__(self):
        """Developer representation."""
        return f"Vector({self.x!r}, {self.y!r})"

    def __str__(self):
        """User-friendly representation."""
        return f"<{self.x}, {self.y}>"

    # ============================================================
    # ARITHMETIC OPERATORS
    # ============================================================

    def __add__(self, other):
        """self + other  →  v1 + v2"""
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        return NotImplemented  # Let Python try other.radd(self)

    def __radd__(self, other):
        """other + self  (called when other doesn't know how to add Vector)"""
        return self.__add__(other)  # Addition is commutative for vectors

    def __sub__(self, other):
        """self - other  →  v1 - v2"""
        if isinstance(other, Vector):
            return Vector(self.x - other.x, self.y - other.y)
        return NotImplemented

    def __mul__(self, scalar):
        """self * scalar  →  v * 3  (scalar multiplication)"""
        if isinstance(scalar, (int, float)):
            return Vector(self.x * scalar, self.y * scalar)
        return NotImplemented

    def __rmul__(self, scalar):
        """scalar * self  →  3 * v"""
        return self.__mul__(scalar)  # Multiplication is commutative

    def __truediv__(self, scalar):
        """self / scalar  →  v / 2"""
        if isinstance(scalar, (int, float)):
            if scalar == 0:
                raise ZeroDivisionError("Cannot divide vector by zero")
            return Vector(self.x / scalar, self.y / scalar)
        return NotImplemented

    def __neg__(self):
        """-self  →  -v  (unary negation)"""
        return Vector(-self.x, -self.y)

    def __pos__(self):
        """+self  →  +v  (unary positive)"""
        return Vector(self.x, self.y)

    def __abs__(self):
        """abs(self)  →  |v|  (magnitude)"""
        return (self.x**2 + self.y**2) ** 0.5

    # ============================================================
    # COMPARISON OPERATORS
    # ============================================================

    def __eq__(self, other):
        """self == other"""
        if isinstance(other, Vector):
            return self.x == other.x and self.y == other.y
        return NotImplemented

    def __ne__(self, other):
        """self != other  (Python can auto-generate from __eq__)"""
        result = self.__eq__(other)
        if result is NotImplemented:
            return result
        return not result

    def __lt__(self, other):
        """self < other  (compare by magnitude)"""
        if isinstance(other, Vector):
            return abs(self) < abs(other)
        return NotImplemented

    def __le__(self, other):
        """self <= other"""
        return abs(self) <= abs(other)

    def __gt__(self, other):
        """self > other"""
        return abs(self) > abs(other)

    def __ge__(self, other):
        """self >= other"""
        return abs(self) >= abs(other)

    # ============================================================
    # CONTAINER/SEQUENCE METHODS
    # ============================================================

    def __len__(self):
        """len(self)  →  number of components"""
        return 2  # A 2D vector always has 2 components

    def __getitem__(self, index):
        """self[index]  →  allows v[0] and v[1]"""
        if index == 0:
            return self.x
        elif index == 1:
            return self.y
        else:
            raise IndexError(f"Vector index {index} out of range (0-1)")

    def __setitem__(self, index, value):
        """self[index] = value"""
        if index == 0:
            self.x = value
        elif index == 1:
            self.y = value
        else:
            raise IndexError(f"Vector index {index} out of range")

    def __iter__(self):
        """for x in self  →  makes Vector iterable"""
        yield self.x   # yield turns this into a generator
        yield self.y

    def __contains__(self, value):
        """value in self  →  checks if value is a component"""
        return value == self.x or value == self.y

    # ============================================================
    # BOOLEAN AND HASH
    # ============================================================

    def __bool__(self):
        """bool(self)  →  False if zero vector, True otherwise"""
        return self.x != 0 or self.y != 0

    def __hash__(self):
        """
        hash(self)  →  makes Vector hashable (usable in sets/dicts)
        IMPORTANT: If you define __eq__, you MUST define __hash__ too.
        Objects that compare equal must have the same hash.
        """
        return hash((self.x, self.y))

    # ============================================================
    # CONTEXT MANAGER (__enter__ and __exit__)
    # ============================================================
    # These allow use with the 'with' statement.
    # We'll show a better example in a dedicated class below.

    # ============================================================
    # ADDITIONAL ARITHMETIC ASSIGNMENTS (IN-PLACE)
    # ============================================================

    def __iadd__(self, other):
        """self += other"""
        if isinstance(other, Vector):
            self.x += other.x
            self.y += other.y
            return self
        return NotImplemented

    def __imul__(self, scalar):
        """self *= scalar"""
        if isinstance(scalar, (int, float)):
            self.x *= scalar
            self.y *= scalar
            return self
        return NotImplemented


# ---- Using all the magic methods ----
v1 = Vector(2, 3)
v2 = Vector(1, -1)

print(v1)           # <2, 3>
print(repr(v1))     # Vector(2, 3)

# Arithmetic
print(v1 + v2)      # <3, 2>
print(v1 - v2)      # <1, 4>
print(v1 * 3)       # <6, 9>
print(3 * v1)       # <6, 9>   — __rmul__
print(v1 / 2)       # <1.0, 1.5>
print(-v1)          # <-2, -3>
print(abs(v1))      # 3.605551275...

# Comparison
print(v1 == Vector(2, 3))   # True
print(v1 == v2)             # False
print(v1 > v2)              # True (larger magnitude)

# Container behavior
print(len(v1))              # 2
print(v1[0], v1[1])         # 2 3
v1[0] = 10
print(v1)                   # <10, 3>

for component in v1:
    print(component)        # 10, then 3

print(10 in v1)             # True
print(99 in v1)             # False

# Boolean
print(bool(Vector(0, 0)))   # False — zero vector
print(bool(Vector(1, 0)))   # True

# Hashable — can use in set/dict
vector_set = {Vector(1, 2), Vector(3, 4), Vector(1, 2)}
print(len(vector_set))      # 2 — duplicates removed

# In-place operations
v = Vector(1, 2)
v += Vector(3, 4)
print(v)                    # <4, 6>


# ============================================================
# CONTEXT MANAGERS — __enter__ and __exit__
# ============================================================

class DatabaseConnection:
    """
    A simulated database connection demonstrating context manager protocol.
    Allows use with 'with' statement for automatic cleanup.
    """

    def __init__(self, host, port=5432):
        self.host = host
        self.port = port
        self.connection = None
        self.is_connected = False

    def __enter__(self):
        """
        Called when entering the 'with' block.
        Should return the resource to be used.
        """
        print(f"Connecting to {self.host}:{self.port}...")
        self.is_connected = True
        self.connection = {"host": self.host, "port": self.port}
        print("Connection established.")
        return self  # 'as' variable in 'with' will reference this

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Called when leaving the 'with' block (even if exception occurred).
        
        Parameters:
            exc_type: Exception type (None if no exception)
            exc_val:  Exception value (None if no exception)
            exc_tb:   Exception traceback (None if no exception)
        
        Return True to suppress the exception, False/None to propagate it.
        """
        if exc_type is not None:
            print(f"An error occurred: {exc_val}")
            # We'll still close the connection even if there was an error
        
        print("Closing database connection...")
        self.is_connected = False
        self.connection = None
        print("Connection closed.")
        
        return False  # Don't suppress exceptions

    def query(self, sql):
        """Execute a query."""
        if not self.is_connected:
            raise RuntimeError("Not connected to database!")
        print(f"Executing: {sql}")
        return [{"id": 1, "name": "Alice"}]  # Fake result


# Using the context manager
with DatabaseConnection("localhost") as db:
    results = db.query("SELECT * FROM users")
    print(f"Got {len(results)} results")
# Connection automatically closed here, even if an exception occurred

print(f"After with: connected = {db.is_connected}")  # False


# ============================================================
# __call__ — Making Objects Callable
# ============================================================

class Multiplier:
    """
    An object that can be CALLED like a function.
    __call__ is invoked when you do: obj(args)
    """

    def __init__(self, factor):
        self.factor = factor

    def __call__(self, value):
        """This is called when you do: multiplier_object(value)"""
        return value * self.factor


double = Multiplier(2)
triple = Multiplier(3)

print(double(5))     # 10  — calls double.__call__(5)
print(triple(5))     # 15
print(callable(double))  # True — double IS callable


class Accumulator:
    """Callable that accumulates values."""

    def __init__(self):
        self.total = 0
        self.calls = 0

    def __call__(self, value):
        self.total += value
        self.calls += 1
        return self.total


acc = Accumulator()
print(acc(10))   # 10
print(acc(20))   # 30
print(acc(5))    # 35
print(f"Called {acc.calls} times, total = {acc.total}")


# ============================================================
# __del__ — Destructor
# ============================================================

class Resource:
    """
    Demonstrates __del__ — called when object is garbage collected.
    WARNING: Don't rely on __del__ for critical cleanup — use context managers.
    """

    def __init__(self, name):
        self.name = name
        print(f"Resource '{self.name}' created.")

    def __del__(self):
        """Called when the object is about to be garbage collected."""
        print(f"Resource '{self.name}' is being cleaned up.")


r = Resource("important_file")
del r   # Explicitly delete — triggers __del__
# Resource 'important_file' is being cleaned up.
```

---

## 14. Properties — Getters, Setters, Deleters

Properties let you add logic to attribute access while maintaining a clean API.

```python
# ============================================================
# THE PROPERTY DECORATOR
# ============================================================
# Properties let you use method-like logic with attribute-like syntax.
# 
# Without properties: obj.get_temperature()
# With properties:    obj.temperature  (looks like an attribute!)
#
# This is the Pythonic way to add validation and computed attributes.
# ============================================================

class Temperature:
    """
    A temperature class with validated properties.
    Demonstrates getter, setter, and deleter.
    """

    # Absolute zero in Celsius
    ABSOLUTE_ZERO = -273.15

    def __init__(self, celsius=0):
        # Note: We're calling the SETTER here (not storing directly)
        # This runs validation even during __init__
        self.celsius = celsius   # This calls the setter below

    @property
    def celsius(self):
        """
        GETTER — called when you READ self.celsius
        Returns the internal value.
        """
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        """
        SETTER — called when you WRITE self.celsius = value
        Validates the value before storing it.
        """
        if value < Temperature.ABSOLUTE_ZERO:
            raise ValueError(
                f"Temperature cannot be below absolute zero "
                f"({Temperature.ABSOLUTE_ZERO}°C), got {value}°C"
            )
        self._celsius = float(value)   # Store internally as _celsius

    @celsius.deleter
    def celsius(self):
        """
        DELETER — called when you do: del self.celsius
        Usually you'd reset to a default rather than truly delete.
        """
        print("Resetting temperature to 0°C")
        self._celsius = 0.0

    @property
    def fahrenheit(self):
        """
        COMPUTED PROPERTY — no setter, read-only.
        Converts Celsius to Fahrenheit on the fly.
        """
        return self._celsius * 9/5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        """Allow setting temperature via Fahrenheit."""
        self.celsius = (value - 32) * 5/9  # Convert and use celsius setter

    @property
    def kelvin(self):
        """Kelvin — always positive, read-only conversion."""
        return self._celsius - Temperature.ABSOLUTE_ZERO

    @property
    def is_freezing(self):
        """Computed boolean property."""
        return self._celsius <= 0

    @property
    def is_boiling(self):
        """Is water boiling at this temperature (at sea level)?"""
        return self._celsius >= 100

    def __repr__(self):
        return f"Temperature({self._celsius}°C)"

    def __str__(self):
        return f"{self._celsius:.1f}°C ({self.fahrenheit:.1f}°F, {self.kelvin:.1f}K)"


# Using properties
t = Temperature(25)
print(t)                  # 25.0°C (77.0°F, 298.1K)
print(t.celsius)          # 25.0 — getter
print(t.fahrenheit)       # 77.0 — computed property
print(t.kelvin)           # 298.15

# Setter with validation
t.celsius = 100
print(t.is_boiling)       # True

t.fahrenheit = 32         # Use fahrenheit setter
print(t.celsius)          # 0.0

del t.celsius             # Triggers deleter
print(t.celsius)          # 0.0 — reset to default

# Validation prevents invalid values
try:
    t.celsius = -300      # Below absolute zero!
except ValueError as e:
    print(f"Error: {e}")


# ============================================================
# PROPERTIES FOR VALIDATION AND COMPUTED ATTRIBUTES
# ============================================================

class Person:
    """
    A person with validated properties.
    """

    def __init__(self, name, age, email):
        # These call the setters, which validate
        self.name = name
        self.age = age
        self.email = email

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("Name must be a string")
        if not value.strip():
            raise ValueError("Name cannot be empty")
        self._name = value.strip().title()  # Auto-capitalize

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if not isinstance(value, int):
            raise TypeError("Age must be an integer")
        if not (0 <= value <= 150):
            raise ValueError(f"Age {value} is not realistic (0-150)")
        self._age = value

    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, value):
        if not isinstance(value, str):
            raise TypeError("Email must be a string")
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError(f"Invalid email: {value}")
        self._email = value.lower()

    @property
    def is_adult(self):
        """Computed property — no setter."""
        return self._age >= 18

    @property
    def birth_year(self):
        """Computed from age (approximate)."""
        from datetime import datetime
        return datetime.now().year - self._age

    @property
    def initials(self):
        """Get initials from name."""
        return ".".join(word[0] for word in self._name.split()) + "."

    def __repr__(self):
        return f"Person(name={self._name!r}, age={self._age}, email={self._email!r})"


alice = Person("alice smith", 30, "ALICE@EXAMPLE.COM")
print(alice.name)       # Alice Smith (auto-capitalized)
print(alice.email)      # alice@example.com (lowercased)
print(alice.is_adult)   # True
print(alice.initials)   # A.S.


# ============================================================
# PROPERTY WITHOUT DECORATOR (LOWER-LEVEL)
# ============================================================

class Square:
    """
    Shows property() function directly (less common, but good to know).
    """

    def __init__(self, side):
        self._side = side

    def _get_side(self):
        return self._side

    def _set_side(self, value):
        if value < 0:
            raise ValueError("Side cannot be negative")
        self._side = value

    def _del_side(self):
        del self._side

    # Create property using the built-in property() function
    side = property(
        fget=_get_side,     # Getter
        fset=_set_side,     # Setter
        fdel=_del_side,     # Deleter
        doc="The side length of the square"  # Docstring
    )

    @property
    def area(self):
        return self._side ** 2


s = Square(5)
print(s.side)   # 5
s.side = 10
print(s.area)   # 100
help(Square.side)  # Shows docstring
```

---

## 15. Class Methods and Static Methods

Python has three types of methods: instance methods, class methods, and static methods.

```python
# ============================================================
# THREE TYPES OF METHODS
# ============================================================
# 1. Instance methods   — def method(self, ...)
#    - Access/modify instance AND class state
#    - First param: self (the instance)
#    - Called on: instance (and can be called on class)
#
# 2. Class methods      — @classmethod / def method(cls, ...)
#    - Access/modify class state but NOT instance state
#    - First param: cls (the class itself)
#    - Called on: class or instance
#    - Common use: alternative constructors
#
# 3. Static methods     — @staticmethod / def method(...)
#    - No access to instance OR class state
#    - Just a function logically grouped inside the class
#    - No special first parameter
# ============================================================

from datetime import datetime, date


class Date:
    """
    A date class demonstrating all three method types.
    """

    # Class variable
    calendar_system = "Gregorian"

    def __init__(self, year, month, day):
        """Standard constructor."""
        self.year = year
        self.month = month
        self.day = day

    # ---- INSTANCE METHODS ----

    def to_string(self):
        """Standard instance method — uses self."""
        return f"{self.year:04d}-{self.month:02d}-{self.day:02d}"

    def days_until_new_year(self):
        """Calculate days until Jan 1st of next year."""
        new_year = Date(self.year + 1, 1, 1)
        # Use static method on self class
        return Date.days_between(self, new_year)

    # ---- CLASS METHODS — Alternative Constructors ----

    @classmethod
    def from_string(cls, date_string):
        """
        Create a Date from 'YYYY-MM-DD' string.
        
        cls = Date (or whatever class this is called on)
        This is a FACTORY METHOD — an alternative constructor.
        """
        year, month, day = (int(x) for x in date_string.split("-"))
        return cls(year, month, day)   # cls() instead of Date() — supports subclassing

    @classmethod
    def today(cls):
        """Create a Date representing today."""
        today = datetime.now()
        return cls(today.year, today.month, today.day)

    @classmethod
    def from_timestamp(cls, timestamp):
        """Create a Date from a Unix timestamp."""
        dt = datetime.fromtimestamp(timestamp)
        return cls(dt.year, dt.month, dt.day)

    @classmethod
    def set_calendar_system(cls, system):
        """
        Modify class state — affects ALL instances.
        This is what class methods are for!
        """
        cls.calendar_system = system
        print(f"Calendar system changed to: {system}")

    # ---- STATIC METHODS ----

    @staticmethod
    def is_valid_date(year, month, day):
        """
        Validate a date — no self or cls needed.
        Just a utility function that belongs logically with the class.
        """
        if not (1 <= month <= 12):
            return False
        days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        # Handle leap year
        if Date.is_leap_year(year):
            days_in_month[1] = 29
        return 1 <= day <= days_in_month[month - 1]

    @staticmethod
    def is_leap_year(year):
        """Check if a year is a leap year. Pure utility function."""
        return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)

    @staticmethod
    def days_between(date1, date2):
        """Calculate days between two dates using datetime."""
        d1 = date(date1.year, date1.month, date1.day)
        d2 = date(date2.year, date2.month, date2.day)
        return abs((d2 - d1).days)

    def __repr__(self):
        return f"Date({self.year}, {self.month}, {self.day})"

    def __str__(self):
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return f"{months[self.month-1]} {self.day}, {self.year}"


# ---- Using all three method types ----

# Instance method — called on an instance
d1 = Date(2024, 3, 15)
print(d1.to_string())         # 2024-03-15

# Class methods — called on the class (or instance)
d2 = Date.from_string("2024-12-25")    # Alternative constructor
d3 = Date.today()                       # Today's date
d4 = Date.from_timestamp(0)            # Unix epoch

print(d2)  # Dec 25, 2024
print(d3)  # Today's date
print(d4)  # Jan 1, 1970

# Static methods — called on class or instance
print(Date.is_leap_year(2024))    # True
print(Date.is_leap_year(2023))    # False
print(Date.is_valid_date(2024, 2, 29))  # True (2024 is leap year)
print(Date.is_valid_date(2023, 2, 29))  # False (2023 is not)
print(Date.days_between(d1, d2))  # 285

# Class method modifies class state
Date.set_calendar_system("Julian")
print(Date.calendar_system)     # Julian
print(d1.calendar_system)       # Julian — class variable, shared by all!


# ============================================================
# WHY USE cls INSTEAD OF THE CLASS NAME?
# ============================================================
# Using cls (instead of Date) supports SUBCLASSING correctly!

class FancyDate(Date):
    """An extended Date class."""
    
    def __init__(self, year, month, day, note=""):
        super().__init__(year, month, day)
        self.note = note
    
    def __repr__(self):
        return f"FancyDate({self.year}, {self.month}, {self.day}, note={self.note!r})"


# from_string uses cls() internally — so it creates the RIGHT type!
fd = FancyDate.from_string("2024-06-15")
print(type(fd))   # <class 'FancyDate'> — correct!
print(repr(fd))   # FancyDate(2024, 6, 15, note='')

# If from_string used Date() instead of cls(), this would return Date, not FancyDate!
```

---

## 16. Composition vs Inheritance

"Favor composition over inheritance" is one of the most important principles in OOP design.

```python
# ============================================================
# THE PROBLEM WITH DEEP INHERITANCE
# ============================================================
# Inheritance creates a tight coupling between classes.
# Deep hierarchies become fragile and hard to change.
# Composition is often more flexible.
# ============================================================

# ---- INHERITANCE APPROACH ----
class Animal:
    def __init__(self, name):
        self.name = name

class LandAnimal(Animal):
    def walk(self):
        print(f"{self.name} walks")

class WaterAnimal(Animal):
    def swim(self):
        print(f"{self.name} swims")

# What about a duck that walks AND swims?
# We'd need multiple inheritance — this gets complicated fast with many combinations.
class Duck(LandAnimal, WaterAnimal):
    def quack(self):
        print(f"{self.name} quacks")


# ---- COMPOSITION APPROACH ----
# Instead of "is-a" (inheritance), use "has-a" (composition)
# Objects CONTAIN other objects as components

class WalkingAbility:
    """A component that adds walking capability."""
    
    def walk(self, name):
        print(f"{name} walks on land.")

    def run(self, name, speed):
        print(f"{name} runs at {speed} km/h!")


class SwimmingAbility:
    """A component that adds swimming capability."""
    
    def swim(self, name):
        print(f"{name} swims through water.")

    def dive(self, name, depth):
        print(f"{name} dives to {depth}m!")


class FlyingAbility:
    """A component that adds flying capability."""
    
    def fly(self, name):
        print(f"{name} soars through the sky!")

    def glide(self, name):
        print(f"{name} glides on thermals.")


class Animal:
    """
    An animal built through COMPOSITION.
    It receives capability objects and delegates to them.
    """

    def __init__(self, name, *abilities):
        self.name = name
        # Store abilities by type for easy lookup
        self._abilities = {}
        for ability in abilities:
            # Use the ability class name as key
            self._abilities[type(ability).__name__] = ability
    
    def can(self, ability_name):
        """Check if this animal has a specific ability."""
        return ability_name in self._abilities

    def walk(self):
        if 'WalkingAbility' in self._abilities:
            self._abilities['WalkingAbility'].walk(self.name)
        else:
            print(f"{self.name} cannot walk!")

    def swim(self):
        if 'SwimmingAbility' in self._abilities:
            self._abilities['SwimmingAbility'].swim(self.name)
        else:
            print(f"{self.name} cannot swim!")

    def fly(self):
        if 'FlyingAbility' in self._abilities:
            self._abilities['FlyingAbility'].fly(self.name)
        else:
            print(f"{self.name} cannot fly!")


# Build animals with exactly the abilities they need — no complex hierarchy!
duck = Animal("Donald", WalkingAbility(), SwimmingAbility(), FlyingAbility())
dog = Animal("Rex", WalkingAbility())
fish = Animal("Nemo", SwimmingAbility())
eagle = Animal("Aria", WalkingAbility(), FlyingAbility())

duck.walk()   # Donald walks on land.
duck.swim()   # Donald swims through water.
duck.fly()    # Donald soars through the sky!
fish.swim()   # Nemo swims through water.
fish.walk()   # Nemo cannot walk!


# ============================================================
# A MORE REALISTIC COMPOSITION EXAMPLE: Video Game Character
# ============================================================

class HealthComponent:
    """Manages a character's health."""

    def __init__(self, max_health):
        self.max_health = max_health
        self.current_health = max_health

    def take_damage(self, amount):
        self.current_health = max(0, self.current_health - amount)
        return self.current_health

    def heal(self, amount):
        self.current_health = min(self.max_health, self.current_health + amount)

    @property
    def is_alive(self):
        return self.current_health > 0

    @property
    def health_percent(self):
        return (self.current_health / self.max_health) * 100


class InventoryComponent:
    """Manages a character's inventory."""

    def __init__(self, max_size=10):
        self.items = []
        self.max_size = max_size

    def add_item(self, item):
        if len(self.items) >= self.max_size:
            raise RuntimeError("Inventory full!")
        self.items.append(item)
        return True

    def remove_item(self, item):
        if item in self.items:
            self.items.remove(item)
            return True
        return False

    def has_item(self, item):
        return item in self.items


class CombatComponent:
    """Manages combat abilities."""

    def __init__(self, attack_power, defense):
        self.attack_power = attack_power
        self.defense = defense
        self.level = 1

    def calculate_damage(self):
        import random
        # Damage varies by ±20% for some randomness
        base = self.attack_power * self.level
        variance = random.uniform(0.8, 1.2)
        return int(base * variance)

    def calculate_damage_taken(self, raw_damage):
        """Reduce incoming damage by defense."""
        reduced = max(1, raw_damage - self.defense)
        return reduced

    def level_up(self):
        self.level += 1
        self.attack_power = int(self.attack_power * 1.1)  # 10% power increase


class GameCharacter:
    """
    A game character built entirely through composition.
    No inheritance needed — each aspect is a separate component.
    """

    def __init__(self, name, max_health, attack, defense):
        self.name = name
        # Each component is responsible for its own domain
        self.health = HealthComponent(max_health)
        self.inventory = InventoryComponent()
        self.combat = CombatComponent(attack, defense)

    def attack(self, target):
        """Attack another character."""
        if not self.health.is_alive:
            print(f"{self.name} is dead and cannot attack!")
            return

        damage = self.combat.calculate_damage()
        actual_damage = target.combat.calculate_damage_taken(damage)
        target.health.take_damage(actual_damage)

        print(f"{self.name} attacks {target.name} for {actual_damage} damage!")
        print(f"{target.name} HP: {target.health.current_health}/{target.health.max_health}")

        if not target.health.is_alive:
            print(f"{target.name} has been defeated!")

    def pick_up(self, item):
        """Pick up an item."""
        self.inventory.add_item(item)
        print(f"{self.name} picked up {item}.")

    def status(self):
        """Print character status."""
        print(f"=== {self.name} ===")
        print(f"  HP: {self.health.current_health}/{self.health.max_health} ({self.health.health_percent:.0f}%)")
        print(f"  Attack: {self.combat.attack_power}  Defense: {self.combat.defense}")
        print(f"  Level: {self.combat.level}")
        print(f"  Items: {self.inventory.items}")


hero = GameCharacter("Arthur", max_health=100, attack=20, defense=5)
villain = GameCharacter("Mordred", max_health=80, attack=25, defense=3)

hero.pick_up("Magic Sword")
hero.pick_up("Health Potion")

hero.status()
villain.status()

# Battle!
hero.attack(villain)
villain.attack(hero)
hero.attack(villain)
```

---

## 17. Mixins

Mixins are small, focused classes designed to add specific functionality to other classes through multiple inheritance.

```python
# ============================================================
# MIXINS
# ============================================================
# A mixin is a class that:
# - Provides specific, reusable functionality
# - Is NOT meant to be instantiated alone
# - Is meant to be "mixed in" to other classes
# - Usually doesn't have __init__ (or has a minimal one)
# - Is named with "Mixin" suffix by convention
# ============================================================

import json
import pickle


class JSONSerializableMixin:
    """
    Mixin that adds JSON serialization to any class.
    Classes using this mixin can be easily saved/loaded as JSON.
    """

    def to_json(self, pretty=False):
        """Convert object to JSON string."""
        indent = 2 if pretty else None
        return json.dumps(self.__dict__, indent=indent, default=str)

    @classmethod
    def from_json(cls, json_string):
        """Create object from JSON string."""
        data = json.loads(json_string)
        obj = cls.__new__(cls)  # Create without calling __init__
        obj.__dict__.update(data)
        return obj

    def save_to_file(self, filepath):
        """Save object to JSON file."""
        with open(filepath, 'w') as f:
            f.write(self.to_json(pretty=True))
        print(f"Saved to {filepath}")

    @classmethod
    def load_from_file(cls, filepath):
        """Load object from JSON file."""
        with open(filepath, 'r') as f:
            return cls.from_json(f.read())


class LoggableMixin:
    """
    Mixin that adds logging capability to any class.
    Methods decorated with @log_calls will log their invocations.
    """

    def __init__(self):
        self._log = []

    def log(self, message):
        """Add a message to the log."""
        from datetime import datetime
        entry = {
            "timestamp": datetime.now().isoformat(),
            "class": self.__class__.__name__,
            "message": message
        }
        self._log.append(entry)

    def print_log(self):
        """Print the entire log."""
        if not self._log:
            print("No log entries.")
            return
        print(f"=== Log for {self.__class__.__name__} ===")
        for entry in self._log:
            print(f"  [{entry['timestamp']}] {entry['message']}")

    def clear_log(self):
        """Clear the log."""
        self._log = []


class ValidatableMixin:
    """
    Mixin that adds validation infrastructure.
    Subclasses define _validations list.
    """

    def validate(self):
        """Run all validations and return list of errors."""
        errors = []
        validations = getattr(self, '_validations', [])
        
        for field, validator, error_msg in validations:
            value = getattr(self, field, None)
            if not validator(value):
                errors.append(f"{field}: {error_msg}")
        
        return errors

    def is_valid(self):
        """Return True if object passes all validations."""
        return len(self.validate()) == 0


class ComparableMixin:
    """
    Mixin that adds comparison operators based on a single __lt__ method.
    Subclasses only need to implement __lt__ and __eq__.
    """

    def __le__(self, other):
        return self < other or self == other

    def __gt__(self, other):
        return not (self < other or self == other)

    def __ge__(self, other):
        return not (self < other)


class ReprMixin:
    """
    Mixin that auto-generates __repr__ from instance variables.
    """

    def __repr__(self):
        attrs = ", ".join(
            f"{k}={v!r}" 
            for k, v in self.__dict__.items()
            if not k.startswith('_')
        )
        return f"{self.__class__.__name__}({attrs})"


# ============================================================
# USING THE MIXINS
# ============================================================

class Product(JSONSerializableMixin, LoggableMixin, ValidatableMixin, ReprMixin):
    """
    A product class that mixes in multiple behaviors.
    The business logic is focused; extras come from mixins.
    """

    # Validation rules: (field, validator_function, error_message)
    _validations = [
        ('name', lambda x: isinstance(x, str) and len(x) > 0, "Name is required"),
        ('price', lambda x: isinstance(x, (int, float)) and x > 0, "Price must be positive"),
        ('stock', lambda x: isinstance(x, int) and x >= 0, "Stock cannot be negative"),
    ]

    def __init__(self, name, price, stock):
        LoggableMixin.__init__(self)   # Initialize mixin
        self.name = name
        self.price = price
        self.stock = stock
        self.log(f"Product created: {name}")

    def sell(self, quantity):
        """Process a sale."""
        if quantity > self.stock:
            raise ValueError(f"Insufficient stock. Have {self.stock}, need {quantity}")
        self.stock -= quantity
        self.log(f"Sold {quantity} units. Stock: {self.stock}")
        return self.price * quantity

    def restock(self, quantity):
        """Add stock."""
        self.stock += quantity
        self.log(f"Restocked {quantity} units. Stock: {self.stock}")


class Employee(JSONSerializableMixin, ValidatableMixin, ComparableMixin, ReprMixin):
    """An employee class using different mixins."""

    _validations = [
        ('name', lambda x: isinstance(x, str) and len(x) > 0, "Name required"),
        ('salary', lambda x: isinstance(x, (int, float)) and x > 0, "Salary must be positive"),
    ]

    def __init__(self, name, salary, department):
        self.name = name
        self.salary = salary
        self.department = department

    def __lt__(self, other):
        """Compare employees by salary."""
        return self.salary < other.salary

    def __eq__(self, other):
        """Employees are equal if they have the same name and department."""
        return self.name == other.name and self.department == other.department


# Test the product
laptop = Product("Laptop Pro", 999.99, 50)
print(repr(laptop))           # Uses ReprMixin
print(laptop.is_valid())      # True — all fields valid

revenue = laptop.sell(5)
print(f"Revenue: ${revenue:.2f}")
laptop.print_log()            # Shows log entries

# JSON serialization from mixin
json_str = laptop.to_json(pretty=True)
print(json_str)

# Create from JSON
laptop2 = Product.from_json(json_str)
print(repr(laptop2))          # Reconstructed from JSON

# Test employees with comparison mixin
e1 = Employee("Alice", 80000, "Engineering")
e2 = Employee("Bob", 95000, "Engineering")
e3 = Employee("Charlie", 70000, "Marketing")

employees = [e2, e1, e3]
employees.sort()  # Works because of ComparableMixin
for e in employees:
    print(f"{e.name}: ${e.salary:,}")
```

---

## 18. Descriptors

Descriptors are the mechanism behind properties, class methods, and static methods.

```python
# ============================================================
# DESCRIPTORS
# ============================================================
# A descriptor is any object that implements the descriptor protocol:
# __get__(self, obj, objtype=None)  — called on attribute ACCESS
# __set__(self, obj, value)         — called on attribute ASSIGNMENT
# __delete__(self, obj)             — called on attribute DELETION
#
# Data descriptors: implement __get__ AND (__set__ or __delete__)
# Non-data descriptors: only implement __get__
#
# This is how Python's property, classmethod, staticmethod work internally!
# ============================================================


class TypedAttribute:
    """
    A descriptor that enforces type checking.
    Can be used as a class variable to create type-safe attributes.
    """

    def __init__(self, expected_type, allow_none=False):
        self.expected_type = expected_type
        self.allow_none = allow_none
        self.attr_name = None  # Will be set by __set_name__

    def __set_name__(self, owner, name):
        """
        Called automatically when the descriptor is assigned to a class variable.
        'owner' is the class, 'name' is the attribute name.
        Python 3.6+ feature.
        """
        self.attr_name = name
        self.private_name = '_' + name  # Internal storage name

    def __get__(self, obj, objtype=None):
        """Called when the attribute is READ."""
        if obj is None:
            # Accessed from the CLASS, not an instance
            return self  # Return the descriptor itself
        return getattr(obj, self.private_name, None)

    def __set__(self, obj, value):
        """Called when the attribute is WRITTEN."""
        if value is None:
            if self.allow_none:
                setattr(obj, self.private_name, None)
            else:
                raise ValueError(f"{self.attr_name} cannot be None")
        elif not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.attr_name} must be {self.expected_type.__name__}, "
                f"got {type(value).__name__}"
            )
        else:
            setattr(obj, self.private_name, value)

    def __delete__(self, obj):
        """Called when the attribute is DELETED."""
        if hasattr(obj, self.private_name):
            delattr(obj, self.private_name)


class RangeAttribute:
    """A descriptor that enforces a numeric range."""

    def __init__(self, min_val, max_val):
        self.min_val = min_val
        self.max_val = max_val
        self.attr_name = None

    def __set_name__(self, owner, name):
        self.attr_name = name
        self.private_name = '_' + name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, None)

    def __set__(self, obj, value):
        if not (self.min_val <= value <= self.max_val):
            raise ValueError(
                f"{self.attr_name} must be between {self.min_val} and {self.max_val}, "
                f"got {value}"
            )
        setattr(obj, self.private_name, value)


class Person:
    """
    A Person class using descriptors for automatic validation.
    No @property needed — descriptors handle everything!
    """

    # Descriptors as class variables
    name = TypedAttribute(str)
    age = RangeAttribute(0, 150)
    email = TypedAttribute(str, allow_none=True)

    def __init__(self, name, age, email=None):
        # These calls trigger the descriptor __set__ methods
        self.name = name
        self.age = age
        self.email = email

    def __repr__(self):
        return f"Person(name={self.name!r}, age={self.age}, email={self.email!r})"


p = Person("Alice", 30, "alice@example.com")
print(p)  # Person(name='Alice', age=30, email='alice@example.com')

# Validation happens automatically
try:
    p.age = 200  # Out of range
except ValueError as e:
    print(f"Error: {e}")

try:
    p.name = 42  # Wrong type
except TypeError as e:
    print(f"Error: {e}")

try:
    p.name = None  # None not allowed
except ValueError as e:
    print(f"Error: {e}")


# ============================================================
# LAZY LOADING DESCRIPTOR
# ============================================================
# A useful pattern: compute the value only once, then cache it

class LazyProperty:
    """
    A non-data descriptor for lazy property computation.
    The value is computed once and cached on the instance.
    """

    def __init__(self, func):
        self.func = func
        self.attr_name = None

    def __set_name__(self, owner, name):
        self.attr_name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        
        # Check if already computed and cached
        if self.attr_name not in obj.__dict__:
            # Compute and store directly in instance dict
            # This "shadows" the descriptor (non-data descriptors can be shadowed)
            print(f"Computing {self.attr_name} for the first time...")
            obj.__dict__[self.attr_name] = self.func(obj)
        
        return obj.__dict__[self.attr_name]


class Circle:
    """A circle that lazily computes expensive properties."""

    PI = 3.141592653589793

    def __init__(self, radius):
        self.radius = radius

    @LazyProperty
    def area(self):
        """Compute area — only done once, then cached."""
        import time
        time.sleep(0.01)  # Simulate expensive calculation
        return Circle.PI * self.radius ** 2

    @LazyProperty
    def circumference(self):
        """Compute circumference — only done once."""
        return 2 * Circle.PI * self.radius


c = Circle(10)
print(c.area)         # "Computing area for the first time..." then result
print(c.area)         # Cached — no recomputation!
print(c.circumference) # First time
print(c.circumference) # Cached
```

---

## 19. Metaclasses

Metaclasses are "classes of classes" — they define how classes themselves are created and behave.

```python
# ============================================================
# METACLASSES
# ============================================================
# "A metaclass is the class of a class."
# - A regular class defines how instances behave
# - A metaclass defines how CLASSES behave
#
# In Python:
# - type is the default metaclass
# - Every class is an instance of type (or a subclass of type)
# - You can create custom metaclasses by subclassing type
#
# When to use metaclasses:
# - Creating class registries
# - Enforcing class structure (require certain methods)
# - Auto-creating attributes
# - ORMs (like Django's models)
# ============================================================

# First, understand that type() can CREATE classes:
# type(name, bases, dict) creates a new class

MyClass = type('MyClass', (object,), {
    'x': 42,
    'greet': lambda self: f"Hello from {self.__class__.__name__}"
})

obj = MyClass()
print(obj.x)        # 42
print(obj.greet())  # Hello from MyClass
print(type(MyClass))  # <class 'type'>


# ============================================================
# CREATING A CUSTOM METACLASS
# ============================================================

class SingletonMeta(type):
    """
    A metaclass that makes any class a Singleton.
    Any class with metaclass=SingletonMeta can only have ONE instance.
    """
    _instances = {}   # Dict mapping class → single instance

    def __call__(cls, *args, **kwargs):
        """
        __call__ on a metaclass is called when you call the CLASS.
        So SingletonMeta.__call__ runs when you do: MyClass(...)
        """
        if cls not in cls._instances:
            # First time — create the instance normally
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class AppConfig(metaclass=SingletonMeta):
    """Application configuration — only one instance allowed."""

    def __init__(self):
        self.debug = False
        self.database_url = "sqlite:///app.db"
        self.secret_key = "change-me-in-production"


config1 = AppConfig()
config2 = AppConfig()

print(config1 is config2)   # True — same object!
config1.debug = True
print(config2.debug)        # True — same object!


# ============================================================
# METACLASS TO ENFORCE INTERFACE
# ============================================================

class InterfaceEnforcerMeta(type):
    """
    Metaclass that ensures all subclasses implement required methods.
    Raises TypeError at CLASS DEFINITION TIME if methods are missing.
    """

    REQUIRED_METHODS = []  # Subclasses of the metaclass can define this

    def __new__(mcs, name, bases, namespace):
        """
        Called when a new class is being DEFINED.
        
        mcs   — the metaclass
        name  — the class name being defined
        bases — tuple of base classes
        namespace — dict of the class body (methods, class vars, etc.)
        """
        cls = super().__new__(mcs, name, bases, namespace)
        
        # Don't check the base class itself, only subclasses
        if bases:  # If this class has parents (is a subclass)
            required = getattr(cls, 'REQUIRED_METHODS', [])
            missing = [m for m in required if m not in namespace]
            if missing:
                raise TypeError(
                    f"Class '{name}' must implement: {missing}"
                )
        
        return cls


class Plugin(metaclass=InterfaceEnforcerMeta):
    """Base class for all plugins. Subclasses must implement required methods."""
    REQUIRED_METHODS = ['setup', 'execute', 'teardown']

    def setup(self):
        raise NotImplementedError

    def execute(self):
        raise NotImplementedError

    def teardown(self):
        raise NotImplementedError


# This will FAIL at class definition:
try:
    class IncompletePlugin(Plugin):
        def setup(self):
            pass
        # Missing execute and teardown!
except TypeError as e:
    print(f"Error: {e}")


# This will succeed:
class CompletePlugin(Plugin):
    def setup(self):
        print("Plugin setting up...")

    def execute(self):
        print("Plugin executing...")

    def teardown(self):
        print("Plugin tearing down...")


p = CompletePlugin()
p.setup()
p.execute()
p.teardown()


# ============================================================
# METACLASS FOR AUTO-REGISTRATION
# ============================================================

class PluginRegistry(type):
    """
    Metaclass that automatically registers all subclasses.
    Useful for plugin systems, command handlers, etc.
    """
    registry = {}

    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        
        # Register all classes with a 'plugin_name' attribute
        if 'plugin_name' in namespace:
            plugin_name = namespace['plugin_name']
            mcs.registry[plugin_name] = cls
            print(f"Registered plugin: '{plugin_name}' → {name}")
        
        return cls


class BasePlugin(metaclass=PluginRegistry):
    """Base for all auto-registered plugins."""
    pass


class AudioPlugin(BasePlugin):
    plugin_name = "audio"

    def run(self):
        return "Processing audio..."


class VideoPlugin(BasePlugin):
    plugin_name = "video"

    def run(self):
        return "Processing video..."


class ImagePlugin(BasePlugin):
    plugin_name = "image"

    def run(self):
        return "Processing image..."


# Use the registry to look up and create plugins
print("\n=== Plugin Registry ===")
for name, cls in PluginRegistry.registry.items():
    plugin = cls()
    print(f"  {name}: {plugin.run()}")
```

---

## 20. Dataclasses

Python 3.7+ introduced `dataclasses` — a way to create simple data-holding classes with minimal boilerplate.

```python
# ============================================================
# DATACLASSES
# ============================================================
# The @dataclass decorator automatically generates:
# - __init__
# - __repr__
# - __eq__
# - (optionally) __lt__, __hash__, and more
#
# Perfect for classes that are primarily data containers.
# ============================================================

from dataclasses import dataclass, field, InitVar, KW_ONLY
from typing import List, Optional, ClassVar
import dataclasses


# Basic dataclass
@dataclass
class Point:
    """A 2D point — the simplest dataclass."""
    x: float    # Type hints are required for dataclass fields
    y: float

    # Regular method — works normally in dataclasses
    def distance_to(self, other: 'Point') -> float:
        return ((self.x - other.x)**2 + (self.y - other.y)**2) ** 0.5


p1 = Point(1.0, 2.0)
p2 = Point(4.0, 6.0)

print(p1)                    # Point(x=1.0, y=2.0) — __repr__ auto-generated
print(p1 == Point(1.0, 2.0)) # True — __eq__ auto-generated
print(p1.distance_to(p2))    # 5.0


# ============================================================
# DATACLASS OPTIONS
# ============================================================

@dataclass(
    order=True,     # Generate __lt__, __le__, __gt__, __ge__
    frozen=True,    # Make immutable (like a named tuple with type hints)
)
class ImmutablePoint:
    """An immutable, orderable point."""
    x: float
    y: float


p = ImmutablePoint(3.0, 4.0)
print(p)  # ImmutablePoint(x=3.0, y=4.0)

try:
    p.x = 10.0  # Raises FrozenInstanceError!
except Exception as e:
    print(f"Error: {e}")

# Can sort because order=True
points = [ImmutablePoint(3, 4), ImmutablePoint(1, 2), ImmutablePoint(2, 3)]
print(sorted(points))  # Sorted by x, then y


# ============================================================
# FIELD() — FINE-GRAINED CONTROL
# ============================================================

@dataclass
class Inventory:
    """
    A more complex dataclass using field() for control.
    """

    name: str
    price: float
    category: str = "General"   # Default value
    
    # field() allows more control than just a default value
    tags: List[str] = field(default_factory=list)  # ← CORRECT way for mutable defaults
    # tags: List[str] = []  ← This would cause ALL instances to share the same list!
    
    # Fields with init=False are not included in __init__
    stock_count: int = field(default=0, init=False)
    
    # repr=False excludes from __repr__
    _internal_id: str = field(default="", repr=False)
    
    # compare=False excludes from comparison (__eq__, __lt__, etc.)
    last_modified: str = field(default="", compare=False, repr=False)

    # CLASS VARIABLE — not a field (no default)
    # Use ClassVar to distinguish class variables from instance fields
    item_count: ClassVar[int] = 0

    def __post_init__(self):
        """
        Called after __init__ is generated.
        Use for additional initialization and validation.
        """
        # Validation
        if self.price < 0:
            raise ValueError(f"Price cannot be negative: {self.price}")
        
        # Auto-generate internal ID
        import uuid
        self._internal_id = str(uuid.uuid4())[:8]
        
        # Increment class counter
        Inventory.item_count += 1

    def add_tag(self, tag: str):
        self.tags.append(tag)

    def set_stock(self, count: int):
        self.stock_count = count


laptop = Inventory("Laptop Pro", 999.99, "Electronics", tags=["tech", "computer"])
phone = Inventory("Smartphone", 599.99, "Electronics")
book = Inventory("Python Book", 49.99)

laptop.set_stock(10)
phone.add_tag("mobile")
phone.add_tag("tech")

print(laptop)
print(phone)
print(f"Total items created: {Inventory.item_count}")  # 3

# Comparison (based on name, price, category, tags, stock_count)
items = [phone, book, laptop]
items.sort(key=lambda x: x.price)
for item in items:
    print(f"  {item.name}: ${item.price}")


# ============================================================
# DATACLASS INHERITANCE
# ============================================================

@dataclass
class Vehicle:
    make: str
    model: str
    year: int

    def describe(self):
        return f"{self.year} {self.make} {self.model}"


@dataclass
class ElectricVehicle(Vehicle):
    battery_kwh: float
    range_miles: int

    # Inherited fields come FIRST, new fields come after
    # make, model, year, battery_kwh, range_miles

    def efficiency(self):
        return self.battery_kwh / self.range_miles * 1000  # Wh per mile


@dataclass
class Car(Vehicle):
    doors: int = 4
    transmission: str = "automatic"


ev = ElectricVehicle("Tesla", "Model 3", 2023, 75.0, 358)
car = Car("Toyota", "Camry", 2022, doors=4, transmission="automatic")

print(ev)
print(ev.describe())
print(f"Efficiency: {ev.efficiency():.1f} Wh/mile")
print(car)


# ============================================================
# asdict() AND astuple() — UTILITY FUNCTIONS
# ============================================================

from dataclasses import asdict, astuple, fields


print(asdict(ev))
# {'make': 'Tesla', 'model': 'Model 3', 'year': 2023, 'battery_kwh': 75.0, 'range_miles': 358}

print(astuple(ev))
# ('Tesla', 'Model 3', 2023, 75.0, 358)

# Inspect fields
for f in fields(ev):
    print(f"  {f.name}: {f.type} = {getattr(ev, f.name)}")
```

---

## 21. Design Patterns in Python OOP

Design patterns are proven solutions to common software design problems.

```python
# ============================================================
# CREATIONAL PATTERNS
# ============================================================

# --- FACTORY METHOD PATTERN ---
# Define an interface for creating objects, but let subclasses
# decide which class to instantiate.

class Animal:
    def speak(self):
        raise NotImplementedError


class Dog(Animal):
    def speak(self):
        return "Woof!"


class Cat(Animal):
    def speak(self):
        return "Meow!"


class Bird(Animal):
    def speak(self):
        return "Tweet!"


class AnimalFactory:
    """Factory that creates animals by name."""
    
    _registry = {
        'dog': Dog,
        'cat': Cat,
        'bird': Bird,
    }

    @classmethod
    def create(cls, animal_type: str) -> Animal:
        """Create an animal by type name."""
        animal_class = cls._registry.get(animal_type.lower())
        if animal_class is None:
            raise ValueError(f"Unknown animal type: {animal_type}")
        return animal_class()

    @classmethod
    def register(cls, name: str, animal_class):
        """Register a new animal type (Open/Closed Principle)."""
        cls._registry[name.lower()] = animal_class


# Using the factory
for animal_type in ['dog', 'cat', 'bird']:
    animal = AnimalFactory.create(animal_type)
    print(f"{animal.__class__.__name__}: {animal.speak()}")


# --- ABSTRACT FACTORY PATTERN ---
# Create families of related objects.

from abc import ABC, abstractmethod


class Button(ABC):
    @abstractmethod
    def render(self): pass

    @abstractmethod
    def on_click(self): pass


class WindowsButton(Button):
    def render(self): return "[ Windows Button ]"
    def on_click(self): return "Windows click sound: beep"


class MacButton(Button):
    def render(self): return "◉ Mac Button ◉"
    def on_click(self): return "Mac click: pop"


class Checkbox(ABC):
    @abstractmethod
    def render(self): pass


class WindowsCheckbox(Checkbox):
    def render(self): return "[✓] Windows Checkbox"


class MacCheckbox(Checkbox):
    def render(self): return "☑ Mac Checkbox"


class GUIFactory(ABC):
    """Abstract factory — creates a family of related UI components."""
    
    @abstractmethod
    def create_button(self) -> Button: pass
    
    @abstractmethod
    def create_checkbox(self) -> Checkbox: pass


class WindowsFactory(GUIFactory):
    def create_button(self): return WindowsButton()
    def create_checkbox(self): return WindowsCheckbox()


class MacFactory(GUIFactory):
    def create_button(self): return MacButton()
    def create_checkbox(self): return MacCheckbox()


def build_ui(factory: GUIFactory):
    """Build UI without knowing which platform."""
    btn = factory.create_button()
    chk = factory.create_checkbox()
    print(btn.render())
    print(chk.render())
    print(btn.on_click())


print("=== Windows UI ===")
build_ui(WindowsFactory())
print("\n=== Mac UI ===")
build_ui(MacFactory())


# ============================================================
# STRUCTURAL PATTERNS
# ============================================================

# --- DECORATOR PATTERN ---
# Add behavior to objects dynamically without subclassing

class Coffee:
    """Base coffee."""
    
    def description(self):
        return "Basic coffee"
    
    def cost(self):
        return 1.00


class CoffeeDecorator(Coffee):
    """Base decorator — wraps a Coffee object."""
    
    def __init__(self, coffee: Coffee):
        self._coffee = coffee  # Composition!
    
    def description(self):
        return self._coffee.description()
    
    def cost(self):
        return self._coffee.cost()


class Milk(CoffeeDecorator):
    def description(self):
        return self._coffee.description() + ", milk"
    
    def cost(self):
        return self._coffee.cost() + 0.25


class Sugar(CoffeeDecorator):
    def description(self):
        return self._coffee.description() + ", sugar"
    
    def cost(self):
        return self._coffee.cost() + 0.10


class VanillaShot(CoffeeDecorator):
    def description(self):
        return self._coffee.description() + ", vanilla"
    
    def cost(self):
        return self._coffee.cost() + 0.75


# Build a complex order by stacking decorators
my_order = Coffee()
my_order = Milk(my_order)          # Add milk
my_order = Sugar(my_order)         # Add sugar
my_order = VanillaShot(my_order)   # Add vanilla
my_order = Milk(my_order)          # Extra milk!

print(f"\nOrder: {my_order.description()}")
print(f"Cost: ${my_order.cost():.2f}")


# --- OBSERVER PATTERN ---
# Define a one-to-many dependency between objects

class Event:
    """A simple event system (Observer Pattern)."""
    
    def __init__(self):
        self._subscribers = []
    
    def subscribe(self, callback):
        """Register a subscriber."""
        self._subscribers.append(callback)
        return callback  # Return callback so it can be used as decorator
    
    def unsubscribe(self, callback):
        """Remove a subscriber."""
        self._subscribers.remove(callback)
    
    def fire(self, *args, **kwargs):
        """Notify all subscribers."""
        for subscriber in self._subscribers:
            subscriber(*args, **kwargs)


class StockMarket:
    """A stock that fires events when price changes."""
    
    def __init__(self, symbol, price):
        self.symbol = symbol
        self._price = price
        
        # Events — anyone can subscribe to these
        self.price_changed = Event()
        self.price_crashed = Event()
        self.price_surged = Event()
    
    @property
    def price(self):
        return self._price
    
    @price.setter
    def price(self, new_price):
        old_price = self._price
        self._price = new_price
        
        change_pct = (new_price - old_price) / old_price * 100
        
        # Fire events based on what happened
        self.price_changed.fire(self.symbol, old_price, new_price, change_pct)
        
        if change_pct <= -10:
            self.price_crashed.fire(self.symbol, change_pct)
        elif change_pct >= 10:
            self.price_surged.fire(self.symbol, change_pct)


# Create a stock
apple = StockMarket("AAPL", 150.00)

# Subscribe to events
@apple.price_changed.subscribe
def log_change(symbol, old, new, pct):
    print(f"[LOG] {symbol}: ${old:.2f} → ${new:.2f} ({pct:+.1f}%)")

@apple.price_crashed.subscribe
def alert_crash(symbol, pct):
    print(f"� CRASH ALERT: {symbol} dropped {pct:.1f}%!")

@apple.price_surged.subscribe
def alert_surge(symbol, pct):
    print(f"� SURGE ALERT: {symbol} jumped {pct:.1f}%!")

# Trigger events
apple.price = 155.00   # Small increase
apple.price = 170.00   # Big surge — triggers surge alert
apple.price = 153.00   # Big drop — triggers crash alert


# ============================================================
# BEHAVIORAL PATTERNS
# ============================================================

# --- STRATEGY PATTERN ---
# Define a family of algorithms, encapsulate each one, make them interchangeable

from abc import ABC, abstractmethod
from typing import List


class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data: List) -> List:
        pass


class BubbleSort(SortStrategy):
    def sort(self, data: List) -> List:
        data = data.copy()
        n = len(data)
        for i in range(n):
            for j in range(0, n-i-1):
                if data[j] > data[j+1]:
                    data[j], data[j+1] = data[j+1], data[j]
        return data


class QuickSort(SortStrategy):
    def sort(self, data: List) -> List:
        if len(data) <= 1:
            return data
        pivot = data[len(data) // 2]
        left = [x for x in data if x < pivot]
        middle = [x for x in data if x == pivot]
        right = [x for x in data if x > pivot]
        return self.sort(left) + middle + self.sort(right)


class PythonBuiltinSort(SortStrategy):
    def sort(self, data: List) -> List:
        return sorted(data)


class Sorter:
    """Context class that uses a strategy."""
    
    def __init__(self, strategy: SortStrategy):
        self._strategy = strategy
    
    @property
    def strategy(self):
        return self._strategy
    
    @strategy.setter
    def strategy(self, strategy: SortStrategy):
        """Change strategy at runtime!"""
        self._strategy = strategy
    
    def sort(self, data):
        return self._strategy.sort(data)


data = [64, 34, 25, 12, 22, 11, 90]

sorter = Sorter(BubbleSort())
print("Bubble:", sorter.sort(data))

sorter.strategy = QuickSort()    # Switch strategy at runtime!
print("Quick: ", sorter.sort(data))

sorter.strategy = PythonBuiltinSort()
print("Python:", sorter.sort(data))
```

---

## 22. SOLID Principles in Python

SOLID is a set of five design principles for writing maintainable, flexible OOP code.

```python
# ============================================================
# S — Single Responsibility Principle (SRP)
# "A class should have only one reason to change."
# ============================================================

# BAD — One class doing too many things
class BadUserManager:
    def create_user(self, username, email):
        # Creates user
        user = {'username': username, 'email': email}
        # Saves to database
        print(f"Saving {user} to DB")
        # Sends email
        print(f"Sending welcome email to {email}")
        # Logs
        print(f"Logging: Created user {username}")
        return user


# GOOD — Each class has one responsibility
class UserRepository:
    """Responsibility: Data storage for users."""
    
    def save(self, user):
        print(f"DB: Saving user {user['username']}")
        return True
    
    def find_by_email(self, email):
        print(f"DB: Finding user by email {email}")
        return None


class EmailService:
    """Responsibility: Sending emails."""
    
    def send_welcome_email(self, email):
        print(f"Email: Sending welcome to {email}")
    
    def send_password_reset(self, email):
        print(f"Email: Sending password reset to {email}")


class Logger:
    """Responsibility: Logging."""
    
    def log(self, message):
        from datetime import datetime
        print(f"[{datetime.now().isoformat()}] {message}")


class UserService:
    """Responsibility: Coordinating user operations (uses other services)."""
    
    def __init__(self, repo: UserRepository, email: EmailService, logger: Logger):
        self.repo = repo
        self.email = email
        self.logger = logger
    
    def create_user(self, username, email):
        user = {'username': username, 'email': email}
        self.repo.save(user)
        self.email.send_welcome_email(email)
        self.logger.log(f"Created user: {username}")
        return user


service = UserService(UserRepository(), EmailService(), Logger())
service.create_user("alice", "alice@example.com")


# ============================================================
# O — Open/Closed Principle (OCP)
# "Open for extension, closed for modification."
# ============================================================

# BAD — Adding new shapes requires modifying this function
def bad_area_calculator(shape):
    if shape['type'] == 'circle':
        return 3.14 * shape['radius'] ** 2
    elif shape['type'] == 'rectangle':
        return shape['width'] * shape['height']
    # Adding a triangle would require MODIFYING this function!


# GOOD — Add new shapes without changing existing code
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return 3.14159 * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, w, h):
        self.width, self.height = w, h
    def area(self):
        return self.width * self.height

class Triangle(Shape):  # Added without touching Circle or Rectangle!
    def __init__(self, base, height):
        self.base, self.height = base, height
    def area(self):
        return 0.5 * self.base * self.height

def total_area(shapes):
    """Works with ANY shape — open for extension!"""
    return sum(s.area() for s in shapes)

shapes = [Circle(5), Rectangle(4, 6), Triangle(3, 8)]
print(f"Total area: {total_area(shapes):.2f}")


# ============================================================
# L — Liskov Substitution Principle (LSP)
# "Subclasses should be substitutable for their base class."
# ============================================================

# BAD — Square violates LSP by breaking Rectangle's contract
class BadRectangle:
    def __init__(self, w, h):
        self.width = w
        self.height = h
    
    def set_width(self, w):
        self.width = w
    
    def set_height(self, h):
        self.height = h
    
    def area(self):
        return self.width * self.height

class BadSquare(BadRectangle):
    def set_width(self, w):
        self.width = w
        self.height = w   # Breaks the independence that Rectangle implies!
    
    def set_height(self, h):
        self.width = h
        self.height = h


def check_rectangle(rect: BadRectangle):
    """Expects: setting width to 5 and height to 4 gives area 20."""
    rect.set_width(5)
    rect.set_height(4)
    assert rect.area() == 20, f"Expected 20, got {rect.area()}"

r = BadRectangle(1, 1)
check_rectangle(r)  # Passes

s = BadSquare(1, 1)
try:
    check_rectangle(s)  # FAILS — Square violates LSP!
except AssertionError as e:
    print(f"LSP Violation: {e}")  # Expected 20, got 16


# GOOD — Separate hierarchies for genuinely different behaviors
class GoodShape(ABC):
    @abstractmethod
    def area(self): pass

class GoodRectangle(GoodShape):
    def __init__(self, w, h):
        self.width = w
        self.height = h
    def area(self): return self.width * self.height

class GoodSquare(GoodShape):
    def __init__(self, side):
        self.side = side
    def area(self): return self.side ** 2

# Neither inherits from the other — no substitution issues!


# ============================================================
# I — Interface Segregation Principle (ISP)
# "Clients shouldn't be forced to depend on interfaces they don't use."
# ============================================================

# BAD — One huge interface forces all implementors to implement everything
class BadWorker(ABC):
    @abstractmethod
    def work(self): pass
    
    @abstractmethod
    def eat(self): pass    # Robots don't eat!
    
    @abstractmethod
    def sleep(self): pass  # Robots don't sleep!


# GOOD — Small, focused interfaces
class Workable(ABC):
    @abstractmethod
    def work(self): pass

class Eatable(ABC):
    @abstractmethod
    def eat(self): pass

class Sleepable(ABC):
    @abstractmethod
    def sleep(self): pass

class HumanWorker(Workable, Eatable, Sleepable):
    def work(self): print("Human working...")
    def eat(self): print("Human eating...")
    def sleep(self): print("Human sleeping...")

class RobotWorker(Workable):  # Only implements what it needs!
    def work(self): print("Robot working 24/7!")


human = HumanWorker()
robot = RobotWorker()
human.work(); human.eat(); human.sleep()
robot.work()


# ============================================================
# D — Dependency Inversion Principle (DIP)
# "Depend on abstractions, not concretions."
# ============================================================

# BAD — High-level module depends on low-level module
class MySQLDatabase:
    def save(self, data): print(f"MySQL: saving {data}")

class BadOrderService:
    def __init__(self):
        self.db = MySQLDatabase()  # Hardcoded dependency!
    
    def place_order(self, order):
        self.db.save(order)  # What if we switch to PostgreSQL?


# GOOD — Both depend on the abstraction
class Database(ABC):
    @abstractmethod
    def save(self, data): pass
    
    @abstractmethod
    def find(self, id): pass

class MySQLDB(Database):
    def save(self, data): print(f"MySQL: {data}")
    def find(self, id): return f"MySQL result for {id}"

class PostgreSQLDB(Database):
    def save(self, data): print(f"PostgreSQL: {data}")
    def find(self, id): return f"PostgreSQL result for {id}"

class InMemoryDB(Database):   # Great for testing!
    def __init__(self):
        self.data = {}
    def save(self, data): self.data[id(data)] = data
    def find(self, id): return self.data.get(id)

class GoodOrderService:
    def __init__(self, database: Database):  # Depends on ABSTRACTION
        self.db = database                    # Inject the dependency
    
    def place_order(self, order):
        self.db.save(order)


# Easy to swap databases or use mock in tests
service1 = GoodOrderService(MySQLDB())
service2 = GoodOrderService(PostgreSQLDB())
service3 = GoodOrderService(InMemoryDB())  # For testing!

service1.place_order({"id": 1, "item": "Widget"})
service2.place_order({"id": 2, "item": "Gadget"})
```

---

## 23. Advanced Patterns and Real Projects

```python
# ============================================================
# PROJECT 1: A COMPLETE ORM (Object-Relational Mapping) SYSTEM
# ============================================================
# Demonstrates: metaclasses, descriptors, class variables,
# class methods, magic methods, properties

class Field:
    """A field descriptor for ORM models."""
    
    def __init__(self, field_type, required=True, default=None, unique=False):
        self.field_type = field_type
        self.required = required
        self.default = default
        self.unique = unique
        self.name = None
    
    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_field_{name}'
    
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name, self.default)
    
    def __set__(self, obj, value):
        if value is None:
            if self.required and self.default is None:
                raise ValueError(f"Field '{self.name}' is required")
            value = self.default
        elif not isinstance(value, self.field_type):
            try:
                value = self.field_type(value)
            except (ValueError, TypeError):
                raise TypeError(
                    f"Field '{self.name}' expected {self.field_type.__name__}, "
                    f"got {type(value).__name__}"
                )
        setattr(obj, self.private_name, value)


class ModelMeta(type):
    """Metaclass for all Model classes."""
    
    def __new__(mcs, name, bases, namespace):
        fields = {}
        
        # Collect all Field instances from the class body
        for attr_name, attr_value in namespace.items():
            if isinstance(attr_value, Field):
                fields[attr_name] = attr_value
        
        # Also collect inherited fields
        for base in bases:
            if hasattr(base, '_fields'):
                fields.update(base._fields)
        
        namespace['_fields'] = fields
        namespace['_table_name'] = name.lower() + 's'  # Simple pluralization
        
        cls = super().__new__(mcs, name, bases, namespace)
        return cls


class Model(metaclass=ModelMeta):
    """Base class for all ORM models."""
    
    # Simulated database
    _database = {}
    
    def __init__(self, **kwargs):
        # Set all provided values (descriptors handle validation)
        for field_name, field in self._fields.items():
            if field_name in kwargs:
                setattr(self, field_name, kwargs[field_name])
            elif field.default is not None:
                setattr(self, field_name, field.default)
        
        self._id = None  # Will be set on save()
    
    def save(self):
        """Save to the "database"."""
        import uuid
        table = self.__class__._table_name
        
        if table not in Model._database:
            Model._database[table] = {}
        
        if self._id is None:
            self._id = str(uuid.uuid4())[:8]
        
        # Store a copy of the data
        Model._database[table][self._id] = self.to_dict()
        return self
    
    @classmethod
    def find_by_id(cls, id):
        """Find a record by ID."""
        table = cls._table_name
        data = Model._database.get(table, {}).get(id)
        if data:
            obj = cls(**data)
            obj._id = id
            return obj
        return None
    
    @classmethod
    def all(cls):
        """Return all records for this model."""
        table = cls._table_name
        results = []
        for id, data in Model._database.get(table, {}).items():
            obj = cls(**data)
            obj._id = id
            results.append(obj)
        return results
    
    def to_dict(self):
        """Convert to dictionary."""
        return {name: getattr(self, name) for name in self._fields}
    
    def __repr__(self):
        attrs = ", ".join(f"{k}={getattr(self, k)!r}" for k in self._fields)
        return f"{self.__class__.__name__}({attrs})"


# Define actual models using the ORM
class User(Model):
    name = Field(str)
    email = Field(str, unique=True)
    age = Field(int)
    active = Field(bool, default=True)


class Product(Model):
    title = Field(str)
    price = Field(float)
    category = Field(str, default="General")


# Use the ORM
u1 = User(name="Alice", email="alice@example.com", age=30)
u2 = User(name="Bob", email="bob@example.com", age=25)
u1.save()
u2.save()

p1 = Product(title="Laptop", price=999.99, category="Electronics")
p2 = Product(title="Book", price=29.99)
p1.save()
p2.save()

print("All Users:", User.all())
print("All Products:", Product.all())
print("Alice:", User.find_by_id(u1._id))


# ============================================================
# PROJECT 2: EVENT-DRIVEN PLUGIN SYSTEM
# ============================================================

import inspect
from functools import wraps


class EventBus:
    """Central event bus for a plugin system."""
    
    def __init__(self):
        self._listeners = {}
    
    def on(self, event_name):
        """Decorator to register a function as an event listener."""
        def decorator(func):
            if event_name not in self._listeners:
                self._listeners[event_name] = []
            self._listeners[event_name].append(func)
            return func
        return decorator
    
    def emit(self, event_name, *args, **kwargs):
        """Emit an event, calling all registered listeners."""
        if event_name in self._listeners:
            for listener in self._listeners[event_name]:
                listener(*args, **kwargs)
    
    def remove(self, event_name, func):
        """Remove a specific listener."""
        if event_name in self._listeners:
            self._listeners[event_name].remove(func)


bus = EventBus()


class DataPipeline:
    """A data processing pipeline using the event bus."""
    
    def __init__(self, name: str, event_bus: EventBus):
        self.name = name
        self.bus = event_bus
        self.data = []
    
    def load(self, data: list):
        self.data = list(data)
        self.bus.emit('pipeline.loaded', self.name, len(self.data))
        return self
    
    def transform(self, func):
        self.data = [func(item) for item in self.data]
        self.bus.emit('pipeline.transformed', self.name, len(self.data))
        return self
    
    def filter(self, predicate):
        original_count = len(self.data)
        self.data = [item for item in self.data if predicate(item)]
        removed = original_count - len(self.data)
        self.bus.emit('pipeline.filtered', self.name, removed)
        return self
    
    def output(self):
        self.bus.emit('pipeline.completed', self.name, self.data)
        return self.data


# Register event listeners
@bus.on('pipeline.loaded')
def on_loaded(name, count):
    print(f"[EVENT] Pipeline '{name}' loaded {count} items")

@bus.on('pipeline.transformed')
def on_transformed(name, count):
    print(f"[EVENT] Pipeline '{name}' transformed {count} items")

@bus.on('pipeline.filtered')
def on_filtered(name, removed):
    print(f"[EVENT] Pipeline '{name}' filtered out {removed} items")

@bus.on('pipeline.completed')
def on_completed(name, data):
    print(f"[EVENT] Pipeline '{name}' completed with {len(data)} items")

# Run the pipeline
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

result = (
    DataPipeline("numbers", bus)
    .load(numbers)
    .transform(lambda x: x ** 2)
    .filter(lambda x: x > 25)
    .output()
)

print(f"\nResult: {result}")
```

---

## 24. Final Mega Challenge

You've learned everything about Python OOP. Now prove it!

```python
# ============================================================
# � FINAL MEGA CHALLENGE
# ============================================================
# Build a complete Library Management System using ALL concepts
# covered in this tutorial:
# - Classes with __init__, __str__, __repr__
# - Properties with validation
# - Inheritance and polymorphism
# - Abstract base classes
# - Class and static methods
# - Composition
# - Magic methods
# - Descriptors or decorators
# - At least one design pattern
#
# The system should:
# 1. Manage different types of media (Book, DVD, Magazine, EBook)
# 2. Track members (Student, Staff, PremiumMember)
# 3. Handle checkouts and returns with due dates
# 4. Enforce borrowing limits per member type
# 5. Calculate and apply late fees
# 6. Search/filter the catalog
# ============================================================

# ============================================================
# SOLUTION — Study and understand every line
# ============================================================

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from enum import Enum, auto


# ---- ENUMS ----

class MediaStatus(Enum):
    AVAILABLE = auto()
    CHECKED_OUT = auto()
    RESERVED = auto()
    DAMAGED = auto()


class MembershipType(Enum):
    STUDENT = "student"
    STAFF = "staff"
    PREMIUM = "premium"


# ---- MEDIA CLASSES ----

class LibraryMedia(ABC):
    """Abstract base class for all library items."""

    def __init__(self, item_id: str, title: str, year: int):
        self._item_id = item_id
        self._title = title
        self._year = year
        self._status = MediaStatus.AVAILABLE
        self._borrower_id: Optional[str] = None
        self._due_date: Optional[datetime] = None

    @property
    def item_id(self):
        return self._item_id

    @property
    def title(self):
        return self._title

    @property
    def year(self):
        return self._year

    @property
    def status(self):
        return self._status

    @property
    def is_available(self):
        return self._status == MediaStatus.AVAILABLE

    @property
    def due_date(self):
        return self._due_date

    @abstractmethod
    def checkout_duration(self) -> int:
        """Return the number of days this media can be borrowed."""
        pass

    @abstractmethod
    def late_fee_per_day(self) -> float:
        """Return the late fee per day in dollars."""
        pass

    @abstractmethod
    def media_type(self) -> str:
        """Return a string description of the media type."""
        pass

    def checkout(self, member_id: str) -> datetime:
        """Check out this item to a member."""
        if not self.is_available:
            raise RuntimeError(f"'{self.title}' is not available for checkout")
        
        self._status = MediaStatus.CHECKED_OUT
        self._borrower_id = member_id
        self._due_date = datetime.now() + timedelta(days=self.checkout_duration())
        return self._due_date

    def checkin(self) -> float:
        """Return the item and calculate any late fees."""
        if self._status != MediaStatus.CHECKED_OUT:
            raise RuntimeError(f"'{self.title}' is not currently checked out")
        
        late_fee = self._calculate_late_fee()
        self._status = MediaStatus.AVAILABLE
        self._borrower_id = None
        self._due_date = None
        return late_fee

    def _calculate_late_fee(self) -> float:
        """Calculate the late fee."""
        if self._due_date and datetime.now() > self._due_date:
            days_late = (datetime.now() - self._due_date).days
            return days_late * self.late_fee_per_day()
        return 0.0

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self._item_id!r}, title={self._title!r})"

    def __str__(self):
        status = self._status.name
        return f"[{self.media_type()}] {self._title} ({self._year}) — {status}"

    def __eq__(self, other):
        return isinstance(other, LibraryMedia) and self._item_id == other._item_id

    def __hash__(self):
        return hash(self._item_id)


class Book(LibraryMedia):
    def __init__(self, item_id, title, author, isbn, year, pages):
        super().__init__(item_id, title, year)
        self.author = author
        self.isbn = isbn
        self.pages = pages

    def checkout_duration(self): return 21   # 3 weeks
    def late_fee_per_day(self): return 0.25  # $0.25/day
    def media_type(self): return "BOOK"

    def __str__(self):
        return f"[BOOK] '{self._title}' by {self.author} ({self._year})"


class EBook(Book):
    """Electronic book — longer checkout, smaller late fee."""
    
    def __init__(self, item_id, title, author, isbn, year, file_size_mb):
        super().__init__(item_id, title, author, isbn, year, 0)
        self.file_size_mb = file_size_mb

    def checkout_duration(self): return 14    # 2 weeks
    def late_fee_per_day(self): return 0.10   # $0.10/day (digital)
    def media_type(self): return "EBOOK"


class DVD(LibraryMedia):
    def __init__(self, item_id, title, director, year, runtime_min):
        super().__init__(item_id, title, year)
        self.director = director
        self.runtime_min = runtime_min

    def checkout_duration(self): return 7    # 1 week
    def late_fee_per_day(self): return 1.00  # $1/day
    def media_type(self): return "DVD"

    def __str__(self):
        return f"[DVD] '{self._title}' dir. {self.director} ({self._year})"


class Magazine(LibraryMedia):
    def __init__(self, item_id, title, issue, year, month):
        super().__init__(item_id, title, year)
        self.issue = issue
        self.month = month

    def checkout_duration(self): return 7    # 1 week
    def late_fee_per_day(self): return 0.50  # $0.50/day
    def media_type(self): return "MAGAZINE"


# ---- MEMBER CLASSES ----

class LibraryMember(ABC):
    """Abstract base for all library members."""

    def __init__(self, member_id: str, name: str, email: str):
        self._member_id = member_id
        self._name = name
        self._email = email
        self._checked_out: List[LibraryMedia] = []
        self._fine_balance = 0.0
        self._join_date = datetime.now()

    @property
    def member_id(self): return self._member_id
    
    @property
    def name(self): return self._name
    
    @property
    def email(self): return self._email
    
    @property
    def fine_balance(self): return self._fine_balance

    @property
    def checked_out_count(self): return len(self._checked_out)

    @abstractmethod
    def max_items(self) -> int:
        """Maximum number of items this member can borrow."""
        pass

    @abstractmethod
    def membership_type(self) -> MembershipType:
        pass

    def can_borrow(self) -> bool:
        """Can this member borrow more items?"""
        return self.checked_out_count < self.max_items() and self._fine_balance < 10.0

    def borrow(self, item: LibraryMedia) -> datetime:
        """Borrow a library item."""
        if not self.can_borrow():
            if self._fine_balance >= 10.0:
                raise RuntimeError(f"Cannot borrow: outstanding fine of ${self._fine_balance:.2f}")
            raise RuntimeError(f"Checkout limit reached ({self.max_items()} items)")
        
        due_date = item.checkout(self._member_id)
        self._checked_out.append(item)
        return due_date

    def return_item(self, item: LibraryMedia) -> float:
        """Return a borrowed item."""
        if item not in self._checked_out:
            raise RuntimeError(f"'{item.title}' was not checked out by {self._name}")
        
        late_fee = item.checkin()
        self._checked_out.remove(item)
        
        if late_fee > 0:
            self._fine_balance += late_fee
        
        return late_fee

    def pay_fine(self, amount: float):
        """Pay off fine balance."""
        if amount > self._fine_balance:
            amount = self._fine_balance
        self._fine_balance -= amount
        print(f"{self._name} paid ${amount:.2f}. Remaining fine: ${self._fine_balance:.2f}")

    def status(self):
        """Print member status."""
        print(f"=== {self._name} [{self.membership_type().value.upper()}] ===")
        print(f"  ID:         {self._member_id}")
        print(f"  Email:      {self._email}")
        print(f"  Borrowed:   {self.checked_out_count}/{self.max_items()}")
        print(f"  Fine:       ${self._fine_balance:.2f}")
        if self._checked_out:
            print("  Items:")
            for item in self._checked_out:
                print(f"    - {item}")

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self._member_id!r}, name={self._name!r})"

    def __str__(self):
        return f"{self._name} ({self.membership_type().value})"


class StudentMember(LibraryMember):
    def max_items(self): return 3
    def membership_type(self): return MembershipType.STUDENT


class StaffMember(LibraryMember):
    def max_items(self): return 10
    def membership_type(self): return MembershipType.STAFF
    
    @property
    def department(self):
        return getattr(self, '_department', 'Unknown')
    
    @department.setter
    def department(self, value):
        self._department = value


class PremiumMember(LibraryMember):
    def max_items(self): return 7
    def membership_type(self): return MembershipType.PREMIUM
    
    def late_fee_discount(self): return 0.5  # 50% discount on late fees
    
    def return_item(self, item):
        """Premium members get discounted late fees."""
        if item not in self._checked_out:
            raise RuntimeError(f"'{item.title}' was not checked out by {self._name}")
        
        late_fee = item.checkin()
        self._checked_out.remove(item)
        
        discounted_fee = late_fee * (1 - self.late_fee_discount())
        if discounted_fee > 0:
            self._fine_balance += discounted_fee
            print(f"Premium discount applied: ${late_fee:.2f} → ${discounted_fee:.2f}")
        
        return discounted_fee


# ---- LIBRARY (FACADE + REPOSITORY) ----

class Library:
    """
    The main Library class — a Facade over the complex subsystem.
    Uses the Repository pattern for data storage.
    """

    def __init__(self, name: str):
        self.name = name
        self._catalog: Dict[str, LibraryMedia] = {}
        self._members: Dict[str, LibraryMember] = {}
        self._transaction_log: List[dict] = []

    def add_item(self, item: LibraryMedia):
        """Add an item to the catalog."""
        self._catalog[item.item_id] = item

    def add_member(self, member: LibraryMember):
        """Register a new member."""
        self._members[member.member_id] = member

    def checkout(self, member_id: str, item_id: str) -> datetime:
        """Check out an item to a member."""
        member = self._get_member(member_id)
        item = self._get_item(item_id)
        
        due_date = member.borrow(item)
        
        self._log_transaction("checkout", member_id, item_id, {
            "due_date": due_date.isoformat()
        })
        
        print(f"✓ {member.name} checked out '{item.title}'. Due: {due_date.strftime('%Y-%m-%d')}")
        return due_date

    def checkin(self, member_id: str, item_id: str) -> float:
        """Return an item."""
        member = self._get_member(member_id)
        item = self._get_item(item_id)
        
        late_fee = member.return_item(item)
        
        self._log_transaction("checkin", member_id, item_id, {
            "late_fee": late_fee
        })
        
        if late_fee > 0:
            print(f"✓ '{item.title}' returned. Late fee: ${late_fee:.2f}")
        else:
            print(f"✓ '{item.title}' returned on time.")
        
        return late_fee

    def search(self, query: str, media_type: Optional[str] = None) -> List[LibraryMedia]:
        """Search the catalog by title."""
        query = query.lower()
        results = []
        
        for item in self._catalog.values():
            if query in item.title.lower():
                if media_type is None or item.media_type() == media_type.upper():
                    results.append(item)
        
        return results

    def available_items(self, media_type: Optional[str] = None) -> List[LibraryMedia]:
        """Get all available items."""
        results = [item for item in self._catalog.values() if item.is_available]
        if media_type:
            results = [item for item in results if item.media_type() == media_type.upper()]
        return results

    def catalog_summary(self):
        """Print a summary of the catalog."""
        print(f"\n{'='*40}")
        print(f"  {self.name} — Catalog Summary")
        print(f"{'='*40}")
        
        types = {}
        for item in self._catalog.values():
            t = item.media_type()
            types[t] = types.get(t, {'total': 0, 'available': 0})
            types[t]['total'] += 1
            if item.is_available:
                types[t]['available'] += 1
        
        for media_type, counts in sorted(types.items()):
            print(f"  {media_type:10s}: {counts['available']:3d}/{counts['total']:3d} available")
        
        print(f"  {'MEMBERS':10s}: {len(self._members):3d}")
        print(f"{'='*40}\n")

    def _get_member(self, member_id: str) -> LibraryMember:
        if member_id not in self._members:
            raise ValueError(f"Member '{member_id}' not found")
        return self._members[member_id]

    def _get_item(self, item_id: str) -> LibraryMedia:
        if item_id not in self._catalog:
            raise ValueError(f"Item '{item_id}' not found in catalog")
        return self._catalog[item_id]

    def _log_transaction(self, transaction_type, member_id, item_id, extra=None):
        self._transaction_log.append({
            'type': transaction_type,
            'member_id': member_id,
            'item_id': item_id,
            'timestamp': datetime.now().isoformat(),
            **(extra or {})
        })


# ============================================================
# DEMO — RUNNING THE COMPLETE SYSTEM
# ============================================================

def demo():
    # Create the library
    lib = Library("City Public Library")

    # Add items to catalog
    lib.add_item(Book("B001", "Clean Code", "Robert Martin", "978-0132350884", 2008, 464))
    lib.add_item(Book("B002", "The Pragmatic Programmer", "Hunt & Thomas", "978-0201616224", 1999, 352))
    lib.add_item(EBook("E001", "Python Tricks", "Dan Bader", "978-1775093282", 2017, 15.5))
    lib.add_item(DVD("D001", "Inception", "Christopher Nolan", 2010, 148))
    lib.add_item(DVD("D002", "The Matrix", "The Wachowskis", 1999, 136))
    lib.add_item(Magazine("M001", "Science Today", "Issue 45", 2024, "March"))

    # Register members
    lib.add_member(StudentMember("S001", "Alice Johnson", "alice@uni.edu"))
    lib.add_member(StaffMember("ST001", "Dr. Bob Smith", "bob@uni.edu"))
    lib.add_member(PremiumMember("P001", "Carol White", "carol@gmail.com"))

    # Show catalog summary
    lib.catalog_summary()

    # Perform checkouts
    lib.checkout("S001", "B001")
    lib.checkout("S001", "E001")
    lib.checkout("ST001", "D001")
    lib.checkout("P001", "B002")
    lib.checkout("P001", "D002")

    print()

    # Show member status
    lib._members["S001"].status()
    print()

    # Return items
    lib.checkin("S001", "B001")
    lib.checkin("ST001", "D001")

    # Search catalog
    print("\n=== Search: 'Python' ===")
    results = lib.search("Python")
    for item in results:
        print(f"  {item}")

    # Available books
    print("\n=== Available Books ===")
    for item in lib.available_items("BOOK"):
        print(f"  {item}")

    # Try to exceed borrow limit
    print("\n=== Testing Borrow Limit ===")
    try:
        lib.checkout("S001", "M001")  # Student already has 1 item, limit is 3
        lib.checkout("S001", "D002")  # 2nd available
        lib.checkout("S001", "B002")  # 3rd — should succeed
    except RuntimeError as e:
        print(f"Expected: {e}")

    lib.catalog_summary()


demo()
```

---

## � Summary and What to Learn Next

Congratulations! You've covered the complete landscape of Python OOP:

| Topic | Key Takeaway |
|---|---|
| Classes & Objects | Classes are blueprints; objects are instances |
| `__init__` | Initialize state; validate in constructor |
| Instance vs Class Variables | Instance = per-object; Class = shared |
| Methods | Instance, class, and static methods serve different purposes |
| `self` | Just the instance passed automatically |
| String Representation | `__repr__` for devs, `__str__` for users |
| Inheritance | Reuse and extend; use `super()` |
| Multiple Inheritance | Understand MRO to avoid surprises |
| Encapsulation | Use `_` and `__` conventions; prefer properties |
| Polymorphism | Same interface, different behavior |
| Abstraction | ABCs enforce contracts |
| Magic Methods | Python integration through dunder methods |
| Properties | Validation with attribute syntax |
| Class/Static Methods | Factories and utilities |
| Composition | Often better than deep inheritance |
| Mixins | Small, focused reusable behaviors |
| Descriptors | Power behind properties and classmethod |
| Metaclasses | Classes of classes; use sparingly |
| Dataclasses | Clean data containers |
| Design Patterns | Proven solutions to common problems |
| SOLID | Maintainable, flexible design |

### � What to Study Next

1. **`typing` module** — Type hints and `Protocol` for structural subtyping
2. **`functools`** — `lru_cache`, `total_ordering`, `cached_property`
3. **`contextlib`** — `contextmanager` decorator for easy context managers
4. **Async OOP** — `async def`, `await`, and async context managers
5. **`__slots__`** — Memory optimization for many small objects
6. **`weakref`** — Weak references to avoid memory leaks in complex graphs
7. **Testing OOP** — `unittest.mock`, `pytest`, dependency injection for testability
8. **Real frameworks** — Django ORM, SQLAlchemy, Pydantic use OOP heavily

---

*� Happy coding! The best way to master OOP is to build things. Start small, refactor ruthlessly, and always ask "what is this class's single responsibility?"*