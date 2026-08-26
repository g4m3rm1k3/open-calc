# Lesson 28: OOP Capstone — `BankAccount`, `SavingsAccount`, and `Portfolio`

**What you will build**
In this lesson, you will build a complete, tested object-oriented banking system consisting of a `BankAccount` base class, a `SavingsAccount` subclass that adds interest and minimum balance rules, and a `Portfolio` class that aggregates multiple accounts. While the feature itself is a basic banking simulation, the transferable problem this lesson solves is how to design an object-oriented system that is modular, testable, and extensible. We will see how encapsulation ensures data integrity, how inheritance allows logic reuse, and how composition lets us build higher-level managers without hardcoding dependencies on specific subclasses.

**What you need to know first**
- Lesson 27 — Dataclasses and full curriculum through Module 3
- You should be familiar with classes, instances, inheritance, `super()`, properties, and unit testing in Python.

**Terms used in this lesson**
- **Class-Responsibility-Collaborator (CRC)** — A design technique used to plan object-oriented software before writing code. It involves identifying the structural units (Classes), their full job descriptions (Responsibilities), and the other units they interact with (Collaborators). This prevents writing classes that do too much or that are tightly coupled.
- **Inheritance** — A mechanism where a new class (subclass) derives properties and behavior from an existing class (base class). This solves the problem of code duplication by allowing the subclass to reuse the base class's logic while overriding or extending specific parts.
- **Composition / Aggregation** — A design principle where a class contains instances of other classes to achieve complex functionality, rather than inheriting from them. It solves the problem of rigid inheritance hierarchies by allowing dynamic assembly of components at runtime.
- **Invariant** — A condition or rule about the state of an object that must always be true for the object to be valid. In our case, a bank balance being non-negative or above a minimum is an invariant that the class methods must protect.
- **Test Suite** — A collection of automated tests that verify the behavior of individual components (unit tests) and their interactions. It ensures that changes do not break existing functionality.
- **Base Class** — A class that is intended to be subclassed rather than instantiated directly (or serves as a generic foundation). It defines the common interface and behavior for its subclasses.
- **Subclass** — A class that inherits from a base class, extending or modifying its behavior.
- **Property** — A method disguised as an attribute, defined using the `@property` decorator. It solves the problem of needing to compute a value or control read/write access to an attribute without changing the interface for the caller.

**Objects and methods used**
- `BankAccount`
  - *What it is:* The base class representing a generic bank account.
  - *Implementation:* `class BankAccount:`
  - *Its use:* Provides the foundational state (owner, balance, history) and behaviors (deposit, withdraw, statement) for all accounts.
  - *Type:* Class
  - *Responsibility:* Manages the balance and transaction history of a single owner, ensuring deposits and withdrawals are valid.
  - *Depends on:* An owner string and an optional initial balance float.
  - *Connects to:* Called by the user or a `Portfolio`. Does not call any other custom classes.
  - *Shape:* A core domain model at the center of the architecture.

- `SavingsAccount`
  - *What it is:* A specialized type of bank account.
  - *Implementation:* `class SavingsAccount(BankAccount):`
  - *Its use:* Adds interest accumulation and minimum balance enforcement to the standard account behaviors.
  - *Type:* Class (Subclass of `BankAccount`)
  - *Responsibility:* Enforces savings-specific rules (minimum balance) and provides a mechanism to apply interest to the balance.
  - *Depends on:* An owner string, initial balance, interest rate, and minimum balance.
  - *Connects to:* Calls `super()` to reuse `BankAccount`'s initialization and withdrawal logic. Called by the user or a `Portfolio`.
  - *Shape:* A specialized domain model extending the core architecture.

- `Portfolio`
  - *What it is:* An aggregator that manages a collection of bank accounts.
  - *Implementation:* `class Portfolio:`
  - *Its use:* Groups multiple accounts together to provide aggregate summaries and batch operations (like applying interest to all eligible accounts).
  - *Type:* Class
  - *Responsibility:* Manages a list of `BankAccount` instances and provides unified operations across them.
  - *Depends on:* A name string.
  - *Connects to:* Calls methods and properties on the `BankAccount` and `SavingsAccount` instances it contains.
  - *Shape:* A manager/aggregate layer sitting above the domain models.

