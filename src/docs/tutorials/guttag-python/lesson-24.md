# Lesson 24: Inheritance — `class Child(Parent)`

What you will build: You will build an inheritance hierarchy of bank accounts: `BankAccount` as a base class, with `SavingsAccount` and `CheckingAccount` as subclasses. You will use `super()` to reuse initialization logic, override methods to customize behavior, and learn when NOT to use inheritance by preferring composition. The transferable problems this solves are: (1) inheritance creates an IS-A relationship — a `SavingsAccount` IS A `BankAccount`, meaning it can be used anywhere a `BankAccount` is expected; (2) `super()` calls the parent's implementation, allowing a subclass to extend rather than replace it; and (3) avoiding the main danger of inheritance, which is tight coupling where subclasses depend heavily on the parent's internals, making changes risky.

What you need to know first: Lessons 0–23 (full curriculum through encapsulation).

**Terms used in this lesson:**
- **Inheritance** — A mechanism where one class acquires the properties and methods of another class, solving the problem of code duplication by allowing shared behavior to be defined once in a parent class.
- **IS-A relationship** — A strict conceptual link where a subclass is a specialized version of its superclass, ensuring that the subclass can safely stand in for the parent without breaking expectations.
- **Polymorphism** — The ability of different classes to provide different implementations for the same method name, allowing caller code to interact with various object types uniformly without needing to check their exact class.
- **Method Resolution Order (MRO)** — The strict sequence in which Python searches for a method or attribute in a class hierarchy, preventing ambiguity when multiple classes are involved.
- **Composition** — A design approach where a class contains instances of other classes to achieve functionality, solving the problem of rigid inheritance hierarchies by allowing interchangeable parts.
- **HAS-A relationship** — The conceptual link formed by composition, where an object contains another object (e.g., a Car HAS-A Engine) rather than being a specialized version of it.

**Objects and methods used:**
- **`super()`**
  - *What it is:* A built-in function that returns a proxy object that delegates method calls to a parent or sibling class.
  - *Implementation:* `super()` (in Python 3, implicitly resolves the current class and instance).
  - *Its use:* To call a parent class's method from within an overridden method in a subclass, specifically used here to reuse the parent's `__init__` or validation logic.
  - *Type:* Built-in function.
  - *Responsibility:* Dispatches method calls safely according to the Method Resolution Order (MRO) without hardcoding the parent class name.
  - *Depends on:* Implicitly relies on the surrounding class definition and the current instance (`self`) when called without arguments.
  - *Connects to:* Called by subclass methods; invokes superclass methods, passing control and arguments up the hierarchy.
  - *Shape:* An internal implementation detail used within the body of subclass methods.

- **`isinstance()`**
  - *What it is:* A built-in function that checks if an object is an instance of a specific class or any of its subclasses.
  - *Implementation:* `isinstance(object, classinfo)` returning a boolean.
  - *Its use:* To verify an object's type against a class hierarchy, proving that a subclass instance satisfies an IS-A relationship with its parent.
  - *Type:* Built-in function.
  - *Responsibility:* Determines dynamic type relationships at runtime to safely guarantee an object supports a required interface.
  - *Depends on:* An object to check and a class (or tuple of classes) to check against.
  - *Connects to:* Called by application code or test logic; interrogates the object's `__class__` and inheritance tree.
  - *Shape:* A runtime validation boundary.

- **`issubclass()`**
  - *What it is:* A built-in function that checks if a class is derived from another class.
  - *Implementation:* `issubclass(class, classinfo)` returning a boolean.
  - *Its use:* To analyze the class hierarchy itself, independent of any instances.
  - *Type:* Built-in function.
  - *Responsibility:* Verifies structural inheritance relationships between class definitions.
  - *Depends on:* A target class and a base class to check against.
  - *Connects to:* Called by system configuration or reflection code; reads class metadata.
  - *Shape:* A reflection mechanism used for architectural assertions.

