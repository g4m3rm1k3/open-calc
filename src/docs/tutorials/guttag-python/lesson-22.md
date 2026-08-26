# Lesson 22: Classes — `class`, `__init__`, and `self`

You will build a `BankAccount` class step by step. The working feature is a bank account that tracks a balance and transaction history, allowing deposits and withdrawals. The transferable problems this lesson is actually about are: (1) a class is a blueprint; an instance is a concrete object made from that blueprint; (2) `self` is the instance itself — it is passed automatically as the first argument to every method; (3) `__str__` and `__repr__` make your objects printable in a readable way.

**What you need to know first:** Lessons 0–21 (the complete curriculum through program structure).

**Terms used in this lesson:**
- **Class** — a blueprint for creating objects, defining their initial state and behavior. It exists so we can create many independent objects of the same type without duplicating code.
- **Instance** — a concrete object created from a class blueprint. It exists because blueprints alone don't hold data; instances hold actual, separate state in memory.
- **Method** — a function defined inside a class that operates on instances of that class. It exists to bundle behavior with the data it manipulates.
- **Instance variable** — a variable bound to a specific instance (`self.name`). It exists to hold state unique to one object.
- **Class variable** — a variable bound to the class itself, shared by all instances. It exists to hold state or configuration common to the entire type.
- **Fluent interface** — a design pattern where methods return `self` to allow chaining (`obj.a().b()`). It exists to make sequential operations read cleanly.
- **Mutable default argument** — a default parameter that can change (like an empty list). It exists as a Python mechanism but is a trap in `__init__`, because all instances would share the same list.

**Objects and methods used:**

- **BankAccount**
  - *What it is:* The main class we are building to represent an individual's bank account.
  - *Implementation:* `class BankAccount:`
  - *Its use:* To bundle a balance and transaction history with the methods that safely modify them.
  - *Type:* Class.
  - *Responsibility:* Manages account state, ensures withdrawals don't exceed balance, and records all transactions.
  - *Depends on:* An owner string and an initial balance.
  - *Connects to:* Called by user scripts to perform financial operations; calls standard Python types (lists, strings).
  - *Shape:* The core domain model of our banking application.

- **`__init__`**
  - *What it is:* The initialization method called automatically when a new instance is created.
  - *Implementation:* `def __init__(self, owner, balance=0):`
  - *Its use:* To set up the initial instance variables for a newly allocated object.
  - *Type:* Instance method (special/dunder).
  - *Responsibility:* Initializes the raw allocated object into a valid, usable state before returning it to the caller.
  - *Depends on:* `self` (the new object), `owner`, and optionally `balance`.
  - *Connects to:* Called implicitly by Python when `BankAccount(...)` is invoked.
  - *Shape:* The entry point for object state lifecycle.

- **Everything else in the file, not this lesson's subject but still explained:**

- **`type`**
  - *What it is:* A built-in function that returns the type of an object.
  - *Implementation:* `type(object)`
  - *Its use:* To prove that our custom instances are actually of the new class type.
  - *Type:* Built-in function.
  - *Responsibility:* Retrieves the runtime class of a given object.
  - *Depends on:* Any Python object.
  - *Connects to:* Called by our verification code; returns a type object.
  - *Shape:* Diagnostic utility.

- **`isinstance`**
  - *What it is:* A built-in function that checks if an object is an instance of a class.
  - *Implementation:* `isinstance(object, classinfo)`
  - *Its use:* To verify type hierarchy.
  - *Type:* Built-in function.
  - *Responsibility:* Returns True if the object is an instance of the class or a subclass.
  - *Depends on:* An object and a class.
  - *Connects to:* Called by validation code.
  - *Shape:* Type-checking utility.

## Concept Unit: Defining a class and creating an instance

### The Problem
We need a way to group related data (like an owner name and balance) and behavior (like depositing). Dictionaries hold data but can't ensure structure or attach behaviors.
How would you currently group an owner and a balance so you can pass them around together? What happens if you try to add a function that only works on that specific group?

