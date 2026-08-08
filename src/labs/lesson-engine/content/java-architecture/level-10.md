---
series: java-architecture
level: 10
title: Java Architecture — Putting It Together
lang: java
---

# Java Architecture — Putting It Together

Ten levels ago, `placeOrder` was one method doing four unrelated jobs, untestable without charging a real credit card. This capstone assembles everything since into one coherent order processing system, and traces one order through every pattern to show how they cooperate rather than compete.

## The complete domain core

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    // ---- PORTS (Level 8): interfaces the domain core defines for itself ----
    interface OrderRepository {
        void save(Order order);
    }

    interface PaymentStrategy {  // Level 4
        double charge(double amount);
        String describe();
    }

    interface OrderObserver {  // Level 6
        void onTransition(String customerEmail, String oldState, String newState);
    }

    // ---- STATE (Level 5): the order lifecycle, as real classes, not booleans ----
    interface OrderState {
        String name();
        void ship(Order order);
        void cancel(Order order);
    }

    static class PaidState implements OrderState {
        @Override public String name() { return "PAID"; }
        @Override public void ship(Order order) { order.transitionTo(new ShippedState()); }
        @Override public void cancel(Order order) { order.transitionTo(new CancelledState()); }
    }

    static class ShippedState implements OrderState {
        @Override public String name() { return "SHIPPED"; }
        @Override public void ship(Order order) { throw new IllegalStateException("Already shipped"); }
        @Override public void cancel(Order order) { throw new IllegalStateException("Cannot cancel a shipped order"); }
    }

    static class CancelledState implements OrderState {
        @Override public String name() { return "CANCELLED"; }
        @Override public void ship(Order order) { throw new IllegalStateException("Order is cancelled"); }
        @Override public void cancel(Order order) { throw new IllegalStateException("Already cancelled"); }
    }

    // ---- THE DOMAIN OBJECT: built via Builder (Level 7), observed (Level 6), stateful (Level 5) ----
    static class Order {
        final String customerEmail;
        final double total;
        OrderState state;
        private final List<OrderObserver> observers = new ArrayList<>();

        private Order(Builder builder) {
            this.customerEmail = builder.customerEmail;
            this.total = builder.total;
            this.state = new PaidState();  // this build path always starts already paid
        }

        void addObserver(OrderObserver observer) { observers.add(observer); }

        void transitionTo(OrderState newState) {
            String oldState = state.name();
            state = newState;
            for (OrderObserver observer : observers) observer.onTransition(customerEmail, oldState, newState.name());
        }

        void ship()   { state.ship(this); }
        void cancel() { state.cancel(this); }

        static class Builder {
            private String customerEmail;
            private double total;
            Builder customerEmail(String value) { this.customerEmail = value; return this; }
            Builder total(double value) { this.total = value; return this; }
            Order build() {
                if (customerEmail == null) throw new IllegalStateException("customerEmail is required");
                if (total <= 0) throw new IllegalArgumentException("Order total must be positive");
                return new Order(this);
            }
        }
    }

    // ---- THE SERVICE (Level 1, 3): pure domain logic, dependencies injected ----
    static class OrderService {
        private final OrderRepository repository;
        private final PaymentStrategy paymentStrategy;

        OrderService(OrderRepository repository, PaymentStrategy paymentStrategy) {
            this.repository = repository;
            this.paymentStrategy = paymentStrategy;
        }

        Order placeOrder(String customerEmail, double subtotal) {
            double charged = paymentStrategy.charge(subtotal);
            System.out.println("Charged via " + paymentStrategy.describe() + ": $" + charged);

            Order order = new Order.Builder()
                .customerEmail(customerEmail)
                .total(charged)
                .build();

            repository.save(order);
            return order;
        }
    }

    // ---- ADAPTERS (Level 2, 8): concrete, swappable implementations of the ports ----
    static class InMemoryOrderRepository implements OrderRepository {
        private final List<Order> savedOrders = new ArrayList<>();
        @Override public void save(Order order) {
            savedOrders.add(order);
            System.out.println("Repository: saved order for " + order.customerEmail);
        }
        int count() { return savedOrders.size(); }
    }

    static class CreditCardPayment implements PaymentStrategy {
        @Override public double charge(double amount) { return amount * 1.029 + 0.30; }
        @Override public String describe() { return "credit card"; }
    }

    public static void main(String[] args) {
        InMemoryOrderRepository repository = new InMemoryOrderRepository();
        OrderService service = new OrderService(repository, new CreditCardPayment());

        Order order = service.placeOrder("alice@example.com", 100.0);

        order.addObserver((email, oldState, newState) ->
            System.out.println("[LOG] " + email + ": " + oldState + " -> " + newState));

        order.ship();

        try {
            order.cancel();
        } catch (IllegalStateException e) {
            System.out.println("Rejected: " + e.getMessage());
        }

        System.out.println("Orders in repository: " + repository.count());
    }
}
```

```text
Charged via credit card: $103.2
Repository: saved order for alice@example.com
[LOG] alice@example.com: PAID -> SHIPPED
Rejected: Cannot cancel a shipped order
Orders in repository: 1
```

## Tracing one order through every pattern

```text
service.placeOrder("alice@example.com", 100.0) flows through:

  1. STRATEGY (Level 4): paymentStrategy.charge(100.0)
     -> CreditCardPayment computes 100.0 * 1.029 + 0.30 = 103.2
     -> OrderService never knew or cared it was specifically a credit card

  2. BUILDER (Level 7): new Order.Builder().customerEmail(...).total(103.2).build()
     -> validates customerEmail is present and total is positive
     -> constructs the Order only after validation passes
     -> Order starts life in PaidState (STATE, Level 5)

  3. REPOSITORY (Level 2 + DEPENDENCY INJECTION, Level 3): repository.save(order)
     -> OrderService depends on the OrderRepository INTERFACE only
     -> InMemoryOrderRepository was handed in from main() (the composition root)

  4. OBSERVER (Level 6): order.addObserver(...)
     -> Order announces its own transitions; it doesn't know who's listening

  5. STATE (Level 5): order.ship()
     -> PaidState.ship() transitions to ShippedState, which notifies observers
     -> order.cancel() afterward is rejected: ShippedState.cancel() throws,
        because "cancel a shipped order" was never a reachable transition