- **`abc.ABC`**
  - *What it is:* A helper class from the `abc` module used as a base class to define Abstract Base Classes.
  - *Implementation:* `class Shape(ABC):`
  - *Its use:* To create a base class that cannot be instantiated on its own and dictates exactly which methods subclasses must implement.
  - *Type:* Base class.
  - *Responsibility:* Enforces interface contracts at runtime, preventing the creation of incomplete subclasses.
  - *Depends on:* Subclasses inheriting from it and the `abc` module's metaclass machinery.
  - *Connects to:* Inherited by base classes; evaluated by the Python runtime during object instantiation.
  - *Shape:* An architectural boundary that strictly defines a public contract.

- **`abc.abstractmethod`**
  - *What it is:* A decorator indicating a method must be overridden in a subclass.
  - *Implementation:* `@abstractmethod` placed above a method definition.
  - *Its use:* To define the required signature of a method in an Abstract Base Class without providing a working implementation.
  - *Type:* Decorator function.
  - *Responsibility:* Marks methods as required, triggering runtime errors if a subclass fails to provide concrete implementations for them.
  - *Depends on:* The method being decorated and the class inheriting from `ABC`.
  - *Connects to:* Decorates base class methods; enforced by the runtime upon subclass instantiation.
  - *Shape:* A contractual requirement applied to specific API endpoints.


## Concept Unit: The IS-A relationship

### The Problem

We frequently write code for objects that share identical core behaviors but have distinct specializations. If we copy and paste the shared behavior into every new class, we create a maintenance nightmare: fixing a bug in the shared logic requires finding and updating every copy. We need a way to say "this new class is exactly like that old class, but with these specific differences."

> **Socratic prompt:** Think about how you would model a generic "Animal" and a specific "Dog". If an `Animal` has a `speak()` method, and you want a `Dog` to have the exact same method but return a different string, how would you currently achieve this without duplicating the entire `Animal` class? What happens if `Animal` later gets a `sleep()` method?

### Introduce the concept in isolation

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError('Subclass must implement speak()')

    def __str__(self):
        return f'{self.__class__.__name__}({self.name!r})'

class Dog(Animal):
    def speak(self):
        return f'{self.name} says: Woof!'

class Cat(Animal):
    def speak(self):
        return f'{self.name} says: Meow!'

fido = Dog('Fido')
whiskers = Cat('Whiskers')
print(fido.speak())
print(whiskers.speak())
print(isinstance(fido, Dog))
print(isinstance(fido, Animal))
print(isinstance(whiskers, Dog))
```
*(Output stated from confidence, not executed:)*
```text
Fido says: Woof!
Whiskers says: Meow!
True
True
False
```
This proves that a `Dog` acquires the `__init__` and `__str__` methods defined in `Animal`, while providing its own `speak()` behavior. The built-in `isinstance` confirms that `fido` satisfies both the `Dog` type and the `Animal` type. This mechanism is called **inheritance**.

### Discard the throwaway example

The `Animal`, `Dog`, and `Cat` classes are deleted and will not appear in the project again. This is exactly what we will do with bank accounts in our project code.

### Project Change

We will start our project by creating a base `BankAccount` class.
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `accounts.py` (created)
- **Change type:** Add
- **Location:** At the top of the new file.
- **Dependencies:** None.

### The New Code

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = float(balance)
        self.history = []

    def deposit(self, amount):
        self.balance += amount
        self.history.append(('deposit', amount))

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError('Insufficient funds')
        self.balance -= amount
        self.history.append(('withdraw', amount))
```

### The Updated Project

```python
# 1: class BankAccount:
# 2:     def __init__(self, owner, balance=0):
# 3:         self.owner = owner
# 4:         self.balance = float(balance)
# 5:         self.history = []
# 6: 
# 7:     def deposit(self, amount):
# 8:         self.balance += amount
# 9:         self.history.append(('deposit', amount))
# 10: 
# 11:     def withdraw(self, amount):
# 12:         if amount > self.balance:
# 13:             raise ValueError('Insufficient funds')
# 14:         self.balance -= amount
# 15:         self.history.append(('withdraw', amount))
```
This creates a complete, standalone base class that handles ownership, balances, and a transaction history.