### Introduce the concept in isolation
```python
class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

fido = Dog('Fido', 'Labrador')
rex  = Dog('Rex', 'German Shepherd')

print(fido.name)
print(rex.breed)
print(type(fido))
print(isinstance(fido, Dog))
```
Output:
```
Fido
German Shepherd
<class '__main__.Dog'>
True
```
This output proves that `fido` and `rex` are independent objects of a new type called **Dog**, and they hold their own separate data.

### Discard the throwaway example
The `Dog` class is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting the project.
- **Files affected:** Created `bank.py`.
- **Change type:** Add.
- **Location:** At the top of the new file.
- **Dependencies:** None.

### The New Code — type it yourself
```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
```

### The Updated Project — return, immediately, before any explanation
```python
1: class BankAccount:
2:     def __init__(self, owner, balance=0):
3:         self.owner = owner
4:         self.balance = balance
```
This structure creates a new type `BankAccount` and defines how to initialize a new instance with an owner and a starting balance.

### Mechanical walkthrough — how it works in isolation
1. `class BankAccount:` declares a new type blueprint named BankAccount.
2. `def __init__(self, owner, balance=0):` defines the initialization method. `self` is a convention (not a keyword) for the first parameter — it refers to the instance being initialized or operated on.
3. `self.owner = owner` attaches the `owner` argument to the specific instance (`self`) as an instance variable.
4. `self.balance = balance` attaches the `balance` argument to the instance.

### CS lens
Also recognized in: C++ classes, Java blueprints, database schemas, struct definitions.

### SE lens — why it's engineered this way
Objects encapsulate state. The alternative was keeping separate variables or dictionaries for every account and hoping we don't misspell a key. The cost is a slightly heavier syntax upfront, but the tradeoff is guaranteed structure and behavior bundling.

### Commands needed to make this unit real, if any
No terminal commands needed yet.

### Run it, per the Verification Rule
```python
account = BankAccount('Alice', 100)
print(account.owner)
```
Output:
```
Alice
```

### One sentence connecting this unit to what came immediately before
Now that we can create a basic object with data, we need to add behaviors that can actually manipulate that data.

## Concept Unit: Instance variables and methods

### The Problem
An account needs to process deposits and withdrawals. Where do we put the logic that modifies the balance so that it belongs to the account?
If you wrote a free-floating `def deposit(account, amount):` function, how would you ensure someone doesn't accidentally change `account['balance']` directly?

### Introduce the concept in isolation
```python
class Counter:
    def __init__(self):
        self.count = 0
    def increment(self):
        self.count += 1

c = Counter()
c.increment()
print(c.count)
```
Output:
```
1
```
This proves that a **method** (`increment`) can read and modify the instance's own state (`self.count`).

### Discard the throwaway example
The `Counter` class is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `bank.py` modified.
- **Change type:** Add.
- **Location:** Inside `BankAccount`, after `__init__`.
- **Dependencies:** None.

### The New Code — type it yourself
```python
    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError('Insufficient funds')
        self.balance -= amount
        return self.balance
```

### The Updated Project — return, immediately, before any explanation
```python
1: class BankAccount:
2:     def __init__(self, owner, balance=0):
3:         self.owner = owner
4:         self.balance = balance
5: 
6:     def deposit(self, amount):
7:         self.balance += amount
8:         return self.balance
9: 
10:     def withdraw(self, amount):
11:         if amount > self.balance:
12:             raise ValueError('Insufficient funds')
13:         self.balance -= amount
14:         return self.balance
```
The `BankAccount` class now has behaviors `deposit` and `withdraw` that safely modify the instance's state.

