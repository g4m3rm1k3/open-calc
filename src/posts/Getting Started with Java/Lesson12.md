# Exception Handling: When Things Go Wrong

In the early days of C, error handling was manual: functions returned special values (-1, NULL, 0) to indicate failure, and callers were expected to check them. In practice, many didn't. The 1988 Morris Worm exploited code that ignored return values. The T-Mobile HLR gateway failure in 2012 cascaded because a null return wasn't checked. Error codes that can be silently ignored *will* be silently ignored, especially under deadline pressure.

Java's designers made a radical choice: exceptions are mandatory. For certain categories of errors — called **checked exceptions** — the compiler refuses to compile your code if you don't handle them. You either catch the exception or declare that you'll let it propagate. This annoys Java programmers constantly and has been controversial for decades, but it means a class of errors that would silently corrupt data in C genuinely cannot be ignored in Java.

## The Exception Hierarchy

```
Throwable
├── Error                        ← JVM-level failures; don't catch these
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── VirtualMachineError
└── Exception
    ├── RuntimeException          ← Unchecked; not required to handle
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── IllegalArgumentException
    │   ├── IllegalStateException
    │   ├── ClassCastException
    │   └── ArithmeticException
    └── (Checked exceptions)      ← Compiler enforces handling
        ├── IOException
        ├── FileNotFoundException
        ├── SQLException
        └── ParseException
```

The key distinction: **checked vs unchecked**.

**Checked exceptions** (subclasses of `Exception` but not `RuntimeException`) represent expected failure conditions in external systems: file not found, network down, database unreachable. The compiler forces you to handle them.

**Unchecked exceptions** (`RuntimeException` and its subclasses) represent programming errors: null dereference, array out of bounds, bad cast. These indicate bugs; you shouldn't normally catch and swallow them.

## try-catch-finally

```java
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // Basic try-catch
        try {
            int result = 10 / 0;  // ArithmeticException
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        // Multiple catch blocks
        try {
            String s = null;
            int[] arr = {1, 2, 3};
            System.out.println(s.length());   // NullPointerException
            System.out.println(arr[10]);      // ArrayIndexOutOfBoundsException
        } catch (NullPointerException e) {
            System.out.println("Null pointer: " + e.getMessage());
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array out of bounds: " + e.getMessage());
        } catch (Exception e) {
            // Catch-all — runs for any other Exception
            System.out.println("Unexpected: " + e.getMessage());
        } finally {
            // Always runs — cleanup code goes here
            System.out.println("Finally block: always executes");
        }

        // Multi-catch (Java 7+)
        try {
            Object obj = "hello";
            Integer num = (Integer) obj;  // ClassCastException
        } catch (ClassCastException | NullPointerException e) {
            System.out.println("Type error: " + e.getClass().getSimpleName());
        }
    }
}
```

`finally` runs regardless of whether an exception was thrown or caught — even if the try or catch block contains a `return` statement. It's designed for cleanup: closing streams, releasing locks, freeing resources. However, in modern Java you should use **try-with-resources** instead.

## Try-with-Resources: RAII in Java

Java 7 introduced try-with-resources for any object implementing `AutoCloseable`. It automatically calls `close()` when the block exits, even on exception:

```java
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // Old way — tedious and error-prone
        BufferedReader oldWay = null;
        try {
            oldWay = new BufferedReader(new StringReader("Hello\nWorld"));
            System.out.println(oldWay.readLine());
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (oldWay != null) {
                try { oldWay.close(); } catch (IOException e) { /* ignore */ }
            }
        }

        // Modern way — try-with-resources
        String data = "line1\nline2\nline3";
        try (var reader = new BufferedReader(new StringReader(data))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.out.println("Read error: " + e.getMessage());
        }
        // reader.close() called automatically — no finally needed

        // Multiple resources
        try (var in  = new BufferedReader(new StringReader("input"));
             var out = new StringWriter()) {
            String line = in.readLine();
            out.write("Processed: " + line);
            System.out.println(out.toString());
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
```

Try-with-resources is the Java equivalent of C++'s RAII. Resources are closed in reverse order of opening — if you open `in` then `out`, they close `out` then `in`.

## Throwing Exceptions

Use exceptions to signal that a method can't fulfill its contract:

```java
public class Main {
    static double divide(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        }
        return a / b;
    }

    static int parseInt(String s) {
        if (s == null) throw new NullPointerException("Input cannot be null");
        try {
            return Integer.parseInt(s.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Not a valid integer: '" + s + "'", e);
        }
    }

    public static void main(String[] args) {
        System.out.println(divide(10, 3));

        try {
            divide(10, 0);
        } catch (ArithmeticException e) {
            System.out.println("Error: " + e.getMessage());
        }

        System.out.println(parseInt("  42  "));

        try {
            parseInt("not a number");
        } catch (IllegalArgumentException e) {
            System.out.println("Parse failed: " + e.getMessage());
            System.out.println("Cause: " + e.getCause().getMessage());  // Original NFE
        }
    }
}
```

**Exception chaining** — passing the original exception as the `cause` — preserves the diagnostic information of the original error while throwing a higher-level exception that makes sense to the caller. Always chain when wrapping exceptions.

## Custom Exceptions

For domain-specific errors, create your own exception classes:

```java
public class Main {
    // Custom checked exception — callers must handle it
    static class InsufficientFundsException extends Exception {
        private final double available;
        private final double requested;

        InsufficientFundsException(double available, double requested) {
            super(String.format("Requested %.2f but only %.2f available", requested, available));
            this.available = available;
            this.requested = requested;
        }

        public double getAvailable() { return available; }
        public double getRequested() { return requested; }
        public double getShortfall() { return requested - available; }
    }

    static class BankAccount {
        private double balance;

        BankAccount(double balance) { this.balance = balance; }

        // 'throws' declares that callers must handle this checked exception
        void withdraw(double amount) throws InsufficientFundsException {
            if (amount > balance) {
                throw new InsufficientFundsException(balance, amount);
            }
            balance -= amount;
        }

        double getBalance() { return balance; }
    }

    public static void main(String[] args) {
        var account = new BankAccount(100.0);

        try {
            account.withdraw(50.0);
            System.out.println("Balance: " + account.getBalance());  // 50.0

            account.withdraw(75.0);  // This throws!
            System.out.println("This won't print");

        } catch (InsufficientFundsException e) {
            System.out.println("Failed: " + e.getMessage());
            System.out.printf("You need %.2f more%n", e.getShortfall());
        }
    }
}
```

## The Checked Exception Debate

Checked exceptions are uniquely Java. No other major language has them (Kotlin, Scala, C#, Python — all use unchecked exceptions). The argument in favor: important failures literally can't be ignored. The argument against: they pollute APIs, encourage poor patterns (catching and swallowing), and make lambda usage painful.

Modern Java practice tends toward a middle ground: use unchecked exceptions for most code, use checked exceptions only for true "expected failures" that callers should specifically handle (like `FileNotFoundException` or database errors). Libraries like Spring, Hibernate, and modern frameworks wrap checked exceptions in unchecked ones to avoid the boilerplate. The debate continues, but understanding both sides makes you a more thoughtful Java programmer.
