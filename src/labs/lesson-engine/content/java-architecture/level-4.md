---
series: java-architecture
level: 4
title: The Strategy Pattern
lang: java
---

# The Strategy Pattern

Level 0 ended with a growing `if`/`else if` chain choosing a payment method — and the specific warning that every new payment method means editing a method that also computes totals and saves orders. This lesson names and applies the fix: the **Strategy pattern**, one of the Gang of Four's original 1994 catalog entries, documented there as: "define a family of algorithms, encapsulate each one, and make them interchangeable."

## The if/else chain, back for one more look

```java
public class Main {
    static double charge(String paymentMethod, double amount) {
        if (paymentMethod.equals("credit_card")) {
            System.out.println("Charging credit card: $" + amount + " (2.9% + $0.30 fee)");
            return amount * 1.029 + 0.30;
        } else if (paymentMethod.equals("paypal")) {
            System.out.println("Charging PayPal: $" + amount + " (3.5% fee)");
            return amount * 1.035;
        } else if (paymentMethod.equals("store_credit")) {
            System.out.println("Charging store credit: $" + amount + " (no fee)");
            return amount;
        } else {
            throw new IllegalArgumentException("Unknown payment method: " + paymentMethod);
        }
    }

    public static void main(String[] args) {
        System.out.println("Total charged: " + charge("credit_card", 100.0));
    }
}
```

```text
Charging credit card: $100.0 (2.9% + $0.30 fee)
Total charged: 103.2
```

**The problem, stated concretely:** every payment method's fee logic lives inside one method's branches, so adding Apple Pay means finding this method and inserting a fourth `else if` — the exact open/closed violation named in Level 0. Worse: there is no way to test "does the PayPal fee calculation work?" without also running the `if` chain that decides which branch it's in.

## Extracting each branch into its own strategy

```java
public class Main {
    // The STRATEGY interface: the one shape every payment method must satisfy.
    interface PaymentStrategy {
        double charge(double amount);
        String describe();
    }

    // Each concrete strategy is a self-contained algorithm — nothing else knows its fee math.
    static class CreditCardPayment implements PaymentStrategy {
        @Override public double charge(double amount) { return amount * 1.029 + 0.30; }
        @Override public String describe() { return "credit card (2.9% + $0.30)"; }
    }

    static class PayPalPayment implements PaymentStrategy {
        @Override public double charge(double amount) { return amount * 1.035; }
        @Override public String describe() { return "PayPal (3.5%)"; }
    }

    static class StoreCreditPayment implements PaymentStrategy {
        @Override public double charge(double amount) { return amount; }
        @Override public String describe() { return "store credit (no fee)"; }
    }

    // The class that USES a strategy never checks which one it got.
    static class PaymentProcessor {
        double process(PaymentStrategy strategy, double amount) {
            double charged = strategy.charge(amount);
            System.out.println("Processed via " + strategy.describe() + ": $" + charged);
            return charged;
        }
    }

    public static void main(String[] args) {
        PaymentProcessor processor = new PaymentProcessor();
        processor.process(new CreditCardPayment(), 100.0);
        processor.process(new PayPalPayment(), 100.0);
        processor.process(new StoreCreditPayment(), 100.0);
    }
}
```

```text
Processed via credit card (2.9% + $0.30): $103.2
Processed via PayPal (3.5%): $103.5
Processed via store credit (no fee): $100.0
```

**Walkthrough:** `PaymentStrategy` declares the shape every payment method must have — `charge` and `describe` — with no bodies. Each concrete class (`CreditCardPayment`, `PayPalPayment`, `StoreCreditPayment`) implements that shape with its own fee math and nothing else. `PaymentProcessor.process` takes a `PaymentStrategy` as a parameter and calls `strategy.charge(amount)` — it never asks "which kind of strategy is this?" with an `if` or `instanceof`; it simply trusts the interface.

**CS lens:** This is **polymorphism** doing the exact job the `if`/`else if` chain used to do, but at the language level instead of by hand: calling `strategy.charge(amount)` runs whichever concrete class's `charge` method actually got passed in, decided at runtime by the real type of the object — this mechanism is called **dynamic dispatch**. The `if paymentMethod.equals("credit_card")` chain was manually re-implementing dynamic dispatch with string comparisons; the JVM already does this dispatch natively and correctly once the algorithms are expressed as separate classes implementing one interface.

## Adding a new strategy: zero edits to existing code

