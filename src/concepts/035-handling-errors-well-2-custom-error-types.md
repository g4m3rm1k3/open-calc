---
concept: 035-handling-errors-well-2-custom-error-types
name: "Handling Errors Well: Custom Error Types"
series: handling-errors-well
seriesTitle: Handling Errors Well
part: 2
---

## Definition

A custom error type is your own class extending the language's base error or
exception type, used to carry specific, structured information about a failure
instead of relying on a generic error with only a text message.

## Problem

A generic error's message is the only information a catch block gets. If the
caller wants to react differently depending on *what kind* of failure occurred —
a network timeout versus an invalid input versus a missing permission — it has
no reliable way to tell them apart except parsing the message text itself, which
breaks the moment the wording changes.

## Computer Science

A custom error type turns "what went wrong" into part of the type system instead
of a string. Catching a specific type (instead of a generic error and checking
its message) is the same idea as any other type check: the type itself carries
meaning that code can branch on reliably.

Tags: Type-carried information, Exception hierarchies, Structured errors

## Software Engineering

This is what turns "I catch errors and try to give good messages" into a durable
practice instead of an ad-hoc one. A custom type can carry fields a catch block
reads programmatically, not just displays, and different custom types let
calling code decide "retry this" vs. "tell the user" vs. "crash loudly" based on
type alone.

Tags: Error recovery strategy, API design, Structured logging

## Common Mistakes

- Creating a custom error type but still only ever reading its `.message` string — if nothing ever uses the extra fields or checks the specific type, a generic error would have done the same job with less code.
- Making every custom error type extend the same custom base class for no real structural reason, instead of extending the language's own built-in error hierarchy, which already integrates with tooling like stack traces and standard catch matching.

## Exercises

- In the JavaScript "good" example, add a `limit` field to `InsufficientFundsError` alongside `attempted`, and read both from the catch block.
- In the Java "good" example, add a second custom exception type and catch it separately from `InsufficientFundsException` in the same try block.

## javascript

**✕ Generic error — the catcher can only display a message, not react to it:**
```javascript
function withdraw(balance, amount) {
  if (amount > balance) throw new Error(`Cannot withdraw ${amount}, balance is only ${balance}`)
  return balance - amount
}

try {
  withdraw(100, 150)
} catch (err) {
  console.log('Something went wrong:', err.message)
}
```
Walkthrough: catch only has `err.message` — a string. If the caller wanted to
react differently to "insufficient funds" than to some other kind of failure, it
would have to parse that string, which breaks the moment the wording changes.

**✓ Custom error type — the catcher can check what failed and read structured data:**
```javascript
class InsufficientFundsError extends Error {
  constructor(attempted, balance) {
    super(`Cannot withdraw ${attempted}, balance is only ${balance}`)
    this.name = 'InsufficientFundsError'
    this.attempted = attempted
    this.balance = balance
  }
}

function withdraw(balance, amount) {
  if (amount > balance) throw new InsufficientFundsError(amount, balance)
  return balance - amount
}

try {
  withdraw(100, 150)
} catch (err) {
  if (err instanceof InsufficientFundsError) {
    console.log(`Short by ${err.attempted - err.balance}`)
  } else {
    throw err
  }
}
```
Walkthrough: `InsufficientFundsError` carries `attempted` and `balance` as real
fields, not just a formatted message. The catch block uses `instanceof` to
confirm it's this specific failure, then reads those fields directly — something
the generic version's message string couldn't give it.

## python

**✕ Generic exception:**
```python
def withdraw(balance, amount):
    if amount > balance:
        raise Exception(f'Cannot withdraw {amount}, balance is only {balance}')
    return balance - amount

try:
    withdraw(100, 150)
except Exception as err:
    print('Something went wrong:', err)
```
Walkthrough: `except Exception` catches everything, and the handler only has the
message string to work with — no way to react differently to this failure versus
any other exception without inspecting the text.

**✓ Custom error type:**
```python
class InsufficientFundsError(Exception):
    def __init__(self, attempted, balance):
        super().__init__(f'Cannot withdraw {attempted}, balance is only {balance}')
        self.attempted = attempted
        self.balance = balance

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(amount, balance)
    return balance - amount

try:
    withdraw(100, 150)
except InsufficientFundsError as err:
    print(f'Short by {err.attempted - err.balance}')
```
Walkthrough: `except InsufficientFundsError` catches specifically this custom
type, and `err.attempted` / `err.balance` are real attributes the handler reads
directly — the same fields the constructor stored.

## java

**✕ Generic exception:**
```java
static int withdraw(int balance, int amount) {
    if (amount > balance) throw new RuntimeException("Cannot withdraw " + amount + ", balance is only " + balance);
    return balance - amount;
}

try {
    withdraw(100, 150);
} catch (RuntimeException e) {
    System.out.println("Something went wrong: " + e.getMessage());
}
```
Walkthrough: `catch (RuntimeException e)` matches almost any runtime failure, not
just this one, and `e.getMessage()` is the only information available — nothing
to check the specific failure against.

**✓ Custom error type:**
```java
class InsufficientFundsException extends RuntimeException {
    final int attempted;
    final int balance;
    InsufficientFundsException(int attempted, int balance) {
        super("Cannot withdraw " + attempted + ", balance is only " + balance);
        this.attempted = attempted;
        this.balance = balance;
    }
}

static int withdraw(int balance, int amount) {
    if (amount > balance) throw new InsufficientFundsException(amount, balance);
    return balance - amount;
}

try {
    withdraw(100, 150);
} catch (InsufficientFundsException e) {
    System.out.println("Short by " + (e.attempted - e.balance));
}
```
Walkthrough: `catch (InsufficientFundsException e)` matches this specific type
directly at the language level — no `instanceof` check needed the way
JavaScript's version required, since Java's catch clauses are already
type-matched. `e.attempted` and `e.balance` are real fields, read programmatically.
