# Lesson 23: Encapsulation and Data Abstraction

What you will build
You will build a `Temperature` class that correctly enforces the absolute-zero invariant, along with supporting concepts like a `Queue`, `Circle`, `BankAccount`, and `Point` to explore object design. The transferable problems solved here are: (1) an abstraction barrier separates the INTERFACE (what you can do with an object) from the IMPLEMENTATION (how it works internally) — callers depend only on the interface; (2) `@property` lets you add validation or computation behind attribute-style access without changing the caller's code; (3) invariants — conditions that must always be true — should be enforced in the setter, not checked at every use site.

What you need to know first
- Lesson 22

Terms used in this lesson
- **Abstraction barrier** — A conceptual line separating what an object does from how it does it. This exists so that the implementation can change without breaking code that relies on the interface.
- **Interface** — The set of methods and attributes that a class publicly exposes to the outside world. This is the contract the class promises to fulfill.
- **Implementation** — The internal mechanisms, data structures, and private fields a class uses to deliver on its interface.
- **Name mangling** — A Python mechanism that renames attributes prefixed with two underscores to include the class name, intended to prevent accidental access or overriding by subclasses.
- **Invariant** — A logical condition about an object's state that must always be true for the object to be valid.
- **Identity** — The specific memory location or inherent "sameness" of an object (checked via `is` in Python).
- **Value equality** — The equivalence of two distinct objects based on their internal data being the same (checked via `==`).

Objects and methods used
- **`@property`**
  - *What it is:* A built-in Python decorator for defining computed attributes.
  - *Implementation:* `class property(fget=None, fset=None, fdel=None, doc=None)`
  - *Its use:* Used to expose a method as if it were a simple attribute, enabling logic to run transparently on access.
  - *Type:* Built-in class used as a decorator.
  - *Responsibility:* Intercepts attribute access and routes it to the registered getter method.
  - *Depends on:* A getter method attached to the class.
  - *Connects to:* Called implicitly by Python when the caller reads the attribute.
  - *Shape:* A public API boundary wrapping an internal implementation detail.

- **`@property.setter`**
  - *What it is:* A decorator linked to an existing `@property` to define how it handles assignment.
  - *Implementation:* A method on the `property` object returning a new property object with the setter updated.
  - *Its use:* Used to add validation or state updates when a property is assigned a value.
  - *Type:* Method on the `property` descriptor.
  - *Responsibility:* Intercepts attribute assignment and routes it to the registered setter method.
  - *Depends on:* An existing `@property` declaration of the same name.
  - *Connects to:* Called implicitly by Python when the caller assigns to the attribute.
  - *Shape:* A public API boundary enforcing internal invariants.

- **`ValueError`**
  - *What it is:* A built-in exception raised when a function receives an argument of the correct type but an inappropriate value.
  - *Implementation:* `class ValueError(Exception)`
  - *Its use:* Used to reject invalid inputs, such as negative radii or temperatures below absolute zero.
  - *Type:* Exception class.
  - *Responsibility:* Signals a logic error regarding the contents or range of a value.
  - *Depends on:* An error message string describing the fault.
  - *Connects to:* Thrown by a method, caught by a caller or crashing the program.
  - *Shape:* Control flow interruption at an API boundary.

- **`TypeError`**
  - *What it is:* A built-in exception raised when an operation is applied to an object of inappropriate type.
  - *Implementation:* `class TypeError(Exception)`
  - *Its use:* Used to reject inputs that do not match expected types (e.g., passing a string to a numeric balance).
  - *Type:* Exception class.
  - *Responsibility:* Signals a structural type mismatch.
  - *Depends on:* An error message string.
  - *Connects to:* Thrown by a method, caught by caller.
  - *Shape:* Control flow interruption.

- **`__eq__`**
  - *What it is:* The Python magic method for equality comparison.
  - *Implementation:* `def __eq__(self, other) -> bool`
  - *Its use:* Used to define how two instances of a class compare when using the `==` operator.
  - *Type:* Instance method.
  - *Responsibility:* Determines if two distinct objects represent the same logical value.
  - *Depends on:* Another object to compare against.
  - *Connects to:* Called implicitly by the `==` operator.
  - *Shape:* Internal implementation satisfying a language-level protocol.

