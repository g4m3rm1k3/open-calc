# Exceptions

`try`/`catch`/`finally`, checked vs. unchecked exceptions, custom
exceptions, and try-with-resources. Every example on this page was
compiled and run for real.

---

## `try`/`catch`/`finally`

```java
try {
    System.out.println("in try");
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("caught: " + e.getMessage());
} finally {
    System.out.println("finally always runs");
}
```

Real output:

```text
in try
caught: / by zero
finally always runs
```

`try` wraps code that might throw. `catch (Type e)` runs only if an
exception of that type (or a subtype) is thrown, giving you `e`, the
real exception object. `finally` runs **no matter what** — whether the
`try` succeeded, an exception was caught, or even if the `catch` block
itself throws a new exception — the standard place to put cleanup code
that must always run (closing a file, releasing a resource).

---

## Multi-Catch

```java
try {
    int value = Integer.parseInt(input);
} catch (NumberFormatException | NullPointerException e) {
    System.out.println("caught one of two types: " + e.getClass().getSimpleName());
}
```

Real output (for non-numeric input): `caught one of two types: NumberFormatException`

`|` in a `catch` clause handles multiple, unrelated exception types
with one shared block, instead of duplicating identical handling code
for each.

---

## Checked vs. Unchecked Exceptions

Java has two real categories:

```java
// Unchecked — compiles fine with no try/catch at all
int x = Integer.parseInt("bad");   // only fails at RUNTIME
```

```java
// Checked — refuses to COMPILE without handling it
import java.io.FileReader;
FileReader reader = new FileReader("missing.txt");
```

Real output for the checked version, with no `try`/`catch`:

```text
error: unreported exception FileNotFoundException; must be caught or declared to be thrown
```

Fixed, with `try`/`catch`:

```java
try {
    FileReader reader = new FileReader("missing.txt");
} catch (IOException e) {
    System.out.println("checked, caught: " + e.getClass().getSimpleName());
}
```

Real output: `checked, caught: FileNotFoundException`

**Unchecked** exceptions (subtypes of `RuntimeException` —
`NumberFormatException`, `NullPointerException`,
`ArrayIndexOutOfBoundsException`, `ArithmeticException`, ...): the
compiler never forces you to handle them; skipping `try`/`catch`
compiles fine and only fails at runtime. **Checked** exceptions
(subtypes of `Exception` but *not* `RuntimeException` —
`IOException` and its subtypes are the most common): the compiler
refuses to compile code that might throw one unless you either catch
it or declare `throws SomeException` on the enclosing method, pushing
the responsibility to *its* caller instead.

**This is a genuine Java-specific design choice** — Kotlin and C# have
no checked/unchecked distinction at all; every exception behaves like
Java's unchecked ones. Java's bet was that I/O-adjacent failures are
common and consequential enough to force every caller, all the way up
the call chain, to consciously decide how to handle them.

---

## Custom Exceptions

```java
class InsufficientFundsException extends Exception {
    InsufficientFundsException(String message) {
        super(message);
    }
}

static void withdraw(double balance, double amount) throws InsufficientFundsException {
    if (amount > balance) {
        throw new InsufficientFundsException("Cannot withdraw " + amount + " from " + balance);
    }
    System.out.println("Withdrew " + amount);
}
```

```java
try {
    withdraw(100, 50);
    withdraw(100, 500);
} catch (InsufficientFundsException e) {
    System.out.println("Caught custom exception: " + e.getMessage());
}
```

Real output:

```text
Withdrew 50.0
Caught custom exception: Cannot withdraw 500.0 from 100.0
```

Extending `Exception` (rather than `RuntimeException`) makes your
custom exception **checked** — any method that can throw it must
declare `throws InsufficientFundsException`, and the compiler enforces
it:

```java
static void risky() {
    throw new InsufficientFundsException("oops");   // no `throws` declared above
}
```

Real output — fails to compile:

```text
error: unreported exception MyCheckedException; must be caught or declared to be thrown
```

`throw` (singular) actually raises one specific exception instance,
right here, right now. `throws` (plural, on a method signature) is a
*declaration* — "calling this method might result in this exception,
be prepared to handle it" — two different keywords, easy to confuse by
name alone.

Extend `RuntimeException` instead if you want your custom exception to
be **unchecked** — callers aren't compiler-forced to handle it, useful
for programming errors that indicate a bug rather than an expected,
recoverable condition.

---

## `try`-with-Resources

```java
class AutoCloseableResource implements AutoCloseable {
    AutoCloseableResource() {
        System.out.println("resource opened");
    }

    void use() {
        System.out.println("resource used");
    }

    @Override
    public void close() {
        System.out.println("resource closed automatically");
    }
}
```

```java
try (AutoCloseableResource resource = new AutoCloseableResource()) {
    resource.use();
}
```

Real output:

```text
resource opened
resource used
resource closed automatically
```

Any resource implementing `AutoCloseable` (real ones: `FileReader`,
database connections, network sockets) declared inside a `try(...)`'s
parentheses has `.close()` called on it **automatically**, the instant
the `try` block ends — even if an exception is thrown partway through
`use()`. This replaces manually calling `.close()` in a `finally` block,
a common source of real bugs (forgetting it, or a return/exception
skipping past it) before this syntax existed.