### Mechanical walkthrough

- `class BankAccount:` declares a new blueprint. By default in Python 3, all classes inherit from the fundamental `object` class.
- `def __init__(self, owner, balance=0):` is the constructor that initializes state.
- `self.owner = owner` stores the owner's name.
- `self.balance = float(balance)` ensures the balance is stored as a float.
- `self.history = []` initializes an empty list to track transactions.
- `def deposit(self, amount):` defines a method to add funds.
- `self.balance += amount` modifies the instance's balance.
- `self.history.append(('deposit', amount))` records a tuple of the action and amount.
- `def withdraw(self, amount):` defines a method to remove funds.
- `if amount > self.balance:` is a safeguard preventing overdrafts.
- `raise ValueError('Insufficient funds')` halts execution if the requested amount exceeds the balance.
- `self.balance -= amount` deducts the amount.
- `self.history.append(('withdraw', amount))` records the withdrawal tuple.


## Concept Unit: `super()` — calling the parent

### The Problem

If we want to create a `SavingsAccount` that adds an `interest_rate` attribute, we need its `__init__` method to set up that new attribute. However, the `SavingsAccount` still needs an `owner`, a `balance`, and a `history` list. If we rewrite those assignments in the new `__init__`, we have duplicated logic. If the parent class changes how it initializes, our subclass is broken.

> **Socratic prompt:** If you have to define `__init__` in a new `SavingsAccount` class to accept an `interest_rate`, how can you make sure the `owner` and `balance` variables get set up exactly the same way `BankAccount` does it, without just copying the code?

### Introduce the concept in isolation

```python
class Base:
    def __init__(self, x):
        self.x = x
        print(f"Base initialized with {x}")

class Derived(Base):
    def __init__(self, x, y):
        super().__init__(x)
        self.y = y
        print(f"Derived initialized with {y}")

d = Derived(10, 20)
```
*(Output stated from confidence, not executed:)*
```text
Base initialized with 10
Derived initialized with 20
```
This proves that the child class delegates part of its initialization to the parent class before continuing with its own specific logic. This function is called **`super()`**.

### Discard the throwaway example

The `Base` and `Derived` classes are deleted and will not appear in the project again.

### Project Change

We will add a `SavingsAccount` that inherits from `BankAccount`.
- **Reference Source:** No reference counterpart.
- **Files affected:** `accounts.py`
- **Change type:** Add
- **Location:** Below the `BankAccount` class.
- **Dependencies:** `BankAccount`.

### The New Code

```python
class SavingsAccount(BankAccount):
    def __init__(self, owner, balance=0, interest_rate=0.02):
        super().__init__(owner, balance)
        self.interest_rate = interest_rate

    def apply_interest(self):
        interest = self.balance * self.interest_rate
        self.deposit(interest)
        return interest
```

### The Updated Project

```python
# ... BankAccount class ...
# 18: class SavingsAccount(BankAccount):
# 19:     def __init__(self, owner, balance=0, interest_rate=0.02):
# 20:         super().__init__(owner, balance)
# 21:         self.interest_rate = interest_rate
# 22: 
# 23:     def apply_interest(self):
# 24:         interest = self.balance * self.interest_rate
# 25:         self.deposit(interest)
# 26:         return interest
```
This new class inherits everything from `BankAccount` but provides a custom initialization and an entirely new method.

### Mechanical walkthrough

- `class SavingsAccount(BankAccount):` defines a new class that IS-A `BankAccount`. Python will search `BankAccount` for any methods not found in `SavingsAccount`.
- `def __init__(self, owner, balance=0, interest_rate=0.02):` is the overridden constructor. It intercepts the initialization process.
- `super().__init__(owner, balance)` calls the **`super()`** function, which returns a proxy object representing the parent class, and immediately calls its `__init__` method, passing `owner` and `balance`. This avoids duplicating the parent's setup logic.
- `self.interest_rate = interest_rate` assigns the new attribute unique to this subclass.
- `def apply_interest(self):` introduces a new method that `BankAccount` does not have.
- `interest = self.balance * self.interest_rate` calculates the interest.
- `self.deposit(interest)` reuses the **inherited** `deposit` method. The subclass didn't define `deposit`, so Python looks it up in `BankAccount`.
- `return interest` hands the calculated value back to the caller.