- `unittest.TestCase`
  - *What it is:* The base class for creating unit tests in Python's standard library.
  - *Implementation:* `class TestBankAccount(unittest.TestCase):`
  - *Its use:* Provides the assertion methods and test runner integration needed to verify our classes.
  - *Type:* Class (Framework Base)
  - *Responsibility:* Executes test methods and reports success or failure.
  - *Depends on:* The Python standard library `unittest` module.
  - *Connects to:* Calls the classes being tested (`BankAccount`, `SavingsAccount`, `Portfolio`).
  - *Shape:* Testing boundary isolated from the production code.

**Everything else in the file, not this lesson's subject but still explained**
- `@property`
  - *What it is:* A built-in Python decorator.
  - *Implementation:* `@property` above a method definition.
  - *Its use:* Exposes an internal attribute (like `_owner`) as a read-only property to the outside world.
  - *Type:* Decorator
  - *Responsibility:* Transforms a method call into attribute access.
  - *Depends on:* A method that takes only `self`.
  - *Connects to:* Wraps the decorated method.
  - *Shape:* Syntax feature defining class API boundaries.

- `super()`
  - *What it is:* A built-in function that returns a proxy object delegating method calls to a parent or sibling class.
  - *Implementation:* `super().withdraw(amount)`
  - *Its use:* Allows a subclass to invoke the overridden method of its base class.
  - *Type:* Built-in function
  - *Responsibility:* Resolves method calls to the next class in the Method Resolution Order (MRO).
  - *Depends on:* Being called inside a method of a class involved in inheritance.
  - *Connects to:* Calls the specified method on the parent class.
  - *Shape:* Internal implementation detail for code reuse.

- `isinstance()`
  - *What it is:* A built-in function to check an object's type.
  - *Implementation:* `isinstance(account, BankAccount)`
  - *Its use:* Used in `Portfolio` to ensure only valid account types are added, and in `monthly_update` to selectively apply interest.
  - *Type:* Built-in function
  - *Responsibility:* Returns `True` if the object is an instance or subclass of the specified class.
  - *Depends on:* An object and a class (or tuple of classes).
  - *Connects to:* Evaluates the object's type hierarchy.
  - *Shape:* Internal validation detail.

---

## Concept Unit: Design before code — CRC cards

### The Problem
When building a system with multiple interacting components, it is tempting to just start writing classes. However, without a plan, classes often end up with tangled responsibilities—a `Portfolio` that directly modifies an account's balance, or a `BankAccount` that knows too much about savings rates. How do we ensure our classes are focused, decoupled, and testable before writing a single line of Python?

If you were asked to model a bank with checking accounts, savings accounts, and a customer's portfolio, how would you divide the work? What would happen if the portfolio directly added interest to the balance instead of the account doing it?

### Introduce the concept in isolation
This is where **Class-Responsibility-Collaborator (CRC)** design comes in. It is a plain-text planning technique.

Let's design a simple "Wallet" concept using CRC before coding it. We write out the class, what it is responsible for, and who it collaborates with:

```text
Class: Wallet
Responsibility: Stores a current cash amount. Can add or remove cash.
Collaborator: None
```

We can quickly mock this in code to prove it works:

```python
class Wallet:
    def __init__(self):
        self.cash = 0
    def add(self, amount):
        self.cash += amount

w = Wallet()
w.add(50)
print(w.cash)
```

The output of running this would be:
```
50
```

This proves that by defining a clear responsibility (managing cash) and zero collaborators, we have a standalone, testable unit.

### Discard the throwaway example
The `Wallet` class is deleted and will not appear in our banking project.

### Project Change
No reference counterpart — this is a from-scratch addition because we are planning the architecture of our new banking system.

- **Files affected:** None (planning phase)
- **Change type:** Planning
- **Location:** N/A
- **Dependencies:** None

### The New Code
Here is the plain-text CRC design for our banking system:

```text
Class: BankAccount
Responsibility: Stores owner and balance; provides deposit, withdraw, statement.
Collaborators: None

Class: SavingsAccount (inherits from BankAccount)
Responsibility: Adds interest_rate and minimum_balance; provides apply_interest, overrides withdraw to enforce minimum.
Collaborators: BankAccount (parent)

Class: Portfolio
Responsibility: Aggregates BankAccount instances; provides add_account, total_balance, monthly_update.
Collaborators: BankAccount instances
```

