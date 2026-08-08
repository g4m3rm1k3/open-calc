---
series: java-architecture
level: 9
title: Testing the Architecture
lang: java
---

# Testing the Architecture

Every lesson so far mentioned, in passing, that the pattern being taught made testing easier. This lesson collects on that promise directly: it uses the ports from Level 8 to write real, fast, no-database tests for `OrderService`, and names the vocabulary — **test double**, **fake**, **stub**, **spy** — that describes exactly what each substitute object is doing.

## The seam: where a test can substitute reality

```java
public class Main {
    interface OrderRepository {
        void save(String customerEmail, double total);
    }

    static class OrderService {
        private final OrderRepository repository;
        OrderService(OrderRepository repository) { this.repository = repository; }

        String placeOrder(String customerEmail, double total) {
            if (total <= 0) throw new IllegalArgumentException("Order total must be positive");
            repository.save(customerEmail, total);
            return "CONFIRMED";
        }
    }

    public static void main(String[] args) {
        System.out.println("The constructor parameter 'OrderRepository repository' IS the seam:");
        System.out.println("production code passes a real adapter; a test passes a fake one.");
    }
}
```

```text
The constructor parameter 'OrderRepository repository' IS the seam:
production code passes a real adapter; a test passes a fake one.
```

**CS lens:** A **seam** (a term from Michael Feathers' *Working Effectively with Legacy Code*) is any point in a program where you can substitute one behavior for another without editing the code at that point. `OrderService`'s constructor parameter is exactly that: because Level 3 made the repository an injected dependency rather than something `OrderService` builds itself, a test can hand it any `OrderRepository` implementation at all — including one that exists purely for the test.

## A fake: a real, working, simplified implementation

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    interface OrderRepository {
        void save(String customerEmail, double total);
    }

    static class OrderService {
        private final OrderRepository repository;
        OrderService(OrderRepository repository) { this.repository = repository; }
        String placeOrder(String customerEmail, double total) {
            if (total <= 0) throw new IllegalArgumentException("Order total must be positive");
            repository.save(customerEmail, total);
            return "CONFIRMED";
        }
    }

    // A FAKE: a real, working implementation — just not the production one.
    // An in-memory list genuinely stores things; it's just not a real database.
    static class FakeOrderRepository implements OrderRepository {
        List<String> saved = new ArrayList<>();
        @Override
        public void save(String customerEmail, double total) {
            saved.add(customerEmail + ":" + total);
        }
    }

    public static void main(String[] args) {
        FakeOrderRepository fake = new FakeOrderRepository();
        OrderService service = new OrderService(fake);

        String result = service.placeOrder("alice@example.com", 79.99);

        System.out.println("Result: " + result);
        System.out.println("Fake recorded: " + fake.saved);
        System.out.println("No real database was touched.");
    }
}
```

```text
Result: CONFIRMED
Fake recorded: [alice@example.com:79.99]
No real database was touched.
```

**Walkthrough:** `FakeOrderRepository` genuinely implements `save` — it really stores the data, in a real `List` — it just stores it in memory instead of a database. Because `OrderService` only knows about the `OrderRepository` interface, it runs its actual, real logic (the `total <= 0` check, calling `save`) against the fake exactly as it would against a real database adapter — nothing about `OrderService`'s own code path changes.

**SE lens:** This is a **fake**: a lightweight but genuinely working implementation, used because the real one (a database) is slow, requires setup, or has side effects a test shouldn't trigger. A fake is different from a **stub** (an object that returns pre-programmed answers to calls but doesn't really implement any logic) and a **spy** (an object that also records how it was called, so the test can make assertions about the calls themselves) — the next examples show both.

## A stub: canned answers, nothing more

```java
public class Main {
    interface PaymentGateway {
        boolean charge(double amount);
    }

    static class OrderService {
        private final PaymentGateway gateway;
        OrderService(PaymentGateway gateway) { this.gateway = gateway; }

        String placeOrder(double total) {
            boolean charged = gateway.charge(total);
            return charged ? "CONFIRMED" : "PAYMENT_DECLINED";
        }
    }

    // A STUB: no real logic, just a pre-programmed answer.
    static class DecliningPaymentGateway implements PaymentGateway {
        @Override
        public boolean charge(double amount) { return false; }  // always declines
    }

    public static void main(String[] args) {
        OrderService service = new OrderService(new DecliningPaymentGateway());
        String result = service.placeOrder(50.0);
        System.out.println("Result when payment is declined: " + result);
    }
}
```

```text
Result when payment is declined: PAYMENT_DECLINED
```

**CS lens:** `DecliningPaymentGateway` is a **stub**: it does not really process anything — it always returns `false`, regardless of input. This is precisely the point: to test "what does `OrderService` do when payment is declined?" you need a gateway that reliably declines, and a stub is the simplest possible way to force that specific scenario on demand, without needing a real payment processor willing to fail a transaction for you.

## A spy: records how it was called

```java
public class Main {
    interface NotificationSender {
        void send(String email, String message);
    }

    static class OrderService {
        private final NotificationSender sender;
        OrderService(NotificationSender sender) { this.sender = sender; }

        void confirmOrder(String email) {
            sender.send(email, "Your order is confirmed!");
        }
    }

    // A SPY: records every call, so the test can verify the interaction itself.
    static class SpyNotificationSender implements NotificationSender {
        int callCount = 0;
        String lastEmail;
        String lastMessage;

        @Override
        public void send(String email, String message) {
            callCount++;
            lastEmail = email;
            lastMessage = message;
        }
    }