## Concept Unit: Overriding methods

### The Problem

Inheritance isn't just for adding entirely new methods; sometimes we need to alter an existing behavior. If a checking account charges a fee on every withdrawal, the parent's standard `withdraw` method isn't sufficient. We must intercept the action, apply the fee, and still enforce the parent's core rules (like checking for sufficient funds).

> **Socratic prompt:** If you write a `withdraw` method inside `CheckingAccount`, it will hide the parent's `withdraw` method. How can you add a $1.50 fee to the requested amount and then still use the parent's reliable math and balance checking to process the rest of the transaction?

### Introduce the concept in isolation

```python
class Parent:
    def greet(self):
        print("Hello from Parent")

class Child(Parent):
    def greet(self):
        print("Child says: ", end="")
        super().greet()

c = Child()
c.greet()
```
*(Output stated from confidence, not executed:)*
```text
Child says: Hello from Parent
```
This proves that defining a method in a subclass masks the parent's method, but the parent's version can still be accessed explicitly using `super()`. This technique is called **method overriding**.

### Discard the throwaway example

The `Parent` and `Child` classes are deleted.

### Project Change

We will add a `CheckingAccount` class that charges a fee on withdrawals.
- **Reference Source:** No reference counterpart.
- **Files affected:** `accounts.py`
- **Change type:** Add
- **Location:** Below the `SavingsAccount` class.
- **Dependencies:** `BankAccount`.

### The New Code

```python
class CheckingAccount(BankAccount):
    def __init__(self, owner, balance=0, fee=1.50):
        super().__init__(owner, balance)
        self.fee = fee

    def withdraw(self, amount):
        total = amount + self.fee
        super().withdraw(total)
        return self.balance
```

### The Updated Project

```python
# ... BankAccount and SavingsAccount classes ...
# 28: class CheckingAccount(BankAccount):
# 29:     def __init__(self, owner, balance=0, fee=1.50):
# 30:         super().__init__(owner, balance)
# 31:         self.fee = fee
# 32: 
# 33:     def withdraw(self, amount):
# 34:         total = amount + self.fee
# 35:         super().withdraw(total)
# 36:         return self.balance
```
The subclass customizes `withdraw` to inject new business logic while delegating the core operation back to the parent.

### Mechanical walkthrough

- `class CheckingAccount(BankAccount):` declares another subclass of `BankAccount`.
- `def __init__(self, owner, balance=0, fee=1.50):` intercepts initialization to accept a `fee`.
- `super().__init__(owner, balance)` safely delegates the common setup to the parent.
- `self.fee = fee` stores the unique fee attribute.
- `def withdraw(self, amount):` **overrides** the parent's method. When `checking.withdraw()` is called, Python stops here and never automatically proceeds to the parent's version.
- `total = amount + self.fee` calculates the true cost of the withdrawal.
- `super().withdraw(total)` explicitly reaches up to the parent class's implementation, utilizing its robust math and `ValueError` check, passing the adjusted `total`.
- `return self.balance` returns the updated state after the parent finishes its work.


## Concept Unit: `isinstance()`, `issubclass()`, and the method resolution order

### The Problem

When you have a complex system of classes, you often need to verify if an unknown object is safe to use. If a function requires a `BankAccount`, passing a `SavingsAccount` should be perfectly acceptable (because it IS-A `BankAccount`). We need runtime tools to inspect these relationships and understand exactly how Python decides which method to run.

> **Socratic prompt:** If you have an object and you want to know if it's a `BankAccount` or something that derived from it, how would you check? What sequence does Python follow if you call a method and it's not defined in the object's direct class, nor in its parent class?

### Introduce the concept in isolation

