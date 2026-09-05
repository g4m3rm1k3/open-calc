# Lesson 24: Inheritance — class Child(Parent)

What you will build: The reader understands inheritance: a subclass inherits all attributes and methods of its parent, can override them, can call the parent's version with super(), and can add new attributes and methods. The transferable insight: inheritance models the IS-A relationship. A SavingsAccount IS-A BankAccount. Use inheritance when the subclass really is a specialization of the parent, not just when code sharing is convenient.

What you need to know first: Lessons 00-23.

Terms used in this lesson:
- **Inheritance** — The mechanism by which one class acquires the properties and methods of another. It solves the problem of redefining shared behavior across related types.
- **Subclass (Child)** — A class derived from another class. It solves the problem of specializing existing behavior.
- **Superclass (Parent)** — A class from which another class inherits. It solves the problem of defining a common contract and shared implementation.
- **Override** — Providing a new implementation for an inherited method. It solves the problem of adapting inherited behavior to the specific needs of the subclass.
- **Multiple inheritance** — A class inheriting from more than one parent class. It allows combining behaviors from disparate base classes.
- **MRO (Method Resolution Order)** — The predictable, deterministic order in which Python searches for inherited methods. It solves the problem of ambiguity in multiple inheritance (the diamond problem).
- **Abstract base class** — A class that cannot be instantiated and defines an interface for subclasses. It solves the problem of enforcing an IS-A contract.
- **Composition** — A design approach where a class contains instances of other classes (HAS-A). It solves the problem of code reuse without the tight coupling and inappropriate interface exposure of inheritance.

Objects and methods used:
- **super()**
  - *What it is:* A built-in Python function that returns a proxy object delegating method calls to a parent or sibling class.
  - *Implementation:* `super()`
  - *Its use:* Used to call inherited methods (usually `__init__`) that have been overridden in a subclass.
  - *Type:* Built-in class/function.
  - *Responsibility:* Resolves and delegates method calls following the MRO.
  - *Depends on:* The current class and instance context (usually determined automatically).
  - *Connects to:* Calls methods on parent classes.
  - *Shape:* Internal implementation detail within overridden methods.
- **type()**
  - *What it is:* A built-in function that returns the type of an object.
  - *Implementation:* `type(object)`
  - *Its use:* Used in `__repr__` to dynamically get the class name.
  - *Type:* Built-in class.
  - *Responsibility:* Identifies the concrete class of an instance.
  - *Depends on:* An object instance.
  - *Connects to:* Returns the class object, from which `__name__` can be accessed.
  - *Shape:* Utility function used in string formatting.
- **isinstance()**
  - *What it is:* A built-in function to check an object's type against a class or tuple of classes.
  - *Implementation:* `isinstance(object, classinfo)`
  - *Its use:* Used to verify the IS-A relationship dynamically.
  - *Type:* Built-in function.
  - *Responsibility:* Determines if an object is an instance of, or derived from, a specific class.
  - *Depends on:* An object instance and a target class/type.
  - *Connects to:* Reads the object's class hierarchy.
  - *Shape:* A runtime check.
- **ABC**
  - *What it is:* A helper class that has `ABCMeta` as its metaclass.
  - *Implementation:* `class abc.ABC`
  - *Its use:* Inherited from to define an abstract base class.
  - *Type:* Base class.
  - *Responsibility:* Prevents instantiation of the class if it has abstract methods.
  - *Depends on:* The `abc` module.
  - *Connects to:* Forms the root of an abstract class hierarchy.
  - *Shape:* Structural constraint for inheritance.
- **@abstractmethod**
  - *What it is:* A decorator indicating abstract methods.
  - *Implementation:* `@abstractmethod`
  - *Its use:* Forces subclasses to provide an implementation for the decorated method.
  - *Type:* Decorator.
  - *Responsibility:* Marks a method as requiring an override.
  - *Depends on:* The `abc` module, and a class with `ABCMeta`.
  - *Connects to:* Modifies method behavior at class creation time.
  - *Shape:* API contract definition.


## Concept Unit: Basic inheritance and method resolution

### The Problem
We have several types of animals that share properties like a name and the ability to make a sound, but the exact sound differs. How do we avoid duplicating the initialization of the name across every single animal class? If we define a common base, how do we specify that a dog says "Woof" while a cat says "Meow"?

