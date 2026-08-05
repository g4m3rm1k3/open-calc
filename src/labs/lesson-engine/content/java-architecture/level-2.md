---
series: java-architecture
level: 2
title: The Repository Pattern
lang: java
---

# The Repository Pattern

Level 1 built `OrderRepository` as a concrete class wrapping a `List<Order>`. That was accidentally already most of the way to the real **Repository pattern** — documented in Martin Fowler's *Patterns of Enterprise Application Architecture* as: "mediates between the domain and data mapping layers, acting like an in-memory collection of domain objects." This lesson makes the pattern explicit by naming its actual shape: an **interface** the rest of the system depends on, with the storage mechanism swappable behind it.

## The problem an in-memory list can't hide forever

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Order {
        String customerEmail;
        double total;
        Order(String customerEmail, double total) {
            this.customerEmail = customerEmail;
            this.total = total;
        }
    }

    static class OrderRepository {
        private final List<Order> savedOrders = new ArrayList<>();
        void save(Order order) { savedOrders.add(order); }
        int count() { return savedOrders.size(); }
    }

    static class OrderService {
        private final OrderRepository repository;  // concrete class, not an interface
        OrderService(OrderRepository repository) { this.repository = repository; }
        void placeOrder(String customerEmail, double total) {
            repository.save(new Order(customerEmail, total));
        }
    }

    public static void main(String[] args) {
        OrderService service = new OrderService(new OrderRepository());
        service.placeOrder("alice@example.com", 79.99);
        System.out.println("Order placed using an in-memory list.");
    }
}
```

```text
Order placed using an in-memory list.
```

**The problem, stated concretely:** `OrderService`'s field is typed `OrderRepository` — a specific, concrete class whose entire implementation is "hold a `List`." The day this system needs a real database, or the day a test needs a fake repository with no real storage at all, every place that mentions the type `OrderRepository` has to change, because the type itself carries the assumption "storage is a `List`."

## Extracting the interface

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Order {
        String customerEmail;
        double total;
        Order(String customerEmail, double total) {
            this.customerEmail = customerEmail;
            this.total = total;
        }
    }

    // INTERFACE: the contract every storage mechanism must satisfy.
    // Notice it says nothing about HOW orders are stored.
    interface OrderRepository {
        void save(Order order);
        int count();
    }

    // ONE implementation: in-memory, for tests and this lesson.
    static class InMemoryOrderRepository implements OrderRepository {
        private final List<Order> savedOrders = new ArrayList<>();

        @Override
        public void save(Order order) {
            savedOrders.add(order);
            System.out.println("InMemoryOrderRepository: saved order for " + order.customerEmail);
        }

        @Override
        public int count() {
            return savedOrders.size();
        }
    }

    static class OrderService {
        private final OrderRepository repository;  // now an INTERFACE type
        OrderService(OrderRepository repository) { this.repository = repository; }
        void placeOrder(String customerEmail, double total) {
            repository.save(new Order(customerEmail, total));
        }
    }

    public static void main(String[] args) {
        OrderRepository repository = new InMemoryOrderRepository();
        OrderService service = new OrderService(repository);
        service.placeOrder("alice@example.com", 79.99);
        System.out.println("Orders stored: " + repository.count());
    }
}
```

```text
InMemoryOrderRepository: saved order for alice@example.com
Orders stored: 1
```

**Walkthrough:** `interface OrderRepository` declares two method signatures — `save` and `count` — with no bodies at all; it is a pure contract. `class InMemoryOrderRepository implements OrderRepository` promises the compiler it provides real bodies for both, and `@Override` tells the compiler "this method is intentionally fulfilling an interface method" — if you misspell `save` as `saev`, `@Override` turns that typo into a compile error instead of a silent new method that never gets called. `OrderService`'s field is now declared as the *interface* type `OrderRepository`, and its constructor accepts anything that implements it — `new OrderService(new InMemoryOrderRepository())` still works, but so would `new OrderService(new PostgresOrderRepository())` if that class existed, with zero changes to `OrderService` itself.

