---
concept: 018-encapsulation
name: Encapsulation
---

## Definition

Encapsulation bundles data with the methods that operate on it, and restricts
direct outside access to that data — other code can only interact with it through
the methods the class deliberately exposes.

## Problem

If every field of an object can be read and written directly from anywhere, there
is no way to guarantee the object stays in a valid state — nothing stops external
code from setting a bank account's balance to a negative number, bypassing
whatever validation a `withdraw` method would have enforced.

## Computer Science

Encapsulation enforces an **invariant** — a condition that must always hold true
for an object (a balance is never negative, a list's `size` field always matches
its actual contents) — by making the fields that could violate it private, and
only allowing changes through methods that check the condition first.

Tags: Invariants, Information hiding, Abstraction

## Software Engineering

Encapsulation is what lets an object's internal representation change later
without breaking anything that uses it — as long as the public methods keep their
same behavior, callers never needed to know the internal fields existed at all.
This is the same reasoning behind "program to an interface, not an implementation."

Tags: Information hiding, API stability, Refactoring safety

## Common Mistakes

- Adding a public getter and setter for every private field with no actual logic in between — this doesn't encapsulate anything; it's just a longer way to expose the same direct access.
- Making fields private but forgetting to actually validate anything in the methods that modify them, losing the entire benefit encapsulation was meant to provide.

## Exercises

- In the JavaScript example, try accessing `#balance` directly from outside the class and observe the error.
- In Java, remove the `if (amount > 0)` check from `deposit` and predict what invalid state becomes possible.

## javascript

```javascript
class BankAccount {
  #balance = 0   // private field — # makes it inaccessible from outside

  deposit(amount) {
    if (amount > 0) this.#balance += amount
  }

  getBalance() {
    return this.#balance
  }
}

const account = new BankAccount()
account.deposit(100)
console.log(account.getBalance())   // 100
// account.#balance         // SyntaxError — not accessible from outside the class
```
Walkthrough: `#balance` is a genuinely private field — JavaScript enforces this at
the language level, not just by convention. `deposit` is the only way to change
it, and it validates `amount > 0` first, guaranteeing the balance can never become
negative through this method.

## python

```python
class BankAccount:
    def __init__(self):
        self._balance = 0   # leading underscore — convention, not enforced

    def deposit(self, amount):
        if amount > 0:
            self._balance += amount

    def get_balance(self):
        return self._balance

account = BankAccount()
account.deposit(100)
print(account.get_balance())   # 100
print(account._balance)        # 100 — accessible! Python does not enforce privacy
```
Walkthrough: Python has no true private fields — a single leading underscore
(`_balance`) is a **convention** meaning "treat this as internal," not something
the language actually blocks. `account._balance` works fine and prints `100`; this
is a real, meaningful difference from JavaScript's `#` fields, not just a naming
style choice.

## java

```java
class BankAccount {
    private int balance = 0;   // private — enforced by the compiler

    public void deposit(int amount) {
        if (amount > 0) balance += amount;
    }

    public int getBalance() {
        return balance;
    }
}

BankAccount account = new BankAccount();
account.deposit(100);
System.out.println(account.getBalance());   // 100
// account.balance would fail to compile — private fields aren't accessible outside the class
```
Walkthrough: `private` is enforced by the Java compiler, the same as JavaScript's
`#` fields — attempting `account.balance` from outside the class fails to
compile, not just at runtime.