### The Updated Project
Because this is plain-text planning, there is no Python structure to update yet. The design document serves as the blueprint for the entire system we are about to build.

### Mechanical walkthrough
- **Class: BankAccount:** The base class has no collaborators. This means it is entirely self-contained. It doesn't know about `Portfolio` or `SavingsAccount`. This makes it perfectly isolated and easy to test.
- **Class: SavingsAccount:** It collaborates with `BankAccount` (its parent). Its responsibility is strictly limited to savings-specific rules. It does not reinvent how a basic withdrawal works, it just enforces a minimum before deferring to the parent.
- **Class: Portfolio:** It collaborates with `BankAccount` instances. Notice it does not say it collaborates with `SavingsAccount`. By depending on the base `BankAccount` interface, `Portfolio` is decoupled from specific account types.

---

## Concept Unit: The `BankAccount` base class

### The Problem
We need a foundational class to represent a basic bank account. It must maintain a balance, record a history of transactions, and ensure that the balance is never manipulated invalidly (like withdrawing more than the balance).

Given our CRC card, how do we prevent an outside user from just doing `account.balance = 1000000`?

### Introduce the concept in isolation
We use **properties** to provide read-only access to internal state, and methods to safely modify it.

```python
class SimpleAccount:
    def __init__(self):
        self._balance = 0
        
    @property
    def balance(self):
        return self._balance
        
    def deposit(self, amount):
        self._balance += amount

acc = SimpleAccount()
acc.deposit(100)
print(acc.balance)
try:
    acc.balance = 500
except AttributeError as e:
    print(f"Error: {e}")
```

The output of running this would be:
```
100
Error: property 'balance' of 'SimpleAccount' object has no setter
```

This proves that `_balance` is protected from direct assignment, enforcing the rule that changes must go through `deposit`.

### Discard the throwaway example
The `SimpleAccount` class is deleted and will not appear in our project.

### Project Change
No reference counterpart — this is a from-scratch addition because we are starting our final capstone project.

- **Files affected:** `banking.py` (created)
- **Change type:** Add
- **Location:** Start of the file
- **Dependencies:** Standard library (`dataclasses`, `typing`, `datetime`)

### The New Code
```python
from typing import List, Tuple

class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0):
        if not isinstance(owner, str) or not owner.strip():
            raise ValueError('Owner must be a non-empty string')
        self._owner = owner
        self._balance = 0.0
        self._history: List[Tuple[str, float, float]] = []
        if balance:
            self.deposit(balance)

    @property
    def owner(self):
        return self._owner

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError(f'Deposit amount must be positive, got {amount}')
        self._balance += amount
        self._history.append(('deposit', amount, self._balance))
        return self._balance

    def withdraw(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError(f'Withdrawal amount must be positive, got {amount}')
        if amount > self._balance:
            raise ValueError(f'Insufficient funds: balance={self._balance}, requested={amount}')
        self._balance -= amount
        self._history.append(('withdraw', amount, self._balance))
        return self._balance

    def statement(self) -> str:
        lines = [f'Account: {self._owner}']
        for tx_type, amount, bal in self._history:
            lines.append(f'  {tx_type:10s} ${amount:8.2f}  balance: ${bal:.2f}')
        lines.append(f'  Current balance: ${self._balance:.2f}')
        return '\n'.join(lines)

    def __repr__(self):
        return f'{self.__class__.__name__}(owner={self._owner!r}, balance={self._balance:.2f})'
```

