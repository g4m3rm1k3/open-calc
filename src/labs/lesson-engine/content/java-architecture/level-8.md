---
series: java-architecture
level: 8
title: Hexagonal Architecture
lang: java
---

# Hexagonal Architecture

Every pattern so far — Repository, Strategy, State, Observer, Factory — already followed one shared discipline: the class containing the business rule (`OrderService`, `Order`) only ever depended on interfaces, never on concrete infrastructure. **Hexagonal architecture** (also called **Ports and Adapters**), coined by Alistair Cockburn in 2005, is the name for that discipline applied to the whole system at once: the business logic sits at the center, knowing nothing about databases, web frameworks, or external APIs, and everything infrastructure-related plugs in from the outside through interfaces the business logic itself defines.

## Naming what you already built

```text
                     ┌─────────────────────────────┐
   DRIVING SIDE       │                             │      DRIVEN SIDE
   (things that       │      THE DOMAIN CORE        │      (things the domain
    call in)          │                             │       core calls out to)
                      │   Order, OrderService,       │
  OrderController ───▶│   PaymentStrategy,           │───▶ OrderRepository
  (a "primary" /       │   OrderState, OrderObserver  │      (a "secondary" /
   "driving" adapter)  │                             │       "driven" port)
                      └─────────────────────────────┘
```

`OrderRepository` (Level 2), `PaymentStrategy` (Level 4), and `OrderObserver` (Level 6) are all **ports** — interfaces *defined by* the domain core, describing what it needs from the outside world, without saying how those needs get fulfilled. `InMemoryOrderRepository`, `CreditCardPayment`, and any lambda passed to `addObserver` are **adapters** — concrete implementations that plug into a port from the outside.

## The rule the whole series has already been following

```java
public class Main {
    // THE DOMAIN CORE — no import of any framework, no "new SomeDatabase()", no HTTP.
    interface OrderRepository {  // a PORT, defined BY the domain, FOR the domain's own use
        void save(Order order);
    }

    static class Order {
        String customerEmail;
        double total;
        Order(String customerEmail, double total) {
            this.customerEmail = customerEmail;
            this.total = total;
        }
    }

    static class OrderService {  // pure domain logic — the actual business rule
        private final OrderRepository repository;
        OrderService(OrderRepository repository) { this.repository = repository; }

        Order placeOrder(String customerEmail, double total) {
            if (total <= 0) throw new IllegalArgumentException("Order total must be positive");
            Order order = new Order(customerEmail, total);
            repository.save(order);
            return order;
        }
    }

    // AN ADAPTER — plugs into the OrderRepository port. Could be swapped for a real database
    // adapter with ZERO changes above this line.
    static class InMemoryOrderRepository implements OrderRepository {
        @Override
        public void save(Order order) {
            System.out.println("Adapter saved: " + order.customerEmail + ", $" + order.total);
        }
    }

    public static void main(String[] args) {
        OrderService service = new OrderService(new InMemoryOrderRepository());
        service.placeOrder("alice@example.com", 79.99);
    }
}
```

```text
Adapter saved: alice@example.com, $79.99
```

**Walkthrough:** Everything above the `InMemoryOrderRepository` class — `OrderRepository`, `Order`, `OrderService` — never imports or mentions any concrete storage mechanism. `InMemoryOrderRepository` is the only class in this file that would need to change if you swapped in a real database; every other class remains exactly as-is.

**CS lens:** This is the **Dependency Inversion Principle** you first named in Level 3, restated at the scale of an entire architecture rather than a single class: the domain core (high-level policy — "what makes a valid order?") does not depend on infrastructure (low-level detail — "how do bytes get written to disk?"). Both depend on the `OrderRepository` abstraction. Hexagonal architecture is what a whole codebase looks like when Dependency Inversion is applied consistently at every boundary, not just between one service and one repository.

## Driving adapters: multiple front doors, one unchanged core

```java
public class Main {
    // (OrderRepository, Order, OrderService, InMemoryOrderRepository as above)

    // DRIVING ADAPTER 1: pretends to be an HTTP controller.
    static class HttpOrderController {
        private final OrderService service;
        HttpOrderController(OrderService service) { this.service = service; }
        String handlePost(String customerEmail, double total) {
            Order order = service.placeOrder(customerEmail, total);
            return "{\"status\":\"confirmed\",\"total\":" + order.total + "}";
        }
    }

    // DRIVING ADAPTER 2: pretends to be a command-line interface.
    static class CliOrderCommand {
        private final OrderService service;
        CliOrderCommand(OrderService service) { this.service = service; }
        void run(String[] args) {
            Order order = service.placeOrder(args[0], Double.parseDouble(args[1]));
            System.out.println("CLI: order placed for " + order.customerEmail);
        }
    }

    public static void main(String[] args) {
        OrderService service = new OrderService(new InMemoryOrderRepository());

        // Two completely different "front doors" drive the SAME domain core.
        HttpOrderController httpAdapter = new HttpOrderController(service);
        System.out.println(httpAdapter.handlePost("bob@example.com", 24.50));

        CliOrderCommand cliAdapter = new CliOrderCommand(service);
        cliAdapter.run(new String[] { "carol@example.com", "10.00" });
    }
}
```

