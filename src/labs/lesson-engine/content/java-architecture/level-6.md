---
series: java-architecture
level: 6
title: The Observer Pattern
lang: java
---

# The Observer Pattern

Level 5's `Order.transitionTo` is the one place every state change flows through. The business now wants to react to those transitions: email the customer when an order ships, log every transition for analytics, alert the warehouse when an order is cancelled. The naive move is to add each of these directly inside `transitionTo`. This lesson shows why that naive move recreates Level 0's original problem, and applies the **Observer pattern** — Gang of Four again — documented as: "define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically."

## The naive version: Order calls everyone directly

```java
public class Main {
    static class Order {
        String customerEmail;
        String state = "PLACED";

        Order(String customerEmail) { this.customerEmail = customerEmail; }

        void transitionTo(String newState) {
            this.state = newState;

            // Order now knows about email, logging, AND the warehouse.
            if (newState.equals("SHIPPED")) {
                System.out.println("[EMAIL] Your order has shipped, " + customerEmail);
            }
            System.out.println("[LOG] " + customerEmail + " -> " + newState);
            if (newState.equals("CANCELLED")) {
                System.out.println("[WAREHOUSE] Stop fulfillment for " + customerEmail);
            }
        }
    }

    public static void main(String[] args) {
        Order order = new Order("alice@example.com");
        order.transitionTo("PAID");
        order.transitionTo("SHIPPED");
    }
}
```

```text
[LOG] alice@example.com -> PAID
[EMAIL] Your order has shipped, alice@example.com
[LOG] alice@example.com -> SHIPPED
```

**The problem, stated concretely:** `Order` — a class whose entire job, per Level 1's layering, is to represent an order and its lifecycle — now also contains email-sending logic, logging logic, and warehouse-alerting logic. Adding SMS notifications means editing `Order` again. Adding a new team's analytics hook means editing `Order` again. `Order` has become the same kind of dumping ground `placeOrder` was in Level 0, just relocated.

## Observers: Order announces, it doesn't call

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    // OBSERVER interface: the one shape every listener must satisfy.
    interface OrderObserver {
        void onTransition(String customerEmail, String oldState, String newState);
    }

    // The SUBJECT: it holds a list of observers and knows nothing about what they do.
    static class Order {
        String customerEmail;
        String state = "PLACED";
        private final List<OrderObserver> observers = new ArrayList<>();

        Order(String customerEmail) { this.customerEmail = customerEmail; }

        void addObserver(OrderObserver observer) {
            observers.add(observer);
        }

        void transitionTo(String newState) {
            String oldState = this.state;
            this.state = newState;
            for (OrderObserver observer : observers) {
                observer.onTransition(customerEmail, oldState, newState);
            }
        }
    }

    public static void main(String[] args) {
        Order order = new Order("bob@example.com");

        // Each concern subscribes independently. Order doesn't know any of their names.
        order.addObserver((email, oldState, newState) ->
            System.out.println("[LOG] " + email + ": " + oldState + " -> " + newState));

        order.addObserver((email, oldState, newState) -> {
            if (newState.equals("SHIPPED")) System.out.println("[EMAIL] Your order has shipped, " + email);
        });

        order.transitionTo("PAID");
        order.transitionTo("SHIPPED");
    }
}
```

```text
[LOG] bob@example.com: PLACED -> PAID
[LOG] bob@example.com: PAID -> SHIPPED
[EMAIL] Your order has shipped, bob@example.com
```

**Walkthrough:** `OrderObserver` is a **functional interface** — an interface with exactly one abstract method (`onTransition`) — which is what lets it be implemented with a **lambda expression** (`(email, oldState, newState) -> { ... }`) instead of a full named class. `(params) -> expression` or `(params) -> { statements }` is shorthand for "an object implementing this one-method interface, whose method body is exactly this." `order.addObserver(...)` registers each lambda in the `observers` list; `transitionTo` loops over that list and calls `onTransition` on every one of them, in the order they were added — it never asks what any of them actually does.

**CS lens:** `Order` is the **subject** in Observer-pattern terminology; each registered listener is an **observer**. The subject holds a collection of observers through the interface type only — it has no idea whether an observer sends an email, writes a log line, or does nothing at all. This is the same programming-to-an-interface idea from Level 2's Repository, applied to notification instead of persistence: `Order` depends on the shape `OrderObserver`, never on any specific concrete listener.

## Adding a new concern with zero edits to Order

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    // (OrderObserver, Order as above)

    public static void main(String[] args) {
        Order order = new Order("carol@example.com");

        List<String> auditTrail = new ArrayList<>();
        // NEW observer, invented after Order was already fully written. Order's source is untouched.
        order.addObserver((email, oldState, newState) ->
            auditTrail.add(email + " moved from " + oldState + " to " + newState));

        order.transitionTo("PAID");
        order.transitionTo("SHIPPED");
        order.transitionTo("DELIVERED");

        System.out.println("Audit trail has " + auditTrail.size() + " entries:");
        auditTrail.forEach(entry -> System.out.println("  " + entry));
    }
}
```