    public static void main(String[] args) {
        SpyNotificationSender spy = new SpyNotificationSender();
        OrderService service = new OrderService(spy);

        service.confirmOrder("bob@example.com");

        System.out.println("Sender was called " + spy.callCount + " time(s)");
        System.out.println("Last email: " + spy.lastEmail);
        System.out.println("Last message: " + spy.lastMessage);
    }
}
```

```text
Sender was called 1 time(s)
Last email: bob@example.com
Last message: Your order is confirmed!
```

**SE lens:** A fake asks "does the system behave correctly?" A stub forces a specific scenario to happen. A spy asks a third, different question: "was this dependency actually called, and with what?" — a question a fake alone cannot answer, because a fake only tells you the *end result* was recorded, not whether the *call itself* happened the way you expected. Real test frameworks (Mockito, in real Java projects) generate all three kinds of double automatically from an interface; here, you just built each one by hand, which is what those frameworks are actually doing underneath their `@Mock` annotations.

## A contract test: the same test, run against every real adapter

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    interface OrderRepository {
        void save(String customerEmail, double total);
        int count();
    }

    static class InMemoryOrderRepository implements OrderRepository {
        private final List<String> saved = new ArrayList<>();
        @Override public void save(String customerEmail, double total) { saved.add(customerEmail); }
        @Override public int count() { return saved.size(); }
    }

    static class IndexedOrderRepository implements OrderRepository {
        private int total = 0;
        @Override public void save(String customerEmail, double total) { this.total++; }
        @Override public int count() { return total; }
    }

    // A CONTRACT TEST: one test, run against every implementation of the interface.
    // If a future adapter fails this, it has broken the interface's actual contract.
    static void verifyRepositoryContract(OrderRepository repository, String implementationName) {
        if (repository.count() != 0) throw new AssertionError(implementationName + ": should start empty");
        repository.save("alice@example.com", 10.0);
        if (repository.count() != 1) throw new AssertionError(implementationName + ": count should be 1 after one save");
        repository.save("bob@example.com", 20.0);
        if (repository.count() != 2) throw new AssertionError(implementationName + ": count should be 2 after two saves");
        System.out.println(implementationName + ": contract satisfied.");
    }

    public static void main(String[] args) {
        verifyRepositoryContract(new InMemoryOrderRepository(), "InMemoryOrderRepository");
        verifyRepositoryContract(new IndexedOrderRepository(), "IndexedOrderRepository");
    }
}
```

```text
InMemoryOrderRepository: contract satisfied.
IndexedOrderRepository: contract satisfied.
```

**SE lens:** This is the payoff of Level 2's programming-to-an-interface, restated one more time at the level of testing itself: because both repositories promise to satisfy the same `OrderRepository` shape, one shared test verifies that promise for either of them. Any *new* adapter — a real database adapter, say — can be checked against the exact same `verifyRepositoryContract` function before it's ever wired into production, which is exactly how you'd catch an adapter that technically compiles but silently violates what callers actually rely on (for instance, an adapter whose `count()` double-counts).

## Recognition

```text
Today: Test doubles — fake, stub, and spy — substituted through the seam DI created

Also recognized in: Mockito's Mock/Spy/Stub in real Java test suites, Jest's
jest.fn() in JavaScript, Python's unittest.mock, and any HTTP API's "sandbox"
or "test mode" credentials — which are really just a stubbed payment gateway
provided by the vendor, for exactly this reason.
```

## Challenge: order_service_test_doubles

Build the fake, the stub, and a small assertion helper for `OrderService`.

Given an `interface PaymentGateway` with `boolean charge(double amount)`, and an `OrderService` whose constructor takes a `PaymentGateway` and whose `String placeOrder(double total)` returns `"CONFIRMED"` when `gateway.charge(total)` is `true` and `"PAYMENT_DECLINED"` otherwise — both already provided in the challenge stub below — write:
- `class AcceptingPaymentGateway implements PaymentGateway` — a stub whose `charge` always returns `true`
- `class DecliningPaymentGateway implements PaymentGateway` — a stub whose `charge` always returns `false`
- `class SpyPaymentGateway implements PaymentGateway` — wraps another `PaymentGateway` passed to its constructor, delegates every `charge` call to it, and additionally records `callCount` (incremented on every call) and `lastAmount` (the most recent amount charged)

```challenge
interface PaymentGateway {
    boolean charge(double amount);
}

class OrderService {
    private final PaymentGateway gateway;
    OrderService(PaymentGateway gateway) { this.gateway = gateway; }
    String placeOrder(double total) {
        return gateway.charge(total) ? "CONFIRMED" : "PAYMENT_DECLINED";
    }
}

class AcceptingPaymentGateway implements PaymentGateway {
    // TODO
}

class DecliningPaymentGateway implements PaymentGateway {
    // TODO
}

class SpyPaymentGateway implements PaymentGateway {
    // TODO
}
```

```test
OrderService acceptingService = new OrderService(new AcceptingPaymentGateway());
assert acceptingService.placeOrder(50.0).equals("CONFIRMED")

OrderService decliningService = new OrderService(new DecliningPaymentGateway());
assert decliningService.placeOrder(50.0).equals("PAYMENT_DECLINED")

SpyPaymentGateway spy = new SpyPaymentGateway(new AcceptingPaymentGateway());
OrderService spiedService = new OrderService(spy);

assert spiedService.placeOrder(75.0).equals("CONFIRMED")
assert spy.callCount == 1
assert spy.lastAmount == 75.0

spiedService.placeOrder(20.0);
assert spy.callCount == 2
```