### Mechanical walkthrough — how it works in isolation
1. `def deposit(self, amount):` defines an instance method.
2. `self.balance += amount` modifies `account.balance` when Python translates `account.deposit(50)` to `BankAccount.deposit(account, 50)`. Inside `deposit`, `self` IS `account`.
3. `return self.balance` returns the updated state.
4. `def withdraw(self, amount):` defines another method.
5. `if amount > self.balance:` checks the instance's state to enforce business rules.
6. `raise ValueError(...)` rejects invalid operations.
7. `self.balance -= amount` performs the modification.

### CS lens
Also recognized in: message passing in Smalltalk, actor models, finite state machine transitions.

### SE lens — why it's engineered this way
Methods enforce invariants. The alternative is letting outside code do `account.balance -= amount`, which can bypass the `Insufficient funds` check. Putting the logic inside the class protects the data.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
```python
account = BankAccount('Alice', 100)
print(account.deposit(50))
print(account.withdraw(30))
print(account.balance)
```
Output:
```
150
120
120
```

### One sentence connecting this unit to what came immediately before
With behavior now bundled, we have functional objects, but printing them looks ugly and uninformative.

## Concept Unit: `__str__` and `__repr__`

### The Problem
When you print an object, Python outputs something like `<__main__.BankAccount object at 0x10a2b3c40>`. How do we make objects print their actual data meaningfully?
What happens if you try to `print(account)` right now? What would you ideally want it to say?

### Introduce the concept in isolation
```python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __str__(self):
        return f"({self.x}, {self.y})"
    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p = Point(1, 2)
print(p)
print(repr(p))
```
Output:
```
(1, 2)
Point(1, 2)
```
This proves that **dunder methods** `__str__` and `__repr__` control how objects are converted to strings.

### Discard the throwaway example
The `Point` class is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `bank.py` modified.
- **Change type:** Add.
- **Location:** Inside `BankAccount`, after `withdraw`.
- **Dependencies:** None.

### The New Code — type it yourself
```python
    def __repr__(self):
        return f'BankAccount(owner={self.owner!r}, balance={self.balance})'

    def __str__(self):
        return f"Account[{self.owner}]: ${self.balance:.2f}"
```

### The Updated Project — return, immediately, before any explanation
```python
1: class BankAccount:
2:     def __init__(self, owner, balance=0):
3:         self.owner = owner
4:         self.balance = balance
...
15: 
16:     def __repr__(self):
17:         return f'BankAccount(owner={self.owner!r}, balance={self.balance})'
18: 
19:     def __str__(self):
20:         return f"Account[{self.owner}]: ${self.balance:.2f}"
```
The class now knows how to format itself for developers (`__repr__`) and users (`__str__`).

### Mechanical walkthrough — how it works in isolation
1. `def __repr__(self):` defines the developer-readable representation — used by `repr()`, in lists, in the REPL. Rule: `__repr__` should ideally be valid Python that recreates the object.
2. `return f'BankAccount(owner={self.owner!r}, balance={self.balance})'` formats the string. `!r` ensures strings are quoted.
3. `def __str__(self):` defines the human-readable representation — used by `print()` and `str()`.
4. `return f"Account[{self.owner}]: ${self.balance:.2f}"` provides a nice summary.

### CS lens
Also recognized in: `toString()` in Java, `ToString()` in C#, serialization formats.

### SE lens — why it's engineered this way
Separation of concerns for output. The alternative is one representation for everything, meaning logs get messy user-facing strings or users see raw code structures.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
```python
account = BankAccount('Alice', 100)
print(account)
print(repr(account))
accounts = [account]
print(accounts)
```
Output:
```
Account[Alice]: $100.00
BankAccount(owner='Alice', balance=100)
[BankAccount(owner='Alice', balance=100)]
```

### One sentence connecting this unit to what came immediately before
Now that instances can describe themselves nicely, we can explore data that belongs to the class as a whole, rather than to individual instances.

## Concept Unit: Class variables vs instance variables

### The Problem
What if all accounts share the same interest rate, and we want to update it for everyone at once? Storing `self.interest_rate = 0.02` on every instance means updating it requires looping through every account in existence.
If you need a single configuration value shared across a thousand objects, where would you store it so they all see it simultaneously?

