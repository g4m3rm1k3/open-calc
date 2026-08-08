---
series: java-architecture
level: 1
title: Layered Architecture
lang: java
---

# Layered Architecture

Level 0 ended with `placeOrder` doing four unrelated jobs — calculation, decision, persistence, notification — all mixed into a method you could not test without charging a real credit card. **Layered architecture** is the standard, documented fix: split the system into layers, each with exactly one kind of responsibility, where each layer only ever talks to the layer directly beneath it. This is not a Java-specific idea — it is the default shape of nearly every backend framework in existence, including Spring (the framework most real Java teams use, which we are not running here but whose shape you are about to learn by hand).

## The three layers

```text
Request
  |
  v
CONTROLLER   -- receives input, has no business logic
  |
  v
SERVICE      -- the business rules; the ONLY layer that decides anything
  |
  v
REPOSITORY   -- persistence; knows how to save/load, knows nothing about rules
  |
  v
Database (a List, for now — a real database arrives in Level 2)
```

Each arrow only points one way. A `Repository` never calls a `Service`. A `Service` never talks directly to whatever received the original request. This one rule — **each layer depends only downward** — is what makes each layer independently understandable and independently testable.

## The Repository layer, first

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

    static class Order {
        String customerEmail;
        List<OrderLine> lines;
        double total;
        Order(String customerEmail, List<OrderLine> lines, double total) {
            this.customerEmail = customerEmail;
            this.lines = lines;
            this.total = total;
        }
    }

    // REPOSITORY: the only class allowed to know HOW orders are stored.
    static class OrderRepository {
        private final List<Order> savedOrders = new ArrayList<>();

        void save(Order order) {
            savedOrders.add(order);
            System.out.println("Repository: saved order for " + order.customerEmail);
        }

        int count() {
            return savedOrders.size();
        }
    }

    public static void main(String[] args) {
        OrderRepository repository = new OrderRepository();
        List<OrderLine> lines = new ArrayList<>();
        lines.add(new OrderLine("Keyboard", 1, 79.99));
        repository.save(new Order("alice@example.com", lines, 79.99));
        System.out.println("Orders stored: " + repository.count());
    }
}
```

```text
Repository: saved order for alice@example.com
Orders stored: 1
```

**Walkthrough:** `OrderRepository` wraps a `List<Order>` (standing in for a real database until Level 2) behind two methods, `save` and `count`. Nothing outside this class ever touches `savedOrders` directly — the `private final` list is only reachable through the methods this class chooses to expose.

**CS lens:** `private final List<Order> savedOrders` is **encapsulation**: the internal representation (a `List`) is hidden, and the only way to affect it is through the class's own methods. `final` means the *reference* `savedOrders` can never be reassigned to point at a different list after construction — you can still add to the list it points to, but you can never swap it out for another list entirely.

## The Service layer: where the rules live

```java
import java.util.List;

public class Main {
    // (OrderLine, Order, OrderRepository as above)

    // SERVICE: the ONLY class that decides anything.
    static class OrderService {
        private final OrderRepository repository;

        OrderService(OrderRepository repository) {
            this.repository = repository;
        }

        Order placeOrder(String customerEmail, List<OrderLine> lines) {
            double total = calculateTotal(lines);
            Order order = new Order(customerEmail, lines, total);
            repository.save(order);
            return order;
        }

        private double calculateTotal(List<OrderLine> lines) {
            double total = 0;
            for (OrderLine line : lines) {
                total += line.quantity * line.unitPrice;
            }
            return total;
        }
    }

    public static void main(String[] args) {
        OrderRepository repository = new OrderRepository();
        OrderService service = new OrderService(repository);

        List<OrderLine> lines = List.of(new OrderLine("Keyboard", 1, 79.99));
        Order order = service.placeOrder("alice@example.com", lines);
        System.out.println("Placed order total: " + order.total);
    }
}
```

```text
Repository: saved order for alice@example.com
Placed order total: 79.99
```

**Walkthrough:** `OrderService`'s constructor takes an `OrderRepository` and stores it in a field. `placeOrder` computes the total (the business rule that was tangled up with I/O in Level 0), builds an `Order`, hands it to `repository.save(order)`, and returns it. `OrderService` never touches a database directly, and never prints a receipt or sends an email — those belong to other layers.

**SE lens:** `calculateTotal` is now `private` — a detail internal to `OrderService`, invisible outside it, exactly like `savedOrders` was invisible outside `OrderRepository`. This is the same encapsulation idea from the Repository, reappearing here as a designed boundary rather than an accident: each layer only shows the outside world what it needs to, and hides how it does its job. `OrderService` receiving an already-constructed `OrderRepository` through its constructor (rather than creating one itself with `new OrderRepository()`) is the first appearance of **dependency injection** — Level 3 names and studies it properly; for now, just notice that `OrderService` never wrote the words `new OrderRepository()` anywhere in its own body.

## The Controller layer: the thin top

```java
import java.util.List;