```java
public class Main {
    // (PaymentStrategy, PaymentProcessor as above)

    // NEW payment method. Notice: nothing above this line changes.
    static class ApplePayPayment implements PaymentStrategy {
        @Override public double charge(double amount) { return amount * 1.015; }
        @Override public String describe() { return "Apple Pay (1.5%)"; }
    }

    public static void main(String[] args) {
        PaymentProcessor processor = new PaymentProcessor();
        processor.process(new ApplePayPayment(), 100.0);
    }
}
```

```text
Processed via Apple Pay (1.5%): $101.5
```

**SE lens:** Adding Apple Pay required exactly one new class and zero edits to `PaymentProcessor`, `PaymentStrategy`, or any existing payment class. This is the open/closed principle, now satisfied rather than violated: the system is *open* to new payment strategies (write a new class) and *closed* to modification of existing ones (nothing already working had to be touched, retested, or re-reviewed). Compare this to Level 0's version, where the same feature required editing a method four other features already depended on.

## A second application: shipping, the same pattern again

```java
public class Main {
    interface ShippingStrategy {
        double cost(double orderWeightKg);
        String describe();
    }

    static class StandardShipping implements ShippingStrategy {
        @Override public double cost(double orderWeightKg) { return 4.99 + orderWeightKg * 0.50; }
        @Override public String describe() { return "Standard (3-5 days)"; }
    }

    static class ExpressShipping implements ShippingStrategy {
        @Override public double cost(double orderWeightKg) { return 14.99 + orderWeightKg * 1.00; }
        @Override public String describe() { return "Express (1-2 days)"; }
    }

    static class ShippingCalculator {
        double calculate(ShippingStrategy strategy, double weightKg) {
            double cost = strategy.cost(weightKg);
            System.out.println(strategy.describe() + " for " + weightKg + "kg: $" + cost);
            return cost;
        }
    }

    public static void main(String[] args) {
        ShippingCalculator calculator = new ShippingCalculator();
        calculator.calculate(new StandardShipping(), 2.0);
        calculator.calculate(new ExpressShipping(), 2.0);
    }
}
```

```text
Standard (3-5 days) for 2.0kg: $5.99
Express (1-2 days) for 2.0kg: $16.99
```

**Recurring pattern:** This is the Strategy pattern reappearing in a second, unrelated part of the same system — same shape (an interface, several interchangeable implementations, a caller that only knows the interface), different problem (shipping cost instead of payment fees). Recognizing "this is Strategy again" rather than learning `ShippingStrategy` as an unrelated new idea is the actual skill this repetition is building.

## Recognition

```text
Today: Strategy — interchangeable algorithms behind one shared interface

Also recognized in: Java's own Comparator<T> passed into Collections.sort(),
the Comparator you pass to a stream's .sorted(), any HTTP client's configurable
retry/backoff policy, a game character's selectable attack/movement behavior,
and compression libraries that let you choose gzip vs zstd vs lz4 behind one
"compress(bytes)" interface.
```

## Challenge: payment_strategy_processor

Implement a Strategy-based payment processor.

Write:
- `interface PaymentStrategy` with `double charge(double amount)`
- `class CreditCardPayment implements PaymentStrategy` — charges `amount * 1.029 + 0.30`
- `class PayPalPayment implements PaymentStrategy` — charges `amount * 1.035`
- `class StoreCreditPayment implements PaymentStrategy` — charges `amount` unchanged
- `class PaymentProcessor` with `double process(PaymentStrategy strategy, double amount)` that returns `strategy.charge(amount)` — `process` must not contain any `if`/`else` or `instanceof` checking which strategy it received

```challenge
class PaymentStrategy {
    // TODO: make this an interface with double charge(double amount)
}

class CreditCardPayment {
    // TODO
}

class PayPalPayment {
    // TODO
}

class StoreCreditPayment {
    // TODO
}

class PaymentProcessor {
    // TODO
}
```

```test
PaymentProcessor processor = new PaymentProcessor();

double creditResult = processor.process(new CreditCardPayment(), 100.0);
assert Math.abs(creditResult - 103.2) < 0.001

double paypalResult = processor.process(new PayPalPayment(), 100.0);
assert Math.abs(paypalResult - 103.5) < 0.001

double storeCreditResult = processor.process(new StoreCreditPayment(), 100.0);
assert storeCreditResult == 100.0

assert new CreditCardPayment() instanceof PaymentStrategy
assert new PayPalPayment() instanceof PaymentStrategy
assert new StoreCreditPayment() instanceof PaymentStrategy
```