### The Updated Project
```python
1: from typing import List, Tuple
2: 
3: class BankAccount:
4:     def __init__(self, owner: str, balance: float = 0.0):
5:         if not isinstance(owner, str) or not owner.strip():
6:             raise ValueError('Owner must be a non-empty string')
7:         self._owner = owner
8:         self._balance = 0.0
9:         self._history: List[Tuple[str, float, float]] = []
10:        if balance:
11:            self.deposit(balance)
12:
13:    @property
14:    def owner(self):
15:        return self._owner
16:
17:    @property
18:    def balance(self):
19:        return self._balance
20:
21:    def deposit(self, amount: float) -> float:
22:        if amount <= 0:
23:            raise ValueError(f'Deposit amount must be positive, got {amount}')
24:        self._balance += amount
25:        self._history.append(('deposit', amount, self._balance))
26:        return self._balance
27:
28:    def withdraw(self, amount: float) -> float:
29:        if amount <= 0:
30:            raise ValueError(f'Withdrawal amount must be positive, got {amount}')
31:        if amount > self._balance:
32:            raise ValueError(f'Insufficient funds: balance={self._balance}, requested={amount}')
33:        self._balance -= amount
34:        self._history.append(('withdraw', amount, self._balance))
35:        return self._balance
36:
37:    def statement(self) -> str:
38:        lines = [f'Account: {self._owner}']
39:        for tx_type, amount, bal in self._history:
40:            lines.append(f'  {tx_type:10s} ${amount:8.2f}  balance: ${bal:.2f}')
41:        lines.append(f'  Current balance: ${self._balance:.2f}')
42:        return '\n'.join(lines)
43:
44:    def __repr__(self):
45:        return f'{self.__class__.__name__}(owner={self._owner!r}, balance={self._balance:.2f})'
```
This file now defines a robust `BankAccount` that protects its internal state and provides controlled methods for financial transactions.

### Mechanical walkthrough
- `from typing import List, Tuple` imports type hints to explicitly state what `_history` contains.
- `class BankAccount:` defines the base class.
- `def __init__(self, owner: str, balance: float = 0.0):` initializes the object.
- `if not isinstance(owner, str) or not owner.strip():` validates the owner input.
- `self._owner = owner` stores the owner string privately.
- `self._balance = 0.0` initializes the balance privately.
- `self._history: List[Tuple[str, float, float]] = []` creates a private history list.
- `if balance:` checks if an initial balance was provided.
- `self.deposit(balance)` delegates the initial balance assignment to the `deposit` method to ensure history is updated and rules are followed.
- `@property` decorates the `owner` and `balance` methods.
- `def owner(self):` and `def balance(self):` return the private variables, providing read-only access.
- `def deposit(self, amount: float) -> float:` handles adding money.
- `if amount <= 0:` prevents negative deposits.
- `self._balance += amount` updates the state.
- `self._history.append(('deposit', amount, self._balance))` logs the transaction.
- `def withdraw(self, amount: float) -> float:` handles removing money.
- `if amount > self._balance:` enforces the invariant that an account cannot be overdrawn.
- `def statement(self) -> str:` formats the history into a readable string.
- `def __repr__(self):` provides a developer-friendly string representation of the object.

---

## Concept Unit: `SavingsAccount(BankAccount)`

### The Problem
We need a new account type that earns interest and requires a minimum balance. However, it still needs an owner, a balance, a history, and the ability to deposit and withdraw.

If we just copy-paste the `BankAccount` code into a new `SavingsAccount` class and modify it, what happens if we later find a bug in how deposits are logged? We'd have to fix it in two places. How do we reuse the logic without duplicating it?

### Introduce the concept in isolation
We use **inheritance** and `super()` to build on top of an existing class.

```python
class Base:
    def greet(self):
        return "Hello"

class Sub(Base):
    def greet(self):
        parent_greeting = super().greet()
        return f"{parent_greeting}, World!"

s = Sub()
print(s.greet())
```

The output of running this would be:
```
Hello, World!
```

This proves that a subclass can call its parent's method using `super()`, allowing it to reuse and extend behavior without rewriting it.

### Discard the throwaway example
The `Base` and `Sub` classes are deleted and will not appear in our project.

### Project Change
No reference counterpart — this is a from-scratch addition because we are expanding our capstone project.

- **Files affected:** `banking.py` (modified)
- **Change type:** Add
- **Location:** After the `BankAccount` class
- **Dependencies:** `BankAccount`