```text
Audit trail has 3 entries:
  carol@example.com moved from PLACED to PAID
  carol@example.com moved from PAID to SHIPPED
  carol@example.com moved from SHIPPED to DELIVERED
```

**SE lens:** This new audit-trail observer required zero changes to `Order` — the same open/closed payoff Strategy gave you in Level 4, now applied to a completely different problem shape: not "which algorithm runs" but "who gets told when something happens." Observer and Strategy are often confused because both use an interface and both avoid `if`/`else` chains, but they solve different problems: Strategy picks **one** interchangeable algorithm to run; Observer notifies **all** interested parties without the subject needing to know who they are or how many there are.

## What breaks without it

```java
public class Main {
    static class Order {
        String state = "PLACED";
        // Imagine transitionTo() called emailService.send(...) directly, right here.
    }

    public static void main(String[] args) {
        // To test "does transitioning to SHIPPED update state correctly?" you would
        // ALSO have to have a working email service, logger, and warehouse system
        // available — or the test crashes on something unrelated to what it's testing.
        System.out.println("Without Observer: testing state transitions requires every notification system to also work.");
        System.out.println("With Observer: a test can register zero observers, or a single fake one, and check nothing else.");
    }
}
```

```text
Without Observer: testing state transitions requires every notification system to also work.
With Observer: a test can register zero observers, or a single fake one, and check nothing else.
```

**What breaks:** Coupling `Order` directly to email/logging/warehouse code means a unit test for "does `transitionTo` update `state` correctly?" also exercises (or must fake) every one of those systems, exactly like Level 0's `placeOrder` could not be tested without a real charge. Level 9 (Testing the Architecture) relies on Observer for precisely this reason: a test attaches one minimal fake observer, asserts what it recorded, and never touches a real email service at all.

## Recognition

```text
Today: Observer — a subject notifies a list of observers without knowing what they do

Also recognized in: every GUI button's onClick listener list, JavaScript's
addEventListener, Java's own PropertyChangeListener, RxJava/Reactive Streams
subscribers, a stock ticker pushing price updates to many subscribed displays,
and pub/sub messaging systems like Kafka or RabbitMQ at the distributed-systems
scale — the same "announce, don't call" idea, just across a network instead
of inside one process.
```

## Challenge: observable_order

Make `Order` announce its transitions to any number of registered observers.

Write:
- `interface OrderObserver` with one method: `void onTransition(String customerEmail, String oldState, String newState)`
- `class Order` with a constructor taking `String customerEmail` (starts in state `"PLACED"`), `void addObserver(OrderObserver observer)`, `void transitionTo(String newState)` (updates `state` and calls every registered observer's `onTransition` with the customer's email, the old state, and the new state, in the order observers were added), and `String getState()`

```challenge
import java.util.ArrayList;
import java.util.List;

class OrderObserver {
    // TODO: make this an interface
}

class Order {
    // TODO
}
```

```test
import java.util.ArrayList;
import java.util.List;

Order order = new Order("alice@example.com");

List<String> calls = new ArrayList<>();
order.addObserver((email, oldState, newState) -> calls.add(email + ":" + oldState + "->" + newState));

int[] secondObserverCallCount = {0};
order.addObserver((email, oldState, newState) -> secondObserverCallCount[0]++);

order.transitionTo("PAID");
order.transitionTo("SHIPPED");

assert order.getState().equals("SHIPPED")
assert calls.size() == 2
assert calls.get(0).equals("alice@example.com:PLACED->PAID")
assert calls.get(1).equals("alice@example.com:PAID->SHIPPED")
assert secondObserverCallCount[0] == 2

// An order with no observers must still transition without throwing.
Order lonely = new Order("bob@example.com");
lonely.transitionTo("PAID");
assert lonely.getState().equals("PAID")
```
