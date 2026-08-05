---
series: java-architecture
level: 0
title: From Script to System
lang: java
---

# From Script to System

Twenty-six levels of `java-fundamentals` taught you the language. This series teaches something the language cannot teach by itself: how experienced engineers *organise* Java code so it survives contact with a real, changing business. The project for the whole series is an **order processing system** — the kind of backend that sits behind almost every online store. Every pattern that follows (Repository, Strategy, State, Observer, Factory, hexagonal architecture) is not introduced because it's famous — each one is the documented, industry-standard fix for a specific pain this lesson makes you feel first, by writing the code that hurts.

## The whole problem, in one method

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    static class OrderLine {
        String productName;
        int quantity;
        double unitPrice;

        OrderLine(String productName, int quantity, double unitPrice) {
            this.productName = productName;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }
    }

    // Everything the business does to place an order, in one place.
    static double placeOrder(String customerEmail, List<OrderLine> lines, String paymentMethod) {
        double total = 0;
        for (OrderLine line : lines) {
            total += line.quantity * line.unitPrice;
        }

        if (paymentMethod.equals("credit_card")) {
            System.out.println("Charging credit card $" + total);
        } else if (paymentMethod.equals("paypal")) {
            System.out.println("Charging PayPal $" + total);
        } else {
            throw new IllegalArgumentException("Unknown payment method: " + paymentMethod);
        }

        System.out.println("Saving order to database for " + customerEmail);
        System.out.println("Sending confirmation email to " + customerEmail);

        return total;
    }

    public static void main(String[] args) {
        List<OrderLine> lines = new ArrayList<>();
        lines.add(new OrderLine("Keyboard", 1, 79.99));
        lines.add(new OrderLine("Mouse", 2, 24.50));

        double total = placeOrder("alice@example.com", lines, "credit_card");
        System.out.println("Order total: " + total);
    }
}
```

```text
Charging credit card $128.99
Saving order to database for alice@example.com
Sending confirmation email to alice@example.com
Order total: 128.99
```

**Walkthrough:** `placeOrder` computes a total by summing `quantity * unitPrice` for every `OrderLine`, then branches on `paymentMethod` with `if`/`else if` to decide how to charge the customer, then prints two more lines pretending to save the order and email the customer, and finally returns the total. Nothing here is wrong, exactly — it runs, and it produces the right number.

**CS lens:** `placeOrder` currently has four distinct responsibilities living in one function body: computing a total (a calculation), choosing a payment mechanism (a decision), persisting the order (I/O), and notifying the customer (I/O). A method doing four unrelated jobs is not a bug today, but it is what every real defect in this series will trace back to.

## What breaks first: adding a payment method

The business asks for one new feature: support Apple Pay.

```java
public class Main {
    static double placeOrder(String customerEmail, double total, String paymentMethod) {
        if (paymentMethod.equals("credit_card")) {
            System.out.println("Charging credit card $" + total);
        } else if (paymentMethod.equals("paypal")) {
            System.out.println("Charging PayPal $" + total);
        } else if (paymentMethod.equals("apple_pay")) {           // NEW branch
            System.out.println("Charging Apple Pay $" + total);  // NEW branch
        } else {
            throw new IllegalArgumentException("Unknown payment method: " + paymentMethod);
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(placeOrder("bob@example.com", 42.00, "apple_pay"));
    }
}
```

```text
Charging Apple Pay $42.0
42.0
```

**SE lens:** Adding Apple Pay required *editing* `placeOrder` — the same method that also computes totals, saves orders, and sends emails. Every one of those unrelated jobs is now at risk of being broken by a change that has nothing to do with them, and every future payment method (Google Pay, bank transfer, gift card) means editing this method again. This is the **open/closed principle** stated as a lived problem before it is named as a rule: a well-designed unit should be *open* to new payment methods being added, but *closed* to being edited every time one is. Level 4 of this series (Strategy) is the documented, industry-standard fix — not a personal preference, but the same fix Gang-of-Four's *Strategy* pattern and Martin Fowler's *Patterns of Enterprise Application Architecture* both converge on for exactly this shape of problem.

## What breaks second: testing anything at all

```java
public class Main {
    static double placeOrder(String customerEmail, double total, String paymentMethod) {
        if (paymentMethod.equals("credit_card")) {
            System.out.println("Charging credit card $" + total);   // real charge, in a test!
        }
        System.out.println("Saving order to database for " + customerEmail); // real DB, in a test!
        System.out.println("Sending confirmation email to " + customerEmail); // real email, in a test!
        return total;
    }

    public static void main(String[] args) {
        // Pretend this is a unit test verifying the total is computed correctly.
        // There is no way to check that number without ALSO charging a card,
        // touching a database, and sending a real email.
        double result = placeOrder("test@example.com", 100.0, "credit_card");
        System.out.println("Test would check: result == 100.0 -> " + (result == 100.0));
    }
}
```

```text
Charging credit card $100.0
Saving order to database for test@example.com
Sending confirmation email to test@example.com
Test would check: result == 100.0 -> true
```

**CS lens:** A function that does math and *also* performs irreversible side effects (charging money, writing to a database, sending an email) cannot be tested in isolation. There is no way to check "is the total right?" without also triggering everything else. This is the practical meaning of **coupling**: the calculation is coupled to the infrastructure, so you cannot exercise one without the other.

**SE lens:** This is the actual, felt reason layered architecture exists — not "professional code is organized into layers" as an abstract rule, but "I cannot verify my math is correct without charging a real credit card." Level 1 of this series takes exactly this method and pulls it apart into a **Controller** (receives the request), a **Service** (the business logic — the total calculation), and a **Repository** (persistence) — the layered architecture pattern documented across every serious backend textbook, including Fowler's *PoEAA* and the Spring Framework's own default project shape, precisely because it is the tried-and-tested fix for this exact pain.

## Recognition

The four-jobs-in-one-method problem you just felt is not specific to Java or to order processing:

```text
Today: One function doing calculation + decision + persistence + notification

Also recognized in: PHP scripts from the 2000s mixing SQL directly into HTML
templates, front-end "God components" that fetch data, compute derived state,
and render UI all in one file, database stored procedures that validate input,
run business rules, and email results, and shell scripts that parse arguments,
do the work, and log output all in one 200-line block
```

## Challenge: order_total_calculator

Before anything else in this series, extract the one part of `placeOrder` that is pure calculation — no I/O, no side effects — into its own testable method.

Write `static double calculateOrderTotal(List<OrderLine> lines)`, where `OrderLine` has fields `String productName`, `int quantity`, and `double unitPrice`, set via a constructor taking all three in that order. `calculateOrderTotal` returns the sum of `quantity * unitPrice` across every line. An empty list returns `0.0`.

```challenge
import java.util.List;

class OrderLine {
    String productName;
    int quantity;
    double unitPrice;
    OrderLine(String productName, int quantity, double unitPrice) {
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}

class Main {
    static double calculateOrderTotal(List<OrderLine> lines) {
        return 0.0;
    }
}
```

```test
import java.util.Arrays;
import java.util.Collections;

assert Main.calculateOrderTotal(Collections.emptyList()) == 0.0
assert Main.calculateOrderTotal(Arrays.asList(new OrderLine("Widget", 3, 10.0))) == 30.0
assert Main.calculateOrderTotal(Arrays.asList(
    new OrderLine("Keyboard", 1, 79.99),
    new OrderLine("Mouse", 2, 24.50)
)) == 128.99
assert Main.calculateOrderTotal(Arrays.asList(new OrderLine("Bulk", 4, 2.5))) == 10.0
```
