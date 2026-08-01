---
series: java-fundamentals
level: 8
title: Static Members, final & Constants
lang: java
---

# Static Members, final & Constants

Every field so far has belonged to a specific object — `r.width` is one `Rectangle`'s own value, separate from every other `Rectangle`'s. Java also allows fields and methods that belong to the **class itself**, shared across every instance, plus a separate keyword, `final`, for values that can never change once set. `static`'s already appeared quietly on every `main` method in this course — this lesson finally explains what it actually means.

## A Static Field Is Shared, Not Per-Object

```java
public class Main {
    static int counter = 0;

    static int nextId() {
        counter++;
        return counter;
    }

    public static void main(String[] args) {
        System.out.println(nextId());
        System.out.println(nextId());
        System.out.println(nextId());
        System.out.println(counter);
    }
}
```

```text
1
2
3
3
```

`static int counter = 0;` — belongs to `Main` the class, not to any particular `Main` object (and there's never an object here anyway — `main` itself is `static`, called without ever writing `new Main()`). There is exactly one `counter` in the entire program, no matter how many times `nextId()` runs.

`counter++` inside `nextId()` — every call increments the *same* shared field. Three calls to `nextId()` return `1`, then `2`, then `3` — proof it's remembering state between calls, unlike a fresh local variable which would reset every time.

## A Static Field Shared Across Every Instance

```java
class Account {
    static int accountCount = 0;
    int id;

    Account() {
        accountCount++;
        id = accountCount;
    }
}

public class Main {
    public static void main(String[] args) {
        Account a1 = new Account();
        Account a2 = new Account();
        Account a3 = new Account();
        System.out.println(a1.id);
        System.out.println(a2.id);
        System.out.println(a3.id);
        System.out.println(Account.accountCount);
    }
}
```

```text
1
2
3
3
```

`int id;` — an **instance field** (Level 7): every `Account` gets its own separate `id`. `static int accountCount;` — the opposite: every `Account` object shares this exact same field.

Each constructor call increments the one shared `accountCount` and copies its current value into that object's own `id` — which is why `a1.id`, `a2.id`, and `a3.id` come out `1`, `2`, `3` in creation order, while `Account.accountCount` (accessed through the *class name*, not through any one object, since it doesn't belong to any single one) ends at `3`, the real total.

**CS lens:** A `static` field lives in exactly one place in memory for the whole program's lifetime, created once when the class is first loaded — never once-per-object the way instance fields are. This is the mechanism behind every "how many of these have ever been created" counter, every shared cache, every truly global piece of state a class needs to track across all of its own instances.

## static final — True Constants

```java
public class Main {
    static final double TAX_RATE = 0.08;
    static final String COMPANY_NAME = "Acme Corp";

    public static void main(String[] args) {
        double price = 100.0;
        System.out.println(price * (1 + TAX_RATE));
        System.out.println(COMPANY_NAME);
    }
}
```

```text
108.0
Acme Corp
```

`static` — one shared copy, per the sections above. `final` — once assigned, this field can never be reassigned again; `TAX_RATE = 0.10;` anywhere else in the program would be a compile error. Together, `static final` is Java's real constant: a single, unchanging, shared value — exactly the shape `TAX_RATE` and `COMPANY_NAME` need here.

Convention, not a language rule: constants like these are named in `ALL_CAPS_WITH_UNDERSCORES`, immediately visible as "this never changes" to anyone reading the code, the same way `Math.PI` (Level 0) already looked.

## final on a Local Variable

```java
public class Main {
    public static void main(String[] args) {
        final int MAX_ATTEMPTS = 3;
        System.out.println(MAX_ATTEMPTS);
    }
}
```

```text
3
```

`final` isn't only for `static` fields — a `final` local variable works the same way, just scoped to the method it's declared in: `MAX_ATTEMPTS = 5;` anywhere later in `main` would be a compile error. Marking a variable `final` the moment it's clear it should never change is a real, common defensive habit — the compiler catches an accidental reassignment immediately, rather than the bug surfacing later as confusing runtime behavior.

**SE lens:** Instance fields default to per-object because that's usually right — a `Rectangle`'s `width` genuinely is different from every other `Rectangle`'s. Reach for `static` specifically when a value or behavior is a property of the *concept itself*, not any one instance — `Account.accountCount`, `Math.PI`, `Math.sqrt(...)` (Level 0's own static methods, callable with no `Account` or `Math` object anywhere in sight). Overusing `static` — reaching for it as a shortcut to avoid passing an object around — quietly reintroduces the exact kind of uncontrolled shared state encapsulation (Level 7) exists to prevent, since every part of a program touching a `static` field is touching the same one, everywhere, all the time.

## Challenge: format_currency

Write a `static final String CURRENCY_SYMBOL` constant set to `"$"`, and a `static String formatCurrency(double amount)` method that returns `CURRENCY_SYMBOL` followed by `amount` formatted to exactly two decimal places (use `String.format("%.2f", amount)`).

```challenge
static final String CURRENCY_SYMBOL = "$";

static String formatCurrency(double amount) {
    // TODO
}
```

```test
assert formatCurrency(9.5).equals("$9.50")
assert formatCurrency(100).equals("$100.00")
assert formatCurrency(0).equals("$0.00")
assert formatCurrency(19.999).equals("$20.00")
```