### Introduce the concept in isolation
```python
class Settings:
    theme = "dark"
    
s1 = Settings()
s2 = Settings()
print(s1.theme, s2.theme)
Settings.theme = "light"
print(s1.theme, s2.theme)
```
Output:
```
dark dark
light light
```
This proves that a **class variable** is shared by all instances, and changing it on the class affects all instances immediately.

### Discard the throwaway example
The `Settings` class is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `bank.py` modified.
- **Change type:** Add.
- **Location:** Inside `BankAccount`, at the top of the class definition, and a new method.
- **Dependencies:** None.

### The New Code — type it yourself
```python
    interest_rate = 0.02
    account_count = 0

    # Inside __init__:
    # BankAccount.account_count += 1

    def apply_interest(self):
        self.balance *= (1 + BankAccount.interest_rate)
```

### The Updated Project — return, immediately, before any explanation
```python
1: class BankAccount:
2:     interest_rate = 0.02   # CLASS variable: shared by all instances
3:     account_count = 0      # CLASS variable: counts all accounts
4: 
5:     def __init__(self, owner, balance=0):
6:         self.owner = owner       # INSTANCE variable: unique to this account
7:         self.balance = balance   # INSTANCE variable
8:         BankAccount.account_count += 1
...
22:     def apply_interest(self):
23:         self.balance *= (1 + BankAccount.interest_rate)
```
The class now tracks global state (count, interest rate) alongside per-instance state.

### Mechanical walkthrough — how it works in isolation
1. `interest_rate = 0.02` defines a class variable at the class level, shared by all instances.
2. `account_count = 0` defines another class variable.
3. `BankAccount.account_count += 1` increments the class variable inside `__init__` each time a new instance is created.
4. `def apply_interest(self):` defines a new method.
5. `self.balance *= (1 + BankAccount.interest_rate)` calculates interest using the class variable. Accessing a name on an instance first checks the instance's `__dict__`, then the class's `__dict__`.

### CS lens
Also recognized in: `static` fields in Java/C++, global application state, shared memory segments.

### SE lens — why it's engineered this way
Memory efficiency and single source of truth. The alternative is instance variables, duplicating `0.02` in memory for every object and risking them getting out of sync.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
```python
a1 = BankAccount('Alice', 1000)
a2 = BankAccount('Bob', 500)
print(BankAccount.account_count)
print(a1.interest_rate)
BankAccount.interest_rate = 0.03
print(a1.interest_rate)
print(a2.interest_rate)
```
Output:
```
2
0.02
0.03
0.03
```

### One sentence connecting this unit to what came immediately before
With shared and per-instance state managed, we can make these independent objects interact with each other.

## Concept Unit: Methods that return new objects

### The Problem
To transfer money between accounts, you need to withdraw from one and deposit into another. How do you allow chaining operations cleanly so you can write things like `account.transfer_to(bob, 50).apply_interest()`?
If a method modifies the object but doesn't return anything, what happens when you try to chain another method call right after it?

### Introduce the concept in isolation
```python
class TextBuilder:
    def __init__(self, text=""):
        self.text = text
    def append(self, t):
        self.text += t
        return self

b = TextBuilder()
b.append("Hello").append(" World")
print(b.text)
```
Output:
```
Hello World
```
This proves that returning `self` creates a **fluent interface**, allowing method chaining.

### Discard the throwaway example
The `TextBuilder` class is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `bank.py` modified.
- **Change type:** Add.
- **Location:** Inside `BankAccount`, after `apply_interest`.
- **Dependencies:** None.

### The New Code — type it yourself
```python
    def transfer_to(self, other, amount):
        self.withdraw(amount)
        other.deposit(amount)
        return self
```

### The Updated Project — return, immediately, before any explanation
```python
24:     def transfer_to(self, other, amount):
25:         self.withdraw(amount)
26:         other.deposit(amount)
27:         return self  # fluent interface -- allows chaining
```
The account can now collaborate with another account object to move funds, and returns itself for chaining.