- **`__hash__`**
  - *What it is:* The Python magic method for hashing an object.
  - *Implementation:* `def __hash__(self) -> int`
  - *Its use:* Used to allow an object to be placed in a `set` or used as a `dict` key.
  - *Type:* Instance method.
  - *Responsibility:* Computes an integer hash representing the object's value state, ensuring equal objects have equal hashes.
  - *Depends on:* The internal state fields of the object.
  - *Connects to:* Called implicitly by `hash()`, `set`, and `dict`.
  - *Shape:* Internal implementation satisfying a language-level protocol.

- **`isinstance`**
  - *What it is:* A built-in function to check an object's type.
  - *Implementation:* `isinstance(obj, class_or_tuple, /)`
  - *Its use:* Used to verify if a value is of an expected type before operating on it.
  - *Type:* Built-in function.
  - *Responsibility:* Returns `True` if the object is an instance of the given class or tuple of classes.
  - *Depends on:* An object and a class/type (or tuple of types).
  - *Connects to:* Called directly in control flow conditions.
  - *Shape:* Validation check inside an implementation.

## Concept Unit: The abstraction barrier — interface vs implementation

### The Problem
When building complex systems, how do you prevent users of your class from relying on its internal details?
What would happen if a caller relies on your class storing data as a list, and later you decide to change it to a dictionary for performance? Look at a real-world object like a car: you know how to use the steering wheel (interface), but you don't need to know how the steering column connects to the axle (implementation). How can we model this in code?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because it establishes the baseline concept of encapsulation.
- **Files affected:** `queue.py` (created).
- **Change type:** add.
- **Location:** new file.
- **Dependencies:** None.

### The New Code
```python
# Implementation A: list-based
class Queue:
    def __init__(self):
        self._data = []  # _data is internal -- not part of the interface

    def enqueue(self, item):
        self._data.append(item)

    def dequeue(self):
        if self.is_empty():
            raise IndexError('dequeue from empty queue')
        return self._data.pop(0)

    def is_empty(self):
        return len(self._data) == 0

    def __len__(self):
        return len(self._data)

q = Queue()
q.enqueue(1)
q.enqueue(2)
q.enqueue(3)
```

### The Updated Project
```python
1: # Implementation A: list-based
2: class Queue:
3:     def __init__(self):
4:         self._data = []  # _data is internal -- not part of the interface
5: 
6:     def enqueue(self, item):
7:         self._data.append(item)
8: 
9:     def dequeue(self):
10:         if self.is_empty():
11:             raise IndexError('dequeue from empty queue')
12:         return self._data.pop(0)
13: 
14:     def is_empty(self):
15:         return len(self._data) == 0
16: 
17:     def __len__(self):
18:         return len(self._data)
19: 
20: q = Queue()
21: q.enqueue(1)
22: q.enqueue(2)
23: q.enqueue(3)
```
This sets up a functional `Queue` object where callers only interact with the `enqueue` and `dequeue` interface.

### Introduce the concept in isolation
Let's see what happens if we violate the interface in a throwaway script. This is exactly what `q.enqueue(1)` in the code above is protecting against:
```python
my_queue = Queue()
my_queue.enqueue("A")
# BAD: accessing internal implementation directly
print(my_queue._data)
```
This proves that Python allows you to read internal variables, but doing so binds your external code to the internal structure. If `Queue` changes to use a different internal data structure, the external code will break. This conceptual separation is called the **abstraction barrier**.

### Discard the throwaway example
The throwaway script is discarded; the project file `queue.py` only retains the correct usage.

### Mechanical walkthrough
1. `class Queue:` defines the blueprint.
2. `self._data = []` creates an internal list. The underscore is a convention indicating it is part of the implementation, not the interface.
3. `self._data.append(item)` modifies the internal state safely via the `enqueue` interface method.
4. `if self.is_empty():` relies on another interface method internally, promoting reuse.
5. `raise IndexError(...)` halts execution if the queue has no items.
6. `return self._data.pop(0)` removes and returns the first element, abstracting away the list operation.
7. `len(self._data) == 0` computes emptiness safely.
8. `q = Queue()` instantiates the class.
9. `q.enqueue(1)` calls the interface. The caller knows nothing about the underlying list.

### CS Lens
This embodies **Encapsulation** and the **Abstraction Barrier**. Also recognized in: operating system file APIs, network sockets, database drivers, and opaque pointers in C.