### The New Code
```python
class SavingsAccount(BankAccount):
    DEFAULT_RATE = 0.02

    def __init__(self, owner: str, balance: float = 0.0,
                 interest_rate: float = DEFAULT_RATE,
                 minimum_balance: float = 0.0):
        super().__init__(owner, balance)
        if interest_rate < 0:
            raise ValueError('Interest rate cannot be negative')
        self._interest_rate = interest_rate
        self._minimum_balance = minimum_balance

    @property
    def interest_rate(self):
        return self._interest_rate

    def withdraw(self, amount: float) -> float:
        if self._balance - amount < self._minimum_balance:
            raise ValueError(
                f'Withdrawal would breach minimum balance of ${self._minimum_balance:.2f}'
            )
        return super().withdraw(amount)

    def apply_interest(self) -> float:
        interest = round(self._balance * self._interest_rate, 2)
        self.deposit(interest)
        return interest
```

Let's test it:
```python
# Test it:
savings = SavingsAccount('Alice', 1000, interest_rate=0.05, minimum_balance=100)
savings.deposit(500)
print(savings.balance)
interest = savings.apply_interest()
print(f'Interest earned: ${interest:.2f}')
print(savings.balance)
try:
    savings.withdraw(1475)
except ValueError as e:
    print(e)
try:
    savings.withdraw(1)
except ValueError as e:
    print(e)
```

The predicted output of running this test block:
```
1500.0
Interest earned: $75.00
1575.0
Withdrawal would breach minimum balance of $100.00
```
*(Stated from confidence, not executed. The math is `1000 + 500 = 1500`, interest is `1500 * 0.05 = 75`, new balance is `1575`. Withdrawing `1475` leaves `100`, which is exactly the minimum, so that succeeds. Withdrawing `1` more breaches the `100` minimum, raising the ValueError).*

### The Updated Project
```python
45:        return f'{self.__class__.__name__}(owner={self._owner!r}, balance={self._balance:.2f})'
46: 
47: class SavingsAccount(BankAccount):
48:     DEFAULT_RATE = 0.02
49: 
50:     def __init__(self, owner: str, balance: float = 0.0,
51:                  interest_rate: float = DEFAULT_RATE,
52:                  minimum_balance: float = 0.0):
53:         super().__init__(owner, balance)
54:         if interest_rate < 0:
55:             raise ValueError('Interest rate cannot be negative')
56:         self._interest_rate = interest_rate
57:         self._minimum_balance = minimum_balance
58: 
59:     @property
60:     def interest_rate(self):
61:         return self._interest_rate
62: 
63:     def withdraw(self, amount: float) -> float:
64:         if self._balance - amount < self._minimum_balance:
65:             raise ValueError(
66:                 f'Withdrawal would breach minimum balance of ${self._minimum_balance:.2f}'
67:             )
68:         return super().withdraw(amount)
69: 
70:     def apply_interest(self) -> float:
71:         interest = round(self._balance * self._interest_rate, 2)
72:         self.deposit(interest)
73:         return interest
```
This updates the file to include a specialized account that reuses `BankAccount` logic while enforcing its own business rules.

### Mechanical walkthrough
- `class SavingsAccount(BankAccount):` declares that `SavingsAccount` inherits from `BankAccount`.
- `DEFAULT_RATE = 0.02` defines a class-level constant for the default interest rate.
- `def __init__(self, ...):` defines the constructor with additional savings-specific parameters.
- `super().__init__(owner, balance)` calls the `__init__` method of `BankAccount`, allowing the parent class to set up `_owner`, `_balance`, and `_history` without us duplicating that code.
- `self._interest_rate = interest_rate` and `self._minimum_balance = minimum_balance` initialize the savings-specific state.
- `def withdraw(self, amount: float) -> float:` overrides the parent's `withdraw` method.
- `if self._balance - amount < self._minimum_balance:` checks the new, stricter invariant before proceeding.
- `return super().withdraw(amount)` delegates the actual balance modification and history logging back to the parent class.
- `def apply_interest(self) -> float:` defines a brand new method unique to savings accounts.
- `interest = round(self._balance * self._interest_rate, 2)` calculates the interest.
- `self.deposit(interest)` reuses the parent's `deposit` method to safely add the money and log the transaction.

---

## Concept Unit: The `Portfolio` class

### The Problem
A customer usually has multiple accounts. We need a way to group them together to view total balances or trigger monthly updates (like applying interest) across all of them at once.

If `Portfolio` only accepted exactly `SavingsAccount` objects, it would break if we later added a `CheckingAccount`. How do we write a class that aggregates objects without being brittle?