### Mechanical walkthrough — how it works in isolation
1. `def transfer_to(self, other, amount):` takes another `BankAccount` object as an argument. This is how objects collaborate.
2. `self.withdraw(amount)` calls the instance's own method.
3. `other.deposit(amount)` calls the collaborating object's method.
4. `return self` returns the current instance, enabling method chaining (fluent interface).

### CS lens
Also recognized in: Monadic binds, jQuery API design, Builder patterns in Java.

### SE lens — why it's engineered this way
Object collaboration and ergonomics. The alternative is writing freestanding functions to orchestrate interactions. Returning `self` is a convenience that makes complex sequences highly readable.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
```python
alice = BankAccount('Alice', 500)
bob   = BankAccount('Bob', 100)
alice.transfer_to(bob, 200)
print(alice.balance)
print(bob.balance)
```
Output:
```
300
300
```

### One sentence connecting this unit to what came immediately before
Now that money moves around, we need a way to track the history of these movements over time inside the object.

## Concept Unit: The transaction history — using a list as an instance variable

### The Problem
An account's balance isn't enough; we need an audit trail of every deposit and withdrawal. How do we store a growing list of actions on the object itself?
Why shouldn't you define the history list as a default argument like `def __init__(self, owner, balance=0, history=[]):`?

### Introduce the concept in isolation
```python
class Logger:
    def __init__(self):
        self.logs = []
    def log(self, msg):
        self.logs.append(msg)

l1 = Logger()
l2 = Logger()
l1.log("A")
print(l1.logs)
print(l2.logs)
```
Output:
```
['A']
[]
```
This proves that assigning a fresh list inside `__init__` gives every instance its own separate list.

### Discard the throwaway example
The `Logger` class is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `bank.py` modified.
- **Change type:** Add / Modify.
- **Location:** Update `__init__`, `deposit`, `withdraw`, and add `statement`.
- **Dependencies:** None.

### The New Code — type it yourself
```python
    # In __init__:
    self.history = []

    # In deposit, after modifying balance:
    self.history.append(('deposit', amount, self.balance))

    # In withdraw, after modifying balance:
    self.history.append(('withdraw', amount, self.balance))

    def statement(self):
        for tx_type, amount, balance in self.history:
            print(f'{tx_type:10s} ${amount:8.2f}  balance: ${balance:.2f}')
```

### The Updated Project — return, immediately, before any explanation
```python
1: class BankAccount:
...
5:     def __init__(self, owner, balance=0):
6:         self.owner = owner
7:         self.balance = balance
8:         self.history = []        # mutable instance variable
9:         BankAccount.account_count += 1
10: 
11:     def deposit(self, amount):
12:         self.balance += amount
13:         self.history.append(('deposit', amount, self.balance))
14:         return self.balance
15: 
16:     def withdraw(self, amount):
17:         if amount > self.balance:
18:             raise ValueError('Insufficient funds')
19:         self.balance -= amount
20:         self.history.append(('withdraw', amount, self.balance))
21:         return self.balance
...
29:     def statement(self):
30:         for tx_type, amount, balance in self.history:
31:             print(f'{tx_type:10s} ${amount:8.2f}  balance: ${balance:.2f}')
```
The account now maintains a ledger of its own actions, recording every mutation.

### Mechanical walkthrough — how it works in isolation
1. `self.history = []` is initialized as an empty list in `__init__` — each instance gets its own list. Warning: never use a mutable default argument (`def __init__(self, history=[])`) — all instances would SHARE the same list!
2. `self.history.append(('deposit', amount, self.balance))` appends a tuple of transaction details to the list whenever state changes.
3. `def statement(self):` defines a reporting method.
4. `for tx_type, amount, balance in self.history:` unpacks the tuples from the list.
5. `print(f'{tx_type:10s} ${amount:8.2f}  balance: ${balance:.2f}')` formats the report row.