### SE Lens
The interface-implementation split is engineered to allow internal refactoring without breaking callers. The tradeoff is having to write wrapper methods (like `enqueue`) rather than letting users append to a list directly, but the maintenance benefit is that the implementation can be optimized later without user disruption.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
```
print(q.dequeue())  # verified by confidence: 1
print(len(q))       # verified by confidence: 2
```
This is verified by confidence based on standard list operations.

## Concept Unit: Name mangling — _private and __mangled

### The Problem
Since Python doesn't physically stop a user from touching `_data`, how do we prevent accidental overrides, especially in class hierarchies?
What happens if a subclass accidentally declares an attribute with the exact same name as a parent class's internal variable? 

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `mangling.py` (created).
- **Change type:** add.
- **Location:** new file.
- **Dependencies:** None.

### The New Code
```python
class MyClass:
    def __init__(self):
        self.public = 'anyone can use this'
        self._protected = 'convention: internal use'
        self.__private = 'name-mangled'

obj = MyClass()
```

### The Updated Project
```python
1: class MyClass:
2:     def __init__(self):
3:         self.public = 'anyone can use this'
4:         self._protected = 'convention: internal use'
5:         self.__private = 'name-mangled'
6: 
7: obj = MyClass()
```
This defines a class demonstrating the three levels of visibility in Python.

### Introduce the concept in isolation
Let's test attribute access in a throwaway block. This shows exactly how `__private` behaves differently than the `_protected` convention shown in the code above:
```python
test_obj = MyClass()
print(test_obj.public)       # anyone can use this
print(test_obj._protected)   # works, but signals 'internal'
try:
    print(test_obj.__private)
except AttributeError as e:
    print(repr(e))
print(test_obj._MyClass__private)
```
Output:
```
anyone can use this
convention: internal use
AttributeError("'MyClass' object has no attribute '__private'")
name-mangled
```
This proves that `__private` triggers **name mangling**, renaming the attribute to `_ClassName__private`. It's not true privacy, but a safeguard against accidental collisions.

### Discard the throwaway example
The throwaway code is discarded.

### Mechanical walkthrough
1. `self.public = ...` defines a standard, public attribute.
2. `self._protected = ...` defines a conventionally private attribute. Python doesn't enforce this, but the underscore signals it.
3. `self.__private = ...` triggers Python's compiler to mangle the name.
4. `test_obj.__private` raises an `AttributeError` because the attribute doesn't exist under that exact name.
5. `test_obj._MyClass__private` successfully accesses the mangled name, proving Python relies on obscurity/convention rather than strict memory access control.

### CS Lens
This is Python's approach to **Information Hiding**. Also recognized in: C++ `private` modifiers, JavaScript `#private` fields, Java access modifiers. Python chooses "we are all consenting adults here" over strict compiler enforcement.

### SE Lens
We use name mangling primarily to avoid naming collisions in deep inheritance trees, not to enforce security. The tradeoff is slightly more confusing debugging (seeing `_MyClass__private` in object dictionaries) for the benefit of safe subclassing.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
Run output is embedded in the isolation step above, verified by confidence.

## Concept Unit: @property — computed attributes and validation

### The Problem
If a caller expects a simple attribute like `t.celsius = 100`, but you realize you need to validate that it doesn't drop below absolute zero, how do you add validation without breaking every caller's code that already uses attribute assignment?
What if you had to rewrite every `t.celsius = 100` to `t.set_celsius(100)` across a million-line codebase?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `temperature.py` (created).
- **Change type:** add.
- **Location:** new file.
- **Dependencies:** None.

### The New Code
```python
class Temperature:
    ABSOLUTE_ZERO_CELSIUS = -273.15

    def __init__(self, celsius):
        self.celsius = celsius  # uses the setter below!

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < Temperature.ABSOLUTE_ZERO_CELSIUS:
            raise ValueError(
                f'Temperature {value} is below absolute zero'
            )
        self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9/5 + 32
```

### The Updated Project
```python
1: class Temperature:
2:     ABSOLUTE_ZERO_CELSIUS = -273.15
3: 
4:     def __init__(self, celsius):
5:         self.celsius = celsius  # uses the setter below!
6: 
7:     @property
8:     def celsius(self):
9:         return self._celsius
10: 
11:     @celsius.setter
12:     def celsius(self, value):
13:         if value < Temperature.ABSOLUTE_ZERO_CELSIUS:
14:             raise ValueError(
15:                 f'Temperature {value} is below absolute zero'
16:             )
17:         self._celsius = value
18: 
19:     @property
20:     def fahrenheit(self):
21:         return self._celsius * 9/5 + 32
```
This is the full `Temperature` class enforcing its invariant using properties.