### Introduce the concept in isolation
We use **Composition** — having a class that holds a list of other objects, interacting with them through a common interface.

```python
class Item:
    def cost(self): return 10

class Box:
    def __init__(self):
        self.items = []
    def add(self, item):
        self.items.append(item)
    def total(self):
        return sum(i.cost() for i in self.items)

b = Box()
b.add(Item())
b.add(Item())
print(b.total())
```

The output of running this would be:
```
20
```

This proves that an aggregator (`Box`) can manage a collection of independent objects (`Item`) and compute aggregate results, without inheriting from them.

### Discard the throwaway example
The `Item` and `Box` classes are deleted and will not appear in our project.

### Project Change
No reference counterpart — this is a from-scratch addition.

- **Files affected:** `banking.py` (modified)
- **Change type:** Add
- **Location:** After the `SavingsAccount` class
- **Dependencies:** `BankAccount`, `SavingsAccount`

### The New Code
```python
class Portfolio:
    def __init__(self, name: str):
        self._name = name
        self._accounts: List[BankAccount] = []

    def add_account(self, account: BankAccount) -> None:
        if not isinstance(account, BankAccount):
            raise TypeError('Expected a BankAccount instance')
        self._accounts.append(account)

    @property
    def total_balance(self) -> float:
        return sum(a.balance for a in self._accounts)

    def monthly_update(self) -> None:
        for account in self._accounts:
            if isinstance(account, SavingsAccount):
                account.apply_interest()

    def summary(self) -> str:
        lines = [f'Portfolio: {self._name}']
        for account in self._accounts:
            lines.append(f'  {repr(account)}')
        lines.append(f'  Total: ${self.total_balance:.2f}')
        return '\n'.join(lines)
```

Let's test it:
```python
# Usage:
portfolio = Portfolio('My Savings')
portfolio.add_account(BankAccount('Dave', 500))
portfolio.add_account(SavingsAccount('Eve', 2000, interest_rate=0.03))
portfolio.add_account(SavingsAccount('Frank', 5000, interest_rate=0.04))
print(portfolio.summary())
portfolio.monthly_update()
print(f'After interest: ${portfolio.total_balance:.2f}')
```

The predicted output of running this test block:
```
Portfolio: My Savings
  BankAccount(owner='Dave', balance=500.00)
  SavingsAccount(owner='Eve', balance=2000.00)
  SavingsAccount(owner='Frank', balance=5000.00)
  Total: $7500.00
After interest: $7760.00
```
*(Stated from confidence, not executed. Eve gets 2000 * 0.03 = 60. Frank gets 5000 * 0.04 = 200. Total interest is 260. 7500 + 260 = 7760).*

### The Updated Project
```python
74: 
75: class Portfolio:
76:     def __init__(self, name: str):
77:         self._name = name
78:         self._accounts: List[BankAccount] = []
79: 
80:     def add_account(self, account: BankAccount) -> None:
81:         if not isinstance(account, BankAccount):
82:             raise TypeError('Expected a BankAccount instance')
83:         self._accounts.append(account)
84: 
85:     @property
86:     def total_balance(self) -> float:
87:         return sum(a.balance for a in self._accounts)
88: 
89:     def monthly_update(self) -> None:
90:         for account in self._accounts:
91:             if isinstance(account, SavingsAccount):
92:                 account.apply_interest()
93: 
94:     def summary(self) -> str:
95:         lines = [f'Portfolio: {self._name}']
96:         for account in self._accounts:
97:             lines.append(f'  {repr(account)}')
98:         lines.append(f'  Total: ${self.total_balance:.2f}')
99:         return '\n'.join(lines)
```
This final class acts as the manager for our accounts.

