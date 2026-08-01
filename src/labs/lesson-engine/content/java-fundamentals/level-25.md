---
series: java-fundamentals
level: 25
title: Debugging & Professional Practices
lang: java
---

# Debugging & Professional Practices

Every lesson so far has taught a specific feature of the language. This last one teaches something different: what to actually do when code doesn't work, and how to write code a real team can trust — closing out this course by naming skills its own challenges have quietly required all along.

## Reading an Exception's Real Details

```java
public class Main {
    static int divide(int a, int b) {
        return a / b;
    }

    public static void main(String[] args) {
        try {
            divide(10, 0);
        } catch (Exception ex) {
            System.out.println("Type: " + ex.getClass().getSimpleName());
            System.out.println("Message: " + ex.getMessage());
            System.out.println("Has a stack trace: " + (ex.getStackTrace().length > 0));
        }
    }
}
```

```text
Type: ArithmeticException
Message: / by zero
Has a stack trace: true
```

`ex.getClass().getSimpleName()` — the exception's real, specific runtime type (Level 11's own `.getClass()` idea) — `ArithmeticException` here, not just "some error." `ex.getMessage()` — a human-readable description of exactly what went wrong. `ex.getStackTrace()` — an array recording exactly which methods were being run, in order, at the moment the exception was thrown — in a real IDE (not this sandboxed runner), `ex.printStackTrace()` prints this as a readable, clickable list naming every method and line involved.

**SE lens:** The single most common debugging mistake is reading only the first line of an error and guessing. `getClass().getSimpleName()` names the exact category of failure; `getMessage()` usually says exactly what's wrong (which value, which operation); the stack trace says exactly where. Reading all three, in that order, before changing a single line of code, resolves most real bugs faster than guessing ever does.

## A Bug, Found by Reading — Not Guessing

```java
import java.util.List;
import java.util.Arrays;

public class Main {
    static double average(List<Integer> numbers) {
        int total = 0;
        for (int n : numbers) total += n;
        return total / numbers.size();
    }

    public static void main(String[] args) {
        List<Integer> scores = Arrays.asList(1, 2, 4);
        System.out.println(average(scores));
    }
}
```

```text
2.0
```