```text
Adapter saved: bob@example.com, $24.5
{"status":"confirmed","total":24.5}
Adapter saved: carol@example.com, $10.0
CLI: order placed for carol@example.com
```

**SE lens:** `OrderService` has no idea whether it was called from a simulated HTTP request or a simulated command line — both `HttpOrderController` and `CliOrderCommand` are **driving adapters** (they call *into* the core), while `InMemoryOrderRepository` is a **driven adapter** (the core calls *out to* it). The core's business rule — "an order total must be positive" — is enforced exactly once, regardless of how many different front doors exist. Without this separation, that validation logic would need to be duplicated in every controller, CLI command, and message-queue handler that could place an order — and duplicated validation drifts out of sync the moment one copy gets updated and the others don't.

## What breaks without the boundary

```java
public class Main {
    // A domain class that VIOLATES the hexagon by depending on infrastructure directly.
    static class OrderService {
        // Imagine this imported a real SQL driver, or an HTTP client library, right here.
        // Testing "does this reject a negative total?" now requires that real dependency
        // to be present and configured, even though the rule being tested has nothing
        // to do with SQL or HTTP at all.
        Object placeOrder(String customerEmail, double total) {
            if (total <= 0) throw new IllegalArgumentException("Order total must be positive");
            // ... imagine direct JDBC calls here instead of a Repository port ...
            return null;
        }
    }

    public static void main(String[] args) {
        System.out.println("A core coupled directly to infrastructure can't be tested without that infrastructure.");
    }
}
```

```text
A core coupled directly to infrastructure can't be tested without that infrastructure.
```

**What breaks:** If `OrderService` imported a real database driver directly instead of depending on the `OrderRepository` port, verifying "does `placeOrder` reject a non-positive total?" would require a real, running database connection just to exercise a rule that has nothing to do with persistence. Level 9 depends on this boundary existing: every test there substitutes a trivial fake for a port, and the domain core never notices the difference between a fake and the real thing, because it only ever depended on the interface.

## Recognition

```text
Today: Hexagonal architecture (Ports and Adapters) — domain core depends on
interfaces it defines; infrastructure plugs in from outside

Also recognized in: Clean Architecture (Robert Martin's concentric-circles
version of the same idea), Onion Architecture, any well-structured Spring
Boot app where @Service classes depend on repository interfaces rather than
JDBC directly, and test suites everywhere that swap a real database for an
in-memory fake specifically because the core never hardcoded which one it needs.
```

## Challenge: hexagonal_order_core

Build a domain core with one port and two adapters — one driving, one driven — with the core untouched by either.

Write:
- `interface OrderRepository` (a driven port) with `void save(String customerEmail, double total)`
- `class OrderService` (the domain core) with a constructor accepting an `OrderRepository`, and `String placeOrder(String customerEmail, double total)` that throws `IllegalArgumentException` if `total <= 0`, otherwise saves via the repository and returns `"CONFIRMED"`
- `class RecordingOrderRepository implements OrderRepository` (a driven adapter) that appends `customerEmail + ":" + total` to an internal `List<String>`, exposed via `List<String> getRecords()`
- `class CliAdapter` (a driving adapter) with a constructor accepting an `OrderService`, and `String handleCommand(String customerEmail, double total)` that calls `service.placeOrder` and returns its result — `CliAdapter` must contain no business rule of its own (no total validation)

```challenge
import java.util.ArrayList;
import java.util.List;

class OrderRepository {
    // TODO: make this an interface
}

class OrderService {
    // TODO
}

class RecordingOrderRepository {
    // TODO
}

class CliAdapter {
    // TODO
}
```

```test
RecordingOrderRepository repository = new RecordingOrderRepository();
OrderService service = new OrderService(repository);
CliAdapter cli = new CliAdapter(service);

String result = cli.handleCommand("alice@example.com", 79.99);
assert result.equals("CONFIRMED")
assert repository.getRecords().size() == 1
assert repository.getRecords().get(0).equals("alice@example.com:79.99")

boolean threw = false;
try {
    cli.handleCommand("bob@example.com", -5.0);
} catch (IllegalArgumentException e) {
    threw = true;
}
assert threw
assert repository.getRecords().size() == 1  // the invalid order was never saved

assert repository instanceof OrderRepository
```