### CS lens
Also recognized in: Event Sourcing, append-only logs in databases, redo logs in filesystems.

### SE lens — why it's engineered this way
Auditability. The alternative is throwing away data (the path to the current balance). Storing complex state like a list of tuples on the instance allows the object to answer historical queries, not just current-state queries.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
```python
account = BankAccount('Alice', 0)
account.deposit(1000)
account.withdraw(250)
account.deposit(500)
account.statement()
```
Output:
```
deposit    $ 1000.00  balance: $1000.00
withdraw   $  250.00  balance: $ 750.00
deposit    $  500.00  balance: $1250.00
```

### One sentence connecting this unit to what came immediately before
Now that our objects are robust, we can add utility methods to the class blueprint itself.

## Concept Unit: Class methods and static methods

### The Problem
How do you write a method that modifies a class variable (like `interest_rate`) without needing an instance? What about utility functions that belong to the concept of a BankAccount but don't need access to either class or instance data?
If you want to validate an amount before depositing, does that logic require knowing the account's balance, or is it universally true?

### Introduce the concept in isolation
```python
class MathUtils:
    @staticmethod
    def add(a, b):
        return a + b

print(MathUtils.add(5, 7))
```
Output:
```
12
```
This proves that a **static method** works like a normal function but lives inside a class namespace.

### Discard the throwaway example
The `MathUtils` class is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `bank.py` modified.
- **Change type:** Add.
- **Location:** Inside `BankAccount`, near the top.
- **Dependencies:** None.

### The New Code — type it yourself
```python
    @classmethod
    def set_interest_rate(cls, rate):
        cls.interest_rate = rate

    @staticmethod
    def is_valid_amount(amount):
        return isinstance(amount, (int, float)) and amount > 0
```

### The Updated Project — return, immediately, before any explanation
```python
1: class BankAccount:
2:     interest_rate = 0.02
3:     account_count = 0
4: 
5:     @classmethod
6:     def set_interest_rate(cls, rate):
7:         cls.interest_rate = rate  # cls is the CLASS, not an instance
8: 
9:     @staticmethod
10:     def is_valid_amount(amount):
11:         return isinstance(amount, (int, float)) and amount > 0
```
The class now provides behavior at the blueprint level, independently of instances.

### Mechanical walkthrough — how it works in isolation
1. `@classmethod` is a decorator modifying the method below it.
2. `def set_interest_rate(cls, rate):` receives the CLASS as the first argument (`cls`), not an instance. It is used for factory methods or class-level operations.
3. `cls.interest_rate = rate` modifies the class variable directly.
4. `@staticmethod` modifies the method below it.
5. `def is_valid_amount(amount):` receives no implicit first argument (`self` or `cls`) — it's a regular function that lives in the class namespace for organizational reasons.
6. `return isinstance(amount, (int, float)) and amount > 0` performs pure logic on its arguments.

### CS lens
Also recognized in: C# static methods, Java static utility classes, Ruby class methods.

### SE lens — why it's engineered this way
Namespace organization. The alternative is leaving `is_valid_amount` as a floating function in the module. Putting it in the class signals that it conceptually belongs to BankAccount domain logic.

### Commands needed to make this unit real, if any
None.

### Run it, per the Verification Rule
```python
BankAccount.set_interest_rate(0.05)
print(BankAccount.interest_rate)
print(BankAccount.is_valid_amount(100))
print(BankAccount.is_valid_amount(-50))
print(BankAccount.is_valid_amount('100'))
```
Output:
```
0.05
True
False
False
```

### One sentence connecting this unit to what came immediately before
This completes our robust, fully-featured class definition.

## Closing
- **Connect the pieces** — Creating a `BankAccount` initializes state and a list; calling `deposit` mutates that state and appends to the list; calling `statement` reads that list to output history; all while `BankAccount.account_count` ticked up silently in the background.

Classes are the foundation of OOP in Python. Lesson 23 covers encapsulation — hiding implementation details and exposing a clean interface.