```python
class A: pass
class B(A): pass
class C(B): pass

obj = C()
print(isinstance(obj, A))
print(issubclass(C, A))
print(C.__mro__)
```
*(Output stated from confidence, not executed:)*
```text
True
True
(<class '__main__.C'>, <class '__main__.B'>, <class '__main__.A'>, <class 'object'>)
```
This proves that an object satisfies the identity of every ancestor class above it, and that Python maintains a strict linear sequence (the **Method Resolution Order**) to search for methods.

### Discard the throwaway example

Classes `A`, `B`, and `C` are discarded.

### Project Change

We will write a small validation script to interrogate the types we just built.
- **Reference Source:** No reference counterpart.
- **Files affected:** `inspect_types.py` (created)
- **Change type:** Add
- **Location:** At the top of the new file.
- **Dependencies:** The classes in `accounts.py`.

### The New Code

```python
from accounts import BankAccount, SavingsAccount, CheckingAccount

savings = SavingsAccount('Alice', 1000)

print(isinstance(savings, SavingsAccount))
print(isinstance(savings, BankAccount))
print(isinstance(savings, CheckingAccount))
print(issubclass(SavingsAccount, BankAccount))
print(issubclass(BankAccount, SavingsAccount))
print(SavingsAccount.__mro__)
```

### The Updated Project

```python
# 1: from accounts import BankAccount, SavingsAccount, CheckingAccount
# 2: 
# 3: savings = SavingsAccount('Alice', 1000)
# 4: 
# 5: print(isinstance(savings, SavingsAccount))
# 6: print(isinstance(savings, BankAccount))
# 7: print(isinstance(savings, CheckingAccount))
# 8: print(issubclass(SavingsAccount, BankAccount))
# 9: print(issubclass(BankAccount, SavingsAccount))
# 10: print(SavingsAccount.__mro__)
```
This test file exercises the type system against our actual domain models.

### Mechanical walkthrough

- `from accounts import ...` imports our hierarchy.
- `savings = SavingsAccount('Alice', 1000)` creates a concrete instance.
- `print(isinstance(savings, SavingsAccount))` calls **`isinstance()`** to verify exact type match, yielding `True`.
- `print(isinstance(savings, BankAccount))` verifies the IS-A relationship: a `SavingsAccount` is also a valid `BankAccount`, yielding `True`.
- `print(isinstance(savings, CheckingAccount))` proves sibling classes do not satisfy each other; this yields `False`.
- `print(issubclass(SavingsAccount, BankAccount))` calls **`issubclass()`** on the raw class definitions rather than instances, confirming the structural relationship (`True`).
- `print(issubclass(BankAccount, SavingsAccount))` demonstrates that inheritance is strictly one-way: a parent is not a subclass of its child (`False`).
- `print(SavingsAccount.__mro__)` accesses the special `__mro__` attribute. This tuple dictates the **Method Resolution Order**: Python looks in `SavingsAccount`, then `BankAccount`, then the base `object`.


## Concept Unit: Abstract base classes — enforcing the interface

### The Problem

Sometimes a base class exists purely to define an interface — a common set of methods that all subclasses *must* provide — but the base class itself doesn't make sense to instantiate. For instance, what is the area of a generic `Shape`? If we leave it up to convention, a developer might subclass `Shape` and forget to write an `area()` method, leading to a runtime crash later. We need a way to force subclasses to implement specific methods.

> **Socratic prompt:** If you write `class Shape:` with an `area` method that just has `pass`, how do you prevent someone from actually doing `s = Shape()`? How do you guarantee that `class Rectangle(Shape):` will refuse to work if the author forgets to add `def area(self):`?

### Introduce the concept in isolation

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

    def describe(self):
        return f'{self.__class__.__name__}: area={self.area():.2f}'

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

r = Rectangle(4, 6)
print(r.area())
print(r.describe())
try:
    Shape()
except TypeError as e:
    print(f"Error: {e}")
