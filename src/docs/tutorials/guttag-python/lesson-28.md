# Lesson 28: OOP Capstone — BankAccount, SavingsAccount, and Portfolio

What you will build: The reader builds a complete OOP system: BankAccount base class, SavingsAccount subclass, and Portfolio aggregator, applying all OOP concepts from previous lessons. The transferable insight: OOP is not about inheritance hierarchies. It is about encapsulation (data + behavior in one unit), single responsibility (each class does one thing), and separation of concerns (Portfolio doesn't know how accounts work internally).

What you need to know first: Lessons 00-27.

Terms used in this lesson:
- **Encapsulation** — Bundling data with the methods that operate on that data, restricting direct access to some of the object's components. This prevents external code from putting the object into an invalid state.
- **Inheritance** — A mechanism where a new class derives properties and behaviors from an existing class. It models an "is-a" relationship, allowing reuse of the base class's code.
- **Composition** — A design principle where a class is composed of one or more objects of other classes to provide complex behavior. It models a "has-a" relationship.
- **Duck typing** — A concept where the type or the class of an object is less important than the methods it defines. If it walks like a duck and quacks like a duck, it is treated as a duck.
- **Property** — A way to define methods that can be accessed like attributes, allowing computation or validation on access/mutation while maintaining an intuitive syntax.
- **Class method** — A method bound to the class and not the instance of the class, allowing it to modify class state that applies across all instances.
- **Static method** — A utility method that belongs to a class conceptually but doesn't require access to class or instance state.
- **Single responsibility** — The principle that every class should have exactly one job or responsibility.
- **Separation of concerns** — Organizing a system such that different sections address separate concerns, reducing dependencies between them.

Objects and methods used:
- **`BankAccount`**
  - *What it is:* A base class for representing a bank account.
  - *Implementation:* A Python `class`.
  - *Its use:* To store an owner's name, manage a balance, and record transactions.
  - *Type:* Class.
  - *Responsibility:* Manages account balance and transaction history while enforcing invariants (e.g., no negative balance on creation).
  - *Depends on:* `owner` string and optional `balance` float.
  - *Connects to:* Interacts with `Portfolio` which holds instances of it.
  - *Shape:* Domain model entity.
- **`SavingsAccount`**
  - *What it is:* A specialized type of bank account.
  - *Implementation:* A subclass of `BankAccount`.
  - *Its use:* To model an account that earns interest.
  - *Type:* Class.
  - *Responsibility:* Adds interest computation to the standard bank account features.
  - *Depends on:* `owner` string, `balance` float, and `rate` float.
  - *Connects to:* Reuses `BankAccount` methods via `super()`.
  - *Shape:* Domain model subclass.
- **`Portfolio`**
  - *What it is:* A collection of accounts owned by a single entity.
  - *Implementation:* A Python `class` containing a list of objects.
  - *Its use:* To aggregate multiple accounts and perform operations across them.
  - *Type:* Class.
  - *Responsibility:* Aggregates total balance and applies interest to eligible accounts.
  - *Depends on:* An `owner` string.
  - *Connects to:* Holds and calls methods on `BankAccount` and `SavingsAccount` instances.
  - *Shape:* Aggregator/Composition root.
- **`@property`**
  - *What it is:* A built-in decorator function.
  - *Implementation:* `@property` decorator.
  - *Its use:* To define methods that can be accessed like attributes, allowing computation or validation.
  - *Type:* Decorator.
  - *Responsibility:* Controls getting, setting, and deleting attribute values implicitly.
  - *Depends on:* A getter method.
  - *Connects to:* Client code that reads/writes the property.
  - *Shape:* Accessor boundary.
- **`@classmethod`**
  - *What it is:* A built-in decorator that changes a method to receive the class as the first implicit argument.
  - *Implementation:* `@classmethod` decorator.
  - *Its use:* Used for factory methods or modifying class state.
  - *Type:* Decorator.
  - *Responsibility:* Operates on the class itself rather than an instance.
  - *Depends on:* The class object (`cls`).
  - *Connects to:* Can be called on the class or an instance.
  - *Shape:* Class-level API.
- **`@staticmethod`**
  - *What it is:* A built-in decorator that changes a method to not receive an implicit first argument.
  - *Implementation:* `@staticmethod` decorator.
  - *Its use:* Used for utility functions that belong in the class's namespace.
  - *Type:* Decorator.
  - *Responsibility:* Provides logic logically related to the class without depending on its state.
  - *Depends on:* Only its explicit parameters.
  - *Connects to:* Called on the class or instance.
  - *Shape:* Utility function scoped to a class.

## Concept Unit: BankAccount — encapsulation and invariants

### The Problem
How do we group related data (like a balance and owner) with the operations that modify it (like deposit and withdraw) while preventing invalid states (like a negative deposit)?
- What happens if we just use a dictionary for an account and write standalone functions?
- How can we stop external code from just changing the balance directly?

### Introduce the concept in isolation
```python
class Counter:
    def __init__(self):
        self._count = 0
    def increment(self):
        self._count += 1
    def get_count(self):
        return self._count

c = Counter()
c.increment()
print(c.get_count())
```
Predicted confidently: `1`.
This proves that we can hide the internal state (`_count`) and only allow modification through a controlled method (`increment`). This is called **Encapsulation**.

### Discard the throwaway
The throwaway `Counter` example is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: Created `models.py`.
- **Change type**: Add.
- **Location**: New file.
- **Dependencies**: None.

### The New Code
```python
class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0):
        if balance < 0:
            raise ValueError('Initial balance cannot be negative')
        self._owner = owner          # _: convention for 'private'
        self._balance = balance
        self._transactions = []

    @property
    def balance(self):
        return self._balance

    @property
    def owner(self):
        return self._owner

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError(f'Deposit amount must be positive, got {amount}')
        self._balance += amount
        self._transactions.append(('deposit', amount, self._balance))
        return self._balance

    def withdraw(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError(f'Withdrawal must be positive, got {amount}')
        if amount > self._balance:
            raise ValueError(f'Insufficient funds: balance {self._balance}, requested {amount}')
        self._balance -= amount
        self._transactions.append(('withdraw', amount, self._balance))
        return self._balance

    def statement(self):
        lines = [f'Account: {self._owner}', f'Balance: ${self._balance:.2f}', 'Transactions:']
        for txn_type, amount, bal in self._transactions:
            lines.append(f'  {txn_type:>8}: ${amount:8.2f} -> ${bal:.2f}')
        return '\n'.join(lines)

    def __repr__(self):
        return f'BankAccount({self._owner!r}, balance={self._balance:.2f})'
```

### The Updated Project
```python
1: class BankAccount: # <- new
2:     def __init__(self, owner: str, balance: float = 0.0):
3:         if balance < 0:
4:             raise ValueError('Initial balance cannot be negative')
5:         self._owner = owner          # _: convention for 'private'
6:         self._balance = balance
7:         self._transactions = []
8: 
9:     @property
10:     def balance(self):
11:         return self._balance
12: 
13:     @property
14:     def owner(self):
15:         return self._owner
16: 
17:     def deposit(self, amount: float) -> float:
18:         if amount <= 0:
19:             raise ValueError(f'Deposit amount must be positive, got {amount}')
20:         self._balance += amount
21:         self._transactions.append(('deposit', amount, self._balance))
22:         return self._balance
23: 
24:     def withdraw(self, amount: float) -> float:
25:         if amount <= 0:
26:             raise ValueError(f'Withdrawal must be positive, got {amount}')
27:         if amount > self._balance:
28:             raise ValueError(f'Insufficient funds: balance {self._balance}, requested {amount}')
29:         self._balance -= amount
30:         self._transactions.append(('withdraw', amount, self._balance))
31:         return self._balance
32: 
33:     def statement(self):
34:         lines = [f'Account: {self._owner}', f'Balance: ${self._balance:.2f}', 'Transactions:']
35:         for txn_type, amount, bal in self._transactions:
36:             lines.append(f'  {txn_type:>8}: ${amount:8.2f} -> ${bal:.2f}')
37:         return '\n'.join(lines)
38: 
39:     def __repr__(self):
40:         return f'BankAccount({self._owner!r}, balance={self._balance:.2f})'
```
This entire class acts as the blueprint for bank accounts.

### Mechanical walkthrough
- `class BankAccount:` defines a new class.
- `def __init__(...):` initializes a new object, validating inputs.
- `self._balance` creates a private-by-convention attribute.
- `@property` makes the `balance` and `owner` methods act like read-only attributes.
- `def deposit(...)` and `def withdraw(...)` define actions that mutate the state while enforcing rules via `if amount <= 0: raise ValueError(...)`.
- `self._transactions.append(...)` logs a tuple of the action, amount, and resulting balance.
- `def statement(...)` iterates over transactions and formats them into a string.
- `def __repr__(...)` provides a developer-friendly string representation of the object.

### CS lens
This is **Encapsulation** and **Invariants**. Invariants are rules that must always be true for an object to be valid. This appears in database constraints, networking protocols maintaining valid state machines, and OS permissions structures.

### SE lens
This demonstrates the **Single Responsibility Principle**. The class manages its own data and guarantees its validity. We could have used a plain dictionary, but that would force every caller to validate the rules themselves, risking inconsistencies.

### Commands needed
None for this unit.

### Run it
```python
acc = BankAccount('Alice', 1000)
acc.deposit(500)
acc.withdraw(200)
print(acc.statement())
```
Predicted confidently:
```
Account: Alice
Balance: $1300.00
Transactions:
   deposit: $  500.00 -> $1500.00
  withdraw: $  200.00 -> $1300.00
```

### One sentence connecting to previous unit
Now that we have a standard bank account, we can create specialized versions of it.

## Concept Unit: SavingsAccount — extending with interest

### The Problem
We need an account that earns interest, but it should still be able to do everything a regular bank account does.
- How can we reuse all the logic for balances and transactions?
- Do we copy and paste the `BankAccount` code into a new class?

### Introduce the concept in isolation
```python
class Animal:
    def speak(self): return "..."
class Dog(Animal):
    def speak(self): return "Woof"
d = Dog()
print(d.speak())
```
Predicted confidently: `Woof`.
This proves that a child class can inherit and override behavior from a parent class. This is called **Inheritance**.

### Discard the throwaway
The throwaway `Dog` example is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modified `models.py`.
- **Change type**: Add.
- **Location**: After the `BankAccount` class.
- **Dependencies**: Depends on `BankAccount`.

### The New Code
```python
class SavingsAccount(BankAccount):
    def __init__(self, owner: str, balance: float = 0.0, rate: float = 0.05):
        super().__init__(owner, balance)
        if not 0 < rate <= 1:
            raise ValueError(f'Rate must be between 0 and 1, got {rate}')
        self._rate = rate

    @property
    def rate(self):
        return self._rate

    def add_interest(self) -> float:
        interest = round(self._balance * self._rate, 2)
        self.deposit(interest)   # reuse inherited method; logs as transaction
        return interest

    def __repr__(self):
        return f'SavingsAccount({self._owner!r}, balance={self._balance:.2f}, rate={self._rate})'
```

### The Updated Project
```python
42: class SavingsAccount(BankAccount): # <- new
43:     def __init__(self, owner: str, balance: float = 0.0, rate: float = 0.05):
44:         super().__init__(owner, balance)
45:         if not 0 < rate <= 1:
46:             raise ValueError(f'Rate must be between 0 and 1, got {rate}')
47:         self._rate = rate
48: 
49:     @property
50:     def rate(self):
51:         return self._rate
52: 
53:     def add_interest(self) -> float:
54:         interest = round(self._balance * self._rate, 2)
55:         self.deposit(interest)   # reuse inherited method; logs as transaction
56:         return interest
57: 
58:     def __repr__(self):
59:         return f'SavingsAccount({self._owner!r}, balance={self._balance:.2f}, rate={self._rate})'
```
This subclass extends `BankAccount` with an interest rate and an operation to add interest.

### Mechanical walkthrough
- `class SavingsAccount(BankAccount):` defines a subclass inheriting from `BankAccount`.
- `def __init__(...)` accepts additional arguments like `rate`.
- `super().__init__(owner, balance)` calls the parent class's constructor to handle common initialization.
- `self._rate = rate` stores the subclass-specific data.
- `def add_interest(...)` calculates the interest and calls `self.deposit(interest)`, reusing the inherited method.
- `def __repr__(...)` overrides the parent's string representation.

### CS lens
This is **Inheritance**. It allows for code reuse and polymorphism. This concept appears in GUI frameworks, ORM models in web frameworks, and game engines.

### SE lens
This demonstrates the **Open/Closed Principle**. We extended the behavior of our account system without modifying the original `BankAccount` code. The alternative would be adding `is_savings` flags and branches inside `BankAccount`, which scales poorly.

### Commands needed
None for this unit.

### Run it
```python
sav = SavingsAccount('Bob', 2000, rate=0.03)
interest = sav.add_interest()
print(f'Interest added: ${interest:.2f}')  # $60.00
print(sav.balance)  # 2060.0
print(sav.statement())
```
Predicted confidently:
```
Interest added: $60.00
2060.0
Account: Bob
Balance: $2060.00
Transactions:
   deposit: $   60.00 -> $2060.00
```

### One sentence connecting to previous unit
Now that we have different types of accounts, we need a way to group them together for a single user.

## Concept Unit: Portfolio — composition over inheritance

### The Problem
A user often has multiple accounts. How do we group them and calculate aggregate data, like the total balance across all accounts?
- Should `Portfolio` inherit from `BankAccount`?
- How does `Portfolio` interact with both `BankAccount` and `SavingsAccount` at the same time?

### Introduce the concept in isolation
```python
class Engine:
    def start(self): return "Vroom"
class Car:
    def __init__(self):
        self.engine = Engine()
    def start_car(self):
        return self.engine.start()
c = Car()
print(c.start_car())
```
Predicted confidently: `Vroom`.
This proves that a class can contain instances of other classes to build complex structures. This is called **Composition**.

### Discard the throwaway
The throwaway `Car` example is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modified `models.py`.
- **Change type**: Add.
- **Location**: After the `SavingsAccount` class.
- **Dependencies**: Depends on `BankAccount` and `SavingsAccount`.

### The New Code
```python
class Portfolio:
    def __init__(self, owner: str):
        self._owner = owner
        self._accounts = []      # list of BankAccount objects

    def add_account(self, account):
        self._accounts.append(account)
        return self

    def total_balance(self) -> float:
        return sum(acc.balance for acc in self._accounts)

    def apply_interest(self):
        total = 0
        for acc in self._accounts:
            if hasattr(acc, 'add_interest'):   # duck typing
                total += acc.add_interest()
        return total

    def summary(self) -> str:
        lines = [f'Portfolio: {self._owner}']
        for acc in self._accounts:
            lines.append(f'  {acc!r}')
        lines.append(f'  Total: ${self.total_balance():.2f}')
        return '\n'.join(lines)
```

### The Updated Project
```python
61: class Portfolio: # <- new
62:     def __init__(self, owner: str):
63:         self._owner = owner
64:         self._accounts = []      # list of BankAccount objects
65: 
66:     def add_account(self, account):
67:         self._accounts.append(account)
68:         return self
69: 
70:     def total_balance(self) -> float:
71:         return sum(acc.balance for acc in self._accounts)
72: 
73:     def apply_interest(self):
74:         total = 0
75:         for acc in self._accounts:
76:             if hasattr(acc, 'add_interest'):   # duck typing
77:                 total += acc.add_interest()
78:         return total
79: 
80:     def summary(self) -> str:
81:         lines = [f'Portfolio: {self._owner}']
82:         for acc in self._accounts:
83:             lines.append(f'  {acc!r}')
84:         lines.append(f'  Total: ${self.total_balance():.2f}')
85:         return '\n'.join(lines)
```
This class acts as a container for multiple account objects.

### Mechanical walkthrough
- `class Portfolio:` defines the aggregator class.
- `self._accounts = []` initializes an empty list to hold account instances.
- `def add_account(...)` appends to the list and returns `self` to allow method chaining.
- `def total_balance(...)` iterates over `self._accounts` and sums their `.balance` properties.
- `def apply_interest(...)` checks if each account has an `add_interest` method using `hasattr(acc, 'add_interest')`.
- If it does, it calls it and keeps a running total of the applied interest. This is **Duck Typing**.

### CS lens
This is **Composition** and **Duck Typing**. Composition models "has-a" relationships. Duck typing focuses on object capabilities rather than inheritance hierarchies. This appears in plugin architectures, dynamic dispatch systems, and DOM node trees.

### SE lens
This demonstrates **Separation of Concerns**. The `Portfolio` doesn't know how `add_interest` is calculated or how a `BankAccount` stores its balance. It just knows they expose those interfaces.

### Commands needed
None for this unit.

### Run it
```python
portfolio = Portfolio('Alice')
portfolio.add_account(BankAccount('Checking', 5000))
portfolio.add_account(SavingsAccount('Savings', 10000, rate=0.04))
print(portfolio.summary())
print(f'Interest earned: ${portfolio.apply_interest():.2f}')
```
Predicted confidently:
```
Portfolio: Alice
  BankAccount('Checking', balance=5000.00)
  SavingsAccount('Savings', balance=10000.00, rate=0.04)
  Total: $15000.00
Interest earned: $400.00
```

### One sentence connecting to previous unit
We've seen basic properties used to access private fields, but we can also use them to validate data when fields are assigned.

## Concept Unit: Properties and encapsulation

### The Problem
If we make a field public, anyone can set it to an invalid value. If we use a setter method like `set_celsius(value)`, the syntax feels clunky compared to just `t.celsius = value`.
- How do we allow assignment syntax but still validate the input?

### Introduce the concept in isolation
```python
class Temperature:
    def __init__(self, celsius: float):
        self.celsius = celsius   # calls the setter

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError(f'Temperature below absolute zero: {value}')
        self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9/5 + 32   # computed, read-only

t = Temperature(100)
print(t.celsius)     # 100
print(t.fahrenheit)  # 212.0
t.celsius = 0
print(t.fahrenheit)  # 32.0
# t.celsius = -300   # ValueError: Temperature below absolute zero
```
Predicted confidently:
```
100
212.0
32.0
```
This proves that we can intercept attribute access and assignment using methods. This is called a **Property**.

### Discard the throwaway
The throwaway `Temperature` example is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: Theory/Exploration only.
- **Location**: Standalone.
- **Dependencies**: None.

### The New Code
```python
# No new code added to models.py for this unit.
```

### The Updated Project
```python
# The project is unchanged in this unit.
```

### Mechanical walkthrough
- `@property` decorates a method to be accessed as an attribute (the getter).
- `@celsius.setter` decorates a method to handle assignments to that attribute (the setter).
- Inside the setter, `if value < -273.15:` intercepts and rejects invalid data.
- The `fahrenheit` property computes its value dynamically rather than storing it, proving properties can be computed on the fly.

### CS lens
This is **Accessor Methods** (getters/setters). In some languages, they are explicit function calls; in others like C# or Python, they are wrapped in property syntax to look like field access. This appears in reactivity systems, data binding libraries, and ORM lazy-loading logic.

### SE lens
This demonstrates **Information Hiding**. The internal representation (`_celsius`) is completely hidden from the consumer, who just interacts with `celsius` and `fahrenheit`.

### Commands needed
None for this unit.

### Run it
Predicted confidently: We ran it in isolation above.

### One sentence connecting to previous unit
Besides operating on specific objects via methods and properties, classes themselves can have behavior attached to them.

## Concept Unit: Class methods, static methods, and __slots__

### The Problem
Sometimes a method is related to the class concept, but doesn't operate on a specific instance (e.g., parsing a dictionary to create an account, or keeping track of how many accounts exist).
- How do we define methods on the class itself rather than on instances?
- What if we have a utility function that needs no state at all?

### Introduce the concept in isolation
```python
class Utility:
    count = 0
    
    @classmethod
    def increment(cls):
        cls.count += 1
        return cls.count
        
    @staticmethod
    def is_even(num):
        return num % 2 == 0

print(Utility.increment())
print(Utility.is_even(4))
```
Predicted confidently:
```
1
True
```
This proves that we can attach methods to the class scope and state. These are called **Class Methods** and **Static Methods**.

### Discard the throwaway
The throwaway `Utility` example is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modified `models.py`.
- **Change type**: Add.
- **Location**: Inside the `BankAccount` class.
- **Dependencies**: None.

### The New Code
```python
    _count = 0    # class variable: shared across all instances

    @classmethod
    def from_dict(cls, data: dict):
        '''Create account from a dict: {'owner': ..., 'balance': ...}'''
        return cls(data['owner'], data.get('balance', 0))

    @staticmethod
    def is_valid_amount(amount) -> bool:
        return isinstance(amount, (int, float)) and amount > 0

    @classmethod
    def account_count(cls):
        return cls._count
```
And add `BankAccount._count += 1` inside `__init__`.

### The Updated Project
```python
1: class BankAccount:
2:     _count = 0    # class variable: shared across all instances # <- new
3: 
4:     def __init__(self, owner: str, balance: float = 0.0):
5:         if balance < 0:
6:             raise ValueError('Initial balance cannot be negative')
7:         self._owner = owner          # _: convention for 'private'
8:         self._balance = balance
9:         self._transactions = []
10:        BankAccount._count += 1 # <- new
11: 
12:     @classmethod # <- new
13:     def from_dict(cls, data: dict):
14:         '''Create account from a dict: {'owner': ..., 'balance': ...}'''
15:         return cls(data['owner'], data.get('balance', 0))
16: 
17:     @staticmethod # <- new
18:     def is_valid_amount(amount) -> bool:
19:         return isinstance(amount, (int, float)) and amount > 0
20: 
21:     @classmethod # <- new
22:     def account_count(cls):
23:         return cls._count
```

### Mechanical walkthrough
- `_count = 0` is a class variable, shared across all instances of `BankAccount`.
- `BankAccount._count += 1` inside `__init__` increments this shared counter whenever a new instance is created.
- `@classmethod` decorates a method to receive the class itself (`cls`) as its first argument instead of an instance (`self`).
- `cls(data['owner'], ...)` uses `cls` to instantiate a new object dynamically. This is a factory method.
- `@staticmethod` decorates a method that receives neither `self` nor `cls`. It behaves like a normal function but is logically scoped inside the class namespace.

### CS lens
These are **Factory Methods** and **Class-Level State**. Factory methods provide alternative ways to instantiate objects. This appears in JSON deserializers, Singleton patterns, and thread pool executors.

### SE lens
This demonstrates the **Factory Pattern**. Instead of having a giant, complex `__init__` that tries to guess whether you passed a dictionary or standard arguments, we provide a dedicated factory method `from_dict` with a clear, specific intention.

### Commands needed
None for this unit.

### Run it
```python
acc = BankAccount.from_dict({'owner': 'Alice', 'balance': 500})
print(acc.balance)                       # 500
print(BankAccount.is_valid_amount(100))  # True
print(BankAccount.account_count())       # 1
```
Predicted confidently:
```
500
True
1
```

### One sentence connecting to previous unit
We've now fully explored how to encapsulate behavior, structure object relationships, and provide class-level utilities.

## Closing

### Connect the pieces
Let's look at the flow of data through our entire system when Alice makes a deposit and the portfolio checks its status:
1. `SavingsAccount('Alice', 10000, 0.05)` is called. This triggers `__init__`, which uses `super().__init__` to increment the `BankAccount._count` class variable.
2. `Portfolio('Alice')` is created, and `portfolio.add_account(...)` links the new `SavingsAccount` into its `_accounts` list, demonstrating composition.
3. A call to `portfolio.apply_interest()` iterates over `_accounts`. Using duck typing, it finds `add_interest` on the `SavingsAccount`.
4. `add_interest` calculates the interest and calls its inherited `self.deposit(...)` method.
5. `deposit` enforces its invariants, updates the private `_balance`, and logs the transaction.
6. The `Portfolio` then reports its `total_balance()` by aggregating the encapsulated `.balance` properties from all its accounts.

Through encapsulation, inheritance, composition, properties, and class methods, the data remains valid at every step, and no class is forced to understand the internal mechanisms of the others.