ALL OF IT sits behind the HEXAGON (Level 8): OrderService and Order form the
domain core; OrderRepository and PaymentStrategy are ports; InMemoryOrderRepository
and CreditCardPayment are adapters. Swap either adapter for a real one and
nothing above this line changes — which is exactly what Level 9's contract
tests exist to verify before that swap ever reaches production.
```

**CS lens:** No single pattern here does the whole job — each one owns exactly one axis of change. Strategy varies *how payment happens*. Builder varies *how construction happens*. State varies *what's currently allowed*. Observer varies *who finds out*. Repository varies *where data lives*. This is **orthogonality**: each axis can change independently of the others, because none of them depend on each other's internals — only on the domain core's interfaces.

**SE lens:** This is also, concretely, why the system is testable at all (Level 9): every one of those five ports can be replaced with a fake, a stub, or a spy without editing `OrderService` or `Order`. A system with this shape can add a new payment method, a new notification channel, or a new persistence backend as an isolated, independently reviewable change — which is the actual, measurable difference between a system that survives five years of changing business requirements and one that gets rewritten from scratch at year two.

## Common mistakes with this many patterns at once

```text
- OVER-ENGINEERING: not every project needs all six patterns from day one. Level 0's
  monolithic placeOrder was genuinely fine for a five-minute prototype. Patterns
  earn their place when a REAL pain (untestable code, an editing-the-same-method-
  for-every-feature problem) actually shows up — not because the pattern is famous.

- SKIPPING THE PORT: implementing OrderService against a concrete
  InMemoryOrderRepository directly (Level 2's mistake) silently reintroduces
  every later problem — no swappable adapters, no fakes for testing, no hexagon.

- FORGETTING transitionTo IS THE ONLY DOOR: if any code sets order.state directly
  instead of going through a state's own transition method, the State pattern's
  entire guarantee (illegal transitions are unrepresentable) is gone — a single
  direct assignment can undo everything Level 5 built.

- BUILDING THE FACTORY AND THE BUILDER AS ONE OBJECT: Level 7 kept them separate
  on purpose — Factory decides WHICH class; Builder assembles ONE class's fields.
  Merging them produces a class that both branches on type and juggles optional
  fields, which is the exact tangle these patterns exist to prevent.
```

## Course status

Eleven levels, starting from one four-job method that could not be tested without charging a real credit card, ending with a domain core assembled from Repository, Dependency Injection, Strategy, State, Observer, Builder, Factory, and Hexagonal Architecture — each one introduced only after its absence caused a specific, felt problem, and each one traceable to a documented, industry-standard catalog entry (Gang of Four, Fowler's *PoEAA*, Cockburn's Ports and Adapters) rather than invented from scratch. This is also the shape real Spring Boot applications take once their `@Service`, `@Repository`, and `@Autowired` annotations are read as what they actually automate: everything you just built by hand.

## Challenge: complete_order_capstone

Build the smallest version of the full system: Strategy for payment, Builder for construction, Repository behind an injected interface, and State for shipping — together.

Given `interface PaymentStrategy` with `double charge(double amount)`, and `interface OrderRepository` with `void save(Order order)` and `int count()` — both already provided in the challenge stub below — write:
- `class FlatFeePayment implements PaymentStrategy` — charges `amount + 1.00`
- `class Order` with `final String customerEmail`, `final double total`, a `String state` field (starts `"PAID"`), a `private` constructor taking a `Builder`, and `void ship()` — sets `state` to `"SHIPPED"` if currently `"PAID"`, otherwise throws `IllegalStateException`
  - nested `static class Builder` with `customerEmail(String)`, `total(double)`, and `build()` throwing `IllegalStateException` if `customerEmail` is `null`
- `class InMemoryOrderRepository implements OrderRepository` backed by an `ArrayList<Order>`
- `class OrderService` with a constructor `(OrderRepository repository, PaymentStrategy paymentStrategy)` and `Order placeOrder(String customerEmail, double subtotal)` that charges via the strategy, builds an `Order` with the charged total, saves it, and returns it

```challenge
import java.util.ArrayList;
import java.util.List;

interface PaymentStrategy {
    double charge(double amount);
}

interface OrderRepository {
    void save(Order order);
    int count();
}

class FlatFeePayment implements PaymentStrategy {
    // TODO
}

class Order {
    // TODO
}

class InMemoryOrderRepository implements OrderRepository {
    // TODO
}

class OrderService {
    // TODO
}
```

```test
InMemoryOrderRepository repository = new InMemoryOrderRepository();
OrderService service = new OrderService(repository, new FlatFeePayment());

Order order = service.placeOrder("alice@example.com", 49.00);

assert order.customerEmail.equals("alice@example.com")
assert order.total == 50.0
assert order.state.equals("PAID")

order.ship();
assert order.state.equals("SHIPPED")

boolean threwOnDoubleShip = false;
try { order.ship(); } catch (IllegalStateException e) { threwOnDoubleShip = true; }
assert threwOnDoubleShip

boolean threwOnMissingEmail = false;
try { new Order.Builder().total(10.0).build(); } catch (IllegalStateException e) { threwOnMissingEmail = true; }
assert threwOnMissingEmail
```