public class Main {
    // (OrderLine, Order, OrderRepository, OrderService as above)

    // CONTROLLER: receives a request, delegates immediately, has NO business logic.
    static class OrderController {
        private final OrderService service;

        OrderController(OrderService service) {
            this.service = service;
        }

        String handlePlaceOrder(String customerEmail, List<OrderLine> lines) {
            Order order = service.placeOrder(customerEmail, lines);
            return "Order confirmed. Total: $" + order.total;
        }
    }

    public static void main(String[] args) {
        OrderRepository repository = new OrderRepository();
        OrderService service = new OrderService(repository);
        OrderController controller = new OrderController(service);

        List<OrderLine> lines = List.of(
            new OrderLine("Keyboard", 1, 79.99),
            new OrderLine("Mouse", 2, 24.50)
        );
        String response = controller.handlePlaceOrder("bob@example.com", lines);
        System.out.println(response);
    }
}
```

```text
Repository: saved order for bob@example.com
Order confirmed. Total: $128.99
```

**Walkthrough:** `OrderController.handlePlaceOrder` does exactly two things: call `service.placeOrder(...)` and format its result into a response string. It contains zero arithmetic and zero persistence code — if you deleted `OrderService` and `OrderRepository` entirely, `OrderController` would have nothing left to do, because it owns no logic of its own.

**CS lens:** This three-class chain — `OrderController` holds an `OrderService`, `OrderService` holds an `OrderRepository` — is a **composition** relationship (an object contains a reference to another object as a field), not inheritance. Each class is small enough to read completely in a few seconds, which is the actual, measurable benefit of layering: comprehension cost per class stays flat as the system grows, instead of one method accumulating every new requirement.

## What each layer can now do alone

```text
TESTABILITY, BEFORE AND AFTER:

  BEFORE (Level 0): placeOrder() did math + payment + save + email in one method.
    Testing the math required a real charge, a real save, a real email.

  AFTER (Level 1):
    OrderRepository — test save()/count() with no business logic involved at all.
    OrderService     — test placeOrder()'s total calculation by giving it a
                        repository (even a fake one — Level 9 does exactly this).
    OrderController   — test that it calls the service and formats a string;
                        it has no math to get wrong.
```

**SE lens:** This is the direct payoff of the layering, stated concretely rather than abstractly: each layer can now be tested by itself, because each layer has exactly one reason to change. This idea — a class should have exactly one reason to change — is the **Single Responsibility Principle**, the "S" in SOLID, and it is not a slogan; here it is the literal, mechanical reason `OrderService` can be tested without a database and `OrderRepository` can be tested without business rules.

## Challenge: three_layer_order_flow

Build the three-layer version of order placement.

Given `OrderLine` and `Order` as shown above, write:
- `class OrderRepository` with `void save(Order order)` (append to an internal list) and `int count()`
- `class OrderService` with a constructor taking an `OrderRepository`, and `Order placeOrder(String customerEmail, List<OrderLine> lines)` that computes the total (`quantity * unitPrice` summed across lines), builds an `Order`, saves it via the repository, and returns it
- `class OrderController` with a constructor taking an `OrderService`, and `String handlePlaceOrder(String customerEmail, List<OrderLine> lines)` returning `"Order confirmed. Total: $" + order.total`

```challenge
import java.util.ArrayList;
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

class Order {
    String customerEmail;
    List<OrderLine> lines;
    double total;
    Order(String customerEmail, List<OrderLine> lines, double total) {
        this.customerEmail = customerEmail;
        this.lines = lines;
        this.total = total;
    }
}

class OrderRepository {
    // TODO
}

class OrderService {
    // TODO
}

class OrderController {
    // TODO
}
```

```test
import java.util.List;

OrderRepository repository = new OrderRepository();
OrderService service = new OrderService(repository);
OrderController controller = new OrderController(service);

List<OrderLine> lines = List.of(
    new OrderLine("Keyboard", 1, 79.99),
    new OrderLine("Mouse", 2, 24.50)
);

String response = controller.handlePlaceOrder("bob@example.com", lines);
assert response.equals("Order confirmed. Total: $128.99")
assert repository.count() == 1

controller.handlePlaceOrder("carol@example.com", List.of(new OrderLine("Widget", 3, 10.0)));
assert repository.count() == 2

String response2 = controller.handlePlaceOrder("dave@example.com", List.of(new OrderLine("Gadget", 1, 5.0)));
assert response2.equals("Order confirmed. Total: $5.0")
assert repository.count() == 3
```