### Introduce the concept in isolation
```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f'{self.name} makes a sound'

    def __repr__(self):
        return f'{type(self).__name__}({self.name!r})'

class Dog(Animal):      # Dog inherits from Animal
    def speak(self):    # override speak
        return f'{self.name} says Woof!'

class Cat(Animal):
    def speak(self):
        return f'{self.name} says Meow!'

d = Dog('Rex')
c = Cat('Whiskers')
a = Animal('Generic')

print(d.speak())   
print(c.speak())   
print(a.speak())   
print(isinstance(d, Animal))  
print(isinstance(d, Dog))     
print(isinstance(a, Dog))     
```
Predicted confidently:
```
Rex says Woof!
Whiskers says Meow!
Generic makes a sound
True
True
False
```
This demonstrates **inheritance** and **override**. The subclasses `Dog` and `Cat` acquire the `__init__` and `__repr__` methods from `Animal`, while providing their own custom `speak` methods. It proves that a `Dog` IS-A `Animal`.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson to establish how inheritance operates in Python.
Files affected: none.

### The New Code
```python
class Dog(Animal):
    def speak(self):
        return f'{self.name} says Woof!'
```

### The Updated Project
```python
1: class Animal:
2:     def __init__(self, name):
3:         self.name = name
4: 
5:     def speak(self):
6:         return f'{self.name} makes a sound'
7: 
8:     def __repr__(self):
9:         return f'{type(self).__name__}({self.name!r})'
10:
11: class Dog(Animal):  # ← new
12:     def speak(self):  # ← new
13:         return f'{self.name} says Woof!'  # ← new
```
The `Dog` class is defined by inheriting from `Animal`, effectively specializing the behavior of `speak()`.

### Mechanical walkthrough
- `class Dog(Animal):` declares a new class `Dog` that inherits from the parent class `Animal`.
- `def speak(self):` defines a method on `Dog` with the exact same name and signature as a method on `Animal`, performing an **override**.
- `return f'{self.name} says Woof!'` constructs and returns a string using the `name` attribute initialized by the inherited `__init__`.

### CS lens
The concept here is **polymorphism** via subtype inheritance. Real-world examples include UI frameworks where `Button` and `TextField` inherit from `Widget`, game engines where `Player` and `Enemy` inherit from `GameObject`, and database drivers where `PostgresDriver` and `SqliteDriver` inherit from `DbDriver`.