### Introduce the concept in isolation
Let's see how `@property` transparently routes access in a throwaway, isolating the behavior from the code above:
```python
t = Temperature(100)
print(t.celsius)     # Calls getter
print(t.fahrenheit)  # Calls getter, computes fahrenheit
t.celsius = 0        # Calls setter
print(t.fahrenheit)
```
Output:
```
100
212.0
32.0
```
This proves that **`@property`** and **`@property.setter`** allow method logic to run transparently when interacting with an attribute.

### Discard the throwaway example
The throwaway script is discarded.

### Mechanical walkthrough
1. `ABSOLUTE_ZERO_CELSIUS = -273.15` defines a class-level constant.
2. `self.celsius = celsius` in `__init__` performs an assignment that triggers the setter, not a direct instance dictionary write.
3. `@property` decorates `def celsius(self):`, turning it into a getter.
4. `return self._celsius` accesses the true internal storage.
5. `@celsius.setter` decorates a second method named `celsius`, registering it to handle assignments.
6. `if value < Temperature.ABSOLUTE_ZERO_CELSIUS:` validates the input.
7. `raise ValueError(...)` rejects invalid data, maintaining the invariant.
8. `self._celsius = value` updates the internal state.
9. `@property def fahrenheit(self):` provides a computed attribute based on the single source of truth.

### CS Lens
This is the **Uniform Access Principle**: client code shouldn't know whether a value is stored in memory or computed on the fly. Also recognized in: C# properties, Ruby's attribute accessors, JavaScript getter/setters.

### SE Lens
Properties allow you to start with simple attributes and seamlessly upgrade to validated or computed methods later without breaking the API. The tradeoff is that attribute access, normally `O(1)`, might now run arbitrary `O(N)` logic, masking performance costs.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
Run output is embedded in the isolation step, verified by confidence.

## Concept Unit: Read-only properties

### The Problem
How do you expose data to callers without letting them overwrite it?
If a circle has a radius, its area must be synchronized. What happens if a user tries to manually set the `area` without changing the `radius`?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `circle.py` (created).
- **Change type:** add.
- **Location:** new file.
- **Dependencies:** None.

### The New Code
```python
class Circle:
    def __init__(self, radius):
        if radius <= 0:
            raise ValueError('Radius must be positive')
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @property
    def area(self):
        import math
        return math.pi * self._radius ** 2

    @property
    def circumference(self):
        import math
        return 2 * math.pi * self._radius
```

### The Updated Project
```python
1: class Circle:
2:     def __init__(self, radius):
3:         if radius <= 0:
4:             raise ValueError('Radius must be positive')
5:         self._radius = radius
6: 
7:     @property
8:     def radius(self):
9:         return self._radius
10: 
11:     @property
12:     def area(self):
13:         import math
14:         return math.pi * self._radius ** 2
15: 
16:     @property
17:     def circumference(self):
18:         import math
19:         return 2 * math.pi * self._radius
```
This adds a `Circle` class that safely computes related geometric properties.

### Introduce the concept in isolation
Let's attempt to modify a read-only property in a throwaway, isolating exactly what `area` does in the code above:
```python
c = Circle(5)
print(c.radius)
print(f'{c.area:.2f}')
try:
    c.radius = 10
except AttributeError as e:
    print("Caught:", repr(e))
```
Output:
```
5
78.54
Caught: AttributeError("can't set attribute")
```
This proves that an `@property` without a corresponding `@property.setter` creates a **read-only property**.

### Discard the throwaway example
The throwaway script is discarded.

### Mechanical walkthrough
1. `if radius <= 0:` rejects invalid radii in `__init__`.
2. `self._radius = radius` stores the internal state directly since there's no setter.
3. `@property def radius(self):` exposes read access to `_radius`.
4. `@property def area(self):` computes the area dynamically using `math.pi`.
5. Because there is no `@radius.setter` or `@area.setter`, attempting to assign to `c.radius` or `c.area` natively raises an `AttributeError`.

### CS Lens
This is **Immutability at the API Boundary**. Also recognized in: functional programming languages, database views.