```
*(Output stated from confidence, not executed:)*
```text
24
Rectangle: area=24.00
Error: Can't instantiate abstract class Shape with abstract method area
```
This proves that inheriting from `ABC` and marking methods with `@abstractmethod` enforces a strict contract: the base class cannot be instantiated, and any subclass must provide concrete implementations for all abstract methods. This is an **abstract base class**.

### Discard the throwaway example

The `Shape` and `Rectangle` classes are discarded. They serve to demonstrate the mechanism.

### Project Change

Because our `BankAccount` *is* a fully functional concrete class (you can have a generic bank account), we will not modify it to be abstract here. But this concept is crucial for interfaces. We will note its structure.

### The New Code
*(No new project code for this unit. The isolated example stands as the structural pattern).*

### Mechanical walkthrough

- `from abc import ABC, abstractmethod` pulls the necessary infrastructure from the standard library.
- `class Shape(ABC):` inherits from **`ABC`**, altering how Python constructs this class.
- `@abstractmethod` decorates the `area` method, declaring it as a required contract.
- `def area(self): pass` provides no implementation.
- `def describe(self):` is a concrete method inside the abstract base class. It safely calls `self.area()` because the `ABC` machinery guarantees that any instantiated subclass *will* have a valid `area` method.
- `class Rectangle(Shape):` declares a subclass.
- `def area(self):` fulfills the contract. If this was missing, `Rectangle` would also become abstract and un-instantiable.
- `Shape()` raises a `TypeError`, actively preventing the instantiation of an incomplete concept.


## Concept Unit: When NOT to use inheritance — prefer composition

### The Problem

Inheritance is incredibly powerful, which makes it easy to abuse. If you need engine-like functionality in a `Car` class, you might be tempted to make `Car` inherit from `Engine`. But a `Car` is not an `Engine`—it *has* an `Engine`. Abusing inheritance for code reuse creates fragile, tightly coupled architectures where a change to the parent breaks completely unrelated subclasses.

> **Socratic prompt:** If you have a `DatabaseConnection` class with `connect()` and `query()` methods, and you are writing a `UserDirectory` class that needs to look up users, should `UserDirectory` inherit from `DatabaseConnection`? What is the actual relationship between a directory and a connection?

### Introduce the concept in isolation

```python
# BAD: using inheritance when there's no IS-A relationship
class Engine:
    def start(self): print("Engine started")

class CarInherit(Engine):
    pass

# GOOD: composition
class CarCompose:
    def __init__(self):
        self.engine = Engine()

    def start(self):
        self.engine.start()

c_bad = CarInherit()
c_bad.start()

c_good = CarCompose()
c_good.start()
```
*(Output stated from confidence, not executed:)*
```text
Engine started
Engine started
```
This proves that you can reuse behavior from another class either by inheriting from it (which implies IS-A) or by holding an instance of it inside an attribute. Using attributes to hold behavior is called **composition**. The rule is: use inheritance for IS-A, use composition for HAS-A.

### Discard the throwaway example

The `Engine` and `Car` examples are discarded.

### Project Change

In our `accounts.py`, we track transaction `history` as a simple list. If transaction tracking becomes highly complex (e.g., auditing, persistent logging), we should *not* make `BankAccount` inherit from an `AuditLogger`. Instead, it HAS-A logger.

### The New Code
*(No new project code. The `history` attribute we created earlier (`self.history = []`) is already a basic form of composition: the account HAS-A list).*

### Mechanical walkthrough
- `class Engine:` defines a standalone capability.
- `class CarInherit(Engine):` is a design error. A Car IS NOT an Engine.
- `class CarCompose:` is the correct architecture.
- `self.engine = Engine()` stores an instance of `Engine` as an attribute. This is **composition**.
- `def start(self):` defines the public API of the Car.
- `self.engine.start()` delegates the actual work to the composed object. The Car controls how and when the Engine is used, without being tightly fused to its internal inheritance tree.


## Concept Unit: A polymorphic portfolio

### The Problem

The true power of an IS-A relationship is how external code interacts with it. If a bank manager wants to calculate total assets or apply a nightly batch process, they shouldn't need to write separate loops for `BankAccount`, `SavingsAccount`, and `CheckingAccount`. They just want to interact with a generic list of accounts and trust each object to do the right thing.

> **Socratic prompt:** If you have a list containing one instance of each of our three account types, and you loop over it calling `account.deposit(100)`, how does Python know whether to charge a fee, apply interest logic, or just do a standard deposit? Do you have to write `if type(account) == CheckingAccount:` inside the loop?

### Introduce the concept in isolation

```python
class Bird:
    def sound(self): return "Tweet"