### Mechanical walkthrough
- `class Portfolio:` defines the aggregator class.
- `def __init__(self, name: str):` initializes the portfolio with a name.
- `self._accounts: List[BankAccount] = []` creates an empty list to store the aggregated accounts. Notice the type hint says `BankAccount`. Because of inheritance, a `SavingsAccount` *is a* `BankAccount`, so it is valid here.
- `def add_account(self, account: BankAccount) -> None:` accepts a new account to manage.
- `if not isinstance(account, BankAccount):` validates that the incoming object is indeed a `BankAccount` or a subclass of it.
- `self._accounts.append(account)` adds the validated account to the internal list.
- `@property` decorates `total_balance`.
- `def total_balance(self) -> float:` computes the sum.
- `return sum(a.balance for a in self._accounts)` iterates over every account in the list, calls its `.balance` property, and sums the results.
- `def monthly_update(self) -> None:` performs batch operations.
- `for account in self._accounts:` loops through the aggregation.
- `if isinstance(account, SavingsAccount):` checks the specific subclass of the object at runtime.
- `account.apply_interest()` calls the subclass-specific method. Regular `BankAccount` instances bypass this block safely.
- `def summary(self) -> str:` formats a string report.
- `lines.append(f'  {repr(account)}')` dynamically calls the `__repr__` method of whichever class the object actually is, resulting in accurate output regardless of subclass.

---

## Concept Unit: The complete test suite

### The Problem
We have written a lot of logic. If we change how `BankAccount` works tomorrow, how do we guarantee we didn't break `SavingsAccount` or `Portfolio`?

How do you prove that an invariant (like "cannot withdraw below minimum balance") actually holds up under pressure?

### Introduce the concept in isolation
We write a **Test Suite** using Python's `unittest` framework to automate our verification.

```python
import unittest

class DemoTest(unittest.TestCase):
    def test_math(self):
        self.assertEqual(1 + 1, 2)

if __name__ == '__main__':
    unittest.main(argv=[''], exit=False)
```

The output of running this would be:
```
.
----------------------------------------------------------------------
Ran 1 test in 0.000s

OK
```

This proves that `unittest.TestCase` can run a defined test method, execute assertions, and report success automatically.

### Discard the throwaway example
The `DemoTest` class is deleted and will not appear in our project.

### Project Change
No reference counterpart — this is a from-scratch addition.

- **Files affected:** `test_banking.py` (created)
- **Change type:** Add
- **Location:** Start of the file
- **Dependencies:** `banking.py`, `unittest`

### The New Code
```python
import unittest
# Assuming BankAccount, SavingsAccount, Portfolio are imported here

class TestBankAccount(unittest.TestCase):
    def setUp(self):
        self.account = BankAccount('Alice', 100)

    def test_initial_balance(self):
        self.assertAlmostEqual(self.account.balance, 100.0)

    def test_deposit(self):
        self.account.deposit(50)
        self.assertAlmostEqual(self.account.balance, 150.0)

    def test_withdraw(self):
        self.account.withdraw(30)
        self.assertAlmostEqual(self.account.balance, 70.0)

    def test_overdraft_raises(self):
        with self.assertRaises(ValueError):
            self.account.withdraw(200)

    def test_invalid_deposit_raises(self):
        with self.assertRaises(ValueError):
            self.account.deposit(-10)

class TestSavingsAccount(unittest.TestCase):
    def setUp(self):
        self.savings = SavingsAccount('Bob', 1000, interest_rate=0.10)

    def test_apply_interest(self):
        interest = self.savings.apply_interest()
        self.assertAlmostEqual(interest, 100.0)
        self.assertAlmostEqual(self.savings.balance, 1100.0)

    def test_minimum_balance(self):
        sa = SavingsAccount('Carol', 500, minimum_balance=200)
        with self.assertRaises(ValueError):
            sa.withdraw(400)  # would leave 100, below 200 minimum
        sa.withdraw(300)   # leaves 200 exactly -- OK

class TestPortfolio(unittest.TestCase):
    def setUp(self):
        self.portfolio = Portfolio('Test')
        self.portfolio.add_account(BankAccount('X', 100))
        self.portfolio.add_account(SavingsAccount('Y', 200, interest_rate=0.50))

    def test_total_balance(self):
        self.assertAlmostEqual(self.portfolio.total_balance, 300.0)

    def test_monthly_update(self):
        self.portfolio.monthly_update()
        # Y's interest: 200 * 0.5 = 100
        self.assertAlmostEqual(self.portfolio.total_balance, 400.0)

if __name__ == '__main__':
    unittest.main()
```