**CS lens:** This is **programming to an interface, not an implementation** — a principle far older than any specific language, dating to the Gang of Four's *Design Patterns* (1994). `OrderService` only knows about the *shape* of a repository (it can `save` and it can `count`), never the *mechanism*. This is what makes the type genuinely swappable: any class satisfying that shape can stand in, and `OrderService`'s source code never has to know or care which one it got.

## Swapping the mechanism, with zero changes to OrderService

```java
import java.util.HashMap;
import java.util.Map;

public class Main {
    // (Order, OrderRepository interface as above)

    // A SECOND implementation — indexed by email instead of a flat list.
    // OrderService will never notice the difference.
    static class IndexedOrderRepository implements OrderRepository {
        private final Map<String, Integer> orderCountsByEmail = new HashMap<>();
        private int total = 0;

        @Override
        public void save(Order order) {
            orderCountsByEmail.merge(order.customerEmail, 1, Integer::sum);
            total++;
            System.out.println("IndexedOrderRepository: saved order for " + order.customerEmail
                + " (this customer now has " + orderCountsByEmail.get(order.customerEmail) + " order(s))");
        }

        @Override
        public int count() {
            return total;
        }
    }

    static class OrderService {
        private final OrderRepository repository;
        OrderService(OrderRepository repository) { this.repository = repository; }
        void placeOrder(String customerEmail, double total) {
            repository.save(new Order(customerEmail, total));
        }
    }

    public static void main(String[] args) {
        // Only this one line changes to switch storage mechanisms entirely:
        OrderRepository repository = new IndexedOrderRepository();
        OrderService service = new OrderService(repository);

        service.placeOrder("alice@example.com", 79.99);
        service.placeOrder("alice@example.com", 24.50);
        System.out.println("Total orders: " + repository.count());
    }
}
```

```text
IndexedOrderRepository: saved order for alice@example.com (this customer now has 1 order(s))
IndexedOrderRepository: saved order for alice@example.com (this customer now has 2 order(s))
Total orders: 2
```

**SE lens:** Every line of `OrderService` is byte-for-byte identical between the two examples above — only the object constructed for `repository` changed. This is the **open/closed principle** you first felt in Level 0 with payment methods, reappearing here in a different shape: `OrderService` is *closed* to modification (its source never changes) while the storage mechanism is *open* to extension (new implementations can be added freely). The Repository pattern is the specific, named application of that principle to persistence.

## Recognition

```text
Today: Repository — an interface standing between business logic and storage

Also recognized in: Spring Data's JpaRepository (every Spring Boot app), Android's
Room database DAOs, Entity Framework's DbSet<T> in .NET, Django's Model.objects
manager, and the "port" half of the hexagonal architecture this series reaches
in Level 8 — all of them are the same idea: hide storage behind an interface so
business logic never has to know or care what's on the other side of it.
```

## Challenge: swappable_order_repository

Define the Repository pattern for orders.

Write:
- `interface OrderRepository` with `void save(Order order)` and `int count()`
- `class InMemoryOrderRepository implements OrderRepository`, backed by an `ArrayList<Order>`
- `class OrderService` with a constructor taking an `OrderRepository` (the interface type, not a concrete class) and a method `void placeOrder(String customerEmail, double total)` that builds an `Order` and saves it via the repository

`Order` is given, with `String customerEmail` and `double total` fields set via a constructor taking both in that order.

```challenge
import java.util.ArrayList;
import java.util.List;

class Order {
    String customerEmail;
    double total;
    Order(String customerEmail, double total) {
        this.customerEmail = customerEmail;
        this.total = total;
    }
}

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
OrderRepository repository = new InMemoryOrderRepository();
OrderService service = new OrderService(repository);

service.placeOrder("alice@example.com", 79.99);
assert repository.count() == 1

service.placeOrder("bob@example.com", 24.50);
assert repository.count() == 2

service.placeOrder("carol@example.com", 10.0);
assert repository.count() == 3

assert repository instanceof OrderRepository
```