The real, correct average of `1, 2, 4` is `7 / 3 = 2.333...` — but this prints `2.0`. Reading the method instead of guessing: `total` is `int`, `numbers.size()` is `int`, and `int / int` in Java always performs **integer division**, truncating any remainder (Level 0's own arithmetic rules, resurfacing here as a genuine bug). `average`'s own return type, `double`, never actually forced the *division itself* to happen as a `double` — only the already-truncated `int` result (`7 / 3 = 2`) gets implicitly converted afterward, printing as `2.0`.

The fix is one cast: `return (double) total / numbers.size();` — converting `total` to `double` *before* the division runs, so the division itself is real, non-truncating floating-point division.

**CS lens:** This is a real, common category of bug: code that runs without throwing anything, produces a plausible-looking (not obviously wrong) number, and is wrong anyway. `divide`'s `ArithmeticException` above announces itself loudly; a silent truncation bug like this one doesn't — it only shows up when the *actual* expected value is known and checked against, which is exactly what a real test (Level 22) is for.

## Guard Clauses — Validating at the Boundary

```java
public class Main {
    static class BankAccount {
        private double balance;

        BankAccount(double openingBalance) {
            if (openingBalance < 0) throw new IllegalArgumentException("Opening balance cannot be negative");
            balance = openingBalance;
        }

        void withdraw(double amount) {
            if (amount <= 0) throw new IllegalArgumentException("Withdrawal amount must be positive");
            if (amount > balance) throw new IllegalStateException("Insufficient funds");
            balance -= amount;
        }

        double getBalance() { return balance; }
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount(100);
        account.withdraw(30);
        System.out.println(account.getBalance());

        try {
            account.withdraw(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        try {
            account.withdraw(1000);
        } catch (IllegalStateException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
```

```text
70.0
Caught: Withdrawal amount must be positive
Caught: Insufficient funds
```

`if (amount <= 0) throw new IllegalArgumentException(...)` — a **guard clause**: checked immediately, at the very top of the method, before any real work happens. `BankAccount` rejects bad input the instant it arrives, rather than letting `balance` silently drift into an invalid state (negative, or larger than it should be) that would only surface as a confusing bug somewhere else, much later, far from its real cause.

`IllegalArgumentException` vs. `IllegalStateException` — two different, well-named standard exceptions, chosen deliberately: the first names a bad *argument* (`amount` itself is invalid); the second names an operation that's invalid given the object's *current state* (a perfectly valid `amount`, but more than this particular account currently holds).

**SE lens:** Guard clauses belong at a **boundary** — a constructor, a `public` method another class or another team calls — not scattered through every private helper underneath. Once `BankAccount`'s own boundary has already confirmed `amount` is positive and affordable, the private arithmetic beneath it can simply trust that and stay simple; re-checking the same condition redundantly, deep inside code that already only runs after the guard has passed, adds no real safety, only clutter.

## Javadoc Comments

```java
public class Main {
    /**
     * Returns the square of the given integer.
     * @param n the number to square
     * @return n multiplied by itself
     */
    static int square(int n) {
        return n * n;
    }

    public static void main(String[] args) {
        System.out.println(square(7));
    }
}
```

```text
49
```

`/** ... */` — **Javadoc**: a structured comment format (a double-star opening, not a single `/*`) real IDEs and the `javadoc` tool itself read automatically, showing exactly this documentation the moment `square` is typed anywhere else in a project, without needing to open the file it's defined in. `@param n` and `@return` document each piece specifically enough that a caller never has to guess what a method needs or gives back.

**SE lens:** A comment restating *what* a line already obviously does (`// add one to x`) is worse than no comment — it can silently go stale the moment the code beneath it changes, while still looking authoritative. A real, useful comment (or, better, a real test, per Level 22) explains *why* — a non-obvious constraint, or a public contract like `square`'s here — the kind of thing reading the code alone can't tell you.

## Challenge: task_manager

Every earlier level's own challenge exercised one idea at a time. This closing challenge combines several real ones — records (Level 15), an unchecked custom exception (Level 10), streams (Level 17), and guard-clause-style validation, all in one small, real system.

Write:
- `record Task(String description, boolean done) {}`
- `class TaskNotFoundException extends RuntimeException`, with a constructor taking a `String message` and passing it to `: super(message)` — unchecked, so no `throws` clause is needed anywhere it's used
- `class TaskManager` with:
  - `void addTask(String description)` — adds a new, not-done `Task`
  - `void completeTask(String description)` — finds the task with that description and replaces it with a new `Task` of the same description and `done = true` (records are immutable — Level 15 — so "completing" means building a new `Task`, not mutating the old one). If no task with that description exists, throw `TaskNotFoundException`. If it exists but is already done, throw `IllegalStateException`.
  - `List<String> pendingTasks()` — returns the descriptions of every task that is **not** done, using a stream (`filter`/`map`/`collect`)

```challenge
class TaskNotFoundException extends RuntimeException {
    // TODO
}

record Task(String description, boolean done) {}

class TaskManager {
    // TODO
}
```

```test
TaskManager manager = new TaskManager();
manager.addTask("Write report");
manager.addTask("Review PR");
manager.addTask("Deploy");

assert manager.pendingTasks().size() == 3

manager.completeTask("Review PR");
assert manager.pendingTasks().size() == 2 && !manager.pendingTasks().contains("Review PR")

boolean threwAlreadyDone = false;
try {
    manager.completeTask("Review PR");
} catch (IllegalStateException e) {
    threwAlreadyDone = true;
}
assert threwAlreadyDone == true

boolean threwNotFound = false;
try {
    manager.completeTask("Nonexistent");
} catch (TaskNotFoundException e) {
    threwNotFound = true;
}
assert threwNotFound == true

assert manager.pendingTasks().size() == 2
```

## Course Complete

Twenty-six levels, starting from `int x = 5;` and ending with a real, record-based, exception-throwing, stream-querying system built from scratch — every one of them verified by real, live-run Java code, exactly like this final one. Every idea in between — primitives vs. objects, inheritance, generics, lambdas, streams, threads, testing — is a real, standard part of professional Java, not a simplified stand-in for it. The next real step is a real project: something with its own actual purpose, not a lesson's, applying everything here to a real, honest problem.