### The Updated Project
```python
1: import unittest
2: 
3: class TestBankAccount(unittest.TestCase):
4:     def setUp(self):
5:         self.account = BankAccount('Alice', 100)
6: 
7:     def test_initial_balance(self):
8:         self.assertAlmostEqual(self.account.balance, 100.0)
9: 
10:    def test_deposit(self):
11:        self.account.deposit(50)
12:        self.assertAlmostEqual(self.account.balance, 150.0)
13: 
14:    def test_withdraw(self):
15:        self.account.withdraw(30)
16:        self.assertAlmostEqual(self.account.balance, 70.0)
17: 
18:    def test_overdraft_raises(self):
19:        with self.assertRaises(ValueError):
20:            self.account.withdraw(200)
21: 
22:    def test_invalid_deposit_raises(self):
23:        with self.assertRaises(ValueError):
24:            self.account.deposit(-10)
... (Savings and Portfolio tests follow identical structure)
```
This file provides a complete, automated verification that our classes fulfill their responsibilities.

### Mechanical walkthrough
- `import unittest` brings in the testing framework.
- `class TestBankAccount(unittest.TestCase):` defines a suite of tests for the base class.
- `def setUp(self):` runs before *every* individual test method, ensuring a fresh `BankAccount` instance is available for each test. This prevents state from one test leaking into another.
- `def test_deposit(self):` is a specific test case.
- `self.assertAlmostEqual(self.account.balance, 150.0)` verifies that after depositing 50 into a 100 balance, the result is 150. We use `assertAlmostEqual` instead of `assertEqual` because floating-point math can sometimes have microscopic inaccuracies (like `150.00000000000002`).
- `def test_overdraft_raises(self):` tests the invariant.
- `with self.assertRaises(ValueError):` tells the test runner that the block of code inside the `with` statement *must* raise a `ValueError`. If it doesn't, the test fails. This proves our protection logic works.
- `class TestSavingsAccount` and `class TestPortfolio` follow the same pattern, isolating their tests to verify only their specific responsibilities.

---

## Concept Unit: Design retrospective — what made this design good

### The Problem
We have written the code and the tests. But why is this design better than just throwing everything into one massive `Bank` class?

### Introduce the concept in isolation
A good design is judged by how hard it is to change.
If we want to add a `CheckingAccount` with a $1 per-transaction fee, how much code do we have to modify?

If we had a massive `Bank` class:
```python
# Bad Design
class Bank:
    def withdraw(self, account_type, balance, amount):
        if account_type == "savings":
            # savings logic
            pass
        elif account_type == "checking":
            # checking logic
            pass
```
Adding a new account type means modifying the `Bank` class, risking breaking existing code. This violates the Open-Closed Principle (code should be open for extension, closed for modification).

### Discard the throwaway example
The bad `Bank` design is discarded.

### Project Change
No file changes. This is a conceptual review of our completed architecture.

### The New Code
No new code.

### The Updated Project
No project update.

### Mechanical walkthrough
Let's review our actual architectural decisions:
- **`owner` is read-only (property with no setter)** — Accounts cannot be maliciously reassigned to a different person after creation.
- **Balance is validated through `deposit`/`withdraw`, not direct assignment** — The invariant (no negative balances, no bypassing minimums) always holds because there is no back door to change the `_balance`.
- **`Portfolio` depends on `BankAccount`, not on `SavingsAccount` specifically** — Because it relies on the base class, `Portfolio` is open to new account types. If you create a `CheckingAccount`, `Portfolio` can already manage it without changing a single line of `Portfolio`'s code.
- **Every class is independently testable** — Because there are no hidden dependencies (like `BankAccount` quietly pinging a database), we could write fast, reliable unit tests.
- **`super().withdraw()` in `SavingsAccount` reuses the parent's logic** — We didn't duplicate the balance deduction or the history logging. If we decide to change how history is formatted, we only change it in one place: `BankAccount`.

Module 3 is complete. You can now design, implement, test, and extend object-oriented systems in Python. Module 4 covers algorithms and complexity.

**Exercises:**
1. Add a `CheckingAccount(BankAccount)` subclass that intercepts `withdraw` and `deposit` to subtract a $1.00 fee per transaction.
2. Add a `Portfolio.top_accounts(n)` method that returns the `n` accounts with the highest balance.
