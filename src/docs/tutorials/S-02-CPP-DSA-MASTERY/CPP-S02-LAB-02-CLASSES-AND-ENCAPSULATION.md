# CPP DSA — LAB-02 — Classes, Structs, and Encapsulation

**Prerequisites:** LAB-01 (Header Files and Compilation)

## Quick Check

Before starting, answer these (answers at the bottom):

1. In C++, what's the one actual difference between `class` and `struct` — not convention, the literal language rule?
2. Why would you ever want to *prevent* code outside a class from directly changing one of its variables?
3. What is `this` inside a member function, concretely — what type of thing is it?

## What You Will Build

A `BankAccount` class with private balance data that can only be changed through controlled `deposit`/`withdraw` methods — split across `BankAccount.h`/`BankAccount.cpp` using LAB-01's pattern — demonstrating why direct access to a data structure's internals is exactly what every structure in this series will need to prevent.

```
$ ./bank_demo
Starting balance: $100
After depositing $50: $150
Attempted withdrawal of $500: REJECTED (insufficient funds)
Balance after rejected withdrawal: $150
```

## Concept: Encapsulation — Hiding Data Behind Controlled Access

**What it is:** A `class` bundles data (**member variables**) and the functions that operate on that data (**member functions** / **methods**) into one unit. **Encapsulation** means marking that data `private` so it can only be read or changed through the class's own methods — never poked at directly from outside. `class` and `struct` in C++ are, technically, the exact same feature with one literal difference: members declared in a `class` default to `private`; members in a `struct` default to `public`. Everything else — constructors, methods, inheritance — works identically on both. The convention (not the rule) is: use `struct` for a plain data bundle with no behavior, `class` when you want controlled access.

**The problem before:** Imagine `BankAccount` stored its balance as a plain public number. Any code anywhere in the program could write `account.balance = -1000000;` directly — no validation, no record of *why* it changed, nothing stopping an impossible state. Every data structure this series builds (a linked list's node pointers, a hash table's bucket array) has exactly this problem: if the internal state is directly writable from outside, nothing prevents code elsewhere from corrupting it into an invalid, crash-causing shape — a broken pointer chain, a hash table with a stale size counter.

**The solution:** Make the data `private`, and expose only the specific operations that are allowed to happen to it — a `deposit(amount)` and a `withdraw(amount)` method, each free to check its own preconditions (is `amount` positive? does the account have enough funds?) before touching the actual number. Code outside the class literally cannot reach `balance` directly anymore — the compiler enforces this, not just a comment saying "please don't."

**Canonical example:**

```cpp
class BankAccount {
private:
    double balance;

public:
    BankAccount(double startingBalance) : balance(startingBalance) {}

    void deposit(double amount) {
        balance += amount;
    }

    double getBalance() const {
        return balance;
    }
};
```

**Project Application:** Every data structure from LAB-06 onward is a `class` with `private` internals (the raw array, the head pointer, the bucket vector) and `public` methods that are the *only* sanctioned way to touch that data — this lab is where that discipline starts.

**Watch for:** Forgetting `const` on a method that doesn't modify the object (like `getBalance()` above). Without it, the compiler won't let you call that method on a `const BankAccount&` reference — a real, common compile error once you start passing objects by `const` reference for efficiency (which LAB-04 explains in depth), and one that's confusing to debug if you don't already know `const`-correctness is the cause.

## Step 1: A plain struct, and why it's dangerous for this use case

```cpp
// BAD: everything public, nothing stopping misuse
struct BankAccountUnsafe {
    double balance;
};

int main() {
    BankAccountUnsafe account{100.0};
    account.balance = -999999.0; // nothing stops this. nothing even warns about it.
    return 0;
}
```

This compiles and runs with no error at all — `struct` members default to `public`, so `account.balance` is directly writable from anywhere, to anything, including values that make no sense for a real bank account. This is Step 1 deliberately reproducing the concept section's problem before building the fix, the same "see the bug on purpose first" discipline used throughout this series.