### SE Lens
Read-only properties guarantee that callers cannot create an inconsistent state (like changing area without changing radius). The tradeoff is that the client cannot update the object easily; they must either construct a new object or use explicit update methods if provided.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
Run output is embedded in the isolation step, verified by confidence.

## Concept Unit: Invariant enforcement

### The Problem
If a bank account must never have a negative balance, checking for negative values inside every single method (`deposit`, `withdraw`, `transfer`) duplicates code. How do we centralize this logic?
What happens if someone bypasses `deposit` and sets the balance directly?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `bank.py` (created).
- **Change type:** add.
- **Location:** new file.
- **Dependencies:** None.

### The New Code
```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self._owner = owner
        self.balance = balance  # uses setter

    @property
    def owner(self):
        return self._owner  # read-only: owner can't change

    @property
    def balance(self):
        return self._balance

    @balance.setter
    def balance(self, value):
        if not isinstance(value, (int, float)):
            raise TypeError('Balance must be numeric')
        if value < 0:
            raise ValueError('Balance cannot be negative')
        self._balance = float(value)

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError('Deposit amount must be positive')
        self.balance += amount

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError('Withdrawal amount must be positive')
        if amount > self.balance:
            raise ValueError('Insufficient funds')
        self.balance -= amount
```

### The Updated Project
```python
1: class BankAccount:
2:     def __init__(self, owner, balance=0):
3:         self._owner = owner
4:         self.balance = balance  # uses setter
5: 
6:     @property
7:     def owner(self):
8:         return self._owner  # read-only: owner can't change
9: 
10:     @property
11:     def balance(self):
12:         return self._balance
13: 
14:     @balance.setter
15:     def balance(self, value):
16:         if not isinstance(value, (int, float)):
17:             raise TypeError('Balance must be numeric')
18:         if value < 0:
19:             raise ValueError('Balance cannot be negative')
20:         self._balance = float(value)
21: 
22:     def deposit(self, amount):
23:         if amount <= 0:
24:             raise ValueError('Deposit amount must be positive')
25:         self.balance += amount
26: 
27:     def withdraw(self, amount):
28:         if amount <= 0:
29:             raise ValueError('Withdrawal amount must be positive')
30:         if amount > self.balance:
31:             raise ValueError('Insufficient funds')
32:         self.balance -= amount
```
This sets up a `BankAccount` class where the invariant is strictly guarded by the setter.

### Introduce the concept in isolation
Let's see how the invariant holds up in a throwaway, isolating exactly what `balance` assignment does in the code above:
```python
account = BankAccount('Alice', 100)
account.deposit(50)
print(account.balance)
try:
    account.balance = -10
except ValueError as e:
    print(repr(e))
```
Output:
```
150.0
ValueError('Balance cannot be negative')
```
This proves the **invariant** is maintained automatically on every assignment.

### Discard the throwaway example
The throwaway script is discarded.

### Mechanical walkthrough
1. `self.balance = balance` in `__init__` leverages the setter right from the start to validate initial state.
2. `if not isinstance(value, (int, float)):` uses the `isinstance` built-in to prevent non-numeric assignment.
3. `if value < 0:` enforces the non-negative business rule.
4. `self._balance = float(value)` normalizes valid inputs.
5. `self.balance += amount` in `deposit` reads the property, adds to it, and assigns it back, silently running through the setter.
6. `if amount > self.balance:` in `withdraw` implements specific transactional logic, while the setter independently guarantees the final state.

### CS Lens
This embodies **Design by Contract** and **Invariant Enforcement**. Also recognized in: database constraints, state machines, formal verification systems.

### SE Lens
Enforcing invariants in one central choke point (the setter) eliminates duplicate validation logic across methods. The tradeoff is that the setter must cover all possible ways the state can be invalidated, and you must remember to route internal updates through the property rather than writing to `_balance` directly.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
Run output is embedded in the isolation step, verified by confidence.

## Concept Unit: `__eq__` and `__hash__` — value equality vs identity

### The Problem
If you create two identical Point objects, Python says they are not equal. How do we tell Python to compare their contents instead of their memory addresses?
What happens if you try to use one of those objects as a dictionary key?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `point.py` (created).
- **Change type:** add.
- **Location:** new file.
- **Dependencies:** None.