class Duck(Bird):
    def sound(self): return "Quack"
class Crow(Bird):
    def sound(self): return "Caw"

flock = [Bird(), Duck(), Crow()]
for b in flock:
    print(b.sound())
```
*(Output stated from confidence, not executed:)*
```text
Tweet
Quack
Caw
```
This proves that a single loop calling the exact same method name (`sound()`) produces different behavior depending on the actual underlying type of the object. This transparent, automatic routing is called **polymorphism**.

### Discard the throwaway example

The birds are discarded.

### Project Change

We will write a final script to demonstrate a polymorphic portfolio of our bank accounts.
- **Reference Source:** No reference counterpart.
- **Files affected:** `portfolio.py` (created)
- **Change type:** Add
- **Location:** At the top of the new file.
- **Dependencies:** The classes in `accounts.py`.

### The New Code

```python
from accounts import BankAccount, SavingsAccount, CheckingAccount

accounts = [
    BankAccount('Dave', 200),
    SavingsAccount('Eve', 500, 0.03),
    CheckingAccount('Frank', 300, fee=1.00),
]

for account in accounts:
    account.deposit(100)
    print(f'{account.owner}: ${account.balance:.2f}')

total = sum(a.balance for a in accounts)
print(f'Total assets: ${total:.2f}')
```

### The Updated Project

```python
# 1: from accounts import BankAccount, SavingsAccount, CheckingAccount
# 2: 
# 3: accounts = [
# 4:     BankAccount('Dave', 200),
# 5:     SavingsAccount('Eve', 500, 0.03),
# 6:     CheckingAccount('Frank', 300, fee=1.00),
# 7: ]
# 8: 
# 9: for account in accounts:
# 10:     account.deposit(100)
# 11:     print(f'{account.owner}: ${account.balance:.2f}')
# 12: 
# 13: total = sum(a.balance for a in accounts)
# 14: print(f'Total assets: ${total:.2f}')
```
This script treats a heterogeneous list of accounts uniformly, relying on polymorphism to handle the underlying differences.

### Mechanical walkthrough

- `accounts = [...]` defines a list holding three distinct class types. Because `SavingsAccount` and `CheckingAccount` IS-A `BankAccount`, this is logically a list of bank accounts.
- `for account in accounts:` iterates over each instance.
- `account.deposit(100)` calls the `deposit` method. Because we did not override `deposit` in the subclasses, Python's MRO directs all three calls to the base `BankAccount.deposit` implementation.
- `print(f'{account.owner}: ${account.balance:.2f}')` accesses the unified attributes guaranteed by the base class contract.
- `total = sum(a.balance for a in accounts)` uses a generator expression to extract the balance from every polymorphic object.
- `print(f'Total assets: ${total:.2f}')` prints the final sum. The caller code remains completely ignorant of whether it interacted with a checking or savings account; it only cares that they all fulfill the `BankAccount` contract.

---

**Inheritance** enables profound code reuse and enables **polymorphism**, allowing systems to scale gracefully as new types are added. In the next lesson, Lesson 25, we will cover special methods (dunder methods), which allow you to make your objects feel and behave exactly like native Python objects.

**Exercises:**
1. Add a `PremiumSavingsAccount` subclass that requires a minimum balance and offers a higher interest rate, overriding initialization and withdrawal logic.
2. Write a standalone function `total_balance(accounts)` that safely sums balances only if `isinstance()` confirms the object IS-A `BankAccount`.
