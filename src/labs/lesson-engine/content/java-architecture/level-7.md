---
series: java-architecture
level: 7
title: Factory and Builder
lang: java
---

# Factory and Builder

The order system has grown: an order now optionally has a discount code, gift wrapping, a shipping address, and international customs details. Constructing one is starting to hurt. This lesson covers two more Gang of Four creational patterns — **Builder** ("separate the construction of a complex object from its representation") and **Factory Method** ("define an interface for creating an object, but let subclasses decide which class to instantiate") — each fixing a different construction problem.

## The telescoping constructor

```java
public class Main {
    static class Order {
        String customerEmail;
        double total;
        String discountCode;
        boolean giftWrapped;
        String shippingAddress;
        boolean isInternational;
        String customsDeclaration;

        // Every optional combination needs its own constructor, or every caller
        // must pass null/false for fields it doesn't care about.
        Order(String customerEmail, double total, String discountCode, boolean giftWrapped,
              String shippingAddress, boolean isInternational, String customsDeclaration) {
            this.customerEmail = customerEmail;
            this.total = total;
            this.discountCode = discountCode;
            this.giftWrapped = giftWrapped;
            this.shippingAddress = shippingAddress;
            this.isInternational = isInternational;
            this.customsDeclaration = customsDeclaration;
        }
    }

    public static void main(String[] args) {
        // What is "false" here? What is null? A reader must go count parameters to know.
        Order order = new Order("alice@example.com", 79.99, null, false,
            "123 Main St", false, null);
        System.out.println("Order for " + order.customerEmail + ", gift wrapped: " + order.giftWrapped);
    }
}
```

```text
Order for alice@example.com, gift wrapped: false
```

**The problem, stated concretely:** the call site `new Order("alice@example.com", 79.99, null, false, "123 Main St", false, null)` communicates nothing about which argument is which — a reader has to count positions and cross-reference the constructor signature to know that the fourth `false` means "not gift wrapped." Swap two `boolean` arguments by accident and the compiler will not catch it; the order will simply be silently wrong.

## The Builder pattern

```java
public class Main {
    static class Order {
        final String customerEmail;
        final double total;
        final String discountCode;
        final boolean giftWrapped;
        final String shippingAddress;

        // Constructor is now private — the ONLY way to build an Order is through the Builder.
        private Order(Builder builder) {
            this.customerEmail = builder.customerEmail;
            this.total = builder.total;
            this.discountCode = builder.discountCode;
            this.giftWrapped = builder.giftWrapped;
            this.shippingAddress = builder.shippingAddress;
        }

        static class Builder {
            private String customerEmail;
            private double total;
            private String discountCode = null;      // sensible default
            private boolean giftWrapped = false;      // sensible default
            private String shippingAddress;

            Builder customerEmail(String value) { this.customerEmail = value; return this; }
            Builder total(double value)         { this.total = value; return this; }
            Builder discountCode(String value)  { this.discountCode = value; return this; }
            Builder giftWrapped(boolean value)   { this.giftWrapped = value; return this; }
            Builder shippingAddress(String value){ this.shippingAddress = value; return this; }

            Order build() {
                if (customerEmail == null) throw new IllegalStateException("customerEmail is required");
                if (shippingAddress == null) throw new IllegalStateException("shippingAddress is required");
                return new Order(this);
            }
        }
    }

    public static void main(String[] args) {
        // Every argument is now named. Optional fields can simply be omitted.
        Order order = new Order.Builder()
            .customerEmail("alice@example.com")
            .total(79.99)
            .shippingAddress("123 Main St")
            .giftWrapped(true)
            .build();

        System.out.println("Order for " + order.customerEmail + ", gift wrapped: " + order.giftWrapped
            + ", discount: " + order.discountCode);
    }
}
```

```text
Order for alice@example.com, gift wrapped: true, discount: null
```

**Walkthrough:** `Order`'s own constructor is now `private`, taking a `Builder` rather than seven raw values — the only path to a real `Order` is through `Builder`. Each `Builder` method (`customerEmail(...)`, `total(...)`, and so on) sets one field and returns `this`, which is what allows the calls to be chained: `.customerEmail(...).total(...).shippingAddress(...)`. `build()` validates required fields are present before ever constructing the real `Order`, and only then calls the private constructor.

**CS lens:** Returning `this` from every setter method is called **method chaining** (sometimes "a fluent interface"). Each call reads left to right as a sentence: "build an order, with this email, this total, this address, gift wrapped." Compare this to the telescoping constructor, where the same information was encoded purely by *position* — the Builder replaces positional meaning with named meaning, at the cost of one extra class.

**SE lens:** Notice `discountCode` and `giftWrapped` both have defaults set directly in `Builder`'s field declarations — a caller who doesn't care about gift wrapping simply never calls `.giftWrapped(...)` at all, and it stays `false`. This is what actually solves the telescoping-constructor problem: optional parameters are genuinely optional now, instead of requiring every caller to pass a placeholder value for every field they don't use.