### SAVE AND TRY

Compile and run this. Confirm it runs with zero errors or warnings despite setting an impossible negative balance directly — the compiler has no opinion at all, because nothing told it this field should be protected.

## Step 2: `BankAccount.h` — declaring the class

```cpp
// BankAccount.h
#ifndef BANK_ACCOUNT_H
#define BANK_ACCOUNT_H

class BankAccount {
private:
    double balance;

public:
    BankAccount(double startingBalance);
    void deposit(double amount);
    bool withdraw(double amount);
    double getBalance() const;
};

#endif
```

This header declares the class's *shape* — what data it has (`private`, invisible to outside code) and what methods exist (`public`, the only sanctioned entry points) — without any method bodies. This is LAB-01's declaration/definition split applied to a class instead of a free function: any `.cpp` file that `#include`s this header knows exactly what a `BankAccount` can do, without needing to see (or recompile against) how any of it is implemented.

Notice the header guard from LAB-01 is here too — headers declaring a `class` are exactly the case where skipping the guard causes a hard compile error (not the "might tolerate it" situation LAB-01's plain function example left ambiguous), because the compiler treats a class type as a much stricter declaration than a bare function prototype.

### SAVE AND TRY

Try (as an experiment) removing the header guard from this file, then `#include "BankAccount.h"` twice in the same `.cpp` file (literally write the `#include` line twice). Compile it and read the actual error message the compiler gives you — it should explicitly mention `BankAccount` being redefined, a direct, concrete confirmation of Quick Check question 3 from LAB-01.

## Step 3: `BankAccount.cpp` — defining the methods, and meeting `this`

```cpp
// BankAccount.cpp
#include "BankAccount.h"

BankAccount::BankAccount(double startingBalance) : balance(startingBalance) {}

void BankAccount::deposit(double amount) {
    balance += amount;
}

bool BankAccount::withdraw(double amount) {
    if (amount > balance) {
        return false; // rejected -- insufficient funds
    }
    balance -= amount;
    return true;
}

double BankAccount::getBalance() const {
    return balance;
}
```

`BankAccount::deposit` (the `::` is the **scope resolution operator**) means "this is the definition of the `deposit` method *belonging to* the `BankAccount` class declared in the header" — without `BankAccount::`, the compiler would think you're defining an unrelated free function that happens to be named `deposit`. Inside any of these method bodies, `balance` implicitly refers to *this particular object's* `balance` — every `BankAccount` you create gets its own separate `balance`, and when `deposit` runs on one object, it modifies only that object's data. This implicit "which object am I operating on" is literally a hidden pointer named `this`, passed automatically to every non-static member function — `balance += amount;` is shorthand the compiler expands to `this->balance += amount;` behind the scenes.

`: balance(startingBalance)` in the constructor is a **member initializer list** — it sets `balance` to `startingBalance` as the object is being constructed, before the constructor's body even runs. For a simple `double` like this it's nearly equivalent to assigning inside the body, but LAB-04 will show a case (a member with no default constructor) where the initializer list isn't just style — it's required.

### SAVE AND TRY

Add `#include <iostream>` and a temporary debug line inside `deposit`: `std::cout << "this address: " << this << ", balance is now: " << balance << "\n";`. Create two separate `BankAccount` objects and call `deposit` on each — confirm the printed `this` address is different for each object, direct, visible proof that `this` really is a distinct pointer per object, and that's *why* each object's data stays separate.

## Step 4: Putting it together — `main.cpp` and controlled access

```cpp
// main.cpp
#include "BankAccount.h"
#include <iostream>

int main() {
    BankAccount account(100.0);
    std::cout << "Starting balance: $" << account.getBalance() << "\n";

    account.deposit(50.0);
    std::cout << "After depositing $50: $" << account.getBalance() << "\n";

    bool succeeded = account.withdraw(500.0);
    std::cout << "Attempted withdrawal of $500: " << (succeeded ? "OK" : "REJECTED (insufficient funds)") << "\n";
    std::cout << "Balance after rejected withdrawal: $" << account.getBalance() << "\n";

    // account.balance = -999999.0;  // <-- uncomment this line: it will NOT compile
    return 0;
}
```

The commented-out line is the entire point of this lab, made checkable: `account.balance` is `private`, so `main.cpp` — code entirely outside the class — cannot reach it directly, not because of a convention or a comment, but because the compiler itself refuses to compile that line. Compare this to Step 1's `BankAccountUnsafe`, where the equivalent line compiled with zero complaints.

### SAVE AND TRY

Compile and link this using LAB-01's three-command process (`g++ -c BankAccount.cpp -o BankAccount.o`, `g++ -c main.cpp -o main.o`, `g++ BankAccount.o main.o -o bank_demo`), then run it and confirm the output matches "What You Will Build" exactly. Then actually uncomment the forbidden line and try to recompile — read the exact compiler error mentioning `balance` being private, and confirm it points at the correct line.

## 🎯 Challenge

Add a `transactionHistory` feature: a `private` member that's a simple running count of how many deposits/withdrawals have occurred (an `int`, not a full log yet — that needs `MyVector` from LAB-06), plus a `public` `getTransactionCount() const` method to read it. Every successful `deposit` and every successful `withdraw` should increment it; a *rejected* withdrawal should not.

<details>
<summary>Solution</summary>

```cpp
// BankAccount.h -- add to the class
private:
    double balance;
    int transactionCount;
public:
    // ...existing declarations...
    int getTransactionCount() const;
```

```cpp
// BankAccount.cpp
BankAccount::BankAccount(double startingBalance) : balance(startingBalance), transactionCount(0) {}

void BankAccount::deposit(double amount) {
    balance += amount;
    transactionCount++;
}

bool BankAccount::withdraw(double amount) {
    if (amount > balance) {
        return false; // rejected -- transactionCount does NOT increment
    }
    balance -= amount;
    transactionCount++;
    return true;
}

int BankAccount::getTransactionCount() const {
    return transactionCount;
}
```

The member initializer list now initializes *two* members, comma-separated — `transactionCount(0)` alongside `balance(startingBalance)` — and the rejected-withdrawal path's early `return false` is exactly why `transactionCount++` only happens after the funds check passes, not before: the count should only reflect transactions that actually happened.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| `class` vs `struct` | Fundamentally different features | Identical except default access: `private` (class) vs `public` (struct) |
| `private` data | An inconvenience to work around | The mechanism that prevents invalid states from outside code |
| `this` | Some special keyword magic | A regular pointer to the current object, passed implicitly to every method |
| `ClassName::method` | Optional style | Required syntax linking a method definition back to its class declaration |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `BankAccountUnsafe`'s direct field assignment compile with no error, while `BankAccount`'s equivalent line doesn't? | |
| 2 | What does the `::` in `BankAccount::deposit` actually mean? | |
| 3 | Why does a member initializer list run before the constructor's body, and why did LAB-02's Challenge need one for two members instead of one? | |

## Quick Check Answers

1. `struct` members default to `public` access; `class` members default to `private` — that's the entire, literal difference the language enforces. Everything else (methods, constructors, inheritance) works identically on both.
2. Because uncontrolled direct access lets any code anywhere set a data structure's internal state to something invalid — a negative balance, a broken pointer, a wrong size counter — with nothing checking it; controlling access through methods lets each operation validate its own preconditions before touching the real data.
3. `this` is a pointer to the specific object the current method call is operating on — its type is `ClassName*` (or `const ClassName*` inside a `const` method) — which is what lets the same method body correctly act on whichever separate object it was called on.

*Next: [LAB-03 — Operator Overloading](CPP-S02-LAB-03-OPERATOR-OVERLOADING.md)*