### SE lens
Design Principle: The Open-Closed Principle (OCP). `Animal` is closed for modification (we didn't change it) but open for extension (we added `Dog` and `Cat`).
Alternative NOT chosen: A single `Animal` class with a large `if type == "dog"` statement. Tradeoff: The inheritance approach separates concerns into cohesive classes but scatters the code for "all animals" across multiple files or blocks.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `Rex says Woof!` when `Dog('Rex').speak()` is called.

### One sentence connecting to previous unit
Now that we can inherit and override methods entirely, we often need a way to reuse the parent's logic instead of completely replacing it.


## Concept Unit: super() — calling the parent

### The Problem
When a subclass defines its own `__init__` method, it completely overrides the parent's `__init__`. How do we initialize the parent's attributes without duplicating the assignment code? How do we say "do what the parent does, and then do my extra stuff"?

### Introduce the concept in isolation
```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def __repr__(self):
        return f'BankAccount({self.owner!r}, {self.balance})'

class SavingsAccount(BankAccount):
    def __init__(self, owner, balance=0, rate=0.05):
        super().__init__(owner, balance)  # call parent __init__
        self.rate = rate                  # add new attribute

    def add_interest(self):
        interest = self.balance * self.rate
        self.deposit(interest)            # inherited method
        return interest

    def __repr__(self):
        return f'SavingsAccount({self.owner!r}, {self.balance}, rate={self.rate})'

acc = SavingsAccount('Alice', 1000, rate=0.03)
print(acc)
acc.deposit(500)
interest = acc.add_interest()
print(f'Interest: {interest:.2f}')
print(acc.balance)
```
Predicted confidently:
```
SavingsAccount('Alice', 1000, rate=0.03)
Interest: 45.00
1545.0
```
This demonstrates the use of **super()** to delegate initialization to the parent class, ensuring `BankAccount` correctly configures `owner` and `balance` before `SavingsAccount` sets its own `rate`. It proves that we can extend, rather than replace, inherited behavior.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
Files affected: none.

### The New Code
```python
class SavingsAccount(BankAccount):
    def __init__(self, owner, balance=0, rate=0.05):
        super().__init__(owner, balance)
        self.rate = rate
```

### The Updated Project
```python
1: class BankAccount:
2:     def __init__(self, owner, balance=0):
3:         self.owner = owner
4:         self.balance = balance
5: 
6: class SavingsAccount(BankAccount):  # ← new
7:     def __init__(self, owner, balance=0, rate=0.05):  # ← new
8:         super().__init__(owner, balance)  # ← new
9:         self.rate = rate  # ← new
```
`SavingsAccount` initializes itself by delegating the common fields to the parent class and handling its specific fields itself.

### Mechanical walkthrough
- `class SavingsAccount(BankAccount):` declares inheritance.
- `def __init__(self, owner, balance=0, rate=0.05):` overrides the constructor to accept a new `rate` parameter.
- `super()` calls the built-in function to obtain a proxy object representing the parent class.
- `.__init__(owner, balance)` invokes the parent's `__init__` method, passing the required arguments.
- `self.rate = rate` assigns the subclass-specific attribute.

### CS lens
The concept here is **Delegation**. Real-world examples include event bubbling in the DOM, middleware chains in web servers, and virtual method dispatch in language runtimes.

### SE lens
Design Principle: DRY (Don't Repeat Yourself).
Alternative NOT chosen: Manually writing `self.owner = owner` and `self.balance = balance` inside `SavingsAccount`. Tradeoff: If the parent class initialization changes (e.g., adding a transaction history list), the subclass would break if it didn't use `super()`.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Calling `acc.deposit(500)` correctly updates `acc.balance` because the parent's state was initialized properly.

### One sentence connecting to previous unit
Since a class can use `super()` to find its parent's methods, we must consider what happens if a class has more than one parent.


## Concept Unit: Method resolution order (MRO)

### The Problem
If a class inherits from two different parent classes, and both parent classes define a method with the same name, which one does the subclass call? How does Python resolve this ambiguity?

### Introduce the concept in isolation
```python
class A:
    def method(self):
        return 'A'

class B(A):
    def method(self):
        return 'B'

class C(A):
    def method(self):
        return 'C'

class D(B, C):  # multiple inheritance
    pass

print(D.mro())

d = D()
print(d.method())
print(isinstance(d, object))
```
Predicted confidently:
```
[<class '__main__.D'>, <class '__main__.B'>, <class '__main__.C'>, <class '__main__.A'>, <class 'object'>]
B
True
```
This demonstrates the **Method Resolution Order (MRO)** and **Multiple inheritance**. The `mro()` method proves that Python searches `D`, then `B`, then `C`, then `A`, ensuring a deterministic path through the inheritance graph. 

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
Files affected: none.

### The New Code
```python
class D(B, C):
    pass
```

### The Updated Project
```python
1: class B(A):
2:     def method(self): return 'B'
3: 
4: class C(A):
5:     def method(self): return 'C'
6: 
7: class D(B, C):  # ← new
8:     pass        # ← new
```
Class `D` inherits from both `B` and `C`. When `d.method()` is called, Python uses the MRO to find the first matching method.

### Mechanical walkthrough
- `class D(B, C):` uses multiple inheritance, specifying two parent classes.
- `pass` is a null statement indicating the class has no methods or attributes of its own.
- `D.mro()` is a class method that returns a list representing the class search path.
- `d.method()` triggers the search: Python checks `D.__dict__` (no), `B.__dict__` (yes), and invokes it, returning `'B'`.

### CS lens
The concept here is **Linearization of partial orders**. Real-world examples include dependency resolution in package managers (like npm or pip), topological sorting in build systems (Make), and conflict resolution in distributed systems.

### SE lens
Design Principle: Predictability in resolution logic.
Alternative NOT chosen: Depth-first search without deduplication (which could check `A` before `C`). Tradeoff: Python's C3 linearization prevents a base class (`A`) from overriding a more specific class (`C`), but makes the rules harder to compute in your head for very complex hierarchies.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `d.method()` outputs `'B'`.

### One sentence connecting to previous unit
While the MRO dictates how concrete methods are found, sometimes a parent class wants to mandate that subclasses *must* provide their own implementation of a method.


## Concept Unit: Abstract base classes and the IS-A contract

### The Problem
How do we create a base class that defines an interface (like `area()` and `perimeter()`) but isn't meant to be instantiated itself? How do we force subclasses to actually implement these methods, producing an error if they forget?

### Introduce the concept in isolation
```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

    @abstractmethod
    def perimeter(self):
        pass

    def describe(self):
        return f'{type(self).__name__}: area={self.area():.2f}'

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        import math
        return math.pi * self.radius ** 2

    def perimeter(self):
        import math
        return 2 * math.pi * self.radius

c = Circle(5)
print(c.area())
print(c.describe())
```
Predicted confidently:
```
78.53981633974483
Circle: area=78.54
```
This demonstrates the use of an **Abstract base class (ABC)**. It proves that `Shape` cannot be instantiated directly and that `Circle` must implement both abstract methods to be considered a concrete class.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
Files affected: none.

### The New Code
```python
class Shape(ABC):
    @abstractmethod
    def area(self):
        pass
```

### The Updated Project
```python
1: from abc import ABC, abstractmethod
2: 
3: class Shape(ABC):  # ← new
4:     @abstractmethod  # ← new
5:     def area(self):  # ← new
6:         pass  # ← new
```
`Shape` inherits from `ABC` and uses `@abstractmethod` to enforce a contract on its subclasses.

### Mechanical walkthrough
- `from abc import ABC, abstractmethod` imports the base class and decorator required for abstract classes.
- `class Shape(ABC):` declares that `Shape` is an abstract base class.
- `@abstractmethod` decorates the `area` method.
- `def area(self):` defines the method signature.
- `pass` provides an empty body, as the subclass will provide the implementation.

### CS lens
The concept here is **Interfaces / Contracts**. Real-world examples include network protocols (TCP requires ACK), plugin systems (plugins must expose an `init()` method), and hardware drivers (an OS expects `read()` and `write()` syscalls).

### SE lens
Design Principle: Liskov Substitution Principle (LSP). We should be able to treat any `Circle` strictly as a `Shape`.
Alternative NOT chosen: Simply raising `NotImplementedError` inside the base class method. Tradeoff: The `@abstractmethod` approach catches the error at instantiation time, whereas raising an error only fails at runtime when the specific method is called.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Attempting `Shape()` will raise a `TypeError: can't instantiate abstract class`.

### One sentence connecting to previous unit
Inheritance enforces a strict IS-A relationship, but sometimes reaching for inheritance is the wrong design choice entirely.


## Concept Unit: Composition vs. inheritance — knowing when NOT to inherit

### The Problem
If a `Stack` relies on a list internally to store elements, should `Stack` inherit from `list`? If it does, a user can call `stack.sort()` or `stack[0]`, breaking the rules of a stack (LIFO). How do we reuse `list`'s logic without exposing all of its methods?

### Introduce the concept in isolation
```python
# BAD inheritance: Stack IS-A list? No. Stack USES a list.
class BadStack(list):     
    def push(self, item): 
        self.append(item)

# GOOD composition: Stack HAS-A list internally
class Stack:
    def __init__(self):
        self._items = []    

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if not self._items:
            raise IndexError('pop from empty stack')
        return self._items.pop()

    def peek(self):
        return self._items[-1]

    def __len__(self):
        return len(self._items)

s = Stack()
s.push(1); s.push(2); s.push(3)
print(s.pop())
print(s.peek())
print(len(s))
```
Predicted confidently:
```
3
2
2
```
This demonstrates **Composition**. By wrapping a list rather than inheriting from it, `Stack` restricts its public API strictly to stack operations (push, pop, peek), proving that "HAS-A" is safer than "IS-A" when building domain abstractions.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a standalone theory lesson.
Files affected: none.

### The New Code
```python
class Stack:
    def __init__(self):
        self._items = []
```

### The Updated Project
```python
1: class Stack:  # ← new
2:     def __init__(self):  # ← new
3:         self._items = []  # ← new
4: 
5:     def push(self, item):  # ← new
6:         self._items.append(item)  # ← new
```
`Stack` encapsulates the list inside the `_items` attribute rather than inheriting from it.

### Mechanical walkthrough
- `class Stack:` defines a generic base class (inheriting implicitly from `object`).
- `def __init__(self):` is the constructor.
- `self._items = []` initializes a private list attribute representing the internal state (composition).
- `def push(self, item):` provides the safe, restricted public method.
- `self._items.append(item)` delegates the actual work to the internal list.

### CS lens
The concept here is **Encapsulation** and **Adapter Pattern**. Real-world examples include wrapping a raw socket connection inside an `HttpClient`, building a set data structure using an underlying hash map, and abstracting a file system handle behind a `Logger` class.

### SE lens
Design Principle: Favor Composition over Inheritance.
Alternative NOT chosen: Inheriting from `list` (the `BadStack` example). Tradeoff: Inheritance makes the implementation very short, but leaks the underlying implementation details (like `.index()` and `__setitem__`) to the caller, violating the domain contract.

### Commands needed
None for this unit.

### Run it
Predicted confidently: A user cannot perform `s[0]` on the `Stack` class; it will raise a `TypeError` because `__getitem__` is not exposed.

### One sentence connecting to previous unit
Understanding the difference between inheriting behavior and composing behavior allows us to accurately model the real world.

## Closing
### Connect the pieces
Trace `SavingsAccount('Alice', 1000)` through all concept units: when initialized, it honors the inheritance chain by calling `super().__init__('Alice', 1000)` to execute `BankAccount`'s initialization logic. When calling `acc.deposit(500)`, the method is inherited directly from `BankAccount` due to the MRO lookup order. When we print the account, the overridden `__repr__` provides the specialized output rather than the parent's default. Finally, because `SavingsAccount` inherently IS-A `BankAccount`, it upholds the substitution principle without inappropriately exposing unrelated functionality like composition would seek to prevent.