## The Factory Method pattern

Builder solves *how* to construct one kind of object with many optional fields. A different problem: choosing *which class* to construct based on runtime information.

```java
public class Main {
    interface Order {
        double calculateShippingCost();
        String describe();
    }

    static class DomesticOrder implements Order {
        double weightKg;
        DomesticOrder(double weightKg) { this.weightKg = weightKg; }
        @Override public double calculateShippingCost() { return 4.99 + weightKg * 0.50; }
        @Override public String describe() { return "Domestic order, " + weightKg + "kg"; }
    }

    static class InternationalOrder implements Order {
        double weightKg;
        String customsDeclaration;
        InternationalOrder(double weightKg, String customsDeclaration) {
            this.weightKg = weightKg;
            this.customsDeclaration = customsDeclaration;
        }
        @Override public double calculateShippingCost() { return 24.99 + weightKg * 2.00; }
        @Override public String describe() { return "International order, " + weightKg + "kg, customs: " + customsDeclaration; }
    }

    // FACTORY METHOD: hides which concrete class gets built behind one decision point.
    static class OrderFactory {
        static Order create(String countryCode, double weightKg) {
            if (countryCode.equals("US")) {
                return new DomesticOrder(weightKg);
            } else {
                return new InternationalOrder(weightKg, "Standard goods declaration");
            }
        }
    }

    public static void main(String[] args) {
        Order order1 = OrderFactory.create("US", 2.0);
        Order order2 = OrderFactory.create("CA", 2.0);

        System.out.println(order1.describe() + " -> $" + order1.calculateShippingCost());
        System.out.println(order2.describe() + " -> $" + order2.calculateShippingCost());
    }
}
```

```text
Domestic order, 2.0kg -> $5.99
International order, 2.0kg, customs: Standard goods declaration
International order, 2.0kg, customs: Standard goods declaration -> $28.99
```

**CS lens:** `OrderFactory.create` is where a runtime value (`countryCode`, only known when a real order comes in) determines a compile-time choice (which class gets instantiated). Calling code never writes `new DomesticOrder(...)` or `new InternationalOrder(...)` directly — it asks the factory for "an `Order`" and receives whichever concrete implementation fits, exactly the same programming-to-an-interface discipline from Level 2's Repository, now applied to object creation instead of persistence.

**SE lens:** Builder and Factory Method solve genuinely different problems and are easy to conflate because both are "creational" patterns: Builder is for *one* class with many optional parts; Factory Method is for *choosing among several classes* based on a condition. A real system often uses both together — an `OrderFactory` might decide *which* order type to build, then hand off to that type's own `Builder` to actually assemble it field by field.

## Recognition

```text
Today: Builder (fluent, validated construction) and Factory Method (runtime class choice)

Also recognized in: Java's own StringBuilder and Stream.builder(), Android's
AlertDialog.Builder, Spring's BeanFactory choosing which bean implementation
to wire up based on configuration, and any UI library's createElement(type, props)
function that returns a different component class depending on the "type" string.
```

## Challenge: order_builder_and_factory

Implement both patterns together.

Write:
- `class Order` with `final` fields `customerEmail`, `total`, `discountCode` (may be `null`), `giftWrapped` (default `false`), a `private` constructor taking a `Builder`, and a nested `static class Builder` with chainable setters `customerEmail(String)`, `total(double)`, `discountCode(String)`, `giftWrapped(boolean)`, and `build()` that throws `IllegalStateException` if `customerEmail` was never set
- `interface ShippingCalculator` with `double cost(double weightKg)`
- `class DomesticShipping implements ShippingCalculator` — `4.99 + weightKg * 0.50`
- `class InternationalShipping implements ShippingCalculator` — `24.99 + weightKg * 2.00`
- `class ShippingFactory` with `static ShippingCalculator create(String countryCode)` — returns `DomesticShipping` for `"US"`, `InternationalShipping` otherwise

```challenge
class Order {
    // TODO
}

class ShippingCalculator {
    // TODO: make this an interface
}

class DomesticShipping {
    // TODO
}

class InternationalShipping {
    // TODO
}

class ShippingFactory {
    // TODO
}
```

```test
Order order = new Order.Builder()
    .customerEmail("alice@example.com")
    .total(79.99)
    .giftWrapped(true)
    .build();

assert order.customerEmail.equals("alice@example.com")
assert order.total == 79.99
assert order.giftWrapped == true

boolean threwOnMissingEmail = false;
try {
    new Order.Builder().total(10.0).build();
} catch (IllegalStateException e) {
    threwOnMissingEmail = true;
}
assert threwOnMissingEmail

ShippingCalculator domestic = ShippingFactory.create("US");
ShippingCalculator international = ShippingFactory.create("DE");

assert Math.abs(domestic.cost(2.0) - 5.99) < 0.001
assert Math.abs(international.cost(2.0) - 28.99) < 0.001
```
