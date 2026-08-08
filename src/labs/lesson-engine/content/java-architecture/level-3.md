---
series: java-architecture
level: 3
title: Dependency Injection and Interfaces
lang: java
---

# Dependency Injection and Interfaces

Levels 1 and 2 quietly did something worth naming properly: `OrderService`'s constructor *received* an `OrderRepository` rather than creating one itself. This lesson separates two ideas that are easy to blur together — **Dependency Inversion** (a design principle: depend on abstractions, not concretions) and **Dependency Injection** (a technique: hand a class its dependencies from outside, instead of letting it construct them itself) — and shows why real frameworks like Spring exist mostly to automate the second one.

## The version that creates its own dependency

```java
public class Main {
    static class Order {
        String customerEmail;
        double total;
        Order(String customerEmail, double total) {
            this.customerEmail = customerEmail;
            this.total = total;
        }
    }

    interface OrderRepository {
        void save(Order order);
    }

    static class InMemoryOrderRepository implements OrderRepository {
        @Override
        public void save(Order order) {
            System.out.println("Saved order for " + order.customerEmail);
        }
    }

    // OrderService BUILDS its own dependency. This is the version to avoid.
    static class OrderService {
        private final OrderRepository repository = new InMemoryOrderRepository();

        void placeOrder(String customerEmail, double total) {
            repository.save(new Order(customerEmail, total));
        }
    }

    public static void main(String[] args) {
        OrderService service = new OrderService();
        service.placeOrder("alice@example.com", 79.99);
    }
}
```

```text
Saved order for alice@example.com
```

**The problem, stated concretely:** `OrderService` depends on the *interface* `OrderRepository` (good — that part is programming to an interface, from Level 2). But the field initializer `= new InMemoryOrderRepository()` hardcodes exactly *which* implementation it gets, at the exact place `OrderService` is defined. There is now no way to test `OrderService` with a fake repository, and no way to run it against a real database in production without editing `OrderService`'s own source code — the interface bought nothing, because the concrete choice is still baked in.

## Constructor injection: the standard fix

```java
public class Main {
    // (Order, OrderRepository, InMemoryOrderRepository as above)

    // OrderService now RECEIVES its dependency. It never writes "new InMemoryOrderRepository()".
    static class OrderService {
        private final OrderRepository repository;

        OrderService(OrderRepository repository) {
            this.repository = repository;
        }

        void placeOrder(String customerEmail, double total) {
            repository.save(new Order(customerEmail, total));
        }
    }

    // A second implementation, invented purely to prove OrderService doesn't care which it gets.
    static class LoggingOrderRepository implements OrderRepository {
        @Override
        public void save(Order order) {
            System.out.println("[AUDIT LOG] order saved: " + order.customerEmail + ", $" + order.total);
        }
    }

    public static void main(String[] args) {
        // The CALLER decides which implementation to use — not OrderService.
        OrderService serviceA = new OrderService(new InMemoryOrderRepository());
        serviceA.placeOrder("alice@example.com", 79.99);

        OrderService serviceB = new OrderService(new LoggingOrderRepository());
        serviceB.placeOrder("bob@example.com", 24.50);
    }
}
```

```text
Saved order for alice@example.com
[AUDIT LOG] order saved: bob@example.com, $24.5
```

**Walkthrough:** `OrderService`'s constructor takes an `OrderRepository` parameter and assigns it straight to the `final` field. `OrderService`'s own source code never mentions `InMemoryOrderRepository` or `LoggingOrderRepository` by name — those names only appear in `main`, at the moment an `OrderService` is actually constructed. This is **constructor injection**: the dependency is *injected* (handed in) through the constructor, rather than the class reaching out and constructing it.

**CS lens:** This is the mechanical difference between **Dependency Inversion** and **Dependency Injection**, which are two different things with confusingly similar names. Dependency Inversion (the "D" in SOLID) is the *principle*: high-level modules (`OrderService`) should not depend on low-level modules (`InMemoryOrderRepository`) — both should depend on an abstraction (`OrderRepository`). Dependency Injection is the *technique* that makes that principle achievable in practice: something outside the class supplies the concrete implementation, so the class's own source never has to name it. Level 2 gave you the abstraction; this lesson gives you the mechanism that actually delivers a concrete instance into it.

## The composition root