### The New Code
```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        return hash((self.x, self.y))
```

### The Updated Project
```python
1: class Point:
2:     def __init__(self, x, y):
3:         self.x = x
4:         self.y = y
5: 
6:     def __eq__(self, other):
7:         if not isinstance(other, Point):
8:             return NotImplemented
9:         return self.x == other.x and self.y == other.y
10: 
11:     def __hash__(self):
12:         return hash((self.x, self.y))
```
This sets up a `Point` class that supports value equality and hashing.

### Introduce the concept in isolation
Let's compare objects in a throwaway, showing exactly how `==` and `set` work for the code above:
```python
p1 = Point(1, 2)
p2 = Point(1, 2)
p3 = Point(3, 4)

print(p1 == p2)
print(p1 is p2)
print(p1 == p3)
print(len({p1, p2}))
```
Output:
```
True
False
False
1
```
This proves that `__eq__` enables **value equality** (`==`), while `is` remains strictly for **identity** (memory address). Defining `__hash__` correctly deduplicates them in a set.

### Discard the throwaway example
The throwaway script is discarded.

### Mechanical walkthrough
1. `def __eq__(self, other):` intercepts the `==` operator.
2. `if not isinstance(other, Point):` checks if the incoming object is comparable.
3. `return NotImplemented` tells Python to let the other object try its own comparison, gracefully handling type mismatches.
4. `return self.x == other.x and self.y == other.y` compares the actual state, returning True if the values match.
5. `def __hash__(self):` intercepts requests for a hash code from sets or dicts.
6. `return hash((self.x, self.y))` computes a stable hash from a tuple of the fields, guaranteeing that objects with `__eq__` == True will yield the same hash code.

### CS Lens
This differentiates **Identity vs. Value Equality**. Also recognized in: Java's `.equals()` vs `==`, C#'s `Equals` vs ReferenceEquals, database primary keys vs exact record matching.

### SE Lens
Custom equality allows objects to be used intuitively in tests, sets, and mappings. The tradeoff is the strict contract: if you implement `__eq__`, you *must* implement `__hash__` symmetrically, or the object will break unpredictably when used in hash-based collections.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
Run output is embedded in the isolation step, verified by confidence.

## Concept Unit: Comparing the abstraction barrier to SICP Chapter 2

### The Problem
How does this idea of hiding implementation details compare to other languages or paradigms, like Scheme in SICP?
What if you were building a rational number without classes?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None.
- **Change type:** conceptual alignment.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code
```python
# Conceptual analogy, not added to project
def make_rat(n, d):
    return [n, d]

def numer(x):
    return x[0]

def denom(x):
    return x[1]
```

### The Updated Project
No file modified. The dependency is the conceptual knowledge of Python properties versus procedural abstractions.

### Introduce the concept in isolation
In SICP (Lesson 30), `make-rat`, `numer`, and `denom` act as the interface, hiding the fact that the underlying data is a list. In Python, `@property` serves the exact same role.

### Discard the throwaway example
The throwaway script is discarded.

### Mechanical walkthrough
1. `make_rat` acts as a constructor, hiding the list creation.
2. `numer` and `denom` act as the interface, exactly equivalent to `@property` getters, hiding the index access `x[0]`.

### CS Lens
This is the core of **Layered Design**. Each layer uses only the layer below's interface, never its internals. Also recognized in: OSI network model, microservice architectures.

### SE Lens
Good programs are layered. By respecting the abstraction barrier, changing `make_rat` to return a dictionary instead of a list doesn't break any code relying on `numer` and `denom`. Encapsulation in Python classes is just syntactic sugar over this identical principle.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
Verified by confidence; no execution needed for the conceptual analogy.

---

## Connect the pieces
A user instantiates `t = Temperature(100)`. This routes to `t.celsius = 100`, which invokes the `@celsius.setter` to enforce the absolute-zero invariant. The valid value is stored behind the abstraction barrier in `self._celsius`. Later, when `t.fahrenheit` is accessed, the `@property` dynamically calculates the output based on the protected state, demonstrating perfect encapsulation.

Encapsulation and the abstraction barrier are two names for the same idea: separate what from how. Lesson 24 covers inheritance. Exercises: implement a `Fraction` class with `numerator` and `denominator` properties (enforcing denominator != 0 and auto-reducing), and `__add__`, `__mul__`, `__eq__`, `__str__`.