```java
public class Main {
    // (Order, OrderRepository, InMemoryOrderRepository, OrderService as above)

    static class OrderController {
        private final OrderService service;
        OrderController(OrderService service) { this.service = service; }
        String handlePlaceOrder(String customerEmail, double total) {
            service.placeOrder(customerEmail, total);
            return "Order confirmed for " + customerEmail;
        }
    }

    // main() is the COMPOSITION ROOT: the one place, exactly once,
    // where concrete classes are actually named and wired together.
    public static void main(String[] args) {
        OrderRepository repository = new InMemoryOrderRepository();  // concrete, named ONCE
        OrderService service = new OrderService(repository);
        OrderController controller = new OrderController(service);

        System.out.println(controller.handlePlaceOrder("alice@example.com", 79.99));
    }
}
```

```text
Saved order for alice@example.com
Order confirmed for alice@example.com
```

**SE lens:** Notice where every `new SomeConcreteClass()` call ended up: only in `main`. `OrderController`, `OrderService`, and the `OrderRepository` interface itself never construct a concrete class — they only ever receive one through a constructor. `main` is the **composition root** — the single, designated place where the object graph is actually assembled. Frameworks like Spring exist to automate exactly this one job: instead of you hand-writing `new OrderRepository()` and `new OrderService(repository)` in a `main` method, you annotate classes (`@Repository`, `@Service`, `@Autowired`) and a **DI container** builds the composition root for you at startup, scanning for which concrete class satisfies which interface. Everything you just wrote by hand is what `@Autowired` does automatically — you now know what it's actually doing underneath, because you just did its job yourself.

## What breaks without it

```java
public class Main {
    interface OrderRepository { void save(String customerEmail); }

    static class InMemoryOrderRepository implements OrderRepository {
        @Override public void save(String customerEmail) {
            System.out.println("Saved " + customerEmail);
        }
    }

    // A test double — used ONLY to prove a point about testability.
    static class FailingOrderRepository implements OrderRepository {
        @Override public void save(String customerEmail) {
            throw new RuntimeException("Database is down");
        }
    }

    static class OrderService {
        private final OrderRepository repository = new InMemoryOrderRepository();  // hardcoded again
        void placeOrder(String customerEmail) { repository.save(customerEmail); }
    }

    public static void main(String[] args) {
        // Without injection, there is NO WAY to test how OrderService
        // behaves when saving fails — it always uses InMemoryOrderRepository.
        OrderService service = new OrderService();
        try {
            service.placeOrder("alice@example.com");
            System.out.println("Cannot test the failure path: the repository is hardcoded.");
        } catch (RuntimeException e) {
            System.out.println("Would have caught: " + e.getMessage());
        }
    }
}
```

```text
Saved alice@example.com
Cannot test the failure path: the repository is hardcoded.
```

**What breaks:** With the dependency hardcoded, there is no way to substitute `FailingOrderRepository` to test how `OrderService` behaves when persistence fails — a genuinely important behavior to verify (does it retry? log? notify someone?) that is now permanently untestable without editing `OrderService`'s source. Level 9 (Testing the Architecture) depends directly on injection working correctly: every fake and stub used there is only substitutable because dependencies are injected, not self-constructed.

## Recognition

```text
Today: Constructor injection — a class receives its dependencies instead of building them

Also recognized in: Spring's @Autowired constructor injection, Android's Hilt/Dagger,
ASP.NET Core's built-in DI container, Angular's @Injectable services, and even
plain function parameters in any language — a function that takes a "database"
parameter instead of calling a global connect() inside itself is doing the exact
same thing, just without a word for it.
```

## Challenge: injected_order_service

Rebuild `OrderService` so it never constructs its own repository.

Write:
- `interface OrderRepository` with `void save(String customerEmail, double total)`
- `class InMemoryOrderRepository implements OrderRepository` that stores saves in an internal `List<String>` formatted as `customerEmail + ":" + total`, exposed via `List<String> getSaved()`
- `class OrderService` with a constructor accepting an `OrderRepository`, and `void placeOrder(String customerEmail, double total)` that delegates to the injected repository — `OrderService` must never call `new` on any repository implementation itself

```challenge
import java.util.ArrayList;
import java.util.List;

interface OrderRepository {
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
OrderService service = new OrderService(repository);

service.placeOrder("alice@example.com", 79.99);
service.placeOrder("bob@example.com", 24.50);

assert repository.getSaved().size() == 2
assert repository.getSaved().get(0).equals("alice@example.com:79.99")
assert repository.getSaved().get(1).equals("bob@example.com:24.5")

service.placeOrder("carol@example.com", 10.0);
assert repository.getSaved().size() == 3
assert repository.getSaved().get(2).equals("carol@example.com:10.0")
```
